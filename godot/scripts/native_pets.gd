extends Node2D
## P2-004a — 첫 전투 펫 4종(까마귀 HECTOR·고양이 DIROI·유령쇠뇌·유령불꽃 이리스) +
## 펫 대사 자막(petSubtitle). 표시 전용 소비자 — 적/플레이어 상태는 읽기만.
##
## 원본 근거(game.html):
## - 소환: 새 게임 initStage 경로 30798 — crow(P-0,-20)·cat(+0,+10)·xbow(-30,-28)·
##   iris(+20,-34), cat.t=~~(rand()*100)(비게임플레이 Math.random → world 공유 샘플러),
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
##   트리거: [1] 튜토리얼 15종(9555~9568)·[3] 긴급 HP50/30(9547~9550) 구현,
##   카운터 _petOnAtk=hurtE 진입(42117 — hurtE 1회=1), _petOnHit=hurtP(43425),
##   _petOnKill=42702(처치). 자막 패널: #petSubtitle DOM(2587+CSS 2026-09-29 계약 —
##   bottom 230px·좌/우 20px·초상 480px·scale 1.5·텍스트 crow(92,237,306,51)/
##   cat(122,250,190,42)·0.92rem·opacity max .6).
## 정정: P2-001d의 '이리스 피해 108~156' 추정은 오귀속 — 현 원본 펫 4종 모두 공격
## 코드 없음(41496~41541). 해당 피해 출처는 별도 조사 항목.

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
				_pet_kill_cnt += 1
		elif kind == "player_damage":
			_pet_hit_cnt += 1)
	_build_subtitle_panel()
	_configured = true
	return true


static func _load_frames(pattern: String, count: int) -> Array:
	var frames: Array = []
	for i in range(count):
		frames.append(load(pattern % i))
	return frames


func _physics_process(_delta: float) -> void:
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
	var need: bool = (not has_live_target) or int(pet["tgt_t"]) % 10 == 0
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


# ── 대사 엔진 (9389~9500 축약 없는 핵심부) ──
func _pet_tier_of(id: String) -> int:
	if id.begins_with("tut_") or id.begins_with("parry_") or id == "shift_hint":
		return 1
	if id == "warn_hp50" or id == "crisis_hp30":
		return 5 # urgent — 전용 경로에서만 사용
	return 2


func _pet_say(id: String, who: String, txt: String, dur_sec: float, pair_who: Variant = null,
		pair_txt: Variant = null, pair_dur: float = 5.0) -> bool:
	if _pet_bubble["t"] > 0.0:
		return false
	if float(_pet_dlg_cd.get(id, 0.0)) > 0.0:
		return false
	_pet_bubble["who"] = who
	_pet_bubble["source"] = txt
	_pet_bubble["txt"] = txt # _T: ko 원문 그대로
	_pet_bubble["mt"] = floor(dur_sec * 60.0)
	_pet_bubble["t"] = _pet_bubble["mt"]
	_pet_bubble["pair_fired"] = false
	_pet_bubble["pair"] = ({"who": pair_who, "txt": pair_txt, "mt": floor(pair_dur * 60.0)}
		if pair_who != null and pair_txt != null else null)
	_show_bubble(who, txt)
	_say_log.append({"id": id, "who": who})
	return true


func _pet_say_cd(id: String, who: String, txt: String, dur: float, cd: float,
		pw: Variant = null, pt: Variant = null, pd: float = 5.0) -> bool:
	# 9471: id쿨 + 말풍선 점유 + 티어 글로벌쿨
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


func _pet_say_urgent(id: String, who: String, txt: String, dur: float, cd: float,
		pw: Variant = null, pt: Variant = null, pd: float = 5.0) -> bool:
	# 9460s: 프레임 내 — 티어5 입찰(내부 가중치)
	if float(_pet_dlg_cd.get(id, 0.0)) > 0.0:
		return false
	var weights := {"warn_hp50": 40, "crisis_hp30": 60} # _PET_SURV_W 9418 해당분
	var w: int = int(weights.get(id, 50))
	if _in_frame:
		if _bid["tier"] == 5 and w <= int(_bid["weight"]):
			return false
		_bid = {"tier": 5, "weight": w, "id": id, "who": who, "txt": txt, "dur": dur, "cd": cd, "pw": pw, "pt": pt, "pd": pd}
		return true
	return false


