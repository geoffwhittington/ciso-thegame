import type { ReactNode } from 'react';

export function ReviewStat({ k, v, tone }: { k: string; v: string; tone?: 'breach' | 'clear' | 'limited' }) {
  const box =
    tone === 'breach' ? 'border-red-500/60 bg-red-500/10' :
    tone === 'clear' ? 'border-emerald-500/60 bg-emerald-500/10' :
    tone === 'limited' ? 'border-amber-400/50 bg-amber-400/10' :
    'border-border';
  const value =
    tone === 'breach' ? 'text-red-300' :
    tone === 'clear' ? 'text-emerald-300' :
    tone === 'limited' ? 'text-amber-200' :
    '';
  return (
    <div className={`rounded-lg border px-3 py-2 ${box}`}>
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className={`text-lg font-bold mt-0.5 tabular-nums ${value}`}>
        {tone === 'breach' && <span className="mr-1.5" aria-hidden>🚨</span>}
        {tone === 'clear' && <span className="mr-1.5" aria-hidden>✅</span>}
        {v}
      </div>
    </div>
  );
}

export function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-3 pt-3 border-t border-border">
      <h2 className="text-sm font-bold mb-1.5">{title}</h2>
      {children}
    </section>
  );
}
