extends Control
## Display-only transcription game.html:60798-60930. Never changes target/game state.
const UI=preload("res://scripts/native_demo_ui_i18n.gd")
const FONTS=preload("res://scripts/native_ui_fonts.gd")
const REGIONS=preload("res://scripts/native_regions.gd")
const ART=preload("res://assets/ui/region_arrow.png")
var hud: Node
var face: Font
var digits: Font
var target:=Vector2.ZERO
var caption:=""
var active:=false
var elapsed:=0.0
var blocks: Array[Rect2]=[Rect2(),Rect2(),Rect2()]
var clip_top:=66.0
var clip_bottom:=900.5
func _ready() -> void:
 mouse_filter=Control.MOUSE_FILTER_IGNORE
 face=FONTS.stack("hell",700);digits=FONTS.stack("cinzel_hell",600)
func _process(dt: float) -> void:
 elapsed+=dt
 if elapsed>=1.0/3.0:elapsed=0;_target()
 queue_redraw()
func _target() -> void:
 active=false
 if not is_instance_valid(hud._source_state) or not is_instance_valid(hud._player):return
 var g: Variant=hud._source_state.read_current_g()
 if not g is Dictionary or not g.get("on",false) or g.get("paused",false) or g.get("_bossArena",false) or float(g.get("_bossLoadPhase",0))>0 or g.get("stageCleared",false):return
 var regions: Variant=g.get("_regions")
 if not regions is Array:return
 if g.get("_bossUnlocked",false):
  if g.get("_bossCx")!=null and g.get("_gateY")!=null:
   target=Vector2((float(g._bossCx)+.5)*40,(float(g._gateY)+2.5)*40);caption=UI.text("지옥문");active=true
  return
 blocks[0]=hud._root.get_node("NativeMinimap").get_global_rect().grow(12)
 blocks[1]=hud._root.get_node("NativeObjectivePanel").get_global_rect().grow(12)
 blocks[2]=Rect2()
 var pets: Node=hud._world.get_node_or_null("NativePets")
 if is_instance_valid(pets) and is_instance_valid(pets._subtitle_root) and pets._subtitle_root.modulate.a>0:
  blocks[2]=pets._subtitle_root.get_global_rect().grow(12)
 var best:=INF
 var at: Vector2=hud._player.global_position
 for i in range(regions.size()):
  var r: Dictionary=regions[i]
  if r.get("cleared",false):continue
  var candidate:=Vector2.ZERO
  var count:=0
  for e in hud._world._enemies:
   if not is_instance_valid(e) or not e.alive:continue
   var point: Vector2=e.spawn_position
   var idx: int=(0 if point.y<float(g.get("_regMidY",100))*40 else 2)+(0 if point.x<float(g.get("_regMidX",100))*40 else 1)
   if idx==i:candidate+=e.global_position;count+=1
  var fi_live: int=int(r.get("fbIdx",-1))
  var live_bosses: Variant=g.get("_fieldBosses")
  var boss: Variant=live_bosses[fi_live] if live_bosses is Array and fi_live>=0 and fi_live<live_bosses.size() else null
  if boss is Dictionary and float(boss.get("hp",0))>0 and REGIONS.ratio(g,r,i)>=.8-.000000001:candidate=Vector2(boss.x,boss.y)
  elif count>0:candidate/=count
  else:
   var bosses: Variant=g.get("_fieldBosses")
   var fi: int=int(r.get("fbIdx",-1))
   if bosses is Array and fi>=0 and fi<bosses.size() and bosses[fi] is Dictionary and float(bosses[fi].get("hp",0))>0:candidate=Vector2(bosses[fi].x,bosses[fi].y)
   elif fi>=0 and not g.get("_fbSpawned",false) and not g.get("_fbDone",false):candidate=(Vector2(REGIONS.SITES[fi][0],REGIONS.SITES[fi][1])+Vector2(.5,.5))*40
   else:candidate=Vector2((float(r.get("x0",0))+float(r.get("x1",0)))*20,(float(r.get("y0",0))+float(r.get("y1",0)))*20)
  var distance:=at.distance_squared_to(candidate)
  if distance<best:
   best=distance;target=candidate;caption=UI.text(str(r.get("nameKo","")));active=true
func text(value: String,where: Vector2,font: Font,px: int,col: Color) -> void:
 var p:=where-Vector2(font.get_string_size(value,HORIZONTAL_ALIGNMENT_LEFT,-1,px).x/2,-font.get_ascent(px)/2)
 draw_string_outline(font,p,value,HORIZONTAL_ALIGNMENT_LEFT,-1,px,3,Color(0,0,0,.9))
 draw_string(font,p,value,HORIZONTAL_ALIGNMENT_LEFT,-1,px,col)
func _draw() -> void:
 if not active or not is_instance_valid(hud._player):return
 var viewport:=get_viewport_rect().size
 var center:=viewport/2
 var screen: Vector2=hud._world.get_canvas_transform()*target
 if Rect2(Vector2(52,52),viewport-Vector2(104,104)).has_point(screen):return
 var d: Vector2=screen-center
 var t:=minf((center.x-52)/maxf(absf(d.x),.000001),(center.y-52)/maxf(absf(d.y),.000001))
 var point: Vector2=center+d*t
 point.x=clampf(point.x,24,viewport.x-24);point.y=clampf(point.y,clip_top,viewport.y-179.5)
 for block in blocks:
  if not block.has_point(point):continue
  var dl: float=point.x-block.position.x
  var dr: float=block.end.x-point.x
  var dt: float=point.y-block.position.y
  var db: float=block.end.y-point.y
  var move: float=minf(minf(dl,dr),minf(dt,db))
  if move==dl:point.x=block.position.x
  elif move==dr:point.x=block.end.x
  elif move==dt:point.y=block.position.y
  else:point.y=block.end.y
 point.x=clampf(point.x,24,viewport.x-24);point.y=clampf(point.y,clip_top,viewport.y-179.5)
 var angle: float=d.angle()
 draw_set_transform(point,angle)
 var height:=96.0*ART.get_height()/ART.get_width()
 draw_texture_rect(ART,Rect2(-56,-height/2,96,height),false,Color(1,1,1,.92))
 draw_set_transform(Vector2.ZERO)
 var label_at: Vector2=point-Vector2(cos(angle),sin(angle))*68
 text(caption,label_at,face,14,Color("e4d6b9"))
 text(str(int(hud._player.global_position.distance_to(target)/64))+"m",label_at+Vector2(0,16),digits,12,Color("c9b891"))
