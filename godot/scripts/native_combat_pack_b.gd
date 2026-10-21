extends RefCounted
## PC-COMBAT-PACK-B (2026-10-21, PC 전투 핵심) — PCI-02/03/05/06/09 실제 owner 서비스.
## 계약 문서: docs/engine/PC_COMBAT_PACK_B_CONTRACT_20261021.md
##
## PCI-03 request_native_hurte  : 기존 hurtE 실행자(native_normal_enemy_hurte.gd)의 호환 facade. opts는 그대로 전달
##                                (normalBow 패킷 = 같은 Packet.fields 객체). 새 피해 수식 0.
## PCI-02 bind_native_enemy_hurte_owner : 신규 actor(type3 등)를 공용 hurtE field owner로 1회 bind. 타격 때는 live identity만.
## PCI-05 admit/advance          : 기존 World 플레이어 탄 store(pProjs 풀)에 normalBow 패킷 등록·1스텝/pass. 경쟁 registry 0.
## PCI-06 resolve_native_projectile_interaction : 같은 packet identity 영수증. 플레이어 탄 벽/적 접촉은 pass 안에서만,
##                                적 탄 Q 해제는 기존 Q 반사 owner로 위임(gbBean/blackBean), 그 밖 profile은 NOT_READY.
## PCI-09 register_native_enemy_death_effect : hurtE 사망 파이프라인 지정 위치(42784/42792/42817) 동기 consumer.
##
## 공통: 모든 요청은 ctx.token 필수. 같은 token은 재집행 없이 이전 영수증(replayed=true). REJECTED/NOT_READY는
## 쓰기·RNG 0(사전 검사 단계에서만 반환). 원본 분기 도중 정지는 PARTIAL(이미 적용된 prefix 유지, journal 보고).
## 틱 경로에서 get_method_list/get_property_list/get_signal_list 호출 0 — 계약 검사는 bind 때 has_method 1회.

const HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const ARROW = preload("res://scripts/native_player_arrow_carrier.gd")
const STORE = preload("res://scripts/native_player_projectile_store.gd")
const SCHEMA = "exoduser.godot.pc-combat-pack-b.v1"
## PC hurtE가 field owner에게 요구하는 메서드(확정 — player.gd NORMAL_HURTE_OWNER_METHODS와 같은 7종).
const OWNER_METHODS: Array[String] = ["read_native_normal_enemy_hurte_fields",
	"apply_native_normal_enemy_field_write", "apply_native_normal_enemy_bookkeeping",
	"apply_native_normal_enemy_hp_write", "apply_native_normal_enemy_death_write",
	"report_native_normal_enemy_hurte_event", "add_native_knockback"]
## bind 프로토콜 actor(신규 actor)가 추가로 가져야 하는 메서드.
const BOUND_OWNER_EXTRA: Array[String] = ["accept_native_hurte_owner_binding",
	"release_native_hurte_owner_binding", "apply_native_normal_enemy_poise_core"]
const DEATH_PROFILES := {8: "etype8_death_explosion", 15: "etype15_death_split", 29: "etype29_death_shots"}
const DEATH_PROFILE_LINES := {"etype8_death_explosion": [42784, 42790], "etype15_death_split": [42792, 42800],
	"etype29_death_shots": [42817, 42824]}
const TOKEN_CACHE_LIMIT := 1024
const DEATH_PREFIX_DEPTH_LIMIT := 16

var _main: Node
var _world: Node2D
var _player: Node2D
var _arrow: RefCounted
var _receipts: Dictionary = {}
var _receipt_order: Array = []
var _bindings: Dictionary = {}
var _binding_revision := 0
var _death_consumers: Dictionary = {}
var _death_revision := 0
var _death_serial := 0
var _death_depth := 0
var _admissions: Dictionary = {}
var _admission_serial := 0
var _blocked: Dictionary = {}
var _last_pass: Dictionary = {}
var _last_error := ""
var _counts := {"hurte_requests": 0, "hurte_applied": 0, "hurte_partial": 0, "hurte_refused": 0, "replays": 0,
	"bind_applied": 0, "bind_refused": 0, "death_prefix_dispatched": 0, "death_prefix_refused": 0,
	"admitted": 0, "admit_refused": 0, "passes": 0, "steps": 0, "interactions": 0}

static func install_native_boot(main: Node) -> RefCounted:
	var service = new()
	if not service.configure(main):
		return null
	return service

