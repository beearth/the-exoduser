import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('grit is defined as an unbounded SP sink with flat +1 bonuses', () => {
  assert.match(gameHtml, /let _grit=0;/);
  assert.match(gameHtml, /function _gritCost\(\)\{return 1;\}/);
  assert.match(gameHtml, /function _gritBatchCost\(n\)\{return Math\.max\(0,n\);\}/);
  assert.match(gameHtml, /function _gritHpFlat\(\)\{return _grit;\}/);
  assert.match(gameHtml, /function _gritMpFlat\(\)\{return _grit;\}/);
  assert.match(gameHtml, /function _gritStFlat\(\)\{return _grit;\}/);
});

test('grit adds flat hp, mp, and stamina caps after bonus aggregation', () => {
  assert.match(
    gameHtml,
    /P\.mst=~~\(base\+bonus\+~~\(P\._crystalStats\?P\._crystalStats\.st:0\)\)\+_gritStFlat\(\);P\.st=Math\.min\(P\.st,P\.mst\);/
  );
  assert.match(
    gameHtml,
    /P\.mhp=~~\(\(_stgHp\+P\.lv\*1\+s\.str\*1\+_totalBonusHp\+_afHpF\+_imHp\+_enhHp\)\*\(1\+_afHpP\+_imHpP\*\.01\+\(PASSIVES\.pMelee\|\|0\)\*\.03\)\);[\s\S]*P\.mhp=~~\(P\.mhp\+~~_cr\.hp\)\+_gritHpFlat\(\);P\.hp=Math\.min\(P\.hp,P\.mhp\);/
  );
  assert.match(
    gameHtml,
    /P\.mmp=~~\(\(100\+P\.lv\*\.5\+s\.int\*1\)\*\(1\+_eqAffix\('maxMPPct'\)\)\);[\s\S]*P\.mmp=~~\(P\.mmp\+~~_cr\.mp\)\+_gritMpFlat\(\);P\.mp=Math\.min\(P\.mp,P\.mmp\);/
  );
});

test('grit is loaded from save data and persisted in all save payloads', () => {
  assert.match(gameHtml, /_grit=d\.grit\|\|0;/);
  assert.match(
    gameHtml,
    /if\(_grit>0&&!d\.gritCostModeV2\)\{const _legacySpent=_grit\*3\+\(\(_grit-1\)\*_grit\)\/2;const _refund=Math\.max\(0,_legacySpent-_grit\);if\(_refund>0\)P\.sp\+=_refund;\}/
  );
  const saveMatches = gameHtml.match(/passives:\{\.\.\.PASSIVES\},grit:_grit,/g) || [];
  assert.ok(saveMatches.length >= 3);
  const modeMatches = gameHtml.match(/gritCostModeV2:1/g) || [];
  assert.ok(modeMatches.length >= 3);
});

test('skill panel stays clean and removes the old grit button', () => {
  assert.match(
    gameHtml,
    /\$\('skillInfo'\)\.textContent='LV\.'\+P\.lv\+' \| ⭐ SP: '\+P\.sp\+' \| 👿 악의: '\+G\.mats\+' \| 🔱 작살: '\+\~\~_harpGauge\+'\/'\+_HARP_GAUGE_MAX;/
  );
  assert.match(
    gameHtml,
    /const _oldGritBtn=\$\('gritBtn'\);if\(_oldGritBtn\)_oldGritBtn\.remove\(\);/
  );
});

test('stat panel renders grit as a dedicated row below the base stats', () => {
  assert.match(
    gameHtml,
    /\$\('spRemain'\)\.textContent='남은 SP: '\+P\.sp;/
  );
  assert.match(
    gameHtml,
    /근성 \(GRIT\)[\s\S]*최대 HP\/MP\/ST 각각 \+1\/lv, 현재 HP\+MP\+ST \+\$\{_grit\}씩, SP 1당 근성 \+1[\s\S]*_gBtnsDiv\.appendChild\(_mkGritBtn\('-10','#cc7777',_grit>=10,[\s\S]*_gBtnsDiv\.appendChild\(_mkGritBtn\('-1','#cc7777',_grit>=1,[\s\S]*_gBtnsDiv\.appendChild\(_mkGritBtn\('\+1','#ccaa77',P\.sp>=_gCost1,[\s\S]*_gBtnsDiv\.appendChild\(_mkGritBtn\('\+10','#ccaa77',P\.sp>=_gCost10,/
  );
});

test('grit summary explains the 1 SP to 1 grit rule', () => {
  assert.match(
    gameHtml,
    /`<div style="\$\{_sLn\}">근성: <span style="color:#ffaa33">Lv\.\$\{_grit\}<\/span> <span style="color:#887766;font-size:1\.1rem">\(HP\/MP\/ST 각각 \+\$\{_grit\}, SP 1당 \+1\)<\/span><\/div>`/
  );
});
