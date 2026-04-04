import path from 'node:path';
import { readFile } from 'node:fs/promises';

function stripQuotes(value) {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === '\'' && last === '\'')) {
      return value.slice(1, -1);
    }
  }
  return value;
}

export function parseEnvText(text) {
  const values = {};
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eqIndex = normalized.indexOf('=');
    if (eqIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, eqIndex).trim();
    const value = stripQuotes(normalized.slice(eqIndex + 1).trim());
    if (!key) {
      continue;
    }
    values[key] = value;
  }
  return values;
}

export async function loadWorkspaceEnv({
  rootDir = process.cwd(),
  files = ['.env', '.env.local'],
  env = process.env,
} = {}) {
  const loadedFiles = [];
  const originalKeys = new Set(Object.keys(env || {}));
  const merged = { ...(env || {}) };

  for (const fileName of files) {
    const filePath = path.join(rootDir, fileName);
    let text;
    try {
      text = await readFile(filePath, 'utf8');
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }

    loadedFiles.push(fileName);
    const parsed = parseEnvText(text);
    for (const [key, value] of Object.entries(parsed)) {
      if (!originalKeys.has(key)) {
        env[key] = value;
        merged[key] = value;
      }
    }
  }

  return {
    ...merged,
    __loadedFiles: loadedFiles,
  };
}
