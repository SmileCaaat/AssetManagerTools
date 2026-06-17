function debugEnabled(): boolean {
  const v = process.env.DEBUG;
  return v === "1" || v === "true" || v === "yes";
}

export function isDebugMode(): boolean {
  return debugEnabled();
}

export function debugLog(scope: string, message: string, data?: Record<string, unknown>): void {
  if (!debugEnabled()) return;
  const ts = new Date().toISOString().slice(11, 23);
  if (data && Object.keys(data).length > 0) {
    console.log(`[${ts}] [DEBUG:${scope}] ${message}`, data);
  } else {
    console.log(`[${ts}] [DEBUG:${scope}] ${message}`);
  }
}
