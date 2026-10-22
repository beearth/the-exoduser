extends Node2D
## P2-006a — 바닥 드랍 표시·줍기 어댑터 (원본 G:\exoduser\game.html 행 근거, 표시·입력·반입 전용).
##
## 원본 추적:
## - 데이터: worldItems(16719)·_wiPush(16721, 20개 초과 최저 rarity 축출 — state P2-001c 소유).
## - 드랍음: _wiPush에서 playItemDropSfx(16268: rar>=4 legend / >=2 rare / 그 외 common,
##   vol .5·_r(1,.04)·45ms 게이트) — 레코드 serial 신규 감지로 동치 재생.
## - 렌더(52485~52600, type 'item'만 — mat/potion/debris/chest/hp/o2bubble은 생성 경로 미이식):
##   화면 내만(±VW/2+40)·바운스 b=sin(now/300+x)×3·빔=world_item_drop_beams_v3 아틀라스
##   (27817~27858: 2열 정사각 타일, beamTier=layerLv||[0,2,3,4,5,6][rarity](27824~27829),
##   프레임 ~~((now/180+x)%2)·60×160·proxy MIX·α .46+sin(now/400+x)×.05·검정→알파 마스크
##   27831~27844)·스킨 34px(_worldItemSkin 27864~: 컷아웃 14종 우선(27792)
##   → item_skins base_el(27795, fire 변형 부재 시 phys 폴백 27793~27794)·원본 브라우저 검정 마스크 파생. WebGPU shadow setter no-op).
## - 줍기(32935~32987, R=BINDS.interact 'KeyR' 6195): 프레스=화면 내 최고 등급 1개
##   (동급이면 가까운 것) pickupItem → picked·파티클 RARITY_C 6개; 홀드=9틱(150ms)마다 반복
##   (32952~32966). mat/potion 일괄 수거·chest/debris/hp/o2 경로는 해당 타입 생성 미이식 — 기록.
## - 반입: pickupItem(16398)=state apply_native_pickup_item 소유(가방 push·_invFindSpace·
##   가득 참 notify('가방에 공간이 없습니다!' 16403)·_gx/_gy/_pickT). bonePart는 도감 미이식 →
##   정지·기록. 획득음 _PICKUP_SFX_POOL 6종(16270~16271, vol .5·_r(1,.05))·
##   notify(`등급 이름 획득!` 16422, RARITY_N 14347)= .notif 토스트(596: 하단 260px 중앙,
##   rgba(0,0,0,.4)·#5a2b22 테두리·#efd0a8 글자·1.5초).
## - 세이브 형식 무변경(_wiSerial은 포트 런타임 전용 — 저장 비대상).

const RARITY_C := ["#aaa", "#44cc44", "#4488ff", "#bb44ff", "#ffaa00", "#8e55e9"] # 14350
const RARITY_N := ["일반", "고급", "희귀", "영웅", "전설", "유니크"] # 14347
const EL_KEY := ["phys", "fire", "ice", "dark", "light", "holy", "earth"] # 27790
const SKIN_MISSING_ELEMENTS := ["fire"] # 27793
const SKIN_MISSING_VARIANTS := ["necklace_fire", "cape_fire", "earring_fire",
	"ossuary_ice", "ossuary_dark", "ossuary_light", "ossuary_holy", "ossuary_earth"] # 27794
const CUTOUT_BASES := ["armor", "axe", "belt", "boots", "bracelet", "cape", "crossbow",
	"earring", "gloves", "helmet", "necklace", "pants", "shield", "sword"] # 27792
const PICKUP_SFX_POOL := ["pickup_item", "pickup_rummage1", "pickup_rummage2",
	"pickup_rummage3", "pickup_rummage4", "pickup_rummage5"] # 16270

