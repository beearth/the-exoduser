extends Node2D
## Snapshot52706-52743: waiting-for-revival presentation. Never rolls/writes death/revival.
const SHEET=preload("res://assets/vfx/vfx_void_black.png")
const NUMBERS=["0","1","2","3"]
var enemy: Dictionary={}
var source_index:=0
var visual_clock_ms: float=-1
static var _shared_font: Font
static var _shared_widths:=PackedFloat32Array()
var _font: Font
var _numbers_width:=PackedFloat32Array()
var _title_base: String="💀 부활 판정 중..."
var _title: String=""
var _title_width:=0.0
var _chance: int=-999
func configure(main: Node) -> void:
 if _shared_font==null:
  var mono:=SystemFont.new();mono.font_names=PackedStringArray(["monospace"]);mono.font_weight=700;_shared_font=mono
  _shared_widths.resize(4)
  for i in 4:_shared_widths[i]=_shared_font.get_string_size(NUMBERS[i],HORIZONTAL_ALIGNMENT_LEFT,-1,36).x
 _font=_shared_font;_numbers_width=_shared_widths
 if is_instance_valid(main) and main.has_method("translate_native_boot_label"):_title_base=main.translate_native_boot_label("💀 부활 판정 중...")
 set_process(false)
func observe(record: Dictionary,index: int=0) -> void:
 enemy=record;source_index=index
 set_process(not record.get("alive",true) and float(record.get("_reviveTimer",0))>0)
 queue_redraw()
func _process(_delta: float) -> void:
 queue_redraw()
 if enemy.get("alive",true) or float(enemy.get("_reviveTimer",0))<=0:set_process(false)
func _draw() -> void:
 if enemy.is_empty() or enemy.get("alive",true) or float(enemy.get("_reviveTimer",0))<=0 or enemy.get("_reviveX")==null:return
 var now: float=visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec())
 var ib: bool=enemy.get("ib",false)
 var timer: float=enemy._reviveTimer
 var p: float=1-timer/(180.0 if ib else (120.0 if int(enemy.get("elite",0))>0 else 90.0))
 var size_: float=(200.0 if ib else 80.0+float(enemy.get("r",0))*2)*(.3+p*.7)
 var speed_: float=120-int(p*60)
 var frame: int=int((now+source_index*500)/maxf(1,speed_))%9
 var alpha: float=.3+p*.5+sin(now/200+source_index)*.15
 var at: Vector2=to_local(Vector2(enemy._reviveX,enemy._reviveY))
 draw_texture_rect_region(SHEET,Rect2(at-Vector2.ONE*size_*.5,Vector2.ONE*size_),Rect2((frame%3)*768,floori(float(frame)/3)*768,768,768),Color(1,1,1,clampf(alpha,0,1)))
 if p>.85:
  var flash: float=(p-.85)/.15
  draw_circle(at,size_*.4*flash,Color(Color("ff4400" if ib else "aa44cc"),flash*.4),true,-1,true)
 if not ib:return
 var sec: int=clampi(int(ceil(maxf(0,timer)/60)),0,3)
 var baseline36: float=(_font.get_ascent(36)-_font.get_descent(36))*.5
 draw_string(_font,at+Vector2(-_numbers_width[sec]*.5,-40+baseline36),NUMBERS[sec],HORIZONTAL_ALIGNMENT_LEFT,-1,36,Color(Color("ff2222" if sec<=1 else "ff8844"),.9))
 var chance: int=int(float(enemy.get("_bossRevChance",0))*100)
 if chance!=_chance:
  _chance=chance;_title=_title_base+" ("+str(chance)+"%)";_title_width=_font.get_string_size(_title,HORIZONTAL_ALIGNMENT_LEFT,-1,13).x
 var baseline13: float=(_font.get_ascent(13)-_font.get_descent(13))*.5
 draw_string(_font,at+Vector2(-_title_width*.5,-60+baseline13),_title,HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color(Color("ffccaa"),.7))
 draw_rect(Rect2(at+Vector2(-40,-22),Vector2(80,5)),Color(Color("220000"),.4))
 draw_rect(Rect2(at+Vector2(-40,-22),Vector2(80*p,5)),Color(Color("ff6644" if enemy.get("_bossRevived",false) else "888888"),.4))
