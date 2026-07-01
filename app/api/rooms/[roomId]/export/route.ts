import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

import * as XLSX from 'xlsx';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId: rawRoomId } = await params;
    const roomId = parseInt(rawRoomId, 10);
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid Room ID" }, { status: 400 });
    }

    // Fetch the room and its bookings
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: { roomId: roomId },
      orderBy: { seatNumber: 'asc' },
      include: { user: true }
    });

    const payments = await prisma.payment.findMany({
      where: { roomId: roomId }
    });

    // Generate Excel data
    const data = bookings.map(b => {
      const p = payments.find(pay => pay.userId === b.userId);
      return {
        "User ID": b.userId,
        "Player ID": b.user?.player_id || b.playerId,
        "GPay Number": b.Gpay || "",
        "UPI ID": b.upiId || "",
        "Price": p?.prizeAmount || 0,
        "Price Pool": room.total_price || 0,
        "Status": b.status,
        "Distribution Status": p?.distributionStatus || "pending"
      };
    });

    const headers = [
      "User ID",
      "Player ID",
      "GPay Number",
      "UPI ID",
      "Price",
      "Price Pool",
      "Status",
      "Distribution Status"
    ];

    let worksheet;
    if (data.length === 0) {
      worksheet = XLSX.utils.aoa_to_sheet([headers]);
    } else {
      worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="room_${roomId}_bookings.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
