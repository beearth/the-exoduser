class_name ExoduserNativeParryLessonFlow
extends Node
## P2-001j/k — 커튼 직후 패링 레슨 owner (원본 parry-lesson.js + game.html).
## 트리거: update() 32111 `if(_parryLesson && _parryLesson.tick())return;` — services의
## parry_lesson 관측이 같은 위치에서 프레임당 1회 tick 호출. intro는 true(게임 틱 차단),
## practice/전환은 false(원본 514 등 — stageTime 진행).
## P2-001k: ①패널 디자인 마감 — docs/3.1 UI_FOUNDATION parryLesson 계약 + 웹
## getComputedStyle 실측(_out/p2-001k/web/lesson_styles.json)대로. 원본 텍스트 그대로,
## 이모지 없음. ②연습 본문 중 포트 보유 시스템 범위: 기본 3스텝(-3 이동 / -2 기검참
## 처치+3단 차징 / -1 마법 처치) + hurtE 42111 레슨 위임(hurtEnemy 646~683의 left/right
## 분기). 진행 순서 501: -3→-2→-1→8(가시덫)→0..7 — step 8부터는 해당 시스템(가시덫=
## 시작 스킬 트랙 진행 중, 패링 투사체 0~7) 미이식이라 **정지 상태**(패널은 원본 내용
## 표시·스킵만, 가짜 진행 없음). Q/E 전투 판정·2_3 규칙 불변 — 레슨 전용 데미지 적용
## (hurtEnemy의 e.hp=0 직접 처리)은 원본도 hurtE 본문 밖(42111 위임)이다.

const PANEL_LAYER := 30
const TRANSITION_TICKS := 90.0        # 489 transitionTicks=90
const MOVE_GOAL := 120.0              # 514 moveDistance>=120
const LEFT_GOAL := 10                 # 671 leftKills 10
const RIGHT_GOAL := 5                 # 672~676 rightKills 5
const LESSON_LABELS: Array[String] = ["Q · 마법탄 패링", "E · 물리탄 패링", "Q 홀딩 · 다수 마법탄 패링",
	"E 홀딩 · 다수 물리탄 패링", "Shift · 사슬 이동", "방향키 + Space · 전격이동",
	"패링 · 분노 축적", "Space · 분노 발동"] # get labels() (파일 5행)
const BASIC_LABELS: Array[String] = ["WASD / 방향키 · 이동", "좌클릭 · 10마리 처치 + 3단 차징",
	"우클릭 · 적 5마리 처치", "1 · 가시덫 설치 후 도망 · 10마리 처치"] # 77 basicLabelText
# ── 웹 실측 팔레트/치수 (lesson_styles.json + UI_FOUNDATION parryLesson 절) ──
const COL_BODY := Color(0xee / 255.0, 0xe4 / 255.0, 0xd4 / 255.0)
const COL_EYEBROW := Color(0xc7 / 255.0, 0xb4 / 255.0, 0xa2 / 255.0)
const COL_STATUS := Color(0xe0 / 255.0, 0xc1 / 255.0, 0x8b / 255.0)
const COL_KEYCAP := Color(0xff / 255.0, 0xf0 / 255.0, 0xdf / 255.0)
const COL_TITLE := Color(0xf4 / 255.0, 0xe6 / 255.0, 0xd2 / 255.0)
const COL_SUBTITLE := Color(0xc2 / 255.0, 0xb6 / 255.0, 0xa9 / 255.0)
const COL_HINT := Color(0xe8 / 255.0, 0xd9 / 255.0, 0xc6 / 255.0)
const COL_ROW := Color(0xbf / 255.0, 0xb4 / 255.0, 0xa8 / 255.0)
const COL_ROW_CURRENT := Color(0xff / 255.0, 0xf0 / 255.0, 0xdf / 255.0)
const COL_ROW_DONE := Color(0xb2 / 255.0, 0xd6 / 255.0, 0xac / 255.0)
const COL_SKIP_TEXT := Color(0xdc / 255.0, 0xcb / 255.0, 0xb6 / 255.0)
const COL_KIND_MAGIC := Color(197.0 / 255.0, 164.0 / 255.0, 242.0 / 255.0) # 실측 step-2 status/hold (data-kind magic)
const COL_KIND_PHYSICAL := Color(0xe0 / 255.0, 0xc1 / 255.0, 0x8b / 255.0) # 실측 intro status (data-kind physical)
const FONT_PATH := "res://assets/fonts/ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf" # P2-007a 원본 --font-hell 1순위 'Nanum Myeongjo'(parry-lesson.css 12)
const FRAME_PATH := "res://assets/ui/hell_gothic/frame.png" # 원본 img/ui/hell_gothic/frame.png 그대로
const CREST_PATH := "res://assets/ui/hell_gothic/crest.png"

var world: Node2D
var player: Node2D
var state: Node
var sequence: Node2D
var active := false
var seen := false
var phase := "idle"              # idle → intro → practice → success → (done)
var step := -3                   # 393 step=-3
var chapter := 1                 # regen adapter guard가 읽는 챕터
var pending := ""                # 427 pending='success'
var transition_ticks := 0.0
var move_distance := 0.0
var left_kills := 0
var right_kills := 0
var left_full_charge_kill := false
var movement_done := false
var left_click_done := false
var right_click_done := false
var practice_halted := ""        # step 8 도달 시 "spike_trap_unported"
var attack_enemies: Array = []
var _move_last := Vector2.ZERO
var _saved_enemies: Array = []
var _saved_bonfire: Dictionary = {}
var _saved_lmb: Dictionary = {}
var _saved_player: Dictionary = {}
var _panel: CanvasLayer
var _font: FontFile
var _ui: Dictionary = {}
var _metrics := {"tick_calls": 0, "starts": 0, "skips": 0, "practice_clicks_unported": 0,
	"enemies_saved": 0, "enemies_restored": 0, "lesson_enemy_spawns": 0, "lesson_kills": 0,
	"delegated_hits": 0, "rng_calls": 0}
