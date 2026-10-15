extends RefCounted
##
## player_grit_source/producer.gd — 원 `_grit`(근성 SP 투자 레벨, raw scalar) 현재 authority 읽기전용 adapter.
## TASK GODOT-PORT-PLAYER-GRIT-SOURCE-FIRST-20261013.
##
## 원 R(canonical game.html, 읽기전용):
##   init     (@28556) let _grit=0; // 근성 레벨
##   consumer (@28559) _gritTotal()=(+_grit||0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR')
##   restore  (@4101)  _grit=d.grit||0;   (@4102 _grit>0&&!d.gritCostModeV2 → legacy SP 환불 P.sp+=_refund)
##   save     (@3940/@62671/@64352/@64508) grit:_grit,gritCostModeV2:1
##   투자/환불 (@51677 _grit=0, @51710 _grit=next.grit, @51729 _grit=next.value) — ExoduserStatsPanel applyPlan
##   표시     (@51799) Lv.${_grit+_lb2}
## raw `_grit` 는 위 대입만으로 바뀌는 독립 전역 scalar 이다(STATS/P/PASSIVES/INV 파생 아님). 이 모듈은 파생을 발명하지 않는다.
##
## 이 모듈이 하는 일: authority 소유자(BUILD/ENGINE)가 준 reader Callable 로 현재 컨테이너를 매 호출 다시 읽고
##   field(기본 "_grit") raw 값을 {status,value,raw,provenance} 로 돌려준다. 값 캐시/보관/쓰기 0.
##   player_resource_parameters_source.PROVIDER_GRIT 계약(() -> number, 아니면 NOT_READY)에 맞는 provide_grit()
##   Callable 을 공급한다. _gritTotal 합산(+_lvB/_eqStat/_eqAffix)은 SourceParameters 소유 — 여기서 재구현 0.
## 이 모듈 밖: restore(@4101~4102)/legacy SP 환불, 투자·환불·applyPlan, save pack, 전역 publisher/setter,
##   SourceParameters 설치·applyStats/recalcSt 호출 지점, Main readiness.
##
## 지원 subset: 유한 int/float 만 READY(0 포함, 음수/소수도 원 (+_grit||0) 그대로 통과). 원은 String/bool 등
##   truthy 비정상 raw 도 `+_grit` 로 강제하지만 이 포트는 지원하지 않는다 → NOT_READY(0 보충 금지).
##   NaN/±Inf 는 원 JSON restore/정수 투자로 도달 불가 → NOT_READY grit_non_finite.

