extends RefCounted
## PC-BOSS-CORE (2026-10-22) — 1-1 보스(ib, si0, 비피날레) 사망 판정 순수 실행자.
##   immediate(e,p,env)     game.html 42515–42624  1차 즉시 부활(확률+부활력 포인트)
##   fallback_reserve(e,env) 42641–42649            2차 폴백 예약(_reviveTimer=180)
##   fallback_tick(e,sp,env) 34493–34535            사망 중 타이머 소진 → 폴백 부활 또는 완전 사망
## 상태 소유 0: e 는 정본 E 사본, 결과는 반환값. 피해·표시·RNG·충돌 질의는 env(PC core/테스트 env)가 한다.
## env: bd_affix(id,line)->float|null  bd_rng(tag,line)->float|null  bd_text(x,y,text,col,life)
##      bd_present(cmd,args,line)  bd_hurt_player(dmg,opts)  bd_kb_add(kx,ky)  bd_can_move(x,y,r)->bool
##      bd_safe_pt(x,y,r)->{x,y}|null  bd_spawn_proj(props)  bd_g_write(fields)  bd_tr(text)->String
##      bd_lang_ko()->bool  bd_player_full_hp()->bool  bd_player()->{x,y,facing,iframes,s}  bd_killed_bosses()->Array
## 피날레(_isDruidFinale)는 현재 도달 불가(16644–16648/17054–17055) — 분기 이식 0.
## STG[0].hell=0 → _isH7=false. G._fireZones holyPrison 은 Godot 보스 아레나에 생산자 없음 → 스캔 0.

static func _n(v: Variant) -> float:
	if v is int or v is float: return float(v)
	if v is bool: return 1.0 if v else 0.0
	return 0.0

static func _t(v: Variant) -> bool:
	if v == null: return false
	if v is bool: return v
	if v is int or v is float: return float(v) != 0.0 and not is_nan(float(v))
	if v is String: return not (v as String).is_empty()
	return true

static func _i32(value: float) -> int:
	if not is_finite(value) or value == 0: return 0
	var wrapped: float = fmod(floor(value) if value >= 0 else ceil(value), 4294967296.0)
	if wrapped < 0: wrapped += 4294967296.0
	if wrapped >= 2147483648.0: wrapped -= 4294967296.0
	return int(wrapped)

static func _num_str(v: float) -> String:
	# JS 숫자→문자열(정수면 소수점 없음)
	if v == floor(v) and absf(v) < 1e15: return str(int(v))
	return str(v)

static func _L(env: Object, ko: String, en: String) -> String:
	return ko if env.bd_lang_ko() else en

