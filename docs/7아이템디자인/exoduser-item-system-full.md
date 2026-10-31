> 2026-10-17 ENGINE 현행: callback **12/25·미13**. play_time은 el_mul 바로 다음에 동일 Services self의 arity0 Callable로 등록했다. owner 첫 격리 공개 API 검수는 인수됐으며 자연 clock·실게임 인수는 미확인이다. D9는 직전 공통 소스 인수이며, 이번 main/I/R 소스 정렬은 아래 통합 정본과 단위 receipt의 실제 HEAD·tree를 기준으로 확인한다. V12 후보는 소스 인수·첫 FAIL·별도 보완 한정성공으로 구분하며 제품 copy·World hook은 수행하지 않았다. 아래 이전 단계 숫자·원검수 결과는 당시 이력으로 보존한다. 실제 local/remote commit 상태는 단위 receipt를 따른다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

## 현재 mkItem source / Native 시작 아이템 — 2026-10-14

| 계약 | canonical / Native 적용 |
|---|---|
| 적용 범위 | 원 mkItem16405..16673/defaultItems16675..77/newrun64425..30 중tier0/common0·advanced1 시작아이템25. 전설/유니크/상위tier 전체생성의 완료를뜻하지않음 |
| implicit | affixes 생성뒤 IMPLICIT_TABLE 사용, bracelet은 bracelet_<brType>, _implicitVal=+iv.toFixed(2) 모든unit동일. 현재source를STEP3 구형계획의val절삭/소수3자리로교체하지않음 |
| aSlot mapping | weapon→wpn, bow→xbow, helmet→helm, shield→shield, armor→armor, boots→boots, gloves→gloves, pants→pants, necklace→neck, ring1/ring2→ring, cape→cloak, bracelet→bracelet, headband→headband. headband2는원headband재귀생성뒤slot만변경 |
| affix count source | [0,2,3,5,6,7]; 이Nativefactory지원caller는rarity0/1만. STEP3 계획의 [0,1,2,3,4]와구분 |
| 실제 Main 설치 | originalRNG/time→25requests/25items/26functionentries→sameitem15equip+10bag. realRNG913관측/원UID·time25/level70, 재호출시추가RNG0 |
| 현재 파생 | actualINV/currentstatprovider설치완료; HP/MP/ST/fullapplyStats 파생은아직미설치 |

아래 STEP3 교체예시는 과거설계이며 현재원source/Nativefactory에적용하는패치가아니다. 최신원함수표는 FDG_GODOT_PORT_STARTER_ITEM_FACTORY_SOURCE_FIRST_20261013.md, actual Main consumer는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md다.

# EXODUSER — 아이템 시스템 완전 구현 프롬프트

## 2026-10-20 Godot P2-006a — 월드 장비 표시 부분 이식

| 항목 | 원본 game.html 행 | Native 값·경계 |
|---|---|---|
| 스킨 | 27790–27795, 27857–27881 | uniqueArt _cut.png → 기본 컷아웃 → 속성 스킨. 유골 bone_{part}.png는 속성 접미사 없음. 누락 변형 phys 폴백 |
| 빔 | 27817–27855, 52582–52588 | 원본 2장, 2열 정사각 셀, layerLv 1~10 우선·rarity [0,2,3,4,5,6]. 60×160, 180ms 프레임, ADD 합성, alpha .46+sin(now/400+x)×.05 |
| 마스크·바운스 | 27835–27837, 52485 | RGB max≤24 alpha0, 24~72 선형 alpha. y=sin(now/300+x)×3. 스킨 34px |
| P2-006b 샘플링 | 51736, 52579–52594 | 원본 `imageSmoothingEnabled=false`에 맞춰 native_world_drops의 texture_filter를 NEAREST로 명시. 빔 자식도 상속. 크기·색·등급표·수명 수치 변경 없음 |
| 라벨·수명 | 52579–52594, 41632–41642 | 장비 분기에는 이름 라벨·TTL 없음. 임의 추가하지 않음. mat 수명/슬라임 생성은 별도 미이식 |
| 드랍·획득음 | 16266–16271 | rarity 0~1 common·2~3 rare·4~5 legend, 45ms 게이트. 획득음 6종. 원본 샘플 vol .5, pitch 편차 .04/.05 및 .92~1.08 후단 변동 |
| 오디오 위치 | 12372–12385 | 드랍 1200px 이내 감쇠0, 이후800px 선형 감쇠를 제곱. pan=clamp(dx/600,−.7,.7). 획득음 비공간. 실제 OPT.sfxVol 적용 |
| 원본 파일 | 자산 경로는 manifest 참조 | 189개, 28,164,464 bytes, SHA-256 일치. 빔2·컷아웃14·스킨137·고유 누끼27·SFX9. AI 생성/원본 수정 없음 |
| 검수 한계 | P2-006a 보고서 참조 | 그림자 blur 근사·유골 습득 미이식. 일반 장비 자연 드랍 렌더 관측, 네이티브 수동 키 입력 검수는 권한 거부로 미확인 |

에셋별 원경로/복사경로/bytes/SHA-256: [P2-006a_ASSETS.json](../engine/orders/reports/P2-006a_ASSETS.json). 상세 범위·실행·복구점: [P2-006a_REPORT.md](../engine/orders/reports/P2-006a_REPORT.md).

P2-006b 후속: 121 물리틱만으로 death_blood의 종료를 보장하지 않는다. 원본 54581–54582의 16프레임×frameTime4는 렌더 프레임 기준이다. 실제 transient 카운트가 0인 뒤 자연 일반 드랍·등급0~5 원배율 좌표 크롭을 비교했다. 라벨은 원본에도 없으므로 추가하지 않는다. 밝기·그림자·전체 장면 동등성은 RETOUCH이며 [P2-006b 보고서](../engine/orders/reports/P2-006b_REPORT.md)를 따른다.


## 2026-10-20 Godot P2-006a — 월드 장비 표시 부분 이식

| 항목 | 원본 game.html 행 | Native 값·경계 |
|---|---|---|
| 스킨 | 27790–27795, 27857–27881 | uniqueArt _cut.png → 기본 컷아웃 → 속성 스킨. 유골 bone_{part}.png는 속성 접미사 없음. 누락 변형 phys 폴백 |
| 빔 | 27817–27855, 52582–52588 | 원본 2장, 2열 정사각 셀, layerLv 1~10 우선·rarity [0,2,3,4,5,6]. 60×160, 180ms 프레임, ADD 합성, alpha .46+sin(now/400+x)×.05 |
| 마스크·바운스 | 27835–27837, 52485 | RGB max≤24 alpha0, 24~72 선형 alpha. y=sin(now/300+x)×3. 스킨 34px |
| 라벨·수명 | 52579–52594, 41632–41642 | 장비 분기에는 이름 라벨·TTL 없음. 임의 추가하지 않음. mat 수명/슬라임 생성은 별도 미이식 |
| 드랍·획득음 | 16266–16271 | rarity 0~1 common·2~3 rare·4~5 legend, 45ms 게이트. 획득음 6종. 원본 샘플 vol .5, pitch 편차 .04/.05 및 .92~1.08 후단 변동 |
| 오디오 위치 | 12372–12385 | 드랍 1200px 이내 감쇠0, 이후800px 선형 감쇠를 제곱. pan=clamp(dx/600,−.7,.7). 획득음 비공간. 실제 OPT.sfxVol 적용 |
| 원본 파일 | 자산 경로는 manifest 참조 | 189개, 28,164,464 bytes, SHA-256 일치. 빔2·컷아웃14·스킨137·고유 누끼27·SFX9. AI 생성/원본 수정 없음 |
| 검수 한계 | P2-006a 보고서 참조 | 그림자 blur 근사·유골 습득 미이식. 일반 장비 자연 드랍 렌더 관측, 네이티브 수동 키 입력 검수는 권한 거부로 미확인 |

에셋별 원경로/복사경로/bytes/SHA-256: [P2-006a_ASSETS.json](../engine/orders/reports/P2-006a_ASSETS.json). 상세 범위·실행·복구점: [P2-006a_REPORT.md](../engine/orders/reports/P2-006a_REPORT.md).


> **2026-10-10 명칭 변경: 보석/결정 → 유물 (코드 식별자 crystal*·세이브 키 crystalBag/crystals 유지).**

> **2026-09-10 마법 공격 2배:** `pMagicMul(forAttack=true)=_passDmgSum('magic')×(1+_uHelmMagic)×2`. 아래 공식의 `pMagicMul()`에 이미2배가 포함되므로 스킬 계수·후속 폭발·DOT에 다시 곱하지 않는다. `pMagicMul(false)`는 Q패링 장비스케일 전용으로 기존 값을 유지한다. 계수 표의 숫자는 이 공통 배율을 곱하기 전 값이다. [상세 계약](../14밸런스+수치테이블/MAGIC_ATTACK_DAMAGE_20260910.md).

## game.html 직접 패치 / 클코(Claude Code) 투입용
> 기존 코드 분석 완료 기반 — 호환성 유지하며 전면 업그레이드

---

## ⚠️ 수정 금지 항목 (절대 건드리지 말 것)
```
ELC[], ETYPE_COL[], _tseed(tx,ty)
게임 루프 내 new / {} 리터럴 / splice / filter / Date.now()
```

---

## 📋 작업 순서 (이 순서 반드시 지킬 것)

```
STEP 1. AFFIX_POOL 교체  (기존 PREFIXES/SUFFIXES 대체)
STEP 2. IMPLICIT_TABLE 추가
STEP 3. LEGENDARY_SPECIAL 추가
STEP 4. mkItem() 업그레이드 (어픽스 배열화)
STEP 5. buildItemName() 추가
STEP 6. itemDispName() 업그레이드
STEP 7. spawnDrop(e) 통합 드롭 함수
STEP 8. applyAffixStats() — 장착 시 스탯 반영
STEP 9. removeAffixStats() — 탈착 시 스탯 제거
STEP 10. renderAffixTooltip() — 툴팁 어픽스 표시
```

---

## STEP 1. 기존 PREFIXES/SUFFIXES → AFFIX_POOL 교체

**위치**: `game.html` 의 `const PREFIXES=[` 라인 (약 19925번 줄) 찾아서 아래로 `const SUFFIXES=[...]` `const _AFF_LBL=` `function _affixStr` 까지 전부 아래 코드로 교체

