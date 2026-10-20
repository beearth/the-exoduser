class_name ExoduserNativeIntroCurtainSequence
extends Node2D
## P2-001h — 인트로 커튼 오픈 시퀀스 owner (원본 행 근거, 현 리포 game.html 기준).
## 체인: 인트로 컷신 종료 → _startIntro(63277~63293: ens 전부 제거·OPT.diff=5 강제(63358)·
## bonfire.t=0·G._intro=true·G.on=false·P.iframes=9999·커튼 닫힘 표시) → 키 가이드 4컷
## (_startIntroGuide 63357~) → _finishIntroGuide(63342~63348) → _openIntroCurtain(63411~63441):
## G.on=true·P.iframes=600 → (1-1은 tileRLE라 room/corridor 리스폰 생략 63417~63420) →
## 500px 퍼지(63422~63423) → 반경 580 오각 링(각 2πi/5−π/2) etype0 5마리
## mkEn(...,EL.P,-1)(63425~63432) → bonfire={t:300,r:280}(63433) → 커튼 0.8s 열림 →
## +900ms 정리(63436~63440).
## 부트 자동 활성화는 미배선 — source_startup_activation producer의 intro_curtain_completion
## 계약(v1)과 같은 ENGINE 통합 단계. begin/advance/finish는 공개 API + 최소 키 입력.
##
## RNG: mkEn(31120~)의 etype0 비보스 경로 소비 순서를 world.sample_native_random_unit()
## (공유 스트림)으로 그대로 재현 — (1)rollElite(31063) (2)매직일 때만 rollMods(31072:
## hell0 attacks=[M29,M30] 1회) (3)spd(31138) (4)r(31140) (5)st2(31149) (6)facing(31149)
## (7)projT(31152) (8)bossPatT(31156) (9)_bossOrbitAng(31260) (10)_erraticAng(31300)
## — (9)(10)은 P3-002 정정(원본 실측 비보스 9회+매직 1). aura는 elite>=2 전용(hell0 ELITE_PROB=[.03,0,0] →
## 매직까지만), etype 게이트 타이머들은 etype0에서 미소비(원본도 조건부 평가로 무소비).

## P2-001i — 실제 부팅 자동 연결. 원본 부팅 분기: 64483 bosstest→즉시 on / 64484
## G.stage===0→인트로 경로(컷신→가이드→커튼; 로비/컷신 영상은 이 첫 이식본 범위 밖이라
## '컷신 완료 후' 분기로 바로 진입) / 64486~ 비0 스테이지→즉시 on. 커스텀 SceneTree
## 스크립트(테스트 하니스) 부팅은 원본 테스트 우회 분기(63278 _wantPlateTest·64483
## _bossTestReq)에 상응해 시퀀스를 휴면으로 설치(기존 테스트 기준선 불변). 하니스가
## 인트로를 원하면 add_child 전에 main.set_meta("native_intro_boot","intro").
static func install_native_boot(main: Node) -> Node2D:
	var seq: Node2D = ExoduserNativeIntroCurtainSequence.new()
	seq.name = "NativeIntroCurtainSequence"
	var owner_world: Variant = main.get("world")
	if not seq.configure(owner_world, main.get("player"),
			main.call("get_native_intro_curtain_view"), main.get("source_state"), main.get("hud")):
		seq.free()
		return null
	owner_world.add_child(seq)
	var harness_boot: bool = main.get_tree() != null and main.get_tree().get_script() != null
	var mode: String = str(main.get_meta("native_intro_boot", "auto"))
	if mode == "intro" or (mode == "auto" and not harness_boot):
		# P2-001j — 32111 패링 레슨 흐름 owner. 인트로 부팅 경로에서만 설치(휴면 설치본에
		# 붙이면 테스트가 수동 시퀀스로 G.on을 켠 뒤 레슨이 자동 개입해 기준선을 흔든다 —
		# 원본도 레슨은 stage0 신규 게임 흐름에서만 시작·seen 재시작 금지 468~474).
		var flow: Node = LESSON_FLOW_SCRIPT.new()
		flow.name = "NativeParryLessonFlow"
		if flow.configure(owner_world, main.get("player"), main.get("source_state"), seq):
			seq.add_child(flow)
			seq.lesson_flow = flow
			# P2-001k — window._parryLesson 현재값을 레슨 owner로 교체(publish_current):
			# holder의 active/guard 독해와 hurtE 42111 위임(lesson_reference)이 이 객체를 본다.
			var holder: Variant = main.get("source_lesson")
			if holder is RefCounted and is_instance_valid(holder) and holder.has_method("publish_current"):
				holder.publish_current(flow, "native_main_binding",
					{"source": "P2-001k parry-lesson.js 현재값 -> 레슨 owner 객체", "caller": "install_native_boot"}, flow)
		else:
			flow.free()
		seq.begin_native_intro()
	return seq

