import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { encryptId } from "@/app/lib/encryption";

export async function GET() {
  try {
    const now = new Date();
    // Auto-close only published (active) rooms whose endTime is in the past
    await prisma.room.updateMany({
      where: {
        endTime: { lt: now },
        status: "active",
      },
      data: { status: "closed" },
    });

    const rooms = await prisma.room.findMany();
    const roomsWithEncryptedId = rooms.map((r) => ({
      ...r,
      encryptedRoomId: encryptId(String(r.id)),
    }));
    return NextResponse.json({ success: true, rooms: roomsWithEncryptedId });
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
      const { endTime: providedEndTime } = body;
      
      if (matchDate && matchTime) {
        startTime = new Date(`${matchDate}T${matchTime}:00`);
        if (providedEndTime) {
          endTime = new Date(`${matchDate}T${providedEndTime}:00`);
          // A match can run past midnight (e.g. 11:30 PM -> 12:30 AM); if the
          // end clock time is at/before the start clock time, it lands the next day.
          if (providedEndTime <= matchTime) {
            endTime.setDate(endTime.getDate() + 1);
          }
        } else {
          endTime = new Date(startTime.getTime() + 1 * 60 * 60 * 1000); // add 1 hour by default
        }
      }

      // Rooms can be created at any time of day, but the scheduled match
      // itself must lie in the future or it gets auto-closed as soon as it's published.
      if (startTime && startTime.getTime() <= Date.now()) {
        return NextResponse.json({ error: "Start time must be in the future." }, { status: 400 });
      }
      if (startTime && endTime && endTime.getTime() <= startTime.getTime()) {
        return NextResponse.json({ error: "End time must be after the start time." }, { status: 400 });
      }

      // ── Duplicate check ──────────────────────────────────────────
      const existing = await prisma.room.findFirst({
        where: {
          roomName: map,
          match_type: matchType || "Solo",
          status: { notIn: ["closed", "completed"] },
          ...(startTime ? { startTime } : {}),
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: `A "${map}" - ${matchType || "Solo"} match at the same time already exists. Please choose a different time or match type.`,
          },
          { status: 409 }
        );
      }
      // ─────────────────────────────────────────────────────────────

      let initialStatus = "Draft";

      const newRoom = await prisma.room.create({
        data: {
          roomName: map,
          createdBy: 1, // hardcoded user id for now
          map_img: map_img || null,
          maxPlayers: Number(maxPlayers),
          currentPlayers: 0,
          status: initialStatus,
          startTime,
          endTime,
          total_price: Number(body.prizePool || 0),
          entry_fee: Number(body.entryFee || 0),
          match_type: matchType || "Solo",
        },
      });

      return NextResponse.json({ success: true, room: newRoom });
    }

    const { roomId } = body;
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }

    if (action === "publish") {
      const roomToPublish = await prisma.room.findUnique({ where: { id: Number(roomId) } });
      if (roomToPublish?.endTime && roomToPublish.endTime.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: "This match's scheduled time has already passed. Edit the start/end time before publishing." },
          { status: 409 }
        );
      }

      const result = await prisma.room.update({
        where: { id: Number(roomId) },
        data: { status: "active" },
      });
      return NextResponse.json({ success: true, message: "Room published successfully", room: result });

    } else if (action === "edit") {
      const { map, map_img, maxPlayers, matchDate, matchTime, matchType, prizePool, entryFee, endTime: providedEndTime } = body;

      const updateData: any = {};
      if (map) updateData.roomName = map;
      if (map_img !== undefined) updateData.map_img = map_img;
      if (maxPlayers !== undefined) updateData.maxPlayers = Number(maxPlayers);
      if (matchType !== undefined) updateData.match_type = matchType;
      if (prizePool !== undefined) updateData.total_price = Number(prizePool);
      if (entryFee !== undefined) updateData.entry_fee = Number(entryFee);

      if (matchDate && matchTime) {
        updateData.startTime = new Date(`${matchDate}T${matchTime}:00`);
        if (providedEndTime) {
          updateData.endTime = new Date(`${matchDate}T${providedEndTime}:00`);
          // A match can run past midnight (e.g. 11:30 PM -> 12:30 AM); if the
          // end clock time is at/before the start clock time, it lands the next day.
          if (providedEndTime <= matchTime) {
            updateData.endTime.setDate(updateData.endTime.getDate() + 1);
          }
        } else {
          updateData.endTime = new Date(updateData.startTime.getTime() + 1 * 60 * 60 * 1000); // add 1 hour
        }

        if (updateData.endTime.getTime() <= updateData.startTime.getTime()) {
          return NextResponse.json({ error: "End time must be after the start time." }, { status: 400 });
        }
      }

      const existingRoom = await prisma.room.findUnique({
        where: { id: Number(roomId) },
      });

      if (existingRoom) {
        const duplicateMatch = await prisma.room.findFirst({
          where: {
            id: { not: Number(roomId) },
            roomName: updateData.roomName || existingRoom.roomName,
            match_type: updateData.match_type || existingRoom.match_type,
            status: { notIn: ["closed", "completed"] },
            startTime: updateData.startTime || existingRoom.startTime,
          },
        });

        if (duplicateMatch) {
          return NextResponse.json(
            { error: `Another "${updateData.roomName || existingRoom.roomName}" - ${updateData.match_type || existingRoom.match_type} match at this time already exists.` },
            { status: 409 }
          );
        }

        const newEndTime = updateData.endTime || existingRoom.endTime;
        if (newEndTime && newEndTime > new Date() && existingRoom.status === "closed") {
          updateData.status = "Draft";
        }
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
