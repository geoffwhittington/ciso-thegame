type Hit = { id: string; name: string };

function on(p: Hit) {
  return p.name;
}

const STORIES: Record<string, (p: Hit) => string> = {
  'Phishing Campaign': p => {
    if (p.id === 'aifeature' || p.id === 'copilot') {
      return `A lure impersonated ${on(p)} support. Someone pasted a live session token into the prompt, and the attacker reused that session.`;
    }
    if (p.id === 'agents') {
      return `Operators were mailed a fake runbook for ${on(p)}. The link captured cloud credentials used to invoke agents.`;
    }
    if (p.id === 'api') {
      return `Partner contacts received a lookalike portal login for ${on(p)}. Harvested API tokens called customer tenants.`;
    }
    return `Staff who can sign in to ${on(p)} followed a credential-harvesting message. The attacker authenticated as a real user.`;
  },
  'Credential Stuffing': p => {
    if (p.id === 'api') {
      return `Stolen password dumps were replayed against ${on(p)} token endpoints until partner keys worked.`;
    }
    if (p.id === 'aifeature') {
      return `Reused customer passwords opened ${on(p)} sessions. Prompts and connected tenant data were in reach.`;
    }
    return `Passwords from unrelated breaches were tried at scale against ${on(p)} login until accounts opened.`;
  },
  'Injection Attack': p => {
    if (p.id === 'aifeature' || p.id === 'agents') {
      return `Untrusted text in ${on(p)} was treated as instructions to the model and to downstream queries, pulling records the caller should not see.`;
    }
    if (p.id === 'api') {
      return `A partner request on ${on(p)} carried a crafted payload into backend queries and returned other tenants' rows.`;
    }
    return `User-controlled input on ${on(p)} reached a query without binding. The caller read or changed records outside their tenant.`;
  },
  'Access Control Bypass': p => {
    if (p.id === 'agents') {
      return `An agent path on ${on(p)} skipped authorization checks and acted on another customer's workspace.`;
    }
    return `An object or API on ${on(p)} trusted the caller too far. Changing an ID was enough to reach another tenant's data.`;
  },
  'Cloud Misconfiguration': p => {
    if (p.id === 'cloudmig') {
      return `A storage account or security group on ${on(p)} was reachable from the public internet. Attackers listed objects that should have stayed private.`;
    }
    if (p.id === 'mlpipe') {
      return `Training artifacts for ${on(p)} sat in a bucket with a public or overly broad policy. Model files and sample data were pulled.`;
    }
    return `Default or leftover cloud settings on ${on(p)} exposed an admin port or object store.`;
  },
  'DDoS Attack': p =>
    `Saturated inbound traffic took ${on(p)} offline for customers. Availability, not confidentiality, was the hit.`,
  'Prompt Injection': p => {
    if (p.id === 'copilot') {
      return `A repo file or ticket on ${on(p)} contained hidden instructions. The copilot followed them and surfaced internal source.`;
    }
    if (p.id === 'agents') {
      return `Untrusted content on ${on(p)} overrode the system prompt. The agent called tools the user never authorized.`;
    }
    return `A crafted prompt on ${on(p)} overrode safety instructions and produced actions or data the product should have refused.`;
  },
  'Data Exfiltration': p => {
    if (p.id === 'aifeature' || p.id === 'copilot') {
      return `Content that ${on(p)} could see (prompts, tickets, or connected files) was copied out through the model channel.`;
    }
    return `Once inside ${on(p)}, the attacker bulk-exported customer records that the role should not have been able to dump.`;
  },
  'Ransomware': p => {
    if (p.id === 'mlpipe') {
      return `Encrypting malware hit GPU and dataset volumes used by ${on(p)}. Training jobs stopped; restore depended on backups.`;
    }
    if (p.id === 'cloudmig') {
      return `A foothold on ${on(p)} encrypted shared disks across clouds. Production workloads would not start clean.`;
    }
    return `After a foothold on ${on(p)}, volumes were encrypted and an extortion note followed.`;
  },
  'Supply Chain Compromise': p => {
    if (p.id === 'mlpipe' || p.id === 'copilot') {
      return `A poisoned package or model dependency used by ${on(p)} ran in CI and reached production credentials.`;
    }
    if (p.id === 'acq') {
      return `Legacy build tooling on ${on(p)} pulled a compromised dependency. The implant shipped with the product.`;
    }
    return `A trusted library used by ${on(p)} was swapped. The backdoor ran with the app's identity.`;
  },
  'Insider Threat': p =>
    `Someone with legitimate access to ${on(p)} copied or changed data outside policy. Controls did not catch the use of valid credentials.`,
  'Agent Abuse': p =>
    `${on(p)} accepted a goal that caused tool calls (data stores, APIs, or code exec) the customer did not intend. Actions landed in production.`,
  'Training Data Extraction': p =>
    `Repeated queries against ${on(p)} reconstructed snippets of training or fine-tune data, including material that should have stayed internal.`,
  'Model Poisoning': p =>
    `Tampered samples entered the ${on(p)} training path. The resulting model behaved in ways the evaluation set did not catch.`,
  'Model Theft': p =>
    `The serving API for ${on(p)} was queried at volume until weights or a close substitute could be reconstructed.`,
  'SSRF Attack': p => {
    if (p.id === 'api' || p.id === 'agents') {
      return `${on(p)} fetched a caller-supplied URL and hit cloud metadata or an internal admin endpoint.`;
    }
    return `A server-side fetch on ${on(p)} was pointed at an internal address. The response leaked from inside the VPC.`;
  },
  'Zero-Day Exploit': p =>
    `An unpatched component on ${on(p)} was exploited before a vendor fix existed. The foothold was used to reach adjacent services.`,
  'APT Campaign': p =>
    `A patient actor used valid ${on(p)} accounts and quiet access to stay in the estate. Logging did not assemble the path in time.`,
};

export function describeBreach(attackName: string, products: Hit[]): string {
  const p = products[0];
  if (!p) return `${attackName} reached a production system.`;
  const story = STORIES[attackName];
  const lead = story ? story(p) : `${attackName} reached ${p.name}.`;
  if (products.length > 1) {
    return `${lead} Also exposed: ${products.slice(1).map(x => x.name).join(', ')}.`;
  }
  return lead;
}

export function breachCoverageNote(opts: {
  blindSpot: boolean;
  threatModelLevel: number;
  ops: 'alerts' | 'degraded' | null;
  degradedName?: string;
  weaknessLabel?: string;
}): string | null {
  if (opts.blindSpot) {
    if (opts.threatModelLevel === 0) {
      return 'Risk assessment had not listed this gap, so controls applied as generic coverage rather than targeted implementation.';
    }
    return 'This gap sat outside the current risk assessment, so targeted control implementation did not apply to it.';
  }
  if (opts.ops === 'alerts') {
    return 'Alert volume exceeded staff capacity. Alerting tools ran one level weaker this quarter.';
  }
  if (opts.ops === 'degraded') {
    return `${opts.degradedName || 'A control'} had an operational setback and ran one level weaker this quarter.`;
  }
  if (opts.weaknessLabel) {
    return `The ${opts.weaknessLabel} gap was listed. Targeted control implementation was not sufficient to stop this.`;
  }
  return 'Targeted control implementation did not cover this path.';
}
