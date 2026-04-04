import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { loadWorkspaceEnv } from '../src/workspaceEnv.js';
import { buildElevenLabsTtsRequest } from '../src/elevenlabsProxy.js';

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(THIS_FILE), '..');
const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE;

function readOption(argv, index, flag) {
  const value = argv[index + 1];
  if (value === undefined) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

export function parseElevenLabsArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--key':
        args.key = readOption(argv, i, token);
        i += 1;
        break;
      case '--text':
        args.text = readOption(argv, i, token);
        i += 1;
        break;
      case '--text-file':
        args.textFile = readOption(argv, i, token);
        i += 1;
        break;
      case '--voice-id':
        args.voiceId = readOption(argv, i, token);
        i += 1;
        break;
      case '--model-id':
        args.modelId = readOption(argv, i, token);
        i += 1;
        break;
      case '--out':
        args.out = readOption(argv, i, token);
        i += 1;
        break;
      case '--output-format':
        args.outputFormat = readOption(argv, i, token);
        i += 1;
        break;
      case '--stability':
        args.stability = Number(readOption(argv, i, token));
        i += 1;
        break;
      case '--similarity-boost':
        args.similarityBoost = Number(readOption(argv, i, token));
        i += 1;
        break;
      case '--style':
        args.style = Number(readOption(argv, i, token));
        i += 1;
        break;
      case '--use-speaker-boost':
        args.useSpeakerBoost = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }
  return args;
}

export function resolveElevenLabsOutputPath({ rootDir = ROOT_DIR, key, out }) {
  if (out && String(out).trim()) {
    return path.resolve(rootDir, out);
  }
  if (key && String(key).trim()) {
    return path.join(rootDir, 'sfx', 'voice', `${key}.mp3`);
  }
  throw new Error('Provide --out or --key');
}

function buildVoiceSettings(args) {
  const voiceSettings = {};
  if (Number.isFinite(args.stability)) {
    voiceSettings.stability = args.stability;
  }
  if (Number.isFinite(args.similarityBoost)) {
    voiceSettings.similarity_boost = args.similarityBoost;
  }
  if (Number.isFinite(args.style)) {
    voiceSettings.style = args.style;
  }
  if (args.useSpeakerBoost) {
    voiceSettings.use_speaker_boost = true;
  }
  return voiceSettings;
}

async function resolveText(args) {
  if (args.text && String(args.text).trim()) {
    return args.text;
  }
  if (args.textFile) {
    return readFile(path.resolve(ROOT_DIR, args.textFile), 'utf8');
  }
  throw new Error('Provide --text or --text-file');
}

export async function runElevenLabsCli(argv = process.argv.slice(2)) {
  const args = parseElevenLabsArgs(argv);
  const env = await loadWorkspaceEnv({ rootDir: ROOT_DIR });
  const text = await resolveText(args);
  const outputPath = resolveElevenLabsOutputPath({
    rootDir: ROOT_DIR,
    key: args.key,
    out: args.out,
  });
  const voiceSettings = buildVoiceSettings(args);
  const request = buildElevenLabsTtsRequest({
    apiKey: env.ELEVENLABS_API_KEY,
    voiceId: args.voiceId || env.ELEVENLABS_VOICE_ID,
    text,
    modelId: args.modelId || env.ELEVENLABS_MODEL_ID,
    outputFormat: args.outputFormat || env.ELEVENLABS_OUTPUT_FORMAT,
    voiceSettings,
    baseUrl: env.ELEVENLABS_BASE_URL,
  });

  const response = await fetch(request.url, request.init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ElevenLabs request failed (${response.status}): ${message}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);

  const summary = {
    ok: true,
    out: path.relative(ROOT_DIR, outputPath) || path.basename(outputPath),
    bytes: bytes.length,
    voiceId: args.voiceId || env.ELEVENLABS_VOICE_ID,
    loadedEnvFiles: env.__loadedFiles,
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (IS_MAIN) {
  runElevenLabsCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
