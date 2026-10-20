// Runs the existing QA oracle tools/sv_restore_flow_oracle.cjs (exact source slices on
// detached fixtures) and stores its JSON stdout as a UTF-8 file for the Godot harness.
import { spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const arg = n => process.argv.slice(2).find(x => x.startsWith(n + '='))?.slice(n.length + 1);
const root = arg('--repo-root'), out = arg('--out-file');
if (!root || !out) throw Error('explicit --repo-root --out-file required');
const r = spawnSync(process.execPath, [path.join(root, 'tools', 'sv_restore_flow_oracle.cjs'), root], { encoding: 'utf8', maxBuffer: 1 << 28 });
if (r.status !== 0) { fs.writeFileSync(out, JSON.stringify({ error: r.stderr || String(r.status) }), 'utf8'); process.exit(1); }
fs.writeFileSync(out, r.stdout.trim(), 'utf8');
