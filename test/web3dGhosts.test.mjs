import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const json=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const anchors=json('../assets/web3d/map-look-anchors.json');
test('ghosts remain visual-only, fixed at their root, and disperse close to the player',async()=>{
 const {ghostPose,ghostTip}=await import('../web3d/ghost-layout.mjs');
 assert.equal(typeof ghostPose,'function','ghost pose adapter required');
 const data=json('../assets/web3d/ghosts-ch1.json'); assert.ok(data.trees.length>=8);assert.ok(data.souls.length<=8);
 const row=data.trees[0],before=JSON.stringify(row);
 assert.deepEqual(ghostTip(row,0,5),[row.x,row.y]);
 assert.ok(ghostPose(row,{x:row.x,y:row.y},5).alpha<.01);
 assert.ok(ghostPose(row,{x:row.x+1000,y:row.y},5).alpha>0);
 assert.notDeepEqual(ghostTip(row,1,5),ghostTip(row,1,8));
 assert.equal(JSON.stringify(row),before);
});

test('a distant ghost remains faint but legible through its breathing cycle',async()=>{
 const {ghostPose}=await import('../web3d/ghost-layout.mjs'),row={x:100,y:200,alpha:.26,phase:0};
 for(let t=0;t<120;t++)assert.ok(ghostPose(row,{x:1000,y:1000},t).alpha>=.05,'vanishing phase must retain a readable spectral trace');
});

test('spectral anchors use the quiet inner shoulder, outside the central arenas',async()=>{
 const {signedBoundaryDistance}=await import('../web3d/environment-layout.mjs');
 const data=json('../assets/web3d/ghosts-ch1.json');for(const p of data.trees){const d=signedBoundaryDistance(p.x,p.y,anchors);assert.ok(d< -40&&d> -360);}
});

test('round3 spectral trees keep a quarter-opacity silhouette throughout a full cycle',async()=>{
 const {ghostPose}=await import('../web3d/ghost-layout.mjs');
 for(const row of json('../assets/web3d/ghosts-ch1.json').trees)for(let t=0;t<120;t+=.5){
  const a=ghostPose(row,{x:row.x+1000,y:row.y},t).alpha;
  assert.ok(a>=.24 && a<=.62,'tree silhouette opacity '+a);
 }
});

test('start and altar default cameras retain a whole spectral tree on a side shoulder',()=>{
 const data=json('../assets/web3d/ghosts-ch1.json');for(const [name,x,y]of [['start',4020,7420],['altar',5900,4120]])assert.ok(data.trees.some(p=>p.x-p.width/2>x-960&&p.x+p.width/2<x+960&&p.y<y+540&&p.y-p.height>y-540&&Math.abs(p.x-x)>450),name+' has no complete side silhouette');
});
