/**
 * Email service using MailChannels via Cloudflare Workers
 * @see https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels/
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

interface MailChannelsPersonalization {
  to: { email: string; name?: string }[];
  reply_to?: { email: string; name?: string };
}

interface MailChannelsContent {
  type: "text/plain" | "text/html";
  value: string;
}

interface MailChannelsPayload {
  personalizations: MailChannelsPersonalization[];
  from: { email: string; name: string };
  subject: string;
  content: MailChannelsContent[];
}

export async function sendEmail(
  options: EmailOptions,
  fromEmail: string,
  fromName: string = "TMNG"
): Promise<{ success: boolean; message: string }> {
  const { to, subject, text, html, replyTo } = options;

  // Normalize recipients to array
  const recipients = Array.isArray(to) ? to : [to];

  const personalizations: MailChannelsPersonalization[] = [
    {
      to: recipients.map((email) => ({ email })),
    },
  ];

  if (replyTo) {
    personalizations[0].reply_to = { email: replyTo };
  }

  const content: MailChannelsContent[] = [];
  if (text) {
    content.push({ type: "text/plain", value: text });
  }
  if (html) {
    content.push({ type: "text/html", value: html });
  }

  const payload: MailChannelsPayload = {
    personalizations,
    from: { email: fromEmail, name: fromName },
    subject,
    content,
  };

  try {
    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 202) {
      return { success: true, message: "Email sent successfully" };
    }

    const errorText = await response.text();
    console.error("[Email] MailChannels error:", response.status, errorText);
    return { success: false, message: `Email failed: ${errorText}` };
  } catch (error) {
    console.error("[Email] Network error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export function contactNotificationEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): { subject: string; html: string; text: string } {
  return {
    subject: `[TMNG Contact] ${data.subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #e5e5e5; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.2); }
    h1 { color: #e879f9; margin: 0 0 24px 0; font-size: 24px; }
    .field { margin-bottom: 20px; }
    .label { color: #a78bfa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { color: #f5f5f5; font-size: 16px; line-height: 1.6; }
    .message-box { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; margin-top: 24px; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); color: #888; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📬 New Contact Submission</h1>
    
    <div class="field">
      <div class="label">From</div>
      <div class="value">${data.name} &lt;${data.email}&gt;</div>
    </div>
    
    <div class="field">
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
    </div>
    
    <div class="message-box">
      <div class="label">Message</div>
      <div class="value">${data.message.replace(/\n/g, "<br>")}</div>
    </div>
    
    <div class="footer">
      Reply directly to this email to respond to ${data.name}.
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
New Contact Submission
======================

From: ${data.name} <${data.email}>
Subject: ${data.subject}

Message:
${data.message}

---
Reply to this email to respond.
    `.trim(),
  };
}

export function newsletterConfirmationEmail(data: {
  confirmUrl: string;
  firstName?: string;
}): { subject: string; html: string; text: string } {
  const greeting = data.firstName ? `Hi ${data.firstName}` : "Hi there";

  return {
    subject: "Confirm your subscription to TMNG Weekly Digest",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #e5e5e5; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.2); text-align: center; }
    h1 { color: #e879f9; margin: 0 0 16px 0; font-size: 28px; }
    p { color: #c4b5fd; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #e879f9 0%, #8b5cf6 100%); color: #fff !important; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; }
    .footer { margin-top: 32px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 Almost there!</h1>
    <p>${greeting}, thanks for subscribing to the TMNG Weekly Digest. Click the button below to confirm your email address.</p>
    
    <a href="${data.confirmUrl}" class="button">Confirm Subscription</a>
    
    <div class="footer">
      <p>If you didn't subscribe, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
${greeting},

Thanks for subscribing to the TMNG Weekly Digest!

Click this link to confirm your email:
${data.confirmUrl}

If you didn't subscribe, you can safely ignore this email.
    `.trim(),
  };
}

export function newsletterWelcomeEmail(data: {
  firstName?: string;
  unsubscribeUrl: string;
}): { subject: string; html: string; text: string } {
  const greeting = data.firstName ? `Welcome, ${data.firstName}` : "Welcome";

  return {
    subject: "Welcome to TMNG Weekly Digest! 🎉",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #e5e5e5; padding: 40px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.2); }
    h1 { color: #e879f9; margin: 0 0 16px 0; font-size: 28px; }
    p { color: #c4b5fd; font-size: 16px; line-height: 1.6; }
    .highlight { background: rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); color: #666; font-size: 12px; }
    a { color: #e879f9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${greeting}! 🎉</h1>
    <p>You're now subscribed to the TMNG Weekly Digest. Every week, you'll receive curated insights on:</p>
    
    <div class="highlight">
      <p>✨ Web development trends<br>
      🎨 Design system best practices<br>
      ⚡ Performance optimization tips<br>
      🚀 Digital strategy insights</p>
    </div>
    
    <p>Stay tuned for our next edition!</p>
    
    <div class="footer">
      <p><a href="${data.unsubscribeUrl}">Unsubscribe</a> if you no longer wish to receive these emails.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
${greeting}! 🎉

You're now subscribed to the TMNG Weekly Digest.

Every week, you'll receive curated insights on:
- Web development trends
- Design system best practices
- Performance optimization tips
- Digital strategy insights

Stay tuned for our next edition!

---
Unsubscribe: ${data.unsubscribeUrl}
    `.trim(),
  };
}
