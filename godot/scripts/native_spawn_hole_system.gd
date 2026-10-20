class_name ExoduserNativeSpawnHoleSystem
extends Node2D
## P3-002 — 1-1 소환굴(SPAWN_HOLE) owner. 원본 행 근거(현 리포 game.html 기준).
##
## 배치: genFromTemplate §9(30486~30522, tileRLE 분기) → 9.5 최소 보장(30574~30582) →
## 유효성 검증(30583~30599) → G._totalSpawned(30625) → G.spawnHoles(30681).
## 1-1 템플릿 = maps_data.js FIXED_MAPS[0](41~51 spawnHoles·10~17 rooms.spawns·36~39
## corridorSpawns), _cloneField11 30050의 (70,170)→(74,168) 보정. 원본 실측(Playwright,
## initStage(0) 직후): 14개·totalSpawned 168·최근접 d 1223.8 — 테스트 고정값.
## timer 필드(600+Math.random()*60)는 맵 생성 RNG 구간(encounters.json 캡처 시작 이전)이라
## 재현 불가 — 갱신 루프가 읽지 않으므로(소비자 없음) null로 기록한다.
##
## 갱신: update()(32111~) 35636~35693 — G.on·패링 레슨·일시정지 게이트 뒤 _gameFrame++(32137),
## _gameFrame<120 차단, 역순 순회, 2000px 접근 트리거 → 90틱 연출 → 총량
## _spawnHoleCount(31030)·간격 ~~(900/총량) → 생존 700↑ 대기 30 → 위치 탐색(랜덤 30회
## ·나선 20타일·중심 강제) → mkEn(x,y,0,rollEtype(0),false,undefined,h.room) →
## reviveIframes=15 → 간격 커브 → 완료 시 addParts 15·'⚔ 소환굴!'·shake(5+~~(size*9))·splice.
##
## RNG: 공유 스트림 world.sample_native_random_unit()으로 원본 소비 순서 그대로 —
## 위치(각·반경)×시도 → rollEtype(30993: ranged<.5, roll×total) → mkEn(31120~):
## rollElite → [rollMods] → spd → r → st2 → facing → projT → [etype 조건부] → bossPatT →
## [etype 조건부] → _bossOrbitAng → [47] → _erraticAng. 표 MKEN_LITERAL_DRAWS는 원본 객체
## 리터럴(31168~31357)에서 추출, etype 29종 전부 Playwright 실측 대조 0불일치.
##
## 액터: 원본 소환 적은 el=undefined(mkEn 인자 undefined — rollEl 미호출). Godot 전용
## 소비자는 etype0(enemy_melee_flesh_crawler.gd, 커튼 5링과 같은 스크립트)만 있다 →
## etype0만 실제 적으로 등록(element ""·element_id -1 = 원본 undefined: elMul 항상 1).
## 다른 etype(1-1 풀 28종)은 전용 스크립트가 없어 '정직 정지' — RNG·_spawned는 원본대로
## 소비하고 액터 없이 journal에 unported_etype으로 기록한다(가짜 대체 금지).
const EliteSelector = preload("res://port_modules/elite_spawn_rules_source/producer.gd")
const SCHEMA := "exoduser.godot.native-spawn-holes.v1"
const T := 40.0
const MAP_W := 200
const MAP_H := 200
const SPAWN_HOLE_NAME := "소환굴"          # 31029 SPAWN_HOLE.name
const SPAWN_HOLE_COL := "#aa4444"         # 31029 SPAWN_HOLE.col
const SPAWN_HOLE_CNT := {"S": 50, "M": 100, "L": 100} # 31029 SPAWN_HOLE.cnt
const STAGE := 0
# maps_data.js FIXED_MAPS[0] (1장 1층 썩은숲). 좌표는 타일.
const TEMPLATE_SPAWN_HOLES := [            # 41~51 (type S/M/L → size .3/.5/.8, 30492)
	[70, 170, "M"], [140, 160, "S"], [55, 140, "M"], [140, 130, "S"], [80, 105, "M"],
	[130, 80, "M"], [60, 60, "S"], [140, 45, "M"], [100, 25, "L"]]
const CH1_SOUTHWEST_FIX := [70, 170, 74, 168] # 30050 _cloneField11 si===0
const TEMPLATE_ROOM_SPAWNS := [            # 10~17 rooms[].spawns (rd.cx+dx, rd.cy+dy, grade)
	[100, 155, -6, 0, 0], [100, 155, 6, 0, 0],
	[80, 85, -4, 0, 1], [80, 85, 4, 0, 1],
	[120, 50, 0, -3, 2], [120, 50, 0, 3, 2], [120, 50, -5, 0, 2]]
const TEMPLATE_CORRIDOR_SPAWNS := [[100, 138], [100, 103]] # 36~39 corridorSpawns
const MIN_HOLE_D2 := 250000.0             # 500px 최소 간격(30494 등)
const TILE_HOLE_CAP := 50                 # 30516 _tileHoleCap
const MIN_HOLES := 6                      # 30574 _minHoles
const TRIGGER_D2 := 4000000.0             # 35641/35647 2000^2
const SPAWN_DELAY_TICKS := 90.0           # 35652 _spawnDelay=90
const SPAWN_WINDOW_TICKS := 900           # 35656 ~~(900/총량)
const ALIVE_CAP := 700                    # 35658 G._aliveEns>=700
const ALIVE_WAIT_TICKS := 30.0            # 35658 _spawnCD=30
const GAME_FRAME_GATE := 120              # 35637 _gameFrame<120
const POS_TRIES := 30                     # 35662
const SPIRAL_MAX := 20                    # 35669 _sr<20
const REVIVE_IFRAMES := 15.0              # 35677 ne.reviveIframes=15
# rollEtype(0) 30993~31000: HELL_SPAWN[0](30969) − _CH1_OPENING_EXCLUDED_ET{2,22,30,43}(30992),
# _RANGED_ET(30991)과의 교집합 여부로 반분.
const HELL0_POOL := [[0, 12], [1, 4], [3, 4], [4, 14], [5, 5], [6, 12], [7, 7], [8, 3], [9, 2],
	[10, 6], [11, 3], [12, 10], [13, 1], [14, 5], [15, 3], [16, 5], [17, 1], [18, 3], [19, 2],
	[20, 8], [21, 6], [23, 5], [24, 8], [25, 2], [26, 3], [27, 3], [28, 2], [29, 1], [47, 16]]
