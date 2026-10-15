extends RefCounted
##
## holy_dome_presence_source/producer.gd — 원 updatePlayer _inHolyDome 판정 (readonly presence supplier).
## TASK GODOT-PORT-HOLY-DOME-PRESENCE-SOURCE-FIRST-20261013
##
## 자체 clock/_physics_process/_process/Node/GUI 없음. 호출자가 명시 메서드로 매번 현재값을 읽는다(캐시/스냅샷 없음).
## G/P/zone 쓰기·생성·삭제·expire·타이머 진전 0. 결과는 반환값으로만 나간다(sink 없음).
## 권위 reader 누락/invalid/null → NOT_READY + value null. 중립 false 로 ready 를 채우지 않는다.
##
## 원값(R game.html, 읽기전용):
##   let _inHolyDome=false,_hdLv=1;                                                   (game.html:33348)
##   if(G._fireZones){for(let _hdi=0;_hdi<G._fireZones.length;_hdi++){const _hd=G._fireZones[_hdi];
##     if(_hd.type==='holyDome'&&dst(P.x,P.y,_hd.x,_hd.y)<_hd.r){_inHolyDome=true;_hdLv=_hd.lv||1;break}}}
##                                                                                    (game.html:33349)
##   const _hdMul=_inHolyDome?2:1;                                                    (game.html:33350, regen 소유)
##   function dst(a,b,c,d){return Math.sqrt((c-a)**2+(d-b)**2)}                       (game.html:32384)
## 제외: _hdLv(flat regen 33352 용) / level / flat regen / 발동·clock·effects(SKILL) / render / damage.
## 원에 없는 필터(t/maxT/owner/hp/P.r/P.skills/G.on/활성·expiry) 추가 0.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const STATUS_READY := "READY"
const STATUS_NOT_READY := "NOT_READY"
const STATUS_SOURCE_THROW := "SOURCE_THROW"   # 원이 TypeError 로 중단되는 입력 (null/undefined zone 요소)

const ZONE_TYPE_HOLY_DOME := "holyDome"       # _hd.type==='holyDome' (strict)
const G_FIELD_FIRE_ZONES := "_fireZones"
const SOURCE_REF := "game.html:33348-33349,32384"

const SHAPE_ABSENT := "absent"                # G._fireZones undefined
const SHAPE_FALSY := "falsy"                  # null/false/0/NaN/""
const SHAPE_ARRAY := "array"
const SHAPE_NON_ARRAY_NO_ITERATION := "non_array_no_iteration"  # truthy 숫자/true/{}(length 없음): .length undefined → 루프 0회
const SHAPE_STRING := "string"                # truthy 문자열: 각 문자 .type undefined → 매치 0

var _world_reader: Callable = Callable()      # () -> 현재 G (Dictionary) | null
var _player_reader: Callable = Callable()     # () -> 현재 P (Dictionary) | null
var _owners: Array[Object] = []               # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _coerce: AffixReader = AffixReader.new()  # js_to_number 재사용 (readonly helper)
var _g_reads: int = 0
var _p_reads: int = 0


## world_reader: Callable()->현재 G, player_reader: Callable()->현재 P. 둘 다 매 호출 새로 읽힌다.
func configure(world_reader: Callable, player_reader: Callable) -> Dictionary:
	_world_reader = world_reader
	_player_reader = player_reader
	_owners.clear()
	_retain(world_reader)
	_retain(player_reader)
	_configured = true
	return readiness()


func clear() -> void:
	_world_reader = Callable()
	_player_reader = Callable()
	_owners.clear()
	_configured = false


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


## 진단: reader 호출 횟수 (short-circuit 검사용).
func read_counts() -> Dictionary:
	return { "g": _g_reads, "p": _p_reads }


## 바인딩 준비도(값 호출 없음).
func readiness() -> Dictionary:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	if not _world_reader.is_valid():
		missing.append("world_reader")
	if not _player_reader.is_valid():
		missing.append("player_reader")
	return { "ready": missing.is_empty(), "status": STATUS_READY if missing.is_empty() else STATUS_NOT_READY, "missing": missing }


static func _detail(status: String, value: Variant, index: int, reason: String, shape: String) -> Dictionary:
	return { "status": status, "value": value, "index": index, "reason": reason, "zones_shape": shape, "source": SOURCE_REF }


