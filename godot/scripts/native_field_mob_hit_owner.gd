extends Node
## PC-FOLLOWUPS (2026-10-21) — 플레이어 탄 → 필드몹 피격 owner (원본 `_hurtFieldMobs` G18733–18756).
## 원본 대응:
##   G18734 fbs = G._fieldBosses || (G._fieldBoss ? [G._fieldBoss] : [])
##   G18629 _fmCanHit(m,isFb): !m||hp<=0 → false; 필드보스/화마귀 = !hid||tpT>0||emT>0; 웜 = !(phase=='hide'&&hideT>54)
##   G18628 _fmXY(m,1): tpT>0 이면 (tpX,tpY)
##   G18738 dst(x,y,fp)<hitR+(fb.r||120) && !hitSet.has(fb) → hitSet.add(fb) → _fmApply(fb,dmg,1) → applied면 n++
##   G18699 _fmApply: hitCd>0 → false / dmg=max(1,ToInt32(dmg)); hp-=dmg; hitCd=8 / hp<=0 → _fmDeathFx·_fbMarkDead
##   G18677 _fmDeathFx: _deathFxDone 가드·기록, 고어 롤 Math.random 3회(18692 common/rare, 18693 index, 18694 isFb 추가)
##   G61036 _fbMarkDead: alive=false, 슬롯 null, _fieldBoss 해제, 생존 0이면 _fbDone=true
## 소유 경계:
##   - 필드보스(앵글러 4슬롯)의 HP·최종 사망 반영은 Mac family(native_demo11_anglers.gd)의 기존 PC readback seam
##     `bind_pc_source(owner, event)` 신호 (index, hp, final_death, serial)로만 쓴다. 이 owner가 그 신호의 PC 측이다.
##     family readback은 hp<0을 받지 않으므로 최종 사망은 hp=0으로 보고한다(슬롯이 바로 null이 되어 원본의 음수 hp는
##     더 이상 관측되지 않는다). hitCd=8·_deathFxDone은 family가 쓰지 않는 원본 _fmApply/_fmDeathFx 필드라 PC가 같은 record에 쓴다.
##   - 피해 수식 복제 0: 필드몹 피해는 원본도 hurtE가 아니라 _fmApply(정수화·최소1)만 쓴다. 그 한 줄이 전부다.
##   - 웜(G._worms)·화마귀(G._fireDevils)는 이 owner가 쓰지 않는다. 실제 접촉이 생기는 스텝만 쓰기 전에 거절한다
##     (`field_mob_owner_unported:_worms|_fireDevils`). 해당 family의 PC hit owner(bind_hit_owner)는 아직 제품 연결이 없다.
##   - 표현(데미지 숫자 addTxt, addParts, showPH '필드보스 처치!', deathFX/시체/고어 조각/임팩트/shake/flash)은 미이식 — 영수증에 기록.
## 바인딩은 첫 실제 필드보스 접촉 때 1회(lazy). 다른 owner가 이미 seam을 잡고 있으면 그 접촉은 쓰기 전에 NOT_READY.
## 틱 경로에서 get_method_list/get_property_list/get_signal_list 호출 0.

signal field_boss_health(index: int, hp: float, final_death: bool, serial: int)
const EVENT := &"field_boss_health"
const FB_SLOTS := 4

var _main: Node
var _serial := 0
var _bound_family: WeakRef
var _scans := 0 # 틱 경로 카운터(사전 쓰기 없이 int 증가만)
var counts := {"contacts": 0, "applied": 0, "hitcd_skips": 0, "final_deaths": 0, "refused": 0, "partial": 0}

func configure(main: Node) -> bool:
	if is_instance_valid(_main) or not is_instance_valid(main):
		return false
	_main = main
	return true

static func _truthy(v: Variant) -> bool:
	if v == null: return false
	if v is bool: return v
	if v is int or v is float: return float(v) != 0.0 and not is_nan(float(v))
	if v is String: return not (v as String).is_empty()
	return true

