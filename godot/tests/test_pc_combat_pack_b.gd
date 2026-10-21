extends SceneTree
## PC-COMBAT-PACK-B — PCI-03/02/05/06/09 회귀 (실제 Main 부팅 + 원본 Node VM oracle 대조).
## 대상 API: Main.request_native_hurte / bind_native_enemy_hurte_owner / admit_native_source_projectile /
##           advance_native_player_projectile_pass / advance_native_source_projectile /
##           resolve_native_projectile_interaction / register_native_enemy_death_effect.
## 원본 대조: tests/pc_combat_pack_b_source_oracle.cjs 가 game.html 의 hurtE·pProjs 블록·_getPProj 풀을
##           손대지 않고 VM에서 실행(UTF-8 scenario/out 파일). Godot이 실제로 뽑은 RNG 값을 원본 gameplay
##           Math.random 위치에 같은 순서로 공급해 결과·RNG 위치 순서를 대조한다.
## 테스트 소유 개입(forced 집계): 발사 owner(Mac DEMO11-48) 대신 _fireXbow(G28703–28712) 필드로 패킷을 채움,
##   source sp=1.0 을 테스트가 공급(실제 source clock 미발행), 플레이어 배치/HP 회복, PCI-09용 etype 강제.
## Main 부팅 그룹은 격리 사용자 폴더(USERDIR) 필수 — 아니면 SKIP.
## 맵 전제(PC-FOLLOWUPS 2026-10-21): 이 파일 자체의 fixture(부팅 배치 적 ≥3, 200×200 타일 isW 스냅샷 `_wall_model`)는
##   기존 맵 전제다 → 이 스크립트로 직접 실행할 때만 Main 메타 `native_map11="off"`(= `--map11=off`)로 기존 맵 부팅을 **명시**한다.
##   상속 래퍼(Mac `test_pc_combat_pack_b_mac.gd`: MAP11 적 seed·MAP11 isW 모델 / `test_pcib_mac_calls.gd`)는 자기 fixture를
##   가지므로 Main 기본(MAP11 ON) 부팅을 그대로 쓴다. MAP11 필드보스 존재 중 석궁 경로는 tests/test_pc_followups_fieldboss.gd.
## Mac 생성 시 자동 bind(world._bind_pcib_actor): register_summoned_enemy 직후 type3는 이미 bound일 수 있다(제품 동작).
##   pci02는 bound actor를 그대로 다루고, unbound 검사는 새 actor를 만든 뒤 자동 bind를 명시 해제해 쓴다.

const USERDIR := "EXODUSER-pc-combat-b-Isolated-20261021"
const GAME_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FORMULA := preload("res://port_modules/combat_stat_formula/producer.gd")
const SPEC := preload("res://port_modules/auto_bow_spec/producer.gd")
const CATALOG := preload("res://port_modules/item_armor_element/source_item_catalog.gd")
const Binding := preload("res://scripts/type3_native_binding.gd")
const SpawnRecipe := preload("res://scripts/type3_spawn_recipe.gd")
const HURTE := preload("res://scripts/native_normal_enemy_hurte.gd")
const GROUPS := ["setup", "pci03_facade_normalbow", "pci03_lethal_kill", "pci03_refusals",
	"pci05_carrier_kill_pierce", "pci05_recycle_reuse_pierce", "pci05_wall_bounce", "pci06_interactions",
	"pci02_type3_bind", "pci09_death_prefix", "perf_bench"]
const TYPE_AFFIXES := ["meleeDmgPct", "rangedDmgPct", "projDmgPct", "spellDmgPct", "beamDmgPct", "dotDmgPct",
	"critRateMelee", "critRateSpell", "critRateBow"]
const XBOW_DMG := 28 # G17448
const LEGACY_FIXTURE_SCRIPT := "res://tests/test_pc_combat_pack_b.gd" # 이 파일 직접 실행일 때만 기존 맵 부팅(머리말)

class FixtureRandom extends RefCounted:
	var sequence: Array
	func _init(initial: Array) -> void: sequence = initial.duplicate()
	func next() -> float: return float(sequence.pop_front()) if not sequence.is_empty() else 0.5

