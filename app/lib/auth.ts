import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "titan-arena-fallback-secret"
);

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("titan_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return {
      id: payload.sub,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
