extends RefCounted
##
## fusion_star_source/producer.gd — 원 _fuseStar(skId) 현재값 readonly 공급자 (manual source phase).
## TASK GODOT-PORT-FUSION-STAR-SOURCE-FIRST-20261013
##
## 자체 clock/_process/Node/GUI/RNG 없음. 호출마다 borrowed 현재 P reader 를 1회 읽고 P/테이블 쓰기 0, 캐시 0.
## 소유: 현재 getter → 원 lookup/default 반환뿐. _fuseMul/skillBoost/grit/crystal/_fused 생성·restore/스킬 registry 는 비소유.
##
## 원값(R game.html, 읽기전용):
##   const _FUSE_GEM_GROUPS={ ... k:{..., star:N?, skills:[...]} ... };                     (44855-44888)
##   const _FUSE_PAIRS={ ... k:[skId,...] ... };                                            (44984-45017)
##   function _isFused(key){return!!(P._fused&&P._fused[key])}                              (45019)
##   function _fuseStar(skId){
##     if(!P._fused)return 0;
##     let _max=0;
##     for(const[k,v]of Object.entries(_FUSE_PAIRS)){if(!_isFused(k))continue;if(!v.includes(skId))continue;
##       const _s=(_FUSE_GEM_GROUPS[k]&&_FUSE_GEM_GROUPS[k].star)||v.length;if(_s>_max)_max=_s}
##     return _max;
##   }                                                                                      (45027-45032)
## _FUSE_GEM_GROUPS 는 lookup 이 쓰는 key 존재 + star 필드만 GEM_GROUP_STAR 로 보존(color/tier/minLv/skills 비소유).
## 원 소스에서 두 테이블의 재대입/변경 0 (const, 쓰기 지점 없음) → 불변 상수로 보존.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const STATUS_READY := "READY"
const STATUS_NOT_READY := "NOT_READY"

const BRANCH_UNFUSED_ABSENT := "source_unfused_absent"     # P._fused undefined → !P._fused → 0
const BRANCH_UNFUSED_FALSY := "source_unfused_falsy"       # null/false/0/NaN/'' → 0
const BRANCH_UNKNOWN_SKILL := "source_unknown_skill"       # skId 가 어떤 _FUSE_PAIRS 값에도 없음 → _max 0
const BRANCH_NO_FUSED_GROUP := "source_no_fused_member_group"  # 구성 그룹은 있으나 _isFused 0 → _max 0
const BRANCH_FUSED_MAX := "source_fused_max"               # 융합 구성 그룹의 star||length 최대

const P_FIELD_FUSED := "_fused"
const SOURCE_REF := "game.html:44855-44888,44984-45017,45019,45027-45032"

## _FUSE_PAIRS (44984-45017) — 원 선언 순서 그대로.
const FUSE_PAIRS := {
	"dimBreach": ["chargeBoost", "magicBlink"],
	"dimSlam": ["chargeBoost", "magicBlink", "chainAssault"],
	"dimThunder": ["chargeBoost", "magicBlink", "chainAssault", "chainSlam"],
	"dimRush": ["chargeBoost", "magicBlink", "chainAssault", "chainSlash", "chainSlam"],
	"dimBlast": ["chargeBoost", "magicBlink", "chainAssault", "chainSlash", "chainSlam", "giantSlam"],
	"whirlDet": ["whirlwind", "detonate"],
	"slamStorm": ["whirlwind", "detonate", "giantSlam"],
	"stormBeam": ["whirlwind", "detonate", "giantSlam", "fanShot", "omniBeam", "elemMissile"],
	"stormBurst": ["whirlwind", "detonate", "giantSlam", "fanShot", "omniBeam", "elemMissile", "burstLoop"],
	"bladeFuse": ["maliceHunt", "guardian"],
	"bladeEcho": ["maliceHunt", "bladeDash"],
	"iceMortar": ["maliceMortar", "iceOrb"],
	"sixFuse": ["fanShot", "omniBeam"],
	"elemFuse": ["fanShot", "omniBeam", "elemMissile"],
	"boneStorm": ["maliceStorm", "boneWall"],
	"elecRepent": ["maliceStorm", "hellRay"],
	"shieldFuse": ["maliceSwipe", "shieldThrow"],
	"plagueFuse": ["maliceHunt", "guardian", "plagueBurst"],
	"plagueVenom": ["maliceHunt", "guardian", "plagueBurst", "venomBlade"],
	"holyFuse": ["holyDome", "holyPrison"],
	"holyIce": ["holyDome", "holyPrison", "iceStorm"],
	"holyWeak1": ["holyDome", "holyPrison", "iceStorm", "weakPhys"],
	"holyWeak2": ["holyDome", "holyPrison", "iceStorm", "weakPhys", "weakMag"],
	"holyWeak3": ["holyDome", "holyPrison", "iceStorm", "weakPhys", "weakMag", "weakPj"],
	"holyWeak4": ["holyDome", "holyPrison", "iceStorm", "weakPhys", "weakMag", "weakPj", "weakRev"],
	"pillarSpike": ["darkPillar", "spikeTrap"],
	"pillarSlam": ["giantSlam2", "darkPillar"],
	"infernoSlam": ["giantSlam2", "fireAura"],
	"siegeGhost": ["ghostXbowTurret", "voidScarecrow"],
	"dualScarecrow": ["voidScarecrow", "explodeScarecrow"],
	"thunderGhost": ["bladeDash", "thunderStake"],
	"timeStep": ["timeWarp", "ghostWalk"],
}

