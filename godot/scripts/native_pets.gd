extends Node2D
## P2-004B 적용·격리검수 — 첫 전투 펫 4종(까마귀 HECTOR·고양이 DIROI·유령쇠뇌·유령불꽃 이리스) +
## 펫 대사 자막(petSubtitle). 표시 전용 소비자 — 적/플레이어 상태는 읽기만.
##
## 원본 근거(game.html):
## - 소환: 새 게임 initStage 경로 30798 — crow(P-0,-20)·cat(+0,+10)·xbow(-30,-28)·
##   iris(+20,-34), cat.t=~~(rand()*100)(비게임플레이 Math.random → 별도 로컬 RNG),
##   xbow.t=25, iris.t=50·sz=G._irisSz‖20.
## - 상수 PETS 9243: crow{spd22,orbR38,orbY-22} cat{spd24,orbR28,orbY32}
##   xbow{spd18,orbR44,orbY-28} iris{spd14,orbR55}.
## - 이동: _updateOnePet 41420~41478(궤도식·d*.12 감속·언스턱 520),
##   _updateGhostXbow 41496~41512(이동만 — **공격 코드 없음**),
##   _updateGhostIris 41514~41541(적 탐색 800·머리 위 궤도·*.12/.15 lerp — **피해 없음**).
## - 렌더: 59905~59975(crow/cat 스프라이트 24px·bob·그림자·눈 글로우; crow _fly는
##   미등록 dead → 정적 8방향), xbow 59978~60009(벡터), 이리스 55288~55318(글로우
##   lighter + flame01~04 스프라이트, 20+sz*.8). 에셋 전부 원본 복사.
## - 이리스 광원: _collectLights 4686~4690 → screen_lighting.set_native_iris_light.
## - 대사: [S03e] 9289~9620 — _petSay 9389/_petSayCD 9471/_petBidCD/_petSayUrgent/
##   _updatePetBubble 9482(pair·pow(r,.6)×.6 페이드)/_petTierOf/_PET_TIER_COOL 9414.
##   P2-004B 당시 카탈로그171 ID(기존11+잔여160), 선언연결60/데이터전용111.
##   DEMO11-44: 기존9 ID 실제 owner 연결 추가, 현재69/102(원문·수치 불변).
##   트리거·쿨다운·우선순위는 원본9514~9814; Godot 실제 적용/검수는 보고서 참조.
##   카운터 _petOnAtk=hurtE 진입(42117 — hurtE 1회=1), _petOnHit=hurtP(43425),
##   _petOnKill=42702(처치). 자막 패널: #petSubtitle DOM(2587+CSS 2026-09-29 계약 —
##   bottom 230px·좌/우 20px·초상 480px·scale 1.5·텍스트 crow(92,237,306,51)/
##   cat(122,250,190,42)·0.92rem·opacity max .6).
## 정정: P2-001d의 '이리스 피해 108~156' 추정은 오귀속 — 현 원본 펫 4종 모두 공격
## 코드 없음(41496~41541). 해당 피해 출처는 별도 조사 항목.

const DIALOGUE_CATALOG = preload("res://scripts/native_pet_dialogue_catalog.gd")
const PET_SURVIVAL_WEIGHTS := {"hp_critical": 100, "hp_oneshot": 95, "boss_grab_warn": 90,
	"boss_aoe_warn": 90, "boss_exec": 88, "stun_warn": 80, "boss_groggy": 70,
	"crisis_hp30": 60, "burn_warn": 55, "warn_hp50": 40} # game.html 9410

const PET_DEFS := {
	"crow": {"spd": 22.0, "orbR": 38.0, "orbY": -22.0},
	"cat": {"spd": 24.0, "orbR": 28.0, "orbY": 32.0},
	"xbow": {"spd": 18.0, "orbR": 44.0, "orbY": -28.0},
	"iris": {"spd": 14.0, "orbR": 55.0}}
const PET_DIRS := ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"]
const CAT_RUN_MIRROR := {"east": "west", "south-east": "south-west", "north-east": "south-west",
	"north-west": "south-west", "north": "south", "south": "south", "south-west": "south-west", "west": "west"}
const CAT_RUN_FLIP := {"east": true, "south-east": true, "north-east": true}
const CAT_IDLE_MIRROR := {"south": "south", "south-west": "south-west", "south-east": "south-west",
	"west": "south-west", "east": "south-west", "north-west": "south", "north-east": "south", "north": "south"}
const CAT_IDLE_FLIP := {"south-east": true, "east": true, "north-east": true}
const PET_TIER_COOL := [1200, 720, 480, 360, 240, 0] # 9414
const PET_OP_MAX := 0.6 # 9348
const IRIS_GLOW_R := 250.0 # OPT.irisGlow‖250

var _world: Node
var _player: Node2D
var _state: Node
var _lighting: CanvasLayer
var _configured := false
var pets: Dictionary = {} # 어댑터 소유 런타임 상태 — 원본 G.pets(30798) 상당.
							# 포트 G 40키 부트 계약 보존을 위해 state G에 넣지 않음(기록).
var _tick := 0.0
# DEMO11-44: observation only. PC owns damage/death; State owns recovery.
var _demo_main: Node
var _demo_encounter: Node
var _demo_family: Node
var _demo_events: Dictionary = {}
var _demo_phase_seen := [false, false, false]
var _demo_intro_seen := false
var _demo_iris_key := ""

func bind_demo_owners(main: Node) -> bool:
	if not _configured or is_instance_valid(_demo_main) or not is_instance_valid(main) or main.get("world") != _world or main.get("player") != _player or main.get("source_state") != _state or get_parent() != _world or _world.get_parent() != main:
		return false
	var encounter: Node = main.get("native_demo_encounter")
	var family: Node = main.get("native_demo_anglers")
	if not is_instance_valid(encounter) or not is_instance_valid(family): return false
	_demo_main = main
	_demo_encounter = encounter
	_demo_family = family
	encounter.gate_ready.connect(_demo_gate)
	encounter.reward_ready.connect(_demo_reward)
	encounter.clear_recorded.connect(_demo_clear)
	family.family_defeated.connect(_demo_field_done)
	return true

func _demo_live() -> bool:
	return _configured and is_instance_valid(_world) and is_instance_valid(_player) and is_instance_valid(_state) and is_instance_valid(_demo_main) and not _demo_main.is_queued_for_deletion() and is_instance_valid(_demo_encounter) and is_instance_valid(_demo_family) and _demo_main.get("native_demo_encounter") == _demo_encounter and _demo_main.get("native_demo_anglers") == _demo_family and _world.get_parent() == _demo_main and get_parent() == _world and _demo_main.get("source_state") == _state and _demo_main.get("world") == _world

func _demo_gate() -> void:
	if not _demo_live() or _demo_events.has("gate") or _demo_main.native_demo_encounter.snapshot().phase != "gate": return
	_demo_events.gate = true
	_offer_dialogue("boss_gate_open") # G41878: urgent, also above Lv500.

func _demo_field_done() -> void:
	if not _demo_live(): return
	var g: Variant = _state.read_current_g()
	if g is Dictionary and g.get("_fbDone") == true: _demo_events.field_done = true
	# No invented miniboss speech: G9779 defines a callback, no field call site.

