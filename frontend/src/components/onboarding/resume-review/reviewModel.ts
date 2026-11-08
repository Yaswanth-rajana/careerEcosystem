import { ParsedResumeData } from '@backend/services/resumeParserService';
import {
  StructuredResumeData,
  StructuredEducationEntry,
  StructuredExperienceEntry,
  StructuredProjectEntry,
  StructuredCertificationEntry,
  StructuredSkillEntry,
  StructuredAchievementEntry,
  StructuredProfessionalLinkEntry,
  StructuredLanguageEntry,
  ExtractedField,
  VerificationStatus,
} from '@backend/services/resume/types';
import { FullOnboardingPayload } from '@backend/validations/onboardingSchemas';

export type ReviewSectionKey =
  | 'personal'
  | 'education'
  | 'experience'
  | 'internships'
  | 'projects'
  | 'certifications'
  | 'technicalSkills'
  | 'softSkills'
  | 'achievements'
  | 'professionalLinks'
  | 'languages';

export type ReviewDecision = 'accepted' | 'rejected' | 'pending';

export type ReviewFieldInputType =
  | 'text'
  | 'number'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox';

export interface ReviewFieldState {
  id: string;
  key: string;
  label: string;
  value: string;
  originalValue: string;
  confidence: number;
  extractionStatus: VerificationStatus;
  evidence: string;
  section: string;
  existingValue: string;
  isConflict: boolean;
  decision: ReviewDecision;
  confirmed: boolean;
  edited: boolean;
  inputType: ReviewFieldInputType;
  options?: Array<{ label: string; value: string }>;
  required: boolean;
  minLength: number;
}

export interface ReviewEntryState {
  id: string;
  title: string;
  subtitle?: string;
  confidence: number;
  extractionStatus: VerificationStatus;
  evidence: string;
  section: string;
  duplicate: boolean;
  raw: any;
  fields: ReviewFieldState[];
}

export interface ReviewSectionState {
  key: ReviewSectionKey;
  title: string;
  description: string;
  kind: 'personal' | 'collection';
  entries: ReviewEntryState[];
}

export interface ReviewSectionStats {
  approved: number;
  pending: number;
  rejected: number;
  missing: number;
  total: number;
  reviewRequired: number;
  duplicateEntries: number;
}

export interface ReviewStats {
  approved: number;
  pending: number;
  rejected: number;
  missing: number;
  total: number;
  reviewRequired: number;
  progress: number;
  sections: Record<ReviewSectionKey, ReviewSectionStats>;
}

export interface ApprovedResumeResult {
  data: ParsedResumeData;
  skippedEntries: number;
}

export interface PersistedReviewFieldState {
  value: string;
  decision: ReviewDecision;
  edited: boolean;
  confirmed: boolean;
}

export interface PersistedResumeReview {
  parsedData: ParsedResumeData;
  filename: string;
  fields: Record<string, PersistedReviewFieldState>;
}

export const REVIEW_SECTIONS: Array<{
  key: ReviewSectionKey;
  title: string;
  description: string;
}> = [
  { key: 'personal', title: 'Personal Information', description: 'Contact details and professional summary found in your resume.' },
  { key: 'education', title: 'Education', description: 'Degrees, institutions, dates and academic scores.' },
  { key: 'experience', title: 'Work Experience', description: 'Roles, companies, dates and responsibilities.' },
  { key: 'internships', title: 'Internships', description: 'Internship roles identified in your resume.' },
  { key: 'projects', title: 'Projects', description: 'Portfolio and academic projects with technologies and links.' },
  { key: 'certifications', title: 'Certifications', description: 'Certifications, issuers, dates and credential links.' },
  { key: 'technicalSkills', title: 'Technical Skills', description: 'Technical tools and technologies detected in your resume.' },
  { key: 'softSkills', title: 'Soft Skills', description: 'Interpersonal and professional skills detected in your resume.' },
  { key: 'achievements', title: 'Achievements', description: 'Awards, honors and notable accomplishments.' },
  { key: 'professionalLinks', title: 'Professional Links', description: 'LinkedIn, GitHub, portfolio and other professional profiles.' },
  { key: 'languages', title: 'Languages', description: 'Spoken languages and proficiency levels.' },
];

const SKILL_CATEGORY_OPTIONS = [
  'LANGUAGE',
  'FRONTEND',
  'BACKEND',
  'DATABASE',
  'CLOUD',
  'DEVOPS',
  'TESTING',
  'TOOL',
  'AI_ML',
  'MOBILE',
  'SECURITY',
  'MANAGEMENT',
  'SOFT_SKILL',
  'OTHER',
].map((value) => ({ label: value.replace(/_/g, ' '), value }));

const SKILL_LEVEL_OPTIONS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map((value) => ({
  label: value.charAt(0) + value.slice(1).toLowerCase(),
  value,
}));

const EMPLOYMENT_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Internship',
  'Contract',
  'Freelance',
  'Self-employed',
].map((value) => ({ label: value, value }));

const LANGUAGE_PROFICIENCY_OPTIONS = [
  'NATIVE',
  'FLUENT',
  'PROFESSIONAL',
  'CONVERSATIONAL',
  'BASIC',
].map((value) => ({ label: value.charAt(0) + value.slice(1).toLowerCase(), value }));

const EMPTY_STATS: ReviewSectionStats = {
  approved: 0,
  pending: 0,
  rejected: 0,
  missing: 0,
  total: 0,
  reviewRequired: 0,
  duplicateEntries: 0,
};

export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function comparableText(value: unknown): string {
  return normalizeText(value).toLowerCase().replace(/\s+/g, ' ');
}

export function normalizedKey(value: unknown): string {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function normalizeIndianMobile(value: unknown): string | null {
  const digits = normalizeText(value).replace(/\D/g, '');
  const national =
    digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith('0')
        ? digits.slice(1)
        : digits.length === 10
          ? digits
          : '';
  return /^[6-9]\d{9}$/.test(national) ? national : null;
}

export function canonicalUrlKey(value: unknown): string {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return '';
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, '');
    const pathname = url.pathname.replace(/\/+$/, '');
    return `${host}${pathname}${url.search}`;
  } catch {
    return normalizedKey(raw);
  }
}

function comparisonKey(key: string, value: unknown): string {
  if (key === 'phone') {
    const mobile = normalizeIndianMobile(value);
    if (mobile) return `phone:${mobile}`;
  }
  if (key === 'email') {
    return `email:${normalizeText(value).toLowerCase()}`;
  }
  if (key === 'url' || key.endsWith('Url') || key === 'website' || key === 'linkedin' || key === 'github') {
    return `url:${canonicalUrlKey(value)}`;
  }
  return comparableText(value);
}

