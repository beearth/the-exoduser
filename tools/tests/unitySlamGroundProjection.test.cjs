// Source-contract regression only; actual terrain/bridge/water coverage needs Mac GPU QA.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const view=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeSkillView.cs'),'utf8');
const web=cp.execFileSync('C:/Program Files/Git/mingw64/bin/git.exe',['-C',root,'show','origin/main:game.html'],{encoding:'utf8',windowsHide:true,maxBuffer:12*1024*1024});
const wave=view.slice(view.indexOf('// ---- giant slam waves ----'),view.indexOf('// ---- ice blades ----'));
test('both slam layers enter the actual receiver-depth route before billboard placement',()=>{
  const creation=wave.slice(wave.indexOf('if (!waves.TryGetValue'),wave.indexOf('ActiveWaves++'));
  for(const renderer of ['it.a','it.b'])assert.match(creation,new RegExp('NativeGroundSkillSurface\\.Mark\\('+renderer.replace('.','\\.')+'\\s*[,)]'),renderer+' is still a centered, depth-tested billboard: its lower half intersects the receiving surface');
  const placement=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs'),'utf8');
  assert.ok(placement.indexOf('NativeGroundSkillSurface.Project(sr)')<placement.indexOf('float below ='),'receiver projection must bypass the actor billboard transform');
});
test('all 45 live ticks retain the latest web frame, growth and fade sequence',()=>{
  const native=wave.match(/int frame = Mathf.Min\(3, Mathf.FloorToInt\((.*?)\)\);/)[1];
  const reference=web.match(/const _slamFrame=Math.min\(3,~~\((.*?)\)\);/)[1];
  const evaluate=(expression,progress)=>Function('Mathf','Math','wp','_wP','return '+expression.replace(/(\d)f\b/g,'$1'))({Pow:Math.pow},Math,progress,progress);
  const ticks=[0,0,0,0];
  for(let t=0;t<45;t++){
    const frame=Math.min(3,Math.floor(evaluate(native,t/45)));
    assert.equal(frame,Math.min(3,Math.trunc(evaluate(reference,t/45))),'frame tick '+t);ticks[frame]++;
  }
  assert.ok(ticks.every(n=>n>0));
  assert.match(wave,/wp < \.62f \? 1f : Mathf.Max\(0, \(1 - wp\) \/ \.38f\)/);
  assert.match(web,/_slamAlpha=_wP<\.62\?1:Math.max\(0,\(1-_wP\)\/\.38\)/);
  assert.match(wave,/\.72f \+ \.28f \* Mathf.Min\(1, wp \* 3\.5f\)/);
  const rules=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Runtime/Core/Skills/SkillRules.cs'),'utf8');
  assert.match(rules,/GiantSlamWaveMaxT = 45/);
  console.log('web/native frame tick counts '+JSON.stringify(ticks)+'; 45 ticks = 0.75 seconds at 60 Hz');
});
test('source art keeps all four complete 512px cells without a reduced sprite mesh',()=>{
  const image=fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Art/vfx/skill_inferno_slam_sheet.png'));
  assert.equal(image.readUInt32BE(16),1024);assert.equal(image.readUInt32BE(20),1024);
  assert.match(view,/i < 4; i\+\+\).*?new Rect\(i % 2 \* hw, slam.height - \(i \/ 2 \+ 1\) \* hh, hw, hh\).*?SpriteMeshType.FullRect/);
});