const RANGED_ETYPES := [1, 7, 8, 9, 13, 16, 17, 25, 26, 34, 38, 42, 45, 46, 48, 53, 54, 66, 71, 76, 78, 82, 84, 86, 88]
# mkEn 객체 리터럴 Math.random 소비(원문 순서). etypes=[] → 무조건. 1-1 풀 밖 etype 행은
# 풀 밖이라 생략(이 시스템은 HELL0_POOL 밖 etype을 만들지 않는다).
const MKEN_LITERAL_DRAWS := [
	["st2", [], 30.0, 50.0], ["facing", [], 0.0, TAU], ["projT", [], 180.0, 120.0],
	["bossPatT", [], 30.0, 20.0],
	["shieldAng", [6], 0.0, TAU], ["shieldBashCd", [6], 120.0, 60.0], ["shieldBashT", [6], 60.0, 40.0],
	["summonCd", [7], 200.0, 100.0], ["summonT", [7], 100.0, 60.0],
	["teleportCd", [7], 150.0, 80.0], ["teleportT", [7], 80.0, 40.0],
	["bombCd", [8], 100.0, 50.0], ["bombT", [8], 50.0, 30.0],
	["reviveCd", [9], 300.0, 120.0], ["reviveT", [9], 150.0, 80.0],
	["stealthCd", [10], 180.0, 60.0], ["stealthT", [10], 60.0, 40.0],
	["wombCd", [11], 240.0, 80.0], ["wombT", [11], 80.0, 40.0],
	["webCd", [13], 120.0, 40.0], ["webT", [13], 40.0, 20.0],
	["swoopCd", [14], 140.0, 60.0], ["swoopT", [14], 50.0, 30.0],
	["trapCd", [16], 200.0, 60.0], ["trapT", [16], 60.0, 30.0],
	["motherCd", [17], 300.0, 100.0], ["motherT", [17], 100.0, 50.0],
	["slamCd", [19], 200.0, 80.0], ["slamT", [19], 80.0, 40.0],
	["_iceSwoopCd", [27], 100.0, 40.0], ["_iceSwoopT", [27], 30.0, 20.0],
	["_iceSlimeCd", [25], 120.0, 40.0], ["_iceSlimeT", [25], 40.0, 20.0],
	["_iceSlamCd", [28, 29], 250.0, 80.0], ["_iceSlamT", [28, 29], 80.0, 40.0],
	["_iceBlizzCd", [26], 180.0, 60.0], ["_iceBlizzT", [26], 60.0, 30.0],
	["_bossOrbitAng", [], 0.0, TAU],
	["_stCloneCd", [47], 200.0, 60.0], ["_stCloneT", [47], 80.0, 40.0], ["_stTpCd", [47], 120.0, 40.0],
	["_erraticAng", [], 0.0, TAU]]
const ELITE_PROB_HELL0 := [0.03, 0.0, 0.0] # 31041 ELITE_PROB[0] = [magic,rare,champion]
const ELITE_HP_MUL := [1.0, 2.0]           # 31033 ELITE_TIERS
const ELITE_ATK_MUL := [1.0, 1.3]
const ELITE_SCALE_MUL := [1.0, 1.08]
const HELL0_ATTACK_MODS := ["M29", "M30"]  # 31072 rollMods: hell0 attacks
const ETYPE0_SPD := 0.39                   # ETYPE_SPD[0] (실측)
const ETYPE0_R := 10.0                     # ETYPE_R[0]
const MOB8_TOTAL := 40
const MOB8_COLS := 8
const FLESH_SCRIPT := preload("res://scripts/enemy_melee_flesh_crawler.gd")
const HURTE_OWNER := preload("res://scripts/native_dedicated_enemy_hurte_owner.gd")
const FLESH_CONFIG_FILE := "res://data/etype0_physical_flesh_crawler.json"
const VOID_BLACK_TEXTURE := "res://assets/vfx/vfx_void_black.png" # 19350 assets/vfx/boss/vfx_void_black.png
const VOID_BLACK_FW := 768.0               # 19350 registerVFX(...,768,768,9,3)
const VOID_BLACK_FRAMES := 9
const VOID_BLACK_COLS := 3

var world: Node2D
var player: Node2D
var state: Node
var main: Node
var holes: Array = []          # G.spawnHoles (state G와 같은 배열)
var total_spawned := 0         # G._totalSpawned
var active := false            # 갱신 루프 가동(하니스 부팅은 휴면 — 커튼 install_native_boot 선례)
var alive_cap := ALIVE_CAP     # 35658 상한(하니스가 대기 분기를 검증할 때만 낮춘다)
var placement_log: Array = []
var spawn_journal: Array = []
var _game_frame := 0           # _gameFrame(32099/32137) — G.on·레슨·일시정지 통과 갱신 횟수
var _template: Dictionary = {}
var _spawned_actors: Array = []
var _next_order := 2000        # Godot 레지스트리 북키핑(원본 무해당; 커튼 16~·레슨 1000~)
var _stage_marker_bound := false # DEMO11-43: blocks legacy coordinate/RNG scheduler
var _configured := false
var _g_receipts: Array = []
var _void_black: Texture2D
var _label_font: Font
var _drawer: Node2D
var _metrics := {"advance_calls": 0, "rng_calls": 0, "triggered": 0, "spawn_attempts": 0,
	"spawned": 0, "actors_registered": 0, "unported_spawns": 0, "consumer_rejected": 0,
	"mken_null": 0, "alive_waits": 0, "spiral_fallbacks": 0, "center_forced": 0,
	"completed": 0, "revive_decays": 0}

