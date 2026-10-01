import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const out=path.join(root,'tools/team-followup-20261002/map-art-review');
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p));
const refs=[
  'game.html','game-easy-test.html','ch1-boundary-edge.js','ch1-border-foreground.js',
  'assets/map/ch1/production_finish/layout.js',
  'tools/team-followup-20261001/MAP/visual-eight-view-preparation-manifest.json',
  'docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md',
  'docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md',
  'docs/0마스터플랜/mac-resume-20261001/map020-evidence/manifest.json'
];
const before=Object.fromEntries(refs.map(p=>[p,sha(read(p))]));
const current=Object.fromEntries(refs.map(p=>[p,read(p).toString('utf8')]));
const candidate=JSON.parse(current[refs[5]]);
const raw=JSON.parse(current[refs[8]]);
const layoutVM={};vm.createContext(layoutVM);
vm.runInContext(current[refs[4]],layoutVM);
const layout=layoutVM.CH1_1_PRODUCTION;
const checks=[];
function check(id,run){run();checks.push({id,result:'PASS'});}
check('layout source primary role',()=>{
  const primary=layout.regions.find(r=>r.role==='primary-landmark');
  assert.equal(primary.id,'corpse_basin');assert.deepEqual(Array.from(primary.anchor),[102,90]);
});
check('current boundary module matches candidate source',()=>assert.equal(before['ch1-boundary-edge.js'],candidate.sourceSHA['ch1-boundary-edge.js']));
check('current border foreground matches candidate source',()=>assert.equal(before['ch1-border-foreground.js'],candidate.sourceSHA['ch1-border-foreground.js']));
check('both production callers retain complete zoom transform',()=>{
  for(const p of ['game.html','game-easy-test.html']){
    assert.match(current[p],/const _tzoom=_ez\*_cz;/);
    assert.match(current[p],/X\.scale\(_tzoom,_tzoom\)/);
    assert.match(current[p],/Ch1BoundaryEdge\.draw\(X,G,_now,VW,VH,_tzoom\)/);
  }
});
// Immutable cache objects are supplied in a synthetic VM. The exact production
// draw body executes with a recording context. No browser/pixels/game runs.
for(const zoom of [1,.62])check(`production shade crop inverse viewport z${zoom}`,()=>{
  const g={stage:0,map:[[0]],mw:200,mh:200,cam:{x:2420,y:6600}};
  const context={performance:{now:()=>0},location:{search:'?edgeShade=a'}};
  vm.createContext(context);
  const source=current['ch1-boundary-edge.js'];
  assert.equal(source.split('  function draw(').length,2);
  vm.runInContext(source.replace('  function draw(','  root.__seed=g=>{shade={width:800,height:800};roots=[];mapRef=g.map;};\n  function draw('),context);
  context.__seed(g);
  const calls=[];context.Ch1BoundaryEdge.draw({drawImage:(...a)=>calls.push(a)},g,0,1280,800,zoom);
  assert.equal(calls.length,1);
  const [sx,sy,sw,sh,x,y,w,h]=calls[0].slice(1);
  assert.ok(x<=Math.max(0,g.cam.x-640/zoom));
  assert.ok(x+w>=Math.min(8000,g.cam.x+640/zoom));
  assert.ok(y<=Math.max(0,g.cam.y-400/zoom));
  assert.ok(y+h>=Math.min(8000,g.cam.y+400/zoom));
  assert.deepEqual([sx,sy,sw,sh],[x*.1,y*.1,w*.1,h*.1]);
});
const evidenceDir='docs/0마스터플랜/mac-resume-20261001/map020-evidence/';
const pngs=Object.entries(raw.files).filter(([p])=>p.endsWith('.png'));
check('historical PNG bytes and SHA provenance',()=>{
  for(const [p,e]of pngs){const b=read(evidenceDir+p);assert.equal(b.length,e.bytes);assert.equal(sha(b),e.sha256);}
});
const ssot=current['docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md'];
const guide=current['docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md'];
check('canonical SSOT eight camera rows exist',()=>{
  for(const row of ['START | [100,180]','EARLY | [100,157]','ARENA | [100,120]',
    'SIDE_L | [49,151]','SIDE_R | [151,136]','LANDMARK | [102,90]','LATE | [100,48]','EXIT | [100,15]'])assert.ok(ssot.includes(row));
  for(const label of ['01 START','02 EARLY','03 MAIN ARENA','04 SIDE LEFT','05 SIDE RIGHT','06 PRIMARY LANDMARK','07 LATE','08 EXIT / BOSS'])assert.ok(guide.includes(label));
  assert.ok(ssot.includes('`(100.5,185.5)`'));
});
const candidateLabels=candidate.eightViews.map(r=>r.view);
const requiredViews=['START','EARLY','MAIN ARENA','SIDE LEFT','SIDE RIGHT','PRIMARY LANDMARK','LATE','EXIT / BOSS'];
const semanticAudit={candidateLabels,requiredViews,
  independentLate:candidateLabels.includes('LATE'),
  independentExit:candidateLabels.some(v=>/^EXIT/.test(v)),
  candidatePrimary:candidate.eightViews.find(r=>r.view==='PRIMARY LANDMARK').coordWorld,
  sourcePrimaryAnchor:Array.from(layout.regions.find(r=>r.role==='primary-landmark').anchor),
  candidateStart:candidate.eightViews.find(r=>r.view==='START').coordWorld,
  lockedSpawnFromSSOT:[4020,7420],
  currentViewEvidenceCount:0,
  historicalPartialCanonicalRoles:['SIDE RIGHT'],
  historicalExtraDiagnostics:['SOUTH MASS'],
  evidenceNote:'The owner 2/8 HAVE count includes SOUTH MASS and partial M5. It cannot establish 2 completed canonical camera roles.'};
