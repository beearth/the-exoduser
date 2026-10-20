class_name ExoduserNativeSourceProtectedRestoreHandoff
extends RefCounted
## PC-RUNTIME-STATS B (2026-10-21) — DEMO11-06 restore용 보호 handoff 3종.
## 보호(Q/E·활성 슬롯·Wing) 담당이 원본 복원 구간의 해당 줄만 detached state 사본에서
## 실행하고 source_restore_flow.gd(_handoff, :105–150)가 요구하는 관측을 반환한다:
##   {state:"returned"|"source_throw", before, after, allowed_leaves, changed_leaves, stage, source}
## 입력 state는 flow의 detached graph({player, game, skill_slots, ult_slot})이며 읽기만 한다.
## 실제 Player/State/INV 쓰기 0, IO 0, 틱 경로 0. 다른 줄(활성 슬롯 복원 앞뒤, 숫자 정규화,
## 합체 존재 보장)은 flow의 계산 단계가 소유한다.
##   protected_qe          = game.html dbRestore Q/RMB 복원 4줄 (현 main G3866–3869)
##   protected_active_sync = _syncActiveSkAfterReset(_getAllAbsorbed()) (G3880, 본문 G44644–44663)
##   protected_wing        = _sanitizeCoreState 안의 _ensureBaseWingStrike(P) (G3513, 본문 G3483–3490)

const JS = preload("res://port_modules/save_adapter/source_player_restore.gd")
const STAGES = ["protected_qe", "protected_active_sync", "protected_wing"]
const ALLOWED = {
	"protected_qe": [["player", "activeRMBSk"], ["player", "activeQSk"]],
	"protected_active_sync": [["player", "activeLMBSk"], ["player", "activeChargeSk"], ["player", "activeMagicSk"],
		["player", "activeQSk"], ["player", "activeCtSk"], ["player", "activeBowSk"], ["player", "activeRMBSk"]],
	"protected_wing": [["player", "skills", "maliceSwipe"], ["player", "skills", "shieldThrow"],
		["player", "_fused", "shieldFuse"], ["player", "activeRMBSk"]]}
const SOURCE = {"protected_qe": "game.html dbRestore if(d.activeRMBSk)…if(!P.activeQSk||P.activeQSk==='iceOrb')P.activeQSk='parry' (G3866-3869)",
	"protected_active_sync": "game.html _syncActiveSkAfterReset(_getAllAbsorbed()) (G3880; G44620-44627, G44644-44663)",
	"protected_wing": "game.html _sanitizeCoreState → _ensureBaseWingStrike(P) (G3513; G3483-3490)"}
## _syncActiveSkAfterReset 내부 합체 호스트 표 (원본 리터럴 _fhM, G44648).
const FUSE_HOSTS = {"elemFuse": "omniBeam", "sixFuse": "omniBeam", "stormBeam": "whirlwind", "stormBurst": "whirlwind",
	"whirlDet": "whirlwind", "slamStorm": "whirlwind", "dimBreach": "chargeBoost", "dimSlam": "chargeBoost",
	"dimThunder": "chargeBoost", "dimBlast": "chargeBoost", "bladeFuse": "maliceHunt", "plagueFuse": "maliceHunt",
	"plagueVenom": "maliceHunt", "iceMortar": "maliceMortar", "boneStorm": "maliceStorm", "elecRepent": "maliceStorm",
	"shieldFuse": "maliceSwipe", "holyFuse": "holyDome", "holyIce": "holyDome", "holyWeak1": "holyDome",
	"holyWeak2": "holyDome", "holyWeak3": "holyDome", "holyWeak4": "holyDome", "pillarSpike": "darkPillar",
	"pillarSlam": "giantSlam2", "infernoSlam": "giantSlam2", "siegeGhost": "ghostXbowTurret",
	"thunderGhost": "bladeDash", "timeStep": "timeWarp"}
const ACTIVE_RULES = [["activeLMBSk", "lmb", "kiSlash", false], ["activeChargeSk", "charge", "charge", true],
	["activeMagicSk", "magic", "fireball", true], ["activeQSk", "q", "parry", true],
	["activeCtSk", "ct", "ghostWalk", true], ["activeBowSk", "bow", "normal", true]]

## d = 저장 payload(serialized). activeRMBSk/activeQSk만 읽는다.
static func protected_qe(state: Dictionary, serialized: Dictionary) -> Dictionary:
	var shape := _shape_error(state)
	if not shape.is_empty(): return _hold("protected_qe", state, shape)
	var after: Dictionary = state.duplicate(true)
	var p: Dictionary = after["player"]
	if JS._truthy(serialized.get("activeRMBSk")): p["activeRMBSk"] = _copy(serialized["activeRMBSk"])
	if not JS._truthy(p.get("activeRMBSk")): p["activeRMBSk"] = "shieldBlock"
	if JS._truthy(serialized.get("activeQSk")): p["activeQSk"] = _copy(serialized["activeQSk"])
	if not JS._truthy(p.get("activeQSk")) or _str_eq(p.get("activeQSk"), "iceOrb"): p["activeQSk"] = "parry"
	return _done("protected_qe", state, after, "returned")

