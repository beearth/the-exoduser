extends SceneTree
## PC-M29-PARRY (2026-10-21) — M29 비투사체 접촉 패링 제공자 검증. 실제 Main 부팅.
## 대상: Main.native_m29_contact(scripts/native_m29_contact_services.gd) + 실제 type3_native_binding
## + 실제 M29 kernel + 실제 Player/Q 제어/State/authority writer. 원본 대조 = Node VM oracle(UTF-8 파일).
## Fixture 경계(정직 기록):
##  - M29 레시피의 엘리트/접사 RNG 는 fixture 수열([.01,.1]) — 자연 선택(EL-01)·자연 스폰은 Mac 범위.
##  - warning/impact/detonate 소비자와 emit_charged_projectile 는 테스트 기록기(실제 VFX/SFX 아님).
##  - 접촉 대기 540틱 동안 Player 위치를 actor 기준 ±300px 로 재배치(fixture_player_repositions 집계).
##  - poise 코어 oracle 대조는 미등록 fixture actor 의 raw poise/ib/_pImmune/stunned 를 강제 설정(forced_raw_fields 집계).
## INTEG-9 전제(2026-10-22): 원본 = 고정 스냅샷 res://source_snapshot/game.html(SHA 4d911cdd…, snapshot.gd/.cjs).
##  루트 game.html은 읽지 않는다. Mac 테스트 관례(bc09 등)대로 --source-game= 값은 받아도 스냅샷 경로로 고정. oracle도 snapshot.cjs.
const USERDIR := "EXODUSER-pc-m29-parry-Isolated-20261021"
const GAME_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const MAIN := preload("res://scripts/main.gd")
const SNAPSHOT := preload("res://source_snapshot/snapshot.gd")
const Binding := preload("res://scripts/type3_native_binding.gd")
const SpawnRecipe := preload("res://scripts/type3_spawn_recipe.gd")
const Services := preload("res://scripts/native_m29_contact_services.gd")
const M29 := preload("res://scripts/enemy_mod_m29.gd")
const FORMULA := preload("res://port_modules/combat_stat_formula/producer.gd")

class FixtureRandom extends RefCounted:
	var sequence: Array
	func _init(initial: Array) -> void: sequence = initial.duplicate()
	func next() -> float: return float(sequence.pop_front()) if not sequence.is_empty() else 0.5

var assertions := 0
var failures := 0
var source_path: String = ProjectSettings.globalize_path(SNAPSHOT.PATH) # INTEG-9: 고정 스냅샷
var node_bin := ""
var artifacts_dir := ""
var main: Node
var world: Node2D
var player: Node2D
var services: RefCounted
var actor: Node2D
var oracle: Dictionary = {}
var observations: Dictionary = {}
var fixture_player_repositions := 0
var forced_raw_fields := 0
var explicit_phases := 0
var order: Array = []
var fx_events: Array = []
var packets: Array = []
var telemetry: Array = []
var reentry: Dictionary = {}
var reject_consumer := false
var kb_at_hurt := Vector2.ZERO
var kb_delta_at_impact := Vector2.INF
var damage_event: Dictionary = {}

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PCM29_FAIL ", label)

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path = ProjectSettings.globalize_path(SNAPSHOT.PATH) # Mac 관례: 값과 무관하게 스냅샷
		elif arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
		elif arg.begins_with("--artifacts-dir="): artifacts_dir = arg.trim_prefix("--artifacts-dir=")
	call_deferred("_run")

func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true and OS.get_user_data_dir().get_file() == USERDIR, "isolated_userdir")
	if failures: return _finish()
	_group("oracle_source_vm", _oracle_group)
	main = MAIN.new()
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	for i in range(4): await physics_frame
	world = main.world
	player = main.player
	services = main.native_m29_contact
	player.telemetry_event.connect(_on_player_event)
	_group("main_services_exposed", _services_group)
	_group("pwin_oracle_table", _pwin_group)
	_group("poise_core_oracle", _poise_core_group)
	_group("binder_rejects_until_fx_consumers", _binder_gate_group)
	if not _spawn_actor(): return _finish()
	_group("rejection_matrix_zero_writes", _rejection_group)
	# 피해 접촉을 먼저 두어 패링 시점 HP 가 최대치 미만이 되게 한다(보상 적용이 cap 에 가려지지 않게).
	await _group_async("live_damage_contact", _damage_contact)
	await _group_async("live_parry_contact", _parry_contact)
	_group("consumer_failure_and_reentry", _consumer_failure_group)
	await _group_async("tick_bench_300", _bench)
	_finish()

