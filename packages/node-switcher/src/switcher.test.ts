import { beforeEach, describe, expect, it } from 'vitest';
import { BaseSwitchHandler } from './base-switch-handler';
import { Switcher } from './switcher';
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

describe('Switcher Behavior', () => {
  let switcher: Switcher;

  beforeEach(() => {
    switcher = new Switcher();
  });

  describe('Essential switcher contract', () => {
    it('should register handlers and return self for fluent interface', () => {
      const result = switcher.register('nvm', new MockSuccessHandler());

      expect(result).toBe(switcher);
    });

    it('should try handler and return success attempt', async () => {
      switcher.register('nvm', new MockSuccessHandler());

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(1);
      expect(attempts[0].handlerName).toBe('nvm');
      expect(attempts[0].status).toBe(HandlerStatus.SUCCESS);
      expect(attempts[0].message).toContain('18.17.0');
    });

    it('should try multiple handlers until one succeeds', async () => {
      switcher
        .register('nvm', new MockErrorHandler())
        .register('fnm', new MockSuccessHandler());

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(2);
      expect(attempts[0].status).toBe(HandlerStatus.ERROR);
      expect(attempts[1].status).toBe(HandlerStatus.SUCCESS);
    });
  });
});
