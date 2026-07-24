import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import { decryptId } from "@/app/lib/encryption";

// Guard for admin-only pages keyed by an encrypted userId route param.
// No session -> login. Session exists but role isn't admin, or the encrypted
// id in the URL doesn't belong to the signed-in admin -> force logout and
// send them to the public landing page (not just their own correct URL),
// since a mismatched admin id is treated as a tampered/foreign link.
export async function requireAdminMatch(encryptedUserId: string) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/v1/auth/login");
  }

  const decodedId = decryptId(encryptedUserId);
  if (user.role.toLowerCase() !== "admin" || user.id !== decodedId) {
    redirect("/api/auth/force-logout");
  }

  return user;
}
