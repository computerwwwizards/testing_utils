# Problem Statement: Node.js Version Switcher
Given a Node.js version input (x.x.x format), we need to change the global Node.js version on the current Linux operating system. 

## Challenges & Requirements

### Strategy Management
- Multiple strategies exist for switching Node.js versions (nvm, fnm, etc.)
- Need flexibility to register new strategies dynamically
- Each strategy may have different prerequisites and capabilities

### Resilience Issues
- Strategies can fail for various reasons:
  - Strategy tool not installed on the system
  - Permission issues during switching
  - Network failures during version downloads
- Need a way to handle failures gracefully and try alternative approaches

### Configuration Complexity
- Strategy execution order should be configurable
- Strategies for different failure scenarios

### Chain of Responsibility Challenge
- Need a mechanism to try one strategy, and if it fails, automatically attempt the next one
- The chain should continue until either success or all strategies are exhausted
- Each step in the chain needs to handle its own failure scenarios