class _HoleDrawer extends Node2D:
	var system: Node
	func _draw() -> void:
		if system == null or system._game_frame <= GAME_FRAME_GATE: # 52617 if(_gameFrame>120)
			return
		var now := float(Time.get_ticks_msec())
		var holes_now: Array = system.holes
		for hi in range(holes_now.size()):
			var h: Dictionary = holes_now[hi]
			var at := to_local(Vector2(float(h["x"]), float(h["y"])))
			var size: float = float(h["size"])
			var sh_size := 150.0 + size * 150.0 # 52622
			var tex: Texture2D = system._void_black
			if tex != null:
				var spd := 180.0 - float(int(size * 60.0)) # 52624 _shSpd=180-~~(size*60)
				var frame := int(floor((now + hi * 500.0) / spd)) % VOID_BLACK_FRAMES
				var src := Rect2((frame % VOID_BLACK_COLS) * VOID_BLACK_FW, int(frame / VOID_BLACK_COLS) * VOID_BLACK_FW,
					VOID_BLACK_FW, VOID_BLACK_FW)
				var pulse := sin(now / 250.0 + hi) * 0.15 # 52628
				draw_texture_rect_region(tex, Rect2(at - Vector2.ONE * sh_size * 0.5, Vector2.ONE * sh_size), src,
					Color(1, 1, 1, clampf(0.7 + pulse, 0.0, 1.0)))
				if h.get("_triggered") == true: # 52632~52637 트리거 후 확대 글로
					var delay: Variant = h.get("_spawnDelay")
					var glow: float = maxf(0.0, 1.0 - float(delay) / 180.0) if delay != null else 1.0
					var g_size := sh_size * (1.0 + glow * 0.4)
					draw_texture_rect_region(tex, Rect2(at - Vector2.ONE * g_size * 0.5, Vector2.ONE * g_size), src,
						Color(1, 1, 1, clampf(glow * 0.5, 0.0, 1.0)))
			else: # 52638~52640 시트 미로드 폴백
				draw_circle(at, sh_size * 0.5, Color(0, 0, 0, 0.4))
			# 52641~52642: bold 10px monospace, SPAWN_HOLE.col α.7, 중앙 정렬, 위 6px
			if system._label_font != null:
				var label_w: float = system._label_font.get_string_size(SPAWN_HOLE_NAME, HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x
				draw_string(system._label_font, at + Vector2(-label_w * 0.5, -sh_size * 0.5 - 6.0), SPAWN_HOLE_NAME,
					HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(Color(SPAWN_HOLE_COL), 0.7))

## 부팅 설치. 원본 순서: 신규 게임 리셋(G.spawnHoles=[]) → initStage(0)의 genFromTemplate
## 배치 → 인트로/커튼 → 레슨 → 갱신. 커스텀 SceneTree(테스트 하니스) 부팅은 배치·G 기록만
## 하고 갱신 루프는 휴면(기존 테스트 기준선 불변 — 커튼 install_native_boot 선례).
## 하니스가 원하면 add_child 전에 main.set_meta("native_spawn_holes", "active").
static func install_native_boot(owner_main: Node) -> Node2D:
	var system: Node2D = ExoduserNativeSpawnHoleSystem.new()
	system.name = "NativeSpawnHoleSystem"
	if not system.configure(owner_main.get("world"), owner_main.get("player"), owner_main.get("source_state"), owner_main):
		system.free()
		return null
	owner_main.get("world").add_child(system)
	var placed: Dictionary = system.install_placement()
	if placed.get("applied") != true:
		push_warning("P3-002 spawn holes placement rejected: " + str(placed.get("reason")))
	var harness_boot: bool = owner_main.get_tree() != null and owner_main.get_tree().get_script() != null
	var mode: String = str(owner_main.get_meta("native_spawn_holes", "auto"))
	system.active = mode == "active" or (mode == "auto" and not harness_boot)
	return system

func configure(owner_world: Node2D, owner_player: Node2D, state_node: Node, owner_main: Node = null) -> bool:
	if _configured or not is_instance_valid(owner_world) or not is_instance_valid(owner_player) \
			or not owner_world.get("map_data") is Dictionary:
		return false
	world = owner_world
	player = owner_player
	state = state_node
	main = owner_main
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(FLESH_CONFIG_FILE))
	if not parsed is Dictionary or not parsed.get("runtime") is Dictionary:
		return false
	_template = parsed["runtime"]
	_void_black = load(VOID_BLACK_TEXTURE) if ResourceLoader.exists(VOID_BLACK_TEXTURE, "Texture2D") else null
	var mono := SystemFont.new()
	mono.font_names = PackedStringArray(["monospace"])
	mono.font_weight = 700
	_label_font = mono
	process_mode = Node.PROCESS_MODE_PAUSABLE
	_drawer = _HoleDrawer.new()
	_drawer.name = "SpawnHoleDrawer"
	_drawer.system = self
	_drawer.z_as_relative = false
	# 52616 원본은 MAP_OBJS 위·적 아래. Godot는 소품·적이 같은 y정렬 z대역을 공유하므로
	# 지면층(-2500 지면 소품·-3000 맵 위, y정렬 소품·적 아래)에 둔다 — 잔여 기록.
	_drawer.z_index = -2001
	add_child(_drawer)
	_configured = true
	return true

