import type { ReactNode } from 'react';
import { SectionHelp } from './SectionHelp';
import type { SectionHelpId } from '@/lib/sectionHelp';

export function GameSection({ title, help, hint, children, dashed, quiet }: {
  title: string;
  help?: SectionHelpId;
  hint?: ReactNode;
  children: ReactNode;
  dashed?: boolean;
  quiet?: boolean;
}) {
  return (
    <section className={`overflow-hidden rounded-xl border bg-card ${dashed ? 'border-dashed border-border' : 'border-border'}`}>
      <div className={`flex items-center justify-between gap-3 flex-wrap px-4 ${
        quiet
          ? 'py-2 border-b border-border bg-muted/20'
          : 'py-2.5 bg-[#12294d] border-b-2 border-[#f15f24]'
      }`}>
        <h2 className={`text-base font-bold ${quiet ? 'text-foreground' : 'text-white'}`}>{title}</h2>
        <div className={`flex items-center gap-3 text-sm ${quiet ? 'text-muted-foreground' : 'text-white/80'}`}>
          {hint != null && hint !== '' && hint}
          {help && (
            <SectionHelp
              id={help}
              label="?"
              triggerClass={quiet
                ? 'text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline'
                : 'text-sm text-white/70 hover:text-white underline-offset-4 hover:underline'}
            />
          )}
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </section>
  );
}
