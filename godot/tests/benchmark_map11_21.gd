extends "res://tests/capture_map11_hell_props.gd"
## Single final related verification + one 600-tick benchmark per space.
const Tour=preload("res://scripts/maps/map11/tour_layout.gd")
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-21-Isolated-20261021":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 if not is_instance_valid(main.source_intro_sequence):quit(5);return
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 var detail: Node=scene.get_node("MAP11Detail")
 var provider=preload("res://scripts/maps/map11/field_provider.gd").new()
 check(provider.compile(preload("res://scripts/maps/map11/field_recipe.gd").new()),"all authored route sweeps and anchors clear")
 check(detail.hell_props.size()==15,"15 standing props across six scenes")
 var evidence_rows: Array=[]
 for i in range(detail.hell_props.size()):
  var prop: Node2D=detail.hell_props[i]
  var sprite: Sprite2D=prop.get_child(0)
  var row: Array=Tour.ROWS[i]
  var bounds: Rect2=sprite.get_meta("opaque_ground_bounds")
  check(absf(bounds.end.y)<.001 and absf(bounds.get_center().x)<.001,"opaque bbox foot zero gap")
  check(sprite.texture is CanvasTexture and sprite.texture.normal_texture!=null,"baked diffuse+normal")
  check(prop.z_index==int(row[2].y/4.0) and not prop.z_as_relative,"same actor y depth")
  check(not provider.can_move(row[2],1.0),"authoritative foot blocks movement")
  check(prop.global_position.distance_to(scene.arena_view.global_position)>1700.0+row[4],"outside arena R1700")
  evidence_rows.append({"id":str(prop.name),"asset":row[0],"variant":row[1],"foot":str(row[2]),"height":row[3],"radius":row[4],"ground_bounds":str(bounds)})
 var patches: int=0
 for child in scene.field_view.get_children():
  if str(child.name).begins_with("FloorPatch") or str(child.name).begins_with("GroundStory"):patches+=1
 check(patches==0,"flat patches and broad scatter removed")
 check(scene.lighting_look.pools.size()==14,"eight existing plus six scene light pools")
 results.append(await measure("field",Vector2(-850,-2400)))
 main.player.global_position=main.read_native_map11_provider().transition_sites().field_gate.global_position
 for i in range(40):await physics_frame
 check(main.native_map11.snapshot().space=="arena","real gate entry")
 results.append(await measure("arena",scene.arena_view.global_position+Vector2(1250,80)))
 for result in results:check(result.p95_ms<=8.33,result.space+" p95 within 8.33ms")
 var f:=FileAccess.open(output,FileAccess.WRITE)
 f.store_string(JSON.stringify({"samples":results,"checks":checks,"failures":failures,"props":evidence_rows,"viewport":[1920,1080],"physics_hz":Engine.physics_ticks_per_second,"user_dir":OS.get_user_data_dir(),"scope":"one GUI run; real Player input, 600 ticks per space; existing PID81277 coexists; no dense-combat/Windows/GPU timestamp claim"},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
