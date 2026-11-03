import { db } from '../db/client';
import { EmailService } from './email/emailService';
import { retryOnWriteConflict } from '../utils/retry';

export interface OnboardingStepMeta {
  step: number;
  title: string;
  slug: string;
  description: string;
}

export const ONBOARDING_STEPS_META: OnboardingStepMeta[] = [
  { step: 1, title: 'Personal Profile', slug: 'personal', description: 'About you, headline, contact and bio' },
  { step: 2, title: 'Education & Academics', slug: 'education', description: 'Degree, institution, coursework and achievements' },
  { step: 3, title: 'Work Experience', slug: 'experience', description: 'Roles, company history, or student status' },
  { step: 4, title: 'Skills & Expertise', slug: 'skills', description: 'Technical, soft skills and proficiency levels' },
  { step: 5, title: 'Projects & Portfolio', slug: 'projects', description: 'Key projects, technologies used and live links' },
  { step: 6, title: 'Career Direction & Goals', slug: 'career', description: 'Target job title, industry and timeline' },
  { step: 7, title: 'Job Preferences', slug: 'preferences', description: 'Work style, location, learning format, and mentorship needs' },
  { step: 8, title: 'Review & Launch', slug: 'review', description: 'Profile summary and final confirmation' },
];

export interface OnboardingSummary {
  userId: string;
  name: string;
  email: string;
  isOnboarded: boolean;
  status: string;
  currentStep: number;
  currentStepTitle: string;
  completedSteps: number[];
  completedStepTitles: string[];
  completedStepsCount: number;
  totalSteps: number;
  targetRole: string | null;
  onboardingStartedAt: Date | null;
  onboardingLastActivityAt: Date | null;
  onboardingCompletedAt: Date | null;
  lastSavedAt: Date | null;
  remindersSent: {
    reminder1: boolean;
    reminder1SentAt: Date | null;
    reminder2: boolean;
    reminder2SentAt: Date | null;
    reminder3: boolean;
    reminder3SentAt: Date | null;
  };
  aiContext: {
    candidateType?: string;
    targetRole?: string | null;
    skillsCount: number;
    educationCount: number;
    experienceCount: number;
    projectsCount: number;
    completionPercentage: number;
    nextStepTitle: string;
    pendingStepTitles: string[];
  };
}

