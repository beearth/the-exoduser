import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createDocument} from '../../../team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const own=path.dirname(fileURLToPath(import.meta.url));
assert.equal(fs.realpathSync(root),root);
assert.equal(fs.realpathSync(own),path.join(root,'tools/team-followup-20261002/codex-half/UIUX'));
const allowed=['TASK.md','checks.mjs','result.md','evidence.json'];
assert.ok(fs.readdirSync(own).every(name=>allowed.includes(name)));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const files=['game.html','game-easy-test.html'];
const sources=Object.fromEntries(files.map(file=>[file,read(file)]));
const docsInputs=[
  'docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md',
  'docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md',
  'docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md',
  'docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md',
  'docs/2_1 스킬관리+합체시스템+자원/SKILL_자원게이트_감사_20261001.md'
];
const protectedFiles=[...files,'AGENTS.md',...docsInputs,
  'tools/team-followup-20261002/codex-half/UIUX/TASK.md',
  'tools/team-followup-20261002/project-teams/UIUX/result.md',
  'tools/team-followup-20261002/project-teams/UIUX/evidence.json',
  'tools/team-followup-20261002/project-teams/UIUX/candidate.patch',
  'tools/team-followup-20261001/UIUX/inventory-dom/node-dom.mjs'
];
const before=Object.fromEntries(protectedFiles.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));
const evidence={schemaVersion:1,team:'UIUX',task:'detached-old-skill-plus-callback',
  startedUTC:new Date().toISOString(),checkout:root,taskPath:path.join(own,'TASK.md'),
  productionApplied:false,previousAdopted:{sourceRED:16,candidatePASS:16,reexecuted:0,
    input:'tools/team-followup-20261002/project-teams/UIUX/evidence.json',
    note:'이전 인벤토리 이벤트 guard 결과 인수만; 스킬 카드 수명 후보와 별개'},
  priorBoundarySearch:null,inputsBefore:before,sourceFragments:{},executions:[],failures:[],
  limits:{nativeClick:false,fullRenderSkillPanel:false,runtimePASS:false,visualPASS:false,
    statement:'source fixture PASS ≠ runtime/visual PASS',
    scope:'일반 가시덫 한 시나리오만. P 교체·async reset·다른 스킬·강화 호출 검수0.'},
  prohibitedActions:{productionWrites:0,sharedDocsWrites:0,originalArtifactWrites:0,
    gitCommands:0,gitIndexWrites:0,commit:0,push:0,server:0,http:0,game:0,app:0,
    nativeUI:0,audio:0,build:0,generation:0,install:0,newSessions:0,subagents:0,
    otherChatMessages:0,fileDeletion:0,folderDeletion:0,moves:0,outsideOwnershipWrites:0},
  changes:{current:'not-observed',parentHistorical:'TASK의 기존 사용자 변경23항목 인수',
    note:'Git/count 명령0. 과거52는 이전 과제 이력이며 현행 Changes로 사용하지 않음'},
  fixtureModel:{import:'tools/team-followup-20261001/UIUX/inventory-dom/node-dom.mjs',
    additions:0,realFragments:'capture/cost/slot/_skClick/plus binding/grid clear/append',
    renderer:'추출 원문 fragment 조립. 전체 렌더·실제 브라우저는 실행하지 않음',
    synthetic:'P/G·일반 카드 상태·DOM 대역·시각/저장/사운드 호출 기록',
    rng:'Math.random 직접 호출 기록; SFX.levelup은 사운드0 기록 대역으로 내부 오디오 RNG 미검수'},
  candidate:{applied:false,location:'checks.mjs의 _skClick 메모리 변환만',
    insertion:'if(!d.isConnected||!grid.contains(d))return;',
    meaning:'현재 문서에 연결되고 현재 skillGrid에 속한 카드만 기존 콜백 실행'}
};

