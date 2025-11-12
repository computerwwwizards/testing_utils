import { VersionSource } from './types';
import { readStream, getValueByPath } from './utils';
import yaml from 'yaml';

export class CiYamlStreamSource implements VersionSource {
  private stream: NodeJS.ReadableStream;
  private versionPath: string;
  constructor(stream: NodeJS.ReadableStream, versionPath: string) {
    this.stream = stream;
    this.versionPath = versionPath;
  }
  async getVersion(): Promise<string | null> {
    const content = await readStream(this.stream);
    try {
      const doc = yaml.parse(content);
      const value = getValueByPath(doc, this.versionPath);
      return typeof value === 'string' ? value : null;
    } catch {
      return null;
    }
  }
}
