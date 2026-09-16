import type { ReactNode } from 'react';
import { SectionHelp } from './SectionHelp';
import type { SectionHelpId } from '@/lib/sectionHelp';

export function GameSection({ title, help, hint, children, dashed }: {
  title: string;
  help?: SectionHelpId;
  hint?: ReactNode;
  children: ReactNode;
  dashed?: boolean;
}) {
  return (
    <section className={`overflow-hidden rounded-xl border bg-card ${dashed ? 'border-dashed border-border' : 'border-border'}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap bg-[#12294d] border-b-2 border-[#f15f24] px-4 py-2.5">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <div className="flex items-center gap-3 text-sm text-white/80">
          {hint != null && hint !== '' && hint}
          {help && <SectionHelp id={help} />}
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </section>
  );
}
