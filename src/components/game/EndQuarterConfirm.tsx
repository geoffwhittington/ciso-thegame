import { useGame } from './GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DEFENSES } from '@/lib/data';

export function EndQuarterConfirm() {
  const { game, update } = useGame();
  const upgrades = Object.entries(game.pendingUpgrades).filter(([, n]) => n > 0);
  const mitigations = game.pendingMitigations;
  const hasAnything = upgrades.length > 0 || mitigations.length > 0;
  const noThreatModel = game.threatModelLevel === 0 && !game.pendingUpgrades.threatModel;
  const overflow = game.getAlertOverflow();

  return (
    <Dialog>
      <DialogTrigger render={<Button size="lg" className="px-10 font-bold" />}>
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
                  {mitigations.map(m => (
                    <li key={`${m.productId}-${m.weaknessKey}`} className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Implement controls on {m.weaknessKey}</span>
                      <span className="ml-auto text-muted-foreground">{game.getMitigationHours(m.weaknessKey)}h</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between pt-2 border-t border-border text-sm">
                  <span>Remaining reserves</span>
                  <span className={game.getAvailableBudget() < 100 ? 'text-yellow-400 font-bold' : 'text-green-400 font-bold'}>
                    ${game.getAvailableBudget()}K
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm">
                You haven't planned any investments this quarter.
                {noThreatModel && ' You have not assessed which systems are vulnerable, or how likely attacks are.'}
              </div>
            )}
            {overflow > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                Staff cannot cover the alerts from the tools you have. Hire Security Staff before you continue.
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5 justify-end">
            <DialogClose render={<Button variant="outline" size="sm" />}>Go Back</DialogClose>
            <DialogClose render={<Button size="sm" onClick={() => { game.endQuarter(); update(); }} />}>Confirm</DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
