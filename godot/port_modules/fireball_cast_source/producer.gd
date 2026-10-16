extends RefCounted
## Fireball (악의구) RMB magic cast — source-faithful candidate, v2 (single owner-applied operations).
##
## Source: /Users/fordeargamers/Projects/exoduser-migration-20261001/game.html
##   HEAD f8a8889846e53f5c063c24f469b080c8de415b6e, blob a4f8846bb9f9600a6c9da0e117b92d6d437920af (exact lines).
##
## v2 fixes vs v1 (frozen at skill-fireball-candidate-20261017):
##   (1) v1 committed MP and P fields in two separate callbacks -> MP-only spend possible.
##   (2) v1 emitted, then committed recover fields separately -> duplicate fire possible.
## In the source both are ONE statement sequence of the same owner (28956, 33641-33646).
## v2 therefore asks the real P/MP owner to pre-validate and apply each sequence as ONE request:
##   apply_cast_start  : 28956  P.s='magicCast';P.st2=~~(14/pMagicSpd());P.atkArc=P.facing;P._mpBon=useMp('magic')*2
##   apply_cast_finish : 33641  P._mpBon=0 (after reading it into dmg)
##                       33644  projectile push
##                       33645  _addSkProf('fireball'); playSample('fireball',.8,_r(1,.08))
##                       33646  P.s='magicRecover';P.st2=12
##   apply_recover_idle: 33656  P.s='idle'  (single field)
## Owner contract: validate everything first; on rejection perform ZERO writes; on acceptance apply all steps in the
## listed order. No refund, rollback or generic transaction layer exists or is implied. This producer never writes
## P/MP itself and never owns current P/MP.
##
## Other source anchors:
##   6193 BINDS.beam='mouse2' (RMB; E is BINDS.shield)
##   33067 idle / 33583 bowRecover (before its st2 check) / 33653-33656 magicRecover st2<=0:
##         isHeld('beam')&&P.mp>=mpCost('magic') -> _execMagicE()
##   28949-28957 _execMagicE: _MAGIC_E_HANDLERS[activeMagicSk||'fireball'] first; _gpAutoAim(400) if _gpActive
##   28881-28948 handler keys: burstLoop blueShot fireAura elemMissile omniBeam energyShot arcLaser fireBeam
##   31960 _COST_BASE.magic=10; 31967 'magic' not in _COST_SK -> _dpsCostMul=1; 31992 mpCost=~~(base*dps*pMagicCost())
##   31996 useMp: c=mpCost(key), b=P.mp, P.mp=max(0,P.mp-c), returns b-P.mp
##   32792 P.st2-=sp (single decrement; Player update owner)
##   33588-33637 magicCast st2<=0: elemMissile/blueShot/fireAura/fireBeam (lv>=1) else fireball (33638-33647)
##   44535 _SK_MUL.fireball={b:13.2,g:10.56}; 44556 _skMul=b+(lv-1)*g*0.5, lv=P.skills[id]||1
##   27995 statInt()=1; 28772 magicRef; 28039 pMagicMul(true); 28041 pMagicCost; 28050 pMagicSpd; 44557 _fuseMul
##   16502 hm()=INV.equipped.helmet||{}; 14333 EL.D=3
## Not owned: Q branches in recover states (33650-33652, 33579-33581) and _tryKiSlashQCancel (33346) — caller reports
## higher_priority_consumed; 80% movement during cast (33347-33352); the 8 handler bodies; projectile flight/explosion.

const SCHEMA := "exoduser.godot.skill-fireball-cast-source.owner-v3"
const INT32 = preload("res://port_modules/combat_stat_formula/producer.gd")

