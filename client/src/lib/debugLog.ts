function debugEnabled(): boolean {
  return import.meta.env.VITE_DEBUG === "1" || import.meta.env.VITE_DEBUG === "true";
}

export function isDebugMode(): boolean {
  return debugEnabled();
}

export function debugLog(scope: string, message: string, data?: Record<string, unknown>): void {
  if (!debugEnabled()) return;
  const ts = new Date().toISOString().slice(11, 23);
  if (data && Object.keys(data).length > 0) {
    console.log(`[${ts}] [AMT DEBUG:${scope}] ${message}`, data);
  } else {
    console.log(`[${ts}] [AMT DEBUG:${scope}] ${message}`);
  }
}
