extends RefCounted
## PC-COMBAT-PACK-B PCI-05/06 — 기본 자동 석궁(normalBow) 실제 탄 carrier.
## 원본 pProjs 갱신 블록(game.html G35176–35630) 중 normalBow 패킷이 실제로 지나는 문장만 실행한다.
## 패킷 = 기존 World 플레이어 탄 store(native_player_projectile_store.gd, 원본 pProjs/_getPProj 풀)의 Packet.
## 새 registry를 만들지 않는다. 같은 Packet.fields 객체를 그대로 hurtE opts로 넘긴다(G35407 `hurtE(e,dmg,ang,..,p,p.el)`).
##
## 원본 순서(normalBow가 도달하는 문장만):
##   35179 트레일(_tMax=6) → 35180 spd → 35182 _bounceCool-=sp → (35186 유도: normalBow 제외) →
##   35206 x+=vx*sp,y+=vy*sp,dist+=spd*sp → 35220 dist>maxDist 소멸 / 35236 isW → canBounce(!explosive&&dist<maxDist*.5&&bounces<2)
##   스텝백·탈출5회·h/v 반전·bounces++·_bounceCool=6 또는 소멸 → 35277 dead면 재활용 없이 제거 →
##   35279 _hurtFieldMobs → 35281 shQuery(x,y,r+20) → 35283 hitSet 스킵 → 35284 dst<e.r+p.r →
##   35398 mult=elMul(p.el,e.el),dmg=~~(p.dmg*mult) → 35407 hurtE(e,dmg,ang,false,p,p.el) →
##   35433 _uBowPoisonRicochet → 35472 mult>=2 약점 경직 → 35473 G.hitStop(표현) →
##   35562 통일 관통(_pierceRate) → 35606 패시브 관통(pierce>0) → 35617 석궁 킬관통 → 35624 hit=true break →
##   35628 hit이면 _recyclePProj.
## 35279 _hurtFieldMobs(G18733–18756): 필드보스(G._fieldBosses 4슬롯)는 PC 필드몹 owner(native_field_mob_hit_owner.gd)가
## 원본 순서(hitSet 선기록→hitCd→_fmApply→_fmDeathFx 롤→_fbMarkDead)로 처리하고 HP·최종 사망은 Mac family PC readback seam에
## 쓴다. 필드몹 적중(n>0)은 hit=true로 시작하고, 이어지는 적 루프의 관통 분기(hit=false;continue)가 원본처럼 다시 끈다.
## 웜/화마귀는 실제 접촉이 생기는 스텝만 쓰기 전에 거절한다(존재만으로는 거절하지 않음 — 일반 몹 발사·명중·처치 유지).
## 사전 거절(쓰기·RNG 0): 이 carrier가 실행하지 않는 분기가 활성인 패킷(fireball/burst/explosive/magic/
## 유도/독사/역병/체인/블루콩/터렛/_aoeR/_uqRico/_uqEcho/칼날메아리), 웜/화마귀 실제 접촉, _uBowPoisonRicochet>0,
## 약점 배율(mult>=2) 경직 분기. 접촉 도중 hurtE가 정지하면 그 패킷만 blocked(유지)하고 pass를 멈춘다
## (기존 fireball consumer와 같은 규약 — 이미 적용된 prefix는 되돌리지 않는다).
## 표현 전용(미이식·기록만): 트레일 렌더, 서브파티클(35212), 벽 반사 파티클, 소멸 임팩트(35273),
## bow_hit 사운드(35454/35624), G.hitStop(35473, 소비자 32585 완전 비활성), 관통 텍스트, 히트 파티클.

const STORE = preload("res://scripts/native_player_projectile_store.gd")
const FIELD_OWNER = preload("res://scripts/native_field_mob_hit_owner.gd")
const TRAIL_MAX := 6 # 35179 normalBow: arcMissile/fireball/mhBlade/plagueBlade 아님 → 6
const REFUSED_TRUTHY_FLAGS: Array[String] = ["fireball", "fireBeamProj", "burstBolt", "explosive", "magic",
	"mhBlade", "plagueHoming", "plagueBlade", "venomBlade", "ltnChaser", "bladeOrb", "iceBlade", "blueBean",
	"parryBlueBean", "_parryMagicShot", "_fromTurret", "_uqRico", "_uqEcho", "arcMissile", "maliceHunt",
	"bladeShard", "lightning", "omniHoming", "ebHoming", "home", "_bladeEchoPath", "_fromRainbow"]