const SKILL_ID := "fireball"
const COST_BASE_MAGIC := 10.0
const COST_DPS_MUL_MAGIC := 1.0
const CAST_FRAMES_NUM := 14.0
const RECOVER_FRAMES := 12
const MP_BONUS_FACTOR := 2
const STAT_INT := 1.0
const SK_MUL_B := 13.2
const SK_MUL_G := 10.56
const LEVEL_SCALE_STEP := 0.50
const SPAWN_OFFSET := 14.0
const SPEED := 5.5
const R0 := 12
const R_BASE := 12.0
const EXPL_R_BASE := 80.0
const EXPL_DMG_FACTOR := 0.6
const MAX_DIST_BASE := 400.0
const MAX_DIST_PER_LEVEL := 50.0
const BONUS_RANGE_FACTOR := 20.0
const KB := 0.005
const KB_MULT := 0.1
const ELEMENT_DARK := 3
const GAMEPAD_AIM_RANGE := 400
const SAMPLE := {"key": "fireball", "vol": 0.8, "rate_center": 1.0, "rate_spread": 0.08}

const HANDLER_KEYS := ["burstLoop", "blueShot", "fireAura", "elemMissile", "omniBeam", "energyShot", "arcLaser", "fireBeam"]
const CAST_COMPLETION_OTHER := ["elemMissile", "blueShot", "fireAura", "fireBeam"]
const ENTRY_STATES := ["idle", "bowRecover", "magicRecover"]

const STATUS_CAST_STARTED := "CAST_STARTED"
const STATUS_FIRED := "FIRED"
const STATUS_RECOVER_IDLE := "RECOVER_IDLE"
const STATUS_WAITING := "WAITING"
const STATUS_REJECTED := "REJECTED"
const STATUS_DEFERRED := "DEFERRED_OTHER_OWNER"
const STATUS_OWNER_REJECTED := "OWNER_REJECTED"
const STATUS_NOT_READY := "NOT_READY"

const REQUIRED_BINDINGS := [
	"read_p",              # () -> Dictionary current P
	"read_beam_held",      # () -> bool isHeld('beam')
	"read_gamepad_active", # () -> bool _gpActive
	"read_p_magic_cost",   # () -> float pMagicCost()
	"read_p_magic_spd",    # () -> float pMagicSpd()
	"read_magic_ref",      # () -> float magicRef()
	"read_p_magic_mul",    # () -> float pMagicMul(true)
	"read_fuse_mul",       # (skill_id) -> float _fuseMul(skill_id)
	"read_helmet",         # () -> Variant INV.equipped.helmet
	"apply_cast_start",    # (packet) -> {accepted:bool, reason?, mp_before, mp_after}
	"apply_cast_finish",   # (packet) -> {accepted:bool, reason?}
	"apply_recover_idle",  # (packet) -> {accepted:bool, reason?}
]
const OPTIONAL_BINDINGS := [
	"gamepad_auto_aim",    # (range:int) -> void; required only when gamepad active
	"try_magic_handler",   # (skill_id) -> bool; required only when activeMagicSk is a handler key
]

var _b: Dictionary = {}
var _configured := false
var _last: Dictionary = {}

func configure(bindings: Dictionary) -> bool:
	_configured = false
	for k in REQUIRED_BINDINGS:
		if not bindings.has(k) or not (bindings[k] is Callable) or not bindings[k].is_valid():
			_last = _nr("missing_binding:" + k)
			return false
	for k in OPTIONAL_BINDINGS:
		if bindings.has(k) and (not (bindings[k] is Callable) or not bindings[k].is_valid()):
			_last = _nr("invalid_optional_binding:" + k)
			return false
	_b = bindings.duplicate()
	_configured = true
	return true

## Public readiness: configured and every required binding still valid.
func is_ready() -> bool:
	if not _configured: return false
	for k in REQUIRED_BINDINGS:
		if not _b[k].is_valid(): return false
	return true

func mp_cost_magic() -> Variant:
	if not is_ready(): return null
	var pmc: Variant = _b.read_p_magic_cost.call()
	if not _is_num(pmc): return null
	return INT32.js_to_int32(COST_BASE_MAGIC * COST_DPS_MUL_MAGIC * float(pmc))

