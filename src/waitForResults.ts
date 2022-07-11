import pWaitFor from 'p-wait-for';
import type { TimeoutOptions } from './types';

export const waitForResults = async <T>(getResults: () => Promise<T[]>, options?: TimeoutOptions): Promise<T[]> => {
  const { timeoutInMs, intervalInMs } = { timeoutInMs: 3000, intervalInMs: 500, ...options };
  let results: T[] = await getResults();

  if (results.length) {
    return results;
  }

  try {
    await pWaitFor(
      async () => {
        results = await getResults();

        return !!results.length;
      },
      { interval: intervalInMs, timeout: timeoutInMs },
    );
  } catch {
    return results;
  }

  return results;
};
