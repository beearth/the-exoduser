extends SceneTree
## PC-BOSS-PARITY (2026-10-22) — 웹과 나란히 비교할 Godot 보스 장면 캡처(창 모드 1920×1080, 제품 코드 수정 0).
## 실행: Godot(창) --audio-driver Dummy --resolution 1920x1080 --script res://tests/capture_pc_boss_parity.gd -- --out=<dir>
## 웹 캡처(_out/pc-boss-parity/scripts/web_boss_capture.cjs)와 같은 순서·같은 fixture:
##   필드보스 마커0+(520,-80) 순간이동 / _fbDone·지역 4곳 cleared(웹: G._fbDone·_bossUnlocked) / 플레이어 무적 유지 /
##   보스 정본 E HP·쉴드·부활력 낮춤(웹: hurtE 반복·필드값). 보스 패턴은 주입하지 않고 자연 발생을 기다려 상태 이름으로 짝짓는다.
const USERDIR := "EXODUSER-pc-boss-parity-Isolated-20261022"
const PATTERN_STATES := ["bossSlamWind", "bossSlashWind", "bossSweepWind", "bossChargeWind", "bossJumpWind", "bossSpinWind",
	"bossShockWind", "bossGrabWind", "bossDruidUnder", "bossMultiDashWind", "bossBurstWind", "bossFanWind", "bossMineWind", "bossSummonWind"]
var main: Node
var out := ""
var rows: Array = []

func _initialize() -> void:
	create_timer(600).timeout.connect(func(): print("PCCAP_WATCHDOG"); quit(2))
	call_deferred("_run")

func L(k: String, v: Variant = null) -> void:
	rows.append({"k": k, "v": v})
	print("PCCAP ", k, " ", JSON.stringify(v))

func secs(s: float) -> void:
	await create_timer(s, true, false, true).timeout

func shot(name: String) -> void:
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(out.path_join(name + ".png"))
	L("shot", name)

func god() -> void:
	main.player.iframes = maxf(main.player.iframes, 60.0)
	main.player.hp = main.player.max_hp
	main.player.set("stamina", maxf(float(main.player.get("stamina")), 100.0))

func _press(action: String, pressed: bool) -> void:
	var ev := InputEventAction.new(); ev.action = action; ev.pressed = pressed
	main.player.handle_native_input_event(ev)

func _aim_at(world_pos: Vector2) -> void:
	var cam: Camera2D = main.get("camera")
	var mm := InputEventMouseMotion.new()
	mm.position = Vector2(960, 540) + (world_pos - cam.get_screen_center_position()) * cam.zoom
	main.player.handle_native_input_event(mm)

func _boss() -> Dictionary:
	return main.native_demo_boss_core.E