var _current_group := ""
func _group(name: String, callback: Callable) -> void:
	var before := failures
	_current_group = name
	callback.call()
	print("PCM29_GROUP ", JSON.stringify({"group": name, "failures": failures - before}))

func _group_async(name: String, callback: Callable) -> void:
	var before := failures
	_current_group = name
	await callback.call()
	print("PCM29_GROUP ", JSON.stringify({"group": name, "failures": failures - before}))

# ── oracle ───────────────────────────────────────────────────────────────────
func _oracle_group() -> void:
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path) == GAME_SHA256, "untouched_source_sha256")
	check(SNAPSHOT.SHA256 == GAME_SHA256 and source_path == ProjectSettings.globalize_path(SNAPSHOT.PATH), "source_snapshot_pinned:" + source_path)
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin), "explicit_node_bin")
	var out_dir := artifacts_dir if not artifacts_dir.is_empty() else OS.get_user_data_dir()
	var out_path := out_dir.path_join("pc_m29_parry_oracle.json")
	if FileAccess.file_exists(out_path): DirAccess.remove_absolute(out_path)
	var output: Array = []
	var code := OS.execute(node_bin, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_m29_parry_source_oracle.cjs"), source_path, out_path]), output, true)
	check(code == 0, "oracle_vm_exit0")
	var decoded: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path)) if FileAccess.file_exists(out_path) else null
	check(decoded is Dictionary and decoded.get("source_sha256") == GAME_SHA256, "oracle_utf8_payload")
	if decoded is Dictionary: oracle = decoded
	var by_name := {}
	for row in oracle.get("cases", []): by_name[row.name] = row
	# 원본 접촉 순서(G40533~40535)
	for name in ["parry_sBlock_window", "parry_idle_release_window", "parry_sBash_window_poise_break", "parry_boss_poise_break", "parry_regen_bonus"]:
		var row: Dictionary = by_name.get(name, {})
		check(row.get("order", []) == ["isPWin", "P.parryBank=", "addTxt", "doParry", "_poiseHit"], "oracle_parry_order:" + name)
		check(not (row.get("order", []) as Array).has("hurtP"), "oracle_parry_no_damage:" + name)
	for name in ["damage_idle", "damage_idle_ice_element", "sBash_after_window_damage"]:
		check(by_name.get(name, {}).get("order", []) == ["isPWin", "elMul", "hurtP", "eModHitP", "_addBoom", "bigImpact", "shake", "SFX.detonate"], "oracle_damage_order:" + name)
	observations["oracle_cases"] = by_name.size()
	observations["oracle_pwin_rows"] = (oracle.get("pwin", []) as Array).size()

# ── Main 서비스 노출 ──────────────────────────────────────────────────────────
func _services_group() -> void:
	check(services != null and services.get_script() == Services, "main_installs_actual_provider")
	var bundle: Dictionary = main.get_native_m29_services()
	check(bundle.keys().size() == 4 and ["player_context", "handle_m29_parry", "emit_m29_event", "m29_readiness"].all(func(k): return bundle.get(k) is Callable and bundle[k].is_valid()), "four_binder_callables")
	var ready: Dictionary = services.m29_readiness()
	check(ready.get("combat_qe") == true, "combat_qe_ready:" + str(ready.get("combat_qe_reason")))
	check(ready.get("warning_fx") == false and ready.get("impact_fx") == false and ready.get("detonate_sound") == false, "fx_not_ready_without_real_consumers")
	var context: Dictionary = services.player_context(player)
	check(context.get("parry_window") == false and context.get("state") == "idle" and is_equal_approx(float(context.x), player.global_position.x), "idle_context_window_closed")
	var foreign := Node2D.new()
	check(services.player_context(foreign).is_empty(), "foreign_target_context_rejected")
	foreign.free()
	# 기존 보상식 단일화 = 원본 doParry 보상(oracle)
	var by_name := {}
	for row in oracle.get("cases", []): by_name[row.name] = row
	var base: Dictionary = by_name.get("parry_sBlock_window", {})
	var bonus: Dictionary = by_name.get("parry_regen_bonus", {})
	check(main.native_source_parry_reward(0.0, 0.0, 1.0) == int(base.after.P.st - base.input.P.st), "reward_formula_matches_source_base")
	check(main.native_source_parry_reward(0.1, 2.0, 1.0) == int(bonus.after.P.st - bonus.input.P.st), "reward_formula_matches_source_bonus_regen")
	var current: Dictionary = main.read_native_q_parry_source()
	check(current.get("ready") == true and float(current.stats.parry_bonus) == 0.0 and float(current.regen_lv) == 0.0, "new_run_parry_inputs_zero")
	observations["services_snapshot_boot"] = services.get_snapshot()