```javascript
// ═══════════════════════════════════════
//  AFFIX SYSTEM v2.0
//  접두/접미/임플리싯/전설특수 완전판
// ═══════════════════════════════════════

// 슬롯 코드 → SLOT_NAMES 배열 인덱스 매핑용 별칭
// weapon=0 shield=1 boots=2 armor=3 helmet=4 bow=5
// gloves=6 pants=7 belt=8 necklace=9 ring1=10 ring2=11 cape=12 bracelet=13 headband=14
const _SL = {
  wpn:['weapon','bow'],
  arm:['armor'],
  hlm:['helmet'],
  glv:['gloves'],
  pnt:['pants'],
  bts:['boots'],
  clk:['cape'],
  rng:['ring1','ring2'],
  nck:['necklace'],
  shd:['shield'],
  acc:['ring1','ring2','necklace'],
  any:['weapon','bow','armor','helmet','gloves','pants','boots','cape','ring1','ring2','necklace','shield'],
};

// ─── 장비 베이스 스탯 (주요) ───
// weapon:   atk=20+tier*10 (wtype별 atkMul 적용)
// bow:      atk=3+tier*2 (btype별 atkMul 적용)
// helmet:   atk=20+tier*10, beamDmg=1.5+tier*1.2, eDef=2+tier*2 → magicRef() 기반
// ring1/2:  critRate T0~T4 = 1/2/3/4/5% + 전용 어픽스 2개 (critDmg/atkSpd/armorPen/elemFocus/killSlayer/parryBonus)
// necklace: critRate T0~T4 = 2/4/6/8/10% + dmgBonus T0~T4 = 10/20/30/40/50% + 전용 어픽스 2개 (critDmg/maxHP/shield/elemFocus/parryBonus)
// bracelet: def=1+tier, eDef=1+tier, bonusHp=5+tier*5
// headband: eDef=2+tier*2, mpRegen=1+tier
// 팔찌 타입: demon(부활력/부활쿨), life(HP/리젠/회복력)

// ─── 임플리싯 테이블 (슬롯 고정 1개) ───
// stat: game.html 내 P. 또는 item. 에 적용될 필드명
// val: [min, max] 롤 범위
const IMPLICIT_TABLE = {
  weapon:   {ko:'공격력 +X%',      stat:'_iAtkPct',  val:[5,15]},
  bow:      {ko:'관통 확률 +X%',   stat:'_iPierce',   val:[5,15]},
  shield:   {ko:'방어율 +X%',      stat:'_iBlockPct', val:[3,8]},
  armor:    {ko:'물리 피해감소 +X%',stat:'_iPhysDR',  val:[3,8]},
  helmet:   {ko:'최대 HP +X',      stat:'_iMaxHP',    val:[10,30]},
  gloves:   {ko:'공격속도 +X%',    stat:'_iAtkSpd',   val:[3,8]},
  pants:    {ko:'상태이상 저항 +X%',stat:'_iStsRes',  val:[5,12]},
  boots:    {ko:'이동속도 +X%',    stat:'_iMovSpd',   val:[3,8]},
  ring1:    {ko:'원소 저항 +X%',   stat:'_iElemRes',  val:[8,15]},
  ring2:    {ko:'원소 저항 +X%',   stat:'_iElemRes',  val:[8,15]},
  necklace: {ko:'최대 HP +X%',     stat:'_iMaxHPPct', val:[5,12]},
  cape:     {ko:'회피 쿨다운 -X%', stat:'_iDashCd',   val:[5,12]},
  belt:     {ko:'물약 쿨다운 -X%',  stat:'_iBeltPot', val:[3,8]},
  bracelet_demon:{ko:'부활력 +X%',  stat:'_iRevPow',  val:[5,12]},
  bracelet_life:{ko:'최대 HP +X%', stat:'_iLifeHPPct',val:[5,12]},
  headband: {ko:'마법 데미지 +X%', stat:'_iMagDmg',   val:[5,12]},
  ossuary:  {ko:'전대 위력 +X%',   stat:'_iAncPow',   val:[5,15]},
};
// 2026-10-28 코드 감사: 위 IMPLICIT_TABLE은 game.html:15195 현행과 일치시킴 (bow stat 철자 _iPierce, 팔찌 2종·headband·ossuary 추가).
// 이 아래 AFFIX_POOL 스니펫은 2026-03 3티어 시절 과거 코드다. 현행 값은 슬롯별_어픽스_풀.md G절.
// _eqImplicit()로 읽히는 implicit: _iAtkSpd·_iMaxHP·_iMaxHPPct·_iMovSpd·_iRevPow·_iLifeHPPct·_iMagDmg·_iAncPow.
// 읽는 곳이 없는 implicit(롤·툴팁만): _iAtkPct·_iPierce·_iBlockPct·_iPhysDR·_iStsRes·_iElemRes·_iDashCd·_iBeltPot.
// 유골함 implicit은 mkItem 유골함 분기에서 _implicitVal=10 고정.

// ─── 어픽스 풀 (PREFIX=0, SUFFIX=1) ───
// id, type, ko(표시명), stat(적용 필드), tiers[T1,T2,T3],
// unit('pct'/%로표시 | 'val'/정수 | 'prob'/확률% | 'frame'/프레임),
// slots(붙을 수 있는 슬롯 코드 배열),
// group(같은 그룹 중복 방지), weight(출현 가중치)
const AFFIX_POOL = [
  // ── PREFIX: 공격 DoT ──
  {id:'poisonDot', type:0, ko:'맹독의',  stat:'_aPoisonDps', tiers:[8,14,22],   unit:'val', slots:['wpn'],          group:'poisonfx', weight:100},
  {id:'fireDot',   type:0, ko:'불꽃의',  stat:'_aFireDps',   tiers:[10,17,26],  unit:'val', slots:['wpn'],          group:'firefx',   weight:100},
  {id:'iceDot',    type:0, ko:'냉기의',  stat:'_aIceDps',    tiers:[7,12,18],   unit:'val', slots:['wpn'],          group:'icefx',    weight:90},
  {id:'lightChain',type:0, ko:'번개의',  stat:'_aLightDmg',  tiers:[13,22,35],  unit:'val', slots:['wpn'],          group:'lightfx',  weight:85},
  {id:'darkCurse', type:0, ko:'암흑의',  stat:'_aDarkProb',  tiers:[0.20,0.35,0.55],unit:'prob',slots:['wpn'],      group:'darkfx',   weight:70},

  // ── PREFIX: 공격 보조 ──
  {id:'lifeSteal', type:0, ko:'피흡의',  stat:'_aLeech',     tiers:[0.04,0.07,0.12],unit:'pct', slots:['wpn','rng'], group:'leech',   weight:80},
  {id:'armorPen',  type:0, ko:'관통의',  stat:'_aArmPen',    tiers:[0.08,0.14,0.22],unit:'pct', slots:['wpn'],       group:'pen',     weight:75},
  {id:'critChance',type:0, ko:'광폭의',  stat:'_aCrit',      tiers:[0.06,0.10,0.16],unit:'pct', slots:['wpn','rng'], group:'crit',    weight:90},
  {id:'critDmg',   type:0, ko:'처형의',  stat:'_aCritDmg',   tiers:[0.25,0.40,0.65],unit:'pct', slots:['wpn'],       group:'critdmg', weight:65},
  {id:'staggerBns',type:0, ko:'파쇄의',  stat:'_aStagger',   tiers:[8,14,22],   unit:'val', slots:['wpn'],          group:'stagger',  weight:70},
  {id:'chainTarget',type:0, ko:'연쇄의', stat:'_aChain',     tiers:[1,1,2,3,4], unit:'cnt', slots:['xbow'],         group:'chain',    weight:60},
  {id:'killSlayer',type:0, ko:'학살의',  stat:'_aKillDmg',   tiers:[0.15,0.25,0.40],unit:'pct', slots:['wpn'],      group:'kill',     weight:75},
  {id:'critExpl',  type:0, ko:'폭발의',  stat:'_aCritExpl',  tiers:[0.30,0.60,1.00],unit:'pct', slots:['wpn'],      group:'critexpl', weight:55},

  // ── PREFIX: 전투 스타일 ──
  {id:'atkSpeed',  type:0, ko:'쾌속의',  stat:'_aAtkSpd',    tiers:[0.06,0.10,0.16],unit:'pct', slots:['wpn','glv'],group:'aspd',     weight:85},
  {id:'parryBonus',type:0, ko:'패리의',  stat:'_aParry',     tiers:[.12,.20,.35,.55,.75],unit:'pct',slots:['wpn'],  group:'parry',    weight:65},
  {id:'comboBoost',type:0, ko:'콤보의',  stat:'_aCombo',     tiers:[0.20,0.35,0.55],unit:'pct', slots:['wpn'],       group:'combo',    weight:60},
  {id:'dashBoost', type:0, ko:'돌진의',  stat:'_aDash',      tiers:[0.25,0.40,0.65],unit:'pct', slots:['wpn','bts'], group:'dash',    weight:55},
  {id:'skillBoost',type:0, ko:'궁극의',  stat:'_aSkill',     tiers:[0.15,0.25,0.40],unit:'pct', slots:['wpn'],       group:'skill',   weight:65},
  {id:'cooldownRed',  type:0, ko:'집중력의',stat:'_aCdRed',     tiers:[0.02,0.03,0.05,0.07,0.10],unit:'pct', slots:['wpn'], group:'cd',      weight:70},
  {id:'elemFocus', type:0, ko:'원소집중의',stat:'_aElemFcs', tiers:[0.12,0.20,0.32],unit:'pct', slots:['wpn','nck'], group:'elemfcs', weight:70},

  // ── PREFIX: 능력치 ──
  {id:'maxHPFlat', type:0, ko:'강인의',  stat:'_aMaxHP',     tiers:[100,200,300],  unit:'val', slots:['방어구'],group:'hp',     weight:90},
  {id:'shieldFlat',type:0, ko:'수호의',  stat:'_aShield',    tiers:[120,200,400,600,840],  unit:'val', slots:['장신구'],group:'shd',    weight:80},
  {id:'maxHPPct',  type:0, ko:'활력의',  stat:'_aMaxHPPct',  tiers:[0.08,0.14,0.22],unit:'pct', slots:['arm','nck'], group:'hpp',   weight:80},
  {id:'movSpd',    type:0, ko:'신속의',  stat:'_aMovSpd',    tiers:[0.05,0.09,0.14],unit:'pct', slots:['bts','clk'], group:'mspd',  weight:85},
  {id:'killHeal',  type:0, ko:'회복의',  stat:'_aKillHeal',  tiers:[8,15,25],   unit:'val', slots:['arm','rng'],    group:'kheal',  weight:75},

  // ── SUFFIX: 원소 저항 ──
  {id:'fireRes',   type:1, ko:'화염수호',stat:'_aFireRes',   tiers:[0.12,0.20,0.32],unit:'pct', slots:['arm','rng','nck'],group:'rfir', weight:100},
  {id:'iceRes',    type:1, ko:'빙결수호',stat:'_aIceRes',    tiers:[0.12,0.20,0.32],unit:'pct', slots:['arm','rng','nck'],group:'rice', weight:100},
  {id:'lightRes',  type:1, ko:'암전수호',stat:'_aLightRes',  tiers:[0.12,0.20,0.32],unit:'pct', slots:['arm','rng','nck'],group:'rlit', weight:100},
  {id:'darkRes',   type:1, ko:'암흑수호',stat:'_aDarkRes',   tiers:[0.12,0.20,0.32],unit:'pct', slots:['arm','rng','nck'],group:'rdark',weight:90},
  {id:'poisonRes', type:1, ko:'독수호',  stat:'_aPoisonRes', tiers:[0.10,0.18,0.28],unit:'pct', slots:['arm','rng','nck'],group:'rpoi', weight:90},
  {id:'allRes',    type:1, ko:'전원소수호',stat:'_aAllRes',  tiers:[0.05,0.09,0.15],unit:'pct', slots:['nck'],            group:'rall', weight:50},

  // ── SUFFIX: 물리 방어 ──
  {id:'physDR',    type:1, ko:'강철의',  stat:'_aPhysDR',    tiers:[0.06,0.10,0.16],unit:'pct', slots:['arm','shd'],      group:'pdr',  weight:80},
  {id:'reflect',   type:1, ko:'반사의',  stat:'_aReflect',   tiers:[0.05,0.09,0.15],unit:'pct', slots:['arm','shd','rng'],group:'refl', weight:70},
  {id:'thorns',    type:1, ko:'가시의',  stat:'_aThorns',    tiers:[4,8,14],    unit:'val', slots:['arm','glv'],           group:'thorn',weight:65},
  {id:'barrier',   type:1, ko:'흡수의',  stat:'_aBarrier',   tiers:[15,28,45],  unit:'val', slots:['arm','hlm'],           group:'bar',  weight:60},
  {id:'ccRes',     type:1, ko:'인내의',  stat:'_aCCRes',     tiers:[0.12,0.20,0.32],unit:'pct', slots:['hlm','pnt'],       group:'ccr',  weight:70},
  {id:'iframeBns', type:1, ko:'회피의',  stat:'_aIframe',    tiers:[2,4,6],     unit:'frame',slots:['clk','bts'],          group:'ifr',  weight:55},

  // ── SUFFIX: 조건부 트리거 ──
  {id:'crisisDmg', type:1, ko:'위기의',  stat:'_aCrisis',    tiers:[0.25,0.40,0.65],unit:'pct', slots:['arm','nck'],      group:'cris', weight:45},
  {id:'counter',   type:1, ko:'피격반격의',stat:'_aCounter', tiers:[0.15,0.25,0.40],unit:'prob',slots:['arm','shd'],      group:'cnt',  weight:40},
  {id:'parryExpl', type:1, ko:'패링폭발의',stat:'_aParryExpl',tiers:[0.40,0.70,1.10],unit:'pct',slots:['wpn','shd'],      group:'pexp', weight:35},
  {id:'staggerExpl',type:1,ko:'스태거폭발의',stat:'_aStgExpl',tiers:[0.30,0.50,0.80],unit:'pct',slots:['wpn'],           group:'sexp', weight:35},
  {id:'elemConv',  type:1, ko:'원소전환의',stat:'_aElemConv',tiers:[0.20,0.35,0.55],unit:'prob',slots:['wpn','nck'],      group:'elcv', weight:40},
  {id:'cleanSts',  type:1, ko:'정화의',  stat:'_aClean',     tiers:[1,1,2],     unit:'val', slots:['hlm','pnt'],           group:'clean',weight:50},
  {id:'lastStand', type:1, ko:'불굴의',  stat:'_aLastStand', tiers:[0,0,1],     unit:'val', slots:['arm'],                group:'lst',  weight:20},  // 영웅+
  {id:'revive',    type:1, ko:'부활의',  stat:'_aRevive',    tiers:[0,0,0.30],  unit:'pct', slots:['arm'],                group:'rev',  weight:10},  // 전설만

  // ── SUFFIX: 유틸리티 ──
  {id:'dropRate',  type:1, ko:'약탈의',  stat:'_aDropRate',  tiers:[0.12,0.20,0.32],unit:'pct', slots:['bts','clk'],      group:'drop', weight:70},
  {id:'expBonus',  type:1, ko:'경험의',  stat:'_aExpBonus',  tiers:[0.10,0.18,0.28],unit:'pct', slots:['hlm','nck'],      group:'exp',  weight:65},
  {id:'goldBonus', type:1, ko:'골드의',  stat:'_aGold',      tiers:[0.15,0.25,0.40],unit:'pct', slots:['bts','rng'],      group:'gold', weight:70},
  {id:'potionPow', type:1, ko:'포션강화의',stat:'_aPotPow',  tiers:[0.20,0.35,0.55],unit:'pct', slots:['pnt'],            group:'pot',  weight:60},
  {id:'extraDodge',type:1, ko:'스태미나의',stat:'_aExDodge', tiers:[1,1,2],     unit:'val', slots:['bts','pnt'],           group:'dodg', weight:55},
  {id:'stRegen',   type:1, ko:'회복의',  stat:'stRegen',     tiers:[0.06,0.10,0.18],unit:'pct', slots:['arm','rng','nck'],group:'sreg', weight:80},
  {id:'dpRegen',   type:1, ko:'마력의',  stat:'mpRegen',     tiers:[0.06,0.10,0.18],unit:'pct', slots:['hlm','nck'],      group:'dreg', weight:75},
  // ── 크리티컬 데미지 어픽스 2종 (행운의+극대화의 → 반지 최대50%, 목걸이 최대100%) ──
  // 5티어, tierW:[40,30,20,8,2] 극악 편향, 200렙당 maxTier +1
  {id:'critDmgA',type:0, ko:'행운의',  stat:'critDmgA',tiers:[.05,.10,.15,.20,.25],unit:'pct', slots:['ring'],group:'cdmgA',weight:60,tierW:[40,30,20,8,2]},
  {id:'critDmgB',type:1, ko:'극대화의',stat:'critDmgB',tiers:[.05,.10,.15,.20,.25],unit:'pct', slots:['ring'],group:'cdmgB',weight:60,tierW:[40,30,20,8,2]},
  {id:'critDmgA',type:0, ko:'행운의',  stat:'critDmgA',tiers:[.10,.20,.30,.40,.50],unit:'pct', slots:['neck'],group:'cdmgA',weight:60,tierW:[40,30,20,8,2]},
  {id:'critDmgB',type:1, ko:'극대화의',stat:'critDmgB',tiers:[.10,.20,.30,.40,.50],unit:'pct', slots:['neck'],group:'cdmgB',weight:60,tierW:[40,30,20,8,2]},
  // ── 플랫 ATK 어픽스 3종 (극악 득템, skewRoll:3 = Math.random()^3 편향) ──
  {id:'sharpAtk',  type:0, ko:'예리한',  stat:'flatAtk',     tiers:[50,170,330],    unit:'val', slots:['wpn','hlm'],      group:'satk', weight:25, skewRoll:3},
  {id:'brutalAtk', type:0, ko:'맹렬한',  stat:'flatAtk',     tiers:[50,170,330],    unit:'val', slots:['wpn','hlm'],      group:'batk', weight:20, skewRoll:3},
  {id:'ruinAtk',   type:1, ko:'파멸의',  stat:'flatAtk',     tiers:[50,170,330],    unit:'val', slots:['wpn','hlm'],      group:'ratk', weight:15, skewRoll:3},
];
Object.freeze(AFFIX_POOL);
```

### 어픽스 구현 상태 (2026-03-21)

> **2026-10-28 코드 감사 주석**: 아래 두 표(03-21·03-23)의 티어(1/2/3)·슬롯 열은 당시 3티어 값이다. 현재 5티어 값·슬롯은 [슬롯별_어픽스_풀.md G절](슬롯별_어픽스_풀.md)(AFFIX_POOL 재추출)이 정본이다. 삭제된 id와 바뀐 한글명은 행에 표기했다.

#### ✅ 구현 완료 (23종)

