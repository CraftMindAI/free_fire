import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { getDb1, getDb2 } from "@/app/lib/mongodb";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "titan-arena-fallback-secret",
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email =
    typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  let db, user;

  try {
    // Query both databases in parallel, use whichever responds first with a user
    const [result1, result2] = await Promise.allSettled([
      (async () => {
        const db1 = await getDb1();
        return {
          db: db1,
          user: await db1.collection("users").findOne({ email }),
        };
      })(),
      (async () => {
        const db2 = await getDb2();
        return {
          db: db2,
          user: await db2.collection("users").findOne({ email }),
        };
      })(),
    ]);

    if (result1.status === "fulfilled" && result1.value.user) {
      db = result1.value.db;
      user = result1.value.user;
      console.log("User found in DB1");
    } else if (result2.status === "fulfilled" && result2.value.user) {
      db = result2.value.db;
      user = result2.value.user;
      console.log("User found in DB2");
    }

    if (!db) {
      console.error("Both database connections failed");
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Database connection failed. Please try again later." },
      { status: 500 },
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password as string);
  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
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
