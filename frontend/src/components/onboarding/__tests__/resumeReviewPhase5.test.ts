import assert from 'node:assert/strict';
import type { ParsedResumeData } from '@backend/services/resumeParserService';
import type { FullOnboardingPayload } from '@backend/validations/onboardingSchemas';
import { Step1AboutYouSchema } from '@backend/validations/onboardingSchemas';
import {
  REVIEW_SECTIONS,
  buildApprovedResume,
  buildReviewSections,
  collectReviewStats,
  getEffectiveStatus,
  restoreReviewSections,
  serializeReviewSections,
  setFieldDecision,
  setSectionDecision,
  updateFieldValue,
  type ReviewSectionKey,
  type ReviewSectionState,
} from '../resume-review/reviewModel';
import { mergeApprovedResume } from '../resume-review/mergeApprovedResume';

function field(value: string, confidence = 0.95, status = 'AUTO_HIGH') {
  return {
    value,
    confidence,
    evidence: value,
    section: 'EXPERIENCE',
    status,
    source: 'RESUME',
  } as any;
}

function makeParsedResume(): ParsedResumeData {
  const structuredData: any = {
    rawText: 'Alex Morgan\nSenior Engineer at Acme\nReact TypeScript',
    qualityScore: 82,
    personalInfo: {
      name: field('Alex Morgan', 0.98),
      email: field('alex@example.com', 0.98),
      phone: field('+1 555 0100', 0.51, 'LOW_CONFIDENCE'),
      location: field('Austin, TX', 0.86),
      headline: field('Senior Software Engineer', 0.88),
      linkedin: field('linkedin.com/in/alexmorgan', 0.97),
      website: field('alexmorgan.dev', 0.9),
      github: field('github.com/alexmorgan', 0.93),
    },
    education: [
      {
        ...field('University of Texas', 0.96),
        institution: 'University of Texas',
        degree: 'B.S. Computer Science',
        fieldOfStudy: 'Computer Science',
        location: 'Austin, TX',
        startYear: 2014,
        endYear: 2018,
        isCurrent: false,
        gpa: '3.8',
      },
    ],
    experience: [
      {
        ...field('Acme Corp', 0.97),
        company: 'Acme Corp',
        roleTitle: 'Senior Software Engineer',
        employmentType: 'Full-time',
        location: 'Austin, TX',
        startDate: '2020-01',
        endDate: null,
        isCurrent: true,
        description: 'Built platform services.',
        bullets: ['Led migration to React', 'Improved API latency by 40%'],
        technologies: ['React', 'TypeScript', 'Node.js'],
      },
      {
        ...field('Beta Labs', 0.91),
        company: 'Beta Labs',
        roleTitle: 'Software Engineering Intern',
        employmentType: 'Internship',
        location: 'Remote',
        startDate: '2019-05',
        endDate: '2019-08',
        isCurrent: false,
        description: 'Worked on internal tools.',
        bullets: ['Built a reporting dashboard'],
        technologies: ['Python'],
      },
    ],
    internships: [
      {
        ...field('Beta Labs', 0.93),
        company: 'Beta Labs',
        roleTitle: 'Software Engineering Intern',
        employmentType: 'Internship',
        location: 'Remote',
        startDate: '2019-05',
        endDate: '2019-08',
        isCurrent: false,
        description: 'Worked on internal tools.',
        bullets: ['Built a reporting dashboard'],
        technologies: ['Python'],
      },
    ],
    projects: [
      {
        ...field('Career Pathways', 0.94),
        title: 'Career Pathways',
        description: 'A career exploration platform.',
        technologies: ['React', 'PostgreSQL'],
        bullets: ['Serves 10k monthly users'],
        role: 'Lead Engineer',
        projectUrl: 'https://career-pathways.example.com',
        githubUrl: 'https://github.com/alex/career-pathways',
        demoUrl: 'https://demo.career-pathways.example.com',
      },
    ],
    certifications: [
      {
        ...field('AWS Solutions Architect', 0.95),
        name: 'AWS Solutions Architect',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2022-06',
        expiryDate: '2025-06',
        credentialId: 'AWS-123',
        credentialUrl: 'https://example.com/cert',
      },
    ],
    technicalSkills: [
      {
        ...field('React', 0.97),
        name: 'React',
        category: 'FRONTEND',
        level: 'EXPERT',
        verified: false,
      },
      {
        ...field('TypeScript', 0.95),
        name: 'TypeScript',
        category: 'LANGUAGES',
        level: 'ADVANCED',
        verified: false,
      },
    ],
    softSkills: [
      {
        ...field('Leadership', 0.82),
        name: 'Leadership',
        category: 'LEADERSHIP',
        level: 'ADVANCED',
        verified: false,
      },
    ],
    skills: [],
    achievements: [
      {
        ...field('Dean List', 0.9),
        title: 'Dean List',
        description: 'Awarded for academic excellence.',
        date: '2018-05',
        issuer: 'University of Texas',
      },
    ],
    professionalLinks: [
      {
        ...field('LinkedIn', 0.98),
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/alexmorgan',
        label: 'LinkedIn',
      },
    ],
    languages: [
      {
        ...field('English', 0.98),
        language: 'English',
        proficiency: 'NATIVE',
      },
      {
        ...field('Spanish', 0.88),
        language: 'Spanish',
        proficiency: 'INTERMEDIATE',
      },
    ],
  };

  return {
    rawText: structuredData.rawText,
    personalInfo: {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      phone: '',
      location: 'Austin, TX',
      headline: 'Senior Software Engineer',
      linkedin: 'linkedin.com/in/alexmorgan',
      website: 'alexmorgan.dev',
      github: 'github.com/alexmorgan',
    },
    education: [
      {
        institution: 'University of Texas',
        degree: 'B.S. Computer Science',
        fieldOfStudy: 'Computer Science',
        location: 'Austin, TX',
        startYear: 2014,
        endYear: 2018,
        isCurrent: false,
        gpa: '3.8',
        source: 'RESUME',
      },
    ],
    experience: [
      {
        company: 'Acme Corp',
        roleTitle: 'Senior Software Engineer',
        employmentType: 'Full-time',
        location: 'Austin, TX',
        startDate: '2020-01',
        isCurrent: true,
        description: 'Built platform services.',
        bullets: ['Led migration to React', 'Improved API latency by 40%'],
        source: 'RESUME',
      },
    ],
    skills: [
      {
        name: 'React',
        category: 'FRONTEND',
        level: 'EXPERT',
        verified: false,
        source: 'RESUME',
      },
    ],
    projects: [],
    certifications: [],
    professionalLinks: [],
    structuredData: structuredData as any,
  } as ParsedResumeData;
}

