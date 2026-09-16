export const SOURCE_URLS: Record<string, string> = {
  'Verizon DBIR 2024': 'https://www.verizon.com/business/resources/reports/dbir/',
  'OWASP Top 10': 'https://owasp.org/Top10/',
  'OWASP LLM Top 10': 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  'MITRE ATT&CK': 'https://attack.mitre.org/',
  'MITRE ATLAS': 'https://atlas.mitre.org/',
  'IBM Cost of a Data Breach 2024': 'https://newsroom.ibm.com/2024-07-30-ibm-report-escalating-data-breach-disruption-pushes-costs-to-new-highs',
  'IBM Cost of Data Breach 2024': 'https://newsroom.ibm.com/2024-07-30-ibm-report-escalating-data-breach-disruption-pushes-costs-to-new-highs',
  'Microsoft SDL': 'https://learn.microsoft.com/en-us/archive/msdn-magazine/2005/november/a-look-inside-the-security-development-lifecycle-at-microsoft',
  'Microsoft / ACSAC': 'https://www.acsac.org/2004/papers/Lipner.pdf',
  'NIST / SEI': 'https://www.sei.cmu.edu/blog/data-driven-software-assurance/',
  'NIST CSF 2.0': 'https://www.nist.gov/cyberframework',
  'EU AI Act': 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
  'SEC Rules 2024': 'https://www.sec.gov/newsroom/press-releases/2023-139',
};

export const OWASP_PAGE: Record<string, string> = {
  A01: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
  A03: 'https://owasp.org/Top10/A03_2021-Injection/',
  A05: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
  A10: 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/',
  LLM01: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  LLM03: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  LLM06: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  LLM08: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
  LLM10: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
};

export function urlForSource(source: string): string | undefined {
  return SOURCE_URLS[source];
}

export function urlForCitation(citation: string, source: string): string {
  const key = Object.keys(OWASP_PAGE).find(k => (citation || '').startsWith(k));
  if (key) return OWASP_PAGE[key];
  return SOURCE_URLS[source] ?? SOURCE_URLS['Verizon DBIR 2024'];
}

export const FOOTER_SOURCES = [
  { label: 'Verizon DBIR 2024', url: SOURCE_URLS['Verizon DBIR 2024'] },
  { label: 'OWASP Top 10', url: SOURCE_URLS['OWASP Top 10'] },
  { label: 'OWASP LLM Top 10', url: SOURCE_URLS['OWASP LLM Top 10'] },
  { label: 'MITRE ATT&CK', url: SOURCE_URLS['MITRE ATT&CK'] },
  { label: 'IBM Cost of a Data Breach 2024', url: SOURCE_URLS['IBM Cost of a Data Breach 2024'] },
  { label: 'Howard, MSDN 2005 (SDL)', url: SOURCE_URLS['Microsoft SDL'] },
  { label: 'Lipner, ACSAC 2004', url: SOURCE_URLS['Microsoft / ACSAC'] },
  { label: 'NIST / SEI defect cost', url: SOURCE_URLS['NIST / SEI'] },
] as const;
