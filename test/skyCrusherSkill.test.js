import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = gameHtml.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') depth++;
    else if (gameHtml[i] === '}' && --depth === 0) return gameHtml.slice(start, i + 1);
  }
  assert.fail(`${name} must have a complete body`);
}

test('Sky Crusher level scaling controls radius, fall timing, and shard count', () => {
  const source = extractFunction('_skyCrusherSpec');
  const spec = Function(`${source};return _skyCrusherSpec`)();

  assert.deepEqual(spec(1), {
    range: 1000,
    radius: 260,
    impactT: 36,
    shardT: 51,
    shardCount: 6,
    maxT: 81,
    mpCost: 80,
    cd: 720,
  });
  assert.deepEqual(spec(20), {
    range: 1000,
    radius: 488,
    impactT: 24,
    shardT: 39,
    shardCount: 12,
    maxT: 69,
    mpCost: 80,
    cd: 720,
  });
});

test('Sky Crusher target follows the cursor and clamps to 1000px from the player', () => {
  const source = extractFunction('_skyCrusherTarget');
  const target = Function('P', 'G', 'VW', 'VH', `${source};return _skyCrusherTarget`)({ x: 100, y: 200 }, { cam: { x: 100, y: 200 } }, 1920, 1080);

  assert.deepEqual(target(960, 540), { x: 100, y: 200 });
  assert.deepEqual(target(2460, 540), { x: 1100, y: 200 });
});

test('Sky Crusher appears in the Special tab Rage category and uses the Space slot', () => {
  assert.match(gameHtml, /\{id:'rage',name:'🔥 분노',nameEn:'🔥 Rage'/);
  assert.match(gameHtml, /\{id:'spec',name:'⚙ 특수'[^\n]+cats:\['tech','rage','ult'\]/);
  assert.match(gameHtml, /\{id:'skyCrusher',name:'천공쇄기',cat:'rage',act:true,emoji:'🪨'/);
  assert.match(gameHtml, /desc:'\[선택: Space\][^']+MP 80[^']+쿨 12초/);
  assert.match(gameHtml, /function _isRageBurstSkillId\(id\)\{const sk=_skById\(id\);return id==='giantSlam'\|\|id==='giantSlam2'\|\|!!\(sk&&sk\.cat==='rage'\)\}/);
});

test('Sky Crusher has an MP gate and 12 second cooldown', () => {
  assert.match(gameHtml, /skyCrusher:\{b:14,g:11\.2\}/);
  assert.match(gameHtml, /case 'skyCrusher':\s*if\(P\.mp>=80&&\(P\._scCd\|\|0\)<=0\)\{activateSkyCrusher\(\);_skOk=true\}/);
  assert.match(gameHtml, /skyCrusher:P\._scCd\|\|0/);
  assert.match(gameHtml, /const _spCdMap=\{giantSlam:P\._gslCd\|\|0,giantSlam2:P\._gslCd\|\|0,skyCrusher:P\._scCd\|\|0\}/);
  assert.match(gameHtml, /_anySkCd=\([^;]+\|\|P\._scCd>0/);
  assert.match(gameHtml, /elBow\.innerHTML=_spSk\?\(_skIcon\(_spSk\)\|\|`<span class="sk-opt-emoji">\$\{\(_skById\(_spSk\)\|\|\{\}\)\.emoji\|\|'🔥'\}<\/span>`\):''/);
  assert.match(gameHtml, /if\(\(P\._scCd\|\|0\)>0\)P\._scCd-=sp/);
});

test('Rage cooldown recovery also applies to Sky Crusher', () => {
  assert.match(gameHtml, /if\(_prRageCd&&\(P\._gslCd>0\|\|P\._scCd>0\)&&P\._parryCdFrame!==G\.frame\)/);
  assert.match(gameHtml, /P\._scCd=Math\.max\(0,\(P\._scCd\|\|0\)-_prRageCd\)/);
});

test('Sky Crusher schedules a telegraphed impact and delayed shard burst', () => {
  const activation = extractFunction('activateSkyCrusher');
  assert.match(activation, /magicRef\(\)\*statInt\(\)\*pMagicMul\(\)\*_skMul\('skyCrusher'\)/);
  assert.match(activation, /G\._skyCrushers\.push\(\{x:target\.x,y:target\.y,t:0/);
  assert.match(gameHtml, /if\(!sc\.impacted&&sc\.t>=sc\.impactT\)/);
  assert.match(gameHtml, /hurtE\(e,sc\.dmg,a,false,\{magic:true,explode:true,poiseHit:true,poiseMult:2/);
  assert.match(gameHtml, /if\(!sc\.sharded&&sc\.t>=sc\.shardT\)/);
  assert.match(gameHtml, /hurtE\(e,~~\(sc\.dmg\*\.35\),a,true,\{magic:true,explode:true,noPoise:true\}/);
});

test('Sky Crusher renders its warning circle, falling crusher, and impact crater', () => {
  assert.match(gameHtml, /천공쇄기 — 예고 원·낙하 돌쇄기·충돌 크레이터/);
  assert.match(gameHtml, /X\.ellipse\(sc\.x,sc\.y,sc\.r,sc\.r\*\.48/);
  assert.match(gameHtml, /const _scAirY=sc\.y-\(1-_scFall\)\*600/);
  assert.match(gameHtml, /for\(let _tooth=0;_tooth<12;_tooth\+\+\)/);
  assert.match(gameHtml, /X\.arc\(sc\.x,sc\.y,sc\.r\*_craterP/);
});
