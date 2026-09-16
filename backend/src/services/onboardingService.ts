import { db } from '../db/client';
import { ResumeParserService } from './resumeParserService';
import {
  FullOnboardingPayload,
  FullOnboardingPayloadSchema,
} from '../validations/onboardingSchemas';

export class OnboardingService {
  /**
   * Fetches full onboarding state & normalized profile for a candidate.
   */
  static async getOnboardingState(userId: string) {
    let user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            education: true,
            experience: true,
            userSkills: {
              include: {
                skill: true,
              },
            },
            projects: true,
            careerGoal: true,
            jobPreference: true,
            certifications: true,
            achievements: true,
            professionalLinks: true,
            resumes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        onboardingProgress: true,
      },
    });

    if (!user) {
      throw new Error('User account not found.');
    }

    // Ensure OnboardingProgress exists
    let progress = user.onboardingProgress;
    if (!progress) {
      progress = await db.onboardingProgress.create({
        data: {
          userId,
          status: user.isOnboarded ? 'COMPLETED' : 'NOT_STARTED',
          currentStep: 1,
          completedSteps: [],
        },
      });
    }

    // Ensure Profile exists
    let profile = user.profile;
    if (!profile) {
      profile = await db.profile.create({
        data: {
          userId,
          candidateType: 'STUDENT',
        },
        include: {
          education: true,
          experience: true,
          userSkills: { include: { skill: true } },
          projects: true,
          careerGoal: true,
          jobPreference: true,
          certifications: true,
          achievements: true,
          professionalLinks: true,
          resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
    }

    let parsedDraft: any = null;
    if (progress.draftData) {
      try {
        parsedDraft = JSON.parse(progress.draftData);
      } catch {
        parsedDraft = null;
      }
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isOnboarded: user.isOnboarded,
      progress: {
        id: progress.id,
        status: progress.status,
        currentStep: progress.currentStep,
        completedSteps: progress.completedSteps,
        lastSavedAt: progress.lastSavedAt,
        completedAt: progress.completedAt,
        draftData: parsedDraft,
      },
      profile,
    };
  }

  /**
   * Saves debounced draft input state to OnboardingProgress.
   */
  static async saveDraftState(
    userId: string,
    data: { currentStep?: number; completedSteps?: number[]; draftData?: Record<string, any> }
  ) {
    const existing = await db.onboardingProgress.findUnique({ where: { userId } });

    const updatedCompletedSteps = data.completedSteps
      ? Array.from(new Set([...(existing?.completedSteps || []), ...data.completedSteps]))
      : existing?.completedSteps || [];

    const updated = await db.onboardingProgress.upsert({
      where: { userId },
      create: {
        userId,
        status: 'IN_PROGRESS',
        currentStep: data.currentStep || 1,
        completedSteps: updatedCompletedSteps,
        lastSavedAt: new Date(),
        draftData: data.draftData ? JSON.stringify(data.draftData) : null,
      },
      update: {
        status: existing?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
        currentStep: data.currentStep ?? existing?.currentStep ?? 1,
        completedSteps: updatedCompletedSteps,
        lastSavedAt: new Date(),
        draftData: data.draftData ? JSON.stringify(data.draftData) : existing?.draftData,
      },
    });

    return updated;
  }

  /**
   * Processes resume upload, runs parser service, records Resume entity, and returns candidate suggestions.
   */
  static async processResumeUpload(
    userId: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ) {
    const parsedData = await ResumeParserService.parseResume(fileBuffer, filename, mimeType);

    // Get or create profile
    let profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await db.profile.create({ data: { userId, candidateType: 'STUDENT' } });
    }

    const resume = await db.resume.create({
      data: {
        profileId: profile.id,
        filename,
        fileType: mimeType,
        fileSize: fileBuffer.length,
        status: 'READY',
        extractedData: JSON.stringify(parsedData),
      },
    });

    return {
      resumeId: resume.id,
      parsedSuggestions: parsedData,
    };
  }

  /**
   * Saves individual step data into normalized database models.
   */
  static async saveStepData(userId: string, stepNumber: number, stepPayload: any) {
    let profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await db.profile.create({ data: { userId, candidateType: 'STUDENT' } });
    }

    const profileId = profile.id;

    if (stepNumber === 1 && stepPayload.aboutYou) {
      const { name, phone, location, candidateType, headline, bio } = stepPayload.aboutYou;
      if (name) {
        await db.user.update({ where: { id: userId }, data: { name } });
      }
      await db.profile.update({
        where: { id: profileId },
        data: {
          phone: phone || null,
          location: location || null,
          candidateType: candidateType || 'STUDENT',
          headline: headline || null,
          bio: bio || null,
        },
      });
    }

    if (stepNumber === 2 && Array.isArray(stepPayload.education)) {
      // Replace existing education entries with updated list
      await db.education.deleteMany({ where: { profileId } });
      if (stepPayload.education.length > 0) {
        await db.education.createMany({
          data: stepPayload.education.map((item: any) => ({
            profileId,
            institution: item.institution,
            degree: item.degree,
            fieldOfStudy: item.fieldOfStudy,
            location: item.location || null,
            startYear: Number(item.startYear),
            endYear: item.endYear ? Number(item.endYear) : null,
            isCurrent: Boolean(item.isCurrent),
            gpa: item.gpa || null,
            coursework: item.coursework || null,
            achievements: item.achievements || null,
            source: item.source || 'USER',
          })),
        });
      }
    }

    if (stepNumber === 3) {
      await db.experience.deleteMany({ where: { profileId } });
      if (Array.isArray(stepPayload.experience) && stepPayload.experience.length > 0) {
        await db.experience.createMany({
          data: stepPayload.experience.map((item: any) => ({
            profileId,
            company: item.company,
            roleTitle: item.roleTitle,
            employmentType: item.employmentType || null,
            location: item.location || null,
            startDate: item.startDate,
            endDate: item.endDate || null,
            isCurrent: Boolean(item.isCurrent),
            description: item.description || null,
            responsibilities: item.responsibilities || null,
            achievements: item.achievements || null,
            source: item.source || 'USER',
          })),
        });
      }
    }

    if (stepNumber === 4 && Array.isArray(stepPayload.skills)) {
      await db.userSkill.deleteMany({ where: { profileId } });
      for (const skillItem of stepPayload.skills) {
        const skillName = skillItem.name.trim();
        if (!skillName) continue;

        let skill = await db.skill.findUnique({ where: { name: skillName } });
        if (!skill) {
          skill = await db.skill.create({
            data: { name: skillName, category: skillItem.category || null },
          });
        }

        await db.userSkill.create({
          data: {
            profileId,
            skillId: skill.id,
            level: skillItem.level || 'INTERMEDIATE',
            source: skillItem.source || 'USER',
            verified: Boolean(skillItem.verified),
          },
        });
      }
    }

    if (stepNumber === 5 && Array.isArray(stepPayload.projects)) {
      await db.project.deleteMany({ where: { profileId } });
      if (stepPayload.projects.length > 0) {
        await db.project.createMany({
          data: stepPayload.projects.map((proj: any) => ({
            profileId,
            title: proj.title,
            description: proj.description || null,
            role: proj.role || null,
            technologies: proj.technologies || [],
            projectType: proj.projectType || null,
            startDate: proj.startDate || null,
            endDate: proj.endDate || null,
            projectUrl: proj.projectUrl || null,
            githubUrl: proj.githubUrl || null,
            demoUrl: proj.demoUrl || null,
            achievements: proj.achievements || null,
            source: proj.source || 'USER',
          })),
        });
      }
    }

    if (stepNumber === 6 && stepPayload.careerDirection) {
      const { targetRole, careerField, targetIndustry, careerGoalType, timeframe, notes } =
        stepPayload.careerDirection;
      await db.careerGoal.upsert({
        where: { profileId },
        create: {
          profileId,
          targetRole,
          careerField: careerField || null,
          targetIndustry: targetIndustry || null,
          careerGoalType: careerGoalType || null,
          timeframe: timeframe || null,
          notes: notes || null,
        },
        update: {
          targetRole,
          careerField: careerField || null,
          targetIndustry: targetIndustry || null,
          careerGoalType: careerGoalType || null,
          timeframe: timeframe || null,
          notes: notes || null,
        },
      });
    }

    if (stepNumber === 7 && stepPayload.preferences) {
      const {
        preferredJobType,
        preferredLocation,
        workEnvironment,
        willingToRelocate,
        preferredIndustries,
        preferredCompanySize,
        minExpectedSalary,
        preferredSalaryRange,
        noticePeriod,
        availability,
        learningStyle,
        availableHoursPerWeek,
        mentorshipNeeds,
      } = stepPayload.preferences;

      await db.jobPreference.upsert({
        where: { profileId },
        create: {
          profileId,
          preferredJobType: preferredJobType || null,
          preferredLocation: preferredLocation || null,
          workEnvironment: workEnvironment || null,
          willingToRelocate: Boolean(willingToRelocate),
          preferredIndustries: preferredIndustries || [],
          preferredCompanySize: preferredCompanySize || null,
          minExpectedSalary: minExpectedSalary || null,
          preferredSalaryRange: preferredSalaryRange || null,
          noticePeriod: noticePeriod || null,
          availability: availability || null,
        },
        update: {
          preferredJobType: preferredJobType || null,
          preferredLocation: preferredLocation || null,
          workEnvironment: workEnvironment || null,
          willingToRelocate: Boolean(willingToRelocate),
          preferredIndustries: preferredIndustries || [],
          preferredCompanySize: preferredCompanySize || null,
          minExpectedSalary: minExpectedSalary || null,
          preferredSalaryRange: preferredSalaryRange || null,
          noticePeriod: noticePeriod || null,
          availability: availability || null,
        },
      });

      await db.profile.update({
        where: { id: profileId },
        data: {
          learningStyle: learningStyle || [],
          availableHoursPerWeek: availableHoursPerWeek || null,
          mentorshipNeeds: mentorshipNeeds || [],
        },
      });
    }

    // Save optional Certifications, Achievements, Links if provided in step payload
    if (Array.isArray(stepPayload.certifications)) {
      await db.certification.deleteMany({ where: { profileId } });
      if (stepPayload.certifications.length > 0) {
        await db.certification.createMany({
          data: stepPayload.certifications.map((c: any) => ({
            profileId,
            name: c.name,
            issuingOrganization: c.issuingOrganization,
            issueDate: c.issueDate || null,
            expiryDate: c.expiryDate || null,
            credentialId: c.credentialId || null,
            credentialUrl: c.credentialUrl || null,
            source: c.source || 'USER',
          })),
        });
      }
    }

    if (Array.isArray(stepPayload.professionalLinks)) {
      await db.professionalLink.deleteMany({ where: { profileId } });
      if (stepPayload.professionalLinks.length > 0) {
        await db.professionalLink.createMany({
          data: stepPayload.professionalLinks.map((link: any) => ({
            profileId,
            platform: link.platform,
            url: link.url,
          })),
        });
      }
    }

    // Update progress state
    await this.saveDraftState(userId, {
      currentStep: stepNumber,
      completedSteps: [stepNumber],
      draftData: stepPayload.draftData,
    });

    return await this.getOnboardingState(userId);
  }

  /**
   * ATOMIC TRANSACTIONAL COMPLETION RULE:
   * Validates mandatory criteria, upserts full normalized profile, updates OnboardingProgress & User in a single db.$transaction.
   */
  static async completeOnboarding(userId: string, payload: FullOnboardingPayload) {
    const validated = FullOnboardingPayloadSchema.parse(payload);

    // Validation Rules Check:
    // 1. Name, Phone, Location required
    if (!validated.aboutYou.name || validated.aboutYou.name.trim().length < 2) {
      throw new Error('Name is required to complete onboarding.');
    }
    if (!validated.aboutYou.phone || validated.aboutYou.phone.trim().length < 5) {
      throw new Error('Phone number is required to complete onboarding.');
    }
    if (!validated.aboutYou.location || validated.aboutYou.location.trim().length < 2) {
      throw new Error('Location is required to complete onboarding.');
    }

    // 2. Skill required
    if (!validated.skills || validated.skills.length < 1) {
      throw new Error('Please add at least one skill to complete your profile.');
    }

    // 3. Target direction required
    if (!validated.careerDirection?.targetRole) {
      throw new Error('Target job role or career goal is required.');
    }

    // 4. Background rule:
    // Students -> Education required
    // Professionals -> Education OR Experience required
    const isStudent = validated.aboutYou.candidateType === 'STUDENT' || validated.aboutYou.candidateType === 'GRADUATE';
    if (isStudent && (!validated.education || validated.education.length < 1)) {
      throw new Error('Students and recent graduates must provide at least one education entry.');
    }
    if (!isStudent && !validated.hasNoExperience) {
      const hasEdu = validated.education && validated.education.length > 0;
      const hasExp = validated.experience && validated.experience.length > 0;
      if (!hasEdu && !hasExp) {
        throw new Error('Please provide at least one education entry or professional experience entry.');
      }
    }

    let profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await db.profile.create({ data: { userId, candidateType: validated.aboutYou.candidateType } });
    }
    const profileId = profile.id;

    const now = new Date();

    // Prepare Skill resolution before transaction
    const resolvedSkills: Array<{ skillId: string; level: string; source: string; verified: boolean }> = [];
    for (const s of validated.skills) {
      const trimmed = s.name.trim();
      if (!trimmed) continue;
      let skillEntity = await db.skill.findUnique({ where: { name: trimmed } });
      if (!skillEntity) {
        skillEntity = await db.skill.create({ data: { name: trimmed, category: s.category || null } });
      }
      resolvedSkills.push({
        skillId: skillEntity.id,
        level: s.level || 'INTERMEDIATE',
        source: s.source || 'USER',
        verified: Boolean(s.verified),
      });
    }

    // ATOMIC DATABASE TRANSACTION
    await db.$transaction(async (tx: any) => {
      // 1. Update User name & onboarding flags
      await tx.user.update({
        where: { id: userId },
        data: {
          name: validated.aboutYou.name,
          isOnboarded: true,
          onboardingCompletedAt: now,
        },
      });

      // 2. Update Profile core fields
      await tx.profile.update({
        where: { id: profileId },
        data: {
          phone: validated.aboutYou.phone,
          location: validated.aboutYou.location,
          candidateType: validated.aboutYou.candidateType,
          headline: validated.aboutYou.headline || null,
          bio: validated.aboutYou.bio || null,
          learningStyle: validated.preferences.learningStyle || [],
          availableHoursPerWeek: validated.preferences.availableHoursPerWeek || null,
          mentorshipNeeds: validated.preferences.mentorshipNeeds || [],
        },
      });

      // 3. Update Education
      await tx.education.deleteMany({ where: { profileId } });
      if (validated.education && validated.education.length > 0) {
        await tx.education.createMany({
          data: validated.education.map((e) => ({
            profileId,
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            location: e.location || null,
            startYear: Number(e.startYear),
            endYear: e.endYear ? Number(e.endYear) : null,
            isCurrent: Boolean(e.isCurrent),
            gpa: e.gpa || null,
            coursework: e.coursework || null,
            achievements: e.achievements || null,
            source: e.source || 'USER',
          })),
        });
      }

      // 4. Update Experience
      await tx.experience.deleteMany({ where: { profileId } });
      if (validated.experience && validated.experience.length > 0) {
        await tx.experience.createMany({
          data: validated.experience.map((exp) => ({
            profileId,
            company: exp.company,
            roleTitle: exp.roleTitle,
            employmentType: exp.employmentType || null,
            location: exp.location || null,
            startDate: exp.startDate,
            endDate: exp.endDate || null,
            isCurrent: Boolean(exp.isCurrent),
            description: exp.description || null,
            responsibilities: exp.responsibilities || null,
            achievements: exp.achievements || null,
            source: exp.source || 'USER',
          })),
        });
      }

      // 5. Update UserSkills
      await tx.userSkill.deleteMany({ where: { profileId } });
      for (const item of resolvedSkills) {
        await tx.userSkill.create({
          data: {
            profileId,
            skillId: item.skillId,
            level: item.level,
            source: item.source,
            verified: item.verified,
          },
        });
      }

      // 6. Update Projects
      await tx.project.deleteMany({ where: { profileId } });
      if (validated.projects && validated.projects.length > 0) {
        await tx.project.createMany({
          data: validated.projects.map((p) => ({
            profileId,
            title: p.title,
            description: p.description || null,
            role: p.role || null,
            technologies: p.technologies || [],
            projectType: p.projectType || null,
            startDate: p.startDate || null,
            endDate: p.endDate || null,
            projectUrl: p.projectUrl || null,
            githubUrl: p.githubUrl || null,
            demoUrl: p.demoUrl || null,
            achievements: p.achievements || null,
            source: p.source || 'USER',
          })),
        });
      }

      // 7. Update CareerGoal
      await tx.careerGoal.upsert({
        where: { profileId },
        create: {
          profileId,
          targetRole: validated.careerDirection.targetRole,
          careerField: validated.careerDirection.careerField || null,
          targetIndustry: validated.careerDirection.targetIndustry || null,
          careerGoalType: validated.careerDirection.careerGoalType || null,
          timeframe: validated.careerDirection.timeframe || null,
          notes: validated.careerDirection.notes || null,
        },
        update: {
          targetRole: validated.careerDirection.targetRole,
          careerField: validated.careerDirection.careerField || null,
          targetIndustry: validated.careerDirection.targetIndustry || null,
          careerGoalType: validated.careerDirection.careerGoalType || null,
          timeframe: validated.careerDirection.timeframe || null,
          notes: validated.careerDirection.notes || null,
        },
      });

      // 8. Update JobPreference
      await tx.jobPreference.upsert({
        where: { profileId },
        create: {
          profileId,
          preferredJobType: validated.preferences.preferredJobType || null,
          preferredLocation: validated.preferences.preferredLocation || null,
          workEnvironment: validated.preferences.workEnvironment || null,
          willingToRelocate: Boolean(validated.preferences.willingToRelocate),
          preferredIndustries: validated.preferences.preferredIndustries || [],
          preferredCompanySize: validated.preferences.preferredCompanySize || null,
          minExpectedSalary: validated.preferences.minExpectedSalary || null,
          preferredSalaryRange: validated.preferences.preferredSalaryRange || null,
          noticePeriod: validated.preferences.noticePeriod || null,
          availability: validated.preferences.availability || null,
        },
        update: {
          preferredJobType: validated.preferences.preferredJobType || null,
          preferredLocation: validated.preferences.preferredLocation || null,
          workEnvironment: validated.preferences.workEnvironment || null,
          willingToRelocate: Boolean(validated.preferences.willingToRelocate),
          preferredIndustries: validated.preferences.preferredIndustries || [],
          preferredCompanySize: validated.preferences.preferredCompanySize || null,
          minExpectedSalary: validated.preferences.minExpectedSalary || null,
          preferredSalaryRange: validated.preferences.preferredSalaryRange || null,
          noticePeriod: validated.preferences.noticePeriod || null,
          availability: validated.preferences.availability || null,
        },
      });

      // 9. Update Certifications
      await tx.certification.deleteMany({ where: { profileId } });
      if (validated.certifications && validated.certifications.length > 0) {
        await tx.certification.createMany({
          data: validated.certifications.map((c) => ({
            profileId,
            name: c.name,
            issuingOrganization: c.issuingOrganization,
            issueDate: c.issueDate || null,
            expiryDate: c.expiryDate || null,
            credentialId: c.credentialId || null,
            credentialUrl: c.credentialUrl || null,
            source: c.source || 'USER',
          })),
        });
      }

      // 10. Update Achievements
      await tx.achievement.deleteMany({ where: { profileId } });
      if (validated.achievements && validated.achievements.length > 0) {
        await tx.achievement.createMany({
          data: validated.achievements.map((a) => ({
            profileId,
            title: a.title,
            description: a.description || null,
            organization: a.organization || null,
            date: a.date || null,
            url: a.url || null,
            source: a.source || 'USER',
          })),
        });
      }

      // 11. Update Professional Links
      await tx.professionalLink.deleteMany({ where: { profileId } });
      if (validated.professionalLinks && validated.professionalLinks.length > 0) {
        await tx.professionalLink.createMany({
          data: validated.professionalLinks.map((l) => ({
            profileId,
            platform: l.platform,
            url: l.url,
          })),
        });
      }

      // 12. Update OnboardingProgress to COMPLETED
      await tx.onboardingProgress.upsert({
        where: { userId },
        create: {
          userId,
          status: 'COMPLETED',
          currentStep: 8,
          completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
          completedAt: now,
          lastSavedAt: now,
        },
        update: {
          status: 'COMPLETED',
          currentStep: 8,
          completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
          completedAt: now,
          lastSavedAt: now,
        },
      });
    });

    return {
      success: true,
      redirectUrl: '/dashboard',
    };
  }
}
