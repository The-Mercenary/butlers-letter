"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { CardPreview } from "@/components/cards/CardPreview";
import { EmptyState } from "@/components/common/EmptyState";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { toMatchingCard } from "@/lib/supabase/mappers";
import type { MatchingCard, MatchingCardRow } from "@/types/card";

export function CardGrid() {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCards() {
      if (!isSupabaseConfigured()) {
        setError("Supabase 환경변수를 설정하면 카드 목록을 불러올 수 있습니다.");
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

      const { data, error: cardsError } = await supabase
        .from("matching_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (cardsError) {
        setError(cardsError.message);
        setLoading(false);
        return;
      }

      setCards(((data ?? []) as MatchingCardRow[]).map(toMatchingCard));
      setLoading(false);
    }

    loadCards();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-teal-800">My cards</p>
          <h1 className="mt-2 text-3xl font-black text-stone-950">내 카드</h1>
        </div>
        <Link
          href="/dashboard/cards/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          <Plus size={18} />
          새 카드 만들기
        </Link>
      </div>

      {error ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-stone-200" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          title="아직 만든 카드가 없습니다."
          description="내 정보를 바탕으로 첫 번째 매칭 카드를 만들어 보세요."
          action={
            <Link href="/dashboard/cards/new" className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white">
              새 카드 만들기
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <CardPreview key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
