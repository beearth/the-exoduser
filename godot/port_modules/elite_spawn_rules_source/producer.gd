class_name ExoduserHell0EliteSelector
extends RefCounted
## EL-01 hell0 only. G16633–16641, G31033–31097. No actor/RNG owner.
const TIERS=[
 {"name":"일반","col":"#ffffff","mods":0,"hpMul":1.0,"atkMul":1.0,"dropBonus":0.0,"scaleMul":1.0},
 {"name":"매직","col":"#4488ff","mods":1,"hpMul":2.0,"atkMul":1.3,"dropBonus":0.5,"scaleMul":1.08},
 {"name":"레어","col":"#ffaa00","mods":2,"hpMul":3.0,"atkMul":1.6,"dropBonus":1.5,"scaleMul":1.2},
 {"name":"챔피언","col":"#ff4444","mods":3,"hpMul":5.0,"atkMul":2.0,"dropBonus":3.0,"scaleMul":1.35}]
const MODS=[{"id":"M01","name":"빙결","col":"#88ccff","hell":0},{"id":"M02","name":"초속","col":"#66ff66","hell":0},{"id":"M03","name":"강타","col":"#ff8844","hell":0},{"id":"M04","name":"재생","col":"#44ff88","hell":0},{"id":"M29","name":"돌진","col":"#ff5533","hell":0},{"id":"M30","name":"진원 충격파","col":"#ff8844","hell":0}]
const AURAS=[{"id":"warCry","name":"함성","col":"#ff4444","hell":0,"range":150}]
var _random: Callable
var _configured:=false
var _draws: Array=[]
var _error:=""
func configure(random_unit: Callable) -> bool:
 if _configured or not random_unit.is_valid():return false
 _random=random_unit;_configured=true
 return true
static func _num(v: Variant) -> bool:return (v is int or v is float) and is_finite(float(v))
func _begin(stage: int,tier: int=0) -> bool:
 _draws=[];_error=""
 if not _configured:_error="not_configured"
 elif stage not in range(4):_error="hell0_only"
 elif tier not in range(4):_error="invalid_tier"
 return _error.is_empty()
func _draw() -> float:
 var v: Variant=_random.call()
 _draws.append(v)
 if not _num(v) or v<0 or v>=1:_error="invalid_unit";return 0.0
 return float(v)
func _result(value: Variant) -> Dictionary:
 return {"status":"READY" if _error.is_empty() else "NOT_READY","value":value if _error.is_empty() else null,"reason":_error,"draws":_draws.size(),"prefix":_draws.duplicate()}
func roll_elite(stage: int) -> Dictionary:
 if not _begin(stage):return _result(null)
 # G31063–31070: hell0 rare/champion=0, strict < .03; always one draw.
 var u:=_draw()
 return _result(1 if u<0.03 else 0)
func roll_mods(tier: int,stage: int) -> Dictionary:
 if not _begin(stage,tier):return _result(null)
 if tier==0:return _result([])
 # G31072–31080: attacks then ordinary, splice in original order. No shuffle.
 var attacks: Array=["M29","M30"]
 var picked: Array=[]
 var count: int=mini(attacks.size(),2 if tier>=3 else 1)
 while picked.size()<count:
  var u:=_draw()
  if not _error.is_empty():return _result(null)
  var index:=int(u*attacks.size())
  picked.append(attacks[index]);attacks.remove_at(index)
 var ordinary: Array=["M01","M02","M03","M04"]
 while picked.size()<tier and not ordinary.is_empty():
  var u:=_draw()
  if not _error.is_empty():return _result(null)
  var index:=int(u*ordinary.size())
  picked.append(ordinary[index]);ordinary.remove_at(index)
 return _result(picked)
func roll_aura(tier: int,stage: int) -> Dictionary:
 if not _begin(stage,tier):return _result(null)
 if tier<2:return _result(null)
 # G31091–31097: one U even for the single hell0 aura. Call AFTER facing.
 _draw()
 return _result("warCry")
func read_catalog() -> Dictionary:
 return {"stage_min":0,"stage_max":3,"probabilities":[0.03,0.0,0.0],"tiers":TIERS.duplicate(true),"mods":MODS.duplicate(true),"auras":AURAS.duplicate(true)}
static func constructor_prefix(stage: int,excluded: bool,random_by_purpose: Callable) -> Dictionary:
 # G31131–31133 only, before speed/radius. Never move aura ahead of facing.
 if stage not in range(4) or not random_by_purpose.is_valid():return {"status":"NOT_READY","reason":"invalid_constructor_context","draws":0}
 if excluded:return {"status":"READY","elite":0,"mods":[],"draws":0}
 var elite_selector=ExoduserHell0EliteSelector.new()
 elite_selector.configure(random_by_purpose.bind("rollElite"))
 var elite: Dictionary=elite_selector.roll_elite(stage)
 if elite.status!="READY":return elite
 var mod_selector=ExoduserHell0EliteSelector.new()
 mod_selector.configure(random_by_purpose.bind("rollMods_attack"))
 var mods: Dictionary=mod_selector.roll_mods(int(elite.value),stage)
 if mods.status!="READY":mods.draws+=elite.draws;mods.prefix=elite.prefix+mods.prefix;return mods
 return {"status":"READY","elite":elite.value,"mods":mods.value,"draws":elite.draws+mods.draws}
static func _int32(v: float) -> int:
 if not is_finite(v):return 0 # JS ToInt32(Infinity/NaN).
 var low: float=fposmod(ceil(v) if v<0 else floor(v),4294967296.0)
 return int(low-4294967296.0 if low>=2147483648.0 else low)
static func apply_forced_constructor(raw: Variant,role: String) -> Dictionary:
 # G31620–31636. Only on completed, unregistered constructor Dictionary.
 if not raw is Dictionary:return {"status":"NOT_READY","reason":"source_null_postassignment_would_throw"}
 if role not in ["gate_guard","escort"]:return {"status":"NOT_READY","reason":"unknown_forced_role"}
 var required: Array=["mhp","atk","r"] if role=="gate_guard" else ["mhp"]
 for key in required:
  if not _num(raw.get(key)):return {"status":"NOT_READY","reason":"invalid_constructor_"+key}
 if role=="gate_guard":
  raw.hp=_int32(float(raw.mhp)*4.0);raw.mhp=raw.hp
  raw.atk=_int32(float(raw.atk)*2.0);raw.baseAtk=raw.atk
  raw.r=_int32(float(raw.r)*1.4)
  raw.poise=80;raw.maxPoise=80;raw.elite=3;raw._isGateGuard=true
  raw.dropTier=2 # Math.min(4, SI_TO_HELL[si]+2), hell0 only.
 else:
  raw.elite=1;raw.hp=_int32(float(raw.mhp)*2.5);raw.mhp=raw.hp
 # No rollMods/rollAura/tier multipliers, no shield reset or radius repair.
 return {"status":"READY","value":raw,"draws":0}
