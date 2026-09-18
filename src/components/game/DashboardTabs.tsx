export type TabId = 'investments' | 'portfolio' | 'team' | 'infra' | 'log';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'investments', icon: '🔧', label: 'Investments' },
  { id: 'portfolio', icon: '📦', label: 'Portfolio' },
  { id: 'team', icon: '👥', label: 'Team' },
  { id: 'infra', icon: '🏗️', label: 'Infra' },
  { id: 'log', icon: '📋', label: 'Log' },
];

export function DashboardTabs({ active, onChange, counts }: {
  active: TabId;
  onChange: (id: TabId) => void;
  counts?: Partial<Record<TabId, number>>;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-nowrap -mx-2 px-2">
      {TABS.map(tab => {
        const isActive = active === tab.id;
        const count = counts?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all
              border-2 shrink-0 min-h-[44px]
              ${isActive
                ? 'border-foreground bg-card text-foreground shadow-[3px_3px_0_#1a1a2e]'
                : 'border-transparent bg-transparent text-muted-foreground hover:bg-card/60 hover:border-foreground/20'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className="comic-heading tracking-wide hidden sm:inline">{tab.label}</span>
            {count != null && count > 0 && (
              <span className="comic-badge comic-badge-red text-[9px] ml-0.5">{count > 9 ? '9+' : count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
