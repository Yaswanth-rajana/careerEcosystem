import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { OnboardingService } from '@backend/services/onboardingService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const user = await UserService.getSession(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Please upload a resume file (PDF, DOC, or DOCX).' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await OnboardingService.processResumeUpload(user.id, buffer, file.name, file.type);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process resume upload' }, { status: 500 });
  }
}
