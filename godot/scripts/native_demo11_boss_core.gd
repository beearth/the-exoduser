extends Node2D
## PC-BOSS-CORE (2026-10-22, PC Claude) — 1-1 다크드루이드 전투 owner.
## 계약: docs/engine/PC_BOSS_CORE_CONTRACT_20261022.md (소유 경계·틱 순서·receipt·S 변환).
##
## 소유: AI 틱 owner(World 위상), updateE prefix/suffix, 보스 HP·쉴드·포이즈·스턴·부활·사망 필드(정본 E),
## 보스→플레이어 접촉 피해, 보스 투사체 접촉, 리듬탄·ORB 구동, 최종 사망 PCI-11 발행.
## 비소유(호출만): Mac actor 조립(native_demo11_boss_actor.gd)·BC 모듈·보스 투사체 registry·표시·encounter.
## 정본 E 는 "보스 공간 b" 좌표(원본 수치)다. 월드와는 native_boss_space.gd 변환으로만 만난다.

const PREFIX = preload("res://scripts/native_demo11_boss_prefix.gd")
const SPACE = preload("res://scripts/native_boss_space.gd")
const BODY = preload("res://scripts/native_demo11_boss_body.gd")
const PROJ = preload("res://scripts/native_ch1_boss_projectile_patterns.gd")
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const DEATH = preload("res://scripts/native_demo11_boss_death.gd")
const QUEUES = preload("res://scripts/native_ch1_boss_queues.gd")
const T := 40.0
const BOSS_SFX0 := {"howl": "boss_howl", "howlP": 0.7, "die": "death_boss", "dieP": 0.7, "hit": "boss_hit", "hitP": 0.7, "hurt": "monster_hurt", "hurtP": 0.7} # 24758
const OWNED_COMMANDS := ["source_updateE_prefix", "phase_transition_commit", "source_updateE_suffix", "source_global_write",
	"hurtP", "player_kb_add", "resolve_boss_movement_contact", "resolve_boss_melee_contact", "resolve_boss_erupt_contact",
	"resolve_boss_grab_damage", "apply_boss_player_control", "resolve_druid_orb_contact",
	"addTxt", "addParts", "poolPart", "shake", "playVFXAng", "deathFX", "_addBlastLight", "_addTpSmoke", "_addTpImpact",
	"_addTpBolt", "_bossSfx", "_reviveVFX", "setTimeout", "_T", "write_enemy_fields", "write_globals",
	"append_global_queue", "ensure_global_queue", "atkTicketRelease", "SFX.groggy", "SFX.charge", "SFX.slam",
	"SFX.swing", "SFX.magic", "SFX.detonate", "SFX.block", "playSample"]
const UNPORTED_PRESENTATION := ["playVFXAng", "deathFX", "_addBlastLight", "_addTpSmoke", "_addTpImpact", "_addTpBolt",
	"SFX.groggy", "SFX.charge", "SFX.slam", "SFX.swing", "SFX.magic", "SFX.detonate", "SFX.block", "playSample", "setTimeout"]
const G_QUEUE_NAMES := ["_chaseAoes", "_fissures", "_tideWaves", "_seekerMines", "_poisonPools", "_lavaPools", "_druidOrbs"]

var main: Node
var actor: Node2D
var body: Node2D
var space: RefCounted = SPACE.new()
var E: Dictionary = {}
var mac_space_ready := false
var effective_scale := 1.0
var _serial := 0
var _sp := 0.0
var _msfx_playing := 0
var _in_tick := false
var _current_frame: Dictionary = {}
var _last_frame: Dictionary = {}
var _error := ""
var _prefix_reason := ""
var _final_published := false
var _death_token := ""
var _queue_registered := false
var counters := {"ticks": 0, "alive_ticks": 0, "dead_ticks": 0, "prefix": 0, "prefix_early": 0, "suffix": 0,
	"phase_commits": 0, "global_writes": 0, "contacts": 0, "hurtP": 0, "player_damage": 0, "parries": 0,
	"presentation_ported": 0, "presentation_unported": 0, "boss_hits": 0, "boss_damage": 0, "deaths": 0,
	"immediate_revives": 0, "fallback_revives": 0, "final_deaths": 0, "projectile_contacts": 0,
	"projectile_hits": 0, "rhythm_volleys": 0, "orb_volleys": 0, "rng_prefix": 0, "not_ready": 0,
	"queue_hits": 0, "mines_spawned": 0, "summon_unported": 0, "projectile_reflected": 0}
var _unported: Dictionary = {}
var _last_contact: Dictionary = {}
var _death_exec: Object
var _mines: Array = []
var _q_sp := 0.0

static func install_native_boot(owner_main: Node) -> Node2D:
	var world: Node = owner_main.get("world")
	if not is_instance_valid(world) or not is_instance_valid(owner_main.get("native_demo_boss_actor")):
		return null
	var core := new()
	core.name = "Demo11BossCore"
	world.add_child(core)
	if not core.configure(owner_main):
		core.free()
		return null
	return core

func configure(owner_main: Node) -> bool:
	if is_instance_valid(main) or not is_instance_valid(owner_main): return false
	main = owner_main
	actor = main.native_demo_boss_actor
	if not is_instance_valid(actor) or actor.get_parent() != main.world or get_parent() != main.world: return false
	for command in OWNED_COMMANDS:
		if not main.bind_native_demo_boss_owner(command, Callable(self, "_serve")):
			push_warning("PC boss core: owner already bound " + command)
	var projectiles: Variant = main.get("native_demo_boss_projectiles")
	if is_instance_valid(projectiles) and projectiles.has_method("bind_protected_contact"):
		projectiles.bind_protected_contact(Callable(self, "_projectile_contact"))
	set_physics_process(false)
	mac_space_ready = actor.has_method("bind_space_transform")
	effective_scale = SPACE.BOSS_SPACE_SCALE if mac_space_ready else 1.0
	return true

func _live() -> bool:
	return is_instance_valid(main) and is_instance_valid(actor) and is_inside_tree() and main.get("world") == get_parent() \
		and is_instance_valid(main.player)

## main.spawn_native_demo_boss READY 직후 1회 (encounter 입장·테스트 공개 spawn API 공통)
func adopt_spawn(receipt: Dictionary) -> Dictionary:
	if not _live() or receipt.get("status") != "READY": return {"adopted": false, "reason": "spawn_not_ready"}
	if is_instance_valid(body): return {"adopted": false, "reason": "already_adopted"}
	var enemy: Dictionary = actor.snapshot().get("enemy", {})
	if enemy.is_empty(): return {"adopted": false, "reason": "actor_enemy_empty"}
	_set_E(enemy)
	space.configure(effective_scale, Vector2(float(E.x), float(E.y)))
	body = BODY.new()
	body.configure_boss(self, main.world, E)
	body.global_position = _b2w(float(E.x), float(E.y))
	var reg: Dictionary = main.world.register_summoned_enemy(body)
	if reg.get("valid") != true:
		_error = "boss_body_registry_rejected:" + str(reg.get("errors"))
		body.free()
		body = null
		return {"adopted": false, "reason": _error}
	# AI 시계 소유 이전: actor 자체 물리 폴링 종료(World register_native_phase_consumer 관례와 동일).
	actor.set_physics_process(false)
	if not _queue_registered:
		_queue_registered = main.world.register_native_phase_consumer(self, Callable(self, "_owner_step_noop"), Callable(self, "advance_queue"))
	_final_published = false
	return {"adopted": true, "registry_index": reg.get("registry_index"), "space": space.snapshot()}

func _owner_step_noop(_ticks: float, _frame: float, _enemies: Array) -> void:
	pass

func is_boss_body_current(candidate: Node) -> bool:
	return is_instance_valid(body) and candidate == body and _live()

func world_length(v: float) -> float:
	return space.len_to_world(v)

func _set_E(value: Dictionary) -> void:
	# body.data.native_final 과 같은 참조를 유지한다(clear+merge).
	var copy: Dictionary = value.duplicate(true)
	E.clear()
	E.merge(copy, true)

