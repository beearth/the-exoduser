extends SceneTree
## P2-006a — 바닥 드랍 표시·줍기·INV 반입 회귀 (실제 Main 부팅).
## 근거: worldItems/_wiPush(16719~16721)·렌더 52485~52600(화면 내·바운스·빔 타일
## [0,2,3,4,5,6][rarity]·스킨)·줍기 32935~32966(R 프레스=화면 내 최고 등급 1개·동급 근접,
## 홀드 9틱 반복)·pickupItem 16398~16424(INV.bag push·_invFindSpace 10열·가득 참
## notify('가방에 공간이 없습니다!')·_gx/_gy)·bonePart 도감(16400~16411) 미이식=정지·기록.
const USERDIR = "EXODUSER-P2006A-Isolated-20261020"
const GROUPS = ["records_render_suppliers", "pickup_best_rarity_and_intake", "bag_full_and_bone_guard"]

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
			print("P2006A_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2006A_GROUP ", JSON.stringify(row))
	_cleanup()
	# Stop/free is asynchronous to the audio mix thread; keep cleanup observable.
	await create_timer(0.25,true,false,true).timeout
	await process_frame
	await process_frame
	print("P2006A_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2006A_FAIL ", current_group, " ", label)

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

func _adapter() -> Node2D:
	return active_main.get("world").get_node("NativeWorldDrops")

func _mk(slot: String, rarity: int, name: String, extra: Dictionary = {}) -> Dictionary:
	var item := {"slot": slot, "el": 0, "rarity": rarity, "name": name, "emoji": "", "affixes": []}
	for k in extra:
		item[k] = extra[k]
	return item

func _push(x: float, y: float, item: Dictionary) -> void:
	active_main.get("source_state").append_native_drop_records(active_main,
		[{"x": x, "y": y, "type": "item", "item": item, "picked": false}])

func _test_records_render_suppliers() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var adapter: Node2D = _adapter()
	_check(adapter.get("_configured") == true, "어댑터 구성")
	_check(int(adapter.get_native_world_drops_snapshot().get("beam_frames_loaded")) == 2,
		"빔 아틀라스 2프레임 로드+마스크 (27817·27831)")
	# 빔 단수: rarity 폴백 [0,2,3,4,5,6]·layerLv 우선 (27824~27829)
	_check(adapter._beam_tier({"rarity": 0}) == 0 and adapter._beam_tier({"rarity": 1}) == 2
		and adapter._beam_tier({"rarity": 4}) == 5 and adapter._beam_tier({"rarity": 5}) == 6
		and adapter._beam_tier({"rarity": 1, "layerLv": 9}) == 9,
		"빔 단수 [0,2,3,4,5,6]·layerLv 우선")
	# 스킨 해석: 컷아웃 우선(sword)·비컷아웃 스킨(spear)·fire 변형 결손 → phys (27792~27795)
	var sword_skin: Texture2D = adapter._skin_for({"slot": "weapon", "wtype": "sword", "el": 0, "rarity": 1})
	var spear_skin: Texture2D = adapter._skin_for({"slot": "weapon", "wtype": "spear", "el": 1, "rarity": 1})
	_check(sword_skin != null and spear_skin != null, "스킨 텍스처 해석(컷아웃/스킨·fire→phys 폴백)")
	var player: Node2D = active_main.get("player")
	_push(player.global_position.x + 60.0, player.global_position.y, _mk("weapon", 4, "전설검", {"wtype": "sword"}))
	for i in range(3):
		await physics_frame
	var snapshot: Dictionary = adapter.get_native_world_drops_snapshot()
	_check(int(snapshot.get("records")) >= 1, "레코드 공급(worldItems) 소비 n=" + str(snapshot.get("records")))
	observations["render"] = {"beam_frames": snapshot.get("beam_frames_loaded")}

