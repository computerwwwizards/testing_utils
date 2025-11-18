import { describe, expect, it } from 'vitest';
import { createFnmHandler } from './fnm-handler';
import { HandlerStatus } from './types';

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
