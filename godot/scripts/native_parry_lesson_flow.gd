class_name ExoduserNativeParryLessonFlow
extends Node
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
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
const STEP_TITLES: Array[String] = ["마법을 되돌려라", "물리탄을 쳐내라", "보호막을 펼쳐라",
	"힘을 모아 쳐내라", "사슬로 이동하라", "방향을 정해 이동하라", "패링으로 분노를 채워라",
	"분노를 폭발시켜라"] # 141 title
const STEP_KEYS: Array[String] = ["Q", "E", "Q", "E", "SHIFT", "↔ + SPACE", "Q", "SPACE"] # 118 key() 기본 바인딩
const STEP_TIPS: Array[String] = [
	"보라색 탄이 가까워지는 순간 [Q]를 누르세요. 너무 일찍 눌렀다면 떼고 다시 시도하세요.",
	"탄을 바라보고 [E]를 짧게 눌렀다 떼세요. 길게 누르면 차징이 됩니다.",
	"[Q]를 2초 동안 누르세요. 화염·물·암흑·번개·무지개탄을 보고 키를 떼어 한 번에 3발 이상 패링하세요. 홀딩 중 보호막은 피해를 일부 흡수하고 그로기를 막습니다. 피해를 완전히 막는 무적은 아닙니다.",
	"[E]를 누른 채 탄 쪽을 바라보세요. 이빨입탄·혈안탄·관통탄·물리 검기파·물리 환영검이 함께 날아옵니다. 3단계 충전 후 키를 떼어 5종 중 3발 이상 한 번에 쳐내세요. 풀차지 자동 발동도 인정합니다.",
	"이동할 곳에 마우스를 향하고 Shift를 눌렀다 떼세요. 사슬이 실제 발사되면 성공입니다.",
	"WASD 또는 방향키를 누른 채 Space를 누르세요. 전격이동을 5번 발동하면 성공입니다.",
	"Q를 2초 동안 누른 뒤, 함께 날아오는 마법탄 10발이 가까워지면 떼세요. 한 번에 여러 발을 패링해 분노 100%를 채워보세요.",
	"몬스터들이 주변을 둘러쌌습니다. 방향키에서 손을 떼고 Space만 눌러 분노 폭발로 한 번에 쓸어버리세요."] # 159 tips
## 단계별 정지 사유(해당 행동/탄 미이식 — 가짜 진행 금지). step 0·8은 이식(미등재).
const STEP_HALTS: Dictionary = {
	1: "physical_projectile_reflect_unported", # E 반사 캐리어는 암흑(gbBean) 한정(enemy_projectile.gd 134)
	2: "volley_mixed_magic_projectiles_unported", # 화염/물/번개/무지개(blackBean) 반사탄 미이식
	3: "volley_physical_projectiles_unported",    # 이빨입탄/혈안탄/관통탄/검기파/환영검 미이식
	4: "chain_movement_unported",                  # Shift 사슬 이동(charge/harp)
	5: "lightning_dash_unported",                  # 전격이동(blade dash)
	6: "rage_gauge_unported",                      # 분노 게이지
	7: "rage_burst_unported"}                      # 분노 발동
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
var checks: Array = [false, false, false, false, false, false, false, false] # 393 checks(8)
var parryEnemy: Node2D = null # camelCase 고정 — parry_homing_target 19173이 'parryEnemy' 필드명으로 읽음
var parry_shot: Node2D = null
var parry_charge := 0.0      # e._projChargeT (60틱)
var parry_cooldown := 45.0   # cooldown 45/60
var shot_reflected := false
# step 8 가시덫(261~311) — main 0779085bd 병합 후 실구현
var trap_enemies: Array = []
var trap_kills := 0
var trap_zone: Variant = null
var trap_escaped := false
var trap_snapshot: Dictionary = {}
var spike_trap_done := false # 428 spikeTrapDone (기본 체크 4번째 행)
var _ring: Node2D
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
	# step0: Q 반사 관측(구독만 — 판정은 main 1223 q_projectile_reflected 소유)
	if owner_player.has_signal("telemetry_event"):
		owner_player.telemetry_event.connect(_on_player_event)
	_ring = _RingDrawer.new()
	_ring.flow = self
	_ring.z_as_relative = false
	_ring.z_index = 4004
	add_child(_ring)
	_configured = true
	return true

# QA-004: detached lesson enemies are owned here until restore or teardown.
func _release_saved_enemies() -> void:
	var saved: Array = _saved_enemies
	_saved_enemies = [] # Clear first: EXIT_TREE/PREDELETE and duplicate entries are idempotent.
	for enemy in saved:
		if is_instance_valid(enemy) and enemy is Node and enemy.get_parent() == null:
			enemy.free() # Node owns and frees its CollisionShape2D/Sprite2D children.

func _exit_tree() -> void:
	_release_saved_enemies()

func _notification(what: int) -> void:
	_retranslate_lesson_ui(what)
	if what == NOTIFICATION_PREDELETE:
		_release_saved_enemies() # Also covers free() before the owner ever enters Tree.