var spawn_journal: Array = []
var _next_order := 1000
var _configured := false

func configure(owner_world: Node2D, owner_player: Node2D, state_node: Node, owner_sequence: Node2D) -> bool:
	if _configured or not is_instance_valid(owner_world) or not is_instance_valid(owner_player):
		return false
	world = owner_world
	player = owner_player
	state = state_node
	sequence = owner_sequence
	process_mode = Node.PROCESS_MODE_PAUSABLE
	_font = load(FONT_PATH) if ResourceLoader.exists(FONT_PATH) else null
	_configured = true
	return true

static func _truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if value is int or value is float: return float(value) != 0.0 and not is_nan(float(value))
	if value is String: return not (value as String).is_empty()
	return true

func _unit(purpose: String, draws: Array) -> float:
	_metrics.rng_calls += 1
	var value := float(world.sample_native_random_unit())
	draws.append({"purpose": purpose, "value": value})
	return value

# ═══ 32111 tick — 원본 반환 계약: intro true / practice·전환 false ═══
func native_lesson_tick() -> bool:
	if not _configured:
		return false
	_metrics.tick_calls += 1
	if not active:
		if seen:
			return false
		var g: Variant = state.read_current_g() if is_instance_valid(state) else null
		if not g is Dictionary:
			return false
		if _truthy(g.get("_intro")) or _truthy(g.get("paused")):
			return false
		if not is_instance_valid(player) or float(player.get("hp")) <= 0.0:
			return false
		_start()
	# 489 pending → phase 전환(transition 90틱)
	if pending != "":
		phase = pending
		pending = ""
		transition_ticks = TRANSITION_TICKS
		_render()
	if phase == "intro":
		return true # 484
	if phase == "success" or phase == "done":
		transition_ticks -= 1.0 # _dtSp=1/렌더프레임 (61849)
		if transition_ticks > 0.0:
			return false
		if phase == "done":
			# 챕터2 자원 연습(496) 미이식 — 바로 finish(497).
			_finish()
			return false
		# 501: step 전진 -3→-2→-1→8→0..7
		step = 8 if step == -1 else (0 if step == 8 else step + 1)
		phase = "practice"
		if step == -2 or step == -1:
			_spawn_attack_enemies()
		if step == 8:
			practice_halted = "spike_trap_unported" # 가시덫(시작 스킬 트랙)·0~7 패링 미이식
		if step >= 0 and step <= 7:
			practice_halted = "parry_steps_unported"
		_render()
	if phase != "practice":
		return false
	# 508~509 연습 중 유지: HP/MP/ST 리필·iframes 0·kb 0 (레슨 저장분 기준)
	_practice_refill()
	if practice_halted != "":
		return false # 미이식 스텝: 진행 없음(스킵만) — 가짜 성공 금지
	if step == -3: # 512~515
		var vel: Variant = player.get("velocity")
		if vel is Vector2 and (vel as Vector2).length() > 0.01: # directionHeld 상응(포트: 이동속도 증인)
			move_distance += player.global_position.distance_to(_move_last)
		_move_last = player.global_position
		if move_distance >= MOVE_GOAL:
			_complete_step()
		return false
	if step == -2 or step == -1: # 517~521
		if step == -2 and _alive_attack_enemies() < 3:
			_spawn_attack_enemies()
		_render()
		return false
	return false

func _practice_refill() -> void:
	# 508~509: P.hp=saved.hp; P.mp=P.mmp; P.st=P.mst; P.shield=saved; P.iframes=0; kb 0.
	var p: Variant = state.read_current_p() if is_instance_valid(state) else null
	if p is Dictionary:
		if _saved_player.has("hp"):
			p["hp"] = _saved_player["hp"]
		if p.has("mmp"): p["mp"] = p["mmp"]
		if p.has("mst"): p["st"] = p["mst"]
	if _saved_player.has("hp"):
		player.set("hp", float(_saved_player["hp"]))
	if p is Dictionary and p.has("mst"):
		player.set("stamina", float(p["mst"]))
	player.set("iframes", 0.0)

func _complete_step() -> void:
	# 427~434 completeStep (step<0/8 플래그, pending success/done)
	if step == 8:
		return # 가시덫 미이식 — 호출 경로 없음(가드)
	if step < 0:
		var key: String = ["movement", "left", "right"][step + 3]
		if key == "movement" and not movement_done: movement_done = true
		elif key == "left" and not left_click_done: left_click_done = true
		elif key == "right" and not right_click_done: right_click_done = true
		else: return
		pending = "success"
		return
	# step 0~7 checks(432) — 미이식 경로(도달 불가)

func begin_practice() -> void:
	# 177 beginPractice: intro에서만, phase='practice'
	if not active or phase != "intro":
		return
	phase = "practice"
	_move_last = player.global_position
	_render()

func skip_all() -> void:
	if not active:
		return
	_metrics.skips += 1
	_finish()

