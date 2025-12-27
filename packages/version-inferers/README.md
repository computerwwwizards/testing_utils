# Version Inferers

A flexible, source-agnostic library for inferring and resolving configuration values from multiple sources with configurable precedence and conflict handling strategies.

## 🎯 Purpose

This library solves the common problem of **determining which version or configuration value to use** when multiple sources provide conflicting information. Originally designed for Node.js version inference, it has evolved into a generic resolution system applicable to any scenario requiring multi-source orchestration.

### Real-world Use Cases

- 🔧 **Node.js Version Management**: Automatically detect the correct Node.js version from `.nvmrc`, `package.json`, or CI/CD workflows
- ⚙️ **Configuration Resolution**: Resolve settings from environment files, config files, and defaults with clear precedence rules
- 🚀 **CI/CD Integration**: Ensure your local environment matches your deployment configuration
- 🔄 **Monorepo Management**: Coordinate versions across multiple packages and workspaces

## ✨ Key Features

- **🔌 Pluggable Sources**: Register any number of custom or built-in sources
- **📊 Configurable Precedence**: Define resolution order at runtime
- **⚠️ Conflict Strategies**: Choose how to handle conflicting values (report, error, or use first)
- **🌊 Stream-based**: Efficient file reading with proper resource cleanup
- **📦 Type-safe**: Full TypeScript support with generic types
- **🧩 Extensible**: Easy to add new source types and strategies

## 🚀 Quick Start

### Installation

```bash
pnpm install @computerwwwizards/version-inferer
```

### Basic Usage

```typescript
import inferNodeVersion from '@computerwwwizards/version-inferer';

// Infer Node.js version from project files
const result = await inferNodeVersion();
console.log(`Use Node.js ${result.version}`);
```

## 📚 Examples

### Example 1: Simple Node Version Detection

Automatically detects Node version from `.nvmrc` or `package.json`:

```typescript
import inferNodeVersion from '@computerwwwizards/version-inferer';

const result = await inferNodeVersion({
  rootPath: '/path/to/project'
});

if (result.version) {
  console.log(`✅ Node version: ${result.version}`);
} else {
  console.log('❌ No version found');
}

// Result includes all checked sources
console.log('Checked sources:', result.data);
// { nvmrc: '20.0.0', 'package.json': null }
```

### Example 2: Include CI/CD Workflow Configuration

Check GitHub Actions workflow files for Node version:

```typescript
import inferNodeVersion from '@computerwwwizards/version-inferer';

const result = await inferNodeVersion({
  workflowFilePath: '.github/workflows/ci.yml',
  workflowOption: ['jobs', 'test', 'steps', '0', 'with', 'node-version'],
  rootPath: process.cwd()
});

console.log('Version from CI:', result.version);
```

### Example 3: Custom Precedence Order

Prioritize specific sources over others:

```typescript
import inferNodeVersion, { ConflictStrategy } from '@computerwwwizards/version-inferer';

const result = await inferNodeVersion({
  workflowFilePath: '.github/workflows/deploy.yml',
  workflowOption: ['jobs', 'deploy', 'with', 'node-version'],
  // Prioritize workflow, then package.json, then .nvmrc
  order: ['workflow', 'package.json', 'nvmrc'],
  conflictStrategy: ConflictStrategy.STOP_ON_FIRST
});

console.log(`Using: ${result.version}`);
```

### Example 4: Handle Version Conflicts

Different strategies for handling conflicting versions:

```typescript
import inferNodeVersion, { ConflictStrategy } from '@computerwwwizards/version-inferer';

// Strategy 1: Report conflicts but continue
const result1 = await inferNodeVersion({
  conflictStrategy: ConflictStrategy.REPORT
});

if (result1.conflicts.length > 0) {
  console.log('⚠️  Version conflicts detected:');
  result1.conflicts.forEach(conflict => {
    console.log(`  ${conflict.sources.join(' vs ')}: ${conflict.values.join(' vs ')}`);
  });
}

// Strategy 2: Throw error on conflict
try {
  const result2 = await inferNodeVersion({
    conflictStrategy: ConflictStrategy.ERROR
  });
} catch (error) {
  console.error('Version conflict error:', error.message);
}

// Strategy 3: Stop at first valid version (default)
const result3 = await inferNodeVersion({
  conflictStrategy: ConflictStrategy.STOP_ON_FIRST
});
console.log('First valid version:', result3.version);
```