func _test_pickup_best_rarity_and_intake() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var adapter: Node2D = _adapter()
	var state: Node = active_main.get("source_state")
	var player: Node2D = active_main.get("player")
	# 화면 내 3개(등급 1/3/4) + 화면 밖 1개(등급 5) — 32935 화면 필터·최고 등급 우선
	_push(player.global_position.x - 50.0, player.global_position.y, _mk("helmet", 1, "고급투구"))
	_push(player.global_position.x + 90.0, player.global_position.y, _mk("armor", 3, "영웅갑옷"))
	_push(player.global_position.x + 40.0, player.global_position.y + 30.0, _mk("boots", 4, "전설장화"))
	_push(player.global_position.x + 3000.0, player.global_position.y, _mk("cape", 5, "유니크망토"))
	var bag_before: int = (state.read_current_inventory().get("bag") as Array).size()
	var records_before: int = state.read_native_drop_records().size()
	adapter._try_pickup_best()
	var bag: Array = state.read_current_inventory().get("bag")
	_check(bag.size() == bag_before + 1, "가방 반입 +1 (16417 push)")
	var picked: Dictionary = bag[-1]
	_check(str(picked.get("name")) == "전설장화", "화면 내 최고 등급 우선 (32938, 화면 밖 유니크 제외) got " + str(picked.get("name")))
	_check(picked.get("_gx") != null and picked.get("_gy") != null and picked.has("_pickT"),
		"_gx/_gy/_pickT 기록 (16421) gx=%s gy=%s" % [str(picked.get("_gx")), str(picked.get("_gy"))])
	_check(state.read_native_drop_records().size() == records_before - 1, "레코드 제거 (32940·34385)")
	var snapshot: Dictionary = adapter.get_native_world_drops_snapshot()
	_check(str(snapshot.get("toast_text")).begins_with("전설") and str(snapshot.get("toast_text")).ends_with("획득!"),
		"notify '전설 … 획득!' (16422·RARITY_N) got " + str(snapshot.get("toast_text")))
	adapter._try_pickup_best() # 다음 = 1그룹 잔존 전설검(4, d=60 — 동급 중 차근접) (32938 동급=근접 우선)
	bag = state.read_current_inventory().get("bag")
	_check(str((bag[-1] as Dictionary).get("name")) == "전설검", "동급(4) 근접 우선 — 1픽 전설장화(d≈50)→2픽 전설검(d≈60)")
	adapter._try_pickup_best() # 다음 = 영웅(3)
	bag = state.read_current_inventory().get("bag")
	_check(str((bag[-1] as Dictionary).get("name")) == "영웅갑옷", "반복 픽업 차순위 등급 (32952s)")
	# 배치 순서: 픽업 1·2·3 → (0,0)·(2,0)·(4,0) — _invFindSpace 행우선 (16200)
	var gx: Array = [int((bag[-3] as Dictionary).get("_gx", -1)), int((bag[-2] as Dictionary).get("_gx", -1)), int((bag[-1] as Dictionary).get("_gx", -1))]
	_check(gx == [0, 2, 4], "_invFindSpace 행우선 배치 [0,2,4] got " + str(gx))
	observations["pickup"] = {"pick_log": snapshot.get("pick_log"), "gx": gx}

func _test_bag_full_and_bone_guard() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var adapter: Node2D = _adapter()
	var state: Node = active_main.get("source_state")
	var player: Node2D = active_main.get("player")
	# 가득 채우기: 10열×120행 / 2×2 = 300칸. 기존 배치분 제외하고 반입 반복.
	var guard := 0
	while guard < 320:
		guard += 1
		var intake: Dictionary = state.apply_native_pickup_item(active_main, _mk("belt", 0, "채움벨트%d" % guard))
		if intake.get("applied") != true:
			break
	var full: Dictionary = state.apply_native_pickup_item(active_main, _mk("gloves", 2, "넘침장갑"))
	_check(full.get("applied") != true and full.get("reason") == "bag_full"
		and str(full.get("notify")) == "가방에 공간이 없습니다!",
		"가득 참 거부+알림 (16403/16419) got " + str(full))
	var bag: Array = state.read_current_inventory().get("bag")
	var placed := 0
	for it in bag:
		if (it as Dictionary).get("_gx") != null:
			placed += 1
	_check(placed == 300, "그리드 정원 300 (10×120 / 2×2 — 15834·16181) placed=" + str(placed))
	# 가득 참 상태에서 줍기 → 레코드 유지 + 토스트
	_push(player.global_position.x + 50.0, player.global_position.y, _mk("necklace", 2, "희귀목걸이"))
	var records_before: int = state.read_native_drop_records().size()
	adapter._try_pickup_best()
	_check(state.read_native_drop_records().size() == records_before, "가득 참 픽업 실패 시 레코드 유지")
	_check(str(adapter.get_native_world_drops_snapshot().get("toast_text")) == "가방에 공간이 없습니다!",
		"가득 참 notify 표시")
	# bonePart: 도감 미이식 → 정지·기록(레코드 유지)
	var bone: Dictionary = state.apply_native_pickup_item(active_main,
		_mk("bonePart", 1, "테스트 유골", {"part": "skull", "anc": "t1"}))
	_check(bone.get("applied") != true and str(bone.get("reason")).begins_with("unported_branch_active"),
		"bonePart 도감 미이식 정지·기록 (16400~16411) got " + str(bone.get("reason")))
	observations["full"] = {"placed": placed, "bone_reason": bone.get("reason")}
