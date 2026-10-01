import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { CourseService } from '@backend/services/courseService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await getAuthenticatedAdmin(Permission.COURSES_READ);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const status = searchParams.get('status') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || undefined;

    const data = await CourseService.listCourses({
      page,
      limit,
      q,
      category,
      level,
      status,
      sortBy,
      sortDir,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Failed to list courses' }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(Permission.COURSES_CREATE);
    const body = await request.json();

    const course = await CourseService.createCourse(body, admin);
    return NextResponse.json({ course }, { status: 201 });
  } catch (err: any) {
    const status = err.statusCode || (err.name === 'ZodError' ? 422 : 400);
    return NextResponse.json({ error: err.message || 'Failed to create course' }, { status });
  }
}
