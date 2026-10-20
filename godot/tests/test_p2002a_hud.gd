extends SceneTree
## P2-002a — 첫 전투 원본 HUD 회귀 (실제 Main 부팅).
## 근거(원본 game.html): #mmLvl 2575~2584·CSS 372~381, #stageClock 2691·CSS 364~368,
## HUD 갱신 60310~60336(_hudReadableNumber 60239 콤마), 슬롯 .qs CSS 712~725·974~980,
## _skIcon 44134 + SKILL_ICONS 44118(parry→peaceShield, charge→chargeBoost,
## shieldFuse→shieldThrow), 슬롯 매핑 44879~44931(LMB 44902·RMB 44915+_skFuseIcon·Q 44908).
## 개발 오버레이(포트 전용 패널)는 원본 화면에 없음 — 기본 숨김+토글 검증.
const USERDIR = "EXODUSER-P2002A-Isolated-20261020"
const GROUPS = ["hud_initial_values_and_overlay", "hud_updates_on_kill_and_levelup"]

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var forced_actor_fields = 0
var hurte_outcomes: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2002A_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2002A_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2002A_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2002A_FAIL ", current_group, " ", label)

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
	if active_main.get("world").get("ready_for_player") != true:
		_check(false, "actual World ready_for_player")
		return false
	active_main.get("player").telemetry_event.connect(func(kind, data):
		if kind == "native_hurte": hurte_outcomes.append(data.duplicate(true)))
	return true

func _hud() -> Node:
	return active_main.get("hud")

func _snapshot() -> Dictionary:
	return _hud().get_native_first_fight_hud_snapshot()

# ── ① 부팅 직후 값·슬롯 아이콘·오버레이 기본 숨김 ──
func _test_hud_initial_values_and_overlay() -> void:
	if not await _boot_main():
		return
	for i in range(6):
		await physics_frame # 30Hz 갱신 1주기 이상
	var snap: Dictionary = _snapshot()
	_check(snap.get("ready") == true, "HUD가 state owner getter에 바인딩됨")
	_check(snap.get("serif_font_loaded") == true, "Noto Serif KR 폰트 로드(--font-hell 폴백)")
	_check(snap.get("lv_text") == "1", "레벨 1 (mkP)")
	_check(snap.get("exp_text") == "0 / 15", "경험치 0 / 15 (mkP maxExp 15)")
	_check(snap.get("malice_text") == "1,000", "악의 1,000 — 콤마 포맷(60239)·새 게임 1000(63956)")
	_check(str(snap.get("kill_text")).begins_with("0 / "), "지역 처치 0 / N (60322)")
	_check(str(snap.get("timer_text")).length() == 5 and str(snap.get("timer_text"))[2] == ":",
		"타이머 mm:ss (60336)")
	_check(float(snap.get("exp_fill_px")) == 0.0, "경험치 바 0% (60310)")
	var icons: Dictionary = snap.get("slot_icon_files", {})
	_check(icons.get("skSlotLMB") == "kiSlash", "LMB=kiSlash 아이콘 (44902)")
	_check(icons.get("skSlotRMB") == "shieldThrow", "RMB=shieldFuse 합체→shieldThrow.png (44915+44118)")
	_check(icons.get("skSlot0") == "chargeBoost", "Shift=charge→chargeBoost.png (44118 alias)")
	_check(icons.get("qsE") == "fireball", "E=fireball (44897)")
	_check(icons.get("qsQ") == "peaceShield", "Q=parry→peaceShield.png (44908+44118 alias)")
	# P2-005a: 시작 스킬 지급(63993~64014) 이식 — Ctrl=iceOrb(64011),
	# qs0=spikeTrap/qs5=holyDome/Space=giantSlam(64013). 종전 '미이식' 기대값 정정.
	_check(icons.get("skSlotCT") == "iceOrb", "Ctrl=iceOrb (64011 — P2-005a 지급)")
	_check(icons.get("qs0") == "spikeTrap" and icons.get("qs5") == "holyDome" 		and icons.get("skSlot1") == "giantSlam", "1/F/Space 시작 슬롯 배정 (64013)")
	for empty_slot in ["qs1", "qs2", "qs3", "ultSlot"]:
		_check(str(icons.get(empty_slot, "x")).is_empty(), "빈 슬롯 " + empty_slot + " (2~4·ULT 미배정)")
	# 아이콘 원본 동일성: 복사본 텍스처 실로드
	for file in ["kiSlash", "shieldThrow", "chargeBoost", "fireball", "peaceShield", "ghostWalk"]:
		_check(load("res://assets/ui/skill_icons/" + file + ".png") is Texture2D, "아이콘 텍스처 로드 " + file)
	# 개발 오버레이 — 기본 숨김 + 토글 + 기존 노드/시그널 유지(test_contracts의 PauseResume 경로)
	var hud: Node = _hud()
	_check(snap.get("debug_overlay_visible") == false, "개발 오버레이 기본 숨김")
	var pause_button: Node = hud.get_node("PublicHUD/PublicActions/PauseResume")
	_check(is_instance_valid(pause_button) and pause_button.call("is_visible_in_tree") == false,
		"PauseResume 노드 유지·트리상 숨김(시그널 경로 보존)")
	var title: Node = hud.get_node_or_null("PublicHUD").get_child(0)
	hud.set_native_debug_overlay_visible(true)
	_check(hud.is_native_debug_overlay_visible() == true and pause_button.call("is_visible_in_tree") == true,
		"토글 ON → 오버레이 표시")
	hud.set_native_debug_overlay_visible(false)
	_check(pause_button.call("is_visible_in_tree") == false, "토글 OFF → 재숨김")
	observations["initial"] = snap

