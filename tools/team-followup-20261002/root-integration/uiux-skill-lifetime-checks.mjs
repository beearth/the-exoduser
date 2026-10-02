// Read-only production regression: actual source fragments, one general skill scenario.
// Outputs JSON to stdout only; the imported DOM model has no filesystem side effects.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createDocument} from '../../team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const own=path.join(root,'tools/team-followup-20261002/root-integration/uiux-skill-lifetime-checks.mjs');
const files=['game.html','game-easy-test.html'];
const legacyPrefix='tools/team-followup-20261002/codex-half/UIUX/';
const protectedFiles=[...files,...['TASK.md','checks.mjs','result.md','evidence.json'].map(f=>legacyPrefix+f),
  'tools/team-followup-20261001/UIUX/inventory-dom/node-dom.mjs',path.relative(root,own)];
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const hashInputs=()=>Object.fromEntries(protectedFiles.map(f=>[f,sha(fs.readFileSync(path.join(root,f)))]));
const guard='if(!d.isConnected||!grid.contains(d))return;';
const report={task:'production-skill-card-lifetime',startedUTC:new Date().toISOString(),checkout:root,
  node:process.version,executions:[],comparisons:[],failures:[],
  counts:{scenarios:1,files:2,productionGREEN:0,negativeControlRED:0,comparisonRuns:0},
  writes:0,gitCommands:0,server:0,game:0,uiInput:0,
  limits:{nativeInput:false,fullRenderSkillPanel:false,visualPASS:false,runtimePASS:false,
    statement:'source fixture PASS ≠ runtime/visual PASS',
    scope:'General unfolded spikeTrap card only; real source cost/slot/click/plus/grid fragments.',
    synthetic:'P/G and existing small DOM model; save/UI/SFX sinks count calls only.',
    untested:['compact/detail/fusion/upgrade/minus','P replacement or async reset','native queued callback reachability',
      'real storage IO','audio internals and audio RNG','full render and browser boot']}};

function extract(source,startMarker,endMarker,from=0){
  const start=source.indexOf(startMarker,from);assert.ok(start>=0,'Missing source marker: '+startMarker);
  const end=source.indexOf(endMarker,start+startMarker.length);assert.ok(end>=0,'Missing end marker: '+endMarker);
  return {start,end,text:source.slice(start,end),lineStart:source.slice(0,start).split('\n').length,
    lineEnd:source.slice(0,end-1).split('\n').length};
}
function line(source,marker,from=0){
  const start=source.indexOf(marker,from);assert.ok(start>=0,'Missing source line: '+marker);
  const end=source.indexOf('\n',start);assert.ok(end>start);
  return {start,end,text:source.slice(start,end),lineStart:source.slice(0,start).split('\n').length,
    lineEnd:source.slice(0,start).split('\n').length};
}
function fragments(source){
  const render=line(source,'function renderSkillPanel(){');
  const parts={render,
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
    card:extract(source,'    const _singleUpSp=','    // 합체 보석 그룹',render.start),
    click:extract(source,'    function _skClick(){','    if(canLearn||canUp){',render.start),
    plus:extract(source,'    // 일반 카드(+/-) 버튼:','    // (클릭 합체는 위에서 처리됨',render.start)};
  parts.append=line(source,'    grid.appendChild(d);',parts.plus.end);
  parts.plusBinding=line(source,'        _bPlus2.onclick=',parts.plus.start);
  assert.equal(parts.click.text.split(guard).length-1,1,'Exactly one production lifetime guard');
  assert.ok(parts.click.text.slice(parts.click.text.indexOf('{')+1).trimStart().startsWith(guard),
    'Lifetime guard must be the first statement');
  const skill=vm.runInNewContext('('+parts.skill.text.trim().replace(/,$/,'')+')');
  assert.equal(skill.id,'spikeTrap');assert.equal(skill.name,'가시덫');
  assert.equal(skill.spCost,10);assert.equal(skill.matCost,80);
  assert.equal(skill.cat,'phys');assert.equal(skill.act,true);
  assert.ok(!skill.ult&&!skill.fixed&&!skill.reqLv&&!skill.requires);
  return {parts,skill};
}

