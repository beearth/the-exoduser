extends Node
## PC-FIREBALL — 악의구(fireball, RMB) 투사체 배달 owner. Main.native_fireball_delivery로 설치된다.
## 시전 시작·완료(MP·_mpBon·magicRecover·숙련·샘플)는 기존 authority(native_source_resource_authority
## apply_native_fireball_start/finish)가 원본 순서대로 쓰고, 이 owner는 33644 `pProjs.push(_pp)`의 투사체만 만든다.
## 원본 근거(source_snapshot/game.html):
## - 생성 33641~33646: x/y=P+dir×14, v=dir×5.5, dmg=mdmg, el=EL.D(3), maxDist=400+(lv−1)×50+bonusRange×20,
##   r=_fbR0 12→_fbRMax ~~(12×scale), explR ~~(80×scale), explDmg ~~(mdmg×.6), kb .005, kbMult .1, magic, fireball.
## - 비행·충돌·폭발 35176~35629 / 24581~24719: 원본 대응 producer port_modules/fireball_flight_source를 그대로 쓴다.
##   (꼬리 링·유도 280/4프레임·성장·거리 끝 폭발·벽 반사 3회·직격 hurtE·폭발 hurtE {kbMult:.1}·중독 필드)
## - 직격 부수효과 35408~35487 중 악의구 해당분: bullet_hit .15·magic 넉백 kb×mult·약점(mult≥2) 텍스트+stunned+35·
##   히트 파티클 ELP[3]. 히트스톱은 원본 32585 `G.hitStop=0`으로 비활성이라 쓰지 않는다.
## - 폭발 시각 24697~24718: Dark_DarkSmoke_FBF_4x4(1.8)·Arcane_Arcane_FBF_6x6(1.4, delay1)·Dark_BasicImpact(0.8)
##   × _mbSc=clamp(√(r/80),.8,2.5), 'lighter', TVFX2 진행 54781~54797 + fireball 샘플(.9, _r(.7,.1))·shake(5)·
##   파편 12(ELC[3]).
## - 그리기 59105 _drawMaliceOrbTrail(24293)·59153 vfx_magic_orb(7×3, 20f, 171px, r×5, lighter .85×fa).
## 미이식(기록): 중독 DOT 틱 소비자(적 측 poison 틱 owner 없음 — 필드만 기록), 필드몹(_hurtFieldMobs) 대상 없음,
## 유니크 확장 4종(값 0이면 원본도 비활성), shQuery 순서는 World.get_enemies 순서 근사.
const Flight = preload("res://port_modules/fireball_flight_source/producer.gd")
const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const ELMUL = preload("res://port_modules/detonate_blast/producer.gd")
const ELC_DARK := Color("#9933cc")
const ELP_DARK := Color("#bb55ee")
const MW_MAX := 10
const MW_STEP := 0.3
const POISON_T := 600.0
const VFX_LAYERS := [
	{"tex": "res://assets/vfx/Dark_DarkSmoke_FBF_4x4.png", "cols": 4, "rows": 4, "sc": 1.8, "delay": 0, "spd": 3},
	{"tex": "res://assets/vfx/Arcane_Arcane_FBF_6x6.png", "cols": 6, "rows": 6, "sc": 1.4, "delay": 1, "spd": 3},
	{"tex": "res://assets/vfx/Dark_BasicImpact.png", "cols": 3, "rows": 3, "sc": 0.8, "delay": 0, "spd": 2},
]
const ORB_TEX := "res://assets/vfx/vfx_magic_orb.png"
const SFX_FIREBALL := "res://assets/sfx/attack_source/fireball.mp3"
const SFX_BULLET_HIT := "res://assets/sfx/attack_source/bullet_hit.mp3"

var main: Node
var player: Node
var source_state: Node
var source_resources: Node
var _live: Array = []          # 현재 날아가는 악의구 노드(원본 pProjs 중 악의구 슬롯 순서)
var _fx: Array = []            # 폭발 TVFX2 + 파편
var _last: Dictionary = {"status": "IDLE"}
var _last_hurt: Dictionary = {}
var _stats := {"fired": 0, "hits": 0, "explosions": 0, "partial": 0}
var _vfx_canvas: Node2D
var _textures: Dictionary = {}

