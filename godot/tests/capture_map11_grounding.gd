extends SceneTree
## MAP11-20 grounding correction: real Main, no save-folder or combat writers.
const USERDIR="EXODUSER-map11-20-Grounding-Isolated-20261021"
const MASKS=preload("res://scripts/maps/map11/ground_contact_masks.gd")
const DATA=preload("res://scripts/maps/map11/ground_contact_data.gd")
var main: Node
var output: String
var checks: int=0
var failures: int=0
var crops: Dictionary={}
var metrics: Dictionary={"standing":0,"max_foot_error":0.0,"contacts":0,"projections":0}
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("GROUNDING_FAIL ",label)
func settle(point: Vector2) -> void:
 main.player.global_position=point;main.player.reset_physics_interpolation()
 main.camera.global_position=point;main.camera.reset_smoothing();main.camera.reset_physics_interpolation()
 for i in range(35):await physics_frame
func capture(id: String,feet: Dictionary) -> void:
 for i in range(8):await process_frame
 await RenderingServer.frame_post_draw
 var image: Image=root.get_texture().get_image()
 check(image.get_size()==Vector2i(1600,900),id+" resolution")
 check(image.save_png(output.path_join(id+".png"))==OK,id+" saved")
 for label in feet:
  var node: Node2D=feet[label]
  var foot: Vector2=node.get_global_transform_with_canvas().origin
  var box:=Rect2i(Vector2i(foot)-Vector2i(220,150),Vector2i(440,230)).intersection(Rect2i(0,0,1600,900))
  check(image.get_region(box).save_png(output.path_join(label+"_foot_1x.png"))==OK,label+" foot crop")
  crops[label]={"source_view":id,"box":[box.position.x,box.position.y,box.size.x,box.size.y],"foot_screen":str(foot)}
func verify_foot(sprite: Sprite2D,item: Node2D) -> void:
 check(sprite.has_meta("opaque_ground_key"),str(item.name)+" opaque hull")
 if not sprite.has_meta("opaque_ground_key"):return
 var key: String=sprite.get_meta("opaque_ground_key")
 var width: float=sprite.region_rect.size.x if sprite.region_enabled else sprite.texture.get_width()
 var bounds:=Rect2()
 var hull: Array=DATA.SHAPES[key]
 for i in range(hull.size()):
  var p: Vector2=hull[i]
  if sprite.flip_h:p.x=width-p.x
  p=sprite.transform.basis_xform(p+sprite.offset)
  bounds=Rect2(p,Vector2.ZERO) if i==0 else bounds.expand(p)
 var error: float=absf(bounds.end.y)
 metrics.max_foot_error=maxf(metrics.max_foot_error,error)
 check(error<.01 and absf(bounds.get_center().x)<.01,str(item.name)+" actual opaque bbox foot gap0")
 check(not item.z_as_relative and item.z_index==clampi(int(item.global_position.y/4.0),-4096,4095),str(item.name)+" opaque foot y depth")
 metrics.standing+=1
