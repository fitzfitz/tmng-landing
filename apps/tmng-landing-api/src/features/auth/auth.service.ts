import { HTTPException } from 'hono/http-exception';
import { users } from '@tmng/shared';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../utils/env';
import { Password } from '../../lib/password';

export const AuthService = {
  async validateUser(data: { email: string; password: string }) {
    // Create a local client to avoid "Cannot perform I/O on behalf of a different request" error
    // mirroring the fix in posts.service.ts
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const localDb = drizzle(client);

    // 1. Find user by email
    console.log('AuthService: Finding user by email', data.email);
    // Note: Drizzle select returns array. limit(1) for efficiency.
    const [user] = await localDb
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    
    console.log('AuthService: DB Query Complete. User found:', !!user);

    if (!user) {
        // Generic error for security
        throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // 2. Verify password if password hash exists
    if (!user.password) {
        console.log('AuthService: User has no password');
        // User has no password (maybe Oauth only? or incomplete)
        throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    console.log('AuthService: Verifying password hash...');
    const isValid = await Password.verify(data.password, user.password);
    console.log('AuthService: Password valid:', isValid);

    if (!isValid) {
        throw new HTTPException(401, { message: 'Invalid credentials' });
    }

    // 3. Return user (excluding password)
    // Destructuring to separate password
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async getUserById(id: string) {
    const client = postgres(env.DATABASE_URL!, { prepare: false });
    const localDb = drizzle(client);

    const [user] = await localDb
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
};
