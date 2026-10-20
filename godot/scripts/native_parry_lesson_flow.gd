class_name ExoduserNativeParryLessonFlow
extends Node
## P2-001j — 커튼 직후 패링 레슨의 "흐름 제어" owner (원본 parry-lesson.js + game.html).
## 원본 트리거: 게임 루프 update()의 세 번째 이른 게이트(32111
## `if(window._parryLesson&&window._parryLesson.tick())return;`) — tick()이 비활성 상태에서
## 시작 조건(468~474)을 만족하면 start()로 자동 개입하고, active 동안 true를 돌려 게임
## 틱 전체(그 뒤의 stageTime 32742 포함)를 차단한다. 종료(finish 685~700)/스킵(skipAll)
## 시 저장분을 복원하고 이후 tick은 false(seen=true 재시작 금지).
## 이 포트 슬라이스 = 트리거·차단·intro 패널(원본 텍스트)·스킵·복원. 연습 스텝 본문
## (practice/8스텝·챕터2 자원 연습)은 미이식 — '시작' 버튼/WASD 진입은 no-op 기록.
## Q/E 전투 판정·돌진/패링/방패 규칙(2_3)은 불변 — 레슨은 위의 진행 제어만 소유.

const PANEL_LAYER := 30

var world: Node2D
var player: Node2D
var state: Node
var sequence: Node2D            # bonfire owner (G._bonfire 저장/복원 400~401·698 상응)
var active := false             # parry-lesson.js 4 file-init active:false
var seen := false               # 〃 seen:false (저장 연동 dismissed()는 잔여)
var phase := "idle"             # 'intro'만 이식
var _saved_enemies: Array = []
var _saved_bonfire: Dictionary = {}
var _saved_lmb: Dictionary = {}
var _panel: CanvasLayer
var _metrics := {"tick_calls": 0, "starts": 0, "skips": 0, "practice_clicks_unported": 0,
	"enemies_saved": 0, "enemies_restored": 0}
var _configured := false

func configure(owner_world: Node2D, owner_player: Node2D, state_node: Node, owner_sequence: Node2D) -> bool:
	if _configured or not is_instance_valid(owner_world) or not is_instance_valid(owner_player):
		return false
	world = owner_world
	player = owner_player
	state = state_node
	sequence = owner_sequence
	process_mode = Node.PROCESS_MODE_PAUSABLE
	_configured = true
	return true

## 32111 위치에서 update clock 드라이버(services parry_lesson 관측)가 프레임당 1회 호출.
## 반환 = 원본 tick() 반환(true면 update 차단 → phase_parry_lesson RETURNED).
func native_lesson_tick() -> bool:
	if not _configured:
		return false
	_metrics.tick_calls += 1
	if not active:
		# 468~474 시작 게이트. dismissed()(저장) 미이식 — seen 플래그만(잔여).
		if seen:
			return false
		var g: Variant = state.read_current_g() if is_instance_valid(state) else null
		if not g is Dictionary:
			return false
		# G.stage!==0: 포트는 stage0 고정. _saving/_EDITOR_MODE/_bossTestReq/_MAP_QA_MODE/
		# ?projectilelab/?tutorial=0: 포트 비존재(상수 비활성 — 잔여 목록).
		if _truthy(g.get("_intro")) or _truthy(g.get("paused")):
			return false
		if not is_instance_valid(player) or float(player.get("hp")) <= 0.0:
			return false
		_start()
	# 484: intro phase → return true (그 밖의 practice 분기 미이식).
	return active and phase == "intro"

## start()(386~407)의 흐름 슬라이스: 저장/치환 중 포트 보유분만 — 적(398~400)·
## bonfire(400~401)·P.activeLMBSk 강제 kiSlash(395~396). 나머지(projs/worldItems/
## spawnHoles/rifts/_fireZones/스킬·슬롯·BINDS2 스왑 등)는 잔여 목록.
func _start() -> void:
	active = true
	seen = true     # 393 this.seen=true
	phase = "intro" # 393 phase='intro' (step=-3 첫 패널)
	_metrics.starts += 1
	if world.has_method("detach_native_enemies_for_lesson"):
		_saved_enemies = world.detach_native_enemies_for_lesson()
		_metrics.enemies_saved = _saved_enemies.size()
	if is_instance_valid(sequence) and sequence.get("bonfire") is Dictionary:
		_saved_bonfire = (sequence.get("bonfire") as Dictionary).duplicate(true)
		sequence.get("bonfire")["active"] = false # 401 G._bonfire=null 상응(렌더/푸시 정지)
	var p: Variant = state.read_current_p() if is_instance_valid(state) else null
	if p is Dictionary:
		_saved_lmb = {"had": p.has("activeLMBSk"), "value": p.get("activeLMBSk")}
		p["activeLMBSk"] = "kiSlash" # 396 P.activeLMBSk='kiSlash'
	_build_panel()

