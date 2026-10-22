extends SceneTree
## PC-MOVE-SKILLS — Shift 사슬 이동(V-02)·방향+Space 전격이동(V-01) 회귀 (실제 Main 부팅 + 원본 Node VM oracle 대조).
## 원본 대조: tests/pc_move_skills_source_oracle.cjs 가 고정 스냅샷 game.html의 keydown/keyup/S16b/switch 조각을
##   손대지 않고 한 VM 프로그램으로 실행한다. 벽(canMv/canMvBlink)·조준(_aimDir)·shQuery 결과는 Godot이 실제로
##   질의·응답한 값을 같은 순서로 공급하고, 원본이 실제로 질의한 좌표 순서를 Godot 질의와 대조한다.
## 프레임 정렬: 이벤트는 프레임 f의 physics_frame 신호 직후(그 프레임 물리 전)에 넣는다 = 원본 keydown이 update() 사이.
## 테스트 개입(forced 집계): 위치 배치·자원 충전(stage_entry_refill)·게이지 값·적 배치/기절·경직/기절 상태 강제·시계 주입.
## 격리 사용자 폴더(USERDIR) 필수 — 아니면 SKIP. 인자: --node-bin=<node.exe> --artifacts-dir=<dir>
const USERDIR := "EXODUSER-pc-move-skills-Isolated-20261022"
const GAME_SHA256 := "dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209"
const SNAPSHOT := preload("res://source_snapshot/snapshot.gd")
const POS_TOL := 2e-3
const GROUPS := ["setup", "chain_tier1", "chain_tier2", "chain_tier3_auto_refire", "chain_wall_autofire", "chain_cancel",
	"chain_hit_enemy", "gauge_empty_toast", "blade_dash_dir_then_space", "blade_dash_space_then_dir", "blade_dash_double_tap",
	"blade_dash_diagonal", "blade_dash_wall", "blade_dash_insufficient", "stagger_escape_shift", "pstun_blade_escape",
	"focus_blur_clears_hold", "oracle_compare", "input_priority_space", "lesson_lock", "render_pose", "perf"]

