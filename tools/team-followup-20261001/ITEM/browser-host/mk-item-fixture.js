export function createMkItemFixture({random,now=()=>100000}={}){
  if(typeof random!=='function'||typeof now!=='function')throw new TypeError('fixture RNG/clock 필요');
  const Math=Object.create(globalThis.Math);Math.random=random;
  const Date={now};const performance={now};
  const P={lv:20},_DEMO_MODE=false,_DEMO_AFFIX_BANNED=new Set();
const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};
const RARITY_MUL=[1, 1.2, 1.5, 1.8, 2.2, 2.5];
const SLOT_NAMES=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'];
const SLOT_EMOJI=['⚔️','🛡️','👢','🦺','⛑️','🏹','🧤','👖','🪢','📿','💍','💍','🧣','⭕','🎀','⚱️','🎀'];
const AFFIX_POOL=[
  // ═══════════════════════════════════════════════════
  // 무기 파트 PREFIX (wpn=weapon/bow, helm=helmet)
  // ═══════════════════════════════════════════════════
  // DoT (weapon 전용)
  {id:'poisonDot',type:0,tiers:[5,8,14,22,32],unit:'dps',slots:['wpn'],group:'poison',weight:100},
  {id:'fireDot',type:0,tiers:[6,10,17,26,38],unit:'dps',slots:['wpn'],group:'fire',weight:100},
  {id:'iceDot',type:0,tiers:[4,7,12,18,26],unit:'dps',slots:['wpn'],group:'ice',weight:90},
  {id:'lightChain',type:0,tiers:[8,13,22,35,50],unit:'dmg',slots:['wpn'],group:'lightning',weight:85},
  {id:'darkCurse',type:0,tiers:[.12,.20,.35,.55,.75],unit:'prob',slots:['helm'],group:'dark',weight:70},
  // 공격 스킬 관련
  {id:'armorPen',type:0,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['wpn'],group:'pen',weight:75},
  {id:'staggerBns',type:0,tiers:[5,8,14,22,32],unit:'val',slots:['wpn'],group:'stagger',weight:70},
  {id:'chainTarget',type:0,tiers:[1,1,2,3,4],unit:'cnt',slots:['xbow'],group:'chain',weight:60},
  {id:'killSlayer',type:0,tiers:[.10,.15,.25,.40,.55],unit:'pct',slots:['wpn'],group:'kill',weight:75},
  {id:'comboBoost',type:0,tiers:[.12,.20,.35,.55,.75],unit:'pct',slots:['wpn'],group:'combo',weight:60},
  {id:'dashBoost',type:0,tiers:[.15,.25,.40,.65,.90],unit:'pct',slots:['wpn'],group:'dash',weight:55},
  {id:'skillBoost',type:0,tiers:[.10,.15,.25,.40,.55],unit:'pct',slots:['wpn'],group:'skill',weight:65},
  // 무기+helm 공유
  {id:'elemFocus',type:0,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['helm'],group:'elemfcs',weight:70},
  {id:'atkSpeed',type:0,tiers:[.04,.06,.10,.16,.22],unit:'pct',slots:['wpn','helm'],group:'aspd',weight:85},
  {id:'parryBonus',type:0,tiers:[.12,.20,.35,.55,.75],unit:'pct',slots:['wpn'],group:'parry',weight:65},
  {id:'cooldownRed',type:0,tiers:[-.02,-.03,-.05,-.07,-.10],unit:'pct',slots:['wpn'],group:'cd',weight:70},
  {id:'magicDmg',type:0,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['helm'],group:'mdmg',weight:85},
  // 크리티컬 (5티어)
  {id:'critDmgW',type:1,tiers:[.10,.20,.30,.40,.50],unit:'pct',slots:['wpn','helm'],group:'cdmgW',weight:60,tierW:[40,30,20,8,2]},
  {id:'critRate',type:0,tiers:[.01,.02,.03,.04,.05],unit:'pct',slots:['ring','neck','bracelet'],group:'crt',weight:50,tierW:[40,30,20,8,2]},
  {id:'critDmgW',type:1,tiers:[.10,.20,.30,.40,.50],unit:'pct',slots:['ring','neck','bracelet'],group:'cdmgW',weight:50,tierW:[40,30,20,8,2]},
  // 플랫 ATK (극악)
  {id:'sharpAtk',type:0,tiers:[20,50,170,330,500],unit:'val',slots:['wpn'],group:'satk',weight:25,skewRoll:3,tierW:[40,30,20,8,2]},
  {id:'brutalAtk',type:0,tiers:[20,50,170,330,500],unit:'val',slots:['wpn'],group:'batk',weight:20,skewRoll:3,tierW:[40,30,20,8,2]},
  {id:'ruinAtk',type:1,tiers:[20,50,170,330,500],unit:'val',slots:['wpn'],group:'ratk',weight:15,skewRoll:3,tierW:[40,30,20,8,2]},
  // 무기 SUFFIX: 트리거
  {id:'staggerExplosion',type:1,tiers:[.18,.30,.50,.80,1.15],unit:'pct',slots:['wpn'],group:'sexp',weight:35},
  {id:'elemConvert',type:1,tiers:[.12,.20,.35,.55,.75],unit:'prob',slots:['wpn'],group:'elcv',weight:40},
  {id:'parryExplosion',type:1,tiers:[.25,.40,.70,1.10,1.60],unit:'atk',slots:['wpn'],group:'pexp',weight:35},
  // ── 조건부 DPS (HP 기반) ──
  {id:'abundDmg',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['wpn','helm'],group:'abnd',weight:45},
  {id:'predDmg',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['wpn','helm'],group:'pred',weight:45},
  {id:'fullLifeDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'flDmg',weight:35,tierW:[40,30,20,8,2]},
  {id:'lowLifeDmg',type:1,tiers:[.15,.25,.40,.60,.85],unit:'pct',slots:['wpn'],group:'llDmg',weight:35,tierW:[40,30,20,8,2]},
  {id:'overkilDmg',type:1,tiers:[.20,.35,.55,.80,1.10],unit:'pct',slots:['wpn'],group:'okDmg',weight:30,tierW:[40,30,20,8,2]},
  // ── 조건부 DPS (거리 기반) ──
  {id:'closeDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'clDmg',weight:50},
  {id:'farDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'frDmg',weight:50},
  // ── 조건부 DPS (적 상태 기반) ──
  {id:'stunDmgUp',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'stDU',weight:55},
  {id:'frozenDmgUp',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'frDU',weight:55},
  {id:'burnDmgUp',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'buDU',weight:55},
  {id:'poisonDmgUp',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'poDU',weight:55},
  {id:'curseDmgUp',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'cuDU',weight:50},
  {id:'slowDmgUp',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'slDU',weight:50},
  // ── 조건부 DPS (대상 타입) ──
  {id:'bossSlayer',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn','helm'],group:'bsSl',weight:40,tierW:[40,30,20,8,2]},
  {id:'eliteSlayer',type:1,tiers:[.12,.20,.32,.46,.65],unit:'pct',slots:['wpn','helm'],group:'elSl',weight:45},
  {id:'mobSlayer',type:1,tiers:[.15,.25,.40,.60,.85],unit:'pct',slots:['wpn'],group:'moSl',weight:60},
  // ── 조건부 DPS (타이밍) ──
  {id:'firstStrike',type:1,tiers:[.15,.25,.40,.60,.85],unit:'pct',slots:['wpn'],group:'fStr',weight:40},
  // ── 흡수 (무기 SUFFIX) ──
  {id:'lifeLeech',type:1,tiers:[.005,.01,.018,.028,.04],unit:'pct',slots:['wpn'],group:'llch',weight:35,tierW:[40,30,20,8,2]},
  {id:'manaLeech',type:1,tiers:[.008,.015,.025,.04,.06],unit:'pct',slots:['wpn'],group:'mlch',weight:35,tierW:[40,30,20,8,2]},
  {id:'stLeech',type:1,tiers:[.005,.01,.018,.028,.04],unit:'pct',slots:['wpn'],group:'slch',weight:35,tierW:[40,30,20,8,2]},
  {id:'lifeOnHit',type:1,tiers:[1,2,4,7,11],unit:'val',slots:['wpn'],group:'loH',weight:45},
  // ── On-Kill 프록 (무기 SUFFIX) ──
  {id:'onKillHeal',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['wpn','helm'],group:'okHl',weight:50},
  {id:'onKillMana',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['wpn','helm'],group:'okMn',weight:50},
  {id:'onKillStam',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['wpn'],group:'okSt',weight:45},
  // onKillExplode 삭제 (시체폭발 시스템 없음)
  {id:'onKillSpeed',type:1,tiers:[.05,.08,.12,.18,.25],unit:'pct',slots:['wpn'],group:'okSp',weight:40},
  // 분노(rage) — 패링 적립 / 지옥강타 1 소비 강화 (근접무기 전용, 석궁 제외)
  {id:'rageMaxFlat',type:0,tiers:[10,20,35,55,80],unit:'val',slots:['wpn'],group:'rgMx',weight:45},
  {id:'rageDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'rgDm',weight:45},

  // ═══════════════════════════════════════════════════
  // 방어구 파트 PREFIX (armor,shield,gloves,pants,boots,cloak)
  // ═══════════════════════════════════════════════════
  {id:'defFlat',type:0,tiers:[10,20,30,40,50],unit:'val',slots:['armor','shield','gloves','pants','boots','cloak'],group:'defF',weight:100},
  {id:'maxHPFlat',type:0,tiers:[60,100,200,300,420],unit:'val',slots:['armor','shield','gloves','pants','boots','cloak'],group:'hp',weight:90},
  {id:'shieldFlat',type:0,tiers:[120,200,400,600,840],unit:'val',slots:['armor','shield','gloves','pants','boots','cloak'],group:'shd',weight:80},
  {id:'maxHPPct',type:0,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['armor'],group:'hpp',weight:80},
  {id:'movSpeed',type:0,tiers:[.03,.05,.09,.14,.20],unit:'pct',slots:['boots','cloak'],group:'mspd',weight:85},
  // 방어 SUFFIX
  {id:'physDR',type:1,tiers:[.04,.06,.10,.16,.22],unit:'pct',slots:['armor','shield'],group:'pdr',weight:80},
  {id:'reflect',type:1,tiers:[.03,.05,.09,.15,.22],unit:'pct',slots:['armor','shield'],group:'refl',weight:70},
  {id:'thorns',type:1,tiers:[2,4,8,14,22],unit:'val',slots:['armor','gloves'],group:'thorn',weight:65},
  {id:'barrier',type:1,tiers:[8,15,28,45,65],unit:'val',slots:['armor'],group:'bar',weight:60},
  {id:'ccRes',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['pants'],group:'ccr',weight:70},
  {id:'crisisBoost',type:1,tiers:[.15,.25,.40,.65,.90],unit:'pct',slots:['armor'],group:'cris',weight:45},
  {id:'counterHit',type:1,tiers:[.10,.15,.25,.40,.55],unit:'prob',slots:['armor','shield'],group:'cnt',weight:40},
  {id:'statusClean',type:1,tiers:[1,1,1,2,3],unit:'cnt',slots:['pants'],group:'clean',weight:50},
  {id:'lastStand',type:1,tiers:[null,null,null,null,1],unit:'cnt',slots:['armor'],weight:20,group:'lst'},
  {id:'reviveOnce',type:1,tiers:[null,null,null,.20,.35],unit:'hp',slots:['armor'],weight:10,group:'rev'},
  // 방어구 유틸
  {id:'dropRate',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['boots','cloak'],group:'drop',weight:70},
  {id:'goldBonus',type:1,tiers:[.10,.15,.25,.40,.55],unit:'pct',slots:['boots'],group:'gold',weight:70},
  {id:'potionPower',type:1,tiers:[.12,.20,.35,.55,.75],unit:'pct',slots:['pants'],group:'pot',weight:60},
  {id:'extraST',type:1,tiers:[5,10,20,30,45],unit:'val',slots:['boots','pants'],group:'exst',weight:50},
  // ── 조건부 방어 (NEW) ──
  {id:'healthyDef',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['armor','shield'],group:'hDef',weight:50},
  {id:'injuredDR',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['armor','shield'],group:'iDR',weight:45},
  {id:'injuredSpeed',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['boots'],group:'iSpd',weight:45},
  {id:'dotDR',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['pants','cloak'],group:'dDR',weight:55},
  {id:'bossDR',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['armor','shield'],group:'bDR',weight:35,tierW:[40,30,20,8,2]},
  {id:'closeDR',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['armor'],group:'cDR',weight:45},
  {id:'farDR',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['shield','cloak'],group:'fDR',weight:45},
  {id:'hpOnKill',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['armor','gloves'],group:'hpOK',weight:50},
  {id:'shieldOnKill',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['armor','shield'],group:'shOK',weight:45},

  // ═══════════════════════════════════════════════════
  // 장신구 파트 PREFIX/SUFFIX (belt,bracelet,ring,neck,headband)
  // ═══════════════════════════════════════════════════
  // 속성 저항
  {id:'fireRes',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['ring','neck','belt','headband','bracelet'],group:'rfir',weight:100},
  {id:'iceRes',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['ring','neck','belt','headband','bracelet'],group:'rice',weight:100},
  {id:'lightRes',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['ring','neck','belt','headband','bracelet'],group:'rlit',weight:100},
  {id:'darkRes',type:1,tiers:[.08,.12,.20,.32,.44],unit:'pct',slots:['ring','neck','belt','headband','bracelet'],group:'rdark',weight:90},
  {id:'poisonRes',type:1,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['ring','neck','belt','headband','bracelet'],group:'rpoi',weight:90},
  {id:'allRes',type:1,tiers:[.03,.05,.09,.15,.22],unit:'pct',slots:['neck'],group:'rall',weight:50},
  {id:'eDefFlat',type:1,tiers:[25,50,100,150,220],unit:'val',slots:['neck','ring','belt','headband','bracelet'],group:'edf',weight:40},
  // 자원
  {id:'maxSTFlat',type:0,tiers:[20,40,60,80,100],unit:'val',slots:['belt','bracelet','ring','neck','headband'],group:'stf',weight:75},
  {id:'maxMPFlat',type:0,tiers:[20,40,60,80,100],unit:'val',slots:['belt','bracelet','ring','neck','headband'],group:'mpf',weight:75},
  {id:'mpCostRed',type:0,tiers:[-.05,-.08,-.14,-.22,-.30],unit:'pct',slots:['headband','neck'],group:'mpcr',weight:80},
  {id:'stCostRed',type:0,tiers:[-.05,-.08,-.14,-.22,-.30],unit:'pct',slots:['belt','bracelet'],group:'stcr',weight:75},
  // 유틸
  {id:'expBonus',type:1,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['neck'],group:'exp',weight:65},
  {id:'antiRevive',type:1,tiers:[.04,.08,.12,.16,.20],unit:'pct',slots:['neck','bracelet'],group:'arev',weight:40,tierW:[50,30,15,4,1]},
  {id:'antiRevive',type:1,tiers:[.02,.04,.08,.12,.16],unit:'pct',slots:['ring'],group:'arev',weight:40,tierW:[50,30,15,4,1]},
  // 악마팔찌
  {id:'revivePow',type:0,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['bracelet'],group:'rpow',weight:80,brType:'demon'},
  {id:'reviveCd',type:0,tiers:[-.06,-.10,-.18,-.28,-.40],unit:'pct',slots:['bracelet'],group:'rcd',weight:70,brType:'demon'},
  // 생명팔찌
  {id:'lifeMaxHP',type:0,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['bracelet'],group:'lhp',weight:85,brType:'life'},
  {id:'lifeRegen',type:0,tiers:[1,3,6,10,15],unit:'val',slots:['bracelet'],group:'lrg',weight:80,brType:'life'},
  {id:'lifeHealPow',type:0,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['bracelet'],group:'lhl',weight:75,brType:'life'},
  // LCK/근성 (5티어)
  {id:'lckFlatN',type:0,tiers:[20,40,60,80,100],unit:'val',slots:['neck'],group:'lckN',weight:80},
  {id:'lckFlatR',type:0,tiers:[10,20,30,40,50],unit:'val',slots:['ring','bracelet','belt','headband'],group:'lckR',weight:80},
  {id:'gritFlatN',type:1,tiers:[20,40,60,80,100],unit:'val',slots:['neck'],group:'grtN',weight:80},
  {id:'gritFlatR',type:1,tiers:[10,20,30,40,50],unit:'val',slots:['ring','bracelet','belt','headband'],group:'grtR',weight:80},
  // ── 장신구 조건부 (NEW) ──
  {id:'healthyAtk',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['ring','neck'],group:'hAtk',weight:45},
  {id:'injuredDmg',type:1,tiers:[.12,.20,.32,.46,.65],unit:'pct',slots:['ring','neck'],group:'iDmg',weight:40},
  {id:'injuredLeech',type:1,tiers:[.008,.015,.025,.04,.06],unit:'pct',slots:['ring'],group:'iLch',weight:30,tierW:[40,30,20,8,2]},
  {id:'vsBossDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['neck','ring'],group:'vBDm',weight:35,tierW:[40,30,20,8,2]},
  {id:'vsEliteDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['neck'],group:'vEDm',weight:40},

  // ═══════════════════════════════════════════════════
  // Phase 2: 속성별 분화 (5원소 × 6변형 = 30종)
  // ═══════════════════════════════════════════════════
  // ── 화염(F) ──
  {id:'fireDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'fDmP',weight:70},
  {id:'firePen',type:1,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['wpn'],group:'fPen',weight:50},
  {id:'fireOnHit',type:1,tiers:[.08,.14,.22,.32,.44],unit:'prob',slots:['wpn'],group:'fOH',weight:55},
  {id:'fireBurst',type:1,tiers:[15,28,45,70,100],unit:'val',slots:['wpn'],group:'fBst',weight:35},
  {id:'fireDuration',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['helm'],group:'fDur',weight:55},
  {id:'fireDmgBns',type:1,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['ring','neck'],group:'fBns',weight:60},
  // ── 빙결(I) ──
  {id:'iceDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'iDmP',weight:70},
  {id:'icePen',type:1,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['wpn'],group:'iPen',weight:50},
  {id:'iceOnHit',type:1,tiers:[.06,.10,.16,.24,.34],unit:'prob',slots:['wpn'],group:'iOH',weight:50},
  {id:'iceBurst',type:1,tiers:[12,22,38,58,85],unit:'val',slots:['wpn'],group:'iBst',weight:35},
  {id:'iceDuration',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['helm'],group:'iDur',weight:55},
  {id:'iceDmgBns',type:1,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['ring','neck'],group:'iBns',weight:60},
  // ── 뇌전(L) ──
  {id:'lightDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'lDmP',weight:70},
  {id:'lightPen',type:1,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['wpn'],group:'lPen',weight:50},
  {id:'lightOnHit',type:1,tiers:[.06,.10,.16,.24,.34],unit:'prob',slots:['wpn'],group:'lOH',weight:50},
  {id:'lightBurst',type:1,tiers:[18,32,52,80,115],unit:'val',slots:['wpn'],group:'lBst',weight:35},
  {id:'lightDuration',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['helm'],group:'lDur',weight:55},
  {id:'lightDmgBns',type:1,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['ring','neck'],group:'lBns',weight:60},
  // ── 암흑(D) ──
  {id:'darkDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'dDmP',weight:65},
  {id:'darkPen',type:1,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['wpn'],group:'dPen',weight:45},
  {id:'darkOnHit',type:1,tiers:[.06,.10,.16,.24,.34],unit:'prob',slots:['wpn'],group:'dOH',weight:45},
  {id:'darkBurst',type:1,tiers:[14,26,42,65,95],unit:'val',slots:['wpn'],group:'dBst',weight:30},
  {id:'darkDuration',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['helm'],group:'dDur',weight:50},
  {id:'darkDmgBns',type:1,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['ring','neck'],group:'dBns',weight:55},
  // ── 독(P→poison) ──
  {id:'poisonDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'pDmP',weight:65},
  {id:'poisonPen',type:1,tiers:[.05,.08,.14,.22,.32],unit:'pct',slots:['wpn'],group:'pPen',weight:45},
  {id:'poisonOnHit',type:1,tiers:[.08,.14,.22,.32,.44],unit:'prob',slots:['wpn'],group:'pOH',weight:55},
  {id:'poisonBurst',type:1,tiers:[10,20,35,55,80],unit:'val',slots:['wpn'],group:'pBst',weight:30},
  {id:'poisonDuration',type:0,tiers:[.12,.20,.32,.46,.65],unit:'pct',slots:['helm'],group:'pDur',weight:55},
  {id:'poisonDmgBns',type:1,tiers:[.06,.10,.18,.28,.40],unit:'pct',slots:['ring','neck'],group:'pBns',weight:55},

  // ═══════════════════════════════════════════════════
  // Phase 2: 타입별 데미지 분화 (7종)
  // ═══════════════════════════════════════════════════
  {id:'meleeDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'mlDm',weight:75},
  {id:'rangedDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'rnDm',weight:75},
  {id:'spellDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'spDm',weight:75},
  {id:'beamDmgPct',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['helm'],group:'bmDm',weight:55},
  {id:'dotDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'dtDm',weight:60},
  {id:'projDmgPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'pjDm',weight:65},
  {id:'aoeRadiusPct',type:0,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['wpn','helm'],group:'aoRd',weight:55},

  // ═══════════════════════════════════════════════════
  // Phase 2: 크리/공속/관통 확장 (10종)
  // ═══════════════════════════════════════════════════
  {id:'critRateMelee',type:0,tiers:[.01,.02,.03,.04,.06],unit:'pct',slots:['wpn'],group:'crM',weight:45,tierW:[40,30,20,8,2]},
  {id:'critRateSpell',type:0,tiers:[.01,.02,.03,.04,.06],unit:'pct',slots:['helm'],group:'crS',weight:45,tierW:[40,30,20,8,2]},
  {id:'critRateBow',type:0,tiers:[.01,.02,.03,.04,.06],unit:'pct',slots:['xbow'],group:'crB',weight:45,tierW:[40,30,20,8,2]},
  {id:'meleeAtkSpd',type:0,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['wpn'],group:'mAS',weight:65},
  {id:'bowAtkSpd',type:0,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['xbow'],group:'bAS',weight:65},
  {id:'castSpeed',type:0,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['helm'],group:'cSpd',weight:65},
  {id:'elemPenAll',type:1,tiers:[.03,.05,.09,.15,.22],unit:'pct',slots:['wpn'],group:'ePnA',weight:30,tierW:[40,30,20,8,2]},
  {id:'shieldBypass',type:1,tiers:[.05,.08,.14,.22,.32],unit:'prob',slots:['wpn'],group:'shBp',weight:30,tierW:[40,30,20,8,2]},
  {id:'armorShred',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['wpn'],group:'arSh',weight:50},
  {id:'projSpeedPct',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'pjSp',weight:55},

  // ═══ Phase 3: On-Hit/Crit 프록 (25종) ═══
  {id:'onHitFireball',type:1,tiers:[.04,.07,.11,.16,.22],unit:'prob',slots:['wpn'],group:'ohFb',weight:25,tierW:[40,30,20,8,2]},
  {id:'onHitChainL',type:1,tiers:[.04,.07,.11,.16,.22],unit:'prob',slots:['wpn'],group:'ohCL',weight:25,tierW:[40,30,20,8,2]},
  {id:'onHitFreeze',type:1,tiers:[.05,.08,.14,.22,.30],unit:'prob',slots:['wpn'],group:'ohFz',weight:40},
  {id:'onHitStun',type:1,tiers:[.03,.05,.09,.15,.22],unit:'prob',slots:['wpn'],group:'ohSt',weight:35},
  {id:'onHitPoison',type:1,tiers:[.06,.10,.16,.24,.34],unit:'prob',slots:['wpn'],group:'ohPo',weight:45},
  {id:'onHitBleed',type:1,tiers:[.05,.08,.14,.22,.30],unit:'prob',slots:['wpn'],group:'ohBl',weight:40},
  {id:'onHitWeaken',type:1,tiers:[.04,.07,.11,.16,.22],unit:'prob',slots:['wpn'],group:'ohWk',weight:35},
  {id:'onHitSlow',type:1,tiers:[.06,.10,.16,.24,.34],unit:'prob',slots:['wpn'],group:'ohSl',weight:40},
  {id:'onHitMark',type:1,tiers:[.05,.08,.14,.22,.30],unit:'prob',slots:['wpn'],group:'ohMk',weight:30},
  {id:'onCritExplode',type:1,tiers:[.20,.35,.55,.80,1.15],unit:'pct',slots:['wpn'],group:'ocEx',weight:20,tierW:[40,30,20,8,2]},
  {id:'onCritChain',type:1,tiers:[.15,.25,.40,.60,.85],unit:'pct',slots:['wpn'],group:'ocCh',weight:20,tierW:[40,30,20,8,2]},
  {id:'onCritFreeze',type:1,tiers:[.10,.18,.28,.40,.55],unit:'prob',slots:['wpn'],group:'ocFz',weight:30},
  {id:'onCritHeal',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['wpn'],group:'ocHl',weight:35},
  {id:'onCritMana',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['wpn'],group:'ocMn',weight:35},
  {id:'onCritShield',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['wpn','helm'],group:'ocSh',weight:30},
  {id:'onHitDefBoost',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['armor','shield'],group:'ohDb',weight:40},
  {id:'onHitThorns',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['armor','gloves'],group:'ohTh',weight:45},
  // procIceNova/procDarkShield/procHealPulse/procCorpseExplode 삭제 (미구현 시스템)
  {id:'onDodgeDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['boots','cloak'],group:'odDm',weight:35},
  {id:'onParryBurst',type:1,tiers:[.15,.25,.40,.60,.85],unit:'pct',slots:['shield'],group:'opBs',weight:30},
  {id:'onBlockHeal',type:1,tiers:[5,10,18,28,40],unit:'val',slots:['shield'],group:'oBHl',weight:40},
  {id:'onBlockMana',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['shield'],group:'oBMn',weight:40},

  // ═══ Phase 3: 스킬 개별 강화 (20종) ═══
  {id:'skWhirlDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'sWD',weight:40},
  {id:'skBeamDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sBD',weight:40},
  {id:'skFireballDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sFD',weight:40},
  {id:'skMissileDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'sMD',weight:40},
  {id:'skBlueShotDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'sBSD',weight:40},
  {id:'skBlastShotDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'sBShD',weight:40},
  {id:'skHellRayDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sHRD',weight:35},
  {id:'skMaliceStormDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'sMSD',weight:35},
  {id:'skChainSlashDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'sCSD',weight:40},
  {id:'skGiantSlamDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'sGSD',weight:40},
  {id:'skGhostWalkDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'sGWD',weight:35},
  {id:'skMaliceMortarDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'sMMD',weight:35},
  {id:'skFireAuraDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sFAD',weight:40},
  {id:'skIceOrbDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sIOD',weight:35},
  {id:'skFireBeamDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sFBD',weight:35},
  {id:'skMaliceHuntDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'sMHD',weight:35},
  {id:'skDarkPillarDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sDPD',weight:35},
  {id:'skPlagueDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sPBD',weight:35},
  {id:'skSpikeAuraDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'sSAD',weight:35},
  {id:'skChainAssaultDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'sCAD',weight:35},

  // ═══ Phase 3: 생존/방어 확장 (30종) ═══
  {id:'dodgeChance',type:1,tiers:[.02,.04,.06,.09,.13],unit:'pct',slots:['boots','cloak'],group:'ddgC',weight:45,tierW:[40,30,20,8,2]},
  {id:'dodgeCooldown',type:1,tiers:[-.05,-.08,-.14,-.22,-.30],unit:'pct',slots:['boots'],group:'ddgCd',weight:50},
  {id:'maxHPPctArmor',type:0,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['pants','shield'],group:'hpPA',weight:65},
  {id:'shieldPct',type:0,tiers:[.10,.16,.28,.44,.64],unit:'pct',slots:['armor'],group:'shPct',weight:55},
  {id:'shieldRegenPct',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['armor','shield'],group:'shRgP',weight:50},
  {id:'shieldCdRed',type:1,tiers:[-.05,-.08,-.14,-.22,-.30],unit:'pct',slots:['shield'],group:'shCdR',weight:45},
  {id:'hpRegenFlat',type:0,tiers:[1,2,4,7,11],unit:'val',slots:['armor','gloves'],group:'hpRgF',weight:60},
  {id:'hpRegenPct',type:0,tiers:[.03,.05,.09,.15,.22],unit:'pct',slots:['armor'],group:'hpRgP',weight:50},
  {id:'stRegenFlat',type:0,tiers:[1,2,3,5,8],unit:'val',slots:['boots','pants'],group:'stRgF',weight:55},
  {id:'stRegenPct',type:0,tiers:[.03,.05,.09,.15,.22],unit:'pct',slots:['belt'],group:'stRgP',weight:50},
  {id:'mpRegenFlat',type:0,tiers:[1,2,3,5,8],unit:'val',slots:['headband','neck'],group:'mpRgF',weight:55},
  {id:'mpRegenPct',type:0,tiers:[.03,.05,.09,.15,.22],unit:'pct',slots:['headband'],group:'mpRgP',weight:50},
  {id:'fireDR',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['armor','cloak'],group:'fDR',weight:55},
  {id:'iceDR',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['armor','pants'],group:'iDR',weight:55},
  {id:'lightDR',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['armor','gloves'],group:'lDR',weight:55},
  {id:'darkDR',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['armor','shield'],group:'dkDR',weight:50},
  {id:'poisonDRdef',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['armor','boots'],group:'psDR',weight:50},
  {id:'allDR',type:1,tiers:[.02,.04,.06,.09,.13],unit:'pct',slots:['armor'],group:'aDR',weight:15,tierW:[40,30,20,8,2]},
  {id:'eliteDR',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['armor'],group:'eDR',weight:35},
  {id:'stunRes',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['pants','gloves'],group:'stRs',weight:55},
  {id:'freezeRes',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['pants','boots'],group:'fzRs',weight:55},
  {id:'slowRes',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['boots'],group:'slRs',weight:55},
  {id:'knockbackRes',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['armor','shield'],group:'kbRs',weight:50},
  {id:'dashRange',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['boots'],group:'dshR',weight:45},
  {id:'dashCooldown',type:1,tiers:[-.04,-.07,-.11,-.16,-.22],unit:'pct',slots:['boots','cloak'],group:'dshCd',weight:45},
  {id:'movSpeedCombat',type:0,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['boots'],group:'mspC',weight:40},
  {id:'movSpeedOOC',type:0,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['boots','cloak'],group:'mspO',weight:60},
  {id:'pickupRadius',type:1,tiers:[10,20,35,55,80],unit:'val',slots:['boots'],group:'pkRd',weight:55},

  // ═══ Phase 3: 장신구 확장 (30종) ═══
  {id:'strFlat',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['ring','neck','belt','bracelet','headband'],group:'strF',weight:60},
  {id:'dexFlat',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['ring','neck','belt','bracelet','headband'],group:'dexF',weight:60},
  {id:'intFlat',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['ring','neck','belt','bracelet','headband'],group:'intF',weight:60},
  {id:'vitFlat',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['ring','neck','belt','bracelet','headband'],group:'vitF',weight:60},
  {id:'allStat',type:1,tiers:[2,4,7,11,16],unit:'val',slots:['neck'],group:'allS',weight:15,tierW:[40,30,20,8,2]},
  {id:'maxSTPct',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['belt','bracelet'],group:'stPct',weight:55},
  {id:'maxMPPct',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['headband','neck'],group:'mpPct',weight:55},
  {id:'resourceOnHit',type:1,tiers:[1,2,3,5,8],unit:'val',slots:['ring'],group:'rsOH',weight:35},
  {id:'fireResMax',type:1,tiers:[1,2,3,4,5],unit:'val',slots:['neck','ring'],group:'fRM',weight:20,tierW:[40,30,20,8,2]},
  {id:'iceResMax',type:1,tiers:[1,2,3,4,5],unit:'val',slots:['neck','ring'],group:'iRM',weight:20,tierW:[40,30,20,8,2]},
  {id:'lightResMax',type:1,tiers:[1,2,3,4,5],unit:'val',slots:['neck','ring'],group:'lRM',weight:20,tierW:[40,30,20,8,2]},
  {id:'darkResMax',type:1,tiers:[1,2,3,4,5],unit:'val',slots:['neck','ring'],group:'dRM',weight:20,tierW:[40,30,20,8,2]},
  {id:'poisonResMax',type:1,tiers:[1,2,3,4,5],unit:'val',slots:['neck','ring'],group:'pRM',weight:20,tierW:[40,30,20,8,2]},
  {id:'skillCdRed',type:1,tiers:[-.04,-.07,-.11,-.16,-.22],unit:'pct',slots:['headband'],group:'skCd',weight:50},
  {id:'potionCdRed',type:1,tiers:[-.04,-.07,-.11,-.16,-.22],unit:'pct',slots:['belt'],group:'ptCd',weight:55},
  {id:'craftBonus',type:1,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['ring'],group:'crfB',weight:15,tierW:[40,30,20,8,2]},
  {id:'goldFind',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['belt'],group:'glFn',weight:55},
  {id:'expBonusRing',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['ring'],group:'exR',weight:50},
  {id:'dropRateAcc',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['neck','ring'],group:'drAc',weight:45},
  {id:'demonDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['bracelet'],group:'dmDm',weight:55,brType:'demon'},
  {id:'demonDR',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['bracelet'],group:'dmDR',weight:50,brType:'demon'},
  {id:'soulHarvest',type:1,tiers:[1,2,3,5,8],unit:'val',slots:['bracelet'],group:'slHv',weight:40,brType:'demon'},
  {id:'lifeLeechBr',type:1,tiers:[.005,.01,.018,.028,.04],unit:'pct',slots:['bracelet'],group:'llBr',weight:40,brType:'life'},
  {id:'overhealShield',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['bracelet'],group:'ohSh',weight:25,brType:'life',tierW:[40,30,20,8,2]},
  {id:'onFullManaDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['headband'],group:'fmDm',weight:40},
  {id:'whileMovingDR',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['belt'],group:'wmDR',weight:40},
  {id:'whileStationaryDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['ring'],group:'wsDm',weight:35},
  {id:'afterDodgeDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['ring','bracelet'],group:'adDm',weight:30},
  {id:'afterParryShield',type:1,tiers:[10,18,28,40,60],unit:'val',slots:['bracelet','shield'],group:'apSh',weight:35},
  {id:'comboThreshold',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['ring','neck'],group:'cmTh',weight:30},
  // ═══ Phase 4: 슬롯 세분화 + 하이브리드 ═══
  {id:'flatPhysDmg',type:0,tiers:[8,16,28,44,65],unit:'val',slots:['wpn'],group:'fPD',weight:80},
  {id:'flatFireDmg',type:0,tiers:[6,12,22,36,52],unit:'val',slots:['wpn'],group:'fFrD',weight:65},
  {id:'flatIceDmg',type:0,tiers:[5,10,18,30,44],unit:'val',slots:['wpn'],group:'fIcD',weight:65},
  {id:'flatLightDmg',type:0,tiers:[7,14,24,38,55],unit:'val',slots:['wpn'],group:'fLtD',weight:65},
  {id:'flatDarkDmg',type:0,tiers:[6,12,22,36,52],unit:'val',slots:['wpn'],group:'fDkD',weight:60},
  {id:'flatPoisonDmg',type:0,tiers:[5,10,18,30,44],unit:'val',slots:['wpn'],group:'fPoD',weight:60},
  {id:'minDmgFlat',type:0,tiers:[3,6,10,16,24],unit:'val',slots:['wpn'],group:'mnDm',weight:55},
  {id:'maxDmgFlat',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['wpn'],group:'mxDm',weight:55},
  {id:'atkPctAll',type:0,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['wpn','helm'],group:'aAll',weight:50},
  {id:'weaponRange',type:0,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['wpn'],group:'wRng',weight:55},
  {id:'bowRange',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['xbow'],group:'bRng',weight:55},
  {id:'doubleStrike',type:1,tiers:[.02,.04,.06,.09,.13],unit:'prob',slots:['wpn'],group:'dStr',weight:20,tierW:[40,30,20,8,2]},
  {id:'multiShot',type:1,tiers:[.03,.05,.08,.12,.18],unit:'prob',slots:['xbow'],group:'mSht',weight:20,tierW:[40,30,20,8,2]},
  {id:'pierceChance',type:0,tiers:[.05,.08,.14,.22,.30],unit:'prob',slots:['xbow'],group:'prCh',weight:50},
  {id:'pierceCount',type:0,tiers:[1,1,2,2,3],unit:'cnt',slots:['xbow'],group:'prCt',weight:40},
  {id:'pierceDmgKeep',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['xbow'],group:'prDK',weight:40},
  {id:'chainDmgKeep',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'chDK',weight:40},
  {id:'splashRadius',type:0,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['xbow'],group:'spRd',weight:45},
  {id:'splashDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['xbow'],group:'spDm',weight:35},
  {id:'chargeAtkDmg',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'chAD',weight:50},
  {id:'counterAtkDmg',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'ctAD',weight:45},
  {id:'backstabDmg',type:1,tiers:[.12,.20,.32,.46,.65],unit:'pct',slots:['wpn'],group:'bkSt',weight:35},
  {id:'executeDmg',type:1,tiers:[.15,.25,.40,.60,.85],unit:'pct',slots:['wpn'],group:'exDm',weight:30,tierW:[40,30,20,8,2]},
  {id:'dotTickRate',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['wpn'],group:'dtTk',weight:40},
  {id:'bleedDps',type:0,tiers:[5,10,18,28,40],unit:'dps',slots:['wpn'],group:'blDp',weight:60},
  {id:'bleedDuration',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'blDr',weight:50},
  {id:'flatMagicDmg',type:0,tiers:[6,12,22,36,52],unit:'val',slots:['helm'],group:'fMgD',weight:60},
  {id:'spellAmp',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['helm'],group:'spAm',weight:45},
  {id:'killStreakDmg',type:1,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['wpn'],group:'kSD',weight:35},
  {id:'killStreakSpd',type:1,tiers:[.02,.04,.06,.09,.13],unit:'pct',slots:['wpn'],group:'kSS',weight:35},
  {id:'momentumDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'momD',weight:35},
  {id:'standingDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'stdD',weight:35},
  {id:'movingDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'mvDm',weight:35},
  {id:'recentParryDmg',type:1,tiers:[.12,.20,.32,.46,.65],unit:'pct',slots:['wpn'],group:'rpDm',weight:30},
  {id:'nearDeathDmg',type:1,tiers:[.20,.35,.55,.80,1.10],unit:'pct',slots:['wpn'],group:'ndDm',weight:20,tierW:[40,30,20,8,2]},
  {id:'fullStaminaDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'fsDm',weight:35},
  {id:'fullManaDmg2',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn','helm'],group:'fmD2',weight:35},
  {id:'freshKillDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'fkDm',weight:35},
  {id:'stunDuration',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'stDr',weight:45},
  {id:'freezeDuration',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'fzDr',weight:45},
  {id:'slowEfficiency',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'slEf',weight:40},
  {id:'poisonStack',type:1,tiers:[1,1,2,2,3],unit:'cnt',slots:['wpn'],group:'poSk',weight:35},
  {id:'bleedStack',type:1,tiers:[1,1,2,2,3],unit:'cnt',slots:['wpn'],group:'blSk',weight:35},
  {id:'igniteDmg',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'igDm',weight:50},
  {id:'frostbiteDmg',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'fbDm',weight:50},
  {id:'shockDmg',type:0,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'skDm',weight:50},
  {id:'critMultiOnLowHP',type:1,tiers:[.10,.20,.30,.40,.50],unit:'pct',slots:['wpn'],group:'cmLH',weight:25,tierW:[40,30,20,8,2]},
  // 방어구 세분화
  {id:'armorDefPct',type:0,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['armor'],group:'adPc',weight:65},
  {id:'shieldBlockDR',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['shield'],group:'sBDR',weight:50},
  {id:'shieldBashDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['shield'],group:'sBsD',weight:45},
  {id:'shieldStagger',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['shield'],group:'sStg',weight:45},
  {id:'glovesAtkSpd',type:0,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['gloves'],group:'gAS',weight:55},
  {id:'glovesCritDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['gloves'],group:'gCD',weight:45},
  {id:'glovesStagger',type:0,tiers:[2,4,7,11,16],unit:'val',slots:['gloves'],group:'gStg',weight:50},
  {id:'pantsHPRegen',type:0,tiers:[1,2,3,5,8],unit:'val',slots:['pants'],group:'pHRg',weight:55},
  {id:'pantsCCDuration',type:1,tiers:[-.06,-.10,-.16,-.24,-.34],unit:'pct',slots:['pants'],group:'pCCD',weight:45},
  {id:'bootsDashDmg',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['boots'],group:'bDD',weight:45},
  {id:'bootsChargeRange',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['boots'],group:'bCR',weight:45},
  {id:'bootsMSOnKill',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['boots'],group:'bMOK',weight:40},
  {id:'cloakDodgeDR',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['cloak'],group:'cDDR',weight:35},
  {id:'cloakMSPct',type:0,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['cloak'],group:'cMSP',weight:50},
  {id:'cloakElemDR',type:1,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['cloak'],group:'cEDR',weight:40},
  {id:'burnDR',type:1,tiers:[.10,.16,.24,.36,.50],unit:'pct',slots:['cloak'],group:'brDR',weight:45},
  {id:'helmMPPct',type:0,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['helm'],group:'hMPP',weight:50},
  {id:'helmCastSpd',type:0,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['helm'],group:'hCSp',weight:50},
  {id:'helmCooldown',type:0,tiers:[-.04,-.07,-.11,-.16,-.22],unit:'pct',slots:['helm'],group:'hCd',weight:45},
  {id:'helmExpPct',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['helm'],group:'hExp',weight:45},
  // 하이브리드
  {id:'hybAtkHP',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['armor'],group:'hAH',weight:30},
  {id:'hybDefSpd',type:1,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['boots'],group:'hDS',weight:30},
  {id:'hybCritLeech',type:1,tiers:[.005,.01,.015,.02,.03],unit:'pct',slots:['wpn'],group:'hCL',weight:20,tierW:[40,30,20,8,2]},
  {id:'hybHPMP',type:0,tiers:[30,60,100,150,220],unit:'val',slots:['armor'],group:'hHM',weight:25},
  {id:'hybHPST',type:0,tiers:[30,60,100,150,220],unit:'val',slots:['armor'],group:'hHS',weight:25},
  {id:'hybMPST',type:0,tiers:[20,40,70,110,160],unit:'val',slots:['belt'],group:'hMSt',weight:25},
  {id:'hybAllRegen',type:0,tiers:[1,2,3,5,8],unit:'val',slots:['armor'],group:'hAR',weight:20,tierW:[40,30,20,8,2]},
  {id:'hybStrDex',type:0,tiers:[3,6,10,16,24],unit:'val',slots:['ring'],group:'hSD',weight:30},
  {id:'hybStrInt',type:0,tiers:[3,6,10,16,24],unit:'val',slots:['ring'],group:'hSI',weight:30},
  {id:'hybDexInt',type:0,tiers:[3,6,10,16,24],unit:'val',slots:['headband'],group:'hDI',weight:30},
  {id:'hybLckGrit',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['neck'],group:'hLG',weight:25},
  {id:'hybDropExp',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['boots'],group:'hDE',weight:30},
  {id:'hybFireIce',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['wpn'],group:'hFI',weight:25},
  {id:'hybLightDark',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['wpn'],group:'hLkD',weight:25},
  {id:'hybMeleeSpell',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['wpn','helm'],group:'hMS',weight:25},
  {id:'hybElemDotDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['wpn','helm'],group:'hEDD',weight:30},
  // ═══ Phase 5: 장신구 대확장 + 아키타입 + 엔드게임 ═══
  // 반지 전용
  {id:'ringFireDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['ring'],group:'rFD',weight:50},
  {id:'ringIceDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['ring'],group:'rID',weight:50},
  {id:'ringLightDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['ring'],group:'rLD',weight:50},
  {id:'ringDarkDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['ring'],group:'rDD',weight:50},
  {id:'ringPoisonDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['ring'],group:'rPD',weight:50},
  {id:'ringDmgPerCombo',type:1,tiers:[.002,.004,.006,.009,.013],unit:'pct',slots:['ring'],group:'rDPC',weight:25},
  {id:'ringMPOnKill',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['ring'],group:'rMOK',weight:40},
  {id:'ringProjPierce',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['ring'],group:'rPP',weight:30},
  // 목걸이 전용
  {id:'neckAllDmg',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['neck'],group:'nAD',weight:25,tierW:[40,30,20,8,2]},
  {id:'neckCritDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['neck'],group:'nCD',weight:35},
  {id:'neckElemPen',type:1,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['neck'],group:'nEP',weight:25,tierW:[40,30,20,8,2]},
  {id:'neckSkillDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['neck'],group:'nSkD',weight:35},
  {id:'neckComboMax',type:1,tiers:[5,10,15,20,30],unit:'val',slots:['neck'],group:'nCM',weight:30},
  {id:'neckKillHeal',type:1,tiers:[3,6,10,16,24],unit:'val',slots:['neck'],group:'nKH',weight:40},
  // 벨트 전용
  {id:'beltSTMax',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['belt'],group:'bSTM',weight:55},
  {id:'beltPotionHP',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['belt'],group:'bPHP',weight:50},
  {id:'beltSTRegen',type:0,tiers:[1,2,3,5,8],unit:'val',slots:['belt'],group:'bSRg',weight:50},
  {id:'beltGoldDrop',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['belt'],group:'bGD',weight:50},
  // 머리띠 전용
  {id:'headbandMPMax',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['headband'],group:'hbMM',weight:55},
  {id:'headbandCastSpd',type:0,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['headband'],group:'hbCS',weight:50},
  {id:'headbandMPRegen',type:0,tiers:[1,2,3,5,8],unit:'val',slots:['headband'],group:'hbMR',weight:50},
  {id:'headbandSpellDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['headband'],group:'hbSD',weight:45},
  {id:'headbandElemDmg',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['headband'],group:'hbED',weight:40},
  // (팔찌 Phase3에서 이미 추가됨 — 중복 제거)
  // 아키타입: 전사/마법사/궁수/탱크/암살자
  {id:'arcWarriorDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'awD',weight:30},
  {id:'arcWarriorHP',type:0,tiers:[30,60,100,150,220],unit:'val',slots:['armor'],group:'awHP',weight:30},
  {id:'arcWarriorLifeSteal',type:1,tiers:[.004,.008,.014,.022,.032],unit:'pct',slots:['wpn'],group:'awLS',weight:20,tierW:[40,30,20,8,2]},
  {id:'arcWarriorPoise',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['armor'],group:'awPo',weight:35},
  {id:'arcMageDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['helm'],group:'amD',weight:30},
  {id:'arcMageMP',type:0,tiers:[20,40,70,110,160],unit:'val',slots:['headband'],group:'amMP',weight:30},
  {id:'arcMageShield',type:0,tiers:[30,60,100,150,220],unit:'val',slots:['armor'],group:'amSh',weight:30},
  {id:'arcMageElemDmg',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['helm'],group:'amED',weight:30},
  {id:'arcRangerDmg',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['xbow'],group:'arD2',weight:30},
  {id:'arcRangerRange',type:0,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['xbow'],group:'arRg',weight:30},
  {id:'arcRangerPierce',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['xbow'],group:'arPr',weight:30},
  {id:'arcRangerMS',type:0,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['boots'],group:'arMS',weight:35},
  {id:'arcTankHP',type:0,tiers:[40,80,130,200,280],unit:'val',slots:['armor'],group:'atHP',weight:30},
  {id:'arcTankDef',type:0,tiers:[5,10,18,28,40],unit:'val',slots:['armor','shield'],group:'atDf',weight:30},
  {id:'arcTankBlock',type:0,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['shield'],group:'atBk',weight:30},
  {id:'arcTankThorns',type:1,tiers:[4,8,14,22,32],unit:'val',slots:['armor'],group:'atTh',weight:35},
  {id:'arcAssassinCrit',type:1,tiers:[.02,.04,.06,.09,.13],unit:'pct',slots:['wpn'],group:'aaCr',weight:25},
  {id:'arcAssassinBack',type:1,tiers:[.15,.25,.40,.60,.85],unit:'pct',slots:['wpn'],group:'aaBk',weight:20,tierW:[40,30,20,8,2]},
  {id:'arcAssassinPoison',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['wpn'],group:'aaPo',weight:30},
  {id:'arcAssassinDodge',type:1,tiers:[.02,.04,.06,.09,.13],unit:'pct',slots:['cloak'],group:'aaDg',weight:25},
  // 엔드게임 전용
  {id:'endBossKiller',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['wpn'],group:'eBK',weight:15,tierW:[40,30,20,8,2]},
  {id:'endSurvival',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['armor'],group:'eSv',weight:15,tierW:[40,30,20,8,2]},
  {id:'endShield',type:0,tiers:[50,100,180,280,400],unit:'val',slots:['armor'],group:'eSh',weight:15},
  {id:'endCritDmg',type:1,tiers:[.10,.20,.30,.40,.50],unit:'pct',slots:['wpn'],group:'eCD',weight:10,tierW:[40,30,20,8,2]},
  {id:'endAtkFlat',type:0,tiers:[30,70,150,260,400],unit:'val',slots:['wpn'],group:'eAF',weight:8,tierW:[40,30,20,8,2],skewRoll:3},
  {id:'endAllRes',type:1,tiers:[.04,.07,.11,.16,.22],unit:'pct',slots:['neck'],group:'eAR',weight:10,tierW:[40,30,20,8,2]},
  {id:'endAllDmg',type:1,tiers:[.05,.08,.14,.22,.30],unit:'pct',slots:['neck'],group:'eAD',weight:8,tierW:[40,30,20,8,2]},
  {id:'endAllDR',type:1,tiers:[.03,.05,.08,.12,.18],unit:'pct',slots:['armor'],group:'eADR',weight:8,tierW:[40,30,20,8,2]},
  {id:'endLeech',type:1,tiers:[.006,.012,.020,.030,.042],unit:'pct',slots:['wpn'],group:'eLch',weight:8,tierW:[40,30,20,8,2]},
  {id:'endPoise',type:0,tiers:[10,20,35,55,80],unit:'val',slots:['armor'],group:'ePo',weight:15},
  {id:'endCooldownAll',type:1,tiers:[-.03,-.05,-.08,-.12,-.18],unit:'pct',slots:['helm'],group:'eCA',weight:10,tierW:[40,30,20,8,2]},
  {id:'endExpBonus',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['neck'],group:'eEB',weight:15},
  {id:'endDropBonus',type:1,tiers:[.08,.14,.22,.32,.44],unit:'pct',slots:['boots'],group:'eDB',weight:15},
  {id:'endMaliceGain',type:1,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['ring'],group:'eMG',weight:20},
  {id:'endSTR',type:0,tiers:[8,16,28,44,65],unit:'val',slots:['ring'],group:'eStr',weight:12},
  {id:'endDEX',type:0,tiers:[8,16,28,44,65],unit:'val',slots:['ring'],group:'eDex',weight:12},
  {id:'endINT',type:0,tiers:[8,16,28,44,65],unit:'val',slots:['ring'],group:'eInt',weight:12},
  {id:'endLCK',type:0,tiers:[15,30,50,75,110],unit:'val',slots:['neck'],group:'eLck',weight:10},
  {id:'endGrit',type:1,tiers:[15,30,50,75,110],unit:'val',slots:['neck'],group:'eGrt',weight:10},
  {id:'endKillChain',type:1,tiers:[.06,.10,.16,.24,.34],unit:'pct',slots:['wpn'],group:'eKCh',weight:15},
  {id:'pierceFlat',type:1,tiers:[100,200,300,400,500],unit:'val',slots:['xbow'],group:'prFl',weight:40,tierW:[40,30,20,8,2]},
  // ═══ 유골함 (ossuary) 전용 — 전대 소환 (2026-09-01) ═══
  {id:'ancDmg',type:0,tiers:[.10,.18,.28,.40,.55],unit:'pct',slots:['ossuary'],group:'ancD',weight:80},
  {id:'ancHP',type:1,tiers:[.30,.60,.90,1.20,1.50],unit:'pct',slots:['ossuary'],group:'ancT',weight:70},
];
const _AFSLOT={weapon:'wpn',shield:'shield',boots:'boots',armor:'armor',helmet:'helm',bow:'xbow',gloves:'gloves',pants:'pants',belt:'belt',necklace:'neck',ring1:'ring',ring2:'ring',cape:'cloak',bracelet:'bracelet',headband:'headband',headband2:'headband',ossuary:'ossuary'};
const IMPLICIT_TABLE={
  weapon:  {ko:'공격력 +X%',       stat:'_iAtkPct',  val:[5,15]},
  bow:     {ko:'관통 확률 +X%',    stat:'_iPierce',  val:[5,15]},
  shield:  {ko:'방어율 +X%',       stat:'_iBlockPct',val:[3,8]},
  armor:   {ko:'물리 피해감소 +X%',stat:'_iPhysDR',  val:[3,8]},
  helmet:  {ko:'최대 HP +X',       stat:'_iMaxHP',   val:[10,30]},
  gloves:  {ko:'공격속도 +X%',     stat:'_iAtkSpd',  val:[3,8]},
  pants:   {ko:'상태이상 저항 +X%',stat:'_iStsRes',  val:[5,12]},
  boots:   {ko:'이동속도 +X%',     stat:'_iMovSpd',  val:[3,8]},
  ring1:   {ko:'원소 저항 +X%',    stat:'_iElemRes', val:[8,15]},
  ring2:   {ko:'원소 저항 +X%',    stat:'_iElemRes', val:[8,15]},
  necklace:{ko:'최대 HP +X%',      stat:'_iMaxHPPct',val:[5,12]},
  cape:    {ko:'회피 쿨다운 -X%',  stat:'_iDashCd',  val:[5,12]},
  belt:    {ko:'물약 쿨다운 -X%',  stat:'_iBeltPot', val:[3,8]},
  bracelet_demon:{ko:'부활력 +X%',  stat:'_iRevPow',  val:[5,12]},
  bracelet_life:{ko:'최대 HP +X%', stat:'_iLifeHPPct',val:[5,12]},
  headband:{ko:'마법 데미지 +X%',  stat:'_iMagDmg',  val:[5,12]},
  ossuary: {ko:'전대 위력 +X%',    stat:'_iAncPow',  val:[5,15]},
};
const LEGENDARY_SPECIAL={
  weapon_sword:    {ko:'5타 콤보 완성 시 데빌포스 20% 즉시 충전',         stat:'_lSwordCombo', val:0.20},
  weapon_dagger:   {ko:'처치 시 이속 +40%(3초) + 다음 공격 크리 보장',    stat:'_lDaggerKill', val:1},
  weapon_hammer:   {ko:'스태거 발동 시 범위 충격파 (ATK×120%)',           stat:'_lHammerShock',val:1.20},
  weapon_mace:     {ko:'스태거 발동 시 범위 충격파 (ATK×100%)',           stat:'_lMaceShock',  val:1.00},
  weapon_club:     {ko:'강타 시 적 넉백 거리 2배 + 벽충돌 추가뎀',        stat:'_lClubKB',     val:2},
  weapon_axe:      {ko:'출혈 대상 크리 시 잔여 DoT×300% 즉시 폭발',       stat:'_lAxeBleed',   val:3.00},
  weapon_spear:    {ko:'사슬 착지 타격 수만큼 데미지 +20% 중첩(최대5)',    stat:'_lSpearStack', val:0.20},
  bow:             {ko:'치명타 시 추가 투사체 1발 발사',                   stat:'_lBowCrit',    val:1},
  shield:          {ko:'패리 성공 시 반격 데미지 ×2',                     stat:'_lShieldParry',val:2},
  armor:           {ko:'피격 시 3초 쿨로 HP 5% 즉시 회복',               stat:'_lArmorRegen', val:0.05},
  helmet:          {ko:'스킬 사용 시 20% 확률로 쿨다운 미소모',           stat:'_lHelmFree',   val:0.20},
  gloves:          {ko:'공격속도 +20% + 기본공격에 랜덤 원소 추가',       stat:'_lGloveElem',  val:1},
  pants:           {ko:'이동 중 지속 HP 재생 (초당 HP의 1%)',             stat:'_lPantsRegen', val:0.01},
  boots:           {ko:'회피 직후 첫 공격 데미지 +80%',                   stat:'_lBootsEvade', val:0.80},
  cape:            {ko:'패리 타이밍 판정 +50% 확대',                      stat:'_lCapeParry',  val:0.50},
  ring1:           {ko:'원소 반응 발동 시 추가 폭발 (ATK×80%)',           stat:'_lRingElem',   val:0.80},
  ring2:           {ko:'처치 시 데빌포스 5% 회복',                        stat:'_lRingKill',   val:0.05},
  necklace:        {ko:'HP 50% 이하 시 전 스킬 쿨다운 -30%',             stat:'_lNeckLow',    val:0.30},
  belt:            {ko:'물약 사용 시 5초간 피해 +15%',                    stat:'_lBeltBuff',   val:0.15},
};
const UNIQUE_SPECIAL={
  weapon_sword:    {ko:'분노의 최대치가 100% 추가된다 (200%까지)',          stat:'_uRageMax',      val:100},
  weapon_dagger:   {ko:'패링한 탄막의 관통률이 100% 추가된다',              stat:'_uDaggerPierce', val:1.0},
  weapon_hammer:   {ko:'폭발 데미지 50% 증가',                             stat:'_uExplDmg',      val:0.50},
  weapon_axe:      {ko:'출혈 적에게 공격 시 HP 5% 흡수',                   stat:'_uAxeLeech',     val:0.05},
  weapon_mace:     {ko:'적 처치 시 폭발 (최대HP의 30% AoE)',               stat:'_uMaceExplode',  val:0.30},
  weapon_club:     {ko:'적 스턴 중 데미지 ×3',                            stat:'_uClubStun',     val:3},
  bow:             {ko:'투사체 관통력 50% 증가',                           stat:'_uBowPierce',    val:0.5},
  shield:          {ko:'보호막이 탄막을 흡수하면 분노 10%를 생성한다',       stat:'_uShieldRage',   val:10},
  armor:           {ko:'피격 시 25% 확률로 데미지를 분노로 전환',           stat:'_uArmorRage',    val:0.25},
  helmet:          {ko:'마법 스킬 데미지 +50% + 마나 소모 -50%',           stat:'_uHelmMagic',    val:0.50},
  gloves:          {ko:'공격속도 +40%',                                   stat:'_uGloveSpd',     val:0.40},
  cape:            {ko:'패링 성공 시 분노스킬 쿨다운 {s}초 회복',           stat:'_uParryRageCd',  val:30, roll:[30,60]},
};
function rollAffixes(grade,slot,brType){
  const aSlot=_AFSLOT[slot];if(!aSlot)return[];
  // 캐시된 풀 (첫 호출 시 생성, 팔찌는 서브타입별 캐시)
  if(!rollAffixes._c)rollAffixes._c={};
  const ck=aSlot+(brType?'_'+brType:'');
  if(!rollAffixes._c[ck]){
    const sa=[];for(let i=0;i<AFFIX_POOL.length;i++){const a=AFFIX_POOL[i];if(a.slots.indexOf(aSlot)<0)continue;if(a.brType&&a.brType!==brType)continue;if(_DEMO_MODE&&_DEMO_AFFIX_BANNED.has(a.id))continue;sa.push(a)}
    rollAffixes._c[ck]={pre:[],suf:[]};
    for(let i=0;i<sa.length;i++){if(sa[i].type===0)rollAffixes._c[ck].pre.push(sa[i]);else rollAffixes._c[ck].suf.push(sa[i])}
  }
  const cc=rollAffixes._c[ck];
  const maxCount=[0,2,3,5,6,7][grade]||0;
  const result=[];const usedG={};
  const order=grade%2===1?[cc.pre,cc.suf]:[cc.suf,cc.pre];
  for(let i=0;i<maxCount;i++){
    const pool=order[i%2];
    const _baseTier=grade>=4?2:grade>=3?1:0;
    const _lvBonus=~~((P?P.lv:1)/200);
    // 가중치 선택 (중복 그룹 제외, T1이 null이면 제외)
    let tw=0;for(let j=0;j<pool.length;j++){if(!usedG[pool[j].group]&&pool[j].tiers[0]!=null)tw+=pool[j].weight}
    if(tw<=0)continue;
    let r=Math.random()*tw;
    for(let j=0;j<pool.length;j++){
      const a=pool[j];if(usedG[a.group]||a.tiers[0]==null)continue;
      r-=a.weight;if(r<=0){
        // 티어 상한: 등급 + 200렙 보너스, 어픽스별 cap
        const maxTier=Math.min(a.tiers.length-1,_baseTier+_lvBonus);
        let val,tierIdx;
        if(a.tierW){
          let _twSum=0;for(let _ti=0;_ti<=maxTier;_ti++)_twSum+=(a.tierW[_ti]||1);
          let _tr=Math.random()*_twSum;tierIdx=0;
          for(let _ti=0;_ti<=maxTier;_ti++){_tr-=(a.tierW[_ti]||1);if(_tr<=0){tierIdx=_ti;break}}
          val=a.tiers[tierIdx];
        }else{
          const lo=a.tiers[0],hi=a.tiers[maxTier];
          const _rr=a.skewRoll?Math.pow(Math.random(),a.skewRoll):Math.random();
          val=a.unit==='cnt'||a.unit==='val'?lo+~~(_rr*(hi-lo+1)):+(lo+(hi-lo)*_rr).toFixed(4);
          tierIdx=val>=a.tiers[Math.min(2,maxTier)]?maxTier:val>=a.tiers[Math.min(1,maxTier)]?Math.min(1,maxTier):0;
        }
        result.push({id:a.id,tier:tierIdx,value:val});usedG[a.group]=1;break}
    }
  }
  return result;
}
function mkItem(slot,tier,el,rarity,wtype){
  if(slot==='headband2'){const item=mkItem('headband',tier,el,rarity,wtype);item.slot=slot;return item}
  const rm=RARITY_MUL[rarity];
  // (구 wpNames 제거) 무기 표시명은 _weaponName(wt,el,tier) = 수식어 + WTYPES[wt].name 로 생성. 위 _WP_MOD 참조.
  const bowNames={
    crossbow:{0:['낡은 석궁','강철 석궁','흑요석 석궁','미스릴 석궁','천벌의 석궁'],1:['불꽃 석궁','화염 석궁','염화 석궁','지옥 석궁','멸화의 석궁'],2:['냉기 석궁','빙결 석궁','빙하 석궁','서리의 석궁','영겁빙 석궁'],3:['그림자 석궁','암흑 석궁','심연 석궁','나락 석궁','무간의 석궁'],4:['전기 석궁','낙뢰 석궁','암전 석궁','뇌신 석궁','만뢰의 석궁']},
    repeater:{0:['낡은 연사석궁','강철 연사석궁','흑요석 연사석궁','미스릴 연사석궁','천벌의 연사석궁'],1:['불꽃 연사석궁','화염 연사석궁','염화 연사석궁','지옥 연사석궁','멸화의 연사석궁'],2:['냉기 연사석궁','빙결 연사석궁','빙하 연사석궁','서리의 연사석궁','영겁빙 연사석궁'],3:['그림자 연사석궁','암흑 연사석궁','심연 연사석궁','나락 연사석궁','무간의 연사석궁'],4:['전기 연사석궁','낙뢰 연사석궁','암전 연사석궁','뇌신 연사석궁','만뢰의 연사석궁']},
    arcane:{0:['낡은 마력석궁','강철 마력석궁','흑요석 마력석궁','미스릴 마력석궁','천벌의 마력석궁'],1:['불꽃 마력석궁','화염 마력석궁','염화 마력석궁','지옥 마력석궁','멸화의 마력석궁'],2:['냉기 마력석궁','빙결 마력석궁','빙하 마력석궁','서리의 마력석궁','영겁빙 마력석궁'],3:['그림자 마력석궁','암흑 마력석궁','심연 마력석궁','나락 마력석궁','무간의 마력석궁'],4:['전기 마력석궁','낙뢰 마력석궁','암전 마력석궁','뇌신 마력석궁','만뢰의 마력석궁']},
  };
  const names={
    weapon:null,// handled separately
    shield:{0:['나무 견갑','철 견갑','강철 대견갑','미스릴 견갑','파멸의 견갑'],1:['불꽃 견갑','화염 견갑','염화 견갑','지옥화 견갑','멸화의 견갑'],2:['냉기 견갑','빙결 견갑','빙하 견갑','서리의 견갑','영겁빙 견갑'],3:['그림자 견갑','암흑 견갑','심연 견갑','나락 견갑','무간의 견갑'],4:['전기 견갑','낙뢰 견갑','암전 견갑','뇌신 견갑','만뢰의 견갑'],5:['축복 견갑','성광 견갑','신성 견갑','천사의 견갑','신벌의 견갑']},
    boots:{0:['낡은 전투화','강철 전투화','흑요석 전투화','미스릴 전투화','천벌의 전투화'],1:['불꽃 전투화','화염 전투화','염화 전투화','지옥 전투화','멸화의 전투화'],2:['냉기 전투화','빙결 전투화','빙하 전투화','서리 전투화','영겁빙 전투화'],3:['그림자 전투화','암흑 전투화','심연 전투화','나락 전투화','무간의 전투화'],4:['전기 전투화','낙뢰 전투화','암전 전투화','뇌신 전투화','만뢰의 전투화'],5:['축복 전투화','성광 전투화','신성 전투화','천사의 전투화','신벌의 전투화']},
    armor:{0:['천 갑옷','가죽 갑주','강철 갑주','미스릴 갑주','천벌의 갑주'],1:['불꽃 갑옷','화염 갑주','염화 갑주','지옥화 갑주','멸화의 갑주'],2:['냉기 갑옷','빙결 갑주','빙하 갑주','서리의 갑주','영겁빙 갑주'],3:['그림자 갑옷','암흑 갑주','심연 갑주','나락 갑주','무간의 갑주'],4:['전기 갑옷','낙뢰 갑주','암전 갑주','뇌신 갑주','만뢰의 갑주'],5:['축복 갑옷','성광 갑주','신성 갑주','천사의 갑주','신벌의 갑주']},
    helmet:{0:['낡은 머리띠','강철 헤드밴드','흑요석 서클릿','미스릴 티아라','천벌의 왕관'],1:['불꽃 머리띠','화염 헤드밴드','염화 서클릿','지옥화 티아라','멸화의 왕관'],2:['냉기 머리띠','빙결 헤드밴드','빙하 서클릿','서리의 티아라','영겁빙 왕관'],3:['그림자 머리띠','암흑 헤드밴드','심연 서클릿','나락의 티아라','무간의 왕관'],4:['전기 머리띠','낙뢰 헤드밴드','암전 서클릿','뇌신의 티아라','만뢰의 왕관'],5:['축복 머리띠','성광 헤드밴드','신성 서클릿','천사의 티아라','신벌의 왕관']},
    bow:null,// handled separately
    gloves:{0:['천 장갑','가죽 장갑','강철 건틀릿','미스릴 건틀릿','천벌의 건틀릿'],1:['불꽃 장갑','화염 건틀릿','염화 건틀릿','지옥화 건틀릿','멸화의 건틀릿'],2:['냉기 장갑','빙결 건틀릿','빙하 건틀릿','서리의 건틀릿','영겁빙 건틀릿'],3:['그림자 장갑','암흑 건틀릿','심연 건틀릿','나락 건틀릿','무간의 건틀릿'],4:['전기 장갑','낙뢰 건틀릿','암전 건틀릿','뇌신 건틀릿','만뢰의 건틀릿'],5:['축복 장갑','성광 건틀릿','신성 건틀릿','천사의 건틀릿','신벌의 건틀릿']},
    pants:{0:['천 바지','가죽 바지','강철 각반','미스릴 각반','천벌의 각반'],1:['불꽃 바지','화염 각반','염화 각반','지옥화 각반','멸화의 각반'],2:['냉기 바지','빙결 각반','빙하 각반','서리의 각반','영겁빙 각반'],3:['그림자 바지','암흑 각반','심연 각반','나락 각반','무간의 각반'],4:['전기 바지','낙뢰 각반','암전 각반','뇌신 각반','만뢰의 각반'],5:['축복 바지','성광 각반','신성 각반','천사의 각반','신벌의 각반']},
    belt:{0:['낡은 허리띠','가죽 벨트','강철 벨트','미스릴 벨트','천벌의 벨트'],1:['불꽃 허리띠','화염 벨트','염화 벨트','지옥 벨트','멸화의 벨트'],2:['냉기 허리띠','빙결 벨트','빙하 벨트','서리의 벨트','영겁빙 벨트'],3:['그림자 허리띠','암흑 벨트','심연 벨트','나락 벨트','무간의 벨트'],4:['전기 허리띠','낙뢰 벨트','암전 벨트','뇌신 벨트','만뢰의 벨트'],5:['축복 허리띠','성광 벨트','신성 벨트','천사의 벨트','신벌의 벨트']},
    necklace:{0:['낡은 부적','은 목걸이','흑요석 목걸이','미스릴 목걸이','천벌의 목걸이'],1:['불꽃 부적','화염 목걸이','염화 목걸이','지옥화 목걸이','멸화의 목걸이'],2:['냉기 부적','빙결 목걸이','빙하 목걸이','서리의 목걸이','영겁빙 목걸이'],3:['그림자 부적','암흑 목걸이','심연 목걸이','나락 목걸이','무간의 목걸이'],4:['전기 부적','낙뢰 목걸이','암전 목걸이','뇌신 목걸이','만뢰의 목걸이'],5:['축복 부적','성광 목걸이','신성 목걸이','천사의 목걸이','신벌의 목걸이']},
    ring1:{0:['녹슨 반지','은 반지','흑요석 반지','미스릴 반지','천벌의 반지'],1:['불꽃 반지','화염 반지','염화 반지','지옥 반지','멸화의 반지'],2:['냉기 반지','빙결 반지','빙하 반지','서리 반지','영겁빙 반지'],3:['그림자 반지','암흑 반지','심연 반지','나락 반지','무간의 반지'],4:['전기 반지','낙뢰 반지','암전 반지','뇌신 반지','만뢰의 반지'],5:['축복 반지','성광 반지','신성 반지','천사의 반지','신벌의 반지']},
    ring2:null,// ring1 이름 공유
    cape:{0:['낡은 망토','가죽 망토','강철사 망토','미스릴 망토','천벌의 망토'],1:['불꽃 망토','화염 망토','염화 망토','지옥 망토','멸화의 망토'],2:['냉기 망토','빙결 망토','빙하 망토','서리의 망토','영겁빙 망토'],3:['그림자 망토','암흑 망토','심연 망토','나락 망토','무간의 망토'],4:['전기 망토','낙뢰 망토','암전 망토','뇌신 망토','만뢰의 망토'],5:['축복 망토','성광 망토','신성 망토','천사의 망토','신벌의 망토']},
    bracelet:{0:['낡은 팔찌','은 팔찌','흑요석 팔찌','미스릴 팔찌','천벌의 팔찌'],1:['불꽃 팔찌','화염 팔찌','염화 팔찌','지옥 팔찌','멸화의 팔찌'],2:['냉기 팔찌','빙결 팔찌','빙하 팔찌','서리의 팔찌','영겁빙 팔찌'],3:['그림자 팔찌','암흑 팔찌','심연 팔찌','나락 팔찌','무간의 팔찌'],4:['전기 팔찌','낙뢰 팔찌','암전 팔찌','뇌신 팔찌','만뢰의 팔찌'],5:['축복 팔찌','성광 팔찌','신성 팔찌','천사의 팔찌','신벌의 팔찌']},
    headband:{0:['낡은 귀걸이','은사 귀걸이','흑요석 귀걸이','미스릴 귀걸이','천벌의 귀걸이'],1:['불꽃 귀걸이','화염 귀걸이','염화 귀걸이','지옥 귀걸이','멸화의 귀걸이'],2:['냉기 귀걸이','빙결 귀걸이','빙하 귀걸이','서리의 귀걸이','영겁빙 귀걸이'],3:['그림자 귀걸이','암흑 귀걸이','심연 귀걸이','나락 귀걸이','무간의 귀걸이'],4:['전기 귀걸이','낙뢰 귀걸이','암전 귀걸이','뇌신 귀걸이','만뢰의 귀걸이'],5:['축복 귀걸이','성광 귀걸이','신성 귀걸이','천사의 귀걸이','신벌의 귀걸이']},
    ossuary:{0:['낡은 유골함','백골 유골함','흑요석 유골함','미스릴 유골함','천벌의 유골함'],1:['불꽃 유골함','화염 유골함','염화 유골함','지옥 유골함','멸화의 유골함'],2:['냉기 유골함','빙결 유골함','빙하 유골함','서리의 유골함','영겁빙 유골함'],3:['그림자 유골함','암흑 유골함','심연 유골함','나락 유골함','무간의 유골함'],4:['전기 유골함','낙뢰 유골함','암전 유골함','뇌신 유골함','만뢰의 유골함'],5:['축복 유골함','성광 유골함','신성 유골함','천사의 유골함','신벌의 유골함']},
  };
  // ═══ 디아블로식 ATK 롤: base × skew랜덤, 레어리티=최소보장 ═══
  const _atkMax=~~((200+tier*200+(P.lv||1))*0.25); // tier0=50, tier4=250, +레벨/4 (2차반감 2026-05-03)
  const _atkFloor=[0,.05,.15,.25,.40,.50][rarity]||0; // 일반0%, 고급5%, 희귀15%, 영웅25%, 전설40%, 유니크50%
  const _atkRoll=Math.max(1,~~(_atkMax*(_atkFloor+(1-_atkFloor)*Math.pow(Math.random(),2)))); // skew: 고뎀 극악, 최소1
  const base={
    weapon:{atk:_atkRoll,spd:1,antiRevive:+(0.01+0.19*Math.pow(Math.random(),3)).toFixed(2)},
    // DEF/eDef 5티어 선형 통일: T0=10, T1=20, T2=30, T3=40, T4=50 (12슬롯 × 50 = 총 600 방어)
    // eDef는 전 속성 공통이라 절반 스케일 (T4=25, 총 최대 ~150)
    // 방어구 6파트: 물리DEF만, 20+tier*20 (T0=20~T4=100, 6세트 풀=600)
    // bonusHp/Shield/St/Mp 티어별 랜덤 범위(반감): T0=10~50, T1=60~100, T2=110~150, T3=160~200, T4=210~250
    // 방어구 6파트: bonusHp + bonusSt
    shield:{def:20+tier*20,stagger:15+tier*8,shieldWt:10-tier,bonusHp:~~(tier*50+10+Math.random()*40),bonusSt:~~(tier*50+10+Math.random()*40),antiRevive:+(0.01+0.19*Math.pow(Math.random(),3)).toFixed(2)},
    boots:{def:20+tier*20,spd:tier*.08,bonusSt:~~(tier*50+10+Math.random()*40),chargeDist:14+tier*3,bonusHp:~~(tier*50+10+Math.random()*40)},
    armor:{def:20+tier*20,charge:8+tier*5,chargeDist:22+tier*4,chargeW:12+tier*5,chargeAoE:0,bonusSt:~~(tier*50+10+Math.random()*40),bonusHp:~~(tier*50+10+Math.random()*40)},
    // 무기 파트(helmet,weapon,bow): bonusHp/bonusShield/bonusSt/bonusMp 없음 — 공격 전용
    helmet:{atk:_atkRoll,beamDmg:1.5+tier*1.2,def:20+tier*20},
    bow:{atk:_atkRoll,spd:1,antiRevive:+(0.01+0.19*Math.pow(Math.random(),3)).toFixed(2)},
    gloves:{def:20+tier*20,spd:tier*.04,bonusHp:~~(tier*50+10+Math.random()*40),bonusSt:~~(tier*50+10+Math.random()*40)},
    pants:{def:20+tier*20,bonusSt:~~(tier*50+10+Math.random()*40),bonusHp:~~(tier*50+10+Math.random()*40)},
    cape:{def:20+tier*20,spd:tier*.03,bonusHp:~~(tier*50+10+Math.random()*40),bonusSt:~~(tier*50+10+Math.random()*40)},
    // 장신구 6파트: bonusShield + bonusMp
    belt:{eDef:20+tier*20,dmgBonus:10+tier*10,bonusSt:(4+tier*3),bonusShield:~~(tier*50+10+Math.random()*40),bonusMp:~~(tier*50+10+Math.random()*40)},
    necklace:{eDef:20+tier*20,critRate:10,dmgBonus:20+tier*20,bonusShield:~~(tier*50+10+Math.random()*40),bonusMp:~~(tier*50+10+Math.random()*40)},
    ring1:{eDef:20+tier*20,critRate:5,dmgBonus:10+tier*10,bonusShield:~~(tier*50+10+Math.random()*40),bonusMp:~~(tier*50+10+Math.random()*40)},
    ring2:{eDef:20+tier*20,critRate:5,dmgBonus:10+tier*10,bonusShield:~~(tier*50+10+Math.random()*40),bonusMp:~~(tier*50+10+Math.random()*40)},
    bracelet:{eDef:20+tier*20,dmgBonus:10+tier*10,bonusShield:~~(tier*50+10+Math.random()*40),bonusMp:~~(tier*50+10+Math.random()*40)},
    headband:{eDef:20+tier*20,dmgBonus:10+tier*10,mpRegen:(1+tier*1)*2,bonusShield:~~(tier*50+10+Math.random()*40),bonusMp:~~(tier*50+10+Math.random()*40)},
    // 유골함: 단일 철갑 전대 소환 전용 (ancPow는 별도 블록에서 부여) — 장신구 파트 준거: eDef + bonusMp
    ossuary:{eDef:20+tier*20,bonusMp:~~(tier*50+10+Math.random()*40)}
  };
  const b=base[slot];
  if(!b)return{id:~~(performance.now()*1000)+~~(Math.random()*9999),slot,el,rarity,tier,name:'???',emoji:'❓'};
  if(slot==='weapon'||slot==='shield') el=EL.P;
  const item={id:Date.now()+Math.random(),slot,el,rarity,tier,
    name:(slot==='weapon'||slot==='bow')?'':(slot==='ring2'?names['ring1'][el][Math.min(tier,4)]:names[slot]?names[slot][el][Math.min(tier,4)]:''),
    emoji:SLOT_EMOJI[SLOT_NAMES.indexOf(slot)]};
  // Weapon type system
  if(slot==='weapon'){
    const wt=wtype||(WTYPE_KEYS[~~(Math.random()*WTYPE_KEYS.length)]);
    const wd=WTYPES[wt];
    item.wtype=wt;
    item.name=_weaponName(wt,el,tier);
    item.emoji=wd.emoji;
    item.atk=~~(_atkRoll*wd.atkMul);
    item.spd=+(wd.spdMul*rm).toFixed(2);
    item.wStCost=~~(wd.stCost*(2-rm*.3)); // better rarity = slightly less cost
    item.wArcW=+wd.arcW.toFixed(2);
    item.wRange=~~(wd.range*(0.95+Math.random()*.1));
    item.wStagger=~~(wd.stagger*rm);
    item.bonusRange=Math.min(3,~~((1+tier*.4+rarity*.5)*(0.8+Math.random()*.4)));
  }
  // Bow type system
  if(slot==='bow'){
    const bt2=wtype||(BTYPE_KEYS[~~(Math.random()*BTYPE_KEYS.length)]);
    const bd=BOWTYPES[bt2];if(!bd)return item;
    item.btype=bt2;
    item.name=(bowNames[bt2]&&bowNames[bt2][el])?bowNames[bt2][el][Math.min(tier,4)]:(bd.name||'석궁');
    item.emoji=bd.emoji;
    item.atk=~~(_atkRoll*bd.atkMul);
    item.bowSpd=+(bd.spdMul*rm).toFixed(2);
    item.bowStCost=~~(bd.stCost*(2-rm*.3));
    item.bowRange=~~(bd.range*(0.95+Math.random()*.1));
    item.bowProjSpd=bd.projSpd;
    item.bonusRange=Math.min(3,~~((1+tier*.4+rarity*.5)*(0.8+Math.random()*.4)));
    item.bowPierce=+((0.02+tier*0.03+rarity*0.04)*(0.8+Math.random()*0.4)).toFixed(2); // 관통 확률 보너스
  }
  // Shield: shieldWt (무게→막기 중 감속)
  if(slot==='shield'){
    item.bonusRange=Math.min(3,~~((1+tier*.4+rarity*.5)*(0.8+Math.random()*.4)));
    item.shieldWt=Math.max(1,~~(b.shieldWt*(2-rm*.3))); // 고급일수록 가벼움
  }
  if(slot!=='weapon'&&slot!=='bow'&&b.atk)item.atk=slot==='helmet'?b.atk:~~(b.atk*rm*(0.9+Math.random()*.2));
  if(b.def)item.def=~~(b.def*rm*(0.9+Math.random()*.2));
  if(b.eDef)item.eDef=~~(b.eDef*rm*(0.9+Math.random()*.2));
  if(slot!=='weapon'&&slot!=='bow'&&b.spd!==undefined)item.spd=+(b.spd*rm).toFixed(2);
  if(b.bonusSt)item.bonusSt=~~(b.bonusSt*rm*(0.9+Math.random()*.2));
  if(b.charge)item.charge=~~(b.charge*rm*(0.9+Math.random()*.2));
  if(b.chargeDist)item.chargeDist=~~(b.chargeDist*rm);
  if(b.chargeW)item.chargeW=~~(b.chargeW*rm*(0.9+Math.random()*.2));
  // Armor: bonus attack range + bonus charge distance
  if(slot==='armor'){
    item.bonusRange=Math.min(3,~~((1+tier*.4+rarity*.5)*(0.8+Math.random()*.4)));
    item.bonusChargeDist=Math.min(3,~~((1+tier*.35+rarity*.45)*(0.8+Math.random()*.4)));
  }
  // Charge AoE on epic+ armor only
  if(slot==='armor'&&rarity>=3){
    const aoBase=rarity===4?(40+tier*12):(25+tier*8);
    item.chargeAoE=~~(aoBase*(0.9+Math.random()*.2));
  }
  if(b.stagger)item.stagger=~~(b.stagger*rm);
  if(b.range)item.range=~~(b.range*rm*(0.9+Math.random()*.2));
  if(b.bonusHp)item.bonusHp=b.bonusHp;
  if(b.bonusShield)item.bonusShield=b.bonusShield;
  if(b.bonusMp)item.bonusMp=b.bonusMp;
  // 부츠: 돌진 충전 (언커먼+ 랜덤)
  if(slot==='boots'&&rarity>=1){
    const ccChance=[0,.2,.4,.7,1][rarity];
    if(Math.random()<ccChance)item.chargeCharge=rarity>=3?1+~~(Math.random()*2):1;
  }
  // 자원 옵션 제거 — 스탯만 부여
  // Helmet: multi-element beam
  if(slot==='helmet'){
    item.beamDmg=+(b.beamDmg*rm).toFixed(1);
    item.elements=[{el:el,dmg:~~(item.beamDmg*(8+tier*3))}];
    const extraEls=[EL.F,EL.I,EL.D,EL.L,EL.H].filter(e=>e!==el);
    const extraCount=rarity>=4?3:rarity>=3?2:rarity>=2?1:0;
    const used=new Set([el]);
    for(let i=0;i<extraCount;i++){
      const pool=extraEls.filter(e=>!used.has(e));if(!pool.length)break;
      const ee=pool[~~(Math.random()*pool.length)];used.add(ee);
      item.elements.push({el:ee,dmg:~~(item.beamDmg*(4+tier*2)*(0.7+Math.random()*.3))});
    }
    if(rarity>=4&&item.elements.length>=3)item.name='혼돈의 왕관';
    if(rarity>=4&&item.elements.length>=4)item.name='전지전능의 왕관';
    // Magic splash stats (helmet only)
    if(rarity>=1) item.splashR=Math.min(10,~~((10+tier*6+rarity*8)*(0.9+Math.random()*.2))); // splash radius bonus, max 10
    if(rarity>=2) item.splashMul=+((0.15+rarity*0.08+tier*0.03)*(0.9+Math.random()*.2)).toFixed(2); // splash dmg multiplier bonus
    if(rarity>=3) item.magicPen=rarity>=4?(2+~~(tier/2)):1; // magic pierce count
    // Helmet bonus range (attack range), max 5
    item.bonusRange=Math.min(5,~~((1+tier*.6+rarity*.8)*(0.8+Math.random()*.4)));
  }
  // 장갑: 물약속도 + 공속
  if(slot==='gloves'){
    item.potCd=+([.05,.10,.15,.20,.30][rarity]*(0.9+Math.random()*.2)).toFixed(3);
    if(rarity>=1) item.atkSpd=+((0.02+rarity*0.015+tier*0.005)*(0.9+Math.random()*.2)).toFixed(3);
  }
  // 바지: HP 보너스 (base 200 + 추가)
  if(slot==='pants'){
    item.bonusHp=(item.bonusHp||0)+~~((5+tier*4+rarity*6)*(0.9+Math.random()*.2));
  }
  // 벨트: 물약 쿨감 + HP 보너스 (base 200 + 추가)
  if(slot==='belt'){
    item.potCd=+([.03,.06,.10,.15,.22][rarity]*(0.9+Math.random()*.2)).toFixed(3);
    item.bonusHp=(item.bonusHp||0)+~~((3+tier*2+rarity*4)*(0.9+Math.random()*.2));
  }
  // 반지: 장신구 파트 (크리 어픽스 제거 2026-04-10, 속성저항/자원 어픽스 2개 추가)
  if(slot==='ring1'||slot==='ring2'){
    // 반지 전용 추가 어픽스 2개 (장신구 파트 룰 준수)
    const _ringAffPool=['fireRes','iceRes','lightRes','darkRes','poisonRes','maxSTFlat','maxMPFlat','eDefFlat','lckFlatR','gritFlatR'];
    const _rAff1=_ringAffPool[~~(Math.random()*_ringAffPool.length)];
    let _rAff2=_ringAffPool[~~(Math.random()*_ringAffPool.length)];
    while(_rAff2===_rAff1)_rAff2=_ringAffPool[~~(Math.random()*_ringAffPool.length)];
    if(!item.affixes)item.affixes=[];
    const _affDef=AFFIX_POOL.find(a=>a.id===_rAff1);
    const _affDef2=AFFIX_POOL.find(a=>a.id===_rAff2);
    if(_affDef){const _aTier=Math.min(tier,_affDef.tiers.length-1);item.affixes.push({id:_rAff1,val:_affDef.tiers[_aTier]})}
    if(_affDef2){const _aTier2=Math.min(tier,_affDef2.tiers.length-1);item.affixes.push({id:_rAff2,val:_affDef2.tiers[_aTier2]})}
  }
  // 목걸이: 장신구 파트 (크리/뎀보너스 제거 2026-04-10, 속성저항/자원 어픽스 2개 추가)
  if(slot==='necklace'){
    const _neckAffPool=['fireRes','iceRes','lightRes','darkRes','poisonRes','allRes','maxSTFlat','maxMPFlat','eDefFlat','lckFlatN','gritFlatN','mpCostRed','expBonus'];
    const _nAff1=_neckAffPool[~~(Math.random()*_neckAffPool.length)];
    let _nAff2=_neckAffPool[~~(Math.random()*_neckAffPool.length)];
    while(_nAff2===_nAff1)_nAff2=_neckAffPool[~~(Math.random()*_neckAffPool.length)];
    if(!item.affixes)item.affixes=[];
    const _nDef1=AFFIX_POOL.find(a=>a.id===_nAff1);
    const _nDef2=AFFIX_POOL.find(a=>a.id===_nAff2);
    if(_nDef1){const _nt=Math.min(tier,_nDef1.tiers.length-1);item.affixes.push({id:_nAff1,val:_nDef1.tiers[_nt]})}
    if(_nDef2){const _nt2=Math.min(tier,_nDef2.tiers.length-1);item.affixes.push({id:_nAff2,val:_nDef2.tiers[_nt2]})}
  }
  // ── 스탯 보너스: 언커먼+ 아이템에 랜덤 부여 ──
  // 3파트 룰 (2026-04-10):
  //   무기 파트(weapon/bow/helmet): 스탯 보너스 금지
  //   장신구 파트(belt/bracelet/ring1/ring2/necklace/headband): LCK+근성 확정 + STR/DEX/INT 중 1개 랜덤
  //   방어구 파트(shield/armor/gloves/pants/boots/cape): STR/DEX/INT
  const _isWeaponPart=(slot==='weapon'||slot==='bow'||slot==='helmet');
  const _isAccess=(slot==='belt'||slot==='bracelet'||slot==='ring1'||slot==='ring2'||slot==='necklace'||slot==='headband'||slot==='ossuary');
  if(rarity>=1 && !_isWeaponPart){
    if(_isAccess){
      // 악세사리: LCK+근성 확정, STR/DEX/INT 중 1개 랜덤
      const _svCalc=()=>~~((4+tier*4+rarity*6)*(0.8+Math.random()*.4));
      item.bLck=_svCalc();
      item.bGrit=_svCalc();
      const _extra=['bStr','bDex','bInt'][~~(Math.random()*3)];
      item[_extra]=_svCalc();
    }else{
      const _statPool=['bStr','bDex','bInt'];
      const _statCount=rarity>=4?3:rarity>=3?2:rarity>=2?Math.random()<.6?2:1:Math.random()<.4?1:0;
      const _picked=[];for(let i=0;i<_statCount;i++){const pool=_statPool.filter(s=>!_picked.includes(s));if(!pool.length)break;const s=pool[~~(Math.random()*pool.length)];_picked.push(s)}
      for(const sk of _picked){
        const _sv=~~((4+tier*4+rarity*6)*(0.8+Math.random()*.4));
        item[sk]=_sv;
      }
    }
  }
  // ── 팔찌: 악마/생명 서브타입 ──
  if(slot==='bracelet'){
    item.brType=Math.random()<.5?'demon':'life';
    const _brNames={demon:{0:['낡은 악마의 팔찌','악마의 팔찌','흑요석 악마의 팔찌','미스릴 악마의 팔찌','천벌의 악마팔찌'],1:['불꽃 악마팔찌','화염 악마팔찌','염화 악마팔찌','지옥 악마팔찌','멸화의 악마팔찌'],2:['냉기 악마팔찌','빙결 악마팔찌','빙하 악마팔찌','서리 악마팔찌','영겁빙 악마팔찌'],3:['그림자 악마팔찌','암흑 악마팔찌','심연 악마팔찌','나락 악마팔찌','무간의 악마팔찌'],4:['전기 악마팔찌','낙뢰 악마팔찌','암전 악마팔찌','뇌신 악마팔찌','만뢰의 악마팔찌']},life:{0:['낡은 생명의 팔찌','생명의 팔찌','흑요석 생명팔찌','미스릴 생명팔찌','천벌의 생명팔찌'],1:['불꽃 생명팔찌','화염 생명팔찌','염화 생명팔찌','지옥 생명팔찌','멸화의 생명팔찌'],2:['냉기 생명팔찌','빙결 생명팔찌','빙하 생명팔찌','서리 생명팔찌','영겁빙 생명팔찌'],3:['그림자 생명팔찌','암흑 생명팔찌','심연 생명팔찌','나락 생명팔찌','무간의 생명팔찌'],4:['전기 생명팔찌','낙뢰 생명팔찌','암전 생명팔찌','뇌신 생명팔찌','만뢰의 생명팔찌']}};
    item.name=_brNames[item.brType][el]?_brNames[item.brType][el][Math.min(tier,4)]:(item.brType==='demon'?'악마의 팔찌':'생명의 팔찌');
  }
  // ── 유골함: 유니크 단일 아이템 (2026-09-01 도감 개편 — 등급/티어 롤 폐지, 하단 최종 오버라이드에서 고정) ──
  // ── 어픽스 시스템: 등급별 접두/접미 롤링 ──
  item.affixes=rollAffixes(rarity,slot,item.brType);
  // ── 임플리싯 (슬롯 고유 스탯 1개) ──
  const _implKey=slot==='bracelet'?'bracelet_'+item.brType:slot;
  const _impl=IMPLICIT_TABLE[_implKey];
  if(_impl){
    const _iv=_impl.val[0]+Math.random()*(_impl.val[1]-_impl.val[0]);
    item._implicitStat=_impl.stat;
    item._implicitVal=+_iv.toFixed(2);
    item._implicitKo=_impl.ko;
  }
  // ── 전설 특수 효과 ──
  item.legendarySpecial=null;
  if(rarity>=4){
    const _lsKey=(slot==='weapon'&&item.wtype)?'weapon_'+item.wtype:slot;
    const _ls=LEGENDARY_SPECIAL[_lsKey]||LEGENDARY_SPECIAL[slot];
    if(_ls)item.legendarySpecial={ko:_ls.ko,stat:_ls.stat,val:_ls.val};
  }
  // ── 유니크 특수 효과 (rarity=5 전용) ──
  item.uniqueSpecial=null;
  if(rarity>=5){
    const _usKey=(slot==='weapon'&&item.wtype)?'weapon_'+item.wtype:slot;
    const _us=UNIQUE_SPECIAL[_usKey]||UNIQUE_SPECIAL[slot];
    if(_us){let _uv=_us.val,_usc;if(_us.roll){_uv=_us.roll[0]+~~(Math.random()*(_us.roll[1]-_us.roll[0]+1));_usc=(_uv/60).toFixed(1)}item.uniqueSpecial={ko:_us.ko,stat:_us.stat,val:_uv,secs:_usc};item[_us.stat]=_uv}
  }
  // 아이템 레벨 = 캐릭터 레벨 기반, 10레벨 단위 (0~900), reqLv = itemLv-10
  const _pLv=P&&P.lv?P.lv:1;
  const itemLv=Math.min(900,Math.floor(_pLv/10)*10); // 10단위 내림, 캡 900
  item.itemLv=itemLv;
  item.reqLv=Math.max(0,itemLv-10);
  // ═══ 결정 슬롯 생성 (1~4소켓 랜덤) ═══
  const _scR=Math.random();
  item.socketCount=_scR<.50?1:_scR<.80?2:_scR<.95?3:4;
  item.crystals=new Array(item.socketCount).fill(null);
  // ═══ 유골함: 유니크 단일 아이템 고정 (2026-09-01 도감 개편) ═══
  // 랜덤 등급/티어/어픽스 롤 전부 무효 — 인자와 무관하게 '전대의 유골함' 1종 고정.
  // 소환 위력은 유골 도감(INV.ossCollect)의 부위 포인트에서 나온다. 획득: 첫 유골 부위 드랍 시 자동 지급.
  if(slot==='ossuary'){
    item.rarity=5;item.tier=0;item.el=EL.P;item.unique=true;
     item.name='전대의 유골함';item.emoji='⚱️';item.anc='iron_warlord';
    item.eDef=60;item.bonusMp=150;item.ancPow=0.25;
    delete item.bStr;delete item.bDex;delete item.bInt;delete item.bLck;delete item.bGrit;
    item.affixes=[{id:'ancHP',tier:3,value:.9}]; // 전대 최대HP +90% 고정
    item.legendarySpecial=null;item.uniqueSpecial=null;
    item._implicitStat='_iAncPow';item._implicitVal=10;item._implicitKo=(IMPLICIT_TABLE.ossuary&&IMPLICIT_TABLE.ossuary.ko)||'전대 위력 +X%';
    item.reqLv=0; // 자동 지급 즉시 장착 가능
    item.socketCount=2;item.crystals=[null,null];
  }
  return item;
}
  return function(slot,tier,element,rarity){
    if(slot!=='armor')throw new TypeError('reviewOnly armor fixture만 허용');
    return mkItem(slot,tier,element,rarity);
  };
}
