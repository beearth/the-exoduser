extends RefCounted
##
## hp_regeneration_source/producer.gd — 원 HP 자연 리젠 (_hpr / _regenDiv / 가드 쓰기) 수동 phase producer.
## TASK GODOT-PORT-HP-REGENERATION-SOURCE-FIRST-20261013
##
## 원 R(canonical game.html, 읽기전용):
##   pAbundRegen(){return (PASSIVES.pAbund||0)*.05}                                         (game.html:28709)
##   pPredRegen(){return P.hp<=P.mhp*.3?(PASSIVES.pPred||0)*.10:0}                           (game.html:28711)
##   const _hpr=(P.hpR||0)*pRegenMul()*_hdMul*(1+_eqAffix('lifeHealPow'))*(1+pAbundRegen()+pPredRegen());  (33356)
##   const _regenDiv=P.s==='idle'?8:16;                                                       (33357)
##   if(_hpr>0&&P.hp>0&&P.hp<P.mhp){P.hp=Math.min(P.mhp,P.hp+_hpr/_regenDiv*sp)}             (33358)
## 원 phase: holyDome flat(33352) + STMP 율 사전계산(33353~54) 뒤, STMP 쓰기(33359~64) 앞.
##   → 중앙은 holyDome flat 이 쓴 뒤의 현재 HP 를 current_state_reader 로 공급해야 한다.
##
## 이 모듈은 pRegenMul 을 다시 계산하지 않는다 — 완료 regeneration_stat_source.read_regen_mul() 결과를 소비.
## lifeHealPow 는 완료 equipment_affix_reader.eq_affix('lifeHealPow') 결과(기존 lazy 캐시, 무효화는 중앙).
## PASSIVES 는 player_passives_source.read_current_passives() 원 Dictionary|null (boot 중립값 아님).
## in_holy_dome 은 외부 읽기전용 bool(현재 phase 플래그). 영역 판정/flat 은 이 모듈 밖.
##
## 자체 clock/_process 없음. 중앙이 plan_native(sp)/advance_native(sp) 를 직접 호출(PAUSED 면 호출하지 않음).
## 쓰기: hp_sink 단 하나(새 HP 값). P/PASSIVES/INV/캐시/MP/ST/쉴드/포이즈/DOT 쓰기 0.
##
## 지원 범위(완전한 malformed-JS 동등성 주장 아님):
##   비유한 필수 상태/provider 값 → NOT_READY(packet null, dispatch 0).
##   유한 입력에서 계산된 _hpr 비유한은 원 그대로: +Inf 는 sp>0 에서 mhp cap, NaN/-Inf 는 가드 false → guard_skip.
##   잔여 보호: hp+_hpr/div*sp 가 NaN(+Inf*sp0) 이면 NOT_READY(원은 P.hp=NaN). 음수 sp 는 미지원 NOT_READY.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"

const ACTION_WRITE := "write"
const ACTION_GUARD_SKIP := "guard_skip"

const PROVIDER_REGEN_MUL_RESULT := "regen_mul_result"          # ()->regeneration_stat_source.read_regen_mul() 결과
const PROVIDER_LIFE_HEAL_POW_RESULT := "life_heal_pow_result"  # ()->equipment_affix_reader.eq_affix('lifeHealPow') 결과
const PROVIDER_CURRENT_PASSIVES := "current_passives"          # ()->현재 PASSIVES Dictionary|null
const PROVIDER_IN_HOLY_DOME := "in_holy_dome"                  # ()->bool (원 _inHolyDome, 현재 phase 값)
const REQUIRED_PROVIDERS: Array[String] = [
	PROVIDER_REGEN_MUL_RESULT, PROVIDER_LIFE_HEAL_POW_RESULT, PROVIDER_CURRENT_PASSIVES, PROVIDER_IN_HOLY_DOME,
]

