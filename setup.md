# TMNG - Project Setup & Generation Guide

This document outlines the steps to generate the **TMNG** project using the Astro framework.

## 🛠 Tech Stack
- **Framework**: [Astro](https://astro.build/) (v4.x)
- **UI Framework**: [React](https://react.dev/) (via `@astrojs/react`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via `@astrojs/tailwind`)
- **SEO**: `@astrojs/sitemap`
- **Adapter**: [Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) (via `@astrojs/cloudflare`)
- **Language**: TypeScript

## 🚀 Generation Steps

> **CLI Policy**: We utilize the **Astro CLI** for all project initialization and integrations to ensure best practices and automatic configuration. Manual file edits are reserved for TypeScript path aliases and architecture structure.

### 1. Initialize Project (CLI)
We use the Astro CLI to scaffold a minimal project structure.
```bash
# Initialize Astro in the current directory with the 'minimal' template
# --yes: Skip all prompts with default 'yes'
# --no-git: Skip git initialization (assuming repo exists)
# --install: Auto-install dependencies
# --template: minimal (clean slate)
npm create astro@latest . -- --template minimal --install --no-git --typescript strict --yes
```

### 2. Install Integrations
Add Tailwind CSS, React, Sitemap, and Cloudflare support.
```bash
# Add Tailwind CSS, React, Sitemap, and Cloudflare
# --yes: distinct from create-astro, this accepts the integration config
npx astro add tailwind react sitemap cloudflare --yes
```

### 3. Project Structure
We will use a **Feature-Based Architecture** to keep related code colocated and prevent "scattering". We also enforce **kebab-case** for all filenames.

#### Directory Breakdown
- **`src/components/ui/`**: Pure, effective, dumb components (Buttons, Inputs).
- **`src/features/`**: Domain-specific modules (Dashboard, Blog, Landing). Everything related to a feature goes here.
- **`src/pages/`**: File-based routing only. Pages should largely import from `features/`.

```
/
├── public/                 # Static assets (images, fonts, robots.txt)
├── src/
│   ├── components/         # Shared, agnostic UI Components
│   │   ├── ui/             # Atomic design elements
│   │   │   ├── button.astro
│   │   │   └── container.astro
│   │   ├── layout/         # Global layout components
│   │   │   ├── header.astro
│   │   │   └── footer.astro
│   │   └── seo/            # SEO-related components
│   │       └── meta-tags.astro
│   ├── features/           # 📦 FEATURES: Add new modules here
│   │   ├── landing/        # Landing Page specific
│   │   │   ├── hero.astro
│   │   │   └── services-grid.astro
│   │   ├── dashboard/      # Dashboard feature
│   │   │   ├── stats-card.astro
│   │   │   └── user-profile.tsx
│   │   ├── blog/           # Blog feature
│   │   │   ├── post-card.astro
│   │   │   └── types.ts
│   │   └── contact/        # Contact feature
│   │       └── contact-form.tsx
│   ├── layouts/            # Page Scaffolding
│   │   └── base-layout.astro
│   ├── lib/                # Utilities
│   │   └── utils.ts
│   ├── pages/              # Routing (Maps to URLs)
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── dashboard/
│   │   │   └── index.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/             # Global styles
│       └── global.css
├── astro.config.mjs
└── package.json
```

### 4. TypeScript Configuration
We use **Strict Mode** and **Path Aliases** to maintain code quality and clean imports.

**`tsconfig.json`**:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"],
      "@lib/*": ["src/lib/*"],
      "@layouts/*": ["src/layouts/*"]
    }
  }
}
```

### 4. Implementation Details
The legacy React components will be ported to Astro components:
- **Layout.astro**: functionality of `App.tsx` (html/body wrapper).
- **index.astro**: Main landing page assembly.
- **Components**: Converted to static HTML/CSS within `.astro` files for zero-JavaScript output.
