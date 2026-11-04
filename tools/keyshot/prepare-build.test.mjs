import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
const api=await import('./prepare-build.mjs').catch(()=>null);
const root='I:/EXODUSER-Storage/steam-prep/keyshot/checks/media-fixture';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('정본 조각을 정확히 이어 붙이고 변조된 조각을 거부한다',()=>{
  assert.ok(api,'영상 패키징 도구 미구현');fs.mkdirSync(root,{recursive:true});
  try{
    const a=Buffer.from('canonical-'),b=Buffer.from('movie');fs.writeFileSync(root+'/a.part',a);fs.writeFileSync(root+'/b.part',b);
    const m={destination:'Assets/StreamingAssets/Lobby/test.mp4',bytes:a.length+b.length,sha256:hash(Buffer.concat([a,b])),parts:[{path:'a.part',bytes:a.length,sha256:hash(a)},{path:'b.part',bytes:b.length,sha256:hash(b)}]};
    assert.deepEqual(api.assembleRecovery(root,m),Buffer.concat([a,b]));
    fs.writeFileSync(root+'/a.part','tampered');assert.throws(()=>api.assembleRecovery(root,m));
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('복원 파일은 지정 빌드의 StreamingAssets에만 놓는다',()=>{
  assert.ok(api);
  const out=api.buildMediaPath('I:/EXODUSER-Storage/map25d/a2r-build-keyshot','Assets/StreamingAssets/Lobby/test.mp4');
  assert.ok(out.replaceAll('\\','/').endsWith('/EXODUSER-A2R_Data/StreamingAssets/Lobby/test.mp4'));
  assert.throws(()=>api.buildMediaPath('I:/','Assets/StreamingAssets/Lobby/test.mp4'));
  assert.throws(()=>api.buildMediaPath('I:/EXODUSER-Storage/map25d/a2r-build-keyshot','Assets/StreamingAssets/Lobby/../outside.mp4'));
});
