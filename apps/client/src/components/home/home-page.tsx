import { CtaSection } from "./cta-section";
import { FeaturesSection } from "./features-section";
import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { TestimonialsSection } from "./testimonials-section";
import { TopNav } from "./top-nav";

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0e14] font-sans text-[#f3deff] selection:bg-[#26fedc] selection:text-[#ddfff5]">
      <TopNav />
      <main className="overflow-x-hidden pt-24">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
