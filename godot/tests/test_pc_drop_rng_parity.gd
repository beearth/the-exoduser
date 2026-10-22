extends SceneTree
## PC-BOSS-CHASE C-06 (2026-10-22) — 처치 드랍 rollDrop: 같은 RNG 단위를 원본 VM(pc_drop_oracle.cjs)과 Godot 포트
## (port_modules/kill_reward/drop_item_source.gd roll_drop)에 주입해 결과를 1:1 대조한다.
## 원본: game.html(dee094fd) rollDrop 32004–32079, mkItem·rollAffixes(15137 _DEMO_MODE&&_DEMO_AFFIX_BANNED)·
##   mkBonePart 45790·mkSocketStone 15346, _DEMO_MODE 16648 = (EXODUSER_BUILD_TARGET||'demo')==='demo'.
## 표본: 일반 160 + 정예 40 = 200 사례 × 데모/정식 2모드. 사례마다 결정적 xorshift 단위 1500개.
## 인자: --node-bin=<node.exe> --artifacts-dir=<dir>  (NODE_PATH 에 acorn)
const DROP_SOURCE = preload("res://port_modules/kill_reward/drop_item_source.gd")
const USERDIR := "EXODUSER-pc-boss-chase-Isolated-20261022"
const N_NORMAL := 160
const N_ELITE := 40
var assertions := 0
var failures := 0

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PCDROP_FAIL ", label)

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _initialize() -> void:
	call_deferred("_run")

var _xs := 1
func _xor() -> float:
	_xs ^= (_xs << 13) & 0xffffffff
	_xs ^= _xs >> 17
	_xs ^= (_xs << 5) & 0xffffffff
	_xs &= 0xffffffff
	return float(_xs) / 4294967296.0

func _cases() -> Array:
	var out: Array = []
	_xs = 20261022
	for i in range(N_NORMAL + N_ELITE):
		var u: Array = []
		for k in range(1500): u.append(_xor())
		var elite: int = 1 if i >= N_NORMAL else 0
		out.append({"units": u, "enemy": {"x": 1000.0 + i, "y": 2000.0 - i, "etype": 0, "elite": elite, "ib": false, "dropTier": 0},
			"plv": [1, 5, 30, 100][i % 4], "drop_bonus": 1.0, "min_pick_rar": 0, "min_pick_lv_tier": 0})
	return out

func _godot(c: Dictionary, demo: bool) -> Dictionary:
	var units: Array = c.units
	var idx := [0]
	var d: RefCounted = DROP_SOURCE.new(func(_tag): idx[0] += 1; return units[idx[0] - 1] if idx[0] <= units.size() else null)
	d.demo_mode = demo
	var e: Dictionary = c.enemy
	var r: Variant = d.roll_drop({"ib": false, "etype": int(e.etype), "elite": int(e.elite), "drop_tier": int(e.dropTier), "x": float(e.x), "y": float(e.y)},
		{"stage": 0, "drop_bonus": float(c.drop_bonus), "min_pick_rar": 0, "min_pick_lv_thr": -1, "plv": int(c.plv),
			"crystal_bag_len": 0, "crystal_bag_max": 9999, "stone_bag_len": 0, "stone_bag_max": 9999})
	return {"draws": idx[0], "result": r}