const EliteSelector = preload("res://port_modules/elite_spawn_rules_source/producer.gd")
const RING_RADIUS := 580.0            # 63425 _iR
const RING_COUNT := 5                 # 63426
const PURGE_RADIUS := 500.0           # 63422
const BONFIRE_TICKS := 300.0          # 63433 t:300 (34413 t-=sp, 60Hz)
const BONFIRE_RADIUS := 280.0         # 63433 r:280
const GUIDE_STEPS := 4                # _INTRO_KEY_STEPS.length
const GUIDE_READY_MS := 250           # 63352 readyAt 쓰로틀
const CURTAIN_DISPOSE_MS := 900       # 63344/63436 setTimeout 900
const ELITE_PROB_HELL0 := [0.03, 0.0, 0.0] # 31033/31063 ELITE_PROB[0] = [magic,rare,champion]
const ELITE_HP_MUL := [1.0, 2.0]      # 31033 ELITE_TIERS hpMul (일반/매직)
const ELITE_ATK_MUL := [1.0, 1.3]
const ELITE_SCALE_MUL := [1.0, 1.08]
const HELL0_ATTACK_MODS := ["M29", "M30"] # 31072 rollMods: pool(hell<=0) ∩ M29..M32
const ETYPE0_SPD := 0.39              # 30858 ETYPE_SPD[0]=max(.2,.3*1.3)
const ETYPE0_R := 10.0                # 30859 ETYPE_R[0]
const MOB8_TOTAL := 40                # 23292
const MOB8_COLS := 8
const FLESH_SCRIPT := preload("res://scripts/enemy_melee_flesh_crawler.gd")
const LESSON_FLOW_SCRIPT := preload("res://scripts/native_parry_lesson_flow.gd") # P2-001j
const GUIDE_PANEL_SCRIPT := preload("res://scripts/native_intro_key_guide_panel.gd") # P2-007a #introKeys 표시
const GUIDE_SKIP_HOLD_MS := 2000.0    # 63390 Space 길게 2초 → 건너뛰기
const FLESH_CONFIG_FILE := "res://data/etype0_physical_flesh_crawler.json"
const BARRIER_TEXTURE := "res://assets/sprites/bonfire_barrier.png" # 원본 sprites/bonfire_barrier.png(18977)

var world: Node2D
var player: Node2D
var curtain_view: Control
var state: Node
var hud: Node
var lesson_flow: Node # P2-001j — 32111 패링 레슨 흐름 owner(인트로 부팅 경로 한정 설치)
var guide_panel: Control # P2-007a — #introKeys 4컷 패널(표시·클릭·voice_wakeup)
var _space_held_at_ms := -1 # 63362 state.spaceHeldAt (null=-1)
var phase := "idle" # idle -> guide -> opening -> done
var guide_step := 0
var _guide_ready_at_ms := 0
var _dispose_at_ms := -1
var _intro_flag := false  # G._intro 미러 (state G 기록은 startup_activation ENGINE 통합 잔여)
var _on_flag := true      # G.on 미러 (동일 잔여)
var bonfire := {"active": false, "x": 0.0, "y": 0.0, "t": 0.0, "r": BONFIRE_RADIUS}
var _barrier_texture: Texture2D
var _barrier: Node2D
var _template: Dictionary = {}
var _configured := false
var _metrics := {"rng_calls": 0, "spawned": 0, "magic_elites": 0, "purge_candidates": 0,
	"purge_removed": 0, "bonfire_pushes": 0, "safe_point_moves": 0}