# ═══ 42111 위임 — hurtEnemy(646~683)의 left/right 분기 (rage/reflected/trap 미이식) ═══
func native_lesson_hurt_enemy(enemy: Node2D, dmg: int, ang: float, opts: Dictionary) -> Dictionary:
	_metrics.delegated_hits += 1
	if not active or not is_instance_valid(enemy) or dmg <= 0 or enemy.get("alive") != true:
		return {"handled": false, "reason": "gate_647"}
	if not attack_enemies.has(enemy):
		return {"handled": false, "reason": "not_lesson_enemy_647"}
	var attack: bool = chapter == 1 and phase == "practice" and pending == ""
	var left: bool = attack and step == -2 and str(opts.get("_lessonAttack", "")) in ["kiSlash", "weapon"] # 651 (wSwing 가드는 weapon 라벨에 포함)
	var right: bool = attack and step == -1 and opts.get("magic") == true and opts.get("fireball") == true \
		and opts.get("_fromTurret") != true and opts.get("dot") != true # 652
	if not left and not right:
		return {"handled": false, "reason": "no_credit_branch_656"} # rage/reflected/trap 미이식
	# 664~668: e.hp=0; alive=false; deathFX+시체+flesh 고어+데드임팩트
	var radius: float = float(enemy.get("radius"))
	var mhp: float = float(enemy.get("mhp"))
	enemy.apply_native_normal_enemy_death_write()
	var fx: Variant = world.get("_native_death_fx")
	if is_instance_valid(fx) and fx.has_method("spawn_native_lesson_kill_fx"):
		fx.spawn_native_lesson_kill_fx(enemy, ang, dmg, radius, mhp)
	attack_enemies.erase(enemy)
	_metrics.lesson_kills += 1
	if left: # 671
		left_kills = mini(LEFT_GOAL, left_kills + 1)
		if str(opts.get("_lessonAttack", "")) == "kiSlash" and opts.get("_lessonFullCharge") == true:
			left_full_charge_kill = true
		if left_kills >= LEFT_GOAL and left_full_charge_kill:
			_complete_step()
		else:
			_spawn_attack_enemies()
	else: # 672
		right_kills += 1
		if right_kills >= RIGHT_GOAL:
			_complete_step()
		else:
			_spawn_attack_enemies()
	_render()
	return {"handled": true, "left": left, "right": right,
		"left_kills": left_kills, "right_kills": right_kills}

func _alive_attack_enemies() -> int:
	var count := 0
	for enemy in attack_enemies:
		if is_instance_valid(enemy) and enemy.get("alive") == true:
			count += 1
	return count

# 231~247 spawnAttackEnemies: 반경 -2=120 / -1=220, 동시 3, 각 a=-π/2+(j%3-1)*.65+⌊j/3⌋*π/4,
# d>450 또는 서로 40 미만 거부. mkEn(etype0, EL.P) 후 hp=1·mhp=1·atk=0·elite=0·mods=[]·spd=0.
func _spawn_attack_enemies() -> void:
	var left: bool = step == -2
	for old in attack_enemies.duplicate():
		if not is_instance_valid(old) or old.get("alive") != true:
			attack_enemies.erase(old)
	var needed: bool = (left_kills < LEFT_GOAL or not left_full_charge_kill) if left else right_kills < RIGHT_GOAL
	if not needed:
		return
	var radius: float = 120.0 if left else 220.0
	var kills: int = left_kills if left else right_kills
	var i := 0
	while i < 48 and attack_enemies.size() < 3:
		var j: int = i + kills
		var a: float = -PI * 0.5 + float(j % 3 - 1) * 0.65 + floorf(j / 3.0) * PI * 0.25
		var x: float = player.global_position.x + cos(a) * radius
		var y: float = player.global_position.y + sin(a) * radius
		i += 1
		var enemy: Node2D = _spawn_lesson_enemy(x, y)
		if enemy == null:
			continue
		if enemy.global_position.distance_to(player.global_position) > 450.0 or _too_close(enemy):
			enemy.apply_native_normal_enemy_death_write() # 거부: mkEn은 성공했으므로 제거만
			continue
		attack_enemies.append(enemy)
		_metrics.lesson_enemy_spawns += 1

func _too_close(candidate: Node2D) -> bool:
	for other in attack_enemies:
		if is_instance_valid(other) and other != candidate \
				and other.global_position.distance_to(candidate.global_position) < 40.0:
			return true
	return false

