import type { Metadata } from "next";
import { CardForm } from "@/components/cards/CardForm";

export const metadata: Metadata = {
  title: "새 카드 생성",
};

export default function NewCardPage() {
  return <CardForm mode="create" />;
}
