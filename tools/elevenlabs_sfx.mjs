import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

import { loadWorkspaceEnv } from '../src/workspaceEnv.js';

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(THIS_FILE), '..');
const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE;

function readOption(argv, index, flag) {
  const value = argv[index + 1];
  if (value === undefined) throw new Error(`${flag} requires a value`);
  return value;
}

export function parseElevenLabsSfxArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--key': args.key = readOption(argv, i, token); i += 1; break;
      case '--text': args.text = readOption(argv, i, token); i += 1; break;
      case '--out': args.out = readOption(argv, i, token); i += 1; break;
      case '--duration': args.duration = Number(readOption(argv, i, token)); i += 1; break;
      case '--prompt-influence': args.promptInfluence = Number(readOption(argv, i, token)); i += 1; break;
      case '--output-format': args.outputFormat = readOption(argv, i, token); i += 1; break;
      default: throw new Error(`Unknown argument: ${token}`);
    }
  }
  return args;
}

export function resolveElevenLabsSfxOutputPath({ rootDir = ROOT_DIR, key, out }) {
  if (out && String(out).trim()) return path.resolve(rootDir, out);
  if (key && String(key).trim()) return path.join(rootDir, 'sfx', 'equipment', `${key}.mp3`);
  throw new Error('Provide --out or --key');
}

export function buildElevenLabsSfxRequest({
  apiKey, text, durationSeconds, promptInfluence, outputFormat = 'mp3_44100_128',
  baseUrl = 'https://api.elevenlabs.io/v1',
}) {
  if (!apiKey || !String(apiKey).trim()) throw new Error('ElevenLabs API key is missing');
  if (!text || !String(text).trim()) throw new Error('Sound effect text is missing');
  const body = { text: String(text).trim(), model_id: 'eleven_text_to_sound_v2' };
  if (Number.isFinite(durationSeconds)) body.duration_seconds = durationSeconds;
  if (Number.isFinite(promptInfluence)) body.prompt_influence = promptInfluence;
  const base = String(baseUrl).replace(/\/$/, '');
  return {
    url: `${base}/sound-generation?output_format=${encodeURIComponent(outputFormat)}`,
    init: {
      method: 'POST',
      headers: { 'xi-api-key': String(apiKey).trim(), Accept: 'audio/mpeg', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  };
}

export async function runElevenLabsSfxCli(argv = process.argv.slice(2)) {
  const args = parseElevenLabsSfxArgs(argv);
  const env = await loadWorkspaceEnv({ rootDir: ROOT_DIR });
  const outputPath = resolveElevenLabsSfxOutputPath({ rootDir: ROOT_DIR, key: args.key, out: args.out });
  const request = buildElevenLabsSfxRequest({
    apiKey: env.ELEVENLABS_API_KEY, text: args.text, durationSeconds: args.duration,
    promptInfluence: args.promptInfluence, outputFormat: args.outputFormat, baseUrl: env.ELEVENLABS_BASE_URL,
  });
  const response = await fetch(request.url, request.init);
  if (!response.ok) throw new Error(`ElevenLabs SFX request failed (${response.status}): ${await response.text()}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);
  const summary = { ok: true, out: path.relative(ROOT_DIR, outputPath), bytes: bytes.length, loadedEnvFiles: env.__loadedFiles };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (IS_MAIN) {
  runElevenLabsSfxCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
