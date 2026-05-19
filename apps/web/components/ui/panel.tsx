import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = "" }: PanelProps) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-panel ${className}`.trim()}>{children}</section>;
}
