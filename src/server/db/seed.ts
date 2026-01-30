/**
 * Database seed script
 * Run with: npx tsx src/server/db/seed.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ============================================================================
  // Authors
  // ============================================================================
  console.log("👤 Creating authors...");
  const [author1, author2, author3] = await db
    .insert(schema.authors)
    .values([
      {
        name: "Alex Chen",
        email: "alex@tmng.my.id",
        slug: "alex-chen",
        avatarUrl: "/images/avatars/alex.jpg",
        bio: "Lead Engineer at TMNG. Passionate about web performance and developer experience. Building the future of digital architecture.",
        role: "Lead Engineer",
        socialLinks: {
          twitter: "https://twitter.com/alexchen",
          github: "https://github.com/alexchen",
          linkedin: "https://linkedin.com/in/alexchen",
        },
      },
      {
        name: "Sarah Miller",
        email: "sarah@tmng.my.id",
        slug: "sarah-miller",
        avatarUrl: "/images/avatars/sarah.jpg",
        bio: "Design Systems Architect specializing in accessible, scalable component libraries. Former Google designer.",
        role: "Design Lead",
        socialLinks: {
          twitter: "https://twitter.com/sarahmiller",
          website: "https://sarahmiller.design",
        },
      },
      {
        name: "James Wilson",
        email: "james@tmng.my.id",
        slug: "james-wilson",
        avatarUrl: "/images/avatars/james.jpg",
        bio: "Full-stack engineer focused on performance optimization and Core Web Vitals. Web Performance advocate.",
        role: "Senior Engineer",
        socialLinks: {
          github: "https://github.com/jameswilson",
          linkedin: "https://linkedin.com/in/jameswilson",
        },
      },
    ])
    .returning();

  console.log(`   ✓ Created ${3} authors`);

  // ============================================================================
  // Categories
  // ============================================================================
  console.log("📁 Creating categories...");
  const [catTech, catDesign, catEngineering, catStrategy, catAI] = await db
    .insert(schema.categories)
    .values([
      {
        name: "Technology",
        slug: "technology",
        description: "Latest trends in web technology, frameworks, and tools",
        color: "#8B5CF6",
        sortOrder: 1,
      },
      {
        name: "Design",
        slug: "design",
        description: "UI/UX design principles, design systems, and visual trends",
        color: "#EC4899",
        sortOrder: 2,
      },
      {
        name: "Engineering",
        slug: "engineering",
        description: "Deep dives into software engineering best practices",
        color: "#3B82F6",
        sortOrder: 3,
      },
      {
        name: "Strategy",
        slug: "strategy",
        description: "Digital strategy, product thinking, and business insights",
        color: "#10B981",
        sortOrder: 4,
      },
      {
        name: "AI Research",
        slug: "ai-research",
        description: "Artificial intelligence, machine learning, and automation",
        color: "#F59E0B",
        sortOrder: 5,
      },
    ])
    .returning();

  console.log(`   ✓ Created ${5} categories`);

  // ============================================================================
  // Tags
  // ============================================================================
  console.log("🏷️  Creating tags...");
  const tags = await db
    .insert(schema.tags)
    .values([
      { name: "Astro", slug: "astro" },
      { name: "React", slug: "react" },
      { name: "TypeScript", slug: "typescript" },
      { name: "Performance", slug: "performance" },
      { name: "CSS", slug: "css" },
      { name: "Web Vitals", slug: "web-vitals" },
      { name: "SEO", slug: "seo" },
      { name: "API Design", slug: "api-design" },
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Accessibility", slug: "accessibility" },
      { name: "Cloudflare", slug: "cloudflare" },
      { name: "Edge Computing", slug: "edge-computing" },
    ])
    .returning();

  console.log(`   ✓ Created ${tags.length} tags`);

  // ============================================================================
  // Posts
  // ============================================================================
  console.log("📝 Creating posts...");

  const [post1] = await db
    .insert(schema.posts)
    .values({
      authorId: author1.id,
      title: "The Future of Digital Architecture",
      slug: "future-of-digital-architecture",
      excerpt:
        "Exploring how modern frameworks like Astro are reshaping the web landscape with island architecture and zero-js baselines.",
      content: `
# The Future of Digital Architecture

The web is evolving. For years, we've been locked in a battle between developer experience and user experience. Single-page applications gave us powerful tools but at the cost of performance. Static sites gave us speed but limited interactivity.

## Enter Island Architecture

Astro pioneered the concept of "island architecture" - a paradigm where most of your page is static HTML, with interactive components (islands) hydrating only when needed.

\`\`\`astro
---
import Header from '../components/Header.astro';
import Counter from '../components/Counter.tsx';
---

<Header />

<!-- This component hydrates on visible -->
<Counter client:visible />
\`\`\`

## Zero JavaScript by Default

The most radical proposition of modern frameworks is shipping zero JavaScript by default. Your marketing pages don't need React. Your blog doesn't need a virtual DOM.

### Performance Benefits

| Metric | SPA | Astro |
|--------|-----|-------|
| First Contentful Paint | 2.4s | 0.8s |
| Time to Interactive | 4.2s | 1.2s |
| JavaScript Size | 180kb | 12kb |

## The Cloudflare Edge

With Cloudflare Workers and Pages, your Astro site runs at the edge - in 300+ data centers worldwide. Combined with D1 for data and R2 for assets, you have a complete full-stack platform.

## Conclusion

The future of web development isn't about choosing between static and dynamic - it's about using the right tool for each component. Island architecture lets us have both.

---

*What do you think about island architecture? Share your thoughts in the comments below.*
      `.trim(),
      coverImage: "/images/blog/tech-future.png",
      status: "published",
      isFeatured: true,
      readTimeMinutes: 8,
      seoTitle: "The Future of Digital Architecture | Island Architecture Explained",
      seoDescription:
        "Learn how Astro's island architecture is changing web development with zero-JS baselines and selective hydration.",
      publishedAt: new Date("2026-01-24"),
    })
    .returning();

  const [post2] = await db
    .insert(schema.posts)
    .values({
      authorId: author2.id,
      title: "Designing for Clarity",
      slug: "designing-for-clarity",
      excerpt:
        "Why minimal design systems often outperform complex interfaces in conversion and user retention metrics.",
      content: `
# Designing for Clarity

In a world of feature bloat and dashboard complexity, clarity has become the ultimate competitive advantage. Users don't want more options—they want the right options presented at the right time.

## The Clarity Principle

Great design isn't about adding features until something is complete. It's about removing elements until something is perfect.

### Case Study: Stripe Dashboard

Stripe's dashboard is a masterclass in clarity:
- Single-column focus areas
- Progressive disclosure of complexity
- Consistent visual hierarchy
- Meaningful empty states

## Building a Clear Design System

### 1. Define Your Token System

\`\`\`css
:root {
  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  
  /* Type scale */
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
}
\`\`\`

### 2. Limit Your Color Palette

More colors means more confusion. A focused palette drives better decisions:

- **Primary**: Brand action color
- **Neutral**: Text and borders
- **Success/Error**: Feedback states
- **That's it.**

### 3. Embrace White Space

White space isn't empty space—it's breathing room. It creates visual hierarchy without adding visual noise.

## Measuring Clarity

Track these metrics to measure design clarity:

1. **Task Completion Rate**: Can users finish core tasks?
2. **Time on Task**: How long does it take?
3. **Error Rate**: How often do users make mistakes?
4. **Support Tickets**: Are users confused?

## Conclusion

Clarity is a feature. It's not about dumbing down your interface—it's about respecting your user's cognitive load and guiding them toward success.

---

*How do you balance features with clarity in your products?*
      `.trim(),
      coverImage: "/images/blog/design-clarity.png",
      status: "published",
      isFeatured: false,
      readTimeMinutes: 5,
      seoTitle: "Designing for Clarity: Why Minimal Design Systems Win",
      seoDescription:
        "Learn why minimal design systems outperform complex interfaces and how to build for clarity.",
      publishedAt: new Date("2026-01-18"),
    })
    .returning();

  const [post3] = await db
    .insert(schema.posts)
    .values({
      authorId: author3.id,
      title: "Performance First",
      slug: "performance-first",
      excerpt:
        "A deep dive into Core Web Vitals and why shaving milliseconds off your load time matters for SEO.",
      content: `
# Performance First: Core Web Vitals Deep Dive

Google's Core Web Vitals aren't just metrics—they're a ranking factor. In 2026, performance isn't optional; it's essential for visibility.

## The Three Vitals

### 1. Largest Contentful Paint (LCP)

LCP measures when the largest content element becomes visible. Target: **< 2.5 seconds**.

**Optimization Strategies:**
- Preload critical images
- Use next-gen formats (WebP, AVIF)
- Implement lazy loading for below-fold content
- Use a CDN (Cloudflare is free!)

### 2. Interaction to Next Paint (INP)

INP replaced FID in 2024. It measures responsiveness across ALL interactions, not just the first.

\`\`\`javascript
// Bad: Blocking the main thread
button.onclick = () => {
  heavyComputation(); // 200ms
  updateUI();
};

// Good: Yield to the browser
button.onclick = async () => {
  await scheduler.yield();
  heavyComputation();
  await scheduler.yield();
  updateUI();
};
\`\`\`

### 3. Cumulative Layout Shift (CLS)

CLS measures visual stability. Target: **< 0.1**.

**Common Culprits:**
- Images without dimensions
- Ads and embeds
- Web fonts causing FOUT
- Dynamic content injection

## Real-World Impact

| LCP | Conversion Rate |
|-----|-----------------|
| 1s  | 5.2% |
| 2s  | 4.1% |
| 3s  | 2.8% |
| 5s  | 1.1% |

Every second matters.

## Tools for Measurement

1. **Chrome DevTools** - Lighthouse panel
2. **PageSpeed Insights** - Field + lab data
3. **WebPageTest** - Filmstrip analysis
4. **CrUX Dashboard** - 28-day rolling average

## Edge Computing Advantage

With Astro on Cloudflare, your HTML generates at the edge:

\`\`\`
User in Sydney → Cloudflare Sydney edge → Response in 20ms
User in London → Cloudflare London edge → Response in 20ms
\`\`\`

No origin round-trip. Just pure speed.

## Conclusion

Performance is UX. Performance is SEO. Performance is revenue. Make it your first priority, not an afterthought.
      `.trim(),
      coverImage: "/images/blog/performance-speed.png",
      status: "published",
      isFeatured: false,
      readTimeMinutes: 6,
      seoTitle: "Core Web Vitals Guide: LCP, INP, CLS Optimization",
      seoDescription:
        "Master Core Web Vitals with this comprehensive guide to LCP, INP, and CLS optimization for better SEO.",
      publishedAt: new Date("2026-01-10"),
    })
    .returning();

  const [post4] = await db
    .insert(schema.posts)
    .values({
      authorId: author1.id,
      title: "The API Economy",
      slug: "api-economy",
      excerpt:
        "How composable architecture is enabling faster shipping cycles for enterprise teams.",
      content: `
# The API Economy: Composable Architecture at Scale

The monolith is dead. Long live composable architecture.

## What is Composable Architecture?

Instead of building everything yourself, you compose your application from best-in-class services:

- **Auth**: Clerk, Auth0, Keycloak
- **Payments**: Stripe, Paddle
- **CMS**: Sanity, Contentful
- **Email**: Resend, Postmark
- **Search**: Algolia, Meilisearch
- **Analytics**: Plausible, PostHog

## The Benefits

### 1. Faster Time to Market

Why spend 3 months building auth when Clerk takes 3 hours?

### 2. Best-in-Class Everything

Each service is maintained by specialists. Your auth is built by auth experts. Your search by search experts.

### 3. Scale Independently

Your auth scales separately from your database. No single bottleneck.

## Implementing Composable Architecture

\`\`\`typescript
// Modern stack with Hono
import { Hono } from 'hono';
import { clerk } from '@clerk/hono';
import Stripe from 'stripe';

const app = new Hono();

// Auth handled by Clerk
app.use('/*', clerk());

// Payments handled by Stripe
app.post('/checkout', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_KEY);
  const session = await stripe.checkout.sessions.create({...});
  return c.json({ url: session.url });
});
\`\`\`

## The Cost Equation

| Approach | Dev Time | Maintenance | Total Cost/Year |
|----------|----------|-------------|-----------------|
| Build Everything | 6 months | $120k/year | $180k |
| Composable | 2 months | $24k/year | $84k |

Composable wins. Every time.

## Conclusion

The best code is the code you don't write. Leverage the API economy to ship faster and focus on what makes your product unique.
      `.trim(),
      coverImage: "/images/projects/fintech.png",
      status: "published",
      isFeatured: false,
      readTimeMinutes: 4,
      seoTitle: "The API Economy: Building with Composable Architecture",
      seoDescription:
        "Learn how composable architecture and best-in-class APIs help enterprise teams ship faster.",
      publishedAt: new Date("2025-12-12"),
    })
    .returning();

  const [post5] = await db
    .insert(schema.posts)
    .values({
      authorId: author2.id,
      title: "AI in Prototyping",
      slug: "ai-prototyping",
      excerpt:
        "Using generative models to accelerate the wireframing phase of product development.",
      content: `
# AI in Prototyping: Accelerating the Design Phase

The design process is being transformed by AI. What once took days now takes hours.

## The AI Design Stack

### 1. Text to Wireframe

Tools like Galileo AI and Uizard can generate wireframes from text descriptions:

> "Create a dashboard for a SaaS analytics product with a sidebar, charts, and a data table"

Result: A complete wireframe in 30 seconds.

### 2. Image to Code

Screenshot a design and get production-ready code:

- **v0.dev** - Vercel's AI UI generator
- **Locofy** - Figma to React/Vue
- **Builder.io** - Design to code pipeline

### 3. AI Design Critique

Upload your design and get instant feedback:

- Accessibility issues
- Visual hierarchy problems
- Spacing inconsistencies
- Color contrast violations

## Real Workflow Integration

\`\`\`
1. Stakeholder meeting (30 min)
2. AI wireframe generation (5 min)
3. Human refinement (2 hours)
4. AI-to-code conversion (10 min)
5. Developer polish (4 hours)

Total: 7 hours (vs. 40 hours traditional)
\`\`\`

## The Human Element

AI doesn't replace designers—it amplifies them:

- **AI handles**: Repetitive layout work, code translation, accessibility checks
- **Humans handle**: Strategy, creativity, user empathy, edge cases

## Ethical Considerations

As we adopt AI tools, we must consider:

1. **Attribution**: Whose work trained the model?
2. **Bias**: Do generated designs represent diverse users?
3. **Over-reliance**: Are we losing design skills?

## Conclusion

AI is the most powerful design tool since Figma. Use it to accelerate the boring parts so you can focus on the creative ones.

---

*Are you using AI in your design process? Share your favorite tools!*
      `.trim(),
      coverImage: "/images/projects/ai-nexus.png",
      status: "published",
      isFeatured: false,
      readTimeMinutes: 7,
      seoTitle: "AI in Prototyping: Generative Design Tools for Product Teams",
      seoDescription:
        "Discover how AI tools like v0, Galileo, and Uizard are transforming the prototyping phase.",
      publishedAt: new Date("2025-11-28"),
    })
    .returning();

  console.log(`   ✓ Created ${5} posts`);

  // ============================================================================
  // Post Categories (Junction Table)
  // ============================================================================
  console.log("🔗 Linking posts to categories...");
  await db.insert(schema.postCategories).values([
    { postId: post1.id, categoryId: catTech.id },
    { postId: post2.id, categoryId: catDesign.id },
    { postId: post3.id, categoryId: catEngineering.id },
    { postId: post4.id, categoryId: catStrategy.id },
    { postId: post5.id, categoryId: catAI.id },
    { postId: post5.id, categoryId: catDesign.id }, // Multi-category
  ]);
  console.log(`   ✓ Linked posts to categories`);

  // ============================================================================
  // Post Tags (Junction Table)
  // ============================================================================
  console.log("🔗 Linking posts to tags...");
  const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t.id]));

  await db.insert(schema.postTags).values([
    { postId: post1.id, tagId: tagMap["astro"] },
    { postId: post1.id, tagId: tagMap["cloudflare"] },
    { postId: post1.id, tagId: tagMap["edge-computing"] },
    { postId: post2.id, tagId: tagMap["ui-ux"] },
    { postId: post2.id, tagId: tagMap["css"] },
    { postId: post3.id, tagId: tagMap["performance"] },
    { postId: post3.id, tagId: tagMap["web-vitals"] },
    { postId: post3.id, tagId: tagMap["seo"] },
    { postId: post4.id, tagId: tagMap["api-design"] },
    { postId: post4.id, tagId: tagMap["typescript"] },
    { postId: post5.id, tagId: tagMap["ui-ux"] },
  ]);
  console.log(`   ✓ Linked posts to tags`);

  // ============================================================================
  // Sample Subscriber
  // ============================================================================
  console.log("📧 Creating sample subscriber...");
  await db.insert(schema.subscribers).values({
    email: "demo@example.com",
    firstName: "Demo",
    status: "active",
    source: "seed",
    confirmedAt: new Date(),
  });
  console.log(`   ✓ Created sample subscriber`);

  console.log("\n✅ Seeding complete!");

  await sql.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
