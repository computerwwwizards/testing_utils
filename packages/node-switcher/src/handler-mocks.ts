import { BaseSwitchHandler } from './base-switch-handler';
import { type HandlerResult, HandlerStatus } from './types';

export class MockSuccessHandler extends BaseSwitchHandler {
  async handle(version: string): Promise<HandlerResult> {
    return {
      status: HandlerStatus.SUCCESS,
      message: `Successfully switched to ${version}`,
    };
  }
}

export class MockErrorHandler extends BaseSwitchHandler {
  async handle(_version: string): Promise<HandlerResult> {
    return {
      status: HandlerStatus.ERROR,
      message: 'Handler failed to switch version',
    };
  }
}
