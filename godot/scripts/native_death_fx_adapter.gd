class_name ExoduserNativeDeathFxAdapter
extends Node2D
## P2-001b — 사망 연출·피격 임팩트의 World 소유 어댑터 (원본 행 근거 주석).
## 시스템: 핏자국(_stains 24886~)·시체(_corpses 24915~/34638~/54529~)·고어(_gorePieces
## 25199~/34607~/54562~)·데드 임팩트(_diPool 25180~/34616~/54568)·death_blood VFX 애님
## (19679 등록/54571~ 렌더)·히트 임팩트(_impacts 25414~/34644/54720~)·홀리 버스트
## (19172~/19178~, impact_basic_sheet 공유). 수치·색·수명·개수 원본 그대로.
## RNG: 시각 전용 — world.sample_native_random_unit() (기존 hit-fx 어댑터와 동일 관례,
## provider 추적 롤(rng_draws)에는 나타나지 않음). 고어 카테고리 선택 3건만은 hurtE가
## 이미 소비한 provider 롤 값(42726~42731)을 받아 쓴다 — 추가 소비 없음.
## 사망 사운드(24790~24830)는 sfx/death 에셋 미복사로 미이식 — 목록 보고, 카운터만.

const GORE_TYPES: Array[String] = ["spine", "spine_broken", "intestine_1", "intestine_2",
	"intestine_3", "stomach", "liver", "flesh_chunk_2", "flesh_chunk_3", "flesh_chunk_4",
	"flesh_chunk_5", "flesh_chunk_6", "blood_splat_1", "bone_1", "bone_2", "bone_3",
	"bone_4", "bone_5", "eye", "eye_bloody", "eye_torn", "skull_chunk", "skull_half",
	"skull_crushed", "heart", "heart_damaged", "tooth_1", "tooth_2", "finger_1",
	"finger_2", "severed_hand", "tendon_1", "tendon_2"] # 25201~25214 _GORE_TYPES
const GORE_CAT: Dictionary = { # 25221~ _GORE_CAT
	"flesh": ["flesh_chunk_2", "flesh_chunk_3", "flesh_chunk_4", "flesh_chunk_5", "flesh_chunk_6"],
	"blood": ["blood_splat_1"], "spine": ["spine", "spine_broken"],
	"intestine": ["intestine_1", "intestine_2", "intestine_3"], "organ": ["stomach", "liver"],
	"bone": ["bone_1", "bone_2", "bone_3", "bone_4", "bone_5"],
	"eye": ["eye", "eye_bloody", "eye_torn"], "skull": ["skull_chunk", "skull_half", "skull_crushed"],
	"heart": ["heart", "heart_damaged"], "tooth": ["tooth_1", "tooth_2"],
	"finger": ["finger_1", "finger_2", "severed_hand"], "tendon": ["tendon_1", "tendon_2"]}
const GORE_SZ: Dictionary = {"spine": 40, "spine_broken": 34, "intestine_1": 35, "intestine_2": 33,
	"intestine_3": 36, "stomach": 32, "liver": 30, "flesh_chunk_2": 28, "flesh_chunk_3": 30,
	"flesh_chunk_4": 24, "flesh_chunk_5": 26, "flesh_chunk_6": 26, "blood_splat_1": 32,
	"bone_1": 28, "bone_2": 26, "bone_3": 32, "bone_4": 22, "bone_5": 34, "eye": 22,
	"eye_bloody": 24, "eye_torn": 22, "skull_chunk": 30, "skull_half": 34, "skull_crushed": 28,
	"heart": 28, "heart_damaged": 26, "tooth_1": 16, "tooth_2": 14, "finger_1": 20,
	"finger_2": 18, "severed_hand": 28, "tendon_1": 24, "tendon_2": 22} # 25235 _GORE_SZ
const GORE_COMMON: Array[String] = ["flesh", "flesh", "flesh", "blood", "blood", "intestine", "organ", "tendon"] # 42728
const GORE_RARE: Array[String] = ["bone", "eye", "skull", "heart", "finger", "tooth"] # 42729
const DI_NAMES: Array[String] = ["blood_impact_2", "blood_impact_3", "blood_impact_4"] # 25181
const STAIN_MAX := 30     # 24886
const STAIN_HOLD := 420.0 # 24887: 7초 유지
const STAIN_FADE := 120.0 # 24887: 2초 페이드
const CORPSE_MAX := 120   # 24915
const GORE_MAX := 120     # 25199
const DI_MAX := 12        # 25180
const IMPACT_MAX := 12    # 25419
const IMPACT_DRAW_MAX := 4 # 54724 _IMP_DRAW_MAX
const HIT_VFX_MAX := 15   # 19169
const VFX_ANIM_MAX := 20  # 19328
const ELC0 := Color("#bbbbbb") # 14338 ELC[0] (물리)

