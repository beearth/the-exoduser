extends RefCounted
##
## resource_regeneration_source/producer.gd — 원 updatePlayer 자연 ST/MP 리젠 (plan + 단일 sink dispatch).
## TASK GODOT-PORT-RESOURCE_REGENERATION_SOURCE-FIRST-20261013
##
## 자체 clock/_physics_process/_process 없음. 중앙(ENGINE)이 native60 sp 를 넘겨 advance_native 를 호출한다.
## 상태는 매 호출마다 state_reader 에서 현재값으로 읽는다(캐시/스냅샷 없음). Player/World/P/G 직접 쓰기 0 —
## 결과는 오직 하나의 resource_sink(packet) 로만 나간다.
## reader/provider/sink/field 누락 → NOT_READY + command null + dispatch 0. 중립 1/발명 rate 0.
##
## 원값(R game.html, 읽기전용):
##   _hdMul = _inHolyDome?2:1                                                        (game.html:33350)
##   _mpr = (P.mpR + Σslot mpRegen||0) * pMRegenMul() * _hdMul                        (game.html:33353)
##   _str = (P.stR + Σslot stRegen||0) * pRegenMul()  * _hdMul                        (game.html:33354)
##     slots: wp sh bt ar hm bw gl pt nc rg1 rg2 cp
##   guard  !(window._parryLesson?.active && window._parryLesson.chapter===2)          (game.html:33360)
##   idle : P.st=Math.min(P.mst,P.st+_str/8*sp);  P.mp=Math.min(P.mmp,P.mp+_mpr/8*sp)  (game.html:33361)
##   else : P.st=Math.min(P.mst,P.st+_str/16*sp); _mpMul=P.s==='beam'?.5:1;
##          P.mp=Math.min(P.mmp,P.mp+_mpr/16*_mpMul*sp)                               (game.html:33362)
##   pRegenMul()=1+PASSIVES.pRegen*.03, pMRegenMul()=1+PASSIVES.pMRegen*.03          (game.html:28703-28704, passives 소유)
## 제외: holyDome flat(33352), HP 리젠(33356-33358), 쉴드 리젠(33392-33395), 5장 ST 감소(33382-33390),
##       Q/E 진입·hold drain·release, 포션/피격/세이브/복원, 패시브·레벨 효과 분배 — 타 owner.
##
## 율 경로 2개(명시 configure 로 택일, 전환/clear 시 이전 바인딩·owner 폐기):
##   configure()              — LEGACY aggregate/호환: (P.base + Σprovider) * mul * hd. 원 base-first 12항 누적 순서 아님
##                              (예: P.stR=1e16, t1=-1e16, t2=1 → 원 1, aggregate 0). source-exact/최종 Main ready 아님.
##   configure_source_rates() — STRICT: regeneration_stat_source.read_source_rates() 원 순서 pre-holy 율(_mpr→_str)
##                              을 1회 읽고 _mpr=_mpr_pre_holy*_hdMul, _str=_str_pre_holy*_hdMul. legacy provider 미평가.

const STATUS_READY := "READY"
const STATUS_NOT_READY := "NOT_READY"

const COMMAND_APPLY := "apply_natural_regen"
const COMMAND_GUARD_SKIP := "guard_skip"   # 원 guard 가 false → 원본도 아무 대입 없음

const IDLE_DIV: float = 8.0       # _str/8, _mpr/8
const ACTIVE_DIV: float = 16.0    # _str/16, _mpr/16
const BEAM_MP_MUL: float = 0.5    # P.s==='beam'?.5:1
const HOLY_DOME_MUL: float = 2.0  # _inHolyDome?2:1
const PARRY_LESSON_CHAPTER: int = 2

const STATE_IDLE := "idle"
const STATE_BEAM := "beam"

## 필수 provider 키 → 원 표현식
const PROVIDER_REGEN_MUL := "regen_mul"            # pRegenMul()
const PROVIDER_MREGEN_MUL := "mregen_mul"          # pMRegenMul()
const PROVIDER_EQUIP_ST_REGEN := "equip_st_regen"  # Σslot (x().stRegen||0)
const PROVIDER_EQUIP_MP_REGEN := "equip_mp_regen"  # Σslot (x().mpRegen||0)
const PROVIDER_IN_HOLY_DOME := "in_holy_dome"      # _inHolyDome (G._fireZones type holyDome, dst<r)
const REQUIRED_PROVIDERS := [
	PROVIDER_REGEN_MUL, PROVIDER_MREGEN_MUL, PROVIDER_EQUIP_ST_REGEN, PROVIDER_EQUIP_MP_REGEN, PROVIDER_IN_HOLY_DOME,
]

