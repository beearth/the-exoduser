extends "res://scripts/enemy_melee_ch1_ice_warrior.gd"
## PC-ENEMY-ACTORS (2026-10-23) — 자연 공급 G 계열 actor(etype 3·7·13·14·16·17·20·21·47 + 자연 29).
## 몸체·충돌·스킨·hurtE owner·포이즈 코어는 기존 kernel(flesh_crawler/ice_warrior) 상속. AI 는 원본 updateE 를
## 그대로 옮긴 순수 실행자 native_demo11_etype_g_kernel.gd 가 원본 필드명 record(data.native_final)에서 수행한다.
## 이 actor 는 (1) 원본 적 루프의 per-enemy 앞부분·뷰포트 컬링·4단계 티어링(34420–34490) 결정,
## (2) 노드 필드 ↔ record 동기화, (3) kernel env(월드·플레이어·PC 접촉/패링·탄 전조/소환 owner 연결)만 한다.
## World 가 유일한 시계(advance_native_phase). 자율 _physics_process 없음.
const K = preload("res://scripts/native_demo11_etype_g_kernel.gd")
const PREFIX_ = preload("res://scripts/native_demo11_boss_prefix.gd")
const G_PROFILE := "demo11_group_g_v1"
var g_ready := false
var g_fault := ""
var g_ticks := 0
var g_updates := 0
var g_owner: Node # native_demo11_etype_g_spawn.gd
var e: Dictionary = {}
var g_last_receipt: Dictionary = {}
var g_counts: Dictionary = {"updates": 0, "culled": 0, "tier_skips": 0, "leash": 0, "not_ready": 0, "self_hurt_refused": 0, "parry": 0, "contact_hits": 0}
var _g_last_frame := -1.0
var _g_pending_bank := 0.0

func configure(value: Dictionary, owner_world: Node2D) -> void:
	if not K.G_TYPES.has(int(value.get("etype", -1))) or value.get("ai_profile") != G_PROFILE: return
	super.configure(value, owner_world)
	e = data.native_final
	g_ready = true

func _source_normal_fields_domain_current() -> bool:
	return K.G_TYPES.has(etype) and data.get("ai_profile") == G_PROFILE and elite == 0 and mods.is_empty()

func _ready() -> void:
	super._ready()
	set_physics_process(false)
	if is_instance_valid(g_owner) and g_owner.has_method("attach_decor"): g_owner.attach_decor(self)

func _physics_process(_delta: float) -> void: pass
func is_native_registry_ready() -> bool: return g_ready and is_instance_valid(g_owner)

func _g_stop(reason: String) -> void:
	g_fault = reason
	g_counts.not_ready += 1
	telemetry_event.emit("etype_g_not_ready", {"etype": etype, "reason": reason})

# ── 노드 필드 ↔ record ──
func _sync_in() -> void:
	e.x = global_position.x
	e.y = global_position.y
	e.hp = hp
	e.mhp = mhp
	e.alive = alive
	e.eShield = eShield
	e.eShieldMax = eShieldMax
	e.s = state
	e.st2 = st2
	e.facing = facing
	if alerted: e._alerted = true
	e.stunned = _stun_ticks
	e._hitStun = _hit_stun
	e._hitFlash = _hit_flash
	e.poise = poise
	e.maxPoise = max_poise
	e.poiseR = _poise_regen
	if not (e.get("kb") is Dictionary): e.kb = {"x": 0.0, "y": 0.0}
	e.kb.x = _knockback.x
	e.kb.y = _knockback.y
	e._spawnT = _spawn_ticks
	e.r = radius
	e.speed = float(data.speed_pixels_per_tick)
	e._projChargeT = charge_ticks
	e.projT = _projectile_ticks
	if _source_max_stunned_present: e._maxStunned = _maxStunned