| id | 한글 | 타입 | 티어 (1/2/3) | 단위 | 슬롯 | 적용 위치 |
|---|---|---|---|---|---|---|
| poisonDot | 맹독의 | PREFIX | 8/14/22 | val | wpn | hurtE: e.poisonT 설정 |
| fireDot | 불꽃의 | PREFIX | 10/17/26 | val | wpn | hurtE: e.burnT 설정 |
| iceDot | 냉기의 | PREFIX | 7/12/18 | val | wpn | hurtE: e._iceDotT 설정 |
| lifeSteal | 피흡의 | PREFIX | 4%/7%/12% | pct | wpn,rng | hurtE: 피흡 HP 회복 **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** |
| critChance | 광폭의 | PREFIX | 6%/10%/16% | pct | wpn,rng | statCrit() **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** 현재 `광폭의`=`critRate` |
| critDmg | 처형의 | PREFIX | 25%/40%/65% | pct | wpn | statCritDmg() (무기 전용, 레거시) **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** |
| atkSpeed | 쾌속의 | PREFIX | 6%/10%/16% | pct | wpn,glv | statDex() |
| maxHPFlat | 강인의 | PREFIX | 100/200/300 | val | 방어구 | statMaxHP() |
| shieldFlat | 수호의 | PREFIX | 120/200/400/600/840 | val | 장신구 | P.mshield |
| maxHPPct | 활력의 | PREFIX | 8%/14%/22% | pct | arm,nck | statMaxHP() |
| movSpd | 신속의 | PREFIX | 5%/9%/14% | pct | bts,clk | statPlayerSpeed() **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** 현재 `신속의`=`movSpeed` |
| killHeal | 회복의 | PREFIX | 8/15/25 | val | arm,rng | 적 처치 시 HP 회복 **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** |
| fireRes | 화염수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 화염 저항 |
| iceRes | 빙결수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 빙결 저항 |
| lightRes | 암전수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 암전 저항 |
| darkRes | 암흑수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 암흑 저항 |
| poisonRes | 독수호 | SUFFIX | 10%/18%/28% | pct | arm,rng,nck | 피격 시 독 저항 |
| allRes | 전원소수호 | SUFFIX | 5%/9%/15% | pct | nck | 모든 원소 저항 추가 |
| physDR | 물리방패의 (구 강철의) | SUFFIX | 6%/10%/16% | pct | arm,shd | 물리 피해 감소 |
| dropRate | 약탈의 | SUFFIX | 12%/20%/32% | pct | bts,clk | statDropBonus() |
| extraST | 사슬의 | SUFFIX | 10/20/30 | val | bts,pnt | 사슬게이지 MAX 추가 |
| stRegen | 회복의 | SUFFIX | 6%/10%/18% | pct | arm,rng,nck | ST 재생 배율 **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** |
| dpRegen | 마력의 | SUFFIX | 6%/10%/18% | pct | hlm,nck | MP 재생 배율 **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** |
| antiRevive | 진혼의 | SUFFIX | 4%/8%/12%/16%/20% (5티어, 고티어 극악확률 tierW:50/30/15/4/1) | pct | neck,wpn,bracelet (반지: 2/4/8/12/16%) | 보스 부활 억제 (최대20%) |
| critDmgA | 행운의 **[2026-10-28: 풀 삭제, `statCritDmg()` 구세이브 읽기만 유지]** | PREFIX | 반지: 5%/10%/15%/20%/25% (5티어, tierW:40/30/20/8/2) / 목걸이: 10%/20%/30%/40%/50% | pct | ring,neck | statCritDmg() — 크리뎀 |
| critDmgB | 극대화의 **[2026-10-28: 풀 삭제, `statCritDmg()` 구세이브 읽기만 유지 — 현재 `극대화의`=`critDmgW`]** | SUFFIX | 반지: 5%/10%/15%/20%/25% (5티어, tierW:40/30/20/8/2) / 목걸이: 10%/20%/30%/40%/50% | pct | ring,neck | statCritDmg() — 크리뎀 |

#### ✅ 구현 완료 (27종, 2026-03-23)

| id (코드) | 한글 | 타입 | 티어 (1/2/3) | 단위 | 슬롯 | 구현 효과 |
|---|---|---|---|---|---|---|
| lightChain | 번개의 | PREFIX | 13/22/35 | val | wpn | 피격 시 주변 적 2명에게 연쇄뎀 (반경120) |
| darkCurse | 암흑의 | PREFIX | 20%/35%/55% | prob | wpn | 확률로 저주(3초), 저주 상태 뎀+25% |
| armorPen | 관통의 | PREFIX | 8%/14%/22% | pct | wpn | eShield 추가파괴 (dmg×배율) — **2026-10-28 코드: 스탯창 표시(`_af('armorPen')`)만 읽고 전투 계산에서 읽는 곳 없음** |
| staggerBns | 파쇄의 | PREFIX | 8/14/22 | val | wpn | 포이즈 추가 감소 (고정값) |
| chainTarget | 연쇄의 | PREFIX | 1/2/3 | val | wpn | 주변 적 N명에게 30% 뎀 (반경100) |
| killSlayer | 학살의 | PREFIX | 15%/25%/40% | pct | wpn | 처치 후 3초간 뎀×(1+배율) |
| elemFocus | 집중의 (구 원소집중의) | PREFIX | 12%/20%/32% | pct | wpn,nck | 속성 공격 시 뎀×(1+배율) |
| parryBonus | 패리의 | PREFIX | 20%/35%/55% | pct | wpn,clk | 패링 HP/ST/MP 회복량 ×(1+배율) |
| comboBoost | 추적자의 (구 콤보의) | PREFIX | 20%/35%/55% | pct | wpn | 같은 적 연속 공격 시 +5%/중첩 |
| dashBoost | 사슬의 (구 돌진의) | PREFIX | 25%/40%/65% | pct | wpn,bts | 사슬/돌진 데미지 ×(1+배율) |
| skillBoost | 궁극의 | PREFIX | 15%/25%/40% | pct | wpn | 선택스킬 데미지 ×(1+배율) (_fuseMul 내장) |
| cooldownRed | 집중력의 | PREFIX | -2%/-3%/-5%/-7%/-10% | pct | wpn | 스킬 쿨다운 ×(1+값) (음수=감소) |
| reflect | 반사의 | SUFFIX | 5%/9%/15% | pct | arm,shd,rng | 피격 데미지×배율 반사 (반경80, 1명) |
| thorns | 가시의 | SUFFIX | 4/8/14 | val | arm,glv | 피격 시 고정 가시뎀 (반경80, 1명) |
| barrier | 흡수의 | SUFFIX | 15/28/45 | val | arm,hlm | DEF 감산 후 고정 데미지 감소 |
| ccRes | 인내의 | SUFFIX | 12%/20%/32% | pct | hlm,pnt | 포이즈 기절 시간 ×(1-min(0.5,값)), 최대50% |
| crisisBoost | 위기의 | SUFFIX | 25%/40%/65% | pct | arm,nck | HP 30% 이하 시 뎀×(1+배율) |
| counterHit | 피격반격의 | SUFFIX | 15%/25%/40% | prob | arm,shd | 피격 시 확률로 반격(meleeRef×STR) |
| abundDmg | 풍요의 | SUFFIX | 12%/20%/32% | pct | wpn,hlm | 적HP≥70% 시 뎀×(1+배율). 패시브 풍요와 합연산 (2026-04-21) |
| predDmg | 약자포식의 | SUFFIX | 12%/20%/32% | pct | wpn,hlm | 적HP≤30% 시 뎀×(1+배율). 패시브 약자포식과 합연산 |
| parryExplosion | 패링폭발의 | SUFFIX | 0.4/0.7/1.1 | ATK× | wpn,shd | 패링 시 AoE (meleeRef×STR×배율, 반경100) |
| staggerExplosion | 스태거폭발의 | SUFFIX | 30%/50%/80% | pct | wpn | 그로기 시 AoE (dmg×배율, 반경100) |
| elemConvert | 원소전환의 | SUFFIX | 20%/35%/55% | prob | wpn,nck | 물리 → 무기 속성 전환 확률 |
| statusClean | 정화의 | SUFFIX | 1/1/2 | val | hlm,pnt | 10초마다 상태이상 해제 (값=횟수/틱) |
| lastStand | 불굴의 | SUFFIX | 0/0/1 | val | arm | 1회 사망 방지(HP=1, 무적2초), 스테이지 리셋 |
| reviveOnce | 부활의 | SUFFIX | 0/0/30% | pct | arm | 1회 즉시 부활(HP/MP/ST=각 최대치), 스테이지 리셋 |
| expBonus | 경험의 | SUFFIX | 10%/18%/28% | pct | hlm,nck | 경험치 ×(1+배율) |
| goldBonus | 골드의 | SUFFIX | 15%/25%/40% | pct | bts,rng | 악의오브 획득 ×(1+배율) |
| potionPower | 포션강화의 | SUFFIX | 20%/35%/55% | pct | pnt | HP 물약 회복량 ×(1+배율) |
| sharpAtk | 예리한 | PREFIX | 50/170/330 | val | wpn,hlm | 플랫 ATK+ (skewRoll:3, 고뎀 극악) |
| brutalAtk | 맹렬한 | PREFIX | 50/170/330 | val | wpn,hlm | 플랫 ATK+ (skewRoll:3, 고뎀 극악) |
| ruinAtk | 파멸의 | SUFFIX | 20/50/170/330/500 | val | wpn,hlm | 플랫 ATK+ (skewRoll:3, 고뎀 극악) |

### Phase 1 신규 어픽스 (5-티어, 2026-04-15)

> 전체 5-티어 통일 완료. 기존 3-티어 → 5-티어 변환 + 신규 39종 추가 = 총 108 엔트리.

#### 조건부 DPS (무기 파트 SUFFIX)

| id | 이름 | 티어(5) | 조건 | 효과 |
|---|---|---|---|---|
| fullLifeDmg | 만혈의 | 10/18/28/40/55% | 내HP=100% | 뎀+ (높은 배율) |
| lowLifeDmg | 사선의 | 15/25/40/60/85% | 내HP≤35% | 뎀+ (최고 배율) |
| overkilDmg | 처형의 | 20/35/55/80/110% | 적HP≤20% | 마무리 뎀+ |
| closeDmg | 근접살의 | 8/14/22/32/44% | 거리≤120px | 근접 뎀+ |
| farDmg | 원거리의 | 8/14/22/32/44% | 거리>300px | 원거리 뎀+ |
| stunDmgUp | 경직파의 | 10/18/28/40/55% | 적 스턴 중 | 뎀+ |
| frozenDmgUp | 동파의 | 10/18/28/40/55% | 적 빙결 중 | 뎀+ |
| burnDmgUp | 연소의 | 10/18/28/40/55% | 적 화상 중 | 뎀+ |
| poisonDmgUp | 맹독살의 | 10/18/28/40/55% | 적 중독 중 | 뎀+ |
| curseDmgUp | 저주살의 | 10/18/28/40/55% | 적 저주 중 | 뎀+ |
| slowDmgUp | 구속의 | 10/18/28/40/55% | 적 감속 중 | 뎀+ |
| bossSlayer | 왕살의 | 10/18/28/40/55% | 보스 대상 | 뎀+ |
| eliteSlayer | 정예살의 | 12/20/32/46/65% | 엘리트 대상 | 뎀+ |
| mobSlayer | 군살의 | 15/25/40/60/85% | 일반몹 대상 | 뎀+ (높은 배율) |
| firstStrike | 선제의 | 15/25/40/60/85% | 적HP≥95% 첫타 | 뎀+ |

#### 흡수 (무기 파트 SUFFIX)

| id | 이름 | 티어(5) | 효과 |
|---|---|---|---|
| lifeLeech | 흡혈의 | 0.5/1/1.8/2.8/4% | 물리 뎀의 X% HP 흡수 |
| manaLeech | 흡마의 | 0.8/1.5/2.5/4/6% | 뎀의 X% MP 흡수 |
| stLeech | 흡정의 | 0.5/1/1.8/2.8/4% | 뎀의 X% ST 흡수 |
| lifeOnHit | 타격재생의 | 1/2/4/7/11 | 적중 시 HP 고정 회복 |

#### On-Kill 프록 (무기 파트 SUFFIX)

| id | 이름 | 티어(5) | 효과 |
|---|---|---|---|
| onKillHeal | 처치회복의 | 5/10/18/28/40 | 처치 시 HP 회복 |
| onKillMana | 처치흡마의 | 5/10/18/28/40 | 처치 시 MP 회복 |
| onKillStam | 처치활력의 | 3/6/10/16/24 | 처치 시 ST 회복 |
| onKillExplode | 처치폭발의 | 8/14/22/32/44% | 처치 시 시체폭발 (적 최대HP×%) **[2026-10-28: AFFIX_POOL에서 삭제됨(코드 없음)]** (AFFIX_NAMES_KO에만 이름 잔존) |
| onKillSpeed | 처치질주의 | 5/8/12/18/25% | 처치 후 2초 이속 버프 |

#### 조건부 방어 (방어구 파트 SUFFIX)

| id | 이름 | 티어(5) | 조건 | 효과 |
|---|---|---|---|---|
| healthyDef | 건강방어의 | 5/10/18/28/40 | HP≥70% | 방어력+ (플랫→DR변환) |
| injuredDR | 중상보호의 | 6/10/16/24/34% | HP≤30% | DR+ |
| injuredSpeed | 위기질주의 | 4/7/11/16/22% | HP≤50% | 이속+ |
| dotDR | 지속피해방어의 | 6/10/16/24/34% | DoT 피격 | DR+ |
| burnDR | 화상저항의 | 10/16/24/36/50% | 화상 DOT 피격 | DR+ (망토 전용, 2026-07-27 추가) |
| bossDR | 왕피해방어의 | 5/8/14/22/30% | 보스 피격 | DR+ |
| closeDR | 근접방어의 | 5/8/14/22/30% | 근접적 피격 | DR+ |
| farDR | 원거리방어의 | 5/8/14/22/30% | 원거리 피격 | DR+ |
| hpOnKill | 처치생명의 | 3/6/10/16/24 | 처치 시 HP 회복 | 방어구 전용 |
| shieldOnKill | 처치수호의 | 5/10/18/28/40 | 처치 시 쉴드 회복 | 방어구 전용 |

#### 장신구 조건부 (장신구 파트 SUFFIX)

| id | 이름 | 티어(5) | 조건 | 효과 |
|---|---|---|---|---|
| healthyAtk | 건강공세의 | 8/14/22/32/44% | HP≥70% | 공격력%+ |
| injuredDmg | 중상폭발의 | 12/20/32/46/65% | HP≤35% | 뎀%+ |
| injuredLeech | 중상흡혈의 | 0.8/1.5/2.5/4/6% | HP≤35% | 흡혈%+ |
| vsBossDmg | 토벌의 | 8/14/22/32/44% | 보스 대상 | 뎀%+ |
| vsEliteDmg | 정예토벌의 | 10/18/28/40/55% | 엘리트 대상 | 뎀%+ |

#### 자원 (장신구 파트 PREFIX)

| id | 이름 | 티어(5) | 효과 |
|---|---|---|---|
| stCostRed | 절약의 | -5/-8/-14/-22/-30% | ST 소비 감소 |

> **합연산 규칙:** 같은 카테고리의 조건부 뎀+ 어픽스는 전부 합연산 후 1회 곱연산 적용.  
> 예: closeDmg 22% + stunDmgUp 28% + bossSlayer 28% → ×1.78 (합연산 78%)

---

## STEP 2. IMPLICIT_TABLE + LEGENDARY_SPECIAL 추가

**위치**: AFFIX_POOL 바로 아래에 추가

> **2026-10-08 전면 개편 — 무작위화 + 실효과 구현 완료.**
> 전설 특수는 더 이상 "슬롯+무기타입별 고정 1개"가 아니다. **rarity>=4 아이템은 부위·무기종류와 무관하게 아래 19종 풀에서 무작위 1개**를 받으며(유니크 rarity=5도 동일하게 상속), 효과는 `_lEq(stat)` 헬퍼로 **어느 부위에 장착해도 동작**한다. 키 이름(weapon_sword 등)은 원래 출처 부위 표기용일 뿐이다. 과거 문서의 greatsword/longsword 항목과 구(舊) 수치(armor 8%/helmet 25%확률/neck -50%/belt 스태미나/cape 무적)는 폐기 — 현행 코드 기준은 아래 표다.