func _pet_fire_bid() -> void:
	if int(_bid["tier"]) < 0:
		return
	var ok := _pet_say(str(_bid["id"]), str(_bid["who"]), str(_bid["txt"]), float(_bid["dur"]),
		_bid["pw"], _bid["pt"], float(_bid["pd"]))
	if ok:
		_pet_dlg_cd[str(_bid["id"])] = floor(float(_bid["cd"]) * 60.0)
	_bid["tier"] = -1


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


func _check_pet_dialogue() -> void:
	_update_pet_bubble()
	_bid["tier"] = -1
	_in_frame = true
	# [3] 긴급 — HP50/30 (9547~9550; 그 외 긴급은 미이식 기록)
	var hp: float = float(_player.get("hp"))
	var mhp: float = float(_player.get("max_hp"))
	if hp > 0.0 and hp < mhp * 0.5 and hp >= mhp * 0.3:
		_pet_say_urgent("warn_hp50", "crow", "…절반이다. 정신차려.", 3, 60, "cat", "체력 반 남았어! 물약 마실 타이밍!", 3)
	if hp > 0.0 and hp < mhp * 0.3 and hp >= mhp * 0.1:
		_pet_say_urgent("crisis_hp30", "crow", "피가 새고 있다. Shift. 빠져.", 4, 20, "cat", "사슬 던져! 끌려가면 무적이야!", 4)
	_pet_fire_bid()
	_in_frame = false
	# [1] 튜토리얼 (si0·Lv≤200 — 9555~9568). lv는 state P owner.
	var p: Variant = _state.read_current_p()
	if not p is Dictionary or int(p.get("lv", 1)) > 200:
		return
	if not _pet_tut.get("start", false):
		_pet_tut["start"] = true
		_pet_say_cd("tut_start", "crow", "일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.", 5, 9999,
			"cat", "…아직 살아있네. 좌클릭으로 저것들 쳐봐.", 5)
		return
	if not _pet_tut.get("atk3", false) and _pet_atk_cnt >= 3 and _pet_atk_cnt < 7:
		_pet_tut["atk3"] = true
		_pet_say_cd("tut_atk3", "crow", "좋아, 감각이 있군. 계속 쳐!", 5, 9999, "cat", "…치는 건 할 줄 아네. 피하는 건?", 5)
		return
	if not _pet_tut.get("atk7", false) and _pet_atk_cnt >= 7 and not _pet_charge_used:
		_pet_tut["atk7"] = true
		_pet_say_cd("tut_charge", "crow", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!", 5, 9999)
		return
	if not _pet_tut.get("firstHit", false) and _pet_hit_cnt >= 1:
		_pet_tut["firstHit"] = true
		_pet_say_cd("tut_1sthit", "cat", "…아파? 당연하지. 여긴 지옥이야.", 5, 9999)
		return
	if not _pet_tut.get("hit2", false) and _pet_hit_cnt >= 2:
		_pet_tut["hit2"] = true
		_pet_say_cd("tut_hit2", "crow", "Q를 눌러! 악의로 보호막을 만들 수 있다.", 5, 9999, "cat", "보호막 없이 버틸 생각은 버려.", 5)
		return
	if not _pet_tut.get("parryHint", false) and _pet_atk_cnt >= 8 and _pet_parry_cnt == 0:
		_pet_tut["parryHint"] = true
		_pet_say_cd("tut_parry", "crow", "E가 패링이다. 적 공격이 닿기 직전에 눌러!", 5, 9999, "cat", "못 하겠으면 때려. 안 죽으면 그만이야.", 5)
		return
	if not _pet_tut.get("firstKill", false) and _pet_kill_cnt >= 1:
		_pet_tut["firstKill"] = true
		_pet_say_cd("tut_1stkill", "crow", "하나 죽었군.", 4, 9999, "cat", "…고기 냄새. 싫진 않네.", 5)
		return
	if not _pet_tut.get("bowIntro", false) and _pet_kill_cnt >= 3:
		_pet_tut["bowIntro"] = true
		_pet_say_cd("tut_bow", "crow", "유령쇠뇌야. 인사해.", 3, 9999, "cat", "…말은 못해.", 4)
		return
	if not _pet_tut.get("firstItem", false):
		var bag: Variant = (_state.read_current_inventory() as Dictionary).get("bag")
		if bag is Array and (bag as Array).size() >= 1:
			if _pet_say_cd("tut_firstItem", "crow", "TAB을 눌러. 가방을 열고 장비를 입어야 한다.", 5, 9999,
					"cat", "주웠으면 껴야지! TAB!", 4):
				_pet_tut["firstItem"] = true
			return


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


func _show_bubble(who: String, txt: String) -> void:
	var is_crow := who == "crow"
	var viewport_size: Vector2 = get_viewport().get_visible_rect().size
	var portrait_path := "res://assets/pets/crow_portrait.png" if is_crow else "res://assets/pets/cat_portrait.png"
	if ResourceLoader.exists(portrait_path):
		_portrait.texture = load(portrait_path)
	# bottom 230px(1920×1080·ui-scale1), crow=left 20 / cat=right 20, origin bottom
	var panel_height := 320.0 * 1.5
	_subtitle_root.position = Vector2(20.0 if is_crow else viewport_size.x - 20.0 - 480.0 * 1.5,
		viewport_size.y - 230.0 - panel_height)
	# 텍스트 박스 (9372~9375): crow(92,237,306,51) / cat(122,250,190,42)
	if is_crow:
		_bubble_label.position = Vector2(92, 237)
		_bubble_label.size = Vector2(306, 51)
	else:
		_bubble_label.position = Vector2(122, 250)
		_bubble_label.size = Vector2(190, 42)
	_bubble_label.text = txt
	_subtitle_root.modulate = Color(1, 1, 1, PET_OP_MAX)


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
	return {"configured": _configured,
		"pets": {"crow": [pets["crow"]["x"], pets["crow"]["y"]], "cat": [pets["cat"]["x"], pets["cat"]["y"]],
			"xbow": [pets["xbow"]["x"], pets["xbow"]["y"]], "iris": [pets["iris"]["x"], pets["iris"]["y"]]} if _configured else {},
		"iris_target_alive": pets.get("iris", {}).get("tgt") is Object and is_instance_valid(pets["iris"]["tgt"]) if _configured else false,
		"counters": {"atk": _pet_atk_cnt, "hit": _pet_hit_cnt, "kill": _pet_kill_cnt, "parry": _pet_parry_cnt},
		"bubble": {"who": _pet_bubble["who"], "txt": _pet_bubble["txt"], "t": _pet_bubble["t"],
			"pair": _pet_bubble["pair"] != null, "alpha": _subtitle_root.modulate.a if is_instance_valid(_subtitle_root) else -1.0},
		"say_log": _say_log.duplicate(true), "tut": _pet_tut.duplicate(),
		"unported": ["펫 공격 없음(원본 41496~41541 — P2-001d '이리스 피해' 추정 오귀속 정정)",
			"대사 [2]키안내·[4]보스·[5]~[29] 카테고리(튜토리얼 15종 중 11종+긴급 2종만)",
			"펫 음성(_petSfx)·패드 키 치환(_padifyHint)·언어 전환(_refreshPetBubbleLanguage — ko 원문 고정)",
			"R 수거 연계·G.pets G-소유 이관(어댑터 보유 — G 40키 부트 계약 보존)",
			"crow _fly 애니(원본 미등록 dead)·cat t 난수=world 공유 샘플러(원본 Math.random)",
			"tut_charge 후속(firstCharge — 사슬기동 미이식)·parry 카운터(패링 콜백 미배선)",
			"이리스 LIT 색층(ci0 색 글로우 — P2-003a 색층 전체 미이식과 동일 경계)"]}
