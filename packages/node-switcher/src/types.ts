export enum SwitchStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum HandlerStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface HandlerAttempt {
  handlerName: string;
  status: HandlerStatus;
  message: string;
}

export interface SwitchOptions<T> {
  handlerOrder?: T[];
}

export type SwitchHandler = (version: string) => Promise<HandlerAttempt>;

export interface Switcher<T> {
  register(name: T, handler: SwitchHandler): Switcher<T>;
  switchVersion(
    version: string,
    options?: SwitchOptions<T>,
  ): Promise<HandlerAttempt[]>;
}