var spawn_journal: Array = []  # 적별 {id, draws:[{purpose,value}], elite, fields...}
var _next_order := 16          # encounters.json 15 레코드 다음 (Godot 레지스트리 북키핑 — 원본 무해당)

class _BarrierDrawer extends Node2D:
	var seq: Node
	func _draw() -> void:
		if seq == null or not seq.bonfire["active"] or float(seq.bonfire["t"]) <= 0.0 \
				or seq._barrier_texture == null:
			return
		# 55323~55334: alpha=min(1,t/120)*.9, pulse=1+sin(now_ms/300)*.03, size=r*pulse*2, 일반 블렌드.
		var t: float = float(seq.bonfire["t"])
		var alpha: float = minf(1.0, t / 120.0) * 0.9
		var pulse: float = 1.0 + sin(Time.get_ticks_msec() / 300.0) * 0.03
		var size: float = float(seq.bonfire["r"]) * pulse * 2.0
		var at: Vector2 = to_local(Vector2(seq.bonfire["x"], seq.bonfire["y"]))
		draw_texture_rect(seq._barrier_texture, Rect2(at - Vector2.ONE * size * 0.5, Vector2.ONE * size),
			false, Color(1, 1, 1, alpha))

func configure(owner_world: Node2D, owner_player: Node2D, view: Control, state_node: Node,
		hud_node: Node = null) -> bool:
	if _configured or not is_instance_valid(owner_world) or not is_instance_valid(owner_player):
		return false
	world = owner_world
	player = owner_player
	curtain_view = view
	state = state_node
	hud = hud_node
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(FLESH_CONFIG_FILE))
	if not parsed is Dictionary or not parsed.get("runtime") is Dictionary:
		return false
	_template = parsed["runtime"]
	_barrier_texture = load(BARRIER_TEXTURE) if ResourceLoader.exists(BARRIER_TEXTURE, "Texture2D") else null
	process_mode = Node.PROCESS_MODE_PAUSABLE
	z_as_relative = false
	_barrier = _BarrierDrawer.new()
	_barrier.name = "BonfireBarrier"
	_barrier.seq = self
	_barrier.z_as_relative = false
	_barrier.z_index = 4003 # 55323 렌더 순서(월드 후반부, 스모그 직전) 근사 — 적/사망FX 위
	add_child(_barrier)
	_configured = true
	return true

var _state_g_receipts: Array = []

func _apply_state_g(step: String) -> void:
	# 원본 G 쓰기(63283/63413/63440)를 state owner API로 — 거부 영수증도 보존(스냅샷).
	if is_instance_valid(state) and state.has_method("apply_native_intro_curtain_g_writes"):
		_state_g_receipts.append({"step": step, "receipt": state.apply_native_intro_curtain_g_writes(self, step)})
	else:
		_state_g_receipts.append({"step": step, "receipt": {"applied": false, "reason": "state_owner_unavailable"}})

func _unit(purpose: String, draws: Array) -> float:
	_metrics.rng_calls += 1
	var value := float(world.sample_native_random_unit())
	draws.append({"purpose": purpose, "value": value})
	return value

