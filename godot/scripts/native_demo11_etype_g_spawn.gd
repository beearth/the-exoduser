extends Node2D
## PC-ENEMY-ACTORS (2026-10-23) — G 계열 자연 공급 owner(소환굴 선택 etype 인계 + 소환 자식 + 탄 전조 + 덫/거미줄).
## 원본: 35660–35677 소환굴 mkEn(…,rollEtype(0),false,undefined,h.room)+reviveIframes15 / 40779–40798 eSummon /
##   39033–39046 모체 소환 / 20063–20085 _emitEnemyShot·_tickEnemyShotWarnings(전조 60) / 34692–34708 덫 /
##   35085–35089 거미줄·덫 일반 접촉 / 54108–54140 덫·거미줄 렌더 / 20008 teleportE 연출 풀(8716–8770) / 56921–56972 렌더.
## 소환굴 주기·예산·활성화는 소유하지 않는다(native_spawn_hole_system/natural base). 피해는 기존 PC 경로만 쓴다:
##   플레이어 피해 = player.receive_damage, 패링 = Main Q 패링 원천(PC-M29 와 같은 writer), 적 포이즈 = 기존 hurtE owner 코어.
const HOLES = preload("res://scripts/native_spawn_hole_system.gd")
const K = preload("res://scripts/native_demo11_etype_g_kernel.gd")
const PREFIX = preload("res://scripts/native_demo11_boss_prefix.gd")
const RECIPE = preload("res://scripts/type3_spawn_recipe.gd")
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const DECOR = preload("res://scripts/native_demo11_etype_g_decor.gd")
const TYPES := [3, 7, 13, 14, 16, 17, 20, 21, 47, 29]
const TP_OUT = preload("res://assets/vfx/teleport_out.png")
const TP_IN = preload("res://assets/vfx/teleport_in.png")
const TP_IMPACT = preload("res://assets/vfx/tp_impact.png")
const TP_BURST = preload("res://assets/vfx/teleport_burst.png") # 19632 registerVFX(…,64,64,9,9)
const MOUTH = preload("res://assets/enemy/proj_phys_mouth.png") # _PHYS_MOUTH 768×384, 8/6/6
const WARD_PATH := "res://assets/vfx/mine_trap_ward_sheet.png" # 8713 좌 지뢰 / 우 덫

var main: Node
var actors: Array = [] # WeakRef
var warnings: Array = [] # G._shotWarnings 중 이 계열 owner 몫
var hazards: Array = [] # 덫·거미줄 raw(원본 projs 필드)
var smokes: Array = []
var impacts: Array = []
var bolts: Array = []
var bursts: Array = []
var counts: Dictionary = {"spawned": 0, "children": 0, "children_elite_hold": 0, "children_null": 0, "shots_queued": 0, "shots_released": 0, "shots_cancelled": 0,
	"projs": 0, "proj_rejected": 0, "hazards": 0, "web_hits": 0, "trap_hits": 0, "trap_capped": 0, "parries": 0, "parry_rejected": 0, "detached_mken": 0}
var unported: Dictionary = {}
var last_reject: String = ""
var _used: Dictionary = {}
var _template: Dictionary = {}
var _warning_frame := -1.0
var _msfx_frame := -1.0
var _msfx := 0
var _authorized_actor: Node
var _authorized_props: Dictionary = {}
var _ward: Texture2D
var _game_frame := 0
var _next_child := 0

static func install(owner: Node) -> Node:
	var service = new()
	service.main = owner
	service.name = "Demo11EtypeG"
	owner.world.add_child(service)
	service._template = owner.world.get_node("NativeSpawnHoleSystem")._template
	service.process_physics_priority = 1 # World owner phase 뒤(E 와 같은 단계) — 원본 34661 전조 틱
	service.z_as_relative = false
	service.z_index = 3000
	if ResourceLoader.exists(WARD_PATH): service._ward = load(WARD_PATH)
	return service

func current() -> bool:
	if not is_instance_valid(main) or get_parent() != main.world or get_tree().paused: return false
	var a: Variant = main.native_stage_spawn_adapter
	if a == null or not a.is_current(): return false
	var g: Dictionary = main.source_state.read_current_g()
	return g.get("on", false) and g.get("stage") == 0 and not g.get("_bossArena", false)

func read_projectile_context() -> Dictionary:
	return {"lesson_active": false, "qa_storage_active": false, "aggro_active": false}

func _no(reason: String) -> Dictionary:
	last_reject = reason
	return {"ready": false, "registered": false, "reason": reason}

static func _number(v: Variant) -> bool: return (v is int or v is float) and is_finite(float(v))