func _demo_reward(_record: Dictionary) -> void:
	if not _demo_live() or _demo_events.has("boss_kill") or _demo_main.native_demo_encounter.snapshot().phase != "exit": return
	_demo_events.boss_kill = true
	var p: Variant = _state.read_current_p()
	if not p is Dictionary or int(p.get("lv",1)) > 500: return
	# G9680: final-owner transition cancels both lines before unconditional speech.
	_pet_bubble.t = 0.0; _pet_bubble.pair = null; _pet_bubble.erase("uid")
	_pet_dlg_cd.erase("boss_kill")
	_offer_dialogue("boss_kill")
	_demo_phase_seen = [false,false,false]

func _demo_clear(_result: Dictionary) -> void:
	if _demo_live() and _demo_main.native_demo_encounter.snapshot().phase == "clear":
		_demo_events.clear = true
	# G9795/9810 have no live call sites. Do not invent chapter-clear/speed speech.

func _demo_boss() -> Dictionary:
	if not _demo_live() or _demo_events.has("boss_kill") or _demo_events.has("clear") or _demo_main.native_demo_encounter.snapshot().phase != "arena": return {}
	var actor: Node = _demo_main.get("native_demo_boss_actor")
	if not is_instance_valid(actor) or not actor.is_source_frame_completed(): return {}
	var snapshot: Dictionary = actor.snapshot()
	return snapshot.get("enemy",{}) if snapshot.get("status") == "READY" else {}

func _demo_targets() -> Array:
	var result: Array = []
	if not _demo_live() or _demo_events.has("clear"): return result
	var boss: Dictionary = _demo_boss()
	if boss.get("alive") == true: result.append({"key":"boss","x":boss.x,"y":boss.y,"r":boss.r})
	return result


# 대사 상태 (9287~9292)
var _pet_bubble := {"who": null, "source": "", "txt": "", "t": 0.0, "mt": 0.0, "pair": null, "pair_fired": false}
var _pet_dlg_cd: Dictionary = {}
var _pet_tier_cd := [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
var _pet_tut: Dictionary = {}
var _pet_atk_cnt := 0
var _pet_hit_cnt := 0
var _pet_kill_cnt := 0
var _pet_parry_cnt := 0
var _pet_charge_used := false
var _bid := {"tier": -1, "weight": 0, "id": "", "who": "", "txt": "", "dur": 0.0, "cd": 0.0, "pw": null, "pt": null, "pd": 0.0}
var _pet_enemy_avg_atk := 0.0
var _pet_combo_kills := 0
var _pet_last_enemy_count := 0
var _pet_stage_cleared := false
var _pet_idle_t := 0.0
var _pet_idle_talk_t := 0.0
var _pet_stage_env_t := 0.0
var _pet_stage_env: Dictionary = {}
var _dialogue_rng := RandomNumberGenerator.new()
var _dialogue_halt := ""
var _pet_nag_bag: Array = []
var _pet_tip_bag: Array = []
var _pet_talk_bag: Array = []
var _in_frame := false
var _say_log: Array = []

# 자막 패널
var _subtitle_layer: CanvasLayer
var _subtitle_root: Control
var _portrait: TextureRect
var _bubble_label: Label

var _crow_tex: Dictionary = {}
var _cat_static: Dictionary = {}
var _cat_idle: Dictionary = {}
var _cat_run: Dictionary = {}
var _flame_tex: Array = []
# PCI-13 (PC-LIFE-PACK 2026-10-21): 대사 초상 강한 참조 캐시 — configure 때 crow/cat 각 1회 로드,
# 발화(_show_bubble) 때 ResourceLoader.exists/load 0회. 원본 웹 기능이 아닌 Godot hitch 개선.
const PET_PORTRAIT_PATHS := {"crow": "res://assets/pets/crow_portrait.png", "cat": "res://assets/pets/cat_portrait.png"}
var _portrait_cache: Dictionary = {}   # who → Texture2D (강한 참조)
var _portrait_prepare: Dictionary = {} # who → {ready, cached, usec, reason}
var _iris_glow_tex: GradientTexture2D


func configure(world: Node, player: Node2D, state: Node, lighting: CanvasLayer) -> bool:
	if _configured or not is_instance_valid(world) or not is_instance_valid(player) \
			or not is_instance_valid(state) or not state.has_method("read_current_inventory"):
		return false
	_world = world
	_player = player
	_state = state
	_lighting = lighting if is_instance_valid(lighting) and lighting.has_method("set_native_iris_light") else null
	z_index = 500 # S7 패스 — 엔티티 뒤(y정렬) 이후 렌더(59905)
	for dir in PET_DIRS:
		_crow_tex[dir] = load("res://assets/pets/crow/" + dir + ".png")
		_cat_static[dir] = load("res://assets/pets/cat/" + dir + ".png")
	_cat_idle["south"] = _load_frames("res://assets/pets/cat_idle_south/frame_00%d.png", 8)
	_cat_idle["south-west"] = _load_frames("res://assets/pets/cat_idle_sw/frame_00%d.png", 2)
	_cat_run["south"] = _load_frames("res://assets/pets/cat_run_south/frame_00%d.png", 4)
	_cat_run["south-west"] = _load_frames("res://assets/pets/cat_run_sw/frame_00%d.png", 4)
	_cat_run["west"] = _load_frames("res://assets/pets/cat_run_west/frame_00%d.png", 4)
	for i in range(1, 5):
		_flame_tex.append(load("res://assets/fx/flame0%d.png" % i))
	# _irisLight 25502: 400² radial rgba(60,160,255,.22)→(40,130,220,.12)→(30,100,180,.04)→0
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color(60.0 / 255, 160.0 / 255, 1.0, 0.22),
		Color(40.0 / 255, 130.0 / 255, 220.0 / 255, 0.12),
		Color(30.0 / 255, 100.0 / 255, 180.0 / 255, 0.04), Color(0, 0, 0, 0)])
	gradient.offsets = PackedFloat32Array([0.0, 0.3, 0.7, 1.0])
	_iris_glow_tex = GradientTexture2D.new()
	_iris_glow_tex.gradient = gradient
	_iris_glow_tex.fill = GradientTexture2D.FILL_RADIAL
	_iris_glow_tex.fill_from = Vector2(0.5, 0.5)
	_iris_glow_tex.fill_to = Vector2(1.0, 0.5)
	_iris_glow_tex.width = 400
	_iris_glow_tex.height = 400
	# 소환 (30798) — cat.t=~~(Math.random()*100): 원본이 비추적 Math.random이므로
	# 공유 월드 샘플러를 소비하지 않는 로컬 RNG 사용(공유 RNG 소비수 계약 914 보존).
	var p: Vector2 = player.global_position
	var local_rng := RandomNumberGenerator.new()
	local_rng.randomize()
	_dialogue_rng.randomize()
	var cat_t: float = floor(local_rng.randf() * 100.0)
	pets = {
		"crow": {"x": p.x, "y": p.y - 20.0, "tx": p.x, "ty": p.y, "t": 0.0, "pdx": 0.0, "pdy": 0.0, "moving": false},
		"cat": {"x": p.x, "y": p.y + 10.0, "tx": p.x, "ty": p.y, "t": cat_t, "pdx": 0.0, "pdy": 0.0, "moving": false},
		"xbow": {"x": p.x - 30.0, "y": p.y - 28.0, "tx": p.x, "ty": p.y, "t": 25.0, "atk_cd": 0.0, "ang": 0.0, "pdx": 0.0, "pdy": 0.0, "moving": false},
		"iris": {"x": p.x + 20.0, "y": p.y - 34.0, "t": 50.0, "sz": 20.0, "tgt": null, "tgt_t": 0}}
	# 카운터 배선: _petOnAtk=hurtE 진입 1회(42117)·_petOnKill(42702)·_petOnHit(43425)
	player.telemetry_event.connect(func(kind, data):
		if kind == "native_hurte":
			_pet_atk_cnt += 1
			if data.get("killed") == true:
				var current_p: Variant = _state.read_current_p()
				_on_pet_kill(current_p if current_p is Dictionary else {})
		elif kind == "player_damage":
			_pet_hit_cnt += 1)
	_build_subtitle_panel()
	for who in ["crow", "cat"]:
		prepare_native_pet_portrait(who)
	_configured = true
	return true


