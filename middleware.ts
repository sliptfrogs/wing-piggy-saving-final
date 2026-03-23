// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;


    if (token && (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")) {
      console.log("Redirecting authenticated user from", pathname, "to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        console.log("Authorized check for:", pathname, "Token:", !!token);

        // Allow public auth pages without token
        if (pathname === "/auth/sign-in" || pathname === "/auth/sign-up") {
          return true;
        }

        // All other routes require token
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/sign-in",
    },
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
