extends RefCounted
## PC-BOSS-CORE (2026-10-22) — BC07~BC10 에 없는 1장 보스 switch 상태(원본 updateE switch 원문 순서).
##   bossShockWind/bossShock 40749–40758 · bossSummonWind 40798–40814 · bossSpinWind/bossSpin 40869–40889
##   bossMineWind 40891–40903 · bossPoisonDash 41327–41335
## Mac actor 의 `_dispatch_switch`(최소 훅)가 begin_tick/next_tick 으로 호출한다. 보스 전투 owner(PC core)가
## context.pc_core 로 주어지며, 피해·패링·표시·탄 생성·전역 큐 쓰기는 그 owner 를 동기 호출한다(ACK 위장 0).
## 모든 RNG 는 actor 가 넘긴 rng(World 공용 RNG)를 원본 Math.random 순서대로 소비한다.
## 미이식: bossSummonWind 의 mkEn 소환체(0/2/3 etype 생성기·레지스트리) — 위치/원소/etype 추첨 RNG 는 소비하고
## 소환은 core 의 미이식 카운터로만 남긴다(mkEn 내부 RNG 미소비 → 원본 대비 RNG 흐름 차이, 계약 §9).
const STATES := ["bossShockWind", "bossShock", "bossSummonWind", "bossSpinWind", "bossSpin", "bossMineWind", "bossPoisonDash"]

static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary, context: Dictionary) -> Dictionary:
	if si != 0 or not STATES.has(enemy.get("s")): return _fail("unsupported_misc_state")
	var core: Variant = context.get("pc_core")
	if not is_instance_valid(core): return _fail("pc_boss_core_owner_missing")
	return {"status": "READY", "continuation": {"version": 1, "si": si, "enemy": enemy.duplicate(true), "player": player.duplicate(true),
		"sp": sp, "context": context}, "full_tick_complete": false}

