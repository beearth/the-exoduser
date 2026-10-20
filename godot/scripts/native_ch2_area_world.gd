extends "res://scripts/native_ch1_area_world.gd"
## CH2-02 reuses CH1-04 tile bodies, float64 source queries and swept fixture/BFS.
## Only readonly resources and this independent view differ. Product World is untouched.
const CH2Resources=preload("res://scripts/native_ch2_area_resources.gd")
const ISOLATED_DIRECTORY := "EXODUSER-ch2-02-Isolated-20261020"
var display_textures: Dictionary={}
var lore_markers:=0

func _ready() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=ISOLATED_DIRECTORY \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  resource_errors=["isolated_userdir_required"]
  return
 var reader:=CH2Resources.new()
 var result: Dictionary=reader.read_resources(raw,bundle) if _configured else reader.read_resources()
 resource_errors=result.errors
 if not result.ready:return
 raw=result.raw;bundle=result.bundle;textures=result.textures
 _install_ground()
 _install_walls()
 _install_props()
 actor=Node2D.new()
 actor.name="FixtureActor"
 actor.position=Vector2(raw.start_world[0],raw.start_world[1])
 var marker:=Polygon2D.new()
 marker.polygon=PackedVector2Array([Vector2(0,-16),Vector2(11,0),Vector2(0,16),Vector2(-11,0)])
 marker.color=Color("e0cda9")
 actor.add_child(marker)
 get_node("PropLayer0").add_child(actor)
 camera=Camera2D.new()
 camera.position_smoothing_enabled=false
 camera.enabled=preview_active
 actor.add_child(camera)
 ready_for_fixture=true
 set_process(preview_active)

func _install_ground() -> void:
 var floor_view:=Polygon2D.new()
 floor_view.name="CH2OrganicGround"
 floor_view.polygon=PackedVector2Array([Vector2.ZERO,Vector2(8000,0),Vector2(8000,8000),Vector2(0,8000)])
 floor_view.uv=floor_view.polygon
 floor_view.texture=textures[bundle.floor.texture]
 floor_view.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED
 floor_view.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
 var shader:=Shader.new()
 # Continuous Godot view of authored path, deliberately not a gameplay collision mask.
 shader.code="""shader_type canvas_item;
uniform vec2 points[22];
uniform float path_radius=680.0;
varying vec2 world_xy;
void vertex(){world_xy=VERTEX;}
void fragment(){
 float distance_to_path=100000.0;
 for(int i=0;i<21;i++){
  vec2 a=points[i],v=points[i+1]-a;
  float t=clamp(dot(world_xy-a,v)/max(dot(v,v),1.0),0.0,1.0);
  distance_to_path=min(distance_to_path,length(world_xy-a-v*t));
 }
 float inside=1.0-smoothstep(path_radius-12.0,path_radius+60.0,distance_to_path);
 float bank=1.0-smoothstep(0.0,100.0,abs(distance_to_path-path_radius));
 vec3 base=texture(TEXTURE,UV).rgb;
 vec3 color=mix(base*0.12,base*0.82,inside)*(1.0-bank*0.24);
 COLOR=vec4(color,1.0);
}
"""
 var material:=ShaderMaterial.new()
 material.shader=shader
 var points:=PackedVector2Array()
 for p in raw.source_path.spec.pts:points.append(Vector2((p[0]+.5)*40,(p[1]+.5)*40))
 material.set_shader_parameter("points",points)
 material.set_shader_parameter("path_radius",(raw.source_path.spec.w+4)*20.0)
 floor_view.material=material
 floor_view.z_index=-5
 add_child(floor_view)
 for e in raw.exits:
  var destination:=Polygon2D.new()
  destination.polygon=PackedVector2Array([Vector2(-19,-19),Vector2(19,-19),Vector2(19,19),Vector2(-19,19)])
  destination.position=Vector2((e.x+.5)*40,(e.y+.5)*40)
  destination.color=Color(.55,.31,.12,.65)
  destination.z_index=-1
  add_child(destination)

func _display_texture(file: String,mode: String) -> Texture2D:
 if mode=="none":return textures[file]
 var key:=file+":"+mode
 if display_textures.has(key):return display_textures[key]
 # Original PNG and cached source Texture2D stay unchanged. Match native alpha
 # preprocessing only in a private in-memory texture (game18427-18445).
 var image: Image=textures[file].get_image().duplicate()
 image.convert(Image.FORMAT_RGBA8)
 var data:=image.get_data()
 for i in range(0,data.size(),4):
  if mode=="hard_alpha":
   if data[i+3]<255:data[i+3]=0
  elif data[i]>200 and data[i+2]>200 and data[i+1]<90:data[i+3]=0
  elif data[i]>150 and data[i+2]>150 and data[i+1]<120 and int(data[i])-int(data[i+1])>50:data[i+3]=int(data[i+3]*.12)
 var private_image:=Image.create_from_data(image.get_width(),image.get_height(),false,Image.FORMAT_RGBA8,data)
 var texture:=ImageTexture.create_from_image(private_image)
 display_textures[key]=texture
 return texture

func _install_props() -> void:
 var layers: Dictionary={}
 for p in bundle.props:
  var layer: int=int(p.get("metadata",{}).get("_renderLayer") if p.get("metadata",{}).get("_renderLayer")!=null else 0)
  if not layers.has(layer):
   var group:=Node2D.new()
   group.name="PropLayer"+str(layer);group.y_sort_enabled=true;group.z_index=layer
   add_child(group);layers[layer]=group
  if p.get("view")=="collision_only":continue
  if p.get("view")=="native_lore_marker":
   var marker:=Polygon2D.new()
   marker.name="LoreMarker";marker.position=Vector2(p.x,p.y)
   marker.polygon=PackedVector2Array([Vector2(-11,9),Vector2(-10,-17),Vector2(5,-21),Vector2(12,-8),Vector2(12,9)])
   marker.color=Color("756959");layers[layer].add_child(marker);lore_markers+=1
   continue
  var sprite:=Sprite2D.new()
  sprite.name=p.type+"_"+str(sprites.size())
  sprite.texture=_display_texture(p.texture,p.image_keying)
  sprite.set_meta("source_texture_path",p.texture)
  sprite.centered=false;sprite.position=Vector2(p.x,p.y)
  var size:=sprite.texture.get_size()
  sprite.offset=Vector2(-size.x*p.pivot[0],-size.y*p.pivot[1])
  sprite.scale=Vector2(p.draw_size[0]/size.x,p.draw_size[1]/size.y)
  sprite.rotation=deg_to_rad(float(p.rotation));sprite.flip_h=p.flip_h
  sprite.modulate.a=p.alpha
  layers[layer].add_child(sprite);sprites.append(sprite)