var world: Node2D
var _configured := false
var _gore_textures: Dictionary = {}
var _di_textures: Dictionary = {}
var _blood_sheet: Texture2D
var _impact_sheet: Texture2D
var _floor: Node2D
var _air: Node2D
var _air_add: Node2D
var _stains: Array = []
var _corpses: Array = []
var _gore: Array = []
var _di: Array = []
var _impacts: Array = []
var _impact_next := 0
var _hit_vfx: Array = []
var _blood_anims: Array = []
var _fling_throttle := 0 # 25263 _flingThrottle (프레임당 5)
var _metrics := {"death_fx": 0, "corpses": 0, "gore_pieces": 0, "death_impacts": 0,
	"impacts": 0, "stains": 0, "blood_anims": 0, "death_sound_skipped_missing_assets": 0,
	"rng_calls": 0}

class _Drawer extends Node2D:
	var draw_callback: Callable
	func _draw() -> void:
		if draw_callback.is_valid():
			draw_callback.call(self)

func configure(owner_world: Node2D) -> bool:
	if _configured or not is_instance_valid(owner_world):
		return false
	world = owner_world
	for key in GORE_TYPES:
		var path := "res://assets/gore/%s.png" % key
		if ResourceLoader.exists(path, "Texture2D"):
			_gore_textures[key] = load(path)
	for key in DI_NAMES:
		var path := "res://assets/gore/%s.png" % key
		if ResourceLoader.exists(path, "Texture2D"):
			_di_textures[key] = load(path)
	_blood_sheet = load("res://assets/vfx/Blood_FBF_4x4.png") if ResourceLoader.exists("res://assets/vfx/Blood_FBF_4x4.png", "Texture2D") else null
	_impact_sheet = load("res://assets/vfx/impact_basic_sheet.png") if ResourceLoader.exists("res://assets/vfx/impact_basic_sheet.png", "Texture2D") else null
	process_mode = Node.PROCESS_MODE_PAUSABLE
	z_as_relative = false
	for i in range(STAIN_MAX): _stains.append({"active": false})
	for i in range(CORPSE_MAX): _corpses.append({"active": false})
	for i in range(GORE_MAX): _gore.append({"active": false, "ground": false, "persist": false, "life": 0.0})
	for i in range(DI_MAX): _di.append({"active": false, "life": 0.0})
	for i in range(HIT_VFX_MAX): _hit_vfx.append({"active": false})
	_floor = _make_drawer("FloorDecals", -2005, false)  # 적 z(-2000~) 아래
	_air = _make_drawer("AirDebris", 4001, false)
	_air_add = _make_drawer("AdditiveFx", 4002, true)   # 웹 실전 경로: VFX GL 인스턴싱(5222 blendFunc SRC_ALPHA,ONE)·히트임팩트(54736 _queueVfxGL) = additive
	_configured = true
	return true

func _make_drawer(drawer_name: String, z: int, additive: bool) -> Node2D:
	var drawer := _Drawer.new()
	drawer.name = drawer_name
	drawer.z_as_relative = false
	drawer.z_index = z
	if additive:
		var material := CanvasItemMaterial.new()
		material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		drawer.material = material
	drawer.draw_callback = Callable(self, "_draw_floor" if drawer_name == "FloorDecals" else ("_draw_air" if drawer_name == "AirDebris" else "_draw_air_add"))
	add_child(drawer)
	return drawer

func _unit() -> float:
	_metrics.rng_calls += 1
	return float(world.sample_native_random_unit())

# ── 25414 _addImpact(el=0 'slash', 비보스) — _impPerFrame 증가는 state owner(호출측) ──
func spawn_native_impact(x: float, y: float, ang: float, lite: bool, no_flash: bool) -> void:
	if not _configured:
		return
	if not lite:
		var impact := {"x": x, "y": y, "ang": ang, "t": 0.0, "ml": 16.0, "sz": 1.0, "active": true}
		if _impacts.size() >= IMPACT_MAX:
			_impacts[_impact_next] = impact
			_impact_next = (_impact_next + 1) % IMPACT_MAX
		else:
			_impacts.append(impact)
		# slash → spawnHolyBurst(x,y,0.4) (25427) — impact_basic_sheet 공유(19104~19106)
		var slot := -1
		for i in range(HIT_VFX_MAX):
			if not _hit_vfx[i]["active"]:
				slot = i
				break
		if slot < 0: slot = 0
		_hit_vfx[slot] = {"active": true, "x": x, "y": y, "frame": 0, "timer": 0.0,
			"frame_rate": 0.04, "scale": 0.4, "ang": _unit() * 6.28}
		# 25430 G.hitStop=max(,~~(2*OPT.hitStop/100)) — OPT.hitStop 기본 0 + 소비자 비활성 → 효과 0 (기록 생략)
	if not no_flash:
		# 25432 doHitFlash(ELC[0], 0.1) — 기존 hit-fx 어댑터의 동일 포트 재사용
		var fx: Variant = world.get("_native_hit_fx")
		if is_instance_valid(fx) and fx.has_method("emit_hit_flash"):
			fx.emit_hit_flash(ELC0, 0.1)
	if lite:
		return # 25433 경량 모드: 파티클 생략
	# 25435~25440 방향성 파편 (ang 반대방향, el0: ec=ELC[0]→'#ff4444' 폴백·ep 동일)
	var fx2: Variant = world.get("_native_hit_fx")
	if not is_instance_valid(fx2) or not fx2.has_method("emit_source_particle"):
		return
	var back: float = ang + PI
	var count: int = 6 + int(_unit() * 3.0)
	for i in range(count):
		var sa: float = back + (_unit() - 0.5) * 2.2
		var sv: float = 2.0 + _unit() * 4.0
		fx2.emit_source_particle({"x": x, "y": y, "vx": cos(sa) * sv, "vy": sin(sa) * sv,
			"color": "#bbbbbb" if i % 2 else "#ff4444", "size": 1.5 + _unit() * 2.0,
			"life": 6.0 + _unit() * 5.0, "kind": 2 if i % 3 == 0 else 0, "rotation": sa,
			"gravity": 0.06, "render_owner": "death_fx_impact_debris"})
	_metrics.impacts += 1

