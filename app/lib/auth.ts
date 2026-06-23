import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "titan-arena-fallback-secret"
);

import prisma from "@/app/lib/prisma";

export async function getSessionUser() {
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
    console.error("JWT verification failed:", error);
    return null;
  }
}
