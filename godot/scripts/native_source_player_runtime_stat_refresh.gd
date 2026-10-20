class_name ExoduserNativeSourcePlayerRuntimeStatRefresh
extends RefCounted
## PC-RUNTIME-STATS (2026-10-21) — 반복 가능한 런타임 applyStats 재계산 owner.
##
## 초기화 단회 dispatcher(native_source_player_initialization.gd)의 pre-Tree guard는
## 그대로 둔다. 이 모듈은 Tree 진입 후 실제 Main이 소유하는 별도 진입점이다.
##   - 원본 producer 6종(health/defense_speed/shield_poise/effective_stats/
##     resource_parameters/base_attack)을 pass마다 새로 만들어, 초기화 dispatcher와
##     같은 원 applyStats 앵커 순서(포트 앵커 game.html:28564–28624, 현 main G27902–27966)로
##     실행한다. 수식 복제 0 — 모든 값은 기존 producer packet에서만 나온다.
##   - producer write는 detached P overlay에 단계 적용한다(원본에서 다음 줄이 직전 대입을
##     읽는 것과 동일한 관측). 전 단계 READY일 때만 Player·자원·State 세 sink를
##     사전 검증 → 동기 일괄 commit → readback 한다. 실패 시 실제 owner 무변이.
##   - MODE_EQUIPMENT는 원본 _refreshEquipmentStats(G16287–16292) 순서:
##     hp/mp/st/shield 보관 → 캐시 3종 무효화 → applyStats 1회 → min(new max, old).
##   - MODE_APPLY_STATS는 원본 applyStats() 직접 호출(스탯/패시브 투자·리셋, G51215/
##     51232/51249/51267/51274)과 같다. 사전 무효화·사후 clamp 없음(원본 그대로).
## 틱 경로 코드 0. get_method_list/get_property_list/get_signal_list 호출 0.

signal native_runtime_stats_refreshed(receipt: Dictionary)

const HEALTH = preload("res://port_modules/player_health_parameters_source/producer.gd")
const DEFENSE = preload("res://port_modules/player_defense_speed_parameters_source/producer.gd")
const SHIELD = preload("res://port_modules/player_shield_poise_parameters_source/producer.gd")
const EFFECTIVE = preload("res://port_modules/player_effective_stats_source/producer.gd")
const RESOURCE = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const BASE_ATTACK = preload("res://port_modules/player_base_attack_source/producer.gd")
const STATE = preload("res://scripts/native_source_new_run_state.gd")
const AUTHORITY = preload("res://scripts/native_source_resource_authority.gd")
const SERVICES = preload("res://scripts/native_source_player_initialization_services.gd")
const PROVIDERS = preload("res://scripts/native_source_player_providers.gd")
const DISPATCHER = preload("res://scripts/native_source_player_initialization.gd")
const MAIN_PATH = "res://scripts/main.gd"
const SCHEMA = "exoduser.godot.source-runtime-stat-refresh.v1"

const MODE_APPLY_STATS = "apply_stats"
const MODE_EQUIPMENT = "equipment_refresh"
const MODES = [MODE_APPLY_STATS, MODE_EQUIPMENT]
const MODE_SOURCE = {MODE_APPLY_STATS: "game.html applyStats() (port anchors 28564-28624; current main G27902-27966)",
	MODE_EQUIPMENT: "game.html _refreshEquipmentStats() G16287-16292"}
## 원본 G16288/16291: 장착 refresh가 보관·clamp하는 4자원과 그 상한.
const KEEP_FIELDS = {"hp": "mhp", "mp": "mmp", "st": "mst", "shield": "mshield"}
## 원본 recalcSt(G16426)와 _refreshEquipmentStats(G16289)의 무효화 대상 3종.
const CACHE_TARGETS = ["_eqAffixCache", "_eqStatCache", "_lEqCache"]
## before/after readback 필드(applyStats가 쓰는 전체 집합).
const SNAPSHOT_FIELDS = ["hp", "mhp", "st", "mst", "mp", "mmp", "shield", "mshield",
	"hpR", "stR", "mpR", "speed", "_oocSpeed", "baseDef", "baseAtk",
	"maxPoise", "poise", "poiseR", "_effStats", "_crystalStats"]
const ATTACK_PACKETS = {
	"early": {"kind": "apply_stats_base_attack_early", "source": "game.html:28587-28588", "write_source": "game.html:28588"},
	"crystal": {"kind": "apply_stats_base_attack_crystal", "source": "game.html:28602", "write_source": "game.html:28602"}}

