extends SceneTree
## P2-004B — 대사 선택/쿨다운/프레임 경쟁의 원본 계약 단위 검수.
## Main/월드/세이브를 부팅하지 않고 NativePets.new()의 실제 메서드만 호출한다.
## 원본: game.html 9389~9503(엔진), 9514~9525(긴급), 9594~9613(전투/자원).
## 런타임 실행 여부는 로그의 P2004B_RESULT와 보고서에서만 판단한다.
const USERDIR = "EXODUSER-P2004B-PC-Isolated-20261020"
const PETS = preload("res://scripts/native_pets.gd")
const CATALOG = preload("res://scripts/native_pet_dialogue_catalog.gd")
const GROUPS = ["source_tiers", "catalog_dispatch_boundary", "pair_and_cooldowns",
	"frame_priority_and_no_fallback", "urgent_interrupt_and_weights", "urgent_thresholds",
	"competitive_thresholds", "kill_event_thresholds_and_reset", "shuffle_bag"]
var assertions := 0
var failures := 0
var current_group := ""
var rows: Array = []
var pets: Node

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	for group in GROUPS:
		current_group = group
		var checks_before := assertions
		var failures_before := failures
		call("_test_" + group)
		var row := {"group": group, "assertions": assertions - checks_before,
			"failures": failures - failures_before}
		rows.append(row)
		print("P2004B_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2004B_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"groups": rows, "main_boots": 0, "save_reads": 0, "save_writes": 0,
		"fallback_paths_used": false, "userdir": USERDIR}))
	quit(1 if failures > 0 or assertions == 0 else 0)

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("P2004B_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(pets):
		pets.free()
	pets = null

func _fresh() -> void:
	_cleanup()
	pets = PETS.new()

func _begin_frame() -> void:
	pets.set("_in_frame", true)
	var bid: Dictionary = pets.get("_bid")
	bid["tier"] = -1
	bid["weight"] = 0

func _finish_frame() -> void:
	pets.call("_pet_fire_bid")
	pets.set("_in_frame", false)

func _bid_id() -> String:
	return str((pets.get("_bid") as Dictionary).get("id", ""))

func _said_id() -> String:
	var log: Array = pets.get("_say_log")
	return str(log[-1].get("id", "")) if not log.is_empty() else ""

func _offer(id: String) -> bool:
	return bool(pets.call("_offer_dialogue", id))

func _test_source_tiers() -> void:
	_fresh()
	# 원본 9414~9422: 특례를 접두보다 먼저 검사한다. 생존 ID도 추론은 T2,
	# urgent 경로가 별도로 T5 슬롯을 사용한다.
	var cases := {
		"enh_hint": 1, "bl_first_red": 2, "cd_first_hit": 2, "combo_50": 2,
		"multi_kill": 2, "low_hp_kill": 2, "stage_clear": 2, "chapter_clear_0": 2,
		"trophy_act1_clear": 2, "enh_plus100": 2, "first_legend": 2,
		"speed_record": 2, "elite_kill": 2, "miniboss_kill": 2, "build_str": 2,
		"diff_3": 2, "syn_any": 2, "boss_elem": 3, "boss_summon": 4,
		"near_boss": 4, "elite_first": 4, "miniboss_appear": 4,
		"melee_trap_no": 3, "resource_low_no": 3, "enemy_ice": 3,
		"rage_full2": 3, "mp_warn": 3, "low_st": 3, "tut_start": 1,
		"parry_any": 1, "sp_hint": 1, "has_ap": 1, "bag_full": 1,
		"low_mats": 1, "shift_hint": 1, "idle_tip0": 0, "env_ch0": 0,
		"chapter_0": 0, "petTalk_0": 0, "hp_critical": 2, "warn_hp50": 2,
		"crisis_hp30": 2, "burn_warn": 2, "unknown_test_id": 2}
	for id in cases:
		_check(CATALOG.tier_of(id) == cases[id], "카탈로그 원본 티어 " + id)
		_check(int(pets.call("_pet_tier_of", id)) == cases[id], "엔진 원본 티어 " + id)
	_check(PETS.PET_TIER_COOL == [1200, 720, 480, 360, 240, 0], "티어 글로벌쿨 9408")

func _test_catalog_dispatch_boundary() -> void:
	_check(CATALOG.ENTRIES.size() == 171, "원본 171 ID 카탈로그")
	var disconnected := 0
	for id in CATALOG.ENTRIES:
		var entry: Dictionary = CATALOG.get_entry(id)
		if entry.get("connected", false):
			continue
		disconnected += 1
		_fresh()
		_begin_frame()
		_check(not _offer(id), "미연결 대사 임의 실행 차단 " + id)
		_check(int((pets.get("_bid") as Dictionary).get("tier")) == -1,
			"미연결 대사 입찰 없음 " + id)
		_check((pets.get("_say_log") as Array).is_empty(), "미연결 대사 표시 없음 " + id)
		_check((pets.get("_pet_dlg_cd") as Dictionary).is_empty(), "미연결 대사 CD 없음 " + id)
	_check(disconnected == 102, "미연결 102 ID 경계")
	for id in ["boss_groggy","boss_grab_warn","boss_aoe_warn","boss_p2","boss_p3","boss_p4","boss_intro_ch0","boss_kill","boss_gate_open"]:
		_check(bool(CATALOG.get_entry(id).get("connected",false)), "DEMO11-44 실제 owner 소비 연결 " + id)
	for id in ["multi_kill", "bl_first_red", "bl_first_rainbow", "cd_first_hit",
		"first_death", "stun_warn", "boss_exec", "elite_first",
		"chapter_clear_0", "first_legend", "build_str", "diff_3"]:
		_check(not bool(CATALOG.get_entry(id).get("connected", true)), "미이식 이벤트를 연결로 속이지 않음 " + id)
	_fresh()
	_check(not _offer("not_in_source_catalog"), "카탈로그 없는 ID 차단")

func _test_pair_and_cooldowns() -> void:
	_fresh()
	_check(_offer("tut_start"), "튜토리얼 즉시 시작 9556")
	var bubble: Dictionary = pets.get("_pet_bubble")
	_check(bubble["who"] == "crow" and bubble["t"] == 300.0,
		"HECTOR 5초=300프레임")
	_check(bubble["pair"] != null and bubble["pair"]["who"] == "cat", "DIROI pair 대기")
	_check((pets.get("_pet_tier_cd") as Array)[1] == 720.0, "T1 쿨 720프레임")
	_check((pets.get("_pet_dlg_cd") as Dictionary)["tut_start"] == 9999.0 * 60.0,
		"ID 쿨 9999초×60")
	_check(not _offer("tut_atk3"), "점유 중 즉시 대사 차단")
	for i in range(299):
		pets.call("_update_pet_bubble")
	_check(bubble["who"] == "crow" and bubble["t"] == 1.0, "299프레임까지 주대사")
	pets.call("_update_pet_bubble")
	_check(bubble["who"] == "cat" and bubble["t"] == 300.0, "300프레임 경계에서 응답 시작")
	_check(bubble["pair"] == null and bubble["pair_fired"] == true, "pair 정확히 1회 소비")
	_check(bubble["txt"] == CATALOG.get_entry("tut_start")["pt"], "pair 원문 유지")
	for i in range(300):
		pets.call("_update_pet_bubble")
	_check(bubble["t"] == 0.0 and bubble["pair"] == null, "응답 종료 후 자동 재생 없음")
	_check(not _offer("tut_atk3"), "말풍선 끝나도 T1 글로벌쿨 준수")
	for i in range(120):
		pets.call("_update_pet_bubble")
	_check(_offer("tut_atk3"), "T1 720프레임 경계 재개")
	_fresh()
	_check(bool(pets.call("_pet_say_cd", "combo_50", "crow", CATALOG.get_entry("combo_50")["txt"], 1.0 / 60.0, 1.0 / 60.0)),
		"쿨 1프레임 경계 준비")
	pets.call("_update_pet_bubble")
	_check(not (pets.get("_pet_dlg_cd") as Dictionary).has("combo_50"), "ID 쿨 0이면 제거")
	(pets.get("_pet_tier_cd") as Array)[2] = 0.25
	pets.call("_update_pet_bubble")
	_check((pets.get("_pet_tier_cd") as Array)[2] == 0.0, "티어쿨 음수 방지 9485")

func _test_frame_priority_and_no_fallback() -> void:
	_fresh()
	_begin_frame()
	_offer("chapter_0")
	_offer("melee_trap_no")
	_offer("melee_slam_no")
	_check(_bid_id() == "melee_trap_no", "동일 T3는 먼저 입찰한 코드순 유지 9429")
	_finish_frame()
	_check(_said_id() == "melee_trap_no", "프레임 최고 T3 하나만 표시")
	var cds: Dictionary = pets.get("_pet_dlg_cd")
	_check(cds.has("melee_trap_no") and not cds.has("melee_slam_no") and not cds.has("chapter_0"),
		"승자만 ID쿨 소비")
	_check((pets.get("_pet_tier_cd") as Array)[3] == 360.0, "승자 T3 글로벌쿨 360")
	_check(int((pets.get("_bid") as Dictionary)["tier"]) == -1
		and int((pets.get("_bid") as Dictionary)["weight"]) == 0, "프레임 입찰 초기화")
	_fresh()
	(pets.get("_pet_tier_cd") as Array)[3] = 1.0
	_begin_frame()
	_offer("chapter_0")
	_offer("melee_trap_no")
	_finish_frame()
	_check(_said_id().is_empty(), "승자 티어쿨 중이면 하위 후보로 대체하지 않음 9459")
	_check((pets.get("_pet_dlg_cd") as Dictionary).is_empty(), "미발화 후보 CD 불소비")
	_fresh()
	(pets.get("_pet_dlg_cd") as Dictionary)["melee_trap_no"] = 1.0
	_begin_frame()
	_offer("chapter_0")
	_offer("melee_trap_no")
	_finish_frame()
	_check(_said_id() == "chapter_0", "ID쿨 후보는 입찰 전 제외 9427")
	_fresh()
	_offer("tut_start")
	_begin_frame()
	_offer("melee_trap_no")
	_finish_frame()
	_check(_said_id() == "tut_start", "일반 입찰은 재생 중 대사 인터럽트 불가")
	_check(not (pets.get("_pet_dlg_cd") as Dictionary).has("melee_trap_no"),
		"점유로 미발화하면 후보 쿨 불소비")

func _test_urgent_interrupt_and_weights() -> void:
	# 9410: 100 > 95 > 55 > 40. 입력 순서가 역전돼도 최대 weight만 승리.
	for order in [["warn_hp50", "burn_warn", "hp_oneshot", "hp_critical"],
		["hp_critical", "hp_oneshot", "burn_warn", "warn_hp50"],
		["hp_oneshot", "hp_critical", "warn_hp50", "burn_warn"]]:
		_fresh()
		_begin_frame()
		for id in order:
			_offer(id)
		_check(_bid_id() == "hp_critical", "긴급 최대 weight100 순서 무관")
		_finish_frame()
		_check(_said_id() == "hp_critical", "긴급 최고 후보 하나 표시")
		_check((pets.get("_pet_dlg_cd") as Dictionary).size() == 1, "긴급 패자 ID쿨 불소비")
	for row in [["warn_hp50", "burn_warn", 55], ["burn_warn", "hp_oneshot", 95]]:
		_fresh()
		_begin_frame()
		_offer(row[0])
		_offer(row[1])
		_check(_bid_id() == row[1] and int((pets.get("_bid") as Dictionary)["weight"]) == row[2],
			"긴급 상대 우선순위 " + row[1])
	_fresh()
	_offer("tut_start")
	(pets.get("_pet_tier_cd") as Array)[0] = 1200.0
	_check(_offer("burn_warn"), "프레임 외 urgent 즉시 인터럽트 9441~9446")
	var bubble: Dictionary = pets.get("_pet_bubble")
	_check(_said_id() == "burn_warn" and bubble["txt"] == CATALOG.get_entry("burn_warn")["txt"],
		"이전 대사 대신 화상 원문")
	_check(bubble["pair"] != null and bubble["pair"]["txt"] == CATALOG.get_entry("burn_warn")["pt"],
		"기존 pair 폐기 후 urgent pair 설치")
	for i in range(5):
		_check((pets.get("_pet_tier_cd") as Array)[i] >= 300.0, "urgent 뒤 낮은 티어 300프레임 " + str(i))
	_check((pets.get("_pet_tier_cd") as Array)[0] == 1200.0, "기존 긴 티어쿨 보존")
	_check(not _offer("burn_warn"), "urgent도 자체 ID쿨 준수")
	(pets.get("_pet_dlg_cd") as Dictionary).erase("burn_warn")
	var before: int = (pets.get("_say_log") as Array).size()
	_check(not _offer("burn_warn"), "같은 활성 urgent uid 재시작 방지")
	_check((pets.get("_say_log") as Array).size() == before, "같은 urgent 중복 발화 없음")

func _p(hp_value: float = 100.0) -> Dictionary:
	return {"hp": hp_value, "mhp": 100.0, "mp": 100.0, "mmp": 100.0,
		"st": 100.0, "mst": 100.0, "lv": 201, "sp": 0, "ap": 0,
		"burnT": 0, "_rbBurn": [], "rage": 0, "skills": {}}

func _g() -> Dictionary:
	return {"stage": 0, "frame": 1, "mats": 100, "bossAlive": false}

func _test_urgent_thresholds() -> void:
	# 경계는 원본 < / >= 그대로: HP50 정확히는 없음, 30 정확히 warn,
	# 10 정확히 crisis, 0/음수에는 생존 경고 없음(9516~9525).
	for row in [[50.0, ""], [49.999, "warn_hp50"], [30.0, "warn_hp50"],
		[29.999, "crisis_hp30"], [10.0, "crisis_hp30"], [9.999, "hp_critical"],
		[0.0, ""], [-1.0, ""]]:
		_fresh()
		_begin_frame()
		pets.call("_check_urgent_dialogue", _p(float(row[0])))
		_finish_frame()
		_check(_said_id() == row[1], "HP 경계 " + str(row[0]))
	for burn_key in ["burnT", "_rbBurn"]:
		_fresh()
		var p := _p()
		p[burn_key] = 1 if burn_key == "burnT" else [1]
		_begin_frame()
		pets.call("_check_urgent_dialogue", p)
		_finish_frame()
		_check(_said_id() == "burn_warn", "일반/빨콩 화상 감지 " + burn_key)
	_fresh()
	pets.set("_pet_enemy_avg_atk", 25.0)
	_begin_frame()
	pets.call("_check_urgent_dialogue", _p(30.0))
	_finish_frame()
	_check(_said_id() == "warn_hp50", "한방컷 ATK×1.2 같으면 제외")
	_fresh()
	pets.set("_pet_enemy_avg_atk", 25.0)
	_begin_frame()
	pets.call("_check_urgent_dialogue", _p(29.999))
	_finish_frame()
	_check(_said_id() == "hp_oneshot", "한방컷 ATK×1.2 미만 weight95")

func _test_competitive_thresholds() -> void:
	# chapter_0(T0)가 기본 후보이므로 T3 조건이 없으면 그것이 남는다.
	for count_value in [9, 10, 19, 20]:
		_fresh()
		_begin_frame()
		pets.call("_check_competitive_dialogue", _p(), _g(), count_value, count_value, false)
		_finish_frame()
		_check(_said_id() == ("melee_trap_no" if count_value >= 10 else "chapter_0"),
			"근접 10/20 경계와 동일티어 코드순 " + str(count_value))
	_fresh()
	var trap_p := _p()
	trap_p["skills"] = {"spikeTrap": 1, "giantSlam": 1}
	_begin_frame()
	pets.call("_check_competitive_dialogue", trap_p, _g(), 20, 20, false)
	_finish_frame()
	_check(_said_id() == "melee_trap_yes", "가시덫 보유 분기, 20마리도 먼저 입찰한 trap")
	for row in [[50.0, "chapter_0"], [49.999, "resource_parry"],
		[30.0, "resource_parry"], [29.999, "resource_parry"]]:
		_fresh()
		var p := _p()
		p["mp"] = row[0]
		_begin_frame()
		pets.call("_check_competitive_dialogue", p, _g(), 0, 1, false)
		_finish_frame()
		_check(_said_id() == row[1], "자원 50/30 경계와 선행 half입찰 " + str(row[0]))
	_fresh()
	var dome_p := _p()
	dome_p["mp"] = 29.0
	dome_p["skills"] = {"holyDome": 1}
	dome_p["_hdCd"] = 0
	_begin_frame()
	pets.call("_check_competitive_dialogue", dome_p, _g(), 0, 1, false)
	_finish_frame()
	_check(_said_id() == "resource_half_dome", "영역 준비 시 half_dome 먼저 T3 입찰")
	_fresh()
	_begin_frame()
	pets.call("_check_competitive_dialogue", _p(), _g(), 0, 1, true)
	_finish_frame()
	_check(_said_id() == "enemy_ice", "실제 근접 빙결 관측 입력 T3")
	for previous_count in [4, 5]:
		_fresh()
		pets.set("_pet_last_enemy_count", previous_count)
		_begin_frame()
		pets.call("_check_competitive_dialogue", _p(), _g(), 0, 0, false)
		_finish_frame()
		_check(_said_id() == ("stage_clear" if previous_count >= 5 else "chapter_0"),
			"스테이지 클리어 직전 5명 경계 " + str(previous_count))
	_fresh()
	pets.set("_pet_last_enemy_count", 5)
	pets.set("_pet_stage_cleared", true)
	_begin_frame()
	pets.call("_check_competitive_dialogue", _p(), _g(), 0, 0, false)
	_finish_frame()
	_check(_said_id() != "stage_clear", "클리어 상태 중복 입찰 차단")
	_fresh()
	pets.set("_pet_stage_cleared", true)
	_begin_frame()
	pets.call("_check_competitive_dialogue", _p(), _g(), 0, 1, false)
	_finish_frame()
	_check(pets.get("_pet_stage_cleared") == false, "살아 있는 적 재등장 시 clear 플래그 해제")


func _test_kill_event_thresholds_and_reset() -> void:
	for row in [[49, "combo_50"], [99, "combo_100"]]:
		_fresh()
		pets.set("_pet_combo_kills", row[0])
		pets.call("_on_pet_kill", _p())
		_check(_said_id() == row[1], "처치 콤보 정확한 도달 경계 " + row[1])
		_check(int(pets.get("_pet_kill_cnt")) == 1, "실제 처치 콜백 카운터 1회")
		_check(int(pets.get("_pet_combo_kills")) == int(row[0]) + 1,
			"연속 처치 카운터 1 증가")
	_fresh()
	pets.set("_pet_combo_kills", 50)
	pets.call("_on_pet_kill", _p())
	_check(_said_id().is_empty(), "콤보 51은 50회 대사 재발화 없음")
	for row in [[10.0, false], [9.999, true], [0.0, false]]:
		_fresh()
		pets.call("_on_pet_kill", _p(float(row[0])))
		_check((_said_id() == "low_hp_kill") == row[1], "처치 HP10% 엄격 미만 " + str(row[0]))
	_fresh()
	_offer("burn_warn")
	pets.call("_on_pet_kill", _p())
	_fresh()
	_check((pets.get("_pet_dlg_cd") as Dictionary).is_empty(), "새 런 인스턴스 ID쿨 초기화")
	_check((pets.get("_pet_tier_cd") as Array) == [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
		"새 런 인스턴스 티어쿨 초기화")
	_check((pets.get("_pet_bubble") as Dictionary)["pair"] == null
		and float((pets.get("_pet_bubble") as Dictionary)["t"]) == 0.0, "새 런 pair/대사 초기화")
	_check(int(pets.get("_pet_combo_kills")) == 0 and int(pets.get("_pet_kill_cnt")) == 0,
		"새 런 처치/콤보 초기화")

func _test_shuffle_bag() -> void:
	# 원본 9465~9468, idle_nag 6 / idle_tip 18 / petTalk 5.
	_fresh()
	for length in [6, 18, 5]:
		var bag: Array = []
		for cycle in range(3):
			var seen: Dictionary = {}
			for i in range(length):
				var index: int = int(pets.call("_pet_bag_next", bag, length))
				_check(index >= 0 and index < length, "셔플백 인덱스 범위 " + str(length))
				_check(not seen.has(index), "한 순환 내 중복 없음 " + str(length))
				seen[index] = true
			_check(seen.size() == length and bag.is_empty(),
				"전체 소비 후에만 셔플백 refill " + str(length) + "/" + str(cycle))
