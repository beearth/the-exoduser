extends RefCounted
## F-specific source-selected handoff, not another shared scheduler/helper.
const HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const FACTORY=preload("res://scripts/enemy_factory.gd")
const RECIPE=preload("res://scripts/type3_spawn_recipe.gd")
const FORMULA=preload("res://port_modules/combat_stat_formula/producer.gd")
const TYPES=[26,27,28]
const SPEED=[0.24,0.54,0.09] # G30847 → *1.3, minimum .2
const RADII=[10.0,10.0,25.0] # G30859
const RANGES=[800.0,600.0,1000.0] # G30870
var _main: WeakRef
var _factory: RefCounted
var _used: Dictionary={}
var _busy:=false
var _template: Dictionary={}
func configure(main: Node) -> void:
 _main=weakref(main)
 # Reuse the already installed main factory and P3 profile. No second factory
 # constructor (which rereads every unrelated profile) or filesystem load.
 _factory=main.world._encounter_factory
 _template=main.world.get_node("NativeSpawnHoleSystem")._template

func spawn_selected(owner: Node, group: String, source: Dictionary) -> Dictionary:
 var main: Node=_main.get_ref() if _main!=null else null
 if not is_instance_valid(_factory) or _factory.get_script()!=FACTORY or _template.is_empty(): return _no("actual_main_factory_profile_required")
 if _busy or not is_instance_valid(main) or main.is_queued_for_deletion() or main.get_tree().paused: return _no("owner_busy_or_lost")
 var holes: Node=main.world.get_node_or_null("NativeSpawnHoleSystem")
 if owner!=holes or not is_instance_valid(holes) or holes.get_script()!=HOLES or holes.main!=main: return _no("actual_source_scheduler_required")
 var adapter: Variant=main.native_stage_spawn_adapter
 if adapter==null or not adapter.is_current(): return _no("actual_MAP11_adapter_required")
 var etype: Variant=source.get("etype")
 if not etype is int or etype not in TYPES: return _no("outside_group_F")
 if source.get("elite")!=0 or source.get("mods")!=[]: return _no("elite_modifier_owner_required")
 for key in ["speed_u","radius_u"]:
  if not _number(source.get(key)) or source[key]<0 or source[key]>=1: return _no("source_draw_required:"+key)
 var literal: Variant=source.get("literal")
 if not literal is Dictionary: return _no("source_literal_required")
 for draw in HOLES.MKEN_LITERAL_DRAWS:
  if not draw[1].is_empty() and not draw[1].has(etype): continue
  var span: float=30.0 if etype==26 and draw[0]=="_iceBlizzT" else float(draw[3]) # G31233; existing P3 table says40
  if not _number(literal.get(draw[0])) or literal[draw[0]]<draw[2] or literal[draw[0]]>=draw[2]+span: return _no("source_literal_required:"+str(draw[0]))
 if not source.get("spawn_n") is int or source.spawn_n<1: return _no("source_spawn_index_required")
 var g: Dictionary=main.source_state.read_current_g()
 var player: Dictionary=main.source_state.read_current_p()
 var options: Variant=main.source_initialization_services.read_current_options()
 if not options is Dictionary or options.get("diff")!=5 or g.get("stage")!=0 or not g.get("on",false) or g.get("_bossArena",false) or g.get("_stageDiffOff",0)!=0: return _no("source_stage0_normal_difficulty_slice_required")
 var hole: Dictionary={}
 for h in g.spawnHoles:
  if h.get("spawn_group_id")==group: hole=h;break
 if hole.is_empty() or source.spawn_n>HOLES.spawn_hole_count(hole.size,0): return _no("group_or_spawn_index_invalid")
 var token:=group+"/"+str(source.spawn_n)
 if _used.has(token): return _no("source_spawn_already_consumed")
 var index: int=TYPES.find(etype)
 var radius: float=(RADII[index]+float(source.radius_u)*2)*2
 var site: Dictionary=adapter.request_spawn(group,{"etype":etype,"radius":radius})
 if not site.get("ready",false): return site
 var pos: Vector2=site.position
 # No safePt or old-coordinate fallback after MAP11 arbitration.
 if not main.world.can_move(pos,radius): return _no("MAP11_site_geometry_rejected")
 if not is_instance_valid(main.native_natural_enemies):
  var bound: Dictionary=main.bind_native_natural_enemy_base(read_projectile_context,false)
  if not bound.get("ready",false): return bound
 _busy=true
 var runtime: Dictionary=_build_runtime(etype,pos,source,player,int(hole.room))
 _used[token]=true
 var made: Dictionary=main.native_natural_enemies.admit_source_record(self,group,runtime,site,source)
 if not made.get("ready",false): _busy=false;made["source_prefix_consumed"]=true;return made
 var origin: Dictionary=made.origin
 _busy=false
 if not origin.get("ready",false): return {"ready":false,"reason":"origin_rejected_after_registration","registered":true,"actor":made.actor,"source_prefix_consumed":true}
 return {"ready":true,"registered":true,"actor":made.actor,"site":site,"source_prefix_consumed":true,
  "full_combat_ready":false,"remaining":["source blizzard/eProjAt/charged projectile; protected swoop/slam contacts"],"scheduler":"source_selected_handoff_only"}