class Bridge extends RefCounted:
	var owner: WeakRef
	func _init(refresh: RefCounted) -> void:
		owner = weakref(refresh)
	func _o() -> Variant:
		var r: Variant = owner.get_ref()
		return r if is_instance_valid(r) and r.is_native_runtime_stat_refresh_pass_open() else null
	func p() -> Variant:
		var r: Variant = _o()
		return r._overlay if r != null else null
	func hp_packet(packet: Dictionary) -> bool:
		var r: Variant = _o()
		return r._consume_health(packet) if r != null else false
	func def_packet(packet: Dictionary) -> bool:
		var r: Variant = _o()
		return r._consume_defense(packet) if r != null else false
	func writes_packet(packet: Dictionary) -> bool:
		var r: Variant = _o()
		return r._consume_writes(packet) if r != null else false
	func resource_packet(packet: Dictionary) -> bool:
		var r: Variant = _o()
		return r._consume_resource_command(packet) if r != null else false
	func resource_plan() -> Variant:
		var r: Variant = _o()
		return r._resource_plan if r != null else null
	func crystal_stats() -> Variant:
		var r: Variant = _o()
		return r._read_applied_crystal() if r != null else null
	func cohort() -> Variant:
		var r: Variant = _o()
		return r._cohort if r != null else null
	func current_cohort() -> Variant:
		var r: Variant = _o()
		return r._cohort.get("cohort_id") if r != null else null

var _main: WeakRef
var _player: WeakRef
var _world: WeakRef
var _state: WeakRef
var _resources: WeakRef
var _providers: WeakRef
var _services: WeakRef
var _dispatcher: WeakRef
var _configured := false
var _busy := false
var _pass_open := false
var _committing := false
var _commit_owner: WeakRef
var _pass_serial := 0
var _accepted := 0
var _rejected := 0
var _last_receipt: Dictionary = {}
var _last_error := "unconfigured"
# Per-pass state (cleared by _close_pass).
var _overlay: Dictionary = {}
var _helpers: Dictionary = {}
var _bridge: Bridge
var _gap: RefCounted
var _resource_plan: Dictionary = {}
var _health_plan: Dictionary = {}
var _cohort: Dictionary = {}
var _seen_tags: Array = []
var _written: Dictionary = {}
var _trace: Array = []
var _resource_indices: Dictionary = {}
var _invalidations := 0
var _pass_error := ""
var _mode := ""

func configure(main: Node) -> Dictionary:
	if _configured or _busy:
		return {"ready": false, "reason": "runtime_stat_refresh_already_configured_or_reentrant"}
	if not _live(main) or main.get_script() == null or main.get_script().resource_path != MAIN_PATH:
		return {"ready": false, "reason": "runtime_stat_refresh_requires_actual_Main"}
	_main = weakref(main)
	_player = weakref(main.get("player"))
	_world = weakref(main.get("world"))
	_state = weakref(main.get("source_state"))
	_resources = weakref(main.get("source_resources"))
	_providers = weakref(main.get("source_providers"))
	_services = weakref(main.get("source_initialization_services"))
	_dispatcher = weakref(main.get("source_initialization"))
	_configured = true
	var error := _context_error(main)
	if not error.is_empty():
		_configured = false
		_last_error = error
		return {"ready": false, "reason": error}
	_last_error = ""
	return {"ready": true, "reason": "", "schema": SCHEMA}

func is_native_runtime_stat_refresh_committing(owner: Node) -> bool:
	return _committing and _busy and _commit_owner != null and _commit_owner.get_ref() == owner \
		and _ref(_main) == owner

func is_native_runtime_stat_refresh_active(owner: Node) -> bool:
	return _busy and _pass_open and _ref(_main) == owner

func is_native_runtime_stat_refresh_pass_open() -> bool:
	return _busy and _pass_open

