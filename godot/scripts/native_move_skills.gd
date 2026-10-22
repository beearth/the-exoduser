extends Node2D

# UI-only showPH seam (G43609); no movement/state calculation.
signal native_show_ph(text: String, color: Color, duration_ms: int)
## PC-MOVE-SKILLS (2026-10-22) — Shift 사슬 이동(charge/harp/dash) + 방향+Space 전격이동(bladeDash)
## 원본(고정 스냅샷 godot/source_snapshot/game.html, SHA 4d911cdd…)을 원본 순서 그대로 옮긴 단일 owner.
## 계약: docs/engine/PC_MOVE_SKILLS_CONTRACT_20261022.md
##
## 원본 행 → 이 파일
##   상수·변수 G12849–12883 ............ HARP_* / dash_* / harp_* / gauge
##   keydown Shift G13225–13230 ......... _key_shift_down
##   keydown 전격이동 G13231–13249 ....... _key_blade_dash
##   keyup 발사 G13336–13372 ............ _key_shift_up
##   포커스 상실 G13373–13382 ........... clear_held_input (player _notification이 호출)
##   sticky-keys G13384–13397 ........... handle_mouse_modifier
##   프레임 앞 탈출 G32158–32160 ......... advance_pre (첫 줄)
##   게이지 회복 G32166 .................. advance_pre
##   홀드 충전·3단 자동 G32168–32196 ...... advance_pre
##   조준선 벽 자동 G32197–32228 ......... advance_pre
##   입력 딜레이 G32229–32230 ........... advance_pre
##   사슬 비행 G32232–32259 ............. advance_pre
##   끌림·경로 타격 G32261–32300 ......... advance_pre
##   착지 G32359–32507 ................... _land_chain
##   착지 후 Shift 홀드 재발사 G32508–32530 _land_chain
##   _dashIframe G32576 .................. advance_pre (끝)
##   기동게이지 최대치 G32784–32786 ...... advance_post_iframes
##   상태 무관 이동 틱 G32985 ............ advance_state
##   idle 트리거 소비 G33032–33039 ....... advance_state
##   sBlock 트리거 소비 G33747–33755 ...... advance_state
##   case 'bladeDash' G33943 ............. advance_state
##   stagger / pStun 탈출 G34330–34341 ... advance_state
##   _canBladeDash/_tickBladeDash/activateBladeDash G45342–45466
## 렌더(원본 draw):
##   Shift 게이지 머리 위 G54817–54828 ... _draw_gauge
##   착지 VFX land_fire G19338/G32377/G54575–54620
##   사슬 UI(홀드 링·예측선·단계) G59765–59787 ... _draw_hold_ui
##   사슬 비행(chain_shuriken_2) G59789–59863 ... _draw_chain
##   플레이어 포즈(dash_start/fly/land·lift·전격 squash·전기구체·잔상) G58552–58719 → player.gd가 이 owner를 읽음
##
## 1-1 데모 기본 장비(신규 런 skills: kiSlash·fireball·bladeDash·maliceSwipe·shieldThrow, activeChargeSk='charge',
## 합체 shieldFuse)에서 도달하지 않는 분기는 실행하지 않고 NOT_READY로 남긴다(UNPORTED_BRANCHES).
## 분기가 실제로 활성이면(예: chainSlash 보유) 첫 쓰기 전에 거절하고 사유를 기록한다 — 단순화 경로 폴백 없음.

const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")

# ── G12851–12883 ──
const HARP_TIER_F: Array = [0, 1, 6, 12]
const HARP_IFRAME: Array = [0, 8, 14, 24]
const HARP_PULL_DUR: Array = [0, 7, 11, 16]
const HARP_SPD := 63.0
const HARP_GAUGE_COST: Array = [0, 45, 98, 150]
const HARP_GAUGE_BASE_CELLS := 5
const HARP_DIST_BASE: Array = [0, 300, 500, 700]
const HARP_DIST_MAX: Array = [0, 500, 800, 1200]
const ELP: Array = ["#dddddd", "#ff6622", "#44aaff", "#bb55ee", "#ffee44", "#ffdd55"] # G55462
const CHAIN_DASH_KEYS: Array = ["chain_dash", "chain_dash2", "chain_dash3", "chain_dash4"]
const VOICE_MOVE_KEYS: Array = ["voice_move", "voice_move2", "voice_move3"]
const VOICE_GRUNT_KEYS: Array = ["voice_grunt", "male_grunt"]
const SFX_DIR := "res://assets/sfx/move/"
const BLADE_DASH_STEP := 250.0 / 6.0 # G45351 250/6*_bdStep
# BINDS 기본(G6188): up W / down S / left A / right D, BINDS2 전부 null. Shift 사슬은 물리 왼쪽 Shift(G13226 'ShiftLeft').
const DIR_ACTIONS: Array = ["move_up", "move_down", "move_left", "move_right"] # 0=상,1=하,2=좌,3=우 (G13234)
const UNPORTED_BRANCHES: Array = [
	"chainSlash 기동칼날개(G32250·32300–32334) — 신규 런 미보유",
	"magicBlink/dimBreach 화염 사슬·화염길(G32276–32284·32336–32342) — 미보유/미합체",
	"dimBlast 칼날개 불꽃(G32344–32350)·기동파괴/기동불꽃/기동전폭 착지(G32382–32506)·준비 입력(G32549–32575) — 미보유",
	"kiGather 사슬 변형(G33688–33699, chargeStocks) — 신규 런 chargeBoost/magicBlink 0",
	"_uqMoveRefund u_d06(G16526)·u_d07 _uChainCrowdRefund(G32366)·u_n02 _uBlinkWeak(G45426)·u_d09 _uDashCircuit(G45383) — 값>0이면 정지",
	"전설 _lBootsEvade/_lSpearStack 착지(G32372–32373) — 값>0이면 정지(소비자 미이식)",
	"전류장판 피해 틱·_shockDR 방어감소(G37413·37460–37465) — hurtE G42290 _shockDR 분기 미이식이라 NOT_READY(장판 수명·렌더만)",
	"전격의창 thunderGhost(G45395–45407) — 미합체",
	"SFX.slash/SFX.charge/SFX.magic 합성음(WebAudio 프로시저럴) — 샘플 아님, 미이식",
	"_gpVibrate 진동·G._pStats._dC 통계·_addSkProf 프로파일 — 표현/통계 소비자 부재",
	"게임패드(_gpActive) 조준·입력 주입 — 포트 키보드/마우스만"]

var _main: Node
var _world: Node2D
var _player: Node2D
var _state: Node
var _configured := false

# ── 공용 기동 게이지 G12880–12883 ──
var harp_gauge_max := float(HARP_GAUGE_BASE_CELLS * 45)
var harp_gauge := harp_gauge_max
# ── 사슬 상태 G12872–12878 ──
var dash_hold := false
var dash_hold_f := 0.0
var dash_active := false
var dash_left := 0.0
var dash_v := Vector2.ZERO
var dash_iframe := 0.0
var dash_tier := 0
var dash_phase := 0 # 0=none, 1=start, 2=fly, 3=land
var dash_land := Vector2.ZERO
var harp_active := false
var harp_pos := Vector2.ZERO
var harp_v := Vector2.ZERO
var harp_dist := 0.0
var harp_max_dist := 0.0
var harp_hit := false
var harp_tier := 0
var harp_sk := "charge"
var harp_hits: Array = []
var harp_land_t := 0.0
var chain_sk_delay := 0.0 # P._chainSkDelay
# ── 전격이동 P._bdTrigger/_bdLastDir/_bdLastT/_bdMoveT/_bdAng/_preBdState ──
var bd_trigger: Variant = null
var bd_last_dir := -1
var bd_last_t := 0.0
var bd_move_t := 0.0
var bd_ang := 0.0
var pre_bd_state: Variant = null
var bd_st2 := 0.0 # P.st2 (bladeDash 상태일 때만 의미) — squash 렌더 입력
# ── 입력 K/KH (원본 keydown/keyup 맵 중 이 owner가 읽는 키만) ──
var _k: Dictionary = {}
var _kh: Dictionary = {}
var clock_ms: Callable = Callable() # 테스트 주입 가능(기본 Time.get_ticks_usec) — performance.now() 대응

# ── 렌더 상태 ──
var _land_vfx: Array = [] # {pos, frame, t}
var _trail: Array = [] # 잔상 스냅샷(G58713–58716)
var _shock_visual: Array = [] # shockField 렌더 보조(_spr/_thunder) — 장판 dict는 G._fireZones
var _chain_tex: Texture2D
var _land_tex: Texture2D
var _font: Font
var _visual_rng := RandomNumberGenerator.new() # 원본 Math.random 표현 전용 위치(사운드 선택·파티클·피치)
var _audio_rng := RandomNumberGenerator.new()

# ── 관측 ──
var log_rows: Array = []
var counters := {"chain_fired": 0, "chain_landed": 0, "chain_hits": 0, "blade_dash": 0, "blade_dash_landed": 0,
	"cancel": 0, "hurte_halts": 0, "unported_refusals": 0, "shock_fields": 0}
var last_refusal := ""

func configure(main: Node, world: Node2D, player: Node2D, state: Node) -> bool:
	if _configured or not is_instance_valid(main) or not is_instance_valid(world) or not is_instance_valid(player) or not is_instance_valid(state):
		return false
	_main = main
	_world = world
	_player = player
	_state = state
	z_index = 9 # 플레이어(z0)보다 위: 원본 사슬 UI·비행 렌더는 플레이어 뒤에 그린다(G59765 > G58600)
	_visual_rng.seed = 20261022
	_audio_rng.seed = 20261023
	if ResourceLoader.exists("res://assets/vfx/chain_shuriken_2.webp"):
		_chain_tex = load("res://assets/vfx/chain_shuriken_2.webp")
	if ResourceLoader.exists("res://assets/vfx/vfx_landing_fire.png"):
		_land_tex = load("res://assets/vfx/vfx_landing_fire.png")
	# 원본 'bold 22px/36px sans-serif'(G54820·G59784): Windows Chrome의 sans-serif=Arial, 한글은 Malgun Gothic 대체.
	var sys_font := SystemFont.new()
	sys_font.font_names = PackedStringArray(["Arial", "Malgun Gothic", "sans-serif"])
	sys_font.font_weight = 700
	sys_font.antialiasing = TextServer.FONT_ANTIALIASING_GRAY
	_font = sys_font
	_storm_tex = [_load_storm("res://assets/vfx/Lightning_ImpactLightning_Sheet.png"), _load_storm("res://assets/vfx/Lightning_Lightning_FBF_4x3.png"),
		_load_storm("res://assets/vfx/Lightning_BasicImpact.png")]
	z_as_relative = false
	_under = Layer.new()
	_under.host = self
	_under.kind = "under"
	_under.z_as_relative = false
	add_child(_under)
	_under_add = Layer.new()
	_under_add.host = self
	_under_add.kind = "under_add"
	_under_add.z_as_relative = false
	var add_material := CanvasItemMaterial.new()
	add_material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD # registerVFX 기본 blend 'lighter'
	_under_add.material = add_material
	add_child(_under_add)
	# 전류장판 악의폭풍 스프라이트(G19625–19628 _tintImg: source-atop 틴트 + luminosity 원본 → G55938 'lighter')
	_storm_layer = Layer.new()
	_storm_layer.host = self
	_storm_layer.kind = "storm"
	_storm_layer.z_as_relative = false
	var storm_material := ShaderMaterial.new()
	var storm_shader := Shader.new()
	storm_shader.code = STORM_SHADER
	storm_material.shader = storm_shader
	_storm_layer.material = storm_material
	add_child(_storm_layer)
	_configured = true
	return true

