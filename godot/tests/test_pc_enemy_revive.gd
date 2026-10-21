extends SceneTree
## PCI-10 — request_native_enemy_revive on the actual booted Main.
## 실제 hurtE로 처치한 시체를 같은 identity로 부활시키고, 원본 주술사 블록(G38944–38958, VM oracle)과
## 선택 순서·필드 값을 대조한다. 실패 경로는 무변이.
const USERDIR = "EXODUSER-pc-life-pack-Isolated-20261021"
const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
var checks := 0
var failures := 0
var main: Node
var world: Node
var serial := 0
var cancel_events: Array = []
var oracle_cases: Array = []
var port_rows: Array = []

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCER_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func revive(caster: Node, extra: Dictionary = {}) -> Dictionary:
	serial += 1
	var ctx := {"request_id": "pcer:%d" % serial, "revive_cd": 333.0}
	ctx.merge(extra, true)
	return main.request_native_enemy_revive(caster, ctx)

func kill(enemy: Node) -> void:
	for i in 6:
		if enemy.get("alive") != true: break
		var out: Dictionary = NORMAL_HURTE.new().execute(main, world, enemy, 200000, 0.0, 0, {})
		if out.get("ok") != true: break

func native(enemy: Node) -> Dictionary:
	return enemy.data.get("native_final", {})

func fields(enemy: Node) -> Dictionary:
	return {"alive": enemy.get("alive"), "hp": enemy.get("hp"), "eShield": enemy.get("eShield"), "eShieldMax": enemy.get("eShieldMax"),
		"state": enemy.get("state"), "stunned": enemy.get("_stun_ticks"), "poise": enemy.get("poise"),
		"reviveIframes": native(enemy).get("reviveIframes", 0.0), "pos": enemy.global_position, "layer": enemy.get("collision_layer")}

func pool_case(name: String, caster: Node) -> Dictionary:
	# 원본 _deadPool(ens 순서, !alive&&!_absorbed) 스냅샷 — 포트 registry에서 그대로 구성.
	var pool: Array = []
	var map: Array = []
	var reg: Array = world.get_enemies()
	for i in reg.size():
		var oe: Node = reg[i]
		if not is_instance_valid(oe) or oe.get("alive") != false or native(oe).get("_absorbed") == true: continue
		pool.append({"ib": native(oe).get("ib") == true, "etype": int(oe.get("etype")), "_absorbed": false,
			"x": oe.global_position.x, "y": oe.global_position.y, "mhp": oe.get("mhp"), "alive": false, "hp": oe.get("hp"),
			"eShield": oe.get("eShield"), "eShieldMax": oe.get("eShieldMax"), "s": "dead", "st2": 0, "stunned": oe.get("_stun_ticks"),
			"poise": oe.get("poise"), "maxPoise": oe.get("max_poise"), "reviveIframes": native(oe).get("reviveIframes", 0)})
		map.append(i)
	oracle_cases.append({"name": name, "pool": pool, "caster": {"etype": 9, "s": "idle", "reviveT": 1, "reviveCd": 333,
		"x": caster.global_position.x, "y": caster.global_position.y, "speed": 0, "facing": 0}})
	return {"pool_registry_index": map}

