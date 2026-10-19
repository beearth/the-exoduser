extends RefCounted
##
## holy_dome_flat_heal_source/producer.gd — 원 updatePlayer 회복의 영역 flat 리젠의 HP 대입만 (manual source phase).
## TASK GODOT-PORT-HOLY-DOME-FLAT-HEAL-SOURCE-FIRST-20261013
##
## 자체 clock/_physics_process/_process/Node/GUI/pause/expiry 없음. 호출자가 plan_native(sp)/advance_native(sp) 를
## 원 phase 위치에서 명시 호출한다. G/P/zone 쓰기 0. HP 는 hp_sink(new_hp) 1회 호출로만 나간다.
## MP/ST flat 대입은 이 모듈 소유가 아니다 — 같은 guard/flat 수량을 readonly 패킷으로 돌려 ENGINE 이 원 HP→MP→ST 순서로 소비.
##
## 원값(R game.html, 읽기전용):
##   let _inHolyDome=false,_hdLv=1;                                                   (game.html:33348)
##   if(G._fireZones){for(...){const _hd=G._fireZones[_hdi];
##     if(_hd.type==='holyDome'&&dst(P.x,P.y,_hd.x,_hd.y)<_hd.r){_inHolyDome=true;_hdLv=_hd.lv||1;break}}}   (33349)
##   if(_inHolyDome&&P.hp>0){const _hdFlat=(10+_hdLv*2)/60*sp*_fuseMul('holyDome');
##     P.hp=Math.min(P.mhp,P.hp+_hdFlat);P.mp=...;P.st=...}                         (33352, HP 대입만 소유)
##   function _fuseStar(skId){if(!P._fused)return 0; ... _FUSE_PAIRS/_FUSE_GEM_GROUPS ...}  (45027-45032, 외부 공급)
##   function _fuseMul(skId){const s=_fuseStar(skId);const _fm=s>=2?1+(s-1)*.2:1;
##     return skId==='chargeBoost'||skId==='magicBlink'?_fm:_fm*(1+_eqAffix('skillBoost'))}  (45088)
## 판정(_inHolyDome + 첫 매치 index)은 holy_dome_presence_source 가 소유. 여기서 거리/type 술어를 다시 돌리지 않는다.
## _fuseMul 수식은 detonate_blast.fuse_mul 재사용. _fuseStar/_FUSE 테이블은 이 모듈에 없다(외부 reader 필수).
## 자연 HP(33356-33358)의 pRegen/lifeHealPow/pAbund/pPred 배율과 hp<mhp guard 는 flat 에 없다(원 동일).

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const Detonate := preload("res://port_modules/detonate_blast/producer.gd")

const STATUS_READY := "READY"
const STATUS_NOT_READY := "NOT_READY"

const OUTCOME_OUTSIDE := "outside"            # _inHolyDome false → 분기 0
const OUTCOME_HP_GUARD_SKIP := "hp_guard_skip" # P.hp>0 false → _fuseMul/대입 0
const OUTCOME_HEAL := "heal"                  # HP 대입 1회

const LEVEL_ORIGIN_RAW := "raw"
const LEVEL_ORIGIN_DEFAULT_ABSENT := "default_absent"   # _hd.lv undefined ||1
const LEVEL_ORIGIN_DEFAULT_FALSY := "default_falsy"     # null/false/0/NaN/'' ||1

const SKILL_ID := "holyDome"
const SKILL_BOOST_ID := "skillBoost"
const ZONE_TYPE_HOLY_DOME := "holyDome"
const G_FIELD_FIRE_ZONES := "_fireZones"
const FLAT_BASE := 10.0
const FLAT_PER_LEVEL := 2.0
const FLAT_DIV := 60.0
const SOURCE_REF := "game.html:33348-33352,45027-45032,45088"

