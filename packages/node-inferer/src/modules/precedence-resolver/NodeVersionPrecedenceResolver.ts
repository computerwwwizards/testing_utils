
import { 
  Conflict, 
  CollectResult, 
  ResolveOptions, 
  ResolveResult, 
  PrecedenceResolver, 
  ConflictStrategy, 
  VersionSource, 
  SourceName 
} from './types';

class NodeVersionPrecedenceResolver implements PrecedenceResolver<SourceName> {
  private sources: Map<SourceName, VersionSource> = new Map();
  private lastConflicts: Conflict[] = [];

  registerSource(name: SourceName, provider: VersionSource): PrecedenceResolver {
    this.sources.set(name, provider);
    return this;
  }

  async collectAllVersions(): Promise<CollectResult> {
    const versions = await this.collectVersionsFromSources();
    const conflicts = this.detectConflicts(versions);
    this.lastConflicts = conflicts;
    
    return { data: versions, conflicts };
  }

  async resolveVersion(options: ResolveOptions<SourceName>): Promise<ResolveResult> {
    const { order, conflictStrategy } = options;
    const data = await this.collectVersionsFromOrder(order);
    const conflicts = this.detectConflicts(data);
    this.lastConflicts = conflicts;

    if (conflicts.length > 0 && conflictStrategy === ConflictStrategy.STOP_ON_FIRST) {
      const firstVersion = this.findFirstAvailableVersion(order, data);
      return { version: firstVersion, data, conflicts };
    }

    if (conflicts.length > 0 && conflictStrategy === ConflictStrategy.ERROR) {
      this.throwConflictError(conflicts);
    }

    const version = this.findFirstAvailableVersion(order, data);
    return { version, data, conflicts };
  }

  async getConflicts(): Promise<Conflict[]> {
    return this.lastConflicts;
  }

  private async collectVersionsFromSources(): Promise<Record<SourceName, string | null>> {
    const versions: Record<SourceName, string | null> = {
      nvmrc: null,
      packageJson: null,
      ciYaml: null
    };

    for (const [name, provider] of Array.from(this.sources.entries())) {
      versions[name as SourceName] = await provider.getVersion();
    }

    return versions;
  }

  private async collectVersionsFromOrder(order: SourceName[]): Promise<Record<SourceName, string | null>> {
    const data: Record<SourceName, string | null> = {
      nvmrc: null,
      packageJson: null,
      ciYaml: null
    };

    for (const name of order) {
      const provider = this.sources.get(name);
      if (!provider) {
        throw new Error(`Source '${name}' is not registered.`);
      }
      data[name] = await provider.getVersion();
    }

    return data;
  }

  private throwConflictError(conflicts: Conflict[]): never {
    const conflictDetails = conflicts
      .map(conflict => 
        `Sources: ${conflict.sources.join(' & ')}, Values: ${conflict.values.join(' vs ')}`
      )
      .join('; ');
    
    throw new Error(`Version conflict detected: ${conflictDetails}`);
  }

  private findFirstAvailableVersion(
    order: SourceName[], 
    data: Record<SourceName, string | null>
  ): string | null {
    return order
      .map(name => data[name])
      .find(version => version !== null) ?? null;
  }

  private detectConflicts(data: Record<SourceName, string | null>): Conflict[] {
    const entries = Object.entries(data) as [SourceName, string | null][];
    const conflicts: Conflict[] = [];

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [nameA, valueA] = entries[i];
        const [nameB, valueB] = entries[j];
        
        if (this.areConflictingVersions(valueA, valueB)) {
          conflicts.push({ 
            sources: [nameA, nameB], 
            values: [valueA, valueB] 
          });
        }
      }
    }

    return conflicts;
  }

  private areConflictingVersions(valueA: string | null, valueB: string | null): boolean {
    return valueA !== null && valueB !== null && valueA !== valueB;
  }
}

export { NodeVersionPrecedenceResolver };
export default NodeVersionPrecedenceResolver;