# ── ② 처치/레벨업 반영 — P2-001c 보상이 실제로 HUD 숫자를 바꾸는지 ──
func _test_hud_updates_on_kill_and_levelup() -> void:
	if not await _boot_main():
		return
	var player: Node2D = active_main.get("player")
	var state: Node = active_main.get("source_state")
	var mats_before_text: String = str(_snapshot().get("malice_text"))
	# 가장 가까운 적 처치 (자연 kiSlash)
	var killed := false
	for attempt in range(8):
		var target: Node2D = null
		var best := 1e18
		for c in active_main.get("world").get_enemies():
			if is_instance_valid(c) and c.get("alive") == true:
				var d: float = c.global_position.distance_to(player.global_position)
				if d < best:
					best = d
					target = c
		if target == null:
			break
		for i in range(300):
			if player.get("state") == "idle" and float(player.get("stamina")) >= 30.0:
				break
			await physics_frame
		var stand: Vector2 = target.global_position + Vector2(-(47.0 + float(target.get("radius")) - 8.0), 0)
		player.global_position = stand
		player.set("facing", (target.global_position - stand).normalized())
		forced_actor_fields += 2
		if not player.request_attack():
			player.release_attack()
			continue
		if player.get("state") == "windup":
			player.release_attack()
		for i in range(120):
			await physics_frame
			if target == null or not is_instance_valid(target) or target.get("alive") != true:
				killed = true
				break
		player.release_attack()
		if killed:
			break
	_check(killed, "첫 적 처치 성공")
	for i in range(8):
		await physics_frame
	var snap: Dictionary = _snapshot()
	var g: Dictionary = state.read_current_g()
	var p: Dictionary = state.read_current_p()
	_check(str(snap.get("kill_text")).begins_with(str(int(g.get("_stageKills", -9)))),
		"지역 처치 분자 = G._stageKills (" + str(snap.get("kill_text")) + ")")
	_check(snap.get("malice_text") == _format_comma(int(g.get("mats", 0))) \
		and snap.get("malice_text") != mats_before_text,
		"악의 = G.mats 증가 반영 (" + str(snap.get("malice_text")) + ")")
	_check(snap.get("exp_text") == _format_comma(int(p.get("exp", -1))) + " / " + _format_comma(int(p.get("maxExp", -1))),
		"경험치 = P.exp/P.maxExp (" + str(snap.get("exp_text")) + ")")
	if int(p.get("exp", 0)) > 0:
		_check(float(snap.get("exp_fill_px")) > 0.0, "경험치 바 채움 > 0")
	# 레벨업 표시 — 소유자 경유 addExp(43146~)로 20exp → lv2, HUD 갱신 확인
	var exp_result: Dictionary = state.apply_native_add_exp(active_main, 20)
	_check(exp_result.get("applied") == true and int(exp_result.get("lv", 0)) >= 2,
		"owner addExp 20 → 레벨업")
	for i in range(12): # 30Hz _refresh 1주기 이상 보장 (P2-005d: 리젠 단계 틱 추가로 여유 확장)
		await physics_frame
	snap = _snapshot()
	_check(snap.get("lv_text") == _format_comma(int(state.read_current_p().get("lv"))),
		"레벨업 표시 = P.lv (" + str(snap.get("lv_text")) + ")")
	observations["after_kill"] = snap

static func _format_comma(value: int) -> String:
	var n: int = maxi(0, value)
	var raw := str(n)
	var out := ""
	var count := 0
	for index in range(raw.length() - 1, -1, -1):
		out = raw[index] + out
		count += 1
		if count % 3 == 0 and index > 0:
			out = "," + out
	return out