# ── 처치 전반부: deathFX 코어(24805~24870) + 대형 사망 버스트(25396~) + 시체(24964~) + 핏자국(24903~) ──
func spawn_native_death_front(enemy: Node2D, ang: float, dmg: int, radius: float, mhp: float,
		enemy_color: String, death_fx_enabled: bool, sound_handled: bool = false) -> void:
	if not _configured:
		return
	_metrics.death_fx += 1
	var fx: Variant = world.get("_native_hit_fx")
	var x: float = enemy.global_position.x
	var y: float = enemy.global_position.y
	# deathFX 사운드(24790~24830): P2-001c부터 main 오디오 owner가 실디스패치 —
	# 처리 못 한 경우(스로틀/에셋 부재)만 스킵 카운터.
	if sound_handled:
		_metrics["death_sounds_dispatched"] = int(_metrics.get("death_sounds_dispatched", 0)) + 1
	else:
		_metrics.death_sound_skipped_missing_assets += 1
	# 중심 플래시 링 tp3 (24833) + 중심 원형 플래시 tp1 ×1 (24836~24839) — 비보스.
	if is_instance_valid(fx) and fx.has_method("emit_source_particle"):
		fx.emit_source_particle({"x": x, "y": y, "vx": 0.0, "vy": 0.0, "color": "#ffffff",
			"size": radius if radius > 0.0 else 8.0, "life": 8.0, "kind": 3, "render_owner": "death_fx_ring"})
		fx.emit_source_particle({"x": x + (_unit() - 0.5) * 4.0, "y": y + (_unit() - 0.5) * 4.0,
			"vx": (_unit() - 0.5) * 0.3, "vy": (_unit() - 0.5) * 0.3, "color": "#ffffff",
			"size": 4.0, "life": 4.0, "kind": 1, "render_owner": "death_fx_flash"})
	# 사망 피 시트 (24851~24864): death_blood 등록(19679: 128px 16f 4cols), scale=_deathBloodScale(r)
	# =max(.8,min(4.8,.35+max(1,r)*.075))(24749), frameTime 4, 랜덤 각, baseAlpha 1.5.
	if _blood_sheet != null:
		if _blood_anims.size() >= VFX_ANIM_MAX:
			_blood_anims.pop_front()
		_blood_anims.append({"x": x, "y": y, "frame": 0, "t": 0.0, "frame_time": 4.0,
			"scale": maxf(0.8, minf(4.8, 0.35 + maxf(1.0, radius) * 0.075)),
			"ang": _unit() * TAU, "base_alpha": 1.5})
		_metrics.blood_anims += 1
	# 42720 _spawnLargeMonsterDeathFx — _isLarge=r>=18||mhp>=220 (25398), 비보스 16발.
	if death_fx_enabled and (radius >= 18.0 or mhp >= 220.0) and is_instance_valid(fx):
		for i in range(16):
			var a: float = TAU * float(i) / 16.0 + (_unit() - 0.5) * 0.4
			var v: float = 3.2 + _unit() * 2.0
			fx.emit_source_particle({"x": x, "y": y, "vx": cos(a) * v, "vy": sin(a) * v - 0.6,
				"color": "#ffd9aa" if i % 3 == 0 else "#ffaa66", "size": 2.4 + _unit() * 2.8,
				"life": 14.0 + _unit() * 10.0, "kind": 0, "gravity": 0.08,
				"render_owner": "death_fx_large_burst"})
		if fx.has_method("emit_parts"):
			fx.emit_parts(Vector2(x, y), Color("#ffaa66"), 10) # 25409 addParts(…,10)
	# 42722 시체: _cp=min(8, dmg/max(1,mhp)*20) → _addCorpse (OPT.deathFx 게이트 24965).
	if death_fx_enabled:
		_add_corpse(enemy, ang, minf(8.0, float(dmg) / maxf(1.0, mhp) * 20.0), radius)
		# 24967 _addFloorTrace: 핏자국 전원(_stainRadius 24891: 잡몹 max(14,min(36,r*1.4))),
		# 살점 ground 고어는 대형(r>=40)만 — 첫 스테이지 일반 적 비해당.
		_add_stain(x, y, maxf(14.0, minf(36.0, radius * 1.4)))
		if radius >= 40.0:
			_spawn_gore_piece(x, y, "flesh", true)

