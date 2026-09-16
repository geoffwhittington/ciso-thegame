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
    <li className="rounded-lg border border-border bg-background/40 px-3 py-2">
      <div className="flex items-start gap-2.5">
        <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden>{mark}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {children && <div className="text-sm text-muted-foreground mt-0.5">{children}</div>}
        </div>
      </div>
    </li>
  );
}
