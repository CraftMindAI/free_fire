import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb1, getDb2 } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const whatsapp =
    typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!username || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Username, email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match." },
      { status: 400 },
    );
  }

  let db1, db2;

  try {
    // Connect to both databases in parallel
    const connections = await Promise.all([getDb1(), getDb2()]);
    db1 = connections[0];
    db2 = connections[1];
    console.log("Connected to both DB1 and DB2");
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      { error: "Database connection failed. Please try again later." },
      { status: 500 },
    );
  }

  try {
    // Check if user exists in both databases in parallel
    const [existing1, existing2] = await Promise.all([
      db1.collection("users").findOne({
        $or: [{ email }, { username }],
      }),
      db2.collection("users").findOne({
        $or: [{ email }, { username }],
      }),
    ]);

    if (existing1 || existing2) {
      const existing = existing1 || existing2;
      if (!existing) {
        return NextResponse.json(
          { error: "An account with this email or username already exists." },
          { status: 409 },
        );
      }
      const field = existing.email === email ? "email" : "username";
      return NextResponse.json(
        { error: `An account with this ${field} already exists.` },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      username,
      name: username,
      email,
      phone,
      whatsapp,
      password: hashedPassword,
      role: "player",
      createdAt: new Date(),
    };

    // Insert into db1, fallback to db2 on failure
    let result;
    try {
      result = await db1.collection("users").insertOne(userData);
      console.log("User created in DB1");
    } catch (insertError) {
      console.log("Insert into DB1 failed, trying DB2:", insertError);
      result = await db2.collection("users").insertOne(userData);
      console.log("User created in DB2 (fallback)");
    }

    return NextResponse.json(
      { success: true, userId: result.insertedId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 },
    );
  }
}