func _add_corpse(enemy: Node2D, kill_ang: float, power: float, radius: float) -> void:
	var capture: Dictionary = _capture_enemy_sprite(enemy)
	if capture.is_empty():
		return
	var oldest := 0
	var min_t := INF
	for i in range(CORPSE_MAX):
		if not _corpses[i]["active"]:
			oldest = i
			break
		if float(_corpses[i]["t"]) < min_t:
			min_t = float(_corpses[i]["t"])
			oldest = i
	var spd: float = minf(5.0, 1.5 + maxf(1.0, power) * 0.8) # 24972 (power||1)
	var size: float = maxf(40.0, minf(260.0, radius * 2.9))  # 24976 비보스
	_corpses[oldest] = {"active": true, "x": enemy.global_position.x, "y": enemy.global_position.y,
		"vx": cos(kill_ang) * spd, "vy": sin(kill_ang) * spd, "r": kill_ang + PI * 0.5,
		"rv": (_unit() - 0.5) * 0.2, "sz": size, "t": 420.0, "mt": 420.0, "bounced": 0,
		"texture": capture["texture"], "region": capture["region"]}
	_metrics.corpses += 1

# 시체 이미지 캡처(24982~): 현재 스프라이트 프레임을 그대로 사용 (렌더 소스 동일 원칙).
func _capture_enemy_sprite(enemy: Node2D) -> Dictionary:
	var body: Variant = enemy.get("_body")
	if not is_instance_valid(body) or not body is Sprite2D or body.texture == null:
		return {}
	var sprite: Sprite2D = body
	if sprite.region_enabled:
		return {"texture": sprite.texture, "region": sprite.region_rect}
	var columns: int = maxi(1, sprite.hframes)
	var rows: int = maxi(1, sprite.vframes)
	var cell := Vector2(sprite.texture.get_width() / float(columns), sprite.texture.get_height() / float(rows))
	var frame: int = sprite.frame
	return {"texture": sprite.texture,
		"region": Rect2(Vector2(float(frame % columns), float(frame / columns)) * cell, cell)}

func _add_stain(x: float, y: float, size: float) -> void:
	var oldest := 0
	var min_t := INF
	for i in range(STAIN_MAX):
		if not _stains[i]["active"]:
			oldest = i
			break
		if float(_stains[i]["t"]) < min_t:
			min_t = float(_stains[i]["t"])
			oldest = i
	_stains[oldest] = {"active": true, "x": x, "y": y, "sz": size, "ang": _unit() * TAU,
		"t": STAIN_HOLD + STAIN_FADE, "mt": STAIN_HOLD + STAIN_FADE}
	_metrics.stains += 1

# ── 처치 후반부(42726~42732): 고어(provider 롤 값 사용) + 데드 임팩트 ──
func spawn_native_gore_and_death_impact(x: float, y: float, radius: float,
		roll_pick: float, roll_index: float, roll_large: Variant, death_fx_enabled: bool) -> void:
	if not _configured or not death_fx_enabled: # 25237/25188 OPT.deathFx 게이트
		return
	# 42728~42730: _gPick=roll<0.8?common:rare → _gPick[⌊roll2×len⌋]
	var pick: Array = GORE_COMMON if roll_pick < 0.8 else GORE_RARE
	_spawn_gore_piece(x, y, str(pick[clampi(int(roll_index * pick.size()), 0, pick.size() - 1)]), false)
	# 42731: _gL=r>=18 → roll3<0.5?'intestine':'organ'
	if (roll_large is int or roll_large is float) and radius >= 18.0:
		_spawn_gore_piece(x, y, "intestine" if float(roll_large) < 0.5 else "organ", false)
	# 42732 _addDeathImpact: blood_impact 2/3/4 중 랜덤, maxSz=_deathImpactSize(r)=max(24,min(240,r*3)) (25186)
	var key: String = DI_NAMES[clampi(int(_unit() * DI_NAMES.size()), 0, DI_NAMES.size() - 1)]
	if _di_textures.has(key):
		var oldest := 0
		var min_l := INF
		for i in range(DI_MAX):
			if not _di[i]["active"]:
				oldest = i
				break
			if float(_di[i]["life"]) < min_l:
				min_l = float(_di[i]["life"])
				oldest = i
		_di[oldest] = {"active": true, "x": x, "y": y,
			"max_sz": maxf(24.0, minf(240.0, maxf(1.0, radius) * 3.0)),
			"life": 1.0, "texture": _di_textures[key]}
		_metrics.death_impacts += 1

