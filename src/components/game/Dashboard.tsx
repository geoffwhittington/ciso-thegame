import { Hud } from './Hud';
import { AdvisorPanel } from './AdvisorPanel';
import { PortfolioPanel } from './PortfolioPanel';
import { InvestmentsPanel } from './InvestmentsPanel';
import { EndQuarterConfirm } from './EndQuarterConfirm';

export function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      <Hud />
      <AdvisorPanel />
      <PortfolioPanel />
      <InvestmentsPanel />
      <div className="text-center py-4">
        <EndQuarterConfirm />
      </div>
    </div>
  );
}
