extends RefCounted
##
## player_base_attack_source/producer.gd — 원 applyStats 의 P.baseAtk 단일 대입 producer.
## TASK GODOT-PORT-PLAYER-BASE-ATTACK-SOURCE-FIRST-20261014.
##
## 원 R(canonical game.html, 읽기전용):
##   applyStats @28588: P.baseAtk=G.on?15+((G.stage||1)-1)*2:15;
##     (원 위치: P.poiseR 초기화 @28586 다음, P.speed @28589 앞 — 이 모듈은 그 한 줄만 담당)
##   mkP @29657: baseAtk:8 — 부팅 리터럴(SOURCE_BOOT). 현재값/파생값이 아니다.
##
## 의미: 일반 JS Number. ~~/floor/clamp/양수·유한 정책 없음.
##   G.on 은 JS ToBoolean(AffixReader.js_truthy). falsy(부재=undefined 포함) → 15, G.stage 를 읽지도 변환하지도 않는다.
##   truthy → (G.stage||1) 원 fallback 후 ToNumber(AffixReader.js_to_number) → (n-1)*2 → 15+.
##   소수/음수 stage 보존. 0/null/undefined/false/NaN/"" → 1. truthy 문자열은 기존 js_to_number.
##
## 경계:
##   G/P reader 미바인딩·해제·null 반환, sink 미바인딩 → NOT_READY, sink 호출 0 (15/8 위장 금지).
##   G 가 Dictionary 가 아님 → NOT_READY(원 G 는 항상 객체 — primitive G 재현 안 함).
##   G.on / (on truthy 일 때) G.stage 가 Godot Object → NOT_READY(원 JSON 상태에 없음, 커스텀 valueOf 미지원).
##   원 결과가 NaN/±Infinity(예: stage "abc", "Infinity", 1e308) → SOURCE_NON_FINITE, sink 호출 0.
##     원은 그 값을 그대로 P.baseAtk 에 쓴다. 이 포트는 쓰지 않고 진단만 낸다(15 로 clamp 하지 않음).
##   sink(value)->bool: 고정 P.baseAtk 대입 1회. ack 는 포트 계약이지 게임플레이 gate 가 아니다. latch 0.
##
## 하지 않는 것: applyStats 전체/오케스트레이션/캐시 무효화/RNG/clock/무기/speed/poise.
## 소비자: combat_reference_source meleeRef()/magicRef() 가 같은 P reader 로 새 P.baseAtk 를 읽는다.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"
const SINK_REJECTED := "SINK_REJECTED"
const SINK_READBACK_MISMATCH := "SINK_READBACK_MISMATCH"

const SOURCE := "applyStats@28588 P.baseAtk=G.on?15+((G.stage||1)-1)*2:15"
const SOURCE_PHASE := "after P.poiseR@28586, before P.speed@28589"
const BASE_ATK := 15.0
const PER_STAGE := 2.0
const STAGE_FALLBACK := 1
const SOURCE_BOOT_BASE_ATK := 8   # mkP @29657

var _g_reader: Callable
var _p_reader: Callable
var _sink: Callable
var _coerce: AffixReader = AffixReader.new()   # js_to_number 전용(인벤토리 미바인딩)

var plan_calls := 0
var run_calls := 0
var sink_calls := 0

# ───────────────────────── configure ─────────────────────────

## g_reader(): 현재 G Dictionary. p_reader(): 현재 P Dictionary. sink(value: float) -> bool: P.baseAtk 대입.
## provider 인스턴스는 호출자가 보관해야 한다(Callable 약참조).
func configure(g_reader: Callable, p_reader: Callable, sink: Callable) -> Dictionary:
	_g_reader = g_reader if g_reader.is_valid() else Callable()
	_p_reader = p_reader if p_reader.is_valid() else Callable()
	_sink = sink if sink.is_valid() else Callable()
	return readiness()

## 바인딩만 본다(reader 호출 0). null 반환 등 현재 authority 부재는 plan/run 에서 NOT_READY.
func readiness() -> Dictionary:
	var missing: Array = []
	if not _g_reader.is_valid(): missing.append("G_reader")
	if not _p_reader.is_valid(): missing.append("P_reader")
	if not _sink.is_valid(): missing.append("sink")
	return {"status": READY if missing.is_empty() else NOT_READY, "missing": missing}

# ───────────────────────── reads ─────────────────────────