function makePayload(overrides: Partial<FullOnboardingPayload> = {}): FullOnboardingPayload {
  return {
    aboutYou: {
      name: '',
      phone: '',
      location: '',
      headline: '',
      summary: '',
      currentStatus: '',
      yearsOfExperience: '',
      currentCompany: '',
      currentRole: '',
      preferredWorkType: '',
      preferredLocations: '',
      workAuthorization: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    hasNoExperience: false,
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    professionalLinks: [],
    ...overrides,
  } as FullOnboardingPayload;
}

function findSection(
  sections: ReviewSectionState[],
  key: ReviewSectionKey
): ReviewSectionState {
  const section = sections.find((item) => item.key === key);
  assert.ok(section, `missing section ${key}`);
  return section;
}

function editField(
  sections: ReviewSectionState[],
  key: ReviewSectionKey,
  fieldKey: string,
  update: (section: ReviewSectionState) => ReviewSectionState
): ReviewSectionState[] {
  return sections.map((section) => (section.key === key ? update(section) : section));
}

function decideSection(
  sections: ReviewSectionState[],
  key: ReviewSectionKey,
  decision: 'accepted' | 'rejected'
): ReviewSectionState[] {
  return sections.map((section) =>
    section.key === key ? setSectionDecision(section, decision) : section
  );
}

function approveAll(sections: ReviewSectionState[]): ReviewSectionState[] {
  return sections.map((section) => setSectionDecision(section, 'accepted'));
}

const tests: Array<[string, () => void]> = [];

function test(name: string, fn: () => void) {
  tests.push([name, fn]);
}

test('renders all 11 review sections in stable order', () => {
  const sections = buildReviewSections(makeParsedResume());
  assert.deepEqual(
    sections.map((section) => section.key),
    REVIEW_SECTIONS.map((section) => section.key)
  );
  assert.equal(sections.length, 11);
  assert.equal(findSection(sections, 'personal').entries[0].fields.length, 6);
});

test('renders extracted entries in every section', () => {
  const sections = buildReviewSections(makeParsedResume());
  const expected: Partial<Record<ReviewSectionKey, number>> = {
    personal: 1,
    education: 1,
    experience: 1,
    internships: 1,
    projects: 1,
    certifications: 1,
    technicalSkills: 2,
    softSkills: 1,
    achievements: 1,
    professionalLinks: 1,
    languages: 2,
  };

  for (const [key, count] of Object.entries(expected)) {
    assert.equal(
      findSection(sections, key as ReviewSectionKey).entries.length,
      count,
      `unexpected entry count for ${key}`
    );
  }
});

test('starts every extracted field pending regardless of confidence', () => {
  const sections = buildReviewSections(makeParsedResume());
  const personal = findSection(sections, 'personal').entries[0];
  const name = personal.fields.find((item) => item.key === 'name');
  const phone = personal.fields.find((item) => item.key === 'phone');

  assert.equal(name?.decision, 'pending');
  assert.equal(phone?.decision, 'pending');
  assert.equal(name && getEffectiveStatus(name), 'AUTO_HIGH');
  assert.equal(phone && getEffectiveStatus(phone), 'LOW_CONFIDENCE');
  assert.equal(buildApprovedResume(sections, makeParsedResume()).data.personalInfo.name, undefined);
});

test('flags existing profile conflicts and excludes them until accepted', () => {
  const parsed = makeParsedResume();
  const existing = makePayload({ aboutYou: { ...makePayload().aboutYou, name: 'Alex Old' } });
  const sections = buildReviewSections(parsed, existing);
  const name = findSection(sections, 'personal').entries[0].fields.find(
    (item) => item.key === 'name'
  );

  assert.equal(name?.isConflict, true);
  assert.equal(name?.existingValue, 'Alex Old');
  assert.equal(name?.decision, 'pending');
  assert.equal(buildApprovedResume(sections, parsed).data.personalInfo.name, undefined);

  const accepted = editField(sections, 'personal', 'name', (section) => ({
    ...section,
    entries: section.entries.map((entry) => ({
      ...entry,
      fields: entry.fields.map((item) =>
        item.key === 'name' ? setFieldDecision(item, 'accepted') : item
      ),
    })),
  }));

  assert.equal(
    buildApprovedResume(accepted, parsed).data.personalInfo.name,
    'Alex Morgan'
  );
});

test('edits update values without approving them', () => {
  const parsed = makeParsedResume();
  let sections = editField(
    buildReviewSections(parsed),
    'education',
    'institution',
    (section) => ({
      ...section,
      entries: section.entries.map((entry) => ({
        ...entry,
        fields: entry.fields.map((item) =>
          item.key === 'institution' ? updateFieldValue(item, 'The University of Texas') : item
        ),
      })),
    })
  );

  const edited = findSection(sections, 'education').entries[0].fields.find(
    (item) => item.key === 'institution'
  );
  assert.equal(edited?.decision, 'pending');
  assert.equal(buildApprovedResume(sections, parsed).data.education.length, 0);

  sections = approveAll(sections);
  assert.equal(
    buildApprovedResume(sections, parsed).data.education[0].institution,
    'The University of Texas'
  );
});

test('rejected fields are not persisted and partial entries are counted', () => {
  const parsed = makeParsedResume();
  const sections = editField(
    approveAll(buildReviewSections(parsed)),
    'education',
    'institution',
    (section) => ({
      ...section,
      entries: section.entries.map((entry) => ({
        ...entry,
        fields: entry.fields.map((item) =>
          item.key === 'institution' ? setFieldDecision(item, 'rejected') : item
        ),
      })),
    })
  );
  const approved = buildApprovedResume(sections, parsed);
  assert.equal(approved.data.education.length, 0);
  assert.equal(approved.skippedEntries, 1);
});

test('section reject all clears every approved entry', () => {
  const parsed = makeParsedResume();
  const sections = decideSection(buildReviewSections(parsed), 'education', 'rejected');
  const approved = buildApprovedResume(sections, parsed);
  assert.equal(approved.data.education.length, 0);
  assert.equal(
    collectReviewStats(sections).sections.education.rejected,
    collectReviewStats(sections).sections.education.total
  );
});

test('section accept all approves all non-empty fields', () => {
  const parsed = makeParsedResume();
  const sections = decideSection(buildReviewSections(parsed), 'education', 'accepted');
  const approved = buildApprovedResume(sections, parsed);
  assert.equal(approved.data.education.length, 1);
  assert.equal(approved.data.education[0].degree, 'B.S. Computer Science');
});

test('internships are highlighted separately and persisted once', () => {
  const parsed = makeParsedResume();
  const sections = approveAll(buildReviewSections(parsed));
  assert.equal(findSection(sections, 'experience').entries.length, 1);
  assert.equal(findSection(sections, 'internships').entries.length, 1);

  const approved = buildApprovedResume(sections, parsed);
  assert.equal(approved.data.experience.length, 2);
  assert.equal(
    approved.data.experience.filter((item) => item.employmentType === 'Internship').length,
    1
  );
  assert.equal(approved.data.structuredData?.internships.length, 1);
});

test('duplicate resume and existing profile entries are deduplicated', () => {
  const parsed = makeParsedResume();
  const existing = makePayload({
    education: [
      {
        institution: 'University of Texas',
        degree: 'B.S. Computer Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2014,
        endYear: 2018,
        isCurrent: false,
        source: 'MANUAL',
      } as any,
    ],
    skills: [{ name: 'React', level: 'EXPERT', source: 'MANUAL', verified: true } as any],
    experience: [
      {
        company: 'Acme Corp',
        roleTitle: 'Senior Software Engineer',
        startDate: '2020-01',
        isCurrent: true,
        source: 'MANUAL',
      } as any,
    ],
  });
  const sections = approveAll(buildReviewSections(parsed, existing));
  const approved = buildApprovedResume(sections, parsed);
  const merged = mergeApprovedResume(existing, approved.data);

  assert.equal(merged.education.length, 1);
  assert.equal(merged.skills.length, 3);
  assert.equal(merged.skills.filter((item) => item.name === 'React').length, 1);
  assert.equal(merged.experience.length, 2);
  assert.equal(findSection(sections, 'education').entries[0].duplicate, true);
});

test('merge is idempotent and returns no duplicate skills', () => {
  const parsed = makeParsedResume();
  const sections = approveAll(buildReviewSections(parsed));
  const approved = buildApprovedResume(sections, parsed);
  const once = mergeApprovedResume(makePayload(), approved.data);
  const twice = mergeApprovedResume(once, approved.data);

  assert.equal(twice.education.length, once.education.length);
  assert.equal(twice.experience.length, once.experience.length);
  assert.equal(twice.skills.length, once.skills.length);
  assert.equal(twice.projects.length, once.projects.length);
  assert.equal(twice.certifications.length, once.certifications.length);
  assert.equal(twice.achievements.length, once.achievements.length);
  assert.equal(twice.professionalLinks.length, once.professionalLinks.length);
});

test('incomplete entries are skipped and counted', () => {
  const parsed = makeParsedResume();
  const sections = editField(
    approveAll(buildReviewSections(parsed)),
    'experience',
    'company',
    (section) => ({
      ...section,
      entries: section.entries.map((entry) => ({
        ...entry,
        fields: entry.fields.map((item) =>
          item.key === 'company' ? setFieldDecision(item, 'rejected') : item
        ),
      })),
    })
  );
  const approved = buildApprovedResume(sections, parsed);
  assert.equal(approved.data.experience.length, 1);
  assert.equal(approved.skippedEntries, 1);
});

test('rejected suggestions are not merged into the onboarding payload', () => {
  const parsed = makeParsedResume();
  let sections = buildReviewSections(parsed);
  for (const key of ['education', 'experience', 'internships', 'projects', 'technicalSkills', 'softSkills', 'achievements', 'professionalLinks', 'languages'] as ReviewSectionKey[]) {
    sections = decideSection(sections, key, 'rejected');
  }
  const approved = buildApprovedResume(sections, parsed);
  const merged = mergeApprovedResume(makePayload(), approved.data);

  assert.equal(approved.data.education.length, 0);
  assert.equal(approved.data.experience.length, 0);
  assert.equal(approved.data.skills.length, 0);
  assert.equal(merged.education.length, 0);
  assert.equal(merged.experience.length, 0);
  assert.equal(merged.skills.length, 0);
});

test('languages remain available in structured data', () => {
  const parsed = makeParsedResume();
  const approved = buildApprovedResume(approveAll(buildReviewSections(parsed)), parsed);
  assert.deepEqual(
    approved.data.structuredData?.languages.map((item) => item.language),
    ['English', 'Spanish']
  );
});

test('effective status reflects accepted, rejected, and engine confidence', () => {
  const base = {
    decision: 'pending',
    confirmed: false,
    extractionStatus: 'AUTO_HIGH',
    confidence: 0.95,
  } as any;

  assert.equal(
    getEffectiveStatus({ ...base, extractionStatus: 'LOW_CONFIDENCE', confidence: 0.4 }),
    'LOW_CONFIDENCE'
  );
  assert.equal(
    getEffectiveStatus({ ...base, extractionStatus: 'NEEDS_REVIEW', confidence: 0.7 }),
    'NEEDS_REVIEW'
  );
  assert.equal(
    getEffectiveStatus({ ...base, decision: 'accepted', confirmed: true }),
    'VERIFIED'
  );
  assert.equal(getEffectiveStatus({ ...base, decision: 'rejected' }), 'REJECTED');
});

test('every accepted field carries evidence and section context', () => {
  const sections = approveAll(buildReviewSections(makeParsedResume()));
  for (const section of sections) {
    for (const entry of section.entries) {
      for (const item of entry.fields) {
        assert.ok(item.section.length > 0);
        if (item.decision === 'accepted') {
          assert.ok(typeof item.evidence === 'string' && item.evidence.length > 0);
        }
      }
    }
  }
});

test('invalid phone values cannot be accepted or imported', () => {
  const parsed = makeParsedResume();
  const sections = buildReviewSections(parsed);
  const personal = findSection(sections, 'personal').entries[0];
  const phone = personal.fields.find((item) => item.key === 'phone');

  assert.ok(phone);
  assert.equal(setFieldDecision(phone!, 'accepted').decision, 'pending');

  const validIndianPhone = setFieldDecision(updateFieldValue(phone!, '+91 98765 43210'), 'accepted');
  assert.equal(validIndianPhone.decision, 'accepted');

  const updated = sections.map((section) =>
    section.key === 'personal'
      ? {
          ...section,
          entries: section.entries.map((entry) => ({
            ...entry,
            fields: entry.fields.map((item) => (item.key === 'phone' ? validIndianPhone : item)),
          })),
        }
      : section
  );
  assert.equal(buildApprovedResume(updated, parsed).data.personalInfo.phone, '+91 98765 43210');
});

test('fieldOfStudy is required so incomplete education is not applied', () => {
  const parsed = makeParsedResume();
  parsed.structuredData!.education[0].fieldOfStudy = '';
  const approved = buildApprovedResume(approveAll(buildReviewSections(parsed)), parsed);

  assert.equal(approved.data.education.length, 0);
  assert.equal(approved.skippedEntries, 1);
});

test('project demo URLs and certification credential fields survive apply and merge', () => {
  const parsed = makeParsedResume();
  const approved = buildApprovedResume(approveAll(buildReviewSections(parsed)), parsed);
  const merged = mergeApprovedResume(makePayload(), approved.data);

  assert.equal(approved.data.projects[0].demoUrl, 'https://demo.career-pathways.example.com');
  assert.equal(approved.data.certifications[0].expiryDate, '2025-06');
  assert.equal(approved.data.certifications[0].credentialId, 'AWS-123');
  assert.equal(approved.data.certifications[0].credentialUrl, 'https://example.com/cert');
  assert.equal(merged.projects[0].demoUrl, 'https://demo.career-pathways.example.com');
  assert.equal(merged.certifications[0].expiryDate, '2025-06');
  assert.equal(merged.certifications[0].credentialId, 'AWS-123');
  assert.equal(merged.certifications[0].credentialUrl, 'https://example.com/cert');
});

test('professional link deduplication ignores URL scheme and trailing slash', () => {
  const parsed = makeParsedResume();
  const existing = makePayload({
    professionalLinks: [{ platform: 'LinkedIn', url: 'linkedin.com/in/alexmorgan/' }],
  });
  const approved = buildApprovedResume(approveAll(buildReviewSections(parsed, existing)), parsed);
  const merged = mergeApprovedResume(existing, approved.data);

  assert.equal(merged.professionalLinks.length, 1);
});

test('resume email that differs from the account email is flagged and never applied', () => {
  const parsed = makeParsedResume();
  const sections = buildReviewSections(parsed, makePayload(), 'account@example.com');
  const email = findSection(sections, 'personal').entries[0].fields.find(
    (item) => item.key === 'email'
  );

  assert.equal(email?.isConflict, true);
  assert.equal(email?.decision, 'pending');
  assert.equal(buildApprovedResume(approveAll(sections), parsed).data.personalInfo.email, 'alex@example.com');
  assert.equal(
    (mergeApprovedResume(makePayload(), buildApprovedResume(approveAll(sections), parsed).data).aboutYou as any)
      .email,
    undefined
  );
});

test('persisted review decisions and edits restore across reload', () => {
  const parsed = makeParsedResume();
  let sections = approveAll(buildReviewSections(parsed));
  sections = editField(sections, 'personal', 'name', (section) => ({
    ...section,
    entries: section.entries.map((entry) => ({
      ...entry,
      fields: entry.fields.map((item) =>
        item.key === 'name' ? setFieldDecision(updateFieldValue(item, 'Alex M. Morgan'), 'accepted') : item
      ),
    })),
  }));
  sections = editField(sections, 'education', 'institution', (section) => ({
    ...section,
    entries: section.entries.map((entry) => ({
      ...entry,
      fields: entry.fields.map((item) =>
        item.key === 'institution' ? setFieldDecision(item, 'rejected') : item
      ),
    })),
  }));

  const persisted = JSON.parse(JSON.stringify(serializeReviewSections(sections)));
  const restored = restoreReviewSections(buildReviewSections(parsed), persisted);
  const personal = findSection(restored, 'personal').entries[0].fields.find(
    (item) => item.key === 'name'
  );
  const education = findSection(restored, 'education').entries[0].fields.find(
    (item) => item.key === 'institution'
  );

  assert.equal(personal?.value, 'Alex M. Morgan');
  assert.equal(personal?.decision, 'accepted');
  assert.equal(personal?.edited, true);
  assert.equal(education?.decision, 'rejected');
});

test('backend and frontend phone rules normalize only valid Indian mobiles', () => {
  const base = {
    name: 'Test User',
    phone: '+91 98765 43210',
    location: 'Hyderabad',
    candidateType: 'STUDENT',
  };

  assert.equal(Step1AboutYouSchema.parse(base).phone, '+919876543210');
  assert.equal(Step1AboutYouSchema.safeParse({ ...base, phone: '+1 555 0100' }).success, false);
  assert.equal(Step1AboutYouSchema.safeParse({ ...base, phone: '1234567890' }).success, false);
});

let failures = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

console.log(`\n${tests.length - failures}/${tests.length} Phase 5 resume review tests passed`);
if (failures > 0) {
  process.exitCode = 1;
}
