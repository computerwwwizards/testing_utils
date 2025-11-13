import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { BaseSwitchHandler } from './base-switch-handler';
import { type HandlerResult, HandlerStatus } from './types';

const execAsync = promisify(exec);

export class NvmHandler extends BaseSwitchHandler {
  async handle(version: string): Promise<HandlerResult> {
    try {
      const nvmPath = await this.findNvmPath();
      if (!nvmPath) {
        return {
          status: HandlerStatus.ERROR,
          message: 'nvm is not installed or not available in PATH',
        };
      }

      await this.switchVersion(nvmPath, version);

      return {
        status: HandlerStatus.SUCCESS,
        message: `Successfully switched to Node.js version ${version} using nvm`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        status: HandlerStatus.ERROR,
        message: `Failed to switch Node.js version using nvm: ${errorMessage}`,
      };
    }
  }

  private async findNvmPath(): Promise<string | null> {
    try {
      const { stdout } = await execAsync(
        'bash -c "source ~/.nvm/nvm.sh && command -v nvm"',
      );
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }

  private async switchVersion(
    _nvmPath: string,
    version: string,
  ): Promise<void> {
    const command = `bash -c "source ~/.nvm/nvm.sh && nvm use ${version}"`;
    const { stderr } = await execAsync(command);

    if (stderr?.toLowerCase().includes('error')) {
      throw new Error(stderr);
    }
  }
}
