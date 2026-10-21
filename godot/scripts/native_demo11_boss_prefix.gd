extends RefCounted
## PC-BOSS-CORE (2026-10-22) — 1-1 보스(etype0·ib·elite0·mods[]) updateE 앞부분 순수 실행자.
##
## 원본(game.html 스냅샷 4d911cdd): updateE 38584–38884 + etype별 분기 38885–40443(etype0/ib 해당 없음:
## 40251 `_isRare` 블록은 e._isRare 거짓이면 미진입). 결과는 actor 의 `source_updateE_prefix`
## receipt(through 40443)로 넘어간다. 원본 문장 순서·JS 진리값·~~(ToInt32)·RNG 행 순서를 보존한다.
##
## 이 파일은 상태를 소유하지 않는다. 입력 e/p 는 사본이며 반환값으로만 결과를 낸다.
## 월드 질의·표시·피해·generic 탄 발사는 env(PC core 또는 테스트 고정 env)가 수행한다:
##   pf_lesson_active() pf_tile_free(x,y,r) pf_can_move(x,y,r) pf_real_wall(x,y) pf_los(x1,y1,x2,y2)
##   pf_ff_dir(x,y)->{x,y}|null pf_rng(tag,line)->[0,1) pf_present(cmd,args,line) pf_translate(text)
##   pf_hurt_e(e,dmg,line)->e_after pf_rifts()->Array pf_msfx_playing()->int pf_msfx_inc()
##   pf_generic_tick(e,p,sp)->{ok,e,p,reason}
## 이식 안 된 활성 분기(DOT 풀·엘리트 모디파이어·레슨 적)는 가짜 구현 대신 NOT_READY 로 멈춘다.

const T := 40.0 # game.html:16631
const ETYPE0_RANGE := 400.0 # game.html:30870 ETYPE_RANGE[0]
const ETYPE0_MOVE_SFX := "m_melee" # game.html:32084 _ARCH_SFX[0] (_ETYPE_SFX[0] 없음)
const UNPORTED_DOT_FIELDS := ["bleedT", "poisonT", "burnT", "_iceDotT", "_mhDot"] # 38723–38767

static func source_receipt() -> Dictionary:
	return {"game_sha256": preload("res://source_snapshot/snapshot.gd").SHA256,
		"source_lines": [[38584, 38884], [38885, 40443]], "domain": "etype0 ib elite0 mods[] si0",
		"finale": false, "owner": "PC boss core"}