## 그리기 층(웹 1x 캡처 실측 기준): 장판 번개 기둥(G55931)·전격 구체(G58552)·잔상(G58654) = 플레이어 본체 아래(under),
## 악의폭풍 스프라이트(G55938 lighter) = 본체 아래 가산(storm), land_fire VFX 시트(G54575 GL 인스턴싱) = 본체 위 가산(under_add),
## 사슬 UI(G59765)·사슬 비행(G59789)·머리 위 게이지(G54817) = 본체 위(over, 이 노드).
class Layer extends Node2D:
	var host: Node
	var kind := ""
	func _draw() -> void:
		if is_instance_valid(host):
			host._draw_layer(self, kind)

var _under: Node2D
var _under_add: Node2D
var _storm_layer: Node2D
var _storm_tex: Array = []
const STORM_TINTS: Array = ["#6644ff", "#7733ff", "#5566ff"]
## _tintImg 합성을 한 패스로: 정점색 rgb=틴트, a=globalAlpha. canvas 단계(원본 이미지→source-atop 틴트 채움→
## luminosity로 원본 재합성)의 premultiplied 결과를 'lighter'(가산)로 더한다.
const STORM_SHADER := """shader_type canvas_item;
render_mode blend_premul_alpha;
float lum(vec3 c){ return 0.3*c.r + 0.59*c.g + 0.11*c.b; }
vec3 clip_color(vec3 c){
	float l = lum(c); float n = min(min(c.r, c.g), c.b); float x = max(max(c.r, c.g), c.b);
	if (n < 0.0) c = l + (c - l) * l / max(l - n, 1e-6);
	if (x > 1.0) c = l + (c - l) * (1.0 - l) / max(x - l, 1e-6);
	return c;
}
vec3 set_lum(vec3 c, float l){ return clip_color(c + (l - lum(c))); }
void fragment(){
	vec4 src = texture(TEXTURE, UV);
	float a = src.a;
	vec3 tint = COLOR.rgb;
	vec3 b = set_lum(tint, lum(src.rgb));
	vec3 co = a * (1.0 - a) * src.rgb + a * a * b + (1.0 - a) * a * tint;
	COLOR = vec4(co * COLOR.a, 0.0); // premultiplied + alpha 0 = 순수 가산(lighter)
}
"""

func _load_storm(path: String) -> Texture2D:
	if ResourceLoader.exists(path):
		return load(path)
	# 미-import 원본 PNG(포트 신규 에셋): import 없이 바이트에서 직접 — 내보낸 빌드에선 없으면 층 생략
	var bytes: PackedByteArray = FileAccess.get_file_as_bytes(path)
	if bytes.is_empty(): return null
	var img := Image.new()
	if img.load_png_from_buffer(bytes) != OK: return null
	return ImageTexture.create_from_image(img)

func _process(delta: float) -> void:
	if not _configured or not is_instance_valid(_player):
		return
	var z: int = _player.z_index
	_under.z_index = z
	_under_add.z_index = clampi(z + 1, -4096, 4095)
	_storm_layer.z_index = z
	z_index = clampi(z + 1, -4096, 4095)
	sync_render()

## 렌더 시계: 원본은 draw()마다 _dtSp(=1)씩 감소(_harpLandT G58590·VFX v.t G54580·번개 th.life G55978) — 60Hz에서 틱당 1.
## 포트는 world 원본 시계 증가분으로 진행해 같은 틱에 렌더가 여러 번 불려도 중복 감소하지 않는다(player 표시 시계와 같은 방식).
var _render_clock := -1.0
func sync_render() -> void:
	var now: float = _world.get_native_frame() if is_instance_valid(_world) else 0.0
	if _render_clock < 0.0:
		_render_clock = now
	var ticks: float = maxf(0.0, now - _render_clock)
	_render_clock = now
	advance_render(ticks)

func is_configured() -> bool:
	return _configured

func _now_ms() -> float:
	return float(clock_ms.call()) if clock_ms.is_valid() else float(Time.get_ticks_usec()) / 1000.0

# ═══════════════════════════ 입력 ═══════════════════════════

## player.handle_native_input_event가 키 이벤트마다 먼저 호출. 반환 consumed=true면 player는 그 이벤트를
## 처리 완료(set_input_as_handled)로 끝낸다. 방향키는 트리거만 세우고 소비하지 않는다(원본: K/KH는 이미 세팅됨).
func handle_key(event: InputEventKey, lesson_blocks: Callable) -> Dictionary:
	if not _configured:
		return {"consumed": false}
	var code: String = _code_of(event)
	if code.is_empty():
		return {"consumed": false}
	if event.pressed:
		# G13208 allowKey: 레슨이 막는 키는 K/KH도 세우지 않는다.
		var action: String = {"ShiftLeft": "charge", "Space": "rage_slot", "KeyW": "move_up", "KeyS": "move_down", "KeyA": "move_left", "KeyD": "move_right"}.get(code, "")
		if lesson_blocks.is_valid() and not action.is_empty() and lesson_blocks.call(action):
			return {"consumed": code == "ShiftLeft", "reason": "parry_lesson_input_locked"}
		_k[code] = true
		_kh[code] = true
		var repeat: bool = event.echo
		if code == "ShiftLeft":
			_key_shift_down(repeat)
			return {"consumed": true}
		var consumed: bool = _key_blade_dash(code, repeat)
		return {"consumed": consumed}
	# keyup G13330: K/KH 해제 후 Shift 발사 판정 (원본 keyup에는 G.on 가드 없음)
	_k[code] = false
	_kh[code] = false
	if code == "ShiftLeft":
		_key_shift_up()
		return {"consumed": true}
	return {"consumed": false}

func _code_of(event: InputEventKey) -> String:
	var key: int = event.physical_keycode if event.physical_keycode != 0 else event.keycode
	match key:
		KEY_SHIFT:
			# 원본은 e.code==='ShiftLeft'만 사슬. 위치 미지정(주입 이벤트)은 왼쪽으로 본다.
			return "ShiftRight" if event.location == KEY_LOCATION_RIGHT else "ShiftLeft"
		KEY_SPACE: return "Space"
		KEY_W: return "KeyW"
		KEY_S: return "KeyS"
		KEY_A: return "KeyA"
		KEY_D: return "KeyD"
	return ""

func _game_on() -> bool:
	if not is_inside_tree() or get_tree().paused:
		return false
	var g: Variant = _state.read_current_g()
	return g is Dictionary and g.get("on") == true

func _p_state() -> String:
	return str(_player.get("state"))

## G13226–13230
func _key_shift_down(repeat: bool) -> void:
	if not (_game_on() and not repeat and _p_state() != "fallen" and _p_state() != "dead"):
		return
	if harp_active or dash_active:
		harp_active = false; dash_active = false; dash_hold = false; dash_left = 0.0; dash_tier = 0
		dash_v = Vector2.ZERO; dash_phase = 0
		# P._chainSlamReady/_chainAssaultReady=false — 미보유 분기(항상 false)
		_text(_player.global_position + Vector2(0, -20), "캔슬", "#ff6666", 20)
		_sample("ui_cancel", 0.4, 1.0) # playSample('ui_cancel',.4,1) — 원본·포트 모두 ui_cancel 샘플 파일 없음(무음)
		counters.cancel += 1
		_log("cancel", {})
	elif not dash_hold and harp_gauge > 0.0:
		dash_hold = true; dash_hold_f = 0.0; dash_tier = 0
		_log("hold_start", {"gauge": harp_gauge})
	elif not dash_hold and harp_gauge <= 0.0:
		native_show_ph.emit("충전 중...", Color("ff8844"), 500) # G13229 showPH

## G13231–13249
func _key_blade_dash(code: String, repeat: bool) -> bool:
	if not (_game_on() and not repeat and _p_state() != "fallen" and _p_state() != "dead"):
		return false
	var skills: Dictionary = _skills()
	if not (float(skills.get("bladeDash", 0)) >= 1.0):
		return false
	var dirs := {"KeyW": 0, "KeyS": 1, "KeyA": 2, "KeyD": 3}
	if dirs.has(code):
		var dir: int = dirs[code]
		# 1) 방향키+스페이스 동시
		if _kh.get("Space", false):
			bd_trigger = dir
			_k["Space"] = false
			_kh["Space"] = false
			_log("bd_trigger", {"dir": dir, "via": "dir_while_space"})
			return false # 원본 return — K[dir]/KH[dir]은 이미 세팅(이동 입력은 player가 계속 받는다)
		# 2) 더블탭 (250ms 이내 같은 방향키 2번)
		var now: float = _now_ms()
		if bd_last_dir == dir and now - bd_last_t < 250.0:
			bd_trigger = dir; bd_last_dir = -1; bd_last_t = 0.0
			_log("bd_trigger", {"dir": dir, "via": "double_tap"})
		else:
			bd_last_dir = dir; bd_last_t = now
	# 스페이스 눌렀을 때 방향키 이미 눌려있으면 (사슬기동 중 제외)
	if code == "Space" and not (harp_active or dash_active):
		for key in ["KeyW", "KeyS", "KeyA", "KeyD"]: # Object.entries(_bdDirs) 순서 = up,down,left,right
			if _direction_held(key):
				bd_trigger = dirs[key]
				_k["Space"] = false
				_log("bd_trigger", {"dir": dirs[key], "via": "space_while_dir"})
				return true # 원본 return — Space 슬롯(G13284) 디스패치 없음
	return false

func _direction_held(code: String) -> bool:
	# KH[code] — player funnel이 받은 방향 입력(레슨 차단 포함)과 같은 원천
	var held: Dictionary = _player.get_native_input_snapshot().get("held", {})
	var action: String = {"KeyW": "move_up", "KeyS": "move_down", "KeyA": "move_left", "KeyD": "move_right"}[code]
	return held.get(action, false) == true or _kh.get(code, false) == true

## isAct('left') 등 (G14290) — 방향 행동은 레슨 practice 중 허용(allows: phase!=intro && isDirection)
func _is_act_dir(action: String) -> bool:
	var held: Dictionary = _player.get_native_input_snapshot().get("held", {})
	return held.get(action, false) == true

## G13336–13371
func _key_shift_up() -> void:
	if dash_hold and (harp_active or dash_active):
		dash_hold = false; dash_hold_f = 0.0; dash_tier = 0
	if dash_hold and not harp_active and not dash_active:
		dash_hold = false
		if dash_hold_f >= HARP_TIER_F[3]: dash_tier = 3
		elif dash_hold_f >= HARP_TIER_F[2]: dash_tier = 2
		else: dash_tier = 1
		_fire_chain("release", dash_tier, _aim_angle())
		dash_tier = 0