func _build_runtime(etype: int,pos: Vector2, source: Dictionary, player: Dictionary,room: int) -> Dictionary:
 var r: Dictionary=_template.duplicate(true)
 var lv: int=maxi(1,int(player.lv))
 var curve: float=(0.4*lv*lv*lv+199.0*lv+100.0) if lv<=500 else 50000000.0*pow(1.0014,lv-500)
 var health: int=int(floor(curve*2.925/(1.0+minf(9,maxf(0,lv-1))/18.0)))
 var atk: int=int(floor((50.0+lv*1.95)*0.6))
 var idx: int=TYPES.find(etype)
 var speed: float=(maxf(0.2,SPEED[idx]*1.3)+float(source.speed_u)*0.08)*1.5
 var radius: float=(RADII[idx]+float(source.radius_u)*2)*2
 var skin: int=((etype*7+FORMULA.js_to_int32(pos.x*31))&0x7fffffff)%40
 var a: Dictionary=r.animation
 a.skin=RECIPE.SKINS[skin];a.column=skin%8;a.row=int(skin/8)
 a.base_rect=[skin%8*256,int(skin/8)*256,256,256]
 a.walk_frame_rects=[]
 for f in range(4): a.walk_frame_rects.append([(skin%8*4+f)*256,int(skin/8)*256,256,256])
 var literal: Dictionary=source.literal
 r.merge({"id":"demo11_F_%d_%d"%[etype,source.spawn_n],"ai_profile":"demo11_group_f_v1","order":-1,
  "etype":etype,"element":"","element_id":-1,"spawn_position":[pos.x,pos.y],"room":room,"level":lv,
  "hp":health,"attack":atk,"radius":radius,"speed_pixels_per_tick":speed,"elite":0,"mods":[],"aura":null,
  "poise":health,"max_poise":health,"eShield":health,"eShieldMax":health,"eRes":[0,0,0,0,0,0,0],
  "initial_idle_ticks":literal.st2,"facing":literal.facing,"initial_projectile_ticks":literal.projT,
  "projectile_cooldown_ticks":240,"projectile_range":RANGES[idx]},true)
 var n: Dictionary=r.native_final
 n.merge({"etype":etype,"el":null,"ib":false,"x":pos.x,"y":pos.y,"r":radius,"hp":health,"mhp":health,
  "atk":atk,"baseAtk":atk,"speed":speed,"baseSpd":speed,"eShield":health,"eShieldMax":health,"poise":health,"maxPoise":health,
  "st2":literal.st2,"facing":literal.facing,"alive":true,"s":"idle","stunned":0,"kb":{"x":0,"y":0},
  "_homeX":pos.x,"_homeY":pos.y,"_mob8Col":skin%8,"_mob8Row":int(skin/8),"_iceSwoopOx":0.0,"_iceSwoopOy":0.0,
  "reviveIframes":15.0,"projT":literal.projT,"projCd":r.projectile_cooldown_ticks},true)
 for key in literal: n[key]=literal[key]
 return r
func _no(reason: String) -> Dictionary: return {"ready":false,"registered":false,"reason":reason}
func _number(v: Variant) -> bool: return (v is int or v is float) and is_finite(float(v))

func read_projectile_context() -> Dictionary:
 return {"lesson_active":false,"qa_storage_active":false,"aggro_active":false}
