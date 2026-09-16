import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@backend/services/userService';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';
import { ConversionService } from '@backend/services/tools/conversion-service';
import { ToolError } from '@backend/services/tools/errors';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await UserService.getSession(token) : null;

    const url = new URL(request.url);
    const guestToken = url.searchParams.get('guestToken');

    const downloadData = await ConversionService.getDownloadStream(
      params.id,
      user?.id || null,
      guestToken
    );

    const safeFilename = downloadData.filename.replace(/"/g, '');

    return new NextResponse(new Uint8Array(downloadData.buffer), {
      status: 200,
      headers: {
        'Content-Type': downloadData.mimeType,
        'Content-Length': downloadData.sizeBytes.toString(),
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
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
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Could not access converted document download.',
        },
      },
      { status: 403 }
    );
  }
}