static func spawn_hole_count(size: float, si: int = STAGE) -> int:
	# 31030 _spawnHoleCount: size≤.3 S, ≤.5 M, 그 외 L; si0 = ceil(ceil(base×.5)×.3).
	var type := "S" if size <= 0.3 else ("M" if size <= 0.5 else "L")
	var base: int = int(SPAWN_HOLE_CNT.get(type, 50))
	return int(ceil(ceil(base * 0.5) * 0.3)) if si == 0 else base

static func _tile_at(tiles: Array, x: int, y: int) -> int:
	return int(tiles[y * MAP_W + x])

static func _too_close(list: Array, x: float, y: float, min_d2: float = MIN_HOLE_D2) -> bool:
	for h in list:
		var dx: float = float(h["x"]) - x
		var dy: float = float(h["y"]) - y
		if dx * dx + dy * dy < min_d2:
			return true
	return false

## genFromTemplate §9 tileRLE 분기 ~ 30625. map_data.tiles는 원본 G.map과 같은 격자
## (해시 3930185914 일치 — 실측). 반환 holes 순서 = 원본 G.spawnHoles 순서.
static func build_native_placement(map_data: Dictionary) -> Dictionary:
	var tiles: Variant = map_data.get("tiles")
	if not tiles is Array or (tiles as Array).size() != MAP_W * MAP_H:
		return {"valid": false, "reason": "map_tiles_unavailable"}
	var list: Array = []
	var notes: Array = []
	# 1) tmpl.spawnHoles (30491~30496)
	for sh in TEMPLATE_SPAWN_HOLES:
		var hx: int = sh[0]
		var hy: int = sh[1]
		if hx == CH1_SOUTHWEST_FIX[0] and hy == CH1_SOUTHWEST_FIX[1]: # 30050
			hx = CH1_SOUTHWEST_FIX[2]
			hy = CH1_SOUTHWEST_FIX[3]
		var size := 0.3 if sh[2] == "S" else (0.5 if sh[2] == "M" else 0.8)
		var tx := (hx + 0.5) * T
		var ty := (hy + 0.5) * T
		if not _too_close(list, tx, ty):
			list.append(_new_hole(tx, ty, size, 1))
		else:
			notes.append({"line": 30494, "rejected": [tx, ty], "reason": "min_spacing_500"})
	# 2) tmpl.objs hole_* (30498~30504) — FIXED_MAPS[0].objs는 player_start뿐 → 0건.
	# 3) rooms.spawns (30505~30509): size=.3+grade*.25, room 1
	for sp in TEMPLATE_ROOM_SPAWNS:
		var tx: float = (sp[0] + sp[2] + 0.5) * T
		var ty: float = (sp[1] + sp[3] + 0.5) * T
		if not _too_close(list, tx, ty):
			list.append(_new_hole(tx, ty, 0.3 + sp[4] * 0.25, 1))
		else:
			notes.append({"line": 30508, "rejected": [tx, ty], "reason": "min_spacing_500"})
	# corridorSpawns (30511~30514): size .3, room -1
	for cs in TEMPLATE_CORRIDOR_SPAWNS:
		var tx: float = (cs[0] + 0.5) * T
		var ty: float = (cs[1] + 0.5) * T
		if not _too_close(list, tx, ty):
			list.append(_new_hole(tx, ty, 0.3, -1))
		else:
			notes.append({"line": 30513, "rejected": [tx, ty], "reason": "min_spacing_500"})
	# tileRLE 캡 50 (30516~30521): 뒤에서부터 복도(room -1) 우선 제거
	while list.size() > TILE_HOLE_CAP:
		var ci := -1
		for i in range(list.size() - 1, -1, -1):
			if int(list[i]["room"]) == -1:
				ci = i
				break
		list.remove_at(ci if ci >= 0 else list.size() - 1)
	# 9.5 최소 6개 보장(30574~30582)은 맵 생성 RNG 구간 — 1-1은 14개라 미발동. 부족하면 정직 정지.
	if list.size() < MIN_HOLES:
		return {"valid": false, "reason": "min_holes_fill_requires_map_generation_rng", "holes": list, "log": notes}
	# 유효성 검증(30583~30599): 벽/범위 밖이면 나선(1..14) 바닥 이동, 실패면 제거;
	# 주변 11×11 바닥(0) 30칸 미만이면 제거.
	for i in range(list.size() - 1, -1, -1):
		var h: Dictionary = list[i]
		var stx := int(float(h["x"]) / T)
		var sty := int(float(h["y"]) / T)
		if stx < 0 or sty < 0 or stx >= MAP_W or sty >= MAP_H or _tile_at(tiles, stx, sty) == 1:
			var found := false
			for sr in range(1, 15):
				if found:
					break
				for sdy in range(-sr, sr + 1):
					if found:
						break
					for sdx in range(-sr, sr + 1):
						if absi(sdx) != sr and absi(sdy) != sr:
							continue
						var nx := stx + sdx
						var ny := sty + sdy
						if nx >= 0 and ny >= 0 and nx < MAP_W and ny < MAP_H and _tile_at(tiles, nx, ny) == 0:
							h["x"] = (nx + 0.5) * T
							h["y"] = (ny + 0.5) * T
							stx = nx
							sty = ny
							found = true
							notes.append({"line": 30592, "moved": i, "to": [h["x"], h["y"]]})
							break
			if not found:
				notes.append({"line": 30594, "removed": i, "reason": "no_floor_spiral"})
				list.remove_at(i)
				continue
		var fc := 0
		for dy in range(-5, 6):
			for dx in range(-5, 6):
				var nx := stx + dx
				var ny := sty + dy
				if nx >= 0 and ny >= 0 and nx < MAP_W and ny < MAP_H and _tile_at(tiles, nx, ny) == 0:
					fc += 1
		if fc < 30:
			notes.append({"line": 30598, "removed": i, "floor": fc})
			list.remove_at(i)
	# 30600~30623 _pathImgTerrain 보충: si0은 _MAP_COMPOSE[0].path 없음(실측 false) → 미발동.
	var total := 0
	for h in list:
		total += spawn_hole_count(float(h["size"]))
	return {"valid": true, "holes": list, "total": total, "log": notes}

