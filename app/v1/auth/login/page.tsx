import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import { encryptId } from "@/app/lib/encryption";
import LoginFormClient from "./LoginFormClient";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    const encryptedId = encryptId(String(user.id));
    if (user.role.toLowerCase() === "admin") {
      redirect(`/profile/v2/dashboard/${encryptedId}/home`);
    } else {
      redirect(`/profile/v1/${encryptedId}/dashboard/home`);
    }
  }

  return <LoginFormClient />;
}
