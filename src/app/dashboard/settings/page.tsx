import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "계정 설정",
};

const settings = [
  { href: "/dashboard/settings/profile", title: "회원 정보", description: "이름, 휴대전화번호, 거주지, 태어난 시간을 확인하고 수정합니다." },
  { href: "/dashboard/settings/delete-account", title: "회원 탈퇴", description: "계정과 연결 데이터를 삭제하는 흐름을 확인합니다." },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-teal-800">Settings</p>
        <h1 className="mt-2 text-3xl font-black text-stone-950">계정 설정</h1>
      </div>
      <div className="space-y-3">
        {settings.map((item) => (
          <Link key={item.href} href={item.href} className="surface flex items-center justify-between gap-4 rounded-lg p-5 transition hover:bg-stone-50">
            <span>
              <span className="block text-lg font-black text-stone-950">{item.title}</span>
              <span className="mt-1 block text-sm leading-6 text-stone-600">{item.description}</span>
            </span>
            <ChevronRight className="shrink-0 text-stone-400" size={22} />
          </Link>
        ))}
      </div>
    </div>
  );
}