## 차징 링(원본: 적 투사체 차징 경고 링 — 가이드 문구 "몬스터 주위의 링", 색=탄 종류).
class _RingDrawer extends Node2D:
	var flow: Node
	func _process(_delta: float) -> void:
		queue_redraw()
	func _draw() -> void:
		if flow == null or not is_instance_valid(flow.parryEnemy) or flow.parry_charge <= 0.0:
			return
		var enemy: Node2D = flow.parryEnemy
		if enemy.get("alive") != true:
			return
		var at: Vector2 = to_local(enemy.global_position)
		# 24110 _drawShootCharge: R=r+10, 바탕 원 #080808 α.28 w5, 진행 아크 col α(.8+prog*.2) w3.5
		var radius: float = float(enemy.get("radius")) + 10.0
		var progress: float = clampf(1.0 - flow.parry_charge / 60.0, 0.0, 1.0)
		draw_arc(at, radius, 0.0, TAU, 48, Color(0x08 / 255.0, 0x08 / 255.0, 0x08 / 255.0, 0.28), 5.0, true)
		if progress > 0.0:
			var color := Color(0xb2 / 255.0, 0x6d / 255.0, 0xff / 255.0, 0.8 + progress * 0.2) # '#b26dff'(228/20102)
			draw_arc(at, radius, -PI * 0.5, -PI * 0.5 + TAU * progress, 48, color, 3.5, true)

func _on_player_event(kind: String, _data: Dictionary) -> void:
	if kind == "q_projectile_reflected" and active and phase == "practice" and step == 0:
		shot_reflected = true # 425 onParry→parriedShot 상응(현재 샷이 유일한 적탄)
		_render() # 425 updateParryPractice

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
		# 501: step 전진 -3→-2→-1→8→0..7 (500 이탈 시 trap 복원)
		if step == 8:
			_restore_trap_practice()
		step = 8 if step == -1 else (0 if step == 8 else step + 1)
		phase = "practice"
		if step == -2 or step == -1:
			_spawn_attack_enemies()
		if step == 8: # 503 startTrapPractice
			practice_halted = _start_trap_practice()
		elif step >= 0 and step <= 7:
			practice_halted = str(STEP_HALTS.get(step, ""))
			if step == 0:
				parryEnemy = null
				parry_cooldown = 45.0
		_render()
	if phase != "practice":
		return false
	# 508~509 연습 중 유지: HP/MP/ST 리필·iframes 0·kb 0 (레슨 저장분 기준)
	_practice_refill()
	if practice_halted != "":
		return false # 미이식 스텝: 진행 없음(스킵만) — 가짜 성공 금지
	if step == 8: # 510 tickTrapPractice
		_tick_trap_practice()
		return false
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
	if step == 0: # 204~229 tickParryEnemy + 547 (step0 Q 마법탄 패링)
		_tick_parry_practice()
		return false
	return false

## step0 — 원본 tickParryEnemy(204~229): 적 유지→차징 60틱→암흑탄 발사→패링 관측.
## 처치 판정: Q 반사(관측) 후 반사 블루빈(parryBlueBean — 유일 가해자, 적 atk0)이
## 패링 적을 죽이면 완료(653 reflected 게이트 상응). 샷 소실 시 cooldown 60 재시도(211~213).
func _tick_parry_practice() -> void:
	if not is_instance_valid(parryEnemy) or parryEnemy.get("alive") != true:
		if shot_reflected and parryEnemy != null:
			# 반사 처치 완료(653/664~) — parryEnemy가 반사 블루빈으로 사망
			attack_enemies.erase(parryEnemy)
			parryEnemy = null
			parry_shot = null
			_complete_step()
			_render()
			return
		_clear_shot()
		_spawn_parry_enemy()
		if parryEnemy == null:
			parry_cooldown = 60.0
		return
	if is_instance_valid(parry_shot):
		return # 샷 비행 중(소실은 enemy_projectile_end 구독이 처리)
	if parry_charge > 0.0:
		parry_charge = maxf(0.0, parry_charge - 1.0) # _dtSp=1/렌더프레임
		if parry_charge > 0.0:
			return
		_fire_parry_shot() # 221~226
		return
	parry_cooldown -= 1.0
	if parry_cooldown <= 0.0:
		parry_charge = 60.0 # 228 e._projChargeT=60

## 182~196 spawnParryEnemy: 반경 280, 각 -π/2+i·π/4, d>450/<160 거부, hp1·atk0·spd0.
func _spawn_parry_enemy() -> void:
	shot_reflected = false
	for i in range(8):
		var a: float = -PI * 0.5 + float(i) * PI * 0.25
		var x: float = player.global_position.x + cos(a) * 280.0
		var y: float = player.global_position.y + sin(a) * 280.0
		var enemy: Node2D = _spawn_lesson_enemy(x, y)
		if enemy == null:
			continue
		var distance: float = enemy.global_position.distance_to(player.global_position)
		if distance > 450.0 or distance < 160.0:
			enemy.apply_native_normal_enemy_death_write()
			continue
		parryEnemy = enemy
		attack_enemies.append(enemy) # 레슨 적 레지스트리(정리/위임 가드 공용)
		parry_charge = 0.0
		parry_cooldown = 45.0
		return

func _fire_parry_shot() -> void:
	# 221~226: 암흑탄(EL.D·#b26dff·dmg0) 발사 — 포트 암흑 캐리어(enemy_projectile.gd,
	# gbBean parryClass magic — Q 반사 지원). 원본 vx/vy=3px/틱=180px/s, dmg 0.
	# (잔여: 원본 life 360틱 vs 캐리어 고정 120틱 — 280px 비행엔 충분)
	shot_reflected = false # 653 per-shot 크레딧(샷 단위 _lessonParryShot 상응)
	var shot: Node2D = (load("res://scripts/enemy_projectile.gd") as GDScript).new()
	var aim: Vector2 = (player.global_position - parryEnemy.global_position).normalized()
	shot.configure(parryEnemy.global_position, aim, 0, player, world, 180.0)
	var raw: Variant = shot.get("_raw")
	if raw is Dictionary:
		raw["_lessonShot"] = true # 226 spawnProj _lessonShot:true — 반사 블루 opts._lessonParryShot·지형차단 스킵(397) 계승
	shot.telemetry_event.connect(_on_shot_event)
	world.add_child(shot)
	parry_shot = shot

