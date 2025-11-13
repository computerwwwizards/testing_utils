// Core classes

export { BaseSwitchHandler } from './base-handler';
export { FnmHandler } from './handlers/fnm-handler';

// Handler implementations
export { NvmHandler } from './handlers/nvm-handler';
export { NodeSwitcher } from './node-switcher';

// Types
export {
  type HandlerAttempt,
  type HandlerResult,
  HandlerStatus,
  type Switcher,
  type SwitchHandler,
  type SwitchOptions,
} from './types';
