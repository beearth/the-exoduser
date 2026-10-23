extends SceneTree
const USERDIR="EXODUSER-demo11-07-Isolated-20261021-SWEEP-B3-20261023-01"
const ENTRY=preload("res://scripts/native_demo_lobby_entry.gd")
const STORE=preload("res://port_modules/save_adapter/demo_local_storage.gd")
var checks:=0
var failures:=0
var serial:=0
var output:=""
var source_root:=""
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok:failures+=1;printerr("DEMO11_07_FAIL ",label)
func write(store: RefCounted,key: String,value: Dictionary) -> bool:
	serial+=1;var id: String="fixture-%s" % serial
	var begin: Dictionary=store.begin_set(id,key,JSON.stringify(value))
	if not begin.get("ready",false):return false
	var result: Dictionary=store.run_request(id);store.release_receipt(id);return result.get("ok",false)
func clear(store: RefCounted) -> void:
	for key in STORE.KEYS:
		serial+=1;var id: String="clear-%s" % serial
		var begin: Dictionary=store.begin_remove(id,key)
		if begin.get("ready",false):store.run_request(id);store.release_receipt(id)
func shot(name: String) -> void:
	await RenderingServer.frame_post_draw
	var image: Image=root.get_texture().get_image()
	check(image.get_size()==Vector2i(1920,1080),"internal viewport1920x1080")
	check(image.save_png(output.path_join(name+".png"))==OK,"capture saved")
	var rect:=Rect2i(1000,440,780,440) if name=="01-character-create" else Rect2i(150,850,1620,145)
	image.get_region(rect).save_png(output.path_join(name+"-1x.png"))
func lobby(enabled: bool=true,language: String="ko") -> Control:
	var screen=load("res://scenes/demo_lobby.tscn").instantiate()
	screen.language=language
	screen.set_meta("native_lobby_entry_enabled",enabled)
	screen.set_meta("native_audio_source_root",source_root);screen.set_meta("native_story_source_root",source_root)
	root.add_child(screen);return screen
## SWEEP-B(2026-10-23): 새 기록 진입은 웹처럼 전사 스토리 영상이 먼저 뜬다 — 사용자 건너뛰기와 같은 finish()로 넘긴다.
## INTEG-17(2026-10-23): BOOT-01 예열 뒤 첫 진입은 834프레임째 도착(100프레임 고정 대기로 21/1 실패).
## 대기 조건 = Main 도착(request_native_lobby_entry 보유 씬) 또는 최대 60초(실시간). 판정은 그대로(시간 안에 못 오면 null → 실패).
func wait_main(screen: Node=null) -> Node:
	var deadline: int=Time.get_ticks_msec()+60000
	while Time.get_ticks_msec()<deadline:
		await process_frame
		if is_instance_valid(screen) and is_instance_valid(screen.get("_movie")) and screen._movie.is_inside_tree():screen._movie.finish()
		if is_instance_valid(current_scene) and current_scene.has_method("request_native_lobby_entry"):return current_scene
	return null
func release_main(main: Node) -> void:
	if is_instance_valid(main):main.queue_free()
	for i in range(8):await process_frame
	paused=false
