import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "로그인",
  description: "Butler's Letter 계정으로 로그인하고 내 매칭 카드를 관리하세요.",
};

export default function LoginPage() {
  return (
    <main className="container-page py-12 sm:py-16">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
