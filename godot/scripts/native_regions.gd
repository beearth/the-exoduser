extends Node
## P3-003. Source: game.html 60688-60795, 60118-60214, 60934-60966.
## Region-only owner over the existing live G. Never writes spawnHoles/totalSpawned.
const TILE=40.0
const SITES=[[58,158],[148,150],[52,42],[148,42]]
const ELEMENTS=[2,1,3,4]
const ELC=["#bbbbbb","#ff5522","#3388ff","#9933cc","#ffee00","#ff88cc","#88aa44"]
const FB_TO_REGION=[2,3,0,1]
const KO=["북서","북동","남서","남동"]
const EN=["Northwest","Northeast","Southwest","Southeast"]
const CH1_KO=["북서 · 어둠","북동 · 번개","남서 · 물","남동 · 불"]
const CH1_EN=["Northwest · Dark","Northeast · Lightning","Southwest · Water","Southeast · Fire"]
signal region_banner(index: int,purge: bool)
signal gate_opened
var _stage_spawn_adapter: RefCounted
var _main: Node
var _world: Node
var _player: Node2D
var _state: Node
var _scripts: Array=[]
var _g: Dictionary
var _last_frame:=-1.0
var _layer: CanvasLayer
var _banner: VBoxContainer
var _banner_ko: Label
var _banner_en: Label
var _banner_sub: Label
var _gems: Array[ColorRect]=[]
var _flare: TextureRect
var _flare_left:=0.0
var _banner_left:=0.0
var _area: VBoxContainer
var _area_stage:=-1
var _area_left:=0.0
var _boundary: ImageTexture
var _tint: ImageTexture
var _canvas: Control
var _cache: Texture2D
var _mask:=-1
var _init_count:=0
var _kill_count:=0
var _pending_effects: Array=[]
func configure(main: Node) -> bool:
 if _main!=null or not is_instance_valid(main) or get_parent()!=main:return false
 _main=main;_world=main.world;_player=main.player;_state=main.source_state
 _scripts=[main.get_script(),_world.get_script(),_player.get_script(),_state.get_script(),get_script()]
 var g: Variant=_state.read_current_g()
 if not g is Dictionary:return false
 _g=g;process_physics_priority=2;process_mode=Node.PROCESS_MODE_ALWAYS
 _build_banner()
 region_banner.connect(_show_region_banner)
 return initialize_stage().get("ready")==true
func _live() -> bool:
 if not is_inside_tree() or is_queued_for_deletion() or not is_instance_valid(_main) or _main.is_queued_for_deletion():return false
 if _main.get_script()!=_scripts[0] or get_script()!=_scripts[4] or get_parent()!=_main:return false
 if _main.world!=_world or _main.player!=_player or _main.source_state!=_state:return false
 if not is_instance_valid(_world) or not is_instance_valid(_player) or not is_instance_valid(_state):return false
 if _world.get_script()!=_scripts[1] or _player.get_script()!=_scripts[2] or _state.get_script()!=_scripts[3]:return false
 return _world.is_inside_tree() and _player.is_inside_tree() and _state.is_inside_tree() and is_same(_state.read_current_g(),_g)
static func spawn_hole_count(size: float,stage: int) -> int:
 var base: int=50 if size<=0.3 else 100
 return int(ceil(ceil(base*0.5)*0.3)) if stage==0 else base
static func index_at(g: Dictionary,x: float,y: float) -> int:
 if not g.get("_regions") is Array:return -1
 return (0 if y/TILE<float(g._regMidY) else 2)+(0 if x/TILE<float(g._regMidX) else 1)
static func fb_alive(g: Dictionary,r: Dictionary) -> bool:
 if int(r.fbIdx)<0 or g.get("stage")!=0 or g.get("_fbDone",false):return false
 if not g.get("_fbSpawned",false):return true
 var a: Variant=g.get("_fieldBosses")
 if not a is Array:return false
 var i: int=r.fbIdx
 return i<a.size() and a[i] is Dictionary and float(a[i].get("hp",0))>0
static func ratio(g: Dictionary,r: Dictionary,i: int) -> float:
 var bonus: float=0.10 if g.get("_gateGuardKilled",false) and i==g._regGateIdx else 0.0
 return float(r.kills)/float(r.total)+bonus if r.total>0 else 1.0