static func install_native_boot(owner: Node) -> Node:
	var world: Node = owner.get("world")
	if not is_instance_valid(world) or not is_instance_valid(owner.get("player")):
		return null
	var node: Node = load("res://scripts/native_fireball_delivery.gd").new()
	node.name = "NativeFireballDelivery"
	node.main = owner
	node.player = owner.get("player")
	node.source_state = owner.get("source_state")
	node.source_resources = owner.get("source_resources")
	world.add_child(node)
	return node

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	for layer in VFX_LAYERS:
		_textures[layer.tex] = load(layer.tex)
	_textures[ORB_TEX] = load(ORB_TEX)
	_vfx_canvas = _VfxCanvas.new()
	_vfx_canvas.owner_delivery = self
	_vfx_canvas.z_as_relative = false
	_vfx_canvas.z_index = 400
	get_parent().add_child.call_deferred(_vfx_canvas)

func read_native_fireball_readiness() -> Dictionary:
	var ok: bool = is_inside_tree() and is_instance_valid(main) and is_instance_valid(player) and main.get("world") == get_parent()
	return {"ready": ok, "projectile_ready": ok and _textures.get(ORB_TEX) is Texture2D,
		"live": _live.size(), "stats": _stats.duplicate(), "last": _last.duplicate(true)}

## 33644 `const _pp=_getPProj(); ...; pProjs[pProjs.length]=_pp` — authority가 world.add_child로 붙인다.
func prepare_native_fireball_finish(payload: Dictionary) -> Dictionary:
	for key in ["x", "y", "vx", "vy", "dmg", "el", "maxDist", "r", "explR", "explDmg", "_fbR0", "_fbRMax"]:
		if not (payload.get(key) is int or payload.get(key) is float):
			return {"ready": false, "reason": "fireball_payload_field_missing:" + key}
	if payload.get("fireball") != true or payload.get("magic") != true:
		return {"ready": false, "reason": "fireball_payload_not_malice_orb"}
	var node := _Orb.new()
	node.delivery = self
	node.packet = payload.duplicate(true)
	var flight: RefCounted = Flight.new()
	if not flight.configure(_bindings(node)):
		node.free()
		return {"ready": false, "reason": "fireball_flight_bindings_not_ready"}
	node.flight = flight
	node.position = Vector2(float(payload.x), float(payload.y))
	return {"ready": true, "projectile": node}

func get_native_fireball_delivery_snapshot() -> Dictionary:
	var orbs: Array = []
	for o in _live:
		if is_instance_valid(o): orbs.append({"x": snappedf(float(o.packet.x), 0.1), "y": snappedf(float(o.packet.y), 0.1), "r": o.packet.r, "dist": snappedf(float(o.packet.dist), 0.1), "vx": snappedf(float(o.packet.vx), 0.01), "vy": snappedf(float(o.packet.vy), 0.01)})
	return {"live": _live.size(), "orbs": orbs, "fx": _fx.size(), "stats": _stats.duplicate(), "last": _last.duplicate(true), "last_hurt": _last_hurt.duplicate(true)}

func _bindings(node: Node) -> Dictionary:
	var world: Node = get_parent()
	return {
		"query_enemies": func(x, y, r):
			var out: Array = []
			for e in world.get_enemies():
				if is_instance_valid(e) and e.get("alive") == true and Vector2(x, y).distance_to(e.global_position) <= float(r) + float(e.get("radius")):
					out.append(e)
			return out,
		"read_enemy": func(e):
			if not is_instance_valid(e): return {"alive": false}
			return {"alive": e.get("alive") == true, "x": e.global_position.x, "y": e.global_position.y,
				"r": float(e.get("radius")), "el": _enemy_el(e)},
		"is_wall": func(x, y): return world.is_world_blocked(Vector2(x, y)) == true, # isW
		"elem_mul": func(a, d): return ELMUL.el_mul(int(a), int(d)),
		"bump_malice_weak": func(e): return _bump_malice_weak(e),
		"hurt_enemy": func(e, dmg, ang, _flag, opts, el): _hurt(e, int(dmg), float(ang), opts, int(el)),
		"hit_side_effects": func(e, p, dmg, mult, ang): return _hit_side_effects(e, p, int(dmg), float(mult), float(ang)),
		"hurt_field_mobs": func(_x, _y, _r, _dmg, _set): return false,
		"apply_fireball_poison": func(e, dmg): return _apply_poison(e, float(dmg)),
		"read_unique_values": func(): return _unique_values(),
		"release_projectile": func(p): node.released = true,
		"fx_death_impact": func(_x, _y, _el, _ang, _kind): pass,
	}

