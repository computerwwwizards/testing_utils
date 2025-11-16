# Node.js Version Switcher Design

A resilient system for switching Node.js versions that tries multiple strategies automatically. When one approach fails, it continues with the next available option, collecting detailed reports of all attempts. 

## Core Interfaces

```typescript

const enum SwitchStatus {
  SUCCESS = "success",
  ERROR = "error"
}

const enum HandlerStatus {
  SUCCESS = "success",
  ERROR = "error"
}

interface HandlerAttempt {
  handlerName: string;
  status: HandlerStatus; 
  message: string;
}

interface SwitchOptions<T> {
  handlerOrder?: T[];
}

interface Switcher<T> {
  register(name: T, handler: () => HandlerAttempt): Switcher;
  switchVersion(version: string, options?: SwitchOptions<T>): Promise<HandlerAttempt[]>;
}
```

## Basic Usage

```typescript
import { Switcher, NvmHandler, FnmHandler } from 'node-switcher';

const switcher = new Switcher()
  .register('nvm', new NvmHandler())
  .register('fnm', () => new FnmHandler());

const result = await switcher.switchVersion('18.17.0', {
  handlerOrder: ['nvm', 'fnm']
});

// {
//   status: SwitchStatus.SUCCESS,
//   attemps: [
//     { handlerName: 'nvm', status: HandlerStatus.ERROR, message: 'nvm not found' },
//     { handlerName: 'fnm', status: HandlerStatus.SUCCESS, message: 'Switched to 18.17.0' }
//   ]
// }


## Implementation Suggestions

- Consider stopping execution and logging attempts made up to that point when a handler throws an error
- Suggested behavior: throw error with complete summary if all handlers return ERROR status
- Recommended: return full array of attempts (both failed and successful) when any handler succeeds