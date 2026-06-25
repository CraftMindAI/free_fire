import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    // Auto-close rooms whose endTime is in the past
    await prisma.room.updateMany({
      where: {
        endTime: { lt: now },
        status: { not: "closed" },
      },
      data: { status: "closed" },
    });

    const rooms = await prisma.room.findMany();
    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("Failed to get rooms:", error);
    return NextResponse.json(
      { error: "Database operation failed." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "create") {
      const { map, map_img, matchType, maxPlayers, matchDate, matchTime } = body;
      console.log("Server received create action. matchType:", matchType, "maxPlayers:", maxPlayers);

      if (!map || !maxPlayers) {
        return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
      }

      let startTime: Date | undefined;
      let endTime: Date | undefined;
      if (matchDate && matchTime) {
        startTime = new Date(`${matchDate}T${matchTime}:00`);
        endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // add 2 hours
      }

      // ── Duplicate check ──────────────────────────────────────────
      const existing = await prisma.room.findFirst({
        where: {
          roomName: map,
          status: { in: ["waiting", "active"] },
          ...(startTime ? { startTime } : {}),
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: `A "${map}" room at the same time already exists and is ${existing.status === "active" ? "active" : "in draft"}. Please choose a different time or map.`,
          },
          { status: 409 }
        );
      }
      // ─────────────────────────────────────────────────────────────

      const newRoom = await prisma.room.create({
        data: {
          roomName: map,
          roomCode: `RT-${Math.floor(Math.random() * 9000) + 1000}`,
          createdBy: 1,
          map_img: map_img || null,
          maxPlayers: Number(maxPlayers),
          currentPlayers: 0,
          status: "waiting",
          startTime,
          endTime,
        },
      });

      return NextResponse.json({ success: true, room: { ...newRoom, matchType: matchType || "Solo" } });
    }

    const { roomId } = body;
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    if (action === "publish") {
      const result = await prisma.room.update({
        where: { id: Number(roomId) },
        data: { status: "active" },
      });
      return NextResponse.json({ success: true, message: "Room published successfully", room: result });

    } else if (action === "edit") {
      const { map, map_img, maxPlayers, matchDate, matchTime } = body;

      const updateData: any = {};
      if (map) updateData.roomName = map;
      if (map_img !== undefined) updateData.map_img = map_img;
      if (maxPlayers !== undefined) updateData.maxPlayers = Number(maxPlayers);
      if (matchDate && matchTime) {
        updateData.startTime = new Date(`${matchDate}T${matchTime}:00`);
        updateData.endTime = new Date(updateData.startTime.getTime() + 2 * 60 * 60 * 1000); // add 2 hours
      }

      const result = await prisma.room.update({
        where: { id: Number(roomId) },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: "Room edited successfully", room: result });

    } else if (action === "delete") {
      await prisma.room.delete({
        where: { id: Number(roomId) },
      });
      return NextResponse.json({ success: true, message: "Room deleted successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update room:", error);
    return NextResponse.json(
      { error: "Database operation failed." },
      { status: 500 }
    );
  }
}