static func _new_hole(x: float, y: float, size: float, room: int) -> Dictionary:
	# timer: 600+Math.random()*60 — 맵 생성 RNG 구간(미재현·소비자 없음) → null. alive: 0
	# (42733 _fromHole 감산은 _fromHole 기록처가 없어 사문 — 원본 그대로 0 유지).
	return {"x": x, "y": y, "size": size, "timer": null, "alive": 0, "room": room}

func install_placement() -> Dictionary:
	if _stage_marker_bound:return {"applied":false,"reason":"stage_marker_owner_bound"}
	if not _configured:
		return {"applied": false, "reason": "not_configured"}
	var built: Dictionary = build_native_placement(world.get("map_data"))
	if built.get("valid") != true:
		return {"applied": false, "reason": built.get("reason")}
	holes = built["holes"]
	for i in range(holes.size()):
		holes[i]["_index"] = i # 원본 배치 순번(journal용 — 원본 필드 아님)
	total_spawned = int(built["total"])
	placement_log = built["log"]
	var receipt: Dictionary = _write_g({"spawnHoles": holes, "_totalSpawned": total_spawned})
	return {"applied": receipt.get("applied") == true, "reason": receipt.get("reason", ""),
		"count": holes.size(), "total": total_spawned}

## DEMO11-43: marker-resolved input only; never calls legacy template placement.
func install_stage_marker_holes(resolved_holes: Array) -> Dictionary:
	if not _configured or _stage_marker_bound or _game_frame!=0 or not _spawned_actors.is_empty():
		return {"applied":false,"reason":"spawn_stage_already_started"}
	var total:=0
	for h in resolved_holes:
		total+=spawn_hole_count(float(h.size),STAGE)
	var receipt: Dictionary=_write_g({"spawnHoles":resolved_holes,"_totalSpawned":total})
	if receipt.get("applied")!=true:return receipt
	holes=resolved_holes;total_spawned=total;active=false;_stage_marker_bound=true
	# No new etype is admitted. Future caller must bind constructor/registry first.
	set_physics_process(false)
	return {"applied":true}

func _write_g(writes: Dictionary) -> Dictionary:
	var receipt: Dictionary
	if is_instance_valid(state) and state.has_method("apply_native_spawn_hole_g_writes"):
		receipt = state.apply_native_spawn_hole_g_writes(self, writes)
	else:
		receipt = {"applied": false, "reason": "state_owner_unavailable"}
	_g_receipts.append({"fields": writes.keys(), "receipt": receipt})
	if _g_receipts.size() > 64:
		_g_receipts.pop_front()
	return receipt

func _unit(purpose: String, draws: Array) -> float:
	_metrics.rng_calls += 1
	var value := float(world.sample_native_random_unit())
	draws.append({"purpose": purpose, "value": value})
	return value

func _lesson_active() -> bool:
	# 32113 if(window._parryLesson&&window._parryLesson.tick())return — 레슨 진행 중 update 중단.
	var seq: Node = world.get_node_or_null("NativeIntroCurtainSequence") if is_instance_valid(world) else null
	var flow: Variant = seq.get("lesson_flow") if is_instance_valid(seq) else null
	return flow is Node and is_instance_valid(flow) and flow.get("active") == true

func _physics_process(delta: float) -> void:
	if not _configured or not active or not is_instance_valid(world) or not is_instance_valid(player):
		return
	if is_inside_tree() and get_tree().paused:
		return
	var g: Variant = state.read_current_g() if is_instance_valid(state) else null
	# 32112 if(!G.on)return / 32131 if(G.paused)return
	if not g is Dictionary or g.get("on") != true or g.get("paused") == true:
		return
	if _lesson_active():
		return
	advance_native(minf(delta * 60.0, 3.0))

