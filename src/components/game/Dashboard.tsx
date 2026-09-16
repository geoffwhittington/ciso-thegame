import { useGame } from './GameContext';
import { Hud } from './Hud';
import { ThreatLandscape } from './ThreatLandscape';
import { AdvisorPanel } from './AdvisorPanel';
import { PortfolioPanel } from './PortfolioPanel';
import { InvestmentsPanel } from './InvestmentsPanel';
import { EndQuarterConfirm } from './EndQuarterConfirm';
import { Q1Lesson } from './Q1Lesson';
import { AnticipatedRisks } from './AnticipatedRisks';

export function Dashboard() {
  const { game } = useGame();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Hud />

      {game.turn === 1 && <Q1Lesson />}

      <AdvisorPanel />

      <AnticipatedRisks />

      <ThreatLandscape />
      <PortfolioPanel />
      <InvestmentsPanel />

      <div className="text-center py-4">
        <EndQuarterConfirm />
      </div>
    </div>
  );
}
