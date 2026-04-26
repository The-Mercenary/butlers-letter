import type { Metadata } from "next";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function DashboardPage() {
  return <DashboardSummary />;
}