```javascript
// ─── 전설 특수 효과 (rarity>=4: 부위·무기종류 무관 19종 풀에서 무작위 1개, 유니크도 상속) ───
// 키는 원래 출처 부위 표기용. 효과는 _lEq(stat)로 어느 부위에 장착해도 동작 (비가산, 첫 값 1개).
const LEGENDARY_SPECIAL={
  weapon_sword:    {ko:'기검참 3타 콤보 완성 시 분노 20% 즉시 충전',        stat:'_lSwordCombo', val:0.20},
  weapon_dagger:   {ko:'처치 시 이속 +40%(3초) + 다음 공격 크리 보장',    stat:'_lDaggerKill', val:1},
  weapon_hammer:   {ko:'스태거 발동 시 범위 충격파 (ATK×120%)',           stat:'_lHammerShock',val:1.20},
  weapon_mace:     {ko:'스태거 발동 시 범위 충격파 (ATK×100%)',           stat:'_lMaceShock',  val:1.00},
  weapon_club:     {ko:'넉백 거리 2배 + 벽충돌 시 추가 데미지 50%',        stat:'_lClubKB',     val:2},
  weapon_axe:      {ko:'출혈 대상 크리 시 잔여 DoT×300% 즉시 폭발',       stat:'_lAxeBleed',   val:3.00},
  weapon_spear:    {ko:'사슬기동 착지마다 8초간 데미지 +20% 중첩(최대5)',   stat:'_lSpearStack', val:0.20},
  bow:             {ko:'치명타 시 추가 투사체 1발 발사',                   stat:'_lBowCrit',    val:1},
  shield:          {ko:'패리 성공 시 반격 데미지 ×2',                     stat:'_lShieldParry',val:2},
  armor:           {ko:'피격 시 3초 쿨로 HP 5% 즉시 회복',               stat:'_lArmorRegen', val:0.05},
  helmet:          {ko:'스킬 쿨다운 -20%',                               stat:'_lHelmFree',   val:0.20},
  gloves:          {ko:'공격속도 +20% + 기본공격에 랜덤 원소 추가',       stat:'_lGloveElem',  val:1},
  pants:           {ko:'이동 중 지속 HP 재생 (초당 HP의 1%)',             stat:'_lPantsRegen', val:0.01},
  boots:           {ko:'회피 직후 첫 공격 데미지 +80%',                   stat:'_lBootsEvade', val:0.80},
  cape:            {ko:'패리 타이밍 판정 +50% 확대',                      stat:'_lCapeParry',  val:0.50},
  ring1:           {ko:'속성 약점 적중 시 추가 폭발 (ATK×80%)',           stat:'_lRingElem',   val:0.80},
  ring2:           {ko:'처치 시 분노 5% 회복',                            stat:'_lRingKill',   val:0.05},
  necklace:        {ko:'HP 50% 이하 시 전 스킬 쿨다운 -30%',             stat:'_lNeckLow',    val:0.30},
  belt:            {ko:'물약 사용 시 5초간 피해 +15%',                    stat:'_lBeltBuff',   val:0.15},
};
```

### 전설 특수 효과 — 구현 상세 19종 (2026-10-08, 전부 실동작 구현·Playwright A/B 검증)

| # | 출처 키 | stat | 툴팁 문구 (현행 ko) | 수치 | 실제 적용 위치 (game.html) | 해석 메모 (원문→현행 메커니즘) |
|---|---|---|---|---|---|---|
| 1 | weapon_sword | `_lSwordCombo` | 기검참 3타 콤보 완성 시 분노 20% 즉시 충전 | 분노최대치의 20% | `_fireKiSlashCrescent()` step===3 분기 | 원문 "5타 콤보+데빌포스"는 존재하지 않음 → 기검참(kiSlash) 3타 콤보 + 분노(P.rage)로 재해석 |
| 2 | weapon_dagger | `_lDaggerKill` | 처치 시 이속 +40%(3초) + 다음 공격 크리 보장 | 이속 0.40·180f, 크리 1회 | `hurtE()` on-kill 블록(`P._okSpdBuff/_okSpdMul` 재사용, `P._lNextCrit=1`) + 크리 판정부에서 강제크리 소모 | 원문 그대로. 이속은 onKillSpeed 어픽스 버프 채널 재사용 |
| 3 | weapon_hammer | `_lHammerShock` | 스태거 발동 시 범위 충격파 (ATK×120%) | ×1.20, 반경120 | `hurtE()` poiseHit→`_poiseHit()` 성공 블록 (staggerExplosion 어픽스 옆) | 스태거=포이즈 격파(그로기). ATK=meleeRef×statStr×pAtkMul. `{dot:true,shieldHit:true}`로 재귀 차단 |
| 4 | weapon_mace | `_lMaceShock` | 스태거 발동 시 범위 충격파 (ATK×100%) | ×1.00, 반경120 | 상동 (hammer와 공유, 둘 다 장착 시 비가산 최대값) | 상동 |
| 5 | weapon_club | `_lClubKB` | 넉백 거리 2배 + 벽충돌 시 추가 데미지 50% | kb×2, 벽충돌 +dmg×0.5 | `hurtE()` 넉백 블록 (`_kbAmt*=2`, `canMv` 벽 판정 → 추가 hurtE, `opts._lClubWall` 재귀 가드, 보스 제외) | 원문 "강타 시"는 미정의 → 넉백 발생 공격 전반으로 재해석, 문구 수정 |
| 6 | weapon_axe | `_lAxeBleed` | 출혈 대상 크리 시 잔여 DoT×300% 즉시 폭발 | bleedPool×3.0 | `hurtE()` 크리 성공 블록 (`e.bleedT>0&&e.bleedPool>0` → dmg 가산, 출혈 소멸) | 원문 그대로. 잔여 DoT=`e.bleedPool` |
| 7 | weapon_spear | `_lSpearStack` | 사슬기동 착지마다 8초간 데미지 +20% 중첩(최대5) | +0.20/스택, 최대5, 480f | 사슬기동 착지 블록(`_harpLandT=30` 지점)에서 스택+1 → `hurtE()` 플레이어 공격 배율 | 원문 "사슬 착지 타격 수"→착지 횟수 스택으로 재해석, 문구 수정 |
| 8 | bow | `_lBowCrit` | 치명타 시 추가 투사체 1발 발사 | 치명타 확률로 1발 | `fireBow()`·`_fireXbow()` 발사 시 `statCrit()` 확률로 투사체 1발 추가 (±0.12rad) | 피격 시점이 아니라 발사 시점에 크리확률 판정으로 구현 |
| 9 | shield | `_lShieldParry` | 패리 성공 시 반격 데미지 ×2 | ×2 | `pParryProjDmg()` `_legSP` (기존 죽은 참조 `sh()._lShieldParry` → `_lEq()`로 수정) | 원문 그대로. 반격=패링 반사탄 데미지 |
| 10 | armor | `_lArmorRegen` | 피격 시 3초 쿨로 HP 5% 즉시 회복 | mhp×0.05, ICD 180f | `hurtP()` `P.hp-=a` 직후 (`P._lArmorF`=G.playTime 기준 ICD) | 원문 그대로 (구 문서 8%→현행 5%) |
| 11 | helmet | `_lHelmFree` | 스킬 쿨다운 -20% | -0.20 | `_cdRed()` 합산 | 원문 "20% 확률 쿨다운 미소모"는 중앙 쿨다운 설정부가 없어 기대값 동일한 쿨감 -20%로 재해석, 문구 수정 |
| 12 | gloves | `_lGloveElem` | 공격속도 +20% + 기본공격에 랜덤 원소 추가 | 공속 +0.20, 원소 1~4 | `statDex()` + wSwing 히트 `hitArc()` 호출부(무속성 무기일 때 화염/냉기/암흑/전기 랜덤) | 원문 그대로. 유속성 무기는 무기 속성 유지 |
| 13 | pants | `_lPantsRegen` | 이동 중 지속 HP 재생 (초당 HP의 1%) | mhp×0.01/초 | update 루프 전설 타이머 블록 (`P._walkMoving` 중 60f마다) | 원문 그대로 ("HP의 1%"=최대HP 기준) |
| 14 | boots | `_lBootsEvade` | 회피 직후 첫 공격 데미지 +80% | ×1.8, 1회, 3초 유예 | 사슬기동 착지 블록 + `hurtP()` 회피 판정 성공 → `P._lBootsT=180`, `hurtE()`에서 소모 | 회피=사슬기동(Shift) 착지 + DEX 회피 판정 성공 양쪽 |
| 15 | cape | `_lCapeParry` | 패리 타이밍 판정 +50% 확대 | ×1.5 (캡) | `isPWin()`의 `_lParryWinTicks()`(sBash 16→20틱, 캡20) + `_lSbParryT()`(보호막/평화보호 20→30틱, 7개소) | 원문 그대로. sBash는 20틱 전체가 상한 |
| 16 | ring1 | `_lRingElem` | 속성 약점 적중 시 추가 폭발 (ATK×80%) | ×0.80, 반경100, 적당 ICD 120f | `hurtE()` 크리 블록 뒤 (`atkEl>0 && elMul>=2`, `e._lReactF` ICD) | 원문 "원소 반응"은 미존재 → 속성 상성 약점(elMul≥2) 적중으로 재해석, 문구 수정 |
| 17 | ring2 | `_lRingKill` | 처치 시 분노 5% 회복 | 분노최대치의 5% | `hurtE()` on-kill 블록 | 원문 "데빌포스"→분노(P.rage)로 재해석, 문구 수정 |
| 18 | necklace | `_lNeckLow` | HP 50% 이하 시 전 스킬 쿨다운 -30% | -0.30 (조건부) | `_cdRed()` 합산 (`P.hp<=P.mhp*.5` 시) | 원문 그대로 (구 문서 -50%→현행 -30%). "전 스킬"=_cdRed 사용 스킬 전체 |
| 19 | belt | `_lBeltBuff` | 물약 사용 시 5초간 피해 +15% | ×1.15, 300f | `useQuickslot()`·자동물약 → `P._lBeltT=300`, `hurtE()` 배율 | 원문 그대로 (구 문서 "스태미나 완전 회복 시"는 폐기된 설계) |

**헬퍼 함수 (2026-10-08 추가, game.html:16801 `_lEq` — 2026-10-28 줄번호):**
- `_lEq(stat)` — `_uEq`와 동일 규칙(장착 슬롯 순회·첫 값 1개·비가산)이되, 핫패스 비용 때문에 **장비 변경 시 재계산되는 캐시**(`_lEqCache`) 사용. 무효화 지점은 `_eqAffixCache`와 동일(_refreshEquipmentStats·recalcSt·_testAffix·_testAffixClear).
- **구세이브 폴백**: `_lEqRebuild()`가 `item[stat]`이 없고 `legendarySpecial.stat/val`만 있는 구버전 아이템에서 `item[stat]=legendarySpecial.val`을 복원한다 → 옛 세이브의 전설 아이템도 그대로 동작.
- `_legSpKo(ls)` — 툴팁 표기는 저장된 `ko` 문자열이 아니라 **stat 기준 현행 테이블 문구**를 사용(`_LS_BY_STAT`), 구세이브의 옛 문구가 자동 정규화된다.
- `_lParryWinTicks()`/`_lSbParryT()` — 망토(_lCapeParry) 패링 윈도우 확대 전용.
- 발동 피드백 텍스트(28언어 등록): `💥충격파!` `💥벽충돌!` `🩸출혈 폭발!` `⚡회피 일격!` `⚔착지 중첩 ` `🧪피해 증가!` `💥속성 폭발!` + 분노 적립은 기존 `🔥분노+` 재사용.

### 유니크 등급 (rarity=5, 2026-06-08 추가)

**등급 체계**: 일반(0) → 고급(1) → 희귀(2) → 영웅(3) → 전설(4) → **유니크(5)**

- 색상: `#8e55e9` (자수정, `RARITY_C[5]`, 2026-10-08 변경 — 이전 `#ff4466` 붉은 핑크)
- RARITY_MUL: 2.5
- 어픽스 수: 7개 (전설6 +1)
- ATK 최소 보장: 50%
- 드롭 확률: 전설의 약 1/100 (극극희귀)
  - 일반몹: 0.01, 엘리트: 0.03, 미니보스: 0.1, 스테이지보스: 0.2, 챕터보스: 0.7
- 전설 특수 효과 상속 + **유니크 특수 효과 1개 추가**

```javascript
// ─── 유니크 특수 효과 (rarity=5 전용, 아래 풀에서 무작위 1개 — 키는 원래 출처 부위 표기용) ─── (2026-10-28: 현행 풀은 이 12종 + u_n01~u_d22 25종 + u_p01·u_p02 = 39종)
const UNIQUE_SPECIAL = {
  weapon_sword:    {ko:'분노의 최대치가 100% 추가된다 (200%까지)',  stat:'_uRageMax',       val:100},
  weapon_dagger:   {ko:'패링한 탄막의 관통률이 100% 추가된다',      stat:'_uDaggerPierce',  val:1.0},
  weapon_hammer:   {ko:'폭발 데미지 50% 증가',                   stat:'_uExplDmg',       val:0.50},
  weapon_axe:      {ko:'출혈 적에게 공격 시 HP 5% 흡수',           stat:'_uAxeLeech',      val:0.05},
  weapon_mace:     {ko:'적 처치 시 폭발 (최대HP의 30% AoE)',       stat:'_uMaceExplode',   val:0.30},
  weapon_club:     {ko:'적 스턴 중 데미지 ×3',                    stat:'_uClubStun',      val:3},
  bow:             {ko:'투사체 관통력 50% 증가',                   stat:'_uBowPierce',     val:0.5},
  shield:          {ko:'보호막이 탄막을 흡수하면 분노 10%를 생성한다',  stat:'_uShieldRage',    val:10},
  armor:           {ko:'피격 시 25% 확률로 데미지를 분노로 전환',   stat:'_uArmorRage',     val:0.25},
  helmet:          {ko:'마법 스킬 데미지 +50% + 마나 소모 -50%',   stat:'_uHelmMagic',     val:0.50},
  gloves:          {ko:'공격속도 +40%',                           stat:'_uGloveSpd',      val:0.40},
  cape:            {ko:'패링 성공 시 분노스킬 쿨다운 {s}초 회복',     stat:'_uParryRageCd',   val:30, roll:[30,60]},
};
```

> **롤링 유니크**: `cape`는 `roll:[min,max]`(프레임)을 가지는 최초의 롤링 유니크 특수효과다. 아이템 생성 시 `_uv = roll[0] + ~~(rnd*(roll[1]-roll[0]+1))` 로 30~60프레임(0.5~1.0초) 중 하나가 결정되고, `uniqueSpecial.secs=(_uv/60).toFixed(1)` 로 초 표기값을 별도 저장한다. 표시용 `ko`에는 `{s}` 플레이스홀더를 유지하고, 툴팁 렌더(`_T(it.uniqueSpecial.ko).replace('{s}',secs)`)에서 치환한다 → 번역 테이블에는 `{s}` 포함 템플릿을 등록.

