import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getSessionUser } from "@/app/lib/auth";
import { decryptId } from "@/app/lib/encryption";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { roomId } = resolvedParams;

    // The roomId in the URL is encrypted
    const decodedRoomId = decryptId(roomId);
    const numericRoomId = decodedRoomId ? parseInt(decodedRoomId, 10) : NaN;

    if (isNaN(numericRoomId)) {
      return NextResponse.json({ error: "Invalid Room ID" }, { status: 400 });
    }

    const data = await request.json();
    const { seatNumber, playerId, email, whatsapp, phone, isGpay, gpayNumber, upiId } = data;

    if (!seatNumber || !upiId || !playerId || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: numericRoomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const numericUserId = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;

    // Update user with latest contact & payment details
    await prisma.user.update({
      where: { id: numericUserId },
      data: {
        player_id: playerId,
        email: email,
        whatsapp: whatsapp,
        phone: phone,
        upiId: upiId,
        Gpay: isGpay ? "Same as Phone" : (gpayNumber || ""),
      }
    });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        roomId: numericRoomId,
        userId: numericUserId,
        playerId: playerId,
        seatNumber: parseInt(seatNumber, 10),
        status: "confirmed",
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error("Booking Error:", error);
    // Handle unique constraint violation (P2002)
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('playerId')) {
        return NextResponse.json({ error: "This Player ID is already enrolled in this match!" }, { status: 409 });
      }
      return NextResponse.json({ error: "This seat is already booked!" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
