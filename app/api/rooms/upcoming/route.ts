import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    await prisma.room.updateMany({
      where: {
        endTime: { lt: now },
        status: "active",
      },
      data: { status: "closed" },
    });

    const rooms = await prisma.room.findMany({
      where: { status: "active" },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("Failed to fetch upcoming rooms:", error);
    return NextResponse.json(
      { error: "Database operation failed." },
      { status: 500 }
    );
  }
}
