extends SceneTree
## PC-BOSS-PARITY (2026-10-22) — 1-1 필드보스(E-01) → 지옥문 → 보스방 진입 흐름(B-01) → 보스 처치 → 출구 클리어.
## 실제 Main 부팅(MAP11 기본). 플레이어 입력은 handle_native_input_event(이동·조준·weapon)만 쓴다.
## fixture(명시·최소): 앵글러 HP 낮춤(처치 시간 단축), 지역 4곳 cleared(일반 몹 80% 처치 대체), 보스 정본 E HP·부활력 낮춤,
##   플레이어 iframes/stamina 유지(관측 구간 생존). 보스·앵글러의 상태·시계·패턴·피해 식은 주입하지 않는다.
## 원본 행: 앵글러 G60974–61141, checkRooms 41768–41925, _enterBossArena 30749–30839, mkEn 31120–31185.
const USERDIR := "EXODUSER-pc-boss-parity-Isolated-20261022"
var assertions := 0
var failures := 0
var main: Node
var finals: Array = []
var family_defeated := 0
var gate_ready := 0
var cleared: Array = []
var defeated: Array = []

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PCPARITY_FAIL ", label)

func _initialize() -> void:
	create_timer(float(_arg("watchdog", "900"))).timeout.connect(func(): print("PCPARITY_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _press(action: String, pressed: bool) -> void:
	var ev := InputEventAction.new()
	ev.action = action
	ev.pressed = pressed
	main.player.handle_native_input_event(ev)

func _aim_at(world_pos: Vector2) -> void:
	var cam: Camera2D = main.get("camera")
	var vp: Vector2 = root.get_visible_rect().size
	var mm := InputEventMouseMotion.new()
	mm.position = vp * 0.5 + (world_pos - cam.get_screen_center_position()) * cam.zoom
	main.player.handle_native_input_event(mm)

func _release_all() -> void:
	for a in ["move_up", "move_down", "move_left", "move_right", "weapon"]: _press(a, false)

func _keep_alive() -> void:
	main.player.iframes = maxf(main.player.iframes, 3.0)
	main.player.set("stamina", maxf(float(main.player.get("stamina")), 100.0))

## target 쪽으로 걸어가 stop 안이면 weapon 연타. until.call() 이 참이면 종료.
func _melee_until(target: Callable, stop: float, ticks: int, until: Callable, protect := true) -> int:
	var t := 0
	while t < ticks and not until.call():
		var at: Vector2 = target.call()
		var to: Vector2 = at - main.player.global_position
		_aim_at(at)
		var close: bool = to.length() < stop
		_press("move_up", not close and to.y < -30); _press("move_down", not close and to.y > 30)
		_press("move_left", not close and to.x < -30); _press("move_right", not close and to.x > 30)
		if protect: _keep_alive()
		if close and t % 12 == 0: _press("weapon", true)
		elif close and t % 12 == 4: _press("weapon", false)
		await physics_frame
		t += 1
	_release_all()
	return t

func core0_body() -> Node:
	return main.native_demo_boss_core.body

func _on_death(payload: Dictionary) -> void:
	if payload.get("event") == "final_death" and payload.get("actor") == main.native_demo_boss_actor: finals.append(payload.duplicate())

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	main.source_intro_sequence.finish_native_guide()
	main.source_state.read_current_g().on = true
	for i in range(65): await physics_frame
	main.source_intro_sequence.lesson_flow.skip_all()
	for i in range(3): await physics_frame
	var g: Dictionary = main.source_state.read_current_g()
	var ang: Node = main.native_demo_anglers
	var owner: Node = main.get_node_or_null("PCFieldMobHitOwner")
	var entry: Node = main.get("native_demo_boss_entry")
	ang.family_defeated.connect(func(): family_defeated += 1)
	main.native_demo_encounter.gate_ready.connect(func(): gate_ready += 1)
	main.native_demo_encounter.clear_recorded.connect(func(r): cleared.append(r))
	main.native_demo_boss_defeated.connect(func(s): defeated.append(s))
	main.subscribe_native_final_enemy_death(Callable(self, "_on_death"), {"subscriber": main, "events": ["final_death"]})
	check(is_instance_valid(owner) and owner.snapshot().bound == true and owner.snapshot().interaction_bound == true, "E01_pc_owner_bound_at_boot")
	check(ang.snapshot().pc_bound == true, "E01_family_pc_bound")
	check(is_instance_valid(entry) and entry.snapshot().provider_bound == true, "B01_entry_is_gate_consumer")

	# ── E-01: 앵글러 4마리 출생(_fbTick 61055–61058) ──
	check(g.get("_fbSpawned") == true and g.get("_fieldBosses") is Array and g._fieldBosses.size() == 4, "E01_four_anglers_spawned")
	var hp0: float = float(g._fieldBosses[0].hp) if g._fieldBosses[0] is Dictionary else -1.0
	var lv: float = float(main.source_state.read_current_p().lv)
	check(hp0 == float(int((1800 + lv * 350) * 7.5)), "E01_angler_hp_source_formula:%s" % hp0) # 60985 _fbHp, _FB_HP_MUL 7.5
	for i in range(4):
		var fb: Dictionary = g._fieldBosses[i]
		check(Vector2(fb.x, fb.y) == ang._markers[i].global_position and fb.asleep == 1 and fb.hid == 1 and fb.el == [2, 1, 3, 4][i], "E01_angler_%d_site_sleep_element" % i)
	# 깨어남 61069–61073: 1000 안 → tpT 54 → 등장
	var m0: Vector2 = ang._markers[0].global_position
	main.player.global_position = m0 + Vector2(520, -80)
	await physics_frame
	await physics_frame
	check(g._fieldBosses[0].asleep == 0 and g._fieldBosses[0].tpT > 0, "E01_wake_within_1000")
	for i in range(56):
		_keep_alive()
		await physics_frame
	check(g._fieldBosses[0].hid == 0 and g._fieldBosses[0].tpT == 0, "E01_appears_after_tp54")
	# 몸 충돌 61081–61082: 플레이어를 몸 안으로 → 밀려남 + iframes 0 이면 접촉 피해
	main.player.iframes = 0.0
	var php: float = main.player.hp
	main.player.global_position = m0 + Vector2(30, 0)
	await physics_frame
	await physics_frame
	var a_snap: Dictionary = owner.snapshot().angler
	var dpush: float = main.player.global_position.distance_to(Vector2(g._fieldBosses[0].x, g._fieldBosses[0].y))
	print("PCPARITY_BODY ", JSON.stringify({"angler": a_snap, "dist": dpush, "php_before": php, "php_after": main.player.hp, "blocked": ang.snapshot().blocked}))
	check(int(a_snap.body_push) >= 1 and dpush >= 120.0 + float(main.player.radius) - 0.01, "E01_body_pushes_player_out")
	check(int(a_snap.body_hurt) >= 1 and main.player.hp < php, "E01_body_contact_damage")
	check(ang.snapshot().blocked.is_empty(), "E01_no_family_block")
	# 근접(hitArc 37646) 으로 4마리 처치 — fixture: HP 60
	for idx in range(4):
		var fb_live: Variant = g._fieldBosses[idx]
		if not fb_live is Dictionary: continue
		main.player.global_position = ang._markers[idx].global_position + Vector2(0, 300)
		for i in range(70):
			_keep_alive()
			await physics_frame
		if g._fieldBosses[idx] is Dictionary: g._fieldBosses[idx].hp = 60.0
		var at_idx: int = idx
		await _melee_until(func() -> Vector2: return Vector2(g._fieldBosses[at_idx].x, g._fieldBosses[at_idx].y) if g._fieldBosses[at_idx] is Dictionary else main.player.global_position,
			150.0, 900, func() -> bool: return not g._fieldBosses[at_idx] is Dictionary)
		check(not g._fieldBosses[idx] is Dictionary, "E01_angler_%d_killed" % idx)
	var o_snap: Dictionary = owner.snapshot()
	print("PCPARITY_E01 ", JSON.stringify({"owner": o_snap, "fbDone": g.get("_fbDone"), "family_defeated": family_defeated, "ang": ang.snapshot()}))
	check(int(o_snap.melee.applied) >= 1 and int(o_snap.counts.final_deaths) == 4, "E01_melee_route_final_deaths") # 자동 석궁(펫)이 같은 owner 로 막타를 칠 수 있다
	check(g.get("_fbDone") == true and family_defeated == 1, "E01_fbDone_after_four")

	# ── 지옥문: 앵글러 끝 → 지역 4곳(fixture) → _bossUnlocked → gate ──
	var sites: Dictionary = main.read_native_map11_provider().transition_sites()
	main.player.global_position = sites.field_gate.global_position
	for i in range(65):
		_keep_alive()
		await physics_frame
	var es: Dictionary = entry.snapshot()
	check(int(es.counters.gate_locked_regions) >= 1 and es.phase == 0 and main.native_map11.snapshot().space == "field", "B01_gate_locked_until_regions:%s" % JSON.stringify(es.counters))
	for region in g._regions: region.cleared = true
	var regions: Node = main.get_node("NativeRegions")
	regions.set("_last_frame", -1.0)
	regions._physics_process(0)
	check(g.get("_bossUnlocked") == true and gate_ready == 1, "B01_gate_unlocked")

	# ── B-01: 로딩 상태 머신 41784–41813 (1:50 → 2:130 → 3:50 → 4:100) ──
	var phases := {}
	var swap_t := -1
	var spawn_receipt := {}
	var en_field: int = main.world.get_enemies().size()
	var t := 0
	var last := 0
	var boss_stun_seen := -1.0
	var hurt_blocked_php: float = main.player.hp
	while t < 500:
		_keep_alive()
		await physics_frame
		t += 1
		var ph: int = int(entry.snapshot().phase)
		if ph != last:
			phases[str(ph)] = t
			if ph == 2: swap_t = t
			if ph == 4 or (last == 4 and ph == 0): pass
			last = ph
		if ph == 4 and boss_stun_seen < 0 and float(main.native_demo_boss_core.E.get("stunned", 0)) > 0:
			boss_stun_seen = float(main.native_demo_boss_core.E.stunned)
		if t > 30 and ph == 0 and phases.has("4"): break
	print("PCPARITY_LOAD ", JSON.stringify({"phases": phases, "entry": entry.snapshot(), "space": main.native_map11.snapshot().space}))
	check(phases.has("1") and phases.has("2") and phases.has("3") and phases.has("4") and phases.has("0"), "B01_all_load_phases")
	if phases.has("2") and phases.has("3") and phases.has("4") and phases.has("0"):
		check(int(phases["2"]) - int(phases["1"]) == 50, "B01_fade_out_50:%d" % (int(phases["2"]) - int(phases["1"])))
		check(int(phases["3"]) - int(phases["2"]) == 130, "B01_namecard_130:%d" % (int(phases["3"]) - int(phases["2"])))
		check(int(phases["4"]) - int(phases["3"]) == 50, "B01_fade_in_50:%d" % (int(phases["4"]) - int(phases["3"])))
		check(int(phases["0"]) - int(phases["4"]) == 100, "B01_intro_100:%d" % (int(phases["0"]) - int(phases["4"])))
	check(main.native_map11.snapshot().space == "arena" and g.get("_bossArena") == true and main.native_demo_encounter.snapshot().phase == "arena", "B01_arena_entered")
	var bsnap: Dictionary = main.read_native_demo_boss()
	var E: Dictionary = main.native_demo_boss_core.E
	# mkEn(…,si0,etype0,ib,STG[0].be,room0) — OPT.diff·P.lv·G._stageDiffOff
	var opt: Dictionary = main.source_initialization_services.read_current_options()
	check(bsnap.status == "READY" and int(E.etype) == 0 and int(E.room) == 0 and E.ib == true and float(E.lv) == maxf(1.0, lv + [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500][int(opt.diff)] + float(g.get("_stageDiffOff", 0))), "B01_spawn_args_source")
	var others: Array = []
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e != core0_body(): others.append({"etype": e.get("etype"), "pos": str(e.global_position), "script": str(e.get_script().resource_path) if e.get_script() else ""})
	print("PCPARITY_ARENA_ENEMIES ", JSON.stringify(others))
	check(en_field >= 1 and others.is_empty() and g.get("spawnHoles") is Array and g.spawnHoles.is_empty(), "B01_field_enemies_cleared_ens_empty:%d" % main.world.get_enemies().size())
	check(boss_stun_seen >= 88.0, "B01_intro_boss_stunned90:%s" % boss_stun_seen)
	check(int(entry.snapshot().counters.intro_hits) == 1 and int(entry.snapshot().counters.arena_swaps) == 1, "B01_intro_once_swap_once")

	# ── B-02: 자연 AI 900틱(플레이어 정지) — 보스 몸통 충돌 34349·패턴 진행(겹침으로 d<20 정지 회귀 방지) ──
	var core0: Node = main.native_demo_boss_core
	var hist := {}
	var min_d := 1e9
	var stall := 0
	var max_stall := 0
	for i in range(900):
		_keep_alive()
		await physics_frame
		var st: String = str(core0.E.get("s", ""))
		hist[st] = int(hist.get(st, 0)) + 1
		if core0.E.get("alive") == true:
			var dd: float = main.player.global_position.distance_to(Vector2(core0.E.x, core0.E.y))
			min_d = minf(min_d, dd)
			stall = stall + 1 if st == "idle" and dd < 20.0 else 0
			max_stall = maxi(max_stall, stall)
	var attack_states := 0
	for k in hist.keys():
		if str(k).begins_with("boss"): attack_states += 1
	print("PCPARITY_AI ", JSON.stringify({"hist": hist, "min_d": min_d, "max_idle_overlap_stall": max_stall, "body_push": core0.counters.body_push}))
	check(int(core0.counters.body_push) > 0 and max_stall < 60, "B02_body_collision_no_overlap_stall:%d" % max_stall) # 분출(erupt) 등은 원본도 순간 d≈0
	check(attack_states >= 3 and int(hist.get("idle", 0)) < 700, "B02_patterns_progress:%s" % JSON.stringify(hist))
	# ── 보스 처치 → 출구 → 클리어 (fixture: 정본 E 수치만) ──
	E.hp = 30.0; E.eShield = 0.0; E._revPts = 10.0; E.reviveIframes = 0.0; E._bossPhase = 4; E.deaths = 1
	var core: Node = main.native_demo_boss_core
	await _melee_until(func() -> Vector2: return core.body.global_position, 70.0, 900, func() -> bool: return core.E.get("alive") != true)
	var waited := 0
	while waited < 400 and finals.is_empty():
		_keep_alive()
		await physics_frame
		waited += 1
	for i in range(40):
		_keep_alive()
		await physics_frame
	print("PCPARITY_DEATH ", JSON.stringify({"boss": core.snapshot().boss, "finals": finals.size(), "enc": main.native_demo_encounter.snapshot().phase, "bossAlive": g.get("bossAlive")}))
	check(finals.size() == 1 and main.native_demo_encounter.snapshot().phase == "exit" and g.get("bossAlive") == false, "B01_final_death_exit_open")
	# 출구(41926~): 아레나 출구 접촉 + 30호출 cadence → encounter.leave → 클리어
	main.player.global_position = sites.arena_exit.global_position
	var leave_t := 0
	while leave_t < 120 and cleared.is_empty():
		_keep_alive()
		await physics_frame
		leave_t += 1
	print("PCPARITY_CLEAR ", JSON.stringify({"leave_t": leave_t, "cleared": cleared.size(), "defeated": defeated, "entry": entry.snapshot().counters}))
	check(cleared.size() == 1 and defeated == [0] and leave_t <= 31, "B01_exit_clear_on_30_cadence:%d" % leave_t)
	print("PCPARITY_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures}))
	main.free()
	quit(1 if failures else 0)
