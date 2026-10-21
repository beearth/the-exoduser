extends Node2D
## Read-only scene integration of the published boss state. No combat owner writes.
var actor: Node
var body: Sprite2D
var contact: Sprite2D
func configure(reader: Node,shared: ShaderMaterial) -> void:
 actor=reader
 body=Sprite2D.new();body.name="BossSceneBody"
 body.texture=preload("res://assets/maps/map11/boss_dark_druid_8dir_v3.png")
 body.region_enabled=true;body.region_rect=Rect2(0,0,414,620)
 body.scale=Vector2.ONE*(44.0*14.1/620.0)
 body.centered=false;body.offset=Vector2(-207,-620*.86)
 body.material=shared;body.set_instance_shader_parameter("rim_color",Color(.62,.20,.22,.36))
 contact=Sprite2D.new();contact.texture=preload("res://assets/maps/map11/target30/actor_contact.png")
 contact.scale=Vector2(1.65,.48);contact.position=Vector2(0,70)
 var unlit:=CanvasItemMaterial.new();unlit.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
 contact.material=unlit;add_child(contact);add_child(body);hide()
func _process(_delta: float) -> void:
 if not is_instance_valid(actor):hide();return
 var e: Dictionary=actor.get("_enemy")
 if e.is_empty() or not e.get("alive",false):hide();return
 show();global_position=Vector2(e.get("x",0),e.get("y",0))
 z_as_relative=false;z_index=clampi(int(global_position.y/4.0),-4096,4095)
 body.scale=Vector2.ONE*float(e.get("r",44))*14.1/620.0
 # This layer is an idle directional view, not a substitute for source attack animation.
 var direction:=posmod(roundi(float(e.get("facing",0))/TAU*8.0)+6,8)
 body.region_rect.position=Vector2(direction%4*414,direction/4*620)
