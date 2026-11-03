import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { db } from '@backend/db/client';
import { StorageFactory } from '@backend/services/tools/storage-provider';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify candidate ownership of the application (strict IDOR check)
    const application = await db.jobApplication.findFirst({
      where: {
        id: params.id,
        candidateId: user.id,
      },
      include: {
        resume: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const submittedResume = application.resume || (application.resumeId ? await db.resume.findUnique({ where: { id: application.resumeId } }) : null);

    if (!submittedResume && !application.resumeFilename) {
      return NextResponse.json({ error: 'No resume attached to this application' }, { status: 404 });
    }

    const storage = StorageFactory.getProvider();

    if (submittedResume) {
      const storageKey = `resumes/${submittedResume.id}/${submittedResume.filename}`;
      if (await storage.exists(storageKey)) {
        const fileBuffer = await storage.download(storageKey);
        const filename = application.resumeFilename || submittedResume.filename;
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const contentType = application.resumeFileType || submittedResume.fileType || 'application/pdf';

        return new NextResponse(fileBuffer as any, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${safeName}"`,
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          },
        });
      }
    }

    return NextResponse.json({ error: 'Resume file unavailable' }, { status: 404 });
  } catch (error: any) {
    console.error('Candidate application resume stream error:', error);
    return NextResponse.json({ error: 'Failed to access resume' }, { status: 500 });
  }
}
