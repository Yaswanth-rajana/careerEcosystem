import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { OnboardingService } from '@backend/services/onboardingService';
import { FileValidationService } from '@backend/services/tools/file-validation-service';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      console.warn('[Resume Upload] Rejected: unauthorized session (no cookie token)');
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const user = await UserService.getSession(token);
    if (!user) {
      console.warn('[Resume Upload] Rejected: unauthorized session (invalid token)');
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      console.warn('[Resume Upload] Rejected: missing resume file in request formData');
      return NextResponse.json({ error: 'Please upload a resume file (PDF, DOCX, or TXT).' }, { status: 400 });
    }

    console.log(`[Resume Upload] file received: name="${file.name}", size=${file.size} bytes, type="${file.type}"`);
    console.log('[Resume Upload] file validation started');

    if (file.size > MAX_FILE_SIZE) {
      console.warn(`[Resume Upload] Rejected: file size (${file.size} bytes) exceeds limit (${MAX_FILE_SIZE} bytes)`);
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const extension = FileValidationService.getExtension(file.name);

    if (extension === 'doc' || file.type === 'application/msword') {
      console.warn(`[Resume Upload] Rejected: legacy .doc file ("${file.name}")`);
      return NextResponse.json(
        { error: 'Legacy .doc format is not supported. Please upload a PDF, DOCX, or TXT file.' },
        { status: 400 }
      );
    }

    const allowedExtensions = ['pdf', 'docx', 'txt'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedExtensions.includes(extension) && !allowedMimeTypes.includes(file.type)) {
      console.warn(`[Resume Upload] Rejected: unsupported extension ".${extension}" or MIME "${file.type}"`);
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF, DOCX, and TXT files are allowed.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // MAGIC-BYTE SIGNATURE VALIDATION
    try {
      FileValidationService.validateFileSignature(buffer, extension);
      console.log('[Resume Upload] file signature validation passed');
    } catch (valErr: any) {
      console.warn(`[Resume Upload] Rejected: file signature mismatch for extension ".${extension}" - ${valErr.message}`);
      return NextResponse.json(
        { error: valErr.userMessage || valErr.message || 'The file contents do not match the expected file type.' },
        { status: 400 }
      );
    }

    console.log('[Resume Upload] onboarding processing started');
    const result = await OnboardingService.processResumeUpload(user.id, buffer, file.name, file.type);
    console.log(`[Resume Upload] completed: created resume record ${result.resumeId}`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Resume Upload] Processing error:', error.message || error);

    const isClientError =
      error.statusCode === 400 ||
      error.message?.includes('Please upload') ||
      error.message?.includes('No readable text') ||
      error.message?.includes('Unable to read') ||
      error.message?.includes('supported') ||
      error.message?.includes('password') ||
      error.message?.includes('corrupted');

    const status = isClientError ? 400 : 500;
    const clientMessage = isClientError
      ? error.message
      : 'Failed to process resume upload. Please verify the file and try again.';

    return NextResponse.json({ error: clientMessage }, { status });
  }
}