## entry: "idle" (33067) | "bowRecover" (33583) | "magicRecover" (33653-33656)
func request(entry: String, higher_priority_consumed: bool = false) -> Dictionary:
	if not is_ready(): return _record_last(_nr("not_ready"))
	if entry not in ENTRY_STATES: return _record_last(_nr("unknown_entry:" + entry))
	if higher_priority_consumed: return _record_last({"status": STATUS_REJECTED, "reason": "higher_priority_branch_consumed"})
	var p: Variant = _b.read_p.call()
	if not p is Dictionary: return _record_last(_nr("current_p_not_ready"))
	if str(p.get("s")) != entry: return _record_last(_nr("p_state_mismatch:" + str(p.get("s"))))
	if entry == "magicRecover" and not (_is_num(p.get("st2")) and float(p.st2) <= 0.0):
		return _record_last({"status": STATUS_WAITING, "reason": "recover_frames_remaining"})
	var held: Variant = _b.read_beam_held.call()
	if not held is bool: return _record_last(_nr("beam_held_reader_not_bool"))
	var cost: Variant = mp_cost_magic()
	if cost == null: return _record_last(_nr("mp_cost_unavailable"))
	if not _is_num(p.get("mp")): return _record_last(_nr("current_mp_not_numeric"))
	if not held or float(p.mp) < float(cost):
		var why := "beam_not_held" if not held else "mp_below_cost"
		if entry == "magicRecover": return _record_last(_recover_idle(why))
		return _record_last({"status": STATUS_REJECTED, "reason": why, "cost": cost, "mp": p.mp})
	return _record_last(_exec_magic_e(p, entry))

## 28949-28957
func _exec_magic_e(p: Dictionary, entry: String) -> Dictionary:
	var sel: Variant = _js_or(p.get("activeMagicSk"), SKILL_ID)
	if sel is String and sel in HANDLER_KEYS:
		if not _b.has("try_magic_handler"): return _nr("magic_handler_owner_missing:" + sel)
		var handled: Variant = _b.try_magic_handler.call(sel)
		if not handled is bool: return _nr("magic_handler_result_not_bool:" + sel)
		if handled: return {"status": STATUS_DEFERRED, "reason": "handled_by_magic_handler:" + sel, "entry": entry}
	var gp: Variant = _b.read_gamepad_active.call()
	if not gp is bool: return _nr("gamepad_reader_not_bool")
	if gp:
		if not _b.has("gamepad_auto_aim"): return _nr("gamepad_auto_aim_owner_missing")
		_b.gamepad_auto_aim.call(GAMEPAD_AIM_RANGE)
	var spd: Variant = _b.read_p_magic_spd.call()
	if not _is_num(spd) or float(spd) == 0.0: return _nr("p_magic_spd_unavailable")
	var cost: Variant = mp_cost_magic()
	if cost == null: return _nr("mp_cost_unavailable")
	var packet := {
		"op": "cast_start", "source": "game.html:28956", "skill": SKILL_ID,
		"expected_state": entry, "cost": cost, "cast_frames": INT32.js_to_int32(CAST_FRAMES_NUM / float(spd)),
		"mp_bonus_factor": MP_BONUS_FACTOR,
		"order": ["s=magicCast", "st2=cast_frames", "atkArc=P.facing", "b=P.mp", "P.mp=max(0,P.mp-cost)", "_mpBon=(b-P.mp)*mp_bonus_factor"],
	}
	var res: Variant = _b.apply_cast_start.call(packet)
	if not res is Dictionary: return _nr("cast_start_owner_result_not_dictionary")
	if res.get("accepted") != true:
		return {"status": STATUS_OWNER_REJECTED, "op": "cast_start", "reason": str(res.get("reason", "owner_rejected")), "writes": "none_by_contract"}
	var after: Variant = _b.read_p.call()
	var ok: bool = after is Dictionary and str(after.get("s")) == "magicCast" and _num_eq(after.get("st2"), packet.cast_frames) \
		and _is_num(res.get("mp_before")) and _is_num(res.get("mp_after")) and _num_eq(after.get("mp"), res.mp_after) \
		and _num_eq(after.get("_mpBon"), (float(res.mp_before) - float(res.mp_after)) * MP_BONUS_FACTOR)
	if not ok: return _nr("cast_start_owner_accepted_but_current_p_mismatch")
	return {"status": STATUS_CAST_STARTED, "entry": entry, "cast_frames": packet.cast_frames, "mp_cost": cost,
		"mp_consumed": float(res.mp_before) - float(res.mp_after), "mp_bonus": after.get("_mpBon")}

