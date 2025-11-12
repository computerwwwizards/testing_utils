import { VersionSource } from './types';
import { readStream } from './utils';

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