# ═══════════════════════════════ 틱 ═══════════════════════════════
func advance_boss_tick(caller: Node, ticks: float) -> void:
	if caller != body or not _live() or _in_tick or not is_finite(ticks) or ticks <= 0.0: return
	if main.get_tree().paused: return
	_in_tick = true
	_sp = ticks
	_msfx_playing = 0 # 12300 프레임 시작 리셋
	counters.ticks += 1
	_update_pstats(ticks)
	if E.get("alive") == true:
		_tick_alive(ticks)
	else:
		_tick_dead(ticks)
	_sync_body()
	_in_tick = false

func _tick_alive(sp: float) -> void:
	counters.alive_ticks += 1
	# 34395–34398 오라·둔화·다리부상·가시덫 (오라 원천 적은 아레나에 없음)
	E._aAtkM = 1
	E._aSpdM = 1
	E._aDefM = 1
	E._auraL = null
	if _n(E.get("_webSlow")) > 0: E._aSpdM = _n(E._aSpdM) * 0.5
	if _n(E.get("_legInjury")) > 0:
		E._legInjury = _n(E._legInjury) - sp
		E._aSpdM = _n(E._aSpdM) * 0.2
	if _n(E.get("_spikeSlow")) > 0:
		E._spikeSlow = _n(E._spikeSlow) - sp
		E._aSpdM = _n(E._aSpdM) * (1 - PREFIX.spike_trap_slow_pct(E.get("_spikeSlowLv")))
	# 34427–34444 벽 끼임 구조(보스 분기: 1~5 링 → 6~12 링 → 플레이어 위치)
	_wall_stuck_rescue()
	# 34446 _spawnT-- (sp 아님)
	if _n(E.get("_spawnT")) > 0: E._spawnT = _n(E._spawnT) - 1
	# 34448 부활 grand VFX 지연(표시 미이식)
	if _n(E.get("_bossReviveVFXPending")) > 0:
		E._bossReviveVFXPending = _n(E._bossReviveVFXPending) - sp
		if E._bossReviveVFXPending <= 0:
			E._bossReviveVFXPending = 0
			_unported_note("_bossReviveGrandVFX")
	# 34449–34455
	if _n(E.get("stunned")) > 0: E.stunned = _n(E.stunned) - sp
	if _n(E.get("_hitStun")) > 0: E._hitStun = _n(E._hitStun) - sp
	if _n(E.get("_hitFlash")) > 0: E._hitFlash = maxf(0.0, _n(E._hitFlash) - sp)
	if _n(E.get("_stunImmune")) > 0: E._stunImmune = _n(E._stunImmune) - sp
	if _n(E.get("_pImmune")) > 0: E._pImmune = _n(E._pImmune) - sp
	if _n(E.get("stunned")) <= 0 and PREFIX._t(E.get("_maxStunned")):
		E._maxStunned = 0
		E.poise = E.get("maxPoise", E.get("poise")) # _poiseReset 20001
		E.poiseR = 0
		E._pImmune = maxf(_n(E.get("_pImmune")), 300.0)
		E.s = "idle"
		E.st2 = 30
		E._teleDropY = 0
	# 34458
	if _n(E.get("reviveIframes")) > 0: E.reviveIframes = maxf(0.0, _n(E.reviveIframes) - sp)
	# 34477 updateE(e,sp) — actor 조립
	var frame := _build_frame(sp)
	_current_frame = frame
	if not actor.begin_tick(frame):
		var asnap: Dictionary = actor.snapshot()
		_error = "actor_begin_tick_rejected:" + str(asnap.get("reason")) + ":stage=" + str(asnap.get("stage")) \
			+ ":pending=" + str(asnap.get("pending", {}).get("command", ""))
		counters.not_ready += 1
	else:
		var snap: Dictionary = actor.snapshot()
		if not str(snap.get("reason", "")).is_empty():
			_error = "actor_not_ready:" + str(snap.reason)
	_last_frame = frame

## 사망 후 34493–34535: _reviveTimer 소진 → 2차 판정(순수 모듈 native_demo11_boss_death.gd)
func _tick_dead(sp: float) -> void:
	counters.dead_ticks += 1
	if _n(E.get("_reviveTimer")) <= 0: return
	_death_exec = null
	var r: Dictionary = DEATH.fallback_tick(E, sp, self)
	if r.get("ok") != true:
		_error = "boss_fallback_tick:" + str(r.get("reason"))
		return
	match str(r.outcome):
		"revived":
			counters.fallback_revives += 1
			_cancel_open_death("boss_fallback_revive_34502")
			_push_actor_sync()
		"final":
			_publish_final("fallback_failed_34527", {"anchor": "G34525"})
			_push_actor_sync()

## 사망 상태를 actor 에 반영(AI 미실행 return_update prefix) — HUD/뷰가 actor 스냅샷을 읽는다.
func _push_actor_sync() -> void:
	var frame := _build_frame(_sp)
	frame["pc_sync_only"] = true
	_current_frame = frame
	actor.begin_tick(frame)

func _build_frame(sp: float) -> Dictionary:
	_serial += 1
	var g: Dictionary = main.source_state.read_current_g()
	var opt: Variant = main.source_initialization_services.read_current_options() if is_instance_valid(main.get("source_initialization_services")) else null
	var shake_opt: float = float(opt.get("shake", 100)) if opt is Dictionary and _numv(opt.get("shake")) else 100.0
	var hit_stop_opt: float = float(opt.get("hitStop", 100)) if opt is Dictionary and _numv(opt.get("hitStop")) else 100.0
	var projectiles: Variant = main.get("native_demo_boss_projectiles")
	var drop: int = int(projectiles.read_drop_counter()) if is_instance_valid(projectiles) and projectiles.has_method("read_drop_counter") else 0
	var context := {"frame": float(g.get("frame", main.world.get_native_frame())) if _numv(g.get("frame")) else float(main.world.get_native_frame()),
		"druid_finale": false, "vfx_available": true, "thorn_first": false, "drop_counter": drop,
		"etype_range": PREFIX.ETYPE0_RANGE, "element_color": "#bbbbbb", "shake": shake_opt, "hit_stop": hit_stop_opt,
		"lesson_active": _lesson_active(), "qa_storage_active": false, "aggro_active": false, "aggro_target": null,
		"pc_core": self} # PC-BOSS-CORE: misc 상태 모듈 owner(native_ch1_boss_misc_states.gd)
	var globals := _globals_live()
	for key in ["shake", "_flashT", "_flashCol", "hitStop", "slowMo"]:
		if g.has(key): globals[key] = g[key]
	var stats: Variant = g.get("_pStats")
	return {"ready": true, "serial": _serial, "sp": sp, "player": _player_b(), "context": context, "globals": globals,
		"player_stats": stats.duplicate(true) if stats is Dictionary else null}

## 32685–32701 G._pStats (60f 창, 카이팅 감지; 행동 카운터 증가처는 각 플레이어 owner 소유 — 미이식은 0 유지)
func _update_pstats(sp: float) -> void:
	var g: Dictionary = main.source_state.read_current_g()
	var ps: Variant = g.get("_pStats")
	if not ps is Dictionary:
		ps = {"parryRate": 0, "dashRate": 0, "avgDist": 200, "healRate": 0, "dodgeRate": 0, "aggroRate": 0, "kiteRate": 0,
			"_pH": 0, "_pA": 0, "_dC": 0, "_hC": 0, "_wT": 0, "_atkC": 0, "_kiteC": 0, "_prevDist": 200}
	ps._wT = _n(ps.get("_wT")) + sp
	if E.get("alive") == true:
		var bw: Vector2 = _b2w(_n(E.x), _n(E.y))
		var bd: float = main.player.global_position.distance_to(bw) / effective_scale if effective_scale != 1.0 else main.player.global_position.distance_to(bw)
		var pstate: String = str(main.player.state)
		if (pstate == "wSwing" or pstate == "bowRecover" or pstate == "magicCast") and bd > _n(ps.get("_prevDist")) + 2:
			ps._kiteC = _n(ps.get("_kiteC")) + 1
		ps._prevDist = bd
	if _n(ps._wT) >= 60:
		ps._wT = _n(ps._wT) - 60
		ps.parryRate = _n(ps._pH) / _n(ps._pA) if _n(ps.get("_pA")) > 0 else 0
		ps.dashRate = minf(1, _n(ps._dC) / 10.0)
		ps.healRate = minf(1, _n(ps._hC) / 5.0)
		ps.dodgeRate = minf(1, _n(ps._dC) / 8.0)
		ps.aggroRate = minf(1, _n(ps._atkC) / 30.0)
		ps.kiteRate = minf(1, _n(ps._kiteC) / maxf(1, _n(ps._atkC))) if _n(ps.get("_atkC")) > 0 else 0
		for k in ["_pH", "_pA", "_dC", "_hC", "_atkC", "_kiteC"]:
			ps[k] = FORMULA.js_to_int32(_n(ps.get(k)) * 0.8)
	_g_write({"_pStats": ps})