func _enemy_el(e: Node) -> int:
	if e.has_method("read_native_normal_enemy_hurte_fields"):
		var f: Dictionary = e.read_native_normal_enemy_hurte_fields(get_parent())
		if f.get("ready") == true: return int(f.get("el", 0))
	return 0

## 24571~24578 _maliceWeakMul 캐시 미스 본문: st=e._mwStk||0, mul=1+st×(.3+maliceWeakAmp 0), n=min(10,st+1)
func _bump_malice_weak(e: Node) -> float:
	var st: int = int(e.get_meta("_mwStk", 0))
	var mul: float = 1.0 + float(st) * MW_STEP
	var n: int = mini(MW_MAX, st + 1)
	e.set_meta("_mwStk", n)
	if n > st:
		_text(e.global_position + Vector2(0, -34), "악의 약화 +%d%%" % int(round(n * MW_STEP * 100.0)), "#b07cff", 24)
	return mul

## hurtE(e,dmg,ang,false,opts,el) — 기존 PC hurtE 실행자. 직격은 패킷 자체가 opts(35407):
## 원본 hurtE가 패킷에서 읽는 키 중 악의구에 참인 것은 magic·kbMult(·maxDist는 magic이면 무시 42272/42468)뿐.
func _hurt(e: Node, dmg: int, ang: float, opts: Variant, el: int) -> void:
	if not is_instance_valid(e) or e.get("alive") != true: return
	var view: Dictionary = {}
	if opts is Dictionary:
		if opts.get("fireball") == true:
			view = {"kbMult": float(opts.get("kbMult", 0.1)), "magic": true}
		else:
			view = {"kbMult": float(opts.get("kbMult", 1.0))}
	var outcome: Dictionary = NORMAL_HURTE.new().execute(main, get_parent(), e, dmg, ang, el, view)
	_last_hurt = {"ok": outcome.get("ok"), "halted_at": outcome.get("halted_at"), "reason": outcome.get("reason", ""), "dmg": dmg, "target": str(e.name), "target_pos": str(e.global_position), "hp_after": e.get("hp"), "script": str(e.get_script().resource_path.get_file()) if e.get_script() else ""}
	outcome["source"] = "fireball"
	outcome["base_damage"] = dmg
	if player.has_signal("telemetry_event"):
		player.telemetry_event.emit("native_hurte", outcome)
	_stats.hits += 1

func _hit_side_effects(e: Node, p: Dictionary, dmg: int, mult: float, ang: float) -> bool:
	# 35459 p.magic → bullet_hit .15, _r(1,.15)
	_sample(SFX_BULLET_HIT, 0.15, 1.0 + (randf() - 0.5) * 0.3)
	if is_instance_valid(e) and e.get("alive") == true:
		# 35466~35467 magic 넉백 kb×mult
		var kb: float = float(p.get("kb", 0.0))
		if kb > 0.0 and e.has_method("add_native_knockback"):
			e.add_native_knockback(Vector2.from_angle(ang) * kb * mult)
		# 35481 약점: mult≥2 → '약점!' ELC[el] 38 + e.stunned+=35
		if mult >= 2.0:
			_text(e.global_position + Vector2(0, -18), "약점!", "#9933cc", 38)
			if e.has_method("apply_native_normal_enemy_field_write"):
				var f: Dictionary = e.read_native_normal_enemy_hurte_fields(get_parent()) if e.has_method("read_native_normal_enemy_hurte_fields") else {}
				e.apply_native_normal_enemy_field_write("stunned", float(f.get("stunned", 0.0)) + 35.0)
	# 35484~35485 히트 파티클 ELP[3] — ~~(max(3,min(dmg/3,10))×parts/100)
	var at: Vector2 = e.global_position if is_instance_valid(e) else Vector2(float(p.x), float(p.y))
	var count: int = int(maxf(3.0, minf(dmg / 3.0, 10.0)))
	for k in count:
		var a: float = ang + PI
		_fx.append({"kind": "part", "x": at.x + (randf() - 0.5) * 6.0, "y": at.y + (randf() - 0.5) * 6.0,
			"vx": cos(a) * (1.0 + randf() * 2.0) + (randf() - 0.5), "vy": sin(a) * (1.0 + randf() * 2.0) + (randf() - 0.5),
			"col": ELP_DARK, "sz": 2.0 + randf() * 3.0, "life": 8.0 + randf() * 8.0})
	return true