func configure(main: Node) -> bool:
	if is_instance_valid(_main) or not is_instance_valid(main):
		_last_error = "already_configured_or_missing_main"
		return false
	var world: Variant = main.get("world")
	var player: Variant = main.get("player")
	if not world is Node2D or not is_instance_valid(world) or not player is Node2D or not is_instance_valid(player) \
			or world.get("player") != player:
		_last_error = "actual_main_world_player_not_bound"
		return false
	for method in ["get_native_normal_enemy_damage_provider_callbacks", "reflect_native_q_source_projectile"]:
		if not main.has_method(method):
			_last_error = "missing_actual_main_" + method
			return false
	for method in ["get_native_world_identity", "query_native_enemies", "is_world_blocked",
			"publish_native_player_projectile", "retire_native_player_projectile",
			"begin_native_player_projectile_iteration", "finish_native_player_projectile_iteration"]:
		if not world.has_method(method):
			_last_error = "missing_actual_world_" + method
			return false
	var carrier: RefCounted = ARROW.new()
	_main = main
	_world = world
	_player = player
	if not carrier.configure(self, main, world):
		_last_error = "arrow_carrier_configuration_rejected"
		return false
	_arrow = carrier
	_last_error = ""
	return true

# ── 공통 ────────────────────────────────────────────────────────────────────────
func _live_error() -> String:
	if not is_instance_valid(_main) or _main.is_queued_for_deletion() or not _main.is_inside_tree():
		return "actual_main_not_live"
	if not is_instance_valid(_world) or _main.get("world") != _world or _world.get_parent() != _main:
		return "actual_world_not_live"
	if not is_instance_valid(_player) or _main.get("player") != _player or _world.get("player") != _player:
		return "actual_player_not_live"
	if _main.get_tree().paused:
		return "tree_paused"
	return ""

func _token_key(kind: String, ctx: Variant) -> String:
	if not ctx is Dictionary:
		return ""
	var token: Variant = ctx.get("token")
	if token is String and not (token as String).is_empty():
		return kind + ":s:" + token
	if token is int:
		return kind + ":i:" + str(token)
	return ""

func _receipt(kind: String, status: String, reason: String, ctx: Variant, extra: Dictionary = {}) -> Dictionary:
	var receipt := {"schema": SCHEMA, "request": kind, "status": status,
		"accepted": status in ["APPLIED", "SOURCE_RETURN", "NOT_REQUIRED"], "reason": reason,
		"token": ctx.get("token") if ctx is Dictionary else null, "replayed": false}
	receipt.merge(extra, true)
	return receipt

func _remember(key: String, receipt: Dictionary) -> Dictionary:
	if key.is_empty():
		return receipt
	_receipts[key] = receipt
	_receipt_order.append(key)
	while _receipt_order.size() > TOKEN_CACHE_LIMIT:
		_receipts.erase(_receipt_order.pop_front())
	return receipt

func _replay(key: String) -> Dictionary:
	_counts.replays += 1
	var receipt: Dictionary = (_receipts[key] as Dictionary).duplicate()
	receipt["replayed"] = true
	return receipt

func _actor_registered(actor: Variant) -> bool:
	return actor is Node2D and is_instance_valid(actor) and not actor.is_queued_for_deletion() and actor.is_inside_tree() \
		and actor.get_parent() == _world and _world.get_native_world_identity().has(actor)