## _FUSE_GEM_GROUPS[k].star (44855-44888). 원 그룹 32개 전부 key 존재, star 필드 없음 = null(→ ||v.length).
const GEM_GROUP_STAR := {
	"dimBreach": null, "dimSlam": null, "dimThunder": null, "dimRush": null, "dimBlast": null,
	"sixFuse": 2, "elemFuse": null, "whirlDet": null, "slamStorm": null,
	"stormBeam": 4, "stormBurst": 5,
	"bladeFuse": null, "bladeEcho": 2, "iceMortar": null, "boneStorm": null, "elecRepent": null,
	"shieldFuse": null, "plagueFuse": null, "plagueVenom": 4,
	"holyFuse": null, "holyIce": null, "holyWeak1": 4, "holyWeak2": 5, "holyWeak3": 6, "holyWeak4": 7,
	"pillarSpike": null, "pillarSlam": null, "infernoSlam": null,
	"siegeGhost": 3, "dualScarecrow": 2, "thunderGhost": 2, "timeStep": 2,
}

var _player_reader: Callable = Callable()   # () -> 현재 P (borrowed; 생성/restore 는 BUILD/ENGINE)
var _owners: Array[Object] = []             # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _counts: Dictionary = { "calls": 0, "p": 0, "ready": 0, "not_ready": 0 }


func configure(current_player_reader: Callable) -> Dictionary:
	_player_reader = current_player_reader
	_owners.clear()
	_retain(current_player_reader)
	_configured = true
	return readiness()


func clear() -> void:
	_player_reader = Callable()
	_owners.clear()
	_configured = false


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


## 바인딩 준비도(값 호출 없음).
func readiness() -> Dictionary:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	if not _player_reader.is_valid():
		missing.append("current_player_reader")
	return { "ready": missing.is_empty(), "status": STATUS_READY if missing.is_empty() else STATUS_NOT_READY, "missing": missing }


## 진단: 호출/현재 P 읽기 횟수.
func read_counts() -> Dictionary:
	return _counts.duplicate()


## 출처/부분집합 진단. 테이블은 deep copy 로만 노출(상수 별칭 0).
func provenance() -> Dictionary:
	return {
		"source": SOURCE_REF,
		"owned": "current P getter -> _fuseStar lookup/default return",
		"pair_count": FUSE_PAIRS.size(),
		"gem_group_star_count": GEM_GROUP_STAR.size(),
		"not_owned": ["_fuseMul", "skillBoost", "grit", "crystal", "_fused creation/restore", "skill registry", "Player/World/INV"],
	}


func source_tables() -> Dictionary:
	return { "pairs": FUSE_PAIRS.duplicate(true), "gem_group_star": GEM_GROUP_STAR.duplicate(true) }


