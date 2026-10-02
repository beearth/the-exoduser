// Actual compact-expanded minus source. No app/server/browser/storage/audio execution.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const FILES = ['game.html', 'game-easy-test.html'];
const GUARD = 'if(!d.isConnected||!grid.contains(d))return;';
const NEEDLE = 'const _skUnclick=()=>{';
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const clone = x => JSON.parse(JSON.stringify(x));
const report = {kind:'actual expanded minus lifetime', startedUTC:new Date().toISOString(),
  node:process.version, cwd:ROOT, sources:[], groups:[], normalTraces:[],
  sourceExecution:true, productionWrites:0, storageIO:false, nativeInput:false,
  fullPanel:false, runtimeAccepted:false, visualAccepted:false, audioPlayback:false,
  fixture:'Synthetic DOM/P/G; selected actual source fragments, view/stat/UI/save/SFX sinks.',
  transformations:['Selected SKILL_LIST records and source-fragment row/panel scaffolds.',
    'View labels/icon/mastery placeholders; omitted category, fusion/reset/slot fall-through UI.',
    'Source container declarations cropped after first semicolon; one recommendation row.',
    'recordCard and recordPrivate instrumentation outside unmodified minus handler.',
    'After production guard exists, only normal first-effect control removes exact44B guard.']};

