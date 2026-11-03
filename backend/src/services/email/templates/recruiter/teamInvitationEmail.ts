import { resolveRecruiterPortalUrl } from '../urlHelper';

export interface RecruiterTeamInvitationEmailParams {
  toEmail: string;
  inviteeName?: string | null;
  companyName: string;
  inviterName?: string | null;
  role: string;
  acceptUrl: string;
  expiresInDays?: number;
  message?: string | null;
}

export const RECRUITER_ROLE_LABELS: Record<string, string> = {
  COMPANY_ADMIN: 'Company Admin',
  RECRUITER: 'Recruiter',
  TECHNICAL_INTERVIEWER: 'Technical Interviewer',
  HR_INTERVIEWER: 'HR / Managerial Interviewer',
  INTERVIEW_COORDINATOR: 'Interview Coordinator',
  HIRING_MANAGER: 'Hiring Manager',
};

/**
 * Returns a user-friendly role label from canonical or legacy role identifiers.
 */
export function getFriendlyRoleLabel(rawRole?: string | null): string {
  if (!rawRole) return 'Recruiter';
  const upper = rawRole.toUpperCase().trim();
  if (RECRUITER_ROLE_LABELS[upper]) {
    return RECRUITER_ROLE_LABELS[upper];
  }
  if (upper === 'INTERVIEWER') {
    return 'Technical Interviewer';
  }
  // Generic fallback: title case
  return rawRole
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Escapes dynamic string values to prevent HTML injection in emails.
 */
export function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extracts a friendly invitee greeting name.
 * If a valid name is provided (e.g. "Test" or "Sarah Jenkins"), extracts "Test" / "Sarah".
 * If empty or generic (e.g. "Colleague", "User"), falls back to "there".
 */
export function extractInviteeGreeting(rawName?: string | null): string {
  if (!rawName) return 'there';
  let cleaned = rawName.trim();
  // Strip common generic prefixes
  cleaned = cleaned.replace(/^(candidate|user|member|colleague)\s+/i, '').trim();
  if (!cleaned) return 'there';

  const lower = cleaned.toLowerCase();
  if (lower === 'colleague' || lower === 'user' || lower === 'member' || lower === 'there') {
    return 'there';
  }

  // Extract first name
  const firstName = cleaned.split(/\s+/)[0];
  return firstName || 'there';
}

/**
 * Renders the production-ready Recruiter Team Invitation Email in both HTML and plain-text.
 */
export function renderRecruiterTeamInvitationEmail(params: RecruiterTeamInvitationEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const companyName = (params.companyName || 'Company').trim();
  const inviterName = (params.inviterName || 'A team administrator').trim();
  const greetingName = extractInviteeGreeting(params.inviteeName);
  const roleDisplayName = getFriendlyRoleLabel(params.role);
  const expiresInDays = params.expiresInDays && params.expiresInDays > 0 ? params.expiresInDays : 7;
  const acceptUrl = params.acceptUrl.trim();
  const personalMessage = params.message ? params.message.trim() : null;

  // Sanitized dynamic values for HTML rendering
  const safeCompany = escapeHtml(companyName);
  const safeInviter = escapeHtml(inviterName);
  const safeGreetingName = escapeHtml(greetingName);
  const safeRoleDisplayName = escapeHtml(roleDisplayName);
  const safeAcceptUrl = escapeHtml(acceptUrl);
  const safeMessage = personalMessage ? escapeHtml(personalMessage) : null;

  const subject = `Invitation to join ${companyName} on PATHWAY.ECO`;
  const heading = `You're invited to join ${safeCompany} on PATHWAY.ECO`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="background-color: #f8fafc; width: 100%; padding: 40px 16px; box-sizing: border-box;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);">
      <!-- Brand Header -->
      <tr>
        <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; text-decoration: none;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main Body -->
      <tr>
        <td style="padding: 32px 32px 24px 32px;">
          <!-- Primary Heading -->
          <h1 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.35; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            ${heading}
          </h1>

          <!-- Greeting -->
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
            Hi ${safeGreetingName},
          </p>

          <!-- Core Invitation Message -->
          <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #334155;">
            <strong>${safeInviter}</strong> has invited you to join the <strong>${safeCompany}</strong> recruitment team on PATHWAY.ECO as a <strong>${safeRoleDisplayName}</strong>.
          </p>

          <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
            Your access will be based on your assigned role and the permissions granted by your company.
          </p>

          ${
            safeMessage
              ? `<div style="margin: 20px 0; padding: 14px 18px; background-color: #f8fafc; border-left: 3px solid #2563eb; border-radius: 6px; font-size: 13px; color: #475569; font-style: italic; line-height: 1.5;">"${safeMessage}"</div>`
              : ''
          }

          <!-- Compact Invitation Details Summary -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 24px 0 28px 0; padding: 14px 18px; box-sizing: border-box;">
            <tr>
              <td style="padding: 5px 0; font-size: 13px; color: #64748b; width: 90px; vertical-align: top;"><strong>Company:</strong></td>
              <td style="padding: 5px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${safeCompany}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 13px; color: #64748b; vertical-align: top;"><strong>Invited by:</strong></td>
              <td style="padding: 5px 0; font-size: 13px; color: #0f172a;">${safeInviter}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; font-size: 13px; color: #64748b; vertical-align: top;"><strong>Role:</strong></td>
              <td style="padding: 5px 0; font-size: 13px; color: #2563eb; font-weight: 600;">${safeRoleDisplayName}</td>
            </tr>
          </table>

          <!-- Primary CTA Button -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 24px 0;">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                <a href="${safeAcceptUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; background-color: #2563eb; letter-spacing: 0.2px;">Accept Invitation</a>
              </td>
            </tr>
          </table>

          <!-- Expiry Notice -->
          <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
            This invitation link expires in ${expiresInDays} days. If you weren&#039;t expecting this invitation, you can safely ignore this email.
          </p>

          <!-- Sign-off -->
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">
            Best regards,<br>
            <strong style="color: #0f172a;">The PATHWAY.ECO Team</strong>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 20px 32px 28px 32px; background-color: #fafbfc; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569; letter-spacing: 0.2px;">
            Discover. Learn. Grow. Get Hired.
          </p>
          <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const textLines: string[] = [
    `Hi ${greetingName},`,
    '',
    `${inviterName} has invited you to join the ${companyName} recruitment team on PATHWAY.ECO as a ${roleDisplayName}.`,
    '',
    'Your access will be based on your assigned role and the permissions granted by your company.',
  ];

  if (personalMessage) {
    textLines.push('', `"${personalMessage}"`);
  }

  textLines.push(
    '',
    '---',
    'Invitation Details:',
    `• Company: ${companyName}`,
    `• Invited by: ${inviterName}`,
    `• Role: ${roleDisplayName}`,
    '---',
    '',
    'Accept Invitation:',
    acceptUrl,
    '',
    `This invitation link expires in ${expiresInDays} days. If you weren't expecting this invitation, you can safely ignore this email.`,
    '',
    'Best regards,',
    'The PATHWAY.ECO Team',
    '',
    'Discover. Learn. Grow. Get Hired.',
    'This is an automated email. Please do not reply directly to this message.'
  );

  const text = textLines.join('\n');

  return {
    subject,
    html,
    text,
  };
}