## 63277~63293 _startIntro의 커튼 소유 구간. ens 전부 제거(63279)·spawnHoles 비우기(63280,
## 비tileRLE 전용 — 1-1 비해당)·OPT.diff=5 강제 저장(63358)은 설치 제거 API 부재/설정 owner
## 분리로 잔여 목록(스냅샷 unported).
func begin_native_intro() -> Dictionary:
	if not _configured or phase != "idle":
		return {"applied": false, "reason": "sequence_not_idle"}
	# 63279 ens.length=0 — 설치/동적 적 전부 제거(월드 owner API). stage0 신규 게임의
	# 초기 적 구성은 이 제거 후 커튼 오픈의 5링만으로 시작하는 것이 원본.
	if world.has_method("clear_native_enemies_for_intro"):
		_metrics["intro_enemies_cleared"] = int(world.clear_native_enemies_for_intro().get("cleared", 0))
	bonfire["t"] = 0.0 # 63282 if(G._bonfire)G._bonfire.t=0
	bonfire["active"] = false
	_intro_flag = true  # 63283 G._intro=true
	_on_flag = false    # 63283 G.on=false
	_apply_state_g("begin")
	player.set("iframes", 9999.0) # 63283 P.iframes=9999
	if is_instance_valid(curtain_view):
		curtain_view.show_closed() # 63289~63291 커튼 보이기+닫힌 상태
	if is_instance_valid(hud) and hud.has_method("set_native_intro_hud_visible"):
		hud.set_native_intro_hud_visible(false) # 63287 부트로딩 숨김 + HUD 미표시(63414 .on 전)
	phase = "guide"
	guide_step = 0
	_guide_ready_at_ms = Time.get_ticks_msec() + GUIDE_READY_MS
	_space_held_at_ms = -1 # 63377 state.cancelHold()
	_show_guide_panel()
	return {"applied": true}

## P2-007a — 63378~63381: 4컷 패널 표시(커튼과 같은 HUD 부모, 커튼 다음 자식 = z50 위).
func _show_guide_panel() -> void:
	if not is_instance_valid(guide_panel) and is_instance_valid(curtain_view) and curtain_view.get_parent() != null:
		var panel: Control = GUIDE_PANEL_SCRIPT.new()
		if panel.bind(curtain_view.get_parent(), world.get_parent() if is_instance_valid(world) else null):
			panel.advance_requested.connect(advance_native_guide)
			panel.skip_requested.connect(finish_native_guide)
			guide_panel = panel
		else:
			panel.free()
	if is_instance_valid(guide_panel):
		guide_panel.show_step(guide_step)

## 63351~63356 _advanceIntroGuide: 250ms 쓰로틀, 4컷 끝이면 finish.
func advance_native_guide() -> Dictionary:
	if phase != "guide" or Time.get_ticks_msec() < _guide_ready_at_ms:
		return {"applied": false, "reason": "guide_not_ready"}
	_guide_ready_at_ms = Time.get_ticks_msec() + GUIDE_READY_MS
	guide_step += 1
	if guide_step >= GUIDE_STEPS:
		return finish_native_guide()
	if is_instance_valid(guide_panel):
		guide_panel.show_step(guide_step) # 63355 _renderIntroGuide
	return {"applied": true, "step": guide_step}

## 63342~63348 _finishIntroGuide → 63411~63441 _openIntroCurtain.
func finish_native_guide() -> Dictionary:
	if phase != "guide":
		return {"applied": false, "reason": "guide_not_active"}
	phase = "opening"
	_space_held_at_ms = -1
	if is_instance_valid(guide_panel):
		guide_panel.hide_guide() # 63345 opacity 0·pointer-events none
	if is_instance_valid(hud) and hud.has_method("set_native_intro_hud_visible"):
		hud.set_native_intro_hud_visible(true) # 63414 hud/hudTop/... .on 표시
	_on_flag = true               # 63413 G.on=true
	_apply_state_g("open")        # state G.on 점등 — update clock g_on(32580)·stageTime 개방
	player.set("iframes", 600.0)  # 63413 P.iframes=600
	# 63417~63420: 1-1은 tileRLE → room/corridor 리스폰 생략(원문 게이트 그대로).
	# 63422~63423: 시작 500px 퍼지 — 현 설치본 최근접 888px라 상시 0건. 등록 소비자
	# 제거 API 부재로 실제 제거는 미지원(후보>0이면 스냅샷에 드러남 — 가짜 제거 금지).
	var purge_candidates := 0
	for enemy in world.get_enemies():
		if is_instance_valid(enemy) and enemy.get("alive") == true \
				and enemy.global_position.distance_to(player.global_position) < PURGE_RADIUS:
			purge_candidates += 1
	_metrics.purge_candidates += purge_candidates
	# 63425~63432: 5마리 오각 링 스폰.
	var spawned := 0
	for i in range(RING_COUNT):
		var angle := TAU * float(i) / float(RING_COUNT) - PI * 0.5
		var rx: float = player.global_position.x + cos(angle) * RING_RADIUS
		var ry: float = player.global_position.y + sin(angle) * RING_RADIUS
		if _spawn_ring_enemy(i, rx, ry):
			spawned += 1
	_metrics.spawned += spawned
	# 63433 bonfire 재설정.
	bonfire = {"active": true, "x": player.global_position.x, "y": player.global_position.y,
		"t": BONFIRE_TICKS, "r": BONFIRE_RADIUS}
	if is_instance_valid(curtain_view):
		curtain_view.open() # 63434~63435 0.8s cubic-bezier(.4,0,.2,1) — view가 소유(126~)
	_dispose_at_ms = Time.get_ticks_msec() + CURTAIN_DISPOSE_MS # 63436~63440
	return {"applied": true, "spawned": spawned, "purge_candidates": purge_candidates}

