import { useState } from 'react';
import { Hud } from './Hud';
import { HudSpend } from './HudSpend';
import { AdvisorPanel } from './AdvisorPanel';
import { PortfolioPanel } from './PortfolioPanel';
import { InvestmentsPanel } from './InvestmentsPanel';
import { TeamPanel } from './TeamPanel';
import { InfraPanel } from './InfraPanel';
import { IncidentLogPanel } from './IncidentLogPanel';
import { EndQuarterConfirm } from './EndQuarterConfirm';
import { DashboardTabs, type TabId } from './DashboardTabs';
import { useGame } from './GameContext';
import { FlashOnChange } from './motion';

export function Dashboard() {
  const { game } = useGame();
  const avail = game.getAvailableBudget();
  const [tab, setTab] = useState<TabId>('investments');

  const uncoveredRisks = game.getUncoveredVisibleRisks().length;
  const tabCounts: Partial<Record<TabId, number>> = {};
  if (uncoveredRisks > 0) tabCounts.portfolio = uncoveredRisks;
  if (game.getAlertOverflow() > 0) tabCounts.team = 1;
  if (game.totalBreaches > 0) tabCounts.log = game.totalBreaches;

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 pb-8">
      {/* Sticky header: budget + quarter + end quarter */}
      <div className="comic-sticky-header sticky top-0 z-20 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2 mb-2">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className={`text-lg font-black tabular-nums leading-tight comic-heading ${avail < 0 ? 'text-red-600' : avail < 100 ? 'text-yellow-600' : 'text-emerald-600'}`}>
              <FlashOnChange value={avail}>${avail}K</FlashOnChange>
              <span className="ml-1.5 text-xs font-bold text-muted-foreground">{game.getCalendarQuarter()}</span>
            </div>
          </div>
          <EndQuarterConfirm />
        </div>
      </div>

      {/* Narrative status line */}
      <Hud />

      {/* Tabs */}
      <div className="mt-2 mb-3 border-b-2 border-foreground/10 pb-1.5">
        <DashboardTabs active={tab} onChange={setTab} counts={tabCounts} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div>
          {tab === 'investments' && <InvestmentsPanel />}
          {tab === 'portfolio' && <PortfolioPanel />}
          {tab === 'team' && <TeamPanel />}
          {tab === 'infra' && <InfraPanel />}
          {tab === 'log' && <IncidentLogPanel />}
        </div>
        <div className="space-y-3 hidden lg:block">
          <AdvisorPanel />
          <HudSpend />
        </div>
      </div>

      {/* Mobile: advisor + budget below main content */}
      <div className="lg:hidden space-y-3 mt-4">
        <AdvisorPanel />
        <HudSpend />
      </div>
    </div>
  );
}
