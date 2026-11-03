import { resolveAppUrl } from '../urlHelper';

export interface WelcomeEmailParams {
  firstName: string;
  email: string;
  appUrl?: string;
}

export function renderWelcomeEmail(params: WelcomeEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const appUrl = resolveAppUrl(params.appUrl);
  const onboardingUrl = `${appUrl}/onboarding`;
  const subject = "Welcome to PATHWAY.ECO — Let's shape your career journey";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
      </div>

      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.5px;">Welcome to PATHWAY.ECO, ${params.firstName}!</h1>

      <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 16px;">
        We're excited to have you here.
      </p>

      <p style="font-size: 14px; color: #334155; margin-top: 0; margin-bottom: 24px; line-height: 1.6;">
        PATHWAY.ECO helps you turn where you are today into a clearer path forward &mdash; with personalized career paths, learning, mentorship, preparation, and opportunities.
      </p>

      <div style="margin: 24px 0; padding: 22px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 13px; font-weight: 700; color: #475569; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Your journey starts with your profile</h2>
        
        <div style="margin-bottom: 16px;">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">1. Build your profile</p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Tell us about your education, experience, skills, and goals.</p>
        </div>

        <div style="margin-bottom: 16px;">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">2. Discover your direction</p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Explore career paths, skill gaps, learning recommendations, and opportunities aligned with your profile.</p>
        </div>

        <div>
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">3. Build toward your goals</p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Connect with mentors, prepare for opportunities, and keep progressing through your career journey.</p>
        </div>
      </div>

      <div style="margin: 32px 0 24px 0; text-align: center;">
        <a href="${onboardingUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
          Complete your profile &rarr;
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 10px; margin-bottom: 0;">It takes about 3 minutes, and your progress is automatically saved.</p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; margin-bottom: 16px;">
        If the button above does not work, visit:<br/>
        <a href="${onboardingUrl}" style="color: #2563eb; word-break: break-all;">${onboardingUrl}</a>
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px;">
        <p style="font-size: 14px; color: #1e293b; margin: 0 0 4px 0; font-weight: 600;">Warm regards,</p>
        <p style="font-size: 14px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700;">PATHWAY.ECO Team</p>
        <p style="font-size: 12px; color: #64748b; margin: 0;">Empowering careers. Connecting possibilities.</p>
      </div>
    </div>
  `;

  const text = `Welcome to PATHWAY.ECO, ${params.firstName}!\n\nWe're excited to have you here.\n\nPATHWAY.ECO helps you turn where you are today into a clearer path forward — with personalized career paths, learning, mentorship, preparation, and opportunities.\n\nYour journey starts with your profile:\n1. Build your profile — Tell us about your education, experience, skills, and goals.\n2. Discover your direction — Explore career paths, skill gaps, learning recommendations, and opportunities aligned with your profile.\n3. Build toward your goals — Connect with mentors, prepare for opportunities, and keep progressing through your career journey.\n\nComplete your profile:\n${onboardingUrl}\n\n(It takes about 3 minutes, and your progress is automatically saved.)\n\nWarm regards,\nPATHWAY.ECO Team\nEmpowering careers. Connecting possibilities.`;

  return { subject, html, text };
}
