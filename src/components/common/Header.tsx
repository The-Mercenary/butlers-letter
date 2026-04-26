"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={user ? "/dashboard" : "/"} className="flex min-w-0 items-center gap-3" aria-label="버틀러스레터 홈">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-950 text-sm font-black text-white">
            BL
          </span>
          <span className="truncate text-base font-black tracking-[-0.01em] text-stone-950">버틀러스레터</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <Link
              href="/dashboard"
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                isDashboard ? "bg-teal-700 text-white" : "text-stone-800 hover:bg-stone-100"
              }`}
            >
              <LayoutDashboard size={17} />
              <span className="hidden sm:inline">내 대시보드</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">
                로그인
              </Link>
              <Link href="/signup" className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
