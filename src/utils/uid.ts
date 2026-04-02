export function generateUID(prefix?: string): string {
  let sanitized = (prefix ?? 'vbg')
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!sanitized) sanitized = 'vbg';

  const suffix = Math.random().toString(36).substring(2, 7);
  return `${sanitized}-${suffix}`;
}
