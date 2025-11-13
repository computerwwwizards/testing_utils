import { describe, expect, it } from 'vitest';
import { BaseSwitchHandler } from './base-switch-handler';
import { type HandlerResult, HandlerStatus } from './types';

class MockSuccessHandler extends BaseSwitchHandler {
  async handle(version: string): Promise<HandlerResult> {
    return {
      status: HandlerStatus.SUCCESS,
      message: `Successfully switched to ${version}`,
    };
  }
}

class MockErrorHandler extends BaseSwitchHandler {
  async handle(_version: string): Promise<HandlerResult> {
    return {
      status: HandlerStatus.ERROR,
      message: 'Handler failed to switch version',
    };
  }
}

describe('SwitchHandler Behavior', () => {
  describe('Essential handler contract', () => {
    it('should handle version switching with success status', async () => {
      const handler = new MockSuccessHandler();
      const result = await handler.handle('18.17.0');

      expect(result.status).toBe(HandlerStatus.SUCCESS);
      expect(result.message).toContain('18.17.0');
    });

    it('should handle version switching with error status', async () => {
      const handler = new MockErrorHandler();
      const result = await handler.handle('18.17.0');

      expect(result.status).toBe(HandlerStatus.ERROR);
      expect(result.message).toContain('failed');
    });
  });

  describe('Chain of responsibility', () => {
    it('should support setting next handler and return it', () => {
      const handler1 = new MockSuccessHandler();
      const handler2 = new MockErrorHandler();

      const returnedHandler = handler1.setNext(handler2);

      expect(returnedHandler).toBe(handler2);
      expect(handler1.next).toBe(handler2);
    });
  });
});