# ═══ 소환굴 선택 etype 인계(35674 mkEn 인자 평가 뒤) ═══
func spawn_selected(owner: Node, group: String, source: Dictionary) -> Dictionary:
	if not current() or owner != main.world.get_node("NativeSpawnHoleSystem"): return _no("actual_source_MAP11_owner_required")
	var etype: Variant = source.get("etype")
	if not etype is int or etype not in TYPES: return _no("outside_G")
	if source.get("elite") != 0 or source.get("mods") != []: return _no("elite_modifier_owner_required") # 매직(3%) M29/M30 은 이 계열 HOLD
	for key in ["el", "element", "element_id"]:
		if source.has(key): return _no("natural_undefined_element_only") # 35674 el=undefined
	for key in ["speed_u", "radius_u"]:
		var v: Variant = source.get(key)
		if not _number(v) or v < 0 or v >= 1: return _no("source_uniform_required:" + key)
	if not source.get("spawn_n") is int or source.spawn_n < 1 or not source.get("literal") is Dictionary: return _no("source_literal_and_index_required")
	for draw in HOLES.MKEN_LITERAL_DRAWS:
		if draw[1].is_empty() or draw[1].has(etype):
			var lv: Variant = source.literal.get(draw[0])
			if not _number(lv) or lv < draw[2] or lv >= draw[2] + draw[3]: return _no("source_literal_required:" + str(draw[0]))
	var options: Variant = main.source_initialization_services.read_current_options()
	var g: Dictionary = main.source_state.read_current_g()
	if not options is Dictionary or not _number(options.get("diff")): return _no("current_difficulty_unavailable")
	var hole: Dictionary = {}
	for h in owner.holes:
		if h.get("spawn_group_id") == group: hole = h; break
	if hole.is_empty() or source.spawn_n > HOLES.spawn_hole_count(hole.size, 0): return _no("actual_source_group_required")
	var token := group + "/" + str(source.spawn_n)
	if _used.has(token): return _no("source_prefix_already_consumed")
	var radius: float = (float(K.RADIUS[etype]) + float(source.radius_u) * 2.0) * 2.0
	var site: Dictionary = main.native_stage_spawn_adapter.request_spawn(group, {"etype": etype, "radius": radius})
	if not site.get("ready", false): return site
	if not main.world.can_move(site.position, radius): return _no("MAP11_site_geometry_rejected")
	if not is_instance_valid(main.native_natural_enemies):
		var bound: Dictionary = main.bind_native_natural_enemy_base(read_projectile_context, false)
		if not bound.get("ready", false): return bound
	var p: Dictionary = main.source_state.read_current_p()
	var rec: Dictionary = K.assemble(site.position.x, site.position.y, etype, null, int(hole.room), float(p.get("lv", 1)), int(options.diff), float(g.get("_stageDiffOff", 0)),
		0, [], float(source.speed_u), float(source.radius_u), source.literal)
	rec.reviveIframes = 15 # 35677 ne.reviveIframes=15
	var runtime := _build_runtime(rec, "demo11_G_%d_%s" % [etype, token.replace("/", "_")], int(hole.room))
	_used[token] = true
	var result: Dictionary = main.native_natural_enemies.spawn_profile_record(self, group, runtime, site)
	if result.get("registered", false):
		actors.append(weakref(result.actor))
		counts.spawned += 1
	return result

## record(원본 _e) → 기존 actor 가 읽는 runtime(템플릿 = P3 etype0 profile, 스킨/반경/수치는 record 값).
func _build_runtime(rec: Dictionary, id: String, room: int) -> Dictionary:
	var r: Dictionary = _template.duplicate(true)
	var etype: int = int(rec.etype)
	var skin: int = int(rec._mob8Row) * 8 + int(rec._mob8Col)
	var a: Dictionary = r.animation
	a.skin = RECIPE.SKINS[skin]; a.column = skin % 8; a.row = int(skin / 8)
	a.base_rect = [skin % 8 * 256, int(skin / 8) * 256, 256, 256]
	a.walk_frame_rects = []
	for f in range(4): a.walk_frame_rects.append([(skin % 8 * 4 + f) * 256, int(skin / 8) * 256, 256, 256])
	var el: Variant = rec.get("el")
	r.merge({"id": id, "ai_profile": "demo11_group_g_v1", "order": -1, "etype": etype,
		"element": K.SOURCE_ELEMENT_NAMES[int(el)] if el != null else "", "element_id": int(el) if el != null else -1,
		"spawn_position": [rec.x, rec.y], "requested_spawn_position": [rec.x, rec.y], "room": room, "level": rec.lv,
		"hp": rec.hp, "attack": rec.atk, "radius": rec.r, "speed_pixels_per_tick": rec.speed, "elite": rec.elite, "mods": rec.mods.duplicate(), "aura": rec.aura,
		"poise": rec.poise, "max_poise": rec.maxPoise, "eShield": rec.eShield, "eShieldMax": rec.eShieldMax, "eRes": rec.eRes.duplicate(),
		"initial_idle_ticks": rec.st2, "facing": rec.facing, "initial_facing": rec.facing, "initial_projectile_ticks": rec.projT,
		"projectile_cooldown_ticks": rec.projCd, "projectile_range": float(K.RANGE[etype]), "initial_spawn_fade_ticks": 20,
		"native_flags": {"ib": false, "elite": rec.elite, "mods": rec.mods.duplicate(), "aura": rec.aura}}, true)
	r.initial_timers.merge({"st2": rec.st2, "projT": rec.projT, "projCd": rec.projCd, "bossPatT": rec.bossPatT, "chargeT": 0, "poiseR": 0}, true)
	var n: Dictionary = r.native_final
	n.clear()
	n.merge(rec, true)
	n.mhp = rec.mhp
	n._maxStunned = null
	n.erase("_maxStunned")
	return r

