import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This function runs for every request that matches the matcher below
export default withAuth(
  function middleware(req) {
    // Optional: custom logic before authentication check
    // For example, you could log the request or allow public routes
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/sign-in",  // 👈 must match your custom login page
    },
  }
);

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Protect all dashboard routes and any other private routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    // Add more protected paths as needed
  ],
};
