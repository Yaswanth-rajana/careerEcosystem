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

    const statusData = await ConversionService.getJobStatus(
      params.id,
      user?.id || null,
      guestToken
    );

    return NextResponse.json({
      success: true,
      data: statusData,
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
          code: 'JOB_NOT_FOUND',
          message: 'Could not retrieve conversion status.',
        },
      },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await UserService.getSession(token) : null;

    const url = new URL(request.url);
    const guestToken = url.searchParams.get('guestToken');

    await ConversionService.cancelJob(params.id, user?.id || null, guestToken);

    return NextResponse.json({
      success: true,
      message: 'Conversion job deleted.',
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
          message: 'Unable to cancel conversion job.',
        },
      },
      { status: 403 }
    );
  }
}
