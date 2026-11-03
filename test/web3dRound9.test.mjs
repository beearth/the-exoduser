import test from 'node:test';import assert from 'node:assert/strict';
test('spatial relighting preserves area chroma under unequal light and avoids channel clipping',async()=>{const {relightPaint}=await import('../web3d/scene-lighting-model.mjs');const rows=[[.1,.13,.16],[.3,.2,.1],[.05,.1,.04]];for(const [i,a]of rows.entries()){const b=relightPaint(a,[.8,.01,.4][i]);assert.ok(b.every(v=>v>=0&&v<=1));assert.ok(Math.abs((a[0]-a[1])-(b[0]-b[1]))<1e-12);assert.ok(Math.abs((a[2]-a[1])-(b[2]-b[1]))<1e-12);}});
test('moon key separates a canopy opening from the shaded side while protecting painted hue',async()=>{
 const {sceneExposure,keepHue}=await import('../web3d/scene-lighting-model.mjs');
 assert.ok(sceneExposure(1,0,0,0)>sceneExposure(0,0,0,0)*2);
 const hue=a=>{const hi=Math.max(...a),lo=Math.min(...a),d=hi-lo,j=a.indexOf(hi);return ((d?(j===0?(a[1]-a[2])/d:j===1?2+(a[2]-a[0])/d:4+(a[0]-a[1])/d)*60:0)+360)%360;};
 for(const a of [[.1,.18,.04],[.18,.05,.22],[.12,.13,.16],[.3,.12,.08]])for(const b of [[.9,.4,.06],[.1,.3,.8]]){const c=keepHue(a,b,12),d=Math.abs(hue(a)-hue(c));assert.ok(Math.min(d,360-d)<=12.001);}
});
test('directional prop shadows pin their root and extend southeast, away from the northwest key',async()=>{
 const {projectShadow}=await import('../web3d/scene-lighting-model.mjs');
 assert.deepEqual(projectShadow(400,500,0,0,1),[400,500]);
 const tip=projectShadow(400,500,0,300,1);assert.ok(tip[0]>550&&tip[1]>630);
});
test('root contact preparation leaves no opaque crop rim and does not modify source pixels',async()=>{
 const {rootContact}=await import('../web3d/scene-lighting-model.mjs');const w=24,h=16,a=new Uint8ClampedArray(w*h*4).fill(180);for(let i=0;i<w*h;i++)a[i*4+3]=255;const original=a.slice(),b=rootContact(a,w,h);
 assert.deepEqual(a,original);assert.equal(b[3],0);assert.ok(b[(8*w+12)*4+3]>150);assert.ok(b[((h-1)*w+12)*4+3]<5);
});