# ═══ 소환 자식(40779–40798 eSummon 3 / 39041 모체 13) — 부모 Marker origin, 원본 mkEn 난수 순서 ═══
func spawn_child(parent: Node, etype: int, x: float, y: float, el: Variant, room: Variant, opts: Dictionary) -> Variant:
	var g: Dictionary = main.source_state.read_current_g()
	var options: Variant = main.source_initialization_services.read_current_options()
	var p: Dictionary = main.source_state.read_current_p()
	var rec: Variant = K.mk_en(x, y, etype, el, room, float(p.get("lv", 1)), int(options.diff) if options is Dictionary else 5, float(g.get("_stageDiffOff", 0)), parent)
	if rec == null:
		counts.children_null += 1
		return null
	if rec.has("__error"): return {"__fault": str(rec.__error)}
	if opts.get("hp_half_shield_zero", false):
		rec.hp = PREFIX._i32(float(rec.hp) * 0.5) # 40793 ne.hp=~~(ne.hp*.5);ne.mhp=ne.hp;ne.eShield=0;ne.eShieldMax=0
		rec.mhp = rec.hp
		rec.eShield = 0
		rec.eShieldMax = 0
	if int(rec.elite) > 0:
		counts.children_elite_hold += 1
		note_unported("child_elite_modifier_HOLD")
		return rec # 원본은 매직 자식을 ens 에 넣는다. 모디파이어 owner 미이식 — 등록하지 않고 기록만(RNG 는 소비됨).
	var site: Dictionary = main.native_stage_spawn_adapter.request_split_child(parent, Vector2(float(rec.x), float(rec.y)))
	if not site.get("ready", false):
		note_unported("child_site:" + str(site.get("reason")))
		return rec
	rec.x = site.position.x
	rec.y = site.position.y
	_next_child += 1
	var runtime := _build_runtime(rec, "demo11_G_child_%d_%d" % [etype, _next_child], int(room) if room is int else -1)
	var result: Dictionary = main.native_natural_enemies.spawn_profile_record(self, site.spawn_group_id, runtime, site)
	if result.get("registered", false):
		actors.append(weakref(result.actor))
		counts.children += 1
		return result.actor.data.native_final
	note_unported("child_admission:" + str(result.get("reason")))
	return rec

func mk_en_detached(parent: Node, x: float, y: float, etype: int, el: Variant, room: Variant) -> Variant:
	var g: Dictionary = main.source_state.read_current_g()
	var options: Variant = main.source_initialization_services.read_current_options()
	var p: Dictionary = main.source_state.read_current_p()
	counts.detached_mken += 1
	return K.mk_en(x, y, etype, el, room, float(p.get("lv", 1)), int(options.diff) if options is Dictionary else 5, float(g.get("_stageDiffOff", 0)), parent)

# ═══ 탄: _emitEnemyShot 전조(20063) / spawnProj(덫·일반) ═══
func queue_shot(actor: Node, props: Dictionary) -> void:
	var pc: String = K.source_parry_class(props)
	var bb: bool = PREFIX._t(props.get("blackBean"))
	var w: Dictionary = {}
	var lane := 0
	for cand in warnings:
		if cand.actor.get_ref() == actor:
			lane += 1
			if cand.frame == _world_frame() and cand.el == props.get("el") and cand.blackBean == bb and cand.parryClass == pc: w = cand
	if w.is_empty():
		var rec: Dictionary = actor.data.native_final
		w = {"actor": weakref(actor), "frame": _world_frame(), "t": 60.0, "dead": not actor.alive or actor.data.native_final.get("alive") == false, "x": float(rec.x), "y": float(rec.y),
			"r": (float(rec.r) if PREFIX._t(rec.get("r")) else 12.0) + lane * 8, "el": props.get("el"), "blackBean": bb, "parryClass": pc,
			"col": "#f4f4f4" if pc == "physical" else str(props.get("col", "#ff6644")), "shots": []}
		warnings.append(w)
	w.shots.append(props.duplicate(true))
	counts.shots_queued += 1

