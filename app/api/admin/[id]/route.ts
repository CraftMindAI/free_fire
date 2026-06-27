import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure requester is an Admin
  if (currentUser.role.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
  }

  try {
    const { id: targetIdString } = await props.params;
    const targetId = Number(targetIdString);

    if (isNaN(targetId)) {
      return NextResponse.json({ error: "Invalid admin ID." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    const username = typeof body.username === "string" ? body.username.trim() : "";
    const playerId = typeof body.player_id === "string" ? body.player_id.trim() : "";
    const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";
    const role = typeof body.role === "string" ? body.role.toLowerCase() : "";

    if (!username || !playerId || !email || !role) {
      return NextResponse.json(
        { error: "Username, player ID, email, and role are required." },
        { status: 400 }
      );
    }

    if (password) {
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
    }

    // Check if user already exists with the new unique fields (excluding the current user being updated)
    const existingUser = await prisma.user.findFirst({
      where: {
        id: { not: targetId },
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

    const updateData: any = {
      username,
      player_id: playerId,
      name: username, // Sync name with username for simplicity in this flow
      email,
      phone: phone || null,
      whatsapp: whatsapp || null,
      role,
    };

    if (body.profile_img) {
      updateData.profile_img = body.profile_img;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Prevent removing your own admin privileges
    if (targetId === Number(currentUser.id) && role !== "admin") {
      return NextResponse.json({ error: "You cannot remove your own admin privileges." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Administrator updated successfully.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        player_id: updatedUser.player_id,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        whatsapp: updatedUser.whatsapp || "",
        role: updatedUser.role,
        profile_img: updatedUser.profile_img,
      },
    });
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { error: "Failed to update administrator. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure requester is an Admin
  if (currentUser.role.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
  }

  try {
    const { id: targetIdString } = await props.params;
    const targetId = Number(targetIdString);

    if (isNaN(targetId)) {
      return NextResponse.json({ error: "Invalid admin ID." }, { status: 400 });
    }

    // Prevent self-deletion
    if (targetId === Number(currentUser.id)) {
      return NextResponse.json({ error: "You cannot delete your own admin account." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Administrator not found." }, { status: 404 });
    }

    // Delete the user record
    await prisma.user.delete({
      where: { id: targetId },
    });

    return NextResponse.json({
      success: true,
      message: `Administrator "${targetUser.username}" has been removed.`,
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: "Failed to delete administrator. Please try again." },
      { status: 500 }
    );
  }
}