function assertNoDetachedEffect(first,after){
  assert.equal(after.skillLv,first.skillLv,'Detached callback must not change skill level');
  assert.equal(after.sp,first.sp,'Detached callback must not charge SP');
  assert.equal(after.mats,first.mats,'Detached callback must not charge malice');
  assert.deepEqual(after.slots,first.slots);assert.equal(after.ultSlot,first.ultSlot);
  for(const key of ['render','save','slotUpdate','quickUpdate','sfx','rng'])
    assert.equal(after.counts[key],first.counts[key],'Detached callback effect: '+key);
  assert.deepEqual(after.effects,first.effects);
}
function execute(file,parts,skill,version){
  const document=createDocument(),grid=document.createElement('div');
  grid.id='skillGrid';document.body.appendChild(grid);
  const counts={render:0,save:0,slotUpdate:0,quickUpdate:0,sfx:0,stopPropagation:0,rng:0};
  const effects=[];let current=null;
  const math=Object.create(Math);math.random=()=>{counts.rng++;return .375;};
  const context=vm.createContext({document,Math:math,console:undefined,
    P:{lv:1,x:100,y:100,sp:20,skills:{},_fused:{}},G:{mats:80},
    SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,_skCompact:false,_isExpanded:false,
    _isFuseUp:false,_fuseCanUp:false,
    $:id=>{assert.equal(id,'skillGrid');return grid;},_L:ko=>ko,_T:text=>text,
    SFX:{levelup:()=>{counts.sfx++;effects.push({kind:'levelup'});}},
    showPH:(...args)=>effects.push({kind:'showPH',args}),addTxt:(...args)=>effects.push({kind:'addTxt',args}),
    updateSkSlot:()=>{counts.slotUpdate++;},updateQS:()=>{counts.quickUpdate++;},dbSaveForce:()=>{counts.save++;},
    _skMinusClick:()=>{throw new Error('Out-of-scope minus invocation');},
    _getAbsorbed:()=>{throw new Error('Out-of-scope fusion invocation');},
    recordRender:()=>{counts.render++;},
    recordCard:(card,slv,learned,canLearn,canUp)=>{
      current={card,plus:card.children.flatMap(row=>row.children).find(n=>n.textContent==='+')||null,
        slv,learned,canLearn,canUp};
    }});
  const flags=[...new Set(parts.click.text.match(/_is(?:Storm|Dim|Slam|Synth|Elem|Six|Blade|Ice|Bone|Elec|Shield|Plague|Holy|Pillar|Inferno|Siege|Dual|Thunder|Time)\w*/g)||[])];
  for(const flag of flags)context[flag]=false;
  const helpers=`const SKILL_LIST=[${parts.skill.text.trim().replace(/,$/,'')}];
const _SK_MAP=new Map(SKILL_LIST.map(sk=>[sk.id,sk]));
${parts.maliceCost.text}${parts.upSpCost.text}${parts.slotCalculations.text}${parts.slotDefinitions.text}
${parts.fusePairs.text}${parts.isFused.text}\n${parts.absorbed.text}`;
  new vm.Script(helpers,{filename:file+':disk-cost-slot-helpers'}).runInContext(context);
  assert.equal(vm.runInContext('_malCost(SKILL_LIST[0].matCost)',context),40);
  const click=version==='production'?parts.click.text:parts.click.text.replace(guard,'');
  assert.equal(click.split(guard).length-1,version==='production'?1:0);
  const renderer=`function renderSkillPanel(){recordRender();
${parts.gridReset.text}\nconst sk=SKILL_LIST[0];
${parts.capture.text}${parts.card.text}${click}${parts.plus.text}${parts.append.text}
recordCard(d,slv,learned,canLearn,canUp);}`;
  new vm.Script(renderer,{filename:file+':disk-render-fragments:'+version}).runInContext(context);
  const snapshot=()=>({skillLv:context.P.skills[skill.id]||0,sp:context.P.sp,mats:context.G.mats,
    slots:[...context.SKILL_SLOTS],ultSlot:context.ULT_SLOT,counts:{...counts},effects:structuredClone(effects),
    currentCapture:{slv:current.slv,learned:current.learned,canLearn:current.canLearn,canUp:current.canUp}});
  vm.runInContext('renderSkillPanel()',context);
  const before=snapshot(),old=current,savedPlus=old.plus?.onclick;
  assert.ok(old.card.isConnected&&grid.contains(old.card)&&old.plus?.isConnected);
  assert.equal(old.learned,false);assert.equal(old.slv,0);assert.equal(typeof savedPlus,'function');
  const event={stopPropagation(){counts.stopPropagation++;}};
  old.plus.onclick(event);
  assert.ok(!old.card.isConnected&&!old.plus.isConnected&&!grid.contains(old.card));
  assert.ok(current.card!==old.card&&current.card.isConnected&&grid.contains(current.card));
  const first=snapshot();
  assert.equal(first.skillLv,1);assert.equal(first.sp,10);assert.equal(first.mats,40);
  assert.deepEqual(first.slots,['spikeTrap',null,null,null,null,null]);
  assert.equal(first.counts.save,1);assert.equal(first.counts.render,2);assert.equal(first.counts.sfx,1);
  assert.equal(first.counts.slotUpdate,1);assert.equal(first.counts.quickUpdate,2);assert.equal(first.counts.rng,0);
  assert.equal(first.currentCapture.learned,true);assert.equal(first.currentCapture.canUp,false);
  savedPlus(event);
  const after=snapshot(),delta=Object.fromEntries(Object.keys(counts).map(k=>[k,after.counts[k]-first.counts[k]]));
  assert.equal(delta.stopPropagation,1,'Original plus event propagation behavior stays intact');
  let rejection=null;
  if(version==='production')assertNoDetachedEffect(first,after);
  else{
    assert.equal(after.skillLv,1);assert.equal(after.sp,0);assert.equal(after.mats,0);
    assert.equal(delta.save,1);assert.equal(delta.render,1);assert.equal(delta.sfx,1);
    assert.deepEqual(after.slots,first.slots);
    try{assertNoDetachedEffect(first,after);}catch(error){assert.equal(error.name,'AssertionError');rejection=error.message;}
    assert.ok(rejection,'Guard-removed source must fail the same no-detached-effect criterion');
  }
  return {file,version,verdict:version==='production'?'GREEN':'RED(expected negative control)',
    negativeControlRejection:rejection,clickSHA256:sha(click),rendererFragmentSHA256:sha(renderer),
    helperFragmentSHA256:sha(helpers),trace:{before,afterConnectedFirst:first,afterSavedDetached:after},
    detachedDelta:{skillLv:after.skillLv-first.skillLv,sp:after.sp-first.sp,mats:after.mats-first.mats,calls:delta},
    oldCardDetached:true,newCardConnected:true};
}