static func _load_frames(pattern: String, count: int) -> Array:
	var frames: Array = []
	for i in range(count):
		frames.append(load(pattern % i))
	return frames


func _demo47i_physics_body(_delta: float) -> void:
	if not _configured or not is_instance_valid(_player):
		return
	_tick += 1.0
	_update_one_pet("crow")
	_update_one_pet("cat")
	_update_ghost_xbow()
	_update_ghost_iris()
	_check_pet_dialogue()
	_push_iris_light()
	queue_redraw()


# ── 이동 (41420~41478) ──
func _update_one_pet(key: String) -> void:
	var def: Dictionary = PET_DEFS[key]
	var pet: Dictionary = pets[key]
	pet["t"] += 1.0
	var is_cat := key == "cat"
	var p: Vector2 = _player.global_position
	var ox: float = cos(pet["t"] * (0.018 if is_cat else 0.025)) * def["orbR"]
	var oy: float = def["orbY"] + sin(pet["t"] * (0.022 if is_cat else 0.035)) * (4.0 if is_cat else 10.0)
	pet["tx"] = p.x + ox
	pet["ty"] = p.y + oy
	_move_pet(pet, def["spd"])
	if Vector2(pet["x"], pet["y"]).distance_to(p) > 520.0: # 언스턱
		pet["x"] = p.x + (18.0 if is_cat else -24.0)
		pet["y"] = p.y + (10.0 if is_cat else -18.0)
		pet["tx"] = pet["x"]
		pet["ty"] = pet["y"]


func _update_ghost_xbow() -> void:
	var def: Dictionary = PET_DEFS["xbow"]
	var pet: Dictionary = pets["xbow"]
	pet["t"] += 1.0
	var p: Vector2 = _player.global_position
	pet["tx"] = p.x + cos(pet["t"] * 0.02 + PI) * def["orbR"]
	pet["ty"] = p.y + def["orbY"] + sin(pet["t"] * 0.03 + 1.5) * 8.0
	_move_pet(pet, def["spd"])
	if Vector2(pet["x"], pet["y"]).distance_to(p) > 520.0:
		pet["x"] = p.x - 30.0
		pet["y"] = p.y - 28.0
		pet["tx"] = pet["x"]
		pet["ty"] = pet["y"]
	# 공격 없음 — 원본 41496~41512 이동만(과거 자동사격 제거됨)


func _move_pet(pet: Dictionary, spd: float) -> void:
	var dx: float = pet["tx"] - pet["x"]
	var dy: float = pet["ty"] - pet["y"]
	var d: float = sqrt(dx * dx + dy * dy)
	pet["pdx"] = dx
	pet["pdy"] = dy
	pet["moving"] = d > 5.0
	if d > 3.0:
		var s: float = minf(spd, d * 0.12)
		pet["x"] += dx / d * s
		pet["y"] += dy / d * s
	else:
		pet["x"] = pet["tx"]
		pet["y"] = pet["ty"]


func _update_ghost_iris() -> void:
	var pet: Dictionary = pets["iris"]
	pet["t"] += 1.0
	var p: Vector2 = _player.global_position
	pet["tgt_t"] = int(pet["tgt_t"]) + 1
	var target: Variant = pet["tgt"]
	var has_live_target: bool = target is Object and is_instance_valid(target) and target.get("alive") == true
	var candidates: Array = _demo_targets()
	var demo_target_live: bool = false
	for candidate in candidates:
		if candidate.key == _demo_iris_key: demo_target_live = true
	var need: bool = (not has_live_target and not demo_target_live) or (not _demo_iris_key.is_empty() and not demo_target_live) or int(pet["tgt_t"]) % 10 == 0
	if need:
		var best_d := 800.0 # 탐색 반경 800 (41525)
		var best: Node2D = null
		if _world.has_method("get_enemies"):
			for enemy in _world.get_enemies():
				if is_instance_valid(enemy) and enemy.get("alive") == true:
					var d: float = p.distance_to(enemy.global_position)
					if d < best_d:
						best_d = d
						best = enemy
		pet["tgt"] = best
		target = best
	if need:
		_demo_iris_key = ""
		var nearest: float = p.distance_to(target.global_position) if target is Node2D and is_instance_valid(target) and target.get("alive") == true else 800.0
		for candidate in candidates:
			var distance: float = p.distance_to(Vector2(candidate.x,candidate.y))
			if distance < nearest:
				nearest = distance; _demo_iris_key = candidate.key
	if not _demo_iris_key.is_empty():
		pet.tgt = null; target = null
	for candidate in candidates:
		if candidate.key == _demo_iris_key:
			var a: float = pet.t * 0.03
			if float(candidate.x)>10.0 or float(candidate.y)>10.0:
				pet.x += (float(candidate.x)+cos(a)*20.0-float(pet.x))*0.12
				pet.y += (float(candidate.y)-float(candidate.r)-15.0+sin(a)*8.0-float(pet.y))*0.12
			return
	_demo_iris_key = ""
	if target is Object and is_instance_valid(target) and target.get("alive") == true:
		var ang: float = pet["t"] * 0.03
		var tx: float = (target as Node2D).global_position.x + cos(ang) * 20.0
		var ty: float = (target as Node2D).global_position.y - float(target.get("radius")) - 15.0 + sin(ang) * 8.0
		pet["x"] += (tx - pet["x"]) * 0.12
		pet["y"] += (ty - pet["y"]) * 0.12
	else:
		var ang2: float = pet["t"] * 0.02
		pet["x"] += (p.x + cos(ang2) * PET_DEFS["iris"]["orbR"] - pet["x"]) * 0.15
		pet["y"] += (p.y + sin(ang2) * PET_DEFS["iris"]["orbR"] - pet["y"]) * 0.15


func _push_iris_light() -> void:
	if _lighting == null:
		return
	var viewport_size: Vector2 = get_viewport().get_visible_rect().size
	var camera: Camera2D = get_viewport().get_camera_2d()
	var center: Vector2 = camera.get_screen_center_position() if is_instance_valid(camera) else _player.global_position
	var screen: Vector2 = viewport_size * 0.5 + (Vector2(pets["iris"]["x"], pets["iris"]["y"]) - center)
	# 4688: _irFlk=.45+sin(f·.1)·.08+sin(f·.17)·.05, a=_irFlk×.6
	var flk: float = 0.45 + sin(_tick * 0.1) * 0.08 + sin(_tick * 0.17) * 0.05
	_lighting.set_native_iris_light(screen, IRIS_GLOW_R, flk * 0.6)


