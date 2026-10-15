extends Node2D
##
## FDG Godot 이식 — Q 성공 blueBean/parryBlueBean 반사탄 "반사 이후" 실행 producer.
## TASK GODOT-PORT-PARRY-BLUE-PROJECTILE-FIRST-20261013
##
## 소유: 격리 포트 모듈(이 파일). Q/E 판정·contact·parryBank·반사 순간의 탄 플래그 변이는 SKILL
## (port_modules/combat_qe) 소유이고, World/Player/emitter/target adapter/Git 은 ENGINE 소유다.
## 이 노드는 SKILL 이 이미 변이를 끝낸 반사탄 1발(raw source 필드)을 받아 그 뒤의 원본 projs 루프
## 1발 분량을 실행한다: 카메라 컬링 → 트레일 → 수명 감소 → life1 게이트 → 유도 → 이동 → 벽 →
## 아군탄 접촉 → AoE hurtE + 넉백 + 중독 → 소멸. Q/E/contact/parryBank 재작성·신규 변이 0.
##
## 원본 R(읽기전용): /Users/fordeargamers/Projects/exoduser-migration-20261001/game.html
##   Q 성공 마법탄 변이(SKILL 소유, 참고만)      : 35665-35683 (blackBean 은 플래그 유지, _fromRainbow=!!blackBean)
##   projs 루프 진입/카메라 컬링/트레일/수명     : 35285-35293
##   반사 지뢰·덫 즉시 회수                      : 35301 / 35314
##   life<=0 게이트(-900 / redBean / life=1)     : 35367, deathFx 게이트 35369
##   blueBean 유도(400 / .08·sp / 트레일 입자)   : 35414-35428, 이동 35429-35431
##   벽(isW) 소멸 + _rainbowImpact               : 35448-35455, _rainbowImpact 9104
##   아군탄 접촉 + AoE + 중독 + 넉백 + 연출     : 35721-35751
##   hurtE 계약(parryBlueBean 10%, blueBean 넉백 0, poiseHit 없음 → 포이즈 0): 42751 / 42910 / 43038 / 43049
##   렌더 pass0 트레일 / pass1 글로우 / pass2 본체: 54505-54540 / 54542-54710, _drawClassicRainbow 24539
##   _projectileParryClass 17308, _physicalProjectileMultiplier 17326, _isBitingPhysicalProjectile 17410
##   shQuery/SHASH_CELL 19025/18988, OPT 기본값 6667, PHYS_STEP 61008, _now=_gameTime+_acc 62416
##   렌더 가시 판정(중심, 경계 포함)              : 53172-53173 / 54507-54508, pass2 _sprFr 54543
##   방 전환 projs 일괄 회수(중앙 권한)          : 31421 / 61030 / 63894 / 64313 / 64717, 탄 상한 35275-35284
##

signal projectile_ended(reason: String, snapshot: Dictionary)

const SOURCE_TAG := "parryBlueBean"
const PHYS_STEP_MS := 1000.0 / 60.0           # game.html:61008
const CAMERA_CULL_D2 := 6250000.0              # 35290 / 35367 (2500px)
const LIFE_DECAY_PER_TICK := 0.667             # 35293
const LIFE_KILL_FLOOR := -900.0                # 35367
const HOMING_QUERY_R := 400.0                  # 35415-35416
const HOMING_TURN_PER_TICK := 0.08             # 35421
const SHASH_CELL := 128.0                      # 18988
const TRAIL_SLOTS := 30                        # 35292
const TRAIL_MIN_STEP2 := 64.0                  # 35292
const FRIENDLY_HIT_MIN_R := 6.0                # 35721
const FRIENDLY_HIT_SPEED_CAP := 18.0           # 35721
const FRIENDLY_QUERY_PAD := 20.0               # 35721
const AOE_R_FALLBACK := 100.0                  # 35738 p._aoeR||100
const AOE_DMG_FALLBACK := 15.0                 # 35738 p._aoeDmg||p.dmg||15
const AOE_KB := 18.0                           # 35744
const AOE_KB_MULT := 2                         # 35743 opts.kbMult
const POISON_T := 600.0                        # 35745
const POISON_STK_ADD := 3
const POISON_STK_MAX := 10
const POISON_POOL_RATE := 0.15
const RAINBOW_BOOM_R := 80.0                   # 9104
const RAINBOW_BOOM_LIFE := 72.0
const BEAN_RAINBOW := ["#ff2244", "#ff8800", "#ffee00", "#00ff66", "#00ccff", "#8855ff", "#ff44cc"]  # 15070
const ELC := ["#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44"]          # 15071
const EL_D := 3
# 원본 OPT 리터럴 기본값(game.html:6667). 중앙이 실제 OPT 를 공급하면 그것이 우선한다.
const SOURCE_OPT_DEFAULT := {"trail": true, "deathFx": true, "shake": 80.0, "parts": 80.0}
const PHYS_MOUTH_SOURCE := "img/proj_phys_mouth.png"   # 24431 (물리 분류 본체 시트, 미이식)
const TITAN_EYE_SOURCE := "img/proj_titan_eye.png"     # 24644 (titanEye 본체 시트, 미이식)
const CAP_SEGMENTS := 8
# 연출 sink 계약(ENGINE fx adapter). 없으면 호출 0 + gaps 기록.
const FX_METHODS := {"boom": "add_boom", "impact": "add_impact", "sfx": "play_sfx", "shake_set": "set_shake",
	"shake_call": "shake", "slow_mo_if_idle": "request_slow_mo_if_idle"}

enum { PASS_TRAIL, PASS_GLOW, PASS_BODY }

# SKILL 반사 변이가 반드시 넘겨야 하는 raw 필드(기본값 주입 금지).
const REQUIRED_RAW := ["x", "y", "vx", "vy", "dmg", "el", "life", "ml", "sz", "r",
	"friendly", "blueBean", "parryBlueBean", "magic", "homing", "col",
	"blackBean", "_fromRainbow", "parryClass", "_aoeR", "_aoeDmg"]
const NUMBER_RAW := ["x", "y", "vx", "vy", "dmg", "el", "life", "ml", "sz", "r", "_aoeR", "_aoeDmg", "dist", "_eyeSkin", "_bluHitCD"]
# 원본 풀 객체 기본값(_mkProj 17256 / _resetProj 17268). _lessonShot/_druidPoison 등 풀 밖 필드는 JS undefined → falsy.
const POOL_DEFAULTS := {"dist": 0.0, "redBean": false, "bwBean": false, "gbBean": false, "fireMagic": false,
	"waterBean": false, "_cCol": null, "mine": false, "bomb": false, "trap": false, "web": false,
	"dimRift": false, "poisonZone": false, "iceZone": false, "blizzard": false, "elemBall": false,
	"swordWave": false, "explosive": false, "beam": false, "maliceHunt": false, "bladeShard": false,
	"iceBlade": false, "_coralSpike": false, "noParry": false, "titanEye": false, "fbEnergy": false,
	"fdEnergy": false, "blackHoleBurst": false, "_lvPull": false, "_eyeSkin": 0.0, "_bluHitCD": 0.0,
	"_druidPoison": false, "_lessonShot": false}