const SourceParameters := preload("res://port_modules/player_resource_parameters_source/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_BOOT := "SOURCE_BOOT"   # 원 init literal (현재값 아님 — READY/Main 준비 불충족)

const DEFAULT_FIELD := "_grit"
const SAVE_FIELD := "grit"           # 원 save/restore payload 키 (@3940/@4101) — 이 모듈은 payload 를 읽지 않는다

const PROVENANCE := {
	"init": "game.html:28556 let _grit=0",
	"consumer": "game.html:28559 _gritTotal()=(+_grit||0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR')",
	"restore": "game.html:4101 _grit=d.grit||0 (+4102 legacy SP refund) — BUILD, Godot 미구현",
	"writers": "game.html:51677/51710/51729 ExoduserStatsPanel refund/applyPlan — BUILD",
}

## 실제 current authority 로 남은 것(이 모듈이 채우지 않음).
const MISSING_UPSTREAM := {
	"grit_authority": "현재 _grit 소유 컨테이너 + reader 설치 — BUILD(progress/STATS·SP 분배)",
	"grit_restore": "save_session_consumer PENDING 'stats/passives/legacy refunds/grit after inventory' (@4101~4102) — BUILD",
	"grit_writers": "SP 투자/applyPlan/전체 초기화(@51677/@51710/@51729) — BUILD",
	"install": "SourceParameters providers 에 provide_grit 연결 + applyStats/recalcSt 호출 지점/Main 설치 — ENGINE",
}

var _reader: Callable = Callable()
var _owner: RefCounted = null       # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _field: String = DEFAULT_FIELD
var _label: String = ""
var _configured: bool = false
var _read_count: int = 0


# ───────────────────────── boot (원 provenance 만) ─────────────────────────

## 원 init literal. 현재 authority 가 아니며 READY 로 승격하거나 fallback 으로 쓰지 않는다.
static func source_boot_grit() -> Dictionary:
	return {
		"status": SOURCE_BOOT, "ready": false, "current": false,
		"value": 0.0, "raw": 0, "reason": "",
		"provenance": { "source": PROVENANCE["init"], "field": DEFAULT_FIELD, "authority": "" },
	}


# ───────────────────────── configure / readiness ─────────────────────────

## reader(): 현재 authority 컨테이너(Dictionary 또는 Object)를 반환. 스냅샷 금지 — 호출 시점의 실 상태.
## field: 컨테이너 안의 raw grit 키. label: authority 소유자 provenance 표기(빈 값 허용).
func configure(reader: Callable, field: String = DEFAULT_FIELD, label: String = "") -> Dictionary:
	_reader = reader
	_owner = null
	if reader.is_valid():
		var o: Object = reader.get_object()
		if o is RefCounted:
			_owner = o
	_field = field
	_label = label
	_configured = true
	return readiness()


func clear() -> void:
	_reader = Callable()
	_owner = null
	_field = DEFAULT_FIELD
	_label = ""
	_configured = false


## 바인딩 준비도(reader 호출 없음). 값의 READY 여부는 read_current_grit() 가 매번 판정한다.
func readiness() -> Dictionary:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	elif not _reader.is_valid():
		missing.append("authority_reader_invalid")
	if _field == "":
		missing.append("field_empty")
	return {
		"ready": missing.is_empty(),
		"status": READY if missing.is_empty() else NOT_READY,
		"missing": missing,
		"missing_upstream": MISSING_UPSTREAM.duplicate(),
	}


func read_count() -> int:
	return _read_count


# ───────────────────────── current read ─────────────────────────

func _provenance() -> Dictionary:
	return {
		"source": PROVENANCE["init"], "consumer": PROVENANCE["consumer"], "restore": PROVENANCE["restore"],
		"field": _field, "authority": _label,
	}


func _not_ready(reason: String, raw: Variant, raw_type: String) -> Dictionary:
	return {
		"status": NOT_READY, "ready": false, "current": false, "value": null,
		"raw": raw, "raw_type": raw_type, "reason": reason, "provenance": _provenance(),
	}


static func _has_property(o: Object, key: String) -> bool:
	for prop: Dictionary in o.get_property_list():
		if str(prop.get("name", "")) == key:
			return true
	return false


## 현재 authority raw `_grit`. 매 호출 reader 를 다시 읽는다(캐시 0, 쓰기 0).
##   READY: value = float(raw) (raw 그대로; (+_grit||0) 는 SourceParameters 가 적용). 0 은 유효 READY.
##   NOT_READY: value null — 미바인딩/reader 무효·해제/authority null/field 부재/null/미지원 shape/비유한.
func read_current_grit() -> Dictionary:
	if not _configured:
		return _not_ready("authority_unbound", null, "")
	if not _reader.is_valid():
		return _not_ready("authority_reader_invalid", null, "")
	if _field == "":
		return _not_ready("field_empty", null, "")
	_read_count += 1
	var container: Variant = _reader.call()
	var raw: Variant = null
	match typeof(container):
		TYPE_NIL:
			return _not_ready("authority_null", null, "")
		TYPE_DICTIONARY:
			var d: Dictionary = container
			if not d.has(_field):
				return _not_ready("field_absent:" + _field, null, "")
			raw = d[_field]
		TYPE_OBJECT:
			if not is_instance_valid(container):
				return _not_ready("authority_freed", null, "")
			var o: Object = container
			if not _has_property(o, _field):
				return _not_ready("field_absent:" + _field, null, "")
			raw = o.get(_field)
		_:
			return _not_ready("authority_unsupported_shape:" + type_string(typeof(container)), null, "")
	var t: int = typeof(raw)
	var tname: String = type_string(t)
	if t == TYPE_NIL:
		return _not_ready("grit_null", null, tname)
	if t != TYPE_INT and t != TYPE_FLOAT:
		# 원 +_grit 강제(String/bool/객체)는 지원 subset 밖. 컨테이너 raw 는 노출하지 않는다(읽기전용).
		var echo: Variant = raw if (t == TYPE_BOOL or t == TYPE_STRING or t == TYPE_STRING_NAME) else null
		return _not_ready("grit_unsupported_raw:" + tname, echo, tname)
	var f: float = float(raw)
	if is_nan(f) or is_inf(f):
		return _not_ready("grit_non_finite", raw, tname)
	return {
		"status": READY, "ready": true, "current": true, "value": f,
		"raw": raw, "raw_type": tname, "reason": "", "provenance": _provenance(),
	}


# ───────────────────────── SourceParameters PROVIDER_GRIT ─────────────────────────

## () -> float | null. READY 만 숫자, 나머지는 null → SourceParameters 가 `grit_not_number:Nil` NOT_READY.
func provide_grit() -> Variant:
	var r: Dictionary = read_current_grit()
	if str(r["status"]) != READY:
		return null
	return r["value"]


func grit_provider() -> Callable:
	return Callable(self, "provide_grit")


## 호출자 providers 복사본에 PROVIDER_GRIT 만 추가(원본 수정 0). 이미 다른 grit provider 가 있으면 거부(덮어쓰기 0).
func with_grit_provider(providers: Dictionary) -> Dictionary:
	if providers.has(SourceParameters.PROVIDER_GRIT):
		return { "ok": false, "reason": "grit_provider_already_bound", "providers": providers.duplicate() }
	var out: Dictionary = providers.duplicate()
	out[SourceParameters.PROVIDER_GRIT] = grit_provider()
	return { "ok": true, "reason": "", "providers": out }
