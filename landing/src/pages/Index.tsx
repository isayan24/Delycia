import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustedBy from "@/components/TrustedBy";
import ProblemSection from "@/components/ProblemSection";
import OperationalFlow from "@/components/OperationalFlow";
import FeaturesGrid from "@/components/FeaturesGrid";
import InterfaceShowcase from "@/components/InterfaceShowcase";
import RealTimeOperations from "@/components/RealTimeOperations";
import SaaSArchitecture from "@/components/SaaSArchitecture";
import SecurityAuth from "@/components/SecurityAuth";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import MultiDevice from "@/components/MultiDevice";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import HeroSection2 from "@/components/HeroSection2";

const Index = () => (
  <div className="bg-white min-h-screen antialiased text-[#111111] selection:bg-[#FF5A00]/10 selection:text-[#FF5A00]">
    <Navbar />
    <HeroSection />
    <HeroSection2/>
    <ProblemSection />
    <OperationalFlow />
    <FeaturesGrid />
    <InterfaceShowcase />
    <RealTimeOperations />
    <SaaSArchitecture />
    <SecurityAuth />
    <AnalyticsDashboard />
    <MultiDevice />
    <PricingSection />
    <FAQSection />
    <FinalCTA />
    <Footer />
  </div>
);

export default Index;