# 25236 _addGorePiece — ground=바닥 잔류(핏자국 살점), 비행은 30% 카메라 플링 포함.
func _spawn_gore_piece(x: float, y: float, category: String, ground: bool) -> void:
	var pool: Array = GORE_CAT.get(category, [])
	var key: String = category if pool.is_empty() else str(pool[clampi(int(_unit() * pool.size()), 0, pool.size() - 1)])
	if not _gore_textures.has(key):
		return
	var oldest := 0
	var min_l := INF
	var fly_oldest := -1
	for i in range(GORE_MAX):
		var piece: Dictionary = _gore[i]
		if not piece["active"]:
			oldest = i
			fly_oldest = -1
			break
		if float(piece["life"]) < min_l:
			min_l = float(piece["life"])
			oldest = i
		if not piece.get("ground", false) and not piece.get("persist", false) \
				and (fly_oldest < 0 or float(piece["life"]) < float(_gore[fly_oldest]["life"])):
			fly_oldest = i
	if ground and fly_oldest >= 0:
		oldest = fly_oldest
	var size: float = float(GORE_SZ.get(key, 30)) + (_unit() - 0.5) * 8.0
	var piece := {"active": true, "texture": _gore_textures[key], "cam_fling": false,
		"scale": 1.0, "vz": 0.0, "rv": 0.0, "ground": ground, "persist": ground, "t_settle": 0.0,
		"sz": size, "x": 0.0, "y": 0.0, "vx": 0.0, "vy": 0.0, "rot": 0.0, "life": 0.0, "ml": 0.0}
	if ground:
		piece["x"] = x + (_unit() - 0.5) * 26.0
		piece["y"] = y + (_unit() - 0.5) * 16.0
		var a: float = _unit() * TAU
		var spd: float = 0.5 + _unit() * 1.1
		piece["vx"] = cos(a) * spd
		piece["vy"] = sin(a) * spd
		piece["t_settle"] = 16.0
		piece["rot"] = _unit() * TAU
		piece["rv"] = (_unit() - 0.5) * 0.06
		piece["sz"] = maxf(12.0, size * 0.4)
		piece["life"] = 1e9
		piece["ml"] = 1e9
	elif _unit() < 0.3 and _fling_throttle < 5: # 25263 카메라 플링 30%, 프레임당 5
		_fling_throttle += 1
		piece["cam_fling"] = true
		piece["x"] = x + (_unit() - 0.5) * 10.0
		piece["y"] = y + (_unit() - 0.5) * 10.0
		piece["vx"] = (_unit() - 0.5) * 0.5
		piece["vy"] = (_unit() - 0.5) * 0.5
		piece["vz"] = -0.18
		piece["scale"] = 0.5
		piece["rot"] = _unit() * TAU
		piece["rv"] = 0.15 + _unit() * 0.15
		piece["life"] = 40.0
		piece["ml"] = 40.0
	else:
		piece["x"] = x + (_unit() - 0.5) * 8.0
		piece["y"] = y + (_unit() - 0.5) * 8.0
		var a2: float = _unit() * TAU
		var spd2: float = 5.0 + _unit() * 7.0
		piece["vx"] = cos(a2) * spd2
		piece["vy"] = sin(a2) * spd2 - 2.0
		piece["rot"] = _unit() * TAU
		piece["rv"] = (_unit() - 0.5) * 0.3
		piece["life"] = 90.0
		piece["ml"] = 90.0
	_gore[oldest] = piece
	_metrics.gore_pieces += 1

