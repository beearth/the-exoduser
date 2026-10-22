extends Node
## PC-BOSS-PARITY (2026-10-22, PC Claude) — 1-1 보스방 진입 흐름(원본 그대로).
## 계약: docs/engine/PC_BOSS_CORE_CONTRACT_20261022.md §9.4.
##
## 원본(고정 스냅샷 godot/source_snapshot/game.html) 대응
##   checkRooms 41768 (update 35635 매 틱 + hurtE 처치 43115 즉시 호출)
##     41784–41813 보스 아레나 로딩 상태 머신(매 호출): 1 페이드아웃 50 → _enterBossArena → 2 네임카드 130 →
##                 3 페이드인 50 → 4 입장 연출 100(첫 2틱: 보스 stunned90·reviveIframes110·shake28·flash·chroma·slowMo60·링 파티클·포효)
##     41816–41818 G._crT 30 호출마다 1회 무거운 로직
##     41893–41925 출구 타일 = 보스방 문: (stage0 && !_fbDone) 앵글러 문구 / (!_bossUnlocked) 봉인 문구+펫 / 아니면 loadPhase=1
##   _enterBossArena 30749–30839 중 PC 부분: 잔여 적 → _stageKills, ens=[], spawnHoles/rifts=[], hitStop/slowMo 0, P.iframes90·kb0,
##                 G._crT=0, 봉인 연출(파티클 32·shake 8·'⚠ 봉인됨!')
##   hurtP 43420 G._bossLoadPhase>0 이면 무적 — PC 피해 경로(보스 코어·앵글러 owner)가 이 값을 읽는다.
##   렌더 52089–52127 로딩 오버레이(검정 페이드 + 보라 안개 + 장식선 + 보스 이름 + 부제) — 같은 수치로 그린다.
##
## 소유: 게이트 문 판정 cadence·로딩 상태(G._bossLoadPhase/_bossLoadT/_bossLoadFade/_crT)·진입 PC 부수효과·오버레이.
## 비소유: 실제 아레나 전환·플레이어 이동·보스 스폰 = 기존 encounter(DEMO11-37)·MAP11 transport. 이 노드는 MAP11
##         provider 의 gate consumer 자리에서 encounter 를 감싸 enter 시점만 원본 순서로 늦춘다(encounter 수정 0).
## 미이식(기록): P.s='idle';P.st2=0 매 틱 강제(플레이어 상태 owner=player.gd), SFX.groggy/포효 재생, _addBlastLight,
##         G.pets 재배치, 투사체·월드 아이템·파티클 목록 비우기.

const OVERLAY = preload("res://scripts/native_demo11_boss_entry_overlay.gd")
const PHASE_FADE_OUT := 1
const PHASE_NAMECARD := 2
const PHASE_FADE_IN := 3
const PHASE_INTRO := 4

var main: Node
var encounter: Node
var provider: Node2D
var overlay: Node
var _swap_ready := false
var _leave_ready := false
var _enter_options: Dictionary = {}
var counters := {"check_rooms": 0, "heavy_ticks": 0, "gate_locked_fb": 0, "gate_locked_regions": 0,
	"load_started": 0, "arena_swaps": 0, "intro_hits": 0, "kill_checks": 0, "rng_draws": 0, "leave_ready": 0}
var last_receipt: Dictionary = {}

static func install_native_boot(owner_main: Node) -> Node:
	if not is_instance_valid(owner_main) or not is_instance_valid(owner_main.get("native_demo_encounter")):
		return null
	var existing: Node = owner_main.get_node_or_null("Demo11BossEntry")
	if existing != null:
		return existing
	var entry: Node = (load("res://scripts/native_demo11_boss_entry.gd") as GDScript).new()
	entry.name = "Demo11BossEntry"
	owner_main.add_child(entry)
	entry.configure(owner_main)
	return entry