let before;
try{
  assert.equal(fs.realpathSync(root),root);assert.equal(fs.realpathSync(fileURLToPath(import.meta.url)),own);
  before=hashInputs();report.inputsBefore=before;report.sourceFragments={};
  for(const file of files){
    const source=read(file),{parts,skill}=fragments(source);
    report.sourceFragments[file]=Object.fromEntries(Object.entries(parts).map(([name,p])=>
      [name,{lineStart:p.lineStart,lineEnd:p.lineEnd,SHA256:sha(p.text)}]));
    const production=execute(file,parts,skill,'production');report.executions.push(production);
    const negative=execute(file,parts,skill,'guard-removed-memory');report.executions.push(negative);
    assert.deepEqual(production.trace.before,negative.trace.before);
    assert.deepEqual(production.trace.afterConnectedFirst,negative.trace.afterConnectedFirst,
      'Connected first learning effects must match the unguarded control completely');
    report.comparisons.push({file,connectedFirstCompleteEquivalence:'PASS',
      productionNoDetachedEffect:'PASS',guardRemovedFailsSameCriterion:'PASS'});
    report.counts.productionGREEN++;report.counts.negativeControlRED++;report.counts.comparisonRuns+=2;
  }
}catch(error){report.failures.push({message:error.message});}
try{
  report.inputsAfter=hashInputs();
  report.inputPreservation=Object.fromEntries(protectedFiles.map(f=>[f,before?.[f]===report.inputsAfter[f]]));
  assert.ok(Object.values(report.inputPreservation).every(Boolean),'Input changed during regression');
}catch(error){report.failures.push({message:error.message});}
report.finishedUTC=new Date().toISOString();report.status=report.failures.length?'FAIL':'PASS';
report.protectedFilesAllUnchanged=Object.values(report.inputPreservation||{}).length===protectedFiles.length&&
  Object.values(report.inputPreservation).every(Boolean);
if(report.failures.length)process.exitCode=1;
process.stdout.write(JSON.stringify(report,null,2)+'\n');
