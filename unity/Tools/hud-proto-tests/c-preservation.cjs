'use strict';
// H4/H5/H6: source preservation is a code-path gate, not a rendered-pixel claim.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const baseline = 'c1b51cda503d1de1ef3ae2c828309e7c27d539f7';
const retouchBase = '3a13dc0d46d22a19e1f0640d7689914df99569c4';
const boundaryBase = 'e708a10704211f7072b6480db3a069f2198a6667';
const runtime = 'unity/Assets/Exoduser/Runtime/';
const shaders = 'unity/Assets/Exoduser/Resources/Shaders/';
const old = p => cp.execFileSync('git', ['show', baseline + ':' + p], {cwd:root, maxBuffer:16*1024*1024, windowsHide:true});
const h5 = p => cp.execFileSync('git', ['show', boundaryBase + ':' + p], {cwd:root, maxBuffer:16*1024*1024, windowsHide:true});
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
for (const p of [protoPath, runtime+'NativeHudPrototypeLayout.cs', 'unity/ProjectSettings/ProjectSettings.asset'])
  check(now(p).equals(h5(p)), p + ': H6 retains shared routing, every C/A/B coordinate and global color settings');
function method(s,name) {
  const i=s.indexOf(' '+name+'('), open=s.indexOf('{',i);assert(i>=0&&open>i,'method '+name);
  let end=open+1,depth=1;for(;depth&&end<s.length;end++){if(s[end]==='{')depth++;if(s[end]==='}')depth--;}
  assert(depth===0,'balanced '+name);return s.slice(i,end);
}
for (const [p,names] of [
  [shaders+'HudPrototypeC.shader',['linearChannel','outputColor','silver','matteAlpha','mpGradient','stGradient','surfaceCoverage']],
  [runtime+'NativeHud.PrototypeC.cs',['PrototypeCTarget','PrototypeCArtTarget','PrototypeCBlit','RefreshPrototypeCLiquids','PrototypeCGlobe']],
  [runtime+'NativeHudPrototypeCArt.cs',['Silver','Cover','Bake','Rail']]
]) for (const name of names) check(method(now(p).toString('utf8'),name)===method(h5(p).toString('utf8'),name),
  'H6 retains accepted H5 '+name+' implementation');
const artNow=now(runtime+'NativeHudPrototypeCArt.cs').toString('utf8'),artH5=h5(runtime+'NativeHudPrototypeCArt.cs').toString('utf8');
for(const name of ['PlateTopAlpha','PlateBottomAlpha','SupportInteriorAlpha','RailStrokeHeight','EdgeAlpha']) {
  const pattern=new RegExp('\\b'+name+'=([.\\d]+f)');
  check(artNow.match(pattern)?.[1]===artH5.match(pattern)?.[1], 'H6 retains accepted '+name);
}
console.log(JSON.stringify({scope:'No-argument/A/B paths and accepted H5 features (not pixel validation)', baseline, retouchBase, boundaryBase, checks, passed:true},null,2));