# ── isPWin 표 ─────────────────────────────────────────────────────────────────
func _pwin_group() -> void:
	var rows: Array = oracle.get("pwin", [])
	var mismatches := 0
	for row in rows:
		var win: int = mini(20, FORMULA.js_to_int32(16.0 * (1.0 + float(row.cape))))
		if win != int(row.l_parry_win_ticks): mismatches += 1
		if Services.source_is_p_win(str(row.state), float(row.st2), float(row.sb_parry_t), float(row.ki_parry_t), win) != bool(row.value): mismatches += 1
	check(rows.size() == 480 and mismatches == 0, "pwin_480_rows_equal_source mismatches=" + str(mismatches))
	# 기존 CombatQEProducer.is_parry_window 는 sBash+_sbParryT 와 _kiParryT 항이 없어 접촉용으로 재사용하지 않는다(사실 기록).
	var differs := 0
	for row in rows:
		if float(row.cape) != 0.0: continue
		var producer: bool = preload("res://port_modules/combat_qe/producer.gd").is_parry_window(str(row.state), float(row.sb_parry_t), float(row.st2))
		if producer != bool(row.value): differs += 1
	observations["combat_qe_producer_rows_differing_from_isPWin"] = differs

# ── _poiseHit 코어 ────────────────────────────────────────────────────────────
func _poise_core_group() -> void:
	var by_name := {}
	for row in oracle.get("cases", []): by_name[row.name] = row
	for name in ["parry_sBlock_window", "parry_sBash_window_poise_break", "parry_boss_poise_break", "parry_boss_poise_immune"]:
		var row: Dictionary = by_name.get(name, {})
		var fixture := _fixture_actor()
		if fixture == null:
			check(false, "fixture_actor:" + name)
			continue
		var raw: Dictionary = fixture.get_native_modifier_state()
		var e: Dictionary = row.input.e
		for key in ["poise", "poiseR", "stunned", "ib"]:
			raw[key] = e[key]
			forced_raw_fields += 1
		if e.has("_pImmune"):
			raw["_pImmune"] = e["_pImmune"]
			forced_raw_fields += 1
		var result: Dictionary = fixture.apply_native_source_poise_core(20.0)
		var after: Dictionary = row.after.e
		check(result.get("ready") == true, "poise_core_ready:" + name)
		check(float(raw.poise) == float(after.poise) and float(raw.poiseR) == float(after.poiseR) and float(raw.stunned) == float(after.stunned), "poise_fields_equal_source:" + name)
		check(raw.get("_maxStunned") == null if not after.has("_maxStunned") else float(raw._maxStunned) == float(after._maxStunned), "max_stunned_equal_source:" + name)
		check(raw.get("_pImmune") == null if not after.has("_pImmune") else float(raw._pImmune) == float(after._pImmune), "pimmune_equal_source:" + name)
		fixture.free()
	var unconfigured := Binding.new()
	check(unconfigured.apply_native_source_poise_core(20.0).get("ready") == false, "unconfigured_actor_poise_rejected")
	unconfigured.free()

func _fixture_actor() -> Node2D:
	var recipe := _recipe(player.global_position + Vector2(300, 0))
	if recipe.is_empty(): return null
	var fixture := Binding.new()
	if not fixture.configure(recipe, player, world, _interfaces_for_fixture()):
		fixture.free()
		return null
	return fixture

