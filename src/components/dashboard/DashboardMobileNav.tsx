"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Inbox, LogOut, Menu, Settings, X } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const menuItems = [
  { href: "/dashboard/cards", label: "내 카드", icon: CreditCard },
  { href: "/dashboard/received", label: "전달받은 카드", icon: Inbox },
  { href: "/dashboard/settings", label: "계정 설정", icon: Settings },
];

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="lg:hidden">
      <div className="mb-4 flex items-center justify-between rounded-lg border border-[color:var(--line)] bg-white px-4 py-3 shadow-sm">
        <Link href="/dashboard" className="font-bold text-stone-950">
          대시보드
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100"
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-stone-950/45">
          <div className="ml-auto flex h-full w-80 max-w-[85vw] flex-col bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="font-black text-stone-950">
                대시보드
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 hover:bg-stone-100"
                aria-label="메뉴 닫기"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold ${
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
              className="mt-6 flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
