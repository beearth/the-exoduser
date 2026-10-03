# EXODUSER — 아이템 시스템 완전 구현 프롬프트

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
// necklace: critRate = 10% (all tiers) + dmgBonus = 20+tier*20% (T0~T4 = 20/40/60/80/100%) + 전용 어픽스 2개 (critDmg/maxHP/shield/elemFocus/parryBonus)
// bracelet: def=1+tier, eDef=1+tier, bonusHp=5+tier*5
// headband: eDef=2+tier*2, mpRegen=1+tier
// 팔찌 타입: demon(부활력/부활쿨), life(HP/리젠/회복력)

// ─── 임플리싯 테이블 (슬롯 고정 1개) ───
// stat: game.html 내 P. 또는 item. 에 적용될 필드명
// val: [min, max] 롤 범위
const IMPLICIT_TABLE = {
  weapon:   {ko:'공격력 +X%',      stat:'_iAtkPct',  val:[5,15]},
  bow:      {ko:'관통 확률 +X%',   stat:'_ipierce',   val:[5,15]},
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
};

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

#### ✅ 구현 완료 (23종)

| id | 한글 | 타입 | 티어 (1/2/3) | 단위 | 슬롯 | 적용 위치 |
|---|---|---|---|---|---|---|
| poisonDot | 맹독의 | PREFIX | 8/14/22 | val | wpn | hurtE: e.poisonT 설정 |
| fireDot | 불꽃의 | PREFIX | 10/17/26 | val | wpn | hurtE: e.burnT 설정 |
| iceDot | 냉기의 | PREFIX | 7/12/18 | val | wpn | hurtE: e._iceDotT 설정 |
| lifeSteal | 피흡의 | PREFIX | 4%/7%/12% | pct | wpn,rng | hurtE: 피흡 HP 회복 |
| critChance | 광폭의 | PREFIX | 6%/10%/16% | pct | wpn,rng | statCrit() |
| critDmg | 처형의 | PREFIX | 25%/40%/65% | pct | wpn | statCritDmg() (무기 전용, 레거시) |
| atkSpeed | 쾌속의 | PREFIX | 6%/10%/16% | pct | wpn,glv | statDex() |
| maxHPFlat | 강인의 | PREFIX | 100/200/300 | val | 방어구 | statMaxHP() |
| shieldFlat | 수호의 | PREFIX | 120/200/400/600/840 | val | 장신구 | P.mshield |
| maxHPPct | 활력의 | PREFIX | 8%/14%/22% | pct | arm,nck | statMaxHP() |
| movSpd | 신속의 | PREFIX | 5%/9%/14% | pct | bts,clk | statPlayerSpeed() |
| killHeal | 회복의 | PREFIX | 8/15/25 | val | arm,rng | 적 처치 시 HP 회복 |
| fireRes | 화염수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 화염 저항 |
| iceRes | 빙결수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 빙결 저항 |
| lightRes | 암전수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 암전 저항 |
| darkRes | 암흑수호 | SUFFIX | 12%/20%/32% | pct | arm,rng,nck | 피격 시 암흑 저항 |
| poisonRes | 독수호 | SUFFIX | 10%/18%/28% | pct | arm,rng,nck | 피격 시 독 저항 |
| allRes | 전원소수호 | SUFFIX | 5%/9%/15% | pct | nck | 모든 원소 저항 추가 |
| physDR | 강철의 | SUFFIX | 6%/10%/16% | pct | arm,shd | 물리 피해 감소 |
| dropRate | 약탈의 | SUFFIX | 12%/20%/32% | pct | bts,clk | statDropBonus() |
| extraST | 사슬의 | SUFFIX | 10/20/30 | val | bts,pnt | 사슬게이지 MAX 추가 |
| stRegen | 회복의 | SUFFIX | 6%/10%/18% | pct | arm,rng,nck | ST 재생 배율 |
| dpRegen | 마력의 | SUFFIX | 6%/10%/18% | pct | hlm,nck | MP 재생 배율 |
| antiRevive | 진혼의 | SUFFIX | 4%/8%/12%/16%/20% (5티어, 고티어 극악확률 tierW:50/30/15/4/1) | pct | neck,wpn,bracelet (반지: 2/4/8/12/16%) | 보스 부활 억제 (최대20%) |
| critDmgA | 행운의 | PREFIX | 반지: 5%/10%/15%/20%/25% (5티어, tierW:40/30/20/8/2) / 목걸이: 10%/20%/30%/40%/50% | pct | ring,neck | statCritDmg() — 크리뎀 |
| critDmgB | 극대화의 | SUFFIX | 반지: 5%/10%/15%/20%/25% (5티어, tierW:40/30/20/8/2) / 목걸이: 10%/20%/30%/40%/50% | pct | ring,neck | statCritDmg() — 크리뎀 |

#### ✅ 구현 완료 (27종, 2026-03-23)

| id (코드) | 한글 | 타입 | 티어 (1/2/3) | 단위 | 슬롯 | 구현 효과 |
|---|---|---|---|---|---|---|
| lightChain | 번개의 | PREFIX | 13/22/35 | val | wpn | 피격 시 주변 적 2명에게 연쇄뎀 (반경120) |
| darkCurse | 암흑의 | PREFIX | 20%/35%/55% | prob | wpn | 확률로 저주(3초), 저주 상태 뎀+25% |
| armorPen | 관통의 | PREFIX | 8%/14%/22% | pct | wpn | eShield 추가파괴 (dmg×배율) |
| staggerBns | 파쇄의 | PREFIX | 8/14/22 | val | wpn | 포이즈 추가 감소 (고정값) |
| chainTarget | 연쇄의 | PREFIX | 1/2/3 | val | wpn | 주변 적 N명에게 30% 뎀 (반경100) |
| killSlayer | 학살의 | PREFIX | 15%/25%/40% | pct | wpn | 처치 후 3초간 뎀×(1+배율) |
| elemFocus | 원소집중의 | PREFIX | 12%/20%/32% | pct | wpn,nck | 속성 공격 시 뎀×(1+배율) |
| parryBonus | 패리의 | PREFIX | 20%/35%/55% | pct | wpn,clk | 패링 HP/ST/MP 회복량 ×(1+배율) |
| comboBoost | 콤보의 | PREFIX | 20%/35%/55% | pct | wpn | 같은 적 연속 공격 시 +5%/중첩 |
| dashBoost | 돌진의 | PREFIX | 25%/40%/65% | pct | wpn,bts | 사슬/돌진 데미지 ×(1+배율) |
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
| goldBonus | 골드의 | SUFFIX | 15%/25%/40% | pct | bts,rng | 악의 획득 ×(1+배율) |
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
| onKillExplode | 처치폭발의 | 8/14/22/32/44% | 처치 시 시체폭발 (적 최대HP×%) |
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