## 24599 e.poison=1; poisonT=max(,600); poisonStk=min(10,stk+1); stk<10 → _poisonPool += pDotPool()×dmg×2
## 적 측 중독 틱 소비자가 아직 없어 필드만 기록한다(피해 0, 기록).
func _apply_poison(e: Node, dmg: float) -> bool:
	if not is_instance_valid(e): return true
	var stk: int = int(e.get_meta("poisonStk", 0))
	e.set_meta("poison", 1)
	e.set_meta("poisonT", maxf(float(e.get_meta("poisonT", 0.0)), POISON_T))
	e.set_meta("poisonStk", mini(10, stk + 1))
	if stk < 10:
		e.set_meta("_poisonPool", float(e.get_meta("_poisonPool", 0.0)) + dmg * 2.0)
	return true

func _unique_values() -> Dictionary:
	var out := {"_uOrbPoisonBurst": 0, "_uVortexOrbPulse": 0, "_uPoiseOrbFracture": 0, "_uParryOrbEcho": 0}
	if is_instance_valid(main) and main.has_method("read_native_fireball_unique_values"):
		var v: Variant = main.read_native_fireball_unique_values()
		if v is Dictionary:
			for k in out:
				if v.has(k): out[k] = v[k]
	return out

## 24697~24719 폭발 시각·소리 (_fireballExplode 꼬리)
func _explode_visual(x: float, y: float, r: float) -> void:
	var sc: float = clampf(sqrt(r / 80.0), 0.8, 2.5)
	for layer in VFX_LAYERS:
		var tex: Texture2D = _textures.get(layer.tex)
		if tex == null: continue
		var fw: int = tex.get_width() / int(layer.cols)
		var fh: int = tex.get_height() / int(layer.rows)
		_fx.append({"kind": "sheet", "tex": tex, "x": x, "y": y, "cols": layer.cols, "fw": fw, "fh": fh,
			"sc": float(layer.sc) * sc, "delay": int(layer.delay), "spd": int(layer.spd), "frame": 0,
			"total": int(layer.cols) * int(layer.rows), "t": 0, "timer": 0})
	_sample(SFX_FIREBALL, 0.9, 0.7 + (randf() - 0.5) * 0.2)
	if is_instance_valid(source_state) and source_state.has_method("apply_native_skill_shake"):
		source_state.apply_native_skill_shake(main, 5.0)
	for k in 12:
		var a: float = TAU * k / 12.0
		var s: float = 4.0 + randf() * 3.0
		_fx.append({"kind": "part", "x": x, "y": y, "vx": cos(a) * s, "vy": sin(a) * s, "col": ELC_DARK,
			"sz": 3.0 + randf() * 3.0, "life": 12.0 + randf() * 6.0})
	_stats.explosions += 1

func _sample(path: String, gain: float, rate: float) -> void:
	if is_instance_valid(main) and main.has_method("request_native_skill_sample") and FileAccess.file_exists(path):
		main.request_native_skill_sample(path, gain, rate)

func _text(pos: Vector2, text: String, color: String, life: int) -> void:
	var adapter: Variant = get_parent().get_node_or_null("NativeFloatingText")
	if adapter != null and adapter.has_method("emit_native_text"):
		adapter.emit_native_text(pos.x, pos.y, text, color, life)

func _gc_t() -> int:
	var g: Variant = source_state.read_current_g() if is_instance_valid(source_state) else null
	if g is Dictionary and (g.get("_gcT") is int or g.get("_gcT") is float): return int(g._gcT)
	return Engine.get_physics_frames() % 21

func _physics_process(_delta: float) -> void:
	# TVFX2(54781~54797)·파편(poolPart) 진행 — 원본은 렌더 프레임, 여기선 60Hz 물리 틱
	var w := 0
	for i in _fx.size():
		var v: Dictionary = _fx[i]
		if v.kind == "sheet":
			if v.delay > 0:
				v.delay -= 1; _fx[w] = v; w += 1; continue
			v.t += 1; v.timer += 1
			if v.timer >= v.spd:
				v.timer = 0; v.frame += 1
				if v.frame >= v.total: continue
		else:
			v.x += v.vx; v.y += v.vy; v.vx *= 0.94; v.vy *= 0.94; v.life -= 1.0
			if v.life <= 0.0: continue
		_fx[w] = v; w += 1
	_fx.resize(w)
	if is_instance_valid(_vfx_canvas): _vfx_canvas.queue_redraw()

