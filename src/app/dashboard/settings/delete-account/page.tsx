import type { Metadata } from "next";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";

export const metadata: Metadata = {
  title: "회원 탈퇴",
};

export default function DeleteAccountPage() {
  return <DeleteAccountSection />;
}
