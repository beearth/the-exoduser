import test from 'node:test';
import assert from 'node:assert/strict';
const api = await import('./score.mjs').catch(() => null);
test('상단 적과 세 크기 층을 갖춘 후보를 우선한다', () => {
  assert.ok(api, '점수 도구가 아직 없다');
  const frame = {width:1920,height:1080,hero:{x:900,y:500,w:70,h:120},heroOverlap:0,
    enemies:[{x:400,y:100,w:12,h:20,visible:true},{x:700,y:200,w:30,h:50,visible:true},{x:1200,y:550,w:65,h:100,visible:true}]};
  const good=api.scoreFrame(frame,{luminance:70,blackBorder:false,hudOverlap:0});
  assert.equal(good.upperEnemies,2); assert.equal(good.layers,3);
  assert.ok(good.score>api.scoreFrame({...frame,enemies:[]},{luminance:2,blackBorder:true,hudOverlap:1}).score);
});
test('화면 밖과 가려진 적은 점수에서 제외한다', () => {
  assert.ok(api);
  const s=api.scoreFrame({width:1920,height:1080,hero:{x:900,y:500,w:70,h:120},heroOverlap:2,
    enemies:[{x:100,y:20,w:20,h:20,visible:false},{x:-100,y:10,w:10,h:20,visible:true}]},{luminance:60,hudOverlap:0});
  assert.equal(s.upperEnemies,0); assert.equal(s.heroOccluded,true);
});
test('픽셀 차와 메타데이터 차이는 각각 검출한다', () => {
  assert.ok(api);
  assert.deepEqual(api.pixelDifference(Buffer.from([0,20,40]),Buffer.from([0,22,40])),{changed:1,total:3,ratio:1/3,mean:2/3,max:2});
  assert.throws(()=>api.pixelDifference(Buffer.alloc(3),Buffer.alloc(6)));
  const f={id:'S1-01',width:1920,height:1080,hud:true,tick:500,seed:10,player:{x:1,y:2},camera:{pitch:34,fov:50,distance:20}};
  assert.equal(api.sameComposition(f,{...f}),true);
  assert.equal(api.sameComposition(f,{...f,tick:501}),false);
});
test('장면별 선별은 동점에도 안정적이며 세 장면 누락을 거부한다', () => {
  assert.ok(api);
  const rows=['S1','S2','S3'].flatMap(scene=>Array.from({length:6},(_,i)=>({scene,id:scene+'-'+i,score:100-i})));
  const selected=api.selectViews(rows,4); assert.equal(selected.length,12);
  assert.deepEqual(selected.slice(0,4).map(r=>r.id),['S1-0','S1-1','S1-2','S1-3']);
  assert.throws(()=>api.selectViews(rows.filter(r=>r.scene!=='S3'),4));
});