export class OnboardingLifecycleService {
  /**
   * Called immediately upon successful account creation (email/password or Google).
   * Ensures OnboardingProgress is initialized and dispatches professional welcome email.
   * Completely idempotent and resilient to provider or network errors.
   */
  static async handleUserRegistered(user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  }): Promise<{ initialized: boolean; welcomeEmail: any }> {
    const now = new Date();

    // 1. Ensure OnboardingProgress is created server-side
    let progress = await db.onboardingProgress.findUnique({
      where: { userId: user.id },
    });

    let initialized = false;
    if (!progress) {
      progress = await retryOnWriteConflict(async () => {
        return await db.onboardingProgress.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            status: 'NOT_STARTED',
            currentStep: 1,
            completedSteps: [],
            onboardingStartedAt: now,
            onboardingLastActivityAt: now,
            lastSavedAt: now,
          },
          update: {},
        });
      });
      initialized = true;
    }

    // 2. Dispatch professional welcome email (idempotent)
    let welcomeEmailResult: any = null;
    try {
      welcomeEmailResult = await EmailService.sendWelcomeEmail({
        userId: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (err: any) {
      console.error('[OnboardingLifecycleService] Error sending welcome email on registration:', err);
      welcomeEmailResult = { success: false, error: err.message };
    }

    return {
      initialized,
      welcomeEmail: welcomeEmailResult,
    };
  }

  /**
   * Produces a verified, server-confirmed summary of candidate onboarding.
   * NEVER claims a step is completed unless explicitly recorded on the server.
   * Compatible with future AI agents and personalization modules.
   */
  static async getOnboardingSummary(userId: string): Promise<OnboardingSummary> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        onboardingProgress: true,
        profile: {
          include: {
            education: true,
            experience: true,
            userSkills: true,
            projects: true,
            careerGoal: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found.`);
    }

    const progress = user.onboardingProgress;
    const completedSteps = progress?.completedSteps || [];
    const currentStep = progress?.currentStep || 1;

    // Verified completed step titles strictly based on completedSteps array
    const completedStepTitles = ONBOARDING_STEPS_META
      .filter((s) => completedSteps.includes(s.step))
      .map((s) => s.title);

    const activeMeta = ONBOARDING_STEPS_META.find((s) => s.step === currentStep) || ONBOARDING_STEPS_META[0];
    const currentStepTitle = activeMeta.title;

    const pendingStepTitles = ONBOARDING_STEPS_META
      .filter((s) => !completedSteps.includes(s.step))
      .map((s) => s.title);

    const targetRole = user.profile?.careerGoal?.targetRole || user.profile?.currentRole || null;

    const startedAt = progress?.onboardingStartedAt || progress?.createdAt || user.createdAt;
    const lastActivityAt = progress?.onboardingLastActivityAt || progress?.lastSavedAt || progress?.updatedAt || startedAt;
    const completedAt = progress?.completedAt || user.onboardingCompletedAt || null;

    const completionPercentage = Math.round((completedSteps.length / ONBOARDING_STEPS_META.length) * 100);

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      isOnboarded: user.isOnboarded || progress?.status === 'COMPLETED',
      status: progress?.status || (user.isOnboarded ? 'COMPLETED' : 'NOT_STARTED'),
      currentStep,
      currentStepTitle,
      completedSteps,
      completedStepTitles,
      completedStepsCount: completedSteps.length,
      totalSteps: ONBOARDING_STEPS_META.length,
      targetRole,
      onboardingStartedAt: startedAt,
      onboardingLastActivityAt: lastActivityAt,
      onboardingCompletedAt: completedAt,
      lastSavedAt: progress?.lastSavedAt || null,
      remindersSent: {
        reminder1: Boolean(progress?.reminder1SentAt),
        reminder1SentAt: progress?.reminder1SentAt || null,
        reminder2: Boolean(progress?.reminder2SentAt),
        reminder2SentAt: progress?.reminder2SentAt || null,
        reminder3: Boolean(progress?.reminder3SentAt),
        reminder3SentAt: progress?.reminder3SentAt || null,
      },
      aiContext: {
        candidateType: user.profile?.candidateType,
        targetRole,
        skillsCount: user.profile?.userSkills?.length || 0,
        educationCount: user.profile?.education?.length || 0,
        experienceCount: user.profile?.experience?.length || 0,
        projectsCount: user.profile?.projects?.length || 0,
        completionPercentage,
        nextStepTitle: currentStepTitle,
        pendingStepTitles,
      },
    };
  }

  /**
   * Evaluates a single user for inactivity reminders.
   * Inactivity intervals:
   *  - Reminder 1: approximately 24 hours of inactivity (24h <= inactivity < 72h, or if not sent yet)
   *  - Reminder 2: approximately 3 days of inactivity (72h <= inactivity < 168h, or if not sent yet)
   *  - Reminder 3: approximately 7 days of inactivity (>= 168h)
   * Stops all reminders once onboarding is completed.
   * Protects against duplicate deliveries with idempotency checks.
   */
  static async evaluateUserReminder(
    userId: string,
    options?: { now?: Date; appUrl?: string }
  ): Promise<{
    eligible: boolean;
    sent?: boolean;
    alreadySent?: boolean;
    reminderNumber?: 1 | 2 | 3;
    reason?: string;
    inactivityHours?: number;
    deliveryId?: string;
  }> {
    const now = options?.now || new Date();

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        onboardingProgress: true,
        profile: {
          include: {
            education: true,
            experience: true,
            userSkills: true,
            careerGoal: true,
          },
        },
      },
    });

    if (!user) {
      return { eligible: false, reason: 'USER_NOT_FOUND' };
    }

    // 1. Mandatory rule: Hard stop all reminders after onboarding completion
    if (
      user.isOnboarded ||
      Boolean(user.onboardingCompletedAt) ||
      user.onboardingProgress?.status === 'COMPLETED' ||
      Boolean(user.onboardingProgress?.completedAt)
    ) {
      return { eligible: false, reason: 'ONBOARDING_ALREADY_COMPLETED' };
    }

    const progress = user.onboardingProgress;
    const lastActivity = progress?.onboardingLastActivityAt || progress?.lastSavedAt || progress?.createdAt || user.createdAt;
    const inactivityMs = Math.max(0, now.getTime() - new Date(lastActivity).getTime());
    const inactivityHours = inactivityMs / (1000 * 60 * 60);

    // Check delivery records in database to ensure zero duplicate reminder events
    const existingDeliveries = await (db as any).emailDelivery.findMany({
      where: {
        referenceId: userId,
        eventType: { in: ['ONBOARDING_REMINDER_1', 'ONBOARDING_REMINDER_2', 'ONBOARDING_REMINDER_3'] },
        status: { in: ['SENT', 'SIMULATED'] },
      },
      select: { eventType: true },
    });

    const sentReminder1 = progress?.reminder1SentAt || existingDeliveries.some((d: any) => d.eventType === 'ONBOARDING_REMINDER_1');
    const sentReminder2 = progress?.reminder2SentAt || existingDeliveries.some((d: any) => d.eventType === 'ONBOARDING_REMINDER_2');
    const sentReminder3 = progress?.reminder3SentAt || existingDeliveries.some((d: any) => d.eventType === 'ONBOARDING_REMINDER_3');

    let dueReminderNumber: 1 | 2 | 3 | null = null;

    // Check threshold eligibility starting from most advanced due reminder
    if (inactivityHours >= 168) {
      // 7+ days inactive
      if (!sentReminder3) {
        dueReminderNumber = 3;
      } else {
        return {
          eligible: false,
          reason: 'ALL_REMINDERS_EXHAUSTED',
          inactivityHours,
        };
      }
    } else if (inactivityHours >= 72) {
      // 3+ days inactive
      if (!sentReminder2) {
        dueReminderNumber = 2;
      } else {
        return {
          eligible: false,
          reason: 'REMINDER_2_ALREADY_SENT_AWAITING_DAY_7',
          inactivityHours,
        };
      }
    } else if (inactivityHours >= 24) {
      // 24+ hours inactive
      if (!sentReminder1) {
        dueReminderNumber = 1;
      } else {
        return {
          eligible: false,
          reason: 'REMINDER_1_ALREADY_SENT_AWAITING_DAY_3',
          inactivityHours,
        };
      }
    } else {
      return {
        eligible: false,
        reason: 'INSUFFICIENT_INACTIVITY',
        inactivityHours,
      };
    }

    // 2. Build verified summary for personalization
    const summary = await this.getOnboardingSummary(userId);

    // 3. Dispatch the personalized reminder email
    const sendResult = await EmailService.sendOnboardingReminderEmail({
      userId: user.id,
      name: user.name,
      email: user.email,
      reminderNumber: dueReminderNumber,
      currentStep: summary.currentStep,
      currentStepTitle: summary.currentStepTitle,
      completedStepsCount: summary.completedStepsCount,
      totalSteps: summary.totalSteps,
      completedStepTitles: summary.completedStepTitles,
      nextStepTitle: summary.currentStepTitle,
      targetRole: summary.targetRole,
      appUrl: options?.appUrl,
    });

    // 4. Update the reminder timestamp in OnboardingProgress for fast indexed lookups
    const reminderField = dueReminderNumber === 1 ? 'reminder1SentAt' : dueReminderNumber === 2 ? 'reminder2SentAt' : 'reminder3SentAt';
    await retryOnWriteConflict(async () => {
      return await db.onboardingProgress.upsert({
        where: { userId },
        create: {
          userId,
          status: 'IN_PROGRESS',
          currentStep: summary.currentStep,
          [reminderField]: now,
          lastSavedAt: now,
        },
        update: {
          [reminderField]: now,
        },
      });
    }).catch((err) => {
      console.error(`[OnboardingLifecycleService] Failed to update ${reminderField}:`, err);
    });

    return {
      eligible: true,
      sent: sendResult.success,
      alreadySent: sendResult.alreadySent,
      reminderNumber: dueReminderNumber,
      deliveryId: sendResult.deliveryId,
      inactivityHours,
    };
  }

  /**
   * Scans and processes inactive candidates due for onboarding reminders.
   * Can be invoked by a cron job, maintenance runner, or API endpoint.
   */
  static async processPendingReminders(options?: {
    now?: Date;
    limit?: number;
    appUrl?: string;
  }): Promise<{
    evaluatedCount: number;
    sentCount: number;
    skippedCount: number;
    results: any[];
  }> {
    const now = options?.now || new Date();
    const limit = options?.limit || 100;

    // Find incomplete candidates
    const candidates = await db.user.findMany({
      where: {
        role: 'CANDIDATE',
        isOnboarded: false,
        status: 'ACTIVE',
      },
      take: limit,
      select: { id: true, email: true, name: true },
    });

    const results: any[] = [];
    let sentCount = 0;
    let skippedCount = 0;

    for (const candidate of candidates) {
      try {
        const evalResult = await this.evaluateUserReminder(candidate.id, {
          now,
          appUrl: options?.appUrl,
        });

        results.push({
          userId: candidate.id,
          email: candidate.email,
          ...evalResult,
        });

        if (evalResult.sent && !evalResult.alreadySent) {
          sentCount++;
        } else {
          skippedCount++;
        }
      } catch (err: any) {
        results.push({
          userId: candidate.id,
          email: candidate.email,
          eligible: false,
          error: err.message,
        });
        skippedCount++;
      }
    }

    return {
      evaluatedCount: candidates.length,
      sentCount,
      skippedCount,
      results,
    };
  }

  /**
   * Records user activity during onboarding and resets inactivity timers.
   */
  static async recordActivity(
    userId: string,
    data?: { currentStep?: number; completedSteps?: number[] }
  ) {
    const now = new Date();
    const existing = await db.onboardingProgress.findUnique({ where: { userId } });

    const updatedCompletedSteps = data?.completedSteps
      ? Array.from(new Set([...(existing?.completedSteps || []), ...data.completedSteps]))
      : existing?.completedSteps || [];

    return await retryOnWriteConflict(async () => {
      return await db.onboardingProgress.upsert({
        where: { userId },
        create: {
          userId,
          status: 'IN_PROGRESS',
          currentStep: data?.currentStep || 1,
          completedSteps: updatedCompletedSteps,
          onboardingStartedAt: now,
          onboardingLastActivityAt: now,
          lastSavedAt: now,
        },
        update: {
          status: existing?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          currentStep: data?.currentStep ?? existing?.currentStep ?? 1,
          completedSteps: updatedCompletedSteps,
          onboardingLastActivityAt: now,
          lastSavedAt: now,
        },
      });
    });
  }
}