func _on_shot_event(kind: String, _data: Dictionary) -> void:
	if kind == "enemy_projectile_end":
		# 211~213: 샷 종료(미패링 소실 포함) → cooldown 60 재시도. 반사된 경우 블루빈이
		# 이어서 비행하므로 완료 판정은 적 사망 관측이 맡는다.
		parry_shot = null
		if not shot_reflected:
			parry_cooldown = 60.0

func _clear_shot() -> void:
	if is_instance_valid(parry_shot):
		parry_shot.queue_free()
	parry_shot = null

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
	if step == 8: # 428: spikeTrapDone 플래그 + success
		if not spike_trap_done:
			spike_trap_done = true
			pending = "success"
		return
	if step < 0:
		var key: String = ["movement", "left", "right"][step + 3]
		if key == "movement" and not movement_done: movement_done = true
		elif key == "left" and not left_click_done: left_click_done = true
		elif key == "right" and not right_click_done: right_click_done = true
		else: return
		pending = "success"
		return
	if pending != "" or (step >= 0 and step <= 7 and checks[step]):
		return
	if step >= 0 and step <= 7: # 431~432
		checks[step] = true
		pending = "success" if step < 7 else "done"

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
	var trap: bool = chapter == 1 and step == 8 and phase == "practice" and pending == "" \
		and trap_enemies.has(enemy) and opts.get("dot") == true \
		and str(opts.get("_lessonAttack", "")) == "spikeTrap" # 655
	if not left and not right and not trap:
		return {"handled": false, "reason": "no_credit_branch_656"} # rage/reflected 미이식
	if trap: # 657~663: eShield 흡수 후 잔여만 HP — 생존 시 return
		var trap_dmg: float = float(dmg)
		var shield_now: float = float(enemy.get("eShield"))
		if float(enemy.get("eShieldMax")) > 0.0 and shield_now > 0.0:
			var absorbed: float = minf(shield_now, trap_dmg)
			enemy.set("eShield", maxf(0.0, shield_now - absorbed))
			trap_dmg -= absorbed
		var hp_now: float = maxf(0.0, float(enemy.get("hp")) - trap_dmg)
		enemy.set("hp", hp_now)
		enemy.set("_hit_flash", 6.0) # e.flashT=6
		if hp_now > 0.0:
			_render()
			return {"handled": true, "trap": true, "hp": hp_now, "killed": false}
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
	elif right: # 672
		right_kills += 1
		if right_kills >= RIGHT_GOAL:
			_complete_step()
		else:
			_spawn_attack_enemies()
	elif trap: # 683: trapKills++ (완료 판정은 tick 296 — kills>=10 && escaped)
		trap_kills += 1
	_render()
	return {"handled": true, "left": left, "right": right, "trap": trap,
		"left_kills": left_kills, "right_kills": right_kills, "trap_kills": trap_kills}

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

# ═══ step 8 가시덫 연습 (261~311) — 포트 spikeTrap(native_skill_slots, 수정 금지·구독만) ═══

## 261~266 startTrapPractice: 스킬 강제 lv1·쿨 0·스냅샷. 성공 시 ""(정지 없음) 반환,
## 선행 조건 불가 시 정직 정지 사유 반환. SKILL_SLOTS[0] 교체는 포트가 키1→spikeTrap
## 고정 배선이라 해당 없음(기록).
func _start_trap_practice() -> String:
	var p: Variant = state.read_current_p() if is_instance_valid(state) else null
	var g: Variant = state.read_current_g() if is_instance_valid(state) else null
	var slots: Variant = _skill_slots_node()
	if not p is Dictionary or not g is Dictionary or not is_instance_valid(slots):
		return "trap_owners_not_ready"
	if _spike_trap_damage() <= 0:
		return "trap_dmg_providers_not_ready" # 275 hp 산식에 _spikeTrapDmg 필요
	var skills: Dictionary = (p as Dictionary).get("skills", {})
	trap_snapshot = {"mats": int((g as Dictionary).get("mats", 0)),
		"had_skill": skills.has("spikeTrap"), "skill_lv": int(skills.get("spikeTrap", 0)),
		"gc_cd": float(slots.get("gc_cd"))}
	skills["spikeTrap"] = maxi(1, int(skills.get("spikeTrap", 0))) # 263
	(p as Dictionary)["skills"] = skills
	slots.set("gc_cd", 0.0) # 263 P._gcCd=0 (런타임 상태 — 파일 수정 아님)
	trap_enemies = []
	trap_kills = 0
	trap_zone = null
	trap_escaped = false
	_spawn_trap_enemies()
	return ""

## 45507 _spikeTrapDmg 동식 — cast_spike_trap(수정 금지)과 같은 provider·상수로 산출.
func _spike_trap_damage() -> int:
	var main: Variant = player.get_parent() if is_instance_valid(player) else null # main(플레이어 부모)
	if not is_instance_valid(main) or main.get("source_providers") == null:
		return 0
	var bundle: Dictionary = main.get("source_providers").get_provider_bundle()
	var magic_ref: Dictionary = bundle.reference.magic_ref()
	var magic_mul: Dictionary = bundle.formula.p_magic_mul()
	if magic_ref.get("status") != "READY" or magic_mul.get("status") != "READY":
		return 0
	var slots_script: GDScript = load("res://scripts/native_skill_slots.gd")
	var lv: int = 1 # 263 강제 lv1 기준
	var sk_mul: float = float(slots_script.SPIKE_SK_B) + float(lv - 1) * float(slots_script.SPIKE_SK_G) * 0.5
	return int(float(magic_ref.value) * 1.0 * float(magic_mul.value) * sk_mul * 0.75)

