import { NextResponse } from 'next/server';
import { PdfToolsService } from '@backend/services/tools/pdf-tools-service';
import { ToolError } from '@backend/services/tools/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rotationStr = (formData.get('rotationDegrees') as string) || '90';
    const pagesStr = (formData.get('pages') as string) || 'all';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_FILE',
            message: 'Please select a PDF file to rotate.',
          },
        },
        { status: 400 }
      );
    }

    const degreesVal = parseInt(rotationStr, 10);
    if (![90, 180, 270].includes(degreesVal)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Rotation degree must be 90, 180, or 270.',
          },
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let targetPages: 'all' | number[] = 'all';
    if (pagesStr !== 'all' && pagesStr.trim()) {
      targetPages = pagesStr
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !isNaN(p) && p > 0);
    }

    const result = await PdfToolsService.rotatePdf({
      buffer,
      filename: file.name,
      rotationDegrees: degreesVal as 90 | 180 | 270,
      targetPages,
    });

    const outputName = file.name.replace(/\.pdf$/i, '') + '-rotated.pdf';

    return new NextResponse(new Uint8Array(result.rotatedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': result.sizeBytes.toString(),
        'Content-Disposition': `attachment; filename="${outputName}"`,
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
          code: 'CONVERSION_FAILED',
          message: 'An unexpected error occurred while rotating your PDF.',
        },
      },
      { status: 500 }
    );
  }
}
