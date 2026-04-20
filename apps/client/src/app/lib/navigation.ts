export const DEFAULT_AUTH_NEXT_PATH = "/dashboard";

export function sanitizeNextPath(nextPath: string): string {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return DEFAULT_AUTH_NEXT_PATH;
  }

  return nextPath;
}