# ── P2-004B: 원문 카탈로그 소비 + 원본 디스패처(9389~9503) ──
func _pet_tier_of(id: String) -> int:
	return DIALOGUE_CATALOG.tier_of(id)


func _offer_dialogue(id: String) -> bool:
	var entry: Dictionary = DIALOGUE_CATALOG.ENTRIES.get(id, {})
	# 미이식 이벤트는 데이터만. 외부의 임의 id 요청으로 가짜 트리거를 만들지 않는다.
	if entry.is_empty() or entry.get("connected") != true:
		return false
	var who: String = entry["who"]
	var txt: String = entry["txt"]
	var dur: float = float(entry["dur"])
	var pw: Variant = entry["pw"]
	var pt: Variant = entry["pt"]
	var pd: float = float(entry["pd"])
	match entry["mode"]:
		"cd":
			return _pet_say_cd(id, who, txt, dur, float(entry["cd"]), pw, pt, pd)
		"bid":
			return _pet_bid_cd(id, who, txt, dur, float(entry["cd"]), pw, pt, pd)
		"say":
			return _pet_say(id, who, txt, dur, pw, pt, pd)
		"urgent":
			return _pet_say_urgent(id, who, txt, dur, float(entry["cd"]), pw, pt, pd)
	return false


func _pet_say(id: String, who: String, txt: String, dur_sec: float, pair_who: Variant = null,
		pair_txt: Variant = null, pair_dur: float = 5.0) -> bool:
	if _pet_bubble["t"] > 0.0 or float(_pet_dlg_cd.get(id, 0.0)) > 0.0:
		return false
	_pet_bubble["who"] = who
	_pet_bubble["source"] = txt
	_pet_bubble["txt"] = txt
	_pet_bubble["mt"] = floor(dur_sec * 60.0)
	_pet_bubble["t"] = _pet_bubble["mt"]
	_pet_bubble["pair_fired"] = false
	_pet_bubble["pair"] = ({"who": pair_who, "txt": pair_txt, "mt": floor((pair_dur if pair_dur != 0.0 else 5.0) * 60.0)}
		if pair_who != null and pair_txt != null else null)
	_show_bubble(who, txt)
	_say_log.append({"id": id, "who": who})
	return true


func _pet_say_cd(id: String, who: String, txt: String, dur: float, cd: float,
		pw: Variant = null, pt: Variant = null, pd: float = 5.0) -> bool:
	if float(_pet_dlg_cd.get(id, 0.0)) > 0.0 or _pet_bubble["t"] > 0.0:
		return false
	var tier := _pet_tier_of(id)
	if _pet_tier_cd[tier] > 0.0:
		return false
	var ok := _pet_say(id, who, txt, dur, pw, pt, pd)
	if ok:
		_pet_dlg_cd[id] = floor(cd * 60.0)
		_pet_tier_cd[tier] = float(PET_TIER_COOL[tier])
	return ok


func _record_dialogue_bid(tier: int, weight: int, id: String, who: String, txt: String,
		dur: float, cd: float, pw: Variant, pt: Variant, pd: float) -> void:
	# 원본 _PB 단일 슬롯 재사용(9411/9430/9438), 동일 티어는 앞선 코드 우선.
	_bid["tier"] = tier
	_bid["weight"] = weight
	_bid["id"] = id
	_bid["who"] = who
	_bid["txt"] = txt
	_bid["dur"] = dur
	_bid["cd"] = cd
	_bid["pw"] = pw
	_bid["pt"] = pt
	_bid["pd"] = pd


func _pet_bid_cd(id: String, who: String, txt: String, dur: float, cd: float,
		pw: Variant = null, pt: Variant = null, pd: float = 5.0) -> bool:
	if float(_pet_dlg_cd.get(id, 0.0)) > 0.0:
		return false
	var tier := _pet_tier_of(id)
	if tier <= int(_bid["tier"]):
		return false
	_record_dialogue_bid(tier, tier * 10, id, who, txt, dur, cd, pw, pt, pd)
	return true


func _pet_say_urgent(id: String, who: String, txt: String, dur: float, cd: float,
		pw: Variant = null, pt: Variant = null, pd: float = 5.0) -> bool:
	if float(_pet_dlg_cd.get(id, 0.0)) > 0.0:
		return false
	if _in_frame:
		var weight: int = int(PET_SURVIVAL_WEIGHTS.get(id, 50))
		if int(_bid["tier"]) == 5 and weight <= int(_bid["weight"]):
			return false
		_record_dialogue_bid(5, weight, id, who, txt, dur, cd, pw, pt, pd)
		return true
	if _pet_bubble.get("uid") == id and _pet_bubble["t"] > 0.0:
		return false
	_interrupt_dialogue(id, who, txt, dur, cd, pw, pt, pd)
	return true


func _interrupt_dialogue(id: String, who: String, txt: String, dur: float, cd: float,
		pw: Variant, pt: Variant, pd: float) -> void:
	_pet_bubble["t"] = 0.0
	_pet_bubble["pair"] = null
	_pet_say(id, who, txt, dur, pw, pt, pd)
	_pet_bubble["uid"] = id
	_pet_dlg_cd[id] = floor(cd * 60.0)
	for i in range(5):
		_pet_tier_cd[i] = maxf(float(_pet_tier_cd[i]), 300.0)


func _pet_fire_bid() -> void:
	var tier: int = int(_bid["tier"])
	if tier < 0:
		return
	if tier >= 5:
		if not (_pet_bubble.get("uid") == _bid["id"] and _pet_bubble["t"] > 0.0):
			_interrupt_dialogue(str(_bid["id"]), str(_bid["who"]), str(_bid["txt"]),
				float(_bid["dur"]), float(_bid["cd"]), _bid["pw"], _bid["pt"], float(_bid["pd"]))
	elif _pet_bubble["t"] <= 0.0 and _pet_tier_cd[tier] <= 0.0:
		if _pet_say(str(_bid["id"]), str(_bid["who"]), str(_bid["txt"]), float(_bid["dur"]),
				_bid["pw"], _bid["pt"], float(_bid["pd"])):
			_pet_dlg_cd[str(_bid["id"])] = floor(float(_bid["cd"]) * 60.0)
			_pet_tier_cd[tier] = float(PET_TIER_COOL[tier])
	_bid["tier"] = -1
	_bid["weight"] = 0