## 공개 진입점. owner=실제 Main. mode=MODE_APPLY_STATS|MODE_EQUIPMENT. reason=호출자 태그(진단).
func refresh(owner: Node, mode: String, reason: String = "") -> Dictionary:
	if _busy:
		# Reentry (e.g. from the post-commit signal) never touches the pass in progress.
		_rejected += 1
		return {"status": "REJECTED", "ready": false, "committed": false,
			"reason": "runtime_stat_refresh_reentrant", "mode": mode, "caller_reason": reason}
	var error := _context_error(owner)
	if error.is_empty() and mode not in MODES:
		error = "runtime_stat_refresh_unknown_mode:" + str(mode)
	if not error.is_empty():
		_rejected += 1
		_last_error = error
		return {"status": "REJECTED", "ready": false, "committed": false, "reason": error,
			"mode": mode, "caller_reason": reason}
	_busy = true
	_mode = mode
	_pass_serial += 1
	var before: Dictionary = _read_snapshot()
	var receipt: Dictionary = {"schema": SCHEMA, "mode": mode, "caller_reason": reason,
		"pass_serial": _pass_serial, "source": MODE_SOURCE[mode], "before": before}
	if before.is_empty():
		return _finish_failure(receipt, "runtime_stat_refresh_before_readback_unavailable")
	_open_pass()
	var keep: Dictionary = {}
	if mode == MODE_EQUIPMENT:
		# G16288 keep current values, G16289 invalidate the three caches.
		for field in KEEP_FIELDS:
			if not _number(_overlay.get(field)):
				return _finish_failure(receipt, "runtime_stat_refresh_keep_field_invalid:" + field)
			keep[field] = _overlay[field]
		if not _invalidate_caches():
			return _finish_failure(receipt, _pass_error)
	receipt["kept"] = keep.duplicate()
	if not _run_apply_stats():
		return _finish_failure(receipt, _pass_error)
	if mode == MODE_EQUIPMENT:
		# G16291 P.hp=Math.min(P.mhp,_eqHP) ... — min(new max, old current).
		for field in KEEP_FIELDS:
			var cap_field: String = KEEP_FIELDS[field]
			if not _number(_overlay.get(cap_field)):
				return _finish_failure(receipt, "runtime_stat_refresh_cap_invalid:" + cap_field)
			_overlay[field] = minf(float(_overlay[cap_field]), float(keep[field]))
			_written[field] = true
	var commit: Dictionary = _commit(owner, before)
	receipt["commit"] = commit
	if commit.get("committed") != true:
		return _finish_failure(receipt, str(commit.get("reason", "runtime_stat_refresh_commit_rejected")))
	var after: Dictionary = _read_snapshot()
	receipt["after"] = after
	receipt["staged_writes"] = _trace.size()
	receipt["trace"] = _trace.duplicate(true)
	receipt["committed_fields"] = commit.get("fields", {})
	receipt["cache_invalidations"] = _invalidations
	receipt["cache_targets"] = CACHE_TARGETS.duplicate()
	receipt["cohort_id"] = _cohort.get("cohort_id")
	receipt["status"] = "READY"
	receipt["ready"] = true
	receipt["committed"] = true
	receipt["reason"] = ""
	receipt["free_refill"] = _free_refill(before, after)
	_close_pass()
	_accepted += 1
	_last_error = ""
	_last_receipt = receipt.duplicate(true)
	# Observers see the committed state; any reentrant refresh is rejected
	# because _busy stays true until after emission.
	var player: Variant = _ref(_player)
	if _live(player) and player.has_signal("stats_changed"):
		player.stats_changed.emit()
	native_runtime_stats_refreshed.emit(receipt.duplicate(true))
	_busy = false
	return receipt

func get_snapshot() -> Dictionary:
	return {"schema": SCHEMA, "configured": _configured, "busy": _busy, "pass_serial": _pass_serial,
		"accepted": _accepted, "rejected": _rejected, "last_error": _last_error,
		"last_receipt": _last_receipt.duplicate(true), "tick_path": false,
		"initialization_guard_unchanged": true, "source_formulas_reimplemented": false}

# ───────────────────────── ordered applyStats pass ─────────────────────────

func _open_pass() -> void:
	_pass_open = true
	_pass_error = ""
	_seen_tags.clear()
	_written.clear()
	_trace.clear()
	_resource_indices.clear()
	_invalidations = 0
	_resource_plan = {}
	_health_plan = {}
	_cohort = {}
	var p: Variant = _ref(_state).read_current_p()
	_overlay = p.duplicate(true) if p is Dictionary else {}

func _close_pass() -> void:
	_pass_open = false
	if is_instance_valid(_gap):
		_gap.close()
	for key in _helpers:
		var helper: Variant = _helpers[key]
		if is_instance_valid(helper) and helper.has_method("clear"):
			helper.clear()
	_helpers.clear()
	_bridge = null
	_gap = null
	_overlay = {}