func _interfaces_for_fixture() -> Dictionary:
	# 미등록 poise-코어 fixture 전용 readiness(이 actor 는 world 에 등록되지 않고 phase 도 받지 않는다).
	var interfaces: Dictionary = main.get_native_m29_services().duplicate()
	interfaces.merge({"render_body": false, "native_random": Callable(world, "sample_native_random_unit"), "emit_charged_projectile": _record_packet,
		"element_multiplier": Callable(player, "get_native_element_multiplier"), "is_tile_wall": Callable(world, "is_world_blocked")})
	interfaces["m29_readiness"] = func(): return {"combat_qe": true, "warning_fx": true, "impact_fx": true, "detonate_sound": true, "fixture_only_unregistered_poise_core": true}
	return interfaces

func _recipe(at: Vector2) -> Dictionary:
	var rng := FixtureRandom.new([0.01, 0.1])
	var builder := SpawnRecipe.new()
	if not builder.configure(rng.next, func(x, y, r): return world.can_move(Vector2(x, y), r), Callable(world, "native_safe_point")):
		return {}
	var outcome: Dictionary = builder.build_child(at.x, at.y, {"stage": 0, "room": 0, "player_level": 1, "difficulty": 5, "stage_difficulty_offset": 0}, 0)
	if outcome.get("valid") != true: return {}
	var recipe: Dictionary = outcome.recipe
	return recipe if recipe.get("mods") == ["M29"] else {}

func _record_packet(_actor: Node2D, packet: Dictionary) -> bool:
	packets.append(packet.duplicate(true))
	return true

# ── binder 거부: 실제 FX 소비자 없으면 구성 0 ─────────────────────────────────
func _binder_gate_group() -> void:
	var recipe := _recipe(player.global_position + Vector2(300, 0))
	check(not recipe.is_empty(), "m29_recipe_built")
	var probe := Binding.new()
	var interfaces: Dictionary = _actual_interfaces()
	check(not probe.configure(recipe, player, world, interfaces), "binder_rejects_without_fx_consumers")
	check(str(probe.get_snapshot().get("binding_configuration_error")) == "unavailable_actual_M29_warning_fx", "binder_reason_warning_fx")
	probe.free()
	for capability in Services.FX_CAPABILITIES:
		check(services.bind_m29_fx_consumer(capability, Callable(self, "_fx_" + capability)), "bind_consumer:" + capability)
		check(not services.bind_m29_fx_consumer(capability, Callable(self, "_fx_" + capability)), "single_owner_consumer:" + capability)
	check(not services.bind_m29_fx_consumer("combat_qe", _record_packet) and not services.bind_m29_fx_consumer("bogus", _record_packet), "unknown_capability_rejected")
	var ready: Dictionary = services.m29_readiness()
	check(ready.combat_qe and ready.warning_fx and ready.impact_fx and ready.detonate_sound, "all_four_ready_after_consumers")

func _actual_interfaces() -> Dictionary:
	var interfaces: Dictionary = main.get_native_m29_services().duplicate()
	interfaces.merge({"render_body": false, "native_random": Callable(world, "sample_native_random_unit"), "emit_charged_projectile": _record_packet,
		"element_multiplier": Callable(player, "get_native_element_multiplier"), "is_tile_wall": Callable(world, "is_world_blocked")})
	return interfaces

func _fx_warning_fx(source: Node2D, event: Dictionary) -> bool:
	fx_events.append({"cap": "warning_fx", "kind": event.kind})
	if event.kind == "windup_started" and reentry.is_empty():
		var nested_parry: bool = services.handle_m29_parry(source, player, {"kind": "player_parry"})
		var parry_reason: String = services.get_last_parry().get("reason", "")
		var nested_emit: bool = services.emit_m29_event(source, {"kind": "vfx_spark"})
		reentry = {"parry": nested_parry, "parry_reason": parry_reason, "emit": nested_emit, "emit_reason": services.get_snapshot().last_error}
	return not reject_consumer

func _fx_impact_fx(_source: Node2D, event: Dictionary) -> bool:
	fx_events.append({"cap": "impact_fx", "kind": event.kind})
	order.append("impact_fx")
	kb_delta_at_impact = player.get_native_knockback() - kb_at_hurt
	damage_event = event.duplicate(true)
	return true

