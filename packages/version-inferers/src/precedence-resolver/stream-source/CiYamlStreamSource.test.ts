import { describe, it, expect } from 'vitest';
import { Readable } from 'stream';
import { CiYamlStreamSource } from './CiYamlStreamSource';

describe('CiYamlStreamSource', () => {
  it('returns the node-version from a CI YAML stream', async () => {
    const yaml = `jobs:\n  build:\n    steps:\n      - name: Setup Node\n        with:\n          node-version: 20.1.0\n`;
    const source = new CiYamlStreamSource(
      () => Readable.from([yaml]),
      'jobs.build.steps.0.with.node-version'
    );
    const version = await source.getVersion();
    expect(version).toBe('20.1.0');
  });

  it('returns null if node-version is not present', async () => {
    const yaml = `jobs:\n  build:\n    steps:\n      - name: Setup Node\n`;
    const source = new CiYamlStreamSource(
      () => Readable.from([yaml]),
      'jobs.build.steps.0.with.node-version'
    );
    const version = await source.getVersion();
    expect(version).toBeNull();
  });

  it('returns null for invalid YAML', async () => {
    const source = new CiYamlStreamSource(
      () => Readable.from(['not: [yaml']),
      'jobs.build.steps.0.with.node-version'
    );
    const version = await source.getVersion();
    expect(version).toBeNull();
  });

  it('returns null if resolved value is not a string', async () => {
    const yaml = `jobs:\n  build:\n    steps:\n      - step: 1\n`;
    const source = new CiYamlStreamSource(
      () => Readable.from([yaml]),
      'jobs.build.steps.0.step'
    );
    const version = await source.getVersion();
    expect(version).toBeNull();
  });
});