func _wall_stuck_rescue() -> void:
	var x: float = _n(E.x)
	var y: float = _n(E.y)
	var r: float = _n(E.r)
	if not (_stuck(x, y) or _stuck(x - r, y - r) or _stuck(x + r, y - r) or _stuck(x - r, y + r) or _stuck(x + r, y + r)): return
	for ring in range(1, 6):
		for k in range(8):
			var a: float = k * PI / 4
			var wx: float = x + cos(a) * T * ring
			var wy: float = y + sin(a) * T * ring
			if not _stuck(wx, wy):
				E.x = wx; E.y = wy; E.kb = {"x": 0, "y": 0}
				return
	for ring in range(6, 13):
		for k in range(8):
			var a: float = k * PI / 4
			var wx: float = x + cos(a) * T * ring
			var wy: float = y + sin(a) * T * ring
			if not _stuck(wx, wy):
				E.x = wx; E.y = wy; E.kb = {"x": 0, "y": 0}
				return
	var p: Dictionary = _player_b()
	if pf_can_move(_n(p.x), _n(p.y), r):
		E.x = p.x; E.y = p.y; E.kb = {"x": 0, "y": 0}

func _stuck(bx: float, by: float) -> bool:
	return main.world.is_world_blocked(_b2w(bx, by)) # 32107 _eWallStuck(타일) ↔ MAP11 is_world_blocked

func _sync_body() -> void:
	if is_instance_valid(body) and _numv(E.get("x")) and _numv(E.get("y")):
		body.global_position = _b2w(float(E.x), float(E.y))

# ═══════════════════════════════ 좌표 ═══════════════════════════════
func _b2w(x: float, y: float) -> Vector2:
	return space.to_world_xy(x, y)

func _w2b(v: Vector2) -> Vector2:
	return space.to_boss_xy(v.x, v.y)

func _player_w() -> Dictionary:
	var pl: Node2D = main.player
	var kb: Vector2 = pl.get_native_knockback() if pl.has_method("get_native_knockback") else Vector2.ZERO
	return {"x": pl.global_position.x, "y": pl.global_position.y, "r": float(pl.radius), "facing": (pl.facing as Vector2).angle(),
		"s": str(pl.state), "iframes": float(pl.iframes), "kb": {"x": kb.x, "y": kb.y}}

func _player_b() -> Dictionary:
	return space.player_to_boss(_player_w())

# ═══════════════════════════════ prefix env (pf_*) ═══════════════════════════════
func pf_lesson_active() -> bool: return _lesson_active()
func pf_tile_free(x: float, y: float, r: float) -> bool: return main.world.can_move(_b2w(x, y), space.len_to_world(r)) # MAP11: 타일/오브젝트 구분 없음
func pf_can_move(x: float, y: float, r: float) -> bool: return main.world.can_move(_b2w(x, y), space.len_to_world(r))
func pf_real_wall(x: float, y: float) -> bool: return main.world.is_world_blocked(_b2w(x, y))
func pf_los(x1: float, y1: float, x2: float, y2: float) -> bool: return main.world.has_line_of_sight(_b2w(x1, y1), _b2w(x2, y2))
func pf_ff_dir(x: float, y: float) -> Variant:
	var d: Vector2 = main.world.get_path_direction(_b2w(x, y))
	return null if d == Vector2.ZERO else {"x": d.x, "y": d.y}
func pf_rng(tag: String, line: int) -> float:
	counters.rng_prefix += 1
	return _rng(tag, line)
func pf_present(cmd: String, args: Array, line: int) -> void: _present(cmd, args, line)
func pf_translate(text: String) -> String: return _tr(text)
func pf_rifts() -> Array:
	var rifts: Variant = main.source_state.read_current_g().get("rifts")
	return rifts if rifts is Array else []
func pf_msfx_playing() -> int: return _msfx_playing
func pf_msfx_inc() -> void: _msfx_playing += 1
func pf_hurt_e(e: Dictionary, dmg: int, line: int) -> Dictionary:
	# 38598/38607 hurtE(e,dmg) — ang 없음·opts 없음. 기존 executor 경로(ang=NaN = undefined).
	_set_E(e)
	var r: Dictionary = _hurt_boss(dmg, NAN, 0, {}, line)
	return E.duplicate(true)
func pf_generic_tick(e: Dictionary, p: Dictionary, sp: float) -> Dictionary:
	var started: Dictionary = PROJ.begin_pattern(0, "generic_tick", e, p, sp, _module_context(), _globals_for_module())
	return _run_projectile_module(started, e, p)

# ═══════════════════════════════ receipt 서버 ═══════════════════════════════
func _serve(request: Dictionary) -> Variant:
	if not _live(): return {"ack": false}
	var command: String = str(request.get("command"))
	match command:
		"source_updateE_prefix": return _serve_prefix(request)
		"phase_transition_commit":
			var proposal: Dictionary = request.get("proposal", {})
			if not proposal.get("enemy") is Dictionary: return {"ack": false}
			counters.phase_commits += 1
			_set_E(proposal.enemy)
			return {"ack": true, "enemy_after": proposal.enemy.duplicate(true), "player_after": request.player.duplicate(true)}
		"source_updateE_suffix": return _serve_suffix(request)
		"source_global_write":
			var ev: Dictionary = request.get("event", {})
			counters.global_writes += 1
			_g_write({str(ev.get("field")): ev.get("value")})
			var globals: Dictionary = request.frame.get("globals", {}).duplicate(true)
			globals[str(ev.get("field"))] = ev.get("value")
			return {"ack": true, "globals_after": globals}
		"hurtP":
			var args: Array = request.get("args", [])
			_hurt_player(int(args[0]), args[1] if args.size() > 1 and args[1] is Dictionary else {}, Vector2.ZERO)
			return {"ack": true, "player_after": _readback_player(request.player)}
		"player_kb_add":
			var a: Array = request.get("args", [])
			_player_kb_add(float(a[0]), float(a[1]))
			return {"ack": true}
		"resolve_boss_movement_contact", "resolve_boss_melee_contact", "resolve_boss_erupt_contact":
			return _serve_contact(request)
		"resolve_boss_grab_damage": return _serve_grab_damage(request)
		"apply_boss_player_control": return _serve_player_control(request)
		"resolve_druid_orb_contact": return _serve_orb_contact(request)
		"_T":
			return {"ack": true, "value": _tr(str(request.args[0]))}
		"_bossSfx":
			return {"ack": true, "value": BOSS_SFX0.duplicate() if int(request.args[0]) == 0 else null}
		"_reviveVFX":
			_present("_reviveVFX", request.get("args", []), int(request.get("source_line", 0)))
			var g: Dictionary = main.source_state.read_current_g()
			return {"ack": true, "slow_mo_after": _n(g.get("slowMo")), "hit_stop_scale": float(_current_frame.get("context", {}).get("hit_stop", 100))}
		"write_enemy_fields":
			return {"ack": true} # actor 가 packet.enemy 로 이미 반영 — 정본 E 는 suffix 에서 동기화
		"write_globals":
			var w: Variant = request.args[0] if request.get("args", []).size() > 0 else {}
			if w is Dictionary: _g_write(w)
			return {"ack": true}
		"append_global_queue":
			var name: String = str(request.args[0])
			var g: Dictionary = main.source_state.read_current_g()
			var list: Array = (g.get(name) as Array).duplicate(true) if g.get(name) is Array else []
			list.append(request.args[1].duplicate(true) if request.args[1] is Dictionary else request.args[1])
			_g_write({name: list})
			return {"ack": true}
		"ensure_global_queue":
			var qn: String = str(request.args[0])
			if not main.source_state.read_current_g().get(qn) is Array: _g_write({qn: []})
			return {"ack": true}
		"atkTicketRelease": return {"ack": true} # 38580: 보스는 _hasAtkTicket 미보유
		_:
			_present(command, request.get("args", []), int(request.get("source_line", 0)))
			return {"ack": true, "value": null}