# ── 업데이트 (34607~34643 물리 — sp=godot delta×60, 기존 어댑터와 동일 클록) ──
func _physics_process(delta: float) -> void:
	if not _configured:
		return
	var sp: float = delta * 60.0
	_fling_throttle = 0 # 34602 프레임 리셋
	for piece in _gore: # 34607~34614
		if not piece["active"]:
			continue
		if piece.get("ground", false):
			if float(piece["t_settle"]) > 0.0:
				piece["t_settle"] = float(piece["t_settle"]) - sp
				piece["x"] = float(piece["x"]) + float(piece["vx"]) * sp
				piece["y"] = float(piece["y"]) + float(piece["vy"]) * sp
				piece["vx"] = float(piece["vx"]) * pow(0.78, sp)
				piece["vy"] = float(piece["vy"]) * pow(0.78, sp)
				piece["rot"] = float(piece["rot"]) + float(piece["rv"]) * sp
				piece["rv"] = float(piece["rv"]) * pow(0.9, sp)
			continue
		piece["life"] = float(piece["life"]) - sp
		if float(piece["life"]) <= 0.0:
			piece["active"] = false
			continue
		if piece.get("cam_fling", false):
			if float(piece["scale"]) > 3.0:
				piece["active"] = false
				continue
			piece["scale"] = float(piece["scale"]) - float(piece["vz"]) * sp
			piece["rot"] = float(piece["rot"]) + float(piece["rv"]) * sp
			piece["x"] = float(piece["x"]) + float(piece["vx"]) * sp
			piece["y"] = float(piece["y"]) + float(piece["vy"]) * sp
		else:
			piece["x"] = float(piece["x"]) + float(piece["vx"]) * sp
			piece["y"] = float(piece["y"]) + float(piece["vy"]) * sp
			piece["vy"] = float(piece["vy"]) + 0.10 * sp
			piece["vx"] = float(piece["vx"]) * pow(0.97, sp)
			piece["rot"] = float(piece["rot"]) + float(piece["rv"]) * sp
			piece["rv"] = float(piece["rv"]) * pow(0.97, sp)
	for impact_item in _di: # 34616: life -= sp/60*0.8
		if impact_item["active"]:
			impact_item["life"] = float(impact_item["life"]) - sp / 60.0 * 0.8
			if float(impact_item["life"]) <= 0.0:
				impact_item["active"] = false
	for stain in _stains: # 34636
		if stain["active"]:
			stain["t"] = float(stain["t"]) - sp
			if float(stain["t"]) <= 0.0:
				stain["active"] = false
	for corpse in _corpses: # 34638~34643
		if not corpse["active"]:
			continue
		corpse["t"] = float(corpse["t"]) - sp
		if float(corpse["t"]) <= 0.0:
			corpse["active"] = false
			continue
		var alpha: float = float(corpse["t"]) / (float(corpse["mt"]) * 0.4) if float(corpse["t"]) < float(corpse["mt"]) * 0.4 else 1.0
		if alpha < 0.05:
			corpse["active"] = false
			continue
		var nx: float = float(corpse["x"]) + float(corpse["vx"]) * sp
		var ny: float = float(corpse["y"]) + float(corpse["vy"]) * sp
		if world.has_method("is_world_blocked") and world.is_world_blocked(Vector2(nx, ny)):
			corpse["vx"] = float(corpse["vx"]) * -0.4
			corpse["vy"] = float(corpse["vy"]) * -0.4
			corpse["rv"] = float(corpse["rv"]) * -1.0
			corpse["bounced"] = int(corpse["bounced"]) + 1
		else:
			corpse["x"] = nx
			corpse["y"] = ny
		corpse["vx"] = float(corpse["vx"]) * pow(0.85, sp)
		corpse["vy"] = float(corpse["vy"]) * pow(0.85, sp)
		corpse["r"] = float(corpse["r"]) + float(corpse["rv"]) * sp
		corpse["rv"] = float(corpse["rv"]) * pow(0.92, sp)
	var impact_write := 0 # 34644
	for i in range(_impacts.size()):
		var impact: Dictionary = _impacts[i]
		impact["t"] = float(impact["t"]) + sp
		if float(impact["t"]) < float(impact["ml"]):
			_impacts[impact_write] = impact
			impact_write += 1
	_impacts.resize(impact_write)
	if _impact_next >= _impacts.size():
		_impact_next = 0
	for vfx in _hit_vfx: # 19177 updateHitVFX(dt=sp/60)
		if vfx["active"]:
			vfx["timer"] = float(vfx["timer"]) + sp / 60.0
			if float(vfx["timer"]) >= float(vfx["frame_rate"]):
				vfx["timer"] = float(vfx["timer"]) - float(vfx["frame_rate"])
				vfx["frame"] = int(vfx["frame"]) + 1
			if int(vfx["frame"]) >= 9:
				vfx["active"] = false

func _process(_delta: float) -> void:
	if not _configured:
		return
	# 54581~54582 death_blood 프레임 클록 — 원본은 렌더 루프에서 v.t+=_dtSp(상시 1,
	# 61849; 히트스톱 0.04는 32585 비활성)·frameTime 4, 즉 "렌더 프레임당 +1"이지
	# 60Hz 물리 틱이 아니다. 웹 실측(P2-001f 2026-10-20, ~186fps 렌더): kill+86ms에
	# frame 4, 16프레임 완주 ≈0.34s — 반면 구 구현(_physics_process 60Hz)은 1.07s로
	# 3.1× 느려 처치 순간엔 초반 고밀도 프레임(크고 밝음), +1s엔 후반 잔가지 프레임이
	# 잔존하는 결함(P2-001d ③)이 났다. 스테인/시체/고어/DI는 60Hz 실측 일치(유지).
	var anim_write := 0 # 54580 (bornGameTime 미사용 경로: t+=_dtSp)
	for anim in _blood_anims:
		anim["t"] = float(anim["t"]) + 1.0
		if float(anim["t"]) >= float(anim["frame_time"]):
			anim["t"] = 0.0
			anim["frame"] = int(anim["frame"]) + 1
		if int(anim["frame"]) < 16:
			_blood_anims[anim_write] = anim
			anim_write += 1
	_blood_anims.resize(anim_write)
	_floor.queue_redraw()
	_air.queue_redraw()
	_air_add.queue_redraw()