var _presence_reader: Callable = Callable()   # () -> holy_dome_presence_source.presence_detail()
var _world_reader: Callable = Callable()      # () -> 현재 G (presence 와 같은 reader)
var _player_reader: Callable = Callable()     # () -> 현재 P (presence 와 같은 reader)
var _fuse_star_reader: Callable = Callable()  # (skId) -> {status:"READY", value:finite, reason}
var _skill_boost_reader: Callable = Callable()  # (id) -> equipment_affix_reader.eq_affix(id)
var _hp_sink: Callable = Callable()           # (new_hp: float) -> bool
var _owners: Array[Object] = []               # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _coerce: AffixReader = AffixReader.new()  # js_to_number 재사용 (readonly helper)
var _counts: Dictionary = { "presence": 0, "g": 0, "p": 0, "star": 0, "boost": 0, "dispatch": 0 }


func configure(presence_reader: Callable, current_world_reader: Callable, current_player_reader: Callable,
		fuse_star_reader: Callable, skill_boost_reader: Callable, hp_sink: Callable) -> Dictionary:
	_presence_reader = presence_reader
	_world_reader = current_world_reader
	_player_reader = current_player_reader
	_fuse_star_reader = fuse_star_reader
	_skill_boost_reader = skill_boost_reader
	_hp_sink = hp_sink
	_owners.clear()
	for c in [presence_reader, current_world_reader, current_player_reader, fuse_star_reader, skill_boost_reader, hp_sink]:
		_retain(c)
	_configured = true
	return readiness()


func clear() -> void:
	_presence_reader = Callable()
	_world_reader = Callable()
	_player_reader = Callable()
	_fuse_star_reader = Callable()
	_skill_boost_reader = Callable()
	_hp_sink = Callable()
	_owners.clear()
	_configured = false


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


## 진단: reader/sink 호출 횟수 (short-circuit / dispatch 검사용).
func read_counts() -> Dictionary:
	return _counts.duplicate()


## 바인딩 준비도(값 호출 없음). guard 가 fuse 를 쓰지 않는 tick 에도 필수 공급자 누락은 여기 표시된다.
func readiness() -> Dictionary:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	if not _presence_reader.is_valid():
		missing.append("presence_reader")
	if not _world_reader.is_valid():
		missing.append("current_world_reader")
	if not _player_reader.is_valid():
		missing.append("current_player_reader")
	if not _fuse_star_reader.is_valid():
		missing.append("fuse_star_reader")
	if not _skill_boost_reader.is_valid():
		missing.append("skill_boost_reader")
	if not _hp_sink.is_valid():
		missing.append("hp_sink")
	return { "ready": missing.is_empty(), "status": STATUS_READY if missing.is_empty() else STATUS_NOT_READY, "missing": missing }


func _result() -> Dictionary:
	return {
		"status": STATUS_NOT_READY, "reason": "", "outcome": "", "source": SOURCE_REF,
		"sp": null, "presence_status": "", "selected_index": -1,
		"level_raw": null, "level_raw_present": false, "level_origin": "", "level": null,
		"star": null, "skill_boost": null, "fuse_mul": null, "flat_amount": null,
		"hp_packet": null,
		# ENGINE 용 readonly handoff: 같은 if guard + 같은 _hdFlat 로 MP→ST 를 원 순서대로 소비.
		"shared_guard_active": false, "mpst_flat_amount": null,
	}


func _nr(r: Dictionary, reason: String) -> Dictionary:
	r.status = STATUS_NOT_READY
	r.reason = reason
	r.hp_packet = null
	r.shared_guard_active = false
	r.mpst_flat_amount = null
	return r


static func _is_num(v: Variant) -> bool:
	return (v is int or v is float) and not (v is bool)


static func _finite(v: Variant) -> bool:
	return _is_num(v) and is_finite(float(v))