var _main: Node
var _world: Node2D
var _player: Node2D
var _state: Node
var _configured := false
var _beam_frames: Array = [null, null] # 마스크 적용 아틀라스 2프레임
var _base_skins: Dictionary={}
var _unique_skins: Dictionary={}
var _raw_fallbacks: Dictionary={}
var visual_clock_ms: float=-1
const BASE_ALIASES={"ring1":"ring","ring2":"ring","headband":"earring","headband2":"earring"}
const BONE_BASES={"skull":"bone_skull","torso":"bone_torso","arms":"bone_arms","legs":"bone_legs"}
var _skin_cache: Dictionary = {} # 경로 → 마스크 적용 Texture2D (27816 _worldItemSkinCache)
var _seen_serials: Dictionary = {}
var _last_drop_sfx_ms := 0 # 16267 _lastDropSndT (45ms 게이트)
var _pick_hold_t := 0.0 # 32953 P._pickHoldT
var _interact_held := false
var _parts: Array = [] # addParts 상당(픽업 파편 — 시각 전용 로컬 난수)
var _visual_rng := RandomNumberGenerator.new()
var _sfx_rng := RandomNumberGenerator.new() # 획득음 풀 선택(16271 Math.random — 비추적)
var _toast_layer: CanvasLayer
var _toast: Label
var _toast_left := 0.0
var _pick_log: Array = []
var _beam_layer: Node2D
var _audio_serial := 0
var _audio_buses: Dictionary = {}


func configure(main: Node, world: Node2D, player: Node2D, state: Node) -> bool:
	if _configured or not is_instance_valid(main) or not is_instance_valid(world) \
			or not is_instance_valid(player) or not is_instance_valid(state):
		return false
	if not state.has_method("read_native_drop_records") or not state.has_method("apply_native_pickup_item"):
		return false
	_main = main
	_world = world
	_player = player
	_state = state
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	if not InputMap.has_action("interact_pickup"): # BINDS.interact 'KeyR' (6195)
		InputMap.add_action("interact_pickup")
		var key_event := InputEventKey.new()
		key_event.physical_keycode = KEY_R
		InputMap.action_add_event("interact_pickup", key_event)
	# Prepared by the exact source Canvas2D decoder/mask outside gameplay.
	# Resource paths and textures are resolved here once; _skin_for never loads.
	var prepared: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/world_drop_skin_manifest.json"))
	for base in prepared.bases:
		var variants: Dictionary={}
		for element in prepared.bases[base]:variants[element]=_prepared_texture(prepared.bases[base][element])
		_base_skins[base]=variants
	for id in prepared.uniques:_unique_skins[id]=_prepared_texture(prepared.uniques[id])
	for base in prepared.raw_fallbacks:_raw_fallbacks[base]=_prepared_texture(prepared.raw_fallbacks[base])
	for frame in 2:_beam_frames[frame]=_prepared_texture(prepared.beams[frame])
	_beam_layer = Node2D.new()
	_beam_layer.name = "NativeDropBeams"
	_beam_layer.z_index = -1
	var beam_material := CanvasItemMaterial.new()
	beam_material.blend_mode = CanvasItemMaterial.BLEND_MODE_MIX
	_beam_layer.material = beam_material
	_beam_layer.draw.connect(_draw_beams)
	add_child(_beam_layer)
	_toast_layer = CanvasLayer.new()
	_toast_layer.layer = 22 # .notif z-index 22 (596)
	add_child(_toast_layer)
	_toast = Label.new()
	_toast.add_theme_font_override("font", preload("res://scripts/native_ui_fonts.gd").stack("font", 400))
	_toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast.add_theme_color_override("font_color", Color("efd0a8")) # --c-text-bright
	_toast.add_theme_font_size_override("font_size", 18) # 1.1rem≈17.6px
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0, 0, 0, 0.4)
	style.border_color = Color("5a2b22") # --c-border
	style.set_border_width_all(1)
	style.content_margin_left = 22.0
	style.content_margin_right = 22.0
	style.content_margin_top = 8.0
	style.content_margin_bottom = 8.0
	_toast.add_theme_stylebox_override("normal", style)
	_toast.visible = false
	_toast_layer.add_child(_toast)
	z_index = 60 # 바닥 오브젝트 위·플레이어/HUD 아래 상당(월드 아이템 레이어)
	_configured = true
	# Shutdown order may free State before this CanvasItem's pending redraw.
	_main.tree_exiting.connect(_on_owner_exiting, CONNECT_ONE_SHOT)
	_state.tree_exiting.connect(_on_owner_exiting, CONNECT_ONE_SHOT)
	return true


