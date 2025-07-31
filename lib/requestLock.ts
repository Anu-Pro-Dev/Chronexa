const requestLocks = new Map<string, boolean>();

export function isLocked(key: string): boolean {
  return requestLocks.get(key) === true;
}

export function lockRequest(key: string) {
  requestLocks.set(key, true);
}

export function unlockRequest(key: string) {
  requestLocks.set(key, false);
}
