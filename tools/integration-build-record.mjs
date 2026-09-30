// PM-002: record the source boundary and hash the exact NW.js package payload.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const [phase, id] = process.argv.slice(2);
if (!['before', 'after'].includes(phase) || !/^\d{8}-\d{6}$/.test(id || '')) {
  throw new Error('Usage: node tools/integration-build-record.mjs before|after YYYYMMDD-HHMMSS');
}
const recordDir = 'out/integration-records';
mkdirSync(recordDir, { recursive: true });
const critical = [
  'build-nwjs.mjs', 'package.json', 'node-main.js', 'index.html', 'game.html',
  'game-easy-test.html', 'ui-refinement.css', 'ch1-face-life.js',
  'ch1-forest-sway.js', 'vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll',
];
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 }).trim();
const record = {
  phase, id, recordedAt: new Date().toISOString(),
  head: git('rev-parse', 'HEAD'),
  status: git('status', '--porcelain=v1', '--untracked-files=all'),
  trackedDiffSha256: createHash('sha256').update(git('diff', '--binary', '--no-ext-diff')).digest('hex'),
  source: Object.fromEntries(critical.map(file => [file, existsSync(file) ? hash(file) : null])),
};
const inputRoots = [
  'assets', 'img', 'sprites', 'bgm', 'sfx', 'video', 'localization',
  'output/imagegen/item-skins', 'output/imagegen/forge-tabs-v3',
  'output/imagegen/forge-tabs-v4', 'prefabs',
];
const inputFiles = readdirSync('.', { withFileTypes: true })
  .filter(entry => entry.isFile() && /^(?:atlas_|lang_)/.test(entry.name))
  .map(entry => entry.name);
const inventory = [];
const inventoryWalk = path => {
  if (!existsSync(path)) return;
  const stat = statSync(path);
  if (stat.isFile()) { inventory.push([path.replaceAll('\\', '/'), stat.size, stat.mtimeMs]); return; }
  for (const entry of readdirSync(path, { withFileTypes: true })) inventoryWalk(join(path, entry.name));
};
for (const path of [...inputRoots, ...inputFiles]) inventoryWalk(path);
inventory.sort((a, b) => a[0].localeCompare(b[0], 'en'));
record.inputInventory = {
  files: inventory.length,
  bytes: inventory.reduce((total, entry) => total + entry[1], 0),
  metadataSha256: createHash('sha256').update(JSON.stringify(inventory)).digest('hex'),
};
if (phase === 'after') {
  const packageDir = `out/EXODUSER-integration-${id}`;
  const payloadDir = join(packageDir, 'package.nw');
  if (!existsSync(payloadDir)) throw new Error(`Missing package payload: ${payloadDir}`);
  const files = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  walk(payloadDir);
  files.sort((a, b) => relative(payloadDir, a).localeCompare(relative(payloadDir, b), 'en'));
  const digest = createHash('sha256');
  let bytes = 0;
  const categories = {};
  for (const file of files) {
    const name = relative(payloadDir, file).replaceAll('\\', '/');
    const size = statSync(file).size;
    bytes += size;
    const category = name.includes('/') ? name.split('/')[0] : 'root';
    categories[category] ??= { files: 0, bytes: 0 };
    categories[category].files += 1;
    categories[category].bytes += size;
    digest.update(`${name}\0${size}\0${hash(file)}\n`);
  }
  for (const category of ['assets', 'img', 'sprites', 'bgm', 'sfx', 'video', 'localization']) {
    if (!categories[category]?.files) throw new Error(`Empty or missing package category: ${category}`);
  }
  record.package = {
    path: payloadDir, files: files.length, bytes,
    treeSha256: digest.digest('hex'),
    categories,
    executableSha256: hash(join(packageDir, 'EXODUSER.exe')),
    codecSha256: hash(join(packageDir, 'ffmpeg.dll')),
    critical: Object.fromEntries(critical.filter(file => existsSync(join(payloadDir, file))).map(file => [file, hash(join(payloadDir, file))])),
  };
}
const destination = join(recordDir, `${id}-${phase}.json`);
writeFileSync(destination, JSON.stringify(record, null, 2) + '\n');
console.log(destination);
console.log(JSON.stringify({ head: record.head, recordedAt: record.recordedAt, package: record.package && { files: record.package.files, bytes: record.package.bytes, treeSha256: record.package.treeSha256 } }));
