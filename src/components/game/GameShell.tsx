import { useGame } from './GameContext';
import { Briefing } from './Briefing';
import { Dashboard } from './Dashboard';
import { Report } from './Report';
import { GameOver } from './GameOver';
import { TitleScreen } from './TitleScreen';

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
    case 'briefing': return <Briefing onBegin={() => { game.phase = 'budget'; update(); }} />;
    case 'budget':   return <Dashboard />;
    case 'report':   return <Report />;
    case 'gameover': return <GameOver />;
    default:         return null;
  }
}