var main: Node
var world: Node2D
var player: Node2D
var state: Node
var assertions := 0
var failures := 0
var skipped: Array = []
var current_group := ""
var rows: Array = []
var observations: Dictionary = {}
var forced := 0
var source_path := ""
var node_bin := ""
var artifacts_dir := ""
var token_serial := 0
var spec: Dictionary = {}
var oracle_cases: Array = []
var oracle_out: Dictionary = {}
var prefix_calls: Array = []
var reused_packets: Dictionary = {}
var death_order: Array = []

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path = arg.trim_prefix("--source-game=")
		elif arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
		elif arg.begins_with("--artifacts-dir="): artifacts_dir = arg.trim_prefix("--artifacts-dir=")
	seed(20261021)
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("PCB_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var a0 := assertions
		var f0 := failures
		await call("_test_" + group)
		var row := {"group": group, "assertions": assertions - a0, "failures": failures - f0}
		rows.append(row)
		print("PCB_GROUP ", JSON.stringify(row))
	_cleanup()
	var result := {"groups": rows, "assertions": assertions, "failures": failures, "skipped": skipped,
		"forced_test_fields": forced, "observations": observations, "fallback_paths_used": false,
		"firing_owner": "test_fills_fireXbow_fields(Mac DEMO11-48 not merged)", "source_sp": "test_supplied_1.0"}
	if not artifacts_dir.is_empty():
		DirAccess.make_dir_recursive_absolute(artifacts_dir)
		var f := FileAccess.open(artifacts_dir.path_join("pc_combat_pack_b_result.json"), FileAccess.WRITE)
		if f != null:
			f.store_string(JSON.stringify(result, "  "))
			f.close()
	print("PCB_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions, "failures": failures, "skipped": skipped, "forced_test_fields": forced}))
	quit(1 if failures > 0 or assertions == 0 else 0)

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PCB_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(main):
		if main.get_parent() != null:
			main.get_parent().remove_child(main)
		main.free()

func _tok(prefix: String) -> String:
	token_serial += 1
	return "%s:%d" % [prefix, token_serial]

# ── 공통 헬퍼 ───────────────────────────────────────────────────────────────────
func _enemies_alive() -> Array:
	var out: Array = []
	for e in world.get_enemies():
		if is_instance_valid(e) and e.get("alive") == true and e.has_method("read_native_normal_enemy_hurte_fields") \
				and not e.has_method("accept_native_hurte_owner_binding"):
			var f: Dictionary = e.read_native_normal_enemy_hurte_fields(world)
			if f.get("ready") == true and f.get("ib") != true and int(f.get("etype")) not in HURTE.SPECIAL_HIT_ETYPES \
					and int(f.get("etype")) not in [8, 15, 29] and int(f.get("el")) != 1:
				out.append(e)
	return out

func _heal() -> void:
	var p: Dictionary = state.read_current_p()
	if float(p.get("hp", 0)) < float(p.get("mhp", 0)):
		p["hp"] = p.get("mhp")
		player.set("hp", float(p.get("mhp")))
		forced += 1

func _borrow_arrow(origin: Vector2, target: Vector2, dmg: int, el: int = 0) -> RefCounted:
	var borrowed: Dictionary = world.borrow_native_player_projectile(main)
	if borrowed.get("ready") != true:
		return null
	var p: RefCounted = borrowed.packet
	reused_packets[p.get_instance_id()] = borrowed.get("reused") == true
	var f: Dictionary = p.fields
	var ang: float = atan2(target.y - origin.y, target.x - origin.x)
	var cdx := cos(ang)
	var cdy := sin(ang)
	# G28712 _fireXbow: _pp.x=ox+cdx*10 … normalBow=true;ghostXbow=true (pierce=XBOW_PIERCE?0.5:0 → 0)
	for kv in [["x", origin.x + cdx * 10.0], ["y", origin.y + cdy * 10.0], ["vx", cdx * float(spec.spd)], ["vy", cdy * float(spec.spd)],
			["dmg", dmg], ["el", el], ["maxDist", float(spec.range)], ["dist", 0], ["r", 3], ["stagger", 0], ["kb", 0],
			["pierce", 0], ["pierceMax", 0], ["normalBow", true], ["ghostXbow", true]]:
		f[kv[0]] = kv[1]
	forced += 1
	return p

func _drain_free_pool() -> void:
	# 다음 borrow가 새 패킷(_mkPProj)이 되도록 free 목록을 재활용 없이 비운다(원본 _getPProj 풀 상태 통제).
	while int(world.get_native_player_projectile_store_snapshot().get("free", 0)) > 0:
		var b: Dictionary = world.borrow_native_player_projectile(main)
		if b.get("ready") != true: break
		world.retire_native_player_projectile(main, b.packet, false)
		forced += 1

func _fire_fields(p: RefCounted) -> Dictionary:
	var out := {}
	for k in ["x", "y", "vx", "vy", "dmg", "el", "maxDist", "dist", "r", "stagger", "kb", "pierce", "pierceMax", "normalBow", "ghostXbow"]:
		out[k] = p.fields[k]
	return out

func _stat_crit_dmg() -> float:
	var stats: Dictionary = state.read_current_stats()
	var inv: Dictionary = state.read_current_inventory()
	var pv: Dictionary = state.read_current_p()
	var passives: Dictionary = state.read_current_passives()
	var lck: float = float(stats.get("lck", 0)) + float(FORMULA.js_to_int32(float(pv.get("lv", 1)) * 0.5))
	for slot in inv.equipped:
		var it: Variant = inv.equipped[slot]
		if it is Dictionary and (it.get("bLck") is int or it.get("bLck") is float):
			lck += float(it.bLck)
	return 1.5 + lck * 0.002 + float(passives.get("pCrit", 0)) * 0.08

func _player_view() -> Dictionary:
	var providers: Dictionary = main.get_native_normal_enemy_damage_provider_callbacks()
	return providers.player_view.call()

func _stat_str() -> float:
	return float(main.get_native_normal_enemy_damage_provider_callbacks().stat_str.call().value)

func _rng_count() -> int:
	return int(world.get_native_runtime_snapshot().random_draw_count)

func _enemy_view(e: Node) -> Dictionary:
	var f: Dictionary = e.read_native_normal_enemy_hurte_fields(world)
	return {"id": str(e.get_instance_id()), "x": e.global_position.x, "y": e.global_position.y, "r": float(f.radius),
		"hp": f.hp, "mhp": f.mhp, "eShield": f.eShield, "eShieldMax": f.eShieldMax, "etype": f.etype, "el": f.el,
		"elite": f.elite, "lv": f.lv, "mods": f.mods, "eRes": f.eRes, "stunned": f.stunned, "s": "idle", "st2": 0}

func _ints(values: Array) -> Array:
	var out: Array = []
	for v in values: out.append(int(v))
	return out

func _gameplay_lines(draws: Array) -> Array:
	var out: Array = []
	for d in draws:
		if not str(d.get("purpose", "")).begins_with("drop:"):
			out.append(int(d.line))
	return out

func _draw_values(draws: Array) -> Array:
	var out: Array = []
	for d in draws:
		if not str(d.get("purpose", "")).begins_with("drop:"):
			out.append(float(d.value))
	return out

func _run_oracle(cases: Array, name: String) -> Dictionary:
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin), "explicit_node_bin")
	check(not source_path.is_empty() and FileAccess.file_exists(source_path), "explicit_source_game")
	var dir: String = artifacts_dir if not artifacts_dir.is_empty() else OS.get_user_data_dir()
	DirAccess.make_dir_recursive_absolute(dir)
	var scen: String = dir.path_join("pcb_scenario_" + name + ".json")
	var outp: String = dir.path_join("pcb_oracle_" + name + ".json")
	var f := FileAccess.open(scen, FileAccess.WRITE)
	f.store_string(JSON.stringify({"cases": cases}))
	f.close()
	var output: Array = []
	var code: int = OS.execute(node_bin, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_combat_pack_b_source_oracle.cjs"),
		source_path, scen, outp]), output, true)
	check(code == 0, "oracle_vm_exit0:" + name)
	var decoded: Variant = JSON.parse_string(FileAccess.get_file_as_string(outp))
	check(decoded is Dictionary and decoded.get("source_sha256") == GAME_SHA256, "oracle_utf8_payload_sha:" + name)
	var by: Dictionary = {}
	if decoded is Dictionary:
		for row in decoded.cases:
			by[row.name] = row
			check(not row.has("exception"), "oracle_case_no_exception:" + str(row.name) + ":" + str(row.get("exception", "")))
			check((row.get("errors", []) as Array).is_empty(), "oracle_rng_feed_consistent:" + str(row.name))
	return by

func _hurte_case(name: String, e_view: Dictionary, packet_fields: Dictionary, receipt: Dictionary, p_view: Dictionary) -> Dictionary:
	return {"name": name, "kind": "hurte", "enemy": e_view, "packet": packet_fields,
		"P": {"x": p_view.get("x"), "y": p_view.get("y"), "hp": p_view.get("hp"), "mhp": p_view.get("mhp"), "lv": p_view.get("lv"), "s": "idle"},
		"passives": state.read_current_passives(), "equipped": state.read_current_inventory().equipped,
		"statCrit": float(receipt.applied_fields.get("stat_crit", 0.0)), "statCritDmg": _stat_crit_dmg(), "statStr": _stat_str(),
		"dmg": int(packet_fields.dmg), "apply_elmul": true, "ang": receipt.get("_ang", 0.0), "atkEl": int(packet_fields.el),
		"rng": _draw_values(receipt.get("rng_draws", []))}

