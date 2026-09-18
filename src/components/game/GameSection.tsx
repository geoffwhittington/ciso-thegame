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
    <section className={`comic-card-flat overflow-hidden ${dashed ? 'border-dashed' : ''}`}>
      <div className={`comic-section-header ${quiet ? 'opacity-95' : ''}`}>
        <h2>{title}</h2>
        <div className="flex items-center gap-3 text-sm text-white/80">
          {hint != null && hint !== '' && <span className="handwritten text-base">{hint}</span>}
          {help && (
            <SectionHelp
              id={help}
              label="?"
              triggerClass="text-sm text-white/70 hover:text-white underline-offset-4 hover:underline"
            />
          )}
        </div>
      </div>
      <div className="px-4 py-3 space-y-3 paper-texture">{children}</div>
    </section>
  );
}
