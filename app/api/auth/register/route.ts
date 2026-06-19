import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!username || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Username, email and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 }
    );
  }

  const db = await getDb();

  const existing = await db.collection("users").findOne({
    $or: [{ email }, { username }],
  });

  if (existing) {
    const field = existing.email === email ? "email" : "username";
    return NextResponse.json(
      { error: `An account with this ${field} already exists.` },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await db.collection("users").insertOne({
    username,
    name: username,
    email,
    phone,
    whatsapp,
    password: hashedPassword,
    role: "player",
    createdAt: new Date(),
  });

  return NextResponse.json(
    { success: true, userId: result.insertedId },
    { status: 201 }
  );
}
