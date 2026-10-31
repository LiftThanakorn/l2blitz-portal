/**
 * Public download release configuration.
 *
 * Keep links empty until a real, shareable URL is ready.
 * Adding a URL enables its download button after the next frontend build/deploy.
 * Mirror slots are alternatives for the same complete L2Blitz-Installer.7z archive.
 * Never put credentials or private files in these URLs.
 */
export const DOWNLOAD_RELEASE = {
  fileName: 'L2Blitz-Installer.7z',
  fileSize: '7.58 GB',
  version: 'Close Beta',
  sha256: '',
  mirrors: [
    { id: '01', url: 'https://drive.google.com/file/d/1r-2T-zKwezHQo942gPfzsAkFhc3MqSr9/view?usp=sharing' },
    { id: '02', url: 'https://drive.google.com/file/d/1i6uNYkFKWSSzh-SDJFCNjJNk-vOCFmcx/view?usp=sharing' },
  ],
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