func spawn_proj(actor: Node, props: Dictionary) -> void:
	if props.get("trap", false) or props.get("web", false):
		_add_hazard(actor, props)
		return
	_emit_registry(actor, props)

func _emit_registry(actor: Node, props: Dictionary) -> void:
	var out: Dictionary = props.duplicate(true)
	out.parryClass = K.source_parry_class(props) # JS undefined el → 물리(16924); 제품 정수 el -1 은 그대로 둔다
	if out.get("el") == null: out.el = -1
	var keep: Dictionary = {}
	for k in out:
		if out[k] != null: keep[k] = out[k]
	_authorized_actor = actor
	_authorized_props = keep
	var receipt: Dictionary = main.native_natural_enemies.emit_projectile(actor, keep)
	_authorized_actor = null
	_authorized_props = {}
	if receipt.get("ready", false): counts.projs += 1
	else:
		counts.proj_rejected += 1
		note_unported("projectile:" + str(receipt.get("reason")))

# ═══ 42819–42827 빙마(29) 사망: 8방향 _spawnBossProjectile(전조 60, 사망 위치 고정) + 최종빙결 ═══
## PCI-09 동기 consumer(hurtE 사망 prefix 안). c.rand = hurtE 공유 난수(원문 _iR7 8회).
func death_shots(c: Dictionary) -> Dictionary:
	var actor: Node = c.actor
	var rec: Dictionary = actor.data.native_final
	rec.alive = false
	rec.x = actor.global_position.x
	rec.y = actor.global_position.y
	var queued := 0
	for ip in 8:
		var ia: float = PI * 2 * ip / 8
		var u: Variant = c.rand.call()
		if not (u is float or u is int): return {"applied": false, "reason": "prefix_rng_not_ready", "queued": queued}
		var black: bool = float(u) < 0.5
		var red: bool = float(u) >= 0.5
		var props: Dictionary = {"x": rec.x, "y": rec.y, "vx": cos(ia) * (4.4 if black else 2.5), "vy": sin(ia) * (4.4 if black else 2.5),
			"dmg": PREFIX._i32(float(actor.attack) * (1.5 if black else 1.2 if red else 0.8)), "el": K.EL_P if black else K.EL_I, "friendly": false,
			"life": 400 if black else 200, "ml": 400 if black else 200, "col": "#00aa00" if black else "#cc1100" if red else "#4455aa", "sz": 2.0 if black else 1.5 if red else 1.2}
		if red: props.redBean = true; props.homing = true
		if black: props.blackBean = true
		K.boss_projectile(rec, props, actor)
		queued += 1
	var pl: Node2D = main.player
	if actor.global_position.distance_to(pl.global_position) < 100 and float(pl.iframes) <= 0:
		pl.apply_native_freeze_slow(150)
		main.world.emit_native_text(pl.global_position.x, pl.global_position.y - 25, tr_text("❄최종빙결!"), "#4455aa", 50)
	shake(10)
	note_unported("hitStop_42825")
	main.world.emit_native_text(rec.x, float(rec.y) - 25, tr_text("빙마 처치!"), "#88ccff", 60)
	main.world.emit_native_parts(actor.global_position, "#4455aa", 20)
	return {"applied": true, "queued": queued, "route": "G_dead_shot_warning"}

func allows_projectile(actor: Node) -> bool: return current() and actor == _authorized_actor
func authorizes_props(actor: Node, props: Dictionary) -> bool: return allows_projectile(actor) and props == _authorized_props

func trap_cap(cap: int) -> void:
	# 39025 projs 중 trap 개수>50 이면 life 가 가장 작은 덫 1개 제거(swap-pop)
	var tc := 0
	var oldi := -1
	var old_l := INF
	for i in hazards.size():
		if hazards[i].get("trap", false):
			tc += 1
			if float(hazards[i].life) < old_l: old_l = float(hazards[i].life); oldi = i
	if tc > cap and oldi >= 0:
		hazards[oldi] = hazards[hazards.size() - 1]
		hazards.pop_back()
		counts.trap_capped += 1