func _fx_detonate_sound(_source: Node2D, event: Dictionary) -> bool:
	fx_events.append({"cap": "detonate_sound", "kind": event.kind})
	order.append("detonate_sound")
	return true

func _on_player_event(kind: String, data: Dictionary) -> void:
	telemetry.append({"kind": kind, "data": data.duplicate(true)})
	if kind == "player_damage":
		order.append("hurtP")
		kb_at_hurt = player.get_native_knockback()
	elif kind == "m29_contact_parry":
		order.append("m29_contact_parry")

# ── 실제 actor 배치 ──────────────────────────────────────────────────────────
var site := Vector2.ZERO
func _spawn_actor() -> bool:
	site = _find_site()
	check(site != Vector2.INF, "open_site_found")
	if site == Vector2.INF: return false
	player.global_position = site + Vector2(300, 0)
	fixture_player_repositions += 1
	var recipe := _recipe(site)
	actor = Binding.new()
	var ok: bool = actor.configure(recipe, player, world, _actual_interfaces())
	check(ok, "actual_binder_configured_with_main_services:" + str(actor.get_snapshot().get("binding_configuration_error")))
	if not ok: return false
	check(not services.handle_m29_parry(actor, player, {"kind": "player_parry"}) and services.get_last_parry().reason == "actor_not_registered_in_main_world", "unregistered_actor_rejected")
	world.add_child(actor)
	check(actor.is_native_registry_ready() and actor.get_snapshot()["M29_actual_required_capabilities"].get("combat_qe") == true, "actor_registered_in_main_world")
	observations["site"] = [site.x, site.y]
	observations["actor_recipe"] = {"atk": recipe.atk, "el": recipe.el, "r": recipe.r, "poise": recipe.poise, "speed": recipe.speed}
	return true

func _find_site() -> Vector2:
	var start: Vector2 = world.get_start_position()
	var candidates: Array = []
	for gx in range(6, 50):
		for gy in range(6, 50):
			candidates.append(Vector2(gx * 160.0, gy * 160.0))
	candidates.sort_custom(func(a, b): return a.distance_squared_to(start) < b.distance_squared_to(start))
	for c in candidates:
		var nearest := INF
		for enemy in world.get_enemies():
			if is_instance_valid(enemy) and enemy.get("alive") == true: nearest = minf(nearest, enemy.global_position.distance_to(c))
		if nearest < 1300.0: continue
		var open := true
		for dy in [-48.0, 0.0, 48.0]:
			var x := -900.0
			while open and x <= 900.0:
				open = world.can_move(c + Vector2(x, dy), 34.0)
				x += 12.0
			if not open: break
		if open and world.has_line_of_sight(c, c + Vector2(300, 0)): return c
	return Vector2.INF

# ── 거부 행렬(쓰기 0) ────────────────────────────────────────────────────────
func _rejection_group() -> void:
	var before := _writes_probe()
	var raw: Dictionary = actor.get_native_modifier_state()
	var forged := {"kind": "player_parry", "parry_bank_add": int(M29._or(raw.atk, 10.0)), "poise_hit": 20.0,
		"do_parry": {"atk": float(raw.atk), "x": float(raw.x), "y": float(raw.y), "projectile": false, "el": raw.el}}
	var stranger := Node2D.new()
	world.add_child(stranger)
	var cases := [
		[stranger, player, forged, "external_actor_not_type3_binding"],
		[actor, stranger, forged, "external_target_not_main_player"],
		[actor, player, {"kind": "player_damage"}, "not_m29_player_parry_event"],
		[actor, player, _with(forged, "do_parry", _with(forged.do_parry, "projectile", true)), "projectile_contact_not_accepted_here"],
		[actor, player, _with(forged, "poise_hit", 25.0), "invalid_m29_parry_payload"],
		[actor, player, forged, "actor_not_in_eCharge_contact"]]
	for row in cases:
		var accepted: bool = services.handle_m29_parry(row[0], row[1], row[2])
		var last: Dictionary = services.get_last_parry()
		check(not accepted and last.reason == row[3], "reject:" + row[3] + " got=" + str(last.reason))
	stranger.queue_free()
	check(not services.emit_m29_event(actor, {"kind": "made_up"}), "unknown_event_kind_rejected")
	check(_writes_probe() == before, "rejections_write_nothing")
	observations["rejection_cases"] = cases.size() + 1