```javascript
// ─── 전설 특수 효과 (슬롯+무기타입별 고정 1개) ───
const LEGENDARY_SPECIAL = {
  // 무기 (wtype별)
  weapon_dagger:    {ko:'처치 시 이속 +40%(3초) + 다음 공격 크리 보장',   stat:'_lDaggerKill',  val:1},
  weapon_sword:     {ko:'5타 콤보 완성 시 데빌포스 20% 즉시 충전',          stat:'_lSwordCombo',  val:0.20},
  weapon_greatsword:{ko:'체간 파괴 시 2초 슬로우모션 + 데미지 +60%',        stat:'_lGSPosture',   val:0.60},
  weapon_spear:     {ko:'돌진 관통 타격 수만큼 데미지 +20% 중첩(최대5)',     stat:'_lSpearStack',  val:0.20},
  weapon_hammer:    {ko:'스태거 발동 시 범위 충격파 (ATK×120%)',             stat:'_lHammerShock', val:1.20},
  weapon_axe:       {ko:'출혈 대상 크리 시 잔여 DoT×300% 즉시 폭발',         stat:'_lAxeBleed',    val:3.00},
  weapon_longsword: {ko:'회전참 패턴에 장착 원소 자동 부여',                  stat:'_lLSRotate',    val:1},
  bow:              {ko:'치명타 시 추가 투사체 1발 발사',                      stat:'_lBowCrit',     val:1},
  shield:           {ko:'패리 성공 시 2초 무적 + 반격 데미지 ×2',            stat:'_lShieldParry', val:2},
  // 방어구 슬롯
  armor:    {ko:'피격 시 3초 쿨로 HP 8% 즉시 회복',                          stat:'_lArmorRegen',  val:0.08},
  helmet:   {ko:'스킬 사용 시 25% 확률로 쿨다운 미소모',                      stat:'_lHelmFree',    val:0.25},
  gloves:   {ko:'공격속도 +20% + 기본공격에 랜덤 원소 추가',                  stat:'_lGloveElem',   val:1},
  pants:    {ko:'이동 중 지속 HP 재생 (초당 HP의 1%)',                        stat:'_lPantsRegen',  val:0.01},
  boots:    {ko:'회피 직후 첫 공격 데미지 +80%',                              stat:'_lBootsEvade',  val:0.80},
  cape:     {ko:'패리 성공 시 무적 2초 부여',                                  stat:'_lCapeParry',   val:2},
  // 악세사리
  ring1:    {ko:'원소 반응 발동 시 추가 폭발 (ATK×80%)',                       stat:'_lRingElem',    val:0.80},
  ring2:    {ko:'처치 시 데빌포스 5% 회복',                                    stat:'_lRingKill',    val:0.05},
  necklace: {ko:'HP 50% 이하 시 전 스킬 쿨다운 -50%',                         stat:'_lNeckLow',     val:0.50},
  belt:     {ko:'스태미나 완전 회복 시 5초간 피해 +15%',                       stat:'_lBeltSt',      val:0.15},
};
Object.freeze(LEGENDARY_SPECIAL);
```

### 유니크 등급 (rarity=5, 2026-06-08 추가)

**등급 체계**: 일반(0) → 고급(1) → 희귀(2) → 영웅(3) → 전설(4) → **유니크(5)**

- 색상: `#ff4466` (붉은 핑크)
- RARITY_MUL: 2.5
- 어픽스 수: 7개 (전설6 +1)
- ATK 최소 보장: 50%
- 드롭 확률: 전설의 약 1/100 (극극희귀)
  - 일반몹: 0.01, 엘리트: 0.03, 미니보스: 0.1, 스테이지보스: 0.2, 챕터보스: 0.7
- 전설 특수 효과 상속 + **유니크 특수 효과 1개 추가**

```javascript
// ─── 유니크 특수 효과 (rarity=5 전용, 슬롯+무기타입별 고정 1개) ───
const UNIQUE_SPECIAL = {
  weapon_sword:    {ko:'분노의 최대치가 100% 추가된다 (200%까지)',  stat:'_uRageMax',       val:100},
  weapon_dagger:   {ko:'패링한 탄막의 관통률이 100% 추가된다',      stat:'_uDaggerPierce',  val:1.0},
  weapon_hammer:   {ko:'폭발 데미지 50% 증가',                   stat:'_uExplDmg',       val:0.50},
  weapon_axe:      {ko:'출혈 적에게 공격 시 HP 5% 흡수',           stat:'_uAxeLeech',      val:0.05},
  weapon_mace:     {ko:'적 처치 시 폭발 (최대HP의 30% AoE)',       stat:'_uMaceExplode',   val:0.30},
  weapon_club:     {ko:'적 스턴 중 데미지 ×3',                    stat:'_uClubStun',      val:3},
  bow:             {ko:'투사체 관통력 50% 증가',                   stat:'_uBowPierce',     val:0.5},
  shield:          {ko:'보호막이 탄막을 흡수하면 분노 10%를 생성',  stat:'_uShieldRage',    val:10},
  armor:           {ko:'피격 시 25% 확률로 데미지를 분노로 전환',   stat:'_uArmorRage',     val:0.25},
  helmet:          {ko:'마법 스킬 데미지 +50% + 마나 소모 -50%',   stat:'_uHelmMagic',     val:0.50},
  gloves:          {ko:'공격속도 +40%',                           stat:'_uGloveSpd',      val:0.40},
  cape:            {ko:'패링 성공 시 분노스킬 쿨다운 {s}초 회복',     stat:'_uParryRageCd',   val:30, roll:[30,60]},
};
```

> **롤링 유니크**: `cape`는 `roll:[min,max]`(프레임)을 가지는 최초의 롤링 유니크 특수효과다. 아이템 생성 시 `_uv = roll[0] + ~~(rnd*(roll[1]-roll[0]+1))` 로 30~60프레임(0.5~1.0초) 중 하나가 결정되고, `uniqueSpecial.secs=(_uv/60).toFixed(1)` 로 초 표기값을 별도 저장한다. 표시용 `ko`에는 `{s}` 플레이스홀더를 유지하고, 툴팁 렌더(`_T(it.uniqueSpecial.ko).replace('{s}',secs)`)에서 치환한다 → 번역 테이블에는 `{s}` 포함 템플릿을 등록.

> **유니크 어픽스 전체 목록·신규 후보(2026-09-30):** [유니크_어픽스_리스트.md](유니크_어픽스_리스트.md) — 현행 12종 + 신규 후보 3종(분노 충만 쿨회복 10~30초 / 전격이동 통과 약화 50~100% / 기검참 차징 피해 +50~100%, 부위 미정·미구현).

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

