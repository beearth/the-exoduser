#!/usr/bin/env node
/**
 * CH1 map-kit prototype generator via xAI Imagine API.
 * QA/DRAFT only. Never overwrites production assets. Never logs the API key.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadWorkspaceEnv } from '../src/workspaceEnv.js';

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(THIS_FILE), '..');
const API_BASE = 'https://api.x.ai/v1';
const DEFAULT_MODEL = 'grok-imagine-image-2.0';
const DEFAULT_OUT = path.join(ROOT, 'assets', 'map', 'ch1', '_grok_qa');
const MAX_OUTPUTS = 8;
const MAX_RETRIES = 2;

const PRESETS = {
  'ch1-crack': {
    dir: 'crack',
    prefix: 'crack_v',
    aspect: '1:1',
    prompt: `Use the supplied dark-soil game ground texture as the exact visual reference.

Create a top-down dark fantasy ARPG ground texture variation.

Preserve:
- identical soil color family
- identical stone scale
- identical camera perspective
- identical lighting direction
- identical texture density

Add only:
- sparse natural cracked-earth formations
- subtle dried fissures
- a few dark corrupted hairline cracks

The cracks must be irregular and organic.

Do NOT add:
- objects
- bones
- trees
- roots
- grass
- blood pools
- symbols
- runes
- glowing lava
- characters
- shadows from tall objects

This is PLAYABLE COMBAT GROUND.

Keep visual contrast low enough that:
characters, enemies, projectiles, loot and skill VFX remain clearly readable.

No vignette.
No border.
No frame.
No text.
No obvious central focal point.
No artificial symmetry.`,
  },
  'ch1-root-edge': {
    dir: 'root_edge',
    prefix: 'root_edge_v',
    aspect: '1:1',
    prompt: `Use the supplied CH1 dark-soil ground texture as the exact environmental reference.

Create a top-down ARPG terrain boundary asset.

The center/one side remains the same playable dark soil.

Along the outer side, add:
- tangled dead black roots
- rotten thick roots
- subtle hell corruption
- occasional muted dark-red fissure inside the roots

The roots should form a LOW terrain boundary.

Important:
- not a giant tree
- not a wall viewed from the side
- not a cinematic illustration
- no tall canopy
- no huge vertical silhouette

It must visually belong to the Rotten Forest.

Keep the playable side clean.

No skull mountain.
No giant bones.
No flesh mass.
No magic circle.
No glowing neon.
No character.
No text.
No vignette.

The transition from ground to roots must be organic and usable repeatedly
along the perimeter of a large ARPG combat area.`,
  },
};

function argVal(argv, flag) {
  const i = argv.indexOf(flag);
  if (i < 0) return null;
  const v = argv[i + 1];
  if (!v || v.startsWith('--')) throw new Error(`${flag} requires a value`);
  return v;
}
function hasFlag(argv, flag) { return argv.includes(flag); }

function die(msg, code = 1) {
  console.error('[grok-map-gen]', msg);
  process.exit(code);
}

async function getKey() {
  await loadWorkspaceEnv({ rootDir: ROOT }).catch(() => {});
  const k = process.env.XAI_API_KEY;
  if (!k || !String(k).trim()) die('XAI_API_KEY missing. Set the env var. Do not paste keys into files.');
  return String(k).trim();
}

async function apiJson(key, method, urlPath, body, { retry = MAX_RETRIES } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      const res = await fetch(API_BASE + urlPath, {
        method,
        headers: {
          Authorization: `Bearer ${key}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        if (attempt < retry) {
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
      return JSON.parse(text);
    } catch (e) {
      lastErr = e;
      const net = e?.cause?.code || e?.code || '';
      const retryable = /ECONNRESET|ETIMEDOUT|ENOTFOUND|UND_ERR|fetch failed/i.test(String(e.message) + net);
      if (retryable && attempt < retry) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

async function listImageModels(key) {
  const j = await apiJson(key, 'GET', '/models', null, { retry: 1 });
  const ids = (j.data || []).map((m) => m.id).filter(Boolean);
  return ids.filter((id) => /imagine-image/i.test(id) && !/video/i.test(id));
}

function pickLatestImagine(ids) {
  if (ids.includes('grok-imagine-image-2.0')) return 'grok-imagine-image-2.0';
  if (ids.includes('grok-imagine-image-quality')) return 'grok-imagine-image-quality';
  if (ids.includes('grok-imagine-image')) return 'grok-imagine-image';
  return ids.sort().at(-1) || DEFAULT_MODEL;
}

function mimeOf(p) {
  const e = path.extname(p).toLowerCase();
  if (e === '.jpg' || e === '.jpeg') return 'image/jpeg';
  if (e === '.webp') return 'image/webp';
  return 'image/png';
}

async function refDataUri(refPath) {
  const abs = path.resolve(ROOT, refPath);
  const buf = await readFile(abs);
  return `data:${mimeOf(abs)};base64,${buf.toString('base64')}`;
}

function parseImagePayload(j) {
  const data = j.data || j.images || (j.url ? [j] : []);
  if (!Array.isArray(data) || !data.length) {
    throw new Error('API returned no images: ' + JSON.stringify(Object.keys(j)));
  }
  return data.map((item) => ({
    url: item.url || item.image_url || item?.image?.url,
    b64: item.b64_json || item.b64 || item.base64,
    model: item.model || j.model,
  }));
}

async function downloadOne(item, dest) {
  if (item.b64) {
    await writeFile(dest, Buffer.from(item.b64, 'base64'));
    return;
  }
  if (!item.url) throw new Error('image has neither url nor b64');
  const res = await fetch(item.url);
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

function sniff(buf) {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50) return { format: 'png', ok: true };
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8) return { format: 'jpg', ok: true };
  if (buf.length >= 12 && buf.slice(0, 4).toString() === 'RIFF') return { format: 'webp', ok: true };
  return { format: 'unknown', ok: false };
}

function pngSize(buf) {
  if (buf.length < 24 || buf[0] !== 0x89) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function jpgSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) break;
    const m = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (m === 0xc0 || m === 0xc1 || m === 0xc2) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function nextIndex(existingNames, prefix) {
  let n = 1;
  while (existingNames.has(`${prefix}${String(n).padStart(2, '0')}`)) n++;
  return n;
}

async function generatePreset({ key, model, resolution, presetName, reference, count, outRoot, budget }) {
  const preset = PRESETS[presetName];
  if (!preset) die(`unknown preset ${presetName}. ` + Object.keys(PRESETS).join(', '));
  const n = Math.min(count, budget.left);
  if (n <= 0) die('output budget exhausted (max 8 images this experiment)');
  const dir = path.join(outRoot, preset.dir);
  await mkdir(dir, { recursive: true });

  const body = {
    model,
    prompt: preset.prompt,
    n,
    aspect_ratio: preset.aspect,
    resolution,
    response_format: 'b64_json',
  };
  if (reference) {
    body.image = { url: await refDataUri(reference), type: 'image_url' };
  }

  const endpoint = reference ? '/images/edits' : '/images/generations';
  console.log(`[grok-map-gen] ${presetName} -> ${endpoint} model=${model} n=${n} res=${resolution} ref=${reference ? path.basename(reference) : 'none'}`);
  const j = await apiJson(key, 'POST', endpoint, body);
  const items = parseImagePayload(j);
  const used = Math.min(items.length, n);

  const existing = new Set();
  // don't overwrite: pick next free vNN
  const { readdir } = await import('node:fs/promises');
  for (const f of await readdir(dir).catch(() => [])) {
    const m = f.match(new RegExp(`^${preset.prefix}(\\d+)`));
    if (m) existing.add(`${preset.prefix}${m[1]}`);
  }

  const files = [];
  let idx = nextIndex(existing, preset.prefix);
  for (let i = 0; i < used; i++) {
    const stub = `${preset.prefix}${String(idx).padStart(2, '0')}`;
    idx++;
    const tmp = path.join(dir, stub + '.bin');
    await downloadOne(items[i], tmp);
    const buf = await readFile(tmp);
    const kind = sniff(buf);
    const ext = kind.format === 'jpg' ? '.jpg' : kind.format === 'webp' ? '.webp' : '.png';
    const dest = path.join(dir, stub + ext);
    const { rename, unlink } = await import('node:fs/promises');
    await rename(tmp, dest).catch(async () => {
      await writeFile(dest, buf);
      await unlink(tmp).catch(() => {});
    });
    const dim = kind.format === 'png' ? pngSize(buf) : kind.format === 'jpg' ? jpgSize(buf) : null;
    const hash = createHash('sha256').update(buf).digest('hex');
    const st = await stat(dest);
    files.push({
      file: path.relative(ROOT, dest).replace(/\\/g, '/'),
      bytes: st.size,
      format: kind.format,
      corrupted: !kind.ok,
      width: dim?.w || null,
      height: dim?.h || null,
      aspect: dim ? +(dim.w / dim.h).toFixed(6) : null,
      sha256: hash,
    });
  }

  const hashes = files.map((f) => f.sha256);
  for (const f of files) {
    f.duplicate = hashes.filter((h) => h === f.sha256).length > 1;
  }

  const meta = {
    draft: true,
    production: false,
    preset: presetName,
    model,
    resolution,
    endpoint,
    reference: reference ? path.relative(ROOT, path.resolve(ROOT, reference)).replace(/\\/g, '/') : null,
    created: new Date().toISOString(),
    files,
  };
  const metaPath = path.join(dir, 'metadata.json');
  await writeFile(metaPath, JSON.stringify(meta, null, 2));
  budget.left -= used;
  budget.calls += 1;
  budget.outputs += used;
  console.log(`[grok-map-gen] wrote ${used} file(s) to ${path.relative(ROOT, dir)}`);
  return meta;
}

async function main(argv) {
  if (hasFlag(argv, '--help') || argv.length === 0) {
    console.log(`Usage:
  node tools/grok_map_asset_gen.mjs --list-models
  node tools/grok_map_asset_gen.mjs --preset ch1-crack --reference assets/map/ch1/ground_dark_soil.png --count 4
  node tools/grok_map_asset_gen.mjs --all --reference assets/map/ch1/ground_dark_soil.png --count 4

Env: XAI_API_KEY (never pass on CLI)
Caps: ${MAX_OUTPUTS} images per experiment. Draft output under assets/map/ch1/_grok_qa/
`);
    return;
  }

  const key = await getKey();
  const imageModels = await listImageModels(key);
  const model = argVal(argv, '--model') || pickLatestImagine(imageModels);
  if (hasFlag(argv, '--list-models')) {
    console.log('IMAGE_MODELS');
    imageModels.forEach((id) => console.log(id));
    console.log('SELECTED', model);
    return;
  }

  const count = Math.max(1, Math.min(4, +(argVal(argv, '--count') || 4)));
  const reference = argVal(argv, '--reference') || 'assets/map/ch1/ground_dark_soil.png';
  const resolution = argVal(argv, '--resolution') || '2k';
  const outRoot = path.resolve(ROOT, argVal(argv, '--out') || DEFAULT_OUT);
  const all = hasFlag(argv, '--all');
  const preset = argVal(argv, '--preset');
  const presets = all ? ['ch1-crack', 'ch1-root-edge'] : preset ? [preset] : die('need --preset or --all');

  if (presets.length * count > MAX_OUTPUTS) {
    die(`this experiment allows max ${MAX_OUTPUTS} outputs (asked ${presets.length * count})`);
  }

  const budget = { left: MAX_OUTPUTS, calls: 0, outputs: 0, model, imageModels };
  const results = [];
  for (const p of presets) {
    results.push(await generatePreset({
      key, model, resolution, presetName: p, reference, count, outRoot, budget,
    }));
  }
  const summary = {
    draft: true,
    model,
    available_image_models: imageModels,
    resolution,
    api_calls: budget.calls,
    outputs: budget.outputs,
    results: results.map((r) => ({ preset: r.preset, files: r.files.map((f) => f.file) })),
  };
  await mkdir(outRoot, { recursive: true });
  await writeFile(path.join(outRoot, 'run_summary.json'), JSON.stringify(summary, null, 2));
  console.log('[grok-map-gen] DONE outputs=' + budget.outputs + ' calls=' + budget.calls + ' model=' + model);
}

const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE;
if (IS_MAIN) {
  main(process.argv.slice(2)).catch((e) => die(e.message || String(e)));
}
