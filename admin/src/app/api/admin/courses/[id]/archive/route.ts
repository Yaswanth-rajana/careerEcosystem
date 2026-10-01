import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { CourseService } from '@backend/services/courseService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.COURSES_DELETE);
    const course = await CourseService.archiveCourse(params.id, admin);
    return NextResponse.json({ course });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message || 'Failed to archive course' }, { status });
  }
}
