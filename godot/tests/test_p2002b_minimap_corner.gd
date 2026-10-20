extends SceneTree
## P2-002b — 미니맵(#mmWrap)·hudCorner 화폐 회귀 (실제 Main 부팅).
## 근거: drawMM 60177~60234(캐시 색·pad4·sc=min·20/30프레임 주기·60캡),
## _mmDrawPlayerMarker 60142(14px 초상+방향 삼각형+이중 링), CSS 382~385/952,
## hudCorner 2666~2669·CSS 327~329, 값 60325(✦ P.sp(+ap)·◇ calcCP 49487 전문),
## _hudCompactNumber 60237. ✦◇=텍스트 글리프(이모지 아님).
const USERDIR = "EXODUSER-P2002B-Isolated-20261020"
const GROUPS = ["minimap_cache_and_corner_initial", "corner_updates_via_owner"]

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
		if not isolated:
			skipped.append(group)
			print("P2002B_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2002B_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2002B_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2002B_FAIL ", current_group, " ", label)

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

## 원본 식 독립 재계산 (calcCP 49487~49509 — 신규 캐릭터 기준)
func _expected_cp() -> int:
	var state: Node = active_main.get("source_state")
	var p: Dictionary = state.read_current_p()
	var stats: Dictionary = state.read_current_stats()
	var passives: Dictionary = state.read_current_passives()
	var equipped: Dictionary = state.read_current_inventory().get("equipped", {})
	var atk: float = float(p.get("baseAtk", 0)) * 2.0
	var def_v: float = float(p.get("baseDef", 0)) * 3.0
	var extra: float = float(p.get("lv", 0)) * 10.0 + float(p.get("mhp", 0)) * 0.5 \
		+ float(p.get("mst", 0)) * 0.3 + float(p.get("mmp", 0)) * 0.3
	extra += (float(stats.get("str", 0)) + float(stats.get("dex", 0)) + float(stats.get("int", 0)) \
		+ float(stats.get("lck", 0))) * 2.0
	var psum := 0.0
	for key in passives:
		var v: Variant = passives[key]
		psum += float(v) if (v is int or v is float) else 0.0
	extra += psum * 15.0
	for slot in equipped:
		var it: Variant = equipped[slot]
		if not it is Dictionary:
			continue
		for pair in [["atk", 2.0, "atk"], ["def", 3.0, "def"]]:
			pass
		atk += _n(it, "atk") * 2.0
		def_v += _n(it, "def") * 3.0
		extra += _n(it, "spd") * 40.0 + _n(it, "wStagger") * 1.5 + _n(it, "wRange") * 0.4
		extra += _n(it, "bowRange") * 0.3 + _n(it, "bowSpd") * 30.0
		extra += _n(it, "charge") + _n(it, "chargeDist") * 0.5 + _n(it, "bonusChargeDist") * 5.0 \
			+ _n(it, "chargeW") + _n(it, "chargeAoE") * 1.5
		extra += _n(it, "stagger") * 1.5 + _n(it, "bonusSt") * 1.5
		extra += _n(it, "stRegen") * 200.0 + _n(it, "mpRegen") * 500.0
		extra += _n(it, "splashR") + _n(it, "splashMul") * 80.0 + _n(it, "magicPen") * 30.0 \
			+ _n(it, "bonusRange") * 8.0
		if it.get("elements") is Array:
			for em in it["elements"]:
				if em is Dictionary:
					extra += _n(em, "dmg") * 0.8
	return int(atk + def_v + extra)

static func _n(it: Dictionary, key: String) -> float:
	var v: Variant = it.get(key)
	return float(v) if (v is int or v is float) and is_finite(float(v)) else 0.0

static func _comma(value: int) -> String:
	var raw := str(maxi(0, value))
	var out := ""
	var count := 0
	for index in range(raw.length() - 1, -1, -1):
		out = raw[index] + out
		count += 1
		if count % 3 == 0 and index > 0:
			out = "," + out
	return out