### Example 5: Advanced - Custom Version Sources

Build your own resolver with custom sources:

```typescript
import VersionPrecedenceResolver from '@computerwwwizards/version-inferer';

const resolver = new VersionPrecedenceResolver();

// Add custom sources
resolver
  .registerSource('envVar', async () => process.env.NODE_VERSION || null)
  .registerSource('defaultConfig', async () => '18.0.0')
  .registerSource('userPreference', {
    getVersion: async () => {
      // Read from database, API, etc.
      return '20.0.0';
    }
  });

const result = await resolver.resolveVersion({
  order: ['userPreference', 'envVar', 'defaultConfig']
});

console.log('Resolved version:', result.version);
```

### Example 6: CI/CD Integration Script

Create a script to ensure environment matches CI:

```typescript
#!/usr/bin/env node
import inferNodeVersion from '@computerwwwizards/version-inferer';
import { execSync } from 'child_process';

async function ensureNodeVersion() {
  const result = await inferNodeVersion({
    workflowFilePath: '.github/workflows/ci.yml',
    workflowOption: ['jobs', 'test', 'strategy', 'matrix', 'node-version', '0'],
    order: ['workflow', 'nvmrc', 'package.json']
  });

  if (!result.version) {
    console.error('❌ No Node version specified');
    process.exit(1);
  }

  const currentVersion = execSync('node -v').toString().trim();
  const requiredVersion = `v${result.version}`;

  if (currentVersion !== requiredVersion) {
    console.log(`⚠️  Version mismatch: ${currentVersion} !== ${requiredVersion}`);
    console.log(`Run: nvm use ${result.version}`);
    process.exit(1);
  }

  console.log(`✅ Using correct Node version: ${currentVersion}`);
}

ensureNodeVersion();
```

## 🏗️ Architecture

### Built-in Sources

- **NvmrcStreamSource**: Reads `.nvmrc` files
- **PackageJsonStreamSource**: Extracts `engines.node` from `package.json`
- **CiYamlStreamSource**: Parses YAML files (GitHub Actions, GitLab CI, etc.)

### Conflict Strategies

| Strategy | Behavior |
|----------|----------|
| `STOP_ON_FIRST` | Returns first non-null value (default) |
| `REPORT` | Collects conflicts but continues resolution |
| `ERROR` | Throws error if conflicts detected |

### Stream Factory Pattern

All sources use a factory pattern to ensure proper resource management:

```typescript
import { createReadStream } from 'fs';
import { NvmrcStreamSource } from '@computerwwwizards/version-inferer';

// ✅ Good: Stream created on-demand and auto-cleaned
const source = new NvmrcStreamSource(() => createReadStream('.nvmrc'));

// ❌ Bad: Pre-created stream may leak or lock
const stream = createReadStream('.nvmrc');
const source = new NvmrcStreamSource(stream); // Old API
```

## 🔮 Future Directions

This library is evolving toward:

- **Multi-value Resolution**: Support for resolving multiple related values (Node + npm versions)
- **Caching Strategies**: Optional caching for expensive source reads
- **Validation Rules**: Built-in version constraint validation
- **Plugin System**: Marketplace for community-contributed sources
- **Language Agnostic**: Extend to Python, Ruby, Java version management
- **Web API**: REST interface for version resolution services

## 🛠️ Development

### Setup

Install dependencies:

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Development (watch mode)

```bash
pnpm dev
```

### Run Tests

```bash
pnpm test
```

### Format Code

```bash
pnpm format
```

## 📖 API Reference

### `inferNodeVersion(options?)`

Main function for Node.js version inference.

**Options:**

```typescript
{
  workflowFilePath?: string;        // Path to CI/CD workflow file
  workflowOption?: string[];        // YAML path to version field
  rootPath?: string;                // Project root (default: process.cwd())
  order?: string[];                 // Source precedence order
  conflictStrategy?: ConflictStrategy; // How to handle conflicts
}
```

**Returns:** `Promise<ResolveResult>`

```typescript
{
  version: string | null;           // Resolved version
  data: Record<string, string | null>; // All source values
  conflicts: Conflict[];            // Detected conflicts
}
```

### `VersionPrecedenceResolver`

Generic resolver class for custom implementations.

See [Precedence Resolver Documentation](./docs/precedence-resolver.md) for detailed architecture and design decisions.

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details.

Copyright (c) 2025 ComputerWWWizards

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.
