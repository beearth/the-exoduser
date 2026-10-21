extends SceneTree
## PCI-11 — subscribe_native_final_enemy_death on the actual booted Main.
## 실제 hurtE 처치 파이프라인(native_normal_enemy_hurte)으로 적을 처치하고, G42733 앵커에서
## 단회 final_death / revival_pending 신호가 구독자에게 가는지, 무변이 실패·중복 0을 확인한다.
const USERDIR = "EXODUSER-pc-life-pack-Isolated-20261021"
const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
var checks := 0
var failures := 0
var main: Node
var world: Node
var state: Node
var events_a: Array = []
var events_b: Array = []
var signal_events: Array = []
var at_delivery: Array = []
var nested_subscribe: Array = []

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCFD_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func consumer_a(payload: Dictionary) -> void:
	events_a.append(payload)
	var g: Dictionary = state.read_current_g()
	at_delivery.append({"kills": g.get("kills"), "_chainCnt": g.get("_chainCnt"), "combo": g.get("combo"),
		"alive": payload.actor.get("alive") if is_instance_valid(payload.actor) else null})
	if nested_subscribe.is_empty():
		nested_subscribe.append(main.subscribe_native_final_enemy_death(func(_p): pass, {"subscriber": main}))

func consumer_b(payload: Dictionary) -> void:
	events_b.append(payload)

func _on_final(actor: Node, stage_index: int) -> void:
	signal_events.append({"actor": actor, "stage": stage_index})

