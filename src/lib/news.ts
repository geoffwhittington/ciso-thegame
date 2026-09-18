const NEWS_POOL = [
  { headline: 'Major LLM Provider Suffers Training Data Breach',        category: 'Incident',   effect: 'test_weakness', weakness: 'LEAK',    value: 4, detail: 'Dev: "This is exactly what I warned about." Marcus: "Does this affect our stock price?"', source: 'OWASP LLM Top 10' },
  { headline: 'Vendor ML Framework Hit by Supply Chain Attack',          category: 'Incident',   effect: 'test_weakness', weakness: 'SUPPLY',  value: 3, detail: 'Dev: "We use this library. We LITERALLY use this library." Marcus: "Can\'t we just... not update?"', source: 'Verizon DBIR 2024' },
  { headline: 'Autonomous Agent Causes $2M in Unauthorized Transactions', category: 'Incident',  effect: 'test_weakness', weakness: 'AGENCY',  value: 4, detail: 'Marcus: "Our agents can\'t do that, right?" Dev: "Define \'can\'t.\'"', source: 'OWASP LLM Top 10' },
  { headline: 'Prompt Injection Worm Spreads Across AI Assistants',    category: 'Incident',   effect: 'test_weakness', weakness: 'PROMPT',  value: 5, detail: 'Dev is sending frantic Slack messages at midnight. Marcus: "What\'s a prompt injection?"', source: 'OWASP LLM Top 10' },
  { headline: 'EU AI Act: First Fines Issued',                         category: 'Regulation', effect: 'compliance_pressure', value: 3, detail: 'Amara, vibrating with urgency: "I TOLD you we needed the AI governance framework!" Victoria: "Are we exposed?"', source: 'EU AI Act' },
  { headline: 'NIST CSF 2.0 Released',                                 category: 'Regulation', effect: 'framework_boost', value: 2, detail: 'Amara is ecstatic. Dev: "Another framework to implement." Marcus: "Can we just say we\'re aligned?"', source: 'NIST CSF 2.0' },
  { headline: 'Universal LLM Jailbreak Technique Discovered',          category: 'Research',   effect: 'test_weakness', weakness: 'PROMPT', value: 4, detail: 'Dev: "It bypasses EVERYTHING." Marcus: "Everything everything?" Dev: "EVERYTHING."', source: 'MITRE ATLAS' },
  { headline: 'Survey: CISOs Rank AI as #1 Emerging Risk',             category: 'Market',     effect: 'board_attention', value: 2, detail: 'Victoria forwards the article to you with no comment. Marcus: "Should we be worried?"', source: 'Industry survey' },
  { headline: 'Cyber Insurance Premiums Spike 40% for AI Companies',   category: 'Market',     effect: 'cost_increase', value: 2, detail: 'Marcus: "FORTY PERCENT?! Can\'t we just... not tell them about the AI stuff?"', source: 'Industry report' },
  { headline: 'Security Requirements Adoption Up 300%',                category: 'Market',     effect: 'tool_spotlight', value: 0, detail: 'Amara: "300%! We should be part of this trend!" Dev nods vigorously.', source: 'Industry survey' },
  { headline: 'Study: 80% of AI Apps Fail Basic Access Controls',      category: 'Research',   effect: 'test_weakness', weakness: 'ACCESS', value: 3, detail: 'Dev: "80%. Eight. Zero. And yes, I checked ours."', source: 'OWASP Top 10' },
  { headline: 'Open Source AI Red-Team Toolkit Released',              category: 'Research',   effect: 'framework_boost', value: 2, detail: 'Dev: "Free tools! Can I play with them?" Amara: "After you fill out the tool approval form."', source: 'MITRE ATLAS' },
  { headline: 'SEC: Cyber Incidents Must Be Disclosed in 4 Days',     category: 'Regulation', effect: 'compliance_pressure', value: 2, detail: 'Amara has already drafted the disclosure template. Victoria: "Calendar days."', source: 'SEC Rules 2024' },
  { headline: 'Ransomware Payments Hit $1.1B Record',                 category: 'Incident',   effect: 'test_weakness', weakness: 'VULN', value: 3, detail: 'Marcus: "A billion?! We have insurance for that, right?" Dev: "Not... quite."', source: 'Verizon DBIR 2024' },
  { headline: 'OWASP Updates LLM Top 10',                             category: 'Regulation', effect: 'framework_boost', value: 2, detail: 'Dev: "Prompt injection is STILL number one. Shocking." (Dev predicted it.)', source: 'OWASP LLM Top 10' },
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
            impact = 'Dev: "We\'re clean on this one." Marcus breathes audible relief.';
            game.reputation = Math.min(100, game.reputation + 2);
          } else {
            impact = `Dev: "We're exposed." Systems at risk: ${vulns.map((p: any) => p.name).join(', ')}.`;
            game.reputation = Math.max(0, game.reputation - vulns.length);
          }
          break;
        }
        case 'compliance_pressure':
          if ((game.defenses.grc || 0) >= news.value) { impact = 'Amara: "We meet the bar. I have the evidence binder ready."'; game.reputation = Math.min(100, game.reputation + 2); }
          else { impact = 'Amara: "We do NOT meet this bar. I need budget. Yesterday."'; game.reputation = Math.max(0, game.reputation - 3); }
          break;
        case 'framework_boost': case 'tool_available': impact = 'Victoria: "The board approved a one-time budget increase." Marcus winces.'; game.treasury += 30; break;
        case 'board_attention': impact = 'Victoria adds to your budget after reading the article. Marcus: "Since when does Victoria read?"'; game.treasury += Math.round(game.quarterlyBudget * 0.1); break;
        case 'cost_increase': impact = 'Marcus: "Everything costs more. Can you do more with less? Again?"'; game.treasury -= 30; break;
        case 'tool_spotlight':
          impact = (game.defenses.reqMgmt || 0) > 0 ? 'Amara: "We\'re already ahead of the curve!" Dev high-fives her.' : 'Dev: "We should be doing this. We are not doing this."';
          if ((game.defenses.reqMgmt || 0) > 0) game.reputation = Math.min(100, game.reputation + 3);
          break;
        default: impact = 'Industry chatter. Dev adds it to the threat intel feed.';
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
