import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIsoTime(isoString: string | null | undefined, lang: 'th' | 'en'): string {
  if (!isoString) return lang === 'th' ? 'ไม่ทราบเวลา' : 'Unknown';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatEpochDateTime(epochMs: number | null | undefined, lang: 'th' | 'en'): string {
  if (!epochMs || epochMs <= 0) {
    return lang === 'th' ? 'ไม่มีข้อมูลใน DB (ไม่คาดเดา)' : 'Not Recorded (No Guessing)';
  }
  try {
    const d = new Date(epochMs);
    return d.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(epochMs);
  }
}

export function formatNumber(val: number | null | undefined, fallback = 'Unavailable'): string {
  if (val === null || val === undefined || Number.isNaN(val)) return fallback;
  return val.toLocaleString('en-US');
}
