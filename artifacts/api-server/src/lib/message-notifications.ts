import { logger } from "./logger";

/** Best-effort notification: the database remains the source of truth. */
export async function notifyMessageByEmail(name: string, message: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MESSAGE_EMAIL_FROM;
  const to = process.env.MESSAGE_EMAIL_TO;
  if (!apiKey || !from || !to) {
    logger.warn("Message email notification is not configured");
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: "New message from your portfolio", text: `From: ${name}\n\n${message}` }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) logger.warn({ status: response.status }, "Message email notification failed");
  } catch {
    logger.warn("Message email notification failed");
  }
}