## Call from the owner's 'magicCast' handling after its single st2 decrement (32792).
func tick_cast() -> Dictionary:
	if not is_ready(): return _record_last(_nr("not_ready"))
	var p: Variant = _b.read_p.call()
	if not p is Dictionary: return _record_last(_nr("current_p_not_ready"))
	if str(p.get("s")) != "magicCast": return _record_last({"status": STATUS_REJECTED, "reason": "not_in_magic_cast"})
	if not _is_num(p.get("st2")): return _record_last(_nr("st2_not_numeric"))
	if float(p.st2) > 0.0: return _record_last({"status": STATUS_WAITING, "reason": "cast_frames_remaining", "st2": p.st2})
	var sk: Variant = _js_or(p.get("activeMagicSk"), SKILL_ID)
	var skills: Variant = p.get("skills")
	if sk is String and sk in CAST_COMPLETION_OTHER and skills is Dictionary and _is_num(skills.get(sk)) and float(skills.get(sk)) >= 1.0:
		return _record_last({"status": STATUS_DEFERRED, "reason": "magic_cast_completion_owned_by:" + sk})
	return _record_last(_finish_fireball(p))

## 33638-33646
func _finish_fireball(p: Dictionary) -> Dictionary:
	var skills: Variant = p.get("skills")
	var lv: Variant = _js_or(skills.get(SKILL_ID) if skills is Dictionary else null, 1)
	if not _is_num(lv): return _nr("fireball_level_not_numeric")
	var lvf: float = float(lv)
	var scale: float = 1.0 + (lvf - 1.0) * LEVEL_SCALE_STEP
	var mref: Variant = _b.read_magic_ref.call()
	var pmm: Variant = _b.read_p_magic_mul.call()
	var fmul: Variant = _b.read_fuse_mul.call(SKILL_ID)
	if not _is_num(mref) or not _is_num(pmm) or not _is_num(fmul): return _nr("damage_inputs_unavailable")
	var raw_mp_bon: Variant = p.get("_mpBon")          # identity kept for the owner's pre-validation
	var mp_bon: Variant = _js_or(raw_mp_bon, 0)
	if not _is_num(mp_bon): return _nr("mp_bonus_not_numeric")
	var sk_mul: float = SK_MUL_B + (lvf - 1.0) * SK_MUL_G * 0.5
	# 33641: ~~(product) + (P._mpBon||0) — only the product is truncated.
	var mdmg: float = float(INT32.js_to_int32(float(mref) * STAT_INT * float(pmm) * sk_mul * float(fmul))) + float(mp_bon)
	var arc: Variant = p.get("atkArc")
	if not _is_num(arc) or not _is_num(p.get("x")) or not _is_num(p.get("y")): return _nr("player_pose_not_numeric")
	var helm: Variant = _b.read_helmet.call()
	var bonus_range: Variant = _js_or(helm.get("bonusRange") if helm is Dictionary else null, 0)
	if not _is_num(bonus_range): return _nr("helmet_bonus_range_not_numeric")
	var dx: float = cos(float(arc))
	var dy: float = sin(float(arc))
	var payload := {
		"source": "fireball", "x": float(p.x) + dx * SPAWN_OFFSET, "y": float(p.y) + dy * SPAWN_OFFSET,
		"vx": dx * SPEED, "vy": dy * SPEED, "dmg": mdmg, "el": ELEMENT_DARK,
		"maxDist": MAX_DIST_BASE + (lvf - 1.0) * MAX_DIST_PER_LEVEL + float(bonus_range) * BONUS_RANGE_FACTOR,
		"dist": 0.0, "r": R0, "stagger": 0, "kb": KB, "kbMult": KB_MULT, "magic": true, "fireball": true,
		"explR": INT32.js_to_int32(EXPL_R_BASE * scale), "explDmg": INT32.js_to_int32(mdmg * EXPL_DMG_FACTOR),
		"_fbR0": R0, "_fbRMax": INT32.js_to_int32(R_BASE * scale),
	}
	var packet := {
		"op": "cast_finish", "source": "game.html:33641-33646", "skill": SKILL_ID,
		"expected_state": "magicCast", "expected_mp_bon": raw_mp_bon, "payload": payload,
		"proficiency_skill": SKILL_ID, "sample": SAMPLE.duplicate(), "recover_state": "magicRecover", "recover_frames": RECOVER_FRAMES,
		"order": ["_mpBon=0", "emit(payload)", "addSkProf(proficiency_skill)", "playSample(sample)", "s=recover_state", "st2=recover_frames"],
	}
	var res: Variant = _b.apply_cast_finish.call(packet)
	if not res is Dictionary: return _nr("cast_finish_owner_result_not_dictionary")
	if res.get("accepted") != true:
		return {"status": STATUS_OWNER_REJECTED, "op": "cast_finish", "reason": str(res.get("reason", "owner_rejected")), "writes": "none_by_contract"}
	var after: Variant = _b.read_p.call()
	var ok: bool = after is Dictionary and str(after.get("s")) == "magicRecover" and _num_eq(after.get("st2"), RECOVER_FRAMES) \
		and _num_eq(after.get("_mpBon"), 0)
	if not ok: return _nr("cast_finish_owner_accepted_but_current_p_mismatch")
	return {"status": STATUS_FIRED, "payload": payload, "level": lv,
		"proficiency_applied": res.get("proficiency_applied"), "sample_applied": res.get("sample_applied")}

