extends RefCounted
##
## starter_item_factory_source/producer.gd — 원 mkItem/defaultItems/NEW GAME 시작 장비 25개 팩토리.
## TASK GODOT-PORT-STARTER-ITEM-FACTORY-SOURCE-FIRST-20261013.
##
## 원 R(canonical game.html, 읽기전용):
##   mkItem(slot,tier,el,rarity,wtype)        @16405..16673
##   defaultItems()                           @16675..16677  — mkItem 15회(literal 순서)
##   NEW GAME                                 @64425..64430  — _di=defaultItems(); for(it of _di)INV.equipped[it.slot]=it;
##                                                            이후 bag 10개: 각 mkItem → INV.bag.push 즉시
##   rollAffixes(grade,slot,brType)           @15798..15841
##   IMPLICIT_TABLE @15741 / AFFIX_POOL @15103 / _AFSLOT @15097 / EL @15066 / _DEMO_MODE @17054=true /
##   _DEMO_AFFIX_BANNED @17058 / RARITY_MUL @15084 / SLOT_NAMES @15843 / SLOT_EMOJI @16349 / WTYPES @16374 /
##   _WP_MOD+_weaponName @16387..16394 / BOWTYPES @16397
##
## 이 모듈은 아이템을 실제로 생성하고(스탯/implicit/affix/socket/id) 중앙이 소유한 sink 로 배치만 한다.
## 소유 아님: INV/공유 RNG/시계/P/recalcSt/UI/save — 전부 생성자 고정 바인딩 Callable(중앙 소유 수명).
## 자체 RNG/seed/UID 카운터/시계 없음. 바인딩 누락 → NOT_READY (0/중립값 위장 금지).
##
## 지원 범위(시작 장비 25요청에 필요한 원 경로만): tier==0, rarity∈{0,1}, el∈{P,F,I,D,L}(0..4),
##   slot∈STARTER_SLOTS, weapon wtype∈WTYPES 명시, bow wtype=='crossbow' 명시,
##   rarity1 은 rollAffixes 풀이 내장된 슬롯(weapon/bow/helmet/armor/shield/boots/cape)만.
##   범위 밖 요청 → UNSUPPORTED_SCOPE (RNG/시계/레벨 호출 0회, 필드 합성 금지).
##
## status: READY / NOT_READY / UNSUPPORTED_SCOPE / PROVIDER_INVALID / SINK_REJECTED