func _run_apply_stats() -> bool:
	if _overlay.is_empty():
		return _fail("runtime_stat_refresh_current_P_unavailable")
	var bundle: Dictionary = _ref(_providers).get_provider_bundle()
	if bundle.is_empty() or not bundle.get("current_g") is Callable:
		return _fail("runtime_stat_refresh_provider_bundle_not_ready")
	var maps: Dictionary = _pass_provider_maps(bundle)
	if maps.is_empty():
		return _fail("runtime_stat_refresh_provider_map_missing")
	_bridge = Bridge.new(self)
	_gap = DEFENSE.HpInitialGapSeam.new()
	var overlay := Callable(_bridge, "p")
	# Same capture-provider replacement as the initialization dispatcher, plus
	# the in-pass P view (writes so far in this applyStats call).
	maps["health"][HEALTH.PROVIDER_PLAYER] = overlay
	maps["health"][HEALTH.PROVIDER_CRYSTAL_STATS] = Callable(_bridge, "crystal_stats")
	maps["defense_speed"][DEFENSE.PROVIDER_PLAYER] = overlay
	maps["defense_speed"][DEFENSE.PROVIDER_RESOURCE_PLAN] = Callable(_bridge, "resource_plan")
	maps["defense_speed"][DEFENSE.PROVIDER_HP_MHP_28582] = Callable(_gap, "read")
	maps["shield_poise"][SHIELD.PROVIDER_PLAYER] = overlay
	maps["shield_poise"][SHIELD.PROVIDER_RESOURCE_PLAN] = Callable(_bridge, "resource_plan")
	maps["effective_stats"][EFFECTIVE.PROVIDER_PLAYER] = overlay
	maps["effective_stats"][EFFECTIVE.PROVIDER_COHORT] = Callable(_bridge, "cohort")
	maps["effective_stats"][EFFECTIVE.PROVIDER_CURRENT_COHORT] = Callable(_bridge, "current_cohort")
	maps["resource_parameters"][RESOURCE.PROVIDER_PLAYER] = overlay
	_helpers = {"health": HEALTH.new(), "defense_speed": DEFENSE.new(), "shield_poise": SHIELD.new(),
		"effective_stats": EFFECTIVE.new(), "resource_parameters": RESOURCE.new(), "base_attack": BASE_ATTACK.new()}
	var bindings: Array = [
		_helpers["health"].configure(maps["health"], Callable(_bridge, "hp_packet")),
		_helpers["defense_speed"].configure(maps["defense_speed"], Callable(_bridge, "def_packet")),
		_helpers["shield_poise"].configure(maps["shield_poise"], Callable(_bridge, "writes_packet")),
		_helpers["effective_stats"].configure(maps["effective_stats"], Callable(_bridge, "writes_packet")),
		_helpers["resource_parameters"].configure(maps["resource_parameters"], Callable(_bridge, "resource_packet"))]
	for binding in bindings:
		if not binding is Dictionary or binding.get("ready") != true:
			return _fail("runtime_stat_refresh_original_helper_binding_not_ready")
	_helpers["base_attack"].configure(bundle["current_g"], overlay, Callable())
	_helpers["base_attack"].configure_crystal_reader(Callable(_bridge, "crystal_stats"), overlay)
	# Prefix: cohort + both captured plans before any source field write.
	var stats: Variant = maps["effective_stats"][EFFECTIVE.PROVIDER_STATS].call()
	if not stats is Dictionary:
		return _fail("runtime_stat_refresh_prefix_stats_not_ready")
	var prefix: Dictionary = {}
	for key in EFFECTIVE.STATS_PREFIX_KEYS:
		if not stats.has(key):
			return _fail("runtime_stat_refresh_prefix_stats_missing:" + key)
		prefix[key] = stats[key]
	_health_plan = _helpers["health"].plan_initial()
	if not _plan_ready(_health_plan, HEALTH.PHASE_INITIAL):
		return _fail("health_initial_capture_not_ready:" + str(_health_plan.get("reason", "invalid")))
	_resource_plan = _helpers["resource_parameters"].plan_apply_stats()
	if not _plan_ready(_resource_plan, RESOURCE.KIND_APPLY_STATS):
		return _fail("resource_capture_not_ready:" + str(_resource_plan.get("reason", "invalid")))
	var cohort_id := "source_runtime_stat_refresh:%d:%d" % [get_instance_id(), _pass_serial]
	_cohort = {"status": "READY", "cohort_id": cohort_id,
		"authority": "actual_Main/source_runtime_stat_refresh", "current_main": true,
		"stats_at_prefix": prefix, "hp_initial": {"cohort_id": cohort_id, "plan": _health_plan},
		"resource_plan": {"cohort_id": cohort_id, "plan": _resource_plan}}
	if not _run("effective_stats", "run_effective_stats", []):
		return false
	if not _run("health", "run_captured_initial", [_health_plan]):
		return false
	if not _consume_resource_anchors(["game.html:28593", "game.html:28594", "game.html:28600"]):
		return false
	if not _run("health", "run_phase", [HEALTH.PHASE_CRYSTAL_MHP]):
		return false
	if not _run_attack("crystal"):
		return false
	if not _run("defense_speed", "run_phase", [DEFENSE.PHASE_CRYSTAL]):
		return false
	if not _run("health", "run_phase", [HEALTH.PHASE_CRYSTAL_HPR]):
		return false
	if not _consume_resource_anchors(["game.html:28606", "game.html:28607", "game.html:28608",
			"game.html:28611", "game.html:28614"]):
		return false
	if not _run("health", "run_phase", [HEALTH.PHASE_FORTIFY]):
		return false
	if not _run("defense_speed", "run_phase", [DEFENSE.PHASE_ARMOR]):
		return false
	if not _run("shield_poise", "run_shield_stage", []):
		return false
	if _resource_indices.size() != _resource_plan["packet"]["writes"].size():
		return _fail("unconsumed_source_resource_write")
	if not _run("resource_parameters", "run_recalc_st", []):
		return false
	if _invalidations != (2 if _mode == MODE_EQUIPMENT else 1):
		return _fail("runtime_stat_refresh_invalidation_count")
	return true

