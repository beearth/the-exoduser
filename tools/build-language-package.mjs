// Isolated, commit-pinned language QA package. Never updates the regular build.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, copyFile, lstat, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { x as extractTar } from 'tar';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out/EXODUSER-languages-20260923');
const RUNTIME = path.join(ROOT, 'out/EXODUSER-win64');
const RUNTIME_FILES = ['EXODUSER.exe', 'nw.dll', 'nw_elf.dll', 'node.dll', 'notification_helper.exe',
  'libGLESv2.dll', 'libEGL.dll', 'icudtl.dat', 'ffmpeg.dll', 'dxil.dll', 'dxcompiler.dll',
  'd3dcompiler_47.dll', 'credits.html', 'nw_200_percent.pak', 'nw_100_percent.pak',
  'vulkan-1.dll', 'vk_swiftshader_icd.json', 'vk_swiftshader.dll', 'v8_context_snapshot.bin', 'resources.pak'];
const args = process.argv.slice(2);
const build = args.includes('--build');
const commit = args[args.indexOf('--commit') + 1];
if (args.some((a, i) => !['--build', '--check', '--commit'].includes(a) && args[i - 1] !== '--commit') ||
    !args.includes('--commit') || !/^[0-9a-f]{40}$/.test(commit || '')) {
  throw new Error('Usage: node tools/build-language-package.mjs --commit <full 40-character commit> [--check|--build]');
}
if (build && args.includes('--check')) throw new Error('Choose --check or --build');

function run(command, argv, encoding = 'utf8') {
  const r = spawnSync(command, argv, { cwd: ROOT, encoding, maxBuffer: 256 * 1024 * 1024, windowsHide: true });
  if (r.error || r.status !== 0) throw new Error(`${command} failed: ${r.error || r.stderr}`);
  return r.stdout;
}
function git(...argv) { return run('git', argv); }
function safe(relative) {
  if (!relative || relative.includes('\\') || relative.startsWith('/') || relative.split('/').some(p => !p || p === '.' || p === '..' || p.includes(':'))) {
    throw new Error(`Unsafe path: ${relative}`);
  }
  return relative;
}
function forbidden(relative) {
  return relative.split('/').some(p => /^(?:userdata|saves|logs?|\.env(?:\..*)?)$/i.test(p)) || /(?:\.log|\.log\.[^/]+)$/i.test(relative);
}
async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function hash(p, algorithm = 'sha256', prefix) {
  const h = createHash(algorithm);
  if (prefix) h.update(prefix);
  for await (const chunk of createReadStream(p)) h.update(chunk);
  return h.digest('hex');
}
async function regular(p) {
  const stat = await lstat(p);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Not a regular file: ${p}`);
  return stat;
}
async function filesUnder(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const relative = safe(prefix + entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symbolic link rejected: ${relative}`);
    if (entry.isDirectory()) result.push(...await filesUnder(path.join(dir, entry.name), relative + '/'));
    else if (entry.isFile()) result.push(relative);
    else throw new Error(`Special file rejected: ${relative}`);
  }
  return result;
}