func _sync_out() -> void:
	global_position = Vector2(float(e.x), float(e.y))
	hp = e.hp
	eShield = float(e.eShield)
	eShieldMax = float(e.eShieldMax)
	state = str(e.s)
	st2 = float(e.st2)
	facing = float(e.facing)
	alerted = PREFIX_._t(e.get("_alerted"))
	_stun_ticks = PREFIX_._n(e.get("stunned"))
	_hit_stun = PREFIX_._n(e.get("_hitStun"))
	_hit_flash = PREFIX_._n(e.get("_hitFlash"))
	poise = PREFIX_._n(e.poise)
	_poise_regen = PREFIX_._n(e.get("poiseR"))
	_knockback = Vector2(PREFIX_._n(e.kb.x), PREFIX_._n(e.kb.y))
	_spawn_ticks = PREFIX_._n(e.get("_spawnT"))
	attack = int(e.atk)
	data.speed_pixels_per_tick = float(e.speed)
	charge_ticks = PREFIX_._n(e.get("_projChargeT"))
	_projectile_ticks = PREFIX_._n(e.get("projT"))
	if e.has("_maxStunned"):
		_maxStunned = e._maxStunned
		_source_max_stunned_present = true

# ── 원본 적 루프 per-enemy(34420–34492): 타이머 → 컬링 → 티어링 → updateE ──
func advance_native_phase(ticks: float, frame: float, enemies: Array) -> void:
	if not g_ready or not g_fault.is_empty() or not alive or not is_instance_valid(player) or not is_instance_valid(g_owner) or ticks <= 0 or frame <= _g_last_frame: return
	if not g_owner.current(): return
	_g_last_frame = frame
	g_ticks += 1
	native_frame = frame
	var before := global_position
	_sync_in()
	K.outer_prefix(e, ticks)
	var px: float = player.global_position.x
	var py: float = player.global_position.y
	var d2: float = (px - float(e.x)) * (px - float(e.x)) + (py - float(e.y)) * (py - float(e.y))
	var commit: bool = str(e.s) == "eChargeWind" or str(e.s) == "eCharge"
	var cam: Vector2 = g_owner.camera_center()
	var half: Vector2 = g_owner.view_half()
	var in_view: bool = commit or d2 < 900 or (float(e.x) > cam.x - half.x - 300 and float(e.x) < cam.x + half.x + 300 and float(e.y) > cam.y - half.y - 300 and float(e.y) < cam.y + half.y + 300)
	var tier: int = g_owner.tier_frame()
	var ei: int = enemies.find(self)
	if not in_view:
		g_counts.culled += 1
		# 34466–34470 리시 텔레포트
		if not PREFIX_._t(e.get("stunned")) and not PREFIX_._t(e.get("_frozen")) and PREFIX_._t(e.get("_alerted")) and d2 > 6250000:
			var la: float = TAU * world.sample_native_random_unit()
			var ld: float = 800 + world.sample_native_random_unit() * 400
			var lx: float = px + cos(la) * ld
			var ly: float = py + sin(la) * ld
			if world.can_move(Vector2(lx, ly), float(e.r)):
				e.x = lx; e.y = ly; e.kb.x = 0.0; e.kb.y = 0.0
				e.facing = atan2(py - ly, px - lx)
				e._stuckT = 0
				g_counts.leash += 1
		if PREFIX_._t(e.get("_alerted")) and (tier & 7) == 0:
			var er: float = float(K.RANGE.get(etype, 600))
			if er <= 400 or sqrt(d2) > er * 0.85:
				PREFIX_._ff_move(e, g_p(), ticks * 4, 0.5, self)
		_finish_g(before, ticks)
		return
	var result: Dictionary = {}
	if commit or d2 < 22500:
		result = _update(ticks)
	elif d2 < 122500:
		if (tier & 1) == (ei & 1): result = _update(ticks * 2)
		else: g_counts.tier_skips += 1
	elif d2 < 490000:
		if (tier & 3) == (ei & 3): result = _update(ticks * 4)
		else: g_counts.tier_skips += 1
	else:
		if (tier & 7) == (ei & 7):
			if PREFIX_._t(e.get("_alerted")):
				var er2: float = float(K.RANGE.get(etype, 600))
				if er2 <= 400 or sqrt(d2) > er2 * 0.85:
					PREFIX_._ff_move(e, g_p(), ticks * 4, 0.6, self)
			else:
				result = _update(ticks * 8)
		else: g_counts.tier_skips += 1
	if result.get("status") == "NOT_READY":
		_finish_g(before, ticks)
		_g_stop(str(result.reason))
		return
	_finish_g(before, ticks)