func _compare_hurte(name: String, row: Dictionary, receipt: Dictionary, e: Node, g_kills_after: int) -> void:
	var after: Dictionary = row.get("enemy_after", {})
	var f: Dictionary = e.read_native_normal_enemy_hurte_fields(world) if e.get("alive") == true else {}
	check(float(after.get("hp", -1e9)) == float(e.get("hp")), "oracle_hp_after:" + name + " src=%s port=%s" % [after.get("hp"), e.get("hp")])
	check(float(after.get("eShield", -1)) == float(e.get("eShield")), "oracle_shield_after:" + name)
	check(bool(after.get("alive")) == (e.get("alive") == true), "oracle_alive_after:" + name)
	check(float((after.get("kb", {}) as Dictionary).get("x", 1)) == 0.0 and float((after.get("kb", {}) as Dictionary).get("y", 1)) == 0.0, "oracle_no_kb_arrow_42466:" + name)
	var src_lines: Array = _ints(row.get("gameplay_random_lines", []))
	check(src_lines == _gameplay_lines(receipt.get("rng_draws", [])), "oracle_gameplay_rng_line_order:" + name + " src=%s port=%s" % [src_lines, _gameplay_lines(receipt.get("rng_draws", []))])
	var src_type: Array = []
	for a in row.get("affix_reads", []):
		if a in TYPE_AFFIXES: src_type.append(a)
	check(src_type == receipt.get("type_affix_reads", []), "oracle_type_affix_reads:" + name + " src=%s port=%s" % [src_type, receipt.get("type_affix_reads")])
	if not (after.get("alive") as bool):
		check(int((row.get("G_after", {}) as Dictionary).get("kills", -1)) == 1, "oracle_kill_counted:" + name)

# ── groups ──────────────────────────────────────────────────────────────────────
func _test_setup() -> void:
	var packed: Variant = load("res://scenes/main.tscn")
	check(packed is PackedScene, "main_scene_loads")
	main = packed.instantiate()
	var own_legacy_fixture: bool = (get_script() as Script).resource_path == LEGACY_FIXTURE_SCRIPT
	if own_legacy_fixture:
		main.set_meta("native_map11", "off") # 기존 맵 부팅 명시(위 머리말). CLI --map11=on이면 아래 전제 검사가 실패로 드러낸다.
	root.add_child(main)
	for i in range(8):
		await physics_frame
	world = main.get("world")
	player = main.get("player")
	state = main.get("source_state")
	check(is_instance_valid(world) and world.get("ready_for_player") == true, "actual_world_ready")
	if own_legacy_fixture:
		check(main.read_native_map11_provider() == null, "legacy_map_booted_explicitly(map11 off)")
	var service: Variant = main.get("native_combat_pack_b")
	check(service != null and service.get_snapshot().configured == true, "pack_b_service_installed")
	for method in ["request_native_hurte", "bind_native_enemy_hurte_owner", "admit_native_source_projectile",
			"advance_native_source_projectile", "advance_native_player_projectile_pass",
			"resolve_native_projectile_interaction", "register_native_enemy_death_effect"]:
		check(main.has_method(method), "main_api:" + method)
	var inv: Dictionary = state.read_current_inventory()
	var bow: Variant = inv.equipped.get("bow")
	check(bow is Dictionary, "current_bow_equipped")
	var catalog = CATALOG.new()
	spec = SPEC.new().evaluate(bow if bow is Dictionary else {}, state.read_current_passives(), catalog)
	check(spec.get("status") == "READY", "auto_bow_spec_ready_from_current_INV")
	observations["auto_bow_spec"] = {"range": spec.get("range"), "spd": spec.get("spd")}
	observations["enemies_eligible"] = _enemies_alive().size()
	check(_enemies_alive().size() >= 3, "at_least_3_eligible_hurte_owner_enemies")

func _test_pci03_facade_normalbow() -> void:
	var e: Node = _enemies_alive()[0]
	player.global_position = e.global_position + Vector2(-140, 0)
	forced += 1
	_heal()
	var pkt: RefCounted = _borrow_arrow(player.global_position, e.global_position, 120)
	check(pkt != null, "store_borrow_packet")
	var ev := _enemy_view(e)
	var pv := _player_view()
	var ang: float = atan2(e.global_position.y - pkt.fields.y, e.global_position.x - pkt.fields.x)
	# 기존 executor 직접 호출 기준선: 이전 main은 normalBow를 42110에서 거절했다(DEMO11-48 진단). 이제 수용.
	var rng0 := _rng_count()
	var receipt: Dictionary = main.request_native_hurte(e, int(pkt.fields.dmg), ang, false, pkt.fields, int(pkt.fields.el), {"token": _tok("hurte")})
	receipt["_ang"] = ang
	check(receipt.status == "APPLIED", "normalbow_packet_hurte_applied:" + str(receipt.status) + ":" + str(receipt.reason))
	check(receipt.profile == "normalBow_packet", "profile_normalbow_packet")
	check(receipt.opts_identity_preserved == true, "packet_fields_identity_passed_as_opts")
	check(not (receipt.type_affix_reads as Array).has("meleeDmgPct") and not (receipt.type_affix_reads as Array).has("critRateMelee"), "arrow_not_melee_classified")
	check(receipt.rng_span == _rng_count() - rng0, "rng_span_equals_world_draws")
	var no_kb := true
	for j in receipt.journal:
		if j.op == "knockback": no_kb = false
	check(no_kb, "arrow_skips_knockback_42466")
	check(pkt.fields.normalBow == true and pkt.fields.ghostXbow == true and pkt.fields.maxDist == float(spec.range), "packet_opts_not_mutated_or_dropped")
	var replay: Dictionary = main.request_native_hurte(e, int(pkt.fields.dmg), ang, false, pkt.fields, int(pkt.fields.el), {"token": receipt.token})
	check(replay.replayed == true and _rng_count() - rng0 == receipt.rng_span, "duplicate_token_replays_without_execution")
	var by: Dictionary = _run_oracle([_hurte_case("facade_nonlethal", ev, _fire_fields(pkt), receipt, pv)], "facade")
	if by.has("facade_nonlethal"):
		_compare_hurte("facade_nonlethal", by.facade_nonlethal, receipt, e, 0)
	world.retire_native_player_projectile(main, pkt, false)
	observations["facade_nonlethal"] = {"hp_after": receipt.applied_fields.hp_after, "shield_after": receipt.applied_fields.shield_after, "rng": receipt.rng_span}

func _test_pci03_lethal_kill() -> void:
	var e: Node = _enemies_alive()[0]
	player.global_position = e.global_position + Vector2(-140, 0)
	forced += 1
	_heal()
	var pkt: RefCounted = _borrow_arrow(player.global_position, e.global_position, 4000)
	var ev := _enemy_view(e)
	var pv := _player_view()
	var kills0: int = int(state.read_current_g().get("kills", 0))
	var ang: float = atan2(e.global_position.y - pkt.fields.y, e.global_position.x - pkt.fields.x)
	var receipt: Dictionary = main.request_native_hurte(e, int(pkt.fields.dmg), ang, false, pkt.fields, int(pkt.fields.el), {"token": _tok("hurte")})
	receipt["_ang"] = ang
	check(receipt.status == "APPLIED" and receipt.alive_before == true and receipt.alive_after == false, "lethal_arrow_kills:" + str(receipt.reason))
	check(receipt.kill_receipt.killed == true and int(state.read_current_g().get("kills", 0)) == kills0 + 1, "kill_pipeline_kills_plus1")
	var by: Dictionary = _run_oracle([_hurte_case("facade_lethal", ev, _fire_fields(pkt), receipt, pv)], "lethal")
	if by.has("facade_lethal"):
		_compare_hurte("facade_lethal", by.facade_lethal, receipt, e, kills0 + 1)
	world.retire_native_player_projectile(main, pkt, false)