## 4개 발사 지점(keyup / 3단 자동 / 벽 자동 / 착지 재발사)의 공통 본문. 지점별 차이:
##  release: 단계=홀드, 대사(40% voice_move / 60% grunt)+'⛓️ 사슬!' 텍스트
##  auto3: 단계3, 텍스트만 · wall: 조준선 벽, 텍스트/대사 없음 · refire: 단계3, 텍스트/대사 없음
func _fire_chain(site: String, tier: int, dir: float) -> bool:
	var g_cost: float = minf(harp_gauge, float(HARP_GAUGE_COST[tier]))
	var p: Dictionary = _p()
	if p.is_empty():
		return _refuse("fire_p_not_ready:" + site)
	var st_cost: float = float(p.get("mst", 0)) * 0.01 * float(tier)
	var unported: String = _unported_chain_branch(p)
	if not unported.is_empty():
		return _refuse("unported_branch_active:" + unported) # 첫 쓰기(게이지·ST) 전 거절 — 단순화 경로 폴백 없음
	if not (g_cost > 0.0 and float(_player.get("stamina")) >= st_cost):
		_log("fire_gate_refused", {"site": site, "tier": tier, "gauge": harp_gauge, "st": _player.get("stamina"), "st_cost": st_cost})
		return false
	var spend: Dictionary = _spend(st_cost, 0.0)
	if spend.get("accepted") != true:
		return _refuse("fire_st_spend_rejected:" + str(spend.get("reason")))
	harp_gauge -= g_cost
	# _uqMoveRefund(_gCost) G16526: _uqS.warpT<=0이면 즉시 return — 시간왜곡(유니크 시간 스킬) 미보유로 warpT 항상 0
	var h_sk: String = str(p.get("activeChargeSk")) if _js_truthy(p.get("activeChargeSk")) else "charge"
	harp_active = true; harp_hit = false; harp_land_t = 0.0; harp_tier = tier; dash_phase = 1
	harp_sk = h_sk # isDimBreach()=false (미합체)
	harp_hits = []
	chain_sk_delay = 3.0
	harp_pos = _player.global_position
	harp_v = Vector2(cos(dir) * HARP_SPD, sin(dir) * HARP_SPD)
	harp_dist = 0.0
	harp_max_dist = _harp_available_dist(tier, g_cost, p)
	if site != "release":
		dash_hold = false; dash_hold_f = 0.0; dash_tier = 0
	_sample("chain_throw", 0.7, _r(1.0, 0.12))
	_sample("chain_fly", 0.5, _r(1.0, 0.1))
	# SFX.slash() — 합성음 미이식
	_sample(CHAIN_DASH_KEYS[int(_audio_rng.randf() * 4.0)], 0.6, _r(1.0, 0.1))
	if site == "release":
		if _audio_rng.randf() < 0.4:
			_sample(VOICE_MOVE_KEYS[int(_audio_rng.randf() * 3.0)], 1.0, _r(1.0, 0.08))
		else:
			_sample(VOICE_GRUNT_KEYS[int(_audio_rng.randf() * 2.0)], 1.0, _r(1.0, 0.15))
	if site == "release" or site == "auto3":
		_text(_player.global_position + Vector2(0, -25), "⛓️ 사슬!", "#ffaa00", 35)
	counters.chain_fired += 1
	_log("chain_fire", {"site": site, "tier": tier, "g_cost": g_cost, "st_cost": st_cost, "dir": dir, "max_dist": harp_max_dist,
		"x": harp_pos.x, "y": harp_pos.y, "gauge_after": harp_gauge})
	return true

## 사슬 발사 이후 원본이 실행할 미이식 분기(1-1 신규 런에는 없음): 기동칼날개 G32250, 화염 사슬 G32276(magicBlink/dimBreach),
## 기동불꽃/기동파괴 입력 G32549–32568, 기동전폭 G32570(dimBlast 합체)
func _unported_chain_branch(p: Dictionary) -> String:
	var skills: Dictionary = p.get("skills", {}) if p.get("skills") is Dictionary else {}
	for sk in ["chainSlash", "chainAssault", "chainSlam"]:
		if _num(skills.get(sk)) >= 1.0: return sk
	if str(p.get("activeChargeSk")) == "magicBlink": return "magicBlink"
	var fused: Dictionary = p.get("_fused", {}) if p.get("_fused") is Dictionary else {}
	for f in ["dimBreach", "dimBlast"]:
		if _js_truthy(fused.get(f)): return f
	return ""

## G12854–12866
func _harp_dist_tier(tier: int, p: Dictionary) -> int:
	var skills: Dictionary = p.get("skills", {}) if p.get("skills") is Dictionary else {}
	var lv: float = maxf(_num(skills.get("chargeBoost")), _num(skills.get("magicBlink")))
	if tier <= 0: return 0
	var t: int = mini(tier, 3)
	var range_mul: float = _p_charge_range()
	if lv <= 0.0: return int(float(HARP_DIST_BASE[t]) * range_mul)
	if lv >= 10.0: return int(float(HARP_DIST_MAX[t]) * range_mul)
	return int((float(HARP_DIST_BASE[t]) + float(HARP_DIST_MAX[t] - HARP_DIST_BASE[t]) * (lv - 1.0) / 9.0) * range_mul)

func _harp_available_dist(tier: int, gauge: float, p: Dictionary) -> float:
	return float(_harp_dist_tier(tier, p)) * minf(1.0, maxf(0.0, gauge) / float(HARP_GAUGE_COST[tier]))

# ═══════════════════════════ 프레임 ═══════════════════════════

## player._physics_process 첫머리(iframes 감소 전)에서 1회. 원본 S16b PLAYER_ACT G32155–32576.
func advance_pre(sp: float) -> void:
	if not _configured or not (sp > 0.0):
		return
	var state: String = _p_state()
	var p_dead: bool = state == "fallen" or state == "dead" or state == "pStun"
	# G32158 전격이동 탈출: 경직/상태이상 중에도 발동 (P._seaParalyzed 미이식=0)
	if not p_dead and bd_trigger != null and _can_blade_dash():
		activate_blade_dash(int(bd_trigger))
		bd_trigger = null
	# G32166 사슬 게이지 자동 회복 (레슨 chapter2 제외)
	if not p_dead and not _lesson_chapter2():
		if harp_gauge < harp_gauge_max and not dash_hold and not harp_active and not dash_active:
			var p: Dictionary = _p()
			if not p.is_empty():
				var cb: float = _num((p.get("skills", {}) as Dictionary).get("chargeBoost")) if p.get("skills") is Dictionary else 0.0
				var regen: float = harp_gauge_max * 0.025 / 60.0 * (1.0 + cb * 0.05) * _p_charge_gauge()
				harp_gauge = minf(harp_gauge_max, harp_gauge + regen * sp)
	# G32168 사슬 홀드 차징
	if not p_dead and dash_hold and dash_hold_f < 120.0:
		dash_hold_f += 1.0
		if dash_hold_f >= HARP_TIER_F[3]: dash_tier = 3
		elif dash_hold_f >= HARP_TIER_F[2]: dash_tier = 2
		else: dash_tier = 1
		# G32174 최고 티어 도달 시 자동 발사
		if dash_tier >= 3 and not harp_active and not dash_active:
			_fire_chain("auto3", 3, _aim_angle())
		# G32198 조준선 벽 감지 → 자동 발사
		if dash_tier >= 1 and not harp_active and not dash_active:
			var aw_dir: float = _aim_angle()
			var aw: Vector2 = Vector2(cos(aw_dir), sin(aw_dir))
			var p2: Dictionary = _p()
			var aw_max: float = _harp_available_dist(dash_tier, harp_gauge, p2) if not p2.is_empty() else 0.0
			var aw_wall := false
			var awd := 16.0
			while awd <= aw_max:
				if not _can_mv_blink(_player.global_position + aw * awd, 2.0):
					aw_wall = true
					break
				awd += 16.0
			if aw_wall:
				_fire_chain("wall", dash_tier, aw_dir)
	# G32229 사슬기동 입력 딜레이
	if (harp_active or dash_active) and chain_sk_delay > 0.0:
		chain_sk_delay -= sp
	# G32231 사슬 비행 중
	if harp_active and not harp_hit:
		var step: float = minf(sp, maxf(0.0, harp_max_dist - harp_dist) / HARP_SPD)
		harp_pos += harp_v * step
		harp_dist = minf(harp_max_dist, harp_dist + HARP_SPD * step)
		# 적 히트 없음 — 사슬은 바닥에만 꽂힘
		if not harp_hit and harp_dist >= harp_max_dist:
			if not _can_mv_blink(harp_pos, 2.0):
				harp_pos -= harp_v * 2.0
			harp_hit = true
			_sample("chain_stick", 0.8, _r(1.0, 0.1))
			_log("chain_stick", {"x": harp_pos.x, "y": harp_pos.y, "dist": harp_dist})
		# 꽂힘 → 플레이어 끌어당기기 시작
		if harp_hit and not dash_active:
			dash_active = true
			dash_iframe = float(HARP_IFRAME[harp_tier])
			dash_phase = 2
			_player.set("poise", 4) # P.poise=4 탈출기 poise 풀회복
			# G32250 기동칼날개 자동 활성 — chainSlash 미보유(0)면 원본도 미진입
			var hd: float = _player.global_position.distance_to(harp_pos)
			var dur: float = float(HARP_PULL_DUR[harp_tier])
			dash_left = dur
			if hd > 0.0:
				dash_v = (harp_pos - _player.global_position) / hd * (hd / dur)
			else:
				dash_v = Vector2.ZERO
				dash_left = 0.0
			dash_land = harp_pos
			_parts(harp_pos, "#aaaaaa", 4)
	# G32261 플레이어 끌려가는 중 — 무적 + 경로 적 히트
	if dash_active:
		_player.set("iframes", maxf(float(_player.get("iframes")), 2.0))
		var dash_step: float = minf(sp, maxf(0.0, dash_left))
		var n: Vector2 = _player.global_position + dash_v * dash_step
		if _can_mv_blink(n, float(_player.get("radius"))):
			_player.global_position = n
		else:
			dash_left = 0.0
		_dash_path_hits()
		dash_left -= dash_step
		if dash_left <= 0.0:
			_land_chain()
	# G32582 _dashIframe
	if dash_iframe > 0.0:
		_player.set("iframes", maxf(float(_player.get("iframes")), 1.0))
		dash_iframe -= 1.0
	if not _shock_visual.is_empty():
		_tick_shock_particles()

