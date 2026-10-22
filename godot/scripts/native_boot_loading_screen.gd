extends CanvasLayer
## BOOT-01 (PC, 2026-10-22) — 필드 진입 로딩 화면. 원본 #stageTransition 부트 로딩 그대로
## (game.html 3225–3236 마크업, 63538–63625 showBootLoading/setBootLoading/hideBootLoading, 63699–63740 팁).
##
## 원본 흐름(데모 새 게임): index 전사 이야기 → game.html 부팅
##   _boot: showBootLoading('에셋 로딩 중...') 8% → 에셋 프리로드 8+~~(loaded/total*70)% → 80 '렌더러 초기화...'
##          → 85 '아틀라스 빌드...' → 92 '오디오 준비...' → 98 '게임 시작!'(팁 회전 멈춤)
##   _startDemoNew(62115): showBootLoading('DEMO 로딩...') → 20 '캐릭터 초기화...' → 50 '몬스터 스킨 로딩...'
##          → 75 '맵과 몬스터 생성 중...' → initStage → _prepareStartMapView 98 '시작 화면 준비 중...'
##          → _prepareStartScene 99 '맵과 움직임 준비 중...'(11687) → 100 '완료' → 숨김 (웹 캡처 순서로 확인)
## Godot 대응: 앞 묶음 = 진입 예열(native_boot_prewarm) 진행률, 뒤 묶음 = Main 단계 부팅(main.read_native_boot_stage_log)
## 단계 이름. 화면 요소·위치·글꼴·색·막대·팁 회전·랜덤 이미지(세션당 1장)는 원본 값 그대로다.
## 레이어 100(영상 패널·인트로와 같은 층), PROCESS_MODE_ALWAYS — 단계 사이 일시정지 중에도 갱신된다.
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
const Fonts = preload("res://scripts/native_ui_fonts.gd")
const Prewarm = preload("res://scripts/native_boot_prewarm.gd")
const IMAGE_COUNT := 19 # 원본 63546 for(i=1;i<=19) 'img/lording/'+i+'.png'
const ACCENT := Color("ff8a43") # --c-accent (game.html 109)
const TIPS_KO := [ # game.html 63699–63716 _LOAD_TIPS_KO 그대로(표시는 _T 대응 = UI.text)
	"💡 Shift로 사슬 돌진! 적을 관통하며 무적",
	"💡 Q로 보호막 발동 — 기본 흡수율 30%, 패링 성공 시 HP/ST/MP/기동게이지 회복",
	"💡 속성 약점을 찌르면 데미지 2배!",
	"💡 ESC로 설정 — 난이도, 자동물약 조절",
	"💡 지옥강타 1로 기절 회복 + 포이즈를 깎아 그로기 유발!",
	"💡 그로기 상태에서 기본 데미지 1.5배",
	"💡 탄막은 패링하면 되돌려 보낸다!",
	"💡 Ctrl 얼음보주 — 무적! 재입력으로 즉시 폭파",
	"💡 합체 스킬로 더 강한 공격을 만들어보세요",
	"💡 엘리트 몬스터는 특수 능력을 가지고 있다",
	"💡 보스의 패턴을 읽고 패링 타이밍을 잡아라",
	"💡 인벤토리(TAB)에서 장비를 비교하고 장착",
	"💡 대장간에서 장비를 강화하고 분해하세요",
	"💡 R키로 아이템을 수거합니다",
	"💡 물약은 설정한 HP% 이하에서 자동 사용",
	"💡 집중 스킬(홀드)은 시전 중 기절 면역!"]
## _L(ko,en) 직접 쌍(원본 63786–63805). 나머지는 _T 대응(UI.text, 없는 키는 원문 그대로 = 원본 _T 폴백).
const L_PAIRS := {"에셋 로딩 중...": "Loading assets...", "렌더러 초기화...": "Initializing renderer...",
	"아틀라스 빌드...": "Building atlas...", "오디오 준비...": "Preparing audio...", "게임 시작!": "Starting game!",
	"시작 화면 준비 중...": "Preparing starting view...", "맵과 움직임 준비 중...": "Preparing map and motion..."}
