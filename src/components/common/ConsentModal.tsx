"use client";

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import type { ConsentContent } from "@/types/consent";

interface ConsentModalProps {
  content: ConsentContent;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ConsentModal({ content, checked, onChange }: ConsentModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-stone-200 bg-white px-3 py-3">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-700"
        />
        <span className="flex-1 text-sm leading-6 text-stone-800">
          <span className="font-semibold">{content.required ? "[필수]" : "[선택]"}</span>{" "}
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
            className="font-semibold underline underline-offset-4 hover:text-teal-800"
          >
            {content.title}
          </button>
        </span>
      </label>
      <Modal open={open} title={content.title} onClose={() => setOpen(false)}>
        <p className="whitespace-pre-line">{content.body}</p>
      </Modal>
    </div>
  );
}
