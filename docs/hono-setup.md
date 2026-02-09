# ARCHITECTURAL BLUEPRINT: HONO.JS ENTERPRISE STACK

**Version:** 1.0.0  
**Status:** Approved  
**Pattern:** Feature-Driven Layered Architecture

---

## 01. SYSTEM HIERARCHY (DIRECTORY STRUCTURE)

The application follows a modular domain-driven design to ensure linear scalability and isolation of concerns.

```text
/src
├── /features           # Domain-specific modules
│   └── /<feature>
│       ├── [name].index.ts    # Sub-router & entry point
│       ├── [name].handlers.ts # Controller logic (HTTP layer)
│       ├── [name].schema.ts   # Zod validation & Type definitions
│       └── [name].service.ts  # Business logic & Data access
├── /lib                # Infrastructure singletons (Prisma, Redis)
├── /middlewares        # Cross-cutting concerns (Auth, Rate-limiting)
├── /utils              # Shared utilities (Env, Formatters)
├── index.ts            # Application composition root
└── client.ts           # Hono RPC type exports
```

---

## 02. TECHNICAL SPECIFICATIONS

### SPEC-001: ENVIRONMENT INTEGRITY

The system must implement a "Fail-Fast" protocol. Validation occurs at runtime initialization via Zod.

```typescript
// src/utils/env.ts
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
```

### SPEC-002: ROUTE FACTORY PATTERN

To maintain strict type safety across decoupled files, all handlers must be instantiated via `createFactory`.

```typescript
// src/features/auth/auth.handlers.ts
import { createFactory } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { loginSchema } from "./auth.schema";

const factory = createFactory();

export const loginHandler = factory.createHandlers(
  zValidator("json", loginSchema),
  async (c) => {
    const { email } = c.req.valid("json");
    return c.json({ message: `Welcome ${email}` });
  },
);
```

### SPEC-003: UNIFIED ERROR RESPONSE

All exceptions must be intercepted and transformed into a standardized JSON payload.

```typescript
app.onError((err, c) => {
  console.error(`[SYSTEM_ERROR]: ${err.stack}`);
  return c.json(
    {
      success: false,
      message: err.message || "Internal Server Error",
    },
    500,
  );
});
```

---

## 03. REFERENCE IMPLEMENTATION (AUTH MODULE)

### A. DATA CONTRACT (Schema)

```typescript
import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### B. LOGIC LAYER (Service)

```typescript
export const AuthService = {
  async validateUser(data: any) {
    return { id: "1", email: data.email };
  },
};
```

### C. ROUTING LAYER (Index)

```typescript
import { Hono } from "hono";
import { loginHandler } from "./auth.handlers";

const authApp = new Hono().post("/login", ...loginHandler);
export default authApp;
```

---

## 04. COMPOSITION ROOT (Entry Point)

```typescript
import { Hono } from "hono";
import authApp from "./features/auth/auth.index";

const app = new Hono().basePath("/api").route("/auth", authApp);

export type AppType = typeof app;
export default app;
```