func _orb_step(orb: Node) -> void:
	var world: Node = get_parent()
	if get_tree().paused: return
	var ctx_src: Dictionary = world.get_native_projectile_fx_context()
	var sp: float = float(ctx_src.get("dt_sp", 1.0))
	if not is_finite(sp) or sp <= 0.0: sp = 1.0
	var ctx := {"sp": sp, "dt_sp": sp, "gc_t": _gc_t(), "slot_index": maxi(0, _live.find(orb)), "char_idx": 0,
		"parts_opt": 100, "death_fx_opt": false}
	var before_expl: float = float(orb.packet.get("explR", 0))
	_stats["steps"] = int(_stats.get("steps", 0)) + 1
	_stats["last_sp"] = sp
	var res: Dictionary = orb.flight.step(orb.packet, ctx)
	_last = {"status": res.get("status"), "reason": res.get("reason", "")}
	if res.get("status") == Flight.STATUS_PARTIAL or res.get("status") == Flight.STATUS_NOT_READY:
		_stats.partial += 1
		push_warning("native fireball step " + str(res.get("status")) + ":" + str(res.get("reason", "")))
		orb.released = true
	for ev in res.get("events", []):
		if str(ev.get("op", "")).begins_with("hurt_explode") and before_expl > 0.0 and not orb.exploded:
			orb.exploded = true
	# _fireballExplode는 적이 없어도 거리·벽 끝에서 실행된다 — 시각 꼬리는 폭발 호출마다(원본 p.explR=0 후 재진입 없음)
	if res.get("status") in [Flight.STATUS_DEAD_DISTANCE, Flight.STATUS_DEAD_WALL, Flight.STATUS_HIT] and before_expl > 0.0:
		_explode_visual(float(orb.packet.x), float(orb.packet.y), before_expl)
	orb.position = Vector2(float(orb.packet.x), float(orb.packet.y))
	orb.queue_redraw_all()
	if orb.released:
		_live.erase(orb)
		orb.queue_free()

class _Orb extends Node2D:
	var delivery: Node
	var packet: Dictionary
	var flight: RefCounted
	var released := false
	var exploded := false
	func _enter_tree() -> void:
		process_mode = Node.PROCESS_MODE_PAUSABLE
		z_as_relative = false
		z_index = 400
		if is_instance_valid(delivery) and not delivery._live.has(self):
			delivery._live.append(self)
			delivery._stats.fired += 1
	func _physics_process(_delta: float) -> void:
		if released or not is_instance_valid(delivery): return
		delivery._orb_step(self)
	var _add: Node2D
	func _ready() -> void:
		_add = _OrbAdd.new(); _add.orb = self
		var mat := CanvasItemMaterial.new(); mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		_add.material = mat
		add_child(_add)
	func queue_redraw_all() -> void:
		queue_redraw()
		if is_instance_valid(_add): _add.queue_redraw()
	func trail_points() -> PackedVector2Array:
		# 24294~24296 머리(현재 위치)+링 버퍼 역순
		var q: PackedVector2Array = [Vector2.ZERO]
		var trail: Variant = packet.get("_trail")
		var n: int = int(packet.get("_trLen", 0))
		if not trail is Array or n < 2: return PackedVector2Array()
		var L: int = trail.size(); var h: int = int(packet.get("_trH", 0))
		for i in n:
			var s: Dictionary = trail[((h - 1 - i) % L + L) % L]
			q.append(Vector2(float(s.x), float(s.y)) - position)
		return q
	func orb_r() -> float:
		return maxf(4.0, float(packet.get("r", 6)))
	func _draw() -> void:
		# 24298 연기 리본 source-over α.38 ×2.8+2
		var q := trail_points()
		if q.size() >= 3: ribbon(self, q, q.size(), Color("#14061f"), 0.38, 2.8, 2.0, orb_r())
	static func ribbon(ci: CanvasItem, q: PackedVector2Array, m: int, col: Color, a: float, w_mul: float, w_add: float, r: float) -> void:
		if m < 2: return
		var lft: PackedVector2Array = []; var rgt: PackedVector2Array = []
		for j in m:
			var j0: int = maxi(0, j - 1); var j1: int = mini(m - 1, j + 1)
			var d: Vector2 = q[j1] - q[j0]
			var dl: float = d.length() if d.length() > 0.0 else 1.0
			d /= dl
			var hw: float = (r * w_mul * (1.0 - float(j) / float(m - 1)) + w_add) * 0.5
			lft.append(q[j] + Vector2(-d.y, d.x) * hw)
			rgt.append(q[j] + Vector2(d.y, -d.x) * hw)
		var c := Color(col.r, col.g, col.b, a)
		for j in m - 1:
			var poly: PackedVector2Array = [lft[j], lft[j + 1], rgt[j + 1], rgt[j]]
			if Geometry2D.triangulate_polygon(poly).size() > 0:
				ci.draw_colored_polygon(poly, c)

