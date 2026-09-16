import {
  Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose,
} from '@/components/ui/dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'cn';
import { ASSUMPTIONS, type AssumptionId } from '@/lib/assumptions';
import { AssumptionCard } from './AssumptionCard';

export function AssumptionsHelp({ topic, label = 'Research assumptions', triggerClass }: {
  topic?: AssumptionId;
  label?: string;
  triggerClass?: string;
}) {
  const rows = topic ? ASSUMPTIONS.filter(a => a.id === topic) : ASSUMPTIONS;
  const single = !!topic && rows.length === 1;

  return (
    <Dialog>
      <DialogTrigger className={triggerClass ?? 'text-sm text-brand underline-offset-4 hover:underline'}>
        {label}
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle>{single ? rows[0].title : 'Simulation assumptions'}</DialogTitle>
          <div className={single ? 'mt-6' : 'mt-6 space-y-10'}>
            {rows.map(a => (
              <AssumptionCard key={a.id} id={a.id} hideTitle={single} />
            ))}
          </div>
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