func _serve_prefix(request: Dictionary) -> Dictionary:
	counters.prefix += 1
	var frame: Dictionary = request.get("frame", {})
	if frame.get("pc_sync_only") == true:
		return {"ack": true, "enemy_after": E.duplicate(true), "player_after": request.player.duplicate(true),
			"context_after": frame.get("context", {}).duplicate(true), "globals_after": frame.get("globals", {}).duplicate(true),
			"through_source_line": 40443, "cached_distance": 0.0, "sp_after": float(frame.get("sp", 0)), "return_update": true}
	var result: Dictionary = PREFIX.run(E, request.player, float(frame.get("sp", _sp)), self)
	if result.get("status") != "READY":
		_prefix_reason = str(result.get("reason"))
		counters.not_ready += 1
		_note_unported("prefix:" + _prefix_reason)
		# fail-closed: AI 미진행(정지) — 가짜 행동 없이 이 프레임은 return_update
		return {"ack": true, "enemy_after": E.duplicate(true), "player_after": request.player.duplicate(true),
			"context_after": frame.get("context", {}).duplicate(true), "globals_after": frame.get("globals", {}).duplicate(true),
			"through_source_line": 40443, "cached_distance": 0.0, "sp_after": float(frame.get("sp", 0)), "return_update": true}
	_prefix_reason = ""
	if result.get("return_update") == true: counters.prefix_early += 1
	_set_E(result.enemy)
	var globals: Dictionary = frame.get("globals", {}).duplicate(true)
	var g: Dictionary = main.source_state.read_current_g()
	for key in globals.keys():
		if g.has(key): globals[key] = g[key] if not g[key] is Array and not g[key] is Dictionary else g[key].duplicate(true)
	return {"ack": true, "enemy_after": E.duplicate(true), "player_after": result.player.duplicate(true),
		"context_after": frame.get("context", {}).duplicate(true), "globals_after": globals,
		"through_source_line": 40443, "cached_distance": float(result.distance), "sp_after": float(frame.get("sp", 0)),
		"return_update": result.get("return_update") == true}

## 41405–41408
func _serve_suffix(request: Dictionary) -> Dictionary:
	counters.suffix += 1
	var e: Dictionary = request.enemy.duplicate(true)
	# 보호 필드는 정본 E(동기 응답 사이에 바뀌지 않음) — actor 사본과 동일해야 한다.
	var g: Dictionary = main.source_state.read_current_g()
	if g.get("_bossArena") == true and e.get("ib") == true and e.get("alive") == true:
		PREFIX._push_out_wall(e, self)
	if request.get("player_stats") is Dictionary:
		_g_write({"_pStats": request.player_stats.duplicate(true)})
	_set_E(e)
	return {"ack": true, "enemy_after": e.duplicate(true), "player_after": request.player.duplicate(true)}

func _module_context() -> Dictionary:
	return _current_frame.get("context", {}).duplicate(true)

func _globals_for_module() -> Dictionary:
	return _current_frame.get("globals", {}).duplicate(true)

## BC09 모듈 하나를 동기 실행(prefix 안의 generic 탄 발사·queue 위상 리듬탄/ORB)
func _run_projectile_module(started: Dictionary, e: Dictionary, p: Dictionary) -> Dictionary:
	if started.get("status") != "READY": return {"ok": false, "reason": str(started.get("reason"))}
	var token: Variant = started.get("continuation")
	var packet: Dictionary = PROJ.next_pattern(token, null, Callable(self, "_rng_tag")) if token is Dictionary else started
	var guard := 0
	var cur_e: Dictionary = e.duplicate(true)
	var cur_p: Dictionary = p.duplicate(true)
	while guard < 2000:
		guard += 1
		if packet.get("status") != "READY": return {"ok": false, "reason": str(packet.get("reason"))}
		if packet.get("enemy") is Dictionary: cur_e = packet.enemy.duplicate(true)
		if packet.get("player") is Dictionary: cur_p = packet.player.duplicate(true)
		for ev in packet.get("events", []):
			if ev.get("kind") == "global_write": _g_write({str(ev.field): ev.value})
		if packet.get("done") == true: break
		var cmd: Variant = packet.get("command")
		if not cmd is Dictionary: return {"ok": false, "reason": "module_command_missing"}
		var response: Variant = _serve_module_command(cmd, cur_e, cur_p)
		if not response is Dictionary: return {"ok": false, "reason": "module_owner_missing:" + str(cmd.get("command"))}
		packet = PROJ.next_pattern(packet.continuation, response, Callable(self, "_rng_tag"))
	return {"ok": true, "e": cur_e, "p": cur_p}

func _serve_module_command(cmd: Dictionary, e: Dictionary, p: Dictionary) -> Variant:
	var name: String = str(cmd.get("command"))
	match name:
		"spawnProj_owner", "_spawnBossProjectile":
			var projectiles: Variant = main.get("native_demo_boss_projectiles")
			if not is_instance_valid(projectiles): return null
			return projectiles.call("_birth_request", {"command": name, "args": cmd.get("args", []), "enemy": e, "frame": _current_frame})
		"resolve_druid_orb_contact":
			return _serve_orb_contact({"args": cmd.get("args", []), "enemy": e, "player": p})
		"canMv":
			var a: Array = cmd.args
			return {"ack": true, "value": pf_can_move(float(a[0]), float(a[1]), float(a[2]))}
		_:
			return _serve({"command": name, "args": cmd.get("args", []), "source_line": cmd.get("source_line", 0), "enemy": e, "player": p, "frame": _current_frame})

func _rng_tag(_tag: String) -> float:
	return main.world.sample_native_random_unit()

func _rng(_tag: String, _line: int) -> float:
	return main.world.sample_native_random_unit()

# ═══════════════════════════════ 보스 → 플레이어 ═══════════════════════════════
func _hurt_player(dmg: int, opts: Dictionary, dir_b: Vector2) -> Dictionary:
	counters.hurtP += 1
	var pl: Node2D = main.player
	if pl.has_method("is_native_lesson_target") and false: pass
	var dtype: String = str(opts.get("dtype", "phys"))
	if dtype not in ["magic", "parry", "phys"]: dtype = "phys"
	var before: float = float(pl.hp)
	pl.receive_damage(dmg, dtype, dir_b)
	var applied: float = before - float(pl.hp)
	if applied > 0: counters.player_damage += applied
	return {"applied": applied}

func _player_kb_add(kx: float, ky: float) -> void:
	var pl: Node2D = main.player
	if pl.has_method("apply_native_posthurt_knockback"):
		pl.apply_native_posthurt_knockback(Vector2(space.len_to_world(kx), space.len_to_world(ky)))

func _player_kb_set(kx: float, ky: float) -> void:
	var pl: Node2D = main.player
	if pl.has_method("apply_native_posthurt_knockback") and pl.has_method("get_native_knockback"):
		var target := Vector2(space.len_to_world(kx), space.len_to_world(ky))
		pl.apply_native_posthurt_knockback(target - pl.get_native_knockback())

func _readback_player(before: Dictionary) -> Dictionary:
	var out: Dictionary = before.duplicate(true)
	var now: Dictionary = _player_b()
	for k in now: out[k] = now[k]
	return out

## isPWin(38469) — 기존 PC M29 서비스 실시간 평가 재사용
func _is_p_win() -> bool:
	var svc: Variant = main.get("native_m29_contact")
	if svc == null or not svc.has_method("read_parry_window"): return false
	var w: Dictionary = svc.read_parry_window()
	return w.get("ready") == true and w.get("value") == true

