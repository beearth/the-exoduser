import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const outputPath = 'tools/team-followup-20261001/UIUX';
const source = fs.readFileSync('game.html', 'utf8');
const start = source.indexOf('function _drawProjectileChargeLabel(x,y,r,label){');
const end = source.indexOf('function _drawShootCharge(', start);
assert.ok(start >= 0 && end > start);
const original = source.slice(start, end);
const replacement = `const _combatChargeReadings=[];
function _drawProjectileChargeLabel(x,y,r,label){
  _combatChargeReadings.push({x,y,r,label});
}
function _flushCombatChargeReadings(){
  for(const reading of _combatChargeReadings){
    _paintProjectileChargeLabel(reading.x,reading.y,reading.r,reading.label);
  }
  _combatChargeReadings.length=0;
}
${original.replace('function _drawProjectileChargeLabel(', 'function _paintProjectileChargeLabel(')}`;
const insertions = [
  { before: 'function draw(){\n  if(!X)return;', after: 'function draw(){\n  _combatChargeReadings.length=0;\n  if(!X)return;' },
  { before: "  X.restore();\n  if(_wantPlateTest()){", after: "  _flushCombatChargeReadings();\n  X.restore();\n  if(_wantPlateTest()){" }
];
let candidate = source.replace(original, replacement);
for (const insertion of insertions) {
  assert.equal(source.split(insertion.before).length - 1, 1);
  candidate = candidate.replace(insertion.before, insertion.after);
}
const extracted = [...candidate.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(match => !/type\s*=\s*["'](?:importmap|module|application\/json)["']/i.test(match[1])).map(match => match[2]).filter(script => script.trim());
for (const script of extracted) new vm.Script(script);
const queueScript = replacement.slice(0, replacement.indexOf('function _paintProjectileChargeLabel('));
const calls = [];
const context = vm.createContext({ _paintProjectileChargeLabel: (...args) => calls.push(args) });
new vm.Script(queueScript).runInContext(context);
vm.runInContext("_drawProjectileChargeLabel(10,20,12,'물리탄 차징 · E로 패링');_drawProjectileChargeLabel(30,40,12,'PHYSICAL SHOT CHARGING · PARRY WITH E')", context);
assert.equal(calls.length, 0);
vm.runInContext('_flushCombatChargeReadings();_flushCombatChargeReadings()', context);
assert.deepEqual(calls, [[10, 20, 12, '물리탄 차징 · E로 패링'], [30, 40, 12, 'PHYSICAL SHOT CHARGING · PARRY WITH E']]);
const changes = [{ before: original, after: replacement }, ...insertions];
let addedLines = 0;
const hunks = changes.sort((first, second) => source.indexOf(first.before) - source.indexOf(second.before)).map(change => {
  const line = source.slice(0, source.indexOf(change.before)).split('\n').length;
  const beforeLines = change.before.trimEnd().split('\n');
  const afterLines = change.after.trimEnd().split('\n');
  const hunk = `@@ -${line},${beforeLines.length} +${line + addedLines},${afterLines.length} @@\n${beforeLines.map(value => `-${value}`).join('\n')}\n${afterLines.map(value => `+${value}`).join('\n')}\n`;
  addedLines += afterLines.length - beforeLines.length;
  return hunk;
});
const replayLines = source.split('\n');
for (const hunk of [...hunks].reverse()) {
  const lines = hunk.trimEnd().split('\n');
  const header = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@$/.exec(lines.shift());
  assert.ok(header);
  const oldLines = lines.filter(line => line.startsWith('-')).map(line => line.slice(1));
  const newLines = lines.filter(line => line.startsWith('+')).map(line => line.slice(1));
  assert.deepEqual(replayLines.slice(Number(header[1]) - 1, Number(header[1]) - 1 + oldLines.length), oldLines);
  replayLines.splice(Number(header[1]) - 1, oldLines.length, ...newLines);
}
assert.equal(replayLines.join('\n'), candidate);
assert.equal(fs.readFileSync('game.html', 'utf8'), source);
fs.writeFileSync(`${outputPath}/charge-priority.candidate.diff`, '--- a/game.html\n+++ b/game.html\n' + hunks.join(''));
fs.writeFileSync(`${outputPath}/priority-validation.json`, JSON.stringify({ inputSha256: crypto.createHash('sha256').update(source).digest('hex'), syntaxScripts: extracted.length, queuedCalls: 2, callsAfterRepeatedFlush: calls.length, patchReplay: 'PASS', productionSourceUnchanged: true, scope: '미적용 우선순위 hunk, 원좌표·문구 유지. 배치 후보는 별도 게이트' }, null, 2) + '\n');
console.log(JSON.stringify({ syntaxScripts: extracted.length, queueChecks: 'PASS', written: 'charge-priority.candidate.diff', productionEdited: false }));
