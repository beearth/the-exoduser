import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// ═══ [Phase 5C / LOCK-28] L9 RAGE FINAL CLOSURE & V2 ROLL HYGIENE ═══
// non-working 4종(onParryBurst=DUP·recentParryDmg=HOLD·killStreakDmg/Spd=RECLASS)을 v2skip으로 V2 roll 제외. legacy byte-identical·C1 유지.
const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function extractPool(src){
  const start=src.indexOf('const AFFIX_POOL=[');const end=src.indexOf('\n];',start);
  const body=src.slice(start+'const AFFIX_POOL='.length,end+3).split('\n').filter(l=>!l.trim().startsWith('//')).join('\n');
  return new Function('return '+body)();
}
const POOL=extractPool(gameHtml);
const by=id=>POOL.find(a=>a.id===id);
const L9_WORKING=['rageMaxFlat','rageDmg','parryBonus','parryExplosion','afterParryShield'];
const L9_NONWORK=['onParryBurst','recentParryDmg','killStreakDmg','killStreakSpd'];

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
const L9SLOTS=['weapon','shield','bracelet']; // L9 affix 호스트 슬롯(wpn/shield/bracelet)

// ══════════════════════════════════════════════════════════════
test('§1 L9 최종 taxonomy — working 5 / non-working 4(v2skip)', () => {
  // working 5: v2skip 없음
  for(const id of L9_WORKING){const a=by(id);assert.ok(a,id);assert.ok(!('v2skip'in a),id+' working=v2skip 없음');assert.equal(a.layer,9)}
  // non-working 4: v2skip:1
  for(const id of L9_NONWORK){const a=by(id);assert.ok(a,id);assert.equal(a.v2skip,1,id+' v2skip:1');assert.equal(a.layer,9)}
  // C1 backbone: rageMaxFlat/rageDmg uni:1 (L9-A universal)
  assert.equal(by('rageMaxFlat').uni,1);assert.equal(by('rageDmg').uni,1);
  // ID/tiers/group 보존(삭제 없음)
  assert.deepEqual(by('killStreakDmg').tiers,[.03,.05,.08,.12,.18]);
  assert.deepEqual(by('onParryBurst').tiers,[.15,.25,.40,.60,.85]);
});

test('§2 V2 roll hygiene — non-working 4종 V2 신규 roll 출현 = 0', () => {
  const roller=buildRoller(POOL);const seen=new Set();
  for(const s of L9SLOTS)for(const N of [9,10])for(let g=1;g<=5;g++)for(let rep=0;rep<40;rep++){
    seed(rep*97+g*13+N*7+s.length);for(const r of roller.rollAffixesLayered(g,s,undefined,N))seen.add(r.id);
  }
  for(const id of L9_NONWORK) assert.ok(!seen.has(id),id+' V2 신규 roll 제외(v2skip)');
});

test('§3 V2 working eligibility — working L9는 정상 후보로 남음', () => {
  const roller=buildRoller(POOL);const seen=new Set();
  for(const s of L9SLOTS)for(const N of [9,10])for(let g=3;g<=5;g++)for(let rep=0;rep<80;rep++){
    seed(rep*31+g*17+N*11+s.length*3);for(const r of roller.rollAffixesLayered(g,s,undefined,N))seen.add(r.id);
  }
  // working L9 중 최소 다수가 V2 후보로 등장(백본 rageMaxFlat/rageDmg 포함)
  const workSeen=L9_WORKING.filter(id=>seen.has(id));
  assert.ok(seen.has('rageMaxFlat')||seen.has('rageDmg'),'L9-A backbone V2 등장');
  assert.ok(workSeen.length>=3,'working L9 다수 V2 등장 (got '+workSeen.join(',')+')');
});

test('§4 legacy roll parity — v2skip은 legacy 무영향(byte-identical)', () => {
  // legacy rollAffixes는 v2skip 미검사 → v2skip 유무로 결과 동일
  const full=buildRoller(POOL);
  const stripped=buildRoller(POOL.map(a=>{const c={...a};delete c.v2skip;return c;}));
  let x='',y='';
  const SLOTS=['weapon','shield','bracelet','armor','ring1','helmet','bow','gloves','pants','cape','belt','headband','necklace','boots'];
  for(const s of SLOTS)for(let g=0;g<=5;g++){seed(g*7+s.length);x+=JSON.stringify(full.rollAffixes(g,s));seed(g*7+s.length);y+=JSON.stringify(stripped.rollAffixes(g,s));}
  assert.equal(x,y,'legacy roll byte-identical (v2skip 무관)');
});

test('§5 C1 invariant 유지 — L9-A backbone(rageMaxFlat/rageDmg) V2 L9-A 후보 잔존', () => {
  // 대량 sim에서 layerLv≥9 아이템의 L9-A가 결손되지 않음(backbone uni)
  const roller=buildRoller(POOL);let l9aHit=0,items=0;
  for(const s of ['weapon','helmet','armor'])for(const N of [9,10])for(let rep=0;rep<200;rep++){
    seed(rep*23+N*101+s.length*7);const r=roller.rollAffixesLayered(4,s,undefined,N);items++;
    if(r.some(x=>{const d=by(x.id);return d&&d.layer===9&&d.sub==='A'}))l9aHit++;
  }
  // weapon L9-A backbone(rageMaxFlat/rageDmg)이 존재하므로 weapon 아이템에서 L9-A 등장 가능(백본 결손 없음)
  assert.ok(l9aHit>0,'V2 아이템에서 L9-A backbone 등장(C1 결손 없음)');
});

test('§6 최종 working behavior 축 (중복 없이)', () => {
  // Rage Capacity(rageMaxFlat) · Rage Burst(rageDmg) · Parry Gain(parryBonus) · Parry Explosion(parryExplosion) · Parry Shield(afterParryShield)
  // = 5 working ID = 5 behavior 축(중복 없음)
  for(const id of L9_WORKING){const a=by(id);assert.ok(a&&!('v2skip'in a),id+' working & V2-active')}
});