# ── 렌더 (54515~54570 floor / 54562 비행 고어 / 54568 DI / 54720~ 임팩트 / 19178 홀리 / 54571 애님) ──
func _draw_floor(canvas: Node2D) -> void:
	for stain in _stains:
		if not stain["active"]:
			continue
		var fade: float = clampf(float(stain["t"]) / STAIN_FADE, 0.0, 1.0)
		var size: float = float(stain["sz"])
		canvas.draw_set_transform(canvas.to_local(Vector2(stain["x"], stain["y"])), float(stain["ang"]), Vector2(1.0, 0.58))
		canvas.draw_circle(Vector2.ZERO, size, Color(0x4a / 255.0, 0x05 / 255.0, 0x08 / 255.0, 0.42 * fade))
		canvas.draw_set_transform(canvas.to_local(Vector2(stain["x"], stain["y"])) + Vector2(-size * 0.08, size * 0.04), float(stain["ang"]), Vector2(1.0, 0.32 / 0.62))
		canvas.draw_circle(Vector2.ZERO, size * 0.62, Color(0x7a / 255.0, 0x10 / 255.0, 0x18 / 255.0, 0.30 * fade))
	canvas.draw_set_transform_matrix(Transform2D())
	var corpse_drawn := 0
	for corpse in _corpses:
		if not corpse["active"]:
			continue
		corpse_drawn += 1
		if corpse_drawn > 25: # 54531 캡 25
			break
		var fade_t: float = float(corpse["mt"]) * 0.4
		var alpha: float = float(corpse["t"]) / fade_t if float(corpse["t"]) < fade_t else 1.0
		if alpha < 0.05:
			continue
		var at: Vector2 = canvas.to_local(Vector2(corpse["x"], corpse["y"]))
		if alpha > 0.1: # 54535 그림자 웅덩이
			var prog: float = 1.0 - float(corpse["t"]) / float(corpse["mt"])
			var pw: float = float(corpse["sz"]) * (0.3 + prog * 0.5)
			canvas.draw_set_transform(at + Vector2(0, 2), float(corpse["r"]) * 0.3, Vector2(1.0, 0.5))
			canvas.draw_circle(Vector2.ZERO, pw, Color(0x33 / 255.0, 0, 0, 0.3 * alpha))
		canvas.draw_set_transform(at, float(corpse["r"]), Vector2(1.0, 0.5)) # 54538 scale(1,.5)
		var size: float = float(corpse["sz"])
		canvas.draw_texture_rect_region(corpse["texture"], Rect2(-size / 2.0, -size / 2.0, size, size),
			corpse["region"], Color(1, 1, 1, alpha))
	canvas.draw_set_transform_matrix(Transform2D())
	for piece in _gore: # 바닥 잔류 고어 (54565: alpha .88, scale(1,.52))
		if not piece["active"] or not piece.get("ground", false):
			continue
		var at2: Vector2 = canvas.to_local(Vector2(piece["x"], piece["y"]))
		canvas.draw_set_transform(at2, float(piece["rot"]), Vector2(1.0, 0.52))
		var size2: float = float(piece["sz"])
		canvas.draw_texture_rect(piece["texture"], Rect2(-size2 * 0.5, -size2 * 0.5, size2, size2), false, Color(1, 1, 1, 0.88))
	canvas.draw_set_transform_matrix(Transform2D())

func _draw_air(canvas: Node2D) -> void:
	for piece in _gore: # 비행 고어 (54566) + 카메라 플링 (54926)
		if not piece["active"] or piece.get("ground", false):
			continue
		var at: Vector2 = canvas.to_local(Vector2(piece["x"], piece["y"]))
		if piece.get("cam_fling", false):
			var scale_value: float = float(piece["scale"])
			var alpha: float = 1.0 if scale_value < 4.5 else maxf(0.0, 1.0 - (scale_value - 4.5) * 0.3)
			var gsz: float = float(piece["sz"]) * scale_value
			canvas.draw_set_transform(at, float(piece["rot"]), Vector2.ONE)
			canvas.draw_texture_rect(piece["texture"], Rect2(-gsz * 0.5, -gsz * 0.5, gsz, gsz), false, Color(1, 1, 1, alpha))
		else:
			var alpha2: float = minf(1.0, float(piece["life"]) / float(piece["ml"]) * 3.0)
			var sc: float = 1.0 if float(piece["life"]) > 10.0 else float(piece["life"]) / 10.0
			var draw_size: float = float(piece["sz"]) * sc
			canvas.draw_set_transform(at, float(piece["rot"]), Vector2.ONE)
			canvas.draw_texture_rect(piece["texture"], Rect2(-draw_size * 0.5, -draw_size * 0.5, draw_size, draw_size), false, Color(1, 1, 1, alpha2))
	canvas.draw_set_transform_matrix(Transform2D())
	# 54567~54568 데드 임팩트 — 원본 코드의 globalCompositeOperation='lighter'는 GPU/GL
	# 프록시 X에서 **no-op**(6028: set 무시)이고 X의 실제 블렌드는 _setBlend로만 바뀌는데
	# 이 구간(마지막 _setBlend(false) 53689 이후)은 normal이다. 즉 웹 실동작=일반 알파
	# 블렌드로 blood_impact_2/3/4의 어두운 핏빛이 서서히(알파 0→1) 배어드는 얼룩 —
	# additive 밝은 글로우가 아니다 (P2-001f 2026-10-20 실측·코드 추적).
	for impact_item in _di:
		if not impact_item["active"]:
			continue
		var lt: float = 1.0 - float(impact_item["life"])
		var eo: float = lt / 0.3 if lt < 0.3 else 1.0 + (lt - 0.3) * 0.2
		var size: float = float(impact_item["max_sz"]) * eo
		var alpha: float = 1.0 if float(impact_item["life"]) < 0.3 else 1.0 - (float(impact_item["life"]) - 0.3) / 0.7
		var at2: Vector2 = canvas.to_local(Vector2(impact_item["x"], impact_item["y"]))
		canvas.draw_texture_rect(impact_item["texture"], Rect2(at2 - Vector2.ONE * size * 0.5, Vector2.ONE * size), false, Color(1, 1, 1, maxf(0.0, alpha)))

