import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import StoresSection from "@/components/StoresSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <StoresSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
