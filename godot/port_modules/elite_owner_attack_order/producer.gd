extends RefCounted
## EL-01 admitted hell0 M29/M30 only. G31038–31039 / G38798–38809.
const M29=preload("res://scripts/enemy_mod_m29.gd")
static func advance(raw: Dictionary,ticks: float,distance: float,player: Dictionary,m29: RefCounted,m30: Node) -> Dictionary:
 if not is_finite(ticks) or ticks<=0 or not is_finite(distance):return {"status":"NOT_READY","reason":"invalid_phase"}
 if not raw.get("mods") is Array or not raw.get("modT") is Dictionary:return {"status":"NOT_READY","reason":"missing_actual_modifier_state"}
 var mods: Array=raw.mods
 for id in mods:
  if id not in ["M29","M30"]:return {"status":"NOT_READY","reason":"unsupported_modifier"}
 if mods.has("M29") and (m29==null or not m29.is_owner_ready()):return {"status":"NOT_READY","reason":"M29_not_ready"}
 if mods.has("M29"):
  for key in ["x","y"]:
   var v: Variant=player.get(key)
   if not (v is int or v is float) or not is_finite(float(v)):return {"status":"NOT_READY","reason":"missing_actual_player_context"}
 if mods.has("M30") and (not is_instance_valid(m30) or not m30.is_owner_ready() or not m30.owns_modifier_state(raw.modT)):return {"status":"NOT_READY","reason":"M30_not_ready"}
 for key in ["eliteBusy","eliteCharge","eliteRing"]:
  var v: Variant=raw.modT.get(key)
  if not (v is int or v is float) or not is_finite(float(v)):return {"status":"NOT_READY","reason":"invalid_"+key}
 if mods.is_empty():return {"status":"READY","lock_ticks":0}
 M29.tick_attack_lock(raw.modT,ticks)
 if mods.has("M29"):m29.trigger(raw,ticks,distance,player)
 if mods.has("M30"):m30.advance_owner_managed(ticks,distance)
 return {"status":"READY","lock_ticks":1}
