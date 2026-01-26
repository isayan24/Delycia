import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to get session from cookies
function getSessionFromCookies(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }

    // Validate required fields
    if (!sessionData._id || !sessionData.accessToken) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Failed to parse session cookie:', error);
    return null;
  }
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = getSessionFromCookies(request);
  const url = request.nextUrl; 

  // Admin route protection
  if (url.pathname.startsWith("/admin")) {
    if (session?.role === 1 && url.pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/orders", request.url));
    }
    // Allow access to login page regardless of auth status
    if (url.pathname === "/admin/login") {
      // If already logged in as admin, redirect to admin dashboard
      if (session?.role === 1) {
        return NextResponse.redirect(new URL("/admin/orders", request.url));
      } 
      return NextResponse.next();
    }
    
    // For all other admin routes, check authentication
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    // Check if user has admin privileges
    const isAdmin = session.role === 1;
    
    if (!isAdmin) {
      // If user is logged in but not an admin, redirect to user page with error message
      const userRedirectUrl = new URL("/user/p", request.url);
      userRedirectUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(userRedirectUrl);
    }
  }

  // If user is logged in and tries to access sign-in, sign-up, or verify pages
  if (
    session &&
    (url.pathname.startsWith("/user/sign-in") ||
      url.pathname.startsWith("/user/sign-up") ||
      url.pathname.startsWith("/user/verify") || url.pathname.startsWith("/user/loginlocalhostxlpow"))
  ) {
    return NextResponse.redirect(new URL("/user/p", request.url));
  }
  
  // If user is logged in and accesses /user, redirect to /user/p
  if (session && url.pathname === "/user") {
    return NextResponse.redirect(new URL("/user/p", request.url));
  } 
  // If user is not logged in and tries to access protected routes
  if (!session && (url.pathname === "/user" || url.pathname.startsWith("/user/p") || url.pathname.startsWith("/dashboard"))) {
    return NextResponse.redirect(new URL("/user/sign-in", request.url));
  }
  
  // Allow the request to proceed normally
  return NextResponse.next();
}

// config is kahan kahan pe middleware run kare
export const config = {
  // dashboard:path* -> any path starting with dashboard
  matcher: [ 
    "/user/:path*", 
    "/admin/:path*",
  ],
};