func _test_pci03_refusals() -> void:
	var e: Node = _enemies_alive()[0]
	var hp0: float = float(e.get("hp"))
	var sh0: float = float(e.get("eShield"))
	var rng0 := _rng_count()
	var g0: Dictionary = (state.read_current_g() as Dictionary).duplicate(true)
	var pkt: RefCounted = _borrow_arrow(player.global_position, e.global_position, 120)
	pkt.fields["explode"] = true
	var r1: Dictionary = main.request_native_hurte(e, 120, 0.0, false, pkt.fields, 0, {"token": _tok("hurte")})
	check(r1.status == "REJECTED" and str(r1.reason).find("explode") >= 0, "active_unported_packet_opt_rejected:" + str(r1.reason))
	pkt.fields.erase("explode")
	var r2: Dictionary = main.request_native_hurte(e, 120, 0.0, true, {"beam": true}, 2, {"token": _tok("hurte")})
	check(r2.status == "NOT_READY" and str(r2.reason).begins_with("beam_profile_not_ready"), "beam_not_ready_prewrite")
	var r3: Dictionary = main.request_native_hurte(e, 120, 0.0, false, {"foo": 1}, 0, {"token": _tok("hurte")})
	check(r3.status == "REJECTED" and r3.reason == "hurte_opts_unsupported:foo", "legacy_strict_opts_gate_unchanged")
	var r4: Dictionary = main.request_native_hurte(e, 120, 0.0, false, pkt.fields, 0, {})
	check(r4.status == "REJECTED" and r4.reason == "request_token_missing", "token_required")
	var r5: Dictionary = main.request_native_hurte(e, 120.5, 0.0, false, pkt.fields, 0, {"token": _tok("hurte")})
	check(r5.status == "REJECTED", "non_integral_damage_rejected")
	var fire_pkt: RefCounted = pkt
	var r6: Dictionary = main.request_native_hurte(e, 120, 0.0, false, fire_pkt.fields, 1, {"token": _tok("hurte")})
	check(r6.status == "REJECTED" and str(r6.reason).find("burn_death") >= 0, "fire_arrow_burn_death_prewrite_rejected:" + str(r6.reason))
	check(float(e.get("hp")) == hp0 and float(e.get("eShield")) == sh0 and _rng_count() == rng0, "refusals_no_enemy_or_rng_mutation")
	check(JSON.stringify(state.read_current_g().get("kills")) == JSON.stringify(g0.get("kills")) and JSON.stringify(state.read_current_g().get("_dmgPeak")) == JSON.stringify(g0.get("_dmgPeak")), "refusals_no_G_mutation")
	world.retire_native_player_projectile(main, pkt, false)

func _wall_model(center: Vector2, radius: float) -> Dictionary:
	var ts: float = float(world.get("_tile_size"))
	var tiles: Array = world.map_data["tiles"]
	var cells: Array = []
	var x0: int = floori((center.x - radius) / ts)
	var y0: int = floori((center.y - radius) / ts)
	for cy in range(y0, floori((center.y + radius) / ts) + 1):
		for cx in range(x0, floori((center.x + radius) / ts) + 1):
			if cx >= 0 and cy >= 0 and cx < 200 and cy < 200 and int(tiles[cy * 200 + cx]) == 1:
				cells.append([cx, cy])
	var props: Array = []
	for prop in world.map_data["prop_colliders"]:
		props.append([float(prop.position[0]), float(prop.position[1]), float(prop.radii[0]), float(prop.radii[1])])
	return {"tile_size": ts, "cells": cells, "props": props, "bounds": 8000}

func _wall_model_matches(model: Dictionary, points: Array) -> bool:
	var blocked := {}
	for c in model.cells: blocked["%d,%d" % [c[0], c[1]]] = true
	for pt in points:
		var x: float = pt.x
		var y: float = pt.y
		var v := false
		if x < 0 or y < 0 or x >= 8000 or y >= 8000: v = true
		elif blocked.has("%d,%d" % [floori(x / model.tile_size), floori(y / model.tile_size)]): v = true
		else:
			for p in model.props:
				var qx: float = (x - p[0]) / p[2]
				var qy: float = (y - p[1]) / p[3]
				if qx * qx + qy * qy < 1.0: v = true
		if v != world.is_world_blocked(pt): return false
	return true

func _ens_view() -> Array:
	var out: Array = []
	for e in world.get_enemies():
		if is_instance_valid(e) and e.get("alive") == true and e.has_method("read_native_normal_enemy_hurte_fields"):
			var f: Dictionary = e.read_native_normal_enemy_hurte_fields(world)
			if f.get("ready") == true:
				out.append({"id": str(e.get_instance_id()), "x": e.global_position.x, "y": e.global_position.y, "r": float(f.radius), "el": int(f.el), "alive": true})
	return out

## 같은 프레임 안에서 pass를 반복(적 AI 정지 → 정적 장면, source sp=1.0 테스트 공급).
func _fly(pkt: RefCounted, max_ticks: int) -> Dictionary:
	var track: Array = []
	var contacts: Array = []
	var fate := "live"
	var fate_tick := -1
	var reflects := 0
	var pid: int = pkt.get_instance_id()
	for t in range(max_ticks):
		var pr: Dictionary = main.advance_native_player_projectile_pass(1.0, {"token": _tok("pass")})
		check(pr.status in ["APPLIED"], "pass_applied_t%d:%s:%s" % [t, pr.status, pr.reason])
		var mine: Dictionary = {}
		for res in pr.get("results", []):
			if res.packet_id == pid: mine = res
		for c in mine.get("collision_receipt", []):
			contacts.append({"t": t, "enemy_id": str(c.enemy_id), "dmg": FORMULA.js_to_int32(float(c.dmg_base) * float(c.mult)),
				"ang": c.ang, "outcome": c.get("outcome"), "status": c.hurte.status, "killed": c.hurte.alive_after == false,
				"rng": c.get("rng_draws", [])})
		reflects += (mine.get("reflect_receipt", []) as Array).size()
		track.append({"t": t, "x": pkt.fields.x, "y": pkt.fields.y, "vx": pkt.fields.vx, "vy": pkt.fields.vy, "dist": pkt.fields.dist, "bounces": int(pkt.fields.get("bounces", 0))})
		if mine.get("released_once") == true or mine.get("expired") == true:
			fate = "recycled" if mine.step_status == "HIT_RELEASED" else "dropped"
			fate_tick = t
			break
	return {"track": track, "contacts": contacts, "fate": fate, "fate_tick": fate_tick, "reflects": reflects}

