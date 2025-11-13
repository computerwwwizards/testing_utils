import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { BaseSwitchHandler } from '../base-handler.js';
import { type HandlerResult, HandlerStatus } from '../types.js';

const execAsync = promisify(exec);

/**
 * Handler for switching Node.js versions using NVM (Node Version Manager)
 */
export class NvmHandler extends BaseSwitchHandler {
  /**
   * Attempts to switch Node.js version using nvm
   * @param version - The Node.js version to switch to
   * @returns Result of the switch attempt
   */
  async handle(version: string): Promise<HandlerResult> {
    try {
      // Check if nvm is available
      await this.checkNvmAvailable();

      // Try to use the version (will install if not present)
      const { stderr } = await execAsync(
        `bash -c "source ~/.nvm/nvm.sh && nvm install ${version} && nvm use ${version}"`,
      );

      // Check if the switch was successful
      if (stderr && !stderr.includes('Now using node')) {
        return {
          status: HandlerStatus.ERROR,
          message: `NVM switch failed: ${stderr}`,
        };
      }

      return {
        status: HandlerStatus.SUCCESS,
        message: `Successfully switched to Node.js ${version} using NVM`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: HandlerStatus.ERROR,
        message: `NVM handler failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Checks if NVM is installed and available
   * @throws Error if NVM is not found
   */
  private async checkNvmAvailable(): Promise<void> {
    try {
      await execAsync('bash -c "source ~/.nvm/nvm.sh && command -v nvm"');
    } catch {
      throw new Error('NVM is not installed or not available in PATH');
    }
  }
}
