import { VersionSource } from './types';
import { readStream, cleanupStream } from '../../utils';

type StreamFactory = () => NodeJS.ReadableStream;

export class NvmrcStreamSource implements VersionSource {
  private streamFactory: StreamFactory;
  constructor(streamFactory: StreamFactory) {
    this.streamFactory = streamFactory;
  }
  async getVersion(): Promise<string | null> {
    const stream = this.streamFactory();
    try {
      const content = await readStream(stream);
      const version = content.trim();
      return version || null;
    } finally {
      cleanupStream(stream);
    }
  }
}
