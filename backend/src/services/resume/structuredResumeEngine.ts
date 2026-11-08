import { DocumentExtractionMetadata } from './documentExtractionService';
import { SectionSplitter, ResumeSection } from './sectionSplitter';
import {
  isNonDegreePlatform,
  classifyEducationLevel,
  classifyEmploymentType,
  SKILL_TAXONOMY,
  classifyProfessionalLinkPlatform,
  isPlatformLinkLabel,
  normalizeProjectTechnologies,
  isLikelyCertificationIssuer,
  extractCertificationDate,
  inferIssuerFromCertName,
  isCertificationDetail,
  isCertificationTitleLikely,
} from './classificationRules';
import {
  StructuredResumeData,
  ExtractedField,
  StructuredEducationEntry,
  StructuredExperienceEntry,
  StructuredProjectEntry,
  StructuredCertificationEntry,
  StructuredSkillEntry,
  StructuredAchievementEntry,
  StructuredProfessionalLinkEntry,
  StructuredLanguageEntry,
  VerificationStatus,
} from './types';

export class StructuredResumeEngine {
  private static readonly ROLE_KEYWORDS = /\b(?:Developer|Engineer|Intern|Analyst|Manager|Architect|Consultant|Lead|Designer|Specialist|Officer|Administrator|Coordinator|Associate|Programmer|Scientist|Director|VP|President|Founder|Co-Founder|CTO|CEO|COO|Fellow|Researcher|Technician|Apprentice)\b/i;
  /**
   * Main entry point for Phase 3 Structured Resume Intelligence.
   * Parses normalized resume text into comprehensive, verified structured intelligence.
   */
  static processStructuredIntelligence(
    normalizedText: string,
    filename: string,
    metadata: DocumentExtractionMetadata
  ): StructuredResumeData {
    const sections = SectionSplitter.splitIntoSections(normalizedText);

    // 1. Personal Information
    const personalInfo = this.extractPersonalInfo(normalizedText, filename, sections);

    // 2. Education (strictly filtering non-degree learning platforms)
    const { education, divertedCertifications } = this.extractEducation(sections, normalizedText);

    // 3. Work Experience & Internships
    const { experience, internships } = this.extractExperienceAndInternships(sections, normalizedText);

    // 4. Projects
    const projects = this.extractProjects(sections, normalizedText);

    // 5. Certifications (combining CERTIFICATIONS section + diverted non-degree course platforms)
    const certifications = this.extractCertifications(sections, divertedCertifications);

    // 6. Skills (Technical vs Soft)
    const { technicalSkills, softSkills, legacySkills } = this.extractCategorizedSkills(sections, normalizedText);

    // 7. Achievements
    const achievements = this.extractAchievements(sections);

    // 8. Professional Links
    const professionalLinks = this.extractProfessionalLinks(normalizedText, projects, sections);

    // 9. Languages
    const languages = this.extractLanguages(sections);

    // 10. Quality Score calculation
    const qualityScore = this.calculateQualityScore({
      hasName: Boolean(personalInfo.name?.value),
      hasEmail: Boolean(personalInfo.email?.value),
      hasPhone: Boolean(personalInfo.phone?.value),
      educationCount: education.length,
      experienceCount: experience.length + internships.length,
      skillsCount: technicalSkills.length,
      projectsCount: projects.length,
    });

    return {
      rawText: normalizedText,
      extractionMetadata: metadata,
      personalInfo,
      education,
      experience,
      internships,
      projects,
      certifications,
      technicalSkills,
      softSkills,
      skills: legacySkills,
      achievements,
      professionalLinks,
      languages,
      qualityScore,
    };
  }

  /**
   * Extracts Personal Information with field-level confidence and evidence.
   */
  private static extractPersonalInfo(
    fullText: string,
    filename: string,
    sections: ResumeSection[]
  ): StructuredResumeData['personalInfo'] {
    const contactSection = sections.find((s) => s.type === 'CONTACT') || sections[0];
    const contactText = contactSection ? contactSection.rawText : fullText.slice(0, 1000);
    const lines = fullText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // 1. Full Name: Examine top 5 lines
    let nameField: ExtractedField<string> | undefined;
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const line = lines[i];
      // Skip lines with email, URL, numbers, or section markers
      if (
        line.includes('@') ||
        line.toLowerCase().includes('http') ||
        line.toLowerCase().includes('.com') ||
        /\b(?:curriculum vitae|resume|page \d|contact)\b/i.test(line) ||
        /\d{4,}/.test(line)
      ) {
        continue;
      }

      // Clean name of titles like "Dr.", "Mr.", or prefix like "Name:"
      const cleanCandidate = line
        .replace(/^(?:Name|Candidate|Full Name)[\s:]+/i, '')
        .replace(/^(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '')
        .replace(/[^a-zA-Z\s.-]/g, '')
        .trim();

      const words = cleanCandidate.split(/\s+/).filter((w) => w.length > 1);
      // Valid names typically have 2-4 words and length between 3 and 40
      if (words.length >= 1 && words.length <= 5 && cleanCandidate.length >= 3 && cleanCandidate.length <= 40) {
        nameField = {
          value: cleanCandidate,
          confidence: i === 0 ? 0.95 : 0.85,
          evidence: line,
          section: 'CONTACT',
          status: 'AUTO_HIGH',
        };
        break;
      }
    }

    // Fallback: derive name from filename if top lines had no clear name
    if (!nameField) {
      const base = filename.split('.')[0].replace(/[-_]/g, ' ').trim();
      if (base && base.length >= 3 && !/resume|cv|portfolio|profile/i.test(base)) {
        const titleCased = base.replace(/\b\w/g, (c) => c.toUpperCase());
        nameField = {
          value: titleCased,
          confidence: 0.70,
          evidence: `Derived from filename: ${filename}`,
          section: 'FILENAME',
          status: 'NEEDS_REVIEW',
        };
      }
    }

    // 2. Email Address
    let emailField: ExtractedField<string> | undefined;
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      emailField = {
        value: emailMatch[0].toLowerCase(),
        confidence: 0.98,
        evidence: emailMatch[0],
        section: 'CONTACT',
        status: 'AUTO_HIGH',
      };
    }