## mkP 리터럴. 현재 P 와 무관(P 부재 시 8 을 기본값으로 쓰지 않는다).
static func source_boot_base_atk() -> Dictionary:
	return {"value": SOURCE_BOOT_BASE_ATK, "provenance": "SOURCE_BOOT", "source": "mkP@29657 baseAtk:8", "current": false}

## 현재 P.baseAtk. 부재 → present false, value null.
func read_current_base_atk() -> Dictionary:
	var r := {"status": NOT_READY, "provenance": "CURRENT", "present": false, "value": null,
		"is_number": false, "non_finite": false, "reason": ""}
	if not _p_reader.is_valid():
		r.reason = "P_reader_unbound"
		return r
	var p: Variant = _p_reader.call()
	if p == null:
		r.reason = "P_reader_null"
		return r
	if not p is Dictionary:
		r.reason = "P_unsupported_shape:" + type_string(typeof(p))
		return r
	var v: Variant = p.get("baseAtk")
	r.status = READY
	r.present = p.has("baseAtk")
	r.value = v
	r.is_number = v is int or v is float
	r.non_finite = v is float and (is_nan(v) or is_inf(v))
	return r

# ───────────────────────── plan / run ─────────────────────────

func _plan_fail(r: Dictionary, status: String, reason: String) -> Dictionary:
	r.status = status
	r.reason = reason
	return r

## 원 우변만 평가(쓰기 0). READY → value(float). SOURCE_NON_FINITE → value null, source_value 에 원 Number.
func plan() -> Dictionary:
	plan_calls += 1
	var r := {"status": NOT_READY, "value": null, "source_value": null, "source": SOURCE, "reason": "",
		"branch": "", "on_present": false, "on_raw": null, "stage_inspected": false,
		"stage_present": false, "stage_raw": null, "stage_fallback": false, "stage_number": null}
	if not _g_reader.is_valid():
		return _plan_fail(r, NOT_READY, "G_reader_unbound")
	var g: Variant = _g_reader.call()
	if g == null:
		return _plan_fail(r, NOT_READY, "G_reader_null")
	if not g is Dictionary:
		return _plan_fail(r, NOT_READY, "G_unsupported_shape:" + type_string(typeof(g)))
	r.on_present = g.has("on")
	r.on_raw = g.get("on")
	if r.on_raw is Object:
		return _plan_fail(r, NOT_READY, "G.on_unsupported_shape:Object")
	if not AffixReader.js_truthy(r.on_raw):
		r.branch = "G.on_falsy"
		r.source_value = BASE_ATK
		r.value = BASE_ATK
		r.status = READY
		return r
	# G.on truthy: (G.stage||1)-1
	r.branch = "G.on_truthy"
	r.stage_inspected = true
	r.stage_present = g.has("stage")
	r.stage_raw = g.get("stage")
	if r.stage_raw is Object:
		return _plan_fail(r, NOT_READY, "G.stage_unsupported_shape:Object")
	var operand: Variant = r.stage_raw
	if not AffixReader.js_truthy(operand):
		operand = STAGE_FALLBACK
		r.stage_fallback = true
	var n: float = _coerce.js_to_number(operand, true)
	r.stage_number = n
	var v: float = BASE_ATK + (n - 1.0) * PER_STAGE
	r.source_value = v
	if is_nan(v) or is_inf(v):
		return _plan_fail(r, SOURCE_NON_FINITE, "source_writes_" + ("NaN" if is_nan(v) else ("Infinity" if v > 0 else "-Infinity")))
	r.value = v
	r.status = READY
	return r

## 원 대입 1회. 순서: 바인딩 → 현재 P(before) → plan → sink 1회 → readback.
func run() -> Dictionary:
	run_calls += 1
	var out := {"status": NOT_READY, "reason": "", "value": null, "plan": null, "before": null, "after": null,
		"sink_dispatched": false, "ack": null}
	var rd: Dictionary = readiness()
	if rd.status != READY:
		out.reason = "unbound:" + ",".join(PackedStringArray(rd.missing))
		return out
	out.before = read_current_base_atk()
	if out.before.status != READY:
		out.reason = out.before.reason
		return out
	var pl: Dictionary = plan()
	out.plan = pl
	if pl.status != READY:
		out.status = pl.status
		out.reason = pl.reason
		return out
	out.value = pl.value
	sink_calls += 1
	out.sink_dispatched = true
	var ack: Variant = _sink.call(pl.value)
	out.ack = ack
	if not ack is bool:
		out.status = SINK_REJECTED
		out.reason = "ack_not_bool:" + type_string(typeof(ack))
		return out
	if not ack:
		out.status = SINK_REJECTED
		out.reason = "ack_false"
		return out
	out.after = read_current_base_atk()
	var a: Dictionary = out.after
	if a.status != READY or not a.is_number or float(a.value) != float(pl.value):
		out.status = SINK_READBACK_MISMATCH
		out.reason = "readback:" + (a.reason if a.status != READY else str(a.value))
		return out
	out.status = READY
	return out