**헬퍼 함수**: `_uEq(stat)` — 전 장비 슬롯에서 해당 stat 값 반환 (없으면 0). 위치: `game.html:12376`

**mkItem 저장**: `item[_us.stat] = _us.val` (롤링 유니크는 `_uv`) — 유니크 특수 효과의 stat/val을 아이템 객체에 직접 프로퍼티로 저장. `_uEq()`가 `INV.equipped[slot][stat]`으로 접근. 롤링 유니크(cape)는 추가로 `uniqueSpecial.secs`(초 표기)를 저장하고 `ko`엔 `{s}` 템플릿 유지.

> **분노스킬 정의**: "분노스킬"=Space 전용 **지옥강타 1·2**(`giantSlam`/`giantSlam2`)와 `cat:'rage'` **천공쇄기**(`skyCrusher`). 쿨다운 변수는 각각 `P._gslCd`, `P._scCd`이다. `_uParryRageCd`는 활성 쿨다운 둘을 함께 차감하고, 천공쇄기는 장비와 무관한 기본 30f(0.5초) 충전 회복에 어픽스 30~60f가 추가된다. 패링은 근접(`doParry` 근접 호출)·탄막 반사(투사체당 `doParry` 호출) 모두 트리거하므로, 어픽스 추가량은 `G.frame` 기준 프레임당1회만 적용. 2026-09-10부터 물리탄은 장비 없이도 한 발마다 지옥강타 1·2와 천공쇄기에 기본30f(0.5초) 회복이 누적된다. 천공쇄기 기존 기본30f와 중복 합산하지 않으며 비물리 패링 기본30f는 프레임당1회 유지.

**스테이지 리셋 변수**: `P._uReviveUsed`, `P._uInvisT` — 스테이지 시작 시 false/0으로 초기화.

---