var main: Node
var world: Node2D
var player: Node2D
var state: Node
var ms: Node
var assertions := 0
var failures := 0
var skipped: Array = []
var current_group := ""
var rows: Array = []
var forced := 0
var node_bin := ""
var artifacts_dir := ""
var observations: Dictionary = {}
var cases: Array = [] # oracle cases (Godot 측 기록 포함)
var origin := Vector2.ZERO # 열린 바닥 기준점
var wall_dir := 0.0
var wall_hit := 0.0
var fake_now := 0.0

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
		elif arg.begins_with("--artifacts-dir="): artifacts_dir = arg.trim_prefix("--artifacts-dir=")
	seed(20261022)
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("PMS_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var a0 := assertions
		var f0 := failures
		await call("_test_" + group)
		var row := {"group": group, "assertions": assertions - a0, "failures": failures - f0}
		rows.append(row)
		print("PMS_GROUP ", JSON.stringify(row))
	_cleanup()
	var result := {"groups": rows, "assertions": assertions, "failures": failures, "skipped": skipped, "forced_test_fields": forced, "observations": observations}
	if not artifacts_dir.is_empty():
		DirAccess.make_dir_recursive_absolute(artifacts_dir)
		var f := FileAccess.open(artifacts_dir.path_join("pc_move_skills_result.json"), FileAccess.WRITE)
		if f != null:
			f.store_string(JSON.stringify(result, "  "))
			f.close()
	print("PMS_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions, "failures": failures, "skipped": skipped, "forced_test_fields": forced}))
	quit(1 if failures > 0 or assertions == 0 else 0)

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PMS_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(main):
		if main.get_parent() != null:
			main.get_parent().remove_child(main)
		main.free()

# ── 입력 ─────────────────────────────────────────────────────────────────────
func _key_event(code: int, pressed: bool, echo := false) -> InputEventKey:
	var e := InputEventKey.new()
	e.physical_keycode = code
	e.keycode = code
	e.pressed = pressed
	e.echo = echo
	if code == KEY_SHIFT: e.location = KEY_LOCATION_LEFT
	return e

func _send_key(code: int, pressed: bool) -> Dictionary:
	return player.handle_native_input_event(_key_event(code, pressed))

var _aim_target := Vector2.ZERO
func _test_pointer() -> Dictionary:
	return {"ready": true, "world": _aim_target}
func _aim_world(target: Vector2) -> void:
	# 실제 포인터 경로: 화면 좌표 마우스 이동 → player funnel(_native_pointer_screen) → 지면 포인터 provider(원근 카메라 역투영)
	_aim_target = target
	var screen: Vector2 = player.get_viewport().get_canvas_transform() * target
	var view: Variant = main.get("native_perspective_view")
	if is_instance_valid(view):
		var projected: Dictionary = view.world_to_screen(target)
		if projected.get("ready") == true: screen = projected.screen
	var m := InputEventMouseMotion.new()
	m.position = screen
	m.global_position = screen
	player.handle_native_input_event(m)

const CODE_NAMES := {KEY_SHIFT: "ShiftLeft", KEY_SPACE: "Space", KEY_W: "KeyW", KEY_A: "KeyA", KEY_S: "KeyS", KEY_D: "KeyD"}

# ── 시나리오 실행 ─────────────────────────────────────────────────────────────
## events: [{f, type: down/up/blur/state/aim/clock, code, s, st2, target, t}]
func _scenario(name: String, start: Vector2, gauge: float, frames: int, events: Array, aim_target: Vector2, hook: Callable = Callable(), flags: Dictionary = {}) -> Dictionary:
	_prepare(start, gauge)
	if hook.is_valid(): hook.call()
	_aim_world(aim_target)
	await physics_frame
	await physics_frame
	await physics_frame # 프레임 0 물리 직전: 여기서 배치·캡처하고 같은 틱에 이벤트를 넣는다
	_prepare(start, gauge)
	if hook.is_valid(): hook.call()
	_aim_world(aim_target)
	var p: Dictionary = state.read_current_p()
	var init_p := {"x": player.global_position.x, "y": player.global_position.y, "r": float(player.radius), "s": str(player.state),
		"st": float(player.stamina), "mst": float(p.get("mst")), "mp": float(p.get("mp")), "mmp": float(p.get("mmp")),
		"baseAtk": float(p.get("baseAtk")), "skills": p.get("skills"), "activeChargeSk": p.get("activeChargeSk"),
		"_fused": p.get("_fused"), "iframes": float(player.iframes), "poise": int(player.poise), "facing": player.facing.angle(), "st2": 0}
	var inv: Dictionary = state.read_current_inventory()
	var equipped := {"armor": inv.equipped.get("armor")}
	ms.reset_probe()
	ms.log_rows.clear()
	ms.probe_on = true
	var trace: Array = []
	var ev_out: Array = []
	var pending: Array = events.duplicate(true)
	for f in range(frames + 1):
		if f > 0:
			await physics_frame # 프레임 f 물리 직전 (f−1 물리 완료)
			var s: Dictionary = ms.get_snapshot()
			trace.append({"f": f - 1, "x": player.global_position.x, "y": player.global_position.y, "iframes": float(player.iframes),
				"s": str(player.state), "gauge": s.gauge, "gauge_max": s.gauge_max, "harp": s.harp_active, "dash": s.dash_active,
				"harp_dist": s.harp_dist, "harp_max": s.harp_max_dist, "harp_x": s.harp_pos.x, "harp_y": s.harp_pos.y, "harp_hit": s.harp_hit,
				"dash_left": s.dash_left, "dash_tier": s.dash_tier, "dash_hold": s.dash_hold, "dash_hold_f": s.dash_hold_f, "harp_tier": s.harp_tier,
				"dash_iframe": s.dash_iframe, "bd_move_t": s.bd_move_t, "bd_trigger": s.bd_trigger, "poise": int(player.poise),
				"st": float(player.stamina), "mp": float(state.read_current_p().get("mp"))})
		if f == frames:
			break
		while not pending.is_empty() and int(pending[0].f) == f:
			var ev: Dictionary = pending.pop_front()
			match str(ev.type):
				"down", "up":
					fake_now = float(ev.get("t", fake_now))
					if ev.type == "down": _aim_world(_aim_target) # 카메라 추종 후 같은 지면 목표로 재조준
					var r: Dictionary = _send_key(int(ev.code), ev.type == "down")
					ev_out.append({"frame": f, "type": ev.type, "code": CODE_NAMES[int(ev.code)], "t_ms": fake_now, "handled": r.get("handled"), "action": r.get("action")})
				"blur":
					player.notification(Node.NOTIFICATION_APPLICATION_FOCUS_OUT)
					ev_out.append({"frame": f, "type": "blur"})
				"state":
					player.state = str(ev.s)
					player.set("_state_left", float(ev.get("st2", 0)))
					forced += 1
					ev_out.append({"frame": f, "type": "set_state", "s": str(ev.s), "st2": float(ev.get("st2", 0))})
	ms.probe_on = false
	var probe: Dictionary = ms.probe.duplicate(true)
	var log: Array = ms.log_rows.duplicate(true)
	var canmv_results: Array = []
	for q in probe.canmv: canmv_results.append(q[3])
	var case_row := {"name": name, "P": init_p, "equipped": equipped, "gauge": gauge, "frames": frames, "events": ev_out,
		"aim": probe.aim, "canmv": canmv_results, "shq": probe.shq, "affix": {}, "unique": {}, "legend": {}, "passives": {"pCharge": 0},
		"_godot": {"trace": trace, "canmv_q": probe.canmv, "log": log, "flags": flags}}
	cases.append(case_row)
	return case_row

func _prepare(pos: Vector2, gauge: float) -> void:
	state.apply_native_stage_entry_refill(main)
	player.state = "idle"
	player.iframes = 0.0
	player.poise = 4
	player.global_position = pos
	player.velocity = Vector2.ZERO
	player.set("_knockback", Vector2.ZERO)
	player.clear_native_input_states()
	ms.clear_held_input()
	ms.harp_gauge = gauge
	ms.dash_hold = false; ms.dash_hold_f = 0.0; ms.dash_tier = 0; ms.dash_active = false; ms.harp_active = false
	ms.harp_hit = false; ms.dash_left = 0.0; ms.dash_iframe = 0.0; ms.dash_phase = 0; ms.harp_land_t = 0.0; ms.harp_tier = 0
	ms.bd_trigger = null; ms.bd_move_t = 0.0; ms.bd_last_dir = -1; ms.bd_last_t = 0.0; ms.pre_bd_state = null
	ms.dash_v = Vector2.ZERO; ms.harp_v = Vector2.ZERO; ms.harp_pos = Vector2.ZERO; ms.harp_dist = 0.0; ms.harp_max_dist = 0.0
	ms.chain_sk_delay = 0.0; ms.harp_hits = []
	_park_enemies(pos, 1400.0)
	forced += 3

func _park_enemies(pos: Vector2, radius: float) -> void:
	for e in world.get_enemies():
		if is_instance_valid(e) and e is Node2D and (e as Node2D).global_position.distance_to(pos) < radius:
			(e as Node2D).global_position = pos + Vector2(4000, 4000)
			forced += 1

func _last(log: Array, kind: String) -> Dictionary:
	for i in range(log.size() - 1, -1, -1):
		if log[i].k == kind: return log[i]
	return {}

func _first(log: Array, kind: String) -> Dictionary:
	for r in log:
		if r.k == kind: return r
	return {}

func _count(log: Array, kind: String) -> int:
	var n := 0
	for r in log: if r.k == kind: n += 1
	return n

func _trace_at(c: Dictionary, f: int) -> Dictionary:
	for r in c._godot.trace:
		if int(r.f) == f: return r
	return {}

# ── 그룹 ────────────────────────────────────────────────────────────────────
func _test_setup() -> void:
	var packed: Variant = load("res://scenes/main.tscn")
	check(packed is PackedScene, "main_scene_loads")
	check(SNAPSHOT.SHA256 == GAME_SHA256 and FileAccess.get_sha256(ProjectSettings.globalize_path(SNAPSHOT.PATH)) == GAME_SHA256, "source_snapshot_pinned")
	main = packed.instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	for i in range(10): await physics_frame
	world = main.get("world")
	player = main.get("player")
	state = main.get("source_state")
	ms = main.get("native_move_skills")
	check(is_instance_valid(ms) and ms.is_configured(), "move_skills_owner_installed")
	check(player.get_native_move_skills() == ms, "player_bound_to_owner")
	check(ms.get_index() < player.get_index(), "owner_before_player_in_tree(render under layer)")
	var seq: Node = main.get("source_intro_sequence")
	if is_instance_valid(seq): seq.finish_native_guide()
	for i in range(240):
		await physics_frame
		if is_instance_valid(seq) and is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active:
			seq.lesson_flow.skip_all()
			break
	for i in range(20): await physics_frame
	check(state.read_current_g().get("on") == true, "G.on_after_intro")
	# 헤드리스: 원근 뷰 지면 포인터가 없으면(렌더 없음) 테스트 포인터를 결합 — 조준 목표 = _aim_target (forced)
	observations["ground_pointer_bound_by_product"] = player.get("_native_ground_pointer_bound") == true
	if player.get("_native_ground_pointer_bound") != true:
		check(player.bind_native_ground_pointer(Callable(self, "_test_pointer")), "test_ground_pointer_bound")
		forced += 1
	check(InputMap.has_action("charge"), "binds_charge_action_registered")
	var binds: Dictionary = main.read_native_input_bindings()
	check(binds.primary.get("charge") == "ShiftLeft" and binds.primary.get("bow") == "Space", "binds_match_web_BINDS(charge ShiftLeft, bow Space)")
	check((binds.supported as Array).has("shift_chain_movement") and (binds.supported as Array).has("direction_space_blade_dash"), "binds_supported_move_skills")
	check((binds.unsupported as Array).has("space_rage_slot"), "space_rage_slot_still_listed_unsupported(분노 슬롯 자체는 미이식)")
	var p: Dictionary = state.read_current_p()
	check(float((p.skills as Dictionary).get("bladeDash", 0)) >= 1.0, "new_run_has_bladeDash")
	check(str(p.get("activeChargeSk")) == "charge", "activeChargeSk_charge")
	check(ms.harp_gauge_max == 225.0, "gauge_max_225(5칸×45)")
	# 열린 바닥: 24방향×800px 전부 이동 가능한 지점 탐색
	var found := false
	var spawn: Vector2 = player.global_position
	for ring in range(0, 30):
		for k in range(12):
			var cand: Vector2 = spawn + Vector2.from_angle(TAU * k / 12.0) * (ring * 160.0)
			if _open(cand, 820.0):
				origin = cand
				found = true
				break
		if found: break
	check(found, "open_floor_found")
	# 벽 방향: origin 근처에서 100~240px 앞에 벽이 있는 방향 + 그 앞이 열린 지점
	var wall_found := false
	for ring in range(0, 40):
		for k in range(16):
			var cand: Vector2 = spawn + Vector2.from_angle(TAU * k / 16.0) * (ring * 120.0)
			if not world.can_move(cand, 15.0): continue
			for d in range(32):
				var ang: float = TAU * d / 32.0
				var dist := 16.0
				while dist <= 300.0:
					if not world.can_move(cand + Vector2.from_angle(ang) * dist, 2.0): break
					dist += 16.0
				if dist >= 120.0 and dist <= 240.0:
					observations["wall_origin"] = [cand.x, cand.y]
					wall_dir = ang
					wall_hit = dist
					observations["wall"] = {"dir": ang, "hit": dist}
					wall_found = true
					break
			if wall_found:
				observations["wall_pos"] = cand
				break
		if wall_found: break
	check(wall_found, "wall_ray_found")
	observations["origin"] = [origin.x, origin.y]

func _open(c: Vector2, radius: float) -> bool:
	if not world.can_move(c, 15.0): return false
	for k in range(24):
		var dir := Vector2.from_angle(TAU * k / 24.0)
		var d := 16.0
		while d <= radius:
			if not world.can_move(c + dir * d, 15.0): return false
			d += 32.0
	return true

func _test_chain_tier1() -> void:
	var c: Dictionary = await _scenario("chain_tier1", origin, 225.0, 16,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 2, "type": "up", "code": KEY_SHIFT}], origin + Vector2(400, 0))
	var log: Array = c._godot.log
	var fire: Dictionary = _last(log, "chain_fire")
	check(fire.get("tier") == 1 and fire.get("site") == "release", "tier1_release_fire")
	check(is_equal_approx(float(fire.get("g_cost", 0)), 45.0), "tier1_gauge_cost_45")
	check(is_equal_approx(float(fire.get("max_dist", 0)), 300.0), "tier1_range_300")
	check(is_equal_approx(float(fire.get("st_cost", 0)), float(c.P.mst) * 0.01), "tier1_st_cost_mst_1pct")
	var land: Dictionary = _last(log, "chain_land")
	check(not land.is_empty(), "tier1_landed")
	var moved: float = Vector2(float(land.get("x", 0)), float(land.get("y", 0))).distance_to(origin)
	check(absf(moved - 300.0) < 0.05, "tier1_moved_300px:" + str(moved))
	observations["chain_tier1"] = {"moved": moved, "fire_frame": fire.get("f"), "land_frame": land.get("f")}
	var t_land: Dictionary = _trace_at(c, 12)
	check(float(t_land.get("iframes", 0)) == 47.0, "landing_iframes_48_minus_decrement:" + str(t_land.get("iframes")))

