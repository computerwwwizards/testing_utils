
import { Conflict, CollectResult, ResolveOptions, ResolveResult, PrecedenceResolver, ConflictStrategy, VersionSource, SourceName } from './types';

class NodeVersionPrecedenceResolver implements PrecedenceResolver<SourceName> {
	private sources: Map<SourceName, VersionSource> = new Map();
	private lastConflicts: Conflict[] = [];

	registerSource(name: SourceName, provider: VersionSource): PrecedenceResolver {
		this.sources.set(name, provider);
		return this;
	}

	async collectAllVersions(): Promise<CollectResult> {
		const data: Record<SourceName, string | null> = {
			nvmrc: null,
			packageJson: null,
			ciYaml: null
		};
		const versions: Record<SourceName, string | null> = { ...data };
		for (const [name, provider] of Array.from(this.sources.entries())) {
			versions[name as SourceName] = await provider.getVersion();
		}
		const conflicts = this.detectConflicts(versions);
		this.lastConflicts = conflicts;
		return { data: versions, conflicts };
	}

	async resolveVersion(options: ResolveOptions<SourceName>): Promise<ResolveResult> {
		const { order, conflictStrategy } = options;
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
		const conflicts = this.detectConflicts(data);
		this.lastConflicts = conflicts;
		if (conflicts.length > 0) {
			if (conflictStrategy === ConflictStrategy.ERROR) {
				throw new Error('Version conflict detected.');
			} else if (conflictStrategy === ConflictStrategy.REPORT) {
				// Just report, do not throw
			} else if (conflictStrategy === ConflictStrategy.STOP_ON_FIRST) {
				const first = order.find(name => data[name] !== null);
				return { version: first ? data[first] : null, data, conflicts };
			}
		}
		const version = order.map(name => data[name]).find(v => v !== null) ?? null;
		return { version, data, conflicts };
	}

	async getConflicts(): Promise<Conflict[]> {
		return this.lastConflicts;
	}

	private detectConflicts(data: Record<SourceName, string | null>): Conflict[] {
		const entries = Object.entries(data) as [SourceName, string | null][];
		const conflicts: Conflict[] = [];
		for (let i = 0; i < entries.length; i++) {
			for (let j = i + 1; j < entries.length; j++) {
				const [nameA, valueA] = entries[i];
				const [nameB, valueB] = entries[j];
				if (valueA !== null && valueB !== null && valueA !== valueB) {
					conflicts.push({ sources: [nameA, nameB], values: [valueA, valueB] });
				}
			}
		}
		return conflicts;
	}
}

export { NodeVersionPrecedenceResolver };
export default NodeVersionPrecedenceResolver;