# ═════════════════════ 공식 packet 계약 + crystal @28602 (2차 범위) ═════════════════════
##
## 공식 packet (ENGINE whitelist, 키 정확히 이것만):
##   {kind, source, writes:[{field:'baseAtk', value, source, expr, before_present, before}]}
## EARLY  : 위 plan() 의 value 를 재계산/변환 없이 감싼다. before/before_present 는 P reader 읽기만.
## CRYSTAL: 원 @28602 `P.baseAtk+=~~_cr.atk;` (앞 @28601 health crystal mhp, 뒤 @28603 DEF crystal).
##   _cr 는 계산하지 않는다 — 중앙이 player_resource_parameters_source.plan_apply_stats() 의
##   values._crystalStats 를 한 번 capture 해서 같은 identity 로 돌려주는 READY wrapper
##   {status:'READY', value:<_cr Dictionary>, stage:<선택 String>} 를 crystal stage 마다 1회 읽는다.
##   ~~ 는 공개 CombatStatFormula.js_to_int32(float(cr.atk)) (원 ToInt32: NaN/±Inf → 0, 부호/wrap 보존).
##   현재 P.baseAtk 는 early 및 사이 단계 이후의 현재값(부팅 8/이전 early 값 재사용 0).
##   JS `+=`: number/null/bool 은 기존 js_to_number 로 숫자 덧셈. String/Array/Dictionary/Object 는
##   원에서 문자열 연결 → SOURCE_NONNUMERIC_DOMAIN(가짜 연결 0). baseAtk 부재 → undefined+n=NaN → SOURCE_NON_FINITE.
## 두 stage 를 이어 부르는 applyStats 전체 메서드는 없다(원 사이 단계는 다른 owner).

const Formula := preload("res://port_modules/combat_stat_formula/producer.gd")

const KIND_EARLY := "apply_stats_base_attack_early"
const EARLY_PACKET_SOURCE := "game.html:28587-28588"
const EARLY_WRITE_SOURCE := "game.html:28588"
const EARLY_EXPR := "P.baseAtk=G.on?15+((G.stage||1)-1)*2:15"
const KIND_CRYSTAL := "apply_stats_base_attack_crystal"
const CRYSTAL_SOURCE := "game.html:28602"
const CRYSTAL_EXPR := "P.baseAtk+=~~_cr.atk"
const CRYSTAL_PHASE := "after health crystal mhp@28601, before DEF crystal@28603"

const PROVIDER_BINDING_GAP := "PROVIDER_BINDING_GAP"         # reader/sink 미바인딩·해제 (현재값 문제와 구분)
const SOURCE_NONNUMERIC_DOMAIN := "SOURCE_NONNUMERIC_DOMAIN" # 원 += 가 문자열 연결이 되는 현재 P.baseAtk

var _crystal_reader: Callable
var _crystal_p_reader: Callable
var _packet_sink: Callable
var _packet_owners: Array[Object] = []   # Callable 은 ObjectID 만 보유 → RefCounted owner 강참조

var crystal_reader_calls := 0
var crystal_plan_calls := 0
var crystal_run_calls := 0
var packet_sink_calls := 0

