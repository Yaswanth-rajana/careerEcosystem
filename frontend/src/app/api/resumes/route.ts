import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { db } from '@backend/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await db.resume.findMany({
      where: {
        profile: {
          userId: user.id,
        },
        status: {
          in: ['READY', 'UPLOADED'],
        },
      },
      select: {
        id: true,
        filename: true,
        fileSize: true,
        fileType: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        jobApplications: {
          select: {
            id: true,
            createdAt: true,
            job: {
              select: {
                title: true,
                company: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            jobApplications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const formattedResumes = resumes.map((resume, idx) => {
      const latestApp = resume.jobApplications?.[0];
      return {
        id: resume.id,
        filename: resume.filename,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
        isLatest: idx === 0,
        applicationsCount: resume._count?.jobApplications || 0,
        lastUsedAt: latestApp ? latestApp.createdAt.toISOString() : null,
        lastUsedJobTitle: latestApp?.job?.title || null,
        lastUsedCompany: latestApp?.job?.company || null,
      };
    });

    return NextResponse.json({
      success: true,
      resumes: formattedResumes,
    });
  } catch (error: any) {
    console.error('Failed to list resumes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve saved resumes' },
      { status: 500 }
    );
  }
}
