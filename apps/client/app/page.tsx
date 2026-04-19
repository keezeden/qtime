import { CtaSection } from "./_components/home/cta-section";
import { CompetitiveSnapshotSection } from "./_components/home/competitive-snapshot-section";
import { FeaturesSection } from "./_components/home/features-section";
import { HeroSection } from "./_components/home/hero-section";
import { MatchmakingSection } from "./_components/home/matchmaking-section";
import { SiteHeader } from "./_components/home/site-header";

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
