extends RefCounted
## IT-02 readonly presentation; no Main, inventory/save writes, RNG or UI nodes.
## Source verified against origin/main 284d7faf49295b2f5061937a47ce96038032ed3c game.html:
## 14346-14351 rarity; 14858-15013 names/descriptions; 50422-50456 format/name.
## Tables below are generated from literal expressions, never hand-transcribed.

const Coerce := preload("res://port_modules/equipment_affix_reader/producer.gd")
const READY := "READY"
const NOT_READY := "NOT_READY"

const RARITY := [
	"common",
	"uncommon",
	"rare",
	"epic",
	"legend"
]

const RARITY_N := [
	"일반",
	"고급",
	"희귀",
	"영웅",
	"전설",
	"유니크"
]

const RARITY_N_EN := [
	"Common",
	"Uncommon",
	"Rare",
	"Epic",
	"Legendary",
	"Unique"
]

const RARITY_C := [
	"#aaa",
	"#44cc44",
	"#4488ff",
	"#bb44ff",
	"#ffaa00",
	"#8e55e9"
]

const RARITY_MUL := [
	1,
	1.2,
	1.5,
	1.8,
	2.2,
	2.5
]

const AFFIX_NAMES_KO := {
	"poisonDot": "맹독의",
	"fireDot": "불꽃의",
	"iceDot": "냉기의",
	"lightChain": "번개의",
	"darkCurse": "암흑의",
	"armorPen": "관통의",
	"critChance": "광폭의",
	"staggerBns": "파쇄의",
	"chainTarget": "연쇄의",
	"killSlayer": "학살의",
	"critExplosion": "폭발의",
	"elemFocus": "집중의",
	"atkSpeed": "쾌속의",
	"parryBonus": "패리의",
	"comboBoost": "추적자의",
	"dashBoost": "사슬의",
	"skillBoost": "궁극의",
	"cooldownRed": "집중력의",
	"defFlat": "강철의",
	"maxHPFlat": "강인의",
	"shieldFlat": "수호의",
	"maxHPPct": "활력의",
	"movSpeed": "신속의",
	"fireRes": "화염수호",
	"iceRes": "빙결수호",
	"lightRes": "암전수호",
	"darkRes": "암흑수호",
	"poisonRes": "독수호",
	"allRes": "전원소수호",
	"physDR": "물리방패의",
	"reflect": "반사의",
	"thorns": "가시의",
	"barrier": "흡수의",
	"ccRes": "인내의",
	"crisisBoost": "위기의",
	"counterHit": "피격반격의",
	"parryExplosion": "패링폭발의",
	"staggerExplosion": "스태거폭발의",
	"elemConvert": "원소전환의",
	"statusClean": "정화의",
	"lastStand": "불굴의",
	"reviveOnce": "부활의",
	"dropRate": "약탈의",
	"expBonus": "경험의",
	"goldBonus": "골드의",
	"potionPower": "포션강화의",
	"extraST": "사슬의",
	"antiRevive": "진혼의",
	"revivePow": "부활의",
	"reviveCd": "윤회의",
	"lifeMaxHP": "생명력의",
	"lifeRegen": "재생의",
	"lifeHealPow": "치유의",
	"magicDmg": "마력의",
	"mpCostRed": "절약의",
	"maxMPPct": "마나력의",
	"maxSTFlat": "지속의",
	"maxMPFlat": "마나의",
	"eDefFlat": "원소수호의",
	"lckFlatN": "행운의",
	"lckFlatR": "행운의",
	"gritFlatN": "근성의",
	"gritFlatR": "근성의",
	"abundDmg": "풍요의",
	"predDmg": "약자포식의",
	"fullLifeDmg": "만혈의",
	"lowLifeDmg": "사선의",
	"overkilDmg": "처형의",
	"closeDmg": "근접살의",
	"farDmg": "원거리의",
	"stunDmgUp": "경직파의",
	"frozenDmgUp": "동파의",
	"burnDmgUp": "연소의",
	"poisonDmgUp": "맹독살의",
	"curseDmgUp": "저주살의",
	"slowDmgUp": "구속의",
	"bossSlayer": "왕살의",
	"eliteSlayer": "정예살의",
	"mobSlayer": "군살의",
	"firstStrike": "선제의",
	"lifeLeech": "흡혈의",
	"manaLeech": "흡마의",
	"stLeech": "흡정의",
	"lifeOnHit": "타격재생의",
	"onKillHeal": "처치회복의",
	"onKillMana": "처치흡마의",
	"onKillStam": "처치활력의",
	"onKillExplode": "처치폭발의",
	"onKillSpeed": "처치질주의",
	"healthyDef": "건강방어의",
	"injuredDR": "중상보호의",
	"injuredSpeed": "위기질주의",
	"dotDR": "지속피해방어의",
	"bossDR": "왕피해방어의",
	"closeDR": "근접방어의",
	"farDR": "원거리방어의",
	"hpOnKill": "처치생명의",
	"shieldOnKill": "처치수호의",
	"stCostRed": "절약의",
	"fireDmgPct": "화염강화의",
	"firePen": "화염관통의",
	"fireOnHit": "발화의",
	"fireBurst": "화염폭발의",
	"fireDuration": "맹화의",
	"fireDmgBns": "화염의힘",
	"iceDmgPct": "빙결강화의",
	"icePen": "빙결관통의",
	"iceOnHit": "동결의",
	"iceBurst": "빙결폭발의",
	"iceDuration": "영빙의",
	"iceDmgBns": "빙결의힘",
	"lightDmgPct": "뇌전강화의",
	"lightPen": "뇌전관통의",
	"lightOnHit": "감전의",
	"lightBurst": "뇌전폭발의",
	"lightDuration": "낙뢰의",
	"lightDmgBns": "뇌전의힘",
	"darkDmgPct": "암흑강화의",
	"darkPen": "암흑관통의",
	"darkOnHit": "침식의",
	"darkBurst": "암흑폭발의",
	"darkDuration": "심연의",
	"darkDmgBns": "암흑의힘",
	"poisonDmgPct": "맹독강화의",
	"poisonPen": "독관통의",
	"poisonOnHit": "중독의",
	"poisonBurst": "독폭발의",
	"poisonDuration": "맹독지속의",
	"poisonDmgBns": "독의힘",
	"meleeDmgPct": "격투의",
	"rangedDmgPct": "원사의",
	"spellDmgPct": "주술의",
	"beamDmgPct": "광선의",
	"dotDmgPct": "침식의",
	"projDmgPct": "탄도의",
	"aoeRadiusPct": "확산의",
	"critRateMelee": "근접회심의",
	"critRateSpell": "마법회심의",
	"critRateBow": "사격회심의",
	"meleeAtkSpd": "근접쾌속의",
	"bowAtkSpd": "사격쾌속의",
	"castSpeed": "영창의",
	"elemPenAll": "전속성관통의",
	"shieldBypass": "쉴드파괴의",
	"armorShred": "갑옷분쇄의",
	"projSpeedPct": "탄속의",
	"onHitFireball": "화구발사의",
	"onHitChainL": "연쇄뇌격의",
	"onHitFreeze": "동결타의",
	"onHitStun": "경직타의",
	"onHitPoison": "독침의",
	"onHitBleed": "출혈의",
	"onHitWeaken": "약화의",
	"onHitSlow": "둔화의",
	"onHitMark": "표적의",
	"onCritExplode": "회심폭발의",
	"onCritChain": "회심연쇄의",
	"onCritFreeze": "회심빙결의",
	"onCritHeal": "회심치유의",
	"onCritMana": "회심영력의",
	"onCritShield": "회심수호의",
	"onHitDefBoost": "피격강화의",
	"onHitThorns": "반격가시의",
	"procIceNova": "빙결파동의",
	"procDarkShield": "암흑보호의",
	"procHealPulse": "치유파동의",
	"procCorpseExplode": "시체폭발의",
	"onDodgeDmg": "회피반격의",
	"onParryBurst": "패링폭파의",
	"kiSlashParry": "검기막이의",
	"kiSlashFullCrit": "극참의",
	"maliceWeakAmp": "잠식의",
	"rageSkCrit": "격노일섬의",
	"rageSkDmg": "분쇄의",
	"onBlockHeal": "블록치유의",
	"onBlockMana": "블록영력의",
	"skWhirlDmg": "회전참강화",
	"skBeamDmg": "옴니빔강화",
	"skFireballDmg": "화구강화",
	"skMissileDmg": "미사일강화",
	"skBlueShotDmg": "청탄강화",
	"skBlastShotDmg": "폭렬탄강화",
	"skHellRayDmg": "지옥광선강화",
	"skMaliceStormDmg": "악의폭풍강화",
	"skChainSlashDmg": "연쇄참강화",
	"skGiantSlamDmg": "지옥강타 1 강화",
	"skGhostWalkDmg": "유령보행강화",
	"skMaliceMortarDmg": "악의박격강화",
	"skFireAuraDmg": "화염오라강화",
	"skIceOrbDmg": "빙구강화",
	"skFireBeamDmg": "화염빔강화",
	"skMaliceHuntDmg": "악의사냥강화",
	"skDarkPillarDmg": "암흑기둥강화",
	"skPlagueDmg": "역병강화",
	"skSpikeAuraDmg": "가시오라강화",
	"skChainAssaultDmg": "연쇄돌격강화",
	"dodgeChance": "회피의",
	"dodgeCooldown": "회피쿨감의",
	"maxHPPctArmor": "생명력의",
	"shieldPct": "수호력의",
	"shieldRegenPct": "수호재생의",
	"shieldCdRed": "수호쿨감의",
	"hpRegenFlat": "재생의",
	"hpRegenPct": "재생력의",
	"stRegenFlat": "활력재생의",
	"stRegenPct": "활력의",
	"mpRegenFlat": "마력재생의",
	"mpRegenPct": "마력의",
	"fireDR": "화염보호의",
	"iceDR": "빙결보호의",
	"lightDR": "뇌전보호의",
	"darkDR": "암흑보호의",
	"poisonDRdef": "해독의",
	"allDR": "만물보호의",
	"eliteDR": "정예보호의",
	"stunRes": "경직저항의",
	"freezeRes": "빙결저항의",
	"slowRes": "감속저항의",
	"knockbackRes": "넉백저항의",
	"dashRange": "돌진거리의",
	"dashCooldown": "돌진쿨감의",
	"movSpeedCombat": "전투질주의",
	"movSpeedOOC": "평화질주의",
	"pickupRadius": "습득범위의",
	"strFlat": "힘의",
	"dexFlat": "민첩의",
	"intFlat": "지능의",
	"vitFlat": "활력의",
	"allStat": "만능의",
	"maxSTPct": "지구력의",
	"resourceOnHit": "타격자원의",
	"fireResMax": "화염한계의",
	"iceResMax": "빙결한계의",
	"lightResMax": "뇌전한계의",
	"darkResMax": "암흑한계의",
	"poisonResMax": "독한계의",
	"skillCdRed": "스킬쿨감의",
	"potionCdRed": "물약쿨감의",
	"craftBonus": "장인의",
	"goldFind": "탐욕의",
	"expBonusRing": "수련의",
	"dropRateAcc": "수집의",
	"demonDmg": "악마의힘",
	"demonDR": "악마보호의",
	"soulHarvest": "영혼수확의",
	"lifeLeechBr": "생명흡수의",
	"overhealShield": "과치유수호의",
	"onFullManaDmg": "만마력의",
	"whileMovingDR": "이동방어의",
	"whileStationaryDmg": "정지공세의",
	"afterDodgeDmg": "회피공세의",
	"afterParryShield": "패링보호의",
	"comboThreshold": "콤보폭발의",
	"flatPhysDmg": "물리타격의",
	"flatFireDmg": "화염타격의",
	"flatIceDmg": "빙결타격의",
	"flatLightDmg": "뇌전타격의",
	"flatDarkDmg": "암흑타격의",
	"flatPoisonDmg": "독타격의",
	"minDmgFlat": "최소공격의",
	"maxDmgFlat": "최대공격의",
	"atkPctAll": "전투력의",
	"weaponRange": "무기사거리의",
	"bowRange": "활사거리의",
	"doubleStrike": "이중타의",
	"multiShot": "다중발사의",
	"pierceChance": "관통의",
	"pierceCount": "관통횟수의",
	"pierceDmgKeep": "관통유지의",
	"chainDmgKeep": "연쇄유지의",
	"pierceFlat": "관통력의",
	"splashRadius": "범위확장의",
	"splashDmg": "범위피해의",
	"chargeAtkDmg": "돌진공격의",
	"counterAtkDmg": "반격공격의",
	"backstabDmg": "후방타의",
	"executeDmg": "처형의",
	"dotTickRate": "침식가속의",
	"bleedDps": "출혈의",
	"bleedDuration": "출혈지속의",
	"flatMagicDmg": "마법타격의",
	"spellAmp": "주문증폭의",
	"killStreakDmg": "연살뎀의",
	"killStreakSpd": "연살속의",
	"momentumDmg": "기세의",
	"standingDmg": "정지공격의",
	"movingDmg": "이동공격의",
	"recentParryDmg": "패링공세의",
	"nearDeathDmg": "임사폭발의",
	"fullStaminaDmg": "만기력공의",
	"fullManaDmg2": "만마력공의",
	"freshKillDmg": "신선처치의",
	"stunDuration": "경직연장의",
	"freezeDuration": "빙결연장의",
	"slowEfficiency": "둔화강화의",
	"poisonStack": "독중첩의",
	"bleedStack": "출혈중첩의",
	"igniteDmg": "발화강화의",
	"frostbiteDmg": "동상강화의",
	"shockDmg": "감전강화의",
	"critMultiOnLowHP": "사선회심의",
	"armorDefPct": "갑옷강화의",
	"shieldBlockDR": "블록흡수의",
	"shieldBashDmg": "방패타격의",
	"shieldStagger": "방패경직의",
	"glovesAtkSpd": "격투속의",
	"glovesCritDmg": "격투회심의",
	"glovesStagger": "격투경직의",
	"pantsHPRegen": "하반재생의",
	"pantsCCDuration": "CC단축의",
	"bootsDashDmg": "돌진타의",
	"bootsChargeRange": "돌진범위의",
	"bootsMSOnKill": "처치질주의",
	"cloakDodgeDR": "회피감쇠의",
	"cloakMSPct": "은신질주의",
	"cloakElemDR": "속성감쇠의",
	"burnDR": "화상저항의",
	"helmMPPct": "마나왕관의",
	"helmCastSpd": "시전왕관의",
	"helmCooldown": "쿨감왕관의",
	"helmExpPct": "경험왕관의",
	"hybAtkHP": "공생의",
	"hybDefSpd": "수질의",
	"hybCritLeech": "회심흡의",
	"hybHPMP": "체마의",
	"hybHPST": "체기의",
	"hybMPST": "마기의",
	"hybAllRegen": "전재생의",
	"hybStrDex": "힘민의",
	"hybStrInt": "힘지의",
	"hybDexInt": "민지의",
	"hybLckGrit": "운근의",
	"hybDropExp": "수확의",
	"hybFireIce": "빙화의",
	"hybLightDark": "뇌암의",
	"hybMeleeSpell": "근마의",
	"hybElemDotDmg": "속성침식의",
	"ringFireDmg": "화염반지의",
	"ringIceDmg": "빙결반지의",
	"ringLightDmg": "뇌전반지의",
	"ringDarkDmg": "암흑반지의",
	"ringPoisonDmg": "독반지의",
	"ringDmgPerCombo": "콤보반지의",
	"ringMPOnKill": "처치마나의",
	"ringProjPierce": "관통반지의",
	"neckAllDmg": "만능목걸이의",
	"neckCritDmg": "회심목걸이의",
	"neckElemPen": "관통목걸이의",
	"neckSkillDmg": "스킬목걸이의",
	"neckComboMax": "콤보한계의",
	"neckKillHeal": "처치치유의",
	"beltSTMax": "지구벨트의",
	"beltPotionHP": "포션벨트의",
	"beltSTRegen": "활력벨트의",
	"beltGoldDrop": "탐욕벨트의",
	"headbandMPMax": "마나띠의",
	"headbandCastSpd": "시전띠의",
	"headbandMPRegen": "마력띠의",
	"headbandSpellDmg": "주술띠의",
	"headbandElemDmg": "속성띠의",
	"arcWarriorDmg": "전사의힘",
	"arcWarriorHP": "전사생명의",
	"arcWarriorLifeSteal": "전사흡혈의",
	"arcWarriorPoise": "전사인내의",
	"arcMageDmg": "마법사의힘",
	"arcMageMP": "마법사마나의",
	"arcMageShield": "마법사수호의",
	"arcMageElemDmg": "마법사속성의",
	"arcRangerDmg": "궁수의힘",
	"arcRangerRange": "궁수사거리의",
	"arcRangerPierce": "궁수관통의",
	"arcRangerMS": "궁수질주의",
	"arcTankHP": "탱크생명의",
	"arcTankDef": "탱크방어의",
	"arcTankBlock": "탱크블록의",
	"arcTankThorns": "탱크가시의",
	"arcAssassinCrit": "암살회심의",
	"arcAssassinBack": "암살후방의",
	"arcAssassinPoison": "암살독의",
	"arcAssassinDodge": "암살회피의",
	"endBossKiller": "종결자의",
	"endSurvival": "생존자의",
	"endShield": "종결수호의",
	"endCritDmg": "종결회심의",
	"endAtkFlat": "종결공격의",
	"endAllRes": "종결저항의",
	"endAllDmg": "종결파괴의",
	"endAllDR": "종결보호의",
	"endLeech": "종결흡혈의",
	"endPoise": "종결인내의",
	"endCooldownAll": "종결쿨감의",
	"endExpBonus": "종결경험의",
	"endDropBonus": "종결약탈의",
	"endMaliceGain": "종결악의의",
	"endSTR": "종결힘의",
	"endDEX": "종결민첩의",
	"endINT": "종결지능의",
	"endLCK": "종결행운의",
	"endGrit": "종결근성의",
	"endKillChain": "종결연살의",
	"healthyAtk": "건강공세의",
	"injuredDmg": "중상폭발의",
	"injuredLeech": "중상흡혈의",
	"vsBossDmg": "토벌의",
	"vsEliteDmg": "정예토벌의",
	"sharpAtk": "예리한",
	"brutalAtk": "맹렬한",
	"ruinAtk": "파멸의",
	"rageMaxFlat": "격노의",
	"rageDmg": "광분의",
	"critRate": "광폭의",
	"critDmgW": "극대화의",
	"critDmgA": "행운의",
	"critDmgB": "극대화의",
	"ancDmg": "전대의",
	"ancHP": "계승의",
	"ancDur": "계승의(구)"
}

