extends RefCounted
## PC-ENEMY-ACTORS (2026-10-23) — 자연 공급 G 계열(etype 3·7·13·14·16·17·20·21·47 + 자연 29) 순수 실행자.
##
## 원본(고정 스냅샷 godot/source_snapshot/game.html, SNAPSHOT.json sha256 dee094fd…):
##   mkEn 31122–31371(si0·ib=false·비레어 부분집합) / 적 루프 per-enemy 앞부분 34395–34399·34446–34456 /
##   updateE 38586–41412 의 비보스 경로(공통 앞부분 + etype 분기 7·13·14·16·17·20·29·47 + idle/eCharge/eSwoop/
##   eSlamWind/eSummon/windup/attack/recover/eCircle) / teleportE 20008 / eProjAt 20121 / _beanRoll / _eMouthXY /
##   _tickProjCharge·_fireChargedProj 20124–20157 / eModHitP 31092.
## 상태를 소유하지 않는다. e 는 원본 필드명 그대로의 Dictionary(actor 의 native_final) 이고 env 가 월드·플레이어·
## 표시·피해를 수행한다. 원문 문장 순서·JS 진리값·~~(ToInt32)·Math.random 소비 순서를 보존한다.
## 이식 안 된 활성 분기(엘리트 모디파이어·DOT 풀·레슨 적)는 가짜 구현 대신 NOT_READY 로 멈춘다.
## 검증: tests/pc_enemy_actors_source_oracle.cjs(원본 VM) ↔ tests/test_pc_enemy_actors_kernel.gd(같은 env 틱별 대조).
const PREFIX = preload("res://scripts/native_demo11_boss_prefix.gd")
const TAU_ := PI * 2.0

const G_TYPES := [3, 7, 13, 14, 16, 17, 20, 21, 47, 29]
# 31152–31155 ETYPE_SPD = _ETYPE_SPD_RAW.map(v=>v===0?0:max(.2,v*1.3)) — 원표값(raw)
const SPD_RAW := {3: .75, 7: .15, 13: .8, 14: .4, 16: .5, 17: .18, 20: .27, 21: .3, 29: .36, 40: .21, 47: .36}
const RADIUS := {3: 10, 7: 10, 13: 10, 14: 10, 16: 10, 17: 20, 20: 10, 21: 10, 29: 20, 40: 10, 47: 12} # 30861 ETYPE_R
const RANGE := {3: 200, 7: 800, 13: 400, 14: 600, 16: 600, 17: 800, 20: 400, 21: 800, 29: 1000, 40: 600, 47: 400} # 30872 ETYPE_RANGE
const COL := {3: "#66ee66", 7: "#aa44ee", 13: "#9b6b6b", 14: "#4a6b4a", 16: "#3b5b4b", 17: "#6b2a2a", 20: "#88ccff", 21: "#66aaee", 29: "#4455aa", 40: "#551133", 47: "#221122"} # 30911 ETYPE_COL
# 32082 _ETYPE_SFX || 32086 _ARCH_SFX (둘 다 없으면 null)
const MOVE_SFX := {3: "m_swarm", 7: "m_caster", 13: "m_swarm", 14: "m_swarm", 16: "m_splitter", 17: "m_mother", 20: "m_melee", 21: "m_archer", 29: "m_tank", 47: "m_melee"}
const NO_PROJ := [5, 9, 11, 20, 24, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59] # 31151 window._noProjEtypes
const KEEP_DISTANCE := [1, 7, 8, 9, 11, 16, 17, 21, 23, 25, 26, 31, 34, 38, 62] # 40466
const MELEE_ET := [0, 2, 4, 5, 6, 10, 12, 18, 19] # 40505 _meleeET
const SOURCE_ELEMENT_NAMES := ["physical", "fire", "ice", "dark", "lightning", "holy", "earth"] # flesh_crawler 와 같은 el 이름표
const ELC := ["#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44"] # 14338
const EL_P := 0
const EL_F := 1
const EL_I := 2
const EL_D := 3
const ELITE := [ # 31033 ELITE_TIERS
	{"hpMul": 1.0, "atkMul": 1.0, "scaleMul": 1.0, "mods": 0},
	{"hpMul": 2.0, "atkMul": 1.3, "scaleMul": 1.08, "mods": 1},
	{"hpMul": 3.0, "atkMul": 1.6, "scaleMul": 1.2, "mods": 2},
	{"hpMul": 5.0, "atkMul": 2.0, "scaleMul": 1.35, "mods": 3}]
const DIFF_LV_OFF := [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500] # 9272
const DIFF_MUL := [0.45, 0.55, 0.65, 0.76, 0.88, 1.0, 1.12, 1.25, 1.40, 1.58, 1.78] # 9276
# mkEn 객체 리터럴의 etype 조건부 Math.random 행(원문 순서). 무조건 행(st2·facing·projT·bossPatT·_bossOrbitAng·
# _erraticAng)은 아래 mk_en 에 원문 위치대로 있다. 이 계열이 만드는 etype(자기 9종·29·소환 3/13·분신 40)만 수록.
const LITERAL_A := [ # bossPatT 뒤, _bossOrbitAng 앞(31186–31231)
	["summonCd", [7], 200.0, 100.0], ["summonT", [7], 100.0, 60.0],
	["teleportCd", [7], 150.0, 80.0], ["teleportT", [7], 80.0, 40.0],
	["webCd", [13], 120.0, 40.0], ["webT", [13], 40.0, 20.0],
	["swoopCd", [14], 140.0, 60.0], ["swoopT", [14], 50.0, 30.0],
	["trapCd", [16], 200.0, 60.0], ["trapT", [16], 60.0, 30.0],
	["motherCd", [17], 300.0, 100.0], ["motherT", [17], 100.0, 50.0],
	["_iceSlamCd", [28, 29], 250.0, 80.0], ["_iceSlamT", [28, 29], 80.0, 40.0]]
const LITERAL_B := [ # _bossOrbitAng 뒤, _erraticAng 앞(31234–31263)
	["_wraithPhaseT", [40], 120.0, 60.0], ["_wraithPhaseCd", [40], 240.0, 80.0],
	["_stCloneCd", [47], 200.0, 60.0], ["_stCloneT", [47], 80.0, 40.0], ["_stTpCd", [47], 120.0, 40.0]]
const UNPORTED_DOT_FIELDS := ["bleedT", "poisonT", "burnT", "_iceDotT", "_mhDot"] # 38723–38767

static func source_receipt() -> Dictionary:
	return {"game_sha256": preload("res://source_snapshot/snapshot.gd").SHA256,
		"source_lines": [[31122, 31371], [34395, 34399], [34446, 34456], [38586, 41412], [20008, 20048], [20121, 20157]],
		"domain": "stage0 natural non-boss elite0 mods[] etype 3/7/13/14/16/17/20/21/47/29", "owner": "PC enemy actors"}

# ═══ mkEn(x,y,0,etype,false,el,room) — 31122–31371 의 si0 일반 부분집합 ═══
## 반환: 원본 _e 필드명 Dictionary, 또는 null(31126 canMv/safePt 실패 → mkEn null, 난수 0).
## env: g_can_mv(x,y,r)·g_safe_pt(x,y,r)->{x,y}|null·g_rand()
static func mk_en(x: float, y: float, etype: int, el: Variant, room: Variant, player_lv: float, diff: int, stage_off: float, env: Object) -> Variant:
	if not SPD_RAW.has(etype):
		return {"__error": "etype_outside_G_constructor:" + str(etype)}
	# 31123 si0 개장 제외 etype(2,22,30,43)은 이 계열 밖이다.
	if not is_finite(x) or not is_finite(y):
		return null
	if not env.g_can_mv(x, y, 10.0):
		var sp: Variant = env.g_safe_pt(x, y, 10.0)
		if not sp is Dictionary:
			return null
		x = float(sp.x)
		y = float(sp.y)
	# 31134 rollElite(0): ELITE_PROB[0]=[.03,0,0], 항상 1회
	var u_elite: float = env.g_rand()
	var elite := 0
	if u_elite < 0.0: elite = 3
	elif u_elite < 0.0: elite = 2
	elif u_elite < 0.03: elite = 1
	var mods: Array = []
	if elite > 0:
		# 31072 rollMods(tier,0): hell0 attacks [M29,M30] 에서 min(2, tier>=3?2:1)개 → 일반은 cnt 를 채울 때까지
		var attacks: Array = ["M29", "M30"]
		var count: int = mini(attacks.size(), 2 if elite >= 3 else 1)
		while mods.size() < count:
			var i: int = PREFIX._i32(env.g_rand() * attacks.size())
			mods.append(attacks[i])
			attacks.remove_at(i)
		var ordinary: Array = ["M01", "M02", "M03", "M04"]
		while mods.size() < int(ELITE[elite].mods) and not ordinary.is_empty():
			var j: int = PREFIX._i32(env.g_rand() * ordinary.size())
			mods.append(ordinary[j])
			ordinary.remove_at(j)
	var spd_u: float = env.g_rand()
	var r_u: float = env.g_rand()
	# 객체 리터럴 원문 순서: st2 → facing → [aura] → projT → bossPatT → (조건부 A) → _bossOrbitAng → (조건부 B) → _erraticAng
	var lit: Dictionary = {}
	lit.st2 = 30.0 + env.g_rand() * 50.0
	lit.facing = env.g_rand() * TAU_
	if elite >= 2:
		env.g_rand() # 31091 rollAura: hell0 단일 오라라도 1회
		lit.__aura = "warCry"
	lit.projT = 180.0 + env.g_rand() * 120.0
	lit.bossPatT = 30.0 + env.g_rand() * 20.0
	for row in LITERAL_A:
		if (row[1] as Array).has(etype): lit[row[0]] = float(row[2]) + env.g_rand() * float(row[3])
	lit._bossOrbitAng = env.g_rand() * TAU_
	for row in LITERAL_B:
		if (row[1] as Array).has(etype): lit[row[0]] = float(row[2]) + env.g_rand() * float(row[3])
	lit._erraticAng = env.g_rand() * TAU_
	return assemble(x, y, etype, el, room, player_lv, diff, stage_off, elite, mods, spd_u, r_u, lit)