func _skill_slots_node() -> Node:
	return world.get_node_or_null("NativeSkillSlots") if is_instance_valid(world) else null

## 267~280 spawnTrapEnemies: a=-π/2+(i%10-4.5)·.16+⌊i/10⌋·π/3, 반경 180+(i%3)·40,
## d>300 또는 서로 24 미만 거부, hp=max(1,dmg)·(5+n)·.5, eShield=hp, atk0·speed1.6·chase.
func _spawn_trap_enemies() -> void:
	var base_dmg: float = float(maxi(1, _spike_trap_damage()))
	for i in range(60):
		if trap_enemies.size() >= 10:
			break
		var a: float = -PI * 0.5 + (float(i % 10) - 4.5) * 0.16 + float(i / 10) * PI / 3.0
		var radius: float = 180.0 + float(i % 3) * 40.0
		var hp: float = base_dmg * (5.0 + float(trap_enemies.size())) * 0.5 # 275
		var enemy: Node2D = _spawn_lesson_enemy(player.global_position.x + cos(a) * radius,
			player.global_position.y + sin(a) * radius,
			{"hp": hp, "shield": hp, "speed": 1.6, "chase": true}) # 275~277
		if enemy == null:
			continue
		var distance: float = enemy.global_position.distance_to(player.global_position)
		var too_close := false
		for other in trap_enemies:
			if is_instance_valid(other) and other.get("alive") == true \
					and other.global_position.distance_to(enemy.global_position) < 24.0:
				too_close = true
				break
		if distance > 300.0 or too_close: # 273
			enemy.apply_native_normal_enemy_death_write()
			continue
		trap_enemies.append(enemy)
		attack_enemies.append(enemy) # 레슨 적 레지스트리(647 _lessonEnemy·정리 공용)

## 282~296 tickTrapPractice: 보충·악의 유지·존/탈출 관측·완료. 추격 이동은 포트
## 크롤러 자체 AI(alerted) 사용 — 웹 _ffMoveE 강제 수행은 미수행(기록).
func _tick_trap_practice() -> void:
	if practice_halted != "":
		return
	if trap_enemies.size() < 10:
		_spawn_trap_enemies()
	var g: Variant = state.read_current_g() if is_instance_valid(state) else null
	var slots: Variant = _skill_slots_node()
	if g is Dictionary:
		var cost: int = int((load("res://scripts/native_skill_slots.gd") as GDScript).SPIKE_MAL_COST)
		(g as Dictionary)["mats"] = maxi(int((g as Dictionary).get("mats", 0)), cost) # 284 _malCost(10)=5
	var zone: Variant = null
	if g is Dictionary:
		for candidate in (g as Dictionary).get("_fireZones", []):
			if candidate is Dictionary and candidate.get("type") == "spikeTrap" \
					and float(candidate.get("t", 0)) < float(candidate.get("maxT", 0)):
				zone = candidate
				break
	if zone != null and not is_same(zone, trap_zone): # 286 zone!==this.trapZone (참조 동일성)
		trap_zone = zone
		trap_escaped = false
	if trap_zone is Dictionary and _direction_held() \
			and player.global_position.distance_to(Vector2(float(trap_zone["x"]), float(trap_zone["y"]))) >= 120.0:
		trap_escaped = true # 287
	if zone == null and is_instance_valid(slots):
		slots.set("gc_cd", 0.0) # 288 if(!zone)P._gcCd=0
	_render() # 295 updateTrapPractice
	if trap_kills >= 10 and trap_escaped: # 296
		_complete_step()

## 34 directionHeld — 포트 held 상태(player._native_input_held)의 방향키.
func _direction_held() -> bool:
	var held: Variant = player.get("_native_input_held")
	if not held is Dictionary:
		return false
	for action in ["move_left", "move_right", "move_up", "move_down"]:
		if (held as Dictionary).get(action, false):
			return true
	return false

## 305~311 restoreTrapPractice: 스냅샷 복원·spikeTrap 존 제거·레지스트리 정리.
func _restore_trap_practice() -> void:
	if trap_snapshot.is_empty():
		return
	var p: Variant = state.read_current_p() if is_instance_valid(state) else null
	var g: Variant = state.read_current_g() if is_instance_valid(state) else null
	var slots: Variant = _skill_slots_node()
	if p is Dictionary:
		var skills: Dictionary = (p as Dictionary).get("skills", {})
		if trap_snapshot["had_skill"]:
			skills["spikeTrap"] = trap_snapshot["skill_lv"]
		else:
			skills.erase("spikeTrap")
		(p as Dictionary)["skills"] = skills
	if g is Dictionary:
		(g as Dictionary)["mats"] = trap_snapshot["mats"]
		var zones: Variant = (g as Dictionary).get("_fireZones")
		if zones is Array: # 309 G._fireZones=filter(type!=='spikeTrap')
			var kept: Array = []
			for zone in zones:
				if not (zone is Dictionary and zone.get("type") == "spikeTrap"):
					kept.append(zone)
			(zones as Array).assign(kept)
	if is_instance_valid(slots):
		slots.set("gc_cd", float(trap_snapshot["gc_cd"]))
	for enemy in trap_enemies: # 잔존 정리(웹은 완료 시 전멸이 전제 — 포트 안전망)
		if is_instance_valid(enemy) and enemy.get("alive") == true:
			enemy.apply_native_normal_enemy_death_write()
	trap_snapshot = {}
	trap_zone = null
	trap_enemies = []

