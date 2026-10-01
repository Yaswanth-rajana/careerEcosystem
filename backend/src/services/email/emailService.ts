import { db } from '../../db/client';
import { IEmailProvider, EMAIL_TEMPLATES } from './types';
import { ZeptoMailProvider } from './zeptoMailProvider';

export class EmailService {
  private static provider: IEmailProvider = new ZeptoMailProvider();

  /**
   * Allows plugging in alternative email providers during testing or expansion.
   */
  public static setProvider(provider: IEmailProvider) {
    this.provider = provider;
  }

  /**
   * Dispatches transactional confirmation when a mentor application is submitted.
   */
  static async sendMentorApplicationReceivedEmail(params: {
    name: string;
    email: string;
    referenceId: string;
    applicationId: string;
    submittedDate?: Date | string;
  }): Promise<{ success: boolean; deliveryId?: string }> {
    const subject = 'We received your PATHWAY.ECO Mentor Application';

    const dateObj = params.submittedDate ? new Date(params.submittedDate) : new Date();
    const submittedDateStr = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const mergeInfo = {
      name: params.name,
      reference_id: params.referenceId,
      application_id: params.referenceId,
      status: 'Under Review',
      submitted_date: submittedDateStr,
    };

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
        </div>

        <p style="font-size: 15px; color: #1e293b; margin-top: 0; margin-bottom: 16px;">Hi ${params.name},</p>

        <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">Thank you for your interest in becoming a mentor at PATHWAY.ECO.</p>

        <p style="font-size: 14px; color: #334155; margin-bottom: 24px;">We’re pleased to confirm that we’ve successfully received your mentor application. Our team will review the information you provided, including your professional experience, areas of expertise, and mentorship interests.</p>

        <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Application Details</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 140px;">Application ID:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #2563eb; font-family: monospace;">${params.referenceId}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Status:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #d97706;">Under Review</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Submitted On:</td>
              <td style="padding: 4px 0; color: #334155; font-weight: 500;">${submittedDateStr}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #334155; margin-bottom: 24px;">We carefully review every application to ensure that mentors on PATHWAY.ECO can provide meaningful, practical guidance to learners and professionals across our career ecosystem.</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">What happens next?</h3>

        <div style="margin-bottom: 16px;">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">1. Application Review</p>
          <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">Our team will review your professional background and mentorship profile.</p>
        </div>

        <div style="margin-bottom: 16px;">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">2. Decision</p>
          <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">Once the review is complete, we’ll notify you of the outcome by email.</p>
        </div>

        <div style="margin-bottom: 24px;">
          <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">3. Mentor Onboarding</p>
          <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">If your application is approved, you’ll receive a separate email with instructions to activate your PATHWAY.ECO Mentor account and access the Mentor Portal.</p>
        </div>

        <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">There’s nothing you need to do at this stage. We’ll keep you updated once there is a decision on your application.</p>

        <p style="font-size: 14px; color: #334155; margin-bottom: 24px;">Thank you for choosing to share your experience and help others take their next career step.</p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px;">
          <p style="font-size: 14px; color: #1e293b; margin: 0 0 4px 0; font-weight: 600;">Warm regards,</p>
          <p style="font-size: 14px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700;">PATHWAY.ECO Team</p>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Empowering careers. Connecting possibilities.</p>
        </div>
      </div>
    `;

    const textBody = `Hi ${params.name},\n\nThank you for your interest in becoming a mentor at PATHWAY.ECO.\n\nWe’re pleased to confirm that we’ve successfully received your mentor application. Our team will review the information you provided, including your professional experience, areas of expertise, and mentorship interests.\n\nApplication Details\n\nApplication ID: ${params.referenceId}\nStatus: Under Review\nSubmitted On: ${submittedDateStr}\n\nWe carefully review every application to ensure that mentors on PATHWAY.ECO can provide meaningful, practical guidance to learners and professionals across our career ecosystem.\n\nWhat happens next?\n\n1. Application Review\nOur team will review your professional background and mentorship profile.\n\n2. Decision\nOnce the review is complete, we’ll notify you of the outcome by email.\n\n3. Mentor Onboarding\nIf your application is approved, you’ll receive a separate email with instructions to activate your PATHWAY.ECO Mentor account and access the Mentor Portal.\n\nThere’s nothing you need to do at this stage. We’ll keep you updated once there is a decision on your application.\n\nThank you for choosing to share your experience and help others take their next career step.\n\nWarm regards,\nPATHWAY.ECO Team\nEmpowering careers. Connecting possibilities.`;

    const sendResult = await this.provider.sendEmail({
      to: params.email,
      toName: params.name,
      subject,
      templateKey: EMAIL_TEMPLATES.MENTOR_APPLICATION_RECEIVED,
      mergeInfo,
      htmlBody,
      textBody,
    });

    const delivery = await (db as any).emailDelivery.create({
      data: {
        eventType: 'MENTOR_APPLICATION_RECEIVED',
        recipient: params.email.toLowerCase(),
        referenceType: 'MENTOR_APPLICATION',
        referenceId: params.applicationId,
        provider: 'ZEPTOMAIL',
        status: sendResult.success ? (sendResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
        providerMessageId: sendResult.messageId || null,
        lastError: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    }).catch((err: any) => {
      console.error('[EmailService] Failed to record EmailDelivery:', err);
      return null;
    });

    return {
      success: sendResult.success,
      deliveryId: delivery?.id,
    };
  }

  /**
   * Dispatches approval & initial password setup email to the approved mentor.
   */
  static async sendMentorApplicationApprovedEmail(params: {
    name: string;
    email: string;
    setupUrl: string;
    applicationId: string;
    referenceId?: string;
    userId: string;
  }): Promise<{ success: boolean; deliveryId?: string }> {
    const subject = 'Your PATHWAY.ECO Mentor Application Has Been Approved 🎉';
    const portalUrl = process.env.MENTOR_PORTAL_URL || 'http://localhost:3003';
    const appIdDisplay = params.referenceId || params.applicationId;

    const mergeInfo = {
      name: params.name,
      email: params.email,
      application_id: appIdDisplay,
      portal_url: portalUrl,
      setup_link: params.setupUrl,
      expiry_hours: '24',
    };

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
        </div>

        <p style="font-size: 15px; color: #1e293b; margin-top: 0; margin-bottom: 16px;">Hi ${params.name},</p>

        <p style="font-size: 14px; color: #334155; margin-bottom: 16px;">We’re excited to let you know that your application to become a PATHWAY.ECO Mentor has been approved.</p>

        <p style="font-size: 14px; color: #0f172a; font-weight: 700; margin-bottom: 16px;">Welcome to the PATHWAY.ECO mentor community.</p>

        <p style="font-size: 14px; color: #334155; margin-bottom: 24px;">Your experience and expertise can now help students and professionals navigate their career journeys through meaningful, practical mentorship.</p>

        <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Mentor Account</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 140px;">Account Email:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${params.email}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Application ID:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #2563eb; font-family: monospace;">${appIdDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Mentor Status:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #16a34a;">Approved</td>
            </tr>
          </table>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #0f172a;">
            Your Mentor Portal is ready.
          </div>
        </div>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">Get Started</h3>
        <p style="font-size: 14px; color: #334155; margin-bottom: 20px;">To activate your account and access the Mentor Portal, please set a secure password using the button below.</p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${params.setupUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: -0.2px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
            Set Up Your Mentor Account
          </a>
        </div>

        <p style="font-size: 13px; color: #475569; text-align: center; margin-top: 8px; margin-bottom: 24px; font-weight: 500;">
          Your secure account setup link will expire in 24 hours.
        </p>

        <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; margin-bottom: 24px;">
          If the button above does not work, copy and paste this link into your browser:<br />
          <a href="${params.setupUrl}" style="color: #2563eb; word-break: break-all;">${params.setupUrl}</a>
        </p>

        <p style="font-size: 14px; color: #334155; margin-bottom: 24px;">Once your password is set, you can sign in to the Mentor Portal and begin setting up your mentor profile, services, availability, and mentorship offerings.</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Your Mentor Journey</h3>
        <p style="font-size: 14px; color: #334155; margin-bottom: 12px;">Once you’re inside the portal, you’ll be able to:</p>
        <ul style="font-size: 14px; color: #475569; padding-left: 20px; margin: 0 0 24px 0; line-height: 1.8;">
          <li>Complete your mentor profile</li>
          <li>Define the mentorship services you offer</li>
          <li>Set your availability</li>
          <li>Manage mentorship bookings</li>
          <li>Connect with learners and professionals</li>
          <li>Conduct mentorship sessions</li>
          <li>View reviews and your mentorship activity</li>
        </ul>

        <p style="font-size: 14px; color: #334155; margin-bottom: 8px;">We’re looking forward to having you as part of the PATHWAY.ECO community.</p>
        <p style="font-size: 14px; color: #0f172a; font-weight: 700; margin-bottom: 24px;">Welcome aboard.</p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px;">
          <p style="font-size: 14px; color: #1e293b; margin: 0 0 4px 0; font-weight: 600;">Warm regards,</p>
          <p style="font-size: 14px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700;">PATHWAY.ECO Team</p>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 16px 0;">Empowering careers. Connecting possibilities.</p>
          <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 16px 0;" />
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin: 0;">
            This is an automated email from PATHWAY.ECO.<br />
            If you did not apply to become a mentor, please contact our support team.
          </p>
        </div>
      </div>
    `;

    const textBody = `Hi ${params.name},\n\nWe’re excited to let you know that your application to become a PATHWAY.ECO Mentor has been approved.\n\nWelcome to the PATHWAY.ECO mentor community.\n\nYour experience and expertise can now help students and professionals navigate their career journeys through meaningful, practical mentorship.\n\nYour Mentor Account\n\nAccount Email: ${params.email}\nApplication ID: ${appIdDisplay}\nMentor Status: Approved\n\nYour Mentor Portal is ready.\n\nGet Started\n\nTo activate your account and access the Mentor Portal, please set a secure password using the link below:\n\n${params.setupUrl}\n\nYour secure account setup link will expire in 24 hours.\n\nOnce your password is set, you can sign in to the Mentor Portal and begin setting up your mentor profile, services, availability, and mentorship offerings.\n\nYour Mentor Journey\n\nOnce you’re inside the portal, you’ll be able to:\n\nComplete your mentor profile\nDefine the mentorship services you offer\nSet your availability\nManage mentorship bookings\nConnect with learners and professionals\nConduct mentorship sessions\nView reviews and your mentorship activity\n\nWe’re looking forward to having you as part of the PATHWAY.ECO community.\n\nWelcome aboard.\n\nWarm regards,\nPATHWAY.ECO Team\nEmpowering careers. Connecting possibilities.\n\nFooter\nThis is an automated email from PATHWAY.ECO.\nIf you did not apply to become a mentor, please contact our support team.`;

    const sendResult = await this.provider.sendEmail({
      to: params.email,
      toName: params.name,
      subject,
      templateKey: EMAIL_TEMPLATES.MENTOR_APPLICATION_APPROVED,
      mergeInfo,
      htmlBody,
      textBody,
    });

    const delivery = await (db as any).emailDelivery.create({
      data: {
        eventType: 'MENTOR_APPLICATION_APPROVED',
        recipient: params.email.toLowerCase(),
        referenceType: 'MENTOR_APPLICATION',
        referenceId: params.applicationId,
        provider: 'ZEPTOMAIL',
        status: sendResult.success ? (sendResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
        providerMessageId: sendResult.messageId || null,
        lastError: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    }).catch((err: any) => {
      console.error('[EmailService] Failed to record EmailDelivery:', err);
      return null;
    });

    return {
      success: sendResult.success,
      deliveryId: delivery?.id,
    };
  }

  /**
   * Dispatches rejection update email to an applicant with respectful feedback.
   * Internal admin notes are never exposed.
   */
  static async sendMentorApplicationRejectedEmail(params: {
    name: string;
    email: string;
    referenceId: string;
    reason?: string;
    applicationId: string;
  }): Promise<{ success: boolean; deliveryId?: string }> {
    const subject = 'Update on your PATHWAY.ECO Mentor Application';

    const mergeInfo = {
      name: params.name,
      reference_id: params.referenceId,
      reason: params.reason || 'We are currently prioritizing specific domain specializations.',
    };

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Update on Your Application</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hi ${params.name},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Thank you for taking the time to apply to the PATHWAY.ECO Mentor Program. After reviewing your application (Ref: <strong>${params.referenceId}</strong>), we are unable to approve your application at this time.</p>
        
        ${params.reason ? `
        <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #94a3b8;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Review Feedback</div>
          <p style="font-size: 14px; color: #334155; margin: 0; line-height: 1.5;">${params.reason}</p>
        </div>` : ''}

        <p style="font-size: 14px; line-height: 1.6; color: #475569;">We receive a large volume of applications from talented professionals. Our current roster focuses on specific demand clusters across student cohorts. We encourage you to re-apply in the future as mentorship needs expand.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">We wish you the very best in your professional journey.<br />PATHWAY.ECO Team</p>
      </div>
    `;

    const textBody = `Hi ${params.name},\n\nThank you for applying to the PATHWAY.ECO Mentor Program (Ref: ${params.referenceId}). After careful consideration, we are unable to approve your application at this time.\n\n${params.reason ? `Feedback: ${params.reason}\n\n` : ''}We wish you the best in your career pursuits.\n\nRegards,\nPATHWAY.ECO Team`;

    const sendResult = await this.provider.sendEmail({
      to: params.email,
      toName: params.name,
      subject,
      templateKey: EMAIL_TEMPLATES.MENTOR_APPLICATION_REJECTED,
      mergeInfo,
      htmlBody,
      textBody,
    });

    const delivery = await (db as any).emailDelivery.create({
      data: {
        eventType: 'MENTOR_APPLICATION_REJECTED',
        recipient: params.email.toLowerCase(),
        referenceType: 'MENTOR_APPLICATION',
        referenceId: params.applicationId,
        provider: 'ZEPTOMAIL',
        status: sendResult.success ? (sendResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
        providerMessageId: sendResult.messageId || null,
        lastError: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    }).catch((err: any) => {
      console.error('[EmailService] Failed to record EmailDelivery:', err);
      return null;
    });

    return {
      success: sendResult.success,
      deliveryId: delivery?.id,
    };
  }

  /**
   * Dispatches confirmation email when an employer/recruiter application is received.
   */
  static async sendEmployerApplicationReceivedEmail(params: {
    name: string;
    companyName: string;
    email: string;
    referenceId: string;
    applicationId: string;
    userId?: string | null;
  }): Promise<{ success: boolean; deliveryId?: string }> {
    const subject = `We’ve Received Your PATHWAY.ECO Employer Application — ${params.referenceId}`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 28px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;">
        <div style="margin-bottom: 28px;">
          <span style="font-size: 15px; font-weight: 800; letter-spacing: 0.5px; color: #0f172a; text-transform: uppercase;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
        </div>

        <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 18px; letter-spacing: -0.3px; line-height: 1.3;">Your employer application has been received</h1>

        <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 14px;">Hi ${params.name},</p>
        <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 14px;">Thank you for your interest in hiring talent through PATHWAY.ECO for <strong>${params.companyName}</strong>.</p>
        <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 24px;">We’ve successfully received your employer application and the information submitted during registration. Our team will review your company and professional details as part of our verification process.</p>

        <div style="margin: 24px 0; padding: 18px 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; display: block; margin-bottom: 4px;">Application Reference</span>
                <span style="font-size: 15px; font-weight: 600; color: #0f172a;">${params.referenceId}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 12px;">
                <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; display: block; margin-bottom: 6px;">Current Status</span>
                <span style="display: inline-block; font-size: 13px; font-weight: 600; color: #2563eb; background-color: #eff6ff; padding: 3px 12px; border-radius: 9999px; border: 1px solid #dbeafe;">Pending Review</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin: 28px 0 24px 0;">
          <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.2px;">What happens next?</h2>

          <div style="margin-bottom: 14px;">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">01 — Application Review</p>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">Our team will review your company information and work email to verify your employer profile.</p>
          </div>

          <div style="margin-bottom: 14px;">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">02 — Verification</p>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">Once your application has been reviewed, we’ll confirm your employer account status.</p>
          </div>

          <div style="margin-bottom: 0;">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">03 — Employer Portal Access</p>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">If your application is approved, you’ll receive a separate email with a secure account activation link for the PATHWAY.ECO Employer Portal.</p>
          </div>
        </div>

        <div style="margin: 20px 0 24px 0; padding: 12px 16px; background-color: #f1f5f9; border-radius: 8px;">
          <p style="font-size: 13px; font-weight: 600; color: #334155; margin: 0;">No action is required from you at this time.</p>
        </div>

        <p style="font-size: 14px; color: #475569; margin-top: 0; margin-bottom: 12px;">We’ll notify you by email once there is an update regarding your application.</p>
        <p style="font-size: 14px; color: #475569; margin-top: 0; margin-bottom: 24px;">Thank you for choosing PATHWAY.ECO to connect with skilled and career-ready talent.</p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 28px;">
          <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 2px 0;">Warm regards,</p>
          <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">PATHWAY.ECO Employer Team</p>
          <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">Connecting companies with talent ready to grow.</p>
        </div>
      </div>
    `;

    const textBody = `PATHWAY.ECO\n\nYour employer application has been received\n\nHi ${params.name},\n\nThank you for your interest in hiring talent through PATHWAY.ECO for ${params.companyName}.\n\nWe’ve successfully received your employer application and the information submitted during registration. Our team will review your company and professional details as part of our verification process.\n\nApplication Reference\n${params.referenceId}\n\nCurrent Status\nPending Review\n\nWhat happens next?\n\n01 — Application Review\nOur team will review your company information and work email to verify your employer profile.\n\n02 — Verification\nOnce your application has been reviewed, we’ll confirm your employer account status.\n\n03 — Employer Portal Access\nIf your application is approved, you’ll receive a separate email with a secure account activation link for the PATHWAY.ECO Employer Portal.\n\nNo action is required from you at this time.\n\nWe’ll notify you by email once there is an update regarding your application.\n\nThank you for choosing PATHWAY.ECO to connect with skilled and career-ready talent.\n\nWarm regards,\nPATHWAY.ECO Employer Team\n\nConnecting companies with talent ready to grow.`;

    const sendResult = await this.provider.sendEmail({
      to: params.email,
      toName: params.name,
      subject,
      templateKey: EMAIL_TEMPLATES.EMPLOYER_APPLICATION_RECEIVED,
      htmlBody,
      textBody,
    });

    const delivery = await (db as any).emailDelivery.create({
      data: {
        eventType: 'EMPLOYER_APPLICATION_RECEIVED',
        recipient: params.email.toLowerCase(),
        referenceType: 'EMPLOYER_APPLICATION',
        referenceId: params.applicationId,
        provider: 'ZEPTOMAIL',
        status: sendResult.success ? (sendResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
        providerMessageId: sendResult.messageId || null,
        lastError: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    }).catch(() => null);

    return { success: sendResult.success, deliveryId: delivery?.id };
  }

  /**
   * Dispatches approval & initial password setup email to the approved employer/recruiter.
   */
  static async sendEmployerApplicationApprovedEmail(params: {
    name: string;
    companyName: string;
    email: string;
    setupUrl: string;
    applicationId: string;
    referenceId: string;
    userId: string;
  }): Promise<{ success: boolean; deliveryId?: string }> {
    const subject = `Your PATHWAY.ECO Employer Account Has Been Approved`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 28px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.6;">
        <div style="margin-bottom: 28px;">
          <span style="font-size: 15px; font-weight: 800; letter-spacing: 0.5px; color: #0f172a; text-transform: uppercase;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
        </div>

        <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 18px; letter-spacing: -0.3px; line-height: 1.3;">Your employer account is ready</h1>

        <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 14px;">Hi ${params.name},</p>
        <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 14px;">We’re pleased to let you know that your employer application for <strong>${params.companyName}</strong> has been approved.</p>
        <p style="font-size: 15px; color: #334155; margin-top: 0; margin-bottom: 24px;">Your PATHWAY.ECO Employer Portal is now ready. From your employer workspace, you’ll be able to create opportunities, manage applications, review candidates, and build your hiring pipeline.</p>

        <div style="margin: 28px 0; padding: 22px 24px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; text-align: left;">
          <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Activate your account</h2>
          <p style="font-size: 14px; color: #475569; margin: 0 0 18px 0;">To get started, set a secure password using the button below.</p>
          
          <div style="margin: 18px 0 20px 0;">
            <a href="${params.setupUrl}" style="display: inline-block; padding: 12px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; box-shadow: 0 2px 4px rgba(37,99,235,0.18);">Activate Employer Account</a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 6px 0;">Your secure account activation link is valid for 24 hours and can only be used once.</p>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">If the link expires, you can request a new activation link from the Employer Portal sign-in page.</p>
        </div>

        <div style="margin: 24px 0; padding: 18px 20px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin: 0 0 14px 0;">Your account</h3>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
            <tr>
              <td style="padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 2px;">Account email</span>
                <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${params.email}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 2px;">Application reference</span>
                <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${params.referenceId}</span>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 10px;">
                <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 4px;">Account status</span>
                <span style="display: inline-block; font-size: 12px; font-weight: 700; color: #15803d; background-color: #f0fdf4; padding: 2px 10px; border-radius: 9999px; border: 1px solid #bbf7d0;">Approved</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin: 28px 0 24px 0;">
          <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.2px;">What's next?</h2>
          <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">Once your account is activated, you can:</p>

          <div style="margin-bottom: 14px;">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">01 — Complete your company profile</p>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">Add your company information, branding, and hiring details.</p>
          </div>

          <div style="margin-bottom: 14px;">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">02 — Create your first opportunity</p>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">Publish a job and define the skills and requirements you're looking for.</p>
          </div>

          <div style="margin-bottom: 0;">
            <p style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0;">03 — Manage your hiring pipeline</p>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.5;">Review applications, assess candidates, schedule interviews, and move candidates through your hiring process.</p>
          </div>
        </div>

        <p style="font-size: 14px; color: #475569; margin-top: 24px; margin-bottom: 24px;">We look forward to helping you connect with the right talent through PATHWAY.ECO.</p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 28px;">
          <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 2px 0;">Warm regards,</p>
          <p style="font-size: 14px; color: #475569; margin: 0 0 16px 0;">PATHWAY.ECO Employer Team</p>
          <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">Connecting companies with talent ready to grow.</p>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #94a3b8; line-height: 1.6;">
          <p style="margin: 0 0 4px 0; font-weight: 700; color: #64748b;">PATHWAY.ECO</p>
          <p style="margin: 0 0 6px 0;">&copy; 2026 PATHWAY.ECO. All rights reserved.</p>
          <p style="margin: 0;">Privacy &bull; Terms &bull; Support</p>
        </div>
      </div>
    `;

    const textBody = `PATHWAY.ECO\n\nYour employer account is ready\n\nHi ${params.name},\n\nWe’re pleased to let you know that your employer application for ${params.companyName} has been approved.\n\nYour PATHWAY.ECO Employer Portal is now ready. From your employer workspace, you’ll be able to create opportunities, manage applications, review candidates, and build your hiring pipeline.\n\nActivate your account\n\nTo get started, set a secure password using the button below.\n\n${params.setupUrl}\n\nYour secure account activation link is valid for 24 hours and can only be used once.\n\nIf the link expires, you can request a new activation link from the Employer Portal sign-in page.\n\nYour account\n\nAccount email\n${params.email}\n\nApplication reference\n${params.referenceId}\n\nAccount status\nApproved\n\nWhat's next?\n\nOnce your account is activated, you can:\n\n01 — Complete your company profile\nAdd your company information, branding, and hiring details.\n\n02 — Create your first opportunity\nPublish a job and define the skills and requirements you're looking for.\n\n03 — Manage your hiring pipeline\nReview applications, assess candidates, schedule interviews, and move candidates through your hiring process.\n\nWe look forward to helping you connect with the right talent through PATHWAY.ECO.\n\nWarm regards,\nPATHWAY.ECO Employer Team\n\nConnecting companies with talent ready to grow.\n\n---\nPATHWAY.ECO\n© 2026 PATHWAY.ECO. All rights reserved.\nPrivacy · Terms · Support`;

    const sendResult = await this.provider.sendEmail({
      to: params.email,
      toName: params.name,
      subject,
      templateKey: EMAIL_TEMPLATES.EMPLOYER_APPLICATION_APPROVED,
      htmlBody,
      textBody,
    });

    const delivery = await (db as any).emailDelivery.create({
      data: {
        eventType: 'EMPLOYER_APPLICATION_APPROVED',
        recipient: params.email.toLowerCase(),
        referenceType: 'EMPLOYER_APPLICATION',
        referenceId: params.applicationId,
        provider: 'ZEPTOMAIL',
        status: sendResult.success ? (sendResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
        providerMessageId: sendResult.messageId || null,
        lastError: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    }).catch(() => null);

    return { success: sendResult.success, deliveryId: delivery?.id };
  }

  /**
   * Dispatches rejection update email to an employer applicant.
   */
  static async sendEmployerApplicationRejectedEmail(params: {
    name: string;
    companyName: string;
    email: string;
    referenceId: string;
    applicationId: string;
    reason?: string | null;
  }): Promise<{ success: boolean; deliveryId?: string }> {
    const subject = `Update on your PATHWAY.ECO Employer Application (${params.companyName})`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">PATHWAY<span style="color: #2563eb;">.ECO</span></span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Employer Application Status</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hi ${params.name},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Thank you for your interest in hiring through PATHWAY.ECO for <strong>${params.companyName}</strong>. After reviewing your application (Ref: <strong>${params.referenceId}</strong>), we are unable to approve your employer profile at this time.</p>
        ${params.reason ? `
        <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #94a3b8;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Review Note</div>
          <p style="font-size: 14px; color: #334155; margin: 0; line-height: 1.5;">${params.reason}</p>
        </div>` : ''}
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">If you believe this decision was made in error or if your business details have updated, please feel free to reach out to our verification team.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">PATHWAY.ECO Team</p>
      </div>
    `;

    const textBody = `Hi ${params.name},\n\nThank you for applying to hire on PATHWAY.ECO for ${params.companyName} (Ref: ${params.referenceId}). We are unable to approve your application at this time.\n\n${params.reason ? `Feedback: ${params.reason}\n\n` : ''}Regards,\nPATHWAY.ECO Team`;

    const sendResult = await this.provider.sendEmail({
      to: params.email,
      toName: params.name,
      subject,
      templateKey: EMAIL_TEMPLATES.EMPLOYER_APPLICATION_REJECTED,
      htmlBody,
      textBody,
    });

    const delivery = await (db as any).emailDelivery.create({
      data: {
        eventType: 'EMPLOYER_APPLICATION_REJECTED',
        recipient: params.email.toLowerCase(),
        referenceType: 'EMPLOYER_APPLICATION',
        referenceId: params.applicationId,
        provider: 'ZEPTOMAIL',
        status: sendResult.success ? (sendResult.simulated ? 'SIMULATED' : 'SENT') : 'FAILED',
        providerMessageId: sendResult.messageId || null,
        lastError: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    }).catch(() => null);

    return { success: sendResult.success, deliveryId: delivery?.id };
  }
}

