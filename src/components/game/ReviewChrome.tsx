import type { ReactNode } from 'react';

export function ReviewStat({ k, v, tone }: { k: string; v: string; tone?: 'breach' | 'clear' | 'limited' }) {
  const bg =
    tone === 'breach' ? 'stat-card-coral' :
    tone === 'clear' ? 'stat-card-green' :
    tone === 'limited' ? 'stat-card-yellow' :
    'stat-card-blue';
  return (
    <div className={`stat-card ${bg}`}>
      <div className="text-xs font-bold uppercase tracking-wider opacity-70">{k}</div>
      <div className="text-lg font-black mt-0.5 tabular-nums comic-heading">
        {tone === 'breach' && <span className="mr-1.5" aria-hidden>🚨</span>}
        {tone === 'clear' && <span className="mr-1.5" aria-hidden>✅</span>}
        {v}
      </div>
    </div>
  );
}

export function ReviewBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-3 pt-3 border-t-2 border-dashed border-border/30">
      <h2 className="text-sm font-black mb-1.5 comic-heading uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}
