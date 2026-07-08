/**
 * Supabase Storage serves public files inline (opens in the browser's PDF
 * viewer) unless a `download` query param is present, which makes it respond
 * with Content-Disposition: attachment instead -- triggering a real save to
 * disk rather than just opening a new tab. Plain `<a download>` doesn't work
 * here since these URLs are cross-origin (a different domain than the app).
 */
export function forceDownloadUrl(url: string, filename: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}download=${encodeURIComponent(filename)}`;
}