func _run() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="): out = a.trim_prefix("--out=")
	if not OS.get_user_data_dir().ends_with(USERDIR) or out.is_empty() or DisplayServer.get_name() == "headless":
		print("PCCAP refuse"); quit(3); return
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080)
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	main.source_intro_sequence.finish_native_guide()
	main.source_state.read_current_g().on = true
	for i in range(65): await physics_frame
	main.source_intro_sequence.lesson_flow.skip_all()
	await secs(0.8)
	var g: Dictionary = main.source_state.read_current_g()
	var ang: Node = main.native_demo_anglers
	var entry: Node = main.native_demo_boss_entry
	# ── 09 필드보스 ──
	main.player.global_position = ang._markers[0].global_position + Vector2(520, -80)
	god(); await secs(3.5); await shot("09a_fieldboss")
	god(); await secs(2.5); await shot("09b_fieldboss_t6s")
	L("anglers", ang.snapshot())
	# ── 10 지옥문(fixture: _fbDone·지역 cleared) ──
	g._fbDone = true
	for region in g._regions: region.cleared = true
	var regions: Node = main.get_node("NativeRegions")
	regions.set("_last_frame", -1.0); regions._physics_process(0)
	var sites: Dictionary = main.read_native_map11_provider().transition_sites()
	main.player.global_position = sites.field_gate.global_position + Vector2(0, 260)
	god(); await secs(1.5); await shot("10_gate")
	# ── 10a 진입: 실제 문 접촉 → 로딩 상태 머신 ──
	main.player.global_position = sites.field_gate.global_position
	var want := {1: [25.0, "10a_entry_fadeout"], 2: [60.0, "10a_entry_namecard"], 3: [25.0, "10a_entry_fadein"], 4: [5.0, "10a_entry_intro"]}
	var done := {}
	var guard := 0
	while guard < 900:
		god()
		await physics_frame
		guard += 1
		var s: Dictionary = entry.snapshot()
		var ph: int = int(s.phase)
		if want.has(ph) and not done.has(ph) and float(s.t) >= float(want[ph][0]):
			done[ph] = true
			await shot(want[ph][1])
		if done.has(4) and ph == 0: break
	L("entry", entry.snapshot())
	god(); await secs(1.0); await shot("10b_arena")
	# ── 10d 보스 근접 ──
	var bp := Vector2(_boss().x, _boss().y)
	# 웹과 같은 fixture(보스+(0,380)). 그 점이 아레나 밖이면 아레나 중심 쪽 380 지점(밖으로 내보내면 AI 가 플레이어에 닿지 못한다).
	var near: Vector2 = bp + Vector2(0, 380)
	if not main.world.can_move(near, float(main.player.radius)):
		near = bp + (sites.boss.global_position - bp).normalized() * 380.0 if bp.distance_to(sites.boss.global_position) > 1.0 else bp + Vector2(0, -380)
	main.player.global_position = near
	L("close_fixture", {"boss": [bp.x, bp.y], "player": [near.x, near.y]})
	god(); await secs(1.0); await shot("10d_boss_close")
	# ── 10e 패턴(자연 발생, 상태 이름으로 짝) ──
	var seen := {}
	var hist := {}
	var cur := ""
	var in_state := 0
	var t := 0
	while t < 60 * 70 and seen.size() < 7:
		god()
		await physics_frame
		t += 1
		var st: String = str(_boss().get("s", ""))
		hist[st] = int(hist.get(st, 0)) + 1
		if st != cur:
			cur = st; in_state = 0
		in_state += 1
		if st in PATTERN_STATES and not seen.has(st) and in_state == 20:
			seen[st] = t
			await shot("10e_pattern_" + st)
	L("patterns", {"seen": seen, "hist": hist})
	# ── 10f 피격(근접 연타) ──
	var core: Node = main.native_demo_boss_core
	var hits0: int = int(core.counters.boss_hits)
	t = 0
	var hit_shot := false
	while t < 600 and not hit_shot:
		var at: Vector2 = core.body.global_position
		var to: Vector2 = at - main.player.global_position
		_aim_at(at)
		var close: bool = to.length() < 70.0
		_press("move_up", not close and to.y < -30); _press("move_down", not close and to.y > 30)
		_press("move_left", not close and to.x < -30); _press("move_right", not close and to.x > 30)
		god()
		if close and t % 12 == 0: _press("weapon", true)
		elif close and t % 12 == 4: _press("weapon", false)
		await physics_frame
		t += 1
		if int(core.counters.boss_hits) > hits0 + 1:
			for i in range(4): await physics_frame
			await shot("10f_boss_hit")
			hit_shot = true
	for a in ["move_up", "move_down", "move_left", "move_right", "weapon"]: _press(a, false)
	# ── 10g 1차 부활(fixture: E hp·쉴드) ──
	var E: Dictionary = _boss()
	var revives0: int = int(core.counters.immediate_revives)
	E.hp = 30.0; E.eShield = 0.0; E.reviveIframes = 0.0; E._bossPhase = 4
	t = 0
	while t < 600 and int(core.counters.immediate_revives) == revives0:
		var at2: Vector2 = core.body.global_position
		var to2: Vector2 = at2 - main.player.global_position
		_aim_at(at2)
		var close2: bool = to2.length() < 70.0
		_press("move_up", not close2 and to2.y < -30); _press("move_down", not close2 and to2.y > 30)
		_press("move_left", not close2 and to2.x < -30); _press("move_right", not close2 and to2.x > 30)
		god()
		if close2 and t % 12 == 0: _press("weapon", true)
		elif close2 and t % 12 == 4: _press("weapon", false)
		await physics_frame
		t += 1
	for a in ["move_up", "move_down", "move_left", "move_right", "weapon"]: _press(a, false)
	for i in range(5): await physics_frame
	await shot("10g_revive_0")
	god(); await secs(0.6); await shot("10g_revive_1")
	L("revive", core.snapshot().boss)
	# ── 11c 완전 사망 → 출구·보상 ──
	E = _boss()
	E.hp = 30.0; E.eShield = 0.0; E._revPts = 10.0; E.reviveIframes = 0.0; E._bossPhase = 4
	t = 0
	while t < 900 and main.native_demo_encounter.snapshot().phase != "exit":
		var at3: Vector2 = core.body.global_position
		var to3: Vector2 = at3 - main.player.global_position
		_aim_at(at3)
		var close3: bool = to3.length() < 70.0
		var alive: bool = core.E.get("alive") == true
		_press("move_up", alive and not close3 and to3.y < -30); _press("move_down", alive and not close3 and to3.y > 30)
		_press("move_left", alive and not close3 and to3.x < -30); _press("move_right", alive and not close3 and to3.x > 30)
		god()
		if alive and close3 and t % 12 == 0: _press("weapon", true)
		elif t % 12 == 4: _press("weapon", false)
		await physics_frame
		t += 1
	for a in ["move_up", "move_down", "move_left", "move_right", "weapon"]: _press(a, false)
	god(); await secs(1.5); await shot("11c_boss_killed_exit")
	L("death", {"boss": core.snapshot().boss, "enc": main.native_demo_encounter.snapshot().phase, "bossAlive": g.get("bossAlive")})
	main.player.global_position = sites.arena_exit.global_position + Vector2(0, 200)
	god(); await secs(1.0); await shot("11c_exit_view")
	main.player.global_position = sites.arena_exit.global_position
	for k in range(4):
		god(); await secs(1.0); await shot("11d_stage_clear_%d" % k)
	L("end_flow", main.native_demo_end_flow.get_snapshot() if is_instance_valid(main.get("native_demo_end_flow")) else {})
	var f := FileAccess.open(out.path_join("godot_capture_log.json"), FileAccess.WRITE)
	f.store_string(JSON.stringify(rows, "\t")); f.close()
	main.free()
	quit(0)
