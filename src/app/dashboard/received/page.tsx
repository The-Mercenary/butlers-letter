import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/EmptyState";

export const metadata: Metadata = {
  title: "전달받은 카드",
};

export default function ReceivedPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-teal-800">Received</p>
        <h1 className="mt-2 text-3xl font-black text-stone-950">전달받은 카드</h1>
      </div>
      <EmptyState
        title="아직 전달받은 카드가 없습니다."
        description="내 카드를 완성하면, 추후 조건에 맞는 파트너 카드를 받아볼 수 있습니다."
        action={
          <Link href="/dashboard/cards/new" className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white">
            내 카드 만들기
          </Link>
        }
      />
    </div>
  );
}
