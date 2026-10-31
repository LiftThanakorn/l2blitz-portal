import { describe, expect, it } from 'vitest';
import { DOWNLOAD_RELEASE, googleDriveUrl, publicDownloadUrl } from '../config/downloads';

describe('prelaunch downloads', () => {
  it('publishes exactly two shared Google Drive download mirrors', () => {
    expect(DOWNLOAD_RELEASE.mirrors).toHaveLength(2);
    expect(DOWNLOAD_RELEASE.mirrors.map((mirror) => mirror.id)).toEqual(['01', '02']);
    expect(googleDriveUrl(DOWNLOAD_RELEASE.mirrors[0].url)).toBe('https://drive.google.com/file/d/1r-2T-zKwezHQo942gPfzsAkFhc3MqSr9/view?usp=sharing');
    expect(googleDriveUrl(DOWNLOAD_RELEASE.mirrors[1].url)).toBe('https://drive.google.com/file/d/1i6uNYkFKWSSzh-SDJFCNjJNk-vOCFmcx/view?usp=sharing');
    expect(DOWNLOAD_RELEASE.mirrors.every((mirror) => googleDriveUrl(mirror.url) !== null)).toBe(true);
    expect(publicDownloadUrl(DOWNLOAD_RELEASE.launcherUrl)).toBeNull();
    expect(publicDownloadUrl(DOWNLOAD_RELEASE.launcherUpgradeUrl)).toBe('https://l2blitz-patch.liftthanakorn-cs51.workers.dev/hotfix/L2Blitz-Launcher-Upgrade-v1.1.exe');
    expect(DOWNLOAD_RELEASE.launcherUpgradeVersion).toBe('v1.1');
    expect(DOWNLOAD_RELEASE.launcherUpgradeSize).toBe('5.44 MB');
    expect(DOWNLOAD_RELEASE.launcherUpgradeSha256).toBe('057DF724CE64998E8D29D7A81BE0F544519D6A933C5EBCEC5650408EE4564496');
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
