
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedRecruiter, RecruiterAuthError } from '@/lib/serverAuth';
import { db } from '@backend/db/client';
import { AuditService } from '@backend/services/auditService';
import { RecruiterRbacService } from '@backend/services/recruiter/recruiterRbacService';
import { StorageFactory } from '@backend/services/tools/storage-provider';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthenticatedRecruiter();

    // 1. Strict multi-tenant verification & RBAC role access checks:
    // Enforces active membership, company isolation, and role permissions (HM/Interviewer)
    const application = await RecruiterRbacService.assertApplicationAccess(auth, params.id);

    // 2. Resolve the original submitted resume record if attached
    const submittedResume = application.resumeId
      ? await db.resume.findUnique({ where: { id: application.resumeId } })
      : null;

    const resumeId = application.resumeId || submittedResume?.id;
    const resumeFilename = application.resumeFilename || submittedResume?.filename;
    const resumeFileType = application.resumeFileType || submittedResume?.fileType || 'application/pdf';

    // 3. Reject if no original resume was attached to this application
    if (!resumeId && !resumeFilename && !application.resumeUrl) {
      return NextResponse.json(
        { success: false, error: 'No resume submitted for this application' },
        { status: 404 }
      );
    }

    // 4. Security audit log for private candidate resume access
    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_RESUME_ACCESSED',
      resourceType: 'APPLICATION',
      resourceId: application.id,
      details: {
        candidateName: application.candidate.name,
        candidateEmail: application.candidate.email,
        jobTitle: application.job.title,
        companyId: auth.company.id,
        resumeFilename: resumeFilename || null,
      },
    });

    const storage = StorageFactory.getProvider();

    // 5. Try to serve the original submitted resume file from storage provider
    if (resumeId && resumeFilename) {
      const storageKey = `resumes/${resumeId}/${resumeFilename}`;
      if (await storage.exists(storageKey)) {
        const fileBuffer = await storage.download(storageKey);
        const safeName = resumeFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
        return new NextResponse(fileBuffer as any, {
          headers: {
            'Content-Type': resumeFileType,
            'Content-Disposition': `inline; filename="${safeName}"`,
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          },
        });
      }

      // Check alternate storage key if submittedResume filename differed from application snapshot
      if (submittedResume?.filename && submittedResume.filename !== resumeFilename) {
        const altStorageKey = `resumes/${submittedResume.id}/${submittedResume.filename}`;
        if (await storage.exists(altStorageKey)) {
          const fileBuffer = await storage.download(altStorageKey);
          const safeName = resumeFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
          return new NextResponse(fileBuffer as any, {
            headers: {
              'Content-Type': resumeFileType,
              'Content-Disposition': `inline; filename="${safeName}"`,
              'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            },
          });
        }
      }
    }

    // 6. If application.resumeUrl is a direct storage key (non-URL, non-API route)
    if (
      application.resumeUrl &&
      !application.resumeUrl.startsWith('http://') &&
      !application.resumeUrl.startsWith('https://') &&
      !application.resumeUrl.startsWith('/api/') &&
      (await storage.exists(application.resumeUrl))
    ) {
      const fileBuffer = await storage.download(application.resumeUrl);
      const safeName = (resumeFilename || 'resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
      return new NextResponse(fileBuffer as any, {
        headers: {
          'Content-Type': resumeFileType,
          'Content-Disposition': `inline; filename="${safeName}"`,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      });
    }

    // 7. If application.resumeUrl is an external URL, stream it server-side without leaking credentials or public storage URLs
    if (
      application.resumeUrl &&
      (application.resumeUrl.startsWith('http://') || application.resumeUrl.startsWith('https://'))
    ) {
      try {
        const remoteRes = await fetch(application.resumeUrl);
        if (remoteRes.ok) {
          const arrayBuffer = await remoteRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = remoteRes.headers.get('content-type') || resumeFileType || 'application/pdf';
          const safeName = (resumeFilename || 'resume.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
          return new NextResponse(buffer as any, {
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `inline; filename="${safeName}"`,
              'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            },
          });
        }
      } catch (fetchErr) {
        console.warn('[Resume Route] Failed to fetch external resume URL:', fetchErr);
      }
    }

    // 8. The original submitted resume file is unavailable. Do NOT serve profile resume or synthesized document.
    return NextResponse.json(
      { success: false, error: 'The submitted resume file is unavailable' },
      { status: 404 }
    );
  } catch (error: any) {
    if (error instanceof RecruiterAuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to access resume' },
      { status: 500 }
    );
  }
}
