extends Node2D
## Setup-only decoration/material adapter. No authority, polling or actor writers.
const GroundContact=preload("res://scripts/maps/map11/ground_contact.gd")
const PATHS=["res://assets/map/props/prop_g_root.png","res://assets/gore/blood_splat_1.png","res://assets/map/ch1/floor_objects/bones.png","res://assets/gore/flesh_chunk_3.png","res://assets/gore/bone_2.png"]
var material_: ShaderMaterial
var root_material: ShaderMaterial
var blood_material: ShaderMaterial
var decorated: int=0
var outlined: int=0
var _world: Node
func configure(scene: Node2D,main: Node) -> void:
 material_=ShaderMaterial.new();material_.shader=preload("res://scripts/maps/map11/actor_rim.gdshader")
 root_material=ShaderMaterial.new();root_material.shader=preload("res://scripts/maps/map11/ground_story.gdshader")
 blood_material=ShaderMaterial.new();blood_material.shader=preload("res://scripts/maps/map11/ground_blood.gdshader")
 _attach(main.player,false)
 _world=main.world
 for enemy in _world.get_enemies():_attach(enemy,true)
 _world.child_entered_tree.connect(_actor_entered)
 # Authored islands beside travel/combat voids, never uniform field scatter.
 var patches=[
  [0,Vector2(-1420,-2600),350.0,-.28,1.05],
  [1,Vector2(-1250,-2450),320.0,.42,1.0],
  [2,Vector2(-2730,-900),375.0,-.45,.90],
  [0,Vector2(-3410,-1400),335.0,.68,.84],
  [1,Vector2(1300,2100),310.0,-.62,.80],
  [2,Vector2(-1450,1780),360.0,.25,.90],
  [0,Vector2(2160,150),345.0,-.80,.88],
  [1,Vector2(-920,-3600),325.0,.18,.78],
  [2,Vector2(780,-3840),370.0,-.38,.88],
  [0,Vector2(-370,-2640),330.0,.55,.86],
  [2,Vector2(330,-4010),315.0,.15,.85],
  [1,Vector2(1880,-1720),340.0,-.20,.80]]
 var large_textures=[preload("res://assets/map/map11/patches/patch_bloodpool_roots.png"),preload("res://assets/map/map11/patches/patch_bone_pile.png"),preload("res://assets/map/map11/patches/patch_cracked_flesh_slab.png")]
 var clusters: Array[Vector2]=[]
 for i in range(patches.size()):
  var row: Array=patches[i]
  var sprite:=Sprite2D.new();sprite.name="FloorPatch%02d"%i
  sprite.texture=large_textures[row[0]];sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  sprite.position=row[1];sprite.rotation=row[3];sprite.flip_h=i%2==1
  sprite.scale=Vector2.ONE*row[2]/sprite.texture.get_width()
  sprite.modulate=Color(row[4],row[4]*.98,row[4]*.96,.96)
  sprite.z_index=-2986;scene.field_view.add_child(sprite)
  clusters.append(row[1])
 var rng:=RandomNumberGenerator.new();rng.seed=11182026
 var textures: Array[Texture2D]=[]
 for path in PATHS:
  var source: Texture2D=load(path)
  var atlas:=AtlasTexture.new();atlas.atlas=source;atlas.region=source.get_image().get_used_rect()
  textures.append(atlas)
 for index in range(clusters.size()):
  var center: Vector2=clusters[index]
  for part in range(6):
   var kind: int=0 if part==0 else (1 if part<4 else 2+(part%3))
   var at: Vector2=center+Vector2(rng.randf_range(-210,210),rng.randf_range(-150,150))
   # North approach center corridor / gate trigger remains visually clear.
   if at.y< -3250 and absf(at.x)<540:continue
   var width: float=rng.randf_range(380,650) if kind==0 else (rng.randf_range(150,340) if kind==1 else rng.randf_range(24,85))
   _stamp(scene.field_view, textures[kind],at,width,rng,kind)
 _hell_props(scene)
 # Arena R1700 remains untouched; all new stamps belong to field.
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
 if kind>=2:sprite.scale.y*=.48
 sprite.set_meta("ground_kind",kind)
 var tone: float=rng.randf_range(.48,.78)
 sprite.modulate=Color(tone,tone*.88,tone*.82,.48 if kind==0 else (.27 if kind==1 else .65))
 if kind==0:sprite.material=root_material
 if kind==1:sprite.material=blood_material
 sprite.z_index=-2985;parent.add_child(sprite);decorated+=1


# Static feet use the same y/4 depth contract as Main/player and enemies.
# No polling, actor writers, physics/LOS changes or texture loads after setup.
var hell_props: Array[Node2D]=[]
const HELL_TEXTURES=[preload("res://assets/map/map11/props/hell_skull_pyramid.png"),preload("res://assets/map/map11/props/hell_impaled_corpse.png"),preload("res://assets/map/map11/props/hell_spike_pit.png")]
const HELL_ROWS=[
 [0,Vector2(-680,-2570),185.0,false],
 [0,Vector2(-3010,-1030),166.0,true],
 [0,Vector2(1570,-1750),175.0,false],
 [1,Vector2(-3540,-1250),182.0,false],
 [1,Vector2(-3350,-1390),158.0,true],
 [1,Vector2(2420,80),172.0,true],
 [1,Vector2(2520,-60),164.0,false],
 [2,Vector2(-480,-3770),184.0,true]]
func _hell_props(scene: Node2D) -> void:
 for i in range(HELL_ROWS.size()):
  var row: Array=HELL_ROWS[i]
  var foot: Vector2=row[1]
  var texture_: Texture2D=HELL_TEXTURES[row[0]]
  var height_: float=row[2]
  var size_: Vector2=texture_.get_size()
  var prop:=Node2D.new();prop.name="HellProp%02d"%i;prop.position=foot
  # Absolute depth avoids inherited field/background layer offsets.
  GroundContact.depth(prop,foot)
  scene.field_view.add_child(prop)
  var sprite:=Sprite2D.new();sprite.name="Silhouette";sprite.texture=texture_
  sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  sprite.centered=false;sprite.offset=Vector2(-size_.x*.5,-size_.y*.94)
  sprite.scale=Vector2.ONE*height_/size_.y;sprite.flip_h=row[3]
  prop.add_child(sprite)
  GroundContact.align(sprite)
  # Ground-plane AO cannot paint over another actor when it crosses the foot.
  GroundContact.shadow(scene.field_view,sprite,foot,-2987,.85,scene.lighting_look._unlit)
  hell_props.append(prop)
