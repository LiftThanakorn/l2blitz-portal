/**
 * Complete Lineage II High Five (CT 2.6) Class ID to Class Name Mapping
 * Sourced from L2J_Mobius_CT_2.6_HighFive/dist/game/data/stats/chars/classList.xml
 * Includes Human, Elf, Dark Elf, Orc, Dwarf, and Kamael (123–136) classes.
 */
export interface L2ClassInfo {
  id: number;
  name: string;
  race: 'Human' | 'Elf' | 'Dark Elf' | 'Orc' | 'Dwarf' | 'Kamael';
  tier: 1 | 2 | 3 | 4;
  isThirdClass: boolean;
}

export const L2_HIGH_FIVE_CLASSES: Record<number, L2ClassInfo> = {
  // Human Fighter
  0: { id: 0, name: 'Human Fighter', race: 'Human', tier: 1, isThirdClass: false },
  1: { id: 1, name: 'Warrior', race: 'Human', tier: 2, isThirdClass: false },
  2: { id: 2, name: 'Gladiator', race: 'Human', tier: 3, isThirdClass: false },
  3: { id: 3, name: 'Warlord', race: 'Human', tier: 3, isThirdClass: false },
  4: { id: 4, name: 'Human Knight', race: 'Human', tier: 2, isThirdClass: false },
  5: { id: 5, name: 'Paladin', race: 'Human', tier: 3, isThirdClass: false },
  6: { id: 6, name: 'Dark Avenger', race: 'Human', tier: 3, isThirdClass: false },
  7: { id: 7, name: 'Rogue', race: 'Human', tier: 2, isThirdClass: false },
  8: { id: 8, name: 'Treasure Hunter', race: 'Human', tier: 3, isThirdClass: false },
  9: { id: 9, name: 'Hawkeye', race: 'Human', tier: 3, isThirdClass: false },

  // Human Mystic
  10: { id: 10, name: 'Human Mystic', race: 'Human', tier: 1, isThirdClass: false },
  11: { id: 11, name: 'Human Wizard', race: 'Human', tier: 2, isThirdClass: false },
  12: { id: 12, name: 'Sorcerer', race: 'Human', tier: 3, isThirdClass: false },
  13: { id: 13, name: 'Necromancer', race: 'Human', tier: 3, isThirdClass: false },
  14: { id: 14, name: 'Warlock', race: 'Human', tier: 3, isThirdClass: false },
  15: { id: 15, name: 'Cleric', race: 'Human', tier: 2, isThirdClass: false },
  16: { id: 16, name: 'Bishop', race: 'Human', tier: 3, isThirdClass: false },
  17: { id: 17, name: 'Prophet', race: 'Human', tier: 3, isThirdClass: false },

  // Elven Fighter & Mystic
  18: { id: 18, name: 'Elven Fighter', race: 'Elf', tier: 1, isThirdClass: false },
  19: { id: 19, name: 'Elven Knight', race: 'Elf', tier: 2, isThirdClass: false },
  20: { id: 20, name: 'Temple Knight', race: 'Elf', tier: 3, isThirdClass: false },
  21: { id: 21, name: 'Swordsinger', race: 'Elf', tier: 3, isThirdClass: false },
  22: { id: 22, name: 'Elven Scout', race: 'Elf', tier: 2, isThirdClass: false },
  23: { id: 23, name: 'Plains Walker', race: 'Elf', tier: 3, isThirdClass: false },
  24: { id: 24, name: 'Silver Ranger', race: 'Elf', tier: 3, isThirdClass: false },
  25: { id: 25, name: 'Elven Mystic', race: 'Elf', tier: 1, isThirdClass: false },
  26: { id: 26, name: 'Elven Wizard', race: 'Elf', tier: 2, isThirdClass: false },
  27: { id: 27, name: 'Spellsinger', race: 'Elf', tier: 3, isThirdClass: false },
  28: { id: 28, name: 'Elemental Summoner', race: 'Elf', tier: 3, isThirdClass: false },
  29: { id: 29, name: 'Elven Oracle', race: 'Elf', tier: 2, isThirdClass: false },
  30: { id: 30, name: 'Elven Elder', race: 'Elf', tier: 3, isThirdClass: false },

  // Dark Elven Fighter & Mystic
  31: { id: 31, name: 'Dark Fighter', race: 'Dark Elf', tier: 1, isThirdClass: false },
  32: { id: 32, name: 'Palus Knight', race: 'Dark Elf', tier: 2, isThirdClass: false },
  33: { id: 33, name: 'Shillien Knight', race: 'Dark Elf', tier: 3, isThirdClass: false },
  34: { id: 34, name: 'Bladedancer', race: 'Dark Elf', tier: 3, isThirdClass: false },
  35: { id: 35, name: 'Assassin', race: 'Dark Elf', tier: 2, isThirdClass: false },
  36: { id: 36, name: 'Abyss Walker', race: 'Dark Elf', tier: 3, isThirdClass: false },
  37: { id: 37, name: 'Phantom Ranger', race: 'Dark Elf', tier: 3, isThirdClass: false },
  38: { id: 38, name: 'Dark Mystic', race: 'Dark Elf', tier: 1, isThirdClass: false },
  39: { id: 39, name: 'Dark Wizard', race: 'Dark Elf', tier: 2, isThirdClass: false },
  40: { id: 40, name: 'Spellhowler', race: 'Dark Elf', tier: 3, isThirdClass: false },
  41: { id: 41, name: 'Phantom Summoner', race: 'Dark Elf', tier: 3, isThirdClass: false },
  42: { id: 42, name: 'Shillien Oracle', race: 'Dark Elf', tier: 2, isThirdClass: false },
  43: { id: 43, name: 'Shillien Elder', race: 'Dark Elf', tier: 3, isThirdClass: false },

  // Orc Fighter & Mystic
  44: { id: 44, name: 'Orc Fighter', race: 'Orc', tier: 1, isThirdClass: false },
  45: { id: 45, name: 'Orc Raider', race: 'Orc', tier: 2, isThirdClass: false },
  46: { id: 46, name: 'Destroyer', race: 'Orc', tier: 3, isThirdClass: false },
  47: { id: 47, name: 'Orc Monk', race: 'Orc', tier: 2, isThirdClass: false },
  48: { id: 48, name: 'Tyrant', race: 'Orc', tier: 3, isThirdClass: false },
  49: { id: 49, name: 'Orc Mystic', race: 'Orc', tier: 1, isThirdClass: false },
  50: { id: 50, name: 'Orc Shaman', race: 'Orc', tier: 2, isThirdClass: false },
  51: { id: 51, name: 'Overlord', race: 'Orc', tier: 3, isThirdClass: false },
  52: { id: 52, name: 'Warcryer', race: 'Orc', tier: 3, isThirdClass: false },

  // Dwarven Fighter
  53: { id: 53, name: 'Dwarven Fighter', race: 'Dwarf', tier: 1, isThirdClass: false },
  54: { id: 54, name: 'Scavenger', race: 'Dwarf', tier: 2, isThirdClass: false },
  55: { id: 55, name: 'Bounty Hunter', race: 'Dwarf', tier: 3, isThirdClass: false },
  56: { id: 56, name: 'Artisan', race: 'Dwarf', tier: 2, isThirdClass: false },
  57: { id: 57, name: 'Warsmith', race: 'Dwarf', tier: 3, isThirdClass: false },

  // 3rd Classes (88 - 118)
  88: { id: 88, name: 'Duelist', race: 'Human', tier: 4, isThirdClass: true },
  89: { id: 89, name: 'Dreadnought', race: 'Human', tier: 4, isThirdClass: true },
  90: { id: 90, name: 'Phoenix Knight', race: 'Human', tier: 4, isThirdClass: true },
  91: { id: 91, name: 'Hell Knight', race: 'Human', tier: 4, isThirdClass: true },
  92: { id: 92, name: 'Sagittarius', race: 'Human', tier: 4, isThirdClass: true },
  93: { id: 93, name: 'Adventurer', race: 'Human', tier: 4, isThirdClass: true },
  94: { id: 94, name: 'Archmage', race: 'Human', tier: 4, isThirdClass: true },
  95: { id: 95, name: 'Soultaker', race: 'Human', tier: 4, isThirdClass: true },
  96: { id: 96, name: 'Arcana Lord', race: 'Human', tier: 4, isThirdClass: true },
  97: { id: 97, name: 'Cardinal', race: 'Human', tier: 4, isThirdClass: true },
  98: { id: 98, name: 'Hierophant', race: 'Human', tier: 4, isThirdClass: true },

  99: { id: 99, name: 'Eva\'s Templar', race: 'Elf', tier: 4, isThirdClass: true },
  100: { id: 100, name: 'Sword Muse', race: 'Elf', tier: 4, isThirdClass: true },
  101: { id: 101, name: 'Wind Rider', race: 'Elf', tier: 4, isThirdClass: true },
  102: { id: 102, name: 'Moonlight Sentinel', race: 'Elf', tier: 4, isThirdClass: true },
  103: { id: 103, name: 'Mystic Muse', race: 'Elf', tier: 4, isThirdClass: true },
  104: { id: 104, name: 'Elemental Master', race: 'Elf', tier: 4, isThirdClass: true },
  105: { id: 105, name: 'Eva\'s Saint', race: 'Elf', tier: 4, isThirdClass: true },

  106: { id: 106, name: 'Shillien Templar', race: 'Dark Elf', tier: 4, isThirdClass: true },
  107: { id: 107, name: 'Spectral Dancer', race: 'Dark Elf', tier: 4, isThirdClass: true },
  108: { id: 108, name: 'Ghost Hunter', race: 'Dark Elf', tier: 4, isThirdClass: true },
  109: { id: 109, name: 'Ghost Sentinel', race: 'Dark Elf', tier: 4, isThirdClass: true },
  110: { id: 110, name: 'Storm Screamer', race: 'Dark Elf', tier: 4, isThirdClass: true },
  111: { id: 111, name: 'Spectral Master', race: 'Dark Elf', tier: 4, isThirdClass: true },
  112: { id: 112, name: 'Shillien Saint', race: 'Dark Elf', tier: 4, isThirdClass: true },

  113: { id: 113, name: 'Titan', race: 'Orc', tier: 4, isThirdClass: true },
  114: { id: 114, name: 'Grand Khavatari', race: 'Orc', tier: 4, isThirdClass: true },
  115: { id: 115, name: 'Dominator', race: 'Orc', tier: 4, isThirdClass: true },
  116: { id: 116, name: 'Doomcryer', race: 'Orc', tier: 4, isThirdClass: true },

  117: { id: 117, name: 'Fortune Seeker', race: 'Dwarf', tier: 4, isThirdClass: true },
  118: { id: 118, name: 'Maestro', race: 'Dwarf', tier: 4, isThirdClass: true },

  // High Five Kamael Classes (123 - 136)
  123: { id: 123, name: 'Male Kamael Soldier', race: 'Kamael', tier: 1, isThirdClass: false },
  124: { id: 124, name: 'Female Kamael Soldier', race: 'Kamael', tier: 1, isThirdClass: false },
  125: { id: 125, name: 'Trooper', race: 'Kamael', tier: 2, isThirdClass: false },
  126: { id: 126, name: 'Warder', race: 'Kamael', tier: 2, isThirdClass: false },
  127: { id: 127, name: 'Berserker', race: 'Kamael', tier: 3, isThirdClass: false },
  128: { id: 128, name: 'Male Soul Breaker', race: 'Kamael', tier: 3, isThirdClass: false },
  129: { id: 129, name: 'Female Soul Breaker', race: 'Kamael', tier: 3, isThirdClass: false },
  130: { id: 130, name: 'Arbalester', race: 'Kamael', tier: 3, isThirdClass: false },
  131: { id: 131, name: 'Doombringer', race: 'Kamael', tier: 4, isThirdClass: true },
  132: { id: 132, name: 'Male Soul Hound', race: 'Kamael', tier: 4, isThirdClass: true },
  133: { id: 133, name: 'Female Soul Hound', race: 'Kamael', tier: 4, isThirdClass: true },
  134: { id: 134, name: 'Trickster', race: 'Kamael', tier: 4, isThirdClass: true },
  135: { id: 135, name: 'Inspector', race: 'Kamael', tier: 3, isThirdClass: false },
  136: { id: 136, name: 'Judicator', race: 'Kamael', tier: 4, isThirdClass: true },
};

export function getClassName(classId: number): string {
  return L2_HIGH_FIVE_CLASSES[classId]?.name ?? `Unknown Class (${classId})`;
}

export const THIRD_CLASS_LIST: L2ClassInfo[] = Object.values(L2_HIGH_FIVE_CLASSES).filter(
  (c) => c.isThirdClass
);