## Main 단계 이름 → 원본 _startDemoNew 단계(pct, 문구). main.gd _native_boot_stage 라벨 순서와 같다.
const STAGE_STEPS := {
	"world": [20, "캐릭터 초기화..."], "player": [20, "캐릭터 초기화..."],
	"player_bindings": [50, "몬스터 스킨 로딩..."], "camera_hud": [50, "몬스터 스킨 로딩..."],
	"screen_look": [75, "맵과 몬스터 생성 중..."], "pets_skills": [75, "맵과 몬스터 생성 중..."],
	"regeneration": [75, "맵과 몬스터 생성 중..."], "ui_owners": [75, "맵과 몬스터 생성 중..."],
	"startup_services": [75, "맵과 몬스터 생성 중..."], "demo_actors": [75, "맵과 몬스터 생성 중..."],
	"body_done": [98, "시작 화면 준비 중..."], "pre_entry": [99, "맵과 움직임 준비 중..."]} # 11718 → 11687(_prepareStartScene)
const SHADER_CODE := """shader_type canvas_item;
// CSS filter: saturate(1.1) brightness(1.05) — Filter Effects 1 saturate 행렬(sRGB) 후 밝기 곱
uniform float sat = 1.1;
uniform float bright = 1.05;
void fragment() {
	vec4 c = COLOR; // Godot 4 canvas fragment: COLOR = 텍스처 색 × 정점 색(이미 샘플됨)
	float s = sat;
	vec3 r = vec3(0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s);
	vec3 g = vec3(0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s);
	vec3 b = vec3(0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s);
	vec3 o = clamp(vec3(dot(r, c.rgb), dot(g, c.rgb), dot(b, c.rgb)), 0.0, 1.0);
	COLOR = vec4(clamp(o * bright, 0.0, 1.0), c.a);
}"""

static var _picked_index := -1 # 원본 _bootRdPicked: 세션당 한 장
static var _rng: RandomNumberGenerator # 표시 전용 난수 — 게임 전역 randi() 흐름(시작 아이템 등)을 건드리지 않는다

var locale := "ko"
var main: Node
var phase := "prewarm" # prewarm → boot → done
var percent := 0.0
var message := ""
var _root: Control
var _image: TextureRect
var _name: Label
var _bar_wrap: Control
var _tip: Label
var _tips: Array = []
var _tip_index := 0
var _tip_running := false
var _tip_clock := 0.0
var _tip_fade := -1.0
var _fade := 0.0 # 0..1 표시 불투명도(원본 transition: opacity .3s)
var _fade_target := 1.0
var _bar_shown := 0.0 # 원본 transition: width .2s
var _image_key := ""
var _prewarm_steps_done := {}

static func image_index() -> int:
	if _picked_index < 0:
		_picked_index = _display_rng().randi_range(1, IMAGE_COUNT) # 원본 _pickTransitionRd: 1~19 중 하나
	return _picked_index

static func _display_rng() -> RandomNumberGenerator:
	if _rng == null:
		_rng = RandomNumberGenerator.new()
		_rng.randomize()
	return _rng

static func image_path(source_root: String) -> String:
	return source_root.path_join("img/lording/%d.png" % image_index())