## 27831~27844 _maskWorldDropBlack: 암부(≤24)=투명, 24~72 선형 알파.
func _mask_black(img: Image) -> void:
	for y in range(img.get_height()):
		for x in range(img.get_width()):
			var c := img.get_pixel(x, y)
			var light: float = maxf(c.r, maxf(c.g, c.b)) * 255.0
			if light <= 24.0:
				c.a = 0.0
			elif light < 72.0:
				c.a = c.a * (light - 24.0) / 48.0
			else:
				continue
			img.set_pixel(x, y, c)


func _unhandled_input(event: InputEvent) -> void:
	if not _owners_live() or get_tree().paused:
		return
	if event.is_action_pressed("interact_pickup"):
		_interact_held = true
		_try_pickup_best() # 32935~ 프레스: 화면 내 최고 등급 1개
	elif event.is_action_released("interact_pickup"):
		_interact_held = false
		_pick_hold_t = 0.0 # 32987


func _demo47i_physics_body(_delta: float) -> void:
	if not _owners_live() or get_tree().paused:
		return
	_detect_new_drops()
	if _interact_held: # 32952~32966 홀드: 9틱(150ms)마다 반복
		_pick_hold_t += 1.0
		if _pick_hold_t >= 9.0:
			_pick_hold_t = 0.0
			_try_pickup_best()
	var write := 0
	for part in _parts:
		part["life"] = float(part["life"]) - 1.0
		if float(part["life"]) <= 0.0:
			continue
		part["x"] = float(part["x"]) + float(part["vx"])
		part["y"] = float(part["y"]) + float(part["vy"])
		_parts[write] = part
		write += 1
	_parts.resize(write)
	if _toast_left > 0.0:
		_toast_left -= 1.0
		if _toast_left <= 0.0:
			_toast.visible = false
	queue_redraw()
	_beam_layer.queue_redraw()


## _wiPush 드랍음(16721→16268): 신규 레코드 감지 시 등급 키·45ms 게이트.
func _detect_new_drops() -> void:
	var records: Array = _state.read_native_drop_records()
	var live: Dictionary = {}
	for record in records:
		if not record is Dictionary:
			continue
		var serial: int = int(record.get("_wiSerial", -1))
		live[serial] = true
		if _seen_serials.has(serial):
			continue
		_seen_serials[serial] = true
		if record.get("type") == "item" and record.get("item") is Dictionary and record.get("_dropPreview") != true:
			var now_ms: int = Time.get_ticks_msec()
			if now_ms - _last_drop_sfx_ms >= 45: # 16268 게이트
				_last_drop_sfx_ms = now_ms
				var rarity: int = int((record["item"] as Dictionary).get("rarity", 0))
				var key: String = "drop_legend" if rarity >= 4 else ("drop_rare" if rarity >= 2 else "drop_common")
				_play_at("res://assets/sfx/drop/%s.mp3" % key, Vector2(record["x"], record["y"]),
					1.0 + (_sfx_rng.randf() - 0.5) * 0.08, linear_to_db(0.5))
	for serial in _seen_serials.keys():
		if not live.has(serial):
			_seen_serials.erase(serial)