func _result(sk_id: Variant) -> Dictionary:
	return {
		"status": STATUS_NOT_READY, "value": null, "reason": "", "branch": "",
		"skill_id": sk_id if sk_id is String else type_string(typeof(sk_id)),
		"member_groups": [], "fused_groups": [], "max_group": "", "source": SOURCE_REF,
	}


func _nr(r: Dictionary, reason: String) -> Dictionary:
	r.status = STATUS_NOT_READY
	r.value = null
	r.reason = reason
	r.branch = ""
	_counts["not_ready"] += 1
	return r


func _ready_value(r: Dictionary, value: int, branch: String) -> Dictionary:
	r.status = STATUS_READY
	r.value = value
	r.branch = branch
	r.reason = branch
	_counts["ready"] += 1
	return r


## 원 _fuseStar(skId). holy_dome_flat_heal_source.fuse_star_reader 계약:
##   {status:"READY", value:int(finite), reason} | {status:"NOT_READY", value:null, reason}.
## 현재 P 권위 부재/미지원 shape 는 NOT_READY(중립 0 대체 없음). 원 비융합/미지 스킬 0 은 READY + branch 로 구분.
func fuse_star(sk_id: Variant) -> Dictionary:
	_counts["calls"] += 1
	var r := _result(sk_id)
	if not _configured:
		return _nr(r, "not_configured")
	# 원 호출자는 문자열 리터럴만 넘긴다. 그 외 shape 는 port 미지원(StringName 포함; 별칭 판정 날조 0).
	if not (sk_id is String):
		return _nr(r, "skill_id_unsupported_shape:" + type_string(typeof(sk_id)))
	if not _player_reader.is_valid():
		return _nr(r, "current_player_reader_missing")
	_counts["p"] += 1
	var p: Variant = _player_reader.call()
	if not (p is Dictionary):
		return _nr(r, "player_authority_null_or_unsupported")
	# if(!P._fused)return 0;
	if not p.has(P_FIELD_FUSED):
		return _ready_value(r, 0, BRANCH_UNFUSED_ABSENT)
	var fused: Variant = p[P_FIELD_FUSED]
	if not AffixReader.js_truthy(fused):
		return _ready_value(r, 0, BRANCH_UNFUSED_FALSY)
	# truthy 비객체(true/1/'x')·Array·Object 는 원 프로퍼티 조회 의미를 날조하지 않고 미지원으로 보고.
	if not (fused is Dictionary):
		return _nr(r, "fused_unsupported_shape:" + type_string(typeof(fused)))
	for key in fused:
		if key is StringName:
			return _nr(r, "fused_key_unsupported_shape:StringName")
	# for(const[k,v]of Object.entries(_FUSE_PAIRS)) — 원 순서, 같은 phase 의 P._fused 1회 읽기.
	var mx: int = 0
	var member_groups: Array[String] = []
	var fused_groups: Array[String] = []
	for k in FUSE_PAIRS:
		var v: Array = FUSE_PAIRS[k]
		var in_group: bool = v.has(sk_id)
		if in_group:
			member_groups.append(k)
		if not AffixReader.js_truthy(fused.get(k, null)):   # if(!_isFused(k))continue
			continue
		if not in_group:                                      # if(!v.includes(skId))continue
			continue
		fused_groups.append(k)
		var star_v: Variant = GEM_GROUP_STAR.get(k, null)    # (_FUSE_GEM_GROUPS[k]&&.star)||v.length
		var s: int = int(star_v) if AffixReader.js_truthy(star_v) else v.size()
		if s > mx:
			mx = s
			r.max_group = k
	r.member_groups = member_groups
	r.fused_groups = fused_groups
	if mx > 0:
		return _ready_value(r, mx, BRANCH_FUSED_MAX)
	if member_groups.is_empty():
		return _ready_value(r, 0, BRANCH_UNKNOWN_SKILL)
	return _ready_value(r, 0, BRANCH_NO_FUSED_GROUP)


## holy_dome_flat_heal_source.configure(..., fuse_star_reader, ...) 에 그대로 넘길 Callable.
func fuse_star_reader() -> Callable:
	return Callable(self, "fuse_star")
