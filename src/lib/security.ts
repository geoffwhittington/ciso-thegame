/** Control catalog shown after Execute is bought. Effort is unused; staff close one risk per slot. */
export const REQUIREMENTS: Record<string, { id: string; name: string; effort: number }[]> = {
  ACCESS:  [{ id: 'T1020', name: 'Implement role-based access control', effort: 140 }, { id: 'T1021', name: 'Enforce least-privilege access policies', effort: 100 }, { id: 'T1022', name: 'Authorization checks on every endpoint', effort: 120 }],
  INJ:     [{ id: 'T1001', name: 'Validate and sanitize all user inputs', effort: 120 }, { id: 'T1002', name: 'Use parameterized queries', effort: 80 }],
  MISCONF: [{ id: 'T1030', name: 'Harden default configurations', effort: 90 }, { id: 'T1031', name: 'Infrastructure-as-code with security baselines', effort: 110 }],
  AUTH:    [{ id: 'T1010', name: 'Implement multi-factor authentication', effort: 140 }, { id: 'T1011', name: 'Enforce secure session management', effort: 100 }],
  VULN:    [{ id: 'T1040', name: 'Automated dependency scanning in CI/CD', effort: 100 }, { id: 'T1041', name: 'Maintain software bill of materials', effort: 80 }],
  EXPOSE:  [{ id: 'T1050', name: 'Encrypt sensitive data at rest and in transit', effort: 130 }, { id: 'T1051', name: 'Data classification and DLP controls', effort: 110 }],
  LOG:     [{ id: 'T1060', name: 'Centralized security logging and alerting', effort: 90 }, { id: 'T1061', name: 'Incident detection and response playbooks', effort: 80 }],
  SSRF:    [{ id: 'T1070', name: 'Allowlist server-side request targets', effort: 100 }, { id: 'T1071', name: 'Network segmentation for internal services', effort: 120 }],
  SUPPLY:  [{ id: 'T1080', name: 'Verify third-party dependency integrity', effort: 110 }, { id: 'T1081', name: 'Secure artifact repository with signing', effort: 100 }],
  PROMPT:  [{ id: 'T5001', name: 'Prompt boundary validation and filtering', effort: 150 }, { id: 'T5002', name: 'Separate system and user prompt contexts', effort: 120 }, { id: 'T5003', name: 'Output validation before downstream actions', effort: 100 }],
  LEAK:    [{ id: 'T5010', name: 'PII/sensitive data output filtering', effort: 130 }, { id: 'T5011', name: 'Guardrails for training data protection', effort: 110 }],
  AGENCY:  [{ id: 'T5020', name: 'Least-privilege agent tool access', effort: 140 }, { id: 'T5021', name: 'Human-in-the-loop for high-risk actions', effort: 120 }, { id: 'T5022', name: 'Action rate limiting and scope constraints', effort: 100 }],
  POISON:  [{ id: 'T5030', name: 'Training data provenance validation', effort: 150 }, { id: 'T5031', name: 'Model behavior anomaly detection', effort: 130 }],
  THEFT:   [{ id: 'T5040', name: 'API rate limiting and query budgets', effort: 110 }, { id: 'T5041', name: 'Model fingerprinting and access logging', effort: 100 }],
};
