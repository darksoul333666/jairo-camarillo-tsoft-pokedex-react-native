export type AppErrorCode =
  | 'Network'
  | 'Server'
  | 'InvalidData'
  | 'Storage'
  | 'Unknown';

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}
