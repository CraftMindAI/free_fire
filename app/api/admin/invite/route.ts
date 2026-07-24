import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure requester is an Admin
  if (currentUser.role.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const username = typeof body.username === "string" ? body.username.trim() : "";
    const playerId = typeof body.player_id === "string" ? body.player_id.trim() : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!username || !playerId || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Username, player ID, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Check if user already exists
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
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new administrator user
    const newAdmin = await prisma.user.create({
      data: {
        username,
        player_id: playerId,
        email,
        phone: phone || null,
        whatsapp: whatsapp || null,
        profile_img: body.profile_img || null,
        password: hashedPassword,
        role: "admin",
      },
    });

    // // Initialize stats
    // await prisma.userStats.create({
    //   data: {
    //     userId: newAdmin.id,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "Administrator created successfully.",
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        player_id: newAdmin.player_id,
        email: newAdmin.email,
        phone: newAdmin.phone || "",
        whatsapp: newAdmin.whatsapp || "",
        role: newAdmin.role,
        profile_img: newAdmin.profile_img,
      },
    });
  } catch (error) {
    console.error("Admin invite error:", error);
    return NextResponse.json(
      { error: "Failed to create administrator. Please try again." },
      { status: 500 }
    );
  }
}
