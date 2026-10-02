// One new minus/fusion lifetime boundary. Read-only fragments; JSON stdout only.
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
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const files=['game.html','game-easy-test.html'];
const inputs=[...files,'AGENTS.md','tools/team-followup-20261002/continuous/COMMON.md',
  'tools/team-followup-20261002/continuous/UIUX/TASK.md',
  'tools/team-followup-20261002/codex-half/UIUX/result.md',
  'tools/team-followup-20261002/codex-half/UIUX/evidence.json',
  'tools/team-followup-20261002/root-integration/uiux-skill-lifetime-checks.mjs',
  'tools/team-followup-20261001/UIUX/inventory-dom/node-dom.mjs'];
const hashInputs=()=>Object.fromEntries(inputs.map(f=>[f,sha(fs.readFileSync(path.join(root,f)))]));
const guard='if(!d.isConnected||!grid.contains(d))return;';
const report={taskId:'UIUX-MINUS-FUSION-LIFETIME-20261002',provider:'Codex',
  chatId:'01a0faaf-8fd2-7083-b174-69c604bd58b0',
  chatIdSource:'docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md',
  startedUTC:new Date().toISOString(),checkout:root,node:process.version,
  productionApplied:false,sourceFragments:{},executions:[],comparisons:[],failures:[],
  candidate:{applied:false,scope:'only _skMinusClick first statement',insertion:guard},
  priorAdopted:{productionPlusGREEN:2,plusNegativeControlRED:2,plusRerun:0,inventoryRerun:0,addedToNewCount:0},
  limits:{statement:'source fixture PASS ≠ runtime/visual/저장/청취 PASS',
    scenario:'whirlDet only; all members Lv3, connected minus → rebuild → saved detached minus direct call',
    fullRender:false,nativeInput:false,naturalDoubleClick:false,runtimePASS:false,visualPASS:false,
    storagePASS:false,audioPASS:false,otherFusion:false,resetPolicy:false,PReplacement:false,asyncReset:false},
  realBoundary:'actual _skMinusClick, host/capture/card declarations, minus binding, grid clear/append, group/member/refund helpers',
  doubles:'synthetic P/G and source-fragment renderer; existing read-only DOM; save/UI/SFX call sinks; plus callback throws if invoked',
  writes:0,gitCommands:0,server:0,http:0,game:0,uiInput:0,audio:0,build:0,install:0,newSessions:0,
  subagents:0,externalMessages:0,fileDeletion:0,moves:0};

function extract(source,startMarker,endMarker,from=0){
  const start=source.indexOf(startMarker,from);assert.ok(start>=0,'Missing start: '+startMarker);
  const end=source.indexOf(endMarker,start+startMarker.length);assert.ok(end>=0,'Missing end: '+endMarker);
  return {start,end,text:source.slice(start,end),lineStart:source.slice(0,start).split('\n').length,
    lineEnd:source.slice(0,end-1).split('\n').length};
}
function line(source,marker,from=0){
  const start=source.indexOf(marker,from);assert.ok(start>=0,'Missing line: '+marker);
  const end=source.indexOf('\n',start);assert.ok(end>start);
  return {start,end,text:source.slice(start,end),lineStart:source.slice(0,start).split('\n').length,
    lineEnd:source.slice(0,start).split('\n').length};
}
function fragments(source){
  const render=line(source,'function renderSkillPanel(){');
  const row=line(source,'function _renderSkillRow(sk,grid){');
  const p={render,row,
    gridReset:line(source,"const grid=$('skillGrid');grid.innerHTML='';",render.start),
    whirlwind:line(source,"  {id:'whirlwind',"),detonate:line(source,"  {id:'detonate',"),
    refundHelpers:extract(source,'function _skillUpSpCost(','function _skillSpentSp('),
    maliceCost:extract(source,'const _MALICE_COST_MUL=','function enhCostRaw('),
    fuseGroups:extract(source,'const _FUSE_GEM_GROUPS=','// 하위호환: 기존 _FUSE_GEMS'),
    fusePairs:extract(source,'const _FUSE_PAIRS=','function _getFuseKey('),
    isFused:line(source,'function _isFused('),isDimBreach:line(source,'function isDimBreach('),
    groupSelector:extract(source,'function _fuseGemGroup(','function _allFuseGemGroups('),
    hostCaptureCard:extract(source,'    const _dimFuse=isDimBreach();','    // 합체 보석 그룹',row.start),
    learnedCapture:line(source,'    const learned=slv>=1;',row.start),
    minus:extract(source,'    function _skMinusClick(){','    // 박스 클릭 이벤트:',row.start),
    buttons:extract(source,'    // 일반 카드(+/-) 버튼:','    // (클릭 합체는 위에서 처리됨',row.start)};
  p.minusBinding=line(source,'        _bMin2.onclick=',p.buttons.start);
  p.append=line(source,'    grid.appendChild(d);',p.buttons.end);
  p.plusFirstStatement=line(source,'    function _skClick(){',p.minus.end);
  assert.ok(p.plusFirstStatement.text.includes(guard),'Prior adopted plus production guard missing');
  assert.ok(!p.minus.text.includes(guard),'Minus already guarded: do not manufacture RED');
  assert.equal(p.minusBinding.text.trim(),"_bMin2.onclick=(ev)=>{ev.stopPropagation();_skMinusClick()};");
  return p;
}

