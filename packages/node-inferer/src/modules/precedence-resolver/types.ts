export interface Conflict<T extends string = string> {
	sources: [T, T];
	values: [string | null, string | null];
}

export interface CollectResult<T extends string = string> {
	data: Record<T, string | null>;
	conflicts: Conflict[];
}

export interface ResolveOptions<T extends string = string> {
	order: T[];
	conflictStrategy: ConflictStrategy;
}

export interface ResolveResult<T extends string = string> {
	version: string | null;
	data: Record<T, string | null>;
	conflicts: Conflict[];
}

export interface PrecedenceResolver<T extends string = string> {
	registerSource(name: T, provider: VersionSource): PrecedenceResolver;
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
	getVersion(): Promise<string | null>;
}

export type SourceName = 'nvmrc' | 'packageJson' | 'ciYaml';