import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isVendorRoute = req.nextUrl.pathname.startsWith("/vendor");

    // Check if user is trying to access vendor routes
    if (isVendorRoute) {
      if (!token?.role || token.role !== "VENDOR") {
        // Redirect non-vendors to home page
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Ensure user is authenticated
    },
  }
);

// Protect all vendor routes
export const config = {
  matcher: [
    "/vendor/:path*", // Protect all routes under /vendor
  ],
}; 