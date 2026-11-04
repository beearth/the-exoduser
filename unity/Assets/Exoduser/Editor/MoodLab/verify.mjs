// Source-only review. This is NOT a Unity compilation or a visibility verdict.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { comparePngPaths } from './png-check.mjs';

// Explicit image mode measures actual pixels and skips source-only checks.
const pngAt = process.argv.indexOf('--png');
if (pngAt >= 0) {
  try { process.exit(comparePngPaths(process.argv.slice(pngAt+1)).exitCode); }
  catch (error) { console.error(`PNG MEASUREMENT ERROR: ${error.message}`); process.exit(2); }
}

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
const atmosphere = read('MoodLabAtmosphere.cs');
const shaderPath = 'unity/Assets/Exoduser/Resources/MoodLab/MoodLabAtmosphere.shader';
const shader = readFileSync(resolve(repo, shaderPath), 'utf8');
const water = read('MoodLabWaterPass.cs');
const baselineScene = execFileSync('git', ['show', '2f5d8fd15:unity/Assets/Exoduser/Runtime/MoodLab/MoodLabScene.cs'], { cwd: repo, encoding: 'utf8' });
const baselineData = execFileSync('git', ['show', '2f5d8fd15:unity/Assets/Exoduser/Runtime/MoodLab/MoodLabPresets.cs'], { cwd: repo, encoding: 'utf8' });
const placementLines = src => src.split(/\r?\n/).filter(s => /^\s*(?:readonly Vector3 origin|Quad\(|Place\(|Probe\(|var tree[A-B] =|cam\.transform\.|view\.orthographic =|view\.nearClipPlane =)/.test(s));
assert.deepEqual(placementLines(scene), placementLines(baselineScene), 'camera and scene placement locked to CTO HEAD');
const referenceRow = src => src.match(/new MoodLabPreset\('a'[^\r\n]+/)[0].replace(/,?\s*\/\/.*$/, '').replace(/,$/, '');
assert.equal(referenceRow(data), referenceRow(baselineData), 'a reference numbers unchanged');
assert.match(boot, /if\s*\(!MoodLabOptions\.Requested\(args\)\)\s*return;/);
assert.ok(boot.indexOf('!MoodLabOptions.Requested(args)') < boot.indexOf('SetActive(false)'));
assert.match(boot, /RuntimeInitializeLoadType.BeforeSceneLoad/);
assert.match(boot, /RuntimeInitializeLoadType.AfterSceneLoad/);
assert.ok(boot.indexOf('SetActive(false)') < boot.indexOf('MoodLabOptions.TryParse(args'));
assert.match(boot, /Path.IsPathRooted/);
assert.match(boot, /--unity-qa-sandbox/);
assert.match(boot, /--mood=/);
assert.match(boot, /Application.Quit\(2\)/);
assert.match(boot, /FindObjectsByType<NativeGame>\(FindObjectsInactive.Include/);
assert.doesNotMatch(codeOnly(boot), /if\s*\(!scene.isLoaded\)/);
assert.match(boot, /game.transform.root.gameObject.SetActive\(false\)/);
assert.match(boot, /if \(NativeGame.Instance != null \|\| lobby != 0 \|\| audio != 0 \|\| video != 0\)/);
assert.doesNotMatch(boot, /WaitForSeconds|2f\)/);
const nativeGame = readFileSync(resolve(repo,'unity/Assets/Exoduser/Runtime/NativeGame.cs'),'utf8');
assert.match(nativeGame, /void Awake\(\)\s*\{\s*Instance=this;/);
const firstPlayable = execFileSync('git',['show','HEAD:unity/Assets/Scenes/FirstPlayable.unity'],{cwd:repo,encoding:'utf8'});
assert.match(firstPlayable, /Exoduser.Runtime::Exoduser.UnityPort.NativeGame/);
assert.match(scene, /SceneManager.CreateScene\("MoodLab"\)/);
assert.match(scene, /SceneManager.SetActiveScene/);
assert.match(data, /Pitch = 34f/);
assert.match(data, /Distance = 16.5f/);
assert.match(data, /FieldOfView = 46.9453f/);

// The C# table is deliberately regular: one row per preset; no duplicate JS tuning table.
const rows = [...data.matchAll(/new MoodLabPreset\('([a-d])', "([^"]+)", ([^\r\n]+)\)\s*(?:\/\/[^\n]*)?\s*\{([\s\S]*?)\n            \}/g)];
assert.deepEqual(rows.map(r => r[1]), ['a', 'b', 'c', 'd']);
const scalar = text => Number(text.replace(/f/g, '').trim());
const colors = text => [...text.matchAll(/new Color\(([^)]+)\)/g)].map(m => m[1].split(',').map(scalar));
const pitch = 34 * Math.PI / 180;
const fov = 46.9453 * Math.PI / 180;
const probeZ = [0, 7, 12];
const steps = Number(data.match(/IntegrationSteps = (\d+)/)[1]);
assert.equal(steps, 24, 'fixed midpoint quadrature, no jitter');
const effects = rows.map(row => {
  const fields = Object.fromEntries([...row[4].matchAll(/(\w+) = (-?[\d.]+f)/g)].map(m => [m[1], scalar(m[2])]));
  assert.ok(/CX1 §/.test(row[4]) || row[1] === 'a', 'CX1 section annotations');
  return fields;
});
const smooth = (a,b,x) => { const t = Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
function extraTau(fields, z, y) {
  const start = [0, Math.sin(pitch)*16.5, -Math.cos(pitch)*16.5], end = [0,y,z];
  const length = Math.hypot(...end.map((v,i)=>v-start[i])); let sum = 0;
  for (let i=0;i<steps;i++) {
    const t=(i+.5)/steps, p=start.map((v,k)=>v+(end[k]-v)*t);
    const lateral = fields.HeightLaneFloor + (1-fields.HeightLaneFloor)*smooth(2.2,6.2,Math.abs(p[0]));
    const h = fields.HeightDensity ? fields.HeightDensity*Math.exp(-fields.HeightFalloff*Math.max(p[1]-fields.HeightBase,0))*lateral : 0;
    const qx=p[0]-6-p[1]*.3, qz=p[2]-8-p[1]*.1;
    const v = fields.VolumeDensity ? fields.VolumeDensity*(fields.VolumeFloor+(1-fields.VolumeFloor)*Math.exp(-qx*qx/16-qz*qz/64)) : 0;
    sum+=h+v;
  }
  return Math.min(fields.OpticalDepthCap || 0,sum*length/steps);
}
for (const row of rows) {
  const tail = row[3].replace(/new Color\([^)]+\)/g, 'COLOR');
  const values = tail.split(',').map(x => x.trim());
  const [key, shadow, ambient, fogStart, fogEnd, exposure, contrast, saturation] =
    [0, 2, 3, 5, 6, 8, 9, 10].map(i => scalar(values[i]));
  assert.ok(key > 0 && key <= 10 && shadow >=0 && shadow <= 1 && ambient > 0);
  assert.ok(fogStart >= 0 && fogStart < fogEnd);
  assert.ok(Number.isFinite(exposure) && contrast >= -100 && contrast <=100 && saturation >= -100 && saturation <=100);
  assert.ok(colors(row[3]).flat().every(v => Number.isFinite(v) && v >= 0 && v <= 1));
  // Conservative: linear eye-depth attenuation, not Euclidean camera distance.
  const depths = probeZ.map(z => 16.5 + Math.cos(pitch) * z - Math.sin(pitch) * .805);
  const transmission = depths.map((d,i) => Math.min(1, Math.max(0, (fogEnd - d) / (fogEnd - fogStart)))*Math.exp(-extraTau(effects[row[1].charCodeAt(0)-97],probeZ[i],.805)));
  for (const z of probeZ) {
    for (const y of [0, 1.61]) {
      const depth = 16.5 + Math.cos(pitch) * z - Math.sin(pitch) * y;
      const vertical = Math.sin(pitch) * z + Math.cos(pitch) * y;
      assert.ok(Math.abs(vertical / (depth * Math.tan(fov / 2))) < .96, 'probe inside vertical frustum');
    }
  }
  const floorT = Math.min(1,Math.max(0,(fogEnd-(16.5+Math.cos(pitch)*12))/(fogEnd-fogStart)))*Math.exp(-extraTau(effects[row[1].charCodeAt(0)-97],12,0));
  console.log(`${row[1]}: fog ${fogStart}-${fogEnd}u; center combined ${(transmission[2] * 100).toFixed(3)}%; feet ${(floorT*100).toFixed(3)}%`);
  if (transmission[2]<.83 || floorT<.83) console.log(`CTO REVIEW ${row[1]}: ${transmission[2]<.83?'center ':''}${floorT<.83?'feet ':''}<83%; no readability PASS implied`);
}
const bFields=effects[1], cFields=effects[2];
assert.ok(bFields.HeightDensity>=.020*5 && bFields.RimStrength>=.12*7.5);
assert.ok(cFields.VolumeDensity>=.0025*2 && cFields.VolumeDensity<=.0025*3);
assert.ok(cFields.Scatter>=.65*2 && cFields.Scatter<=.65*3);
assert.match(data, /24f, 43.2f/); // original 48u fog span / 2.5 = 19.2u
const tree = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', '--', 'unity/Assets/Exoduser/Resources'], { cwd: repo, encoding: 'utf8' }).split('\n');
const resources = [...scene.matchAll(/(?:Require|RequireMesh)<[^>]+>\("([^"]+)"\)/g)].map(m => m[1]);
assert.ok(resources.length >= 7, 'explicit Resources dependencies');
for (const resource of resources) {
  assert.ok(tree.some(p => p.startsWith(`unity/Assets/Exoduser/Resources/${resource}.`) && !p.endsWith('.meta')), `tracked resource: ${resource}`);
}
for (const raw of [boot, scene, data, atmosphere, shader, water]) {
  const src = codeOnly(raw);
  assert.doesNotMatch(src, /\b(?:NativeQaSandbox|PlayerPrefs|File|Directory|AssetDatabase|EditorPrefs)\s*\./);
  if(raw!==boot) assert.doesNotMatch(src,/NativeGame\s*\./);
  assert.doesNotMatch(src, /Exoduser\.UnityPort\.Core|persistentDataPath|Random\.|PerlinNoise|AddComponent<ParticleSystem>/);
}
assert.match(scene,/GameObject.CreatePrimitive\(PrimitiveType.Capsule\)/);
assert.match(scene,/new Vector3\(.64f,MoodLabPresets.ProbeHeight\*\.5f,.64f\)/);
assert.match(scene,/view.cullingMask = LayerMask/);
assert.match(scene,/extra.volumeLayerMask = LayerMask/);
assert.match(atmosphere,/go.layer = filter.gameObject.layer/);
assert.match(scene,/Require<Font>\("Art\/fonts\/NativeLobbyNotoSansKR-Regular"\)/);
assert.match(scene,/preset.Intent/);
assert.match(water,/candidate == camera/);
assert.match(water,/cam.camera != camera/);
assert.match(water,/new ShaderTagId\("ExoduserGroundWater"\)/);
assert.match(water,/MoodLabScene.LayerMask/);
assert.match(scene,/swamp.SetMatrix\("_PlanarVP"/);
assert.match(scene, /Add<FilmGrain>\(true\)\.intensity.Override\(0\)/);
assert.match(scene, /Add<Vignette>\(true\)\.intensity.Override\(0\)/);
assert.match(scene, /Add<Bloom>\(true\)\.intensity.Override\(0\)/);
assert.match(scene, /dithering = false/);
assert.match(scene, /postExposure.Override\(preset.Exposure\)/);
assert.match(scene, /fogEndDistance = preset.FogEnd/);
assert.match(atmosphere, /Resources.Load<Shader>\("MoodLab\/MoodLabAtmosphere"\)/);
assert.match(shader, /Blend One OneMinusSrcAlpha/);
assert.match(shader, /ZTest Equal/);
assert.match(shader, /for \(int s = 0; s < 24; s\+\+\)/);
assert.match(shader, /min\(_OpticalDepthCap/);
assert.doesNotMatch(codeOnly(shader), /\b(?:rand|noise|dither|jitter|InterleavedGradientNoise)\s*\(/i);
assert.match(scene, /gradingVolume.enabled = index == 3/);
assert.match(scene, /lookup.ValidateLUT\(\)/);
assert.match(scene, /TextureFormat.RGBA32, false, true/);
assert.match(scene, /whiteBalance.temperature.Override\(preset.Temperature\)/);
assert.ok(effects[1].HeightDensity>0 && effects[1].RimStrength>0 && !effects[1].VolumeDensity);
assert.ok(effects[2].VolumeDensity>0 && !effects[2].HeightDensity && !effects[2].RimStrength);
assert.ok(effects[3].LutContribution>0 && !effects[3].HeightDensity && !effects[3].VolumeDensity);
// LUT maps black/white into range, preserves monotonic channel derivatives and contains no tone mapper.
for (const name of ['LutScale','LutCross','LutLift']) assert.match(rowField('d',name), /new Vector3/);
function rowField(id, name) { return rows.find(r=>r[1]===id)[4].split('\n').find(l=>l.includes(`${name} =`)) || ''; }
const vectors = ['LutScale','LutCross','LutLift'].map(name=>rowField('d',name).match(/new Vector3\(([^)]+)\)/)[1].split(',').map(scalar));
for(let c=0;c<3;c++) assert.ok(vectors[0][c]>0 && vectors[1][c]>=0 && vectors[2][c]>=0 && vectors[0][c]+vectors[1][c]+vectors[2][c]<=1);
assert.ok(effects[3].LutCurveContrast>0 && effects[3].LutCurveContrast<1 && effects[3].LutCurveSaturation>0 && effects[3].LutCurveSaturation<=1);
const allNew = [runtime, dirname(fileURLToPath(import.meta.url)), resolve(repo,'unity/Assets/Exoduser/Resources/MoodLab')];
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
    const hits = (collision.stdout || '').trim().split('\n').filter(Boolean).map(s=>s.replace(/^HEAD:/,''));
    assert.ok(collision.status===0 || collision.status===1, 'GUID search failure');
    assert.ok(hits.every(hit=>hit===relative(repo,file).replaceAll('\\','/')), `GUID collision: ${file}`);
  }
}
assert.equal(new Set(guids).size, guids.length);
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
for (const path of untracked) {
  assert.match(path, /^unity\/Assets\/Exoduser\/(Runtime|Editor|Resources)\/MoodLab(?:\.meta|\/(?:[^/]+\.(?:cs|mjs|shader)(?:\.meta)?))$/, `new-file boundary: ${path}`);
}
const trackedChanges = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
const allowed = ['Runtime/MoodLab/MoodLabBootstrap.cs','Runtime/MoodLab/MoodLabPresets.cs','Runtime/MoodLab/MoodLabScene.cs','Runtime/MoodLab/MoodLabAtmosphere.cs','Resources/MoodLab/MoodLabAtmosphere.shader','Editor/MoodLab/verify.mjs'].map(p=>'unity/Assets/Exoduser/'+p);
assert.ok(trackedChanges.split('\n').filter(Boolean).every(p=>allowed.includes(p)), 'only explicitly authorized MoodLab edits');
console.log(`STATIC PASS: a values, camera/layout, isolation source guards, combined fog accounting, capsule/rim, water pass, LUT bounds, ${resources.length} existing Resources, GUIDs and file boundary. Unity/C#/shader compile/render UNVERIFIED.`);
console.log('프리셋 쌍별 화면 평균 차 >=15: 미측정 — PNG 없음. 이 정적 PASS는 화면 차/가독성 PASS가 아닙니다.');
console.log('Mac: node verify.mjs --png /absolute/a.png /absolute/b.png /absolute/c.png /absolute/d.png');