## mkEn(31120~) etype0/si0/ib=false/el=EL.P/room=-1 미러. monLv=P.lv+DIFF_LV_OFF[5](0)
## +stageDiffOff(0) — 인트로가 OPT.diff=5 강제(63358)라 dm=DIFF_MUL[5]=1.
func _spawn_ring_enemy(index: int, x: float, y: float) -> bool:
	var draws: Array = []
	# 31124: canMv(x,y,10) 실패 시 safePt, 그것도 실패면 null.
	var pos := Vector2(x, y)
	if not world.can_move(pos, 10.0):
		var safe: Variant = world.native_safe_point(x, y, 10.0)
		if not safe is Dictionary:
			return false # 31124 safePt 실패 → return null
		pos = Vector2(float(safe["x"]), float(safe["y"]))
		_metrics.safe_point_moves += 1
	var mon_lv := 1
	if is_instance_valid(state):
		var p: Variant = state.read_current_p()
		if p is Dictionary and (p.get("lv") is int or p.get("lv") is float):
			mon_lv = maxi(1, int(p["lv"]))
	# (1) rollElite(31063): roll<champ → 3, <champ+rare → 2, <champ+rare+magic → 1.
	var selection: Dictionary = EliteSelector.constructor_prefix(0,false,func(purpose):return _unit(purpose,draws))
	if selection.status != "READY":return false
	var elite: int = int(selection.elite)
	var mods: Array = selection.mods
	if elite>0:_metrics.magic_elites += 1
	# Source speed/radius and literal draws remain after the prefix.
	var spd := (ETYPE0_SPD + _unit("spd", draws) * 0.08) * 1.5
	var radius: float = (ETYPE0_R + _unit("r", draws) * 2.0) * 2.0 * float(ELITE_SCALE_MUL[elite])
	var st2 := 30.0 + _unit("st2", draws) * 50.0
	var facing := _unit("facing", draws) * TAU
	var proj_t := 180.0 + _unit("projT", draws) * 120.0
	var boss_pat_t := 30.0 + _unit("bossPatT", draws) * 20.0
	# P3-002 정정: 객체 리터럴의 무조건 소비 2회(31260 _bossOrbitAng·31300 _erraticAng) —
	# 원본 실측(Playwright) 비보스 etype0 = 9회(+매직 rollMods 1). AI 소비자 없음(기록만).
	var boss_orbit_ang := _unit("_bossOrbitAng", draws) * TAU
	var erratic_ang := _unit("_erraticAng", draws) * TAU
	# HP v14(31146~31148)·pacing(31119)·ATK(31153~31154): si=0 → ×(1+0*.02).
	var base_curve: float
	if mon_lv <= 500:
		base_curve = (0.4 * mon_lv * mon_lv * mon_lv + 199.0 * mon_lv + 100.0) * 2.925
	else:
		base_curve = 50000000.0 * pow(1.0014, mon_lv - 500) * 2.925
	var pacing := 1.0 / (1.0 + minf(9.0, maxf(0.0, float(mon_lv) - 1.0)) / 18.0)
	var hp := int(floor(floor(base_curve * pacing * float(ELITE_HP_MUL[elite]))))
	var atk := int(floor((50.0 + mon_lv * 1.95) * 0.6 * float(ELITE_ATK_MUL[elite])))
	var proj_cd := 240 if elite == 0 else int(240 * 0.8) # 31159~31160
	# _assignMobSkin(23788~): seed=(0*7+trunc(x*31))&0x7fffffff, idx=seed%40.
	var skin_seed := int(floor(pos.x * 31.0)) & 0x7fffffff
	var skin_idx := skin_seed % MOB8_TOTAL
	var data: Dictionary = _template.duplicate(true)
	var enemy_id := "ch1_curtain_ring_%02d" % (index + 1)
	data["id"] = enemy_id
	data["name"] = "눈알 육괴"
	data["order"] = _next_order
	_next_order += 1
	data["spawn_position"] = [pos.x, pos.y]
	data["requested_spawn_position"] = [x, y]
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
	data["factory_random_seed"] = (skin_seed * 31 + index + 1) & 0x7fffffff # Godot 내부 RNG 시드 심(원본 무해당 — 전역 스트림)
	var timers: Dictionary = data["initial_timers"]
	timers["st2"] = st2
	timers["projT"] = proj_t
	timers["projCd"] = proj_cd
	timers["bossPatT"] = boss_pat_t
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
	native["_bossOrbitAng"] = boss_orbit_ang
	native["_erraticAng"] = erratic_ang
	native["_mob8Col"] = skin_idx % MOB8_COLS
	native["_mob8Row"] = skin_idx / MOB8_COLS
	var enemy: CharacterBody2D = FLESH_SCRIPT.new()
	enemy.configure(data, world)
	var registered: Variant = world.register_native_curtain_ring_enemy(enemy, int(data["order"]))
	if not registered is Dictionary or registered.get("valid") != true:
		if is_instance_valid(enemy) and enemy.get_parent() == null:
			enemy.free()
		return false
	spawn_journal.append({"id": enemy_id, "ring_index": index, "elite": elite, "mods": mods.duplicate(), "hp": hp,
		"atk": atk, "radius": radius, "speed": spd, "st2": st2, "facing": facing,
		"projT": proj_t, "projCd": proj_cd, "bossPatT": boss_pat_t,
		"requested": [x, y], "position": [pos.x, pos.y], "draws": draws})
	return true

