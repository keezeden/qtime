import { CtaSection } from "./components/home/cta-section";
import { CompetitiveSnapshotSection } from "./components/home/competitive-snapshot-section";
import { FeaturesSection } from "./components/home/features-section";
import { HeroSection } from "./components/home/hero-section";
import { MatchmakingSection } from "./components/home/matchmaking-section";
import { SiteHeader } from "./components/home/site-header";

export default function Home() {
  return (
    <main className="flex flex-col">
      <SiteHeader />
      <HeroSection />
      <FeaturesSection />
      <MatchmakingSection />
      <CompetitiveSnapshotSection />
      <CtaSection />
    </main>
  );
}
