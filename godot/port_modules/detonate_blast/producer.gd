extends RefCounted
# EXODUSER _detonateBlast first production producer (Godot port).
# Canonical source: /Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:43824-43887.
# Callers (central, not owned here): 31764/31772 eModHitP M01/M18, 33911/33918 whirlDet auto/Q,
# 34371 sBlock auto, 41366 enemy shieldBash forced, 43965 release parry.
# No autonomous tick/process: source only runs when a caller invokes it.
# _slamStormBlast (game.html:43889) is a separate path and is NOT ported or aliased here.

const SOURCE_REF = "game.html:43824-43887"
const SLAM_STORM_BLAST_REF = "game.html:43889"

# game.html:15066
const EL_P = 0
const EL_F = 1
const EL_I = 2
const EL_D = 3
const EL_L = 4
const EL_H = 5
const EL_E = 6

const LABEL_DEFAULT = "기폭팔"
const LABEL_FORCED = "강제기폭!"
const LABEL_SLAM_DET = "지진기폭!"
# game.html:45045 _SK_MUL.detonate
const SK_MUL_DETONATE_B = 8.0
const SK_MUL_DETONATE_G = 6.4

# Readonly providers and command sinks. Every key is required; nothing is silently stubbed.
const REQUIRED_CONTEXT = [
	"player_snapshot",  # () -> {x,y,s,skills,fused,parryT,parryBank,wwAng,iframes}
	"melee_ref",        # () -> meleeRef()
	"stat_str",         # () -> statStr()
	"p_atk_mul",        # () -> pAtkMul()
	"fuse_star",        # (skId) -> _fuseStar(skId)
	"eq_affix",         # (id) -> _eqAffix(id)
	"world_snapshot",   # () -> {no_hit_stop_t, slow_mo, hit_stop, opt_shake, opt_hit_stop}
	"query_targets",    # (x,y,r) -> Array  (shQuery)
	"localize",         # (s) -> _T(s)
	"rng",              # () -> Math.random() of the global native kernel
	"add_sk_prof",      # (skId) -> _addSkProf
	"sfx",              # (name) -> SFX[name]()
	"play_sample",      # (key, vol, rate)
	"push_slam_wave",   # (wave) -> G._gSlamWave.push
	"set_world_feel",   # (fields{shake?,slowMo?,hitStop?})
	"add_txt",          # (x,y,text,color,life)
	"add_blast_light",  # (x,y,r,life,cr,cg,cb)
	"play_vfx_ang",     # (id,x,y,scale,speed,ang,isSkill)
	"pool_part",        # (x,y,vx,vy,col,sz,life)
	"set_player_tail",  # (fields{iframes,parryBank,parryT})
]
# Target adapter (enemy body, centrally owned). receive_damage is the hurtE adapter.
const TARGET_METHODS = ["detonate_snapshot", "receive_damage", "add_detonate_kb", "apply_poise_fields"]

var _ctx: Dictionary = {}
var _configured = false
var _rng_draws = 0

func configure(ctx: Dictionary) -> Dictionary:
	var missing = missing_dependencies(ctx)
	_configured = missing.is_empty()
	_ctx = ctx if _configured else {}
	return {"ok": _configured, "missing": missing}

static func missing_dependencies(ctx: Dictionary) -> Array:
	var missing: Array = []
	for key in REQUIRED_CONTEXT:
		var c = ctx.get(key)
		if not (c is Callable) or not c.is_valid():
			missing.append(key)
	return missing

# JS ~~x (ToInt32): truncation toward zero with 32-bit wrap; differs from floor for negatives.
static func js_i32(value: float) -> int:
	if not is_finite(value) or value == 0.0:
		return 0
	var wrapped = fmod(ceilf(value) if value < 0.0 else floorf(value), 4294967296.0)
	if wrapped < 0.0:
		wrapped += 4294967296.0
	return int(wrapped - 4294967296.0 if wrapped >= 2147483648.0 else wrapped)

static func _truthy(v: Variant) -> bool:
	match typeof(v):
		TYPE_NIL:
			return false
		TYPE_BOOL:
			return v
		TYPE_INT:
			return v != 0
		TYPE_FLOAT:
			return v != 0.0 and not is_nan(v)
		TYPE_STRING, TYPE_STRING_NAME:
			return String(v) != ""
	return true

# JS (v||0)
static func _or0(v: Variant) -> float:
	return float(v) if _truthy(v) else 0.0

# game.html:15077
static func el_mul(a: int, d: int) -> float:
	if a == EL_F and d == EL_I: return 2.0
	if a == EL_I and d == EL_F: return 2.0
	if a == EL_D and d == EL_L: return 2.0
	if a == EL_L and d == EL_D: return 2.0
	if a == EL_D and d == EL_H: return 2.0
	if a == EL_H and d == EL_D: return 2.0
	if a == EL_E and d == EL_L: return 2.0
	if a == EL_L and d == EL_E: return 2.0
	if a == d and a != EL_P: return 0.5
	return 1.0