## 원 33348-33352 HP 부분 계획(쓰기 0). READY → outcome outside|hp_guard_skip|heal, 그 외 NOT_READY + packet null.
func plan_native(sp: Variant) -> Dictionary:
	var r := _result()
	if not _configured:
		return _nr(r, "not_configured")
	if not _finite(sp):
		return _nr(r, "sp_unsupported:non_finite_or_non_number")
	if float(sp) < 0.0:
		return _nr(r, "sp_unsupported:negative")
	r.sp = float(sp)
	# ── _inHolyDome (presence 소유) ──
	if not _presence_reader.is_valid():
		return _nr(r, "presence_reader_missing")
	_counts["presence"] += 1
	var d: Variant = _presence_reader.call()
	if not (d is Dictionary) or not d.has("status"):
		return _nr(r, "presence_detail_unsupported_shape")
	r.presence_status = str(d.status)
	if not (d.status is String) or d.status != STATUS_READY:
		return _nr(r, "presence_not_ready:%s:%s" % [str(d.status), str(d.get("reason", ""))])
	var pv: Variant = d.get("value", null)
	if not (pv is bool):
		return _nr(r, "presence_value_not_bool")
	if not pv:
		r.status = STATUS_READY
		r.outcome = OUTCOME_OUTSIDE     # && short-circuit: P.hp/_fuseMul 읽기 0
		return r
	var idx_v: Variant = d.get("index", -1)
	if not (idx_v is int) or int(idx_v) < 0:
		return _nr(r, "presence_index_invalid")
	var idx: int = idx_v
	r.selected_index = idx
	# ── _hdLv=_hd.lv||1 : 같은 현재 G reader 로 선택 index 의 zone 만 읽는다(재스캔 0) ──
	if not _world_reader.is_valid():
		return _nr(r, "current_world_reader_missing")
	_counts["g"] += 1
	var g: Variant = _world_reader.call()
	if not (g is Dictionary):
		return _nr(r, "world_authority_null_or_unsupported")
	var zones: Variant = g.get(G_FIELD_FIRE_ZONES, null)
	if not (zones is Array) or idx >= zones.size():
		return _nr(r, "selected_zone_missing")
	var z: Variant = zones[idx]
	# 일치 확인(type 동일성만; 거리 술어 재평가 아님). presence 와 다른 G 를 읽었으면 NR.
	if not (z is Dictionary) or not (z.get("type", null) is String) or String(z.type) != ZONE_TYPE_HOLY_DOME:
		return _nr(r, "selected_zone_mismatch")
	var lv: Variant = _source_level(z, r)
	if lv == null:
		return _nr(r, String(r.reason))
	# ── P.hp>0 (원시 현재값, 기본값 없음) ──
	if not _player_reader.is_valid():
		return _nr(r, "current_player_reader_missing")
	_counts["p"] += 1
	var p: Variant = _player_reader.call()
	if not (p is Dictionary):
		return _nr(r, "player_authority_null_or_unsupported")
	if not p.has("hp") or not _finite(p.hp):
		return _nr(r, "player_hp_unsupported")
	if not (float(p.hp) > 0.0):
		r.status = STATUS_READY
		r.outcome = OUTCOME_HP_GUARD_SKIP   # _fuseMul/대입 0
		return r
	# ── _fuseMul('holyDome') : _fuseStar → _eqAffix('skillBoost') 순서 ──
	if not _fuse_star_reader.is_valid():
		return _nr(r, "fuse_star_reader_missing")
	_counts["star"] += 1
	var sr: Variant = _fuse_star_reader.call(SKILL_ID)
	if not (sr is Dictionary) or not (sr.get("status", null) is String) or sr.status != STATUS_READY:
		return _nr(r, "fuse_star_not_ready:%s" % [str(sr.get("reason", "")) if sr is Dictionary else "unsupported_shape"])
	if not _finite(sr.get("value", null)):
		return _nr(r, "fuse_star_non_finite_or_non_number")
	r.star = float(sr.value)
	if not _skill_boost_reader.is_valid():
		return _nr(r, "skill_boost_reader_missing")
	_counts["boost"] += 1
	var br: Variant = _skill_boost_reader.call(SKILL_BOOST_ID)
	if not (br is Dictionary) or not (br.get("status", null) is String) or br.status != STATUS_READY:   # READY_PARTIAL 포함 비권위 → NR
		return _nr(r, "skill_boost_not_ready:%s:%s" % [str(br.get("status", "")) if br is Dictionary else "unsupported_shape", str(br.get("reason", "")) if br is Dictionary else ""])
	if not _finite(br.get("value", null)):
		return _nr(r, "skill_boost_non_finite_or_non_number")
	r.skill_boost = float(br.value)
	var fm: float = Detonate.fuse_mul(float(r.star), float(r.skill_boost))
	r.fuse_mul = fm
	# (10+_hdLv*2)/60*sp*_fuseMul — 좌→우
	var flat: float = (FLAT_BASE + float(lv) * FLAT_PER_LEVEL) / FLAT_DIV * float(r.sp) * fm
	r.flat_amount = flat
	# P.hp=Math.min(P.mhp,P.hp+_hdFlat) — hp<mhp guard 없음 (full/overcap downclamp 포함)
	if not p.has("mhp") or not _finite(p.mhp):
		return _nr(r, "player_mhp_unsupported")
	var hp_before: float = float(p.hp)
	var mhp: float = float(p.mhp)
	var sum: float = hp_before + flat
	var new_hp: float = NAN if is_nan(sum) else minf(mhp, sum)
	if not is_finite(new_hp):
		return _nr(r, "hp_output_non_finite_unsupported")
	r.status = STATUS_READY
	r.outcome = OUTCOME_HEAL
	r.hp_packet = { "hp_before": hp_before, "mhp": mhp, "new_hp": new_hp }
	r.shared_guard_active = true
	r.mpst_flat_amount = flat
	return r