# ── PCI-03: hurtE facade ────────────────────────────────────────────────────────
## request_native_hurte(actor, damage, angle, no_sound, opts, attack_element, ctx) -> Receipt
##   damage: hurtE 호출부가 elMul을 곱하기 **전** 값(executor가 37614/35398 elMul을 적용 — 기존 근접 호출과 같은 규약).
##   opts: 원본 opts 그대로. normalBow 패킷은 Packet.fields 객체 자체(동일성 보존).
func request_native_hurte(actor: Variant, damage: Variant, angle: Variant, no_sound: bool, opts: Variant,
		attack_element: Variant, ctx: Dictionary) -> Dictionary:
	_counts.hurte_requests += 1
	var key: String = _token_key("hurte", ctx)
	if key.is_empty():
		_counts.hurte_refused += 1
		return _receipt("hurte", "REJECTED", "request_token_missing", ctx)
	if _receipts.has(key):
		return _replay(key)
	var status := "REJECTED"
	var reason: String = _live_error()
	if reason.is_empty():
		reason = _hurte_actor_error(actor)
	if reason.is_empty() and not ((damage is int) or (damage is float and is_finite(damage) and damage == floor(damage))):
		reason = "damage_not_integral_source_number"
	if reason.is_empty() and not ((angle is int or angle is float) and is_finite(float(angle))):
		reason = "angle_undefined_or_nonfinite_unported"
	if reason.is_empty() and not (attack_element is int and int(attack_element) >= 0 and int(attack_element) <= 6):
		reason = "attack_element_invalid"
	if reason.is_empty() and not opts is Dictionary:
		reason = "opts_not_dictionary"
	if reason.is_empty() and ARROW._truthy((opts as Dictionary).get("beam")):
		# beam 호출부(33226/34235…)는 elMul을 이미 곱한 float dmg를 넘기고, hurtE 본문 42295 _comboBmT·
		# 42700 화상 사망(+사운드 RNG)·_quiet 분기를 쓴다. 이 executor 미이식 → 쓰기 전 NOT_READY.
		status = "NOT_READY"
		reason = "beam_profile_not_ready:caller_elMul_float_dmg+42295_comboBmT+42700_burn_death"
	if not reason.is_empty():
		_counts.hurte_refused += 1
		return _remember(key, _receipt("hurte", status, reason, ctx, {"mutation": "none", "rng_span": 0}))
	var alive_before: bool = actor.get("alive") == true
	var exec: RefCounted = HURTE.new()
	var out: Dictionary = exec.execute(_main, _world, actor, int(damage), float(angle), int(attack_element), opts)
	var halted_at: int = int(out.get("halted_at", -1)) if out.has("halted_at") else -1
	var out_reason: String = str(out.get("reason", ""))
	if out.get("ok") == true:
		status = "APPLIED" if out.get("applied") == true else "SOURCE_RETURN"
		_counts.hurte_applied += 1
	elif out_reason.begins_with("death_prefix_consumer_not_ready") or (halted_at == 0 and not out_reason.begins_with("enemy_bookkeeping_refused")):
		status = "NOT_READY"
		_counts.hurte_refused += 1
	elif halted_at == 42110:
		status = "REJECTED"
		_counts.hurte_refused += 1
	else:
		status = "PARTIAL"
		_counts.hurte_partial += 1
	var receipt: Dictionary = _receipt("hurte", status, out_reason, ctx, {
		"ok": out.get("ok") == true, "halted_at": halted_at if out.get("ok") != true else null,
		"mutation": "none" if status in ["REJECTED", "NOT_READY"] else "source_prefix",
		"profile": exec.get("hurte_profile"), "opts_identity_preserved": is_same(exec.get("source_opts"), opts),
		"no_sound": no_sound, "alive_before": alive_before, "alive_after": actor.get("alive") == true,
		"applied_fields": {"dmg_to_hp": out.get("dmg_to_hp"), "hp_before": out.get("hp_before"), "hp_after": out.get("hp_after"),
			"shield_before": out.get("shield_before"), "shield_after": out.get("shield_after"), "absorbed": out.get("absorbed"),
			"is_crit": out.get("is_crit"), "stat_crit": out.get("stat_crit")},
		"kill_receipt": {"killed": out.get("killed") == true, "death_prefix": exec.get("death_prefix_receipts")},
		"rng_span": (out.get("rng_draws", []) as Array).size(), "rng_draws": out.get("rng_draws", []),
		"type_affix_reads": exec.get("type_affix_reads"), "journal": out.get("journal", [])})
	return _remember(key, receipt)

func _hurte_actor_error(actor: Variant) -> String:
	if not _actor_registered(actor):
		return "actor_not_registered_in_main_world"
	if actor.has_method("accept_native_hurte_owner_binding"):
		var token: Variant = actor.get("native_hurte_owner_token")
		if not token is String or not is_native_hurte_binding_live(actor, token):
			return "bound_owner_protocol_actor_not_bound:PCI-02"
		return ""
	for method in OWNER_METHODS:
		if not actor.has_method(method):
			return "actor_hurte_owner_api_missing:" + method
	return ""

