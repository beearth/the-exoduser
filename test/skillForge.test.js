// Skill Forge (K 스킬 창 전면 교체, 2026-10-10)
// - socket layout: 2 = top/bottom, 3 = three ways, 4 = four ways … up to 10, evenly from the top
// - fusion staging uses the real _FUSE_PAIRS recipes (drop → exact set match → _execFuse)
// - game.html wiring (hand-off, hoisted card handlers), packaging, vendored three r186, 27-language strings
// - 2026-10-21 floating skill orbs (no horizontal tray): every skill once, fusion-relation currents, symmetric slots around the lowered wheel
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const gameSrc=read('game.html'),forgeSrc=read('skill-forge.js'),forge3d=read('skill-forge-3d.js'),buildSrc=read('build-nwjs.mjs');
const lit=name=>{const i=gameSrc.indexOf('const '+name+'={');assert.ok(i>=0,name);let d=0,j=gameSrc.indexOf('{',i);for(let k=j;k<gameSrc.length;k++){const c=gameSrc[k];if(c==='{')d++;else if(c==='}'&&--d===0)return vm.runInNewContext('('+gameSrc.slice(j,k+1)+')')}};
const FUSE_PAIRS=lit('_FUSE_PAIRS'),GEM=lit('_FUSE_GEM_GROUPS');

function load(state){
  const P={skills:{},_fused:{},activeLMBSk:'whirlwind',activeChargeSk:'chargeBoost',sp:999,lv:999,...state};
  const g={document:undefined,location:{search:''},console,Math,JSON,Object,Array,Set,Map,URLSearchParams,
    P,G:{mats:0},SKILL_SLOTS:[null,null,null,null,null,null],ULT_SLOT:null,SKILL_ICONS:{},SKILL_LIST:[],
    SKILL_SLOT_DEFS:{lmb:{skills:['kiSlash','whirlwind']},charge:{skills:['charge','magicBlink']}},
    _FUSE_PAIRS:FUSE_PAIRS,_FUSE_GEM_GROUPS:GEM,_DEMO_MODE:false,_DEMO_FUSE_ALLOWED:new Set(),
    _isFused:k=>!!P._fused[k],_isAbsorbed:()=>false,_canFuse:k=>!P._fused[k]&&FUSE_PAIRS[k].every(id=>(P.skills[id]||0)>=1),
    _fuseName:k=>k,_skById:()=>null,_L:(ko)=>ko,_T:s=>s,_canAssignSkillSlot:()=>true};
  g.globalThis=g;
  vm.runInNewContext(forgeSrc.replace('root.SkillForge=Object.freeze', 'root.slotPreview=typeof slotPreview===\'function\'?slotPreview:null;root.slotCondition=slotCondition;root.SkillForge=Object.freeze'),g);
  return{api:g.SkillForge,P,g};
}
const J=v=>JSON.parse(JSON.stringify(v));
const learn=ids=>Object.fromEntries(ids.map(id=>[id,3]));

test('empty dedicated slots preview real eligible skills without equipping them; costs follow live acquisition rules',()=>{
  const {api,P,g}=load({lv:1,skills:{}});
  assert.equal(typeof g.slotPreview,'function','empty dedicated slot must resolve a display-only skill preview');
  g.SKILL_LIST=[{id:'blackStar',name:'블랙',ult:true,act:true,spCost:10,matCost:100},{id:'lavaSummon',ult:true,act:true,spCost:10,matCost:100},{id:'giantSlam',act:true,cat:'rage',spCost:10,matCost:120},{id:'skyCrusher',act:true,cat:'rage',spCost:10,matCost:120}];
  g._skById=id=>g.SKILL_LIST.find(s=>s.id===id);g._malCost=n=>Math.ceil(n*.5);
  g._canAssignSkillSlot=(id,idx)=>idx===4?g._skById(id).cat==='rage':!g._skById(id).ult&&g._skById(id).cat!=='rage';
  const z=api._slots[5],space=api._slots[12],before=JSON.stringify({P,slots:g.SKILL_SLOTS,ult:g.ULT_SLOT});
  assert.equal(g.slotPreview(z),'blackStar');assert.equal(g.slotPreview(space),'giantSlam');
  assert.match(g.slotCondition(z),/SP 10.*50/s);assert.match(g.slotCondition(space),/SP 10.*60/s);
  for(const i of [1,2,3])assert.equal(g.slotPreview(api._slots[i]),null,'unassigned general skills stay empty');
  assert.equal(JSON.stringify({P,slots:g.SKILL_SLOTS,ult:g.ULT_SLOT}),before);
  P.skills.lavaSummon=1;assert.equal(g.slotPreview(z),'lavaSummon','prefer learned candidate when slot is unequipped');assert.match(g.slotCondition(z),/장착/);
  g.ULT_SLOT='blackStar';assert.equal(g.slotPreview(z),null,'equipped icon is never a preview');
  g.ULT_SLOT=null;P.skills={};g.SKILL_LIST[0].reqLv=50;g.SKILL_LIST[1].reqLv=80;assert.match(g.slotCondition(z),/Lv50/);
});