# SKILL 런타임(snake_case) 필드명 → raw 원본 필드명. raw 가 우선, 둘이 다르면 거부.
const ALIASES := {"blueBean": "blue_bean", "parryBlueBean": "parry_blue_bean", "blackBean": "black_bean",
	"redBean": "red_bean", "waterBean": "water_bean", "_fromRainbow": "from_rainbow",
	"parryClass": "parry_class", "_aoeR": "aoe_r", "_aoeDmg": "aoe_dmg", "_lessonShot": "lesson_shot",
	"_cCol": "c_col", "_eyeSkin": "eye_skin", "_druidPoison": "druid_poison", "_bluHitCD": "blu_hit_cd",
	"titanEye": "titan_eye", "swordWave": "sword_wave", "fbEnergy": "fb_energy", "fdEnergy": "fd_energy",
	"blackHoleBurst": "black_hole_burst", "_lvPull": "lv_pull", "poisonZone": "poison_zone",
	"iceZone": "ice_zone", "dimRift": "dim_rift", "elemBall": "elem_ball", "noParry": "no_parry",
	"gbBean": "gb_bean", "bwBean": "bw_bean", "fireMagic": "fire_magic"}
# 반사 후 다른 원본 분기가 필요한 탄종. 이 producer 는 해당 분기를 이식하지 않았으므로 정확한 사유로 거부한다.
const UNPORTED_BRANCH_FLAGS := ["bomb", "explosive", "poisonZone", "dimRift", "fbEnergy", "fdEnergy",
	"blackHoleBurst", "elemBall", "iceZone", "blizzard", "beam"]
const REFLECTED_GATE := ["friendly", "blueBean", "parryBlueBean", "magic", "homing"]

static var _bound: Array = []

var p: Dictionary = {}
var world: Object
var fx_sink: Object
var source_opt: Dictionary = {}
var ended := false
var end_reason := ""
var last_error := ""
var native_steps := 0
var native_frame := 0.0
var render_now_ms := 0.0
var render_phase_updates := 0
var life1_extensions := 0
var last_render_branch := ""
var homing_target_id := 0
var hurt_log: Array = []
var effect_log: Array = []
var gaps: Dictionary = {}
var draw_trace: Dictionary = {}
var query_log: Array = []
var last_visibility := ""
var spr_fr_advances := 0

var _configured := false
var _source: Variant = null
var _p_dot_pool: Callable
var _camera_position: Callable
var _render_bounds: Callable
var _query_enemies: Callable
var _external_native := false
var _external_render := false
var _trail: Array = []
var _trH := 0
var _trLen := 0
var _trLX := 0.0
var _trLY := 0.0
var _trail_ready := false
var _layers: Array = []

## ── 구성: SKILL 이 변이를 끝낸 반사탄 1발을 받는다. 1 source projectile → 1 Node. ──
## reflected: Dictionary 또는 Object(raw 필드명 또는 SKILL snake_case 필드명).
## owner_world: ENGINE World(is_world_blocked 필수; 시계/RNG/파츠/텍스트는 있으면 소비).
## bindings: p_dot_pool(Callable→float, 필수 — 원본 pDotPool 28716), fx_sink(Object, 선택),
##           camera_position(Callable→Vector2, 선택 — 원본 G.cam), source_opt(Dictionary, 선택 — 원본 OPT/_prof.u),
##           render_bounds(Callable→Rect2, 선택 — 중앙이 이미 계산한 원본 _vl/_vt/_vr/_vb, 53172-53173),
##           query_enemies(Callable(x,y,r)→Array, 선택 — 원본 shQuery 결과 그대로; 우선순위 binding > World.query_native_enemies > 재구성).
func configure_reflected(reflected: Variant, owner_world: Object, bindings: Dictionary = {}) -> bool:
	if _configured:
		return _reject("already_configured")
	if not (reflected is Dictionary or reflected is Object) or reflected == null:
		return _reject("reflected_source_not_object")
	if not is_instance_valid(owner_world) or not owner_world.has_method("is_world_blocked"):
		return _reject("missing_world_api_is_world_blocked")
	for entry in _bound:
		var node: Variant = entry["node"].get_ref()
		if is_instance_valid(node) and not node.ended and is_same(entry["source"], reflected):
			return _reject("source_projectile_already_bound")
	var raw: Dictionary = {}
	var missing: Array = []
	for key in REQUIRED_RAW:
		var got: Array = _read_field(reflected, key)
		if got[0] == "conflict":
			return _reject("conflicting_alias_" + key)
		if got[0] == "missing":
			missing.append(key)
		else:
			raw[key] = got[1]
	if not missing.is_empty():
		return _reject("missing_reflected_fields:" + ",".join(missing))
	for key in POOL_DEFAULTS:
		var got: Array = _read_field(reflected, key)
		if got[0] == "conflict":
			return _reject("conflicting_alias_" + key)
		raw[key] = got[1] if got[0] == "ok" else POOL_DEFAULTS[key]
	for key in ["_trail", "_trH", "_trLen", "_trLX", "_trLY"]:
		var got: Array = _read_field(reflected, key)
		if got[0] == "ok":
			raw[key] = got[1]
	for key in NUMBER_RAW:
		if not _is_number(raw.get(key)):
			return _reject("non_finite_number_" + key)
		raw[key] = float(raw[key])
	for key in raw:
		if key in NUMBER_RAW or key in ["col", "parryClass", "_cCol", "_trail", "_trH", "_trLen", "_trLX", "_trLY"]:
			continue
		if not (raw[key] is bool):
			return _reject("non_bool_flag_" + key)
	# 54543 _sprFr: 공급된 raw 값 보존. 없거나 null 이면 첫 가시 pass2 _draw 에서 공유 RNG*8 로 초기화.
	var spr: Array = _read_field(reflected, "_sprFr")
	if spr[0] == "ok" and spr[1] != null:
		if not _is_number(spr[1]):
			return _reject("non_finite_number__sprFr")
		raw["_sprFr"] = float(spr[1])
	else:
		raw["_sprFr"] = null
	if not (raw["parryClass"] is String):
		return _reject("non_string_parryClass")
	if not (raw["col"] is String):
		return _reject("non_string_col")
	for key in REFLECTED_GATE:
		if raw[key] != true:
			return _reject("not_reflected_blue_state:" + key)
	for key in UNPORTED_BRANCH_FLAGS:
		if raw[key] == true:
			return _reject("unported_branch_" + key)
	var pool: Variant = bindings.get("p_dot_pool")
	if not (pool is Callable) or not (pool as Callable).is_valid():
		return _reject("missing_adapter_pDotPool")
	var opt: Dictionary = SOURCE_OPT_DEFAULT.duplicate()
	var given: Variant = bindings.get("source_opt", {})
	if not (given is Dictionary):
		return _reject("source_opt_not_dictionary")
	for key in given:
		opt[key] = given[key]
	if not (opt["trail"] is bool) or not (opt["deathFx"] is bool) or not _is_number(opt["shake"]):
		return _reject("invalid_source_opt")
	if opt.has("prof_u") and not _is_number(opt["prof_u"]):
		return _reject("invalid_source_opt_prof_u")
	var cam: Variant = bindings.get("camera_position", Callable())
	if not (cam is Callable):
		return _reject("camera_position_not_callable")
	var bounds: Variant = bindings.get("render_bounds", Callable())
	if not (bounds is Callable):
		return _reject("render_bounds_not_callable")
	var query: Variant = bindings.get("query_enemies", Callable())
	if not (query is Callable):
		return _reject("query_enemies_not_callable")
	var sink: Variant = bindings.get("fx_sink")
	if sink != null and not (sink is Object):
		return _reject("fx_sink_not_object")
	p = raw
	world = owner_world
	fx_sink = sink
	source_opt = opt
	_p_dot_pool = pool
	_camera_position = cam
	_render_bounds = bounds
	_query_enemies = query
	_source = reflected
	_adopt_trail()
	position = Vector2(p["x"], p["y"])
	_configured = true
	last_error = ""
	_bound = _bound.filter(func(entry): return is_instance_valid(entry["node"].get_ref()) and not entry["node"].get_ref().ended)
	_bound.append({"node": weakref(self), "source": reflected})
	return true

