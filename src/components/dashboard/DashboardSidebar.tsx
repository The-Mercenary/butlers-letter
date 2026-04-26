"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreditCard, Inbox, LogOut, Settings } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const menuItems = [
  { href: "/dashboard/cards", label: "내 카드", icon: CreditCard },
  { href: "/dashboard/received", label: "전달받은 카드", icon: Inbox },
  { href: "/dashboard/settings", label: "계정 설정", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 rounded-lg border border-[color:var(--line)] bg-white p-3 shadow-sm lg:block">
      <Link href="/dashboard" className="mb-3 block rounded-md px-3 py-3 text-sm font-bold text-stone-950 hover:bg-stone-100">
        대시보드 홈
      </Link>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                active ? "bg-teal-50 text-teal-900" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
      >
        <LogOut size={18} />
        로그아웃
      </button>
    </aside>
  );
}
