import HeroSection from "./components/HeroSection";
import UpcomingRooms from "./components/UpcomingRooms";
import FeaturesSection from "./components/FeaturesSection";
import DashboardSection from "./components/DashboardSection";
import FireShaderBackground from "./components/FireShaderBackground";

export default function Home() {
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