## STEP 3. mkItem() 함수 업그레이드

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

  // 티어 결정: 등급 기반 + 200렙당 +1 (5티어 어픽스 해금용)
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

  // ── 전설 특수 효과 ──
  item.legendarySpecial = null;
  if(rarity >= 4){
    const _lsKey = (slot === 'weapon' && item.wtype) ? 'weapon_' + item.wtype : slot;
    const _ls = LEGENDARY_SPECIAL[_lsKey] || LEGENDARY_SPECIAL[slot];
    if(_ls) item.legendarySpecial = {ko: _ls.ko, stat: _ls.stat, val: _ls.val};
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
  // 전설 특수
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

### 등급 결정 방식
가중치 합산 후 `Math.random() × total`로 균일 롤.
기존 레벨 보정/엘리트 보정은 제거 — 몹 분류 자체가 보정 역할.

### 픽업 방식 (v2)
- **모든 아이템**: R키 수동 수거 (악의/물약/장비 전부)
- **펫 자동수거**: 제거됨 (2026-05-01)

### 빔 라이트
매직(1) 이상 등급 아이템에 수직 빔 표시. RARITY_C 색상 사용.
두께: 매직 2px, 레어 3px, 에픽 4px, 레전드 6px + 펄스.

```javascript
// (참고용 — 실제 코드는 game.html line ~20590)
// 기존 spawnDrop() 제거됨. 인라인 가중치 드롭으로 교체.


function _spawnOneItem(e, rar){
  // 슬롯 결정 — 보스/레어는 무기 편향
  var _sl;
  if(rar >= 3 && Math.random() < 0.35){
    _sl = Math.random() < 0.6 ? 'weapon' : 'bow';
  } else {
    _sl = SLOT_NAMES[~~(Math.random() * SLOT_NAMES.length)];
  }

  // 원소 결정 — 현재 지옥 속성 편향 50%
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
    ↓ 등급/슬롯/원소 결정
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

2026-09-10 로컬 Chrome에서 실제 `rollDrop`/`mkItem`을 초기 레벨1로 실행했다. 조건당 일반몹1000회, 무필터 장비437개, 매직 이상 필터178개, 레어 이상 필터54개, 최소 줍기 티어2(reqLv100 하한)에서는0개였다. 각 조건은 별도 연속 난수 구간이라 부분집합 비교가 아니다. 유골·결정은 이 장비 통계에서 제외했고 pageerror0. 실제 사용자 필터값은 미확인이므로 이 결과로 사용자 원인을 확정하지 않는다. 증거: `captures/renderer_optin_20260910/early-loot-audit.json`. 확률·필터·픽업 제품 코드는 변경하지 않았다.

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

### 이미지 경로 폴백 (2026-10-01 현재 구현)

인벤토리 `_itemSkin(it, sz, col)`과 월드 드롭 `_worldItemSkin(it)`은 `_itemSkinSrc(base, el)`로 일반/물리 PNG 경로를 만든다. 본편은 아래 14종 컷아웃을 우선 요청하고 실패하면 물리 PNG로 폴백한다. 쉬운판에는 컷아웃 분기가 없다. 알려진 누락 속성은 요청 전에 물리 경로로 치환하며, 예기치 않은 로드 실패는 `onerror`로 회복한다.

| 항목 | 현재 값 | 적용 위치 | 목적 |
|---|---|---|---|
| 사전 치환 목록 | 모든 `fire`, `necklace_fire`, `cape_fire`, `earring_fire`, `ossuary_ice/dark/light/holy/earth` → 같은 슬롯 `phys` | `_itemSkinSrc` | 누락 파일 요청 및 반복 404 차단 |
| 그 외 속성 (유골 제외) | `base + '_' + el + '.png'` | 인벤토리·월드 공통 | 실제 생성된 속성 스킨 유지 |
| 유니크 접미사 | 사용 안 함 (`*_uniq.png` 에셋 없음) | 인벤토리·월드 공통 | 존재하지 않는 유니크 이미지 요청 차단 |
| 유골 부위 | `bone_{part}.png` (속성 접미사 없음) | `_itemSkinSrc` | 부위 원화 유지 |
| 최종 표시 폴백 | 인벤토리 SVG / 월드 기존 아이콘 | 두 경로 로드 실패 시 | 아이템 식별성 유지 |

따라서 `necklace_fire.png`, `cape_fire.png`, `earring_fire.png` 및 임의의 `*_uniq.png`는 브라우저 요청 목록에 나타나지 않아야 한다. 이 표가 아래의 이전 화염 PNG 일반 서술보다 우선한다.

### 투명 원화 우선 경로 (2026-09-28)

정사각 배경이 포함된 속성 PNG를 그대로 카드와 월드 드롭에 올리지 않는다. `_ITEM_CUTOUT_BASES`에 등록된 장비군은 `img/ui/item-cutouts/{base}_phys_cutout.png`를 우선 사용하며, 해당 파일 로드가 실패했을 때만 기존 `output/imagegen/item-skins/`의 물리 PNG로 되돌아간다. 실제로 로드에 성공한 컷아웃만 월드 드롭의 `_maskWorldDropBlack` 밝기 마스킹을 생략한다. 최초 할당 뒤 정규화된 `img.src`를 `_worldDropCutoutSrc`에 저장하고 현재 `img.src`와 일치할 때만 원본 Image를 반환한다. 실패 후 물리 PNG는 기존 24/72 마스크를 한 번 생성해 `_worldDropMasked`로 재사용한다. `onload`와 폴백 시작은 캐시를 무효화하며, 로딩 중 또는 양쪽 실패는 `null`이다. 쉬운판은 성공한 일반 PNG를 마스킹하는 기존 구조를 유지한다.

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

장비 드롭은 본편 14종의 투명 컷아웃을 우선 사용하고 그 외 장비와 쉬운판은 `output/imagegen/item-skins/` PNG를 사용한다. 스킨이 아직 로드되지 않았거나 없을 때만 기존 이모지로 폴백한다. 현재 화염(`fire`) PNG는 생성된 항목이 없으므로 화염 장비는 요청 전에 같은 장비의 `phys` PNG로 해석한다. 이 규칙은 인벤토리와 월드 드롭이 함께 사용하므로 없는 `*_fire.png` 요청과 반복 404가 발생하지 않는다. 컷아웃이 아닌 실제 로드 성공 PNG는 첫 사용 시 캔버스 캐시에 알파 마스킹한다. 기존 불투명 검정 배경 자산은 RGB 최댓값 `24` 이하를 완전 투명, `24–72` 구간을 선형 반투명으로 처리한다. **2026-09-23 `sword_phys.png`를 투명 배경 쯔바이핸더 이미지로 교체**했다: 수직 중앙 배치, 긴 양날 강철 검신과 뚜렷한 첨단, 긴 가죽 양손 손잡이, 대칭 가드·패링 돌기·폼멜, 절제된 주황 균열광. 기존 34px 월드 드롭 및 인벤토리 표시 규격은 유지한다. 아이콘 중심은 드롭 기준점에서 `x−34×0.58`(왼쪽 `19.72px`), `y−34×0.82`(위쪽 `27.88px`)로 옮겨 빛기둥의 밝은 바닥 밖, 전경에 둔다. 아이콘은 불투명도 `1`, 검정 그림자(`alpha 0.9`, blur `6px`, y-offset `2px`)로 렌더하며 별도의 사각 배경판은 사용하지 않는다. 매직 이상은 사용자가 제공한 8프레임 시트의 F3·F6 상태를 2프레임으로 정리한 `img/fx/world_item_drop_beams_source08_01.png`·`img/fx/world_item_drop_beams_source08_02.png`를 사용한다. 두 아틀라스는 **2열×2행(1254×1254), 타일당 627×627px**이며, 타일 좌표·가로 중심·바닥 기준선을 동일하게 고정해 파티클과 발광만 변하고 좌우로 흔들리지 않는다. 로더는 실제 이미지 너비÷`2`, 높이÷`2`로 타일 크기를 계산하므로 같은 2×2 형식의 다른 해상도도 올바르게 자른다. 아이템별 위상 오프셋을 포함해 `180ms`마다 두 프레임을 교대하고, 선택 타일은 마스킹 후 `lighter` 합성으로 표시한다. 효과 타일은 바닥 기준으로 가로를 기존의 절반으로 누른 `60px`, 세로는 `160px`으로 늘려 날씬한 기둥 비율로 렌더하며 투명도는 `0.41–0.51`이다. 매직은 파랑(타일 1), 레어는 보라(타일 2), 에픽·전설·유니크는 금색(타일 3)을 사용한다. 일반 장비는 빛기둥을 표시하지 않으므로 녹색 일반 타일(타일 0)은 현재 매핑에서 사용하지 않는다. 이름 라벨·기존 사각 빔·다이아몬드/속성 코어는 표시하지 않아 전투·캐릭터를 가리지 않는다.


## 2026-09-28 투명 아이템 스킨의 대체 SVG 중복 표시 방지

| 항목 | 현행 계약 |
|---|---|
| 원인 | `_itemSkin`이 PNG와 `_itemIco` SVG를 함께 생성하여 투명 PNG의 빈 부분으로 금색 대체 아이콘이 비침. 보석함 호출색 #c5b38d |
| 표시 조건 | `game.html`·`game-easy-test.html`의 `.iskin:has(>.iskin-img)>svg{visibility:hidden}`. 이미지 노드가 있는 동안 직계 대체 SVG만 숨김. PNG 알파·실제 불꽃·프레임 유지 |
| 적용 범위 | 공통 `_itemSkin`: 장비창·보석함·가방·보관함 등의 DOM 아이템 스킨. 월드 드롭 canvas 경로 변경 없음 |
| 실패 폴백 | 기존 onerror가 data-fb 물리 PNG로 1회 재시도. 재시도 중 SVG 숨김 유지. 최종 실패로 이미지 노드가 제거되면 SVG visibility가 visible로 복귀. 로딩 대기 중에도 이미지 노드가 있으므로 SVG 숨김 |
| 검증 | 실제 Chromium CSS2162×721에서 수정 전 정상 이미지17개 뒤의 SVG17개 노출로 검사 실패 → 수정 후 정상17개·노출0개 PASS. 별도 임시 DOM에서 숨김→물리 재시도 중 숨김→최종 실패 후 visible 및 이미지 제거 PASS. 임시 DOM 제거·저장 변경 없음 |
| 회귀 | 기존 `test/itemSkinFallback.test.js` 3/3 통과. PNG 경로·장착·능력치·저장·홈 클릭 판정 유지 |


### 2026-10-01 — QA-B01 월드 스킨 첫 가공 진단 / 후보 기각

기준 정상 전투의 실제 dagger_phys 256² 첫 처리99.1ms 중 getImageData98.4ms, 읽기→쓰기 구간0.4ms, put0.1ms를 분리했다. 실제src/currentSrc·아이템ID·캐시객체를 기록했으며 과거repeater/hammer86.7/136.5ms 귀속은 여전히 시간상관 후보다. 최초2D컨텍스트 willReadFrequently 힌트는 137원화/40,958,608바이트0diff·폴백/재사용을 통과하고 정상후보 ring2종 read각0.4ms였으나, 별도동일repeater 최초draw41.4ms/총47.9ms(기준총9.8ms)로 늘어 **기각·생산 한 줄 원복**했다. 전체개선율/QA-B01완료 아님. 실제로드이벤트가 따뜻한캐시의앞선마스크를무효화하는별도사례도보존. 전스킨준비0·최종게임SHA원본동일·쉬운판/저장/전투불변. 다음은첫draw와read를함께줄이는좁은후보검증. [진단·기각근거·원자료](../0마스터플랜/mac-resume-20261001/Mac-아이템스킨-첫가공-검수.md).


### 2026-10-01 — QA-B01 두 스킨 부트 준비 제한 채택

본편은 `dagger_phys`·`repeater_phys` 두 256² 스킨을 렌더러 전에 기존 캐시와 원래 마스킹으로 준비한다. 협력적 예산 250ms, 신규 요청 최대 2개, 최종 Canvas 명목 512KiB다. 기존 캐시는 건너뛰며 로드 뒤 취소·epoch·소스를 검사한다. 실패·시간 초과 시 원래 lazy/null/컷아웃 폴백을 유지한다. `willReadFrequently`는 적용하지 않았다.

실제 준비 37.6ms(가공 합2.8/max1.6), 별도 후속 검사 1.2ms로 합38.8ms는 기준34.4ms보다 크다. **보편적 총비용·FPS 개선은 미입증**이며 두 스킨의 첫 가공을 부트로 이동한 범위만 채택했다. v3 진단10.9/7.6ms와 실패한 앞 시도도 모두 보존했다. 실제 월드 fixture846호출에서 추가 마스크0·동일 Canvas, 524288바이트 비교0diff, R획득 가방10→12 및 저장 재로드를 확인했다. 정상 전투13.096초/7처치/자연사에서는 대상 드롭0이며 다른 스킨91/97.4/104.6ms가 남는다.

회귀38개·guard·6inline 검사 PASS. 기존22경로·PC/3333·VSCode를 보존했고 easy·패키지는 미적용이다. [구현·모든 시도·원자료·한계](../0마스터플랜/mac-resume-20261001/Mac-아이템스킨-두종-부트준비-검수.md).


### 2026-10-01 — ring_phys 사전 마스크 PNG 진단 완료 / 생산 미반영

원래24/72마스크 Canvas를그대로 PNG화한 반지 후보는256² 및34² RGBA·알파0diff, 실제34px월드fixture 각987회 표시·소스교체/404/null계약을 통과했다. 관측기 없는3쌍의 요청→최초제출 반환 중앙값은 기존9.9ms/PNG4.9ms로 유망하다. 실제 화면표시·GPU완료/FPS·자연전투97.4ms 해결을 뜻하지 않는다. 추가6쌍은 기존경로에만 세부관측기가 있어 단계귀속자료로 분리했고 재접속diff5→10도 기록했다.

파일은52,346→69,119바이트(+32.0%), 제작22.2ms, PNG최초제출 호출은오히려0.6–1.3ms로증가했다. 부트준비확장0·생산/easy/원화변경0. 기존컷아웃없음, 기존20/70+crop도구는비동등하여미사용. 새7+기존13회귀20PASS. 다음제안은 `_worldItemSkin`의물리ring분기만PNG선택하고기존폴백을유지하는한건이며 아직적용하지않았다. [출처·원자료·한계·최소제안](../0마스터플랜/mac-resume-20261001/Mac-반지-PNG-재사용-진단.md).


## 2026-10-03 source21 — 드롭 상한의 미개봉 상자 보존 우선순위

| 항목 | 현행 코드 / 완료 경계 |
|---|---|
| 실제 누락 경로 | 실제 보스 보상 producer `_wiPush({x:cx,y:cy,type:'chest',picked:false,opened:false})`가 worldItems 장비20개에 상자를 추가하면 기존 nonitem rank−1 때문에 상자 자체를 즉시 제거. 기존 상자도 이후 장비 드롭/GC 초과 정리에서 먼저 제거되어 정상 개봉 입력이 대상을 찾지 못함 |
| 최소 적용4 | 본편/Easy 각각 `_wiPush` 및 주기GC의 rank식에 `type==='chest'&&!picked&&!opened ? Infinity : 기존식` 추가. 각파일+168B, 총4접점. 원래 배열·동일 객체/좌표/소비flag·swap-remove 순서·20상한 유지. rank순서만 미개봉·미소비 상자를 뒤로 이동 |
| 축출 계약 | 미개봉·미소비 chest Infinity, item은 기존 item.rarity\|\|0(없으면0), 열린/소비상자 및 hp/debris/o2bubble/mat/potion 등 다른 비장비는 기존−1. 최소rank 먼저, 같은rank는 첫 인덱스. 모두 Infinity면 기존 mi0 fallback으로 첫 인덱스를 제거해20개로 수렴. 무한/절대 상자보존이나20개 상한 확대가 아님 |
| 개봉·보상 | 실제 개봉lane의 거리<60/opened guard/동기 opened=true→장비3~5개 생성/악의5+floor(stage×2)/HP물약2/같은frame상자1개 break 유지. 원래 RNG·rarity확률·장비공식·자동/R/펫·가방/저장 변경0. 정상빈필드3/4/5생산·동일상자1회소비와 경계거리60을 actual lane으로 확인 |
| 별도 상한 경계 | 개봉 뒤 상자는 기존 비장비로 제거 가능. 장비 보상은 계속 공유20상한과 기존rarity축출 적용: 근상한에서는 새 저등급보상이 제거될 수 있으며 생성3~5개가 모두 바닥에 보존/가방 지급된다는 보장은 없음. 직접가방지급·보상면제·picked선행정리·상한 변경은 이번 적용0 |
| 회귀 | test/worldChestEviction.test.cjs: 양판5그룹씩10PASS, baseline source20 6PASS/4FAIL(생성push/GC 상자보존 각판2RED), 정상3그룹씩6은 양쪽동일PASS. 장비/비장비 swap 순서·드롭음향/preview·opened/picked·모두chest35개 상한수렴·실제개봉lane 검사. 초기가상VM배열prototype fixture실패2는 하니스 정정 후 정상, 게임실패로 계산0 |
| 보스/문법 | 실제 bossRespawnFieldState34PASS로 기존 필드/문/적/아이템 복귀 계약 유지. 양판 AST 파싱 JS12/JSON2, 별도 본편 inline syntax1PASS. 새검사10+보스34=44PASS와 별도syntax1을 구분. 잘못 기입한 .cjs syntax 경로는 체크0, 실제 .js 실행으로 정정 |
| 검수 한계 | 실제 `_wiPush` 전체함수·GC 선택lane·상자생성문장·개봉lane을 isolated VM에서 실행. 완전한 hurtE 보스승리/전체update·정상native키/픽셀·가방획득/실저장·청취는 fixture 검사가 수행하지 않음. item factory·거리입력·음향/UI·RNG 고정은 대역. source21 패키지3396 포장·타이틀·HTTP200 확인, 실제 native 인수0, source20/3395 앱 및 이전 사용자 게임/세이브 보존 |
| 원자료 | tmp/mac-migration-runtime/continued-review-20261003/root-chest-preservation-source21/{before-receipt.json,code-applied-receipt.json,candidate-test.txt,baseline-test.txt,production-test-receipt.json,syntax-test.txt}. 초기fixture 오류 및 각실패/한계 보존, inverse patch source20 byte-exact |


## 2026-10-03 source31 실제 옵션 합산 경계

아래 표는 위 생성·프롬프트 예제와 구분되는 현행 런타임 합산 계약이다. 옵션 생성 수치·확률·티어·슬롯·반올림과 저장 필드를 바꾸지 않았다.

| 함수 / 값 | 현행 합산 | 적용 |
|---|---|---|
| _eqAffixRebuild / a.value | 기존 id 누적합 + (+a.value||0) | 슬롯 간 같은 ID 숫자합. 숫자문자열 변환, 비숫자/undefined/NaN 항목0; 정상 음수·소수 보존 |
| _slotFlatAtk / sharpAtk·brutalAtk·ruinAtk | s+=(+a.value||0) | 무기 직접 합산. _eqAffixCache 비경유; meleeRef/bowRef/magicRef 모두 소비. 다른 ID 제외 |
| _eqImplicit / it._implicitVal | v+=(+it._implicitVal||0) | 같은 _implicitStat의 슬롯 간 숫자합. flat HP 및 비율/속도 소비 입력 |
| 경계 | 실제 INV 내용/저장 schema 변경0 | Infinity·객체 변환·손상 배열 원소·atk/enh/bonusHp·PASSIVES/STATS는 별도 미채택 범위 |

정상 [5,3,2]→10과 signed/decimal 합산은 보존하며, [5,"9",3]은17, [5,"ab",3]은8이다. 비숫자 한 항목이 정상 옵션의 누적합까지 문자열로 오염시키지 않는다. source31 양판 각+18B/전체 역치환 exact, 신규30+피해 회귀4=생산34PASS·inlineJS12/importmap2PASS. 전체 applyStats·실세이브·native·완주·청취 통과로 계산하지 않는다. [정확한 소비 대조·핀·QA 완료ID](../15%20세이브+데이터구조/15%20세이브+데이터구조.md#2026-10-03-source31-장비-옵션-숫자-합산)를 따른다.


## 2026-10-03 source33 상세 어픽스 퍼센트 정밀도

| id / 소비자 | 현행 표시 계약 | 적용 범위 |
|---|---|---|
| _affixDetailValStr(af) | AFFIX_POOL의 첫 일치 id를 조회. unit=pct/prob 및 typeof value=number && Number.isFinite(value)에만 v=Math.round(value*10000)/100 | 인벤토리 상세의 _invCardFields 어픽스 값 호출1개 |
| 부호 / 단위 | (v>0?'+':'')+(Object.is(v,-0)?0:v)+'%' | 소수 최대2자리, 불필요한 뒤0 없음 |
| -.005 / 0 / .005 / .12 | -0.5% / 0% / +0.5% / +12% | 이전 -.005→0%, .005→+0% 정수절삭을 상세에서 복구 |
| fallback | pct/prob 이외 또는 비숫자·NaN·Infinity·누락·null·unknown id는 기존 _affixValStr(af) 호출 | 손상값 normalization·기존 다른 단위 포맷 변경0 |
| _affixValStr | 기존 공용 함수 원문 유지 | 리롤/공용 포맷 소비자 유지. 비교 포맷 후보 ITEM0658은 이번 미채택 |
| 효과 / 값 | af.value·생성 수치·tiers·장착·저장·_eqAffixRebuild·_slotFlatAtk 변경0 | 표시만 변경. 값×100 후 표시 자릿수 반올림이며 전투 수치를 반올림하지 않음 |

예: armorPen 등 pct 항목에 value=.005를 공급하면 상세 HTML의 +0%를 +0.5%로 표시한다. 모든 옵션에 .005를 생성한다는 뜻은 아니다. 기존 AFFIX_POOL404항목/402고유id의 순서·중복·단위 정의는 그대로이며 각항목의 6개 통제 값(-.125,-.005,0,.005,.125,.12)×양판=4,848 상세 HTML 대조 및 fallback7개×양판=14를 합쳐4,862대조 PASS다. 동일 helper는 첫 일치 pool 정의를 그대로 사용한다.

전체 _invCardFields를 실행해 armor의 DEF/eDEF·enh37·bStr5와 어픽스 이름/색/설명 마크업이 값 문자열 외에는 동일함을 확인했다. _invBuildCompare/renderForge/equipItem/rerollAffixes 및 장비 집계 함수 원문도 byte 등가다. _T/_L·강화 표시 leaf는 통제 대역이며 전체 인벤토리 이벤트/DOM·실장착·저장·native 픽셀/접근성 검증은 실행하지 않았다. 정규 게임 언어별 실제 표시 가독성은 별도 Gate다.

양판 각+309B; source33 game.html4035493B/SHA256 76c4886e4b9d61a79fcd785be88cedf7fcade86901cb44864cd3ab73777a5bd0, easy3913162B/SHA256 021b6339a8aee08d329b8e8913fa058d4100883dc781febf9f2a85f4d1c8b65e. 전체 역변환 원문exact·inlineJS12/importmap2 PASS. 백업/후보/전체 상세 대조/원격 exact 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source33-affix-detail/에 보존한다. 근거 SUPERVISOR-ITEM-0653 완료msg_0dc2542c5744bc89016ac0a6e24fc087d081bf4d80ddd34cf4(2026-10-03T06:55:34.910Z), source31 원자료를 root source32에서 재검증했다.


## 2026-10-03 source34 비교 어픽스의 퍼센트포인트 단위

| 경계 | 현행 계약 / 수치 |
|---|---|
| _affixDeltaStr(id,diff) | AFFIX_POOL의 첫 id 일치 정의가 pct/prob이면 n=Number((diff*100).toFixed(2)); (n>0?'+':'')+(Object.is(n,-0)?0:n)+'%p' |
| _invBuildCompare | 어픽스 수치 차이의 값 템플릿1개만 helper로 치환. 차이는 기존 nv-ov 그대로, 비율의 상대증가율로 재계산하지 않음 |
| 예: .12−.10 | 기존+0.020 → +2%p. 12%와10%의 절대 퍼센트포인트 차이이며 상대+20%와 구분 |
| 예: .08−.10 | 기존-0.020 → -2%p. 기존 적색 유지 |
| 숨김 | Math.abs(diff)>0.0001인 기존 게이트 유지. 동일 값·0 차이 수치 행은 계속 숨김 |
| 다른 단위 / 미등록 id | (diff>0?'+':'')+(diff<1&&diff>-1?diff.toFixed(3):diff) 기존 값 포맷 유지. atk/hp/dps 확장 후보 미채택; 큰 일반 수치의 자릿수를 새로 절삭하지 않음 |
| 부호 / 소수 | pct/prob는 표시 소수 최대2자리, 뒤0 제거·-0→0. 표시 반올림은 af.value나 전투 값을 변경하지 않음 |

source33의 상세 _affixDetailValStr와 공용 _affixValStr는 원문 그대로다. 신규/소실 어픽스의 이름 행, 중복 id 합산·정상값 차이, 비교색·강화 이전 비용/차단 문구·현재 장비 카드·CP 계산 호출을 바꾸지 않았다. 원래 비교 집계의 손상 문자열 처리 등 전체 입력 정규화는 이번 범위 밖이다.

root는 실제 전체 _invBuildCompare와 실제 전체 _invCardFields(source33)를 함께 실행했다. 기존 AFFIX_POOL404항목/402고유id에서 양수·음수·동일·0·중복합산5상태×양판=4,040회 및 unknown-unit 자릿수 fallback3×양판=6을 합쳐4,046 markup/값 대조 PASS. pct/prob에서 값 문자열 외 diffs HTML 등가, 다른 단위에서 전체 diffs 등가, 현재장비 eqCard 전체 등가·아이템 원본불변을 확인했다. CP: +50/강화+37/370악의 안내는 통제 CP·강화비용 leaf 입력에서 같게 유지됐다. 실제 calcCP/가상장착/강화 이전은 실행하지 않았고 해당 원문 함수 등가만 확인했다. _T/_L·강화수치 leaf 대역이며 네이티브 DOM/실입력/장착·저장·언어별 가독성 인수0이다.

근거 SUPERVISOR-ITEM-0658 완료msg_0dc2542c5744bc89016ac0a804244087d099b2b7f26de965cf/source31 원자료를 root source33에 재검증. 원 후보의 atk/hp/dps·일반 수치 반올림 확장까지 일괄 채택하지 않고 pct/prob 단위만 채택했다. 양판 각+263B, 전체역변환 source33 exact·inlineJS12/importmap2 PASS. main4035756B/SHA256 c18217d0490db64eb8349afc15d66b5b8a71492b90f9fa120a3149fd57dd8122; easy3913425B/SHA256 db05f518a6c7aef714f8b7575b245e59b10a9a5f7c8831ff06e3b7d10314d592. 백업·원자료·전체비교 probe·후보/영수증은 tmp/mac-migration-runtime/continued-review-20261003/source34-affix-compare/.


## 2026-10-03 source40 — 목걸이 직접 경험치 보너스 숫자 경계

| id / 적용 위치 | 현행 처리·수치 | 보존·검수 경계 |
|---|---|---|
| XP40-DIRECT / 양판 addExp(v,trans) | const eb=+nc().expBonus\|\|0; 이후 기존 eb>0이면 v=~~(v*(1+eb)) | 양판 각1정확치환/+1B. 직접 필드는 삭제하지 않고 소비 시 숫자로 변환. 비숫자/undefined 등 NaN 결과는0; Infinity를 제한하는 유한성 검사 아님 |
| 기존 보상 순서 | !trans에서 v=~~(v/3) → 목걸이 직접 양수 보너스 → _eqAffix('expBonus') 양수 보너스 각각 ~~ 정수화 → P.exp 누적 → 기존 레벨 루프 | 어픽스/생성 수치·비용·상한·성장 공식/20% 자원 회복·SP3/짝수레벨AP1·효과/저장 순서 불변. source31 캐시 합산과 독립된 직접 reader |
| 저장·장착 도달 | 전체 dbRestore는 inv.equipped/bag 아이템의 직접 expBonus 필드를 보존. 가방 목걸이 전체 equipItem→nc→전체 addExp에서 동일 reader 도달 | 실제 dbSave payload도 필드를 그대로 보관하며 isolated JSON 왕복 후 재복원. 저장 schema·아이템 필드/마이그레이션 수정0; 사용자 저장·실제 DB 접근0 |
| 생성 범위 | 현행 mkItem 목걸이 베이스에 직접 expBonus 없음. 경험의는 affixes의 expBonus로 생성 | 원 후보는 crafted/legacy 직접 필드 문자열의 처리 경계. 정상 생성 아이템 전체의 XP가 부풀었다는 주장0; 과거 legacy 실제 보유 사용자나 발생 빈도 미확인. 기존 직접 numeric 필드 호환 때문에 reader 삭제0 |
| 오류 대조 / 합성 XP 입력 | addExp(900), 직접0.5: 기존·신규450. 직접 문자열0.5: 기존3150 → 신규450 | 기존 1+문자열은10.5 연결, 신규1+숫자는1.5. 원보상900/3=300; 실제 드롭/처치 XP 생산자·native 플레이 재현 아님 |
| 조합·성장 대조 | 합성 addExp(905)/직접0.5/affix0.1:301→451→496. 문자열은 숫자 대응과 동일. 합성 maxExp400, lv1에서 addExp900: lv4/SP9/AP2 및 levelup·saveForce 각1회 | maxExp400은 fixture 값이며 설계 상수 아님. 기존 전체 레벨 루프·_calcMaxExp를 실행. applyStats/예약투자/효과/저장 요청 leaf는 대역; 정상 성장 계산 인접 회귀도 별도 실행 |
| 정상·호환 | 숫자0.5/0.125·0·음수·missing/null/빈문자열/공백/비숫자의 전체 P/효과 sink 동등. equipped 및 bag→equip 두 경로, 직접+affix/레벨업/demo·trans bypass/JSON 왕복 확인 | 양판 신규48PASS. 원본38PASS/10 assertion FAIL은 같은 문자열 연결 결함 조건별 대조이며10개 독립 결함 아님. 초기 검사 조립 오류(모듈/async/양판 helper 차이)는 제품 결함으로 계산0 |
| 남은 범위 | critRate 과소·무크리를 benign이라고 단정한 QA 원문은 채택하지 않음. 손상값 전체 정규화·비유한·기타 장신구 직접 reader는 별도 검수 | 크리/피해/패링/맵/보스문·필드몬스터·부활 정책 변경0. 전체 게임/시각·청취/native 인수0 |
| 실행본 | production 소스40 적용, 현재 격리 앱source29/3404에 미포함 | 새 빌드·reload·앱 조작·사용자 save 변경0. CH1-1 같은후보6단계/보스사망·부활·재도전 미인수 유지 |

원 후보 QA0834 completion 5fb458c3-3b53-4bbd-a5d0-117ff7fd79d6 (source37 조사)를 root source39 위에서 재검증했다. 원본·후보·초기 harness 오류·정상 대조·docs전체 expBonus/addExp/경험치 키워드 검색·양판 HTML 정확 역치환·보호67경로 hash·scope8 Git/원격 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source40-necklace-experience/에 보존한다. 제작팀 TASK와 과거 소스/완료 핀은 덮어쓰지 않는다.

최종 생산 검수: 신규 목걸이 소비48 + 기존 레벨업·예약 패시브 자원 회귀17 =65 PASS/0 FAIL. 신규 검사는 양판 inline JS12/importmap JSON2 구문을 확인했다. 초기 문서 전달 문자열 quoting 오류는 적용 전 발생했고, 그 사이 실행된 미적용 source39 대조도 production-before-apply.tap으로 보존했다. 해당 실패나 검사 조립 오류를 신규 게임 결함·수정 완료로 계산하지 않는다.


## 2026-10-03 source41 — 장신구 직접 피해 보너스 숫자 합산

| id / 적용 위치 | 현행 처리·수치 | 보존·검수 경계 |
|---|---|---|
| DMG41-ACC / 전체 hurtE | 직접 dmgBonus 각 항을 (+값\|\|0)으로 더한 뒤 기존 합×0.01. 양수 합이면 dmg=~~(dmg*(1+_accDmg)) | 본편7항/+7B, Easy6항/+6B, 각1정확치환. QA0842의 양판7항/+7B 전제를 실제 함수로 정정 |
| 참여 슬롯 | 본편: necklace/ring1/ring2/belt/bracelet/headband/headband2. Easy: 앞6칸 | 기존 Easy headband2 미참여를 새로 확대하지 않음. 목걸이·반지 실제 nc/rg1/rg2 reader 사용. 장비 생성·강화·어픽스 수치·슬롯 정책 변경0 |
| 숫자 경계 | 숫자문자열은 숫자로 더하고 비숫자/undefined 등 unary+가 NaN인 항은0. 기존 정상 숫자·signed/fraction 의미 보존 | 비숫자 한 항 때문에 나머지 정상 항까지 NaN/문자열로 손실되지 않음. Infinity를 제한하는 유한성·저장 전체 정규화는 아님 |
| 기존 피해 순서 | STR/원소·선행 조건 처리 뒤 장신구 합을 적용하고, 후속 조건·최소피해·타입별 보너스·crit/빙결·쉴드 흡수·HP/DPS 처리 유지 | 일반·화살·beam·dot 통제 경로에서 전체 hurtE 실행. 원래 ~~ signed32-bit 정수화와 최소피해1도 실행하며 별도 clamp/새 제한 추가0. 적 AI·공격 생성/전체 update는 미실행 |
| 저장·장착 도달 | 전체 dbRestore는 equipped/bag의 직접 필드를 유지. 전체 equipItem으로 가방 목걸이를 장착한 뒤 전체 hurtE까지 도달 | 실제 dbSave payload를 isolated JSON 왕복해 raw 문자열 보존과 재계산 확인. schema/마이그레이션·사용자 저장·실제 네트워크 DB 접근0 |
| 생성·오류 대조 | 현행 mkItem 장신구 베이스는 숫자 dmgBonus 생성. crafted/복원 문자열이 같은 reader에서 문제 | 실제 사용자 손상 빈도 미확인. 합성 입력dmg1000/7칸10에서 정상1700. 목걸이만 문자열10인 원본 HP감소1060143772 → 신규1700; 실제 캐릭터 피해 수치·native 처치 증거 아님 |
| 조건별 검수 | 각 참여 슬롯 숫자문자열10/비숫자ab, 다른 칸 정상10 합산; 기본 숫자·음수·소수·missing/null/빈문자열·공백의 전체 P/INV/G/적/효과 sink 원본동등 | 신규 양판44PASS. 원본10PASS/34 assertion FAIL은 같은 합산 결함 조건별 대조이며34개 결함 아님. 초회 양판7항 가정·Easy 후보파일 미완성은 준비 오류로 별도 보존 |
| 쉴드·보존 | 합성7칸 문자열10·입력1000·쉴드1500: 본편 HP200, Easy HP100 감소. 기존 쉴드 최종 보너스 흡수/overflow와 DPS 기록 유지 | 통제 적HP1e12로 생존 경로만 실행. 보스 처치·사망/부활·드롭·죽음 연쇄 분기 인수 아님. stat/효과/network 등 외부 대역, 실제 시각·청취/native0 |
| 실행본 | 생산 소스41 적용, 현재 격리 앱source29/3404에는 미포함 | 빌드/reload/앱/사용자 save 조작0. CH1-1 같은후보6단계·보스문/필드몬스터 보존·재도전 실플레이 미인수 유지 |

원 후보 QA0842 completion 4e719098-d03b-4cc4-8ecb-042a22c0a66c (source38 조사)를 root source40 위에서 재검증했다. 원본·후보/차이·초기 준비 오류·docs전체 dmgBonus/_accDmg/장신구 피해 키워드 검색·HTML 전체 정확 역치환·보호67경로 hash·scope10 Git/원격 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source41-accessory-damage/에 보존한다. 기존 제작팀 TASK/소스 핀·원자료는 덮어쓰지 않는다. beamDmg/critRate/itemPower 등 별도 후보는 이번 변경에 포함하지 않았다.

| 현행 생성 베이스 / tier0~4 | 직접 필드 | source41 처리 |
|---|---|---|
| 목걸이 | critRate10 고정, dmgBonus=20+tier×20 (20/40/60/80/100%) | 기존 생성 불변. item full의 오래된 critRate2/4/6/8/10·dmgBonus10/20/30/40/50 표기를 현재 베이스로 정정 |
| 반지1·반지2 | critRate5 고정, dmgBonus=10+tier×10 (10/20/30/40/50%) | 직접 생성 필드는 현행에 존재. 3파트 문서의 2026-04-10 '직접 필드 제거'는 당시 변경 이력이며 현행 구현 설명으로 사용하지 않음 |
| 벨트·팔찌·귀걸이 베이스 | dmgBonus=10+tier×10 (10/20/30/40/50%) | 본편 headband2는 동일 베이스/참여, Easy hurtE 직접 합산은6항 유지 |

최종 생산 검수: 신규 전체 소비44 + 인접 기본공격4 =48 PASS/0 FAIL. 양판 inline JS12/importmap JSON2 구문PASS. 본편/Easy 7/6항 차이는 원본정책을 기록한 것이며 Easy 슬롯 기능을 새로 완성했다고 계산하지 않는다. 실제 변경80을 넘기는 관련 문서2개 동기화 뒤 새 후보/검사 산출을 추가하지 않고 완료소유10경로만 checkpoint한다.