## 이미 원문 순서로 뽑힌 값(소환굴 35674 경로의 source{elite,mods,speed_u,radius_u,literal})으로 같은 _e 를 만든다.
## lit 는 리터럴 최종값(min+u*range). 위치 판정(canMv/safePt)은 호출자 몫.
static func assemble(x: float, y: float, etype: int, el: Variant, room: Variant, player_lv: float, diff: int, stage_off: float, elite: int, mods: Array, spd_u: float, r_u: float, lit: Dictionary) -> Dictionary:
	var dm: float = DIFF_MUL[diff] if diff >= 0 and diff < DIFF_MUL.size() else 1.0
	var mon_lv: float = maxf(1.0, (player_lv if player_lv != 0 else 1.0) + float(DIFF_LV_OFF[diff] if diff >= 0 and diff < DIFF_LV_OFF.size() else 0) + stage_off)
	var et: Dictionary = ELITE[elite]
	var spd: float = (maxf(0.2, float(SPD_RAW[etype]) * 1.3) + spd_u * 0.08) * 1.5
	if mods.has("M02"): spd *= 1.5
	var r: float = (float(RADIUS[etype]) + r_u * 2.0) * 2.0 * float(et.scaleMul)
	var curve: float = (0.4 * mon_lv * mon_lv * mon_lv + 199.0 * mon_lv + 100.0) if mon_lv <= 500 else 50000000.0 * pow(1.0014, mon_lv - 500)
	curve *= 2.925
	var pacing: float = 1.0 / (1.0 + minf(9.0, maxf(0.0, mon_lv - 1.0)) / 18.0)
	var lv_hp: int = int(floor(curve * pacing * 1.0 * dm * float(et.hpMul)))
	var hp: int = int(floor(lv_hp * (1.0 + 0.0 * 0.02)))
	var atk: int = int(floor((50.0 + mon_lv * 1.95) * 0.6 * dm * float(et.atkMul)))
	var proj_cd: int = 9999 if NO_PROJ.has(etype) else 240
	if mods.has("M02"): proj_cd = PREFIX._i32(proj_cd * 0.85)
	if elite > 0: proj_cd = PREFIX._i32(proj_cd * (0.6 if elite >= 3 else 0.7 if elite >= 2 else 0.8))
	var e: Dictionary = {"x": x, "y": y, "r": r, "hp": hp, "mhp": hp, "atk": atk, "baseAtk": atk,
		"speed": spd, "baseSpd": spd, "el": el, "col": COL[etype], "alive": true, "stunned": 0, "kb": {"x": 0.0, "y": 0.0},
		"poise": hp, "maxPoise": hp, "poiseR": 0, "ib": false, "etype": etype, "room": room, "lv": mon_lv, "s": "idle"}
	e.st2 = float(lit.st2)
	e.facing = float(lit.facing)
	e.elite = elite
	e.mods = mods.duplicate()
	e.aura = lit.get("__aura")
	e.modT = {"regen": 0, "summon": 0, "tp": 0, "chaos": 0, "vortex": 0, "lightning": 0, "twarp": 0, "cloned": false, "revived": false, "split": false, "sentry": 0, "sentryAng": 0, "sentryOn": false, "illusioned": false, "stealthT": 0, "eliteBusy": 0, "eliteCharge": 0, "eliteRing": 0, "eliteBolt": 0, "eliteMortar": 0}
	e.projCd = proj_cd
	e.projT = float(lit.projT)
	e.chargeT = 0
	e.chargeCd = 9999
	e.dropTier = 0
	e.bossPatCd = 9999
	e.bossPatT = float(lit.bossPatT)
	e.shockR = 0
	e.shockMax = 0
	e.deaths = 0
	e.reviveIframes = 0
	e.shieldAng = 0
	e.eShield = hp
	e.eShieldMax = hp
	e.eShieldRegenT = 0
	e.eRes = [0, 0, 0, 0, 0, 0, 0]
	for row in LITERAL_A:
		e[row[0]] = float(lit[row[0]]) if (row[1] as Array).has(etype) else 9999
	e._tpWarnT = 0
	e._tpWarnMax = 30
	e._tpWarnX = 0
	e._tpWarnY = 0
	e._tpWarnCol = "#aa00ff"
	e._swoopOx = 0
	e._swoopOy = 0
	e._homeX = x
	e._homeY = y
	e._splitDone = false
	e._iceOnHit = etype >= 20 and etype <= 29
	e._iceFreeze = 0.35 if (etype >= 20 and etype <= 29) else 0.0
	e._bossOrbitAng = float(lit._bossOrbitAng)
	for row in LITERAL_B:
		e[row[0]] = float(lit[row[0]]) if (row[1] as Array).has(etype) else 9999
	e._erraticAng = float(lit._erraticAng)
	e._spawnT = 20
	# 23296 _assignMobSkin: seed=(etype*7+~~(_homeX*31))&0x7fffffff, idx=seed%40
	var seed: int = (etype * 7 + PREFIX._i32(x * 31.0)) & 0x7fffffff
	var idx: int = seed % 40
	e._mobCh = 1
	e._mob8Col = idx % 8
	e._mob8Row = int(idx / 8)
	e._mob8dir = true
	return e

# ═══ 적 루프 per-enemy 앞부분: 34395–34399(오라/둔화 배율 리셋) + 34446–34456(타이머) ═══
static func outer_prefix(e: Dictionary, sp: float) -> void:
	e._aAtkM = 1
	e._aSpdM = 1
	e._aDefM = 1
	e._auraL = null
	if PREFIX._n(e.get("_webSlow")) > 0: e._aSpdM = PREFIX._n(e._aSpdM) * 0.5
	if PREFIX._n(e.get("_legInjury")) > 0:
		e._legInjury = PREFIX._n(e._legInjury) - sp
		e._aSpdM = PREFIX._n(e._aSpdM) * 0.2
	if PREFIX._n(e.get("_spikeSlow")) > 0:
		e._spikeSlow = PREFIX._n(e._spikeSlow) - sp
		e._aSpdM = PREFIX._n(e._aSpdM) * (1 - PREFIX.spike_trap_slow_pct(e.get("_spikeSlowLv")))
	if PREFIX._n(e.get("_spawnT")) > 0: e._spawnT = PREFIX._n(e._spawnT) - 1
	if PREFIX._n(e.get("stunned")) > 0: e.stunned = PREFIX._n(e.stunned) - sp
	if PREFIX._n(e.get("_hitStun")) > 0: e._hitStun = PREFIX._n(e._hitStun) - sp
	if PREFIX._n(e.get("_hitFlash")) > 0: e._hitFlash = maxf(0.0, PREFIX._n(e._hitFlash) - sp)
	if PREFIX._n(e.get("_stunImmune")) > 0: e._stunImmune = PREFIX._n(e._stunImmune) - sp
	if PREFIX._n(e.get("_pImmune")) > 0: e._pImmune = PREFIX._n(e._pImmune) - sp
	if PREFIX._n(e.get("stunned")) <= 0 and PREFIX._t(e.get("_maxStunned")):
		e._maxStunned = 0 # 비보스: _poiseReset/idle 강제는 e.ib 일 때만
	if PREFIX._n(e.get("reviveIframes")) > 0: e.reviveIframes = maxf(0.0, PREFIX._n(e.reviveIframes) - sp)