func configure(owner_main: Node) -> void:
	main = owner_main
	encounter = main.native_demo_encounter
	process_physics_priority = 1 # MAP11 transport(2) 보다 먼저: 같은 틱에 로딩 진행 → transport 가 enter 를 요청
	overlay = OVERLAY.new()
	overlay.configure(main)
	add_child(overlay)
	if main.has_method("subscribe_native_final_enemy_death"):
		main.subscribe_native_final_enemy_death(Callable(self, "_on_final_death"), {"subscriber": self, "events": ["final_death"]})

func _live() -> bool:
	return is_instance_valid(main) and is_instance_valid(encounter) and is_inside_tree() and is_instance_valid(main.get("player"))

func _g() -> Dictionary:
	var g: Variant = main.source_state.read_current_g()
	return g if g is Dictionary else {}

func _g_write(fields: Dictionary) -> void:
	main.source_state.apply_native_boss_entry_g_writes(self, fields)

static func _n(v: Variant, fallback: float = 0.0) -> float:
	return float(v) if (v is int or v is float) and is_finite(float(v)) else fallback

# ═════════════ MAP11 gate consumer (provider.bind_gate_consumer: bind_provider / enter / leave) ═════════════
func bind_provider(p: Node2D) -> bool:
	if not _live() or not encounter.bind_provider(p):
		return false
	provider = p
	return true

## transport 가 문 접촉 중 매 틱 호출. 원본은 문 판정이 30호출마다(41818)이고 실제 전환은 로딩 1단계가 끝난
## 그 틱(41789 _enterBossArena)이다. 그 틱에만 encounter.enter 로 넘긴다.
func enter(p: Node, spawn_options: Dictionary) -> Dictionary:
	if not _swap_ready:
		_enter_options = spawn_options.duplicate(true)
		return {"status": "NOT_READY", "reason": "source_boss_load_phase_%d" % int(_n(_g().get("_bossLoadPhase")))}
	_swap_ready = false
	return _enter_arena(p, spawn_options)

func leave(p: Node) -> bool:
	# 41893 출구 판정도 30호출 cadence. 원본: 아레나 출구 타일 + !bossAlive → stageCleared.
	if not _leave_ready:
		return false
	_leave_ready = false
	return encounter.leave(p)

# ═════════════ checkRooms ═════════════
func _physics_process(delta: float) -> void:
	if not _live() or get_tree().paused:
		return
	var g: Dictionary = _g()
	if g.get("on") != true or _lesson_active():
		return
	_check_rooms(g, minf(delta * 60.0, 3.0))

## 43115 hurtE 처치 즉시 checkRooms() — PCI-11 final_death(일반 적·보스 공통) 수신 시 같은 함수를 1회 더 부른다.
func _on_final_death(_payload: Dictionary) -> void:
	if not _live():
		return
	var g: Dictionary = _g()
	if g.get("on") != true:
		return
	counters.kill_checks += 1
	_check_rooms(g, 1.0)

func _check_rooms(g: Dictionary, sp: float) -> void:
	counters.check_rooms += 1
	var phase: int = int(_n(g.get("_bossLoadPhase")))
	if phase > 0:
		_advance_load(g, phase, sp)
	var crt: float = _n(g.get("_crT")) + 1.0
	if crt < 30.0:
		_g_write({"_crT": crt})
		return
	_g_write({"_crT": 0.0})
	counters.heavy_ticks += 1
	# 41820–41866 보스 처치 poll·41868–41891 지옥문 개방은 각각 encounter(PCI-11 구독)·NativeRegions 가 맡는다.
	_exit_check(g)