func _retain_owner(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _packet_owners.has(o):
		_packet_owners.append(o)

## crystal_reader(): 중앙 capture wrapper. p_reader(): 현재 P Dictionary (legacy configure 와 별개).
func configure_crystal_reader(crystal_reader: Callable, p_reader: Callable) -> Dictionary:
	_crystal_reader = crystal_reader if crystal_reader.is_valid() else Callable()
	_crystal_p_reader = p_reader if p_reader.is_valid() else Callable()
	_retain_owner(_crystal_reader)
	_retain_owner(_crystal_p_reader)
	return crystal_readiness()

## packet_sink(packet) -> bool: packet.writes 를 원 순서대로 고정 P 에 대입. EARLY/CRYSTAL 공용.
func configure_packet_sink(packet_sink: Callable) -> bool:
	_packet_sink = packet_sink if packet_sink.is_valid() else Callable()
	_retain_owner(_packet_sink)
	return _packet_sink.is_valid()

func crystal_readiness() -> Dictionary:
	var missing: Array = []
	if not _crystal_reader.is_valid(): missing.append("crystal_reader")
	if not _crystal_p_reader.is_valid(): missing.append("crystal_P_reader")
	if not _packet_sink.is_valid(): missing.append("packet_sink")
	return {"status": READY if missing.is_empty() else PROVIDER_BINDING_GAP, "missing": missing}

static func _base_attack_write(value: Variant, source: String, expr: String, before: Dictionary) -> Dictionary:
	return {"field": "baseAtk", "value": value, "source": source, "expr": expr,
		"before_present": bool(before.present), "before": before.value}

## READY plan() 결과 + read_current_base_atk() 결과 → 공식 EARLY packet. 값 재계산/변환 0.
static func early_packet(ready_plan: Dictionary, before: Dictionary) -> Dictionary:
	if ready_plan.get("status") != READY:
		return {"status": ready_plan.get("status", NOT_READY), "reason": "plan_not_ready:" + str(ready_plan.get("reason", "")), "packet": null}
	if before.get("status") != READY or before.get("provenance") != "CURRENT":
		return {"status": NOT_READY, "reason": "before_not_current:" + str(before.get("reason", "")), "packet": null}
	var w := _base_attack_write(ready_plan.value, EARLY_WRITE_SOURCE, EARLY_EXPR, before)
	return {"status": READY, "reason": "", "packet": {"kind": KIND_EARLY, "source": EARLY_PACKET_SOURCE, "writes": [w]}}

## legacy G/P reader 로 before(P 읽기) → plan()(G 읽기 1회) → early_packet. 쓰기 0.
func plan_early_packet() -> Dictionary:
	var before := read_current_base_atk()
	if before.status != READY:
		return {"status": NOT_READY, "reason": before.reason, "packet": null, "plan": null, "before": before}
	var pl := plan()
	var r := early_packet(pl, before)
	r["plan"] = pl
	r["before"] = before
	return r

func _read_p_base_atk(reader: Callable) -> Dictionary:
	var r := {"status": NOT_READY, "provenance": "CURRENT", "present": false, "value": null, "reason": ""}
	if not reader.is_valid():
		r.status = PROVIDER_BINDING_GAP
		r.reason = "P_reader_unbound"
		return r
	var p: Variant = reader.call()
	if p == null:
		r.reason = "P_reader_null"
		return r
	if not p is Dictionary:
		r.reason = "P_unsupported_shape:" + type_string(typeof(p))
		return r
	r.status = READY
	r.present = p.has("baseAtk")
	r.value = p.get("baseAtk")
	return r

## packet 1회 dispatch + readback(field baseAtk, 마지막 write 값).
func _dispatch_packet(packet: Dictionary, p_reader: Callable) -> Dictionary:
	packet_sink_calls += 1
	var ack: Variant = _packet_sink.call(packet.duplicate(true))
	var out := {"status": READY, "reason": "", "ack": ack, "after": null}
	if not ack is bool:
		out.status = SINK_REJECTED
		out.reason = "ack_not_bool:" + type_string(typeof(ack))
		return out
	if not ack:
		out.status = SINK_REJECTED
		out.reason = "ack_false"
		return out
	var expect: Variant = packet.writes[packet.writes.size() - 1].value
	out.after = _read_p_base_atk(p_reader)
	var a: Dictionary = out.after
	if a.status != READY or not (a.value is int or a.value is float) or float(a.value) != float(expect):
		out.status = SINK_READBACK_MISMATCH
		out.reason = "readback:" + (a.reason if a.status != READY else str(a.value))
	return out

## 공식 EARLY packet 을 packet sink 로 1회 dispatch (legacy scalar run() 과 별개 경로, 같은 plan()).
func run_early_packet() -> Dictionary:
	var missing: Array = []
	if not _g_reader.is_valid(): missing.append("G_reader")
	if not _p_reader.is_valid(): missing.append("P_reader")
	if not _packet_sink.is_valid(): missing.append("packet_sink")
	if not missing.is_empty():
		return {"status": PROVIDER_BINDING_GAP, "reason": "unbound:" + ",".join(PackedStringArray(missing)),
			"packet": null, "sink_dispatched": false}
	var ep := plan_early_packet()
	if ep.status != READY:
		ep["sink_dispatched"] = false
		return ep
	var d := _dispatch_packet(ep.packet, _p_reader)
	ep["sink_dispatched"] = true
	ep["status"] = d.status
	ep["reason"] = d.reason
	ep["ack"] = d.ack
	ep["after"] = d.after
	return ep

## crystal stage 순수 계획: wrapper 1회 + 현재 P 1회 읽기. _cr 수정/계산 0.
func plan_crystal() -> Dictionary:
	crystal_plan_calls += 1
	var r := {"status": NOT_READY, "reason": "", "packet": null, "diagnostic_packet": null,
		"captured_cr": null, "crystal_stage": null, "cr_atk_raw": null, "cr_atk_int32": null,
		"cr_atk_raw_non_finite": false, "before": null, "value": null}
	if not _crystal_reader.is_valid() or not _crystal_p_reader.is_valid():
		r.status = PROVIDER_BINDING_GAP
		r.reason = "unbound:" + ",".join(PackedStringArray(crystal_readiness().missing.filter(func(m): return m != "packet_sink")))
		return r
	crystal_reader_calls += 1
	var wrap: Variant = _crystal_reader.call()
	if wrap == null:
		r.reason = "crystal_reader_null"
		return r
	if not wrap is Dictionary:
		r.reason = "crystal_wrapper_unsupported_shape:" + type_string(typeof(wrap))
		return r
	if wrap.get("status") != READY:
		r.reason = "crystal_wrapper_not_ready:%s:%s" % [str(wrap.get("status")), str(wrap.get("reason", ""))]
		return r
	if wrap.has("stage"):
		if not (wrap.stage is String or wrap.stage is StringName):
			r.reason = "crystal_wrapper_stage_shape:" + type_string(typeof(wrap.stage))
			return r
		r.crystal_stage = String(wrap.stage)
	var cr: Variant = wrap.get("value")
	if cr == null:
		r.reason = "captured_cr_missing"
		return r
	if not cr is Dictionary:
		r.reason = "captured_cr_unsupported_shape:" + type_string(typeof(cr))
		return r
	r.captured_cr = cr
	if not cr.has("atk"):
		r.reason = "captured_cr.atk_missing"                 # 원 _cr 은 atk:0 으로 초기화됨 → 부재 = capture 아님
		return r
	var atk: Variant = cr.atk
	r.cr_atk_raw = atk
	if not (atk is int or atk is float):
		r.reason = "captured_cr.atk_not_number:" + type_string(typeof(atk))
		return r
	r.cr_atk_raw_non_finite = atk is float and (is_nan(atk) or is_inf(atk))
	var add: int = Formula.js_to_int32(float(atk))         # ~~_cr.atk (NaN/±Inf → 0 은 원 ToInt32)
	r.cr_atk_int32 = add
	var before := _read_p_base_atk(_crystal_p_reader)
	r.before = before
	if before.status != READY:
		r.status = before.status
		r.reason = before.reason
		return r
	var bv: Variant = before.value
	if bv is String or bv is StringName or bv is Array or bv is Dictionary or bv is Object:
		r.status = SOURCE_NONNUMERIC_DOMAIN
		r.reason = "P.baseAtk_js_plus_concat:" + type_string(typeof(bv))
		return r
	var v: float = _coerce.js_to_number(bv, before.present) + float(add)   # 부재 → NaN, null → 0, bool → 0/1
	var packet := {"kind": KIND_CRYSTAL, "source": CRYSTAL_SOURCE,
		"writes": [_base_attack_write(v, CRYSTAL_SOURCE, CRYSTAL_EXPR, before)]}
	if is_nan(v) or is_inf(v):
		r.status = SOURCE_NON_FINITE
		r.reason = "source_writes_" + ("NaN" if is_nan(v) else ("Infinity" if v > 0 else "-Infinity"))
		r.diagnostic_packet = packet
		return r
	r.value = v
	r.packet = packet
	r.status = READY
	return r

## crystal stage 1회 = baseAtk 덧셈 1회: plan_crystal → packet sink 1회 → readback.
func run_crystal() -> Dictionary:
	crystal_run_calls += 1
	var rd := crystal_readiness()
	if rd.status != READY:
		return {"status": PROVIDER_BINDING_GAP, "reason": "unbound:" + ",".join(PackedStringArray(rd.missing)),
			"plan": null, "packet": null, "sink_dispatched": false}
	var pl := plan_crystal()
	var out := {"status": pl.status, "reason": pl.reason, "plan": pl, "packet": pl.packet, "sink_dispatched": false,
		"ack": null, "after": null}
	if pl.status != READY:
		return out
	var d := _dispatch_packet(pl.packet, _crystal_p_reader)
	out.sink_dispatched = true
	out.status = d.status
	out.reason = d.reason
	out.ack = d.ack
	out.after = d.after
	return out
