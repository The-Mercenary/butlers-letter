import type { Metadata } from "next";
import { CardGrid } from "@/components/cards/CardGrid";

export const metadata: Metadata = {
  title: "내 카드",
};

export default function CardsPage() {
  return <CardGrid />;
}
