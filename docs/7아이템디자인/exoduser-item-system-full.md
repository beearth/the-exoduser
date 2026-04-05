# EXODUSER — 아이템 시스템 완전 구현 프롬프트
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
  belt:     {ko:'스태미나 회복 +X%',stat:'_iStRegen', val:[5,12]},
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
  {id:'chainHit',  type:0, ko:'연쇄의',  stat:'_aChain',     tiers:[1,2,3],     unit:'val', slots:['wpn'],          group:'chain',    weight:60},
  {id:'killSlayer',type:0, ko:'학살의',  stat:'_aKillDmg',   tiers:[0.15,0.25,0.40],unit:'pct', slots:['wpn'],      group:'kill',     weight:75},
  {id:'critExpl',  type:0, ko:'폭발의',  stat:'_aCritExpl',  tiers:[0.30,0.60,1.00],unit:'pct', slots:['wpn'],      group:'critexpl', weight:55},

  // ── PREFIX: 전투 스타일 ──
  {id:'atkSpeed',  type:0, ko:'쾌속의',  stat:'_aAtkSpd',    tiers:[0.06,0.10,0.16],unit:'pct', slots:['wpn','glv'],group:'aspd',     weight:85},
  {id:'parryBns',  type:0, ko:'패리의',  stat:'_aParry',     tiers:[0.20,0.35,0.55],unit:'pct', slots:['wpn','clk'],group:'parry',    weight:65},
  {id:'comboBoost',type:0, ko:'콤보의',  stat:'_aCombo',     tiers:[0.20,0.35,0.55],unit:'pct', slots:['wpn'],       group:'combo',    weight:60},
  {id:'dashBoost', type:0, ko:'돌진의',  stat:'_aDash',      tiers:[0.25,0.40,0.65],unit:'pct', slots:['wpn','bts'], group:'dash',    weight:55},
  {id:'skillBoost',type:0, ko:'궁극의',  stat:'_aSkill',     tiers:[0.15,0.25,0.40],unit:'pct', slots:['wpn'],       group:'skill',   weight:65},
  {id:'cdReduce',  type:0, ko:'집중력의',stat:'_aCdRed',     tiers:[0.08,0.14,0.22],unit:'pct', slots:['hlm','nck'], group:'cd',      weight:70},
  {id:'elemFocus', type:0, ko:'원소집중의',stat:'_aElemFcs', tiers:[0.12,0.20,0.32],unit:'pct', slots:['wpn','nck'], group:'elemfcs', weight:70},

  // ── PREFIX: 능력치 ──
  {id:'maxHPFlat', type:0, ko:'강인의',  stat:'_aMaxHP',     tiers:[100,200,300],  unit:'val', slots:['전 방어구'],group:'hp',     weight:90},
  {id:'shieldFlat',type:0, ko:'수호의',  stat:'_aShield',    tiers:[100,200,300],  unit:'val', slots:['전 방어구'],group:'shd',    weight:80},
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
  {id:'stRegen',   type:1, ko:'회복의',  stat:'stRegen',     tiers:[0.03,0.06,0.10],unit:'pct', slots:['arm','rng','nck'],group:'sreg', weight:80},
  {id:'dpRegen',   type:1, ko:'마력의',  stat:'mpRegen',     tiers:[0.02,0.04,0.07],unit:'pct', slots:['hlm','nck'],      group:'dreg', weight:75},
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
| critDmg | 처형의 | PREFIX | 25%/40%/65% | pct | wpn | statCritDmg() |
| atkSpeed | 쾌속의 | PREFIX | 6%/10%/16% | pct | wpn,glv | statDex() |
| maxHPFlat | 강인의 | PREFIX | 100/200/300 | val | 전 방어구 | statMaxHP() |
| shieldFlat | 수호의 | PREFIX | 100/200/300 | val | 전 방어구 | P.mshield |
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
| extraDodge | 스태미나의 | SUFFIX | 1/1/2 | val | bts,pnt | 사슬게이지 MAX 추가 |
| stRegen | 회복의 | SUFFIX | 3%/6%/10% | pct | arm,rng,nck | ST 재생 배율 |
| dpRegen | 마력의 | SUFFIX | 2%/4%/7% | pct | hlm,nck | MP 재생 배율 |
| antiRevive | 진혼의 | SUFFIX | 4%/8%/12%/16%/20% (5티어, 고티어 극악확률 tierW:50/30/15/4/1) | pct | neck,wpn,bracelet (반지: 2/4/8/12/16%) | 보스 부활 억제 (최대20%) |

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
| parryBonus | 패리의 | PREFIX | 20%/35%/55% | pct | wpn,clk | 패링 ST 회복량 ×(1+배율) |
| comboBoost | 콤보의 | PREFIX | 20%/35%/55% | pct | wpn | 같은 적 연속 공격 시 +5%/중첩 |
| dashBoost | 돌진의 | PREFIX | 25%/40%/65% | pct | wpn,bts | 작살/돌진 데미지 ×(1+배율) |
| skillBoost | 궁극의 | PREFIX | 15%/25%/40% | pct | wpn | 선택스킬 데미지 ×(1+배율) (_fuseMul 내장) |
| cooldownRed | 집중력의 | PREFIX | -8%/-14%/-22% | pct | hlm,nck | 스킬 쿨다운 ×(1+값) (음수=감소) |
| reflect | 반사의 | SUFFIX | 5%/9%/15% | pct | arm,shd,rng | 피격 데미지×배율 반사 (반경80, 1명) |
| thorns | 가시의 | SUFFIX | 4/8/14 | val | arm,glv | 피격 시 고정 가시뎀 (반경80, 1명) |
| barrier | 흡수의 | SUFFIX | 15/28/45 | val | arm,hlm | DEF 감산 후 고정 데미지 감소 |
| ccRes | 인내의 | SUFFIX | 12%/20%/32% | pct | hlm,pnt | 포이즈 기절 시간 ×(1-min(0.5,값)), 최대50% |
| crisisBoost | 위기의 | SUFFIX | 25%/40%/65% | pct | arm,nck | HP 30% 이하 시 뎀×(1+배율) |
| counterHit | 피격반격의 | SUFFIX | 15%/25%/40% | prob | arm,shd | 피격 시 확률로 반격(meleeRef×STR) |
| parryExplosion | 패링폭발의 | SUFFIX | 0.4/0.7/1.1 | ATK× | wpn,shd | 패링 시 AoE (meleeRef×STR×배율, 반경100) |
| staggerExplosion | 스태거폭발의 | SUFFIX | 30%/50%/80% | pct | wpn | 그로기 시 AoE (dmg×배율, 반경100) |
| elemConvert | 원소전환의 | SUFFIX | 20%/35%/55% | prob | wpn,nck | 물리 → 무기 속성 전환 확률 |
| statusClean | 정화의 | SUFFIX | 1/1/2 | val | hlm,pnt | 10초마다 상태이상 해제 (값=횟수/틱) |
| lastStand | 불굴의 | SUFFIX | 0/0/1 | val | arm | 1회 사망 방지(HP=1, 무적2초), 스테이지 리셋 |
| reviveOnce | 부활의 | SUFFIX | 0/0/30% | pct | arm | 1회 즉시 부활(HP=값×mhp), 스테이지 리셋 |
| expBonus | 경험의 | SUFFIX | 10%/18%/28% | pct | hlm,nck | 경험치 ×(1+배율) |
| goldBonus | 골드의 | SUFFIX | 15%/25%/40% | pct | bts,rng | 악의 획득 ×(1+배율) |
| potionPower | 포션강화의 | SUFFIX | 20%/35%/55% | pct | pnt | HP 물약 회복량 ×(1+배율) |
| sharpAtk | 예리한 | PREFIX | 50/170/330 | val | wpn,hlm | 플랫 ATK+ (skewRoll:3, 고뎀 극악) |
| brutalAtk | 맹렬한 | PREFIX | 50/170/330 | val | wpn,hlm | 플랫 ATK+ (skewRoll:3, 고뎀 극악) |
| ruinAtk | 파멸의 | SUFFIX | 50/170/330 | val | wpn,hlm | 플랫 ATK+ (skewRoll:3, 고뎀 극악) |

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
    if(s==='weapon'||s==='bow')    return 'wpn';
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

  // 티어 결정: 전설=T3, 영웅=T2, 그 외=T1
  const _tierIdx = rarity >= 4 ? 2 : rarity >= 3 ? 1 : 0;

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