const AFFIX_ID := "lifeHealPow"
const KEY_P_ABUND := "pAbund"
const KEY_P_PRED := "pPred"
const ABUND_COEF: float = 0.05     # *.05
const PRED_COEF: float = 0.10      # *.10
const PRED_HP_RATIO: float = 0.3   # P.hp<=P.mhp*.3 (포함)
const HOLY_DOME_MUL: float = 2.0   # _hdMul=_inHolyDome?2:1
const DIV_IDLE: float = 8.0
const DIV_OTHER: float = 16.0
const STATE_IDLE := "idle"

## 이 모듈 범위 선언 — Main/공개 플레이 준비 주장 아님.
const SCOPE := { "main_ready": false, "public_play": 0, "owns_clock": false }

var _state_reader: Callable = Callable()   # ()->현재 P Dictionary (hp, mhp, s, hpR)
var _providers: Dictionary = {}
var _hp_sink: Callable = Callable()        # (new_hp: float)->bool  true = 실제 HP 에 기록됨
var _owners: Array[Object] = []            # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _unknown_keys: Array[String] = []
var _configured: bool = false
var _last: Dictionary = {}
var _counters: Dictionary = {}
var _coerce: AffixReader = AffixReader.new()   # JS ToNumber 전용(인벤토리 미바인딩, 캐시 사용 0)


func _init() -> void:
	_reset_counters()


# ───────────────────────── configure ─────────────────────────

func configure(current_state_reader: Callable, providers: Dictionary, hp_sink: Callable) -> Dictionary:
	_state_reader = current_state_reader
	_providers = {}
	_unknown_keys.clear()
	_owners.clear()
	_retain(current_state_reader)
	_retain(hp_sink)
	for k in providers:
		var ks := String(k)
		if not REQUIRED_PROVIDERS.has(ks):
			_unknown_keys.append(ks)
			continue
		var c: Variant = providers[k]
		if c is Callable:
			_providers[ks] = c
			_retain(c)
	_hp_sink = hp_sink
	_configured = true
	_last = {}
	_reset_counters()
	return readiness()


func clear() -> void:
	_state_reader = Callable()
	_providers = {}
	_hp_sink = Callable()
	_unknown_keys.clear()
	_owners.clear()
	_configured = false
	_last = {}


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


func _reset_counters() -> void:
	_counters = { "evaluations": 0, "not_ready": 0, "guard_skips": 0, "dispatched": 0, "applied": 0 }


## 출처 모듈 3개 + 외부 holyDome reader → providers Dictionary. 호출자가 각 모듈 바인딩/캐시 무효화를 소유.
static func source_providers(regen_stat: Object, affix_reader: Object, passives_source: Object, in_holy_dome: Callable) -> Dictionary:
	return {
		PROVIDER_REGEN_MUL_RESULT: Callable(regen_stat, "read_regen_mul"),
		PROVIDER_LIFE_HEAL_POW_RESULT: Callable(affix_reader, "eq_affix").bind(AFFIX_ID),
		PROVIDER_CURRENT_PASSIVES: Callable(passives_source, "read_current_passives"),
		PROVIDER_IN_HOLY_DOME: in_holy_dome,
	}


## 바인딩 준비도(값 호출 없음). 값 단위 판정은 plan/advance 마다.
func readiness() -> Dictionary:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	if not _state_reader.is_valid():
		missing.append("current_state_reader")
	for k in REQUIRED_PROVIDERS:
		var c: Callable = _providers.get(k, Callable())
		if not c.is_valid():
			missing.append(k)
	if not _hp_sink.is_valid():
		missing.append("hp_sink")
	for k in _unknown_keys:
		missing.append("unknown_provider:" + k)
	return {
		"ready": missing.is_empty(), "status": READY if missing.is_empty() else NOT_READY,
		"missing": missing, "required_providers": REQUIRED_PROVIDERS.duplicate(),
	}


func counters() -> Dictionary:
	return _counters.duplicate()


func last_result() -> Dictionary:
	return _last.duplicate(true)


# ───────────────────────── 공용 helper ─────────────────────────

static func _fail(reason: String) -> Dictionary:
	return { "ok": false, "reason": reason }


