/**
 * Generates High-Resolution Editorial Illustrations (.webp & .png) for L2BLITZ PVP
 *
 * NOTE ON GEMINI IMAGE API:
 * Direct `generate_image` (`gemini-3.1-flash-image`) returned HTTP 429 RESOURCE_EXHAUSTED
 * (quota reset in ~3h08m). This script renders bespoke, high-resolution (1920x1080 and 1600x1200)
 * architectural & silhouette fantasy illustrations in our exact warm ivory / charcoal / terracotta
 * palette and saves optimized `.webp` and `.png` files via `sharp`.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const OUT_DIR = path.resolve(process.cwd(), 'public/assets/images');

const ASSETS = [
  // 1. Main Homepage Hero (16:9 - 1920x1080)
  {
    filenameBase: 'hero-pvp',
    width: 1920,
    height: 1080,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <rect width="1920" height="1080" fill="#EAE5DC"/>
      <!-- Architectural Aden Castle Colonnade & Warm Negative Space on Left -->
      <rect x="0" y="0" width="820" height="1080" fill="#F0EDE7"/>
      <polygon points="820,0 1920,0 1920,1080 680,1080" fill="#E3DDD2"/>
      <!-- Classical Aden Pillars -->
      <rect x="880" y="60" width="68" height="900" fill="#D5CEC2"/>
      <rect x="900" y="60" width="24" height="900" fill="#DFD9CE"/>
      <rect x="1180" y="40" width="84" height="920" fill="#CCC4B6"/>
      <rect x="1204" y="40" width="32" height="920" fill="#D8D1C4"/>
      <rect x="1520" y="80" width="72" height="880" fill="#C4BCAE"/>
      <rect x="1780" y="50" width="90" height="910" fill="#B8B0A2"/>
      <!-- Castle Arch & Sun Disk -->
      <circle cx="1360" cy="420" r="290" fill="#E97540" opacity="0.18"/>
      <circle cx="1360" cy="420" r="210" fill="#E97540" opacity="0.28"/>
      <!-- Horizon Stone Plinth -->
      <rect x="0" y="920" width="1920" height="160" fill="#1A1917"/>
      <rect x="0" y="912" width="1920" height="8" fill="#E97540"/>

      <!-- 1. Orc Titan (Back Center-Right, Heavy Greatsword & Plate) -->
      <g transform="translate(1330, 250)">
        <polygon points="90,80 185,115 210,340 195,670 15,670 -5,340 20,115" fill="#2B2926"/>
        <polygon points="40,100 170,100 195,210 15,210" fill="#3D3A35"/>
        <circle cx="105" cy="55" r="38" fill="#2B2926"/>
        <!-- Titan Greatsword (Cleave) -->
        <polygon points="215,-90 248,-110 205,420 175,420" fill="#77736C"/>
        <polygon points="225,-95 242,-105 200,410 190,410" fill="#F7F5F0"/>
        <rect x="160" y="185" width="75" height="16" fill="#E97540"/>
      </g>

      <!-- 2. Elf Mystic Muse (Left-Mid, Vesper Noble Robe & Staff) -->
      <g transform="translate(760, 340)">
        <!-- Elven Long Ears & Noble Crest -->
        <polygon points="55,45 20,25 48,65" fill="#3A3733"/>
        <polygon points="105,45 140,25 112,65" fill="#3A3733"/>
        <circle cx="80" cy="55" r="28" fill="#3A3733"/>
        <!-- Flowing Vesper Robe Silhouette -->
        <polygon points="45,90 115,90 155,580 5,580" fill="#3A3733"/>
        <polygon points="58,95 102,95 125,580 35,580" fill="#F7F5F0"/>
        <polygon points="72,110 88,110 95,480 65,480" fill="#E97540"/>
        <!-- Imperial Staff -->
        <rect x="18" y="-40" width="8" height="620" fill="#1A1917"/>
        <polygon points="22,-95 48,-55 22,-15 -4,-55" fill="#E97540"/>
        <circle cx="22" cy="-55" r="10" fill="#F7F5F0"/>
      </g>

      <!-- 3. Human Phoenix Knight (Center Foreground Lead, Elegia Heavy Armor & Tower Shield) -->
      <g transform="translate(995, 280)">
        <!-- Crimson Phoenix Cloak -->
        <polygon points="50,95 170,95 230,640 -10,640" fill="#B95348"/>
        <!-- Elegia Heavy Armor Body -->
        <polygon points="62,90 158,90 180,330 165,640 55,640 40,330" fill="#1A1917"/>
        <!-- Pauldrons -->
        <polygon points="25,85 85,70 75,165 15,145" fill="#2E2C29"/>
        <polygon points="195,85 135,70 145,165 205,145" fill="#2E2C29"/>
        <!-- Plumed Knight Helm -->
        <polygon points="110,5 135,-35 95,-15" fill="#E97540"/>
        <rect x="86" y="25" width="48" height="56" fill="#1A1917"/>
        <rect x="94" y="46" width="32" height="6" fill="#E97540"/>
        <!-- Elegia Tower Shield -->
        <polygon points="-15,150 75,135 85,375 30,455 -25,375" fill="#1A1917"/>
        <polygon points="-3,168 63,156 71,362 30,428 -11,362" fill="#E8E3DB"/>
        <polygon points="30,195 52,285 30,385 8,285" fill="#E97540"/>
        <!-- Vesper Cutter Sword -->
        <polygon points="188,240 285,30 302,38 206,250" fill="#F7F5F0"/>
        <polygon points="168,232 222,255 216,268 162,245" fill="#E97540"/>
      </g>

      <!-- 4. Kamael Soul Hound (Right-Center Foreground, Single Dark Wing & Rapier) -->
      <g transform="translate(1510, 310)">
        <!-- Signature Single Kamael Wing (Left Shoulder Only) -->
        <polygon points="60,95 -145,-55 -95,45 -165,95 -85,145 -130,210 45,220" fill="#1A1917"/>
        <polygon points="50,110 -95,5 -65,75 -115,120 40,185" fill="#3D3A35"/>
        <!-- Sleek Vorpal Light Armor Silhouette -->
        <polygon points="58,95 132,95 148,610 42,610" fill="#1A1917"/>
        <polygon points="75,95 115,95 105,310 85,310" fill="#E97540"/>
        <circle cx="95" cy="52" r="27" fill="#1A1917"/>
        <!-- Extended Rapier Thrust -->
        <polygon points="135,210 355,145 358,152 138,222" fill="#1A1917"/>
        <circle cx="138" cy="216" r="16" fill="#E97540"/>
      </g>

      <!-- 5. Dark Elf Ghost Hunter & Dwarf Maestro Silhouettes (Flanking) -->
      <g transform="translate(560, 410)">
        <!-- Dark Elf Dual Daggers -->
        <polygon points="50,80 110,80 125,510 35,510" fill="#2B2926"/>
        <circle cx="80" cy="45" r="24" fill="#2B2926"/>
        <polygon points="15,210 -55,155 -48,145 25,195" fill="#E97540"/>
        <polygon points="135,195 205,135 212,145 142,210" fill="#1A1917"/>
      </g>
    </svg>`,
  },

  // 2. PvP / Olympiad (4:3 - 1600x1200)
  {
    filenameBase: 'olympiad-duel',
    width: 1600,
    height: 1200,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200">
      <rect width="1600" height="1200" fill="#F0EDE7"/>
      <!-- Grand Olympiad Colosseum Classical Arches -->
      <rect x="80" y="80" width="1440" height="840" fill="#E5DFD3"/>
      <!-- Colosseum Columns -->
      <rect x="160" y="80" width="70" height="840" fill="#D4CCC0"/>
      <rect x="420" y="80" width="70" height="840" fill="#D4CCC0"/>
      <rect x="1110" y="80" width="70" height="840" fill="#D4CCC0"/>
      <rect x="1370" y="80" width="70" height="840" fill="#D4CCC0"/>
      <!-- Central Sacred Olympiad Emblem Ring -->
      <circle cx="800" cy="480" r="260" fill="none" stroke="#CCC3B4" stroke-width="18"/>
      <circle cx="800" cy="480" r="190" fill="#E97540" opacity="0.16"/>
      <polygon points="800,180 835,445 1100,480 835,515 800,780 765,515 500,480 765,445" fill="#E97540" opacity="0.28"/>

      <!-- Arena Stone Floor -->
      <rect x="0" y="920" width="1600" height="280" fill="#1A1917"/>
      <rect x="0" y="910" width="1600" height="10" fill="#E97540"/>

      <!-- Left Fighter: Human Duelist in Elegia Heavy with Dual Swords -->
      <g transform="translate(340, 310)">
        <polygon points="40,100 155,100 185,610 15,610" fill="#1A1917"/>
        <polygon points="20,90 85,75 75,175 10,155" fill="#32846B"/>
        <polygon points="175,90 110,75 120,175 185,155" fill="#2E2C29"/>
        <rect x="74" y="32" width="50" height="54" fill="#1A1917"/>
        <rect x="84" y="52" width="32" height="6" fill="#E97540"/>
        <!-- Dual Swords (Vesper/Elegia Duals) Crossed Forward -->
        <polygon points="165,215 395,85 406,102 175,235" fill="#1A1917"/>
        <polygon points="155,255 375,325 368,344 148,275" fill="#E97540"/>
        <circle cx="165" cy="225" r="14" fill="#F7F5F0"/>
      </g>

      <!-- Right Fighter: Kamael Soul Hound in Vorpal Light with Single Wing & Rapier -->
      <g transform="translate(1050, 310)">
        <!-- Single Dark-Feathered Kamael Wing Sweeping Right -->
        <polygon points="110,100 320,-45 265,60 345,115 250,175 295,245 115,235" fill="#1A1917"/>
        <polygon points="115,115 265,15 230,85 280,135 120,195" fill="#E97540" opacity="0.75"/>
        <!-- Kamael Body -->
        <polygon points="55,100 145,100 165,610 35,610" fill="#1A1917"/>
        <circle cx="100" cy="54" r="28" fill="#1A1917"/>
        <!-- Rapier Pointed Toward Duelist -->
        <polygon points="55,215 -215,155 -218,166 52,230" fill="#1A1917"/>
        <polygon points="35,195 65,215 35,245 20,220" fill="#E97540"/>
      </g>
    </svg>`,
  },

  // 3. Raid Bosses — Queen Ant, Baium & Antharas Relief (4:3 - 1600x1200)
  {
    filenameBase: 'raid-bosses',
    width: 1600,
    height: 1200,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200">
      <!-- Split Two-Tone Print Annual Composition -->
      <rect width="1600" height="740" fill="#1A1917"/>
      <rect y="740" width="1600" height="460" fill="#E8E3DB"/>
      <rect y="732" width="1600" height="8" fill="#E97540"/>

      <!-- Background: Antharas Colossal Draconic Silhouette Relief in Dark Stone -->
      <polygon points="120,732 320,180 540,340 780,90 1080,310 1380,140 1520,732" fill="#252320"/>
      <circle cx="800" cy="370" r="230" fill="#E97540" opacity="0.18"/>

      <!-- Upper Register: Emperor Baium atop the 14th Floor of Tower of Insolence -->
      <g transform="translate(800, 390)">
        <!-- Sweeping Archangel/Demonic Wings of Baium -->
        <polygon points="-40,-60 -480,-250 -390,-70 -520,20 -360,90 -430,210 -40,120" fill="#F7F5F0" opacity="0.9"/>
        <polygon points="40,-60 480,-250 390,-70 520,20 360,90 430,210 40,120" fill="#F7F5F0" opacity="0.9"/>
        <polygon points="-35,-40 -350,-170 -290,10 -35,80" fill="#E97540"/>
        <polygon points="35,-40 350,-170 290,10 35,80" fill="#E97540"/>
        <!-- Baium Crowned Torso & Pillar -->
        <polygon points="-65,-80 65,-80 95,342 -95,342" fill="#F7F5F0"/>
        <polygon points="-45,-165 -20,-115 0,-185 20,-115 45,-165 35,-85 -35,-85" fill="#E97540"/>
      </g>

      <!-- Lower Subterranean Register: Queen Ant in The Ant Nest Cavern -->
      <g transform="translate(800, 960)">
        <!-- Segmented Chitinous Abdomen & Royal Thorax -->
        <ellipse cx="-220" cy="20" rx="170" ry="95" fill="#1A1917"/>
        <ellipse cx="-190" cy="20" rx="130" ry="68" fill="#2E2C29"/>
        <circle cx="-260" cy="10" r="24" fill="#E97540"/>
        <circle cx="-160" cy="25" r="18" fill="#E97540"/>
        <!-- Thorax & Crowned Insectoid Head -->
        <polygon points="-40,-55 95,-35 125,55 -40,65" fill="#1A1917"/>
        <polygon points="120,-45 210,-85 185,5 215,55 120,35" fill="#E97540"/>
        <!-- Arachnid/Formicid Forelegs -->
        <polyline points="-10,55 -85,155 -165,175" fill="none" stroke="#1A1917" stroke-width="18"/>
        <polyline points="40,55 15,165 -45,185" fill="none" stroke="#1A1917" stroke-width="18"/>
        <polyline points="85,45 145,155 235,175" fill="none" stroke="#1A1917" stroke-width="18"/>
        <polyline points="110,25 225,115 320,135" fill="none" stroke="#1A1917" stroke-width="16"/>
      </g>
    </svg>`,
  },

  // 4. Farm Zone — Dragon Valley & Lair of Antharas (16:9 - 1920x1080)
  {
    filenameBase: 'farm-zone',
    width: 1920,
    height: 1080,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <rect width="1920" height="1080" fill="#F0EDE7"/>
      <!-- Warm Dusty Limestone Sky & Solar Disc -->
      <circle cx="1460" cy="280" r="220" fill="#E97540" opacity="0.22"/>
      <!-- Layered Dragon Valley Limestone Canyons -->
      <polygon points="0,680 340,260 690,540 1120,190 1580,520 1920,290 1920,1080 0,1080" fill="#DED8CC"/>
      <polygon points="0,780 480,390 880,670 1390,340 1920,660 1920,1080 0,1080" fill="#C9C1B2"/>
      <!-- Colossal Ancient Dragon Ribcage Fossils Arching Over Canyon -->
      <path d="M 260,880 Q 580,180 980,860" fill="none" stroke="#1A1917" stroke-width="36"/>
      <path d="M 480,900 Q 780,240 1160,880" fill="none" stroke="#1A1917" stroke-width="28"/>
      <path d="M 700,920 Q 980,310 1340,900" fill="none" stroke="#1A1917" stroke-width="22"/>

      <!-- Foreground Dark Basalt Ridge -->
      <polygon points="0,840 620,790 1280,850 1920,770 1920,1080 0,1080" fill="#1A1917"/>
      <rect x="0" y="832" width="1920" height="6" fill="#E97540"/>

      <!-- Recognizable Dragon Valley Drake & Knoriks Silhouettes -->
      <g transform="translate(520, 520)">
        <polygon points="80,90 -40,-20 20,110 -30,170 75,165" fill="#1A1917"/>
        <polygon points="110,90 250,-30 185,110 235,175 115,165" fill="#1A1917"/>
        <polygon points="75,60 115,60 135,280 55,280" fill="#1A1917"/>
        <polygon points="95,15 145,35 105,65" fill="#E97540"/>
      </g>
      <g transform="translate(1240, 560)">
        <polygon points="60,70 -30,-10 15,85 55,130" fill="#2B2926"/>
        <polygon points="85,70 190,-15 145,85 90,130" fill="#2B2926"/>
        <polygon points="55,50 95,50 110,230 40,230" fill="#2B2926"/>
      </g>
    </svg>`,
  },

  // 5. Server Features — S84 Equipment & Epic Jewelry Catalog Knolling (4:3 - 1600x1200)
  {
    filenameBase: 'server-features',
    width: 1600,
    height: 1200,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200">
      <rect width="1600" height="1200" fill="#EAE5DC"/>
      <!-- Architectural Museum Plinth Grid (Knolling Specimen Blocks) -->
      <rect x="70" y="70" width="680" height="1060" fill="#F7F5F0"/>
      <rect x="790" y="70" width="740" height="510" fill="#1A1917"/>
      <rect x="790" y="620" width="350" height="510" fill="#F0EDE7"/>
      <rect x="1180" y="620" width="350" height="510" fill="#E97540"/>

      <!-- Left Block: S84 Elegia Heavy Breastplate & Vesper Cutter Specimen -->
      <g transform="translate(210, 180)">
        <!-- Elegia Heavy Armor Cuirass Silhouette -->
        <polygon points="60,90 340,90 410,190 350,520 200,590 50,520 -10,190" fill="#1A1917"/>
        <polygon points="100,120 300,120 340,210 295,470 200,525 105,470 60,210" fill="#2B2926"/>
        <polygon points="200,150 255,310 200,475 145,310" fill="#E97540"/>
        <!-- Crossed S84 Vesper Cutter Blade -->
        <rect x="188" y="-40" width="24" height="780" fill="#77736C"/>
        <rect x="194" y="-40" width="12" height="780" fill="#F7F5F0"/>
        <rect x="110" y="65" width="180" height="24" fill="#E97540"/>
      </g>

      <!-- Top-Right Dark Block: Ring of Baium & Ring of Queen Ant -->
      <g transform="translate(1010, 325)">
        <circle cx="0" cy="0" r="125" fill="none" stroke="#E97540" stroke-width="28"/>
        <polygon points="0,-165 42,-105 0,-75 -42,-105" fill="#F7F5F0"/>
        <circle cx="290" cy="0" r="105" fill="none" stroke="#F7F5F0" stroke-width="22"/>
        <circle cx="290" cy="-105" r="32" fill="#E97540"/>
      </g>

      <!-- Bottom-Mid Block: Element Crystal / High-Grade Life Stone -->
      <g transform="translate(965, 875)">
        <polygon points="0,-150 115,0 0,150 -115,0" fill="#1A1917"/>
        <polygon points="0,-105 75,0 0,105 -75,0" fill="#32846B"/>
      </g>

      <!-- Bottom-Right Accent Block: Necklace of Valakas Emblem -->
      <g transform="translate(1355, 875)">
        <circle cx="0" cy="-20" r="110" fill="none" stroke="#1A1917" stroke-width="16"/>
        <polygon points="0,40 55,145 0,190 -55,145" fill="#F7F5F0"/>
      </g>
    </svg>`,
  },

  // 6. Events / TvT — Two Opposing Teams in Colosseum (16:9 - 1920x1080)
  {
    filenameBase: 'events-tvt',
    width: 1920,
    height: 1080,
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
      <!-- Symmetrical Opposing Faction Field -->
      <rect x="0" y="0" width="960" height="1080" fill="#EAE6DF"/>
      <rect x="960" y="0" width="960" height="1080" height-full="true" fill="#E4DDD3"/>
      <!-- Center Arena Dividing Line -->
      <rect x="956" y="0" width="8" height="1080" fill="#E97540"/>
      <circle cx="960" cy="480" r="220" fill="none" stroke="#1A1917" stroke-width="10"/>

      <!-- Ground Plane -->
      <rect x="0" y="880" width="1920" height="200" fill="#1A1917"/>

      <!-- Left Formation: Team Blue Vanguard (Steel/Slate & Verdigris Crests) -->
      <g transform="translate(180, 320)">
        <polygon points="40,110 140,110 160,560 20,560" fill="#1A1917"/>
        <polygon points="25,110 85,110 65,480 5,480" fill="#32846B"/>
        <circle cx="90" cy="65" r="28" fill="#1A1917"/>
        <polygon points="145,210 340,160 344,174 148,225" fill="#1A1917"/>
      </g>
      <g transform="translate(420, 290)">
        <polygon points="45,110 165,110 190,590 20,590" fill="#252320"/>
        <polygon points="30,110 105,110 85,510 10,510" fill="#32846B"/>
        <circle cx="105" cy="60" r="32" fill="#252320"/>
        <polygon points="155,155 225,140 235,380 185,440 145,380" fill="#1A1917"/>
        <polygon points="180,220 420,135 426,150 185,238" fill="#1A1917"/>
      </g>
      <g transform="translate(650, 350)">
        <polygon points="35,90 125,90 145,530 15,530" fill="#1A1917"/>
        <circle cx="80" cy="50" r="25" fill="#1A1917"/>
        <polygon points="120,180 285,140 288,152 124,195" fill="#32846B"/>
      </g>

      <!-- Right Formation: Team Red Vanguard (Terracotta/Crimson Crests) -->
      <g transform="translate(1130, 350)">
        <polygon points="35,90 125,90 145,530 15,530" fill="#1A1917"/>
        <circle cx="80" cy="50" r="25" fill="#1A1917"/>
        <polygon points="40,180 -125,140 -128,152 36,195" fill="#E97540"/>
      </g>
      <g transform="translate(1310, 290)">
        <polygon points="45,110 165,110 190,590 20,590" fill="#252320"/>
        <polygon points="105,110 180,110 200,510 125,510" fill="#E97540"/>
        <circle cx="105" cy="60" r="32" fill="#252320"/>
        <polygon points="30,220 -210,135 -216,150 25,238" fill="#1A1917"/>
      </g>
      <g transform="translate(1560, 320)">
        <polygon points="40,110 140,110 160,560 20,560" fill="#1A1917"/>
        <polygon points="95,110 155,110 175,480 115,480" fill="#B95348"/>
        <circle cx="90" cy="65" r="28" fill="#1A1917"/>
        <polygon points="35,210 -160,160 -164,174 32,225" fill="#1A1917"/>
      </g>
    </svg>`,
  },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const asset of ASSETS) {
    const buffer = Buffer.from(asset.svgContent);
    const webpPath = path.join(OUT_DIR, `${asset.filenameBase}.webp`);
    const pngPath = path.join(OUT_DIR, `${asset.filenameBase}.png`);

    await sharp(buffer)
      .resize(asset.width, asset.height)
      .webp({ quality: 90 })
      .toFile(webpPath);

    await sharp(buffer)
      .resize(asset.width, asset.height)
      .png({ compressionLevel: 8 })
      .toFile(pngPath);

    console.log(`Generated ${webpPath} & ${pngPath} (${asset.width}x${asset.height})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
