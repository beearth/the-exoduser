import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const XAI_API_KEY = 'xai-MronxcFFMDrW9jM8ja476U7t5062FIOuI3KA680LJAowsENqcl8s0exYSAER7dT8E8R6PORuqM6TV8iQ';
const XAI_IMAGE_ENDPOINT = 'https://api.x.ai/v1/images/generations';
const MODEL = 'grok-imagine-image';
const OUT_DIR = resolve('G:/hell/docs/최종기획서/images');

const IMAGES = [
  {
    name: '01_keyart.png',
    aspect: '16:9',
    prompt: 'Dark fantasy game key art. A lone armored warrior stands at the edge of a hellish abyss, looking down into the burning depths. Behind him, twisted organic architecture of hell rises into a blood-red sky. Bioluminescent particles float in the air. The warrior wears a medieval helmet, cape, and greatsword on his back. Dramatic Caravaggio-style lighting — extreme contrast between deep shadows and glowing embers. Top-down 2D game promotional art style. Epic scale, painterly quality. No text, no logo, no watermark.'
  },
  {
    name: '02_protagonist.png',
    aspect: '3:4',
    prompt: 'Dark fantasy character concept art. A battle-scarred medieval warrior, full body view. He wears a dented iron helmet with a narrow visor, a tattered dark cape, and heavy plate armor with scorch marks. He carries a massive greatsword. His posture is weary but resolute — a man who has lost everything but still fights. Caravaggio chiaroscuro lighting, dark background with subtle ember particles. Berserk manga meets FromSoftware aesthetic. Painterly digital art style. No text, no logo.'
  },
  {
    name: '03_goddess.png',
    aspect: '3:4',
    prompt: 'Dark fantasy character concept art. The Goddess of Vengeance — a beautiful but terrifying divine being. She has pale luminous skin, long flowing white hair with crimson streaks, and eyes that glow like molten gold. She wears an ornate dark robe with thorned patterns. Ghostly red chains float around her. Her expression is alluring yet calculating — she is a political mastermind disguised as a benefactor. Dark ethereal background with floating blood-red particles. Painterly style, dramatic lighting. No text, no logo.'
  },
  {
    name: '04_monsters.png',
    aspect: '16:9',
    prompt: 'Dark fantasy monster concept art sheet. Multiple grotesque creatures inspired by Berserk apostles — NOT typical fantasy monsters. Designs include: a mass of human eyes growing from a fleshy blob that shoots projectiles, a creature whose mouth splits its entire torso open to bite, a humanoid whose arms have transformed into blade-like appendages, and a giant made of fused screaming human bodies. All retain disturbing traces of their human origin. Body horror aesthetic. Dark background, dramatic lighting. Concept art layout. No text, no logo.'
  },
  {
    name: '05_world.png',
    aspect: '16:9',
    prompt: 'Dark fantasy environment concept art. A beautiful yet horrifying hellscape — bioluminescent plants glow in ethereal blues and purples against total darkness, like Ori and the Blind Forest but in hell. Organic architecture made of bone and sinew rises from pools of glowing liquid. Tiny firefly-like particles drift through the air. The contrast between serene beauty and grotesque organic structures creates a "cruel fairy tale" atmosphere. Top-down 2D game perspective. Painterly watercolor style with deep shadows. No text, no logo.'
  },
  {
    name: '06_bullet_parry.png',
    aspect: '16:9',
    prompt: 'Dark fantasy game action screenshot concept. A small armored warrior in top-down view is surrounded by dozens of glowing projectiles — red orbs and rainbow-colored orbs flying in bullet hell patterns. The warrior is mid-parry, deflecting a red orb which explodes into blue homing missiles. Dramatic slow-motion effect with motion blur on projectiles. Screen is dark with intense particle effects — embers, sparks, light trails. Touhou meets Dark Souls aesthetic. Dynamic action composition. No text, no UI elements.'
  },
  {
    name: '07_chain_drive.png',
    aspect: '16:9',
    prompt: 'Dark fantasy game action concept. A warrior fires a grappling chain/harpoon that embeds into a wall, then gets pulled toward it at high speed — leaving a trail of fire and light behind him. He passes through several grotesque monsters, dealing damage as he flies through them. Motion lines, impact sparks, and afterimage effects show extreme speed. Dark environment with the chain and trail being the main light source. Top-down 2D action game perspective. Dynamic, explosive composition. No text.'
  },
  {
    name: '08_boss.png',
    aspect: '16:9',
    prompt: 'Dark fantasy boss battle concept art. A massive grotesque creature fills the screen — it was once human but has transformed into a towering mass of flesh, eyes, and mouths. Multiple phases are suggested: the creature is partially shedding its outer shell to reveal an even more horrifying true form beneath. A tiny armored warrior stands before it, dwarfed by the boss. The arena is a circular platform surrounded by an abyss. Dramatic rim lighting from below. Berserk eclipse scene atmosphere. Painterly style. No text, no logo.'
  }
];

async function generateImage(img) {
  console.log(`Generating: ${img.name}...`);
  const body = {
    model: MODEL,
    prompt: img.prompt,
    n: 1,
    aspect_ratio: img.aspect,
    resolution: '2k',
    response_format: 'b64_json'
  };

  const response = await fetch(XAI_IMAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`FAILED ${img.name}: ${response.status} ${text.slice(0, 200)}`);
    return null;
  }

  const json = await response.json();
  const item = json?.data?.[0];
  if (!item?.b64_json) {
    console.error(`No image data for ${img.name}`);
    return null;
  }

  const outPath = resolve(OUT_DIR, img.name);
  await writeFile(outPath, Buffer.from(item.b64_json, 'base64'));
  console.log(`Saved: ${outPath}`);
  return outPath;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Generate in batches of 2 to avoid rate limits
  for (let i = 0; i < IMAGES.length; i += 2) {
    const batch = IMAGES.slice(i, i + 2);
    const results = await Promise.all(batch.map(generateImage));
    console.log(`Batch ${Math.floor(i/2)+1} done: ${results.filter(Boolean).length}/${batch.length} success`);
  }

  console.log('All images generated.');
}

main().catch(e => { console.error(e); process.exit(1); });