## _pd = ~~((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))*K*pParryDmg())
func _parry_damage(k: float) -> int:
	var src: Dictionary = main.read_native_q_parry_source()
	if src.get("ready") != true: return -1
	var p: Dictionary = src.p
	var inv: Variant = main.source_state.read_current_inventory()
	var wp: Variant = inv.get("equipped", {}).get("weapon") if inv is Dictionary else null
	var watk: float = _n(wp.get("atk")) if wp is Dictionary and PREFIX._t(wp.get("atk")) else 0.0
	var wenh: float = _n(wp.get("enh")) if wp is Dictionary and PREFIX._t(wp.get("enh")) else 0.0
	var base: float = _n(p.get("baseAtk"))
	return FORMULA.js_to_int32((base + watk + wenh * 0.25) * k * float(src.stats.parry_dmg_mul))

## doParry(e.atk,e.x,e.y,false,e.el) 기존 writer 부분집합(M29 와 동일: 보상·iframes25·poise+1) + parryBank
func _do_parry(bank_add: float) -> bool:
	var src: Dictionary = main.read_native_q_parry_source()
	if src.get("ready") != true: return false
	var bank: float = main.read_native_source_parry_bank(src.p)
	if not main.commit_native_q_control_state({"parryBank": bank + bank_add}): return false
	var reward: int = main.native_source_parry_reward(float(src.stats.parry_bonus), float(src.regen_lv), 1.0)
	var res: Dictionary = main.source_resources.commit_native_q_parry_reward(main, float(reward))
	counters.parries += 1
	return res.get("accepted") == true

const CONTACT_TABLE := {
	"idle": {"m": 0.8, "elmul": false, "k": 0.0, "stun": 0, "kb": 0.0, "parry": false},
	"charge": {"m": 2.0, "elmul": true, "k": 5.0, "stun": 90, "kb": 12.0, "parry": true},
	"jump": {"m": 1.8, "elmul": true, "k": 0.0, "stun": 0, "kb": 15.0, "parry": false},
	"dash": {"m": 1.3, "elmul": true, "k": 4.0, "stun": 90, "kb": 8.0, "parry": true},
	"slash": {"m": 1.5, "elmul": true, "k": 3.0, "stun": 60, "kb": 7.0, "parry": true},
	"slam": {"m": 2.2, "elmul": true, "k": 4.0, "stun": 80, "kb": 14.0, "parry": true},
	"sweep": {"m": 1.8, "elmul": true, "k": 3.0, "stun": 60, "kb": 10.0, "parry": true},
	"erupt": {"m": 2.2, "elmul": true, "k": 4.0, "stun": 60, "kb": 14.0, "parry": true}}

## 40500–40503 / 40680–40686 / 40705–40707 / 40957–40965 / 41088–41095 / 41125–41131 / 41156–41163 / 41064–41070
func _serve_contact(request: Dictionary) -> Dictionary:
	counters.contacts += 1
	var d: Dictionary = request.args[0] if request.get("args", []).size() > 0 and request.args[0] is Dictionary else {}
	var family: String = str(d.get("family", ""))
	if request.command == "resolve_boss_erupt_contact": family = "erupt"
	if not CONTACT_TABLE.has(family): return {"ack": false}
	var row: Dictionary = CONTACT_TABLE[family]
	_set_E(request.enemy)
	var pl: Node2D = main.player
	var p_b: Dictionary = _player_b()
	var center: Vector2 = Vector2(_n(E.x), _n(E.y))
	if family == "erupt" and d.get("center") is Array: center = Vector2(float(d.center[0]), float(d.center[1]))
	var parried := false
	if row.parry and _is_p_win():
		parried = true
		var pd: int = _parry_damage(float(row.k))
		if family == "charge" and _player_has_detonate():
			# 40682 P.skills.detonate: 은행만, stunned 60, 피해 없음
			E.stunned = 60
			_present("addTxt", [p_b.x, _n(p_b.y) - 25, {"call": "_T", "args": ["⚡패링!"]}, "#ffdd00", 35], 40682)
			_do_parry(float(maxi(pd, 0)))
		else:
			E.stunned = row.stun
			if family == "charge":
				E.kb = {"x": cos(_n(E.facing) + PI) * 18, "y": sin(_n(E.facing) + PI) * 18}
			if pd > 0: _hurt_boss(pd, _n(E.facing) + PI, 0, {}, 0)
			_do_parry(float(maxi(pd, 0)))
		_boss_poise_hit(20)
	elif str(pl.state) != "charge" and (family != "idle" or true):
		if family == "idle" and false: pass
		var dmg: int = FORMULA.js_to_int32(_n(E.atk) * float(row.m)) # elMul(EL.P, armor) = 1 (14344: a===P → 1)
		var dir_w: Vector2 = pl.global_position - _b2w(center.x, center.y)
		_hurt_player(dmg, {}, dir_w)
		if family == "erupt":
			_note_unported("player_status:poison+4/webSlow90")
			_present("addTxt", [p_b.x, _n(p_b.y) - 16, {"call": "_T", "args": ["☠속박!"]}, "#66dd22", 24], 41069)
		if float(row.kb) > 0:
			var ang: float = atan2(_n(p_b.y) - center.y, _n(p_b.x) - center.x)
			_player_kb_add(cos(ang) * float(row.kb), sin(ang) * float(row.kb))
	if family == "idle" and not parried:
		pass
	_last_contact = {"family": family, "parried": parried, "line": request.get("source_line", 0)}
	return {"ack": true, "enemy_after": E.duplicate(true), "player_after": _readback_player(request.player)}

func _player_has_detonate() -> bool:
	var p: Variant = main.source_state.read_current_p()
	return p is Dictionary and p.get("skills") is Dictionary and PREFIX._t(p.skills.get("detonate"))

## 40857 / 40862 hurtP(~~(e.atk*M*elMul),opts)
func _serve_grab_damage(request: Dictionary) -> Dictionary:
	var d: Dictionary = request.args[0]
	_set_E(request.enemy)
	var dmg: int = FORMULA.js_to_int32(_n(d.get("atk")) * float(d.get("multiplier", 0)))
	var opts: Dictionary = d.options if d.get("options") is Dictionary else {}
	_hurt_player(dmg, opts, Vector2.ZERO)
	return {"ack": true, "enemy_after": E.duplicate(true), "player_after": _readback_player(request.player)}

## 40854–40855 P.x/P.y/P.kb=0, 40863–40864 P.kb=…, P.iframes=30
func _serve_player_control(request: Dictionary) -> Dictionary:
	var d: Dictionary = request.args[0]
	_set_E(request.enemy)
	var pl: Node2D = main.player
	var p_b: Dictionary = _player_b()
	var nx: Variant = null
	var ny: Variant = null
	var kx: Variant = null
	var ky: Variant = null
	for a in d.get("assignments", []):
		match str(a.get("path")):
			"x": nx = float(a.value)
			"y": ny = float(a.value)
			"kb.x": kx = float(a.value)
			"kb.y": ky = float(a.value)
			"iframes": pl.iframes = float(a.value)
	if nx != null or ny != null:
		var w: Vector2 = _b2w(float(nx) if nx != null else _n(p_b.x), float(ny) if ny != null else _n(p_b.y))
		pl.global_position = w
	if kx != null or ky != null:
		var cur: Vector2 = pl.get_native_knockback()
		_player_kb_set(float(kx) if kx != null else space.len_to_boss(cur.x), float(ky) if ky != null else space.len_to_boss(cur.y))
	return {"ack": true, "enemy_after": E.duplicate(true), "player_after": _readback_player(request.player)}

