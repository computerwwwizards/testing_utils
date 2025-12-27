import { VersionSource } from './types';
import { readStream, getValueByPath } from '../../utils';
import { cleanupStream } from '../../utils';
import yaml from 'yaml';

type StreamFactory = () => NodeJS.ReadableStream;

export class CiYamlStreamSource implements VersionSource {
  private streamFactory: StreamFactory;
  private versionPath: string;
  constructor(streamFactory: StreamFactory, versionPath: string) {
    this.streamFactory = streamFactory;
    this.versionPath = versionPath;
  }
  async getVersion(): Promise<string | null> {
    const stream = this.streamFactory();
    try {
      const content = await readStream(stream);
      const doc = yaml.parse(content);
      const value = getValueByPath(doc, this.versionPath);
      return typeof value === 'string' ? value : null;
    } catch {
      return null;
    } finally {
      cleanupStream(stream);
    }
  }
}