# game.html:45087 _skMul('detonate')
static func sk_mul_detonate(skills: Dictionary) -> float:
	var lv = _or0(skills.get("detonate"))
	if lv == 0.0:
		lv = 1.0
	return SK_MUL_DETONATE_B + (lv - 1.0) * SK_MUL_DETONATE_G * 0.5

# game.html:45088 _fuseMul (non chargeBoost/magicBlink branch)
static func fuse_mul(star: float, skill_boost: float) -> float:
	var fm = 1.0 + (star - 1.0) * 0.2 if star >= 2.0 else 1.0
	return fm * (1.0 + skill_boost)

# Pure numeric part of game.html:43826-43840.
static func quote_from(p: Dictionary, melee_ref: float, stat_str: float, p_atk_mul: float, fuse_star: float, skill_boost: float) -> Dictionary:
	var skills: Dictionary = p.get("skills", {})
	var fused: Dictionary = p.get("fused", {})
	var wd_fused = _truthy(fused.get("whirlDet"))
	var det_lv = _or0(skills.get("detonate"))
	if det_lv == 0.0:
		det_lv = 1.0
	var bars = mini(3, 1 + js_i32(_or0(p.get("parryT")) / 60.0))
	var tier = 48 if bars == 3 else (32 if bars == 2 else 19)
	var base = js_i32(melee_ref * stat_str * p_atk_mul * sk_mul_detonate(skills) * tier)
	var parry = js_i32(_or0(p.get("parryBank")) * bars * 2.5)
	var storm = 1.5 if _truthy(fused.get("stormBurst")) else (1.2 if _truthy(fused.get("stormBeam")) else 1.0)
	var fm = fuse_mul(fuse_star, skill_boost)
	var boom = js_i32((base + parry) * fm * storm)
	# _wwBaseRDet (43837) is computed but never read in source; it has no side effects and is omitted.
	var ww_grow = minf(1.0, _or0(p.get("wwAng")) / 63.0) + minf(1.0, _or0(p.get("parryBank")) / 500.0) if wd_fused else 0.0
	var ww_lv = _or0(skills.get("whirlwind"))
	if ww_lv == 0.0:
		ww_lv = 1.0
	var ww_r = 100.0 + (200.0 + (ww_lv - 1.0) * 15.0 - 100.0) * minf(1.0, ww_grow) if wd_fused else 0.0
	var boom_r = maxf(ww_r, (150.0 + (det_lv - 1.0) * 10.0) * bars)
	return {"det_lv": det_lv, "bars": bars, "tier": tier, "base": base, "parry": parry, "fuse_mul": fm, "storm_mul": storm, "boom": boom, "ww_r": ww_r, "boom_r": boom_r, "wd_fused": wd_fused, "slam_storm": _truthy(fused.get("slamStorm"))}

func quote(p: Dictionary) -> Dictionary:
	return quote_from(p, float(_call("melee_ref")), float(_call("stat_str")), float(_call("p_atk_mul")), float(_call("fuse_star", ["detonate"])), float(_call("eq_affix", ["skillBoost"])))

# Caller guard of game.html:41366 (enemy shieldBash) and 31764/31772 (eModHitP M01/M18).
# Returns "none" | "detonate" | "slam_storm_blast". No damage-acceptance gate exists in source.
static func forced_guard(p: Dictionary, require_bank: bool) -> String:
	var skills: Dictionary = p.get("skills", {})
	var fused: Dictionary = p.get("fused", {})
	if not (str(p.get("s", "")) == "whirlwind" and _truthy(skills.get("detonate")) and _truthy(fused.get("whirlDet")) and (not require_bank or _or0(p.get("parryBank")) > 0.0) and _or0(p.get("parryT")) >= 120.0):
		return "none"
	return "slam_storm_blast" if _truthy(fused.get("slamStorm")) else "detonate"

# Forced detonate callback: _detonateBlast('강제기폭!', EL.P).
func forced_detonate() -> Dictionary:
	return detonate_blast(LABEL_FORCED, EL_P)

func forced_from_shield_bash() -> Dictionary:
	return _forced_by_guard(true, "game.html:41366")

func forced_from_emod_freeze_shock() -> Dictionary:
	return _forced_by_guard(false, "game.html:31764/31772")

