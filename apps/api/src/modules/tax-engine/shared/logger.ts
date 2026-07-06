export interface LogEntry {
  traceId: string;
  timestamp: string;
  module: 'tax_engine' | 'chatbot';
  intent?: string;
  confidence?: number;
  route?: string;
  latency: number;
  userId?: number;
  sessionId?: string;
  messagePreview?: string;
  result?: string;
  error?: string;
}

export interface TraceContext {
  traceId: string;
  startTime: number;
  module: string;
}

const TRACE_STORE = new Map<string, LogEntry>();
const MAX_ENTRIES = 1000;

export function createTraceId(): string {
  return `tr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function startTrace(module: string): TraceContext {
  return {
    traceId: createTraceId(),
    startTime: Date.now(),
    module,
  };
}

export function endTrace(
  ctx: TraceContext,
  entry: Partial<LogEntry>,
): LogEntry {
  const log: LogEntry = {
    traceId: ctx.traceId,
    timestamp: new Date().toISOString(),
    module: ctx.module as LogEntry['module'],
    latency: Date.now() - ctx.startTime,
    ...entry,
  };

  TRACE_STORE.set(log.traceId, log);

  // Evict old entries
  if (TRACE_STORE.size > MAX_ENTRIES) {
    const firstKey = TRACE_STORE.keys().next().value;
    if (firstKey) TRACE_STORE.delete(firstKey);
  }

  return log;
}

export function getTrace(traceId: string): LogEntry | undefined {
  return TRACE_STORE.get(traceId);
}
