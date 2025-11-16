import { describe, expect, it, beforeEach } from 'vitest';
import { HandlerStatus, type HandlerAttempt, type Switcher, type SwitchOptions } from './types';

type HandlerName = 'nvm' | 'fnm' | 'volta';

let mockSwitcher: Switcher<HandlerName> = null as unknown as Switcher<HandlerName>;
let mockHandlerFactory: () => HandlerAttempt = null as unknown as () => HandlerAttempt;

describe.skip('Switcher Behavior', () => {
  let switcher: Switcher<HandlerName>;

  beforeEach(() => {
    switcher = mockSwitcher;
  });

  describe('Essential switcher contract', () => {
    it('should register handlers and return self for fluent interface', () => {
      const result = switcher.register('nvm', mockHandlerFactory);

      expect(result).toBe(switcher);
    });

    it('should try handler and return success attempt', async () => {
      switcher.register('nvm', mockHandlerFactory);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(1);
      expect(attempts[0].handlerName).toBe('nvm');
      expect(attempts[0].status).toBe(HandlerStatus.SUCCESS);
      expect(attempts[0].message).toContain('18.17.0');
    });

    it('should try multiple handlers until one succeeds', async () => {
      switcher
        .register('nvm', mockHandlerFactory)
        .register('fnm', mockHandlerFactory);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(2);
      expect(attempts[0].status).toBe(HandlerStatus.ERROR);
      expect(attempts[1].status).toBe(HandlerStatus.SUCCESS);
    });

    it('should respect custom handler order', async () => {
      switcher
        .register('nvm', mockHandlerFactory)
        .register('fnm', mockHandlerFactory)
        .register('volta', mockHandlerFactory);

      const options: SwitchOptions<HandlerName> = {
        handlerOrder: ['volta', 'nvm', 'fnm']
      };

      const attempts = await switcher.switchVersion('18.17.0', options);

      expect(attempts[0].handlerName).toBe('volta');
    });
  });
});