## 원 33348-33349 판정. status READY → value bool, 그 외 → value null.
func presence_detail() -> Dictionary:
	var rd := readiness()
	if not bool(rd.ready):
		return _detail(STATUS_NOT_READY, null, -1, "not_ready:" + ",".join(PackedStringArray(rd.missing)), "")
	_g_reads += 1
	var g_raw: Variant = _world_reader.call()
	if g_raw == null:
		return _detail(STATUS_NOT_READY, null, -1, "world_authority_null", "")
	if not (g_raw is Dictionary):
		return _detail(STATUS_NOT_READY, null, -1, "world_authority_unsupported_shape", "")
	var g: Dictionary = g_raw
	# if(G._fireZones) — JS ToBoolean
	if not g.has(G_FIELD_FIRE_ZONES):
		return _detail(STATUS_READY, false, -1, "", SHAPE_ABSENT)
	var zones_raw: Variant = g[G_FIELD_FIRE_ZONES]
	if not AffixReader.js_truthy(zones_raw):
		return _detail(STATUS_READY, false, -1, "", SHAPE_FALSY)
	if zones_raw is String:
		return _detail(STATUS_READY, false, -1, "", SHAPE_STRING)
	if zones_raw is int or zones_raw is float or zones_raw is bool:
		return _detail(STATUS_READY, false, -1, "", SHAPE_NON_ARRAY_NO_ITERATION)
	if zones_raw is Dictionary:
		var zd: Dictionary = zones_raw
		if zd.has("length"):
			return _detail(STATUS_NOT_READY, null, -1, "fire_zones_unsupported_shape:array_like_object", "")
		return _detail(STATUS_READY, false, -1, "", SHAPE_NON_ARRAY_NO_ITERATION)
	if not (zones_raw is Array):
		return _detail(STATUS_NOT_READY, null, -1, "fire_zones_unsupported_shape", "")
	var zones: Array = zones_raw
	# 원 forward loop. P 는 type 매치 후에만 읽는다(&& short-circuit).
	var p: Dictionary = {}
	var p_loaded := false
	for i in range(zones.size()):
		var z_raw: Variant = zones[i]
		if z_raw == null:
			return _detail(STATUS_SOURCE_THROW, null, i, "zone_null_type_access", SHAPE_ARRAY)
		if z_raw is int or z_raw is float or z_raw is bool or z_raw is String or z_raw is Array:
			continue  # 원시값/배열 .type → undefined → 불일치
		if not (z_raw is Dictionary):
			return _detail(STATUS_NOT_READY, null, i, "zone_unsupported_shape", SHAPE_ARRAY)
		var z: Dictionary = z_raw
		if not z.has("type"):
			continue
		var t: Variant = z["type"]
		if t is StringName:
			return _detail(STATUS_NOT_READY, null, i, "zone_type_unsupported_shape:StringName", SHAPE_ARRAY)
		if not (t is String and String(t) == ZONE_TYPE_HOLY_DOME):
			continue
		if not p_loaded:
			_p_reads += 1
			var p_raw: Variant = _player_reader.call()
			if p_raw == null:
				return _detail(STATUS_NOT_READY, null, i, "player_authority_null", SHAPE_ARRAY)
			if not (p_raw is Dictionary):
				return _detail(STATUS_NOT_READY, null, i, "player_authority_unsupported_shape", SHAPE_ARRAY)
			p = p_raw
			p_loaded = true
		var d: float = _dst(_js_num(p, "x"), _js_num(p, "y"), _js_num(z, "x"), _js_num(z, "y"))
		if d < _js_num(z, "r"):  # NaN < x / x < NaN → false (JS 동일)
			return _detail(STATUS_READY, true, i, "", SHAPE_ARRAY)
	return _detail(STATUS_READY, false, -1, "", SHAPE_ARRAY)


## regen provider 어댑터: READY → bool, 그 외 → null (숫자/false 위장 없음).
func in_holy_dome_value() -> Variant:
	var d := presence_detail()
	if String(d.status) == STATUS_READY:
		return bool(d.value)
	return null


## resource_regeneration_source.configure 의 providers["in_holy_dome"] 용.
func regen_provider() -> Callable:
	return Callable(self, "in_holy_dome_value")


func _js_num(obj: Dictionary, key: String) -> float:
	return _coerce.js_to_number(obj.get(key, null), obj.has(key))


## dst(a,b,c,d)=Math.sqrt((c-a)**2+(d-b)**2)
static func _dst(a: float, b: float, c: float, d: float) -> float:
	var dx: float = c - a
	var dy: float = d - b
	return sqrt(dx * dx + dy * dy)
