extends SceneTree
## PC-BOSS-CHASE A-02 (2026-10-22) — 일반 적 근접 접촉 공격 주기: 같은 etype·같은 거리·같은 상태로 원본 VM 과 대조.
## 장면: 정지 플레이어 옆(중심 거리 = e.r + P.r − 6, 원본 접촉 조건 d<e.r+P.r+8 40502 안) 에 정예 아닌 etype 1마리.
## 생성 단위 = fixture recipe 0.25(원본 mkEn 31139·31141·31167·31170·31173·31262·31302 의 같은 단위). 이후 RNG 는 각자.
## 원본: updateE 38884 st2-=sp → switch idle 접촉 40502 `hurtP(~~(e.atk*.8)); e.st2=40+~~(Math.random()*20)`,
##   hurtP 비DOT 43584 P.iframes=0. oracle = tests/pc_boss_chase_oracle.cjs --scene=melee (원문 적 루프 34421 + updateE).
## 판정: 첫 타 틱(결정적) 같음, 간격 지지집합 [40,59] 같음, 평균 차 < 3틱(표본 N≥50 양쪽).
## 인자: --node-bin=<node.exe> --artifacts-dir=<dir>
const FIX = preload("res://tests/demo11_etype_a_fixture.gd")
const USERDIR := "EXODUSER-pc-boss-chase-Isolated-20261022"
const TICKS := 3600
const GAP := -6.0
var assertions := 0
var failures := 0
var main: Node
var hits: Array = []
var tick := 0

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PCATK_FAIL ", label)

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _initialize() -> void:
	call_deferred("_run")

func _step() -> void:
	main.world._physics_process(1.0 / 60.0)
	main.world.advance_native_owner_phase()
	main.world.advance_native_birth_phase()

func _on_tel(kind: String, payload: Dictionary) -> void:
	if kind == "player_damage": hits.append({"t": tick, "raw": int(payload.get("raw_amount", -1))})

func _measure(et: int) -> Dictionary:
	hits.clear()
	tick = 0
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	main.set_process(false)
	main.player.set_physics_process(false)
	# 제품 MAP11 stage spawn adapter(부팅 때 묶임)의 실제 구멍 그룹으로 생성한다.
	var g: Dictionary = main.source_state.read_current_g()
	g.on = true
	var made: Dictionary = main.request_native_etype_a_spawn(main.world.get_node("NativeSpawnHoleSystem"), "map11.field.hole.0.group", FIX.recipe(et))
	check(made.get("ready", false), "et%d_spawn:%s" % [et, str(made.get("reason"))])
	if not made.get("ready", false):
		main.free()
		return {}
	var a: Node2D = made.actor
	var pp: Vector2 = main.player.global_position
	a.global_position = pp + Vector2(float(a.radius) + float(main.player.radius) + GAP, 0) # oracle e.x=P.x+e.r+P.r+gap 와 같음
	main.player.iframes = 0.0
	# 같은 상태 맞춤: 장비 자동 석궁(DEMO11-48, 2초 주기)이 측정 적을 쏘면 피격 경직으로 공격 주기가 섞인다 → 시험에서만 끈다.
	main.world.set("_native_auto_crossbow", null)
	main.process_mode = Node.PROCESS_MODE_DISABLED # 수동 틱만(test_demo11_enemy_base2 관례)
	main.player.telemetry_event.connect(_on_tel)
	var atk: int = int(a.attack)
	var rad: float = float(a.radius)
	var spd: float = float(a.data.speed_pixels_per_tick)
	var track: Array = []
	for i in range(TICKS):
		tick = i + 1
		main.player.hp = main.player.max_hp
		main.player.global_position = pp
		_isolate(a)
		_step()
		if not is_instance_valid(a):
			track.append([tick, "actor_freed"])
			break
		if i < 400 or i % 10 == 0: track.append([tick, snappedf(a.global_position.x - pp.x, 0.001), snappedf(a.global_position.y - pp.y, 0.001), str(a.state), snappedf(float(a.get("st2") if a.get("st2") != null else -1), 0.001), a.hp, a.alive])
	var melee: Array = hits.filter(func(h): return h.raw == int(atk * 0.8)).map(func(h): return h.t)
	var iv: Array = []
	for k in range(1, melee.size()): iv.append(int(melee[k]) - int(melee[k - 1]))
	var alive_end: bool = is_instance_valid(a) and a.alive
	var r := {"etype": et, "alive_end": alive_end, "radius": rad, "attack": atk, "speed": spd, "melee_hits": melee.size(), "first_hit": melee[0] if melee.size() else -1,
		"other_hits": hits.size() - melee.size(), "intervals": iv, "track": track, "hits": hits.duplicate(true)}
	main.free()
	return r