## mkEn(31120~) etype0 미러(커튼 5링과 동일 draw 순서) + 240 레슨 오버라이드
## (hp=1·mhp=1·atk=0·elite=0·mods=[]·spd=0 — 롤은 원본대로 소비 후 덮어씀).
func _spawn_lesson_enemy(x: float, y: float) -> Node2D:
	var template: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/etype0_physical_flesh_crawler.json"))
	if not template is Dictionary:
		return null
	var draws: Array = []
	var pos := Vector2(x, y)
	if not world.can_move(pos, 10.0):
		var safe: Variant = world.native_safe_point(x, y, 10.0)
		if not safe is Dictionary:
			return null
		pos = Vector2(float(safe["x"]), float(safe["y"]))
	var _elite_roll := _unit("rollElite", draws)
	if _elite_roll < 0.03:
		_unit("rollMods_attack", draws) # 매직 롤 소비(결과는 240 e.elite=0 덮어씀)
	var _spd := (0.39 + _unit("spd", draws) * 0.08) * 1.5
	var r := (10.0 + _unit("r", draws) * 2.0) * 2.0
	var st2 := 30.0 + _unit("st2", draws) * 50.0
	var facing := _unit("facing", draws) * TAU
	var proj_t := 180.0 + _unit("projT", draws) * 120.0
	var boss_pat_t := 30.0 + _unit("bossPatT", draws) * 20.0
	var data: Dictionary = (template["runtime"] as Dictionary).duplicate(true)
	var enemy_id := "lesson_attack_%03d" % _next_order
	data["id"] = enemy_id
	data["name"] = "눈알 육괴"
	data["order"] = _next_order
	_next_order += 1
	data["spawn_position"] = [pos.x, pos.y]
	data["requested_spawn_position"] = [x, y]
	data["hp"] = 1
	data["attack"] = 0
	data["radius"] = r
	data["speed_pixels_per_tick"] = 0.0
	data["elite"] = 0
	data["mods"] = []
	data["poise"] = 1
	data["max_poise"] = 1
	data["initial_idle_ticks"] = st2
	data["initial_facing"] = facing
	data["facing"] = facing
	data["initial_projectile_ticks"] = proj_t
	var timers: Dictionary = data["initial_timers"]
	timers["st2"] = st2
	timers["projT"] = proj_t
	timers["bossPatT"] = boss_pat_t
	var native: Dictionary = data["native_final"]
	native["x"] = pos.x
	native["y"] = pos.y
	native["r"] = r
	native["speed"] = 0.0
	native["st2"] = st2
	native["facing"] = facing
	native["hp"] = 1
	native["mhp"] = 1
	native["atk"] = 0
	native["poise"] = 1
	native["maxPoise"] = 1
	native["projT"] = proj_t
	var enemy: CharacterBody2D = (load("res://scripts/enemy_melee_flesh_crawler.gd") as GDScript).new()
	enemy.configure(data, world)
	var registered: Variant = world.register_native_curtain_ring_enemy(enemy, int(data["order"]))
	if not registered is Dictionary or registered.get("valid") != true:
		if is_instance_valid(enemy) and enemy.get_parent() == null:
			enemy.free()
		return null
	spawn_journal.append({"id": enemy_id, "step": step, "draws": draws, "position": [pos.x, pos.y]})
	return enemy

# ═══ allows/allowKey (32·36~39) — 포트는 API 제공; 입력 강제 배선은 잔여(시작 스킬 트랙 충돌 회피) ═══
func allows(action: String) -> bool:
	if not active:
		return true
	var is_direction: bool = action in ["up", "down", "left", "right"]
	if phase != "intro" and is_direction:
		return true
	if phase == "practice":
		return action in _actions()
	return false

func _actions() -> Array:
	# 30 actions()
	if chapter == 1 and step == 8: return []
	if step < 0:
		return ["weapon"] if step == -2 else (["beam"] if step == -1 else [])
	if step == 4: return ["charge"]
	if step == 5: return ["up", "down", "left", "right", "bow"]
	if step == 7: return ["bow"]
	return ["parry", "shield"]

# ═══ start / finish ═══
func _start() -> void:
	active = true
	seen = true
	phase = "intro"
	step = -3
	pending = ""
	move_distance = 0.0
	left_kills = 0
	right_kills = 0
	left_full_charge_kill = false
	movement_done = false
	left_click_done = false
	right_click_done = false
	practice_halted = ""
	attack_enemies = []
	_metrics.starts += 1
	if world.has_method("detach_native_enemies_for_lesson"):
		_saved_enemies = world.detach_native_enemies_for_lesson()
		_metrics.enemies_saved = _saved_enemies.size()
	if is_instance_valid(sequence) and sequence.get("bonfire") is Dictionary:
		_saved_bonfire = (sequence.get("bonfire") as Dictionary).duplicate(true)
		sequence.get("bonfire")["active"] = false # 401 G._bonfire=null 상응
	var p: Variant = state.read_current_p() if is_instance_valid(state) else null
	if p is Dictionary:
		_saved_lmb = {"had": p.has("activeLMBSk"), "value": p.get("activeLMBSk")}
		p["activeLMBSk"] = "kiSlash" # 396
		_saved_player = {"hp": p.get("hp"), "x": player.global_position.x, "y": player.global_position.y} # 397 saved
	_move_last = player.global_position
	_build_panel()
	_render()

func _finish() -> void:
	# 685~700 finish 슬라이스
	if world.has_method("restore_native_lesson_enemies"):
		# 레슨 전용 스폰 적은 복원 대상이 아님(원본 ens=saved.ens 교체가 자연 폐기) —
		# 생존 레슨 적은 사망 처리로 정리.
		for enemy in attack_enemies:
			if is_instance_valid(enemy) and enemy.get("alive") == true:
				enemy.apply_native_normal_enemy_death_write()
		attack_enemies = []
		var restored: Dictionary = world.restore_native_lesson_enemies(_saved_enemies)
		_metrics.enemies_restored = int(restored.get("restored", 0))
	_saved_enemies = []
	if is_instance_valid(sequence) and not _saved_bonfire.is_empty():
		var bonfire: Variant = sequence.get("bonfire")
		if bonfire is Dictionary:
			for key in _saved_bonfire:
				bonfire[key] = _saved_bonfire[key]
	_saved_bonfire = {}
	var p: Variant = state.read_current_p() if is_instance_valid(state) else null
	if p is Dictionary and not _saved_lmb.is_empty():
		if _saved_lmb.get("had") == true:
			p["activeLMBSk"] = _saved_lmb.get("value")
		else:
			p.erase("activeLMBSk")
		if _saved_player.has("hp") and _saved_player["hp"] != null:
			p["hp"] = _saved_player["hp"] # 695 P.hp=saved.hp
	if _saved_player.has("hp") and _saved_player["hp"] != null:
		player.set("hp", float(_saved_player["hp"]))
	if _saved_player.has("x"): # 696 P.x/P.y 복원
		player.global_position = Vector2(float(_saved_player["x"]), float(_saved_player["y"]))
	_saved_lmb = {}
	_saved_player = {}
	active = false
	phase = "idle"
	pending = ""
	if is_instance_valid(_panel):
		_panel.queue_free()
		_panel = null
	_ui = {}

