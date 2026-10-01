import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { CourseService } from '@backend/services/courseService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await getAuthenticatedAdmin(Permission.COURSES_READ);
    const course = await CourseService.getCourseDetail(params.id);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Failed to fetch course details' }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.COURSES_UPDATE);
    const body = await request.json();

    const course = await CourseService.updateCourse(params.id, body, admin);
    return NextResponse.json({ course });
  } catch (err: any) {
    const status = err.statusCode || (err.name === 'ZodError' ? 422 : 400);
    return NextResponse.json({ error: err.message || 'Failed to update course' }, { status });
  }
}