static func _safe_int(v: int) -> bool:
	return v <= AffixReader.JS_SAFE_INTEGER_MAX and v >= -AffixReader.JS_SAFE_INTEGER_MAX


static func _call(c: Variant, name: String) -> Dictionary:
	if not (c is Callable):
		return _fail(name + "_unbound")
	var cc: Callable = c
	if cc.is_null():
		return _fail(name + "_unbound")
	if not cc.is_valid():
		return _fail(name + "_target_invalid")
	return { "ok": true, "value": cc.call() }


## 필수 유한 숫자 필드(기본값 없음).
static func _required_number(p: Dictionary, field: String) -> Dictionary:
	if not p.has(field):
		return _fail("P.%s_missing" % field)
	var v: Variant = p[field]
	var n: float
	if v is int:
		if not _safe_int(v):
			return _fail("P.%s_unsafe_integer" % field)
		n = float(v)
	elif v is float:
		n = v
	else:
		return _fail("P.%s_unsupported_type:%s" % [field, type_string(typeof(v))])
	if not is_finite(n):
		return _fail("P.%s_not_finite:%s" % [field, str(n)])
	return { "ok": true, "n": n }


## 원 (x||0) 를 곱셈 피연산자로: falsy→0, true→1, 숫자→그대로, 숫자 문자열→ToNumber. 객체/배열 → 미지원.
func _or_zero_number(raw: Variant, present: bool, label: String) -> Dictionary:
	if not present or not AffixReader.js_truthy(raw):
		return { "ok": true, "n": 0.0 }
	if raw is int:
		if not _safe_int(raw):
			return _fail(label + "_unsafe_integer")
		return { "ok": true, "n": float(raw) }
	if raw is bool or raw is float or raw is String or raw is StringName:
		var n: float = _coerce.js_to_number(raw, true)
		if not is_finite(n):
			return _fail("%s_not_finite:%s" % [label, str(n)])
		return { "ok": true, "n": n }
	return _fail("%s_unsupported_shape:%s" % [label, type_string(typeof(raw))])


## 현재 PASSIVES 를 이 호출에서 새로 읽어 (PASSIVES.<key>||0).
func _passive_term(key: String, order: Array) -> Dictionary:
	order.append("PASSIVES." + key)
	var rc := _call(_providers.get(PROVIDER_CURRENT_PASSIVES), PROVIDER_CURRENT_PASSIVES)
	if not bool(rc.ok):
		return rc
	var v: Variant = rc.value
	if v == null:
		return _fail("current_PASSIVES_null (exact 사유: player_passives_source.current_status())")
	if not (v is Dictionary):
		return _fail("current_PASSIVES_unsupported_shape:" + type_string(typeof(v)))
	var d: Dictionary = v
	return _or_zero_number(d.get(key), d.has(key), "PASSIVES." + key)


## 상류 결과 Dictionary 중 status=READY + 유한 숫자 value 만 권한. partial/throw/NR/비유한 → 실패.
static func _authority_value(res: Variant, label: String) -> Dictionary:
	if not (res is Dictionary):
		return _fail("%s_result_unsupported_shape:%s" % [label, type_string(typeof(res))])
	var r: Dictionary = res
	var st: String = String(r.get("status", ""))
	if st != READY:
		return _fail("%s_%s:%s" % [label, st if not st.is_empty() else "status_missing", String(r.get("reason", ""))])
	var v: Variant = r.get("value")
	if not (v is float or v is int):
		return _fail("%s_value_unsupported_type:%s" % [label, type_string(typeof(v))])
	var n: float = float(v)
	if not is_finite(n):
		return _fail("%s_value_not_finite:%s" % [label, str(n)])
	return { "ok": true, "n": n }


# ───────────────────────── 평가 ─────────────────────────