// A structural DOM double, not an HTML parser or native event/focus/layout implementation.
function makeDocument() {
  const document = {};
  class Node {
    constructor(tag) { this.tagName=tag.toUpperCase(); this.children=[]; this.parentElement=null;
      this.dataset={}; this.style={cssText:'',setProperty(k,v){this[k]=v;}}; this._html=''; }
    get isConnected() { return this===document.body || !!this.parentElement?.isConnected; }
    contains(n) { return this===n || this.children.some(c=>c.contains(n)); }
    remove() { if(this.parentElement) { const p=this.parentElement;
      p.children=p.children.filter(c=>c!==this); this.parentElement=null; } }
    appendChild(n) { n.remove(); n.parentElement=this; this.children.push(n); return n; }
    set innerHTML(v) { for(const c of [...this.children])c.remove(); this._html=v; }
    get innerHTML() { return this._html; }
  }
  document.createElement = tag => new Node(tag);
  document.body = new Node('body');
  return document;
}
function extract(s, start, end, from=0) {
  const a=s.indexOf(start,from); assert.ok(a>=0,'missing marker '+start);
  const z=s.indexOf(end,a+start.length); assert.ok(z>=0,'missing end '+end);
  return {text:s.slice(a,z), start:a, end:z};
}
function line(s, marker, from=0) {
  const a=s.indexOf(marker,from); assert.ok(a>=0,'missing line '+marker);
  const z=s.indexOf('\n',a); assert.ok(z>a); return {text:s.slice(a,z),start:a,end:z};
}
function declaration(s, marker, from=0) {
  const a=s.indexOf(marker,from); assert.ok(a>=0,'missing declaration '+marker);
  const z=s.indexOf(';',a)+1; assert.ok(z>a); return {text:s.slice(a,z),start:a,end:z};
}
function fragments(file) {
  const bytes=fs.readFileSync(path.join(ROOT,file)); const s=bytes.toString('utf8');
  const render=s.indexOf('function renderSkillPanel(){');
  const row=s.indexOf('function _renderSkillRow(sk,grid){'); assert.ok(render>=0&&row>render);
  const normalButtons=s.indexOf('    // 일반 카드(+/-) 버튼:',row);
  const normalEnd=s.indexOf('    // (클릭 합체는 위에서 처리됨',normalButtons);
  const p={
    row:line(s,'function _renderSkillRow(sk,grid){',row),
    render:line(s,'function renderSkillPanel(){',render),
    clear:line(s,"const grid=$('skillGrid');grid.innerHTML='';",render),
    uiState:extract(s,'let _fuseSelId=null;','// ═══ 디아블로식 스킬 상세 툴팁'),
    host:extract(s,'    const _dimFuse=isDimBreach();','    // 합체 보석 그룹',row),
    expandedFlag:line(s,'    const _isExpanded=_skExpandedId===sk.id;',row),
    display:extract(s,'    if(_skCompact && !_isExpanded){','    // ═══ compact 아이콘 모드',row),
    navigation:extract(s,'    // ═══ compact 아이콘 모드','    // ═══ compact 펼침 모드:',row),
    expanded:extract(s,'    if(_skCompact && _isExpanded){','    // ═══ 클릭 합체 시스템',row),
    append:line(s,'    grid.appendChild(d);',normalEnd),
    whirl:line(s,"  {id:'whirlwind',"), det:line(s,"  {id:'detonate',"),
    refunds:extract(s,'function _skillUpSpCost(','function _skillSpentSp('),
    malice:extract(s,'const _MALICE_COST_MUL=','function enhCostRaw('),
    groups:extract(s,'const _FUSE_GEM_GROUPS=','// 하위호환: 기존 _FUSE_GEMS'),
    pairs:extract(s,'const _FUSE_PAIRS=','function _getFuseKey('),
    isFused:line(s,'function _isFused('), dim:line(s,'function isDimBreach('),
    groupSelector:extract(s,'function _fuseGemGroup(','function _allFuseGemGroups('),
    col:declaration(s,"const col=document.createElement('div')",render),
    phase:declaration(s,"const phDiv=document.createElement('div')",render),
    skillRow:declaration(s,"const skRow=document.createElement('div')",render),
    wrap:line(s,"const skWrap=document.createElement('div');",render),
    rowCall:line(s,'_renderSkillRow(sk,skWrap);',render),
    wrapAppend:line(s,'skRow.appendChild(skWrap);',render),
    rowAppend:line(s,'phDiv.appendChild(skRow);',render),
    phaseAppend:line(s,'col.appendChild(phDiv);',render),
    colAppend:line(s,'grid.appendChild(col);',render)
  };
  assert.equal(s.split('      '+NEEDLE).length,2,'one expanded declaration');
  assert.ok(s.includes('function _skMinusClick(){'+GUARD),'common minus guard preserved');
  const guarded=p.expanded.text.includes(NEEDLE+GUARD);
  if(guarded)assert.equal(p.expanded.text.split(GUARD).length,2,'one expanded guard');
  report.sources.push({file,bytes:bytes.length,sha256:sha(bytes),hasExpandedGuard:guarded,
    commonGuardPresent:true, fragments:Object.fromEntries(Object.entries(p).map(([k,v])=>[k,
      {line:s.slice(0,v.start).split('\n').length,bytes:Buffer.byteLength(v.text),sha256:sha(v.text)}]))});
  return {file,p,guarded,sourceSHA:sha(bytes)};
}
function createScenario(ex, kind, removeGuard=false) {
  const document=makeDocument(),root=document.createElement('div'); root.id='skillGrid';
  document.body.appendChild(root);
  const counts={render:0,stat:0,sfx:0,text:0,slot:0,quick:0,save:0,stopPropagation:0,rng:0};
  const trace=[]; const captures=[]; const privates=new Map(); let current;
  const record=(kind,args=[])=>trace.push({kind,args:clone(args)});
  const math=Object.create(Math); math.random=()=>{counts.rng++; return .375;};
  const context=vm.createContext({document,Math:math,
    P:{lv:1000,x:100,y:100,sp:100,skills:{whirlwind:kind==='unlearned'?0:kind==='lv1'?1:3,detonate:0},
      _fused:{},activeLMBSk:'whirlwind'},G:{mats:80},SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,
    $:id=>{assert.equal(id,'skillGrid');return root;},_L:ko=>ko,_T:x=>x,
    SFX:{pickup(){counts.sfx++;record('pickup');}},
    addTxt(...args){counts.text++;record('addTxt',args);},
    updateSkSlot(){counts.slot++;record('updateSkSlot');},updateQS(){counts.quick++;record('updateQS');},
    dbSaveForce(){counts.save++;record('dbSaveForce');},
    _skDetailHTML(sk,lv){counts.stat++;record('_skDetailHTML',[sk.id,lv]);return '<div>stat sink</div>';},
    _skClick(){throw new Error('plus is outside this test');},
    _skMinusClick(){throw new Error('common minus is outside this test');},
    recordRender(){counts.render++;record('renderSkillPanel');},
    recordCard(card,grid,slv,learned,canLearn,canUp,expanded){
      current={card,grid,slv,learned,canLearn,canUp,expanded};
      captures.push({slv,learned,canLearn,canUp,expanded});
    },recordPrivate(card,fn){privates.set(card,fn);}
  });
  const p=ex.p;
  const helpers=`const SKILL_LIST=[${p.whirl.text.trim().replace(/,$/,'')},${p.det.text.trim().replace(/,$/,'')}];
${p.refunds.text}${p.malice.text}${p.groups.text}${p.pairs.text}${p.isFused.text}${p.dim.text}${p.groupSelector.text}${p.uiState.text}`;
  new vm.Script(helpers,{filename:ex.file+':actual-helpers'}).runInContext(context);
  const setup=vm.runInContext(`(()=>{const sk=SKILL_LIST[0],g=_FUSE_GEM_GROUPS.whirlDet;
    return {skId:sk.id,upMat:sk.upMat||0,spRefund:_skillUpSpCost(2,false),matsRefund:_malCost(sk.upMat||0),
      ids:[...g.skills],pairs:[..._FUSE_PAIRS.whirlDet],minLv:g.minLv,star:g.star||g.skills.length,
      fuseRefund:_fuseUpSpCost(5,g.star||g.skills.length)};})()`,context);
  assert.equal(setup.skId,'whirlwind');assert.deepEqual(clone(setup.ids),clone(setup.pairs));
  if(kind==='fused') {
    for(const id of setup.ids)context.P.skills[id]=6;
    context.P._fused.whirlDet=true;assert.ok(6>=setup.minLv);
  }
  let expanded=p.expanded.text;
  if(removeGuard) {
    assert.ok(ex.guarded,'old normal control only after approved production guard exists');
    expanded=expanded.replace(NEEDLE+GUARD,NEEDLE);
  }
  const mark='      // 버튼 행 컨테이너';assert.equal(expanded.split(mark).length,2);
  expanded=expanded.replace(mark,'      recordPrivate(d,_skUnclick);\n'+mark);
  const rowCode=`${p.row.text}
${p.host.text}
const _fGrp=_fuseGemGroup(sk.id),_dispName=sk.name,_dispDesc=sk.desc||'',_skStar=0,
  _profV=0,_profCap=1,lockTxt='',_iconImg='<div>icon sink</div>';
${p.expandedFlag.text}
recordCard(d,grid,slv,learned,canLearn,canUp,_isExpanded);
${p.display.text}${p.navigation.text}${expanded}${p.append.text}
}`;
  const panelCode=`${p.render.text}
recordRender();
${p.clear.text}
${p.col.text}${p.phase.text}${p.skillRow.text}
const sk=SKILL_LIST[0];
${p.wrap.text}${p.rowCall.text}${p.wrapAppend.text}${p.rowAppend.text}${p.phaseAppend.text}${p.colAppend.text}
}`;
  new vm.Script(rowCode+'\n'+panelCode,{filename:ex.file+':actual-expanded-partial-row'}).runInContext(context);
  vm.runInContext('renderSkillPanel()',context);
  assert.equal(current.expanded,false);assert.equal(typeof current.card.onclick,'function');
  current.card.onclick(); // Actual collapsed source chooses _skExpandedId and re-renders.
  assert.equal(current.expanded,true);assert.ok(current.card.isConnected&&current.grid.contains(current.card));
  const ui=vm.runInContext('({compact:_skCompact,expandedId:_skExpandedId})',context);
  assert.equal(ui.compact,true);assert.equal(ui.expandedId,setup.skId);
  const descendants=n=>n.children.flatMap(c=>[c,...descendants(c)]);
  const minus=descendants(current.card).find(n=>typeof n.onclick==='function'&&String(n.textContent).startsWith('− '))||null;
  assert.equal(!!minus,current.learned,'actual learned button construction');
  const snapshot=()=>({state:clone({P:context.P,G:context.G,slots:context.SKILL_SLOTS,ult:context.ULT_SLOT}),
    counts:{...counts},trace:clone(trace),captures:clone(captures)});
  const event={stopPropagation(){counts.stopPropagation++;record('stopPropagation');}};
  return {context,document,root,counts,setup:clone(setup),snapshot,event,minus,
    card:current.card,grid:current.grid,privateFn:privates.get(current.card),
    source:{helperSHA:sha(helpers),rowSHA:sha(rowCode),panelSHA:sha(panelCode)}};
}
function delta(a,b){return Object.fromEntries(Object.keys(a.counts).map(k=>[k,b.counts[k]-a.counts[k]]));}
function firstEffects(ex,kind,oldControl=false) {
  const s=createScenario(ex,kind,oldControl),before=s.snapshot();s.minus.onclick(s.event);const after=s.snapshot();
  const d=delta(before,after);assert.equal(d.stopPropagation,1);
  for(const k of ['sfx','text','render','stat','slot','quick','save'])assert.equal(d[k],1,k);
  assert.equal(d.rng,0);assert.deepEqual(after.state.slots,before.state.slots);
  assert.deepEqual(after.state.P._fused,before.state.P._fused);
  assert.equal(after.state.ult,before.state.ult);
  if(kind==='fused') {
    for(const id of s.setup.ids)assert.equal(after.state.P.skills[id],5);
    assert.equal(after.state.P.sp-before.state.P.sp,s.setup.fuseRefund);
    assert.equal(after.state.G.mats,before.state.G.mats);
  }else {
    assert.equal(after.state.P.skills.whirlwind,2);
    assert.equal(after.state.P.sp-before.state.P.sp,s.setup.spRefund);
    assert.equal(after.state.G.mats-before.state.G.mats,s.setup.matsRefund);
  }
  assert.equal(s.card.isConnected,false);assert.equal(s.grid.contains(s.card),true,'retired nested container retains descendants');
  return {setup:s.setup,before,after,delta:d,source:s.source};
}
function noGameEffect(before,after) {
  assert.deepEqual(after.state,before.state,'invalid-lifetime minus must not alter current state/refund');
  const d=delta(before,after);
  for(const k of ['sfx','text','render','stat','slot','quick','save','rng'])assert.equal(d[k],0,k);
  assert.deepEqual(after.captures,before.captures);
  assert.deepEqual(after.trace.filter(x=>x.kind!=='stopPropagation'),before.trace.filter(x=>x.kind!=='stopPropagation'));
}
function group(file,name,fn){const item={file,name,status:'PASS',stage:'setup'};report.groups.push(item);
  try{fn(item);}catch(e){item.status='FAIL';item.error={name:e.name,message:e.message};
    item.failureKind=item.stage==='lifetime-criterion'&&e.name==='AssertionError'?'lifetimeCriterion':'fixtureOrContract';}}