# ═══ updateE(e,sp) 비보스 G 경로 ═══
## 반환 {status:"READY"|"NOT_READY", exit, reason}. NOT_READY 이면 그 틱의 원문 진행이 그 지점에서 멈췄다.
static func update_e(e: Dictionary, sp: float, env: Object) -> Dictionary:
	if e.get("ib") == true or not G_TYPES.has(int(PREFIX._n(e.get("etype")))):
		return _nr("G_domain_required")
	if int(PREFIX._n(e.get("elite"))) != 0 or (e.get("mods") is Array and not (e.mods as Array).is_empty()):
		return _nr("unported_branch_active:elite_mods")
	var etype: int = int(PREFIX._n(e.etype))
	# 38587 레슨 적(_lessonEnemy) — 이 계열 생성자는 만들지 않는다.
	# 38589
	if PREFIX._n(e.get("_telegraphT")) > 0:
		e._telegraphT = PREFIX._n(e._telegraphT) - sp
		e._telegraphR = PREFIX._n(e.r) + 20
	# 38591 _pushOutWall(_canMvTile)
	if not env.pf_tile_free(PREFIX._n(e.x), PREFIX._n(e.y), PREFIX._n(e.r)):
		PREFIX._push_out_wall(e, env)
	if PREFIX._n(e.get("reviveIframes")) > 0: e.reviveIframes = maxf(0.0, PREFIX._n(e.reviveIframes) - sp)
	if PREFIX._n(e.get("_cursed")) > 0: e._cursed = PREFIX._n(e._cursed) - sp
	if PREFIX._n(e.get("_shockT")) > 0:
		e._shockT = PREFIX._n(e._shockT) - sp
		if e._shockT <= 0:
			e._shockT = 0
			e._shockStk = 0
	# 38595–38616 넉백·균열·벽 충돌
	var kb: Dictionary = e.kb
	if absf(PREFIX._n(kb.x)) > 0.1 or absf(PREFIX._n(kb.y)) > 0.1:
		var nx: float = PREFIX._n(e.x) + PREFIX._n(kb.x) * sp
		var ny: float = PREFIX._n(e.y) + PREFIX._n(kb.y) * sp
		if env.pf_can_move(nx, ny, PREFIX._n(e.r)):
			e.x = nx
			e.y = ny
			var rifts: Array = env.pf_rifts()
			if rifts.size() > 0:
				var spd2: float = sqrt(PREFIX._n(kb.x) * PREFIX._n(kb.x) + PREFIX._n(kb.y) * PREFIX._n(kb.y))
				if spd2 > 2:
					for rf in rifts:
						var rd: float = PREFIX._dst(PREFIX._n(e.x), PREFIX._n(e.y), PREFIX._n(rf.x), PREFIX._n(rf.y))
						var rift_r: float = 15 + minf(1.0, PREFIX._n(rf.t) / PREFIX._n(rf.maxT)) * 20
						if rd < rift_r + PREFIX._n(e.r):
							var cr: int = PREFIX._i32(spd2 * 4)
							env.g_hurt_self(e, cr, 38604)
							env.g_text(e.x, PREFIX._n(e.y) - 18, env.g_tr("균열 충돌! ") + str(cr), "#9933ff", 30)
							env.g_parts(e.x, e.y, "#aa44ff", 8)
							env.g_sfx("block", [])
							env.g_shake(6)
							kb.x = 0.0
							kb.y = 0.0
							break
		else:
			var real_wall: bool = env.pf_real_wall(nx, ny)
			var kb_spd: float = sqrt(PREFIX._n(kb.x) * PREFIX._n(kb.x) + PREFIX._n(kb.y) * PREFIX._n(kb.y))
			if real_wall and kb_spd > 2:
				var w_pct: float = minf(0.08, kb_spd * 0.004)
				var wall_dmg: int = maxi(PREFIX._i32(kb_spd * 4), PREFIX._i32(PREFIX._n(e.mhp) * w_pct))
				env.g_hurt_self(e, wall_dmg, 38610)
				env.g_text(e.x, PREFIX._n(e.y) - 18, env.g_tr("벽 충돌! ") + str(wall_dmg), "#cc8844", 30)
				env.g_parts(e.x, e.y, "#aa7744", 8)
				env.g_sfx("block", [])
				env.g_shake(8)
				kb.x = 0.0
				kb.y = 0.0
			else:
				kb.x = 0.0
				kb.y = 0.0
		var decay: float = pow(0.85, sp)
		kb.x = PREFIX._n(kb.x) * decay
		kb.y = PREFIX._n(kb.y) * decay
		if PREFIX._n(e.get("_spikeSlow")) > 0:
			var ss: float = PREFIX.spike_trap_slow_pct(e.get("_spikeSlowLv"))
			kb.x = PREFIX._n(kb.x) * (1 - ss)
			kb.y = PREFIX._n(kb.y) * (1 - ss)
	if not e.get("alive", false):
		return _ok("dead_after_self_hurt") # hurtE 가 이 틱 안에서 사망을 확정하면 이후 원문은 같은 객체로 진행하나 렌더/루프는 alive 를 본다
	if PREFIX._n(e.get("_bluHitCD")) > 0: e._bluHitCD = PREFIX._n(e._bluHitCD) - sp
	# 38619
	if PREFIX._n(e.get("_hitStun")) > 0:
		return _ok("hitstun")
	# 38620–38637 스턴
	if PREFIX._n(e.get("stunned")) > 0:
		PREFIX._cancel_proj_charge(e)
		if PREFIX._n(e.stunned) > 180: e.stunned = 180
		if not PREFIX._t(e.get("_maxStunned")) or PREFIX._n(e._maxStunned) < PREFIX._n(e.stunned): e._maxStunned = e.stunned
		return _ok("stunned")
	# 38639–38643 이동 판정
	var prev_x: float = PREFIX._n(e._prevX) if PREFIX._t(e.get("_prevX")) else PREFIX._n(e.x)
	var prev_y: float = PREFIX._n(e._prevY) if PREFIX._t(e.get("_prevY")) else PREFIX._n(e.y)
	var mdx: float = PREFIX._n(e.x) - prev_x
	var mdy: float = PREFIX._n(e.y) - prev_y
	if mdx * mdx + mdy * mdy > 0.25:
		e._isMoving = true
		e._moveHold = 3
		e._moveAng = atan2(mdy, mdx)
	elif PREFIX._n(e.get("_moveHold")) > 0:
		e._moveHold = PREFIX._n(e._moveHold) - sp
	else:
		e._isMoving = false
	e._prevX = e.x
	e._prevY = e.y
	# 38645–38651 빙결
	if PREFIX._n(e.get("_frozen")) > 0:
		PREFIX._cancel_proj_charge(e)
		e._frozen = PREFIX._n(e._frozen) - sp
		if e._frozen <= 0:
			e._frozen = 0
			e._freezeGauge = 0
			e._frozenImmune = 120
		return _ok("frozen")
	# 38652–38660
	if PREFIX._n(e.get("_webSlow")) > 0: e._webSlow = PREFIX._n(e._webSlow) - sp
	if PREFIX._n(e.get("_frozenImmune")) > 0: e._frozenImmune = PREFIX._n(e._frozenImmune) - sp
	if PREFIX._n(e.get("_iceResDown")) > 0: e._iceResDown = PREFIX._n(e._iceResDown) - sp
	if PREFIX._n(e.get("_iceShardRes")) > 0:
		e._iceShardRes = PREFIX._n(e._iceShardRes) - 0.002 * sp
		if e._iceShardRes < 0: e._iceShardRes = 0
	if PREFIX._n(e.get("_weakT")) > 0:
		e._weakT = PREFIX._n(e._weakT) - sp
		if e._weakT <= 0:
			e._weakPhys = 0
			e._weakMag = 0
			e._weakPj = 0
	if PREFIX._n(e.get("_shockDRT")) > 0:
		e._shockDRT = PREFIX._n(e._shockDRT) - sp
		if e._shockDRT <= 0: e._shockDR = 0
	if PREFIX._n(e.get("_blinkWeakT")) > 0:
		e._blinkWeakT = PREFIX._n(e._blinkWeakT) - sp
		if e._blinkWeakT <= 0: e._blinkWeak = 0
	if PREFIX._n(e.get("_freezeGauge")) > 0: e._freezeGauge = maxf(0.0, PREFIX._n(e._freezeGauge) - sp * 0.3)
	# 38664–38667 포이즈 자연회복(비보스)
	if PREFIX._n(e.poise) < PREFIX._n(e.maxPoise):
		e.poiseR = PREFIX._n(e.get("poiseR")) + sp
		if PREFIX._n(e.poiseR) >= 200:
			e.poise = minf(PREFIX._n(e.maxPoise), PREFIX._n(e.poise) + PREFIX._i32(PREFIX._n(e.maxPoise) * 0.15))
			e.poiseR = 0
	var p: Dictionary = env.g_p()
	var d: float = PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y))
	# 38669–38677 몬스터 이동 사운드
	if d < 1000 and not PREFIX._t(e.get("stunned")) and not PREFIX._t(e.get("_frozen")):
		if not PREFIX._t(e.get("_mSfxCd")): e._mSfxCd = 0
		if PREFIX._n(e._mSfxCd) <= 0:
			if env.pf_msfx_playing() < 3:
				var msk: Variant = MOVE_SFX.get(etype)
				if msk != null:
					var vol: float = maxf(0.03, 0.35 * (1 - d / 1000.0))
					var key: String = str(msk)
					if key == "monster_crawl" and env.g_rand() < 0.5: key = "monster_crawl1"
					var pitch: float = 1.0 * (1.0 + (env.g_rand() - 0.5) * 2.0 * 0.15) # _r(1,.15) 12463
					env.g_play_sample(key, vol, pitch)
					e._mSfxCd = 60 + PREFIX._i32(env.g_rand() * 60)
					env.pf_msfx_inc()
		else:
			e._mSfxCd = PREFIX._n(e._mSfxCd) - sp
	var s: String = str(e.s)
	# 38679–38682 부활 어그로
	if PREFIX._t(e.get("_reviveChase")) and d > 200 and (s == "idle" or s == "recover"):
		PREFIX._ff_move(e, p, sp, 2.0, env)
		d = PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y))
		if d <= 200: e._reviveChase = false
	# 38684 시야 어그로
	if not PREFIX._t(e.get("_alerted")) and d < 800 and (s == "idle" or s == "recover") and env.pf_los(PREFIX._n(e.x), PREFIX._n(e.y), PREFIX._n(p.x), PREFIX._n(p.y)):
		e._alerted = true
	# 38686–38687 방향 추적(드루이드 조준 고정은 보스 전용)
	if d < 800 and PREFIX._t(e.get("_alerted")):
		e.facing = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
	# 38689–38710 사거리별 추적
	if PREFIX._t(e.get("_alerted")) and (s == "idle" or s == "recover"):
		var e_rng: float = float(RANGE.get(etype, 600))
		if e_rng <= 400:
			if d > 30:
				PREFIX._ff_move(e, p, sp, 1.0, env)
				d = PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y))
		else:
			var ideal_min: float = e_rng * 0.65
			var ideal_max: float = e_rng * 0.85
			if d > ideal_max:
				PREFIX._ff_move(e, p, sp, 1.0, env)
				d = PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y))
			elif d < ideal_min and d > 30:
				var b_ang: float = atan2(PREFIX._n(e.y) - PREFIX._n(p.y), PREFIX._n(e.x) - PREFIX._n(p.x))
				var b_spd: float = PREFIX._n(e.speed) * 1.0 * sp * 0.5
				var bnx: float = PREFIX._n(e.x) + cos(b_ang) * b_spd
				var bny: float = PREFIX._n(e.y) + sin(b_ang) * b_spd
				if not env.g_is_w(bnx, bny):
					e.x = bnx
					e.y = bny
					d = PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y))
	# 38712 회전참 스택
	if PREFIX._n(e.get("_wwStk")) > 0:
		if PREFIX._n(e.get("_wwStkT")) > 0: e._wwStkT = PREFIX._n(e._wwStkT) - sp
		else: e._wwStk = maxf(0.0, PREFIX._n(e._wwStk) - PREFIX._i32(3 * sp / 60.0))
	# 38714–38722 약점노출
	if PREFIX._n(e.get("_comboStk")) > 0:
		if not PREFIX._t(e.get("_comboHitT")): e._comboHitT = 0
		e._comboHitT = PREFIX._n(e._comboHitT) + sp
		if e._comboHitT >= 300:
			e._comboStk = 0
			e._comboHitT = 0
		elif e._comboHitT >= 60:
			if not PREFIX._t(e.get("_comboDecayT")): e._comboDecayT = 0
			e._comboDecayT = PREFIX._n(e._comboDecayT) + sp
			if e._comboDecayT >= 60:
				e._comboDecayT = PREFIX._n(e._comboDecayT) - 60
				e._comboStk = maxf(0.0, PREFIX._n(e._comboStk) - maxf(1.0, PREFIX._i32(PREFIX._n(e._comboStk) * 0.20)))
	# 38726–38770 DOT 풀(출혈/중독/화상/냉기/악의사냥): 해당 적 DOT 은 각 기술 owner 가 소유 — 이 record 에서 활성이면 정지.
	for key in UNPORTED_DOT_FIELDS:
		if PREFIX._n(e.get(key)) > 0:
			return _nr("unported_branch_active:dot_" + key)
	if PREFIX._n(e.get("_hrMarkT")) > 0:
		e._hrMarkT = PREFIX._n(e._hrMarkT) - sp
		if e._hrMarkT <= 0:
			e._hrMark = 0
			e._hrMarkT = 0
	if PREFIX._n(e.get("_bbStkT")) > 0:
		e._bbStkT = PREFIX._n(e._bbStkT) - sp
		if e._bbStkT <= 0:
			e._bbStk = 0
			e._bbStkT = 0
	# 38773 매 프레임 ATK 리셋
	e.atk = e.baseAtk
	if PREFIX._n(e.get("_tpFlashT")) > 0: e._tpFlashT = PREFIX._n(e._tpFlashT) - sp
	# 38776–38873 엘리트 모디파이어: mods=[] (진입부 확인)
	# 38875 오라 ATK(34395 가 매 프레임 1 을 쓴다)
	if e.get("_aAtkM") != 1 and e.get("_aAtkM") != 1.0:
		e.atk = PREFIX._i32(PREFIX._n(e.atk) * PREFIX._n_nan(e.get("_aAtkM")))
	# 38877–38883
	var chg_commit: bool = s == "eChargeWind" or s == "eCharge"
	if PREFIX._n(e.get("_projChargeT")) > 0:
		e._projChargeT = PREFIX._n(e._projChargeT) - sp
		if e._projChargeT <= 0:
			_fire_charged_proj(e, env)
	if not chg_commit:
		if not PREFIX._t(e.get("_alerted")) and d > 400: return _ok("far_unalerted")
		if PREFIX._n(p.get("iframes")) > 0 and not PREFIX._t(e.get("_alerted")) and d > 400: return _ok("far_iframes")
	# 38884
	var fd0: Variant = env.pf_ff_dir(PREFIX._n(e.x), PREFIX._n(e.y))
	e._moveAng = atan2(PREFIX._n(fd0.y), PREFIX._n(fd0.x)) if fd0 is Dictionary else atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
	e.st2 = PREFIX._n(e.st2) - sp
	# ── etype 분기(원문 순서: 7 → 13 → 14 → 16 → 17 → 20 → 29 → 47) ──
	var fault: String = ""
	if etype == 7 and str(e.s) == "idle":
		fault = _branch_7(e, sp, d, env)
	if fault.is_empty() and etype == 13 and str(e.s) == "idle":
		e.webT = PREFIX._n(e.webT) - sp
		if PREFIX._n(e.webT) <= 0 and d < 1200 and d > 30:
			var w_a: float = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
			boss_projectile(e, {"x": e.x, "y": e.y, "vx": cos(w_a) * 3, "vy": sin(w_a) * 3, "dmg": PREFIX._i32(PREFIX._n(e.atk) * 0.5), "el": EL_P, "friendly": false, "life": 200, "ml": 200, "col": "#aaaaaa", "sz": 1.2, "web": true}, env)
			e.webT = e.webCd
			env.g_parts(e.x, e.y, "#aaaaaa", 3)
	if fault.is_empty() and etype == 14 and str(e.s) == "idle":
		e.swoopT = PREFIX._n(e.swoopT) - sp
		if PREFIX._n(e.swoopT) <= 0 and d < 1200 and d > 60:
			e._swoopOx = e.x
			e._swoopOy = e.y
			e.s = "eSwoop"
			e.st2 = 18
			e.echDx = cos(PREFIX._n(e.facing))
			e.echDy = sin(PREFIX._n(e.facing))
			e.swoopT = e.swoopCd
			env.g_text(e.x, PREFIX._n(e.y) - 15, "🦅", "#88cc88", 25)
			env.g_sfx("charge", [])
		if d > 60 and d < 1200:
			var orb_a: float = atan2(PREFIX._n(e.y) - PREFIX._n(p.y), PREFIX._n(e.x) - PREFIX._n(p.x)) + 0.04 * sp
			var tx: float = PREFIX._n(p.x) + cos(orb_a) * 150
			var ty: float = PREFIX._n(p.y) + sin(orb_a) * 150
			var to_a: float = atan2(ty - PREFIX._n(e.y), tx - PREFIX._n(e.x))
			var a_spd: float = _aspd(e)
			var onx: float = PREFIX._n(e.x) + cos(to_a) * PREFIX._n(e.speed) * a_spd * sp
			var ony: float = PREFIX._n(e.y) + sin(to_a) * PREFIX._n(e.speed) * a_spd * sp
			if env.pf_can_move(onx, ony, PREFIX._n(e.r)):
				e.x = onx
				e.y = ony
	if fault.is_empty() and etype == 16 and str(e.s) == "idle":
		e.trapT = PREFIX._n(e.trapT) - sp
		if PREFIX._n(e.trapT) <= 0 and d < 250:
			boss_projectile(e, {"x": e.x, "y": e.y, "vx": 0, "vy": 0, "dmg": PREFIX._i32(PREFIX._n(e.atk) * 1.5), "el": e.el, "friendly": false, "life": 600, "ml": 600, "col": "#ff2000", "sz": 0.8, "trap": true}, env)
			env.g_trap_cap(50) # 39025–39026 덫 50개 캡(가장 짧은 life 1개 제거)
			e.trapT = e.trapCd
			env.g_text(e.x, PREFIX._n(e.y) - 10, "⚠", "#ff3a00", 20)
			env.g_parts(e.x, e.y, "#ff6600", 4)
		if d < 100:
			_retreat(e, sp, env)
	if fault.is_empty() and etype == 17 and str(e.s) == "idle":
		fault = _branch_17(e, sp, d, env)
	# 39060 etype20: idle&&d<30+r 블록은 본문 없음.
	if fault.is_empty() and etype == 29 and str(e.s) == "idle":
		_branch_29(e, sp, d, env)
	if fault.is_empty() and etype == 47 and str(e.s) == "idle":
		fault = _branch_47(e, sp, d, env)
	if not fault.is_empty():
		return _nr(fault)
	# 40446–40455 보스/드루이드 전용 분기 미진입(e.ib=false)
	return _switch_state(e, sp, d, env)