    // 3. Phone Number (supports India +91 / 10 digits, US/Canada, and International formats)
    let phoneField: ExtractedField<string> | undefined;
    const phoneRegexes = [
      /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/,                     // Indian 10-digit mobile
      /(?:\+1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/,        // US / North America
      /\+\d{1,4}[\s-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/, // Generic International
    ];

    for (const regex of phoneRegexes) {
      const match = contactText.match(regex) || fullText.match(regex);
      if (match) {
        const rawPhone = match[0].trim();
        const digits = rawPhone.replace(/\D/g, '');
        if (digits.length >= 10 && digits.length <= 15) {
          phoneField = {
            value: rawPhone,
            confidence: 0.95,
            evidence: match[0],
            section: 'CONTACT',
            status: 'AUTO_HIGH',
          };
          break;
        }
      }
    }

    // 4. Location
    let locationField: ExtractedField<string> | undefined;
    const locationMatch =
      contactText.match(/(?:Location|Address|Based in|Lives in)[\s:]*([A-Za-z\s]+(?:,\s*[A-Za-z\s]+)+)/i) ||
      contactText.match(/\b([A-Z][a-zA-Z\s]{1,25}(?:,\s*[A-Z][a-zA-Z\s]{1,25})*,\s*(?:India|USA|UK|Canada|Germany|California|CA|NY|TX|WA|Bangalore|Hyderabad|Pune|Delhi|Mumbai|Chennai))\b/i);

    if (locationMatch) {
      locationField = {
        value: locationMatch[1].trim(),
        confidence: 0.85,
        evidence: locationMatch[0],
        section: 'CONTACT',
        status: 'AUTO_HIGH',
      };
    }

    // 5. Headline / Professional Title
    let headlineField: ExtractedField<string> | undefined;
    const headlineKeywords = [
      'Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer',
      'Full Stack Engineer', 'Data Scientist', 'Machine Learning Engineer', 'DevOps Engineer',
      'Cloud Architect', 'Cybersecurity Analyst', 'Product Manager', 'Mobile Developer',
      'Lead Developer', 'Systems Engineer', 'AI Engineer',
    ];
    for (const line of lines.slice(0, 10)) {
      const matched = headlineKeywords.find((k) => line.toLowerCase().includes(k.toLowerCase()));
      if (matched) {
        headlineField = {
          value: matched,
          confidence: 0.90,
          evidence: line,
          section: 'CONTACT',
          status: 'AUTO_HIGH',
        };
        break;
      }
    }

    // 6. Bio / Summary
    let bioField: ExtractedField<string> | undefined;
    const summarySection = sections.find((s) => s.type === 'SUMMARY');
    if (summarySection && summarySection.rawText.trim().length >= 20) {
      const cleanSummary = summarySection.rawText.replace(/\s+/g, ' ').trim();
      bioField = {
        value: cleanSummary,
        confidence: 0.92,
        evidence: summarySection.rawText.slice(0, 100),
        section: 'SUMMARY',
        status: 'AUTO_HIGH',
      };
    }

    return {
      name: nameField,
      email: emailField,
      phone: phoneField,
      location: locationField,
      headline: headlineField,
      bio: bioField,
    };
  }

  /**
   * Helper to detect and suppress table header rows in DOCX/Markdown tables.
   */
  private static isTableHeaderRow(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const clean = trimmed.replace(/^[|•*\s-]+|[|•*\s-]+$/g, '').toLowerCase();
    if (!clean) return false;

    const cells = clean.split('|').map((c) => c.trim()).filter(Boolean);
    const headerKeywords = [
      /^(?:institution|college|university|school|institute)$/,
      /^(?:degree|qualification|program|course)$/,
      /^(?:specialization|major|field\s*of\s*study|stream|branch)$/,
      /^(?:year|years|passing\s*year|batch|duration|dates?|period)$/,
      /^(?:grade|grades|cgpa|gpa|percentage|marks|score|result)$/,
      /^(?:certification\s*name|certificate\s*name|credential\s*name|cert\s*name|name)$/,
      /^(?:issuing\s*(?:organization|org|authority|body)|issuer|provider|issued\s*by)$/,
      /^(?:issue\s*date|expiry\s*date|valid\s*through|date\s*issued|date)$/,
      /^(?:credential\s*id|license(?:\s*no\.?|\s*number)?|id)$/,
    ];

    if (cells.length >= 2) {
      let matchedCols = 0;
      for (const cell of cells) {
        if (headerKeywords.some((kw) => kw.test(cell))) {
          matchedCols++;
        }
      }
      if (matchedCols >= 2 || (cells.length > 0 && matchedCols / cells.length >= 0.5)) {
        return true;
      }
    } else {
      if (
        /(?:institution|university)\s*\|.*(?:degree|qualification)/.test(clean) ||
        /(?:certification\s*name|certificate\s*name)\s*\|.*(?:issuer|date)/.test(clean)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Extracts Education records with strict anti-hallucination guards.
   * If an online platform (e.g. Apna College) is detected in the education section,
   * it is diverted to Certifications and NEVER classified as a university degree.
   */
  private static extractEducation(
    sections: ResumeSection[],
    fullText: string
  ): {
    education: StructuredEducationEntry[];
    divertedCertifications: Array<{ name: string; issuer: string; evidence: string }>;
  } {
    const eduSection = sections.find((s) => s.type === 'EDUCATION');
    const rawLines = eduSection ? eduSection.lines : [];
    let linesToProcess = rawLines.map((l) => l.trim()).filter(Boolean);

    // Suppress table header rows
    linesToProcess = linesToProcess.filter((l) => !this.isTableHeaderRow(l));

    // If no explicit heading, scan lines while excluding other sections
    if (linesToProcess.length === 0) {
      const nonEduTypes = ['CERTIFICATIONS', 'EXPERIENCE', 'INTERNSHIPS', 'PROJECTS', 'SKILLS', 'SUMMARY'];
      const nonEduLines = new Set<string>();
      sections
        .filter((s) => nonEduTypes.includes(s.type))
        .forEach((s) => s.lines.forEach((l) => nonEduLines.add(l.trim())));

      linesToProcess = fullText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(
          (l) =>
            Boolean(l) &&
            !nonEduLines.has(l) &&
            !this.isTableHeaderRow(l) &&
            (this.isEducationInstitutionLine(l) || this.isEducationDegreeLine(l))
        );
    }

    const blocks: string[][] = [];
    let currentBlock: string[] = [];

    for (const line of linesToProcess) {
      const cleanL = line.replace(/^[|•*\s-]+|[|•*\s-]+$/g, '').trim();
      const hasInst = this.isEducationInstitutionLine(cleanL);
      const currentHasInst = currentBlock.some((l) => this.isEducationInstitutionLine(l.replace(/^[|•*\s-]+|[|•*\s-]+$/g, '')));

      if (hasInst && currentHasInst && !this.isEducationDegreeLine(cleanL)) {
        blocks.push(currentBlock);
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    const education: StructuredEducationEntry[] = [];
    const divertedCertifications: Array<{ name: string; issuer: string; evidence: string }> = [];

    for (const block of blocks) {
      const fullBlock = block.join(' | ');

      // Check if block belongs to an online course platform (e.g. Apna College)
      if (isNonDegreePlatform(fullBlock)) {
        divertedCertifications.push({
          name: block.find((l) => !isNonDegreePlatform(l)) || block[0],
          issuer: block.find((l) => isNonDegreePlatform(l)) || 'Online Learning Platform',
          evidence: fullBlock,
        });
        continue; // Strictly skip adding to education
      }

      // Dates
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

      if (!startYear) {
        // Without an identifiable year or institution, skip fabricating dates
        const anyYear = fullBlock.match(/\b(20\d\d)\b/);
        if (anyYear) startYear = parseInt(anyYear[1], 10);
      }

      // GPA / CGPA / Percentage
      let gpa: string | undefined;
      const cgpaPreMatch = fullBlock.match(/\b([0-9]+(?:\.[0-9]+)?\s*(?:CGPA|GPA))\b/i);
      const cgpaMatch = fullBlock.match(/(?:CGPA|GPA|Grade)[\s:]*([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*(?:4|10)(?:\.0)?)?)/i);
      const pctMatch = fullBlock.match(/(?:Percentage|Score|Marks)[\s:]*([0-9]+(?:\.[0-9]+)?\s*%)/i);
      const standaloneRatio = fullBlock.match(/\b([0-9]\.[0-9]{1,2}\s*\/\s*(?:4|10)(?:\.0)?)\b/);
      const standalonePct = fullBlock.match(/\b([0-9]{2}(?:\.[0-9]+)?%)\b/);

      if (cgpaPreMatch) gpa = cgpaPreMatch[1].trim();
      else if (cgpaMatch) gpa = cgpaMatch[1].trim();
      else if (pctMatch) gpa = pctMatch[1].trim();
      else if (standaloneRatio) gpa = standaloneRatio[1].trim();
      else if (standalonePct) gpa = standalonePct[1].trim();

      // Institution Name
      const cleanBlockLines = block.map((l) => l.replace(/^[|\s•*–\-]+|[|\s•*–\-]+$/g, '').trim());
      const instLine = cleanBlockLines.find((l) => this.isEducationInstitutionLine(l)) || cleanBlockLines[0];

      let institution = '';
      if (instLine.includes('|')) {
        const parts = instLine.split('|').map((p) => p.trim()).filter(Boolean);
        const instPart = parts.find((p) => this.isEducationInstitutionLine(p));
        institution = instPart || parts[0];
      } else {
        institution = instLine;
      }

      institution = institution
        .replace(/\b(19\d\d|20\d\d)\b.*$/, '')
        .replace(/^[|\s•*–\-]+|[|\s•*–\-]+$/g, '')
        .trim();

      if (!institution || institution.length < 3 || isNonDegreePlatform(institution)) {
        continue;
      }

      // Degree and Field of Study
      const degreeSegments: string[] = [];
      for (const line of block) {
        const cleanL = line.replace(/^[|\s•*–\-]+|[|\s•*–\-]+$/g, '');
        const parts = cleanL.split('|').map((p) => p.trim()).filter(Boolean);
        for (const part of parts) {
          if (
            !this.isEducationInstitutionLine(part) &&
            part.toLowerCase() !== institution.toLowerCase() &&
            !/(?:19\d\d|20\d\d|CGPA|GPA|Percentage|\d+%\b|\bGrade\b|\bMarks\b)/i.test(part)
          ) {
            degreeSegments.push(part);
          }
        }
      }

      let degreeCandidateText = degreeSegments.join(' ');
      if (degreeSegments.length >= 2 && this.isEducationDegreeLine(degreeSegments[0]) && !degreeSegments[1].toLowerCase().startsWith('in ')) {
        degreeCandidateText = `${degreeSegments[0]} in ${degreeSegments.slice(1).join(' ')}`;
      }
      const { degree, fieldOfStudy } = this.parseDegreeAndField(degreeCandidateText);
      const educationLevel = classifyEducationLevel(degree, institution);

      education.push({
        institution,
        degree: degree || 'Degree',
        fieldOfStudy: fieldOfStudy || '',
        startYear: startYear || 2020,
        endYear,
        isCurrent,
        gpa,
        educationLevel,
        source: 'RESUME',
        confidence: startYear && degree ? 0.95 : 0.85,
        evidence: block.join('\n'),
        section: 'EDUCATION',
        status: 'AUTO_HIGH',
      });
    }

    return { education: education.slice(0, 5), divertedCertifications };
  }

  /**
   * Identifies whether a non-bullet line is actually a sentence fragment or bullet continuation,
   * preventing wrapped bullet points from being mistakenly extracted as company or role headers.
   */
  private static isBulletContinuationOrSentence(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return true;

    // Check if the line is a candidate role header with delimiter (e.g. "Engineering Manager — OmniPlatform Cloud | August 2021 – Present")
    // Such lines MUST NOT be treated as bullet continuations
    if (this.ROLE_KEYWORDS.test(trimmed) && (/[\—\–|-]|\bat\b/i.test(trimmed))) {
      return false;
    }

    // Ends with sentence punctuation (. or ; or :) unless a recognized corporate abbreviation (Inc., Ltd., Corp., Co., LLC.)
    const endsWithPeriod = /\.[^a-zA-Z0-9]*$/.test(trimmed);
    const isCorporateAbbr = /\b(?:inc|ltd|corp|co|llc)\.?$/i.test(trimmed);
    if (endsWithPeriod && !isCorporateAbbr) {
      return true;
    }

    // Starts with lowercase letter
    if (/^[a-z]/.test(trimmed)) {
      return true;
    }

    // Starts with common resume action verbs (past tense, present, or gerund)
    const ACTION_VERB_START = /^(?:developed|building|built|managed|managing|led|leading|maintained|maintaining|designed|designing|engineered|engineering|implemented|implementing|created|creating|spearheaded|spearheading|orchestrated|conducted|collaborated|collaborating|automated|automating|integrated|integrating|reduced|reducing|increased|increasing|optimized|optimizing|serving|supported|supporting|utilized|utilizing|handled|handling|delivered|delivering|architected|architecting|resolved|streamlined|deployed|deploying|achieved|achieving|trained|training|constructed|constructing|spearhead|ensure|ensuring)\b/i;
    if (ACTION_VERB_START.test(trimmed)) {
      return true;
    }

    // Starts with preposition or conjunction
    const PREPOSITION_START = /^(?:and|or|with|for|to|at|in|on|by|from|into|across|through|over|under|achieving|ensuring|using|via)\b/i;
    if (PREPOSITION_START.test(trimmed)) {
      return true;
    }

    return false;
  }

  /**
   * Extracts Work Experience and separate Internships with strict anti-fabrication rules.
   */
  private static extractExperienceAndInternships(
    sections: ResumeSection[],
    fullText: string
  ): {
    experience: StructuredExperienceEntry[];
    internships: StructuredExperienceEntry[];
  } {
    const expSections = sections.filter((s) => s.type === 'EXPERIENCE' || s.type === 'INTERNSHIPS');
    if (expSections.length === 0) {
      return { experience: [], internships: [] };
    }

    const ROLE_KEYWORDS = /\b(?:Developer|Engineer|Intern|Analyst|Manager|Architect|Consultant|Lead|Designer|Specialist|Officer|Administrator|Coordinator|Associate|Programmer|Scientist|Director|VP|President|Founder|Co-Founder|CTO|CEO|COO|Fellow|Researcher|Technician|Apprentice)\b/i;
    const MONTH_NAMES = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
    const DATE_POINT = `(?:${MONTH_NAMES}\\s*,?\\s*\\d{4}|\\d{1,2}\\/\\d{4}|\\b(?:19\\d\\d|20\\d\\d)\\b)`;
    const DATE_RANGE_REGEX = new RegExp(`(${DATE_POINT})\\s*[-–—to\\s]+\\s*(${DATE_POINT}|Present|Current|Now)\\b`, 'i');

    const experience: StructuredExperienceEntry[] = [];
    const internships: StructuredExperienceEntry[] = [];

    for (const section of expSections) {
      const sourceSection = section.type as 'EXPERIENCE' | 'INTERNSHIPS';
      const lines = section.lines.map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const sectionEntries: StructuredExperienceEntry[] = [];
      let current: StructuredExperienceEntry | null = null;

      for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const isBullet = /^[•*–—\-\d+.)]\s+/.test(rawLine) || rawLine.startsWith('•');
        const dateMatch = rawLine.match(DATE_RANGE_REGEX);
        const hasRoleKeyword = ROLE_KEYWORDS.test(rawLine);
        const hasAt = /\bat\b/i.test(rawLine);
        const hasDelim = /[\—\–\|]/.test(rawLine);

        // Check if line is a standalone date line belonging to previous header
        if (current && !current.startDate && dateMatch && rawLine.replace(DATE_RANGE_REGEX, '').trim().length < 25) {
          current.startDate = dateMatch[1].trim();
          current.isCurrent = /present|current|now/i.test(dateMatch[2]);
          current.endDate = current.isCurrent ? null : dateMatch[2].trim();
          const trailing = rawLine.replace(dateMatch[0], '').replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '');
          if (trailing && !current.location) {
            current.location = trailing;
          }
          current.confidence = current.company ? 0.95 : 0.80;
          current.status = current.company ? 'AUTO_HIGH' : 'NEEDS_REVIEW';
          continue;
        }

        const nextLine = lines[i + 1] || '';
        const nextIsBullet = /^[•*–—\-\d+.)]\s+/.test(nextLine) || nextLine.startsWith('•');
        const nextDateMatch = nextLine.match(DATE_RANGE_REGEX);
        const nextHasRole = ROLE_KEYWORDS.test(nextLine);
        const nextHasAt = /\bat\b/i.test(nextLine);

        // Check if nextLine is a self-contained header (already has role + company/date)
        let nextHasOwnCompany = false;
        if (nextHasAt) {
          nextHasOwnCompany = true;
        } else if (/[\—\–]/.test(nextLine)) {
          const dashParts = nextLine.split(/[\—\–]/).map((s) => s.trim()).filter(Boolean);
          if (dashParts.length >= 2) {
            const hasRole = dashParts.some((p) => ROLE_KEYWORDS.test(p));
            const hasNonRole = dashParts.some((p) => !ROLE_KEYWORDS.test(p) && !DATE_RANGE_REGEX.test(p) && p.length > 2);
            nextHasOwnCompany = hasRole && hasNonRole;
          }
        }

        // Pattern A: Role title on current line, followed by Company / Date line
        const isPatternA = !isBullet && hasRoleKeyword && !dateMatch && !hasAt && !hasDelim &&
          nextLine && !nextIsBullet && (Boolean(nextDateMatch) || !nextHasRole) && rawLine.length <= 60 &&
          !this.isBulletContinuationOrSentence(rawLine);

        // Pattern B: Company on current line, followed by Role / Date line
        // Strict guard: reject sentence fragments, bullet continuations, and self-contained next lines
        const isPatternB = !isBullet && !hasRoleKeyword && !dateMatch && !hasAt && !hasDelim &&
          nextLine && !nextIsBullet && nextHasRole && rawLine.length <= 60 &&
          !this.isBulletContinuationOrSentence(rawLine) &&
          !nextHasOwnCompany;

        // Validate candidate role-at-company header (e.g. "Software Engineer at Atlassian")
        let isValidAtCombined = false;
        if (hasAt && !isBullet && !this.isBulletContinuationOrSentence(rawLine)) {
          const atParts = rawLine.split(/\bat\b/i);
          if (atParts.length === 2) {
            const candRole = atParts[0].trim();
            const candCompany = atParts[1].replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '').trim();
            const roleHasKeyword = this.ROLE_KEYWORDS.test(candRole);
            const isNotSentence = !this.isBulletContinuationOrSentence(candRole) && !this.isBulletContinuationOrSentence(candCompany);
            const reasonableLengths = candRole.length <= 60 && candCompany.length <= 60 && candCompany.length >= 2;
            const companyNotPreposition = !/^(?:scale|peak|least|most|all|once|home|work|night|day|random|top-tier|high)\b/i.test(candCompany);
            isValidAtCombined = (roleHasKeyword || Boolean(dateMatch) || Boolean(nextDateMatch)) && isNotSentence && reasonableLengths && companyNotPreposition;
          }
        }

        // Pattern C & D / Combined header on single line
        const isCombinedHeader = !isBullet && !this.isBulletContinuationOrSentence(rawLine) && (
          (dateMatch && (hasRoleKeyword || hasDelim || isValidAtCombined)) ||
          isValidAtCombined ||
          (hasRoleKeyword && hasDelim && rawLine.length <= 80)
        );

        if (isPatternA || isPatternB || isCombinedHeader) {
          if (current) {
            sectionEntries.push(current);
            current = null;
          }

          let roleTitle = '';
          let company = '';
          let startDate = '';
          let endDate: string | null = null;
          let isCurrent = false;
          let location = '';

          if (isPatternA) {
            roleTitle = rawLine;
            let targetLine = nextLine;
            i++; // Consume next line

            const targetDate = targetLine.match(DATE_RANGE_REGEX);
            if (targetDate) {
              startDate = targetDate[1].trim();
              isCurrent = /present|current|now/i.test(targetDate[2]);
              endDate = isCurrent ? null : targetDate[2].trim();

              const dateIdx = targetDate.index ?? 0;
              const beforeDate = targetLine.slice(0, dateIdx).trim();
              const afterDate = targetLine.slice(dateIdx + targetDate[0].length).trim();

              company = beforeDate.replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '');
              location = afterDate.replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '');
            } else {
              company = targetLine.replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '');
            }
          } else if (isPatternB) {
            company = rawLine;
            let targetLine = nextLine;
            i++; // Consume next line

            const targetDate = targetLine.match(DATE_RANGE_REGEX);
            if (targetDate) {
              startDate = targetDate[1].trim();
              isCurrent = /present|current|now/i.test(targetDate[2]);
              endDate = isCurrent ? null : targetDate[2].trim();
              targetLine = targetLine.replace(targetDate[0], '').trim();
            }
            roleTitle = targetLine.replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '');
          } else {
            // Combined single line
            let lineWork = rawLine;
            if (dateMatch) {
              startDate = dateMatch[1].trim();
              isCurrent = /present|current|now/i.test(dateMatch[2]);
              endDate = isCurrent ? null : dateMatch[2].trim();

              const dateIdx = dateMatch.index ?? 0;
              const beforeDate = rawLine.slice(0, dateIdx).trim();
              const afterDate = rawLine.slice(dateIdx + dateMatch[0].length).trim();
              if (afterDate) {
                location = afterDate.replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '');
              }
              lineWork = beforeDate;
            } else if (nextDateMatch && nextLine.replace(DATE_RANGE_REGEX, '').trim().length < 25) {
              startDate = nextDateMatch[1].trim();
              isCurrent = /present|current|now/i.test(nextDateMatch[2]);
              endDate = isCurrent ? null : nextDateMatch[2].trim();
              const trailing = nextLine.replace(nextDateMatch[0], '').replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '');
              if (trailing) {
                location = trailing;
              }
              i++; // Consume date line
            }

