import prisma from "@/app/lib/prisma";
import { requireAdminMatch } from "@/app/lib/adminGuard";
import PaymentHistoryClient from "@/app/[userId]/payment-history/PaymentHistoryClient";

export default async function AdminPaymentHistoryPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;

  const user = await requireAdminMatch(userId);

  const payments = await prisma.payment.findMany({
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

  const clientUser = { ...user, id: userId };

  return (
    <PaymentHistoryClient
      initialPayments={serializedPayments}
      user={clientUser}
    />
  );
}
