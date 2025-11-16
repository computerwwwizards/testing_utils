export const enum SwitchStatus {
  SUCCESS = "success",
  ERROR = "error"
}

export const enum HandlerStatus {
  SUCCESS = "success",
  ERROR = "error"
}

export interface HandlerAttempt {
  handlerName: string;
  status: HandlerStatus;
  message: string;
}

export interface SwitchOptions<T> {
  handlerOrder?: T[];
}

export interface Switcher<T> {
  register(name: T, handler: () => HandlerAttempt): Switcher<T>;
  switchVersion(version: string, options?: SwitchOptions<T>): Promise<HandlerAttempt[]>;
}