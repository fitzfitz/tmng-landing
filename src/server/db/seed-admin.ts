
import { createAuth } from "../auth";

const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
};

if (!env.DATABASE_URL) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const auth = createAuth(env);

async function createAdmin() {
  const email = "admin@tmng.my.id";
  const password = "password123";
  const name = "Admin User";

  console.log(`Creating admin user: ${email}...`);

  try {
    // Clean up existing user if any (to ensure we can set the password)
    const postgres = (await import("postgres")).default;
    const sql = postgres(env.DATABASE_URL);
    
    await sql`DELETE FROM users WHERE email = ${email}`;
    // Also delete from accounts to avoid conflicts if they had oauth
    // Since cascading delete should handle it if set up right, but to be sure:
    // Actually delete from users should be enough if FKs are cascade.
    // But let's verify cleanup.
    console.log("Deleted existing user (if any)");

    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    console.log("✅ Admin user created successfully!");
    
    // Use raw SQL to update role to admin since signUp defaults to pending (via database default, not hook in this context unless hook is also active)
    
    await sql`UPDATE users SET role = 'admin' WHERE email = ${email}`;
    await sql.end();
    
    console.log("✅ User promoted to admin role");
    console.log(`👉 Login with: ${email} / ${password}`);

  } catch (error) {
    console.error("❌ Error creating admin:");
    console.dir(error, { depth: null });
  }
}

createAdmin();