func _update(sp: float) -> Dictionary:
	g_updates += 1
	g_counts.updates += 1
	var r: Dictionary = K.update_e(e, sp, self)
	g_last_receipt = r
	return r

func _finish_g(before: Vector2, ticks: float) -> void:
	_sync_out()
	_finish_motion(before, ticks)

# ════════ kernel env (원본 경계 함수) ════════
func g_rand() -> float: return world.sample_native_random_unit()
func g_can_mv(x: float, y: float, r: float) -> bool: return world.can_move(Vector2(x, y), r)
func g_safe_pt(x: float, y: float, r: float) -> Variant: return world.native_safe_point(x, y, r)
func pf_can_move(x: float, y: float, r: float) -> bool: return world.can_move(Vector2(x, y), r)
func pf_tile_free(x: float, y: float, r: float) -> bool: return world.can_move(Vector2(x, y), r)
func pf_real_wall(x: float, y: float) -> bool: return world.is_world_blocked(Vector2(x, y))
func g_is_w(x: float, y: float) -> bool: return world.is_world_blocked(Vector2(x, y))
func pf_los(x1: float, y1: float, x2: float, y2: float) -> bool: return world.has_line_of_sight(Vector2(x1, y1), Vector2(x2, y2))
func pf_ff_dir(x: float, y: float) -> Variant:
	var v: Vector2 = world.get_path_direction(Vector2(x, y))
	return null if v.is_zero_approx() else {"x": v.x, "y": v.y}
func pf_rifts() -> Array:
	var g: Variant = world.get_parent().source_state.read_current_g()
	var rifts: Variant = g.get("rifts") if g is Dictionary else null
	return rifts if rifts is Array else []
func pf_msfx_playing() -> int: return g_owner.msfx_playing()
func pf_msfx_inc() -> void: g_owner.msfx_inc()
func g_p() -> Dictionary:
	var f: Variant = player.get("facing")
	return {"x": player.global_position.x, "y": player.global_position.y, "r": float(player.radius), "iframes": float(player.iframes),
		"s": str(player.state), "facing": (f as Vector2).angle() if f is Vector2 else PREFIX_._n(f), "hp": float(player.hp)}
func g_sh_query(x: float, y: float, r: float) -> Array:
	var out: Array = []
	for node in world.query_native_enemies(x, y, r):
		if node == self: out.append(e)
		elif is_instance_valid(node): out.append({"x": node.global_position.x, "y": node.global_position.y, "r": float(node.get("radius")), "alive": node.get("alive") == true, "etype": node.get("etype"), "node": node})
	return out
func g_ens_count() -> int: return world.get_enemies().size()
func g_tr(t: String) -> String: return g_owner.tr_text(t)
func g_l(ko: String, en: String) -> String: return g_owner.lang_pick(ko, en)
func g_text(x: Variant, y: Variant, t: String, c: String, l: Variant) -> void: world.emit_native_text(float(x), float(y), t, c, l)
func g_parts(x: Variant, y: Variant, col: Variant, n: int) -> void: world.emit_native_parts(Vector2(float(x), float(y)), str(col), n)
func g_pool_part(x: float, y: float, vx: float, vy: float, col: Variant, sz: float, life: float, tp: Variant = null, rot: Variant = null, grav: Variant = null) -> void:
	g_owner.pool_part(x, y, vx, vy, str(col), sz, life, int(tp) if tp != null else 0, float(rot) if rot != null else 0.0, float(grav) if grav != null else 0.0)
