# Node Switcher

A resilient Node.js version switcher that tries multiple strategies automatically using the Chain of Responsibility pattern. When one approach fails, it continues with the next available option, collecting detailed reports of all attempts.

## Features

- **Chain of Responsibility Pattern**: Automatically tries alternative handlers when one fails
- **Flexible Handler Registration**: Register handlers as instances or factory functions
- **Detailed Reporting**: Get complete information about all switch attempts
- **Built-in Handlers**: Includes NVM and FNM handlers out of the box
- **Extensible**: Easy to add custom handlers for other version managers

## Installation

```bash
pnpm install
```

## Usage

### Basic Example

```typescript
import { NodeSwitcher, NvmHandler, FnmHandler } from 'node-switcher';

const switcher = new NodeSwitcher();

// Register handlers
switcher.register('nvm', new NvmHandler());
switcher.register('fnm', () => new FnmHandler()); // Or use a factory function

// Switch version
try {
  const attempts = await switcher.switchVersion('18.17.0', {
    handlerOrder: ['nvm', 'fnm']
  });

  console.log('Switch successful!', attempts);
  // [
  //   { handlerName: 'nvm', status: HandlerStatus.ERROR, message: 'nvm not found' },
  //   { handlerName: 'fnm', status: HandlerStatus.SUCCESS, message: 'Switched to 18.17.0' }
  // ]
} catch (error) {
  console.error('All handlers failed:', error);
}
```

### Creating Custom Handlers

```typescript
import { BaseSwitchHandler, HandlerStatus, type HandlerResult } from 'node-switcher';

class CustomHandler extends BaseSwitchHandler {
  async handle(version: string): Promise<HandlerResult> {
    try {
      // Your custom version switching logic here
      return {
        status: HandlerStatus.SUCCESS,
        message: `Switched to ${version}`
      };
    } catch (error) {
      return {
        status: HandlerStatus.ERROR,
        message: `Failed: ${error.message}`
      };
    }
  }
}

switcher.register('custom', new CustomHandler());
```

## API Reference

### NodeSwitcher

Main class for managing Node.js version switching.

#### Methods

- `register(name: string, handler: SwitchHandler | (() => SwitchHandler)): NodeSwitcher`
  - Registers a handler with a given name
  - Returns itself for method chaining

- `switchVersion(version: string, options?: SwitchOptions): Promise<HandlerAttempt[]>`
  - Switches to the specified Node.js version
  - Returns array of all handler attempts
  - Throws error if all handlers fail

### Built-in Handlers

- **NvmHandler**: Switches versions using NVM (Node Version Manager)
- **FnmHandler**: Switches versions using FNM (Fast Node Manager)

## Development

Build the library:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

Build in watch mode:

```bash
pnpm dev
```

Format and lint:

```bash
pnpm check
```
