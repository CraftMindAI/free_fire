import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getSessionUser } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profile_img } = await req.json();

    if (!profile_img) {
      return NextResponse.json(
        { error: "Profile image is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(user.id) },
      data: { profile_img },
    });

    return NextResponse.json(
      { message: "Profile image updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile Image Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