## 37116–37123 ORB 접촉(패링 불가 원칙이나 isPWin 은 호출): R90 적 AOE·피해/독/속박
func _serve_orb_contact(request: Dictionary) -> Dictionary:
	var d: Dictionary = request.args[0]
	var orb: Dictionary = d.get("orb", {})
	var pw: bool = _is_p_win()
	var ob_dmg: int = int(d.get("aoe_damage", 40))
	# 적 AOE(R90): 보스 자신도 shQuery 대상 — hurtE(re,_obDmg,ang,false,{noPoise:true},EL.P)
	var ob: Vector2 = Vector2(_n(orb.get("x")), _n(orb.get("y")))
	if E.get("alive") == true and Vector2(_n(E.x), _n(E.y)).distance_to(ob) <= 90.0:
		_hurt_boss(ob_dmg, atan2(_n(E.y) - ob.y, _n(E.x) - ob.x), 0, {"noPoise": true}, 37118)
	_note_unported("orb_aoe_other_enemies")
	if pw:
		_do_parry(float(ob_dmg))
	elif float(main.player.iframes) <= 0:
		_hurt_player(FORMULA.js_to_int32(_n(orb.get("dmg"))), {}, Vector2.ZERO)
		_note_unported("player_status:poison+3/webSlow80")
	return {"ack": true, "enemy_after": E.duplicate(true), "orb_after": orb.duplicate(true),
		"player_after": _readback_player(request.get("player", _player_b()))}

# ═══════════════════════════════ 플레이어 → 보스 (hurtE) ═══════════════════════════════
func _hurt_boss(dmg: int, ang: float, atk_el: int, opts: Dictionary, line: int) -> Dictionary:
	if not is_instance_valid(body): return {"ok": false}
	var exec: RefCounted = preload("res://scripts/native_normal_enemy_hurte.gd").new()
	var out: Dictionary = exec.execute(main, main.world, body, dmg, ang, atk_el, opts)
	return out

func _boss_poise_hit(amount: int) -> void:
	if is_instance_valid(body):
		body.apply_native_normal_enemy_poise_core(amount)

func observe_boss_hurte_event(kind: String, payload: Dictionary) -> void:
	if kind == "native_hurte_damage":
		counters.boss_hits += 1
		counters.boss_damage += _n(payload.get("amount")) + _n(payload.get("absorbed"))

## 42515–42649 보스 사망 분기 (executor 가 hp<=0 직후 호출). 반환 {ok, revived, pending, reason}
func resolve_boss_death(_b: Node, executor: Object, _ctx: Dictionary) -> Dictionary:
	counters.deaths += 1
	_death_exec = executor
	var r1: Dictionary = DEATH.immediate(E, self)
	if r1.get("ok") != true:
		_death_exec = null
		return {"ok": false, "reason": r1.get("reason")}
	if r1.get("revived") == true:
		counters.immediate_revives += 1
		_death_exec = null
		_sync_body()
		return {"ok": true, "revived": true, "pending": false}
	var r2: Dictionary = DEATH.fallback_reserve(E, self)
	_death_exec = null
	if r2.get("ok") != true: return {"ok": false, "reason": r2.get("reason")}
	return {"ok": true, "revived": false, "pending": r2.get("pending") == true}

# ── 사망 판정 env(bd_*) — native_demo11_boss_death.gd ──
func bd_affix(id: String, line: int) -> Variant:
	if _death_exec != null: return _death_exec.call("_affix", id, line)
	var b: Dictionary = main.source_providers.get_provider_bundle() if main.get("source_providers") != null else {}
	var r: Dictionary = b.affix.eq_affix(id) if b.get("affix") != null else {}
	return float(r.get("value", 0)) if str(r.get("status")) in ["READY", "READY_PARTIAL_AFTER_SOURCE_THROW"] else null
func bd_rng(tag: String, line: int) -> Variant:
	if _death_exec != null: return _death_exec.call("_rand", line, tag)
	return _rng(tag, line)
func bd_text(x: Variant, y: Variant, text: String, col: String, life: Variant) -> void: _text(x, y, text, col, life)
func bd_present(cmd: String, args: Array, line: int) -> void: _present(cmd, args, line)
func bd_hurt_player(dmg: int, opts: Dictionary) -> void: _hurt_player(dmg, opts, Vector2.ZERO)
func bd_kb_add(kx: float, ky: float) -> void: _player_kb_add(kx, ky)
func bd_can_move(x: float, y: float, r: float) -> bool: return pf_can_move(x, y, r)
func bd_safe_pt(x: float, y: float, r: float) -> Variant:
	var w: Vector2 = _b2w(x, y)
	var v: Variant = main.world.native_safe_point(w.x, w.y, space.len_to_world(r))
	if not v is Dictionary: return null
	var b: Vector2 = _w2b(Vector2(float(v.x), float(v.y)))
	return {"x": b.x, "y": b.y}
func bd_spawn_proj(props: Dictionary) -> void: _spawn_boss_projectile(props)
func bd_g_write(fields: Dictionary) -> void: _g_write(fields)
func bd_tr(text: String) -> String: return _tr(text)
func bd_lang_ko() -> bool:
	var lang: Dictionary = main.get_native_startup_language_snapshot() if main.has_method("get_native_startup_language_snapshot") else {}
	return str(lang.get("language", "ko")) == "ko"
func bd_player_full_hp() -> bool: return float(main.player.hp) >= float(main.player.max_hp)
func bd_player() -> Dictionary: return _player_b()
func bd_killed_bosses() -> Array:
	var kb: Variant = main.source_state.read_current_g().get("_killedBosses")
	return kb if kb is Array else []


func _spawn_boss_projectile(props: Dictionary) -> void:
	var projectiles: Variant = main.get("native_demo_boss_projectiles")
	if not is_instance_valid(projectiles) or _last_frame.is_empty():
		_note_unported("boss_projectile_birth_without_frame")
		return
	var frame: Dictionary = _last_frame.duplicate(true)
	projectiles.call("_birth_request", {"command": "_spawnBossProjectile", "args": [props], "enemy": E.duplicate(true), "frame": frame})

## 42733 앵커 발행(보스): 2차 판정 대기면 revival_pending, 아니면 final
func publish_boss_death(_b: Node, ctx: Dictionary) -> Dictionary:
	# 42733 앵커(42702 사망 확정 뒤) → 42734/42735 문구·플래시
	var r: Dictionary
	if _n(E.get("_reviveTimer")) > 0:
		r = _publish("revival_pending", ctx)
	else:
		r = _publish_final("hurte_no_fallback_42733", ctx)
	var w: Vector2 = body.global_position if is_instance_valid(body) else Vector2.ZERO
	var b: Vector2 = _w2b(w)
	if PREFIX._t(E.get("_bossRevJudged")):
		_text(b.x, b.y - 45, _tr("💀 부활 판정 중..."), "#ff8844", 90)
		_g_write({"_flashT": 3, "_flashCol": "#ff4400"})
	else:
		_text(b.x, b.y - 45, _tr("☠ 완전 사망!"), "#ff4400", 90)
		_g_write({"_flashT": 6, "_flashCol": "#ffffff", "_chromaT": 5})
	return r

func _publish_final(why: String, ctx: Dictionary = {}) -> Dictionary:
	if _final_published: return {"published": false, "reason": "final_already_published"}
	var r: Dictionary = _publish("final", ctx)
	if r.get("published") == true:
		_final_published = true
		counters.final_deaths += 1
		# G.bossAlive 해제는 원본 30프레임 clear poll(41816–41838) 소관 = Mac37 encounter/commit. PC 는 쓰지 않는다.
	r["why"] = why
	return r

func _publish(phase: String, ctx: Dictionary) -> Dictionary:
	var bus: Variant = main.call("_final_enemy_death_bus") if main.has_method("_final_enemy_death_bus") else main.get("source_final_enemy_death")
	if bus == null or not bus.has_method("publish_boss"): return {"published": false, "reason": "boss_publish_bus_missing"}
	var c: Dictionary = ctx.duplicate(true)
	c["revival_pending"] = phase == "revival_pending"
	return bus.publish_boss(actor, body, c)

func _cancel_open_death(reason: String) -> void:
	var bus: Variant = main.get("source_final_enemy_death")
	if bus != null and bus.has_method("cancel_for_actor"):
		bus.cancel_for_actor(actor, reason)

