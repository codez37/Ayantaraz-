export enum ErrorCode {
  DB_ERROR = 'DB_ERROR',
  INDEX_CORRUPTED = 'INDEX_CORRUPTED',
  SEARCH_DOWN = 'SEARCH_DOWN',
  SESSION_CREATION_FAILED = 'SESSION_CREATION_FAILED',
  COMPUTATION_FAILED = 'COMPUTATION_FAILED',
  WRITE_FAILED = 'WRITE_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  TAX_ENGINE_UNAVAILABLE = 'TAX_ENGINE_UNAVAILABLE',
  CHATBOT_UNAVAILABLE = 'CHATBOT_UNAVAILABLE',
}

export enum ErrorSeverity {
  FATAL = 'FATAL',
  RECOVERABLE = 'RECOVERABLE',
}

export interface AppError {
  errorCode: ErrorCode;
  severity: ErrorSeverity;
  message: string;
  recoverable: boolean;
}

const SEVERITY_MAP: Record<ErrorCode, ErrorSeverity> = {
  [ErrorCode.DB_ERROR]: ErrorSeverity.FATAL,
  [ErrorCode.INDEX_CORRUPTED]: ErrorSeverity.FATAL,
  [ErrorCode.SEARCH_DOWN]: ErrorSeverity.FATAL,
  [ErrorCode.SESSION_CREATION_FAILED]: ErrorSeverity.FATAL,
  [ErrorCode.COMPUTATION_FAILED]: ErrorSeverity.FATAL,
  [ErrorCode.WRITE_FAILED]: ErrorSeverity.RECOVERABLE,
  [ErrorCode.INVALID_INPUT]: ErrorSeverity.RECOVERABLE,
  [ErrorCode.TAX_ENGINE_UNAVAILABLE]: ErrorSeverity.RECOVERABLE,
  [ErrorCode.CHATBOT_UNAVAILABLE]: ErrorSeverity.RECOVERABLE,
};

export function createError(code: ErrorCode, message: string): AppError {
  const severity = SEVERITY_MAP[code];
  return {
    errorCode: code,
    severity,
    message,
    recoverable: severity === ErrorSeverity.RECOVERABLE,
  };
}

export function isFatal(error: AppError): boolean {
  return error.severity === ErrorSeverity.FATAL;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[`${}]/g, '')
    .trim()
    .slice(0, 500);
}
