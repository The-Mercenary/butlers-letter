import type { Metadata } from "next";
import { CTASection } from "@/components/home/CTASection";
import { HeroSection } from "@/components/home/HeroSection";
import { IntroSection } from "@/components/home/IntroSection";
import { PricingConceptSection } from "@/components/home/PricingConceptSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { TrustSection } from "@/components/home/TrustSection";

export const metadata: Metadata = {
  title: "Butler's Letter | 프라이빗 인맥 추천 서비스",
  description: "Butler's Letter는 원하는 목적에 맞는 사람을 신중하게 추천받고, 서로 동의한 경우에만 연락처를 공개하는 서비스입니다.",
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
