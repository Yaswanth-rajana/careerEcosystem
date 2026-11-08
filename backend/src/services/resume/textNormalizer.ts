/**
 * TextNormalizer
 *
 * Dedicated normalization pipeline for resume extraction text.
 * Handles:
 * - UTF-8 / Windows-1252 Mojibake repair (e.g., â€“ -> –, â€¢ -> •, â€™ -> ')
 * - Unicode NFKC normalization
 * - PDF font ligature unfolding (fi, fl, ff, ffi, ffl)
 * - Standardized bullet character mapping
 * - Hyphenated line-break unwrapping
 * - Control character stripping and whitespace normalization
 * - Preservation of dates, technical terms, emails, and URLs
 */

export class TextNormalizer {
  // Common UTF-8 multi-byte sequences mistakenly decoded as Windows-1252 / Latin-1
  // Explicitly encoded with Unicode code points to prevent source encoding shifts
  private static readonly MOJIBAKE_REPLACEMENTS: Array<[RegExp, string]> = [
    [/\u00E2\u20AC\u2122/g, "'"],      // â€™ -> ' (U+2019 Right single quote / apostrophe)
    [/\u00E2\u20AC\u02DC/g, "'"],      // â€˜ -> ' (U+2018 Left single quote)
    [/\u00E2\u20AC\u201C/g, '–'],       // â€“ -> – (U+2013 En-dash)
    [/\u00E2\u20AC\u201D/g, '—'],       // â€” -> — (U+2014 Em-dash)
    [/\u00E2\u20AC\u00A2/g, '•'],       // â€¢ -> • (U+2022 Bullet)
    [/\u00E2\u20AC\u0153/g, '"'],       // â€œ -> " (U+201C Left double quote)
    [/\u00E2\u20AC\u009D/g, '"'],       // â€ -> " (U+201D Right double quote)
    [/\u00E2\u20AC\u00A6/g, '…'],       // â€¦ -> … (U+2026 Ellipsis)
    [/\u00E2\u201E\u00A2/g, '™'],       // â„¢ -> ™ (Trademark)
    [/\u00C2\u00A0/g, ' '],             // Â  -> space (U+00A0 NBSP)
    [/\u00C2\u00B7/g, '·'],             // Â· -> Middle dot
    [/\u00C2/g, ''],                    // Stray Â prefix
    [/\u00C3\u00A9/g, 'é'],             // Ã© -> é
    [/\u00C3\u00A8/g, 'è'],             // Ã¨ -> è
    [/\u00C3\u00A1/g, 'á'],             // Ã¡ -> á
    [/\u00C3\u00A0/g, 'à'],             // Ã  -> à
    [/\u00C3\u00BC/g, 'ü'],             // Ã¼ -> ü
    [/\u00C3\u00B6/g, 'ö'],             // Ã¶ -> ö
    [/\u00C3\u00A4/g, 'ä'],             // Ã¤ -> ä
    [/\u00C3\u00B1/g, 'ñ'],             // Ã± -> ñ
    [/\u00C3\u00A7/g, 'ç'],             // Ã§ -> ç
    [/\u00C2\u00A9/g, '©'],             // Â© -> ©
    [/\u00C2\u00AE/g, '®'],             // Â® -> ®
  ];

  // Standardize various Unicode bullet and list glyphs to standard bullet '• '
  private static readonly BULLET_GLYPHS = /[\u2022\u25CF\u25E6\u25AA\u25AB\uF0B7\uF0A7\u2023\u2043\u2219]/g;

