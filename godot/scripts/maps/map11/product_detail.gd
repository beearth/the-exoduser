extends Node2D
## Setup-only decoration/material adapter. No authority, polling or actor writers.
const GroundContact=preload("res://scripts/maps/map11/ground_contact.gd")
var material_: ShaderMaterial
var decorated: int=0
var outlined: int=0
var _world: Node
func configure(scene: Node2D,main: Node) -> void:
 material_=ShaderMaterial.new();material_.shader=preload("res://scripts/maps/map11/actor_rim.gdshader")
 _attach(main.player,false)
 _world=main.world
 for enemy in _world.get_enemies():_attach(enemy,true)
 _world.child_entered_tree.connect(_actor_entered)
 # MAP11-21: removed flat bone/blood/flesh patches and broad floor scatter.
 _hell_props(scene)
 preload("res://scripts/maps/map11/arena_finale.gd").mount(scene)
 # New arena feet stay wholly beyond R1700.
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
# Static feet use the same y/4 depth contract as Main/player and enemies.
# No polling, actor writers, physics/LOS changes or texture loads after setup.
var hell_props: Array[Node2D]=[]
const Tour=preload("res://scripts/maps/map11/tour_layout.gd")
const TEXTURES=preload("res://scripts/maps/map11/tour_textures.gd")
func _hell_props(scene: Node2D) -> void:
 for i in range(Tour.ROWS.size()):
  var row: Array=Tour.ROWS[i]
  var foot: Vector2=row[2]
  var pair: Array=TEXTURES.ASSETS[row[0]][row[1]]
  var canvas:=CanvasTexture.new()
  canvas.diffuse_texture=pair[0];canvas.normal_texture=pair[1]
  canvas.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  canvas.specular_color=Color(.10,.08,.06);canvas.specular_shininess=.12
  var prop:=Node2D.new();prop.name="TourProp%02d"%i;prop.position=foot
  GroundContact.depth(prop,foot);scene.field_view.add_child(prop)
  var sprite:=Sprite2D.new();sprite.name="Silhouette";sprite.texture=canvas
  sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  sprite.scale=Vector2.ONE*row[3]/canvas.get_height()
  prop.add_child(sprite)
  GroundContact.align(sprite,pair[0].resource_path)
  GroundContact.shadow(scene.field_view,sprite,foot,-2987,.58,scene.lighting_look._unlit)
  hell_props.append(prop)
 for site in Tour.SCENES:
  scene.lighting_look._pool("Tour_"+site.id,site.light,"field",site.radius,site.color,site.energy,.025)
  if site.source=="횃불" or site.source=="관문 횃불":_torch(scene,site.light)

func _torch(scene: Node2D,light_point: Vector2) -> void:
 # Reuse authored torch art; native AnimatedSprite2D owns its eight frames.
 var foot: Vector2=light_point+Vector2(0,90)
 var fixture:=Node2D.new();fixture.name="TourTorch";fixture.position=foot
 GroundContact.depth(fixture,foot);scene.field_view.add_child(fixture)
 var texture_: Texture2D=preload("res://assets/map/ch1/diablo_field_torch_base_v1.png")
 var atlas:=AtlasTexture.new();atlas.atlas=texture_;atlas.region=texture_.get_image().get_used_rect()
 var body:=Sprite2D.new();body.texture=atlas;body.centered=false
 body.scale=Vector2.ONE*125.0/atlas.get_height()
 body.offset=Vector2(-atlas.get_width()*.5,-atlas.get_height());fixture.add_child(body)
 var frames:=SpriteFrames.new();frames.set_animation_speed("default",9.0)
 var flames: Texture2D=preload("res://assets/map/ch1/diablo_field_torch_flame_v1.png")
 for i in range(8):
  var frame:=AtlasTexture.new();frame.atlas=flames;frame.region=Rect2(Vector2(i%4,i/4)*Vector2(418,472),Vector2(418,472));frames.add_frame("default",frame)
 var fire:=AnimatedSprite2D.new();fire.sprite_frames=frames;fire.position=Vector2(18,-87);fire.scale=Vector2.ONE*.12
 fire.material=scene.lighting_look._unlit;fixture.add_child(fire);fire.play("default")
