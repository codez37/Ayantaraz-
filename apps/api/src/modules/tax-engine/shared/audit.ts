export interface AuditEntry {
  id: string;
  timestamp: string;
  calcType: string;
  inputs: Record<string, unknown>;
  rulesApplied: string[];
  articleRefs: string[];
  finalFormula: string;
  result: {
    grossAmount: number;
    taxAmount: number;
    effectiveRate: number;
    breakdown: Array<{
      range: string;
      rate: number;
      taxable: number;
      tax: number;
    }>;
  };
  confidence: {
    score: number;
    version: string;
  };
}

const AUDIT_STORE = new Map<string, AuditEntry>();
const MAX_AUDIT_ENTRIES = 500;

let auditCounter = 0;

export function createAuditEntry(
  entry: Omit<AuditEntry, 'id' | 'timestamp'>,
): AuditEntry {
  auditCounter++;
  const auditEntry: AuditEntry = {
    id: `audit_${Date.now()}_${auditCounter}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  AUDIT_STORE.set(auditEntry.id, auditEntry);

  // Evict old entries
  if (AUDIT_STORE.size > MAX_AUDIT_ENTRIES) {
    const firstKey = AUDIT_STORE.keys().next().value;
    if (firstKey) AUDIT_STORE.delete(firstKey);
  }

  return auditEntry;
}

export function getAuditEntry(id: string): AuditEntry | undefined {
  return AUDIT_STORE.get(id);
}

export function getRecentAudits(limit = 20): AuditEntry[] {
  return [...AUDIT_STORE.values()]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}
