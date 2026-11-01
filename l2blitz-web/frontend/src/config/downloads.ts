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
  launcherUrl: 'https://l2blitz-patch.liftthanakorn-cs51.workers.dev/hotfix/L2BlitzLauncher.exe',
  launcherUpgradeUrl: 'https://l2blitz-patch.liftthanakorn-cs51.workers.dev/hotfix/L2BlitzLauncher.exe',
  launcherUpgradeVersion: 'v1.1.1',
  launcherUpgradeSize: '5.41 MB',
  launcherUpgradeSha256: 'CDCEDAD798CFDF80B7006F1541C1C267A80E6B739A1ED0D500676E2E1B05E67B',
  launcherFixUrl: 'https://l2blitz-patch.liftthanakorn-cs51.workers.dev/hotfix/L2Blitz-Launcher-Fix-740-v0.4.1.exe',
  launcherFixSize: '5.4 MB',
  launcherFixVersion: 'v0.4.1',
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
