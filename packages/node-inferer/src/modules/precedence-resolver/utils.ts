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
 * Gets a value from an object by dot-separated path
 * @param obj - The object to traverse
 * @param path - Dot-separated path (e.g., "jobs.build.steps.0.with.node-version")
 * @returns The value at the path, or undefined if not found
 */
export function getValueByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}