static func cleared_count(g: Dictionary) -> int:
 var count:=0
 if g.get("_regions") is Array:
  for r in g._regions:
   if r.cleared:count+=1
 return count
static func init_regions(g: Dictionary,point: Vector2,mw: int,mh: int,has_map: bool) -> Dictionary:
 # Original reset occurs even for a small map.
 g._regions=null;g._regMidX=0;g._regMidY=0;g._regCurIdx=-1;g._regBannerCd=0;g._regGateIdx=-1;g._bossClearT=null
 if not has_map or mw<180 or mh<180:return {"ready":true,"regions_enabled":false}
 if not g.get("spawnHoles") is Array:return {"ready":false,"reason":"actual_spawnHoles_unbound"}
 var mid_x:=mw/2.0;var mid_y:=mh/2.0
 g._regMidX=mid_x;g._regMidY=mid_y
 var regions: Array=[]
 for i in range(4):
  regions.append({"id":i,"nameKo":CH1_KO[i] if g.stage==0 else KO[i],"nameEn":CH1_EN[i] if g.stage==0 else EN[i],"x0":mid_x if i&1 else 0.0,"y0":mid_y if i>>1 else 0.0,"x1":float(mw) if i&1 else mid_x,"y1":float(mh) if i>>1 else mid_y,"total":0,"kills":0,"cleared":false,"fbIdx":-1})
 if g.stage==0:
  for k in range(4):regions[FB_TO_REGION[k]].fbIdx=k
 for h in g.spawnHoles:
  if not h is Dictionary or not h.has_all(["x","y","size"]):return {"ready":false,"reason":"spawn_hole_record_incomplete"}
  var idx: int=(0 if h.y/TILE<mid_y else 2)+(0 if h.x/TILE<mid_x else 1)
  regions[idx].total+=spawn_hole_count(float(h.size),int(g.stage))
 g._regions=regions
 var guard: Variant=g.get("_gateGuard")
 var gate_x: float=float(guard.x)/TILE if guard is Dictionary else (float(g._bossCx)+0.5 if g.get("_bossCx")!=null else mid_x)
 var gate_y: float=float(guard.y)/TILE if guard is Dictionary else (float(g._gateY)+0.5 if g.get("_gateY")!=null else 0.0)
 g._regGateIdx=(0 if gate_y<mid_y else 2)+(0 if gate_x<mid_x else 1)
 for r in regions:
  if r.total<=0 and not fb_alive(g,r):r.cleared=true
 g._regCurIdx=index_at(g,point.x,point.y)
 return {"ready":true,"regions_enabled":true}
func initialize_stage() -> Dictionary:
 if _stage_spawn_adapter!=null:return {"ready":false,"reason":"provider_budget_already_bound"}
 if not _live():return {"ready":false,"reason":"region_owner_not_current"}
 var map: Dictionary=_world.map_data
 var result: Dictionary=init_regions(_g,_player.global_position,int(map.get("width",0)),int(map.get("height",0)),map.get("tiles") is Array)
 if result.ready:_init_count+=1;_mask=-1
 return result
static func record_kill(g: Dictionary,e: Dictionary) -> void:
 if not g.get("_regions") is Array or e.get("ib",false):return
 var x: float=float(e._homeX) if e.get("_homeX")!=null else float(e.x)
 var y: float=float(e._homeY) if e.get("_homeY")!=null else float(e.y)
 var i:=index_at(g,x,y)
 if i>=0:g._regions[i].kills+=1
func record_actor_kill(actor: Node2D) -> Dictionary:
 if _stage_spawn_adapter!=null:return _stage_spawn_adapter.record_actor_kill(actor)
 if not _live() or not is_instance_valid(actor) or actor.get_parent()!=_world or not _world.get_enemies().has(actor) or actor.get("alive")!=false or float(actor.get("hp"))>0:return {"applied":false,"reason":"region_actual_actor_not_current"}
 var native: Dictionary=actor.data.get("native_final",{})
 var e: Dictionary={"x":actor.global_position.x,"y":actor.global_position.y,"ib":native.get("ib",false)}
 for field in ["_homeX","_homeY"]:
  if native.has(field):e[field]=native[field]
 record_kill(_g,e);_kill_count+=1
 return {"applied":true}
