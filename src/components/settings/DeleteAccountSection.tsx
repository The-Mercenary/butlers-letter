"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function deleteAccount() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/account/delete", {
      method: "DELETE",
    });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setLoading(false);
      setMessage(payload?.message ?? "회원 탈퇴 처리에 실패했습니다.");
      return;
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    router.push("/");
    router.refresh();
  }

  return (
    <section className="surface rounded-lg p-5 sm:p-6">
      <p className="text-sm font-bold text-rose-700">Delete account</p>
      <h1 className="mt-2 text-3xl font-black text-stone-950">회원 탈퇴</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        탈퇴 시 계정 정보, 생성한 카드, 업로드한 이미지가 삭제됩니다. Supabase Auth 사용자 삭제는 서버 API 또는 Edge Function처럼
        관리자 권한이 있는 경로에서 처리합니다.
      </p>
      {message ? <p className="mt-5 rounded-md bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{message}</p> : null}
      <Button type="button" variant="danger" className="mt-6" onClick={() => setOpen(true)}>
        회원 탈퇴 진행
      </Button>
      <Modal
        open={open}
        title="회원 탈퇴"
        danger
        confirmLabel={loading ? "처리 중" : "탈퇴"}
        onClose={() => setOpen(false)}
        onConfirm={loading ? undefined : deleteAccount}
      >
        회원 탈퇴 시 계정 정보, 생성한 카드, 업로드한 이미지가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
      </Modal>
    </section>
  );
}