func skip_all() -> void:
	# 105 skip.onclick = () => this.skipAll() → finish 경로.
	if not active:
		return
	_metrics.skips += 1
	_finish()

## finish()(685~700) 슬라이스: ens 복원(689)·bonfire 복원(691 fields)·activeLMBSk
## 스냅샷 복원(697 basicSkillSnapshot). HP/MP/좌표 복원 등은 저장분이 없어 비해당.
func _finish() -> void:
	if world.has_method("restore_native_lesson_enemies"):
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
	_saved_lmb = {}
	active = false
	phase = "idle"
	if is_instance_valid(_panel):
		_panel.queue_free()
		_panel = null

## intro 패널 — 원본 텍스트 그대로(ko), 레이아웃/CSS(parry-lesson.css)는 간이(잔여):
## eyebrow "01 · 직접 실습"(69), status "일시정지"(137), keycap "W A S D"(157),
## title "먼저 움직여보세요"(158), hint(159~161), 기본 체크리스트(77), 버튼(146~147)
## "W / A / S / D 또는 클릭하여 시작"(연습 미이식 — no-op 기록), "연습 건너뛰기"(105).
func _build_panel() -> void:
	_panel = CanvasLayer.new()
	_panel.name = "NativeParryLessonPanel"
	_panel.layer = PANEL_LAYER
	var box := PanelContainer.new()
	box.anchor_left = 0.5
	box.anchor_right = 0.5
	box.anchor_top = 0.5
	box.anchor_bottom = 0.5
	box.offset_left = -330.0
	box.offset_right = 330.0
	box.offset_top = -230.0
	box.offset_bottom = 230.0
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.051, 0.043, 0.039, 0.96)
	style.border_color = Color(164.0 / 255.0, 147.0 / 255.0, 115.0 / 255.0, 0.5)
	style.set_border_width_all(1)
	style.set_content_margin_all(26.0)
	box.add_theme_stylebox_override("panel", style)
	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 10)
	box.add_child(column)
	var bone := Color(0xdf / 255.0, 0xd6 / 255.0, 0xc2 / 255.0)
	var dim := Color(0x8d / 255.0, 0x7c / 255.0, 0x65 / 255.0)
	for pair in [["01 · 직접 실습 — 일시정지", dim, 13],
			["W A S D", bone, 30],
			["먼저 움직여보세요", bone, 22],
			["W 위 · A 왼쪽 · S 아래 · D 오른쪽. WASD 또는 방향키로 조금 걸어보세요. 이후 모든 실습에서도 이동할 수 있습니다.", dim, 13],
			["패링 실패 시 폭발 피해를 받습니다. 재시도하면 체력이 회복됩니다.", dim, 12]]:
		var label := Label.new()
		label.text = pair[0]
		label.add_theme_color_override("font_color", pair[1])
		label.add_theme_font_size_override("font_size", pair[2])
		label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		column.add_child(label)
	var practice := Button.new()
	practice.text = "W / A / S / D 또는 클릭하여 시작"
	practice.pressed.connect(func() -> void:
		# 177 beginPractice — 연습 본문 미이식: 전환하지 않고 기록만(가짜 진행 금지).
		_metrics.practice_clicks_unported += 1)
	column.add_child(practice)
	var skip := Button.new()
	skip.text = "연습 건너뛰기"
	skip.pressed.connect(skip_all)
	column.add_child(skip)
	_panel.add_child(box)
	add_child(_panel)

static func _truthy(value: Variant) -> bool:
	if value == null:
		return false
	if value is bool:
		return value
	if value is int or value is float:
		return float(value) != 0.0 and not is_nan(float(value))
	if value is String:
		return not (value as String).is_empty()
	return true

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "active": active, "seen": seen, "phase": phase,
		"metrics": _metrics.duplicate(true), "saved_enemies": _saved_enemies.size(),
		"unported": [
			"practice/8스텝·챕터2 자원 연습 본문(386~ 이후 전체) — intro→스킵 경로만",
			"dismissed()(저장 연동 재시작 금지) — 세션 내 seen 플래그만",
			"start/finish의 projs/pProjs/worldItems/spawnHoles/rifts/_fireZones/스킬·슬롯·BINDS2/HP·MP·좌표 저장·복원(포트 미보유 상태)",
			"allows()/allowKey() 입력 제한(13210·14290~) — 포트 입력 표면에 패널 키 부재",
			"패널 CSS(parry-lesson.css) 마감 — 간이 스타일(디자인 미검수 명시)"]}