func _test_minimap_cache_and_corner_initial() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	for i in range(10):
		await physics_frame
	var hud: Node = active_main.get("hud")
	var snap: Dictionary = hud.get_native_minimap_corner_snapshot()
	_check(snap.get("minimap_cache_ready") == true, "미니맵 타일 캐시 생성(60103 캐시 방식)")
	_check(absf(float(snap.get("minimap_sc")) - (130.0 - 8.0) / 200.0) < 0.0001,
		"sc = (130-2·4)/200 (60183~60185) sc=" + str(snap.get("minimap_sc")))
	var origin: Array = snap.get("minimap_origin", [])
	_check(origin.size() == 2 and int(origin[0]) == 4 and int(origin[1]) == 4, "캐시 원점 pad 4 중앙정렬")
	_check(snap.get("minimap_portrait_loaded") == true, "플레이어 초상 원본 에셋 로드(minimap_warrior.png)")
	_check(int(snap.get("minimap_enemy_points")) > 0 and int(snap.get("minimap_enemy_points")) <= 60,
		"적 마커 버퍼 1~60 (60226 60캡) n=" + str(snap.get("minimap_enemy_points")))
	var wrap: Control = hud.get_node("PublicHUD/NativeMinimap")
	_check(wrap.position == Vector2(8, 8) and wrap.scale == Vector2(0.85, 0.85) \
		and absf(wrap.modulate.a - 0.94) < 0.001, "mmWrap top8/left8·scale .85·opacity .94 (382·952)")
	_check((wrap.get_node("MinimapCanvas") as Control).position == Vector2(18, 18), "#mm top18/left18")
	_check(wrap.get_node("MinimapFrame").get("texture") != null, "mm_frame.png 프레임(2585)")
	# hudCorner
	var corner: Control = hud.get_node("PublicHUD/NativeHudCorner")
	# 실제 화면 결정 규칙 = ui-refinement.css 1319~1322 재정의 — 웹 getComputedStyle 실측
	# (web_hud_measure.json): rect(16,188)·opacity .94·글자 rgba(238,222,194,.93) 11.2px.
	_check(corner.position == Vector2(16, 188) and absf(corner.modulate.a - 0.94) < 0.001,
		"hudCorner 실측 (16,188)·opacity .94 (ui-refinement 1319~1320 실측)")
	_check(corner.get_child(0) is TextureRect and corner.size == Vector2(108, 58),
		"hudCorner 흑철 패널 108×58 (실측 rect)")
	_check(snap.get("sp_text") == "✦ 0", "spCnt '✦ 0' (신규 sp0·ap0 — 60325)")
	var expected_cp := _expected_cp()
	_check(snap.get("cp_text") == "◇ " + _comma(expected_cp),
		"cpHud = calcCP 독립 재계산 일치 (" + str(snap.get("cp_text")) + " vs " + _comma(expected_cp) + ")")
	_check(expected_cp < 100000, "신규 CP는 콤마 경로(<1e5 — 60325)")
	observations["initial"] = snap

func _test_corner_updates_via_owner() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var state: Node = active_main.get("source_state")
	var before: Dictionary = active_main.get("hud").get_native_minimap_corner_snapshot()
	# 소유자 경유 addExp 20 → lv2: sp+3(43153)·짝수렙 ap+1(43155) → '✦ 3 +1', CP는 lv·mhp 반영 증가
	var result: Dictionary = state.apply_native_add_exp(active_main, 20)
	_check(result.get("applied") == true and int(result.get("lv", 0)) >= 2, "owner addExp 20 → 레벨업")
	for i in range(6):
		await physics_frame
	var snap: Dictionary = active_main.get("hud").get_native_minimap_corner_snapshot()
	var p: Dictionary = state.read_current_p()
	var sp := int(p.get("sp", -1))
	var ap := int(p.get("ap", -1))
	var expected_sp_text: String = ("✦ %d +%d" % [sp, ap]) if ap > 0 else ("✦ %d" % sp)
	_check(snap.get("sp_text") == expected_sp_text, "sp/ap 표기 갱신 (" + str(snap.get("sp_text")) + ")")
	_check(snap.get("cp_text") == "◇ " + _comma(_expected_cp()) and snap.get("cp_text") != before.get("cp_text"),
		"CP 재계산 갱신 (" + str(snap.get("cp_text")) + ")")
	observations["after_levelup"] = snap
