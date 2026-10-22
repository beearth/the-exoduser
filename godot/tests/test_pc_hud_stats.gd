extends SceneTree
## PC-HUD-STATS (2026-10-22) — HUD 수치(H-03) 원인 이식 검증. 실제 부팅 Main.
##  A. 원본 draw() G51733 → _grantOssuaryIfNeeded() G45880~45889: G.on 첫 렌더 프레임에 세션당 1회
##     유니크 '전대의 유골함' 자동 장착 → recalcSt → applyStats (mmp +150, 현재 자원 무료 충전 없음)
##  B. 같은 State 진입점을 스크립트 RNG로 돌린 결과 = 원본 mkItem/_grantOssuaryIfNeeded (node VM 오라클)
##  C. 지급 후 applyStats 결과 = 원본 applyStats (pc_runtime_stat_refresh_oracle.mjs), calcCP = 원본 calcCP
##  D. 웹 상태 덤프(tests/pc_hud_stats_web_fixture_20261022.json) 주입 → HUD 수치 = 실제 웹 화면 수치
##  E. 시작 장비 25개 홈 상태 관찰(현 원본 G16148~16151은 닫힌 0홈 — 포트 보류, 판정 제외)
##  F. 웹 1-1 구조(map.json)의 소환굴 → 지역 분모 = 웹(23/60/53/32, 시작 남동 32). 현 MAP11 provider 값은 정보로만 기록(Mac 맵 소관)
const USERDIR := "EXODUSER-pc-hud-stats-Isolated-20261022"
const FIXTURE := "res://tests/pc_hud_stats_web_fixture_20261022.json"
const HOLES := preload("res://scripts/native_spawn_hole_system.gd")
const REGIONS := preload("res://scripts/native_regions.gd")
const STAT_FIELDS := ["mhp", "mmp", "mst", "mshield", "hpR", "stR", "mpR", "speed", "_oocSpeed", "baseDef", "baseAtk", "_effStats", "_crystalStats"]
var checks := 0
var failures := 0
var main: Node
var state: Node
var summary: Dictionary = {}

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCHUD_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func secs(s: float) -> void:
	await create_timer(s, true, false, true).timeout

func same_value(a: Variant, b: Variant) -> bool:
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size(): return false
		for key in a:
			if not b.has(key) or not same_value(a[key], b[key]): return false
		return true
	if a is Array and b is Array:
		if a.size() != b.size(): return false
		for i in a.size():
			if not same_value(a[i], b[i]): return false
		return true
	if (a is int or a is float) and (b is int or b is float):
		return absf(float(a) - float(b)) <= 1e-9 * maxf(1.0, absf(float(b)))
	return a == b

func p() -> Dictionary: return state.read_current_p()
func equipped() -> Dictionary: return state.read_current_inventory()["equipped"]
func hud_cp() -> int: return main.hud._native_calc_cp(p(), state.read_current_stats(), state.read_current_passives(), equipped())

func run_node(script: String, cases: Array, tag: String) -> Variant:
	var cases_path := ProjectSettings.globalize_path("user://pchud-%s-cases.json" % tag)
	var out_path := ProjectSettings.globalize_path("user://pchud-%s-out.json" % tag)
	var f := FileAccess.open(cases_path, FileAccess.WRITE); f.store_string(JSON.stringify(cases)); f.close()
	var source := argument("--source-game")
	if source.is_empty(): source = ProjectSettings.globalize_path("res://source_snapshot/game.html")
	var code := OS.execute(argument("--node-bin"), PackedStringArray([ProjectSettings.globalize_path(script),
		"--source-game=" + source, "--cases-file=" + cases_path, "--out-file=" + out_path]), [], true)
	check(code == 0, tag + " oracle exit 0")
	return JSON.parse_string(FileAccess.get_file_as_string(out_path))

