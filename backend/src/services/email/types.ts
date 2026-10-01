export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  templateKey?: string;
  mergeInfo?: Record<string, any>;
  htmlBody?: string;
  textBody?: string;
}

export interface IEmailProvider {
  sendEmail(options: SendEmailOptions): Promise<EmailSendResult>;
}

export const EMAIL_TEMPLATES = {
  MENTOR_APPLICATION_RECEIVED: 'PATHWAY_MENTOR_APPLICATION_RECEIVED',
  MENTOR_APPLICATION_APPROVED: 'PATHWAY_MENTOR_APPLICATION_APPROVED',
  MENTOR_APPLICATION_REJECTED: 'PATHWAY_MENTOR_APPLICATION_REJECTED',
  MENTOR_PASSWORD_SETUP: 'PATHWAY_MENTOR_PASSWORD_SETUP',
  EMPLOYER_APPLICATION_RECEIVED: 'PATHWAY_EMPLOYER_APPLICATION_RECEIVED',
  EMPLOYER_APPLICATION_APPROVED: 'PATHWAY_EMPLOYER_APPLICATION_APPROVED',
  EMPLOYER_APPLICATION_REJECTED: 'PATHWAY_EMPLOYER_APPLICATION_REJECTED',
  RECRUITER_PASSWORD_SETUP: 'PATHWAY_RECRUITER_PASSWORD_SETUP',
} as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];