func _add_hazard(actor: Node, props: Dictionary) -> void:
	# spawnProj(16949): 이동 덫은 없다. 거미줄은 전조 뒤 _commit 이동탄 → sz×2·r×1.3·v×1.8·dmg×2(16975–16980), 유도·속도정규화 제외(web).
	var p: Dictionary = props.duplicate(true)
	var moving: bool = PREFIX._n(p.get("vx")) * PREFIX._n(p.get("vx")) + PREFIX._n(p.get("vy")) * PREFIX._n(p.get("vy")) > 0
	if not p.get("ml"): p.ml = p.life
	if moving:
		p.sz = float(p.sz) * 2
		p.vx = float(p.vx) * 1.8
		p.vy = float(p.vy) * 1.8
		p.dmg = PREFIX._i32(float(p.dmg) * 2.0)
	p.parryClass = K.source_parry_class(props)
	p._owner = weakref(actor)
	hazards.append(p)
	counts.hazards += 1

func _world_frame() -> float: return main.world.get_native_frame()

func _physics_process(_delta: float) -> void:
	if not is_instance_valid(main): return
	var frame: float = _world_frame()
	if frame <= _warning_frame or not current(): return
	_warning_frame = frame
	_game_frame += 1
	var sp: float = main.world._native_last_ticks
	_advance_warnings(sp)
	_advance_hazards(sp)
	_advance_fx(sp)
	queue_redraw()

func _advance_warnings(sp: float) -> void:
	var next: Array = []
	for w in warnings:
		var actor: Node = w.actor.get_ref()
		if not is_instance_valid(actor): counts.shots_cancelled += 1; continue
		var rec: Dictionary = actor.data.native_final
		var cancelled: bool = not w.dead and (not actor.alive or actor._stun_ticks > 0 or PREFIX._n(rec.get("_frozen")) > 0)
		if cancelled: counts.shots_cancelled += 1; continue
		w.t = float(w.t) - sp
		if w.t > 0: next.append(w); continue
		var dx: float = 0.0 if w.dead else actor.global_position.x - float(w.x)
		var dy: float = 0.0 if w.dead else actor.global_position.y - float(w.y)
		for shot in w.shots:
			shot.x = float(shot.get("x", w.x)) + dx
			shot.y = float(shot.get("y", w.y)) + dy
			shot._commit = true
			counts.shots_released += 1
			if shot.get("web", false) or shot.get("trap", false): _add_hazard(actor, shot)
			else: _emit_registry(actor, shot)
	warnings = next

# ═══ 덫/거미줄 틱(34657–34708, 35040–35089 해당 분기) ═══
func _advance_hazards(sp: float) -> void:
	var pl: Node2D = main.player
	var cam: Vector2 = camera_center()
	var next: Array = []
	var prev: Vector2 = pl.global_position
	for p in hazards:
		if p.get("friendly", false): continue
		p.life = float(p.life) - sp * 0.667
		if p.get("trap", false):
			p.vx = 0.0; p.vy = 0.0
			if Vector2(float(p.x), float(p.y)).distance_to(pl.global_position) < 28 and str(pl.state) != "charge":
				if float(pl.iframes) <= 0:
					var dmg: int = PREFIX._i32(float(p.dmg) * pl.get_native_element_multiplier(int(p.el) if p.get("el") != null else -1))
					pl.receive_damage(dmg, "magic", pl.global_position - Vector2(float(p.x), float(p.y)))
					var ka: float = atan2(pl.global_position.y - float(p.y), pl.global_position.x - float(p.x))
					pl.apply_native_posthurt_knockback(Vector2(cos(ka) * 8, sin(ka) * 8))
					if pl.has_method("apply_native_trap_slow"): pl.apply_native_trap_slow(120.0) # slowRes 0(미이식 어픽스)
					main.world.emit_native_text(pl.global_position.x, pl.global_position.y - 20, tr_text("⚠ 덫!"), "#ffcc00", 40)
					shake_set(4)
					counts.trap_hits += 1
				main.world.emit_native_parts(Vector2(float(p.x), float(p.y)), "#ffaa00", 10)
				continue
		else:
			var old := Vector2(float(p.x), float(p.y))
			p.x = float(p.x) + float(p.vx) * sp
			p.y = float(p.y) + float(p.vy) * sp
			p.dist = float(p.get("dist", 0)) + sp * Vector2(float(p.vx), float(p.vy)).length()
			if main.world.is_world_blocked(Vector2(float(p.x), old.y)) or main.world.is_world_blocked(Vector2(old.x, float(p.y))):
				main.world.emit_native_parts(Vector2(float(p.x), float(p.y)), K.ELC[int(p.el)] if p.get("el") != null and int(p.el) >= 0 else "#bbbbbb", 1)
				continue
			# 34845–34847 일반 판정 반경 _pCollR+4 = P.r+(sz)*3+4, 이동 선분 최근접
			var at := Vector2(float(p.x), float(p.y))
			var seg: Vector2 = at - old
			var dist: float = at.distance_to(pl.global_position)
			if seg.length_squared() > 1.0:
				var t: float = clampf((pl.global_position - old).dot(seg) / seg.length_squared(), 0, 1)
				dist = minf(dist, (old + seg * t).distance_to(pl.global_position))
			if dist < float(pl.radius) + float(p.sz) * 3 + 4 and float(pl.iframes) <= 0 and str(pl.state) != "charge":
				if pl.has_method("apply_native_web_slow"): pl.apply_native_web_slow(90.0) # 35086 P._webSlow=90
				main.world.emit_native_text(pl.global_position.x, pl.global_position.y - 20, tr_text("🕸둔화!"), "#aaaaaa", 30)
				main.world.emit_native_parts(pl.global_position, "#aaaaaa", 6)
				counts.web_hits += 1
				continue
		# 34746 수명 소진: 비빨콩은 카메라 2500 안이면 life=1 로 유지(덫 영구), 밖이면 소멸
		if float(p.life) <= 0:
			if Vector2(float(p.x), float(p.y)).distance_squared_to(cam) > 6250000.0: continue
			p.life = 1.0
		if not p.get("trap", false) and Vector2(float(p.x), float(p.y)).distance_squared_to(cam) > 6250000.0: continue
		next.append(p)
	hazards = next