## 41784–41813
func _advance_load(g: Dictionary, phase: int, sp: float) -> void:
	var t: float = _n(g.get("_bossLoadT")) + sp
	var fields := {"_bossGateNear": false, "_bossLoadT": t}
	match phase:
		PHASE_FADE_OUT:
			var fade: float = minf(1.0, t / 50.0)
			fields["_bossLoadFade"] = fade
			if fade >= 1.0:
				fields["_bossLoadPhase"] = PHASE_NAMECARD
				fields["_bossLoadT"] = 0.0
				_g_write(fields)
				_request_arena_swap()
				return
		PHASE_NAMECARD:
			fields["_bossLoadFade"] = 1.0
			if t >= 130.0:
				fields["_bossLoadPhase"] = PHASE_FADE_IN
				fields["_bossLoadT"] = 0.0
		PHASE_FADE_IN:
			var fade_in: float = maxf(0.0, 1.0 - t / 50.0)
			fields["_bossLoadFade"] = fade_in
			if fade_in <= 0.0:
				fields["_bossLoadPhase"] = PHASE_INTRO
				fields["_bossLoadT"] = 0.0
				fields["_bossLoadFade"] = 0.0
		PHASE_INTRO:
			if t < 2.0:
				_intro_burst()
			if t >= 100.0:
				fields["_bossLoadPhase"] = 0
				fields["_bossLoadT"] = 0.0
				fields["_bossLoadFade"] = 0.0
	_g_write(fields)

## 41789 → 30749 _enterBossArena: 실제 전환은 MAP11 transport 경로(문 접촉 확인·공간 활성·encounter 쓰기)를 그대로 탄다.
## 원본은 1단계(50틱) 동안 이동을 막지 않으므로 플레이어가 문에서 벗어났을 수 있다. 원본 _enterBossArena 는 위치와
## 무관하게 아레나 입구로 옮기므로, transport 의 문 접촉 전제를 위해 문 위치로 먼저 둔다(곧바로 입구로 덮어씀).
func _request_arena_swap() -> void:
	var product: Variant = main.get("native_map11")
	if not is_instance_valid(product) or not is_instance_valid(provider):
		last_receipt = {"status": "NOT_READY", "reason": "map11_transport_missing"}
		return
	var sites: Dictionary = provider.transition_sites()
	if sites.get("status") != "OK":
		last_receipt = {"status": "NOT_READY", "reason": "transition_sites"}
		return
	if not provider.gate_contact(main.player.global_position, "enter"):
		main.player.global_position = (sites.field_gate as Marker2D).global_position
	_swap_ready = true
	last_receipt = product.request_transition("enter")
	_swap_ready = false

func _enter_arena(p: Node, spawn_options: Dictionary) -> Dictionary:
	var g: Dictionary = _g()
	# 30758–30759 던전 잔여 몹(살아있는 비보스)을 처치율에 반영 → 30760 ens=[]
	var survivors := 0
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e.get("alive") != false and int(_n(e.get("hp"), 1.0)) > 0 and e.get("ib") != true:
			survivors += 1
	_g_write({"_stageKills": _n(g.get("_stageKills")) + survivors}) # G._stageKills=(G._stageKills||0)+_survCnt
	main.world.clear_native_enemies_for_intro()
	# 30785 G.spawnHoles=[];G.rifts=[] — 소환굴 시스템이 G 와 같은 배열을 들고 있으므로 제자리에서 비운다(발동 중인 굴의 지연 소환 차단).
	for key in ["spawnHoles", "rifts"]:
		if g.get(key) is Array: (g[key] as Array).clear()
	var receipt: Dictionary = encounter.enter(p, spawn_options if not spawn_options.is_empty() else _enter_options)
	if receipt.get("status") != "READY":
		return receipt
	counters.arena_swaps += 1
	var pl: Node2D = main.player
	# 30781 P.s='idle';P.iframes=90;P._hurtCd=0;P.kb={x:0,y:0}
	pl.iframes = 90.0
	if pl.has_method("get_native_knockback") and pl.has_method("apply_native_posthurt_knockback"):
		pl.apply_native_posthurt_knockback(-pl.get_native_knockback())
	# 30761 G.hitStop=0;G.slowMo=0 · 30796 G._crT=0
	_g_write({"hitStop": 0.0, "slowMo": 0.0, "_crT": 0.0})
	_seal_presentation()
	return receipt