func _ready() -> void:
	layer = 101 # 원본 #stageTransition(z 38)은 인트로 컷신을 그리는 캔버스 위 — 인트로(100) 위에서 사라진다
	process_mode = Node.PROCESS_MODE_ALWAYS
	_root = Control.new()
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_root.mouse_filter = Control.MOUSE_FILTER_STOP # pointer-events:all
	_root.modulate.a = 0.0
	add_child(_root)
	var bg := ColorRect.new() # 게임 캔버스(부팅 중 검정) 위 rgba(0,0,0,.80) — 결과는 검정
	bg.color = Color.BLACK
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(bg)
	_image = TextureRect.new() # #stRndImg inset:0 object-fit:cover center
	_image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var shader := Shader.new()
	shader.code = SHADER_CODE
	var mat := ShaderMaterial.new()
	mat.shader = shader
	_image.material = mat
	_root.add_child(_image)
	# 하단 블록(bottom:5vh, 가운데) — 원본 실측 상자(1920×1080): 이름 y928 h56, 막대 y996 240×4, 팁 y1006 h20
	_name = Label.new()
	_name.position = Vector2(0, 928)
	_name.size = Vector2(1920, 56)
	_name.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_name.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	var name_font: FontVariation = Fonts.stack("font", 700).duplicate() # 700, letter-spacing .3em = 11.52px
	name_font.spacing_glyph = 12
	_name.add_theme_font_override("font", name_font)
	_name.add_theme_font_size_override("font_size", 38) # 2vw = 38.4px
	_name.add_theme_color_override("font_color", Color.WHITE)
	_name.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.22)) # text-shadow 0 0 15px rgba(0,0,0,.85) 근사(흐림 없음 → 옅은 넓은 외곽)
	_name.add_theme_constant_override("shadow_outline_size", 14)
	_name.add_theme_constant_override("shadow_offset_x", 0)
	_name.add_theme_constant_override("shadow_offset_y", 0)
	_name.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_name)
	_bar_wrap = Control.new() # 240×4, rgba(255,255,255,.25), radius 4(높이 4라 2로 깎임), overflow:hidden
	_bar_wrap.position = Vector2(840, 996)
	_bar_wrap.size = Vector2(240, 4)
	_bar_wrap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_bar_wrap.draw.connect(_draw_bar)
	_root.add_child(_bar_wrap)
	_tip = Label.new()
	_tip.position = Vector2(0, 1006)
	_tip.size = Vector2(1920, 20)
	_tip.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_tip.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	var tip_font: FontVariation = Fonts.stack("font", 400).duplicate() # .85rem = 13.6px, letter-spacing .15em = 2.04px
	tip_font.spacing_glyph = 2
	_tip.add_theme_font_override("font", tip_font)
	_tip.add_theme_font_size_override("font_size", 14)
	_tip.add_theme_color_override("font_color", Color("888888"))
	_tip.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(_tip)

## 원본 showBootLoading(msg) + _startLoadTips(첫 부팅에서만).
func show_boot_loading(msg: String, start_tips: bool) -> void:
	_set_text(msg)
	percent = 8.0
	_fade_target = 1.0
	if start_tips:
		_tips = []
		for tip in TIPS_KO:
			_tips.append(_t(tip))
		_tip_index = _display_rng().randi_range(0, _tips.size() - 1)
		_tip.text = _tips[_tip_index]
		_tip_running = true
		_tip_clock = 0.0

## 원본 setBootLoading(pct,msg) — 빈 문구는 그대로 둔다. 100 이상이면 숨긴다.
func set_boot_loading(pct: float, msg: String) -> void:
	if not msg.is_empty():
		_set_text(msg)
	percent = clampf(pct, 0.0, 100.0)
	if pct >= 100.0:
		hide_boot_loading()

func hide_boot_loading() -> void:
	_fade_target = 0.0
	phase = "done"

func stop_tips() -> void: # 원본 _stopLoadTips: 회전만 멈추고 마지막 팁 문구는 남는다
	_tip_running = false

func is_hidden_done() -> bool:
	return _fade_target <= 0.0 and _fade <= 0.0

func _set_text(msg: String) -> void:
	message = msg
	_name.text = _t(msg)

func _t(key: String) -> String:
	if locale.begins_with("ko"):
		return key
	if L_PAIRS.has(key):
		return L_PAIRS[key]
	return UI.text(key, locale)

