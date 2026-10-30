import { describe, expect, it } from 'vitest';
import { DOWNLOAD_RELEASE, googleDriveUrl, publicDownloadUrl } from '../config/downloads';

describe('prelaunch downloads', () => {
  it('keeps all three Google Drive slots but does not publish placeholder links', () => {
    expect(DOWNLOAD_RELEASE.mirrors).toHaveLength(3);
    expect(DOWNLOAD_RELEASE.mirrors.map((mirror) => mirror.id)).toEqual(['01', '02', '03']);
    expect(DOWNLOAD_RELEASE.mirrors.every((mirror) => googleDriveUrl(mirror.url) === null)).toBe(true);
    expect(publicDownloadUrl(DOWNLOAD_RELEASE.launcherUrl)).toBeNull();
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