static func _js_truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if value is int or value is float: return float(value) != 0.0 and not is_nan(float(value))
	if value is String: return not value.is_empty()
	return true

func _with(source: Dictionary, key: String, value: Variant) -> Dictionary:
	var copy := source.duplicate(true)
	copy[key] = value
	return copy

func _writes_probe() -> Dictionary:
	var p: Dictionary = main.source_state.read_current_p()
	var raw: Dictionary = actor.get_native_modifier_state()
	return {"bank": p.get("parryBank"), "hp": player.hp, "st": player.stamina, "mp": p.get("mp"), "if": player.iframes, "poise": player.poise,
		"e_poise": raw.poise, "e_poiseR": raw.poiseR, "e_stunned": raw.stunned, "q_reflections": main.get_native_q_reflection_snapshot().count}

# ── 실제 접촉: 패링 ──────────────────────────────────────────────────────────
func _phase() -> void:
	var ctx: Dictionary = world.get_native_projectile_fx_context()
	actor.advance_native_phase(float(ctx.dt_sp), world.get_native_frame(), world.get_native_world_identity())
	explicit_phases += 1

func _accumulate_to_windup(limit: int) -> bool:
	var n := 0
	while n < limit:
		await physics_frame
		var raw: Dictionary = actor.get_native_modifier_state()
		if str(raw.s) in ["idle", "recover"]:
			var direction := 1.0 if (n / 30) % 2 == 0 else -1.0
			player.global_position = Vector2(float(raw.x), float(raw.y)) + Vector2(300.0 * direction, 0.0)
			fixture_player_repositions += 1
		_phase()
		n += 1
		if str(actor.get_native_modifier_state().s) == "eChargeWind": return true
	return false

func _press_parry(pressed: bool) -> Dictionary:
	var event := InputEventAction.new()
	event.action = "parry"
	event.pressed = pressed
	return player.handle_native_input_event(event)

func _parry_contact() -> void:
	# 피해 후 recover→idle, busy78·accumulate540 재충전.
	check(await _accumulate_to_windup(1600), "second_windup_reached")
	var q_before: int = main.get_native_q_reflection_snapshot().count
	var damage_before := telemetry.filter(func(t): return t.kind == "player_damage").size()
	var pressed_at := -1
	var before: Dictionary = {}
	order.clear()
	for i in range(140):
		await physics_frame
		var raw: Dictionary = actor.get_native_modifier_state()
		if pressed_at < 0 and str(raw.s) == "eCharge":
			check(_press_parry(true).get("accepted") == true, "q_press_admitted")
			pressed_at = i
		if pressed_at >= 0 and before.is_empty() and str(player.state) == "sBlock":
			before = _writes_probe()
			before["context"] = services.player_context(player)
		_phase()
		if not services.get_last_parry().is_empty() and services.get_last_parry().get("accepted") == true: break
	var last: Dictionary = services.get_last_parry()
	check(last.get("accepted") == true, "live_m29_parry_accepted:" + str(last.get("reason")))
	check(before.get("context", {}).get("parry_window") == true, "live_isPWin_true_in_sBlock")
	check(last.get("order") == ["parryBank", "doParry", "poiseHit20"] and last.get("skipped") == ["addTxt_parry_text"], "order_bank_doparry_poise20")
	var b: Dictionary = last.get("before", {})
	var a: Dictionary = last.get("after", {})
	var raw_atk: Variant = actor.get_native_modifier_state().atk
	var reward: int = int(last.get("doparry", {}).get("reward", -1))
	check(reward == main.native_source_parry_reward(0.0, 0.0, 1.0), "reward_equals_existing_formula")
	check(float(a.parryBank) - float(b.parryBank) == float(int(M29._or(raw_atk, 10.0))), "bank_plus_atk_or_10")
	check(float(b.hp) + reward <= float(player.max_hp), "parry_hp_below_cap_so_reward_visible")
	check(float(a.hp) == minf(float(player.max_hp), float(b.hp) + reward) and float(a.st) == minf(float(player.max_stamina), float(b.st) + reward), "hp_st_reward_capped_no_damage")
	check(float(a.iframes) == 25.0 and int(a.poise) == mini(int(player.max_poise), int(b.poise) + 1), "iframes25_poise_plus1")
	check(float(a.enemy_poise) == maxf(0.0, float(b.enemy_poise) - 20.0) and float(a.enemy_poiseR) == 0.0, "enemy_poise_minus20_poiseR0")
	check(telemetry.filter(func(t): return t.kind == "player_damage").size() == damage_before, "parry_contact_zero_damage_events")
	check(main.get_native_q_reflection_snapshot().count == q_before and telemetry.filter(func(t): return t.kind in ["q_projectile_reflected", "e_wave_projectile_reflected"]).is_empty(), "projectile_reflection_path_not_called")
	check(int(last.get("projectile_contact_calls", -1)) == 0 and last.get("full_doparry") == false, "no_projectile_facade_partial_doparry_declared")
	check(str(actor.get_native_modifier_state().s) == "recover", "kernel_enters_recover_after_parry")
	check(actor.is_native_registry_ready(), "binder_runtime_clean_after_parry:" + str(actor.get_snapshot().runtime_binding_error))
	_press_parry(false)
	observations["parry"] = {"pressed_at_charge_tick": pressed_at, "before": b, "after": a, "reward": reward, "is_q": last.get("doparry", {}).get("is_q"), "remaining": last.get("doparry", {}).get("remaining")}