test('skill forge: E and RMB follow the actual Blade Parry and magic bindings',()=>{
  const {api}=load();
  assert.equal(api._slots.find(s=>s.k==='RMB').v,'activeMagicSk');
  assert.equal(api._slots.find(s=>s.k==='E').v,'activeRMBSk');
});

test('skill forge: intrinsic mobility and execution are inspectable, never equip candidates',()=>{
  const {api}=load();
  for(const id of ['roll','execution']){
    const i=api._slots.findIndex(s=>s.intrinsic===id);assert.ok(i>=0,id+' fixed action is visible');
    api._state.slot=i;assert.equal(api._model().host,null);
    assert.equal(api._orbItems(api._model()).size,0,'fixed action cannot be replaced');
  }
  assert.ok(api._slots.some(s=>s.k==='T'&&s.v==='activeBowSk'),'automatic crossbow is represented');
});

test('skill forge: clean checkout includes both required three r186 runtime modules',()=>{
  const dir='assets/vendor/three-r186/build/';
  for(const name of ['three.module.js','three.core.js'])assert.ok(fs.existsSync(path.join(ROOT,dir,name)),'Missing 3D runtime dependency: '+dir+name);
  assert.match(read(dir+'three.module.js'),/from ['"]\.\/three\.core\.js['"]/);
  assert.match(read(dir+'three.core.js'),/const REVISION = '186';/);
});

test('skill forge: sockets spread evenly from the top — 2 up/down, 3 three ways, 4 four ways, up to 10',()=>{
  const {api}=load();const R=100,r=v=>Math.round(v);
  assert.deepEqual(J(api._layout(2,R).map(p=>[r(p.x),r(p.y)])),[[0,-100],[0,100]]);
  assert.deepEqual(J(api._layout(4,R).map(p=>[r(p.x),r(p.y)])),[[0,-100],[100,0],[0,100],[-100,0]]);
  const t=api._layout(3,R);assert.equal(r(t[0].y),-100);assert.equal(r(t[1].y),r(t[2].y));assert.equal(r(t[1].x),-r(t[2].x));
  const ten=api._layout(10,R);assert.equal(ten.length,10);
  for(let i=1;i<10;i++){const a=Math.hypot(ten[i].x-ten[i-1].x,ten[i].y-ten[i-1].y);assert.ok(Math.abs(a-2*R*Math.sin(Math.PI/10))<1e-6,'equal spacing')}
  assert.match(forgeSrc,/const MAX_SOCKETS=10;/);
});

test('skill forge: whirlwind host — 지옥강타 1 completes 지진폭풍 (exact recipe match)',()=>{
  const {api}=load({skills:learn(['whirlwind','detonate','giantSlam','fanShot','omniBeam','elemMissile']),_fused:{whirlDet:true}});
  api._state.slot=6; // LMB
  let m=api._model();
  assert.equal(m.host,'whirlwind');assert.deepEqual(J(m.set),['whirlwind','detonate']);
  const gs=m.cands.find(c=>c.id==='giantSlam');assert.ok(gs.ok&&gs.next,'지옥강타 1 = next step (glows)');
  api._state.staged=['giantSlam'];m=api._model();assert.equal(m.ready,'slamStorm');
});

test('skill forge: a fused unit drops in whole — 추적암전 group onto 지진폭풍 = 암전나선 cross fusion',()=>{
  const {api}=load({skills:learn(['whirlwind','detonate','giantSlam','fanShot','omniBeam','elemMissile']),_fused:{whirlDet:true,slamStorm:true,sixFuse:true,elemFuse:true}});
  api._state.slot=6;
  const m0=api._model();const om=m0.cands.find(c=>c.id==='omniBeam');
  assert.ok(om&&om.ok&&om.next,'멸살광선(추적암전 묶음) completes 암전나선');
  assert.deepEqual(J([...om.unit].sort()),['elemMissile','fanShot','omniBeam']);
  api._state.staged=[...om.unit];assert.equal(api._model().ready,'stormBeam');
});

test('skill forge: chain order — 기동:기습 + 연쇄돌격 = 기동:파쇄, later steps stay dim',()=>{
  const {api}=load({skills:learn(['chargeBoost','magicBlink','chainAssault','chainSlam','chainSlash','giantSlam']),_fused:{dimBreach:true}});
  api._state.slot=8; // Shift
  const m=api._model();assert.equal(m.host,'chargeBoost');
  assert.ok(m.cands.find(c=>c.id==='chainAssault').next,'연쇄돌격 = next');
  assert.ok(!m.cands.find(c=>c.id==='chainSlam').next,'later steps are not "next"');
  api._state.staged=['chainAssault'];assert.equal(api._model().ready,'dimSlam');
  api._state.staged=['chainSlam'];assert.equal(api._model().ready,null,'skipping a step does not fuse');
});

test('skill forge: game.html hands the K panel to SkillForge and the legacy card uses the hoisted handlers',()=>{
  assert.match(gameSrc,/<link rel="stylesheet" href="skill-forge\.css\?v=[^"]+">\s*<script src="skill-forge\.js\?v=[^"]+"><\/script>/);
  assert.match(gameSrc,/function renderSkillPanel\(\)\{[\s\S]{0,900}if\(globalThis\.SkillForge&&SkillForge\.active\(\)\)\{SkillForge\.render\(\);return\}/);
  for(const f of ['function _skCtx(sk){','function _skLearnUp(sk){','function _skLevelDown(sk){','async function _skResetSkill(sk){'])assert.ok(gameSrc.includes(f),f);
  assert.match(gameSrc,/function _skClick\(\)\{_skLearnUp\(sk\)\}/);
  assert.match(gameSrc,/function _skMinusClick\(\)\{_skLevelDown\(sk\)\}/);
  assert.match(gameSrc,/_rstBtn\.onclick=async\(ev\)=>\{ev\.stopPropagation\(\);await _skResetSkill\(sk\)/);
  const ret=gameSrc.slice(gameSrc.indexOf('function _skCtx(sk){'));const r=ret.slice(ret.indexOf('    return{'),ret.indexOf('};',ret.indexOf('    return{')));
  for(const blockOnly of ['_fk2','_fIds2','_fLv2','_gemCnt'])assert.ok(!new RegExp('[{,]'+blockOnly+'[,}]').test(r+'}'),blockOnly+' is block-scoped, not returned');
  for(const need of ['learned','slv','canLearn','canUp','_isFuseUp','_fuseUpSp','_singleUpSp','_skLvLock','_skMaxLv','_fGrp'])assert.ok(new RegExp('[{,]'+need+'[,}]').test(r+'}'),need);
});

test('skill forge: packaging and the vendored three.js r186 (relative imports, r160 import map untouched)',()=>{
  assert.match(buildSrc,/'skill-forge\.css', 'skill-forge\.js', 'skill-forge-3d\.js',/);
  assert.match(forgeSrc,/import\('\.\/skill-forge-3d\.js\?v=/);
  assert.match(forge3d,/from '\.\/assets\/vendor\/three-r186\/build\/three\.module\.js'/);
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
  const files=walk(path.join(ROOT,'assets/vendor/three-r186')).filter(f=>f.endsWith('.js'));
  assert.ok(files.length>=14);
  for(const f of files)assert.ok(!/from\s*['"]three['"]/.test(fs.readFileSync(f,'utf8')),'bare three import in '+f);
  assert.match(gameSrc,/"three":"\.\/assets\/vendor\/three-r160\/build\/three\.module\.js"/,'boss 3D keeps r160');
});

test('skill forge: every new UI string is translated in all 27 language tables',()=>{
  const keys=[...forgeSrc.matchAll(/L\('((?:[^'\\]|\\.)*)','(?:[^'\\]|\\.)*'\)/g)].map(m=>m[1]).filter(k=>k.trim()&&k.trim()!=='Lv');
  const langs=fs.readdirSync(ROOT).filter(f=>/^lang_[a-z]+\.js$/.test(f));
  assert.equal(langs.length,27);
  for(const f of langs){const s=read(f);for(const k of new Set(keys))assert.ok(s.includes("'"+k.replace(/'/g,"\\'")+"'")||s.includes('"'+k+'"'),f+': '+k)}
});

test('skill forge orbs: every skill for the slot appears once — materials + equip candidates merged, host equipped = "on"',()=>{
  const {api}=load({skills:learn(['whirlwind','kiSlash','detonate','giantSlam','fanShot','omniBeam','elemMissile','burstLoop']),_fused:{whirlDet:true}});
  api._state.slot=6; // LMB (host 회전참, 회전기폭 완성)
  const m=api._model(),items=api._orbItems(m),ids=[...items.keys()];
  assert.equal(new Set(ids).size,ids.length,'no duplicate orbs');
  for(const id of ['kiSlash','whirlwind','giantSlam','fanShot','omniBeam','elemMissile','burstLoop'])assert.ok(items.has(id),id+' shown');
  assert.ok(!items.has('detonate'),'already bound in the altar set (회전기폭) — not a loose orb');
  assert.ok(items.get('whirlwind').cls.includes('on'),'equipped host is marked');
  assert.ok(items.get('giantSlam').cls.includes('glow')&&items.get('giantSlam').role==='mat','지옥강타 1 = next material (glows, drag to altar)');
  assert.equal(items.get('kiSlash').role,'equip');
});

test('skill forge orbs: currents — materials flow into the core, other fusion pairs link orbs, never the wheel host twice',()=>{
  const {api}=load({skills:learn(['whirlwind','kiSlash','detonate','giantSlam','fanShot','omniBeam','elemMissile','burstLoop']),_fused:{whirlDet:true}});
  api._state.slot=6;
  const m=api._model(),items=api._orbItems(m),edges=J(api._orbEdges(m,items));
  const core=edges.filter(e=>e.core).map(e=>e.a).sort(),mats=[...items.values()].filter(i=>i.mat).map(i=>i.id).sort();
  assert.deepEqual(core,mats,'one core current per material');
  assert.ok(edges.filter(e=>e.core).find(e=>e.a==='giantSlam').str>.5,'next material = strong current');
  const pairs=edges.filter(e=>!e.core).map(e=>[e.a,e.b].sort().join('+'));
  assert.ok(pairs.includes('fanShot+omniBeam'),'추적암전 pair (만화방창+멸살광선)');
  assert.ok(pairs.includes('elemMissile+omniBeam'),'원소추적탄 joins via 멸살광선 (elemFuse host override)');
  assert.ok(edges.every(e=>e.core||(e.a!=='whirlwind'&&e.b!=='whirlwind')),'wheel host only through the core');
  assert.equal(new Set(pairs).size,pairs.length,'no duplicate pair lines');
});

test('skill forge orbs: slots around the lowered wheel are mirror-symmetric and never touch the disc or the edges',()=>{
  const {api}=load();
  const g={cx:560,cy:400,discR:200,W:1120,H:650},o=52;
  const s=api._orbSlots(o,g,[]);
  assert.ok(s.L.length>=10&&s.L.length===s.R.length,'left/right capacity equal');
  const key=p=>Math.round(p.x)+','+Math.round(p.y),mirror=new Set(s.R.map(p=>Math.round(2*g.cx-p.x)+','+Math.round(p.y)));
  for(const p of s.L)assert.ok(mirror.has(key(p)),'mirror of '+key(p));
  for(const p of [...s.L,...s.R,...s.M]){
    assert.ok(Math.hypot(p.x-g.cx,p.y-g.cy)>=g.discR+o/2+12-1e-6,'clear of the disc');
    assert.ok(p.x-s.Lw/2>=2&&p.x+s.Lw/2<=g.W-2&&p.y-o/2-14>=2&&p.y+o/2+32<=g.H-2,'inside the altar incl. label');
  }
  // reserved plates (모체 명패 / 넣을 수 있는 스킬 명패 / 안내 띠) are avoided
  const plate={l:0,t:0,r:300,b:90};const s2=api._orbSlots(o,g,[plate]);
  assert.ok(s2.L.every(p=>!(p.x-s2.Lw/2<plate.r&&p.x+s2.Lw/2>plate.l&&p.y-o/2-14<plate.b&&p.y+o/2+32>plate.t)));
  // compact labels (one line) pack more rows
  const c=api._orbSlots(o,g,[],1,true);assert.ok(c.L.length>s.L.length);
  // a wider spread factor gives fewer, roomier slots
  assert.ok(api._orbSlots(o,g,[],1.4).L.length<s.L.length);
});

test('skill forge orbs: no horizontal tray, one rAF loop that stops when the panel closes, reduced motion respected',()=>{
  const css=read('skill-forge.css');
  assert.ok(!/sf-tray|sf-chip/.test(forgeSrc+css),'tray/chip markup and styles removed');
  assert.match(forgeSrc,/fx\.raf=0;if\(!el\|\|!el\.isConnected\|\|!isOpen\(\)\)return;/);
  assert.match(forgeSrc,/prefers-reduced-motion: reduce/);
  assert.match(forgeSrc,/_close\(\)\{if\(three\)three\.pause\(\);fxStop\(\)\}/);
  assert.match(css,/canvas\.sf-bolts\{[^}]*position:absolute!important/,'game-wide fixed canvas rule overridden');
  assert.match(gameSrc,/skill-forge\.css\?v=20261031-fixed-layout\d+/);
});

test('skill forge orbs (2nd pass): slot spacing leaves room for the floating drift — orbs never touch even at full amplitude',()=>{
  const {api}=load();
  for(const [o,compact] of [[57,false],[42,false],[31,true]]){
    const g={cx:560,cy:400,discR:200,W:1120,H:650},s=api._orbSlots(o,g,[],1,compact),pts=[...s.L,...s.R,...s.M];
    const A=Math.min(1,Math.max(.5,o/52)),drift=Math.hypot(7*A,9*A+1.2*A)*1.02; // 타원 가로 4~7·세로 5~9 + 숨 1.2 (×크기 숨 1.8%)
    let min=1e9;for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)min=Math.min(min,Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y));
    assert.ok(min>=o*1.02+2*drift,'o='+o+' min gap '+min.toFixed(1));
    assert.ok(s.lg>=Math.round(10.2*A),'label sits below the lowest drift ('+s.lg+'px)');
  }
});

test('skill forge orbs (2nd pass): relation currents re-roll their bolt path every 0.07~0.15s, host tag is fixed text, unlearned has no repeated label',()=>{
  const m=forgeSrc.match(/const STY=\{([\s\S]*?)\};/);assert.ok(m,'STY table');
  for(const k of ['strong','mid','faint']){const r=new RegExp(k+':\\{[^}]*re:\\[([\\d.]+),([\\d.]+)\\]').exec(m[1]);assert.ok(r,k);assert.ok(+r[1]>=.07&&+r[2]<=.15,k+' regen '+r[1]+'~'+r[2])}
  assert.match(m[1],/mid:\{[^}]*br:\.4[^}]*pulse:2/,'resting relation current: branches + two flowing pulses');
  assert.match(forgeSrc,/ember:\['150,38,18','214,120,60','255,216,168'\]/,'ember palette (no neon/cyan)');
  assert.ok(!/\d{1,3},\s*2[0-5]\d,\s*2[0-5]\d'/.test(m[1]),'no cyan triplets in styles');
  assert.match(forgeSrc,/mk\('span','sf-orb-host',sr,L\('모체','Host'\)\)/,'모체 = label line (does not float)');
  {const rf=forgeSrc.slice(forgeSrc.indexOf('function renderField('),forgeSrc.indexOf('function routeEdges('));assert.ok(rf.length>500&&!/sf-crown/.test(rf),'no floating crown on orbs (wheel sockets keep theirs)')}
  assert.match(forgeSrc,/const sub=it\.sealed\?'':it\.badge\|\|\(l\?\('Lv '\+l\):''\);/,'「미습득」 not repeated under every orb (tooltip only)');
  assert.match(forgeSrc,/function routeEdges\(g\)/,'relation curves are routed around name tags');
  assert.match(forgeSrc,/n\.title=L\('제단에 넣기','Place on altar'\)/,'empty socket explains itself with an existing string');
});
