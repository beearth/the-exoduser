// release-version.mjs — 버전 단일 소스(release-version.json) 관리 도구
// 사용:
//   node tools/release-version.mjs get
//   node tools/release-version.mjs bump patch|minor   (json 버전+날짜 갱신, release-version.js 재생성, package.json version 동기화)
//   node tools/release-version.mjs check              (release-version.js / package.json 불일치 시 exit 1)
// 규칙: docs/13출시·마케팅/STEAM_UPDATE_RULES.md §2 — 버전은 이 json에만 적는다.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function todayStr(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function readRelease(root = DEFAULT_ROOT) {
  const json = JSON.parse(readFileSync(resolve(root, 'release-version.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+$/.test(json.version)) throw new Error(`Invalid version: ${json.version}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(json.date)) throw new Error(`Invalid date: ${json.date}`);
  return json;
}

export function bumpVersion(version, kind) {
  const [maj, min, pat] = version.split('.').map(Number);
  if (kind === 'patch') return `${maj}.${min}.${pat + 1}`;
  if (kind === 'minor') return `${maj}.${min + 1}.0`;
  throw new Error(`Unknown bump kind: ${kind} (patch|minor)`);
}

export function generatedJs(release) {
  return `window.EXODUSER_RELEASE={version:${JSON.stringify(release.version)},date:${JSON.stringify(release.date)}};\n`;
}

// package.json의 "version" 필드 값만 문자열 치환 (서식 보존)
export function patchPackageJsonVersion(source, version) {
  const re = /("version"\s*:\s*")[^"]+(")/;
  if (!re.test(source)) throw new Error('package.json: no "version" field');
  return source.replace(re, `$1${version}$2`);
}

export function writeAll(release, root = DEFAULT_ROOT) {
  writeFileSync(resolve(root, 'release-version.json'), JSON.stringify(release, null, 2) + '\n');
  writeFileSync(resolve(root, 'release-version.js'), generatedJs(release));
  const pkgPath = resolve(root, 'package.json');
  writeFileSync(pkgPath, patchPackageJsonVersion(readFileSync(pkgPath, 'utf8'), release.version));
}

export function checkSync(root = DEFAULT_ROOT) {
  const release = readRelease(root);
  const problems = [];
  let js = '';
  try { js = readFileSync(resolve(root, 'release-version.js'), 'utf8'); }
  catch { problems.push('release-version.js missing (run: node tools/release-version.mjs bump|get --write)'); }
  if (js && js !== generatedJs(release)) problems.push('release-version.js out of sync with release-version.json');
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  if (pkg.version !== release.version) problems.push(`package.json version ${pkg.version} != ${release.version}`);
  return { release, problems };
}

function main() {
  const [cmd, arg] = process.argv.slice(2);
  const root = DEFAULT_ROOT;
  if (cmd === 'get') {
    const r = readRelease(root);
    console.log(JSON.stringify(r));
    return;
  }
  if (cmd === 'bump') {
    const kind = arg || 'patch';
    const r = readRelease(root);
    const next = { ...r, version: bumpVersion(r.version, kind), date: todayStr() };
    writeAll(next, root);
    console.log(JSON.stringify({ from: r.version, to: next.version, date: next.date }));
    return;
  }
  if (cmd === 'check') {
    const { release, problems } = checkSync(root);
    if (problems.length) { console.error('CHECK FAIL\n- ' + problems.join('\n- ')); process.exit(1); }
    console.log(`CHECK OK v${release.version} (${release.date})`);
    return;
  }
  console.error('Usage: node tools/release-version.mjs get | bump patch|minor | check');
  process.exit(2);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
