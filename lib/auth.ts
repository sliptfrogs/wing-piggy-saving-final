// lib/auth.ts
import { AuthToken } from '@/app/types/auth-token';
import NextAuth, { Session, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// 🔹 Refresh token function
async function refreshAccessToken(token: AuthToken) {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Refresh token response error:', data);
      throw new Error(data.message || 'Refresh failed');
    }

    // Extract new tokens from the response
    const newData = data.data;
    return {
      ...token,
      accessToken: newData.access_token,
      refreshToken: newData.refresh_token ?? token.refreshToken,
      roles: newData.role,
      accessTokenExpires:
        Date.now() + (newData.access_token_expires_in ?? 0) * 1000,
      error: undefined, // clear any previous error
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    // Return the token with an error flag – will trigger sign out
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error('Missing credentials');

        const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const response = await res.json();

        if (!res.ok || response.status !== 'SUCCESS')
          throw new Error(response.message || 'Login failed');

        const user = response.data;

        return {
          id: user.user_id,
          email: user.email,
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          tokenType: user.token_type,
          roles: user.role,
          accessTokenExpires: Date.now() + user.access_token_expires_in * 1000,
        };
      },
    }),
    CredentialsProvider({
      id: 'otp',
      name: 'OTP',
      credentials: {
        email: { label: 'Email', type: 'text' },
        otpCode: { label: 'OTP Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otpCode)
          throw new Error('Missing email or OTP code');

        const res = await fetch(`${process.env.API_BASE_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            otpCode: credentials.otpCode,
          }),
        });

        const response = await res.json();

        if (!res.ok || response.status !== 'SUCCESS')
          throw new Error(response.message || 'OTP verification failed');

        const user = response.data;

        return {
          id: user.user_id,
          email: user.email,
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          tokenType: user.token_type,
          roles: user.role,
          accessTokenExpires: Date.now() + user.access_token_expires_in * 1000,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/sign-in' },

  callbacks: {
    async jwt({ token, user }): Promise<AuthToken> {
      if (user) {
        // Initial sign in
        const authUser = user as AuthToken;
        return {
          ...token,
          id: authUser.id,
          email: authUser.email,
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          roles: authUser.roles,
          accessTokenExpires: authUser.accessTokenExpires,
        };
      }

      // ✅ Proactive refresh: refresh if token expires within the next 1 minute
      const expiry = token.accessTokenExpires as number;
      const now = Date.now();
      const refreshThreshold = 60 * 1000; // 1 minute

      if (expiry && now + refreshThreshold >= expiry) {
        // Token is about to expire – refresh it
        return await refreshAccessToken(token as AuthToken);
      }

      // Otherwise, return the token as is
      return token as AuthToken;
    },

    async session({ session, token }): Promise<Session> {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        roles: token.roles as string[],
      };
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
