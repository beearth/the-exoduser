extends Node
## DEMO11-37. Consumes P3-003 attribution and PC FINAL death, never detects death.
signal gate_ready
signal arena_entered(actor: Node2D)
signal reward_ready(record: Dictionary)
signal arena_exit_opened(marker: Marker2D)
signal clear_recorded(result: Dictionary)
const REGIONS = preload("res://scripts/native_regions.gd")
const MARKERS := ["Entry","Boss","Exit","Return"]
var _main: Node
var _regions: Node
var _provider: Node2D
var _markers: Dictionary={}
var _death_owner: Node
var _phase := "field"
var _busy := false
var _actor: Node2D
func configure(main: Node, regions: Node) -> void:
 _main=main;_regions=regions
 regions.gate_opened.connect(_gate_changed)
func _live() -> bool:
 return is_instance_valid(_main) and get_parent()==_main and _main.get("native_demo_encounter")==self and is_instance_valid(_regions) and _regions.snapshot().get("ready")==true and _main.read_native_demo_policy().get("stage")==0
func _gate_changed() -> void:
 if not _live() or _phase!="field": return
 var g: Dictionary=_main.source_state.read_current_g()
 if g.get("_bossUnlocked")==true and g.get("_fbDone")==true:
  _phase="gate";gate_ready.emit()
func bind_provider(provider: Node2D) -> bool:
 if not _live() or is_instance_valid(_provider) or not is_instance_valid(provider) or not _main.world.is_ancestor_of(provider): return false
 var found: Dictionary={}
 for key in MARKERS:
  var marker: Node=provider.get_node_or_null("Markers/"+key)
  if not marker is Marker2D: return false
  found[key]=marker
 _provider=provider;_markers=found
 return true
func bind_final_death_source(owner: Node, event: StringName) -> bool:
 # PC36/49 owns signal semantics: emit only after final death/revival resolution.
 # No reflection-list construction, no HP/poise/revival reads or writes.
 if not _live() or is_instance_valid(_death_owner) or not is_instance_valid(owner) or not _main.is_ancestor_of(owner) or not owner.has_signal(event): return false
 if owner.connect(event,_final_death)!=OK:return false
 _death_owner=owner
 return true
func _provider_live(provider: Node) -> bool:
 if not _live() or provider!=_provider or not is_instance_valid(_provider) or not _main.world.is_ancestor_of(_provider): return false
 for key in MARKERS:
  if not is_instance_valid(_markers[key]) or _provider.get_node_or_null("Markers/"+key)!=_markers[key]:return false
 return true
func enter(provider: Node, spawn_options: Dictionary) -> Dictionary:
 _gate_changed()
 if _busy or _phase!="gate" or not _provider_live(provider):return {"status":"NOT_READY","reason":"gate_or_provider"}
 var g: Dictionary=_main.source_state.read_current_g()
 if g.get("_bossUnlocked")!=true or g.get("_fbDone")!=true or not g.get("on",false):return {"status":"NOT_READY","reason":"live_gate"}
 _busy=true
 var req: Dictionary=spawn_options.duplicate(true)
 req.si=0;req.x=_markers.Boss.global_position.x;req.y=_markers.Boss.global_position.y
 # The real spawn contract queries World's active geometry. Switch before its
 # canMv call; restore field on rejected packet without committing player/state.
 if not _main.world.activate_map11_space("arena"):
  _busy=false
  return {"status":"NOT_READY","reason":"arena_geometry"}
 var receipt: Dictionary=_main.spawn_native_demo_boss(req)
 if receipt.get("status")=="READY":
  _actor=_main.native_demo_boss_actor
  _main.player.global_position=_markers.Entry.global_position
  g["_bossArena"]=true;g["bossAlive"]=true
  _phase="arena"
 else:
  _main.world.activate_map11_space("field")
 _busy=false
 if _phase=="arena":arena_entered.emit(_actor)
 return receipt
func _final_death(actor: Node, stage_index: int) -> void:
 if _busy or _phase!="arena" or not _provider_live(_provider) or not is_instance_valid(_death_owner) or not _main.is_ancestor_of(_death_owner) or actor!=_actor or actor!=_main.native_demo_boss_actor or stage_index!=0:return
 _busy=true
 var result: Dictionary=_main.source_state.commit_native_demo_encounter(self,false,_markers.Boss.global_position)
 if result.get("applied")==true:_phase="exit"
 _busy=false
 if _phase=="exit":
  arena_exit_opened.emit(_markers.Exit)
  reward_ready.emit(result.chest.duplicate(true))
func leave(provider: Node) -> bool:
 # Provider owns actual Exit contact. Merely killing the boss never clears.
 if _busy or _phase!="exit" or not _provider_live(provider):return false
 if _main.get_native_startup_language_snapshot().get("status")!="READY":return false
 _busy=true
 var result: Dictionary=_main.source_state.commit_native_demo_encounter(self,true,Vector2.ZERO)
 if result.get("applied")!=true:_busy=false;return false
 _phase="clear"
 clear_recorded.emit(result.result.duplicate(true))
 _main.native_demo_boss_defeated.emit(0) # G41920–42003 -> DEMO11-38.
 _busy=false
 return _main.native_demo_end_flow.get_snapshot().phase=="clear"
func snapshot() -> Dictionary:
 return {"phase":_phase,"provider_bound":is_instance_valid(_provider),"pc_final_source_bound":is_instance_valid(_death_owner),"boss_death_detection":false,"map_contact_owner":"MAP11 provider","markers":MARKERS.duplicate()}
