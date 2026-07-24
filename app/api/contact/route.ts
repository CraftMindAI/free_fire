import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

    if (message.length > 250) {
      return NextResponse.json(
        { error: "Message must be 250 characters or fewer." },
        { status: 400 }
      );
    }

    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    await transporter.sendMail({
      from: `"Titan Arena" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\n\nMessage:\n${message}`,
      html: `
        <div style="background-color:#131313;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background-color:#1b1b1b;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
            <tr>
              <td style="background-color:#ff2e2e;padding:20px 28px;">
                <span style="font-size:18px;font-weight:800;letter-spacing:2px;color:#ffffff;text-transform:uppercase;">Titan Arena</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h2 style="margin:0 0 4px;color:#ffffff;font-size:20px;">New Contact Message</h2>
                <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:13px;">Someone submitted the contact form on titanarena.</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;width:110px;">Name</td>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#ffffff;font-size:14px;font-weight:600;">${escapeHtml(name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#ffffff;font-size:14px;font-weight:600;">${escapeHtml(email)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Mobile</td>
                    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#ffffff;font-size:14px;font-weight:600;">${escapeHtml(mobile)}</td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
                <div style="background-color:#131313;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;color:#e5e2e1;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background-color:#131313;border-top:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0;color:rgba(255,255,255,0.35);font-size:11px;">Reply directly to this email to respond to ${escapeHtml(name)}.</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Contact message sent successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Error sending contact message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