func _forced_by_guard(require_bank: bool, ref: String) -> Dictionary:
	if not _configured:
		return {"ran": false, "error": "missing_dependency", "missing": REQUIRED_CONTEXT.duplicate()}
	var guard = forced_guard(_call("player_snapshot"), require_bank)
	if guard == "none":
		return {"ran": false, "guard": guard, "caller": ref}
	if guard == "slam_storm_blast":
		# Explicit gap: never aliased to _detonateBlast.
		return {"ran": false, "guard": guard, "caller": ref, "error": "slam_storm_blast_not_ported", "source": SLAM_STORM_BLAST_REF}
	var receipt = forced_detonate()
	receipt["guard"] = guard
	receipt["caller"] = ref
	return receipt

# game.html:43824 _detonateBlast(label, elSrc)
func detonate_blast(label: Variant, el_src: Variant) -> Dictionary:
	if not _configured:
		return {"ran": false, "error": "missing_dependency", "missing": REQUIRED_CONTEXT.duplicate()}
	_rng_draws = 0
	var p: Dictionary = _call("player_snapshot")
	var skills: Dictionary = p.get("skills", {})
	if not _truthy(skills.get("detonate")):
		return {"ran": false, "reason": "no_detonate_skill"}
	# 43826 _wdFused is read from this snapshot; 43827 _addSkProf precedes the numeric helpers (43828+).
	# _addSkProf only writes _catProf/_skProf, none of the P fields the formula reads.
	_call("add_sk_prof", ["detonate"])
	var q = quote(p)
	var px = float(p.get("x", 0.0))
	var py = float(p.get("y", 0.0))
	var bars: int = q.bars
	var boom: int = q.boom
	var boom_r: float = q.boom_r
	if q.slam_storm:
		_call("sfx", ["shout"])
		_call("sfx", ["slam"])
		_call("push_slam_wave", [{"x": px, "y": py, "r": 60, "maxR": boom_r, "t": 0, "maxT": 45}])
	else:
		_call("sfx", ["slash"])
		_call("sfx", ["detonate"])
	if _rand() < 0.4:
		_call("play_sample", ["voice_explode", 0.8, 1.0 * (1.0 + (_rand() - 0.5) * 2.0 * 0.1)])
	var w: Dictionary = _call("world_snapshot")
	if not (float(w.get("no_hit_stop_t", 0.0)) > 0.0):
		var feel = {"shake": (14.0 + bars * 4) * float(w.get("opt_shake", 100.0)) / 100.0}
		if float(w.get("slow_mo", NAN)) <= 0.0:
			feel["slowMo"] = 25 + bars * 5
		feel["hitStop"] = maxf(float(w.get("hit_stop", 0.0)), js_i32((10 + bars * 3) * float(w.get("opt_hit_stop", 100.0)) / 100.0))
		_call("set_world_feel", [feel])
	var shown_label = str(label) if _truthy(label) else LABEL_DEFAULT
	_call("add_txt", [px, py - 30.0, str(_call("localize", [shown_label])) + " " + str(bars) + "단계 ×" + str(q.tier) + " " + str(boom), "#ff2200", 70])
	var is_slam_det = typeof(label) == TYPE_STRING and label == LABEL_SLAM_DET  # 43851 label==='지진기폭!'
	if not is_slam_det:
		_call("add_blast_light", [px, py, boom_r * 1.2, 18 + bars * 4, 255, 160, 60])
		_call("play_vfx_ang", ["center_explode", px, py, boom_r / 200.0 * (1.0 + bars * 0.2), 3, 0, true])
		_call("play_vfx_ang", ["eq_impact", px, py, boom_r / 256.0, 4 + bars * 2, 0, true])
		var n = 12 + bars * 3
		for bi in range(n):
			var ba = TAU * bi / n
			var vx = cos(ba) * (5.0 + _rand() * 7.0)
			var vy = sin(ba) * (5.0 + _rand() * 7.0)
			var col = "#ff6622" if bi % 2 != 0 else "#ffcc44"
			var sz = 2.0 + _rand() * 3.0
			var life = 10.0 + _rand() * 8.0
			_call("pool_part", [px, py, vx, vy, col, sz, life])
	var det_el = int(el_src) if _truthy(el_src) else 0
	# 43862-43863 shQuery at its original point, then the shallow _ne_det copy.
	var queried = _call("query_targets", [px, py, boom_r])
	var targets: Array = []
	for t in queried:
		targets.append(t)
	# Port integration check at the query point. Not atomic: the source effects above have already run.
	var bad: Array = []
	for i in targets.size():
		if not _target_ok(targets[i]):
			bad.append(i)
	if not bad.is_empty():
		return {"ran": false, "error": "target_adapter_missing", "indices": bad, "required": TARGET_METHODS.duplicate(), "effects_before_rejection": true, "rng_draws": _rng_draws}
	var hits: Array = []
	for i in targets.size():
		var e: Object = targets[i]
		var s: Dictionary = e.call("detonate_snapshot")
		var ex = float(s.get("x", 0.0))
		var ey = float(s.get("y", 0.0))
		var d = sqrt((px - ex) * (px - ex) + (py - ey) * (py - ey))
		if not _truthy(s.get("alive")) or d >= boom_r:
			continue
		var ang = atan2(ey - py, ex - px)
		var falloff = maxf(0.0, 1.0 - d / boom_r)
		var dmg = js_i32(boom * (0.5 + falloff * 0.5))
		e.call("receive_damage", dmg, Vector2.from_angle(ang), "detonate", {"ang": ang, "noSound": false, "kbMult": 0, "noPoise": true, "detonate": true, "explode": true, "atkEl": det_el})
		# Applied regardless of hurtE outcome (source has no alive re-check here).
		var kb = Vector2(cos(ang) * 12.0 * falloff, sin(ang) * 12.0 * falloff)
		e.call("add_detonate_kb", kb)
		var after: Dictionary = e.call("detonate_snapshot")
		var em = el_mul(det_el, int(after.get("el", -1)))
		var hit = {"index": i, "dmg": dmg, "falloff": falloff, "ang": ang, "kb": kb, "el_mul": em}
		if _truthy(after.get("ib")):
			var g_label = str(_call("localize", ["💥 지진그로기!" if q.slam_storm else "💥 기폭그로기!"]))
			hit["branch"] = "boss_poise"
			hit["poise_amount"] = js_i32(_or_nan(after.get("max_poise")) * 0.20)
			hit["groggy"] = _poise_hit(e, hit.poise_amount, g_label)
		else:
			var s_lv = float(q.det_lv)
			if q.slam_storm:
				s_lv = _or0(skills.get("giantSlam"))
				if s_lv == 0.0:
					s_lv = 1.0
			var s_dur = 120.0 + (s_lv - 1.0) * 8.0
			var stun = maxf(_or0(after.get("stunned")), js_i32(s_dur * em))
			e.call("apply_poise_fields", {"stunned": stun, "poise": 0.0})
			_call("add_txt", [float(after.get("x", ex)), float(after.get("y", ey)) - 18.0, str(_call("localize", ["💫 기절!"])), "#ffcc00", 32])
			hit["branch"] = "normal_stun"
			hit["stunned"] = stun
		hits.append(hit)
	# Tail reads Player fresh: hurtE adapters may have changed iframes during the loop.
	var tail_p: Dictionary = _call("player_snapshot")
	var tail = {"iframes": maxf(float(tail_p.get("iframes", 0.0)), 30.0), "parryBank": 0, "parryT": 0}
	_call("set_player_tail", [tail])
	return {"ran": true, "label": shown_label, "el": det_el, "quote": q, "targets_queried": targets.size(), "hits": hits, "tail": tail, "rng_draws": _rng_draws, "source": SOURCE_REF}