func _carrier_case(name: String, fired: Dictionary, ens: Array, flight: Dictionary, reuse: bool, wall: Dictionary) -> Dictionary:
	var results: Array = []
	var rng: Array = []
	for c in flight.contacts:
		results.append({"killed": c.killed})
		for d in c.rng: rng.append(float(d.value))
	return {"name": name, "kind": "carrier", "sp": 1, "ticks": flight.track.size(), "ens": ens, "packet": fired,
		"hurt_results": results, "rng": rng, "reuse_pool": reuse, "wall_model": wall,
		"passives": state.read_current_passives()}

func _compare_carrier(name: String, row: Dictionary, flight: Dictionary) -> void:
	var src_ticks: Array = row.get("ticks", [])
	check(src_ticks.size() == flight.track.size(), "carrier_tick_count:" + name + " src=%d port=%d" % [src_ticks.size(), flight.track.size()])
	var max_err := 0.0
	for i in range(mini(src_ticks.size(), flight.track.size())):
		var s: Dictionary = src_ticks[i].p
		var g: Dictionary = flight.track[i]
		for k in ["x", "y", "vx", "vy", "dist"]:
			max_err = maxf(max_err, absf(float(s[k]) - float(g[k])))
		check(int(s.bounces) == int(g.bounces), "carrier_bounces_t%d:%s" % [i, name])
	check(max_err < 1e-6, "carrier_trajectory_equal:" + name + " max_err=" + str(max_err))
	check(str(row.get("fate")) == str(flight.fate) and int(row.get("fate_tick", -1)) == int(flight.fate_tick), "carrier_fate:" + name + " src=%s@%s port=%s@%s" % [row.get("fate"), row.get("fate_tick"), flight.fate, flight.fate_tick])
	var src_hits: Array = []
	var ti := -1
	for call in row.get("calls", []):
		if call.call == "TICK": ti = int(call.args[0])
		elif call.call == "hurtE": src_hits.append({"t": ti, "enemy_id": str(call.args[0]), "dmg": int(call.args[1]), "identity": call.args[4]})
	check(src_hits.size() == flight.contacts.size(), "carrier_contact_count:" + name + " src=%d port=%d" % [src_hits.size(), flight.contacts.size()])
	for i in range(mini(src_hits.size(), flight.contacts.size())):
		var s: Dictionary = src_hits[i]
		var g: Dictionary = flight.contacts[i]
		check(s.t == g.t and s.enemy_id == g.enemy_id and s.dmg == g.dmg and s.identity == "PACKET_IDENTITY", "carrier_contact_%d:%s src=%s port=%s" % [i, name, s, {"t": g.t, "id": g.enemy_id, "dmg": g.dmg}])
	var port_lines: Array = []
	for c in flight.contacts:
		for d in c.rng: port_lines.append(int(d.line))
	check(_ints(row.get("gameplay_random_lines", [])) == port_lines, "carrier_rng_lines:" + name)

func _open_line(from: Vector2, dir: Vector2, length: float) -> bool:
	for i in range(0, int(length), 6):
		if world.is_world_blocked(from + dir * float(i)): return false
	return true

func _test_pci05_carrier_kill_pierce() -> void:
	# 일직선에 적 2마리: 첫 화살이 1번을 처치 → 석궁 킬관통(35617) → 2번 적중(비치명) → 재활용.
	var pool: Array = _enemies_alive()
	check(pool.size() >= 2, "two_enemies_available")
	if pool.size() < 2: return
	var a: Node = pool[0]
	var b: Node = pool[1]
	var dir := Vector2.RIGHT
	var origin: Vector2 = a.global_position - dir * 120.0
	if not _open_line(origin, dir, 300.0):
		dir = Vector2.DOWN
		origin = a.global_position - dir * 120.0
	b.global_position = a.global_position + dir * 120.0
	forced += 1
	await physics_frame # 공간 격자(프레임당 1회 재구성)가 강제 배치를 반영하게 한 프레임 진행
	dir = (b.global_position - a.global_position).normalized()
	origin = a.global_position - dir * 120.0
	check(_open_line(origin, dir, 280.0), "open_flight_line")
	player.global_position = origin - dir * 10.0
	forced += 1
	_heal()
	var a_hp: float = float(a.get("hp")) + float(a.get("eShield"))
	var dmg: int = int(a_hp) + 10
	_drain_free_pool()
	var pkt: RefCounted = _borrow_arrow(player.global_position, a.global_position, dmg)
	var reused_kill: bool = reused_packets[pkt.get_instance_id()]
	var fired := _fire_fields(pkt)
	var ens := _ens_view()
	var wall := _wall_model(origin, 1000.0)
	var kills0: int = int(state.read_current_g().get("kills", 0))
	var adm: Dictionary = main.admit_native_source_projectile(player, pkt, {"token": _tok("admit")})
	check(adm.status == "APPLIED" and adm.packet_id == pkt.get_instance_id(), "admit_normalbow_into_world_store:" + str(adm.reason))
	var replay: Dictionary = main.admit_native_source_projectile(player, pkt, {"token": adm.token})
	check(replay.replayed == true, "admit_duplicate_token_replay")
	var flight: Dictionary = _fly(pkt, 200)
	observations["kill_pierce_flight"] = {"contacts": flight.contacts.size(), "fate": flight.fate, "ticks": flight.track.size()}
	check(a.get("alive") == false and int(state.read_current_g().get("kills", 0)) >= kills0 + 1, "auto_crossbow_packet_killed_enemy")
	check(flight.contacts.size() >= 2 and flight.contacts[0].outcome == "kill_pierce_35617", "kill_pierce_then_next_contact")
	var pts: Array = []
	for tr in flight.track: pts.append(Vector2(tr.x, tr.y))
	check(_wall_model_matches(wall, pts), "oracle_wall_model_equals_world_isW_on_path")
	var by: Dictionary = _run_oracle([_carrier_case("kill_pierce", fired, ens, flight, reused_kill, wall)], "carrier_kill")
	if by.has("kill_pierce"): _compare_carrier("kill_pierce", by.kill_pierce, flight)

