import { beforeEach, describe, expect, it } from 'vitest';
import { BaseSwitchHandler } from './base-handler';
import { NodeSwitcher } from './node-switcher';
import { type HandlerResult, HandlerStatus, type Switcher } from './types';

// Mock success handler for testing
class MockSuccessHandler extends BaseSwitchHandler {
  async handle(version: string): Promise<HandlerResult> {
    return {
      status: HandlerStatus.SUCCESS,
      message: `Successfully switched to ${version}`,
    };
  }
}

// Mock failure handler for testing
class MockFailureHandler extends BaseSwitchHandler {
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
    switcher = new NodeSwitcher();
  });

  describe('Essential switcher contract', () => {
    it('should register handlers and return self for fluent interface', () => {
      const handler = new MockSuccessHandler();
      const result = switcher.register('nvm', handler);

      expect(result).toBe(switcher);
    });

    it('should try handler and return success attempt', async () => {
      const handler = new MockSuccessHandler();
      switcher.register('nvm', handler);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(1);
      expect(attempts[0].handlerName).toBe('nvm');
      expect(attempts[0].status).toBe(HandlerStatus.SUCCESS);
      expect(attempts[0].message).toContain('18.17.0');
    });

    it('should try multiple handlers until one succeeds', async () => {
      const failHandler = new MockFailureHandler();
      const successHandler = new MockSuccessHandler();

      switcher.register('nvm', failHandler).register('fnm', successHandler);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(2);
      expect(attempts[0].status).toBe(HandlerStatus.ERROR);
      expect(attempts[1].status).toBe(HandlerStatus.SUCCESS);
    });
  });
});
