import { resolveAppUrl } from '../urlHelper';

export interface JobApplicationConfirmationEmailParams {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  applicationId: string;
  appliedDate?: Date | string;
  applicationStatus?: string;
  applicationsUrl?: string;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extracts a friendly, polite candidate greeting name.
 * Strips artificial prefixes (e.g. "Candidate LeafFlip" -> "LeafFlip")
 * and extracts the first name (e.g. "Yaswanth Rajana" -> "Yaswanth").
 * Falls back to "there" if name is missing or neutral.
 */
function extractGreetingName(rawName?: string): string {
  if (!rawName) return 'there';
  let cleaned = rawName.trim();
  if (/^candidate\s+/i.test(cleaned)) {
    cleaned = cleaned.replace(/^candidate\s+/i, '').trim();
  }
  if (!cleaned || cleaned.toLowerCase() === 'candidate') {
    return 'there';
  }
  const firstName = cleaned.split(/\s+/)[0];
  return firstName || 'there';
}

export function renderJobApplicationConfirmationEmail(params: JobApplicationConfirmationEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const greetingName = extractGreetingName(params.candidateName);
  const safeGreetingName = escapeHtml(greetingName);
  const safeJobTitle = escapeHtml(params.jobTitle || 'Opportunity');
  const safeCompanyName = escapeHtml(params.companyName || 'Hiring Team');
  const safeApplicationId = escapeHtml(params.applicationId);
  
  // Format canonical APPLIED / SHORTLISTED to friendly Title Case "Applied"
  const safeStatus = escapeHtml(
    params.applicationStatus
      ? params.applicationStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Applied'
  );

  const dateObj = params.appliedDate ? new Date(params.appliedDate) : new Date();
  const appliedDateStr = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const applicationsPageUrl = params.applicationsUrl && params.applicationsUrl.includes('/jobs')
    ? params.applicationsUrl.trim()
    : `${resolveAppUrl(params.applicationsUrl)}/jobs?tab=applications`;

  const subject = `Application Received: ${params.jobTitle} at ${params.companyName}`;

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
      <tr>
        <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #f1f5f9;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; text-decoration: none;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding: 32px 32px 16px 32px;">
          <h1 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.3px;">
            Application submitted successfully!
          </h1>

          <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0; line-height: 1.6;">
            Hi ${safeGreetingName},
          </p>

          <p style="font-size: 14px; color: #334155; margin: 0 0 12px 0; line-height: 1.6;">
            Thank you for applying through PATHWAY.ECO!
          </p>

          <p style="font-size: 14px; color: #334155; margin: 0 0 28px 0; line-height: 1.6;">
            Your application for <strong>${safeJobTitle}</strong> at <strong>${safeCompanyName}</strong> has been successfully submitted. We&apos;re glad you&apos;re taking the next step in your career.
          </p>

          <div style="margin: 0 0 28px 0; padding: 22px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; font-weight: 800; color: #475569; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.6px;">
              APPLICATION DETAILS
            </div>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr>
                <td style="padding: 7px 0; color: #64748b; width: 130px; font-size: 13px;">Position:</td>
                <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">${safeJobTitle}</td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-size: 13px;">Company:</td>
                <td style="padding: 7px 0; font-weight: 600; color: #1e293b;">${safeCompanyName}</td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-size: 13px;">Application ID:</td>
                <td style="padding: 7px 0; font-weight: 700; color: #2563eb; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px;">${safeApplicationId}</td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-size: 13px;">Date Applied:</td>
                <td style="padding: 7px 0; font-weight: 500; color: #334155;">${appliedDateStr}</td>
              </tr>
              <tr>
                <td style="padding: 7px 0; color: #64748b; font-size: 13px;">Status:</td>
                <td style="padding: 7px 0;">
                  <span style="display: inline-block; padding: 3px 12px; font-size: 12px; font-weight: 700; color: #1e40af; background-color: #dbeafe; border-radius: 9999px;">
                    ${safeStatus}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="margin: 0 0 28px 0;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.2px;">
              WHAT HAPPENS NEXT?
            </div>
            <p style="font-size: 14px; color: #334155; margin: 0 0 10px 0; line-height: 1.6;">
              Your application is now available to the recruiting team at <strong>${safeCompanyName}</strong> for review.
            </p>
            <p style="font-size: 14px; color: #334155; margin: 0 0 12px 0; line-height: 1.6;">
              The recruiting team may update your application status as the hiring process progresses.
            </p>
            <p style="font-size: 14px; color: #334155; margin: 0 0 24px 0; line-height: 1.6;">
              You can track your application anytime from <strong style="color: #0f172a;">PATHWAY.ECO &rarr; Jobs &rarr; Applications</strong>.
            </p>
          </div>

          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px 0;">
            <tr>
              <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                      <a href="${applicationsPageUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px; line-height: 1;">
                        View My Applications
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #64748b; margin: 0 0 20px 0; line-height: 1.5; font-style: italic;">
            Submitting an application does not guarantee selection. The recruiting team will contact you if there are updates or next steps.
          </p>

          <p style="font-size: 14px; color: #334155; margin: 0 0 28px 0; line-height: 1.6;">
            We wish you the best in your job search!
          </p>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 24px;">
            <p style="font-size: 14px; color: #1e293b; margin: 0 0 4px 0; font-weight: 600;">Best regards,</p>
            <p style="font-size: 14px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700;">The PATHWAY.ECO Team</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">Discover. Learn. Grow. Get Hired.</p>
            <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.4;">
              This is an automated confirmation email. Please do not reply directly to this message.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;

  const text = `Application submitted successfully!

Hi ${greetingName},

Thank you for applying through PATHWAY.ECO!

Your application for ${params.jobTitle} at ${params.companyName} has been successfully submitted. We're glad you're taking the next step in your career.

APPLICATION DETAILS

Position: ${params.jobTitle}
Company: ${params.companyName}
Application ID: ${params.applicationId}
Date Applied: ${appliedDateStr}
Status: ${params.applicationStatus ? params.applicationStatus.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'Applied'}

WHAT HAPPENS NEXT?

Your application is now available to the recruiting team at ${params.companyName} for review.
The recruiting team may update your application status as the hiring process progresses.
You can track your application anytime from PATHWAY.ECO → Jobs → Applications.

Primary CTA:
View My Applications: ${applicationsPageUrl}

Submitting an application does not guarantee selection. The recruiting team will contact you if there are updates or next steps.

We wish you the best in your job search!

Best regards,

The PATHWAY.ECO Team
Discover. Learn. Grow. Get Hired.

This is an automated confirmation email. Please do not reply directly to this message.`;

  return { subject, html, text };
}
