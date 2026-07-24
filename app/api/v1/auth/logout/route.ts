import { NextResponse } from "next/server";

function clearAuthCookies(response: NextResponse) {
  const cookiesToClear = [
    "titan_token",
    "token",
    "session",
    "next-auth.session-token",
    "__Secure-next-auth.session-token"
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, "", {
      httpOnly: true,
      expires: new Date(0),
      maxAge: 0,
      path: "/",
    });
  });

  return response;
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully", redirectUrl: "/" });
  return clearAuthCookies(response);
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  return clearAuthCookies(response);
}
