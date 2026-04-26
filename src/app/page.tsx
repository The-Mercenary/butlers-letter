import type { Metadata } from "next";
import { CTASection } from "@/components/home/CTASection";
import { HeroSection } from "@/components/home/HeroSection";
import { IntroSection } from "@/components/home/IntroSection";
import { PricingConceptSection } from "@/components/home/PricingConceptSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { TrustSection } from "@/components/home/TrustSection";

export const metadata: Metadata = {
  title: "Butler's Letter | 결혼을 전제로 한 프라이빗 매칭 레터",
  description: "Butler's Letter는 결혼을 진지하게 생각하는 사람들을 위한 프라이빗 프로필 기반 매칭 레터 서비스입니다.",
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <IntroSection />
      <TrustSection />
      <ProcessSection />
      <PricingConceptSection />
      <CTASection />
    </main>
  );
}