func runtime_case(name: String, before: Dictionary, inv_equipped: Dictionary) -> Dictionary:
	var signed: Variant = main.source_initialization_services.read_native_signed_difficulty()
	var diff_value: float = float(signed.get("value", 0)) if signed is Dictionary else float(signed)
	var grit_container: Variant = main.source_providers.get_provider_bundle()["raw_grit"]
	var grit: Variant = grit_container.read_raw().get("raw") if is_instance_valid(grit_container) else null
	return {"name": name, "mode": "apply_stats", "P": before, "G": state.read_current_g().duplicate(true),
		"STATS": state.read_current_stats().duplicate(true), "PASSIVES": state.read_current_passives().duplicate(true),
		"INV": {"equipped": inv_equipped}, "grit": grit, "diff": diff_value + 5.0}

func drive_to_field() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main); current_scene = main
	for i in 10: await process_frame
	state = main.source_state
	var seq: Node = main.get("source_intro_sequence")
	check(is_instance_valid(seq), "intro sequence present (G.on owner)")
	await secs(0.9)
	for k in 3:
		seq.advance_native_guide(); await secs(0.4)
	# A-pre: G.on 이전에는 지급 없음(원본 draw()는 G.on일 때만 호출).
	check(state.read_current_g().get("on") != true, "A pre: G.on false before curtain open")
	check(equipped().get("ossuary") == null and main.native_ossuary_grant_receipt.is_empty() and main.get("_native_oss_grant_checked") == false, "A pre: no ossuary before first G.on render frame")
	summary["pre"] = {"P": p().duplicate(true), "cp": hud_cp(), "equipped": equipped().duplicate(true), "draws": main.world.get_native_runtime_snapshot()["random_draw_count"]}
	seq.finish_native_guide()
	var deadline := Time.get_ticks_msec() + 9000
	while Time.get_ticks_msec() < deadline and main.native_ossuary_grant_receipt.is_empty():
		await process_frame

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	check(not argument("--node-bin").is_empty(), "explicit node binary")
	if failures > 0: quit(1); return
	await drive_to_field()
	var pre: Dictionary = summary["pre"]
	var receipt: Dictionary = main.native_ossuary_grant_receipt
	# ── A: 실제 G.on 첫 렌더 프레임 지급 ──
	check(state.read_current_g().get("on") == true, "A: G.on true after curtain open")
	check(receipt.get("granted") == true, "A: ossuary granted on first G.on frame: " + str(receipt.get("reason")))
	check((receipt.get("recalc_st", {}) as Dictionary).get("committed") == true and (receipt.get("apply_stats", {}) as Dictionary).get("committed") == true, "A: recalcSt then applyStats committed (G45888-45889)")
	var oss: Variant = equipped().get("ossuary")
	check(oss is Dictionary and is_same(oss, receipt.get("item")), "A: INV.equipped.ossuary is the granted item")
	var after: Dictionary = p().duplicate(true)
	check(float(after.mmp) == float(pre.P.mmp) + 150.0, "A: mmp +150 (bonusMp 150 via _totalBonusMp) %s -> %s" % [str(pre.P.mmp), str(after.mmp)])
	check(float(after.mhp) == float(pre.P.mhp) and float(after.mst) == float(pre.P.mst), "A: mhp/mst unchanged by ossuary (no HP/ST field)")
	check(float(after.mp) < float(after.mmp) and float(after.mp) <= float(pre.P.mmp) + 5.0, "A: current MP not refilled (source clamp policy; regen only)")
	check(float(after.hp) == float(after.mhp), "A: HP stays full (no clamp change)")
	check(int(receipt.get("rng_draws", -1)) > 0, "A: grant consumed shared World RNG")
	var cp_after := hud_cp()
	# ── C: applyStats/calcCP 원본 오라클 ──
	var inv_case: Dictionary = (pre.equipped as Dictionary).duplicate(true)
	inv_case["ossuary"] = (oss as Dictionary).duplicate(true)
	var rt: Variant = run_node("res://tests/pc_runtime_stat_refresh_oracle.mjs", [runtime_case("grant_apply_stats", pre.P, inv_case)], "rt")
	var compared := 0
	if rt is Dictionary and rt.get("rows", []).size() == 1:
		var row: Dictionary = rt.rows[0]
		check(row.get("error") == null, "C: applyStats oracle no throw: " + str(row.get("error")))
		for field in STAT_FIELDS:
			if not row.p.has(field): continue
			compared += 1
			check(same_value(after.get(field), row.p[field]), "C: %s port=%s original=%s" % [field, str(after.get(field)), str(row.p[field])])
	else: check(false, "C: runtime oracle rows")
	var cp_cases := [
		{"name": "cp_pre", "kind": "calc_cp", "P": pre.P, "STATS": state.read_current_stats(), "PASSIVES": state.read_current_passives(), "equipped": pre.equipped},
		{"name": "cp_after", "kind": "calc_cp", "P": after, "STATS": state.read_current_stats(), "PASSIVES": state.read_current_passives(), "equipped": equipped()}]
	# ── B: 같은 State 진입점 + 스크립트 RNG = 원본 _grantOssuaryIfNeeded/mkItem ──
	var rng := RandomNumberGenerator.new(); rng.seed = 20261022
	var b_cases: Array = []
	for k in 3:
		var seq_values: Array = []
		for i in 160: seq_values.append(snappedf(rng.randf(), 1e-12))
		b_cases.append({"name": "grant_%d" % k, "kind": "grant", "lv": 1, "demo": k != 1, "rng": seq_values, "equipped": {"ossuary": null}, "bag": []})
	var b_port: Array = []
	var keep_oss: Variant = equipped()["ossuary"]
	for c in b_cases:
		equipped()["ossuary"] = null
		var seq := Seq.new(c.rng)
		var r: Dictionary = state.apply_native_ossuary_grant_if_needed(main, Callable(seq, "next"), Callable(seq, "zero"), c.demo)
		b_port.append({"r": r, "used": seq.i})
	equipped()["ossuary"] = keep_oss
	var oracle: Variant = run_node("res://tests/pc_hud_stats_oracle.mjs", b_cases + cp_cases, "grant")
	if oracle is Dictionary and oracle.get("rows", []).size() == b_cases.size() + 2:
		for i in b_cases.size():
			var row: Dictionary = oracle.rows[i]
			check(row.error == null, "B %s oracle no throw: %s" % [row.name, str(row.error)])
			check(b_port[i].r.get("granted") == true, "B %s port granted" % row.name)
			check(same_value(b_port[i].r.get("item"), row.item), "B %s item == original mkItem('ossuary',0,EL.P,5)\n port=%s\n orig=%s" % [row.name, JSON.stringify(b_port[i].r.get("item")), JSON.stringify(row.item)])
			check(int(b_port[i].used) == int(row.draws) and int(b_port[i].r.get("rng_draws")) == int(row.draws), "B %s RNG draws port=%d original=%d" % [row.name, b_port[i].used, row.draws])
			check(row.calls == ["notify", "addTxt", "recalcSt", "applyStats"], "B %s original call order (display notify/addTxt are Mac-owned)" % row.name)
		var cp_pre_o: int = int(oracle.rows[b_cases.size()].cp.total)
		var cp_after_o: int = int(oracle.rows[b_cases.size() + 1].cp.total)
		check(cp_pre_o == int(pre.cp) and cp_after_o == cp_after, "C: calcCP original pre=%d/%d after=%d/%d" % [cp_pre_o, int(pre.cp), cp_after_o, cp_after])
		summary["oracle_functions"] = oracle.get("source_functions")
	else: check(false, "B: oracle rows complete")
	# 재진입·가방·외부 owner 거절 (원본 45881/45882 가드)
	var draws0: int = main.world.get_native_runtime_snapshot()["random_draw_count"]
	var again: Dictionary = state.apply_native_ossuary_grant_if_needed(main, Callable(main.world, "sample_native_random_unit"), Callable(main, "_source_now_ms"), true)
	check(again.get("granted") == false and again.get("reason") == "ossuary_already_equipped", "guard: already equipped (G45881)")
	var bag: Array = state.read_current_inventory()["bag"]
	equipped()["ossuary"] = null; bag.append(keep_oss)
	var in_bag: Dictionary = state.apply_native_ossuary_grant_if_needed(main, Callable(main.world, "sample_native_random_unit"), Callable(main, "_source_now_ms"), true)
	check(in_bag.get("granted") == false and in_bag.get("reason") == "ossuary_in_bag", "guard: ossuary in bag (G45882)")
	bag.erase(keep_oss); equipped()["ossuary"] = keep_oss
	var stranger := Node.new()
	var foreign: Dictionary = state.apply_native_ossuary_grant_if_needed(stranger, Callable(main.world, "sample_native_random_unit"), Callable(main, "_source_now_ms"), true)
	stranger.free()
	check(foreign.get("granted") == false and foreign.get("reason") == "ossuary_grant_owner_not_current", "guard: foreign owner rejected")
	check(main.world.get_native_runtime_snapshot()["random_draw_count"] == draws0, "guards consume no RNG")
	await secs(0.3)
	check(is_same(main.native_ossuary_grant_receipt, receipt), "A: session check runs once (window._ossGrantChk)")
	# ── E: 시작 장비 닫힌 0홈 ──
	var starter: Array = []
	for slot in equipped():
		if equipped()[slot] is Dictionary and slot != "ossuary": starter.append(equipped()[slot])
	for it in state.read_current_inventory()["bag"]: starter.append(it)
	check(starter.size() == 25, "E: 15 equipped + 10 bag starter items (%d)" % starter.size())
	var closed := 0
	for it in starter:
		if it.get("socketCount") == 0 and it.get("crystals") == [] and it.get("socketQ") == []: closed += 1
	# 현 원본 G16148-16151은 닫힌 0홈. 포트 시작 장비는 아직 구 1~4홈 롤(보류: seeded RNG 고정 데이터를 쓰는
	# Mac test_pc_combat_pack_b_mac가 RNG 소비 위치에 의존해 함께 조정해야 함). 판정 제외, 관찰값만 기록.
	summary["starter_sockets_observed"] = {"closed_0_socket": closed, "total": starter.size(), "source": "G16148-16151 closed 0-socket", "status": "HOLD"}
	# ── D: 웹 상태 덤프 주입 → HUD 수치 = 웹 ──
	var fx: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(FIXTURE))
	for slot in equipped().keys(): equipped()[slot] = null
	for slot in fx.equipped:
		equipped()[slot] = (fx.equipped[slot] as Dictionary).duplicate(true) if fx.equipped[slot] is Dictionary else null
	var stats: Dictionary = state.read_current_stats()
	for k in fx.stats: stats[k] = fx.stats[k]
	var passives: Dictionary = state.read_current_passives()
	for k in passives.keys(): passives[k] = int(fx.passives.get(k, 0))
	var d1: Dictionary = main.request_native_runtime_stat_refresh("recalc_st", "pchud:fixture")
	var d2: Dictionary = main.request_native_runtime_stat_refresh("apply_stats", "pchud:fixture")
	check(d1.get("committed") == true and d2.get("committed") == true, "D: fixture refresh committed")
	main.player.hp = float(fx.P.hp); main.player.stamina = float(fx.P.st)
	main.source_resources.get("_owned")["mp"] = float(fx.P.mp); state.get("_p")["shield"] = float(fx.P.shield)
	var dp: Dictionary = p()
	for k in ["mhp", "mmp", "mst", "mshield", "baseAtk", "baseDef"]:
		check(same_value(dp[k], fx.P[k]), "D: %s godot=%s web=%s" % [k, str(dp[k]), str(fx.P[k])])
	check(hud_cp() == int(fx.cp.total), "D: calcCP godot=%d web=%d" % [hud_cp(), int(fx.cp.total)])
	main.world.process_mode = Node.PROCESS_MODE_DISABLED; main.player.process_mode = Node.PROCESS_MODE_DISABLED
	main.hud._refresh()
	check(main.hud._cp_label.text == fx.hud.cpHud, "D: HUD CP label %s == web %s" % [main.hud._cp_label.text, fx.hud.cpHud])
	var hp_t: String = main.hud._hp_text.text; var mp_t: String = main.hud._mp_text.text; var st_t: String = main.hud._stamina_text.text
	check(hp_t.ends_with("%s\n/ %s" % [fx.hud.hpCur, fx.hud.hpMax.trim_prefix("/ ")]), "D: HP text numbers = web %s %s (godot %s)" % [fx.hud.hpCur, fx.hud.hpMax, hp_t.c_escape()])
	check(mp_t.ends_with("%s\n/ %s" % [fx.hud.mpCur, fx.hud.mpMax.trim_prefix("/")]), "D: MP text numbers = web %s %s (godot %s)" % [fx.hud.mpCur, fx.hud.mpMax, mp_t.c_escape()])
	check(st_t.ends_with("%s\n/ %s" % [fx.hud.stCur, fx.hud.stMax.trim_prefix("/")]), "D: right orb (web SP label = P.st) numbers = web %s %s (godot %s)" % [fx.hud.stCur, fx.hud.stMax, st_t.c_escape()])
	check("◇ " + _comma(hud_cp()) == fx.hud.cpHud, "D: CP text = web %s" % fx.hud.cpHud)
	summary["fixture_hud"] = {"hp": hp_t, "mp": mp_t, "st": st_t, "cp": "◇ " + _comma(hud_cp())}
	# ── F: 지역 분모(웹 1-1 구조) ──
	var map: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/map.json"))
	var placement: Dictionary = HOLES.build_native_placement(map)
	check(placement.get("valid") == true, "F: native hole placement on web 1-1 map.json")
	var holes: Array = placement.get("holes", [])
	var web_holes: Array = fx.spawnHoles
	var hole_same := holes.size() == web_holes.size()
	if hole_same:
		for i in holes.size():
			if absf(float(holes[i].x) - float(web_holes[i].x)) > 0.5 or absf(float(holes[i].y) - float(web_holes[i].y)) > 0.5 or absf(float(holes[i].size) - float(web_holes[i].size)) > 1e-9: hole_same = false
	check(hole_same, "F: holes == web G.spawnHoles (%d)" % holes.size())
	var g_probe: Dictionary = {"stage": 0, "spawnHoles": holes, "_fbDone": false, "_fbSpawned": false}
	var init: Dictionary = REGIONS.init_regions(g_probe, Vector2(fx.start[0], fx.start[1]), int(map.width), int(map.height), true)
	var totals: Array = []
	for r in g_probe.get("_regions", []): totals.append(int(r.total))
	var web_totals: Array = []
	for r in fx.regions: web_totals.append(int(r.total))
	check(init.get("ready") == true and totals == web_totals and int(g_probe._regCurIdx) == int(fx.regCurIdx), "F: region totals %s == web %s, start idx %s == %s" % [str(totals), str(web_totals), str(g_probe.get("_regCurIdx")), str(fx.regCurIdx)])
	var live_g: Dictionary = state.read_current_g()
	var live_totals: Array = []
	if live_g.get("_regions") is Array:
		for r in live_g._regions: live_totals.append(int(r.total))
	summary["live_map11_region_totals"] = {"totals": live_totals, "cur": live_g.get("_regCurIdx"), "note": "MAP11 provider(Mac PARITY-MAP-01) — 정보 기록, 판정 제외"}
	var artifacts := argument("--artifacts-dir")
	var out := {"assertions": checks, "failures": failures, "applyStats_fields_compared": compared, "grant_rng_draws": receipt.get("rng_draws"),
		"pre_mmp": pre.P.mmp, "after_mmp": after.mmp, "pre_cp": pre.cp, "after_cp": cp_after}
	summary["result"] = out
	if not artifacts.is_empty():
		var f := FileAccess.open(artifacts.path_join("pc_hud_stats_summary.json"), FileAccess.WRITE)
		if f != null: f.store_string(JSON.stringify(summary, "  ", false)); f.close()
	print("PCHUD_RESULT ", JSON.stringify(out))
	paused = false
	main.queue_free()
	for i in 12: await process_frame
	await secs(0.2)
	quit(1 if failures > 0 else 0)

class Seq extends RefCounted:
	var vals: Array
	var i := 0
	func _init(v: Array) -> void: vals = v
	func next() -> float:
		var v: float = vals[i]; i += 1; return v
	func zero() -> float: return 0.0

func _comma(n: int) -> String:
	var s := str(absi(n)); var o := ""
	while s.length() > 3:
		o = "," + s.substr(s.length() - 3) + o; s = s.substr(0, s.length() - 3)
	return ("-" if n < 0 else "") + s + o
