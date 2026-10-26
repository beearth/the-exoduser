// SFX Forge — ElevenLabs sound-effect generator for 지옥의 길 (skill / hit / ui / ambient).
//
// The SDK reads ELEVENLABS_API_KEY from the environment; the npm script loads it with
// `node --env-file=.env.local`. The key is never read, printed or stored by this tool.
//
// Generated audio goes to a staging folder outside the repo (../exoduser-wt/_out/sfx_forge by
// default, override with SFX_FORGE_OUT). Nothing reaches the game's sfx/ folder until `promote`.
//
//   npm run sfx:forge -- gen --category hit --key slash_flesh --text "..." [--variants 3]
//   npm run sfx:forge -- batch --catalog tools/sfx_forge_catalog.json [--only a,b] [--dry-run]
//   npm run sfx:forge -- promote --category hit --key slash_flesh --variant 2 --to sfx/hit/slash_flesh.mp3
//   npm run sfx:forge -- list
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';

const THIS_FILE = fileURLToPath(import.meta.url);
export const ROOT_DIR = path.resolve(path.dirname(THIS_FILE), '..');
const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE;

export const MODEL_ID = 'eleven_text_to_sound_v2';
export const MAX_PROMPT_CHARS = 450;
export const MAX_VARIANTS = 4;

// House style per category, following docs/6사운드디자인 (subject + layers, then genre, envelope, exclusions).
export const CATEGORY_PRESETS = {
  skill: {
    duration: 1.2, promptInfluence: 0.7, loop: false,
    tail: 'Single skill cast, dark hellish fantasy action RPG, weighty but restrained. Clear attack transient, controlled tail under one second. No voice, music, melody or long reverb.',
  },
  hit: {
    duration: 0.5, promptInfluence: 0.85, loop: false,
    tail: 'Single hit, dark fantasy action RPG. Immediate onset, dry 200-300 ms decay. No launch whoosh, voice, music, drone, long reverb or harsh highs.',
  },
  ui: {
    duration: 0.5, promptInfluence: 0.8, loop: false,
    tail: 'Game menu UI sound, dark gothic fantasy, iron, bone and ember textures. Short, clean and unobtrusive. No voice, music, chime melody or reverb tail.',
  },
  ambient: {
    duration: 10, promptInfluence: 0.4, loop: true,
    tail: 'Seamless looping background ambience for a dark hellish fantasy RPG. Even level, no sudden hits. No voice or music.',
  },
};

export function defaultStagingDir(env = process.env) {
  return env.SFX_FORGE_OUT ? path.resolve(env.SFX_FORGE_OUT) : path.resolve(ROOT_DIR, '..', 'exoduser-wt', '_out', 'sfx_forge');
}

function need(argv, i, flag) {
  const v = argv[i + 1];
  if (v === undefined || v.startsWith('--')) throw new Error(`${flag} requires a value`);
  return v;
}

export function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!['gen', 'batch', 'promote', 'list'].includes(command)) {
    throw new Error('Usage: sfx_forge <gen|batch|promote|list> [options]');
  }
  const args = { command, variants: 1, dryRun: false, raw: false, force: false };
  for (let i = 0; i < rest.length; i += 1) {
    const t = rest[i];
    switch (t) {
      case '--category': args.category = need(rest, i, t); i += 1; break;
      case '--key': args.key = need(rest, i, t); i += 1; break;
      case '--text': args.text = need(rest, i, t); i += 1; break;
      case '--variants': args.variants = Number(need(rest, i, t)); i += 1; break;
      case '--duration': args.duration = Number(need(rest, i, t)); i += 1; break;
      case '--influence': args.promptInfluence = Number(need(rest, i, t)); i += 1; break;
      case '--loop': args.loop = true; break;
      case '--no-loop': args.loop = false; break;
      case '--raw': args.raw = true; break;
      case '--format': args.outputFormat = need(rest, i, t); i += 1; break;
      case '--catalog': args.catalog = need(rest, i, t); i += 1; break;
      case '--only': args.only = need(rest, i, t).split(',').map((s) => s.trim()).filter(Boolean); i += 1; break;
      case '--variant': args.variant = Number(need(rest, i, t)); i += 1; break;
      case '--to': args.to = need(rest, i, t); i += 1; break;
      case '--out': args.out = need(rest, i, t); i += 1; break;
      case '--dry-run': args.dryRun = true; break;
      case '--force': args.force = true; break;
      default: throw new Error(`Unknown argument: ${t}`);
    }
  }
  return args;
}

const KEY_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