> **유니크 어픽스 전체 목록(2026-10-08 신규 25종 구현):** [유니크_어픽스_리스트.md](유니크_어픽스_리스트.md) — 기존 12종 + B절 3종(U-N01~03) + D절 22종(U-D01~22) + 패링 2종(`u_p01`·`u_p02`) = **총 39종**, 전부 부위 무관 무작위 1개 풀. 신규 키는 `u_n01`~`u_d22`(id 기반). 신규 롤링 계약: `roll:[min,max]` 정수 균등 + 선택적 `scale:0.01`(% 롤은 `item[stat]=롤×scale` 소수 저장), 롤 원본 정수는 `uniqueSpecial.disp`에 보존. 툴팁 치환 `{s}`(초)·`{p}`(%)·`{n}`(개수) + 롤 3등분 **하/중/상옵 라벨**(`_invCardFields`, 뼈회색/뼈색/금빛). 구세이브 12종은 scale 없음 → 마이그레이션 불필요. 25종 적용 위치·채택안·검증 결과는 유니크_어픽스_리스트.md **G절** 표가 단일 기준이다.

#### 유니크 특수 효과 — 구현 상세 (2026-06-08)

| # | 슬롯 | stat | 효과 설명 | 구현 위치 (game.html) | 적용 방식 |
|---|---|---|---|---|---|
| 1 | weapon_sword | `_uRageMax` | 분노 최대치 +100% (200%까지) | `doParry()` → `Math.min(100+_uEq('_uRageMax'),...)`, UI height 비율 계산 | 분노 캡 확장 |
| 2 | weapon_dagger | `_uDaggerPierce` | 패링 반사탄 관통 100% | 기본 패링 반사 + Q패링 반사 → `p.pierce=1;p.pierceMax=99` | 반사 투사체에 관통 부여 |
| 3 | weapon_hammer | `_uExplDmg` | 폭발 데미지 50% 증가 | AoE 판정 시 `_ad*(1+_uEq('_uExplDmg'))`, 블루콩 AoE도 동일 | _aoeDmg 배율 |
| 4 | weapon_axe | `_uAxeLeech` | 출혈 적 공격 시 HP 5% 흡수 | `hurtE()` 흡수 어픽스 블록 → `e.bleed>0` 조건 | dmg×val HP 회복 |
| 4 | weapon_mace | `_uMaceExplode` | 처치 시 폭발 (최대HP 30% AoE, 반경150) | `hurtE()` on-kill 블록 → `shQuery(e.x,e.y,150)` | 주변 적에게 e.mhp×val 데미지 |
| 5 | weapon_club | `_uClubStun` | 스턴 중 데미지 ×3 | `hurtE()` 조건부 뎀업 → `e.stunned>0` 시 합연산 +2 | _cAx 합연산 |
| 6 | bow | `_uBowPierce` | 투사체 관통력 50% 증가 | `_resetPProj()` → `p._pierceRate *= 1.5` | _pierceRate 배율 적용 |
| 7 | shield | `_uShieldRage` | 보호막 흡수 시 분노 +10% | `doParry()` → `_isQParry` 조건으로 `_rageAdd += _uSR` | Q패링(보호막) 전용 |
| 8 | armor | `_uArmorRage` | 피격 시 25% 확률로 데미지→분노 전환 | `hurtP()` → HP 차감 직전, `a=0` 으로 데미지 무효화 + 분노 +10% | 확률적 데미지 면역 |
| 9 | helmet | `_uHelmMagic` | 마법 데미지 +50%, MP 소모 -50% | `pMagicMul()` × (1+val), `pMagicCost()` 에서 val 차감 | 배율/비용 함수 직접 수정 |
| 10 | gloves | `_uGloveSpd` | 공격속도 +40% | `statDex()` 에 val 합산 | 공속 배율 |
| 11 | cape | `_uParryRageCd` | 패링 성공 시 Space 분노스킬 쿨다운 0.5~1.0초 추가 회복 (롤) | `doParry()` → `_uEq('_uParryRageCd')` 조회, `P._gslCd`에서 val 차감. 천공쇄기는 기본 30f에 val을 합산해 `P._scCd` 차감 | 어픽스 추가량만 프레임당1회(`P._parryCdFrame!==G.frame`). 별도 물리탄 기본30f는 한 발마다 누적 |

**헬퍼 함수**: `_uEq(stat)` — 장착 슬롯을 `SLOT_NAMES` 순서로 보고 처음 찾은 값 1개 반환 (없으면 0, 비가산). 위치: `game.html:16693` (2026-10-28)

**mkItem 저장 (2026-10-08 확장)**: `item[_us.stat] = _us.val` (롤링 유니크는 `_uv`) — 유니크 특수 효과의 stat/val을 아이템 객체에 직접 프로퍼티로 저장. `_uEq()`가 `INV.equipped[slot][stat]`으로 접근. 롤링 유니크는 `uniqueSpecial.secs`(초 표기)와 **`uniqueSpecial.disp`(롤 원본 정수, 2026-10-08 신설)** 를 함께 저장하고, `scale`이 있으면 `_uv=+(롤×scale).toFixed(4)`(소수)를 저장한다. `ko`엔 `{s}`/`{p}`/`{n}` 템플릿 유지 — 툴팁(`_invCardFields`)에서 secs/disp로 치환하고 roll 3등분 하/중/상옵 라벨을 붙인다. 구세이브 아이템(disp 없음)은 scale 유무로 역산 폴백.

> **분노스킬 정의**: "분노스킬"=Space 전용 **지옥강타 1·2**(`giantSlam`/`giantSlam2`)와 `cat:'rage'` **천공쇄기**(`skyCrusher`). 쿨다운 변수는 각각 `P._gslCd`, `P._scCd`이다. `_uParryRageCd`는 활성 쿨다운 둘을 함께 차감하고, 천공쇄기는 장비와 무관한 기본 30f(0.5초) 충전 회복에 어픽스 30~60f가 추가된다. 패링은 근접(`doParry` 근접 호출)·탄막 반사(투사체당 `doParry` 호출) 모두 트리거하므로, 어픽스 추가량은 `G.frame` 기준 프레임당1회만 적용. 2026-09-10부터 물리탄은 장비 없이도 한 발마다 지옥강타 1·2와 천공쇄기에 기본30f(0.5초) 회복이 누적된다. 천공쇄기 기존 기본30f와 중복 합산하지 않으며 비물리 패링 기본30f는 프레임당1회 유지.

**스테이지 리셋 변수**: `P._uReviveUsed`, `P._uInvisT` — 스테이지 시작 시 false/0으로 초기화.

---

## STEP 3. mkItem() 함수 업그레이드 — 과거 교체계획, 현재 source 적용 금지

**위치**: 기존 `function mkItem(slot,tier,el,rarity,wtype){` 함수 내부 끝부분  
(약 3080~3105번 줄 — `// ── 접두사/접미사: 고급+` 주석부터 `return item;` 전까지)  
아래 코드로 통째 교체

```javascript
  // ── IMPLICIT (고정 implicit 값 롤링) ──
  const _impl = IMPLICIT_TABLE[slot];
  if(_impl){
    const _iv = _impl.val[0] + Math.random() * (_impl.val[1] - _impl.val[0]);
    item._implicitStat = _impl.stat;
    item._implicitVal  = _impl.unit === 'val' ? ~~_iv : +_iv.toFixed(3);
    item._implicitKo   = _impl.ko;
  }

  // ── AFFIX ROLLING ──
  // 등급별 슬롯 수: 일반=0, 고급=1, 희귀=2, 영웅=3, 전설=4
  const _affixCount = [0,1,2,3,4][rarity] || 0;
  item.affixes = [];                    // 어픽스 결과 배열
  const _usedGroups = {};               // 중복 방지 (객체로 체크 — Set 대신)

  // 슬롯 코드 역매핑 (item.slot → AFFIX_POOL slots 배열 키)
  const _slotKey = (function(s){
    if(s==='weapon')               return 'wpn';
    if(s==='bow')                  return 'xbow';
    if(s==='armor')                return 'arm';
    if(s==='helmet')               return 'hlm';
    if(s==='gloves')               return 'glv';
    if(s==='pants')                return 'pnt';
    if(s==='boots')                return 'bts';
    if(s==='cape')                 return 'clk';
    if(s==='ring1'||s==='ring2')   return 'rng';
    if(s==='necklace')             return 'nck';
    if(s==='shield')               return 'shd';
    return 'any';
  })(slot);

  // 어픽스 가능 풀 필터 (게임 루프 밖이므로 filter OK)
  const _eligible = AFFIX_POOL.filter(function(a){
    if(!a.slots.includes(_slotKey) && !a.slots.includes('any')) return false;
    // 불굴의/부활의는 영웅/전설만
    if(a.id === 'lastStand' && rarity < 3) return false;
    if(a.id === 'revive'    && rarity < 4) return false;
    return true;
  });
  const _pfPool = _eligible.filter(function(a){ return a.type === 0; });
  const _sfPool = _eligible.filter(function(a){ return a.type === 1; });

  // 가중치 선택 헬퍼
  function _pickAffix(pool){
    var _tw = 0;
    for(var _pi=0; _pi<pool.length; _pi++) _tw += pool[_pi].weight;
    if(_tw <= 0) return null;
    var _r = Math.random() * _tw;
    for(var _pi2=0; _pi2<pool.length; _pi2++){
      _r -= pool[_pi2].weight;
      if(_r <= 0) return pool[_pi2];
    }
    return pool[pool.length-1];
  }

  // 티어 유물: 등급 기반 + 200렙당 +1 (5티어 어픽스 해금용)
  // baseTier: 전설=2, 영웅=1, 그 외=0
  // lvBonus: ~~(P.lv / 200) → 200렙=+1, 400렙=+2, 600렙=+3, 800렙=+4
  // maxTier = min(affix.tiers.length - 1, baseTier + lvBonus)
  // 예) 전설+800렙 = min(4, 2+4) = 4 → 5티어 어픽스 최고 티어 해금
  const _baseTier = rarity >= 4 ? 2 : rarity >= 3 ? 1 : 0;
  const _lvBonus = ~~((P ? P.lv : 1) / 200);
  // const _tierIdx = Math.min(affix.tiers.length - 1, _baseTier + _lvBonus);

  for(var _ai=0; _ai<_affixCount; _ai++){
    // 홀수번째 = Prefix 우선, 짝수번째 = Suffix 우선
    const _firstPool  = (_ai % 2 === 0) ? _pfPool : _sfPool;
    const _secondPool = (_ai % 2 === 0) ? _sfPool : _pfPool;

    var _candidates = _firstPool.filter(function(a){ return !_usedGroups[a.group]; });
    if(_candidates.length === 0)
      _candidates = _secondPool.filter(function(a){ return !_usedGroups[a.group]; });
    if(_candidates.length === 0) continue;

    const _picked = _pickAffix(_candidates);
    if(!_picked) continue;

    const _rawVal = _picked.tiers[_tierIdx];
    if(_rawVal === 0 || _rawVal === null || _rawVal === undefined) continue;

    // ±10% 랜덤 편차
    const _jitter = 0.9 + Math.random() * 0.2;
    const _finalVal = _picked.unit === 'val'
      ? ~~(_rawVal * _jitter)
      : +(_rawVal * _jitter).toFixed(3);

    item.affixes.push({
      id:    _picked.id,
      type:  _picked.type,
      ko:    _picked.ko,
      stat:  _picked.stat,
      val:   _finalVal,
      unit:  _picked.unit,
      tier:  _tierIdx,
    });
    _usedGroups[_picked.group] = true;
  }

  // 기존 호환용 — prefix/suffix 첫 번째 어픽스를 단일 필드에도 유지
  item.prefix = item.affixes.find(function(a){ return a.type === 0; }) || null;
  item.suffix = item.affixes.find(function(a){ return a.type === 1; }) || null;

  // ── 전설 특수 효과 (2026-10-08 무작위화: 부위 무관 19종 풀에서 1개, item[stat]도 저장) ──
  item.legendarySpecial = null;
  if(rarity >= 4){
    const _lsPool = Object.values(LEGENDARY_SPECIAL);
    const _ls = _lsPool[~~(Math.random() * _lsPool.length)];
    if(_ls){ item.legendarySpecial = {ko: _ls.ko, stat: _ls.stat, val: _ls.val}; item[_ls.stat] = _ls.val; }
  }

  // 아이템 레벨 = 캐릭터 레벨 기반, 10레벨 단위 (0~900)
  const _pLv = P && P.lv ? P.lv : 1;
  const itemLv = Math.min(900, Math.floor(_pLv / 10) * 10);
  item.itemLv = itemLv;
  item.reqLv  = Math.max(0, itemLv - 10);
  item.maxDurability = DUR_MAX[rarity] || 100;
  item.durability    = item.maxDurability;
  return item;
```

---

## STEP 4. buildItemName() 추가 + itemDispName() 교체

**위치**: 기존 `function itemDispName(it){` 바로 위에 추가

```javascript
// ─── 아이템 이름 생성 ───
// 접두 어픽스명 + 베이스명 + [접미 어픽스명] 조합
function buildItemName(it){
  if(!it) return '???';
  const _pf = it.affixes ? it.affixes.find(function(a){ return a.type===0; }) : it.prefix;
  const _sf = it.affixes ? it.affixes.find(function(a){ return a.type===1; }) : it.suffix;
  let _n = it.name || '';
  if(_pf && _pf.ko) _n = _pf.ko + ' ' + _n;
  if(_sf && _sf.ko) _n = _n + ' [' + _sf.ko + ']';
  return _n.trim();
}

// 구버전 호환 래퍼 (기존 itemDispName 교체)
function itemDispName(it){
  return buildItemName(it);
}
```

---

## STEP 5. applyAffixStats() / removeAffixStats() 추가

**위치**: `function repairItem(item){` 바로 아래에 추가

```javascript
// ─── 어픽스 스탯 적용/제거 ───
// equipItem()/unequipItem() 내부에서 호출 필요
function applyAffixStats(item){
  if(!item) return;
  // Implicit
  if(item._implicitStat && item._implicitVal !== undefined){
    P[item._implicitStat] = (P[item._implicitStat]||0) + item._implicitVal;
  }
  // Affixes 배열
  if(item.affixes){
    for(var _i=0; _i<item.affixes.length; _i++){
      const _a = item.affixes[_i];
      if(_a.stat && _a.val !== undefined && _a.val !== 0){
        // P._ 계열 커스텀 스탯에 누적
        P[_a.stat] = (P[_a.stat]||0) + _a.val;
      }
    }
  }
  // 전설 특수 — ※ 실제 구현(2026-10-08)은 P[stat]이 아니라 item[stat] + _lEq(stat) 캐시 조회 방식
  if(item.legendarySpecial){
    P[item.legendarySpecial.stat] = item.legendarySpecial.val;
  }
}

function removeAffixStats(item){
  if(!item) return;
  if(item._implicitStat && item._implicitVal !== undefined){
    P[item._implicitStat] = (P[item._implicitStat]||0) - item._implicitVal;
  }
  if(item.affixes){
    for(var _i=0; _i<item.affixes.length; _i++){
      const _a = item.affixes[_i];
      if(_a.stat && _a.val !== undefined && _a.val !== 0){
        P[_a.stat] = (P[_a.stat]||0) - _a.val;
      }
    }
  }
  if(item.legendarySpecial){
    P[item.legendarySpecial.stat] = 0;
  }
}
```

