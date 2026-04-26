import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "회원가입",
  description: "Butler's Letter에서 나만의 매칭 카드를 만들고 프라이빗 매칭 레터를 준비해 보세요.",
};

export default function SignupPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <SignupForm />
    </main>
  );
}
