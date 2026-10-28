import path from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import sharp from '../frontend/node_modules/sharp/lib/index.js';

const outDir = path.resolve(process.cwd(), 'frontend/public/assets/images');
mkdirSync(outDir, { recursive: true });

const images = [
  {
    name: 'hero-pvp',
    url: 'https://c4.wallpaperflare.com/wallpaper/410/524/49/lineage-ii-loading-screen-video-games-wallpaper-preview.jpg',
    width: 1920,
    height: 1080,
    subject: 'Official Lineage II High Five playable races group composition in front of castle fortress'
  },
  {
    name: 'olympiad-duel',
    url: 'https://c4.wallpaperflare.com/wallpaper/823/261/174/lineage-ii-the-chaotic-throne-kamael-and-hellbound-wallpaper-preview.jpg',
    width: 1600,
    height: 1200,
    subject: 'Lineage II Kamael Soul Hound and duelists preparing for combat arena'
  },
  {
    name: 'raid-bosses',
    url: 'https://c4.wallpaperflare.com/wallpaper/272/676/41/lineage-ii-antharas-wallpaper-preview.jpg',
    width: 1600,
    height: 1200,
    subject: 'Lineage II Legendary Land Dragon Antharas and High Five Raid Bosses'
  },
  {
    name: 'farm-zone',
    url: 'https://c4.wallpaperflare.com/wallpaper/573/398/505/dragon-figure-the-volcano-lineage-2-wallpaper-preview.jpg',
    width: 1920,
    height: 1080,
    subject: 'Lineage II Dragon Valley and Lair of Antharas High Five farming canyon'
  },
  {
    name: 'server-features',
    url: 'https://c4.wallpaperflare.com/wallpaper/559/722/521/dark-elves-lineage-wallpaper-preview.jpg',
    width: 1600,
    height: 1200,
    subject: 'Lineage II Dark Elf in high-tier armor with glowing weapons and S-grade equipment'
  },
  {
    name: 'events-tvt',
    url: 'https://c4.wallpaperflare.com/wallpaper/311/785/94/lineage-2-game-wallpaper-preview.jpg',
    width: 1920,
    height: 1080,
    subject: 'Lineage II Colosseum PvP team combat and mass faction warfare'
  }
];

async function run() {
  console.log('[Assets Pipeline] Fetching authentic Lineage II game character artworks...');
  for (const img of images) {
    console.log(`Processing ${img.name}...`);
    const res = await fetch(img.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`Failed to fetch ${img.url}: ${res.status}`);
    const inputBuf = Buffer.from(await res.arrayBuffer());

    // Process to exact required aspect ratio and dimensions with high quality
    const pipeline = sharp(inputBuf)
      .resize(img.width, img.height, {
        fit: 'cover',
        position: 'center'
      });

    const webpBuffer = await pipeline.clone().webp({ quality: 90 }).toBuffer();
    const pngBuffer = await pipeline.clone().png({ compressionLevel: 8 }).toBuffer();

    const webpPath = path.join(outDir, `${img.name}.webp`);
    const pngPath = path.join(outDir, `${img.name}.png`);

    writeFileSync(webpPath, webpBuffer);
    writeFileSync(pngPath, pngBuffer);

    console.log(`✓ Saved ${img.name}.webp (${webpBuffer.length} bytes) and ${img.name}.png (${pngBuffer.length} bytes)`);
  }
  console.log('[Assets Pipeline] All 6 authentic game character images successfully processed.');
}

run().catch((err) => {
  console.error('[Assets Pipeline Error]', err);
  process.exit(1);
});
