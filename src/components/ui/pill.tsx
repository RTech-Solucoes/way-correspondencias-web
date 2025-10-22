import { ReactNode } from 'react';

interface PillProps {
  children: ReactNode;
  title?: string;
}

export function Pill({ children, title }: PillProps) {
  return (
    <span
      title={title}
      className="inline-flex min-w-0 items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground/90"
    >
      <span className="truncate max-w-[160px]">{children}</span>
    </span>
  );
}
