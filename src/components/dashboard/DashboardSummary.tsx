"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toMatchingCard, toUserProfile } from "@/lib/supabase/mappers";
import type { MatchingCardRow } from "@/types/card";
import type { UserProfileRow } from "@/types/user";

interface SummaryState {
  name: string;
  total: number;
  draft: number;
  active: number;
  received: number;
}

export function DashboardSummary() {
  const [summary, setSummary] = useState<SummaryState>({
    name: "",
    total: 0,
    draft: 0,
    active: 0,
    received: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      if (!isSupabaseConfigured()) {
        setError("Supabase 환경변수를 설정하면 대시보드 데이터를 불러올 수 있습니다.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: profileData }, { data: cardsData, error: cardsError }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>(),
        supabase.from("matching_cards").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      ]);

      if (cardsError) {
        setError(cardsError.message);
        setLoading(false);
        return;
      }

      const profile = profileData ? toUserProfile(profileData) : null;
      const cards = ((cardsData ?? []) as MatchingCardRow[]).map(toMatchingCard);

      setSummary({
        name: profile?.name ?? String(user.user_metadata?.name ?? "회원"),
        total: cards.length,
        draft: cards.filter((card) => card.status === "draft").length,
        active: cards.filter((card) => card.status === "active").length,
        received: 0,
      });
      setLoading(false);
    }

    loadSummary();
  }, []);

  const items = [
    ["내 카드 개수", summary.total],
    ["작성 중 카드 개수", summary.draft],
    ["참여 중 카드 개수", summary.active],
    ["전달받은 카드 개수", summary.received],
  ];

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6 sm:p-8">
        <p className="text-sm font-bold text-teal-800">Welcome</p>
        <h1 className="mt-2 text-3xl font-black text-stone-950">{loading ? "대시보드를 준비하고 있습니다" : `${summary.name}님, 환영합니다.`}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">내 매칭 카드와 계정 정보를 이곳에서 관리할 수 있습니다.</p>
        <Link
          href="/dashboard/cards/new"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          <Plus size={18} />
          새 카드 만들기
        </Link>
      </section>

      {error ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <article key={String(label)} className="surface rounded-lg p-5">
            <p className="text-sm font-semibold text-stone-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-stone-950">{loading ? "-" : value}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
