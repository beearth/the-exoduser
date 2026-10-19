extends RefCounted
## Fireball (악의구, fireball && !fireBeamProj) player-projectile flight/collision — source-faithful candidate.
##
## Source: /Users/fordeargamers/Projects/exoduser-migration-20261001/game.html
##   HEAD f8a8889846e53f5c063c24f469b080c8de415b6e, blob a4f8846bb9f9600a6c9da0e117b92d6d437920af (exact lines).
##
## Per update, per projectile, in source order (update() pProjs loop 35176-35629):
##   35179 trail ring push (tMax = 14 for fireball&&!fireBeamProj&&_charIdx!==1, else 6; first frame allocates)
##   35180 spd = hypot(vx,vy)
##   35182 if _bounceCool>0: _bounceCool -= sp
##   35186 homing when !(_bounceCool>0) && spd>0 && (G._gcT+i)%4===0  (fireball cadence 4)
##   35187 search radius 280 (fireball), nearest alive enemy not in _hitSet (shQuery order)
##   35199-35204 turn = min(|da|, 0.35*_dtSp)*sign(da); keep speed magnitude
##   35207 x+=vx*sp; y+=vy*sp; dist+=spd*sp   (spd is the pre-homing magnitude)
##   35212 r = ~~(_fbR0 + (_fbRMax-_fbR0)*min(1, dist/maxDist))  when _fbRMax && maxDist>0
##   35214 sub-particle every 10 frames if OPT.parts>=60 (visual, optional callback)
##   35218-35220 dist>maxDist -> _fireballExplode -> dead
##   35236-35271 else isW(x,y): magic -> bounce while bounces<(_maxBounce||3) (step back, <=5 escapes,
##               axis probes, reflect, bounces++, _bounceCool=6, bounce parts) else _fireballExplode -> dead
##   35274-35278 dead -> death impact (visual, optional) -> removed (no enemy check)
##   35280 _hurtFieldMobs(x,y,(r||6)+8,dmg||atk||10,_hitSet,null) -> hit=true; create _hitSet if absent (non-pierce)
##   35282-35285 enemies = shQuery(x,y,r+20); alive; skip _hitSet members; contact if dst < e.r + r
##   35397-35407 generic hit: ang; mult=elMul(el,e.el); dmg=~~(p.dmg*mult); malice orb -> dmg=~~(dmg*_maliceWeakMul(p,e));
##               hurtE(e,dmg,ang,false,p,p.el)
##   35408-35487 hit side-effect block (weakness text/stun, hitStop, particles, sounds...) -> owner callback (not ported)
##   35489-35499 fireball && explR -> _fireballExplode; hit=true; break  (fireBeamProj pierce branch not applicable)
##   35628 hit -> _recyclePProj; else keep
## _fireballExplode (24579-24597 core):
##   r=explR||80, dmg=explDmg||~~(p.dmg*.6), el; enemies=shQuery(x,y,r+20); alive && dst<r+e.r:
##   a=atan2; m=elMul(el,e.el)*_maliceWeakMul(p,e) (orb); hurtE(e,~~(dmg*m),a,false,{kbMult:0.1},el);
##   poison: e.poison=1; poisonT=max(poisonT,600); poisonStk=min(10,stk+1); if stk<10 _poisonPool+=pDotPool()*dmg*2
##   Unique extensions u_d02/u_d14/u_d22/u_d01 (24583-24670) and the visual tail are NOT ported:
##   if any of those unique values is non-zero the step is NOT_READY before any side effect.
## _maliceWeakMul (24569-24578): per-projectile cache Map(enemy->mul); miss -> owner bumps e._mwStk
##   (_MW_STEP=0.3 + maliceWeakAmp affix, _MW_MAX=10 @24567) and returns 1+st*step.
##
## Ownership: this producer owns only the projectile packet physics and the call order. Enemies, geometry,
## World clock, hurtE, enemy status fields, pool recycle and visuals are owner callbacks. Missing -> NOT_READY.
## All required readiness is checked at the start of step(); after the first side effect a callback contract
## violation is reported as PARTIAL with the full event log (never hidden).

const SCHEMA := "exoduser.godot.skill-fireball-flight-source.candidate.v1"
const INT32 = preload("res://port_modules/combat_stat_formula/producer.gd")