## 중앙 driver 가 소유를 가져갈 때 호출. native/render 각 phase 의 자체 구동을 끈다.
func bind_external_driver(native_step: bool, render_phase: bool) -> void:
	_external_native = native_step
	_external_render = render_phase
	set_physics_process(not native_step)
	set_process(not render_phase)

func _ready() -> void:
	if not _configured:
		_end("unconfigured")
		return
	process_mode = Node.PROCESS_MODE_PAUSABLE
	# 기존 priority1 투사체 phase(owner AI/경고 → priority1 투사체 → priority2 birth).
	process_physics_priority = 1
	add_to_group("parry_blue_projectiles")
	# 원본 render 는 p.x 를 보간 없이 그린다.
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_OFF
	z_as_relative = false
	z_index = clampi(int(p["y"] / 4.0) + 1, -2000, 4000)
	for pass_id in [PASS_TRAIL, PASS_GLOW, PASS_BODY]:
		var layer := SourcePassLayer.new()
		layer.host = self
		layer.pass_id = pass_id
		layer.name = ["SourceTrailPass0", "SourceGlowPass1", "SourceBodyPass2"][pass_id]
		if pass_id != PASS_BODY:
			var add := CanvasItemMaterial.new()
			add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD   # 원본 'lighter'
			layer.material = add
		add_child(layer)
		_layers.append(layer)
	set_physics_process(not _external_native)
	set_process(not _external_render)

## ── 중앙 World 시계 소비(기존 priority1 투사체와 같은 시계). 사설 전역 driver 없음. ──
func _physics_process(_delta: float) -> void:
	if _external_native or not _configured or ended:
		return
	if not is_instance_valid(world):
		_end("world_ended")
		return
	if not world.has_method("get_native_projectile_fx_context"):
		_gap("world_clock_missing")
		return
	var ctx: Variant = world.get_native_projectile_fx_context()
	if not (ctx is Dictionary) or not _is_number(ctx.get("dt_sp")):
		_gap("world_clock_invalid")
		return
	var frame: float = float(world.get_native_frame()) if world.has_method("get_native_frame") else native_frame
	var enemies: Array = []
	if world.has_method("get_native_world_identity"):
		enemies = world.get_native_world_identity()
	elif world.has_method("get_enemies"):
		enemies = world.get_enemies()
	advance_native_projectile(float(ctx["dt_sp"]), frame, enemies)

## 렌더 시계: 원본 _now=_gameTime+_acc (ms). native step 과 별개의 clock.
func _process(_delta: float) -> void:
	if _external_render or not _configured or ended or not is_instance_valid(world):
		return
	if not world.has_method("get_native_frame"):
		_gap("world_render_clock_missing")
		return
	advance_render_source_phase((float(world.get_native_frame()) + Engine.get_physics_interpolation_fraction()) * PHYS_STEP_MS)