func _update_pet_bubble() -> void:
	# 9482~9505
	for k in _pet_dlg_cd.keys():
		_pet_dlg_cd[k] = float(_pet_dlg_cd[k]) - 1.0
		if float(_pet_dlg_cd[k]) <= 0.0:
			_pet_dlg_cd.erase(k)
	for i in range(6):
		if _pet_tier_cd[i] > 0.0:
			_pet_tier_cd[i] = maxf(0.0, _pet_tier_cd[i] - 1.0)
	if _pet_bubble["t"] > 0.0:
		_pet_bubble["t"] = float(_pet_bubble["t"]) - 1.0
		if _pet_bubble["t"] <= 0.0 and _pet_bubble["pair"] != null and not _pet_bubble["pair_fired"]:
			_pet_bubble["pair_fired"] = true
			var pair: Dictionary = _pet_bubble["pair"]
			_pet_bubble["who"] = pair["who"]
			_pet_bubble["source"] = pair["txt"]
			_pet_bubble["txt"] = pair["txt"]
			_pet_bubble["mt"] = pair["mt"]
			_pet_bubble["t"] = pair["mt"]
			_pet_bubble["pair"] = null
			_show_bubble(str(pair["who"]), str(pair["txt"]))
		if _pet_bubble["t"] > 0.0 and is_instance_valid(_subtitle_root):
			var r: float = float(_pet_bubble["t"]) / float(_pet_bubble["mt"]) if float(_pet_bubble["mt"]) > 0.0 else 0.0
			_subtitle_root.modulate = Color(1, 1, 1, pow(clampf(r, 0.0, 1.0), 0.6) * PET_OP_MAX)
	if _pet_bubble["t"] <= 0.0 and _pet_bubble["pair"] == null and is_instance_valid(_subtitle_root):
		_subtitle_root.modulate = Color(1, 1, 1, 0)


# 원본 9507~9737. 상태는 owner에서 읽고 지역 복사만 수정한다.
func _check_pet_dialogue() -> void:
	var raw_p: Variant = _state.read_current_p()
	var raw_g: Variant = _state.read_current_g()
	if not raw_p is Dictionary or not raw_g is Dictionary:
		_dialogue_halt = "source_p_or_g_not_ready"
		return
	if raw_g.get("on") != true:
		return
	var p: Dictionary = raw_p.duplicate()
	var g: Dictionary = raw_g
	# read_current_p의 _hdCd는 constructor 값이므로 실제 스킬 owner를 읽는다.
	p.erase("_hdCd")
	var slots: Node = _world.get_node_or_null("NativeSkillSlots")
	if is_instance_valid(slots) and slots.has_method("get_native_skill_slots_snapshot"):
		p["_hdCd"] = slots.get_native_skill_slots_snapshot()["hd_cd"]
	if _player.has_method("get_native_burn_snapshot"):
		p["_rbBurn"] = _player.get_native_burn_snapshot()
	var alive_count := 0
	var near_count := 0
	var near_frozen := false
	var attack_total := 0.0
	var attack_count := 0
	# _tick은 기존 펫 어댑터의 60Hz 진행 시계. 공유 G.frame/상태는 쓰지 않는다.
	var sample_attack: bool = int(_tick) % 60 == 0
	for enemy in _world.get_enemies():
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue
		alive_count += 1
		var distance_sq: float = _player.global_position.distance_squared_to(enemy.global_position)
		if distance_sq < 90000.0: # 원본 9594/9597: 엄격 반경 300
			near_count += 1
			if not enemy.has_method("read_native_normal_enemy_hurte_fields"):
				_dialogue_halt = "enemy_freeze_owner_absent"
				return
			var enemy_fields: Dictionary = enemy.read_native_normal_enemy_hurte_fields(_world)
			var frozen: Variant = enemy_fields.get("_frozen")
			if enemy_fields.get("ready") != true or not (frozen is int or frozen is float):
				_dialogue_halt = "enemy_freeze_owner_not_ready"
				return
			if float(frozen) > 0.0:
				near_frozen = true
		if sample_attack and distance_sq < 250000.0: # 원본9524: 엄격 반경 500
			attack_total += float(enemy.get("attack")) # enemy.gd83 = 원본 e.atk
			attack_count += 1
	# G9524/9682: arena boss belongs to source ens, although its native owner is separate.
	var arena_boss: Dictionary = _demo_boss()
	if arena_boss.get("alive") == true:
		alive_count += 1
		var boss_distance_sq: float = _player.global_position.distance_squared_to(Vector2(arena_boss.x,arena_boss.y))
		if boss_distance_sq < 90000.0:
			near_count += 1
			if float(arena_boss.get("_frozen",0)) > 0.0: near_frozen = true
		if sample_attack and boss_distance_sq < 250000.0:
			attack_total += float(arena_boss.get("atk",0)); attack_count += 1
	if sample_attack:
		_pet_enemy_avg_atk = attack_total / attack_count if attack_count > 0 else 0.0
	_dialogue_halt = ""
	_update_pet_bubble()
	_bid["tier"] = -1
	_in_frame = true
	_check_urgent_dialogue(p)
	_pet_fire_bid()
	_in_frame = false
	_bid["tier"] = -1
	if int(p.get("lv", 1)) > 500:
		return
	if _check_pet_tutorial(p, g):
		return
	_check_competitive_dialogue(p, g, near_count, alive_count, near_frozen)
	_pet_fire_bid()


func _check_urgent_dialogue(p: Dictionary) -> void:
	var hp: float = float(p["hp"])
	var mhp: float = float(p["mhp"])
	if hp > 0.0 and hp < mhp * 0.5 and hp >= mhp * 0.3:
		_offer_dialogue("warn_hp50")
	if hp > 0.0 and hp < mhp * 0.3 and hp >= mhp * 0.1:
		_offer_dialogue("crisis_hp30")
	if hp > 0.0 and hp < mhp * 0.1:
		_offer_dialogue("hp_critical")
	var burns: Variant = p.get("_rbBurn", [])
	if hp > 0.0 and (float(p.get("burnT", 0.0)) > 0.0 or (burns is Array and not burns.is_empty())):
		_offer_dialogue("burn_warn")
	if hp > 0.0 and _pet_enemy_avg_atk > 0.0 and hp < _pet_enemy_avg_atk * 1.2:
		_offer_dialogue("hp_oneshot")
	for id in demo_boss_survival_ids(_demo_boss(),p): _offer_dialogue(id)
	if float(p["st"]) < float(p["mst"]) * 0.5 and int(p["lv"]) <= 100:
		_offer_dialogue("low_st") # 원본9537: T3를 urgent 중간 fire에서 처리한다.


# G9539–9553. Pure selection; _execCd has no admitted owner in this unit.
static func demo_boss_survival_ids(boss: Dictionary, p: Dictionary) -> Array:
	var ids: Array = []
	if boss.get("alive") == true and float(boss.get("stunned",0)) > 0.0:
		if int(p.get("skills",{}).get("execution",0)) < 1: ids.append("boss_groggy")
	var boss_state: String = str(boss.get("s",""))
	if boss_state == "bossGrabWind": ids.append("boss_grab_warn")
	elif boss_state in ["bossBurstWind","bossShockWind","bossMeteorWind","bossVortexWind"]: ids.append("boss_aoe_warn")
	return ids


