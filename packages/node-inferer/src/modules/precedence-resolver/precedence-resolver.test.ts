

import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictStrategy, PrecedenceResolver } from './types';


let resolver: PrecedenceResolver | null = null;

describe.skip('PrecedenceResolver (specification)', () => {
	beforeEach(() => {
		resolver = null;
	});

	it('registers sources and allows collecting all versions', async () => {
		expect(resolver).not.toBeNull();
		resolver!.registerSource('nvmrc', { name: 'nvmrc', getVersion: async () => '18.16.0' });
		resolver!.registerSource('packageJson', { name: 'packageJson', getVersion: async () => '18.12.0' });
		resolver!.registerSource('ciYaml', { name: 'ciYaml', getVersion: async () => null });
		const result = await resolver!.collectAllVersions();
		expect(result.data).toEqual({ nvmrc: '18.16.0', packageJson: '18.12.0', ciYaml: null });
		expect(result.conflicts.length).toBeGreaterThanOrEqual(0);
	});

	it('resolves the final version according to precedence order', async () => {
		expect(resolver).not.toBeNull();
		resolver!.registerSource('nvmrc', { name: 'nvmrc', getVersion: async () => '18.16.0' });
		resolver!.registerSource('packageJson', { name: 'packageJson', getVersion: async () => '18.12.0' });
		const result = await resolver!.resolveVersion({
			order: ['packageJson', 'nvmrc', 'ciYaml'],
			conflictStrategy: ConflictStrategy.REPORT
		});
		expect(result.version).toBe('18.12.0');
	});

	it('handles conflicts according to the conflict strategy: REPORT', async () => {
		expect(resolver).not.toBeNull();
		resolver!.registerSource('nvmrc', { name: 'nvmrc', getVersion: async () => '18.16.0' });
		resolver!.registerSource('packageJson', { name: 'packageJson', getVersion: async () => '18.12.0' });
		const result = await resolver!.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.REPORT
		});
		expect(result.conflicts.length).toBeGreaterThan(0);
	});

	it('handles conflicts according to the conflict strategy: ERROR', async () => {
		expect(resolver).not.toBeNull();
		resolver!.registerSource('nvmrc', { name: 'nvmrc', getVersion: async () => '18.16.0' });
		resolver!.registerSource('packageJson', { name: 'packageJson', getVersion: async () => '18.12.0' });
		await expect(resolver!.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.ERROR
		})).rejects.toThrow();
	});

	it('handles conflicts according to the conflict strategy: STOP_ON_FIRST', async () => {
		expect(resolver).not.toBeNull();
		resolver!.registerSource('nvmrc', { name: 'nvmrc', getVersion: async () => '18.16.0' });
		resolver!.registerSource('packageJson', { name: 'packageJson', getVersion: async () => '18.12.0' });
		const result = await resolver!.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.STOP_ON_FIRST
		});
		expect(result.version).toBe('18.16.0');
	});

	it('returns all discovered versions and conflicts in collectAllVersions', async () => {
		expect(resolver).not.toBeNull();
		resolver!.registerSource('nvmrc', { name: 'nvmrc', getVersion: async () => '18.16.0' });
		resolver!.registerSource('packageJson', { name: 'packageJson', getVersion: async () => '18.12.0' });
		resolver!.registerSource('ciYaml', { name: 'ciYaml', getVersion: async () => null });
		const result = await resolver!.collectAllVersions();
		expect(result.data).toEqual({ nvmrc: '18.16.0', packageJson: '18.12.0', ciYaml: null });
		expect(Array.isArray(result.conflicts)).toBe(true);
	});

	it('throws, warns, or reports if a source in the order is missing', async () => {
		expect(resolver).not.toBeNull();
		resolver!.registerSource('nvmrc', { name: 'nvmrc', getVersion: async () => '18.16.0' });
		await expect(resolver!.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.REPORT
		})).rejects.toThrow();
	});
});
