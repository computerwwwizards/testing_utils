import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import { NvmrcStreamSource } from './NvmrcStreamSource';

describe('NvmrcStreamSource', () => {
  it('returns the version from a simple .nvmrc stream', async () => {
    const source = new NvmrcStreamSource(() => Readable.from(['18.16.0']));
    const version = await source.getVersion();
    expect(version).toBe('18.16.0');
  });

  it('returns null for empty .nvmrc stream', async () => {
    const source = new NvmrcStreamSource(() => Readable.from(['']));
    const version = await source.getVersion();
    expect(version).toBeNull();
  });

  it('trims whitespace from version', async () => {
    const source = new NvmrcStreamSource(() => Readable.from(['  20.0.0  \n']));
    const version = await source.getVersion();
    expect(version).toBe('20.0.0');
  });
});
