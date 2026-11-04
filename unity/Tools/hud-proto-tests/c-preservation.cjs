'use strict';
// H4/H5: source preservation is a code-path gate, not a rendered-pixel claim.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const baseline = 'c1b51cda503d1de1ef3ae2c828309e7c27d539f7';
const retouchBase = '3a13dc0d46d22a19e1f0640d7689914df99569c4';
const runtime = 'unity/Assets/Exoduser/Runtime/';
const shaders = 'unity/Assets/Exoduser/Resources/Shaders/';
const old = p => cp.execFileSync('git', ['show', baseline + ':' + p], {cwd:root, maxBuffer:16*1024*1024, windowsHide:true});
const now = p => fs.readFileSync(path.join(root, p));
let checks = 0;
function check(x, message) { checks++; assert(x, message); }
const layout = now(runtime + 'NativeHudPrototypeLayout.cs').toString('utf8');
check(/HudPrototypeMode\.C/.test(layout), 'C must exist (expected RED before H4 implementation)');
for (const p of [
  runtime+'NativeHud.cs', runtime+'NativeHudSkills.cs', runtime+'NativeHudDockLayout.cs',
  runtime+'NativeHudPresentation.cs', runtime+'NativeGame.cs',
  runtime+'NativeHudPrototypeArt.cs', runtime+'NativeHudPrototypeTextShadow.cs',
  shaders+'HudOrb.shader', shaders+'HudPrototype.shader', shaders+'HudPrototypeTextShadow.shader',
  'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_hp.png',
  'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_hp.png.meta',
  'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_mp.png',
  'unity/Assets/Exoduser/Resources/Art/ui/ui_globe_mp.png.meta',
  'unity/Assets/Exoduser/Resources/Art/ui/ui_bar_only.png',
  'unity/Assets/Exoduser/Resources/Art/ui/ui_bar_only.png.meta'
]) check(now(p).equals(old(p)), p + ': legacy/A/B resources and sources retained byte-for-byte');
const protoPath = runtime+'NativeHud.Prototype.cs';
const proto = now(protoPath).toString('utf8');
for (const p of [protoPath, 'unity/ProjectSettings/ProjectSettings.asset']) {
  const before = cp.execFileSync('git', ['show', retouchBase + ':' + p], {cwd:root, maxBuffer:16*1024*1024, windowsHide:true});
  check(now(p).equals(before), p + ': H5 retains the entire shared dispatcher and global color settings');
}
const hooks = [...proto.matchAll(/\/\* H4 C begin \*\/([\s\S]*?)\/\* H4 C end \*\//g)];
check(hooks.length > 0, 'C integration has explicit isolated additions');
check(proto.replace(/\/\* H4 C begin \*\/[\s\S]*?\/\* H4 C end \*\//g, '') === old(protoPath).toString('utf8'),
  'removing only C additions restores the entire H1 renderer including every A/B method');
const gate = 'if(NativeHudPrototypeLayout.CurrentMode==HudPrototypeMode.None)return false;';
const start = proto.indexOf('bool TryDrawPrototype('), end = proto.indexOf('void PrototypeGlobe(', start);
const draw = proto.slice(start, end);
check(draw.indexOf(gate) >= 0 && draw.indexOf(gate) < draw.indexOf('TryDrawPrototypeC('), 'None exits before C initialization');
check(/if\(NativeHudPrototypeLayout\.CurrentMode==HudPrototypeMode\.C\)return TryDrawPrototypeC\(/.test(draw),
  'only explicit C mode dispatches to C rendering; A/B fall through unchanged');
check(/if\(NativeHudPrototypeLayout\.CurrentMode==HudPrototypeMode\.C\)DisposePrototypeC\(\);/.test(proto),
  'None/A/B never invoke C cleanup; the readonly C mode also covers partial initialization');
const abStart = 'Mode=mode;bool b=mode==HudPrototypeMode.B;';
const abEnd = 'public HudProtoRect Slot(int index)';
function abBody(s) { const i=s.indexOf(abStart), j=s.indexOf(abEnd, i); assert(i>=0&&j>i); return s.slice(i,j); }
check(abBody(layout) === abBody(old(runtime+'NativeHudPrototypeLayout.cs').toString('utf8')),
  'entire original A/B layout constructor arithmetic is unchanged');
console.log(JSON.stringify({scope:'No-argument and A/B source-path preservation (not pixel validation)', baseline, retouchBase, checks, passed:true},null,2));
