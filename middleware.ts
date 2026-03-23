// middleware.ts
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    console.log("Token from getToken:", token); // debug

    if (
      token &&
      (pathname === "/auth/sign-in" ||
        pathname === "/auth/sign-up" ||
        pathname === "/auth/otp")
    ) {
      console.log(
        "Redirecting authenticated user from",
        pathname,
        "to /dashboard",
      );
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        console.log("Authorized check for:", pathname, "Token:", !!token);
        // Allow public pages without token
        if (
          pathname === "/auth/sign-in" ||
          pathname === "/auth/sign-up" ||
          pathname === "/auth/otp" // ✅ added
        ) {
          return true;
        }
        // All other routes require a token
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/sign-in",
    },
  },
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
