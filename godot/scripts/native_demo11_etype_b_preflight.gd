extends RefCounted
## DEMO11-58..62 only. Integration candidate with group A, NOT an actor factory.
## Never relabel another etype, allocate a placeholder actor, write HP or run a clock.
const ADAPTER = preload("res://scripts/native_stage_spawn_adapter.gd")
const FACTORY = preload("res://scripts/enemy_factory.gd")
const ETYPES := [8,9,10,11,12]
const UNITS := ["DEMO11-58","DEMO11-59","DEMO11-60","DEMO11-61","DEMO11-62"]
const SOURCE := {
 8:{"constructor":[31195,31196],"state":[38941,38941],"death":[42784,42790]},
 9:{"constructor":[31197,31198],"state":[38944,38958]},
 10:{"constructor":[31200,31200],"state":[38960,38971]},
 11:{"constructor":[31202,31202],"state":[38973,38983],"completion":[40777,40797]},
 12:{"constructor":[31204,31204],"state":[38985,38990]}}
var _factory: RefCounted = FACTORY.new()
func inspect(main: Node, group: String, radii: Dictionary) -> Dictionary:
 var rows: Array = []
 if not is_instance_valid(main) or main.is_queued_for_deletion():
  return {"ready":false,"status":"NOT_READY","reason":"actual_main_lost","rows":rows}
 var adapter: Variant = main.get("native_stage_spawn_adapter")
 if not adapter is RefCounted or adapter.get_script()!=ADAPTER or not adapter.is_current():
  return {"ready":false,"status":"NOT_READY","reason":"actual_MAP11_adapter_not_current","rows":rows}
 # Only caller-supplied radii are accepted; no radius/position/source-record fallback.
 # Minimal records here query the existing factory's admission only. They are never
 # sent to validate_source/consume_atomic and never become counterfeit spawn data.
 for i in range(ETYPES.size()):
  var etype: int = ETYPES[i]
  var radius: Variant = radii.get(etype)
  var site: Dictionary = adapter.request_spawn(group,{"etype":etype,"radius":radius})
  var reason: String = _factory.unsupported_reason({"etype":etype})
  var row: Dictionary = {"unit":UNITS[i],"etype":etype,"status":"NOT_READY",
   "site_ready":site.get("ready",false),"site":site,"factory_reason":reason,
   "actor_registered":false,"damage_tested":false,"source":SOURCE[etype].duplicate(true)}
  row["reason"] = "marker:"+str(site.get("reason")) if not row.site_ready else (reason if not reason.is_empty() else "B_special_state_owner_not_bound")
  rows.append(row) # A refusal must not suppress inspection of the remaining four.
 return {"ready":false,"status":"NOT_READY","rows":rows,"actors_registered":0,
  "clock_owned":false,"shared_helper_created":false,"integration_candidate":"group_A",
  "reason":"B_runtime_admission_pending"}