func _draw_air_add(canvas: Node2D) -> void:
	if _impact_sheet != null: # 54720~ 히트 임팩트 (impact_basic 9프레임, 비보스 .8+p*.6 / inv*.45)
		var drawn := 0
		var frame_size: float = _impact_sheet.get_width() / 9.0
		for impact in _impacts:
			if drawn >= IMPACT_DRAW_MAX:
				break
			var p: float = float(impact["t"]) / float(impact["ml"])
			if p >= 1.0:
				continue
			drawn += 1
			var fr: int = mini(8, int(p * 9.0))
			var draw_size: float = frame_size * float(impact["sz"]) * (0.8 + p * 0.6)
			var at2: Vector2 = canvas.to_local(Vector2(impact["x"], impact["y"]))
			canvas.draw_texture_rect_region(_impact_sheet,
				Rect2(at2 - Vector2.ONE * draw_size * 0.5, Vector2.ONE * draw_size),
				Rect2(fr * frame_size, 0, frame_size, _impact_sheet.get_height()),
				Color(1, 1, 1, (1.0 - p) * 0.45))
		for vfx in _hit_vfx: # 19178 홀리 버스트 (같은 시트, scale .4, alpha .45, 회전)
			if not vfx["active"]:
				continue
			var fr2: int = mini(8, int(vfx["frame"]))
			var dsz: float = frame_size * float(vfx["scale"])
			canvas.draw_set_transform(canvas.to_local(Vector2(vfx["x"], vfx["y"])), float(vfx["ang"]), Vector2.ONE)
			canvas.draw_texture_rect_region(_impact_sheet,
				Rect2(-Vector2.ONE * dsz * 0.5, Vector2.ONE * dsz),
				Rect2(fr2 * frame_size, 0, frame_size, _impact_sheet.get_height()),
				Color(1, 1, 1, 0.45))
		canvas.draw_set_transform_matrix(Transform2D())
	if _blood_sheet != null: # 54571~ death_blood 애님 (128px 4x4, alpha=base×(1-frame/16×0.3))
		for anim in _blood_anims:
			var frame: int = int(anim["frame"])
			if frame >= 16:
				continue
			var alpha: float = minf(1.0, float(anim["base_alpha"]) * (1.0 - float(frame) / 16.0 * 0.3))
			var scale_value: float = float(anim["scale"])
			var dw: float = 128.0 * scale_value
			canvas.draw_set_transform(canvas.to_local(Vector2(anim["x"], anim["y"])), float(anim["ang"]), Vector2.ONE)
			canvas.draw_texture_rect_region(_blood_sheet,
				Rect2(-dw / 2.0, -dw / 2.0, dw, dw),
				Rect2(float(frame % 4) * 128.0, float(frame / 4) * 128.0, 128.0, 128.0),
				Color(1, 1, 1, alpha))
		canvas.draw_set_transform_matrix(Transform2D())

func get_snapshot() -> Dictionary:
	var counts := {"stains": 0, "corpses": 0, "gore": 0, "gore_ground": 0, "di": 0,
		"impacts": _impacts.size(), "hit_vfx": 0, "blood_anims": _blood_anims.size()}
	for stain in _stains:
		if stain["active"]: counts["stains"] += 1
	for corpse in _corpses:
		if corpse["active"]: counts["corpses"] += 1
	for piece in _gore:
		if piece["active"]:
			counts["gore"] += 1
			if piece.get("ground", false): counts["gore_ground"] += 1
	for impact_item in _di:
		if impact_item["active"]: counts["di"] += 1
	for vfx in _hit_vfx:
		if vfx["active"]: counts["hit_vfx"] += 1
	return {"configured": _configured, "counts": counts, "metrics": _metrics.duplicate(true),
		"gore_textures": _gore_textures.size(), "di_textures": _di_textures.size(),
		"blood_sheet": _blood_sheet != null, "impact_sheet": _impact_sheet != null,
		"pool_limits": {"stains": STAIN_MAX, "corpses": CORPSE_MAX, "gore": GORE_MAX,
			"di": DI_MAX, "impacts": IMPACT_MAX},
		"unported": ["death_sounds_sfx_death_assets_missing", "burn_corpse", "split_gib_pieces",
			"boss_variants", "hitArc_element_particles_37632"]}