function execute(file,p,version){
  const document=createDocument(),grid=document.createElement('div');
  grid.id='skillGrid';document.body.appendChild(grid);
  const counts={render:0,save:0,slotUpdate:0,quickUpdate:0,sfx:0,stopPropagation:0,rng:0};
  const effects=[];const captures=[];let current=null;
  const math=Object.create(Math);math.random=()=>{counts.rng++;return .375;};
  const context=vm.createContext({document,Math:math,
    P:{lv:100,x:100,y:100,sp:10,skills:{},_fused:{},activeLMBSk:'whirlwind'},G:{mats:80},
    SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,_fuseSelId:null,_skCompact:false,_isExpanded:false,
    $:id=>{assert.equal(id,'skillGrid');return grid;},_L:ko=>ko,_T:text=>text,
    SFX:{pickup:()=>{counts.sfx++;effects.push({kind:'pickup'});}},
    addTxt:(...args)=>effects.push({kind:'addTxt',args}),updateSkSlot:()=>{counts.slotUpdate++;},
    updateQS:()=>{counts.quickUpdate++;},dbSaveForce:()=>{counts.save++;},
    _skClick:()=>{throw new Error('Out of scope: plus must not execute');},
    recordRender:()=>{counts.render++;},recordCard:(card,slv,learned,canLearn,canUp)=>{
      current={card,minus:card.children.flatMap(row=>row.children).find(n=>n.textContent==='-')||null,
        slv,learned,canLearn,canUp};captures.push({slv,learned,canLearn,canUp});
    }});
  const helpers=`const SKILL_LIST=[${p.whirlwind.text.trim().replace(/,$/,'')},${p.detonate.text.trim().replace(/,$/,'')}];
${p.refundHelpers.text}${p.maliceCost.text}${p.fuseGroups.text}${p.fusePairs.text}${p.isFused.text}
${p.isDimBreach.text}\n${p.groupSelector.text}`;
  new vm.Script(helpers,{filename:file+':actual-refund-group-helpers'}).runInContext(context);
  const selection=vm.runInContext(`(()=>{const key='whirlDet',group=_FUSE_GEM_GROUPS[key],ids=[...group.skills];
    if(!group||ids.length!==2||ids.join(',')!==_FUSE_PAIRS[key].join(','))throw new Error('Real group contract changed');
    for(const id of ids)P.skills[id]=3;P._fused[key]=true;
    return {key,members:ids,explicitStar:group.star??null,star:group.star||ids.length,
      definition:JSON.parse(JSON.stringify(group)),pairs:[..._FUSE_PAIRS[key]],
      selectedGroup:_fuseGemGroup(ids[0]).key,
      refund3to2:_fuseUpSpCost(2,group.star||ids.length),refund2to1:_fuseUpSpCost(1,group.star||ids.length)};
  })()`,context);
  assert.equal(selection.key,'whirlDet');assert.equal(selection.selectedGroup,'whirlDet');
  assert.equal(selection.star,2);assert.equal(selection.refund3to2,2);assert.equal(selection.refund2to1,2);
  let minus=p.minus.text;
  if(version==='candidate'){
    const needle='function _skMinusClick(){';assert.equal(minus.split(needle).length,2);
    minus=minus.replace(needle,needle+'\n        '+guard);
  }
  const renderer=`function renderSkillPanel(){recordRender();
${p.gridReset.text}\nconst sk=SKILL_LIST[0];
${p.hostCaptureCard.text}${minus}${p.buttons.text}${p.append.text}
recordCard(d,slv,learned,canLearn,canUp);}`;
  new vm.Script(renderer,{filename:file+':actual-row-fragments:'+version}).runInContext(context);
  const snapshot=label=>({label,members:JSON.parse(JSON.stringify(context.P.skills)),sp:context.P.sp,mats:context.G.mats,
    fused:JSON.parse(JSON.stringify(context.P._fused)),slots:[...context.SKILL_SLOTS],ultSlot:context.ULT_SLOT,
    activeLMBSk:context.P.activeLMBSk,counts:{...counts},effects:structuredClone(effects),
    capture:{slv:current.slv,learned:current.learned,canLearn:current.canLearn,canUp:current.canUp}});
  vm.runInContext('renderSkillPanel()',context);
  const old=current,savedMinus=old.minus?.onclick;
  assert.ok(old.card.isConnected&&grid.contains(old.card)&&old.minus?.isConnected);
  assert.equal(typeof savedMinus,'function');assert.equal(old.learned,true);assert.equal(old.slv,3);
  const trace=[snapshot('start')],event={stopPropagation(){counts.stopPropagation++;}};
  old.minus.onclick(event);
  assert.ok(!old.card.isConnected&&!old.minus.isConnected&&!grid.contains(old.card));
  assert.ok(current.card!==old.card&&current.card.isConnected&&grid.contains(current.card));
  trace.push({...snapshot('after-connected-first'),oldCardConnected:false,oldMinusConnected:false,oldCardInCurrentGrid:false});
  assert.deepEqual(trace[1].members,{whirlwind:2,detonate:2});assert.equal(trace[1].sp,12);
  assert.equal(trace[1].mats,80);assert.deepEqual(trace[1].fused,{whirlDet:true});
  assert.deepEqual(trace[1].slots,Array(6).fill(null));assert.equal(trace[1].ultSlot,null);
  assert.equal(trace[1].counts.render,2);assert.equal(trace[1].counts.save,1);assert.equal(trace[1].counts.sfx,1);
  assert.equal(trace[1].counts.slotUpdate,1);assert.equal(trace[1].counts.quickUpdate,1);
  assert.equal(trace[1].effects.length,2);assert.equal(trace[1].counts.rng,0);
  savedMinus(event);
  trace.push({...snapshot('after-saved-detached'),oldCardConnected:old.card.isConnected,
    oldMinusConnected:old.minus.isConnected,oldCardInCurrentGrid:grid.contains(old.card)});
  const a=trace[1],b=trace[2],delta=Object.fromEntries(Object.keys(counts).map(k=>[k,b.counts[k]-a.counts[k]]));
  assert.equal(delta.stopPropagation,1,'Original minus wrapper stopPropagation preserved');
  assert.equal(b.mats,a.mats);assert.deepEqual(b.fused,a.fused);assert.deepEqual(b.slots,a.slots);
  assert.equal(b.ultSlot,a.ultSlot);assert.equal(b.activeLMBSk,a.activeLMBSk);
  const noDetachedEffect=()=>{
    assert.deepEqual(b.members,a.members,'Detached minus must not lower members again');assert.equal(b.sp,a.sp);
    for(const key of ['render','save','slotUpdate','quickUpdate','sfx','rng'])assert.equal(delta[key],0,key);
    assert.deepEqual(b.effects,a.effects);
  };
  let rejection=null;
  if(version==='source'){
    assert.deepEqual(b.members,{whirlwind:1,detonate:1});assert.equal(b.sp,14);
    for(const key of ['render','save','slotUpdate','quickUpdate','sfx'])assert.equal(delta[key],1,key);
    try{noDetachedEffect();}catch(error){assert.equal(error.name,'AssertionError');rejection=error.message;}
    assert.ok(rejection,'Current source must fail the same zero-effect lifetime criterion');
  }else noDetachedEffect();
  return {file,version,verdict:version==='source'?'RED':'GREEN',verification:'PASS',
    criterion:'Detached old minus has no further member/refund/save/UI/SFX effects',rejection,
    selection:JSON.parse(JSON.stringify(selection)),trace,captures,
    detachedDelta:{members:Object.fromEntries(selection.members.map(id=>[id,b.members[id]-a.members[id]])),
      sp:b.sp-a.sp,mats:b.mats-a.mats,calls:delta,newEffects:b.effects.slice(a.effects.length)},
    helperSHA256:sha(helpers),rendererSHA256:sha(renderer),minusSHA256:sha(minus),
    nativeInput:false,fullRender:false,storageIO:false,audioPlayback:false};
}

