import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DOWNLOAD_RELEASE, googleDriveUrl, publicDownloadUrl } from '../config/downloads';
import { DownloadsPage } from '../pages/DownloadsPage';
import { LanguageProvider } from '../context/LanguageContext';

const folderUrl = 'https://drive.google.com/drive/folders/1ufz_CB8rAoAVX4uXEuejVjOQ8L_e_tbh?usp=sharing';

describe('public game download', () => {
  it('uses only the approved Google Drive folder as the download destination', () => {
    expect(DOWNLOAD_RELEASE.folderUrl).toBe(folderUrl);
    expect(googleDriveUrl(DOWNLOAD_RELEASE.folderUrl)).toBe(folderUrl);
    expect(Object.keys(DOWNLOAD_RELEASE)).toEqual(['folderUrl']);
  });

  it('renders exactly one external download link on the downloads page', () => {
    const html = renderToStaticMarkup(React.createElement(LanguageProvider, null,
      React.createElement(DownloadsPage)));
    expect((html.match(/<a\s/g) ?? [])).toHaveLength(1);
    expect(html).toContain('href="' + folderUrl.replaceAll('&', '&amp;') + '"');
    expect(html).not.toContain('drive.google.com/file/d/');
    expect(html).not.toContain('l2blitz-patch.liftthanakorn-cs51.workers.dev');
  });
  it('only accepts secure Google Drive links', () => {
    expect(googleDriveUrl('https://drive.google.com/drive/folders/example')).toBe('https://drive.google.com/drive/folders/example');
    expect(googleDriveUrl('https://docs.google.com/uc?export=download&id=valid')).toBe('https://docs.google.com/uc?export=download&id=valid');
    expect(googleDriveUrl('')).toBeNull();
    expect(googleDriveUrl('https://drive.google.com.evil.example/file')).toBeNull();
    expect(googleDriveUrl('https://example.com/')).toBeNull();
    expect(googleDriveUrl('http://drive.google.com/file')).toBeNull();
    expect(googleDriveUrl('javascript:alert(1)')).toBeNull();
  });

  it('requires HTTPS links', () => {
    expect(publicDownloadUrl('http://example.com/launcher.exe')).toBeNull();
    expect(publicDownloadUrl('https://example.com/launcher.exe')).toBe('https://example.com/launcher.exe');
  });
});
