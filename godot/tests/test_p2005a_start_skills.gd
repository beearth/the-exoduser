extends SceneTree
## P2-005a — 새 게임 시작 스킬·슬롯 지급 회귀 (실제 Main 부팅).
## 근거: 로컬 새 게임 경로 63993~64014 — 난이도 시작 스킬(_diffSigned 0 → 전부)·
## _ensureBaseWingStrike(3483)·기본 강제 5종·activeCtSk='iceOrb'·
## SKILL_SLOTS=[spikeTrap,null,null,null,giantSlam,holyDome](27681)·ULT null(27682).
## HUD 매핑: updateQS/updateSkSlot(44879~) — qs0=spikeTrap·qs5=holyDome·skSlot1=giantSlam·
## skSlotCT=iceOrb. 발동 로직은 범위 밖(지급·표시만 — Space는 기존 미연결 무반응 유지).
const USERDIR = "EXODUSER-P2005A-Isolated-20261020"
const GROUPS = ["starting_skills_grant", "hud_slot_icons_match_web"]

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
			print("P2005A_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2005A_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2005A_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2005A_FAIL ", current_group, " ", label)

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
	for i in range(12):
		await physics_frame
	return active_main.get("world").get("ready_for_player") == true

func _test_starting_skills_grant() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var p: Dictionary = active_main.get("source_state").read_current_p()
	var skills: Dictionary = p.get("skills", {})
	for skill_id in ["kiSlash", "spikeTrap", "holyDome", "giantSlam", "iceOrb"]:
		_check(int(skills.get(skill_id, 0)) >= 1, "스킬 지급 " + skill_id + " ≥1 (64003~64007·63994~63998)")
	for skill_id in ["maliceSwipe", "shieldThrow", "fireball", "bladeDash"]:
		_check(int(skills.get(skill_id, 0)) >= 1, "mkP 기존 스킬 유지 " + skill_id)
	_check((p.get("_fused") as Dictionary).get("shieldFuse") == true, "_ensureBaseWingStrike shieldFuse (3483)")
	_check(str(p.get("activeRMBSk")) == "maliceSwipe", "activeRMBSk 유지 (3489)")
	_check(str(p.get("activeCtSk")) == "iceOrb", "activeCtSk='iceOrb' (64011)")
	var slots: Array = p.get("skillSlots", [])
	_check(slots.size() == 6 and str(slots[0]) == "spikeTrap" and slots[1] == null and slots[2] == null \
		and slots[3] == null and str(slots[4]) == "giantSlam" and str(slots[5]) == "holyDome",
		"SKILL_SLOTS=[spikeTrap,·,·,·,giantSlam,holyDome] (64013) got=" + str(slots))
	_check(p.get("ultSlot") == null, "ULT_SLOT null (27682)")
	observations["skills"] = {"slots": slots, "activeCt": p.get("activeCtSk")}

func _test_hud_slot_icons_match_web() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	for i in range(8):
		await physics_frame
	var icons: Dictionary = active_main.get("hud").get_native_first_fight_hud_snapshot().get("slot_icon_files", {})
	var expected := {"qs0": "spikeTrap", "qs1": "", "qs2": "", "qs3": "", "qs5": "holyDome",
		"ultSlot": "", "skSlotLMB": "kiSlash", "skSlotRMB": "shieldThrow", "skSlot0": "chargeBoost",
		"qsE": "fireball", "qsQ": "peaceShield", "skSlotCT": "iceOrb", "skSlot1": "giantSlam"}
	for slot_id in expected:
		_check(str(icons.get(slot_id, "?")) == expected[slot_id],
			"슬롯 %s = '%s' (웹 동일 — _skIcon 44134/매핑 44879~) got='%s'" % [slot_id, expected[slot_id], str(icons.get(slot_id))])
	# 미구현 스킬 키 무반응 보존: Space rage_slot은 기존 미연결 상태 그대로
	var binds: Dictionary = active_main.call("get_native_input_binding_snapshot") \
		if active_main.has_method("get_native_input_binding_snapshot") else {}
	if binds.has("unsupported"):
		_check((binds["unsupported"] as Array).has("space_rage_slot"), "Space 미연결 유지(무반응 — 발동 미이식 기록)")
	observations["icons"] = icons
