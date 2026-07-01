/**
 * Email Service
 *
 * Architecture for sending emails.
 * Currently uses mock provider (console log).
 * To integrate a real provider:
 * 1. Create a class implementing EmailProvider
 * 2. Replace MockEmailProvider in getProvider()
 *
 * Supported integrations:
 * - Resend
 * - SendGrid
 * - Mailgun
 * - SMTP (fallback)
 */

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  name: string;
  send(request: EmailRequest): Promise<{ success: boolean; error?: string }>;
}

class MockEmailProvider implements EmailProvider {
  name = "MockEmail";

  async send(request: EmailRequest): Promise<{ success: boolean; error?: string }> {
    console.log("[EmailService] Mock send:", {
      to: request.to,
      subject: request.subject,
      textPreview: (request.text || request.html).slice(0, 100),
    });
    return { success: true };
  }
}

/** TODO: Implement Resend */
class ResendProvider implements EmailProvider {
  name = "Resend";
  async send(_request: EmailRequest): Promise<{ success: boolean; error?: string }> {
    throw new Error("Resend not implemented yet");
  }
}

/** TODO: Implement SendGrid */
class SendGridProvider implements EmailProvider {
  name = "SendGrid";
  async send(_request: EmailRequest): Promise<{ success: boolean; error?: string }> {
    throw new Error("SendGrid not implemented yet");
  }
}

/** TODO: Implement SMTP */
class SMTPProvider implements EmailProvider {
  name = "SMTP";
  async send(_request: EmailRequest): Promise<{ success: boolean; error?: string }> {
    throw new Error("SMTP not implemented yet");
  }
}

class EmailServiceClass {
  private provider: EmailProvider | null = null;

  private getProvider(): EmailProvider {
    if (!this.provider) {
      // TODO: Replace with real provider
      // this.provider = new ResendProvider(process.env.RESEND_API_KEY!);
      this.provider = new MockEmailProvider();
    }
    return this.provider!;
  }

  async sendVerificationEmail(params: {
    email: string;
    token: string;
    userName: string;
  }): Promise<{ success: boolean; error?: string }> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${params.token}`;
    return this.getProvider().send({
      to: params.email,
      subject: "Verify your email - PeopleReview",
      html: `
        <h2>Welcome to PeopleReview!</h2>
        <p>Hi ${params.userName},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#eab308;color:#000;text-decoration:none;border-radius:8px;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
      text: `Verify your email: ${verificationUrl}`,
    });
  }

  async sendNotificationEmail(params: {
    email: string;
    title: string;
    body: string;
  }): Promise<{ success: boolean; error?: string }> {
    return this.getProvider().send({
      to: params.email,
      subject: params.title,
      html: `<p>${params.body}</p>`,
      text: params.body,
    });
  }

  async sendPasswordResetEmail(params: {
    email: string;
    resetUrl: string;
  }): Promise<{ success: boolean; error?: string }> {
    return this.getProvider().send({
      to: params.email,
      subject: "Reset your password - PeopleReview",
      html: `
        <p>Click the link to reset your password:</p>
        <a href="${params.resetUrl}">Reset Password</a>
      `,
      text: `Reset password: ${params.resetUrl}`,
    });
  }
}

export const emailService = new EmailServiceClass();