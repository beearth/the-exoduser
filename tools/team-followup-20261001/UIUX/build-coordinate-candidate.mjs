import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const folder = 'tools/team-followup-20261001/UIUX';
const source = fs.readFileSync('game.html', 'utf8');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const snippet = (name, begin, finish) => {
  const start = source.indexOf(begin);
  const end = source.indexOf(finish, start);
  assert.ok(start >= 0 && end > start, name);
  const text = source.slice(start, end);
  return { name, line: source.slice(0, start).split('\n').length, sha256: hash(text), text };
};
const snippets = [
  snippet('drawTransform', '  let sx=0,sy=0;if(G.shake', '  const s1=Math.max'),
  snippet('resizeContract', 'function rz(){', '  C.style.imageRendering'),
  snippet('chargePainter', 'function _drawProjectileChargeLabel(', 'function _drawShootCharge('),
  snippet('numberPainter', 'function drawNumStr(', 'function $(id)'),
  snippet('damageStateAndDraw', '    const _rawTa=t.life/t.ml;', '  }X.globalAlpha=1;X.textBaseline=')
];
const layout = fs.readFileSync(`${folder}/layout-candidate.mjs`, 'utf8').replaceAll('export function ', 'function ');
const adapter = fs.readFileSync(`${folder}/coordinate-adapter.mjs`, 'utf8').replace(/^import .*\n/, '').replaceAll('export function ', 'function ');
const library = `const _uiuxCoordinateCandidate=(()=>{\n${layout}\n${adapter}\nreturn {chargeBox,numberGlyphBoxes,unionBoxes,planReadings,paintReadings};\n})();\n`;
const helpers = `const _uiuxCoordinateJobs=[];
let _uiuxCoordinateFrame=null;
let _uiuxCoordinateStatus={status:'UNKNOWN'};
function _uiuxQueueNumber(num,x,y,color,scale,alpha){
  const box=_uiuxCoordinateCandidate.unionBoxes(_uiuxCoordinateCandidate.numberGlyphBoxes(num,x,y,scale,_NUM_W,_NUM_H));
  _uiuxCoordinateJobs.push({id:'damage-'+_uiuxCoordinateJobs.length,kind:'damage',box,paint:context=>{context.globalAlpha=alpha;drawNumStr(context,num,x,y,color,scale)}});
}
function _uiuxFlushCoordinates(){
  const measurable=_uiuxCoordinateJobs.filter(job=>job.box);
  try{
    let planned;
    try{planned=_uiuxCoordinateCandidate.planReadings(measurable,_uiuxCoordinateFrame)}catch(error){
      if(!(error instanceof TypeError))throw error;
      _uiuxCoordinateStatus={status:'UNKNOWN',reason:error.message};
      for(const job of _uiuxCoordinateJobs){X.save();try{job.paint(X)}finally{X.restore()}}
      return;
    }
    _uiuxCoordinateCandidate.paintReadings(X,measurable,planned);
    for(const job of _uiuxCoordinateJobs)if(!job.box){X.save();try{job.paint(X)}finally{X.restore()}}
    _uiuxCoordinateStatus={status:'STATIC_CANDIDATE',unresolved:planned.filter(reading=>reading.unresolved).length,ordinaryText:'UNKNOWN',leaderPainting:'UNKNOWN'};
  }finally{_uiuxCoordinateJobs.length=0;_uiuxCoordinateFrame=null}
}
`;
const original = snippets.find(item => item.name === 'chargePainter').text;
const queuePainter = `function _drawProjectileChargeLabel(x,y,r,label){
  X.save();X.font='bold 13px "Noto Sans KR",sans-serif';
  const metrics=_chargeLabelMetrics;
  if(metrics.ctx!==X||metrics.label!==label||metrics.font!==X.font){
    metrics.width=X.measureText(label).width;metrics.ctx=X;metrics.label=label;metrics.font=X.font;
  }
  const box=_uiuxCoordinateCandidate.chargeBox(x,y,r,metrics.width);
  X.restore();
  _uiuxCoordinateJobs.push({id:'charge-'+_uiuxCoordinateJobs.length,kind:'charge',box,paint:()=>_uiuxPaintChargeLabel(x,y,r,label)});
}
`;
const changes = [
  { before: original, after: library + helpers + queuePainter + original.replace('function _drawProjectileChargeLabel(', 'function _uiuxPaintChargeLabel(') },
  { before: 'function draw(){\n  if(!X)return;', after: 'function draw(){\n  _uiuxCoordinateJobs.length=0;_uiuxCoordinateFrame=null;\n  if(!X)return;' },
  { before: '  const _vpMul=1/Math.max(0.3,_tzoom); // 줌아웃 시 뷰포트 범위 확장 배수', after: `  const _uiuxRect=C.getBoundingClientRect();
  _uiuxCoordinateFrame={width:VW,height:VH,cameraX:G.cam.x,cameraY:G.cam.y,shakeX:sx,shakeY:sy,zoom:_tzoom,ssaa:_ssaa,backingWidth:C.width,backingHeight:C.height,cssWidth:_uiuxRect.width,cssHeight:_uiuxRect.height,cssLeft:_uiuxRect.left,cssTop:_uiuxRect.top,dpr:_dpr};
  const _vpMul=1/Math.max(0.3,_tzoom); // 줌아웃 시 뷰포트 범위 확장 배수` },
  { before: '      X.save();X.globalAlpha=_ta;\n      drawNumStr(X,t._numStr,t.x+_sk,t.y-_NUM_H*_sc/2,_ci,_sc);\n      X.restore();', after: '      _uiuxQueueNumber(t._numStr,t.x+_sk,t.y-_NUM_H*_sc/2,_ci,_sc,_ta);' },
  { before: '  X.restore();\n  if(_wantPlateTest()){', after: '  _uiuxFlushCoordinates();\n  X.restore();\n  if(_wantPlateTest()){' }
];
let candidate = source;
for (const change of changes) {
  assert.equal(source.split(change.before).length - 1, 1);
  candidate = candidate.replace(change.before, change.after);
}
const scripts = [...candidate.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(match => !/type\s*=\s*["'](?:importmap|module|application\/json)["']/i.test(match[1])).map(match => match[2]).filter(script => script.trim());
for (const script of scripts) new vm.Script(script);
let offset = 0;
const hunks = changes.sort((first, second) => source.indexOf(first.before) - source.indexOf(second.before)).map(change => {
  const line = source.slice(0, source.indexOf(change.before)).split('\n').length;
  const oldLines = change.before.trimEnd().split('\n');
  const newLines = change.after.trimEnd().split('\n');
  const hunk = `@@ -${line},${oldLines.length} +${line + offset},${newLines.length} @@\n${oldLines.map(value => '-' + value).join('\n')}\n${newLines.map(value => '+' + value).join('\n')}\n`;
  offset += newLines.length - oldLines.length;
  return hunk;
});
const replay = source.split('\n');
for (const hunk of [...hunks].reverse()) {
  const lines = hunk.trimEnd().split('\n');
  const header = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/.exec(lines.shift());
  const oldLines = lines.filter(line => line.startsWith('-')).map(line => line.slice(1));
  const newLines = lines.filter(line => line.startsWith('+')).map(line => line.slice(1));
  assert.deepEqual(replay.slice(Number(header[1]) - 1, Number(header[1]) - 1 + oldLines.length), oldLines);
  replay.splice(Number(header[1]) - 1, oldLines.length, ...newLines);
}
assert.equal(replay.join('\n'), candidate);
assert.equal(fs.readFileSync('game.html', 'utf8'), source);
fs.writeFileSync(`${folder}/coordinate.candidate.diff`, '--- a/game.html\n+++ b/game.html\n' + hunks.join(''));
fs.writeFileSync(`${folder}/coordinate-source-evidence.json`, JSON.stringify({ observedAt: new Date().toISOString(), gameSha256: hash(source), snippets, candidateSha256: hash(candidate), scripts: scripts.length, hunks: hunks.length, patchReplay: 'PASS', productionUnchanged: true, visual: 'UNKNOWN' }, null, 2) + '\n');
fs.writeFileSync(`${folder}/coordinate-runtime-fixture.js`, library + helpers + queuePainter + original.replace('function _drawProjectileChargeLabel(', 'function _uiuxPaintChargeLabel('));
console.log(JSON.stringify({ scripts: scripts.length, hunks: hunks.length, patchReplay: 'PASS', gameSha256: hash(source) }));
