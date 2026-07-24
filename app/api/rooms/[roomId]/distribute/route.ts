import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getBookingGroupsByRoom } from "@/app/lib/bookingGroups";

function getField(row: Record<string, any>, ...keys: string[]): any {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  const lowerMap = Object.keys(row).reduce<Record<string, any>>((acc, key) => {
    acc[key.toLowerCase()] = row[key];
    return acc;
  }, {});
  for (const k of keys) {
    const v = lowerMap[k.toLowerCase()];
    if (v !== undefined) return v;
  }
  return undefined;
}

function normalizePlayerIds(raw: any): string[] {
  if (raw === undefined || raw === null) return [];
  return String(raw)
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function sameIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId: rawRoomId } = await params;
    const roomId = Number.parseInt(rawRoomId, 10);
    if (Number.isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid Room ID" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    if (room.payment_status === "complete") {
      return NextResponse.json(
        { error: "This room's prize distribution is already complete — the transaction was already done." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const rows: Record<string, any>[] = Array.isArray(body.rows) ? body.rows : [];
    if (rows.length === 0) {
      return NextResponse.json({ error: "No rows to process" }, { status: 400 });
    }

    const bookingGroups = await getBookingGroupsByRoom(roomId);
    const existingPayments = await prisma.payment.findMany({ where: { roomId } });
    const usedPaymentIds = new Set<number>();

    const results: Array<{
      row: number;
      userId: number | null;
      status: "Success" | "Error" | "Skipped" | "Invalid";
      reason: string;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowRoomIdRaw = getField(row, "roomid", "roomId");
      const rowUserIdRaw = getField(row, "Userid", "userid", "userId");
      const rowPriceRaw = getField(row, "priceAmount");
      const rowPlayerIdsRaw = getField(row, "Player Ids", "playerIds");

      const rowRoomIdDigits = rowRoomIdRaw !== undefined ? String(rowRoomIdRaw).replace(/\D/g, "") : "";
      const rowRoomId = rowRoomIdDigits ? Number.parseInt(rowRoomIdDigits, 10) : NaN;
      const userId = rowUserIdRaw !== undefined ? Number.parseInt(String(rowUserIdRaw), 10) : NaN;
      const priceAmount = rowPriceRaw !== undefined ? Number.parseInt(String(rowPriceRaw), 10) : NaN;
      const rowPlayerIds = normalizePlayerIds(rowPlayerIdsRaw);

      if (Number.isNaN(rowRoomId) || rowRoomId !== roomId) {
        results.push({ row: i + 1, userId: Number.isNaN(userId) ? null : userId, status: "Invalid", reason: "Room ID does not match the selected room" });
        continue;
      }
      if (Number.isNaN(userId)) {
        results.push({ row: i + 1, userId: null, status: "Invalid", reason: "Missing or invalid Userid" });
        continue;
      }
      if (Number.isNaN(priceAmount)) {
        results.push({ row: i + 1, userId, status: "Invalid", reason: "Missing or invalid priceAmount" });
        continue;
      }

      // Nested validation: roomId, userId and the booked player ids must all match a real booking
      const group = bookingGroups.find(
        (g) => g.userId === userId && rowPlayerIds.length > 0 && sameIdSet(g.playerIds, rowPlayerIds)
      );
      if (!group) {
        results.push({ row: i + 1, userId, status: "Invalid", reason: "No matching booking found for this user and player ids" });
        continue;
      }

      const payment = existingPayments.find((p) => p.userId === userId && !usedPaymentIds.has(p.id));

      // Only distribute when there's no payment yet, or it previously failed — never re-pay a Success
      if (payment && payment.distributionStatus === "Success") {
        usedPaymentIds.add(payment.id);
        results.push({ row: i + 1, userId, status: "Skipped", reason: "Already paid" });
        continue;
      }

      const hasUpi = !!group.upiId;
      const hasGpay = !!group.gpay;
      const paid = hasUpi || hasGpay;
      const newStatus = paid ? "Success" : "Error";

      let savedPayment;
      if (payment) {
        savedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: { prizeAmount: priceAmount, distributionStatus: newStatus },
        });
      } else {
        savedPayment = await prisma.payment.create({
          data: {
            userId,
            roomId,
            amount: 0,
            prizeAmount: priceAmount,
            status: "paid",
            distributionStatus: newStatus,
          },
        });
      }
      usedPaymentIds.add(savedPayment.id);

      results.push({
        row: i + 1,
        userId,
        status: newStatus,
        reason: paid ? `Paid via ${hasUpi ? "UPI" : "GPay"}` : "No UPI or GPay details on booking",
      });
    }

    const allPayments = await prisma.payment.findMany({ where: { roomId } });
    const roomPaymentComplete = allPayments.length > 0 && allPayments.every((p) => p.distributionStatus === "Success");
    if (roomPaymentComplete && room.payment_status !== "complete") {
      await prisma.room.update({ where: { id: roomId }, data: { payment_status: "complete" } });
    }

    return NextResponse.json({ success: true, results, roomPaymentComplete });
  } catch (error) {
    console.error("Distribution Error:", error);
    return NextResponse.json({ error: "Failed to process distribution" }, { status: 500 });
  }
}