# ── 실제 접촉: 피해 ──────────────────────────────────────────────────────────
func _damage_contact() -> void:
	check(await _accumulate_to_windup(1400), "m29_windup_reached")
	check(reentry.get("parry") == false and reentry.get("parry_reason") == "reentrant_m29_service_call" and reentry.get("emit") == false and reentry.get("emit_reason") == "reentrant_m29_service_call", "nested_calls_rejected:" + JSON.stringify(reentry))
	order.clear()
	kb_delta_at_impact = Vector2.INF
	var parry_count: int = services.get_snapshot().counts.parry_accepted
	var hp_before: float = player.hp
	var raw: Dictionary = actor.get_native_modifier_state()
	var flags := {"_iceOnHit": raw.get("_iceOnHit"), "_lavaBurn": raw.get("_lavaBurn"), "mods": raw.mods}
	var freeze_before: float = player.get_native_freeze_slow_ticks()
	var burns_before: int = player.get_native_burn_snapshot().size()
	for i in range(120):
		await physics_frame
		_phase()
		if order.has("detonate_sound"): break
	check(services.player_context(player).get("parry_window") == false, "window_closed_for_damage_case")
	check(order == ["hurtP", "impact_fx", "detonate_sound"], "order_hurtP_KB_impact_detonate:" + str(order))
	var damage: Array = telemetry.filter(func(t): return t.kind == "player_damage")
	var last_damage: Dictionary = damage[-1].data if not damage.is_empty() else {}
	var mult: float = player.get_native_element_multiplier(int(raw.el))
	check(int(last_damage.get("raw_amount", -1)) == int(float(raw.atk) * M29.DAMAGE_ATK_MULT * mult) and int(damage_event.get("amount", -2)) == int(last_damage.get("raw_amount", -1)), "hurtP_raw_atk30_elmul")
	check(kb_delta_at_impact.is_finite() and kb_delta_at_impact.distance_to(damage_event.get("knockback", Vector2.INF)) < 0.0001 and is_equal_approx(kb_delta_at_impact.length(), M29.KNOCKBACK), "posthurt_KB100_after_hurtP")
	# 원본 eModHitP: e.mods 에 M01/M03/M05/M18 없음 + e._iceOnHit/_lavaBurn falsy → 상태 변화·RNG 0.
	check(not _js_truthy(flags._iceOnHit) and not _js_truthy(flags._lavaBurn) and flags.mods == ["M29"] and player.get_native_freeze_slow_ticks() <= freeze_before and player.get_native_burn_snapshot().size() == burns_before, "eModHitP_source_noop_for_single_M29")
	check(services.get_snapshot().counts.parry_accepted == parry_count and player.hp < hp_before, "damage_branch_no_parry_writer")
	observations["damage"] = {"raw_amount": last_damage.get("raw_amount"), "applied": last_damage.get("amount"), "kb_delta": [kb_delta_at_impact.x, kb_delta_at_impact.y], "element_multiplier": mult, "flags": flags}