## Same keys/targets as Services._make_provider_maps (the initialization wiring),
## but bound to the original provider objects directly for this one synchronous
## pass. The full Main/Services/Providers context is validated at pass start and
## again before commit; per-call Services re-validation (~0.7 ms each, ~60 calls)
## would make one refresh cost ~45 ms. The capture/player providers are replaced
## below exactly like the initialization dispatcher does.
func _pass_provider_maps(bundle: Dictionary) -> Dictionary:
	for key in ["affix", "reference", "formula", "parameters"]:
		if not _live(bundle.get(key)):
			return {}
	for key in ["current_g", "current_p", "current_stats", "current_passives", "current_inventory", "grit_total"]:
		if not bundle.get(key) is Callable or not bundle[key].is_valid():
			return {}
	if not bundle.get("parameter_providers") is Dictionary:
		return {}
	var services: Variant = _ref(_services)
	if not _live(services) or not services.has_method("read_native_signed_difficulty"):
		return {}
	var player: Callable = bundle["current_p"]
	var stats: Callable = bundle["current_stats"]
	var passives: Callable = bundle["current_passives"]
	var inventory: Callable = bundle["current_inventory"]
	var affix := Callable(bundle["affix"], "eq_affix")
	var implicit := Callable(bundle["formula"], "eq_implicit")
	var lv_b := Callable(bundle["reference"], "lv_b")
	var grit_total: Callable = bundle["grit_total"]
	var parameters: Dictionary = bundle["parameter_providers"].duplicate()
	for key in [RESOURCE.PROVIDER_PLAYER, RESOURCE.PROVIDER_STATS, RESOURCE.PROVIDER_PASSIVES,
			RESOURCE.PROVIDER_INVENTORY, RESOURCE.PROVIDER_EQ_AFFIX, RESOURCE.PROVIDER_EQ_STAT, RESOURCE.PROVIDER_LV_B]:
		if not parameters.get(key) is Callable:
			return {}
	return {"resource_parameters": parameters,
		"health": {HEALTH.PROVIDER_PLAYER: player, HEALTH.PROVIDER_STATS: stats,
			HEALTH.PROVIDER_PASSIVES: passives, HEALTH.PROVIDER_INVENTORY: inventory,
			HEALTH.PROVIDER_G: bundle["current_g"],
			HEALTH.PROVIDER_DIFF_SIGNED: Callable(services, "read_native_signed_difficulty"),
			HEALTH.PROVIDER_EQ_AFFIX: affix, HEALTH.PROVIDER_EQ_IMPLICIT: implicit, HEALTH.PROVIDER_LV_B: lv_b,
			HEALTH.PROVIDER_CRYSTAL_STATS: Callable(), HEALTH.PROVIDER_GRIT_HP_FLAT: grit_total},
		"defense_speed": {DEFENSE.PROVIDER_PLAYER: player, DEFENSE.PROVIDER_PASSIVES: passives,
			DEFENSE.PROVIDER_EQ_AFFIX: affix, DEFENSE.PROVIDER_EQ_IMPLICIT: implicit,
			DEFENSE.PROVIDER_GRIT_TOTAL: grit_total, DEFENSE.PROVIDER_RESOURCE_PLAN: Callable(),
			DEFENSE.PROVIDER_HP_MHP_28582: Callable()},
		"shield_poise": {SHIELD.PROVIDER_PLAYER: player, SHIELD.PROVIDER_INVENTORY: inventory,
			SHIELD.PROVIDER_EQ_AFFIX: affix, SHIELD.PROVIDER_RESOURCE_PLAN: Callable()},
		"effective_stats": {EFFECTIVE.PROVIDER_PLAYER: player, EFFECTIVE.PROVIDER_STATS: stats,
			EFFECTIVE.PROVIDER_COHORT: Callable(), EFFECTIVE.PROVIDER_CURRENT_COHORT: Callable()}}

func _consume_health(packet: Dictionary) -> bool:
	if not _packet_shape_valid(packet):
		return _fail("health_packet_not_admitted")
	var writes: Array = packet["writes"]
	for index in range(writes.size()):
		if not _stage_write(packet, index):
			return false
		if packet["kind"] == HEALTH.PHASE_INITIAL and index == 0:
			if writes[index].get("source") != "game.html:28582":
				return _fail("health_initial_write0_wrong_source")
			_gap.open(float(writes[index]["value"]), int(packet["pass_id"]))
			var accepted := _run("defense_speed", "run_phase", [DEFENSE.PHASE_EARLY])
			_gap.close()
			if not accepted or not _consume_resource_anchors(["game.html:28591"]):
				return false
	return true

func _consume_defense(packet: Dictionary) -> bool:
	if not _packet_shape_valid(packet):
		return _fail("defense_packet_not_admitted")
	for index in range(packet["writes"].size()):
		if not _stage_write(packet, index):
			return false
		if packet["kind"] == DEFENSE.PHASE_EARLY and index == 0:
			if packet["writes"][index].get("source") != "game.html:28583":
				return _fail("defense_early_write0_wrong_source")
			if not _run("shield_poise", "run_poise_init_stage", []) or not _run_attack("early"):
				return false
	return true

func _consume_writes(packet: Dictionary) -> bool:
	if not _packet_shape_valid(packet):
		return _fail("invalid_original_source_packet")
	for index in range(packet["writes"].size()):
		if not _stage_write(packet, index):
			return false
	return true

