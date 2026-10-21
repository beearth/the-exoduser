extends RefCounted
## SK-S02: source registry snapshots only. No live P/G, cast, UI, input or save.
## Source main pin is newer than the dependency branch; source bytes match.
## Fusion membership/explicit star ownership remains FUSION's existing constants.
const FUSION = preload("res://port_modules/fusion_star_source/producer.gd")
const SOURCE_PIN := "284d7faf49295b2f5061937a47ce96038032ed3c"
const SOURCE_SHA256 := preload("res://source_snapshot/snapshot.gd").SHA256

## game.html:44082-44092 SKILL_CATS
const CATEGORIES := [
	{"id":"move","name":"⚡ 이동스킬","nameEn":"⚡ Movement","col":"#44aaff"},
	{"id":"phys","name":"⚔️ 물리/근접","nameEn":"⚔️ Physical/Melee","col":"#ff8844"},
	{"id":"def","name":"🛡️ 방어","nameEn":"🛡️ Defense","col":"#44aa88"},
	{"id":"magic","name":"🔮 마법","nameEn":"🔮 Magic","col":"#aa66ff"},
	{"id":"bow","name":"🏹 석궁/관통","nameEn":"🏹 Crossbow/Pierce","col":"#ff4466"},
	{"id":"tech","name":"⚙️ 영역","nameEn":"⚙️ Domain","col":"#ff8800"},
	{"id":"rage","name":"🔥 분노","nameEn":"🔥 Rage","col":"#ff6633"},
	{"id":"summon","name":"🕯 소환","nameEn":"🕯 Summon","col":"#9b72d8"},
	{"id":"ult","name":"💀 필살기","nameEn":"💀 Ultimate","col":"#ff2200"},
]

## game.html:44094-44110 SKILL_REC_PATH
const RECOMMENDATIONS := [
	{"phase":"1. 악의기둥+가시덫","phaseEn":"1. Dark Pillar+Spike Trap","skills":["darkPillar","spikeTrap"],"fuse":"pillarSpike","desc":"악의기둥 + 가시덫 → 합체: 기둥가시","descEn":"Dark Pillar + Spike Trap → Fuse: Pillar Spike"},
	{"phase":"2. 해골무덤+악의폭풍","phaseEn":"2. Bone Wall+Malice Storm","skills":["boneWall","maliceStorm"],"fuse":"boneStorm","desc":"해골무덤 + 악의폭풍 → 합체: 해골번개","descEn":"Bone Wall + Malice Storm → Fuse: Bone Lightning"},
	{"phase":"3. 전격의창+아이스스톰","phaseEn":"3. Thunder Spear + Ice Storm","skills":["thunderStake","bladeDash","iceStorm"],"fuse":"thunderGhost","desc":"뇌전창+전격이동 → 전격의창. 아이스스톰으로 빙결존 설치 — 물과 전류가 만나면 강화되어 몬스터를 당겨온다. 나중에 물의 영역으로 확장","descEn":"Thunder Stake+Blade Dash → Thunder Spear. Ice Storm creates freeze zones — water meets lightning, empowered pull draws monsters in. Upgrade to Water Domain later"},
	{"phase":"4. 이동+사슬","phaseEn":"4. Movement+Chain","skills":["chargeBoost","magicBlink","chainAssault","chainSlam"],"fuse":"dimBreach","desc":"충돌+화염+사슬 확장 → 합체: 사슬기동 / 기동:전폭","descEn":"Impact+Flame+Chain Expand → Fuse: Chain Breach / Maneuver:Thunder"},
	{"phase":"5. 칼날+역병","phaseEn":"5. Blade+Plague","skills":["maliceHunt","guardian","plagueBurst"],"fuse":"bladeFuse","desc":"악의 사냥 + 보호자 + 폭독칼날 → 합체: 칼날 해방 / 독혈 해방","descEn":"Malice Hunt + Guardian + Plague Burst → Fuse: Blade Liberation / Plague Liberation"},
	{"phase":"6. 💀 필살기 선택","phaseEn":"6. 💀 Ultimate Pick","skills":["blackStar","lavaSummon","execution"],"fuse":null,"pick":true,"desc":"필살기 1개 선택! 블랙(몬스터 흡인) / 탄막블랙홀(탄막흡수+폭발) / 처형(보스킬)","descEn":"Pick 1 ultimate! Black Star(monster pull) / Bullet Black Hole(bullet absorb+blast) / Execution(boss kill)"},
	{"phase":"7. 멸살+만화+원소","phaseEn":"7. Beam+Barrage+Elem","skills":["omniBeam","fanShot","elemMissile"],"fuse":"elemFuse","desc":"멸살광선+만화방창+원소추적탄 → 합체: 추적빔","descEn":"Omni Beam+Barrage+Elem Missile → Fuse: Tracking Beam"},
	{"phase":"8. 허수아비 세트","phaseEn":"8. Scarecrow Set","skills":["voidScarecrow","explodeScarecrow"],"fuse":"dualScarecrow","desc":"유령 허수아비 + 폭발 허수아비 → 합체: 쌍허수아비 (어그로+폭발)","descEn":"Void Scarecrow + Explode Scarecrow → Fuse: Dual Scarecrow (aggro+explosion)"},
	{"phase":"9. 방패 합체","phaseEn":"9. Shield Fuse","skills":["maliceSwipe","shieldThrow"],"fuse":"shieldFuse","desc":"칼등치기 + 불꽃칼날 → 합체: 처내기 강화","descEn":"Blade Parry + Flame Blade → Fuse: Parry Enhanced"},
	{"phase":"10. 폭풍소환+얼음보주+뇌전걸음","phaseEn":"10. Storm+Ice+GhostWalk","skills":["maliceMortar","iceOrb","ghostWalk"],"fuse":"iceMortar","desc":"폭풍소환 + 얼음보주 + 뇌전걸음 → 합체: 얼음폭풍","descEn":"Malice Mortar + Ice Orb + Ghost Walk → Fuse: Ice Mortar"},
	{"phase":"11. 신성 영역","phaseEn":"11. Holy Domain","skills":["holyDome","holyPrison"],"fuse":"holyFuse","desc":"회복 + 구속 → 합체: 결계의 영역","descEn":"Recovery + Prison → Fuse: Ward Domain"},
	{"phase":"12. 6단합체: 폭풍빔","phaseEn":"12. 6-Fuse: Storm Beam","skills":["whirlwind","detonate","giantSlam","fanShot","omniBeam","elemMissile"],"fuse":"stormBeam","desc":"지진폭풍+추적암전 → 6단합체: 폭풍빔","descEn":"Slam Storm → 6-Fuse: Storm Beam"},
	{"phase":"13. 신성+빙결","phaseEn":"13. Holy+Ice","skills":["iceStorm"],"fuse":"holyIce","desc":"아이스스톰 추가 → 합체: 신성빙결","descEn":"Ice Storm → Fuse: Holy Ice"},
	{"phase":"14. 지옥강타 2","phaseEn":"14. Hell Slam II","skills":["giantSlam2"],"fuse":null,"desc":"지옥강타 2 습득 — 기둥강타/용암형 강화용","descEn":"Learn Hell Slam II for Pillar Slam and its lava upgrade"},
	{"phase":"15. 사슬 최종","phaseEn":"15. Chain Final","skills":["chainSlash"],"fuse":"dimRush","desc":"기동칼날개 추가 → 5단합체: 기동:칼날개","descEn":"Chain Bladewing → 5-Fuse: Maneuver:Bladewing"},
]

## game.html:44111-44116 SKILL_HIER
const HIERARCHY := [
	{"id":"rec","name":"⭐ 추천","nameEn":"⭐ Recommend","col":"#ffcc44","cats":null},
	{"id":"atk","name":"⚔ 공격","nameEn":"⚔ Attack","col":"#ff6644","cats":["phys","magic","bow"]},
	{"id":"def","name":"🛡 방어","nameEn":"🛡 Defense","col":"#44aa88","cats":["def","move","summon"]},
	{"id":"spec","name":"⚙ 특수","nameEn":"⚙ Special","col":"#ff8800","cats":["tech","rage","ult"]},
]