// Resolves one sound request into the exact API parameters. Throws on anything the API would reject.
export function buildSoundSpec({ category, key, text, duration, promptInfluence, loop, raw = false, variants = 1, outputFormat = 'mp3_44100_128' }) {
  const preset = CATEGORY_PRESETS[category];
  if (!preset) throw new Error(`Unknown category "${category}" (use ${Object.keys(CATEGORY_PRESETS).join(', ')})`);
  if (!key || !KEY_RE.test(key)) throw new Error(`Invalid key "${key}": lowercase letters, digits, _ or -`);
  const body = String(text || '').trim();
  if (!body) throw new Error(`Missing --text for ${key}`);
  const prompt = raw ? body : `${body.replace(/[.\s]+$/, '')}. ${preset.tail}`;
  if (prompt.length > MAX_PROMPT_CHARS) throw new Error(`Prompt for ${key} is ${prompt.length} chars (max ${MAX_PROMPT_CHARS}); shorten --text`);
  const d = Number.isFinite(duration) ? duration : preset.duration;
  if (d < 0.5 || d > 30) throw new Error(`Duration ${d}s out of range 0.5–30`);
  const pi = Number.isFinite(promptInfluence) ? promptInfluence : preset.promptInfluence;
  if (pi < 0 || pi > 1) throw new Error(`Prompt influence ${pi} out of range 0–1`);
  if (!Number.isInteger(variants) || variants < 1 || variants > MAX_VARIANTS) throw new Error(`Variants must be 1–${MAX_VARIANTS}`);
  return {
    category, key, variants, outputFormat,
    request: { text: prompt, modelId: MODEL_ID, durationSeconds: d, promptInfluence: pi, loop: loop ?? preset.loop, outputFormat },
  };
}

export function variantPath(stagingDir, category, key, n, outputFormat = 'mp3_44100_128') {
  const ext = outputFormat.startsWith('mp3') ? 'mp3' : outputFormat.startsWith('opus') ? 'opus' : outputFormat.startsWith('pcm') ? 'pcm' : 'bin';
  return path.join(stagingDir, category, key, `v${n}.${ext}`);
}

// Destination must stay inside the game's sfx/ folder.
export function resolvePromoteTarget(rootDir, to) {
  if (!to) throw new Error('promote requires --to (a path under sfx/)');
  const sfxRoot = path.resolve(rootDir, 'sfx');
  const dest = path.resolve(rootDir, to);
  if (!dest.startsWith(sfxRoot + path.sep)) throw new Error(`--to must be inside sfx/ (got ${to})`);
  return dest;
}

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function streamToBuffer(stream) {
  if (stream && typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    const chunks = [];
    for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(Buffer.from(value)); }
    return Buffer.concat(chunks);
  }
  const chunks = [];
  for await (const c of stream) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
}

async function makeClient() {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is not set. Run through `npm run sfx:forge` so .env.local is loaded.');
  const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
  return new ElevenLabsClient();
}

async function readManifest(file) { try { return JSON.parse(await readFile(file, 'utf8')); } catch { return { entries: [] }; } }

// Generates the missing variants of one spec. Existing files are kept (no repeat credit spend) unless force.
export async function generateSpec(spec, { stagingDir = defaultStagingDir(), client, force = false, dryRun = false, log = console.log } = {}) {
  const results = [];
  for (let n = 1; n <= spec.variants; n += 1) {
    const out = variantPath(stagingDir, spec.category, spec.key, n, spec.outputFormat);
    if (!force && await exists(out)) { results.push({ variant: n, out, status: 'kept' }); continue; }
    if (dryRun) { results.push({ variant: n, out, status: 'dry-run' }); continue; }
    const stream = await client.textToSoundEffects.convert(spec.request);
    const bytes = await streamToBuffer(stream);
    if (bytes.length < 512) throw new Error(`${spec.key} v${n}: response too small (${bytes.length} bytes)`);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, bytes);
    results.push({ variant: n, out, status: 'generated', bytes: bytes.length });
    log(`  ${spec.category}/${spec.key} v${n}  ${bytes.length} bytes`);
  }
  if (!dryRun) {
    const mf = path.join(stagingDir, spec.category, spec.key, 'manifest.json');
    const manifest = await readManifest(mf);
    manifest.key = spec.key; manifest.category = spec.category; manifest.model = MODEL_ID;
    for (const r of results.filter((x) => x.status === 'generated')) {
      manifest.entries = manifest.entries.filter((e) => e.variant !== r.variant);
      manifest.entries.push({ variant: r.variant, file: path.basename(r.out), bytes: r.bytes, request: spec.request, generatedAt: new Date().toISOString() });
    }
    manifest.entries.sort((a, b) => a.variant - b.variant);
    await mkdir(path.dirname(mf), { recursive: true });
    await writeFile(mf, JSON.stringify(manifest, null, 2));
  }
  return results;
}