func g_play_sample(key: String, vol: float, pitch: float) -> void: g_owner.play_sample(key, vol, pitch, global_position)
func g_sfx(name: String, args: Array) -> void: g_owner.sfx(name, args, global_position)
func g_shake(n: float) -> void: g_owner.shake(n)
func g_present(cmd: String, args: Array) -> void: g_owner.present(cmd, args)
func g_vfx(id: String, x: float, y: float, scale: float, speed: float, ang: float, skill: bool) -> void: g_owner.vfx(id, x, y, scale, speed, ang, skill)
func g_blast_light(x: float, y: float, r: float, l: float, cr: int, cg: int, cb: int) -> void: g_owner.blast_light(x, y, r, l, cr, cg, cb)
func g_tp_smoke(x: float, y: float, sz: float, dur: float, kind: int, rot: float) -> void: g_owner.tp_smoke(x, y, sz, dur, kind, rot)
func g_tp_impact(x: float, y: float, sz: float, dur: float, col: String) -> void: g_owner.tp_impact(x, y, sz, dur, col)
func g_tp_bolt(ox: float, oy: float, dx: float, dy: float, dur: float, col: String, segs: Array) -> void: g_owner.tp_bolt(ox, oy, dx, dy, dur, col, segs)
## hurtE(e,dmg) ang undefined(38604 균열/38610 벽 충돌) — 기존 PC hurtE 경로. 각도 미정 경로가 PC 에 미이식이면 정지 기록.
func g_hurt_self(_rec: Dictionary, dmg: int, line: int) -> void:
	_sync_out()
	var r: Dictionary = world.get_parent().request_native_hurte(self, dmg, null, false, {}, 0, {"token": "g-self/%d/%d/%d" % [get_instance_id(), g_ticks, line]})
	if r.get("status") not in ["APPLIED", "SOURCE_RETURN"]:
		g_counts.self_hurt_refused += 1
		g_owner.note_unported("self_hurtE_angle_undefined:" + str(r.get("reason")))
	_sync_in()
func g_hurt_p(dmg: int, _opts: Dictionary) -> void:
	g_counts.contact_hits += 1
	player.receive_damage(dmg, "phys", player.global_position - global_position)
func g_kb_p(x: float, y: float) -> void: player.apply_native_posthurt_knockback(Vector2(x, y))
func g_is_p_win() -> bool: return g_owner.is_p_win()
func g_parry(_rec: Dictionary, bank: float) -> void: _g_pending_bank = bank
func g_do_parry(_rec: Dictionary) -> void:
	g_counts.parry += 1
	g_owner.do_parry(self, _g_pending_bank)
	_g_pending_bank = 0.0
func g_poise_hit(_rec: Dictionary, amt: int) -> void:
	_sync_out()
	apply_native_normal_enemy_poise_core(amt)
	_sync_in()
func g_freeze_slow(n: float) -> void: player.apply_native_freeze_slow(n)
func g_el_mul(el: Variant) -> float: return player.get_native_element_multiplier(int(el) if el != null else -1)
func g_shot(_rec: Dictionary, props: Dictionary) -> void: g_owner.queue_shot(self, props)
func g_proj(_rec: Dictionary, props: Dictionary) -> void: g_owner.spawn_proj(self, props)
func g_trap_cap(cap: int) -> void: g_owner.trap_cap(cap)
func g_summon(_rec: Dictionary, child_etype: int, x: float, y: float, el: Variant, room: Variant, opts: Dictionary) -> Variant:
	_sync_out()
	var made: Variant = g_owner.spawn_child(self, child_etype, x, y, el, room, opts)
	_sync_in()
	return made
func g_mk_en_detached(x: float, y: float, child_etype: int, el: Variant, room: Variant) -> Variant:
	return g_owner.mk_en_detached(self, x, y, child_etype, el, room)
func g_atk_tickets() -> int: return g_owner.atk_tickets()
func g_max_atk_tickets() -> int: return 3
func g_atk_ticket_request(_rec: Dictionary) -> bool: return true # 38579 핵슬: 어택 티켓 무제한
func g_atk_ticket_release(_rec: Dictionary) -> void: pass # 38582 _hasAtkTicket 는 설정되지 않는다
func g_kb_enemy(oe: Dictionary, x: float, y: float) -> void:
	var node: Variant = oe.get("node")
	if is_instance_valid(node) and node.has_method("add_native_knockback"): node.add_native_knockback(Vector2(x, y))
	elif oe == e: e.kb.x = float(e.kb.x) + x; e.kb.y = float(e.kb.y) + y

# ── 읽기 전용 관측 ──
func get_snapshot() -> Dictionary:
	var s: Dictionary = super.get_snapshot()
	s.merge({"g_ready": g_ready, "g_fault": g_fault, "g_ticks": g_ticks, "g_updates": g_updates, "g_counts": g_counts.duplicate(), "last_receipt": g_last_receipt.duplicate()}, true)
	return s