**그리고** 기존 `function equipItem(item){` 내부와 탈착 로직에서  
아래 두 줄을 추가해야 함:

```javascript
// equipItem 내: 기존 슬롯 아이템 제거 후 새 아이템 장착 직전
removeAffixStats(INV.equipped[item.slot]); // 기존 제거
// ...장착 로직...
applyAffixStats(item);                      // 새 아이템 적용
applyStats();
```

---

## STEP 6. 5등급 가중치 분포 드롭 시스템 (v2 — 2026-04-29 적용)

### 몹 분류 (monsterTier)
| 분류 | 조건 | 드롭 확률 | 드롭 개수 |
|------|------|-----------|-----------|
| normal | 일반 몹 | 45% (×dropBonus) | 1 |
| elite | e.elite > 0 | 100% | 1 |
| miniboss | etype 90~99 (레어몹) | 100% | 2 |
| stageBoss | e.ib (보스) | 100% | 3 |
| chapterBoss | e.ib + 챕터 마지막 스테이지 | 100% | 5 (첫 드롭 레전드 보장) |

### 등급별 가중치 분포
| 분류 | Common | Uncommon | Rare | Epic | Legendary | Unique |
|------|--------|----------|------|------|-----------|--------|
| normal | 65 | 22 | 9 | 3 | 1 | 0.01 |
| elite | 25 | 35 | 25 | 12 | 3 | 0.03 |
| miniboss | 10 | 25 | 30 | 25 | 10 | 0.1 |
| stageBoss | 0 | 0 | 30 | 50 | 20 | 0.2 |
| chapterBoss | 0 | 0 | 0 | 30 | 70 | 0.7 |

### 등급 유물 방식
가중치 합산 후 `Math.random() × total`로 균일 롤.
기존 레벨 보정/엘리트 보정은 제거 — 몹 분류 자체가 보정 역할.

### 픽업 방식 (v2)
- **모든 아이템**: R키 수동 수거 (악의오브/물약/장비 전부)
- **펫 자동수거**: 제거됨 (2026-05-01)

### 빔 라이트
매직(1) 이상 등급 아이템에 수직 빔 표시. RARITY_C 색상 사용.
두께: 매직 2px, 레어 3px, 에픽 4px, 레전드 6px + 펄스.

```javascript
// (참고용 — 실제 코드는 game.html line ~20590)
// 기존 spawnDrop() 제거됨. 인라인 가중치 드롭으로 교체.


function _spawnOneItem(e, rar){
  // 슬롯 유물 — 보스/레어는 무기 편향
  var _sl;
  if(rar >= 3 && Math.random() < 0.35){
    _sl = Math.random() < 0.6 ? 'weapon' : 'bow';
  } else {
    _sl = SLOT_NAMES[~~(Math.random() * SLOT_NAMES.length)];
  }

  // 원소 유물 — 현재 지옥 속성 편향 50%
  const _hellEl = [EL.P, EL.P, EL.F, EL.D, EL.I, EL.L, EL.P, EL.D][G.hell||0] || EL.P;
  const _el = Math.random() < 0.5 ? _hellEl
    : [EL.P,EL.F,EL.I,EL.D,EL.L][~~(Math.random()*5)];

  // tier = 스테이지 기반
  const _tier = Math.min(~~(G.stage/10) + (rar>=3?2:1), 4);

  const _item = mkItem(_sl, _tier, _el, rar);
  const _ox = e.x + (Math.random()-.5)*20;
  const _oy = e.y + (Math.random()-.5)*20;
  worldItems.push({x:_ox, y:_oy, type:'item', item:_item, picked:false});

  // 드롭 알림
  if(rar >= 3){
    const _msg = rar===4 ? '전설 아이템!' : '영웅 아이템!';
    const _col = RARITY_C[rar];
    addTxt(e.x, e.y-30, _msg, _col, 60);
    addParts(e.x, e.y, _col, rar===4?30:15);
    if(rar===4){ G.shake=Math.max(G.shake,15*OPT.shake/100); G.hitStop=Math.max(G.hitStop,~~(12*OPT.hitStop/100)); }
  }
}
```

---

## STEP 7. renderAffixTooltip() — 툴팁 어픽스 표시 교체

**위치**: 기존 인벤토리 아이템 상세 렌더링 부분  
(약 19660번 줄 `_actB.innerHTML=` 위의 stats 문자열 만드는 부분)에서  
어픽스 표시 구간을 아래 함수로 교체

```javascript
// ─── 어픽스 툴팁 HTML 생성 ───
function renderAffixTooltip(it){
  if(!it) return '';
  let _h = '';

  // Implicit
  if(it._implicitKo && it._implicitVal !== undefined){
    const _iv = it._implicitVal;
    const _dispV = (typeof _iv === 'number' && _iv < 1 && _iv > 0)
      ? (~~(_iv*100))+'%' : _iv;
    _h += `<div style="color:#aaddff;font-size:.8rem;border-bottom:1px solid #334;padding-bottom:4px;margin-bottom:4px">`;
    _h += `<span style="color:#7799bb">◆ 고유: </span>${it._implicitKo.replace('X', _dispV)}</div>`;
  }

  // Affixes
  if(it.affixes && it.affixes.length > 0){
    _h += `<div style="margin-top:2px">`;
    for(var _ai=0; _ai<it.affixes.length; _ai++){
      const _a = it.affixes[_ai];
      const _col = _a.type === 0 ? '#ffcc88' : '#88ddaa';
      const _prefix = _a.type === 0 ? '▲' : '▼';
      let _dispV;
      if(_a.unit === 'pct' || _a.unit === 'prob'){
        _dispV = (~~(_a.val*100)) + '%';
      } else if(_a.unit === 'frame'){
        _dispV = _a.val + 'f';
      } else {
        _dispV = _a.val;
      }
      const _tierStar = _a.tier >= 2 ? '★★' : _a.tier >= 1 ? '★' : '';
      _h += `<div style="color:${_col};font-size:.82rem;display:flex;justify-content:space-between">`;
      _h += `<span>${_prefix} ${_a.ko}</span>`;
      _h += `<span style="color:#fff;font-weight:700">+${_dispV} <span style="color:#ffaa22;font-size:.7rem">${_tierStar}</span></span></div>`;
    }
    _h += `</div>`;
  }

  // Legendary Special
  if(it.legendarySpecial){
    _h += `<div style="margin-top:6px;padding:4px 6px;background:rgba(255,170,0,.12);border:1px solid #ffaa00;border-radius:3px">`;
    _h += `<div style="color:#ffaa00;font-size:.75rem;font-weight:700;margin-bottom:2px">◈ 전설 특수</div>`;
    _h += `<div style="color:#ffdd88;font-size:.8rem">${it.legendarySpecial.ko}</div></div>`;
  }

  return _h;
}
```

**기존 툴팁 렌더링에서** 접두/접미 표시하던 부분을 찾아서:  
`stats += renderAffixTooltip(it);` 한 줄로 교체

---

## STEP 8. rerollPrefix / rerollSuffix 업데이트

**위치**: 기존 `function rerollPrefix(item){` 교체

```javascript
function rerollPrefix(item){
  if(!item || !item.affixes) return;
  // 기존 prefix 제거
  const _old = item.affixes.findIndex(function(a){ return a.type===0; });
  if(_old >= 0) item.affixes.splice(_old, 1);
  // 새 prefix 롤
  const _sl = item.slot==='weapon' ? 'wpn' : item.slot==='bow' ? 'xbow'
    : item.slot==='ring1'||item.slot==='ring2' ? 'rng'
    : item.slot==='necklace' ? 'nck' : item.slot.slice(0,3);
  const _pool = AFFIX_POOL.filter(function(a){
    return a.type===0 && (a.slots.includes(_sl)||a.slots.includes('any'));
  });
  if(_pool.length === 0) return;
  const _new = _pool[~~(Math.random()*_pool.length)];
  const _ti  = item.rarity>=4?2:item.rarity>=3?1:0;
  item.affixes.push({id:_new.id,type:0,ko:_new.ko,stat:_new.stat,val:_new.tiers[_ti],unit:_new.unit,tier:_ti});
  item.prefix = item.affixes.find(function(a){ return a.type===0; }) || null;
  applyStats();
}

function rerollSuffix(item){
  if(!item || !item.affixes) return;
  const _old = item.affixes.findIndex(function(a){ return a.type===1; });
  if(_old >= 0) item.affixes.splice(_old, 1);
  const _sl = item.slot==='weapon' ? 'wpn' : item.slot==='bow' ? 'xbow'
    : item.slot==='ring1'||item.slot==='ring2' ? 'rng'
    : item.slot==='necklace' ? 'nck' : item.slot.slice(0,3);
  const _pool = AFFIX_POOL.filter(function(a){
    return a.type===1 && (a.slots.includes(_sl)||a.slots.includes('any'));
  });
  if(_pool.length === 0) return;
  const _new = _pool[~~(Math.random()*_pool.length)];
  const _ti  = item.rarity>=4?2:item.rarity>=3?1:0;
  item.affixes.push({id:_new.id,type:1,ko:_new.ko,stat:_new.stat,val:_new.tiers[_ti],unit:_new.unit,tier:_ti});
  item.suffix = item.affixes.find(function(a){ return a.type===1; }) || null;
  applyStats();
}
```

---

## STEP 9. 기존 드롭 로직 교체 (중요!)

**위치**: 기존 몬스터 사망 처리 코드 내  
`if(e._isRare){` 블록 안의 레어몹별 드롭 코드들은 **유지**하되,  
일반몹 사망 시 드롭하던 `mkItem(...)` → `worldItems.push(...)` 패턴을  
`spawnDrop(e)` 한 줄로 교체

```javascript
// 몬스터 사망 시 드롭 — 기존 분산 로직 대신
// (일반몹 사망 처리 구간에 추가)
spawnDrop(e);
```

레어몹별 특수 드롭 (etype 90~99)은 **기존 코드 그대로 유지** — spawnDrop이 추가로 1개 더 드롭

---

## STEP 10. 세이브 호환성 패치

**위치**: 세이브 로드 시 구버전 아이템 마이그레이션  
기존 `_fixDur` 함수 근처(약 848번 줄)에 추가

```javascript
// 구버전 아이템 affixes 배열 없을 때 마이그레이션
const _fixAffixes = function(it){
  if(!it) return;
  if(!it.affixes) it.affixes = [];
  // 구버전 prefix/suffix 단일 객체 → affixes 배열로 이식
  if(it.prefix && !it.affixes.find(function(a){ return a.type===0; })){
    it.affixes.push({
      id:'legacy', type:0,
      ko: it.prefix.name || '???',
      stat: it.prefix.stat || 'bStr',
      val: it.prefix.val || 0,
      unit:'val', tier:0
    });
  }
  if(it.suffix && !it.affixes.find(function(a){ return a.type===1; })){
    it.affixes.push({
      id:'legacy', type:1,
      ko: it.suffix.name || '???',
      stat: it.suffix.stat || 'bonusSt',
      val: it.suffix.val || 0,
      unit:'val', tier:0
    });
  }
};
// 로드 시 인벤토리 전체 마이그레이션 (기존 load 함수 내 INV 복원 후 추가)
// INV.bag.forEach(_fixAffixes);
// Object.values(INV.equipped).forEach(_fixAffixes);
```

---

## ✅ 전체 파이프라인 요약

```
[몬스터 사망]
    ↓
spawnDrop(e)
    ↓ 등급/슬롯/원소 유물
mkItem(slot, tier, el, rarity)
    ↓ 베이스 스탯 계산 (기존 그대로)
    ↓ Implicit 롤링 (IMPLICIT_TABLE)
    ↓ Affix 롤링 (AFFIX_POOL — 등급별 0~4개)
    ↓ 전설 Special 배정 (LEGENDARY_SPECIAL)
    ↓ item.affixes[], item.legendarySpecial 완성
    ↓
buildItemName(item) → "맹독의 흑철 대검 [패리의]"
    ↓
worldItems.push({item}) → 바닥 드롭
    ↓
[플레이어 픽업]
    ↓
equipItem(item)
    ↓
applyAffixStats(item) → P._a* 스탯 누적
applyStats()
    ↓
renderAffixTooltip(item) → 인벤토리 툴팁 표시
```

---

## 드롭 확률 (`rollDrop`)

| 항목 | 값 |
|---|---|
| 기본 확률 | 일반몹 45%, 보스 100% |
| 복수 드롭 | 일반/엘리트 1개, 미니보스 2개, 스테이지보스 3개, 챕터보스 5개. 필터 적용 전 롤 횟수 |
| 레어리티 보정 | 몬스터 분류별 6등급 가중치(STEP 6). 레벨별 확률 가산 없음 |
| LCK 보정 | `statDropBonus()` 곱연산 |
| 보스 | 100% (확정) |
| 캡 | 명시적인 95% 캡 없음. 일반몹 비교식은 Math.random()>baseChance, 1 이상이면 확정 |
| 탐욕 저주 | dropBonus×0.5. 장비 드롭 발생 확률 비교는 일반몹에만 적용; 다른 몬스터 분류는 롤 횟수 유지 |
| 최소 줍기 등급 | `OPT.minPickRar` (0=일반~4=전설) — 설정값 미만 장비 생성 생략 |
| 최소 줍기 티어 | `OPT.minPickLvTier`의 reqLv 하한 미만 장비 생성 생략. off=−1, 2=100, 7=900 |
| 초반 보장 | rollDrop에 초반 첫 장비·연속 무드롭 보정 없음 |

### 초반 체감 확률 (일반몹, dropBonus=1, 저주·필터 없음)

| 항목 | 공식 / 값 |
|---|---|
| 장비 전체 | 45% |
| 생성 장비 중 일반 비중 | 65/100.01 ≈64.99%, 일반에는 빛기둥 없음 |
| 매직 이상 장비 | .45×35.01/100.01 ≈15.75%, 평균 약6.35마리당1개 |
| 레어 이상 장비 | .45×13.01/100.01 ≈5.85%, 평균 약17.08마리당1개 |
| 보스 등급 | STEP 6 가중치 사용. 챕터보스 첫 롤만 rarity4 확정 |

2026-09-10 로컬 Chrome에서 실제 `rollDrop`/`mkItem`을 초기 레벨1로 실행했다. 조건당 일반몹1000회, 무필터 장비437개, 매직 이상 필터178개, 레어 이상 필터54개, 최소 줍기 티어2(reqLv100 하한)에서는0개였다. 각 조건은 별도 연속 난수 구간이라 부분집합 비교가 아니다. 유골·유물은 이 장비 통계에서 제외했고 pageerror0. 실제 사용자 필터값은 미확인이므로 이 결과로 사용자 원인을 확정하지 않는다. 증거: `captures/renderer_optin_20260910/early-loot-audit.json`. 확률·필터·픽업 제품 코드는 변경하지 않았다.

