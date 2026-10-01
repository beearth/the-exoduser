import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const folder = 'tools/team-followup-20261001/UIUX';
const v1Builder = fs.readFileSync(`${folder}/build-coordinate-candidate.mjs`, 'utf8');
const v1Adapter = fs.readFileSync(`${folder}/coordinate-adapter.mjs`, 'utf8');
const chargeFunction = v1Adapter.slice(v1Adapter.indexOf('export function chargeBox('), v1Adapter.indexOf('export function numberGlyphBoxes(')).replace('export function ', 'function ');
const moduleBody = fs.readFileSync(`${folder}/coordinate-hotpath-v2.mjs`, 'utf8').replaceAll('export function ', 'function ');
const libraryBody = moduleBody + '\n' + chargeFunction;
const helpers = `const _uiuxCoordinateJobs=[];
const _uiuxV2JobPool=[];
const _uiuxV2Measurable=[];
const _uiuxV2Workspace=_uiuxCoordinateCandidate.createWorkspaceV2();
const _uiuxV2Snapshot=_uiuxCoordinateCandidate.createSnapshotV2();
const _uiuxV2DrawFrame={};
const _uiuxV2ReadRect=()=>C.getBoundingClientRect();
let _uiuxCoordinateFrame=null;
const _uiuxCoordinateStatus={status:'UNKNOWN'};
function _uiuxV2Job(kind){
  const index=_uiuxCoordinateJobs.length;
  let job=_uiuxV2JobPool[index];
  if(!job){job={bounds:{}};job.paint=context=>{if(job.kind==='damage'){context.globalAlpha=job.alpha;drawNumStr(context,job.num,job.x,job.y,job.color,job.scale)}else _uiuxPaintChargeLabel(job.x,job.y,job.radius,job.label)};_uiuxV2JobPool[index]=job}
  job.kind=kind;job.id=kind+'-'+index;_uiuxCoordinateJobs.push(job);return job;
}
function _uiuxQueueNumber(num,x,y,color,scale,alpha){
  const job=_uiuxV2Job('damage');job.num=num;job.x=x;job.y=y;job.color=color;job.scale=scale;job.alpha=alpha;
  job.box=_uiuxCoordinateCandidate.numberBoxV2(num,x,y,scale,_NUM_W,_NUM_H,job.bounds);
}
function _uiuxFlushCoordinates(){
  try{
    if(_uiuxCoordinateJobs.length===0){_uiuxCoordinateStatus.status='EMPTY';return}
    for(const job of _uiuxCoordinateJobs)if(job.box)_uiuxV2Measurable.push(job);
    if(_uiuxV2Measurable.length===0){for(const job of _uiuxCoordinateJobs){X.save();try{job.paint(X)}finally{X.restore()}}_uiuxCoordinateStatus.status='UNKNOWN';return}
    let planned;
    try{_uiuxCoordinateFrame=_uiuxV2Snapshot.get(_uiuxV2ReadRect);planned=_uiuxCoordinateCandidate.planReadingsV2(_uiuxV2Measurable,_uiuxCoordinateFrame,_uiuxV2Workspace)}catch(error){
      if(!(error instanceof TypeError))throw error;
      _uiuxCoordinateStatus.status='UNKNOWN';_uiuxCoordinateStatus.reason=error.message;
      for(const job of _uiuxCoordinateJobs){X.save();try{job.paint(X)}finally{X.restore()}}return;
    }
    _uiuxCoordinateCandidate.paintReadingsV2(X,_uiuxV2Measurable,planned);
    for(const job of _uiuxCoordinateJobs)if(!job.box){X.save();try{job.paint(X)}finally{X.restore()}}
    let unresolved=0;for(const reading of planned)if(reading.unresolved)unresolved++;
    _uiuxCoordinateStatus.status='STATIC_CANDIDATE';_uiuxCoordinateStatus.unresolved=unresolved;_uiuxCoordinateStatus.ordinaryText='UNKNOWN';_uiuxCoordinateStatus.leaderPainting='UNKNOWN';
  }finally{_uiuxCoordinateJobs.length=0;_uiuxV2Measurable.length=0;_uiuxCoordinateFrame=null;_uiuxV2Snapshot.clear()}
}
`;
const queuePainter = `function _drawProjectileChargeLabel(x,y,r,label){
  X.save();X.font='bold 13px "Noto Sans KR",sans-serif';
  const metrics=_chargeLabelMetrics;
  if(metrics.ctx!==X||metrics.label!==label||metrics.font!==X.font){metrics.width=X.measureText(label).width;metrics.ctx=X;metrics.label=label;metrics.font=X.font}
  const job=_uiuxV2Job('charge');job.x=x;job.y=y;job.radius=r;job.label=label;
  const bounds=job.bounds;bounds.x=x-(metrics.width+14)/2-.75;bounds.y=y-r-25-10-.75;bounds.w=metrics.width+15.5;bounds.h=21.5;job.box=bounds;
  X.restore();
}
`;
let builder = v1Builder;
const replaceOnce = (before, after) => { assert.equal(builder.split(before).length - 1, 1); builder = builder.replace(before, after); };
replaceOnce("const layout = fs.readFileSync(`${folder}/layout-candidate.mjs`, 'utf8').replaceAll('export function ', 'function ');", "const layout = '';" );
replaceOnce("const adapter = fs.readFileSync(`${folder}/coordinate-adapter.mjs`, 'utf8').replace(/^import .*\\n/, '').replaceAll('export function ', 'function ');", `const adapter = ${JSON.stringify(libraryBody)};`);
replaceOnce('return {chargeBox,numberGlyphBoxes,unionBoxes,planReadings,paintReadings};', 'return {chargeBox,createWorkspaceV2,numberBoxV2,createSnapshotV2,planReadingsV2,paintReadingsV2};');
const helpersStart = builder.indexOf('const helpers = `');
const helpersEnd = builder.indexOf('const original = ', helpersStart);
builder = builder.slice(0, helpersStart) + `const helpers = ${JSON.stringify(helpers)};\n` + builder.slice(helpersEnd);
const queueStart = builder.indexOf('const queuePainter = `');
const queueEnd = builder.indexOf('const changes = ', queueStart);
builder = builder.slice(0, queueStart) + `const queuePainter = ${JSON.stringify(queuePainter)};\n` + builder.slice(queueEnd);
replaceOnce('  const _uiuxRect=C.getBoundingClientRect();\n  _uiuxCoordinateFrame={width:VW,height:VH,cameraX:G.cam.x,cameraY:G.cam.y,shakeX:sx,shakeY:sy,zoom:_tzoom,ssaa:_ssaa,backingWidth:C.width,backingHeight:C.height,cssWidth:_uiuxRect.width,cssHeight:_uiuxRect.height,cssLeft:_uiuxRect.left,cssTop:_uiuxRect.top,dpr:_dpr};', `  _uiuxV2DrawFrame.width=VW;_uiuxV2DrawFrame.height=VH;_uiuxV2DrawFrame.cameraX=G.cam.x;_uiuxV2DrawFrame.cameraY=G.cam.y;_uiuxV2DrawFrame.shakeX=sx;_uiuxV2DrawFrame.shakeY=sy;_uiuxV2DrawFrame.zoom=_tzoom;_uiuxV2DrawFrame.ssaa=_ssaa;_uiuxV2DrawFrame.backingWidth=C.width;_uiuxV2DrawFrame.backingHeight=C.height;_uiuxV2DrawFrame.dpr=_dpr;_uiuxV2Snapshot.begin(_uiuxV2DrawFrame);`);
builder = builder.replaceAll('coordinate.candidate.diff', 'hotpath-v2.zero-context.diff').replaceAll('coordinate-source-evidence.json', 'hotpath-v2-source-evidence.json').replaceAll('coordinate-runtime-fixture.js', 'hotpath-v2-runtime-fixture.js');
builder += `\nfs.writeFileSync(folder+'/hotpath-v2-candidate.tmp.html',candidate);\n`;
await import('data:text/javascript;base64,' + Buffer.from(builder).toString('base64'));
const temporary = `${folder}/hotpath-v2-candidate.tmp.html`;
let patch;
try {
  try { patch = execFileSync('diff', ['-u', '--label', 'a/game.html', '--label', 'b/game.html', 'game.html', temporary], { encoding: 'utf8' }); }
  catch (error) { if (error.status !== 1) throw error; patch = error.stdout; }
  const source = fs.readFileSync('game.html', 'utf8');
  const candidate = fs.readFileSync(temporary, 'utf8');
  const sourceLines = source.split('\n');
  const lines = patch.split('\n');
  const changes = [];
  for (let index = 2; index < lines.length; index++) {
    const header = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(lines[index]);
    if (!header) continue;
    const before = [], after = [];
    for (index++; index < lines.length && !lines[index].startsWith('@@'); index++) {
      const line = lines[index];
      if (line.startsWith(' ') || line.startsWith('-')) before.push(line.slice(1));
      if (line.startsWith(' ') || line.startsWith('+')) after.push(line.slice(1));
    }
    index--; assert.equal(before.length, Number(header[2] || 1)); assert.equal(after.length, Number(header[4] || 1));
    changes.push({ line: Number(header[1]), before, after });
  }
  for (const change of changes.reverse()) {
    assert.deepEqual(sourceLines.slice(change.line - 1, change.line - 1 + change.before.length), change.before);
    sourceLines.splice(change.line - 1, change.before.length, ...change.after);
  }
  assert.equal(sourceLines.join('\n'), candidate);
  fs.writeFileSync(`${folder}/hotpath-v2.with-context.diff`, patch);
  const evidence = JSON.parse(fs.readFileSync(`${folder}/hotpath-v2-source-evidence.json`, 'utf8'));
  evidence.contextHunks = changes.length; evidence.contextReplay = 'PASS'; evidence.rectContract = 'nonempty measurable frame: once per frame, never stale across frames';
  fs.writeFileSync(`${folder}/hotpath-v2-source-evidence.json`, JSON.stringify(evidence, null, 2) + '\n');
  for (const script of [...candidate.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(match => !/type\s*=\s*["'](?:importmap|module|application\/json)["']/i.test(match[1])).map(match => match[2]).filter(script => script.trim())) new vm.Script(script);
  console.log(JSON.stringify({ contextReplay: 'PASS', contextHunks: changes.length, productionEdited: false }));
} finally { fs.rmSync(temporary, { force: true }); }