func _test_pci05_recycle_reuse_pierce() -> void:
	# 재활용된 패킷은 _resetPProj가 _pierceRate=50+pierceFlat 을 세팅 → 통일 관통(35562) 4회 보장.
	var pool: Array = _enemies_alive()
	if pool.is_empty(): return
	var a: Node = pool[0]
	await physics_frame
	var origin: Vector2 = a.global_position - Vector2(120, 0)
	if not _open_line(origin, Vector2.RIGHT, 200.0): origin = a.global_position - Vector2(0, 120)
	var dir: Vector2 = (a.global_position - origin).normalized()
	player.global_position = origin - dir * 10.0
	forced += 1
	_drain_free_pool()
	var first: RefCounted = _borrow_arrow(player.global_position, a.global_position, 30)
	check(reused_packets[first.get_instance_id()] == false, "first_packet_fresh_mkPProj")
	var fired1 := _fire_fields(first)
	var ens1 := _ens_view()
	var wall := _wall_model(origin, 1000.0)
	main.admit_native_source_projectile(player, first, {"token": _tok("admit")})
	var f1: Dictionary = _fly(first, 200)
	check(f1.fate == "recycled" and first.phase == "free", "nonlethal_hit_recycles_packet_35628")
	var by1: Dictionary = _run_oracle([_carrier_case("first_hit", fired1, ens1, f1, false, wall)], "carrier_first")
	if by1.has("first_hit"): _compare_carrier("first_hit", by1.first_hit, f1)
	await physics_frame
	origin = a.global_position - dir * 120.0
	player.global_position = origin - dir * 10.0
	var second: RefCounted = _borrow_arrow(player.global_position, a.global_position, 30)
	check(second == first, "store_reuses_recycled_packet")
	check(float(second.fields.get("_pierceRate", 0)) > 0.0, "reused_packet_has_source_pierce_rate")
	var fired2 := _fire_fields(second)
	var ens2 := _ens_view()
	main.admit_native_source_projectile(player, second, {"token": _tok("admit")})
	var f2: Dictionary = _fly(second, 200)
	check(f2.contacts.size() >= 1 and str(f2.contacts[0].outcome).begins_with("pierce_"), "reused_packet_unified_pierce:" + str(f2.contacts[0].outcome if f2.contacts.size() > 0 else "none"))
	var by2: Dictionary = _run_oracle([_carrier_case("reuse_pierce", fired2, ens2, f2, true, wall)], "carrier_reuse")
	if by2.has("reuse_pierce"): _compare_carrier("reuse_pierce", by2.reuse_pierce, f2)
	observations["reuse_pierce"] = {"pierce_rate": second.fields.get("_pierceRate"), "contacts": f2.contacts.size(), "fate": f2.fate}

func _find_wall_shot() -> Dictionary:
	var start: Vector2 = player.global_position
	for ring in range(0, 30):
		for k in range(16):
			var o: Vector2 = world.get_start_position() + Vector2.from_angle(TAU * k / 16.0) * (200.0 + ring * 120.0)
			if world.is_world_blocked(o): continue
			for d in range(8):
				var dir := Vector2.from_angle(TAU * d / 8.0)
				for dist in range(60, 300, 6):
					var p: Vector2 = o + dir * float(dist)
					if world.is_world_blocked(p):
						var clear := true
						for e in world.get_enemies():
							if is_instance_valid(e) and e.get("alive") == true and Geometry2D.get_closest_point_to_segment(e.global_position, o, p).distance_to(e.global_position) < 120.0:
								clear = false
						if clear: return {"origin": o, "dir": dir}
						break
	return {}

func _test_pci05_wall_bounce() -> void:
	var shot: Dictionary = _find_wall_shot()
	check(not shot.is_empty(), "wall_shot_found")
	if shot.is_empty(): return
	player.global_position = shot.origin
	forced += 1
	var pkt: RefCounted = _borrow_arrow(shot.origin, shot.origin + shot.dir * 100.0, 30)
	var fired := _fire_fields(pkt)
	var ens := _ens_view()
	var wall := _wall_model(shot.origin, 1000.0)
	main.admit_native_source_projectile(player, pkt, {"token": _tok("admit")})
	var flight: Dictionary = _fly(pkt, 200)
	check(flight.reflects >= 1, "wall_reflect_same_packet:" + str(flight.reflects))
	var pts: Array = []
	for tr in flight.track:
		pts.append(Vector2(tr.x, tr.y))
		pts.append(Vector2(tr.x + tr.vx, tr.y))
		pts.append(Vector2(tr.x, tr.y + tr.vy))
	check(_wall_model_matches(wall, pts), "oracle_wall_model_equals_world_isW_near_bounce")
	var by: Dictionary = _run_oracle([_carrier_case("wall_bounce", fired, ens, flight, reused_packets[pkt.get_instance_id()], wall)], "carrier_wall")
	if by.has("wall_bounce"): _compare_carrier("wall_bounce", by.wall_bounce, flight)
	observations["wall_bounce"] = {"reflects": flight.reflects, "fate": flight.fate, "ticks": flight.track.size()}

func _test_pci06_interactions() -> void:
	var pkt: RefCounted = _borrow_arrow(player.global_position, player.global_position + Vector2(100, 0), 30)
	var r1: Dictionary = main.resolve_native_projectile_interaction(pkt, null, {"kind": "wall_reflect"}, {"token": _tok("ia")})
	check(r1.status == "REJECTED" and str(r1.reason).begins_with("player_packet_interactions_resolved_inside_source_pass"), "player_packet_interactions_only_in_pass")
	var bad: Dictionary = main.admit_native_source_projectile(player, {"friendly": false, "dmg": 10}, {"token": _tok("admit")})
	check(bad.status == "NOT_READY" and str(bad.reason).find("demo11_35") >= 0, "hostile_birth_routed_to_existing_registry")
	pkt.fields["fireball"] = true
	var r2: Dictionary = main.admit_native_source_projectile(player, pkt, {"token": _tok("admit")})
	check(r2.status == "REJECTED" and str(r2.reason).find("fireball") >= 0, "non_normalbow_kind_not_folded_into_arrow_carrier")
	pkt.fields["fireball"] = false
	var r3: Dictionary = main.admit_native_source_projectile(world, pkt, {"token": _tok("admit")})
	check(r3.status == "REJECTED", "foreign_source_owner_rejected")
	world.retire_native_player_projectile(main, pkt, false)
	var fake := Node2D.new()
	fake.set_meta("raw", null)
	world.add_child(fake)
	var r4: Dictionary = main.resolve_native_projectile_interaction(fake, player, {"kind": "e_release"}, {"token": _tok("ia")})
	check(r4.status == "NOT_READY" and str(r4.reason).find("38470") >= 0, "physical_e_release_not_ready_not_gbbean")
	var r5: Dictionary = main.resolve_native_projectile_interaction(fake, player, {"kind": "q_release", "distance": 10.0}, {"token": _tok("ia")})
	check(r5.status == "REJECTED" and r5.get("delegate") == "Main.reflect_native_q_source_projectile", "q_release_delegates_existing_owner_unadopted_kind_rejected:" + str(r5.reason))
	fake.queue_free()

func _type3_recipe(at: Vector2) -> Dictionary:
	var rng := FixtureRandom.new([0.5])
	var builder := SpawnRecipe.new()
	if not builder.configure(rng.next, func(x, y, r): return world.can_move(Vector2(x, y), r), Callable(world, "native_safe_point")):
		return {}
	var outcome: Dictionary = builder.build_child(at.x, at.y, {"stage": 0, "room": 0, "player_level": 1, "difficulty": 5, "stage_difficulty_offset": 0}, 0)
	return outcome.recipe if outcome.get("valid") == true and outcome.recipe.get("mods") == [] else {}

