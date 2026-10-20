extends SceneTree
## SND-01: source oracle 233개와 수동 경계 사례. Main/오디오/저장 부팅 없음.
## Oracle: game.html @ 9528ea35b, 12220–12245 / 12342–12356.
const POLICY = preload("res://port_modules/sound_source/policy.gd")
const USERDIR = "EXODUSER-snd-01-Isolated-20261020"
const SOURCE_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const SOURCE_SAMPLE_CASES = [
	["sword_slash", 2, "sword_slash", false, false],
	["sword_swing1", 10, "g_swing", true, false],
	["sword_swing2", 10, "g_swing", true, false],
	["sword_swing3", 10, "g_swing", true, false],
	["spear_thrust", 2, "spear_thrust", false, false],
	["greatsword_swing", 2, "greatsword_swing", false, false],
	["sword_back", 2, "sword_back", false, false],
	["sword_back2", 2, "sword_back2", false, false],
	["sword_back3", 2, "sword_back3", false, false],
	["melee_hit", 2, "melee_hit", false, false],
	["melee_hit1", 2, "melee_hit1", false, false],
	["flat_hit", 2, "g_monHit", false, false],
	["bullet_hit", 1, "bullet_hit", false, false],
	["player_projectile_impact", 8, "player_projectile_impact", false, false],
	["bean_hit", 1, "bean_hit", false, false],
	["heavy_hit", 10, "heavy_hit", true, false],
	["bow_hit", 2, "bow_hit", false, false],
	["fire_hit", 2, "fire_hit", false, false],
	["q_end", 2, "q_end", false, false],
	["q_parry", 10, "q_parry", true, false],
	["q_start", 2, "q_start", false, false],
	["sword_parry", 10, "sword_parry", true, false],
	["beam_fire", 10, "beam_fire", true, false],
	["beam_r1", 2, "beam_r1", false, false],
	["beam_r2", 2, "beam_r2", false, false],
	["beam_r3", 2, "beam_r3", false, false],
	["fire_death", 2, "fire_death", false, false],
	["fire_death2", 2, "fire_death2", false, false],
	["fire_death3", 2, "fire_death3", false, false],
	["chain_land", 10, "chain_land", true, false],
	["chain_dash", 10, "g_chainDash", true, false],
	["chain_dash2", 10, "g_chainDash", true, false],
	["chain_dash3", 10, "g_chainDash", true, false],
	["chain_dash4", 10, "g_chainDash", true, false],
	["chain_throw", 10, "chain_throw", true, false],
	["chain_fly", 10, "chain_fly", true, false],
	["chain_land2", 10, "chain_land2", true, false],
	["chain_stick", 10, "chain_stick", true, false],
	["electric_storm", 10, "g_eStorm", true, false],
	["electric_storm2", 10, "g_eStorm", true, false],
	["electric_storm3", 10, "g_eStorm", true, false],
	["electric_storm4", 10, "g_eStorm", true, false],
	["repentance", 10, "repentance", true, false],
	["voice_storm_attack", 9, "g_voice", false, false],
	["electric_storm_hiss", 10, "g_eStorm", true, false],
	["electric_storm_tail", 10, "g_eStorm", true, false],
	["electric_storm_hiss2", 10, "g_eStorm", true, false],
	["electric_storm_hiss3", 10, "g_eStorm", true, false],
	["ice_storm", 2, "ice_storm", false, false],
	["male_grunt", 9, "g_voice", false, false],
	["silvertail_grunt", 9, "g_voice", false, false],
	["silvertail_grunt1", 9, "g_voice", false, false],
	["silvertail_grunt2", 9, "g_voice", false, false],
	["silvertail_grunt3", 9, "g_voice", false, false],
	["silvertail_attack", 9, "g_voice", false, false],
	["silvertail_move", 9, "g_voice", false, false],
	["silvertail_parry", 9, "g_voice", false, false],
	["silvertail_parry1", 9, "g_voice", false, false],
	["silvertail_parry2", 9, "g_voice", false, false],
	["silvertail_parry3", 9, "g_voice", false, false],
	["silvertail_hit1", 9, "g_voice", false, false],
	["silvertail_hit2", 9, "g_voice", false, false],
	["silvertail_hit3", 9, "g_voice", false, false],
	["silvertail_hit4", 9, "g_voice", false, false],
	["silvertail_cooldown", 9, "g_voice", false, false],
	["silvertail_resource_fail", 9, "g_voice", false, false],
	["silvertail_magic", 9, "g_voice", false, false],
	["silvertail_ult", 9, "g_voice", false, false],
	["silvertail_beam", 9, "g_voice", false, false],
	["silvertail_explode", 9, "g_voice", false, false],
	["silvertail_dark", 9, "g_voice", false, false],
	["silvertail_holy", 9, "g_voice", false, false],
	["silvertail_repentance", 9, "g_voice", false, false],
	["silvertail_demon_revive1", 9, "g_voice", false, false],
	["silvertail_demon_revive2", 9, "g_voice", false, false],
	["silvertail_second_wind1", 9, "g_voice", false, false],
	["silvertail_second_wind2", 9, "g_voice", false, false],
	["silvertail_execution1", 9, "g_voice", false, false],
	["silvertail_execution2", 9, "g_voice", false, false],
	["silvertail_clear1", 9, "g_voice", false, false],
	["silvertail_clear2", 9, "g_voice", false, false],
	["silvertail_fuse1", 9, "g_voice", false, false],
	["silvertail_fuse2", 9, "g_voice", false, false],
	["silvertail_wakeup", 9, "g_voice", false, false],
	["voice_bladefuse", 9, "g_voice", false, false],
	["voice_plague", 9, "g_voice", false, false],
	["voice_move", 9, "g_voice", false, false],
	["voice_move2", 9, "g_voice", false, false],
	["voice_move3", 9, "g_voice", false, false],
	["voice_flee", 9, "g_voice", false, false],
	["voice_ult", 9, "g_voice", false, false],
	["voice_beam", 9, "g_voice", false, false],
	["voice_grunt", 9, "g_voice", false, false],
	["voice_attack", 9, "g_voice", false, false],
	["voice_explode", 9, "g_voice", false, false],
	["voice_magic", 9, "g_voice", false, false],
	["voice_en1", 9, "g_voice", false, false],
	["voice_en2", 9, "g_voice", false, false],
	["voice_en3", 9, "g_voice", false, false],
	["voice_parry1", 9, "g_voice", false, false],
	["voice_parry2", 9, "g_voice", false, false],
	["voice_parry3", 9, "g_voice", false, false],
	["voice_parry4", 9, "g_voice", false, false],
	["voice_holyDome", 9, "g_voice", false, false],
	["voice_holyDome2", 9, "g_voice", false, false],
	["voice_holyPrison", 9, "g_voice", false, false],
	["voice_wakeup", 9, "g_voice", false, false],
	["voice_lavaSummon", 9, "g_voice", false, false],
	["voice_dark_skill", 9, "g_voice", false, false],
	["voice_demon_revive", 9, "g_voice", false, false],
	["voice_second_wind", 9, "g_voice", false, false],
	["voice_execution", 9, "g_voice", false, false],
	["voice_clear", 9, "g_voice", false, false],
	["voice_fuse", 9, "g_voice", false, false],
	["equip_base", 2, "equip_base", false, false],
	["equip_sword", 2, "equip_sword", false, false],
	["equip_crossbow", 2, "equip_crossbow", false, false],
	["equip_rare", 2, "equip_rare", false, false],
	["drop_common", 2, "drop_common", false, false],
	["drop_rare", 2, "drop_rare", false, false],
	["drop_legend", 2, "drop_legend", false, false],
	["pickup_item", 2, "pickup_item", false, false],
	["pickup_rummage1", 2, "pickup_rummage1", false, false],
	["pickup_rummage2", 2, "pickup_rummage2", false, false],
	["pickup_rummage3", 2, "pickup_rummage3", false, false],
	["pickup_rummage4", 2, "pickup_rummage4", false, false],
	["pickup_rummage5", 2, "pickup_rummage5", false, false],
	["crossbow_shot", 10, "crossbow_shot", true, false],
	["bow_release", 10, "bow_release", true, false],
	["shield_hit", 10, "shield_hit", true, false],
	["skull_summon", 10, "skull_summon", true, false],
	["player_hit1", 2, "player_hit1", false, false],
	["player_hit2", 2, "player_hit2", false, false],
	["player_hit3", 2, "player_hit3", false, false],
	["player_hit4", 2, "player_hit4", false, false],
	["m_melee", 1, "m_melee", false, false],
	["m_archer", 1, "m_archer", false, false],
	["m_charger", 1, "m_charger", false, false],
	["m_swarm", 1, "m_swarm", false, false],
	["m_tank", 1, "m_tank", false, false],
	["m_suicide", 1, "m_suicide", false, false],
	["m_shield", 1, "m_shield", false, false],
	["m_caster", 1, "m_caster", false, false],
	["m_splitter", 1, "m_splitter", false, false],
	["m_mother", 1, "m_mother", false, false],
	["monster_crawl", 1, "monster_crawl", false, false],
	["monster_crawl1", 1, "monster_crawl1", false, false],
	["monster_hit", 2, "g_monHit", false, false],
	["monster_hit1", 2, "g_monHit", false, false],
	["monster_hit_flesh1", 2, "g_monHit", false, false],
	["monster_hit_flesh2", 2, "g_monHit", false, false],
	["monster_hurt", 2, "g_bossHit", false, false],
	["boss_hit", 10, "g_bossHit", false, false],
	["boss_howl", 10, "boss_howl", false, false],
	["boss_revive", 10, "boss_revive", false, false],
	["blue_hit", 10, "blue_hit", true, false],
	["boss_howl1", 10, "boss_howl1", false, false],
	["monster_die1", 4, "g_death", false, false],
	["die_human", 2, "die_human", false, false],
	["die_boss", 2, "die_boss", false, false],
	["death_grunt", 4, "g_death", false, false],
	["death_slime", 4, "g_death", false, false],
	["death_ice", 4, "g_death", false, false],
	["death_demon", 4, "g_death", false, false],
	["death_heavy", 4, "g_death", false, false],
	["death_heavy3", 4, "g_death", false, false],
	["death_boss", 4, "g_death", false, false],
	["boss_final_death", 10, "boss_final_death", false, false],
	["player_dead1", 9, "player_dead1", false, false],
	["player_dead2", 9, "player_dead2", false, false],
	["player_dead3", 9, "player_dead3", false, false],
	["player_dead4", 9, "player_dead4", false, false],
	["silvertail_dead1", 9, "g_voice", false, false],
	["silvertail_dead2", 9, "g_voice", false, false],
	["silvertail_dead3", 9, "g_voice", false, false],
	["silvertail_dead4", 9, "g_voice", false, false],
	["death_insect", 4, "g_death", false, false],
	["death_insect2", 4, "g_death", false, false],
	["death_ghost", 4, "g_death", false, false],
	["death_flesh", 4, "g_death", false, false],
	["death_flesh2", 4, "g_death", false, false],
	["death_bone", 4, "g_death", false, false],
	["death_bone2", 4, "g_death", false, false],
	["death_bone3", 4, "g_death", false, false],
	["death_bone_shatter1", 4, "g_death", false, false],
	["death_bone_shatter2", 4, "g_death", false, false],
	["death_bone_shatter3", 4, "g_death", false, false],
	["death_bone_shatter4", 4, "g_death", false, false],
	["death_magic", 4, "g_death", false, false],
	["death_armor", 4, "g_death", false, false],
	["death_crush2", 4, "g_death", false, false],
	["death_monster1", 4, "g_death", false, false],
	["death_monster2", 4, "g_death", false, false],
	["death_monster3", 4, "g_death", false, false],
	["death_monster4", 4, "g_death", false, false],
	["death_beast1", 4, "g_death", false, false],
	["death_beast2", 4, "g_death", false, false],
	["death_beast3", 4, "g_death", false, false],
	["death_beast4", 4, "g_death", false, false],
	["death_crack1", 4, "g_death", false, false],
	["death_crack2", 4, "g_death", false, false],
	["death_crack3", 4, "g_death", false, false],
	["death_crack4", 4, "g_death", false, false],
	["death_skull", 4, "g_death", false, false],
	["death_ghoul1", 4, "g_death", false, false],
	["death_ghoul1_v2", 4, "g_death", false, false],
	["death_ghoul1_v3", 4, "g_death", false, false],
	["death_ghoul1_v4", 4, "g_death", false, false],
	["death_ghoul1_v5", 4, "g_death", false, false],
	["death_ghoul2", 4, "g_death", false, false],
	["death_ghoul2_v2", 4, "g_death", false, false],
	["death_ghoul2_v3", 4, "g_death", false, false],
	["death_ghoul2_v4", 4, "g_death", false, false],
	["death_ghoul2_v5", 4, "g_death", false, false],
	["death_ghoul3", 4, "g_death", false, false],
	["death_ghoul3_v2", 4, "g_death", false, false],
	["death_ghoul3_v3", 4, "g_death", false, false],
	["death_ghoul3_v4", 4, "g_death", false, false],
	["death_ghoul3_v5", 4, "g_death", false, false],
	["death_ghoul3_v6", 4, "g_death", false, false],
	["shield_activate", 10, "shield_activate", true, false],
	["shield_end", 10, "shield_end", true, false],
	["shield_loop", 2, "shield_loop", false, false],
	["chain_assault_fire", 10, "chain_assault_fire", true, false],
	["fire_magic1", 10, "g_fireMagic", true, false],
	["fire_magic2", 10, "g_fireMagic", true, false],
	["fireball", 10, "fireball", true, false],
	["spike_trap", 2, "spike_trap", false, false],
	["ghost_laugh", 9, "ghost_laugh", false, false],
	["scarecrow_boom", 2, "scarecrow_boom", false, false],
	["scarecrow_charge", 2, "scarecrow_charge", false, false],
	["footstep", 3, "footstep", false, true],
	["footstep2", 3, "footstep2", false, true],
]
const BOUNDARY_CASES = [
	["", 2, "", false, false],
	["FOOTSTEP", 2, "FOOTSTEP", false, false],
	[" footstep", 2, " footstep", false, false],
	["footstep3", 2, "footstep3", false, false],
	["m_", 1, "m_", false, false],
	["amb_", 0, "amb_", false, false],
	["amb_x", 0, "amb_x", false, false],
	["player_projectile_impact2", 2, "player_projectile_impact2", false, false],
	["player_dead", 9, "player_dead", false, false],
	["player_dead_x", 9, "player_dead_x", false, false],
	["silvertail_", 9, "g_voice", false, false],
	["voice_", 9, "g_voice", false, false],
	["male_grunt2", 2, "male_grunt2", false, false],
	["ghost_laugh2", 2, "ghost_laugh2", false, false],
	["boss_", 10, "boss_", false, false],
	["boss_howl_extra", 10, "boss_howl_extra", false, false],
	["death_", 4, "g_death", false, false],
	["death_ghoul_extra", 4, "g_death", false, false],
	["monster_die", 2, "g_death", false, false],
	["monster_die2", 2, "g_death", false, false],
	["monster_die10", 2, "g_death", false, false],
	["bullet_hit2", 2, "bullet_hit2", false, false],
	["bolt_hit", 1, "bolt_hit", false, false],
	["monster_hit_extra", 2, "g_monHit", false, false],
	["flat_hit_extra", 2, "flat_hit_extra", false, false],
	["player_hit_extra", 2, "player_hit_extra", false, false],
	["melee_hit2", 2, "melee_hit2", false, false],
	["monster_crawl2", 2, "monster_crawl2", false, false],
	["chain_", 10, "chain_", true, false],
	["chain_dash9", 10, "g_chainDash", true, false],
	["sword_swing7", 10, "g_swing", true, false],
	["sword_swing", 10, "g_swing", true, false],
	["fire_magic_extra", 10, "g_fireMagic", true, false],
	["electric_storm_tail", 10, "g_eStorm", true, false],
	["electric_storm", 10, "g_eStorm", true, false],
	["bow_shot", 10, "bow_shot", true, false],
	["q_parry_extra", 2, "q_parry_extra", false, false],
	["shield_hit_extra", 2, "shield_hit_extra", false, false],
	["sword_parry_extra", 2, "sword_parry_extra", false, false],
	["monster_hurt2", 2, "monster_hurt2", false, false],
	["알수없는음", 2, "알수없는음", false, false],
	["voice_음성", 9, "g_voice", false, false],
	["Voice_test", 2, "Voice_test", false, false],
	["footstep", 3, "footstep", false, true],
	["footstep2", 3, "footstep2", false, true],
	["m_melee", 1, "m_melee", false, false],
	["monster_crawl1", 1, "monster_crawl1", false, false],
	["player_projectile_impact", 8, "player_projectile_impact", false, false],
	["player_dead1", 9, "player_dead1", false, false],
	["silvertail_dead1", 9, "g_voice", false, false],
	["ghost_laugh", 9, "ghost_laugh", false, false],
	["boss_howl", 10, "boss_howl", false, false],
	["death_ghoul1", 4, "g_death", false, false],
	["chain_fly", 10, "chain_fly", true, false],
	["boss_hit", 10, "g_bossHit", false, false],
	["monster_hurt", 2, "g_bossHit", false, false],
	["flat_hit", 2, "g_monHit", false, false],
	["player_hit1", 2, "player_hit1", false, false],
	["melee_hit", 2, "melee_hit", false, false],
	["voice_wakeup", 9, "g_voice", false, false],
]
const EXPECTED_SKILL_KEYS = [
	"shield_activate",
	"shield_hit",
	"shield_end",
	"heavy_hit",
	"bow_shot",
	"bow_release",
	"fire_magic1",
	"fire_magic2",
	"fireball",
	"crossbow_shot",
	"electric_storm",
	"electric_storm2",
	"electric_storm3",
	"electric_storm4",
	"repentance",
	"chain_throw",
	"chain_fly",
	"chain_land",
	"chain_land2",
	"chain_stick",
	"chain_dash",
	"chain_dash2",
	"chain_dash3",
	"chain_dash4",
	"skull_summon",
	"blue_hit",
	"beam_fire",
	"q_parry",
	"sword_parry",
]