func _run() -> void:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--captures="):output=arg.trim_prefix("--captures=")
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated user dir")
 check(not output.is_empty(),"output specified")
 if failures:quit(2);return
 root.size=Vector2i(1600,900);root.content_scale_size=Vector2i(1600,900)
 DisplayServer.window_set_size(Vector2i(1600,900));DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 root.grab_focus()
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 check(main.source_intro_sequence.finish_native_guide().get("applied",false),"real intro finished")
 main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all()
 main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 var detail: Node=scene.get_node("MAP11Detail")
 var snapshots: Array=[]
 for row in scene.field_view._rows:
  var item: Node2D=row.node
  var sprite: Sprite2D=item.get_child(0)
  verify_foot(sprite,item)
  snapshots.append({"node":item,"position":item.global_position,"sprite":sprite,"transform":sprite.transform})
 for leaf in scene.field_view.gate_leaves:verify_foot(leaf,leaf)
 for row in scene.arena_view._rim_sprites:verify_foot(row.sprite,row.sprite)
 for id in ["EntryArch_VisualOnly","ClearArch_VisualOnly"]:
  var sprite: Sprite2D=scene.arena_view.get_node(id)
  verify_foot(sprite,sprite)
 for prop in detail.hell_props:verify_foot(prop.get_child(0),prop)
 for child in scene.field_view.get_children():
  if child is Sprite2D and int(child.get_meta("ground_kind",-1))>=2:
   var size_: Vector2=child.texture.get_size()*child.scale
   check(size_.y/size_.x<=.72*.48+.0001,"small gore and bone flattened onto floor")
 for child in scene.field_view._surface.get_children():
  check(not(child is Sprite2D and child.texture==scene.field_view._contact and child.z_index==0),"floor apron has no detached AO")
 for view in [scene.field_view,scene.arena_view]:
  for child in view.get_children():
   if child is Sprite2D and child.get_meta("ground_contact_kind","")=="ao":
    var expected: Vector2=child.get_meta("contact_foot")
    check(child.position.is_equal_approx(expected),"AO starts at foot, no vertical offset")
    var source: Sprite2D=child.get_meta("contact_source")
    var key: String=source.get_meta("opaque_ground_key")
    var spec: Dictionary=MASKS.MASKS[key]
    var ratio: Vector2=(spec.size as Vector2)/child.texture.get_size()
    var max_error: float=0.0
    for point in DATA.SHAPES[key]:
     var p: Vector2=point
     var q: Vector2=(p-(spec.offset as Vector2))/ratio
     if source.flip_h:p.x=source.texture.get_width()-p.x
     if child.flip_h:q.x=child.texture.get_width()-q.x
     var a: Vector2=source.global_transform*(source.offset+p)
     var b: Vector2=child.global_transform*(child.offset+q)
     max_error=maxf(max_error,a.distance_to(b))
    check(max_error<.01,"contact alpha follows same opaque foot transform")
    metrics.contacts+=1
   if child is Sprite2D and child.get_meta("ground_contact_kind","")=="projection":
    check(child.position.is_equal_approx(child.get_meta("contact_foot")),"projection starts at foot")
    metrics.projections+=1
 await settle(Vector2(-850,-2400))
 await capture("01_field",{"altar":scene.field_view.get_node("D01LowHeartAltar"),"corpse_tree":scene.field_view.get_node("D01SplitCorpseTree"),"skull":detail.hell_props[0]})
 await settle(Vector2(-3150,-1050))
 await capture("02_outer_forest",{"impaled":detail.hell_props[3]})
 await settle(Vector2(0,-3500))
 await capture("03_boss_entrance",{"spike_pit":detail.hell_props[7],"gate":scene.field_view.get_node("GateBoneFrame")})
 for row in snapshots:
  check(row.node.global_position==row.position and row.sprite.transform==row.transform,"feet fixed over time; no whole-prop bob")
 check(metrics.projections==0,"no detached silhouette projections")
 check(not detail.is_processing() and not detail.is_physics_processing(),"detail setup-only")
 var gate: Dictionary=main.read_native_map11_provider().transition_sites()
 main.player.global_position=gate.field_gate.global_position
 for i in range(40):await physics_frame
 check(scene.active_space=="arena","real gate enters arena")
 await settle(scene.arena_view.global_position+Vector2(0,-1700))
 await capture("04_arena_altar",{"arena_altar":scene.arena_view.get_node("NorthHeartAltar")})
 var data: Dictionary={"checks":checks,"failures":failures,"metrics":metrics,"crops":crops,"user_dir":OS.get_user_data_dir(),"viewport":[1600,900],"performance":"NOT_REMEASURED: prior single-run field10.598ms FAIL / arena7.168ms; modified candidate performance unmeasured","scope":"opaque foot/AO/decal/no bob/real gate, not dense combat or whole-map visual approval"}
 var f:=FileAccess.open(output.path_join("../../grounding-verification.json").simplify_path(),FileAccess.WRITE);f.store_string(JSON.stringify(data,"  "));f.close()
 print("GROUNDING_RESULT ",JSON.stringify(data))
 main.queue_free()
 for i in range(16):await process_frame
 quit(1 if failures else 0)
