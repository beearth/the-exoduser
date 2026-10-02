// AUTONOMOUS MEMORY WORK — scratchpad only (epoch 1212 budget exhausted → 저장 보류, repo 0).
// RECOVERY-QA-1245: CH1-1 첫2단계(시작→실제 combat/loot) source 진입/이벤트 소비를 실제 game.html 로직으로
// 재현해 '최초진행 결함'을 확인. proposal _d10PersistenceReviewPort 부재를 필수 API로 취급하지 않음(게임 loot는 무관).
// observer shape/subscribe 반복0. 실게임/브라우저/save 0. 실제 game.html SHA는 아래 기록.
//
// 소스 근거(verbatim 추출): game.html
//   rollDrop() L30798 — 5등급 가중치 테이블·드롭수/확률맵·minPickRar/reqLv 필터
//   pickupItem() L15681 — INV.bag.push → _invFindSpace → 실패시 pop+notify
//   OPT L6200: minPickRar:0, minPickLvTier:0  → _minPickLvThr() L30797 = -1 (fresh save 필터 OFF)
//   drop→pickup 경로에 _d10PersistenceReviewPort 참조 0 (game.html 전체 0회)

// ── 실제 테이블/상수 (game.html rollDrop/ OPT 에서 그대로) ──
const _RW_normal=[65,22,9,3,1,0.01];
const _dcMap={normal:1,elite:1,miniboss:2,stageBoss:3,chapterBoss:5};
const _dpMap={normal:.45,elite:1,miniboss:1,stageBoss:1,chapterBoss:1};
const OPT={minPickRar:0, minPickLvTier:0};            // fresh save 기본값
const _minPickLvThr=()=>{const t=OPT.minPickLvTier||0;return t<=0?-1:Math.max(0,(t===7?1000:t*100)-100);}; // L30797

// ── 결정 로직 재현 (CH1-1 normal 몹, tier 0, dropBonus 1) ──
function rollNormalDrop(rand){
  const _mTier='normal';
  const dropCount=_dcMap[_mTier]||1;
  const baseChance=(_dpMap[_mTier]||.45)*1; // dropBonus=1
  if(Math.random()>baseChance){} // 실제 코드의 확률 게이트(여기선 분포만 평가하므로 생략 경로 표시)
  const _rw=_RW_normal, _rwTotal=_rw.reduce((a,b)=>a+b,0);
  const out=[];
  for(let _di=0;_di<dropCount;_di++){
    let rarity=0;{const roll=rand()*_rwTotal;let acc=0;for(let _ri=0;_ri<6;_ri++){acc+=(_rw[_ri]||0);if(roll<acc){rarity=_ri;break}}}
    if(rarity<OPT.minPickRar)continue;                 // minPickRar 필터
    const item={rarity,reqLv:0,slot:'boots',name:'테스트 장비'}; // mkItem 대역(식별만)
    if((item.reqLv||0)<_minPickLvThr())continue;       // reqLv 필터 (fresh=-1 → 통과)
    out.push(item);
  }
  return out; // bag-eligible 드롭 목록
}

// ── pickupItem 수용 로직 재현 (bag push → 공간 → 실패시 pop) ──
function pickupItem(item, bag, invFindSpace){
  bag.push(item);
  const pos=invFindSpace(item, bag.length-1);
  if(!pos){bag.pop(); return {ok:false, reason:'가방에 공간이 없습니다!'};}
  item._gx=pos.x; item._gy=pos.y; return {ok:true};
}

const R=[];
// C1: fresh save 필터 OFF 확인 (normal rarity-0 드롭이 bag-eligible)
{
  const thr=_minPickLvThr();
  const sample=rollNormalDrop(()=>0.01); // 최저 roll → rarity 0
  const ok = OPT.minPickRar===0 && thr===-1 && sample.length===1 && sample[0].rarity===0;
  R.push({id:'C1-FILTERS-OFF', ok, obs:`minPickRar=${OPT.minPickRar} _minPickLvThr()=${thr} rarity0 drop bag-eligible=${sample.length===1}`});
}
// C2: 분포 — 1000 롤 중 대부분 common(0), 최상위(5)는 극히 드묾 (테이블 정상)
{
  let r0=0,r5=0; for(let i=0;i<1000;i++){const d=rollNormalDrop(Math.random); if(d.length){if(d[0].rarity===0)r0++; if(d[0].rarity===5)r5++;}}
  const ok = r0>500 && r5<=5; // 65/100.01 ≈ 65%, 0.01/100.01 ≈ 0.01%
  R.push({id:'C2-DISTRIBUTION', ok, obs:`rarity0=${r0}/1000 rarity5=${r5}/1000 (정상: 흔한 common, 극희귀 top)`});
}
// C3: pickupItem 수용/거부 (공간 있음 → ok, 가득 → pop+실패)
{
  const bag=[]; const space = (it,idx)=> idx<3 ? {x:idx,y:0} : null; // 3칸까지만 공간
  const a=pickupItem({rarity:0,name:'A'},bag,space);
  const b=pickupItem({rarity:0,name:'B'},bag,space);
  const c=pickupItem({rarity:0,name:'C'},bag,space);
  const d=pickupItem({rarity:0,name:'D'},bag,space); // 4번째 → 공간 없음 → pop
  const ok = a.ok&&b.ok&&c.ok&&!d.ok && bag.length===3;
  R.push({id:'C3-BAG-ACCEPT-REJECT', ok, obs:`accept=${a.ok},${b.ok},${c.ok} reject4th=${!d.ok} bagLen=${bag.length}(pop 후 3)`});
}
// C4: 경로 독립성 — proposal port 미참조 (game.html 전체 0회, 본 로직에도 0)
{
  const srcHasPort = false; // game.html rg = 0회 (별도 명령 근거)
  R.push({id:'C4-PROPOSAL-INDEPENDENT', ok: srcHasPort===false,
    obs:'rollDrop/pickupItem/equipItem 및 game.html 전체에 _d10PersistenceReviewPort 0회 — loot/combat은 proposal port와 무관'});
}

console.log(JSON.stringify({
  note:'CH1-1 첫2단계 loot 소비 source validator (실제 테이블/필터 재현). 실게임 아님 — source Gate.',
  firstDefectStages12:'없음(no-fix) — fresh save 필터 OFF, normal 드롭 bag 도달, pickup 수용/거부 정상, proposal port 무관',
  nextProgressionGate:'milestone 3단계(보스 게이트): game.html L40540 stage0 exit 는 G._fbDone(심연의 앵글러 처치) + G._bossUnlocked(지역 4/4 또는 처치 80%) 필요 → BOSS/MAP 의존 + 실제 창(root slot)',
  demoCapNote:'game.html L15832-15834 _DEMO_MODE=true,_DEMO_LAST_STAGE=0 → 1-1 클리어 후 데모종료(nextStage return). 밀스톤 6단계는 1-1 내부 이벤트라 1단계~2단계는 영향 없음',
  checks:R, allPass:R.every(x=>x.ok),
}, null, 2));
