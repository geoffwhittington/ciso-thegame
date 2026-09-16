import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { GameEngine } from '@/lib/game';
import { clearGameSave, createEngine, saveGame } from '@/lib/gamePersist';

interface GameContextType {
  game: GameEngine;
  tick: number;
  update: () => void;
  startOver: () => void;
}

const GameContext = createContext<GameContextType>(null!);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game] = useState(() => createEngine());
  const [tick, setTick] = useState(0);

  const update = useCallback(() => {
    saveGame(game);
    setTick(t => t + 1);
  }, [game]);

  const startOver = useCallback(() => {
    clearGameSave();
    game.reset();
    setTick(t => t + 1);
  }, [game]);

  useEffect(() => {
    const persist = () => saveGame(game);
    window.addEventListener('beforeunload', persist);
    return () => {
      persist();
      window.removeEventListener('beforeunload', persist);
    };
  }, [game]);

  return <GameContext.Provider value={{ game, tick, update, startOver }}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
