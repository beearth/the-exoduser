// Root supplement: execute current source slices; the frame/death driver is a fixture.
// No game, browser, server, production-file mutation or full-render assertion.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const source = fs.readFileSync(root+'game.html','utf8');
const patch = fs.readFileSync(root+'tools/team-followup-20261001/ANIMVFX/corpse-flash-minimal.patch','utf8');
const sha = s=>crypto.createHash('sha256').update(s).digest('hex');
function one(re) { const a=[...source.matchAll(re)]; assert.equal(a.length,1,String(re));return a[0][0]; }
const slices = {
  revive: one(/  if\(e\.etype===9&&e\.s==='idle'\)\{[\s\S]*?(?=  \/\/ ═══ 10:)/g),
  rebuild: one(/function rebuildDeadPool\(\)\{[^\n]+/g),
  cadence: one(/  if\(!G\._shT\)G\._shT=0;[^\n]+/g),
  decay: one(/if\(e\._hitFlash>0\)e\._hitFlash=Math\.max\(0,e\._hitFlash-sp\);/g),
  death: one(/if\(e\._hitFlash\)e\._hitFlash=0;/g),
  gate2d: one(/if\(e\._hitFlash > 0 && !_ensGLQueued\)/g),
  gateGL: one(/if\(!e\|\|!e\.alive\|\|!\(e\._hitFlash>0\)\|\|e\._ensGLMode!==1\)continue;/g)
};
const removed=patch.split('\n').filter(l=>l.startsWith('-')&&!l.startsWith('---')).map(l=>l.slice(1));
const added=patch.split('\n').filter(l=>l.startsWith('+')&&!l.startsWith('+++')).map(l=>l.slice(1));
assert.equal(removed.length,1);assert.equal(added.length,1);
assert.equal(added[0],removed[0]+' corpse._hitFlash=0;');
assert.ok(slices.revive.includes(removed[0]));
const patched=slices.revive.replace(removed[0],added[0]);
assert.ok(source.indexOf(slices.cadence)<source.indexOf(slices.decay));
assert.match(source.slice(source.indexOf(slices.decay)-5000,source.indexOf(slices.decay)),/if\(e\.alive\)/);
assert.match(source,/while\(_acc>=PHYS_STEP\)\{[\s\S]{0,800}update\(\)/);
const gate2d = new Function('e','_ensGLQueued',slices.gate2d+' return true; return false;');
const gateGL = new Function('e',slices.gateGL.replace('continue;','return false;')+'return true;');
const decay = new Function('e','sp',slices.decay);
const death = new Function('e',slices.death);
function run(patchedFlag,catchup) {
  const victim={alive:true,etype:3,x:100,y:100,mhp:201,hp:201,maxPoise:8,poise:3,_hitFlash:0,_ensGLMode:1};
  const shaman={alive:true,etype:9,s:'idle',x:150,y:100,reviveT:catchup?2:4,reviveCd:300,_hitFlash:0};
  const ens=[victim,shaman], dead=[], G={}, calls=[];
  const rebuilt=new Function('ens','_deadPool',slices.rebuild+';return rebuildDeadPool;')(ens,dead);
  const cadence=new Function('G','performance','shRebuild','rebuildDeadPool','_DEBUG_PERF',slices.cadence);
  const revive=new Function('e','sp','_deadPool','dst','_reviveVFX','addTxt','addParts','_T','d','canMv',patchedFlag?patched:slices.revive);
  const spy=n=>(...args)=>calls.push([n,args]);
  let tick=0;const gates=[];
  const counts=catchup?[5,...Array(8).fill(1)]:Array(10).fill(1);
  for(const ticks of counts) {
    for(let j=0;j<ticks;j++) {
      tick++;cadence(G,{now:()=>0},()=>{},rebuilt,false);
      // Scripted combat death, explicitly outside extracted source.
      if(tick===1){victim._hitFlash=6;victim.alive=false;victim.hp=0;}
      for(const e of ens)if(e.alive){
        decay(e,1);
        revive(e,1,dead,(x,y,a,b)=>Math.hypot(x-a,y-b),spy('_reviveVFX'),spy('addTxt'),spy('addParts'),s=>s,200,()=>true);
      }
    }
    if(!victim.alive)death(victim);
    gates.push({twoD:victim.alive&&gate2d(victim,false),gl:gateGL(victim)});
  }
  return {victim,shaman,calls,gates};
}
const results={};let checks=0;
function check(f){f();checks++;}
for(const catchup of [true,false]) {
  const before=run(false,catchup),after=run(true,catchup);
  for(const key of ['twoD','gl'])check(()=>{
    assert.equal(before.gates.some(g=>g[key]),catchup);
    assert.equal(after.gates.some(g=>g[key]),false);
  });
  check(()=>assert.deepEqual(before.calls,after.calls));
  check(()=>assert.deepEqual(before.victim,after.victim));
  check(()=>assert.deepEqual(before.shaman,after.shaman));
  check(()=>assert.deepEqual(before.calls.map(c=>c[0]),['_reviveVFX','addTxt','addParts']));
  results[catchup?'catchup':'normal']={beforeGates:before.gates,afterGates:after.gates,calls:before.calls};
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),checks,pass:true,sourceSha256:sha(source),slices:Object.fromEntries(Object.entries(slices).map(([k,v])=>[k,{sha256:sha(v),source:v}])),results,limits:['Frame ordering and combat death are fixture-driven; extracted cadence, decay, revive block, death reset and draw eligibility expressions execute verbatim.','No pixel render, complete update loop, actual RNG or rewards helper internals executed. Identical helper arguments/call counts plus pure assignment patch do not prove full runtime equivalence.','Not a production adoption or live performance measurement.']},null,2));