## ── native step: 원본 projs 루프의 1발 1회분 (sp = native ticks). ──
func advance_native_projectile(ticks: float, frame: float, enemies: Array) -> void:
	if not _configured or ended or not is_finite(ticks) or ticks <= 0.0:
		return
	var sp := ticks
	native_steps += 1
	native_frame = frame
	# 35289-35290 카메라 2500px 컬링(수명 감소 전, 무연출)
	var cam: Variant = _camera_xy()
	if cam is Vector2:
		if _d2(p["x"], p["y"], cam.x, cam.y) > CAMERA_CULL_D2:
			_end("camera_cull_2500")
			return
	else:
		_gap("camera_source_missing")
	# 35292 트레일 링
	if source_opt["trail"] and not _any(["mine", "trap", "dimRift", "web", "poisonZone", "fdEnergy"]):
		_trail_update()
	# 35293 수명 감소
	p["life"] -= sp * LIFE_DECAY_PER_TICK
	# 35301 / 35314 반사된 지뢰·덫: 즉시 회수(자원은 패링 루프에서 이미 지급)
	if p["mine"] or p["trap"]:
		_end("recycle_reflected_" + ("mine" if p["mine"] else "trap"))
		return
	# 35367 life<=0 게이트
	if p["life"] <= 0.0:
		var reason := ""
		if p["life"] <= LIFE_KILL_FLOOR:
			reason = "life_le_minus900"
		elif p["redBean"]:
			var ang := atan2(p["vy"], p["vx"])
			if _parry_class() == "physical":
				_fx("boom", [p["x"], p["y"], 60.0, 12.0, "physical"], "_addBoom(p.x,p.y,60,12,'physical')")
				_parts("#ffffff", 12)
			else:
				_fx("boom", [p["x"], p["y"], 40.0, 72.0, "redbean"], "_addBoom(p.x,p.y,40,72,'redbean')")
				_fx("impact", [p["x"], p["y"], int(p["el"]), ang, "explosion"], "_addImpact(...,'explosion')")
				_parts("#ff2200", 12)
			_fx("shake_call", [3.0], "shake(3)")
			reason = "redBean_life_end"
		elif cam is Vector2 and _d2(p["x"], p["y"], cam.x, cam.y) > CAMERA_CULL_D2:
			reason = "life_end_offscreen"
		else:
			p["life"] = 1.0
			life1_extensions += 1
		if reason != "":
			# 35369 deathFx 게이트: _fromRainbow/blackBean/redBean 는 일반 소멸 임팩트 없음
			if source_opt["deathFx"] and not _any(["mine", "trap", "dimRift", "web", "poisonZone", "maliceHunt", "bladeShard", "iceBlade", "_fromRainbow", "redBean", "blackBean"]):
				_fx("impact", [p["x"], p["y"], int(p["el"]), atan2(p["vy"], p["vx"]), null], "_addImpact(p.x,p.y,p.el,ang)")
			_end(reason)
			return
	# 35389 적 유도는 !friendly 전용 → 반사탄은 미적용. 35414 blueBean 유도
	if p["blueBean"] and p["friendly"] and p["homing"]:
		var target: Object = null
		var best := HOMING_QUERY_R
		for e in _query("homing", enemies, p["x"], p["y"], HOMING_QUERY_R):
			if not _alive(e):
				continue
			var ep: Vector2 = _epos(e)
			var d := sqrt(_d2(p["x"], p["y"], ep.x, ep.y))
			if d < best:
				best = d
				target = e
		homing_target_id = target.get_instance_id() if target != null else 0
		if target != null:
			var tp: Vector2 = _epos(target)
			var want := atan2(tp.y - p["y"], tp.x - p["x"])
			var cur := atan2(p["vy"], p["vx"])
			var diff := want - cur
			while diff > PI:
				diff -= TAU
			while diff < -PI:
				diff += TAU
			var turn := minf(absf(diff), HOMING_TURN_PER_TICK * sp) * signf(diff)
			var spd := sqrt(p["vx"] * p["vx"] + p["vy"] * p["vy"])
			p["vx"] = cos(cur + turn) * spd
			p["vy"] = sin(cur + turn) * spd
		_trail_particle()
	# 35429-35431 이동
	p["x"] += p["vx"] * sp
	p["y"] += p["vy"] * sp
	p["dist"] += sp * sqrt(p["vx"] * p["vx"] + p["vy"] * p["vy"])
	position = Vector2(p["x"], p["y"])
	z_index = clampi(int(p["y"] / 4.0) + 1, -2000, 4000)
	# 35434 탄막블랙홀 포획: 지형·충돌 생략
	if p["_lvPull"]:
		return
	# 35436 _projEmit 서브 파티클(OPT.parts>=60): 전역 _gcT 와 projs 인덱스 필요 → 미이식(gap)
	if _is_number(source_opt.get("parts")) and float(source_opt["parts"]) >= 60.0:
		_gap("projEmit_subparticle_unported")
	# 35448-35455 벽: isW(nx,p.y)/isW(p.x,ny) 는 이동 후 같은 좌표
	if not p["_lessonShot"] and world.is_world_blocked(Vector2(p["x"], p["y"])):
		if p["_fromRainbow"]:
			_fx("boom", [p["x"], p["y"], RAINBOW_BOOM_R, RAINBOW_BOOM_LIFE, "rainbow_light"], "_rainbowImpact(p.x,p.y)")
		else:
			_fx("impact", [p["x"], p["y"], int(p["el"]), atan2(p["vy"], p["vx"]), "explosion"], "_addImpact(...,'explosion')")
		_parts("#00ccff", 6)
		_end("wall")
		return
	# 35721 아군탄 접촉
	var spd_now := sqrt(p["vx"] * p["vx"] + p["vy"] * p["vy"])
	var hit_r := maxf(FRIENDLY_HIT_MIN_R, _or(p["r"], 4.0) + minf(FRIENDLY_HIT_SPEED_CAP, spd_now * 0.5))
	for e in _query("contact", enemies, p["x"], p["y"], hit_r + FRIENDLY_QUERY_PAD):
		if not _alive(e):
			continue
		if _jsnum(e.get("_bluHitCD") if "_bluHitCD" in e else null) > 0.0:
			continue
		var ep: Vector2 = _epos(e)
		var er: Variant = _erad(e)
		if er == null:
			continue
		if sqrt(_d2(p["x"], p["y"], ep.x, ep.y)) < float(er) + hit_r:
			if p["friendly"] and p["redBean"]:
				if "_bluHitCD" in e:
					e.set("_bluHitCD", 3)
				else:
					_gap("target_bluHitCD_missing")
			_aoe_blast(enemies)
			_end("hit")
			return

## 35738-35749 반사 폭발 (bomb 분기는 구성 단계에서 거부됨)
func _aoe_blast(enemies: Array) -> void:
	var bl_r := _or(p["_aoeR"], AOE_R_FALLBACK)
	var bl_d := _or(p["_aoeDmg"], _or(p["dmg"], AOE_DMG_FALLBACK))
	for be in _query("aoe", enemies, p["x"], p["y"], bl_r):
		if not _alive(be):
			continue
		var bp: Vector2 = _epos(be)
		var bd := sqrt(_d2(p["x"], p["y"], bp.x, bp.y))
		if bd > bl_r:
			continue
		var ba := atan2(bp.y - p["y"], bp.x - p["x"])
		var bf := maxf(0.0, 1.0 - bd / bl_r)
		var opts := {"kbMult": AOE_KB_MULT, "magic": bool(p["magic"]), "blueBean": bool(p["blueBean"]),
			"parryBlueBean": bool(p["parryBlueBean"]), "_lessonParryShot": self if p["_lessonShot"] else null,
			"atkEl": int(p["el"])}
		var rec := _call_hurt(be, int(bl_d * (0.8 + bf * 0.2)), ba, opts)
		rec["status"] = _apply_status(be, ba, bf, bl_d)
		hurt_log.append(rec)
	if p["blackHoleBurst"]:
		_gap("blackHoleBurst_fx_unported")
	elif p["_fromRainbow"]:
		_fx("boom", [p["x"], p["y"], RAINBOW_BOOM_R, RAINBOW_BOOM_LIFE, "rainbow_light"], "_rainbowImpact(p.x,p.y)")
	else:
		_fx("boom", [p["x"], p["y"], bl_r, 72.0, "redbean"], "_addBoom(p.x,p.y,_blR,72,'redbean')")
	_fx("sfx", ["detonate"], "SFX.detonate()")
	_fx("shake_set", [18.0 * float(source_opt["shake"]) / 100.0], "G.shake=18*OPT.shake/100")
	_fx("slow_mo_if_idle", [25.0], "if(G.slowMo<=0)G.slowMo=25")
	_parts("#00ccff", 20)
	_text(p["x"], p["y"] - 20.0, "💥반사 폭발!", "#00e5ff", 50)

## hurtE(be, dmg, ba, false, opts, p.el). 원본 hurtE 는 대상 소유(ENGINE adapter)다.
func _call_hurt(e: Object, amount: int, ang: float, opts: Dictionary) -> Dictionary:
	var rec := {"target_id": e.get_instance_id(), "amount": amount, "ang": ang, "atkEl": int(p["el"]),
		"opts": {"kbMult": opts["kbMult"], "magic": opts["magic"], "blueBean": opts["blueBean"],
			"parryBlueBean": opts["parryBlueBean"], "_lessonParryShot": opts["_lessonParryShot"] != null},
		"hp_before": e.get("hp") if "hp" in e else null, "poise_before": e.get("poise") if "poise" in e else null,
		"method": "", "poise_request": "none_source_opts_lack_poiseHit"}
	if e.has_method("hurtE"):
		e.call("hurtE", amount, ang, false, opts, int(p["el"]))
		rec["method"] = "hurtE"
	elif e.has_method("receive_damage"):
		var argc: int = e.get_method_argument_count("receive_damage")
		if argc >= 4:
			e.call("receive_damage", amount, Vector2.from_angle(ang), SOURCE_TAG, opts)
			rec["method"] = "receive_damage/4"
		elif argc == 3:
			e.call("receive_damage", amount, Vector2.from_angle(ang), SOURCE_TAG)
			rec["method"] = "receive_damage/3"
			_gap("target_receive_damage_drops_source_opts")
		else:
			_gap("target_receive_damage_arity")
	else:
		_gap("target_hurt_api_missing")
	rec["hp_after"] = e.get("hp") if "hp" in e else null
	rec["poise_after"] = e.get("poise") if "poise" in e else null
	return rec

