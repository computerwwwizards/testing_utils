export type VersionSourceProvider = VersionSource | (()=> Promise<string | null>);

export interface VersionSource {
	getVersion(): Promise<string | null>;
}