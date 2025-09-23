import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Handle language cookie
  const languageCookie = req.cookies.get("language")?.value;

  if (!languageCookie) {
    const acceptLang = req.headers.get("accept-language")?.split(",")[0] || "en";
    const lang = acceptLang.startsWith("ar") ? "ar" : "en";

    res.cookies.set("language", lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax', // More permissive for language cookies
    });
  }

  // ✅ Add CORS headers to support cookies in cross-origin requests
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    // Add CORS headers to actual requests
    res.headers.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)', // Run on all routes except static files
    '/api/:path*', // Specifically include API routes
  ],
};