## G32270–32299 경로상 적 히트 (STR 분기: activeChargeSk='charge')
func _dash_path_hits() -> void:
	if harp_sk == "magicBlink" or harp_sk == "dimBreach":
		_refuse("unported_branch_active:magicBlink_fire_chain_32276")
		return
	var pos: Vector2 = _player.global_position
	var candidates: Array = _world.query_native_enemies(pos.x, pos.y, 40.0) # shQuery(P,40) — 칼날개 없음
	if probe_on:
		var row: Array = []
		for e in candidates:
			if is_instance_valid(e):
				row.append({"id": e.get_instance_id(), "x": e.global_position.x, "y": e.global_position.y,
					"r": float(e.get("radius")) if "radius" in e else 15.0, "alive": e.get("alive") == true})
		probe.shq.append(row)
	for e in candidates:
		if not is_instance_valid(e) or e.get("alive") != true or harp_hits.has(e):
			continue
		var er: float = float(e.get("radius")) if "radius" in e else 15.0
		if pos.distance_to(e.global_position) > er + 20.0:
			continue
		harp_hits.append(e)
		var ang: float = atan2(e.global_position.y - pos.y, e.global_position.x - pos.x)
		var dmg_info: Dictionary = _chain_damage()
		if dmg_info.get("ready") != true:
			_refuse("chain_damage_not_ready:" + str(dmg_info.get("reason")))
			continue
		if not e.has_method("read_native_normal_enemy_hurte_fields"):
			_refuse("enemy_without_hurte_owner")
			continue
		var outcome: Dictionary = NORMAL_HURTE.new().execute(_main, _world, e, int(dmg_info.dmg), ang, int(dmg_info.el),
			{"kbMult": 2.0, "poiseHit": true, "poiseMult": 2.0})
		outcome["source"] = "chainDash"
		outcome["enemy_id"] = e.get_instance_id()
		outcome["base_damage"] = int(dmg_info.dmg)
		if outcome.get("ok") != true:
			counters.hurte_halts += 1
		if _player.has_signal("telemetry_event"):
			_player.telemetry_event.emit("native_hurte", outcome)
		if is_instance_valid(e) and e.has_method("add_native_knockback"):
			e.add_native_knockback(Vector2(cos(ang), sin(ang)) * 25.0) # e.kb+=cos/sin×25
		_text(e.global_position + Vector2(0, -18), "🔱 관통!", "#ffaa00", 30)
		var col: String = ELP[int(dmg_info.el)] if int(dmg_info.el) >= 0 and int(dmg_info.el) < ELP.size() else ELP[0]
		for j in range(8):
			var a: float = TAU * float(j) / 8.0
			_pool_part(e.global_position, Vector2(cos(a) * 5.0, sin(a) * 5.0), col, 3.0 + _visual_rng.randf() * 3.0, 14.0)
		# G.hitStop=~~(3×OPT.hitStop/100) — 32585 히트스톱 비활성으로 즉시 0. G.shake=4×OPT.shake/100 (대입)
		_shake_assign(4.0)
		counters.chain_hits += 1
		_log("chain_hit", {"enemy": e.get_instance_id(), "dmg": dmg_info.dmg, "el": dmg_info.el, "ang": ang, "ok": outcome.get("ok"),
			"hp_after": e.get("hp") if is_instance_valid(e) else null, "dmg_to_hp": outcome.get("dmg_to_hp"),
			"shield_before": outcome.get("shield_before"), "shield_after": outcome.get("shield_after"), "halted_at": outcome.get("halted_at"), "reason": outcome.get("reason")})

## _cDmg G32290: ~~(((ar().charge||10)+P.baseAtk)×_cbMul×statStr()×(1+_eqAffix('dashBoost')))
func _chain_damage() -> Dictionary:
	var p: Dictionary = _p()
	if p.is_empty(): return {"ready": false, "reason": "p"}
	var inv: Variant = _state.read_current_inventory()
	if not inv is Dictionary or not inv.get("equipped") is Dictionary: return {"ready": false, "reason": "inventory"}
	var armor: Variant = inv.equipped.get("armor")
	if not _js_truthy(armor) or not armor is Dictionary: armor = {}
	var charge: Variant = armor.get("charge")
	var charge_v: float = float(charge) if _js_truthy(charge) and (charge is int or charge is float) else 10.0
	var skills: Dictionary = p.get("skills", {}) if p.get("skills") is Dictionary else {}
	var cb_lv: float = _num(skills.get("chargeBoost"))
	var cb_mul: float = 1.5 + (cb_lv - 1.0) * 0.25 if cb_lv >= 1.0 else 1.0
	var dash_boost: Dictionary = _eq_affix("dashBoost")
	if not str(dash_boost.get("status")).begins_with("READY"): return {"ready": false, "reason": "dashBoost"}
	var base_atk: float = _num(p.get("baseAtk"))
	var dmg: int = FORMULA.js_to_int32((charge_v + base_atk) * cb_mul * 1.0 * (1.0 + float(dash_boost.value)))
	var el: Variant = armor.get("el")
	return {"ready": true, "dmg": dmg, "el": int(el) if el is int or el is float else 0, "charge": charge_v, "base_atk": base_atk}

## G32359–32530 착지
func _land_chain() -> void:
	dash_active = false; harp_active = false; dash_hold = false; dash_hold_f = 0.0; dash_phase = 3
	_player.set("iframes", maxf(float(_player.get("iframes")), 48.0)) # 착지 0.8초 무적
	harp_land_t = 30.0
	# u_d07 _uChainCrowdRefund (3단·3명 이상) — 값 0이면 원본도 미진입
	if harp_tier >= 3 and harp_hits.size() >= 3 and _unique_value("_uChainCrowdRefund") > 0.0:
		_refuse("unported_branch_active:u_d07_chain_crowd_refund")
	if _legendary_value("_lBootsEvade") > 0.0 or _legendary_value("_lSpearStack") > 0.0:
		_refuse("unported_branch_active:legendary_landing_32372")
	# 착지 효과
	if harp_tier >= 3: _sample("chain_land2", 0.7, _r(1.0, 0.1))
	else: _sample("chain_land", 1.0, _r(1.0, 0.1))
	# !isDimBreach() — 미합체 → 항상 진입
	_shake(30.0 if harp_tier >= 3 else (20.0 if harp_tier >= 2 else 10.0))
	_parts(_player.global_position, "#ffaa44", 8)
	_text(_player.global_position + Vector2(0, -20), "💥 착지!", "#ffaa00", 30)
	_land_vfx.append({"pos": _player.global_position + Vector2(0, float(_player.get("radius"))), "frame": 0, "t": 0.0})
	counters.chain_landed += 1
	_log("chain_land", {"x": _player.global_position.x, "y": _player.global_position.y, "tier": harp_tier, "hits": harp_hits.size()})
	dash_tier = 0; harp_tier = 0; harp_hits = []
	# G32509 Shift 홀드 연속 발사
	var state: String = _p_state()
	if _kh.get("ShiftLeft", false) and state != "fallen" and state != "dead":
		_fire_chain("refire", 3, _aim_angle())

## G32784–32786 (iframes 감소 G32775 다음): 기동게이지 칸 수·최대치 재계산
func advance_post_iframes() -> void:
	if not _configured:
		return
	var extra: Dictionary = _eq_affix("extraST")
	var extra_v: float = float(extra.value) if str(extra.get("status")).begins_with("READY") else 0.0
	# G32780–32784: _hasChargeSk=chargeBoost≥1‖magicBlink≥1, 칸 = dimRush 10 / dimThunder 9 / dimBreach 7 / chargeSk 6 / 기본 5
	var cells: int = HARP_GAUGE_BASE_CELLS
	var p: Dictionary = _p()
	if not p.is_empty():
		var skills: Dictionary = p.get("skills", {}) if p.get("skills") is Dictionary else {}
		var fused: Dictionary = p.get("_fused", {}) if p.get("_fused") is Dictionary else {}
		var has_charge_sk: bool = _num(skills.get("chargeBoost")) >= 1.0 or _num(skills.get("magicBlink")) >= 1.0
		cells = 10 if _js_truthy(fused.get("dimRush")) else (9 if _js_truthy(fused.get("dimThunder")) else (7 if _js_truthy(fused.get("dimBreach")) else (6 if has_charge_sk else HARP_GAUGE_BASE_CELLS)))
	harp_gauge_max = float(cells * HARP_GAUGE_COST[1]) + float(int(extra_v))
	harp_gauge = minf(harp_gauge, harp_gauge_max)

## G32985 + switch(P.s) 소비 지점. player 이동(move_and_slide) 전.
func advance_state(sp: float) -> String:
	if not _configured or not (sp > 0.0):
		return _p_state() if is_instance_valid(_player) else ""
	var state: String = _p_state()
	# G32985 E 충전/릴리즈와 칼날이동은 독립 진행. 사망·기절 시 남은 이동 폐기.
	if state != "bladeDash" and bd_move_t > 0.0:
		if float(_player.get("hp")) <= 0.0 or state == "fallen" or state == "dead" or state == "pStun":
			bd_move_t = 0.0
			pre_bd_state = null
		else:
			_tick_blade_dash(sp)
	state = _p_state()
	_state_at_switch = state # switch(P.s) G32987 — case 선택 시점의 상태
	match state:
		"bladeDash":
			_tick_blade_dash(sp) # G33943
		"stagger":
			# G34333 탈출기: Shift(사슬) — isJust('charge')||(K.ShiftLeft&&(hold||harp||dash))
			if _is_just_charge() or (_k.get("ShiftLeft", false) and (dash_hold or harp_active or dash_active)):
				_player.call("apply_native_move_skill_escape", "stagger")
				_log("escape", {"from": "stagger"})
			elif bd_trigger != null and _can_blade_dash():
				_player.call("apply_native_move_skill_escape", "stagger_blade")
				activate_blade_dash(int(bd_trigger))
				bd_trigger = null
		"pStun":
			# G34341
			if _is_just_charge() or (_k.get("ShiftLeft", false) and (dash_hold or harp_active or dash_active)):
				_player.call("apply_native_move_skill_escape", "pStun")
				_log("escape", {"from": "pStun"})
			elif bd_trigger != null and _can_blade_dash():
				_player.call("apply_native_move_skill_escape", "pStun_blade")
				activate_blade_dash(int(bd_trigger))
				bd_trigger = null
	return _state_at_switch

## idle(G33032 — 같은 case의 보행 G33022–33027 뒤) / sBlock(G33747) 트리거 소비. player move_and_slide 뒤 호출.
var _state_at_switch := ""
func advance_state_after_move() -> void:
	if not _configured:
		return
	var state: String = _state_at_switch
	_state_at_switch = ""
	if state == "idle" or state == "sBlock":
		_consume_trigger_with_toast()

func _is_just_charge() -> bool:
	# isJust('charge') G14291 — K[ShiftLeft] 소비
	if _k.get("ShiftLeft", false):
		_k["ShiftLeft"] = false
		return true
	return false

func _consume_trigger_with_toast() -> void:
	if bd_trigger == null:
		return
	if _can_blade_dash():
		activate_blade_dash(int(bd_trigger))
	elif harp_gauge < float(HARP_GAUGE_COST[1]) * 7.0 / 10.0:
		native_show_ph.emit("충전 중...", Color("ff8844"), 500)
	else:
		native_show_ph.emit("MP 부족!", Color("4444ff"), 500)
	bd_trigger = null

