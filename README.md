# TMNG - Precision Digital Solutions

![Status](https://img.shields.io/badge/Status-Production-emerald?style=for-the-badge)
![Tech](https://img.shields.io/badge/Astro-5.0-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tailwind-4.0-blue?style=for-the-badge)
![Tech](https://img.shields.io/badge/React-19-cyan?style=for-the-badge)

A premium, high-performance digital agency landing page built with modern web technologies. Focuses on "Glassmorphism" aesthetics, interactive 3D elements, and seamless SPA navigation.

## ✨ Features

- **Premium Design System**: Custom "Editorial Glass" aesthetic with prisms, neon blooms, and fluid gradients.
- **Interactive 3D**:
    - **Holographic Stack**: Interactive server-layer visualization using GSAP 3D transforms.
    - **Network Mesh**: Dynamic background constellation effect.
- **Universal Navigation**: Fully SPA-like experience using Astro 5 `ClientRouter` (View Transitions).
- **Hybrid Blog Layout**:
    - **Dark Hero**: Cinematic featured content.
    - **Light Reading Mode**: Sidebar-enabled, typography-optimized article consumption.
- **Animations**:
    - Entrance reveals.
    - Magnetic buttons.
    - Parallax backgrounds.

## 🛠️ Tech Stack

- **Framework**: [Astro 5](https://astro.build) (Static + Islands)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com) (Vite-native)
- **Interactions**: [GSAP](https://gsap.com) + `@gsap/react`
- **UI Architecture**: React 19 (Islands)
- **Typography**: Inter (Google Fonts)

## 🚀 Getting Started

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally                       |

## 📂 Project Structure

```text
/
├── public/                 # Static assets (images, fonts)
│   ├── images/
│   │   ├── projects/       # Portfolio assets
│   │   └── blog/           # Editorial assets
├── src/
│   ├── components/
│   │   ├── effects/        # GSAP/Canvas animations (NetworkMesh, HolographicStack)
│   │   ├── layout/         # Header, Footer
│   │   └── ui/             # Design System primitives (Card, Button, Typography)
│   ├── features/
│   │   ├── landing/        # Landing page sections
│   │   └── blog/           # Blog specific components
│   ├── layouts/            # Global layouts (BaseLayout)
│   ├── pages/              # File-based routing
│   │   ├── blog/           # Blog index & posts
│   │   └── index.astro     # Homepage
│   └── styles/             # Global CSS & Tailwind config
└── package.json
```

## 🎨 Design Tokens

The project uses a custom set of Tailwind utilities for the glass effect:

- `.glass-panel`: Standard translucent navigational elements.
- `.glass-card`: Interactive, frosted cards for content.
- `.glass-card-strong`: Heavy frosting for featured items.
- `.fluid-bg`: Animated mesh gradients.

---

© 2026 TMNG. Built for the future.