const _AFFIX_DESC := {
	"poisonDot": "독 DoT",
	"fireDot": "화상 DoT",
	"iceDot": "빙결 DoT+감속",
	"lightChain": "연쇄전격",
	"darkCurse": "저주(힐차단)",
	"armorPen": "방어무시",
	"critChance": "치명타율",
	"staggerBns": "스태거+",
	"chainTarget": "체인타겟+",
	"killSlayer": "처치 후 뎀+",
	"critExplosion": "크리폭발(ATK×)",
	"elemFocus": "원소뎀+",
	"atkSpeed": "공격속도+",
	"parryBonus": "패리보너스+",
	"comboBoost": "추적콤보+10",
	"dashBoost": "사슬뎀+",
	"skillBoost": "스킬뎀+",
	"cooldownRed": "쿨다운-",
	"defFlat": "방어력+",
	"maxHPFlat": "HP+",
	"shieldFlat": "쉴드+",
	"maxHPPct": "HP%+",
	"movSpeed": "이동속도+",
	"critRate": "크리확률+",
	"critDmgW": "크리배율+",
	"fireRes": "화염저항",
	"iceRes": "빙결저항",
	"lightRes": "암전저항",
	"darkRes": "암흑저항",
	"poisonRes": "독저항",
	"allRes": "전원소저항",
	"physDR": "물리DR",
	"reflect": "반사%",
	"thorns": "가시뎀",
	"barrier": "배리어",
	"ccRes": "CC저항",
	"crisisBoost": "위기뎀+",
	"counterHit": "피격반격",
	"parryExplosion": "패링폭발(ATK×)",
	"staggerExplosion": "체간파괴뎀+",
	"elemConvert": "원소전환",
	"statusClean": "상태이상해제",
	"lastStand": "불굴(1회생존)",
	"reviveOnce": "부활(HP회복)",
	"dropRate": "드롭률+",
	"expBonus": "경험치+",
	"goldBonus": "골드+",
	"potionPower": "포션회복+",
	"extraST": "사슬게이지+",
	"antiRevive": "부활억제",
	"revivePow": "부활력+",
	"reviveCd": "부활쿨-",
	"lifeMaxHP": "최대HP%+",
	"lifeRegen": "HP리젠+",
	"lifeHealPow": "회복력+",
	"magicDmg": "마법뎀+",
	"mpCostRed": "MP소비-",
	"maxMPPct": "MP%+",
	"fireDmgPct": "화염뎀%+",
	"firePen": "화염관통%",
	"fireOnHit": "적중화상",
	"fireBurst": "크리화폭",
	"fireDuration": "화상지속+",
	"fireDmgBns": "화염뎀보너스",
	"iceDmgPct": "빙결뎀%+",
	"icePen": "빙결관통%",
	"iceOnHit": "적중빙결",
	"iceBurst": "크리빙폭",
	"iceDuration": "빙결지속+",
	"iceDmgBns": "빙결뎀보너스",
	"lightDmgPct": "뇌전뎀%+",
	"lightPen": "뇌전관통%",
	"lightOnHit": "적중감전",
	"lightBurst": "크리뇌폭",
	"lightDuration": "감전지속+",
	"lightDmgBns": "뇌전뎀보너스",
	"darkDmgPct": "암흑뎀%+",
	"darkPen": "암흑관통%",
	"darkOnHit": "적중저주",
	"darkBurst": "크리암폭",
	"darkDuration": "저주지속+",
	"darkDmgBns": "암흑뎀보너스",
	"poisonDmgPct": "독뎀%+",
	"poisonPen": "독관통%",
	"poisonOnHit": "적중중독",
	"poisonBurst": "크리독폭",
	"poisonDuration": "독지속+",
	"poisonDmgBns": "독뎀보너스",
	"meleeDmgPct": "근접뎀%+",
	"rangedDmgPct": "원거리뎀%+",
	"spellDmgPct": "마법뎀%+",
	"beamDmgPct": "빔뎀%+",
	"dotDmgPct": "DoT뎀%+",
	"projDmgPct": "투사체뎀%+",
	"aoeRadiusPct": "범위반경+",
	"critRateMelee": "근접크리+",
	"critRateSpell": "마법크리+",
	"critRateBow": "석궁크리+",
	"meleeAtkSpd": "근접공속+",
	"bowAtkSpd": "석궁공속+",
	"castSpeed": "시전속도+",
	"elemPenAll": "전속성관통",
	"shieldBypass": "쉴드관통",
	"armorShred": "방어력깎기",
	"projSpeedPct": "투사체속도+",
	"onHitFireball": "적중시화구",
	"onHitChainL": "적중시연쇄뇌격",
	"onHitFreeze": "적중빙결%",
	"onHitStun": "적중스턴%",
	"onHitPoison": "적중중독%",
	"onHitBleed": "적중출혈%",
	"onHitWeaken": "적중약화%",
	"onHitSlow": "적중감속%",
	"onHitMark": "적중표적%",
	"onCritExplode": "크리폭발(HP%)",
	"onCritChain": "크리연쇄(HP%)",
	"onCritFreeze": "크리빙결%",
	"onCritHeal": "크리HP+",
	"onCritMana": "크리MP+",
	"onCritShield": "크리쉴드+",
	"onHitDefBoost": "피격방어+",
	"onHitThorns": "반격가시",
	"procIceNova": "빙결파동%",
	"procDarkShield": "자동암흑막",
	"procHealPulse": "주기치유",
	"procCorpseExplode": "시체폭발%",
	"onDodgeDmg": "회피뎀+",
	"onParryBurst": "패링폭발%",
	"kiSlashParry": "기검참3타패링",
	"kiSlashFullCrit": "기검참3단 확정치명·치명뎀",
	"maliceWeakAmp": "악의 약화 단당+",
	"rageSkCrit": "분노스킬 치명타율+",
	"rageSkDmg": "분노스킬 피해+",
	"onBlockHeal": "블록HP+",
	"onBlockMana": "블록MP+",
	"skWhirlDmg": "회전참뎀+",
	"skBeamDmg": "옴니빔뎀+",
	"skFireballDmg": "화구뎀+",
	"skMissileDmg": "미사일뎀+",
	"skBlueShotDmg": "청탄뎀+",
	"skBlastShotDmg": "폭렬탄뎀+",
	"skHellRayDmg": "지옥광선뎀+",
	"skMaliceStormDmg": "악의폭풍뎀+",
	"skChainSlashDmg": "연쇄참뎀+",
	"skGiantSlamDmg": "지옥강타 1 뎀+",
	"skGhostWalkDmg": "유령보행뎀+",
	"skMaliceMortarDmg": "악의박격뎀+",
	"skFireAuraDmg": "화염오라뎀+",
	"skIceOrbDmg": "빙구뎀+",
	"skFireBeamDmg": "화염빔뎀+",
	"skMaliceHuntDmg": "악의사냥뎀+",
	"skDarkPillarDmg": "암흑기둥뎀+",
	"skPlagueDmg": "역병뎀+",
	"skSpikeAuraDmg": "가시오라뎀+",
	"skChainAssaultDmg": "연쇄돌격뎀+",
	"dodgeChance": "회피확률+",
	"dodgeCooldown": "회피쿨-",
	"maxHPPctArmor": "HP%+",
	"shieldPct": "쉴드%+",
	"shieldRegenPct": "쉴드리젠%+",
	"shieldCdRed": "쉴드쿨-",
	"hpRegenFlat": "HP리젠+",
	"hpRegenPct": "HP리젠%+",
	"stRegenFlat": "ST리젠+",
	"stRegenPct": "ST리젠%+",
	"mpRegenFlat": "MP리젠+",
	"mpRegenPct": "MP리젠%+",
	"fireDR": "화염DR",
	"iceDR": "빙결DR",
	"lightDR": "뇌전DR",
	"darkDR": "암흑DR",
	"poisonDRdef": "독DR",
	"allDR": "전체DR",
	"eliteDR": "엘리트DR",
	"stunRes": "스턴저항",
	"freezeRes": "빙결저항",
	"slowRes": "감속저항",
	"knockbackRes": "넉백저항",
	"dashRange": "돌진거리+",
	"dashCooldown": "돌진쿨-",
	"movSpeedCombat": "전투이속+",
	"movSpeedOOC": "비전투이속+",
	"pickupRadius": "습득범위+",
	"strFlat": "STR+",
	"dexFlat": "DEX+",
	"intFlat": "INT+",
	"vitFlat": "VIT+",
	"allStat": "전스탯+",
	"maxSTPct": "ST%+",
	"resourceOnHit": "적중자원+",
	"fireResMax": "화염최대저항+",
	"iceResMax": "빙결최대저항+",
	"lightResMax": "뇌전최대저항+",
	"darkResMax": "암흑최대저항+",
	"poisonResMax": "독최대저항+",
	"skillCdRed": "스킬쿨-",
	"potionCdRed": "물약쿨-",
	"craftBonus": "강화성공+",
	"goldFind": "악의획득+",
	"expBonusRing": "경험치+",
	"dropRateAcc": "드롭률+",
	"demonDmg": "악마화뎀+",
	"demonDR": "악마화DR",
	"soulHarvest": "영혼수확+",
	"lifeLeechBr": "생명흡혈%",
	"overhealShield": "과치유→쉴드",
	"onFullManaDmg": "만마나뎀+",
	"whileMovingDR": "이동DR",
	"whileStationaryDmg": "정지뎀+",
	"afterDodgeDmg": "회피후뎀+",
	"afterParryShield": "패링쉴드+",
	"comboThreshold": "콤보보너스+",
	"abundDmg": "HP≥70%뎀+",
	"predDmg": "적HP≤30%뎀+",
	"fullLifeDmg": "HP100%뎀+",
	"lowLifeDmg": "HP≤35%뎀+",
	"overkilDmg": "적HP≤20%뎀+",
	"closeDmg": "근접뎀+",
	"farDmg": "원거리뎀+",
	"stunDmgUp": "스턴적뎀+",
	"frozenDmgUp": "빙결적뎀+",
	"burnDmgUp": "화상적뎀+",
	"poisonDmgUp": "중독적뎀+",
	"curseDmgUp": "저주적뎀+",
	"slowDmgUp": "감속적뎀+",
	"bossSlayer": "보스뎀+",
	"eliteSlayer": "엘리트뎀+",
	"mobSlayer": "일반몹뎀+",
	"firstStrike": "선제뎀+",
	"lifeLeech": "물리흡혈%",
	"manaLeech": "마나흡수%",
	"stLeech": "ST흡수%",
	"lifeOnHit": "적중HP+",
	"onKillHeal": "처치HP+",
	"onKillMana": "처치MP+",
	"onKillStam": "처치ST+",
	"onKillExplode": "처치시폭발",
	"onKillSpeed": "처치이속+",
	"healthyDef": "HP≥70%방어+",
	"injuredDR": "HP≤30%DR+",
	"injuredSpeed": "HP≤50%이속+",
	"dotDR": "DoT피해감소",
	"bossDR": "보스피해감소",
	"closeDR": "근접피해감소",
	"farDR": "원거리피해감소",
	"burnDR": "화상피해감소",
	"hpOnKill": "처치HP회복",
	"shieldOnKill": "처치쉴드회복",
	"stCostRed": "ST소비-",
	"healthyAtk": "HP≥70%공격+",
	"injuredDmg": "HP≤35%뎀+",
	"injuredLeech": "HP≤35%흡혈",
	"vsBossDmg": "보스추가뎀",
	"vsEliteDmg": "엘리트추가뎀",
	"sharpAtk": "공격력+",
	"brutalAtk": "공격력+",
	"ruinAtk": "공격력+",
	"rageMaxFlat": "분노최대치+",
	"rageDmg": "분노뎀%+",
	"critDmgA": "크리뎀+",
	"critDmgB": "크리뎀+",
	"pierceFlat": "관통력+",
	"ancDmg": "전대 공격력+",
	"ancHP": "전대 최대HP+",
	"ancDur": "구 전대 지속→최대HP+"
}