## G45343
func _can_blade_dash() -> bool:
	var p: Dictionary = _p()
	if p.is_empty(): return false
	var skills: Dictionary = p.get("skills", {}) if p.get("skills") is Dictionary else {}
	var lv: float = _num(skills.get("bladeDash"))
	if not (lv >= 1.0): return false
	var lv_or1: float = lv if _js_truthy(skills.get("bladeDash")) else 1.0
	return harp_gauge >= float(HARP_GAUGE_COST[1]) * 7.0 / 10.0 and _num(p.get("mp")) >= (10.0 + (lv_or1 - 1.0) * 5.0) * 7.0 / 10.0

## G45418–45466
func activate_blade_dash(dir: int) -> void:
	var bd_dx := 0.0
	var bd_dy := 0.0
	if dir == 0: bd_dy = -1.0
	elif dir == 1: bd_dy = 1.0
	elif dir == 2: bd_dx = -1.0
	else: bd_dx = 1.0
	if dir == 0 or dir == 1:
		if _is_act_dir("move_left"): bd_dx = -1.0
		elif _is_act_dir("move_right"): bd_dx = 1.0
	if dir == 2 or dir == 3:
		if _is_act_dir("move_up"): bd_dy = -1.0
		elif _is_act_dir("move_down"): bd_dy = 1.0
	var ang: float = atan2(bd_dy, bd_dx)
	var p: Dictionary = _p()
	if p.is_empty():
		_refuse("blade_dash_p_not_ready")
		return
	var skills: Dictionary = p.get("skills", {}) if p.get("skills") is Dictionary else {}
	var lv: float = _num(skills.get("bladeDash")) if _js_truthy(skills.get("bladeDash")) else 1.0
	var bd_cost: float = (10.0 + (lv - 1.0) * 5.0) * 7.0 / 10.0
	var gauge_cost: float = float(HARP_GAUGE_COST[1]) * 7.0 / 10.0
	if _num(p.get("mp")) < bd_cost or harp_gauge < gauge_cost:
		return
	var bd_fused: Dictionary = p.get("_fused", {}) if p.get("_fused") is Dictionary else {}
	if _js_truthy(bd_fused.get("thunderGhost")) and _num(skills.get("thunderStake")) >= 1.0:
		_refuse("unported_branch_active:thunderGhost_45395") # 전격의창 합체 착지 뇌전창 — 첫 쓰기 전 거절
		return
	if _unique_value("_uBlinkWeak") > 0.0:
		_refuse("unported_branch_active:u_n02_blink_weak") # e._blinkWeak 쓰기 → hurtE G42291 분기 미이식
		return
	var spend: Dictionary = _spend(0.0, bd_cost)
	if spend.get("accepted") != true:
		_refuse("blade_dash_mp_spend_rejected:" + str(spend.get("reason")))
		return
	harp_gauge = maxf(0.0, harp_gauge - gauge_cost)
	# _uqMoveRefund — warpT 0
	var cells: int = int(floor(harp_gauge / gauge_cost))
	var max_cells: int = int(floor(harp_gauge_max / gauge_cost))
	_text(_player.global_position + Vector2(0, -45), "⚡ %d/%d" % [cells, max_cells], "#44ddff", 30)
	native_show_ph.emit("⚡ %d/%d" % [cells, max_cells], Color("44ddff"), 500) # G45449
	bd_ang = ang
	var state: String = _p_state()
	pre_bd_state = state if state in ["whirlwind", "sBlock", "beam"] else null
	bd_move_t = 6.0
	if state != "sDraw" and state != "kiGather" and state != "windup": # windup = 기검참 3타 차징(_isKiCharging)
		_player.call("apply_native_move_skill_state", "bladeDash")
		bd_st2 = 6.0
	_player.set("facing", Vector2(cos(ang), sin(ang)))
	_player.set("iframes", maxf(float(_player.get("iframes")), 15.0))
	# SFX.charge() — 합성음 미이식
	_sample(CHAIN_DASH_KEYS[int(_audio_rng.randf() * 4.0)], 0.6, _r(1.0, 0.1))
	_parts(_player.global_position, "#44ddff", 8)
	_shake(4.0)
	counters.blade_dash += 1
	_log("blade_dash", {"dir": dir, "ang": ang, "mp_cost": bd_cost, "gauge_cost": gauge_cost, "gauge_after": harp_gauge,
		"x": _player.global_position.x, "y": _player.global_position.y, "from_state": state})

## G45344–45416
func _tick_blade_dash(sp: float) -> void:
	if not (bd_move_t > 0.0) or not (sp > 0.0):
		return
	var step: float = minf(sp, bd_move_t)
	_player.set("iframes", maxf(float(_player.get("iframes")), 3.0))
	var spd: float = BLADE_DASH_STEP * step
	var r: float = float(_player.get("radius"))
	var pos: Vector2 = _player.global_position
	var nx: float = pos.x + cos(bd_ang) * spd
	var ny: float = pos.y + sin(bd_ang) * spd
	# 실제 벽만 정지, 해골무덤 통과 — 포트 맵에는 해골벽(_boneWalls) 없음 → canMvBlink==canMv
	if _can_mv_blink(Vector2(nx, pos.y), r): pos.x = nx
	elif not _can_mv(Vector2(nx, pos.y), r): bd_move_t = 0.0
	if _can_mv_blink(Vector2(pos.x, ny), r): pos.y = ny
	elif not _can_mv(Vector2(pos.x, ny), r): bd_move_t = 0.0
	_player.global_position = pos
	if _visual_rng.randf() > 0.3:
		var pa: float = _visual_rng.randf() * TAU
		_pool_part(pos + Vector2(cos(pa), sin(pa)) * r, Vector2((_visual_rng.randf() - 0.5) * 3.0, (_visual_rng.randf() - 0.5) * 3.0),
			"#44ddff" if _visual_rng.randf() > 0.5 else "#ffee44", 2.0 + _visual_rng.randf() * 2.0, 8.0 + _visual_rng.randf() * 4.0)
	bd_move_t -= step
	if _p_state() == "bladeDash":
		bd_st2 = bd_move_t
	_log("blade_tick", {"x": pos.x, "y": pos.y, "left": bd_move_t})
	if bd_move_t <= 0.0:
		_sample("chain_land", 0.7, _r(1.0, 0.1))
		_parts(pos, "#44ddff", 5)
		_push_shock_field(pos)
		# 전격의창(thunderGhost) — 미합체
		if _p_state() == "bladeDash":
			var restore := "idle"
			if pre_bd_state == "sBlock" and _is_act_parry() and _num(_p().get("mp")) > 0.0:
				restore = "sBlock"
			_player.call("apply_native_move_skill_state", restore)
		bd_move_t = 0.0
		pre_bd_state = null
		_player.set("iframes", maxf(float(_player.get("iframes")), 15.0))
		counters.blade_dash_landed += 1
		_log("blade_land", {"x": pos.x, "y": pos.y})

func _is_act_parry() -> bool:
	var held: Dictionary = _player.get_native_input_snapshot().get("held", {})
	return held.get("parry", false) == true

## G45362–45392 전격이동 착지 — 전류장판 (수명=G._fireZones clock owner, 피해 틱은 NOT_READY)
func _push_shock_field(pos: Vector2) -> void:
	var p: Dictionary = _p()
	var skills: Dictionary = p.get("skills", {}) if p.get("skills") is Dictionary else {}
	var lv: float = _num(skills.get("bladeDash")) if _js_truthy(skills.get("bladeDash")) else 1.0
	var r: float = minf(200.0, 120.0 + (lv - 1.0) * 5.0)
	var dmg: int = 0
	var magic: Dictionary = _magic_damage(lv)
	if magic.get("ready") == true: dmg = int(magic.dmg)
	var def_red: float = minf(0.50, 0.10 + (lv - 1.0) * 0.05)
	# 착지 번개 기둥 (1회): 화면 상단 → 착지점
	var cam: Vector2 = _camera_center()
	var cam_node: Camera2D = get_viewport().get_camera_2d()
	var zoom_y: float = cam_node.zoom.y if cam_node != null and cam_node.zoom.y > 0.0 else 1.0
	var top_y: float = cam.y - get_viewport_rect().size.y / zoom_y / 2.0 - 50.0 # G.cam.y−VH/2−50 (VH=화면 높이의 월드 단위)
	var segs: int = 8 + int(_visual_rng.randf() * 5.0)
	var bw: float = 14.0 + _visual_rng.randf() * 10.0
	var pts: Array = []
	for s in range(segs + 1):
		var t: float = float(s) / float(segs)
		pts.append({"x": pos.x + (_visual_rng.randf() - 0.5) * 80.0 * (1.0 - t * 0.4), "y": top_y + (pos.y - top_y) * t,
			"w": bw * (0.2 + t * 0.8 + _visual_rng.randf() * 0.3)})
	var branches: Array = []
	var branch_count: int = 3 + int(_visual_rng.randf() * 3.0)
	for b in range(branch_count):
		var si: int = 1 + int(_visual_rng.randf() * float(pts.size() - 2))
		var sp0: Dictionary = pts[si]
		var bpts: Array = [{"x": sp0.x, "y": sp0.y}]
		var bang: float = (1.0 if _visual_rng.randf() > 0.5 else -1.0) * (0.4 + _visual_rng.randf() * 1.4)
		var blen: float = 60.0 + _visual_rng.randf() * 120.0
		for bs in range(1, 4):
			var bt: float = float(bs) / 3.0
			bpts.append({"x": float(sp0.x) + cos(-PI / 2.0 + bang) * blen * bt + (_visual_rng.randf() - 0.5) * 25.0,
				"y": float(sp0.y) + sin(-PI / 2.0 + bang) * blen * bt + (_visual_rng.randf() - 0.5) * 15.0})
		branches.append(bpts)
	var zone := {"x": pos.x, "y": pos.y, "r": r, "t": 0.0, "maxT": 600.0 + (lv - 1.0) * 30.0, "dmg": dmg, "el": 4, "lv": int(lv),
		"type": "shockField", "defRed": def_red, "_portDamageTick": "NOT_READY:hurtE_42290_shockDR"}
	var zones: Variant = _state.read_current_g().get("_fireZones")
	var list: Array = zones if zones is Array else []
	list.append(zone)
	if not _state.commit_native_fire_zones(_main, list):
		_refuse("shock_field_commit_rejected")
		return
	_shock_visual.append({"zone": zone, "thunder": [{"pts": pts, "br": branches, "life": 18.0, "maxLife": 18.0, "baseW": bw}],
		"spr": null})
	_text(pos + Vector2(0, -30), "⚡%d%% %s" % [int(def_red * 100.0), "방어↓"], "#44ddff", 28)
	# u_d09 _uDashCircuit — 값>0이면 정지(미이식)
	if _unique_value("_uDashCircuit") > 0.0:
		_refuse("unported_branch_active:u_d09_dash_circuit")
	counters.shock_fields += 1
	_log("shock_field", {"x": pos.x, "y": pos.y, "r": r, "dmg": dmg, "defRed": def_red})