## game.html:44118-44118 SKILL_ICONS
const ICONS := {
	"ghostWalk":1,
	"maliceHunt":1,
	"venomBlade":1,
	"maliceMortar":1,
	"boneWall":1,
	"plagueBurst":1,
	"maliceStorm":1,
	"darkPillar":1,
	"holyDome":1,
	"holyPrison":1,
	"iceStorm":1,
	"giantSlam":1,
	"giantSlam2":1,
	"skyCrusher":1,
	"blackStar":1,
	"lavaSummon":1,
	"kiSlash":1,
	"maliceSwipe":1,
	"whirlwind":1,
	"bladeShot":1,
	"fireball":1,
	"iceOrb":1,
	"detonate":1,
	"charge":"chargeBoost",
	"chargeBoost":1,
	"dimBreach":"chargeBoost",
	"dimSlam":"chargeBoost",
	"dimThunder":"chargeBoost",
	"dimBlast":"chargeBoost",
	"dimRush":"chargeBoost",
	"bladeDash":1,
	"fanShot":1,
	"omniBeam":1,
	"elemMissile":1,
	"shieldThrow":1,
	"execution":1,
	"spikeTrap":1,
	"chainSlam":"chainSlash",
	"chainAssault":"chainSlash",
	"chainSlash":1,
	"magicBlink":1,
	"fireAura":1,
	"fireBeam":1,
	"needleShot":1,
	"burstLoop":1,
	"peaceShield":1,
	"parry":"peaceShield",
	"ghostXbowTurret":1,
	"voidScarecrow":1,
	"blueShot":1,
	"hellRay":1,
	"energyShot":1,
	"guardian":1,
	"weakMag":1,
	"weakPhys":1,
	"weakPj":1,
	"weakRev":1,
	"thunderStake":1,
	"timeWarp":1,
	"explodeScarecrow":1,
	"arcLaser":1,
	"maliceDome":1,
	"ltnChaser":1,
	"iceMortar":"iceStorm",
	"dualScarecrow":"voidScarecrow",
	"holyFuse":"holyDome",
	"shieldFuse":"shieldThrow",
	"plagueFuse":"maliceHunt",
	"plagueVenom":"maliceHunt",
	"bladeFuse":"maliceHunt",
	"pillarSpike":"darkPillar",
	"infernoSlam":"giantSlam2",
	"pillarSlam":"giantSlam2",
	"holyWeak1":"holyDome",
	"holyWeak2":"holyDome",
	"holyWeak3":"holyDome",
	"holyWeak4":"holyDome",
	"holyIce":"holyDome",
	"siegeGhost":"ghostXbowTurret",
	"thunderGhost":"bladeDash",
	"timeStep":"timeWarp",
	"boneStorm":1,
	"elecRepent":1,
	"ancestorSummon":1,
}

