import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { BaseSwitchHandler } from './base-switch-handler';
import { type HandlerResult, HandlerStatus } from './types';

const execAsync = promisify(exec);

export class FnmHandler extends BaseSwitchHandler {
  async handle(version: string): Promise<HandlerResult> {
    try {
      const isFnmAvailable = await this.checkFnmAvailability();
      if (!isFnmAvailable) {
        return {
          status: HandlerStatus.ERROR,
          message: 'fnm is not installed or not available in PATH',
        };
      }

      await this.switchVersion(version);

      return {
        status: HandlerStatus.SUCCESS,
        message: `Successfully switched to Node.js version ${version} using fnm`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        status: HandlerStatus.ERROR,
        message: `Failed to switch Node.js version using fnm: ${errorMessage}`,
      };
    }
  }

  private async checkFnmAvailability(): Promise<boolean> {
    try {
      await execAsync('command -v fnm');
      return true;
    } catch {
      return false;
    }
  }

  private async switchVersion(version: string): Promise<void> {
    const { stderr } = await execAsync(`fnm use ${version}`);

    if (stderr?.toLowerCase().includes('error')) {
      throw new Error(stderr);
    }
  }
}
