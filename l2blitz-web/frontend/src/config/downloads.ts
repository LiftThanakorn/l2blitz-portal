/** One public Google Drive folder for the L2BLITZ download page. */
export const DOWNLOAD_RELEASE = {
  folderUrl: 'https://drive.google.com/drive/folders/1ufz_CB8rAoAVX4uXEuejVjOQ8L_e_tbh?usp=sharing',
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
