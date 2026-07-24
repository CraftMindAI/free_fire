import { NextRequest, NextResponse } from "next/server";

// Clears the session and sends the browser to the public landing page.
// Used by admin-only page guards when the encrypted userId in the URL
// doesn't belong to the signed-in admin (tampered/foreign link, stale session, etc).
export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("titan_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
