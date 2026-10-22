extends SceneTree
## PC-HUD-STATS (2026-10-22) — 웹↔Godot HUD 수치 나란히 캡처용 하니스(제품 코드 수정 없음).
## main.tscn 직접 부팅(사용자 실행 경로) → 가이드 → 커튼 → 레슨 skip → 필드에서
##   1) natural: 실제 신규 시작 상태 덤프 + HUD 1x 캡처
##   2) --inject=<web dump.json>: 웹 상태 덤프의 equipped/STATS/PASSIVES 를 실제 State에 주입
##      → 원본 _grantOssuaryIfNeeded 와 같은 recalcSt→applyStats 재계산 → 웹 현재값(hp/mp/st) 주입
##      → 덤프 + HUD 1x 캡처. 웹 쪽 덤프 방법은 docs/engine/orders/reports/pc-hud-stats_REPORT.md.
##   3) --ossuary-tip: 자동 지급된 유골함을 인벤토리 패널(Mac native_inventory_panel) 장착 상세 카드로 열어 1x 캡처 +
##      아이템 키 덤프(전설/유니크 원시 효과 키 잔존 여부, 91e2774b7 원본 새 16156-16157).
## 실행: 창 모드(렌더 필요), --audio-driver Dummy, override.cfg 격리 user dir.
const USERDIR := "EXODUSER-pc-hud-stats-Isolated-20261022"
## --ossuary-tip 전용: demo11 저장소는 EXODUSER-demo11-* 격리 namespace만 연다(demo_local_storage.accepts_namespace).
const OSS_TIP_USERDIR := "EXODUSER-demo11-pc-hud-stats-Isolated-20261022"
var out := ""
var inject := ""
var oss_tip := false
var tag := "godot"
var main: Node
var rows: Dictionary = {}

func _initialize() -> void: call_deferred("_run")

func secs(s: float) -> void:
	await create_timer(s, true, false, true).timeout

