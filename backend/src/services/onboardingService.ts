import { db } from '../db/client';
import { ResumeParserService } from './resumeParserService';
import {
  FullOnboardingPayload,
  FullOnboardingPayloadSchema,
  Step1AboutYouSchema,
  EducationItemSchema,
  ExperienceItemSchema,
  UserSkillSchema,
  ProjectItemSchema,
  Step6CareerDirectionSchema,
  Step7PreferencesSchema,
} from '../validations/onboardingSchemas';
import { EmailService } from './email/emailService';
import { ProfileService } from './profileService';
import { StorageFactory } from './tools/storage-provider';
import { retryOnWriteConflict } from '../utils/retry';

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

    // Ensure OnboardingProgress exists safely under concurrency
    let progress = user.onboardingProgress;
    if (!progress) {
      progress = await retryOnWriteConflict(async () => {
        return await db.onboardingProgress.upsert({
          where: { userId },
          create: {
            userId,
            status: user.isOnboarded ? 'COMPLETED' : 'NOT_STARTED',
            currentStep: 1,
            completedSteps: [],
          },
          update: {},
        });
      });
    }

    // Ensure Profile exists safely under concurrency
    let profile = user.profile;
    if (!profile) {
      profile = await retryOnWriteConflict(async () => {
        return await db.profile.upsert({
          where: { userId },
          create: {
            userId,
            candidateType: 'STUDENT',
          },
          update: {},
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
            resumes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });
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
        onboardingCurrentStep: progress.currentStep,
        completedSteps: progress.completedSteps,
        lastSavedAt: progress.lastSavedAt,
        onboardingLastActivityAt: progress.onboardingLastActivityAt || progress.lastSavedAt,
        onboardingStartedAt: progress.onboardingStartedAt || progress.createdAt,
        completedAt: progress.completedAt,
        onboardingCompletedAt: progress.completedAt,
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
    return await retryOnWriteConflict(async () => {
      const existing = await db.onboardingProgress.findUnique({ where: { userId } });

      const updatedCompletedSteps = data.completedSteps
        ? Array.from(new Set([...(existing?.completedSteps || []), ...data.completedSteps]))
        : existing?.completedSteps || [];

      const now = new Date();
      const draftDataToStore = data.draftData
        ? JSON.stringify({ ...data.draftData, _savedAt: now.toISOString() })
        : null;
      const updated = await db.onboardingProgress.upsert({
        where: { userId },
        create: {
          userId,
          status: 'IN_PROGRESS',
          currentStep: data.currentStep || 1,
          completedSteps: updatedCompletedSteps,
          lastSavedAt: now,
          onboardingStartedAt: now,
          onboardingLastActivityAt: now,
          draftData: draftDataToStore,
        },
        update: {
          status: existing?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          currentStep: data.currentStep ?? existing?.currentStep ?? 1,
          completedSteps: updatedCompletedSteps,
          lastSavedAt: now,
          onboardingLastActivityAt: now,
          draftData: draftDataToStore ?? existing?.draftData,
        },
      });

      return updated;
    });
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
        status: 'PROCESSING',
        extractedData: JSON.stringify(parsedData),
      },
    });

    const storage = StorageFactory.getProvider();
    const storageKey = `resumes/${resume.id}/${filename}`;

    try {
      await storage.upload(storageKey, fileBuffer, mimeType);
      await db.resume.update({
        where: { id: resume.id },
        data: { status: 'READY' },
      });
    } catch (err) {
      await storage.delete(storageKey).catch(() => {});
      await db.resume.delete({ where: { id: resume.id } }).catch((cleanupErr) => {
        console.error('[OnboardingService] Failed to clean up resume record after upload failure:', cleanupErr);
      });
      throw err;
    }

    return {
      resumeId: resume.id,
      parsedSuggestions: parsedData,
    };
  }

  /**
   * Saves individual step data into normalized database models through ProfileService.
   * Atomic, idempotent, and distinguishes saved data from completed steps.
   */
  static async saveStepData(userId: string, stepNumber: number, stepPayload: any) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true, onboardingProgress: true },
    });

    if (!user) {
      throw new Error('User account not found.');
    }

    const currentCandidateType =
      stepPayload.aboutYou?.candidateType ||
      user.profile?.candidateType ||
      'STUDENT';

    let isStepComplete = false;

    // STEP VALIDATION
    if (stepNumber === 1) {
      const data = stepPayload.aboutYou || stepPayload;
      Step1AboutYouSchema.parse(data);
      isStepComplete = true;
    } else if (stepNumber === 2) {
      const eduList = Array.isArray(stepPayload.education) ? stepPayload.education : [];
      eduList.forEach((e: any) => EducationItemSchema.parse(e));
      const isStudent = currentCandidateType === 'STUDENT' || currentCandidateType === 'GRADUATE';
      // For students/graduates, education must contain at least 1 entry to be completed
      isStepComplete = !isStudent || eduList.length > 0;
    } else if (stepNumber === 3) {
      const expList = Array.isArray(stepPayload.experience) ? stepPayload.experience : [];
      expList.forEach((e: any) => ExperienceItemSchema.parse(e));
      isStepComplete = Boolean(stepPayload.hasNoExperience) || expList.length > 0;
    } else if (stepNumber === 4) {
      const skillList = Array.isArray(stepPayload.skills) ? stepPayload.skills : [];
      skillList.forEach((s: any) => UserSkillSchema.parse(s));
      isStepComplete = skillList.length >= 1;
    } else if (stepNumber === 5) {
      const projList = Array.isArray(stepPayload.projects) ? stepPayload.projects : [];
      projList.forEach((p: any) => ProjectItemSchema.parse(p));
      isStepComplete = true; // Projects are optional portfolio entries
    } else if (stepNumber === 6) {
      const dirData = stepPayload.careerDirection || stepPayload;
      Step6CareerDirectionSchema.parse(dirData);
      isStepComplete = Boolean(dirData.targetRole && dirData.targetRole.trim().length >= 2);
    } else if (stepNumber === 7) {
      const prefData = stepPayload.preferences || stepPayload;
      Step7PreferencesSchema.parse(prefData);
      isStepComplete = true;
    }

    // ATOMIC DATABASE TRANSACTION WITH RETRY ON WRITE CONFLICT
    await retryOnWriteConflict(async () => {
      await db.$transaction(async (tx) => {
        // 1. Profile / Canonical section updates delegated to ProfileService
        if (stepNumber === 1 && (stepPayload.aboutYou || stepPayload.name)) {
          await ProfileService.updatePersonal(userId, stepPayload.aboutYou || stepPayload, tx);
        }

        if (stepNumber === 2 && Array.isArray(stepPayload.education)) {
          await ProfileService.syncEducation(userId, stepPayload.education, tx);
        }

        if (stepNumber === 3 && Array.isArray(stepPayload.experience)) {
          await ProfileService.syncExperience(userId, stepPayload.experience, tx);
        }

        if (stepNumber === 4 && Array.isArray(stepPayload.skills)) {
          await ProfileService.updateSkills(userId, stepPayload.skills, tx);
        }

        if (stepNumber === 5 && Array.isArray(stepPayload.projects)) {
          await ProfileService.syncProjects(userId, stepPayload.projects, tx);
        }

        if (stepNumber === 6 && (stepPayload.careerDirection || stepPayload.targetRole)) {
          await ProfileService.updateCareerDirection(userId, stepPayload.careerDirection || stepPayload, tx);
        }

        if (stepNumber === 7) {
          if (stepPayload.preferences) {
            await ProfileService.updateJobPreferences(userId, stepPayload.preferences, tx);
          }
          if (Array.isArray(stepPayload.certifications)) {
            await ProfileService.syncCertifications(userId, stepPayload.certifications, tx);
          }
          if (Array.isArray(stepPayload.achievements)) {
            await ProfileService.syncAchievements(userId, stepPayload.achievements, tx);
          }
          if (Array.isArray(stepPayload.professionalLinks)) {
            await ProfileService.syncLinks(userId, stepPayload.professionalLinks, tx);
          }
        }

        // 2. OnboardingProgress State Update
        const existingProgress = await tx.onboardingProgress.findUnique({ where: { userId } });
        const now = new Date();
        let completedSteps = existingProgress?.completedSteps || [];

        if (isStepComplete && !completedSteps.includes(stepNumber)) {
          completedSteps = [...completedSteps, stepNumber].sort((a, b) => a - b);
        }

        const nextStep = isStepComplete ? Math.min(stepNumber + 1, 7) : stepNumber;

        await tx.onboardingProgress.upsert({
          where: { userId },
          create: {
            userId,
            status: 'IN_PROGRESS',
            currentStep: nextStep,
            completedSteps,
            lastSavedAt: now,
            onboardingStartedAt: now,
            onboardingLastActivityAt: now,
            draftData: stepPayload.draftData ? JSON.stringify(stepPayload.draftData) : null,
          },
          update: {
            status: existingProgress?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
            currentStep: nextStep,
            completedSteps,
            lastSavedAt: now,
            onboardingLastActivityAt: now,
            draftData: stepPayload.draftData ? JSON.stringify(stepPayload.draftData) : existingProgress?.draftData,
          },
        });
      }, { timeout: 25000, maxWait: 15000 });
    });

    const canonicalState = await this.getOnboardingState(userId);

    return {
      success: true,
      step: stepNumber,
      completed: isStepComplete,
      nextStep: isStepComplete ? Math.min(stepNumber + 1, 7) : stepNumber,
      profile: canonicalState.profile,
      progress: {
        currentStep: canonicalState.progress.currentStep,
        completedSteps: canonicalState.progress.completedSteps,
        totalSteps: 7,
        status: canonicalState.progress.status,
        lastSavedAt: canonicalState.progress.lastSavedAt,
      },
    };
  }

  /**
   * ATOMIC TRANSACTIONAL COMPLETION RULE:
   * Validates mandatory canonical profile criteria, marks User & Progress completed atomically.
   */
  static async completeOnboarding(userId: string, payload?: any) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            education: true,
            experience: true,
            userSkills: { include: { skill: true } },
            projects: true,
            careerGoal: true,
            jobPreference: true,
          },
        },
        onboardingProgress: true,
      },
    });

    if (!user) {
      throw new Error('User account not found.');
    }

    // 1. If payload is passed, validate and sync all data atomically first
    if (payload && Object.keys(payload).length > 0) {
      if (payload.aboutYou) {
        Step1AboutYouSchema.parse(payload.aboutYou);
      }
      if (payload.education) {
        payload.education.forEach((e: any) => EducationItemSchema.parse(e));
      }
      if (payload.experience) {
        payload.experience.forEach((e: any) => ExperienceItemSchema.parse(e));
      }
      if (payload.skills) {
        payload.skills.forEach((s: any) => UserSkillSchema.parse(s));
      }
      if (payload.projects) {
        payload.projects.forEach((p: any) => ProjectItemSchema.parse(p));
      }
      if (payload.careerDirection) {
        Step6CareerDirectionSchema.parse(payload.careerDirection);
      }
      if (payload.preferences) {
        Step7PreferencesSchema.parse(payload.preferences);
      }

      await db.$transaction(async (tx) => {
        if (payload.aboutYou) {
          await ProfileService.updatePersonal(userId, payload.aboutYou, tx);
        }
        if (payload.education) {
          await ProfileService.syncEducation(userId, payload.education, tx);
        }
        if (payload.experience) {
          await ProfileService.syncExperience(userId, payload.experience, tx);
        }
        if (payload.skills) {
          await ProfileService.updateSkills(userId, payload.skills, tx);
        }
        if (payload.projects) {
          await ProfileService.syncProjects(userId, payload.projects, tx);
        }
        if (payload.careerDirection) {
          await ProfileService.updateCareerDirection(userId, payload.careerDirection, tx);
        }
        if (payload.preferences) {
          await ProfileService.updateJobPreferences(userId, payload.preferences, tx);
        }
        if (payload.certifications) {
          await ProfileService.syncCertifications(userId, payload.certifications, tx);
        }
        if (payload.achievements) {
          await ProfileService.syncAchievements(userId, payload.achievements, tx);
        }
        if (payload.professionalLinks) {
          await ProfileService.syncLinks(userId, payload.professionalLinks, tx);
        }
      }, { timeout: 25000, maxWait: 15000 });
    }

    // 2. Load canonical profile from database to verify all mandatory requirements
    const canonical = await db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            education: true,
            experience: true,
            userSkills: true,
            careerGoal: true,
            jobPreference: true,
          },
        },
      },
    });

    const missingRequirements: string[] = [];

    // Personal Overview (Step 1)
    if (!canonical?.name || canonical.name.trim().length < 2) {
      missingRequirements.push('Full name is required (at least 2 characters)');
    }
    if (!canonical?.profile?.phone || canonical.profile.phone.trim().length < 5) {
      missingRequirements.push('Phone number is required (include country code)');
    }
    if (!canonical?.profile?.location || canonical.profile.location.trim().length < 2) {
      missingRequirements.push('Current location is required');
    }

    // Skills (Step 4)
    if (!canonical?.profile?.userSkills || canonical.profile.userSkills.length < 1) {
      missingRequirements.push('Please add at least one skill to your candidate profile');
    }

    // Career Direction (Step 6)
    if (!canonical?.profile?.careerGoal?.targetRole || canonical.profile.careerGoal.targetRole.trim().length < 2) {
      missingRequirements.push('Target job role or career goal is required');
    }

    // Background: Education or Experience
    const cType = canonical?.profile?.candidateType || 'STUDENT';
    const isStudent = cType === 'STUDENT' || cType === 'GRADUATE';
    const eduCount = canonical?.profile?.education?.length || 0;
    const expCount = canonical?.profile?.experience?.length || 0;

    if (isStudent && eduCount < 1) {
      missingRequirements.push('Students and recent graduates must provide at least one education entry');
    }
    if (!isStudent && eduCount < 1 && expCount < 1 && !payload?.hasNoExperience) {
      missingRequirements.push('Please provide at least one education entry or professional work experience entry');
    }

    if (missingRequirements.length > 0) {
      const err: any = new Error(`Cannot complete onboarding. Missing required fields: ${missingRequirements.join('; ')}`);
      err.missingRequirements = missingRequirements;
      throw err;
    }

    // 3. ATOMIC TRANSACTION: Mark onboarding complete in both User and OnboardingProgress
    const now = new Date();
    await retryOnWriteConflict(async () => {
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            isOnboarded: true,
            onboardingCompletedAt: now,
          },
        });

        await tx.onboardingProgress.upsert({
          where: { userId },
          create: {
            userId,
            status: 'COMPLETED',
            currentStep: 8,
            completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
            completedAt: now,
            lastSavedAt: now,
            onboardingLastActivityAt: now,
          },
          update: {
            status: 'COMPLETED',
            currentStep: 8,
            completedSteps: [1, 2, 3, 4, 5, 6, 7, 8],
            completedAt: now,
            lastSavedAt: now,
            onboardingLastActivityAt: now,
          },
        });
      }, { timeout: 25000, maxWait: 15000 });
    });

    // 4. Dispatch celebratory profile completion email (idempotent, non-blocking)
    if (canonical?.email) {
      await EmailService.sendProfileCompletedEmail({
        userId,
        name: canonical.name,
        email: canonical.email,
        targetRole: canonical.profile?.careerGoal?.targetRole || null,
      }).catch((err) => {
        console.error('[OnboardingService] Failed to dispatch completion email:', err);
      });
    }

    const finalState = await this.getOnboardingState(userId);
    return {
      success: true,
      redirectUrl: '/dashboard',
      profile: finalState.profile,
      progress: finalState.progress,
    };
  }
}