let before;
try{
  assert.equal(fs.realpathSync(root),root);assert.equal(fs.realpathSync(own),path.join(root,'tools/team-followup-20261002/continuous/UIUX'));
  assert.equal(fs.realpathSync(path.join(own,'TASK.md')),path.join(own,'TASK.md'));
  assert.ok(fs.readdirSync(own).every(n=>['TASK.md','checks.mjs','result.md','evidence.json'].includes(n)));
  before=hashInputs();report.inputsBefore=before;
  const args=['-n','-e','minus.*(detached|수명)|_skMinusClick.*isConnected|분리된.*minus|이전 minus',
    'docs','tools/team-followup-20261001/UIUX','tools/team-followup-20261002/codex-half/UIUX',
    'tools/team-followup-20261002/project-teams/UIUX','--glob','*.md','--glob','*.mjs','--glob','!TASK.md','--glob','!task.md'];
  const r=spawnSync('rg',args,{cwd:root,encoding:'utf8',maxBuffer:1024*1024});
  assert.ok(r.status===0||r.status===1,r.stderr);
  report.priorBoundarySearch={command:['rg',...args],exit:r.status,output:r.stdout,outputSHA256:sha(r.stdout)};
  const matches=r.stdout.trimEnd().split('\n').filter(Boolean);
  assert.ok(matches.every(l=>l.includes('CONTINUOUS-DISPATCH-20261002.md')&&l.includes('prepared_not_sent')),
    'Previous same completed boundary found: adopt instead of rerun');
  report.priorBoundarySearch.classification='Only prepared TASK assignment, no prior completed lifetime fixture found';
  for(const file of files){
    const p=fragments(read(file));
    report.sourceFragments[file]=Object.fromEntries(Object.entries(p).map(([k,v])=>[k,
      {lineStart:v.lineStart,lineEnd:v.lineEnd,SHA256:sha(v.text),text:v.text}]));
    const source=execute(file,p,'source');report.executions.push(source);
    const candidate=execute(file,p,'candidate');report.executions.push(candidate);
    assert.deepEqual(candidate.trace[0],source.trace[0]);
    assert.deepEqual(candidate.trace[1],source.trace[1],'Connected first effect/refund/member consistency equivalence');
    report.comparisons.push({file,normalConnectedCompleteEquivalence:'PASS',currentDetachedCriterion:'RED',candidateDetachedCriterion:'GREEN'});
  }
  report.counts={scenarios:1,files:2,sourceRED:2,candidateGREEN:2,comparisonRuns:4,previousRerun:0,previousAdded:0};
}catch(error){report.failures.push({message:error.message,stack:error.stack});}
try{
  report.inputsAfter=hashInputs();report.preservation=Object.fromEntries(inputs.map(f=>[f,before?.[f]===report.inputsAfter[f]]));
  assert.ok(Object.values(report.preservation).every(Boolean),'Protected input changed while checking');
}catch(error){report.failures.push({message:error.message});}
report.finishedUTC=new Date().toISOString();
report.finishedKST=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Seoul'})+' KST';
report.status=report.failures.length?'FAIL':'PASS';
if(report.failures.length)process.exitCode=1;
console.log(JSON.stringify(report,null,2));