## 32935~32941: 화면 내(±VW/2+40) 최고 등급 1개 — 동급이면 가까운 것.
func _try_pickup_best() -> void:
	if not _owners_live(): return
	if str(_player.get("state")) == "dead":
		return
	var cam_center: Vector2 = _camera_center()
	var view: Vector2 = get_viewport_rect().size
	var best_index := -1
	var best_d := 1e9
	var best_r := -1
	var records: Array = _state.read_native_drop_records()
	for i in range(records.size()):
		var record: Dictionary = records[i]
		if record.get("type") != "item" or record.get("picked") == true:
			continue
		var sx: float = float(record["x"]) - cam_center.x
		var sy: float = float(record["y"]) - cam_center.y
		if sx < -view.x / 2.0 - 40.0 or sx > view.x / 2.0 + 40.0 \
				or sy < -view.y / 2.0 - 40.0 or sy > view.y / 2.0 + 40.0:
			continue
		var rarity: int = int((record.get("item") as Dictionary).get("rarity", 0)) if record.get("item") is Dictionary else 0
		var d: float = _player.global_position.distance_to(Vector2(record["x"], record["y"]))
		if rarity > best_r or (rarity == best_r and d < best_d):
			best_r = rarity
			best_d = d
			best_index = i
	if best_index < 0:
		return
	var record: Dictionary = records[best_index]
	var item: Dictionary = record["item"]
	var intake: Dictionary = _state.apply_native_pickup_item(_main, item)
	_pick_log.append({"serial": record.get("_wiSerial"), "applied": intake.get("applied"),
		"reason": intake.get("reason", ""), "rarity": item.get("rarity")})
	if intake.get("applied") != true:
		if intake.get("reason") == "bag_full":
			_notify(str(intake.get("notify", "가방에 공간이 없습니다!"))) # 16403
		# bonePart 도감 미이식(unported_branch_active) 등 — 레코드 유지·기록만
		return
	_state.commit_native_world_item_picked(_main, int(record.get("_wiSerial", -1))) # 32940 wi.picked=true
	var color := Color(RARITY_C[clampi(int(item.get("rarity", 0)), 0, 5)])
	for k in range(6): # 32940 addParts(RARITY_C, 6)
		var a: float = _visual_rng.randf() * TAU
		var sp: float = _visual_rng.randf() * 3.0
		_parts.append({"x": record["x"], "y": record["y"], "vx": cos(a) * sp, "vy": sin(a) * sp,
			"col": color, "sz": 1.5 + _visual_rng.randf() * 2.5, "life": 10.0 + _visual_rng.randf() * 8.0, "max": 18.0})
	var pool_key: String = PICKUP_SFX_POOL[_sfx_rng.randi_range(0, PICKUP_SFX_POOL.size() - 1)] # 16271
	_play_at("res://assets/sfx/pickup/%s.mp3" % pool_key, _player.global_position,
		1.0 + (_sfx_rng.randf() - 0.5) * 0.1, linear_to_db(0.5), false)
	_notify("%s %s 획득!" % [RARITY_N[clampi(int(item.get("rarity", 0)), 0, 5)], str(item.get("name", ""))]) # 16422


func _camera_center() -> Vector2:
	var camera: Variant = _main.get("camera")
	if camera is Camera2D and is_instance_valid(camera):
		return (camera as Camera2D).get_screen_center_position()
	return _player.global_position


## notify(43610) — .notif(596): 하단 중앙 토스트 1.5초.
func notify_native(message: String) -> void:
	_notify(message)

func _notify(message: String) -> void:
	_toast.text = message
	var view: Vector2 = get_viewport_rect().size
	_toast.reset_size()
	_toast.position = Vector2(view.x / 2.0 - _toast.size.x / 2.0, view.y - 260.0 - _toast.size.y)
	_toast.visible = true
	_toast_left = 90.0 # 1500ms


func _sound_profile(pos: Vector2, spatial: bool) -> Dictionary:
	if not spatial:
		return {"falloff": 1.0, "pan": 0.0}
	var distance: float = _player.global_position.distance_to(pos)
	var falloff: float = 1.0 if distance <= 1200.0 else maxf(0.0, 1.0 - (distance - 1200.0) / 800.0)
	return {"falloff": falloff * falloff, "pan": clampf((pos.x - _player.global_position.x) / 600.0, -0.7, 0.7)}


func _play_at(path: String, pos: Vector2, pitch: float, volume_db: float, spatial := true) -> void:
	# Resource IO and AudioServer bus mutation must not block a physics callback.
	_play_deferred.call_deferred(path,pos,pitch,volume_db,spatial)

func _play_deferred(path: String, pos: Vector2, pitch: float, volume_db: float, spatial: bool) -> void:
	if not _owners_live():return
	if not ResourceLoader.exists(path):
		return
	var settings: Dictionary = _main.read_native_attack_audio_settings()
	if settings.get("ready") != true:
		return
	var profile: Dictionary = _sound_profile(pos, spatial)
	var gain: float = db_to_linear(volume_db) * float(profile["falloff"]) * float(settings["sfx_gain"])
	if gain <= 0.0:
		return
	_audio_serial += 1
	var bus_name := "P2006A-%d-%d" % [get_instance_id(), _audio_serial]
	AudioServer.add_bus()
	var bus_index := AudioServer.bus_count - 1
	AudioServer.set_bus_name(bus_index, bus_name)
	var panner := AudioEffectPanner.new()
	panner.pan = float(profile["pan"]) if absf(float(profile["pan"])) > 0.05 else 0.0
	AudioServer.add_bus_effect(bus_index, panner)
	var one_shot := AudioStreamPlayer.new()
	_audio_buses[bus_name] = one_shot
	add_child(one_shot)
	one_shot.stream = load(path)
	one_shot.bus = bus_name
	one_shot.pitch_scale = pitch * (0.92 + _sfx_rng.randf() * 0.16)
	one_shot.volume_linear = minf(1.0, gain)
	one_shot.finished.connect(_finish_sound.bind(one_shot, bus_name), CONNECT_ONE_SHOT)
	one_shot.play()