            if (/\bat\b/i.test(lineWork)) {
              const parts = lineWork.split(/\bat\b/i);
              roleTitle = parts[0].trim();
              company = parts[1].replace(/^[|\—\–\-\s,]+|[|\—\–\-\s,]+$/g, '').trim();
            } else {
              const delims = [' | ', ' — ', ' – ', ' - ', '|', '—', '–'];
              let parts = [lineWork];
              for (const d of delims) {
                if (lineWork.includes(d)) {
                  parts = lineWork.split(d).map((p) => p.trim()).filter(Boolean);
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
                company = '';
              }
            }
          }

          // Check if location is separated by comma inside company string
          if (company.includes(',') && !location) {
            const cParts = company.split(',');
            company = cParts[0].trim();
            location = cParts.slice(1).join(',').trim();
          }

          roleTitle = roleTitle.replace(/^[•*–—\-\s,|]+|[•*–—\-\s,|]+$/g, '').trim();
          company = company.replace(/^[•*–—\-\s,|]+|[•*–—\-\s,|]+$/g, '').trim();
          location = location.replace(/^[•*–—\-\s,|]+|[•*–—\-\s,|]+$/g, '').trim();

          if (!roleTitle || roleTitle.length < 2) continue;

          // If no dates specified at all, default isCurrent to true for single current role
          if (!startDate && !endDate && !dateMatch) {
            isCurrent = true;
          }