static func run(enemy: Dictionary, player: Dictionary, sp: float, env: Object) -> Dictionary:
	var e: Dictionary = enemy.duplicate(true)
	var p: Dictionary = player.duplicate(true)
	var rows: Array = []
	var trace: Array = []
	var ctx := {"e": e, "p": p, "rows": rows, "trace": trace, "env": env}
	if e.get("ib") != true or e.get("etype") != 0 or not _num(sp):
		return _nr(ctx, "boss_prefix_domain_required")
	if int(_n(e.get("elite"))) != 0 or (e.get("mods") is Array and not (e.mods as Array).is_empty()):
		return _nr(ctx, "unported_branch_active:elite_mods")
	# 38585
	if _t(e.get("_lessonEnemy")) and env.pf_lesson_active():
		return _early(ctx, 0.0, "lesson")
	# 38587
	if _n(e.get("_telegraphT")) > 0:
		e._telegraphT = _n(e._telegraphT) - sp
		e._telegraphR = _n(e.r) + 20
	# 38589 _pushOutWall (31722)
	if not env.pf_tile_free(_n(e.x), _n(e.y), _n(e.r)):
		_push_out_wall(e, env)
	# 38590–38592
	if _n(e.get("reviveIframes")) > 0: e.reviveIframes = maxf(0.0, _n(e.reviveIframes) - sp)
	if _n(e.get("_cursed")) > 0: e._cursed = _n(e._cursed) - sp
	if _n(e.get("_shockT")) > 0:
		e._shockT = _n(e._shockT) - sp
		if e._shockT <= 0:
			e._shockT = 0
			e._shockStk = 0
	# 38593–38614 넉백·벽 충돌
	var kb: Dictionary = e.kb if e.get("kb") is Dictionary else {"x": 0, "y": 0}
	e.kb = kb
	if absf(_n(kb.x)) > 0.1 or absf(_n(kb.y)) > 0.1:
		var nx: float = _n(e.x) + _n(kb.x) * sp
		var ny: float = _n(e.y) + _n(kb.y) * sp
		if env.pf_can_move(nx, ny, _n(e.r)):
			e.x = nx
			e.y = ny
			var rifts: Array = env.pf_rifts()
			if rifts.size() > 0:
				var spd2: float = sqrt(_n(kb.x) * _n(kb.x) + _n(kb.y) * _n(kb.y))
				if spd2 > 2:
					for rf in rifts:
						var rd: float = _dst(_n(e.x), _n(e.y), _n(rf.x), _n(rf.y))
						var rift_r: float = 15 + minf(1.0, _n(rf.t) / _n(rf.maxT)) * 20
						if rd < rift_r + _n(e.r):
							var cr: int = _i32(spd2 * 4)
							e = _hurt(ctx, e, cr, 38598)
							env.pf_present("addTxt", [e.x, _n(e.y) - 18, env.pf_translate("균열 충돌! ") + str(cr), "#9933ff", 30], 38599)
							env.pf_present("addParts", [e.x, e.y, "#aa44ff", 8], 38599)
							env.pf_present("SFX.block", [], 38600)
							env.pf_present("shake", [6], 38600)
							e.kb = {"x": 0, "y": 0}
							kb = e.kb
							break
		else:
			var real_wall: bool = env.pf_real_wall(nx, ny)
			var kb_spd: float = sqrt(_n(kb.x) * _n(kb.x) + _n(kb.y) * _n(kb.y))
			if real_wall and kb_spd > 2:
				var w_pct: float = minf(0.08, kb_spd * 0.004)
				var wall_dmg: int = maxi(_i32(kb_spd * 4), _i32(_n(e.mhp) * w_pct))
				e = _hurt(ctx, e, wall_dmg, 38607)
				env.pf_present("addTxt", [e.x, _n(e.y) - 18, env.pf_translate("벽 충돌! ") + str(wall_dmg), "#cc8844", 30], 38608)
				env.pf_present("addParts", [e.x, e.y, "#aa7744", 8], 38608)
				env.pf_present("SFX.block", [], 38609)
				env.pf_present("shake", [8], 38609)
			e.kb = {"x": 0, "y": 0}
			kb = e.kb
		var decay: float = pow(0.85, sp)
		kb.x = _n(kb.x) * decay
		kb.y = _n(kb.y) * decay
		if _n(e.get("_spikeSlow")) > 0:
			var ss: float = spike_trap_slow_pct(e.get("_spikeSlowLv"))
			kb.x = _n(kb.x) * (1 - ss)
			kb.y = _n(kb.y) * (1 - ss)
	# 38615
	if _n(e.get("_bluHitCD")) > 0: e._bluHitCD = _n(e._bluHitCD) - sp
	# 38617
	if _n(e.get("_hitStun")) > 0:
		return _early(ctx, 0.0, "hitstun")
	# 38618–38635
	if _n(e.get("stunned")) > 0:
		_cancel_proj_charge(e)
		if _n(e.stunned) > 180: e.stunned = 180
		if not _t(e.get("_maxStunned")) or _n(e._maxStunned) < _n(e.stunned): e._maxStunned = e.stunned
		# 38626 내부 stunned<=0 분기는 >0 확인 직후라 도달 불가(BC05 주석과 동일).
		return _early(ctx, 0.0, "stunned")
	# 38637–38642 이동 판정
	var px: float = _n(e.x) if not _t(e.get("_prevX")) else _n(e._prevX)
	var py: float = _n(e.y) if not _t(e.get("_prevY")) else _n(e._prevY)
	var dx: float = _n(e.x) - px
	var dy: float = _n(e.y) - py
	if dx * dx + dy * dy > 0.25:
		e._isMoving = true
		e._moveHold = 3
		e._moveAng = atan2(dy, dx)
	elif _n(e.get("_moveHold")) > 0:
		e._moveHold = _n(e._moveHold) - sp
	else:
		e._isMoving = false
	e._prevX = e.x
	e._prevY = e.y
	# 38644–38650 빙결
	if _n(e.get("_frozen")) > 0:
		_cancel_proj_charge(e)
		e._frozen = _n(e._frozen) - sp
		if e._frozen <= 0:
			e._frozen = 0
			e._freezeGauge = 0
			e._frozenImmune = 300 # e.ib?300:120
		return _early(ctx, 0.0, "frozen")
	# 38651–38659 상태 타이머
	if _n(e.get("_webSlow")) > 0: e._webSlow = _n(e._webSlow) - sp
	if _n(e.get("_frozenImmune")) > 0: e._frozenImmune = _n(e._frozenImmune) - sp
	if _n(e.get("_iceResDown")) > 0: e._iceResDown = _n(e._iceResDown) - sp
	if _n(e.get("_iceShardRes")) > 0:
		e._iceShardRes = _n(e._iceShardRes) - 0.002 * sp
		if e._iceShardRes < 0: e._iceShardRes = 0
	if _n(e.get("_weakT")) > 0:
		e._weakT = _n(e._weakT) - sp
		if e._weakT <= 0:
			e._weakPhys = 0
			e._weakMag = 0
			e._weakPj = 0
	if _n(e.get("_shockDRT")) > 0:
		e._shockDRT = _n(e._shockDRT) - sp
		if e._shockDRT <= 0: e._shockDR = 0
	if _n(e.get("_blinkWeakT")) > 0:
		e._blinkWeakT = _n(e._blinkWeakT) - sp
		if e._blinkWeakT <= 0: e._blinkWeak = 0
	if _n(e.get("_freezeGauge")) > 0: e._freezeGauge = maxf(0.0, _n(e._freezeGauge) - sp * 0.3)
	# 38662–38665 포이즈 자연회복: 보스(ib) 제외.
	var d: float = _dst(_n(p.x), _n(p.y), _n(e.x), _n(e.y))
	# 38667–38675 몬스터 이동 사운드 (etype0 → _ARCH_SFX 'm_melee', crawl 분기 없음 → RNG 2행)
	if d < 1000 and not _t(e.get("stunned")) and not _t(e.get("_frozen")):
		if not _t(e.get("_mSfxCd")): e._mSfxCd = 0
		if _n(e._mSfxCd) <= 0:
			if env.pf_msfx_playing() < 3:
				var vol: float = maxf(0.03, 0.35 * (1 - d / 1000.0))
				var u_pitch: float = _draw(ctx, "move_sfx_pitch", 12463) # _r 내부 Math.random(호출 38672)
				var pitch: float = 1 * (1 + (u_pitch - 0.5) * 2 * 0.15) # _r(1,.15) 12463
				env.pf_present("playSample", [ETYPE0_MOVE_SFX, vol, pitch], 38672)
				var u_cd: float = _draw(ctx, "move_sfx_cooldown", 38672)
				e._mSfxCd = 60 + _i32(u_cd * 60)
				env.pf_msfx_inc()
		else:
			e._mSfxCd = _n(e._mSfxCd) - sp
	var s: String = str(e.get("s", ""))
	# 38677–38680 부활 어그로
	if _t(e.get("_reviveChase")) and d > 200 and (s == "idle" or s == "recover"):
		_ff_move(e, p, sp, 2.0, env)
		d = _dst(_n(p.x), _n(p.y), _n(e.x), _n(e.y))
		if d <= 200: e._reviveChase = false
	# 38682 시야 어그로
	if not _t(e.get("_alerted")) and d < 800 and (s == "idle" or s == "recover") \
			and env.pf_los(_n(e.x), _n(e.y), _n(p.x), _n(p.y)):
		e._alerted = true
	# 38684–38685 방향 추적(일반 드루이드 돌진 조준 고정)
	var aim_locked: bool = s == "bossCharge" or (s == "bossChargeWind" and _n(e.get("st2")) <= 18 + sp)
	if d < 800 and _t(e.get("_alerted")) and not aim_locked:
		e.facing = atan2(_n(p.y) - _n(e.y), _n(p.x) - _n(e.x))
	# 38687–38708 어그로 추적: ETYPE_RANGE[0]=400 → 밀착 추적 분기, 보스 속도 ×2
	if _t(e.get("_alerted")) and (s == "idle" or s == "recover"):
		if ETYPE0_RANGE <= 400:
			if d > 30:
				_ff_move(e, p, sp, 2.0, env)
				d = _dst(_n(p.x), _n(p.y), _n(e.x), _n(e.y))
	# 38710 회전참 스택
	if _n(e.get("_wwStk")) > 0:
		if _n(e.get("_wwStkT")) > 0: e._wwStkT = _n(e._wwStkT) - sp
		else: e._wwStk = maxf(0.0, _n(e._wwStk) - _i32(3 * sp / 60.0))
	# 38712–38719 약점노출
	if _n(e.get("_comboStk")) > 0:
		if not _t(e.get("_comboHitT")): e._comboHitT = 0
		e._comboHitT = _n(e._comboHitT) + sp
		if e._comboHitT >= 300:
			e._comboStk = 0
			e._comboHitT = 0
		elif e._comboHitT >= 60:
			if not _t(e.get("_comboDecayT")): e._comboDecayT = 0
			e._comboDecayT = _n(e._comboDecayT) + sp
			if e._comboDecayT >= 60:
				e._comboDecayT = _n(e._comboDecayT) - 60
				e._comboStk = maxf(0.0, _n(e._comboStk) - maxf(1.0, _i32(_n(e._comboStk) * 0.20)))
	# 38723–38767 DOT 풀(출혈/중독/화상/냉기/악의사냥): Godot 에 적 DOT writer 없음 — 활성 시 정지.
	for key in UNPORTED_DOT_FIELDS:
		if _n(e.get(key)) > 0:
			return _nr(ctx, "unported_branch_active:dot_" + key)
	# 38752–38755 표식 타이머
	if _n(e.get("_hrMarkT")) > 0:
		e._hrMarkT = _n(e._hrMarkT) - sp
		if e._hrMarkT <= 0:
			e._hrMark = 0
			e._hrMarkT = 0
	if _n(e.get("_bbStkT")) > 0:
		e._bbStkT = _n(e._bbStkT) - sp
		if e._bbStkT <= 0:
			e._bbStk = 0
			e._bbStkT = 0
	# 38771 ATK 리셋(피날레 아님)
	e.atk = e.baseAtk
	# 38772
	if _n(e.get("_tpFlashT")) > 0: e._tpFlashT = _n(e._tpFlashT) - sp
	# 38774–38873 엘리트 모디파이어: 보스 mods=[] (진입부에서 확인)
	# 38875 오라 ATK (JS: undefined!==1 → atk=~~(atk*undefined)=0. 루프 앞 34395가 항상 1을 쓴다)
	if e.get("_aAtkM") != 1 and e.get("_aAtkM") != 1.0:
		e.atk = _i32(_n(e.atk) * _n_nan(e.get("_aAtkM")))
	# 38877 _chgCommit: 보스 상태에 eCharge* 없음
	# 38878 _tickProjCharge(e,sp) — BC09 generic_tick 이 감소·발사(20152–20155, 20122–20150) 소유
	if _n(e.get("_projChargeT")) > 0:
		var fired: Dictionary = env.pf_generic_tick(e, p, sp)
		if fired.get("ok") != true:
			return _nr(ctx, "generic_projectile_charge_owner:" + str(fired.get("reason")))
		e = fired.e
		p = fired.p
		ctx.e = e
		ctx.p = p
	# 38879–38883 비어그로 return 은 !e.ib 조건 — 보스 미적용
	# 38884
	var fd: Variant = env.pf_ff_dir(_n(e.x), _n(e.y))
	if fd is Dictionary:
		e._moveAng = atan2(_n(fd.y), _n(fd.x))
	else:
		e._moveAng = atan2(_n(p.y) - _n(e.y), _n(p.x) - _n(e.x))
	e.st2 = _n(e.st2) - sp
	# 38885–40443: etype0/ib 해당 분기 없음. 40251 _isRare 블록은 거짓이면 미진입.
	if _t(e.get("_isRare")):
		return _nr(ctx, "unported_branch_active:rare")
	return {"status": "READY", "enemy": e, "player": p, "distance": d, "return_update": false,
		"through_source_line": 40443, "reason": "", "rng_rows": rows, "trace": trace, "early": ""}