func _test_chain_tier2() -> void:
	var c: Dictionary = await _scenario("chain_tier2", origin, 225.0, 34,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 8, "type": "up", "code": KEY_SHIFT}], origin + Vector2(0, -400))
	var fire: Dictionary = _last(c._godot.log, "chain_fire")
	check(fire.get("tier") == 2 and is_equal_approx(float(fire.get("g_cost", 0)), 98.0), "tier2_cost_98")
	check(is_equal_approx(float(fire.get("max_dist", 0)), 500.0), "tier2_range_500")
	var land: Dictionary = _last(c._godot.log, "chain_land")
	var moved: float = Vector2(float(land.get("x", 0)), float(land.get("y", 0))).distance_to(origin)
	check(absf(moved - 500.0) < 0.1, "tier2_moved_500px:" + str(moved))
	observations["chain_tier2"] = {"moved": moved}

func _test_chain_tier3_auto_refire() -> void:
	# 12프레임 홀드 자동 3단 → 착지 후 Shift 계속 → 3단 재발사(게이지 잔량 비례)
	var c: Dictionary = await _scenario("chain_tier3_auto_refire", origin + Vector2(-350, 0), 225.0, 60,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 50, "type": "up", "code": KEY_SHIFT}], origin + Vector2(400, 0))
	var fires: Array = []
	for r in c._godot.log: if r.k == "chain_fire": fires.append(r)
	check(fires.size() == 2, "auto3_then_refire_two_fires:" + str(fires.size()))
	if fires.size() >= 1:
		check(fires[0].site == "auto3" and int(fires[0].tier) == 3 and is_equal_approx(float(fires[0].g_cost), 150.0) and is_equal_approx(float(fires[0].max_dist), 700.0), "auto3_cost150_range700")
	if fires.size() >= 2:
		check(fires[1].site == "refire" and int(fires[1].tier) == 3, "refire_tier3")
		var expect: float = 700.0 * float(fires[1].g_cost) / 150.0
		check(absf(float(fires[1].max_dist) - expect) < 1e-6, "refire_partial_range_gauge_ratio")
	observations["chain_tier3"] = {"fires": fires.size(), "refire_g_cost": fires[1].g_cost if fires.size() > 1 else null}