# ── PCI-02: 신규 actor hurtE owner bind ─────────────────────────────────────────
func bind_native_enemy_hurte_owner(actor: Variant, ctx: Dictionary) -> Dictionary:
	var key: String = _token_key("bind", ctx)
	if key.is_empty():
		return _receipt("bind", "REJECTED", "request_token_missing", ctx)
	if _receipts.has(key):
		return _replay(key)
	var reason: String = _live_error()
	if reason.is_empty() and not _actor_registered(actor):
		reason = "actor_not_registered_in_main_world"
	if reason.is_empty() and not actor.has_method("accept_native_hurte_owner_binding"):
		for method in OWNER_METHODS:
			if not actor.has_method(method):
				return _remember(key, _bind_refused(ctx, "actor_has_no_hurte_owner_protocol:" + method))
		# enemy.gd / 전용 4종: 자체 owner_current 검사를 가진 기존 owner — bind 불필요.
		return _remember(key, _receipt("bind", "NOT_REQUIRED", "existing_native_hurte_owner", ctx,
			{"owner_kind": "existing_native_owner", "write_methods": OWNER_METHODS}))
	if not reason.is_empty():
		return _remember(key, _bind_refused(ctx, reason))
	for method in OWNER_METHODS + BOUND_OWNER_EXTRA:
		if not actor.has_method(method):
			return _remember(key, _bind_refused(ctx, "bound_owner_method_missing:" + method))
	if actor.has_method("is_native_registry_ready") and actor.is_native_registry_ready() != true:
		return _remember(key, _bind_refused(ctx, "actor_native_registry_not_ready"))
	if actor.get("alive") != true:
		return _remember(key, _bind_refused(ctx, "actor_not_alive"))
	var existing: Variant = _bindings.get(actor.get_instance_id())
	if existing is Dictionary and existing.ref.get_ref() == actor:
		return _remember(key, _bind_refused(ctx, "actor_already_bound"))
	_binding_revision += 1
	var owner_token: String = "pc-hurte-owner:%d" % _binding_revision
	_bindings[actor.get_instance_id()] = {"ref": weakref(actor), "token": owner_token, "revision": _binding_revision,
		"world_identity": _world.get_native_world_identity()}
	if actor.accept_native_hurte_owner_binding(self, owner_token) != true:
		_bindings.erase(actor.get_instance_id())
		return _remember(key, _bind_refused(ctx, "actor_refused_binding"))
	var readback: Variant = actor.read_native_normal_enemy_hurte_fields(_world)
	if not readback is Dictionary or readback.get("ready") != true:
		actor.release_native_hurte_owner_binding(self, owner_token)
		_bindings.erase(actor.get_instance_id())
		return _remember(key, _bind_refused(ctx, "bound_readback_not_ready:" + str(readback.get("reason") if readback is Dictionary else "")))
	_counts.bind_applied += 1
	var view := {}
	for field in ["alive", "hp", "mhp", "eShield", "eShieldMax", "etype", "el", "elite", "mods", "ib", "radius", "lv"]:
		view[field] = readback.get(field)
	return _remember(key, _receipt("bind", "APPLIED", "", ctx, {"owner_kind": "bound_owner_protocol",
		"owner_token": owner_token, "revision": _binding_revision, "readback": view,
		"write_methods": OWNER_METHODS + ["apply_native_normal_enemy_poise_core"]}))

func _bind_refused(ctx: Variant, reason: String) -> Dictionary:
	_counts.bind_refused += 1
	return _receipt("bind", "REJECTED", reason, ctx, {"mutation": "none"})

## actor 쪽 owner 메서드가 매 호출 확인하는 O(1) live identity 검사(목록 생성 API 0).
func is_native_hurte_binding_live(actor: Variant, owner_token: String) -> bool:
	if not actor is Node2D or not is_instance_valid(actor):
		return false
	var binding: Variant = _bindings.get(actor.get_instance_id())
	return binding is Dictionary and binding.token == owner_token and binding.ref.get_ref() == actor \
		and is_instance_valid(_world) and actor.get_parent() == _world and actor.is_inside_tree() \
		and is_same(_world.get_native_world_identity(), binding.world_identity)

func release_native_enemy_hurte_owner(actor: Variant, owner_token: String) -> bool:
	if not actor is Node2D or not is_instance_valid(actor):
		return false
	var binding: Variant = _bindings.get(actor.get_instance_id())
	if not binding is Dictionary or binding.token != owner_token:
		return false
	_bindings.erase(actor.get_instance_id())
	if actor.has_method("release_native_hurte_owner_binding"):
		actor.release_native_hurte_owner_binding(self, owner_token)
	return true

