extends RefCounted
## Screen range equals field camera range; inverse logical Y then .6 projection.
const SCALE=(1920.0/2000.0)/.70
const PROJECTION_Y=.6
const CENTER=Vector2(0,3520)
const LOOK_LIGHT=Vector2(-.45,-.89)
const GROUND=Color("55515e")
const VEIN=Color("351f29")
const MOSS=Color("454b40")
const FOG=Color("787482")
const WHITE=Color("b9b5c4")
const PARALLAX=.025
const PULSE_HZ=.16
const PULSE_STRENGTH=.012
const FOG_ALPHA=.035
const SPLIT=preload("res://assets/maps/map11/target32/split.json")
static func foot(source: Vector2) -> Vector2:
 var logical=(source-Vector2(1000,562.5))*Vector2(1,1.0/PROJECTION_Y)*SCALE
 return CENTER+logical*Vector2(1,PROJECTION_Y)
static func in_region(p: Vector2) -> bool:return p.y>2550 and absf(p.x)<2200
static func solids() -> Array[Dictionary]:
 var rows: Array[Dictionary]=[]
 for row in SPLIT.data.regions:
  if row.radius<=0:continue # near trunks are beyond the existing outer polygon
  rows.append({"id":"map11.field.target32_"+row.id,"center":foot(Vector2(row.source_foot[0],row.source_foot[1])),"radius":float(row.radius),"blocks_move":true,"blocks_los":true})
 return rows
