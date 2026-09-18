import { Component, type ErrorInfo, type ReactNode } from 'react';
import { clearGameSave } from '@/lib/gamePersist';

interface State {
  error: Error | null;
}

export class GameErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Game render failed', error, info);
  }

  resetGame = () => {
    clearGameSave();
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <section className="comic-card max-w-lg p-5 text-center">
          <h1 className="comic-heading text-2xl text-red-600">The game crashed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dev says the save file has achieved sentience. Reset it and try again.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{this.state.error.message}</p>
          <button type="button" className="comic-btn comic-btn-primary mt-4" onClick={this.resetGame}>
            Reset saved game
          </button>
        </section>
      </main>
    );
  }
}