export async function loadCatalog(file) {
  const data = JSON.parse(await readFile(file, 'utf8'));
  if (!Array.isArray(data.sounds)) throw new Error(`${file}: expected { "sounds": [...] }`);
  return data.sounds;
}

function escapeHtml(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// Writes <staging>/index.html: every key with its variants side by side for listening.
export async function writeReviewPage(stagingDir = defaultStagingDir()) {
  const rows = [];
  for (const category of Object.keys(CATEGORY_PRESETS)) {
    const dir = path.join(stagingDir, category);
    if (!await exists(dir)) continue;
    for (const key of (await readdir(dir)).sort()) {
      const manifest = await readManifest(path.join(dir, key, 'manifest.json'));
      if (!manifest.entries.length) continue;
      const players = manifest.entries.map((e) => `<figure><figcaption>v${e.variant}</figcaption><audio controls preload="none" src="${category}/${key}/${e.file}"></audio></figure>`).join('');
      rows.push(`<section><h2>${escapeHtml(category)} / ${escapeHtml(key)}</h2><p>${escapeHtml(manifest.entries[0].request.text)}</p><div class="v">${players}</div></section>`);
    }
  }
  const html = `<!doctype html><meta charset="utf-8"><title>SFX Forge</title><style>body{background:#121012;color:#dfd6c2;font:15px 'Nanum Myeongjo',serif;margin:24px}h1{font-family:Cinzel,serif}section{border-top:1px solid rgba(164,147,115,.5);padding:12px 0}h2{margin:0 0 4px;font-size:16px}p{opacity:.7;font-size:13px;margin:0 0 8px}.v{display:flex;gap:12px;flex-wrap:wrap}figure{margin:0}figcaption{font-size:12px;opacity:.8}</style><h1>SFX Forge</h1>${rows.join('') || '<p>No sounds yet.</p>'}`;
  await mkdir(stagingDir, { recursive: true });
  await writeFile(path.join(stagingDir, 'index.html'), html);
  return path.join(stagingDir, 'index.html');
}

export async function promote({ rootDir = ROOT_DIR, stagingDir = defaultStagingDir(), category, key, variant, to, force = false }) {
  if (!CATEGORY_PRESETS[category]) throw new Error(`Unknown category "${category}"`);
  const manifest = await readManifest(path.join(stagingDir, category, key, 'manifest.json'));
  const entry = manifest.entries.find((e) => e.variant === variant);
  if (!entry) throw new Error(`No generated v${variant} for ${category}/${key}`);
  const dest = resolvePromoteTarget(rootDir, to);
  if (!force && await exists(dest)) throw new Error(`${to} already exists; pass --force to replace it`);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(path.join(stagingDir, category, key, entry.file), dest);
  return { from: `${category}/${key}/${entry.file}`, to: path.relative(rootDir, dest), request: entry.request };
}

export async function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const stagingDir = args.out ? path.resolve(args.out) : defaultStagingDir();
  if (args.command === 'list') {
    console.log(JSON.stringify({ stagingDir, review: await writeReviewPage(stagingDir) }, null, 2));
    return;
  }
  if (args.command === 'promote') {
    console.log(JSON.stringify(await promote({ stagingDir, category: args.category, key: args.key, variant: args.variant, to: args.to, force: args.force }), null, 2));
    return;
  }
  let specs;
  if (args.command === 'gen') {
    specs = [buildSoundSpec(args)];
  } else {
    if (!args.catalog) throw new Error('batch requires --catalog');
    const sounds = await loadCatalog(path.resolve(ROOT_DIR, args.catalog));
    const picked = args.only ? sounds.filter((s) => args.only.includes(s.key)) : sounds;
    if (args.only) for (const k of args.only) if (!picked.some((s) => s.key === k)) throw new Error(`--only key "${k}" not in catalog`);
    specs = picked.map((s) => buildSoundSpec({ variants: args.variants, outputFormat: args.outputFormat, ...s }));
  }
  const total = specs.reduce((a, s) => a + s.variants, 0);
  console.log(`SFX Forge: ${specs.length} sound(s), up to ${total} file(s) → ${stagingDir}${args.dryRun ? ' (dry run)' : ''}`);
  const client = args.dryRun ? null : await makeClient();
  const summary = [];
  for (const spec of specs) summary.push({ key: spec.key, category: spec.category, results: await generateSpec(spec, { stagingDir, client, force: args.force, dryRun: args.dryRun }) });
  const review = args.dryRun ? null : await writeReviewPage(stagingDir);
  const counts = summary.flatMap((s) => s.results).reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});
  console.log(JSON.stringify({ counts, review }, null, 2));
}

if (IS_MAIN) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
