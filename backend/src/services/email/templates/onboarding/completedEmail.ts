import { resolveAppUrl } from '../urlHelper';

export interface ProfileCompletedEmailParams {
  firstName: string;
  email: string;
  targetRole?: string | null;
  appUrl?: string;
}

export function renderProfileCompletedEmail(params: ProfileCompletedEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const appUrl = resolveAppUrl(params.appUrl);
  const pathUrl = `${appUrl}/my-path`;
  const subject = 'Your PATHWAY.ECO profile is ready 🎉';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
      </div>

      <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 16px; margin-bottom: 12px;">
        Profile Completed 🎉
      </div>

      <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; letter-spacing: -0.5px;">You're ready to take your next step, ${params.firstName}</h1>

      <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 20px;">
        You've completed your PATHWAY.ECO profile. Based on the information you've shared${params.targetRole ? ` for <strong>${params.targetRole}</strong>` : ''}, you can now explore career paths, identify skill gaps, discover learning opportunities, connect with mentors, and find relevant opportunities.
      </p>

      <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
        <h2 style="font-size: 13px; font-weight: 700; color: #475569; margin-top: 0; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">What’s Available For You Right Now</h2>
        
        <div style="margin-bottom: 14px;">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">🎯 Personalized Career Path & Roadmaps</p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Explore step-by-step milestones tailored to your target roles and experience.</p>
        </div>

        <div style="margin-bottom: 14px;">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">📊 Actionable Skill Gap Analysis</p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">See benchmark comparisons against top hiring requirements and close priority gaps.</p>
        </div>

        <div>
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">🤝 Verified Mentorship & Opportunities</p>
          <p style="font-size: 13px; color: #64748b; margin: 0;">Book 1:1 guidance sessions with industry mentors and apply to curated roles.</p>
        </div>
      </div>

      <div style="margin: 32px 0 24px 0; text-align: center;">
        <a href="${pathUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 34px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
          Explore My Career Path &rarr;
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 10px; margin-bottom: 0;">Your personalized roadmap is now live.</p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; margin-bottom: 16px;">
        Direct access:<br/>
        <a href="${pathUrl}" style="color: #2563eb; word-break: break-all;">${pathUrl}</a>
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px;">
        <p style="font-size: 14px; color: #1e293b; margin: 0 0 4px 0; font-weight: 600;">Warm regards,</p>
        <p style="font-size: 14px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700;">PATHWAY.ECO Team</p>
        <p style="font-size: 12px; color: #64748b; margin: 0;">Empowering careers. Connecting possibilities.</p>
      </div>
    </div>
  `;

  const text = `You're ready to take your next step, ${params.firstName}\n\nYou've completed your PATHWAY.ECO profile. Based on the information you've shared${params.targetRole ? ` for ${params.targetRole}` : ''}, you can now explore career paths, identify skill gaps, discover learning opportunities, connect with mentors, and find relevant opportunities.\n\nExplore your personalized career path:\n${pathUrl}\n\nYour personalized roadmap is now live.\n\nWarm regards,\nPATHWAY.ECO Team\nEmpowering careers. Connecting possibilities.`;

  return { subject, html, text };
}