# ═══ 패널 — UI_FOUNDATION parryLesson 계약 + lesson_styles.json 실측 ═══
var _font_bold: FontVariation

func _weighted_font(weight: int) -> Font:
	# P2-007a — var(--font-hell) 스택(Nanum Myeongjo 400/700/800 → Noto Serif KR wght) 공용 공급자.
	if _font == null:
		return null
	return preload("res://scripts/native_ui_fonts.gd").stack("hell", weight)

func _label(size: int, color: Color, text: String = "", weight: int = 400) -> Label:
	var node := Label.new()
	node.text = text
	var face: Font = _weighted_font(weight)
	if face != null:
		node.add_theme_font_override("font", face)
	node.add_theme_font_size_override("font_size", size)
	node.add_theme_color_override("font_color", color)
	# 실측 text-shadow: 0 1px 3px #000 + 0 0 6px #000 → Godot 섀도 1종 근사
	node.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.9))
	node.add_theme_constant_override("shadow_offset_y", 1)
	node.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	return node

func _build_panel() -> void:
	_panel = CanvasLayer.new()
	_panel.name = "NativeParryLessonPanel"
	_panel.layer = PANEL_LAYER
	# 뒤 배경 — #parryLessonBackdrop opacity .5 (UI_FOUNDATION)
	var backdrop := ColorRect.new()
	backdrop.color = Color(0, 0, 0, 0.5)
	backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	backdrop.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_panel.add_child(backdrop)
	# 패널 — 실측: x1464 y16 w400 (우측, 우여백 56), 패딩 68px 24px 20px
	var root := Control.new()
	root.name = "LessonRoot"
	root.anchor_left = 1.0
	root.anchor_right = 1.0
	root.anchor_top = 0.0
	root.anchor_bottom = 1.0
	root.offset_left = -456.0
	root.offset_right = -56.0
	root.offset_top = 16.0
	root.offset_bottom = -16.0
	_panel.add_child(root)
	# ::before — rgba(16,13,14,.96) + 상단 radial 글로우 rgba(71,23,18,.53)→48%
	var bg := ColorRect.new()
	bg.color = Color(16.0 / 255.0, 13.0 / 255.0, 14.0 / 255.0, 0.96)
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(bg)
	var glow := TextureRect.new()
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([Color(71.0 / 255.0, 23.0 / 255.0, 18.0 / 255.0, 0.533), Color(0, 0, 0, 0)])
	var glow_texture := GradientTexture2D.new()
	glow_texture.gradient = gradient
	glow_texture.fill = GradientTexture2D.FILL_RADIAL
	glow_texture.fill_from = Vector2(0.5, 0.0)
	glow_texture.fill_to = Vector2(0.5, 0.96) # 48% 반경 상응
	glow.texture = glow_texture
	glow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	glow.stretch_mode = TextureRect.STRETCH_SCALE
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(glow)
	# 장식 프레임 — frame.png border-image slice22%/18px (실측 ::before border 18px).
	# NinePatch 코너는 화면픽셀이라 22%(276px)를 18px로 쓰려고 런타임 축소(에셋 원본 불변).
	if ResourceLoader.exists(FRAME_PATH):
		var frame_image: Image = (load(FRAME_PATH) as Texture2D).get_image()
		frame_image.resize(82, 82, Image.INTERPOLATE_LANCZOS)
		var nine := NinePatchRect.new()
		nine.texture = ImageTexture.create_from_image(frame_image)
		nine.patch_margin_left = 18
		nine.patch_margin_right = 18
		nine.patch_margin_top = 18
		nine.patch_margin_bottom = 18
		nine.draw_center = false
		nine.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		nine.mouse_filter = Control.MOUSE_FILTER_IGNORE
		root.add_child(nine)
	# 문장(crest) — 174×58 · top 6 중앙
	if ResourceLoader.exists(CREST_PATH):
		var crest := TextureRect.new()
		crest.texture = load(CREST_PATH)
		crest.expand_mode = TextureRect.EXPAND_IGNORE_SIZE # 원본 174x58 고정(텍스처 2172x724)
		crest.stretch_mode = TextureRect.STRETCH_SCALE
		crest.anchor_left = 0.5
		crest.anchor_right = 0.5
		crest.offset_left = -87.0
		crest.offset_right = 87.0
		crest.offset_top = 6.0
		crest.offset_bottom = 64.0
		crest.mouse_filter = Control.MOUSE_FILTER_IGNORE
		root.add_child(crest)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_top", 68)
	margin.add_theme_constant_override("margin_left", 24)
	margin.add_theme_constant_override("margin_right", 24)
	margin.add_theme_constant_override("margin_bottom", 20)
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(margin)
	var outer := VBoxContainer.new()
	outer.add_theme_constant_override("separation", 8)
	margin.add_child(outer)
	# 본문 스크롤 + 하단 버튼 고정 (UI_FOUNDATION: "기존 최대 높이·본문 스크롤·하단 버튼 고정")
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	outer.add_child(scroll)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 6)
	column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(column)
	var header := HBoxContainer.new()
	_ui["eyebrow"] = _label(10, COL_EYEBROW, "01 · 직접 실습")
	_ui["eyebrow"].autowrap_mode = TextServer.AUTOWRAP_OFF
	_ui["eyebrow"].size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_ui["status"] = _label(10, COL_STATUS, "일시정지")
	_ui["status"].autowrap_mode = TextServer.AUTOWRAP_OFF
	_ui["status"].size_flags_horizontal = Control.SIZE_SHRINK_END
	header.add_child(_ui["eyebrow"])
	header.add_child(_ui["status"])
	column.add_child(header)
	# 키캡 — 실측 28px, 선 #e0c18b, 그라디언트(51,44,44)→(16,14,16) 중간값, radius 4 — 한 줄 고정
	var keycap := PanelContainer.new()
	var keycap_style := StyleBoxFlat.new()
	keycap_style.bg_color = Color(33.0 / 255.0, 29.0 / 255.0, 30.0 / 255.0)
	keycap_style.border_color = COL_STATUS
	keycap_style.set_border_width_all(1)
	keycap_style.corner_radius_top_left = 4
	keycap_style.corner_radius_top_right = 4
	keycap_style.corner_radius_bottom_left = 4
	keycap_style.corner_radius_bottom_right = 4
	keycap_style.content_margin_left = 8.0
	keycap_style.content_margin_right = 8.0
	keycap_style.content_margin_top = 14.0
	keycap_style.content_margin_bottom = 14.0
	keycap.add_theme_stylebox_override("panel", keycap_style)
	_ui["keycap_style"] = keycap_style
	keycap.size_flags_horizontal = Control.SIZE_SHRINK_END # 실측: 키캡 우측 정렬(right=콘텐츠 우변 1826)
	_ui["keycap"] = _label(28, COL_KEYCAP, "W A S D", 400) # 실측 400
	_ui["keycap"].add_theme_font_override("font", preload("res://scripts/native_ui_fonts.gd").stack("cinzel_serif", 400)) # P2-007a .lesson-key 'Cinzel',serif(로드분 700 face)
	_ui["keycap"].autowrap_mode = TextServer.AUTOWRAP_OFF
	keycap.add_child(_ui["keycap"])
	column.add_child(keycap)
	_ui["title"] = _label(29, COL_TITLE, "", 700) # 실측 font-weight 700
	column.add_child(_ui["title"])
	_ui["subtitle"] = _label(12, COL_SUBTITLE)
	column.add_child(_ui["subtitle"])
	# 110~111/170~174: checklist는 전 행 순서 유지, details(hint+hold)가 현재 행 뒤로 이동
	var checklist := VBoxContainer.new()
	checklist.add_theme_constant_override("separation", 2)
	_ui["checklist"] = checklist
	var details := VBoxContainer.new()
	details.add_theme_constant_override("separation", 6)
	_ui["details"] = details
	_ui["hint"] = _label(14, COL_HINT)
	details.add_child(_ui["hint"])
	_ui["hold"] = _label(12, COL_KIND_PHYSICAL)
	_ui["hold"].visible = false
	details.add_child(_ui["hold"])
	var hold_meter_bg := ColorRect.new() # 69행 CSS: h8·margin-top7·accent=kind색. 트랙은
	# <progress> 기본 렌더(짙은 회갈) — 의사요소 실측 불가로 패널 진행바 바닥색(#39312a) 채택(근사 기록)
	hold_meter_bg.color = Color(0x39 / 255.0, 0x31 / 255.0, 0x2a / 255.0)
	hold_meter_bg.custom_minimum_size = Vector2(0, 8)
	hold_meter_bg.visible = false
	var hold_meter_fill := ColorRect.new()
	hold_meter_fill.color = COL_KIND_PHYSICAL
	hold_meter_fill.custom_minimum_size = Vector2(0, 8)
	hold_meter_fill.anchor_right = 0.0
	hold_meter_bg.add_child(hold_meter_fill)
	details.add_child(hold_meter_bg)
	_ui["hold_meter_bg"] = hold_meter_bg
	_ui["hold_meter_fill"] = hold_meter_fill
	_ui["rows"] = []
	for text in BASIC_LABELS + Array(LESSON_LABELS):
		var row := PanelContainer.new()
		var line := HBoxContainer.new()
		line.add_theme_constant_override("separation", 8)
		var box := Panel.new()
		box.custom_minimum_size = Vector2(12, 12)
		box.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var box_style := StyleBoxFlat.new()
		box_style.bg_color = Color(0, 0, 0, 0.35)
		box_style.border_color = COL_ROW
		box_style.set_border_width_all(1)
		box.add_theme_stylebox_override("panel", box_style)
		var row_label := _label(14, COL_ROW, str(text))
		row_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		line.add_child(box)
		line.add_child(row_label)
		row.add_child(line)
		checklist.add_child(row)
		(_ui["rows"] as Array).append({"panel": row, "label": row_label, "box": box, "box_style": box_style})
	checklist.add_child(details)
	column.add_child(checklist)
	_ui["safety"] = _label(11, COL_SUBTITLE, "패링 실패 시 폭발 피해를 받습니다. 재시도하면 체력이 회복됩니다.")
	column.add_child(_ui["safety"])
	# 하단 고정: 시작/건너뛰기/진행바 (행동 버튼 계약)
	var practice_button := Button.new()
	practice_button.text = "W / A / S / D 또는 클릭하여 시작"
	practice_button.custom_minimum_size = Vector2(0, 44)
	if _weighted_font(700) != null:
		practice_button.add_theme_font_override("font", _weighted_font(700)) # 실측 700
	practice_button.add_theme_font_size_override("font_size", 15)
	practice_button.add_theme_color_override("font_color", COL_KEYCAP)
	var start_style := StyleBoxFlat.new()
	start_style.bg_color = Color(62.0 / 255.0, 15.0 / 255.0, 13.0 / 255.0)
	start_style.border_color = Color(0xb6 / 255.0, 0x61 / 255.0, 0x4b / 255.0)
	start_style.set_border_width_all(1)
	start_style.corner_radius_top_left = 2
	start_style.corner_radius_top_right = 2
	start_style.corner_radius_bottom_left = 2
	start_style.corner_radius_bottom_right = 2
	start_style.set_content_margin_all(12.0)
	practice_button.add_theme_stylebox_override("normal", start_style)
	practice_button.add_theme_stylebox_override("hover", start_style)
	practice_button.add_theme_stylebox_override("pressed", start_style)
	practice_button.pressed.connect(begin_practice)
	_ui["button"] = practice_button
	outer.add_child(practice_button)
	var skip_button := Button.new()
	skip_button.text = "연습 건너뛰기"
	skip_button.custom_minimum_size = Vector2(0, 36)
	if _font != null:
		skip_button.add_theme_font_override("font", _weighted_font(400)) # P2-007a --font-hell 스택
	skip_button.add_theme_font_size_override("font_size", 12)
	skip_button.add_theme_color_override("font_color", COL_SKIP_TEXT)
	var skip_style := StyleBoxFlat.new()
	skip_style.bg_color = Color(0x1d / 255.0, 0x14 / 255.0, 0x13 / 255.0)
	skip_style.border_color = Color(0x66 / 255.0, 0x50 / 255.0, 0x44 / 255.0)
	skip_style.set_border_width_all(1)
	skip_style.set_content_margin_all(8.0)
	skip_button.add_theme_stylebox_override("normal", skip_style)
	skip_button.add_theme_stylebox_override("hover", skip_style)
	skip_button.add_theme_stylebox_override("pressed", skip_style)
	skip_button.pressed.connect(skip_all)
	outer.add_child(skip_button)
	var progress_wrap := MarginContainer.new()
	progress_wrap.add_theme_constant_override("margin_top", 12)
	var progress_bg := ColorRect.new()
	progress_bg.color = Color(0x42 / 255.0, 0x32 / 255.0, 0x2d / 255.0)
	progress_bg.custom_minimum_size = Vector2(0, 2)
	var progress_fill := ColorRect.new()
	progress_fill.color = COL_STATUS
	progress_fill.custom_minimum_size = Vector2(0, 2)
	progress_fill.anchor_right = 0.0
	progress_bg.add_child(progress_fill)
	progress_wrap.add_child(progress_bg)
	_ui["progress_fill"] = progress_fill
	outer.add_child(progress_wrap)
	add_child(_panel)

