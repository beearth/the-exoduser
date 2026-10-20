extends SceneTree
## P2-001g 시각 검수 하니스 (P2-001f판 복제, 출력 경로만 변경) — 실창 렌더로 처치 연출을 웹 실측과 같은 시점에 캡처.
## (headless 금지. 격리 userdir 필수 — 실제 저장 폴더 사용 금지. 판정은 산출 PNG를 눈으로.)
## 웹 기준 시점(scratchpad/p2-001f/webkill/dump.json): kill+86ms/+798ms/+1601ms/+2333ms.
const USERDIR = "EXODUSER-P2001B-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-001g/godotkill"

var active_main: Node
var hurte_outcomes: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	if not isolated:
		print("VISUAL_ABORT not_isolated")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(OUT)
	var packed: PackedScene = load("res://scenes/main.tscn")
	active_main = packed.instantiate()
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	if active_main.get("world").get("ready_for_player") != true:
		print("VISUAL_ABORT world_not_ready")
		quit(3)
		return
	active_main.get("player").telemetry_event.connect(func(kind, data):
		if kind == "native_hurte": hurte_outcomes.append(data.duplicate(true)))
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "weapon"
	for i in range(30):
		await physics_frame
	var enemy: Node = null
	var best := 1e9
	for candidate in active_main.get("world").get_enemies():
		if not is_instance_valid(candidate) or candidate.get("alive") != true:
			continue
		var dr: float = absf(float(candidate.get("radius")) - 21.7) # 웹 실측 대상 r=21.70에 최근접
		if dr < best:
			best = dr
			enemy = candidate
	if not is_instance_valid(enemy):
		print("VISUAL_ABORT no_enemy")
		quit(4)
		return
	print("VISUAL_ENEMY r=", enemy.get("radius"), " hp=", enemy.get("hp"), " mhp=", enemy.get("mhp"))
	await _shot("v0_boot")
	var killed := false
	var swings := 0
	var kill_usec: int = 0
	while not killed and swings < 30:
		swings += 1
		var outcome: Dictionary = await _swing(enemy)
		if outcome.get("killed") == true:
			killed = true
			kill_usec = Time.get_ticks_usec()
	if not killed:
		print("VISUAL_ABORT not_killed")
		quit(5)
		return
	# 하니스 환경 fps가 웹(~186fps)과 달라 wall-clock 대신 "같은 위상"에서 캡처:
	# 웹 k0=blood frame4 / k1=blood 종료·DI life 0.36 / k2~k3=stain+corpse만.
	var adapter: Node = active_main.get("world").get("_native_death_fx")
	var death_pos: Vector2 = enemy.global_position
	var camera: Camera2D = active_main.get("camera")
	var phase := 0
	for i in range(3000):
		await process_frame
		var anims: Array = adapter.get("_blood_anims")
		var frame_now: int = int(anims[0]["frame"]) if anims.size() > 0 else 99
		var di_life := -1.0
		for d in adapter.get("_di"):
			if d["active"]:
				di_life = float(d["life"])
		if phase == 0 and frame_now >= 4:
			await _shot("g0_bloodframe4")
			_snap_log(adapter, "g0_bloodframe4", kill_usec, death_pos, camera)
			phase = 1
		elif phase == 1 and frame_now >= 8:
			await _shot("g1_bloodframe8")
			_snap_log(adapter, "g1_bloodframe8", kill_usec, death_pos, camera)
			phase = 2
		elif phase == 2 and frame_now >= 99 and di_life >= 0.0 and di_life <= 0.4:
			await _shot("g2_blooddone_di036")
			_snap_log(adapter, "g2_blooddone_di036", kill_usec, death_pos, camera)
			phase = 3
		elif phase == 3 and di_life < 0.0:
			await _shot("g3_stain_corpse_only")
			_snap_log(adapter, "g3_stain_corpse_only", kill_usec, death_pos, camera)
			phase = 4
			break
	if phase < 4:
		print("VISUAL_WARN phase_incomplete=", phase)
	print("VISUAL_DONE fps=", Engine.get_frames_per_second())
	if active_main.get_parent() != null:
		active_main.get_parent().remove_child(active_main)
	active_main.free()
	quit(0)

func _snap_log(adapter: Node, tag: String, kill_usec: int, death_pos: Vector2, camera: Camera2D) -> void:
	var snap: Dictionary = adapter.get_snapshot()
	var center: Vector2 = camera.get_screen_center_position()
	var sx: float = 960.0 + (death_pos.x - center.x)
	var sy: float = 540.0 + (death_pos.y - center.y)
	print("VISUAL_SNAP ", tag, " t=", (Time.get_ticks_usec() - kill_usec) / 1000, "ms screen=", Vector2i(int(sx), int(sy)), " counts=", JSON.stringify(snap["counts"]))

func _shot(name_tag: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_viewport().get_texture().get_image()
	img.save_png("%s/%s.png" % [OUT, name_tag])

func _swing(enemy: Node) -> Dictionary:
	var player: Node2D = active_main.get("player")
	var p: Dictionary = active_main.get("source_state").read_current_p()
	if float(p.get("hp", 0)) < float(p.get("mhp", 0)):
		p["hp"] = p.get("mhp", 350)
		player.set("hp", float(p.get("mhp", 350)))
	for attempt in range(4):
		if player.get("state") != "idle":
			for i in range(240):
				await physics_frame
				if player.get("state") == "idle":
					break
		var stand: Vector2 = enemy.global_position + Vector2(-(47.0 + float(enemy.get("radius")) - 8.0), 0)
		player.global_position = stand
		player.set("facing", (enemy.global_position - stand).normalized())
		var before: int = hurte_outcomes.size()
		if not player.request_attack():
			player.release_attack()
			for i in range(600):
				await physics_frame
				if player.get("state") == "idle" and float(player.get("stamina")) >= 30.0:
					break
			continue
		if player.get("state") == "windup":
			player.set("facing", (enemy.global_position - player.global_position).normalized())
			player.release_attack()
		for i in range(300):
			await physics_frame
			if hurte_outcomes.size() > before:
				break
		player.release_attack()
		for outcome in hurte_outcomes.slice(before):
			if int(outcome.get("enemy_id", 0)) == enemy.get_instance_id():
				return outcome
	return {}
