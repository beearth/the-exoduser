extends Node2D
## Snapshot 19634–19642 / 61166–61197. Display only; no owner writes.
const SHEET=preload("res://assets/fieldboss/fieldboss_angler.png")
const VANISH=preload("res://assets/boss_parity/angler_vanish.png")
const CHARGE=preload("res://assets/boss_parity/angler_charge.png")
const FONTS=preload("res://scripts/native_ui_fonts.gd")
const COLORS=["#bbbbbb","#ff5522","#3388ff","#9933cc","#ffee00","#ff88cc","#88aa44"] # source ELC14338
var record: Dictionary
var _add: CanvasItemMaterial
var _tp: Node2D
var _font: Font
func _ready() -> void:
 _add=CanvasItemMaterial.new();_add.blend_mode=CanvasItemMaterial.BLEND_MODE_MIX
 _font=FONTS.stack("font",700)
 if OS.get_name()=="macOS":
  var css_font:=SystemFont.new();css_font.font_names=PackedStringArray(["Arial","Apple SD Gothic Neo"]);css_font.font_weight=700;_font=css_font
 _tp=Node2D.new();_tp.material=_add;add_child(_tp);_tp.draw.connect(_draw_additive)
 texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
func _vanish(frame: int,at: Vector2,k: float,wob: float) -> void:
 var d: float=512*k
 _tp.draw_set_transform(at+Vector2(0,d*.18),wob)
 _tp.draw_texture_rect_region(VANISH,Rect2(-d/2,-d*.88,d,d),Rect2((frame%4)*512,(frame/4)*512,512,512))
func _draw() -> void:
 if record.is_empty() or record.get("hp",0)<=0 or record.asleep:return
 var t: float=record.t
 if is_instance_valid(_tp):_tp.queue_redraw()
 if record.tpT>0:return
 if record.hid:return
 var cell: Vector2=SHEET.get_size()/Vector2(4,2);var frame: int=int(record.frame)&7
 draw_set_transform(Vector2(0,126),sin(t*.03)*.03+sin(t*.017)*.015)
 draw_texture_rect_region(SHEET,Rect2(-150,-276-sin(t*.05)*3,300,300),Rect2(Vector2(frame%4,frame/4)*cell,cell))
 draw_set_transform(Vector2.ZERO)
 draw_rect(Rect2(-112,-174,224,14),Color(0,0,0,.6));draw_rect(Rect2(-110,-172,220,10),Color("40252b"))
 draw_rect(Rect2(-110,-172,220*maxf(0,record.hp/float(record.mhp)),10),Color(COLORS[int(record.el)]))
 var font: Font=_font;var title: String="심연의 앵글러"
 draw_string(font,Vector2(-font.get_string_size(title,HORIZONTAL_ALIGNMENT_LEFT,-1,13).x/2,-178),title,HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("ddffff"))
func _draw_additive() -> void:
 if record.is_empty() or record.get("hp",0)<=0 or record.asleep:return
 var t: float=record.t
 if record.tpT>0:
  var total: float=record.get("tpMax",54);var elapsed: float=total-record.tpT
  if elapsed<32 and not record.spawnIn:_vanish(mini(7,int(elapsed/4)),Vector2.ZERO,.9,sin(t*.4)*.06)
  _vanish(7-mini(7,int((1-record.tpT/total)*8)),Vector2(record.tpX-record.x,record.tpY-record.y),1.05,sin(t*.38)*.10+sin(t*.17)*.05)
 elif not record.hid and record.enChg>0:
  _tp.draw_set_transform(Vector2.ZERO)
  var frame: int=int(record.frame)&7;var fr: int=int((1-record.enChg/180.0)*8)%8;var cw: float=CHARGE.get_width()/8.0
  var muzzle:=Vector2((.87 if (frame==3 or frame==7) else .13)-.5,.14 if frame==1 else .22)*300-Vector2(0,150)
  _tp.draw_texture_rect_region(CHARGE,Rect2(muzzle-Vector2(140,140),Vector2(280,280)),Rect2(fr*cw,0,cw,CHARGE.get_height()))