static func _aspd(e: Dictionary) -> float:
	return PREFIX._n(e._aSpdM) if PREFIX._t(e.get("_aSpdM")) else 1.0

static func _retreat(e: Dictionary, sp: float, env: Object) -> void:
	var sm: float = PREFIX._n(e.speed) * _aspd(e)
	var nx: float = PREFIX._n(e.x) - cos(PREFIX._n(e.facing)) * sm * sp
	var ny: float = PREFIX._n(e.y) - sin(PREFIX._n(e.facing)) * sm * sp
	if env.pf_can_move(nx, ny, PREFIX._n(e.r)):
		e.x = nx
		e.y = ny

# 38922–38945 리치: 텔레포트 + 소환
static func _branch_7(e: Dictionary, sp: float, d: float, env: Object) -> String:
	e.teleportT = PREFIX._n(e.teleportT) - sp
	e.summonT = PREFIX._n(e.summonT) - sp
	if PREFIX._n(e.get("_tpWarnT")) > 0:
		e._tpWarnT = PREFIX._n(e._tpWarnT) - sp
		if PREFIX._n(e._tpWarnT) <= 0:
			teleport_e(e, PREFIX._n(e._tpWarnX), PREFIX._n(e._tpWarnY), "#8833cc", 12, env)
			e.teleportT = e.teleportCd
			e._tpWarnT = 0
			var p: Dictionary = env.g_p()
			e_proj_at(e, atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x)), 3, 0.8, e.el, 200, "#8833cc", 2, env)
	elif d < 100 and PREFIX._n(e.teleportT) <= 0:
		var p: Dictionary = env.g_p()
		var tp_a: float = env.g_rand() * TAU_
		var tp_d: float = 150 + env.g_rand() * 50
		var tp_x: float = PREFIX._n(p.x) + cos(tp_a) * tp_d
		var tp_y: float = PREFIX._n(p.y) + sin(tp_a) * tp_d
		if env.pf_can_move(tp_x, tp_y, PREFIX._n(e.r)):
			e._tpWarnT = 120
			e._tpWarnMax = 120
			e._tpWarnX = tp_x
			e._tpWarnY = tp_y
			e._tpWarnCol = "#8833cc"
		else:
			e.teleportT = 30
	if PREFIX._n(e.summonT) <= 0:
		var nearby := 0
		for oe in env.g_sh_query(PREFIX._n(e.x), PREFIX._n(e.y), 200):
			if not is_same(oe, e) and PREFIX._dst(PREFIX._n(oe.x), PREFIX._n(oe.y), PREFIX._n(e.x), PREFIX._n(e.y)) < 200:
				nearby += 1
		if nearby < 4:
			e.s = "eSummon"
			e.st2 = 40
			env.g_text(e.x, PREFIX._n(e.y) - 15, env.g_tr("💀소환!"), "#8833cc", 35)
		else:
			e.summonT = 60
	return ""

