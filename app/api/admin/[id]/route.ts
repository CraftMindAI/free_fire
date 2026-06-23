import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

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
      message: `Administrator "${targetUser.name}" has been removed.`,
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: "Failed to delete administrator. Please try again." },
      { status: 500 }
    );
  }
}