const REFUSED_POSITIVE_FIELDS: Array[String] = ["chainMax", "_aoeR", "_aoeDmg", "_mhMaxPierce", "_arcLock"]
const REQUIRED_NUMBERS: Array[String] = ["x", "y", "vx", "vy", "dmg", "el", "maxDist", "dist", "r"]

var _service_ref: WeakRef # 서비스가 carrier를 소유 — 순환 참조(RefCounted 누수) 방지
var _main: Node
var _world: Node2D
var _contact_serial := 0
var _field_owner: Node # 필드몹 owner(Main 자식). 필드몹 목록이 처음 보일 때 생성, seam 바인딩은 첫 실제 접촉 때.

func configure(service: RefCounted, main: Node, world: Node2D) -> bool:
	if _service_ref != null or service == null or not is_instance_valid(main) or not is_instance_valid(world):
		return false
	_service_ref = weakref(service)
	_main = main
	_world = world
	return true

func _svc() -> RefCounted:
	return _service_ref.get_ref() if _service_ref != null else null

static func is_normal_bow_packet(packet: Variant) -> bool:
	return packet is STORE.Packet and packet.fields is Dictionary and packet.fields.get("normalBow") is bool \
		and packet.fields.get("normalBow") == true

## pass(또는 단일 스텝)당 1회 계산하는 공용 환경: 현재 G·필드몹 목록 참조 + provider/유니크 값의 지연 캐시.
## 원본처럼 _uBowPoisonRicochet(35433)는 첫 적 접촉 때, _uBowPierce(35562)는 _pierceRate>0 관통 판정 때만 읽는다
## (값은 pass 안에서 장비가 바뀌지 않으므로 같다). 실측(헤드리스): provider 사전 ~0.28ms·u_eq ~0.49ms/회 —
## 발·틱마다 읽지 않도록 캐시한다(빈 pass는 비용 0).
func build_env() -> Dictionary:
	var env := {"ok": false, "reason": ""}
	var g: Variant = _main.source_state.read_current_g() if is_instance_valid(_main.get("source_state")) else null
	if not g is Dictionary:
		env.reason = "current_g_not_ready"
		return env
	# 35279 _hurtFieldMobs 입력(읽기 전용 참조). 필드몹 목록이 비어 있으면 원본도 0 — owner 생성 없이 비용 0.
	if FIELD_OWNER.has_field_mobs(g):
		var owner: Node = _ensure_field_owner()
		if owner == null:
			env.reason = "field_mob_owner_not_installed"
			return env
		env["field"] = owner.read_env(g)
	env.ok = true
	return env

func _ensure_field_owner() -> Node:
	if is_instance_valid(_field_owner) and _field_owner.get_parent() == _main:
		return _field_owner
	# PC-BOSS-PARITY: 부팅 때 설치된 공용 owner(앵글러 interaction 바인딩 포함)가 있으면 그것을 쓴다(owner 1개).
	var installed: Node = _main.get_node_or_null("PCFieldMobHitOwner")
	if is_instance_valid(installed) and installed.get_script() == FIELD_OWNER:
		_field_owner = installed
		return installed
	var owner: Node = FIELD_OWNER.new()
	owner.name = "PCFieldMobHitOwner"
	if not owner.configure(_main):
		owner.free()
		return null
	_main.add_child(owner)
	_field_owner = owner
	return owner

func read_field_owner_snapshot() -> Dictionary:
	return _field_owner.snapshot() if is_instance_valid(_field_owner) else {"bound": false, "installed": false}

func _env_providers(env: Dictionary) -> Dictionary:
	if not env.has("providers"):
		env["providers"] = _main.get_native_normal_enemy_damage_provider_callbacks()
	return env.providers