func kill(enemy: Node) -> Dictionary:
	var last: Dictionary = {}
	for i in 6:
		if enemy.get("alive") != true: break
		last = NORMAL_HURTE.new().execute(main, world, enemy, 200000, 0.0, 0, {})
		if last.get("ok") != true: break
	return last

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	if failures > 0: quit(1); return
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 8: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	world = main.world
	state = main.source_state
	var snap0: Dictionary = main.read_native_final_enemy_death_snapshot()
	check(snap0.subscriptions.size() == 1 and snap0.coverage.boss_ib.status == "NOT_READY", "S0 Mac encounter subscriber installed, boss coverage NOT_READY")

	# S1 무변이 구독 실패
	var r: Dictionary = main.subscribe_native_final_enemy_death(Callable(), {"subscriber": main})
	check(r.status == "REJECTED" and r.reason == "final_death_consumer_invalid", "S1 invalid consumer rejected")
	var outsider := Node.new()
	r = main.subscribe_native_final_enemy_death(consumer_a, {"subscriber": outsider})
	check(r.status == "REJECTED" and r.reason == "final_death_subscriber_not_Main_owned", "S1 foreign subscriber rejected")
	outsider.free()
	r = main.subscribe_native_final_enemy_death(consumer_a, {"subscriber": main, "events": ["clear"]})
	check(r.status == "REJECTED" and str(r.reason).begins_with("final_death_event_unknown"), "S1 unknown event rejected")
	check(main.read_native_final_enemy_death_snapshot().subscriptions.size() == 1, "S1 failed subscriptions preserve sole Mac subscription")
	# S2 구독
	var ra: Dictionary = main.subscribe_native_final_enemy_death(consumer_a, {"subscriber": main})
	check(ra.status == "READY" and ra.accepted == true and str(ra.subscription_id).begins_with("fdsub:"), "S2 subscribe A (all events)")
	check(ra.coverage.normal_enemy_hurte.status == "READY" and ra.coverage.boss_ib.status == "NOT_READY", "S2 receipt coverage normal READY / boss NOT_READY")
	r = main.subscribe_native_final_enemy_death(consumer_a, {"subscriber": main})
	check(r.status == "REJECTED" and r.reason == "final_death_consumer_already_subscribed", "S2 duplicate consumer rejected")
	var rb: Dictionary = main.subscribe_native_final_enemy_death(consumer_b, {"subscriber": world, "events": ["final_death"]})
	check(rb.status == "READY", "S2 subscribe B (final only, world-owned subscriber)")
	main.native_enemy_final_death.connect(_on_final)

	# S3 실제 hurtE 처치
	var killed: Array = []
	var halts: Array = []
	for enemy in world.get_enemies().duplicate():
		if killed.size() >= 4: break
		if not is_instance_valid(enemy) or enemy.get("alive") != true or not enemy.has_method("read_native_normal_enemy_hurte_fields"): continue
		var before_a := events_a.size()
		var out: Dictionary = kill(enemy)
		if enemy.get("alive") == true:
			halts.append({"id": enemy.name, "reason": out.get("reason")})
			check(events_a.size() == before_a, "S3 halted/alive enemy produced no death event: " + str(enemy.name))
			continue
		killed.append({"enemy": enemy, "outcome": out, "events": events_a.size() - before_a})
	check(killed.size() >= 2, "S3 at least 2 real hurtE kills (got %d, halts %s)" % [killed.size(), str(halts)])
	var tokens := {}
	var finals := 0
	for i in killed.size():
		var k: Dictionary = killed[i]
		check(k.events == 1, "S3 exactly one event per death: " + str(k.enemy.name))
		var ev: Dictionary = events_a[events_a.size() - killed.size() + i] if events_a.size() >= killed.size() else {}
		var journal: Array = k.outcome.get("journal", [])
		var revived_roll := false
		var anchor_index := -1
		var tail_index := -1
		var chain_index := -1
		for j in journal.size():
			var entry: Dictionary = journal[j]
			if entry.get("line") == 42633 and entry.get("data", {}).get("revived") == true: revived_roll = true
			if entry.get("line") == 42733: anchor_index = j
			if entry.get("line") == 42732: tail_index = j
			if entry.get("line") == 42756 and chain_index < 0: chain_index = j
		check(ev.get("actor") == k.enemy, "S3 payload actor identity")
		check(str(ev.get("death_token", "")).begins_with("edeath:") and not tokens.has(ev.death_token), "S3 unique PC death_token")
		tokens[ev.get("death_token")] = true
		check(ev.get("life_phase") == ("revival_pending" if revived_roll else "final") and ev.get("event") == ("revival_pending" if revived_roll else "final_death"), "S3 life_phase matches G42633 roll (revived=%s)" % revived_roll)
		check(int(ev.get("stage", -9)) == int(state.read_current_g().get("stage", -1)), "S3 stage from actual G")
		check(ev.get("kill_receipt", {}).get("line") == 42702 and int(ev.kill_receipt.kills) >= 1, "S3 kill_receipt (42702)")
		check(ev.get("gate_guard", {}).get("applied_by_pc") == false and ev.gate_guard.has("is_gate_guard"), "S3 gate_guard context, PC applies no gate effect")
		check(ev.get("player_life", {}).get("phase") == "alive" and ev.player_life.clear_blocked == false, "S3 player alive → clear not blocked")
		check(tail_index >= 0 and anchor_index == tail_index + 1 and (chain_index < 0 or chain_index > anchor_index), "S3 anchor order 42732 < 42733 < 42756 (journal %d/%d/%d)" % [tail_index, anchor_index, chain_index])
		if not revived_roll: finals += 1
	# 전달 시점 G: 42702 kills 반영, 42756 chain 미반영
	for i in at_delivery.size():
		var after_kill: Dictionary = killed[i].outcome if i < killed.size() else {}
		check(at_delivery[i].alive == false, "S3 delivered after 42702 death write (alive=false)")
	check(events_b.size() == finals and signal_events.size() == finals, "S3 B/final signal only for final deaths (finals=%d, b=%d, sig=%d)" % [finals, events_b.size(), signal_events.size()])
	check(nested_subscribe.size() == 1 and nested_subscribe[0].status == "REJECTED" and nested_subscribe[0].reason == "final_death_subscribe_during_delivery", "S3 subscribe during delivery rejected")

	# S4 중복/외부 발행 무변이
	var n_a := events_a.size()
	var dead_final: Node = null
	for k in killed:
		if main.source_final_enemy_death.read_open_token(k.enemy).get("life_phase") == "final": dead_final = k.enemy
	if dead_final != null:
		var dup: Dictionary = main.publish_native_enemy_death(dead_final, {})
		check(dup.published == false and dup.reason == "final_death_duplicate_publish" and events_a.size() == n_a, "S4 duplicate publish rejected, no event")
	var alive_enemy: Node = null
	for enemy in world.get_enemies():
		if is_instance_valid(enemy) and enemy.get("alive") == true: alive_enemy = enemy; break
	if alive_enemy != null:
		var bad: Dictionary = main.publish_native_enemy_death(alive_enemy, {})
		check(bad.published == false and bad.reason == "final_death_actor_not_current_dead" and events_a.size() == n_a, "S4 publish for alive actor rejected")

	# S5 플레이어 fallen 중 처치 → clear_blocked 신호
	var player: Node = main.player
	for i in 12:
		if player.hp <= 0.0: break
		player.iframes = 0.0
		player.receive_damage(int(player.max_hp))
	var token: String = main.read_native_player_life_phase().death_token
	var fr: Dictionary = main.request_native_player_life_transition({"op": "fallen_enter", "request_id": "pcfd:fallen", "player": player, "death_token": token})
	check(fr.status == "APPLIED", "S5 player fallen")
	var target: Node = null
	for enemy in world.get_enemies():
		if is_instance_valid(enemy) and enemy.get("alive") == true and enemy.has_method("read_native_normal_enemy_hurte_fields") and not killed.any(func(k): return k.enemy == enemy):
			target = enemy; break
	if target != null:
		var before := events_a.size()
		kill(target)
		if target.get("alive") == false and events_a.size() == before + 1:
			var ev: Dictionary = events_a[-1]
			check(ev.player_life.phase == "fallen" and ev.player_life.clear_blocked == true and ev.player_life.death_token == token, "S5 payload carries player fallen + clear_blocked + player death_token")
		else:
			check(false, "S5 kill during fallen produced one event")
	# S6 unsubscribe
	check(main.unsubscribe_native_final_enemy_death(rb.subscription_id) == true, "S6 unsubscribe B")
	check(main.unsubscribe_native_final_enemy_death(rb.subscription_id) == false, "S6 second unsubscribe false")
	var snap: Dictionary = main.read_native_final_enemy_death_snapshot()
	check(snap.subscriptions.size() == 2 and snap.clear_sink_duplicated == false and snap.tick_path == false, "S6 snapshot")
	var artifacts := argument("--artifacts-dir")
	var summary := {"assertions": checks, "failures": failures, "kills": killed.size(), "finals": finals,
		"events_a": events_a.size(), "events_b": events_b.size(), "signal": signal_events.size(), "halts": halts,
		"snapshot": snap}
	if not artifacts.is_empty():
		var f := FileAccess.open(artifacts.path_join("pc_final_death_summary.json"), FileAccess.WRITE)
		f.store_string(JSON.stringify(summary, "  ", true, true))
		f.close()
	print("PCFD_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "kills": killed.size(), "finals": finals}))
	main.queue_free()
	await process_frame
	quit(1 if failures > 0 else 0)
