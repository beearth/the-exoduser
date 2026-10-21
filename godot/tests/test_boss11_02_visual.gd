extends SceneTree
const Reader=preload("res://scripts/boss11_visual_reader.gd")
const Camera=preload("res://scripts/boss11_camera.gd")
var failures:=0
var checks:=0
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("FAIL ",label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-BOSS11-02-Isolated":quit(2);return
 var reader:=Reader.new();root.add_child(reader);reader.set_process(false)
 var enemy: Dictionary={"s":"bossSlamWind","st2":40,"x":100,"y":200,"r":44,"_bossPhase":4,"facing":0}
 var original: Dictionary=enemy.duplicate(true)
 for remaining in [40,20,2]:
  enemy.st2=remaining
  reader.render_source(enemy,{},15)
  var mark: Polygon2D=reader.marks.marks[0]
  check(is_equal_approx(mark.scale.x*0.98,1320),"source slam phase4 radius")
  check(is_equal_approx(mark.get_instance_shader_parameter("progress"),1.0-(remaining+8.0)/48.0),"source countdown progress")
 enemy.st2=40
 check(enemy==original,"enemy unchanged by rendering")
 var g: Dictionary={"_tideWaves":[{"x":0,"y":0,"r":1000,"w":60,"gapAng":0.7,"gapSize":0.8}],"_lavaPools":[{"x":3,"y":4,"r":150,"warnT":55,"t":27.5}]}
 var saved: Dictionary=g.duplicate(true)
 reader.render_source({},g,15)
 check(reader.marks.used==2,"source wave and pool independently rendered")
 var pool: Polygon2D=reader.marks.marks[0]
 var wave: Polygon2D=reader.marks.marks[1]
 check(pool.material==wave.material,"one material shared across simultaneous phases")
 check(pool.get_instance_shader_parameter("progress")==0.5,"pool source warnT")
 check(is_equal_approx(wave.scale.x*.98,1060),"wave collision outer r+w")
 check(is_equal_approx(wave.color.b,.8),"source gap HALF angle retained")
 check(g==saved,"queues unchanged by rendering")
 var player:=Node2D.new();root.add_child(player);player.position=Vector2(1000,500)
 var view:=Camera2D.new();root.add_child(view);view.zoom=Vector2.ONE*.7;view.offset=Vector2(7,9)
 var camera:=Camera.new();root.add_child(camera);camera.set_physics_process(false);camera.configure(view,player,Vector2.ZERO)
 camera.set_arena(true);camera._physics_process(.5)
 check(is_equal_approx(view.zoom.x,(.7+Camera.ARENA_ZOOM)/2),"one second smoothstep midpoint")
 camera._physics_process(.5)
 check(is_equal_approx(view.zoom.x,Camera.ARENA_ZOOM),"entry zoom reached")
 check(view.offset==Vector2(7,9),"single shake offset owner preserved")
 camera.set_arena(false);camera._physics_process(1.0)
 check(view.zoom.is_equal_approx(Vector2.ONE*.7),"exit and clear restore original zoom")
 check(view.global_position.is_equal_approx(player.global_position),"exit restores player follow")
 print(JSON.stringify({"checks":checks,"failures":failures,"combat_mutation":false}))
 reader.free();camera.free();view.free();player.free()
 quit(0 if failures==0 else 1)