func _run() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-root="):source_root=arg.trim_prefix("--source-root=")
		if arg.begins_with("--out="):output=arg.trim_prefix("--out=")
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated name")
	check(not output.is_empty() and not source_root.is_empty(),"explicit capture/source roots")
	if failures:quit(1);return
	DirAccess.make_dir_recursive_absolute(output)
	var cases: Array=[]
	for name in ["", "가", "가나", "  전사  ", "12345678", "123456789", "검<사", "검>사", "검\"사", "검'사", "검&사", "검/사", "검\\사", "검-사", String.chr(0x1f600).repeat(5)]:
		var result: Dictionary=ENTRY.validate_name(name)
		cases.append({"name":name,"ready":result.ready})
	check(ENTRY.validate_name("가나").ready and not ENTRY.validate_name("가").ready,"name source2-8")
	check(not ENTRY.validate_name("가나",1).ready,"locked character rejected by policy")
	var file:=FileAccess.open(output.path_join("name-observations.json"),FileAccess.WRITE);file.store_string(JSON.stringify({"cases":cases,"characters":ENTRY.CHARACTERS,"available":[ENTRY.validate_name("검은 전사",0).ready,ENTRY.validate_name("검은 전사",1).ready,ENTRY.validate_name("검은 전사",2).ready,ENTRY.validate_name("검은 전사",3).ready,ENTRY.validate_name("검은 전사",4).ready]}));file.close()
	var store=STORE.new();check(store.open_store().ready,"actual demo adapter")
	clear(store)
	var bus_count:=AudioServer.bus_count
	var screen:=lobby();screen._choose(0);screen.name_input.text="검은 순례자"
	check(screen.character_buttons.size()==5 and not screen.character_buttons[0].disabled,"released char0")
	# SWEEP-B(2026-10-23): 웹 selectVisual(index3280–3290) — 잠긴 캐릭터 아이콘도 선택(미리보기)은 되지만
	# 생성 버튼은 disabled + '출시 준비 중', 사슬 잠금 표시. 생성 경로 차단은 아래 forged choice 단정이 계속 검증한다.
	for i in range(1,5):
		screen._select_character(i)
		check(screen.character_buttons[i].locked and screen.detail_create.disabled and screen.detail_create.text==screen.UI.text("출시 준비 중") and screen.detail_lock.visible,"locked character UI "+str(i))
	screen._select_character(0)
	check(not screen.detail_create.disabled and not screen.detail_lock.visible,"released char0 create enabled again")
	screen.name_input.text="가";screen._create();check(not store.get_item("hellsave_demo_0").found and screen._form.visible,"invalid name no write")
	screen.character_index=2;screen.name_input.text="검은 순례자";screen._create();check(not store.get_item("hellsave_demo_0").found,"forged locked choice no create")
	screen._select_character(0)
	check(write(store,"hellsave_demo_3",{"name":"검은 순례자","charIdx":0,"ts":1}),"duplicate-name fixture")
	screen._create()
	check(not store.get_item("hellsave_demo_0").found and screen.status.text=="이미 같은 이름의 캐릭터가 있습니다.","duplicate name localized, no second record")
	clear(store);screen.menu.refresh();screen._select_character(0)
	await shot("01-character-create")
	var entry: RefCounted=screen.entry
	screen._create()
	# SWEEP-B(2026-10-23): 웹 생성 직후 전사 스토리 영상(index warintro)이 먼저 재생된다 — 실제 영상 레이어가 떴는지 확인하고
	# 사용자 건너뛰기와 같은 finish()로 넘긴 뒤 Main 진입을 기다린다.
	for i in 4:await process_frame
	check(is_instance_valid(screen._movie) and screen._movie.is_inside_tree(),"web warrior story movie plays before Main entry")
	if is_instance_valid(screen._movie):screen._movie.finish()
	var created: Dictionary=store.read_json("hellsave_demo_0")
	check(created.ready and created.value.name=="검은 순례자" and created.value.charIdx==0,"persisted original char0 metadata")
	check(created.value.size()==3 and created.value.has("ts"),"original name ts charIdx shape unchanged")
	var main: Node=await wait_main()
	check(is_instance_valid(main),"actual Main handoff")
	if not is_instance_valid(main):print("DEMO11_07_RESULT assertions=",checks," failures=",failures);quit(1);return
	check(entry.launches==1 and entry.phase=="entered","one launch")
	check(not entry.rollback() and store.get_item("hellsave_demo_active").raw=="0","late rollback cannot clear live active slot")
	check(str(store.get_item("hellsave_demo_active").get("raw","<missing>"))=="0","active0 "+str(store.get_item("hellsave_demo_active")))
	# SWEEP-B(2026-10-23): DEMO11-06 저장 수명주기(demo_load_session.start_lifecycle → schedule_boot_save, 웹 부팅 saveGame)가
	# 진입 직후 실제 게임 저장을 쓴다. 단정 의도 = 로비 메타데이터(name/ts/charIdx)가 게임 저장으로 복사되지 않음.
	var game_save: Dictionary=store.read_json("hellsave_demo")
	check(not game_save.get("found",false) or (game_save.value.has("player") and game_save.value.has("inv") and game_save.value.has("game") and game_save.value.size()>created.value.size()),"new metadata never copied into game save "+str(game_save.get("value",{}).keys()))
	check(main.read_native_character_selection().index==0 and main.player.get_native_character_profile_snapshot().index==0,"existing character interface char0")
	check(is_instance_valid(main.native_story_intro) and main.native_story_intro.phase=="playing","DEMO11-08 actual intro")
	check(main.source_intro_sequence==null and main.source_state.read_current_g().get("_cutsceneDone")==false,"no early waking or completion")
	main._native_story_handoff("late_callback")
	check(main.source_intro_sequence==null,"unfinished story cannot hand off early")
	await shot("02-intro-handoff")
	main.native_story_intro.finish("skip")
	check(main.source_state.read_current_g().get("_cutsceneDone")==true,"runtime existing cutsceneDone flag committed on skip")
	check(main.source_intro_sequence.phase=="guide","existing four-cut owner single handoff")
	check(store.get_item("hellsave_demo_0").raw==created.raw,"story completion does not rewrite slot format")
	check(not entry.prepare(main.native_lobby_entry._menu,0).ready,"duplicate entry cannot relaunch")
	await release_main(main)
	check(AudioServer.bus_count==bus_count,"entry/Main audio buses released")
	check(write(store,"hellsave_demo_1",{"name":"이미 본 전사","ts":1700000000000,"charIdx":0,"game":{"cutsceneDone":true}}),"seen fixture")
	screen=lobby();screen._choose(1);check(screen.menu.request_continue(),"existing new-metadata request reused")
	main=await wait_main(screen);check(is_instance_valid(main),"seen Main entered")
	if is_instance_valid(main):
		check(main.native_story_intro==null and main.source_intro_sequence.phase=="guide","cutsceneDone bypasses movie, keeps existing waking owner")
		check(main.source_state.read_current_g().get("_cutsceneDone")==true and store.get_item("hellsave_demo_active").raw=="1","seen flag/active1 boundary")
		var foreign:=Node.new()
		check(not main.source_state.commit_native_intro_cutscene_boundary(foreign),"foreign flag writer rejected");foreign.free()
		await release_main(main)
	screen=lobby(true,"en")
	check(screen.menu.request_new(4,"영문 전사"),"English bridge creation")
	main=await wait_main(screen)
	check(is_instance_valid(main) and main.native_story_intro.locale=="en","actual S10 lobby language reaches INTRO")
	await release_main(main)
	check(AudioServer.bus_count==bus_count,"English entry releases audio buses")
	screen=lobby(false)
	var active_before: String=str(store.get_item("hellsave_demo_active").get("raw","<missing>"))
	check(write(store,"hellsave_demo_2",{"name":"저장 전사","charIdx":0,"player":{"lv":3},"game":{"cutsceneDone":true}}),"saved fixture")
	var held:=ENTRY.new();check(held.prepare(screen.menu,2).reason=="saved_player_restore_required","full Player restore held for DEMO11-06")
	check(str(store.get_item("hellsave_demo_active").get("raw","<missing>"))==active_before,"held saved entry preserves active")
	check(write(store,"hellsave_demo",{"player":{"lv":7},"unknown":"preserve"}),"pending active save fixture")
	# SWEEP-B(2026-10-23): 수명주기 저장이 진입한 슬롯 0에 전체 게임 기록(player)을 쓰므로 0번은 saved 경로가 먼저 걸린다.
	# 같은 의도(대기 중 게임 저장이 있으면 새 메타데이터 진입 거절)를 메타데이터 전용 슬롯 3으로 검증한다.
	check(write(store,"hellsave_demo_3",{"name":"대기 전사","charIdx":0,"ts":1}),"metadata-only fixture for pending-save guard")
	held=ENTRY.new();var pending_reason: String=str(held.prepare(screen.menu,3).get("reason",""));check(pending_reason=="active_save_sync_required","cannot discard pending progress "+pending_reason)
	check(store.read_json("hellsave_demo").value.unknown=="preserve","unknown save fields untouched")
	clear(store);check(write(store,"hellsave_demo_0",{"name":"실패 전사","charIdx":0,"ts":1}),"lock fixture metadata")
	var lock: String=store.readiness().root.path_join(".writer")
	check(DirAccess.make_dir_absolute(lock)==OK,"inject own writer lock")
	held=ENTRY.new();check(not held.prepare(screen.menu,0).ready and not store.get_item("hellsave_demo_active").found,"failed active commit no launch")
	check(DirAccess.remove_absolute(lock)==OK,"release own lock")
	screen.queue_free();await process_frame;clear(store)
	print("DEMO11_07_RESULT assertions=",checks," failures=",failures)
	quit(1 if failures else 0)
