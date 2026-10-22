extends Control
## G679-680: single replacing showPH, 28.8px at 1920px; currentColor Gaussian text shadow25px.
var text := "":
 set(value):text=value;queue_redraw()
var ink := Color.WHITE:
 set(value):ink=value;queue_redraw()
var face: Font
func _ready() -> void:
 mouse_filter=Control.MOUSE_FILTER_IGNORE
 var spaced: FontVariation=preload("res://scripts/native_ui_fonts.gd").stack("font",900).duplicate()
 preload("res://scripts/native_ui_fonts.gd").apply_spacing(spaced,int(6))
 face=spaced
func _draw() -> void:
 if text.is_empty() or face==null:return
 var x: float=(size.x-face.get_string_size(text,HORIZONTAL_ALIGNMENT_LEFT,-1,29).x)*.5
 var baseline := Vector2(x,face.get_ascent(29))
 # Finite Gaussian kernel, retained face; no glyph resources loaded in the tick path.
 for iy in range(-3,4):
  for ix in range(-3,4):
   var w: float=exp(-float(ix*ix+iy*iy)/4.5)/13.65
   draw_string(face,baseline+Vector2(ix,iy)*5.,text,HORIZONTAL_ALIGNMENT_LEFT,-1,29,Color(ink,w))
 draw_string(face,baseline,text,HORIZONTAL_ALIGNMENT_LEFT,-1,29,ink)
