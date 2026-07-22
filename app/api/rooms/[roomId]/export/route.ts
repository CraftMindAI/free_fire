import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId: rawRoomId } = await params;
    const roomId = Number.parseInt(rawRoomId, 10);
    if (Number.isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid Room ID" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Fetch payments for the given room
    const payments = await prisma.payment.findMany({
      where: { roomId: roomId },
      orderBy: { id: 'asc' }
    });

    const headers = ["Userid", "roomid", "amount", "priceAmount", "status", "distributionStatus"];
    const csvRows = [headers.join(",")];

    for (const p of payments) {
      const row = [
        p.userId,
        p.roomId,
        p.amount,
        p.prizeAmount,
        p.status,
        p.distributionStatus
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="room_${roomId}_payments.csv"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
