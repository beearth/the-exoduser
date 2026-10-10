// Skill Forge (K 스킬 창 전면 교체, 2026-10-10)
// - socket layout: 2 = top/bottom, 3 = three ways, 4 = four ways … up to 10, evenly from the top
// - fusion staging uses the real _FUSE_PAIRS recipes (drop → exact set match → _execFuse)
// - game.html wiring (hand-off, hoisted card handlers), packaging, vendored three r186, 27-language strings
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
  vm.runInNewContext(forgeSrc,g);
  return{api:g.SkillForge,P};
}
const J=v=>JSON.parse(JSON.stringify(v));
const learn=ids=>Object.fromEntries(ids.map(id=>[id,3]));

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
