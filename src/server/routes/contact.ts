import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getDb, contactSubmissions } from "../db";
import { sendEmail, contactNotificationEmail } from "../services/email";

type Bindings = {
  DATABASE_URL: string;
  MAIL_FROM: string;
  MAIL_TO: string;
};

export const contactRouter = new Hono<{ Bindings: Bindings }>();

// ============================================================================
// POST /api/contact - Submit contact form
// ============================================================================
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

contactRouter.post("/", zValidator("json", contactSchema), async (c) => {
  const data = c.req.valid("json");
  const db = getDb(c.env.DATABASE_URL);

  // Get client info
  const ipAddress =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for") ??
    null;
  const userAgent = c.req.header("user-agent") ?? null;

  try {
    // Save to database
    const result = await db
      .insert(contactSubmissions)
      .values({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        ipAddress,
        userAgent,
        metadata: {
          source: "website",
          page: c.req.header("referer") ?? "/contact",
          timestamp: new Date().toISOString(),
        },
      })
      .returning({ id: contactSubmissions.id });

    // Send email notification
    const emailTemplate = contactNotificationEmail(data);
    const emailResult = await sendEmail(
      {
        to: c.env.MAIL_TO,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        replyTo: data.email, // Allow direct reply to sender
      },
      c.env.MAIL_FROM,
      "TMNG Contact"
    );

    if (!emailResult.success) {
      console.warn("[Contact] Email notification failed:", emailResult.message);
      // Don't fail the request even if email fails - the data is saved
    }

    return c.json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
      id: result[0].id,
    });
  } catch (error) {
    console.error("[Contact] Error saving submission:", error);
    return c.json(
      {
        success: false,
        error: "Failed to submit contact form. Please try again.",
      },
      500
    );
  }
});