func _process(delta: float) -> void:
	# 진행 상태 반영
	if phase == "prewarm":
		_follow_prewarm()
	elif phase == "boot":
		_follow_main()
	if _image.texture == null and not _image_key.is_empty():
		var tex: Variant = Prewarm.read_result(_image_key)
		if tex is Texture2D:
			_image.texture = tex
	# 막대(width .2s), 불투명도(.3s), 팁 회전(3s 간격, 0.3s 사라졌다 바뀐 뒤 .3s 나타남)
	var target_w := 240.0 * percent / 100.0
	if absf(target_w - _bar_shown) > 0.01:
		_bar_shown = lerpf(_bar_shown, target_w, 1.0 - exp(-delta * 15.0))
		_bar_wrap.queue_redraw()
	_fade = move_toward(_fade, _fade_target, delta / 0.3)
	_root.modulate.a = _fade
	_root.mouse_filter = Control.MOUSE_FILTER_STOP if _fade_target > 0.0 else Control.MOUSE_FILTER_IGNORE
	if _tip_running and not _tips.is_empty():
		_tip_clock += delta
		if _tip_clock >= 3.0:
			_tip_clock -= 3.0
			_tip_index = (_tip_index + 1) % _tips.size()
			_tip_fade = 0.0
	if _tip_fade >= 0.0:
		_tip_fade += delta
		if _tip_fade < 0.3:
			_tip.modulate.a = 1.0 - _tip_fade / 0.3
		else:
			if _tip.text != _tips[_tip_index]:
				_tip.text = _tips[_tip_index]
			_tip.modulate.a = minf(1.0, (_tip_fade - 0.3) / 0.3)
			if _tip_fade >= 0.6:
				_tip_fade = -1.0
				_tip.modulate.a = 1.0
	if phase == "done" and is_hidden_done():
		queue_free()

func _draw_bar() -> void:
	var wrap := StyleBoxFlat.new()
	wrap.bg_color = Color(1, 1, 1, 0.25)
	wrap.set_corner_radius_all(2)
	_bar_wrap.draw_style_box(wrap, Rect2(0, 0, 240, 4))
	if _bar_shown < 0.5:
		return
	var fill := StyleBoxFlat.new()
	fill.bg_color = ACCENT
	fill.corner_radius_top_left = 2
	fill.corner_radius_bottom_left = 2
	if _bar_shown >= 238.0:
		fill.corner_radius_top_right = 2
		fill.corner_radius_bottom_right = 2
	_bar_wrap.draw_style_box(fill, Rect2(0, 0, _bar_shown, 4))

func set_image_key(key: String) -> void:
	_image_key = key

func _follow_prewarm() -> void:
	var snap: Dictionary = Prewarm.snapshot()
	if not snap.get("started", false):
		return
	var res_total := int(snap.get("resources", 0))
	var res_done := int(snap.get("loaded", 0)) + int(snap.get("failed", 0))
	if not Prewarm.is_complete():
		if res_total > 0 and res_done < res_total:
			set_boot_loading(8 + int(float(res_done) / float(res_total) * 70.0), "에셋 로딩 중...")
		elif not _prewarm_steps_done.has(80):
			_prewarm_steps_done[80] = true
			set_boot_loading(80, "렌더러 초기화...")
		elif int(snap.get("jobs_done", 0)) * 2 >= int(snap.get("jobs", 0)) and not _prewarm_steps_done.has(85):
			_prewarm_steps_done[85] = true
			set_boot_loading(85, "아틀라스 빌드...")
		return
	if not _prewarm_steps_done.has(92):
		_prewarm_steps_done[92] = true
		set_boot_loading(92, "오디오 준비...")
	elif not _prewarm_steps_done.has(98):
		_prewarm_steps_done[98] = true
		set_boot_loading(98, "게임 시작!")
		stop_tips()

## 로비가 Main 단계 부팅을 시작할 때 부른다(원본 _startDemoNew의 showBootLoading('DEMO 로딩...')).
func begin_main_boot(owner_main: Node) -> void:
	main = owner_main
	phase = "boot"
	if not _prewarm_steps_done.has(98):
		_prewarm_steps_done[98] = true
		stop_tips()
	show_boot_loading("DEMO 로딩...", false)

func _follow_main() -> void:
	if not is_instance_valid(main) or not main.has_method("read_native_boot_stage_log"):
		return
	var log: Array = main.read_native_boot_stage_log()
	if log.is_empty():
		return
	var step: Variant = STAGE_STEPS.get(str(log[-1].get("stage", "")))
	if step is Array and (int(step[0]) != int(percent) or step[1] != message):
		set_boot_loading(float(step[0]), step[1])

## 진입 권한 직후(원본 setBootLoading(100,'완료') → hideBootLoading).
func finish_entry() -> void:
	set_boot_loading(100, "완료")
