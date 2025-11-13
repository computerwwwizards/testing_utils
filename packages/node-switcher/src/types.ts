/**
 * Status of a handler attempt
 */
export enum HandlerStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Result of a single handler attempt
 */
export interface HandlerAttempt {
  handlerName: string;
  status: HandlerStatus;
  message: string;
}

/**
 * Result returned by a handler's handle method
 */
export interface HandlerResult {
  status: HandlerStatus;
  message: string;
}

/**
 * Options for switching Node.js version
 */
export interface SwitchOptions {
  handlerOrder?: string[];
}

/**
 * Interface for a handler in the Chain of Responsibility
 */
export interface SwitchHandler {
  next?: SwitchHandler;
  handle(version: string): Promise<HandlerResult>;
  setNext(handler: SwitchHandler): SwitchHandler;
}

/**
 * Interface for the main NodeSwitcher class
 */
export interface INodeSwitcher {
  register(
    name: string,
    handler: SwitchHandler | (() => SwitchHandler),
  ): INodeSwitcher;
  switchVersion(
    version: string,
    options?: SwitchOptions,
  ): Promise<HandlerAttempt[]>;
}
