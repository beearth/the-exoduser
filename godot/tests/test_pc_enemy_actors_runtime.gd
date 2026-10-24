extends "res://tests/test_demo11_43_stage_spawn_adapter.gd"
## PC-ENEMY-ACTORS — 실제 Main/World/PC owner 위에서 G 계열 10종(9종 + 일반 소환굴 29) 공급·AI·탄·소환·덫/거미줄·사망.
## 소환굴 주기·예산은 기존 owner 그대로(이 시험은 선택 etype 인계 API 를 직접 부른다). 시험 전용 Provider Marker.
const G_DIR := "EXODUSER-pc-enemy-actors-unit-Isolated-20261023"
const HOLES_ := preload("res://scripts/native_spawn_hole_system.gd")
const K := preload("res://scripts/native_demo11_etype_g_kernel.gd")
const TYPES := [7, 16, 47, 20, 21, 14, 13, 17, 3, 29]
var g_main: Node
var g_actors: Dictionary = {}
var g_provider: Node2D
var g_deaths: Array = []
var g_child_births: Dictionary = {}

func source_input(etype: int, n: int = 1) -> Dictionary:
	var literal: Dictionary = {}
	for draw in HOLES_.MKEN_LITERAL_DRAWS:
		if draw[1].is_empty() or draw[1].has(etype): literal[draw[0]] = draw[2] + draw[3] * 0.25
	return {"etype": etype, "elite": 0, "mods": [], "speed_u": 0.5, "radius_u": 0.5, "literal": literal, "spawn_n": n}

func step(n: int = 1) -> void:
	for i in n:
		g_main.world._physics_process(1.0 / 60.0)
		g_main.world.advance_native_owner_phase()
		var svc: Node = g_main.world.get_node_or_null("Demo11EtypeG")
		if is_instance_valid(svc): svc._physics_process(1.0 / 60.0)
		g_main.world.advance_native_birth_phase()

func observe_child_birth(actor: Node) -> void:
	# World adds a fully configured actor before the remainder of the same
	# owner phase can damage it. Post-step polling was already too late.
	if not actor.get("data") is Dictionary: return
	if not str(actor.data.get("id", "")).begins_with("demo11_G_child_"): return
	var id: int = actor.get_instance_id()
	if g_child_births.has(id): return
	g_child_births[id] = {"id": str(actor.data.id), "etype": actor.etype, "hp": actor.hp,
		"mhp": actor.data.native_final.mhp, "shield": actor.eShield, "shield_max": actor.eShieldMax, "alive": actor.alive}
	if actor.etype == 3:
		check(actor.alive and actor.el >= 0 and actor.eShield == 0 and actor.eShieldMax == 0 and actor.hp == int(actor.data.native_final.mhp),
			"7 summon birth: random element, shield0, halved hp " + JSON.stringify(g_child_births[id]))

func final_death(event: Dictionary) -> void:
	if event.event == "final_death": g_deaths.append(event.actor)

