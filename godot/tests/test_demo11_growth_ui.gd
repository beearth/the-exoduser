extends SceneTree
const USERDIR := "EXODUSER-demo11-19ui-Isolated-20261021"
var checks:=0
var failures:=0
var main: Node
var panel: CanvasLayer
var state: Node
var captures: Array=[]
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("GROWTH_UI_FAIL ",label)
func argument(key: String) -> String:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with(key+"="):return arg.substr(key.length()+1)
 return ""
func fixture() -> void:
 for key in state.read_current_stats():state.read_current_stats()[key]=0
 for key in state.read_current_passives():state.read_current_passives()[key]=0
 state.read_current_p().sp=20;state.read_current_p().ap=30;state.read_current_p().erase("_passiveQueue")
 main.source_providers.get_provider("raw_grit").current_container()["_grit"]=0
 check(main.request_native_runtime_stat_refresh("apply_stats","growth_ui_fixture").committed,"real PC fixture refresh")
func capture(name: String) -> void:
 var folder:=argument("--captures")
 if folder.is_empty():return
 await process_frame;await process_frame;await RenderingServer.frame_post_draw
 var image:=root.get_texture().get_image()
 check(image.get_size()==Vector2i(1920,1080),"capture actual viewport1920x1080")
 check(image.save_png(folder+"/"+name+".png")==OK,"capture written "+name)
 var regions: Array=[["detail",Rect2i(1490,110,400,760)],["tree",Rect2i(630,170,520,500)],["footer",Rect2i(1230,970,660,100)]] if not name.contains("refund") else [["confirm",Rect2i(600,350,720,350)]]
 for row in regions:
  check(image.get_region(row[1]).save_png(folder+"/"+name+"_"+row[0]+"_1x.png")==OK,"unscaled crop "+row[0])
 captures.append(name)
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"OS actual isolated user dir")
 print("GROWTH_UI_USERDIR ",OS.get_user_data_dir())
 if OS.get_user_data_dir().get_file()!=USERDIR:quit(1);return
 TranslationServer.set_locale("ko")
 if not argument("--captures").is_empty():DisplayServer.window_set_size(Vector2i(1920,1080));root.size=Vector2i(1920,1080)
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in 8:await physics_frame
 state=main.source_state;panel=main.get_node("NativeGrowthPanel")
 if not argument("--captures").is_empty():
  await _capture_only();return
 fixture()
 var before: Dictionary=main.read_native_growth().duplicate(true)
 panel.open_panel()
 check(panel.get_snapshot().opened and paused,"open real Main panel pauses")
 check(panel.get_snapshot().centers==31 and panel.get_snapshot().ranks==260,"source31centers260ranks")
 panel.select_node("str");check(panel.draft_step(1),"stat draft+1")
 check(main.read_native_growth()==before,"draft must not mutate actual owner")
 panel.select_node("pFortify",4);check(panel.draft_step(1),"cumulative rank4 draft")
 check(panel.get_snapshot().plan.passives.pFortify==4,"rank target4")
 check(panel.evaluated().ap==25,"rank0to4 source5AP")
 await capture("01_growth_plan")
 var receipt: Dictionary=panel.apply_plan()
 check(receipt.applied and receipt.refresh.committed,"real owner PC apply_stats receipt")
 check(receipt.refresh.mode=="apply_stats" if receipt.refresh.has("mode") else receipt.refresh.status=="READY","apply_stats contract")
 check(state.read_current_stats().str==1 and state.read_current_passives().pFortify==4,"actual stats/passives committed")
 check(state.read_current_p().sp==19 and state.read_current_p().ap==25,"actual SP AP committed")
 check(not receipt.save_committed,"no false save success")
 panel.select_node("pFortify",2);check(panel.draft_step(-1),"rank2 refund draft")
 check(panel.get_snapshot().plan.passives.pFortify==1 and panel.evaluated().ap==29,"rank2through4 refunds4AP")
 panel.discard_plan();check(panel.get_snapshot().plan.passives.pFortify==4,"discard restores live")
 panel.select_node("pVital");var derived: Dictionary=state.read_current_p().duplicate(true)
 check(panel.change_queue().applied,"queue event accepted")
 check(main.read_native_growth().queue==["pVital"],"actual FIFO queue")
 check(panel.get_snapshot().last.refresh.is_empty(),"queue no recalculation")
 check(state.read_current_p().hp==derived.hp and state.read_current_p().mhp==derived.mhp,"queue preserves derived resources")
 check(panel.change_queue(0).applied and main.read_native_growth().queue.is_empty(),"cancel queue by index")
 panel.select_node("str");panel.draft_step(1)
 state.read_current_stats().str+=1
 check(not panel.apply_plan().applied,"stale base rejected through real owner")
 check(state.read_current_stats().str==2,"stale draft no partial commit")
 panel.discard_plan()
 panel.request_reset()
 check(panel.get_snapshot().confirm_visible,"refund confirmation present")
 var reset_before: Dictionary=main.read_native_growth().duplicate(true)
 panel.confirm_reset()
 check(main.read_native_growth()==reset_before,"reset confirmation is draft only")
 check(panel.get_snapshot().plan.stats.str==0 and panel.get_snapshot().plan.passives.pFortify==0,"full refund draft")
 check(panel.apply_plan().applied,"full refund applied through owner")
 check(state.read_current_stats().str==0 and state.read_current_passives().pFortify==0,"full refund actual")
 panel.select_node("str");panel.draft_step(1)
 panel.close_panel();check(not paused and not panel.get_snapshot().opened,"close restores pause")
 panel.open_panel();check(panel.get_snapshot().plan.stats.str==0,"close discards unapplied draft")
 # Three core fault injections: stale base above, insufficient SP, actual PC provider refusal.
 state.read_current_p().sp=0;panel.discard_plan()
 check(not panel.draft_step(1),"insufficient SP refuses draft")
 state.read_current_p().sp=20;panel.discard_plan();panel.draft_step(1)
 var old_shield: Variant=state.get("_p").shield
 state.get("_p").shield="invalid"
 var failed_before: Dictionary=main.read_native_growth().duplicate(true)
 check(not panel.apply_plan().applied,"actual PC malformed-resource refusal")
 check(main.read_native_growth()==failed_before,"PC refusal allocation rollback")
 state.get("_p").shield=old_shield
 panel.discard_plan();panel.select_node("pFortify");panel.change_queue();panel.request_reset()
 await capture("02_growth_refund")
 panel.close_panel();check(not state.read_current_g().statOpen,"close clears State UI flag")
 # No UI transaction occurs during physics ticks while closed.
 var final: Dictionary=main.read_native_growth().duplicate(true)
 for i in 4:await physics_frame
 check(main.read_native_growth().stats==final.stats and main.read_native_growth().passives==final.passives,"idle ticks never invest")
 main.queue_free()
 for i in 16:await process_frame
 await create_timer(0.2).timeout
 print("GROWTH_UI_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"captures":captures,"fault_kinds":3,"save_io":false}))
 quit(1 if failures else 0)

func _capture_only() -> void:
 # Visual fixture: actual Main/19r/PC; SP20 AP30 explicitly granted for review.
 check(panel.label_for("legacy_removed_passive")=="기록된 패시브","legacy FIFO label remains cancellable without unknown-key crash")
 fixture();panel.open_panel();panel.select_node("str");panel.draft_step(1)
 panel.select_node("pFortify",4);panel.draft_step(1)
 await capture("01_growth_plan")
 panel.apply_plan();panel.select_node("pVital");panel.change_queue();panel.request_reset()
 await process_frame
 check(Rect2(Vector2.ZERO,Vector2(root.size)).encloses(panel.get("_confirm").get_node("Box").get_global_rect()),"confirmation stays in viewport")
 await capture("02_growth_refund")
 panel.close_panel();main.queue_free()
 for i in 16:await process_frame
 await create_timer(0.2).timeout
 print("GROWTH_CAPTURE_RESULT ",JSON.stringify({"artifact_checks":checks,"failures":failures,"captures":captures,"fixture":"real Main, SP20/AP30 review fixture; no manual native app input"}))
 quit(1 if failures else 0)
