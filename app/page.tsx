import HeroSection from "./components/HeroSection";
import UpcomingRooms from "./components/UpcomingRooms";
import FeaturesSection from "./components/FeaturesSection";
import DashboardSection from "./components/DashboardSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#131313] text-[#e5e2e1] overflow-x-hidden">
      <main className="flex-1">
        <HeroSection />
        <UpcomingRooms />
        <FeaturesSection />
        <DashboardSection />
      </main>
    </div>
  );
}
