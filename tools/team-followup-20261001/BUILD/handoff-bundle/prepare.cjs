const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
function apply(source, diff) {
  for (const hunk of diff.split('\n@@\n').slice(1)) {
    const lines = hunk.trimEnd().split('\n');
    const before = lines.filter(line => /^[ -]/.test(line)).map(line => line.slice(1)).join('\n');
    const after = lines.filter(line => /^[ +]/.test(line)).map(line => line.slice(1)).join('\n');
    if (source.split(before).length !== 2) throw new Error('Source hunk mismatch');
    source = source.replace(before, after);
  }
  return source;
}
function prepare(id) {
  if (!/^[a-z0-9-]{1,60}$/.test(id)) throw new Error('Invalid unique id');
  const output = path.join(__dirname, 'prepared-' + id);
  fs.mkdirSync(output);
  const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
  const source = apply(read('inputs/node-main.js'), read('node-main.js.diff'));
  const originalSave = "path.join(APPDATA, 'EXODUSER-HELL', 'saves')";
  if (source.split(originalSave).length !== 2) throw new Error('Save isolation mismatch');
  const isolated = source.replace('const PORT = 3333;', 'const PORT = 3347;').replace(originalSave, "path.join(__dirname, 'fixture-saves')");
  const input = JSON.parse(read('inputs/package.json'));
  const pkg = { name: 'exoduser-entry-handoff-' + id, version: input.version, main: 'package-entry.html', 'node-main': 'node-main.js', 'node-remote': ['http://127.0.0.1:3347', 'http://localhost:3347'], window: { title: 'EXODUSER 인수 사본 — 실행 게이트 필요', width: 760, height: 520 }, 'chromium-args': '--user-data-dir=' + path.join(output, 'fixture-profile') };
  const files = { 'package.json': JSON.stringify(pkg, null, 2) + '\n', 'node-main.js': isolated, 'package-entry.html': read('package-entry.html'), 'package-entry-state.cjs': read('package-entry-state.cjs'), 'index.html': '<!doctype html><meta charset="utf-8"><title>인수 fixture</title><p>자기 서버에서만 반환되는 인수 fixture. 게임 아님.</p>' };
  const hashes = {};
  for (const [file, body] of Object.entries(files)) { fs.writeFileSync(path.join(output, file), body); hashes[file] = crypto.createHash('sha256').update(body).digest('hex'); }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({ id, hashes, kind: 'small-fixture-not-game-build', runtimeExecuted: false, limits: ['Root must approve NW/socket execution separately.', 'No game assets or game content.', 'Save/profile isolated to this new folder.'] }, null, 2) + '\n');
  return output;
}
module.exports = { apply, prepare };
if (require.main === module) console.log(prepare(process.argv[2]));
