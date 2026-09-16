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
    <div className={`rounded-xl border px-4 py-4 ${box}`}>
      <div className="text-base text-muted-foreground">{k}</div>
      <div className={`text-2xl sm:text-3xl font-bold mt-1 tabular-nums ${value}`}>
        {tone === 'breach' && <span className="mr-2" aria-hidden>🚨</span>}
        {tone === 'clear' && <span className="mr-2" aria-hidden>✅</span>}
        {v}
      </div>
    </div>
  );
}

export function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 pt-6 border-t border-border">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