func _env_unique(env: Dictionary, stat: String) -> Variant:
	if not env.has(stat):
		env[stat] = _unique_from(_env_providers(env), stat)
	return env[stat]

## 쓰기 전 사전 검사. 실패 시 이유 문자열(빈 문자열 = 진행 가능).
func preflight(packet: RefCounted, sp: float, env: Dictionary = {}) -> String:
	if not is_normal_bow_packet(packet):
		return "packet_not_normal_bow_store_packet"
	if not (is_finite(sp) and sp >= 0.0):
		return "source_sp_invalid"
	var f: Dictionary = packet.fields
	for key in REQUIRED_NUMBERS:
		if not _num(f.get(key)):
			return "normalbow_packet_field_not_number:" + key
	if float(f.dmg) != floor(float(f.dmg)):
		return "normalbow_packet_dmg_not_integral"
	for key in REFUSED_TRUTHY_FLAGS:
		if _truthy(f.get(key)):
			return "normalbow_packet_branch_unported:" + key
	for key in REFUSED_POSITIVE_FIELDS:
		if _num(f.get(key)) and float(f[key]) > 0.0:
			return "normalbow_packet_branch_unported:" + key
	if not f.get("_hitSet") is Dictionary:
		return "normalbow_packet_hit_set_shape_unsupported"
	if f.has("_lcGrace") and _truthy(f.get("_lcGrace")):
		return "normalbow_packet_branch_unported:_lcGrace"
	if env.is_empty():
		env = build_env()
	if env.get("ok") != true:
		return str(env.get("reason"))
	return ""

