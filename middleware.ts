import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "titan-arena-fallback-secret"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Perform instant HTTP 307 redirect for logged-in users visiting public entry routes
  if (
    pathname === "/" ||
    pathname === "/v1/auth/login" ||
    pathname === "/v1/auth/register"
  ) {
    const token = req.cookies.get("titan_token")?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET);
        const userId = payload.sub as string;
        const role = ((payload.role as string) || "player").toLowerCase();
        const encryptedId = (payload.encryptedId as string) || userId;

        if (userId && encryptedId) {
          const targetPath =
            role === "admin"
              ? `/profile/v2/dashboard/${encryptedId}/home`
              : `/profile/v1/${encryptedId}/dashboard/home`;

          return NextResponse.redirect(new URL(targetPath, req.url));
        }
      } catch {
        // Invalid or expired token - allow normal page load
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/v1/auth/login", "/v1/auth/register"],
};
