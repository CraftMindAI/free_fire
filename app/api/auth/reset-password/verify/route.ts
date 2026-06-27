import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import prisma from "@/app/lib/prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "titan-arena-fallback-secret"
);

export async function POST(req: NextRequest) {
  try {
    const { username, email, phone } = await req.json();

    if (!username || !email || !phone) {
      return NextResponse.json(
        { error: "Username, email, and phone are required." },
        { status: 400 }
      );
    }

    // Verify user details
    const user = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        email: { equals: email, mode: "insensitive" },
        phone: phone,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No matching account found." },
        { status: 404 }
      );
    }

    // Generate a reset token valid for 15 minutes
    const token = await new SignJWT({
      sub: String(user.id),
      purpose: "password_reset",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(SECRET);

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Reset verify error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
