extends Control
## game.html:143-290,2615-2662,60244-60305. Display-only web orb layers.
const FONTS=preload("res://scripts/native_ui_fonts.gd")
var hud: Node
var stamina:=false
var face: Font
var elapsed:=0.0
func _ready() -> void:
 mouse_filter=Control.MOUSE_FILTER_IGNORE
 face=FONTS.stack("hell_title",900)
func _process(dt: float) -> void:
 elapsed+=dt
 if elapsed>=.05:elapsed=0;queue_redraw()
func centered(value: String, x: float,y: float,px: int,color: Color) -> void:
 var at:=Vector2(x-face.get_string_size(value,HORIZONTAL_ALIGNMENT_LEFT,-1,px).x*.5,y)
 # ui-foundation.css:241 shadows 0 2px 3px / 0 0 6px, no text stroke.
 for i in range(8):
  var a: float=TAU*float(i)/8.
  draw_string(face,at+Vector2(cos(a),sin(a))*1.5+Vector2(0,1.8),value,HORIZONTAL_ALIGNMENT_LEFT,-1,px,Color(0,0,0,.22))
 draw_string(face,at,value,HORIZONTAL_ALIGNMENT_LEFT,-1,px,color)
func _draw() -> void:
 if not is_instance_valid(hud._source_state):return
 var p: Variant=hud._source_state.read_current_p()
 if not p is Dictionary:return
 var ratio:=clampf(float(p.get("shield",0))/maxf(1,float(p.get("mshield",0))),0,1)
 var col:=Color(50.0/255,150.0/255,1,.9*maxf(.1,ratio))
 if stamina:
  ratio=float(hud._root.get_node("WebMobilityHUD").gauge.get("pct",0))
  col=Color("ffcc33");col.a=.95
 var center:=Vector2(78.75,85.635)
 draw_arc(center,67.5,0,TAU,128,Color(0,0,0,.28),3.15,true)
 if ratio>0:
  # CSS ring drop-shadow(0 0 3px var(--ring-col)), 0.9 scale.
  for spread in range(6,0,-1):
   draw_arc(center,67.5,-PI/2,-PI/2+TAU*ratio,128,Color(col,.025*float(7-spread)),3.15+float(spread)*.9,true)
  draw_arc(center,67.5,-PI/2,-PI/2+TAU*ratio,128,col,3.15,true)
 if stamina:
  var cell_deg: float=float(hud._root.get_node("WebMobilityHUD").gauge.get("cell_deg",54))
  if cell_deg>0:
   var a: float=-PI+deg_to_rad(cell_deg)
   while a<PI+deg_to_rad(cell_deg):
    # repeating-conic-gradient(from -90deg), clipped to one turn.
    var tick_end: float=minf(a,PI)
    if a-deg_to_rad(3)<PI:draw_arc(center,67.5,a-deg_to_rad(3),tick_end,4,Color("120c03"),3.15,true)
    a+=deg_to_rad(cell_deg)

 if stamina:
  centered("MP",39,65,7,Color("88bbff"))
  centered(str(int(p.get("mp",0))),39,84,14,Color.WHITE)
  centered("/"+str(int(p.get("mmp",0))),39,96,7,Color(1,1,1,.5))
  centered("SP",119,65,7,Color("88dd88"))
  centered(str(int(p.get("st",0))),119,84,14,Color.WHITE)
  centered("/"+str(int(p.get("mst",0))),119,96,7,Color(1,1,1,.5))
 else:
  centered(str(int(p.get("hp",0))),78.75,80,20,Color.WHITE)
  centered("/ "+str(int(p.get("mhp",0))),78.75,95,12,Color(1,1,1,.6))

 var poise: int=int(p.get("poise",0)) if p.get("s")!="pStun" else 0
 var eye_base: int=2 if stamina else 0
 var eyes: bool=poise>0
 if eyes:
  for i in range(2):
   if eye_base+i<4-poise:continue
   var x: float=68.85 if i==0 else 84.15
   draw_circle(Vector2(x,-4.95),9,Color(1,.13,0,.1))
   draw_circle(Vector2(x,-4.95),5,Color(1,.13,0,.25))
   draw_circle(Vector2(x,-4.95),3.15,Color("ff2200"))
