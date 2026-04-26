import type { Metadata } from "next";
import { CardForm } from "@/components/cards/CardForm";

export const metadata: Metadata = {
  title: "카드 수정",
};

export default function EditCardPage({ params }: { params: { cardId: string } }) {
  return <CardForm mode="edit" cardId={params.cardId} />;
}
