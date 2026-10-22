extends RefCounted
## Snapshot58720-58737: four .8 outline draws, bright atlas, original body.
## Fixed startup sprites/materials share the actual player's immutable SpriteFrames.
const OFFSETS=[Vector2(1,0),Vector2(-1,0),Vector2(0,1),Vector2(0,-1),Vector2.ZERO]
var layers: Array[AnimatedSprite2D]=[]
var _prepared: Array[SpriteFrames]=[]
var _options: Dictionary={}
var _options_bound:=false
func configure(player: Node2D,body: AnimatedSprite2D) -> void:
 prepare(body.sprite_frames)
 for i in 5:
  var sprite:=AnimatedSprite2D.new();sprite.name="SourceOutline%d"%i if i<4 else "SourceBright"
  sprite.centered=body.centered;sprite.sprite_frames=_prepared[0 if i<4 else 1];sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
  sprite.hide();player.add_child(sprite);layers.append(sprite)
func prepare(source: SpriteFrames) -> void:
 _prepared.clear()
 var inks: Dictionary=preload("res://scripts/native_player_ink_textures.gd").INKS
 for kind in 2:
  var frames:=SpriteFrames.new();frames.remove_animation("default")
  for animation in source.get_animation_names():
   frames.add_animation(animation);frames.set_animation_loop(animation,source.get_animation_loop(animation));frames.set_animation_speed(animation,source.get_animation_speed(animation))
   for i in source.get_frame_count(animation):
    var texture: Texture2D=source.get_frame_texture(animation,i)
    var ink: Texture2D=null
    if texture is AtlasTexture and inks.has(texture.atlas.resource_path):
     var atlas:=AtlasTexture.new();atlas.atlas=inks[texture.atlas.resource_path][kind]
     atlas.region=texture.region;atlas.margin=texture.margin;atlas.filter_clip=texture.filter_clip;ink=atlas
    frames.add_frame(animation,ink,source.get_frame_duration(animation,i))
  _prepared.append(frames)
func sync(player: Node2D,body: AnimatedSprite2D) -> void:
 if not _options_bound:
  var services: Variant=player.get_parent().get("source_initialization_services")
  if services is Object and is_instance_valid(services):
   var options: Variant=services.read_current_options()
   if options is Dictionary:_options=options;_options_bound=true
 for i in 5:
  var copy: AnimatedSprite2D=layers[i]
  copy.visible=body.visible and player.hp>0 and (i==4 or _options.get("outline",true))
  if not copy.visible:continue
  var frames: SpriteFrames=_prepared[0 if i<4 else 1]
  if copy.sprite_frames!=frames:copy.sprite_frames=frames
  copy.animation=body.animation;copy.frame=body.frame;copy.centered=body.centered
  copy.offset=body.offset+OFFSETS[i];copy.transform=body.transform;copy.flip_h=body.flip_h;copy.flip_v=body.flip_v
  copy.modulate=body.modulate
  if i<4:copy.modulate.a*=.8
