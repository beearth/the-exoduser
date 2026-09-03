import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const envText = await readFile(resolve(root, '.env'), 'utf8');
const apiKey = envText.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error('OPENAI_API_KEY is missing from .env');

const common = `
Create one production-ready 2D action-RPG VFX sprite sheet at exactly 1024x1024 pixels.
Layout: exactly four equal 512x512 cells in a clean 2 columns by 2 rows grid. Reading order is top-left, top-right, bottom-left, bottom-right. The four cells are consecutive animation keyframes of one ground-slam impact. Keep the impact center, camera, scale, and perspective identical in every cell. Each effect must be centered inside its own cell with at least 28 pixels of empty transparent padding and must never cross into another cell.
View: orthographic top-down three-quarter game camera, ground-contact effect only, no horizon.
Style: premium dark-fantasy hack-and-slash game VFX, hand-painted semi-realistic sprite, crisp silhouette, dramatic value contrast, dense central impact, readable at gameplay scale, polished production asset.
Animation timing: frame 1 compressed pre-impact ground dent and inward dust; frame 2 violent contact flash and rock crown; frame 3 maximum radial shock burst with airborne debris; frame 4 settling cracked crater and fading particulate.
Technical: transparent alpha background. No colored or black backdrop, no checkerboard, no floor tile, no square panels, no grid lines, no borders, no text, no numbers, no labels, no icons, no UI, no character, no weapon, no watermark, no cropped debris.
`;

const jobs = [
  {
    file: 'giant_slam_impact_sheet.png',
    prompt: `${common}
Subject: GIANT SLAM, a purely physical earth-and-stone impact worthy of a main hero skill. A colossal circular pressure crater punches into the ground. Heavy charcoal and iron-brown rock slabs thrust upward in a crown, bone-gray stone shards and ochre dust blast radially, and a brief pale-gold compression flash marks the exact center. Add strong concentric pressure arcs and long jagged dark fissures. The mass must feel brutally heavy and tectonic, not like a small explosion. Absolutely no fire, no lava, no magic runes, and no lingering glowing orb.`,
  },
  {
    file: 'inferno_slam_impact_sheet.png',
    prompt: `${common}
Subject: INFERNO SLAM, an unmistakably upgraded hellfire fusion main skill. A black obsidian crater splits open from the center into thick branching molten-red fissures. A broad crown of lava sheets and sharp obsidian shards erupts upward, with a white-yellow contact core, saturated orange fire tongues, dark crimson embers, and compact black smoke. Add an expanding circular molten shock front and several tall but contained infernal flame spikes. The hit must feel catastrophic and demonic, clearly stronger and hotter than a normal fire spell. No magic rune circle, no fireball sphere, and no character or hammer.`,
  },
];

const outDir = resolve(root, 'assets', 'vfx');
await mkdir(outDir, { recursive: true });

for (const job of jobs) {
  console.log(`Generating ${job.file} with gpt-image-2 high quality...`);
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt: job.prompt,
      size: '1024x1024',
      quality: 'high',
      background: 'transparent',
      output_format: 'png',
      n: 1,
    }),
    signal: AbortSignal.timeout(600_000),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${body?.error?.message || 'image generation failed'}`);
  const encoded = body?.data?.[0]?.b64_json;
  if (!encoded) throw new Error(`No image payload returned for ${job.file}`);
  await writeFile(resolve(outDir, job.file), Buffer.from(encoded, 'base64'));
  console.log(`Saved assets/vfx/${job.file}`);
}
