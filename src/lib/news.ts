const NEWS_POOL = [
  { headline: 'Major LLM Provider Suffers Training Data Breach',        category: 'Incident',   effect: 'test_weakness', weakness: 'LEAK',    value: 4, detail: 'Millions of conversations exposed.', source: 'OWASP LLM Top 10' },
  { headline: 'Another vendor’s ML framework hit by a supply chain attack', category: 'Incident',   effect: 'test_weakness', weakness: 'SUPPLY',  value: 3, detail: 'Malicious code in widely-used library.', source: 'Verizon DBIR 2024' },
  { headline: 'Autonomous Agent Causes $2M Unauthorized Transactions', category: 'Incident',   effect: 'test_weakness', weakness: 'AGENCY',  value: 4, detail: 'Agent with excessive permissions ran amok.', source: 'OWASP LLM Top 10' },
  { headline: 'Prompt Injection Worm Spreads Across AI Assistants',    category: 'Incident',   effect: 'test_weakness', weakness: 'PROMPT',  value: 5, detail: 'Self-replicating injection between AI systems.', source: 'OWASP LLM Top 10' },
  { headline: 'EU AI Act Enforcement. First Fines Issued',            category: 'Regulation', effect: 'compliance_pressure', value: 3, detail: 'Companies fined for deploying AI without assessments.', source: 'EU AI Act' },
  { headline: 'NIST CSF 2.0 Released. New Governance Function',       category: 'Regulation', effect: 'framework_boost', value: 2, detail: 'Updated cybersecurity framework adds governance pillar.', source: 'NIST CSF 2.0' },
  { headline: 'Universal Jailbreak Technique Discovered',              category: 'Research',   effect: 'test_weakness', weakness: 'PROMPT', value: 4, detail: 'Bypasses safety filters on all major LLMs.', source: 'MITRE ATLAS' },
  { headline: 'Survey: CISOs rank AI as their #1 emerging risk',             category: 'Market',     effect: 'board_attention', value: 2, detail: '78% rank AI security as top emerging risk.', source: 'Industry survey' },
  { headline: 'Cyber Insurance Premiums Spike 40% for AI Companies',   category: 'Market',     effect: 'cost_increase', value: 2, detail: 'Insurers raise rates citing ungoverned AI.', source: 'Industry report' },
  { headline: 'Security Requirements Adoption Up 300%',                category: 'Market',     effect: 'tool_spotlight', value: 0, detail: 'CISOs cite automated requirements as essential.', source: 'Industry survey' },
  { headline: 'Study: 80% of AI Apps Have Broken Access Controls',     category: 'Research',   effect: 'test_weakness', weakness: 'ACCESS', value: 3, detail: 'Most AI apps fail basic auth testing.', source: 'OWASP Top 10' },
  { headline: 'Open Source AI Security Toolkit Released',              category: 'Research',   effect: 'framework_boost', value: 2, detail: 'New automated AI red-teaming suite.', source: 'MITRE ATLAS' },
  { headline: 'SEC Requires Cyber Incident Disclosure in 4 Days',     category: 'Regulation', effect: 'compliance_pressure', value: 2, detail: 'Material incidents must now be publicly disclosed.', source: 'SEC Rules 2024' },
  { headline: 'Ransomware Payments Hit Record $1.1B in 2023',         category: 'Incident',   effect: 'test_weakness', weakness: 'VULN', value: 3, detail: '32% of breaches now involve ransomware.', source: 'Verizon DBIR 2024' },
  { headline: 'OWASP Releases Updated Top 10 for LLM Applications',  category: 'Regulation', effect: 'framework_boost', value: 2, detail: 'Prompt injection remains #1 risk.', source: 'OWASP LLM Top 10' },
];

export class NewsFeed {
  history: any[] = [];
  private _pool: any[] = [];

  reset() { this.history = []; this._pool = NEWS_POOL.map(n => ({ ...n })); }

  rollNews(turn: number) {
    if (!this._pool.length) this._pool = NEWS_POOL.map(n => ({ ...n }));
    const count = Math.random() > 0.6 ? 2 : 1;
    const items: any[] = [];
    for (let i = 0; i < count && this._pool.length; i++) {
      const idx = Math.floor(Math.random() * this._pool.length);
      const item = this._pool.splice(idx, 1)[0];
      item.turn = turn;
      items.push(item);
      this.history.push(item);
    }
    return items;
  }

  applyEffects(newsItems: any[], game: any) {
    return newsItems.map(news => {
      let impact = '';
      switch (news.effect) {
        case 'test_weakness': {
          const vulns = game.products.getVulnerableTo(news.weakness);
          if (vulns.length === 0) {
            impact = 'No matching exposure on live systems.';
            game.reputation = Math.min(100, game.reputation + 2);
          } else {
            impact = `Matching exposure: ${vulns.map((p: any) => p.name).join(', ')}.`;
            game.reputation = Math.max(0, game.reputation - vulns.length);
          }
          break;
        }
        case 'compliance_pressure':
          if ((game.defenses.grc || 0) >= news.value) { impact = 'GRC meets the stated bar.'; game.reputation = Math.min(100, game.reputation + 2); }
          else { impact = 'GRC is below the stated bar.'; game.reputation = Math.max(0, game.reputation - 3); }
          break;
        case 'framework_boost': case 'tool_available': impact = 'External guidance. One-time budget increase this quarter.'; game.treasury += 30; break;
        case 'board_attention': impact = 'NovaMind board adds to your security budget.'; game.treasury += Math.round(game.quarterlyBudget * 0.1); break;
        case 'cost_increase': impact = 'Industry-wide: your operating costs go up.'; game.treasury -= 30; break;
        case 'tool_spotlight':
          impact = (game.defenses.reqMgmt || 0) > 0 ? 'NovaMind already executes controls with requirements and training.' : 'NovaMind has not stood up control execution yet.';
          if ((game.defenses.reqMgmt || 0) > 0) game.reputation = Math.min(100, game.reputation + 3);
          break;
        default: impact = 'Industry news only.';
      }
      return { headline: news.headline, impact };
    });
  }

  toJSON() {
    return { history: this.history, pool: this._pool };
  }

  fromJSON(data: { history?: any[]; pool?: any[] }) {
    this.history = data.history ?? [];
    this._pool = data.pool ?? NEWS_POOL.map(n => ({ ...n }));
  }
}
