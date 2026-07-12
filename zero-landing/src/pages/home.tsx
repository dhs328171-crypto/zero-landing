import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FeaturedProjectsSection } from "@/components/home/FeaturedProjectsSection";
import { TechStackSection } from "@/components/home/TechStackSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { BlogSection } from "@/components/home/BlogSection";
import { CTASection } from "@/components/home/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <FeaturedProjectsSection />
      <TechStackSection />
      <WhyUsSection />
      <ProcessSection />
      <TestimonialsSection />
      <BlogSection />
      <CTASection />
      <Footer />
    </div>
  );
}