## 45506 _spikeTrapSlowPct
static func spike_trap_slow_pct(lv: Variant) -> float:
	var level: float = _n(lv) if _t(lv) else 1.0
	return minf(0.95, 0.91 + (maxf(1.0, level) - 1) * 0.02)

## 31722 _pushOutWall — _canMvTile 기준 T..5T(T/2 간격)·8방향 오름차순
static func _push_out_wall(e: Dictionary, env: Object) -> void:
	if env.pf_tile_free(_n(e.x), _n(e.y), _n(e.r)): return
	var dd: float = T
	while dd <= T * 5:
		for a in range(8):
			var nx: float = _n(e.x) + cos(PI / 4 * a) * dd
			var ny: float = _n(e.y) + sin(PI / 4 * a) * dd
			if env.pf_tile_free(nx, ny, _n(e.r)):
				e.x = nx
				e.y = ny
				return
		dd += T / 2

## 31907–31952 _ffMoveE
static func _ff_move(e: Dictionary, p: Dictionary, sp: float, mul: float, env: Object) -> void:
	var fd: Variant = env.pf_ff_dir(_n(e.x), _n(e.y))
	var dx: float
	var dy: float
	if fd is Dictionary:
		dx = _n(fd.x)
		dy = _n(fd.y)
	elif e.has("_lastFdx") and e._lastFdx != null:
		dx = _n(e._lastFdx)
		dy = _n(e._lastFdy)
	else:
		var a: float = atan2(_n(p.y) - _n(e.y), _n(p.x) - _n(e.x))
		dx = cos(a)
		dy = sin(a)
	if fd is Dictionary:
		e._lastFdx = dx
		e._lastFdy = dy
	var a_spd: float = _n(e.get("_aSpdM")) if _t(e.get("_aSpdM")) else 1.0
	var s: float = _n(e.speed) * a_spd * sp * (mul if mul != 0 else 1.0)
	var nx: float = _n(e.x) + dx * s
	var ny: float = _n(e.y) + dy * s
	var r: float = _n(e.r)
	if env.pf_can_move(nx, ny, r):
		e.x = nx; e.y = ny; e._stuckT = 0
	elif env.pf_can_move(nx, _n(e.y), r):
		e.x = nx; e._lastFdx = dx; e._lastFdy = 0; e._stuckT = 0
	elif env.pf_can_move(_n(e.x), ny, r):
		e.y = ny; e._lastFdx = 0; e._lastFdy = dy; e._stuckT = 0
	else:
		if not _t(e.get("_stuckT")): e._stuckT = 0
		e._stuckT = _n(e._stuckT) + sp
		var esc_ang: float = atan2(dy, dx)
		var esc_spd: float = s * 0.8
		var escaped := false
		var i := 1
		while i <= 4 and not escaped:
			var a1: float = esc_ang + i * PI / 4
			var a2: float = esc_ang - i * PI / 4
			var ex1: float = _n(e.x) + cos(a1) * esc_spd
			var ey1: float = _n(e.y) + sin(a1) * esc_spd
			if env.pf_can_move(ex1, ey1, r):
				e.x = ex1; e.y = ey1; e._lastFdx = cos(a1); e._lastFdy = sin(a1); escaped = true
			else:
				var ex2: float = _n(e.x) + cos(a2) * esc_spd
				var ey2: float = _n(e.y) + sin(a2) * esc_spd
				if env.pf_can_move(ex2, ey2, r):
					e.x = ex2; e.y = ey2; e._lastFdx = cos(a2); e._lastFdy = sin(a2); escaped = true
			i += 1
		if not escaped and _n(e._stuckT) > 30:
			var sr: float = maxf(2.0, r - 2)
			var j := 1
			while j <= 8 and not escaped:
				var a3: float = esc_ang + j * PI / 8
				var a4: float = esc_ang - j * PI / 8
				var ex3: float = _n(e.x) + cos(a3) * esc_spd
				var ey3: float = _n(e.y) + sin(a3) * esc_spd
				if env.pf_can_move(ex3, ey3, sr):
					e.x = ex3; e.y = ey3; e._lastFdx = cos(a3); e._lastFdy = sin(a3); escaped = true
				else:
					var ex4: float = _n(e.x) + cos(a4) * esc_spd
					var ey4: float = _n(e.y) + sin(a4) * esc_spd
					if env.pf_can_move(ex4, ey4, sr):
						e.x = ex4; e.y = ey4; e._lastFdx = cos(a4); e._lastFdy = sin(a4); escaped = true
				j += 1
		if not escaped and _n(e._stuckT) > 90:
			var tp_a: float = atan2(_n(p.y) - _n(e.y), _n(p.x) - _n(e.x))
			var tp_d: float = s * 2
			while tp_d <= s * 6:
				var tx: float = _n(e.x) + cos(tp_a) * tp_d
				var ty: float = _n(e.y) + sin(tp_a) * tp_d
				if env.pf_can_move(tx, ty, r):
					e.x = tx; e.y = ty; e._stuckT = 0
					break
				tp_d += s
				if s <= 0: break # s=0이면 원본은 무한 루프 — 정지 상태에서는 진입 불가(이동 시도 0)
		if escaped: e._stuckT = 0