# AFFIX_POOL is supplied from the existing readonly JSON by the caller. Keep its
# reference and search in source order: duplicate IDs must not become last-wins.
var _pool: Variant
var _translate: Callable
var _localize: Callable
var _coerce := Coerce.new()

func _init(affix_pool: Variant = null, translate: Callable = Callable(), localize: Callable = Callable()) -> void:
	_pool = affix_pool
	_translate = translate
	_localize = localize


func rarity_view(index: Variant) -> Dictionary:
	if not (index is int or index is float) or not is_finite(float(index)) \
			or index != floor(float(index)) or index < 0 or index >= RARITY_N.size():
		return _fail("rarity_index_outside_0_5")
	var i := int(index)
	var label: Dictionary = _text(_localize, [RARITY_N[i], RARITY_N_EN[i]], "localize")
	if not label.ready:
		return label
	var result := {"status": READY, "ready": true, "name": label.value,
		"color": RARITY_C[i], "multiplier": RARITY_MUL[i], "code_present": i < RARITY.size()}
	if i < RARITY.size():
		result["code"] = RARITY[i]
	return result


func detail_value(af: Variant) -> Dictionary:
	if not af is Dictionary:
		return _fail("affix_not_dictionary")
	# Source detail lookup precedes its numeric check and compact fallback.
	var definition: Dictionary = _definition(af.get("id"))
	if not definition.ready:
		return definition
	var value: Variant = af.get("value")
	if definition.found and definition.entry.get("unit") in ["pct", "prob"] \
			and (value is int or value is float) and is_finite(float(value)):
		if not _scalar_supported(value):
			return _fail("native_integer_outside_js_safe_range")
		var percent: float = _js_round(float(value) * 10000.0) / 100.0
		var text: Dictionary = _scalar_text(percent)
		if not text.ready:
			return text
		return _ok(("+" if percent > 0.0 else "") + text.value + "%")
	return compact_value(af)