## update() 한 프레임의 소환굴 몫. 하니스는 G.on 게이트 없이 직접 호출해 틱을 고정할 수 있다.
func advance_native(sp: float) -> void:
	if _stage_marker_bound and not is_instance_valid(natural_owner):return
	if not _configured or sp <= 0.0:
		return
	_metrics.advance_calls += 1
	_game_frame += 1 # 32137 _gameFrame++
	# 34456 적 루프: reviveIframes 자연 감소(소환 적만 >0) — hurtE owner 북키핑 API.
	var kept: Array = []
	for enemy in _spawned_actors:
		if not is_instance_valid(enemy):
			continue
		kept.append(enemy)
		var native: Dictionary = (enemy.get("data") as Dictionary).get("native_final", {})
		var rif: float = float(native.get("reviveIframes", 0.0))
		if rif > 0.0 and HURTE_OWNER.owner_current(enemy):
			HURTE_OWNER.apply_bookkeeping(enemy, {"reviveIframes": maxf(0.0, rif - sp)})
			_metrics.revive_decays += 1
	_spawned_actors = kept
	# 34357 G._aliveEns(이 프레임 소환 이전 집계)
	var alive_ens := 0
	for enemy in world.get_enemies():
		if is_instance_valid(enemy) and enemy.get("alive") == true:
			alive_ens += 1
	if _game_frame < GAME_FRAME_GATE: # 35637 시작 2초 트리거 차단
		_redraw()
		return
	var px: float = player.global_position.x
	var py: float = player.global_position.y
	var hi := holes.size() - 1
	while hi >= 0:
		if hi >= holes.size():
			hi -= 1
			continue
		var h: Dictionary = holes[hi]
		var hqd: float = (px - float(h["x"])) * (px - float(h["x"])) + (py - float(h["y"])) * (py - float(h["y"]))
		if hqd > TRIGGER_D2 and h.get("_triggered") != true: # 35642
			hi -= 1
			continue
		if h.get("_triggered") != true: # 35647~35650
			if hqd < TRIGGER_D2:
				h["_triggered"] = true
				_metrics.triggered += 1
			hi -= 1
			continue
		if h.get("_spawnDelay") == null: # 35652
			h["_spawnDelay"] = SPAWN_DELAY_TICKS
		if float(h["_spawnDelay"]) > 0.0: # 35653
			h["_spawnDelay"] = float(h["_spawnDelay"]) - sp
			hi -= 1
			continue
		if h.get("_spawnTotal") == null: # 35656
			h["_spawnTotal"] = spawn_hole_count(float(h["size"]), STAGE)
			h["_spawned"] = 0
			h["_spawnCD"] = 0.0
			h["_spawnInterval"] = int(SPAWN_WINDOW_TICKS / int(h["_spawnTotal"]))
		if float(h["_spawnCD"]) > 0.0: # 35657
			h["_spawnCD"] = float(h["_spawnCD"]) - sp
			hi -= 1
			continue
		if alive_ens >= alive_cap: # 35658
			h["_spawnCD"] = ALIVE_WAIT_TICKS
			_metrics.alive_waits += 1
			hi -= 1
			continue
		# 35660~35679 1마리 소환
		_metrics.spawn_attempts += 1
		var made: bool = _spawn_one(h)
		h["_spawned"] = int(h["_spawned"]) + 1
		if not made: # 35675 if(!ne){h._spawned++;continue} — 커브·완료 판정 건너뜀
			hi -= 1
			continue
		# 35681~35685 간격 커브
		var prog: float = float(h["_spawned"]) / float(h["_spawnTotal"])
		var curve: float
		if prog < 0.3:
			curve = 0.6 + prog * 2.67
		elif prog < 0.7:
			curve = 1.4 - (prog - 0.3) * 1.5
		else:
			curve = 0.8 - (prog - 0.7) * 1.67
		var interval: int = int(h["_spawnInterval"]) if int(h["_spawnInterval"]) != 0 else 5
		h["_spawnCD"] = float(maxi(1, int(interval * maxf(0.2, curve))))
		# 35687~35692 완료 → 이펙트 + 제거
		if int(h["_spawned"]) >= int(h["_spawnTotal"]):
			_complete(hi, h)
		hi -= 1
	_redraw()

func _redraw() -> void:
	if is_instance_valid(_drawer):
		_drawer.queue_redraw()

func _spawn_one(h: Dictionary) -> bool:
	if is_instance_valid(natural_owner):return natural_owner.spawn_hole(h)
	var draws: Array = []
	var size: float = float(h["size"])
	# 35662~35664 do{각·반경}while(_hTry<30&&isW(x,y,true))
	var sx := 0.0
	var sy := 0.0
	var tries := 0
	while true:
		var ang := TAU * _unit("pos_angle", draws)
		var rad := 120.0 + _unit("pos_radius", draws) * 300.0 + size * 150.0
		sx = float(h["x"]) + cos(ang) * rad
		sy = float(h["y"]) + sin(ang) * rad
		tries += 1
		if not (tries < POS_TRIES and world.is_world_blocked(Vector2(sx, sy))):
			break
	if world.is_world_blocked(Vector2(sx, sy)): # 35666~35673 나선(G.map 0만) → 중심 강제
		var ctx := int(float(h["x"]) / T)
		var cty := int(float(h["y"]) / T)
		var tiles: Array = world.get("map_data")["tiles"]
		var found := false
		for sr in range(1, SPIRAL_MAX):
			if found:
				break
			for sdy in range(-sr, sr + 1):
				if found:
					break
				for sdx in range(-sr, sr + 1):
					if absi(sdx) != sr and absi(sdy) != sr:
						continue
					var nx := ctx + sdx
					var ny := cty + sdy
					if nx > 0 and ny > 0 and nx < MAP_W - 1 and ny < MAP_H - 1 and _tile_at(tiles, nx, ny) == 0:
						sx = (nx + 0.5) * T
						sy = (ny + 0.5) * T
						found = true
						break
		if found:
			_metrics.spiral_fallbacks += 1
		else:
			sx = float(h["x"])
			sy = float(h["y"])
			_metrics.center_forced += 1
	# 35674 rollEtype(G.stage=0) — mkEn 인자 평가가 mkEn 본문보다 먼저.
	var ranged_u := _unit("rollEtype_ranged", draws)
	var roll_u := _unit("rollEtype_roll", draws)
	var ranged: bool = ranged_u < 0.5
	var etype: int = roll_etype_from(ranged_u, roll_u)
	var entry_log := {"hole": int(h.get("_index", -1)), "hole_xy": [h["x"], h["y"]], "frame": _game_frame,
		"spawn_n": int(h.get("_spawned", 0)) + 1, "requested": [sx, sy], "etype": etype,
		"ranged": ranged, "room": int(h["room"]), "draws": draws}
	# mkEn 31124: canMv(x,y,10) 실패 → safePt, 그것도 실패면 null(난수 무소비).
	var pos := Vector2(sx, sy)
	if not world.can_move(pos, 10.0):
		var safe: Variant = world.native_safe_point(sx, sy, 10.0)
		if not safe is Dictionary:
			_metrics.mken_null += 1
			entry_log["consumer"] = "mken_null"
			_journal(entry_log)
			return false
		pos = Vector2(float(safe["x"]), float(safe["y"]))
	entry_log["position"] = [pos.x, pos.y]
	# mkEn 난수: rollElite(31063) → [rollMods 31072] → spd(31138) → r(31140) → 리터럴.
	var selection: Dictionary = EliteSelector.constructor_prefix(0,false,func(purpose):return _unit(purpose,draws))
	if selection.status != "READY":return false
	var elite: int = int(selection.elite)
	var mods: Array = selection.mods
	var spd_u := _unit("spd", draws)
	var r_u := _unit("r", draws)
	var literal := {}
	for row in MKEN_LITERAL_DRAWS:
		var etypes: Array = row[1]
		if etypes.is_empty() or etypes.has(etype):
			literal[row[0]] = float(row[2]) + _unit(row[0], draws) * float(row[3])
	entry_log["elite"] = elite
	entry_log["mods"] = mods.duplicate()
	if etype != 0:
		# 전용 소비자 없음 — 정직 정지(액터 없음). 원본에선 이 적이 생성·ens 등록된다.
		_metrics.unported_spawns += 1
		_metrics.spawned += 1
		entry_log["consumer"] = "unported_etype"
		_journal(entry_log)
		return true
	var actor: Node = _make_etype0_actor(h, pos, elite, mods, spd_u, r_u, literal, entry_log)
	if actor == null:
		_metrics.consumer_rejected += 1
		entry_log["consumer"] = "consumer_rejected"
	else:
		_metrics.actors_registered += 1
		entry_log["consumer"] = "flesh_crawler"
		entry_log["actor_id"] = str(actor.get("data")["id"])
		_spawned_actors.append(actor)
	_metrics.spawned += 1
	_journal(entry_log)
	return true