func _test_chain_wall_autofire() -> void:
	var start: Vector2 = observations.get("wall_pos", origin)
	var target: Vector2 = start + Vector2.from_angle(wall_dir) * 400.0
	var c: Dictionary = await _scenario("chain_wall_autofire", start, 225.0, 30,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 20, "type": "up", "code": KEY_SHIFT}], target)
	var fire: Dictionary = _first(c._godot.log, "chain_fire")
	check(fire.get("site") == "wall" and int(fire.get("tier", 0)) == 1, "wall_autofire_on_first_hold_frame")
	observations["chain_wall"] = {"fire": fire, "land": _last(c._godot.log, "chain_land")}

func _test_chain_cancel() -> void:
	var c: Dictionary = await _scenario("chain_cancel", origin, 225.0, 14,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 1, "type": "up", "code": KEY_SHIFT},
		 {"f": 3, "type": "down", "code": KEY_SHIFT}, {"f": 4, "type": "up", "code": KEY_SHIFT}], origin + Vector2(0, 400))
	check(_count(c._godot.log, "cancel") == 1, "shift_during_flight_cancels")
	check(_count(c._godot.log, "chain_land") == 0, "cancel_no_landing")
	var after: Dictionary = _trace_at(c, 6)
	check(after.get("harp") == false and after.get("dash") == false, "cancel_clears_state")

func _test_chain_hit_enemy() -> void:
	var target_enemy: Node2D = null
	for e in world.get_enemies():
		if is_instance_valid(e) and e.get("alive") == true and e.has_method("read_native_normal_enemy_hurte_fields") \
				and not e.has_method("accept_native_hurte_owner_binding"):
			var f: Dictionary = e.read_native_normal_enemy_hurte_fields(world)
			if f.get("ready") == true and f.get("ib") != true and int(f.get("el")) != 1:
				target_enemy = e
				break
	check(target_enemy != null, "eligible_hurte_enemy")
	if target_enemy == null: return
	var hp_before: float = float(target_enemy.get("hp"))
	var start: Vector2 = origin
	var keep: Vector2 = start + Vector2(150, 0)
	var hook := func() -> void:
		target_enemy.global_position = keep
		target_enemy.apply_native_normal_enemy_field_write("stunned", 999.0)
	forced += 2
	var c: Dictionary = await _scenario("chain_hit_enemy", start, 225.0, 16,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 2, "type": "up", "code": KEY_SHIFT}], start + Vector2(400, 0), hook, {"enemy_contact": true})
	var hit: Dictionary = _last(c._godot.log, "chain_hit")
	check(not hit.is_empty(), "path_enemy_hit_once")
	check(_count(c._godot.log, "chain_hit") == 1, "hit_each_enemy_once(_harpHits)")
	var inv: Dictionary = state.read_current_inventory()
	var armor: Dictionary = inv.equipped.armor
	var expect: int = int((float(armor.get("charge", 10)) + float(c.P.baseAtk)) * 1.0 * 1.0 * 1.0)
	check(int(hit.get("dmg", -1)) == expect, "chain_damage_formula:%s==%s" % [hit.get("dmg"), expect])
	check(hit.get("ok") == true, "hurtE_executor_ok")
	var absorbed: bool = hit.get("shield_before") != null and hit.get("shield_after") != null and float(hit.shield_after) < float(hit.shield_before)
	check(float(target_enemy.get("hp")) < hp_before or target_enemy.get("alive") != true or absorbed, "enemy_hp_or_shield_reduced:" + str(hit))
	observations["chain_hit"] = {"dmg": hit.get("dmg"), "hp_before": hp_before, "hp_after": target_enemy.get("hp")}

func _test_gauge_empty_toast() -> void:
	var c: Dictionary = await _scenario("gauge_empty_toast", origin, 0.0, 6,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 3, "type": "up", "code": KEY_SHIFT}], origin + Vector2(400, 0))
	check(_count(c._godot.log, "chain_fire") == 0 and _count(c._godot.log, "hold_start") == 0, "gauge0_no_hold_no_fire")
	var toast: Dictionary = _last(c._godot.log, "toast_unported")
	check(toast.get("text") == "충전 중...", "gauge0_charging_toast_recorded(showPH 미이식)")

