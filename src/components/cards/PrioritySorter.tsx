"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";

interface PrioritySorterProps {
  items: string[];
  onChange: (items: string[]) => void;
  removable?: boolean;
  error?: string;
}

export function PrioritySorter({ items, onChange, removable = false, error }: PrioritySorterProps) {
  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  function remove(item: string) {
    onChange(items.filter((value) => value !== item));
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item} className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-100 text-xs font-black text-stone-700">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 text-sm font-semibold text-stone-800">{item}</span>
          <button
            type="button"
            onClick={() => move(index, -1)}
            disabled={index === 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-35"
            aria-label={`${item} 위로 이동`}
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => move(index, 1)}
            disabled={index === items.length - 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 disabled:opacity-35"
            aria-label={`${item} 아래로 이동`}
          >
            <ArrowDown size={16} />
          </button>
          {removable ? (
            <button
              type="button"
              onClick={() => remove(item)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 hover:bg-rose-50 hover:text-rose-700"
              aria-label={`${item} 삭제`}
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      ))}
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