## game.html:44161-44224 SKILL_LIST
const SKILLS := [
	{"id":"chargeBoost","name":"사슬기동:충돌","cat":"move","desc":"STR 스케일. 3회 충전 + Lv3마다 사거리 1단계↑(최대4단). 이동 중 무적, 통과 적에 데미지+그로기 (쿨 5초)","descEn":"STR scale. 3 stocks + range tier up every Lv3 (max 4). Invincible while moving, DMG+groggy on pass-through (CD 5s)","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"magicBlink","name":"사슬기동:화염","cat":"move","desc":"INT 스케일. 이동 경로에 화염길 생성(3초 DOT). 통과 적 화상. MP 소모. 합체 시 착지 폭발","descEn":"INT scale. Fire trail on dash path (3s DOT). Burns passed enemies. MP cost. Fuse: landing explosion","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"ghostWalk","name":"뇌전걸음","cat":"def","act":true,"emoji":"⚡","desc":"5초간 유령화 — 무적+이동. 통과한 적/탄막 수만큼 종료 시 암전 폭발(+10%/회) + 전기줄기 방사(3회 체인). 카운트 캡=Lv×5(최대50). 쿨 20초. Lv당 뎀+15% 범위+10","descEn":"5s ghost form — invincible+move. Blackout explosion on end (+10%/enemy passed) + lightning arc (3 chains). Count cap=Lv×5 (max 50). CD 20s. Per Lv DMG+15% range+10","spCost":10,"matCost":100,"cd":1200,"up":true,"upSp":5,"upMat":0},
	{"id":"bladeDash","name":"전격이동","cat":"move","desc":"[이동기] 방향키 더블탭으로 발동. 경직/기절 중에도 탈출 가능. 250유닛 순간이동, 무적(15프레임). MP[(10+(Lv-1)×5)×0.7] + 공용 기동게이지 0.7칸(31.5)을 소모한다. 기본 기동게이지 5칸, Shift 사슬과 공유. 착지 시 전류장판(10초+Lv×0.5초): INT 틱뎀 + 방어력↓(1렙10%, 렙당+5%, 캡50%)","descEn":"[Mobility] Double-tap to activate. Escapes stagger/stun. 250-unit blink, invincible 15f. Costs MP[(10+(Lv-1)×5)×0.7] plus 0.7 shared mobility-gauge cells (31.5). Base gauge has 5 cells and is shared with Shift chain. Landing shock field(10s+Lv×0.5s): INT tick DMG + DEF↓(Lv1=10%, +5%/Lv, cap 50%)","spCost":10,"matCost":60,"up":true,"upSp":6,"upMat":0},
	{"id":"kiSlash","name":"기검참","cat":"phys","desc":"좌클 스킬: 3단 검기. 3타를 홀드해 2초에 걸쳐 최대 3단 충전(약 0.67초당 1단). 검기 피해 2/4/8배, 놓으면 발사. ST 10+Lv당2. 거리+15px/Lv","descEn":"LMB skill: 3-hit ki blade. Hold the third hit to charge up to stage 3 over 2 seconds (one stage every ~0.67s). Blade damage ×2/×4/×8; release to fire. ST 10+2/Lv; +15px range/Lv","spCost":10,"matCost":0,"up":true,"upSp":5,"upMat":0,"default":true},
	{"id":"fireball","name":"악의구","cat":"magic","desc":"[기본: E] 어둠 마법 오브 발사. 범위폭발. 넉백 0.5%. Lv당 크기+50% (뎀은 _skMul 계수 적용). 맞은 적에게 악의 약화 — 다음 악의구 피해 +30%씩 누적(최대 +120%), 3초간 안 맞으면 해제","descEn":"[Default: E] Dark magic orb fired. AoE explosion. Knockback 0.5%. Per Lv size+50% (DMG uses _skMul). Hits apply Malice Weakness — next orb DMG +30% per stack (max +120%), resets after 3s without a hit","spCost":10,"matCost":0,"up":true,"upSp":5,"upMat":0,"default":true},
	{"id":"whirlwind","name":"회전참","cat":"phys","desc":"무기 홀드 → 전진 회전 공격. 360도 광역, ST 지속소모. Lv당 범위+5 뎀+5%","descEn":"Hold weapon → forward spin attack. 360° AoE, continuous ST drain. Per Lv range+5 DMG+5%","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"detonate","name":"기폭팔","cat":"def","desc":"패링 3초 홀드 → 흡수 데미지 광역 폭발. Lv당 범위+15 (1렙150, 10렙285)","descEn":"Parry 3s hold → absorbed DMG AoE explosion. Per Lv range+15 (Lv1: 150, Lv10: 285)","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"maliceSwipe","name":"칼등 처내기","cat":"def","desc":"기본 E 불꽃칼날. E 홀드 충전: 풀차지 1.5초. 스킬 Lv당 범위 +5%.","descEn":"Base E Flame Blade. Hold E to charge fully in 1.5s. +5% range per skill level.","spCost":10,"matCost":80,"up":true,"upSp":5,"upMat":0},
	{"id":"fanShot","name":"만화방창","cat":"bow","desc":"[고정: T 자동] 물리 바늘 3방향 3발 발사. 관통 없음","descEn":"[Fixed: T auto] 3 physical needles 3-way spread. No pierce","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"omniBeam","name":"멸살광선","cat":"magic","desc":"[고정: E] 1발 직선 레이저. +만화방창 → 만화광선(3발 꽈배기). +원소추적탄 → 추적암전(6발 유도)","descEn":"[Fixed: E] 1 straight laser. +Barrage → Omni Beam (3 spiral). +Elem Seeker → Homing Dark (6 homing)","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"elemMissile","name":"원소추적탄","cat":"bow","desc":"우클릭 탭 마법을 6원소 유도 미사일로 변경. 곡선 궤적으로 적을 추적. 레벨당 사거리+20 (뎀은 _skMul 계수 적용)","descEn":"Changes RMB-tap magic to 6-element homing missiles. Curved trajectory tracking enemies. Per Lv range+20 (DMG uses _skMul)","spCost":10,"matCost":80,"up":true,"upSp":5,"upMat":0},
	{"id":"guardian","name":"악의 보호자","cat":"summon","noDmg":true,"desc":"3초마다 악의 구체 생성(1렙 2개). 몸에 밀착하여 적 투사체를 자동 방어(파괴). 레벨당 구체+1","descEn":"Spawns malice orbs every 3s (Lv1: 2 orbs). Orbits body, auto-blocks (destroys) enemy projectiles. Per Lv orb+1","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"maliceHunt","name":"악의 사냥","cat":"bow","act":true,"emoji":"⚔","desc":"유도 물리 칼날 1발 (악의30+ST50). 관통률 800+Lv×20+장비. 지속뎀 5초. 쿨 15초","descEn":"1 homing physical blade (malice 30 + ST 50). Pierce 800+Lv×20+gear. DOT 5s. CD 15s","spCost":10,"matCost":100,"cd":300,"up":true,"upSp":5,"upMat":0},
	{"id":"venomBlade","name":"독사","cat":"bow","act":true,"emoji":"🐍","desc":"유도 독사 1+Lv발 (ST40). DEX+석궁 기반. 직타 최소, 독 DOT 위주. 관통 800+Lv×20+장비(91보장+9확률). 독 10초·스택당+50%·50스택캡. 쿨 15초","descEn":"Homing venom snake 1+Lv shots (ST40). DEX+bow base. Minimal direct DMG, Poison DOT. Pierce 800+Lv×20+gear (91gtd+9rng). Poison 10s, +50%/stk, 50stk cap. CD 15s","spCost":10,"matCost":0,"cd":900,"up":true,"upSp":5,"upMat":0},
	{"id":"ltnChaser","name":"뇌전추격자","cat":"bow","act":true,"emoji":"⚡","desc":"전기 칼날 1+Lv발 발사 (ST40). DEX 기반. 유도+관통. 관통 시 체인라이트닝 발생. 쿨 12초. Lv당 뎀+12% 칼날+1 체인+1","descEn":"Lightning blade 1+Lv shots (ST40). DEX base. Homing+pierce. Chain lightning on pierce. CD 12s. Per Lv DMG+12% blade+1 chain+1","spCost":10,"matCost":80,"cd":720,"up":true,"upSp":5,"upMat":0},
	{"id":"maliceMortar","name":"폭풍소환","cat":"magic","act":true,"emoji":"🌪️","desc":"어둠 소용돌이 소환 (마우스 조준 설치, MP 소모, 쿨 11초, INT 스케일링, 1렙 400범위 +18/렙, 6.5초 지속, 적 흡인)","descEn":"Summon dark vortex (mouse-aim placement, MP cost, CD 11s, INT scale, Lv1 range 400 +18/Lv, 6.5s duration, pulls enemies)","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"boneWall","name":"해골무덤","cat":"magic","act":true,"emoji":"🦴","desc":"스킬 키로 마우스 위치에 즉시 소환 (최대 1000px, 패드: 조준 후 확정). 2스택 (25초/1충전, Lv10→3스택). 원형 해골벽이 적/투사체 차단. 솟을 때 데미지. 악의 12. 반경 280px+12.6px/Lv, 지속 3초+0.2초/Lv (최대 30초)","descEn":"Press skill key to summon at cursor (max 1000px; gamepad: aim and confirm). 2 stocks (25s/charge, Lv10: 3). Circular bone wall blocks enemies/projectiles. DMG on rise. Malice 12. Radius 280px +12.6px/level; duration 3s +0.2s/level (max 30s).","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"blackStar","name":"블랙","cat":"ult","act":true,"ult":true,"noDmg":true,"emoji":"⛧","desc":"검은 오망성 소환. 7초(+Lv당0.5초) 강력 흡인 (데미지 없음, 순수 유틸). 범위 1500+Lv×100px. 흡인력 기본5+Lv당0.5. (MP 30%, 쿨 120초)","descEn":"Summon black pentagram. 7s (+0.5s/Lv) strong pull (no DMG, pure utility). Range 1500+Lv×100px. Pull force base 5+0.5/Lv. (MP 30%, CD 120s)","spCost":10,"matCost":100,"cd":7200,"up":true,"upSp":5,"upMat":0},
	{"id":"lavaSummon","name":"탄막블랙홀","cat":"ult","act":true,"ult":true,"emoji":"🕳","desc":"작은 탄막블랙홀을 즉시 설치해 5초 동안 넓은 흡수장(1000~1475px) 안의 적 탄막을 제거한 뒤 흡수량 비례 범위폭발(900~1470px). 기본 ATK×8(Lv당×10 성장), 탄막 1발당 뎀+3%(최대+300%)+흡수 탄막 피해 저장(기본 피해의 최대 100%), 스턴, 거리감쇠 30%. (MP 30%, 쿨 120초)","descEn":"Instantly deploy a small Bullet Black Hole. For 5s it clears hostile bullets in a wide 1000-1475px field, then detonates in a 900-1470px area based on absorbed bullets. Base ATK×8(×10 by Lv), +3% DMG per bullet(max +300%) plus stored bullet damage capped at 100% base damage, stun, 30% falloff. (MP 30%, CD 120s)","spCost":10,"matCost":100,"cd":7200,"up":true,"upSp":5,"upMat":0},
	{"id":"execution","name":"처형","cat":"ult","act":true,"ult":true,"emoji":"⚔","desc":"X키: 그로기 보스 전용. 보스 현재HP 20%(+2%/Lv) + 무기뎀×30(+21%/Lv, 20Lv=150배) + 보스HP 30% 순수뎀. 섬광 돌진 연출. HP/MP/ST 10% 소모. 쿨 5초","descEn":"X key: Groggy boss only. Boss current HP 20%(+2%/Lv) + weapon DMG×30(+21%/Lv, Lv20=150×) + boss HP 30% pure DMG. Flash dash. HP/MP/ST 10% cost. CD 5s","spCost":10,"matCost":100,"cd":300,"up":true,"upSp":5,"upMat":0},
	{"id":"iceOrb","name":"얼음보주","cat":"def","act":true,"emoji":"❄","desc":"얼음 속에 들어가 무적 상태. 다시 누르면 파쇄 → 얼음칼날 8발 부채꼴 방사 (MP 40, 쿨 20초). Lv당 칼날+4 뎀+15%","descEn":"Enter ice — invincible. Re-press to shatter → 8 ice blades fan spread (MP 40, CD 20s). Per Lv blades+4 DMG+15%","spCost":10,"matCost":100,"cd":1200,"up":true,"upSp":5,"upMat":0},
	{"id":"needleShot","name":"만화방창 II","cat":"bow","act":true,"emoji":"✨","desc":"[고정: T 자동] 초고속 바늘 연발. 1렙 2발, 5렙마다 +1발. 관통 없음. ST 8. 쿨 1.5초. Lv당 뎀+100%","descEn":"[Fixed: T auto] Ultra-fast needles burst. Lv1 2 shots, +1 per 5 levels. No pierce. ST 8. CD 1.5s","spCost":10,"matCost":80,"cd":90,"up":true,"upSp":5,"upMat":0},
	{"id":"arcLaser","name":"얼음송곳","cat":"magic","emoji":"❄","desc":"E홀드: 직선 관통 냉기빔 채널링. MP 8+Lv/초 지속소모. 폭160+(Lv×10)px, 사거리1200+Lv×80. 관통+감속. Lv당 뎀+21%","descEn":"E hold: Straight piercing ice beam channeling. MP 8+Lv/s drain. Width 160+(Lv×10)px, range 1200+Lv×80. Pierce+slow. Per Lv DMG+21%","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"fireBeam","name":"업화선","cat":"bow","emoji":"🔥","desc":"우클릭: 최대 5초 차징, 재입력 시 발사. 직선 관통+폭발+화상. MP ⌊50×(1+(Lv-1)×0.12)⌋. CD = 1 / (시전속도 배율) 초.","descEn":"RMB: charge up to 5s; press again to fire. Straight piercing shot + explosion + burn. MP ⌊50×(1+(Lv-1)×0.12)⌋. CD = 1 / (cast speed multiplier) s.","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"maliceDome","name":"신의영역","cat":"def","act":true,"noDmg":true,"emoji":"✟","desc":"현재 위치에 신성 보호돔 설치 (8초+Lv당0.5초). 돔 안: 적 접근 불가+탄막 무효화. 보스 무시. MP 60. 쿨 25초. Lv당 범위+15","descEn":"Place divine dome at current pos (8s+0.5s/Lv). Inside: block enemy entry + nullify projectiles. Boss ignores. MP 60. CD 25s. Per Lv range+15","spCost":10,"matCost":100,"cd":1500,"up":true,"upSp":5,"upMat":0},
	{"id":"fireAura","name":"지옥진","cat":"magic","emoji":"🌋","desc":"우클릭: 10초간 대지 진동. 범위 내 용암 기둥이 순차적으로 솟아올라 화상+틱 데미지. MP 100. 쿨 12초. Lv당 범위+10% 뎀+12%","descEn":"RMB: 10s ground tremor. Lava pillars rise sequentially in range — burn+tick DMG. MP 100. CD 12s. Per Lv range+10% DMG+12%","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"plagueBurst","name":"폭독칼날","cat":"bow","act":true,"emoji":"🩸","desc":"독혈 칼날 1발 발사: 관통률 기본 800+Lv×20 + 장비 bowPierce×300/패시브 pPierce×30 반영, +100 보정. 전염+마지막 적 처형. 감염 사망 시 폭발+연쇄 전염. 악의 15. 사거리 4000. 쿨 15초(Lv당-0.5초)","descEn":"Fire 1 poison-blood blade: base pierce rate 800+Lv×20 with bowPierce×300 and pPierce×30 scaling, plus +100 bonus. Plague+execute last enemy. Infected death → explosion+chain plague. Malice 15. Range 4000. CD 15s (-0.5s/Lv)","spCost":10,"matCost":80,"cd":1200,"up":true,"upSp":5,"upMat":0},
	{"id":"maliceStorm","name":"악의폭풍","cat":"magic","act":true,"emoji":"🌀","desc":"마우스 조준 설치. 쿨 20초. 화면 내 클릭 위치에 암전나선 (10초 지속, 18f마다 틱뎀, INT/_skMul 스케일). Lv당 범위+22. 같은 지역 중복 불가","descEn":"Mouse-aim placement. CD 20s. Dark spiral at click pos (10s duration, tick every 18f, INT/_skMul scale). Per Lv range+22. No stacking same area","spCost":10,"matCost":90,"up":true,"upSp":5,"upMat":0},
	{"id":"darkPillar","name":"악의기둥","cat":"magic","act":true,"emoji":"🏛️","desc":"현재 위치에 9개 기둥 순차 발동. 10초간 악의 기둥을 소환하여 반경 내 적에게 지속 암전 데미지+감속. 범위 250+(Lv-1)×22. 지옥강타 2와 합체→기둥강타. 쿨 15초","descEn":"9 pillars activate sequentially at current pos. 10s dark pillars deal sustained dark DMG+slow to enemies in radius. Range 250+(Lv-1)×22. Fuses with Hell Slam II → Pillar Strike. CD 15s","spCost":10,"matCost":100,"cd":900,"up":true,"upSp":5,"upMat":0},
	{"id":"holyDome","name":"회복의 영역","cat":"tech","act":true,"noDmg":true,"emoji":"🛡","desc":"현재 위치에 회복의 영역 설치 (12초 지속). 땅 위: HP/MP/ST 초당+10 리젠 + 회복력 2배 + 쿨다운 속도 2배. 쿨 30초. Lv당 범위+20 지속+0.5초","descEn":"Place holy domain at current pos (12s duration). On ground: HP/MP/ST +10/s regen + 2x recovery + 2x CD speed. CD 30s. Per Lv range+20 duration+0.5s","spCost":10,"matCost":90,"cd":1800,"up":true,"upSp":5,"upMat":0},
	{"id":"holyPrison","name":"구속의 영역","cat":"tech","act":true,"noDmg":true,"emoji":"✟","desc":"범위 내 몬스터 부활력 -15%~30%(Lv1=15%, Lv10=30%). Lv1 범위400, Lv10 범위697. Lv당 범위+33. 쿨 30초. 지속 10초","descEn":"Monsters in range: revive power -15%~30%(Lv1=15%, Lv10=30%). Lv1 range 400, Lv10 range 697. Per Lv range+33. CD 30s. Duration 10s","spCost":10,"matCost":80,"cd":1800,"up":true,"upSp":5,"upMat":0},
	{"id":"iceStorm","name":"아이스스톰","cat":"magic","act":true,"noDmg":true,"emoji":"❄","desc":"마우스 조준 설치. 2스택 (15초/1충전, Lv10→3스택). 범위 내 빙결 저항 -50%, 빙결 게이지 급속 축적. 10초 지속. MP 40. Lv당 범위+22 축적+10%","descEn":"Mouse-aim placement. 2 stocks (15s/charge, Lv10→3 stocks). Freeze resist -50% in range, rapid freeze gauge buildup. 10s duration. MP 40. Per Lv range+22 buildup+10%","spCost":10,"matCost":90,"up":true,"upSp":5,"upMat":0},
	{"id":"giantSlam","name":"지옥강타 1","cat":"rage","act":true,"emoji":"🔨","desc":"[선택: Space] 땅을 내리쳐 원형 진동파 발생(범위400). 일반몹에게 큰 포이즈 피해, 보스 체간 파괴에 강함. 회전기폭과 합체→지진폭풍!","descEn":"[Select: Space] Slam ground → circular shockwave (range 400). High poise DMG to mobs, strong posture break vs bosses. Fuses with Whirlwind Detonate → Earthquake Storm!","spCost":10,"matCost":120,"up":true,"upSp":5,"upMat":0,"cd":1800},
	{"id":"giantSlam2","name":"지옥강타 2","cat":"rage","act":true,"emoji":"🔨","desc":"[선택: Space] 땅을 내리쳐 원형 진동파 발생(범위400). 일반몹에게 큰 포이즈 피해, 보스 체간 파괴에 강함. 악의기둥과 합체→기둥강타!","descEn":"[Select: Space] Slam ground → circular shockwave (range 400). High poise DMG to mobs, strong posture break vs bosses. Fuses with Dark Pillar → Pillar Slam!","spCost":10,"matCost":120,"up":true,"upSp":5,"upMat":0,"cd":1800},
	{"id":"skyCrusher","name":"천공쇄기","cat":"rage","act":true,"emoji":"🪨","desc":"[선택: Space] 커서 위치에 거대한 철제 쇄기를 낙하시킨다. 분노급 착탄 피해 후 3초간 남아 주변에 화염 지속 피해. MP 80, 최대 3충전, 충전당 15초. 패링 시 다음 충전 0.5초 감소. Lv당 범위+12·낙하속도·파편 수 증가","descEn":"[Select: Space] Drop a colossal iron crusher at the cursor. Its rage-tier impact remains for 3s after impact and burns nearby enemies. MP 80, up to 3 charges, 15s per charge. Parries trim the next charge by 0.5s. Per Lv: +12 radius, faster fall, more shards","spCost":10,"matCost":120,"cd":900,"up":true,"upSp":5,"upMat":0},
	{"id":"chainAssault","name":"기동불꽃","cat":"move","desc":"사슬기동 중 우클릭 → 즉시 착지하며 화염폭발. 범위200~350 INT 스케일 화염 마법데미지+넉백. 이동거리에 비례해 데미지↑(최대 x4.0). 불바닥을 여러 개 쌓은 뒤 충돌 스킬(기동파괴) 또는 분노 스킬(지옥강타 1)로 한 번에 폭발시킬 수 있다. MP 소모. Lv당 범위+16 뎀+12%","descEn":"During chain dash RMB → instant land with fire explosion. Range 200~350 INT scale fire magic DMG+knockback. DMG scales with travel distance (max x4.0). Stack multiple flame zones, then detonate them all at once with the collision skill (Chain Crush) or rage skill (Hell Slam I). MP cost. Per Lv range+16 DMG+12%","spCost":10,"matCost":0,"up":true,"upSp":5,"upMat":0},
	{"id":"chainSlam","name":"기동파괴","cat":"move","desc":"사슬기동 중 좌클릭/E → 조준한 전방으로 세 갈래 대지가르기. 사거리450~675, 균열 경로의 적마다 1회 타격. 일반몹 기절5초, 보스 최대체간30% 삭감. 후방과 갈래 사이의 적은 제외. Lv당 사거리+25, 경로 반폭+2. ST 소모.","descEn":"During chain movement LMB/E → three forward earth fissures toward your aim. Range 450–675; each enemy in the paths is hit once. Stuns mobs for 5s and removes 30% of boss max posture. Excludes rear targets and gaps. Per Lv range+25, path half-width+2. Costs ST.","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
	{"id":"chainSlash","name":"기동칼날개","cat":"move","fixed":true,"hidden":true,"emoji":"⚔","desc":"[히든: 5성 dimRush 합체] 사슬기동 중 좌클릭 → 이동 중 전방 광역 베기+출혈. STR 스케일 물리데미지. 다단히트. Lv당 뎀+12% 범위+15","descEn":"[Hidden: 5-star dimRush fuse] During chain dash LMB → forward AoE slash+bleed while moving. STR scale physical DMG. Multi-hit. Per Lv DMG+12% range+15","spCost":0,"matCost":0,"up":true,"upSp":5,"upMat":0},
	{"id":"peaceShield","name":"평화의보호","cat":"def","fixed":true,"noDmg":true,"emoji":"🕊️","desc":"Q 홀드 시 보호막이 점점 커지며 HP 초당 5% 회복. 보호막 크기에 비례해 데미지 감소. MP 소모","descEn":"Q hold: shield grows over time + HP 5%/s regen. DMG reduction scales with shield size. MP cost","spCost":0,"matCost":0,"up":true,"upSp":5,"upMat":0},
	{"id":"hellRay","name":"참회","cat":"magic","fixed":true,"hidden":true,"emoji":"⚡","desc":"[히든: 암전나선 합체] E로 조준, 클릭 설치. 에너지 쐐기를 지상에 꽂아 회전+데미지. MP100. 1차지 쿨10초. 5초+Lv당0.5초 지속. 범위 200+(Lv-1)×22","descEn":"[Hidden: Dark Spiral fuse] E to aim, click to place. Energy wedge planted on ground — rotates+DMG. MP 100. 1 charge CD 10s. 5s+0.5s/Lv duration. Range 200+(Lv-1)×22","spCost":0,"matCost":0,"up":true,"upSp":5,"upMat":0},
	{"id":"shieldThrow","name":"불꽃칼날","cat":"def","fixed":true,"emoji":"🔥","desc":"[고정: 칼등치기 합체] 보유 시 칼등치기에 전방 충격파 자동 발동. 제자리 처내기. 쿨 12초. Lv당 뎀+12% 범위+20","descEn":"[Fixed: Blade Parry fuse] When owned, swipe auto-triggers forward shockwave. Stationary swipe. CD 12s. Per Lv DMG+12% range+20","spCost":10,"matCost":80,"cd":720,"up":true,"upSp":5,"upMat":0},
	{"id":"weakPhys","name":"파쇄의 영역","cat":"tech","act":true,"noDmg":true,"emoji":"⚔","desc":"현재 위치에 파쇄 영역 설치 (10초). 범위 내 적 물리방어력 -10%. 쿨 25초. Lv당 범위+22 효과+1% 지속+0.3초","descEn":"Place shatter domain at current pos (10s). Enemy phys DEF -10% in range. CD 25s. Per Lv range+22 effect+1% duration+0.3s","spCost":10,"matCost":80,"cd":1500,"up":true,"upSp":5,"upMat":0},
	{"id":"weakMag","name":"침식의 영역","cat":"tech","act":true,"noDmg":true,"emoji":"🔮","desc":"현재 위치에 침식 영역 설치 (10초). 범위 내 적 마법저항력 -10%. 쿨 25초. Lv당 범위+22 효과+1% 지속+0.3초","descEn":"Place corrosion domain at current pos (10s). Enemy magic resist -10% in range. CD 25s. Per Lv range+22 effect+1% duration+0.3s","spCost":10,"matCost":80,"cd":1500,"up":true,"upSp":5,"upMat":0},
	{"id":"weakPj","name":"관통의 영역","cat":"tech","act":true,"noDmg":true,"emoji":"🏹","desc":"현재 위치에 관통 영역 설치 (10초). 범위 내 적 투사체저항력 -10%. 쿨 25초. Lv당 범위+22 효과+1% 지속+0.3초","descEn":"Place pierce domain at current pos (10s). Enemy projectile resist -10% in range. CD 25s. Per Lv range+22 effect+1% duration+0.3s","spCost":10,"matCost":80,"cd":1500,"up":true,"upSp":5,"upMat":0},
	{"id":"weakRev","name":"부활의 영역","cat":"tech","act":true,"noDmg":true,"emoji":"💀","desc":"현재 위치에 부활 영역 설치 (10초). 영역 안에서 부활력 +10%. 쿨 25초. Lv당 범위+22 효과+1% 지속+0.3초","descEn":"Place revival domain at current pos (10s). Revive power +10% inside zone. CD 25s. Per Lv range+22 effect+1% duration+0.3s","spCost":10,"matCost":80,"cd":1500,"up":true,"upSp":5,"upMat":0},
	{"id":"spikeTrap","name":"가시덫","cat":"phys","act":true,"emoji":"🌿","desc":"[선택: 1~4번] 현재 위치에 가시덫 설치 (1렙 반경300, 10렙435). 슬로우 91%(+2%/Lv, 최대95%)+출혈. INT×magicRef×pMagicMul×(14+5.6×(Lv-1))×0.75. 악의 10, 쿨 10초. Lv당 범위+15","descEn":"[Select: 1-4] Place spike trap at current pos (Lv1 radius 300, Lv10 435). Slow 91%(+2%/Lv, max 95%)+bleed. INT×magicRef×pMagicMul×(14+5.6×(Lv-1))×0.75. Malice 10, CD 10s. Per Lv range+15","spCost":10,"matCost":80,"cd":600,"up":true,"upSp":5,"upMat":0},
	{"id":"blueShot","name":"푸른비","cat":"bow","fixed":true,"emoji":"💎","desc":"[고정: E, Lv300 해금] 유도 파란콩 50발 순차 발사 (5초간). MP 100(+1.5/Lv) 소모. 적 추적. 쿨 5초. Lv당 사거리+30 (뎀은 _skMul 계수 적용)","descEn":"[Fixed: E, unlock Lv300] 50 homing blue shots fired sequentially (over 5s). MP 100(+1.5/Lv) cost. Tracks enemies. CD 5s. Per Lv range+30 (DMG uses _skMul)","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0,"reqLv":300},
	{"id":"burstLoop","name":"버스트루프","cat":"magic","fixed":true,"hidden":true,"emoji":"💫","desc":"[히든: 우클릭, Lv700 해금] 홀드 시 3단계 차지 범위폭발 (0.5/1.0/1.5초). 범위 600/1000/1400px. 3단 만충 자동폭발. INT 스케일, 무속성","descEn":"[Hidden: RMB, unlock Lv700] Hold for 3-stage charge AoE explosion (0.5/1.0/1.5s). Range 600/1000/1400px. Stage 3 full charge auto-detonates. INT scale, no element","spCost":0,"matCost":0,"up":true,"upSp":5,"upMat":0,"reqLv":700},
	{"id":"voidScarecrow","name":"유령 허수아비","cat":"summon","act":true,"emoji":"👻","desc":"유령 허수아비를 소환하여 유도탄막 어그로를 끈다. 탄막을 흡수해 자원 축적 (기본 20개, Lv당+3). 1개당 HP/MP/ST 각 100. R키로 회수. 쿨 20초","descEn":"Summon phantom scarecrow to draw homing projectile aggro. Absorbs projectiles for resource buildup (base 20, +3/Lv). Per absorbed: HP/MP/ST +100 each. R key to retrieve. CD 20s","spCost":10,"matCost":100,"cd":600,"up":true,"upSp":5,"upMat":0},
	{"id":"explodeScarecrow","name":"폭발 허수아비","cat":"summon","act":true,"emoji":"💥","desc":"폭발 허수아비 설치. 탄막을 흡수하고 재입력 시 폭발! 폭발뎀 (INT마법뎀+흡수탄막뎀)×배율(흡수10당+50, 최대200). 10스택당 연쇄폭발(+30%). 범위 500+흡수10당500 (최대2000). 최대흡수 1렙10~20렙31. 쿨 20초","descEn":"Place explosive scarecrow. Absorbs projectiles, re-press to detonate! Boom DMG (INT magic DMG + absorbed proj DMG)×mult(+50 per 10 absorbed, max 200). Chain boom per 10 stacks (+30%). Range 500+absorbed/10×500 (max 2000). Max absorb Lv1=10~Lv20=31. CD 20s","spCost":10,"matCost":100,"cd":600,"up":true,"upSp":5,"upMat":0},
	{"id":"ancestorSummon","name":"전대 소환","cat":"summon","act":true,"emoji":"⚱️","desc":"[유골함 도감] 철갑 전대 4부위(두개골·몸통·팔·다리)를 모아 거대 1기를 소환해 자율 전투(추적+전방 검기+10초마다 발구르기 스턴). 부위 역할: 팔=공격, 두개골=치명, 몸통=HP, 다리=크기·속도. 평소 탄막 어그로 없음. 재입력: 칼 꽂기·붉은 충전 60f 동안 일반 탄막 최대 24발 흡수 후 폭발 회수. 흡수 1발당 HP/MP/ST 각 100 반환. 재입력 무료·쿨 무관. MP 30%. 쿨 25초","descEn":"[Ossuary Codex] Collect the 4 Iron Warlord parts (skull/torso/arms/legs) to summon one giant autonomous fighter (chase, forward sword wave, and a stunning foot stomp every 10s). Parts: arms=ATK, skull=crit, torso=HP, legs=size/speed. No bullet aggro in normal combat. Recast: plant sword, absorb up to 24 ordinary shots during the final 60f red charge, then explode and recall. Each shot returns 100 HP/MP/ST. Recast ignores cost and cooldown. MP 30%. CD 25s","spCost":10,"matCost":100,"cd":1500,"up":true,"upSp":5,"upMat":0},
	{"id":"ghostXbowTurret","name":"공성쇠뇌","cat":"bow","act":true,"emoji":"🏹","desc":"[선택: 1~4번, Lv500 해금] 현재 위치에 공성쇠뇌 터렛 설치. 재입력 시 철거. 설치 중 플레이어 석궁 사용 불가 (터렛만 발사). 데미지+50%, 공속+50%, 사거리+50%. ST 100. 설치 쿨 20초. Lv당 뎀+5% 공속+5% 사거리+5%","descEn":"[Select: 1~4, unlock Lv500] Deploy siege crossbow turret at current pos. Re-press to dismantle. While deployed: player crossbow disabled (turret fires only). DMG+50%, ATK SPD+50%, range+50%. ST 100. Placement CD 20s. Per Lv DMG+5% ATK SPD+5% range+5%","spCost":10,"matCost":120,"cd":1200,"up":true,"upSp":5,"upMat":0,"reqLv":500},
	{"id":"timeWarp","name":"시간왜곡","cat":"def","act":true,"emoji":"⏳","desc":"[Ctrl, Lv500 해금] 발동 시 3초 전 상태로 되돌린다. 위치/HP/MP/ST 완전 복원. Lv당 되감기+0.105초 (1렙 3초, 20렙 5초). MP 50(+5/Lv, 20렙150). 쿨 45초","descEn":"[Ctrl, unlock Lv500] Rewind to state from 3s ago. Restores position/HP/MP/ST. Per Lv rewind+0.105s (Lv1=3s, Lv20=5s). MP 50(+5/Lv, Lv20=150). CD 45s","spCost":15,"matCost":150,"cd":2700,"up":true,"upSp":5,"upMat":0,"reqLv":500},
	{"id":"thunderStake","name":"뇌전창","cat":"magic","act":true,"emoji":"⚡","desc":"[선택: 1~4번] 마우스 조준 → 전기창을 땅에 꽂는다. 5스택(12초/1충전, Lv10→6스택). 창끼리 600px 이내면 전류 아크 발생, 경로 위 적에게 감전 틱 데미지. MP 50. 지속 10초(+0.5초/Lv). Lv당 아크뎀+10%","descEn":"[Select: 1~4] Mouse aim → plant electric spear on ground. 5 stocks (12s/charge, Lv10→6). Spears within 600px create lightning arcs dealing shock tick DMG to enemies on path. MP 50. Duration 10s (+0.5s/Lv). Per Lv arc DMG+10%","spCost":10,"matCost":100,"up":true,"upSp":5,"upMat":0},
]

## game.html:44277-44317 SKILL_SLOT_DEFS
const SLOT_DEFINITIONS := {
	"charge":{"name":"이동스킬","nameEn":"Movement Skill","key":"charge","skills":["charge","magicBlink"],"info":{"charge":{"name":"사슬","nameEn":"Chain","emoji":"⛓️","desc":"Shift: 사슬 발사 → 끌려감","descEn":"Shift: Fire chain → pull toward"},"magicBlink":{"name":"사슬기동:화염","nameEn":"Chain Drive: Flame","emoji":"🔥","desc":"Shift: 화염길+화상","descEn":"Shift: Flame trail + burn"}}},
	"magic":{"name":"마법스킬","nameEn":"Magic Skill","key":"magic","skills":["fireball","omniBeam","elemMissile","hellRay","blueShot","burstLoop","fireAura","fireBeam","arcLaser"],"info":{"fireball":{"name":"악의구","nameEn":"Malice Orb","emoji":"🔮","desc":"우클릭: 어둠 오브 (크기+50%/Lv, 데미지 _skMul)","descEn":"RMB: Dark orb (size+50%/Lv, DMG via _skMul)"},"omniBeam":{"name":"멸살광선","nameEn":"Omni Beam","emoji":"☄️","desc":"우클릭: 1발 직선 레이저","descEn":"RMB: Single straight laser"},"elemMissile":{"name":"원소추적탄","nameEn":"Elem Missile","emoji":"🎯","desc":"우클릭: 6원소 유도 미사일","descEn":"RMB: 6-element homing missiles"},"hellRay":{"name":"참회","nameEn":"Repentance","emoji":"⚡","desc":"우클릭: 신성한 선 설치 (시계방향 회전)","descEn":"RMB: Place holy line (clockwise rotation)"},"blueShot":{"name":"푸른비","nameEn":"Blue Rain","emoji":"💎","desc":"우클릭: 5초간 50발 파란콩 순차 발사 (MP100+1.5/Lv, 추적, 쿨5초)","descEn":"RMB: 50 blue shots over 5s (MP100+1.5/Lv, homing, cd 5s)"},"burstLoop":{"name":"버스트루프","nameEn":"Burst Loop","emoji":"💫","desc":"우클릭 홀드: 3단계 차지 범위폭발 (Lv700 히든)","descEn":"RMB Hold: 3-stage charge AoE (Lv700 hidden)"},"fireAura":{"name":"지옥진","nameEn":"Inferno Field","emoji":"🌋","desc":"우클릭: 10초 대지진동 (용암기둥+화상+틱뎀, MP100, 쿨12초)","descEn":"RMB: 10s ground quake (lava+burn+tick, MP100, cd 12s)"},"fireBeam":{"name":"업화선","nameEn":"Karma Beam","emoji":"🔥","desc":"우클릭: 최대 5초 차징, 재입력 시 발사. 직선 관통+폭발+화상.","descEn":"RMB: charge up to 5s; press again to fire. Straight piercing shot + explosion + burn."},"arcLaser":{"name":"얼음송곳","nameEn":"Ice Spike","emoji":"❄","desc":"E홀드: 직선 관통 냉기빔 채널링 (MP 8+Lv/초, 감속)","descEn":"E hold: straight piercing ice beam channel (MP 8+Lv/s, slow)"}}},
	"bow":{"name":"석궁 자동(T)","nameEn":"Crossbow Auto(T)","key":"bow","skills":["normal","bladeShot","blastShot","fanShot","needleShot"],"info":{"normal":{"name":"일반사격","nameEn":"Normal Shot","emoji":"🏹","desc":"T자동: 기본 화살","descEn":"T auto: Basic arrow"},"bladeShot":{"name":"붉은꽃","nameEn":"Red Bloom","emoji":"🌹","desc":"T자동: 붉은 꽃잎 칼날 (ST50)","descEn":"T auto: Red petal blade (ST50)"},"blastShot":{"name":"폭산탄","nameEn":"Blast Shot","emoji":"💥","desc":"T자동: 폭탄 (악의5, 쿨0.5초)","descEn":"T auto: Bomb (malice 5, cd 0.5s)"},"fanShot":{"name":"만화방창","nameEn":"Barrage","emoji":"✨","desc":"T자동: 물리 바늘 3방향 3발 (관통X)","descEn":"T auto: 3 physical needles 3-way (no pierce)"},"needleShot":{"name":"만화방창 II","nameEn":"Barrage II","emoji":"✨","desc":"T자동: 초고속 바늘 2발+5렙당1 (ST8, 쿨1.5초)","descEn":"T auto: Ultra-fast 2 needles +1/5lv (ST8, cd 1.5s)"},"ltnChaser":{"name":"뇌전추격자","nameEn":"Lightning Chaser","emoji":"⚡","desc":"전기 유도칼날 (ST40, 쿨12초). 관통+체인라이트닝","descEn":"Lightning homing blades (ST40, CD 12s). Pierce+chain lightning"},"ghostXbowTurret":{"name":"공성쇠뇌","nameEn":"Siege Ballista","emoji":"🏹","desc":"선택스킬: 터렛 설치/철거 (Lv500, ST100, 설치 쿨20초)","descEn":"Select skill: Deploy/remove turret (Lv500, ST100, placement CD 20s)"}}},
	"tech":{"name":"영역 스킬","nameEn":"Area Skill","key":"tech","skills":["giantSlam"],"info":{"giantSlam":{"name":"지옥강타 1","nameEn":"Hell Slam I","emoji":"🔨","desc":"Space: 원형 진동파 (ST+악의20, 포이즈 특화, 쿨30초)","descEn":"Space: AoE shockwave (ST+malice20, poise focus, cd 30s)"}}},
	"lmb":{"name":"좌클 스킬","nameEn":"LMB Skill","key":"lmb","skills":["kiSlash","whirlwind"],"info":{"kiSlash":{"name":"기검참","nameEn":"Ki Slash","emoji":"⚔","desc":"좌클 3타 홀드: 2초에 최대 3단(약 0.67초당 1단). 검기 피해 2/4/8배. ST 10+Lv당2","descEn":"Hold 3rd LMB hit: up to 3 stages over 2 seconds (~0.67s each). Blade damage ×2/×4/×8. ST 10+2/Lv"},"whirlwind":{"name":"회전참","nameEn":"Whirlwind","emoji":"🌀","desc":"좌클 홀드: 회전 베기","descEn":"LMB Hold: Spin attack"}}},
	"rmb":{"name":"E 스킬","nameEn":"E Skill","key":"rmb","skills":["maliceSwipe"],"info":{"maliceSwipe":{"name":"불꽃칼날","nameEn":"Flame Blade","emoji":"🔥","desc":"E: 쿨타임 완료 시 불꽃을 두른 칼날을 크게 휘두릅니다. 일반 마법탄도 반사. 홀드 풀차지 1.5초, 스킬 Lv당 범위 +5%.","descEn":"E: Swing a flaming blade when ready; also reflects ordinary magic shots. Hold for 1.5s full charge. +5% range per skill level."}}},
	"q":{"name":"보호막 스킬","nameEn":"Shield Skill","key":"q","skills":["parry","detonate","peaceShield"],"info":{"parry":{"name":"보호막","nameEn":"Shield","emoji":"💠","desc":"Q: 피보호막 (데미지 30% 흡수, 수호신 패시브로 최대 50%)","descEn":"Q: Damage shield (absorb 30%, up to 50% with Guardian passive)"},"detonate":{"name":"기폭팔","nameEn":"Detonate","emoji":"💥","desc":"Q 홀드: 흡수 데미지 축적 → 해제 시 광역 폭발","descEn":"Q Hold: Accumulate absorbed dmg → AoE explosion on release"},"peaceShield":{"name":"평화의보호","nameEn":"Aegis of Peace","emoji":"🕊️","desc":"Q 홀드: 버블 보호막+힐+반사. 해제 시 충격파","descEn":"Q Hold: Bubble shield+heal+reflect. Shockwave on release"}}},
	"ct":{"name":"CT 스킬","nameEn":"CT Skill","key":"ct","skills":["ghostWalk","iceOrb","timeWarp"],"info":{"ghostWalk":{"name":"뇌전걸음","nameEn":"Ghost Walk","emoji":"⚡","desc":"CT: 전류변신+뇌전걸음 (쿨4초)","descEn":"CT: Lightning shift + ghost walk (cd 4s)"},"iceOrb":{"name":"얼음보주","nameEn":"Ice Orb","emoji":"❄️","desc":"CT: 방어구체+빙결 (재입력: 파쇄)","descEn":"CT: Defense orb + freeze (re-press: shatter)"},"timeWarp":{"name":"시간왜곡","nameEn":"Time Warp","emoji":"⏳","desc":"CT: 3~5초 전 상태로 되돌림 (Lv500)","descEn":"CT: Rewind to 3~5s ago (Lv500)"}}},
}

## game.html:44324-44357 _FUSE_GEM_GROUPS
const GEM_METADATA := {
	"dimBreach":{"color":"#00ddcc","color2":"#0066ff","tier":"clear","minLv":5},
	"dimSlam":{"color":"#00ddcc","color2":"#0066ff","tier":"clear","minLv":10},
	"dimThunder":{"color":"#00ddcc","color2":"#0066ff","tier":"clear","minLv":15},
	"dimRush":{"color":"#00ddcc","color2":"#0066ff","tier":"clear","minLv":20},
	"dimBlast":{"color":"#00ddcc","color2":"#ffaa00","tier":"clear","minLv":25},
	"sixFuse":{"color":"#ffdd00","color2":"#ff6600","tier":"clear","minLv":5},
	"elemFuse":{"color":"#ffdd00","color2":"#ff6600","tier":"clear","minLv":10},
	"whirlDet":{"color":"#ff7722","color2":"#ffee00","tier":"clear","minLv":5},
	"slamStorm":{"color":"#ff7722","color2":"#ffee00","tier":"clear","minLv":10},
	"stormBeam":{"color":"#ff4400","color2":"#ffdd00","tier":"clear","minLv":15},
	"stormBurst":{"color":"#dd00ff","color2":"#ffdd00","tier":"clear","minLv":30,"hidden":true},
	"bladeFuse":{"color":"#ffffff","color2":"#ccbbaa","tier":"clear","minLv":5},
	"bladeEcho":{"color":"#e6f8ff","color2":"#44ddff","tier":"clear","minLv":1},
	"iceMortar":{"color":"#2299ff","color2":"#00ffaa","tier":"clear","minLv":10},
	"boneStorm":{"color":"#44ee44","color2":"#886622","tier":"clear","minLv":5},
	"elecRepent":{"color":"#44ee44","color2":"#ffd700","tier":"clear","minLv":10},
	"shieldFuse":{"color":"#8888cc","color2":"#cc8844","tier":"clear","minLv":1},
	"plagueFuse":{"color":"#ffffff","color2":"#ccbbaa","tier":"clear","minLv":10},
	"plagueVenom":{"color":"#44dd44","color2":"#ccbbaa","tier":"clear","minLv":15},
	"holyFuse":{"color":"#ff88aa","color2":"#ffccdd","tier":"clear","minLv":5},
	"holyIce":{"color":"#ff88aa","color2":"#88ddff","tier":"clear","minLv":10},
	"holyWeak1":{"color":"#ff88aa","color2":"#aa66cc","tier":"clear","minLv":15},
	"holyWeak2":{"color":"#ff88aa","color2":"#8866ff","tier":"clear","minLv":20},
	"holyWeak3":{"color":"#ff88aa","color2":"#6688ff","tier":"clear","minLv":25},
	"holyWeak4":{"color":"#ff88aa","color2":"#ffdd00","tier":"clear","minLv":30},
	"pillarSpike":{"color":"#7722cc","color2":"#66aa44","tier":"clear","minLv":1},
	"pillarSlam":{"color":"#ff8844","color2":"#7722cc","tier":"clear","minLv":1},
	"infernoSlam":{"color":"#ff6622","color2":"#ff4400","tier":"clear","minLv":1},
	"siegeGhost":{"color":"#6688cc","color2":"#aa66dd","tier":"clear","minLv":1},
	"dualScarecrow":{"color":"#aa66dd","color2":"#ff4422","tier":"clear","minLv":1},
	"thunderGhost":{"color":"#44ddff","color2":"#8899bb","tier":"clear","minLv":1},
	"timeStep":{"color":"#8888ff","color2":"#44ddff","tier":"clear","minLv":500},
}

## game.html:44507-44554 _SK_MUL
const SKILL_MULTIPLIERS := {
	"giantSlam":{"b":20,"g":19},
	"maliceMortar":{"b":10,"g":8},
	"iceOrb":{"b":8,"g":6.4},
	"boneWall":{"b":9,"g":7.2},
	"chainSlam":{"b":8,"g":6.4},
	"detonate":{"b":8,"g":6.4},
	"plagueBurst":{"b":7,"g":5.6},
	"maliceHuntBurst":{"b":28,"g":22.4},
	"blueShell":{"b":8,"g":6.4},
	"maliceStorm":{"b":14,"g":11.2},
	"fireAura":{"b":10,"g":8},
	"darkPillar":{"b":20,"g":16},
	"spikeTrap":{"b":14,"g":11.2},
	"skyCrusher":{"b":60,"g":48},
	"bladeDash":{"b":3.5,"g":2.1},
	"thunderStake":{"b":2.4,"g":1.6},
	"arcLaser":{"b":8,"g":6.4},
	"omniBeam":{"b":0.75,"g":0.6},
	"whirlwind":{"b":25,"g":24},
	"maliceHunt":{"b":1,"g":0.8},
	"venomBlade":{"b":3,"g":2.4},
	"ltnChaser":{"b":4,"g":3.2},
	"blueShot":{"b":1.8,"g":1.44},
	"fireball":{"b":13.2,"g":10.56},
	"fireBeam":{"b":3,"g":2.4},
	"needleShot":{"b":4,"g":3.2},
	"blastShot":{"b":4,"g":3.2},
	"hellRay":{"b":5,"g":4},
	"burstLoop":{"b":5,"g":4},
	"kiSlash":{"b":12,"g":10.08},
	"chargeBoost":{"b":8,"g":6.4},
	"chainAssault":{"b":3,"g":2.4},
	"chainSlash":{"b":3.5,"g":2.8},
	"magicBlink":{"b":4,"g":3.2},
	"ghostWalk":{"b":4,"g":3.2},
	"elemMissile":{"b":2,"g":1.6},
	"ancestorSummon":{"b":6,"g":4.8},
}

const SOURCE_RANGES := {"categories":{"name":"SKILL_CATS","start_line":44082,"end_line":44092},"recommendations":{"name":"SKILL_REC_PATH","start_line":44094,"end_line":44110},"hierarchy":{"name":"SKILL_HIER","start_line":44111,"end_line":44116},"icons":{"name":"SKILL_ICONS","start_line":44118,"end_line":44118},"skills":{"name":"SKILL_LIST","start_line":44161,"end_line":44224},"slot_definitions":{"name":"SKILL_SLOT_DEFS","start_line":44277,"end_line":44317},"gem_groups":{"name":"_FUSE_GEM_GROUPS","start_line":44324,"end_line":44357},"fusion_pairs":{"name":"_FUSE_PAIRS","start_line":44453,"end_line":44486},"skill_multipliers":{"name":"_SK_MUL","start_line":44507,"end_line":44554}}


static func read_catalog() -> Dictionary:
	var gems: Dictionary = {}
	for key in GEM_METADATA:
		var packet: Dictionary = read_gem_group(key)
		if packet.status != "READY":
			return packet
		gems[key] = packet.value
	return {"status": "READY", "source_pin": SOURCE_PIN, "value": {
		"categories": CATEGORIES.duplicate(true),
		"recommendations": RECOMMENDATIONS.duplicate(true),
		"hierarchy": HIERARCHY.duplicate(true),
		"icons": ICONS.duplicate(true),
		"skills": SKILLS.duplicate(true),
		"slot_definitions": SLOT_DEFINITIONS.duplicate(true),
		"gem_groups": gems,
		"fusion_pairs": FUSION.FUSE_PAIRS.duplicate(true),
		"skill_multipliers": SKILL_MULTIPLIERS.duplicate(true)}}


static func read_skill(skill_id: Variant) -> Dictionary:
	if not skill_id is String:
		return _unsupported_id(skill_id)
	# _SK_MAP.set gives the last duplicate definition ownership; current ids unique.
	for i in range(SKILLS.size() - 1, -1, -1):
		if SKILLS[i].id == skill_id:
			return _found(SKILLS[i].duplicate(true))
	return _missing() # source _skById returns null for an unknown id


static func read_slot_definition(slot_id: Variant) -> Dictionary:
	return _lookup(SLOT_DEFINITIONS, slot_id)


static func read_icon_definition(skill_id: Variant) -> Dictionary:
	return _lookup(ICONS, skill_id)


static func read_multiplier_definition(skill_id: Variant) -> Dictionary:
	# Metadata only: no P.skills level, _skMul, _fuseMul or affix evaluation.
	return _lookup(SKILL_MULTIPLIERS, skill_id)


static func read_fusion_members(fusion_id: Variant) -> Dictionary:
	return _lookup(FUSION.FUSE_PAIRS, fusion_id)


static func read_gem_group(fusion_id: Variant) -> Dictionary:
	if not fusion_id is String:
		return _unsupported_id(fusion_id)
	if not GEM_METADATA.has(fusion_id):
		return _missing()
	if not FUSION.FUSE_PAIRS.has(fusion_id) or not FUSION.GEM_GROUP_STAR.has(fusion_id):
		return {"status": "NOT_READY", "reason": "fusion_dependency_missing", "input": fusion_id}
	var gem: Dictionary = GEM_METADATA[fusion_id].duplicate(true)
	var star: Variant = FUSION.GEM_GROUP_STAR[fusion_id]
	if star != null:
		gem["star"] = star
	gem["skills"] = FUSION.FUSE_PAIRS[fusion_id].duplicate(true)
	return _found(gem)


static func read_source_ranges() -> Dictionary:
	return SOURCE_RANGES.duplicate(true)


static func _lookup(table: Dictionary, key: Variant) -> Dictionary:
	if not key is String:
		return _unsupported_id(key)
	if not table.has(key):
		return _missing()
	var value: Variant = table[key]
	return _found(value.duplicate(true) if value is Dictionary or value is Array else value)


static func _found(value: Variant) -> Dictionary:
	return {"status": "READY", "found": true, "value": value}


static func _missing() -> Dictionary:
	return {"status": "READY", "found": false, "value": null}


static func _unsupported_id(key: Variant) -> Dictionary:
	return {"status": "NOT_READY", "reason": "unsupported_id_carrier", "input": key}
