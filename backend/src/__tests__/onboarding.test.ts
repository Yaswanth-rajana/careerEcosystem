import { ResumeParserService } from '../services/resumeParserService';
import {
  Step1AboutYouSchema,
  Step4SkillsSchema,
  Step6CareerDirectionSchema,
  FullOnboardingPayloadSchema,
} from '../validations/onboardingSchemas';

describe('Mandatory Candidate Onboarding Unit & Integration Tests', () => {
  describe('ResumeParserService', () => {
    it('extracts structured candidate suggestions with provenance metadata from raw text', async () => {
      const mockResumeText = `
        Alex Morgan
        alex.morgan@example.com | +1 (555) 019-2834 | San Francisco, CA
        https://linkedin.com/in/alexmorgan | https://github.com/alexmorgan

        WORK EXPERIENCE
        Software Engineer at Pathway Tech
        2022 - Present
        Developed React and Node.js microservices with AWS and PostgreSQL.

        EDUCATION
        Stanford University
        Bachelor of Science in Computer Science
        2018 - 2022

        SKILLS
        Python, TypeScript, React, Docker, Machine Learning, SQL
      `;

      const buffer = Buffer.from(mockResumeText, 'utf-8');
      const parsed = await ResumeParserService.parseResume(buffer, 'alex_morgan_resume.pdf', 'application/pdf');

      expect(parsed.personalInfo.email).toBe('alex.morgan@example.com');
      expect(parsed.personalInfo.phone).toBe('+1 (555) 019-2834');
      expect(parsed.personalInfo.location).toBe('San Francisco, CA');

      // Education
      expect(parsed.education.length).toBeGreaterThan(0);
      expect(parsed.education[0].source).toBe('RESUME');

      // Experience
      expect(parsed.experience.length).toBeGreaterThan(0);
      expect(parsed.experience[0].company).toContain('Pathway');
      expect(parsed.experience[0].source).toBe('RESUME');

      // Skills & Provenance
      expect(parsed.skills.some((s) => s.name === 'Python')).toBe(true);
      expect(parsed.skills.some((s) => s.name === 'React')).toBe(true);
      expect(parsed.skills.every((s) => s.source === 'RESUME')).toBe(true);
      expect(parsed.skills.every((s) => s.verified === false)).toBe(true);

      // Links
      expect(parsed.professionalLinks.some((l) => l.platform === 'LinkedIn')).toBe(true);
      expect(parsed.professionalLinks.some((l) => l.platform === 'GitHub')).toBe(true);
    });
  });

  describe('Zod Validation Schemas', () => {
    it('validates Step 1 Personal Info correctly', () => {
      const valid = Step1AboutYouSchema.safeParse({
        name: 'Alex Morgan',
        phone: '+1 (555) 019-2834',
        location: 'San Francisco, CA',
        candidateType: 'STUDENT',
      });
      expect(valid.success).toBe(true);

      const invalid = Step1AboutYouSchema.safeParse({
        name: 'A', // Too short
        phone: '12', // Too short
        location: '',
        candidateType: 'INVALID_TYPE',
      });
      expect(invalid.success).toBe(false);
    });

    it('requires at least 1 skill in Step 4', () => {
      const valid = Step4SkillsSchema.safeParse({
        skills: [{ name: 'TypeScript', level: 'ADVANCED', source: 'USER', verified: false }],
      });
      expect(valid.success).toBe(true);

      const empty = Step4SkillsSchema.safeParse({ skills: [] });
      expect(empty.success).toBe(false);
    });

    it('validates Step 6 Career Direction', () => {
      const valid = Step6CareerDirectionSchema.safeParse({
        targetRole: 'Software Engineer',
        careerGoalType: 'Get my first job',
      });
      expect(valid.success).toBe(true);

      const invalid = Step6CareerDirectionSchema.safeParse({
        targetRole: '',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates FullOnboardingPayloadSchema completion payload', () => {
      const fullPayload = {
        aboutYou: {
          name: 'Alex Morgan',
          phone: '+1 (555) 019-2834',
          location: 'London, UK',
          candidateType: 'STUDENT',
        },
        education: [
          {
            institution: 'Oxford University',
            degree: 'B.S.',
            fieldOfStudy: 'Computer Science',
            startYear: 2020,
            endYear: 2024,
            isCurrent: false,
          },
        ],
        hasNoExperience: true,
        experience: [],
        skills: [
          { name: 'Python', level: 'ADVANCED', source: 'USER', verified: true },
        ],
        projects: [
          {
            title: 'PATHWAY.ECO Platform',
            technologies: ['React', 'Next.js', 'MongoDB'],
          },
        ],
        careerDirection: {
          targetRole: 'Full Stack Engineer',
        },
        preferences: {
          preferredJobType: 'Full-time',
          workEnvironment: 'Remote',
          willingToRelocate: false,
          preferredIndustries: ['Fintech'],
          learningStyle: ['Hands-on projects'],
          availableHoursPerWeek: '5–10 hours/week',
          mentorshipNeeds: ['Career direction'],
        },
        certifications: [],
        achievements: [],
        professionalLinks: [],
      };

      const parsed = FullOnboardingPayloadSchema.safeParse(fullPayload);
      expect(parsed.success).toBe(true);
    });
  });
});
