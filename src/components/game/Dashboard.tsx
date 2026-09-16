import { Hud } from './Hud';
import { AdvisorPanel } from './AdvisorPanel';
import { PortfolioPanel } from './PortfolioPanel';
import { InvestmentsPanel } from './InvestmentsPanel';
import { EndQuarterConfirm } from './EndQuarterConfirm';
import { useGame } from './GameContext';
import { FlashOnChange } from './motion';

export function Dashboard() {
  const { game } = useGame();
  const avail = game.getAvailableBudget();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-8">
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2.5 mb-3 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">Left to spend this quarter</div>
            <div className={`text-xl font-bold tabular-nums leading-tight ${avail < 0 ? 'text-red-300' : avail < 100 ? 'text-yellow-200' : 'text-emerald-300'}`}>
              <FlashOnChange value={avail}>${avail}K</FlashOnChange>
              <span className="ml-2 text-xs font-semibold">{avail < 0 ? 'Overspent' : avail < 100 ? 'Tight' : 'Available'}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground tabular-nums shrink-0 hidden sm:block">{game.getCalendarQuarter()}</div>
          <EndQuarterConfirm />
        </div>
      </div>

      <div className="space-y-4">
        <Hud />
        <AdvisorPanel />
        <PortfolioPanel />
        <InvestmentsPanel />
      </div>
    </div>
  );
}
