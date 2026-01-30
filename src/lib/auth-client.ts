/**
 * Better Auth client for frontend
 * Used in React components for authentication
 */

import { createAuthClient } from "better-auth/react";

// Create the auth client
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" 
    ? window.location.origin
    : "http://localhost:4321",
  basePath: "/api/auth",
  auth: {
    persistSession: true,
  }
});

// Export hooks for use in components
export const {
  signIn,
  signOut,
  useSession,
} = authClient;

// Google sign-in helper
export async function signInWithGoogle() {
  return signIn.social({
    provider: "google",
    callbackURL: "/admin",
  });
}

// Sign out helper
export async function handleSignOut() {
  return signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/admin/login";
      },
    },
  });
}
