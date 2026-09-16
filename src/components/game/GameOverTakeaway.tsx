import { useGame } from './GameContext';
import { GameSection } from './GameSection';
import { CiteLink } from './CiteLink';
import { SOURCE_URLS } from '@/lib/sources';

export function GameOverTakeaway() {
  const { game } = useGame();
  const bs = game.getBlindSpotSummary();
  const breachCost = game.getEstimatedBreachCost();
  const tm = game.deploymentTurns.threatModel;
  const rm = game.deploymentTurns.reqMgmt;

  return (
    <GameSection title="What happened">
      <div className="space-y-3 text-sm">
        <p>
          <strong className="text-foreground">{game.attackLog.length}</strong> attacks in {game.turn} quarters.
          Real organizations see dozens per year (
          <CiteLink href={SOURCE_URLS['Verizon DBIR 2024']}>Verizon DBIR 2024</CiteLink>
          ).
        </p>
        <p>
          {game.totalBlocked} stopped. {game.totalContained} contained. {game.totalBreaches} got through.
          {game.totalBreaches > 0 && (
            <>
              {' '}Estimated loss <strong className="text-red-400">${breachCost}M</strong>
              {' '}(
              <CiteLink href={SOURCE_URLS['IBM Cost of a Data Breach 2024']}>IBM Cost of a Data Breach 2024</CiteLink>
              ).
            </>
          )}
        </p>
        {bs.blindSpotBreaches > 0 && (
          <p className="text-red-400">
            {bs.blindSpotBreaches} of those breaches hit a gap you had not identified yet.
          </p>
        )}
        {bs.totalFalsePositiveCost > 0 && (
          <p>
            ${bs.totalFalsePositiveCost}K went to unread-alert work. Tools without enough people.
          </p>
        )}
        <div className="pt-2 border-t border-border space-y-1 text-muted-foreground">
          <div className="font-semibold text-foreground">When the program stood up</div>
          <div>
            {tm
              ? `Risk assessment started ${game.getCalendarQuarter(tm)}`
              : 'Risk assessment never stood up'}
          </div>
          <div>
            {rm
              ? `Guidance for the team started ${game.getCalendarQuarter(rm)}`
              : 'Guidance never stood up'}
          </div>
        </div>
      </div>
    </GameSection>
  );
}