assert.equal(semanticAudit.independentLate,false);
assert.equal(semanticAudit.independentExit,false);
assert.deepEqual(semanticAudit.candidatePrimary,[1766,6620]);
assert.deepEqual(semanticAudit.candidateStart,[4000,7600]);
const defects=[
  {id:'CAM-1',result:'RETOUCH',reason:'8 candidate rows replace a required view with SOUTH MASS and merge LATE/EXIT. Required LATE and EXIT must have separate actual camera evidence.'},
  {id:'CAM-2',result:'RETOUCH',reason:'Candidate PRIMARY [1766,6620] is a reported boundary point. Source primary-landmark is corpse_basin [102,90], with production m_c1tree at world [4100,3620].'},
  {id:'CAM-3',result:'RETOUCH',reason:'Candidate START [4000,7600] is approximate; locked spawn is world [4020,7420]. EXIT camera [4000,720] is not gameplay gate/exit tile y5/y7.'},
  {id:'PROV-1',result:'HISTORICAL',reason:'The 15 historical PNGs are valid bytes from pre-fix measured_source 6cbeb664. They are not current 8-view or zoom-fix evidence.'},
  {id:'PROV-2',result:'HISTORICAL',reason:'Candidate whole-game SHA is stale; boundary and foreground exact SHA remain equal. Whole-game changes do not themselves imply a map regression.'}
];
const rows=[['START',[100,185],'locked actual spawn; add SSOT START board [100,180] if useful'],
  ['EARLY',[100,157],'SSOT camera board'],['MAIN ARENA',[100,120],'SSOT camera board'],
  ['SIDE LEFT',[49,151],'SSOT camera board'],['SIDE RIGHT',[151,136],'SSOT camera board; M5 approach is an extra diagnostic'],
  ['PRIMARY LANDMARK',[102,90],'source primary role + SSOT camera board; tree anchor may collide, observe from walkable vicinity'],
  ['LATE',[100,48],'SSOT camera board; separate from EXIT'],['EXIT / BOSS',[100,15],'SSOT camera approach; not a claim that the y5 gate/y7 exit is open']
].map(([view,tile,note])=>({view,tile,worldTileCentre:tile.map(v=>(v+.5)*40),note,actualEvidence:'UNMEASURED'}));
const extras=[{view:'SOUTH MASS',world:[2420,6600],modes:['0','a','b'],zooms:[1,.62],reason:'same-location D1/D2 regression comparison'},
  {view:'M5 APPROACH',world:[6660,6140],reason:'known historical non-wall; log actual isW/canMv and wallAhead under trusted manual input. Full pocket route remains unproven.'},
  {view:'REPORTED WEST EDGE',world:[1766,6620],reason:'boundary diagnostic, never primary-landmark evidence'}];
const result={at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  kind:'read-only source and camera-manifest acceptance',sources:before,checks,checkCount:checks.length,pngCount:pngs.length,
  wholeGameEqualToCandidate:before['game.html']===candidate.sourceSHA['game.html_current'],
  candidateRecordedWholeGameSha:candidate.sourceSHA['game.html_current'],actualWholeGameSha:before['game.html'],
  candidateVerdict:'RETOUCH',defects,semanticAudit,visualVerdict:'RETOUCH',
  visualReason:'No new actual screen/route/combat evidence collected; source checks cannot grant visual PASS.',
  runtimeRuns:0,browserRuns:0,productionEdits:0};
// Source equality is checked after all reads; no shared file or old candidate is written.
check('all inspected source inputs remain unchanged',()=>{
  for(const p of refs)assert.equal(sha(read(p)),before[p],p);
});
result.checkCount=checks.length;
const count=execFileSync('git',['status','--short','--untracked-files=all'],{cwd:root,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).split('\n').filter(Boolean).length;
result.gitItemCountBeforeOutputs=count;
fs.writeFileSync(path.join(out,'source-camera-gate-result.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(out,'canonical-camera-board.json'),JSON.stringify({source:'production SSOT/source, prepared only',capturePlan:rows,extraDiagnostics:extras,globalVerdict:'RETOUCH',passRequirement:'8 distinct actual views + tech/combat/route evidence; no approximate camera-name substitution'},null,2)+'\n');
console.log(JSON.stringify({head:result.head,checks:checks.length,pngs:pngs.length,candidateVerdict:result.candidateVerdict,visualVerdict:result.visualVerdict,gitItems:count,productionEdits:0,runtimeRuns:0}));
