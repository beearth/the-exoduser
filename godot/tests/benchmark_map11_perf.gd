extends "res://tests/capture_map11_hell_props.gd"
## MAP11-PERF: inherited real Main / 600 ticks / 1920x1080 / 240 cap.
## A/B changes happen once before settling, never in a tick/render callback.
func measure(space: String,origin: Vector2) -> Dictionary:
 var scene: Node=main.world.get_node("Map11ProductScene")
 var mode: String="baseline"
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--ab="):mode=arg.trim_prefix("--ab=")
 if space=="field":
  var detail: Node=scene.get_node("MAP11Detail")
  if mode=="props":
   for prop in detail.hell_props:prop.hide()
  elif mode=="prop-unlit":
   var mat:=CanvasItemMaterial.new();mat.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
   for prop in detail.hell_props:prop.get_child(0).material=mat
  elif mode in ["prop-shader","prop-cutout","all-cutout"]:
   var shader:=Shader.new()
   shader.code="shader_type canvas_item; varying vec4 tint; void vertex(){tint=COLOR;} void fragment(){vec4 s=texture(TEXTURE,UV);"+("if(s.a==0.0){discard;}" if mode!="prop-shader" else "")+"COLOR=s*tint;}"
   var mat:=ShaderMaterial.new();mat.shader=shader
   for prop in detail.hell_props:prop.get_child(0).material=mat
   if mode=="all-cutout":
    for child in scene.field_view.get_children():
     if str(child.name).begins_with("FloorPatch"):child.material=mat
  elif mode=="prop-half":
   var textures: Dictionary={}
   for prop in detail.hell_props:
    var sprite: Sprite2D=prop.get_child(0)
    var key: String=sprite.texture.resource_path
    if not textures.has(key):
     var image: Image=sprite.texture.get_image()
     var size_: Vector2i=image.get_size()
     image.resize(size_.x/2,size_.y/2,Image.INTERPOLATE_LANCZOS)
     image.generate_mipmaps()
     var tex:=ImageTexture.create_from_image(image);tex.set_size_override(size_)
     textures[key]=tex
    sprite.texture=textures[key]
  elif mode=="contact-atlas":
   var atlas=preload("res://scripts/maps/map11/ground_contact_atlas.gd")
   for view in [scene.field_view,scene.arena_view]:
    for child in view.get_children():
     if child.get_meta("ground_contact_kind","")!="ao":continue
     var source: Sprite2D=child.get_meta("contact_source")
     child.texture=atlas.TEXTURES[source.get_meta("opaque_ground_key")]
  elif mode in ["patches","contacts"]:
   for child in scene.field_view.get_children():
    if mode=="patches" and str(child.name).begins_with("FloorPatch"):child.hide()
    if mode=="contacts" and child.get_meta("ground_contact_kind","")=="ao":child.hide()
  elif mode=="lights":
   scene.lighting_look.set_process(false)
   scene.lighting_look._player_light.hide()
   for row in scene.lighting_look.pools:row.node.hide()
  else:check(mode=="baseline","known A/B mode")
 var keep_focus: bool="--keep-focus" in OS.get_cmdline_user_args()
 print("PERF_FOCUS ",space," before=",DisplayServer.window_is_focused()," force_foreground=",not keep_focus)
 if not keep_focus:DisplayServer.window_move_to_foreground()
 var focus_events: Array=[]
 var entered: Callable=func():focus_events.append({"us":Time.get_ticks_usec(),"focused":true})
 var exited: Callable=func():focus_events.append({"us":Time.get_ticks_usec(),"focused":false})
 root.focus_entered.connect(entered);root.focus_exited.connect(exited)
 var focus_started: bool=DisplayServer.window_is_focused()
 # Preserve the original harness's single 35-tick settle inside super.measure.
 var result: Dictionary=await super.measure(space,origin)
 root.focus_entered.disconnect(entered);root.focus_exited.disconnect(exited)
 result["focus_started"]=focus_started;result["focus_events"]=focus_events
 # Enumeration is outside the measured interval; AABB is not a GPU counter.
 print("PERF_AB ",mode," ",space," ",JSON.stringify(diagnose(scene.field_view if space=="field" else scene.arena_view)))
 result["ab"]=mode
 result["window_focused"]=DisplayServer.window_is_focused()
 result["cpu_process_snapshot_ms"]=Performance.get_monitor(Performance.TIME_PROCESS)*1000.0
 result["physics_snapshot_ms"]=Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS)*1000.0
 return result
