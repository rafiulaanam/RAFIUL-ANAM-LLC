import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

interface CustomToken extends JWT {
  isVerified?: boolean;
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request }) as CustomToken | null;
  
  // Define page types
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                    request.nextUrl.pathname.startsWith("/register");
  const isVerifyPage = request.nextUrl.pathname.startsWith("/verify-pending");
  const isVerifyEmailPage = request.nextUrl.pathname.startsWith("/verify-email");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isProfilePage = request.nextUrl.pathname.startsWith("/profile");

  // Handle verify-email page separately
  if (isVerifyEmailPage) {
    const hasToken = request.nextUrl.searchParams.has("token");
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // If user is verified, redirect away from auth and verify pages
  if (token?.isVerified) {
    if (isAuthPage || isVerifyPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If user is logged in but not verified
  if (token && !token.isVerified) {
    // Allow them to stay on verify-pending
    if (isVerifyPage) {
      return NextResponse.next();
    }
    
    // Redirect to verify-pending from protected pages
    if (isDashboardPage || isProfilePage) {
      return NextResponse.redirect(new URL("/verify-pending", request.url));
    }

    // Allow access to auth pages
    if (isAuthPage) {
      return NextResponse.next();
    }
  }

  // If no token (not logged in)
  if (!token) {
    // Allow access to auth pages and verify-pending
    if (isAuthPage || isVerifyPage) {
      return NextResponse.next();
    }
    
    // Redirect to login for protected pages
    if (isDashboardPage || isProfilePage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/verify-pending",
    "/verify-email",
    "/login",
    "/register",
  ],
};