static func tick_regions(g: Dictionary,point: Vector2,frame: int,provider_index: int=-2) -> Array:
 var banners: Array=[]
 if not g.get("_regions") is Array or not g.get("on",false) or g.get("_bossArena",false) or float(g.get("_bossLoadPhase",0))>0 or frame%15!=0:return banners
 if g._regBannerCd>0:g._regBannerCd-=15
 for i in range(4):
  var r: Dictionary=g._regions[i]
  if r.cleared or ratio(g,r,i)<0.8-1e-9 or fb_alive(g,r):continue
  r.cleared=true
  if cleared_count(g)<4:banners.append({"index":i,"purge":true})
 var tx:=point.x/TILE;var ty:=point.y/TILE
 if provider_index==-2 and (absf(tx-g._regMidX)<1.5 or absf(ty-g._regMidY)<1.5):return banners
 var idx: int=provider_index if provider_index!=-2 else (0 if ty<g._regMidY else 2)+(0 if tx<g._regMidX else 1)
 if idx<0:return banners
 if idx==g._regCurIdx:return banners
 g._regCurIdx=idx
 if g._regBannerCd>0:return banners
 g._regBannerCd=300;banners.append({"index":idx,"purge":false})
 return banners
func _physics_process(_delta: float) -> void:
 if not _live() or get_tree().paused:return
 if _stage_spawn_adapter!=null and not _stage_spawn_adapter.is_current():return
 var frame: float=_world.get_native_projectile_fx_context()["frame_reset_epoch"]
 if frame==_last_frame:return
 _last_frame=frame
 var provider_index: int=_stage_spawn_adapter.region_at(_player.global_position) if _stage_spawn_adapter!=null else -2
 for event in tick_regions(_g,_player.global_position,int(frame),provider_index):
  region_banner.emit(event.index,event.purge)
  if event.purge:_pending_effects.append({"effect":"SFX.magic(1)/pet region_clear","bound":false})
 if is_instance_valid(_canvas):
  var clear_mask:=0
  if _g.get("_regions") is Array:
   for i in range(4):
    if _g._regions[i].cleared:clear_mask|=1<<i
  if clear_mask!=_mask:_canvas.queue_redraw()
 # Source gate condition 41869-41877. No fabricated FB death/gate position.
 if _g.get("on",false) and _g.get("_regions") is Array and not _g.get("_bossArena",false) and _g.get("bossAlive",false) and not _g.get("_bossUnlocked",false):
  if (_g.stage!=0 or _g.get("_fbDone",false)) and cleared_count(_g)>=4:
   _g._bossUnlocked=true;gate_opened.emit()
static func minimap_sites(g: Dictionary,origin: Vector2,sc: float) -> Array:
 var points: Array=[]
 if not g.get("_regions") is Array or g.get("stage")!=0 or g.get("_fbDone",false):return points
 if g.get("_fieldBosses") is Array:
  for fb in g._fieldBosses:
   if fb is Dictionary and fb.get("hp",0)>0:points.append({"pos":origin+Vector2(fb.x,fb.y)/TILE*sc,"color":Color(ELC[int(fb.el)]),"radius":3.0})
 elif not g.get("_fbSpawned",false):
  for i in range(4):points.append({"pos":origin+(Vector2(SITES[i][0],SITES[i][1])+Vector2(0.5,0.5))*sc,"color":Color(ELC[ELEMENTS[i]]),"radius":3.0})
 return points
static func minimap_layers(image: Image,g: Dictionary,sc: float) -> Dictionary:
 var boundary:=Image.create(image.get_width(),image.get_height(),false,Image.FORMAT_RGBA8)
 var tint:=Image.create(image.get_width(),image.get_height(),false,Image.FORMAT_RGBA8)
 var mask:=0
 for i in range(4):
  if g._regions[i].cleared:mask|=1<<i
 for y in range(image.get_height()):
  for x in range(image.get_width()):
   var alpha: float=image.get_pixel(x,y).a
   if alpha==0:continue
   if absf((x+0.5)-g._regMidX*sc)<=0.5 or absf((y+0.5)-g._regMidY*sc)<=0.5:boundary.set_pixel(x,y,Color(1,1,1,0.14*alpha))
   var idx: int=(0 if y/sc<g._regMidY else 2)+(0 if x/sc<g._regMidX else 1)
   if mask&(1<<idx):tint.set_pixel(x,y,Color(30.0/255,60.0/255,30.0/255,0.45*alpha))
 return {"boundary":boundary,"tint":tint}
