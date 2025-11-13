import {
  type HandlerAttempt,
  HandlerStatus,
  type INodeSwitcher,
  type SwitchHandler,
  type SwitchOptions,
} from './types.js';

/**
 * Main class for switching Node.js versions
 * Manages handler registration and execution using Chain of Responsibility pattern
 */
export class NodeSwitcher implements INodeSwitcher {
  private handlers = new Map<string, SwitchHandler | (() => SwitchHandler)>();

  /**
   * Registers a new handler with a given name
   * @param name - Identifier for the handler
   * @param handler - Handler instance or factory function
   * @returns This instance for chaining
   */
  register(
    name: string,
    handler: SwitchHandler | (() => SwitchHandler),
  ): NodeSwitcher {
    this.handlers.set(name, handler);
    return this;
  }

  /**
   * Switches to the specified Node.js version
   * Tries handlers in the specified order until one succeeds or all fail
   * @param version - The Node.js version to switch to (e.g., "18.17.0")
   * @param options - Options including handler execution order
   * @returns Array of all handler attempts with their results
   * @throws Error if all handlers fail
   */
  async switchVersion(
    version: string,
    options?: SwitchOptions,
  ): Promise<HandlerAttempt[]> {
    const attempts: HandlerAttempt[] = [];
    const handlerOrder =
      options?.handlerOrder || Array.from(this.handlers.keys());

    // Build the chain of responsibility and get valid handler names
    const { chain, validHandlerNames } = this.buildHandlerChain(handlerOrder);

    if (!chain || validHandlerNames.length === 0) {
      throw new Error(
        'No handlers available. Please register at least one handler.',
      );
    }

    // Execute the chain
    let currentHandler: SwitchHandler | undefined = chain;
    let handlerIndex = 0;

    while (currentHandler && handlerIndex < validHandlerNames.length) {
      const handlerName = validHandlerNames[handlerIndex];

      try {
        const result = await currentHandler.handle(version);

        attempts.push({
          handlerName,
          status: result.status,
          message: result.message,
        });

        // If successful, return all attempts up to this point
        if (result.status === HandlerStatus.SUCCESS) {
          return attempts;
        }

        // Move to next handler in chain
        currentHandler = currentHandler.next;
        handlerIndex++;
      } catch (error) {
        // If a handler throws an error, log the attempt and stop
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        attempts.push({
          handlerName,
          status: HandlerStatus.ERROR,
          message: errorMessage,
        });

        // Stop execution and throw error with summary
        throw new Error(
          `Handler '${handlerName}' threw an error: ${errorMessage}\nAttempts made: ${JSON.stringify(attempts, null, 2)}`,
        );
      }
    }

    // All handlers failed - throw error with complete summary
    throw new Error(
      `All handlers failed to switch to version ${version}\nAttempts: ${JSON.stringify(attempts, null, 2)}`,
    );
  }

  /**
   * Builds a chain of handlers based on the specified order
   * @param handlerOrder - Array of handler names in execution order
   * @returns Object containing the first handler in the chain and array of valid handler names
   */
  private buildHandlerChain(handlerOrder: string[]): {
    chain: SwitchHandler | undefined;
    validHandlerNames: string[];
  } {
    const resolvedHandlers: SwitchHandler[] = [];
    const validHandlerNames: string[] = [];

    // Resolve all handlers (instantiate factories if needed)
    for (const name of handlerOrder) {
      const handler = this.handlers.get(name);

      if (!handler) {
        console.warn(`Handler '${name}' not found in registry. Skipping.`);
        continue;
      }

      // If it's a factory function, instantiate it
      const resolvedHandler =
        typeof handler === 'function' ? handler() : handler;
      resolvedHandlers.push(resolvedHandler);
      validHandlerNames.push(name);
    }

    if (resolvedHandlers.length === 0) {
      return { chain: undefined, validHandlerNames: [] };
    }

    // Link handlers in a chain
    for (let i = 0; i < resolvedHandlers.length - 1; i++) {
      resolvedHandlers[i].setNext(resolvedHandlers[i + 1]);
    }

    return { chain: resolvedHandlers[0], validHandlerNames };
  }
}
