/**
 * L2J Mobius CT 2.6 High Five — Official Third-Class & Kamael Class Definitions
 * Reference: L2J_Mobius_CT_2.6_HighFive ClassId.java & Olympiad.java
 *
 * IMPORTANT: Soul Hound Male (132) and Soul Hound Female (133) are unified
 * into a single Olympiad ranking & Hero bracket per actual High Five server logic.
 */
export const HIGH_FIVE_OLYMPIAD_CLASSES = [
    { id: 88, groupedIds: [88], slug: 'duelist', nameEn: 'Duelist', nameTh: 'ดูเอลลิสต์ (Gladiator)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Warrior', recommendedSet: 'Elegia Heavy' },
    { id: 89, groupedIds: [89], slug: 'dreadnought', nameEn: 'Dreadnought', nameTh: 'เดรดนอท (Warlord)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Warrior', recommendedSet: 'Elegia Heavy' },
    { id: 90, groupedIds: [90], slug: 'phoenix-knight', nameEn: 'Phoenix Knight', nameTh: 'ฟีนิกซ์ไนท์ (Paladin)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Tank', recommendedSet: 'Elegia Heavy' },
    { id: 91, groupedIds: [91], slug: 'hell-knight', nameEn: 'Hell Knight', nameTh: 'เฮลไนท์ (Dark Avenger)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Tank', recommendedSet: 'Vorpal Heavy' },
    { id: 92, groupedIds: [92], slug: 'sagittarius', nameEn: 'Sagittarius', nameTh: 'ซาจิททาเรียส (Hawkeye)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Archer', recommendedSet: 'Vorpal Light' },
    { id: 93, groupedIds: [93], slug: 'adventurer', nameEn: 'Adventurer', nameTh: 'แอดเวนเจอเรอร์ (Treasure Hunter)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Dagger', recommendedSet: 'Vorpal Light' },
    { id: 94, groupedIds: [94], slug: 'archmage', nameEn: 'Archmage', nameTh: 'อาร์คเมจ (Sorcerer)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Mage', recommendedSet: 'Elegia Robe' },
    { id: 95, groupedIds: [95], slug: 'soultaker', nameEn: 'Soultaker', nameTh: 'โซลเทคเกอร์ (Necromancer)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Mage', recommendedSet: 'Elegia Robe' },
    { id: 96, groupedIds: [96], slug: 'arcana-lord', nameEn: 'Arcana Lord', nameTh: 'อาร์คานาลอร์ด (Warlock)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Summoner', recommendedSet: 'Elegia Light' },
    { id: 97, groupedIds: [97], slug: 'cardinal', nameEn: 'Cardinal', nameTh: 'คาร์ดินัล (Bishop)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Healer', recommendedSet: 'Vorpal Robe' },
    { id: 98, groupedIds: [98], slug: 'hierophant', nameEn: 'Hierophant', nameTh: 'ไฮโรแฟนต์ (Prophet)', race: 'Human', raceTh: 'มนุษย์', archetype: 'Enchanter', recommendedSet: 'Vorpal Heavy' },
    { id: 99, groupedIds: [99], slug: 'evas-templar', nameEn: "Eva's Templar", nameTh: 'อีวาเทมพลาร์ (Temple Knight)', race: 'Elf', raceTh: 'เอลฟ์', archetype: 'Tank', recommendedSet: 'Elegia Heavy' },
    { id: 100, groupedIds: [100], slug: 'sword-muse', nameEn: 'Sword Muse', nameTh: 'ซอร์ดมิวส์ (Swordsinger)', race: 'Elf', raceTh: 'เอลฟ์', archetype: 'Enchanter', recommendedSet: 'Elegia Heavy' },
    { id: 101, groupedIds: [101], slug: 'wind-rider', nameEn: 'Wind Rider', nameTh: 'วินด์ไรเดอร์ (Plains Walker)', race: 'Elf', raceTh: 'เอลฟ์', archetype: 'Dagger', recommendedSet: 'Elegia Light' },
    { id: 102, groupedIds: [102], slug: 'moonlight-sentinel', nameEn: 'Moonlight Sentinel', nameTh: 'มูนไลท์เซนทิเนล (Silver Ranger)', race: 'Elf', raceTh: 'เอลฟ์', archetype: 'Archer', recommendedSet: 'Vorpal Light' },
    { id: 103, groupedIds: [103], slug: 'mystic-muse', nameEn: 'Mystic Muse', nameTh: 'มิสติกมิวส์ (Spellsinger)', race: 'Elf', raceTh: 'เอลฟ์', archetype: 'Mage', recommendedSet: 'Moirai Robe' },
    { id: 104, groupedIds: [104], slug: 'elemental-master', nameEn: 'Elemental Master', nameTh: 'เอเลเมนทัลมาสเตอร์ (Elemental Summoner)', race: 'Elf', raceTh: 'เอลฟ์', archetype: 'Summoner', recommendedSet: 'Vorpal Robe' },
    { id: 105, groupedIds: [105], slug: 'evas-saint', nameEn: "Eva's Saint", nameTh: 'อีวาเซนต์ (Elven Elder)', race: 'Elf', raceTh: 'เอลฟ์', archetype: 'Healer', recommendedSet: 'Vorpal Robe' },
    { id: 106, groupedIds: [106], slug: 'shillien-templar', nameEn: 'Shillien Templar', nameTh: 'ชิลเลียนเทมพลาร์ (Shillien Knight)', race: 'Dark Elf', raceTh: 'ดาร์คเอลฟ์', archetype: 'Tank', recommendedSet: 'Elegia Heavy' },
    { id: 107, groupedIds: [107], slug: 'spectral-dancer', nameEn: 'Spectral Dancer', nameTh: 'สเปกตรัลแดนเซอร์ (Bladedancer)', race: 'Dark Elf', raceTh: 'ดาร์คเอลฟ์', archetype: 'Enchanter', recommendedSet: 'Elegia Heavy' },
    { id: 108, groupedIds: [108], slug: 'ghost-hunter', nameEn: 'Ghost Hunter', nameTh: 'โกสต์ฮันเตอร์ (Abyss Walker)', race: 'Dark Elf', raceTh: 'ดาร์คเอลฟ์', archetype: 'Dagger', recommendedSet: 'Vorpal Light' },
    { id: 109, groupedIds: [109], slug: 'ghost-sentinel', nameEn: 'Ghost Sentinel', nameTh: 'โกสต์เซนทิเนล (Phantom Ranger)', race: 'Dark Elf', raceTh: 'ดาร์คเอลฟ์', archetype: 'Archer', recommendedSet: 'Vorpal Light' },
    { id: 110, groupedIds: [110], slug: 'storm-screamer', nameEn: 'Storm Screamer', nameTh: 'สตอร์มสครีมเมอร์ (Spellhowler)', race: 'Dark Elf', raceTh: 'ดาร์คเอลฟ์', archetype: 'Mage', recommendedSet: 'Elegia Robe' },
    { id: 111, groupedIds: [111], slug: 'spectral-master', nameEn: 'Spectral Master', nameTh: 'สเปกตรัลมาสเตอร์ (Phantom Summoner)', race: 'Dark Elf', raceTh: 'ดาร์คเอลฟ์', archetype: 'Summoner', recommendedSet: 'Elegia Heavy' },
    { id: 112, groupedIds: [112], slug: 'shillien-saint', nameEn: 'Shillien Saint', nameTh: 'ชิลเลียนเซนต์ (Shillien Elder)', race: 'Dark Elf', raceTh: 'ดาร์คเอลฟ์', archetype: 'Healer', recommendedSet: 'Vorpal Robe' },
    { id: 113, groupedIds: [113], slug: 'titan', nameEn: 'Titan', nameTh: 'ไททัน (Destroyer)', race: 'Orc', raceTh: 'ออร์ค', archetype: 'Warrior', recommendedSet: 'Elegia Heavy' },
    { id: 114, groupedIds: [114], slug: 'grand-khavatari', nameEn: 'Grand Khavatari', nameTh: 'แกรนด์คาวาตาริ (Tyrant)', race: 'Orc', raceTh: 'ออร์ค', archetype: 'Warrior', recommendedSet: 'Elegia Heavy' },
    { id: 115, groupedIds: [115], slug: 'dominator', nameEn: 'Dominator', nameTh: 'โดมิเนเตอร์ (Overlord)', race: 'Orc', raceTh: 'ออร์ค', archetype: 'Enchanter', recommendedSet: 'Vorpal Heavy' },
    { id: 116, groupedIds: [116], slug: 'doomcryer', nameEn: 'Doomcryer', nameTh: 'ดูมครายเออร์ (Warcryer)', race: 'Orc', raceTh: 'ออร์ค', archetype: 'Enchanter', recommendedSet: 'Elegia Light' },
    { id: 117, groupedIds: [117], slug: 'fortune-seeker', nameEn: 'Fortune Seeker', nameTh: 'ฟอร์จูนซีคเกอร์ (Bounty Hunter)', race: 'Dwarf', raceTh: 'ดวอร์ฟ', archetype: 'Warrior', recommendedSet: 'Elegia Heavy' },
    { id: 118, groupedIds: [118], slug: 'maestro', nameEn: 'Maestro', nameTh: 'มาเอสโตร (Warsmith)', race: 'Dwarf', raceTh: 'ดวอร์ฟ', archetype: 'Warrior', recommendedSet: 'Elegia Heavy' },
    { id: 131, groupedIds: [131], slug: 'doombringer', nameEn: 'Doombringer', nameTh: 'ดูมบริงเกอร์ (Berserker)', race: 'Kamael', raceTh: 'คามาเอล', archetype: 'Warrior', recommendedSet: 'Vorpal Light' },
    // Soul Hound Male (132) & Female (133) unified into one Olympiad bracket per L2J Mobius High Five
    { id: 132, groupedIds: [132, 133], slug: 'soul-hound', nameEn: 'Soul Hound (132/133)', nameTh: 'โซลฮาวด์ (ชาย/หญิง รวมคลาส 132/133)', race: 'Kamael', raceTh: 'คามาเอล', archetype: 'Mage', recommendedSet: 'Moirai Light' },
    { id: 134, groupedIds: [134], slug: 'trickster', nameEn: 'Trickster', nameTh: 'ทริกสเตอร์ (Arbalester)', race: 'Kamael', raceTh: 'คามาเอล', archetype: 'Archer', recommendedSet: 'Vorpal Light' },
    { id: 136, groupedIds: [135, 136], slug: 'judicator', nameEn: 'Judicator', nameTh: 'จูดิเคเตอร์ (Inspector)', race: 'Kamael', raceTh: 'คามาเอล', archetype: 'Enchanter', recommendedSet: 'Vorpal Light' },
];
export function resolveCanonicalClassId(classId) {
    if (classId === 133)
        return 132;
    if (classId === 135)
        return 136;
    return classId;
}
export function getClassInfoById(classId) {
    const canonical = resolveCanonicalClassId(classId);
    return HIGH_FIVE_OLYMPIAD_CLASSES.find((c) => c.id === canonical);
}
