

import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictStrategy, PrecedenceResolver } from './types';
import VersionPrecedenceResolver from './PrecedenceResolver';


let resolver: PrecedenceResolver;

describe('PrecedenceResolver (specification)', () => {
		beforeEach(() => {
			resolver = new VersionPrecedenceResolver();
		});

	it('registers sources and allows collecting all versions', async () => {
		
	resolver.registerSource('nvmrc', { getVersion: async () => '18.16.0' });
	resolver.registerSource('packageJson', { getVersion: async () => '18.12.0' });
	resolver.registerSource('ciYaml', { getVersion: async () => null });
		const result = await resolver.collectAllVersions();
		expect(result.data).toEqual({ nvmrc: '18.16.0', packageJson: '18.12.0', ciYaml: null });
		expect(result.conflicts.length).toBeGreaterThanOrEqual(0);
	});

	it('resolves the final version according to precedence order', async () => {
		
	resolver.registerSource('nvmrc', { getVersion: async () => '18.16.0' });
	resolver.registerSource('packageJson', { getVersion: async () => '18.12.0' });
	resolver.registerSource('ciYaml', { getVersion: async () => null });
		const result = await resolver!.resolveVersion({
			order: ['packageJson', 'nvmrc', 'ciYaml'],
			conflictStrategy: ConflictStrategy.REPORT
		});
		expect(result.version).toBe('18.12.0');
	});

	it('handles conflicts according to the conflict strategy: REPORT', async () => {
		
		resolver.registerSource('nvmrc', { getVersion: async () => '18.16.0' });
		resolver.registerSource('packageJson', { getVersion: async () => '18.12.0' });
    resolver?.registerSource('ciYaml', {getVersion: ()=>Promise.resolve('15.3.4')})
		const result = await resolver.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.REPORT
		});
		expect(result.conflicts.length).toBeGreaterThan(0);
	});

	it('handles conflicts according to the conflict strategy: ERROR', async () => {
		
	resolver.registerSource('nvmrc', { getVersion: async () => '18.16.0' });
	resolver.registerSource('packageJson', { getVersion: async () => '18.12.0' });
		await expect(resolver!.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.ERROR
		})).rejects.toThrow();
	});

	it('handles conflicts according to the conflict strategy: STOP_ON_FIRST', async () => {
		
	resolver.registerSource('nvmrc', { getVersion: async () => '18.16.0' });
	resolver.registerSource('packageJson', { getVersion: async () => '18.12.0' });
	resolver.registerSource('ciYaml', { getVersion: async () => null });
		const result = await resolver.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.STOP_ON_FIRST
		});
		expect(result.version).toBe('18.16.0');
	});

	it('returns all discovered versions and conflicts in collectAllVersions', async () => {
		
	resolver.registerSource('nvmrc', { getVersion: async () => '18.16.0' });
	resolver.registerSource('packageJson', { getVersion: async () => '18.12.0' });
	resolver.registerSource('ciYaml', { getVersion: async () => null });
		const result = await resolver!.collectAllVersions();
		expect(result.data).toEqual({ nvmrc: '18.16.0', packageJson: '18.12.0', ciYaml: null });
		expect(Array.isArray(result.conflicts)).toBe(true);
	});

	it('throws, warns, or reports if a source in the order is missing', async () => {
		
	resolver.registerSource('nvmrc', { getVersion: async () => '18.16.0' });
		await expect(resolver!.resolveVersion({
			order: ['nvmrc', 'packageJson', 'ciYaml'],
			conflictStrategy: ConflictStrategy.REPORT
		})).rejects.toThrow();
	});
});
