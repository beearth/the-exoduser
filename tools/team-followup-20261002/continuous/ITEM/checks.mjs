import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner=path.join(root,'tools/team-followup-20261002/continuous/ITEM');
assert.equal(fs.realpathSync(process.cwd()),root);
assert.equal(fs.realpathSync(owner),owner);
for(const p of [root,owner])assert.equal(fs.lstatSync(p).isSymbolicLink(),false);
const started=new Date().toISOString();
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const paths=[
 'AGENTS.md','game.html','game-easy-test.html','index.html','server.cjs','node-main.js',
 'tools/team-followup-20261002/continuous/COMMON.md','tools/team-followup-20261002/continuous/ITEM/TASK.md',
 'docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md',
 'docs/7아이템디자인/유니크_어픽스_리스트.md','docs/7아이템디자인/UNIQUE_TOP8_HOOK_REVIEW_20261001.md',
 'docs/7아이템디자인/ITEM_TEAM_MASTER.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md',
 'unique-item-project/definitions.js','unique-item-project/roll-values.js','tools/team-followup-20261001/ITEM/binding-d10.mjs',
 'tools/team-followup-20261001/ITEM/d13-deferred-contract-candidate.mjs',
 'tools/team-followup-20261002/project-teams/ITEM/result.md','tools/team-followup-20261002/project-teams/ITEM/evidence.json',
 'tools/team-followup-20261002/codex-half/ITEM/result.md','tools/team-followup-20261002/codex-half/ITEM/evidence.json'
];
const reads=paths.map(p=>({path:p,bytes:fs.readFileSync(path.join(root,p)),sha256:null}));
for(const r of reads)r.sha256=hash(r.bytes);
const source=reads.find(r=>r.path==='game.html').bytes.toString();
const line=i=>source.slice(0,i).split('\n').length;
const fragments=[];
function fragment(label,text,index){const f={label,line:line(index),sha256:hash(text),bytes:Buffer.byteLength(text)};fragments.push(f);return text;}
function extract(name){const marker=`function ${name}(`;let index=source.indexOf(marker);assert(index>=0);if(source.slice(index-6,index)==='async ')index-=6;const ast=parseExpressionAt(source,index,{ecmaVersion:'latest'});return fragment(name,source.slice(index,ast.end),index);}
const mk=extract('mkItem'),drop=extract('rollDrop'),pickup=extract('pickupItem'),equip=extract('equipItem');
const save=extract('dbSave'),restore=extract('dbRestore');
assert(!/UI-13|U-D13|_uTrapOffshoot|uniqueRoll/.test(mk));
assert(!source.includes('_uTrapOffshoot'));
function exact(label,text){const index=source.indexOf(text);assert(index>=0,label);return fragment(label,text,index);}
const genCall=exact('rollDrop fresh caller','const item=mkItem(slot,tier,el,rarity);');
const worldPush=exact('world item transfer',"_wiPush({x:e.x+(Math.random()-.5)*30,y:e.y+(Math.random()-.5)*30,type:'item',item,picked:false});");
const pickupCall=exact('R pickup caller','if(pickupItem(wi.item)){wi.picked=true;');
const equipCall=exact('inventory equip caller','onclick="equipItem(INV.bag[${idx}]);applyStats();renderInv()"');
const saveInv=exact('dbSave inventory expression','{bag:INV.bag,equipped:INV.equipped,ossCollect:INV.ossCollect||{}}');
const restoreBag=exact('dbRestore bag assignment','INV.bag=d.inv.bag||[];');
const eqStart=source.indexOf('INV.equipped=d.inv.equipped||');
const restoreEq=fragment('dbRestore equipped assignment',source.slice(eqStart,source.indexOf(';',eqStart)+1),eqStart);
assert(save.includes(saveInv)&&restore.includes(restoreBag)&&restore.includes(restoreEq));