  /**
   * Main entry point to clean and normalize raw extracted resume text.
   */
  static normalize(rawText: string): string {
    if (!rawText || typeof rawText !== 'string') return '';

    let text = rawText;

    // 1. Repair known UTF-8 Mojibake artifacts BEFORE NFKC normalization
    // (Otherwise NFKC decomposes \u2122 trademark into "TM" before the regex can match â€™)
    text = this.repairMojibake(text);

    // 2. Unicode NFKC normalization (canonical decomposition followed by canonical composition)
    try {
      text = text.normalize('NFKC');
    } catch {
      // Ignore if environment lacks full ICU
    }

    // 3. Unfold typographic ligatures commonly emitted by TeX / PDF fonts
    text = this.unfoldLigatures(text);

    // 4. Standardize bullet characters
    text = this.normalizeBullets(text);

    // 5. Line endings normalization (CRLF / CR -> LF)
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 6. Strip non-printable ASCII control characters (preserving \n and \t)
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');

    // 7. Strip zero-width spaces and invisible joiners
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // 8. Unwrap hyphenated words broken across line endings (e.g. "distrib-\nuted" -> "distributed")
    // Only join when both sides are genuine alphabetic tokens (preserve compound words and negative values)
    text = text.replace(/([a-zA-Z]{2,})-\n([a-z]{2,})/g, '$1$2');

    // 9. Normalize horizontal whitespace (spaces, tabs, non-breaking spaces)
    text = text.replace(/[ \t\u00A0\u2000-\u200A]+/g, ' ');

    // 10. Trim whitespace at ends of lines
    text = text.replace(/[ \t]+$/gm, '');

    // 11. Normalize excessive empty lines (maximum 2 consecutive newlines to preserve paragraph boundaries)
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  }

  /**
   * Replaces known Mojibake patterns.
   */
  static repairMojibake(text: string): string {
    let result = text;
    for (const [pattern, replacement] of this.MOJIBAKE_REPLACEMENTS) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  /**
   * Unfolds typographic ligatures into separate characters.
   */
  static unfoldLigatures(text: string): string {
    return text
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'ft')
      .replace(/\uFB06/g, 'st');
  }

  /**
   * Standardizes bullet characters across various platforms.
   */
  static normalizeBullets(text: string): string {
    // Replace standalone bullet glyphs with standard •
    let result = text.replace(this.BULLET_GLYPHS, '•');

    // If a line starts with a list marker like "- ", "* ", "+ ", or "o ", standardize to "• "
    result = result.replace(/^([ \t]*)[*\-+](?=[ \t]+[A-Za-z0-9])/gm, '$1•');

    // Ensure a space follows every bullet marker
    result = result.replace(/•(?=[^\s•])/g, '• ');

    return result;
  }

  /**
   * WinAnsi (Windows-1252) byte mapping table for byte values 0x80 - 0x9F.
   * Standard in PDF Type 1 / TrueType fonts without custom CMap.
   */
  static decodeWinAnsiByte(byte: number): string {
    switch (byte) {
      case 0x80: return '€';
      case 0x82: return '‚';
      case 0x83: return 'ƒ';
      case 0x84: return '„';
      case 0x85: return '…';
      case 0x86: return '†';
      case 0x87: return '‡';
      case 0x88: return 'ˆ';
      case 0x89: return '‰';
      case 0x8a: return 'Š';
      case 0x8b: return '‹';
      case 0x8c: return 'Œ';
      case 0x8e: return 'Ž';
      case 0x91: return '‘';
      case 0x92: return '’';
      case 0x93: return '“';
      case 0x94: return '”';
      case 0x95: return '•';
      case 0x96: return '–';
      case 0x97: return '—';
      case 0x98: return '˜';
      case 0x99: return '™';
      case 0x9a: return 'š';
      case 0x9b: return '›';
      case 0x9c: return 'œ';
      case 0x9e: return 'ž';
      case 0x9f: return 'Ÿ';
      default: return String.fromCharCode(byte);
    }
  }

  /**
   * MacRoman byte mapping table for PDF documents authored on Mac OS.
   */
  static decodeMacRomanByte(byte: number): string {
    switch (byte) {
      case 0xa5: return '•';
      case 0xd1: return '–';
      case 0xd0: return '—';
      case 0xd4: return '‘';
      case 0xd5: return '’';
      case 0xd2: return '“';
      case 0xd3: return '”';
      case 0xc9: return '…';
      default: return String.fromCharCode(byte);
    }
  }
}