var assertions := 0
var failures := 0
var observations: Array = []
var isolated := false


func _initialize() -> void:
	# 순수 script는 Main을 만들지 않는다. override.cfg 없이 프로세스 내 격리만 적용.
	# --log-file은 실행기가 Git 밖 원로그 경로로 명시한다. 사용자 저장 접근 없음.
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	isolated = OS.get_user_data_dir().get_file() == USERDIR
	call_deferred("_run")


func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("SND01_FAIL ", label)


func _run() -> void:
	_check(isolated, "effective user directory matches USERDIR")
	_check(current_scene == null and root.get_child_count() == 0, "Main not booted")
	if not isolated:
		_finish()
		return
	_check(POLICY.PRI == {"SKILL": 10, "VOICE": 9, "PLAYER_HIT": 8, "DEATH": 4,
		"STEP": 3, "HIT": 2, "PROJ": 1, "AMB": 0}, "exact eight numeric priorities")
	_check(POLICY.skill_keys() == EXPECTED_SKILL_KEYS, "29 literal keys and source order")
	var first_keys: Array = POLICY.skill_keys()
	var next_keys: Array = POLICY.skill_keys()
	_check(not is_same(first_keys, next_keys), "skill lists have independent identity")
	first_keys.clear()
	next_keys[0] = "changed"
	_check(POLICY.skill_keys() == EXPECTED_SKILL_KEYS, "returned list mutation cannot alter source keys")
	for mobile in [false, true]:
		var expected := {"active_nodes": 16 if mobile else 48, "category_per_frame": 1 if mobile else 2,
			"samples_per_frame": 3 if mobile else 6, "proj_nodes": 2 if mobile else 5,
			"hit_nodes": 2 if mobile else 3, "step_nodes": 2}
		var first: Dictionary = POLICY.limits(mobile)
		var second: Dictionary = POLICY.limits(mobile)
		_check(first == expected, "platform limits exact key set and values: " + str(mobile))
		_check(not is_same(first, second), "limits independent identity: " + str(mobile))
		first.clear()
		second["active_nodes"] = -1
		_check(POLICY.limits(mobile) == expected, "limits mutation isolation: " + str(mobile))
	var methods := {}
	var policy_script: Script = POLICY
	for method in policy_script.get_script_method_list():
		methods[method.name] = method
	for method_name in ["is_footstep", "is_skill", "priority", "category"]:
		_check(methods.has(method_name), "public method exists: " + method_name)
		if methods.has(method_name):
			_check(methods[method_name].args.size() == 1 and methods[method_name].args[0].type == TYPE_STRING,
				"String-only signature, no implicit str conversion: " + method_name)
	_check(SOURCE_SAMPLE_CASES.size() == 233, "full source sample key set")
	for row in SOURCE_SAMPLE_CASES:
		_classify(row, "source")
	for row in BOUNDARY_CASES:
		_classify(row, "boundary")
	_check(current_scene == null and root.get_child_count() == 0, "no Main or playback nodes created")
	_finish()


func _classify(row: Array, group: String) -> void:
	var key: String = row[0]
	var actual: Array = [key, POLICY.priority(key), POLICY.category(key), POLICY.is_skill(key), POLICY.is_footstep(key)]
	for i in range(1, 5):
		_check(actual[i] == row[i], "%s %s column%d expected=%s actual=%s" % [group, key, i, row[i], actual[i]])
	observations.append(actual)


func _finish() -> void:
	print("SND01_CLASSIFICATIONS ", JSON.stringify(observations))
	print("SND01_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"isolated": isolated, "userdir": OS.get_user_data_dir(), "Main_booted": current_scene != null,
		"source_samples": SOURCE_SAMPLE_CASES.size(), "boundary_cases": BOUNDARY_CASES.size(),
		"source_sha256": SOURCE_SHA256, "audible_verified": false}))
	quit(0 if failures == 0 and isolated and assertions > 0 else 1)