const TRAIL_FIREBALL := 14
const TRAIL_DEFAULT := 6
const TRAIL_CHAR_EXCLUDED := 1        # _charIdx!==1
const HOMING_CADENCE := 4
const HOMING_RADIUS := 280.0
const HOMING_TURN := 0.35
const DEFAULT_MAX_BOUNCE := 3
const BOUNCE_COOL := 6.0
const WALL_ESCAPE_MAX := 5
const FIELD_MOB_PAD := 8.0
const FIELD_MOB_R_FALLBACK := 6.0
const FIELD_MOB_DMG_FALLBACK := 10
const ENEMY_QUERY_PAD := 20.0
const EXPLODE_R_FALLBACK := 80.0
const EXPLODE_DMG_FACTOR := 0.6
const EXPLODE_KB_OPTS := {"kbMult": 0.1}
const POISON_T := 600
const POISON_STK_MAX := 10
const POISON_POOL_FACTOR := 2.0
const SUB_PARTICLE_EVERY := 10
const UNIQUE_KEYS := ["_uOrbPoisonBurst", "_uVortexOrbPulse", "_uPoiseOrbFracture", "_uParryOrbEcho"]

const STATUS_FLYING := "FLYING"
const STATUS_DEAD_DISTANCE := "DEAD_DISTANCE_EXPLODED"
const STATUS_DEAD_WALL := "DEAD_WALL_EXPLODED"
const STATUS_HIT := "HIT_RELEASED"
const STATUS_NOT_READY := "NOT_READY"
const STATUS_PARTIAL := "PARTIAL"

const REQUIRED := [
	"query_enemies",        # (x,y,r) -> Array  shQuery order
	"read_enemy",           # (e) -> {alive:bool, x, y, r, el}
	"is_wall",              # (x,y) -> bool     isW
	"elem_mul",             # (a_el, d_el) -> float elMul
	"bump_malice_weak",     # (e) -> float      _maliceWeakMul body on cache miss (stack/affix/text owned by owner)
	"hurt_enemy",           # (e, dmg:int, ang, flag:bool, opts, el) -> void  hurtE
	"hit_side_effects",     # (e, packet, dmg:int, mult, ang) -> bool  block 35408-35487
	"hurt_field_mobs",      # (x, y, hit_r, dmg, hit_set:Dictionary) -> bool  _hurtFieldMobs
	"apply_fireball_poison",# (e, dmg) -> bool  poison fields + pDotPool()*dmg*2 per rule above
	"read_unique_values",   # () -> Dictionary of UNIQUE_KEYS -> number (_uEq)
	"release_projectile",   # (packet) -> void  _recyclePProj
]
const OPTIONAL_FX := ["fx_sub_particle", "fx_bounce", "fx_death_impact"]  # visuals; absence reported, physics unchanged

var _b: Dictionary = {}
var _ready_cfg := false

func configure(bindings: Dictionary) -> bool:
	_ready_cfg = false
	for k in REQUIRED:
		if not bindings.has(k) or not (bindings[k] is Callable) or not bindings[k].is_valid(): return false
	for k in OPTIONAL_FX:
		if bindings.has(k) and (not (bindings[k] is Callable) or not bindings[k].is_valid()): return false
	_b = bindings.duplicate()
	_ready_cfg = true
	return true

func is_ready() -> bool:
	if not _ready_cfg: return false
	for k in REQUIRED:
		if not _b[k].is_valid(): return false
	return true

## Packet identity: there is no adopt/copy/default step here. ENGINE borrows the packet (17330-17362: _getPProj reuses a
## free packet via _resetPProj, or creates one via _mkPProj only when free is empty), assigns the cast fields (33644),
## and passes that same Dictionary to step(). Absent/null/falsy and unlisted keys (e.g. _mwMul, _trail, bounces,
## _bounceCool, _hitSet left from a previous use) are read with JS semantics exactly as the source reads them.

