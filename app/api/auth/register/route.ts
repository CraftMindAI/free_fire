import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/lib/prisma";
import { encryptId } from "@/app/lib/encryption";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const playerId =
    typeof body.player_id === "string" ? body.player_id.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const whatsapp =
    typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!username || !playerId || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Username, player ID, email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 },
    );
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }, { player_id: playerId }],
      },
    });

    if (existingUser) {
      let field = "username";
      if (existingUser.email === email) field = "email";
      else if (existingUser.player_id === playerId) field = "player ID";
      return NextResponse.json(
        { error: `An account with this ${field} already exists.` },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        player_id: playerId,
        name: username,
        email,
        profile_img: body.profile_img || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        password: hashedPassword,
        role: "player",
      },
    });

    // Create user stats record
    await prisma.userStats.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json(
      { success: true, userId: user.id, encryptedId: encryptId(String(user.id)) },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 },
    );
  }
}
