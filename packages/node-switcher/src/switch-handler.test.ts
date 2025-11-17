import { describe, expect, it } from 'vitest';
import { createFnmHandler, createNvmHandler } from './index';
import { HandlerStatus } from './types';

describe('Handler Factory Behavior', () => {
  describe('NVM Handler', () => {
    it('should create a handler function', () => {
      const handler = createNvmHandler();

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('should return a promise when called', () => {
      const handler = createNvmHandler();
      const result = handler('18.17.0');

      expect(result).toBeInstanceOf(Promise);
    });

    it('should return handler attempt structure', async () => {
      const handler = createNvmHandler();
      const attempt = await handler('18.17.0');

      expect(attempt).toHaveProperty('handlerName');
      expect(attempt).toHaveProperty('status');
      expect(attempt).toHaveProperty('message');
      expect(attempt.handlerName).toBe('nvm');
      expect([HandlerStatus.SUCCESS, HandlerStatus.ERROR]).toContain(
        attempt.status,
      );
    });
  });

  describe('FNM Handler', () => {
    it('should create a handler function', () => {
      const handler = createFnmHandler();

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('should return a promise when called', () => {
      const handler = createFnmHandler();
      const result = handler('18.17.0');

      expect(result).toBeInstanceOf(Promise);
    });

    it('should return handler attempt structure', async () => {
      const handler = createFnmHandler();
      const attempt = await handler('18.17.0');

      expect(attempt).toHaveProperty('handlerName');
      expect(attempt).toHaveProperty('status');
      expect(attempt).toHaveProperty('message');
      expect(attempt.handlerName).toBe('fnm');
      expect([HandlerStatus.SUCCESS, HandlerStatus.ERROR]).toContain(
        attempt.status,
      );
    });
  });
});
