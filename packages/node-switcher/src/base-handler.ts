import type { HandlerResult, SwitchHandler } from './types.js';

/**
 * Base abstract class for implementing Switch Handlers
 * Implements the Chain of Responsibility pattern
 */
export abstract class BaseSwitchHandler implements SwitchHandler {
  public next?: SwitchHandler;

  /**
   * Sets the next handler in the chain
   * @param handler - The next handler to be called if this one fails
   * @returns The next handler for chaining
   */
  setNext(handler: SwitchHandler): SwitchHandler {
    this.next = handler;
    return handler;
  }

  /**
   * Handles the version switch request
   * @param version - The Node.js version to switch to
   * @returns Result of the switch attempt
   */
  abstract handle(version: string): Promise<HandlerResult>;
}