## 같은 상태 맞춤: 측정 적 1마리 외 필드 적(시작 링·소환굴)은 매 틱 멀리 둔다(원본 장면도 적 1마리).
func _isolate(a: Node) -> void:
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e != a and e.global_position.distance_to(main.player.global_position) < 3000.0:
			e.global_position = main.player.global_position + Vector2(0, 6000)

func _stats(iv: Array) -> Dictionary:
	if iv.is_empty(): return {"n": 0}
	var s := 0.0
	var lo := 1 << 30
	var hi := -1
	for v in iv:
		s += float(v)
		lo = mini(lo, int(v))
		hi = maxi(hi, int(v))
	return {"n": iv.size(), "min": lo, "max": hi, "mean": s / iv.size()}

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	var node_bin := _arg("node-bin", "")
	var art := _arg("artifacts-dir", "")
	check(not node_bin.is_empty() and not art.is_empty(), "oracle_args")
	if node_bin.is_empty() or art.is_empty():
		_finish({})
		return
	DirAccess.make_dir_recursive_absolute(art)
	var of := art.path_join("melee_oracle.json")
	var output: Array = []
	var code: int = OS.execute(node_bin, PackedStringArray([ProjectSettings.globalize_path("res://tests/pc_boss_chase_oracle.cjs"), "--scene=melee",
		"--etypes=0,4", "--seeds=2", "--ticks=" + str(TICKS), "--gap=" + str(int(GAP)), "--out-file=" + of]), output, true)
	check(code == 0, "oracle_exit:%d" % code)
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(of)) if code == 0 else null
	var out := {}
	for et in [0, 4]:
		var gr: Dictionary = await _measure(et)
		if gr.is_empty() or not oracle is Dictionary: continue
		var orows: Array = oracle.rows.filter(func(r): return int(r.etype) == et)
		var oiv: Array = []
		for r in orows: oiv.append_array(r.intervals)
		var gs := _stats(gr.intervals)
		var os := _stats(oiv)
		var tf := FileAccess.open(art.path_join("melee_godot_et%d.json" % et), FileAccess.WRITE)
		if tf != null:
			tf.store_string(JSON.stringify(gr))
			tf.close()
		out[str(et)] = {"godot": gs, "oracle": os, "godot_first_hit": gr.first_hit, "oracle_first_hit": orows[0].first_hit,
			"godot_radius": gr.radius, "oracle_r": orows[0].r, "godot_attack": gr.attack, "oracle_atk": orows[0].atk, "godot_other_hits": gr.other_hits}
		check(absf(float(gr.radius) - float(orows[0].r)) < 1e-6 and int(gr.attack) == int(orows[0].atk), "et%d_same_body_atk:%s/%s %s/%s" % [et, gr.radius, orows[0].r, gr.attack, orows[0].atk])
		check(int(gr.first_hit) == int(orows[0].first_hit), "et%d_first_hit:%d/%d" % [et, gr.first_hit, orows[0].first_hit])
		check(int(gs.n) >= 50 and int(os.n) >= 50, "et%d_samples:%d/%d" % [et, gs.n, os.n])
		if int(gs.n) > 0 and int(os.n) > 0:
			check(int(gs.min) >= int(os.min) and int(gs.max) <= int(os.max) and int(gs.min) == 40 and int(gs.max) <= 59, "et%d_interval_support:%d..%d/%d..%d" % [et, gs.min, gs.max, os.min, os.max])
			check(absf(float(gs.mean) - float(os.mean)) < 3.0, "et%d_interval_mean:%.2f/%.2f" % [et, gs.mean, os.mean])
	_finish(out)

func _finish(out: Dictionary) -> void:
	print("PCATK_SUMMARY ", JSON.stringify(out))
	print("PCATK_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures}))
	quit(1 if failures else 0)
