import {
  Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
import { ASSUMPTIONS, type AssumptionId } from '@/lib/assumptions';
import { AssumptionCard } from './AssumptionCard';

export function AssumptionsHelp({ topic, label = 'Research assumptions', triggerClass }: {
  topic?: AssumptionId;
  label?: string;
  triggerClass?: string;
}) {
  const rows = topic ? ASSUMPTIONS.filter(a => a.id === topic) : ASSUMPTIONS;

  return (
    <Dialog>
      <DialogTrigger className={triggerClass ?? 'text-sm text-brand underline-offset-4 hover:underline'}>
        {label}
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogTitle>{topic ? rows[0]?.title ?? 'Sources' : 'Simulation assumptions'}</DialogTitle>
          <div className="mt-4 space-y-3">
            {rows.map(a => <AssumptionCard key={a.id} id={a.id} />)}
          </div>
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