## JSON 왕복으로 숫자 형 차이(int/float)를 지우고 같음 비교. 부동소수는 1e-9 상대오차까지 같음.
func _same(a: Variant, b: Variant, path: String, diffs: Array) -> void:
	if (a is int or a is float) and (b is int or b is float):
		if absf(float(a) - float(b)) > 1e-9 * maxf(1.0, absf(float(a))): diffs.append(path + ":" + str(a) + "!=" + str(b))
		return
	if a is Dictionary and b is Dictionary:
		var keys: Dictionary = {}
		for k in a.keys(): keys[k] = true
		for k in b.keys(): keys[k] = true
		for k in keys.keys(): _same(a.get(k), b.get(k), path + "." + str(k), diffs)
		return
	if a is Array and b is Array:
		if a.size() != b.size():
			diffs.append(path + ":len " + str(a.size()) + "!=" + str(b.size()))
			return
		for i in range(a.size()): _same(a[i], b[i], path + "[" + str(i) + "]", diffs)
		return
	if str(a) != str(b): diffs.append(path + ":" + str(a) + "!=" + str(b))

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	var node_bin := _arg("node-bin", "")
	var art := _arg("artifacts-dir", "")
	check(not node_bin.is_empty() and not art.is_empty(), "oracle_args")
	if node_bin.is_empty() or art.is_empty():
		_finish()
		return
	DirAccess.make_dir_recursive_absolute(art)
	var cases := _cases()
	var summary := {}
	for demo in [true, false]:
		var tag := "demo" if demo else "full"
		var cf := art.path_join("drop_cases_%s.json" % tag)
		var of := art.path_join("drop_oracle_%s.json" % tag)
		var f := FileAccess.open(cf, FileAccess.WRITE)
		f.store_string(JSON.stringify(cases.map(func(c): var cc: Dictionary = c.duplicate(true); cc["demo"] = demo; return cc)))
		f.close()
		var output: Array = []
		var oracle_js := ProjectSettings.globalize_path("res://tests/pc_drop_oracle.cjs")
		var code: int = OS.execute(node_bin, PackedStringArray([oracle_js, "--cases-file=" + cf, "--out-file=" + of]), output, true)
		check(code == 0, "%s_oracle_exit:%d %s" % [tag, code, "".join(output).left(300)])
		if code != 0: continue
		var oracle: Array = JSON.parse_string(FileAccess.get_file_as_string(of))
		var mism := 0
		var dropped_o := 0
		var dropped_g := 0
		var rare := [0, 0, 0, 0, 0, 0]
		var crystals := 0
		var stones := 0
		var bones := 0
		var banned_g := 0
		for i in range(cases.size()):
			var g := _godot(cases[i], demo)
			var o: Dictionary = oracle[i]
			var gr: Dictionary = g.result if g.result is Dictionary else {}
			var g_items: Array = gr.get("world_items", [])
			var diffs: Array = []
			if o.get("error") != null: diffs.append("oracle_error:" + str(o.error))
			if int(g.draws) != int(o.draws): diffs.append("draws %d!=%d" % [g.draws, o.draws])
			_same(JSON.parse_string(JSON.stringify(g_items)), o.items, "items", diffs)
			_same(JSON.parse_string(JSON.stringify(gr.get("crystal"))), o.crystal, "crystal", diffs)
			_same(gr.get("stone").get("q") if gr.get("stone") is Dictionary else null, o.stone.get("q") if o.stone is Dictionary else null, "stone.q", diffs)
			if not diffs.is_empty():
				mism += 1
				if mism <= 3: print("PCDROP_DIFF ", tag, " case=", i, " ", JSON.stringify(diffs.slice(0, 6)))
			var gear := g_items.filter(func(w): return str((w.item as Dictionary).get("slot")) != "bonePart")
			if not gear.is_empty(): dropped_g += 1
			if (o.items as Array).any(func(w): return str(w.item.get("slot")) != "bonePart"): dropped_o += 1
			for w in gear:
				rare[int(w.item.rarity)] += 1
				for a in w.item.get("affixes", []):
					if str(a.get("id")) in DROP_SOURCE.DEMO_BANNED: banned_g += 1
			if gr.get("crystal") != null: crystals += 1
			if gr.get("stone") != null: stones += 1
			if gr.get("bone") != null: bones += 1
		summary[tag] = {"cases": cases.size(), "mismatch": mism, "gear_drop_cases_godot": dropped_g, "gear_drop_cases_oracle": dropped_o,
			"rarity_hist_godot": rare, "crystal": crystals, "stone": stones, "bone": bones, "banned_affix_in_godot": banned_g}
		check(mism == 0, "%s_drop_rng_parity_mismatch:%d" % [tag, mism])
		if demo: check(banned_g == 0, "demo_no_banned_affix:%d" % banned_g)
	# 일반 몹 드랍 확률(원본 32018 baseChance .45×dropBonus): 같은 단위 주입이라 양쪽 표본 비율이 같아야 한다.
	print("PCDROP_SUMMARY ", JSON.stringify(summary))
	_finish()

func _finish() -> void:
	print("PCDROP_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures}))
	quit(1 if failures else 0)
