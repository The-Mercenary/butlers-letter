import type { Metadata } from "next";
import { CardDetail } from "@/components/cards/CardDetail";

export const metadata: Metadata = {
  title: "카드 상세",
};

export default function CardDetailPage({ params }: { params: { cardId: string } }) {
  return <CardDetail cardId={params.cardId} />;
}