func _finish_sound(voice: AudioStreamPlayer, bus_name: String) -> void:
	voice.stop()
	voice.stream = null
	voice.queue_free()
	var bus_index := AudioServer.get_bus_index(bus_name)
	if bus_index > 0:
		AudioServer.remove_bus(bus_index)
	_audio_buses.erase(bus_name)


func _owners_live() -> bool:
	return _configured and is_instance_valid(_state) and is_instance_valid(_main) \
		and is_instance_valid(_world) and is_instance_valid(_player) \
		and not _state.is_queued_for_deletion() and not _main.is_queued_for_deletion()

func _on_owner_exiting() -> void:
	_configured = false
	_interact_held = false
	set_physics_process(false)
	set_process_unhandled_input(false)

func _exit_tree() -> void:
	_on_owner_exiting()
	for bus_name in _audio_buses:
		var voice: AudioStreamPlayer = _audio_buses[bus_name]
		if is_instance_valid(voice):
			voice.stop()
			voice.stream = null
		var bus_index := AudioServer.get_bus_index(bus_name)
		if bus_index > 0:
			AudioServer.remove_bus(bus_index)
	_audio_buses.clear()


## _worldItemSkin(27864~): 컷아웃 14종 우선 → item_skins base_el(결손 변형 phys) → emoji 폴백.
func _prepared_texture(path: String) -> Texture2D:
	if path.is_empty():return null
	if not _skin_cache.has(path):_skin_cache[path]=load(path)
	return _skin_cache[path]

func _skin_for(item: Dictionary) -> Texture2D:
	var base: String=str(item.get("wtype")) if item.get("wtype") else ""
	if base.is_empty():base=str(item.get("btype")) if item.get("btype") else ""
	if base.is_empty():base=item.get("slot","")
	if item.get("slot","")=="bonePart":base=BONE_BASES.get(item.get("part","skull"),"")
	base=BASE_ALIASES.get(base,base)
	var unique: String=str(item.get("uniqueArt")) if item.get("uniqueArt") else ""
	if not unique.is_empty():return _unique_skins.get(unique,_raw_fallbacks.get(base))
	if not _base_skins.has(base):return null
	var element: String=EL_KEY[clampi(int(item.get("el",0)),0,6)]
	return _base_skins[base].get(element)


## 27824~27829 — layerLv(1~10) 우선, 없으면 rarity 폴백 [0,2,3,4,5,6].
func _beam_tier(item: Dictionary) -> int:
	if float(item.get("layerLv", 0)) >= 1.0:
		return mini(10, int(item.get("layerLv")))
	var table := [0, 2, 3, 4, 5, 6]
	var rarity: int = clampi(int(item.get("rarity", 0)), 0, 5)
	return table[rarity]


func _draw_beams() -> void:
	if not _owners_live():
		return
	var now_ms: float = visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec())
	var cam_center: Vector2 = _camera_center()
	var view: Vector2 = get_viewport_rect().size
	for record in _state.read_native_drop_records():
		if not record is Dictionary or record.get("picked") == true or record.get("type") != "item":
			continue
		var wx: float = float(record["x"])
		var wy: float = float(record["y"])
		if absf(wx - cam_center.x) > view.x / 2.0 + 40.0 or absf(wy - cam_center.y) > view.y / 2.0 + 40.0:
			continue # 52485 화면 내만
		var item: Dictionary = record["item"]
		var b: float = sin(now_ms / 300.0 + wx) * 3.0 # 52485 바운스
		var local := Vector2(wx, wy) - global_position
		var tier: int = _beam_tier(item)
		if tier > 0: # 52582~52589 빛기둥
			var frame: int = int(fmod(now_ms / 180.0 + wx, 2.0))
			var atlas: Texture2D = _beam_frames[frame]
			if atlas != null:
				var cell: int = int(atlas.get_width() / 2.0) # 2열 정사각(27822)
				var rows_max: int = int(atlas.get_height() / float(cell))
				var tile: int = tier - 1
				if int(tile / 2.0) < rows_max:
					var src := Rect2((tile % 2) * cell, int(tile / 2.0) * cell, cell, cell)
					var alpha: float = 0.46 + sin(now_ms / 400.0 + wx) * 0.05
					_beam_layer.draw_texture_rect_region(atlas, preload("res://scripts/native_source_canvas_labels.gd").snap(_beam_layer,Rect2(local+Vector2(-30,b-160),Vector2(60,160))),
						src, Color(1, 1, 1, alpha))


