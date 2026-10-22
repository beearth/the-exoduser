extends Node2D
## Source 34670 / 54052–54067. Presentation history only; raw is never written.
const COLORS=[Color("bbbbbb"),Color("ff5522"),Color("3388ff"),Color("9933cc"),Color("ffee00"),Color("ff88cc"),Color("88aa44")]
const EXCLUDED=["mine","trap","dimRift","web","poisonZone","fdEnergy","waterBean","elemBall"]
var raw: Dictionary
var points:=PackedVector2Array()
var head:=0
var count:=0
var last:=Vector2.ZERO
func configure(source: Dictionary,at: Vector2) -> void:
 raw=source;last=at;points.resize(30);points.fill(at)
 var add:=CanvasItemMaterial.new();add.blend_mode=CanvasItemMaterial.BLEND_MODE_ADD;material=add
func sample(at: Vector2) -> void:
 if at.distance_squared_to(last)>=64:
  points[head]=at;head=(head+1)%30;count=mini(30,count+1);last=at
 queue_redraw()
func _draw() -> void:
 if count<2 or not raw.get("_druidPoison",false):return
 for flag in EXCLUDED:
  if raw.get(flag,false):return
 var col: Color=COLORS[clampi(int(raw.get("el",0)),0,6)]
 if raw.get("friendly",false):col=Color("ffdd00")
 var now: float=Time.get_ticks_msec()
 var flicker: float=.72+sin(now*.05+float(raw.get("x",0))*.3)*.28
 var radius: float=maxf(2.5,float(raw.get("sz",1))*2.2)*flicker*(2.0 if raw.get("parryClass")=="physical" else 1.0)
 for i in range(count-1):
  var taper: float=1.0-float(i)/count;col.a=taper*.5
  draw_line(to_local(points[posmod(head-1-i,30)]),to_local(points[posmod(head-2-i,30)]),col,maxf(.6,radius*taper),true)
