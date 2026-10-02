import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner=path.join(root,'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-equip-same-instance-transfer-hb1014');
assert.equal(fs.realpathSync(process.cwd()),root);assert.equal(fs.realpathSync(owner),owner);assert(!fs.lstatSync(owner).isSymbolicLink());
const started=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const paths=['game.html','game-easy-test.html','AGENTS.md','tools/team-followup-20261002/continuous/COMMON.md',path.relative(root,path.join(owner,'TASK.md')),
 'docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/7아이템디자인/ITEM_TEAM_MASTER.md',
 'docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md','docs/14밸런스+수치테이블/자원소비량표.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md',
 'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-enhancement-gate-binding-0557/TASK.md',
 'tools/team-followup-20261002/supervisor-next/ITEM/ITEM-enhancement-gate-binding-0557/result.md'];
const reads=paths.map(p=>({path:p,text:fs.readFileSync(path.join(root,p),'utf8')})),anchors=[],rows=[],groups=[];
function anchor(file,label,source,i,end){assert(i>=0,label);const text=source.slice(i,end);anchors.push({file,label,line:source.slice(0,i).split('\n').length,bytes:Buffer.byteLength(text),sha256:sha(text)});return text;}
function func(file,source,name,optional=false){const i=source.indexOf('function '+name+'(');if(i<0&&optional)return '';assert(i>=0,name);const a=parseExpressionAt(source,i,{ecmaVersion:'latest'});return anchor(file,name,source,i,a.end);}
function constant(file,source,name){const prefix='const '+name+'=';const i=source.indexOf(prefix);assert(i>=0,name);const a=parseExpressionAt(source,i+prefix.length,{ecmaVersion:'latest'});return anchor(file,name,source,i,a.end)+';';}
for(const file of ['game.html','game-easy-test.html']){
  const source=reads.find(r=>r.path===file).text;
  const original=func(file,source,'equipItem'),caller=func(file,source,'_invBagRightClick');
  const oldLine=file==='game.html'?'const old=INV.equipped[equipSlot];':'const old=INV.equipped[item.slot];';
  assert.equal(original.split(oldLine).length,2);
  const candidate=original.replace(oldLine,oldLine+'\n  if(old===item)return;');
  const helpers=['xferCost','_malCost','_itemEconomyRarity','enhColor'].map(n=>func(file,source,n)).join('\n')+'\n'+func(file,source,'_earringSlot',true)+'\n'+func(file,source,'_equipSlot',true);
  const constants=['_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>constant(file,source,n)).join('\n');
  function run(same,patched){
    const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0};
    const old={id:'old',slot:'armor',name:'검토 기존 갑옷',rarity:5,enh:2,_enhRefund:13,reqLv:0,socketCount:1,crystals:[crystal],_gx:0,_gy:0,uniqueId:'UI-10',uniqueRoll:{version:1,effectId:'U-D10',stat:'_uSlamEmberRage',unit:'fraction',storedValue:.15}};
    const target=same?old:{id:'next',slot:'armor',name:'교체 갑옷',rarity:0,enh:0,reqLv:0,socketCount:1,crystals:[null],_gx:2,_gy:3};
    const bag=[target],binding=old.uniqueRoll,crystals=old.crystals,events=[];
    const trace={rng:0,recalc:0,sfx:0,save:0,lesson:0,apply:0,render:0};
    const math=Object.create(Math);math.random=()=>{trace.rng++;throw Error('unexpected RNG');};
    const note=n=>()=>{trace[n]++;events.push(n);};
    const c=vm.createContext({Math:math,P:{lv:100,x:0,y:0},G:{mats:10000},INV:{bag,equipped:{armor:old}},CRYSTAL_BAG:[],
      _earringEquipTarget:null,_itemSz:()=>[2,3],_invFindSpace:()=>{throw Error('same-size grid');},
      $:()=>({dataset:{inventoryPage:'inventory'}}),_T:s=>s,_L:s=>s,_crDefN:d=>d.ko,
      notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),recalcSt:note('recalc'),playEquipSfx:note('sfx'),dbSaveForce:note('save'),
      window:{_systemLesson:{equipped:note('lesson')}},applyStats:note('apply'),renderInv:note('render')});
    vm.runInContext(constants+'\n'+helpers+'\n'+(patched?candidate:original)+'\n'+caller,c);
    assert.equal(vm.runInContext('_itemEconomyRarity(5)',c),4);
    const cost=vm.runInContext('xferCost(2)',c);
    const snapshot=()=>({mats:c.G.mats,equipped:c.INV.equipped.armor.id,bag:c.INV.bag.map(i=>i.id),old:structuredClone(old),target:structuredClone(target),crystalBag:structuredClone(c.CRYSTAL_BAG)});
    const before=snapshot(),ret=vm.runInContext('_invBagRightClick(0)',c),after=snapshot();
    assert.equal(ret,undefined);assert.equal(old.uniqueRoll,binding);assert.equal(old.crystals,crystals);
    const totalCrystalCount=old.crystals.filter(Boolean).length+(same?0:target.crystals.filter(Boolean).length)+c.CRYSTAL_BAG.length;
    const row={file,same,patched,cost,before,after,events,trace,totalCrystalCount,returnType:typeof ret,
      bindingIdentity:true,crystalArrayIdentity:true,bagIdentity:c.INV.bag===bag,
      crystalIdentity:c.CRYSTAL_BAG.includes(crystal)||old.crystals.includes(crystal)||target.crystals.includes(crystal),
      equippedIdentity:c.INV.equipped.armor===target,oldInBag:c.INV.bag.includes(old)};
    rows.push(row);return row;
  }
  const red=run(true,false),green=run(true,true),normal=run(false,false),normalCandidate=run(false,true);
  assert.equal(red.cost,1000);assert.equal(red.after.mats,9000);assert.equal(red.after.old.enh,0);assert.equal(red.after.old._enhRefund,4);
  assert.deepEqual(red.after.old.crystals,[null]);assert.equal(red.after.crystalBag.length,1);assert.equal(red.totalCrystalCount,1);assert(red.crystalIdentity);
  groups.push(file+': original alias defect reproduced (enh loss; crystal ejection, no total loss)');
  assert.deepEqual(green.before,green.after);assert(green.bagIdentity&&green.bindingIdentity&&green.crystalIdentity&&green.equippedIdentity);
  assert.deepEqual(green.events,['apply','render']);for(const n of ['rng','recalc','sfx','save','lesson'])assert.equal(green.trace[n],0);
  groups.push(file+': same-instance memory guard preserves all domain state');
  assert.deepEqual(normal.after,normalCandidate.after);assert.deepEqual(normal.events,normalCandidate.events);assert.deepEqual(normal.trace,normalCandidate.trace);
  assert.equal(normal.after.target.enh,2);assert.equal(normal.after.old.enh,0);assert.equal(normal.after.old._enhRefund,4);assert.equal(normal.after.mats,9000);
  assert.deepEqual(normal.after.old.crystals,[null]);assert.equal(normal.after.target.crystals[0].id,red.after.crystalBag[0].id);assert.equal(normal.after.crystalBag.length,0);
  assert(normal.oldInBag&&normal.equippedIdentity&&normal.bindingIdentity&&normal.crystalIdentity);assert.equal(normal.totalCrystalCount,1);
  assert.equal(normal.trace.save,1);assert.equal(normal.trace.rng,0);
  groups.push(file+': distinct-object enhancement/crystal transfer normal control equivalent');
  for(const label of ['function pickupItem(',"if(source==='bag')",'function withdrawStorage(',"onclick=\"equipItem(INV.bag[${idx}]);applyStats();renderInv()\"","onclick=\"unequipItem('${idx}');applyStats();renderInv()\""]){
    const i=source.indexOf(label);assert(i>=0,label);anchor(file,'reachable: '+label,source,i,i+label.length);
  }
}
const args=['-n','equipItem|_equipSlot|xferCost|_enhRefund|결정 전승|결정 자동 전승|강화 전승|강화 이전|동일 객체|동일.*인스턴스','docs/'];
const search=spawnSync('rg',args,{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(search.status,0);
const matches=search.stdout.trim().split('\n'),files=[...new Set(matches.map(s=>s.split(':')[0]))];
const preservation=reads.map(r=>({path:r.path,sha256AtRead:sha(r.text),sha256AtEnd:sha(fs.readFileSync(path.join(root,r.path))),same:sha(r.text)===sha(fs.readFileSync(path.join(root,r.path)))}));
const ended=new Date().toISOString();
const evidence={taskId:'ITEM-equip-same-instance-transfer-hb1014',provider:'existing ITEM Codex chat',supervisorChatId:'01a0fb1e-4ec3-7dd3-bba2-f87518e881fa',currentChatId:null,providedHistoricalPin:'6b865637; not independently observed HEAD',startedUTC:started,endedUTC:ended,endedKST:new Date(Date.parse(ended)+32400000).toISOString().replace('Z','+09:00'),root,owner,realpath:fs.realpathSync(owner),symlink:false,reads:preservation,anchors,rows,validation:{groups,passed:groups.length,failed:0,actualEquipAndCallerExecutions:8,previousTestsRepeated:0},candidatePatch:'Insert if(old===item)return; immediately after computed old assignment, before enhancement transfer, in each equipItem.',productionApplied:false,runtimeAccepted:false,stubs:['P.lv/position','same-size 2x3 grid','inventory panel dataset','translation/crystal display text','notify/addTxt/recalc/equipSfx/lesson/save/applyStats/renderInv observation only','Math.random throw guard'],actual:['both full equipItem and _invBagRightClick functions','main _earringSlot/_equipSlot functions','xferCost/_malCost/rarity/enhColor and cost constant','actual crystal slot/definition/MAX constants; synthetic legal crystal instances'],limits:['alias in bag/equipped is explicitly supplied, not produced by normal UI proof','self crystal moved to bag; total crystal count preserved in sample','normal single empty socket tested; full bag/grid/crystal capacity variants not tested','audio/stat/DB/native/runtime not executed','level/earring target/swap variant coverage not claimed'],docsSearch:{command:['rg',...args],exit:search.status,lines:matches.length,files,outputSHA256:sha(search.stdout)},commands:[{command:'exact TASK first Read and bounded canonical/source/caller reads',exit:0},{command:process.execPath+' '+path.join(owner,'checks.mjs'),exit:0}],errors:[],toolsActuallyCalled:['functions.exec / exec_command','functions.exec / apply_patch'],skillsUsed:[],writes:['checks.mjs','result.md'],gitCommands:0,productionSharedDocsPriorArtifactsWrites:0,gameServerHTTPSaveBuildImageInstallPublish:0,newTeamsChatsMessages:0,deletion:0,checksSHA256:sha(fs.readFileSync(path.join(owner,'checks.mjs')))};
const report=`# ITEM — 동일 장착 인스턴스 재장착 전승 손실\n\n**양쪽 실제 원함수에서 강화 손실과 결정 자동탈착을 재현했고, 한 줄 메모리 guard와 정상 교체 control이 통과했다.** productionApplied=false/runtimeAccepted=false, 생산/공유docs/Git 변경0이다. 이번8실행/6검증그룹만 보고하며 기존499/500·binding/전체 검사 반복0이다.\n\n## 재현·후보·정상 control\n\n| 양쪽 입력/원문 | 결과 |\n|---|---|\n| 장착 armor와 bag[0]가 동일 객체, enh2/rarity5, 소켓1개에 해당 판의 방어 결정1개, 악의10000 | 실제 _invBagRightClick(0)→equipItem: 비용1000 차감·enh2→0·환수13→4. 소켓은null, 결정은주머니로이동1. 결정 identity/총량1 보존; 총량 손실/복제를 관측했다고 주장하지 않음 |\n| 동일 입력＋메모리 guard | mats/enh/refund/crystals/binding/가방/그리드 전부 불변. equip의 recalc/SFX/lesson/save0. caller의 applyStats/renderInv 대역은 기존대로 각1회이며 전체 UI 호출0이라고 주장하지 않음 |\n| 서로 다른 장착/새 armor 객체, 새 소켓1개 empty | 원문/후보 상태·호출순서 동일. mats9000, 새enh2/oldenh0·환수4, 동일결정이 새소켓으로전승·주머니0, 동일old 가방반환. old D10 binding 참조 그대로 |\n\n2강 이전비는 실제 xferCost/_malCost의 _malCost(ceil(2×1000))=1000이며 할인상수0.5를 원문 실행했다. rarity5→경제등급4의 배율1.8, 레거시누적항ceil(2×1.8)=4를2회 합산×0.5하여환수4. 공식/비용/환수율/결정슬롯/D10 schema 변경0.\n\n## reachable 경계\n\nmain/easy의 장착칸 상세/우클릭은 unequip을 호출하고 가방 상세 장착 버튼과 _invBagRightClick은 INV.bag 참조를 전달한다. main의 _equipEarringTo는 bag.includes 가드도 있다. 정상 pickup/장착 이동은 가방과 장착칸을 분리하므로 **정상 UI만으로 동일참조가 생성됐다고 증명하지 않았다**. world item pickup·storage withdraw는 객체를 가방으로 전달하지만 이번엔 실제 drop/restore/storage 실행0이다.\n\n명시적 INV.bag[0]===INV.equipped.armor alias 입력에서 actual bag-right-click caller는 membership/동일객체 차단 없이 해당 참조를 넘기며 원함수의 old와item이같다. 이는 조건부 reachable source 증거다. root가 실제게임발생빈도/alias유입을 추가 확인해야 하며 사용자 세이브를 조사/수리하지 않았다. guard는 alias자료를 정리하지 않고 동일객체 호출의 추가손실만 막는다.\n\n## 최소 메모리 patch\n\nmain은 _equipSlot/명시earring target 계산 후, easy는 item.slot 조회 후 각 old declaration 바로 다음에 아래1줄만삽입했다. 레벨/bonePart 가드·다른객체 정상전승 순서는 그대로다. 함수 시그니처를 바꾸거나 item.id로 객체 identity를 대체하지 않았다.\n\n\`\`\`diff\n const old=INV.equipped[equipSlot]; // main; easy uses INV.equipped[item.slot]\n+if(old===item)return;\n\`\`\`\n\n## 원문/실행 증거\n\nUTC ${started}→${ended}; KST는 아래JSON에기록. 각 판 전체source/read SHA 및 함수/caller/상수/패치anchors SHA를 고정했다. 공유WIP가바뀌면 시작/종료관측을 구분하며 historical6b865637을currentHEAD라쓰지 않는다.\n\n| 원함수 | 현재행 | SHA-256 |\n|---|---|---|\n${anchors.filter(a=>['equipItem','_invBagRightClick','_equipSlot','xferCost'].includes(a.label)).map(a=>`| ${a.file} ${a.label} | ${a.line} | ${a.sha256} |`).join('\n')}\n\nactual 전체equip/caller와비용·환수등급·enhColor/helper·결정데이터를실행했다. 대역은level/좌표/grid·UI후처리/음향/저장관찰기이며 가짜enh/결정이전counter로core처리를대체하지않았다. 합법합성 armor 및결정인스턴스만주입했다. main은cr_martyr_tear/easy는cr_hp의현행데이터와armor허용을사용했다. real stat/UI/audio/DB/native는미검수다.\n\n## docs old/new 인계\n\n전체docs rg1회: ${matches.length}행/${files.length}파일. 공유docs 쓰기0이며 감독/root에게다음표를인계한다.\n\n| 정본/항목 | old 현재 | new 통합 시 정확문안 |\n|---|---|---|\n| 인벤토리 장착 자동전승 | old===item도강화/결정전승진입 | “equipItem은 계산된 장착 대상old와item이동일참조면전승전return한다. 동일인스턴스에는악의차감/enh초기화/_enhRefund기록/결정이동/가방교체/장착후처리가없다. caller applyStats/renderInv는기존대로다.” |\n| ITEM_TEAM_MASTER | 동일인스턴스보호생산미적용 | “양쪽 원함수alias재장착의강화2→0·악의1000차감·결정소켓→주머니를재현했다. 메모리identityguard로불변, 서로다른객체control강화·결정전승동등. 담당6그룹/8실행,생산미적용·실게임미검수.” |\n| 저장 SSOT/환수 | 레거시누적식floor(합×.5),비용 _malCost(ceil(n×1000)) | 공식/필드/D10 binding은불변. “동일참조guard는재호출보호이며저장schema/alias마이그레이션/누락binding보충이아니다. productionApplied=false 상태는root통합전까지유지한다.” |\n\n양판control필수경계까지완료했으며runtime gate는실제caller/alias유입·기존강화/결정UI·저장/재실행검수다. 귀걸이슬롯간이동·가득찬결정주머니·grid실패/특수장비는이번표본범위밖이다. root _skUnclick/카드minus 조사·검사0. 소유2파일만작성, 새업무/새팀/삭제/메시지0.\n\n## 실행 evidence JSON\n\n\`\`\`json\n${JSON.stringify(evidence,null,2)}\n\`\`\`\n`;
fs.writeFileSync(path.join(owner,'result.md'),report);
console.log(JSON.stringify({task:evidence.taskId,passed:groups.length,executions:8,defect:'enhancement erased; crystal ejected but total preserved',memoryCandidate:'old===item return',productionApplied:false,runtimeAccepted:false,docsLines:matches.length,ended}));