## ~~(magicRef()*statInt()*pMagicMul()*_skMul('bladeDash'))
func _magic_damage(lv: float) -> Dictionary:
	var providers: Variant = _main.get("source_providers")
	if not is_instance_valid(providers): return {"ready": false}
	var b: Dictionary = providers.get_provider_bundle()
	if b.is_empty(): return {"ready": false}
	var mr: Dictionary = b.reference.magic_ref()
	var mm: Dictionary = b.formula.p_magic_mul()
	if mr.get("status") != "READY" or mm.get("status") != "READY": return {"ready": false}
	# _SK_MUL.bladeDash (G44509~): 아래 값은 원본 테이블에서 읽은 b/g (계약 문서 표)
	var sk_mul: float = SK_MUL_BLADE_DASH_B + (lv - 1.0) * SK_MUL_BLADE_DASH_G * 0.5
	return {"ready": true, "dmg": FORMULA.js_to_int32(float(mr.value) * 1.0 * float(mm.value) * sk_mul)}

const SK_MUL_BLADE_DASH_B := 3.5 # _SK_MUL.bladeDash G44524 {b:3.5,g:2.1}, _skMul G44556 = b+(lv−1)×g×0.5
const SK_MUL_BLADE_DASH_G := 2.1

# ═══════════════════════════ 포커스·sticky ═══════════════════════════

## G13373 _clearHeldInput (blur/visibilitychange)
func clear_held_input() -> void:
	for key in _k.keys(): _k[key] = false
	for key in _kh.keys(): _kh[key] = false
	dash_hold = false; dash_hold_f = 0.0; dash_tier = 0

## G13384 mousemove/mousedown: Shift 수식키가 꺼져 있으면 KH Shift 잔류 해제
func handle_mouse_modifier(event: InputEvent) -> void:
	if event is InputEventWithModifiers and not (event as InputEventWithModifiers).shift_pressed:
		if _kh.get("ShiftLeft", false): _kh["ShiftLeft"] = false
		if _kh.get("ShiftRight", false): _kh["ShiftRight"] = false

## 사슬기동 중(harp/dash) idle 행동 차단 G33042
func blocks_idle_actions() -> bool:
	return harp_active or dash_active

func passes_through_enemies() -> bool:
	return dash_active or bd_move_t > 0.0 or _p_state() == "bladeDash"

func blocks_space_slot() -> bool:
	return harp_active or dash_active # G13284 Space 슬롯: 사슬기동 중 차단

# ═══════════════════════════ 렌더 ═══════════════════════════

func advance_render(dt_ticks: float) -> void:
	if dt_ticks <= 0.0:
		queue_redraw(); _under.queue_redraw(); _under_add.queue_redraw(); _storm_layer.queue_redraw()
		return
	# land_fire: v.t+=_dtSp; t>=frameTime(2)→frame++; frame>=4 제거 (G54579–54581)
	var write := 0
	for v in _land_vfx:
		v.t = float(v.t) + dt_ticks
		if float(v.t) >= 2.0:
			v.t = 0.0
			v.frame = int(v.frame) + 1
		if int(v.frame) < 4:
			_land_vfx[write] = v
			write += 1
	_land_vfx.resize(write)
	# _harpLandT-=_dtSp; ≤0이면 _dashPhase=0 (G58590 — 렌더 프레임에서 감소)
	if harp_land_t > 0.0:
		harp_land_t -= dt_ticks
		if harp_land_t <= 0.0:
			dash_phase = 0
	# 전류장판 렌더 보조: G._fireZones에서 사라진 장판은 렌더 목록에서도 제거
	var zones: Variant = _state.read_current_g().get("_fireZones") if is_instance_valid(_state) else null
	var live: Array = zones if zones is Array else []
	var kept: Array = []
	for item in _shock_visual:
		if live.has(item.zone):
			var tw: Array = []
			for th in item.thunder:
				th.life = float(th.life) - 1.0 # th.life-- (렌더 프레임)
				if float(th.life) > 0.0: tw.append(th)
			item.thunder = tw
			kept.append(item)
	_shock_visual = kept
	queue_redraw()
	_under.queue_redraw()
	_under_add.queue_redraw()
	_storm_layer.queue_redraw()

func _draw() -> void:
	if not _configured or not is_instance_valid(_player):
		return
	var origin: Vector2 = global_position
	_draw_hold_ui(origin)
	_draw_chain(origin)
	_canvas = self
	_draw_gauge(origin) # 웹 캡처 실측: 머리 위 게이지 숫자가 단계 문자 위에 그려진다(UI 오버레이 패스)
	_canvas = null

var _canvas: CanvasItem # 현재 그리는 층(under 층 그리기 함수의 대상)
func _draw_layer(layer: CanvasItem, kind: String) -> void:
	if not _configured or not is_instance_valid(_player):
		return
	_canvas = layer
	var origin: Vector2 = layer.global_position
	if kind == "storm":
		_draw_storm_sprites(origin)
		_canvas = null
		return
	if kind == "under":
		_draw_shock_fields(origin)
		_draw_trail(origin)
		_draw_blade_sphere(origin)
	else:
		_draw_land_vfx(origin)
	_canvas = null

## G54817–54828
func _draw_gauge(origin: Vector2) -> void:
	if not (dash_hold or harp_active or dash_active):
		return
	var p: Vector2 = _player.global_position - origin
	var r: float = float(_player.get("radius"))
	var pct: float = harp_gauge / harp_gauge_max
	var col := Color("#44ffaa") if pct >= 1.0 else (Color("#88ccff") if pct > 0.5 else (Color("#ffaa44") if pct > 0.2 else Color("#ff4444")))
	var text: String = "%d/%d" % [int(harp_gauge), int(harp_gauge_max)]
	# font 'bold 22px sans-serif', textAlign center, textBaseline bottom, 그림자(+1,+1 #000) → 본문
	var size := 22
	var w: float = _font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	# 웹 GPU 프록시 fillText(G6104–6111): 텍스트 아틀라스 셀 h=ceil(px×1.6)+8 안에 'middle'로 그리고, textBaseline
	# 'bottom'은 셀 상단을 y−h에 둔다 → 글자 em 중앙 = y − h/2. (Canvas2D 'bottom' 의미와 다름 — 실제 화면 기준)
	var cell_h: float = ceil(float(size) * 1.6) + 8.0
	var base_y: float = _middle_to_baseline(p.y - r - 24.0 - cell_h / 2.0, size)
	var shadow := Color(0, 0, 0, 0.9)
	_draw_bold_text(_canvas, Vector2(p.x - w / 2.0 + 1.0, base_y + 1.0), text, size, shadow)
	var c2 := col
	c2.a = 0.9
	_draw_bold_text(_canvas, Vector2(p.x - w / 2.0, base_y), text, size, c2)
	var bw := 32.0
	var bh := 3.0
	var bx: float = p.x - bw / 2.0
	var by: float = p.y - r - 10.0
	_canvas.draw_rect(Rect2(bx, by, bw, bh), Color(0, 0, 0, 0.6 * 0.9))
	_canvas.draw_rect(Rect2(bx, by, bw * pct, bh), Color(col.r, col.g, col.b, 0.9))

## em 상자 중앙(Canvas 'middle') → draw_string 기준선
func _middle_to_baseline(middle_y: float, size: int) -> float:
	return middle_y + (_font.get_ascent(size) - _font.get_descent(size)) / 2.0

func _draw_bold_text(canvas: CanvasItem, pos: Vector2, text: String, size: int, color: Color) -> void:
	# fillText(bold) — 굵기는 SystemFont weight 700 (외곽선 strokeText 없음)
	canvas.draw_string(_font, pos, text, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)

## G59765–59787 사슬 UI (홀드 중)
func _draw_hold_ui(origin: Vector2) -> void:
	if not (dash_hold and dash_tier > 0):
		return
	var dcols: Array = [Color(0, 0, 0, 0), Color("#88ccff"), Color("#44ffaa"), Color("#ff8833")]
	var dprev: Array = [0, 0, HARP_TIER_F[2], HARP_TIER_F[3]]
	var dtiers: Array = [0, HARP_TIER_F[2], HARP_TIER_F[3], HARP_TIER_F[3]]
	var dr: float = minf((dash_hold_f - float(dprev[dash_tier])) / (float(dtiers[dash_tier]) - float(dprev[dash_tier]) + 0.01), 1.0)
	var p: Vector2 = _player.global_position - origin
	var col: Color = dcols[dash_tier]
	var c8 := Color(col.r, col.g, col.b, 0.8)
	draw_arc(p, 22.0, -PI / 2.0, -PI / 2.0 + TAU * dr, 48, c8, 2.0, true)
	if dr >= 1.0:
		var pulse: float = 0.3 + 0.3 * sin(float(Time.get_ticks_msec()) * 0.01)
		draw_arc(p, 28.0, 0.0, TAU, 48, Color(col.r, col.g, col.b, pulse), 2.0, true)
	# 착지 예측선 (마우스 방향) — 렌더 질의는 oracle 대조 기록에서 제외
	var ang: float = float(_player.call("read_native_aim_angle"))
	var p_dict: Dictionary = _p()
	var dist: float = _harp_available_dist(dash_tier, harp_gauge, p_dict) if not p_dict.is_empty() else 0.0
	var end: Vector2 = p + Vector2(cos(ang), sin(ang)) * dist
	draw_dashed_line(p, end, Color(1, 1, 1, 0.25), -1.0, 4.0, false) # lineWidth 1·setLineDash([4,4]) — 1 화면 픽셀 헤어라인
	draw_arc(end, 6.0, 0.0, TAU, 24, c8, 1.5, true)
	# 단계 텍스트: bold 36px sans-serif, center, baseline alphabetic
	var text: String = "%d단" % dash_tier
	var size := 36
	var w: float = _font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	# 단계 문자는 textBaseline을 따로 지정하지 않는다(G59784) — 실측: 앞선 텍스트 패스가 남긴 'middle'로 em 중앙=P.y−44
	_draw_bold_text(self, Vector2(p.x - w / 2.0, _middle_to_baseline(p.y - 44.0, size)), text, size, c8)

