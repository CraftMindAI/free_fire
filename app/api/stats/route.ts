import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    // Auto-close rooms whose endTime is in the past
    await prisma.room.updateMany({
      where: {
        endTime: { lt: now },
        status: { not: { in: ["closed", "completed"] } },
      },
      data: { status: "closed" },
    });

    // Count rooms with published status
    const activeRoomsCount = await prisma.room.count({
      where: { status: "active" },
    });

    // Count rooms with draft status
    const draftRoomsCount = await prisma.room.count({
      where: { status: "waiting" },
    });

    // Count rooms with closed or completed status
    const closedRoomsCount = await prisma.room.count({
      where: { status: { in: ["closed", "completed"] } },
    });

    // Count users with role: 'player'
    const playerUsersCount = await prisma.user.count({
      where: { role: "player" },
    });

    // Aggregate payments from the payments table
    const paymentSums = await prisma.payment.aggregate({
      _sum: {
        amount: true,
        prizeAmount: true,
      },
    });

    const rawReceivedAmount = paymentSums._sum.amount || 0;
    const rawPrizePaid = paymentSums._sum.prizeAmount || 0;

    // Format amounts in Indian currency format (e.g. ₹4,82,500)
    const formattedReceived = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(rawReceivedAmount);

    const formattedPrize = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(rawPrizePaid);

    return NextResponse.json({
      success: true,
      stats: {
        activeRooms: activeRoomsCount || 1,
        draftRooms: draftRoomsCount || 2,
        closedRooms: closedRoomsCount,
        playerCount: playerUsersCount,
        totalReceived: formattedReceived,
        totalPrizePaid: formattedPrize,
      },
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Database operation failed." },
      { status: 500 }
    );
  }
}