## 33656
func _recover_idle(reason: String) -> Dictionary:
	var res: Variant = _b.apply_recover_idle.call({"op": "recover_idle", "source": "game.html:33656", "expected_state": "magicRecover"})
	if not res is Dictionary or res.get("accepted") != true:
		return {"status": STATUS_OWNER_REJECTED, "op": "recover_idle", "reason": str(res.get("reason", "owner_rejected")) if res is Dictionary else "owner_result_not_dictionary"}
	return {"status": STATUS_RECOVER_IDLE, "reason": reason}

func get_snapshot() -> Dictionary:
	return {"schema": SCHEMA, "ready": is_ready(), "last": _last.duplicate(true),
		"optional_bound": OPTIONAL_BINDINGS.filter(func(k): return _b.has(k))}

static func _js_falsy(v: Variant) -> bool:
	if v == null: return true
	if v is bool: return not v
	if v is int: return v == 0
	if v is float: return v == 0.0 or is_nan(v)
	if v is String or v is StringName: return str(v).is_empty()
	return false

static func _js_or(v: Variant, fallback: Variant) -> Variant:
	return fallback if _js_falsy(v) else v

static func _is_num(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))

static func _num_eq(a: Variant, b: Variant) -> bool:
	return _is_num(a) and _is_num(b) and float(a) == float(b)

func _nr(reason: String) -> Dictionary:
	return {"status": STATUS_NOT_READY, "reason": reason}

func _record_last(r: Dictionary) -> Dictionary:
	_last = r
	return r