func _check_pet_tutorial(p: Dictionary, g: Dictionary) -> bool:
	if int(g.get("stage", 0)) != 0 or int(p.get("lv", 1)) > 200:
		return false
	if not _pet_tut.get("start", false):
		_pet_tut["start"] = true
		_offer_dialogue("tut_start")
		return true
	if not _pet_tut.get("atk3", false) and _pet_atk_cnt >= 3 and _pet_atk_cnt < 7:
		_pet_tut["atk3"] = true
		_offer_dialogue("tut_atk3")
		return true
	if not _pet_tut.get("atk7", false) and _pet_atk_cnt >= 7 and not _pet_charge_used:
		_pet_tut["atk7"] = true
		_offer_dialogue("tut_charge")
		return true
	if not _pet_tut.get("firstHit", false) and _pet_hit_cnt >= 1:
		_pet_tut["firstHit"] = true
		_offer_dialogue("tut_1sthit")
		return true
	if not _pet_tut.get("hit2", false) and _pet_hit_cnt >= 2:
		_pet_tut["hit2"] = true
		_offer_dialogue("tut_hit2")
		return true
	if not _pet_tut.get("parryHint", false) and _pet_atk_cnt >= 8 and _pet_parry_cnt == 0:
		_pet_tut["parryHint"] = true
		_offer_dialogue("tut_parry")
		return true
	if not _pet_tut.get("firstKill", false) and _pet_kill_cnt >= 1:
		_pet_tut["firstKill"] = true
		_offer_dialogue("tut_1stkill")
		return true
	if not _pet_tut.get("bowIntro", false) and _pet_kill_cnt >= 3:
		_pet_tut["bowIntro"] = true
		_offer_dialogue("tut_bow")
		return true
	if not _pet_tut.get("firstItem", false):
		var bag: Variant = (_state.read_current_inventory() as Dictionary).get("bag")
		if bag is Array and not bag.is_empty() and _offer_dialogue("tut_firstItem"):
			_pet_tut["firstItem"] = true
			return true
	return false


func _check_competitive_dialogue(p: Dictionary, g: Dictionary, near_count: int,
		alive_count: int, near_frozen: bool) -> void:
	var skills: Dictionary = p.get("skills", {})
	if near_frozen:
		_offer_dialogue("enemy_ice")
	if near_count >= 10:
		_offer_dialogue("melee_trap_yes" if int(skills.get("spikeTrap", 0)) > 0 else "melee_trap_no")
	if near_count >= 20:
		_offer_dialogue("melee_slam_yes" if int(skills.get("giantSlam", 0)) > 0 else "melee_slam_no")
	if float(p["hp"]) < float(p["mhp"]) * 0.5 or float(p["mp"]) < float(p["mmp"]) * 0.5 or float(p["st"]) < float(p["mst"]) * 0.5:
		if int(skills.get("holyDome", 0)) > 0 and p.has("_hdCd") and float(p["_hdCd"]) <= 0.0:
			_offer_dialogue("resource_half_dome")
		elif int(skills.get("holyDome", 0)) == 0 or p.has("_hdCd"):
			_offer_dialogue("resource_parry")
		# 쿨다운 owner 부재는 폴백하지 않고 해당 half 분기를 정지한다.
	if float(p["hp"]) < float(p["mhp"]) * 0.3 or float(p["mp"]) < float(p["mmp"]) * 0.3 or float(p["st"]) < float(p["mst"]) * 0.3:
		_offer_dialogue("resource_low_yes" if int(skills.get("holyDome", 0)) > 0 else "resource_low_no")
	if alive_count == 0 and p.get("s", "") == "idle":
		_offer_dialogue("idle_noE")
	var boss_alive: bool = g.get("bossAlive", false) == true
	if boss_alive:
		_pet_idle_t = 0.0
		_pet_idle_talk_t = 0.0
	elif p.get("s", "") == "idle":
		_pet_idle_t += 1.0
		if _pet_idle_t > 1200.0:
			_pet_idle_t = 0.0
			if _dialogue_rng.randf() < 0.5:
				_offer_dialogue("idle_nag%d" % _pet_bag_next(_pet_nag_bag, 6))
			elif _dialogue_rng.randf() < 0.5:
				_offer_dialogue("idle_tip%d" % _pet_bag_next(_pet_tip_bag, 18))
		_pet_idle_talk_t += 1.0
		if alive_count == 0 and _pet_idle_talk_t > 7200.0:
			_pet_idle_talk_t = 0.0
			_offer_dialogue("petTalk_%d" % _pet_bag_next(_pet_talk_bag, 5))
	else:
		_pet_idle_t = 0.0
		_pet_idle_talk_t = 0.0
	# 현 포트 stage0만 인수됨. 다른 stage를 임의 챕터0로 오인하지 않는다.
	if int(g.get("stage", -1)) == 0:
		if not boss_alive:
			_offer_dialogue("chapter_0")
		if not _pet_stage_env.get(0, false):
			_pet_stage_env_t += 1.0
			if not boss_alive and _pet_stage_env_t > 1800.0:
				_pet_stage_env[0] = true
				_offer_dialogue("env_ch0")
	if _pet_last_enemy_count >= 5 and alive_count == 0 and not boss_alive and not _pet_stage_cleared:
		_pet_stage_cleared = true
		_offer_dialogue("stage_clear")
	if alive_count > 0:
		_pet_stage_cleared = false
	_pet_last_enemy_count = alive_count
	var boss: Dictionary = _demo_boss()
	if boss.get("alive") == true:
		var ratio: float = float(boss.hp)/float(boss.mhp)
		for i in range(3):
			if not _demo_phase_seen[i] and ratio < [0.7,0.4,0.15][i]:
				_demo_phase_seen[i] = true
				_offer_dialogue(["boss_p2","boss_p3","boss_p4"][i])
		if not _demo_intro_seen:
			_demo_intro_seen = true
			_offer_dialogue("boss_intro_ch0")


func _pet_bag_next(bag: Array, length: int) -> int:
	if bag.is_empty():
		for i in range(length):
			bag.append(i)
		for i in range(length - 1, 0, -1):
			var j: int = mini(i, floori(_dialogue_rng.randf() * (i + 1)))
			var value: int = int(bag[i])
			bag[i] = bag[j]
			bag[j] = value
	return int(bag.pop_back())


func _on_pet_kill(p: Dictionary) -> void:
	_pet_kill_cnt += 1
	_pet_combo_kills += 1
	if _pet_combo_kills == 50:
		_offer_dialogue("combo_50")
	if _pet_combo_kills == 100:
		_offer_dialogue("combo_100")
	if float(p.get("hp", 0.0)) > 0.0 and float(p["hp"]) < float(p["mhp"]) * 0.1:
		_offer_dialogue("low_hp_kill")
	# multi_kill: 원본9781 정의만 있고 호출처 없음. 임의 호출을 추가하지 않는다.