## 패킷 1발 1스텝. 반환 status:
##   FLYING / BOUNCED(같은 패킷 반전, 계속 비행) / DEAD_DISTANCE / DEAD_WALL (재활용 없이 제거, 원본 dead 분기) /
##   HIT_RELEASED(재활용) / REFUSED(쓰기0) / PARTIAL(접촉 도중 hurtE 정지 — 패킷 유지, 이후 미처리)
## release는 호출자가 store.retire로 집행한다(pass 안에서는 iteration 규약, 단일 호출은 즉시).
func step(packet: RefCounted, sp: float, ctx: Dictionary, env: Dictionary = {}) -> Dictionary:
	if env.is_empty():
		env = build_env()
	var refused: String = preflight(packet, sp, env)
	if not refused.is_empty():
		return {"status": "REFUSED", "reason": refused, "events": [], "release": null}
	var f: Dictionary = packet.fields
	var events: Array = []
	# 35179 트레일 링(렌더 소비자용 패킷 상태)
	if f.get("_trail") == null:
		var ring: Array = []
		for i in range(TRAIL_MAX):
			ring.append({"x": 0, "y": 0})
		f["_trail"] = ring
		f["_trH"] = 0
		f["_trLen"] = 0
	if f["_trail"] is Array and (f["_trail"] as Array).size() == TRAIL_MAX:
		var slot: Dictionary = f["_trail"][int(f["_trH"]) % TRAIL_MAX]
		slot["x"] = f.x
		slot["y"] = f.y
		f["_trH"] = (int(f["_trH"]) + 1) % TRAIL_MAX
		if int(f["_trLen"]) < TRAIL_MAX:
			f["_trLen"] = int(f["_trLen"]) + 1
	var spd: float = sqrt(float(f.vx) * float(f.vx) + float(f.vy) * float(f.vy))
	if _num(f.get("_bounceCool")) and float(f["_bounceCool"]) > 0.0:
		f["_bounceCool"] = float(f["_bounceCool"]) - sp
	f.x = float(f.x) + float(f.vx) * sp
	f.y = float(f.y) + float(f.vy) * sp
	f.dist = float(f.dist) + spd * sp
	var dead := ""
	if float(f.dist) > float(f.maxDist):
		dead = "DEAD_DISTANCE"
	elif _is_wall(float(f.x), float(f.y)):
		var bounces: int = int(f.get("bounces", 0)) if _num(f.get("bounces")) else 0
		var can_bounce: bool = float(f.dist) < float(f.maxDist) * 0.5 and bounces < 2 # !explosive 사전 보장
		if can_bounce:
			f.x = float(f.x) - float(f.vx) * sp
			f.y = float(f.y) - float(f.vy) * sp
			var esc := 0
			while esc < 5 and _is_wall(float(f.x), float(f.y)):
				f.x = float(f.x) - float(f.vx) * sp
				f.y = float(f.y) - float(f.vy) * sp
				esc += 1
			var h_wall: bool = _is_wall(float(f.x) + float(f.vx) * sp, float(f.y))
			var v_wall: bool = _is_wall(float(f.x), float(f.y) + float(f.vy) * sp)
			if h_wall: f.vx = -float(f.vx)
			if v_wall: f.vy = -float(f.vy)
			if not h_wall and not v_wall:
				f.vx = -float(f.vx)
				f.vy = -float(f.vy)
			f["bounces"] = bounces + 1
			f["_bounceCool"] = 6
			events.append({"event": "wall_reflect", "line": 35236, "packet_id": packet.get_instance_id(),
				"escape_steps": esc, "h_wall": h_wall, "v_wall": v_wall, "bounces": bounces + 1,
				"x": f.x, "y": f.y, "vx": f.vx, "vy": f.vy, "presentation": "addParts_UNPORTED"})
		else:
			dead = "DEAD_WALL"
	if not dead.is_empty():
		events.append({"event": "expired", "line": 35220 if dead == "DEAD_DISTANCE" else 35256,
			"packet_id": packet.get_instance_id(), "presentation": "_addImpact_UNPORTED"})
		return {"status": dead, "events": events, "release": {"recycle": false}}
	var hit := false
	var hit_set: Dictionary = f["_hitSet"]
	# 35279 if(_hurtFieldMobs(p.x,p.y,(p.r||6)+8,p.dmg||p.atk||10,p._hitSet,null)){hit=true;…}
	var fenv: Variant = env.get("field")
	if fenv is Dictionary and fenv.active == true:
		var hit_r: float = (float(f.r) if _truthy(f.r) else 6.0) + 8.0
		var raw_dmg: float = float(f.dmg) if _truthy(f.dmg) else (float(f.atk) if _truthy(f.get("atk")) and _num(f.get("atk")) else 10.0)
		var sc: Dictionary = _field_owner.scan(fenv, float(f.x), float(f.y), hit_r, hit_set)
		if sc.ok != true:
			return {"status": "REFUSED", "reason": str(sc.reason), "events": events, "release": null}
		if not (sc.contacts as Array).is_empty():
			var fm: Dictionary = _field_owner.apply(sc.contacts, raw_dmg, hit_set, func(_line: int, _purpose: String) -> Variant: return _rand_value(env))
			events.append_array(fm.events)
			if not str(fm.get("refused_reason", "")).is_empty():
				return {"status": "REFUSED", "reason": str(fm.refused_reason), "events": events, "release": null}
			if not str(fm.partial_reason).is_empty():
				return {"status": "PARTIAL", "reason": str(fm.partial_reason), "events": events, "release": null}
			if int(fm.n) > 0:
				hit = true
	var query_r: float = float(f.r) + 20.0
	var candidates: Array = _world.query_native_enemies(float(f.x), float(f.y), query_r)
	for e in candidates:
		if not is_instance_valid(e) or e.get("alive") != true:
			continue
		var eid: int = e.get_instance_id()
		if hit_set.has(eid):
			continue
		var er: float = float(e.get("radius")) if e.get("radius") != null else 15.0
		var ex: float = e.global_position.x
		var ey: float = e.global_position.y
		if Vector2(float(f.x), float(f.y)).distance_to(Vector2(ex, ey)) >= er + float(f.r):
			continue
		var ang: float = atan2(ey - float(f.y), ex - float(f.x))
		# 35398 mult — 약점(>=2) 경직 분기(35472)는 미이식 → hurtE 전에 거절(이 접촉 쓰기 0).
		var mult: Variant = _svc().read_enemy_element_multiplier(int(f.el), e)
		if mult == null:
			return {"status": "PARTIAL" if not events.is_empty() and _any_contact(events) else "REFUSED",
				"reason": "element_multiplier_not_ready", "events": events, "release": null}
		if float(mult) >= 2.0:
			return {"status": "PARTIAL" if _any_contact(events) else "REFUSED",
				"reason": "unported_branch_active:weak_point_stun_35472", "events": events, "release": null}
		# 35433 u_d15 _uBowPoisonRicochet: 원본은 hurtE 직후 읽고 >0이면 독 파편 분기(미이식) → 이 접촉의 hurtE 전에 거절.
		var ricochet: Variant = _env_unique(env, "_uBowPoisonRicochet")
		if ricochet == null or float(ricochet) > 0.0:
			return {"status": "PARTIAL" if _any_contact(events) else "REFUSED",
				"reason": "unique_equipment_not_ready:_uBowPoisonRicochet" if ricochet == null else "unported_branch_active:_uBowPoisonRicochet_35433",
				"events": events, "release": null}
		_contact_serial += 1
		var token: String = "pc-arrow:%d:%d" % [packet.get_instance_id(), _contact_serial]
		var receipt: Dictionary = _svc().request_native_hurte(e, int(f.dmg), ang, false, f, int(f.el),
			{"token": token, "caller": "normalBow_carrier_35407"})
		var contact: Dictionary = {"event": "enemy_contact", "line": 35407, "packet_id": packet.get_instance_id(),
			"enemy_id": eid, "dmg_base": int(f.dmg), "mult": mult, "ang": ang, "hurte": receipt}
		events.append(contact)
		if receipt.get("status") not in ["APPLIED", "SOURCE_RETURN"]:
			return {"status": "PARTIAL" if receipt.get("status") == "PARTIAL" or _contact_count(events) > 1 else "REFUSED",
				"reason": "hurte_not_applied:" + str(receipt.get("reason")), "events": events, "release": null}
		# 35433: _uEq('_uBowPoisonRicochet') — preflight에서 0 확인(원본 위치 재조회는 같은 값).
		# 35454/35624 bow_hit, 35473 G.hitStop, 35475 파티클: 표현 미이식(기록).
		contact["presentation"] = ["bow_hit_UNPORTED", "G.hitStop_35473_UNPORTED", "hit_particles_UNPORTED"]
		# 35562 통일 관통
		var pr_raw: Variant = f.get("_pierceRate")
		var pr_rate: float = 0.0
		if _num(pr_raw) and float(pr_raw) > 0.0:
			var ub: Variant = _env_unique(env, "_uBowPierce")
			if ub == null:
				return {"status": "PARTIAL", "reason": "unique_equipment_not_ready:_uBowPierce", "events": events, "release": null}
			pr_rate = float(_js_int(float(pr_raw) * (1.0 + float(ub)))) if float(ub) > 0.0 else float(pr_raw)
		if pr_rate > 0.0:
			# hitSet.has(e) 재검사는 위 스킵과 동일 조건(같은 접촉 안에서 추가 없음)
			hit_set[eid] = true
			f["_pierced"] = (int(f.get("_pierced", 0)) if _num(f.get("_pierced")) else 0) + 1
			var gtd: int = int(floor(pr_rate * 91.0 / 1000.0))
			contact["unified_pierce"] = {"rate": pr_rate, "pierced": f["_pierced"], "guaranteed": gtd}
			if int(f["_pierced"]) <= gtd:
				contact["outcome"] = "pierce_guaranteed_35571"
				hit = false
				continue
			var over: int = int(f["_pierced"]) - gtd
			var survive: float = maxf(0.0, 1.0 - float(over) * 0.1)
			if survive > 0.0:
				var roll: Variant = _rand(env, 35572, "unified_pierce", contact)
				if roll == null:
					return {"status": "PARTIAL", "reason": "rand_not_ready:unified_pierce", "events": events, "release": null}
				if float(roll) < survive:
					contact["outcome"] = "pierce_roll_35572"
					hit = false
					continue
		# 35606 패시브 관통 (normalBow는 _fireXbow가 pierce=XBOW_PIERCE?0.5:0 으로 덮어씀 → 기본 0)
		var pierce: float = float(f.get("pierce", 0)) if _num(f.get("pierce")) else 0.0
		if pierce > 0.0:
			var pmax: float = float(f.pierceMax) if _num(f.get("pierceMax")) and float(f.pierceMax) != 0.0 else 1.0
			var roll2: Variant = _rand(env, 35608, "passive_pierce", contact)
			if roll2 == null:
				return {"status": "PARTIAL", "reason": "rand_not_ready:passive_pierce", "events": events, "release": null}
			var count: float = float(f.get("_pierceCount", 0)) if _num(f.get("_pierceCount")) else 0.0
			if float(roll2) < pierce and count < pmax:
				var p_lv: Variant = _svc().read_passive_number("pPierce")
				if p_lv == null:
					return {"status": "PARTIAL", "reason": "passives_not_ready:pPierce", "events": events, "release": null}
				f["_pierceCount"] = count + 1.0
				f.dmg = _js_int(float(f.dmg) * minf(1.0, 0.85 + float(p_lv) * 0.03))
				hit_set[eid] = true
				contact["outcome"] = "passive_pierce_35608"
				contact["presentation"].append("pierce_text_UNPORTED")
				hit = false
				continue
		# 35617 석궁 킬관통
		if e.get("alive") != true:
			hit_set[eid] = true
			contact["outcome"] = "kill_pierce_35617"
			hit = false
			continue
		contact["outcome"] = "hit_release_35625"
		hit = true
		break
	if hit:
		return {"status": "HIT_RELEASED", "events": events, "release": {"recycle": true}}
	var bounced: bool = false
	for ev in events:
		if ev.get("event") == "wall_reflect":
			bounced = true
	return {"status": "BOUNCED" if bounced else "FLYING", "events": events, "release": null}

