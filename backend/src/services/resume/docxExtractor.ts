import { TextNormalizer } from './textNormalizer';

/**
 * DocxExtractor
 *
 * Structured extraction of DOCX documents using Mammoth HTML conversion.
 * Preserves:
 * - Table rows and cell structures (using markdown tables: | col1 | col2 |)
 * - Headings (converted to ## Section)
 * - Bullet and numbered lists (converted to • Item)
 * - Hyperlinks (preserving portfolio, GitHub, LinkedIn URLs)
 * - Paragraph boundaries
 */
export class DocxExtractor {
  /**
   * Extracts text from a DOCX file buffer while preserving document hierarchy and layout.
   */
  static async extract(buffer: Buffer): Promise<string> {
    try {
      let mammothModule: any;
      try {
        mammothModule = (await import('mammoth')).default || (await import('mammoth'));
      } catch {
        // Fallback to runtime require if dynamic import is unavailable
        mammothModule = eval('require')('mammoth');
      }

      if (!mammothModule || typeof mammothModule.convertToHtml !== 'function') {
        throw new Error('Mammoth DOCX parser is unavailable.');
      }

      // Convert DOCX to semantic HTML
      const htmlResult = await mammothModule.convertToHtml({ buffer });
      const html = htmlResult?.value || '';

      if (!html.trim()) {
        // Fallback to raw text if HTML is empty
        const rawResult = await mammothModule.extractRawText({ buffer });
        return TextNormalizer.normalize(rawResult?.value || '');
      }

      const structuredText = this.htmlToStructuredText(html);
      return TextNormalizer.normalize(structuredText);
    } catch (err: any) {
      console.warn('[DocxExtractor] Failed to extract DOCX:', err?.message || err);
      throw new Error('Unable to read this DOCX file. Please verify the document is not corrupted.');
    }
  }

  /**
   * Transforms Mammoth semantic HTML into structured plain text.
   */
  private static htmlToStructuredText(html: string): string {
    let text = html;

    // 1. Convert Table Rows into pipe-separated markdown lines: | col1 | col2 |
    text = text.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (_, rowContent) => {
      const cells: string[] = [];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        const cleanCell = cellMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleanCell) {
          cells.push(cleanCell);
        }
      }
      return cells.length > 0 ? `\n| ${cells.join(' | ')} |\n` : '';
    });
    text = text.replace(/<\/?(table|thead|tbody|tfoot)[^>]*>/gi, '\n');

    // 2. Convert Headings (h1 - h6) into clear section headers
    text = text.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, (_, h) => {
      const cleanH = h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return cleanH ? `\n\n## ${cleanH}\n\n` : '';
    });

    // 3. Convert List Items into standard bullet lines
    text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, li) => {
      const cleanLi = li.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return cleanLi ? `\n• ${cleanLi}` : '';
    });
    text = text.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

    // 4. Preserve Hyperlinks (e.g. <a href="url">text</a>)
    text = text.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => {
      const cleanContent = content.replace(/<[^>]+>/g, '').trim();
      if (!cleanContent) return href;
      if (cleanContent.toLowerCase() === href.toLowerCase() || href.startsWith('#')) return cleanContent;
      return `${cleanContent} (${href})`;
    });

    // 5. Paragraphs & Line Breaks
    text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');

    // 6. Strip all remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // 7. Unescape standard HTML entities
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');

    return text;
  }
}

