import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "titan-arena-fallback-secret",
);

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const playerId = typeof body.playerId === "string" ? body.playerId.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";

    if (!name || !email || !playerId) {
      return NextResponse.json(
        { error: "Name, email, and Player ID are required fields." },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    // Phone format validation
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (phone && !phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use 7-20 digits (optional + prefix)." },
        { status: 400 }
      );
    }

    // WhatsApp format validation
    if (whatsapp && !phoneRegex.test(whatsapp)) {
      return NextResponse.json(
        { error: "Invalid WhatsApp number format. Use 7-20 digits (optional + prefix)." },
        { status: 400 }
      );
    }

    // Check if email or player_id is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { player_id: playerId },
        ],
        NOT: { id: Number(user.id) },
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "This email address is already in use by another account." },
          { status: 409 }
        );
      }
      if (existingUser.player_id === playerId) {
        return NextResponse.json(
          { error: "This Player ID is already in use by another account." },
          { status: 409 }
        );
      }
    }

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: Number(user.id) },
      data: {
        name,
        email,
        player_id: playerId,
        phone: phone || null,
        whatsapp: whatsapp || null,
      },
    });

    // Re-generate JWT to keep active session updated
    const token = await new SignJWT({
      sub: String(updatedUser.id),
      email: updatedUser.email,
      name: updatedUser.name ?? "",
      role: updatedUser.role ?? "player",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);

    const res = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role ?? "player",
      },
    });

    res.cookies.set("titan_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
