import {
  Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { SECTION_HELP, type SectionHelpId } from '@/lib/sectionHelp';
import { AssumptionsHelp } from './AssumptionsHelp';

const HEADER_TRIGGER = 'text-sm text-white underline-offset-4 hover:underline';

export function SectionHelp({ id, label = 'About this panel', triggerClass }: {
  id: SectionHelpId;
  label?: string;
  triggerClass?: string;
}) {
  const s = SECTION_HELP[id];
  return (
    <Dialog>
      <DialogTrigger className={triggerClass ?? HEADER_TRIGGER}>
        {label}
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>{s.title}</DialogTitle>
          <section className="mt-8 pt-6 border-t border-border">
            <h3 className="text-xl font-bold mb-2">What this means</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{s.interpret}</p>
          </section>
          <section className="mt-8 pt-6 border-t border-border">
            <h3 className="text-xl font-bold mb-2">What you can do</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">{s.act}</p>
          </section>
          {s.topic && (
            <p className="mt-6">
              <AssumptionsHelp
                topic={s.topic}
                label="Research sources"
                triggerClass="text-lg text-brand underline-offset-4 hover:underline"
              />
            </p>
          )}
          <div className="flex justify-end mt-8">
            <DialogClose className={cn(buttonVariants({ size: 'lg' }), 'text-lg px-8')}>
              Close
            </DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