## ctx: {sp, dt_sp, gc_t, slot_index, char_idx, parts_opt, death_fx_opt}  — all from the owner's World clock/options.
func step(p: Dictionary, ctx: Dictionary) -> Dictionary:
	var events: Array = []
	if not is_ready(): return {"status": STATUS_NOT_READY, "reason": "not_configured", "events": events}
	for k in ["sp", "dt_sp", "gc_t", "slot_index", "char_idx"]:
		if not _num(ctx.get(k)): return {"status": STATUS_NOT_READY, "reason": "ctx_missing:" + k, "events": events}
	if not _js_truthy(p.get("fireball")) or _js_truthy(p.get("fireBeamProj")):
		return {"status": STATUS_NOT_READY, "reason": "not_a_fireball_packet", "events": events}
	var uq: Variant = _b.read_unique_values.call()
	if not uq is Dictionary: return {"status": STATUS_NOT_READY, "reason": "unique_values_unavailable", "events": events}
	for k in UNIQUE_KEYS:
		var v: Variant = uq.get(k)
		if not _num(v): return {"status": STATUS_NOT_READY, "reason": "unique_value_unknown:" + k, "events": events}
		if float(v) > 0.0: return {"status": STATUS_NOT_READY, "reason": "unique_extension_not_ported:" + k, "events": events}
	var sp: float = float(ctx.sp)
	# 35179 trail
	var t_max: int = TRAIL_FIREBALL if int(ctx.char_idx) != TRAIL_CHAR_EXCLUDED else TRAIL_DEFAULT
	# if(!p._trail){alloc _tMax; _trH=0; _trLen=0} then slot = _trail[_trH % _tMax] (modulo uses _tMax, not array length)
	if not _js_truthy(p.get("_trail")):
		var arr: Array = []
		for _i in t_max: arr.append({"x": 0.0, "y": 0.0})
		p["_trail"] = arr
		p["_trH"] = 0
		p["_trLen"] = 0
	if not p._trail is Array or not _num(p.get("_trH")) or not _num(p.get("_trLen")):
		return {"status": STATUS_NOT_READY, "reason": "reused_trail_fields_not_source_shaped", "events": events}
	var t_idx: int = int(p._trH) % t_max
	if t_idx >= p._trail.size() or not p._trail[t_idx] is Dictionary:
		# Source would throw here (reused packet whose trail was allocated with another _tMax). Not repaired.
		return {"status": STATUS_NOT_READY, "reason": "reused_trail_slot_missing_for_tmax", "events": events}
	var slot: Dictionary = p._trail[t_idx]
	slot.x = p.x; slot.y = p.y
	p._trH = (int(p._trH) + 1) % t_max
	if int(p._trLen) < t_max: p._trLen = int(p._trLen) + 1
	# 35180-35182
	var spd: float = sqrt(float(p.vx) * float(p.vx) + float(p.vy) * float(p.vy))
	if _num(p.get("_bounceCool")) and float(p._bounceCool) > 0.0: p._bounceCool = float(p._bounceCool) - sp   # undefined>0 is false
	# 35186-35205 homing
	if not (_num(p.get("_bounceCool")) and float(p._bounceCool) > 0.0) and spd > 0.0 and (int(ctx.gc_t) + int(ctx.slot_index)) % HOMING_CADENCE == 0:
		var best_e: Variant = null
		var best_d: float = HOMING_RADIUS
		for e in _b.query_enemies.call(p.x, p.y, best_d):
			var er: Variant = _b.read_enemy.call(e)
			if not er is Dictionary or er.get("alive") != true: continue
			if p.get("_hitSet") is Dictionary and p._hitSet.has(_eid(e)): continue
			var d: float = Vector2(float(p.x), float(p.y)).distance_to(Vector2(float(er.x), float(er.y)))
			if d < best_d:
				best_d = d
				best_e = er
		if best_e != null:
			var ta: float = atan2(float(best_e.y) - float(p.y), float(best_e.x) - float(p.x))
			var ca: float = atan2(float(p.vy), float(p.vx))
			var da: float = ta - ca
			while da > PI: da -= TAU
			while da < -PI: da += TAU
			var turn: float = minf(absf(da), HOMING_TURN * float(ctx.dt_sp)) * signf(da)
			p.vx = cos(ca + turn) * spd
			p.vy = sin(ca + turn) * spd
	# 35207
	p.x = float(p.x) + float(p.vx) * sp
	p.y = float(p.y) + float(p.vy) * sp
	p.dist = float(p.dist) + spd * sp
	# 35212 growth
	if _js_truthy(p.get("_fbRMax")) and float(p.maxDist) > 0.0:
		p.r = INT32.js_to_int32(float(p._fbR0) + (float(p._fbRMax) - float(p._fbR0)) * minf(1.0, float(p.dist) / float(p.maxDist)))
	# 35214 sub particle (visual)
	if _num(ctx.get("parts_opt")) and float(ctx.parts_opt) >= 60.0 and (int(ctx.gc_t) + int(ctx.slot_index)) % SUB_PARTICLE_EVERY == 0:
		_fx("fx_sub_particle", [p.x, p.y, p.el, p.vx, p.vy], events)
	# 35217-35272 distance end / wall
	var dead := false
	var dead_status := ""
	if float(p.dist) > float(p.maxDist):
		if _js_truthy(p.get("explR")):
			var ex := _explode(p, events)
			if ex != "": return _partial(p, ex, events)
		dead = true
		dead_status = STATUS_DEAD_DISTANCE
	elif _b.is_wall.call(p.x, p.y) == true:
		var max_b: int = int(p._maxBounce) if _js_truthy(p.get("_maxBounce")) else DEFAULT_MAX_BOUNCE
		if _js_or_int(p.get("bounces")) < max_b:     # magic projectile rule (p.magic true)
			p.x = float(p.x) - float(p.vx) * sp
			p.y = float(p.y) - float(p.vy) * sp
			var esc := 0
			while esc < WALL_ESCAPE_MAX and _b.is_wall.call(p.x, p.y) == true:
				p.x = float(p.x) - float(p.vx) * sp
				p.y = float(p.y) - float(p.vy) * sp
				esc += 1
			var h_wall: bool = _b.is_wall.call(float(p.x) + float(p.vx) * sp, p.y) == true
			var v_wall: bool = _b.is_wall.call(p.x, float(p.y) + float(p.vy) * sp) == true
			if h_wall: p.vx = -float(p.vx)
			if v_wall: p.vy = -float(p.vy)
			if not h_wall and not v_wall:
				p.vx = -float(p.vx)
				p.vy = -float(p.vy)
			p["bounces"] = _js_or_int(p.get("bounces")) + 1
			p._bounceCool = BOUNCE_COOL
			_fx("fx_bounce", [p.x, p.y, p.el], events)
		else:
			if _js_truthy(p.get("explR")):
				var ex2 := _explode(p, events)
				if ex2 != "": return _partial(p, ex2, events)
			dead = true
			dead_status = STATUS_DEAD_WALL
	# 35274-35278
	if dead:
		if ctx.get("death_fx_opt") == true:
			_fx("fx_death_impact", [p.x, p.y, p.el, atan2(float(p.vy), float(p.vx)), "magic"], events)
		_b.release_projectile.call(p)
		events.append({"op": "release", "why": dead_status})
		return {"status": dead_status, "events": events}
	# 35280 field mobs
	var hit := false
	var fm_r: float = (float(p.r) if _js_truthy(p.get("r")) else FIELD_MOB_R_FALLBACK) + FIELD_MOB_PAD
	var fm_dmg: Variant = p.dmg if _js_truthy(p.get("dmg")) else (p.get("atk") if _js_truthy(p.get("atk")) else FIELD_MOB_DMG_FALLBACK)
	var fm: Variant = _b.hurt_field_mobs.call(p.x, p.y, fm_r, fm_dmg, p.get("_hitSet"))   # raw (may be absent), as source
	if not fm is bool: return _partial(p, "hurt_field_mobs_result_not_bool", events)
	if fm:
		hit = true
		events.append({"op": "field_mobs_hit"})
		if not _js_truthy(p.get("pierce")) and not _js_truthy(p.get("_hitSet")): p["_hitSet"] = {}   # new Set() after the call
	# 35282-35499 enemies
	for e in _b.query_enemies.call(p.x, p.y, float(p.r) + ENEMY_QUERY_PAD):
		var er: Variant = _b.read_enemy.call(e)
		if not er is Dictionary or er.get("alive") != true: continue
		if p.get("_hitSet") is Dictionary and p._hitSet.has(_eid(e)): continue
		var d: float = Vector2(float(p.x), float(p.y)).distance_to(Vector2(float(er.x), float(er.y)))
		if d < float(er.r) + float(p.r):
			var ang: float = atan2(float(er.y) - float(p.y), float(er.x) - float(p.x))
			var mult: Variant = _b.elem_mul.call(p.el, er.el)
			if not _num(mult): return _partial(p, "elem_mul_not_numeric", events)
			var dmg: int = INT32.js_to_int32(float(p.dmg) * float(mult))
			var wm: Variant = _weak_mul(p, e)
			if not _num(wm): return _partial(p, "malice_weak_mul_not_numeric", events)
			dmg = INT32.js_to_int32(float(dmg) * float(wm))
			_b.hurt_enemy.call(e, dmg, ang, false, p, p.el)
			events.append({"op": "hurt_direct", "dmg": dmg})
			if _b.hit_side_effects.call(e, p, dmg, mult, ang) != true:
				return _partial(p, "hit_side_effects_not_applied", events)
			events.append({"op": "hit_side_effects"})
			if _js_truthy(p.get("explR")):
				var ex3 := _explode(p, events)
				if ex3 != "": return _partial(p, ex3, events)
			hit = true
			break
	# 35628
	if hit:
		_b.release_projectile.call(p)
		events.append({"op": "release", "why": "hit"})
		return {"status": STATUS_HIT, "events": events}
	return {"status": STATUS_FLYING, "events": events}

