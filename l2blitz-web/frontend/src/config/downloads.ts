/**
 * Public download release configuration.
 *
 * The single Drive URL enables the client download button after deployment.
 * Keep the value empty if no shareable URL is ready.
 * Never put credentials or private files in this URL.
 */
export const DOWNLOAD_RELEASE = {
  fileName: 'L2Blitz-Installer.7z',
  fileSize: '7.58 GB',
  version: 'Close Beta',
  sha256: '',
  driveUrl: 'https://drive.google.com/file/d/1VSUBDxNlvoBHZpwakjHBgbUG97L9Yt9E/view?usp=sharing',
  launcherUrl: '',
} as const;

export function publicDownloadUrl(value: string): string | null {
  const candidate = value.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function googleDriveUrl(value: string): string | null {
  const verified = publicDownloadUrl(value);
  if (!verified) return null;

  const hostname = new URL(verified).hostname.toLowerCase();
  return hostname === 'drive.google.com' || hostname === 'docs.google.com' ? verified : null;
}
