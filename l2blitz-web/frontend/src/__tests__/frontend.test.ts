import { describe, it, expect } from 'vitest';
import { HIGH_FIVE_CLASSES, OLYMPIAD_CLASSES } from '../lib/api';
import { formatCheckedAt } from '../pages/OlympiadPage';

describe('L2BLITZ Frontend High Five Data & Routing Contracts', () => {
  it('1. Defines all 34 hero-eligible Olympiad class brackets with Soul Hound 132 & 133 unified', () => {
    expect(HIGH_FIVE_CLASSES).toHaveLength(35); // General classes, including Judicator for PvP details.
    expect(OLYMPIAD_CLASSES).toHaveLength(34);
    expect(OLYMPIAD_CLASSES.filter((cls) => cls.race === 'Kamael').map((cls) => cls.id)).toEqual([131, 132, 134]);
    expect(OLYMPIAD_CLASSES.some((cls) => cls.id === 136)).toBe(false);
    const soulHound = HIGH_FIVE_CLASSES.find((c) => c.id === 132);
    expect(soulHound).toBeDefined();
    expect(soulHound?.groupedIds).toEqual([132, 133]);
    expect(soulHound?.race).toBe('Kamael');
  });

  it('2. Includes all 6 playable Lineage II High Five races', () => {
    const races = new Set(HIGH_FIVE_CLASSES.map((c) => c.race));
    expect(races.has('Human')).toBe(true);
    expect(races.has('Elf')).toBe(true);
    expect(races.has('Dark Elf')).toBe(true);
    expect(races.has('Orc')).toBe(true);
    expect(races.has('Dwarf')).toBe(true);
    expect(races.has('Kamael')).toBe(true);
  });

  it('3. Shows API check timestamps in Bangkok time without using the browser timezone', () => {
    const apiUpdatedAt = '2026-10-30T15:33:33.099Z';
    expect(formatCheckedAt(apiUpdatedAt, 'th-TH')).toMatch(/22:33/);
    expect(formatCheckedAt(apiUpdatedAt, 'th-TH')).toContain('2569');
    expect(formatCheckedAt(apiUpdatedAt, 'en-GB')).toMatch(/22:33/);
    expect(formatCheckedAt('invalid', 'th-TH')).toBeNull();
  });
});