## guard_context 키 (중앙이 현재 프레임 값으로 전달)
const GUARD_PARRY_LESSON_ACTIVE := "parry_lesson_active"    # window._parryLesson?.active
const GUARD_PARRY_LESSON_CHAPTER := "parry_lesson_chapter"  # window._parryLesson.chapter (active 일 때만 필요)

## 원 P 필드 (두 모드 공통 필수 — STRICT 에서도 stR/mpR 는 supplier base 와 대조, 합성 0 없음)
const REQUIRED_STATE_FIELDS := ["s", "st", "mst", "mp", "mmp", "stR", "mpR"]

## 율 경로 모드
const MODE_UNCONFIGURED := "unconfigured"
const MODE_LEGACY_AGGREGATE := "legacy_aggregate"
const MODE_STRICT_SOURCE_RATES := "strict_source_rates"

## STRICT source_rate_reader 결과 계약 (regeneration_stat_source.read_source_rates())
##   {ready:true, status:"READY", reason, value:{_mpr_pre_holy, _str_pre_holy}, mp:{status,value,base…}, st:{…}, holy_dome:"external"}
const RATES_READY := "READY"
const RATE_MP_PRE_HOLY := "_mpr_pre_holy"
const RATE_ST_PRE_HOLY := "_str_pre_holy"
const RATES_HOLY_DOME_EXTERNAL := "external"

var _state_reader: Callable = Callable()
var _providers: Dictionary = {}
var _rate_reader: Callable = Callable()  # STRICT 전용
var _holy_dome: Callable = Callable()    # STRICT 전용 (외부 holyDome owner)
var _sink: Callable = Callable()
var _owners: Array[Object] = []  # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _mode: String = MODE_UNCONFIGURED
var _dispatch_count: int = 0
var _last: Dictionary = {}


## LEGACY aggregate. state_reader: Callable()->Dictionary(원 P 형태), providers: REQUIRED_PROVIDERS → Callable, resource_sink: Callable(packet)->bool
func configure(state_reader: Callable, providers: Dictionary, resource_sink: Callable) -> Dictionary:
	var prev: Array = _owners.duplicate()  # 재바인딩 대상 owner 가 retain 전에 해제되지 않도록 반환까지 유지
	clear()
	_state_reader = state_reader
	_providers = providers.duplicate()
	_sink = resource_sink
	_retain(state_reader)
	_retain(resource_sink)
	for key in _providers:
		var v: Variant = _providers[key]
		if v is Callable:
			_retain(v)
	_mode = MODE_LEGACY_AGGREGATE
	prev.clear()
	return readiness()


## STRICT source-exact. state_reader: 현재 원 P (supplier player_reader 와 같은 reader),
## source_rate_reader: Callable()->read_source_rates() 결과, in_holy_dome: Callable()->bool, resource_sink: Callable(packet)->bool.
## legacy provider 는 받지도/평가하지도 않는다. 기본값 공급 없음.
func configure_source_rates(state_reader: Callable, source_rate_reader: Callable, in_holy_dome: Callable, resource_sink: Callable) -> Dictionary:
	var prev: Array = _owners.duplicate()
	clear()
	_state_reader = state_reader
	_rate_reader = source_rate_reader
	_holy_dome = in_holy_dome
	_sink = resource_sink
	_retain(state_reader)
	_retain(source_rate_reader)
	_retain(in_holy_dome)
	_retain(resource_sink)
	_mode = MODE_STRICT_SOURCE_RATES
	prev.clear()
	return readiness()


func clear() -> void:
	_state_reader = Callable()
	_providers = {}
	_rate_reader = Callable()
	_holy_dome = Callable()
	_sink = Callable()
	_owners.clear()
	_mode = MODE_UNCONFIGURED


func mode() -> String:
	return _mode


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


func dispatch_count() -> int:
	return _dispatch_count


func last_result() -> Dictionary:
	return _last.duplicate(true)