# ═══════════════════════════════ queue 위상: 리듬탄·ORB ═══════════════════════════════
func advance_queue(ticks: float, _frame: float, _enemies: Array) -> void:
	if not _live() or ticks <= 0.0 or not is_instance_valid(body) or main.get_tree().paused: return
	if _current_frame.is_empty(): return
	_q_sp = ticks
	# 34678–34687 보스 지뢰(투사체 루프) → 37015–37079 전역 큐 → 37080–37126 리듬탄·ORB → 37129 용암
	if not _mines.is_empty():
		_mines = QUEUES.tick_mines(_mines, ticks, self)
	var g: Dictionary = main.source_state.read_current_g()
	var lists := {}
	for name in ["_chaseAoes", "_fissures", "_tideWaves", "_seekerMines", "_poisonPools"]:
		if g.get(name) is Array: lists[name] = g[name]
	if not lists.is_empty():
		var updated: Dictionary = QUEUES.tick(lists, ticks, self, 0)
		if not updated.is_empty(): _g_write(updated)
	if g.get("bossAlive") == true:
		var p: Dictionary = _player_b()
		var e: Dictionary = E.duplicate(true)
		for mode in ["rhythm", "orbs"]:
			var ctx: Dictionary = _module_context()
			var projectiles: Variant = main.get("native_demo_boss_projectiles")
			if is_instance_valid(projectiles) and projectiles.has_method("read_drop_counter"): ctx["drop_counter"] = int(projectiles.read_drop_counter())
			var before_volley: float = _n(main.source_state.read_current_g().get("_druidParryVolley"))
			var started: Dictionary = PROJ.begin_pattern(0, mode, e, p, ticks, ctx, _globals_live())
			if started.get("status") != "READY":
				_note_unported("queue_" + mode + ":" + str(started.get("reason")))
				continue
			var r: Dictionary = _run_projectile_module(started, e, p)
			if r.get("ok") != true:
				_note_unported("queue_" + mode + ":" + str(r.get("reason")))
			if mode == "rhythm" and _n(main.source_state.read_current_g().get("_druidParryVolley")) > before_volley: counters.rhythm_volleys += 1
	var lava: Variant = QUEUES.tick_lava(main.source_state.read_current_g(), ticks, self)
	if lava is Array: _g_write({"_lavaPools": lava})

# ── 전역 큐 env(q_*) — native_ch1_boss_queues.gd ──
func q_player() -> Dictionary: return _player_b()
func q_hurt(dmg: int, opts: Dictionary) -> void:
	counters.queue_hits += 1
	_hurt_player(dmg, opts, Vector2.ZERO)
func q_kb_add(kx: float, ky: float) -> void: _player_kb_add(kx, ky)
func q_is_p_win() -> bool: return _is_p_win()
func q_parry(bank_add: int, _in_dmg: float) -> void: _do_parry(float(bank_add))
func q_rng(tag: String, line: int) -> float: return _rng(tag, line)
func q_present(cmd: String, args: Array, line: int) -> void: _present(cmd, args, line)
func q_text(x: Variant, y: Variant, text: String, col: String, life: Variant) -> void: _text(x, y, text, col, life)
func q_shake(n: float) -> void: _shake(n)
func q_shake_set(n: float) -> void:
	var opt: Variant = main.source_initialization_services.read_current_options() if is_instance_valid(main.get("source_initialization_services")) else null
	var s: float = float(opt.get("shake", 100)) if opt is Dictionary and _numv(opt.get("shake")) else 100.0
	_g_write({"shake": n * s / 100.0})
func q_tr(text: String) -> String: return _tr(text)
func q_status(field: String, _value: Variant) -> void: _note_unported("player_status:" + field)
func q_el_mul(a: int) -> float:
	var inv: Variant = main.source_state.read_current_inventory()
	var armor: Variant = inv.get("equipped", {}).get("armor") if inv is Dictionary else null
	var d: int = int(_n(armor.get("el"))) if armor is Dictionary else 0
	return QUEUES.el_mul(a, d)

# ── 미이식 상태 모듈 owner(misc_*) — native_ch1_boss_misc_states.gd ──
func misc_present(cmd: String, args: Array, line: int) -> void: _present(cmd, args, line)
func misc_g_write(fields: Dictionary) -> void: _g_write(fields)
func misc_text(x: Variant, y: Variant, text: String, col: String, life: Variant) -> void: _text(x, y, text, col, life)
func misc_L(ko: String, en: String) -> String: return ko if bd_lang_ko() else en
func misc_hurt(e: Dictionary, p: Dictionary, dmg: int, opts: Dictionary, _line: int) -> Dictionary:
	_set_E(e)
	_hurt_player(dmg, opts, Vector2.ZERO)
	return {"e": E.duplicate(true), "p": _readback_player(p)}
func misc_kb_add(p: Dictionary, kx: float, ky: float) -> Dictionary:
	_player_kb_add(kx, ky)
	return _readback_player(p)
func misc_is_p_win() -> bool: return _is_p_win()
func misc_parry(bank_add: int) -> void: _do_parry(float(bank_add))
func misc_poise_hit(e: Dictionary, amount: int) -> Dictionary:
	_set_E(e)
	_boss_poise_hit(amount)
	return E.duplicate(true)
func misc_spawn_projectile(e: Dictionary, props: Dictionary, _line: int) -> void:
	var projectiles: Variant = main.get("native_demo_boss_projectiles")
	if not is_instance_valid(projectiles): return
	projectiles.call("_birth_request", {"command": "_spawnBossProjectile", "args": [props], "enemy": e.duplicate(true), "frame": _current_frame})
func misc_spawn_mine(_e: Dictionary, props: Dictionary) -> void:
	# 16938 wrapper(_druidPoison si0) → 16956 독 class: el=EL.P, col 녹색. 정지탄이라 밀도/배율 후처리 없음(16962).
	var m: Dictionary = props.duplicate(true)
	m._druidPoison = true
	m.el = 0
	m.col = "#66dd22"
	_mines.append(m)
	counters.mines_spawned += 1
func misc_append_queue(name: String, item: Dictionary) -> void:
	var g: Dictionary = main.source_state.read_current_g()
	var list: Array = (g.get(name) as Array).duplicate(true) if g.get(name) is Array else []
	list.append(item)
	_g_write({name: list})
func misc_summon_unported(_x: float, _y: float, et: int, _el: int) -> void:
	counters.summon_unported += 1
	_note_unported("summon_mkEn_etype" + str(et))

func _globals_live() -> Dictionary:
	var g: Dictionary = main.source_state.read_current_g()
	var out := {}
	for key in ["_druidParryT", "_druidOrbT", "_druidOrbs", "_druidParryVolley", "bossAlive", "frame", "mw", "mh"]:
		if g.has(key): out[key] = g[key] if not g[key] is Array and not g[key] is Dictionary else g[key].duplicate(true)
	# G.frame/mw/mh 가 Godot G 에 없으면(MAP11) World 프레임·옛 8000px 맵 크기(200타일)를 읽기 전용으로 공급.
	if not _numv(out.get("frame")): out["frame"] = float(int(main.world.get_native_frame()))
	if not _numv(out.get("mw")): out["mw"] = 200
	if not _numv(out.get("mh")): out["mh"] = 200
	if not out.get("bossAlive") is bool: out["bossAlive"] = g.get("bossAlive") == true
	return out

