import { beforeEach, describe, expect, it } from 'vitest';
import {
  BaseSwitchHandler,
  type HandlerResult,
  HandlerStatus,
  NodeSwitcher,
} from '../src/index.js';

// Mock handlers for testing
class MockSuccessHandler extends BaseSwitchHandler {
  constructor(private handlerName: string) {
    super();
  }

  async handle(version: string): Promise<HandlerResult> {
    return {
      status: HandlerStatus.SUCCESS,
      message: `${this.handlerName} successfully switched to ${version}`,
    };
  }
}

class MockFailureHandler extends BaseSwitchHandler {
  constructor(private handlerName: string) {
    super();
  }

  async handle(_version: string): Promise<HandlerResult> {
    return {
      status: HandlerStatus.ERROR,
      message: `${this.handlerName} failed to switch version`,
    };
  }
}

class MockThrowingHandler extends BaseSwitchHandler {
  async handle(_version: string): Promise<HandlerResult> {
    throw new Error('Handler threw an unexpected error');
  }
}

describe('NodeSwitcher', () => {
  let switcher: NodeSwitcher;

  beforeEach(() => {
    switcher = new NodeSwitcher();
  });

  describe('registration', () => {
    it('should register handlers with names', () => {
      const handler = new MockSuccessHandler('test');
      const result = switcher.register('test', handler);
      expect(result).toBe(switcher); // Should return itself for chaining
    });

    it('should register handler factories', () => {
      const result = switcher.register(
        'test',
        () => new MockSuccessHandler('test'),
      );
      expect(result).toBe(switcher);
    });

    it('should support chaining registrations', () => {
      const result = switcher
        .register('handler1', new MockSuccessHandler('handler1'))
        .register('handler2', new MockSuccessHandler('handler2'));
      expect(result).toBe(switcher);
    });
  });

  describe('switchVersion', () => {
    it('should return attempts when first handler succeeds', async () => {
      switcher.register('handler1', new MockSuccessHandler('handler1'));
      switcher.register('handler2', new MockSuccessHandler('handler2'));

      const attempts = await switcher.switchVersion('18.17.0', {
        handlerOrder: ['handler1', 'handler2'],
      });

      expect(attempts).toHaveLength(1);
      expect(attempts[0]).toEqual({
        handlerName: 'handler1',
        status: HandlerStatus.SUCCESS,
        message: 'handler1 successfully switched to 18.17.0',
      });
    });

    it('should try next handler when first one fails', async () => {
      switcher.register('handler1', new MockFailureHandler('handler1'));
      switcher.register('handler2', new MockSuccessHandler('handler2'));

      const attempts = await switcher.switchVersion('18.17.0', {
        handlerOrder: ['handler1', 'handler2'],
      });

      expect(attempts).toHaveLength(2);
      expect(attempts[0].status).toBe(HandlerStatus.ERROR);
      expect(attempts[1].status).toBe(HandlerStatus.SUCCESS);
    });

    it('should throw error with all attempts when all handlers fail', async () => {
      switcher.register('handler1', new MockFailureHandler('handler1'));
      switcher.register('handler2', new MockFailureHandler('handler2'));

      await expect(
        switcher.switchVersion('18.17.0', {
          handlerOrder: ['handler1', 'handler2'],
        }),
      ).rejects.toThrow('All handlers failed to switch to version 18.17.0');
    });

    it('should use all registered handlers when handlerOrder is not specified', async () => {
      switcher.register('handler1', new MockFailureHandler('handler1'));
      switcher.register('handler2', new MockSuccessHandler('handler2'));

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts.length).toBeGreaterThan(0);
      expect(attempts[attempts.length - 1].status).toBe(HandlerStatus.SUCCESS);
    });

    it('should instantiate factory functions', async () => {
      switcher.register('handler1', () => new MockSuccessHandler('handler1'));

      const attempts = await switcher.switchVersion('18.17.0', {
        handlerOrder: ['handler1'],
      });

      expect(attempts).toHaveLength(1);
      expect(attempts[0].status).toBe(HandlerStatus.SUCCESS);
    });

    it('should throw error when handler throws exception', async () => {
      switcher.register('handler1', new MockThrowingHandler());
      switcher.register('handler2', new MockSuccessHandler('handler2'));

      await expect(
        switcher.switchVersion('18.17.0', {
          handlerOrder: ['handler1', 'handler2'],
        }),
      ).rejects.toThrow("Handler 'handler1' threw an error");
    });

    it('should throw error when no handlers are registered', async () => {
      await expect(switcher.switchVersion('18.17.0')).rejects.toThrow(
        'No handlers available',
      );
    });

    it('should skip handlers not found in registry', async () => {
      switcher.register('handler1', new MockSuccessHandler('handler1'));

      const attempts = await switcher.switchVersion('18.17.0', {
        handlerOrder: ['nonexistent', 'handler1'],
      });

      expect(attempts).toHaveLength(1);
      expect(attempts[0].handlerName).toBe('handler1');
    });
  });

  describe('Chain of Responsibility', () => {
    it('should properly link handlers in a chain', async () => {
      const handler1 = new MockFailureHandler('handler1');
      const handler2 = new MockFailureHandler('handler2');
      const handler3 = new MockSuccessHandler('handler3');

      switcher
        .register('handler1', handler1)
        .register('handler2', handler2)
        .register('handler3', handler3);

      const attempts = await switcher.switchVersion('18.17.0', {
        handlerOrder: ['handler1', 'handler2', 'handler3'],
      });

      expect(attempts).toHaveLength(3);
      expect(attempts[0].handlerName).toBe('handler1');
      expect(attempts[1].handlerName).toBe('handler2');
      expect(attempts[2].handlerName).toBe('handler3');
      expect(attempts[2].status).toBe(HandlerStatus.SUCCESS);
    });
  });
});