func shot(name: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_texture().get_image()
	img.save_png(out.path_join(name + ".png"))

func _num(v: Variant) -> Variant:
	return v if v is int or v is float else null

func dump(label: String) -> Dictionary:
	var state: Node = main.source_state
	var p: Dictionary = state.read_current_p()
	var g: Dictionary = state.read_current_g()
	var inv: Dictionary = state.read_current_inventory()
	var hud: Node = main.hud
	var keys := ["lv", "hp", "mhp", "mp", "mmp", "st", "mst", "shield", "mshield", "baseAtk", "baseDef", "_altDef", "exp", "maxExp", "sp", "ap"]
	var pv: Dictionary = {}
	for k in keys: pv[k] = _num(p.get(k))
	var regions: Variant = g.get("_regions")
	var reg_rows: Array = []
	if regions is Array:
		for r in regions: reg_rows.append({"id": r.id, "total": r.total, "kills": r.kills, "cleared": r.cleared})
	var snap: Dictionary = main.player.get_snapshot()
	var hud_text: Dictionary = {}
	for n in ["_hp_text", "_mp_text", "_stamina_text", "_cp_label", "_sp_label"]:
		var l: Variant = hud.get(n)
		hud_text[n] = l.text if l is Label else null
	var ov: Variant = hud.get("_objective_values")
	var rects: Dictionary = {}
	if ov is Dictionary:
		for k in ov: hud_text["objective." + str(k)] = ov[k].text if ov[k] is Label else null
		if ov.get("kill") is Label: rects["objective_panel"] = _rect((ov["kill"] as Label).get_parent())
	for n in ["_hp_text", "_stamina_text", "_cp_label"]:
		var l: Variant = hud.get(n)
		if l is Label: rects[n + "_parent"] = _rect((l as Label).get_parent())
	var row := {"label": label, "P": pv, "player": {"hp": snap.get("hp"), "max_hp": snap.get("max_hp"), "stamina": snap.get("stamina"), "max_stamina": snap.get("max_stamina"), "pos": [main.player.global_position.x, main.player.global_position.y]},
		"stats": state.read_current_stats().duplicate(true), "passives": state.read_current_passives().duplicate(true),
		"equipped": inv["equipped"].duplicate(true), "regions": reg_rows, "regCurIdx": g.get("_regCurIdx"), "totalSpawned": g.get("_totalSpawned"),
		"g_on": g.get("on"), "hud": hud_text, "rects": rects, "oss_receipt": _receipt_brief(), "cp": hud._native_calc_cp(p, state.read_current_stats(), state.read_current_passives(), inv["equipped"])}
	rows[label] = row
	print("PCHUD ", label, " ", JSON.stringify({"P": pv, "cp": row.cp, "hud": hud_text, "regions": reg_rows, "reg": row.regCurIdx, "oss": inv["equipped"].get("ossuary") is Dictionary}))
	return row

func _rect(c: Variant) -> Array:
	if not c is Control: return []
	var r: Rect2 = (c as Control).get_global_rect()
	return [roundi(r.position.x), roundi(r.position.y), roundi(r.size.x), roundi(r.size.y)]

func _receipt_brief() -> Dictionary:
	var r: Variant = main.get("native_ossuary_grant_receipt")
	if not r is Dictionary or r.is_empty(): return {}
	return {"granted": r.get("granted"), "reason": r.get("reason"), "rng_draws": r.get("rng_draws"),
		"recalc_st": (r.get("recalc_st", {}) as Dictionary).get("committed"), "apply_stats": (r.get("apply_stats", {}) as Dictionary).get("committed")}

func apply_inject(path: String) -> Dictionary:
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
	if not parsed is Dictionary: return {"ok": false, "reason": "inject_json"}
	var web: Dictionary = parsed.get("field", parsed)
	var state: Node = main.source_state
	var inv: Dictionary = state.read_current_inventory()
	var equipped: Dictionary = inv["equipped"]
	# 하니스 전용 상태 주입(DEMO11-20·PC-RUNTIME-STATS 하니스와 같은 방식): 실제 State 사전 내용 교체.
	for slot in equipped.keys(): equipped[slot] = null
	for slot in web.equipped:
		var it: Variant = web.equipped[slot]
		equipped[slot] = (it as Dictionary).duplicate(true) if it is Dictionary else null
	var stats: Dictionary = state.read_current_stats()
	for k in web.stats: stats[k] = web.stats[k]
	var passives: Dictionary = state.read_current_passives()
	for k in passives.keys(): passives[k] = int(web.passives.get(k, 0))
	var r1: Dictionary = main.request_native_runtime_stat_refresh("recalc_st", "pchud:inject")
	var r2: Dictionary = main.request_native_runtime_stat_refresh("apply_stats", "pchud:inject")
	set_currents(web)
	return {"ok": r1.get("committed") == true and r2.get("committed") == true, "r1": r1.get("reason"), "r2": r2.get("reason")}

func special_keys_left(item: Variant) -> Array:
	var t: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/item_generation_tables.json"))
	var left: Array = []
	for table in ["LEGENDARY_SPECIAL", "UNIQUE_SPECIAL"]:
		for v in (t[table] as Dictionary).values():
			if item is Dictionary and (item as Dictionary).has(str(v["stat"])): left.append(str(v["stat"]))
	return left

func _labels(n: Node, acc: Array) -> Array:
	if n is Label and (n as Label).visible: acc.append((n as Label).text)
	for c in n.get_children(): _labels(c, acc)
	return acc

func ossuary_tip(windowed: bool) -> void:
	var oss: Variant = main.source_state.read_current_inventory()["equipped"].get("ossuary")
	var ui: Variant = main.get("source_inventory_ui")
	var row := {"item": (oss as Dictionary).duplicate(true) if oss is Dictionary else null, "raw_special_keys": special_keys_left(oss), "panel": is_instance_valid(ui)}
	if is_instance_valid(ui) and oss is Dictionary:
		row["opened"] = ui.open_panel()
		ui.selected = oss; ui.selected_source = "eq"; ui.refresh_view()
		for i in 20: await process_frame
		row["detail_labels"] = _labels(ui.detail, [])
		row["detail_rect"] = _rect(ui.detail)
		if windowed: await shot(tag + "_oss_tip")
		ui.close_panel()
	rows["ossuary_tip"] = row
	print("PCHUD ossuary_tip ", JSON.stringify({"raw_special_keys": row.raw_special_keys, "opened": row.get("opened"), "labels": row.get("detail_labels")}))

func set_currents(web: Dictionary) -> void:
	main.player.hp = float(web.hp)
	main.player.stamina = float(web.st)
	main.source_resources.get("_owned")["mp"] = float(web.mp)
	main.source_state.get("_p")["shield"] = float(web.get("shield", 0.0))

func freeze() -> void:
	# 재생(regen)으로 수치가 움직이지 않도록 World(자원·플레이어 포함)를 멈춘다. HUD는 계속 갱신.
	main.world.process_mode = Node.PROCESS_MODE_DISABLED
	main.player.process_mode = Node.PROCESS_MODE_DISABLED

func _run() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="): out = a.trim_prefix("--out=")
		elif a.begins_with("--inject="): inject = a.trim_prefix("--inject=")
		elif a.begins_with("--tag="): tag = a.trim_prefix("--tag=")
		elif a == "--ossuary-tip": oss_tip = true
	if OS.get_user_data_dir().get_file() != (OSS_TIP_USERDIR if oss_tip else USERDIR) or out.is_empty():
		print("PCHUD_REFUSE ", OS.get_user_data_dir()); quit(2); return
	DirAccess.make_dir_recursive_absolute(out)
	var windowed := DisplayServer.get_name() != "headless"
	if windowed:
		root.size = Vector2i(1920, 1080); root.content_scale_size = Vector2i(1920, 1080)
	main = load("res://scenes/main.tscn").instantiate()
	# --ossuary-tip: 인벤토리 패널 owner가 있는 demo11 저장 경로(test_demo11_23b_inventory와 같은 부팅, 인트로 없음)
	if oss_tip: main.set_meta("demo11_storage", true)
	else: main.set_meta("native_intro_boot", "intro")
	root.add_child(main); current_scene = main
	for i in 10: await process_frame
	var seq: Node = main.get("source_intro_sequence")
	if is_instance_valid(seq):
		await secs(0.9)
		for k in 3: seq.advance_native_guide(); await secs(0.5)
		seq.finish_native_guide()
		await secs(1.6)
		var deadline := Time.get_ticks_msec() + 7000
		while Time.get_ticks_msec() < deadline:
			if is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: break
			await process_frame
		await secs(1.0)
		if is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: seq.lesson_flow.skip_all()
	await secs(1.5)
	if oss_tip and main.get("source_state") == null:
		print("PCHUD_BOOT_STOP ", JSON.stringify(main.get("_demo11_load_result"))); quit(3); return
	if oss_tip:
		var until := Time.get_ticks_msec() + 9000
		while Time.get_ticks_msec() < until and (main.get("native_ossuary_grant_receipt") as Dictionary).is_empty(): await process_frame
	if oss_tip and (main.get("native_ossuary_grant_receipt") as Dictionary).is_empty():
		# 저장 경로 부팅은 인트로 커튼이 없어 G.on 첫 프레임 훅이 돌지 않는다 → 같은 State 진입점을 하니스가 직접 호출(데모 RNG·시계는 실제 World/Main).
		var g: Dictionary = main.source_state.apply_native_ossuary_grant_if_needed(main, Callable(main.world, "sample_native_random_unit"), Callable(main, "_source_now_ms"), true)
		var r1: Dictionary = main.request_native_runtime_stat_refresh("recalc_st", "pchud:oss_tip")
		var r2: Dictionary = main.request_native_runtime_stat_refresh("apply_stats", "pchud:oss_tip")
		rows["oss_tip_direct_grant"] = {"granted": g.get("granted"), "reason": g.get("reason"), "recalc": r1.get("committed"), "apply": r2.get("committed")}
		print("PCHUD oss_tip_direct_grant ", JSON.stringify(rows["oss_tip_direct_grant"]))
	dump("natural")
	if windowed: await shot(tag + "_natural")
	if oss_tip: await ossuary_tip(windowed)
	if not inject.is_empty():
		var r := apply_inject(inject)
		print("PCHUD inject ", JSON.stringify(r))
		freeze()
		var web: Dictionary = (JSON.parse_string(FileAccess.get_file_as_string(inject)) as Dictionary).get("field")
		for i in 40: await process_frame
		dump("inject")
		rows["inject_result"] = r
		rows["web"] = {"hp": web.hp, "mhp": web.mhp, "mp": web.mp, "mmp": web.mmp, "st": web.st, "mst": web.mst, "cp": web.cp, "hud": web.hud}
		if windowed: await shot(tag + "_inject")
	var f := FileAccess.open(out.path_join(tag + "_dump.json"), FileAccess.WRITE)
	f.store_string(JSON.stringify(rows, " ")); f.close()
	freeze() # 종료 중 World 틱(자동 석궁 등)이 해제 중인 owner를 읽지 않도록 먼저 멈춘다.
	paused = false
	if is_instance_valid(current_scene): current_scene.queue_free()
	await secs(0.3)
	quit(0)
