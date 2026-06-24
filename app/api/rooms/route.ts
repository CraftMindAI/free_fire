import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
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
      const { map, matchType, maxPlayers, matchDate, matchTime } = body;
      console.log("Server received create action. matchType:", matchType, "maxPlayers:", maxPlayers);

      if (!map || !maxPlayers) {
        return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
      }

      let startTime: Date | undefined;
      if (matchDate && matchTime) {
        startTime = new Date(`${matchDate} ${matchTime}`);
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
          maxPlayers: Number(maxPlayers),
          currentPlayers: 0,
          status: "waiting",
          startTime,
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
      const { map, maxPlayers, matchDate, matchTime } = body;

      const updateData: any = {};
      if (map) updateData.roomName = map;
      if (maxPlayers !== undefined) updateData.maxPlayers = Number(maxPlayers);
      if (matchDate && matchTime) {
        updateData.startTime = new Date(`${matchDate} ${matchTime}`);
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
