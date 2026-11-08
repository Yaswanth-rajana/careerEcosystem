export type SectionType =
  | 'CONTACT'
  | 'SUMMARY'
  | 'EDUCATION'
  | 'EXPERIENCE'
  | 'INTERNSHIPS'
  | 'PROJECTS'
  | 'CERTIFICATIONS'
  | 'SKILLS'
  | 'ACHIEVEMENTS'
  | 'LANGUAGES'
  | 'PUBLICATIONS'
  | 'UNKNOWN';

export interface ResumeSection {
  type: SectionType;
  header: string;
  rawText: string;
  lines: string[];
}

export class SectionSplitter {
  private static readonly SECTION_PATTERNS: Array<{
    type: SectionType;
    regex: RegExp;
  }> = [
    {
      type: 'INTERNSHIPS',
      regex: /^(?:INTERNSHIPS?|INTERNSHIP EXPERIENCE|INTERNSHIP DETAILS)$/i,
    },
    {
      type: 'EDUCATION',
      regex: /^(?:EDUCATION|ACADEMIC BACKGROUND|ACADEMIC PROFILE|ACADEMIC QUALIFICATIONS?|EDUCATIONAL BACKGROUND|QUALIFICATIONS)$/i,
    },
    {
      type: 'EXPERIENCE',
      regex: /^(?:EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|CAREER EXPERIENCE|PROFESSIONAL BACKGROUND|EMPLOYMENT|EMPLOYMENT HISTORY|WORK HISTORY|WORK BACKGROUND|RELEVANT EXPERIENCE|WHERE I HAVE WORKED|WHERE I'VE WORKED|WHERE I WORKED|WHERE I'VE MADE AN IMPACT|WHERE I MADE AN IMPACT|CAREER HISTORY|PREVIOUS ROLES)$/i,
    },
    {
      type: 'CERTIFICATIONS',
      regex: /^(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES\s*(?:&|AND)\s*CERTIFICATIONS?|COURSES\s*(?:&|AND)\s*CERTIFICATIONS?|PROFESSIONAL CERTIFICATIONS?)$/i,
    },
    {
      type: 'PROJECTS',
      regex: /^(?:PROJECTS?|TECHNICAL PROJECTS?|PERSONAL PROJECTS?|ACADEMIC PROJECTS?|KEY PROJECTS?|FEATURED PROJECTS?|RESEARCH PROJECTS?|THINGS I BUILT|THINGS I'VE BUILT|WHAT I BUILT|WHAT I'VE BUILT|PORTFOLIO PROJECTS?|SELECTED PROJECTS?)$/i,
    },
    {
      type: 'SKILLS',
      regex: /^(?:SKILLS?|TECHNICAL SKILLS?|CORE COMPETENCIES|AREAS OF EXPERTISE|KEY SKILLS?|TECHNOLOGIES|TECHNICAL EXPERTISE|TOOLBOX|TECHNICAL TOOLBOX|DEVELOPER TOOLBOX|TECH STACK)$/i,
    },
    {
      type: 'ACHIEVEMENTS',
      regex: /^(?:ACHIEVEMENTS?|AWARDS?|HONORS?\s*(?:&|AND)\s*AWARDS?|AWARDS\s*(?:&|AND)\s*ACHIEVEMENTS?|ACCOMPLISHMENTS?|EXTRACURRICULAR ACTIVITIES?)$/i,
    },
    {
      type: 'LANGUAGES',
      regex: /^(?:LANGUAGES?|LANGUAGES KNOWN|SPOKEN LANGUAGES)$/i,
    },
    {
      type: 'PUBLICATIONS',
      regex: /^(?:PUBLICATIONS?|RESEARCH PAPERS?|CONFERENCE PROCEEDINGS?)$/i,
    },
    {
      type: 'SUMMARY',
      regex: /^(?:SUMMARY|PROFESSIONAL SUMMARY|CAREER OBJECTIVE|OBJECTIVE|PROFILE|ABOUT ME)$/i,
    },
  ];

  /**
   * Splits normalized resume text into classified semantic sections.
   */
  static splitIntoSections(text: string): ResumeSection[] {
    const lines = text.split(/\r?\n/);
    const sections: ResumeSection[] = [];

    let currentType: SectionType = 'CONTACT';
    let currentHeader = 'CONTACT';
    let currentLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const cleanHeader = line
        .replace(/^[#*•\-_=~|]+\s*/, '')
        .replace(/\s*[:|~=_-]+\s*$/, '')
        .trim();

      // Check if this line is an exact section heading match
      const matched = this.SECTION_PATTERNS.find(
        (sp) => sp.regex.test(cleanHeader) || sp.regex.test(cleanHeader.replace(/^[0-9.]+\s*/, ''))
      );

      // Section headings are typically short (<= 45 chars) and stand alone
      const isHeading = Boolean(
        matched &&
        cleanHeader.length <= 45 &&
        !line.includes('.com') &&
        !line.includes('@') &&
        !line.includes('http') &&
        !line.includes('www.') &&
        !/[.,;?!]$/.test(cleanHeader)
      );

      if (isHeading && matched) {
        if (currentLines.length > 0) {
          sections.push({
            type: currentType,
            header: currentHeader,
            rawText: currentLines.join('\n'),
            lines: [...currentLines],
          });
        }
        currentType = matched.type;
        currentHeader = cleanHeader;
        currentLines = [];
      } else {
        currentLines.push(rawLine);
      }
    }

    if (currentLines.length > 0) {
      sections.push({
        type: currentType,
        header: currentHeader,
        rawText: currentLines.join('\n'),
        lines: [...currentLines],
      });
    }

    return sections;
  }
}