# ── PCI-09: 사망 중간 prefix consumer ───────────────────────────────────────────
## consumer.call(prefix_context: Dictionary) -> Dictionary{applied: bool, ...}. profile당 단일 owner.
func register_native_enemy_death_effect(profile: Variant, consumer: Variant, ctx: Dictionary) -> Dictionary:
	var key: String = _token_key("death_effect", ctx)
	if key.is_empty():
		return _receipt("death_effect", "REJECTED", "request_token_missing", ctx)
	if _receipts.has(key):
		return _replay(key)
	if not profile is String or not DEATH_PROFILE_LINES.has(profile):
		return _remember(key, _receipt("death_effect", "REJECTED", "unknown_death_prefix_profile", ctx, {"mutation": "none"}))
	if not consumer is Callable or not (consumer as Callable).is_valid():
		return _remember(key, _receipt("death_effect", "REJECTED", "consumer_not_valid_callable", ctx, {"mutation": "none"}))
	var existing: Variant = _death_consumers.get(profile)
	if existing is Dictionary and (existing.consumer as Callable).is_valid():
		return _remember(key, _receipt("death_effect", "REJECTED", "profile_already_has_live_consumer", ctx, {"mutation": "none"}))
	_death_revision += 1
	_death_consumers[profile] = {"consumer": consumer, "revision": _death_revision, "token": ctx.token}
	return _remember(key, _receipt("death_effect", "APPLIED", "", ctx, {"profile": profile,
		"source_lines": DEATH_PROFILE_LINES[profile], "registration_revision": _death_revision,
		"position": "hurtE kill pipeline after 42764 M26 scan, before 42946 death zone (PCI-11 final-death emission must follow)"}))

func unregister_native_enemy_death_effect(profile: String, consumer: Callable) -> bool:
	var existing: Variant = _death_consumers.get(profile)
	if not existing is Dictionary or existing.consumer != consumer:
		return false
	_death_consumers.erase(profile)
	return true

## executor 진입부(42112 생존 가드 뒤, 첫 쓰기 전)에서 호출. required && !ready면 그 hurtE는 쓰기·RNG 0으로 정지.
func read_native_death_prefix_gate(etype: int, fields: Dictionary) -> Dictionary:
	var profile: Variant = DEATH_PROFILES.get(etype)
	if profile == null:
		return {"required": false}
	if profile == "etype15_death_split" and fields.get("_splitDone") == true:
		return {"required": false, "profile": profile, "reason": "_splitDone"}
	var registered: Variant = _death_consumers.get(profile)
	return {"required": true, "profile": profile,
		"ready": registered is Dictionary and (registered.consumer as Callable).is_valid()}

## executor 처치 파이프라인의 지정 위치에서 동기 호출. 실패는 executor가 그 지점에서 정지(prefix 유지).
func dispatch_native_death_prefix(actor: Node, etype: int, fields: Dictionary, kill_ang: float, dmg: int,
		rand_reader: Callable) -> Dictionary:
	var profile: Variant = DEATH_PROFILES.get(etype)
	var registered: Variant = _death_consumers.get(profile)
	if not registered is Dictionary or not (registered.consumer as Callable).is_valid():
		_counts.death_prefix_refused += 1
		return {"applied": false, "reason": "death_prefix_consumer_lost:" + str(profile)}
	if _death_depth >= DEATH_PREFIX_DEPTH_LIMIT:
		_counts.death_prefix_refused += 1
		return {"applied": false, "reason": "death_prefix_depth_limit"}
	_death_serial += 1
	var token: String = "pc-death-prefix:%d" % _death_serial
	var context := {"schema": SCHEMA, "profile": profile, "source_lines": DEATH_PROFILE_LINES[profile],
		"death_prefix_token": token, "actor": actor, "etype": etype,
		"x": actor.global_position.x, "y": actor.global_position.y, "r": fields.get("radius"), "el": fields.get("el"),
		"lv": fields.get("lv"), "kill_ang": kill_ang, "dmg": dmg,
		# 원본 Math.random 순서를 hurtE와 같은 provider로 이어 쓴다(consumer 안 RNG도 executor rng_draws에 기록).
		"rand": rand_reader,
		"hurt_enemy": Callable(self, "request_native_hurte"), "main": _main, "world": _world}
	_death_depth += 1
	var result: Variant = (registered.consumer as Callable).call(context)
	_death_depth -= 1
	_counts.death_prefix_dispatched += 1
	if not result is Dictionary or result.get("applied") != true:
		return {"applied": false, "reason": "death_prefix_consumer_refused:" + str(profile),
			"death_prefix_token": token, "consumer_receipt": result}
	return {"applied": true, "profile": profile, "death_prefix_token": token,
		"source_lines": DEATH_PROFILE_LINES[profile], "consumer_receipt": result, "continued": true}

