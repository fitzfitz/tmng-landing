/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import("./server/db/schema").User | null;
    session: import("./server/db/schema").Session | null;
    runtime: {
      env: {
        DATABASE_URL: string;
        MAIL_FROM: string;
        MAIL_TO: string;
        SITE_URL: string;
        BETTER_AUTH_SECRET: string;
        BETTER_AUTH_URL: string;
      };
    };
  }
}