## 35744-35745 넉백 + 중독(+3/600/풀 pDotPool×폭발뎀×15%/poison=1)
func _apply_status(be: Object, ba: float, bf: float, bl_d: float) -> Dictionary:
	var out := {"kb": "", "poison": ""}
	var kbv := Vector2(cos(ba) * AOE_KB * bf, sin(ba) * AOE_KB * bf)
	if be.has_method("add_native_knockback"):
		be.call("add_native_knockback", kbv)
		out["kb"] = "add_native_knockback"
	elif "kb" in be and be.get("kb") is Vector2:
		be.set("kb", be.get("kb") + kbv)
		out["kb"] = "kb"
	elif "kb" in be and be.get("kb") is Dictionary:
		var kb: Dictionary = be.get("kb")
		kb["x"] = _jsnum(kb.get("x")) + kbv.x
		kb["y"] = _jsnum(kb.get("y")) + kbv.y
		out["kb"] = "kb"
	else:
		_gap("target_kb_adapter_missing")
		out["kb"] = "missing"
	var pool: Variant = _p_dot_pool.call() if _p_dot_pool.is_valid() else null
	if not _is_number(pool):
		_gap("pDotPool_invalid")
		out["poison"] = "pDotPool_invalid"
		return out
	var pool_add := float(pool) * bl_d * POISON_POOL_RATE
	if "poisonT" in be and "poisonStk" in be and "_poisonPool" in be and "poison" in be:
		be.set("poisonT", maxf(_jsnum(be.get("poisonT")), POISON_T))
		be.set("poisonStk", mini(POISON_STK_MAX, int(_jsnum(be.get("poisonStk"))) + POISON_STK_ADD))
		be.set("_poisonPool", _jsnum(be.get("_poisonPool")) + pool_add)
		be.set("poison", 1)
		out["poison"] = "source_fields"
	elif be.has_method("apply_native_poison_source"):
		be.call("apply_native_poison_source", {"poisonT": POISON_T, "poisonStkAdd": POISON_STK_ADD,
			"poisonStkMax": POISON_STK_MAX, "poolAdd": pool_add, "poison": 1})
		out["poison"] = "apply_native_poison_source"
	else:
		_gap("target_poison_adapter_missing")
		out["poison"] = "missing"
	out["pool_add"] = pool_add
	return out

## 35427 스카이블루 트레일 입자. 공유 RNG 소비 순서는 JS 인자 평가 순서 그대로.
func _trail_particle() -> void:
	if not source_opt.has("prof_u"):
		_gap("prof_u_unported_trail_particle_skipped")
		return
	if not world.has_method("sample_native_random_unit") or not world.has_method("emit_native_channel_particle"):
		_gap("world_particle_api_missing")
		return
	var threshold := 0.15 if float(source_opt["prof_u"]) > 12.0 else 0.5
	if float(world.sample_native_random_unit()) >= threshold:
		return
	var pvx := (float(world.sample_native_random_unit()) - 0.5) * 3.0
	var pvy := (float(world.sample_native_random_unit()) - 0.5) * 3.0
	var col := "#00e5ff"
	if float(world.sample_native_random_unit()) >= 0.3:
		col = "#40f0ff" if float(world.sample_native_random_unit()) < 0.6 else "#80ffff"
	var psz := 2.5 + float(world.sample_native_random_unit()) * 3.0
	var plife := 10.0 + float(world.sample_native_random_unit()) * 6.0
	world.emit_native_channel_particle({"x": p["x"], "y": p["y"], "vx": pvx, "vy": pvy, "col": col, "sz": psz, "life": plife})
	effect_log.append({"kind": "trail_particle", "args": [p["x"], p["y"], pvx, pvy, col, psz, plife], "source": "poolPart(p.x,p.y,...)"})

## ── 중앙 권한 API ──
## 방 전환(원본 projs.length=0 + _recycleProj): 중앙만 호출.
func native_room_reset() -> void:
	_end("room_reset")

## 원본 탄 상한(35277-35283): 장판류 제외, life/ml<.3 이면 회수 대상. 판단·호출은 중앙.
func is_cap_evictable() -> bool:
	if not _configured or ended or _any(["mine", "trap", "poisonZone", "iceZone", "dimRift", "_coralSpike"]):
		return false
	return p["life"] / p["ml"] < 0.3

func native_cap_evict() -> bool:
	if not is_cap_evictable():
		return false
	_end("projectile_cap_evict")
	return true

## ── 렌더 소스 phase ──
func advance_render_source_phase(now_ms: float) -> void:
	if not is_finite(now_ms):
		return
	render_now_ms = now_ms
	render_phase_updates += 1
	for layer in _layers:
		layer.queue_redraw()

## pass 별 원본 그리기 명령(월드 좌표). _draw 가 그대로 실행한다.
func render_source_commands(pass_id: int) -> Array:
	var out: Array = []
	if not _configured or _render_visibility() in ["ended", "culled"]:
		return out
	match pass_id:
		PASS_TRAIL:
			_cmd_trail(out)
		PASS_GLOW:
			_cmd_glow(out)
		PASS_BODY:
			_cmd_body(out)
	return out

func _trail_pass_active() -> bool:
	return source_opt["trail"] and (not p["_druidPoison"] or p["friendly"]) and not _any(["mine", "trap", "dimRift", "web", "poisonZone", "fdEnergy", "waterBean", "elemBall"]) and _trail_ready and _trLen > 1

## 54510-54525 pass0 트레일(올챙이불 꼬리, lighter, round cap)
func _cmd_trail(out: Array) -> void:
	if not _trail_pass_active():
		return
	var now := render_now_ms
	var tc: String = "#ffdd00" if p["friendly"] else _elc_or_col()
	var flk := 0.72 + sin(now * 0.05 + p["x"] * 0.3) * 0.28
	var hr := maxf(2.5, _or(p["sz"], 1.0) * 2.2) * flk * _physical_multiplier(2.0) * (0.55 if _is_biting_physical() else 1.0)
	for ti in range(_trLen - 1):
		var a: Vector2 = _trail[(_trH - 1 - ti + TRAIL_SLOTS) % TRAIL_SLOTS]
		var b: Vector2 = _trail[(_trH - 1 - (ti + 1) + TRAIL_SLOTS) % TRAIL_SLOTS]
		var tf := 1.0 - float(ti) / float(_trLen)
		out.append({"op": "stroke", "a": a, "b": b, "width": maxf(0.6, hr * tf), "color": _rgba(tc, tf * 0.5), "cap": "round"})

