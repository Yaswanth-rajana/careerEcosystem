import zlib from 'zlib';

export interface ParsedResumeData {
  rawText: string;
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    headline?: string;
    bio?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    location?: string;
    startYear?: number;
    endYear?: number | null;
    isCurrent?: boolean;
    gpa?: string;
    source: 'RESUME';
  }>;
  experience: Array<{
    company: string;
    roleTitle: string;
    jobTitle?: string;
    employmentType?: string;
    location?: string;
    startDate?: string;
    endDate?: string | null;
    isCurrent?: boolean;
    description?: string;
    bullets?: string[];
    source: 'RESUME';
  }>;
  skills: Array<{
    name: string;
    category?: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    source: 'RESUME';
    verified: false;
  }>;
  projects: Array<{
    title: string;
    description?: string;
    role?: string;
    technologies: string[];
    projectUrl?: string;
    githubUrl?: string;
    bullets?: string[];
    source: 'RESUME';
  }>;
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate?: string;
    source: 'RESUME';
  }>;
  professionalLinks: Array<{
    platform: string;
    url: string;
  }>;
}

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI', 'Flask',
  'Java', 'Spring Boot', 'C++', 'C#', '.NET', 'Go', 'Rust', 'Ruby', 'PHP',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux',
  'Tailwind', 'TailwindCSS', 'CSS', 'HTML', 'Kafka', 'Snowflake', 'Terraform',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis',
  'Cybersecurity', 'Figma', 'UI/UX Design', 'Product Management', 'Agile', 'Scrum',
  'Communication', 'Leadership', 'Problem Solving', 'Project Management'
];

export class ResumeParserService {
  /**
   * Main entry point for parsing resume files into candidate profile suggestions.
   */
  static async parseResume(fileBuffer: Buffer, filename: string, mimeType: string): Promise<ParsedResumeData> {
    console.log(`[Resume Upload] parsing started: filename="${filename}", mimeType="${mimeType}"`);
    const rawText = await this.extractTextFromBuffer(fileBuffer, filename, mimeType);
    const cleanedText = this.normalizeExtractedText(rawText);

    if (!cleanedText || cleanedText.replace(/\s+/g, '').length < 10) {
      console.warn('[Resume Upload] Rejected: document contains no readable text (<10 characters)');
      throw new Error('No readable text was found in this resume.');
    }
    
    console.log(`[Resume Upload] parsing completed: extracted ${cleanedText.length} characters`);
    const sections = this.splitIntoSections(cleanedText);

    return {
      rawText: cleanedText,
      personalInfo: this.extractPersonalInfo(cleanedText, filename),
      education: this.extractEducation(sections, cleanedText),
      experience: this.extractExperience(sections, cleanedText),
      skills: this.extractSkills(sections, cleanedText),
      projects: this.extractProjects(sections, cleanedText),
      certifications: this.extractCertifications(sections, cleanedText),
      professionalLinks: this.extractLinks(cleanedText),
    };
  }

  /**
   * Safe extraction of text from PDF / DOCX / TXT buffers using real parsers.
   */
  private static async extractTextFromBuffer(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    const isPdf = ext === 'pdf' || mimeType === 'application/pdf' || buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'));
    const isDocx = ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isTxt = ext === 'txt' || mimeType === 'text/plain';

    if (ext === 'doc' || mimeType === 'application/msword') {
      throw new Error('Legacy .doc format is not supported. Please upload a PDF, DOCX, or TXT file.');
    }

    if (isPdf) {
      try {
        return await this.extractFromPdf(buffer);
      } catch (err: any) {
        const utf8Str = buffer.toString('utf-8');
        if (utf8Str.length > 20 && /[a-zA-Z0-9]/.test(utf8Str)) {
          return utf8Str;
        }
        throw err;
      }
    }

    if (isDocx) {
      return await this.extractFromDocx(buffer);
    }

    if (isTxt) {
      return this.extractFromTxt(buffer);
    }

    // Fallback: If buffer contains %PDF- signature regardless of filename
    if (buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'))) {
      try {
        return await this.extractFromPdf(buffer);
      } catch (err: any) {
        const utf8Str = buffer.toString('utf-8');
        if (utf8Str.length > 20 && /[a-zA-Z0-9]/.test(utf8Str)) {
          return utf8Str;
        }
        throw err;
      }
    }

    // Fallback: UTF-8 readable text check (for test runners or plain buffers)
    const utf8Str = buffer.toString('utf-8');
    if (utf8Str.length > 20 && /[a-zA-Z0-9]/.test(utf8Str)) {
      return utf8Str;
    }

    throw new Error('Unsupported resume format. Please upload PDF, DOCX, or TXT.');
  }