func _test_blade_dash_dir_then_space() -> void:
	var c: Dictionary = await _scenario("blade_dash_dir_then_space", origin, 225.0, 12,
		[{"f": 0, "type": "down", "code": KEY_A}, {"f": 0, "type": "down", "code": KEY_SPACE},
		 {"f": 1, "type": "up", "code": KEY_SPACE}, {"f": 1, "type": "up", "code": KEY_A}], origin + Vector2(400, 0))
	var bd: Dictionary = _last(c._godot.log, "blade_dash")
	check(not bd.is_empty() and int(bd.get("dir", -1)) == 2, "A_held_then_space_triggers_left")
	check(is_equal_approx(float(bd.get("mp_cost", 0)), 7.0) and is_equal_approx(float(bd.get("gauge_cost", 0)), 31.5), "costs_mp7_gauge31_5")
	var land: Dictionary = _last(c._godot.log, "blade_land")
	var moved: Vector2 = Vector2(float(land.get("x", 0)), float(land.get("y", 0))) - origin
	check(absf(moved.x + 250.0) < 0.05 and absf(moved.y) < 0.05, "moved_250px_left:" + str(moved))
	var ticks: int = _count(c._godot.log, "blade_tick")
	check(ticks == 6, "six_ticks:" + str(ticks))
	check(int(bd.f) + 5 == int(land.f), "lands_on_6th_frame")
	var t0: Dictionary = _trace_at(c, 0)
	check(str(t0.get("s")) == "bladeDash" and float(t0.get("iframes")) == 14.0, "state_bladeDash_iframes15_minus1:" + str(t0.get("iframes")))
	check(absf(float(t0.get("gauge")) - (225.0 - 31.5 + 225.0 * 0.025 / 60.0)) < 1e-6, "gauge_after_31_5_then_same_frame_regen(G32158→G32166)")
	observations["blade_dash"] = {"moved": [moved.x, moved.y], "ticks": ticks, "act_frame": bd.f, "land_frame": land.f}

func _test_blade_dash_space_then_dir() -> void:
	var c: Dictionary = await _scenario("blade_dash_space_then_dir", origin, 225.0, 10,
		[{"f": 0, "type": "down", "code": KEY_SPACE}, {"f": 1, "type": "down", "code": KEY_D},
		 {"f": 2, "type": "up", "code": KEY_D}, {"f": 2, "type": "up", "code": KEY_SPACE}], origin + Vector2(400, 0))
	var bd: Dictionary = _last(c._godot.log, "blade_dash")
	check(not bd.is_empty() and int(bd.get("dir", -1)) == 3, "space_held_then_D_triggers_right")
	check(ms.get_snapshot().kh.get("Space", true) == false, "KH_Space_cleared_by_trigger(G13240)")

func _test_blade_dash_double_tap() -> void:
	ms.clock_ms = func() -> float: return fake_now
	var c: Dictionary = await _scenario("blade_dash_double_tap", origin, 225.0, 12,
		[{"f": 0, "type": "down", "code": KEY_D, "t": 1000.0}, {"f": 1, "type": "up", "code": KEY_D, "t": 1016.0},
		 {"f": 2, "type": "down", "code": KEY_D, "t": 1180.0}, {"f": 3, "type": "up", "code": KEY_D, "t": 1196.0}], origin + Vector2(400, 0), Callable(), {"align_frame": 1})
	ms.clock_ms = Callable()
	forced += 1
	var bd: Dictionary = _last(c._godot.log, "blade_dash")
	check(not bd.is_empty() and int(bd.get("dir", -1)) == 3, "double_tap_within_250ms_triggers")

func _test_blade_dash_diagonal() -> void:
	var c: Dictionary = await _scenario("blade_dash_diagonal", origin, 225.0, 10,
		[{"f": 0, "type": "down", "code": KEY_W}, {"f": 0, "type": "down", "code": KEY_A}, {"f": 0, "type": "down", "code": KEY_SPACE},
		 {"f": 1, "type": "up", "code": KEY_SPACE}, {"f": 1, "type": "up", "code": KEY_A}, {"f": 1, "type": "up", "code": KEY_W}], origin + Vector2(400, 0))
	var bd: Dictionary = _last(c._godot.log, "blade_dash")
	check(not bd.is_empty() and int(bd.get("dir", -1)) == 0 and absf(float(bd.get("ang", 0)) - atan2(-1.0, -1.0)) < 1e-6, "W_first_in_entries_order_then_left_diagonal")

func _test_blade_dash_wall() -> void:
	var start: Vector2 = observations.get("wall_pos", origin)
	# 4방향 중 벽에 가장 가까운 축 방향으로 전격이동
	var best := -1
	var best_d := 1e9
	var dirs := [Vector2.UP, Vector2.DOWN, Vector2.LEFT, Vector2.RIGHT]
	for i in range(4):
		var d := 8.0
		while d <= 260.0:
			if not world.can_move(start + dirs[i] * d, 15.0): break
			d += 8.0
		if d < best_d: best_d = d; best = i
	var code: int = [KEY_W, KEY_S, KEY_A, KEY_D][best]
	var c: Dictionary = await _scenario("blade_dash_wall", start, 225.0, 10,
		[{"f": 0, "type": "down", "code": code}, {"f": 0, "type": "down", "code": KEY_SPACE},
		 {"f": 1, "type": "up", "code": KEY_SPACE}, {"f": 1, "type": "up", "code": code}], start + Vector2(400, 0))
	var land: Dictionary = _last(c._godot.log, "blade_land")
	var moved: float = Vector2(float(land.get("x", 0)), float(land.get("y", 0))).distance_to(start)
	observations["blade_dash_wall"] = {"dir": best, "wall_at": best_d, "moved": moved, "ticks": _count(c._godot.log, "blade_tick")}
	check(not land.is_empty(), "wall_dash_lands")
	if best_d < 250.0:
		check(moved < 250.0, "real_wall_stops_dash:" + str(moved))

func _test_blade_dash_insufficient() -> void:
	var c: Dictionary = await _scenario("blade_dash_insufficient", origin, 20.0, 6,
		[{"f": 0, "type": "down", "code": KEY_A}, {"f": 0, "type": "down", "code": KEY_SPACE},
		 {"f": 1, "type": "up", "code": KEY_SPACE}, {"f": 1, "type": "up", "code": KEY_A}], origin + Vector2(400, 0), Callable(), {"walk_frames": [0]})
	check(_count(c._godot.log, "blade_dash") == 0, "gauge20_no_dash")
	check(_last(c._godot.log, "toast_unported").get("text") == "충전 중...", "gauge_short_toast")
	check(_trace_at(c, 0).get("bd_trigger") == null, "trigger_consumed_in_idle")

func _test_stagger_escape_shift() -> void:
	var c: Dictionary = await _scenario("stagger_escape_shift", origin, 225.0, 6,
		[{"f": 0, "type": "state", "s": "stagger", "st2": 6.0}, {"f": 1, "type": "down", "code": KEY_SHIFT}, {"f": 3, "type": "up", "code": KEY_SHIFT}], origin + Vector2(400, 0))
	var t1: Dictionary = _trace_at(c, 1)
	check(str(t1.get("s")) == "idle", "shift_escapes_stagger:" + str(t1.get("s")))

