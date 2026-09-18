# CISO — Survive the Board. Outsmart the Breach.

**CISO** is a story-driven browser game about running security at a fast-growing AI company. Products ship, inherited risk arrives, the board changes its mind, and every person in the room wants something different from you.

Spend carefully, keep the board's trust, and survive long enough to reach the IPO.

> A teaching game by **Acme Security Company**, grounded in published security research and familiar cybersecurity chaos.

## What's new

- **Persona-driven story.** Marcus the cost-cutting CEO, Victoria the ruthless board chair, Dev the exhausted security lead, and Amara the compliance evangelist react to your decisions—and blame each other when things go wrong.
- **Less spreadsheet, more cause and effect.** The main interface uses plain-language status such as “paper-thin” and “the board is watching.” Hard numbers remain where decisions need them: budget, costs, capacity, and detailed tabs.
- **Comic management-game interface.** Colorful cards, character portraits, horizontal navigation, and touch-friendly mobile layouts.
- **Focused investment decisions.** Controls are grouped into People, Identity, Perimeter, App Security, Detection, and AI Security cards instead of one giant list.
- **Immediate planning feedback.** Queued Threat Modeling and Security Requirements reveal findings immediately, while permanent deployment and costs settle at quarter close.
- **Product-aware funding.** Every active product adds risk-based security funding. Pipeline products receive launch-readiness money, and acquisitions receive additional integration funding.
- **Visible value.** The money panel compares the cost of Threat Modeling + Requirements with the savings they create across the rest of the control portfolio.

## The cast

- **Marcus Cole, CEO:** Wants enterprise security at free-tier pricing.
- **Victoria Chen, Board Chair:** Wants results, one slide, and someone to blame.
- **Dev Patel, Security Lead:** Already documented this risk. Page two. Highlighted.
- **Amara Osei, GRC Manager:** Has a policy for the policy-review policy.
- **You, CISO:** Caught between all four with a budget and a rapidly shrinking sleep schedule.

## Ways to play

- **Interim CISO — 3 quarters:** Learn the core loop quickly.
- **Series B CISO — 8 quarters:** Scale the program as products arrive.
- **IPO-path CISO — 20 quarters:** Start the program early or watch accumulated risk end your tenure.

## How a quarter works

1. **Read the room.** Board confidence, defensive posture, incidents, and available money are summarized in plain language.
2. **Assess the portfolio.** Threat Modeling reveals product-specific gaps and the cited incident rate beside each gap.
3. **Plan the response.** Security Requirements turn findings into work; matching controls and staff address the risks.
4. **Close the quarter.** Purchases deploy, staff address what they can, and attacks test production systems.
5. **Face the consequences.** The characters react, the board adjusts funding, new products arrive, and the next quarter begins.

The tabs keep deeper information available without crowding the main decision:

- **Investments:** Categorized controls and planning capabilities.
- **Portfolio:** Products, gaps, recommended controls, and compact research citations.
- **Team:** Staffing, automation, workload, and alert pressure.
- **Infrastructure:** Detailed control levels and operational health.
- **Log:** Incident history and losses.

## Research and simulation

Attack frequencies and breach costs reference Verizon DBIR, OWASP Top 10, OWASP LLM Top 10, IBM Cost of a Data Breach, MITRE ATLAS, and software-security research. Citations remain available directly from the relevant gap or report.

The Simulation Lab compares spending and timing strategies across repeatable runs. Early alignment between Threat Modeling, Security Requirements, staffing, and matching controls remains the strongest path through the longer game.

## Run locally

```bash
npm install
npm run dev
npm run build
npm test
```

## Tech

Vite, React, TypeScript, Tailwind, and Vitest. Game logic, research data, persistence, and simulations live in `src/lib`; the componentized interface lives in `src/components`.
