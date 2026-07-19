import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, message } = body;

    if (!name || !email || !mobile || !message) {
      return NextResponse.json(
        { error: "Name, email, mobile, and message are required." },
        { status: 400 }
      );
    }

    const newContactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        mobile,
        message,
      },
    });

    return NextResponse.json({ success: true, message: "Contact message sent successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating contact message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
