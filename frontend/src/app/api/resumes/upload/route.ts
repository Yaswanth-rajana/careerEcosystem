import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { db } from '@backend/db/client';
import { StorageFactory } from '@backend/services/tools/storage-provider';
import { FileValidationService } from '@backend/services/tools/file-validation-service';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized session' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = (formData.get('file') || formData.get('resume')) as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Please select a resume file to upload (PDF, DOCX, or TXT).' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds the 10MB limit. Please upload a smaller file.' },
        { status: 400 }
      );
    }

    const extension = FileValidationService.getExtension(file.name);

    if (extension === 'doc' || file.type === 'application/msword') {
      return NextResponse.json(
        { success: false, error: 'Legacy .doc format is not supported. Please upload a PDF, DOCX, or TXT file.' },
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
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Only PDF, DOCX, and TXT files are supported.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Enforce magic-byte signature validation against spoofed file extensions
    try {
      FileValidationService.validateFileSignature(buffer, extension);
    } catch (valErr: any) {
      return NextResponse.json(
        { success: false, error: valErr.userMessage || valErr.message || 'File contents do not match the expected format.' },
        { status: 400 }
      );
    }

    // Ensure candidate profile exists
    let profile = await db.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await db.profile.create({
        data: {
          userId: user.id,
          candidateType: 'STUDENT',
        },
      });
    }

    const cleanFilename = FileValidationService.sanitizeFilename(file.name);
    const mimeType = file.type || (extension === 'pdf' ? 'application/pdf' : extension === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain');

    // Create DB Resume record
    const resume = await db.resume.create({
      data: {
        profileId: profile.id,
        filename: cleanFilename,
        fileType: mimeType,
        fileSize: buffer.length,
        status: 'READY',
      },
    });

    // Save to server storage provider
    try {
      const storage = StorageFactory.getProvider();
      const storageKey = `resumes/${resume.id}/${cleanFilename}`;
      await storage.upload(storageKey, buffer, mimeType);
    } catch (storageErr: any) {
      // Clean up failed db record
      await db.resume.delete({ where: { id: resume.id } }).catch(() => {});
      console.error('[Resume Upload] Storage save failed:', storageErr);
      return NextResponse.json(
        { success: false, error: 'Failed to securely store the resume file. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        filename: resume.filename,
        fileSize: resume.fileSize,
        fileType: resume.fileType,
        createdAt: resume.createdAt.toISOString(),
        isLatest: true,
        applicationsCount: 0,
        lastUsedAt: null,
        lastUsedJobTitle: null,
        lastUsedCompany: null,
      },
    });
  } catch (error: any) {
    console.error('[Resume Upload API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred while uploading your resume.' },
      { status: 500 }
    );
  }
}