// Only this in-memory candidate creates metadata. Caller supplies an already resolved
// integer roll and explicitly invokes a fresh factory; item ID is never freshness proof.
let freshFactoryCalls=0,metadataCreations=0;
function freshPort(factory,selection){
  const item=factory();freshFactoryCalls++;
  if(selection===null)return item;
  assert.equal(item.slot,'belt');assert.equal(item.uniqueId,undefined);assert.equal(item.uniqueRoll,undefined);
  assert.equal(selection.uniqueId,'UI-13');assert.equal(selection.effectId,'U-D13');
  assert.equal(selection.catalogName,'번지는 뿌리의 띠');
  assert(Number.isInteger(selection.rawPercent)&&selection.rawPercent>=20&&selection.rawPercent<=40);
  metadataCreations++;
  return {...structuredClone(item),uniqueId:selection.uniqueId,name:selection.catalogName,
    uniqueRoll:{version:1,effectId:selection.effectId,stat:'_uTrapOffshoot',unit:'fraction',storedValue:selection.rawPercent/100}};
}
function consume(item){
  const b=item?.uniqueRoll;
  if(item?.uniqueId!=='UI-13'||item.slot!=='belt'||!b)return null;
  if(b.version!==1||b.effectId!=='U-D13'||b.stat!=='_uTrapOffshoot'||b.unit!=='fraction')return null;
  const n=b.storedValue,raw=Math.round(n*100);
  return typeof n==='number'&&Number.isInteger(raw)&&raw>=20&&raw<=40&&raw/100===n?n:null;
}
const passed=[];
function check(name,fn){fn();passed.push(name);}
const stubNames=['P.lv=100','INV empty belt slot','grid 1x1/position (0,0)',
 '_equipSlot returns item.slot','_earringSlot false','translation/notify/audio/pet/lesson no-op',
 'recalcSt no-op (production D13 stat consumer absent)','dbSaveForce counter only',
 'Date.now fixed','Math.random throws','fresh factory returns synthetic base item (mkItem not executed)',
 'resolved identity+rawPercent selection (production selection absent)',
 'native JSON stringify/parse transport (no DB/API/localStorage)'];
function route(item){
  let saves=0,rng=0;
  const c=vm.createContext({item,P:{lv:100},INV:{bag:[],equipped:{belt:null},ossCollect:{}},G:{mats:0},
    window:{},_earringEquipTarget:null,_earringSlot:()=>false,_equipSlot:i=>i.slot,
    _itemSz:()=>[1,1],_invFindSpace:()=>({x:0,y:0}),recalcSt:()=>{},playEquipSfx:()=>{},
    playItemPickupSfx:()=>{},notify:()=>{},_T:s=>s,_L:s=>s,_rarName:()=>'',_petSayCD:()=>{},
    dbSaveForce:()=>{saves++}});
  vm.runInContext('Date.now=()=>42;Math.random=()=>{throw new Error("unexpected RNG")}',c);
  vm.runInContext(pickup+'\n'+equip,c);
  assert.equal(vm.runInContext('pickupItem(item)',c),true);
  assert.equal(c.INV.bag[0],item);
  assert.equal(vm.runInContext('equipItem(item)',c),undefined);
  assert.equal(c.INV.equipped.belt,item);assert.equal(c.INV.bag.length,0);
  const serialized=JSON.stringify(vm.runInContext('('+saveInv+')',c));
  const d={inv:JSON.parse(serialized)};c.d=d;c.INV={bag:[],equipped:{}};
  const before=JSON.stringify(d),beforeFactory=freshFactoryCalls,beforeCreate=metadataCreations;
  vm.runInContext(restoreBag+'\n'+restoreEq,c);
  assert.equal(c.INV.equipped,d.inv.equipped);assert.equal(c.INV.equipped.belt,d.inv.equipped.belt);
  assert.equal(c.INV.equipped.belt.uniqueRoll,d.inv.equipped.belt.uniqueRoll);
  assert.equal(JSON.stringify(d),before);assert.equal(freshFactoryCalls,beforeFactory);assert.equal(metadataCreations,beforeCreate);
  const read=consume(c.INV.equipped.belt);
  return {serialized,restored:c.INV.equipped.belt,read,saves,rng};
}
const base={id:13,slot:'belt',rarity:5,name:'일반 유니크 허리띠',reqLv:0,affixes:[{id:'existing',value:2}],crystals:[null]};
const selection={uniqueId:'UI-13',effectId:'U-D13',catalogName:'번지는 뿌리의 띠',rawPercent:30};
let baseline,valid,ordinary,legacy;
check('original source has no D13 supply or consumer',()=>{baseline=route(structuredClone(base));assert.equal(baseline.read,null);assert.equal(baseline.restored.uniqueRoll,undefined);});
check('fresh explicit factory/selection preserves original nested data',()=>{const before=JSON.stringify(base),aff=base.affixes;const bound=freshPort(()=>base,selection);assert.equal(JSON.stringify(base),before);assert.equal(base.affixes,aff);assert.notEqual(bound.affixes,aff);assert.equal(bound.uniqueRoll.storedValue,.30);valid=route(bound);assert.equal(valid.read,.30);assert.deepEqual(valid.restored.affixes,baseline.restored.affixes);assert.deepEqual(valid.restored.crystals,baseline.restored.crystals);});
check('ordinary fresh pass-through is source-equivalent',()=>{const normal=structuredClone(base);normal.rarity=0;const same=freshPort(()=>normal,null);assert.equal(same,normal);ordinary=route(same);const comparison=route(structuredClone({...base,rarity:0}));assert.equal(ordinary.serialized,comparison.serialized);assert.equal(ordinary.read,null);});
check('loaded UI-13 missing binding remains missing; no repair or fresh inference',()=>{const old={...structuredClone(base),uniqueId:'UI-13',name:selection.catalogName};legacy=route(old);assert.equal(legacy.read,null);assert.equal(legacy.restored.uniqueRoll,undefined);assert.equal(old.uniqueRoll,undefined);});
check('restore/read calls no generation and no additional metadata creation',()=>{assert.equal(freshFactoryCalls,2);assert.equal(metadataCreations,1);assert.equal(valid.saves,2);assert.equal(legacy.saves,2);});