## 42515–42624. 반환 {ok, revived, reason}
static func immediate(e: Dictionary, env: Object) -> Dictionary:
	e.deaths = _n(e.get("deaths")) + 1 # 42516
	var is_h7 := false # 42518–42520 STG[0].hell=0
	var b_suppress: Variant = env.bd_affix("antiRevive", 42522)
	if b_suppress == null: return {"ok": false, "reason": "antiRevive_not_ready"}
	b_suppress = float(b_suppress)
	var hp_zone := false # 42524 G._fireZones holyPrison 없음
	var rev_cost := 10 # 42526
	if b_suppress > 0: rev_cost += _i32(minf(5.0, b_suppress * 10 + 2))
	if hp_zone: rev_cost += 3
	if env.bd_player_full_hp(): rev_cost += 2 # 42529
	e._revPts = _n(e.get("_revPts")) - rev_cost
	if e._revPts < 0: e._revPts = 0
	var do_revive := false
	var rev_base: float = 2.00 + 0 * 0.05 # 42534 G.stage=0
	var rev_ch: float = maxf(0.0, rev_base - (_n(e.deaths) - 1) * 0.15 - b_suppress)
	if _n(e._revPts) > 0:
		var u: Variant = env.bd_rng("boss_immediate_revive", 42537)
		if u == null: return {"ok": false, "reason": "rng_not_ready"}
		do_revive = float(u) < rev_ch
	var rev_pct: int = _i32(rev_ch * 100)
	var x: float = _n(e.x)
	var y: float = _n(e.y)
	if do_revive:
		env.bd_text(x, y - 55, env.bd_tr("💀 ") + _num_str(_n(e.deaths)) + _L(env, "차 부활! ", " Revive! ") + str(rev_pct) + "%",
			"#ff2244" if rev_pct >= 80 else ("#ff8844" if rev_pct >= 50 else "#ffcc44"), 50)
		env.bd_text(x, y - 70, _L(env, "부활력 -", "Revive Power -") + str(rev_cost) + " (" + _num_str(_n(e._revPts)) + "/" + _num_str(_n(e.get("_maxRevPts"))) + ")",
			"#ffdd44" if rev_cost >= 13 else "#ffffff", 60)
		if b_suppress > 0: env.bd_text(x, y - 85, env.bd_tr("✟ 신성력 억제! +") + str(_i32(minf(5.0, b_suppress * 10 + 2))), "#ffffff", 50)
	elif _n(e._revPts) <= 0:
		env.bd_text(x, y - 55, env.bd_tr("☠ 부활력 고갈!"), "#ff2222", 80)
		env.bd_text(x, y - 40, "0/" + _num_str(_n(e.get("_maxRevPts"))), "#ff4444", 50)
	elif b_suppress > 0:
		env.bd_text(x, y - 40, env.bd_tr("✟ 신성력 억제! (") + str(rev_pct) + "%)", "#ffffff", 60)
	else:
		env.bd_text(x, y - 40, env.bd_tr("부활 실패 (") + str(rev_pct) + "%)", "#bbbbbb", 40)
	if not do_revive:
		return {"ok": true, "revived": false}
	# 42550–42622
	e.hp = e.mhp
	e.eShield = 0
	e.eShieldMax = 0
	e._bossPhase = 0
	e.alive = true
	e.s = "recover"
	e.st2 = 90
	e.stunned = 0
	e._bossRevJudged = true
	e._comboSeq = null
	e._comboIdx = 0
	e._feinting = false
	e._delaying = 0
	e.maxPoise = _i32(_n(e.maxPoise) * 1.5)
	e.poise = _i32(_n(e.maxPoise) * 0.25)
	e.reviveIframes = 90
	e.atk = _i32(_n(e.atk) * (2.0 if is_h7 else 1.5))
	e.speed = minf(_n(e.speed) * 1.25, 2.0 if is_h7 else 1.6)
	e.bossPatCd = maxf(20.0 if is_h7 else 60.0, _n(e.bossPatCd) - 30)
	if not _t(e.get("_origR")): e._origR = e.r
	var rv_scale: float = maxf(0.40, _n(e.get("_revPts")) / maxf(1.0, _n(e.get("_maxRevPts")) if _t(e.get("_maxRevPts")) else 150.0))
	var vfx_r1: float = _n(e.r)
	e.r = maxf(10.0, float(_i32(_n(e._origR) * rv_scale)))
	var shrink: int = _i32((1 - rv_scale) * 100)
	if shrink > 0: env.bd_text(e.x, _n(e.y) - 85, "▼ " + str(shrink) + "%", "#aaffcc", 55)
	var rv_ox: float = _n(e.x)
	var rv_oy: float = _n(e.y)
	var rv_r: float = _n(e.r) if _t(e.get("r")) else 20.0
	var portal: float = (vfx_r1 * 7) / 64.0
	env.bd_present("playVFXAng", ["boss_revive_boom", rv_ox, rv_oy, portal, 5, 0, true], 42570)
	env.bd_present("_addBlastLight", [rv_ox, rv_oy, rv_r * 3, 12, 255, 80, 0], 42571)
	var p: Dictionary = env.bd_player()
	var u_tp: Variant = env.bd_rng("boss_revive_tp_angle", 42573)
	if u_tp == null: return {"ok": false, "reason": "rng_not_ready"}
	var tp_ang: float = _n(p.facing) + PI + ((float(u_tp) - 0.5) * 0.8)
	var tp_dist: float = 80 + _n(e.deaths) * 20
	var tx: float = _n(p.x) + cos(tp_ang) * tp_dist
	var ty: float = _n(p.y) + sin(tp_ang) * tp_dist
	if env.bd_can_move(tx, ty, _n(e.r)):
		e.x = tx
		e.y = ty
	else:
		var sp_v: Variant = env.bd_safe_pt(_n(p.x) + cos(tp_ang) * 50, _n(p.y) + sin(tp_ang) * 50, _n(e.r))
		if sp_v is Dictionary:
			e.x = sp_v.x
			e.y = sp_v.y
	env.bd_present("playVFXAng", ["boss_revive_boom", e.x, e.y, portal, 5, 0, true], 42579)
	env.bd_present("_addTpBolt", [rv_ox, rv_oy, e.x, e.y, 14, "#ff6600"], 42580)
	env.bd_text(e.x, _n(e.y) - 50, env.bd_tr("🔥부활!"), "#ff4400", 40)
	e._tpWarnT = 0
	e._tpWarnX = 0
	e._tpWarnY = 0
	e._spawnT = 55
	e._bossReviveVFXPending = 40
	var u_sfx: Variant = env.bd_rng("boss_revive_sfx_pitch", 12463) # 42585 _r(1.0,.08)
	if u_sfx == null: return {"ok": false, "reason": "rng_not_ready"}
	env.bd_present("playSample", ["boss_revive", 1.0, 1.0 * (1 + (float(u_sfx) - 0.5) * 2 * 0.08)], 42585)
	# 42587–42593 부활 충격파
	var wave_r: float = 100 + _n(e.deaths) * 30
	var wave_dmg: int = _i32(_n(e.atk) * (0.5 + _n(e.deaths) * 0.15))
	p = env.bd_player()
	var pd: float = sqrt((_n(e.x) - _n(p.x)) * (_n(e.x) - _n(p.x)) + (_n(e.y) - _n(p.y)) * (_n(e.y) - _n(p.y)))
	if pd < wave_r and _n(p.iframes) <= 0 and str(p.s) != "charge":
		env.bd_hurt_player(wave_dmg, {"dtype": "magic"})
		p = env.bd_player()
		var ka: float = atan2(_n(p.y) - _n(e.y), _n(p.x) - _n(e.x))
		env.bd_kb_add(cos(ka) * 12, sin(ka) * 12)
		env.bd_text(p.x, _n(p.y) - 20, env.bd_tr("🌊충격파!"), "#ff4400", 30)
	# 42594 36방사 파티클(크기·수명 RNG 2개씩)
	for k in range(36):
		var a: float = PI * 2 * k / 36.0
		var spd: float = 10.0 if is_h7 else 7.0
		var u1: Variant = env.bd_rng("revive_ring_size", 42594)
		var u2: Variant = env.bd_rng("revive_ring_life", 42594)
		if u1 == null or u2 == null: return {"ok": false, "reason": "rng_not_ready"}
		env.bd_present("poolPart", [_n(e.x) + cos(a) * 20, _n(e.y) + sin(a) * 20, cos(a) * spd, sin(a) * spd, "#ff4400", 3 + float(u1) * 3, 18 + float(u2) * 8], 42594)
	# 42596–42602 2차 부활부터 분노 폭발
	if _n(e.deaths) >= 2:
		var cnt: int = 8 + int(_n(e.deaths)) * 4
		for bi in range(cnt):
			var ba: float = PI * 2 * bi / cnt
			var red: bool = bi % 2 == 0
			var hue: int = int(bi * 360 / cnt) # (bi*360/_bCnt)|0
			var col: String = "#cc1100" if red else ("hsl(" + str(hue) + ",100%,60%)")
			# 20057 _eMouthXY(e,ang): off=(e.r||12)*.7, 각도=ang||e.facing||0 (JS || : 0 이면 다음 값)
			var off: float = (_n(e.r) if _t(e.get("r")) else 12.0) * 0.7
			var ma: float = ba if _t(ba) else (_n(e.get("facing")) if _t(e.get("facing")) else 0.0)
			var props := {"x": _n(e.x) + cos(ma) * off, "y": _n(e.y) + sin(ma) * off, "vx": cos(ba) * 3, "vy": sin(ba) * 3, "dmg": _i32(_n(e.atk) * (0.8 if red else 0.6)),
				"el": e.el, "friendly": false, "life": 600, "ml": 600, "col": col, "sz": 2.0 if red else 1.8}
			if red:
				props.redBean = true
				props.homing = true
			env.bd_spawn_proj(props)
		env.bd_text(e.x, _n(e.y) - 65, env.bd_tr("💀 분노 폭발!"), "#ff0000", 50)
	# 42604 동반부활: G._killedBosses&&length>0&&Math.random()<0.1
	var killed: Array = env.bd_killed_bosses()
	if killed.size() > 0:
		return {"ok": false, "reason": "unported_branch_active:companion_revive"}
	var rev_txt: String = ("👿 " if is_h7 else "💀 ") + _num_str(_n(e.deaths)) + "차 부활! (×" + _num_str(pow(2, _n(e.deaths))) + ")"
	env.bd_text(e.x, _n(e.y) - 35, rev_txt, "#ff0044" if is_h7 else "#ff2244", 70)
	env.bd_text(e.x, _n(e.y) - 20, "HP " + _num_str(_n(e.mhp)), "#ff4488" if is_h7 else "#ff6666", 50)
	return {"ok": true, "revived": true}

