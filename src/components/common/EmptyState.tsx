import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface flex min-h-64 flex-col items-center justify-center rounded-lg px-6 py-12 text-center">
      <div className="mb-4 h-12 w-12 rounded-full border border-dashed border-teal-700/50 bg-teal-50" />
      <h2 className="text-lg font-bold text-stone-950">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