func check_move_audio(svc: Node) -> void:
	check(g_main.has_method("request_native_enemy_move_sample"), "G movement sample bridge exists")
	if not g_main.has_method("request_native_enemy_move_sample"): return
	if g_main.player.get_native_character_profile_snapshot().get("ready") != true:
		var unselected: Dictionary = g_main.request_native_enemy_move_sample(svc, "m_swarm", 0.25, 1.0)
		check(not unselected.get("accepted", false) and unselected.get("reason") == "movement_audio_character_not_ready", "unselected character cannot enqueue")
		# This combat fixture boots Main directly. Select through its existing
		# picker/callback, as test_demo11_40_combat_sound does; keep the guard.
		paused = true
		g_main._character_picker.select(1) # item0 is the unselected placeholder
		g_main._on_native_character_selected(1)
		paused = false
	check(svc.current(), "actual G movement owner current")
	check(g_main.read_native_attack_audio_settings().get("ready") == true, "movement audio settings " + JSON.stringify(g_main.read_native_attack_audio_settings()))
	check(g_main.player.get_native_character_profile_snapshot().get("ready") == true, "movement audio character " + JSON.stringify(g_main.player.get_native_character_profile_snapshot()))
	var events: Array = []
	var observe := func(kind: String, data: Dictionary):
		if kind == "native_attack_audio_queued": events.append(data.duplicate(true))
	g_main.native_sound_event.connect(observe)
	g_main._combat_sound_consumer.backend.stop_all("movement_audio_fixture")
	g_main._attack_audio_queue.clear()
	g_main._combat_sound_consumer._state.queue.clear()
	g_main._attack_audio_last_ms.clear()
	var before: int = g_main.get_native_attack_audio_snapshot().starts
	var keys := ["m_melee", "m_archer", "m_swarm", "m_tank", "m_caster", "m_splitter", "m_mother"]
	for key in keys:
		var at: int = events.size()
		svc.play_sample(key, 0.25, 1.0, g_main.player.global_position)
		check(events.size() == at + 1, "G original sample queued once " + key + " " + JSON.stringify(svc.unported))
		if events.size() == at + 1:
			var packet: Dictionary = events[-1]
			check(packet.key == key and packet.gain == 0.25 and not packet.priority, "source key/gain/non-priority " + key)
			check(packet.source_random_values.size() == 1 and is_equal_approx(packet.rate, 0.92 + float(packet.source_random_values[0]) * 0.16), "playSample shared jitter once " + key)
			var stream: AudioStream = g_main._attack_audio_streams.get(key)
			check(stream != null and stream.get_length() > 0, "original movement MP3 decodes " + key)
	var count: int = events.size()
	g_main._attack_audio_last_ms.m_swarm = Time.get_ticks_msec()
	svc.play_sample("m_swarm", 0.25, 1.0, Vector2.ZERO)
	check(events.size() == count, "same-key 30ms gate retained")
	svc.play_sample("unknown_monster_move", 0.25, 1.0, Vector2.ZERO)
	check(events.size() == count, "unknown movement sample never substituted")
	paused = true
	svc.play_sample("m_tank", 0.25, 1.0, Vector2.ZERO)
	paused = false
	check(events.size() == count, "paused G sound cannot enqueue")
	var foreign := Node.new()
	var refused: Dictionary = g_main.request_native_enemy_move_sample(foreign, "m_tank", 0.25, 1.0)
	foreign.free()
	check(not refused.get("accepted", false) and events.size() == count, "foreign sound caller refused")
	g_main._advance_native_attack_audio()
	var snap: Dictionary = g_main.get_native_attack_audio_snapshot()
	check(snap.last_flush.processed == 6 and snap.queued == 0 and g_main._attack_audio_queue.is_empty(), "shared desktop six-sample frame queue, no second backend")
	check(snap.starts - before == 5 and snap.active.size() == 5, "source PROJ priority node cap five includes monster movement")
	for voice in snap.active:
		check(keys.has(voice.key) and voice.playing, "actual movement AudioStreamPlayer playing " + str(voice.key))
	observations.move_audio = {"queued": count, "starts": snap.starts - before, "driver": AudioServer.get_driver_name(), "subjective_sound_equivalence_verified": false}
	g_main.native_sound_event.disconnect(observe)

func capture_cohort(label: String) -> void:
	var folder := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--captures="): folder = arg.trim_prefix("--captures=")
	if folder.is_empty() or DisplayServer.get_name() == "headless": return
	await process_frame
	await RenderingServer.frame_post_draw
	var image := root.get_texture().get_image()
	check(image.get_size() == Vector2i(1920, 1080), "engine viewport 1920x1080 " + label)
	check(image.save_png(folder.path_join(label + ".png")) == OK, "engine capture written " + label)

