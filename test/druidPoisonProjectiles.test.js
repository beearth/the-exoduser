import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
test('only druid-owned projectiles receive poison metadata',()=>{
 const start=html.indexOf('function _spawnBossProjectile(');
 assert.ok(start>=0,'missing owner-aware projectile path');
 const end=html.indexOf('\nfunction ',start+10);
 for(const stage of [0,3,4])for(const ib of [false,true]){
  const ctx=vm.createContext({G:{stage},spawnProj:p=>p});
  vm.runInContext(html.slice(start,end),ctx);
  const p=ctx._spawnBossProjectile({ib},{x:0,y:0});
  assert.equal(p._druidPoison,ib&&(stage===0||stage===3));
 }
});