func _test_pstun_blade_escape() -> void:
	var c: Dictionary = await _scenario("pstun_blade_escape", origin, 225.0, 9,
		[{"f": 0, "type": "state", "s": "pStun", "st2": 240.0}, {"f": 1, "type": "down", "code": KEY_A}, {"f": 1, "type": "down", "code": KEY_SPACE},
		 {"f": 2, "type": "up", "code": KEY_SPACE}, {"f": 2, "type": "up", "code": KEY_A}], origin + Vector2(400, 0))
	var bd: Dictionary = _last(c._godot.log, "blade_dash")
	check(not bd.is_empty() and str(bd.get("from_state")) == "pStun", "pstun_consumes_blade_trigger")
	check(int(_trace_at(c, 1).get("poise", 0)) == 4, "pstun_escape_poise4")

func _test_focus_blur_clears_hold() -> void:
	var c: Dictionary = await _scenario("focus_blur_clears_hold", origin, 225.0, 8,
		[{"f": 0, "type": "down", "code": KEY_SHIFT}, {"f": 3, "type": "blur"}, {"f": 5, "type": "up", "code": KEY_SHIFT}], origin + Vector2(400, 0))
	check(_count(c._godot.log, "chain_fire") == 0, "blur_disarms_hold_no_phantom_release")

func _test_oracle_compare() -> void:
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin), "explicit_node_bin")
	var dir: String = artifacts_dir if not artifacts_dir.is_empty() else OS.get_user_data_dir()
	DirAccess.make_dir_recursive_absolute(dir)
	var scen: String = dir.path_join("pms_scenario.json")
	var outp: String = dir.path_join("pms_oracle.json")
	var f := FileAccess.open(scen, FileAccess.WRITE)
	f.store_string(JSON.stringify({"cases": cases}))
	f.close()
	var output: Array = []
	var code: int = OS.execute(node_bin, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_move_skills_source_oracle.cjs"),
		ProjectSettings.globalize_path(SNAPSHOT.PATH), scen, outp]), output, true)
	check(code == 0, "oracle_vm_exit0:" + (str(output[0]).substr(0, 300) if not output.is_empty() else ""))
	var decoded: Variant = JSON.parse_string(FileAccess.get_file_as_string(outp))
	check(decoded is Dictionary and decoded.get("source_sha256") == GAME_SHA256, "oracle_payload_sha")
	if not decoded is Dictionary: return
	var by: Dictionary = {}
	for row in decoded.cases: by[row.name] = row
	var summary: Dictionary = {}
	for c in cases:
		var o: Dictionary = by.get(c.name, {})
		check(not o.is_empty() and not o.has("exception"), "oracle_case_ran:" + c.name + ":" + str(o.get("exception", "")))
		if o.is_empty() or o.has("exception"): continue
		check((o.errors as Array).is_empty(), "oracle_feeds_consistent:" + c.name + ":" + str(o.errors.slice(0, 3)))
		check(int(o.leftover.canmv) == 0 and int(o.leftover.aim) == 0 and int(o.leftover.shq) == 0, "oracle_feeds_fully_consumed:" + c.name + ":" + str(o.leftover))
		# 벽 질의 순서·좌표
		var gq: Array = c._godot.canmv_q
		var oq: Array = o.canmv
		check(gq.size() == oq.size(), "canmv_query_count:%s %d==%d" % [c.name, gq.size(), oq.size()])
		var qbad := 0
		var q_align := Vector2.ZERO
		if c._godot.flags.has("align_frame"):
			var gt0: Array = c._godot.trace
			var af: int = int(c._godot.flags.align_frame)
			q_align = Vector2(float(gt0[af].x) - float(o.frames[af].x), float(gt0[af].y) - float(o.frames[af].y))
		for i in range(mini(gq.size(), oq.size())):
			if absf(float(gq[i][0]) - q_align.x - float(oq[i].x)) > POS_TOL or absf(float(gq[i][1]) - q_align.y - float(oq[i].y)) > POS_TOL or float(gq[i][2]) != float(oq[i].r) or str(gq[i][4]) != str(oq[i].kind):
				qbad += 1
		check(qbad == 0, "canmv_query_coords_and_kind:%s bad=%d" % [c.name, qbad])
		# 프레임별 상태 (align_frame: 그 프레임까지의 보행 변위(원본 oracle 미포함 G33022)를 이후 좌표에서 뺀다)
		var fbad: Array = []
		var gt: Array = c._godot.trace
		var align_f: int = int(c._godot.flags.get("align_frame", 1 << 30))
		var align := Vector2.ZERO
		if align_f < gt.size() and align_f < (o.frames as Array).size():
			align = Vector2(float(gt[align_f].x) - float(o.frames[align_f].x), float(gt[align_f].y) - float(o.frames[align_f].y))
		for i in range(mini(gt.size(), (o.frames as Array).size())):
			var g: Dictionary = gt[i]
			var s: Dictionary = o.frames[i]
			var diffs: Array = []
			var walk_frames: Array = c._godot.flags.get("walk_frames", [])
			var walked: bool = not walk_frames.is_empty() and i >= int(walk_frames[0]) # 원본 oracle은 보행(G33022–33027) 미포함
			var gx: float = float(g.x) - (align.x if i >= align_f else 0.0)
			var gy: float = float(g.y) - (align.y if i >= align_f else 0.0)
			if c._godot.flags.has("align_frame") and i < align_f: walked = true # 정렬 프레임 이전 = 보행 프레임
			if not walked and (absf(gx - float(s.x)) > POS_TOL or absf(gy - float(s.y)) > POS_TOL): diffs.append("pos %.4f,%.4f/%.4f,%.4f" % [gx, gy, s.x, s.y])
			if float(g.iframes) != float(s.iframes): diffs.append("iframes %s/%s" % [g.iframes, s.iframes])
			if absf(float(g.gauge) - float(s._harpGauge)) > 1e-6: diffs.append("gauge")
			if absf(float(g.gauge_max) - float(s._HARP_GAUGE_MAX)) > 1e-9: diffs.append("gauge_max")
			if g.harp != s._harpActive or g.dash != s._dashActive or g.harp_hit != s._harpHit: diffs.append("flags")
			if absf(float(g.harp_dist) - float(s._harpDist)) > POS_TOL: diffs.append("harp_dist")
			if absf(float(g.harp_max) - float(s._harpMaxDist)) > POS_TOL: diffs.append("harp_max")
			if absf(float(g.dash_left) - float(s._dashLeft)) > 1e-6: diffs.append("dash_left")
			if int(g.dash_tier) != int(s._dashTier) or g.dash_hold != s._dashHold or float(g.dash_hold_f) != float(s._dashHoldF) or int(g.harp_tier) != int(s._harpTier): diffs.append("hold")
			if float(g.dash_iframe) != float(s._dashIframe): diffs.append("dash_iframe")
			if absf(float(g.bd_move_t) - float(s.bdMoveT)) > 1e-9: diffs.append("bd_move_t")
			if str(g.bd_trigger) != str(s.bdTrigger): diffs.append("bd_trigger %s/%s" % [g.bd_trigger, s.bdTrigger])
			if _port_state(str(g.s)) != str(s.s): diffs.append("state %s/%s" % [g.s, s.s])
			if int(g.poise) != int(s.poise): diffs.append("poise")
			if (s._harpActive or s._dashActive) and (absf(float(g.harp_x) - float(s._harpX)) > POS_TOL or absf(float(g.harp_y) - float(s._harpY)) > POS_TOL): diffs.append("harp_pos")
			if not diffs.is_empty(): fbad.append({"f": i, "d": diffs})
		check(fbad.is_empty(), "per_frame_state_equal:%s %s" % [c.name, str(fbad.slice(0, 4))])
		check(gt.size() == (o.frames as Array).size(), "frame_count:" + c.name)
		# 비용 (발사·전격)
		var o_calls: Array = o.calls
		var hurts: Array = []
		var texts: Array = []
		var sounds: Array = []
		for call in o_calls:
			if call.call == "hurtE": hurts.append(call.args)
			elif call.call == "addTxt" and str(call.args[2]) != "여기가 지옥인가": texts.append(str(call.args[2])) # pStun case 대사(G34340)는 생명주기 표현 — 이 owner 밖
			elif call.call == "playSample": sounds.append(str(call.args[0]))
		var g_hits: Array = []
		var g_texts: Array = []
		var g_sounds: Array = []
		for r in c._godot.log:
			if r.k == "chain_hit": g_hits.append(r)
			elif r.k == "txt": g_texts.append(str(r.text))
			elif r.k == "snd": g_sounds.append(str(r.key))
		check(hurts.size() == g_hits.size(), "hurtE_count:%s %d==%d" % [c.name, g_hits.size(), hurts.size()])
		for i in range(mini(hurts.size(), g_hits.size())):
			var a: Array = hurts[i]
			var gh: Dictionary = g_hits[i]
			var opts: Dictionary = a[4] if a[4] is Dictionary else {}
			check(int(a[0]) == int(gh.enemy) and int(a[1]) == int(gh.dmg) and absf(float(a[2]) - float(gh.ang)) < 1e-4 and a[3] == false \
				and int(a[5]) == int(gh.el) and float(opts.get("kbMult", -1)) == 2.0 and opts.get("poiseHit") == true and float(opts.get("poiseMult", -1)) == 2.0,
				"hurtE_args_order:%s #%d src=%s port=%s" % [c.name, i, str(a), str(gh)])
		check(texts == g_texts, "floating_text_sequence:%s src=%s port=%s" % [c.name, str(texts), str(g_texts)])
		# 사운드 키(무작위 선택 키는 chain_dash*/voice — 행만 대조): 무작위 아닌 고정 키 순서
		check(_fixed_keys(sounds) == _fixed_keys(g_sounds), "sound_fixed_key_sequence:%s src=%s port=%s" % [c.name, str(_fixed_keys(sounds)), str(_fixed_keys(g_sounds))])
		# RNG 행: 원본 Math.random 호출 행이 모두 표현 전용(사운드 선택 _r/playSample, 파티클 poolPart, 번개 기둥 좌표)인지
		var gameplay_lines: Array = []
		for row_r in o.random_lines:
			if row_r.presentation != true: gameplay_lines.append(row_r.line)
		check(gameplay_lines.is_empty(), "rng_lines_presentation_only:%s %s" % [c.name, str(gameplay_lines)])
		var lines_seen: Array = []
		for row_r in o.random_lines: lines_seen.append(row_r.line)
		summary[c.name] = {"frames": gt.size(), "canmv": gq.size(), "hurtE": hurts.size(), "rng_lines": lines_seen}
	observations["oracle"] = summary