## mkEn(31120~) etype0 미러(커튼 5링과 동일 draw 순서) + 240 레슨 오버라이드
## (hp=1·mhp=1·atk=0·elite=0·mods=[]·spd=0 — 롤은 원본대로 소비 후 덮어씀).
func _spawn_lesson_enemy(x: float, y: float, overrides: Dictionary = {}) -> Node2D:
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
	var hp_override: float = float(overrides.get("hp", 1.0)) # 240/275
	var shield_override: float = float(overrides.get("shield", 0.0)) # 276 트랩 한정
	var speed_override: float = float(overrides.get("speed", 0.0)) # 277 트랩 speed 1.6
	data["hp"] = hp_override
	data["attack"] = 0
	data["radius"] = r
	data["speed_pixels_per_tick"] = speed_override
	data["eShield"] = shield_override
	data["eShieldMax"] = shield_override
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
	native["speed"] = speed_override
	native["st2"] = st2
	native["facing"] = facing
	native["hp"] = hp_override
	native["mhp"] = hp_override
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
	if overrides.get("chase") == true:
		enemy.set("alerted", true) # 277 e.s='chase' — 포트 크롤러 추격은 alerted AI
	spawn_journal.append({"id": enemy_id, "step": step, "draws": draws, "position": [pos.x, pos.y]})
	return enemy

# ═══ allows/allowKey (32·36~39) — 포트는 API 제공; 입력 강제 배선은 잔여(시작 스킬 트랙 충돌 회피) ═══
func allows(action: String) -> bool:
	# 32 allows: !active || (intro 아닌 방향키) || (practice·focus 없음·단계 허용 행동)
	if not active:
		return true
	var is_direction: bool = action in ["up", "down", "left", "right"]
	if phase != "intro" and is_direction:
		return true
	if phase == "practice":
		return action in _actions()
	return false

## 포트 입력 액션명 → 원본 행동명(14290 BINDS 체계) 매핑 후 allows.
func allows_native_action(port_action: String) -> bool:
	var mapped: Variant = {"move_left": "left", "move_right": "right", "move_up": "up",
		"move_down": "down", "weapon": "weapon", "parry": "parry", "shield_bash": "shield",
		"native_magic": "beam", "rage_slot": "bow"}.get(port_action, port_action)
	return allows(str(mapped))

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
		_saved_player = {"hp": p.get("hp"), "x": player.global_position.x, "y": player.global_position.y,
			"st": player.get("stamina"), "iframes": player.get("iframes")} # 397 saved (st·iframes 포함)
	_move_last = player.global_position
	_build_panel()
	_set_objective_hidden(true)
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
	# 691~692 P.st=saved.st / P.iframes=saved.iframes — 레슨 연습 중 P.iframes=0(508)·st 리필 뒤 원래 값 복원.
	if _saved_player.get("st") != null:
		player.set("stamina", float(_saved_player["st"]))
	if _saved_player.get("iframes") != null:
		player.set("iframes", float(_saved_player["iframes"]))
	if _saved_player.has("x"): # 696 P.x/P.y 복원
		player.global_position = Vector2(float(_saved_player["x"]), float(_saved_player["y"]))
	_saved_lmb = {}
	_saved_player = {}
	active = false
	phase = "idle"
	pending = ""
	_restore_trap_practice() # 695 finish→restoreTrapPractice
	_clear_shot()
	parryEnemy = null
	if is_instance_valid(_panel):
		_panel.queue_free()
		_panel = null
	_set_objective_hidden(false)
	_ui = {}

## ui-foundation.css240: body:has(#parryLesson) #mmLvl{visibility:hidden} — 우상 목표 패널만 가린다.
func _set_objective_hidden(hidden: bool) -> void:
	var tree := get_tree()
	if tree == null:
		return
	var objective: Node = tree.root.find_child("NativeObjectivePanel", true, false)
	if objective is CanvasItem:
		(objective as CanvasItem).visible = not hidden

# ═══ 패널 — UI_FOUNDATION parryLesson 계약 + lesson_styles.json 실측 ═══
var _font_bold: FontVariation

func _weighted_font(weight: int) -> Font:
	# P2-007a — var(--font-hell) 스택(Nanum Myeongjo 400/700/800 → Noto Serif KR wght) 공용 공급자.
	if _font == null:
		return null
	return preload("res://scripts/native_ui_fonts.gd").stack("hell", weight)

func _label(size: int, color: Color, text: String = "", weight: int = 400) -> Label:
	var node := Label.new()
	UI.bind(node,text)
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

func _spacer(parent: Node, height: float) -> void:
	var gap := Control.new()
	gap.custom_minimum_size = Vector2(0, height)
	gap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(gap)

