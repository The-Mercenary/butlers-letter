import Image from "next/image";
import Link from "next/link";
import { CARD_STATUS_LABELS } from "@/lib/constants/cardOptions";
import { getCardPurposeLabel } from "@/lib/constants/recommendationPurposes";
import type { MatchingCard } from "@/types/card";

interface CardPreviewProps {
  card: MatchingCard;
}

export function CardPreview({ card }: CardPreviewProps) {
  return (
    <Link href={`/dashboard/cards/${card.id}`} className="group block">
      <article className="surface aspect-[4/5] overflow-hidden rounded-lg transition group-hover:-translate-y-1 group-hover:shadow-md">
        <div className="relative h-3/5 bg-stone-100">
          {card.mainImageUrl ? (
            <Image src={card.mainImageUrl} alt={`${card.cardName} 대표 이미지`} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-stone-400">No image</div>
          )}
        </div>
        <div className="flex h-2/5 flex-col justify-between p-4">
          <div>
            <h2 className="truncate text-lg font-black text-stone-950">{card.cardName}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <p className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                {CARD_STATUS_LABELS[card.status]}
              </p>
              <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900">
                {getCardPurposeLabel(card.cardPurpose)}
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-500">자세히 보기</p>
        </div>
      </article>
    </Link>
  );
}
