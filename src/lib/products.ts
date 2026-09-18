import { WEAKNESSES } from './data';

export const PHASES = ['Scoping', 'Build', 'Testing', 'Rollout', 'Production'];

export interface Product {
  id: string;
  name: string;
  icon: string;
  revenue: number;
  risk: number;
  arrivesTurn: number;
  desc: string;
  weaknesses: string[];
  phase: number;
  launched: boolean;
  mitigated: Set<string>;
  securityAllowanceK: number;
}

export const PRODUCT_SCHEDULE = [
  { id: 'platform',  name: 'NovaMind SaaS Platform',     icon: '🏗️', revenue: 0,    risk: 2, arrivesTurn: 1,  desc: 'Custom-built web app serving enterprise customers. Handles login, permissions, and sensitive client data. Hosted in the public cloud.', weaknesses: ['ACCESS', 'AUTH', 'MISCONF', 'LOG'] },
  { id: 'aifeature', name: 'NovaMind AI Assistant',       icon: '💬', revenue: 600,  risk: 3, arrivesTurn: 2,  desc: 'LLM-powered assistant embedded in the platform. Takes user prompts, generates responses, and can trigger actions via internal APIs.', weaknesses: ['PROMPT', 'INJ', 'LEAK', 'AGENCY'] },
  { id: 'cloudmig',  name: 'Multi-Cloud Infrastructure',  icon: '☁️', revenue: 0,    risk: 3, arrivesTurn: 3,  desc: 'Production workloads across several cloud providers. Automated infrastructure, container clusters, shared secrets, and cross-cloud networking.', weaknesses: ['MISCONF', 'ACCESS', 'EXPOSE', 'LOG'] },
  { id: 'mlpipe',    name: 'ML Training Platform',        icon: '⚙️', revenue: 400,  risk: 2, arrivesTurn: 4,  desc: 'GPU cluster for model training and serving. Ingests customer data, runs open-source ML libraries, deploys models via CI/CD pipeline.', weaknesses: ['VULN', 'POISON', 'SUPPLY', 'MISCONF'] },
  { id: 'api',       name: 'Partner API Gateway',         icon: '🔌', revenue: 800,  risk: 3, arrivesTurn: 5,  desc: 'APIs exposed to third-party developers. Token-based login, rate limiting, handles personal data, makes internal service calls.', weaknesses: ['AUTH', 'INJ', 'ACCESS', 'SSRF', 'EXPOSE'] },
  { id: 'agents',    name: 'NovaMind Agents Platform',    icon: '🤖', revenue: 1200, risk: 4, arrivesTurn: 6,  desc: 'Autonomous AI agents with tool access — can read/write databases, call APIs, and execute code on behalf of customers.', weaknesses: ['PROMPT', 'AGENCY', 'ACCESS', 'THEFT', 'INJ', 'SSRF'] },
  { id: 'acq',       name: 'DataVault (Acquired)',        icon: '🤝', revenue: 500,  risk: 3, arrivesTurn: 7,  desc: 'Acquired analytics product. Legacy codebase, outdated dependencies, undocumented APIs, shared database credentials.', weaknesses: ['VULN', 'AUTH', 'MISCONF', 'SUPPLY', 'LOG', 'EXPOSE'] },
  { id: 'copilot',   name: 'Internal Dev Copilot',        icon: '✨', revenue: 0,    risk: 2, arrivesTurn: 8,  desc: 'AI coding assistant for internal engineers. Has access to source code repos, CI/CD pipelines, and internal documentation.', weaknesses: ['PROMPT', 'LEAK', 'VULN', 'SUPPLY'] },
];

export function productSecurityAllowance(product: Pick<Product, 'id' | 'risk' | 'weaknesses'>): number {
  const readiness = 20 + product.risk * 10 + Math.ceil(product.weaknesses.length / 2) * 5;
  return readiness + (product.id === 'acq' ? 50 : 0);
}

export class ProductPipeline {
  active: Product[] = [];
  /** Quick play: AI assistant ships live in Q2 so a 3-turn run still shows the AI lesson. */
  quickLive = false;

  reset() { this.active = []; this.quickLive = false; }

  tick(turn: number) {
    const events: { type: string; product: Product }[] = [];
    for (const tpl of PRODUCT_SCHEDULE) {
      const quickPreview = this.quickLive && tpl.id === 'aifeature' && turn === 1;
      if ((tpl.arrivesTurn === turn || quickPreview) && !this.active.find(p => p.id === tpl.id)) {
        const liveNow = tpl.arrivesTurn === 1;
        const product: Product = {
          ...tpl,
          phase: quickPreview ? 3 : liveNow ? 4 : 0,
          launched: liveNow,
          mitigated: new Set(),
          securityAllowanceK: productSecurityAllowance(tpl),
        };
        this.active.push(product);
        events.push({ type: liveNow ? 'product_launched' : 'product_arrived', product });
      }
    }
    for (const p of this.active) {
      if (!p.launched) {
        // Quick play previews the AI Assistant in Rollout for the full first
        // planning quarter, then launches it after that quarter's attack roll.
        if (this.quickLive && p.id === 'aifeature' && turn === 1) continue;
        p.phase++;
        if (p.phase >= 4) { p.phase = 4; p.launched = true; events.push({ type: 'product_launched', product: p }); }
      }
    }
    return events;
  }

  getLiveProducts() { return this.active.filter(p => p.launched); }
  getInPipeline() { return this.active.filter(p => !p.launched); }
  getTotalRevenue() { return this.getLiveProducts().reduce((s, p) => s + p.revenue, 0); }
  getUpcoming(turn: number) {
    return PRODUCT_SCHEDULE.filter(
      product => product.arrivesTurn > turn
        && product.arrivesTurn <= turn + 3
        && !this.active.some(active => active.id === product.id),
    );
  }

  toJSON() {
    return this.active.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      revenue: p.revenue,
      risk: p.risk,
      arrivesTurn: p.arrivesTurn,
      desc: p.desc,
      weaknesses: p.weaknesses,
      phase: p.phase,
      launched: p.launched,
      mitigated: [...p.mitigated],
      securityAllowanceK: p.securityAllowanceK,
    }));
  }

  fromJSON(rows: ReturnType<ProductPipeline['toJSON']>) {
    if (!Array.isArray(rows)) return;
    this.active = rows.map(p => ({
      ...p,
      securityAllowanceK: p.securityAllowanceK ?? productSecurityAllowance(p),
      mitigated: new Set(Array.isArray(p.mitigated) ? p.mitigated : []),
    }));
  }

  getExposure() {
    let exposure = 0;
    for (const p of this.getLiveProducts()) {
      for (const wk of p.weaknesses) {
        if (!p.mitigated.has(wk)) exposure += (WEAKNESSES[wk]?.severity || 3) * 0.15;
      }
    }
    return Math.round(exposure * 10) / 10;
  }

  getVulnerableTo(weaknessKey: string) {
    return this.getLiveProducts().filter(p => p.weaknesses.includes(weaknessKey) && !p.mitigated.has(weaknessKey));
  }
}
