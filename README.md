# CISO — Survive the Board. Outsmart the Breach.

**CISO** is a browser game that puts you in the security chief's seat at a fast‑growing AI company. Every quarter the board hands you a budget. You decide where it goes — threat modeling, security requirements, and the controls that stop real attacks — while the product ships, the estate grows, and attackers keep knocking.

Make the calls a real CISO makes. Keep your reputation above zero. Get the company to the finish line.

> A teaching game by **Acme Security Company**, grounded in published security research — not vibes.

## Why play

- **It's the real job, compressed.** Fixed budget, growing attack surface, competing priorities, and a board that only remembers the last breach.
- **Every number is sourced.** Attack frequencies and breach costs come from Verizon DBIR, OWASP Top 10, OWASP LLM Top 10, IBM Cost of a Data Breach, and the Microsoft SDL research — cited right in the UI.
- **It proves the thesis.** Threat modeling **plus** security requirements makes you safer *and* cheaper. The game's engine is calibrated to the evidence, and the built‑in Simulation Lab lets you prove it for yourself.

## Pick your tour

| Assignment | Length | The challenge |
| --- | --- | --- |
| **Interim CISO** | 3 quarters | A short tour. Learn the ropes fast. |
| **Series B CISO** | 8 quarters | Scale threat modeling and security requirements as the company grows. |
| **IPO‑path CISO** | 20 quarters | The long game. Survive to the public markets. |

## How a quarter works

1. **Read the board.** Reputation, reserves, and this quarter's outcome.
2. **Assess the estate.** Threat‑model your live systems to see which are actually exposed — before you spend.
3. **Invest.** Buy threat modeling, security requirements, and the controls that match your real risks. Threat modeling finds the gaps; requirements make sure the tools are actually used to close them.
4. **Close the quarter.** Attacks roll in. Strong, aligned programs stop most of them; unlisted gaps and neglected controls get breached.
5. **Review and adjust.** See what happened, what it cost, and what to do next.

## The lesson, in one screen

The Simulation Lab replays the job hundreds of times and averages the results, so you can compare:

- **Spending habits** — do nothing, spray a little everywhere, buy tools with no plan, run the full program, or max every tool.
- **Timing** — start threat modeling + security requirements on day one, or wait a few quarters and watch the cost pile up.

The takeaway is consistent and evidence‑backed: **a modest, early investment in threat modeling and security requirements cuts total cost (spend + breach losses) many times over — and it has to happen early, because lost reputation doesn't come back.**

## Run it locally

```bash
npm install
npm run dev      # play at the local dev URL
npm run build    # production build
npm test         # simulation + engine tests
```

## Tech

Vite · React · TypeScript · Tailwind. All game logic lives in `src/lib` (the engine, the sourced data catalog, and the scenario simulator); the UI lives in `src/components`.