func _build_panel() -> void:
	_panel = CanvasLayer.new()
	_panel.name = "NativeParryLessonPanel"
	_panel.layer = PANEL_LAYER
	# 뒤 배경 — parry-lesson.css 1행 #parryLessonBackdrop:
	# background:linear-gradient(90deg,transparent 45%,#08070ba6); opacity:.5 (왼쪽 45%는 투명, 오른쪽 끝 α .65×.5).
	# (이전 전체 화면 검정 α.5는 화면·구역 제목을 웹보다 어둡게 덮었다 — PC-SPAWN-PARITY S-02)
	var backdrop := TextureRect.new()
	var grad := Gradient.new()
	grad.offsets = PackedFloat32Array([0.0, 0.45, 1.0])
	grad.colors = PackedColorArray([Color(8.0 / 255.0, 7.0 / 255.0, 11.0 / 255.0, 0.0),
		Color(8.0 / 255.0, 7.0 / 255.0, 11.0 / 255.0, 0.0), Color(8.0 / 255.0, 7.0 / 255.0, 11.0 / 255.0, 166.0 / 255.0)])
	var grad_tex := GradientTexture2D.new()
	grad_tex.gradient = grad
	grad_tex.fill_from = Vector2(0, 0.5)
	grad_tex.fill_to = Vector2(1, 0.5)
	grad_tex.width = 256
	grad_tex.height = 4
	backdrop.texture = grad_tex
	backdrop.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	backdrop.stretch_mode = TextureRect.STRETCH_SCALE
	backdrop.modulate = Color(1, 1, 1, 0.5)
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
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER # 원본 본문 스크롤바 비표시
	outer.add_child(scroll)
	var column := VBoxContainer.new()
	# SWEEP-B: parry-lesson.css 실측 세로 간격(84→112.5→192.5→237.2→276.4)을 스페이서로 맞춘다.
	column.add_theme_constant_override("separation", 0)
	column.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(column)
	var header := HBoxContainer.new()
	_ui["eyebrow"] = _label(10, COL_EYEBROW, UI.text("01 · 직접 실습"))
	_ui["eyebrow"].autowrap_mode = TextServer.AUTOWRAP_OFF
	_ui["eyebrow"].size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_ui["status"] = _label(10, COL_STATUS, UI.text("일시정지"))
	_ui["status"].autowrap_mode = TextServer.AUTOWRAP_OFF
	_ui["status"].size_flags_horizontal = Control.SIZE_SHRINK_END
	header.add_child(_ui["eyebrow"])
	header.add_child(_ui["status"])
	for label_key in ["eyebrow", "status"]:
		(_ui[label_key] as Label).custom_minimum_size.y = 16.5
		(_ui[label_key] as Label).vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	column.add_child(header)
	_spacer(column, 14.0)
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
	keycap_style.content_margin_top = 11.0 # 실측 높이 62 = 11 + 37.7(Cinzel 28 줄) + 11 + 테두리 2
	keycap_style.content_margin_bottom = 11.0
	keycap.add_theme_stylebox_override("panel", keycap_style)
	_ui["keycap_style"] = keycap_style
	keycap.size_flags_horizontal = Control.SIZE_SHRINK_END # 실측: 키캡 우측 정렬(right=콘텐츠 우변 1826)
	_ui["keycap"] = _label(28, COL_KEYCAP, "W A S D", 400) # 실측 400
	_ui["keycap"].add_theme_font_override("font", preload("res://scripts/native_ui_fonts.gd").stack("cinzel_serif", 400)) # P2-007a .lesson-key 'Cinzel',serif(로드분 700 face)
	_ui["keycap"].autowrap_mode = TextServer.AUTOWRAP_OFF
	keycap.add_child(_ui["keycap"])
	keycap.custom_minimum_size.y = 62.0 # 실측 125.6×62 (1710.4,114.5)
	column.add_child(keycap)
	_spacer(column, 16.0)
	_ui["title"] = _label(29, COL_TITLE, "", 700) # 실측 font-weight 700
	(_ui["title"] as Label).custom_minimum_size.y = 37.7
	(_ui["title"] as Label).add_theme_constant_override("shadow_offset_y", 2)
	column.add_child(_ui["title"])
	_spacer(column, 7.0)
	_ui["subtitle"] = _label(12, COL_SUBTITLE)
	(_ui["subtitle"] as Label).custom_minimum_size.y = 19.2
	column.add_child(_ui["subtitle"])
	_spacer(column, 17.0)
	# 110~111/170~174: checklist는 전 행 순서 유지, details(hint+hold)가 현재 행 뒤로 이동
	var checklist := VBoxContainer.new()
	checklist.add_theme_constant_override("separation", 6) # 실측 행 피치 44.4 = 38.4 + 6
	_ui["checklist"] = checklist
	var details := VBoxContainer.new()
	details.add_theme_constant_override("separation", 6)
	var details_wrap := MarginContainer.new() # 실측 .lesson-hint 들여쓰기 8px (1496)
	details_wrap.add_theme_constant_override("margin_left", 8)
	details_wrap.add_child(details)
	_ui["details"] = details_wrap
	_ui["hint"] = _label(14, COL_HINT)
	(_ui["hint"] as Label).add_theme_constant_override("line_spacing", 6) # lh 23.8
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
		line.add_theme_constant_override("separation", 10) # 상자 1497→글자 1523
		var box := Panel.new()
		box.custom_minimum_size = Vector2(16, 16) # 실측 체크박스 16×16
		box.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var box_style := StyleBoxFlat.new()
		box_style.bg_color = Color(13.0 / 255.0, 13.0 / 255.0, 16.0 / 255.0)
		box_style.border_color = Color(154.0 / 255.0, 130.0 / 255.0, 113.0 / 255.0)
		box_style.set_border_width_all(1)
		box_style.set_corner_radius_all(2)
		box.add_theme_stylebox_override("panel", box_style)
		var row_label := _label(14, COL_ROW, str(text))
		row_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row_label.custom_minimum_size.y = 22.4
		row_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		line.add_child(box)
		line.add_child(row_label)
		row.add_child(line)
		checklist.add_child(row)
		(_ui["rows"] as Array).append({"panel": row, "label": row_label, "box": box, "box_style": box_style})
	checklist.add_child(details_wrap)
	# .lesson-checklist: 상·하단 1px 선 + padding 16px 0
	var checklist_box := PanelContainer.new()
	var checklist_style := StyleBoxFlat.new()
	checklist_style.bg_color = Color(0, 0, 0, 0)
	checklist_style.border_color = Color(0x6e / 255.0, 0x55 / 255.0, 0x46 / 255.0, 0.55)
	checklist_style.border_width_top = 1
	checklist_style.border_width_bottom = 1
	checklist_style.content_margin_top = 16.0
	checklist_style.content_margin_bottom = 16.0
	checklist_box.add_theme_stylebox_override("panel", checklist_style)
	checklist_box.add_child(checklist)
	column.add_child(checklist_box)
	_ui["safety"] = _label(11, COL_SUBTITLE, UI.text("패링 실패 시 폭발 피해를 받습니다. 재시도하면 체력이 회복됩니다."))
	column.add_child(_ui["safety"])
	# 하단 고정: 시작/건너뛰기/진행바 (행동 버튼 계약)
	var footer_line := ColorRect.new() # .lesson-footer border-top + padding 12px
	footer_line.color = Color(0x6e / 255.0, 0x55 / 255.0, 0x46 / 255.0, 0.55)
	footer_line.custom_minimum_size = Vector2(0, 1)
	var footer := VBoxContainer.new()
	footer.add_theme_constant_override("separation", 0)
	outer.add_child(footer)
	footer.add_child(footer_line)
	_spacer(footer, 12.0)
	var practice_button := Button.new()
	UI.bind(practice_button,"W / A / S / D 또는 클릭하여 시작")
	practice_button.custom_minimum_size = Vector2(0, 47)
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
	UI.bind(skip_button,"연습 건너뛰기")
	skip_button.custom_minimum_size = Vector2(97.7, 36) # 실측 (1615.1,994) 가운데 정렬 소형
	skip_button.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	if _font != null:
		skip_button.add_theme_font_override("font", _weighted_font(400)) # P2-007a --font-hell 스택
	skip_button.add_theme_font_size_override("font_size", 12)
	skip_button.add_theme_color_override("font_color", COL_SKIP_TEXT)
	var skip_style := StyleBoxFlat.new()
	skip_style.bg_color = Color(0x1d / 255.0, 0x14 / 255.0, 0x13 / 255.0)
	skip_style.border_color = Color(0x66 / 255.0, 0x50 / 255.0, 0x44 / 255.0)
	skip_style.set_border_width_all(1)
	skip_style.content_margin_left = 12.0
	skip_style.content_margin_right = 12.0
	skip_style.content_margin_top = 4.0
	skip_style.content_margin_bottom = 4.0
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
	var status_text := UI.text("일시정지")
	if phase == "practice": status_text = UI.text("연습 중")
	elif phase == "success": status_text = UI.text("성공")
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
	var basic_checks := [movement_done, left_click_done, right_click_done, spike_trap_done]
	var all_checks: Array = basic_checks + checks
	var current_row: int = (step + 3) if step < 0 else (3 if step == 8 else 4 + step)
	var rows: Array = _ui["rows"]
	for i in range(rows.size()):
		var entry: Dictionary = rows[i]
		var done: bool = bool(all_checks[i]) if i < all_checks.size() else false
		var is_current: bool = i == current_row
		(entry["label"] as Label).add_theme_color_override("font_color",
			COL_ROW_DONE if done else (COL_ROW_CURRENT if is_current else COL_ROW))
		var box_style: StyleBoxFlat = entry["box_style"]
		box_style.bg_color = Color(0xb2 / 255.0, 0xd6 / 255.0, 0xac / 255.0, 0.85) if done else Color(0, 0, 0, 0.35)
		box_style.border_color = COL_ROW_DONE if done else COL_ROW
		var style := StyleBoxFlat.new()
		style.content_margin_left = 9.0 # padding 8 + 테두리 1 (Godot는 명시 content margin에 테두리를 더하지 않음)
		style.content_margin_right = 9.0
		style.content_margin_top = 8.0
		style.content_margin_bottom = 8.0
		style.set_border_width_all(1) # 실측 비현재 행도 1px 투명 테두리(높이 38.4 유지)
		if is_current: # 실측 linear-gradient(90deg, rgba(85,24,25,.667), rgba(37,16,17,.4)) · 1px #a34d3f
			style.bg_color = Color(61.0 / 255.0, 20.0 / 255.0, 21.0 / 255.0, 0.53)
			style.border_color = Color(0xa3 / 255.0, 0x4d / 255.0, 0x3f / 255.0)
		else:
			style.bg_color = Color(0, 0, 0, 0)
			style.border_color = Color(0, 0, 0, 0)
		(entry["panel"] as PanelContainer).add_theme_stylebox_override("panel", style)
	var details_node: Node = _ui["details"]
	if details_node.get_parent() == _ui["checklist"]:
		(_ui["checklist"] as VBoxContainer).move_child(details_node,
			mini(current_row + 1, (_ui["checklist"] as VBoxContainer).get_child_count() - 1))
	var total := float(BASIC_LABELS.size() + LESSON_LABELS.size())
	var done_count := 0
	for flag in all_checks:
		if flag: done_count += 1
	(_ui["progress_fill"] as ColorRect).anchor_right = done_count / total
	_ui["button"].visible = phase == "intro" # 146
	_ui["hold"].visible = false
	(_ui["hold_meter_bg"] as ColorRect).visible = false
	var ordinal: int = 4 if step == 8 else (step + 4 if step < 0 else step + 5)
	var subtitle_name: String = UI.text("1 · 가시덫") if step == 8 else (BASIC_LABELS[step + 3] if step < 0 else LESSON_LABELS[step])
	_ui["subtitle"].text = "%d / 12 · %s" % [ordinal, UI.text(subtitle_name)]
	if step == -3: # 157~161 step<0 i=0
		_ui["keycap"].text = "W A S D"
		_ui["title"].text = UI.text("먼저 움직여보세요")
		_ui["hint"].text = UI.text("W 위 · A 왼쪽 · S 아래 · D 오른쪽. WASD 또는 방향키로 조금 걸어보세요. 이후 모든 실습에서도 이동할 수 있습니다.")
	elif step == -2: # 248~254 updateAttackPractice(left)
		_ui["keycap"].text = UI.text("좌클릭")
		_ui["title"].text = UI.text("기검참으로 적 10마리를 처치하세요")
		_ui["hint"].text = UI.text("1·2타 뒤 3타에서 좌클릭을 2초 누르고 떼어 검기로 적을 처치하세요.\n처치 %d/10 · 3단 차징 검기 처치 %d/1") % [mini(10, left_kills), 1 if left_full_charge_kill else 0]
		_ui["hold"].visible = true
		(_ui["hold_meter_bg"] as ColorRect).visible = true
		var charge: float = float(player.get("charge_frames")) if player.get("charge_frames") != null else 0.0
		(_ui["hold_meter_fill"] as ColorRect).anchor_right = clampf(charge / 120.0, 0.0, 1.0) # 253 holdMeter.value
		_ui["hold"].text = UI.text("3단 차징 검기 처치 완료") if left_full_charge_kill else (UI.text("3타 차징 %d/3단 · 2초까지 유지") % mini(3, int(charge / 40.0)) if charge > 0.0 else UI.text("1·2타 뒤 3타를 2초 누르세요"))
	elif step == -1: # 255~258
		_ui["keycap"].text = UI.text("우클릭")
		_ui["title"].text = UI.text("마법으로 적 5마리를 처치하세요")
		_ui["hint"].text = UI.text("적을 마우스로 조준하고 우클릭으로 마법탄을 발사하세요.\n처치 %d/5 · 실제로 처치해야 완료됩니다.") % right_kills
	elif step == 8: # 298~304 updateTrapPractice
		_ui["keycap"].text = "1 + W A S D"
		_ui["title"].text = UI.text("붙으면 가시덫을 깔고 도망치세요")
		_ui["hint"].text = UI.text("몬스터 10마리가 쫓아옵니다. 가까이 붙으면 1번으로 발밑에 가시덫을 깔고, WASD / 방향키로 도망치세요. 덫 안의 적은 느려지고 지속 피해로 쓰러집니다.\n") \
			+ UI.text("%s 가시덫 설치 · %s 설치 후 이동 · 처치 %d/10") % [
				"✓" if trap_zone != null else "□", "✓" if trap_escaped else "□", trap_kills]
		if practice_halted != "":
			_ui["hint"].text += UI.text("\n(정지: %s)") % practice_halted
	elif step >= 0 and step <= 7: # 139~143 title/tips/key()
		_ui["keycap"].text = UI.text(STEP_KEYS[step])
		_ui["title"].text = UI.text(STEP_TITLES[step])
		_ui["hint"].text = UI.text(STEP_TIPS[step])
		if step == 0: # 181~186 updateParryPractice(step0=마법) — title·hint 덮어쓰기
			_ui["title"].text = UI.text("마법탄을 패링해 몬스터를 처치하세요")
			_ui["hint"].text = UI.text("몬스터 주위의 링이 완성되면 탄이 발사됩니다. 링 색으로 탄 종류를 미리 예측하세요. 흰색 링은 물리탄(E), 속성색 링은 마법탄(Q)입니다. ") 				+ UI.text("이번 보라색 링은 암흑 마법탄입니다. 탄이 가까워지면 [Q]로 패링하세요.") 				+ "
