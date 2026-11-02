import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const data=()=>JSON.parse(fs.readFileSync(new URL('../web3d/ground-dressing-ch1.json',import.meta.url)));
test('authored ground dressing preserves combat exclusions and is visual-only',async()=>{
 const {dressingLayout}=await import('../web3d/ground-dressing.mjs');const d=data(),copy=JSON.stringify(d),rows=dressingLayout(d);
 assert.ok(rows.length>60);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);assert.equal(JSON.stringify(d),copy);assert.deepEqual(rows,dressingLayout(d));
 for(const r of rows){assert.equal(r.collision,undefined);assert.ok(r.width>0&&r.height>0);for(const z of d.exclusions){const [x0,y0,x1,y1]=z.rect;assert.ok(r.x+r.width/2<=x0||r.x-r.width/2>=x1||r.y+r.height/2<=y0||r.y-r.height/2>=y1,r.id+' crosses '+z.id);}}
});
test('ground dressing is culled against the actual wide viewport',async()=>{
 const {visibleDressing}=await import('../web3d/ground-dressing.mjs');const r={x:2600,y:7400,width:200,height:100};assert.equal(visibleDressing(r,{x:3060,y:6880,w:1920,h:1080}),false);assert.equal(visibleDressing(r,{x:2100,y:6880,w:3840,h:1080}),true);
});
