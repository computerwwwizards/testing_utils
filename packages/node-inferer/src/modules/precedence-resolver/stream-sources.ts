import { VersionSource } from './types';
import yaml from 'yaml';

async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  let data = '';
  for await (const chunk of stream) {
    data += chunk;
  }
  return data;
}

export class NvmrcStreamSource implements VersionSource {
  private stream: NodeJS.ReadableStream;
  constructor(stream: NodeJS.ReadableStream) {
    this.stream = stream;
  }
  async getVersion(): Promise<string | null> {
    const content = await readStream(this.stream);
    const version = content.trim();
    return version || null;
  }
}

export class PackageJsonStreamSource implements VersionSource {
  private stream: NodeJS.ReadableStream;
  constructor(stream: NodeJS.ReadableStream) {
    this.stream = stream;
  }
  async getVersion(): Promise<string | null> {
    const content = await readStream(this.stream);
    try {
      const pkg = JSON.parse(content);
      return pkg.engines?.node ?? null;
    } catch {
      return null;
    }
  }
}

export class CiYamlStreamSource implements VersionSource {
  private stream: NodeJS.ReadableStream;
  constructor(stream: NodeJS.ReadableStream) {
    this.stream = stream;
  }
  async getVersion(): Promise<string | null> {
    const content = await readStream(this.stream);
    try {
      const doc = yaml.parse(content);
      if (doc && doc.jobs) {
        for (const job of Object.values(doc.jobs)) {
          const steps = (job as any).steps;
          if (steps && Array.isArray(steps)) {
            for (const step of steps) {
              if (step.with && step.with['node-version']) {
                return step.with['node-version'];
              }
            }
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