func _on_cancel(payload: Dictionary) -> void:
	cancel_events.append(payload)

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	if failures > 0: quit(1); return
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 8: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	world = main.world
	var sub: Dictionary = main.subscribe_native_final_enemy_death(_on_cancel, {"subscriber": main, "events": ["cancel"]})
	check(sub.status == "READY", "cancel subscription")
	var alive: Array = []
	for enemy in world.get_enemies():
		if is_instance_valid(enemy) and enemy.get("alive") == true and enemy.has_method("apply_native_enemy_corpse_revive"):
			if str(enemy.get_script().resource_path).ends_with("/enemy.gd"): continue # generic은 S7 시체용으로 남김
			alive.append(enemy)
	check(alive.size() >= 4, "at least 4 revivable actors booted (got %d)" % alive.size())
	if alive.size() < 4: quit(1); return
	var caster: Node = alive[0]
	var c1: Node = alive[1]
	var c2: Node = alive[2]
	var c3: Node = alive[3]
	var caster_etype: Variant = caster.get("etype")

	# S1 caster 검증 실패 — 무변이
	var r: Dictionary = revive(caster)
	check(r.status == "REJECTED" and r.reason == "enemy_revive_caster_not_etype9", "S1 non-etype9 caster rejected")
	caster.set("etype", 9)
	caster.set("state", "idle")
	var stray := Node2D.new()
	r = revive(stray)
	check(r.status == "NOT_READY" and r.reason == "enemy_revive_caster_not_registered", "S1 unregistered caster NOT_READY")
	stray.free()
	r = main.request_native_enemy_revive(caster, {"revive_cd": 1.0})
	check(r.status == "REJECTED" and r.reason == "enemy_revive_request_id_required", "S1 request_id required")
	r = main.request_native_enemy_revive(caster, {"request_id": "nocd"})
	check(r.status == "REJECTED" and r.reason == "enemy_revive_revive_cd_required", "S1 revive_cd required")

	# S2 빈 pool → SOURCE_RETURN retry60
	r = revive(caster)
	check(r.status == "SOURCE_RETURN" and r.accepted == true and r.revived == false and r.next_timer == 60.0, "S2 empty pool: SOURCE_RETURN next_timer 60")

	# S3 시체 생성(실제 hurtE). c1 멀리(≥150), c2 가까이(<150) — 원본 순서상 c1이 먼저지만 거리 탈락.
	kill(c1); kill(c2); kill(c3)
	check(c1.get("alive") == false and c2.get("alive") == false and c3.get("alive") == false, "S3 three real hurtE corpses")
	c1.global_position = caster.global_position + Vector2(150.0, 0.0)
	c2.global_position = caster.global_position + Vector2(149.0, 0.0)
	c3.global_position = caster.global_position + Vector2(10.0, 0.0)
	var reg: Array = world.get_enemies()
	var i2: int = reg.find(c2)
	var i3: int = reg.find(c3)
	var first: Node = c2 if i2 < i3 else c3
	var second: Node = c3 if first == c2 else c2
	# ib/etype9/_absorbed 후보는 건너뛴다: 앞선 시체를 ib로 표시
	native(first)["ib"] = true
	var b_first := fields(first)
	var b_second := fields(second)
	var b_c1 := fields(c1)
	var pc := pool_case("skip_ib_pick_next", caster)
	var token_second: Dictionary = main.source_final_enemy_death.read_open_token(second)
	r = revive(caster)
	var a_second := fields(second)
	check(r.status == "APPLIED" and r.revived == true and r.actor == second, "S3 ib corpse skipped, next eligible chosen: " + str(r.get("reason")))
	check(r.readback.instance_id == second.get_instance_id(), "S3 same identity revived")
	check(a_second.alive == true and int(a_second.hp) == int(float(second.get("mhp")) * 0.5), "S3 hp=~~(mhp*.5)")
	check(float(a_second.eShield) == 0.0 and float(second.get("eShieldMax")) == 0.0 and a_second.state == "recover", "S3 eShield/eShieldMax 0, s=recover")
	check(float(a_second.stunned) == 0.0 and float(a_second.poise) == float(second.get("max_poise")) and float(a_second.reviveIframes) == 0.0, "S3 stunned0/poise=maxPoise/reviveIframes0")
	check(a_second.layer == 4 and a_second.pos == b_second.pos, "S3 collision restored, position unchanged (same corpse)")
	check(r.next_timer == 333.0, "S3 next_timer = caster revive_cd")
	check(r.rng_span.consumed == 0, "S3 no RNG")
	check(same(b_first, fields(first)) and same(b_c1, fields(c1)), "S3 other corpses untouched")
	port_rows.append({"selected": reg.find(second), "fields": a_second, "pool_map": pc.pool_registry_index})
	if not token_second.is_empty():
		check(cancel_events.size() == 1 and cancel_events[0].death_token == token_second.death_token and cancel_events[0].actor == second, "S3 PCI-11 cancel for revived corpse token")
		check(main.source_final_enemy_death.read_open_token(second).is_empty(), "S3 open token cleared")
	# 중복 request_id
	var dup: Dictionary = main.request_native_enemy_revive(caster, {"request_id": "pcer:%d" % serial, "revive_cd": 333.0})
	check(dup.replayed == true and same(a_second, fields(second)), "S3 duplicate request_id replays only")
	# S4 남은 후보: first(ib) 제외, c1(거리150) 제외 → 없음
	r = revive(caster)
	check(r.status == "SOURCE_RETURN" and r.next_timer == 60.0 and same(b_first, fields(first)), "S4 only ib/out-of-range corpses → SOURCE_RETURN")
	# etype 9 시체 / _absorbed 시체도 제외
	native(first)["ib"] = false
	var saved_etype: Variant = first.get("etype")
	first.set("etype", 9)
	r = revive(caster)
	check(r.status == "SOURCE_RETURN", "S4 etype9 corpse skipped")
	first.set("etype", saved_etype)
	native(first)["_absorbed"] = true
	r = revive(caster)
	check(r.status == "SOURCE_RETURN", "S4 _absorbed corpse skipped")
	native(first)["_absorbed"] = false
	# S5 caster 사망 → NOT_READY, 시체 무변이
	var b5 := fields(first)
	caster.set("alive", false)
	r = revive(caster)
	check(r.status == "NOT_READY" and r.reason == "enemy_revive_caster_dead" and same(b5, fields(first)), "S5 dead caster NOT_READY, corpse unchanged")
	caster.set("alive", true)
	var pc2 := pool_case("plain_pick", caster)
	r = revive(caster)
	check(r.status == "APPLIED" and r.actor == first, "S5 first corpse revived after flags cleared")
	port_rows.append({"selected": world.get_enemies().find(first), "fields": fields(first), "pool_map": pc2.pool_registry_index})
	# S6 부활체 재처치 → 새 토큰
	kill(second)
	check(second.get("alive") == false, "S6 revived actor can be killed again via hurtE")
	# S7 generic enemy.gd writer(recover → _hit_stun 60 매핑)
	var generic: Node = null
	for enemy in world.get_enemies():
		if is_instance_valid(enemy) and enemy != caster and enemy.get("alive") == true 				and str(enemy.get_script().resource_path).ends_with("/enemy.gd"):
			generic = enemy; break
	check(generic != null, "S7 generic enemy.gd actor present")
	if generic != null:
		kill(generic)
		generic.global_position = caster.global_position + Vector2(5.0, 0.0)
		# 다른 시체들은 범위 밖으로(원본 순서상 앞선 후보가 선택되지 않도록)
		for enemy in world.get_enemies():
			if enemy != generic and enemy != caster and is_instance_valid(enemy) and enemy.get("alive") == false:
				enemy.global_position = caster.global_position + Vector2(900.0, 900.0)
		r = revive(caster)
		check(r.status == "APPLIED" and r.actor == generic and generic.get("alive") == true and int(generic.get("hp")) == int(float(generic.get("mhp")) * 0.5) 			and generic.get("state") == "recover" and float(generic.get("_hit_stun")) == 60.0 and float(generic.get("eShield")) == 0.0, "S7 generic writer: hp/recover/_hit_stun60/eShield0")
	caster.set("etype", caster_etype)

	# Oracle
	var cases_path := ProjectSettings.globalize_path("user://pcer-cases.json")
	var out_path := ProjectSettings.globalize_path("user://pcer-oracle.json")
	var cf := FileAccess.open(cases_path, FileAccess.WRITE)
	cf.store_string(JSON.stringify(oracle_cases))
	cf.close()
	var code := OS.execute(argument("--node-bin"), PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_enemy_revive_oracle.mjs"),
		"--source-game=" + argument("--source-game"), "--cases-file=" + cases_path, "--out-file=" + out_path]), [], true)
	check(code == 0, "oracle exit 0")
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(out_path))
	var compared := 0
	if oracle is Dictionary:
		for i in oracle.rows.size():
			var row: Dictionary = oracle.rows[i]
			var port: Dictionary = port_rows[i]
			check(row.error == null, row.name + " oracle no throw: " + str(row.error))
			var mapped: int = int(port.pool_map[int(row.selected_index)]) if int(row.selected_index) >= 0 else -1
			check(mapped == int(port.selected), row.name + " oracle selects same corpse (registry %d vs %d)" % [mapped, port.selected])
			var o: Dictionary = row.corpse
			var f: Dictionary = port.fields
			for pair in [["alive", "alive"], ["hp", "hp"], ["eShield", "eShield"], ["s", "state"], ["stunned", "stunned"], ["poise", "poise"], ["reviveIframes", "reviveIframes"]]:
				var ok: bool = str(o.get(pair[0])) == str(f.get(pair[1])) or ((o.get(pair[0]) is float or o.get(pair[0]) is int) and absf(float(o.get(pair[0])) - float(f.get(pair[1]))) < 1e-9)
				check(ok, "%s oracle %s source=%s port=%s" % [row.name, pair[0], str(o.get(pair[0])), str(f.get(pair[1]))])
				compared += 1
			check(float(row.reviveT) == 333.0, row.name + " oracle e.reviveT=reviveCd")
	print("PCER_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "oracle_fields_compared": compared,
		"block_line": oracle.get("block_line") if oracle is Dictionary else null,
		"revived_scripts": [str(second.get_script().resource_path).get_file(), str(first.get_script().resource_path).get_file()],
		"cancel_events": cancel_events.size()}))
	main.queue_free()
	await process_frame
	quit(1 if failures > 0 else 0)

func same(a: Dictionary, b: Dictionary) -> bool:
	for k in a:
		if str(a[k]) != str(b.get(k)): return false
	return true
