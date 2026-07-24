import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { encryptId, decryptId } from "@/app/lib/encryption";
import PaymentHistoryClient from "@/app/[userId]/payment-history/PaymentHistoryClient";

export default async function PlayerPaymentHistoryPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/v1/auth/login");
  }

  // Only players can access this route
  if (user.role.toLowerCase() !== "player") {
    redirect(`/profile/v2/dashboard/${encryptId(String(user.id))}/home`);
  }

  const decodedId = decryptId(resolvedParams.userId);

  if (user.id !== decodedId) {
    redirect(`/profile/v1/${encryptId(String(user.id))}/payment-history`);
  }

  const numericUserId = Number(user.id);

  const payments = await prisma.payment.findMany({
    where: { userId: numericUserId },
    include: {
      room: true,
      user: { select: { id: true, username: true, player_id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedPayments = payments.map((p) => ({
    id: p.id,
    userId: p.userId,
    username: p.user?.username || `User_${p.userId}`,
    amount: p.amount,
    prizeAmount: p.prizeAmount,
    status: p.status,
    distributionStatus: p.distributionStatus,
    createdAt: p.createdAt.toISOString(),
    room: {
      id: p.room.id,
      roomName: p.room.roomName,
      match_type: p.room.match_type,
      total_price: p.room.total_price,
      entry_fee: p.room.entry_fee,
    },
  }));

  const clientUser = { ...user, id: resolvedParams.userId };

  return (
    <PaymentHistoryClient
      initialPayments={serializedPayments}
      user={clientUser}
    />
  );
}
