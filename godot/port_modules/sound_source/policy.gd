extends RefCounted
## SND-01: 순수 사운드 분류·한도만. 재생/큐/게임 owner 연결 없음.
## Source: 9528ea35b game.html:12220–12245, 12342–12356.
## String 입력만 지원. Q/E는 샘플 키 문자열만 읽고 전투 의미를 실행하지 않는다.

const PRI := {"SKILL": 10, "VOICE": 9, "PLAYER_HIT": 8, "DEATH": 4,
	"STEP": 3, "HIT": 2, "PROJ": 1, "AMB": 0}
const SKILL_SFX_KEYS := [
	"shield_activate", "shield_hit", "shield_end", "heavy_hit", "bow_shot", "bow_release",
	"fire_magic1", "fire_magic2", "fireball", "crossbow_shot", "electric_storm",
	"electric_storm2", "electric_storm3", "electric_storm4", "repentance", "chain_throw",
	"chain_fly", "chain_land", "chain_land2", "chain_stick", "chain_dash", "chain_dash2",
	"chain_dash3", "chain_dash4", "skull_summon", "blue_hit", "beam_fire", "q_parry", "sword_parry"
]


static func is_footstep(key: String) -> bool:
	return key == "footstep" or key == "footstep2"


static func is_skill(key: String) -> bool:
	return SKILL_SFX_KEYS.has(key) or key.begins_with("chain_") \
		or key.begins_with("electric_storm") or key.begins_with("fire_magic") \
		or key.begins_with("sword_swing")


static func priority(key: String) -> int:
	if key == "player_projectile_impact":
		return PRI.PLAYER_HIT
	if is_footstep(key):
		return PRI.STEP
	if key.begins_with("player_dead"):
		return PRI.VOICE
	if key.begins_with("voice_") or key == "male_grunt" or key.begins_with("silvertail_"):
		return PRI.VOICE
	if key == "ghost_laugh":
		return PRI.VOICE
	if key.begins_with("boss_"):
		return PRI.SKILL
	if is_skill(key):
		return PRI.SKILL
	if key.begins_with("death_") or key == "monster_die1" or key == "death_grunt":
		return PRI.DEATH
	if key == "bullet_hit" or key == "bean_hit" or key == "bolt_hit":
		return PRI.PROJ
	if key.begins_with("monster_hit") or key == "flat_hit" \
			or key.begins_with("player_hit") or key == "melee_hit1":
		return PRI.HIT
	if key.begins_with("m_") or key == "monster_crawl" or key == "monster_crawl1":
		return PRI.PROJ
	if key.begins_with("amb_"):
		return PRI.AMB
	return PRI.HIT


static func category(key: String) -> String:
	if key.begins_with("monster_hit") or key == "flat_hit":
		return "g_monHit"
	if key.begins_with("death_") or key.begins_with("monster_die"):
		return "g_death"
	if key == "boss_hit" or key == "monster_hurt":
		return "g_bossHit"
	if key.begins_with("sword_swing"):
		return "g_swing"
	if key.begins_with("chain_dash"):
		return "g_chainDash"
	if key.begins_with("voice_") or key == "male_grunt" or key.begins_with("silvertail_"):
		return "g_voice"
	if key.begins_with("fire_magic"):
		return "g_fireMagic"
	if key.begins_with("electric_storm"):
		return "g_eStorm"
	# 원본 순서 보존: death_ghoul*은 앞선 death_* 분기에서 이미 반환한다.
	if key.begins_with("death_ghoul"):
		return "g_ghoul"
	return key


static func limits(is_mobile: bool) -> Dictionary:
	return {
		"active_nodes": 16 if is_mobile else 48,
		"category_per_frame": 1 if is_mobile else 2,
		"samples_per_frame": 3 if is_mobile else 6,
		"proj_nodes": 2 if is_mobile else 5,
		"hit_nodes": 2 if is_mobile else 3,
		"step_nodes": 2
	}


static func skill_keys() -> Array:
	return SKILL_SFX_KEYS.duplicate()
