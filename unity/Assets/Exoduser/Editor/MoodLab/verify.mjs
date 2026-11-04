// Source-only review. This is NOT a Unity compilation or a visibility verdict.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const runtime = resolve(repo, 'unity/Assets/Exoduser/Runtime/MoodLab');
const read = name => readFileSync(resolve(runtime, name), 'utf8');
// Ignore comments for dependency rules; also check balanced delimiters outside strings/comments.
function codeOnly(source) {
  let out = '', state = 'code';
  const stack = [], pairs = { ')': '(', ']': '[', '}': '{' };
  for (let i = 0; i < source.length; i++) {
    const c = source[i], next = source[i + 1];
    if (state === 'line') { if (c === '\n') { state = 'code'; out += c; } continue; }
    if (state === 'block') { if (c === '*' && next === '/') { state = 'code'; i++; } continue; }
    if (state === '"' || state === "'") {
      out += c;
      if (c === '\\') { out += source[++i]; continue; }
      if (c === state) state = 'code';
      continue;
    }
    if (c === '/' && next === '/') { state = 'line'; out += ' '; i++; continue; }
    if (c === '/' && next === '*') { state = 'block'; out += ' '; i++; continue; }
    if (c === '"' || c === "'") { state = c; out += c; continue; }
    if ('([{'.includes(c)) stack.push(c);
    if (')]}'.includes(c)) assert.equal(stack.pop(), pairs[c], 'C# delimiter pair');
    out += c;
  }
  assert.ok(state === 'code' || state === 'line', 'unterminated C# literal/comment');
  assert.equal(stack.length, 0, 'unclosed C# delimiter');
  return out;
}
assert.ok(existsSync(resolve(runtime, 'MoodLabBootstrap.cs')), 'MoodLab opt-in bootstrap must exist');
const boot = read('MoodLabBootstrap.cs');
const scene = read('MoodLabScene.cs');
const data = read('MoodLabPresets.cs');
assert.match(boot, /if\s*\(!MoodLabOptions\.Requested\(args\)\)\s*return;/);
assert.ok(boot.indexOf('!MoodLabOptions.Requested(args)') < boot.indexOf('SetActive(false)'));
assert.match(boot, /RuntimeInitializeLoadType.BeforeSceneLoad/);
assert.match(boot, /RuntimeInitializeLoadType.AfterSceneLoad/);
assert.ok(boot.indexOf('SetActive(false)') < boot.indexOf('MoodLabOptions.TryParse(args'));
assert.match(boot, /Path.IsPathRooted/);
assert.match(boot, /--unity-qa-sandbox/);
assert.match(boot, /--mood=/);
assert.match(boot, /Application.Quit\(2\)/);
assert.match(scene, /SceneManager.CreateScene\("MoodLab"\)/);
assert.match(scene, /SceneManager.SetActiveScene/);
assert.match(data, /Pitch = 34f/);
assert.match(data, /Distance = 16.5f/);
assert.match(data, /FieldOfView = 46.9453f/);