## ⚡ 주의사항

- `AFFIX_POOL.filter()`는 **mkItem 내부에서만** 사용 — 게임 루프 밖이므로 OK
- `rerollPrefix/Suffix`의 `splice`는 아이템 편집 시점(루프 밖) 사용 — OK
- `P._a*` 커스텀 스탯 필드들은 `applyStats()` 내에서 전투 계산에 반영 필요  
  → 별도 "어픽스 전투 반영" 패치 작업 필요 (다음 작업으로 분리)
- `G.hell` 필드가 없으면 `G.hell||0` 으로 안전처리 (이미 처리됨)
- 레어몹 특수 드롭 (etype 90~99) 기존 코드 유지 — spawnDrop은 추가 드롭

---

## 월드 드롭 표기 — 전투 시야 최소화 (2026-08-08)

> 범위: `game.html`의 `worldItems` 렌더 표현만. 드롭 확률·아이템 데이터·R키 획득 판정·자동 수거·인벤토리 추가 로직은 변경하지 않는다.

### 이미지 경로 폴백 (2026-08-10, 현재 구현)

인벤토리 `_itemSkin(it, sz, col)`과 월드 드롭 `_worldItemSkin(it)`은 공통 `_itemSkinSrc(base, el)`만으로 `output/imagegen/item-skins/` PNG 경로를 만든다. 파일이 없는 경로를 먼저 요청한 뒤 `onerror`로 회복하지 않는다.

| 항목 | 현재 값 | 적용 위치 | 목적 |
|---|---|---|---|
| 사전 치환 목록 | `necklace_fire`, `cape_fire`, `earring_fire` → 같은 슬롯 `phys` | `_itemSkinSrc` | 누락 파일 요청 및 반복 404 차단 |
| 그 외 속성 | `base + '_' + el + '.png'` | 인벤토리·월드 공통 | 실제 생성된 속성 스킨 유지 |
| 유니크 접미사 | 사용 안 함 (`*_uniq.png` 에셋 없음) | 인벤토리·월드 공통 | 존재하지 않는 유니크 이미지 요청 차단 |
| 최종 표시 폴백 | 기존 이모지 | 이미지 로드 실패 시 | 아이템 식별성 유지 |

따라서 `necklace_fire.png`, `cape_fire.png`, `earring_fire.png` 및 임의의 `*_uniq.png`는 브라우저 요청 목록에 나타나지 않아야 한다. 이 표가 아래의 이전 화염 PNG 일반 서술보다 우선한다.

### 투명 원화 우선 경로 (2026-09-28)

정사각 배경이 포함된 속성 PNG를 그대로 카드와 월드 드롭에 올리지 않는다. `_ITEM_CUTOUT_BASES`에 등록된 장비군은 `img/ui/item-cutouts/{base}_phys_cutout.png`를 우선 사용하며, 해당 파일 로드가 실패했을 때만 기존 `output/imagegen/item-skins/`의 물리 PNG로 되돌아간다. 이 컷아웃은 실제 알파 채널을 사용하므로 월드 드롭의 `_maskWorldDropBlack` 밝기 마스킹을 다시 적용하지 않는다.

| 장비군 id | 투명 원화 | 인벤토리 | 월드 드롭 |
|---|---|---|---|
| `armor`, `axe`, `belt`, `boots`, `bracelet`, `cape`, `crossbow` | `img/ui/item-cutouts/{base}_phys_cutout.png` | 속성별 사각 배경 제거, 원본 실루엣 우선 | 알파 그대로 렌더 |
| `earring`, `gloves`, `helmet`, `necklace`, `pants`, `shield`, `sword` | 같은 경로 규칙 | 어두운 천·금속·체인까지 보존 | 알파 그대로 렌더 |

후속 장비군도 동일한 경로와 알파 검증을 충족한 경우에만 `_ITEM_CUTOUT_BASES`에 추가한다.

| 드롭 종류 | 월드 표시 | 숨기는 정보 | 규격 |
|---|---|---|---|
| 장비 (`type:'item'`) | 인벤토리와 동일한 장비 PNG 스킨, 매직 이상 2프레임 룬 빛기둥 효과 | 아이템 이름 라벨 | 스킨 `34px`을 빛기둥 앞쪽·왼쪽 위로 오프셋해 표시, 원본의 불투명 검정 배경을 알파 마스킹으로 제거, 효과 타일을 가로 절반·세로 연장한 `60×160px`으로 표시 |
| 물약 (`type:'potion'`) | `POT[potType].col`의 플라스크 색/바닥 글로우 (`hp`: `#33cc66`, 회복 녹색; 하이라이트 `#66ff99`) | 물약 이름 라벨 | 기존 플라스크 시각 효과 유지 |
| 잔해 (`type:'debris'`) | 상자 실루엣/등급 색 | `잔해` 이름 라벨 | 기존 상자 크기 유지 |
| 대장간·상자·HP | 상호작용 오브젝트/아이콘 | — | 키 입력 안내는 획득·상호작용을 위해 유지 |

장비 드롭은 인벤토리와 같은 `output/imagegen/item-skins/` PNG를 먼저 사용하고, 스킨이 아직 로드되지 않았거나 없을 때만 기존 이모지로 폴백한다. 현재 화염(`fire`) PNG는 생성된 항목이 없으므로 화염 장비는 요청 전에 같은 장비의 `phys` PNG로 해석한다. 이 규칙은 인벤토리와 월드 드롭이 함께 사용하므로 없는 `*_fire.png` 요청과 반복 404가 발생하지 않는다. 스킨 PNG는 최초 로드 시 캔버스 캐시에 알파 마스킹한다. 기존 불투명 검정 배경 자산은 RGB 최댓값 `24` 이하를 완전 투명, `24–72` 구간을 선형 반투명으로 처리한다. **2026-09-23 `sword_phys.png`를 투명 배경 쯔바이핸더 이미지로 교체**했다: 수직 중앙 배치, 긴 양날 강철 검신과 뚜렷한 첨단, 긴 가죽 양손 손잡이, 대칭 가드·패링 돌기·폼멜, 절제된 주황 균열광. 기존 34px 월드 드롭 및 인벤토리 표시 규격은 유지한다. 아이콘 중심은 드롭 기준점에서 `x−34×0.58`(왼쪽 `19.72px`), `y−34×0.82`(위쪽 `27.88px`)로 옮겨 빛기둥의 밝은 바닥 밖, 전경에 둔다. 아이콘은 불투명도 `1`, 검정 그림자(`alpha 0.9`, blur `6px`, y-offset `2px`)로 렌더하며 별도의 사각 배경판은 사용하지 않는다. 매직 이상은 사용자가 제공한 8프레임 시트의 F3·F6 상태를 2프레임으로 정리한 `img/fx/world_item_drop_beams_source08_01.png`·`img/fx/world_item_drop_beams_source08_02.png`를 사용한다. 두 아틀라스는 **2열×2행(1254×1254), 타일당 627×627px**이며, 타일 좌표·가로 중심·바닥 기준선을 동일하게 고정해 파티클과 발광만 변하고 좌우로 흔들리지 않는다. 로더는 실제 이미지 너비÷`2`, 높이÷`2`로 타일 크기를 계산하므로 같은 2×2 형식의 다른 해상도도 올바르게 자른다. 아이템별 위상 오프셋을 포함해 `180ms`마다 두 프레임을 교대하고, 선택 타일은 마스킹 후 `lighter` 합성으로 표시한다. 효과 타일은 바닥 기준으로 가로를 기존의 절반으로 누른 `60px`, 세로는 `160px`으로 늘려 날씬한 기둥 비율로 렌더하며 투명도는 `0.41–0.51`이다. 매직은 파랑(타일 1), 레어는 보라(타일 2), 에픽·전설·유니크는 금색(타일 3)을 사용한다. 일반 장비는 빛기둥을 표시하지 않으므로 녹색 일반 타일(타일 0)은 현재 매핑에서 사용하지 않는다. 이름 라벨·기존 사각 빔·다이아몬드/속성 코어는 표시하지 않아 전투·캐릭터를 가리지 않는다.


## 2026-09-28 투명 아이템 스킨의 대체 SVG 중복 표시 방지

| 항목 | 현행 계약 |
|---|---|
| 원인 | `_itemSkin`이 PNG와 `_itemIco` SVG를 함께 생성하여 투명 PNG의 빈 부분으로 금색 대체 아이콘이 비침. 유물함 호출색 #c5b38d |
| 표시 조건 | `game.html`·`game-easy-test.html`의 `.iskin:has(>.iskin-img)>svg{visibility:hidden}`. 이미지 노드가 있는 동안 직계 대체 SVG만 숨김. PNG 알파·실제 불꽃·프레임 유지 |
| 적용 범위 | 공통 `_itemSkin`: 장비창·유물함·가방·보관함 등의 DOM 아이템 스킨. 월드 드롭 canvas 경로 변경 없음 |
| 실패 폴백 | 기존 onerror가 data-fb 물리 PNG로 1회 재시도. 재시도 중 SVG 숨김 유지. 최종 실패로 이미지 노드가 제거되면 SVG visibility가 visible로 복귀. 로딩 대기 중에도 이미지 노드가 있으므로 SVG 숨김 |
| 검증 | 실제 Chromium CSS2162×721에서 수정 전 정상 이미지17개 뒤의 SVG17개 노출로 검사 실패 → 수정 후 정상17개·노출0개 PASS. 별도 임시 DOM에서 숨김→물리 재시도 중 숨김→최종 실패 후 visible 및 이미지 제거 PASS. 임시 DOM 제거·저장 변경 없음 |
| 회귀 | 기존 `test/itemSkinFallback.test.js` 3/3 통과. PNG 경로·장착·능력치·저장·홈 클릭 판정 유지 |

## 소켓석·유물 품질 드랍 (2026-10-08 추가)

- **유물 품질 q(1~100)**: 모든 유물 드랍·제작 시 균등 롤. 효과 배율 ×(0.75+0.5×q/100). 티어 표기 1=최상~10=최하.
- **소켓석(신규 드랍 아이템, `STONE_BAG` {q:1~100})**: 장비 홈 개방(최대 5홈)·홈 품질 승급 재료. 드랍률 일반 1.5% / 정예 6% / 미니보스 12% / 장보스 25% / 챕터보스 40% (×dropBonus). 티어는 챕터 깊이 가중 `w(t)=B^(10−t)`, `B=min(0.78,0.42+0.06×SI_TO_HELL[stage])` — 1장 T10~T7 96.9%, T1 0.024%.
- **아이템 홈**: 드랍 홈 수 1~4 롤 유지, 자연 홈 품질 전부 q=1(T10,+0%) — 홈 품질은 소켓석으로만 올린다. 홈 보너스 b=(q−1)/99, 홈·유물 티어 일치(공명) 시 ×2, 최상 q100홈+1티어 유물 = 유물 효과 ×3.00.
- 상세 수치·워크드 예시: `docs/14밸런스+수치테이블/보석품질_소켓석_수치표.md`, 시스템 규칙: `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md`.
## 2026-10-16 수동 장비 갱신 캐시 보존

| 적용 위치 | 계약 |
|---|---|
| _refreshEquipmentStats | 현재 자원 보관 후 _eqAffixCache/_eqStatCache/_lEqCache를 모두 null로 만들고 기존 applyStats를 호출 |
| _lEqCache | 기존 recalcSt의 전설 캐시 무효화를 새 공통 갱신에서도 스탯 계산 전에 유지. R helper의 캐시2만 복사해 현재 main의 세 번째 캐시 계약을 잃지 않도록 통합 |
| 유지 범위 | 전설 스탯·배율·슬롯 순서·구세이브 복원·패링/공격 판정 및 _lEq 구현 변경 없음. applyStats 끝 recalcSt도 그대로 |

실제 새 helper/장착 호출부에 합성 통계 제공자를 연결해 선행 캐시3 무효화를 확인했다. 실제 전설 효과·전체 스탯식·실HP·전투·native·세이브 검증은 아니다.
## 2026-10-16 어픽스·implicit·로컬 ATK 숫자 소비

| 소비자 | 현행 동작 |
|---|---|
| _eqAffixRebuild | 각 기존 a.id별 a.value를 unary + 후 falsy0으로 합산. _eqAffix의 lazy rebuild/캐시/조회 반환 정책은 유지 |
| _eqImplicit(stat) | 기존 stat 일치 필터 아래 _implicitVal을 숫자로 소비 |
| _slotFlatAtk(it) | 기존 sharpAtk/brutalAtk/ruinAtk 세 id만 숫자 합산. 다른 id와 장비 슬롯 선택은 변경하지 않음 |
| atk/공속/빔 소비 | meleeRef/bowRef/magicRef의 슬롯 atk, statDex의 장갑 atkSpd, pBeamMul의 투구 beamDmg가 같은 숫자 소비를 적용 |
| main 전설 장갑 | statDex의 _lGloveElem 공속+0.20은 현재 main 계약 그대로. 원R 함수를 통째로 덮어 이 항목을 제거하지 않음 |
| 원 데이터 | affix/item 필드를 변환 저장하지 않음. 캐시 무효화·구세이브 복원·전설/유니크 스탯 값·판정·RNG 정책 변경 없음 |

R h179/180/181/183/191/192의 숫자 소비 변경이다. 새 Math.max·상한·finite 검사·어픽스 id/수치/확률을 추가하지 않았다. 신규8군·구문1의 합성 소형 소비자 검사이며 실제 전설/유니크 효과·피해·공격속도·스폰·전체 applyStats·실HP/native/save/창 검증은 아니다.
## 2026-10-16 자동 물약 장갑·벨트 potCd 소비

| 소비자 | 계약 |
|---|---|
| update 자동 물약 CD | 장갑 gl().potCd와 벨트 blt().potCd를 unary+ 후 falsy0으로 소비하고 기존 각 Math.min(...,0.2) 적용 |
| 원본 장비 | potCd 필드·등급·생성/저장 값은 수정하지 않음. 기존 pRegen*0.03/cap0.3 및 420f 기준 CD·최소6f·~~ 연산 유지 |
| 수동 경로 | 폐지된 useQuickslot/qsAuto UI를 되살리지 않음. h188 미채택, h237 자동 경로의 두 operand만 |
| 효과/전설 | 자동 물약의 기존 _lBeltBuff 등 효과·판정·회복/소비/RNG는 그대로. 실제 효과 검수는 이번 범위에서 실행하지 않음 |

신규6군·구문1은 actual CD 문장과 합성 입력 검사다. 전체 update·전투/회복·장비 효과·실HP/clock·native·세이브·창을 검증한 결과가 아니다.

## 2026-10-16 월드 공통 컷아웃 실패 후 phys fallback 처리 — R h174+h175

공통 _itemSkinSrc의 기존 경로 선택 계약은 유지한다. 이미 존재하는 onerror fallback으로 바뀐 이미지의 반환/마스크 경계만 수정하며, 없는 파일 경로를 새로 추측해 먼저 요청하는 정책은 추가하지 않는다.

