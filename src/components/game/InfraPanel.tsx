import { useGame } from './GameContext';
import { GameSection } from './GameSection';
import { DEFENSES, MAX_DEFENSE_LEVEL } from '@/lib/data';

function InfraMeter({ level, max, fill }: { level: number; max: number; fill: string }) {
  return (
    <div className="flex gap-0.5 mt-1">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`h-2.5 flex-1 rounded border border-foreground/20 ${i < level ? fill : 'bg-muted/30'}`} />
      ))}
    </div>
  );
}

export function InfraPanel() {
  const { game } = useGame();
  const deployed = Object.entries(DEFENSES)
    .filter(([k]) => (game.defenses[k] || 0) > 0)
    .sort((a, b) => (game.defenses[b[0]] || 0) - (game.defenses[a[0]] || 0));

  const pending = Object.entries(game.pendingUpgrades).filter(([, n]) => n > 0);
  const guidanceLevel = game.getGuidanceLevel();
  const posture = game.securityPosture;

  return (
    <GameSection title="🏗️ Infrastructure">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="stat-card stat-card-teal">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Deployed Controls</div>
          <div className="text-xl font-black comic-heading mt-1">{deployed.length}</div>
        </div>
        <div className="stat-card stat-card-yellow">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Guidance Level</div>
          <div className="text-xl font-black comic-heading mt-1">{guidanceLevel > 0 ? `Lv${guidanceLevel}` : 'None'}</div>
          <div className="text-xs text-muted-foreground">{guidanceLevel > 0 ? 'TM + Requirements aligned' : 'Controls are generic'}</div>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-black uppercase tracking-wider text-muted-foreground comic-heading mb-1">📦 Deploying This Quarter</div>
          <div className="flex flex-wrap gap-2">
            {pending.map(([k, n]) => (
              <span key={k} className="comic-badge comic-badge-yellow">
                {DEFENSES[k].name} +{n}
              </span>
            ))}
          </div>
        </div>
      )}

      {deployed.length === 0 ? (
        <p className="text-sm text-muted-foreground handwritten">No controls deployed yet. Head to Investments to start building your defense stack.</p>
      ) : (
        <div className="space-y-2">
          {deployed.map(([k, def]) => {
            const level = game.defenses[k] || 0;
            const eff = game.getEffectiveDefenseLevel(k);
            const degraded = eff < level;
            const fill = degraded ? 'bg-yellow-500' : 'bg-emerald-500';
            return (
              <div key={k} className={`flex items-center gap-3 py-1.5 border-b-2 border-dashed border-foreground/10 ${degraded ? 'opacity-80' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate">{def.name}</span>
                    {degraded && <span className="comic-badge comic-badge-yellow text-[9px]">⚠️ Degraded</span>}
                  </div>
                  <InfraMeter level={eff} max={MAX_DEFENSE_LEVEL} fill={fill} />
                </div>
                <div className="text-sm font-black tabular-nums shrink-0 comic-heading">
                  Lv{eff}{degraded ? `/${level}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 stat-card stat-card-blue">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">🔒 Security Posture</div>
            <div className="text-xl font-black comic-heading mt-1">{posture}/100</div>
          </div>
          <div className="w-24">
            <div className="comic-meter">
              <div className={`comic-meter-fill ${posture >= 60 ? 'bg-emerald-500' : posture >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${posture}%` }} />
            </div>
          </div>
        </div>
      </div>
    </GameSection>
  );
}