## 바인딩 준비도(값 호출 없음). 값 단위 판정은 plan_native 에서 매번 수행.
func readiness() -> Dictionary:
	var missing: Array[String] = []
	if _mode == MODE_UNCONFIGURED:
		missing.append("not_configured")
	if not _state_reader.is_valid():
		missing.append("state_reader")
	if _mode == MODE_STRICT_SOURCE_RATES:
		if not _rate_reader.is_valid():
			missing.append("source_rate_reader")
		if not _holy_dome.is_valid():
			missing.append("provider:" + PROVIDER_IN_HOLY_DOME)
	else:
		for key in REQUIRED_PROVIDERS:
			var v: Variant = _providers.get(key, null)
			var valid := false
			if v is Callable:
				var c: Callable = v
				valid = c.is_valid()
			if not valid:
				missing.append("provider:" + String(key))
	if not _sink.is_valid():
		missing.append("resource_sink")
	return {
		"ready": missing.is_empty(), "status": STATUS_READY if missing.is_empty() else STATUS_NOT_READY, "missing": missing,
		"mode": _mode, "source_exact": _mode == MODE_STRICT_SOURCE_RATES,
	}


static func _not_ready(reason: String) -> Dictionary:
	return { "status": STATUS_NOT_READY, "ready": false, "reason": reason, "command": null, "packet": null }


## 유한 숫자만 허용. int/float 외(bool/null/String) 및 NaN/Inf → 실패.
static func _num(v: Variant) -> Variant:
	if v is int:
		return float(v)
	if v is float:
		var f: float = v
		if is_nan(f) or is_inf(f):
			return null
		return f
	return null


func _call_provider(key: String) -> Dictionary:
	var v: Variant = _providers.get(key, null)
	if not (v is Callable):
		return { "ok": false, "reason": "provider_missing:" + key }
	var c: Callable = v
	if not c.is_valid():
		return { "ok": false, "reason": "provider_invalid:" + key }
	return { "ok": true, "v": c.call() }


static func _is_str(v: Variant, s: String) -> bool:
	return v is String and String(v) == s


## STRICT 결과 계약 검증. 유효하면 "" , 아니면 정확한 NOT_READY 사유.
func _source_rates_invalid(raw: Variant, nums: Dictionary) -> String:
	if not (raw is Dictionary):
		return "source_rates_not_dictionary"
	var r: Dictionary = raw
	if not (r.get("status", null) is String):
		return "source_rates_status_missing"
	if String(r["status"]) != RATES_READY:
		return "source_rates_not_ready:%s:%s" % [String(r["status"]), str(r.get("reason", ""))]
	if not (r.get("ready", null) is bool) or not bool(r["ready"]):
		return "source_rates_contradictory:ready"
	if not (r.get("value", null) is Dictionary):
		return "source_rates_value_not_dictionary"
	var v: Dictionary = r["value"]
	for k in [RATE_MP_PRE_HOLY, RATE_ST_PRE_HOLY]:
		if not v.has(k):
			return "source_rates_value_missing:" + String(k)
		if _num(v[k]) == null:
			return "source_rates_value_not_finite_number:" + String(k)
	if v.size() != 2:
		return "source_rates_value_unexpected_keys"
	var why := _rate_detail_invalid(r, "mp", float(_num(v[RATE_MP_PRE_HOLY])), "mpR", nums)
	if not why.is_empty():
		return why
	why = _rate_detail_invalid(r, "st", float(_num(v[RATE_ST_PRE_HOLY])), "stR", nums)
	if not why.is_empty():
		return why
	if not _is_str(r.get("holy_dome", null), RATES_HOLY_DOME_EXTERNAL):
		return "source_rates_contradictory:holy_dome"
	return ""


## 세부 mp/st: READY + value 일치 + base 가 이 tick 의 현재 P 필드와 동일(base 0 대체/다른 P 금지).
func _rate_detail_invalid(r: Dictionary, key: String, pre: float, field: String, nums: Dictionary) -> String:
	var d: Variant = r.get(key, null)
	if not (d is Dictionary):
		return "source_rates_detail_missing:" + key
	var dd: Dictionary = d
	var dv: Variant = _num(dd.get("value", null))
	if not _is_str(dd.get("status", null), RATES_READY) or dv == null or float(dv) != pre:
		return "source_rates_contradictory:" + key
	var b: Variant = _num(dd.get("base", null))
	if b == null or float(b) != float(nums[field]):
		return "source_rates_base_mismatch:" + field
	return ""


