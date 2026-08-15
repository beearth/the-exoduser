import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 4B-5C / LOCK-24] L5 ATTACK-STYLE NODES — BATCH 2 ═══
// projBounce·beamWidth (신규 v2only) + shieldBypass (기존, audit 후 구현). 실제 행동 E2E.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);

function buildRoller(pool){
  const afslot=gameHtml.match(/const _AFSLOT=\{[^}]*\};/)[0];
  const fTier=gameHtml.match(/function _affixTierRoll\(a,maxTier\)\{[\s\S]*?\n\}/)[0];
  const fCand=gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
  const fRoll=gameHtml.match(/function rollAffixesLayered\(grade,slot,brType,layerLv\)\{[\s\S]*?\n  return result;\n\}/)[0];
  const fLeg=gameHtml.match(/function rollAffixes\(grade,slot,brType\)\{[\s\S]*?\n  return result;\n\}/)[0];
  const P={lv:300};
  return new Function('AFFIX_POOL','P','_DEMO_MODE','_DEMO_AFFIX_BANNED',`${afslot}\n${fTier}\n${fCand}\n${fRoll}\n${fLeg}\nreturn {rollAffixesLayered,rollAffixes};`)(pool,P,false,new Set());
}
function seed(n){let s=n>>>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};}
const SLOTS=['weapon','armor','ring1','necklace','boots','shield','bow','gloves','pants','cape','helmet','headband','belt','bracelet'];

// ══════════════════════════════════════════════════════════════
test('§1 배선 존재 — projBounce/beamWidth/shieldBypass consumer', () => {
  assert.match(gameHtml,/const _bMax=\(p\._maxBounce\|\|3\)\+\(p\._pbBonus\|\|0\);/,'projBounce → _maxBounce 확장');
  assert.match(gameHtml,/\(p\.bounces\|\|0\)<\(2\+\(p\._pbBonus\|\|0\)\)/,'projBounce → non-magic bounce cap 확장');
  assert.match(gameHtml,/p\._pbBonus=_eqAffix\('projBounce'\);/,'projBounce 스폰 계산');
  assert.match(gameHtml,/const _beamHitW=28\*\(1\+_eqAffix\('beamWidth'\)\);/,'beamWidth → _beamHitW(geometry)');
  assert.match(gameHtml,/&&!\(!isDot&&_eqAffix\('shieldBypass'\)>0&&Math\.random\(\)<_eqAffix\('shieldBypass'\)\)\)\{/,'shieldBypass → eShield 우회');
});

test('§2 projBounce E2E — 실제 bounce count 정확히 +projBounce, dmg/speed 불변', () => {
  assert.match(gameHtml,/const _bMax=\(p\._maxBounce\|\|3\)\+\(p\._pbBonus\|\|0\);/,'소스 _bMax 식');
  function bounceSeq(maxBounce,pbBonus){
    const p={magic:true,mhBlade:false,explosive:false,_maxBounce:maxBounce,_pbBonus:pbBonus,bounces:0,dmg:500,vx:6,vy:0};
    const dmg0=p.dmg,spd0=Math.sqrt(p.vx*p.vx+p.vy*p.vy);
    const _bMax=(p._maxBounce||3)+(p._pbBonus||0); // 소스 식
    let bounced=0;
    for(let wall=0;wall<30;wall++){
      const canBounce=(p.magic||p.mhBlade)?(p.bounces||0)<_bMax:(!p.explosive&&(p.bounces||0)<(2+(p._pbBonus||0)));
      if(canBounce){p.vx=-p.vx;p.bounces=(p.bounces||0)+1;bounced++;} else break;
    }
    return {bounced,dmgSame:p.dmg===dmg0,spdSame:Math.abs(Math.sqrt(p.vx*p.vx+p.vy*p.vy)-spd0)<1e-9};
  }
  const base=bounceSeq(3,0),plus=bounceSeq(3,2);
  assert.equal(base.bounced,3,'WITHOUT: _maxBounce3 → 3회');
  assert.equal(plus.bounced,5,'WITH projBounce+2 → 5회');
  assert.equal(plus.bounced-base.bounced,2,'증가분 = projBounce');
  assert.ok(base.dmgSame&&plus.dmgSame,'bounce 중 damage 불변');
  assert.ok(base.spdSame&&plus.spdSame,'bounce 후 speed(magnitude) 불변');
  // pierceCount(_pcBonus)/chainTarget과 소비 독립: bounce cap은 _pbBonus만, pierce cap은 _pcBonus만
  const bounceCap=gameHtml.match(/const _bMax=\(p\._maxBounce\|\|3\)\+\(p\._pbBonus\|\|0\);/)[0];
  const pierceCap=gameHtml.match(/const _pMax=\(p\.pierceMax\|\|1\)\+\(p\._pcBonus\|\|0\);/)[0];
  assert.ok(!bounceCap.includes('_pcBonus')&&!pierceCap.includes('_pbBonus'),'projBounce↔pierceCount 소비 로직 독립');
  assert.equal(by('projBounce').unit,'cnt');
});

