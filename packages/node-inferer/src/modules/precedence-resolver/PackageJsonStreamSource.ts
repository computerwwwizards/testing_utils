import { VersionSource } from './types';
import { readStream } from './utils';

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