## 30797 G.pets.cat.t=~~(Math.random()*100) 1회 → 30802–30808 봉인 파티클 16+16 → 30809 shake → 30810 포효 _r 1회
func _seal_presentation() -> void:
	var pl: Node2D = main.player
	_rng() # 30797 G.pets…cat.t (펫 재배치 미이식, RNG 위치만 원본 순서)
	var col := Color(80.0 / 255.0, 180.0 / 255.0, 40.0 / 255.0, 0.8) # _BOSS_ATHEME[0].rc+'.8)'
	var px: float = pl.global_position.x
	var py: float = pl.global_position.y
	for k in range(16):
		var a: float = float(k) / 16.0 * PI * 2.0
		var v: float = 4.0 + _rng() * 4.0
		var sz: float = 2.0 + _rng() * 2.0
		var life: float = 20.0 + _rng() * 10.0
		_part(px + cos(a) * 60.0, py + sin(a) * 60.0, -cos(a) * v, -sin(a) * v, col, sz, life)
	for k in range(16):
		var a: float = _rng() * PI * 2.0
		var v: float = 2.0 + _rng() * 3.0
		var sz: float = 1.5 + _rng() * 2.0
		var life: float = 15.0 + _rng() * 10.0
		_part(px + cos(a) * 10.0, py + sin(a) * 10.0, cos(a) * v, sin(a) * v, col, sz, life)
	_g_write({"shake": 8.0 * _opt_shake() / 100.0})
	_rng() # 30810 playSample(_bsf.howl,.6,_r(_bsf.howlP,.15)) — 재생 미이식, 피치 RNG 는 호출 위치 소비
	_text(px, py - 50.0, "⚠ " + _tr("봉인됨!"), "rgba(80,180,40,.8)", 70)

## 41797–41809 입장 연출(첫 2틱)
func _intro_burst() -> void:
	var core: Variant = main.get("native_demo_boss_core")
	if not is_instance_valid(core) or not core.has_method("apply_entry_intro"):
		return
	var b: Dictionary = core.apply_entry_intro() # findBoss(): 살아있는 보스면 stunned=90·reviveIframes=110
	if b.is_empty():
		return
	counters.intro_hits += 1
	var g: Dictionary = _g()
	var shake_now: float = _n(g.get("shake"))
	_g_write({"shake": maxf(shake_now, 28.0 * _opt_shake() / 100.0), "_flashT": 10.0, "_flashCol": "#ff4400", "_chromaT": 12.0,
		"slowMo": maxf(_n(g.get("slowMo")), 60.0)})
	var col_s: String = str(b.get("col", "#ff4400"))
	var col: Color = Color(col_s) if Color.html_is_valid(col_s) else Color("#ff4400")
	var br: float = _n(b.get("r"), 44.0) * 2.5
	for i in range(32):
		var ba: float = PI * 2.0 * float(i) / 32.0
		var sz: float = 4.0 + _rng() * 3.0
		var life: float = 30.0 + _rng() * 20.0
		_part(_n(b.x) + cos(ba) * br, _n(b.y) + sin(ba) * br, cos(ba) * 6.0, sin(ba) * 6.0, col, sz, life)
	_rng() # 41808 playSample(howl,1.0,_r(howlP,.1)) — 피치 RNG

