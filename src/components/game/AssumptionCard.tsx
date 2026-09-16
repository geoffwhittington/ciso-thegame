import { CiteLink } from './CiteLink';
import { assumptionById, type AssumptionId } from '@/lib/assumptions';

export function AssumptionCard({ id, hideTitle }: { id: AssumptionId; hideTitle?: boolean }) {
  const a = assumptionById(id);
  if (!a) return null;
  const paired = a.citations.length === a.basis.length;
  return (
    <article className="space-y-6">
      {!hideTitle && (
        <h3 className="text-xl font-bold tracking-tight">{a.title}</h3>
      )}
      <section>
        <h4 className="text-xl font-bold mb-2">In this simulation</h4>
        <p className="text-lg text-muted-foreground leading-relaxed">{a.mechanic}</p>
      </section>
      <section className="pt-6 border-t border-border">
        <h4 className="text-xl font-bold mb-3">Published basis</h4>
        <ul className="space-y-3">
          {paired ? a.citations.map((c, i) => (
            <li key={c.url + i} className="rounded-xl border border-border bg-background/40 px-4 py-3.5">
              <p className="text-lg text-foreground leading-relaxed">{a.basis[i]}</p>
              <p className="mt-2">
                <CiteLink href={c.url} className="text-base">{c.label}</CiteLink>
              </p>
            </li>
          )) : (
            <li className="rounded-xl border border-border bg-background/40 px-4 py-3.5 space-y-2">
              {a.basis.map(text => (
                <p key={text} className="text-lg text-foreground leading-relaxed">{text}</p>
              ))}
              <div className="flex flex-col gap-1 pt-1">
                {a.citations.map(c => (
                  <CiteLink key={c.url} href={c.url} className="text-base">{c.label}</CiteLink>
                ))}
              </div>
            </li>
          )}
        </ul>
      </section>
    </article>
  );
}