# ═══ 연출 풀(teleportE·eSummon) ═══
func pool_part(x: float, y: float, vx: float, vy: float, col: String, sz: float, life: float, tp: int = 0, rot: float = 0.0, grav: float = 0.0) -> void:
	if not Color.html_is_valid(col): note_unported("poolPart_color:" + col); return
	main.world.emit_native_source_particle({"position": Vector2(x, y), "velocity": Vector2(vx, vy), "color": Color(col), "size": maxf(0.01, sz),
		"life_ticks": maxf(0.01, life), "type": clampi(tp, 0, 3), "rotation": rot, "gravity": grav, "render_owner": "pc_enemy_actors"})
func blast_light(_x: float, _y: float, _r: float, _l: float, _cr: int, _cg: int, _cb: int) -> void: note_unported("_addBlastLight")
func tp_smoke(x: float, y: float, sz: float, dur: float, kind: int, rot: float) -> void:
	_pool_slot(smokes, 10, {"x": x, "y": y, "sz": sz, "t": 0.0, "mt": dur if dur != 0 else 20.0, "type": kind, "rot": rot})
func tp_impact(x: float, y: float, sz: float, dur: float, col: String) -> void:
	_pool_slot(impacts, 12, {"x": x, "y": y, "sz": sz, "t": 0.0, "mt": dur if dur != 0 else 20.0, "col": col})
func tp_bolt(ox: float, oy: float, dx: float, dy: float, dur: float, col: String, segs: Array) -> void:
	_pool_slot(bolts, 8, {"ox": ox, "oy": oy, "dx": dx, "dy": dy, "t": 0.0, "mt": dur if dur != 0 else 14.0, "col": col, "segs": segs})
func vfx(id: String, x: float, y: float, scale: float, speed: float, ang: float, _skill: bool) -> void:
	if id != "teleport_burst": note_unported("vfx:" + id); return
	bursts.append({"x": x, "y": y, "scale": scale, "frame_time": speed, "ang": ang, "t": 0.0, "frame": 0})
	if bursts.size() > 20: bursts.pop_front()
func _pool_slot(pool: Array, cap: int, item: Dictionary) -> void:
	# 8720 등: 빈 슬롯 우선, 없으면 진행률(t/mt) 최대 슬롯 교체
	if pool.size() < cap: pool.append(item); return
	var oi := 0
	var ot := 0.0
	for i in pool.size():
		var r: float = float(pool[i].t) / float(pool[i].mt)
		if r > ot: ot = r; oi = i
	pool[oi] = item
func _advance_fx(sp: float) -> void:
	for pool in [smokes, impacts, bolts]:
		var keep: Array = []
		for it in pool:
			it.t = float(it.t) + sp
			if it.t < it.mt: keep.append(it)
		pool.assign(keep)
	var nb: Array = []
	for b in bursts:
		b.t = float(b.t) + 1.0
		if b.t >= float(b.frame_time):
			b.t = 0.0
			b.frame = int(b.frame) + 1
		if int(b.frame) < 9: nb.append(b)
	bursts = nb