## 원 33356~33358 평가. 쓰기 없음. 실패 시 첫 실패 지점에서 읽기 중단.
func _evaluate(sp: Variant) -> Dictionary:
	_counters.evaluations += 1
	var order: Array = []
	var out := { "ready": false, "status": NOT_READY, "reason": "", "action": null, "packet": null,
		"trace": null, "read_order": order, "dispatched": false, "applied": false }
	var bad := func(reason: String) -> Dictionary:
		_counters.not_ready += 1
		out.reason = reason
		return out
	if not _configured:
		return bad.call("not_configured")
	if not _unknown_keys.is_empty():
		return bad.call("unknown_provider:" + ",".join(_unknown_keys))
	if not (sp is float or sp is int):
		return bad.call("sp_unsupported_type:" + type_string(typeof(sp)))
	var spf: float = float(sp)
	if not is_finite(spf):
		return bad.call("sp_not_finite:" + str(spf))
	if spf < 0.0:
		return bad.call("sp_negative_unsupported:" + str(spf))

	var pc := _call(_state_reader, "current_state_reader")
	if not bool(pc.ok):
		return bad.call(String(pc.reason))
	if pc.value == null:
		return bad.call("P_null")
	if not (pc.value is Dictionary):
		return bad.call("P_unsupported_shape:" + type_string(typeof(pc.value)))
	var p: Dictionary = pc.value

	# (P.hpR||0) — 키 부재는 원 ||0 (P 컨테이너가 바인딩된 경우에만 유효)
	order.append("P.hpR")
	var hr := _or_zero_number(p.get("hpR"), p.has("hpR"), "P.hpR")
	if not bool(hr.ok):
		return bad.call(String(hr.reason))
	var hp_r: float = hr.n

	order.append("pRegenMul()")
	var mc := _call(_providers.get(PROVIDER_REGEN_MUL_RESULT), PROVIDER_REGEN_MUL_RESULT)
	if not bool(mc.ok):
		return bad.call(String(mc.reason))
	var mr := _authority_value(mc.value, "pRegenMul()")
	if not bool(mr.ok):
		return bad.call(String(mr.reason))
	var regen_mul: float = mr.n

	order.append("_hdMul")
	var hc := _call(_providers.get(PROVIDER_IN_HOLY_DOME), PROVIDER_IN_HOLY_DOME)
	if not bool(hc.ok):
		return bad.call(String(hc.reason))
	if not (hc.value is bool):
		return bad.call("in_holy_dome_not_bool:" + type_string(typeof(hc.value)))
	var hd_mul: float = HOLY_DOME_MUL if bool(hc.value) else 1.0

	order.append("_eqAffix('lifeHealPow')")
	var ac := _call(_providers.get(PROVIDER_LIFE_HEAL_POW_RESULT), PROVIDER_LIFE_HEAL_POW_RESULT)
	if not bool(ac.ok):
		return bad.call(String(ac.reason))
	var ar := _authority_value(ac.value, "_eqAffix('lifeHealPow')")
	if not bool(ar.ok):
		return bad.call(String(ar.reason))
	var heal_pow: float = ar.n

	# pAbundRegen() — 항상 평가
	var ab := _passive_term(KEY_P_ABUND, order)
	if not bool(ab.ok):
		return bad.call(String(ab.reason))
	var abund: float = float(ab.n) * ABUND_COEF

	# pPredRegen() — P.hp<=P.mhp*.3 일 때만 PASSIVES.pPred 를 읽는다
	order.append("P.hp")
	var hpv := _required_number(p, "hp")
	if not bool(hpv.ok):
		return bad.call(String(hpv.reason))
	order.append("P.mhp")
	var mhpv := _required_number(p, "mhp")
	if not bool(mhpv.ok):
		return bad.call(String(mhpv.reason))
	var hp: float = hpv.n
	var mhp: float = mhpv.n
	var pred_active: bool = hp <= mhp * PRED_HP_RATIO
	var pred: float = 0.0
	if pred_active:
		var pr := _passive_term(KEY_P_PRED, order)
		if not bool(pr.ok):
			return bad.call(String(pr.reason))
		pred = float(pr.n) * PRED_COEF

	# 원 좌→우: hpR*mul*hd*(1+heal)*((1+abund)+pred)
	# 유한 입력의 곱 overflow(+Inf/-Inf/NaN)는 원 그대로 둔다 — 아래 원 가드 비교가 처리.
	var hpr: float = hp_r * regen_mul * hd_mul * (1.0 + heal_pow) * (1.0 + abund + pred)

	order.append("P.s")
	if not p.has("s"):
		return bad.call("P.s_missing")
	var s: Variant = p["s"]
	if not (s is String or s is StringName):
		return bad.call("P.s_unsupported_type:" + type_string(typeof(s)))
	var regen_div: float = DIV_IDLE if String(s) == STATE_IDLE else DIV_OTHER

	var trace := {
		"hpR": hp_r, "regen_mul": regen_mul, "hd_mul": hd_mul, "life_heal_pow": heal_pow,
		"abund": abund, "pred_active": pred_active, "pred": pred, "hpr": hpr,
		"state": String(s), "regen_div": regen_div, "hp": hp, "mhp": mhp, "sp": spf,
	}
	out.trace = trace
	out.ready = true
	out.status = READY

	# if(_hpr>0&&P.hp>0&&P.hp<P.mhp) — 위반 시 쓰기 0(과충전 하향 clamp 없음). NaN/-Inf _hpr 는 원 비교 false.
	if not (hpr > 0.0 and hp > 0.0 and hp < mhp):
		var why: String
		if is_nan(hpr):
			why = "_hpr_NaN"
		elif not hpr > 0.0:
			why = "_hpr<=0"
		else:
			why = "P.hp<=0" if not hp > 0.0 else "P.hp>=P.mhp"
		_counters.guard_skips += 1
		out.action = ACTION_GUARD_SKIP
		out.reason = why
		return out
	# +Inf _hpr, sp>0 → Math.min 이 mhp 로 cap (원 그대로). +Inf*0(sp=0) 은 원에서 P.hp=NaN —
	# 잔여 invalid-output 보호: 실제 HP 에 NaN 을 쓰지 않도록 min 전에 NOT_READY.
	var unbounded: float = hp + hpr / regen_div * spf
	if is_nan(unbounded):
		out.ready = false
		out.status = NOT_READY
		out.trace = null
		return bad.call("new_hp_NaN (source P.hp=NaN; _hpr=%s sp=%s)" % [str(hpr), str(spf)])
	var new_hp: float = minf(mhp, unbounded)
	if not is_finite(new_hp):
		out.ready = false
		out.status = NOT_READY
		out.trace = null
		return bad.call("new_hp_not_finite:" + str(new_hp))
	out.action = ACTION_WRITE
	out.packet = { "hp_before": hp, "hp_after": new_hp, "hpr": hpr, "regen_div": regen_div, "sp": spf }
	return out


# ───────────────────────── public API ─────────────────────────

## 계획만(쓰기 0). action=write 면 packet.hp_after 가 원 P.hp 대입값.
func plan_native(sp: Variant) -> Dictionary:
	var r := _evaluate(sp)
	_last = r.duplicate(true)
	return r


## 계획 후 action=write 면 hp_sink(new_hp) 를 정확히 1회 호출. sink 미바인딩이면 provider 호출 전 NOT_READY.
func advance_native(sp: Variant) -> Dictionary:
	if not _hp_sink.is_valid():
		_counters.not_ready += 1
		var nr := { "ready": false, "status": NOT_READY, "reason": "hp_sink_unbound" if _hp_sink.is_null() else "hp_sink_target_invalid",
			"action": null, "packet": null, "trace": null, "read_order": [], "dispatched": false, "applied": false }
		_last = nr.duplicate(true)
		return nr
	var r := _evaluate(sp)
	if r.action == ACTION_WRITE:
		var ret: Variant = _hp_sink.call(float(r.packet.hp_after))
		_counters.dispatched += 1
		r.dispatched = true
		r.applied = ret is bool and bool(ret)
		if r.applied:
			_counters.applied += 1
	_last = r.duplicate(true)
	return r