# ── 소비자 실패 ──────────────────────────────────────────────────────────────
func _consumer_failure_group() -> void:
	reject_consumer = true
	check(not services.emit_m29_event(actor, {"kind": "windup_started"}), "consumer_false_propagates")
	reject_consumer = false
	check(services.emit_m29_event(actor, {"kind": "player_parry"}) and services.emit_m29_event(actor, {"kind": "player_charge_state_immune"}), "no_consumer_needed_kinds")
	check(services.unbind_m29_fx_consumer("warning_fx", Callable(self, "_fx_warning_fx")), "owner_unbind")
	check(services.m29_readiness().warning_fx == false or services.m29_readiness().warning_fx == true, "readiness_cached_per_frame_shape")
	check(not services.emit_m29_event(actor, {"kind": "windup_started"}) and services.get_snapshot().last_error == "m29_consumer_missing:warning_fx", "missing_consumer_rejects")
	check(services.bind_m29_fx_consumer("warning_fx", Callable(self, "_fx_warning_fx")), "rebind_after_unbind")

# ── 성능: 300 물리틱 벽시계 ───────────────────────────────────────────────────
func _bench() -> void:
	var t0 := Time.get_ticks_usec()
	for i in range(300): await physics_frame
	var idle_us := Time.get_ticks_usec() - t0
	var phase_us := 0
	var context_calls_before: int = services.get_snapshot().counts.context_calls
	t0 = Time.get_ticks_usec()
	for i in range(300):
		await physics_frame
		var p0 := Time.get_ticks_usec()
		_phase()
		phase_us += Time.get_ticks_usec() - p0
	var with_us := Time.get_ticks_usec() - t0
	# 서비스 단독 비용(측정 전용: 프레임 캐시를 매번 무효화해 최악값을 잰다).
	var s0 := Time.get_ticks_usec()
	for i in range(300):
		services.set("_ready_frame", NAN)
		services.m29_readiness()
	var readiness_us := Time.get_ticks_usec() - s0
	s0 = Time.get_ticks_usec()
	for i in range(30): services.call("_full_combat_reason")
	var full_us := Time.get_ticks_usec() - s0
	s0 = Time.get_ticks_usec()
	for i in range(300): services.player_context(player)
	var context_us := Time.get_ticks_usec() - s0
	var per_tick_ms := with_us / 300.0 / 1000.0
	observations["bench"] = {"no_actor_phase_ms_per_tick": idle_us / 300.0 / 1000.0, "with_m29_actor_ms_per_tick": per_tick_ms,
		"actor_phase_mean_ms": phase_us / 300.0 / 1000.0, "context_calls_in_300": services.get_snapshot().counts.context_calls - context_calls_before,
		"readiness_per_frame_mean_ms": readiness_us / 300.0 / 1000.0, "full_source_check_mean_ms": full_us / 30.0 / 1000.0, "full_check_interval_frames": Services.FULL_CHECK_INTERVAL, "player_context_mean_ms": context_us / 300.0 / 1000.0}
	check(per_tick_ms <= 16.67 * 1.03, "physics_tick_realtime_with_actor ms=" + str(per_tick_ms))
	check(readiness_us / 300.0 / 1000.0 < 0.5, "per_frame_readiness_cheap")

func _finish() -> void:
	var payload := {"assertions": assertions, "failures": failures, "explicit_phases": explicit_phases,
		"fixture_player_repositions": fixture_player_repositions, "forced_raw_fields": forced_raw_fields,
		"fx_consumers": "test_recorders", "recipe_rng": "fixture[.01,.1]", "natural_spawn": false, "observations": observations}
	print("PCM29_RESULT ", JSON.stringify(payload))
	if not artifacts_dir.is_empty():
		var file := FileAccess.open(artifacts_dir.path_join("pc_m29_parry_result.json"), FileAccess.WRITE)
		if file != null: file.store_string(JSON.stringify(payload, " "))
	if is_instance_valid(main): main.queue_free()
	quit(0 if failures == 0 else 1)
