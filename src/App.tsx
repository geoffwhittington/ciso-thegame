import { useEffect, useState } from 'react';
import { GameProvider } from '@/components/game/GameContext';
import { GameShell } from '@/components/game/GameShell';
import { HypothesisLab } from '@/components/lab/HypothesisLab';

function pageFromHash() {
  return window.location.hash.replace(/^#\/?/, '') === 'lab' ? 'lab' : 'game';
}

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <GameProvider>
      {page === 'lab' ? (
        <HypothesisLab />
      ) : (
        <div className="min-h-screen bg-background text-foreground">
          <GameShell />
        </div>
      )}
    </GameProvider>
  );
}
