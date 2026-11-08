import zlib from 'zlib';
import { TextNormalizer } from './textNormalizer';
import { OcrService } from './ocrService';

export interface PdfExtractionResult {
  text: string;
  method: 'PDF_PARSE_LAYOUT' | 'PDF_PARSE_SIMPLE' | 'PDF_NATIVE_STREAM' | 'PDF_PRINTABLE_CHUNK' | 'PDF_HEURISTIC';
  isMultiColumn: boolean;
  pageCount?: number;
}

export class PdfExtractor {
  /**
   * Main entry point to extract text from a PDF buffer using layout-aware parsing
   * with multi-tier fallback resilience.
   */
  static async extract(buffer: Buffer): Promise<PdfExtractionResult> {
    let pdfParsePasswordError = false;
    let pdfParseError: any = null;

    // Tier 1 & 2: PDFParse with layout awareness
    try {
      let pdfModule: any;
      try {
        pdfModule = (await import('pdf-parse')).default || (await import('pdf-parse'));
      } catch {
        pdfModule = eval('require')('pdf-parse');
      }

      const PDFParseClass = pdfModule?.PDFParse || pdfModule?.default?.PDFParse;

      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: buffer });
        try {
          await parser.load();
          const numPages = parser.doc?.numPages || 1;
          const pageTexts: string[] = [];
          let detectedMultiColumn = false;

          for (let p = 1; p <= numPages; p++) {
            const page = await parser.doc.getPage(p);
            const textContent = await page.getTextContent();
            if (textContent?.items && textContent.items.length > 0) {
              const { text, isMultiColumn } = this.extractPageLayoutText(textContent.items);
              if (isMultiColumn) detectedMultiColumn = true;
              if (text.trim()) pageTexts.push(text);
            }
          }

          const combinedText = pageTexts.join('\n\n');
          if (combinedText.trim().length >= 20) {
            await parser.destroy().catch(() => {});
            return {
              text: TextNormalizer.normalize(combinedText),
              method: 'PDF_PARSE_LAYOUT',
              isMultiColumn: detectedMultiColumn,
              pageCount: numPages,
            };
          }

          // If layout extraction yielded very little, try standard parser.getText()
          const simpleResult = await parser.getText();
          const simpleText = simpleResult?.text || '';
          if (simpleText.trim().length >= 20) {
            await parser.destroy().catch(() => {});
            return {
              text: TextNormalizer.normalize(this.stripPageMarkers(simpleText)),
              method: 'PDF_PARSE_SIMPLE',
              isMultiColumn: false,
              pageCount: numPages,
            };
          }
        } finally {
          await parser.destroy().catch(() => {});
        }
      }
    } catch (err: any) {
      pdfParseError = err;
      if (err?.message && err.message.toLowerCase().includes('password')) {
        pdfParsePasswordError = true;
      }
      console.warn('[PdfExtractor] pdf-parse library failed, falling back to native stream extractor:', err?.message || err);
    }

    // Tier 3: Zero-dependency native PDF stream decompressor with ToUnicode CMap & WinAnsi mapping
    try {
      const streamText = this.extractTextFromPdfStreams(buffer);
      if (streamText && streamText.trim().length >= 15) {
        return {
          text: TextNormalizer.normalize(streamText),
          method: 'PDF_NATIVE_STREAM',
          isMultiColumn: false,
        };
      }
    } catch (streamErr: any) {
      console.warn('[PdfExtractor] Native PDF stream extraction failed:', streamErr?.message || streamErr);
    }

    // Fail early on corrupted PDF structures before dumping binary byte fragments
    if (pdfParsePasswordError) {
      throw new Error('Password-protected PDFs are not supported. Please upload an unlocked PDF.');
    }

    if (
      pdfParseError &&
      buffer.length > 0 &&
      buffer.subarray(0, 5).toString('ascii').startsWith('%PDF') &&
      !/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(buffer.toString('latin1'))
    ) {
      throw new Error('Unable to read this PDF. Please upload a text-based PDF or another supported resume format.');
    }

    // Check if the document is scanned / image-only before dumping raw binary printable chunks
    if (OcrService.isScannedPdf(buffer, 0)) {
      return {
        text: '',
        method: 'PDF_HEURISTIC',
        isMultiColumn: false,
      };
    }

    // Tier 4: Printable chunk scanner (filtered against PDF syntax keywords)
    try {
      const printableText = this.extractPrintableChunks(buffer);
      if (printableText && printableText.trim().length >= 20) {
        return {
          text: TextNormalizer.normalize(printableText),
          method: 'PDF_PRINTABLE_CHUNK',
          isMultiColumn: false,
        };
      }
    } catch (chunkErr: any) {
      console.warn('[PdfExtractor] Printable chunk extraction failed:', chunkErr?.message || chunkErr);
    }

    // Tier 5: Document heuristics scanner
    try {
      const heuristicText = this.extractTextHeuristics(buffer);
      if (heuristicText && heuristicText.trim().length >= 15) {
        return {
          text: TextNormalizer.normalize(heuristicText),
          method: 'PDF_HEURISTIC',
          isMultiColumn: false,
        };
      }
    } catch (heurErr: any) {
      console.warn('[PdfExtractor] Heuristic extraction failed:', heurErr?.message || heurErr);
    }

    if (pdfParsePasswordError) {
      throw new Error('Password-protected PDFs are not supported. Please upload an unlocked PDF.');
    }

    if (pdfParseError && buffer.length > 0 && buffer.subarray(0, 5).toString('ascii').startsWith('%PDF')) {
      throw new Error('Unable to read this PDF. Please upload a text-based PDF or another supported resume format.');
    }

    // Return empty extraction if all tiers fail (OcrService and QualityChecker will handle)
    return {
      text: '',
      method: 'PDF_HEURISTIC',
      isMultiColumn: false,
    };
  }

  /**
   * Layout-aware page text extraction.
   * Detects multi-column regions (left/right sidebar layouts) and orders text logically
   * (Header -> Column 1 -> Column 2 -> Footer) instead of interleaving lines horizontally.
   */
  private static extractPageLayoutText(items: any[]): { text: string; isMultiColumn: boolean } {
    const cleanItems = items
      .filter((it) => it && typeof it.str === 'string' && it.str.trim().length > 0)
      .map((it) => {
        const tx = it.transform || [1, 0, 0, 1, 0, 0];
        return {
          str: it.str,
          x: tx[4],
          y: tx[5],
          w: it.width || 0,
          h: it.height || Math.abs(tx[0]) || 10,
        };
      });

    if (cleanItems.length === 0) {
      return { text: '', isMultiColumn: false };
    }

    const xs = cleanItems.map((it) => it.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...cleanItems.map((it) => it.x + it.w));
    const contentWidth = maxX - minX;

    let isMultiColumn = false;
    let splitX = minX + contentWidth * 0.45;

    // Detect two-column layout if content width > 250pt and clear vertical gutter exists
    if (contentWidth > 250 && cleanItems.length >= 8) {
      const candidates: Array<{ candidateX: number; crossingCount: number; leftRatio: number }> = [];

      for (let pct = 0.3; pct <= 0.7; pct += 0.05) {
        const candidateX = minX + contentWidth * pct;
        const gutterLeft = candidateX - 12;
        const gutterRight = candidateX + 12;

        const leftCount = cleanItems.filter((it) => it.x + it.w <= gutterRight).length;
        const rightCount = cleanItems.filter((it) => it.x >= gutterLeft).length;
        const crossingCount = cleanItems.filter((it) => it.x < gutterLeft && it.x + it.w > gutterRight).length;

        if (leftCount >= 3 && rightCount >= 3 && crossingCount <= 4) {
          candidates.push({ candidateX, crossingCount, leftRatio: leftCount / cleanItems.length });
        }
      }

      if (candidates.length > 0) {
        candidates.sort(
          (a, b) => a.crossingCount - b.crossingCount || Math.abs(a.leftRatio - 0.4) - Math.abs(b.leftRatio - 0.4)
        );
        splitX = candidates[0].candidateX;
        isMultiColumn = true;
      }
    }

    const renderItemGroup = (group: typeof cleanItems): string => {
      const lines: Array<{ y: number; items: typeof cleanItems }> = [];
      const sorted = [...group].sort((a, b) => b.y - a.y || a.x - b.x);

      for (const item of sorted) {
        let placed = false;
        for (const line of lines) {
          if (Math.abs(line.y - item.y) <= 3.5) {
            line.items.push(item);
            line.y = (line.y * line.items.length + item.y) / (line.items.length + 1);
            placed = true;
            break;
          }
        }
        if (!placed) {
          lines.push({ y: item.y, items: [item] });
        }
      }

      lines.sort((a, b) => b.y - a.y);
      const lineStrings = lines.map((line) => {
        line.items.sort((a, b) => a.x - b.x);
        let lineText = '';
        let prevEnd = -1;
        for (const it of line.items) {
          if (prevEnd !== -1 && it.x > prevEnd + 2) {
            lineText += ' ';
          }
          lineText += it.str.trim();
          prevEnd = it.x + it.w;
        }
        return lineText.trim();
      });

      return lineStrings.filter((l) => l.length > 0).join('\n');
    };

    if (!isMultiColumn) {
      return { text: renderItemGroup(cleanItems), isMultiColumn: false };
    }

    // Segment page into Header, Column 1, Column 2, Footer
    const colLeftItems = cleanItems.filter((it) => it.x + it.w <= splitX + 15);
    const colRightItems = cleanItems.filter((it) => it.x >= splitX - 15);
    const spanningItems = cleanItems.filter((it) => it.x < splitX - 15 && it.x + it.w > splitX + 15);

    const colTopY = Math.max(
      ...colLeftItems.map((it) => it.y),
      ...colRightItems.map((it) => it.y)
    );
    const colBottomY = Math.min(
      ...colLeftItems.map((it) => it.y),
      ...colRightItems.map((it) => it.y)
    );

    const headerItems = spanningItems.filter((it) => it.y > colTopY - 10);
    const footerItems = spanningItems.filter((it) => it.y < colBottomY + 10);
    const middleSpanning = spanningItems.filter((it) => it.y <= colTopY - 10 && it.y >= colBottomY + 10);

    const blocks: string[] = [];
    if (headerItems.length > 0) blocks.push(renderItemGroup(headerItems));
    if (colLeftItems.length > 0) blocks.push(renderItemGroup(colLeftItems));
    if (colRightItems.length > 0) blocks.push(renderItemGroup(colRightItems));
    if (middleSpanning.length > 0) blocks.push(renderItemGroup(middleSpanning));
    if (footerItems.length > 0) blocks.push(renderItemGroup(footerItems));

    return { text: blocks.join('\n\n'), isMultiColumn: true };
  }

  /**
   * Native zero-dependency PDF stream decompressor with CMap and WinAnsi decoding.
   */
  private static extractTextFromPdfStreams(buffer: Buffer): string {
    let extractedText = '';
    const cmap = new Map<string, string>();
    const decompressedStreams: string[] = [];

    let searchPos = 0;
    const streamKeyword = Buffer.from('stream');
    const endstreamKeyword = Buffer.from('endstream');

    while (searchPos < buffer.length) {
      const streamStart = buffer.indexOf(streamKeyword, searchPos);
      if (streamStart === -1) break;

      let dataStart = streamStart + 6;
      if (buffer[dataStart] === 13 && buffer[dataStart + 1] === 10) {
        dataStart += 2;
      } else if (buffer[dataStart] === 10 || buffer[dataStart] === 13) {
        dataStart += 1;
      }

      const streamEnd = buffer.indexOf(endstreamKeyword, dataStart);
      if (streamEnd === -1) break;

      let dataEnd = streamEnd;
      if (dataEnd > dataStart && (buffer[dataEnd - 1] === 10 || buffer[dataEnd - 1] === 13)) {
        dataEnd -= 1;
        if (dataEnd > dataStart && (buffer[dataEnd - 1] === 10 || buffer[dataEnd - 1] === 13)) {
          dataEnd -= 1;
        }
      }

      const rawStream = buffer.subarray(dataStart, dataEnd);
      searchPos = streamEnd + 9;

      const decompressed = this.decompressPdfStream(rawStream);
      const streamStr = decompressed.toString('latin1');
      decompressedStreams.push(streamStr);

      if (streamStr.includes('beginbfchar') || streamStr.includes('beginbfrange')) {
        this.parseCMap(streamStr, cmap);
      }
    }

    for (const streamStr of decompressedStreams) {
      const btRegex = /BT([\s\S]*?)ET/g;
      let btMatch: RegExpExecArray | null;
      let foundBt = false;

      while ((btMatch = btRegex.exec(streamStr)) !== null) {
        foundBt = true;
        extractedText += this.parseStreamTextContent(btMatch[1], cmap) + '\n';
      }

      if (!foundBt) {
        extractedText += this.parseStreamTextContent(streamStr, cmap) + ' ';
      }
    }

    return extractedText.trim();
  }

  /**
   * Resilient stream decompressor handling raw, trimmed, and offset zlib streams.
   */
  private static decompressPdfStream(raw: Buffer): Buffer {
    try { return zlib.inflateSync(raw); } catch {}
    try { return zlib.unzipSync(raw); } catch {}
    try { return zlib.inflateRawSync(raw); } catch {}

    let start = 0;
    while (start < raw.length && (raw[start] <= 0x20 || raw[start] === 0x0a || raw[start] === 0x0d)) {
      start++;
    }
    let end = raw.length;
    while (end > start && (raw[end - 1] <= 0x20 || raw[end - 1] === 0x0a || raw[end - 1] === 0x0d)) {
      end--;
    }
    if (start < end) {
      const trimmed = raw.subarray(start, end);
      try { return zlib.inflateSync(trimmed); } catch {}
      try { return zlib.unzipSync(trimmed); } catch {}
      try { return zlib.inflateRawSync(trimmed); } catch {}
    }

    for (let i = start; i < Math.min(raw.length - 2, start + 64); i++) {
      if (
        raw[i] === 0x78 &&
        (raw[i + 1] === 0x9c ||
          raw[i + 1] === 0x01 ||
          raw[i + 1] === 0xda ||
          raw[i + 1] === 0x5e ||
          raw[i + 1] === 0x20 ||
          raw[i + 1] === 0x7e)
      ) {
        try { return zlib.inflateSync(raw.subarray(i, end)); } catch {}
        try { return zlib.inflateRawSync(raw.subarray(i, end)); } catch {}
      }
    }

    return raw;
  }

  /**
   * Parses ToUnicode CMap blocks (beginbfchar / beginbfrange) from a PDF stream into character mappings.
   */
  private static parseCMap(streamStr: string, cmap: Map<string, string>): void {
    const bfcharRegex = /beginbfchar([\s\S]*?)endbfchar/g;
    let match: RegExpExecArray | null;
    while ((match = bfcharRegex.exec(streamStr)) !== null) {
      const lines = match[1].trim().split(/\r?\n/);
      for (const line of lines) {
        const parts = line.trim().match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
        if (parts) {
          const src = parts[1].toLowerCase();
          const dstHex = parts[2];
          try {
            const dstBuf = Buffer.from(dstHex, 'hex');
            const dstChar = dstBuf.length === 2 ? dstBuf.swap16().toString('utf16le') : dstBuf.toString('utf8');
            cmap.set(src, dstChar);
          } catch {}
        }
      }
    }

    const bfrangeRegex = /beginbfrange([\s\S]*?)endbfrange/g;
    while ((match = bfrangeRegex.exec(streamStr)) !== null) {
      const lines = match[1].trim().split(/\r?\n/);
      for (const line of lines) {
        const parts = line.trim().match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
        if (parts) {
          const start = parseInt(parts[1], 16);
          const end = parseInt(parts[2], 16);
          let dest = parseInt(parts[3], 16);
          const hexLen = parts[1].length;
          for (let code = start; code <= end; code++, dest++) {
            const srcHex = code.toString(16).padStart(hexLen, '0').toLowerCase();
            try {
              cmap.set(srcHex, String.fromCodePoint(dest));
            } catch {}
          }
        }
      }
    }
  }

  /**
   * Stateful text stream content parser handling literal strings, hex strings,
   * TJ kerning array offsets (inserting spaces between words), and WinAnsi encoding.
   */
  private static parseStreamTextContent(streamStr: string, cmap: Map<string, string>): string {
    let text = '';
    let i = 0;
    const len = streamStr.length;

    while (i < len) {
      const ch = streamStr[i];

      // Literal string: (...)
      if (ch === '(') {
        let depth = 1;
        i++;
        let raw = '';
        while (i < len && depth > 0) {
          if (streamStr[i] === '\\') {
            raw += streamStr[i] + (streamStr[i + 1] || '');
            i += 2;
          } else if (streamStr[i] === '(') {
            depth++;
            raw += '(';
            i++;
          } else if (streamStr[i] === ')') {
            depth--;
            if (depth > 0) raw += ')';
            i++;
          } else {
            raw += streamStr[i];
            i++;
          }
        }
        let k = i;
        while (k < len && (streamStr[k] === ' ' || streamStr[k] === '\t' || streamStr[k] === '\r' || streamStr[k] === '\n')) k++;
        let op = '';
        while (k < len && !' \t\r\n(<['.includes(streamStr[k])) { op += streamStr[k]; k++; }
        if (['Tj', "'", '"', 'TJ'].includes(op)) {
          text += this.unescapePdfString(raw) + (op === "'" || op === '"' ? '\n' : ' ');
        }
        continue;
      }

      // Hex string: <...>
      if (ch === '<' && streamStr[i + 1] !== '<') {
        const end = streamStr.indexOf('>', i);
        if (end !== -1) {
          const hex = streamStr.slice(i + 1, end);
          let k = end + 1;
          while (k < len && (streamStr[k] === ' ' || streamStr[k] === '\t' || streamStr[k] === '\r' || streamStr[k] === '\n')) k++;
          let op = '';
          while (k < len && !' \t\r\n(<['.includes(streamStr[k])) { op += streamStr[k]; k++; }
          if (['Tj', "'", '"', 'TJ'].includes(op)) {
            text += this.decodeHexPdfString(hex, cmap) + (op === "'" || op === '"' ? '\n' : ' ');
          }
          i = end + 1;
          continue;
        }
      }

      // TJ kerning array: [...] TJ
      if (ch === '[') {
        const end = streamStr.indexOf(']', i);
        if (end !== -1) {
          const arrayBody = streamStr.slice(i + 1, end);
          let k = end + 1;
          while (k < len && (streamStr[k] === ' ' || streamStr[k] === '\t' || streamStr[k] === '\r' || streamStr[k] === '\n')) k++;
          if (streamStr.slice(k, k + 2) === 'TJ') {
            let p = 0;
            const aLen = arrayBody.length;
            while (p < aLen) {
              const aCh = arrayBody[p];
              if (aCh === '(') {
                let depth = 1;
                p++;
                let raw = '';
                while (p < aLen && depth > 0) {
                  if (arrayBody[p] === '\\') {
                    raw += arrayBody[p] + (arrayBody[p + 1] || '');
                    p += 2;
                  } else if (arrayBody[p] === '(') {
                    depth++;
                    raw += '(';
                    p++;
                  } else if (arrayBody[p] === ')') {
                    depth--;
                    if (depth > 0) raw += ')';
                    p++;
                  } else {
                    raw += arrayBody[p];
                    p++;
                  }
                }
                text += this.unescapePdfString(raw);
              } else if (aCh === '<' && arrayBody[p + 1] !== '<') {
                const hEnd = arrayBody.indexOf('>', p);
                if (hEnd !== -1) {
                  text += this.decodeHexPdfString(arrayBody.slice(p + 1, hEnd), cmap);
                  p = hEnd + 1;
                } else {
                  p++;
                }
              } else if (aCh === '-' || (aCh >= '0' && aCh <= '9')) {
                let numStr = '';
                while (p < aLen && (arrayBody[p] === '-' || (arrayBody[p] >= '0' && arrayBody[p] <= '9') || arrayBody[p] === '.')) {
                  numStr += arrayBody[p];
                  p++;
                }
                const offset = parseFloat(numStr);
                // In PDF TJ operator, negative offsets represent word spacing
                if (offset <= -150) {
                  text += ' ';
                }
              } else {
                p++;
              }
            }
            text += ' ';
            i = k + 2;
            continue;
          }
        }
      }

      // Newline and positioning operators
      if (streamStr.slice(i, i + 2) === 'T*' || streamStr.slice(i, i + 2) === 'TD') {
        text += '\n';
        i += 2;
        continue;
      }

      i++;
    }

    return text;
  }

  /**
   * Unescape standard PDF literal string escape sequences with WinAnsi byte decoding.
   */
  private static unescapePdfString(str: string): string {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\b/g, '\b')
      .replace(/\\f/g, '\f')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\([0-7]{1,3})/g, (_, oct) => {
        const code = parseInt(oct, 8);
        return code >= 0x80 && code <= 0x9f
          ? TextNormalizer.decodeWinAnsiByte(code)
          : String.fromCharCode(code);
      });
  }

  /**
   * Decode hex-encoded PDF string, supporting ToUnicode CMap, UTF-16BE (with/without BOM), and UTF-8/Latin1.
   */
  private static decodeHexPdfString(hex: string, cmap?: Map<string, string>): string {
    const clean = hex.replace(/\s+/g, '');
    if (!clean) return '';

    if (cmap && cmap.size > 0) {
      let mapped = '';
      let matchedAll = true;
      const step = clean.length % 4 === 0 ? 4 : 2;
      for (let i = 0; i < clean.length; i += step) {
        const token = clean.slice(i, i + step).toLowerCase();
        if (cmap.has(token)) {
          mapped += cmap.get(token);
        } else {
          matchedAll = false;
          break;
        }
      }
      if (matchedAll && mapped.length > 0) {
        return mapped;
      }
    }

    const padded = clean.length % 2 !== 0 ? clean + '0' : clean;
    try {
      const buf = Buffer.from(padded, 'hex');
      if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
        return buf.subarray(2).swap16().toString('utf16le');
      }
      if (buf.length >= 4 && buf[0] === 0 && buf[2] === 0) {
        return buf.swap16().toString('utf16le');
      }
      const utf8 = buf.toString('utf8');
      return /[\uFFFD]/.test(utf8) ? buf.toString('latin1') : utf8;
    } catch {
      return '';
    }
  }

  /**
   * Recovers text, metadata, and contact info from PDF structure using heuristic pattern matching.
   */
  private static extractTextHeuristics(buffer: Buffer): string {
    const latin = buffer.toString('latin1');
    const parts: string[] = [];

    const emails = latin.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    parts.push(...emails);

    const metaRegex = /\/(?:Author|Title|Subject|Creator)\s*\(([\s\S]*?)\)/g;
    let m: RegExpExecArray | null;
    while ((m = metaRegex.exec(latin)) !== null) {
      if (m[1] && m[1].trim().length > 1) {
        parts.push(this.unescapePdfString(m[1].trim()));
      }
    }

    const parenRegex = /\(([A-Za-z0-9 ,.\-–—()/@&:+]{4,})\)/g;
    while ((m = parenRegex.exec(latin)) !== null) {
      const str = m[1].trim();
      if (str && !str.startsWith('/') && !str.includes('Identity-H') && !str.includes('FontName')) {
        parts.push(this.unescapePdfString(str));
      }
    }

    return Array.from(new Set(parts)).join(' ').trim();
  }

  /**
   * Scans printable ASCII/Latin character sequences from raw buffer as a fallback,
   * strictly filtering out PDF internal structural dictionary tokens.
   */
  private static extractPrintableChunks(buffer: Buffer): string {
    const content = buffer.toString('latin1');
    const matches = content.match(/[a-zA-Z]{4,}/g);
    if (!matches) return '';

    const pdfSyntaxWords = new Set([
      'pdf', 'obj', 'endobj', 'stream', 'endstream', 'xref', 'startxref',
      'trailer', 'catalog', 'pages', 'font', 'mediabox', 'type', 'length',
      'filter', 'flatedecode', 'subtype', 'image', 'parent', 'resources',
      'producer', 'creator', 'creationdate', 'moddate', 'objstm', 'first',
      'size', 'root', 'info', 'index', 'kids', 'count'
    ]);

    const filtered = matches.filter((m) => !pdfSyntaxWords.has(m.toLowerCase()));
    if (filtered.length < 5) return '';

    return filtered.join(' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Strips PDF page counter annotations (e.g. "-- 1 of 2 --")
   */
  private static stripPageMarkers(text: string): string {
    return text.replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '');
  }
}