func _render() -> void:
	# 125~175 render()의 구현 범위(step<0·8) 포트.
	if _ui.is_empty() or not is_instance_valid(_panel):
		return
	var status_text := "일시정지"
	if phase == "practice": status_text = "연습 중"
	elif phase == "success": status_text = "성공"
	elif phase == "done": status_text = "COMPLETE"
	_ui["status"].text = status_text
	# 127 data-kind = (step%2===0 ? magic : physical) — 상태/홀드/미터가 kind 색을 따른다(실측)
	var kind_color: Color = COL_KIND_MAGIC if step % 2 == 0 else COL_KIND_PHYSICAL
	_ui["status"].add_theme_color_override("font_color", kind_color)
	_ui["hold"].add_theme_color_override("font_color", kind_color)
	(_ui["hold_meter_fill"] as ColorRect).color = kind_color
	# 실측: 연습 중 키캡 테두리=kind 색(#c5a4f2 등)·글자 26px (intro 28px·#e0c18b)
	(_ui["keycap_style"] as StyleBoxFlat).border_color = kind_color if phase == "practice" else COL_STATUS
	(_ui["keycap"] as Label).add_theme_font_size_override("font_size", 26 if phase == "practice" else 28)
	var basic_checks := [movement_done, left_click_done, right_click_done, false]
	var current_row: int = (step + 3) if step < 0 else (3 if step == 8 else 4 + step)
	var rows: Array = _ui["rows"]
	for i in range(rows.size()):
		var entry: Dictionary = rows[i]
		var done: bool = basic_checks[i] if i < 4 else false
		var is_current: bool = i == current_row
		(entry["label"] as Label).add_theme_color_override("font_color",
			COL_ROW_DONE if done else (COL_ROW_CURRENT if is_current else COL_ROW))
		var box_style: StyleBoxFlat = entry["box_style"]
		box_style.bg_color = Color(0xb2 / 255.0, 0xd6 / 255.0, 0xac / 255.0, 0.85) if done else Color(0, 0, 0, 0.35)
		box_style.border_color = COL_ROW_DONE if done else COL_ROW
		var style := StyleBoxFlat.new()
		style.content_margin_left = 8.0
		style.content_margin_right = 8.0
		style.content_margin_top = 7.0
		style.content_margin_bottom = 7.0
		if is_current: # UI_FOUNDATION 현재 목표: #551819aa, 선 #a34d3f, 왼쪽 강조 2px(#ec7958 — 색 1종 근사)
			style.bg_color = Color(0x55 / 255.0, 0x18 / 255.0, 0x19 / 255.0, 0.55)
			style.border_color = Color(0xa3 / 255.0, 0x4d / 255.0, 0x3f / 255.0)
			style.set_border_width_all(1)
			style.border_width_left = 2
		else:
			style.bg_color = Color(0, 0, 0, 0)
		(entry["panel"] as PanelContainer).add_theme_stylebox_override("panel", style)
	var details_node: Node = _ui["details"]
	if details_node.get_parent() == _ui["checklist"]:
		(_ui["checklist"] as VBoxContainer).move_child(details_node,
			mini(current_row + 1, (_ui["checklist"] as VBoxContainer).get_child_count() - 1))
	var total := float(BASIC_LABELS.size() + LESSON_LABELS.size())
	var done_count := 0
	for flag in basic_checks:
		if flag: done_count += 1
	(_ui["progress_fill"] as ColorRect).anchor_right = done_count / total
	_ui["button"].visible = phase == "intro" # 146
	_ui["hold"].visible = false
	(_ui["hold_meter_bg"] as ColorRect).visible = false
	var ordinal: int = 4 if step == 8 else (step + 4 if step < 0 else step + 5)
	var subtitle_name: String = "1 · 가시덫" if step == 8 else (BASIC_LABELS[step + 3] if step < 0 else LESSON_LABELS[step])
	_ui["subtitle"].text = "%d / 12 · %s" % [ordinal, subtitle_name]
	if step == -3: # 157~161 step<0 i=0
		_ui["keycap"].text = "W A S D"
		_ui["title"].text = "먼저 움직여보세요"
		_ui["hint"].text = "W 위 · A 왼쪽 · S 아래 · D 오른쪽. WASD 또는 방향키로 조금 걸어보세요. 이후 모든 실습에서도 이동할 수 있습니다."
	elif step == -2: # 248~254 updateAttackPractice(left)
		_ui["keycap"].text = "좌클릭"
		_ui["title"].text = "기검참으로 적 10마리를 처치하세요"
		_ui["hint"].text = "1·2타 뒤 3타에서 좌클릭을 2초 누르고 떼어 검기로 적을 처치하세요.\n처치 %d/10 · 3단 차징 검기 처치 %d/1" % [mini(10, left_kills), 1 if left_full_charge_kill else 0]
		_ui["hold"].visible = true
		(_ui["hold_meter_bg"] as ColorRect).visible = true
		var charge: float = float(player.get("charge_frames")) if player.get("charge_frames") != null else 0.0
		(_ui["hold_meter_fill"] as ColorRect).anchor_right = clampf(charge / 120.0, 0.0, 1.0) # 253 holdMeter.value
		_ui["hold"].text = "3단 차징 검기 처치 완료" if left_full_charge_kill else ("3타 차징 %d/3단 · 2초까지 유지" % mini(3, int(charge / 40.0)) if charge > 0.0 else "1·2타 뒤 3타를 2초 누르세요")
	elif step == -1: # 255~258
		_ui["keycap"].text = "우클릭"
		_ui["title"].text = "마법으로 적 5마리를 처치하세요"
		_ui["hint"].text = "적을 마우스로 조준하고 우클릭으로 마법탄을 발사하세요.\n처치 %d/5 · 실제로 처치해야 완료됩니다." % right_kills
	elif step == 8: # 가시덫 — 연습 본문(시작 스킬 트랙) 미이식: 원본 체크리스트 문구 표시·스킵만
		_ui["keycap"].text = "1"
		_ui["title"].text = "1 · 가시덫 설치 후 도망 · 10마리 처치"
		_ui["hint"].text = "패링 실패 시 폭발 피해를 받습니다. 재시도하면 체력이 회복됩니다."