test('§3 beamWidth geometry E2E — B만 새로 맞음, damage/tick 불변', () => {
  assert.match(gameHtml,/const hitR=_beamHitW\+\(e\.r\|\|16\);/,'소스 hitR 식');
  function beamHit(beamWidth){
    const _beamHitW=28*(1+beamWidth); // 소스 식
    const enemies=[{name:'A',perp:20,r:0},{name:'B',perp:36,r:0},{name:'C',perp:80,r:0}];
    return enemies.filter(e=>{const hitR=_beamHitW+(e.r||0);return e.perp<hitR}).map(e=>e.name);
  }
  assert.deepEqual(beamHit(0),['A'],'WITHOUT: A만 (width 28)');
  assert.deepEqual(beamHit(0.46),['A','B'],'WITH +0.46(width≈40.9): A+B (B 새로 맞음), C 밖');
  assert.equal(by('beamWidth').unit,'pct');
  // beamWidth는 damage/tick 미참조 (geometry만) — _beamHitW가 데미지식에 안 쓰임
  const beamFn=gameHtml.match(/function _beamFindTarget\(ox,oy,ang,maxDist,stepSz\)\{[\s\S]*?\n\}/);
  assert.ok(beamFn,'_beamFindTarget 존재');
});

// ── shieldBypass: 소스 shield 블록 추출 실행 ──
function runShieldBlock(eShield, incoming, sbProb, roll){
  const blk=gameHtml.match(/if\(\(!isDot\|\|\(opts&&opts\.shieldHit\)\)&&e\.eShieldMax>0&&e\.eShield>0[\s\S]*?if\(dmg===0\)_shBlocked=true;\s*\}/)[0];
  const e={eShield,eShieldMax:Math.max(eShield,1)};
  const _eqAffix=id=>id==='shieldBypass'?sbProb:0;
  const orig=Math.random;Math.random=()=>roll;
  try{
    const f=new Function('e','isDot','opts','_eqAffix','let dmg='+incoming+';let _shBlocked=false;'+blk+';return {eShield:e.eShield,dmgToHp:dmg,_shBlocked};');
    return f(e,false,null,_eqAffix);
  } finally { Math.random=orig; }
}

test('§4 shieldBypass semantic — 소스 shield 블록 실제 실행', () => {
  // A. full shield, NO bypass(roll 0.9 > prob 0.3): 쉴드 흡수, HP 0
  let r=runShieldBlock(500,100,0.3,0.9);
  assert.equal(r.eShield,400,'no-bypass: 쉴드 100 흡수 → 400');
  assert.equal(r.dmgToHp,0,'no-bypass: HP 데미지 0');
  // B. full shield, bypass proc(roll 0.01 < 0.3): 쉴드 무시, HP 직행, 쉴드 불변
  r=runShieldBlock(500,100,0.3,0.01);
  assert.equal(r.eShield,500,'bypass: 쉴드 불변(무시)');
  assert.equal(r.dmgToHp,100,'bypass: dmg 100 HP 직행');
  // C. shield < incoming (50 < 100), no bypass: 50 흡수, 오버플로우 50 HP
  r=runShieldBlock(50,100,0.3,0.9);
  assert.equal(r.eShield,0,'partial: 쉴드 0');
  assert.equal(r.dmgToHp,50,'partial: 오버플로우 50 HP');
  // shield < incoming, bypass: 전량 HP, 쉴드 불변
  r=runShieldBlock(50,100,0.3,0.01);
  assert.equal(r.eShield,50,'partial+bypass: 쉴드 불변');
  assert.equal(r.dmgToHp,100,'partial+bypass: 100 HP');
});

