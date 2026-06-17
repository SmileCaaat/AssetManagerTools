import path from "path";

function normalizeComparablePath(p: string): string {
  const resolved = path.resolve(p);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

export function isPathInsideRoot(targetPath: string, rootPath: string): boolean {
  const resolvedTarget = normalizeComparablePath(targetPath);
  const resolvedRoot = normalizeComparablePath(rootPath);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function assertPathInsideRoot(targetPath: string, rootPath: string): string {
  const resolved = path.resolve(targetPath);
  if (!isPathInsideRoot(resolved, rootPath)) {
    throw new Error("Path is outside allowed root");
  }
  return resolved;
}
