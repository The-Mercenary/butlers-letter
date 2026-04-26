import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "회원가입",
  description: "Butler's Letter에서 나만의 인맥 카드를 만들고 목적 기반 추천을 준비해 보세요.",
};

export default function SignupPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <SignupForm />
    </main>
  );
}
