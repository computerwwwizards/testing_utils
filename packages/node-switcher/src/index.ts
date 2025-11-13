// Core exports

export { BaseSwitchHandler } from './base-handler.js';
export { FnmHandler } from './handlers/fnm-handler.js';

// Handler implementations
export { NvmHandler } from './handlers/nvm-handler.js';
export { NodeSwitcher } from './node-switcher.js';

// Type exports
export {
  type HandlerAttempt,
  type HandlerResult,
  HandlerStatus,
  type INodeSwitcher,
  type SwitchHandler,
  type SwitchOptions,
} from './types.js';