// The C# table is deliberately regular: one row per preset; no duplicate JS tuning table.
const rows = [...data.matchAll(/new MoodLabPreset\('([a-d])', "([^"]+)", ([^\n]+)\)/g)];
assert.deepEqual(rows.map(r => r[1]), ['a', 'b', 'c', 'd']);
const scalar = text => Number(text.replace(/f/g, '').trim());
const colors = text => [...text.matchAll(/new Color\(([^)]+)\)/g)].map(m => m[1].split(',').map(scalar));
const pitch = 34 * Math.PI / 180;
const fov = 46.9453 * Math.PI / 180;
const probeZ = [0, 7, 12];
for (const row of rows) {
  const tail = row[3].replace(/new Color\([^)]+\)/g, 'COLOR');
  const values = tail.split(',').map(x => x.trim());
  const [key, shadow, ambient, fogStart, fogEnd, exposure, contrast, saturation] =
    [0, 2, 3, 5, 6, 8, 9, 10].map(i => scalar(values[i]));
  assert.ok(key >= 2.4 && key <= 3.2 && shadow <= .65 && ambient >= .22);
  assert.ok(fogStart >= 19 && fogEnd >= 62 && fogStart < fogEnd);
  assert.ok(exposure >= .25 && exposure <= .55 && contrast <= 16 && saturation >= -16);
  assert.ok(colors(row[3]).flat().every(v => Number.isFinite(v) && v >= 0 && v <= 1));
  // Conservative: linear eye-depth attenuation, not Euclidean camera distance.
  const depths = probeZ.map(z => 16.5 + Math.cos(pitch) * z - Math.sin(pitch) * .805);
  const transmission = depths.map(d => Math.min(1, Math.max(0, (fogEnd - d) / (fogEnd - fogStart))));
  assert.ok(transmission[2] >= .83, `${row[1]} far-probe fog budget`);
  for (const z of probeZ) {
    for (const y of [0, 1.61]) {
      const depth = 16.5 + Math.cos(pitch) * z - Math.sin(pitch) * y;
      const vertical = Math.sin(pitch) * z + Math.cos(pitch) * y;
      assert.ok(Math.abs(vertical / (depth * Math.tan(fov / 2))) < .96, 'probe inside vertical frustum');
    }
  }
  console.log(`${row[1]}: fog ${fogStart}-${fogEnd}u; probe eye-depth ${depths[2].toFixed(3)}u; transmission ${(transmission[2] * 100).toFixed(2)}%`);
}
const tree = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', '--', 'unity/Assets/Exoduser/Resources'], { cwd: repo, encoding: 'utf8' }).split('\n');
const resources = [...scene.matchAll(/(?:Require|RequireMesh)<[^>]+>\("([^"]+)"\)/g)].map(m => m[1]);
assert.ok(resources.length >= 7, 'explicit Resources dependencies');
for (const resource of resources) {
  assert.ok(tree.some(p => p.startsWith(`unity/Assets/Exoduser/Resources/${resource}.`) && !p.endsWith('.meta')), `tracked resource: ${resource}`);
}
for (const raw of [boot, scene, data]) {
  const src = codeOnly(raw);
  assert.doesNotMatch(src, /\b(?:NativeGame|NativeQaSandbox|PlayerPrefs|File|Directory|AssetDatabase|EditorPrefs)\s*\./);
  assert.doesNotMatch(src, /Exoduser\.UnityPort\.Core|persistentDataPath|CreatePrimitive|Random\.|PerlinNoise|AddComponent<ParticleSystem>/);
}
assert.match(scene, /Add<FilmGrain>\(true\)\.intensity.Override\(0\)/);
assert.match(scene, /Add<Vignette>\(true\)\.intensity.Override\(0\)/);
assert.match(scene, /Add<Bloom>\(true\)\.intensity.Override\(0\)/);
assert.match(scene, /dithering = false/);
assert.match(scene, /postExposure.Override\(preset.Exposure\)/);
assert.match(scene, /fogEndDistance = preset.FogEnd/);
const allNew = [runtime, dirname(fileURLToPath(import.meta.url))];
const guids = [];
for (const dir of allNew) {
  assert.ok(existsSync(`${dir}.meta`), `folder meta: ${relative(repo, dir)}`);
  for (const file of readdirSync(dir).filter(x => !x.endsWith('.meta'))) {
    assert.ok(existsSync(resolve(dir, `${file}.meta`)), `file meta: ${file}`);
  }
  for (const file of [`${dir}.meta`, ...readdirSync(dir).filter(x => x.endsWith('.meta')).map(x => resolve(dir, x))]) {
    const m = readFileSync(file, 'utf8').match(/^guid: ([0-9a-f]{32})$/m);
    assert.ok(m, `meta GUID: ${file}`); guids.push(m[1]);
    const collision = spawnSync('git', ['grep', '-l', m[1], 'HEAD', '--', 'unity/Assets'], { cwd: repo, encoding: 'utf8' });
    assert.equal(collision.status, 1, `GUID collision/search failure: ${file}`);
  }
}
assert.equal(new Set(guids).size, guids.length);
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
for (const path of untracked) {
  assert.match(path, /^unity\/Assets\/Exoduser\/(Runtime|Editor)\/MoodLab(?:\.meta|\/(?:[^/]+\.(?:cs|mjs)(?:\.meta)?))$/, `new-file boundary: ${path}`);
}
const trackedChanges = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(trackedChanges, '', 'existing tracked files must remain unchanged');
console.log(`PASS: opt-in/isolation contracts, 4 preset budgets, probe frustum, ${resources.length} Resources paths, metas, tracked files unchanged. Unity compile/render UNVERIFIED.`);
