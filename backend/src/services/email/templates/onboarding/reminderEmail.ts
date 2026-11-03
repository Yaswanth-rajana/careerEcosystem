import { resolveAppUrl } from '../urlHelper';

export const STEP_DESCRIPTIONS: Record<number, string> = {
  1: 'Tell us about your background, headline, and bio.',
  2: 'Share your educational background, degrees, and coursework.',
  3: 'Highlight your professional journey, internships, or student projects.',
  4: "Tell us what you know and what you're building toward.",
  5: 'Showcase your real-world projects and technical accomplishments.',
  6: 'Define your target roles and where you want your career to go.',
  7: 'Set your preferred work style, industries, and mentorship format.',
  8: 'Review your profile and launch your personalized career roadmap.',
};

export interface DynamicReminderEmailParams {
  firstName: string;
  completedSteps: number[];
  totalSteps?: number;
  currentStepNumber: number;
  currentStepName: string;
  completedStepNames: string[];
  remainingSteps?: number;
  completionPercentage?: number;
  reminderNumber: 1 | 2 | 3;
  targetRole?: string | null;
  appUrl?: string;
}

export function renderDynamicReminderEmail(params: DynamicReminderEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const totalSteps = params.totalSteps || 8;
  const completedCount = params.completedSteps.length;
  const remainingCount = params.remainingSteps ?? Math.max(0, totalSteps - completedCount);
  const percentage = params.completionPercentage ?? Math.round((completedCount / totalSteps) * 100);

  const appUrl = resolveAppUrl(params.appUrl);
  const resumeUrl = `${appUrl}/onboarding`;

  // Dynamic progress tone according to completed step tier
  let progressTone = `You're off to a great start, ${params.firstName}`;
  if (completedCount >= 6) {
    progressTone = `You're almost there, ${params.firstName}`;
  } else if (completedCount >= 3) {
    progressTone = `You're making great progress, ${params.firstName}`;
  }

  // Reminder level configuration
  let subject = '';
  let heading = '';
  let bodyParagraph = '';
  let ctaLabel = 'Continue Your Onboarding \u2192';

  if (params.reminderNumber === 1) {
    subject = 'You started your PATHWAY.ECO journey — pick up where you left off';
    heading = progressTone;
    bodyParagraph = `You started building your PATHWAY.ECO profile but haven't finished yet. You're currently on <strong>Step ${params.currentStepNumber}: ${params.currentStepName}</strong>.`;
    ctaLabel = 'Resume Your Onboarding \u2192';
  } else if (params.reminderNumber === 2) {
    subject = "You're making progress on PATHWAY.ECO";
    heading = `You're already ${completedCount} of ${totalSteps} steps in`;
    bodyParagraph = 'Your progress is saved. Continue where you left off and complete your profile to unlock personalized career recommendations.';
    ctaLabel = 'Continue Your Journey \u2192';
  } else {
    subject = 'Your PATHWAY.ECO profile is waiting for you';
    heading = `You're almost there, ${params.firstName}`;
    bodyParagraph = "We've saved everything you've completed so far. Pick up where you left off without entering your information again.";
    ctaLabel = 'Complete My Profile \u2192';
  }

  const stepDescription = STEP_DESCRIPTIONS[params.currentStepNumber] || 'Pick up where you left off and keep moving forward.';

  const completedStepsList = params.completedStepNames.length > 0
    ? `
      <div style="margin-top: 16px;">
        <p style="font-size: 13px; font-weight: 700; color: #166534; margin: 0 0 6px 0;">✓ Completed</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #15803d; line-height: 1.6; list-style-type: disc;">
          ${params.completedStepNames.map((name) => `<li>${name}</li>`).join('')}
        </ul>
      </div>
    `
    : `
      <p style="font-size: 13px; color: #64748b; margin: 12px 0 0 0;">
        <em>Step 1: ${params.currentStepName} is ready for you. It takes less than 3 minutes to finish.</em>
      </p>
    `;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
      </div>

      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.5px;">${heading}</h1>

      <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 20px;">
        ${bodyParagraph}
      </p>

      <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Your Progress</span>
          <span style="font-size: 12px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 12px;">${completedCount} of ${totalSteps} Steps (${percentage}%)</span>
        </div>

        <div style="margin-top: 12px; padding: 12px 16px; background: #ffffff; border-radius: 8px; border-left: 4px solid #2563eb; border: 1px solid #e2e8f0;">
          <p style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #2563eb; margin: 0 0 2px 0;">Current Step</p>
          <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Step ${params.currentStepNumber}: ${params.currentStepName}</p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">${stepDescription}</p>
        </div>

        ${completedStepsList}
      </div>

      <div style="margin: 32px 0 24px 0; text-align: center;">
        <a href="${resumeUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
          ${ctaLabel}
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 10px; margin-bottom: 0;">Your progress is saved, so you can continue exactly where you left off.</p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; margin-bottom: 16px;">
        Resume link:<br/>
        <a href="${resumeUrl}" style="color: #2563eb; word-break: break-all;">${resumeUrl}</a>
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px;">
        <p style="font-size: 14px; color: #1e293b; margin: 0 0 4px 0; font-weight: 600;">Warm regards,</p>
        <p style="font-size: 14px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700;">PATHWAY.ECO Team</p>
        <p style="font-size: 12px; color: #64748b; margin: 0;">Empowering careers. Connecting possibilities.</p>
      </div>
    </div>
  `;

  const text = `${heading}\n\n${bodyParagraph.replace(/<[^>]+>/g, '')}\n\nProgress: ${completedCount} of ${totalSteps} steps completed (${percentage}%).\nCurrent Step: Step ${params.currentStepNumber}: ${params.currentStepName}\n${stepDescription}\n${params.completedStepNames.length > 0 ? `\nCompleted Steps:\n- ${params.completedStepNames.join('\n- ')}\n` : ''}\nContinue your onboarding here:\n${resumeUrl}\n\nYour progress is saved, so you can continue exactly where you left off.\n\nWarm regards,\nPATHWAY.ECO Team\nEmpowering careers. Connecting possibilities.`;

  return { subject, html, text };
}