class _OrbAdd extends Node2D:
	var orb: Node2D
	func _draw() -> void:
		if not is_instance_valid(orb): return
		var p: Dictionary = orb.packet
		var r: float = orb.orb_r()
		var fa: float = minf(1.0, 1.0 - float(p.dist) / maxf(1.0, float(p.maxDist)) * 0.3)
		var q: PackedVector2Array = orb.trail_points()
		var m: int = q.size()
		if m >= 3:
			# 24300~24301 불꽃 lighter ×3 + 코어
			orb.ribbon(self, q, m, Color("#7a2cff"), 0.2, 1.7, 1.0, r)
			orb.ribbon(self, q, ceili(m * 0.66), Color("#7a2cff"), 0.2, 1.5, 1.0, r)
			orb.ribbon(self, q, ceili(m * 0.38), Color("#7a2cff"), 0.22, 1.3, 1.0, r)
			orb.ribbon(self, q, ceili(m * 0.5), Color("#e3c6ff"), 0.42, 0.5, 0.6, r)
			# 24302~24303 불씨 스탬프(i=2부터 3칸마다)
			var t: float = Time.get_ticks_msec()
			var i := 2
			while i < m - 1:
				var f: float = 1.0 - float(i) / float(m)
				var wv: float = sin(t * 0.02 + i * 1.7 + float(p.x) * 0.05) * r * 0.8 * f
				var ss: float = r * 0.45 * f + 0.8
				draw_circle(q[i] + Vector2(wv, -wv * 0.6), ss, Color(0.706, 0.42, 1.0, 0.55 * f))
				i += 3
		# 59166~59171 vfx_magic_orb 7×3·20f·171px, r×5, lighter α.85×fa
		var d: Node = orb.delivery
		var tex: Texture2D = d._textures.get(d.ORB_TEX) if is_instance_valid(d) else null
		if tex != null:
			var fi: int = int(Time.get_ticks_msec() * 0.12 + float(p.x) * 0.1) % 20
			var sz: float = float(p.r) * 5.0
			draw_texture_rect_region(tex, Rect2(-sz / 2.0, -sz / 2.0, sz, sz), Rect2((fi % 7) * 171, (fi / 7) * 171, 171, 171), Color(1, 1, 1, 0.85 * fa))
		else:
			draw_circle(Vector2.ZERO, float(p.r) * 1.5, Color(0.733, 0.267, 1.0, 0.9 * fa))

class _VfxCanvas extends Node2D:
	var owner_delivery: Node
	func _ready() -> void:
		var mat := CanvasItemMaterial.new()
		mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		material = mat
	func _draw() -> void:
		if not is_instance_valid(owner_delivery): return
		for v in owner_delivery._fx:
			if v.kind == "sheet":
				if v.delay > 0: continue
				var col: int = v.frame % v.cols
				var row: int = v.frame / v.cols
				var p: float = float(v.t) / float(v.total * v.spd)
				var sc: float = v.sc * (1.0 + p * 0.4)
				var w: float = v.fw * sc; var hh: float = v.fh * sc
				var alpha: float = maxf(0.0, (1.0 if p < 0.6 else 1.0 - (p - 0.6) / 0.4) * 0.7)
				draw_texture_rect_region(v.tex, Rect2(v.x - w / 2.0, v.y - hh / 2.0, w, hh), Rect2(col * v.fw, row * v.fh, v.fw, v.fh), Color(1, 1, 1, alpha))
			else:
				var c: Color = v.col
				c.a = clampf(v.life / 10.0, 0.0, 1.0)
				draw_circle(Vector2(v.x, v.y), v.sz * 0.5, c)
