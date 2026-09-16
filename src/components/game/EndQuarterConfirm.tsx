import { useGame } from './GameContext';
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DEFENSES } from '@/lib/data';
import { cn } from 'cn';

export function EndQuarterConfirm() {
  const { game, update } = useGame();
  const upgrades = Object.entries(game.pendingUpgrades).filter(([, n]) => n > 0);
  const hasAnything = upgrades.length > 0;
  const noThreatModel = game.threatModelLevel === 0 && !game.pendingUpgrades.threatModel;
  const overflow = game.getAlertOverflow();
  const fixes = game.getFixesThisQuarter();
  const cap = game.getFixCapacity();

  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ size: 'lg' }), 'px-10 font-bold')}>
        End Quarter →
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-w-lg">
          <DialogTitle>End {game.getCalendarQuarter()}?</DialogTitle>
          <div className="mt-4 space-y-3 text-sm">
            {hasAnything ? (
              <>
                <p className="text-muted-foreground">This quarter you're planning to:</p>
                <ul className="space-y-1.5">
                  {upgrades.map(([key, n]) => (
                    <li key={key} className="flex items-center gap-2">
                      <span>{DEFENSES[key].icon}</span>
                      <span>{n > 1 ? `${n}x ` : ''}{game.defenses[key] === 0 ? 'Deploy' : 'Upgrade'} {DEFENSES[key].name}</span>
                      <span className="ml-auto text-muted-foreground">${game.getPendingSetupCost(key)}K</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between pt-2 border-t border-border text-sm">
                  <span>Remaining reserves</span>
                  <span className={game.getAvailableBudget() < 100 ? 'text-yellow-200 font-bold' : 'text-emerald-300 font-bold'}>
                    ${game.getAvailableBudget()}K
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-200 text-sm">
                You haven't planned any investments this quarter.
                {noThreatModel && ' Controls you already own still apply generically. Residual risk stays at industry rates.'}
              </div>
            )}
            {cap > 0 && (
              <p className="text-muted-foreground">Staff will close {fixes} risk{fixes !== 1 ? 's' : ''} this quarter.</p>
            )}
            {overflow > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
                Staff cannot cover the alerts from the tools you have. Alerting tools will run one level weaker. Hire Security Staff.
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5 justify-end">
            <DialogClose className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Go Back</DialogClose>
            <DialogClose
              className={cn(buttonVariants({ size: 'sm' }))}
              onClick={() => { game.endQuarter(); update(); }}
            >
              Confirm
            </DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
