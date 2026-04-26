import type { Metadata } from "next";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export const metadata: Metadata = {
  title: "회원 정보",
};

export default function ProfileSettingsPage() {
  return <ProfileSettingsForm />;
}
