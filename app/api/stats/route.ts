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

    // Run independent count/aggregate queries in parallel instead of one-by-one
    const [activeRoomsCount, draftRoomsCount, closedRoomsCount, playerUsersCount, paymentSums] =
      await Promise.all([
        // Count rooms with published status
        prisma.room.count({ where: { status: "active" } }),
        // Count rooms with draft-like statuses (cover different casings/legacy values)
        prisma.room.count({ where: { status: "Draft" } }),
        // Count rooms with closed or completed status
        prisma.room.count({ where: { status: { in: ["closed", "completed"] } } }),
        // Count users with role: 'player'
        prisma.user.count({ where: { role: "player" } }),
        // Aggregate payments from the payments table
        prisma.payment.aggregate({ _sum: { amount: true, prizeAmount: true } }),
      ]);

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
        activeRooms: activeRoomsCount,
        draftRooms: draftRoomsCount,
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
