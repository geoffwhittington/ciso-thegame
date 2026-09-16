import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from './GameContext';
import { PRODUCT_SCHEDULE } from '@/lib/products';

export function Briefing({ onBegin }: { onBegin: () => void }) {
  const { game, startOver } = useGame();
  const firstSystem = PRODUCT_SCHEDULE[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div className="flex justify-end">
        <button type="button" className="text-sm text-muted-foreground hover:text-foreground" onClick={startOver}>
          Start over
        </button>
      </div>
      <div className="text-center space-y-2">
        <span className="inline-block text-sm font-bold tracking-wide text-red-500 border border-red-500/40 px-4 py-1.5 rounded-sm">CONFIDENTIAL</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">CISO Briefing, Day One</h1>
        <p className="text-sm text-muted-foreground">NovaMind AI Inc.</p>
      </div>

      {/* Company Overview */}
      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="pt-5 space-y-4">
          <h2 className="text-base font-bold text-orange-400">About NovaMind</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            NovaMind is a <strong className="text-foreground">venture-backed AI SaaS company</strong> building enterprise AI products.
            The engineering team builds custom software and deploys on <strong className="text-foreground">multiple public clouds</strong>.
            The company ships code weekly, uses open-source machine-learning libraries, and is adding AI/LLM capabilities to the product line.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Valuation', value: `$${(game.companyValue / 1000).toFixed(0)}M` },
              { label: 'Revenue', value: `$${(game.revenue / 1000).toFixed(0)}M/q` },
              { label: 'Reputation', value: `${game.reputation}/100` },
              { label: 'Defenses', value: `${game.securityPosture}%`, accent: true },
            ].map(k => (
              <div key={k.label} className="bg-background/60 rounded-lg p-2.5 text-center">
                <div className={`text-xl font-extrabold tabular-nums ${k.accent ? 'text-red-400' : ''}`}>{k.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* First System */}
      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="pt-5 space-y-3">
          <h2 className="text-base font-bold text-orange-400">Your First System</h2>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{firstSystem.icon}</span>
            <div>
              <div className="font-semibold text-base">{firstSystem.name}</div>
              <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{firstSystem.desc}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            More systems will be added to your portfolio as the company grows. You don't control the roadmap. You secure it.
          </p>
        </CardContent>
      </Card>

      {/* The Challenge */}
      <Card className="bg-card/50 backdrop-blur">
        <CardContent className="pt-5 space-y-3">
          <h2 className="text-base font-bold text-orange-400">The Challenge</h2>
          <div className="text-center py-3 space-y-2">
            <div className="text-3xl">🔒</div>
            <p className="text-base font-bold">You don't know what you don't know.</p>
            <p className="text-sm text-muted-foreground">
              Your systems have real security gaps. Risk assessment, guidance, then the matching tools.
            </p>
          </div>
          <div className="text-center text-sm font-semibold text-orange-400 bg-orange-500/8 border border-orange-500/20 rounded-lg py-2.5">
            If reputation hits zero, the board fires you. Last {game.maxTurns} quarters
            ({game.getCalendarQuarter(1)} to {game.getCalendarQuarter(game.maxTurns)}) to reach {game.getWinLabel()}.
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-2 pb-6">
        <Button size="lg" className="text-base px-12 py-6 font-bold bg-orange-500 hover:bg-orange-600 text-white" onClick={onBegin}>
          Begin {game.getCalendarQuarter(1)} →
        </Button>
      </div>
    </div>
  );
}
