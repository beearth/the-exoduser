extends SceneTree
## PC-ENEMY-ACTORS — native_demo11_etype_g_kernel.gd(mkEn·적 루프 앞부분·updateE G 경로) vs 원본 VM oracle.
## 같은 고정 env(사각 벽·LOS·흐름장=플레이어 방향·31비트 LCG 난수·정지 플레이어)를 양쪽에 주고
## 생성값·틱별 상태·난수 소비 수·경계 호출(탄/전조/텍스트/파티클/피해/패링/소환 자식)을 비교한다.
## 부동소수: 사칙연산 비트 동일 기대, 초월함수 경유 값은 상대 1e-9 허용(JSON 왕복 포함).
const K = preload("res://scripts/native_demo11_etype_g_kernel.gd")
const PREFIX = preload("res://scripts/native_demo11_boss_prefix.gd")
var assertions := 0
var failures := 0
var fail_samples: Array = []

class GEnv extends RefCounted:
	var P: Dictionary
	var walls: Array = []
	var los := true
	var ff_null := false
	var pwin := false
	var armor_el := 0
	var ens: Array = []
	var projs: Array = []
	var ev: Array = []
	var draws := 0
	var msfx := 0
	var _s := 0
	var lv := 1.0
	var diff := 5
	func seed_rng(seed: int) -> void: _s = seed & 0xffffffff
	func g_rand() -> float:
		draws += 1
		_s = (_s * 1103515245 + 12345) & 0xffffffff
		_s = _s & 0x7fffffff
		return float(_s) / 2147483648.0
	func _blocked(x: float, y: float) -> bool:
		for w in walls:
			if x >= w[0] and x < w[0] + w[2] and y >= w[1] and y < w[1] + w[3]: return true
		return false
	func g_can_mv(x: float, y: float, r: float) -> bool:
		return not _blocked(x - r, y - r) and not _blocked(x + r, y - r) and not _blocked(x - r, y + r) and not _blocked(x + r, y + r)
	func pf_can_move(x: float, y: float, r: float) -> bool: return g_can_mv(x, y, r)
	func pf_tile_free(x: float, y: float, r: float) -> bool: return g_can_mv(x, y, r)
	func pf_real_wall(x: float, y: float) -> bool:
		var tx: int = PREFIX._i32(x / 40.0)
		var ty: int = PREFIX._i32(y / 40.0)
		return tx < 0 or ty < 0 or tx >= 200 or ty >= 200
	func g_is_w(x: float, y: float) -> bool: return _blocked(x, y)
	func g_safe_pt(x: float, y: float, r: float) -> Variant:
		if g_can_mv(x, y, r): return {"x": x, "y": y}
		var d := 40.0
		while d <= 200.0:
			for a in range(8):
				var nx: float = x + cos(PI / 4 * a) * d
				var ny: float = y + sin(PI / 4 * a) * d
				if g_can_mv(nx, ny, r): return {"x": nx, "y": ny}
			d += 20.0
		return null
	func pf_los(_a: float, _b: float, _c: float, _d: float) -> bool: return los
	func pf_ff_dir(x: float, y: float) -> Variant:
		if ff_null: return null
		var a: float = atan2(float(P.y) - y, float(P.x) - x)
		return {"x": cos(a), "y": sin(a)}
	func pf_rifts() -> Array: return []
	func pf_msfx_playing() -> int: return msfx
	func pf_msfx_inc() -> void: msfx += 1
	func g_p() -> Dictionary: return P
	func g_sh_query(x: float, y: float, r: float) -> Array:
		var S := 128.0
		var out: Array = []
		var cx0: int = PREFIX._i32((x - r) / S)
		var cx1: int = PREFIX._i32((x + r) / S)
		var cy0: int = PREFIX._i32((y - r) / S)
		var cy1: int = PREFIX._i32((y + r) / S)
		for cy in range(cy0, cy1 + 1):
			for cx in range(cx0, cx1 + 1):
				for o in ens:
					if o is Dictionary and PREFIX._t(o.get("alive")) and PREFIX._i32(float(o.x) / S) == cx and PREFIX._i32(float(o.y) / S) == cy:
						out.append(o)
		return out
	func g_ens_count() -> int: return ens.size()
	func _clean(v: Variant) -> Variant:
		if v is Dictionary:
			var o := {}
			for k in v:
				if v[k] == null: continue
				o[k] = _clean(v[k])
			return o
		if v is Array:
			var a: Array = []
			for x in v: a.append(_clean(x))
			return a
		return v
	func _rec(row: Array) -> void: ev.append(_clean(row))
	func g_text(x: Variant, y: Variant, t: String, c: String, l: Variant) -> void: _rec(["addTxt", x, y, t, c, l])
	func g_tr(t: String) -> String: return t
	func g_l(ko: String, _en: String) -> String: return ko
	func g_pool_part(x: float, y: float, vx: float, vy: float, col: Variant, sz: float, life: float, tp: Variant = null, rot: Variant = null, grav: Variant = null) -> void:
		var row: Array = ["poolPart", x, y, vx, vy, col, sz, life]
		if tp != null: row.append(tp)
		if rot != null: row.append(rot)
		if grav != null: row.append(grav)
		ev.append(row)
	func g_parts(x: Variant, y: Variant, col: Variant, n: int) -> void:
		# 43929 addParts 원문 대응(oracle 은 실제 addParts 가 poolPart stub 을 부른다)
		var m: int = PREFIX._i32(n * 0.6)
		for i in range(m):
			var vx: float = (g_rand() - 0.5) * 7
			var vy: float = (g_rand() - 0.5) * 7
			var sz: float = 2 + g_rand() * 4
			var life: float = 12 + g_rand() * 12
			g_pool_part(float(x), float(y), vx, vy, col, sz, life)
	func g_play_sample(key: String, vol: float, pitch: float) -> void: _rec(["playSample", key, vol, pitch])
	func g_sfx(name: String, args: Array) -> void: _rec(["SFX." + name] + args)
	func g_shake(n: float) -> void: _rec(["shake", n])
	func g_present(cmd: String, args: Array) -> void: _rec([cmd] + args)
	func g_vfx(id: String, x: float, y: float, scale: float, speed: float, ang: float, skill: bool) -> void: _rec(["playVFXAng", id, x, y, scale, speed, ang, skill])
	func g_blast_light(_x: float, _y: float, _r: float, _l: float, _cr: int, _cg: int, _cb: int) -> void: pass
	func g_tp_smoke(_x: float, _y: float, _sz: float, _dur: float, _type: int, _rot: float) -> void: pass
	func g_tp_impact(_x: float, _y: float, _sz: float, _dur: float, _col: String) -> void: pass
	func g_tp_bolt(_ox: float, _oy: float, _dx: float, _dy: float, _dur: float, _col: String, _segs: Array) -> void: pass
	func g_hurt_self(_e: Dictionary, dmg: int, _line: int) -> void: _rec(["hurtE", dmg])
	func g_hurt_p(dmg: int, opts: Dictionary) -> void: _rec(["hurtP", dmg, opts if not opts.is_empty() else null])
	func g_kb_p(x: float, y: float) -> void:
		P.kb.x = float(P.kb.x) + x
		P.kb.y = float(P.kb.y) + y
	func g_is_p_win() -> bool:
		_rec(["isPWin", pwin])
		return pwin
	func g_parry(_e: Dictionary, bank: float) -> void: P.parryBank = float(P.get("parryBank", 0)) + bank
	func g_do_parry(e: Dictionary) -> void: _rec(["doParry", e.atk, e.x, e.y, false, e.get("el")])
	func g_poise_hit(_e: Dictionary, amt: int) -> void: _rec(["poiseHit", amt])
	func g_freeze_slow(n: float) -> void: P._freezeSlow = maxf(float(P.get("_freezeSlow", 0)), n)
	func g_el_mul(el: Variant) -> float:
		var d: int = armor_el
		if el == null: return 0.5 if false else 1.0 # elMul(undefined,d): a===d 는 d 가 정수라 거짓 → 1
		var a: int = int(el)
		if (a == 1 and d == 2) or (a == 2 and d == 1) or (a == 3 and d == 4) or (a == 4 and d == 3) or (a == 3 and d == 5) or (a == 5 and d == 3) or (a == 6 and d == 4) or (a == 4 and d == 6): return 2.0
		if a == d and a != 0: return 0.5
		return 1.0
	func g_shot(_e: Dictionary, props: Dictionary) -> void: _rec(["shot", props.duplicate(true)])
	func g_proj(_e: Dictionary, props: Dictionary) -> void:
		var p: Dictionary = props.duplicate(true)
		projs.append(p)
		_rec(["proj", p])
	func g_trap_cap(cap: int) -> void:
		var tc := 0
		var oldi := -1
		var old_l := INF
		for i in range(projs.size()):
			if projs[i].get("trap", false):
				tc += 1
				if float(projs[i].life) < old_l:
					old_l = float(projs[i].life)
					oldi = i
		if tc > cap and oldi >= 0:
			_rec(["recycleProj", "p%d" % oldi])
			projs[oldi] = projs[projs.size() - 1]
			projs.pop_back()
	func g_summon(_parent: Dictionary, etype: int, x: float, y: float, el: Variant, room: Variant, opts: Dictionary) -> Variant:
		var ne: Variant = K.mk_en(x, y, etype, el, room, lv, diff, 0.0, self)
		if ne is Dictionary and opts.get("hp_half_shield_zero", false):
			ne.hp = PREFIX._i32(float(ne.hp) * 0.5)
			ne.mhp = ne.hp
			ne.eShield = 0
			ne.eShieldMax = 0
		ens.append(ne)
		return ne
	func g_mk_en_detached(x: float, y: float, etype: int, el: Variant, room: Variant) -> Variant:
		return K.mk_en(x, y, etype, el, room, lv, diff, 0.0, self)
	func g_atk_tickets() -> int: return 0
	func g_max_atk_tickets() -> int: return 3
	func g_atk_ticket_request(_e: Dictionary) -> bool: return true
	func g_atk_ticket_release(_e: Dictionary) -> void: pass
	func g_kb_enemy(oe: Dictionary, x: float, y: float) -> void:
		oe.kb.x = float(oe.kb.x) + x
		oe.kb.y = float(oe.kb.y) + y

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		if fail_samples.size() < 40: fail_samples.append(label)