## 54530-54539 pass1 additive 글로우
func _cmd_glow(out: Array) -> void:
	if p["_druidPoison"] or _or(p["_eyeSkin"], 0.0) != 0.0 or _any(["fdEnergy", "fbEnergy", "waterBean", "elemBall"]):
		return
	var now := render_now_ms
	var gc := ""
	if p["redBean"] and _parry_class() == "physical":
		gc = "#dce7f0"
	elif p["_cCol"] is String and p["_cCol"] != "":
		gc = p["_cCol"]
	elif p["trap"]:
		gc = "#ff2200"
	elif (p["iceZone"] or p["blizzard"]) and int(p["el"]) == EL_D:
		gc = "#5e10a8"
	elif p["bwBean"]:
		gc = "#ffffff"
	elif p["gbBean"]:
		gc = "#cc44ff"
	elif p["blackBean"]:
		gc = "#ff00ff"
	elif p["redBean"]:
		gc = "#ff2200"
	elif p["waterBean"]:
		gc = "#317cec"
	elif p["blueBean"]:
		gc = "#00ccff"
	else:
		gc = _elc_or_col()
	var spec := _any(["redBean", "blackBean", "blueBean", "bwBean", "gbBean", "waterBean"])
	var glr := 12.0 if spec else 6.0
	var pulse := 0.7 + sin(now / 200.0 + p["x"]) * 0.3
	var c := Vector2(p["x"], p["y"])
	out.append({"op": "circle", "c": c, "r": glr, "color": _rgba(gc, (0.35 if spec else 0.08) * pulse)})
	if spec:
		out.append({"op": "circle", "c": c, "r": glr * 2.5, "color": _rgba(gc, 0.12 * pulse)})

## 54542-54710 pass2 본체 분기 순서 그대로. 미이식 분기는 대체 외형 없이 사유만 기록.
func _cmd_body(out: Array) -> void:
	var fa := minf(1.0, p["life"] / _or(p["ml"], 60.0)) if (p["mine"] or p["bomb"]) else 1.0
	if p["_druidPoison"] and not p["friendly"]:
		last_render_branch = "unported:_druidPoison"
		return
	for flag in ["trap", "web", "mine", "iceZone", "blizzard", "fdEnergy", "fbEnergy", "elemBall", "poisonZone", "dimRift"]:
		if p[flag]:
			last_render_branch = "unported:" + flag
			return
	var ps := maxf(1.2, minf(4.0, _or(p["sz"], 1.0) * 1.5)) * 0.7
	var s_sc := ps * _physical_multiplier(2.0)
	var cls := _parry_class()
	if p["swordWave"] and cls != "physical":
		last_render_branch = "swordWave_circle"
		var sw: String = ELC[int(p["el"])] if int(p["el"]) >= 0 and int(p["el"]) < ELC.size() else "#ff2200"
		out.append({"op": "circle", "c": Vector2(p["x"], p["y"]), "r": 4.0 * s_sc, "color": _rgba(sw, fa * 0.9)})
		out.append({"op": "circle", "c": Vector2(p["x"], p["y"]), "r": 1.5 * s_sc, "color": _rgba("#ffffff", fa * 0.6)})
		return
	if p["titanEye"]:
		last_render_branch = "unported_resource:" + TITAN_EYE_SOURCE
		return
	if cls == "physical":
		last_render_branch = "unported_resource:" + PHYS_MOUTH_SOURCE
		return
	if p["blackBean"]:
		last_render_branch = "blackBean_classicRainbow"
		_cmd_classic_rainbow(out, fa, s_sc)
		return
	if p["blueBean"]:
		last_render_branch = "blueBean_classicRainbow"
		_cmd_classic_rainbow(out, fa, s_sc)
		return
	last_render_branch = "unported:non_blue"

## 24539-24570 _drawClassicRainbow (절차형 원본 — 현행 blackBean/blueBean 분기가 실제 사용)
func _cmd_classic_rainbow(out: Array, fa: float, s_sc: float) -> void:
	var now := render_now_ms
	var x: float = p["x"]
	var y: float = p["y"]
	var c := Vector2(x, y)
	var rb := 3.5 * s_sc
	var pulse := 0.8 + sin(now / 50.0 + x * 0.3) * 0.2
	var flk := 1.0 if sin(now / 35.0 + y * 0.2) > 0.1 else 0.6
	var bk_t := now * 0.3 + x * 0.5 + y * 0.3
	var ri := int(bk_t / 60.0) % 7
	var idx := [ri, (ri + 1) % 7, (ri + 2) % 7, (ri + 3) % 7]
	var cap := "round" if _trail_pass_active() else "butt"
	_rc_circle(out, c, rb * 3.5, idx[0], fa * 0.12 * pulse)
	_rc_circle(out, c, rb * 2.2, idx[1], fa * 0.2 * flk)
	_rc_circle(out, c, rb, idx[2], fa * 0.85 * flk)
	_rc_circle(out, c, rb * 0.6, idx[3], fa * 0.9)
	out.append({"op": "circle", "c": Vector2(x - rb * 0.15, y - rb * 0.2), "r": rb * 0.3, "color": _rgba("#ffffff", fa * 0.7 * flk)})
	var gv := Vector2(p["vx"], p["vy"])
	_rc_stroke(out, c, c - gv * 7.0, rb * 1.8, idx[0], fa * 0.15, cap)
	_rc_stroke(out, c, c - gv * 5.0, rb * 1.1, idx[1], fa * 0.25 * flk, cap)
	_rc_stroke(out, c, c - gv * 3.0, rb * 0.5, idx[2], fa * 0.35, cap)
	for fi in range(4):
		var fa2 := now / 25.0 + fi * PI / 2.0 + x * 0.2
		var fr := rb * 1.5 + sin(now / 30.0 + fi * 3.0) * rb * 0.5
		var ci := (ri + fi) % 7
		if ci < 0:
			out.append({"op": "skip_undefined_color", "index": ci})
			continue
		out.append({"op": "rect", "pos": Vector2(x + cos(fa2) * fr - 1.0, y + sin(fa2) * fr - 1.0), "size": Vector2(2.0, 2.0),
			"color": _rgba(BEAN_RAINBOW[ci], fa * (0.2 + sin(now / 40.0 + fi) * 0.1))})

func _rc_circle(out: Array, c: Vector2, r: float, index: int, alpha: float) -> void:
	if index < 0:
		out.append({"op": "skip_undefined_color", "index": index})
		return
	out.append({"op": "circle", "c": c, "r": r, "color": _rgba(BEAN_RAINBOW[index], alpha)})

func _rc_stroke(out: Array, a: Vector2, b: Vector2, w: float, index: int, alpha: float, cap: String) -> void:
	if index < 0:
		out.append({"op": "skip_undefined_color", "index": index})
		return
	out.append({"op": "stroke", "a": a, "b": b, "width": w, "color": _rgba(BEAN_RAINBOW[index], alpha), "cap": cap})

## SourcePassLayer._draw 가 호출. 월드 좌표 명령을 이 노드 기준 로컬로 실행한다(부모=World 원점 가정).
func _draw_pass(layer: CanvasItem, pass_id: int) -> int:
	# 원본은 회수된 탄을 projs 에서 빼고 렌더하므로 ended 는 0 op. 컬링은 렌더 전용(native 수명/이동은 계속).
	if not _configured or _render_visibility() in ["ended", "culled"]:
		_record_draw(pass_id, 0)
		return 0
	# 54543 가시 pass2 진입 시 _sprFr 가변 render 상태 1회 소비(파란 절차형 렌더러는 값을 쓰지 않음)
	if pass_id == PASS_BODY:
		_advance_spr_fr()
	var origin := Vector2(p["x"], p["y"])
	var ops := 0
	for cmd in render_source_commands(pass_id):
		match cmd["op"]:
			"circle":
				layer.draw_circle(cmd["c"] - origin, cmd["r"], cmd["color"])
				ops += 1
			"rect":
				layer.draw_rect(Rect2(cmd["pos"] - origin, cmd["size"]), cmd["color"], true)
				ops += 1
			"stroke":
				var a: Vector2 = cmd["a"] - origin
				var b: Vector2 = cmd["b"] - origin
				if cmd["cap"] == "round":
					layer.draw_colored_polygon(_capsule(a, b, cmd["width"]), cmd["color"])
				elif a != b:
					layer.draw_line(a, b, cmd["color"], cmd["width"])
				ops += 1
	_record_draw(pass_id, ops)
	return ops