static func _num(v: Variant, fallback: float) -> float:
	return float(v) if (v is int or v is float) and is_finite(float(v)) else fallback

static func _js_int(value: float) -> int:
	var low: int = int(value) & 0xffffffff
	return low - 0x100000000 if low >= 0x80000000 else low

## G18629 (isFb=true): 필드보스·화마귀
static func can_hit_fb(m: Variant) -> bool:
	if not m is Dictionary or _num(m.get("hp"), 0.0) <= 0.0:
		return false
	return not _truthy(m.get("hid")) or _num(m.get("tpT"), 0.0) > 0.0 or _num(m.get("emT"), 0.0) > 0.0

## G18629 (isFb=false): 웜
static func can_hit_worm(m: Variant) -> bool:
	if not m is Dictionary or _num(m.get("hp"), 0.0) <= 0.0:
		return false
	return not (str(m.get("phase", "")) == "hide" and _num(m.get("hideT"), 0.0) > 54.0)

## G18628 _fmXY(m,1)
static func fb_xy(m: Dictionary) -> Vector2:
	if _num(m.get("tpT"), 0.0) > 0.0:
		return Vector2(_num(m.get("tpX"), 0.0), _num(m.get("tpY"), 0.0))
	return Vector2(_num(m.get("x"), 0.0), _num(m.get("y"), 0.0))

static func _r_or(m: Dictionary, fallback: float) -> float:
	var r: Variant = m.get("r")
	return float(r) if _truthy(r) and (r is int or r is float) else fallback

## 필드몹 목록이 하나라도 비어 있지 않은가(G18734/18744/18751 루프가 0회가 아닌가). 읽기 전용, 할당 0.
static func has_field_mobs(g: Dictionary) -> bool:
	for key in ["_fieldBosses", "_worms", "_fireDevils"]:
		var v: Variant = g.get(key)
		if v is Array and not (v as Array).is_empty():
			return true
	return g.get("_fieldBoss") is Dictionary

## pass(또는 단일 스텝)당 1회: 현재 G와 family 참조만 캐시(읽기 전용).
func read_env(g: Dictionary) -> Dictionary:
	var fbs: Variant = g.get("_fieldBosses")
	var single: Variant = g.get("_fieldBoss")
	var list: Array = []
	var singleton := false
	if fbs is Array:
		list = fbs
	elif single is Dictionary:
		list = [single]
		singleton = true
	var worms: Variant = g.get("_worms")
	var devils: Variant = g.get("_fireDevils")
	# null/사망 슬롯은 pass 안에서 되살아나지 않는다(family 출생은 World tick) → 후보만 남김. hp는 scan 때 다시 본다.
	var live: Array = []
	for i in range(list.size()):
		if list[i] is Dictionary and _num(list[i].get("hp"), 0.0) > 0.0:
			live.append([i, list[i]])
	return {"g": g, "fbs": list, "fb_live": live, "fb_singleton": singleton,
		"worms": worms if worms is Array else [], "devils": devils if devils is Array else [],
		"active": not list.is_empty() or (worms is Array and not (worms as Array).is_empty()) or (devils is Array and not (devils as Array).is_empty())}

