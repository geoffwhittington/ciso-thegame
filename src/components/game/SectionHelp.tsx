import {
  Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
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
        <DialogPopup className="max-w-md">
          <DialogTitle>{s.title}</DialogTitle>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Interpretation</dt>
              <dd className="mt-1 leading-relaxed">{s.interpret}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</dt>
              <dd className="mt-1 leading-relaxed">{s.act}</dd>
            </div>
          </dl>
          {s.topic && (
            <p className="mt-4">
              <AssumptionsHelp topic={s.topic} label="Research sources" />
            </p>
          )}
          <div className="flex justify-end mt-5">
            <DialogClose className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm">
              Close
            </DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