# 39033–39050 모체: 거미사도 2~3 소환
static func _branch_17(e: Dictionary, sp: float, d: float, env: Object) -> String:
	e.motherT = PREFIX._n(e.motherT) - sp
	if PREFIX._n(e.motherT) <= 0:
		var near_cnt: int = env.g_sh_query(PREFIX._n(e.x), PREFIX._n(e.y), 200).size()
		if near_cnt < 8:
			var cnt: int = 2 + PREFIX._i32(env.g_rand() * 2)
			for mi in range(cnt):
				var a: float = PI * 2 * mi / cnt
				var sx: float = PREFIX._n(e.x) + cos(a) * 25
				var sy: float = PREFIX._n(e.y) + sin(a) * 25
				if env.pf_can_move(sx, sy, 6):
					var made: Variant = env.g_summon(e, 13, sx, sy, e.el, e.get("room"), {})
					if made is Dictionary and made.has("__fault"):
						return str(made.__fault)
			env.g_text(e.x, PREFIX._n(e.y) - 15, env.g_tr("🕷산란!"), "#6b2a2a", 35)
			env.g_parts(e.x, e.y, "#6b2a2a", 10)
			env.g_sfx("magic", [3])
			e.motherT = e.motherCd
		else:
			e.motherT = 60
	if d < 150:
		_retreat(e, sp, env)
	return ""

# 39124–39141 빙마(자연 29): 빙결파+8방향 얼음기둥 / 돌진
static func _branch_29(e: Dictionary, sp: float, d: float, env: Object) -> void:
	e._iceSlamT = PREFIX._n(e._iceSlamT) - sp
	if PREFIX._n(e._iceSlamT) <= 0 and d < 120:
		e.s = "eSlamWind"
		e.st2 = 45
		e._iceSlamT = e._iceSlamCd
		env.g_text(e.x, PREFIX._n(e.y) - 20, env.g_tr("💀빙마!"), "#4455aa", 40)
		for ip in range(8):
			var ia: float = PI * 2 * ip / 8
			e_proj_at(e, ia, 3, 1.2, EL_I, 300, "#4455aa", 2, env)
		if d < 100:
			env.g_freeze_slow(120)
			var p: Dictionary = env.g_p()
			env.g_parts(p.x, p.y, "#88ccff", 12)
		env.g_shake(8)
		var p2: Dictionary = env.g_p()
		if PREFIX._dst(PREFIX._n(e.x), PREFIX._n(e.y), PREFIX._n(p2.x), PREFIX._n(p2.y)) < 800: env.g_sfx("groggy", [])
	if d > 150 and d < 1200 and env.g_rand() < 0.008 * sp:
		e.s = "eCharge"
		e.st2 = 25
		e.echDx = cos(PREFIX._n(e.facing))
		e.echDy = sin(PREFIX._n(e.facing))
		env.g_text(e.x, PREFIX._n(e.y) - 15, env.g_tr("돌진!"), "#4455aa", 30)
		env.g_sfx("charge", [])

# 39410–39431 그림자 쌍둥이: 분신(원령 40 생성, ens 미등록) + 텔레포트
static func _branch_47(e: Dictionary, sp: float, d: float, env: Object) -> String:
	e._stCloneT = PREFIX._n(e._stCloneT) - sp
	e._stTpCd = PREFIX._n(e._stTpCd) - sp
	if PREFIX._n(e._stCloneT) <= 0 and env.g_ens_count() < 200:
		e._stCloneT = e._stCloneCd
		var cx: float = PREFIX._n(e.x) + (env.g_rand() - 0.5) * 60
		var cy: float = PREFIX._n(e.y) + (env.g_rand() - 0.5) * 60
		# 39415 mkEn(_cx,_cy,G.stage,40,false,e.el||EL.D,e._ri) — 반환 객체는 ens 에 push 되지 않는다(원문 그대로).
		var clone: Variant = env.g_mk_en_detached(cx, cy, 40, e.el if PREFIX._t(e.get("el")) else EL_D, e.get("_ri"))
		if clone == null:
			return "source_TypeError_clone_null_39416" # 원문 clone.hp=… 가 null 에서 예외 — 이 틱 updateE 중단
		env.g_text(e.x, PREFIX._n(e.y) - 15, env.g_tr("분신!"), "#cc44ff", 25)
		env.g_parts(e.x, e.y, "#cc44ff", 6)
	if PREFIX._n(e.get("_tpWarnT")) > 0:
		e._tpWarnT = PREFIX._n(e._tpWarnT) - sp
		if PREFIX._n(e._tpWarnT) <= 0:
			teleport_e(e, PREFIX._n(e._tpWarnX), PREFIX._n(e._tpWarnY), "#cc44ff", 4, env)
			e._stTpCd = 120 + env.g_rand() * 40
			e._tpWarnT = 0
	elif PREFIX._n(e._stTpCd) <= 0 and d < 1200 and d > 60:
		var p: Dictionary = env.g_p()
		var ta: float = env.g_rand() * TAU_
		var td: float = 60 + env.g_rand() * 40
		var nx: float = PREFIX._n(p.x) + cos(ta) * td
		var ny: float = PREFIX._n(p.y) + sin(ta) * td
		if env.pf_can_move(nx, ny, PREFIX._n(e.r)):
			e._tpWarnT = 120
			e._tpWarnMax = 120
			e._tpWarnX = nx
			e._tpWarnY = ny
			e._tpWarnCol = "#cc44ff"
		else:
			e._stTpCd = 30
	return ""