| 항목 | 현재 main 계약 |
|---|---|
| 소유 위치 | _worldItemSkin(it)의 새 Image 생성과 공통 컷아웃 반환 guard만. 원 R h174+h175를 현재 main에 3way 연결 |
| 출처 기록 | img.src=renderSrc 직후 _worldDropCutoutSrc=cutoutSrc?img.src:''로 실제 getter 문자열 보관. 새 URL 정규화·경로 선택/추측 정책 없음 |
| 공통 컷아웃 | cutoutSrc가 있고 현재 img.src가 기록된 컷아웃 src와 같을 때만 raw image 반환. 기존 onerror로 phys fallback src가 바뀌면 기존 canvas/_maskWorldDropBlack·_worldDropMasked 캐시 경로 사용 |
| uniqueArt | 현재 main의 ||it.uniqueArt 우회를 유지. 성공 및 기존 phys fallback도 기존 방식 그대로이며 이번 단위에서 유니크 처리 정책을 수리하지 않음 |
| 보존 | 원 resolver/key/alias/bone·onload/onerror·mask 알고리즘/마스크 재사용·부트/h173·원 PNG 유지. 새 retry·migration·준비/READY 정책·asset 생성/가공 없음 |
| 검증 | 실제 helper와 own Image/Canvas/mask/resolver·자기 load/error callback 새5그룹/main inline1. own URL getter/호출 spy를 실제 browser/알파/픽셀·visualPASS로 확대하지 않음. 실제 Image/네트워크/PNG·사용자 cache/GUI/saveAPI·Native·PC 실행 없음 |


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](../engine/FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.


## 2026-10-17 ENGINE WIP: typed rand 실제 소유 경계

| 항목 | 현행 코드/한계 |
|---|---|
| actual registry | 현행 ENGINE WIP10/25·미15. 기존9 뒤 rand=Callable(self,read_normal_enemy_random_unit) 인자0을 등록했다. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](../engine/FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.


## 2026-10-17 ENGINE WIP: rand 10번째 실제 등록

| 항목 | 현재 상태 |
|---|---|
| registry | eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. 실제10/25·미15. |
| callback | 같은 Services self의 read_normal_enemy_random_unit()->Dictionary 인자0. purpose/line은인자가아니며기존Main공개getter의forwarding을재사용한다. |
| 변경 경계 | Services map literal1개만추가. 기존9/helper/owner/sharedsampler/수식/primitive/Main/World본문은그대로다. |
| 새 검수 | 등록delta static7/7, runtime0. 키10/기존9순서·sameSelf/method·0arg·typedWorld route·다른Services bytes보존·생성시추가reader/RNG/domainquery0 확인. 기존readinessguard 전체query0은미입증이다. |
| 보존/한계 | 기존30/41/95·진단/통과parse재연0. main/R·실게임·producer/V9제품copy·scalarDict직결·ENEMY TASK·Worldhook·dummy25우회0. 이전실패/범위초과이력도그대로다. |


## 2026-10-17 현재 normal hurtE el_mul 11번째 provider 등록

| id / 현재 계약 | 구현 상태와 범위 |
|---|---|
| registry / 현재 | Services.get_normal_enemy_damage_provider_callbacks의 기존 rand 다음에 "el_mul": Callable(self, "read_normal_enemy_element_multiplier") 한 entry를 추가했다. 실제 literal 등록11 / required25 중 미등록14. 과거10/미15·EL미등록 표는 해당 당시 단계 이력이며 현재값은 이 표다. |
| 원10 순서 | eq_affix, u_eq, p_atk_mul, melee_ref, parry_lesson_active, player_view, stat_str, p_dot_pool, l_eq, rand를 그대로 두고 마지막 el_mul만 추가. 기존 entry·getter guard·reader/Formula/Main 몸체와 반환·기존9+rand 부분지원 한계는 변경0. |
| self / 인자2 | 새 Callable은 동일 Services self와 read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary를 연결한다. Formula.el_mul(a:Variant,d:Variant)->Dictionary, Main 실제소유자 연결의 a,d 인자2와 raw type/reference는 그대로다. |
| 생성 / query 경계 | 새 literal Callable 생성은 reader/Formula/Main/domain/RNG를 호출하지 않는다. 기존 getmap membership/readiness guard 자체가 부수조회0이라는 주장은 하지 않는다. 새등록 확인은 정적경계1회/runtime0이며 Scriptload/QA/parse 재연0. |
| 실제 owner / fields2 | Main actual mutable EL Dictionary1 + actual Script witness WeakRef1. 초기 EL P0/F1/I2/D3/L4/H5/E6. query의 current Script는 witness actual object와 is_same; query-time 생성/재capture/ownerloss재생성·marker/latebind/Formula ELcache·map copy/publisher0. |
| 원 if / lazy 순서 | F→I,I→F,D→L,L→D,D→H,H→D,E→L,L→E 순서의 실제 EL member 조회. 첫 비교가 참일 때만 둘째를 읽고 반복 key는 재조회. 마지막 a===d일 때만 P; 정상완료2/0.5/1, eager7 snapshot/fixedpair lookup·실패1/0 fallback0. |
| 부분 strict 지원 | bool/String/null(JSnull만), safe integer native int [-9007199254740991,9007199254740991] 및 float NaN/Infinity/±0, mixed Number 관계. bool≠number/NaN!==NaN, StringName 자동String0. safe-int는 JS표현 지원경계이고 게임수치 cap이 아니다. product cast/clamp/전역finite/globaleq수정0. |
| 미지원 / raw failure | hugeint/StringName/미확정 undefined carrier/ArrayDictObject reference와 missing/inherited/getter/prototype EL 범위는 typed NOT_READY/raw type·args·실방문prefix·reference 보존/topvalue 없음. postloss fresh NR.read_result는 원ownerpacket을 수정·삭제·clone하지 않고 같은ref로 보존. retry/rollback/refund0. |
| 수명·수행 한계 | 같은Main role교체의 동일EL/newholder 별도EL·Scriptwitness/후손Tree경계/rawref는 명시holder 범위 검증이다. 원JS 선언/TDZ·Main 생성/weak구성 시점·current원EL property권위·불변/실StateResources 자연수명과 동등이라고 주장하지 않는다. legacy preTree/기존guard/getter코드 불변. |
| 소비·통합 미완 | registered11은 실제 typed consumer V11 연결이나 World fullhook 완료가 아니다. ENEMY V11 source/QA·Worldhook·미14 dummy·required25 gate 우회0. 원scalar float/default0로 Dictionary를 소비하도록 바꾸지 않았다. full25/fullhurtE·최신 실행게임/PC·전체 진행률/밸런스 완성은 미완이다. |
| 원 source 정적경계 | 원14/14는 당시 source 보존 정적검사이며 재실행0. 이후 owner WIP docs8/8도 별도 당시 문서경계로 보존. 이번에는 새 literal11/원10순서/타몸체/MainFormula불변/arity2/self·생성query0만 새정적1회/runtime0. |
| 원 first failure | 원23case/46check=45true1false/exit1/wholefalse·원decimal literal/기대0.5는 보존. 앞22case45true는 당시 증거, 재연0. 당시 formatted diagnostic을 실제floatbits로 소급하지 않는다. |
| 별도 numeric 진단 | 새숫자8측정·Variant8/typed7비교/exit0에서 이 실행의 float literal433ffffffffffffe와 converted/bitcontrol433fffffffffffff를 구별했다. 같은 represented값 비교true이며 내부parser 원인/전Godot 정확성·원실패당시bits 소급증명0. |
| 새 입력 수정·첫 미실행 경계 | 승인된 QA 입력 d=float(9007199254740991)만 별도구성, a/기대0.5/Ptrue/assertionloop 불변. 새25case74true/setup4true/exit0는 그 명시holder 범위이며 원45 재연0·서로다른 실행을 단일 wholePASS로 합산0. 제품코드수리나 지원정책변경이 아니다. |
| 역사·보호 | 원firstfailure·CRLF정규화 위반/승인prefix복원·source_* initializer 범위초과·pre-generation separator guard/UTC未 이력은 보존. 과거 무접근/wholeclean 소급0. 보호2_3/marketing/capture·MAP/ART/rig·원game.html 변경0. |
| 검색 metadata | 이번 새영향 scan은 후보929/UTF8성공751/해독제외178, matching-line649/경로114. matching snippets는 줄내dedup/cap없음이며 전체 regex발생수나 모든 binary/text 내용을 완결했다고 주장하지 않는다. 이전928/100/41 및 decode未 한계는 당시 기록으로 보존하며 소급보충하지 않는다. |


## 2026-10-17 play_time owner 소스 경계 현행

| 항목 | 상태 |
|---|---|
| 등록 | 실제 callback 12/25·미13, `play_time`은 el_mul 직후 동일 Services self의 arity0 Callable로 등록 |
| owner | Main/Services/State 신규4메서드와 Main Script weak witness 메타데이터1필드의 검증 WIP. `read_normal_enemy_play_time()` arity0, 첫 격리검수 인수됨 |
| 관측 | current native State `_g` literal `playTime` present 값 1회, pre/post 메타데이터 및 같은 G ref 확인. missing/unsupported/loss는 raw NOT_READY·top value 없음 |
| 한계 | 원JS clock·실게임 증가·V11/V12/Worldhook·main/R/실행판 반영 미확인/미인수. 당시 이전 단계 배너·숫자·QA는 이력으로 보존 |
| 상세 계약 | `docs/engine/FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_OWNER_20261017.md`의 지원범위·이름·reason·raw ref/prefix 및 12/25 등록 상태를 기준으로 함 |

## 2026-10-17 검증 WIP 소유 체크포인트

| 구분 | 인수 범위와 한계 |
|---|---|
| 소스·등록 | Main/Services/State 신규4 API와 Main Script 메타데이터1필드. 현재 callback12/25·미13, play_time은 el_mul 바로 다음 동일 Services self·arity0로 등록 |
| 분리된 증거 | 원정적17중15통과2실패 wholefalse / 이후 독립2확인 true / 첫격리34case477확인(설정163·행동314) 인수. 서로 다른 실행을 단일 전체 PASS로 소급하지 않음 |
| 값·ref 경계 | finite native int/float 부분지원, safe int ±9007199254740991은 local 표현 한계. raw-0·원type/ref/prefix와 postloss 원read_result를 보존하며 missing unknown/unsupported/loss는 top value 없는 NR. 0fallback·clone·retry·clock writer 없음 |
| 검수 한계 | 명시 fixture와 predicate probe에서의 검수. 실제 Main/State clock 존재·진행·자연수명·원JS identity·실게임·PC 인수 증거는 아님. raw-0 owner와 미래 consumer numeric0→literal+0 투영은 별개 |
| 후속 consumer | V12 후보 소스3+첫parse2 ROOT 인수. 첫11case43행동true지만 setup5중signed-zero1false·exit1 전체FAIL은 보존. 별도 보완4case19행동+setup4 true·exit0는 첫actual+0 및 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS에만 한정. 과거 실패와 합산 PASS 금지. 네 준비식 평가 뒤 public 호출 전 검사이므로 fail-fast 실제 고장주입 증명은 아님. 실제 clock/자연MainState/JS/fullgame 미확인. 제품 V12 copy·World hook 없음; callback12 등록은 이번 별도 경계 |
| 보존 단위 | 소유 브랜치 codex/native-play-time-owner-20261017. 문서의 자체 commit SHA를 선행 선언하지 않으며 실제 local/remote SHA·tree·parent·비강제 보존 결과는 아래 단위 receipt를 기준으로 확인 |

[체크포인트 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>) · [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md)


## 2026-10-17 play_time 열두 번째 provider 등록 — 현재 경계

| id / 항목 | 구현·인수 범위와 한계 |
|---|---|
| 등록 / 분모 | 실제 callback 12/25·미13. 전체 게임 이식률이 아닌 일반 적 피해 필수 provider 수 |
| key / target / arity / 순서 | play_time / Callable(self, "read_normal_enemy_play_time") / 0 / 기존11 key 순서를 유지하고 el_mul 바로 뒤에 한 entry만 추가 |
| query 경계 | 새 entry의 Callable 생성 자체는 값 query0. 기존 map getter 및 준비 guard 전체의 순수성은 인증하지 않음 |
| owner / 부분지원 | 기존 finite native int/float 지원 범위·safe int ±9007199254740991·raw-0·raw refs/prefix·NOT_READY 및 postloss 계약 유지. clock counter/writer/setter/default0 추가 없음 |
| 검수 / 분리 | 기존 owner34case477(설정163·행동314) 인수는 유지하며 재실행하지 않음. 원17 중15통과2실패·별도2true, V12 원FAIL 및 별도4case19행동+setup4 한정성공도 각각 보존. 이번 새 검수는 등록 영향 정적 경계만 |
| 소스 / 실행 | D9는 직전 공통 소스 인수이고 owner 브랜치 codex/native-play-time-owner-20261017의 이력은 보존한다. 이번 main/I/R 현재 소스 정렬은 통합 정본·receipt의 실제 HEAD·tree를 따른다. 실제 Main/State clock·자연 실행·JS 동등성·PC·최신 실행 게임은 미인수. V12 제품 copy·World hook·dummy13·25 gate 우회 없음 |
| 보존 증거 | [등록 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |


## 2026-10-17 play_time main/I/R 소스 통합 체크포인트 — 현행

| 항목 | 현재 범위와 인수 한계 |
|---|---|
| 직전 인수 / 이번 소스 | 직전 공통 인수 D9(d9b886c). owner 실제 NUL diff42(code3/docs39)에 통합 정본1을 추가한 최종 범위는 실제 union NUL·tree 목록과 아래 receipt를 기준으로 확인. main/I/R의 실제 현재 HEAD·tree·branch·upstream 및 정렬 결과도 receipt 기준 |
| 코드·provider | 인수된 Main/Services/State 코드3 그대로, callback 12/25·미13. play_time은 el_mul 직후 동일 Services self·arity0, 새entry 생성의 값 query0만 확인. 기존 getter/준비 guard 전체 순수성은 인증하지 않음 |
| 값·실패·참조 | finite native int/float 부분지원·safe int ±9007199254740991·raw-0·원 type/ref/prefix·postloss read_result·NOT_READY 계약 그대로. dummy13/25 gate 우회·clock writer/default0 추가 없음 |
| 검수 분리 | 기존 owner34case477(설정163·행동314) 인수, 원17 중15통과2실패와 별도2true는 보존. V12 후보 원11case43행동true/setup signedzero1false·exit1 전체FAIL과 별도4case19행동+setup4 true의 한정 보완은 각각 유지. 원성공 검수·parse 재실행 없음 |
| 실제 실행·보류 | 이번은 소스 정렬이다. 사용자 열린 앱·compiled export·PC 실행·실제 Main/State clock·자연 전투·JS·최신 게임 인수는 미확인. V12 제품 copy·World hook·build/reload/import/PC 전달 없음 |
| 정본 / 증거 | [FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md](../engine/FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md) · [소스 통합 final receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-MAIN-SOURCE-SYNC-20261017/receipt.json>) |