func present(cmd: String, _args: Array) -> void: note_unported("present:" + cmd)
func play_sample(key: String, vol: float, pitch: float, _at: Vector2) -> void:
	if not current(): return
	var receipt: Dictionary = main.request_native_enemy_move_sample(self, key, vol, pitch)
	if not receipt.get("accepted", false) and receipt.get("reason") != "source_30ms_key_gate":
		note_unported("playSample_monster_move:" + str(receipt.get("reason")))
func sfx(name: String, _args: Array, _at: Vector2) -> void: note_unported("SFX." + name)
func shake(n: float) -> void:
	if main.source_state.has_method("apply_native_skill_shake"): main.source_state.apply_native_skill_shake(main, n)
func shake_set(n: float) -> void:
	# 34702 G.shake=4*OPT.shake/100 (max 아님) — 기존 writer 는 max 만 제공 → 같은 값 이상일 때만 일치
	shake(n)
	note_unported("shake_assign_not_max_34702")

func tr_text(text: String) -> String:
	if main.has_method("translate_native_boot_label"):
		var t: Variant = main.translate_native_boot_label(text)
		if t is String: return t
	return text
func lang_pick(ko: String, en: String) -> String:
	return ko if TranslationServer.get_locale().begins_with("ko") else en

# ═══ PC 패링(isPWin + doParry 기존 writer 부분집합 = PC-M29/보스 코어와 같은 경로) ═══
func is_p_win() -> bool:
	var svc: Variant = main.get("native_m29_contact")
	if svc == null or not svc.has_method("read_parry_window"): return false
	var w: Dictionary = svc.read_parry_window()
	return w.get("ready") == true and w.get("value") == true
func do_parry(_actor: Node, bank_add: float) -> void:
	var src: Dictionary = main.read_native_q_parry_source()
	if src.get("ready") != true: counts.parry_rejected += 1; note_unported("parry_source:" + str(src.get("reason"))); return
	var bank: float = main.read_native_source_parry_bank(src.p)
	if not main.commit_native_q_control_state({"parryBank": bank + bank_add}): counts.parry_rejected += 1; return
	var reward: int = main.native_source_parry_reward(float(src.stats.parry_bonus), float(src.regen_lv), 1.0)
	var res: Dictionary = main.source_resources.commit_native_q_parry_reward(main, float(reward))
	if res.get("accepted") == true: counts.parries += 1
	else: counts.parry_rejected += 1

# ═══ 공유 원본 전역 ═══
func msfx_playing() -> int:
	var f: float = _world_frame()
	if f != _msfx_frame: _msfx_frame = f; _msfx = 0
	return _msfx
func msfx_inc() -> void: _msfx += 1
func tier_frame() -> int: return int(main.world._native_owner_phase_updates) # 34418 G._eTierFrame++ (적 루프 1회당 1)
func atk_tickets() -> int: return 0 # 16718 atkTickets:0 — atkTicketRequest 가 무조건 true 라 증가하지 않는다
func camera_center() -> Vector2:
	var camera := get_viewport().get_camera_2d()
	return camera.get_screen_center_position() if is_instance_valid(camera) else main.player.global_position
func view_half() -> Vector2:
	var size: Vector2 = get_viewport().get_visible_rect().size
	var camera := get_viewport().get_camera_2d()
	var zoom: Vector2 = camera.zoom if is_instance_valid(camera) else Vector2.ONE
	return size / zoom * 0.5
func note_unported(what: String) -> void: unported[what] = int(unported.get(what, 0)) + 1

func attach_decor(actor: Node2D) -> void:
	var decor = DECOR.new()
	decor.name = "EtypeGDecor"
	actor.add_child(decor)
	decor.configure(actor)

