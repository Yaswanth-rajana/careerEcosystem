import { IEmailProvider, SendEmailOptions, EmailSendResult } from './types';

export class ZeptoMailProvider implements IEmailProvider {
  private apiKey: string | undefined;
  private fromEmail: string;
  private fromName: string;
  private bounceAddress: string | undefined;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.ZEPTOMAIL_SEND_MAIL_TOKEN || process.env.ZEPTOMAIL_API_KEY || process.env.ZEPTO_API_KEY;
    this.fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || process.env.FROM_EMAIL || process.env.ZEPTO_FROM_EMAIL || 'notify@smven.com';
    this.fromName = process.env.ZEPTOMAIL_FROM_NAME || process.env.FROM_NAME || 'PATHWAY.ECO Team';
    this.bounceAddress = process.env.ZEPTOMAIL_BOUNCE_ADDRESS;
    this.apiUrl = process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.in/v1.1/email';
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    // If no API key configured, run in graceful simulation mode for local development and test suite
    if (!this.apiKey) {
      console.log(`[ZeptoMailProvider: Simulated Mode] To: ${options.to} | Subject: "${options.subject}" | Template: ${options.templateKey || 'Direct'}`);
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        simulated: true,
      };
    }

    try {
      // If htmlBody is provided, dispatch directly using the rich HTML payload so no template setup in ZeptoMail console is needed.
      const isTemplate = Boolean(options.templateKey) && !options.htmlBody;
      const url = isTemplate && !this.apiUrl.includes('/template')
        ? `${this.apiUrl}/template`
        : this.apiUrl;

      const payload: Record<string, any> = {
        from: {
          address: this.fromEmail,
          name: this.fromName,
        },
        to: [
          {
            email_address: {
              address: options.to,
              name: options.toName || options.to.split('@')[0],
            },
          },
        ],
        subject: options.subject,
      };

      if (this.bounceAddress) {
        payload.bounce_address = this.bounceAddress;
      }

      if (isTemplate && options.templateKey) {
        payload.template_key = options.templateKey;
        if (options.mergeInfo) {
          payload.merge_info = options.mergeInfo;
        }
      } else {
        if (options.htmlBody) {
          payload.htmlbody = options.htmlBody;
        }
        if (options.textBody) {
          payload.textbody = options.textBody;
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.apiKey.startsWith('Zoho-enczapikey') || this.apiKey.startsWith('Send-Mail-Token')
            ? this.apiKey
            : `Zoho-enczapikey ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = responseData?.message || responseData?.error?.message || `HTTP ${response.status}: Failed to dispatch ZeptoMail`;
        console.error('[ZeptoMailProvider Error]', errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }

      const messageId = responseData?.data?.[0]?.message_id || responseData?.message_id || `zm_${Date.now()}`;
      return {
        success: true,
        messageId,
      };
    } catch (err: any) {
      console.error('[ZeptoMailProvider Network Exception]', err);
      return {
        success: false,
        error: err.message || 'Network exception while connecting to ZeptoMail',
      };
    }
  }
}
