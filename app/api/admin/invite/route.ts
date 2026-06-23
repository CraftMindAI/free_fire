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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const designation = typeof body.role === "string" ? body.role.trim() : "Moderator"; // mapping Assign Role field

    if (!name || !email) {
      return NextResponse.json(
        { error: "Full Name and Work Email are required fields." },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An administrator or player with this email address already exists." },
        { status: 409 }
      );
    }

    // Generate unique username
    let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!baseUsername) baseUsername = "admin";
    let username = baseUsername;
    let usernameExists = true;
    let attempts = 0;
    while (usernameExists && attempts < 10) {
      const userCheck = await prisma.user.findUnique({ where: { username } });
      if (!userCheck) {
        usernameExists = false;
      } else {
        username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
      }
      attempts++;
    }

    // Generate unique player ID (9 digits)
    let playerId = "";
    let playerIdExists = true;
    attempts = 0;
    while (playerIdExists && attempts < 10) {
      playerId = Math.floor(100000000 + Math.random() * 900000000).toString();
      const idCheck = await prisma.user.findUnique({ where: { player_id: playerId } });
      if (!idCheck) {
        playerIdExists = false;
      }
      attempts++;
    }

    // Create default password (admin1234)
    const hashedPassword = await bcrypt.hash("admin1234", 12);

    // Create the new administrator user
    const newAdmin = await prisma.user.create({
      data: {
        username,
        player_id: playerId,
        name,
        email,
        password: hashedPassword,
        role: "admin",
        designation,
      },
    });

    // Initialize stats
    await prisma.userStats.create({
      data: {
        userId: newAdmin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Administrator invited and created successfully.",
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        designation: newAdmin.designation,
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
