import type { AvatarId } from '@/components/game/avatars';

export interface Persona {
  id: AvatarId;
  name: string;
  role: string;
  personality: string;
  lines: Record<string, string[]>;
}

function hashSeed(personaId: string, situation: string, turn: number): number {
  let h = 0;
  const s = `${personaId}:${situation}:${turn}`;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getLine(personaId: AvatarId, situation: string, turnSeed: number): string {
  const persona = PERSONAS[personaId];
  if (!persona) return '';
  const pool = persona.lines[situation];
  if (!pool || pool.length === 0) return '';
  return pool[hashSeed(personaId, situation, turnSeed) % pool.length];
}

export function getLineMulti(situation: string, turnSeed: number): { id: AvatarId; line: string }[] {
  return (['ceo', 'board', 'analyst', 'compliance', 'ciso'] as AvatarId[])
    .map(id => ({ id, line: getLine(id, situation, turnSeed) }))
    .filter(x => x.line.length > 0);
}

export const PERSONAS: Record<AvatarId, Persona> = {
  ceo: {
    id: 'ceo', name: 'Marcus Cole', role: 'CEO',
    personality: 'Impatient exec who doesn\'t understand security. Loves revenue, hates spending on things he can\'t see.',
    lines: {
      greeting: [
        "Welcome aboard! Quick question — do we actually need all this security stuff? We've never been hacked. That I know of.",
        "Great to have you! The last CISO lasted two quarters. No pressure. Anyway, can you make us compliant by Friday?",
        "So you're the new security person. Quick ground rules: I need to approve any spend over... well, any spend. Also, what's a 'firewall'?",
        "First day! Let me show you around. That's engineering, that's sales, and that closet is your office. Budget's tight, you understand.",
        "Welcome! The board wants world-class security on a pizza-party budget. I told them you could do it. You can do it, right?",
        "Before you start spending money — can't we just get cyber insurance and call it a day? Asking for me.",
      ],
      quarter_calm: [
        "See? No incidents. I told you we didn't need all those tools. Can we cut the budget next quarter?",
        "Great quarter! No hacks. So... we probably have too much security, right? Let's redirect some budget to marketing.",
        "Nothing happened! Victoria's happy, I'm happy. Maybe we can scale back a bit?",
        "Quiet quarter. Honestly, I forget we even have a security team sometimes. That's a compliment!",
        "Zero incidents! Proof that we're overspending on security. I'll draft a memo about efficiency.",
        "Excellent! No breaches. So what exactly did you spend all that money on?",
      ],
      quarter_breach: [
        "WHAT DO YOU MEAN WE'VE BEEN HACKED?! I thought we had... firewalls or whatever! Fix it! Spend whatever it takes!",
        "The board is going to KILL me. I told Victoria everything was fine! You told me everything was fine!",
        "OK new plan: we buy everything. Every security tool. All of them. Money is no object. For this quarter. Then we'll revisit.",
        "How did this happen? We have a WHOLE security team! That's... how many people? Just you?!",
        "Nobody could have predicted this. I mean, Dev predicted it, but nobody IMPORTANT predicted it.",
        "I am canceling my vacation. Actually no, I'm not. But I'm very upset about this. Very.",
        "Quick question: is it too late to buy cyber insurance AFTER the breach? Asking for a friend.",
      ],
      quarter_contained: [
        "So we ALMOST got hacked? That counts as a win, right? I'm telling Victoria it's a win.",
        "Contained. Good. Could have been worse. Don't tell the board how close it was.",
        "We stopped it? Excellent. I'll mention it in my next all-hands as 'proactive security leadership.'",
        "Close call. Maybe we DO need some of this stuff. But let's not go crazy with the spending.",
        "Contained! That's basically the same as 'didn't happen,' right? For reporting purposes?",
        "Good work containing that. Now, can we still cut the budget? Unrelated question.",
      ],
      budget_tight: [
        "Perfect. Lean and efficient. This is what I like to see.",
        "Budget's tight? Welcome to my world. Have you tried doing more with less?",
        "I know it looks tight, but I really think we can make it work. Have you considered free tools?",
        "The board approved exactly this much. If you need more, you'll need to show ROI. What's the ROI on 'not getting hacked'?",
        "Budget's a little thin, sure. But necessity is the mother of invention! Or something.",
        "Can Dev write some of the security tools himself? That would save money.",
      ],
      budget_flush: [
        "Whoa, whoa. You have budget LEFT? Why didn't you give it back? I could use that for the company retreat.",
        "Surplus?! Don't let the board see this. They'll think I gave you too much.",
        "That's a lot of unspent security budget. Are you sure you're buying enough things? Wait, no. Stop spending.",
        "You have money left over? That's never happened before. I'm suspicious.",
        "Leftover budget? Great! I have a list of marketing projects that could use—no? OK.",
        "If you don't spend it, I'll reallocate it to sales. Just saying.",
      ],
      trust_critical: [
        "The board is discussing 'leadership changes.' That means you. Fix this NOW.",
        "Victoria pulled me aside. She said, and I quote, 'one more incident.' I think she means it.",
        "I'm not going to sugarcoat this: you're on very thin ice. The board is not happy. I'm not happy.",
        "I've been asked to 'explore alternatives' for your role. Please make that unnecessary.",
        "Your job is on the line. MY job is on the line. Everyone's job is on the line. Do something.",
        "The board wants a 'turnaround plan' on their desk by Monday. That's your plan, by the way.",
      ],
      trust_high: [
        "The board loves you! I mean, they love ME for hiring you. But still — great work.",
        "Victoria actually smiled in the last meeting. I didn't know she could do that.",
        "Things are going great! Don't get cocky though. Or do. Whatever keeps working.",
        "Board trust is high. Now's the time to ask for a raise. Just kidding. Unless...?",
        "You've made me look very good in front of Victoria. I appreciate that. Quietly.",
        "Everything's smooth. Let's not rock the boat. Or buy expensive boats. I mean tools.",
      ],
      no_threat_model: [
        "Do we really need to 'model threats'? Can't we just... block them? All of them?",
        "Threat modeling sounds expensive. Can't we just read about threats on the internet?",
        "I don't understand what 'threat modeling' IS but it sounds like a lot of meetings.",
        "Dev keeps saying we need this. But Dev wants to buy everything. You decide.",
        "If we model the threats, won't that just scare the board? Ignorance is bliss, I say.",
        "Can we do threat modeling but, like, cheaply? Maybe an intern could do it?",
      ],
      alert_overload: [
        "Why are your people so stressed? They need better time management.",
        "Too many alerts? Turn some off! Problem solved.",
        "I don't understand why you need more staff. Can't the computer handle the alerts?",
        "Alert overload? Sounds like an efficiency problem, not a headcount problem.",
        "Have you tried ignoring the less important alerts? Prioritize!",
        "What if we only look at alerts on weekdays? That would cut the volume by... some percent.",
      ],
      end_quarter: [
        "Is this going to cost me money? Be honest.",
        "Just tell me the board won't yell at me.",
        "Fine. Whatever you think is best. But if this goes wrong, it's on you.",
        "I trust your judgment. Mostly. Let's do this.",
        "Run it by me one more time — slowly. Using small words.",
        "If Victoria asks, this was all your idea. If it goes well, it was mine.",
      ],
      gameover_win: [
        "I can't believe it — you actually survived! I mean, I always believed in you. Don't check my emails.",
        "We made it! Time to celebrate. Budget for the party comes out of next year's security allocation, obviously.",
        "Victoria is impressed. She didn't say 'impressed,' she said 'adequate,' but for her that's basically a hug.",
        "You did it! Now let's never speak of those early quarters again. Especially the phishing thing.",
      ],
      gameover_lose: [
        "So... this is awkward. Victoria asked me to collect your badge. Nothing personal!",
        "I'm sure you'll land on your feet. Have you considered a career in... not security?",
        "The board voted. It was unanimous. Even the board members who don't know what you do.",
        "On the bright side, you'll have a great story for job interviews! 'Tell me about a time you failed...'",
      ],
      trope: [
        "Can you whitelist this attachment? It's from an investor. Yes, I know it says 'URGENT_PRIZE.exe.'",
        "I forwarded something to all-staff. Can you check if it's legit? ...Why is Dev screaming?",
        "Do we REALLY need MFA? The investors hate it. Can't we just use strong passwords? Like 'NovaMind2026!'?",
        "What does Dev even DO all day? He just stares at a black screen with green text.",
        "I told the board we're using 'AI-powered security.' We're using AI, right? In some capacity?",
        "The CFO asked why we need a firewall 'when we're in the cloud.' I... didn't know what to say.",
        "Can't you just approve the deploy? The customer is waiting. What's the worst that could happen?",
        "I put our security strategy in the investor deck. It says 'enterprise-grade security.' That's accurate, right?",
      ],
    },
  },
  board: {
    id: 'board', name: 'Victoria Chen', role: 'Board Chair',
    personality: 'Ice-cold boardroom authority. Speaks in KPIs. Will fire you without blinking.',
    lines: {
      greeting: [
        "The board has high expectations. Don't disappoint us.",
        "I've reviewed your credentials. Adequate. Results will determine if you stay.",
        "Welcome. The previous CISO lasted 18 months. Try to beat that record.",
        "The board approved your hire. Barely. Prove us right.",
        "I need quarterly updates. One slide. No jargon. Results only.",
        "Let me be direct: I don't care about tools or frameworks. I care about outcomes.",
      ],
      quarter_calm: [
        "Acceptable quarter. The board is satisfied. For now.",
        "No incidents. I'll note that in my report. Keep it up.",
        "Clean quarter. I'll let the board know MY security oversight is working.",
        "Adequate performance. Don't let it go to your head.",
        "The board is pleased. I'm cautiously optimistic. Emphasis on cautiously.",
        "Good. Now do it again next quarter.",
      ],
      quarter_breach: [
        "The board is... concerned. Deeply concerned. As am I.",
        "I'm calling an emergency session. You will present. Bring solutions, not excuses.",
        "This reflects poorly on the entire organization. On me specifically.",
        "I want a root cause analysis on my desk by tomorrow. In plain English.",
        "One more incident like this and we'll be having a different conversation.",
        "The shareholders will have questions. I need answers before they ask.",
        "I told the board we had this under control. You made me look foolish.",
      ],
      quarter_contained: [
        "Contained. Not ideal, but it could have been worse. I'll note the response time.",
        "The board doesn't need to know the details. Just that we handled it.",
        "Close call. I expect a full review and prevention plan.",
        "Barely acceptable. But acceptable.",
        "I'll brief the board that our controls worked. They did work, correct?",
        "The response was adequate. Barely.",
      ],
      budget_tight: [
        "The board allocated exactly what was deemed necessary. Make it work.",
        "Budget constraints build character. And efficiency.",
        "If you need more, present a business case. A compelling one.",
        "I've seen CISOs do more with less. Considerably less.",
        "The allocation reflects the board's current risk appetite. It is final.",
        "Resourcefulness is an undervalued trait in security leadership.",
      ],
      trust_critical: [
        "The board is reviewing your position. I suggest dramatic improvement.",
        "I'm scheduled to present 'leadership alternatives' next session. Change my mind.",
        "You are one incident away from a very short meeting.",
        "I've seen this trajectory before. It doesn't end well for the CISO.",
        "The board's patience has limits. You've found them.",
        "I would update your LinkedIn. Just as a precaution.",
      ],
      trust_high: [
        "The board is impressed. I don't use that word lightly.",
        "Excellent execution. I'll ensure the board recognizes your contribution.",
        "You've exceeded expectations. The board has increased your discretionary budget.",
        "Strong quarter. Even Marcus has stopped complaining about security costs.",
        "I've recommended extending your contract. The vote was unanimous.",
        "The shareholders are confident. That's your doing. Well done.",
      ],
      end_quarter: [
        "Present your plan. Concisely.",
        "The board will want to know why. Have your reasons ready.",
        "I'll need to justify this to the audit committee. Make it defensible.",
        "Proceed. But know that I'm watching the results closely.",
        "This had better work.",
        "Fine. I'll reserve judgment until the results are in.",
      ],
      gameover_win: [
        "Adequate performance overall. The board will renew your contract. Conditionally.",
        "You've met the board's expectations. That is the highest compliment I offer.",
        "The company survived your tenure. That's more than I expected, frankly.",
        "Well done. I'll deny ever doubting you. Because I never did. Officially.",
      ],
      gameover_lose: [
        "The board has made its decision. This meeting is a formality.",
        "Your tenure will be a case study in what not to do. I'll ensure the lessons are documented.",
        "Security will report to the CFO until we find your replacement. I'm sure it will be fine.",
        "I wish you well. That's a formality, not a sentiment.",
      ],
      trope: [
        "I forwarded an email to all-staff asking if it was legitimate. Dev informs me it was a phishing attempt. We will never speak of this again.",
        "I need the security strategy in emoji form. The board responds well to visual communication.",
        "I need this on one slide. ONE. Not two. One.",
        "What's our 'security posture'? Can you express it as a percentage? The board likes percentages.",
        "Marcus asked me to 'whitelist his personal laptop.' I assume that's a security term for 'absolutely not.'",
        "The audit committee wants to know our 'cyber resilience score.' Make one up. I mean, calculate one.",
      ],
    },
  },
  analyst: {
    id: 'analyst', name: 'Dev Patel', role: 'Security Lead',
    personality: 'Sardonic hacker who\'s seen it all. Memes in Slack. Frustrated when unfunded.',
    lines: {
      greeting: [
        "Finally, someone who might actually listen. I have a list. It's long. Grab a coffee.",
        "New boss! Great. Here's the risk register. Page 1 of 47. We'll need to talk about all of them.",
        "Welcome! The good news: I know exactly what we need. The bad news: Marcus won't pay for any of it.",
        "Oh thank god, an actual security person. The last one thought 'zero trust' meant trusting nobody on the team.",
        "Hey! I've been running this show with duct tape and prayers. Ready to fix that?",
        "Welcome aboard. Fair warning: I've put everything in the risk register. Marcus has read none of it.",
      ],
      quarter_calm: [
        "Too quiet. I don't trust it. Something's brewing.",
        "No incidents, but that doesn't mean no risks. The gaps are still there.",
        "Calm quarter. Marcus will use this as proof we don't need tools. Brace yourself.",
        "Quiet. Which means Marcus is about to suggest cutting our budget. I can feel it.",
        "No breaches this quarter. Time to fix the things that WILL cause breaches next quarter.",
        "Everything held. For now. Let's not celebrate until we've patched the backlog.",
      ],
      quarter_breach: [
        "I literally put this in the risk register. Page 2. Highlighted in red. MONTHS ago.",
        "Told you. TOLD YOU. But we 'didn't have the budget.' Well, how's the budget looking NOW?",
        "Remember when I said we needed that tool? And you said 'next quarter'? Yeah.",
        "The attackers used exactly the vector I flagged. I'm not even surprised anymore. I'm just tired.",
        "Another breach we could have prevented. I'm updating my résumé. Just kidding. Mostly.",
        "So the thing I warned about happened. Can I have the budget now? Or should I wait for the next one?",
        "I don't want to say 'I told you so' but— actually, yes I do. I told you so.",
      ],
      quarter_contained: [
        "We caught it! The tools worked! THIS is why we need to keep funding them.",
        "Contained. See? The stuff you bought actually DOES something. Now buy MORE stuff.",
        "Good catch. If we'd had the SIEM I asked for, we'd have caught it even faster.",
        "Saved it. Barely. But it shouldn't have gotten that far. We need more layers.",
        "Detection worked. Response worked. But only because I was awake at 3 AM. Again.",
        "Contained! Add this to the 'Dev was right about investing in detection' file.",
      ],
      budget_tight: [
        "We can't run a security program on pocket change. This is how breaches happen.",
        "Tight budget. Great. I'll just protect the company with good vibes and positive thinking.",
        "Not enough money for the tools we need. I'll add it to the risk register. Again.",
        "Marcus cut the budget again? Cool. I'll just fight off APTs with a strongly-worded email.",
        "Budget's thin. I can make it work, but something's going to break. Documenting my concerns now.",
        "At this budget we're choosing which systems to leave exposed. Fun times.",
      ],
      alert_overload: [
        "We're drowning in alerts. I physically cannot look at all of them. Nobody can.",
        "Alert fatigue is real and we're living it. Something critical WILL get missed.",
        "Too many alerts, not enough people. This is a recipe for a breach. I've flagged it three times.",
        "I'm getting 200 alerts a day. I can investigate maybe 20. You do the math.",
        "The alerts are on fire. I'm on fire. Everything is on fire. Can we hire someone?",
        "We bought all these detection tools but nobody to look at the detections. Galaxy brain move.",
      ],
      no_threat_model: [
        "We're flying blind. No threat model means we don't know what we don't know.",
        "How can we prioritize defenses if we haven't modeled the threats? We're just guessing.",
        "Marcus says threat modeling is 'too theoretical.' Getting hacked is very practical.",
        "Without a threat model we're just buying random tools and hoping for the best.",
        "I've been asking for threat modeling since day one. My Slack messages have timestamps.",
        "No threat model. We're defending everything equally, which means we're defending nothing well.",
      ],
      end_quarter: [
        "Let's do this. The backlog isn't getting shorter.",
        "Ready when you are. I've triaged everything twice.",
        "Let's see what this quarter's budget can actually accomplish. Fingers crossed.",
        "Ending the quarter. I have opinions about next quarter's priorities. Many opinions.",
        "Locking it in. I hope we bought the right things. Actually, I know we did. Mostly.",
        "Quarter's done. Time to see if our defenses hold. Or, you know, don't.",
      ],
      gameover_win: [
        "We did it! Against all odds, with half the budget we needed. I'm adding this to my talk at DEF CON.",
        "Survived! The risk register worked. The tools worked. Everything I asked for WORKED. Remember that.",
        "What a ride. I need a vacation. And a raise. Mostly a raise.",
        "We made it through! Despite Marcus, despite the budget, despite the USB intern. We made it.",
      ],
      gameover_lose: [
        "Well, I tried. The risk register has 47 pages of 'I told you so.' For the record.",
        "Another one bites the dust. I'll be here when the next CISO arrives. Same risks. Same register.",
        "Sorry it ended this way. If anyone asks, I'll tell them you listened more than the last one.",
        "The risks I flagged are still there. They'll still be there for your replacement. I've updated the handoff doc.",
      ],
      trope: [
        "The phishing test results are in. 60% failure rate. Marcus clicked on it. Twice.",
        "Someone on the dev team shipped hardcoded API keys to prod. 'It was just for testing!' they said.",
        "Found a server with the admin password set to 'Password123!' I'm going to lie down.",
        "An intern plugged in a USB they found in the PARKING LOT. I can't even.",
        "We don't need a pentest, we're using React. — actual quote from an engineering manager",
        "Marketing wants to disable MFA because it's 'hurting conversion rates.' I am in pain.",
        "The dev team's idea of secrets management is a shared Google Doc called 'passwords (do not share).'",
        "Someone asked if we can just 'block all hackers at the firewall.' I wish it worked that way.",
      ],
    },
  },
  compliance: {
    id: 'compliance', name: 'Amara Osei', role: 'GRC Manager',
    personality: 'Cheerful but relentless about compliance. Loves frameworks. Passive-aggressively documents everything.',
    lines: {
      greeting: [
        "Welcome! I've prepared a 30-page onboarding document covering all our compliance obligations. Let's review it together!",
        "So excited to have a new CISO! I've already drafted three policies for your signature. Also, we need to talk about SOC 2.",
        "Hello! Quick question before you settle in — did we document the decision to hire you? Asking for the audit trail.",
        "Welcome aboard! I've set up our first GRC sync. It's daily. At 8 AM. Non-negotiable. Also, coffee?",
        "Great to meet you! Fun fact: we currently have 47 overdue compliance items. But who's counting? Me. I'm counting.",
        "Welcome! First order of business: establishing a policy review cadence. I was thinking weekly. Yes, weekly.",
      ],
      quarter_calm: [
        "Clean quarter! I've already drafted the compliance report. And the report about the report.",
        "No incidents. Perfect time to update our policies. I have a list. It's extensive. I'm thrilled.",
        "Quiet quarter means audit prep! Everyone's favorite. I've booked conference rooms for the next three weeks.",
        "Zero incidents — and I've documented every control that contributed. With citations.",
        "Wonderful quarter! I used the downtime to create a policy for our policy review process. It's beautiful.",
        "No breaches! Now let's make sure we can PROVE we had no breaches. Documentation is everything.",
      ],
      quarter_breach: [
        "This wouldn't have happened if we'd finished the audit controls. I have an email trail.",
        "I've already started the incident report. It's 12 pages and I'm on the root cause section.",
        "Breach. I need the following documented within 24 hours: timeline, impact, root cause, remediation plan, lessons learned, and who's getting remedial training.",
        "The compliance gap I flagged last quarter? It's now an incident. I have the receipts.",
        "I'm drafting the regulatory notification. And the customer notification. And the internal communication. And the updated policy.",
        "Breach during MY watch? I take this personally. The gap analysis starts NOW.",
      ],
      quarter_contained: [
        "Contained! And our incident response procedures worked exactly as documented. I'm proud of us.",
        "The response followed our documented playbook to the letter. Well, mostly. I have notes.",
        "Good response. I'll update the post-incident review template and schedule the retrospective.",
        "Contained. But let's review whether our detection controls met the SLA. I have a spreadsheet.",
        "Crisis averted. The documentation held. The procedures held. Everything held. I may cry.",
        "The incident response plan worked! All those tabletop exercises paid off. Scheduling more.",
      ],
      budget_tight: [
        "Compliance doesn't require a big budget. It requires commitment. And documentation. And a budget.",
        "We can prioritize — but I need it on record that we're accepting risk on the items we defer.",
        "Budget's tight, but auditors don't care about budgets. They care about evidence.",
        "I can work with this, but I need you to sign off on the risk acceptance forms. All 15 of them.",
        "Even with a tight budget, we need GRC. The auditors are coming whether we're ready or not.",
        "The budget is what it is. I'll document our constraints. Thoroughly. With exhibits.",
      ],
      trust_critical: [
        "From a compliance perspective, this situation is deeply concerning. I've drafted a remediation roadmap.",
        "Board trust is critical. I have a recovery framework with 47 action items. Shall we begin?",
        "I've seen CISOs come and go. The ones who survive document everything. Just saying.",
        "Critical trust levels. I've prepared a compliance-driven recovery plan. It involves a lot of paperwork.",
        "The auditors will have questions about this period. I want to make sure we have answers.",
        "Trust is low. But a strong compliance showing could help. I've scheduled extra audit prep sessions.",
      ],
      trust_high: [
        "Board trust is high! This is the perfect time to invest in GRC maturity. I have proposals.",
        "High trust means we can push for stronger compliance. I've already drafted the expanded scope.",
        "Wonderful! Now let's lock this in with proper documentation so it's repeatable.",
        "The board trusts us. Let's reward that trust with an even more robust compliance program!",
        "Trust is high. Time to pursue that ISO 27001 certification I've been pitching.",
        "Excellent trust levels. I've documented exactly how we got here. For posterity. And auditors.",
      ],
      end_quarter: [
        "Have we documented all the decisions we're making today? For the audit trail?",
        "Before we close — is there anything that needs a risk acceptance sign-off?",
        "I've prepared the quarterly compliance summary. It's ready for the board.",
        "Closing the quarter. I'll archive the decision log and prepare the evidence package.",
        "Let's make sure all policy exceptions are documented before we finalize.",
        "Quarter close! My favorite time. Second favorite after audit season.",
      ],
      gameover_win: [
        "We survived! And I have complete documentation of every quarter. The audit trail is PRISTINE.",
        "What a journey. I've already compiled the lessons-learned document. It's 89 pages. Abridged.",
        "We made it! And more importantly, we can PROVE we made it. To any auditor, anytime.",
        "Success! I'm framing the compliance scorecard. It goes next to my SOC 2 poster.",
      ],
      gameover_lose: [
        "I documented every risk that was accepted. Every gap that was unfunded. It's all in the record.",
        "The compliance gaps I flagged are now part of the post-mortem. Which I've already drafted.",
        "I wish we'd invested more in GRC. The audit trail shows exactly where things went wrong.",
        "I take no satisfaction in saying the risk register was accurate. Actually, a tiny bit of satisfaction.",
      ],
      trope: [
        "Just checking — did we document that decision? Asking for the auditor. Who arrives Tuesday.",
        "SOC 2 is not optional. It's a personality trait. My personality trait, specifically.",
        "I've drafted a policy for our policy review process. And a review process for that policy.",
        "Sales promised a customer SOC 2 compliance by Friday. We are NOT SOC 2 compliant. I am livid.",
        "I found a shared Google Doc called 'passwords (do not share).' I'm updating the acceptable use policy AND having a lie-down.",
        "The compliance training completion rate is 34%. Marcus hasn't started his. Victoria completed hers in 2 minutes (suspicious).",
        "Did anyone read the security policy update I sent? ...Anyone? The read receipts say no.",
        "I'm creating a compliance dashboard. Yes, another one. This one has charts AND conditional formatting.",
      ],
    },
  },
  ciso: {
    id: 'ciso', name: 'You', role: 'CISO',
    personality: 'Internal monologue. Weary gallows humor. Caught between everyone.',
    lines: {
      greeting: [
        "Another company. Another 'we've never been hacked' claim. Let's see how long that lasts.",
        "Day one. The risk register is empty. The budget is thin. The CEO just asked me what a firewall is. Here we go.",
        "My third CISO role. They're always 'excited about security' until they see the first invoice.",
        "The office is nice. The security posture is not. At least the coffee is good.",
      ],
      quarter_calm: [
        "No news is good news. But also, no news means Marcus thinks we don't need security.",
        "Quiet quarter. I should enjoy this. I won't, because I know what's coming.",
        "Nothing broke. Yet. I'll take the win and prepare for the inevitable.",
        "Calm before the storm, probably. Or maybe just calm. I don't trust calm.",
      ],
      quarter_breach: [
        "Well. That happened. Time to update the résumé. Again.",
        "Another day, another breach. They never listen until it's too late. Then they listen too much.",
        "The thing I warned about happened. I take no joy in being right. OK, a little joy.",
        "Breach response mode activated. Sleep mode deactivated. Indefinitely.",
      ],
      budget_tight: [
        "They want me to secure everything with the budget of a pizza party.",
        "Another quarter of choosing which systems to leave vulnerable. My favorite game.",
        "The budget says 'lean.' The threat landscape says 'good luck.'",
        "I wonder if it's too late to go back to development.",
      ],
      trust_critical: [
        "My position is 'under review.' That's corporate for 'start packing.'",
        "One more incident and I'll be updating LinkedIn from the parking lot.",
        "The board is 'evaluating options.' I am an option they're evaluating replacing.",
        "It was nice having an office. I should enjoy it while it lasts.",
      ],
      gameover_win: [
        "I survived. Against all odds, all budgets, and all of Marcus's suggestions. I survived.",
        "We made it. Time for that vacation I've been postponing since quarter one.",
      ],
      gameover_lose: [
        "Another CISO gig, another exit interview. At least I have material for the conference talk.",
        "Pack up the risk register. My replacement will need it. They always do.",
      ],
      trope: [
        "Another Monday. Another zero-day. At least the coffee is decent.",
        "Marcus just asked me to 'make us unhackable.' I'll get right on that.",
        "I should have been a dentist. Nobody asks dentists about their firewall configuration.",
        "The only thing standing between this company and disaster is me, a SIEM, and sheer luck.",
      ],
    },
  },
};