if (git('rev-parse', '--verify', `${commit}^{commit}`).trim() !== commit) throw new Error('Commit mismatch');
const builder = git('show', `${commit}:build-nwjs.mjs`);
function array(name) {
  const body = builder.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`))?.[1];
  if (!body) throw new Error(`Missing ${name} build contract`);
  return [...body.matchAll(/'([^']+)'/g)].map(m => safe(m[1]));
}
const required = [...array('FILES'), 'node-main.js', 'package.json'];
const dirs = array('DIRS');
// Legacy inputs also skipped by the regular builder (documented since 2026-09-16).
const optionalFiles = ['credits.html'];
const optionalDirs = ['output/imagegen/forge-tabs-v3'];
const codecHash = builder.match(/const CODEC_SHA256 = '([0-9a-f]{64})'/)?.[1];
if (!codecHash || !builder.includes("version: '0.111.2'")) throw new Error('Unrecognized NW.js/codec contract');
const entries = git('ls-tree', '-r', '-z', '--full-tree', commit).split('\0').filter(Boolean).map(record => {
  const match = record.match(/^(\d+) (\w+) ([0-9a-f]+)\t([\s\S]+)$/);
  if (!match) throw new Error('Malformed Git tree');
  return { mode: match[1], type: match[2], oid: match[3], path: safe(match[4]) };
});
const wanted = p => required.includes(p) || dirs.some(d => p.startsWith(d + '/')) ||
  (!p.includes('/') && (/^lang_.*\.js$/.test(p) || p.startsWith('atlas_')));
const selected = entries.filter(e => wanted(e.path) && !forbidden(e.path));
const missing = required.filter(p => !optionalFiles.includes(p) && !selected.some(e => e.path === p));
const missingDirs = dirs.filter(d => !optionalDirs.includes(d) && !selected.some(e => e.path.startsWith(d + '/')));
const archiveFiles = required.filter(p => selected.some(e => e.path === p));
const archiveDirs = dirs.filter(d => selected.some(e => e.path.startsWith(d + '/')));
const optionalMissing = [...optionalFiles.filter(p => !archiveFiles.includes(p)), ...optionalDirs.filter(d => !archiveDirs.includes(d))];
if (missing.length || missingDirs.length) throw new Error(`Missing committed build inputs: ${JSON.stringify({ missing, missingDirs })}`);
for (const e of selected) if (e.type !== 'blob' || !['100644', '100755'].includes(e.mode)) throw new Error(`Unsupported tree entry: ${e.path}`);
const pkg = JSON.parse(git('show', `${commit}:package.json`));
if (!/[?&]demo=1(?:&|$)/.test(pkg.main)) throw new Error('Expected unchanged demo=1 manifest');
const runtimePkg = Object.fromEntries(['name', 'version', 'main', 'node-main', 'node-remote', 'window', 'chromium-args'].map(k => [k, pkg[k]]));
const localesStat = await lstat(path.join(RUNTIME, 'locales'));
if (!localesStat.isDirectory() || localesStat.isSymbolicLink()) throw new Error('Unsafe runtime locales directory');
const runtimeFiles = [...RUNTIME_FILES, ...(await readdir(path.join(RUNTIME, 'locales'))).filter(p => /^[A-Za-z0-9_-]+\.pak(?:\.info)?$/.test(p)).map(p => `locales/${p}`)];
if (!runtimeFiles.includes('locales/en-US.pak')) throw new Error('Runtime locale files missing');
const runtimeVersion = run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "(Get-Item -LiteralPath 'out/EXODUSER-win64/nw.dll').VersionInfo.ProductVersion"]).trim();
if (runtimeVersion !== '0.111.2') throw new Error('Unexpected NW.js version: ' + runtimeVersion);
for (const p of runtimeFiles) await regular(path.join(RUNTIME, p));
if (await hash(path.join(RUNTIME, 'ffmpeg.dll')) !== codecHash) throw new Error('Existing runtime codec does not match pinned build');
const untracked = git('ls-files', '--others', '--exclude-standard', '-z', '--', ...required, ...dirs, 'lang_*.js', 'atlas_*').split('\0').filter(Boolean).filter(p => wanted(p) && !forbidden(p));
const ignored = git('ls-files', '--others', '--ignored', '--exclude-standard', '-z', '--', ...required, ...dirs, 'lang_*.js', 'atlas_*').split('\0').filter(Boolean).filter(p => wanted(p) && !forbidden(p));
const report = { sourceCommit: commit, runtimeVersion, runtimeContract: 'NW.js 0.111.2 normal win x64; existing runtime binaries reused',
  sourceMethod: 'Git archive from pinned commit; every extracted blob verified against Git object ID',
  mode: 'demo=1 (manifest unchanged)', output: path.relative(ROOT, OUT).replaceAll('\\', '/'),
  requiredFiles: required.filter(p => !optionalFiles.includes(p)), directories: dirs, optionalMissing,
  sourceFileCount: selected.length, runtimeFileCount: runtimeFiles.length,
  excludedTracked: entries.filter(e => wanted(e.path) && forbidden(e.path)).map(e => e.path),
  untrackedExcluded: untracked, ignoredExcluded: ignored, applicationFiles: [], runtimeFiles: [] };
console.log(JSON.stringify({ ...report, applicationFiles: undefined, runtimeFiles: undefined }, null, 2));
if (!build) process.exit(0);
if (await exists(OUT)) throw new Error(`Output already exists; refusing to overwrite: ${OUT}`);
await mkdir(OUT, { recursive: false });
const app = path.join(OUT, 'package.nw');
await mkdir(app);
const archive = path.join(OUT, 'source.tar');
// Export the contract roots, then require an exact file set. export-ignore/export-subst cannot silently change the package.
git('archive', '--format=tar', `--output=${archive}`, commit, '--', ...archiveFiles, ...archiveDirs,
  ...selected.filter(e => !e.path.includes('/') && !required.includes(e.path)).map(e => e.path));
// A contract root may contain tracked editor logs. Exclude those archive members
// before extraction; the final exact-file-set check still covers every output.
// Git's NUL-delimited UTF-8 tree is authoritative. Windows tar listings may
// escape non-ASCII names, making a text listing unsuitable for path validation.
await extractTar({ file: archive, cwd: app, strict: true, preservePaths: false,
  filter(name, entry) {
    const relative = safe(name.replace(/\/$/, ''));
    if (!['File', 'Directory'].includes(entry.type)) throw new Error(`Unsupported archive entry: ${relative}`);
    return !forbidden(relative);
  }
});
await unlink(archive);
const actual = (await filesUnder(app)).sort();
const expected = selected.map(e => e.path).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Archive file set differs from committed contract');
for (const e of selected) {
  const target = path.join(app, e.path);
  const stat = await regular(target);
  if (await hash(target, 'sha1', `blob ${stat.size}\0`) !== e.oid) throw new Error(`Git blob mismatch: ${e.path}`);
}
await writeFile(path.join(app, 'package.json'), JSON.stringify(runtimePkg, null, 2));
for (const p of actual) report.applicationFiles.push({ path: p, bytes: (await regular(path.join(app, p))).size, sha256: await hash(path.join(app, p)) });
for (const p of runtimeFiles) {
  const src = path.join(RUNTIME, p), dst = path.join(OUT, p);
  const before = await hash(src);
  await mkdir(path.dirname(dst), { recursive: true });
  await copyFile(src, dst);
  if (await hash(dst) !== before || await hash(src) !== before) throw new Error(`Runtime changed during copy: ${p}`);
  report.runtimeFiles.push({ path: p, bytes: (await regular(dst)).size, sha256: before });
}
const finalFiles = await filesUnder(OUT);
if (finalFiles.some(forbidden) || finalFiles.length !== actual.length + runtimeFiles.length) throw new Error('Unexpected package files');
report.completedAt = new Date().toISOString();
report.verification = 'PASS: exact source file set, Git blob integrity, demo manifest, codec hash, copy hashes, forbidden-data exclusion';
await writeFile(path.join(OUT, 'language-package-manifest.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`PASS: ${OUT} (${actual.length} application files, ${runtimeFiles.length} runtime files)`);
