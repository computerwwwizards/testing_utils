import { beforeEach, describe, expect, it } from 'vitest';
import { Switcher } from './switcher';
import {
  type HandlerAttempt,
  HandlerStatus,
  type SwitchOptions,
} from './types';

type HandlerName = 'nvm' | 'fnm' | 'volta';

describe('Switcher Behavior', () => {
  let switcher: Switcher<HandlerName>;

  beforeEach(() => {
    switcher = new Switcher<HandlerName>();
  });

  describe('Essential switcher contract', () => {
    it('should register handlers and return self for fluent interface', () => {
      const mockHandler = async (version: string): Promise<HandlerAttempt> => ({
        handlerName: 'nvm',
        status: HandlerStatus.SUCCESS,
        message: `Switched to ${version}`,
      });

      const result = switcher.register('nvm', mockHandler);

      expect(result).toBe(switcher);
    });

    it('should try handler and return success attempt', async () => {
      const mockHandler = async (version: string): Promise<HandlerAttempt> => ({
        handlerName: 'nvm',
        status: HandlerStatus.SUCCESS,
        message: `Switched to ${version}`,
      });

      switcher.register('nvm', mockHandler);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(1);
      expect(attempts[0].handlerName).toBe('nvm');
      expect(attempts[0].status).toBe(HandlerStatus.SUCCESS);
      expect(attempts[0].message).toContain('18.17.0');
    });

    it('should try multiple handlers until one succeeds', async () => {
      const failingHandler = async (
        _version: string,
      ): Promise<HandlerAttempt> => ({
        handlerName: 'nvm',
        status: HandlerStatus.ERROR,
        message: 'nvm not found',
      });

      const successHandler = async (
        version: string,
      ): Promise<HandlerAttempt> => ({
        handlerName: 'fnm',
        status: HandlerStatus.SUCCESS,
        message: `Switched to ${version}`,
      });

      switcher.register('nvm', failingHandler).register('fnm', successHandler);

      const attempts = await switcher.switchVersion('18.17.0');

      expect(attempts).toHaveLength(2);
      expect(attempts[0].status).toBe(HandlerStatus.ERROR);
      expect(attempts[1].status).toBe(HandlerStatus.SUCCESS);
    });

    it('should respect custom handler order', async () => {
      const voltaHandler = async (
        version: string,
      ): Promise<HandlerAttempt> => ({
        handlerName: 'volta',
        status: HandlerStatus.SUCCESS,
        message: `Switched to ${version}`,
      });

      const nvmHandler = async (version: string): Promise<HandlerAttempt> => ({
        handlerName: 'nvm',
        status: HandlerStatus.SUCCESS,
        message: `Switched to ${version}`,
      });

      const fnmHandler = async (version: string): Promise<HandlerAttempt> => ({
        handlerName: 'fnm',
        status: HandlerStatus.SUCCESS,
        message: `Switched to ${version}`,
      });

      switcher
        .register('nvm', nvmHandler)
        .register('fnm', fnmHandler)
        .register('volta', voltaHandler);

      const options: SwitchOptions<HandlerName> = {
        handlerOrder: ['volta', 'nvm', 'fnm'],
      };

      const attempts = await switcher.switchVersion('18.17.0', options);

      expect(attempts[0].handlerName).toBe('volta');
    });

    it('should throw error when all handlers fail', async () => {
      const failingHandler1 = async (
        _version: string,
      ): Promise<HandlerAttempt> => ({
        handlerName: 'nvm',
        status: HandlerStatus.ERROR,
        message: 'nvm not found',
      });

      const failingHandler2 = async (
        _version: string,
      ): Promise<HandlerAttempt> => ({
        handlerName: 'fnm',
        status: HandlerStatus.ERROR,
        message: 'fnm not installed',
      });

      switcher
        .register('nvm', failingHandler1)
        .register('fnm', failingHandler2);

      await expect(switcher.switchVersion('18.17.0')).rejects.toThrow(
        'All handlers failed to switch to Node.js v18.17.0',
      );
    });

    it('should include all attempts in error message', async () => {
      const failingHandler1 = async (
        _version: string,
      ): Promise<HandlerAttempt> => ({
        handlerName: 'nvm',
        status: HandlerStatus.ERROR,
        message: 'nvm not found',
      });

      const failingHandler2 = async (
        _version: string,
      ): Promise<HandlerAttempt> => ({
        handlerName: 'fnm',
        status: HandlerStatus.ERROR,
        message: 'fnm not installed',
      });

      switcher
        .register('nvm', failingHandler1)
        .register('fnm', failingHandler2);

      try {
        await switcher.switchVersion('18.17.0');
      } catch (error) {
        expect((error as Error).message).toContain('nvm not found');
        expect((error as Error).message).toContain('fnm not installed');
        expect((error as Error).message).toContain('Handlers attempted: 2');
      }
    });
  });
});