func _draw() -> void:
	if not _owners_live():
		return
	var now_ms: float = visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec())
	var cam_center: Vector2 = _camera_center()
	var view: Vector2 = get_viewport_rect().size
	for record in _state.read_native_drop_records():
		if not record is Dictionary or record.get("picked") == true or record.get("type") != "item":
			continue
		var wx: float = float(record["x"])
		var wy: float = float(record["y"])
		if absf(wx - cam_center.x) > view.x / 2.0 + 40.0 or absf(wy - cam_center.y) > view.y / 2.0 + 40.0:
			continue
		var item: Dictionary = record["item"]
		var b: float = sin(now_ms / 300.0 + wx) * 3.0
		var local := Vector2(wx, wy) - global_position
		var skin: Texture2D = _skin_for(item)
		var drop_pos := local + Vector2(-34 * 0.58, b - 34 * 0.82) # 52592
		if skin != null:
			# Source6029: the WebGPU proxy ignores shadowColor/Blur/Offset.
			draw_texture_rect(skin,preload("res://scripts/native_source_canvas_labels.gd").snap(self,Rect2(drop_pos-Vector2(17,17),Vector2(34,34))),false)
		else:
			draw_circle(drop_pos, 6.0, Color(RARITY_C[clampi(int(item.get("rarity", 0)), 0, 5)])) # emoji 폴백 상당(폰트 이모지 미이식 기록)
	for part in _parts:
		var part_col: Color = part["col"]
		part_col.a = clampf(float(part["life"]) / float(part["max"]), 0.0, 1.0)
		draw_circle(Vector2(part["x"], part["y"]) - global_position, float(part["sz"]), part_col)


func get_native_world_drops_snapshot() -> Dictionary:
	return {"configured": _owners_live(), "records": _state.read_native_drop_records().size() if _owners_live() else -1,
		"pick_log": _pick_log.duplicate(true), "beam_frames_loaded": int(_beam_frames[0] != null) + int(_beam_frames[1] != null),
		"toast_visible": _toast.visible if is_instance_valid(_toast) else false,
		"toast_text": _toast.text if is_instance_valid(_toast) else "",
		"implemented": ["item 렌더(빔·스킨·바운스·그림자 근사)", "R 프레스/홀드 줍기(최고 등급·화면 내)",
			"INV 반입(_invFindSpace·가득 참 notify)", "드랍음/획득음/파티클/토스트"],
		"unported": ["mat/potion 일괄 수거·chest/debris/hp/o2bubble(생성 경로 미이식 타입)",
			"bonePart 줍기(도감 _boneRegister·유골함 지급 미이식 — 정지·기록)",
			"_invAutoSortIfClosed 재정렬(인벤 UI 소유)", "그림자 blur(오프셋 실루엣 근사)",
			"펫 대사·_systemLesson·dbSaveForce", "minPickRar/minPickLvTier 설정 필터(OPT UI 미이식 — 드랍 생성측 thr만 적용됨)"]}

func _physics_process(_delta: float) -> void:
	var tree_root: Window=get_tree().root
	if not tree_root.has_meta("demo47i_stage"):
		_demo47i_physics_body(_delta);return
	var started: int=Time.get_ticks_usec()
	_demo47i_physics_body(_delta)
	var elapsed: int=Time.get_ticks_usec()-started
	var perf: Dictionary=tree_root.get_meta("demo47i_perf",{})
	var key: String=str(tree_root.get_meta("demo47i_stage"))+"|native_world_drops.gd::_physics_process"
	var row: Dictionary=perf.get(key,{"max_us":0,"calls":0,"total_us":0})
	row.max_us=maxi(row.max_us,elapsed);row.calls+=1;row.total_us+=elapsed
	perf[key]=row;tree_root.set_meta("demo47i_perf",perf)
