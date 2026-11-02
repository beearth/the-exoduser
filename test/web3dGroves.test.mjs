import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('authored groves connect lane shoulders without covering the protected travel spine',async()=>{
 const {groveLayout,inTravelLane}=await import('../web3d/grove-layout.mjs');
 const data=JSON.parse(fs.readFileSync(new URL('../assets/web3d/groves-ch1.json',import.meta.url)));
 const before=JSON.stringify(data),a=groveLayout(data),b=groveLayout(data);
 assert.deepEqual(a,b);assert.equal(JSON.stringify(data),before);
 assert.ok(a.length>100,'whole-stage connected shoulders');
 for(const row of a){assert.ok(row.reason&&row.region);assert.ok(!inTravelLane(row.x,row.y,data.lanes,28),'root must stay clear of travel lane');}
 assert.ok(a.some(p=>p.region==='late'&&Math.abs(p.x-4000)<1100));
});
test('ghost bark stays dark while only its coherent edge glows',async()=>{
 const {ghostMaterial}=await import('../web3d/ghost-layout.mjs');
 const body=ghostMaterial([.65,.48,.44],1,0,.5,2,0),edge=ghostMaterial([.65,.48,.44],.2,.8,.5,2,0);
 assert.ok(Math.max(...body.color)<.18);assert.ok(Math.max(...edge.color)>Math.max(...body.color)*2);
 assert.ok(body.alpha>.65,'bark silhouette must not become a smoke patch');
 assert.ok(ghostMaterial([.65,.48,.44],1,0,0,2,0).alpha<.01,'root dissolves into mist');
});