## G59789–59863 사슬 비행 렌더 (chain_shuriken_2.webp)
func _draw_chain(origin: Vector2) -> void:
	if not harp_active:
		return
	var ha: float = atan2(harp_v.y, harp_v.x)
	var p: Vector2 = _player.global_position - origin
	var h: Vector2 = harp_pos - origin
	var hdist: float = p.distance_to(h)
	if _chain_tex != null and hdist > 0.0:
		var tw: float = float(_chain_tex.get_width())
		var th: float = float(_chain_tex.get_height())
		var cs_h := 28.0
		var cs_w: float = cs_h * tw / th
		var tip_ratio := 0.35
		var chain_w: float = cs_w * (1.0 - tip_ratio)
		var src_chain_w: int = int(tw * (1.0 - tip_ratio))
		var n_tiles: int = maxi(1, int(hdist / chain_w))
		for ti in range(n_tiles):
			var t: float = float(ti) / float(n_tiles)
			var tp: Vector2 = p + (h - p) * t
			draw_set_transform(tp, ha, Vector2.ONE)
			draw_texture_rect_region(_chain_tex, Rect2(0, -cs_h / 2.0, chain_w, cs_h), Rect2(0, 0, src_chain_w, th), Color(1, 1, 1, 0.9))
		var tip_w: float = cs_w * tip_ratio
		var spin: float = float(Time.get_ticks_msec()) * 0.015
		var xf := Transform2D(ha, h) * Transform2D(0.0, Vector2(tip_w * 0.1, 0)) * Transform2D(spin, Vector2.ZERO)
		draw_set_transform_matrix(xf)
		draw_texture_rect_region(_chain_tex, Rect2(-tip_w / 2.0, -cs_h / 2.0, tip_w, cs_h), Rect2(src_chain_w, 0, tw - src_chain_w, th), Color.WHITE)
		draw_set_transform_matrix(Transform2D.IDENTITY)
	if harp_hit:
		var now: float = float(Time.get_ticks_msec())
		var a: float = 0.5 + sin(now * 0.1) * 0.3
		var spark_r: float = 6.0 + sin(now * 0.15) * 3.0
		for si in range(3):
			var sa: float = ha + PI + (_visual_rng.randf() - 0.5) * 1.2
			var sd: float = _visual_rng.randf() * spark_r
			var c := Color("#ffdd44") if _visual_rng.randf() > 0.5 else Color("#ffaa00")
			c.a = a
			draw_circle(h + Vector2(cos(sa), sin(sa)) * sd, 1.0 + _visual_rng.randf(), c)

## [잔상] G58713–58716 push(최대 8, shift) / clear
func push_trail(snapshot: Dictionary) -> void:
	_trail.append(snapshot)
	if _trail.size() > 8:
		_trail.pop_front()

func clear_trail() -> void:
	if not _trail.is_empty():
		_trail.clear()

## G58654–58660: 오래된 것부터 (0.05+0.15×(i/N))×.85, 마지막(현재) 제외. bladeDash는 밝은 아틀라스(_atlasP_bright).
func _draw_trail(origin: Vector2) -> void:
	var n: int = _trail.size()
	if n <= 1:
		return
	for i in range(n - 1):
		var s: Dictionary = _trail[i]
		var tex: Texture2D = s.get("texture")
		if tex == null:
			continue
		var a: float = (0.05 + 0.15 * (float(i) / float(n))) * 0.85
		var sc: Vector2 = s.scale
		var pos: Vector2 = Vector2(s.pos) - origin
		var size: Vector2 = tex.get_size() * sc
		var off: Vector2 = Vector2(s.offset) * sc
		# 밝은 아틀라스 대응: 원본 _atlasP_bright는 별도 밝기 보정본 — 포트는 같은 프레임(미보정, 기록)
		_canvas.draw_texture_rect(tex, Rect2(pos + off, size), false, Color(1, 1, 1, a))

## G58552–58569 칼날이동: 전기 변신 (소형 전기구체) — 스프라이트보다 먼저
func _draw_blade_sphere(origin: Vector2) -> void:
	if _p_state() != "bladeDash" or float(_player.get("hp")) <= 0.0:
		return
	var p: Vector2 = _player.global_position - origin
	var now: float = float(Time.get_ticks_msec())
	var pr: float = float(_player.get("radius")) * 2.0 # _pR=P.r×_pScale
	var r: float = pr + 4.0 + sin(now * 0.08) * 2.0
	var c := _canvas
	c.draw_circle(p, r * 0.8, Color(60 / 255.0, 160 / 255.0, 1.0, 0.25))
	c.draw_circle(p, r * 1.4, Color(30 / 255.0, 100 / 255.0, 220 / 255.0, 0.12))
	c.draw_circle(p, r, Color(100 / 255.0, 200 / 255.0, 1.0, 0.85))
	c.draw_circle(p, r * 0.5, Color(220 / 255.0, 245 / 255.0, 1.0, 0.9))
	var arc_col := Color("#88eeff")
	arc_col.a = 0.7 + 0.2 * sin(now * 0.06)
	for ai in range(5):
		var aa: float = TAU / 5.0 * float(ai) + now * 0.015
		var sp0: Vector2 = p + Vector2(cos(aa), sin(aa)) * r * 0.3
		var ma: float = aa + 0.4 + sin(now * 0.02 + float(ai)) * 0.5
		var mr: float = r * 0.65 + sin(now * 0.025 + float(ai) * 2.0) * 3.0
		var mid: Vector2 = p + Vector2(cos(ma), sin(ma)) * mr
		var ep: Vector2 = p + Vector2(cos(aa), sin(aa)) * r * 0.9
		var curve := PackedVector2Array()
		for k in range(9): # quadraticCurveTo
			var t: float = float(k) / 8.0
			curve.append(sp0.lerp(mid, t).lerp(mid.lerp(ep, t), t))
		c.draw_polyline(curve, arc_col, 2.0, true)
	var bolt_col := Color("#44ddff")
	bolt_col.a = 0.6 + 0.3 * sin(now * 0.04)
	for bi in range(6):
		var ba: float = TAU / 6.0 * float(bi) + now * 0.01
		var pts := PackedVector2Array([p + Vector2(cos(ba), sin(ba)) * r * 0.5])
		for bs in range(3):
			var ext: float = r * (0.3 + float(bs) * 0.35)
			var jit: float = (_visual_rng.randf() - 0.5) * 10.0
			pts.append(p + Vector2(cos(ba), sin(ba)) * ext + Vector2(cos(ba + PI / 2.0), sin(ba + PI / 2.0)) * jit)
		c.draw_polyline(pts, bolt_col, 1.5, true)
	c.draw_circle(p, r * 0.35, Color(1, 1, 1, 0.9))
	c.draw_circle(p, r * 0.5, Color(0xcc / 255.0, 0xf0 / 255.0, 1.0, 0.5))
	if _visual_rng.randf() > 0.4: # 렌더 중 poolPart (표현)
		var spa: float = _visual_rng.randf() * TAU
		_pool_part(_player.global_position + Vector2(cos(spa), sin(spa)) * r,
			Vector2(cos(spa) * 3.0 + (_visual_rng.randf() - 0.5) * 2.0, sin(spa) * 3.0 + (_visual_rng.randf() - 0.5) * 2.0),
			"#44ddff", 2.0 + _visual_rng.randf() * 3.0, 8.0 + _visual_rng.randf() * 6.0)

## G55931–55962 전류장판 Power Lightning 3층(가산). _spr 최초 렌더 생성, 30틱마다 회전·뒤집기 재추첨
func _draw_storm_sprites(origin: Vector2) -> void:
	var c: CanvasItem = _canvas
	for item in _shock_visual:
		var zone: Dictionary = item.zone
		var prog: float = float(zone.t) / float(zone.maxT)
		var fade: float = (1.0 - (prog - 0.8) / 0.2 if prog > 0.8 else 1.0) * 0.24
		if item.spr == null:
			item.spr = {"f0": _visual_rng.randf() * 16.0, "f1": _visual_rng.randf() * 12.0, "f2": _visual_rng.randf() * 9.0,
				"sc": float(zone.r) / 60.0, "rot": _visual_rng.randf() * TAU, "flip": -1.0 if _visual_rng.randf() > 0.5 else 1.0}
		var spr: Dictionary = item.spr
		var t: float = float(zone.t)
		if int(t) % 30 == 0 and t > 1.0:
			spr.rot = _visual_rng.randf() * TAU
			spr.flip = -1.0 if _visual_rng.randf() > 0.5 else 1.0
		var center: Vector2 = Vector2(float(zone.x), float(zone.y)) - origin
		var layers: Array = [
			{"i": 0, "cols": 4, "rows": 4, "frames": 16, "f": "f0", "rate": 0.15, "size": 1.0, "rot": 0.0, "alpha": 1.0},
			{"i": 1, "cols": 4, "rows": 3, "frames": 12, "f": "f1", "rate": 0.18, "size": 1.1, "rot": 0.5, "alpha": 1.0},
			{"i": 2, "cols": 3, "rows": 3, "frames": 9, "f": "f2", "rate": 0.12, "size": 0.6, "rot": -0.3, "alpha": 0.7}]
		for layer in layers:
			var tex: Texture2D = _storm_tex[layer.i] if layer.i < _storm_tex.size() else null
			if tex == null: continue
			var fw: float = float(tex.get_width()) / float(layer.cols)
			var fh: float = float(tex.get_height()) / float(layer.rows)
			var fi: int = int(fmod(float(spr[layer.f]) + t * float(layer.rate), float(layer.frames)))
			var src := Rect2(float(fi % int(layer.cols)) * fw, float(fi / int(layer.cols)) * fh, fw, fh)
			var sz: float = fw * float(spr.sc) * float(layer.size)
			c.draw_set_transform(center, float(spr.rot) + float(layer.rot), Vector2(float(spr.flip), 1.0))
			var tint := Color(STORM_TINTS[layer.i])
			tint.a = float(layer.alpha) * fade
			c.draw_texture_rect_region(tex, Rect2(-sz / 2.0, -sz / 2.0, sz, sz), src, tint)
		c.draw_set_transform_matrix(Transform2D.IDENTITY)

## G37491–37512 장판 틱 파티클(shockField): 30% 확률 시안 스파크 + 그중 40% 흰 상승 스파크 — 표현 전용
func _tick_shock_particles() -> void:
	for item in _shock_visual:
		var zone: Dictionary = item.zone
		if _visual_rng.randf() > 0.7:
			var a: float = _visual_rng.randf() * TAU
			var d: float = _visual_rng.randf() * float(zone.r)
			var zc := Vector2(float(zone.x), float(zone.y))
			_pool_part(zc + Vector2(cos(a), sin(a)) * d, Vector2((_visual_rng.randf() - 0.5) * 3.0, -1.0 - _visual_rng.randf() * 2.0),
				"#44ddff" if _visual_rng.randf() > 0.5 else "#88eeff", 1.0 + _visual_rng.randf() * 2.0, 6.0 + _visual_rng.randf() * 6.0)
			if _visual_rng.randf() > 0.6:
				_pool_part(zc + Vector2((_visual_rng.randf() - 0.5) * float(zone.r), (_visual_rng.randf() - 0.5) * float(zone.r)),
					Vector2((_visual_rng.randf() - 0.5) * 2.0, -2.0 - _visual_rng.randf() * 3.0), "#ffffff", 1.0 + _visual_rng.randf(), 4.0 + _visual_rng.randf() * 5.0)

## G54575–54620 land_fire (200×200, 2열, 4프레임, frameTime 2, scale .35, lighter)
func _draw_land_vfx(origin: Vector2) -> void:
	if _land_tex == null:
		return
	for v in _land_vfx:
		var frame: int = int(v.frame)
		var dw: float = 200.0 * 0.35
		var alpha: float = 1.0 * (1.0 - (float(frame) / 4.0) * 0.3)
		var col: int = frame % 2
		var row: int = frame / 2
		var pos: Vector2 = Vector2(v.pos) - origin
		_canvas.draw_texture_rect_region(_land_tex, Rect2(pos.x - dw / 2.0, pos.y - dw / 2.0, dw, dw), Rect2(col * 200, row * 200, 200, 200), Color(1, 1, 1, alpha))

