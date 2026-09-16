import { NextResponse } from 'next/server';
import { PdfToolsService } from '@backend/services/tools/pdf-tools-service';
import { ToolError } from '@backend/services/tools/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const level = (formData.get('level') as 'basic' | 'balanced' | 'strong') || 'balanced';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_FILE',
            message: 'Please select a PDF file to compress.',
          },
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await PdfToolsService.compressPdf({
      buffer,
      filename: file.name,
      level,
    });

    const outputName = file.name.replace(/\.pdf$/i, '') + '-optimized.pdf';

    return new NextResponse(new Uint8Array(result.compressedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': result.compressedSizeBytes.toString(),
        'Content-Disposition': `attachment; filename="${outputName}"`,
        'X-Original-Size': result.originalSizeBytes.toString(),
        'X-Compressed-Size': result.compressedSizeBytes.toString(),
        'X-Saved-Percentage': result.savedPercentage.toString(),
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
          message: 'An unexpected error occurred while compressing your PDF.',
        },
      },
      { status: 500 }
    );
  }
}