function search(pattern,args){
  const run=spawnSync('rg',['-n','-e',pattern,...args],{cwd:root,encoding:'utf8',maxBuffer:12*1024*1024});
  assert.ok(run.status===0||run.status===1,run.stderr);
  return {command:['rg','-n','-e',pattern,...args],exitCode:run.status,
    outputSHA256:sha(run.stdout),lineCount:run.stdout.trim()?run.stdout.trimEnd().split('\n').length:0,
    output:run.stdout,stderr:run.stderr};
}

function extract(source,marker,endMarker,from=0){
  const start=source.indexOf(marker,from);assert.ok(start>=0,'원문 시작 없음: '+marker);
  const end=source.indexOf(endMarker,start+marker.length);assert.ok(end>=0,'원문 끝 없음: '+endMarker);
  return {start,end,text:source.slice(start,end),
    lineStart:source.slice(0,start).split('\n').length,
    lineEnd:source.slice(0,end-1).split('\n').length};
}
function line(source,marker,from=0){
  const start=source.indexOf(marker,from);assert.ok(start>=0,'원문 행 없음: '+marker);
  const end=source.indexOf('\n',start);assert.ok(end>start);
  return {start,end,text:source.slice(start,end),lineStart:source.slice(0,start).split('\n').length,
    lineEnd:source.slice(0,start).split('\n').length};
}
function getFragments(source){
  const render=line(source,'function renderSkillPanel(){');
  const parts={renderDeclaration:render,
    gridReset:line(source,"const grid=$('skillGrid');grid.innerHTML='';",render.start),
    skill:line(source,"  {id:'spikeTrap',"),
    maliceCost:extract(source,'const _MALICE_COST_MUL=','function enhCostRaw('),
    upSpCost:extract(source,'function _skillUpSpCost(','function _fuseUpSpCost('),
    slotCalculations:extract(source,'function _skById(','function _repairAreaSkillSlot('),
    slotDefinitions:extract(source,'const SKILL_SLOT_DEFS=','function _skN('),
    fusePairs:extract(source,'const _FUSE_PAIRS=','function _getFuseKey('),
    isFused:line(source,'function _isFused('),
    absorbed:extract(source,'function _getAllAbsorbed(','function _isAbsorbed('),
    capture:extract(source,'    const slv=P.skills[sk.id]||0;','    // 합체 강화 통합',render.start),
    eligibilityAndCard:extract(source,'    const _singleUpSp=','    // 합체 보석 그룹',render.start),
    click:extract(source,'    function _skClick(){','    if(canLearn||canUp){',render.start),
    plus:extract(source,'    // 일반 카드(+/-) 버튼:','    // (클릭 합체는 위에서 처리됨',render.start)};
  parts.append=line(source,'    grid.appendChild(d);',parts.plus.end);
  parts.plusBinding=line(source,'        _bPlus2.onclick=',parts.plus.start);
  const skill=vm.runInNewContext('('+parts.skill.text.trim().replace(/,$/,'')+')');
  assert.equal(skill.id,'spikeTrap');assert.equal(skill.name,'가시덫');
  assert.equal(skill.spCost,10);assert.equal(skill.matCost,80);
  assert.equal(skill.cat,'phys');assert.equal(skill.act,true);assert.ok(!skill.ult&&!skill.fixed&&!skill.reqLv&&!skill.requires);
  return {parts,skill};
}

