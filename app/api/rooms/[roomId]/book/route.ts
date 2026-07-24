import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
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
    
    // Normalize to an array of bookings (support both legacy single object and new bookings array)
    const bookingsPayload = data.bookings ? data.bookings : [data];

    if (!Array.isArray(bookingsPayload) || bookingsPayload.length === 0) {
      return NextResponse.json({ error: "Invalid booking payload" }, { status: 400 });
    }

    for (const b of bookingsPayload) {
      if (!b.seatNumber || !b.upiId || !b.playerId || !b.phone) {
        return NextResponse.json({ error: "Missing required fields in one or more bookings" }, { status: 400 });
      }
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: numericRoomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (!user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const numericUserId = typeof user.id === "string" ? parseInt(user.id, 10) : (user.id as number);

    // Shared confirmation id for every seat booked together in this request
    const confirmationId = randomUUID();

    // Use createMany to insert multiple bookings atomically
    const bookingsData = bookingsPayload.map(b => ({
        roomId: numericRoomId,
        userId: numericUserId,
        playerId: b.playerId,
        playerName: user.name || "Unknown",
        email: b.email,
        phone: b.phone,
        whatsapp: b.whatsapp || null,
        upiId: b.upiId,
        Gpay: b.isGpay ? b.phone : (b.gpayNumber || null),
        seatNumber: typeof b.seatNumber === "string" ? parseInt(b.seatNumber, 10) : b.seatNumber,
        status: "confirmed",
        Confirmat_Id: confirmationId,
    }));

    const result = await prisma.booking.createMany({
      data: bookingsData,
    });

    const totalAmount = (room.entry_fee || 0) * bookingsData.length;

    await prisma.room.update({
      where: { id: numericRoomId },
      data: {
        currentPlayers: { increment: bookingsData.length },
        total_price_genrated: { increment: totalAmount },
      }
    });

    await prisma.payment.create({
      data: {
        userId: numericUserId,
        roomId: numericRoomId,
        amount: totalAmount,
        status: "paid",
        distributionStatus: "pending"
      }
    });

    return NextResponse.json({ success: true, count: result.count });
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
