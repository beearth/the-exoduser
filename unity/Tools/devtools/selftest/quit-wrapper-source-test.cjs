// PC-QUIT-1 source check (no Unity): Runtime and the Tools scripts that get copied into Player builds must quit through
// WindowsHardExit.Quit(code). A direct Application.Quit(code) is turned into exit code 0 by the Windows hard exit, which would make a failed QA run look PASS.
// Run: C:\nvm4w\nodejs\node.exe unity/Tools/devtools/selftest/quit-wrapper-source-test.cjs
const fs = require('node:fs'), path = require('node:path');
const unity = path.resolve(__dirname, '../../..');
const roots = [path.join(unity, 'Assets/Exoduser/Runtime'), path.join(unity, 'Tools')];
const allowed = new Set([path.normalize(path.join(unity, 'Assets/Exoduser/Runtime/Platform/WindowsHardExit.cs'))]);
const hits = []; let scanned = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'obj' || e.name === 'bin') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.cs') && !allowed.has(path.normalize(p))) scan(p);
  }
}
function scan(file) {
  scanned++;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const code = line.replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/\/\/.*$/, '');
    if (/\bApplication\s*\.\s*Quit\s*\(/.test(code)) hits.push(path.relative(unity, file).split(path.sep).join('/') + ':' + (i + 1));
  });
}
roots.forEach(r => { if (fs.existsSync(r)) walk(r); });
if (hits.length) { console.error('FAIL: direct Application.Quit( outside WindowsHardExit.cs:\n  ' + hits.join('\n  ')); process.exit(1); }
console.log('PASS: no direct Application.Quit( in ' + scanned + ' Runtime/Tools .cs files');
