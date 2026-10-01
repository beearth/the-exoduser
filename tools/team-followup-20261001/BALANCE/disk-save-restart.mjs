import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const serverFile=path.join(root,'server.cjs');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'exoduser-disk-save-restart-'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const evidence={startedAt:new Date().toISOString(),output,host:'127.0.0.1',port:null,processes:[],sources:[],checks:[],transport:[],status:'starting',limits:'실제격리server/API/disk/restart; fake DOM/clock·응답소비hold/HTTP503은fixture주입. 실브라우저/앱/unload/전원손실내구성미검수'};
const sourceFiles=['server.cjs','game.html','game-easy-test.html'];
for(const file of sourceFiles)evidence.sources.push({file,sha256:sha(fs.readFileSync(path.join(root,file)))});
let child=null;
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
async function until(condition){const deadline=Date.now()+10000;while(!condition()){if(Date.now()>deadline)throw Error('fixture wait timeout');await wait(10);}}
async function reservePort(){
  const probe=net.createServer();
  await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen({host:evidence.host,port:0},resolve);});
  const port=probe.address().port;await new Promise((resolve,reject)=>probe.close(error=>error?reject(error):resolve()));
  assert(![3381,3382,3383,3340,3333].includes(port));return port;
}
async function start(){
  assert(evidence.port&&output&&path.isAbsolute(output));
  const args=[serverFile],env={...process.env,HOST:evidence.host,PORT:String(evidence.port),EXODUSER_SAVE_DIR:output};
  child=spawn(process.execPath,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});
  const record={pid:child.pid,exec:process.execPath,args,env:{HOST:env.HOST,PORT:env.PORT,EXODUSER_SAVE_DIR:env.EXODUSER_SAVE_DIR},startedAt:new Date().toISOString(),stdout:'',stderr:''};
  evidence.processes.push(record);child.stdout.on('data',data=>{record.stdout+=data;});child.stderr.on('data',data=>{record.stderr+=data;});
  let error=null;child.once('error',failure=>{error=failure;});
  await until(()=>error||child.exitCode!==null||record.stdout.includes('Server on '+evidence.port));
  if(error)throw error;if(child.exitCode!==null)throw Error('isolated server exited: '+record.stderr);
}
async function stop(){
  if(!child)return;const owned=child;child=null;
  if(owned.exitCode!==null||owned.signalCode!==null)return;
  const closed=once(owned,'exit');assert(owned.kill('SIGTERM'));
  let timer;
  const timeout=new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('own child SIGTERM exit not observed')),10000);timer.unref();});
  try{
    const [code,signal]=await Promise.race([closed,timeout]);
    const record=evidence.processes.find(entry=>entry.pid===owned.pid);Object.assign(record,{stoppedAt:new Date().toISOString(),exitCode:code,signal});
  }finally{clearTimeout(timer);}
}
function sourceFixture(file,slot){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const fn=name=>source.match(new RegExp('^(?:async )?function '+name+'\\([^\\n]*\\)[\\s\\S]*?^}', 'm'))[0];
  const saves=[...source.matchAll(/^  dbSave=async function\(\)\{[\s\S]*?^  };/gm)];assert.equal(saves.length,4);
  const save=saves[2][0],now=fn('dbSaveNow'),drain=fn('_drainPendingSaveNow');
  assert(save.includes("fetch('/api/save'"));
  const shared=['_saveSharedMats','_saveSharedMatsToServer','_flushSharedStorage'].map(name=>source.match(new RegExp('^function '+name+'[^\\n]*$','m'))[0]).join('\n');
  let clock=100000,nextTimer=0,holdNext=false,releaseHold=null,holdReady=false,failNext=false;
  const timers=new Map(),storage=new Map(),pending=new Set();
  const context=vm.createContext({P:{lv:1,skills:{},sp:0},G:{mats:100000},INV:{bag:[],equipped:{weapon:{id:'synthetic',slot:'weapon',name:'synthetic',rarity:2,enh:0}}},
    STATS:{},PASSIVES:{},_grit:0,QSLOTS:[],BAG_MAX:300,CRYSTAL_BAG:[],CRYSTAL_DUST:0,UPGRADES:{},POT_LV:{},SKILL_SLOTS:[],ULT_SLOT:null,
    _saving:false,_pendingForce:false,_saveDebounce:null,_dbReady:true,_charId:slot,_charIdx:0,_SLOT:slot,_serverOk:true,_lastSaveTime:0,IS_ELECTRON:true,
    _SHARED_MATS_KEY:'synthetic-shared',_matsSavedVal:null,_isLocalServer:true,_sharedStorageDirty:false,
    _passiveQueueItems:()=>[],console:{error(){},warn(){}},localStorage:{setItem(key,value){storage.set(key,value);}},
    setTimeout(callback,delay){const id=++nextTimer;timers.set(id,{callback,at:clock+delay});return id;},clearTimeout:id=>timers.delete(id)});
  context.fetch=(url,options)=>{
    assert(['/api/save','/api/mats'].includes(url));
    const packet=JSON.parse(options.body),record={slot,file,url,packet,invokedAt:new Date().toISOString(),fixtureHold:false,fixtureFailure:false};evidence.transport.push(record);
    const promise=(async()=>{
      if(url==='/api/save'&&failNext){failNext=false;record.fixtureFailure=true;return new Response('fixture 503',{status:503});}
      const response=await fetch(`http://${evidence.host}:${evidence.port}${url}`,options);record.httpStatus=response.status;record.serverResponseObservedAt=new Date().toISOString();
      if(url==='/api/save'&&holdNext){holdNext=false;record.fixtureHold=true;await new Promise(resolve=>{releaseHold=resolve;holdReady=true;});holdReady=false;releaseHold=null;}
      return response;
    })();pending.add(promise);promise.finally(()=>pending.delete(promise)).catch(()=>{});return promise;
  };
  vm.runInContext(now+'\n'+drain+'\n'+shared+'\n'+save,context);
  const disk=()=>JSON.parse(fs.readFileSync(path.join(output,slot+'.json'),'utf8'));
  return {context,storage,disk,hashes:{file,slot,save:sha(save),now:sha(now),drain:sha(drain),shared:sha(shared)},
    async advance(duration){clock+=duration;for(const [id,timer] of [...timers])if(timer.at<=clock){timers.delete(id);timer.callback();}await Promise.resolve();},
    hold(){holdNext=true;},async held(){await until(()=>holdReady);},release(){assert(releaseHold);releaseHold();},
    fail(){failNext=true;},async settled(){await until(()=>!context._saving&&pending.size===0);},
    state(enh,mats){context.INV.equipped.weapon.enh=enh;context.G.mats=mats;}};
}
try{
  evidence.port=await reservePort();await start();
  for(const [file,slot] of [['game.html','synthetic_main'],['game-easy-test.html','synthetic_easy']]){
    const fixture=sourceFixture(file,slot);evidence.checks.push({stage:'source-fixture',...fixture.hashes});
    await fixture.context.dbSave();await fixture.settled();assert.equal(fixture.disk().inv.equipped.weapon.enh,0);
    fixture.hold();const first=fixture.context.dbSave();await fixture.held();fixture.state(1,85000);fixture.context.dbSaveNow();await fixture.advance(500);
    assert(fixture.context.dbSaveNow.pending);assert.equal(fixture.disk().inv.equipped.weapon.enh,0);
    fixture.release();await first;await fixture.settled();assert.equal(fixture.disk().inv.equipped.weapon.enh,1);
    assert.equal(fixture.disk().game.mats,0);evidence.checks.push({stage:'busy-drain-real-disk',slot,enh:1});
    fixture.state(2,70000);fixture.fail();await fixture.context.dbSave();await fixture.settled();assert.equal(fixture.disk().inv.equipped.weapon.enh,1);
    assert.equal(JSON.parse(fixture.storage.get('hellsave_'+slot)).inv.equipped.weapon.enh,2);
    fixture.state(3,55000);await fixture.context.dbSave();await fixture.settled();assert.equal(fixture.disk().inv.equipped.weapon.enh,1);
    assert.equal(JSON.parse(fixture.storage.get('hellsave_'+slot)).inv.equipped.weapon.enh,3);
    evidence.checks.push({stage:'fixture-503-followup-real-source-fallback',slot,serverEnh:1,memoryFallbackEnh:3});
    fixture.context._serverOk=true;await fixture.context.dbSave();await fixture.settled();assert.equal(fixture.disk().inv.equipped.weapon.enh,3);
    fixture.hold();const old=fixture.context.dbSave();await fixture.held();fixture.state(4,40000);fixture.context.dbSaveNow();await fixture.advance(500);
    const count=evidence.transport.filter(entry=>entry.url==='/api/save'&&entry.slot===slot).length;
    fixture.context._charId='discarded-context';fixture.context.P={lv:1,skills:{}};fixture.release();await old;await fixture.settled();
    assert.equal(evidence.transport.filter(entry=>entry.url==='/api/save'&&entry.slot===slot).length,count);assert.equal(fixture.disk().inv.equipped.weapon.enh,3);
    evidence.checks.push({stage:'context-discard',slot,noNewSaveRequest:true});
  }
  const diskHashes=Object.fromEntries(fs.readdirSync(output).filter(name=>name.endsWith('.json')).map(name=>[name,sha(fs.readFileSync(path.join(output,name)))]));
  evidence.diskBeforeRestart=diskHashes;await stop();await start();
  for(const slot of ['synthetic_main','synthetic_easy']){
    const response=await fetch(`http://${evidence.host}:${evidence.port}/api/load/${slot}`);assert.equal(response.status,200);const body=await response.json();assert(body.ok);assert.equal(body.data.inv.equipped.weapon.enh,3);
    assert.deepEqual(body.data,JSON.parse(fs.readFileSync(path.join(output,slot+'.json'),'utf8')));evidence.checks.push({stage:'restart-load-ack-and-disk',slot,enh:3});
  }
  evidence.diskAfterRestart=Object.fromEntries(Object.keys(diskHashes).map(name=>[name,sha(fs.readFileSync(path.join(output,name)))]));assert.deepEqual(evidence.diskAfterRestart,diskHashes);
  evidence.status='passed_isolated_disk_restart';
}catch(error){evidence.status=error.code==='EPERM'||error.code==='EACCES'?'blocked_permission_no_bypass':'failed';evidence.error={code:error.code,message:error.message,stack:error.stack};process.exitCode=1;
}finally{
  try{await stop();}catch(error){evidence.cleanupError=error.message;process.exitCode=1;}
  evidence.completedAt=new Date().toISOString();evidence.sourceHashesAfter=sourceFiles.map(file=>({file,sha256:sha(fs.readFileSync(path.join(root,file)))}));
  evidence.sourceBytesUnchanged=JSON.stringify(evidence.sources)===JSON.stringify(evidence.sourceHashesAfter);
  fs.writeFileSync(path.join(output,'evidence.json'),JSON.stringify(evidence,null,2)+'\n');
  fs.writeFileSync(new URL('./disk-save-restart-evidence.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify({status:evidence.status,output,port:evidence.port,processes:evidence.processes.map(({pid,signal})=>({pid,signal})),checks:evidence.checks.length,error:evidence.error?.message,completedAt:evidence.completedAt}));
}
