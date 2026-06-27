import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import prisma from "@/app/lib/prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "titan-arena-fallback-secret"
);

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Verify token
    let payload;
    try {
      const result = await jwtVerify(token, SECRET);
      payload = result.payload;
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 401 }
      );
    }

    if (payload.purpose !== "password_reset" || !payload.sub) {
      return NextResponse.json(
        { error: "Invalid token payload." },
        { status: 401 }
      );
    }

    const userId = parseInt(payload.sub as string, 10);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset update error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