# ═══ switch(e.s) 40458– ═══
static func _switch_state(e: Dictionary, sp: float, d: float, env: Object) -> Dictionary:
	var etype: int = int(e.etype)
	var p: Dictionary = env.g_p()
	match str(e.s):
		"idle":
			if etype == 6 and PREFIX._t(e.get("_escorting")):
				pass
			elif etype == 14 or etype == 27 or etype == 66:
				pass
			elif KEEP_DISTANCE.has(etype):
				if d < 80:
					var as1: float = PREFIX._n(e.speed) * 0.6 * _aspd(e)
					var nx1: float = PREFIX._n(e.x) - cos(PREFIX._n(e.facing)) * as1 * sp
					var ny1: float = PREFIX._n(e.y) - sin(PREFIX._n(e.facing)) * as1 * sp
					if env.pf_can_move(nx1, ny1, PREFIX._n(e.r)):
						e.x = nx1
						e.y = ny1
				elif d > 200:
					var as2: float = PREFIX._n(e.speed) * 1.2 * _aspd(e)
					var nx2: float = PREFIX._n(e.x) + cos(PREFIX._n(e.facing)) * as2 * sp
					var ny2: float = PREFIX._n(e.y) + sin(PREFIX._n(e.facing)) * as2 * sp
					if env.pf_can_move(nx2, ny2, PREFIX._n(e.r)):
						e.x = nx2
						e.y = ny2
			else:
				var atk_rng: float = (PREFIX._n(e.r) if PREFIX._t(e.get("r")) else 14.0) + 35
				var tickets: int = env.g_atk_tickets()
				var max_tickets: int = env.g_max_atk_tickets()
				if not PREFIX._t(e.get("_hasAtkTicket")) and tickets >= max_tickets and d < 200 and d > PREFIX._n(e.r) + PREFIX._n(p.r) + 10:
					if not PREFIX._t(e.get("_strafeDir")) or env.g_rand() < 0.004 * sp:
						e._strafeDir = 1 if env.g_rand() < 0.5 else -1
					var to_p: float = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
					var side: float = to_p + PI / 2 * PREFIX._n(e._strafeDir)
					var sv: float = PREFIX._n(e.speed) * _aspd(e) * sp * 0.7
					var snx: float = PREFIX._n(e.x) + cos(side) * sv
					var sny: float = PREFIX._n(e.y) + sin(side) * sv
					if env.pf_can_move(snx, sny, PREFIX._n(e.r)):
						e.x = snx
						e.y = sny
					else:
						e._strafeDir = PREFIX._n(e._strafeDir) * -1
				elif d < atk_rng * 2.5 and not PREFIX._t(e.get("_hasAtkTicket")) and tickets >= max_tickets:
					if not PREFIX._t(e.get("_circleDir")): e._circleDir = 1 if env.g_rand() < 0.5 else -1
					e.s = "eCircle"
					e._circleRetryT = 20 + env.g_rand() * 20
				else:
					var as3: float = PREFIX._n(e.speed) * 1.6 * _aspd(e)
					var nx3: float = PREFIX._n(e.x) + cos(PREFIX._n(e.facing)) * as3 * sp
					var ny3: float = PREFIX._n(e.y) + sin(PREFIX._n(e.facing)) * as3 * sp
					if env.pf_can_move(nx3, ny3, PREFIX._n(e.r)):
						e.x = nx3
						e.y = ny3
			# 40491–40501 분리력
			if str(e.s) == "idle" and PREFIX._n(e.get("_sepCd")) <= 0:
				var sx := 0.0
				var sy := 0.0
				for oe in env.g_sh_query(PREFIX._n(e.x), PREFIX._n(e.y), PREFIX._n(e.r) * 4.4):
					if is_same(oe, e) or not PREFIX._t(oe.get("alive")):
						continue
					var odx: float = PREFIX._n(e.x) - PREFIX._n(oe.x)
					var ody: float = PREFIX._n(e.y) - PREFIX._n(oe.y)
					var od2: float = odx * odx + ody * ody
					var min_d: float = PREFIX._n(e.r) + PREFIX._n(oe.r) + 4
					if od2 < min_d * min_d and od2 > 0.01:
						var od: float = sqrt(od2)
						var force: float = (min_d - od) / min_d
						sx += odx / od * force * 1.5
						sy += ody / od * force * 1.5
				if sx != 0 or sy != 0:
					var snx2: float = PREFIX._n(e.x) + sx * sp
					var sny2: float = PREFIX._n(e.y) + sy * sp
					if env.pf_can_move(snx2, sny2, PREFIX._n(e.r)):
						e.x = snx2
						e.y = sny2
				e._sepCd = 3
			elif PREFIX._n(e.get("_sepCd")) > 0:
				e._sepCd = PREFIX._n(e._sepCd) - sp
			# 40503–40507 근접 접촉(이 계열 etype 은 _meleeET 밖)
			if MELEE_ET.has(etype) and d < PREFIX._n(e.r) + PREFIX._n(p.r) + 8 and PREFIX._n(p.iframes) <= 0 and PREFIX._n(e.st2) <= 0:
				env.g_hurt_p(PREFIX._i32(PREFIX._n(e.atk) * 0.8), {})
				env.g_parts(p.x, p.y, e.col, 4)
				e.st2 = 40 + PREFIX._i32(env.g_rand() * 20)
			# 40509 비보스 공통 탄막 복구
			if PREFIX._n(e.projCd) >= 9000 and not NO_PROJ.has(etype):
				e.projCd = 240
				e.projT = 180 + env.g_rand() * 120
			# 40511–40523 차징 시작
			if PREFIX._n(e.projCd) < 9000:
				if not (PREFIX._n(e.get("_projChargeT")) > 0):
					e.projT = PREFIX._n(e.projT) - sp
					var e_range: float = float(RANGE.get(etype, 700))
					if PREFIX._n(e.projT) <= 0 and d < e_range:
						e.projT = e.projCd
						var el: Variant = e.get("el")
						var bean: String = "dark" if el == EL_D else "water" if el == EL_I else "fire" if el == EL_F else "normal"
						e._projChargeBean = bean
						e._projChargeCol = "#a44cff" if bean == "dark" else "#317cec" if bean == "water" else "#ff2e22" if bean == "fire" else _elc_or(el, str(e.col))
						e._projChargeParryClass = "physical" if el == EL_P else "magic"
						e._projChargeT = 60
		"eCharge":
			var spd: float = (PREFIX._n(e._chgSpd) if PREFIX._t(e.get("_chgSpd")) else 5.0) * sp
			var ox: float = PREFIX._n(e.x)
			var oy: float = PREFIX._n(e.y)
			var cnx: float = ox + PREFIX._n(e.echDx) * spd
			var cny: float = oy + PREFIX._n(e.echDy) * spd
			if env.pf_can_move(cnx, cny, PREFIX._n(e.r)):
				e.x = cnx
				e.y = cny
			else:
				e.s = "recover"
				e.st2 = 30
				return _ok("switch")
			var sgx: float = PREFIX._n(e.x) - ox
			var sgy: float = PREFIX._n(e.y) - oy
			var sl2: float = sgx * sgx + sgy * sgy
			var st: float = ((PREFIX._n(p.x) - ox) * sgx + (PREFIX._n(p.y) - oy) * sgy) / sl2 if sl2 > 0 else 0.0
			st = clampf(st, 0.0, 1.0)
			var scx: float = ox + sgx * st
			var scy: float = oy + sgy * st
			if PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), scx, scy) < PREFIX._n(p.r) + PREFIX._n(e.r) + 18 and PREFIX._n(p.iframes) <= 0:
				if env.g_is_p_win():
					env.g_parry(e, PREFIX._n(e.atk) if PREFIX._t(e.get("atk")) else 10.0)
					env.g_text(p.x, PREFIX._n(p.y) - 25, env.g_tr("⚡패링!"), "#ffdd00", 35)
					env.g_do_parry(e)
					env.g_poise_hit(e, 20)
				elif str(p.get("s", "")) != "charge":
					env.g_hurt_p(PREFIX._i32(PREFIX._n(e.atk) * 30 * env.g_el_mul(e.get("el"))), {})
					e_mod_hit_p(e, env)
					var ang: float = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
					env.g_kb_p(cos(ang) * 100, sin(ang) * 100)
					env.g_present("_addBoom", [p.x, p.y, 80, 48, "fire_medium"])
					env.g_present("bigImpact", [p.x, p.y, EL_F, ang])
					env.g_shake(10)
					env.g_sfx("detonate", [])
				e.s = "recover"
				e.st2 = 30
				return _ok("switch")
			if env.g_rand() > 0.5:
				env.g_pool_part(PREFIX._n(e.x) + (env.g_rand() - 0.5) * 6, PREFIX._n(e.y) + (env.g_rand() - 0.5) * 6, -PREFIX._n(e.echDx) * 2, -PREFIX._n(e.echDy) * 2, e.col, 3, 8)
			if PREFIX._n(e.st2) <= 0:
				e.s = "recover"
				e.st2 = 30
		"eSwoop":
			var sspd: float = 6 * sp
			var wnx: float = PREFIX._n(e.x) + PREFIX._n(e.echDx) * sspd
			var wny: float = PREFIX._n(e.y) + PREFIX._n(e.echDy) * sspd
			if env.pf_can_move(wnx, wny, PREFIX._n(e.r)):
				e.x = wnx
				e.y = wny
			else:
				e.s = "recover"
				e.st2 = 25
				return _ok("switch")
			if PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y)) < PREFIX._n(p.r) + PREFIX._n(e.r) + 8 and PREFIX._n(p.iframes) <= 0:
				if env.g_is_p_win():
					env.g_parry(e, PREFIX._n(e.atk) if PREFIX._t(e.get("atk")) else 10.0)
					env.g_text(p.x, PREFIX._n(p.y) - 25, env.g_tr("⚡패링!"), "#ffdd00", 35)
					env.g_do_parry(e)
					env.g_poise_hit(e, 20)
				elif str(p.get("s", "")) != "charge":
					env.g_hurt_p(PREFIX._i32(PREFIX._n(e.atk) * 1.8 * env.g_el_mul(e.get("el"))), {})
					e_mod_hit_p(e, env)
					var ang2: float = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
					env.g_kb_p(cos(ang2) * 6, sin(ang2) * 6)
				e.s = "recover"
				e.st2 = 35
				return _ok("switch")
			if env.g_rand() > 0.4:
				env.g_pool_part(PREFIX._n(e.x) + (env.g_rand() - 0.5) * 8, PREFIX._n(e.y) + (env.g_rand() - 0.5) * 8, 0, 0, e.col, 3, 6)
			if PREFIX._n(e.st2) <= 0:
				e.s = "recover"
				e.st2 = 35
		"eSlamWind":
			if PREFIX._n(e.st2) <= 0:
				var s_r: float = 70 + PREFIX._n(e.r)
				if PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y)) < s_r and PREFIX._n(p.iframes) <= 0 and str(p.get("s", "")) != "charge":
					env.g_hurt_p(PREFIX._i32(PREFIX._n(e.atk) * 2 * env.g_el_mul(e.get("el"))), {})
					var ang3: float = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
					env.g_kb_p(cos(ang3) * 10, sin(ang3) * 10)
				for oe in env.g_sh_query(PREFIX._n(e.x), PREFIX._n(e.y), s_r):
					if not is_same(oe, e) and PREFIX._t(oe.get("alive")) and PREFIX._dst(PREFIX._n(oe.x), PREFIX._n(oe.y), PREFIX._n(e.x), PREFIX._n(e.y)) < s_r:
						var oa: float = atan2(PREFIX._n(oe.y) - PREFIX._n(e.y), PREFIX._n(oe.x) - PREFIX._n(e.x))
						env.g_kb_enemy(oe, cos(oa) * 6, sin(oa) * 6)
				env.g_parts(e.x, e.y, e.col, 20)
				env.g_shake(8)
				env.g_sfx("groggy", [])
				e.shockR = 0
				e.shockMax = s_r
				e.s = "recover"
				e.st2 = 50
		"eSummon":
			var sum_col: String = "#8b3a3a" if etype == 11 else "#8833cc"
			if env.g_rand() > 0.5:
				env.g_pool_part(PREFIX._n(e.x) + (env.g_rand() - 0.5) * 20, PREFIX._n(e.y) + (env.g_rand() - 0.5) * 20, 0, -1.5, sum_col, 2 + env.g_rand() * 2, 12)
			if PREFIX._n(e.st2) <= 0:
				var cnt: int = (2 + PREFIX._i32(env.g_rand() * 2)) if etype == 11 else (1 + PREFIX._i32(env.g_rand() * 2))
				for si in range(cnt):
					var a: float = PI * 2 * si / cnt + env.g_rand()
					var sd: float = 30 + env.g_rand() * 20
					var sx2: float = PREFIX._n(e.x) + cos(a) * sd
					var sy2: float = PREFIX._n(e.y) + sin(a) * sd
					var el2: int = [EL_P, EL_F, EL_I, EL_D, 4, 5][PREFIX._i32(env.g_rand() * 6)]
					var made: Variant = env.g_summon(e, 3, sx2, sy2, el2, e.get("room"), {"hp_half_shield_zero": true})
					if made == null:
						return _nr("source_TypeError_summon_null_40792") # 원문 ne.hp=… 가 null 에서 예외 — 이 틱 updateE 중단
					if made is Dictionary and made.has("__fault"):
						return _nr(str(made.__fault))
					env.g_parts(sx2, sy2, sum_col, 8)
				env.g_text(e.x, PREFIX._n(e.y) - 20, str(cnt) + env.g_l("체 소환!", " Summoned!"), sum_col, 35)
				env.g_sfx("charge", [])
				if etype == 11: e.wombT = e.wombCd
				else: e.summonT = e.summonCd
				e.s = "recover"
				e.st2 = 50
		"windup":
			if PREFIX._n(e.st2) <= 0:
				e.s = "attack"
				e.st2 = 5 if etype == 3 else 8
		"attack":
			if PREFIX._n(e.st2) <= 5 and PREFIX._n(e.st2) + sp > 5:
				var m_ang: float = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
				var m: Array = e_mouth_xy(e, m_ang)
				boss_projectile(e, {"x": m[0], "y": m[1], "vx": cos(m_ang) * 4, "vy": sin(m_ang) * 4, "dmg": PREFIX._i32(PREFIX._n(e.atk) * 1.0), "el": e.get("el"), "friendly": false, "life": 60, "ml": 60, "col": _elc_or(e.get("el"), str(e.col)), "sz": 2.0}, env)
				env.g_parts(e.x, e.y, e.col if PREFIX._t(e.get("col")) else "#ffaa00", 3)
			if PREFIX._n(e.st2) <= 0:
				e.s = "recover"
				e.st2 = 35
		"recover":
			env.g_atk_ticket_release(e)
			if PREFIX._n(e.st2) <= 0:
				e.s = "idle"
				e.st2 = 15 + env.g_rand() * 15
		"eCircle":
			if not PREFIX._t(e.get("_circleAng")): e._circleAng = atan2(PREFIX._n(e.y) - PREFIX._n(p.y), PREFIX._n(e.x) - PREFIX._n(p.x))
			var c_dir: float = PREFIX._n(e._circleDir) if PREFIX._t(e.get("_circleDir")) else 1.0
			e._circleAng = PREFIX._n(e._circleAng) + c_dir * 0.018 * sp
			var orbit_r: float = 90 + PREFIX._n(e.r)
			var tx2: float = PREFIX._n(p.x) + cos(PREFIX._n(e._circleAng)) * orbit_r
			var ty2: float = PREFIX._n(p.y) + sin(PREFIX._n(e._circleAng)) * orbit_r
			var to_tx: float = atan2(ty2 - PREFIX._n(e.y), tx2 - PREFIX._n(e.x))
			var o_spd: float = PREFIX._n(e.speed) * 0.75 * _aspd(e) * sp
			var cnx2: float = PREFIX._n(e.x) + cos(to_tx) * o_spd
			var cny2: float = PREFIX._n(e.y) + sin(to_tx) * o_spd
			if env.pf_can_move(cnx2, cny2, PREFIX._n(e.r)):
				e.x = cnx2
				e.y = cny2
			e.facing = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
			e._circleRetryT = (PREFIX._n(e._circleRetryT) if PREFIX._t(e.get("_circleRetryT")) else 0.0) - sp
			if PREFIX._n(e._circleRetryT) <= 0:
				e._circleRetryT = 30 + env.g_rand() * 30
				if env.g_atk_ticket_request(e):
					e.s = "idle"
					e.st2 = 0
			if PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), PREFIX._n(e.x), PREFIX._n(e.y)) < PREFIX._n(e.r) + 30 and env.g_atk_ticket_request(e):
				e._telegraphT = 20
				e.s = "windup"
				e.st2 = 35
	return _ok("switch")