## 24579-24597 core. Returns "" on success or a failure reason (caller reports PARTIAL).
func _explode(p: Dictionary, events: Array) -> String:
	var r: float = float(p.explR) if _js_truthy(p.get("explR")) else EXPLODE_R_FALLBACK
	var dmg: float = float(p.explDmg) if _js_truthy(p.get("explDmg")) else float(INT32.js_to_int32(float(p.dmg) * EXPLODE_DMG_FACTOR))
	var el: Variant = p.el
	for e in _b.query_enemies.call(p.x, p.y, r + ENEMY_QUERY_PAD):
		var er: Variant = _b.read_enemy.call(e)
		if not er is Dictionary or er.get("alive") != true: continue
		var d: float = Vector2(float(p.x), float(p.y)).distance_to(Vector2(float(er.x), float(er.y)))
		if d < r + float(er.r):
			var a: float = atan2(float(er.y) - float(p.y), float(er.x) - float(p.x))
			var em: Variant = _b.elem_mul.call(el, er.el)
			var wm: Variant = _weak_mul(p, e)
			if not _num(em) or not _num(wm): return "explode_multiplier_not_numeric"
			var hd: int = INT32.js_to_int32(dmg * float(em) * float(wm))
			_b.hurt_enemy.call(e, hd, a, false, EXPLODE_KB_OPTS.duplicate(), el)
			events.append({"op": "hurt_explode", "dmg": hd})
			if _b.apply_fireball_poison.call(e, dmg) != true: return "fireball_poison_not_applied"
			events.append({"op": "poison"})
	return ""