## STRICT 율: 원 33350 _hdMul(외부 holyDome) → 33353/33354 율(supplier 1회 호출 내부에서 _mpr 먼저, _str 다음).
func _strict_rates(nums: Dictionary) -> Dictionary:
	var hd: Variant = _holy_dome.call()
	if not (hd is bool):
		return { "ok": false, "reason": "provider_not_bool:" + PROVIDER_IN_HOLY_DOME }
	var raw: Variant = _rate_reader.call()
	var why := _source_rates_invalid(raw, nums)
	if not why.is_empty():
		return { "ok": false, "reason": why }
	var rr: Dictionary = raw
	var v: Dictionary = rr["value"]
	return {
		"ok": true, "hd_mul": HOLY_DOME_MUL if bool(hd) else 1.0,
		"mp_pre": float(_num(v[RATE_MP_PRE_HOLY])), "st_pre": float(_num(v[RATE_ST_PRE_HOLY])),
	}


## 순수 계획. 공유 상태 쓰기/sink 호출 없음.
func plan_native(sp: Variant, guard_context: Variant) -> Dictionary:
	var r := _plan(sp, guard_context)
	r["mode"] = _mode
	return r


func _plan(sp: Variant, guard_context: Variant) -> Dictionary:
	var rd := readiness()
	if not bool(rd.ready):
		return _not_ready("not_ready:" + ",".join(PackedStringArray(rd.missing)))
	var spf: Variant = _num(sp)
	if spf == null:
		return _not_ready("sp_invalid")
	if float(spf) < 0.0:
		return _not_ready("sp_negative_unsupported")
	if not (guard_context is Dictionary):
		return _not_ready("guard_context_missing")
	var gc: Dictionary = guard_context
	# 1) guard — 원 순서: _mpr/_str 계산(부작용 없음) 후 guard. 여기선 guard 입력 유효성만 먼저 확인.
	if not gc.has(GUARD_PARRY_LESSON_ACTIVE) or not (gc[GUARD_PARRY_LESSON_ACTIVE] is bool):
		return _not_ready("guard_field_missing:" + GUARD_PARRY_LESSON_ACTIVE)
	var lesson_active: bool = gc[GUARD_PARRY_LESSON_ACTIVE]
	var lesson_blocks := false
	if lesson_active:
		if not gc.has(GUARD_PARRY_LESSON_CHAPTER) or not (gc[GUARD_PARRY_LESSON_CHAPTER] is int):
			return _not_ready("guard_field_missing:" + GUARD_PARRY_LESSON_CHAPTER)
		lesson_blocks = int(gc[GUARD_PARRY_LESSON_CHAPTER]) == PARRY_LESSON_CHAPTER
	# 2) 현재 P (매 호출 새로 읽음)
	var raw: Variant = _state_reader.call()
	if not (raw is Dictionary):
		return _not_ready("state_reader_returned_non_dictionary")
	var state: Dictionary = raw
	for f in REQUIRED_STATE_FIELDS:
		if not state.has(f):
			return _not_ready("field_missing:" + String(f))
	if not (state["s"] is String or state["s"] is StringName):
		return _not_ready("field_not_string:s")
	var p_s: String = String(state["s"])
	var nums := {}
	for f in ["st", "mst", "mp", "mmp", "stR", "mpR"]:
		var n: Variant = _num(state[f])
		if n == null:
			return _not_ready("field_not_finite_number:" + String(f))
		nums[f] = n
	var hd_mul: float
	var mpr: float
	var str_: float
	var extra := {}
	if _mode == MODE_STRICT_SOURCE_RATES:
		# 3s) 원 순서 pre-holy 율 1회 + 외부 holyDome. legacy provider 미평가.
		var sr := _strict_rates(nums)
		if not bool(sr.ok):
			return _not_ready(String(sr.reason))
		hd_mul = sr.hd_mul
		# 4s) 원 33353 → 33354: ((P.base+t1+…+t12)*mul) * _hdMul — 재결합 없음
		mpr = float(sr.mp_pre) * hd_mul
		str_ = float(sr.st_pre) * hd_mul
		extra = { RATE_MP_PRE_HOLY: sr.mp_pre, RATE_ST_PRE_HOLY: sr.st_pre, "rate_path": MODE_STRICT_SOURCE_RATES }
	else:
		# 3) provider (현재값)
		var vals := {}
		for key in [PROVIDER_EQUIP_MP_REGEN, PROVIDER_MREGEN_MUL, PROVIDER_EQUIP_ST_REGEN, PROVIDER_REGEN_MUL]:
			var r := _call_provider(key)
			if not bool(r.ok):
				return _not_ready(String(r.reason))
			var n: Variant = _num(r.v)
			if n == null:
				return _not_ready("provider_not_finite_number:" + String(key))
			vals[key] = n
		var hd := _call_provider(PROVIDER_IN_HOLY_DOME)
		if not bool(hd.ok):
			return _not_ready(String(hd.reason))
		if not (hd.v is bool):
			return _not_ready("provider_not_bool:" + PROVIDER_IN_HOLY_DOME)
		hd_mul = HOLY_DOME_MUL if bool(hd.v) else 1.0
		# 4) _mpr, _str (원 33353 → 33354 순서; aggregate 묶음 — 위 LEGACY 주석)
		mpr = (float(nums.mpR) + float(vals[PROVIDER_EQUIP_MP_REGEN])) * float(vals[PROVIDER_MREGEN_MUL]) * hd_mul
		str_ = (float(nums.stR) + float(vals[PROVIDER_EQUIP_ST_REGEN])) * float(vals[PROVIDER_REGEN_MUL]) * hd_mul
		extra = { "rate_path": MODE_LEGACY_AGGREGATE }
	return _apply_plan(spf, p_s, nums, hd_mul, mpr, str_, lesson_blocks, extra)