func _consume_resource_anchors(anchors: Array) -> bool:
	if not _plan_ready(_resource_plan, RESOURCE.KIND_APPLY_STATS):
		return _fail("captured_resource_plan_not_admitted")
	var packet: Dictionary = _resource_plan["packet"]
	for index in range(packet["writes"].size()):
		if packet["writes"][index].get("source") in anchors:
			if _resource_indices.has(index):
				return _fail("duplicate_captured_resource_write")
			if not _stage_write(packet, index):
				return false
			_resource_indices[index] = true
	return true

func _consume_resource_command(packet: Dictionary) -> bool:
	if packet.get("kind") == RESOURCE.KIND_INVALIDATE:
		if packet != RESOURCE.invalidate_packet():
			return _fail("invalid_source_invalidation_packet")
		_trace.append({"kind": packet["kind"], "source": packet["source"], "writes": 0})
		# recalcSt first line (current main G16426 also clears _lEqCache).
		return _invalidate_caches()
	if packet.get("kind") != RESOURCE.KIND_RECALC_ST or _resource_indices.size() != _resource_plan["packet"]["writes"].size():
		return _fail("source_recalc_not_after_apply_stats")
	return _consume_writes(packet)

func _run_attack(stage: String) -> bool:
	var helper: Variant = _helpers.get("base_attack")
	if not is_instance_valid(helper):
		return _fail("base_attack_helper_lost")
	var plan: Variant = helper.plan_early_packet() if stage == "early" else helper.plan_crystal()
	if not plan is Dictionary or plan.get("status") != "READY" or not _packet_shape_valid(plan.get("packet")):
		return _fail("actual_attack_producer_not_ready:" + stage + ":" + str(plan.get("reason", "") if plan is Dictionary else ""))
	var packet: Dictionary = plan["packet"]
	var expected: Dictionary = ATTACK_PACKETS[stage]
	if packet["kind"] != expected["kind"] or packet["source"] != expected["source"] or packet["writes"].size() != 1 \
			or packet["writes"][0].get("field") != "baseAtk" or packet["writes"][0].get("source") != expected["write_source"]:
		return _fail("attack_packet_wrong_original_kind_or_source:" + stage)
	return _consume_writes(packet)

func _run(helper: String, method: String, args: Array) -> bool:
	if not _pass_open or not is_instance_valid(_helpers.get(helper)):
		return _fail("helper_lost_before_phase:" + helper)
	var result: Variant = _helpers[helper].callv(method, args)
	if not result is Dictionary or result.get("status") != "READY" or result.get("ready") != true:
		return _fail(_pass_error if not _pass_error.is_empty() else helper + ":" + \
			str(result.get("reason", "invalid_result") if result is Dictionary else "invalid_result"))
	return _pass_open

## One original producer write into the in-pass P overlay. Validation mirrors the
## State/Authority/Player initialization whitelists (kind/source/field/anchor,
## pass_id, before-presence, actor constants) without their pre-Tree lifecycle.
func _stage_write(packet: Dictionary, index: int) -> bool:
	if not _pass_open or not _packet_shape_valid(packet) or index < 0 or index >= packet["writes"].size():
		return _fail("runtime_stage_write_not_admitted")
	var kind: Variant = packet.get("kind")
	if not kind is String or not STATE.INITIALIZATION_PACKET_SOURCES.has(kind) \
			or packet.get("source") != STATE.INITIALIZATION_PACKET_SOURCES[kind]:
		return _fail("runtime_packet_kind_or_source_denied:" + str(kind))
	var pass_kind: bool = STATE.INITIALIZATION_PASS_KINDS.has(kind)
	if pass_kind and (not packet.get("pass_id") is int or packet["pass_id"] < 1):
		return _fail("runtime_original_pass_id_missing:" + kind)
	if not pass_kind and packet.has("pass_id"):
		return _fail("runtime_no_pass_packet_was_modified:" + kind)
	var write: Dictionary = packet["writes"][index]
	var field: String = write["field"]
	var whitelist: Dictionary = STATE.INITIALIZATION_WRITE_SOURCES[kind]
	if not whitelist.has(field) or not whitelist[field].has(write["source"]):
		return _fail("runtime_field_or_anchor_denied:" + field + "@" + str(write["source"]))
	var value: Variant = write["value"]
	if field == "_effStats":
		if not _numeric_object(value, ["str", "dex", "int", "vit", "lck"]):
			return _fail("runtime_effective_stats_invalid")
	elif field == "_crystalStats":
		if not _numeric_object(value, RESOURCE.CR_INIT_KEYS):
			return _fail("runtime_crystal_stats_invalid")
	elif not _number(value):
		return _fail("runtime_numeric_value_invalid:" + field)
	# Player constructor constants (player.gd commit_native_source_initialization_field).
	if field in ["maxPoise", "poise"] and float(value) != 4.0:
		return _fail("runtime_poise_constant_violated:" + field)
	if field == "poiseR" and float(value) != 0.0:
		return _fail("runtime_poise_r_constant_violated")
	if field == "speed" and not is_finite(float(value) * 60.0):
		return _fail("runtime_speed_non_finite")
	var tag := {"field": field, "source": write["source"], "kind": kind,
		"pass_id": packet["pass_id"] if packet.has("pass_id") else 1}
	if _seen_tags.has(tag):
		return _fail("runtime_duplicate_write:" + field)
	if STATE.INITIALIZATION_HEALTH_KINDS.has(kind) or kind == "apply_stats_effective_stats":
		if not write.get("before_present") is bool or write["before_present"] != _overlay.has(field) \
				or not write.has("before"):
			return _fail("runtime_before_presence_mismatch:" + field)
		if write["before_present"] and _overlay[field] != write["before"]:
			return _fail("runtime_before_value_mismatch:" + field)
	_seen_tags.append(tag)
	_overlay[field] = value.duplicate(true) if value is Dictionary else value
	_written[field] = true
	_trace.append({"kind": kind, "field": field, "source": write["source"], "write_index": index})
	return true

