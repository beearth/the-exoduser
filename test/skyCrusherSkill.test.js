import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

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

function pngContract(url) {
  const data = readFileSync(url);
  assert.equal(data.toString('ascii', 1, 4), 'PNG');
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20), colorType: data[25] };
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
    maxT: 636,
    mpCost: 80,
    maxCharges: 3,
    recharge: 900,
    persistT: 600,
    dotEvery: 30,
    dotMul: 0.05,
    fireRadius: 169,
  });
  assert.deepEqual(spec(20), {
    range: 1000,
    radius: 488,
    impactT: 24,
    shardT: 39,
    shardCount: 12,
    maxT: 624,
    mpCost: 80,
    maxCharges: 3,
    recharge: 900,
    persistT: 600,
    dotEvery: 30,
    dotMul: 0.05,
    fireRadius: 317,
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
  assert.match(gameHtml, /desc:'\[선택: Space\][^']+MP 80[^']+3충전[^']+충전당 15초/);
  assert.match(gameHtml, /function _isRageBurstSkillId\(id\)\{const sk=_skById\(id\);return id==='giantSlam'\|\|id==='giantSlam2'\|\|!!\(sk&&sk\.cat==='rage'\)\}/);
});

test('Sky Crusher has an MP gate and a three-charge cooldown HUD', () => {
  assert.match(gameHtml, /skyCrusher:\{b:14,g:11\.2\}/);
  assert.match(gameHtml, /case 'skyCrusher':\s*if\(P\.mp>=80&&_skyCrusherChargeCount\(\)>0\)\{activateSkyCrusher\(\);_skOk=true\}/);
  assert.match(gameHtml, /skyCrusher:P\._scCd\|\|0/);
  assert.match(gameHtml, /const _spCdMap=\{giantSlam:P\._gslCd\|\|0,giantSlam2:P\._gslCd\|\|0,skyCrusher:P\._scCd\|\|0\}/);
  assert.match(gameHtml, /_anySkCd=\([^;]+\|\|P\._scCd>0/);
  assert.match(gameHtml, /elBow\.innerHTML=_spSk\?\(_skIcon\(_spSk\)\|\|`<span class="sk-opt-emoji">\$\{\(_skById\(_spSk\)\|\|\{\}\)\.emoji\|\|'🔥'\}<\/span>`\):''/);
  assert.match(gameHtml, /const _spOnCd=_spSk==='skyCrusher'\?_spScStk<=0&&_spCdNow>0:_spCdNow>0/);
  assert.match(gameHtml, /_skRecharging=_stk<3&&_rch>0/);
});

test('Rage cooldown recovery also applies to Sky Crusher', () => {
  assert.match(gameHtml, /_tickSkyCrusherRecharge\(_scParryCut\+_prRageCd\)/);
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

test('Sky Crusher loads a dedicated giant iron wedge sprite', () => {
  assert.ok(existsSync(new URL('../img/vfx/sky_crusher_iron_wedge.png', import.meta.url)));
  assert.match(gameHtml, /_SKY_CRUSHER_IMG\.src='img\/vfx\/sky_crusher_iron_wedge\.png'/);
});

test('Sky Crusher drives the iron wedge down a 45-degree meteor trajectory', () => {
  assert.match(gameHtml, /천공쇄기 — 예고 원·45도 메테오 쇄기·지면 관통/);
  assert.match(gameHtml, /X\.ellipse\(sc\.x,sc\.y,sc\.r,sc\.r\*\.48/);
  assert.match(gameHtml, /const _scAirX=sc\.x-\(1-_scFall\)\*720,_scAirY=sc\.y-\(1-_scFall\)\*720/);
  assert.match(gameHtml, /X\.translate\(_scAirX,_scAirY\);X\.globalAlpha/);
  assert.match(gameHtml, /_drawSkyCrusherFrame\(_scFrame,_scW,_scH\)/);
  assert.match(gameHtml, /X\.drawImage\(_SKY_CRUSHER_IMG,\(frame%_scCols\)\*sw/);
  assert.doesNotMatch(gameHtml, /for\(let _tooth=0;_tooth<12;_tooth\+\+\)/);
  assert.doesNotMatch(gameHtml, /X\.rotate\(sc\.t\*\.16\)/);
});

test('Sky Crusher uses sprite-owned ground depth without a procedural circle', () => {
  assert.match(gameHtml, /const _persistT=sc\.t-sc\.impactT,_persistFade=Math\.min\(1,Math\.max\(0,\(sc\.persistT-_persistT\)\/30\)\)/);
  assert.match(gameHtml, /X\.translate\(sc\.x\+_embedJolt,sc\.y\);X\.globalAlpha=_persistFade/);
  assert.match(gameHtml, /_drawSkyCrusherBurnFrame\(_embedFrame,_embedW,_embedH\)/);
  assert.match(gameHtml, /별도 원형 장판은 그리지 않음/);
  assert.doesNotMatch(gameHtml, /const _craterP=/);
  assert.doesNotMatch(gameHtml, /const _firePulse=/);
  assert.doesNotMatch(gameHtml, /sc\.fireRadius,sc\.fireRadius\*\.44/);
});

test('Sky Crusher uses a dedicated lighter-than-Hell-Slam sound pair', () => {
  assert.match(gameHtml, /skyCrusherFall\(\)\{/);
  assert.match(gameHtml, /skyCrusherImpact\(\)\{/);
  assert.match(gameHtml, /playSample\('heavy_hit',\.65,_r\(\.92,\.04\)\)/);
  assert.match(gameHtml, /playSub\(48,\.32,\.2,12\)/);
  assert.match(gameHtml, /addTxt\(target\.x,target\.y-30,[^;]+;SFX\.skyCrusherFall\(\);shake\(3\)/);
  assert.match(gameHtml, /_addBoom\(sc\.x,sc\.y,sc\.r,30,'dark'\);SFX\.skyCrusherImpact\(\);shake\(28\)/);
});

test('Sky Crusher stores three charges and recharges one every 15 seconds', () => {
  const source = extractFunction('_skyCrusherSpec');
  const spec = Function(`${source};return _skyCrusherSpec`)()(1);
  assert.equal(spec.maxCharges, 3);
  assert.equal(spec.recharge, 900);
  assert.equal(spec.persistT, 600);
  assert.match(gameHtml, /function _skyCrusherChargeCount\(\)/);
  assert.match(gameHtml, /P\._scCharges=Math\.max\(0,charges-1\)/);
  assert.match(gameHtml, /case 'skyCrusher':\s*if\(P\.mp>=80&&_skyCrusherChargeCount\(\)>0\)/);
  assert.match(gameHtml, /_tickSkyCrusherRecharge\(sp\+_hdCdBonus\)/);
});

test('parrying trims the next Sky Crusher charge by half a second once per frame', () => {
  assert.match(gameHtml, /const _scParryCut=_skyCrusherChargeCount\(\)<3&&P\._scCd>0\?30:0/);
  assert.match(gameHtml, /P\._parryCdFrame!==G\.frame/);
  assert.match(gameHtml, /_tickSkyCrusherRecharge\(_scParryCut\+_prRageCd\)/);
});

test('embedded Sky Crusher persists for ten seconds and deals periodic fire damage', () => {
  assert.match(gameHtml, /maxT:impactT\+persistT/);
  assert.match(gameHtml, /dotEvery:30,dotMul:\.05/);
  assert.match(gameHtml, /sc\.nextDotT=sc\.impactT\+sc\.dotEvery/);
  assert.match(gameHtml, /hurtE\(e,~~\(sc\.dmg\*sc\.dotMul\),a,true,\{magic:true,dot:true,noPoise:true\},EL\.F\)/);
  assert.match(gameHtml, /sc\.nextDotT\+=sc\.dotEvery/);
});

test('Sky Crusher renders the supplied fall and burning sprite sheets', () => {
  const fallUrl = new URL('../img/vfx/sky_crusher_iron_wedge.png', import.meta.url);
  const burnUrl = new URL('../img/vfx/sky_crusher_burning.png', import.meta.url);
  const iconUrl = new URL('../img/skillskin_upscaled/skyCrusher.png', import.meta.url);
  assert.ok(existsSync(burnUrl));
  assert.deepEqual(pngContract(fallUrl), { width: 1536, height: 1024, colorType: 6 });
  assert.deepEqual(pngContract(burnUrl), { width: 1536, height: 1024, colorType: 6 });
  assert.deepEqual(pngContract(iconUrl), { width: 768, height: 768, colorType: 6 });
  assert.match(gameHtml, /skyCrusher:1/);
  assert.match(gameHtml, /'skyCrusher','spikeTrap'/);
  assert.match(gameHtml, /function _drawSkyCrusherFrame\(frame,w,h\)/);
  assert.match(gameHtml, /const _scCols=4,_scRows=3/);
  assert.match(gameHtml, /const _scFrame=Math\.min\(3,Math\.floor\(_scFall\*4\)\)/);
  assert.match(gameHtml, /_SKY_CRUSHER_BURN_IMG\.src='img\/vfx\/sky_crusher_burning\.png'/);
  assert.match(gameHtml, /const _scBurnCols=4,_scBurnRows=2/);
  assert.match(gameHtml, /const _embedFrame=Math\.floor\(_persistT\/6\)%8/);
});