# ── PCI-05: 실제 탄 carrier ──────────────────────────────────────────────────────
func admit_native_source_projectile(owner: Variant, packet: Variant, ctx: Dictionary) -> Dictionary:
	var key: String = _token_key("admit", ctx)
	if key.is_empty():
		return _receipt("admit", "REJECTED", "request_token_missing", ctx)
	if _receipts.has(key):
		return _replay(key)
	var reason: String = _live_error()
	if reason.is_empty() and packet is Dictionary:
		_counts.admit_refused += 1
		return _remember(key, _receipt("admit", "NOT_READY",
			"hostile_birth_owner_is_existing_demo11_35_registry(_birth_request:spawnProj/_spawnBossProjectile)", ctx,
			{"mutation": "none"}))
	if reason.is_empty() and not packet is STORE.Packet:
		reason = "packet_handle_not_actual_store_packet"
	if reason.is_empty() and owner != _player:
		reason = "source_owner_not_actual_player(turret/pet xbow unported)"
	if reason.is_empty() and packet.phase != "borrowed":
		reason = "packet_not_borrowed_phase:" + str(packet.phase)
	if reason.is_empty():
		reason = _arrow.preflight(packet, 0.0)
	if not reason.is_empty():
		_counts.admit_refused += 1
		return _remember(key, _receipt("admit", "REJECTED", reason, ctx, {"mutation": "none"}))
	var published: Dictionary = _world.publish_native_player_projectile(_main, packet)
	if published.get("ready") != true:
		_counts.admit_refused += 1
		return _remember(key, _receipt("admit", "REJECTED", "store_publish_refused:" + str(published.get("reason")), ctx, {"mutation": "none"}))
	_admission_serial += 1
	_admissions[packet.get_instance_id()] = {"serial": _admission_serial, "owner": weakref(owner)}
	_counts.admitted += 1
	return _remember(key, _receipt("admit", "APPLIED", "", ctx, {"packet_id": packet.get_instance_id(),
		"admission_serial": _admission_serial, "registry_handle": packet,
		"registry": "World.native_player_projectile_store (source pProjs/_getPProj pool)",
		"registry_index": published.get("registry_index"), "source_owner": owner, "profile": "normalBow"}))

## 단일 handle 1스텝. 원본은 pProjs 배열 순서로 전부 처리하므로 여러 발이면 pass API를 쓴다.
func advance_native_source_projectile(handle: Variant, sp: Variant, ctx: Dictionary) -> Dictionary:
	var key: String = _token_key("advance", ctx)
	if key.is_empty():
		return _receipt("advance", "REJECTED", "request_token_missing", ctx)
	if _receipts.has(key):
		return _replay(key)
	var reason: String = _live_error()
	if reason.is_empty() and not ARROW.is_normal_bow_packet(handle):
		reason = "handle_not_normal_bow_store_packet"
	if reason.is_empty() and handle.phase != "live":
		reason = "handle_not_live:" + str(handle.phase)
	if reason.is_empty() and _world.get_native_player_projectile_store_snapshot().get("source_iteration_open") == true:
		reason = "source_pass_iteration_open"
	if reason.is_empty() and not ((sp is int or sp is float) and is_finite(float(sp)) and float(sp) >= 0.0):
		reason = "source_sp_invalid"
	if reason.is_empty() and _blocked.has(handle.get_instance_id()):
		reason = "packet_blocked_after_partial"
	if not reason.is_empty():
		return _remember(key, _receipt("advance", "REJECTED", reason, ctx, {"mutation": "none"}))
	_counts.steps += 1
	var out: Dictionary = _arrow.step(handle, float(sp), ctx)
	var release_receipt: Variant = null
	if out.get("release") is Dictionary:
		release_receipt = _world.retire_native_player_projectile(_main, handle, out.release.recycle == true)
	elif out.status == "PARTIAL":
		_blocked[handle.get_instance_id()] = {"ref": weakref(handle), "reason": out.get("reason")}
	var status: String = "REJECTED" if out.status == "REFUSED" else ("PARTIAL" if out.status == "PARTIAL" else "APPLIED")
	return _remember(key, _receipt("advance", status, str(out.get("reason", "")), ctx, _step_view(handle, out, release_receipt)))

