export interface Conflict {
	sources: [SourceName, SourceName];
	values: [string | null, string | null];
}

export interface CollectResult {
	data: Record<SourceName, string | null>;
	conflicts: Conflict[];
}

export interface ResolveOptions {
	order: SourceName[];
	conflictStrategy: ConflictStrategy;
}

export interface ResolveResult {
	version: string | null;
	data: Record<SourceName, string | null>;
	conflicts: Conflict[];
}

export interface PrecedenceResolver {
	registerSource(name: SourceName, provider: VersionSource): PrecedenceResolver;
	collectAllVersions(): Promise<CollectResult>;
	resolveVersion(options: ResolveOptions): Promise<ResolveResult>;
	getConflicts(): Promise<Conflict[]>;
}
export const enum ConflictStrategy {
	REPORT = 'REPORT',
	ERROR = 'ERROR',
	STOP_ON_FIRST = 'STOP_ON_FIRST',
}

export interface VersionSource {
	name: string;
	getVersion(): Promise<string | null>;
}

export type SourceName = 'nvmrc' | 'packageJson' | 'ciYaml';