# game.html:20431 _poiseHit(e, amt, label)
func _poise_hit(e: Object, amt: int, label: String) -> bool:
	var s: Dictionary = e.call("detonate_snapshot")
	if not _truthy(s.get("alive")) or amt <= 0:
		return false
	var ib = _truthy(s.get("ib"))
	if ib and float(s.get("p_immune", 0.0)) > 0.0:
		return false
	var poise = _or_nan(s.get("poise")) - amt
	if poise <= 0.0:
		var stun_t = 90.0 if ib else 180.0
		var fields = {"poise": 0.0, "poiseR": 0.0, "stunned": maxf(_or0(s.get("stunned")), stun_t), "_maxStunned": maxf(_or0(s.get("_maxStunned")), stun_t)}
		if ib:
			fields["_pImmune"] = 300.0
		e.call("apply_poise_fields", fields)
		_call("sfx", ["groggy"])
		var ex = float(s.get("x", 0.0))
		var ey = float(s.get("y", 0.0))
		_call("add_txt", [ex, ey - 22.0, label, "#ff8800", 60])
		var w: Dictionary = _call("world_snapshot")
		if not (float(w.get("no_hit_stop_t", 0.0)) > 0.0):
			_call("set_world_feel", [{"slowMo": 20}])
		for j in range(14):
			var a = TAU * j / 14.0
			_call("pool_part", [ex, ey, cos(a) * 7.0, sin(a) * 7.0, "#ffaa44", 3.0 + _rand() * 4.0, 18])
		return true
	e.call("apply_poise_fields", {"poise": poise, "poiseR": 0.0})
	return false

# Missing numeric field behaves like JS undefined arithmetic (NaN).
static func _or_nan(v: Variant) -> float:
	return NAN if v == null else float(v)

static func _target_ok(t: Variant) -> bool:
	if not (t is Object) or not is_instance_valid(t):
		return false
	for m in TARGET_METHODS:
		if not t.has_method(m):
			return false
	return true

func _rand() -> float:
	_rng_draws += 1
	return float(_call("rng"))

func _call(key: String, args: Array = []) -> Variant:
	return (_ctx[key] as Callable).callv(args)