const searchArgs=['-n','UI-13|U-D13|_uTrapOffshoot|uniqueRoll|mkItem|equipItem|fromStoredValue','docs/'];
const search=spawnSync('rg',searchArgs,{cwd:root,encoding:'utf8'});assert.equal(search.status,0);
const matches=search.stdout.trim().split('\n'),files=[...new Set(matches.map(s=>s.split(':')[0]))];
const preserved=reads.map(r=>({path:r.path,sha256Before:r.sha256,sha256After:hash(fs.readFileSync(path.join(root,r.path)))}));
assert(preserved.every(r=>r.sha256Before===r.sha256After));
const ended=new Date().toISOString();
const evidence={taskId:'continuous-ITEM-D13-trusted-one-route',provider:'existing Codex ITEM chat',
 chatId:null,chatIdReason:'current task UI chatId not independently confirmed; no session query',
 coordinatingChatId:'01a0faa9-b453-7673-be39-98adedb4c2b3',
 providedBaseline:{sha:'7e69495046323b3120578f67635c20feb48b2a4f',taskCheckpoint:'cd675f24',source:'root task message; not independently observed HEAD'},
 time:{firstReadObservationUTC:'2026-10-02T05:24:42Z',firstReadObservationKST:'2026-10-02T14:24:42+09:00',startedUTC:started,endedUTC:ended,endedKST:new Date(Date.parse(ended)+9*3600000).toISOString().replace('Z','+09:00')},
 cwd:root,realpath:fs.realpathSync(root),owner,symlink:false,
 reads:preserved,fragments,stubs:stubNames,
 validation:{newDistinctInputs:3,routeExecutions:5,assertionGroups:passed.length,passed,failures:[],preparationFailures:[{exit:1,error:'ENOENT unique-item-project/binding-d10.mjs',phase:'read before VM',repair:'correct read-only binding path; no production change'}],freshFactoryCalls,metadataCreations,restoreGeneration:0,restoreRng:0,restoreD13Repair:0},
 actualExecution:['pickupItem full function','equipItem full function','dbSave inv object expression','dbRestore two assignment statements'],
 staticOnly:['rollDrop full function + fresh mkItem call/world push','mkItem full function','R pickup/inventory equip caller','dbSave/dbRestore full functions'],
 inheritedOnly:{callback32:'accepted; executed0',callerLifecycle22:'accepted; executed0',data12plusJSON1:'accepted; executed0',D10and698rollAudit:'accepted; executed0'},
 state:{schemaAdopted:false,enabled:false,runtimeReady:false,productionApplied:false},
 docsSearch:{command:['rg',...searchArgs],exit:search.status,lines:matches.length,files,sha256:hash(search.stdout)},
 commands:[{command:'bounded cat/sed/rg reads recorded in task tool transcript',exit:0},{command:process.execPath+' '+path.join(owner,'checks.mjs'),exit:1,phase:'initial read path error'}, {command:process.execPath+' '+path.join(owner,'checks.mjs'),exit:0,phase:'corrected run'}],
 ownership:{writes:['checks.mjs','result.md','evidence.json'],productionWrites:0,sharedDocsWrites:0,gitCommands:0,priorTestsExecuted:0,serverUIBuildSave:0,deletion:0,newSessionsSubagentsMessages:0},
 toolsActuallyCalled:['functions.exec / exec_command','functions.exec / apply_patch','clock__curr_time'],skillsUsed:[],
 limitations:['not actual mkItem/rollDrop/update caller execution','no actual stat recalc/D13 combat consumption','not full dbSave/dbRestore execution; existing socket RNG migrations excluded','native JSON memory roundtrip is not real persistence']};
