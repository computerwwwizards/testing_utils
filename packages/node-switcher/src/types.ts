export enum HandlerStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface HandlerAttempt {
  handlerName: string;
  status: HandlerStatus;
  message: string;
}

export interface HandlerResult {
  status: HandlerStatus;
  message: string;
}

export interface SwitchOptions {
  handlerOrder?: string[];
}

export interface SwitchHandler {
  next?: SwitchHandler;
  handle(version: string): Promise<HandlerResult>;
  setNext(handler: SwitchHandler): SwitchHandler;
}

export interface Switcher {
  register(
    name: string,
    handler: SwitchHandler | (() => SwitchHandler),
  ): Switcher;
  switchVersion(
    version: string,
    options?: SwitchOptions,
  ): Promise<HandlerAttempt[]>;
}