func _physics_process(delta: float) -> void:
	if not _configured:
		return
	var sp := delta * 60.0
	# 34413 bonfire t 감쇠 + 34424 비보스 push-out(경계로 밀어내기 — 피해/회복 없음).
	if bonfire["active"] and float(bonfire["t"]) > 0.0:
		bonfire["t"] = float(bonfire["t"]) - sp
		if float(bonfire["t"]) > 0.0 and is_instance_valid(world):
			var center := Vector2(bonfire["x"], bonfire["y"])
			for enemy in world.get_enemies():
				if not is_instance_valid(enemy) or enemy.get("alive") != true:
					continue
				# 31725 clearance: etype0=r (36/65/75 변형은 해당 적 미존재 — 잔여).
				var clearance: float = maxf(0.0, float(enemy.get("radius")))
				var min_d: float = float(bonfire["r"]) + clearance
				var offset: Vector2 = enemy.global_position - center
				if offset.length_squared() >= min_d * min_d:
					continue
				var angle: float = offset.angle() if offset.length_squared() > 0.0 else float(enemy.get("facing"))
				enemy.global_position = center + Vector2.from_angle(angle) * min_d
				_metrics.bonfire_pushes += 1
				# 31740~31741 kb 내향 성분 소거는 적 내부 _knockback 비공개 — 잔여(이 시나리오 kb=0).
	if phase == "opening" and _dispose_at_ms >= 0 and Time.get_ticks_msec() >= _dispose_at_ms:
		# 63436~63440: 커튼 요소 숨김 + G._intro=null.
		if is_instance_valid(curtain_view):
			curtain_view.hide_now()
		_intro_flag = false
		_apply_state_g("dispose")
		_dispose_at_ms = -1
		phase = "done"