func _record_draw(pass_id: int, ops: int) -> void:
	var entry: Dictionary = draw_trace.get(pass_id, {"invocations": 0})
	entry["invocations"] = int(entry["invocations"]) + 1
	entry["ops"] = ops
	entry["render_now_ms"] = render_now_ms
	entry["branch"] = last_render_branch
	entry["visibility"] = last_visibility
	draw_trace[pass_id] = entry

## 53172-53173 / 54508: 중심 좌표가 경계 밖(엄격)이면 비가시, 경계는 포함. 경계는 중앙이 계산한 원본 값만 사용.
func _render_visibility() -> String:
	if ended:
		last_visibility = "ended"
		return last_visibility
	var rect: Variant = null
	if _render_bounds.is_valid():
		rect = _render_bounds.call()
	elif is_instance_valid(world) and world.has_method("get_native_source_projectile_render_bounds"):
		rect = world.get_native_source_projectile_render_bounds()
	else:
		_gap("render_bounds_central_binding_missing")
		last_visibility = "unbound"
		return last_visibility
	if not (rect is Rect2):
		_gap("render_bounds_invalid")
		last_visibility = "unbound"
		return last_visibility
	var r2: Rect2 = rect
	var x: float = p["x"]
	var y: float = p["y"]
	if x < r2.position.x or x > r2.end.x or y < r2.position.y or y > r2.end.y:
		last_visibility = "culled"
	else:
		last_visibility = "visible"
	return last_visibility

func _advance_spr_fr() -> void:
	if p.get("_sprFr") == null:
		if not is_instance_valid(world) or not world.has_method("sample_native_random_unit"):
			_gap("world_rng_missing_sprFr_init")
			return
		p["_sprFr"] = float(world.sample_native_random_unit()) * 8.0
	p["_sprFr"] += 0.12
	spr_fr_advances += 1

func _capsule(a: Vector2, b: Vector2, w: float) -> PackedVector2Array:
	var r := w * 0.5
	var d := b - a
	var ang := d.angle() if d.length_squared() > 0.0 else 0.0
	var pts := PackedVector2Array()
	for i in range(CAP_SEGMENTS + 1):
		pts.append(b + Vector2.from_angle(ang - PI / 2.0 + PI * float(i) / CAP_SEGMENTS) * r)
	for i in range(CAP_SEGMENTS + 1):
		pts.append(a + Vector2.from_angle(ang + PI / 2.0 + PI * float(i) / CAP_SEGMENTS) * r)
	return pts

func get_snapshot() -> Dictionary:
	var raw := p.duplicate()
	raw.erase("_trail")
	var trail: Array = []
	for i in range(_trLen):
		var v: Vector2 = _trail[(_trH - 1 - i + TRAIL_SLOTS) % TRAIL_SLOTS]
		trail.append([v.x, v.y])
	return {"schema": "exoduser.godot.parry-blue-projectile.v1", "configured": _configured, "raw": raw,
		"ended": ended, "end_reason": end_reason, "last_error": last_error, "native_steps": native_steps,
		"native_frame": native_frame, "render_now_ms": render_now_ms, "render_phase_updates": render_phase_updates,
		"life1_extensions": life1_extensions, "homing_target_id": homing_target_id,
		"render_branch": last_render_branch, "parry_class": _parry_class() if _configured else "",
		"trail_newest_first": trail, "hurt_log": hurt_log.duplicate(true), "effect_log": effect_log.duplicate(true),
		"gaps": gaps.duplicate(), "draw_trace": draw_trace.duplicate(true),
		"query_log": query_log.duplicate(true), "last_visibility": last_visibility, "spr_fr_advances": spr_fr_advances,
		"external_native": _external_native, "external_render": _external_render}

## ── 내부 ──
func _end(reason: String) -> void:
	if ended:
		return
	ended = true
	end_reason = reason
	set_physics_process(false)
	set_process(false)
	# 자기 Node 만 숨기고 해제. 이미 World/sink 로 방출된 연출은 독립적으로 유지된다.
	visible = false
	projectile_ended.emit(reason, get_snapshot())
	if is_inside_tree():
		queue_free()

func _reject(reason: String) -> bool:
	last_error = reason
	return false

func _gap(key: String) -> void:
	gaps[key] = int(gaps.get(key, 0)) + 1

func _fx(kind: String, args: Array, source_call: String) -> void:
	effect_log.append({"kind": kind, "args": args, "source": source_call})
	var method: String = FX_METHODS[kind]
	if fx_sink != null and is_instance_valid(fx_sink) and fx_sink.has_method(method):
		fx_sink.callv(method, args)
	else:
		_gap("fx_sink_missing_" + method)

func _parts(color: String, count: int) -> void:
	effect_log.append({"kind": "parts", "args": [p["x"], p["y"], color, count], "source": "addParts(p.x,p.y,col,n)"})
	if world.has_method("emit_native_parts"):
		world.emit_native_parts(Vector2(p["x"], p["y"]), color, count)
	elif fx_sink != null and is_instance_valid(fx_sink) and fx_sink.has_method("add_parts"):
		fx_sink.call("add_parts", p["x"], p["y"], color, count)
	else:
		_gap("parts_sink_missing")

func _text(x: float, y: float, text: String, color: String, life: int) -> void:
	effect_log.append({"kind": "text", "args": [x, y, text, color, life], "source": "addTxt(p.x,p.y-20,...)"})
	if world.has_method("emit_native_text"):
		world.emit_native_text(x, y, text, color, life)
	else:
		_gap("text_sink_missing")

func _adopt_trail() -> void:
	_trail = []
	for i in range(TRAIL_SLOTS):
		_trail.append(Vector2.ZERO)
	var given: Variant = p.get("_trail")
	if given is Array and _is_number(p.get("_trH")) and _is_number(p.get("_trLen")) and _is_number(p.get("_trLX")) and _is_number(p.get("_trLY")):
		for i in range(mini(TRAIL_SLOTS, given.size())):
			var v: Variant = given[i]
			if v is Vector2:
				_trail[i] = v
			elif v is Dictionary and _is_number(v.get("x")) and _is_number(v.get("y")):
				_trail[i] = Vector2(v["x"], v["y"])
		_trH = int(p["_trH"])
		_trLen = int(p["_trLen"])
		_trLX = float(p["_trLX"])
		_trLY = float(p["_trLY"])
		_trail_ready = true
	for key in ["_trail", "_trH", "_trLen", "_trLX", "_trLY"]:
		p.erase(key)

