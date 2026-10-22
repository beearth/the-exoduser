extends SceneTree
const Regions=preload("res://scripts/native_regions.gd")
const Field=preload("res://scripts/maps/map11/web_field.gd")
const Menu=preload("res://scripts/native_save_slot_menu.gd")
const Entry=preload("res://scripts/native_demo_lobby_entry.gd")
var failures: Array[String]=[]
func check(ok: bool,label: String) -> void:
 print("PASS " if ok else "FAIL ",label)
 if not ok:failures.append(label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-map04-"):quit(2);return
 var g: Dictionary={"stage":0,"spawnHoles":[{"x":4020,"y":1020,"size":.3},{"x":5620,"y":5220,"size":.5}],"on":true,"_fbDone":false}
 check(Regions.init_regions(g,Vector2(4020,7420),200,200,true).ready,"source region init")
 var before: int=g._regCurIdx
 Regions.tick_regions(g,Vector2(4020,900),15)
 check(g._regCurIdx==before,"north gate central deadzone keeps previous region")
 Regions.tick_regions(g,Vector2(4100,3250),30)
 check(g._regCurIdx==1,"outside deadzone changes quadrant")
 Regions.tick_regions(g,Vector2(4020,220),45)
 check(g._regCurIdx==1,"gate retains arrival region rather than fixed denominator")
 var field:=Field.new();check(field.compile(null),"load original map geometry")
 var clear:=true
 for y in range(7120,7421):
  if not field.can_move(Vector2(4020,y),12):clear=false
 check(clear,"1.8s north route collision clear")
 var menu:=Menu.new();check(menu.open(),"isolated store open")
 check(menu.request_new(0,"이전전사"),"new metadata")
 var meta: Dictionary=menu.rows[0].data.duplicate(true)
 check(menu._write("hellsave_demo_active","0"),"active session marker")
 var saved: Dictionary={"player":{"hp":123,"lv":7},"game":{"stage":0}}
 check(menu._write("hellsave_demo",JSON.stringify(saved)),"interrupted actual save bytes")
 var reopened:=Menu.new();check(reopened.open(),"restart sync runs before listing")
 check(reopened.rows[0].kind=="saved" and reopened.rows[0].data.player.hp==123 and reopened.rows[0].data.name==meta.name,"progress and metadata preserved")
 check(not reopened.storage.get_item("hellsave_demo").found and not reopened.storage.get_item("hellsave_demo_active").found,"successful sync clears active exchange keys")
 check(reopened.request_new(1,"새전사"),"create next character after interrupted run")
 var entry:=Entry.new();check(entry.prepare(reopened,1).ready,"new entry no longer blocked by previous save")
 entry.rollback()
 var actor:=preload("res://scripts/boss11_scene_actor.gd").new();root.add_child(actor);actor.configure(null)
 check(actor._light1.material.blend_mode==CanvasItemMaterial.BLEND_MODE_MIX,"boss source-over matches GPU proxy")
 for i in 3:await process_frame
 actor.queue_free()
 print("PARITY_MAP04_RESULT ",JSON.stringify({"failures":failures,"namespace":OS.get_user_data_dir()}))
 quit(0 if failures.is_empty() else 1)