function execute(file,parts,skill,version){
  const document=createDocument();const grid=document.createElement('div');grid.id='skillGrid';document.body.appendChild(grid);
  const counts={render:0,save:0,slotUpdate:0,quickUpdate:0,sfx:0,stopPropagation:0,rng:0};
  const effects=[];const captures=[];let current=null;
  const math=Object.create(Math);math.random=()=>{counts.rng++;return .375;};
  const context=vm.createContext({document,Math:math,console:undefined,
    P:{lv:1,x:100,y:100,sp:skill.spCost*2,skills:{},_fused:{}},G:{mats:0},
    SKILL_SLOTS:[null,null,null,null,null,null],ULT_SLOT:null,_skCompact:false,_isExpanded:false,
    _isFuseUp:false,_fuseCanUp:false,
    $:id=>{assert.equal(id,'skillGrid');return grid;},
    _L:ko=>ko,_T:text=>text,SFX:{levelup:()=>{counts.sfx++;effects.push({kind:'levelup'});}},
    showPH:(...args)=>effects.push({kind:'showPH',args}),addTxt:(...args)=>effects.push({kind:'addTxt',args}),
    updateSkSlot:()=>{counts.slotUpdate++;},updateQS:()=>{counts.quickUpdate++;},
    dbSaveForce:()=>{counts.save++;},_skMinusClick:()=>{throw new Error('범위 밖 minus 호출');},
    _getAbsorbed:()=>{throw new Error('범위 밖 합체 분기');},
    recordRender:()=>{counts.render++;},
    recordCard:(card,slv,learned,canLearn,canUp)=>{
      const plus=card.children.flatMap(row=>row.children).find(node=>node.textContent==='+')||null;
      current={card,plus,slv,learned,canLearn,canUp};captures.push({slv,learned,canLearn,canUp});
    }});
  const flags=[...new Set(parts.click.text.match(/_is(?:Storm|Dim|Slam|Synth|Elem|Six|Blade|Ice|Bone|Elec|Shield|Plague|Holy|Pillar|Inferno|Siege|Dual|Thunder|Time)\w*/g)||[])];
  for(const flag of flags)context[flag]=false;
  const helperCode=`const SKILL_LIST=[${parts.skill.text.trim().replace(/,$/,'')}];
const _SK_MAP=new Map(SKILL_LIST.map(sk=>[sk.id,sk]));
${parts.maliceCost.text}${parts.upSpCost.text}${parts.slotCalculations.text}${parts.slotDefinitions.text}
${parts.fusePairs.text}${parts.isFused.text}\n${parts.absorbed.text}`;
  new vm.Script(helperCode,{filename:file+':real-cost-slot-helpers'}).runInContext(context);
  const oneLearnMat=vm.runInContext('_malCost(SKILL_LIST[0].matCost)',context);
  assert.equal(oneLearnMat,40);context.G.mats=oneLearnMat*2;
  let click=parts.click.text;
  if(version==='candidate'){
    const needle='function _skClick(){';assert.equal(click.split(needle).length,2);
    click=click.replace(needle,needle+'\n        '+evidence.candidate.insertion);
  }
  const renderer=`function renderSkillPanel(){recordRender();
${parts.gridReset.text}\nconst sk=SKILL_LIST[0];
${parts.capture.text}${parts.eligibilityAndCard.text}${click}${parts.plus.text}${parts.append.text}
recordCard(d,slv,learned,canLearn,canUp);}`;
  new vm.Script(renderer,{filename:file+':real-render-fragments:'+version}).runInContext(context);
  const snapshot=label=>({label,skillLv:context.P.skills[skill.id]||0,sp:context.P.sp,mats:context.G.mats,
    slots:[...context.SKILL_SLOTS],ultSlot:context.ULT_SLOT,counts:{...counts},effects:structuredClone(effects),
    currentCapture:{slv:current.slv,learned:current.learned,canLearn:current.canLearn,canUp:current.canUp}});
  vm.runInContext('renderSkillPanel()',context);
  const old=current;assert.ok(old.card.isConnected&&grid.contains(old.card)&&old.plus?.isConnected);
  assert.equal(old.learned,false);assert.equal(old.slv,0);
  const savedPlus=old.plus.onclick;assert.equal(typeof savedPlus,'function');
  const event={stopPropagation(){counts.stopPropagation++;}};
  const trace=[snapshot('before-connected-first')];
  old.plus.onclick(event);
  assert.equal(old.card.isConnected,false);assert.equal(old.plus.isConnected,false);assert.equal(grid.contains(old.card),false);
  assert.ok(current.card.isConnected&&grid.contains(current.card));
  trace.push({...snapshot('after-connected-first'),oldCardConnected:false,oldPlusConnected:false,oldCardInCurrentGrid:false});
  assert.equal(context.P.skills[skill.id],1);assert.equal(context.P.sp,10);assert.equal(context.G.mats,40);
  assert.deepEqual([...context.SKILL_SLOTS],['spikeTrap',null,null,null,null,null]);
  assert.equal(counts.save,1);assert.equal(counts.render,2);assert.equal(counts.sfx,1);
  const effectsBefore=structuredClone(effects);const countsBefore={...counts};
  savedPlus(event);
  trace.push({...snapshot('after-saved-detached-callback'),oldCardConnected:old.card.isConnected,
    oldPlusConnected:old.plus.isConnected,oldCardInCurrentGrid:grid.contains(old.card)});
  const delta=Object.fromEntries(Object.keys(counts).map(key=>[key,counts[key]-countsBefore[key]]));
  if(version==='source'){
    assert.equal(context.P.skills[skill.id],1);assert.equal(context.P.sp,0);assert.equal(context.G.mats,0);
    assert.equal(delta.save,1);assert.equal(delta.render,1);assert.equal(delta.sfx,1);
  }else{
    assert.equal(context.P.skills[skill.id],1);assert.equal(context.P.sp,10);assert.equal(context.G.mats,40);
    for(const key of ['save','render','sfx','slotUpdate','quickUpdate','rng'])assert.equal(delta[key],0,key);
    assert.deepEqual(effects,effectsBefore);
  }
  assert.deepEqual([...context.SKILL_SLOTS],['spikeTrap',null,null,null,null,null]);
  assert.equal(delta.stopPropagation,1,'元 plus handler remains unchanged');
  return {file,version,scenario:'connected-current + → grid rebuild → saved-detached + direct invocation',
    expectedNoDetachedEffect:version==='candidate',desiredLifetimeVerdict:version==='source'?'RED':'GREEN',
    reproductionAssertions:'PASS',normalLearnCost:{sp:skill.spCost,maliceRaw:skill.matCost,maliceFinal:oneLearnMat},
    syntheticInput:{P:{lv:1,x:100,y:100,sp:20,skills:{},_fused:{}},G:{mats:80},slots:Array(6).fill(null)},
    trace,detachedDelta:{skillLv:0,sp:version==='source'?-10:0,mats:version==='source'?-40:0,
      calls:delta,newEffects:effects.slice(effectsBefore.length)},captures,
    candidateClickSHA256:sha(click),rendererFragmentSHA256:sha(renderer),helperFragmentSHA256:sha(helperCode),
    normalDirectRNGCalls:trace[1].counts.rng,detachedDirectRNGCalls:delta.rng,
    nativeInput:false,fullRenderer:false,productionApplied:false};
}