func draw_minimap(canvas: Control,base: Texture2D,origin: Vector2,sc: float) -> void:
 if _stage_spawn_adapter!=null:return # New MAP11 geometry overlay belongs to its provider, never legacy quadrants/sites.
 if not _live() or not _g.get("_regions") is Array:return
 _canvas=canvas
 var mask:=0
 for i in range(4):
  if _g._regions[i].cleared:mask|=1<<i
 if _cache!=base or _mask!=mask:
  var layers: Dictionary=minimap_layers(base.get_image(),_g,sc)
  var boundary: Image=layers.boundary
  var tint: Image=layers.tint
  _boundary=ImageTexture.create_from_image(boundary);_tint=ImageTexture.create_from_image(tint);_cache=base;_mask=mask
 canvas.draw_texture(_boundary,origin);canvas.draw_texture(_tint,origin)
 for point in minimap_sites(_g,origin,sc):
  canvas.draw_circle(point.pos,3,point.color);canvas.draw_arc(point.pos,3,0,TAU,24,Color.BLACK,1)
 if _g.get("bossAlive",false) and not _g.get("_bossArena",false) and _g.get("_bossCx")!=null and _g.get("_gateY")!=null:
  draw_lock(canvas,origin+Vector2(float(_g._bossCx)+0.5,float(_g._gateY)+0.5)*sc,bool(_g.get("_bossUnlocked",false)))
static func draw_lock(canvas: Control,at: Vector2,open: bool) -> void:
 var color:=Color("44aaff" if open else "ff4444")
 var center: Vector2=at+Vector2(3,-2.5) if open else at+Vector2(0,-2)
 var start: float=PI*0.95 if open else PI;var end: float=PI*1.8 if open else TAU
 canvas.draw_arc(center,3,start,end,20,Color(0,0,0,0.9),3);canvas.draw_arc(center,3,start,end,20,color,1.5)
 var rect:=Rect2(at-Vector2(3.5,2),Vector2(7,6));canvas.draw_rect(rect,color);canvas.draw_rect(rect,Color(0,0,0,0.9),false,1);canvas.draw_rect(Rect2(at+Vector2(-0.5,-0.2),Vector2(1.2,2.6)),Color(0,0,0,0.85))
static func region_tone(hex: String) -> Color:
 var r:=154;var g:=143;var b:=128
 var valid: bool=hex.length()==7 and hex.begins_with("#")
 if valid:
  for c in hex.substr(1):
   if not c.to_lower() in "0123456789abcdef":valid=false;break
 if valid:
  var n:=hex.substr(1).hex_to_int()
  r=int(floor(((n>>16)&255)*0.6+154*0.4+0.5));g=int(floor(((n>>8)&255)*0.6+143*0.4+0.5));b=int(floor((n&255)*0.6+128*0.4+0.5))
 return Color(r/255.0,g/255.0,b/255.0)
