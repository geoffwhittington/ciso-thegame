import type { ReactNode } from 'react';

export function ReportRow({
  mark,
  title,
  children,
}: {
  mark: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <li className="rounded-xl border border-border bg-background/40 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5 shrink-0" aria-hidden>{mark}</span>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          {children && <div className="text-base text-muted-foreground mt-1">{children}</div>}
        </div>
      </div>
    </li>
  );
}
