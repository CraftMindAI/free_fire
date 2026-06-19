import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import UpcomingRooms from "./components/UpcomingRooms";
import FeaturesSection from "./components/FeaturesSection";
import DashboardSection from "./components/DashboardSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#131313] text-[#e5e2e1] overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <UpcomingRooms />
        <FeaturesSection />
        <DashboardSection />
      </main>
      <Footer />
    </div>
  );
}
