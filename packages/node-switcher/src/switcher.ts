import { AllHandlersFailedError } from './errors';
import type {
  HandlerAttempt,
  Switcher as ISwitcher,
  SwitchHandler,
  SwitchOptions,
} from './types';
import { HandlerStatus } from './types';

export class Switcher implements ISwitcher {
  private handlers: Map<string, SwitchHandler | (() => SwitchHandler)> =
    new Map();

  register(
    name: string,
    handler: SwitchHandler | (() => SwitchHandler),
  ): Switcher {
    this.handlers.set(name, handler);
    return this;
  }

  async switchVersion(
    version: string,
    options?: SwitchOptions,
  ): Promise<HandlerAttempt[]> {
    const handlerOrder =
      options?.handlerOrder || Array.from(this.handlers.keys());
    const attempts: HandlerAttempt[] = [];

    for (const handlerName of handlerOrder) {
      const handlerOrFactory = this.handlers.get(handlerName);

      if (!handlerOrFactory) {
        attempts.push({
          handlerName,
          status: HandlerStatus.ERROR,
          message: `Handler '${handlerName}' not registered`,
        });
        continue;
      }

      const handler =
        typeof handlerOrFactory === 'function'
          ? handlerOrFactory()
          : handlerOrFactory;

      try {
        const result = await handler.handle(version);

        attempts.push({
          handlerName,
          status: result.status,
          message: result.message,
        });

        if (result.status === HandlerStatus.SUCCESS) {
          return attempts;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        attempts.push({
          handlerName,
          status: HandlerStatus.ERROR,
          message: `Unexpected error: ${errorMessage}`,
        });
        throw new AllHandlersFailedError(
          attempts,
          `Handler '${handlerName}' threw an error`,
        );
      }
    }

    throw new AllHandlersFailedError(attempts);
  }
}