func _uniq(a: Array) -> Array:
	var out: Array = []
	for x in a: if not out.has(x): out.append(x)
	return out

func _fixed_keys(keys: Array) -> Array:
	var out: Array = []
	for k in keys:
		if str(k).begins_with("chain_dash") or str(k).begins_with("voice_") or str(k) == "male_grunt": out.append("<rand>")
		else: out.append(k)
	return out

func _port_state(s: String) -> String:
	return s # 포트 상태명 = 원본 상태명(idle/bladeDash/stagger/pStun)

func _test_input_priority_space() -> void:
	# 실제 뷰포트 입력 경로: 방향+Space는 전격이동이 먼저 소비(Space 슬롯 디스패치 없음), Space 단독은 슬롯 owner로 전달
	var adapter: Node = world.get_node_or_null("NativeSkillSlots")
	check(is_instance_valid(adapter), "skill_slot_owner_present")
	if not is_instance_valid(adapter): return
	var seen: Array = []
	var cb := func(slot_key: String, result: Dictionary) -> void: seen.append([slot_key, result.get("reason")])
	adapter.native_dispatch_observed.connect(cb)
	_prepare(origin, 225.0)
	await physics_frame
	Input.parse_input_event(_key_event(KEY_A, true))
	await process_frame
	Input.parse_input_event(_key_event(KEY_SPACE, true))
	for i in range(8): await physics_frame
	Input.parse_input_event(_key_event(KEY_SPACE, false))
	Input.parse_input_event(_key_event(KEY_A, false))
	await process_frame
	check(seen.is_empty(), "dir_space_not_dispatched_to_space_slot:" + str(seen))
	check(ms.counters.blade_dash >= 1, "real_input_path_blade_dash")
	seen.clear()
	_prepare(origin, 225.0)
	await physics_frame
	Input.parse_input_event(_key_event(KEY_SPACE, true))
	await process_frame
	await process_frame
	Input.parse_input_event(_key_event(KEY_SPACE, false))
	await process_frame
	check(seen.size() == 1 and seen[0][0] == "Space", "space_alone_reaches_slot_owner(G13284):" + str(seen))
	# 사슬기동 중 Space 슬롯 차단
	seen.clear()
	_prepare(origin, 225.0)
	_aim_world(origin + Vector2(400, 0))
	await physics_frame
	_send_key(KEY_SHIFT, true)
	await physics_frame
	_send_key(KEY_SHIFT, false)
	await physics_frame
	Input.parse_input_event(_key_event(KEY_SPACE, true))
	await process_frame
	await process_frame
	Input.parse_input_event(_key_event(KEY_SPACE, false))
	for i in range(14): await physics_frame
	check(seen.is_empty(), "space_slot_blocked_during_chain:" + str(seen))
	adapter.native_dispatch_observed.disconnect(cb)

