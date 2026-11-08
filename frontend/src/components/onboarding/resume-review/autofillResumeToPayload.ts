import { ParsedResumeData } from '@backend/services/resumeParserService';
import { FullOnboardingPayload } from '@backend/validations/onboardingSchemas';
import { canonicalUrlKey, normalizedKey, normalizeIndianMobile } from './reviewModel';

export interface AutofillCounts {
  education: number;
  experience: number;
  projects: number;
  skills: number;
  certifications: number;
  links: number;
  achievements: number;
  totalRecords: number;
}

export interface AutofillSummary {
  filename: string;
  status: 'success' | 'partial';
  counts: AutofillCounts;
  populatedSections: string[];
  attentionItems: string[];
}

export interface AutofillResult {
  updatedPayload: FullOnboardingPayload;
  summary: AutofillSummary;
}

/**
 * Composite key functions for strict deduplication
 */
export function educationKey(item: {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
}): string {
  return `${normalizedKey(item.institution)}|${normalizedKey(item.degree)}|${normalizedKey(item.fieldOfStudy)}`;
}

function normalizedEndDate(endDate?: string | null, isCurrent?: boolean): string {
  if (isCurrent || (endDate && (endDate.toLowerCase() === 'present' || endDate.toLowerCase() === 'current'))) {
    return 'current';
  }
  return normalizedKey(endDate || '');
}

export function experienceKey(item: {
  company?: string;
  roleTitle?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
}): string {
  return `${normalizedKey(item.company)}|${normalizedKey(item.roleTitle)}|${normalizedKey(item.startDate)}|${normalizedEndDate(item.endDate, item.isCurrent)}`;
}

export function projectKey(item: { title?: string }): string {
  return normalizedKey(item.title);
}

export function certificationKey(item: {
  name?: string;
  issuingOrganization?: string;
}): string {
  return `${normalizedKey(item.name)}|${normalizedKey(item.issuingOrganization)}`;
}

export function skillKey(item: { name?: string }): string {
  return normalizedKey(item.name);
}

export function achievementKey(item: { title?: string }): string {
  return normalizedKey(item.title);
}

export function linkKey(item: { url?: string }): string {
  return canonicalUrlKey(item.url);
}

/**
 * Merges unique elements into an existing array based on key function.
 * Preserves existing elements untouched; appends novel incoming items.
 */
function mergeUnique<T>(
  existing: T[],
  incoming: T[],
  keyFn: (item: T) => string
): { merged: T[]; addedCount: number } {
  const seen = new Set(existing.map(keyFn).filter(Boolean));
  const merged = [...existing];
  let addedCount = 0;

  for (const item of incoming) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    addedCount++;
  }

  return { merged, addedCount };
}

/**
 * Resolves employment type strictly from evidence without inventing defaults.
 */
function parseEmploymentType(raw?: string, section?: string): string | undefined {
  if (raw && raw.trim()) {
    const trimmed = raw.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'full-time' || lower === 'fulltime') return 'Full-time';
    if (lower === 'part-time' || lower === 'parttime') return 'Part-time';
    if (lower === 'internship' || lower === 'intern') return 'Internship';
    if (lower === 'contract') return 'Contract';
    if (lower === 'freelance') return 'Freelance';
    if (lower === 'self-employed') return 'Self-employed';
    return trimmed;
  }
  if (section === 'INTERNSHIPS') {
    return 'Internship';
  }
  // Never default unknown employment types to Full-time
  return undefined;
}

/**
 * Resolves project type strictly from evidence without inventing defaults.
 */
function parseProjectType(raw?: string): string | undefined {
  if (raw && raw.trim()) {
    return raw.trim();
  }
  // Never invent project type like 'Personal' when unspecified
  return undefined;
}

/**
 * Automatically populates the onboarding form payload from parsed resume data.
 * Adheres to all Phase 5.2 / Easy Apply requirements:
 * 1. Preserves existing candidate entries
 * 2. Deduplicates by composite keys
 * 3. Never invents employment type or project type
 * 4. Never overwrites account email
 * 5. Generates diagnostic summary and attention items
 */
