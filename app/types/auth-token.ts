import { JWT } from 'next-auth/jwt';

// types for JWT token in NextAuth
export interface AuthToken extends JWT {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  roles: string[];
  accessTokenExpires: number; // timestamp in milliseconds
  error?: string;
}