## STEP 6. spawnDrop(e) 통합 드롭 함수

**위치**: 기존 `function dropItem(idx){` 바로 위에 추가

```javascript
// ─── 통합 드롭 생성 함수 ───
// e: 몬스터 엔티티 (e.dropTier, e.etype, e._isRare 등 참조)
// 호출: 기존 드롭 로직 전부 이 함수로 교체
function spawnDrop(e){
  // 1. 등급 결정
  const _r1 = Math.random();
  let _rar;
  if(e.isHellBoss || (e.etype >= 80 && STG[G.stage] && STG[G.stage].isHellBoss)){
    // 대보스: 전설 확정 1개 + 영웅 1개
    _spawnOneItem(e, 4);
    _spawnOneItem(e, 3);
    return;
  }
  if(e.isBoss){
    _rar = _r1<0.15?4 : _r1<0.45?3 : _r1<0.80?2 : 1;
  } else if(e._isRare){
    _rar = _r1<0.05?4 : _r1<0.25?3 : _r1<0.65?2 : 1;
  } else {
    _rar = _r1<0.01?4 : _r1<0.05?3 : _r1<0.15?2 : _r1<0.40?1 : 0;
  }

  // 2. 드롭 여부 결정 (일반몹: 40% 확률)
  if(!e.isBoss && !e._isRare && Math.random() > 0.40) return;

  _spawnOneItem(e, _rar);
}

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
  const _sl = (item.slot==='weapon'||item.slot==='bow') ? 'wpn'
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
  const _sl = (item.slot==='weapon'||item.slot==='bow') ? 'wpn'
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
| 복수 드롭 | 보스: 2~3개, 일반몹: 1개 |
| 레어리티 보정 | 100Lv당 +5% (캡 없음, 등급별 계수 적용) |
| LCK 보정 | `statDropBonus()` 곱연산 |
| 보스 | 100% (확정) |
| 캡 | 95% |
| 탐욕 저주 | ×0.5 (50% 감소) |
| 최소 줍기 등급 | `OPT.minPickRar` (0=일반~4=전설) — 이하 등급 필터링 |

### 등급 확률 (일반몹)
| 등급 | 기본 | 최대(레벨+엘리트) |
|---|---|---|
| 전설 | 0% | 12% |
| 영웅 | 2% | 18% |
| 희귀 | 8% | 20% |
| 마법 | 25% | 25% |
| 일반 | 나머지 | — |

### 등급 확률 (보스)
| 등급 | 기본 | 최대 |
|---|---|---|
| 전설 | 10% | 35% |
| 영웅 | 20% | 30% |
| 희귀 | 30% | 30% |
| 마법 | 나머지 | — |

## ⚡ 주의사항

- `AFFIX_POOL.filter()`는 **mkItem 내부에서만** 사용 — 게임 루프 밖이므로 OK
- `rerollPrefix/Suffix`의 `splice`는 아이템 편집 시점(루프 밖) 사용 — OK
- `P._a*` 커스텀 스탯 필드들은 `applyStats()` 내에서 전투 계산에 반영 필요  
  → 별도 "어픽스 전투 반영" 패치 작업 필요 (다음 작업으로 분리)
- `G.hell` 필드가 없으면 `G.hell||0` 으로 안전처리 (이미 처리됨)
- 레어몹 특수 드롭 (etype 90~99) 기존 코드 유지 — spawnDrop은 추가 드롭
