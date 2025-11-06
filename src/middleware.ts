import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const languageCookie = req.cookies.get("language")?.value;
  if (!languageCookie) {
    const acceptLang = req.headers.get("accept-language")?.split(",")[0] || "en";
    const lang = acceptLang.startsWith("ar") ? "ar" : "en";

    res.cookies.set("language", lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Redirect /auth/callback to Azure success page
  if (req.nextUrl.pathname === "/auth/callback") {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/azure/success";
    return NextResponse.redirect(url);
  }

  // Don't apply auth checks to the success page - let it handle auth itself
  if (req.nextUrl.pathname === "/auth/azure/success") {
    return res;
  }

  // Handle CORS for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, ngrok-skip-browser-warning",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    res.headers.set("Access-Control-Allow-Origin", req.headers.get("origin") || "*");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};