## tables = flow source_tables (pairs/absorbed/slot_defs). 원본 _getAllAbsorbed→_syncActiveSkAfterReset.
static func protected_active_sync(state: Dictionary, tables: Dictionary) -> Dictionary:
	var shape := _shape_error(state)
	if not shape.is_empty(): return _hold("protected_active_sync", state, shape)
	if not tables.get("pairs") is Dictionary or not tables.get("absorbed") is Dictionary or not tables.get("slot_defs") is Dictionary:
		return _hold("protected_active_sync", state, "source_owner_tables_absent")
	var after: Dictionary = state.duplicate(true)
	var p: Dictionary = after["player"]
	var fused: Variant = p.get("_fused")
	# _getAllAbsorbed: Object.keys(_FUSE_PAIRS) order, _isFused(k)=!!(P._fused&&P._fused[k]).
	var reset: Array = []
	for key in tables["pairs"]:
		if not (JS._truthy(fused) and fused is Dictionary and JS._truthy(fused.get(key))): continue
		for id in tables["absorbed"].get(key, []):
			if id not in reset: reset.append(id)
	var hosts: Array = []
	for key in FUSE_HOSTS:
		if JS._truthy(fused) and fused is Dictionary and JS._truthy(fused.get(key)): hosts.append(FUSE_HOSTS[key])
	if not p.get("skills") is Dictionary:
		# P.skills[sk] on a non-object throws in the original.
		return _done("protected_active_sync", state, state.duplicate(true), "source_throw")
	for rule in ACTIVE_RULES:
		var field: String = rule[0]
		var current: Variant = p.get(field)
		if not _sk_ok(current, rule[1], reset, hosts, p["skills"], tables["slot_defs"]) \
				and (not rule[3] or not _str_eq(current, rule[2])):
			p[field] = rule[2]
	if JS._truthy(p.get("activeRMBSk")) and _set_has(reset, p.get("activeRMBSk")):
		p["activeRMBSk"] = "maliceSwipe"
	return _done("protected_active_sync", state, after, "returned")

## 원본 _ensureBaseWingStrike(P): skills/_fused 부재 시 생성은 허용 leaf 밖 → flow가 HOLD.
static func protected_wing(state: Dictionary) -> Dictionary:
	if not state.get("player") is Dictionary: return _hold("protected_wing", state, "current_player_absent")
	var after: Dictionary = state.duplicate(true)
	var p: Dictionary = after["player"]
	if not JS._truthy(p.get("skills")): p["skills"] = {}
	if not p["skills"] is Dictionary: return _hold("protected_wing", state, "skills_carrier_unproven")
	for id in ["maliceSwipe", "shieldThrow"]:
		var raw: Variant = p["skills"].get(id)
		if raw is Dictionary or raw is Array: return _hold("protected_wing", state, "number_coercion_unproven:" + id)
		var n: float = NAN if not p["skills"].has(id) else JS._number(raw)
		var value: float = n if (n != 0.0 and not is_nan(n)) else 1.0  # Number(x)||1
		p["skills"][id] = maxf(1.0, value) if not is_nan(value) else NAN
	if not JS._truthy(p.get("_fused")): p["_fused"] = {}
	if not p["_fused"] is Dictionary: return _hold("protected_wing", state, "fused_carrier_unproven")
	p["_fused"]["shieldFuse"] = true
	p["activeRMBSk"] = "maliceSwipe"
	return _done("protected_wing", state, after, "returned")

static func _sk_ok(sk: Variant, slot_key: String, reset: Array, hosts: Array, skills: Dictionary, slot_defs: Dictionary) -> bool:
	if not JS._truthy(sk): return false
	if _set_has(reset, sk) and not _set_has(hosts, sk): return false
	var key: String = JS._string(sk) if not (sk is Dictionary or sk is Array) else ""
	if skills.has(key):
		var level: Variant = skills[key]
		if not (level is Dictionary or level is Array) and JS._number(level) >= 1.0: return true
	var def: Variant = slot_defs.get(slot_key)
	return def is Array and _set_has(def, sk)

static func _set_has(values: Array, item: Variant) -> bool:
	for value in values:
		if typeof(value) == typeof(item) and value == item: return true
		if (value is int or value is float) and (item is int or item is float) and float(value) == float(item): return true
	return false

static func _str_eq(value: Variant, text: String) -> bool:
	return value is String and value == text

static func _copy(value: Variant) -> Variant:
	return value.duplicate(true) if value is Dictionary or value is Array else value

static func _shape_error(state: Dictionary) -> String:
	if not state.get("player") is Dictionary: return "current_player_absent"
	return ""

static func _leaf_changes(stage: String, before: Dictionary, after: Dictionary) -> Array:
	var changed: Array = []
	for path in ALLOWED[stage]:
		var a: Variant = before
		var b: Variant = after
		for key in path:
			a = a.get(key) if a is Dictionary else null
			b = b.get(key) if b is Dictionary else null
		if typeof(a) != typeof(b) or a != b: changed.append(path)
	return changed

static func _done(stage: String, before: Dictionary, after: Dictionary, status: String) -> Dictionary:
	return {"stage": stage, "state": status, "before": before.duplicate(true), "after": after,
		"allowed_leaves": ALLOWED[stage].duplicate(true), "changed_leaves": _leaf_changes(stage, before, after),
		"source": SOURCE[stage], "detached": true, "live_writes": 0}

static func _hold(stage: String, before: Dictionary, reason: String) -> Dictionary:
	# Not a source observation: the flow treats a missing state/after as absent (HOLD).
	return {"stage": stage, "state": "HOLD", "reason": reason, "before": before.duplicate(true),
		"allowed_leaves": ALLOWED[stage].duplicate(true), "source": SOURCE[stage], "detached": true, "live_writes": 0}