## G55931–56010 전류장판 렌더(번개 기둥) — 악의폭풍 스프라이트(_msStormImg1~3) 층은 에셋 미반입(Mac/아트 요청)
func _draw_shock_fields(origin: Vector2) -> void:
	for item in _shock_visual:
		var zone: Dictionary = item.zone
		var prog: float = float(zone.t) / float(zone.maxT)
		var fade: float = (1.0 - (prog - 0.8) / 0.2 if prog > 0.8 else 1.0) * 0.24
		for th in item.thunder:
			var ta: float = float(th.life) / float(th.maxLife)
			var flash: float = 2.0 if float(th.life) > float(th.maxLife) - 4.0 else 1.0
			var layers: Array = [{"w": 1.3, "col": Color("#6677ee"), "alp": 0.7}, {"w": 0.5, "col": Color("#eeeeff"), "alp": 0.9}]
			for layer in layers:
				var pts := PackedVector2Array()
				for pt in th.pts: pts.append(Vector2(float(pt.x), float(pt.y)) - origin)
				var c: Color = layer.col
				c.a = clampf(float(layer.alp) * ta * flash * fade, 0.0, 1.0)
				_round_polyline(pts, c, float(th.baseW) * float(layer.w))
			# 분기: 코어 레이어만 (lineWidth baseW×.5, α .9×ta×.5×flash×fade, #eeeeff)
			var bc := Color("#eeeeff")
			bc.a = clampf(0.9 * ta * 0.5 * flash * fade, 0.0, 1.0)
			for branch in th.br:
				var bp := PackedVector2Array()
				for pt in branch: bp.append(Vector2(float(pt.x), float(pt.y)) - origin)
				_round_polyline(bp, bc, float(th.baseW) * 0.5)

## X.lineCap='round' 폴리라인 — 포트는 draw_polyline(라운드 캡 없음, 끝단 반폭 차이: 경미·기록)
func _round_polyline(pts: PackedVector2Array, color: Color, width: float) -> void:
	if pts.size() < 2:
		return
	_canvas.draw_polyline(pts, color, width, true)

# ═══════════════════════════ 읽기 ═══════════════════════════

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "gauge": harp_gauge, "gauge_max": harp_gauge_max,
		"dash_hold": dash_hold, "dash_hold_f": dash_hold_f, "dash_tier": dash_tier, "dash_active": dash_active,
		"dash_left": dash_left, "dash_v": dash_v, "dash_iframe": dash_iframe, "dash_phase": dash_phase,
		"harp_active": harp_active, "harp_pos": harp_pos, "harp_v": harp_v, "harp_dist": harp_dist, "harp_max_dist": harp_max_dist,
		"harp_hit": harp_hit, "harp_tier": harp_tier, "harp_land_t": harp_land_t, "harp_hits": harp_hits.size(),
		"bd_trigger": bd_trigger, "bd_move_t": bd_move_t, "bd_ang": bd_ang, "bd_st2": bd_st2,
		"counters": counters.duplicate(), "last_refusal": last_refusal, "unported": UNPORTED_BRANCHES,
		"k": _k.duplicate(), "kh": _kh.duplicate()}

## HUD(기동 게이지 링 G60295–60299 · skSlot0 바 G60314 · 머리 위 숫자) 소비자용 읽기 API — Mac HUD 요청
func read_native_move_gauge() -> Dictionary:
	return {"ready": _configured, "gauge": harp_gauge, "max": harp_gauge_max, "cell": HARP_GAUGE_COST[1],
		"pct": clampf(harp_gauge / harp_gauge_max, 0.0, 1.0) if harp_gauge_max > 0.0 else 0.0,
		"cell_deg": 360.0 * float(HARP_GAUGE_COST[1]) / harp_gauge_max if harp_gauge_max > 0.0 else 0.0,
		"source": "G60295-60299 mobilityRing / G60314 skSlot0 hg-bar"}

## player 렌더 입력 (G58590–58716)
func read_pose() -> Dictionary:
	return {"harp_active": harp_active, "dash_active": dash_active, "dash_phase": dash_phase, "harp_land_t": harp_land_t,
		"dash_v": dash_v, "harp_v": harp_v, "dash_left": dash_left, "pull_dur": float(HARP_PULL_DUR[harp_tier]) if harp_tier > 0 else 1.0,
		"bd_st2": bd_st2}

func set_dash_phase_from_render(value: int) -> void:
	dash_phase = value # G58621 'start 끝나면 fly로 전환' — 원본도 렌더에서 씀

# ═══════════════════════════ 보조 ═══════════════════════════

func _p() -> Dictionary:
	var p: Variant = _state.read_current_p()
	return p if p is Dictionary else {}

func _skills() -> Dictionary:
	var p: Dictionary = _p()
	return p.get("skills", {}) if p.get("skills") is Dictionary else {}

func _aim_angle() -> float:
	var a: float = float(_player.call("read_native_aim_angle"))
	if probe_on: probe.aim.append(a)
	return a

## canMvBlink(G31715)/canMv(G31712) — 포트 맵(MAP11)은 해골벽(_boneWalls) 없음 → 같은 world.can_move
func _can_mv_blink(pos: Vector2, r: float) -> bool:
	var ok: bool = _world.can_move(pos, r)
	if probe_on: probe.canmv.append([pos.x, pos.y, r, ok, "blink"])
	return ok

func _can_mv(pos: Vector2, r: float) -> bool:
	var ok: bool = _world.can_move(pos, r)
	if probe_on: probe.canmv.append([pos.x, pos.y, r, ok, "mv"])
	return ok

## 원본 oracle 대조용 질의 기록(테스트가 켬). 제품 경로에서는 꺼져 있다.
var probe_on := false
var probe: Dictionary = {"canmv": [], "aim": [], "shq": []}
func reset_probe() -> void:
	probe = {"canmv": [], "aim": [], "shq": []}

func _spend(st: float, mp: float) -> Dictionary:
	var resources: Variant = _main.get("source_resources")
	if not is_instance_valid(resources):
		return {"accepted": false, "reason": "source_resources_missing"}
	return resources.commit_native_skill_dispatch_spend(_main, st, mp)

## 프레임 경로(게이지 최대치 G32785 extraST)는 bundle 사본을 만들지 않고 실제 provider 객체를 직접 읽는다.
func _provider(name: String) -> Object:
	var providers: Variant = _main.get("source_providers")
	if not is_instance_valid(providers): return null
	var obj: Object = providers.get_provider(name)
	return obj if is_instance_valid(obj) else null

func _eq_affix(id: String) -> Dictionary:
	var affix: Object = _provider("affix")
	if affix == null: return {"status": "NOT_READY"}
	return affix.eq_affix(id)

func _unique_value(stat: String) -> float:
	var formula: Object = _provider("formula")
	if formula == null: return 0.0
	var r: Dictionary = formula.u_eq(stat)
	return float(r.value) if r.get("status") == "READY" and (r.get("value") is int or r.get("value") is float) else 0.0

func _legendary_value(stat: String) -> float:
	var formula: Object = _provider("formula")
	if formula == null or not formula.has_method("l_eq"): return 0.0
	var r: Dictionary = formula.l_eq(stat)
	return float(r.value) if r.get("status") == "READY" and (r.get("value") is int or r.get("value") is float) else 0.0

func _p_charge_range() -> float:
	return 1.0 + _passive("pCharge") * 0.02 # G28020

func _p_charge_gauge() -> float:
	return 1.0 + _passive("pCharge") * 0.03 # G28021

func _passive(key: String) -> float:
	var passives: Variant = _state.read_current_passives()
	return _num(passives.get(key)) if passives is Dictionary else 0.0

func _lesson_chapter2() -> bool:
	var seq: Variant = _main.get("source_intro_sequence")
	if not is_instance_valid(seq): return false
	var flow: Variant = seq.get("lesson_flow")
	return is_instance_valid(flow) and flow.get("active") == true and int(flow.get("chapter")) == 2

func _camera_center() -> Vector2:
	var cam: Camera2D = get_viewport().get_camera_2d()
	return cam.get_screen_center_position() if cam != null else _player.global_position

func _hit_fx() -> Node:
	return _world.get_node_or_null("NativeProjectileHitEffects")

func _parts(pos: Vector2, color: String, count: int) -> void:
	var fx: Node = _hit_fx()
	if fx != null: fx.emit_parts(pos, Color(color), count)

func _pool_part(pos: Vector2, vel: Vector2, color: String, size: float, life: float) -> void:
	var fx: Node = _hit_fx()
	if fx != null: fx.emit_source_particle({"position": pos, "velocity": vel, "color": Color(color), "size": size, "life_ticks": life})

func _text(pos: Vector2, text: String, color: String, life: int) -> void:
	if probe_on: _log("txt", {"x": pos.x, "y": pos.y, "text": text, "color": color, "life": life})
	var adapter: Node = _world.get_node_or_null("NativeFloatingText")
	if adapter != null and adapter.has_method("emit_native_text"):
		adapter.emit_native_text(pos.x, pos.y, text, color, life)

func _shake(n: float) -> void:
	_state.apply_native_skill_shake(_main, n) # shake(n) G19924: G.shake=max(G.shake, n×OPT.shake/100)

func _shake_assign(n: float) -> void:
	if _state.has_method("apply_native_shake_assign"):
		_state.apply_native_shake_assign(_main, n)

func _sample(key: String, gain: float, rate: float) -> void:
	if probe_on: _log("snd", {"key": key, "gain": gain})
	var path: String = SFX_DIR + key + ".mp3"
	if not FileAccess.file_exists(path):
		return # 샘플 파일 없음(ui_cancel) — 원본 playSample도 미등록 키는 무음
	if is_instance_valid(_main) and _main.has_method("request_native_skill_sample"):
		_main.request_native_skill_sample(path, gain, rate)

func _r(base: float, spread: float) -> float:
	return base * (1.0 + (_audio_rng.randf() - 0.5) * 2.0 * spread) # _r(v,s) G12463 = v×(1+(Math.random()−.5)×2×(s||.05))

func _refuse(reason: String) -> bool:
	last_refusal = reason
	counters.unported_refusals += 1
	_log("refuse", {"reason": reason})
	return false

func _log(kind: String, data: Dictionary) -> void:
	var frame: float = _world.get_native_frame() if is_instance_valid(_world) and _world.has_method("get_native_frame") else -1.0
	var row := {"k": kind, "f": frame}
	row.merge(data, true)
	log_rows.append(row)
	if log_rows.size() > 512:
		log_rows = log_rows.slice(log_rows.size() - 384)

static func _num(v: Variant) -> float:
	if v is int or v is float: return 0.0 if is_nan(float(v)) else float(v)
	if v is bool: return 1.0 if v else 0.0
	return 0.0

static func _js_truthy(v: Variant) -> bool:
	if v == null: return false
	if v is bool: return v
	if v is int: return v != 0
	if v is float: return v != 0.0 and not is_nan(v)
	if v is String: return not v.is_empty()
	return true
