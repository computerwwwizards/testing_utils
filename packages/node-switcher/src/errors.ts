import type { HandlerAttempt } from './types';

export class AllHandlersFailedError extends Error {
  constructor(
    public readonly attempts: HandlerAttempt[],
    message?: string,
  ) {
    super(message || AllHandlersFailedError.formatMessage(attempts));
    this.name = 'AllHandlersFailedError';
    Object.setPrototypeOf(this, AllHandlersFailedError.prototype);
  }

  private static formatMessage(attempts: HandlerAttempt[]): string {
    const attemptSummary = attempts
      .map((a) => `  - ${a.handlerName}: ${a.message}`)
      .join('\n');
    return `All handlers failed to switch Node.js version:\n${attemptSummary}`;
  }
}