## _hd.lv||1 그 뒤 `_hdLv*2` 의 ToNumber. 지원 원시값만; 그 외 shape 는 null + r.reason.
func _source_level(z: Dictionary, r: Dictionary) -> Variant:
	if not z.has("lv"):
		r.level_raw_present = false
		r.level_origin = LEVEL_ORIGIN_DEFAULT_ABSENT
		r.level = 1.0
		return 1.0
	var raw: Variant = z.lv
	r.level_raw_present = true
	if not (raw == null or raw is bool or raw is int or raw is float or raw is String):
		r.level_raw = type_string(typeof(raw))
		r.reason = "zone_level_unsupported_shape:" + type_string(typeof(raw))
		return null
	r.level_raw = raw
	if not AffixReader.js_truthy(raw):
		r.level_origin = LEVEL_ORIGIN_DEFAULT_FALSY
		r.level = 1.0
		return 1.0
	r.level_origin = LEVEL_ORIGIN_RAW
	var n: float = _coerce.js_to_number(raw, true)
	r.level = n
	return n


## plan + HP sink 1회. NR/outside/guard-skip → dispatch 0. sink 반환 true 만 applied.
func advance_native(sp: Variant) -> Dictionary:
	if not _hp_sink.is_valid():
		var m := _nr(_result(), "hp_sink_missing")
		m["dispatched"] = false
		m["applied"] = false
		return m
	var r := plan_native(sp)
	r["dispatched"] = false
	r["applied"] = false
	if String(r.status) != STATUS_READY or String(r.outcome) != OUTCOME_HEAL:
		return r
	_counts["dispatch"] += 1
	var ok: Variant = _hp_sink.call(float(r.hp_packet.new_hp))
	r.dispatched = true
	r.applied = ok is bool and ok
	if not r.applied:
		r.status = STATUS_NOT_READY
		r.reason = "hp_sink_rejected"
		r.shared_guard_active = false
		r.mpst_flat_amount = null
	return r
