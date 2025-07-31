import { isLocked, lockRequest, unlockRequest } from './requestLock';
import logger from './logger';

type FetchOptions = RequestInit & {
  logLabel?: string;
};

export async function fetchWithLogging<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<{ status: number; body: T }> {
  const start = Date.now();
  const lockKey = url;
  const { logLabel = 'API', ...fetchOptions } = options;

  if (isLocked(lockKey)) {
    logger.warn({ message: `Blocked duplicate request: ${lockKey}` });
    throw new Error(`Request already in progress for ${logLabel}`);
  }

  lockRequest(lockKey);

  let requestBody: unknown;
  if (fetchOptions.body && typeof fetchOptions.body === 'string') {
    try {
      requestBody = JSON.parse(fetchOptions.body);
    } catch {
      requestBody = fetchOptions.body;
    }
  }

  logger.info({
    message: `Request - ${logLabel}`,
    url,
    method: fetchOptions.method || 'GET',
    headers: fetchOptions.headers,
    body: requestBody,
  });

  try {
    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type');
    const responseTime = `${Date.now() - start}ms`;

    let responseBody: unknown;
    if (contentType?.includes('application/json')) {
      responseBody = await response.clone().json();
    } else {
      responseBody = await response.clone().text();
    }

    logger.info({
      message: `Response - ${logLabel}`,
      url,
      status: response.status,
      responseTime,
      responseBody,
    });

    return {
      status: response.status,
      body: responseBody as T,
    };
  } catch (error: unknown) {
    const err = error as Error;
    logger.error({
      message: `${logLabel} - Error`,
      url,
      error: err.message,
    });
    throw error;
  } finally {
    unlockRequest(lockKey);
  }
}
