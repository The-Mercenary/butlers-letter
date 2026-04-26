import type { CardPurpose } from "@/types/card";

export const CARD_PURPOSES: { id: CardPurpose; label: string; shortLabel: string; description: string }[] = [
  {
    id: "industry_network",
    label: "업계 네트워크",
    shortLabel: "업계 네트워크",
    description: "같은 업계 사람, 커리어 멘토, 업무 이야기를 나눌 사람을 만나고 싶어요.",
  },
  {
    id: "dating",
    label: "연애",
    shortLabel: "연애",
    description: "서로 호감을 느낄 수 있는 데이트 상대를 만나고 싶어요.",
  },
  {
    id: "local_friend",
    label: "동네친구",
    shortLabel: "동네친구",
    description: "가까운 지역에서 편하게 만날 수 있는 친구를 찾고 싶어요.",
  },
  {
    id: "hobby_buddy",
    label: "취미",
    shortLabel: "취미",
    description: "같은 취미를 함께 즐길 사람을 만나고 싶어요.",
  },
];

export const CARD_PURPOSE_IDS = CARD_PURPOSES.map((purpose) => purpose.id);

export function getCardPurposeLabel(value: CardPurpose | "") {
  return CARD_PURPOSES.find((purpose) => purpose.id === value)?.label ?? "목적 미설정";
}
