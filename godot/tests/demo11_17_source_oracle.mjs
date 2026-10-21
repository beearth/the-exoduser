import SNAPSHOT from '../source_snapshot/snapshot.cjs';
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import readline from 'node:readline';import crypto from 'node:crypto';
// Only selected source ranges enter memory; source and test output are streamed.
const [source,logPath,resultPath]=process.argv.slice(2);assert.ok(source&&logPath&&resultPath,'source/log/result arguments');
const ranges=[[3913,3931],[16649,16649],[28080,28085],[44094,44110],[44161,44357],[44362,44390],[44453,44488],[44608,44661],[47192,47326],[47678,47980]];
const lines=[];let lineNumber=0;const hash=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(SNAPSHOT.sourcePath))hash.update(chunk);const sourceHash=hash.digest('hex');assert.equal(sourceHash,SNAPSHOT.sha256);
for await(const line of readline.createInterface({input:fs.createReadStream(SNAPSHOT.sourcePath),crlfDelay:Infinity})){lineNumber++;if(ranges.some(([a,b])=>lineNumber>=a&&lineNumber<=b))lines[lineNumber-1]=line;}
const src=lines.join('\n'),cut=(a,b)=>lines.slice(a-1,b).join('\n');
function extract(name){let a=src.indexOf('function '+name+'(');assert.ok(a>=0,name);if(src.slice(a-6,a)==='async ')a-=6;const b=src.indexOf('{',a);let d=1,q='',e=false,l=false,k=false;for(let i=b+1;i<src.length;i++){let c=src[i],n=src[i+1];if(l){if(c==='\n')l=false;continue;}if(k){if(c==='*'&&n==='/'){k=false;i++;}continue;}if(q){if(e)e=false;else if(c==='\\')e=true;else if(c===q)q='';continue;}if(c==='/'&&n==='/'){l=true;i++;continue;}if(c==='/'&&n==='*'){k=true;i++;continue;}if(c==='\''||c==='"'||c==='`'){q=c;continue;}if(c==='{')d++;else if(c==='}'&&--d===0)return src.slice(a,i+1);}throw Error(name);}
const names=['_skillUpSpCost','_fuseUpSpCost','_skillSpentSp','_malCost','_isFused','isDimBreach','_getFuseKey','_getAbsorbed','_getAllAbsorbed','_isAbsorbed','_canFuse','_syncActiveSkAfterReset','_fuseGemGroup','_skCtx','_skLearnUp','_execFuse','_learnSkillAuto','_skillBatchUp','_skillRecAuto','_skLevelDown','_skResetSkill'];
let code=cut(44161,44224)+'\n'+cut(44226,44274)+'\n'+cut(44277,44317)+'\n'+cut(44324,44357)+'\n'+cut(44453,44486)+'\n'+cut(44094,44110)+'\n'+cut(16649,16649)+'\n'+cut(28080,28080)+'\nlet P,G,SKILL_SLOTS,ULT_SLOT,_DEMO_MODE=false,_fuseSelId=null,_skHierTab=null,_ctxKey=null,_counters={},_confirmation=true;\n';
for(const name of names){let body=extract(name);if(name==='_skCtx'){const start=body.indexOf('const _fk2='),end=body.indexOf(';',start);assert.ok(start>=0);body=body.slice(0,end+1)+'_ctxKey=_fk2;'+body.slice(end+1);}if(name==='_skillBatchUp'){assert.ok(body.includes('if(_total>0){'));body=body.replace('if(_total>0){','_counters={upgrades:_total};if(_total>0){');}if(name==='_skillRecAuto'){assert.ok(body.includes('if(_nL||_nF){'));body=body.replace('if(_nL||_nF){','_counters={learned:_nL,fused:_nF};if(_nL||_nF){');}code+=body+'\n';}
// These mock only UI/audio/save services. No resource gate, formula or source mutation is replaced.
code+=`const noop=()=>{};const SFX={levelup:noop,pickup:noop};const addTxt=noop,showPH=noop,notify=noop,renderSkillPanel=noop,updateSkSlot=noop,updateQS=noop,dbSaveForce=noop,updateBowSlot=noop,updateMagicSlot=noop,updateQSlot=noop,_updateUltSlot=noop,playSample=noop,_closeSkPop=noop;
const _T=x=>x,_L=(ko,en)=>ko,_fuseName=x=>x;const gameConfirm=async()=>_confirmation;
const _wingStrikeLevel=()=>{throw Error('protected wing strike excluded')},_resetWingStrikeUpgrades=()=>{throw Error('protected reset excluded')};
`;
// The old row's three early guards, directly extracted, form only its visibility predicate.
const rowStart=src.indexOf('function _renderSkillRow(sk,grid){');const rowPrefix=src.slice(rowStart,src.indexOf('    const _isDimBlast=',rowStart));
const guards=rowPrefix.split('\n').filter(l=>/^\s*if\(/.test(l));assert.equal(guards.length,3);code+='function cardVisible(sk){'+guards.map(l=>l.replace(/return;/g,'return false;')).join('\n')+';return true;}\n';
const context=vm.createContext({});vm.runInContext(code,context,{timeout:1000});
const run=vm.runInContext(`async(method,args)=>{
 const index=method==='batch'||method==='recommend'?0:1;const f=args[index];P=f.p;G=f.g;SKILL_SLOTS=f.slots;ULT_SLOT=f.ultimate;_ctxKey=null;_counters={};_fuseSelId=null;_DEMO_MODE=false;
 const sk=method==='batch'||method==='recommend'||method==='fuse'?null:_skById(args[0]);
 if(method==='learn_gate')return _skCtx(sk).canLearn;
 if(method==='context'){const c=_skCtx(sk);return {level:c.slv,learned:c.learned,lock:c._skLvLock,fusion_key:_ctxKey,fuse_display_cost:c._fuseUpSp,fuse_can_up:c._fuseCanUp,single_cost:c._singleUpSp,can_up:c.canUp};}
 switch(method){
 case 'learn':if(args[2]==='auto')_learnSkillAuto(sk);else if(args[2]==='direct'||(_skCtx(sk).canLearn&&cardVisible(sk)))_skLearnUp(sk);break;
 case 'upgrade':if(args[2]==='direct'||(_skCtx(sk).canUp&&cardVisible(sk)))_skLearnUp(sk);break;
 case 'fuse':_DEMO_MODE=args[3];if(args[2]==='direct'||_canFuse(args[0]))_execFuse(args[0]);break;
 case 'minus':_skLevelDown(sk);break;
 case 'reset':_confirmation=args[2];await _skResetSkill(sk);break;
 case 'batch':_skillBatchUp();break;
 case 'recommend':_DEMO_MODE=args[1];_skillRecAuto();break;
 default:throw Error(method);
 }
 // G.shake and UI transient globals are effects, outside the copied resource ledger.
 const originalG=f.g;const ledgerG={...originalG};if(!Object.prototype.hasOwnProperty.call(args[index].g,'shake'))delete ledgerG.shake;
 const result={fixture:{...f,p:P,g:ledgerG,slots:SKILL_SLOTS,ultimate:ULT_SLOT}};
 if(method==='batch'||method==='recommend')result.counts=_counters;
 return result;
}`,context);
const log=readline.createInterface({input:fs.createReadStream(logPath),crlfDelay:Infinity});let rows=0,mismatches=0,exact_currency_numbers=0;const first=[],methods={};
for await(const line of log){if(!line.startsWith('SK_S05_ORACLE_ROW '))continue;const row=JSON.parse(line.slice('SK_S05_ORACLE_ROW '.length));const args=structuredClone(row.args);const originalHadShake=(row.method==='batch'||row.method==='recommend'?row.args[0]:row.args[1]).g?.hasOwnProperty('shake');const result=await run(row.method,args);if(result?.fixture&&!originalHadShake)delete result.fixture.g.shake;const expected=JSON.parse(JSON.stringify(result));rows++;methods[row.method]=(methods[row.method]||0)+1;try{assert.deepEqual(row.value,expected);if(expected?.fixture){for(const[k,n]of [['sp',expected.fixture.p.sp],['mats',expected.fixture.g.mats]]){const bits=Buffer.alloc(8);bits.writeDoubleLE(n);assert.equal(row.currency_bits?.[k],bits.toString('hex'));exact_currency_numbers++;}}}catch{mismatches++;if(first.length<12)first.push({row:rows,...row,expected});}}
const result={source_sha256:sourceHash,original_functions:names.length,rows,exact_currency_numbers,methods,mismatches,first_mismatches:first};fs.writeFileSync(resultPath,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({rows,mismatches,exact_currency_numbers,methods}));if(mismatches)console.error(JSON.stringify(first.map(x=>({row:x.row,method:x.method,id:x.args[0]}))));if(mismatches)process.exit(1);
