import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { ConversionService } from '@backend/services/tools/conversion-service';
import { ToolError } from '@backend/services/tools/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await UserService.getSession(token) : null;

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetFormat = (formData.get('targetFormat') as string) || 'pdf';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_FILE',
            message: 'No file was uploaded.',
          },
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await ConversionService.convertDocument({
      filename: file.name,
      buffer,
      clientMimeType: file.type,
      targetFormat,
      userId: user?.id || null,
      clientIp,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof ToolError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.userMessage,
          },
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONVERSION_FAILED',
          message: 'An unexpected error occurred while converting your document.',
        },
      },
      { status: 500 }
    );
  }
}