## rollEtype(30993~30999) si===0 분기: ranged=u1<.5 → 풀 필터 → roll=u2×total 누적 차감.
static func roll_etype_from(ranged_u: float, roll_u: float) -> int:
	var ranged: bool = ranged_u < 0.5
	var pool: Array = []
	var pool_total := 0
	for entry in HELL0_POOL:
		if RANGED_ETYPES.has(int(entry[0])) == ranged:
			pool.append(entry)
			pool_total += int(entry[1])
	if pool.is_empty():
		return 0
	var roll: float = roll_u * pool_total
	for entry in pool:
		roll -= float(entry[1])
		if roll < 0.0:
			return int(entry[0])
	return int(pool[pool.size() - 1][0])

func _journal(entry: Dictionary) -> void:
	spawn_journal.append(entry)

## mkEn(31120~) etype0/si0/ib=false/el=undefined/room=h.room. monLv=P.lv+DIFF_LV_OFF[5](0)
## +stageDiffOff(0), dm=DIFF_MUL[5]=1 (인트로 OPT.diff=5 강제 63358 — 실측 DIFF_MUL[5]=1·OFF 0).
func _make_etype0_actor(h: Dictionary, pos: Vector2, elite: int, mods: Array, spd_u: float, r_u: float,
		literal: Dictionary, entry_log: Dictionary) -> Node:
	var data := build_natural_etype0_runtime(h,pos,elite,mods,spd_u,r_u,literal,entry_log)
	var enemy: CharacterBody2D = FLESH_SCRIPT.new()
	enemy.configure(data, world)
	var registered: Variant = world.register_native_spawn_hole_enemy(enemy, int(data["order"]))
	if not registered is Dictionary or registered.get("valid") != true:
		entry_log["register_errors"] = registered.get("errors") if registered is Dictionary else ["invalid_receipt"]
		if is_instance_valid(enemy) and enemy.get_parent() == null:
			enemy.free()
		return null
	entry_log.merge({"hp": data.hp, "atk": data.attack, "radius": data.radius, "speed": data.speed_pixels_per_tick, "projCd": data.projectile_cooldown_ticks,
		"st2": data.initial_idle_ticks, "facing": data.facing, "projT": data.initial_projectile_ticks, "bossPatT": literal["bossPatT"]})
	return enemy

func _complete(hi: int, h: Dictionary) -> void:
	# 35688 addParts(h.x,h.y,col,15) — 기존 addParts 포트(공유 RNG 소비 포함)
	world.emit_native_parts(Vector2(float(h["x"]), float(h["y"])), SPAWN_HOLE_COL, 15)
	# 35689 addTxt(h.x,h.y-20,'⚔ '+name+'!',col,50)
	world.emit_native_text(float(h["x"]), float(h["y"]) - 20.0, "⚔ " + SPAWN_HOLE_NAME + "!", SPAWN_HOLE_COL, 50)
	# 35690 shake(5+~~(size*9)) → G.shake=max(G.shake,n*OPT.shake/100)
	var n: float = 5.0 + float(int(float(h["size"]) * 9.0))
	var opt_shake := 100.0
	if is_instance_valid(main) and main.has_method("read_native_feel_opt_shake"):
		var opt: Dictionary = main.read_native_feel_opt_shake()
		if opt.get("ready") == true:
			opt_shake = float(opt["value"])
	_write_g({"shake": n * opt_shake / 100.0})
	holes.remove_at(hi) # 35691 G.spawnHoles.splice(hi,1)
	_metrics.completed += 1

