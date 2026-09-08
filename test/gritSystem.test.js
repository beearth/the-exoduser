import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('grit is an unbounded 1-SP sink whose total includes level, gear, and affix bonuses', () => {
  assert.match(gameHtml, /let _grit=0;/);
  assert.match(gameHtml, /function _gritCost\(\)\{return 1;\}/);
  assert.match(gameHtml, /function _gritBatchCost\(n\)\{return Math\.max\(0,n\);\}/);
  assert.match(gameHtml, /function _gritTotal\(\)\{return _grit\+_lvB\(\)\+_eqStat\('Grit'\)\+_eqAffix\('gritFlatN'\)\+_eqAffix\('gritFlatR'\)\}/);
  assert.match(gameHtml, /function _gritHpFlat\(\)\{return _gritTotal\(\);\}/);
  assert.match(gameHtml, /function _gritMpFlat\(\)\{return _gritTotal\(\);\}/);
  assert.match(gameHtml, /function _gritStFlat\(\)\{return _gritTotal\(\);\}/);
});

test('grit adds flat hp, mp, and stamina caps after bonus aggregation', () => {
  assert.match(
    gameHtml,
    /P\.mst=~~\(base\+bonus[\s\S]*\+_gritStFlat\(\);P\.st=Math\.min\(P\.st,P\.mst\);/
  );
  assert.match(
    gameHtml,
    /P\.mhp=~~\(\(_stgHp\+s\.str\*5\+s\.vit\*3[\s\S]*P\.mhp=~~\(P\.mhp\+~~_cr\.hp\)\+\(PASSIVES\.pHuman\|\|0\)\*100\+_gritHpFlat\(\);P\.hp=Math\.min\(P\.hp,P\.mhp\);/
  );
  assert.match(
    gameHtml,
    /P\.mmp=~~\(100\+s\.int\*2\+_totalBonusMp\+_eqAffix\('maxMPFlat'\)\+_enhMp\);[\s\S]*P\.mmp=~~\(P\.mmp\+~~_cr\.mp\)\+\(PASSIVES\.pHuman\|\|0\)\*100\+_gritMpFlat\(\);P\.mp=Math\.min\(P\.mp,P\.mmp\);/
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
    /const _si=\$\('skillInfo'\);\s*_si\.innerHTML='LV\.'\+P\.lv\+' \| SP: '\+P\.sp\+_L\(' \| 악의: ',' \| Malice: '\)\+G\.mats\+_L\(' \| 사슬: ',' \| Chain: '\)\+~~_harpGauge\+'\/'\+_HARP_GAUGE_MAX;/
  );
  assert.match(
    gameHtml,
    /const _oldGritBtn=\$\('gritBtn'\);if\(_oldGritBtn\)_oldGritBtn\.remove\(\);/
  );
});

test('growth panel connects grit to the shared capped-stat transaction with no grit cap', () => {
  assert.match(gameHtml, /state:\(\)=>\(\{stats:STATS,passives:PASSIVES,grit:_grit/);
  assert.match(gameHtml, /statChange\(value,key==='grit'\?Infinity:STAT_MAX\[key\],P.sp,amount\)/);
  assert.match(gameHtml, /if\(key==='grit'\)_grit=next.value;else STATS\[key\]=next.value;/);
});

test('grit summary separates spent SP grit from the level bonus', () => {
  assert.match(
    gameHtml,
    /`<div style="\$\{_sLn\}">\$\{_L\('근성','Grit'\)\}: <span style="color:#ffaa33">Lv\.\$\{_grit\+_lb2\}<\/span> <span style="color:#887766;font-size:1\.1rem">\(SP\$\{_grit\}\+Lv\$\{_lb2\}\)<\/span><\/div>`/
  );
});
