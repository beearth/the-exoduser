// H1 gate: opt-in additions must leave the complete legacy files byte-identical.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const baseline = '75add6ff4a6209e2590a7a626ffb4c37b5f0268e';
const owners = ['NativeHud.cs', 'NativeHudSkills.cs'];
const checks = [];
for (const name of owners) {
  const file = 'unity/Assets/Exoduser/Runtime/' + name;
  const original = cp.execFileSync('git', ['show', baseline + ':' + file], {cwd:root,maxBuffer:16*1024*1024}).toString('utf8');
  const current = fs.readFileSync(path.join(root,file),'utf8');
  const hooks = [...current.matchAll(/\/\* H1 opt-in \*\/([\s\S]*?)\/\* H1 end \*\//g)];
  assert.equal(hooks.length, name === 'NativeHud.cs' ? 2 : 1, name + ': only draw/dispose or pointer hook');
  for (const hook of hooks) {
    assert(!/[\r\n]/.test(hook[0]), name+': insertion must preserve prior line ends');
    assert(/Prototype/.test(hook[1]), name+': hook must target the opt-in implementation');
  }
  const stripped = current.replace(/\/\* H1 opt-in \*\/[\s\S]*?\/\* H1 end \*\//g,'');
  // Baseline checkout was verified byte-identical to Git (LF, zero CR in both files).
  assert.equal(stripped, original,name+': all legacy bytes retained');
  const lines = current.split('\n');
  const cr = lines.slice(0,-1).filter(x=>x.endsWith('\r')).length;
  const oldCr = original.split('\n').slice(0,-1).filter(x=>x.endsWith('\r')).length;
  assert.equal(cr,oldCr,name+': prior CR count unchanged');
  assert.equal(lines.length,original.split('\n').length,name+': no legacy line shifts');
  checks.push({file,hooks:hooks.length,legacyLines:lines.length,gitCr:oldCr,checkoutCr:cr});
}
for (const file of ['NativeHudDockLayout.cs','NativeGame.cs','NativeHudPresentation.cs']) {
  const p='unity/Assets/Exoduser/Runtime/'+file;
  const old=cp.execFileSync('git',['show',baseline+':'+p],{cwd:root,maxBuffer:16*1024*1024}).toString('utf8');
  assert.equal(fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n'),old.replace(/\r\n/g,'\n'),file+': default layout/callsite untouched');
}
const shader='unity/Assets/Exoduser/Resources/Shaders/HudOrb.shader';
assert.equal(fs.readFileSync(path.join(root,shader),'utf8').replace(/\r\n/g,'\n'),cp.execFileSync('git',['show',baseline+':'+shader],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n'));
console.log(JSON.stringify({scope:'Full legacy source equality after removing only three opt-in additions; shader/default layout untouched. Argument behavior covered by Program.cs.',baseline,passed:true,checks},null,2));