func _read_applied_crystal() -> Variant:
	if not _resource_plan.get("values") is Dictionary:
		return null
	var cr: Variant = _resource_plan["values"].get("_crystalStats")
	if not _overlay.get("_crystalStats") is Dictionary or not cr is Dictionary or _overlay["_crystalStats"] != cr:
		return null
	return {"status": "READY", "value": _overlay["_crystalStats"],
		"stage": "actual_source_28600:runtime_cohort:" + str(_cohort.get("cohort_id"))}

## Existing cache primitives only: affix reader, combat reference _eqStat, Main _lEq.
func _invalidate_caches() -> bool:
	var bundle: Dictionary = _ref(_providers).get_provider_bundle()
	var affix: Variant = bundle.get("affix")
	var reference: Variant = bundle.get("reference")
	var main: Variant = _ref(_main)
	if not _live(affix) or not _live(reference) or not affix.has_method("invalidate_affix_cache") \
			or not reference.has_method("invalidate_eq_stat_cache") or not _live(main) \
			or not main.has_method("invalidate_native_runtime_refresh_legendary_cache"):
		return _fail("runtime_cache_owner_missing")
	affix.invalidate_affix_cache()
	reference.invalidate_eq_stat_cache()
	if not main.invalidate_native_runtime_refresh_legendary_cache(self):
		return _fail("runtime_legendary_cache_invalidation_rejected")
	_invalidations += 1
	return true

# ───────────────────────── commit ─────────────────────────

func _commit(owner: Node, before: Dictionary) -> Dictionary:
	var actor: Dictionary = {}
	var resources: Dictionary = {}
	var p_fields: Dictionary = {}
	for field in _written:
		var value: Variant = _overlay[field]
		if not before.has(field):
			return {"committed": false, "reason": "runtime_stat_refresh_field_absent_before:" + field}
		if STATE.INITIALIZATION_ACTOR_FIELDS.has(field):
			actor[field] = value
		elif STATE.RESOURCE_FIELDS.has(field):
			resources[field] = value
		else:
			p_fields[field] = value.duplicate(true) if value is Dictionary else value
	var context := _context_error(owner)
	if not context.is_empty():
		return {"committed": false, "reason": context}
	var player: Variant = _ref(_player)
	var authority: Variant = _ref(_resources)
	var state: Variant = _ref(_state)
	_committing = true
	_commit_owner = weakref(owner)
	var errors: Array = [player.validate_native_runtime_stat_refresh(owner, self, actor),
		authority.validate_native_runtime_stat_refresh(owner, self, resources),
		state.validate_native_runtime_stat_refresh(owner, self, p_fields)]
	for error in errors:
		if not error is String or not String(error).is_empty():
			_committing = false
			_commit_owner = null
			return {"committed": false, "reason": "runtime_stat_refresh_sink_rejected:" + str(error)}
	# Synchronous batch. No signal/await/provider call between these three writes.
	var results: Array = [player.commit_native_runtime_stat_refresh(owner, self, actor)]
	if results[0].get("accepted") == true:
		results.append(authority.commit_native_runtime_stat_refresh(owner, self, resources))
	if results.size() == 2 and results[1].get("accepted") == true:
		results.append(state.commit_native_runtime_stat_refresh(owner, self, p_fields))
	var ok: bool = results.size() == 3 and results[2].get("accepted") == true
	if ok:
		var readback: Variant = state.read_current_p()
		if not readback is Dictionary:
			ok = false
		else:
			for field in _written:
				if readback.get(field) != _overlay[field]:
					ok = false
					break
	if not ok:
		# Restore committed sinks to their before values (fields were present before).
		_rollback(owner, before, actor, resources, p_fields, results.size())
		_committing = false
		_commit_owner = null
		return {"committed": false, "reason": "runtime_stat_refresh_commit_or_readback_failed", "results": results}
	_committing = false
	_commit_owner = null
	return {"committed": true, "reason": "", "fields": {"actor": actor.keys(), "resources": resources.keys(),
		"state": p_fields.keys()}}

