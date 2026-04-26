import type { ReactNode } from "react";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { requireUser } from "@/lib/auth/requireUser";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className="container-page py-6 sm:py-8">
      <DashboardMobileNav />
      <div className="flex gap-6">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