try {
  for(const file of FILES) {
    const ex=fragments(file);
    for(const kind of ['ordinary','fused'])group(file,'normal-connected-'+kind,item=>{
      const actual=firstEffects(ex,kind);item.observation=actual;
      if(ex.guarded){const old=firstEffects(ex,kind,true);assert.deepEqual(actual.before,old.before);assert.deepEqual(actual.after,old.after);
        item.normalFirstTraceEqualOldGuardRemoved=true;}
      else item.normalFirstTraceEqualOldGuardRemoved='not run before production guard';
      report.normalTraces.push({file,kind,before:actual.before,after:actual.after});
    });
    for(const kind of ['ordinary','fused'])group(file,'retired-saved-wrapper-'+kind,item=>{
      const s=createScenario(ex,kind);const old=s.minus.onclick;s.minus.onclick(s.event);
      assert.equal(s.card.isConnected,false);assert.equal(s.grid.contains(s.card),true);
      const before=s.snapshot();old(s.event);const after=s.snapshot();
      item.observation={before,after,delta:delta(before,after),retiredCardConnected:false,capturedContainerContainsCard:true};
      assert.equal(after.counts.stopPropagation-before.counts.stopPropagation,1);
      item.stage='lifetime-criterion';noGameEffect(before,after);
    });
    group(file,'card-row-detached',item=>{
      const s=createScenario(ex,'ordinary');s.grid.remove();
      assert.equal(s.card.isConnected,false);assert.equal(s.grid.contains(s.card),true);
      const before=s.snapshot();s.minus.onclick(s.event);const after=s.snapshot();
      item.observation={before,after,delta:delta(before,after),cardConnected:false,capturedContainerContainsCard:true};
      assert.equal(after.counts.stopPropagation-before.counts.stopPropagation,1);
      item.stage='lifetime-criterion';noGameEffect(before,after);
    });
    group(file,'connected-card-other-grid',item=>{
      const s=createScenario(ex,'ordinary'),foreign=s.document.createElement('div');s.document.body.appendChild(foreign);foreign.appendChild(s.card);
      assert.equal(s.card.isConnected,true);assert.equal(s.grid.contains(s.card),false);
      const before=s.snapshot();s.minus.onclick(s.event);const after=s.snapshot();
      item.observation={before,after,delta:delta(before,after),cardConnected:true,capturedContainerContainsCard:false};
      assert.equal(after.counts.stopPropagation-before.counts.stopPropagation,1);
      item.stage='lifetime-criterion';noGameEffect(before,after);
    });
    group(file,'unlearned-creation-and-private-gate',item=>{
      const s=createScenario(ex,'unlearned');assert.equal(s.minus,null);assert.equal(typeof s.privateFn,'function');
      const before=s.snapshot();s.privateFn();const after=s.snapshot();noGameEffect(before,after);
      assert.equal(after.counts.stopPropagation,before.counts.stopPropagation);
      item.observation={buttonCreated:false,privateDirectCallSynthetic:true,before,after};
    });
    group(file,'connected-lv1-existing-guidance',item=>{
      const s=createScenario(ex,'lv1'),before=s.snapshot();s.minus.onclick(s.event);const after=s.snapshot(),d=delta(before,after);
      assert.deepEqual(after.state,before.state);assert.equal(d.text,1);assert.equal(d.stopPropagation,1);
      for(const k of ['sfx','render','stat','slot','quick','save','rng'])assert.equal(d[k],0,k);
      item.observation={before,after,delta:d};
    });
  }
}catch(e){report.extractionError={name:e.name,message:e.message,stack:e.stack};}
report.finishedUTC=new Date().toISOString();report.summary={total:report.groups.length,
  pass:report.groups.filter(x=>x.status==='PASS').length,fail:report.groups.filter(x=>x.status==='FAIL').length,
  lifetimeCriterionFailures:report.groups.filter(x=>x.failureKind==='lifetimeCriterion').length,
  fixtureOrContractFailures:report.groups.filter(x=>x.failureKind==='fixtureOrContract').length};
report.sourceBytesUnchanged=Object.fromEntries(report.sources.map(x=>[x.file,sha(fs.readFileSync(path.join(ROOT,x.file)))===x.sha256]));
if(report.extractionError||report.summary.fail||!Object.values(report.sourceBytesUnchanged).every(Boolean))process.exitCode=1;
console.log(JSON.stringify(report,null,2));
