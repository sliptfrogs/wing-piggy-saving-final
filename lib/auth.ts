import { AuthToken } from "@/app/types/auth-token";
import NextAuth, { Session, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 🔹 Custom user type
interface AuthUser {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  roles: string[];
  accessTokenExpires: number; // milliseconds timestamp
}

// 🔹 Refresh token function
async function refreshAccessToken(token: AuthToken) {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const data = await res.json();

    if (!res.ok || data.status !== "SUCCESS") throw new Error("Refresh failed");

    return {
      ...token,
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token ?? token.refreshToken,
      roles: data.data.role,
      accessTokenExpires: Date.now() + data.data.access_token_expires_in * 1000,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing credentials");

        const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const response = await res.json();

        if (!res.ok || response.status !== "SUCCESS")
          throw new Error(response.message || "Login failed");

        const user = response.data;

        const authUser: AuthUser = {
          id: user.user_id,
          email: user.email,
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          tokenType: user.token_type,
          roles: user.role,
          accessTokenExpires: Date.now() + user.access_token_expires_in * 1000,
        };

        return authUser;
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }): Promise<AuthToken> {
      // First login: user exists
      if (user) {
        const authUser = user as AuthToken; // cast to AuthToken
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

      // Token still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token as AuthToken;
      }

      // Token expired → refresh
      return await refreshAccessToken(token as AuthToken);
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
