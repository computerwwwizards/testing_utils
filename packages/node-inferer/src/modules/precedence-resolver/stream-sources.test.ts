import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import { NvmrcStreamSource } from './NvmrcStreamSource';
import { PackageJsonStreamSource } from './PackageJsonStreamSource';
import { CiYamlStreamSource } from './CiYamlStreamSource';

describe('NvmrcStreamSource', () => {
  it('returns the version from a simple .nvmrc stream', async () => {
    const stream = Readable.from(['18.16.0']);
    const source = new NvmrcStreamSource(stream);
    const version = await source.getVersion();
    expect(version).toBe('18.16.0');
  });

  it('returns null for empty .nvmrc stream', async () => {
    const stream = Readable.from(['']);
    const source = new NvmrcStreamSource(stream);
    const version = await source.getVersion();
    expect(version).toBeNull();
  });
});

describe('PackageJsonStreamSource', () => {
  it('returns the node version from engines in package.json stream', async () => {
    const pkg = { name: 'x', engines: { node: '18.12.0' } };
    const stream = Readable.from([JSON.stringify(pkg)]);
    const source = new PackageJsonStreamSource(stream);
    const version = await source.getVersion();
    expect(version).toBe('18.12.0');
  });

  it('returns null if engines.node is missing', async () => {
    const pkg = { name: 'x' };
    const stream = Readable.from([JSON.stringify(pkg)]);
    const source = new PackageJsonStreamSource(stream);
    const version = await source.getVersion();
    expect(version).toBeNull();
  });

  it('returns null for invalid JSON', async () => {
    const stream = Readable.from(['not-json']);
    const source = new PackageJsonStreamSource(stream);
    const version = await source.getVersion();
    expect(version).toBeNull();
  });
});

describe('CiYamlStreamSource', () => {
  it('returns the node-version from a CI YAML stream', async () => {
    const yaml = `jobs:\n  build:\n    steps:\n      - name: Setup Node\n        with:\n          node-version: 20.1.0\n`;
    const stream = Readable.from([yaml]);
    // Path to the version: jobs.build.steps.0.with.node-version
    const source = new CiYamlStreamSource(stream, 'jobs.build.steps.0.with.node-version');
    const version = await source.getVersion();
    expect(version).toBe('20.1.0');
  });

  it('returns null if node-version is not present', async () => {
    const yaml = `jobs:\n  build:\n    steps:\n      - name: Setup Node\n`;
    const stream = Readable.from([yaml]);
    const source = new CiYamlStreamSource(stream, 'jobs.build.steps.0.with.node-version');
    const version = await source.getVersion();
    expect(version).toBeNull();
  });

  it('returns null for invalid YAML', async () => {
    const stream = Readable.from(['not: [yaml']);
    const source = new CiYamlStreamSource(stream, 'jobs.build.steps.0.with.node-version');
    const version = await source.getVersion();
    expect(version).toBeNull();
  });
});
