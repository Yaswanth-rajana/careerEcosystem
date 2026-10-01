import { NextResponse } from 'next/server';
import { getAuthenticatedMentor } from '@/lib/serverAuth';
import { MentorStudentService } from '@backend/services/mentorship/mentorStudentService';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authMentor = await getAuthenticatedMentor(true);
    const student = await MentorStudentService.getStudentDetail(params.id, authMentor.mentor.id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve student details' },
      { status: err.statusCode || 403 }
    );
  }
}