func _trail_update() -> void:
	if not _trail_ready:
		_trH = 0
		_trLen = 0
		_trLX = p["x"]
		_trLY = p["y"]
		_trail_ready = true
	var dx: float = p["x"] - _trLX
	var dy: float = p["y"] - _trLY
	if dx * dx + dy * dy >= TRAIL_MIN_STEP2:
		_trail[_trH % TRAIL_SLOTS] = Vector2(p["x"], p["y"])
		_trH = (_trH + 1) % TRAIL_SLOTS
		if _trLen < TRAIL_SLOTS:
			_trLen += 1
		_trLX = p["x"]
		_trLY = p["y"]

## 원본 shQuery 호출 지점(유도/접촉/AoE). 공급자 출력은 필터·재정렬 없이 그대로 순회한다(alive/거리 검사는 원본 루프 몫).
func _query(site: String, enemies: Array, x: float, y: float, r: float) -> Array:
	var out: Variant = null
	var provider := ""
	if _query_enemies.is_valid():
		out = _query_enemies.call(x, y, r)
		provider = "binding"
	elif world.has_method("query_native_enemies"):
		out = world.query_native_enemies(x, y, r)
		provider = "world"
	else:
		_gap("source_spatial_query_order_unavailable_reconstructed")
		out = _sh_query(enemies, x, y, r)
		provider = "reconstructed"
	if not (out is Array):
		_gap("query_provider_invalid_result")
		out = []
	query_log.append({"site": site, "x": x, "y": y, "r": r, "provider": provider, "count": out.size()})
	if query_log.size() > 16:
		query_log.pop_front()
	return out

## 재구성 폴백: SHASH_CELL 셀 스캔(cy→cx). 원본 shRebuild 버킷 변이/stale 셀/셀 내 순서는 보존 불가(gap 기록).
func _sh_query(enemies: Array, x: float, y: float, r: float) -> Array:
	var cx0 := int((x - r) / SHASH_CELL)
	var cx1 := int((x + r) / SHASH_CELL)
	var cy0 := int((y - r) / SHASH_CELL)
	var cy1 := int((y + r) / SHASH_CELL)
	var cells := {}
	for e in enemies:
		if not (e is Object) or not is_instance_valid(e):
			continue
		var ep: Vector2 = _epos(e)
		if not ep.is_finite():
			continue
		var key := Vector2i(int(ep.x / SHASH_CELL), int(ep.y / SHASH_CELL))
		if not cells.has(key):
			cells[key] = []
		cells[key].append(e)
	var out: Array = []
	for cy in range(cy0, cy1 + 1):
		for cx in range(cx0, cx1 + 1):
			var key := Vector2i(cx, cy)
			if cells.has(key):
				out.append_array(cells[key])
	return out

func _camera_xy() -> Variant:
	if _camera_position.is_valid():
		var v: Variant = _camera_position.call()
		return v if v is Vector2 else null
	if is_inside_tree():
		var camera := get_viewport().get_camera_2d()
		if camera != null:
			return camera.get_screen_center_position()
	# 원본 폴백: G.cam 없으면 P.x/P.y
	if "player" in world and is_instance_valid(world.get("player")):
		return world.get("player").global_position
	return null

func _epos(e: Object) -> Vector2:
	if e is Node2D:
		return e.global_position if e.is_inside_tree() else e.position
	if "x" in e and "y" in e:
		return Vector2(float(e.get("x")), float(e.get("y")))
	return Vector2.INF

func _erad(e: Object) -> Variant:
	if "r" in e and _is_number(e.get("r")):
		return float(e.get("r"))
	if "radius" in e and _is_number(e.get("radius")):
		return float(e.get("radius"))
	_gap("target_radius_missing")
	return null

func _alive(e: Variant) -> bool:
	if not (e is Object) or not is_instance_valid(e):
		return false
	if not ("alive" in e):
		_gap("target_alive_missing")
		return false
	return e.get("alive") == true and _epos(e).is_finite()

## 17308 _projectileParryClass — raw parryClass 우선. 색으로 추론하지 않는다.
func _parry_class() -> String:
	if p["parryClass"] is String and p["parryClass"] != "":
		return p["parryClass"]
	if p["fbEnergy"] or p["fdEnergy"] or p["mine"] or p["trap"] or p["blackBean"]:
		return "magic"
	if _any(["friendly", "noParry", "bomb", "web", "poisonZone", "iceZone", "blizzard", "dimRift", "elemBall", "_coralSpike"]):
		return "forbidden"
	if _any(["gbBean", "blueBean", "fireMagic", "waterBean"]):
		return "magic"
	if p["titanEye"] or p["bwBean"]:
		return "physical"
	return "physical" if int(p["el"]) == 0 else "magic"

func _physical_multiplier(scale: float) -> float:
	return scale if not p["friendly"] and _parry_class() == "physical" else 1.0

func _is_biting_physical() -> bool:
	return not p["friendly"] and not p["titanEye"] and not p["_druidPoison"] and not p["fbEnergy"] and not p["fdEnergy"] and _parry_class() == "physical"

func _elc_or_col() -> String:
	var el := int(p["el"])
	if el >= 0 and el < ELC.size():
		return ELC[el]
	return p["col"] if p["col"] != "" else "#ff4444"

func _any(keys: Array) -> bool:
	for key in keys:
		if p.get(key) == true:
			return true
	return false

func _read_field(src: Variant, key: String) -> Array:
	var alias: String = ALIASES.get(key, "")
	var has_raw := false
	var has_alias := false
	var raw_v: Variant = null
	var alias_v: Variant = null
	if src is Dictionary:
		has_raw = src.has(key)
		raw_v = src.get(key)
		if alias != "":
			has_alias = src.has(alias)
			alias_v = src.get(alias)
	else:
		has_raw = key in src
		raw_v = src.get(key) if has_raw else null
		if alias != "":
			has_alias = alias in src
			alias_v = src.get(alias) if has_alias else null
	if has_raw and has_alias and raw_v != alias_v:
		return ["conflict", null]
	if has_raw:
		return ["ok", raw_v]
	if has_alias:
		return ["ok", alias_v]
	return ["missing", null]

static func _is_number(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))

## JS `v||fallback` (숫자 0/NaN 은 falsy)
static func _or(v: Variant, fallback: float) -> float:
	if (v is int or v is float) and float(v) != 0.0 and not is_nan(float(v)):
		return float(v)
	return fallback

static func _jsnum(v: Variant) -> float:
	return float(v) if (v is int or v is float) and not is_nan(float(v)) else 0.0

static func _d2(ax: float, ay: float, bx: float, by: float) -> float:
	return (ax - bx) * (ax - bx) + (ay - by) * (ay - by)

static func _rgba(html: String, alpha: float) -> Color:
	var c := Color(html)
	c.a = clampf(alpha, 0.0, 1.0)
	return c

class SourcePassLayer extends Node2D:
	var host
	var pass_id := 0
	var draw_invocations := 0
	var last_ops := 0

	func _draw() -> void:
		if not is_instance_valid(host):
			return
		draw_invocations += 1
		last_ops = host._draw_pass(self, pass_id)