## 20121 _cancelProjCharge
static func _cancel_proj_charge(e: Dictionary) -> void:
	e._projChargeT = 0
	e._projChargeCol = null
	e._projChargeBean = null
	e._projChargeParryClass = null

static func _hurt(ctx: Dictionary, e: Dictionary, dmg: int, line: int) -> Dictionary:
	ctx.trace.append({"op": "hurtE", "dmg": dmg, "line": line})
	var after: Variant = ctx.env.pf_hurt_e(e, dmg, line)
	var out: Dictionary = after if after is Dictionary else e
	ctx.e = out
	return out

static func _draw(ctx: Dictionary, tag: String, line: int) -> float:
	var u: float = float(ctx.env.pf_rng(tag, line))
	ctx.rows.append({"field": tag, "source_line": line, "unit": u})
	return u

static func _early(ctx: Dictionary, d: float, why: String) -> Dictionary:
	return {"status": "READY", "enemy": ctx.e, "player": ctx.p, "distance": d, "return_update": true,
		"through_source_line": 40443, "reason": "", "rng_rows": ctx.rows, "trace": ctx.trace, "early": why}

static func _nr(ctx: Dictionary, why: String) -> Dictionary:
	return {"status": "NOT_READY", "enemy": ctx.e, "player": ctx.p, "reason": why, "rng_rows": ctx.rows, "trace": ctx.trace}

static func _dst(a: float, b: float, c: float, d: float) -> float:
	return sqrt((c - a) * (c - a) + (d - b) * (d - b))

static func _num(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))

## JS 숫자 비교용: 비숫자/undefined → 0 (비교 결과가 false가 되는 위치에서만 사용)
static func _n(v: Variant) -> float:
	if v is int or v is float: return float(v)
	if v is bool: return 1.0 if v else 0.0
	return 0.0

## 곱셈 피연산자용: undefined/null → NaN (JS 와 같이 결과를 0 으로 만든다)
static func _n_nan(v: Variant) -> float:
	if v is int or v is float: return float(v)
	if v is bool: return 1.0 if v else 0.0
	return NAN

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
