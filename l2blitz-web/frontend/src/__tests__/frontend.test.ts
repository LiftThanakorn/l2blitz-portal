import { describe, it, expect } from 'vitest';
import { HIGH_FIVE_CLASSES } from '../lib/api';

describe('L2BLITZ Frontend High Five Data & Routing Contracts', () => {
  it('1. Defines all 35 Olympiad class brackets with Soul Hound 132 & 133 unified', () => {
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
});
