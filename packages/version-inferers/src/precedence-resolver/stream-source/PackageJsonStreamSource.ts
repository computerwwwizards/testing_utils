import { VersionSource } from './types';
import { readStream, cleanupStream } from '../../utils';

type StreamFactory = () => NodeJS.ReadableStream ;

export class PackageJsonStreamSource implements VersionSource {
  private streamFactory: StreamFactory;
  constructor(streamFactory: StreamFactory) {
    this.streamFactory = streamFactory;
  }
  async getVersion(): Promise<string | null> {
    const stream = this.streamFactory();
    try {
      const content = await readStream(stream);
      const pkg = JSON.parse(content);
      return pkg.engines?.node ?? null;
    } catch {
      return null;
    } finally {
      cleanupStream(stream);
    }
  }
}
