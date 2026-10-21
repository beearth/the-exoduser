extends SceneTree
var checks:=0
var failures:=0
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;printerr("FAIL "+label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-30b-Isolated":quit(2);return
 var look=preload("res://scripts/maps/map11/target30_look.gd")
 check(is_equal_approx(look.SOURCE_SCALE*.36,.96),"source pixel maps to .96 display pixel")
 check(is_equal_approx(look.PROJECTION_Y,.6),"logical ground projection .6")
 var view=preload("res://scripts/maps/map11/product_arena_view.gd").new()
 root.add_child(view)
 var feet:=StaticBody2D.new();feet.name="FinaleExteriorFootCircles";view.add_child(feet)
 view.retire_legacy_finale()
 check(feet.get_child_count()==7,"seven scene foot circles replace old hidden props")
 var floor_: Sprite2D=view.get_node("Target30Floor0")
 check((floor_.scale*2.0).is_equal_approx(Vector2.ONE*look.SOURCE_SCALE),"2x texel density preserves source world scale")
 check(floor_.position.is_equal_approx(look.SCREEN_CENTER-Vector2.ONE*2048*look.SOURCE_SCALE),"tile origin matches unchanged full plane")
 for i in range(7):
  var row: Dictionary=look.SPLIT.data.regions[i]
  var body: CollisionShape2D=feet.get_child(i)
  check(body.position.length()-body.shape.radius>1700,"outside R1700 "+row.id)
  var sprite: Sprite2D=view.get_node("Target30_"+row.id)
  check((sprite.scale*2.0).is_equal_approx(Vector2.ONE*look.SOURCE_SCALE),"source aspect preserved "+row.id)
  check(sprite.position.is_equal_approx(Vector2(row.foot[0],row.foot[1])),"screen-authored foot "+row.id)
  check(sprite.material.get_shader_parameter("source_box")!=null,"local effect coordinates "+row.id)
 check(float(look.SPLIT.data.radius)==1700.0,"source recipe combat radius retained")
 print("MAP11-30b RESULT checks=%d failures=%d"%[checks,failures])
 view.queue_free();await process_frame;quit(0 if failures==0 else 1)