func compact_value(af: Variant) -> Dictionary:
	if not af is Dictionary:
		return _fail("affix_not_dictionary")
	var value: Variant = af.get("value")
	if value == null:
		return _ok("")
	var definition: Dictionary = _definition(af.get("id"))
	if not definition.ready:
		return definition
	if not _scalar_supported(value):
		return _fail("unsupported_affix_value_shape")
	if not definition.found:
		return _scalar_text(value)
	var unit: Variant = definition.entry.get("unit")
	if unit in ["pct", "prob"]:
		var number: float = _coerce.js_to_number(value, true)
		return _ok(("+" if number > 0.0 else "") + str(_int32(number * 100.0)) + "%")
	if unit == "dps":
		var raw: Dictionary = _scalar_text(value)
		return _ok(raw.value + "/s") if raw.ready else raw
	if unit == "tick":
		var fixed: Dictionary = _fixed_2(_coerce.js_to_number(value, true) / 60.0)
		if not fixed.ready:
			return fixed
		var suffix: Dictionary = _text(_localize, ["초", "s"], "localize")
		return _ok(fixed.value + suffix.value) if suffix.ready else suffix
	if unit == "atk":
		return _ok("ATK×" + str(_int32(_coerce.js_to_number(value, true) * 100.0)) + "%")
	if unit == "hp":
		return _ok(str(_int32(_coerce.js_to_number(value, true) * 100.0)) + "%HP")
	var raw: Dictionary = _scalar_text(value)
	if not raw.ready:
		return raw
	return _ok(("+" if _coerce.js_to_number(value, true) > 0.0 else "") + raw.value)