# ═══ 렌더(덫 54108 / 거미줄 54135 / 전조 링 20097 / 텔포 연출 56921–56972) ═══
func _draw() -> void:
	var now: float = float(Time.get_ticks_msec())
	for w in warnings:
		var actor: Node = w.actor.get_ref()
		var at: Vector2 = Vector2(float(w.x), float(w.y)) if w.dead or not is_instance_valid(actor) else actor.global_position
		_draw_shoot_charge(at, float(w.r), 1.0 - float(w.t) / 60.0, Color(str(w.col)), w.parryClass == "physical")
	for p in hazards:
		var at := Vector2(float(p.x), float(p.y))
		if p.get("trap", false):
			var pul: float = 0.5 + sin(now / 200.0) * 0.5
			if _ward != null:
				var sw: float = _ward.get_width() / 2.0
				draw_set_transform(at, -now * 0.00018, Vector2.ONE)
				draw_texture_rect_region(_ward, Rect2(-56, -56, 112, 112), Rect2(sw, 0, sw, _ward.get_height()), Color(1, 1, 1, 0.78 + pul * 0.18))
				draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
			else:
				draw_circle(at, 54, Color(0.85, 0.12, 0.24, 0.15 + pul * 0.12))
		else:
			var web_scale: float = maxf(1.2, minf(4.0, float(p.sz) * 1.5)) * 0.7 * 2
			var dh: float = 22.05 * web_scale * 0.55
			var dw: float = dh * 2.0
			var fi: int = posmod((_game_frame >> 2) + PREFIX._i32(float(p.x) * 0.03), 8)
			draw_set_transform(at, atan2(float(p.vy), float(p.vx)), Vector2.ONE)
			draw_texture_rect_region(MOUTH, Rect2(-dw / 2, -dh / 2, dw, dh), Rect2(fi * 768, 0, 768, 384))
			draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
	for sm in smokes:
		var prog: float = float(sm.t) / float(sm.mt)
		var tex: Texture2D = TP_OUT if int(sm.type) == 0 else TP_IN
		var size: float
		var alpha: float
		var rot: float
		if int(sm.type) == 0:
			size = float(sm.sz) * (1 + prog * 1.8); alpha = maxf(0, (1 - prog * prog) * 0.85); rot = float(sm.rot) + prog * 1.5
		else:
			size = float(sm.sz) * maxf(0.6, 2.2 - prog * 1.6); alpha = (prog / 0.4 if prog < 0.4 else maxf(0, 1 - (prog - 0.4) / 0.6)) * 0.9; rot = float(sm.rot) - prog * 1.2
		draw_set_transform(Vector2(float(sm.x), float(sm.y)), rot, Vector2.ONE)
		draw_texture_rect(tex, Rect2(-size / 2, -size / 2, size, size), false, Color(1, 1, 1, alpha))
		draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)
	for ti in impacts:
		var prog: float = float(ti.t) / float(ti.mt)
		var fi: int = mini(3, PREFIX._i32(prog * 4))
		var cw: float = floorf(TP_IMPACT.get_width() / 2.0)
		var ch: float = floorf(TP_IMPACT.get_height() / 2.0)
		var size: float = float(ti.sz) * (0.6 + prog * 0.6)
		draw_texture_rect_region(TP_IMPACT, Rect2(float(ti.x) - size / 2, float(ti.y) - size / 2, size, size), Rect2((fi % 2) * cw, int(fi / 2) * ch, cw, ch), Color(1, 1, 1, maxf(0, 1 - prog * prog)))
		if prog < 0.5: draw_circle(Vector2(float(ti.x), float(ti.y)), size * 0.2, Color(Color(str(ti.col)), 0.5 * (1 - prog * 2)))
	for bl in bolts:
		var prog: float = float(bl.t) / float(bl.mt)
		var ba: float = 1 - prog * prog
		var pts := PackedVector2Array()
		for sgm in bl.segs: pts.append(Vector2(float(sgm[0]), float(sgm[1])))
		if pts.size() >= 2:
			draw_polyline(pts, Color(Color(str(bl.col)), ba * 0.35), 8 + sin(now * 0.5) * 2, true)
			draw_polyline(pts, Color(1, 1, 1, ba * 0.8), 2 + ba * 2, true)
	for b in bursts:
		var size: float = 64.0 * float(b.scale)
		draw_set_transform(Vector2(float(b.x), float(b.y)), float(b.ang), Vector2.ONE)
		draw_texture_rect_region(TP_BURST, Rect2(-size / 2, -size / 2, size, size), Rect2(int(b.frame) * 64, 0, 64, 64))
		draw_set_transform(Vector2.ZERO, 0, Vector2.ONE)

# 20093 _drawShootCharge(x,y,r,prog,col,sa,physical)
func _draw_shoot_charge(at: Vector2, r: float, prog: float, col: Color, physical: bool) -> void:
	prog = clampf(prog, 0, 1)
	var radius_: float = r + 10
	draw_arc(at, radius_, 0, TAU, 48, Color(0.03, 0.03, 0.03, 0.28), 5, true)
	if prog > 0:
		draw_arc(at, radius_, -PI / 2, -PI / 2 + TAU * prog, 48, Color(1, 1, 1, 1) if physical else Color(col, 0.8 + prog * 0.2), 6 if physical else 3.5, true)

func snapshot() -> Dictionary:
	var live := 0
	for ref in actors:
		var a: Variant = ref.get_ref()
		if is_instance_valid(a) and a.alive: live += 1
	return {"live": live, "counts": counts.duplicate(), "warnings": warnings.size(), "hazards": hazards.size(), "unported": unported.duplicate(), "last_reject": last_reject}
