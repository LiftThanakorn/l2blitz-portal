import { describe, expect, it } from 'vitest';
import { DOWNLOAD_RELEASE, googleDriveUrl, publicDownloadUrl } from '../config/downloads';

describe('prelaunch downloads', () => {
  it('publishes only the replacement Google Drive download URL', () => {
    expect(googleDriveUrl(DOWNLOAD_RELEASE.driveUrl)).toBe('https://drive.google.com/file/d/1VSUBDxNlvoBHZpwakjHBgbUG97L9Yt9E/view?usp=sharing');
    expect(Object.keys(DOWNLOAD_RELEASE)).not.toContain('mirrors');
    expect(publicDownloadUrl(DOWNLOAD_RELEASE.launcherUrl)).toBe('https://l2blitz-patch.liftthanakorn-cs51.workers.dev/hotfix/L2BlitzLauncher.exe');
    expect(publicDownloadUrl(DOWNLOAD_RELEASE.launcherUpgradeUrl)).toBe('https://l2blitz-patch.liftthanakorn-cs51.workers.dev/hotfix/L2BlitzLauncher.exe');
    expect(DOWNLOAD_RELEASE.launcherUpgradeVersion).toBe('v1.1.1');
    expect(DOWNLOAD_RELEASE.launcherUpgradeSize).toBe('5.41 MB');
    expect(DOWNLOAD_RELEASE.launcherUpgradeSha256).toBe('CDCEDAD798CFDF80B7006F1541C1C267A80E6B739A1ED0D500676E2E1B05E67B');
    expect(publicDownloadUrl(DOWNLOAD_RELEASE.launcherFixUrl)).toBe('https://l2blitz-patch.liftthanakorn-cs51.workers.dev/hotfix/L2Blitz-Launcher-Fix-740-v0.4.1.exe');
    expect(DOWNLOAD_RELEASE.launcherFixSize).toBe('5.4 MB');
  });

  it('only activates mirrors with valid Google Drive HTTPS URLs', () => {
    expect(googleDriveUrl('https://drive.google.com/file/d/valid-id/view')).toBe('https://drive.google.com/file/d/valid-id/view');
    expect(googleDriveUrl('https://docs.google.com/uc?export=download&id=valid')).toBe('https://docs.google.com/uc?export=download&id=valid');
    expect(googleDriveUrl('')).toBeNull();
    expect(googleDriveUrl('https://drive.google.com.evil.example/file')).toBeNull();
    expect(googleDriveUrl('https://example.com/')).toBeNull();
    expect(googleDriveUrl('http://drive.google.com/file')).toBeNull();
    expect(googleDriveUrl('javascript:alert(1)')).toBeNull();
  });

  it('requires an HTTPS launcher link', () => {
    expect(publicDownloadUrl('http://example.com/launcher.exe')).toBeNull();
    expect(publicDownloadUrl('https://example.com/launcher.exe')).toBe('https://example.com/launcher.exe');
  });
});
