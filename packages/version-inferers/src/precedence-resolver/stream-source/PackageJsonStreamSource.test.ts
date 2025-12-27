import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import { PackageJsonStreamSource } from './PackageJsonStreamSource';

describe('PackageJsonStreamSource', () => {
  it('returns the node version from engines in package.json stream', async () => {
    const pkg = { name: 'x', engines: { node: '18.12.0' } };
    const source = new PackageJsonStreamSource(() => Readable.from([JSON.stringify(pkg)]));
    const version = await source.getVersion();
    expect(version).toBe('18.12.0');
  });

  it('returns null if engines.node is missing', async () => {
    const pkg = { name: 'x' };
    const source = new PackageJsonStreamSource(() => Readable.from([JSON.stringify(pkg)]));
    const version = await source.getVersion();
    expect(version).toBeNull();
  });

  it('returns null if engines is missing', async () => {
    const pkg = { name: 'x', version: '1.0.0' };
    const source = new PackageJsonStreamSource(() => Readable.from([JSON.stringify(pkg)]));
    const version = await source.getVersion();
    expect(version).toBeNull();
  });

  it('returns null for invalid JSON', async () => {
    const source = new PackageJsonStreamSource(() => Readable.from(['not-json']));
    const version = await source.getVersion();
    expect(version).toBeNull();
  });
});