func _build_banner() -> void:
 _layer=CanvasLayer.new();_layer.layer=19;add_child(_layer)
 _flare=TextureRect.new();_flare.size=Vector2(340,56);_flare.pivot_offset=Vector2(170,28);_flare.mouse_filter=Control.MOUSE_FILTER_IGNORE;_flare.visible=false
 var texture:=GradientTexture2D.new();texture.width=340;texture.height=56;texture.fill=GradientTexture2D.FILL_RADIAL;texture.fill_from=Vector2(0.5,0.5);texture.fill_to=Vector2(1,0.5)
 var gradient:=Gradient.new();gradient.offsets=PackedFloat32Array([0,0.55,0.75]);gradient.colors=PackedColorArray([Color(1,138.0/255,58.0/255,0.22),Color(216.0/255,183.0/255,120.0/255,0.1),Color(0,0,0,0)]);texture.gradient=gradient;_flare.texture=texture;_layer.add_child(_flare)
 _banner=VBoxContainer.new();_banner.mouse_filter=Control.MOUSE_FILTER_IGNORE;_banner.alignment=BoxContainer.ALIGNMENT_CENTER;_banner.visible=false;_layer.add_child(_banner)
 var header:=HBoxContainer.new();header.alignment=BoxContainer.ALIGNMENT_CENTER;header.add_theme_constant_override("separation",12);header.mouse_filter=Control.MOUSE_FILTER_IGNORE;_banner.add_child(header)
 var font: Font=load("res://assets/fonts/NotoSerifKR-VF.ttf")
 for i in range(3):
  if i!=1:
   var gem:=ColorRect.new();gem.custom_minimum_size=Vector2(6,6);gem.pivot_offset=Vector2(3,3);gem.rotation=PI/4;gem.size_flags_vertical=Control.SIZE_SHRINK_CENTER;gem.mouse_filter=Control.MOUSE_FILTER_IGNORE;header.add_child(gem);_gems.append(gem)
  else:
   _banner_ko=Label.new();_banner_ko.add_theme_font_override("font",font);_banner_ko.add_theme_font_size_override("font_size",20);header.add_child(_banner_ko)
 for i in range(2):
  var label:=Label.new();label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;label.add_theme_font_override("font",font);label.add_theme_font_size_override("font_size",10 if i==0 else 14);_banner.add_child(label)
 _banner_en=_banner.get_child(1);_banner_sub=_banner.get_child(2)
 _banner_en.modulate=Color(168.0/255,153.0/255,127.0/255,0.72);_banner_sub.modulate=Color(219.0/255,208.0/255,190.0/255,0.92)
func _show_region_banner(index: int,purge: bool) -> void:
 var r: Dictionary=_g._regions[index]
 var tone: Color=Color("d8b778") if purge else (region_tone(ELC[ELEMENTS[r.fbIdx]]) if r.fbIdx>=0 else Color("8d7c65"))
 for gem in _gems:gem.color=tone
 _banner_ko.modulate=Color(233.0/255,216.0/255,180.0/255,0.96) if purge else Color(223.0/255,214.0/255,194.0/255,0.92)
 _flare_left=1.4 if purge else 0.0;_flare.visible=purge
 _banner_ko.text=r.nameKo+(" — 정화" if purge else "")
 _banner_en.text="REGION PURGED · %d / 4"%cleared_count(_g) if purge else r.nameEn.to_upper()
 _banner_sub.text="" if purge else ("정화" if r.cleared else "처치 %d / %d"%[mini(r.kills,r.total),r.total]+(" · 앵글러 생존" if fb_alive(_g,r) else ""))
 _banner_left=2.7;_banner.visible=true
const CHAPTER_STARTS=[0,4,10,14,21,26,32]
const CHAPTER_KO=["썩은 숲","벌레굴","지옥의 겨울","화염지대","지옥 군단","사도의 마굴","지옥성"]
const CHAPTER_EN=["ROTTEN FOREST","WORM NEST","HELL WINTER","FLAME OF AGONY","HELL LEGION","APOSTLE LAIR","HELL CASTLE"]
static func area_title(stage: int) -> Dictionary:
 var chapter:=0
 for i in range(CHAPTER_STARTS.size()):
  if stage>=CHAPTER_STARTS[i]:chapter=i
 var floor_number: int=stage-CHAPTER_STARTS[chapter]+1
 return {"ko":"제%d구역 · %s %d구역"%[stage+1,CHAPTER_KO[chapter],floor_number],"en":"THE "+CHAPTER_EN[chapter]}
func _show_area_title() -> void:
 if _area!=null:_area.queue_free()
 _area=VBoxContainer.new();_area.mouse_filter=Control.MOUSE_FILTER_IGNORE;_layer.add_child(_area)
 var titles:=area_title(int(_g.stage))
 for entry in [[titles.ko,25],[titles.en,10]]:
  var label:=Label.new();label.text=entry[0];label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;label.add_theme_font_override("font",load("res://assets/fonts/NotoSerifKR-VF.ttf"));label.add_theme_font_size_override("font_size",entry[1]);_area.add_child(label)
 _area_stage=int(_g.stage);_area_left=3.1
