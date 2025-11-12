# Node.js Version Switcher Design

A resilient system for switching Node.js versions that tries multiple strategies automatically. When one approach fails, it continues with the next available option, collecting detailed reports of all attempts. Uses Chain of Responsibility pattern for flexible handler management.

## Core Interfaces

```typescript

enum HandlerStatus {
  SUCCESS = "success",
  ERROR = "error"
}

interface SwitchHandler {
  next?: SwitchHandler;
  handle(version: string): Promise<HandlerResult>;
  setNext(handler: SwitchHandler): SwitchHandler;
}

interface HandlerAttempt {
  handlerName: string;
  status: HandlerStatus; 
  message: string;
}

interface SwitchOptions {
  handlerOrder?: string[];
}

interface NodeSwitcher {
  register(name: string, handler: NodeSwitchHandler | () => NodeSwitchHandler): NodeSwitcher;
  switchVersion(version: string, options?: SwitchOptions): Promise<HandlerAttempt[]>;
}
```

## Basic Usage

```typescript
import { NodeSwitcher, NvmHandler, FnmHandler } from 'node-switcher';

const switcher = new NodeSwitcher();
switcher.register('nvm', new NvmHandler());
switcher.register('fnm', () => new FnmHandler());

const result = await switcher.switchVersion('18.17.0', {
  handlerOrder: ['nvm', 'fnm']
});

// [
//   { handlerName: 'nvm', status: HandlerStatus.ERROR, message: 'nvm not found' },
//   { handlerName: 'fnm', status: HandlerStatus.SUCCESS, message: 'Switched to 18.17.0' }
// ]

## Implementation Suggestions

- Consider stopping execution and logging attempts made up to that point when a handler throws an error
- Suggested behavior: throw error with complete summary if all handlers return ERROR status
- Recommended: return full array of attempts (both failed and successful) when any handler succeeds