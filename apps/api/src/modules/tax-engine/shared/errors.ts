import { ErrorCode, ErrorSeverity } from '../../shared/errors';

export { ErrorCode, ErrorSeverity };

export interface AppError {
  errorCode: ErrorCode;
  severity: ErrorSeverity;
  message: string;
  recoverable: boolean;
}

export function createError(code: ErrorCode, message: string): AppError {
  const severity =
    code === ErrorCode.WRITE_FAILED || code === ErrorCode.INVALID_INPUT
      ? ErrorSeverity.RECOVERABLE
      : ErrorSeverity.FATAL;
  return {
    errorCode: code,
    severity,
    message,
    recoverable: severity === ErrorSeverity.RECOVERABLE,
  };
}
