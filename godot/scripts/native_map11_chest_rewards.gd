extends RefCounted
## Source G32864-32876; shared existing mkItem, no alternate item/stat factory.
const DROP=preload("res://port_modules/kill_reward/drop_item_source.gd")
static func build(origin: Vector2,stage: int,level: int,rng: Callable) -> Dictionary:
 var gen=DROP.new(rng)
 var slots: Array=DROP.load_tables().SLOT_NAMES
 var count:=3+int(float(rng.call("chest_count"))*3)
 var records: Array=[]
 for i in count:
  var slot: String=slots[int(float(rng.call("chest_slot"))*slots.size())]
  var element:=int(float(rng.call("chest_el"))*6)
  var bonus:=minf(stage*.015,.30)
  var leg:=minf(.15+bonus*.5,.40);var hero:=minf(.25+bonus*.4,.35)
  var roll:=float(rng.call("chest_rarity"))
  var rarity:=4 if roll<leg else 3 if roll<leg+hero else 2 if roll<leg+hero+.30 else 1
  var item: Variant=gen.mk_item(slot,0,element,rarity,null,level)
  if item==null or gen.aborted:return {"status":"NOT_READY","reason":"existing_mk_item"}
  records.append({"x":origin.x+(float(rng.call("chest_x"))-.5)*50,"y":origin.y+(float(rng.call("chest_y"))-.5)*50,"type":"item","item":item,"picked":false})
 return {"status":"READY","records":records,"mats_bonus":5+int(stage*2),"hp_extract":2,"persistent_opened":false}
