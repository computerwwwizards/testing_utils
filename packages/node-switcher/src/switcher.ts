import {
  type HandlerAttempt,
  HandlerStatus,
  type Switcher as ISwitcher,
  type SwitchHandler,
  type SwitchOptions,
} from './types';

export class Switcher<T extends string> implements ISwitcher<T> {
  private handlers: Map<T, SwitchHandler> = new Map();

  register(name: T, handler: SwitchHandler): Switcher<T> {
    this.handlers.set(name, handler);
    return this;
  }

  async switchVersion(
    version: string,
    options?: SwitchOptions<T>,
  ): Promise<HandlerAttempt[]> {
    const attempts: HandlerAttempt[] = [];
    const handlerOrder =
      options?.handlerOrder || Array.from(this.handlers.keys());

    for (const handlerName of handlerOrder) {
      const handler = this.handlers.get(handlerName);
      if (!handler) {
        continue;
      }

      try {
        const attempt = await handler(version);
        attempts.push(attempt);

        if (attempt.status === HandlerStatus.SUCCESS) {
          return attempts;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        attempts.push({
          handlerName: String(handlerName),
          status: HandlerStatus.ERROR,
          message: errorMessage,
        });

        throw new Error(this.formatErrorSummary(version, attempts));
      }
    }

    if (
      attempts.length > 0 &&
      attempts.every((attempt) => attempt.status === HandlerStatus.ERROR)
    ) {
      throw new Error(this.formatErrorSummary(version, attempts));
    }

    return attempts;
  }

  private formatErrorSummary(
    version: string,
    attempts: HandlerAttempt[],
  ): string {
    const lines = [
      `All handlers failed to switch to Node.js v${version}`,
      `Handlers attempted: ${attempts.length}`,
      'Results:',
    ];

    for (const attempt of attempts) {
      lines.push(`  ✗ ${attempt.handlerName}: ${attempt.message}`);
    }

    return lines.join('\n');
  }
}