func get_snapshot() -> Dictionary:
	var holes_view: Array = []
	for h in holes:
		holes_view.append(h.duplicate(true))
	return {"schema": SCHEMA, "configured": _configured, "active": active, "game_frame": _game_frame,
		"holes": holes_view, "total_spawned": total_spawned, "placement_log": placement_log.duplicate(true),
		"metrics": _metrics.duplicate(true), "spawn_journal": spawn_journal.duplicate(true),
		"g_receipts": _g_receipts.duplicate(true), "void_black_texture": _void_black != null,
		"unported": [
			"etype≠0 소환 적 액터(전용 스크립트 없음 — RNG·_spawned만 원본대로, journal unported_etype)",
			"etype0 소환 적 탄 parry class: 원본 el=undefined → 'magic'(40515)·탄 el undefined, 전용 스크립트는 physical 고정",
			"etype0 스킨: _mob8Col/Row는 native 기록, 전용 스크립트는 템플릿 base_rect 고정(커튼과 동일)",
			"38590 updateE reviveIframes 2차 감소(화면 내 AI 갱신 적) — 34456 1차 감소만",
			"52616 렌더 순서: 원본 MAP_OBJS 위·적 아래 → Godot 지면층 z -2001(y정렬 소품 아래)",
			"timer 필드(맵 생성 RNG 구간 — 소비자 없음)",
			"9.5 최소 6개 보충·_pathImgTerrain 보충(1-1 미발동)",
			"_gpVibrate(진동 비활성)", "갱신 순서: 원본은 적 루프·checkRooms 뒤, Godot는 노드 물리 순서"]}

# DEMO11-enemy-base: same constructor, preparation separated from admission.
func build_natural_etype0_runtime(h: Dictionary,pos: Vector2,elite: int,mods: Array,spd_u: float,r_u: float,literal: Dictionary,entry_log: Dictionary) -> Dictionary:
	var mon_lv := 1
	if is_instance_valid(state):
		var p: Variant = state.read_current_p()
		if p is Dictionary and (p.get("lv") is int or p.get("lv") is float):
			mon_lv = maxi(1, int(p["lv"]))
	var spd := (ETYPE0_SPD + spd_u * 0.08) * 1.5
	var radius: float = (ETYPE0_R + r_u * 2.0) * 2.0 * float(ELITE_SCALE_MUL[elite])
	var base_curve: float
	if mon_lv <= 500:
		base_curve = (0.4 * mon_lv * mon_lv * mon_lv + 199.0 * mon_lv + 100.0) * 2.925
	else:
		base_curve = 50000000.0 * pow(1.0014, mon_lv - 500) * 2.925
	var pacing := 1.0 / (1.0 + minf(9.0, maxf(0.0, float(mon_lv) - 1.0)) / 18.0)
	var hp := int(floor(floor(base_curve * pacing * float(ELITE_HP_MUL[elite]))))
	var atk := int(floor((50.0 + mon_lv * 1.95) * 0.6 * float(ELITE_ATK_MUL[elite])))
	var proj_cd := 240 if elite == 0 else int(240 * 0.8) # 31159~31160
	# _assignMobSkin(23294): seed=(etype*7+~~(_homeX*31))&0x7fffffff, idx=seed%40.
	var skin_seed := int(floor(pos.x * 31.0)) & 0x7fffffff
	var skin_idx := skin_seed % MOB8_TOTAL
	var st2: float = literal["st2"]
	var facing: float = literal["facing"]
	var proj_t: float = literal["projT"]
	var data: Dictionary = _template.duplicate(true)
	var hole_index: int = int(h.get("_index", -1))
	var enemy_id := "ch1_spawn_hole_%02d_%02d" % [hole_index, int(entry_log["spawn_n"])]
	data["id"] = enemy_id
	data["name"] = "눈알 육괴"
	data["order"] = _next_order
	_next_order += 1
	data["room"] = int(h["room"])
	data["element"] = ""        # el=undefined (35674 mkEn(...,undefined,h.room))
	data["element_id"] = -1     # hurtE owner el 독해값 — elMul(a,undefined)=1과 동치
	data["spawn_position"] = [pos.x, pos.y]
	data["requested_spawn_position"] = entry_log["requested"].duplicate()
	data["level"] = mon_lv
	data["hp"] = hp
	data["attack"] = atk
	data["radius"] = radius
	data["speed_pixels_per_tick"] = spd
	data["elite"] = elite
	data["mods"] = mods.duplicate()
	data["poise"] = hp
	data["max_poise"] = hp
	data["eShield"] = hp
	data["eShieldMax"] = hp
	data["initial_idle_ticks"] = st2
	data["initial_facing"] = facing
	data["facing"] = facing
	data["initial_projectile_ticks"] = proj_t
	data["projectile_cooldown_ticks"] = proj_cd
	data["factory_random_seed"] = (skin_seed * 31 + data["order"]) & 0x7fffffff # Godot 내부 RNG 시드 심(원본 무해당)
	var timers: Dictionary = data["initial_timers"]
	timers["st2"] = st2
	timers["projT"] = proj_t
	timers["projCd"] = proj_cd
	timers["bossPatT"] = literal["bossPatT"]
	var native: Dictionary = data["native_final"]
	native["x"] = pos.x
	native["y"] = pos.y
	native["r"] = radius
	native["speed"] = spd
	native["st2"] = st2
	native["facing"] = facing
	native["hp"] = hp
	native["mhp"] = hp
	native["atk"] = atk
	native["poise"] = hp
	native["maxPoise"] = hp
	native["eShield"] = hp
	native["eShieldMax"] = hp
	native["projT"] = proj_t
	native["projCd"] = proj_cd
	native["bossPatT"] = literal["bossPatT"]
	native["_bossOrbitAng"] = literal["_bossOrbitAng"]
	native["_erraticAng"] = literal["_erraticAng"]
	native["_homeX"] = pos.x
	native["_homeY"] = pos.y
	native["_mob8Col"] = skin_idx % MOB8_COLS
	native["_mob8Row"] = skin_idx / MOB8_COLS
	native["reviveIframes"] = REVIVE_IFRAMES # 35677 ne.reviveIframes=15 (34456 감소는 advance_native)
	return data

var natural_owner: Node