export function isUncertain(confidence: number, status: VerificationStatus): boolean {
  if (status === 'LOW_CONFIDENCE' || confidence < 0.6) return true;
  if (status === 'NEEDS_REVIEW' || confidence < 0.78) return true;
  return false;
}

export function getEffectiveStatus(field: ReviewFieldState): VerificationStatus | 'REJECTED' {
  if (field.decision === 'rejected') return 'REJECTED';
  if (field.decision === 'accepted' && field.confirmed) return 'VERIFIED';
  if (field.extractionStatus === 'LOW_CONFIDENCE' || field.confidence < 0.6) return 'LOW_CONFIDENCE';
  if (field.extractionStatus === 'NEEDS_REVIEW' || field.confidence < 0.78) return 'NEEDS_REVIEW';
  return 'AUTO_HIGH';
}

export function isMissingField(field: ReviewFieldState): boolean {
  return field.required && !field.value.trim() && field.decision !== 'rejected';
}

export function isValidFieldValue(field: ReviewFieldState): boolean {
  const value = field.value.trim();
  if (!value) return false;
  if (field.key === 'phone') {
    return normalizeIndianMobile(value) !== null;
  }
  if (field.key === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  if (field.inputType === 'number') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return false;
    if (field.key === 'startYear' || field.key === 'endYear') {
      return parsed >= 1950 && parsed <= 2100;
    }
    return true;
  }
  if (field.inputType === 'url') {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
  return value.length >= field.minLength;
}

export function entryIsComplete(entry: ReviewEntryState): boolean {
  return entry.fields
    .filter((field) => field.required)
    .every((field) => field.decision === 'accepted' && isValidFieldValue(field));
}

interface BuildFieldArgs {
  id: string;
  key: string;
  label: string;
  value?: unknown;
  confidence: number;
  extractionStatus: VerificationStatus;
  evidence: string;
  section: string;
  existingValue?: unknown;
  inputType?: ReviewFieldInputType;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  minLength?: number;
  duplicate?: boolean;
}

function buildField({
  id,
  key,
  label,
  value,
  confidence,
  extractionStatus,
  evidence,
  section,
  existingValue,
  inputType = 'text',
  options,
  required = false,
  minLength = 1,
  duplicate = false,
}: BuildFieldArgs): ReviewFieldState {
  const stringValue = normalizeText(value);
  const originalValue = stringValue;
  const existing = normalizeText(existingValue);
  const hasValue = stringValue.length > 0;
  const isConflict = Boolean(
    existing &&
      hasValue &&
      comparisonKey(key, existing) !== comparisonKey(key, stringValue)
  );

  let decision: ReviewDecision;
  if (duplicate) {
    decision = 'rejected';
  } else if (!hasValue) {
    decision = required ? 'pending' : 'rejected';
  } else {
    decision = 'pending';
  }

  return {
    id,
    key,
    label,
    value: stringValue,
    originalValue,
    confidence: Math.max(0, Math.min(1, confidence)),
    extractionStatus,
    evidence,
    section,
    existingValue: existing,
    isConflict,
    decision,
    confirmed: false,
    edited: false,
    inputType,
    options,
    required,
    minLength,
  };
}

function createEntry(
  id: string,
  title: string,
  subtitle: string | undefined,
  meta: {
    confidence: number;
    status: VerificationStatus;
    evidence: string;
    section: string;
  },
  duplicate: boolean,
  raw: any,
  fields: ReviewFieldState[]
): ReviewEntryState {
  const withDuplicate = duplicate
    ? fields.map((field) => ({
        ...field,
        decision: 'rejected' as ReviewDecision,
        confirmed: false,
      }))
    : fields;

  return {
    id,
    title: title || 'Untitled entry',
    subtitle,
    confidence: meta.confidence,
    extractionStatus: meta.status,
    evidence: meta.evidence,
    section: meta.section,
    duplicate,
    raw,
    fields: withDuplicate,
  };
}

function legacyMeta(section: string): {
  confidence: number;
  status: VerificationStatus;
  evidence: string;
  section: string;
} {
  return {
    confidence: 0.75,
    status: 'NEEDS_REVIEW',
    evidence: 'Extracted by the resume parser. No verbatim evidence excerpt was retained.',
    section,
  };
}

function structuredPersonalField(
  structured: StructuredResumeData | undefined,
  key: string
): ExtractedField<string> | undefined {
  if (!structured) return undefined;
  return (structured.personalInfo as Record<string, ExtractedField<string> | undefined>)[key];
}

function buildPersonalSection(
  parsedData: ParsedResumeData,
  structured: StructuredResumeData | undefined,
  existingProfile?: FullOnboardingPayload,
  accountEmail?: string
): ReviewSectionState {
  const keys: Array<{ key: keyof ParsedResumeData['personalInfo']; label: string; inputType?: ReviewFieldInputType; required?: boolean }> = [
    { key: 'name', label: 'Full name', required: true },
    { key: 'email', label: 'Email address' },
    { key: 'phone', label: 'Phone number' },
    { key: 'location', label: 'Location' },
    { key: 'headline', label: 'Professional headline' },
    { key: 'bio', label: 'Professional summary', inputType: 'textarea' },
  ];
  const fields = keys.map(({ key, label, inputType, required }) => {
    const extracted = structuredPersonalField(structured, key);
    const legacyValue = parsedData.personalInfo[key];
    const value = extracted?.value ?? legacyValue;
    const meta = extracted
      ? {
          confidence: extracted.confidence,
          status: extracted.status,
          evidence: extracted.evidence,
          section: extracted.section,
        }
      : legacyMeta('CONTACT');
    const existingValue = key === 'email' ? accountEmail : (existingProfile?.aboutYou as any)?.[key];

    return buildField({
      id: `personal-${key}`,
      key,
      label,
      value,
      confidence: meta.confidence,
      extractionStatus: meta.status,
      evidence: meta.evidence,
      section: meta.section,
      existingValue,
      inputType,
      required,
      minLength: required ? 2 : 1,
    });
  });

  return {
    key: 'personal',
    title: 'Personal Information',
    description: 'Contact details and professional summary found in your resume.',
    kind: 'personal',
    entries: [
      createEntry(
        'personal-entry',
        'Contact details',
        'Extracted from the header and summary of your resume.',
        {
          confidence: fields.reduce((sum, field) => sum + field.confidence, 0) / Math.max(fields.length, 1),
          status: 'AUTO_HIGH',
          evidence: fields.find((field) => field.evidence)?.evidence || '',
          section: 'CONTACT',
        },
        false,
        {},
        fields
      ),
    ],
  };
}

function buildEducationFields(
  entry: StructuredEducationEntry,
  index: number,
  raw: any
): ReviewEntryState {
  const fields = [
    buildField({
      id: `education-${index}-institution`,
      key: 'institution',
      label: 'Institution',
      value: entry.institution,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      inputType: 'text',
      required: true,
      minLength: 2,
    }),
    buildField({
      id: `education-${index}-degree`,
      key: 'degree',
      label: 'Degree',
      value: entry.degree,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      inputType: 'text',
      required: true,
      minLength: 2,
    }),
    buildField({
      id: `education-${index}-fieldOfStudy`,
      key: 'fieldOfStudy',
      label: 'Field of study',
      value: entry.fieldOfStudy,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      required: true,
      minLength: 2,
    }),
    buildField({
      id: `education-${index}-location`,
      key: 'location',
      label: 'Location',
      value: entry.location,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
    }),
    buildField({
      id: `education-${index}-startYear`,
      key: 'startYear',
      label: 'Start year',
      value: entry.startYear || undefined,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      inputType: 'number',
      required: true,
    }),
    buildField({
      id: `education-${index}-endYear`,
      key: 'endYear',
      label: 'End year',
      value: entry.endYear || undefined,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      inputType: 'number',
    }),
    buildField({
      id: `education-${index}-gpa`,
      key: 'gpa',
      label: 'CGPA / score',
      value: entry.gpa,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
    }),
  ];

  return createEntry(
    `education-${index}`,
    entry.institution,
    [entry.degree, entry.fieldOfStudy].filter(Boolean).join(' · '),
    {
      confidence: entry.confidence,
      status: entry.status,
      evidence: entry.evidence,
      section: entry.section,
    },
    false,
    raw,
    fields
  );
}

function buildEducationSection(
  parsedData: ParsedResumeData,
  structured: StructuredResumeData | undefined,
  existingProfile?: FullOnboardingPayload
): ReviewSectionState {
  const entries: StructuredEducationEntry[] = structured
    ? structured.education
    : parsedData.education.map((entry) => ({
        ...entry,
        startYear: entry.startYear ?? 0,
        endYear: entry.endYear ?? null,
        isCurrent: Boolean(entry.isCurrent),
        educationLevel: 'OTHER' as const,
        confidence: 0.75,
        evidence: 'Extracted by the resume parser. No verbatim evidence excerpt was retained.',
        section: 'EDUCATION',
        status: 'NEEDS_REVIEW' as VerificationStatus,
      }));

  const seen = new Set<string>();
  const existingSet = new Set(
    (existingProfile?.education || []).map((item) =>
      `${normalizedKey(item.institution)}|${normalizedKey(item.degree)}`
    )
  );

  const reviewEntries = entries.map((entry, index) => {
    const key = `${normalizedKey(entry.institution)}|${normalizedKey(entry.degree)}`;
    const duplicate = Boolean(key.trim() !== '|' && (seen.has(key) || existingSet.has(key)));
    seen.add(key);
    const reviewEntry = buildEducationFields(entry, index, entry);
    return duplicate
      ? {
          ...reviewEntry,
          duplicate: true,
          fields: reviewEntry.fields.map((field) => ({
            ...field,
            decision: 'rejected' as ReviewDecision,
            confirmed: false,
          })),
        }
      : reviewEntry;
  });

  return {
    key: 'education',
    title: 'Education',
    description: 'Degrees, institutions, dates and academic scores.',
    kind: 'collection',
    entries: reviewEntries,
  };
}

function buildExperienceEntry(
  entry: StructuredExperienceEntry,
  index: number,
  sectionKey: 'experience' | 'internships',
  raw: any
): ReviewEntryState {
  const isInternship = sectionKey === 'internships' || entry.employmentType === 'Internship';
  const fields = [
    buildField({
      id: `${sectionKey}-${index}-company`,
      key: 'company',
      label: 'Company',
      value: entry.company,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      required: true,
      minLength: 2,
    }),
    buildField({
      id: `${sectionKey}-${index}-roleTitle`,
      key: 'roleTitle',
      label: 'Role title',
      value: entry.roleTitle,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      required: true,
      minLength: 2,
    }),
    buildField({
      id: `${sectionKey}-${index}-employmentType`,
      key: 'employmentType',
      label: 'Employment type',
      value: isInternship ? 'Internship' : entry.employmentType,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      inputType: 'select',
      options: EMPLOYMENT_TYPE_OPTIONS,
    }),
    buildField({
      id: `${sectionKey}-${index}-location`,
      key: 'location',
      label: 'Location',
      value: entry.location,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
    }),
    buildField({
      id: `${sectionKey}-${index}-startDate`,
      key: 'startDate',
      label: 'Start date',
      value: entry.startDate,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      required: true,
      minLength: 2,
    }),
    buildField({
      id: `${sectionKey}-${index}-endDate`,
      key: 'endDate',
      label: 'End date',
      value: entry.endDate,
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
    }),
    buildField({
      id: `${sectionKey}-${index}-description`,
      key: 'description',
      label: 'Responsibilities / achievements',
      value: entry.description || (entry.bullets || []).join('\n'),
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
      inputType: 'textarea',
    }),
    buildField({
      id: `${sectionKey}-${index}-technologies`,
      key: 'technologies',
      label: 'Technologies (comma separated)',
      value: (entry.technologies || []).join(', '),
      confidence: entry.confidence,
      extractionStatus: entry.status,
      evidence: entry.evidence,
      section: entry.section,
    }),
  ];

  return createEntry(
    `${sectionKey}-${index}`,
    [entry.roleTitle, entry.company].filter(Boolean).join(' at '),
    [entry.startDate, entry.isCurrent ? 'Present' : entry.endDate].filter(Boolean).join(' – '),
    {
      confidence: entry.confidence,
      status: entry.status,
      evidence: entry.evidence,
      section: entry.section,
    },
    false,
    raw,
    fields
  );
}

function buildExperienceSection(
  parsedData: ParsedResumeData,
  structured: StructuredResumeData | undefined,
  sectionKey: 'experience' | 'internships',
  existingProfile?: FullOnboardingPayload
): ReviewSectionState {
  let source: StructuredExperienceEntry[];

  if (structured) {
    if (sectionKey === 'experience') {
      // Work Experience: entries from EXPERIENCE section (preserve source section without hiding Internship-titled roles)
      const internshipKeys = new Set(
        (structured.internships || []).map(
          (entry) => `${normalizedKey(entry.company)}|${normalizedKey(entry.roleTitle)}`
        )
      );
      source = (structured.experience || []).filter((entry) => {
        if (entry.section === 'INTERNSHIPS') return false;
        const key = `${normalizedKey(entry.company)}|${normalizedKey(entry.roleTitle)}`;
        return !internshipKeys.has(key);
      });
    } else {
      source = structured.internships || [];
    }
  } else {
    source = (parsedData.experience || [])
      .filter((entry) => {
        const isInternshipSection = (entry as any).section === 'INTERNSHIPS';
        return sectionKey === 'experience' ? !isInternshipSection : isInternshipSection;
      })
      .map((entry) => ({
        ...entry,
        startDate: entry.startDate || '',
        employmentType: (entry.employmentType || 'Full-time') as StructuredExperienceEntry['employmentType'],
        isCurrent: Boolean(entry.isCurrent),
        bullets: entry.bullets || [],
        technologies: [],
        confidence: 0.75,
        evidence: 'Extracted by the resume parser. No verbatim evidence excerpt was retained.',
        section: (entry as any).section || (sectionKey === 'experience' ? 'EXPERIENCE' : 'INTERNSHIPS'),
        status: 'NEEDS_REVIEW' as VerificationStatus,
      }));
  }

  const existingSet = new Set(
    (existingProfile?.experience || []).map((item) =>
      `${normalizedKey(item.company)}|${normalizedKey(item.roleTitle)}|${normalizedKey(item.startDate)}`
    )
  );
  const seen = new Set<string>();

  const entries = source.map((entry, index) => {
    const key = `${normalizedKey(entry.company)}|${normalizedKey(entry.roleTitle)}|${normalizedKey(entry.startDate)}`;
    const duplicate = Boolean(key.trim().replace(/\|/g, '') && (seen.has(key) || existingSet.has(key)));
    seen.add(key);
    const reviewEntry = buildExperienceEntry(entry, index, sectionKey, entry);
    return duplicate
      ? { ...reviewEntry, duplicate: true, fields: reviewEntry.fields.map((field) => ({ ...field, decision: 'rejected' as ReviewDecision, confirmed: false })) }
      : reviewEntry;
  });

  return {
    key: sectionKey,
    title: sectionKey === 'experience' ? 'Work Experience' : 'Internships',
    description:
      sectionKey === 'experience'
        ? 'Roles, companies, dates and responsibilities.'
        : 'Internship roles identified in your resume.',
    kind: 'collection',
    entries,
  };
}

function buildProjectEntry(entry: StructuredProjectEntry, index: number, raw: any): ReviewEntryState {
  const fields = [
    buildField({ id: `projects-${index}-title`, key: 'title', label: 'Project title', value: entry.title, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, required: true, minLength: 2 }),
    buildField({ id: `projects-${index}-role`, key: 'role', label: 'Your role', value: entry.role, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section }),
    buildField({ id: `projects-${index}-description`, key: 'description', label: 'Description', value: entry.description || entry.bullets.join('\n'), confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, inputType: 'textarea' }),
    buildField({ id: `projects-${index}-technologies`, key: 'technologies', label: 'Technologies (comma separated)', value: entry.technologies.join(', '), confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section }),
    buildField({ id: `projects-${index}-projectUrl`, key: 'projectUrl', label: 'Live project URL', value: entry.projectUrl, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, inputType: 'url' }),
    buildField({ id: `projects-${index}-githubUrl`, key: 'githubUrl', label: 'GitHub URL', value: entry.githubUrl, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, inputType: 'url' }),
    buildField({ id: `projects-${index}-demoUrl`, key: 'demoUrl', label: 'Demo URL', value: entry.demoUrl, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, inputType: 'url' }),
  ];

  return createEntry(
    `projects-${index}`,
    entry.title,
    entry.technologies.slice(0, 4).join(' · '),
    { confidence: entry.confidence, status: entry.status, evidence: entry.evidence, section: entry.section },
    false,
    raw,
    fields
  );
}

function buildProjectsSection(
  parsedData: ParsedResumeData,
  structured: StructuredResumeData | undefined,
  existingProfile?: FullOnboardingPayload
): ReviewSectionState {
  const source: StructuredProjectEntry[] = structured
    ? structured.projects
    : parsedData.projects.map((entry) => ({
        ...entry,
        bullets: entry.bullets || [],
        confidence: 0.75,
        evidence: 'Extracted by the resume parser. No verbatim evidence excerpt was retained.',
        section: 'PROJECTS',
        status: 'NEEDS_REVIEW' as VerificationStatus,
      }));

  const existingSet = new Set((existingProfile?.projects || []).map((item) => normalizedKey(item.title)));
  const seen = new Set<string>();
  const entries = source.map((entry, index) => {
    const key = normalizedKey(entry.title);
    const duplicate = Boolean(key && (seen.has(key) || existingSet.has(key)));
    seen.add(key);
    const reviewEntry = buildProjectEntry(entry, index, entry);
    return duplicate
      ? { ...reviewEntry, duplicate: true, fields: reviewEntry.fields.map((field) => ({ ...field, decision: 'rejected' as ReviewDecision, confirmed: false })) }
      : reviewEntry;
  });

  return {
    key: 'projects',
    title: 'Projects',
    description: 'Portfolio and academic projects with technologies and links.',
    kind: 'collection',
    entries,
  };
}

function buildCertificationEntry(entry: StructuredCertificationEntry, index: number, raw: any): ReviewEntryState {
  const fields = [
    buildField({ id: `certifications-${index}-name`, key: 'name', label: 'Certification name', value: entry.name, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, required: true, minLength: 2 }),
    buildField({ id: `certifications-${index}-issuingOrganization`, key: 'issuingOrganization', label: 'Issuing organization', value: entry.issuingOrganization, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, required: true, minLength: 2 }),
    buildField({ id: `certifications-${index}-issueDate`, key: 'issueDate', label: 'Issue date', value: entry.issueDate, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section }),
    buildField({ id: `certifications-${index}-expiryDate`, key: 'expiryDate', label: 'Expiry date', value: entry.expiryDate, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section }),
    buildField({ id: `certifications-${index}-credentialId`, key: 'credentialId', label: 'Credential ID', value: entry.credentialId, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section }),
    buildField({ id: `certifications-${index}-credentialUrl`, key: 'credentialUrl', label: 'Credential URL', value: entry.credentialUrl, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, inputType: 'url' }),
  ];

  return createEntry(
    `certifications-${index}`,
    entry.name,
    entry.issuingOrganization,
    { confidence: entry.confidence, status: entry.status, evidence: entry.evidence, section: entry.section },
    false,
    raw,
    fields
  );
}

function buildCertificationsSection(
  parsedData: ParsedResumeData,
  structured: StructuredResumeData | undefined,
  existingProfile?: FullOnboardingPayload
): ReviewSectionState {
  const source: StructuredCertificationEntry[] = structured
    ? structured.certifications
    : parsedData.certifications.map((entry) => ({
        ...entry,
        confidence: 0.75,
        evidence: 'Extracted by the resume parser. No verbatim evidence excerpt was retained.',
        section: 'CERTIFICATIONS',
        status: 'NEEDS_REVIEW' as VerificationStatus,
      }));

  const existingSet = new Set((existingProfile?.certifications || []).map((item) => normalizedKey(item.name)));
  const seen = new Set<string>();
  const entries = source.map((entry, index) => {
    const key = normalizedKey(entry.name);
    const duplicate = Boolean(key && (seen.has(key) || existingSet.has(key)));
    seen.add(key);
    const reviewEntry = buildCertificationEntry(entry, index, entry);
    return duplicate
      ? { ...reviewEntry, duplicate: true, fields: reviewEntry.fields.map((field) => ({ ...field, decision: 'rejected' as ReviewDecision, confirmed: false })) }
      : reviewEntry;
  });

  return {
    key: 'certifications',
    title: 'Certifications',
    description: 'Certifications, issuers, dates and credential links.',
    kind: 'collection',
    entries,
  };
}

function buildSkillEntry(
  entry: StructuredSkillEntry,
  index: number,
  sectionKey: 'technicalSkills' | 'softSkills',
  raw: any
): ReviewEntryState {
  const fields = [
    buildField({ id: `${sectionKey}-${index}-name`, key: 'name', label: 'Skill', value: entry.name, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.name, required: true, minLength: 1 }),
    buildField({ id: `${sectionKey}-${index}-category`, key: 'category', label: 'Category', value: sectionKey === 'softSkills' ? 'SOFT_SKILL' : entry.category, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.name, inputType: 'select', options: SKILL_CATEGORY_OPTIONS }),
    buildField({ id: `${sectionKey}-${index}-level`, key: 'level', label: 'Level', value: entry.level, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.name, inputType: 'select', options: SKILL_LEVEL_OPTIONS }),
  ];

  return createEntry(
    `${sectionKey}-${index}`,
    entry.name,
    entry.category.replace(/_/g, ' '),
    { confidence: entry.confidence, status: entry.status, evidence: entry.evidence, section: entry.name },
    false,
    raw,
    fields
  );
}

function buildSkillsSection(
  parsedData: ParsedResumeData,
  structured: StructuredResumeData | undefined,
  sectionKey: 'technicalSkills' | 'softSkills',
  existingProfile?: FullOnboardingPayload
): ReviewSectionState {
  let source: StructuredSkillEntry[];

  if (structured) {
    source = sectionKey === 'technicalSkills' ? structured.technicalSkills : structured.softSkills;
  } else {
    const soft = (entry: ParsedResumeData['skills'][number]) =>
      /soft|management/i.test(entry.category || '') || ['Communication', 'Leadership', 'Problem Solving', 'Project Management'].includes(entry.name);
    source = parsedData.skills
      .filter((entry) => (sectionKey === 'softSkills' ? soft(entry) : !soft(entry)))
      .map((entry) => ({
        name: entry.name,
        category: (entry.category || 'OTHER') as StructuredSkillEntry['category'],
        level: entry.level,
        source: 'RESUME' as const,
        verified: false as const,
        confidence: 0.75,
        evidence: 'Extracted by the resume parser. No verbatim evidence excerpt was retained.',
        status: 'NEEDS_REVIEW' as VerificationStatus,
      }));
  }

  const existingSet = new Set((existingProfile?.skills || []).map((item) => normalizedKey(item.name)));
  const seen = new Set<string>();
  const entries = source.map((entry, index) => {
    const key = normalizedKey(entry.name);
    const duplicate = Boolean(key && (seen.has(key) || existingSet.has(key)));
    seen.add(key);
    const reviewEntry = buildSkillEntry(entry, index, sectionKey, entry);
    return duplicate
      ? { ...reviewEntry, duplicate: true, fields: reviewEntry.fields.map((field) => ({ ...field, decision: 'rejected' as ReviewDecision, confirmed: false })) }
      : reviewEntry;
  });

  return {
    key: sectionKey,
    title: sectionKey === 'technicalSkills' ? 'Technical Skills' : 'Soft Skills',
    description:
      sectionKey === 'technicalSkills'
        ? 'Technical tools and technologies detected in your resume.'
        : 'Interpersonal and professional skills detected in your resume.',
    kind: 'collection',
    entries,
  };
}

function buildAchievementEntry(entry: StructuredAchievementEntry, index: number, raw: any): ReviewEntryState {
  const fields = [
    buildField({ id: `achievements-${index}-title`, key: 'title', label: 'Achievement', value: entry.title, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, required: true, minLength: 2 }),
    buildField({ id: `achievements-${index}-description`, key: 'description', label: 'Description', value: entry.description, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, inputType: 'textarea' }),
    buildField({ id: `achievements-${index}-organization`, key: 'organization', label: 'Organization', value: entry.organization, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section }),
    buildField({ id: `achievements-${index}-date`, key: 'date', label: 'Date', value: entry.date, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section }),
    buildField({ id: `achievements-${index}-url`, key: 'url', label: 'Reference URL', value: entry.url, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: entry.section, inputType: 'url' }),
  ];

  return createEntry(
    `achievements-${index}`,
    entry.title,
    entry.organization,
    { confidence: entry.confidence, status: entry.status, evidence: entry.evidence, section: entry.section },
    false,
    raw,
    fields
  );
}

function buildAchievementsSection(
  structured: StructuredResumeData | undefined,
  existingProfile?: FullOnboardingPayload
): ReviewSectionState {
  const source = structured?.achievements || [];
  const existingSet = new Set((existingProfile?.achievements || []).map((item) => normalizedKey(item.title)));
  const seen = new Set<string>();
  const entries = source.map((entry, index) => {
    const key = normalizedKey(entry.title);
    const duplicate = Boolean(key && (seen.has(key) || existingSet.has(key)));
    seen.add(key);
    const reviewEntry = buildAchievementEntry(entry, index, entry);
    return duplicate
      ? { ...reviewEntry, duplicate: true, fields: reviewEntry.fields.map((field) => ({ ...field, decision: 'rejected' as ReviewDecision, confirmed: false })) }
      : reviewEntry;
  });

  return {
    key: 'achievements',
    title: 'Achievements',
    description: 'Awards, honors and notable accomplishments.',
    kind: 'collection',
    entries,
  };
}

function buildLinkEntry(entry: StructuredProfessionalLinkEntry, index: number, raw: any): ReviewEntryState {
  const fields = [
    buildField({ id: `professionalLinks-${index}-platform`, key: 'platform', label: 'Platform', value: entry.platform, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: 'LINKS', required: true, minLength: 1 }),
    buildField({ id: `professionalLinks-${index}-url`, key: 'url', label: 'URL', value: entry.url, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: 'LINKS', required: true, inputType: 'url' }),
  ];

  return createEntry(
    `professionalLinks-${index}`,
    entry.platform,
    entry.url,
    { confidence: entry.confidence, status: entry.status, evidence: entry.evidence, section: 'LINKS' },
    false,
    raw,
    fields
  );
}

function buildLinksSection(
  parsedData: ParsedResumeData,
  structured: StructuredResumeData | undefined,
  existingProfile?: FullOnboardingPayload
): ReviewSectionState {
  const source: StructuredProfessionalLinkEntry[] = structured
    ? structured.professionalLinks
    : parsedData.professionalLinks.map((entry) => ({
        ...entry,
        confidence: 0.75,
        evidence: 'Extracted by the resume parser. No verbatim evidence excerpt was retained.',
        status: 'NEEDS_REVIEW' as VerificationStatus,
      }));

  const existingSet = new Set((existingProfile?.professionalLinks || []).map((item) => normalizedKey(item.url)));
  const seen = new Set<string>();
  const entries = source.map((entry, index) => {
    const key = normalizedKey(entry.url);
    const duplicate = Boolean(key && (seen.has(key) || existingSet.has(key)));
    seen.add(key);
    const reviewEntry = buildLinkEntry(entry, index, entry);
    return duplicate
      ? { ...reviewEntry, duplicate: true, fields: reviewEntry.fields.map((field) => ({ ...field, decision: 'rejected' as ReviewDecision, confirmed: false })) }
      : reviewEntry;
  });

  return {
    key: 'professionalLinks',
    title: 'Professional Links',
    description: 'LinkedIn, GitHub, portfolio and other professional profiles.',
    kind: 'collection',
    entries,
  };
}

function buildLanguageEntry(entry: StructuredLanguageEntry, index: number, raw: any): ReviewEntryState {
  const fields = [
    buildField({ id: `languages-${index}-language`, key: 'language', label: 'Language', value: entry.language, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: 'LANGUAGES', required: true, minLength: 2 }),
    buildField({ id: `languages-${index}-proficiency`, key: 'proficiency', label: 'Proficiency', value: entry.proficiency, confidence: entry.confidence, extractionStatus: entry.status, evidence: entry.evidence, section: 'LANGUAGES', inputType: 'select', options: LANGUAGE_PROFICIENCY_OPTIONS }),
  ];

  return createEntry(
    `languages-${index}`,
    entry.language,
    entry.proficiency ? entry.proficiency.charAt(0) + entry.proficiency.slice(1).toLowerCase() : undefined,
    { confidence: entry.confidence, status: entry.status, evidence: entry.evidence, section: 'LANGUAGES' },
    false,
    raw,
    fields
  );
}

function buildLanguagesSection(structured: StructuredResumeData | undefined): ReviewSectionState {
  const source = structured?.languages || [];
  const seen = new Set<string>();
  const entries = source.map((entry, index) => {
    const key = normalizedKey(entry.language);
    const duplicate = Boolean(key && seen.has(key));
    seen.add(key);
    const reviewEntry = buildLanguageEntry(entry, index, entry);
    return duplicate
      ? { ...reviewEntry, duplicate: true, fields: reviewEntry.fields.map((field) => ({ ...field, decision: 'rejected' as ReviewDecision, confirmed: false })) }
      : reviewEntry;
  });

  return {
    key: 'languages',
    title: 'Languages',
    description: 'Spoken languages and proficiency levels.',
    kind: 'collection',
    entries,
  };
}

export function buildReviewSections(
  parsedData: ParsedResumeData,
  existingProfile?: FullOnboardingPayload,
  accountEmail?: string
): ReviewSectionState[] {
  const structured = parsedData.structuredData;

  return [
    buildPersonalSection(parsedData, structured, existingProfile, accountEmail),
    buildEducationSection(parsedData, structured, existingProfile),
    buildExperienceSection(parsedData, structured, 'experience', existingProfile),
    buildExperienceSection(parsedData, structured, 'internships', existingProfile),
    buildProjectsSection(parsedData, structured, existingProfile),
    buildCertificationsSection(parsedData, structured, existingProfile),
    buildSkillsSection(parsedData, structured, 'technicalSkills', existingProfile),
    buildSkillsSection(parsedData, structured, 'softSkills', existingProfile),
    buildAchievementsSection(structured, existingProfile),
    buildLinksSection(parsedData, structured, existingProfile),
    buildLanguagesSection(structured),
  ];
}

export function serializeReviewSections(
  sections: ReviewSectionState[]
): Record<string, PersistedReviewFieldState> {
  const fields: Record<string, PersistedReviewFieldState> = {};
  for (const section of sections) {
    for (const entry of section.entries) {
      for (const field of entry.fields) {
        fields[field.id] = {
          value: field.value,
          decision: field.decision,
          edited: field.edited,
          confirmed: field.confirmed,
        };
      }
    }
  }
  return fields;
}

export function restoreReviewSections(
  sections: ReviewSectionState[],
  fields?: Record<string, PersistedReviewFieldState> | null
): ReviewSectionState[] {
  if (!fields) return sections;

  return sections.map((section) => ({
    ...section,
    entries: section.entries.map((entry) => ({
      ...entry,
      fields: entry.fields.map((field) => {
        const persisted = fields[field.id];
        if (!persisted) return field;
        return {
          ...field,
          value: persisted.value,
          decision: persisted.decision,
          edited: persisted.edited,
          confirmed: persisted.confirmed,
        };
      }),
    })),
  }));
}

export function setFieldDecision(
  field: ReviewFieldState,
  decision: ReviewDecision
): ReviewFieldState {
  if (decision === 'accepted' && !isValidFieldValue(field)) return field;
  return { ...field, decision, confirmed: true };
}

export function updateFieldValue(field: ReviewFieldState, value: string): ReviewFieldState {
  const trimmed = value.trim();
  return {
    ...field,
    value,
    decision: trimmed ? 'pending' : field.required ? 'pending' : 'rejected',
    confirmed: true,
    edited: true,
  };
}

export function updateEntryField(
  section: ReviewSectionState,
  entryId: string,
  fieldId: string,
  updater: (field: ReviewFieldState) => ReviewFieldState
): ReviewSectionState {
  return {
    ...section,
    entries: section.entries.map((entry) =>
      entry.id === entryId
        ? {
            ...entry,
            fields: entry.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
          }
        : entry
    ),
  };
}

export function setSectionDecision(
  section: ReviewSectionState,
  decision: ReviewDecision
): ReviewSectionState {
  return {
    ...section,
    entries: section.entries.map((entry) => ({
      ...entry,
      fields: entry.fields.map((field) => {
        if (decision === 'accepted' && !isValidFieldValue(field)) return field;
        return { ...field, decision, confirmed: true };
      }),
    })),
  };
}

export function collectSectionStats(section: ReviewSectionState): ReviewSectionStats {
  const stats: ReviewSectionStats = { ...EMPTY_STATS };

  for (const entry of section.entries) {
    if (entry.duplicate) stats.duplicateEntries += 1;
    for (const field of entry.fields) {
      const hasValue = field.value.trim().length > 0;
      if (hasValue) stats.total += 1;
      if (hasValue && field.decision === 'accepted') stats.approved += 1;
      if (hasValue && field.decision === 'pending') stats.pending += 1;
      if (hasValue && field.decision === 'rejected') stats.rejected += 1;
      if (isMissingField(field)) stats.missing += 1;
    }
  }

  stats.reviewRequired = stats.pending + stats.missing;
  return stats;
}

export function collectReviewStats(sections: ReviewSectionState[]): ReviewStats {
  const sectionStats = {} as Record<ReviewSectionKey, ReviewSectionStats>;
  const overall: ReviewStats = {
    approved: 0,
    pending: 0,
    rejected: 0,
    missing: 0,
    total: 0,
    reviewRequired: 0,
    progress: 0,
    sections: sectionStats,
  };

  for (const section of sections) {
    const stats = collectSectionStats(section);
    sectionStats[section.key] = stats;
    overall.approved += stats.approved;
    overall.pending += stats.pending;
    overall.rejected += stats.rejected;
    overall.missing += stats.missing;
    overall.total += stats.total;
  }

  overall.reviewRequired = overall.pending + overall.missing;
  const denominator = overall.approved + overall.reviewRequired;
  overall.progress = denominator > 0 ? Math.round((overall.approved / denominator) * 100) : 100;
  return overall;
}

function acceptedValue(entry: ReviewEntryState, key: string): string | undefined {
  const field = entry.fields.find((candidate) => candidate.key === key);
  if (!field || field.decision !== 'accepted' || !isValidFieldValue(field)) return undefined;
  return field.value.trim() || undefined;
}

function acceptedValues(entry: ReviewEntryState): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of entry.fields) {
    if (field.decision !== 'accepted' || !isValidFieldValue(field)) continue;
    values[field.key] = field.value.trim();
  }
  return values;
}

