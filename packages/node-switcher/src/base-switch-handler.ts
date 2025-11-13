import type { HandlerResult, SwitchHandler } from './types';

export abstract class BaseSwitchHandler implements SwitchHandler {
  next?: SwitchHandler;

  abstract handle(version: string): Promise<HandlerResult>;

  setNext(handler: SwitchHandler): SwitchHandler {
    this.next = handler;
    return handler;
  }
}
