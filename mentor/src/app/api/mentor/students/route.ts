import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { MentorStudentService } from '@backend/services/mentorship/mentorStudentService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    const result = await MentorStudentService.listStudents({
      mentorId: authMentor.mentor.id,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list students' },
      { status: err.statusCode || 500 }
    );
  }
}