func item_name(item: Variant) -> Dictionary:
	if not item is Dictionary:
		return _fail("item_not_dictionary")
	var base: Dictionary = _text(_translate, [item.get("name")], "translate")
	if not base.ready:
		return base
	var name: String = base.value
	var affixes: Variant = item.get("affixes")
	if Coerce.js_truthy(affixes):
		if not affixes is Array:
			return _fail("truthy_affixes_not_array")
		if not affixes.is_empty():
			var prefix: Dictionary = _first_affix(affixes, 0)
			if not prefix.ready:
				return prefix
			if prefix.found:
				var text: Dictionary = _text(_translate, [AFFIX_NAMES_KO.get(prefix.id, "")], "translate")
				if not text.ready:
					return text
				name = text.value + " " + name
			# Search again from the beginning, exactly like the separate JS .find.
			var current_affixes: Variant = item.get("affixes")
			if not current_affixes is Array:
				return _fail("suffix_affixes_not_array")
			var suffix: Dictionary = _first_affix(current_affixes, 1)
			if not suffix.ready:
				return suffix
			if suffix.found:
				var text: Dictionary = _text(_translate, [AFFIX_NAMES_KO.get(suffix.id, "")], "translate")
				if not text.ready:
					return text
				name += " [" + text.value + "]"
	# An empty Array is truthy in JS: it must not enable legacy names.
	for key in ["prefix", "suffix"]:
		var legacy: Variant = item.get(key)
		if not Coerce.js_truthy(legacy) or Coerce.js_truthy(item.get("affixes")):
			continue
		if not legacy is Dictionary:
			return _fail("legacy_" + key + "_not_dictionary")
		var text: Dictionary = _text(_translate, [legacy.get("name")], "translate")
		if not text.ready:
			return text
		name = text.value + " " + name if key == "prefix" else name + " [" + text.value + "]"
	return _ok(name)


