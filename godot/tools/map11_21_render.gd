extends SceneTree
## Offline only. GLB stays outside res:// and is never a runtime dependency.
var output: String
var source: String
var prefix: String="skull"
var render_height: int=440
func _initialize() -> void:call_deferred("run")
func run() -> void:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--prefix="):prefix=arg.trim_prefix("--prefix=")
  if arg.begins_with("--height="):render_height=int(arg.trim_prefix("--height="))
  if arg.begins_with("--source="):source=arg.trim_prefix("--source=")
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if source.is_empty() or output.is_empty():quit(2);return
 if DisplayServer.get_name()=="headless":
  DirAccess.make_dir_recursive_absolute(output)
  var error_file:=FileAccess.open(output.path_join("render_error.json"),FileAccess.WRITE)
  error_file.store_string(JSON.stringify({"error":"Godot headless uses dummy rendering; use GPU CLI/editor session (or Xvfb on Linux), not --headless for PNG capture"}))
  quit(4);return
 DirAccess.make_dir_recursive_absolute(output)
 var document:=GLTFDocument.new();var state:=GLTFState.new()
 if document.append_from_file(source,state)!=OK:quit(3);return
 var model: Node3D=document.generate_scene(state)
 var viewport:=SubViewport.new();viewport.size=Vector2i(1024,1024);viewport.transparent_bg=true
 viewport.own_world_3d=true;viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
 root.add_child(viewport);viewport.add_child(model)
 var meshes: Array[MeshInstance3D]=[]
 collect(model,meshes)
 var bounds:=AABB();var first: bool=true
 for mesh in meshes:
  var box: AABB=mesh.global_transform*mesh.get_aabb()
  bounds=box if first else bounds.merge(box);first=false
 model.position=-bounds.get_center()
 var pivot:=Node3D.new();viewport.add_child(pivot);viewport.remove_child(model);pivot.add_child(model)
 var camera:=Camera3D.new();camera.projection=Camera3D.PROJECTION_ORTHOGONAL
 camera.position=Vector3(0,6,8);camera.look_at_from_position(camera.position,Vector3.ZERO)
 camera.size=bounds.size.length()*1.08;camera.near=.01;camera.far=100.0
 viewport.add_child(camera);camera.current=true
 var shader:=Shader.new()
 shader.code="""shader_type spatial;
render_mode unshaded, cull_disabled, fog_disabled;
uniform sampler2D base_color : source_color;
uniform vec4 tint : source_color = vec4(1.0);
uniform sampler2D detail_normal : hint_normal;
uniform bool has_detail = false;
uniform float detail_strength = 1.0;
uniform bool normal_pass = false;
uniform bool depth_pass = false;
uniform float depth_span = 1.0;
varying float view_depth;
uniform float base_cut_y = -100.0;
varying float world_height;
void vertex(){view_depth=(MODELVIEW_MATRIX*vec4(VERTEX,1.0)).z;world_height=(MODEL_MATRIX*vec4(VERTEX,1.0)).y;}
void fragment(){
 vec3 n=normalize(NORMAL);
 if(has_detail){vec3 t=texture(detail_normal,UV).xyz*2.0-1.0;t.xy*=detail_strength;n=normalize(TANGENT*t.x+BINORMAL*t.y+n*t.z);}
 vec4 color=texture(base_color,UV)*tint;
 if(world_height < base_cut_y){discard;} // Offline pedestal removal in all passes.
 // View axes right/up/towards camera; CanvasTexture itself flips green to screen-down.
 float diffuse=max(dot(n,normalize(vec3(-.55,.72,.8))),0.0);
 float rim=pow(1.0-max(n.z,0.0),3.0)*max(dot(n,normalize(vec3(.6,.45,-.2))),0.0);
 vec3 baked=color.rgb*(.48+.78*diffuse)+vec3(.10,.075,.045)*rim;
 ALBEDO=depth_pass ? vec3(clamp((view_depth+10.0)/depth_span+.5,.0,1.0)) : (normal_pass ? n*.5+.5 : baked);
 // Opaque geometry writes depth; transparent SubViewport supplies silhouette alpha.
}
"""
 var cut_ratios={"tour_cocoon_tree":.065,"skull_pyramid":.055,"tour_torture_wheel":.045,"tour_chained_pillar":.04,"tour_blood_basin":.035,"hell_impaled_corpse":.03,"hell_spike_pit":.02}
 var cut_y: float=-bounds.size.y*.5+bounds.size.y*float(cut_ratios.get(prefix,.04))
 var materials: Array[ShaderMaterial]=[]
 for mesh in meshes:
  for surface in range(mesh.mesh.get_surface_count()):
   var original: Material=mesh.get_active_material(surface)
   var mat:=ShaderMaterial.new();mat.shader=shader
   mat.set_shader_parameter("base_cut_y",cut_y)
   mat.set_shader_parameter("depth_span",bounds.size.length())
   if original is BaseMaterial3D:
    mat.set_shader_parameter("base_color",original.albedo_texture)
    mat.set_shader_parameter("tint",original.albedo_color)
    if original.normal_enabled and original.normal_texture:
     mat.set_shader_parameter("has_detail",true);mat.set_shader_parameter("detail_normal",original.normal_texture);mat.set_shader_parameter("detail_strength",original.normal_scale*.35)
   mesh.set_surface_override_material(surface,mat);materials.append(mat)
 var yaws: Array=[-20.0,0.0,0.0] if prefix=="tour_chained_pillar" else [-20.0,0.0,20.0]
 var rows: Array=[]
 for i in range(3):
  pivot.rotation.y=deg_to_rad(yaws[i])
  var images: Array[Image]=[]
  for pass_ in range(3):
   for mat in materials:
    mat.set_shader_parameter("normal_pass",pass_==1)
    mat.set_shader_parameter("depth_pass",pass_==2)
   for frame in range(5):await process_frame
   await RenderingServer.frame_post_draw
   var image:=viewport.get_texture().get_image();image.convert(Image.FORMAT_RGBA8)
   images.append(image)
  var rect: Rect2i=images[0].get_used_rect()
  # Same crop for all passes, authored 2x display-height raster.
  var height_px: int=render_height
  var target:=Vector2i(roundi(float(rect.size.x)*height_px/rect.size.y),height_px)
  for pass_ in range(3):
   var cropped:=images[pass_].get_region(rect)
   cropped.resize(target.x,target.y,Image.INTERPOLATE_LANCZOS)
   if pass_==1:
    for y in range(cropped.get_height()):
     for x in range(cropped.get_width()):
      var c: Color=cropped.get_pixel(x,y)
      var n:=Vector3(c.r*2.0-1.0,c.g*2.0-1.0,c.b*2.0-1.0).normalized()
      cropped.set_pixel(x,y,Color(n.x*.5+.5,n.y*.5+.5,n.z*.5+.5,c.a))
   cropped.save_png(output.path_join("%s_%d_%s.png"%[prefix,i,["diffuse","normal","depth"][pass_]]))
  rows.append({"variant":i,"yaw_degrees":yaws[i],"size":[target.x,target.y],"foot":[target.x*.5,target.y],"source_crop":[rect.position.x,rect.position.y,rect.size.x,rect.size.y]})
 var file:=FileAccess.open(output.path_join("render.json"),FileAccess.WRITE)
 file.store_string(JSON.stringify({"base_cut_ratio":cut_ratios.get(prefix,.04),"base_cut_y":cut_y,"elevation_degrees":rad_to_deg(atan2(6.0,8.0)),"ground_depth_compression":.6,"projection":"orthographic","normal":"view XYZ encoded .5*n+.5; +Y up/OpenGL; CanvasTexture decodes green to screen-down","variants":rows},"  "))
 quit()
func collect(node: Node,meshes: Array[MeshInstance3D]) -> void:
 if node is MeshInstance3D:meshes.append(node)
 for child in node.get_children():collect(child,meshes)
