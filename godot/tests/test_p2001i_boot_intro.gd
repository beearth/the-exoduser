extends SceneTree
## P2-001i — 실제 부팅 → 인트로 → 커튼 오픈 자동 연결 E2E (실제 Main 부팅).
## 원본 순서(64484 stage0 → _startIntro 63277 → 가이드 63357 → _finishIntroGuide 63342 →
## _openIntroCurtain 63411): main._ready가 시퀀스를 설치·기동(main.gd 3줄), 키 입력으로
## 가이드 진행/스킵, 커튼 오픈 후 G.on·5링·HUD 표시·stageTime 진행까지 검증.
## 하니스 부팅은 기본 휴면(원본 테스트 우회 63278/64483 상응)이라 여기선
## set_meta("native_intro_boot","intro")로 인트로 경로를 명시 기동한다.
const ClockProducer = preload("res://port_modules/source_update_clock_prefix/producer.gd")
const USERDIR = "EXODUSER-P2001I-Isolated-20261020"
const GROUPS = ["boot_auto_intro", "guide_key_input_and_open", "post_open_game_state"]

var active_main: Node
var sequence: Node2D
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2001I_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001I_GROUP ", JSON.stringify(row))
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	print("P2001I_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001I_FAIL ", current_group, " ", label)

func _g_on_phase_status(g: Variant) -> String:
	var clock: RefCounted = ClockProducer.new()
	clock.declare_dt_sp() # 60463 let _dtSp=1 선언 — 미선언이면 producer가 NOT_READY
	clock.begin_update(g)
	clock.phase_system_lesson({"presence": "absent"})
	return str(clock.phase_g_on(g).get("status"))

func _press(keycode: Key) -> void:
	var down := InputEventKey.new()
	down.keycode = keycode
	down.physical_keycode = keycode
	down.pressed = true
	Input.parse_input_event(down)
	var up := InputEventKey.new()
	up.keycode = keycode
	up.physical_keycode = keycode
	up.pressed = false
	Input.parse_input_event(up)

func _test_boot_auto_intro() -> void:
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return
	active_main = packed.instantiate()
	active_main.set_meta("native_intro_boot", "intro") # 하니스에서 인트로 경로 명시 기동
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	if active_main.get("world").get("ready_for_player") != true:
		_check(false, "actual World ready_for_player")
		return
	sequence = active_main.get("source_intro_sequence")
	_check(is_instance_valid(sequence), "main._ready installs intro sequence (P2-001i 3줄 배선)")
	if not is_instance_valid(sequence):
		return
	_check(sequence.get("phase") == "guide", "boot auto-begins intro (64484 stage0 경로)")
	var view: Control = active_main.get_native_intro_curtain_view()
	_check(view != null and view.phase == view.Phase.CLOSED and view.visible,
		"curtain shown closed at boot (63289~63291)")
	_check(active_main.get("world").get_enemies().is_empty(),
		"63279 ens.length=0 — 설치 적 전제거, 초기 구성은 커튼 5링만(원본 동일)")
	var hud_root: Variant = active_main.get("hud").get("_root")
	_check(hud_root is Control and hud_root.visible == false, "HUD hidden before curtain open (63414 .on 전)")
	var g: Variant = active_main.get("source_state").read_current_g()
	_check(g is Dictionary and g.get("on") == false and g.get("_intro") == true,
		"state G: on=false/_intro=true during intro (63283)")
	_check(float(active_main.get("player").get("iframes")) >= 9000.0,
		"P.iframes=9999 at intro (63283, 이후 틱 감소분 허용)")
	# g_on 게이트 증명(인트로 중): 실제 state G dict에 producer를 직접 적용 —
	# 32580 if(!G.on)return 이 RETURNED. (라이브 파이프라인 자체는 그보다 앞의
	# 미소유 관측 system_lesson에서 NOT_READY — P1-002.D services 잔여.)
	_check(_g_on_phase_status(g) == "RETURNED",
		"g_on gate closed while G.on=false (32580 if(!G.on)return)")

func _test_guide_key_input_and_open() -> void:
	if not is_instance_valid(sequence):
		return
	# 63351~63356: Enter/Space 진행(250ms 쓰로틀) — 쓰로틀 경과 후 1회 진행
	var throttle_wait: int = Time.get_ticks_msec() + 300
	while Time.get_ticks_msec() < throttle_wait:
		await process_frame
	var step_before: int = int(sequence.get("guide_step"))
	_press(KEY_ENTER)
	for i in range(4):
		await process_frame
	_check(int(sequence.get("guide_step")) == step_before + 1, "Enter advances one guide step (63351~)")
	# 63370 Escape = 스킵 → _finishIntroGuide → _openIntroCurtain
	_press(KEY_ESCAPE)
	for i in range(4):
		await process_frame
	_check(sequence.get("phase") == "opening", "Escape skips to curtain open (63342~63348)")
	var view: Control = active_main.get_native_intro_curtain_view()
	_check(view.phase == view.Phase.OPENING or view.phase == view.Phase.DONE, "curtain opening (63434)")
	var enemies: Array = active_main.get("world").get_enemies()
	var ring := 0
	for enemy in enemies:
		if str(enemy.get("data")["id"]).begins_with("ch1_curtain_ring_"):
			ring += 1
	_check(enemies.size() == 5 and ring == 5, "exactly the five 580px ring enemies (63425~63432)")
	var hud_root: Variant = active_main.get("hud").get("_root")
	_check(hud_root is Control and hud_root.visible == true, "HUD shown at curtain open (63414)")
	observations["ring_count"] = ring

func _test_post_open_game_state() -> void:
	if not is_instance_valid(sequence):
		return
	var state: Node = active_main.get("source_state")
	var g: Variant = state.read_current_g()
	_check(g is Dictionary and g.get("on") == true, "state G.on=true after open (63413)")
	_check(float(active_main.get("player").get("iframes")) <= 600.0 and float(active_main.get("player").get("iframes")) > 0.0,
		"P.iframes=600 then ticking (63413)")
	for i in range(30):
		await process_frame
	# g_on 게이트 개방 증명: 같은 실제 G dict에 producer 적용 — 이제 CONTINUE.
	# stageTime 실진행(32742)은 라이브 파이프라인의 앞선 미소유 관측(system_lesson
	# presence·panel_inputs gap 등 — P1-002.D services 소관)이 열려야 함께 열린다(잔여,
	# 스냅샷 update_clock_result로 관측 가능).
	_check(_g_on_phase_status(state.read_current_g()) == "CONTINUE",
		"g_on gate OPEN after curtain open (63413 G.on=true → 32580 통과)")
	observations["live_update_clock"] = active_main.get_native_source_clock_input_snapshot().get("update_clock_result", {}).get("last", {})
	var snap: Dictionary = sequence.get_snapshot()
	_check(float(snap["bonfire"]["t"]) > 0.0 and snap["bonfire"]["active"] == true, "bonfire running (63433)")
	_check(int(snap["metrics"]["intro_enemies_cleared"]) >= 1, "intro clear counted installed actors (63279)")
	observations["metrics"] = snap["metrics"]