## World 플레이어 탄 store 1 pass(원본 35176 배열 순서). normalBow 외 패킷은 제자리 유지(기존/향후 owner 소유).
func advance_native_player_projectile_pass(sp: Variant, ctx: Dictionary) -> Dictionary:
	var key: String = _token_key("pass", ctx)
	if key.is_empty():
		return _receipt("pass", "REJECTED", "request_token_missing(caller frame serial)", ctx)
	if _receipts.has(key):
		return _replay(key)
	var reason: String = _live_error()
	if reason.is_empty() and not ((sp is int or sp is float) and is_finite(float(sp)) and float(sp) >= 0.0):
		reason = "source_sp_invalid"
	if not reason.is_empty():
		return _remember(key, _receipt("pass", "REJECTED", reason, ctx, {"mutation": "none"}))
	var begun: Dictionary = _world.begin_native_player_projectile_iteration(_main)
	if begun.get("ready") != true:
		return _remember(key, _receipt("pass", "REJECTED", "store_iteration_refused:" + str(begun.get("reason")), ctx, {"mutation": "none"}))
	var packets: Array = begun.packets
	var env: Dictionary = {} # 첫 normalBow 패킷에서 1회 구성(빈 pass 비용 0)
	var read_index := 0
	var write_index := 0
	var results: Array = []
	var partial := false
	_counts.passes += 1
	while read_index < packets.size():
		var packet: Variant = packets[read_index]
		if ARROW.is_normal_bow_packet(packet) and env.is_empty():
			env = _arrow.build_env()
		if not ARROW.is_normal_bow_packet(packet) or _blocked.has(packet.get_instance_id()) or env.get("ok") != true:
			packets[write_index] = packet
			write_index += 1
			read_index += 1
			continue
		_counts.steps += 1
		var out: Dictionary = _arrow.step(packet, float(sp), ctx, env)
		var release_receipt: Variant = null
		if out.get("release") is Dictionary:
			release_receipt = _world.retire_native_player_projectile(_main, packet, out.release.recycle == true)
		else:
			if out.status in ["REFUSED", "PARTIAL"]:
				_blocked[packet.get_instance_id()] = {"ref": weakref(packet), "reason": out.get("reason")}
			packets[write_index] = packet
			write_index += 1
		results.append(_step_view(packet, out, release_receipt))
		read_index += 1
		if out.status == "PARTIAL":
			partial = true
			while read_index < packets.size():
				packets[write_index] = packets[read_index]
				write_index += 1
				read_index += 1
	var finished: bool = _world.finish_native_player_projectile_iteration(_main, write_index)
	_last_pass = {"survivors": write_index, "results": results.size(), "partial": partial, "finished": finished, "env_ready": env.is_empty() or env.get("ok") == true}
	var env_ok: bool = env.is_empty() or env.get("ok") == true
	var pass_status: String = "PARTIAL" if partial or not finished else ("APPLIED" if env_ok else "NOT_READY")
	return _remember(key, _receipt("pass", pass_status,
		("" if finished else "store_finish_refused") if env_ok else str(env.get("reason")), ctx, {"results": results, "survivors": write_index,
			"blocked": _blocked.size(), "source_order": "store_array_order_35176"}))

func _step_view(packet: RefCounted, out: Dictionary, release_receipt: Variant) -> Dictionary:
	var admission: Variant = _admissions.get(packet.get_instance_id())
	var contacts: Array = []
	var reflects: Array = []
	var field_contacts: Array = []
	for ev in out.get("events", []):
		if ev.get("event") == "enemy_contact":
			contacts.append(ev)
		elif ev.get("event") == "wall_reflect":
			reflects.append(ev)
		elif ev.get("event") == "field_mob_contact": # 35279 _hurtFieldMobs (필드보스 — hurtE 아님, _fmApply)
			field_contacts.append(ev)
	if out.get("release") is Dictionary:
		_admissions.erase(packet.get_instance_id())
	return {"step_status": out.status, "packet_id": packet.get_instance_id(),
		"admission_serial": admission.serial if admission is Dictionary else null,
		"collision_receipt": contacts, "reflect_receipt": reflects, "field_mob_receipt": field_contacts,
		"expired": out.status in ["DEAD_DISTANCE", "DEAD_WALL"], "release_receipt": release_receipt,
		"released_once": out.get("release") is Dictionary, "reason": out.get("reason", "")}