# ── 자막 패널 (petSubtitle — 2587 DOM + 2026-09-29/09-16 계약) ──
func _build_subtitle_panel() -> void:
	_subtitle_layer = CanvasLayer.new()
	_subtitle_layer.name = "NativePetSubtitle"
	_subtitle_layer.layer = 9 # DOM z999 — 캔버스 HUD 요소들과 함께, 게임 월드 위
	add_child(_subtitle_layer)
	_subtitle_root = Control.new()
	_subtitle_root.name = "PetSubtitleRoot"
	_subtitle_layer.add_child(_subtitle_root)
	_subtitle_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_subtitle_root.size = Vector2(480, 320)
	_subtitle_root.scale = Vector2(1.5, 1.5) # scale(ui-scale×1.5), ui-scale 1.0
	_subtitle_root.modulate = Color(1, 1, 1, 0)
	_portrait = TextureRect.new()
	_portrait.name = "PetPortrait"
	_subtitle_root.add_child(_portrait)
	_portrait.size = Vector2(480, 320)
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_bubble_label = Label.new()
	_bubble_label.name = "PetBubbleTxt"
	_subtitle_root.add_child(_bubble_label)
	_bubble_label.add_theme_font_size_override("font_size", 15) # 0.92rem
	_bubble_label.add_theme_color_override("font_color", Color.WHITE)
	_bubble_label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.95))
	_bubble_label.add_theme_constant_override("shadow_offset_y", 1)
	_bubble_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_bubble_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	# P2-007a — #petSubtitle(2587) font-family:'Malgun Gothic',sans-serif + #petBubbleTxt 700.
	# 시스템에 Malgun Gothic이 있으면 그것, 없으면 총칭 sans-serif 대리 Noto Sans KR(번들).
	_bubble_label.add_theme_font_override("font", preload("res://scripts/native_ui_fonts.gd").stack("pet", 700))
	# Mac CSS sans-serif uses the system Latin/CJK fallback, not bundled Noto.
	if OS.get_name()=="macOS":
		var css_font:=SystemFont.new();css_font.font_names=PackedStringArray(["Arial","Apple SD Gothic Neo"]);css_font.font_weight=700
		_bubble_label.add_theme_font_override("font",css_font)
	# CSS .92rem = 14.72px. Keep fractional metrics despite Label integer font_size.
	_bubble_label.scale=Vector2.ONE*(14.72/15.0)


const CROW_PORTRAIT: Texture2D = preload("res://assets/pets/crow_portrait.png")
const CAT_PORTRAIT: Texture2D = preload("res://assets/pets/cat_portrait.png")

func _show_bubble(who: String, txt: String) -> void:
	if not is_instance_valid(_subtitle_root):
		return
	var is_crow := who == "crow"
	var viewport_size: Vector2 = get_viewport().get_visible_rect().size
	# 9364–9378 초상 선택: crow→crow_portrait / 그 외→cat_portrait (원본 분기 그대로).
	# PCI-13: 캐시 소비만 — 준비 실패한 key는 현재 초상 무변이(기존 exists 실패와 같은 관측), 대사 계속.
	var portrait_key := "crow" if is_crow else "cat"
	var cached: Variant = _portrait_cache.get(portrait_key)
	if cached is Texture2D:
		_portrait.texture = cached
	# Source2587 bottom220px(1920×1080·ui-scale1), crow=left 20 / cat=right 20, origin bottom
	var panel_height := 320.0 * 1.5
	_subtitle_root.position = Vector2(20.0 if is_crow else viewport_size.x - 20.0 - 480.0 * 1.5,
		viewport_size.y - 220.0 - panel_height)
	# 텍스트 박스 (9372~9375): crow(92,237,306,51) / cat(122,250,190,42)
	if is_crow:
		_bubble_label.position = Vector2(92, 237)
		_bubble_label.size = Vector2(306, 51)/(14.72/15.0)
	else:
		_bubble_label.position = Vector2(122, 250)
		_bubble_label.size = Vector2(190, 42)/(14.72/15.0)
	_bubble_label.text = txt
	_subtitle_root.modulate = Color(1, 1, 1, PET_OP_MAX)


## PCI-13: 초상 1종 준비(로드+강한 참조). 이미 캐시면 재로드 0. 실패 시 그 key 캐시·현재 초상 무변이.
func prepare_native_pet_portrait(who: String) -> Dictionary:
	if not PET_PORTRAIT_PATHS.has(who):
		return {"ready": false, "who": who, "cached": false, "resource_identity": null, "reason": "unknown_pet_portrait_key"}
	if _portrait_cache.get(who) is Texture2D:
		return {"ready": true, "who": who, "cached": true, "resource_identity": _portrait_cache[who].get_instance_id(), "reason": ""}
	var path: String = PET_PORTRAIT_PATHS[who]
	var started := Time.get_ticks_usec()
	var texture: Variant = load(path) if ResourceLoader.exists(path) else null
	var usec := Time.get_ticks_usec() - started
	if not texture is Texture2D:
		_portrait_prepare[who] = {"ready": false, "cached": false, "usec": usec, "reason": "portrait_resource_missing"}
		return {"ready": false, "who": who, "cached": false, "resource_identity": null, "reason": "portrait_resource_missing"}
	_portrait_cache[who] = texture
	_portrait_prepare[who] = {"ready": true, "cached": false, "usec": usec, "reason": ""}
	return {"ready": true, "who": who, "cached": false, "resource_identity": texture.get_instance_id(), "reason": ""}

func get_native_pet_portrait_cache_snapshot() -> Dictionary:
	var ids: Dictionary = {}
	for who in _portrait_cache:
		ids[who] = _portrait_cache[who].get_instance_id()
	return {"keys": _portrait_cache.keys(), "resource_identity": ids, "prepare": _portrait_prepare.duplicate(true),
		"bubble_loads": 0}

# ── 렌더 (59905~60009 / 이리스 55288~55318) ──
func _draw() -> void:
	if not _configured:
		return
	for key in ["cat", "crow"]:
		_draw_sprite_pet(key)
	_draw_xbow()
	_draw_iris()


func _dir8(dx: float, dy: float) -> String:
	if dx == 0.0 and dy == 0.0:
		return "south"
	var idx: int = ((roundi(atan2(dy, dx) / (PI / 4.0)) % 8) + 8) % 8
	return PET_DIRS[idx]


func _draw_sprite_pet(key: String) -> void:
	var pet: Dictionary = pets[key]
	var is_crow := key == "crow"
	var bob: float = sin(pet["t"] * (0.1 if is_crow else 0.06)) * (2.0 if is_crow else 1.0)
	var px: float = pet["x"]
	var py: float = pet["y"] + bob
	var pos := Vector2(px, py) - global_position
	# 그림자
	draw_set_transform(pos + Vector2(0, 10.0 if is_crow else 3.0), 0.0, Vector2(1.0, 0.3))
	draw_circle(Vector2.ZERO, 4.0 if is_crow else 3.0, Color(0, 0, 0, 0.08 if is_crow else 0.15))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	var dir := _dir8(pet["pdx"], pet["pdy"])
	var size := 24.0
	if is_crow:
		var tex: Texture2D = _crow_tex.get(dir)
		if tex:
			draw_texture_rect(tex, Rect2(pos - Vector2(size / 2, size / 2), Vector2(size, size)), false)
		var eg: float = 0.4 + 0.3 * sin(pet["t"] * 0.08)
		draw_circle(pos + Vector2(-3, -3), 5.0, Color(1.0, 0.133, 0.0, eg * 0.3))
		draw_circle(pos + Vector2(-3, -3), 2.0, Color(1.0, 0.267, 0.133, eg))
	else:
		var tex2: Texture2D = null
		var flip := false
		if pet["moving"]:
			var rkey: String = CAT_RUN_MIRROR.get(dir, "south")
			flip = CAT_RUN_FLIP.get(dir, false)
			var frames: Array = _cat_run.get(rkey, [])
			if frames.size() > 0:
				tex2 = frames[int(pet["t"] * 0.08) % frames.size()]
		else:
			var ikey: String = CAT_IDLE_MIRROR.get(dir, "south")
			flip = CAT_IDLE_FLIP.get(dir, false)
			var frames2: Array = _cat_idle.get(ikey, [])
			if frames2.size() > 0:
				tex2 = frames2[int(pet["t"] * 0.04) % frames2.size()]
		if tex2 == null:
			tex2 = _cat_static.get(dir)
			flip = false
		if tex2:
			var rect := Rect2(pos - Vector2(size / 2, size / 2), Vector2(size, size))
			if flip:
				rect = Rect2(pos + Vector2(size / 2, -size / 2), Vector2(-size, size))
			draw_texture_rect(tex2, rect, false)
		var eg2: float = 0.4 + 0.3 * sin(pet["t"] * 0.06)
		for ex in [-3.0, 3.0]:
			draw_circle(pos + Vector2(ex, -4), 4.0, Color(0.667, 0.267, 1.0, eg2 * 0.3))
			draw_circle(pos + Vector2(ex, -4), 1.5, Color(0.8, 0.533, 1.0, eg2))


