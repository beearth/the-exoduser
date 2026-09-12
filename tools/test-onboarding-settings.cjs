const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('./test-parry-lesson.cjs');
const saved=new Map();const storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
const c=fixture();c.localStorage=storage;const l=c.window._parryLesson;l.tick();l.skipAll();
assert.equal(l.active,false);assert.equal(l.checks.some(Boolean),false);
l.seen=false;assert.equal(l.tick(),false);assert.equal(l.active,false);
const reload=fixture();reload.localStorage=storage;assert.equal(reload.window._parryLesson.tick(),false);assert.equal(reload.window._parryLesson.active,false);
vm.runInContext(fs.readFileSync('system-lesson.js','utf8'),reload);assert.equal(reload.window._systemLesson.eligible(),false);
const blocked=fixture();blocked.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};blocked.window._parryLesson.tick();blocked.window._parryLesson.skipAll();blocked.window._parryLesson.seen=false;assert.equal(blocked.window._parryLesson.tick(),false);
for(const file of ['game.html','game-easy-test.html']){
 const s=fs.readFileSync(file,'utf8');const code=s.match(/function _spawnHoleCount\(size,si\)\{[^\n]+\}/)[0];
 const ctx=vm.createContext({SPAWN_HOLE:{cnt:{S:50,M:100,L:100}}});vm.runInContext(code,ctx);
 for(const [size,n] of [[.3,25],[.5,50],[.8,50]]){assert.equal(ctx._spawnHoleCount(size,0),n);assert.equal(ctx._spawnHoleCount(size,1),n*2);assert.equal(ctx._spawnHoleCount(size,6),n*2);}
 assert.ok(s.includes('_ts+=_spawnHoleCount(spawnHoles[_hi].size,si)'));
 assert.ok(s.includes('h._spawnTotal=_spawnHoleCount(h.size,_hSi)'));
}
console.log('PASS: persistent tutorial skip, system suppression, unavailable storage, first-stage half spawn counts and matching kill denominator.');

const replay=fixture(0,'?tutorial=1');replay.localStorage=storage;
assert.equal(replay.window._parryLesson.tick(),true);assert.equal(replay.window._parryLesson.active,true);
assert.equal(storage.getItem(replay.window._parryLesson.skipKey()),'1');
replay.window._parryLesson.skipAll();replay.window._parryLesson.seen=false;
assert.equal(replay.window._parryLesson.tick(),false);assert.equal(replay.window._parryLesson.active,false);
console.log('PASS: explicit tutorial replay ignores saved skip for one visit, preserves preference, and still allows skipping.');

// A skip belongs to one character, including after a reload; legacy global opt-out is ignored.
saved.set('exoduser:tutorial-skipped:v1','1');
for(const [first,second] of [['?char=uuid-a&slot=same','?char=uuid-b&slot=same'],['?test=1&slot=첫캐릭','?test=1&slot=새캐릭']]){
 const a=fixture(0,first);a.localStorage=storage;assert.equal(a.window._parryLesson.tick(),true);a.window._parryLesson.skipAll();
 const again=fixture(0,first);again.localStorage=storage;assert.equal(again.window._parryLesson.tick(),false);
 const b=fixture(0,second);b.localStorage=storage;assert.equal(b.window._parryLesson.tick(),true);
}
const recreated=fixture(0,'?test=1&slot=첫캐릭');recreated.localStorage=storage;
recreated.window._parryLesson.resetForNewCharacter();assert.equal(recreated.window._parryLesson.tick(),true);
recreated.window._parryLesson.skipAll();assert.equal(recreated.window._parryLesson.dismissed(),true);
const blockedNew=fixture();blockedNew.localStorage=blocked.localStorage;
blockedNew.window._parryLesson.skipAll();blockedNew.window._parryLesson.resetForNewCharacter();assert.equal(blockedNew.window._parryLesson.tick(),true);
// Exercise the successful lobby creation hook for same-name recreation before navigation.
const lobby=fs.readFileSync('index.html','utf8');
const hook=lobby.slice(lobby.indexOf('async function _afterCharacterCreated('),lobby.indexOf('async function doCreateChar('));
const lobbyContext=vm.createContext({_testMode:true,localStorage:storage,loadLocalCharacters:async()=>{},console});
vm.runInContext(hook,lobbyContext);
saved.set('exoduser:tutorial-skipped:v2:slot:'+encodeURIComponent('첫캐릭'),'1');
lobbyContext._afterCharacterCreated('첫캐릭',1);
assert.equal(storage.getItem('exoduser:tutorial-skipped:v2:slot:'+encodeURIComponent('첫캐릭')),undefined);
for(const file of ['game.html','game-easy-test.html'])assert.ok(fs.readFileSync(file,'utf8').includes('window._parryLesson?.resetForNewCharacter();'));
console.log('PASS: character-scoped skip, legacy skip ignored, new character and same-name recreation show practice, creation hook and blocked storage.');