func _initialize() -> void:
	create_timer(600.0).timeout.connect(func(): print("PC_ENEMY_KERNEL_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

const FIELDS := ["x", "y", "s", "st2", "facing", "_alerted", "projT", "projCd", "_projChargeT", "poise", "poiseR", "hp", "atk", "speed", "r", "stunned", "_hitStun", "_spawnT",
	"teleportT", "summonT", "_tpWarnT", "_tpWarnX", "_tpWarnY", "webT", "swoopT", "trapT", "motherT", "_stCloneT", "_stTpCd", "_iceSlamT", "echDx", "echDy", "_lastFdx", "_lastFdy", "_sepCd", "shockMax", "_tpFlashT", "_mSfxCd"]

func _make_cases() -> Array:
	var out: Array = []
	var id := 0
	var dists := [50.0, 90.0, 140.0, 240.0, 420.0, 600.0, 760.0, 1100.0]
	for et in K.G_TYPES:
		for di in range(dists.size()):
			var ang: float = 0.37 * di + et * 0.11
			var c := {"id": "c%d" % id, "etype": et, "el": null, "lv": 1 + (id % 3) * 4, "seed": 1000 + id * 7919, "spawn": {"x": 2000.0, "y": 2000.0},
				"P": {"x": 2000.0 + cos(ang) * dists[di], "y": 2000.0 + sin(ang) * dists[di], "r": 14.0, "iframes": 0, "s": "idle", "facing": 0.3, "hp": 1000},
				"ticks": 600, "sp": 1.0}
			if di % 4 == 1: c.pwin = true
			if di % 4 == 2: c.others = [{"x": 2030.0, "y": 2010.0, "r": 20.0}, {"x": 1985.0, "y": 2040.0, "r": 20.0}]
			if di % 4 == 3: c.walls = [[2060.0, 1900.0, 60.0, 400.0]]
			if di == 5: c.sp = 2.0
			if di == 6: c.P.iframes = 60
			out.append(c)
			id += 1
		# 소환·텔레포트가 반드시 일어나도록 긴 근접 시나리오
		out.append({"id": "c%d" % id, "etype": et, "el": null, "lv": 1, "seed": 424242 + et, "spawn": {"x": 3000.0, "y": 3000.0},
			"P": {"x": 3060.0, "y": 3030.0, "r": 14.0, "iframes": 0, "s": "idle", "facing": 1.0, "hp": 1000}, "ticks": 1500, "sp": 1.0})
		id += 1
	return out

func _run() -> void:
	var cases := _make_cases()
	var dir := ProjectSettings.globalize_path("user://")
	var in_path := dir.path_join("pc_enemy_actors_cases.json")
	var out_path := dir.path_join("pc_enemy_actors_oracle.json")
	var f := FileAccess.open(in_path, FileAccess.WRITE)
	f.store_string(JSON.stringify({"cases": cases}))
	f.close()
	var node := _arg("node-bin", "C:/nvm4w/nodejs/node.exe")
	var output: Array = []
	var code := OS.execute(node, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_enemy_actors_source_oracle.cjs"),
		"--cases-file=" + in_path, "--out-file=" + out_path]), output, true)
	check(code == 0, "oracle_exit:" + str(output))
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	check(oracle is Dictionary and oracle.get("sha256") == preload("res://source_snapshot/snapshot.gd").SHA256, "oracle_snapshot_sha")
	if not oracle is Dictionary:
		print("PC_ENEMY_KERNEL_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "oracle": "missing", "output": output}))
		quit(1)
		return
	var by_id := {}
	for r in oracle.results: by_id[str(r.id)] = r
	var stats := {"cases": 0, "ticks": 0, "events": 0, "draws": 0, "not_ready": 0, "spawned": 0, "teleports": 0, "shots": 0, "projs": 0, "hurtP": 0, "per_etype": {}}
	for c in cases:
		var exp: Dictionary = by_id.get(c.id, {})
		if not exp.is_empty() and not exp.has("error") and int(exp.created.get("elite", 0)) > 0:
			# 31134 rollElite<.03 → 매직. 이 계열 kernel 은 엘리트 모디파이어를 실행하지 않고 NOT_READY 로 멈춘다.
			var envx := GEnv.new()
			envx.P = (c.P as Dictionary).duplicate(true)
			envx.P.merge({"kb": {"x": 0.0, "y": 0.0}}, true)
			envx.seed_rng(int(c.seed))
			var ex: Variant = K.mk_en(float(c.spawn.x), float(c.spawn.y), int(c.etype), null, 0, float(c.lv), 5, 0.0, envx)
			check(ex is Dictionary and int(ex.elite) == int(exp.created.elite) and ex.mods == exp.created.mods and envx.draws == int(exp.ctorDraws), "elite_ctor:%s" % c.id)
			check(ex is Dictionary and K.update_e(ex, 1.0, envx).status == "NOT_READY", "elite_hold:%s" % c.id)
			stats.elite_hold = int(stats.get("elite_hold", 0)) + 1
			continue
		if exp.is_empty() or exp.has("error"):
			check(false, "oracle_case:%s:%s" % [c.id, exp.get("error", "missing")])
			continue
		stats.cases += 1
		var env := GEnv.new()
		env.P = (c.P as Dictionary).duplicate(true)
		env.P.merge({"kb": {"x": 0.0, "y": 0.0}, "_freezeSlow": 0, "parryBank": 0}, true)
		env.walls = c.get("walls", [])
		env.pwin = c.get("pwin", false)
		env.lv = float(c.lv)
		env.seed_rng(int(c.seed))
		var e: Variant = K.mk_en(float(c.spawn.x), float(c.spawn.y), int(c.etype), null, 0, float(c.lv), 5, 0.0, env)
		check(e is Dictionary and not e.has("__error"), "ctor:%s" % c.id)
		if not e is Dictionary: continue
		check(env.draws == int(exp.ctorDraws), "ctor_draws:%s %d vs %d" % [c.id, env.draws, exp.ctorDraws])
		for k in ["x", "y", "r", "hp", "mhp", "atk", "baseAtk", "speed", "baseSpd", "col", "poise", "maxPoise", "etype", "lv", "s", "st2", "facing", "elite", "projCd", "projT", "bossPatT", "eShield", "eShieldMax",
				"summonCd", "summonT", "teleportCd", "teleportT", "webCd", "webT", "swoopCd", "swoopT", "trapCd", "trapT", "motherCd", "motherT", "_iceSlamCd", "_iceSlamT", "_bossOrbitAng", "_stCloneCd", "_stCloneT", "_stTpCd", "_erraticAng", "_spawnT", "_mob8Col", "_mob8Row", "_iceOnHit", "_iceFreeze", "_homeX", "_homeY"]:
			_cmp(e.get(k), exp.created.get(k), "ctor:%s.%s" % [c.id, k])
		env.ens = [e]
		for o in c.get("others", []):
			var od: Dictionary = (o as Dictionary).duplicate(true)
			od.merge({"alive": true, "etype": 0, "kb": {"x": 0.0, "y": 0.0}}, false)
			env.ens.append(od)
		var et_key := str(c.etype)
		if not stats.per_etype.has(et_key): stats.per_etype[et_key] = {"ticks": 0, "events": {}}
		for row in exp.ticks:
			if row.has("error"):
				check(false, "oracle_tick_error:%s:%s" % [c.id, row.error])
				break
			env.draws = 0
			env.ev = []
			env.msfx = 0
			var before: int = env.ens.size()
			K.outer_prefix(e, float(c.sp))
			var receipt: Dictionary = K.update_e(e, float(c.sp), env)
			if receipt.status != "READY":
				stats.not_ready += 1
				check(false, "not_ready:%s t%d %s" % [c.id, row.t, receipt.reason])
				break
			stats.ticks += 1
			stats.per_etype[et_key].ticks += 1
			check(env.draws == int(row.draws), "draws:%s t%d %d vs %d" % [c.id, row.t, env.draws, row.draws])
			stats.draws += env.draws
			for k in FIELDS: _cmp(e.get(k), row.e.get(k), "e:%s t%d .%s" % [c.id, row.t, k])
			_cmp(float(e.kb.x), float(row.e.kbx), "e:%s t%d kbx" % [c.id, row.t])
			_cmp(float(e.kb.y), float(row.e.kby), "e:%s t%d kby" % [c.id, row.t])
			check(env.ev.size() == row.ev.size(), "ev_len:%s t%d %d vs %d %s | %s" % [c.id, row.t, env.ev.size(), row.ev.size(), str(env.ev).left(300), str(row.ev).left(300)])
			for i in range(mini(env.ev.size(), row.ev.size())):
				var exp_ev: Variant = row.ev[i]
				if exp_ev is Array and exp_ev.size() > 1 and exp_ev[1] is Dictionary: exp_ev[1].erase("_tag")
				_cmp(env.ev[i], exp_ev, "ev:%s t%d[%d]" % [c.id, row.t, i])
				var name: String = str(env.ev[i][0])
				stats.per_etype[et_key].events[name] = int(stats.per_etype[et_key].events.get(name, 0)) + 1
				if name == "shot": stats.shots += 1
				if name == "proj": stats.projs += 1
				if name == "hurtP": stats.hurtP += 1
				if name == "playVFXAng": stats.teleports += 1
			stats.events += env.ev.size()
			var got_spawned: Array = []
			for n in env.ens.slice(before):
				got_spawned.append({"etype": n.etype, "x": n.x, "y": n.y, "hp": n.hp, "mhp": n.mhp, "el": n.el, "eShield": n.eShield, "speed": n.speed, "r": n.r, "st2": n.st2, "facing": n.facing} if n is Dictionary else null)
			stats.spawned += got_spawned.size()
			_cmp(got_spawned, row.spawned, "spawned:%s t%d" % [c.id, row.t])
			_cmp(float(env.P.kb.x), float(row.P.kbx), "P:%s t%d kbx" % [c.id, row.t])
			_cmp(float(env.P._freezeSlow), float(row.P._freezeSlow), "P:%s t%d freeze" % [c.id, row.t])
			_cmp(float(env.P.parryBank), float(row.P.parryBank), "P:%s t%d bank" % [c.id, row.t])
	print("PC_ENEMY_KERNEL_FAILS ", JSON.stringify(fail_samples))
	print("PC_ENEMY_KERNEL_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "stats": stats}))
	quit(1 if failures else 0)

func _close(a: Variant, b: Variant) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		var x := float(a)
		var y := float(b)
		if x == y: return true
		if is_nan(x) and is_nan(y): return true
		return absf(x - y) <= 1e-9 * maxf(1.0, maxf(absf(x), absf(y)))
	if a == null and b == null: return true
	return a == b

func _cmp(a: Variant, b: Variant, label: String) -> void:
	if a is Dictionary and b is Dictionary:
		var keys := {}
		for k in a: keys[k] = true
		for k in b: keys[k] = true
		for k in keys: _cmp(a.get(k), b.get(k), label + "." + str(k))
		return
	if a is Array and b is Array:
		check(a.size() == b.size(), label + ":size %d vs %d" % [a.size(), b.size()])
		for i in range(mini(a.size(), b.size())): _cmp(a[i], b[i], label + "[" + str(i) + "]")
		return
	if a is bool or b is bool:
		check(a == b, label + " %s vs %s" % [a, b])
		return
	check(_close(a, b), label + " %s vs %s" % [a, b])
