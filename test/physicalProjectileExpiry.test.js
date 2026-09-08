import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const cs=html.indexOf('function _projectileParryClass(p){');
const classifier=html.slice(cs,html.indexOf('function _isEnemyMagicBullet(',cs));
const es=html.indexOf('if(!_dead&&p.life<=0){');
const expiry=html.slice(es,html.indexOf('// 히트 임팩트 이펙트 (투사체 소멸 시)',es));
assert.ok(cs>=0&&es>=0);
function expire(props){
 const booms=[],parts=[],impacts=[],shakes=[];
 const p={x:10,y:20,vx:5,vy:0,life:0,redBean:true,el:0,...props};
 const context=vm.createContext({p,_dead:false,EL:{P:0,F:1,I:2,D:3,L:4,H:5,E:6},G:{cam:{x:0,y:0}},Math,
  _addBoom:(...a)=>booms.push(a),addParts:(...a)=>parts.push(a),_addImpact:(...a)=>impacts.push(a),shake:a=>shakes.push(a)});
 vm.runInContext(classifier+expiry,context);
 return {p,dead:context._dead,booms,parts,impacts,shakes};
}

test('physical mouth and titan projectiles expire with the assigned white impact',()=>{
 for(const props of [{el:0},{el:1,titanEye:true},{el:1,parryClass:'physical'}]){
  const r=expire(props);
  assert.equal(r.dead,true);
  assert.deepEqual(r.booms,[[10,20,60,12,'physical']]);
  assert.deepEqual(r.parts,[[10,20,'#ffffff',12]]);
  assert.deepEqual(r.impacts,[],'do not stack a fire/explosion impact on the white burst');
  assert.deepEqual(r.shakes,[3]);
 }
});

test('fire magic still expires with its existing red fire effect',()=>{
 const r=expire({el:1,parryClass:'magic'});
 assert.equal(r.dead,true);
 assert.deepEqual(r.booms,[[10,20,40,72,'redbean']]);
 assert.deepEqual(r.parts,[[10,20,'#ff2200',12]]);
 assert.equal(r.impacts[0][4],'explosion');
});

test('expiry does not change living projectiles or forced silent removal',()=>{
 const live=expire({life:1});assert.equal(live.dead,false);assert.equal(live.booms.length,0);
 const forced=expire({life:-999});assert.equal(forced.dead,true);assert.equal(forced.booms.length,0);
});

test('non-red projectiles keep their existing lifetime renewal',()=>{
 const r=expire({redBean:false,el:0,pierce:true});
 assert.equal(r.dead,false);assert.equal(r.p.life,1);assert.equal(r.booms.length,0);
});
