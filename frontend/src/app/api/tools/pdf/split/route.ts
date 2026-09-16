import { NextResponse } from 'next/server';
import { PdfToolsService } from '@backend/services/tools/pdf-tools-service';
import { ToolError } from '@backend/services/tools/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pageRanges = (formData.get('pageRanges') as string) || '';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_FILE',
            message: 'Please select a PDF file to split.',
          },
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await PdfToolsService.splitPdf({
      buffer,
      filename: file.name,
      pageRanges,
    });

    const outputName = file.name.replace(/\.pdf$/i, '') + '-split.pdf';

    return new NextResponse(new Uint8Array(result.splitBuffer), {
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
          message: 'An unexpected error occurred while splitting your PDF.',
        },
      },
      { status: 500 }
    );
  }
}
