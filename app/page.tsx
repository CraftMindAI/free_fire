import { redirect } from "next/navigation";
import { getSessionUser } from "./lib/auth";
import { encryptId } from "./lib/encryption";
import HeroSection from "./components/HeroSection";
import UpcomingRooms from "./components/UpcomingRooms";
import FeaturesSection from "./components/FeaturesSection";
import DashboardSection from "./components/DashboardSection";
import FireShaderBackground from "./components/FireShaderBackground";

export default async function Home() {
  const user = await getSessionUser();

  if (user) {
    const encryptedId = encryptId(String(user.id));
    if (user.role.toLowerCase() === "admin") {
      redirect(`/profile/v2/dashboard/${encryptedId}/home`);
    } else {
      redirect(`/profile/v1/${encryptedId}/dashboard/home`);
    }
  }

  return (
    <>
      <FireShaderBackground />
      <div className="relative flex flex-col min-h-screen bg-transparent text-[#e5e2e1] overflow-x-hidden">
        <main className="flex-1">
          <HeroSection />
          <UpcomingRooms />
          <FeaturesSection />
          <DashboardSection />
        </main>
      </div>
    </>
  );
}