func affix_view(af: Variant, detailed: bool = true) -> Dictionary:
	if not af is Dictionary or not af.get("id") is String:
		return _fail("affix_view_requires_string_id")
	var definition: Dictionary = _definition(af.id)
	if not definition.ready:
		return definition
	var type: Variant = definition.entry.get("type") if definition.found else null
	var color: String = "#66ddff" if definition.found and type == 0 else "#ffcc44"
	var label: Dictionary = _text(_translate, [AFFIX_NAMES_KO.get(af.id, af.id)], "translate")
	if not label.ready:
		return label
	var description: Dictionary = _text(_translate, [_AFFIX_DESC.get(af.id, "")], "translate")
	if not description.ready:
		return description
	var value: Dictionary = detail_value(af) if detailed else compact_value(af)
	if not value.ready:
		return value
	return {"status": READY, "ready": true, "name": label.value, "description": description.value,
		"value_text": value.value, "color": color, "definition_present": definition.found}


func _definition(id: Variant) -> Dictionary:
	if not _pool is Array:
		return _fail("source_affix_pool_not_array")
	for entry: Variant in _pool:
		if not entry is Dictionary:
			return _fail("source_affix_pool_entry_not_dictionary")
		if entry.get("id") == id:
			return {"ready": true, "found": true, "entry": entry}
	return {"ready": true, "found": false}


