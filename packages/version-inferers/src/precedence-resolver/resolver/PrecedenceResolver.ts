
import { VersionSourceProvider } from '../stream-source/types';
import { 
  Conflict, 
  CollectResult, 
  ResolveOptions, 
  ResolveResult, 
  PrecedenceResolver, 
  ConflictStrategy, 
  SourceName 
} from './types';

class VersionPrecedenceResolver<T extends string> implements PrecedenceResolver<T> {
  private sources: Map<T, VersionSourceProvider> = new Map();
  private lastConflicts: Conflict[] = [];

  registerSource(name: T, provider: VersionSourceProvider): PrecedenceResolver {
    this.sources.set(name, provider);
    return this;
  }

  async collectAllVersions(): Promise<CollectResult> {
    const versions = await this.collectVersionsFromSources();
    const conflicts = this.detectConflicts(versions);
    this.lastConflicts = conflicts;
    
    return { data: versions, conflicts };
  }

  async resolveVersion(options: ResolveOptions<T> = {}): Promise<ResolveResult> {
    const { 
      order = [...this.sources.keys()], 
      conflictStrategy  = ConflictStrategy.STOP_ON_FIRST
    } = options;

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

  private async collectVersionsFromSources(): Promise<Record<T, string | null>> {
    const versions: Record<string, string | null> = {
      nvmrc: null,
      packageJson: null,
      ciYaml: null
    };

    for (const [name, provider] of Array.from(this.sources.entries())) {
      if(typeof provider === 'function')
        versions[name as SourceName] = await provider();
      else
        versions[name as SourceName] = await provider.getVersion();
    }

    return versions;
  }

  private async collectVersionsFromOrder(order: T[]): Promise<Record<T, string | null>> {
    const data: Record<T, string | null> = {} as any;

    for (const name of order) {
      const provider = this.sources.get(name);
      if (!provider) {
        throw new Error(`Source '${name}' is not registered.`);
      }
      if(typeof provider === 'function'){
        data[name] = await provider();
      }else{
        data[name] = await provider.getVersion();
      }
      
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
    order: T[], 
    data: Record<T, string | null>
  ): string | null {
    return order
      .map(name => data[name])
      .find(version => version !== null) ?? null;
  }

  private detectConflicts(data: Record<T, string | null>): Conflict[] {
    const entries = Object.entries(data) as [T, string | null][];
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

export { VersionPrecedenceResolver as NodeVersionPrecedenceResolver };
export default VersionPrecedenceResolver;
