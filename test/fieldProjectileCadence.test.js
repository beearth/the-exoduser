import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const from=html.indexOf('if(!window._noProjEtypes)'),to=html.indexOf('// GPU 텍스처 프리핀',from);
const init=html.slice(from,to);
const objFrom=html.indexOf('{',html.indexOf('const _e={',to));
const obj=parseExpressionAt(html,objFrom,{ecmaVersion:'latest'});
const initialFields=obj.properties.filter(p=>['projT','_firstShot'].includes(p.key.name)).map(p=>html.slice(p.start,p.end)).join(',');
function spawn(ib=false,etype=0,elite=0,mods=[],random=.5){
  const m=Object.create(Math);m.random=()=>random;
  const s={ib,etype,elite,mods,Math:m};s.window=s;
  return vm.runInNewContext(init+';({projCd:_projCd,'+initialFields+'})',s);
}
function extract(marker){const at=html.indexOf('function',html.indexOf(marker));return html.slice(at,parseExpressionAt(html,at,{ecmaVersion:'latest'}).end);}

test('field monsters use a 240-frame recovery without an extra opening shot',()=>{
  const e=spawn();assert.equal(e.projCd,240);assert.equal(e.projT,240);assert.equal(e._firstShot,false);
});
test('opening field shot timing spreads across 180 to less than 300 frames',()=>{
  assert.equal(spawn(false,1,0,[],0).projT,180);
  assert.ok(spawn(false,1,0,[],.99999).projT<300);
  assert.ok(spawn(false,1,0,[],.99999).projT>299);
});
test('boss cadence and dedicated-AI exclusions retain their existing values',()=>{
  const b=spawn(true);assert.equal(b.projCd,50);assert.equal(b.projT,95);assert.equal(b._firstShot,false);
  for(const type of [5,9,11,20,24,50,59])assert.equal(spawn(false,type).projCd,9999);
});
test('elite and M02 multipliers apply to the new field cooldown',()=>{
  assert.equal(spawn(false,0,1).projCd,192);
  assert.equal(spawn(false,0,2).projCd,168);
  assert.equal(spawn(false,0,3).projCd,144);
  assert.equal(spawn(false,0,1,['M02']).projCd,163);
});
test('40 independent field shooters emit at most 160 basic shots over 20 seconds',()=>{
  const start=html.indexOf('if(e.projCd<9000){'),end=html.indexOf('}break}',start);
  const ranged=html.slice(start,end+1),shots=[];
  const s={P:{x:0,y:0},ETYPE_RANGE:[400],EL:{P:0,F:1,I:2},ELC:['white','red','blue'],spawnProj:p=>shots.push(p),addParts(){}};
  vm.createContext(s);vm.runInContext(extract('function _cancelProjCharge(')+extract('function _fireChargedProj(')+extract('function _tickProjCharge(')+`function step(e){const sp=1,d=100;_tickProjCharge(e,sp);${ranged}}`,s);
  const enemies=Array.from({length:40},(_,i)=>({...spawn(false,0,0,[],i/40),x:100,y:0,atk:20,el:0,col:'white',etype:0,elite:0}));
  for(let f=0;f<1200;f++)for(const e of enemies)s.step(e);
  assert.ok(shots.length>120&&shots.length<=160,`basic shots=${shots.length}`);
  assert.ok(shots.every(p=>p._commit===true),'completed charge shots must remain guaranteed');
});