function splitList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value?: string): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function findSection(sections: ReviewSectionState[], key: ReviewSectionKey): ReviewSectionState | undefined {
  return sections.find((section) => section.key === key);
}

function personalFieldValue(
  section: ReviewSectionState | undefined,
  key: string
): string | undefined {
  const field = section?.entries[0]?.fields.find((candidate) => candidate.key === key);
  if (!field || field.decision !== 'accepted' || !isValidFieldValue(field)) return undefined;
  const value = field.value.trim();
  return value || undefined;
}

export function buildApprovedResume(
  sections: ReviewSectionState[],
  parsedData: ParsedResumeData
): ApprovedResumeResult {
  let skippedEntries = 0;

  const personalSection = findSection(sections, 'personal');
  const personalInfo: ParsedResumeData['personalInfo'] = {};
  const structuredPersonal: StructuredResumeData['personalInfo'] = {};
  const personalKeys: Array<keyof ParsedResumeData['personalInfo']> = [
    'name',
    'email',
    'phone',
    'location',
    'headline',
    'bio',
  ];

  for (const key of personalKeys) {
    const value = personalFieldValue(personalSection, key);
    if (!value) continue;
    personalInfo[key] = value;
    const field = personalSection?.entries[0]?.fields.find((candidate) => candidate.key === key);
    if (field) {
      (structuredPersonal as any)[key] = {
        value,
        confidence: field.confidence,
        evidence: field.evidence,
        section: field.section || 'CONTACT',
        status: 'VERIFIED' as VerificationStatus,
      };
    }
  }

  const education: StructuredEducationEntry[] = [];
  for (const entry of findSection(sections, 'education')?.entries || []) {
    if (!entryIsComplete(entry)) {
      if (entry.fields.some((field) => field.decision === 'accepted')) skippedEntries += 1;
      continue;
    }
    const values = acceptedValues(entry);
    const startYear = Number(values.startYear);
    const endYear = values.endYear ? Number(values.endYear) : null;
    const isCurrent = entry.raw?.isCurrent === true || (!values.endYear && entry.raw?.isCurrent !== false);
    education.push({
      institution: values.institution,
      degree: values.degree,
      fieldOfStudy: values.fieldOfStudy || '',
      location: values.location,
      startYear,
      endYear: isCurrent ? null : endYear,
      isCurrent,
      gpa: values.gpa,
      educationLevel: entry.raw?.educationLevel || 'OTHER',
      source: 'RESUME',
      confidence: entry.confidence,
      evidence: entry.evidence,
      section: entry.section || 'EDUCATION',
      status: 'VERIFIED',
    });
  }

  const buildExperienceList = (sectionKey: 'experience' | 'internships'): StructuredExperienceEntry[] => {
    const result: StructuredExperienceEntry[] = [];
    for (const entry of findSection(sections, sectionKey)?.entries || []) {
      if (!entryIsComplete(entry)) {
        if (entry.fields.some((field) => field.decision === 'accepted')) skippedEntries += 1;
        continue;
      }
      const values = acceptedValues(entry);
      const description = values.description || '';
      const isCurrent = values.endDate ? false : entry.raw?.isCurrent === true;
      result.push({
        company: values.company,
        roleTitle: values.roleTitle,
        jobTitle: values.roleTitle,
        employmentType:
          sectionKey === 'internships'
            ? 'Internship'
            : (values.employmentType as StructuredExperienceEntry['employmentType']) || 'Full-time',
        location: values.location,
        startDate: values.startDate,
        endDate: isCurrent ? 'Present' : values.endDate || null,
        isCurrent,
        description: description || undefined,
        bullets: splitLines(description),
        technologies: splitList(values.technologies),
        source: 'RESUME',
        confidence: entry.confidence,
        evidence: entry.evidence,
        section: entry.section || (sectionKey === 'internships' ? 'INTERNSHIPS' : 'EXPERIENCE'),
        status: 'VERIFIED',
      });
    }
    return result;
  };

  const experience = buildExperienceList('experience');
  const internships = buildExperienceList('internships');

  const projects: StructuredProjectEntry[] = [];
  for (const entry of findSection(sections, 'projects')?.entries || []) {
    if (!entryIsComplete(entry)) {
      if (entry.fields.some((field) => field.decision === 'accepted')) skippedEntries += 1;
      continue;
    }
    const values = acceptedValues(entry);
    const description = values.description || '';
    projects.push({
      title: values.title,
      description: description || undefined,
      role: values.role,
      technologies: splitList(values.technologies),
      projectUrl: values.projectUrl,
      githubUrl: values.githubUrl,
      demoUrl: values.demoUrl,
      bullets: splitLines(description),
      source: 'RESUME',
      confidence: entry.confidence,
      evidence: entry.evidence,
      section: entry.section || 'PROJECTS',
      status: 'VERIFIED',
    });
  }

  const certifications: StructuredCertificationEntry[] = [];
  for (const entry of findSection(sections, 'certifications')?.entries || []) {
    if (!entryIsComplete(entry)) {
      if (entry.fields.some((field) => field.decision === 'accepted')) skippedEntries += 1;
      continue;
    }
    const values = acceptedValues(entry);
    certifications.push({
      name: values.name,
      issuingOrganization: values.issuingOrganization,
      issueDate: values.issueDate,
      expiryDate: values.expiryDate,
      credentialId: values.credentialId,
      credentialUrl: values.credentialUrl,
      source: 'RESUME',
      confidence: entry.confidence,
      evidence: entry.evidence,
      section: entry.section || 'CERTIFICATIONS',
      status: 'VERIFIED',
    });
  }

  const buildSkillsList = (sectionKey: 'technicalSkills' | 'softSkills'): StructuredSkillEntry[] => {
    const result: StructuredSkillEntry[] = [];
    for (const entry of findSection(sections, sectionKey)?.entries || []) {
      const name = acceptedValue(entry, 'name');
      if (!name) continue;
      const values = acceptedValues(entry);
      result.push({
        name,
        category:
          sectionKey === 'softSkills'
            ? 'SOFT_SKILL'
            : (values.category as StructuredSkillEntry['category']) || 'OTHER',
        level: (values.level as StructuredSkillEntry['level']) || 'INTERMEDIATE',
        source: 'RESUME',
        verified: false,
        confidence: entry.confidence,
        evidence: entry.evidence,
        status: 'VERIFIED',
      });
    }
    return result;
  };

  const technicalSkills = buildSkillsList('technicalSkills');
  const softSkills = buildSkillsList('softSkills');

  const achievements: StructuredAchievementEntry[] = [];
  for (const entry of findSection(sections, 'achievements')?.entries || []) {
    if (!entryIsComplete(entry)) {
      if (entry.fields.some((field) => field.decision === 'accepted')) skippedEntries += 1;
      continue;
    }
    const values = acceptedValues(entry);
    achievements.push({
      title: values.title,
      description: values.description,
      organization: values.organization,
      date: values.date,
      url: values.url,
      source: 'RESUME',
      confidence: entry.confidence,
      evidence: entry.evidence,
      section: entry.section || 'ACHIEVEMENTS',
      status: 'VERIFIED',
    });
  }

  const professionalLinks: StructuredProfessionalLinkEntry[] = [];
  for (const entry of findSection(sections, 'professionalLinks')?.entries || []) {
    if (!entryIsComplete(entry)) {
      if (entry.fields.some((field) => field.decision === 'accepted')) skippedEntries += 1;
      continue;
    }
    const values = acceptedValues(entry);
    professionalLinks.push({
      platform: values.platform,
      url: values.url,
      confidence: entry.confidence,
      evidence: entry.evidence,
      status: 'VERIFIED',
    });
  }

  const languages: StructuredLanguageEntry[] = [];
  for (const entry of findSection(sections, 'languages')?.entries || []) {
    if (!entryIsComplete(entry)) {
      if (entry.fields.some((field) => field.decision === 'accepted')) skippedEntries += 1;
      continue;
    }
    const values = acceptedValues(entry);
    languages.push({
      language: values.language,
      proficiency: values.proficiency as StructuredLanguageEntry['proficiency'],
      confidence: entry.confidence,
      evidence: entry.evidence,
      status: 'VERIFIED',
    });
  }

  const combinedExperience = [...experience, ...internships];
  const combinedSkills = [...technicalSkills, ...softSkills];
  const structuredBase = parsedData.structuredData;

  const structuredData: StructuredResumeData | undefined = structuredBase
    ? {
        ...structuredBase,
        personalInfo: structuredPersonal,
        education,
        experience,
        internships,
        projects,
        certifications,
        technicalSkills,
        softSkills,
        skills: combinedSkills.map((skill) => ({
          name: skill.name,
          category: skill.category,
          level: skill.level,
          source: 'RESUME',
          verified: false,
        })),
        achievements,
        professionalLinks,
        languages,
      }
    : undefined;

  const data: ParsedResumeData = {
    rawText: parsedData.rawText,
    extractionMetadata: parsedData.extractionMetadata,
    structuredData,
    personalInfo,
    education: education.map((entry) => ({
      institution: entry.institution,
      degree: entry.degree,
      fieldOfStudy: entry.fieldOfStudy,
      location: entry.location,
      startYear: entry.startYear,
      endYear: entry.endYear,
      isCurrent: entry.isCurrent,
      gpa: entry.gpa,
      source: 'RESUME',
    })),
    experience: combinedExperience.map((entry) => ({
      company: entry.company,
      roleTitle: entry.roleTitle,
      jobTitle: entry.jobTitle,
      employmentType: entry.employmentType,
      location: entry.location,
      startDate: entry.startDate,
      endDate: entry.endDate,
      isCurrent: entry.isCurrent,
      description: entry.description,
      bullets: entry.bullets,
      source: 'RESUME',
    })),
    skills: combinedSkills.map((entry) => ({
      name: entry.name,
      category: entry.category,
      level: entry.level,
      source: 'RESUME',
      verified: false,
    })),
    projects: projects.map((entry) => ({
      title: entry.title,
      description: entry.description,
      role: entry.role,
      technologies: entry.technologies,
      projectUrl: entry.projectUrl,
      githubUrl: entry.githubUrl,
      demoUrl: entry.demoUrl,
      bullets: entry.bullets,
      source: 'RESUME',
    })),
    certifications: certifications.map((entry) => ({
      name: entry.name,
      issuingOrganization: entry.issuingOrganization,
      issueDate: entry.issueDate,
      expiryDate: entry.expiryDate,
      credentialId: entry.credentialId,
      credentialUrl: entry.credentialUrl,
      source: 'RESUME',
    })),
    professionalLinks: professionalLinks.map((entry) => ({
      platform: entry.platform,
      url: entry.url,
    })),
  };

  return { data, skippedEntries };
}