## _maliceWeakMul with the per-projectile cache kept on the packet (24570-24571).
func _weak_mul(p: Dictionary, e: Variant) -> Variant:
	var key: int = _eid(e)
	if not _js_truthy(p.get("_mwMul")): p["_mwMul"] = {}   # if(!p._mwMul)p._mwMul=new Map(); existing cache kept
	if p._mwMul.has(key): return p._mwMul[key]
	var mul: Variant = _b.bump_malice_weak.call(e)
	if _num(mul): p._mwMul[key] = mul
	return mul

func _fx(name: String, args: Array, events: Array) -> void:
	if _b.has(name):
		_b[name].callv(args)
		events.append({"op": name})
	else:
		events.append({"op": name, "unbound": true})

func _partial(p: Dictionary, reason: String, events: Array) -> Dictionary:
	return {"status": STATUS_PARTIAL, "reason": reason, "events": events}

static func _eid(e: Variant) -> int:
	return e.get_instance_id() if e is Object else hash(e)

static func _num(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))

static func _js_truthy(v: Variant) -> bool:
	if v == null: return false
	if v is bool: return v
	if v is int: return v != 0
	if v is float: return v != 0.0 and not is_nan(v)
	if v is String or v is StringName: return not str(v).is_empty()
	return true

static func _js_or_int(v: Variant) -> int:
	return int(v) if _js_truthy(v) and _num(v) else 0