## 공통: 율 유한 검사 → guard → 원 33361/33362 대입 계획. 두 모드가 같은 식/순서를 쓴다.
func _apply_plan(spf: float, p_s: String, nums: Dictionary, hd_mul: float, mpr: float, str_: float, lesson_blocks: bool, extra: Dictionary) -> Dictionary:
	if is_nan(mpr) or is_inf(mpr):
		return _not_ready("computed_non_finite:_mpr")
	if is_nan(str_) or is_inf(str_):
		return _not_ready("computed_non_finite:_str")
	var base := {
		"status": STATUS_READY, "ready": true, "reason": "",
		"sp": spf, "p_s": p_s, "hd_mul": hd_mul, "_mpr": mpr, "_str": str_,
	}
	base.merge(extra)
	if lesson_blocks:
		base["command"] = COMMAND_GUARD_SKIP
		base["packet"] = null
		return base
	# 5) 원 33361/33362: ST 먼저, MP 다음. Math.min 상한(현재값이 상한 초과면 상한으로 내려감 — 원식 그대로).
	var spv: float = spf
	var st_new: float
	var mp_new: float
	if p_s == STATE_IDLE:
		st_new = minf(float(nums.mst), float(nums.st) + str_ / IDLE_DIV * spv)
		mp_new = minf(float(nums.mmp), float(nums.mp) + mpr / IDLE_DIV * spv)
	else:
		st_new = minf(float(nums.mst), float(nums.st) + str_ / ACTIVE_DIV * spv)
		var mp_mul: float = BEAM_MP_MUL if p_s == STATE_BEAM else 1.0
		mp_new = minf(float(nums.mmp), float(nums.mp) + mpr / ACTIVE_DIV * mp_mul * spv)
	# 상한 Math.min 이 overflow 중간값(+Inf)을 유한 mst/mmp 로 되돌린다(JS 동일). NaN 등 잔여만 거부.
	if is_nan(st_new) or is_inf(st_new):
		return _not_ready("computed_non_finite:st")
	if is_nan(mp_new) or is_inf(mp_new):
		return _not_ready("computed_non_finite:mp")
	base["command"] = COMMAND_APPLY
	base["packet"] = {
		"kind": "natural_regen",
		"source": "game.html:33359-33364",
		"writes": [
			{ "field": "st", "before": nums.st, "value": st_new, "cap_field": "mst" },
			{ "field": "mp", "before": nums.mp, "value": mp_new, "cap_field": "mmp" },
		],
	}
	return base


## plan + 단일 sink dispatch. sink 가 true 를 반환해야 applied.
func advance_native(sp: Variant, guard_context: Variant) -> Dictionary:
	var plan := plan_native(sp, guard_context)
	plan["dispatched"] = 0
	plan["applied"] = false
	if bool(plan.ready) and plan.command == COMMAND_APPLY:
		var ack: Variant = _sink.call(plan.packet.duplicate(true))
		_dispatch_count += 1
		plan["dispatched"] = 1
		plan["applied"] = ack is bool and bool(ack)
		if not bool(plan.applied):
			plan["reason"] = "sink_rejected"
	_last = plan.duplicate(true)
	return plan