func check_magic_audio(svc: Node) -> void:
	check(g_main.has_method("request_native_enemy_magic_sample"), "G dark magic source sample bridge exists")
	if not g_main.has_method("request_native_enemy_magic_sample"): return
	var events: Array = []
	var observe := func(kind: String, data: Dictionary):
		if kind == "native_attack_audio_queued": events.append(data.duplicate(true))
	g_main.native_sound_event.connect(observe)
	g_main._combat_sound_consumer.backend.stop_all("magic_audio_fixture")
	g_main._attack_audio_queue.clear()
	g_main._combat_sound_consumer._state.queue.clear()
	var before: int = g_main.get_native_attack_audio_snapshot().starts
	for i in 2: svc.sfx("magic", [3], g_main.player.global_position)
	check(events.size() == 2, "original fire magic priority bypasses 30ms duplicate gate")
	for packet in events:
		check(packet.key == "fire_magic1" and packet.gain == 0.35 and packet.priority, "dark magic source key/gain/skill priority")
		check(packet.source_random_values.size() == 2, "dark cast pitch and playSample jitter each draw once")
		if packet.source_random_values.size() == 2:
			var pitch: float = 0.6 * (1.0 + (float(packet.source_random_values[0]) - 0.5) * 2.0 * 0.06)
			check(is_equal_approx(packet.rate, pitch * (0.92 + float(packet.source_random_values[1]) * 0.16)), "original dark pitch arithmetic")
	var count: int = events.size()
	svc.sfx("magic", [2], Vector2.ZERO)
	svc.sfx("charge", [], Vector2.ZERO)
	svc.sfx("groggy", [], Vector2.ZERO)
	check(events.size() == count, "unported procedural and other elements never substituted")
	check(svc.unported.has("SFX.magic.procedural_layers") and svc.unported.has("SFX.charge") and svc.unported.has("SFX.groggy"), "remaining layers explicitly unported")
	paused = true
	svc.sfx("magic", [3], Vector2.ZERO)
	paused = false
	check(events.size() == count, "paused dark magic cannot enqueue")
	var foreign := Node.new()
	var refused: Dictionary = g_main.request_native_enemy_magic_sample(foreign)
	foreign.free()
	check(not refused.get("accepted", false), "foreign dark magic caller refused")
	g_main._advance_native_attack_audio()
	var snap: Dictionary = g_main.get_native_attack_audio_snapshot()
	check(snap.starts - before == 2 and snap.active.size() == 2, "two real dark magic AudioStreamPlayers on existing backend")
	for voice in snap.active: check(voice.key == "fire_magic1" and voice.playing, "dark magic actual player playing")
	observations.magic_audio = {"driver": AudioServer.get_driver_name(), "starts": snap.starts - before, "complete_cue": false, "procedural_layers": "NOT_READY"}
	g_main.native_sound_event.disconnect(observe)

