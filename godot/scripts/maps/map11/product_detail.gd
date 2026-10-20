extends Node2D
## Setup-only decoration/material adapter. No authority, polling or actor writers.
const PATHS=["res://assets/map/props/prop_g_root.png","res://assets/gore/blood_splat_1.png","res://assets/map/ch1/floor_objects/bones.png","res://assets/gore/flesh_chunk_3.png","res://assets/gore/bone_2.png"]
var material_: ShaderMaterial
var root_material: ShaderMaterial
var decorated: int=0
var outlined: int=0
var _world: Node
func configure(scene: Node2D,main: Node) -> void:
 material_=ShaderMaterial.new();material_.shader=preload("res://scripts/maps/map11/actor_rim.gdshader")
 root_material=ShaderMaterial.new();root_material.shader=preload("res://scripts/maps/map11/ground_story.gdshader")
 _attach(main.player,false)
 _world=main.world
 for enemy in _world.get_enemies():_attach(enemy,true)
 _world.child_entered_tree.connect(_actor_entered)
 # Authored islands beside travel/combat voids, never uniform field scatter.
 var clusters=[Vector2(-1450,-2150),Vector2(850,-2750),Vector2(-2650,-850),Vector2(-3450,-1450),Vector2(1250,2100),Vector2(-1500,1850),Vector2(2250,100),Vector2(-850,-3520),Vector2(820,-3820)]
 var rng:=RandomNumberGenerator.new();rng.seed=11182026
 var textures: Array[Texture2D]=[]
 for path in PATHS:
  var source: Texture2D=load(path)
  var atlas:=AtlasTexture.new();atlas.atlas=source;atlas.region=source.get_image().get_used_rect()
  textures.append(atlas)
 for index in range(clusters.size()):
  var center: Vector2=clusters[index]
  for part in range(12):
   var kind: int=0 if part==0 else (1 if part<4 else 2+(part%3))
   var at: Vector2=center+Vector2(rng.randf_range(-260,260),rng.randf_range(-170,170))
   # North approach center corridor / gate trigger remains visually clear.
   if at.y< -3250 and absf(at.x)<540:continue
   var width: float=rng.randf_range(380,650) if kind==0 else (rng.randf_range(150,340) if kind==1 else rng.randf_range(24,85))
   _stamp(scene.field_view, textures[kind],at,width,rng,kind)
 # Root feet are grounded with a low stain + small bones, behind the tree bodies.
 for i in range(0,scene.field_view._forest_rows.size(),4):
  var row: Dictionary=scene.field_view._forest_rows[i]
  if row.layer!="FRONT":continue
  _stamp(scene.field_view,textures[1],row.foot+Vector2(0,22),rng.randf_range(230,390),rng,1)
  _stamp(scene.field_view,textures[0],row.foot+Vector2(30,0),rng.randf_range(280,460),rng,0)
 # No new arena decals: complete R1700 combat void stays empty.
 set_process(false);set_physics_process(false)
func _actor_entered(actor: Node) -> void:
 # Deferred once so a newly spawned actor has finished building its sprite.
 _attach.call_deferred(actor,true)
func _attach(actor: Node,enemy: bool) -> void:
 if not is_instance_valid(actor):return
 var sprite: CanvasItem=actor.get("_body") if enemy else actor.get("_sprite")
 if not is_instance_valid(sprite):return
 if sprite.material==material_:return
 sprite.material=material_
 sprite.set_instance_shader_parameter("rim_color",Color(.62,.20,.16,.30) if enemy else Color(.78,.72,.59,.38))
 outlined+=1
func _stamp(parent: Node2D,texture_: Texture2D,at: Vector2,width: float,rng: RandomNumberGenerator,kind: int) -> void:
 var sprite:=Sprite2D.new();sprite.name="GroundStory%03d"%decorated;sprite.texture=texture_
 sprite.position=at;sprite.rotation=rng.randf_range(-PI,PI);sprite.flip_h=rng.randf()>.5
 sprite.scale=Vector2(width, width*rng.randf_range(.42,.72))/texture_.get_size()
 var tone: float=rng.randf_range(.48,.78)
 sprite.modulate=Color(tone,tone*.88,tone*.82,.48 if kind==0 else (.27 if kind==1 else .65))
 if kind==0:sprite.material=root_material
 sprite.z_index=-2985;parent.add_child(sprite);decorated+=1
