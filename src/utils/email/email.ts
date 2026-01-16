import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";
import { BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME } from "@/config";
import { logger } from "../logger";

// Initialize Brevo API client
let apiInstance: TransactionalEmailsApi | null = null;

if (BREVO_API_KEY) {
  apiInstance = new TransactionalEmailsApi();
  apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY);
} else {
  logger.warn("BREVO_API_KEY is not configured. Email sending will fail.");
}

export async function sendMail(to: string, subject: string, text: string, html: string) {
  try {
    if (!apiInstance) {
      throw new Error(
        "Brevo API client is not initialized. Please set BREVO_API_KEY in your environment variables."
      );
    }

    if (!BREVO_API_KEY) {
      throw new Error(
        "BREVO_API_KEY is not configured. Please set it in your environment variables."
      );
    }

    const sendSmtpEmail = new SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text;
    sendSmtpEmail.sender = {
      name: BREVO_FROM_NAME || "Jozi Makert",
      email: BREVO_FROM_EMAIL || "noreply@jozimakert.com",
    };
    sendSmtpEmail.to = [{ email: to }];

    logger.info(`Sending email to: ${to}`);
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = result.body?.messageId || "unknown";
    logger.info(`✅ Email sent successfully. Message ID: ${messageId}`);
    return result;
  } catch (error) {
    logger.error("❌ Error sending email:", error);
    throw error;
  }
}
