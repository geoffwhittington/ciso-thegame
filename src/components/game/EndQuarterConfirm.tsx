import { useGame } from './GameContext';
import { Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DEFENSES } from '@/lib/data';
import { PersonaMessage } from './PersonaMessage';
import { getLine } from '@/lib/personas';

export function EndQuarterConfirm() {
  const { game, update } = useGame();
  const upgrades = Object.entries(game.pendingUpgrades).filter(([, n]) => n > 0);
  const hasAnything = upgrades.length > 0;
  const overflow = game.getAlertOverflow();
  const fixes = game.getFixesThisQuarter();
  const cap = game.getFixCapacity();

  return (
    <Dialog>
      <DialogTrigger className="comic-btn comic-btn-primary text-base shrink-0">
        End Quarter →
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="max-w-md comic-card-flat p-4 sm:p-5">
          <DialogTitle className="comic-heading text-xl text-brand">End {game.getCalendarQuarter()}?</DialogTitle>

          <PersonaMessage id="board" line={getLine('board', 'end_quarter', game.turn)} compact />

          <div className="mt-3 space-y-2 text-sm">
            {hasAnything ? (
              <ul className="space-y-1.5">
                {upgrades.map(([key, n]) => (
                  <li key={key} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-muted/30">
                    <span className="flex-1 font-bold">{n > 1 ? `${n}x ` : ''}{DEFENSES[key].name}</span>
                    <span className="font-black tabular-nums">${game.getPendingSetupCost(key)}K</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg bg-muted/30 px-3 py-2 text-muted-foreground handwritten">
                No new investments this quarter.
              </div>
            )}
            {cap > 0 && <p className="text-muted-foreground">Staff close {fixes} risk{fixes !== 1 ? 's' : ''}.</p>}
            {overflow > 0 && <p className="text-red-600 font-bold">Alert overload — tools weakened.</p>}
          </div>

          <div className="flex gap-2 mt-4 justify-end">
            <DialogClose className="comic-btn comic-btn-secondary text-sm">Back</DialogClose>
            <DialogClose className="comic-btn comic-btn-primary text-sm" onClick={() => { game.endQuarter(); update(); }}>
              Confirm →
            </DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