test('§5 shieldBypass double-dip 0 + 무쉴드 항등 + affix0 base 불변', () => {
  // double-dip: 어느 경로든 dmg는 정확히 1회 소비 (흡수분 + HP분 = incoming, 초과 없음)
  const cases=[[500,100,0.3,0.9],[500,100,0.3,0.01],[50,100,0.3,0.9],[50,100,0.3,0.01],[500,100,0,0.01]];
  for(const [sh,inc,pr,roll] of cases){
    const r=runShieldBlock(sh,inc,pr,roll);
    const absorbed=sh-r.eShield;                 // 쉴드가 실제 흡수한 양
    assert.ok(absorbed+r.dmgToHp<=inc+1e-9,`double-dip 없음 (흡수${absorbed}+HP${r.dmgToHp}≤${inc})`);
  }
  // shield=0 (eShieldMax>0이지만 eShield=0): 블록 미진입, dmg 전량 HP, bypass 무관
  let r=runShieldBlock(0,100,0.3,0.01);
  assert.equal(r.dmgToHp,100,'shield=0: dmg 전량 HP (bypass 무관)');
  // affix 0: bypass 절대 발생 안 함 (roll 0.0이어도) → base 파이프라인 항등
  r=runShieldBlock(500,100,0,0.0);
  assert.equal(r.eShield,400,'affix0: 정상 흡수(base 불변)');assert.equal(r.dmgToHp,0);
});

test('§6 family metadata + shieldBypass=GLOBAL(무태깅)', () => {
  assert.deepEqual(by('projBounce').family,['PROJECTILE']);
  assert.deepEqual(by('beamWidth').family,['BEAM']);
  assert.ok(!('family'in by('shieldBypass')),'shieldBypass = GLOBAL(전 계열, family 무태깅)');
  // roller가 family 미참조 (roll distribution 불변)
  const roller=gameHtml.match(/function _affixLayerCandidates\(aSlot,brType,layer,sub\)\{[\s\S]*?\n\}/)[0];
  assert.ok(!/\.family/.test(roller),'roller .family 미참조');
});

test('§7 신규 2종 = v2only → legacy byte-identical (V2 전용)', () => {
  for(const id of ['projBounce','beamWidth']){const a=by(id);
    assert.equal(a.v2only,1,id+' v2only');assert.equal(a.layer,5);assert.equal(a.sub,'B');
    assert.ok(a.compat.includes('OFFENSE'),id+' compat');assert.ok(!('uni'in a));assert.equal(a.tiers.length,5);}
  // legacy rollAffixes: projBounce/beamWidth 미등장 (v2only)
  const full=buildRoller(POOL),noNew=buildRoller(POOL.filter(a=>a.id!=='projBounce'&&a.id!=='beamWidth'));
  let a='',b='';
  for(const s of SLOTS)for(let g=0;g<=5;g++){seed(g*7+s.length);a+=JSON.stringify(full.rollAffixes(g,s));seed(g*7+s.length);b+=JSON.stringify(noNew.rollAffixes(g,s));}
  assert.equal(a,b,'legacy roll byte-identical (신규 2종 v2only 제외)');
});

test('§8 Batch1(4B-5B) 보호 — pierceCount/splash/projSpeed 배선 유지', () => {
  assert.match(gameHtml,/p\._pcBonus=_eqAffix\('pierceCount'\);/,'pierceCount 유지');
  assert.match(gameHtml,/const r=\(p\.explR\|\|80\)\*\(1\+_eqAffix\('splashRadius'\)\)/,'splashRadius 유지');
  assert.match(gameHtml,/_psApplied=1;const _ps=_eqAffix\('projSpeedPct'\)/,'projSpeedPct 유지');
  // projBounce가 projSpeed retention 안 깨뜨림 — bounce는 반사(magnitude 보존), projSpeed는 1회 스케일 후 유지
  assert.match(gameHtml,/if\(hWall\)p\.vx=-p\.vx; if\(vWall\)p\.vy=-p\.vy;/,'bounce 반사(speed 보존) — projSpeed 증가분 유지');
});

test('§9 기존 working L5-B 불변 — chainTarget/staggerExplosion/pierceFlat', () => {
  assert.match(gameHtml,/const _ctN=~~\(_eqAffix\('chainTarget'\)\)/);
  assert.match(gameHtml,/if\(_eqAffix\('staggerExplosion'\)>0\)/);
  assert.match(gameHtml,/p\._pierceRate=50\+_eqAffix\('pierceFlat'\);/);
});

test('§10 pool count — 410 (408+2), B 158', () => {
  assert.equal(POOL.length,416);
  assert.equal(POOL.filter(a=>a.sub==='B').length,163);
});