func _test_lesson_lock() -> void:
	# 레슨 활성(연습 -3) 중 Shift/Space는 allows 거절 → 사슬·전격이동 없음 (G13208 allowKey)
	var seq: Node = main.get("source_intro_sequence")
	var flow: Node = seq.lesson_flow if is_instance_valid(seq) else null
	check(is_instance_valid(flow), "lesson_flow_present")
	if not is_instance_valid(flow): return
	var was_active: bool = flow.active
	var was_phase: String = str(flow.phase)
	var was_step: int = int(flow.step)
	flow.active = true
	flow.phase = "practice"
	flow.step = -3
	forced += 1
	_prepare(origin, 225.0)
	await physics_frame
	var r: Dictionary = _send_key(KEY_SHIFT, true)
	check(r.get("reason") == "parry_lesson_input_locked" and ms.dash_hold == false, "lesson_blocks_shift_hold")
	_send_key(KEY_SHIFT, false)
	flow.step = 4 # actions()==['charge']
	r = _send_key(KEY_SHIFT, true)
	check(ms.dash_hold == true, "lesson_step4_allows_shift")
	_send_key(KEY_SHIFT, false)
	for i in range(20): await physics_frame
	flow.active = was_active
	flow.phase = was_phase
	flow.step = was_step

func _test_render_pose() -> void:
	# 렌더 입력: 사슬 비행 중 dash_start/fly 애니·64px 오프셋·lift, 전격이동 중 idle 프레임+스쿼시·잔상
	_prepare(origin, 225.0)
	_aim_world(origin + Vector2(400, 0))
	await physics_frame
	_send_key(KEY_SHIFT, true)
	await physics_frame
	_send_key(KEY_SHIFT, false)
	var anims: Array = []
	var lifts: Array = []
	var trail_max := 0
	for i in range(16):
		await process_frame
		var sprite: AnimatedSprite2D = player.get_node("Warrior")
		anims.append(str(sprite.animation))
		lifts.append(sprite.position.y)
		trail_max = maxi(trail_max, ms.get("_trail").size())
	check(anims.any(func(a: String) -> bool: return a.begins_with("dash_")), "chain_uses_dash_flight_frames:" + str(anims.slice(0, 6)))
	check(lifts.any(func(v: float) -> bool: return v < -1.0), "dash_pull_lift_negative")
	check(trail_max >= 2, "afterimage_trail_recorded:" + str(trail_max))
	for i in range(40): await physics_frame
	_prepare(origin, 225.0)
	await physics_frame
	_send_key(KEY_A, true)
	_send_key(KEY_SPACE, true)
	await physics_frame
	await process_frame
	var sprite2: AnimatedSprite2D = player.get_node("Warrior")
	check(str(player.state) == "bladeDash" and str(sprite2.animation).begins_with("idle_") and sprite2.scale.x > sprite2.scale.y, "blade_dash_squash_idle_frames:" + str(sprite2.scale))
	_send_key(KEY_SPACE, false)
	_send_key(KEY_A, false)
	for i in range(10): await physics_frame
	check(is_equal_approx(sprite2.scale.x, sprite2.scale.y), "squash_restored_after_landing")
	observations["render"] = {"anims": anims, "lifts": lifts, "trail_max": trail_max}

func _test_perf() -> void:
	# 이동 스킬 owner 틱 비용(대기·게이지 가득 / 회복 중) — 회귀 벤치는 별도 600틱 하네스
	var costs := {}
	for label in ["full", "regen"]:
		_prepare(origin, 225.0 if label == "full" else 100.0)
		var t0 := Time.get_ticks_usec()
		for i in range(300):
			if label == "regen": ms.harp_gauge = 100.0
			ms.advance_pre(1.0)
			ms.advance_post_iframes()
			ms.advance_state(1.0)
			ms.advance_state_after_move()
		costs[label] = float(Time.get_ticks_usec() - t0) / 300.0
	var t1 := Time.get_ticks_usec()
	for i in range(300): state.read_current_p()
	costs["read_current_p"] = float(Time.get_ticks_usec() - t1) / 300.0
	t1 = Time.get_ticks_usec()
	for i in range(300): ms._eq_affix("extraST")
	costs["eq_affix"] = float(Time.get_ticks_usec() - t1) / 300.0
	t1 = Time.get_ticks_usec()
	for i in range(300): ms.advance_post_iframes()
	costs["post_iframes"] = float(Time.get_ticks_usec() - t1) / 300.0
	t1 = Time.get_ticks_usec()
	for i in range(300): ms.advance_state(1.0)
	costs["state"] = float(Time.get_ticks_usec() - t1) / 300.0
	t1 = Time.get_ticks_usec()
	for i in range(300): ms.advance_pre(1.0)
	costs["pre_full"] = float(Time.get_ticks_usec() - t1) / 300.0
	t1 = Time.get_ticks_usec()
	for i in range(300): ms._lesson_chapter2()
	costs["lesson_ch2"] = float(Time.get_ticks_usec() - t1) / 300.0
	observations["perf_owner_us_per_tick"] = costs
	check(float(costs.full) < 400.0 and float(costs.regen) < 600.0, "owner_tick_cost_sanity(실제 판정은 필드 600틱 벤치 전후):" + str(costs))