  /**
   * PDF text extraction via resilient multi-tier strategy:
   * Tier 1: pdf-parse library
   * Tier 2: Zero-dependency native PDF stream decompressor with ToUnicode CMap support
   * Tier 3: Scan printable text sequences from raw buffer
   * Tier 4: UTF-8 string fallback
   */
  private static async extractFromPdf(buffer: Buffer): Promise<string> {
    let pdfParsePasswordError = false;

    // Tier 1: Attempt pdf-parse library extraction
    try {
      let pdfModule: any;
      try {
        pdfModule = await import('pdf-parse');
      } catch {
        pdfModule = eval('require')('pdf-parse');
      }

      const PDFParseClass = pdfModule?.PDFParse || pdfModule?.default?.PDFParse;

      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: buffer });
        const textResult = await parser.getText();
        if (parser.destroy) {
          await parser.destroy().catch(() => {});
        }
        const text = textResult?.text || '';
        if (text && text.trim().length >= 10) {
          return text;
        }
      }

      const parseFn = typeof pdfModule === 'function' ? pdfModule : pdfModule?.default;
      if (typeof parseFn === 'function') {
        const result = await parseFn(buffer);
        const text = result?.text || '';
        if (text && text.trim().length >= 10) {
          return text;
        }
      }
    } catch (err: any) {
      if (err?.message && err.message.toLowerCase().includes('password')) {
        pdfParsePasswordError = true;
      }
      console.warn('[Resume Parser] pdf-parse library failed, falling back to native stream extractor:', err?.message || err);
    }

    // Tier 2: Zero-dependency native PDF stream decompressor with CMap support & operator parser
    try {
      const streamText = this.extractTextFromPdfStreams(buffer);
      if (streamText && streamText.trim().length >= 10) {
        console.log(`[Resume Parser] Native PDF stream extraction succeeded (${streamText.length} chars)`);
        return streamText;
      }
    } catch (streamErr: any) {
      console.warn('[Resume Parser] Native PDF stream extraction failed:', streamErr?.message || streamErr);
    }

    // Tier 3: Printable chunk scanner for uncompressed/hybrid streams
    try {
      const printableText = this.extractPrintableChunks(buffer);
      if (printableText && printableText.trim().length >= 20) {
        console.log(`[Resume Parser] Printable chunk extraction succeeded (${printableText.length} chars)`);
        return printableText;
      }
    } catch (chunkErr: any) {
      console.warn('[Resume Parser] Printable chunk extraction failed:', chunkErr?.message || chunkErr);
    }

    // Tier 4: Buffer UTF-8 string fallback
    try {
      const rawUtf8 = buffer.toString('utf-8');
      const cleanRaw = rawUtf8.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleanRaw.length >= 30 && /[a-zA-Z]{3,}/.test(cleanRaw)) {
        return cleanRaw;
      }
    } catch {
      // ignore
    }

    if (pdfParsePasswordError) {
      throw new Error('Password-protected PDFs are not supported. Please upload an unlocked PDF.');
    }

    throw new Error('Unable to read this PDF. Please upload a text-based PDF or another supported resume format.');
  }

  /**
   * Unescape standard PDF literal string escape sequences.
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
      .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
  }

  /**
   * Decode hex-encoded PDF string, supporting ToUnicode CMap, UTF-16BE (with/without BOM), and UTF-8/Latin1.
   */
  private static decodeHexPdfString(hex: string, cmap?: Map<string, string>): string {
    const clean = hex.replace(/\s+/g, '');
    if (!clean) return '';

    // If CMap is available, try mapping glyphs
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
      // UTF-16BE with BOM
      if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
        return buf.subarray(2).swap16().toString('utf16le');
      }
      // UTF-16BE without BOM (alternating zero bytes)
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
          } catch {
            // continue
          }
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
            } catch {
              // continue
            }
          }
        }
      }
    }
  }

  /**
   * Pure Node.js zero-dependency PDF stream decompressor and text operator extractor.
   */
  private static extractTextFromPdfStreams(buffer: Buffer): string {
    let extractedText = '';
    const cmap = new Map<string, string>();
    const decompressedStreams: string[] = [];

    let searchPos = 0;
    const streamKeyword = Buffer.from('stream');
    const endstreamKeyword = Buffer.from('endstream');

    // First pass: locate and decompress all streams
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

      let decompressed: Buffer;
      try {
        decompressed = zlib.inflateSync(rawStream);
      } catch {
        try {
          decompressed = zlib.unzipSync(rawStream);
        } catch {
          try {
            decompressed = zlib.inflateRawSync(rawStream);
          } catch {
            decompressed = rawStream;
          }
        }
      }

      const streamStr = decompressed.toString('latin1');
      decompressedStreams.push(streamStr);

      if (streamStr.includes('beginbfchar') || streamStr.includes('beginbfrange')) {
        this.parseCMap(streamStr, cmap);
      }
    }

    // Second pass: parse BT ... ET and text operators
    for (const streamStr of decompressedStreams) {
      const btRegex = /BT([\s\S]*?)ET/g;
      let btMatch: RegExpExecArray | null;
      let foundBt = false;

      while ((btMatch = btRegex.exec(streamStr)) !== null) {
        foundBt = true;
        const block = btMatch[1];

        // TJ arrays: [(text) -120 (more text)] TJ
        const arrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
        let arrMatch: RegExpExecArray | null;
        while ((arrMatch = arrayRegex.exec(block)) !== null) {
          const arrContent = arrMatch[1];
          const innerLiteralRegex = /\(([\s\S]*?)\)/g;
          let litMatch: RegExpExecArray | null;
          while ((litMatch = innerLiteralRegex.exec(arrContent)) !== null) {
            extractedText += this.unescapePdfString(litMatch[1]);
          }
          const innerHexRegex = /<([0-9a-fA-F\s]+)>/g;
          let hexMatch: RegExpExecArray | null;
          while ((hexMatch = innerHexRegex.exec(arrContent)) !== null) {
            extractedText += this.decodeHexPdfString(hexMatch[1], cmap);
          }
          extractedText += ' ';
        }

        // Standalone Tj, ', "
        const tjRegex = /\(([\s\S]*?)\)\s*(?:Tj|'|")/g;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          extractedText += this.unescapePdfString(tjMatch[1]) + ' ';
        }

        const hexTjRegex = /<([0-9a-fA-F\s]+)>\s*(?:Tj|'|")/g;
        let hMatch: RegExpExecArray | null;
        while ((hMatch = hexTjRegex.exec(block)) !== null) {
          extractedText += this.decodeHexPdfString(hMatch[1], cmap) + ' ';
        }

        extractedText += '\n';
      }

      if (!foundBt) {
        const tjRegex = /\(([\s\S]*?)\)\s*(?:Tj|'|")/g;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(streamStr)) !== null) {
          extractedText += this.unescapePdfString(tjMatch[1]) + ' ';
        }
        const hexTjRegex = /<([0-9a-fA-F\s]+)>\s*(?:Tj|'|")/g;
        let hMatch: RegExpExecArray | null;
        while ((hMatch = hexTjRegex.exec(streamStr)) !== null) {
          extractedText += this.decodeHexPdfString(hMatch[1], cmap) + ' ';
        }
      }
    }

    return extractedText.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
  }

  /**
   * Scans printable ASCII/Latin character sequences from raw buffer as a fallback.
   */
  private static extractPrintableChunks(buffer: Buffer): string {
    const content = buffer.toString('latin1');
    const matches = content.match(/[\x20-\x7E]{4,}/g);
    if (!matches) return '';
    return matches
      .filter((m) => !m.startsWith('/') && !m.startsWith('<<') && !m.startsWith('obj') && !m.startsWith('endobj'))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * DOCX text extraction via mammoth (dynamically imported to avoid static compile-time bundling).
   */
  private static async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      let mammothModule: any;
      try {
        mammothModule = (await import('mammoth')).default || (await import('mammoth'));
      } catch {
        mammothModule = eval('require')('mammoth');
      }
      const result = await mammothModule.extractRawText({ buffer });
      return result?.value || '';
    } catch {
      throw new Error('Unable to read this DOCX file. Please verify the document is not corrupted.');
    }
  }

  /**
   * TXT text extraction via UTF-8 buffer decoding.
   */
  private static extractFromTxt(buffer: Buffer): string {
    try {
      return buffer.toString('utf-8');
    } catch {
      throw new Error('Unable to read text file.');
    }
  }

  /**
   * Normalizes line breaks and removes page footer noise.
   */
  private static normalizeExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, '') // Remove pdf-parse page markers
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ') // Strip control characters
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private static splitIntoSections(text: string): Array<{
    type: 'CONTACT' | 'SUMMARY' | 'EDUCATION' | 'EXPERIENCE' | 'PROJECTS' | 'CERTIFICATIONS' | 'SKILLS' | 'ACHIEVEMENTS' | 'LINKS' | 'UNKNOWN';
    rawText: string;
    lines: string[];
  }> {
    const SECTION_PATTERNS: Array<{
      type: 'EDUCATION' | 'EXPERIENCE' | 'CERTIFICATIONS' | 'PROJECTS' | 'SKILLS' | 'ACHIEVEMENTS' | 'SUMMARY';
      regex: RegExp;
    }> = [
      {
        type: 'EDUCATION',
        regex: /^(?:EDUCATION|ACADEMIC BACKGROUND|ACADEMIC PROFILE|ACADEMIC QUALIFICATIONS?|EDUCATIONAL BACKGROUND|QUALIFICATIONS)$/i,
      },
      {
        type: 'EXPERIENCE',
        regex: /^(?:EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY|WORK HISTORY|INTERNSHIPS?|INTERNSHIP EXPERIENCE)$/i,
      },
      {
        type: 'CERTIFICATIONS',
        regex: /^(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES\s*(?:&|AND)\s*CERTIFICATIONS?|COURSES\s*(?:&|AND)\s*CERTIFICATIONS?|PROFESSIONAL CERTIFICATIONS?)$/i,
      },
      {
        type: 'PROJECTS',
        regex: /^(?:PROJECTS?|TECHNICAL PROJECTS?|PERSONAL PROJECTS?|ACADEMIC PROJECTS?|KEY PROJECTS?)$/i,
      },
      {
        type: 'SKILLS',
        regex: /^(?:SKILLS?|TECHNICAL SKILLS?|CORE COMPETENCIES|AREAS OF EXPERTISE|KEY SKILLS?|TECHNOLOGIES)$/i,
      },
      {
        type: 'ACHIEVEMENTS',
        regex: /^(?:ACHIEVEMENTS?|AWARDS?|HONORS?\s*(?:&|AND)\s*AWARDS?|AWARDS\s*(?:&|AND)\s*ACHIEVEMENTS?|ACCOMPLISHMENTS?)$/i,
      },
      {
        type: 'SUMMARY',
        regex: /^(?:SUMMARY|PROFESSIONAL SUMMARY|CAREER OBJECTIVE|OBJECTIVE|PROFILE|ABOUT ME)$/i,
      },
    ];

    const lines = text.split(/\r?\n/);
    type SectionType = 'CONTACT' | 'SUMMARY' | 'EDUCATION' | 'EXPERIENCE' | 'PROJECTS' | 'CERTIFICATIONS' | 'SKILLS' | 'ACHIEVEMENTS' | 'LINKS' | 'UNKNOWN';
    const sections: Array<{
      type: SectionType;
      rawText: string;
      lines: string[];
    }> = [];

    let currentType: SectionType = 'CONTACT';
    let currentLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const cleanHeader = line
        .replace(/^[#*•\-_=~|]+\s*/, '')
        .replace(/[\s#*•\-_=~|:]+$/, '')
        .trim();

      let matchedType: SectionType | null = null;
      if (
        cleanHeader.length >= 3 &&
        cleanHeader.length <= 45 &&
        !cleanHeader.includes('@') &&
        !cleanHeader.toLowerCase().includes('http')
      ) {
        for (const pattern of SECTION_PATTERNS) {
          if (pattern.regex.test(cleanHeader)) {
            matchedType = pattern.type;
            break;
          }
        }
      }

      if (matchedType) {
        if (currentLines.length > 0) {
          sections.push({
            type: currentType,
            rawText: currentLines.join('\n'),
            lines: currentLines.filter(Boolean),
          });
        }
        currentType = matchedType;
        currentLines = [];
      } else {
        currentLines.push(rawLine);
      }
    }

    if (currentLines.length > 0) {
      sections.push({
        type: currentType,
        rawText: currentLines.join('\n'),
        lines: currentLines.filter(Boolean),
      });
    }

    return sections;
  }

  private static extractPersonalInfo(text: string, filename: string) {
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    
    // Location extraction
    const locationMatch =
      text.match(/(?:Location|Address|Based in|Lives in)[\s:]*([A-Za-z\s]+,\s*[A-Za-z\s]+)/i) ||
      text.match(/\b([A-Z][a-zA-Z\s]{1,30},\s*(?:CA|NY|TX|WA|MA|IL|FL|UK|IN|DE|FR|JP|US|USA))\b/);

    // Name heuristic from top lines or sanitized filename
    let name: string | undefined;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length >= 2 && lines[0].length <= 40 && !lines[0].includes('@') && !lines[0].toLowerCase().includes('http')) {
      const candidate = lines[0].replace(/[^a-zA-Z\s.-]/g, '').trim();
      if (candidate.length >= 2) {
        name = candidate;
      }
    }
    if (!name || name.length < 2) {
      const base = filename.split('.')[0].replace(/[-_]/g, ' ').trim();
      if (base && base.length > 2 && !base.toLowerCase().includes('resume') && !base.toLowerCase().includes('cv')) {
        name = base.replace(/\b\w/g, c => c.toUpperCase());
      }
    }

    // Explicit headline extraction if present in top lines
    let headline: string | undefined;
    const topLines = lines.slice(0, 8);
    const headlineKeywords = [
      'Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer',
      'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer', 'Product Manager',
      'Cybersecurity Analyst', 'Cloud Architect', 'UI/UX Designer', 'Mobile Developer'
    ];
    for (const line of topLines) {
      const matched = headlineKeywords.find(k => line.toLowerCase().includes(k.toLowerCase()));
      if (matched) {
        headline = matched;
        break;
      }
    }

    // Bio / Summary extraction
    let bio: string | undefined;
    const summaryMatch = text.match(/(?:SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE|ABOUT ME)[\s:]*\n+([\s\S]{20,400}?)(?=\n+[A-Z\s]{4,}|\n\n|$)/i);
    if (summaryMatch) {
      bio = summaryMatch[1].replace(/\s+/g, ' ').trim();
    }

    return {
      name: name || undefined,
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      location: locationMatch ? locationMatch[1].trim() : undefined,
      headline,
      bio,
    };
  }

  private static isEducationInstitutionLine(line: string): boolean {
    const trimmed = line.trim();
    if (/^(?:Secondary School Certificate|High School Diploma|SSC|HSC|Intermediate)\b/i.test(trimmed)) {
      return false;
    }
    return /(?:College|University|Institute|Academy|Polytechnic|\bSchool\b)/i.test(trimmed);
  }

  private static isEducationDegreeLine(line: string): boolean {
    return /(?:B\.?Tech|B\.?E\.?|B\.?S|B\.?A|Bachelor|M\.?Tech|M\.?E\.?|M\.?S|Master|Ph\.?D|Doctorate|Intermediate|Secondary School Certificate|SSC|HSC|10th|12th|Diploma|Matriculation)/i.test(line);
  }

  private static parseDegreeAndField(text: string): { degree: string; fieldOfStudy: string } {
    const clean = text.replace(/^[\s•*–\-]+/, '').trim();
    if (!clean) return { degree: '', fieldOfStudy: '' };

    // Check specialization separator: " – " or " - "
    const dashMatch = clean.match(/\s+[–—]\s+(.*)$/) || (clean.includes(' - ') ? clean.match(/\s+-\s+(.*)$/) : null);
    if (dashMatch && dashMatch.index) {
      const mainPart = clean.substring(0, dashMatch.index).trim();
      const specPart = dashMatch[1].trim();

      if (/(?:B\.?Tech|B\.?E\.?|B\.?S|Bachelor|M\.?Tech|Master)/i.test(mainPart)) {
        return {
          degree: mainPart,
          fieldOfStudy: specPart,
        };
      }
    }

    // Check "Bachelor of X in Y" or "Master of X in Y"
    const bscMatch = clean.match(/(Bachelor(?:\s+of\s+[A-Za-z]+)?|B\.?S\.?c?|B\.?A\.?|Master(?:\s+of\s+[A-Za-z]+)?|M\.?S\.?c?|Ph\.?D\.?)\s+in\s+([A-Za-z\s&,()-]+)/i);
    if (bscMatch) {
      return {
        degree: bscMatch[1].trim(),
        fieldOfStudy: bscMatch[2].trim(),
      };
    }

    // Check "B.Tech in Y"
    const btechMatch = clean.match(/(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?E\.?)\s+in\s+([A-Za-z\s&,()-]+)/i);
    if (btechMatch) {
      return {
        degree: btechMatch[1].trim(),
        fieldOfStudy: btechMatch[2].trim(),
      };
    }

    // Check Intermediate
    const interMatch = clean.match(/Intermediate(?:\s*\(([^)]+)\))?/i);
    if (interMatch) {
      return {
        degree: interMatch[0].trim(),
        fieldOfStudy: interMatch[1] ? interMatch[1].trim() : 'MPC',
      };
    }

    // Check Secondary School Certificate
    const sscMatch = clean.match(/(?:Secondary School Certificate(?:\s*\(SSC\))?|SSC|10th(?:\s+Grade)?)/i);
    if (sscMatch) {
      return {
        degree: sscMatch[0].trim(),
        fieldOfStudy: 'Secondary Education',
      };
    }

    // Standalone Bachelor / Master / Ph.D
    const standaloneMatch = clean.match(/(Bachelor(?:\s+of\s+[A-Za-z]+)?|Master(?:\s+of\s+[A-Za-z]+)?|Ph\.?D\.?|B\.?Tech|B\.?E\.?|M\.?Tech)/i);
    if (standaloneMatch) {
      return {
        degree: standaloneMatch[0].trim(),
        fieldOfStudy: '',
      };
    }

    return { degree: clean, fieldOfStudy: '' };
  }

  private static parseEducationBlock(block: string[]): ParsedResumeData['education'][0] | null {
    const fullBlock = block.join('\n');

    // 1. Dates: extract ONLY what is explicitly in text
    const yearMatch = fullBlock.match(/\b(19\d\d|20\d\d)\b\s*[-–—to\s]+\s*(\b19\d\d|20\d\d\b|Present|Current)/i);
    let startYear: number | undefined;
    let endYear: number | null = null;
    const isCurrent = /present|current/i.test(fullBlock);

    if (yearMatch) {
      startYear = parseInt(yearMatch[1], 10);
      if (!/present|current/i.test(yearMatch[2])) {
        endYear = parseInt(yearMatch[2], 10);
      }
    } else {
      const singleYear = fullBlock.match(/\b(19\d\d|20\d\d)\b/);
      if (singleYear) {
        startYear = parseInt(singleYear[1], 10);
        endYear = isCurrent ? null : startYear;
      }
    }

    // 2. GPA / CGPA / Percentage
    let gpa: string | undefined;
    const cgpaMatch = fullBlock.match(/(?:CGPA|GPA|Grade)[\s:]*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*(?:4|10)(?:\.0)?)?)/i);
    const pctMatch = fullBlock.match(/(?:Percentage|Score|Marks)[\s:]*([0-9]+(?:\.[0-9]+)?\s*%)/i);
    const standaloneRatio = fullBlock.match(/\b([0-9]\.[0-9]{1,2}\s*\/\s*(?:4|10)(?:\.0)?)\b/);
    const standalonePct = fullBlock.match(/\b([0-9]{2}(?:\.[0-9]+)?%)\b/);

    if (cgpaMatch) gpa = cgpaMatch[1].trim();
    else if (pctMatch) gpa = pctMatch[1].trim();
    else if (standaloneRatio) gpa = standaloneRatio[1].trim();
    else if (standalonePct) gpa = standalonePct[1].trim();

    // 3. Institution name
    const instLine = block.find(l => this.isEducationInstitutionLine(l)) || block[0];
    const institution = instLine
      .split('|')[0]
      .replace(/\b(19\d\d|20\d\d)\b.*$/, '')
      .replace(/^[\s•*–\-]+/, '')
      .trim();

    if (!institution || institution.length < 3) {
      return null;
    }

    // 4. Degree and Field
    const degreeSegments: string[] = [];
    for (const line of block) {
      const parts = line.split('|').map(p => p.trim());
      for (const part of parts) {
        if (!this.isEducationInstitutionLine(part) && !/(?:19\d\d|20\d\d|CGPA|GPA|Percentage|\d+%)/i.test(part)) {
          degreeSegments.push(part);
        }
      }
    }

    const degreeCandidateText = degreeSegments.join(' ');
    const { degree, fieldOfStudy } = this.parseDegreeAndField(degreeCandidateText);

    return {
      institution,
      degree: degree || '',
      fieldOfStudy: fieldOfStudy || '',
      gpa,
      startYear,
      endYear,
      isCurrent,
      source: 'RESUME',
    };
  }

  private static extractEducation(
    sections: Array<{ type: string; rawText: string; lines: string[] }>,
    fullText: string
  ): ParsedResumeData['education'] {
    const eduSection = sections.find(s => s.type === 'EDUCATION');
    const rawLines = eduSection ? eduSection.lines : [];

    // If an EDUCATION section is detected, ONLY parse lines inside it
    let linesToProcess = rawLines.map(l => l.trim()).filter(Boolean);

    // Fallback if no explicit EDUCATION section heading was found:
    // scan the document but strictly EXCLUDE lines from CERTIFICATIONS, EXPERIENCE, etc.
    if (linesToProcess.length === 0) {
      const nonEduTypes = ['CERTIFICATIONS', 'EXPERIENCE', 'PROJECTS', 'SKILLS', 'SUMMARY'];
      const nonEduLines = new Set<string>();
      sections
        .filter(s => nonEduTypes.includes(s.type))
        .forEach(s => s.lines.forEach(l => nonEduLines.add(l.trim())));

      linesToProcess = fullText
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => Boolean(l) && !nonEduLines.has(l) && (this.isEducationInstitutionLine(l) || this.isEducationDegreeLine(l)));
    }

    // Group lines into distinct education entry blocks
    const blocks: string[][] = [];
    let currentBlock: string[] = [];

    for (const line of linesToProcess) {
      const hasInst = this.isEducationInstitutionLine(line);
      const currentHasInst = currentBlock.some(l => this.isEducationInstitutionLine(l));

      if (hasInst && currentHasInst && !this.isEducationDegreeLine(line)) {
        blocks.push(currentBlock);
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    // Parse each block into a structured record
    const entries: ParsedResumeData['education'] = [];
    const seenInstitutions = new Set<string>();

    for (const block of blocks) {
      const parsed = this.parseEducationBlock(block);
      if (!parsed) continue;

      const normKey = parsed.institution.toLowerCase().replace(/[^a-z0-9]/g, '');
      const existing = entries.find(e => e.institution.toLowerCase().replace(/[^a-z0-9]/g, '') === normKey);

      if (!existing) {
        seenInstitutions.add(normKey);
        entries.push(parsed);
      } else {
        // Merge multi-line fragments
        if (!existing.degree && parsed.degree) existing.degree = parsed.degree;
        if (!existing.fieldOfStudy && parsed.fieldOfStudy) existing.fieldOfStudy = parsed.fieldOfStudy;
        if (!existing.startYear && parsed.startYear) existing.startYear = parsed.startYear;
        if (!existing.endYear && parsed.endYear) existing.endYear = parsed.endYear;
        if (!existing.gpa && parsed.gpa) existing.gpa = parsed.gpa;
        if (parsed.isCurrent) existing.isCurrent = true;
      }
    }

    return entries.slice(0, 5);
  }

  private static extractExperience(
    sections: Array<{ type: string; rawText: string; lines: string[] }>,
    fullText: string
  ): ParsedResumeData['experience'] {
    const expSection = sections.find(s => s.type === 'EXPERIENCE');
    const rawLines = expSection ? expSection.lines : [];

    let linesToProcess = rawLines.map(l => l.trim()).filter(Boolean);

    // Fallback if no explicit EXPERIENCE section heading was found:
    // scan the document but strictly EXCLUDE lines from non-experience sections
    if (linesToProcess.length === 0) {
      const nonExpTypes = ['EDUCATION', 'CERTIFICATIONS', 'PROJECTS', 'SKILLS', 'SUMMARY'];
      const nonExpLines = new Set<string>();
      sections
        .filter(s => nonExpTypes.includes(s.type))
        .forEach(s => s.lines.forEach(l => nonExpLines.add(l.trim())));

      linesToProcess = fullText
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => Boolean(l) && !nonExpLines.has(l) && (/\bat\b/i.test(l) || /Developer|Engineer|Intern|Analyst|Manager/i.test(l)));
    }

    if (linesToProcess.length === 0) {
      return [];
    }

    const ROLE_KEYWORDS = /\b(?:Developer|Engineer|Intern|Analyst|Manager|Architect|Consultant|Lead|Designer|Specialist|Officer|Administrator|Coordinator|Associate|Programmer|Scientist|Director|VP|President|Founder|Co-Founder|CTO|CEO|COO|Fellow|Researcher|Technician|Apprentice)\b/i;
    const MONTH_NAMES = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
    const DATE_POINT = `(?:${MONTH_NAMES}\\s*,?\\s*\\d{4}|\\d{1,2}\\/\\d{4}|\\b(?:19\\d\\d|20\\d\\d)\\b)`;
    const DATE_RANGE_REGEX = new RegExp(`(${DATE_POINT})\\s*[-–—to\\s]+\\s*(${DATE_POINT}|Present|Current|Now)\\b`, 'i');

    const entries: ParsedResumeData['experience'] = [];
    let current: {
      roleTitle: string;
      jobTitle?: string;
      company: string;
      employmentType?: string;
      startDate?: string;
      endDate?: string | null;
      isCurrent?: boolean;
      bullets: string[];
      description?: string;
      source: 'RESUME';
    } | null = null;

    for (let i = 0; i < linesToProcess.length; i++) {
      const rawLine = linesToProcess[i].trim();
      if (!rawLine) continue;

      const isBullet = /^[•*–—\-\d+.)]\s+/.test(rawLine) || rawLine.startsWith('•');
      const dateMatch = rawLine.match(DATE_RANGE_REGEX);
      const hasRoleKeyword = ROLE_KEYWORDS.test(rawLine);
      const hasAt = /\bat\b/i.test(rawLine);
      const hasDelim = /[\—\–\|]/.test(rawLine);

      // Check if this line is purely a standalone date line belonging to previous entry
      if (current && !current.startDate && dateMatch && rawLine.replace(DATE_RANGE_REGEX, '').trim().length < 5) {
        current.startDate = dateMatch[1].trim();
        current.endDate = /present|current|now/i.test(dateMatch[2]) ? 'Present' : dateMatch[2].trim();
        current.isCurrent = /present|current|now/i.test(dateMatch[2]);
        continue;
      }

      // Check if this line is an experience header
      const isHeader = !isBullet && (
        (dateMatch && (hasRoleKeyword || hasAt || hasDelim)) ||
        (hasAt && !isBullet) ||
        (hasRoleKeyword && hasDelim)
      );

      if (isHeader) {
        if (current) {
          entries.push(current);
        }

        let lineWithoutDate = rawLine;
        let startDate: string | undefined = undefined;
        let endDate: string | null = null;
        let isCurrent = false;

        if (dateMatch) {
          startDate = dateMatch[1].trim();
          endDate = /present|current|now/i.test(dateMatch[2]) ? 'Present' : dateMatch[2].trim();
          isCurrent = /present|current|now/i.test(dateMatch[2]);
          lineWithoutDate = rawLine.replace(dateMatch[0], '').replace(/^[|\—\–\-\s]+|[|\—\–\-\s]+$/g, '').trim();
        }

        let roleTitle = '';
        let company = '';

        if (/\bat\b/i.test(lineWithoutDate)) {
          const atParts = lineWithoutDate.split(/\bat\b/i);
          roleTitle = atParts[0].trim();
          company = atParts[1].replace(/^[|\—\–\-\s]+|[|\—\–\-\s]+$/g, '').trim();
        } else {
          const delims = [' | ', ' — ', ' – ', ' - ', '|', '—', '–'];
          let parts = [lineWithoutDate];
          for (const d of delims) {
            if (lineWithoutDate.includes(d)) {
              parts = lineWithoutDate.split(d).map(p => p.trim()).filter(Boolean);
              break;
            }
          }

          if (parts.length >= 2) {
            if (ROLE_KEYWORDS.test(parts[0]) && !ROLE_KEYWORDS.test(parts[1])) {
              roleTitle = parts[0];
              company = parts[1];
            } else if (ROLE_KEYWORDS.test(parts[1]) && !ROLE_KEYWORDS.test(parts[0])) {
              roleTitle = parts[1];
              company = parts[0];
            } else {
              roleTitle = parts[0];
              company = parts[1];
            }
          } else {
            roleTitle = parts[0];
            company = 'Organization';
          }
        }

        roleTitle = roleTitle.replace(/^[•*–—\-\s]+|[•*–—\-\s]+$/g, '').trim();
        company = company.replace(/^[•*–—\-\s]+|[•*–—\-\s]+$/g, '').trim();

        if (!roleTitle || roleTitle.length < 2) continue;

        let employmentType = 'Full-time';
        if (/intern/i.test(roleTitle) || /intern/i.test(rawLine)) employmentType = 'Internship';
        else if (/part[-\s]?time/i.test(roleTitle) || /part[-\s]?time/i.test(rawLine)) employmentType = 'Part-time';
        else if (/contract/i.test(roleTitle) || /contract/i.test(rawLine)) employmentType = 'Contract';
        else if (/freelance/i.test(roleTitle) || /freelance/i.test(rawLine)) employmentType = 'Freelance';

        current = {
          roleTitle,
          jobTitle: roleTitle,
          company: company || 'Organization',
          employmentType,
          startDate,
          endDate,
          isCurrent,
          bullets: [],
          description: '',
          source: 'RESUME',
        };
      } else if (current) {
        const cleanBullet = rawLine.replace(/^[•*–—\-\d+.)]\s*/, '').trim();
        if (cleanBullet.length > 0) {
          current.bullets.push(cleanBullet);
        }
      }
    }

    if (current) {
      entries.push(current);
    }

    for (const entry of entries) {
      if (entry.bullets && entry.bullets.length > 0) {
        entry.description = entry.bullets.join('\n');
      } else if (!entry.description) {
        entry.description = `Role: ${entry.roleTitle} at ${entry.company}`;
      }
    }

    return entries.slice(0, 5);
  }

  private static extractSkills(
    sections: Array<{ type: string; rawText: string; lines: string[] }>,
    fullText: string
  ): ParsedResumeData['skills'] {
    const detected: ParsedResumeData['skills'] = [];
    const skillSection = sections.find(s => s.type === 'SKILLS');
    const textToSearch = skillSection ? skillSection.rawText + '\n' + fullText : fullText;

    COMMON_SKILLS.forEach((skill) => {
      const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(textToSearch)) {
        let category = 'Programming';
        if (['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Figma', 'UI/UX Design', 'Tailwind', 'TailwindCSS', 'CSS', 'HTML'].includes(skill)) {
          category = 'Frontend / Design';
        }
        if (['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'].includes(skill)) {
          category = 'Cloud & DevOps';
        }
        if (['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Analysis'].includes(skill)) {
          category = 'AI / ML';
        }
        if (['Communication', 'Leadership', 'Project Management', 'Agile', 'Scrum'].includes(skill)) {
          category = 'Management & Soft Skills';
        }

        detected.push({
          name: skill,
          category,
          level: 'INTERMEDIATE',
          source: 'RESUME',
          verified: false,
        });
      }
    });

    return detected;
  }

  private static extractProjects(
    sections: Array<{ type: string; rawText: string; lines: string[] }>,
    fullText: string
  ): ParsedResumeData['projects'] {
    const projSection = sections.find(s => s.type === 'PROJECTS');
    const rawLines = projSection ? projSection.lines : [];

    if (rawLines.length > 0) {
      const projects: ParsedResumeData['projects'] = [];
      let current: {
        title: string;
        description: string;
        technologies: string[];
        githubUrl?: string;
        bullets: string[];
        source: 'RESUME';
      } | null = null;

      for (let i = 0; i < rawLines.length; i++) {
        const rawLine = rawLines[i].trim();
        if (!rawLine) continue;

        const isBullet = /^[•*–—\-\d+.)]\s+/.test(rawLine) || rawLine.startsWith('•');

        if (!isBullet) {
          if (current) {
            projects.push(current);
          }

          const pipeSegments = rawLine.split('|').map(s => s.trim()).filter(Boolean);
          let title = pipeSegments[0] || rawLine;
          let techSegment = pipeSegments[1] || '';

          let githubUrl: string | undefined = undefined;
          const ghUrlMatch = rawLine.match(/https?:\/\/github\.com\/[a-zA-Z0-9-_/]+/i);
          if (ghUrlMatch) {
            githubUrl = ghUrlMatch[0];
          }

          const technologies: string[] = [];
          if (techSegment) {
            const parts = techSegment.split(/,\s*/);
            for (const p of parts) {
              const cleanP = p.trim();
              if (cleanP && !/^(?:GitHub|Live Demo|Link)$/i.test(cleanP)) {
                technologies.push(cleanP);
              }
            }
          }

          if (technologies.length === 0) {
            for (const skill of COMMON_SKILLS) {
              const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              if (new RegExp(`\\b${escaped}\\b`, 'i').test(rawLine)) {
                if (!technologies.includes(skill)) technologies.push(skill);
              }
            }
          }

          title = title.replace(/^[•*–—\-\s]+|[•*–—\-\s]+$/g, '').trim();

          current = {
            title,
            description: '',
            technologies,
            githubUrl,
            bullets: [],
            source: 'RESUME',
          };
        } else if (current) {
          const cleanBullet = rawLine.replace(/^[•*–—\-\d+.)]\s*/, '').trim();
          if (cleanBullet.length > 0) {
            current.bullets.push(cleanBullet);
          }
        }
      }

      if (current) {
        projects.push(current);
      }

      for (const proj of projects) {
        if (proj.bullets && proj.bullets.length > 0) {
          proj.description = proj.bullets.join('\n');
        }
      }

      return projects.slice(0, 6);
    }

    // Fallback: If no explicit PROJECTS section was found, check for GitHub repos
    const projects: ParsedResumeData['projects'] = [];
    const githubMatch = fullText.match(/https?:\/\/github\.com\/[a-zA-Z0-9-_]+\/([a-zA-Z0-9-_]+)/i);
    if (githubMatch) {
      const repoName = githubMatch[1] || 'Portfolio Project';
      const detectedTech: string[] = [];
      COMMON_SKILLS.forEach((s) => {
        if (new RegExp(`\\b${s}\\b`, 'i').test(fullText) && detectedTech.length < 4) {
          detectedTech.push(s);
        }
      });

      projects.push({
        title: repoName.replace(/[-_]/g, ' '),
        description: `Open-source project hosted on GitHub at ${githubMatch[0]}`,
        technologies: detectedTech,
        githubUrl: githubMatch[0],
        source: 'RESUME',
      });
    }

    return projects;
  }

  private static extractCertifications(
    sections: Array<{ type: string; rawText: string; lines: string[] }>,
    fullText: string
  ): ParsedResumeData['certifications'] {
    const certs: ParsedResumeData['certifications'] = [];
    const certSection = sections.find(s => s.type === 'CERTIFICATIONS');

    if (certSection && certSection.lines.length > 0) {
      for (const rawLine of certSection.lines) {
        const line = rawLine.replace(/^[\s•*–\-\d.)]+/, '').trim();
        if (!line || line.length < 3) continue;

        const separatorMatch = line.match(/\s+([–—|-]|by|from|at)\s+/i);
        let name = line;
        let issuingOrganization = '';

        if (separatorMatch && typeof separatorMatch.index === 'number') {
          name = line.substring(0, separatorMatch.index).trim();
          issuingOrganization = line.substring(separatorMatch.index + separatorMatch[0].length).trim();
        } else if (line.includes(' - ')) {
          const parts = line.split(' - ');
          name = parts[0].trim();
          issuingOrganization = parts.slice(1).join(' - ').trim();
        } else if (line.includes(' – ')) {
          const parts = line.split(' – ');
          name = parts[0].trim();
          issuingOrganization = parts.slice(1).join(' – ').trim();
        } else if (line.includes(' | ')) {
          const parts = line.split(' | ');
          name = parts[0].trim();
          issuingOrganization = parts.slice(1).join(' | ').trim();
        }

        const dateMatch = (issuingOrganization || name).match(/\b(19\d\d|20\d\d)\b/);
        const issueDate = dateMatch ? dateMatch[0] : undefined;

        certs.push({
          name,
          issuingOrganization,
          issueDate,
          source: 'RESUME',
        });
      }
      return certs;
    }

    // Fallback if no explicit CERTIFICATIONS header exists: scan for known industry certifications
    const certNames = ['AWS Certified', 'Google Cloud Certified', 'Azure Fundamentals', 'Meta Front-End Developer', 'Certified Scrum Master'];
    certNames.forEach((cert) => {
      if (fullText.toLowerCase().includes(cert.toLowerCase())) {
        certs.push({
          name: cert,
          issuingOrganization: cert.includes('AWS') ? 'Amazon Web Services' : cert.includes('Google') ? 'Google' : cert.includes('Azure') ? 'Microsoft' : 'Coursera',
          source: 'RESUME',
        });
      }
    });

    return certs;
  }

  private static extractLinks(text: string): ParsedResumeData['professionalLinks'] {
    const links: ParsedResumeData['professionalLinks'] = [];
    const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+/i);
    if (linkedinMatch) {
      links.push({ platform: 'LinkedIn', url: linkedinMatch[0] });
    }

    const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-_]+/i);
    if (githubMatch) {
      links.push({ platform: 'GitHub', url: githubMatch[0] });
    }

    const portfolioMatch = text.match(/https?:\/\/[a-zA-Z0-9-_]+\.(dev|io|me|com)/i);
    if (portfolioMatch && !portfolioMatch[0].includes('linkedin') && !portfolioMatch[0].includes('github')) {
      links.push({ platform: 'Portfolio', url: portfolioMatch[0] });
    }

    return links;
  }
}