func _process(delta: float) -> void:
 if not _live():return
 if _g.get("on",false) and _area_stage!=int(_g.stage):_show_area_title()
 if _area_left>0:
  _area_left=maxf(0,_area_left-delta)
  var size: Vector2=get_viewport().get_visible_rect().size
  var p: float=1-_area_left/3.1
  _area.position=Vector2((size.x-minf(size.x*0.74,760))/2,size.y*0.18);_area.size.x=minf(size.x*0.74,760)
  _area.modulate.a=minf(p/0.13,(1-p)/0.31) if p<0.13 or p>0.69 else 1.0
  if _area_left<=0:_area.visible=false
 if _flare_left>0:
  _flare_left=maxf(0,_flare_left-delta)
  var size: Vector2=get_viewport().get_visible_rect().size
  var f: float=1-_flare_left/1.4
  _flare.position=Vector2(size.x/2-170,size.y*0.28+8)
  _flare.modulate.a=f/0.22 if f<0.22 else (1-f)/0.78
  _flare.scale.x=0.5+f/0.22*0.5 if f<0.22 else 1+(f-0.22)/0.78*0.25
  if _flare_left<=0:_flare.visible=false
 if _banner_left<=0:return
 _banner_left=maxf(0,_banner_left-delta)
 var progress: float=1-_banner_left/2.7
 var size: Vector2=get_viewport().get_visible_rect().size
 _banner.position=Vector2((size.x-minf(size.x*0.64,620))/2,size.y*0.28);_banner.size.x=minf(size.x*0.64,620)
 _banner.modulate.a=minf(progress/0.12,(1-progress)/0.28) if progress<0.12 or progress>0.72 else 1.0
 if _banner_left<=0:_banner.visible=false
func snapshot() -> Dictionary:
 return {"ready":_live(),"init_count":_init_count,"kill_calls":_kill_count,"regions":_g.get("_regions"),"current":_g.get("_regCurIdx"),"cleared":cleared_count(_g),"sites":minimap_sites(_g,Vector2.ZERO,0.61),"pending_effects":_pending_effects.duplicate(true),"full_fieldboss_combat":false}

# DEMO11-43: P3 owner remains the sole writer of region totals/kills.
func can_bind_stage_spawn(spawn: Node2D) -> bool:
 return _live() and not get_tree().paused and _stage_spawn_adapter==null and spawn.world==_world and spawn.state==_state and spawn.player==_player
func can_use_stage_spawn(adapter: RefCounted,spawn: Node2D) -> bool:
 return _live() and _stage_spawn_adapter==adapter and spawn.world==_world and spawn.state==_state and spawn.player==_player
func install_stage_spawn_budget(adapter: RefCounted,sites: Dictionary,totals: Array) -> Dictionary:
 if not _live() or _stage_spawn_adapter!=null or adapter==null or adapter.get_script().resource_path!="res://scripts/native_stage_spawn_adapter.gd":return {"applied":false,"reason":"provider_region_owner_rejected"}
 _stage_spawn_adapter=adapter
 var regions: Array=[null,null,null,null]
 for site in sites.regions:
  regions[site.id]={"id":site.id,"nameKo":site.name_ko,"nameEn":site.name_en,"total":totals[site.id],"kills":0,"cleared":false,"fbIdx":site.fb_index}
 _g._regions=regions;_g._regGateIdx=sites.gate_region_id;_g._regCurIdx=-1;_g._regBannerCd=0;_g._bossClearT=null
 _last_frame=-1.0
 for r in regions:
  if r.total<=0 and not fb_alive(_g,r):r.cleared=true
 _init_count+=1;_mask=-1
 return {"applied":true}
func record_stage_origin_kill(adapter: RefCounted,region_id: int) -> Dictionary:
 if not _live() or _stage_spawn_adapter!=adapter or region_id not in range(4):return {"applied":false,"reason":"region_origin_owner_not_current"}
 _g._regions[region_id].kills+=1;_kill_count+=1
 return {"applied":true,"region_id":region_id}
