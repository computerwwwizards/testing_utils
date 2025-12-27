/**
 * Reads all content from a NodeJS.ReadableStream and returns it as a string
 */
export async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  let data = '';
  for await (const chunk of stream) {
    data += chunk;
  }
  return data;
}

/**
 * Safely attempts to close/destroy a stream if supported by its implementation.
 * Falls back gracefully when methods are unavailable.
 */
export function cleanupStream(stream: NodeJS.ReadableStream): void {
  const s: any = stream as any;
  try {
    if (typeof s.destroy === 'function') {
      s.destroy();
      return;
    }
    if (typeof s.close === 'function') {
      s.close();
      return;
    }
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Gets a value from an object by dot-separated path
 * @param obj - The object to traverse
 * @param path - Dot-separated path (e.g., "jobs.build.steps.0.with.node-version")
 * @returns The value at the path, or undefined if not found
 */
export function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}