## 41893–41925 (30호출 중 1회)
func _exit_check(g: Dictionary) -> void:
	if g.get("stageCleared") == true or _n(g.get("_bossLoadPhase")) > 0 or not is_instance_valid(provider):
		return
	var pos: Vector2 = main.player.global_position
	if g.get("bossAlive") == true and g.get("_bossArena") != true:
		if not provider.gate_contact(pos, "enter"):
			return
		var frame: int = _game_frame()
		if int(_n(g.get("stage"))) == 0 and g.get("_fbDone") != true:
			counters.gate_locked_fb += 1
			if frame % 45 == 0:
				_text(pos.x, pos.y - 40.0, _lang("심연의 앵글러를 모두 처치하라", "Slay every Abyssal Angler"), "#66ddff", 40)
			return
		if g.get("_bossUnlocked") != true:
			counters.gate_locked_regions += 1
			if frame % 45 == 0:
				var n: int = _regions_cleared(g)
				_text(pos.x, pos.y - 40.0, _lang("지옥문이 봉인됨 — 지역 클리어 ", "Gate sealed — regions cleared ") + str(n) + "/4", "#ff5544", 40)
				var pets: Variant = main.world.get_node_or_null("NativePets")
				if is_instance_valid(pets) and pets.has_method("_offer_dialogue"):
					pets._offer_dialogue("tut_gate_locked") # 41910 _petSayCD('tut_gate_locked',…)
			return
		counters.load_started += 1
		_g_write({"_bossLoadPhase": PHASE_FADE_OUT, "_bossLoadT": 0.0, "_bossLoadFade": 0.0})
		# 41914 SFX.groggy()(미이식) → 41915–41916 보라 파티클 20(각 4 RNG)
		for k in range(20):
			var a: float = _rng() * PI * 2.0
			var v: float = 3.0 + _rng() * 5.0
			var sz: float = 2.0 + _rng() * 3.0
			var life: float = 15.0 + _rng() * 10.0
			_part(pos.x + cos(a) * 20.0, pos.y + sin(a) * 20.0, -cos(a) * v, -sin(a) * v, Color("#8833cc"), sz, life)
		return
	if g.get("bossAlive") != true and g.get("_bossArena") == true and provider.gate_contact(pos, "leave"):
		# 41926~ 아레나 출구 → 스테이지 클리어(encounter.leave). transport 의 leave 요청을 이 틱에만 통과시킨다.
		counters.leave_ready += 1
		_leave_ready = true
		var product: Variant = main.get("native_map11")
		if is_instance_valid(product):
			last_receipt = product.request_transition("leave")
		_leave_ready = false

# ═════════════ 보조 ═════════════
func _rng() -> float:
	counters.rng_draws += 1
	return main.world.sample_native_random_unit()

func _part(x: float, y: float, vx: float, vy: float, col: Color, sz: float, life: float) -> void:
	main.world.emit_native_source_particle({"position": Vector2(x, y), "velocity": Vector2(vx, vy), "color": col,
		"size": maxf(0.01, sz), "life_ticks": maxf(0.01, life), "render_owner": "pc_boss_entry"})

func _text(x: float, y: float, text: String, col: String, life: int) -> void:
	if main.world.has_method("emit_native_text"):
		main.world.emit_native_text(x, y, text, col, life)

func _tr(text: String) -> String:
	if main.has_method("translate_native_boot_label"):
		var t: Variant = main.translate_native_boot_label(text)
		if t is String: return t
	return text

func _lang(ko: String, en: String) -> String:
	var snap: Dictionary = main.get_native_startup_language_snapshot() if main.has_method("get_native_startup_language_snapshot") else {}
	return ko if str(snap.get("language", "ko")) == "ko" else en

func _opt_shake() -> float:
	var opt: Variant = main.source_initialization_services.read_current_options() if is_instance_valid(main.get("source_initialization_services")) else null
	return _n(opt.get("shake"), 100.0) if opt is Dictionary else 100.0

func _game_frame() -> int:
	var holes: Variant = main.world.get_node_or_null("NativeSpawnHoleSystem")
	return int(holes.get("_game_frame")) if is_instance_valid(holes) else int(main.world.get_native_frame())

func _regions_cleared(g: Dictionary) -> int:
	var n := 0
	if g.get("_regions") is Array:
		for r in g._regions:
			if r is Dictionary and r.get("cleared") == true: n += 1
	return n

func _lesson_active() -> bool:
	var lesson: Dictionary = main.read_native_normal_enemy_lesson_status() if main.has_method("read_native_normal_enemy_lesson_status") else {}
	return lesson.get("ready") == true and lesson.get("active") == true

func snapshot() -> Dictionary:
	var g: Dictionary = _g() if _live() else {}
	return {"live": _live(), "provider_bound": is_instance_valid(provider), "phase": int(_n(g.get("_bossLoadPhase"))),
		"t": _n(g.get("_bossLoadT")), "fade": _n(g.get("_bossLoadFade")), "crT": _n(g.get("_crT")),
		"counters": counters.duplicate(), "last_receipt": last_receipt.duplicate(true)}
