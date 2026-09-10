import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { runElevenLabsSfxCli } from './elevenlabs_sfx.mjs';

const folder = new URL('../마법_피격음_일레븐랩스/', import.meta.url);
const current = new URL('../sfx/hit/player_projectile_impact.wav', import.meta.url);
const sha = b => createHash('sha256').update(b).digest('hex');
const before = sha(await readFile(current));
const common = ' Single spell hit, dark fantasy RPG. Immediate onset, dry 200-300 ms decay. No launch whoosh, metal clang, wooden knock, gunshot, voice, music, drone, long reverb or harsh highs.';
const candidates = [
  { id: 1, name: '마력 파열', file: '01_마력_파열.mp3', text: 'A compact magical energy orb bursting on contact: a dense arcane pop, layered with a brief shimmering granular energy shatter and a soft low-mid pressure pulse. Clearly supernatural spell damage.' + common },
  { id: 2, name: '암흑 마법 충돌', file: '02_암흑_마법_충돌.mp3', text: 'A cursed shadow bolt striking a warrior: a forceful hollow arcane whump with a gritty supernatural energy rupture, a very short inward suction and smoky magical fizz fading quickly. Weighty dark sorcery impact.' + common },
  { id: 3, name: '전격 피격', file: '03_전격_피격.mp3', text: 'A magical lightning projectile hitting a character: a punchy electrical zap with a dense energy snap and tiny sizzling arc fragments, a compact midrange impact underneath. Fantasy lightning damage, controlled and not shrill.' + common },
];
await mkdir(folder, { recursive: true });
const manifest = { provider: 'ElevenLabs', model_id: 'eleven_text_to_sound_v2', output_format: 'mp3_44100_128', duration_seconds: 0.5, prompt_influence: 0.85, status: 'generating', game_sound_sha256: before, candidates };
await writeFile(new URL('제작_기록.json', folder), JSON.stringify(manifest, null, 2));
for (const item of candidates) {
  if (item.text.length > 450) throw new Error('Prompt exceeds 450 characters');
  const target = new URL(item.file, folder);
  const exists = await stat(target).then(s => s.size > 0).catch(() => false);
  if (!exists) await runElevenLabsSfxCli(['--text', item.text, '--out', `마법_피격음_일레븐랩스/${item.file}`, '--duration', '0.5', '--prompt-influence', '0.85']);
  item.sha256 = sha(await readFile(target));
  console.log(`Ready: ${item.id} ${item.name}`);
}
if (before !== sha(await readFile(current))) throw new Error('Current game sound changed');
manifest.status = 'generated';
await writeFile(new URL('제작_기록.json', folder), JSON.stringify(manifest, null, 2));