func _process(_delta: float) -> void:
	if _configured and is_instance_valid(_barrier):
		_barrier.queue_redraw()
	# 63389~63392 poll: Space 홀드 진행(배경) → 2초면 건너뛰기.
	if phase == "guide" and _space_held_at_ms >= 0:
		var held: float = minf(1.0, float(Time.get_ticks_msec() - _space_held_at_ms) / GUIDE_SKIP_HOLD_MS)
		if is_instance_valid(guide_panel):
			guide_panel.set_skip_hold(held)
		if held >= 1.0:
			finish_native_guide()

func _notification(what: int) -> void:
	# 63374~63375 blur/visibilitychange → cancelHold
	if (what == NOTIFICATION_APPLICATION_FOCUS_OUT or what == NOTIFICATION_WM_WINDOW_FOCUS_OUT) and _space_held_at_ms >= 0:
		_cancel_guide_hold()

func _cancel_guide_hold() -> void:
	_space_held_at_ms = -1
	if is_instance_valid(guide_panel):
		guide_panel.set_skip_hold(-1.0) # 63376 background=''

func _input(event: InputEvent) -> void:
	# 63364~63374 state.key: window 캡처 단계 keydown/keyup + preventDefault·stopImmediatePropagation —
	# 가이드 중 모든 키를 게임보다 먼저 가로챈다(_input + set_input_as_handled; P2-007a: 이전
	# _unhandled_input은 Space를 플레이어 입력이 먼저 소비해 진행·홀드가 막혔음).
	# Space 홀드 시작 → Tab 포커스 전환 / Escape=스킵 / Enter·Space=포커스가 건너뛰기면 스킵, 아니면 진행.
	# 63377 keyUp(Space)=홀드 취소. 반복(echo)은 무시(63361 e.repeat).
	if phase != "guide" or not event is InputEventKey:
		return
	if not event.pressed:
		if event.keycode == KEY_SPACE: # 63377: keyup은 Space만 가로챔
			get_viewport().set_input_as_handled()
			_cancel_guide_hold()
		return
	get_viewport().set_input_as_handled() # 63360: keydown은 전부(반복 포함) 가로챔
	if event.is_echo():
		return
	if event.keycode == KEY_SPACE and _space_held_at_ms < 0:
		_space_held_at_ms = Time.get_ticks_msec()
	match event.keycode:
		KEY_TAB:
			if is_instance_valid(guide_panel):
				guide_panel.toggle_focus()
		KEY_ESCAPE:
			finish_native_guide()
		KEY_ENTER, KEY_KP_ENTER, KEY_SPACE:
			if is_instance_valid(guide_panel) and guide_panel.focus_target == "skip":
				finish_native_guide()
			else:
				advance_native_guide()

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "phase": phase, "guide_step": guide_step,
		"intro_flag": _intro_flag, "on_flag": _on_flag,
		"bonfire": bonfire.duplicate(true), "barrier_texture": _barrier_texture != null,
		"metrics": _metrics.duplicate(true), "spawn_journal": spawn_journal.duplicate(true),
		"state_g_receipts": _state_g_receipts.duplicate(true),
		"lesson_flow_installed": is_instance_valid(lesson_flow),
		"guide_panel": guide_panel.get_snapshot() if is_instance_valid(guide_panel) else {},
		"unported": [
			"63279 ens.length=0 (설치 제거 API 부재 — 퍼지도 후보 계수만)",
			"63358 OPT.diff=5 강제 저장(설정 owner 분리)",
			"63414 HUD .on 클래스 토글(HUD 담당 소유)",
			"키 가이드 게임패드 A/Start 폴링·패드 표기(63394~63399) — 패널·클릭·Tab·Space 홀드·voice_wakeup은 P2-007a 이식",
			"31740~31741 bonfire kb 내향 소거(적 내부 kb 비공개·현 시나리오 kb=0)",
			"31725 etype36/65/75 clearance 변형(해당 적 미존재)"]}
