import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { loadWorkspaceEnv } from '../src/workspaceEnv.js';
import { buildPixelLabRequest } from '../src/pixellabProxy.js';

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

export function parsePixelLabArgs(argv) {
  const args = {
    method: 'GET',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--path':
        args.path = readOption(argv, i, token);
        i += 1;
        break;
      case '--method':
        args.method = readOption(argv, i, token).toUpperCase();
        i += 1;
        break;
      case '--body-json':
        args.bodyJson = readOption(argv, i, token);
        i += 1;
        break;
      case '--body-file':
        args.bodyFile = readOption(argv, i, token);
        i += 1;
        break;
      case '--out':
        args.out = readOption(argv, i, token);
        i += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }
  if (!args.path) {
    throw new Error('Provide --path');
  }
  return args;
}

export function detectExtensionFromContentType(contentType) {
  const normalized = String(contentType || '').toLowerCase();
  if (normalized.includes('application/json')) {
    return '.json';
  }
  if (normalized.includes('image/png')) {
    return '.png';
  }
  if (normalized.includes('image/jpeg')) {
    return '.jpg';
  }
  if (normalized.includes('audio/mpeg')) {
    return '.mp3';
  }
  return '.bin';
}

function sanitizePathPart(value) {
  return String(value || 'response')
    .replace(/^\/+/, '')
    .replace(/[^a-z0-9/_-]+/gi, '-')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '') || 'response';
}

function resolvePixelLabOutputPath({ rootDir, pathName, out, contentType }) {
  if (out && String(out).trim()) {
    return path.resolve(rootDir, out);
  }
  const ext = detectExtensionFromContentType(contentType);
  const baseName = sanitizePathPart(pathName).split('/').filter(Boolean).join('_');
  return path.join(rootDir, 'generated', 'pixellab', `${baseName}${ext}`);
}

async function resolvePixelLabBody(args) {
  if (args.bodyJson) {
    return JSON.parse(args.bodyJson);
  }
  if (args.bodyFile) {
    const text = await readFile(path.resolve(ROOT_DIR, args.bodyFile), 'utf8');
    return JSON.parse(text);
  }
  return undefined;
}

export async function runPixelLabCli(argv = process.argv.slice(2)) {
  const args = parsePixelLabArgs(argv);
  const env = await loadWorkspaceEnv({ rootDir: ROOT_DIR });
  const body = await resolvePixelLabBody(args);
  const request = buildPixelLabRequest({
    baseUrl: env.PIXELLAB_BASE_URL,
    apiKey: env.PIXELLAB_API_KEY,
    path: args.path,
    method: args.method,
    body,
  });

  const response = await fetch(request.url, request.init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`PixelLab request failed (${response.status}): ${message}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const outputPath = resolvePixelLabOutputPath({
    rootDir: ROOT_DIR,
    pathName: args.path,
    out: args.out,
    contentType,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  if (contentType.toLowerCase().includes('application/json')) {
    const json = await response.json();
    await writeFile(outputPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  } else {
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(outputPath, bytes);
  }

  const summary = {
    ok: true,
    out: path.relative(ROOT_DIR, outputPath) || path.basename(outputPath),
    contentType,
    loadedEnvFiles: env.__loadedFiles,
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (IS_MAIN) {
  runPixelLabCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