func _record_packet(_a: Node2D, _p: Dictionary) -> bool:
	return true

func _test_pci02_type3_bind() -> void:
	var site: Vector2 = player.global_position + Vector2(160, 0)
	var recipe := _type3_recipe(site)
	check(not recipe.is_empty(), "type3_nonelite_recipe")
	if recipe.is_empty(): return
	var actor := Binding.new()
	var interfaces := {"render_body": false, "native_random": Callable(world, "sample_native_random_unit"), "emit_charged_projectile": _record_packet}
	check(actor.configure(recipe, player, world, interfaces), "type3_binding_configured")
	var reg: Dictionary = world.register_summoned_enemy(actor)
	check(reg.get("valid") == true, "type3_registered_in_world:" + str(reg.get("errors")))
	var service: RefCounted = main.get("native_combat_pack_b")
	# 생성 시 자동 bind(Mac 제품)가 있으면 그 binding을 그대로 인정 — live identity·같은 owner 서비스여야 한다.
	var auto_token: Variant = actor.get("native_hurte_owner_token")
	var auto_bound: bool = auto_token is String and service.is_native_hurte_binding_live(actor, auto_token)
	observations["type3_creation_auto_bind"] = auto_bound
	# ── unbound 검사: 새 actor를 만들고, 자동 bind가 있으면 명시 해제해 unbound 상태를 만든다 ──
	var free_recipe := _type3_recipe(site + Vector2(0, 120))
	check(not free_recipe.is_empty(), "type3_unbound_recipe")
	if free_recipe.is_empty(): return
	var loose := Binding.new()
	check(loose.configure(free_recipe, player, world, interfaces), "type3_unbound_actor_configured")
	check(world.register_summoned_enemy(loose).get("valid") == true, "type3_unbound_actor_registered")
	var loose_token: Variant = loose.get("native_hurte_owner_token")
	if loose_token is String and service.is_native_hurte_binding_live(loose, loose_token):
		check(service.release_native_enemy_hurte_owner(loose, loose_token), "explicit_release_of_creation_auto_bind")
		forced += 1
	check(not (loose.get("native_hurte_owner_token") is String and service.is_native_hurte_binding_live(loose, str(loose.get("native_hurte_owner_token")))), "loose_actor_explicitly_unbound")
	var hp0: float = float(loose.hp)
	var rng0 := _rng_count()
	var pkt: RefCounted = _borrow_arrow(loose.global_position - Vector2(80, 0), loose.global_position, 40)
	var unbound: Dictionary = main.request_native_hurte(loose, 40, 0.0, false, pkt.fields, 0, {"token": _tok("hurte")})
	check(unbound.status == "REJECTED" and str(unbound.reason).find("PCI-02") >= 0 and float(loose.hp) == hp0 and _rng_count() == rng0, "unbound_new_actor_refused_no_mutation")
	var direct: Dictionary = HURTE.new().execute(main, world, loose, 40, 0.0, 0, {"kbMult": 1.0, "poiseMult": 1.5, "noPoise": false, "poiseHit": false, "poiseSkill": false, "_lessonAttack": "weapon"})
	check(direct.get("ok") == false and int(direct.get("halted_at", -1)) == 0 and float(loose.hp) == hp0, "direct_executor_unbound_fail_closed")
	var rebound: Dictionary = main.bind_native_enemy_hurte_owner(loose, {"token": _tok("bind")})
	check(rebound.status == "APPLIED" and str(rebound.owner_token).begins_with("pc-hurte-owner:"), "unbound_actor_bind_applied:" + str(rebound.reason))
	check(rebound.get("readback") is Dictionary and rebound.readback.etype == 3 and float(rebound.readback.hp) == hp0, "bind_readback_actual_fields")
	check(rebound.get("write_methods") is Array and (rebound.write_methods as Array).has("apply_native_normal_enemy_hp_write"), "write_methods_reported")
	# ── bound actor(자동 bind 또는 여기서 bind) ──
	var bound: Dictionary = {}
	if auto_bound:
		bound = {"status": "APPLIED", "owner_token": auto_token}
		check(str(auto_token).begins_with("pc-hurte-owner:"), "creation_auto_bind_token_from_pc_service")
	else:
		bound = main.bind_native_enemy_hurte_owner(actor, {"token": _tok("bind")})
		check(bound.status == "APPLIED" and str(bound.get("owner_token", "")).begins_with("pc-hurte-owner:"), "type3_bound:" + str(bound.reason))
	check(actor.read_native_normal_enemy_hurte_fields(world).get("ready") == true and int(actor.read_native_normal_enemy_hurte_fields(world).etype) == 3, "bound_actor_readback_ready")
	var again: Dictionary = main.bind_native_enemy_hurte_owner(actor, {"token": _tok("bind")})
	check(again.status == "REJECTED" and again.reason == "actor_already_bound", "double_bind_rejected")
	var again_loose: Dictionary = main.bind_native_enemy_hurte_owner(loose, {"token": _tok("bind")})
	check(again_loose.status == "REJECTED" and again_loose.reason == "actor_already_bound", "double_bind_rejected_after_rebind")
	var existing: Dictionary = main.bind_native_enemy_hurte_owner(_enemies_alive()[0], {"token": _tok("bind")})
	check(existing.status == "NOT_REQUIRED", "existing_owner_needs_no_bind")
	# 실제 normalBow 탄으로 type3 처치까지(실제 carrier 경로).
	var dmg: int = int(actor.hp) + 5
	world.retire_native_player_projectile(main, pkt, false)
	await physics_frame
	var origin: Vector2 = actor.global_position - Vector2(100, 0)
	player.global_position = origin - Vector2(10, 0)
	forced += 1
	var arrow: RefCounted = _borrow_arrow(player.global_position, actor.global_position, dmg)
	main.admit_native_source_projectile(player, arrow, {"token": _tok("admit")})
	var flight: Dictionary = _fly(arrow, 120)
	var hit_type3 := false
	for c in flight.contacts:
		if c.enemy_id == str(actor.get_instance_id()) and c.killed: hit_type3 = true
	check(hit_type3 and actor.alive == false and actor.state == "dead", "type3_killed_by_normalbow_via_shared_hurte")
	observations["type3"] = {"hp0": hp0, "contacts": flight.contacts.size(), "fate": flight.fate}
	# stale: world identity 교체(레슨 분리) 뒤에는 live binding 아님.
	check(service.is_native_hurte_binding_live(actor, str(actor.native_hurte_owner_token)), "binding_live_before_identity_change")
	check(service.release_native_enemy_hurte_owner(actor, str(bound.owner_token)), "release_binding")
	check(not service.is_native_hurte_binding_live(actor, str(bound.owner_token)), "released_binding_not_live")

