extends SceneTree
## P2-004a — 펫 4종·대사 자막 회귀 (실제 Main 부팅).
## 근거: 소환 30798(초기 오프셋·cat.t 난수·iris sz20), 상수 PETS 9243, 이동 41420~41541
## (xbow/iris 공격·피해 없음 — P2-001d 추정 정정), 이리스 광원 4686~4690(r250·×.6),
## 대사 9389~9568(tut_start 즉시·pair 5초 후 cat·페이드 pow(r,.6)×.6·티어쿨 9414),
## 카운터 42117(hurtE 진입)/42702(처치)/43425(피격).
const USERDIR = "EXODUSER-P2004A-Isolated-20261020"
const GROUPS = ["pets_spawn_and_tut_start", "combat_counters_and_iris"]

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var forced_actor_fields = 0

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if OS.get_environment("EXODUSER_P2004A_FAILED_ONLY") == "1" and group != "pets_spawn_and_tut_start":
			skipped.append(group)
			continue
		if not isolated:
			skipped.append(group)
			print("P2004A_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2004A_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2004A_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2004A_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null

func _boot_main() -> bool:
	if is_instance_valid(active_main):
		return true
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return false
	active_main = packed.instantiate()
	root.add_child(active_main)
	for i in range(10):
		await physics_frame
	return active_main.get("world").get("ready_for_player") == true

func _pets() -> Node:
	return active_main.get("world").get_node("NativePets")

func _test_pets_spawn_and_tut_start() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var source_state: Node = active_main.get("source_state")
	_check(source_state.read_current_g().get("on") == false, "하니스 pre-stage G.on=false")
	_check(_pets().get_native_pets_snapshot()["say_log"].is_empty(), "원본 9508 G.on 전 대사 정지")
	var curtain_owner: Node = active_main.get("source_intro_sequence")
	var receipt: Dictionary = source_state.apply_native_intro_curtain_g_writes(curtain_owner, "open")
	_check(receipt.get("applied") == true and receipt.get("on") == true, "원본 63412 G.on 점등 owner")
	if receipt.get("applied") != true:
		return
	for i in range(20):
		await physics_frame
	var snap: Dictionary = _pets().get_native_pets_snapshot()
	_check(snap.get("configured") == true, "펫 어댑터 구성")
	var player: Node2D = active_main.get("player")
	for key in ["crow", "cat", "xbow", "iris"]:
		var pos: Array = snap["pets"][key]
		var d: float = Vector2(pos[0], pos[1]).distance_to(player.global_position)
		_check(d <= 520.0, "펫 %s 플레이어 520px 내(언스턱 계약 41475) d=%.0f" % [key, d])
	_check(snap.get("iris_target_alive") == false, "이리스 적 미발견(최근접 888 > 탐색 800 — 41525)")
	var log: Array = snap.get("say_log", [])
	_check(log.size() >= 1 and log[0].get("id") == "tut_start" and log[0].get("who") == "crow",
		"부팅 첫 대사 = tut_start(crow — 9556)")
	var bubble: Dictionary = snap.get("bubble", {})
	_check(bubble.get("who") == "crow" and str(bubble.get("txt")).begins_with("일어나"),
		"HECTOR 원문 그대로 표시 (" + str(bubble.get("txt")).substr(0, 10) + "…)")
	_check(bubble.get("pair") == true, "cat 응답 pair 대기(9556)")
	_check(float(bubble.get("alpha")) > 0.0 and float(bubble.get("alpha")) <= 0.6,
		"자막 표시 opacity ≤ .6 (9348·9505 페이드)")
	# 5초(300틱) 경과 → pair(디로이) 발화
	for i in range(320):
		await physics_frame
	snap = _pets().get_native_pets_snapshot()
	var bubble2: Dictionary = snap.get("bubble", {})
	_check(bubble2.get("who") == "cat" and str(bubble2.get("txt")).contains("좌클릭"),
		"5초 후 DIROI pair 발화(9498~9503) who=" + str(bubble2.get("who")))
	observations["boot"] = snap

func _test_combat_counters_and_iris() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var pets: Node = _pets()
	var player: Node2D = active_main.get("player")
	var before: Dictionary = pets.get_native_pets_snapshot()
	# 가장 가까운 적 옆으로 이동(관측 하니스 재배치) → 이리스 탐색 반경 진입 + 처치
	var target: Node2D = null
	var best := 1e18
	for c in active_main.get("world").get_enemies():
		if is_instance_valid(c) and c.get("alive") == true:
			var d: float = c.global_position.distance_to(player.global_position)
			if d < best:
				best = d
				target = c
	if target == null:
		_check(false, "적 존재")
		return
	player.global_position = target.global_position + Vector2(-(47.0 + float(target.get("radius")) - 8.0), 0)
	player.set("facing", (target.global_position - player.global_position).normalized())
	forced_actor_fields += 2
	for i in range(40):
		await physics_frame
	var mid: Dictionary = pets.get_native_pets_snapshot()
	_check(mid.get("iris_target_alive") == true, "이리스 적 추적 진입(반경 800)")
	# 처치 시도 (자연 kiSlash)
	var killed := false
	for attempt in range(8):
		for i in range(300):
			if player.get("state") == "idle" and float(player.get("stamina")) >= 30.0:
				break
			await physics_frame
		if not is_instance_valid(target) or target.get("alive") != true:
			killed = true
			break
		player.global_position = target.global_position + Vector2(-(47.0 + float(target.get("radius")) - 8.0), 0)
		player.set("facing", (target.global_position - player.global_position).normalized())
		if not player.request_attack():
			player.release_attack()
			continue
		if player.get("state") == "windup":
			player.release_attack()
		for i in range(120):
			await physics_frame
			if not is_instance_valid(target) or target.get("alive") != true:
				killed = true
				break
		player.release_attack()
		if killed:
			break
	_check(killed, "처치 성공")
	for i in range(10):
		await physics_frame
	var after: Dictionary = pets.get_native_pets_snapshot()
	var counters: Dictionary = after.get("counters", {})
	_check(int(counters.get("atk", 0)) > int(before["counters"]["atk"]),
		"_petOnAtk = hurtE 진입 카운트(42117) atk=" + str(counters.get("atk")))
	_check(int(counters.get("kill", 0)) >= 1, "_petOnKill 처치 카운트(42702)")
	# 이리스 광원이 라이트맵 셰이더에 공급됨 (P2-003a light2)
	var lightmap: ColorRect = active_main.get_node("NativeScreenLighting").get_node("NativeLightmap")
	var light2_a: float = float((lightmap.material as ShaderMaterial).get_shader_parameter("light2_a"))
	_check(light2_a > 0.2 and light2_a < 0.36, "이리스 광 a=(.45±.13)×.6 범위(4688) a=" + str(light2_a))
	_check(float((lightmap.material as ShaderMaterial).get_shader_parameter("light2_r")) == 250.0,
		"이리스 광 r=OPT.irisGlow‖250 (4689)")
	observations["combat"] = {"counters": counters, "say_log": after.get("say_log")}
