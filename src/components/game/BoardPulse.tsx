import { trustLabel, trustMeterFill } from '@/lib/narrativeLabels';
import { Avatar } from './Avatar';

export function BoardPulse({ reputation }: { reputation: number }) {
  const trust = trustLabel(reputation);

  return (
    <div className="hidden md:flex items-center gap-2 rounded-lg border-2 border-foreground/20 bg-card/70 px-2 py-1">
      <Avatar id="board" size="sm" />
      <div className="min-w-36">
        <div className="text-xs font-black uppercase tracking-wide text-muted-foreground">Victoria · Board pulse</div>
        <div className={`text-sm font-bold leading-tight ${trust.tone}`}>{trust.text}</div>
        <div className="h-1.5 rounded-full bg-muted/50 mt-1 overflow-hidden">
          <div
            className={`h-full rounded-full ${trustMeterFill(reputation)}`}
            style={{ width: `${Math.max(0, Math.min(100, reputation))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
