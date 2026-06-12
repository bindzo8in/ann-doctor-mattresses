export async function measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    console.log(`[PERF] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    console.log(`[PERF - ERROR] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
    throw error;
  }
}

export function measureSync<T>(label: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    console.log(`[PERF] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    console.log(`[PERF - ERROR] ${label}: ${(performance.now() - start).toFixed(2)}ms`);
    throw error;
  }
}
