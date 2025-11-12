import { describe, expect, it, beforeEach } from 'vitest';
import { HandlerStatus, type HandlerAttempt, type SwitchHandler, type Switcher, type SwitchOptions } from './types';

let mockSwitcher: Switcher = null as unknown as Switcher;
let mockHandler: SwitchHandler = null as unknown as SwitchHandler;

describe('Switcher Behavior', () => {
  let switcher: Switcher;

  beforeEach(() => {
    switcher = mockSwitcher;
  });

  describe('Essential switcher contract', () => {
    it('should register handlers and return self for fluent interface', () => {
      const result = switcher.register('nvm', mockHandler);

      expect(result).toBe(switcher);
    });

    it('should try handler and return success attempt', async () => {
      switcher.register('nvm', mockHandler);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(1);
      expect(attempts[0].handlerName).toBe('nvm');
      expect(attempts[0].status).toBe(HandlerStatus.SUCCESS);
      expect(attempts[0].message).toContain('18.17.0');
    });

    it('should try multiple handlers until one succeeds', async () => {
      switcher
        .register('nvm', mockHandler)
        .register('fnm', mockHandler);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(2);
      expect(attempts[0].status).toBe(HandlerStatus.ERROR);
      expect(attempts[1].status).toBe(HandlerStatus.SUCCESS);
    });
  });
});