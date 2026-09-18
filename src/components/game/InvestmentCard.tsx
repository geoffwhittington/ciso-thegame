import { useState } from 'react';
import { DEFENSES } from '@/lib/data';
import { DefenseRow } from './DefenseRow';
import type { GameEngine } from '@/lib/game';

export interface InvestmentCategory {
  id: string;
  icon: string;
  title: string;
  question: string;
  quip: string;
  keys: string[];
}

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  { id: 'people', icon: '👥', title: 'People', question: "Who's on your team?", quip: "Dev: Tools don't investigate themselves. Marcus remains unconvinced.", keys: ['secTeam', 'awareness', 'secAgents'] },
  { id: 'identity', icon: '🔑', title: 'Identity & Access', question: 'Who can get in?', quip: "Dev: Marcus clicked the phishing test twice. Fund MFA accordingly.", keys: ['identity', 'grc'] },
  { id: 'perimeter', icon: '🌐', title: 'Perimeter & Cloud', question: "What's the wall look like?", quip: "Dev: The cloud is just someone else's computer. Marcus hates when I say that.", keys: ['network', 'cloud', 'endpoint'] },
  { id: 'appsec', icon: '🔧', title: 'App Security & Data', question: 'Is the code and data safe?', quip: "Dev: 'We'll fix it after launch' is not a security strategy. Apparently it is a roadmap.", keys: ['appSec', 'dataProtect'] },
  { id: 'detection', icon: '📡', title: 'Detection & Response', question: 'Can you see and react?', quip: "Dev: A log nobody reads is just expensive fan fiction.", keys: ['siem', 'ir'] },
  { id: 'ai', icon: '🤖', title: 'AI Security', question: 'Are the robots under control?', quip: "Dev: Giving agents production access without guardrails. Bold. Terrible, but bold.", keys: ['aiSecurity'] },
];

function categoryStatus(keys: string[], game: GameEngine): { deployed: number; total: number; spend: number; color: string; label: string } {
  let deployed = 0;
  let spend = 0;
  for (const k of keys) {
    const lvl = (game.defenses[k] || 0) + (game.pendingUpgrades[k] || 0);
    if (lvl > 0) deployed++;
    spend += lvl * (DEFENSES[k]?.maintainCost || 0);
  }
  const total = keys.length;
  const color = deployed === 0 ? 'stat-card-coral' : deployed < total ? 'stat-card-yellow' : 'stat-card-green';
  const label = deployed === 0 ? 'Not deployed' : deployed < total ? `${deployed}/${total} active` : 'All active';
  return { deployed, total, spend, color, label };
}

function categorySummary(keys: string[], game: GameEngine): string {
  const parts: string[] = [];
  for (const k of keys) {
    const def = DEFENSES[k];
    if (!def) continue;
    const lvl = (game.defenses[k] || 0) + (game.pendingUpgrades[k] || 0);
    if (lvl > 0) parts.push(`${def.name} Lv${lvl}`);
    else parts.push(`No ${def.name.toLowerCase()}`);
  }
  return parts.join(' · ');
}

export function InvestmentCard({ category, game, update, relevant }: {
  category: InvestmentCategory;
  game: GameEngine;
  update: () => void;
  relevant: Set<string>;
}) {
  const [open, setOpen] = useState(false);
  const status = categoryStatus(category.keys, game);
  const summary = categorySummary(category.keys, game);

  return (
    <div className={`comic-card-flat overflow-hidden ${open ? '' : 'cursor-pointer'}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 sm:px-4 py-3 flex items-center gap-3 min-h-[56px]"
      >
        <span className="text-xl shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black comic-heading text-sm">{category.title}</span>
            <span className={`comic-badge text-[9px] ${status.deployed === 0 ? 'comic-badge-red' : status.deployed < status.total ? 'comic-badge-yellow' : 'comic-badge-green'}`}>
              {status.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">{summary}</div>
        </div>
        {status.spend > 0 && (
          <span className="text-xs font-bold tabular-nums text-muted-foreground shrink-0">${status.spend}K/q</span>
        )}
        <span className={`text-muted-foreground text-sm shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="border-t-2 border-foreground/10 px-3 sm:px-4 py-2 space-y-0.5 paper-texture">
          <div className="text-sm text-muted-foreground handwritten mb-1">
            {category.question} {category.quip}
          </div>
          {category.keys.map(k => {
            const def = DEFENSES[k];
            if (!def) return null;
            return <DefenseRow key={k} defKey={k} def={def} game={game} update={update} relevant={relevant.has(k)} />;
          })}
        </div>
      )}
    </div>
  );
}
