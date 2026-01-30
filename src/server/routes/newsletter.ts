import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, subscribers } from "../db";
import {
  sendEmail,
  newsletterConfirmationEmail,
  newsletterWelcomeEmail,
} from "../services/email";

type Bindings = {
  DATABASE_URL: string;
  MAIL_FROM: string;
  SITE_URL: string;
};

export const newsletterRouter = new Hono<{ Bindings: Bindings }>();

// Generate a random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ============================================================================
// POST /api/newsletter/subscribe - Subscribe to newsletter
// ============================================================================
const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  source: z.string().optional().default("blog"),
});

newsletterRouter.post(
  "/subscribe",
  zValidator("json", subscribeSchema),
  async (c) => {
    const { email, firstName, source } = c.req.valid("json");
    const db = getDb(c.env.DATABASE_URL);

    try {
      // Check if already subscribed
      const existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, email.toLowerCase()))
        .limit(1);

      if (existing.length > 0) {
        const subscriber = existing[0];

        if (subscriber.status === "active") {
          return c.json({
            success: true,
            message: "You're already subscribed!",
          });
        }

        if (subscriber.status === "pending") {
          // Resend confirmation email
          const siteUrl = c.env.SITE_URL ?? "https://tmng.my.id";
          const confirmUrl = `${siteUrl}/api/newsletter/confirm/${subscriber.confirmToken}`;

          const emailTemplate = newsletterConfirmationEmail({
            confirmUrl,
            firstName: subscriber.firstName ?? undefined,
          });

          await sendEmail(
            {
              to: email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
              text: emailTemplate.text,
            },
            c.env.MAIL_FROM,
            "TMNG Weekly Digest"
          );

          return c.json({
            success: true,
            message: "Confirmation email resent. Please check your inbox.",
          });
        }

        // If unsubscribed, reactivate with pending status
        const confirmToken = generateToken();
        await db
          .update(subscribers)
          .set({
            status: "pending",
            confirmToken,
            unsubscribedAt: null,
            firstName: firstName ?? subscriber.firstName,
          })
          .where(eq(subscribers.id, subscriber.id));

        const siteUrl = c.env.SITE_URL ?? "https://tmng.my.id";
        const confirmUrl = `${siteUrl}/api/newsletter/confirm/${confirmToken}`;

        const emailTemplate = newsletterConfirmationEmail({
          confirmUrl,
          firstName,
        });

        await sendEmail(
          {
            to: email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          },
          c.env.MAIL_FROM,
          "TMNG Weekly Digest"
        );

        return c.json({
          success: true,
          message: "Please check your email to confirm your subscription.",
        });
      }

      // Create new subscriber
      const confirmToken = generateToken();
      await db.insert(subscribers).values({
        email: email.toLowerCase(),
        firstName,
        source,
        confirmToken,
        status: "pending",
      });

      // Send confirmation email
      const siteUrl = c.env.SITE_URL ?? "https://tmng.my.id";
      const confirmUrl = `${siteUrl}/api/newsletter/confirm/${confirmToken}`;

      const emailTemplate = newsletterConfirmationEmail({
        confirmUrl,
        firstName,
      });

      const emailResult = await sendEmail(
        {
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        },
        c.env.MAIL_FROM,
        "TMNG Weekly Digest"
      );

      if (!emailResult.success) {
        console.warn("[Newsletter] Confirmation email failed:", emailResult.message);
      }

      return c.json({
        success: true,
        message: "Please check your email to confirm your subscription.",
      });
    } catch (error) {
      console.error("[Newsletter] Subscribe error:", error);
      return c.json(
        {
          success: false,
          error: "Failed to subscribe. Please try again.",
        },
        500
      );
    }
  }
);

// ============================================================================
// GET /api/newsletter/confirm/:token - Confirm subscription
// ============================================================================
newsletterRouter.get("/confirm/:token", async (c) => {
  const token = c.req.param("token");
  const db = getDb(c.env.DATABASE_URL);

  const result = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.confirmToken, token))
    .limit(1);

  if (result.length === 0) {
    // Redirect to website with error
    return c.redirect("/?newsletter=invalid");
  }

  const subscriber = result[0];

  if (subscriber.status === "active") {
    return c.redirect("/?newsletter=already-confirmed");
  }

  // Activate subscription
  await db
    .update(subscribers)
    .set({
      status: "active",
      confirmedAt: new Date(),
      confirmToken: null,
    })
    .where(eq(subscribers.id, subscriber.id));

  // Send welcome email
  const siteUrl = c.env.SITE_URL ?? "https://tmng.my.id";
  const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

  const emailTemplate = newsletterWelcomeEmail({
    firstName: subscriber.firstName ?? undefined,
    unsubscribeUrl,
  });

  await sendEmail(
    {
      to: subscriber.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    },
    c.env.MAIL_FROM,
    "TMNG Weekly Digest"
  );

  // Redirect to success page
  return c.redirect("/?newsletter=confirmed");
});

// ============================================================================
// POST /api/newsletter/unsubscribe - Unsubscribe
// ============================================================================
const unsubscribeSchema = z.object({
  email: z.string().email(),
});

newsletterRouter.post(
  "/unsubscribe",
  zValidator("json", unsubscribeSchema),
  async (c) => {
    const { email } = c.req.valid("json");
    const db = getDb(c.env.DATABASE_URL);

    await db
      .update(subscribers)
      .set({
        status: "unsubscribed",
        unsubscribedAt: new Date(),
      })
      .where(eq(subscribers.email, email.toLowerCase()));

    return c.json({
      success: true,
      message: "You have been unsubscribed.",
    });
  }
);

// GET version for email links
newsletterRouter.get("/unsubscribe", async (c) => {
  const email = c.req.query("email");

  if (!email) {
    return c.redirect("/?newsletter=error");
  }

  const db = getDb(c.env.DATABASE_URL);

  await db
    .update(subscribers)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    })
    .where(eq(subscribers.email, email.toLowerCase()));

  return c.redirect("/?newsletter=unsubscribed");
});
