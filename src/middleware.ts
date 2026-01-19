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

  if (req.nextUrl.pathname === "/auth/callback") {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/azure/success";
    return NextResponse.redirect(url);
  }

  if (req.nextUrl.pathname === "/auth/azure/success") {
    return res;
  }

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

    return res;
  }

  const token = req.cookies.get("userToken")?.value;
  const tokenExpiration = req.cookies.get("tokenExpiration")?.value;
  const rememberMe = req.cookies.get("rememberMe")?.value;
  const pathname = req.nextUrl.pathname;

  const isLoginPage = pathname === "/" || pathname === "/login";
  const isForgotPassword = pathname === "/forgot-password";
  const isAuthRoute = pathname.startsWith("/auth/");
  const isPublicRoute = isLoginPage || isForgotPassword || isAuthRoute;

  const isTokenValid = token && (!tokenExpiration || Date.now() <= parseInt(tokenExpiration));

  if (!isPublicRoute && !isTokenValid) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isLoginPage && isTokenValid && rememberMe === "true") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)).*)",
    "/api/:path*",
  ],
};