const table=fragments.map(f=>`| ${f.label} | game.html:${f.line} | ${f.sha256} |`).join('\n');
const result=`# ITEM — D13 신뢰된 데이터 공급 한 경로\n\n**한 경로 분석과 메모리 후보 검수 완료. 실제 D13 공급·장착 효과 소비는 미연결이며 생산 적용0이다.** 제공 기준은 root의 7e69495046323b3120578f67635c20feb48b2a4f / TASK checkpoint cd675f24다. Git 조회0이며 현재 HEAD 독립 관측으로 주장하지 않는다.\n\n## 실제 경로와 연결 누락\n\n대표 경로: rollDrop의 belt/rarity5 선택 → mkItem → _wiPush worldItems → R키 pickupItem(wi.item) → INV.bag → 아이템창 equipItem(INV.bag[idx]) → INV.equipped.belt → dbSave inv → 메모리 JSON transport → dbRestore equipped assignment → 장착 binding 읽기 후보. 정상 드롭의 확률/필터/획득 UI는 정적 추적만 했고 실행하지 않았다. 가방 보관 경로 하나이며 공유 STORAGE 경로는 범위에 포함하지 않았다.\n\nmkItem은 rarity>=5에서 기존 UNIQUE_SPECIAL만 공급하며 UI-13/U-D13/uniqueRoll/_uTrapOffshoot를 생성하지 않는다. rollDrop에는 D13 선택 resolver도 없다. 장착은 실제 동일 item 참조를 옮기고 recalcSt를 호출하지만 생산에는 D13 소비가 없다. 따라서 rarity5/belt만으로 D13를 선택하거나 uniqueId를 fresh 증거로 삼을 수 없다.\n\n| 함수/표현식 | 현재 읽은 위치 | 원문 SHA-256 |\n|---|---|---|\n${table}\n\n전체 game.html SHA: ${preserved.find(r=>r.path==='game.html').sha256Before}. easy는 보존 SHA만 측정했고 대표 실행은 본편 한 경로만이다.\n\n## 후보 입력·실행 경계\n\n| 항목 | 정확한 계약 |\n|---|---|\n| 신뢰 생성 caller | rollDrop에서 새 mkItem 반환 직후, world item 공개 전 공급해야 함. 현재 연결 없음. 검수의 factory는 합성 base 반환 대역이며 실제 mkItem 실행 아님 |\n| 명시 공급 | 선택 resolver가 UI-13 / U-D13 / 번지는 뿌리의 띠 / belt와 이미 결정한 정수 rawPercent20~40을 전달. 검수 대표값30. 생성 선택/드롭 확률 승인·구현 아님 |\n| freshPort 후보 | factory를 명시 호출하고 신규 base에 기존 uniqueId/uniqueRoll이 없음을 확인. 입력 snapshot을 복사해 name/identity/uniqueRoll만 추가; fresh 출처 보장은 caller 책임이며 factory 이름이나 객체 필드만으로 증명되지 않음 |\n| 검토 저장 shape | uniqueRoll:{version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue:0.30}. raw는 저장하지 않음. stat 직접 필드 중복0 |\n| 저장/복원/장착 읽기 | freshPort 호출0, D13 생성/RNG/수리0. missing/legacy를 기본값으로 채우지 않음. 실제 소켓/affix 마이그레이션 RNG까지0이라는 주장 아님 |\n| 소비 후보 | consume은 검토 전용 canonical 값 반환만. 기존 fromStoredValue 원본은 읽기만 했고 import0; 조건은 이 대표 경로의 메모리 대역이며 완전 schema 검사나 실제 효과 소비 아님 |\n| 상태·전투 | schemaAdopted=false, enabled=false, runtimeReady=false, productionApplied=false. 피해20~40%, 반경150px, 지속180f, 시전당1; child/DOT/death/cap/겹침/clear 변경0 |\n\n## 새 검증\n\n새 입력3종(명시 신규D13·일반·로드된 UI13 missing binding), 경로5회(미연결 대조1·후보1·일반 원문/후보2·missing1), 새 주장5그룹 PASS. 기존 callback32/caller22/data12+JSON1/D10/698은 완료근거만 읽었고 반복·합산0.\n\n${passed.map(s=>'- '+s).join('\n')}\n\nactual pickupItem/equipItem **전체 함수**를 VM 실행했으나 empty belt/no enhancement/no crystals transfer 경로와 합성 UI/음향/그리드/recalc/save 의존을 사용했다. dbSave inv 식과 dbRestore 두 assignment만 실제 원문 실행했다. 전체 저장/복원/원 drop caller 실행이라 주장하지 않는다. 중첩 identity는 adapter 이전 입력 보존, JSON 이후 로드 객체/uniqueRoll identity 보존을 각각 확인했다; JSON 전후 동일 참조를 주장하지 않는다. RNG throw guard의 미발동은 이 제한된 경로에만 해당한다.\n\n## canonical docs 인계 문안\n\n코드 작성 후 docs 전체 지정 rg: ${matches.length}행/${files.length}파일. 공유docs 쓰기0. 총괄이 다음 문안을 순차 반영한다.\n\n| 정본 | 정확한 추가 문안 |\n|---|---|\n| ITEM_TEAM_MASTER D13 | “2026-10-02 D13 데이터 공급 한 경로: rollDrop→mkItem→worldItems→R pickup→bag→equip→save inv→restore equipped를 source SHA로 연결했다. 실제 D13 생성 resolver·binding 공급·장착 효과 소비 미연결. 새3입력/5경로/5주장 메모리 검사 PASS, 기존 완료검사 반복0. schemaAdopted/enabled/runtimeReady/productionApplied=false.” |\n| 저장 SSOT binding 구역 | “D13 uniqueRoll version1/U-D13/_uTrapOffshoot/fraction은 미채택 검토 shape다. 신뢰된 신규 mkItem 직후 caller만 명시 UI-13/belt/번지는 뿌리의 띠와 결정된 정수20~40%를 공급하며 저장값은 rawPercent÷100이다. raw 중복 저장·로드/장착 생성·missing/legacy 보충·재롤0. 이번 actual restore는 두 INV 대입식 검수에 한정하며 전체 migration RNG0 근거가 아니다.” |\n| TOP8/D13 검토 구역 | “D13 actual fresh supplier/저장/장착 소비 연결은 아직 없다. source 경로·메모리 adapter 검토는 continuous/ITEM/result.md를 따른다. 데이터 공급 계약 인수 후 source lifecycle/payload를 다음 Gate로 두며 child20~40%/150px/180f/시전당1 및 cap·겹침 미결 상태를 유지한다.” |\n\n## 영수증·한계\n\nUTC ${started}→${ended}; KST는 evidence에 기록. 지정 root/owner realpath 일치·symlink=false, 읽기21경로 시작/종료SHA 동일. 최종 명령 exit0, VM 검수 오류0. 첫 준비 명령은 D10 binding 경로 오기로 ENOENT/exit1(VM0)이었으며 소유 검수기의 읽기 경로만 교정했다. 소유3파일만 작성, 이전 산출/생산/docs/저장/Git/서버/UI/빌드/삭제/메시지/새세션0. 현재 chatId는 별도 확인하지 않아 null로 기록했고 이전 chat ID를 현재 수신 ID로 대입하지 않았다. Changes 조회는 TASK Git0에 따라 하지 않았으며 이전 수치나 제공 commit으로 현재 count를 추정하지 않았다.\n\nsource PASS는 실제 DB·로컬세이브·브라우저·전투·시각·GPU·패키지 PASS가 아니다. 다음은 총괄의 데이터 공급 계약 인수 뒤 lifecycle/payload 연결이며 독자 실행하지 않는다.\n`;
fs.writeFileSync(path.join(owner,'result.md'),result);
evidence.ownedHashes={checks:hash(fs.readFileSync(path.join(owner,'checks.mjs'))),result:hash(result)};
fs.writeFileSync(path.join(owner,'evidence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({passed:passed.length,newInputs:3,routeExecutions:5,preserved:preserved.length,docsLines:matches.length,docsFiles:files.length,ended}));