## 읽기 전용 스캔(G18734–18755 순서). 쓰기·RNG 0. hit_set 키는 Godot instance id 계약.
## 반환 {ok, reason, contacts:[{index, record, key, xy}]}. ok=false면 그 스텝은 쓰기 전에 거절해야 한다.
func scan(fenv: Dictionary, x: float, y: float, hit_r: float, hit_set: Dictionary) -> Dictionary:
	_scans += 1
	var at := Vector2(x, y)
	var contacts: Array = []
	for pair in fenv.get("fb_live", []):
		var i: int = pair[0]
		var fb: Dictionary = pair[1]
		if not can_hit_fb(fb):
			continue
		var fp: Vector2 = fb_xy(fb)
		if at.distance_to(fp) >= hit_r + _r_or(fb, 120.0):
			continue
		if fenv.fb_singleton:
			return {"ok": false, "reason": "field_mob_owner_unported:_fieldBoss_singleton_without_slots"}
		var key: Variant = _fb_key(i, fb)
		if key == null:
			return {"ok": false, "reason": "field_boss_actor_identity_not_ready:index%d" % i}
		if hit_set.has(key):
			continue
		contacts.append({"index": i, "record": fb, "key": key, "xy": fp})
	# G18744 웜 / G18751 화마귀: 실제 접촉이 생길 때만 거절(존재만으로는 원본도 무영향).
	for w in fenv.worms:
		if can_hit_worm(w) and at.distance_to(Vector2(_num(w.get("x"), 0.0), _num(w.get("y"), 0.0))) < hit_r + _r_or(w, 56.0):
			return {"ok": false, "reason": "field_mob_owner_unported:_worms"}
	for fd in fenv.devils:
		if can_hit_fb(fd) and at.distance_to(Vector2(_num(fd.get("x"), 0.0), _num(fd.get("y"), 0.0))) < hit_r + _r_or(fd, 100.0):
			return {"ok": false, "reason": "field_mob_owner_unported:_fireDevils"}
	if contacts.is_empty():
		return {"ok": true, "reason": "", "contacts": contacts}
	var ready: String = _seam_ready(fenv.g)
	if not ready.is_empty():
		return {"ok": false, "reason": ready}
	return {"ok": true, "reason": "", "contacts": contacts}

## hitSet 키: family가 같은 record로 그리는 실제 actor 노드의 instance id(fireball 계약 hit_set_key_kind=godot_instance_id).
func _fb_key(index: int, fb: Dictionary) -> Variant:
	var family: Variant = _main.get("native_demo_anglers") if is_instance_valid(_main) else null
	if not family is Node or not is_instance_valid(family):
		return null
	for view in family.read_targets():
		if view.has_meta("field_index") and int(view.get_meta("field_index")) == index and is_same(view.get("record"), fb):
			return view.get_instance_id()
	return null

## 쓰기 전 seam 준비 확인(읽기 전용) — family readback 가드(G 동일·stage0·비 arena·슬롯 배열)와 이 owner의 바인딩.
func _seam_ready(g: Dictionary) -> String:
	var family: Variant = _main.get("native_demo_anglers")
	if not family is Node or not is_instance_valid(family) or family.get_parent() != _main.get("world"):
		return "field_boss_family_not_installed"
	if not is_same(_main.source_state.read_current_g(), g):
		return "field_boss_g_not_current"
	if g.get("stage") != 0 or _truthy(g.get("_bossArena")) or not g.get("_fieldBosses") is Array:
		return "field_boss_readback_guard_closed(stage0/!_bossArena/_fieldBosses)"
	var owner: Variant = family.get("_pc_owner")
	if owner is Node and is_instance_valid(owner) and owner != self:
		return "field_boss_pc_source_bound_to_other_owner"
	if not is_inside_tree() or not _main.is_ancestor_of(self):
		return "field_boss_pc_owner_not_in_main"
	return ""

func _ensure_bound() -> bool:
	var family: Node = _main.get("native_demo_anglers")
	if _bound_family != null and _bound_family.get_ref() == family and family.get("_pc_owner") == self:
		return true
	if not family.bind_pc_source(self, EVENT):
		return false
	_bound_family = weakref(family)
	return true

