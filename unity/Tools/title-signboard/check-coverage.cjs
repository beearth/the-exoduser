const assert=require('node:assert/strict'),fs=require('node:fs');
const c=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
assert.equal(c.titleArt?.length,15,'새 타이틀은 실제 5해상도×3언어 모션 기록15행이 필요하다');
const keys=new Set();
for(const t of c.titleArt){assert.equal(t.mode,'layered');assert.ok(t.framesAfter>t.framesBefore&&t.timeAfter>t.timeBefore,'실제 렌더/시간 진행');assert.ok(t.pausedClockPreserved&&t.resumed,'실제 정지/재개');keys.add(t.width+'x'+t.height+':'+t.language);}
assert.equal(keys.size,15,'해상도/언어 중복으로 누락을 덮으면 안 된다');
assert.equal(c.movies.length,105,'과거 타이틀 MP4는 새 화면의 재생 증거가 아니다');
assert.ok(c.movies.every(m=>m.prepared&&m.playing&&m.frameAfter!==m.frameBefore&&m.file!=='title_motion_20261028.mp4'));
assert.equal(c.frames.length,1395);assert.equal(c.inputIsolationChecks,1395);assert.equal(c.simulationFrozenChecks,1395);
assert.equal(c.tipKeyChanges.length,30);assert.ok(c.tipKeyChanges.every(x=>x.restored));
console.log('PASS actual title15/movie105/UI1395/tip-key30 coverage; visual and guard verdicts remain separate');