const Catalog := preload("res://port_modules/item_armor_element/source_item_catalog.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const UNSUPPORTED_SCOPE := "UNSUPPORTED_SCOPE"
const PROVIDER_INVALID := "PROVIDER_INVALID"
const SINK_REJECTED := "SINK_REJECTED"

const BINDING_KEYS: Array[String] = ["random_unit", "now_ms", "player_level", "equip_slot", "append_bag"]

## 원 EL @15066
const EL := {"P": 0, "F": 1, "I": 2, "D": 3, "L": 4, "H": 5, "E": 6}

## defaultItems @16676 literal 순서 [slot, tier, el, rarity, wtype]
const DEFAULT_ITEM_REQUESTS: Array = [
	["weapon", 0, 0, 0, "sword"], ["shield", 0, 0, 0, null], ["boots", 0, 0, 0, null], ["armor", 0, 0, 0, null],
	["helmet", 0, 0, 0, null], ["bow", 0, 0, 0, "crossbow"], ["gloves", 0, 0, 0, null], ["pants", 0, 0, 0, null],
	["necklace", 0, 0, 0, null], ["ring1", 0, 0, 0, null], ["ring2", 0, 0, 0, null], ["cape", 0, 0, 0, null],
	["bracelet", 0, 0, 0, null], ["headband", 0, 0, 0, null], ["headband2", 0, 0, 0, null],
]
## NEW GAME bag @64426..64430 (_se=[F,I,D,L], _sw=['dagger','hammer','axe','spear'])
const BAG_ITEM_REQUESTS: Array = [
	["weapon", 0, 1, 1, "dagger"], ["weapon", 0, 2, 1, "hammer"], ["weapon", 0, 3, 1, "axe"], ["weapon", 0, 4, 1, "spear"],
	["armor", 0, 1, 1, null], ["shield", 0, 2, 1, null], ["helmet", 0, 3, 1, null], ["boots", 0, 4, 1, null],
	["cape", 0, 1, 1, null], ["bow", 0, 1, 1, "crossbow"],
]

const STARTER_SLOTS: Array[String] = ["weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants",
	"necklace", "ring1", "ring2", "cape", "bracelet", "headband", "headband2"]
const RARITY1_SLOTS: Array[String] = ["weapon", "bow", "helmet", "armor", "shield", "boots", "cape"]

## 원 names[slot][el][0] / bowNames.crossbow[el][0] / _brNames[type][el][0] — tier0 열만 (el 0..4)
const NAMES_T0 := {
	"shield": ["나무 견갑", "불꽃 견갑", "냉기 견갑", "그림자 견갑", "전기 견갑"],
	"boots": ["낡은 전투화", "불꽃 전투화", "냉기 전투화", "그림자 전투화", "전기 전투화"],
	"armor": ["천 갑옷", "불꽃 갑옷", "냉기 갑옷", "그림자 갑옷", "전기 갑옷"],
	"helmet": ["낡은 머리띠", "불꽃 머리띠", "냉기 머리띠", "그림자 머리띠", "전기 머리띠"],
	"gloves": ["천 장갑", "불꽃 장갑", "냉기 장갑", "그림자 장갑", "전기 장갑"],
	"pants": ["천 바지", "불꽃 바지", "냉기 바지", "그림자 바지", "전기 바지"],
	"necklace": ["낡은 부적", "불꽃 부적", "냉기 부적", "그림자 부적", "전기 부적"],
	"ring1": ["녹슨 반지", "불꽃 반지", "냉기 반지", "그림자 반지", "전기 반지"],
	"cape": ["낡은 망토", "불꽃 망토", "냉기 망토", "그림자 망토", "전기 망토"],
	"bracelet": ["낡은 팔찌", "불꽃 팔찌", "냉기 팔찌", "그림자 팔찌", "전기 팔찌"],
	"headband": ["낡은 귀걸이", "불꽃 귀걸이", "냉기 귀걸이", "그림자 귀걸이", "전기 귀걸이"],
}
const BOW_NAMES_CROSSBOW_T0: Array = ["낡은 석궁", "불꽃 석궁", "냉기 석궁", "그림자 석궁", "전기 석궁"]
const BR_NAMES_T0 := {
	"demon": ["낡은 악마의 팔찌", "불꽃 악마팔찌", "냉기 악마팔찌", "그림자 악마팔찌", "전기 악마팔찌"],
	"life": ["낡은 생명의 팔찌", "불꽃 생명팔찌", "냉기 생명팔찌", "그림자 생명팔찌", "전기 생명팔찌"],
}

## 원 IMPLICIT_TABLE @15741 (시작 장비 키만; ossuary/belt 범위 밖)
const IMPLICIT_TABLE := {
	"weapon": {"ko": "공격력 +X%", "stat": "_iAtkPct", "val": [5, 15]},
	"bow": {"ko": "관통 확률 +X%", "stat": "_iPierce", "val": [5, 15]},
	"shield": {"ko": "방어율 +X%", "stat": "_iBlockPct", "val": [3, 8]},
	"armor": {"ko": "물리 피해감소 +X%", "stat": "_iPhysDR", "val": [3, 8]},
	"helmet": {"ko": "최대 HP +X", "stat": "_iMaxHP", "val": [10, 30]},
	"gloves": {"ko": "공격속도 +X%", "stat": "_iAtkSpd", "val": [3, 8]},
	"pants": {"ko": "상태이상 저항 +X%", "stat": "_iStsRes", "val": [5, 12]},
	"boots": {"ko": "이동속도 +X%", "stat": "_iMovSpd", "val": [3, 8]},
	"ring1": {"ko": "원소 저항 +X%", "stat": "_iElemRes", "val": [8, 15]},
	"ring2": {"ko": "원소 저항 +X%", "stat": "_iElemRes", "val": [8, 15]},
	"necklace": {"ko": "최대 HP +X%", "stat": "_iMaxHPPct", "val": [5, 12]},
	"cape": {"ko": "회피 쿨다운 -X%", "stat": "_iDashCd", "val": [5, 12]},
	"bracelet_demon": {"ko": "부활력 +X%", "stat": "_iRevPow", "val": [5, 12]},
	"bracelet_life": {"ko": "최대 HP +X%", "stat": "_iLifeHPPct", "val": [5, 12]},
	"headband": {"ko": "마법 데미지 +X%", "stat": "_iMagDmg", "val": [5, 12]},
}

## 원 _AFSLOT @15097 (시작 장비 키)
const AFSLOT := {"weapon": "wpn", "shield": "shield", "boots": "boots", "armor": "armor", "helmet": "helm",
	"bow": "xbow", "gloves": "gloves", "pants": "pants", "necklace": "neck", "ring1": "ring", "ring2": "ring",
	"cape": "cloak", "bracelet": "bracelet", "headband": "headband"}
## 원 rollAffixes 풀이 이 모듈에 내장된 aSlot (rarity>=1 허용 범위)
const AFFIX_COVERED_ASLOTS: Array[String] = ["wpn", "xbow", "helm", "armor", "shield", "boots", "cloak"]

## 원 _DEMO_MODE=true @17054 / _DEMO_AFFIX_BANNED @17058
const DEMO_MODE := true
const DEMO_AFFIX_BANNED: Array[String] = ["sharpAtk", "brutalAtk", "ruinAtk", "overkilDmg", "staggerExplosion",
	"parryExplosion", "elemConvert"]

## 원 반지/목걸이 id 풀 @16570/@16582 + AFFIX_POOL.find 첫 일치 tiers[0] (rarity0 에선 rollAffixes 가 덮어씀)
const RING_AFF_POOL: Array[String] = ["fireRes", "iceRes", "lightRes", "darkRes", "poisonRes", "maxSTFlat",
	"maxMPFlat", "eDefFlat", "lckFlatR", "gritFlatR"]
const NECK_AFF_POOL: Array[String] = ["fireRes", "iceRes", "lightRes", "darkRes", "poisonRes", "allRes",
	"maxSTFlat", "maxMPFlat", "eDefFlat", "lckFlatN", "gritFlatN", "mpCostRed", "expBonus"]
const ACCESSORY_AFFIX_TIER0 := {"fireRes": 0.08, "iceRes": 0.08, "lightRes": 0.08, "darkRes": 0.08,
	"poisonRes": 0.06, "allRes": 0.03, "maxSTFlat": 20, "maxMPFlat": 20, "eDefFlat": 25, "lckFlatR": 10,
	"gritFlatR": 10, "lckFlatN": 20, "gritFlatN": 20, "mpCostRed": -0.05, "expBonus": 0.06}

## 원 AFFIX_POOL @15103..15582 — slots 가 AFFIX_COVERED_ASLOTS 와 교차하는 항목만, 원 순서 그대로.
## 순서는 가중치 선택 결과를 결정하므로 재배열 금지. 제외 항목은 위 7 aSlot 어느 풀에도 들어가지 않는다.
const AFFIX_POOL: Array = [
	{"id":"poisonDot","type":0,"tiers":[5,8,14,22,32],"unit":"dps","slots":["wpn"],"group":"poison","weight":100},
	{"id":"fireDot","type":0,"tiers":[6,10,17,26,38],"unit":"dps","slots":["wpn"],"group":"fire","weight":100},
	{"id":"iceDot","type":0,"tiers":[4,7,12,18,26],"unit":"dps","slots":["wpn"],"group":"ice","weight":90},
	{"id":"lightChain","type":0,"tiers":[8,13,22,35,50],"unit":"dmg","slots":["wpn"],"group":"lightning","weight":85},
	{"id":"darkCurse","type":0,"tiers":[.12,.20,.35,.55,.75],"unit":"prob","slots":["helm"],"group":"dark","weight":70},
	{"id":"armorPen","type":0,"tiers":[.05,.08,.14,.22,.32],"unit":"pct","slots":["wpn"],"group":"pen","weight":75},
	{"id":"staggerBns","type":0,"tiers":[5,8,14,22,32],"unit":"val","slots":["wpn"],"group":"stagger","weight":70},
	{"id":"chainTarget","type":0,"tiers":[1,1,2,3,4],"unit":"cnt","slots":["xbow"],"group":"chain","weight":60},
	{"id":"killSlayer","type":0,"tiers":[.10,.15,.25,.40,.55],"unit":"pct","slots":["wpn"],"group":"kill","weight":75},
	{"id":"comboBoost","type":0,"tiers":[.12,.20,.35,.55,.75],"unit":"pct","slots":["wpn"],"group":"combo","weight":60},
	{"id":"dashBoost","type":0,"tiers":[.15,.25,.40,.65,.90],"unit":"pct","slots":["wpn"],"group":"dash","weight":55},
	{"id":"skillBoost","type":0,"tiers":[.10,.15,.25,.40,.55],"unit":"pct","slots":["wpn"],"group":"skill","weight":65},
	{"id":"elemFocus","type":0,"tiers":[.08,.12,.20,.32,.44],"unit":"pct","slots":["helm"],"group":"elemfcs","weight":70},
	{"id":"atkSpeed","type":0,"tiers":[.04,.06,.10,.16,.22],"unit":"pct","slots":["wpn","helm"],"group":"aspd","weight":85},
	{"id":"parryBonus","type":0,"tiers":[.12,.20,.35,.55,.75],"unit":"pct","slots":["wpn"],"group":"parry","weight":65},
	{"id":"cooldownRed","type":0,"tiers":[-.02,-.03,-.05,-.07,-.10],"unit":"pct","slots":["wpn"],"group":"cd","weight":70},
	{"id":"magicDmg","type":0,"tiers":[.06,.10,.18,.28,.40],"unit":"pct","slots":["helm"],"group":"mdmg","weight":85},
	{"id":"critDmgW","type":1,"tiers":[.10,.20,.30,.40,.50],"unit":"pct","slots":["wpn","helm"],"group":"cdmgW","weight":60,"tierW":[40,30,20,8,2]},
	{"id":"sharpAtk","type":0,"tiers":[20,50,170,330,500],"unit":"val","slots":["wpn"],"group":"satk","weight":25,"skewRoll":3,"tierW":[40,30,20,8,2]},
	{"id":"brutalAtk","type":0,"tiers":[20,50,170,330,500],"unit":"val","slots":["wpn"],"group":"batk","weight":20,"skewRoll":3,"tierW":[40,30,20,8,2]},
	{"id":"ruinAtk","type":1,"tiers":[20,50,170,330,500],"unit":"val","slots":["wpn"],"group":"ratk","weight":15,"skewRoll":3,"tierW":[40,30,20,8,2]},
	{"id":"staggerExplosion","type":1,"tiers":[.18,.30,.50,.80,1.15],"unit":"pct","slots":["wpn"],"group":"sexp","weight":35},
	{"id":"elemConvert","type":1,"tiers":[.12,.20,.35,.55,.75],"unit":"prob","slots":["wpn"],"group":"elcv","weight":40},
	{"id":"parryExplosion","type":1,"tiers":[.25,.40,.70,1.10,1.60],"unit":"atk","slots":["wpn"],"group":"pexp","weight":35},
	{"id":"abundDmg","type":1,"tiers":[.08,.12,.20,.32,.44],"unit":"pct","slots":["wpn","helm"],"group":"abnd","weight":45},
	{"id":"predDmg","type":1,"tiers":[.08,.12,.20,.32,.44],"unit":"pct","slots":["wpn","helm"],"group":"pred","weight":45},
	{"id":"fullLifeDmg","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"flDmg","weight":35,"tierW":[40,30,20,8,2]},
	{"id":"lowLifeDmg","type":1,"tiers":[.15,.25,.40,.60,.85],"unit":"pct","slots":["wpn"],"group":"llDmg","weight":35,"tierW":[40,30,20,8,2]},
	{"id":"overkilDmg","type":1,"tiers":[.20,.35,.55,.80,1.10],"unit":"pct","slots":["wpn"],"group":"okDmg","weight":30,"tierW":[40,30,20,8,2]},
	{"id":"closeDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"clDmg","weight":50},
	{"id":"farDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"frDmg","weight":50},
	{"id":"stunDmgUp","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"stDU","weight":55},
	{"id":"frozenDmgUp","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"frDU","weight":55},
	{"id":"burnDmgUp","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"buDU","weight":55},
	{"id":"poisonDmgUp","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"poDU","weight":55},
	{"id":"curseDmgUp","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"cuDU","weight":50},
	{"id":"slowDmgUp","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"slDU","weight":50},
	{"id":"bossSlayer","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn","helm"],"group":"bsSl","weight":40,"tierW":[40,30,20,8,2]},
	{"id":"eliteSlayer","type":1,"tiers":[.12,.20,.32,.46,.65],"unit":"pct","slots":["wpn","helm"],"group":"elSl","weight":45},
	{"id":"mobSlayer","type":1,"tiers":[.15,.25,.40,.60,.85],"unit":"pct","slots":["wpn"],"group":"moSl","weight":60},
	{"id":"firstStrike","type":1,"tiers":[.15,.25,.40,.60,.85],"unit":"pct","slots":["wpn"],"group":"fStr","weight":40},
	{"id":"lifeLeech","type":1,"tiers":[.005,.01,.018,.028,.04],"unit":"pct","slots":["wpn"],"group":"llch","weight":35,"tierW":[40,30,20,8,2]},
	{"id":"manaLeech","type":1,"tiers":[.008,.015,.025,.04,.06],"unit":"pct","slots":["wpn"],"group":"mlch","weight":35,"tierW":[40,30,20,8,2]},
	{"id":"stLeech","type":1,"tiers":[.005,.01,.018,.028,.04],"unit":"pct","slots":["wpn"],"group":"slch","weight":35,"tierW":[40,30,20,8,2]},
	{"id":"lifeOnHit","type":1,"tiers":[1,2,4,7,11],"unit":"val","slots":["wpn"],"group":"loH","weight":45},
	{"id":"onKillHeal","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["wpn","helm"],"group":"okHl","weight":50},
	{"id":"onKillMana","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["wpn","helm"],"group":"okMn","weight":50},
	{"id":"onKillStam","type":1,"tiers":[3,6,10,16,24],"unit":"val","slots":["wpn"],"group":"okSt","weight":45},
	{"id":"onKillSpeed","type":1,"tiers":[.05,.08,.12,.18,.25],"unit":"pct","slots":["wpn"],"group":"okSp","weight":40},
	{"id":"rageMaxFlat","type":0,"tiers":[10,20,35,55,80],"unit":"val","slots":["wpn"],"group":"rgMx","weight":45},
	{"id":"rageDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"rgDm","weight":45},
	{"id":"defFlat","type":0,"tiers":[10,20,30,40,50],"unit":"val","slots":["armor","shield","gloves","pants","boots","cloak"],"group":"defF","weight":100},
	{"id":"maxHPFlat","type":0,"tiers":[60,100,200,300,420],"unit":"val","slots":["armor","shield","gloves","pants","boots","cloak"],"group":"hp","weight":90},
	{"id":"shieldFlat","type":0,"tiers":[120,200,400,600,840],"unit":"val","slots":["armor","shield","gloves","pants","boots","cloak"],"group":"shd","weight":80},
	{"id":"maxHPPct","type":0,"tiers":[.05,.08,.14,.22,.32],"unit":"pct","slots":["armor"],"group":"hpp","weight":80},
	{"id":"movSpeed","type":0,"tiers":[.03,.05,.09,.14,.20],"unit":"pct","slots":["boots","cloak"],"group":"mspd","weight":85},
	{"id":"physDR","type":1,"tiers":[.04,.06,.10,.16,.22],"unit":"pct","slots":["armor","shield"],"group":"pdr","weight":80},
	{"id":"reflect","type":1,"tiers":[.03,.05,.09,.15,.22],"unit":"pct","slots":["armor","shield"],"group":"refl","weight":70},
	{"id":"thorns","type":1,"tiers":[2,4,8,14,22],"unit":"val","slots":["armor","gloves"],"group":"thorn","weight":65},
	{"id":"barrier","type":1,"tiers":[8,15,28,45,65],"unit":"val","slots":["armor"],"group":"bar","weight":60},
	{"id":"crisisBoost","type":1,"tiers":[.15,.25,.40,.65,.90],"unit":"pct","slots":["armor"],"group":"cris","weight":45},
	{"id":"counterHit","type":1,"tiers":[.10,.15,.25,.40,.55],"unit":"prob","slots":["armor","shield"],"group":"cnt","weight":40},
	{"id":"lastStand","type":1,"tiers":[null,null,null,null,1],"unit":"cnt","slots":["armor"],"weight":20,"group":"lst"},
	{"id":"reviveOnce","type":1,"tiers":[null,null,null,.20,.35],"unit":"hp","slots":["armor"],"weight":10,"group":"rev"},
	{"id":"dropRate","type":1,"tiers":[.08,.12,.20,.32,.44],"unit":"pct","slots":["boots","cloak"],"group":"drop","weight":70},
	{"id":"goldBonus","type":1,"tiers":[.10,.15,.25,.40,.55],"unit":"pct","slots":["boots"],"group":"gold","weight":70},
	{"id":"extraST","type":1,"tiers":[5,10,20,30,45],"unit":"val","slots":["boots","pants"],"group":"exst","weight":50},
	{"id":"healthyDef","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["armor","shield"],"group":"hDef","weight":50},
	{"id":"injuredDR","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["armor","shield"],"group":"iDR","weight":45},
	{"id":"injuredSpeed","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["boots"],"group":"iSpd","weight":45},
	{"id":"dotDR","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["pants","cloak"],"group":"dDR","weight":55},
	{"id":"bossDR","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["armor","shield"],"group":"bDR","weight":35,"tierW":[40,30,20,8,2]},
	{"id":"closeDR","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["armor"],"group":"cDR","weight":45},
	{"id":"farDR","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["shield","cloak"],"group":"fDR","weight":45},
	{"id":"hpOnKill","type":1,"tiers":[3,6,10,16,24],"unit":"val","slots":["armor","gloves"],"group":"hpOK","weight":50},
	{"id":"shieldOnKill","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["armor","shield"],"group":"shOK","weight":45},
	{"id":"fireDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"fDmP","weight":70},
	{"id":"firePen","type":1,"tiers":[.05,.08,.14,.22,.32],"unit":"pct","slots":["wpn"],"group":"fPen","weight":50},
	{"id":"fireOnHit","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"prob","slots":["wpn"],"group":"fOH","weight":55},
	{"id":"fireBurst","type":1,"tiers":[15,28,45,70,100],"unit":"val","slots":["wpn"],"group":"fBst","weight":35},
	{"id":"fireDuration","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["helm"],"group":"fDur","weight":55},
	{"id":"iceDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"iDmP","weight":70},
	{"id":"icePen","type":1,"tiers":[.05,.08,.14,.22,.32],"unit":"pct","slots":["wpn"],"group":"iPen","weight":50},
	{"id":"iceOnHit","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"prob","slots":["wpn"],"group":"iOH","weight":50},
	{"id":"iceBurst","type":1,"tiers":[12,22,38,58,85],"unit":"val","slots":["wpn"],"group":"iBst","weight":35},
	{"id":"iceDuration","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["helm"],"group":"iDur","weight":55},
	{"id":"lightDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"lDmP","weight":70},
	{"id":"lightPen","type":1,"tiers":[.05,.08,.14,.22,.32],"unit":"pct","slots":["wpn"],"group":"lPen","weight":50},
	{"id":"lightOnHit","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"prob","slots":["wpn"],"group":"lOH","weight":50},
	{"id":"lightBurst","type":1,"tiers":[18,32,52,80,115],"unit":"val","slots":["wpn"],"group":"lBst","weight":35},
	{"id":"lightDuration","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["helm"],"group":"lDur","weight":55},
	{"id":"darkDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"dDmP","weight":65},
	{"id":"darkPen","type":1,"tiers":[.05,.08,.14,.22,.32],"unit":"pct","slots":["wpn"],"group":"dPen","weight":45},
	{"id":"darkOnHit","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"prob","slots":["wpn"],"group":"dOH","weight":45},
	{"id":"darkBurst","type":1,"tiers":[14,26,42,65,95],"unit":"val","slots":["wpn"],"group":"dBst","weight":30},
	{"id":"darkDuration","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["helm"],"group":"dDur","weight":50},
	{"id":"poisonDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"pDmP","weight":65},
	{"id":"poisonPen","type":1,"tiers":[.05,.08,.14,.22,.32],"unit":"pct","slots":["wpn"],"group":"pPen","weight":45},
	{"id":"poisonOnHit","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"prob","slots":["wpn"],"group":"pOH","weight":55},
	{"id":"poisonBurst","type":1,"tiers":[10,20,35,55,80],"unit":"val","slots":["wpn"],"group":"pBst","weight":30},
	{"id":"poisonDuration","type":0,"tiers":[.12,.20,.32,.46,.65],"unit":"pct","slots":["helm"],"group":"pDur","weight":55},
	{"id":"meleeDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"mlDm","weight":75},
	{"id":"rangedDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"rnDm","weight":75},
	{"id":"spellDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"spDm","weight":75},
	{"id":"beamDmgPct","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["helm"],"group":"bmDm","weight":55},
	{"id":"dotDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"dtDm","weight":60},
	{"id":"projDmgPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"pjDm","weight":65},
	{"id":"aoeRadiusPct","type":0,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["wpn","helm"],"group":"aoRd","weight":55},
	{"id":"critRateMelee","type":0,"tiers":[.01,.02,.03,.04,.06],"unit":"pct","slots":["wpn"],"group":"crM","weight":45,"tierW":[40,30,20,8,2]},
	{"id":"critRateSpell","type":0,"tiers":[.01,.02,.03,.04,.06],"unit":"pct","slots":["helm"],"group":"crS","weight":45,"tierW":[40,30,20,8,2]},
	{"id":"critRateBow","type":0,"tiers":[.01,.02,.03,.04,.06],"unit":"pct","slots":["xbow"],"group":"crB","weight":45,"tierW":[40,30,20,8,2]},
	{"id":"meleeAtkSpd","type":0,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["wpn"],"group":"mAS","weight":65},
	{"id":"bowAtkSpd","type":0,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["xbow"],"group":"bAS","weight":65},
	{"id":"castSpeed","type":0,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["helm"],"group":"cSpd","weight":65},
	{"id":"elemPenAll","type":1,"tiers":[.03,.05,.09,.15,.22],"unit":"pct","slots":["wpn"],"group":"ePnA","weight":30,"tierW":[40,30,20,8,2]},
	{"id":"shieldBypass","type":1,"tiers":[.05,.08,.14,.22,.32],"unit":"prob","slots":["wpn"],"group":"shBp","weight":30,"tierW":[40,30,20,8,2]},
	{"id":"armorShred","type":1,"tiers":[3,6,10,16,24],"unit":"val","slots":["wpn"],"group":"arSh","weight":50},
	{"id":"projSpeedPct","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"pjSp","weight":55},
	{"id":"onHitFireball","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"prob","slots":["wpn"],"group":"ohFb","weight":25,"tierW":[40,30,20,8,2]},
	{"id":"onHitChainL","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"prob","slots":["wpn"],"group":"ohCL","weight":25,"tierW":[40,30,20,8,2]},
	{"id":"onHitFreeze","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"prob","slots":["wpn"],"group":"ohFz","weight":40},
	{"id":"onHitStun","type":1,"tiers":[.03,.05,.09,.15,.22],"unit":"prob","slots":["wpn"],"group":"ohSt","weight":35},
	{"id":"onHitPoison","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"prob","slots":["wpn"],"group":"ohPo","weight":45},
	{"id":"onHitBleed","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"prob","slots":["wpn"],"group":"ohBl","weight":40},
	{"id":"onHitWeaken","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"prob","slots":["wpn"],"group":"ohWk","weight":35},
	{"id":"onHitSlow","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"prob","slots":["wpn"],"group":"ohSl","weight":40},
	{"id":"onHitMark","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"prob","slots":["wpn"],"group":"ohMk","weight":30},
	{"id":"onCritExplode","type":1,"tiers":[.20,.35,.55,.80,1.15],"unit":"pct","slots":["wpn"],"group":"ocEx","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"onCritChain","type":1,"tiers":[.15,.25,.40,.60,.85],"unit":"pct","slots":["wpn"],"group":"ocCh","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"onCritFreeze","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"prob","slots":["wpn"],"group":"ocFz","weight":30},
	{"id":"onCritHeal","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["wpn"],"group":"ocHl","weight":35},
	{"id":"onCritMana","type":1,"tiers":[3,6,10,16,24],"unit":"val","slots":["wpn"],"group":"ocMn","weight":35},
	{"id":"onCritShield","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["wpn","helm"],"group":"ocSh","weight":30},
	{"id":"onHitDefBoost","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["armor","shield"],"group":"ohDb","weight":40},
	{"id":"onHitThorns","type":1,"tiers":[3,6,10,16,24],"unit":"val","slots":["armor","gloves"],"group":"ohTh","weight":45},
	{"id":"onDodgeDmg","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["boots","cloak"],"group":"odDm","weight":35},
	{"id":"onParryBurst","type":1,"tiers":[.15,.25,.40,.60,.85],"unit":"pct","slots":["shield"],"group":"opBs","weight":30},
	{"id":"onBlockHeal","type":1,"tiers":[5,10,18,28,40],"unit":"val","slots":["shield"],"group":"oBHl","weight":40},
	{"id":"onBlockMana","type":1,"tiers":[3,6,10,16,24],"unit":"val","slots":["shield"],"group":"oBMn","weight":40},
	{"id":"skWhirlDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"sWD","weight":40},
	{"id":"skBeamDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sBD","weight":40},
	{"id":"skFireballDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sFD","weight":40},
	{"id":"skMissileDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"sMD","weight":40},
	{"id":"skBlueShotDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"sBSD","weight":40},
	{"id":"skBlastShotDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"sBShD","weight":40},
	{"id":"skHellRayDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sHRD","weight":35},
	{"id":"skMaliceStormDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"sMSD","weight":35},
	{"id":"skChainSlashDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"sCSD","weight":40},
	{"id":"skGiantSlamDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"sGSD","weight":40},
	{"id":"skGhostWalkDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"sGWD","weight":35},
	{"id":"skMaliceMortarDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"sMMD","weight":35},
	{"id":"skFireAuraDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sFAD","weight":40},
	{"id":"skIceOrbDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sIOD","weight":35},
	{"id":"skFireBeamDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sFBD","weight":35},
	{"id":"skMaliceHuntDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"sMHD","weight":35},
	{"id":"skDarkPillarDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sDPD","weight":35},
	{"id":"skPlagueDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sPBD","weight":35},
	{"id":"skSpikeAuraDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"sSAD","weight":35},
	{"id":"skChainAssaultDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"sCAD","weight":35},
	{"id":"dodgeChance","type":1,"tiers":[.02,.04,.06,.09,.13],"unit":"pct","slots":["boots","cloak"],"group":"ddgC","weight":45,"tierW":[40,30,20,8,2]},
	{"id":"dodgeCooldown","type":1,"tiers":[-.05,-.08,-.14,-.22,-.30],"unit":"pct","slots":["boots"],"group":"ddgCd","weight":50},
	{"id":"maxHPPctArmor","type":0,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["pants","shield"],"group":"hpPA","weight":65},
	{"id":"shieldPct","type":0,"tiers":[.10,.16,.28,.44,.64],"unit":"pct","slots":["armor"],"group":"shPct","weight":55},
	{"id":"shieldRegenPct","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["armor","shield"],"group":"shRgP","weight":50},
	{"id":"shieldCdRed","type":1,"tiers":[-.05,-.08,-.14,-.22,-.30],"unit":"pct","slots":["shield"],"group":"shCdR","weight":45},
	{"id":"hpRegenFlat","type":0,"tiers":[1,2,4,7,11],"unit":"val","slots":["armor","gloves"],"group":"hpRgF","weight":60},
	{"id":"hpRegenPct","type":0,"tiers":[.03,.05,.09,.15,.22],"unit":"pct","slots":["armor"],"group":"hpRgP","weight":50},
	{"id":"stRegenFlat","type":0,"tiers":[1,2,3,5,8],"unit":"val","slots":["boots","pants"],"group":"stRgF","weight":55},
	{"id":"fireDR","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["armor","cloak"],"group":"fDR","weight":55},
	{"id":"iceDR","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["armor","pants"],"group":"iDR","weight":55},
	{"id":"lightDR","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["armor","gloves"],"group":"lDR","weight":55},
	{"id":"darkDR","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["armor","shield"],"group":"dkDR","weight":50},
	{"id":"poisonDRdef","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["armor","boots"],"group":"psDR","weight":50},
	{"id":"allDR","type":1,"tiers":[.02,.04,.06,.09,.13],"unit":"pct","slots":["armor"],"group":"aDR","weight":15,"tierW":[40,30,20,8,2]},
	{"id":"eliteDR","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["armor"],"group":"eDR","weight":35},
	{"id":"freezeRes","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["pants","boots"],"group":"fzRs","weight":55},
	{"id":"slowRes","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["boots"],"group":"slRs","weight":55},
	{"id":"knockbackRes","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["armor","shield"],"group":"kbRs","weight":50},
	{"id":"dashRange","type":0,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["boots"],"group":"dshR","weight":45},
	{"id":"dashCooldown","type":1,"tiers":[-.04,-.07,-.11,-.16,-.22],"unit":"pct","slots":["boots","cloak"],"group":"dshCd","weight":45},
	{"id":"movSpeedCombat","type":0,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["boots"],"group":"mspC","weight":40},
	{"id":"movSpeedOOC","type":0,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["boots","cloak"],"group":"mspO","weight":60},
	{"id":"pickupRadius","type":1,"tiers":[10,20,35,55,80],"unit":"val","slots":["boots"],"group":"pkRd","weight":55},
	{"id":"afterParryShield","type":1,"tiers":[10,18,28,40,60],"unit":"val","slots":["bracelet","shield"],"group":"apSh","weight":35},
	{"id":"flatPhysDmg","type":0,"tiers":[8,16,28,44,65],"unit":"val","slots":["wpn"],"group":"fPD","weight":80},
	{"id":"flatFireDmg","type":0,"tiers":[6,12,22,36,52],"unit":"val","slots":["wpn"],"group":"fFrD","weight":65},
	{"id":"flatIceDmg","type":0,"tiers":[5,10,18,30,44],"unit":"val","slots":["wpn"],"group":"fIcD","weight":65},
	{"id":"flatLightDmg","type":0,"tiers":[7,14,24,38,55],"unit":"val","slots":["wpn"],"group":"fLtD","weight":65},
	{"id":"flatDarkDmg","type":0,"tiers":[6,12,22,36,52],"unit":"val","slots":["wpn"],"group":"fDkD","weight":60},
	{"id":"flatPoisonDmg","type":0,"tiers":[5,10,18,30,44],"unit":"val","slots":["wpn"],"group":"fPoD","weight":60},
	{"id":"minDmgFlat","type":0,"tiers":[3,6,10,16,24],"unit":"val","slots":["wpn"],"group":"mnDm","weight":55},
	{"id":"maxDmgFlat","type":0,"tiers":[5,10,18,28,40],"unit":"val","slots":["wpn"],"group":"mxDm","weight":55},
	{"id":"atkPctAll","type":0,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["wpn","helm"],"group":"aAll","weight":50},
	{"id":"weaponRange","type":0,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["wpn"],"group":"wRng","weight":55},
	{"id":"bowRange","type":0,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["xbow"],"group":"bRng","weight":55},
	{"id":"doubleStrike","type":1,"tiers":[.02,.04,.06,.09,.13],"unit":"prob","slots":["wpn"],"group":"dStr","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"multiShot","type":1,"tiers":[.03,.05,.08,.12,.18],"unit":"prob","slots":["xbow"],"group":"mSht","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"pierceChance","type":0,"tiers":[.05,.08,.14,.22,.30],"unit":"prob","slots":["xbow"],"group":"prCh","weight":50},
	{"id":"pierceCount","type":0,"tiers":[1,1,2,2,3],"unit":"cnt","slots":["xbow"],"group":"prCt","weight":40},
	{"id":"pierceDmgKeep","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["xbow"],"group":"prDK","weight":40},
	{"id":"chainDmgKeep","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"chDK","weight":40},
	{"id":"splashRadius","type":0,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["xbow"],"group":"spRd","weight":45},
	{"id":"splashDmg","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["xbow"],"group":"spDm","weight":35},
	{"id":"chargeAtkDmg","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"chAD","weight":50},
	{"id":"counterAtkDmg","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"ctAD","weight":45},
	{"id":"backstabDmg","type":1,"tiers":[.12,.20,.32,.46,.65],"unit":"pct","slots":["wpn"],"group":"bkSt","weight":35},
	{"id":"executeDmg","type":1,"tiers":[.15,.25,.40,.60,.85],"unit":"pct","slots":["wpn"],"group":"exDm","weight":30,"tierW":[40,30,20,8,2]},
	{"id":"dotTickRate","type":0,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["wpn"],"group":"dtTk","weight":40},
	{"id":"bleedDps","type":0,"tiers":[5,10,18,28,40],"unit":"dps","slots":["wpn"],"group":"blDp","weight":60},
	{"id":"bleedDuration","type":0,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"blDr","weight":50},
	{"id":"flatMagicDmg","type":0,"tiers":[6,12,22,36,52],"unit":"val","slots":["helm"],"group":"fMgD","weight":60},
	{"id":"spellAmp","type":0,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["helm"],"group":"spAm","weight":45},
	{"id":"killStreakDmg","type":1,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["wpn"],"group":"kSD","weight":35},
	{"id":"killStreakSpd","type":1,"tiers":[.02,.04,.06,.09,.13],"unit":"pct","slots":["wpn"],"group":"kSS","weight":35},
	{"id":"momentumDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"momD","weight":35},
	{"id":"standingDmg","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"stdD","weight":35},
	{"id":"movingDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"mvDm","weight":35},
	{"id":"recentParryDmg","type":1,"tiers":[.12,.20,.32,.46,.65],"unit":"pct","slots":["wpn"],"group":"rpDm","weight":30},
	{"id":"nearDeathDmg","type":1,"tiers":[.20,.35,.55,.80,1.10],"unit":"pct","slots":["wpn"],"group":"ndDm","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"fullStaminaDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"fsDm","weight":35},
	{"id":"fullManaDmg2","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn","helm"],"group":"fmD2","weight":35},
	{"id":"freshKillDmg","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"fkDm","weight":35},
	{"id":"stunDuration","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"stDr","weight":45},
	{"id":"freezeDuration","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"fzDr","weight":45},
	{"id":"slowEfficiency","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"slEf","weight":40},
	{"id":"poisonStack","type":1,"tiers":[1,1,2,2,3],"unit":"cnt","slots":["wpn"],"group":"poSk","weight":35},
	{"id":"bleedStack","type":1,"tiers":[1,1,2,2,3],"unit":"cnt","slots":["wpn"],"group":"blSk","weight":35},
	{"id":"igniteDmg","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"igDm","weight":50},
	{"id":"frostbiteDmg","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"fbDm","weight":50},
	{"id":"shockDmg","type":0,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"skDm","weight":50},
	{"id":"critMultiOnLowHP","type":1,"tiers":[.10,.20,.30,.40,.50],"unit":"pct","slots":["wpn"],"group":"cmLH","weight":25,"tierW":[40,30,20,8,2]},
	{"id":"armorDefPct","type":0,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["armor"],"group":"adPc","weight":65},
	{"id":"shieldBlockDR","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["shield"],"group":"sBDR","weight":50},
	{"id":"shieldBashDmg","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["shield"],"group":"sBsD","weight":45},
	{"id":"shieldStagger","type":1,"tiers":[3,6,10,16,24],"unit":"val","slots":["shield"],"group":"sStg","weight":45},
	{"id":"bootsDashDmg","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["boots"],"group":"bDD","weight":45},
	{"id":"bootsChargeRange","type":0,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["boots"],"group":"bCR","weight":45},
	{"id":"bootsMSOnKill","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["boots"],"group":"bMOK","weight":40},
	{"id":"cloakDodgeDR","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["cloak"],"group":"cDDR","weight":35},
	{"id":"cloakMSPct","type":0,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["cloak"],"group":"cMSP","weight":50},
	{"id":"cloakElemDR","type":1,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["cloak"],"group":"cEDR","weight":40},
	{"id":"burnDR","type":1,"tiers":[.10,.16,.24,.36,.50],"unit":"pct","slots":["cloak"],"group":"brDR","weight":45},
	{"id":"helmMPPct","type":0,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["helm"],"group":"hMPP","weight":50},
	{"id":"helmCastSpd","type":0,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["helm"],"group":"hCSp","weight":50},
	{"id":"helmCooldown","type":0,"tiers":[-.04,-.07,-.11,-.16,-.22],"unit":"pct","slots":["helm"],"group":"hCd","weight":45},
	{"id":"helmExpPct","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["helm"],"group":"hExp","weight":45},
	{"id":"hybAtkHP","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["armor"],"group":"hAH","weight":30},
	{"id":"hybDefSpd","type":1,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["boots"],"group":"hDS","weight":30},
	{"id":"hybCritLeech","type":1,"tiers":[.005,.01,.015,.02,.03],"unit":"pct","slots":["wpn"],"group":"hCL","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"hybHPMP","type":0,"tiers":[30,60,100,150,220],"unit":"val","slots":["armor"],"group":"hHM","weight":25},
	{"id":"hybHPST","type":0,"tiers":[30,60,100,150,220],"unit":"val","slots":["armor"],"group":"hHS","weight":25},
	{"id":"hybAllRegen","type":0,"tiers":[1,2,3,5,8],"unit":"val","slots":["armor"],"group":"hAR","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"hybDropExp","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["boots"],"group":"hDE","weight":30},
	{"id":"hybFireIce","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["wpn"],"group":"hFI","weight":25},
	{"id":"hybLightDark","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["wpn"],"group":"hLkD","weight":25},
	{"id":"hybMeleeSpell","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["wpn","helm"],"group":"hMS","weight":25},
	{"id":"hybElemDotDmg","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["wpn","helm"],"group":"hEDD","weight":30},
	{"id":"arcWarriorDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"awD","weight":30},
	{"id":"arcWarriorHP","type":0,"tiers":[30,60,100,150,220],"unit":"val","slots":["armor"],"group":"awHP","weight":30},
	{"id":"arcWarriorLifeSteal","type":1,"tiers":[.004,.008,.014,.022,.032],"unit":"pct","slots":["wpn"],"group":"awLS","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"arcWarriorPoise","type":0,"tiers":[5,10,18,28,40],"unit":"val","slots":["armor"],"group":"awPo","weight":35},
	{"id":"arcMageDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["helm"],"group":"amD","weight":30},
	{"id":"arcMageShield","type":0,"tiers":[30,60,100,150,220],"unit":"val","slots":["armor"],"group":"amSh","weight":30},
	{"id":"arcMageElemDmg","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["helm"],"group":"amED","weight":30},
	{"id":"arcRangerDmg","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["xbow"],"group":"arD2","weight":30},
	{"id":"arcRangerRange","type":0,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["xbow"],"group":"arRg","weight":30},
	{"id":"arcRangerPierce","type":1,"tiers":[.04,.07,.11,.16,.22],"unit":"pct","slots":["xbow"],"group":"arPr","weight":30},
	{"id":"arcRangerMS","type":0,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["boots"],"group":"arMS","weight":35},
	{"id":"arcTankHP","type":0,"tiers":[40,80,130,200,280],"unit":"val","slots":["armor"],"group":"atHP","weight":30},
	{"id":"arcTankDef","type":0,"tiers":[5,10,18,28,40],"unit":"val","slots":["armor","shield"],"group":"atDf","weight":30},
	{"id":"arcTankBlock","type":0,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["shield"],"group":"atBk","weight":30},
	{"id":"arcTankThorns","type":1,"tiers":[4,8,14,22,32],"unit":"val","slots":["armor"],"group":"atTh","weight":35},
	{"id":"arcAssassinCrit","type":1,"tiers":[.02,.04,.06,.09,.13],"unit":"pct","slots":["wpn"],"group":"aaCr","weight":25},
	{"id":"arcAssassinBack","type":1,"tiers":[.15,.25,.40,.60,.85],"unit":"pct","slots":["wpn"],"group":"aaBk","weight":20,"tierW":[40,30,20,8,2]},
	{"id":"arcAssassinPoison","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["wpn"],"group":"aaPo","weight":30},
	{"id":"arcAssassinDodge","type":1,"tiers":[.02,.04,.06,.09,.13],"unit":"pct","slots":["cloak"],"group":"aaDg","weight":25},
	{"id":"endBossKiller","type":1,"tiers":[.10,.18,.28,.40,.55],"unit":"pct","slots":["wpn"],"group":"eBK","weight":15,"tierW":[40,30,20,8,2]},
	{"id":"endSurvival","type":1,"tiers":[.05,.08,.14,.22,.30],"unit":"pct","slots":["armor"],"group":"eSv","weight":15,"tierW":[40,30,20,8,2]},
	{"id":"endShield","type":0,"tiers":[50,100,180,280,400],"unit":"val","slots":["armor"],"group":"eSh","weight":15},
	{"id":"endCritDmg","type":1,"tiers":[.10,.20,.30,.40,.50],"unit":"pct","slots":["wpn"],"group":"eCD","weight":10,"tierW":[40,30,20,8,2]},
	{"id":"endAtkFlat","type":0,"tiers":[30,70,150,260,400],"unit":"val","slots":["wpn"],"group":"eAF","weight":8,"tierW":[40,30,20,8,2],"skewRoll":3},
	{"id":"endAllDR","type":1,"tiers":[.03,.05,.08,.12,.18],"unit":"pct","slots":["armor"],"group":"eADR","weight":8,"tierW":[40,30,20,8,2]},
	{"id":"endLeech","type":1,"tiers":[.006,.012,.020,.030,.042],"unit":"pct","slots":["wpn"],"group":"eLch","weight":8,"tierW":[40,30,20,8,2]},
	{"id":"endPoise","type":0,"tiers":[10,20,35,55,80],"unit":"val","slots":["armor"],"group":"ePo","weight":15},
	{"id":"endCooldownAll","type":1,"tiers":[-.03,-.05,-.08,-.12,-.18],"unit":"pct","slots":["helm"],"group":"eCA","weight":10,"tierW":[40,30,20,8,2]},
	{"id":"endDropBonus","type":1,"tiers":[.08,.14,.22,.32,.44],"unit":"pct","slots":["boots"],"group":"eDB","weight":15},
	{"id":"endKillChain","type":1,"tiers":[.06,.10,.16,.24,.34],"unit":"pct","slots":["wpn"],"group":"eKCh","weight":15},
	{"id":"pierceFlat","type":1,"tiers":[100,200,300,400,500],"unit":"val","slots":["xbow"],"group":"prFl","weight":40,"tierW":[40,30,20,8,2]},
]

var _catalog: Catalog = Catalog.new()
var _random_unit: Callable
var _now_ms: Callable
var _player_level: Callable
var _equip_slot: Callable
var _append_bag: Callable
var _bound: Dictionary = {}

var _ledger: Dictionary = {}
var _fault: Dictionary = {}

## bindings: 고정 생성자 입력 (setter 없음). 수명은 중앙 소유 — 여기서는 강참조하지 않는다.
##   random_unit  : () -> float in [0,1)      원 Math.random (공유 권위 RNG)
##   now_ms       : () -> int|float           원 Date.now()
##   player_level : () -> int|float|null      원 P.lv 현재값 (null = undefined)
##   equip_slot   : (slot:String, item:Dictionary) -> true   원 INV.equipped[it.slot]=it
##   append_bag   : (item:Dictionary) -> true                원 INV.bag.push(item)
func _init(bindings: Dictionary = {}) -> void:
	for k in BINDING_KEYS:
		var c: Variant = bindings.get(k)
		_bound[k] = c is Callable
		if c is Callable:
			match k:
				"random_unit": _random_unit = c
				"now_ms": _now_ms = c
				"player_level": _player_level = c
				"equip_slot": _equip_slot = c
				"append_bag": _append_bag = c
	reset_ledger()

func reset_ledger() -> void:
	_ledger = {"rng_draws": 0, "time_calls": 0, "level_reads": 0, "mk_item_entries": 0, "items_created": 0,
		"equip_calls": 0, "bag_calls": 0, "events": [], "items": []}

func get_ledger() -> Dictionary:
	return _ledger.duplicate(true)

func _callable_for(k: String) -> Callable:
	match k:
		"random_unit": return _random_unit
		"now_ms": return _now_ms
		"player_level": return _player_level
		"equip_slot": return _equip_slot
	return _append_bag

## 바인딩 유효성 (Callable 대상 해제 포함). keys 미지정 시 전부.
func readiness(keys: Array = BINDING_KEYS) -> Dictionary:
	var missing: Array[String] = []
	for k in keys:
		if not _bound.get(k, false) or not _callable_for(k).is_valid():
			missing.append(k)
	return {"status": READY if missing.is_empty() else NOT_READY, "missing": missing}

# ───────────────────────── provider wrappers (원 호출 1:1, 카운트) ─────────────────────────

func _rand() -> float:
	if not _fault.is_empty():
		return 0.0
	if not _random_unit.is_valid():
		_fault = {"status": NOT_READY, "reason": "random_unit_invalidated"}
		return 0.0
	var v: Variant = _random_unit.call()
	_ledger["rng_draws"] += 1
	if not (v is float or v is int) or not is_finite(float(v)) or float(v) < 0.0 or float(v) >= 1.0:
		_fault = {"status": PROVIDER_INVALID, "reason": "random_unit_out_of_[0,1):" + str(v)}
		return 0.0
	return float(v)

func _now() -> float:
	if not _fault.is_empty():
		return 0.0
	if not _now_ms.is_valid():
		_fault = {"status": NOT_READY, "reason": "now_ms_invalidated"}
		return 0.0
	var v: Variant = _now_ms.call()
	_ledger["time_calls"] += 1
	if not (v is float or v is int) or not is_finite(float(v)):
		_fault = {"status": PROVIDER_INVALID, "reason": "now_ms_not_finite_number:" + str(v)}
		return 0.0
	return float(v)

## 원 P.lv 읽기. null = undefined. 반환 {defined, value}
func _lv() -> Variant:
	if not _fault.is_empty():
		return null
	if not _player_level.is_valid():
		_fault = {"status": NOT_READY, "reason": "player_level_invalidated"}
		return null
	var v: Variant = _player_level.call()
	_ledger["level_reads"] += 1
	if v == null:
		return null
	if v is int or v is float:
		return float(v)
	_fault = {"status": PROVIDER_INVALID, "reason": "player_level_unsupported_shape:" + type_string(typeof(v))}
	return null

static func _js_truthy_num(v: Variant) -> bool:
	return v != null and not is_nan(float(v)) and float(v) != 0.0

# ───────────────────────── JS numeric subset ─────────────────────────

## JS ToInt32 (~~). combat_stat_formula.js_to_int32 와 동일 의미(그 모듈의 INV reader 의존 체인을 끌지 않도록 로컬).
static func js_to_int32(f: float) -> int:
	if is_nan(f) or is_inf(f):
		return 0
	var t: float = floorf(f) if f >= 0.0 else ceilf(f)
	var m: float = fmod(t, 4294967296.0)
	if m < 0.0:
		m += 4294967296.0
	if m >= 2147483648.0:
		m -= 4294967296.0
	return int(m)

## +x.toFixed(digits) — JS Number.prototype.toFixed 후 ToNumber.
## 정확한 binary double 값 기준 round-half-up(동률 시 큰 n), 결과는 n/10^d 의 최근접 double(정확 반올림 나눗셈).
## 지원: digits 0..6, |x| < 2^26 또는 |x| >= 2^52(정수). 그 외 → NAN + 호출부 fault.
static func js_to_fixed_number(x: float, digits: int) -> float:
	if is_nan(x) or is_inf(x) or digits < 0 or digits > 6:
		return NAN
	if x == 0.0:
		return 0.0
	var neg: bool = x < 0.0
	var a: float = -x if neg else x
	if a >= 4503599627370496.0:
		return x
	if a >= 67108864.0:
		return NAN
	var m: float = a
	var k: int = 0
	while m < 4503599627370496.0:
		m *= 2.0
		k += 1
	var mi: int = int(m)                       # a == mi / 2^k (정확)
	var p: int = 1
	for _i in range(digits):
		p *= 10
	var mh: int = mi >> 26
	var ml: int = mi & 0x3FFFFFF
	var lo: int = ml * p
	var hi: int = mh * p + (lo >> 26)
	lo = lo & 0x3FFFFFF                        # value = hi*2^26 + lo == mi*p
	var j: int = k - 26                        # a < 2^26 → k >= 27 → j >= 1
	var n: int
	if j >= 60:                                # hi < 2^48 < 2^(j-1) → 결과 0
		n = 0
	else:
		n = (hi + (1 << (j - 1))) >> j         # floor((mi*p + 2^(k-1)) / 2^k)
	var r: float = float(n) / float(p)
	return -r if neg else r

# ───────────────────────── scope ─────────────────────────

func _scope_error(slot: Variant, tier: Variant, el: Variant, rarity: Variant, wtype: Variant) -> String:
	if not (slot is String) or not STARTER_SLOTS.has(slot):
		return "slot_outside_starter_scope:" + str(slot)
	if not (tier is int) or tier != 0:
		return "tier_outside_starter_scope:" + str(tier)
	if not (rarity is int) or (rarity != 0 and rarity != 1):
		return "rarity_outside_starter_scope:" + str(rarity)
	if not (el is int) or el < 0 or el > 4:
		return "el_outside_starter_scope:" + str(el)
	if rarity == 1 and not RARITY1_SLOTS.has(slot):
		return "rarity1_affix_pool_not_embedded_for_slot:" + str(slot)
	if slot == "weapon" and not (wtype is String and _catalog.weapon_exists(wtype)):
		return "weapon_requires_explicit_source_wtype:" + str(wtype)
	if slot == "bow" and not (wtype is String and wtype == "crossbow"):
		return "bow_requires_explicit_crossbow:" + str(wtype)
	return ""

# ───────────────────────── mkItem ─────────────────────────

## 원 mkItem(slot,tier,el,rarity,wtype) 1회 호출. 반환 {status, item, reason}.
## 범위/바인딩 검사는 첫 provider 호출 전에 끝낸다(실패 시 RNG/시계/레벨 호출 0).
func mk_item(slot: Variant, tier: Variant, el: Variant, rarity: Variant, wtype: Variant = null) -> Dictionary:
	var se := _scope_error(slot, tier, el, rarity, wtype)
	if se != "":
		return {"status": UNSUPPORTED_SCOPE, "item": null, "reason": se}
	var rd := readiness(["random_unit", "now_ms", "player_level"])
	if rd.status != READY:
		return {"status": NOT_READY, "item": null, "reason": "missing:" + ",".join(PackedStringArray(rd.missing))}
	_fault = {}
	var item: Dictionary = _mk_item(slot, tier, el, rarity, wtype)
	if not _fault.is_empty():
		var f := _fault
		_fault = {}
		return {"status": f.status, "item": null, "reason": f.reason}
	return {"status": READY, "item": item, "reason": ""}

func _mk_item(slot: String, tier: int, el: int, rarity: int, wtype: Variant) -> Dictionary:
	_ledger["mk_item_entries"] += 1
	var draws0: int = _ledger.rng_draws
	var redraws: int = 0
	if slot == "headband2":
		# 원 @16406: const item=mkItem('headband',tier,el,rarity,wtype);item.slot=slot;return item
		var inner: Dictionary = _mk_item("headband", tier, el, rarity, wtype)
		inner["slot"] = slot
		return inner
	var rm: float = Catalog.RARITY_MUL[rarity]
	# 원 @16433..16435
	var lv_a: Variant = _lv()
	var lv_or1: float = lv_a if _js_truthy_num(lv_a) else 1.0
	var atk_max: int = js_to_int32((200.0 + tier * 200.0 + lv_or1) * 0.25)
	var atk_floor: float = [0.0, 0.05, 0.15, 0.25, 0.40, 0.50][rarity]
	var atk_roll: int = maxi(1, js_to_int32(atk_max * (atk_floor + (1.0 - atk_floor) * pow(_rand(), 2.0))))
	# 원 @16436..16461 base 객체 리터럴 — 전 슬롯 RNG 식을 키 순서대로 평가(선택 슬롯 최적화 금지).
	var base := _eval_base_literal(tier, atk_roll)
	var b: Dictionary = base[slot]
	if slot == "weapon" or slot == "shield":
		el = EL.P                                          # 원 @16464 (요청 el 은 ledger 에 별도 보존)
	# 원 @16465..16467 — Date.now() 가 Math.random() 보다 먼저 평가
	var now_v: float = _now()
	var id_v: float = now_v + _rand()
	var name_v: String = ""
	if slot != "weapon" and slot != "bow":
		name_v = NAMES_T0["ring1" if slot == "ring2" else slot][el]
	var item := {"id": id_v, "slot": slot, "el": el, "rarity": rarity, "tier": tier, "name": name_v,
		"emoji": Catalog.SLOT_EMOJI[Catalog.SLOT_NAMES.find(slot)]}
	if slot == "weapon":                                   # 원 @16469..16482
		var wd: Dictionary = Catalog.WTYPES[wtype]
		item["wtype"] = wtype
		item["name"] = _catalog.weapon_name(wtype, el, tier)
		item["emoji"] = wd.emoji
		item["atk"] = js_to_int32(atk_roll * float(wd.atkMul))
		item["spd"] = js_to_fixed_number(float(wd.spdMul) * rm, 2)
		item["wStCost"] = js_to_int32(float(wd.stCost) * (2.0 - rm * 0.3))
		item["wArcW"] = js_to_fixed_number(float(wd.arcW), 2)
		item["wRange"] = js_to_int32(float(wd.range) * (0.95 + _rand() * 0.1))
		item["wStagger"] = js_to_int32(float(wd.stagger) * rm)
		item["bonusRange"] = mini(3, js_to_int32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _rand() * 0.4)))
	if slot == "bow":                                      # 원 @16484..16497
		var bd: Dictionary = Catalog.BOWTYPES[wtype]
		item["btype"] = wtype
		item["name"] = BOW_NAMES_CROSSBOW_T0[el]
		item["emoji"] = bd.emoji
		item["atk"] = js_to_int32(atk_roll * float(bd.atkMul))
		item["bowSpd"] = js_to_fixed_number(float(bd.spdMul) * rm, 2)
		item["bowStCost"] = js_to_int32(float(bd.stCost) * (2.0 - rm * 0.3))
		item["bowRange"] = js_to_int32(float(bd.range) * (0.95 + _rand() * 0.1))
		item["bowProjSpd"] = bd.projSpd
		item["bonusRange"] = mini(3, js_to_int32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _rand() * 0.4)))
		item["bowPierce"] = js_to_fixed_number((0.02 + tier * 0.03 + rarity * 0.04) * (0.8 + _rand() * 0.4), 2)
	if slot == "shield":                                   # 원 @16499..16502
		item["bonusRange"] = mini(3, js_to_int32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _rand() * 0.4)))
		item["shieldWt"] = maxi(1, js_to_int32(float(b.shieldWt) * (2.0 - rm * 0.3)))
	# 원 @16503..16510
	if slot != "weapon" and slot != "bow" and b.has("atk") and _js_truthy_num(b.atk):
		item["atk"] = b.atk if slot == "helmet" else js_to_int32(b.atk * rm * (0.9 + _rand() * 0.2))
	if b.has("def") and _js_truthy_num(b.def):
		item["def"] = js_to_int32(b.def * rm * (0.9 + _rand() * 0.2))
	if b.has("eDef") and _js_truthy_num(b.eDef):
		item["eDef"] = js_to_int32(b.eDef * rm * (0.9 + _rand() * 0.2))
	if slot != "weapon" and slot != "bow" and b.has("spd"):
		item["spd"] = js_to_fixed_number(float(b.spd) * rm, 2)
	if b.has("bonusSt") and _js_truthy_num(b.bonusSt):
		item["bonusSt"] = js_to_int32(b.bonusSt * rm * (0.9 + _rand() * 0.2))
	if b.has("charge") and _js_truthy_num(b.charge):
		item["charge"] = js_to_int32(b.charge * rm * (0.9 + _rand() * 0.2))
	if b.has("chargeDist") and _js_truthy_num(b.chargeDist):
		item["chargeDist"] = js_to_int32(b.chargeDist * rm)
	if b.has("chargeW") and _js_truthy_num(b.chargeW):
		item["chargeW"] = js_to_int32(b.chargeW * rm * (0.9 + _rand() * 0.2))
	if slot == "armor":                                    # 원 @16512..16515 (rarity>=3 chargeAoE 범위 밖)
		item["bonusRange"] = mini(3, js_to_int32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _rand() * 0.4)))
		item["bonusChargeDist"] = mini(3, js_to_int32((1.0 + tier * 0.35 + rarity * 0.45) * (0.8 + _rand() * 0.4)))
	# 원 @16521..16525 (range 는 base 에 없음)
	if b.has("stagger") and _js_truthy_num(b.stagger):
		item["stagger"] = js_to_int32(b.stagger * rm)
	if b.has("bonusHp") and _js_truthy_num(b.bonusHp):
		item["bonusHp"] = b.bonusHp
	if b.has("bonusShield") and _js_truthy_num(b.bonusShield):
		item["bonusShield"] = b.bonusShield
	if b.has("bonusMp") and _js_truthy_num(b.bonusMp):
		item["bonusMp"] = b.bonusMp
	if slot == "boots" and rarity >= 1:                    # 원 @16527..16530
		var cc_chance: float = [0.0, 0.2, 0.4, 0.7, 1.0][rarity]
		if _rand() < cc_chance:
			item["chargeCharge"] = 1                       # rarity>=3 분기 범위 밖
	if slot == "helmet":                                   # 원 @16533..16552 (rarity<=1 → extraCount 0)
		item["beamDmg"] = js_to_fixed_number(float(b.beamDmg) * rm, 1)
		item["elements"] = [{"el": el, "dmg": js_to_int32(item.beamDmg * (8.0 + tier * 3.0))}]
		if rarity >= 1:
			item["splashR"] = mini(10, js_to_int32((10.0 + tier * 6.0 + rarity * 8.0) * (0.9 + _rand() * 0.2)))
		item["bonusRange"] = mini(5, js_to_int32((1.0 + tier * 0.6 + rarity * 0.8) * (0.8 + _rand() * 0.4)))
	if slot == "gloves":                                   # 원 @16554..16557 (rarity0 범위)
		item["potCd"] = js_to_fixed_number([0.05, 0.10, 0.15, 0.20, 0.30][rarity] * (0.9 + _rand() * 0.2), 3)
	if slot == "pants":                                    # 원 @16559..16561
		var prev: Variant = item.get("bonusHp")
		var prev_n: float = float(prev) if _js_truthy_num(prev) else 0.0
		item["bonusHp"] = int(prev_n) + js_to_int32((5.0 + tier * 4.0 + rarity * 6.0) * (0.9 + _rand() * 0.2))
	if slot == "ring1" or slot == "ring2":                 # 원 @16568..16579
		redraws += _accessory_affix_picks(item, RING_AFF_POOL, tier)
	if slot == "necklace":                                 # 원 @16581..16591
		redraws += _accessory_affix_picks(item, NECK_AFF_POOL, tier)
	# 원 @16597..16616 스탯 보너스: rarity>=1 && !무기파트. 시작 범위 rarity1 은 방어구 파트(armor/shield/boots/cape)만.
	var is_weapon_part: bool = slot == "weapon" or slot == "bow" or slot == "helmet"
	if rarity >= 1 and not is_weapon_part:
		var stat_pool: Array[String] = ["bStr", "bDex", "bInt"]
		var stat_count: int = 1 if _rand() < 0.4 else 0   # rarity==1 분기
		var picked: Array[String] = []
		for _i in range(stat_count):
			var pool: Array[String] = []
			for s in stat_pool:
				if not picked.has(s):
					pool.append(s)
			if pool.is_empty():
				break
			picked.append(pool[js_to_int32(_rand() * pool.size())])
		for sk in picked:
			item[sk] = js_to_int32((4.0 + tier * 4.0 + rarity * 6.0) * (0.8 + _rand() * 0.4))
	if slot == "bracelet":                                 # 원 @16618..16622
		item["brType"] = "demon" if _rand() < 0.5 else "life"
		item["name"] = BR_NAMES_T0[item.brType][el]
	# 원 @16625 item.affixes=rollAffixes(rarity,slot,item.brType)
	item["affixes"] = _roll_affixes(rarity, slot, item.get("brType"))
	# 원 @16627..16634
	var impl_key: String = ("bracelet_" + item.brType) if slot == "bracelet" else slot
	var impl: Dictionary = IMPLICIT_TABLE[impl_key]
	var iv: float = float(impl.val[0]) + _rand() * (float(impl.val[1]) - float(impl.val[0]))
	item["_implicitStat"] = impl.stat
	item["_implicitVal"] = js_to_fixed_number(iv, 2)
	item["_implicitKo"] = impl.ko
	item["legendarySpecial"] = null                        # 원 @16636 (rarity>=4 범위 밖)
	item["uniqueSpecial"] = null                           # 원 @16643 (rarity>=5 범위 밖)
	# 원 @16650..16653  _pLv=P&&P.lv?P.lv:1
	var lv_c: Variant = _lv()
	var p_lv: float = lv_c if _js_truthy_num(lv_c) else 1.0
	var item_lv: int = int(minf(900.0, floorf(p_lv / 10.0) * 10.0))
	item["itemLv"] = item_lv
	item["reqLv"] = maxi(0, item_lv - 10)
	# Current snapshot G16148–16151: closed sockets; no RNG draw.
	item["socketCount"] = 0
	item["crystals"] = []
	item["socketQ"] = []
	_check_numeric_fault(item)
	_ledger["items_created"] += 1
	_ledger.events.append({"kind": "mk_item", "slot": slot, "draws": _ledger.rng_draws - draws0, "accessory_redraws": redraws})
	return item

## 원 base 리터럴 @16436..16461 — 키 순서대로 전 슬롯 평가 (belt/ossuary 포함, Math.random 28회).
func _eval_base_literal(tier: int, atk_roll: int) -> Dictionary:
	var base := {}
	base["weapon"] = {"atk": atk_roll, "spd": 1, "antiRevive": _anti_revive()}
	base["shield"] = {"def": 20 + tier * 20, "stagger": 15 + tier * 8, "shieldWt": 10 - tier, "bonusHp": _bonus_roll(tier),
		"bonusSt": _bonus_roll(tier), "antiRevive": _anti_revive()}
	base["boots"] = {"def": 20 + tier * 20, "spd": tier * 0.08, "bonusSt": _bonus_roll(tier), "chargeDist": 14 + tier * 3,
		"bonusHp": _bonus_roll(tier)}
	base["armor"] = {"def": 20 + tier * 20, "charge": 8 + tier * 5, "chargeDist": 22 + tier * 4, "chargeW": 12 + tier * 5,
		"chargeAoE": 0, "bonusSt": _bonus_roll(tier), "bonusHp": _bonus_roll(tier)}
	base["helmet"] = {"atk": atk_roll, "beamDmg": 1.5 + tier * 1.2, "def": 20 + tier * 20}
	base["bow"] = {"atk": atk_roll, "spd": 1, "antiRevive": _anti_revive()}
	base["gloves"] = {"def": 20 + tier * 20, "spd": tier * 0.04, "bonusHp": _bonus_roll(tier), "bonusSt": _bonus_roll(tier)}
	base["pants"] = {"def": 20 + tier * 20, "bonusSt": _bonus_roll(tier), "bonusHp": _bonus_roll(tier)}
	base["cape"] = {"def": 20 + tier * 20, "spd": tier * 0.03, "bonusHp": _bonus_roll(tier), "bonusSt": _bonus_roll(tier)}
	base["belt"] = {"eDef": 20 + tier * 20, "dmgBonus": 10 + tier * 10, "bonusSt": (4 + tier * 3), "bonusShield": _bonus_roll(tier),
		"bonusMp": _bonus_roll(tier)}
	base["necklace"] = {"eDef": 20 + tier * 20, "critRate": 10, "dmgBonus": 20 + tier * 20, "bonusShield": _bonus_roll(tier),
		"bonusMp": _bonus_roll(tier)}
	base["ring1"] = {"eDef": 20 + tier * 20, "critRate": 5, "dmgBonus": 10 + tier * 10, "bonusShield": _bonus_roll(tier),
		"bonusMp": _bonus_roll(tier)}
	base["ring2"] = {"eDef": 20 + tier * 20, "critRate": 5, "dmgBonus": 10 + tier * 10, "bonusShield": _bonus_roll(tier),
		"bonusMp": _bonus_roll(tier)}
	base["bracelet"] = {"eDef": 20 + tier * 20, "dmgBonus": 10 + tier * 10, "bonusShield": _bonus_roll(tier), "bonusMp": _bonus_roll(tier)}
	base["headband"] = {"eDef": 20 + tier * 20, "dmgBonus": 10 + tier * 10, "mpRegen": (1 + tier * 1) * 2,
		"bonusShield": _bonus_roll(tier), "bonusMp": _bonus_roll(tier)}
	base["ossuary"] = {"eDef": 20 + tier * 20, "bonusMp": _bonus_roll(tier)}
	return base

## +(0.01+0.19*Math.pow(Math.random(),3)).toFixed(2)
func _anti_revive() -> float:
	return js_to_fixed_number(0.01 + 0.19 * pow(_rand(), 3.0), 2)

## ~~(tier*50+10+Math.random()*40)
func _bonus_roll(tier: int) -> int:
	return js_to_int32(tier * 50.0 + 10.0 + _rand() * 40.0)

## 원 반지/목걸이 추가 어픽스 2개 pick (while 재추첨 포함). 결과는 이후 rollAffixes 가 덮어쓴다(원 동작).
func _accessory_affix_picks(item: Dictionary, pool: Array[String], tier: int) -> int:
	var redraws := 0
	var a1: String = pool[js_to_int32(_rand() * pool.size())]
	var a2: String = pool[js_to_int32(_rand() * pool.size())]
	while a2 == a1 and _fault.is_empty():
		a2 = pool[js_to_int32(_rand() * pool.size())]
		redraws += 1
	if not item.has("affixes"):
		item["affixes"] = []
	# AFFIX_POOL.find 첫 일치 tiers[min(tier,len-1)] — tier0 값만 내장
	item.affixes.append({"id": a1, "val": ACCESSORY_AFFIX_TIER0[a1]})
	item.affixes.append({"id": a2, "val": ACCESSORY_AFFIX_TIER0[a2]})
	return redraws

## 원 rollAffixes @15798..15841
func _roll_affixes(grade: int, slot: String, br_type: Variant) -> Array:
	var a_slot: String = AFSLOT.get(slot, "")
	if a_slot == "":
		return []
	var max_count: int = [0, 2, 3, 5, 6, 7][grade]
	if max_count == 0:
		return []                                          # 캐시 구성만 (RNG 0)
	var pre: Array = []
	var suf: Array = []
	for a in AFFIX_POOL:
		if not (a.slots as Array).has(a_slot):
			continue
		if a.has("brType") and a.brType != br_type:
			continue
		if DEMO_MODE and DEMO_AFFIX_BANNED.has(a.id):
			continue
		if a.type == 0:
			pre.append(a)
		else:
			suf.append(a)
	var result: Array = []
	var used_g := {}
	var order: Array = [pre, suf] if grade % 2 == 1 else [suf, pre]
	for i in range(max_count):
		if not _fault.is_empty():
			break
		var pool: Array = order[i % 2]
		var base_tier: int = 2 if grade >= 4 else (1 if grade >= 3 else 0)
		var lv: Variant = _lv()                            # 원 (P?P.lv:1)/200 — P 존재
		var lv_bonus: int = js_to_int32(float(lv) / 200.0) if lv != null else 0
		var tw: float = 0.0
		for a in pool:
			if not used_g.has(a.group) and a.tiers[0] != null:
				tw += float(a.weight)
		if tw <= 0.0:
			continue
		var r: float = _rand() * tw
		for a in pool:
			if used_g.has(a.group) or a.tiers[0] == null:
				continue
			r -= float(a.weight)
			if r <= 0.0:
				var tiers: Array = a.tiers
				var max_tier: int = mini(tiers.size() - 1, base_tier + lv_bonus)
				var val: Variant
				var tier_idx: int
				if a.has("tierW"):
					var tw_sum: float = 0.0
					for ti in range(max_tier + 1):
						tw_sum += float(a.tierW[ti]) if ti < a.tierW.size() and _js_truthy_num(a.tierW[ti]) else 1.0
					var tr: float = _rand() * tw_sum
					tier_idx = 0
					for ti in range(max_tier + 1):
						tr -= float(a.tierW[ti]) if ti < a.tierW.size() and _js_truthy_num(a.tierW[ti]) else 1.0
						if tr <= 0.0:
							tier_idx = ti
							break
					val = tiers[tier_idx]
				else:
					var lo: float = float(tiers[0])
					var hi: float = float(tiers[max_tier])
					var rr: float = pow(_rand(), float(a.skewRoll)) if a.has("skewRoll") else _rand()
					if a.unit == "cnt" or a.unit == "val":
						val = int(lo) + js_to_int32(rr * (hi - lo + 1.0))
					else:
						val = js_to_fixed_number(lo + (hi - lo) * rr, 4)
					var fv: float = float(val)
					if fv >= float(tiers[mini(2, max_tier)]):
						tier_idx = max_tier
					elif fv >= float(tiers[mini(1, max_tier)]):
						tier_idx = mini(1, max_tier)
					else:
						tier_idx = 0
				result.append({"id": a.id, "tier": tier_idx, "value": val})
				used_g[a.group] = 1
				break
	return result

func _check_numeric_fault(item: Dictionary) -> void:
	if not _fault.is_empty():
		return
	for k in item:
		var v: Variant = item[k]
		if v is float and is_nan(v) and k != "id":
			_fault = {"status": UNSUPPORTED_SCOPE, "reason": "to_fixed_range_unsupported:" + str(k)}
			return

# ───────────────────────── defaultItems / NEW GAME ─────────────────────────

func _request(req: Array) -> Dictionary:
	var r := mk_item(req[0], req[1], req[2], req[3], req[4])
	_ledger.items.append({"request": {"slot": req[0], "tier": req[1], "el": req[2], "rarity": req[3], "wtype": req[4]},
		"status": r.status, "out_el": r.item.el if r.item != null else null})
	return r

## 원 defaultItems() — 15개 생성만 (배치 없음). 반환 {status, items, reason}
func default_items() -> Dictionary:
	var items: Array = []
	for req in DEFAULT_ITEM_REQUESTS:
		var r := _request(req)
		if r.status != READY:
			return {"status": r.status, "items": items, "reason": r.reason}
		items.append(r.item)
	return {"status": READY, "items": items, "reason": ""}

## 원 NEW GAME @64425..64430 시작 장비 명령. sink 를 실제 호출한다.
## 반환 {status, equipped:Array(15), bag:Array(10), reason}. 바인딩 누락 시 provider/sink 호출 0.
func run_new_game_starter_items() -> Dictionary:
	var rd := readiness()
	if rd.status != READY:
		return {"status": NOT_READY, "equipped": [], "bag": [], "reason": "missing:" + ",".join(PackedStringArray(rd.missing))}
	var di := default_items()                              # _di=defaultItems() — 15개 전부 먼저 생성
	if di.status != READY:
		return {"status": di.status, "equipped": [], "bag": [], "reason": di.reason}
	var equipped: Array = []
	for it in di.items:                                    # for(const it of _di)INV.equipped[it.slot]=it
		if not _equip_slot.is_valid():
			return {"status": NOT_READY, "equipped": equipped, "bag": [], "reason": "equip_slot_invalidated"}
		var ok: Variant = _equip_slot.call(it.slot, it)
		_ledger["equip_calls"] += 1
		_ledger.events.append({"kind": "equip", "slot": it.slot})
		if not (ok is bool and ok):
			return {"status": SINK_REJECTED, "equipped": equipped, "bag": [], "reason": "equip_slot:" + str(it.slot)}
		equipped.append(it)
	var bag: Array = []
	for req in BAG_ITEM_REQUESTS:                          # INV.bag.push(mkItem(...)) — 생성 직후 push
		var r := _request(req)
		if r.status != READY:
			return {"status": r.status, "equipped": equipped, "bag": bag, "reason": r.reason}
		if not _append_bag.is_valid():
			return {"status": NOT_READY, "equipped": equipped, "bag": bag, "reason": "append_bag_invalidated"}
		var ok2: Variant = _append_bag.call(r.item)
		_ledger["bag_calls"] += 1
		_ledger.events.append({"kind": "bag", "slot": r.item.slot})
		if not (ok2 is bool and ok2):
			return {"status": SINK_REJECTED, "equipped": equipped, "bag": bag, "reason": "append_bag:" + str(r.item.slot)}
		bag.append(r.item)
	return {"status": READY, "equipped": equipped, "bag": bag, "reason": ""}
