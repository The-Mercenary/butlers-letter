"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SOCIAL_PLATFORM_OPTIONS } from "@/lib/constants/cardOptions";
import type { SocialAccountInput } from "@/lib/validation/cardValidation";
import type { SocialPlatform } from "@/types/card";

interface SocialAccountsEditorProps {
  value: SocialAccountInput[];
  onChange: (accounts: SocialAccountInput[]) => void;
  error?: string;
}

export function SocialAccountsEditor({ value, onChange, error }: SocialAccountsEditorProps) {
  function update(index: number, nextAccount: SocialAccountInput) {
    onChange(value.map((account, accountIndex) => (accountIndex === index ? nextAccount : account)));
  }

  function remove(index: number) {
    onChange(value.filter((_, accountIndex) => accountIndex !== index));
  }

  return (
    <div className="space-y-3">
      {value.map((account, index) => (
        <div key={index} className="grid gap-2 rounded-md border border-stone-200 bg-white p-3 sm:grid-cols-[180px_1fr_auto]">
          <select
            className="input-base"
            value={account.platform}
            onChange={(event) => update(index, { ...account, platform: event.target.value as SocialPlatform })}
            aria-label="소셜 플랫폼"
          >
            {SOCIAL_PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            className="input-base"
            value={account.urlOrId}
            onChange={(event) => update(index, { ...account, urlOrId: event.target.value })}
            placeholder="URL 또는 ID"
            aria-label="URL 또는 ID"
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 px-3 text-stone-700 hover:bg-rose-50 hover:text-rose-700 sm:w-10"
            aria-label="소셜 계정 삭제"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        icon={<Plus size={17} />}
        onClick={() => onChange([...value, { platform: "instagram", urlOrId: "" }])}
      >
        소셜 계정 추가
      </Button>
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
