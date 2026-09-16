import { useGame } from './GameContext';
import { Briefing } from './Briefing';
import { HowToPlay } from './HowToPlay';
import { Dashboard } from './Dashboard';
import { Report } from './Report';
import { GameOver } from './GameOver';
import { TitleScreen } from './TitleScreen';
import type { ReactNode } from 'react';

function Phase({ id, children }: { id: string; children: ReactNode }) {
  return <div key={id} className="ciso-phase">{children}</div>;
}

export function GameShell() {
  const { game, update } = useGame();

  if (!game.started) {
    return (
      <TitleScreen
        onStart={(turns) => {
          game.reset(turns);
          game.started = true;
          update();
        }}
      />
    );
  }

  switch (game.phase) {
    case 'briefing': return <Phase id="briefing"><Briefing onBegin={() => { game.phase = 'howto'; update(); }} /></Phase>;
    case 'howto':    return <Phase id="howto"><HowToPlay /></Phase>;
    case 'budget':   return <Phase id="budget"><Dashboard /></Phase>;
    case 'report':   return <Phase id="report"><Report /></Phase>;
    case 'gameover': return <Phase id="gameover"><GameOver /></Phase>;
    default:
      return <Phase id="briefing"><Briefing onBegin={() => { game.phase = 'howto'; update(); }} /></Phase>;
  }
}