func _first_affix(affixes: Array, type: int) -> Dictionary:
	for af: Variant in affixes:
		if not af is Dictionary:
			return _fail("item_affix_not_dictionary")
		var definition: Dictionary = _definition(af.get("id"))
		if not definition.ready:
			return definition
		if definition.found and definition.entry.get("type") == type:
			return {"ready": true, "found": true, "id": af.get("id")}
	return {"ready": true, "found": false}


func _text(callback: Callable, args: Array, kind: String) -> Dictionary:
	if not callback.is_valid():
		return _fail(kind + "_callback_missing")
	for arg: Variant in args:
		if not arg is String:
			return _fail(kind + "_argument_not_string")
	var value: Variant = callback.callv(args)
	if not value is String:
		return _fail(kind + "_callback_non_string")
	return _ok(value)


func _scalar_supported(value: Variant) -> bool:
	if value is int:
		return value >= -9007199254740991 and value <= 9007199254740991
	return value == null or value is String or value is bool or value is float


func _scalar_text(value: Variant) -> Dictionary:
	if value == null:
		return _ok("null")
	if value is String:
		return _ok(value)
	if value is bool:
		return _ok("true" if value else "false")
	if not (value is int or value is float) or not _scalar_supported(value):
		return _fail("unsupported_scalar_text")
	var number := float(value)
	if is_nan(number):
		return _ok("NaN")
	if is_inf(number):
		return _ok("Infinity" if number > 0.0 else "-Infinity")
	if number == 0.0:
		return _ok("0")
	# Fast path for current four-decimal rolls, checked by roundtrip. Other
	# doubles use their exact decimal expansion and shortest roundtrip below.
	if absf(number) <= 1e12:
		if number == floor(number):
			return _ok(str(int(number)))
		var text := String.num(number, 4)
		if text.to_float() == number:
			return _ok(text)
	return _number_text(number)


func _js_round(value: float) -> float:
	if not is_finite(value):
		return value
	var lower: float = floor(value)
	return lower if value - lower < 0.5 else lower + 1.0


func _int32(value: float) -> int:
	if not is_finite(value) or value == 0.0:
		return 0
	var truncated: float = floor(value) if value > 0.0 else ceil(value)
	var modulo := fmod(truncated, 4294967296.0)
	if modulo < 0.0:
		modulo += 4294967296.0
	return int(modulo - 4294967296.0 if modulo >= 2147483648.0 else modulo)


func _fixed_2(value: float) -> Dictionary:
	if not is_finite(value):
		return _scalar_text(value)
	if absf(value) >= 1e21:
		return _scalar_text(value) # Number#toFixed uses Number#toString here.
	if absf(value) > 1e12:
		return _fixed_large(value)
	# Round the exact binary64 value *100, not the already-rounded double
	# product. This preserves JS toFixed(2) at binary/tie boundaries (1.125).
	var bytes := PackedFloat64Array([absf(value)]).to_byte_array()
	var bits: int = bytes.decode_u64(0)
	var exponent: int = int((bits >> 52) & 2047)
	var significand: int = bits & 4503599627370495
	var binary_exponent: int = -1022
	if exponent != 0:
		significand += 4503599627370496
		binary_exponent = exponent - 1023
	var product: int = significand * 25
	var shift: int = 50 - binary_exponent
	var cents: int = 0
	if shift < 63:
		cents = product >> shift
		if (product & ((1 << shift) - 1)) >= (1 << (shift - 1)):
			cents += 1
	var integer: int = cents / 100
	var fraction: int = cents % 100
	return _ok(("-" if value < 0.0 else "") + str(integer) + "." + ("0" if fraction < 10 else "") + str(fraction))


