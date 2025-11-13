import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NvmHandler } from './nvm-handler';
import { HandlerStatus } from './types';

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('node:util', () => ({
  promisify: (fn: unknown) => fn,
}));

describe('NvmHandler Behavior', () => {
  let handler: NvmHandler;

  beforeEach(async () => {
    handler = new NvmHandler();
    vi.clearAllMocks();
    const { exec } = await import('node:child_process');
    vi.mocked(exec).mockReset();
  });

  describe('Essential handler contract', () => {
    it('should handle version switching with success status', async () => {
      const { exec } = await import('node:child_process');
      vi.mocked(exec).mockImplementation(((command: string) => {
        if (command.includes('command -v nvm')) {
          return Promise.resolve({ stdout: '/usr/local/bin/nvm', stderr: '' });
        }
        if (command.includes('nvm use')) {
          return Promise.resolve({
            stdout: 'Now using node v18.17.0',
            stderr: '',
          });
        }
        return Promise.reject(new Error('Unknown command'));
      }) as never);

      const result = await handler.handle('18.17.0');

      expect(result.status).toBe(HandlerStatus.SUCCESS);
      expect(result.message).toContain('18.17.0');
    });

    it('should handle version switching with error status when nvm not found', async () => {
      const { exec } = await import('node:child_process');
      vi.mocked(exec).mockImplementation((() =>
        Promise.reject(new Error('nvm not found'))) as never);

      const result = await handler.handle('18.17.0');

      expect(result.status).toBe(HandlerStatus.ERROR);
      expect(result.message).toContain('not installed');
    });

    it('should handle error during version switch', async () => {
      const { exec } = await import('node:child_process');
      vi.mocked(exec).mockImplementation(((command: string) => {
        if (command.includes('command -v nvm')) {
          return Promise.resolve({ stdout: '/usr/local/bin/nvm', stderr: '' });
        }
        if (command.includes('nvm use')) {
          return Promise.resolve({
            stdout: '',
            stderr: 'error: version not installed',
          });
        }
        return Promise.reject(new Error('Unknown command'));
      }) as never);

      const result = await handler.handle('18.17.0');

      expect(result.status).toBe(HandlerStatus.ERROR);
      expect(result.message).toContain('Failed');
    });
  });

  describe('Chain of responsibility', () => {
    it('should support setting next handler and return it', () => {
      const handler1 = new NvmHandler();
      const handler2 = new NvmHandler();

      const returnedHandler = handler1.setNext(handler2);

      expect(returnedHandler).toBe(handler2);
      expect(handler1.next).toBe(handler2);
    });
  });
});