func _unhandled_input(event: InputEvent) -> void:
	# 37 allowKey: intro에서 W/A/S/D → beginPractice
	if not active or phase != "intro" or not event is InputEventKey or not event.pressed or event.is_echo():
		return
	if event.keycode in [KEY_W, KEY_A, KEY_S, KEY_D]:
		begin_practice()

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "active": active, "seen": seen, "phase": phase,
		"step": step, "pending": pending, "move_distance": move_distance,
		"left_kills": left_kills, "right_kills": right_kills,
		"left_full_charge_kill": left_full_charge_kill, "practice_halted": practice_halted,
		"attack_enemies": _alive_attack_enemies(),
		"metrics": _metrics.duplicate(true), "saved_enemies": _saved_enemies.size(),
		"unported": [
			"practice step 8(가시덫 — 시작 스킬 트랙 진행 중)·0~7 패링/사슬/대시/분노·챕터2 자원 연습 — 도달 시 정지·스킵만",
			"dismissed()(localStorage skipKey — 포트 설정 저장 owner 부재) — 세션 내 seen 플래그만",
			"allows()/allowKey() 입력 강제 배선(시작 스킬 트랙과 입력 경로 충돌 회피 — API만 제공)",
			"start/finish의 projs/pProjs/worldItems/spawnHoles/rifts/_fireZones/스킬·슬롯·BINDS2 저장·복원(포트 미보유 상태)",
			"clearShot/resetPose·focusTicks·레슨 성공/사망 연출 보조(rage 분기 등)",
			"폰트(P2-007a): Nanum Myeongjo·Cinzel 원본 스택 적용 — Gowun Batang(3순위) 미보유"]}