static func next_tick(token: Dictionary, _response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	var e: Dictionary = token.enemy.duplicate(true)
	var p: Dictionary = token.player.duplicate(true)
	var sp: float = float(token.sp)
	var c: Dictionary = token.context
	var core: Variant = c.get("pc_core")
	if not is_instance_valid(core) or not rng.is_valid(): return _fail("misc_owner_or_rng_missing")
	var shake_opt: float = float(c.get("shake", 100))
	var r := {"e": e, "p": p}
	match str(e.s):
		"bossShockWind": # 40749–40751
			if _n(e.st2) <= 0:
				e.shockR = 0
				e.shockMax = 1000 + 0 * 50
				e.s = "bossShock"
				e.st2 = 30
				core.misc_present("SFX.groggy", [], 40750)
				core.misc_g_write({"shake": 10 * shake_opt / 100.0})
				core.misc_present("addParts", [e.x, e.y, e.col, 18], 40750)
				if c.get("vfx_available") == true: core.misc_present("playVFXAng", ["druid_shockring", e.x, e.y, _n(e.r) * 2.5 / 256.0, 7, 0, false], 40750)
		"bossShock": # 40752–40758
			e.shockR = _n(e.shockR) + 4.5 * sp
			if absf(_dst(p, e) - _n(e.shockR)) < 18 and _n(p.iframes) <= 0 and str(p.s) != "charge":
				r = core.misc_hurt(e, p, _i32(_n(e.atk) * 1.4), {}, 40754) # elMul(EL.P,armor)=1 (14344)
				p = r.p
				var ang: float = atan2(_n(p.y) - _n(e.y), _n(p.x) - _n(e.x))
				p = core.misc_kb_add(p, cos(ang) * 8, sin(ang) * 8)
			if _n(e.shockR) >= _n(e.shockMax) or _n(e.st2) <= 0:
				e.s = "recover"
				e.st2 = 55
		"bossSummonWind": # 40798–40814
			if _u(rng, "summon_wind_gate") > 0.6:
				var ux: float = _u(rng, "summon_wind_x")
				var uy: float = _u(rng, "summon_wind_y")
				core.misc_present("poolPart", [_n(e.x) + (ux - 0.5) * 30, _n(e.y) + (uy - 0.5) * 30, 0, -1, "#aa00ff", 3, 12], 40799)
			if _n(e.st2) <= 0:
				var cnt: int = 3 + _i32(0 * 0.5)
				for si in range(cnt):
					var a: float = PI * 2 * si / cnt
					var sd: float = 50 + _u(rng, "summon_distance") * 30
					var sx: float = _n(e.x) + cos(a) * sd
					var sy: float = _n(e.y) + sin(a) * sd
					var el: int = [0, 1, 2, 3, 4, 5][_i32(_u(rng, "summon_element") * 6)]
					var et: int = [0, 2, 3, 3, 3][_i32(_u(rng, "summon_etype") * 5)]
					core.misc_summon_unported(sx, sy, et, el)
					core.misc_present("addParts", [sx, sy, "#aa00ff", 8], 40810)
				core.misc_present("SFX.charge", [], 40812)
				core.misc_text(e.x, _n(e.y) - 20, str(cnt) + core.misc_L("체 소환!", " Summoned!"), "#cc66ff", 40)
				e.s = "recover"
				e.st2 = 70
		"bossSpinWind": # 40869–40871
			if _u(rng, "spin_wind_gate") > 0.5:
				var ux: float = _u(rng, "spin_wind_x")
				var uy: float = _u(rng, "spin_wind_y")
				core.misc_present("poolPart", [_n(e.x) + (ux - 0.5) * 20, _n(e.y) + (uy - 0.5) * 20, 0, -1, "#ff6644", 3, 10], 40870)
			if _n(e.st2) <= 0:
				e.s = "bossSpin"
				e.st2 = 50
				e._spinAng = 0
				core.misc_present("SFX.charge", [], 40871)
		"bossSpin": # 40872–40889
			e._spinAng = _n(e.get("_spinAng")) + 0.35 * sp
			var sp_r: float = 500 + 0 * 15
			if fmod(_n(e.st2), 8) < sp:
				var sa: float = _n(e._spinAng)
				core.misc_spawn_projectile(e, {"x": _n(e.x) + cos(sa) * 20, "y": _n(e.y) + sin(sa) * 20, "vx": cos(sa) * 4, "vy": sin(sa) * 4,
					"dmg": _i32(_n(e.atk) * 0.8), "el": e.el, "friendly": false, "life": 250, "ml": 250, "col": e.col, "sz": 2}, 40877)
			if _dst(p, e) < sp_r and _n(p.iframes) <= 0 and str(p.s) != "charge" and fmod(_n(e.st2), 12) < sp:
				if core.misc_is_p_win():
					core.misc_parry(_i32(_n(e.atk) * 1.2))
					e = core.misc_poise_hit(e, 20)
				else:
					r = core.misc_hurt(e, p, _i32(_n(e.atk) * 1.2), {}, 40884)
					p = r.p
					var ka: float = atan2(_n(p.y) - _n(e.y), _n(p.x) - _n(e.x))
					p = core.misc_kb_add(p, cos(ka) * 6, sin(ka) * 6)
			core.misc_present("poolPart", [_n(e.x) + cos(_n(e._spinAng)) * sp_r * 0.6, _n(e.y) + sin(_n(e._spinAng)) * sp_r * 0.6,
				cos(_n(e._spinAng)) * 2, sin(_n(e._spinAng)) * 2, e.col, 3, 8], 40888)
			if _n(e.st2) <= 0:
				e.s = "recover"
				e.st2 = 55
				core.misc_g_write({"shake": 6 * shake_opt / 100.0})
		"bossMineWind": # 40891–40903
			if _u(rng, "mine_wind_gate") > 0.6:
				var ux: float = _u(rng, "mine_wind_x")
				var uy: float = _u(rng, "mine_wind_y")
				core.misc_present("poolPart", [_n(e.x) + (ux - 0.5) * 15, _n(e.y) + (uy - 0.5) * 15, 0, -1, "#5e10a8", 2, 8], 40892)
			if _n(e.st2) <= 0:
				var mc: int = 3 + _i32(_n(e.get("_bossPhase"))) + _i32(0 * 0.3)
				for mi in range(mc):
					var ma: float = PI * 2 * mi / mc
					var md: float = 60 + _u(rng, "mine_distance") * 80
					core.misc_spawn_mine(e, {"x": _n(e.x) + cos(ma) * md, "y": _n(e.y) + sin(ma) * md, "vx": 0, "vy": 0, "dmg": _i32(_n(e.atk) * 1.6),
						"el": 3, "friendly": false, "life": 180, "ml": 180, "col": "#ff2000", "sz": 5, "mine": true})
				core.misc_present("SFX.charge", [], 40901)
				core.misc_present("addParts", [e.x, e.y, "#5e10a8", 12], 40901)
				core.misc_text(e.x, _n(e.y) - 20, str(mc) + core.misc_L("개 설치!", " Placed!"), "#5e10a8", 35)
				e.s = "recover"
				e.st2 = 50
		"bossPoisonDash": # 41327–41335
			var mx: float = cos(_n(e.get("_ptAng"))) * 5 * sp
			var my: float = sin(_n(e.get("_ptAng"))) * 5 * sp
			if core.pf_can_move(_n(e.x) + mx, _n(e.y) + my, _n(e.r)):
				e.x = _n(e.x) + mx
				e.y = _n(e.y) + my
			e._ptT = _n(e.get("_ptT")) + sp
			if e._ptT >= 8:
				e._ptT = e._ptT - 8
				core.misc_append_queue("_poisonPools", {"x": e.x, "y": e.y, "t": 0, "maxT": 240, "r": 175, "dmg": _i32(_n(e.atk) * 0.3), "el": e.el, "tickT": 0})
				if c.get("vfx_available") == true: core.misc_present("playVFXAng", ["druid_poison", e.x, e.y, 175 * 2 / 256.0, 7, 0, false], 41332)
			if _n(e.st2) <= 0:
				e.s = "recover"
				e.st2 = 25
		_:
			return _fail("unsupported_misc_state")
	return {"status": "READY", "done": true, "enemy": e, "player": p, "events": [], "rng_ledger": [], "command": null,
		"continuation": null, "full_tick_complete": false}

static func _u(rng: Callable, tag: String) -> float:
	return float(rng.call(tag))

static func _dst(p: Dictionary, e: Dictionary) -> float:
	return sqrt((_n(e.x) - _n(p.x)) * (_n(e.x) - _n(p.x)) + (_n(e.y) - _n(p.y)) * (_n(e.y) - _n(p.y)))

static func _n(v: Variant) -> float:
	if v is int or v is float: return float(v)
	if v is bool: return 1.0 if v else 0.0
	return 0.0

static func _i32(value: float) -> int:
	if not is_finite(value) or value == 0: return 0
	var wrapped: float = fmod(floor(value) if value >= 0 else ceil(value), 4294967296.0)
	if wrapped < 0: wrapped += 4294967296.0
	if wrapped >= 2147483648.0: wrapped -= 4294967296.0
	return int(wrapped)

static func _fail(reason: String) -> Dictionary:
	return {"status": "NOT_READY", "reason": reason, "enemy": null, "player": null, "continuation": null, "command": null, "rng_ledger": [], "full_tick_complete": false}
