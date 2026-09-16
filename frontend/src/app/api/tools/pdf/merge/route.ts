import { NextResponse } from 'next/server';
import { PdfToolsService } from '@backend/services/tools/pdf-tools-service';
import { ToolError } from '@backend/services/tools/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'At least 2 PDF files are required for merging.',
          },
        },
        { status: 400 }
      );
    }

    const pdfItems: Array<{ filename: string; buffer: Buffer }> = [];
    for (const f of files) {
      const arrayBuffer = await f.arrayBuffer();
      pdfItems.push({
        filename: f.name,
        buffer: Buffer.from(arrayBuffer),
      });
    }

    const result = await PdfToolsService.mergePdfs({ files: pdfItems });

    return new NextResponse(new Uint8Array(result.mergedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': result.sizeBytes.toString(),
        'Content-Disposition': 'attachment; filename="merged-document.pdf"',
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
          message: 'An unexpected error occurred while merging your PDF files.',
        },
      },
      { status: 500 }
    );
  }
}