func _exact_decimal(value: float) -> Dictionary:
	# value is positive finite. M*2^e becomes an exact integer times 10^-scale.
	var bits: int = PackedFloat64Array([value]).to_byte_array().decode_u64(0)
	var exponent: int = int((bits >> 52) & 2047)
	var significand: int = bits & 4503599627370495
	var binary_exponent: int = -1074
	if exponent != 0:
		significand += 4503599627370496
		binary_exponent = exponent - 1023 - 52
	return _binary_decimal(significand, binary_exponent)


func _binary_decimal(significand: int, binary_exponent: int) -> Dictionary:
	var limbs: Array[int] = [significand % 1000000000, significand / 1000000000]
	if limbs[-1] == 0:
		limbs.pop_back()
	var factor: int = 2 if binary_exponent >= 0 else 5
	for step in range(absi(binary_exponent)):
		var carry: int = 0
		for i in range(limbs.size()):
			var product: int = limbs[i] * factor + carry
			limbs[i] = product % 1000000000
			carry = product / 1000000000
		if carry > 0:
			limbs.append(carry)
	var digits := str(limbs[-1])
	for i in range(limbs.size() - 2, -1, -1):
		var chunk := str(limbs[i])
		digits += "0".repeat(9 - chunk.length()) + chunk
	var scale: int = maxi(0, -binary_exponent)
	while digits.ends_with("0"):
		digits = digits.left(-1)
		scale -= 1
	return {"digits": digits, "scale": scale}


func _number_text(value: float) -> Dictionary:
	var exact: Dictionary = _exact_decimal(absf(value))
	var digits: String = exact.digits
	var scientific_exponent: int = digits.length() - exact.scale - 1
	var interval: Dictionary = _rounding_interval(absf(value))
	# At most 17 significant decimal digits suffice to roundtrip binary64.
	for count in range(1, 18):
		var prefix: String = digits.left(count)
		if prefix.length() < count:
			prefix += "0".repeat(count - prefix.length())
		var lower: int = prefix.to_int()
		var round_up := false
		if digits.length() > count:
			var next_digit: int = digits.unicode_at(count) - 48
			round_up = next_digit > 5 or (next_digit == 5 and (lower % 2 != 0 or digits.substr(count + 1).replace("0", "") != ""))
		var candidates: Array[int] = [lower, lower + 1]
		if round_up:
			candidates.reverse()
		var exponent: int = scientific_exponent - count + 1
		for candidate in candidates:
			if _inside_interval({"digits": str(candidate), "scale": -exponent}, interval):
				return _ok(("-" if value < 0.0 else "") + _decimal_text(candidate, exponent))
	return _fail("binary64_number_text_roundtrip_unresolved")


func _rounding_interval(value: float) -> Dictionary:
	# Compare exact decimal candidates to binary rounding midpoints instead of
	# parsing them with String.to_float (which underflows the smallest doubles).
	var bits: int = PackedFloat64Array([value]).to_byte_array().decode_u64(0)
	var exponent: int = int((bits >> 52) & 2047)
	var m: int = bits & 4503599627370495
	var e: int = -1074
	if exponent != 0:
		m += 4503599627370496
		e = exponent - 1023 - 52
	var lower: Dictionary = _binary_decimal(m * 2 - 1, e - 1)
	if exponent > 1 and m == 4503599627370496:
		lower = _binary_decimal(m * 4 - 1, e - 2)
	return {"lower": lower, "upper": _binary_decimal(m * 2 + 1, e - 1), "closed": m % 2 == 0}


func _inside_interval(candidate: Dictionary, interval: Dictionary) -> bool:
	var lower: int = _compare_decimal(candidate, interval.lower)
	var upper: int = _compare_decimal(candidate, interval.upper)
	return (lower > 0 or (lower == 0 and interval.closed)) \
		and (upper < 0 or (upper == 0 and interval.closed))


func _compare_decimal(a: Dictionary, b: Dictionary) -> int:
	var left: String = a.digits
	var right: String = b.digits
	var lp: int = left.length() - a.scale
	var rp: int = right.length() - b.scale
	if lp != rp:
		return -1 if lp < rp else 1
	var width: int = maxi(left.length(), right.length())
	left += "0".repeat(width - left.length())
	right += "0".repeat(width - right.length())
	return 0 if left == right else (-1 if left < right else 1)


func _decimal_text(coefficient: int, exponent: int) -> String:
	var digits := str(coefficient)
	while digits.ends_with("0"):
		digits = digits.left(-1)
		exponent += 1
	var point: int = digits.length() + exponent
	if point >= digits.length() and point <= 21:
		return digits + "0".repeat(point - digits.length())
	if point > 0 and point <= 21:
		return digits.left(point) + "." + digits.substr(point)
	if point > -6 and point <= 0:
		return "0." + "0".repeat(-point) + digits
	return digits[0] + ("." + digits.substr(1) if digits.length() > 1 else "") \
		+ "e" + ("+" if point - 1 >= 0 else "") + str(point - 1)


func _fixed_large(value: float) -> Dictionary:
	var exact: Dictionary = _exact_decimal(absf(value))
	var digits: String = exact.digits
	var point: int = digits.length() - exact.scale + 2
	var cents: String
	if point >= digits.length():
		cents = digits + "0".repeat(point - digits.length())
	else:
		# This path is >1e12: the integer prefix always exists and fits 23 digits.
		cents = digits.left(point)
		if digits.unicode_at(point) >= 53: # exact halfway rounds upward for toFixed
			var carry := 1
			for i in range(cents.length() - 1, -1, -1):
				var digit: int = cents.unicode_at(i) - 48 + carry
				cents[i] = str(digit % 10)
				carry = digit / 10
				if carry == 0:
					break
			if carry > 0:
				cents = "1" + cents
	return _ok(("-" if value < 0.0 else "") + cents.left(-2) + "." + cents.right(2))


func _ok(value: String) -> Dictionary:
	return {"status": READY, "ready": true, "value": value}


func _fail(reason: String) -> Dictionary:
	return {"status": NOT_READY, "ready": false, "reason": reason}
