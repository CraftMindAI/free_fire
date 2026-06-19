import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { getDb } from "@/app/lib/mongodb";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "titan-arena-fallback-secret"
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, user.password as string);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await new SignJWT({
    sub: String(user._id),
    email: user.email,
    name: user.name ?? "",
    role: user.role ?? "player",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const res = NextResponse.json({
    success: true,
    user: { name: user.name, email: user.email, role: user.role ?? "player" },
  });

  res.cookies.set("titan_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