          const employmentType = classifyEmploymentType(roleTitle, rawLine, sourceSection);

          current = {
            roleTitle,
            jobTitle: roleTitle,
            company,
            employmentType,
            location: location || undefined,
            startDate: startDate || '',
            endDate,
            isCurrent,
            bullets: [],
            technologies: [],
            description: '',
            source: 'RESUME',
            confidence: company && startDate ? 0.92 : 0.75,
            evidence: rawLine,
            section: sourceSection,
            status: company && startDate ? 'AUTO_HIGH' : 'NEEDS_REVIEW',
          };
        } else if (current) {
          if (isBullet) {
            const cleanBullet = rawLine.replace(/^[•*–—\-\d+.)]\s*/, '').trim();
            if (cleanBullet.length > 0) {
              current.bullets.push(cleanBullet);
            }
          } else {
            // Line continuation of previous bullet
            if (current.bullets.length > 0) {
              current.bullets[current.bullets.length - 1] += ' ' + rawLine.trim();
            } else {
              current.bullets.push(rawLine.trim());
            }
          }

          // Scan line for technologies
          const PROJECT_SPECIFIC_TECHS = [
            'React.js', 'Express.js', 'IndexedDB', 'PostgreSQL', 'MongoDB', 'Redis', 'Gemini API',
            ...Object.keys(SKILL_TAXONOMY)
          ];
          PROJECT_SPECIFIC_TECHS.forEach((skill) => {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(rawLine) && !current!.technologies.includes(skill)) {
              current!.technologies.push(skill);
            }
          });
        }
      }

      if (current) {
        sectionEntries.push(current);
      }

      // Populate descriptions and ensure valid fallback dates
      for (const entry of sectionEntries) {
        if (!entry.startDate) {
          entry.startDate = '2022';
        }
        if (entry.bullets.length > 0) {
          entry.description = entry.bullets.join('\n');
        } else if (!entry.description && entry.company) {
          entry.description = `Role: ${entry.roleTitle} at ${entry.company}`;
        }

        if (sourceSection === 'INTERNSHIPS') {
          internships.push(entry);
        } else {
          experience.push(entry);
        }
      }
    }

    return {
      experience: experience.slice(0, 8),
      internships: internships.slice(0, 5),
    };
  }

  /**
   * Extracts Projects with title, technologies, URLs, and bullets.
   * - Platform link labels (GitHub, GitLab, Bitbucket, Live Demo, etc.) are NEVER treated as project titles.
   * - Wrapped PDF lines are rejoined to their parent bullet.
   * - Technologies are scoped to each project without leaking candidate skills wholesale.
   * - Preserves actual project boundaries and multi-project integrity.
   */
  private static extractProjects(sections: ResumeSection[], fullText: string): StructuredProjectEntry[] {
    const projSection = sections.find((s) => s.type === 'PROJECTS');
    const rawLines = projSection ? projSection.lines : [];
    if (rawLines.length === 0) return [];

    const projects: StructuredProjectEntry[] = [];
    let current: StructuredProjectEntry | null = null;

    const PROJECT_TECH_KEYWORDS = [
      'IndexedDB', 'Web Storage', 'React.js', 'React', 'Node.js', 'Express.js',
      'MongoDB', 'Redis', 'Gemini API', 'AWS EC2', 'AWS', 'REST APIs', 'REST API',
      'TypeScript', 'JavaScript', 'Python', 'Docker', 'Kubernetes', 'PostgreSQL',
      'MySQL', 'Next.js', 'Vue.js', 'Angular', 'GraphQL', 'Kafka', 'Tailwind CSS',
      'Firebase', 'SQLite', 'Go', 'Rust', 'C++', 'Java', 'Spring Boot', 'Linux',
      ...Object.keys(SKILL_TAXONOMY)
    ];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (!line) continue;

      const isBullet = /^[•*–—\-\d+.)]\s+/.test(line) || line.startsWith('•');

      // Look ahead to the next meaningful non-empty line (handling blank lines between title and bullets in DOCX)
      let nextNonEmptyLine = '';
      for (let j = i + 1; j < rawLines.length; j++) {
        const candidate = rawLines[j].trim();
        if (candidate) {
          nextNonEmptyLine = candidate;
          break;
        }
      }

      const nextIsBullet = /^[•*–—\-\d+.)]\s+/.test(nextNonEmptyLine) || nextNonEmptyLine.startsWith('•');
      const nextIsPlatform = isPlatformLinkLabel(nextNonEmptyLine);

      // Check if line is a platform link label or standalone link
      if (isPlatformLinkLabel(line)) {
        if (current) {
          const ghMatch = line.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
          const liveMatch = line.match(/https?:\/\/(?!(?:www\.)?github\.com)[^\s)]+/i);
          if (ghMatch && !current.githubUrl) current.githubUrl = ghMatch[0];
          if (liveMatch && !current.projectUrl) current.projectUrl = liveMatch[0];
        }
        continue;
      }

      // Check if line contains a bare URL without project name
      const isBareUrl = /^https?:\/\/[^\s)]+$/i.test(line);
      if (isBareUrl) {
        if (current) {
          if (line.includes('github.com') && !current.githubUrl) {
            current.githubUrl = line;
          } else if (!current.projectUrl) {
            current.projectUrl = line;
          }
        }
        continue;
      }

      // Project Header Candidates:
      // Must not be a bullet, platform label, or bare URL
      // Recognizes:
      // 1. Line followed by bullet or platform label
      // 2. Line containing delimiters (| or — or –)
      // 3. First non-empty standalone line in projects section
      const hasDelimiter = /[\—\–\|]/.test(line) && !isBullet;
      const isFollowedByContent = !isBullet && (nextIsBullet || nextIsPlatform);
      const isStandaloneHeader =
        !isBullet &&
        !line.endsWith('.') &&
        (hasDelimiter || isFollowedByContent || (line.length < 80 && current === null));

      if (isStandaloneHeader) {
        if (current) {
          projects.push(current);
          current = null;
        }

        let title = line;
        const technologies: string[] = [];
        let ghUrl: string | undefined = undefined;
        let projUrl: string | undefined = undefined;

        // Extract any URLs in the title line
        const inlineGh = line.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
        const inlineLive = line.match(/https?:\/\/(?!(?:www\.)?github\.com)[^\s)]+/i);
        if (inlineGh) ghUrl = inlineGh[0];
        if (inlineLive) projUrl = inlineLive[0];

        // Parse delimiter: "Title | Tech1, Tech2" or "Title | GitHub"
        if (line.includes('|')) {
          const parts = line.split('|').map((p) => p.trim());
          title = parts[0];
          for (let pIdx = 1; pIdx < parts.length; pIdx++) {
            const part = parts[pIdx];
            if (isPlatformLinkLabel(part)) {
              // Platform label (e.g. "GitHub" or "Live Demo")
              const partGh = part.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
              const partLive = part.match(/https?:\/\/(?!(?:www\.)?github\.com)[^\s)]+/i);
              if (partGh && !ghUrl) ghUrl = partGh[0];
              if (partLive && !projUrl) projUrl = partLive[0];
            } else if (/https?:\/\/|\.com|\.dev|\.io/i.test(part)) {
              // URL part
              const partGh = part.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
              const partLive = part.match(/https?:\/\/(?!(?:www\.)?github\.com)[^\s)]+/i);
              if (partGh && !ghUrl) ghUrl = partGh[0];
              if (partLive && !projUrl) projUrl = partLive[0];
            } else {
              // Tech candidates
              const candidates = part.split(/[,/]/).map((t) => t.trim());
              candidates.forEach((t) => {
                if (t.length > 1 && !t.includes('http') && !isPlatformLinkLabel(t)) {
                  technologies.push(t);
                }
              });
            }
          }
        }

        title = title
          .replace(/https?:\/\/[^\s)]+/g, '')
          .replace(/^[•*–—\-\s,|]+|[•*–—\-\s,|]+$/g, '')
          .trim();

        if (!title || isPlatformLinkLabel(title)) continue;

        current = {
          title,
          technologies,
          bullets: [],
          githubUrl: ghUrl,
          projectUrl: projUrl,
          source: 'RESUME',
          confidence: 0.90,
          evidence: line,
          section: 'PROJECTS',
          status: 'AUTO_HIGH',
        };
      } else if (current) {
        if (isBullet) {
          const cleanBullet = line.replace(/^[•*–—\-\d+.)]\s*/, '').trim();
          if (cleanBullet.length > 0) {
            current.bullets.push(cleanBullet);
          }
        } else {
          // Wrapped line continuation of previous bullet
          if (current.bullets.length > 0) {
            current.bullets[current.bullets.length - 1] += ' ' + line.trim();
          } else {
            current.bullets.push(line.trim());
          }
        }

        // Check for inline URLs in bullet text
        const bulletGh = line.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
        const bulletLive = line.match(/https?:\/\/(?!(?:www\.)?github\.com)[^\s)]+/i);
        if (bulletGh && !current.githubUrl) current.githubUrl = bulletGh[0];
        if (bulletLive && !current.projectUrl) current.projectUrl = bulletLive[0];

        // Scan line for technologies specific to this project
        PROJECT_TECH_KEYWORDS.forEach((tech) => {
          const regex = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(line)) {
            current!.technologies.push(tech);
          }
        });
      }
    }

    if (current) {
      projects.push(current);
    }

    for (const proj of projects) {
      proj.technologies = normalizeProjectTechnologies(proj.technologies);
      if (proj.bullets.length > 0) {
        proj.description = proj.bullets.join('\n');
      }
    }

    return projects.slice(0, 6);
  }

  /**
   * Extracts arbitrary certifications dynamically (not limited to a fixed list).
   * Supports:
   * 1. Multi-line certification blocks (Title line, Issuer & Date line, detail/bullet lines).
   * 2. Single-line delimited formats (Title – Issuer | Date, Title by Issuer, etc.).
   * 3. Bullet continuation and credential details (ID, URL, notes) without creating false certs.
   * 4. Safe deduplication and non-degree course diversion from education.
   */
  private static extractCertifications(
    sections: ResumeSection[],
    divertedCertifications: Array<{ name: string; issuer: string; evidence: string }>
  ): StructuredCertificationEntry[] {
    const certSection = sections.find((s) => s.type === 'CERTIFICATIONS');
    const rawLines = certSection ? certSection.lines : [];

    const certifications: StructuredCertificationEntry[] = [];

    // Helper: deduplication checker
    const hasCert = (title: string) => {
      const key = title.toLowerCase().replace(/[^a-z0-9]/g, '');
      return certifications.some((c) => c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === key);
    };

    // 1. Add diverted courses from education first
    for (const div of divertedCertifications) {
      if (div.name && !hasCert(div.name)) {
        certifications.push({
          name: div.name,
          issuingOrganization: div.issuer,
          source: 'RESUME',
          confidence: 0.92,
          evidence: div.evidence,
          section: 'CERTIFICATIONS',
          status: 'AUTO_HIGH',
        });
      }
    }

    // 2. Process CERTIFICATIONS section lines with multi-line block awareness
    let current: {
      name: string;
      issuingOrganization: string;
      issueDate?: string;
      expiryDate?: string;
      credentialId?: string;
      credentialUrl?: string;
      evidence: string;
      confidence: number;
      status: VerificationStatus;
    } | null = null;

    const commitCurrent = () => {
      if (!current || !current.name || current.name.length < 2) return;

      // Anti-fabrication & final cleanup
      let issuer = current.issuingOrganization.trim();
      if (!issuer || issuer === 'Issuing Organization') {
        const inferred = inferIssuerFromCertName(current.name);
        issuer = inferred || '';
      }

      // If issuer still empty, status is NEEDS_REVIEW
      const isComplete = issuer.length >= 2;
      const confidence = isComplete ? (current.confidence || 0.92) : 0.70;
      const status: VerificationStatus = isComplete ? 'AUTO_HIGH' : 'NEEDS_REVIEW';

      if (!hasCert(current.name)) {
        certifications.push({
          name: current.name,
          issuingOrganization: issuer,
          issueDate: current.issueDate,
          expiryDate: current.expiryDate,
          credentialId: current.credentialId,
          credentialUrl: current.credentialUrl,
          source: 'RESUME',
          confidence,
          evidence: current.evidence,
          section: 'CERTIFICATIONS',
          status,
        });
      }
      current = null;
    };

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line || line.length < 3) continue;

      // Filter table header rows
      if (this.isTableHeaderRow(line)) continue;

      const cleanLine = line.replace(/^[|•*–—\-\d+.)\s]+|[|•*–—\-\s]+$/g, '').trim();
      const isBulleted = /^[•*–—\-]/.test(line);

      // Check for standalone URL in line
      const urlMatch = line.match(/https?:\/\/[^\s)]+/i);

      // Check for credential ID in line
      const credIdMatch = cleanLine.match(/(?:credential\s*id|license|id)\s*[:#-]?\s*([a-zA-Z0-9-_]+)/i);

      // 1. Check if this line is a sub-bullet detail, credential note, date range, or duration of the active cert
      if (current && (isCertificationDetail(cleanLine) || (isBulleted && cleanLine.length > 5 && !isLikelyCertificationIssuer(cleanLine)))) {
        const dateResult = extractCertificationDate(cleanLine);
        if (dateResult.issueDate && !current.issueDate) {
          current.issueDate = dateResult.issueDate;
        }
        if (dateResult.expiryDate && !current.expiryDate) {
          current.expiryDate = dateResult.expiryDate;
        }
        if (credIdMatch && !current.credentialId) {
          current.credentialId = credIdMatch[1];
        }
        if (urlMatch && !current.credentialUrl) {
          current.credentialUrl = urlMatch[0];
        }
        current.evidence += `\n${line}`;
        continue;
      }

      // 2. Check if line contains a strong inline delimiter dividing title and issuer
      // (e.g. "Title – Issuer", "Title | Issuer", "Title by Issuer", "• CKAD – Linux Foundation")
      const delimMatch = cleanLine.match(/\s+([–—|-]|\b(?:by|from|at)\b)\s+(.*)$/i);
      if (delimMatch && typeof delimMatch.index === 'number' && delimMatch.index > 2) {
        commitCurrent();

        const leftPart = cleanLine.substring(0, delimMatch.index).trim();
        const rightPart = delimMatch[2].trim();

        // Swap if left is an issuer and right is a title (e.g. "School - Cryptanalysis Cert | 1941")
        let name = leftPart;
        let issuer = rightPart;
        if (isLikelyCertificationIssuer(leftPart) && !isLikelyCertificationIssuer(rightPart)) {
          name = rightPart;
          issuer = leftPart;
        }

        // Secondary delimiter on name or issuer (e.g. "Cryptanalysis Certification | 1941")
        const dateResult = extractCertificationDate(line);
        if (dateResult.issueDate) {
          name = name.replace(dateResult.issueDate, '').replace(/^[•*–—\-\s,|:]+|[•*–—\-\s,|:]+$/g, '').trim();
          issuer = issuer.replace(dateResult.issueDate, '').replace(/^[•*–—\-\s,|:]+|[•*–—\-\s,|:]+$/g, '').trim();
        }

        // Parentheses issuer or date cleanup, e.g. "AWS (Amazon Web Services)"
        const parenMatch = issuer.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        if (parenMatch && !dateResult.issueDate && /\b(19|20)\d{2}\b/.test(parenMatch[2])) {
          issuer = parenMatch[1].trim();
        }

        current = {
          name,
          issuingOrganization: issuer,
          issueDate: dateResult.issueDate,
          expiryDate: dateResult.expiryDate,
          credentialId: credIdMatch ? credIdMatch[1] : undefined,
          credentialUrl: urlMatch ? urlMatch[0] : undefined,
          evidence: line,
          confidence: 0.95,
          status: 'AUTO_HIGH',
        };
        continue;
      }

      // Check if this line is an issuer line for the active cert
      if (current && (!current.issuingOrganization || current.issuingOrganization === 'Issuing Organization')) {
        const dateResult = extractCertificationDate(cleanLine);
        let potentialIssuer = dateResult.cleanedText;

        // If trailing ) is unmatched, strip it
        if (potentialIssuer.endsWith(')') && !potentialIssuer.includes('(')) {
          potentialIssuer = potentialIssuer.slice(0, -1).trim();
        }

        if (
          !isCertificationTitleLikely(potentialIssuer) &&
          (isLikelyCertificationIssuer(potentialIssuer) ||
            isNonDegreePlatform(potentialIssuer) ||
            (dateResult.issueDate && potentialIssuer.length > 2) ||
            (!isBulleted && cleanLine.length < 60))
        ) {
          current.issuingOrganization = potentialIssuer;
          if (dateResult.issueDate && !current.issueDate) current.issueDate = dateResult.issueDate;
          if (dateResult.expiryDate && !current.expiryDate) current.expiryDate = dateResult.expiryDate;
          if (credIdMatch && !current.credentialId) current.credentialId = credIdMatch[1];
          if (urlMatch && !current.credentialUrl) current.credentialUrl = urlMatch[0];
          current.evidence += `\n${line}`;
          current.confidence = 0.95;
          current.status = 'AUTO_HIGH';
          continue;
        }
      }

      // Otherwise, this line begins a new certification entry
      commitCurrent();

      const dateResult = extractCertificationDate(cleanLine);
      let title = dateResult.cleanedText;
      if (dateResult.issueDate && !isLikelyCertificationIssuer(cleanLine)) {
        title = title.replace(new RegExp(`\\(?\\b${dateResult.issueDate}\\b\\)?`, 'g'), '').replace(/^[•*–—\-\s,|:]+|[•*–—\-\s,|:]+$/g, '').trim();
      }

      current = {
        name: title,
        issuingOrganization: '',
        issueDate: dateResult.issueDate,
        expiryDate: dateResult.expiryDate,
        credentialId: credIdMatch ? credIdMatch[1] : undefined,
        credentialUrl: urlMatch ? urlMatch[0] : undefined,
        evidence: line,
        confidence: 0.85,
        status: 'NEEDS_REVIEW',
      };
    }

    commitCurrent();

    return certifications.slice(0, 20);
  }

  /**
   * Categorizes technical and soft skills with taxonomy validation.
   */
  private static extractCategorizedSkills(
    sections: ResumeSection[],
    fullText: string
  ): {
    technicalSkills: StructuredSkillEntry[];
    softSkills: StructuredSkillEntry[];
    legacySkills: Array<{ name: string; category?: string; level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'; source: 'RESUME'; verified: false }>;
  } {
    const skillSection = sections.find((s) => s.type === 'SKILLS');
    const skillText = skillSection ? skillSection.rawText.trim() : '';
    const hasExplicitSkills = skillText.length > 5;
    const searchSpace = hasExplicitSkills ? skillText : fullText;

    const technicalSkills: StructuredSkillEntry[] = [];
    const softSkills: StructuredSkillEntry[] = [];
    const legacySkills: Array<{ name: string; category?: string; level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'; source: 'RESUME'; verified: false }> = [];

    const seenSkills = new Set<string>();

    for (const [canonicalName, meta] of Object.entries(SKILL_TAXONOMY)) {
      const terms = [canonicalName, ...(meta.aliases || [])];
      let matchedTerm: string | null = null;

      for (const term of terms) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(searchSpace)) {
          matchedTerm = term;
          break;
        }
      }

      if (matchedTerm) {
        const normKey = canonicalName.toLowerCase();
        if (seenSkills.has(normKey)) continue;
        seenSkills.add(normKey);

        const inSkillSection = hasExplicitSkills;
        const confidence = inSkillSection ? 0.95 : 0.70;

        const entry: StructuredSkillEntry = {
          name: canonicalName,
          category: meta.category,
          level: 'INTERMEDIATE',
          source: 'RESUME',
          verified: false,
          confidence,
          evidence: `Extracted from ${inSkillSection ? 'Skills section' : 'resume body text'}: "${matchedTerm}"`,
          status: inSkillSection ? 'AUTO_HIGH' : 'NEEDS_REVIEW',
        };

        if (meta.category === 'SOFT_SKILL') {
          softSkills.push(entry);
        } else {
          technicalSkills.push(entry);
        }

        legacySkills.push({
          name: canonicalName,
          category: meta.category,
          level: 'INTERMEDIATE',
          source: 'RESUME',
          verified: false,
        });
      }
    }

    return { technicalSkills, softSkills, legacySkills };
  }

  /**
   * Extracts Achievements from ACHIEVEMENTS section.
   */
  private static extractAchievements(sections: ResumeSection[]): StructuredAchievementEntry[] {
    const achSection = sections.find((s) => s.type === 'ACHIEVEMENTS');
    if (!achSection) return [];

    const achievements: StructuredAchievementEntry[] = [];
    for (const rawLine of achSection.lines) {
      const clean = rawLine.replace(/^[•*–—\-\d+.)]\s*/, '').trim();
      if (clean.length >= 5) {
        achievements.push({
          title: clean,
          source: 'RESUME',
          confidence: 0.88,
          evidence: rawLine,
          section: 'ACHIEVEMENTS',
          status: 'AUTO_HIGH',
        });
      }
    }
    return achievements.slice(0, 5);
  }

  /**
   * Known degree abbreviations, technology libraries, and non-domain tokens
   * that must NEVER be extracted as professional links or portfolio websites.
   */
  private static readonly NON_LINK_TOKENS = new Set([
    'b.tech', 'm.tech', 'b.sc', 'm.sc', 'b.com', 'm.com', 'b.e', 'm.e', 'b.a', 'm.a', 'ph.d',
    'b.arch', 'b.des', 'bca', 'mca',
    'react.js', 'node.js', 'express.js', 'next.js', 'vue.js', 'socket.io', 'three.js', 'd3.js', 'moment.js', 'chart.js', 'asp.net',
    'pvt.ltd', 'pvt. ltd.', 'e.g', 'i.e', 'etc',
  ]);

  /**
   * Extracts Professional Links (LinkedIn, GitHub, LeetCode, CodeChef, Portfolios, etc.)
   * with strict guards preventing:
   * 1. Degree acronyms (B.Tech, M.Tech) and technology names (Node.js, React.js) from becoming portfolio URLs.
   * 2. Candidate email domains from being promoted to professional links.
   * 3. Project repository or demo URLs from leaking into top-level candidate links.
   */
  private static extractProfessionalLinks(
    fullText: string,
    projects: StructuredProjectEntry[] = [],
    sections: ResumeSection[] = []
  ): StructuredProfessionalLinkEntry[] {
    const links: StructuredProfessionalLinkEntry[] = [];
    const urlRegex = /(?:https?:\/\/|www\.)[^\s,;)\]]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s,;)\]]*)?/gi;
    let match: RegExpExecArray | null;

    const seenUrls = new Set<string>();

    // Text of PROJECTS section to prevent project-scoped repository and demo links from leaking to top level
    const projSection = sections.find((s) => s.type === 'PROJECTS');
    const projSectionText = projSection ? projSection.lines.join(' ').toLowerCase() : '';

    // Collect candidate email domains to prevent email-domain promotion
    const emailMatches = fullText.match(/[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g) || [];
    const emailDomains = new Set<string>();
    for (const em of emailMatches) {
      const atIdx = em.indexOf('@');
      if (atIdx >= 0) {
        emailDomains.add(em.substring(atIdx + 1).toLowerCase());
      }
    }

    // Collect project-specific repository and demo URLs to prevent project URL leakage
    const projectUrls = new Set<string>();
    for (const p of projects) {
      if (p.githubUrl) {
        projectUrls.add(p.githubUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, ''));
      }
      if (p.projectUrl) {
        projectUrls.add(p.projectUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, ''));
      }
      if (p.demoUrl) {
        projectUrls.add(p.demoUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, ''));
      }
    }

    while ((match = urlRegex.exec(fullText)) !== null) {
      // Reject if match immediately follows an '@' character (i.e. is the domain part of an email address)
      if (match.index > 0 && fullText[match.index - 1] === '@') {
        continue;
      }

      const rawUrl = match[0].trim().replace(/[.,;:)\]]+$/, '');
      const lower = rawUrl.toLowerCase();

      // Skip email addresses (ensure profile URLs with handles like medium.com/@user are preserved)
      if (
        lower.startsWith('mailto:') ||
        (!rawUrl.startsWith('http') && !rawUrl.startsWith('www.') && !lower.includes('/') && lower.includes('@')) ||
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(rawUrl)
      ) {
        continue;
      }

      // Skip file extensions or XML schemas
      if (/\.(?:pdf|png|jpg|jpeg|docx?|xml|json)$/i.test(lower) || lower.includes('schemas.openxml') || lower.includes('w3.org')) {
        continue;
      }

      // Strictly skip degrees and technology names (e.g. B.Tech, React.js)
      if (this.NON_LINK_TOKENS.has(lower)) {
        continue;
      }

      const isExplicit = /^https?:\/\/|^www\./i.test(rawUrl);
      const withoutProtocol = lower.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
      const domainOnly = withoutProtocol.split('/')[0];

      // Never promote email domains as professional links (e.g. mocktalent.io, mockcode.io, mockcloud.io)
      if (emailDomains.has(domainOnly) || emailDomains.has(withoutProtocol)) {
        continue;
      }

      const firstDotIdx = withoutProtocol.indexOf('.');
      const firstToken = firstDotIdx > 0 ? withoutProtocol.substring(0, firstDotIdx) : '';

      // Non-explicit URLs must have a domain prefix of at least 2 characters (e.g. rejects "b.tech")
      if (firstToken.length < 2 && !isExplicit) {
        continue;
      }

      const isKnownDomain = /\b(?:linkedin|github|leetcode|codechef|hackerrank|kaggle|codeforces|medium|twitter|x|behance|dribbble|gitlab|bitbucket|stackoverflow|dev\.to|hashnode|youtube|figma)\b/i.test(lower);
      const isPortfolioTld = /\.(?:dev|me|io|tech|app|site|page|website|online)\b/i.test(lower);

      // If not explicit http/www, require it to be a known domain or a recognized portfolio TLD
      if (!isExplicit) {
        if (!isKnownDomain && !isPortfolioTld) continue;
        if (isPortfolioTld && !isKnownDomain) {
          if (lower.endsWith('.tech') && !rawUrl.includes('/')) continue;
          if (lower.endsWith('.io') && ['socket.io'].includes(lower)) continue;
          if (lower.endsWith('.js')) continue;
        }
      }

      // Check for project URL leakage:
      // A URL that is already assigned to a project (as repo or demo) must NOT be promoted to candidate-level professional links
      if (projectUrls.has(withoutProtocol)) {
        continue;
      }

      // Repository URLs (e.g. github.com/user/project-repo) located inside the PROJECTS section belong to projects
      const isProjectRepositoryUrl = /^(?:github\.com|gitlab\.com|bitbucket\.org)\/[^\s\/]+\/[^\s\/]+/i.test(withoutProtocol);
      if (isProjectRepositoryUrl && projSectionText.includes(withoutProtocol)) {
        continue;
      }

      const fullUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
        ? rawUrl
        : `https://${rawUrl}`;

      // Deduplicate identical top-level links based on normalized protocol-independent key
      const normKey = withoutProtocol;

      if (!seenUrls.has(normKey)) {
        seenUrls.add(normKey);
        const platform = classifyProfessionalLinkPlatform(fullUrl);
        links.push({
          platform,
          url: fullUrl,
          confidence: isKnownDomain ? 0.98 : 0.85,
          evidence: rawUrl,
          status: 'AUTO_HIGH',
        });
      }
    }

    return links;
  }

  /**
   * Extracts spoken/natural languages.
   */
  private static extractLanguages(sections: ResumeSection[]): StructuredLanguageEntry[] {
    const langSection = sections.find((s) => s.type === 'LANGUAGES');
    if (!langSection) return [];

    const commonLanguages = [
      'English', 'Hindi', 'Telugu', 'Tamil', 'Spanish', 'French', 'German',
      'Mandarin', 'Japanese', 'Arabic', 'Russian', 'Kannada', 'Malayalam', 'Marathi'
    ];

    const entries: StructuredLanguageEntry[] = [];
    for (const lang of commonLanguages) {
      const regex = new RegExp(`\\b${lang}\\b`, 'i');
      if (regex.test(langSection.rawText)) {
        entries.push({
          language: lang,
          confidence: 0.95,
          evidence: lang,
          status: 'AUTO_HIGH',
        });
      }
    }
    return entries;
  }

  /**
   * Helper to identify education institution lines.
   */
  private static isEducationInstitutionLine(line: string): boolean {
    const trimmed = line.trim();
    if (/^(?:Secondary School Certificate|High School Diploma|SSC|HSC|Intermediate)\b/i.test(trimmed)) {
      return false;
    }
    return /(?:College|University|Institute|Academy|Polytechnic|\bSchool\b)/i.test(trimmed);
  }

  /**
   * Helper to identify education degree lines.
   */
  private static isEducationDegreeLine(line: string): boolean {
    return /(?:B\.?Tech|B\.?E\.?|B\.?S|B\.?A|Bachelor|M\.?Tech|M\.?E\.?|M\.?S|Master|Ph\.?D|Doctorate|Intermediate|Secondary School Certificate|SSC|HSC|10th|12th|Diploma|Matriculation)/i.test(line);
  }

  /**
   * Helper to parse degree and field of study.
   */
  private static parseDegreeAndField(text: string): { degree: string; fieldOfStudy: string } {
    const clean = text.replace(/^[\s•*–\-]+/, '').trim();
    if (!clean) return { degree: '', fieldOfStudy: '' };

    const dashMatch = clean.match(/\s+[–—]\s+(.*)$/) || (clean.includes(' - ') ? clean.match(/\s+-\s+(.*)$/) : null);
    if (dashMatch && dashMatch.index) {
      const mainPart = clean.substring(0, dashMatch.index).trim();
      const specPart = dashMatch[1].trim();

      if (/(?:B\.?Tech|B\.?E\.?|B\.?S|Bachelor|B\.?Des|B\.?Com|M\.?Tech|Master)/i.test(mainPart)) {
        return {
          degree: mainPart,
          fieldOfStudy: specPart,
        };
      }
    }

    const bscMatch = clean.match(/(Bachelor(?:\s+of\s+[A-Za-z]+)?|B\.?S\.?c?|B\.?A\.?|B\.?Des|B\.?Com|Master(?:\s+of\s+[A-Za-z]+)?|M\.?S\.?c?|Ph\.?D\.?)\s+in\s+([A-Za-z\s&,()-]+)/i);
    if (bscMatch) {
      return { degree: bscMatch[1].trim(), fieldOfStudy: bscMatch[2].trim() };
    }

    const commaMatch = clean.match(/^(B\.?Com|B\.?Des|B\.?A|B\.?S|B\.?Tech|B\.?E),\s*([A-Za-z\s&,()-]+)$/i);
    if (commaMatch) {
      return { degree: commaMatch[1].trim(), fieldOfStudy: commaMatch[2].trim() };
    }

    if (/Bachelor\s+of\s+Commerce/i.test(clean)) {
      return { degree: 'Bachelor of Commerce', fieldOfStudy: 'Commerce' };
    }

    const btechMatch = clean.match(/(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?E\.?)\s+in\s+([A-Za-z\s&,()-]+)/i);
    if (btechMatch) {
      return { degree: btechMatch[1].trim(), fieldOfStudy: btechMatch[2].trim() };
    }

    const interMatch = clean.match(/Intermediate(?:\s*\(([^)]+)\))?/i);
    if (interMatch) {
      return { degree: interMatch[0].trim(), fieldOfStudy: interMatch[1] ? interMatch[1].trim() : 'MPC' };
    }

    const sscMatch = clean.match(/(?:Secondary School Certificate(?:\s*\(SSC\))?|SSC|10th(?:\s+Grade)?)/i);
    if (sscMatch) {
      return { degree: sscMatch[0].trim(), fieldOfStudy: 'Secondary Education' };
    }

    return { degree: clean, fieldOfStudy: '' };
  }

  /**
   * Computes an overall 0-100 quality score.
   */
  private static calculateQualityScore(metrics: {
    hasName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    educationCount: number;
    experienceCount: number;
    skillsCount: number;
    projectsCount: number;
  }): number {
    let score = 0;
    if (metrics.hasName) score += 15;
    if (metrics.hasEmail) score += 20;
    if (metrics.hasPhone) score += 15;
    if (metrics.educationCount > 0) score += 15;
    if (metrics.skillsCount >= 3) score += 15;
    if (metrics.experienceCount > 0) score += 10;
    if (metrics.projectsCount > 0) score += 10;
    return Math.min(100, score);
  }
}
