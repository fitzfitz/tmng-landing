# SPA Navigation with Astro View Transitions

The user wants "React Router-like" behavior where only the content updates. We will use Astro 5's `ClientRouter` (formerly View Transitions).

## Changes

### 1. Enable Transitions
#### [MODIFY] `src/layouts/base-layout.astro`
- Import: `import { ClientRouter } from 'astro:transitions';`
- Add: `<ClientRouter />` inside `<head>`.
- Add: `transition:animate="fade"` to the `<main>` element to define the default transition.

### 2. Handling State & Re-initialization
Since `ClientRouter` swaps HTML but doesn't do a full browser refresh, global scripts or `window.addEventListener('load')` might not trigger on subsequent navigations.
- **GSAP**: The `NetworkMesh` and `HolographicStack` components use `useGSAP` (React), which handles mounting/unmounting correctly via the React integration, so they should be safe.
- **Header Active State**: The header re-runs its logic because the component is re-rendered (unless we persist it).
- **Persistence**: We will add `transition:persist` to the `<Header />` so it doesn't re-render on every page load, keeping the navigation state instant.

## Verification
1.  Navigate between "Home" and "Blog".
2.  Verify the background mesh doesn't "flash" or restart abruptly if we persist the background (optional, but requested "premium feel").
3.  Check if `Header` active state updates (if persisted, we might need to hook into the router event to update the active class, OR let it re-render if it's fast enough. Let's try re-rendering first to ensure correctness, as persisting requires manual state updates).

> **Decision**: We will NOT persist the Header initially, to ensure the "Active Link" logic works OOTB. If it flickers, we will implement persistence with state update logic. We WILL persist the layout background if possible, but currently the background is in `global.css` or distinct components.

## Execution Order
1.  Modify `base-layout.astro`.
2.  Notify User.
