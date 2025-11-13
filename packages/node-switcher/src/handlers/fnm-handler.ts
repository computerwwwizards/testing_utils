import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { BaseSwitchHandler } from '../base-handler.js';
import { type HandlerResult, HandlerStatus } from '../types.js';

const execAsync = promisify(exec);

/**
 * Handler for switching Node.js versions using FNM (Fast Node Manager)
 */
export class FnmHandler extends BaseSwitchHandler {
  /**
   * Attempts to switch Node.js version using fnm
   * @param version - The Node.js version to switch to
   * @returns Result of the switch attempt
   */
  async handle(version: string): Promise<HandlerResult> {
    try {
      // Check if fnm is available
      await this.checkFnmAvailable();

      // Try to install and use the version
      await execAsync(`fnm install ${version}`);
      await execAsync(`fnm use ${version}`);

      // Verify the switch was successful
      const { stdout } = await execAsync('fnm current');
      const currentVersion = stdout.trim();

      if (!currentVersion.includes(version)) {
        return {
          status: HandlerStatus.ERROR,
          message: `FNM switch failed: expected ${version}, got ${currentVersion}`,
        };
      }

      return {
        status: HandlerStatus.SUCCESS,
        message: `Successfully switched to Node.js ${version} using FNM`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: HandlerStatus.ERROR,
        message: `FNM handler failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Checks if FNM is installed and available
   * @throws Error if FNM is not found
   */
  private async checkFnmAvailable(): Promise<void> {
    try {
      await execAsync('command -v fnm');
    } catch {
      throw new Error('FNM is not installed or not available in PATH');
    }
  }
}