func _rollback(owner: Node, before: Dictionary, actor: Dictionary, resources: Dictionary, p_fields: Dictionary, reached: int) -> void:
	var restore := func(fields: Dictionary) -> Dictionary:
		var out: Dictionary = {}
		for field in fields:
			out[field] = before[field].duplicate(true) if before[field] is Dictionary else before[field]
		return out
	if reached >= 1:
		_ref(_player).commit_native_runtime_stat_refresh(owner, self, restore.call(actor))
	if reached >= 2:
		_ref(_resources).commit_native_runtime_stat_refresh(owner, self, restore.call(resources))
	if reached >= 3:
		_ref(_state).commit_native_runtime_stat_refresh(owner, self, restore.call(p_fields))

func _finish_failure(receipt: Dictionary, reason: String) -> Dictionary:
	_close_pass()
	receipt["status"] = "NOT_READY"
	receipt["ready"] = false
	receipt["committed"] = false
	receipt["reason"] = reason
	receipt["after"] = _read_snapshot()
	receipt["unchanged"] = receipt["after"] == receipt.get("before")
	_rejected += 1
	_last_error = reason
	_last_receipt = receipt.duplicate(true)
	_busy = false
	return receipt

# ───────────────────────── readback / identity ─────────────────────────

func _read_snapshot() -> Dictionary:
	var state: Variant = _ref(_state)
	if not _live(state):
		return {}
	var p: Variant = state.read_current_p()
	if not p is Dictionary:
		return {}
	var out: Dictionary = {}
	for field in SNAPSHOT_FIELDS:
		if p.has(field):
			out[field] = p[field].duplicate(true) if p[field] is Dictionary else p[field]
	return out

static func _free_refill(before: Dictionary, after: Dictionary) -> bool:
	for field in KEEP_FIELDS:
		if _number(before.get(field)) and _number(after.get(field)) and float(after[field]) > float(before[field]):
			return true
	return false

func _context_error(owner: Variant) -> String:
	if not _configured:
		return "runtime_stat_refresh_unconfigured"
	var main: Variant = _ref(_main)
	if not _live(owner) or not _live(main) or owner != main:
		return "runtime_stat_refresh_foreign_owner"
	if not main.is_inside_tree() or main.get_script() == null or main.get_script().resource_path != MAIN_PATH:
		return "runtime_stat_refresh_Main_not_live"
	var player: Variant = _ref(_player)
	var world: Variant = _ref(_world)
	var state: Variant = _ref(_state)
	var resources: Variant = _ref(_resources)
	var providers: Variant = _ref(_providers)
	var services: Variant = _ref(_services)
	var dispatcher: Variant = _ref(_dispatcher)
	for object in [player, world, state, resources, providers, services, dispatcher]:
		if not _live(object):
			return "runtime_stat_refresh_owner_lost"
	if main.get("player") != player or main.get("world") != world or main.get("source_state") != state \
			or main.get("source_resources") != resources or main.get("source_providers") != providers \
			or main.get("source_initialization_services") != services or main.get("source_initialization") != dispatcher:
		return "runtime_stat_refresh_Main_identity_changed"
	var registered: Variant = main.get("source_runtime_stat_refresh")
	if registered != null and registered != self:
		return "runtime_stat_refresh_not_Main_registered"
	if state.get_script() != STATE or resources.get_script() != AUTHORITY or services.get_script() != SERVICES \
			or providers.get_script() != PROVIDERS or dispatcher.get_script() != DISPATCHER:
		return "runtime_stat_refresh_owner_script_mismatch"
	if not player.is_inside_tree() or player.get_parent() != main or world.get_parent() != main \
			or world.get("player") != player or player.get_combat_world() != world:
		return "runtime_stat_refresh_actor_tree_mismatch"
	if state.get_native_new_run_player() != player or state.get_native_new_run_world() != world \
			or resources.get_native_regen_player() != player or resources.get_native_regen_world() != world:
		return "runtime_stat_refresh_holder_actor_mismatch"
	if not state.is_native_new_run_state_ready() or not resources.is_native_source_resources_ready():
		return "runtime_stat_refresh_holders_not_ready"
	if not providers.is_native_source_providers_ready() or not services.is_source_context_ready():
		return "runtime_stat_refresh_source_context_not_ready"
	if dispatcher.get_native_source_initialization_completion().get("completed") != true:
		return "runtime_stat_refresh_requires_completed_initialization"
	return ""

static func _packet_shape_valid(packet: Variant) -> bool:
	return DISPATCHER._packet_shape_valid(packet)

static func _plan_ready(plan: Dictionary, kind: String) -> bool:
	return DISPATCHER._plan_ready(plan, kind)

static func _numeric_object(value: Variant, keys: Array) -> bool:
	if not value is Dictionary or value.keys() != keys:
		return false
	for key in keys:
		if not _number(value[key]):
			return false
	return true

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _ref(value: Variant) -> Variant:
	return value.get_ref() if value is WeakRef and is_instance_valid(value) else null

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

func _fail(error: String) -> bool:
	if _pass_error.is_empty():
		_pass_error = error
	return false
