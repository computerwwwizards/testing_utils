import { spawn } from 'node:child_process';
import { type HandlerAttempt, HandlerStatus } from './types';

export class NvmHandler {
  private handlerName = 'nvm';

  async switchVersion(version: string): Promise<HandlerAttempt> {
    return new Promise((resolve) => {
      const nvmDir = process.env.NVM_DIR || `${process.env.HOME}/.nvm`;
      const nvmScript = `${nvmDir}/nvm.sh`;

      const child = spawn(
        'bash',
        ['-c', `source ${nvmScript} && nvm use ${version}`],
        {
          shell: true,
          env: { ...process.env },
        },
      );

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            handlerName: this.handlerName,
            status: HandlerStatus.SUCCESS,
            message: `Switched to Node.js v${version}`,
          });
        } else {
          const errorMsg = stderr || stdout || `Failed with exit code ${code}`;
          resolve({
            handlerName: this.handlerName,
            status: HandlerStatus.ERROR,
            message: errorMsg.trim(),
          });
        }
      });

      child.on('error', (error) => {
        resolve({
          handlerName: this.handlerName,
          status: HandlerStatus.ERROR,
          message: error.message,
        });
      });
    });
  }
}

export function createNvmHandler(): (
  version: string,
) => Promise<HandlerAttempt> {
  const handler = new NvmHandler();
  return (version: string) => handler.switchVersion(version);
}