export function autofillResumeToPayload(
  existing: FullOnboardingPayload,
  parsed: ParsedResumeData,
  filename: string = 'Resume'
): AutofillResult {
  const attentionItems: string[] = [];
  const populatedSections: string[] = [];

  // 1. Personal Information (Preserve manual input; do not overwrite non-empty fields)
  const aboutYou = { ...existing.aboutYou };
  const personal = parsed.personalInfo || {};

  if (!aboutYou.name?.trim() && personal.name?.trim()) {
    aboutYou.name = personal.name.trim();
  }

  // Handle phone validation and normalization
  if (!aboutYou.phone?.trim() && personal.phone?.trim()) {
    const indianMobile = normalizeIndianMobile(personal.phone);
    if (indianMobile) {
      aboutYou.phone = `+91 ${indianMobile}`;
    } else {
      // Leave blank and raise attention item so user is not blocked
      attentionItems.push('Phone Number: Resume phone requires 10-digit Indian mobile verification.');
    }
  }

  if (!aboutYou.location?.trim() && personal.location?.trim()) {
    aboutYou.location = personal.location.trim();
  }

  if (!aboutYou.headline?.trim() && personal.headline?.trim()) {
    aboutYou.headline = personal.headline.trim();
  }

  if (!aboutYou.bio?.trim() && personal.bio?.trim()) {
    aboutYou.bio = personal.bio.trim();
  }

  if (aboutYou.name || aboutYou.phone || aboutYou.location || aboutYou.headline || aboutYou.bio) {
    populatedSections.push('Personal Details');
  }

  // 2. Education
  const incomingEducation = (parsed.education || []).map((item) => ({
    institution: item.institution || '',
    degree: item.degree || '',
    fieldOfStudy: item.fieldOfStudy || '',
    location: item.location || '',
    startYear: typeof item.startYear === 'number' ? item.startYear : new Date().getFullYear() - 4,
    endYear: typeof item.endYear === 'number' ? item.endYear : (item.endYear === null ? null : undefined),
    isCurrent: Boolean(item.isCurrent),
    gpa: item.gpa || '',
    coursework: (item as any).coursework || '',
    achievements: (item as any).achievements || '',
    source: 'RESUME',
  }));

  const { merged: education, addedCount: eduAdded } = mergeUnique(
    existing.education,
    incomingEducation,
    educationKey
  );

  if (education.length > 0) {
    populatedSections.push('Education');
  }

  // Check for any incomplete education entries needing attention
  education.forEach((edu) => {
    if (!edu.degree || !edu.fieldOfStudy) {
      const label = edu.institution || 'Education record';
      const itemMsg = `Education: Please verify degree and field of study for "${label}".`;
      if (!attentionItems.includes(itemMsg)) {
        attentionItems.push(itemMsg);
      }
    }
  });

  // 3. Work Experience & Internships
  const incomingExperience = (parsed.experience || []).map((item) => {
    const empType = parseEmploymentType(item.employmentType, (item as any).section);
    return {
      company: item.company || '',
      roleTitle: item.roleTitle || item.jobTitle || '',
      jobTitle: item.jobTitle || item.roleTitle || '',
      employmentType: empType,
      location: item.location || '',
      startDate: item.startDate || '',
      endDate: item.endDate || null,
      isCurrent: Boolean(item.isCurrent),
      description:
        item.description ||
        (item.bullets && item.bullets.length > 0 ? item.bullets.join('\n') : ''),
      bullets: item.bullets || [],
      responsibilities: (item as any).responsibilities || '',
      achievements: (item as any).achievements || '',
      source: 'RESUME',
    };
  });

  const { merged: experience, addedCount: expAdded } = mergeUnique(
    existing.experience,
    incomingExperience,
    experienceKey
  );

  const hasNoExperience = experience.length > 0 ? false : existing.hasNoExperience;

  if (experience.length > 0) {
    populatedSections.push('Work Experience');
  }

  // 4. Projects
  const incomingProjects = (parsed.projects || []).map((item) => ({
    title: item.title || '',
    description:
      item.description ||
      (item.bullets && item.bullets.length > 0 ? item.bullets.join('\n') : ''),
    role: item.role || '',
    technologies: item.technologies || [],
    bullets: item.bullets || [],
    projectType: parseProjectType((item as any).projectType),
    projectUrl: item.projectUrl || item.demoUrl || '',
    githubUrl: item.githubUrl || '',
    demoUrl: item.demoUrl || '',
    achievements: (item as any).achievements || '',
    source: 'RESUME',
  }));

  const { merged: projects, addedCount: projAdded } = mergeUnique(
    existing.projects,
    incomingProjects,
    projectKey
  );

  if (projects.length > 0) {
    populatedSections.push('Projects');
  }

  // 5. Certifications
  const incomingCertifications = (parsed.certifications || []).map((item) => ({
    name: item.name || '',
    issuingOrganization: item.issuingOrganization || '',
    issueDate: item.issueDate || '',
    expiryDate: item.expiryDate || '',
    credentialId: item.credentialId || '',
    credentialUrl: item.credentialUrl || '',
    source: 'RESUME',
  }));

  const { merged: certifications, addedCount: certAdded } = mergeUnique(
    existing.certifications,
    incomingCertifications,
    certificationKey
  );

  if (certifications.length > 0) {
    populatedSections.push('Certifications');
  }

  // 6. Skills (Technical + Soft)
  const incomingSkills: FullOnboardingPayload['skills'] = [];
  const seenSkillNames = new Set<string>();

  const addSkillCandidate = (name?: string, category?: string, level?: any) => {
    if (!name || !name.trim()) return;
    const cleanName = name.trim();
    const key = normalizedKey(cleanName);
    if (!key || seenSkillNames.has(key)) return;
    seenSkillNames.add(key);
    incomingSkills.push({
      name: cleanName,
      category: category || 'Other',
      level: level || 'INTERMEDIATE',
      source: 'RESUME',
      verified: false,
    });
  };

  (parsed.skills || []).forEach((s) => addSkillCandidate(s.name, s.category, s.level));
  (parsed.structuredData?.technicalSkills || []).forEach((s) =>
    addSkillCandidate(s.name, s.category, s.level)
  );
  (parsed.structuredData?.softSkills || []).forEach((s) =>
    addSkillCandidate(s.name, 'Soft Skills', s.level)
  );

  const { merged: skills, addedCount: skillAdded } = mergeUnique(
    existing.skills,
    incomingSkills,
    skillKey
  );

  if (skills.length > 0) {
    populatedSections.push('Skills');
  }

  // 7. Achievements
  const incomingAchievements = (parsed.structuredData?.achievements || []).map((item) => ({
    title: item.title || '',
    description: item.description || '',
    organization: item.organization || (item as any).issuer || '',
    date: item.date || '',
    url: item.url || '',
    source: 'RESUME',
  }));

  const { merged: achievements, addedCount: achAdded } = mergeUnique(
    existing.achievements,
    incomingAchievements,
    achievementKey
  );

  if (achievements.length > 0) {
    populatedSections.push('Achievements');
  }

  // 8. Professional Links
  const incomingLinks: FullOnboardingPayload['professionalLinks'] = [];
  const seenLinkUrls = new Set<string>();

  const addLinkCandidate = (platform: string, rawUrl?: string) => {
    if (!rawUrl || !rawUrl.trim()) return;
    const clean = rawUrl.trim();
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(clean) ? clean : `https://${clean}`;
    const key = canonicalUrlKey(withScheme);
    if (!key || seenLinkUrls.has(key)) return;
    seenLinkUrls.add(key);
    incomingLinks.push({
      platform: platform || 'Other',
      url: withScheme,
    });
  };

  (parsed.professionalLinks || []).forEach((l) => addLinkCandidate(l.platform, l.url));
  const personalAny = parsed.personalInfo as any;
  if (personalAny?.linkedin) addLinkCandidate('LinkedIn', personalAny.linkedin);
  if (personalAny?.github) addLinkCandidate('GitHub', personalAny.github);
  if (personalAny?.website) addLinkCandidate('Portfolio', personalAny.website);
  const structuredPersonalAny = parsed.structuredData?.personalInfo as any;
  if (structuredPersonalAny?.linkedin?.value) addLinkCandidate('LinkedIn', structuredPersonalAny.linkedin.value);
  if (structuredPersonalAny?.github?.value) addLinkCandidate('GitHub', structuredPersonalAny.github.value);
  if (structuredPersonalAny?.website?.value) addLinkCandidate('Portfolio', structuredPersonalAny.website.value);

  const { merged: professionalLinks, addedCount: linkAdded } = mergeUnique(
    existing.professionalLinks,
    incomingLinks,
    linkKey
  );

  if (professionalLinks.length > 0) {
    populatedSections.push('Professional Links');
  }

  // 9. Low confidence inspection
  if (parsed.structuredData?.personalInfo) {
    const sPersonal = parsed.structuredData.personalInfo;
    if (sPersonal.phone && (sPersonal.phone.status === 'LOW_CONFIDENCE' || sPersonal.phone.confidence < 0.6)) {
      const msg = 'Phone Number: Low extraction confidence — please verify.';
      if (!attentionItems.includes(msg)) attentionItems.push(msg);
    }
  }

  const updatedPayload: FullOnboardingPayload = {
    ...existing,
    aboutYou,
    education,
    hasNoExperience,
    experience,
    skills,
    projects,
    certifications,
    achievements,
    professionalLinks,
  };

  const counts: AutofillCounts = {
    education: education.length,
    experience: experience.length,
    projects: projects.length,
    skills: skills.length,
    certifications: certifications.length,
    links: professionalLinks.length,
    achievements: achievements.length,
    totalRecords:
      education.length +
      experience.length +
      projects.length +
      skills.length +
      certifications.length +
      professionalLinks.length +
      achievements.length,
  };

  const summary: AutofillSummary = {
    filename,
    status: attentionItems.length > 0 ? 'partial' : 'success',
    counts,
    populatedSections,
    attentionItems,
  };

  return {
    updatedPayload,
    summary,
  };
}
