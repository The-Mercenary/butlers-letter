"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { FormField } from "@/components/common/FormField";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isEmail } from "@/lib/validation/authValidation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verificationRequired = searchParams.get("verification") === "required";
  const missingConfig = searchParams.get("config") === "missing" || !isSupabaseConfigured();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (missingConfig) {
      setError("Supabase 환경변수를 설정한 뒤 로그인할 수 있습니다.");
      return;
    }

    if (!isEmail(email)) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }

    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (signInError) {
      const message = signInError.message.toLowerCase().includes("email not confirmed")
        ? "이메일 인증을 완료한 뒤 로그인해 주세요."
        : "이메일 또는 비밀번호를 확인해 주세요.";
      setError(message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="surface mx-auto w-full max-w-md rounded-lg p-6 sm:p-8">
      <div className="mb-7">
        <p className="text-sm font-bold text-teal-800">Login</p>
        <h1 className="mt-2 text-3xl font-black text-stone-950">로그인</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">내 카드와 계정 정보를 관리하려면 로그인해 주세요.</p>
      </div>

      {verificationRequired ? (
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          이메일 인증이 필요한 계정입니다. Supabase 인증 메일의 링크를 먼저 열어 주세요.
        </div>
      ) : null}

      {missingConfig ? (
        <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900">
          Supabase 환경변수가 아직 설정되지 않았습니다. `.env.local`을 준비하면 인증 기능이 동작합니다.
        </div>
      ) : null}

      <div className="space-y-4">
        <FormField
          id="email"
          label="이메일 주소"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <FormField
          id="password"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </div>

      {error ? <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

      <div className="mt-6 flex flex-col gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "로그인 중" : "로그인"}
        </Button>
        <Link
          href="/signup"
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
        >
          회원가입으로 이동
        </Link>
      </div>
    </form>
  );
}
