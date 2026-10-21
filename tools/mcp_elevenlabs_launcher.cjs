#!/usr/bin/env node
// ElevenLabs MCP launcher for Claude Code (stdio).
// Reads ELEVENLABS_API_KEY from .env, then .env.local (wins; where `elevenlabs onboard` stores it),
// at launch so the key never lives in MCP config.
// Generated audio goes to G:/exoduser-wt/_out/elevenlabs (keeps large files off C:).
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const env = { ...process.env };
for (const name of ['.env', '.env.local']) {
  try {
    const m = fs.readFileSync(path.join(root, name), 'utf8').match(/^ELEVENLABS_API_KEY=(.*)$/m);
    if (m && m[1].trim()) env.ELEVENLABS_API_KEY = m[1].trim().replace(/^(['"])(.*)\1$/, '$2');
  } catch (_) { /* file missing: the server reports a missing key itself */ }
}
const outDir = 'G:/exoduser-wt/_out/elevenlabs';
fs.mkdirSync(outDir, { recursive: true });
env.ELEVENLABS_MCP_BASE_PATH = env.ELEVENLABS_MCP_BASE_PATH || outDir;

const child = spawn('uvx', ['elevenlabs-mcp'], { env, stdio: 'inherit', shell: process.platform === 'win32' });
child.on('exit', (code) => process.exit(code ?? 0));
