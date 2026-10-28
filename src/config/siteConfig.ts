import { L2BLITZ_FARM_ZONES } from '../../shared/staticGameContent';

export interface BilingualText {
  th: string;
  en: string;
}

export interface DownloadItemConfig {
  id: string;
  title: BilingualText;
  version: string;
  size: string;
  sha256: string;
  /**
   * IMPORTANT (Section 4 — Downloads Rule):
   * "หากไม่มีลิงก์ดาวน์โหลดจริง ห้ามสร้างลิงก์ปลอมหรือปุ่มที่อ้างว่าดาวน์โหลดได้"
   * Keep `url: null` until the real L2Blitz CDN/Mirror link is ready.
   * When `url` is null, the UI renders a disabled "รออัปเดตลิงก์จริง / Pending Official Mirror" state.
   */
  url: string | null;
  mirrorUrl: string | null;
  description: BilingualText;
}

export const SITE_CONFIG = {
  brand: {
    name: 'L2BLITZ PVP',
    chronicle: 'Lineage II High Five (CT 2.6)',
    tagline: {
      th: 'เซิร์ฟเวอร์ Lineage II High Five Instant PvP แห่งประเทศไทย — สมดุล คมชัด พร้อมบวกทันที',
      en: 'Lineage II High Five Instant PvP Server (Thailand) — Balanced, Tactical, Ready for Combat',
    },
    accountRegistrationNotice: {
      th: 'ระบบสมัครบัญชีเกมอยู่ในตัวเกมโดยตรง (Auto-Create / In-Game Account) เว็บไซต์นี้มีหน้าที่แสดงข้อมูลเซิร์ฟเวอร์และสถิติแบบอ่านอย่างเดียว ไม่ต้องล็อกอินบนเว็บ',
      en: 'Game accounts are managed directly inside the game client. This portal provides read-only server statistics and guides with no web login required.',
    },
  },

  /**
   * Easy-to-edit Server Information Configuration (Section 4 — Server Information)
   */
  serverInfo: {
    rates: {
      exp: 1000,
      sp: 1000,
      adena: 50,
      drop: 10,
      spoil: 15,
      questDrop: 5,
      raidDrop: 1,
      maxLevel: 85,
      subClassMaxLevel: 85,
    },
    enchant: {
      safeEnchant: '+4 (Full-body Armor +4)',
      maxWeapon: '+16',
      maxArmor: '+12',
      maxJewelry: '+12',
      normalScrollChance: '65% (ล้มเหลวแตกเป็น Crystal)',
      blessedScrollChance: '75% (ล้มเหลวกลับเป็น +4 Safe Enchant)',
      ancientScrollChance: '35% (ล้มเหลวระดับตีบวกคงเดิม ไม่ลดระดับ)',
      elementStoneMax: 'Lv. 4 (150 Attribute) — โอกาสสำเร็จ 55%',
      elementCrystalMax: 'Lv. 7 (300 Attribute) — โอกาสสำเร็จ 40%',
    },
    starterPack: [
      {
        th: 'สร้างตัวละครเริ่มต้นเลเวล 80 พร้อมเปลี่ยนอาชีพขั้น 3 ได้ทันทีผ่าน Community Board (Alt+B)',
        en: 'Start at Level 80 with instant 3rd Class Transfer via Community Board (Alt+B)',
      },
      {
        th: 'รับชุดเกราะ อาวุธ และประดับระดับ S80 (Dynasty / Moirai) +4 พร้อมใช้งานทันที',
        en: 'Receive S80-Grade (Dynasty / Moirai) +4 Starter Gear set immediately upon creation',
      },
      {
        th: 'แถมฟรี Soulshot / Blessed Spiritshot, Mana Potion และชุดบัฟเริ่มต้นครบสายอาชีพ',
        en: 'Complimentary Soulshots, Blessed Spiritshots, Mana Potions, and full starter buff presets',
      },
      {
        th: 'สถานะ Noblesse สามารถทำได้จากการสังหารบอส Flame of Splendor Barakiel หรือแลกผ่านระบบกิจกรรม',
        en: 'Obtain Noblesse status by defeating Flame of Splendor Barakiel or via in-game event tokens',
      },
    ],
    systems: [
      {
        id: 'autofarm',
        title: { th: 'ระบบ AutoFarm อัจฉริยะ (.autofarm)', en: 'Smart AutoFarm System (.autofarm)' },
        badge: 'Built-in H5',
        details: {
          th: 'รองรับการตั้งค่าระยะค้นหามอนสเตอร์ ลำดับการใช้สกิลโจมตี/บัฟตัวเอง ระบบกันแจมมอนสเตอร์ (Respect Hunt) และหยุดอัตโนมัติเมื่อถูกผู้เล่นอื่นโจมตี (PvP Alert) จำกัด 1 จอต่อเครื่องสำหรับโหมด AutoFarm',
          en: 'Configurable target radius, skill rotation, anti-kill-steal protection, and automatic pause on incoming PvP attacks. Limited to 1 active AutoFarm client per HWID.',
        },
      },
      {
        id: 'autopotion',
        title: { th: 'ระบบ AutoPotion (CP / HP / MP)', en: 'AutoPotion System (CP / HP / MP)' },
        badge: '.apon / .apoff',
        details: {
          th: 'คลิกขวาที่ขวดยา CP, Greater Healing Potion หรือ Mana Potion บนแถบคีย์ลัดเพื่อเปิดใช้งานอัตโนมัติ ตั้งค่าเปอร์เซ็นต์การกดยาได้ละเอียด ไม่กินจังหวะออกสกิล PvP',
          en: 'Right-click CP, HP, or Mana potions on your shortcut bar to toggle automatic consumption with customizable HP/CP/MP thresholds.',
        },
      },
      {
        id: 'pvp-craft',
        title: { th: 'ระบบ PvP Craft & การอัปเกรดอุปกรณ์', en: 'PvP Craft & Gear Progression' },
        badge: 'Play-to-Win',
        details: {
          th: 'สะสมวัตถุดิบจากโซนฟาร์มระดับสูง (LOA / Dragon Valley) เหรียญรางวัลจากกิจกรรม TvT และแต้ม Fame เพื่อนำมาคราฟต์ชุดระดับ Vorpal / Elegia และอาวุธ Top S84 ใน Community Board',
          en: 'Collect materials from high-tier Farm Zones (LOA / Dragon Valley), TvT Event tokens, and Fame points to craft Vorpal / Elegia sets and Top S84 weapons.',
        },
      },
      {
        id: 'community-board',
        title: { th: 'บริการ Community Board (Alt+B)', en: 'Community Board Services (Alt+B)' },
        badge: 'All-in-One',
        details: {
          th: 'รวมศูนย์ระบบ Scheme Buffer (บัฟตัวละครและสัตว์เลี้ยง 2 ชั่วโมง), Gatekeeper วาร์ปด่วนสู่โซนฟาร์มและหน้าห้องบอส, GmShop สำหรับไอเทมจำเป็น, Blacksmith ใส่ SA/เจาะรู/ล้างคำสาป และดูสถิติสดในเกม',
          en: 'Centralized Scheme Buffer (2-hour character & pet buffs), Global Gatekeeper to Farm Zones & Raid Bosses, Essential Shop, Blacksmith (SA/Augment), and Live Rankings.',
        },
      },
      {
        id: 'premium',
        title: { th: 'สิทธิประโยชน์บัญชี Premium (ภายในเกม)', en: 'In-Game Premium Account Benefits' },
        badge: 'Balanced Boost',
        details: {
          th: 'เพิ่มอัตรา EXP/SP +50%, Adena/Drop/Spoil +30% และเพิ่มโอกาสตีบวก/ใส่ธาตุเล็กน้อย (+3%) โดยไม่เพิ่มสเตตัสตัวละคร (ไม่มีไอเทมโกงสเตตัสใน PvP)',
          en: 'Increases EXP/SP +50%, Adena/Drop/Spoil +30%, and grants a minor +3% crafting/enchant bonus with zero character stat inflation in PvP.',
        },
      },
      {
        id: 'clan-pvp',
        title: { th: 'ระบบแคลน สงครามปราสาท และ PvP', en: 'Clan, Castle Siege & PvP Features' },
        badge: 'Competitive',
        details: {
          th: 'สร้างแคลนเริ่มต้นเลเวล 8 ทันที จำกัดสมาชิกพันธมิตรเพื่อป้องกันการผูกขาดเซิร์ฟเวอร์ (Anti-Zerg), ระบบแจ้งเตือน Kill Streak, แต้ม Fame แลกสกิล PvP ขั้นสูง และสงครามชิงปราสาททุกสุดสัปดาห์',
          en: 'Clans start at Level 8. Anti-zerg alliance caps keep sieges competitive. Earn Fame points from PvP & Sieges to unlock PvP weapon enhancements.',
        },
      },
    ],
  },

  farmZones: L2BLITZ_FARM_ZONES,

  /**
   * Downloads Configuration (Strictly no fake download links!)
   */
  downloads: {
    items: [
      {
        id: 'l2blitz-launcher',
        title: {
          th: 'L2Blitz Auto-Updater Launcher (แนะนำ)',
          en: 'L2Blitz Auto-Updater Launcher (Recommended)',
        },
        version: 'v1.0.0-H5 (รอปล่อยไฟล์จริง)',
        size: '~18 MB',
        sha256: 'PENDING_OFFICIAL_BUILD_VERIFICATION',
        url: null, // Strictly null until real file is hosted!
        mirrorUrl: null,
        description: {
          th: 'ตัวติดตั้งและอัปเดตแพตช์อัตโนมัติ วางในโฟลเดอร์เกม Lineage II High Five เพื่อซ่อมแซมไฟล์และเข้าเล่นได้ทันที',
          en: 'Automatic patcher and file repair utility. Place inside your Lineage II High Five client folder.',
        },
      },
      {
        id: 'l2blitz-full-client',
        title: {
          th: 'Lineage II High Five Full Client (ตัวเกมเต็มพร้อมเล่น)',
          en: 'Lineage II High Five Full Client (Pre-Patched)',
        },
        version: 'CT 2.6 High Five Clean + L2Blitz Patch',
        size: '~10.4 GB',
        sha256: 'PENDING_OFFICIAL_BUILD_VERIFICATION',
        url: null, // Strictly null until real file is hosted!
        mirrorUrl: null,
        description: {
          th: 'ไฟล์ตัวเกม Lineage II High Five ฉบับเต็ม แตกไฟล์แล้วเข้าเล่นผ่าน L2Blitz Launcher ได้ทันทีโดยไม่ต้องลงทับเซิร์ฟเวอร์อื่น',
          en: 'Complete standalone Lineage II High Five client archive. Extract and launch directly.',
        },
      },
      {
        id: 'l2blitz-system-patch',
        title: {
          th: 'L2Blitz System & Thai Font Patch (เฉพาะไฟล์แพตช์)',
          en: 'L2Blitz System & Thai Font Patch (Manual Archive)',
        },
        version: 'Patch v1.0',
        size: '~145 MB',
        sha256: 'PENDING_OFFICIAL_BUILD_VERIFICATION',
        url: null, // Strictly null until real file is hosted!
        mirrorUrl: null,
        description: {
          th: 'สำหรับผู้ที่มีตัวเกม High Five อยู่แล้ว และต้องการแตกไฟล์ทับด้วยตนเอง (รวมฟอนต์ภาษาไทยและตารางไอเทม L2Blitz)',
          en: 'Manual patch archive for players who already have a clean Lineage II High Five client installed.',
        },
      },
    ] as DownloadItemConfig[],
    systemRequirements: [
      {
        component: { th: 'ระบบปฏิบัติการ (OS)', en: 'Operating System' },
        minimum: 'Windows 10 (64-bit)',
        recommended: 'Windows 10 / 11 (64-bit)',
      },
      {
        component: { th: 'หน่วยประมวลผล (CPU)', en: 'Processor (CPU)' },
        minimum: 'Intel Core i3 / AMD Ryzen 3 (Dual-Core 3.0GHz+)',
        recommended: 'Intel Core i5 / AMD Ryzen 5 (High Single-Core Clock)',
      },
      {
        component: { th: 'หน่วยความจำ (RAM)', en: 'Memory (RAM)' },
        minimum: '4 GB RAM',
        recommended: '8 GB – 16 GB RAM',
      },
      {
        component: { th: 'กราฟิกการ์ด (GPU)', en: 'Graphics Card' },
        minimum: 'NVIDIA GeForce GT 730 / Radeon R7 (DirectX 9.0c)',
        recommended: 'NVIDIA GTX 1050 Ti / AMD RX 570 ขึ้นไป',
      },
      {
        component: { th: 'พื้นที่จัดเก็บข้อมูล (Storage)', en: 'Storage Space' },
        minimum: 'HDD พื้นที่ว่างอย่างน้อย 25 GB',
        recommended: 'SSD (NVMe / SATA) พื้นที่ว่าง 25 GB เพื่อลดอาการกระตุกเวลาวาร์ปและกิลด์วอร์',
      },
    ],
    troubleshooting: [
      {
        issue: {
          th: 'กดเริ่มเกมแล้วไม่มีหน้าต่างขึ้น หรือถูก Windows Defender บล็อกไฟล์ L2.exe',
          en: 'Game window does not appear or Windows Defender quarantines L2.exe',
        },
        solution: {
          th: 'ให้เพิ่มโฟลเดอร์เกม L2Blitz เข้าไปในรายการยกเว้น (Exclusion) ของ Windows Security > Virus & threat protection จากนั้นเปิด L2Blitz Launcher แล้วกดปุ่ม "ตรวจสอบและซ่อมแซมไฟล์ (Repair)"',
          en: 'Add the L2Blitz game directory to your Windows Security Exclusions list, then run L2Blitz Launcher and click "Check & Repair Files".',
        },
      },
      {
        issue: {
          th: 'พบข้อผิดพลาด DirectX Error หรือ Critical Error (D3DDrv.dll / Option.ini)',
          en: 'DirectX Error or Critical Error (D3DDrv.dll / Option.ini) on startup',
        },
        solution: {
          th: 'ติดตั้ง DirectX End-User Runtimes (June 2010) และลบไฟล์ Option.ini ในโฟลเดอร์ system เพื่อให้ตัวเกมรีเซ็ตความละเอียดหน้าจอใหม่',
          en: 'Install DirectX End-User Runtimes (June 2010) and delete Option.ini inside the system folder to reset display resolution.',
        },
      },
      {
        issue: {
          th: 'ตัวอักษรภาษาไทยในเกมแสดงผลไม่สมบูรณ์หรือเป็นสี่เหลี่ยม',
          en: 'Thai characters appear garbled or as square boxes in chat',
        },
        solution: {
          th: 'ตรวจสอบว่าได้อัปเดตแพตช์ผ่าน L2Blitz Launcher ล่าสุดแล้ว และตั้งค่า Region > Administrative Language ของ Windows ให้รองรับ Thai (Thailand)',
          en: 'Run the L2Blitz Launcher to restore custom font files (L2Font-e.utx) and verify Windows locale settings.',
        },
      },
    ],
  },
};
