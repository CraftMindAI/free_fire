import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import prisma from "@/app/lib/prisma";
import { encryptId } from "@/app/lib/encryption";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "titan-arena-fallback-secret",
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const identifier =
    typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return NextResponse.json(
      { error: "Enter email, phone, or username along with your password." },
      { status: 400 },
    );
  }

  const normalizedEmail = identifier.includes("@")
    ? identifier.toLowerCase()
    : undefined;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          { username: identifier },
          { phone: identifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    // Generate JWT token
    const token = await new SignJWT({
      sub: String(user.id),
      email: user.email,
      name: user.username ?? "",
      role: user.role ?? "player",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);

    const res = NextResponse.json({
      success: true,
      user: { 
        id: user.id,
        encryptedId: encryptId(String(user.id)),
        name: user.username, 
        email: user.email, 
        role: user.role ?? "player" 
      },
    });

    res.cookies.set("titan_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Database connection failed. Please try again later." },
      { status: 500 },
    );
  }
}