# ═══ 20008 teleportE(e,nx,ny,col,n) ═══
static func teleport_e(e: Dictionary, nx: float, ny: float, col: String, _n_arg: int, env: Object) -> bool:
	if not env.pf_can_move(nx, ny, PREFIX._n(e.r)):
		return false
	var ox: float = PREFIX._n(e.x)
	var oy: float = PREFIX._n(e.y)
	var r: float = PREFIX._n(e.r) if PREFIX._t(e.get("r")) else 12.0
	var crgb: Array = _col_rgb(col)
	# 출발지: 흡입 내파
	for i in range(10):
		var a: float = PI * 2 * i / 10
		var d2: float = r * 2.5
		env.g_pool_part(ox + cos(a) * d2, oy + sin(a) * d2, -cos(a) * 5, -sin(a) * 5, col, 2 + env.g_rand() * 2, 8)
	env.g_pool_part(ox, oy, 0, 0, col, r * 1.6, 8, 3, 0, 0)
	env.g_blast_light(ox, oy, r * 3, 8, crgb[0], crgb[1], crgb[2])
	env.g_tp_smoke(ox, oy, r * 4, 18, 0, env.g_rand() * TAU_)
	e.x = nx
	e.y = ny
	# 착지 강타(비보스)
	var p: Dictionary = env.g_p()
	if PREFIX._n(p.iframes) <= 0 and str(p.get("s", "")) != "charge":
		var land_r: float = (r + 10) * 2
		if PREFIX._dst(PREFIX._n(p.x), PREFIX._n(p.y), nx, ny) < land_r + PREFIX._n(p.r):
			env.g_hurt_p(PREFIX._i32(PREFIX._n(e.atk) * 10.5 * env.g_el_mul(e.get("el"))), {})
			e_mod_hit_p(e, env)
			var la: float = atan2(PREFIX._n(p.y) - ny, PREFIX._n(p.x) - nx)
			env.g_kb_p(cos(la) * 120, sin(la) * 120)
			var p_after: Dictionary = env.g_p()
			env.g_text(p_after.x, PREFIX._n(p_after.y) - 25, env.g_tr("충격파!"), col, 30)
	var is_big: bool = r >= 18
	var p_n: int = 18 if is_big else 12
	var ring_r: float = r * 6 if is_big else r * 4.4
	for i in range(p_n):
		var a2: float = PI * 2 * i / p_n
		var spd: float = 10 + env.g_rand() * 12
		var size: float = 2 + env.g_rand() * 3
		var life: float = 12 + PREFIX._i32(env.g_rand() * 6)
		env.g_pool_part(nx, ny, cos(a2) * spd, sin(a2) * spd, "#ffffff" if i % 3 == 0 else col, size, life)
	env.g_pool_part(nx, ny, 0, 0, col, ring_r, 10, 3, 0, 0)
	env.g_pool_part(nx, ny, 0, 0, "#ffffff", ring_r * 0.5, 6, 3, 0, 0)
	for i in range(4):
		var a3: float = PI * 2 * i / 4 + (env.g_rand() - 0.5) * 0.4
		for j in range(1, 4):
			var cd: float = r * 1.6 * j
			env.g_pool_part(nx + cos(a3) * cd, ny + sin(a3) * cd, cos(a3) * (4 + j * 2), sin(a3) * (4 + j * 2), "#ffffff", 1.5 + env.g_rand(), 8 + j * 2)
	env.g_blast_light(nx, ny, r * 10 if is_big else r * 8, 14, crgb[0], crgb[1], crgb[2])
	env.g_shake(8 if is_big else 4)
	e._tpFlashT = 12
	e._tpFlashCol = col
	env.g_tp_impact(nx, ny, r * 4 if is_big else r * 3, 24 if is_big else 18, col)
	env.g_vfx("teleport_burst", nx, ny, r / 8.0 if is_big else r / 12.0, 4, 0, false)
	env.g_tp_smoke(nx, ny, r * 5 if is_big else r * 4, 22, 1, env.g_rand() * TAU_)
	# _addTpBolt(ox,oy,nx,ny,12,col) 지그재그 세그먼트(원문 난수 순서)
	var steps: int = 6 + PREFIX._i32(env.g_rand() * 4)
	var mx: float = (nx - ox) / steps
	var my: float = (ny - oy) / steps
	var segs: Array = [[ox, oy]]
	for s in range(1, steps):
		var off: float = 20 + env.g_rand() * 15
		var pa: float = atan2(ny - oy, nx - ox) + PI / 2
		var sx: float = ox + mx * s + cos(pa) * (off if env.g_rand() > 0.5 else -off)
		var sy: float = oy + my * s + sin(pa) * (off if env.g_rand() > 0.5 else -off)
		segs.append([sx, sy])
	segs.append([nx, ny])
	env.g_tp_bolt(ox, oy, nx, ny, 12, col, segs)
	return true