func _any_contact(events: Array) -> bool:
	return _contact_count(events) > 0

func _contact_count(events: Array) -> int:
	var n := 0
	for ev in events:
		if ev.get("event") == "enemy_contact" or ev.get("event") == "field_mob_contact": # 필드몹 접촉도 hitSet/HP 쓰기 prefix
			n += 1
	return n

func _is_wall(x: float, y: float) -> bool:
	# 원본 isW — 기존 fireball 경로와 같은 World 판정(main._is_native_fireball_wall = world.is_world_blocked).
	return _world.is_world_blocked(Vector2(x, y))

func _unique_from(providers: Dictionary, stat: String) -> Variant:
	var cb: Variant = providers.get("u_eq")
	if not cb is Callable or not (cb as Callable).is_valid():
		return null
	var result: Variant = cb.call(stat)
	if not result is Dictionary or str(result.get("status")) != "READY" or not _num(result.get("value")):
		return null
	return float(result.value)

func _rand_value(env: Dictionary) -> Variant:
	var cb: Variant = _env_providers(env).get("rand")
	if not cb is Callable or not (cb as Callable).is_valid():
		return null
	var result: Variant = cb.call()
	if not result is Dictionary or str(result.get("status")) != "READY" or not _num(result.get("value")):
		return null
	return float(result.value)

func _rand(env: Dictionary, line: int, purpose: String, contact: Dictionary) -> Variant:
	var cb: Variant = _env_providers(env).get("rand")
	if not cb is Callable or not (cb as Callable).is_valid():
		return null
	var result: Variant = cb.call()
	if not result is Dictionary or str(result.get("status")) != "READY" or not _num(result.get("value")):
		return null
	if not contact.has("rng_draws"):
		contact["rng_draws"] = []
	contact["rng_draws"].append({"line": line, "purpose": purpose, "value": float(result.value)})
	return float(result.value)

static func _num(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))

static func _truthy(v: Variant) -> bool:
	if v == null or v is STORE.SourceUndefined: return false
	if v is bool: return v
	if v is int or v is float: return float(v) != 0.0 and not is_nan(float(v))
	if v is String: return not (v as String).is_empty()
	return true

static func _js_int(value: float) -> int:
	var low: int = int(value) & 0xffffffff
	return low - 0x100000000 if low >= 0x80000000 else low
