import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await props.params;

  const sessionUser = await getSessionUser();

  // If no user session, redirect to login
  if (!sessionUser) {
    redirect("/login");
  }

  // Fetch the full details of the logged-in user from the database
  const user = await prisma.user.findUnique({
    where: { id: Number(sessionUser.id) },
    select: {
      id: true,
      username: true,
      player_id: true,
      email: true,
      phone: true,
      whatsapp: true,
      role: true,
      profile_img: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch administrator team details if the user is an Admin
  let admins: any[] = [];
  const isAdmin = user.role.toLowerCase() === "admin";
  if (isAdmin) {
    admins = await prisma.user.findMany({
      where: {
        role: "admin",
      },
      select: {
        id: true,
        username: true,
        player_id: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        profile_img: true,
        createdAt: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  return (
    <SettingsClient
      user={{
        id: String(user.id),
        username: user.username,
        player_id: user.player_id,
        email: user.email,
        phone: user.phone || "",
        whatsapp: user.whatsapp || "",
        role: user.role,
        profile_img: user.profile_img,
      }}
      initialAdmins={admins.map((adm) => ({
        id: String(adm.id),
        username: adm.username,
        player_id: adm.player_id,
        email: adm.email,
        phone: adm.phone || "",
        whatsapp: adm.whatsapp || "",
        role: adm.role,
        status: "Active", // Custom UI status
        profile_img: adm.profile_img,
      }))}
    />
  );
}