## 스캔 결과 집행(G18737–18741 + _fmApply/_fmDeathFx/_fbMarkDead). rand: Callable(line, purpose) -> Variant(float|null).
## 반환 {n, events[], partial_reason}. partial_reason이 비어 있지 않으면 그 위치에서 정지(앞선 쓰기 유지).
func apply(contacts: Array, raw_dmg: float, hit_set: Dictionary, rand: Callable) -> Dictionary:
	var n := 0
	var events: Array = []
	if not contacts.is_empty() and not _ensure_bound():
		counts.refused += 1
		return {"n": 0, "events": events, "partial_reason": "", "refused_reason": "field_boss_pc_source_bind_refused"}
	var g: Dictionary = _main.source_state.read_current_g()
	for c in contacts:
		counts.contacts += 1
		var fb: Dictionary = c.record
		var index: int = c.index
		var ev := {"event": "field_mob_contact", "line": 35279, "kind": "_fieldBosses", "index": index,
			"key": c.key, "x": c.xy.x, "y": c.xy.y, "hp_before": fb.get("hp"), "hitCd_before": fb.get("hitCd", 0)}
		events.append(ev)
		hit_set[c.key] = true # G18738 hitSet.add(fb) — hitCd 거절보다 먼저
		if _num(fb.get("hitCd"), 0.0) > 0.0: # G18700
			counts.hitcd_skips += 1
			ev["applied"] = false
			ev["outcome"] = "hitcd_reject_18700"
			continue
		var dmg: int = maxi(1, _js_int(raw_dmg)) # G18701
		var hp_after: float = _num(fb.get("hp"), 0.0) - float(dmg)
		fb["hitCd"] = 8 # G18702 (hp는 family readback이 쓴다)
		ev["dmg"] = dmg
		ev["presentation"] = ["addTxt_dmg_18704_UNPORTED", "addParts_18705_UNPORTED"]
		var final_death: bool = hp_after <= 0.0
		if final_death:
			# G18677 _fmDeathFx: _deathFxDone 가드 후 고어 롤 3회(isFb) — hurtE 42729–42731과 같은 provider·원본 순서
			if not _truthy(fb.get("_deathFxDone")):
				fb["_deathFxDone"] = true
				var draws: Array = []
				for spec in [[18692, "fm_gore_common_or_rare"], [18693, "fm_gore_piece_index"], [18694, "fm_gore_fb_extra"]]:
					var v: Variant = rand.call(spec[0], spec[1])
					if v == null:
						counts.partial += 1
						ev["rng_draws"] = draws
						return {"n": n, "events": events, "partial_reason": "rand_not_ready:" + str(spec[1])}
					draws.append({"line": spec[0], "purpose": spec[1], "value": float(v)})
				ev["rng_draws"] = draws
			ev["presentation"].append_array(["deathFX_corpse_gore_impact_shake_flash_18686_UNPORTED", "showPH_fieldboss_slain_18708_UNPORTED"])
		_serial += 1
		var report_hp: float = 0.0 if final_death else hp_after
		field_boss_health.emit(index, report_hp, final_death, _serial)
		var slots: Variant = g.get("_fieldBosses")
		var readback_ok: bool
		if final_death:
			# G61036 _fbMarkDead: alive=false, 슬롯 null, _fieldBoss 해제, 생존 0이면 _fbDone
			readback_ok = slots is Array and index < (slots as Array).size() and slots[index] == null and fb.get("alive") == false \
				and not is_same(g.get("_fieldBoss"), fb) and float(fb.get("hp")) == 0.0
		else:
			readback_ok = slots is Array and is_same(slots[index], fb) and float(fb.get("hp")) == hp_after
		ev["serial"] = _serial
		ev["hp_after"] = fb.get("hp")
		ev["final_death"] = final_death
		ev["fbDone_after"] = g.get("_fbDone")
		if not readback_ok:
			counts.partial += 1
			ev["applied"] = false
			ev["outcome"] = "family_readback_not_applied"
			return {"n": n, "events": events, "partial_reason": "field_boss_family_readback_not_applied:index%d" % index}
		counts.applied += 1
		if final_death: counts.final_deaths += 1
		ev["applied"] = true
		ev["outcome"] = "final_death_18706" if final_death else "hit_18702"
		n += 1
	return {"n": n, "events": events, "partial_reason": ""}

func snapshot() -> Dictionary:
	var family: Variant = _bound_family.get_ref() if _bound_family != null else null
	var c: Dictionary = counts.duplicate()
	c["scans"] = _scans
	return {"bound": family != null and family.get("_pc_owner") == self, "serial": _serial, "counts": c}