# ── PCI-06: 동일 packet 상호작용 ─────────────────────────────────────────────────
## event.kind: q_release / e_release / player_contact / enemy_reflect / wall_reflect / enemy_contact
func resolve_native_projectile_interaction(packet: Variant, target: Variant, event: Dictionary, ctx: Dictionary) -> Dictionary:
	var key: String = _token_key("interaction", ctx)
	if key.is_empty():
		return _receipt("interaction", "REJECTED", "request_token_missing", ctx)
	if _receipts.has(key):
		return _replay(key)
	_counts.interactions += 1
	var kind: String = str(event.get("kind", ""))
	var reason: String = _live_error()
	if not reason.is_empty():
		return _remember(key, _receipt("interaction", "REJECTED", reason, ctx, {"mutation": "none"}))
	if packet is STORE.Packet:
		# 플레이어 탄의 벽 반사·적 접촉은 원본 pProjs pass 안에서만 일어난다(35236/35407). 단독 재실행은 중복 집행.
		var why: String = "player_packet_interactions_resolved_inside_source_pass(advance_native_player_projectile_pass)" \
			if kind in ["wall_reflect", "enemy_contact", "enemy_reflect"] else "event_not_applicable_to_player_packet"
		return _remember(key, _receipt("interaction", "REJECTED", why, ctx, {"mutation": "none",
			"packet_id": packet.get_instance_id(), "parry_class": "player_owned"}))
	if not packet is Node2D or not is_instance_valid(packet):
		return _remember(key, _receipt("interaction", "REJECTED", "packet_not_actual_carrier", ctx, {"mutation": "none"}))
	var raw: Variant = packet.get("raw")
	var parry_class: Variant = raw.get("parryClass") if raw is Dictionary else null
	var view := {"packet_id": packet.get_instance_id(), "parry_class": parry_class, "friendly": raw.get("friendly") if raw is Dictionary else null,
		"mutation": "none"}
	match kind:
		"q_release":
			if raw is Dictionary and parry_class != null:
				# DEMO11-35 carrier: 원본 35043 Q 마법탄→블루콩 전환(pParryProjDmg×1.5·유도·doParry) owner 미이식.
				return _remember(key, _receipt("interaction", "NOT_READY",
					"demo11_35_carrier_q_release_unported:%s:G35043-35063" % str(parry_class), ctx, view))
			if target != _player or not (event.get("distance") is float or event.get("distance") is int):
				return _remember(key, _receipt("interaction", "REJECTED", "q_release_requires_actual_player_and_distance", ctx, view))
			# 기존 Q 반사 owner(gbBean/blackBean 실제 carrier) 그대로 — 같은 carrier identity.
			var reflected: Dictionary = _main.reflect_native_q_source_projectile(packet, float(event.distance))
			view["delegate"] = "Main.reflect_native_q_source_projectile"
			view["delegate_receipt"] = reflected
			view["reflected"] = reflected.get("reflected") == true
			view["mutation"] = "delegate_owner" if view.reflected else "none"
			return _remember(key, _receipt("interaction", "APPLIED" if view.reflected else "REJECTED",
				"" if view.reflected else str(reflected.get("reason")), ctx, view))
		"e_release":
			return _remember(key, _receipt("interaction", "NOT_READY", "source_e_release_physical_parry_unported:G38460/38470", ctx, view))
		"player_contact":
			return _remember(key, _receipt("interaction", "NOT_READY", "source_hurtProjectilePlayer_contact_unported:G35066-35088", ctx, view))
		"enemy_reflect", "wall_reflect":
			return _remember(key, _receipt("interaction", "NOT_READY", "hostile_carrier_%s_unported" % kind, ctx, view))
	return _remember(key, _receipt("interaction", "REJECTED", "unknown_interaction_kind", ctx, view))

# ── carrier 보조 읽기 ───────────────────────────────────────────────────────────
func read_enemy_element_multiplier(atk_el: int, enemy: Node) -> Variant:
	if not enemy.has_method("read_native_normal_enemy_hurte_fields"):
		return null
	var fields: Variant = enemy.read_native_normal_enemy_hurte_fields(_world)
	if not fields is Dictionary or fields.get("ready") != true:
		return null
	var providers: Dictionary = _main.get_native_normal_enemy_damage_provider_callbacks()
	var cb: Variant = providers.get("el_mul")
	if not cb is Callable or not (cb as Callable).is_valid():
		return null
	var result: Variant = cb.call(atk_el, int(fields.el))
	if not result is Dictionary or str(result.get("status")) != "READY":
		return null
	return float(result.value)

func read_passive_number(name: String) -> Variant:
	var state: Variant = _main.get("source_state")
	if not is_instance_valid(state):
		return null
	var passives: Variant = state.read_current_passives()
	if not passives is Dictionary:
		return null
	var v: Variant = passives.get(name, 0)
	if v == null or (v is bool and not v):
		return 0.0
	return float(v) if (v is int or v is float) and is_finite(float(v)) else null

func get_snapshot() -> Dictionary:
	var live_bindings := 0
	for b in _bindings.values():
		if b.ref.get_ref() != null:
			live_bindings += 1
	var profiles: Array = []
	for p in _death_consumers:
		profiles.append(p)
	return {"schema": SCHEMA, "configured": is_instance_valid(_main), "last_error": _last_error,
		"counts": _counts.duplicate(), "bindings": live_bindings, "death_profiles": profiles,
		"blocked_packets": _blocked.size(), "receipt_cache": _receipts.size(), "last_pass": _last_pass.duplicate(true),
		"field_mob_owner": _arrow.read_field_owner_snapshot() if _arrow != null else {}}
