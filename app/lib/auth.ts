import { cache } from "react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "titan-arena-fallback-secret"
);

import prisma from "@/app/lib/prisma";

// Deduped per-request: Server Components and layouts on the same request
// (e.g. a layout plus a page, or an admin guard plus the page it guards)
// can each call getSessionUser() independently. React's cache() ensures
// only one DB round-trip happens per request instead of one per call site.
export const getSessionUser = cache(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("titan_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    
    // Fetch profile_img from database
    const userDb = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { profile_img: true }
    });

    return {
      id: payload.sub,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      profile_img: userDb?.profile_img || null,
    };
  } catch (error) {
    // Next.js throws this internally when `cookies()` is called during static
    // prerendering to signal the route must render dynamically. Let it bubble
    // up instead of swallowing it as a JWT failure.
    if (
      error instanceof Error &&
      (error as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("JWT verification failed:", error);
    return null;
  }
});
