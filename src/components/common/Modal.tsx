"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
  danger?: boolean;
}

export function Modal({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "닫기",
  onClose,
  onConfirm,
  danger = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 px-4 py-6 sm:items-center">
      <div className="surface w-full max-w-lg rounded-lg">
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--line)] px-5 py-4">
          <h2 className="text-lg font-bold text-stone-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-auto px-5 py-4 text-sm leading-6 text-stone-700">{children}</div>
        <div className="flex flex-col-reverse gap-2 border-t border-[color:var(--line)] px-5 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm ? (
            <Button type="button" variant={danger ? "danger" : "primary"} onClick={onConfirm}>
              {confirmLabel ?? "확인"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
