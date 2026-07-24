import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getBookingGroupsByRoom, BookingGroup } from "@/app/lib/bookingGroups";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomIdParam = searchParams.get("roomId");

    const whereClause: any = {};
    if (roomIdParam) {
      const parsedRoomId = parseInt(roomIdParam, 10);
      if (!isNaN(parsedRoomId)) {
        whereClause.roomId = parsedRoomId;
      }
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            player_id: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            roomName: true,
            match_type: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Also fetch booking groups to map accurate player IDs per room per user
    const roomIds = Array.from(new Set(payments.map((p) => p.roomId)));
    const bookingGroupsByRoomMap = new Map<number, BookingGroup[]>();

    for (const rId of roomIds) {
      const groups = await getBookingGroupsByRoom(rId);
      bookingGroupsByRoomMap.set(rId, groups);
    }

    const transactions = payments.map((p) => {
      const roomGroups = bookingGroupsByRoomMap.get(p.roomId) || [];
      const userGroup = roomGroups.find((g) => g.userId === p.userId);

      const playerIds = userGroup && userGroup.playerIds.length > 0 
        ? userGroup.playerIds 
        : [p.user?.player_id || "N/A"];

      return {
        id: p.id,
        userId: p.userId,
        username: p.user?.username || `User_${p.userId}`,
        player_id: p.user?.player_id || "",
        playerIds: playerIds,
        userFormatted: `User #${p.userId} (${p.user?.username || `User_${p.userId}`}) - ${playerIds.join(", ")}`,
        roomId: p.roomId,
        roomName: p.room?.roomName || `Room #${p.roomId}`,
        amount: p.amount,
        prizeAmount: p.prizeAmount,
        status: p.status,
        distributionStatus: p.distributionStatus, // "Success" | "Error" | "pending"
        paymentMethod: userGroup?.upiId ? `UPI (${userGroup.upiId})` : userGroup?.gpay ? `GPay (${userGroup.gpay})` : "N/A",
        reason: p.distributionStatus === "Success" 
          ? `Paid via ${userGroup?.upiId ? "UPI" : userGroup?.gpay ? "GPay" : "Direct Transfer"}`
          : p.distributionStatus === "Error"
          ? "No UPI or GPay payment details attached to booking"
          : "Distribution pending",
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, transactions });
  } catch (err: any) {
    console.error("Failed to fetch distribution transactions:", err);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