## 42641–42649
static func fallback_reserve(e: Dictionary, env: Object) -> Dictionary:
	if _t(e.get("_bossRevJudged")): return {"ok": true, "pending": false}
	e._bossRevJudged = true
	e._reviveTimer = 180
	e._reviveX = e.x
	e._reviveY = e.y
	var rv2_base: float = 1.50 + 0 * 0.05
	var sup: Variant = env.bd_affix("antiRevive", 42644)
	if sup == null: return {"ok": false, "reason": "antiRevive_not_ready"}
	if _n(e.get("_revPts")) <= 0:
		e._bossRevChance = 0
		e._bossRevRoll = 1
	else:
		e._bossRevChance = maxf(0.0, rv2_base - _n(e.get("deaths")) * 0.25 - float(sup))
		var u: Variant = env.bd_rng("boss_fallback_revive_roll", 42648)
		if u == null: return {"ok": false, "reason": "rng_not_ready"}
		e._bossRevRoll = float(u)
	e._bossRevived = true
	return {"ok": true, "pending": true}

## 34493–34535. 반환 {ok, outcome: "idle"|"waiting"|"revived"|"final"}
static func fallback_tick(e: Dictionary, sp: float, env: Object) -> Dictionary:
	if not (_n(e.get("_reviveTimer")) > 0): return {"ok": true, "outcome": "idle"}
	e._reviveTimer = _n(e._reviveTimer) - sp
	var g0: Variant = env.bd_rng("revive_precursor_gate", 34496)
	if g0 == null: return {"ok": false, "reason": "rng_not_ready"}
	if float(g0) > 0.85:
		var ua: Variant = env.bd_rng("revive_precursor_angle", 34496)
		var ur: Variant = env.bd_rng("revive_precursor_radius", 34496) if ua != null else null
		if ua == null or ur == null: return {"ok": false, "reason": "rng_not_ready"}
		var a: float = float(ua) * PI * 2
		var r: float = 15 + float(ur) * 20
		var us: Variant = env.bd_rng("revive_precursor_size", 34497)
		var ul: Variant = env.bd_rng("revive_precursor_life", 34497) if us != null else null
		if us == null or ul == null: return {"ok": false, "reason": "rng_not_ready"}
		env.bd_present("poolPart", [_n(e.get("_reviveX")) + cos(a) * r, _n(e.get("_reviveY")) + sin(a) * r, -sin(a) * 1.5, cos(a) * 1.5, "#6622aa", 2 + float(us) * 2, 10 + float(ul) * 6], 34497)
	if e._reviveTimer > 0: return {"ok": true, "outcome": "waiting"}
	e._reviveTimer = 0
	var roll: float = float(e._bossRevRoll) if e.get("_bossRevRoll") != null else 1.0 # ??1
	var chance: float = _n(e.get("_bossRevChance")) if _t(e.get("_bossRevChance")) else 0.0
	if roll < chance:
		e._revPts = maxf(0.0, _n(e.get("_revPts")) - 10)
		e.alive = true
		e.x = e._reviveX
		e.y = e._reviveY
		e.hp = _i32(_n(e.mhp) * 0.5)
		e.eShield = 0
		e.eShieldMax = 0
		e.s = "recover"
		e.st2 = 60
		e.stunned = 0
		e.kb = {"x": 0, "y": 0}
		e.reviveIframes = 90
		e._bossRevJudged = false
		env.bd_g_write({"bossAlive": true})
		if not _t(e.get("_origR")): e._origR = e.r
		var rv_scale: float = maxf(0.40, _n(e.get("_revPts")) / maxf(1.0, _n(e.get("_maxRevPts")) if _t(e.get("_maxRevPts")) else 150.0))
		var vfx_r: float = _n(e.r)
		e.r = maxf(10.0, float(_i32(_n(e._origR) * rv_scale)))
		var shrink: int = _i32((1 - rv_scale) * 100)
		env.bd_text(e.x, _n(e.y) - 50, env.bd_tr("☠ 지옥에서 귀환!"), "#ff4400", 100)
		env.bd_text(e.x, _n(e.y) - 30, _L(env, "부활 성공! 부활력 ", "Revive! Power ") + _num_str(_n(e._revPts)) + "/" + _num_str(_n(e.get("_maxRevPts"))), "#ff8844", 60)
		if shrink > 0: env.bd_text(e.x, _n(e.y) - 70, "▼ " + str(shrink) + "%", "#aaffcc", 55)
		env.bd_present("playVFXAng", ["boss_revive_boom", e.x, e.y, (vfx_r * 7) / 64.0, 5, 0, true], 34522)
		e._tpWarnT = 0
		e._tpWarnX = 0
		e._tpWarnY = 0
		e._spawnT = 55
		e._bossReviveVFXPending = 40
		var u_sfx: Variant = env.bd_rng("boss_revive_sfx_pitch", 12463) # 34525 _r(1.0,.08)
		if u_sfx == null: return {"ok": false, "reason": "rng_not_ready"}
		env.bd_present("playSample", ["boss_revive", 1.0, 1.0 * (1 + (float(u_sfx) - 0.5) * 2 * 0.08)], 34525)
		return {"ok": true, "outcome": "revived"}
	e._bossRevived = false
	e._reviveTimer = 0
	env.bd_text(e.get("_reviveX"), _n(e.get("_reviveY")) - 50, env.bd_tr("☠ 완전 사망!"), "#ff2222", 100)
	var depleted: bool = _n(e.get("_revPts")) <= 0
	env.bd_text(e.get("_reviveX"), _n(e.get("_reviveY")) - 30, env.bd_tr("부활력 고갈!") if depleted else env.bd_tr("부활 실패..."), "#ff4444" if depleted else "#888888", 60)
	env.bd_present("shake", [8], 34533)
	env.bd_g_write({"_flashT": 4, "_flashCol": "#ffffff"})
	var u_fd: Variant = env.bd_rng("boss_final_death_sfx_pitch", 12463) # 34534 _r(1.0,.05)
	if u_fd == null: return {"ok": false, "reason": "rng_not_ready"}
	env.bd_present("playSample", ["boss_final_death", 1.0, 1.0 * (1 + (float(u_fd) - 0.5) * 2 * 0.05)], 34534)
	return {"ok": true, "outcome": "final"}