func run() -> void:
	check(OS.get_user_data_dir().ends_with(G_DIR), "isolated userdir")
	g_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(g_main)
	# BOOT-01(bfaee6fd6) 이후 _ready 본문은 여러 프레임에 걸쳐 끝난다 — world 등이 생긴 뒤 픽스처를 건다
	for _i in 600:
		if g_main.is_native_boot_body_done(): break
		await process_frame
	check(g_main.is_native_boot_body_done(), "main boot body done")
	g_main.world.child_entered_tree.connect(observe_child_birth)
	preload("res://tests/mac_pcib_fixture_main.gd").install(g_main)
	# This AI/registration fixture manually advances 2700+ World ticks. Keep the
	# target alive, as the existing boss-parity fixture does; rendering yields must
	# not let deferred player death end the cohort before its teleport checks.
	g_main.player.iframes = 100000.0
	await physics_frame
	check(g_main.source_state.apply_native_intro_curtain_g_writes(g_main.source_intro_sequence, "open").get("applied", false), "intro G.on writer")
	g_main.world.set_physics_process(false)
	g_main.process_mode = Node.PROCESS_MODE_DISABLED
	g_provider = Provider.new()
	g_main.world.add_child(g_provider)
	var pp: Vector2 = g_main.player.global_position
	var placed := 0
	for i in TYPES.size():
		var found := false
		for ring in [150.0, 220.0, 300.0, 380.0]:
			for k in 24:
				var at: Vector2 = pp + Vector2.from_angle(TAU * (k + i * 0.37) / 24.0) * ring
				if g_main.world.can_move(at, 60.0) and g_main.world.can_move(at + Vector2(60, 0), 60.0):
					var marker := Marker2D.new()
					g_provider.add_child(marker)
					marker.global_position = at
					var id := "G%d" % TYPES[i]
					g_provider.rows.append({"id": id, "marker": marker, "region_id": 0, "size": 0.8, "room": 0})
					g_provider.groups.append({"hole_id": id, "spawn_group_id": id, "region_id": 0, "total": 15})
					found = true
					break
			if found: break
		if found: placed += 1
	check(placed == TYPES.size(), "geometry-valid Marker per type %d/%d" % [placed, TYPES.size()])
	# 2단계 격리 Marker: 7(플레이어 100px 안 → 텔레포트), 17·47(군집 밖) — 1단계 적 처치 뒤 사용
	# G39421 requires d>60 at cooldown expiry; keep the melee chaser far enough
	# away that this fixture reaches the teleport branch before closing that gap.
	for spec in [[7, 70.0], [17, 330.0], [47, 600.0]]:
		var done := false
		for k in 48:
			var at2: Vector2 = pp + Vector2.from_angle(TAU * k / 48.0 + 0.2) * float(spec[1])
			if g_main.world.can_move(at2, 60.0) and g_main.world.can_move(at2 + Vector2(60, 0), 60.0):
				var m2 := Marker2D.new()
				g_provider.add_child(m2)
				m2.global_position = at2 - Vector2((float(K.RADIUS[spec[0]]) + 1.0) * 2.0, 0)
				var id2 := "G%db" % spec[0]
				g_provider.rows.append({"id": id2, "marker": m2, "region_id": 2, "size": 0.8, "room": 1})
				g_provider.groups.append({"hole_id": id2, "spawn_group_id": id2, "region_id": 2, "total": 15})
				done = true
				break
		check(done, "isolated Marker %d" % spec[0])
	check(g_main.bind_native_spawn_stage_provider(g_provider).ready, "actual adapter/P3 binding")
	var holes: Node = g_main.world.get_node("NativeSpawnHoleSystem")
	var total: Variant = g_main.source_state.read_current_g()._totalSpawned
	# 1) 자연 공급 경로: natural base spawn_selected 가 G 계열을 실제 owner 로 인계(재추첨 0)
	var common: Node = g_main.native_natural_enemies
	if not is_instance_valid(common):
		var bound: Dictionary = g_main.bind_native_natural_enemy_base(func(): return {"lesson_active": false, "qa_storage_active": false, "aggro_active": false}, false)
		check(bound.get("ready", false), "natural base bound:" + str(bound.get("reason")))
		common = g_main.native_natural_enemies
	for et in TYPES:
		var r: Dictionary = common.spawn_selected(holes, "G%d" % et, source_input(et))
		check(r.get("registered", false), "natural spawn_selected registers etype %d: %s" % [et, r.get("reason")])
		if r.get("registered", false): g_actors[et] = r.actor
	check(g_main.source_state.read_current_g()._totalSpawned == total, "no denominator inflation")
	check(not common.spawn_selected(holes, "G7", source_input(7)).get("registered", false), "same source token consumed once")
	var magic: Dictionary = source_input(21, 2)
	magic.elite = 1; magic.mods = ["M29"]
	check(common.spawn_selected(holes, "G21", magic).get("reason") == "elite_modifier_owner_required", "magic elite HOLD, never substituted")
	# E 소환굴 29 경로도 문지기가 아닌 G 일반 생성자로 간다
	var via_e: Dictionary = g_main.request_native_etype_e_spawn(holes, "G29", source_input(29, 2))
	check(via_e.get("registered", false) and via_e.actor.data.get("ai_profile") == "demo11_group_g_v1" and via_e.actor.data.native_final.get("_isGateGuard") == null and int(via_e.actor.elite) == 0, "spawn-hole 29 via E = ordinary natural 29, not gate guard: " + str(via_e.get("reason")))
	if via_e.get("registered", false): via_e.actor.data.native_final._revived = true
	for et in g_actors:
		var a: Node2D = g_actors[et]
		var n: Dictionary = a.data.native_final
		check(a.get_parent() == g_main.world and g_main.world.get_enemies().has(a) and not a.is_physics_processing(), "World identity/clock %d" % et)
		check(a.hp == 875 and a.attack == 31 and a.el == -1 and n.get("el") == null and n.reviveIframes == 15, "lv1 source stats, undefined el, reviveIframes15 %d" % et)
		check(is_equal_approx(a.radius, (float(K.RADIUS[et]) + 1.0) * 2.0) and is_equal_approx(float(a.data.speed_pixels_per_tick), (maxf(0.2, float(K.SPD_RAW[et]) * 1.3) + 0.04) * 1.5), "radius/speed %d" % et)
		check(a.data.native_final.col == K.COL[et] and int(a.data.native_final.projCd) == (9999 if et == 20 else 240), "col/projCd %d" % et)
	if "--move-audio-only" in OS.get_cmdline_user_args():
		check_move_audio(g_main.world.get_node("Demo11EtypeG"))
		check_magic_audio(g_main.world.get_node("Demo11EtypeG"))
		print("PC_ENEMY_MOVE_AUDIO_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "observations": observations}))
		g_main.free()
		await process_frame
		quit(0 if failures == 0 else 1)
		return
	# Select through the existing UI so real G kernel SFX calls reach Main.
	paused = true
	g_main._character_picker.select(1)
	g_main._on_native_character_selected(1)
	paused = false
	var kernel_magic: Array = []
	var observe_kernel := func(kind: String, packet: Dictionary):
		if kind == "native_attack_audio_queued" and packet.get("context", {}).get("phase") == "enemy_dark_magic_sample_partial": kernel_magic.append(packet.duplicate(true))
	g_main.native_sound_event.connect(observe_kernel)
	# 2) AI: 20초 실제 World 틱
	var seen: Dictionary = {}
	var first_children: int = 0
	for t in 1200:
		step()
		if t == 180: await capture_cohort("enemy_cohort_tick181")
		for et in g_actors:
			var a: Node2D = g_actors[et]
			if not is_instance_valid(a): continue
			var s: String = str(a.state)
			seen["%d:%s" % [et, s]] = int(seen.get("%d:%s" % [et, s], 0)) + 1
			if float(a.data.native_final.get("_tpWarnT", 0)) > 0: seen["%d:tpwarn" % et] = 1
	var svc: Node = g_main.world.get_node("Demo11EtypeG")
	var snap: Dictionary = svc.snapshot()
	observations.service = snap
	for et in g_actors:
		var a: Node2D = g_actors[et]
		observations["actor%d" % et] = {"fault": a.g_fault, "updates": a.g_updates, "counts": a.g_counts, "state": a.state, "pos": [a.global_position.x, a.global_position.y]}
		check(a.g_fault.is_empty(), "no NOT_READY stop %d: %s" % [et, a.g_fault])
		check(a.g_updates > 100, "kernel updates %d: %d" % [et, a.g_updates])
	check(seen.has("14:eSwoop"), "14 swoop")
	check(seen.has("29:eSlamWind") or seen.has("29:eCharge"), "29 slam/charge")
	check(snap.counts.detached_mken > 0, "47 clone mkEn consumed (not registered)")
	check(snap.counts.hazards > 0, "web/trap hazards born: %d" % snap.counts.hazards)
	check(snap.counts.projs > 0 or snap.counts.shots_released > 0, "projectiles via common registry: %d/%d" % [snap.counts.projs, snap.counts.shots_released])
	# 3) PC hurtE: 비치명 → 치명 → PCI-11 단회(29 는 PCI-09 사망탄 포함)
	check(g_main.subscribe_native_final_enemy_death(final_death, {"subscriber": g_main, "events": ["final_death"]}).get("accepted", false), "PCI11 subscribe")
	var kills0: int = g_main.source_state.read_current_g().kills
	var killed := 0
	for et in g_actors:
		var a: Node2D = g_actors[et]
		if not is_instance_valid(a) or not a.alive: continue
		a.eShield = 0
		a.data.native_final.reviveIframes = 0
		a.data.native_final._revived = true # 시험 전용: 50% 부활 판정 대신 최종 사망 분기
		var nl: Dictionary = g_main.request_native_hurte(a, 1, 0.0, false, {}, 0, {"token": "G/nl/%d" % et})
		check(nl.status == "APPLIED" and a.alive, "nonlethal hurtE %d: %s" % [et, nl.get("reason")])
		var le: Dictionary = g_main.request_native_hurte(a, 10000000, 0.0, false, {}, 0, {"token": "G/le/%d" % et})
		check(le.status == "APPLIED" and not a.alive and g_deaths.count(a) == 1, "lethal hurtE + PCI11 once %d: %s" % [et, le.get("reason")])
		if not a.alive: killed += 1
	check(g_main.source_state.read_current_g().kills == kills0 + killed, "kill rewards exactly once (%d)" % killed)
	check(int(g_main.native_pcib_death_effects.calls.get(29, 0)) >= 1, "29 death shots PCI09")
	var w_dead: int = svc.warnings.filter(func(w): return w.dead).size()
	check(w_dead >= 1, "29 death shots queued as dead warnings (lanes): %d" % w_dead)
	var born0: int = svc.counts.shots_released
	step(65)
	check(svc.counts.shots_released >= born0 + 8, "dead warnings released after 60 ticks: %d -> %d" % [born0, svc.counts.shots_released])
	# 4) 격리 2단계: 7 텔레포트·eSummon(요마 3) / 17 모체(거미 13) / 47 텔레포트
	for en in g_main.world.get_enemies():
		if is_instance_valid(en) and en.get("alive") == true and en.has_method("request_native_hurte") == false and en.get("data") is Dictionary:
			if str(en.data.get("id", "")).begins_with("demo11_G_"):
				en.data.native_final._revived = true
				en.eShield = 0
				g_main.request_native_hurte(en, 10000000, 0.0, false, {}, 0, {"token": "G/clear/%d" % en.get_instance_id()})
	var iso: Dictionary = {}
	for et in [7, 17, 47]:
		var r2: Dictionary = common.spawn_selected(holes, "G%db" % et, source_input(et, 3))
		check(r2.get("registered", false), "isolated spawn %d: %s" % [et, r2.get("reason")])
		if r2.get("registered", false): iso[et] = r2.actor
	var seen2: Dictionary = {}
	var tp_from: Dictionary = {}
	for et in iso: tp_from[et] = iso[et].global_position
	var trace47: Dictionary = {}
	if iso.has(47):
		var initial47: Node2D = iso[47]
		trace47 = {"start": initial47.global_position, "player": g_main.player.global_position,
			"speed": initial47.data.native_final.speed, "cooldown": initial47.data.native_final._stTpCd,
			"min_distance": initial47.global_position.distance_to(g_main.player.global_position), "min_cooldown": INF}
		check(float(trace47.min_distance) > 60.0, "47 fixture begins inside source teleport distance domain")
	for t in 1500:
		step()
		if t == 220: await capture_cohort("enemy_isolated_tick221")
		for et in iso:
			var a2: Node2D = iso[et]
			if not is_instance_valid(a2): continue
			seen2["%d:%s" % [et, a2.state]] = 1
			if float(a2.data.native_final.get("_tpWarnT", 0)) > 0: seen2["%d:tpwarn" % et] = 1
			if float(a2.data.native_final.get("_tpFlashT", 0)) > 0: seen2["%d:teleported" % et] = 1
			if et == 47:
				trace47.min_distance = minf(float(trace47.min_distance), a2.global_position.distance_to(g_main.player.global_position))
				trace47.min_cooldown = minf(float(trace47.min_cooldown), float(a2.data.native_final.get("_stTpCd", INF)))
	observations.seen_isolated = seen2
	observations.teleport47_fixture = trace47
	observations.service2 = svc.snapshot()
	check(g_main.player.hp > 0, "AI fixture target survives through observed teleport branches")
	check(seen2.has("7:tpwarn") and seen2.has("7:teleported"), "7 teleport warning 120 → teleportE")
	check(seen2.has("7:eSummon"), "7 eSummon channel")
	check(seen2.has("47:tpwarn") and seen2.has("47:teleported"), "47 teleport warning → teleportE")
	var child_types: Dictionary = {}
	for en in g_main.world.get_enemies():
		if en.get("data") is Dictionary and str(en.data.get("id", "")).begins_with("demo11_G_child_"):
			child_types[en.etype] = int(child_types.get(en.etype, 0)) + 1
			check(en.get_parent() == g_main.world and g_main.native_stage_spawn_adapter._origins.has(en.get_instance_id()), "child registered with parent Marker origin %d" % en.etype)
			if en.etype == 3: check(g_child_births.has(en.get_instance_id()), "7 summon birth observed before later damage/death " + str(en.data.id))
	observations.child_types = child_types
	observations.child_births = g_child_births.values()
	check(child_types.has(3), "7 summoned etype 3")
	check(child_types.has(13), "17 summoned etype 13")
	for et in iso:
		for k in iso[et].g_counts: pass
		check(iso[et].g_fault.is_empty(), "isolated no stop %d: %s" % [et, iso[et].g_fault])
	step(5)
	check(not kernel_magic.is_empty(), "actual G17 mother kernel reaches original dark magic sample queue")
	for packet in kernel_magic:
		check(packet.key == "fire_magic1" and packet.priority and packet.gain == 0.35, "actual mother source event key/gain/priority")
	observations.mother_magic_calls = kernel_magic.size()
	g_main.native_sound_event.disconnect(observe_kernel)
	check_move_audio(svc)
	check_magic_audio(svc)
	observations.seen = seen
	print("PC_ENEMY_RUNTIME_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "observations": observations}))
	g_main.free()
	await process_frame
	quit(0 if failures == 0 else 1)