func _prefix_consumer(ctx: Dictionary) -> Dictionary:
	var roll: Variant = ctx.rand.call()
	death_order.append("PCI-09:" + str(ctx.actor.get_instance_id()))
	prefix_calls.append({"profile": ctx.profile, "token": ctx.death_prefix_token, "lines": ctx.source_lines, "roll": roll,
		"actor_alive": ctx.actor.get("alive"), "kills": state.read_current_g().get("kills")})
	return {"applied": roll != null, "spawned": 0, "note": "test_recorder_consumer"}

func _final_death_consumer(payload: Dictionary) -> void:
	var actor: Variant = payload.get("actor")
	death_order.append("PCI-11:" + (str(actor.get_instance_id()) if is_instance_valid(actor) else "?"))

func _test_pci09_death_prefix() -> void:
	var pool: Array = _enemies_alive()
	if pool.is_empty(): return
	var e: Node = pool[0]
	e.set("etype", 15)
	forced += 1
	var hp0: float = float(e.get("hp"))
	var rng0 := _rng_count()
	var r0: Dictionary = main.request_native_hurte(e, 50, 0.0, false, {"kbMult": 1.0, "poiseMult": 1.5, "noPoise": false, "poiseHit": false, "poiseSkill": false, "_lessonAttack": "weapon"}, 0, {"token": _tok("hurte")})
	check(r0.status == "NOT_READY" and str(r0.reason).begins_with("death_prefix_consumer_not_ready") and float(e.get("hp")) == hp0 and _rng_count() == rng0, "missing_required_consumer_not_ready_before_writes")
	var reg: Dictionary = main.register_native_enemy_death_effect("etype15_death_split", Callable(self, "_prefix_consumer"), {"token": _tok("reg")})
	check(reg.status == "APPLIED", "register_split_consumer")
	var dup: Dictionary = main.register_native_enemy_death_effect("etype15_death_split", Callable(self, "_prefix_consumer"), {"token": _tok("reg")})
	check(dup.status == "REJECTED", "single_owner_per_profile")
	check(main.register_native_enemy_death_effect("bogus", Callable(self, "_prefix_consumer"), {"token": _tok("reg")}).status == "REJECTED", "unknown_profile_rejected")
	var sub: Variant = main.subscribe_native_final_enemy_death(Callable(self, "_final_death_consumer"), {"subscriber": main}) if main.has_method("subscribe_native_final_enemy_death") else null
	check(sub is Dictionary and sub.get("accepted") == true, "pci11_subscription_for_order_witness:" + str(sub.get("reason") if sub is Dictionary else "no_api"))
	var published0: int = int(main.read_native_final_enemy_death_snapshot().get("published", 0))
	death_order.clear()
	var big: int = int(float(e.get("hp")) + float(e.get("eShield"))) + 100
	var r1: Dictionary = main.request_native_hurte(e, big, 0.0, false, {"kbMult": 1.0, "poiseMult": 1.5, "noPoise": false, "poiseHit": false, "poiseSkill": false, "_lessonAttack": "weapon"}, 0, {"token": _tok("hurte")})
	check(r1.status == "APPLIED" and r1.alive_after == false, "lethal_with_consumer_applied:" + str(r1.reason))
	check(prefix_calls.size() == 1 and prefix_calls[0].actor_alive == false, "consumer_called_once_after_death_write")
	var ops: Array = []
	for j in r1.journal: ops.append(str(j.op))
	var i_kill: int = ops.find("kill_core")
	var i_chain: int = ops.find("death_fx_tail")
	var i_prefix: int = ops.find("death_prefix:etype15_death_split")
	var i_potion: int = ops.find("potion_applied")
	check(i_kill >= 0 and i_chain > i_kill and i_prefix > i_chain and i_potion > i_prefix, "prefix_position_42792_between_gore_and_potion:" + str(ops))
	var lines: Array = _gameplay_lines(r1.rng_draws)
	var at: int = lines.find(42794)
	check(at > 0 and lines.find(43092) > at, "consumer_rng_interleaved_in_source_order")
	var eid: String = str(e.get_instance_id())
	check(death_order == ["PCI-09:" + eid, "PCI-11:" + eid], "same_death_pci09_then_pci11_once_each:" + str(death_order))
	check(int(main.read_native_final_enemy_death_snapshot().get("published", 0)) == published0 + 1, "pci11_published_exactly_once")
	if sub is Dictionary and sub.get("subscription_id") is String: main.unsubscribe_native_final_enemy_death(sub.subscription_id)
	var n09 := 0
	var n11 := 0
	var i09 := -1
	var i11 := -1
	for j in range(ops.size()):
		if ops[j] == "death_prefix:etype15_death_split": n09 += 1; i09 = j
		if ops[j] == "final_death_published": n11 += 1; i11 = j
	check(n09 == 1 and n11 == 1 and i09 < i11 and ops.has("final_death_deferred_after_pci09"), "journal_pci09_before_pci11_once_each")
	check(main.get("native_combat_pack_b").unregister_native_enemy_death_effect("etype15_death_split", Callable(self, "_prefix_consumer")), "unregister_consumer")

func _test_perf_bench() -> void:
	# 물리 300틱 벽시계: (a) 탄 0 (b) normalBow 30발 비행 pass를 매 틱 실행. 틱 경로 목록 생성 API 0.
	var res := {}
	for mode in ["idle", "arrows30"]:
		var pass_us := 0
		var pass_max := 0
		var active_us := 0
		var active_n := 0
		var contacts := 0
		var phys_max := 0.0
		if mode == "arrows30":
			var origin: Vector2 = world.get_start_position()
			for i in range(30):
				var pkt: RefCounted = _borrow_arrow(origin, origin + Vector2.from_angle(TAU * i / 30.0) * 100.0, 1)
				main.admit_native_source_projectile(player, pkt, {"token": _tok("admit")})
		var t0 := Time.get_ticks_usec()
		for t in range(300):
			await physics_frame
			if mode == "arrows30":
				var live_before: int = int(world.get_native_player_projectile_store_snapshot().get("live", 0))
				var a := Time.get_ticks_usec()
				var pr: Dictionary = main.advance_native_player_projectile_pass(1.0, {"token": _tok("pass")})
				var d := Time.get_ticks_usec() - a
				if live_before > 0:
					active_us += d
					active_n += 1
				for r in pr.get("results", []): contacts += (r.collision_receipt as Array).size()
				pass_us += d
				pass_max = maxi(pass_max, d)
			if t > 0: phys_max = maxf(phys_max, Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000.0)
		var wall_ms: float = (Time.get_ticks_usec() - t0) / 1000.0
		res[mode] = {"active_passes": active_n, "active_pass_mean_us": float(active_us) / maxf(1.0, active_n), "contacts": contacts, "wall_ms_300": wall_ms, "ms_per_tick": wall_ms / 300.0, "pass_mean_us": pass_us / 300.0, "pass_max_us": pass_max, "physics_process_max_ms": phys_max}
	observations["perf"] = res
	print("PCB_PERF ", JSON.stringify(res))
	check(float(res.arrows30.ms_per_tick) <= 16.67 * 1.05, "arrows30_realtime_60hz")