func _draw_xbow() -> void:
	var pet: Dictionary = pets["xbow"]
	var bob: float = sin(pet["t"] * 0.08) * 3.0
	var pos := Vector2(pet["x"], pet["y"] + bob) - global_position
	draw_circle(pos, 10.0, Color(0.4, 0.533, 0.8, 0.12 + sin(pet["t"] * 0.06) * 0.06))
	var body_alpha: float = 0.7 + sin(pet["t"] * 0.1) * 0.15
	draw_set_transform(pos, float(pet["ang"]), Vector2.ONE)
	draw_rect(Rect2(-6, -2.5, 12, 5), Color(Color("5577aa"), body_alpha))
	draw_polyline(PackedVector2Array([Vector2(5, -6), Vector2(8, 0), Vector2(5, 6)]), Color(Color("7799cc"), body_alpha), 1.5)
	draw_polyline(PackedVector2Array([Vector2(5, -6), Vector2(3, 0), Vector2(5, 6)]), Color(Color("aaccff"), body_alpha), 0.7)
	draw_rect(Rect2(-4, -0.5, 10, 1), Color(Color("ddeeff"), body_alpha)) # 장전 화살 (_atkCd 0 유지)
	draw_colored_polygon(PackedVector2Array([Vector2(7, 0), Vector2(5, -1.5), Vector2(5, 1.5)]), Color(Color("ddeeff"), body_alpha))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	draw_set_transform(pos + Vector2(0, 14), 0.0, Vector2(1.0, 0.3))
	draw_circle(Vector2.ZERO, 5.0, Color(0, 0, 0, 0.08))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


func _draw_iris() -> void:
	var pet: Dictionary = pets["iris"]
	var bob: float = sin(pet["t"] * 0.07) * 5.0
	var pos := Vector2(pet["x"], pet["y"] + bob) - global_position
	var flk: float = 0.85 + sin(pet["t"] * 0.09) * 0.1 + sin(pet["t"] * 0.17) * 0.05
	# 번짐 글로우 (lighter — Canvas2D 실측 경로 가산)
	var glow_size: float = IRIS_GLOW_R * 0.6
	draw_texture_rect(_iris_glow_tex, Rect2(pos - Vector2(glow_size, glow_size), Vector2(glow_size * 2, glow_size * 2)),
		false, Color(1, 1, 1, flk * 0.7))
	# flame01~04 (55303~55310): sz=20+(sz‖20)*.8, y offset -.7sz
	if _flame_tex.size() >= 4:
		var frame: Texture2D = _flame_tex[int(floor(pet["t"] * 0.08)) % 4]
		var fsz: float = 20.0 + float(pet["sz"]) * 0.8
		draw_texture_rect(frame, Rect2(pos + Vector2(-fsz / 2, -fsz * 0.7), Vector2(fsz, fsz)), false,
			Color(1, 1, 1, flk))
	else:
		draw_circle(pos, 14.0, Color(0.267, 0.8, 1.0, 0.9 * flk))
		draw_circle(pos, 7.0, Color(0.933, 1.0, 1.0))


func get_native_pets_snapshot() -> Dictionary:
	var data_only: Array = []
	for id in DIALOGUE_CATALOG.ENTRIES:
		if DIALOGUE_CATALOG.ENTRIES[id]["connected"] != true:
			data_only.append(id)
	return {"configured": _configured, "demo_owner_events": _demo_events.duplicate(), "demo_owner_bound": _demo_live(), "demo_iris_key": _demo_iris_key,
		"pets": {"crow": [pets["crow"]["x"], pets["crow"]["y"]], "cat": [pets["cat"]["x"], pets["cat"]["y"]],
			"xbow": [pets["xbow"]["x"], pets["xbow"]["y"]], "iris": [pets["iris"]["x"], pets["iris"]["y"]]} if _configured else {},
		"iris_target_alive": pets.get("iris", {}).get("tgt") is Object and is_instance_valid(pets["iris"]["tgt"]) if _configured else false,
		"counters": {"atk": _pet_atk_cnt, "hit": _pet_hit_cnt, "kill": _pet_kill_cnt, "parry": _pet_parry_cnt},
		"bubble": {"who": _pet_bubble["who"], "txt": _pet_bubble["txt"], "t": _pet_bubble["t"],
			"pair": _pet_bubble["pair"] != null, "alpha": _subtitle_root.modulate.a if is_instance_valid(_subtitle_root) else -1.0},
		"say_log": _say_log.duplicate(true), "tut": _pet_tut.duplicate(),
		"dialogue_catalog": {"total": DIALOGUE_CATALOG.ENTRIES.size(), "data_only_ids": data_only},
		"dialogue_cooldowns": _pet_dlg_cd.duplicate(), "tier_cooldowns": _pet_tier_cd.duplicate(),
		"dialogue_halt": _dialogue_halt,
		"unported": ["펫 공격 없음(원본 41496~41541 — P2-001d '이리스 피해' 추정 오귀속 정정)",
			"대사171 ID 중 미연결102 ID는 dialogue_catalog.data_only_ids 참조; 설계전용 카테고리14/24~26/28~29 및 death_dual 별도 화면은 범위 밖",
			"펫 음성(_petSfx)·패드 키 치환(_padifyHint)·언어 전환(_refreshPetBubbleLanguage — ko 원문 고정)",
			"R 수거 연계·G.pets G-소유 이관(어댑터 보유 — G 40키 부트 계약 보존)",
			"crow _fly 애니(원본 미등록 dead)·cat t 및 대사 셔플은 월드와 분리한 로컬 RNG",
			"tut_charge 후속(firstCharge — 사슬기동 미이식)·parry 카운터(패링 콜백 미배선)",
			"이리스 LIT 색층(ci0 색 글로우 — P2-003a 색층 전체 미이식과 동일 경계)"]}

func _physics_process(_delta: float) -> void:
	var tree_root: Window=get_tree().root
	if not tree_root.has_meta("demo47i_stage"):
		_demo47i_physics_body(_delta);return
	var started: int=Time.get_ticks_usec()
	_demo47i_physics_body(_delta)
	var elapsed: int=Time.get_ticks_usec()-started
	var perf: Dictionary=tree_root.get_meta("demo47i_perf",{})
	var key: String=str(tree_root.get_meta("demo47i_stage"))+"|native_pets.gd::_physics_process"
	var row: Dictionary=perf.get(key,{"max_us":0,"calls":0,"total_us":0})
	row.max_us=maxi(row.max_us,elapsed);row.calls+=1;row.total_us+=elapsed
	perf[key]=row;tree_root.set_meta("demo47i_perf",perf)