static func _col_rgb(col: String) -> Array:
	# parseInt(col.slice(1,3),16)||160 등(20010)
	var r: int = col.substr(1, 2).hex_to_int() if col.length() >= 3 else 0
	var g: int = col.substr(3, 2).hex_to_int() if col.length() >= 5 else 0
	var b: int = col.substr(5, 2).hex_to_int() if col.length() >= 7 else 0
	return [r if r != 0 else 160, g if g != 0 else 0, b if b != 0 else 255]

# ═══ 20121 eProjAt(e,ang,spd,dmgMult,el,life,col,sz) ═══
static func e_proj_at(e: Dictionary, ang: float, spd: float, dmg_mult: float, el: Variant, life: float, col: String, sz: float, env: Object) -> void:
	life = PREFIX._i32(life * 1.5)
	var b: Dictionary = bean_roll(el, col, sz, spd, dmg_mult) # e.s==='eShootWind' 분기는 이 계열에 없다
	var m: Array = e_mouth_xy(e, ang)
	var props: Dictionary = {"x": m[0], "y": m[1], "vx": cos(ang) * float(b.spd), "vy": sin(ang) * float(b.spd), "dmg": PREFIX._i32(PREFIX._n(e.atk) * float(b.dmgM)), "el": b.el, "friendly": false,
		"life": 400 if b.get("blackBean", false) else life, "ml": 400 if b.get("blackBean", false) else life, "col": b.col, "sz": b.sz, "_commit": true}
	for key in ["redBean", "blackBean", "bwBean", "gbBean", "homing", "fireMagic", "waterBean", "_closeBean"]:
		if b.has(key): props[key] = b[key]
	env.g_shot(e, props)

# 16942 _spawnBossProjectile(e,props): 비보스·적대·이동탄 → _emitEnemyShot(전조 60), 그 외 spawnProj
static func boss_projectile(e: Dictionary, props: Dictionary, env: Object) -> void:
	props._druidPoison = false # !!(e&&e.ib&&…) — 비보스
	props._druidStraight = false
	props._druidThornVolley = false
	if not props.get("friendly", false) and (PREFIX._t(props.get("vx")) or PREFIX._t(props.get("vy"))):
		env.g_shot(e, props)
	else:
		env.g_proj(e, props)

# _beanRoll(el,col,sz,spd,dmgMult,e)
static func bean_roll(el: Variant, col: String, sz: float, spd: float, dmg_mult: float) -> Dictionary:
	if el == EL_P: return {"el": EL_P, "col": col if not col.is_empty() else "#f4f4f4", "sz": sz if sz != 0 else 1.5, "spd": spd * 1.3, "dmgM": 1.2, "redBean": true, "homing": true}
	if el == EL_D: return {"el": EL_D, "col": "#a44cff", "sz": sz if sz != 0 else 1.6, "spd": spd * 1.1, "dmgM": 1.0, "gbBean": true}
	if el == EL_I: return {"el": EL_I, "col": "#317cec", "sz": sz if sz != 0 else 1.6, "spd": spd * 1.05, "dmgM": 1.2, "waterBean": true, "homing": true}
	if el == EL_F: return {"el": EL_F, "col": col if not col.is_empty() else "#ff2e22", "sz": sz if sz != 0 else 1.6, "spd": spd * 1.05, "dmgM": 1.2, "fireMagic": true, "homing": true}
	return {"el": el, "col": col if not col.is_empty() else _elc_or(el, "#ffaa00"), "sz": sz if sz != 0 else 1.2, "spd": spd, "dmgM": dmg_mult, "homing": false}

# _eMouthXY(e,ang): off=(e.r||12)*.7, cos(ang||e.facing||0)
## [x,y] float64 배열(Vector2 는 float32 라 원문 좌표를 잃는다)
static func e_mouth_xy(e: Dictionary, ang: float) -> Array:
	var off: float = (PREFIX._n(e.r) if PREFIX._t(e.get("r")) else 12.0) * 0.7
	var a: float = ang if ang != 0 else (PREFIX._n(e.facing) if PREFIX._t(e.get("facing")) else 0.0)
	return [PREFIX._n(e.x) + cos(a) * off, PREFIX._n(e.y) + sin(a) * off]

static func _elc_or(el: Variant, fallback: String) -> String:
	if (el is int or el is float) and int(el) >= 0 and int(el) < ELC.size() and float(int(el)) == float(el): return ELC[int(el)]
	return fallback

# ═══ 20124 _fireChargedProj(e) — updateE 가 만드는 bean 만(dark/fire/water/normal) ═══
static func _fire_charged_proj(e: Dictionary, env: Object) -> void:
	var p: Dictionary = env.g_p()
	var aim: float = atan2(PREFIX._n(p.y) - PREFIX._n(e.y), PREFIX._n(p.x) - PREFIX._n(e.x))
	e.facing = aim
	var fb: Variant = e.get("_projChargeBean")
	var p_range: float = float(RANGE.get(int(e.etype), 600))
	var p_life: int = PREFIX._i32(p_range * 0.3)
	var c: float = cos(aim)
	var s: float = sin(aim)
	if fb == "dark":
		env.g_proj(e, {"x": e.x, "y": e.y, "vx": c * 3.3, "vy": s * 3.3, "dmg": PREFIX._i32(PREFIX._n(e.atk) * 1), "el": EL_D, "friendly": false, "life": p_life, "ml": p_life, "col": "#a44cff", "sz": 1.6, "gbBean": true, "_commit": true})
		env.g_parts(e.x, e.y, "#a44cff", 3)
	elif fb == "fire":
		env.g_proj(e, {"x": e.x, "y": e.y, "vx": c * 3.2, "vy": s * 3.2, "dmg": PREFIX._i32(PREFIX._n(e.atk) * 1.2), "el": EL_F, "friendly": false, "life": p_life, "ml": p_life, "col": "#ff2e22", "sz": 1.6, "fireMagic": true, "_commit": true})
		env.g_parts(e.x, e.y, "#ff2e22", 3)
	elif fb == "water":
		env.g_proj(e, {"x": e.x, "y": e.y, "vx": c * 3.2, "vy": s * 3.2, "dmg": PREFIX._i32(PREFIX._n(e.atk) * 1.2), "el": EL_I, "friendly": false, "life": p_life, "ml": p_life, "col": "#317cec", "sz": 1.6, "waterBean": true, "_commit": true})
		env.g_parts(e.x, e.y, "#317cec", 3)
	elif fb == "black" or fb == "red" or fb == "special":
		pass # updateE 는 이 bean 을 만들지 않는다(40515: dark/water/fire/normal 만).
	else:
		env.g_proj(e, {"x": e.x, "y": e.y, "vx": c * 3, "vy": s * 3, "dmg": PREFIX._i32(PREFIX._n(e.atk) * 0.8), "el": e.get("el"), "friendly": false, "life": p_life, "ml": p_life, "col": _elc_or(e.get("el"), str(e.col)), "sz": 1.5, "_commit": true})
		env.g_parts(e.x, e.y, e.col, 2)
	PREFIX._cancel_proj_charge(e)

# ═══ 31100 eModHitP(e) — 31101 `if(!e.mods||!e.mods.length)return;` 가 맨 앞이다 ═══
## 따라서 mods=[] 인 이 계열은 1장 빙결(_iceOnHit 35%)·화상도 발동하지 않는다(원문 그대로). 엘리트 경로는 HOLD.
static func e_mod_hit_p(e: Dictionary, env: Object) -> void:
	if not (e.get("mods") is Array) or (e.mods as Array).is_empty():
		return
	if PREFIX._t(e.get("_iceOnHit")) and env.g_rand() < 0.35:
		env.g_freeze_slow(90)
		var p: Dictionary = env.g_p()
		env.g_text(p.x, PREFIX._n(p.y) - 20, env.g_tr("❄빙결!"), "#88ccff", 25)
		env.g_parts(p.x, p.y, "#88ccff", 6)

static func _ok(exit_: String) -> Dictionary:
	return {"status": "READY", "exit": exit_, "reason": ""}

static func _nr(reason: String) -> Dictionary:
	return {"status": "NOT_READY", "exit": "", "reason": reason}

# ═══ 16913 _projectileParryClass(p) — JS 의미(el undefined → (p.el??EL.P)===EL.P → 'physical') ═══
## 제품 BIRTH/class authority 는 el 을 정수로만 받는다(-1=undefined). 이 계열 탄은 이 값을 parryClass 로 실어 보내
## 원본과 같은 분류(정의되지 않은 원소 탄 = 물리 E 패링, 300px/s 대역)를 유지한다.
static func source_parry_class(p: Dictionary) -> String:
	if p.get("parryClass") is String and not str(p.parryClass).is_empty(): return str(p.parryClass)
	if PREFIX._t(p.get("fbEnergy")) or PREFIX._t(p.get("fdEnergy")): return "magic"
	if PREFIX._t(p.get("mine")) or PREFIX._t(p.get("trap")): return "magic"
	if PREFIX._t(p.get("blackBean")): return "magic"
	for k in ["friendly", "noParry", "bomb", "web", "poisonZone", "iceZone", "blizzard", "dimRift", "elemBall", "_coralSpike"]:
		if PREFIX._t(p.get(k)): return "forbidden"
	for k in ["gbBean", "blueBean", "fireMagic", "waterBean"]:
		if PREFIX._t(p.get(k)): return "magic"
	if PREFIX._t(p.get("titanEye")) or PREFIX._t(p.get("bwBean")): return "physical"
	var el: Variant = p.get("el")
	return "physical" if (el == null or el == EL_P) else "magic"