try{
  evidence.priorBoundarySearch=search('이전 스킬 카드|스킬 카드.*수명|보관된.*콜백|_skClick.*isConnected|learned.*stale',
    ['docs','tools/team-followup-20261001/UIUX','tools/team-followup-20261002/project-teams/UIUX',
      '--glob','*.md','--glob','*.mjs','--glob','!TASK.md','--glob','!task.md']);
  assert.equal(evidence.priorBoundarySearch.exitCode,1,'기존 동일 경계 발견 시 재검사 중단');
  for(const file of files){
    const {parts,skill}=getFragments(sources[file]);
    evidence.sourceFragments[file]=Object.fromEntries(Object.entries(parts).map(([name,part])=>[name,
      {lineStart:part.lineStart,lineEnd:part.lineEnd,SHA256:sha(part.text),text:part.text}]));
    const baseline=execute(file,parts,skill,'source');evidence.executions.push(baseline);
    const candidate=execute(file,parts,skill,'candidate');evidence.executions.push(candidate);
    assert.deepEqual(candidate.trace[0],baseline.trace[0]);
    assert.deepEqual(candidate.trace[1],baseline.trace[1],'connected first callback complete effect/cost/call equivalence');
  }
  evidence.counts={scenarios:1,files:2,sourceRED:2,candidateGREEN:2,comparisonRuns:4,
    comparisonAssertions:'PASS',previous16Rerun:0,previous16Added:0};
  evidence.status='source-counterexample-reproduced-memory-candidate-verified-production-unapplied';
}catch(error){
  evidence.status='fixture-incomplete';evidence.failures.push({atUTC:new Date().toISOString(),message:error.message,stack:error.stack});
  process.exitCode=1;
}
evidence.docsSearch=search('renderSkillPanel|_skClick|skillGrid|spikeTrap|가시덫|learned|_malCost|SKILL_SLOTS|_findAutoSkillSlot|spCost|matCost|분리된.*카드|detached|isConnected',['docs']);
const docFiles=[...new Set(evidence.docsSearch.output.trimEnd().split('\n').filter(Boolean).map(row=>row.slice(0,row.indexOf(':'))))].sort();
evidence.docsSearch.fileCount=docFiles.length;evidence.docsSearch.files=docFiles;
evidence.docsSearch.fileSHA256=Object.fromEntries(docFiles.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));
evidence.docsProposal={applyProduction:false,sharedDocsEdited:false,
  target:'docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md',
  heading:'2026-10-02 분리된 스킬 카드 + 콜백 수명 — source fixture / 생산 미적용',
  exactRow:{id:'spikeTrap',name:'가시덫',condition:'P.lv=1, skills={}, SP20, 악의80, 빈 일반 슬롯',
    cost:'학습 SP10 + _malCost(80)=40; 1~4 첫 빈칸(인덱스0)',
    source:'현재 + 1회: Lv1/SP10/악의40. 분리된 보관 + 재호출: Lv1/SP0/악의0, save/render 각 +1',
    candidate:'_skClick 시작 if(!d.isConnected||!grid.contains(d))return; 연결 정상효과 동일, 분리된 재호출 비용/상태/save/render/시각/SFX/RNG0; plus stopPropagation 유지',
    verdict:'본편/easy source2 RED → 메모리 후보2 GREEN. source fixture PASS ≠ runtime/visual PASS. productionApplied=false'},
  linkedTargets:[
    {path:docsInputs[1],action:'스킬 작업공간 조작 보존 표 옆에 위 감사 링크/미적용 상태 추가'},
    {path:docsInputs[2],action:'두 개의 스킬 창 절에 동일 수명 현행 결함·미적용 후보 링크; 기존 비용·슬롯 수치 유지'},
    {path:docsInputs[3],action:'악의 소비 절에 가시덫 학습 원가80/최종40과 시전 비용 별개 링크'},
    {path:docsInputs[4],action:'시전 자원 gate 감사와 학습 UI 콜백 수명 감사 범위 구분 링크'}],
  excluded:'2_3 돌진+패링+방패시스템 수정0. 생산 채택 전 구현 완료로 기재하지 않음.',
  sourceLines:'evidence.sourceFragments[file]의 현행 행/SHA를 그대로 인계'};
evidence.inputsAfter=Object.fromEntries(protectedFiles.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));
evidence.inputPreservation=Object.fromEntries(protectedFiles.map(file=>[file,before[file]===evidence.inputsAfter[file]]));
if(!files.every(file=>evidence.inputPreservation[file])){
  evidence.failures.push({message:'작업 중 입력 소스 변경; 현행 재검사 필요'});process.exitCode=1;
}
evidence.protectedFilesAllUnchanged=Object.values(evidence.inputPreservation).every(Boolean);
evidence.ownedFiles=fs.readdirSync(own).sort();
evidence.finishedUTC=new Date().toISOString();
evidence.reproductionCommand='/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/codex-half/UIUX/checks.mjs';
fs.writeFileSync(path.join(own,'evidence.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:evidence.status,counts:evidence.counts,failures:evidence.failures.map(item=>item.message),
  protectedFilesAllUnchanged:evidence.protectedFilesAllUnchanged,docsMatches:evidence.docsSearch.lineCount,
  docsFiles:evidence.docsSearch.fileCount,docsOutputSHA256:evidence.docsSearch.outputSHA256,
  evidencePath:path.join(own,'evidence.json')},null,2));