" + (UI.text("패링 성공! 반사탄으로 발사한 몬스터를 처치하면 완료됩니다.") if shot_reflected else UI.text("패링으로 탄을 되돌려 발사한 몬스터까지 처치하세요."))

func _input(event: InputEvent) -> void:
	# 40 allowKey: 스킬 캐스트 키는 player 퍼널 밖(native_skill_slots._unhandled_input,
	# 수정 금지)에서 소비되므로, 레슨 활성 중 여기(_input이 _unhandled_input보다 선행)서
	# 차단한다. step 8만 skill_slot_1 허용, area_slot_f는 레슨 중 항상 차단,
	# rage_slot은 allows(bow) 매핑.
	if active and (event is InputEventKey or event is InputEventAction):
		for cast_action in ["skill_slot_1", "area_slot_f", "rage_slot"]:
			if not InputMap.has_action(cast_action) or not event.is_action(cast_action):
				continue
			var cast_allowed: bool = false
			match cast_action:
				"skill_slot_1": cast_allowed = chapter == 1 and step == 8 and phase == "practice"
				"area_slot_f": cast_allowed = false
				"rage_slot": cast_allowed = allows_native_action("rage_slot")
			if not cast_allowed:
				get_viewport().set_input_as_handled()
				return
	# 37 allowKey: intro에서 W/A/S/D → beginPractice.
	# _input 사용 — allows 게이트(player)가 같은 키를 lock 처리(set_input_as_handled)해도
	# beginPractice는 원본 allowKey처럼 항상 먼저 듣는다(P2-001l).
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

func _retranslate_lesson_ui(what: int) -> void:
	if what==NOTIFICATION_TRANSLATION_CHANGED and not _ui.is_empty():call_deferred("_render")