# ═══════════════════════════════ 보스 투사체 → 플레이어 ═══════════════════════════════
## Mac registry 가 매 이동 뒤 호출. 원본 적 탄→플레이어 일반 경로(34845–34847 판정 반경, 35043 게이트,
## 35044 Q 마법 반사 = 기존 Q owner, 35089 일반 피해)만 이식. E(물리) 패링·빨콩/흰/다크/무지개 전용 분기·회전 흡수는
## 보호 Q/E 소유라 미이식(카운터 기록) — 그 경우에도 원본 일반 피해 식으로 떨어진다(계약 §9).
func _projectile_contact(request: Dictionary) -> Dictionary:
	counters.projectile_contacts += 1
	var node: Variant = request.get("node")
	if not is_instance_valid(node) or not _live(): return {"ack": true, "action": "keep"}
	var pl: Node2D = main.player
	var raw: Dictionary = request.get("projectile", {})
	if raw.get("friendly") == true: return {"ack": true, "action": "keep"}
	var before: Vector2 = request.get("before", node.global_position)
	var after: Vector2 = request.get("after", node.global_position)
	var seg := after - before
	var pt: Vector2 = pl.global_position
	var dist: float = after.distance_to(pt)
	if seg.length_squared() > 1.0:
		var t: float = clampf((pt - before).dot(seg) / seg.length_squared(), 0.0, 1.0)
		dist = minf(dist, (before + seg * t).distance_to(pt))
	# 34847 _pCollR = P.r + (p.sz||1)*3, 일반 판정 _normalR = _pCollR + 4 (패링 창 밖)
	var sz: float = _n(raw.get("sz")) if PREFIX._t(raw.get("sz")) else 1.0
	var coll_r: float = float(pl.radius) + space.len_to_world(sz * 3.0)
	if dist >= coll_r + 4.0: return {"ack": true, "action": "keep"}
	if float(pl.hp) <= 0.0: return {"ack": true, "action": "keep"}
	var reaction: Dictionary = pl.try_native_q_projectile_reflection(node, dist) if pl.has_method("try_native_q_projectile_reflection") else {}
	if reaction.get("reflected") == true:
		counters.projectile_reflected += 1
		return {"ack": true, "action": "retire"}
	if float(pl.iframes) > 0.0 or str(pl.state) == "charge": return {"ack": true, "action": "keep"}
	# 35089 일반 피해: ~~((p.dmg||10)*elMul(p.el,ar().el)), dtype redBean?'parry':'magic', knockback=정규화 속도×2
	var base_dmg: float = _n(raw.get("dmg")) if PREFIX._t(raw.get("dmg")) else 10.0
	var dmg: int = FORMULA.js_to_int32(base_dmg * q_el_mul(int(_n(raw.get("el")))))
	var red: bool = raw.get("redBean", false) == true
	var v := Vector2(_n(raw.get("vx")), _n(raw.get("vy")))
	var kb := Vector2(0, 2)
	if v.length() > 0.001: kb = v.normalized() * 2.0
	elif (pt - after).length() > 0.001: kb = (pt - after).normalized() * 2.0
	var before_hp: float = float(pl.hp)
	pl.receive_damage(dmg, "parry" if red else "magic", kb, space.len_to_world(kb.length()))
	if before_hp > float(pl.hp): counters.player_damage += before_hp - float(pl.hp)
	counters.projectile_hits += 1
	if raw.get("blackBean", false) or raw.get("gbBean", false) or raw.get("bwBean", false) or raw.get("parryClass") == "physical":
		_note_unported("projectile_special_or_E_parry_branch")
	# 35090 빨콩 화상(독 드루이드 탄 제외)
	if red and not raw.get("_druidPoison", false) and pl.has_method("apply_native_burn"):
		pl.apply_native_burn(dmg * 2.0)
	return {"ack": true, "action": "retire"}

# ═══════════════════════════════ 표시 ═══════════════════════════════
func _present(cmd: String, args: Array, line: int) -> void:
	match cmd:
		"addTxt":
			if args.size() >= 4:
				var text: Variant = args[2]
				if text is Dictionary and text.get("call") == "_T": text = _tr(str(text.args[0]))
				_text(args[0], args[1], str(text), str(args[3]), args[4] if args.size() > 4 else 30)
				counters.presentation_ported += 1
		"addParts":
			if args.size() >= 4:
				main.world.emit_native_parts(_b2w(_n(args[0]), _n(args[1])), str(args[2]), int(_n(args[3])))
				counters.presentation_ported += 1
		"poolPart":
			if args.size() >= 7:
				_present_pool_part(_n(args[0]), _n(args[1]), _n(args[2]), _n(args[3]), str(args[4]), _n(args[5]), _n(args[6]))
		"shake":
			if args.size() >= 1: _shake(_n(args[0]))
		"_reviveVFX":
			# 41579: poolPart partN×(속도·크기·수명 RNG) — 시각 미이식(비소비 관례), shake·flash 는 G
			var o: Dictionary = args[4] if args.size() > 4 and args[4] is Dictionary else {}
			if _numv(o.get("shake")): _shake(float(o.shake))
			if _numv(o.get("flash")): _g_write({"_flashT": float(o.flash)})
			_unported_note("_reviveVFX_particles")
		_:
			_unported_note(cmd)

func _present_pool_part(x: float, y: float, vx: float, vy: float, col: String, sz: float, life: float) -> void:
	if not Color.html_is_valid(col):
		_unported_note("poolPart_color:" + col)
		return
	main.world.emit_native_source_particle({"position": _b2w(x, y), "velocity": Vector2(space.len_to_world(vx), space.len_to_world(vy)),
		"color": Color(col), "size": maxf(0.01, sz), "life_ticks": maxf(0.01, life), "render_owner": "pc_boss_core"})
	counters.presentation_ported += 1

func _text(x: Variant, y: Variant, text: String, col: String, life: Variant) -> void:
	var adapter: Variant = main.world.get_node_or_null("NativeFloatingText")
	var w: Vector2 = _b2w(_n(x), _n(y))
	if is_instance_valid(adapter) and adapter.has_method("emit_native_text"):
		adapter.emit_native_text(w.x, w.y, text, col, life)

func _shake(n: float) -> void:
	var opt: Variant = main.source_initialization_services.read_current_options() if is_instance_valid(main.get("source_initialization_services")) else null
	var s: float = float(opt.get("shake", 100)) if opt is Dictionary and _numv(opt.get("shake")) else 100.0
	var g: Dictionary = main.source_state.read_current_g()
	_g_write({"shake": maxf(_n(g.get("shake")), n * s / 100.0)}) # 19924

func _unported_note(what: String) -> void:
	counters.presentation_unported += 1
	_unported[what] = int(_unported.get(what, 0)) + 1

func _note_unported(what: String) -> void:
	_unported[what] = int(_unported.get(what, 0)) + 1

func _tr(text: String) -> String:
	if main.has_method("translate_native_boot_label"):
		var t: Variant = main.translate_native_boot_label(text)
		if t is String: return t
	return text # 원본 _T: 표에 없으면 원문 반환(8660)

func _lesson_active() -> bool:
	if not main.has_method("get_native_normal_enemy_damage_provider_callbacks"): return false
	var providers: Dictionary = main.get_native_normal_enemy_damage_provider_callbacks()
	var c: Variant = providers.get("parry_lesson_active")
	if not c is Callable or not c.is_valid(): return false
	var r: Dictionary = c.call()
	return r.get("active") == true

func _g_write(fields: Dictionary) -> void:
	var st: Variant = main.get("source_state")
	if st != null and st.has_method("apply_native_boss_core_g_writes"):
		var r: Dictionary = st.apply_native_boss_core_g_writes(self, fields)
		if r.get("applied") != true: _note_unported("g_write_refused:" + str(r.get("reason")))

# ═══════════════════════════════ 관측 ═══════════════════════════════
func snapshot() -> Dictionary:
	return {"schema": "exoduser.godot.pc-boss-core.v1", "live": _live(), "adopted": is_instance_valid(body),
		"error": _error, "prefix_reason": _prefix_reason, "counters": counters.duplicate(true), "unported": _unported.duplicate(true),
		"space": space.snapshot(), "effective_scale": effective_scale, "mac_space_ready": mac_space_ready,
		"decided_scale": SPACE.BOSS_SPACE_SCALE, "final_published": _final_published,
		"boss": {"hp": E.get("hp"), "mhp": E.get("mhp"), "eShield": E.get("eShield"), "alive": E.get("alive"),
			"s": E.get("s"), "deaths": E.get("deaths", 0), "revPts": E.get("_revPts"), "phase": E.get("_bossPhase"),
			"reviveTimer": E.get("_reviveTimer", 0), "x": E.get("x"), "y": E.get("y"), "r": E.get("r")},
		"last_contact": _last_contact.duplicate(true)}

static func _n(v: Variant) -> float:
	return PREFIX._n(v)

static func _numv(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))
