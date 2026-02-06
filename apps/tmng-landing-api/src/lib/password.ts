import { hash, compare } from 'bcryptjs';

export const Password = {
  /**
   * Hash a plain text password
   * @param plain The plain text password
   * @returns Hashed password string
   */
  async hash(plain: string): Promise<string> {
    // Salt rounds: 10 is standard balance for security/performance
    return hash(plain, 10);
  },

  /**
   * Verify a password against a hash
   * @param plain The plain text password
   * @param hashed The hashed password from DB
   * @returns True if matches
   */
  async verify(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
};
