extends Node2D
## P2-005b — 시작 스킬 발동 1차: 지옥강타 1(giantSlam, Space). 표시+실행 어댑터.
## 이번 범위 = giantSlam 전체. spikeTrap(1)·holyDome(F)·iceOrb(Ctrl)은 다음 차수 —
## 해당 키는 기존대로 무반응 유지(지급·아이콘만, P2-005a).
##
## 원본 근거(game.html):
## - 입력: Space → _dispatchSkillSlot(4,'Space') 13286, 공통 가드 12905~12917
##   (G.on·paused·fallen/dead·스킬 보유). 발동 게이트 13010: ST≥stCost('giantSlam') &&
##   악의≥_malCost(20) && P._gslCd≤0.
## - 비용: stCost 31984 — _COST_BASE.giantSlam=50 × _dpsCostMul(lv1=1) × _stDisc
##   (pAtkCost(pAtk0)=1 × pMeleeStCost(pMelee0)=1) = 50, 캡 min(, mst×0.9).
##   useStPct 31991(P.st-=50). 악의 _malCost(20)=max(1,ceil(20×0.5))=10 (28080~28085),
##   G.mats-=10 (46454).
## - 쿨: P._gslCd=~~(max(60,1800−(lv−1)×12)×(1+_cdRed 0)) = 1800f (46456~46457).
##   쿨 소유 = 원본 P._gslCd — 포트 보관처는 이 어댑터(펫 선례·P dict 비오염 기록).
## - 피해(46464~46470): r=500+(lv−1)×15, rageMul=1+(rage×0.19×…)=1(신규 rage 0 —
##   rage>0 분기(VFX·잔불)는 미이식 기록), dmg=~~(meleeRef×statStr(1)×_skMul('giantSlam')
##   ×rageMul), _SK_MUL giantSlam b20 g19(44509) → lv1 = 20.
## - _gSlamHit(46527~46566): dmg=~~(dmg×pAtkMul)+P._atkBon(스킬 캐스트 직전 0 — weapon
##   스윙이 선행하면 잔류 가능: 미이식 기록) → 적마다 elMul → hurtE(fd, opts
##   {kbMult:0, noPoise:true, noImpact:true}, atkEl=wp().el‖0) → kb+8 → 포이즈:
##   보스=_poiseHit 25%(비도달), 일반몹 stunned=max(,_MINI_STUN 60)(8668),
##   poise≤0이면 풀스턴 min(300,150+(lv−1)×15)×elMul + '체간 붕괴!', 아니면 '미니스턴!'.
## - VFX(46492~46501·56802~56813): 파편 32(파티클 풀 미이식 기록), _gSlamWave
##   {r60→maxR=R×2, 45f}, giantSlam의 영웅 시트 = vfxKind 'inferno' →
##   inferno_slam_impact_sheet.png(1024² 2×2, 45f 4프레임, 'screen' 블렌드,
##   size=maxR×0.9×(.72+.28×min(1,p×3.5)), α 1→(1−p)/.38). 중앙 플래시(56830s) 포함.
## - SFX: SFX.slam 12808 — heavy_hit.mp3 샘플(원본 복사) + WebAudio 합성 3층
##   (playSub/playDist/playNoise — 합성음은 에셋이 아니라 복사 불가, 미이식 기록).
## - 셰이크 G.shake=14×OPT.shake/100 (46495) — state 피드 API 경유.

const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const GSL_ST_COST := 50.0
const GSL_MAL_COST := 10
const GSL_CD_BASE := 1800.0
const GSL_SK_B := 20.0
const GSL_SK_G := 19.0
const MINI_STUN := 60.0
# P2-005c — 가시덫(1)·회복의 영역(F). 원본 근거:
# spikeTrap: 게이트 13021(악의 _malCost(10)=5·_gcCd)·activateSpikeTrap 45508~45521
#   (비용 5·쿨 600f·존 r=300+15(lv−1)·maxT 600·dmg=_spikeTrapDmg 45507 =
#   ~~(magicRef×statInt 1×pMagicMul×_skMul(44522 b14 g11.2)×0.75)·spike_trap.mp3·shake4),
#   존 틱 37413(25f)·37465~37471(hurtE {dot,shieldHit,_lessonAttack}·EL.P·30% melee_hit1·
#   출혈 스택(소비자 미이식 기록)·감속 _spikeSlow=90/lv — enemy.gd 소비 추가)·겹침 캡 1/틱.
#   pillarSpike 합체 분기(45509)는 미보유 기록.
# holyDome: 게이트 13006(_hdCd만)·activateHolyDome 46706~46730(r=500+20lv·dur=720+30lv·
#   쿨 1800f·'🛡 회복의 영역!' #b6ff54·voice_holyDome/2·SFX.pickup=프로시저럴 미이식·shake3),
#   리젠 32706~32709((10+2lv)/60/틱 hp/mp/st — authority 경유), 쿨 2배속 35936~
#   (_hdCdBonus: 영역 안이면 모든 스킬 쿨 틱 2배 — 어댑터 쿨 2종에 적용). 합체 분기 미보유.
const SPIKE_MAL_COST := 5
const SPIKE_CD_BASE := 600.0
const SPIKE_SK_B := 14.0
const SPIKE_SK_G := 11.2
const DOME_CD_BASE := 1800.0

var _main: Node
var _world: Node
var _player: Node2D
var _state: Node
var _configured := false
var gsl_cd := 0.0
var gc_cd := 0.0
var hd_cd := 0.0
var _waves: Array = []
var _zone_parts: Array = [] # 존 시각 파티클(37491s poolPart 상당 — 시각 전용·로컬 난수)
var _visual_rng := RandomNumberGenerator.new()
var _sheet: Texture2D
var _audio: AudioStreamPlayer2D
var _cast_log: Array = []

func configure(main: Node, world: Node, player: Node2D, state: Node) -> bool:
	if _configured or not is_instance_valid(main) or not is_instance_valid(world) \
			or not is_instance_valid(player) or not is_instance_valid(state):
		return false
	if not main.has_method("read_native_attack_parameters") \
			or not state.has_method("apply_native_skill_cast_cost"):
		return false
	_main = main
	_world = world
	_player = player
	_state = state
	z_index = 400
	if ResourceLoader.exists("res://assets/vfx/inferno_slam_impact_sheet.png"):
		_sheet = load("res://assets/vfx/inferno_slam_impact_sheet.png")
	_audio = AudioStreamPlayer2D.new()
	_audio.name = "SlamAudio"
	add_child(_audio)
	if ResourceLoader.exists("res://assets/sfx/skill/heavy_hit.mp3"):
		_audio.stream = load("res://assets/sfx/skill/heavy_hit.mp3")
	_audio.max_distance = 2200.0
	for action_key in [["skill_slot_1", KEY_1], ["area_slot_f", KEY_F]]:
		if not InputMap.has_action(action_key[0]):
			InputMap.add_action(action_key[0])
			var key_event := InputEventKey.new()
			key_event.physical_keycode = action_key[1]
			InputMap.action_add_event(action_key[0], key_event)
	# 56811 'screen' 블렌드: 어두운 배경에서 ADD와 동형(스모크 픽셀 비표시) —
	# normal로 그리면 시트의 어두운 부분까지 보여 분출이 더 넓어 보인다(총괄 지적 b).
	var sheet_material := CanvasItemMaterial.new()
	sheet_material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material = sheet_material
	_configured = true
	return true


func _unhandled_input(event: InputEvent) -> void:
	if not _configured:
		return
	if event.is_action_pressed("rage_slot"):
		cast_giant_slam()
	elif event.is_action_pressed("skill_slot_1"):
		cast_spike_trap()
	elif event.is_action_pressed("area_slot_f"):
		cast_holy_dome()


func _physics_process(_delta: float) -> void:
	if not _configured:
		return
	# 35936~35937: 회복의 영역 안이면 _hdCdBonus=sp — 적용 대상은 cd별로 원본 라인 그대로:
	# 36678 P._gslCd-=sp+_hdCdBonus(가속O) / 36517 P._gcCd-=sp(가속X) /
	# 36679 P._hdCd-=sp(돔 자체 쿨은 가속 안 됨)
	if gsl_cd > 0.0:
		gsl_cd = maxf(0.0, gsl_cd - (1.0 + _holy_dome_cd_bonus()))
	if gc_cd > 0.0:
		gc_cd = maxf(0.0, gc_cd - 1.0)
	if hd_cd > 0.0:
		hd_cd = maxf(0.0, hd_cd - 1.0)
	_tick_fire_zones()
	var write := 0
	for wave in _waves:
		wave["t"] = float(wave["t"]) + 1.0 # 37587: w.t+=sp, r=30+(maxR−30)(t/maxT)
		wave["r"] = 30.0 + (float(wave["maxR"]) - 30.0) * (float(wave["t"]) / float(wave["maxT"]))
		if float(wave["t"]) < float(wave["maxT"]):
			_waves[write] = wave
			write += 1
	_waves.resize(write)
	if not _waves.is_empty() or not _zone_parts.is_empty() or not _read_fire_zones().is_empty():
		queue_redraw()


## Space — 지옥강타 1 (게이트 13010 → activateGiantSlam 46448)
func cast_giant_slam() -> void:
	if get_tree().paused:
		return
	if str(_player.get("state")) == "dead": # 12908 fallen/dead
		return
	var p: Variant = _state.read_current_p()
	if not p is Dictionary:
		return
	var skills: Dictionary = (p as Dictionary).get("skills", {})
	var lv: int = int(skills.get("giantSlam", 0))
	if lv < 1: # 12912 스킬 미보유
		return
	var g: Variant = _state.read_current_g()
	if not g is Dictionary:
		return
	# 13010·46453~46454: 레슨 중(window._parryLesson?.active)엔 악의 게이트·소비 면제.
	# 레슨 flow owner는 읽기 전용(파일 미수정 — p2-001h 소유).
	var lesson_active: bool = _is_parry_lesson_active()
	# 게이트: ST / 악의 / 쿨 (13010) — 부족 showPH 공지는 미이식 기록(무발동만 동일)
	if float(_player.get("stamina")) < GSL_ST_COST 			or (not lesson_active and int(g.get("mats", 0)) < GSL_MAL_COST) or gsl_cd > 0.0:
		_cast_log.append({"rejected": true, "st": _player.get("stamina"), "mats": g.get("mats"), "cd": gsl_cd})
		return
	var parameters: Dictionary = _main.read_native_attack_parameters()
	if parameters.get("ready") != true: # 공급자 NOT_READY → 정지(폴백 금지)
		_cast_log.append({"halt": "attack_parameters_not_ready"})
		return
	# 비용 (46454): useStPct('giantSlam') + G.mats −= _malCost(20)
	var stamina_spend: Dictionary = _main.get("source_resources").commit_native_skill_stamina_spend(_main, GSL_ST_COST)
	if stamina_spend.get("accepted") != true:
		_cast_log.append({"halt": "stamina_spend_rejected"})
		return
	if not lesson_active: # 46454 if(!_parryLesson?.active)G.mats-=_malCost(20)
		var mats_spend: Dictionary = _state.apply_native_skill_cast_cost(_main, GSL_MAL_COST)
		if mats_spend.get("applied") != true:
			_cast_log.append({"halt": "mats_spend_rejected"})
			return
	gsl_cd = floor(maxf(60.0, GSL_CD_BASE - float(lv - 1) * 12.0)) # ×(1+_cdRed 0)
	# 피해식 (46464~46470): rage 0 → rageMul 1 (rage>0 분기 미이식 기록)
	var sk_mul: float = GSL_SK_B + float(lv - 1) * GSL_SK_G * 0.5 # 44556·44509
	var base_dmg: int = NORMAL_HURTE.FORMULA.js_to_int32(float(parameters["melee_ref"]) * 1.0 * sk_mul * 1.0)
	var radius: float = 500.0 + float(lv - 1) * 15.0
	# _gSlamHit (46527): ×pAtkMul + _atkBon(0 — 기록)
	var hit_dmg: int = NORMAL_HURTE.FORMULA.js_to_int32(float(base_dmg) * float(parameters["p_atk_mul"]))
	var atk_el: int = 0 # wp().el‖0 — 시작 '녹슨 검' el 0 (물리 고정 15877)
	var hits := 0
	for enemy in _world.get_enemies():
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue
		var d: float = _player.global_position.distance_to(enemy.global_position)
		var enemy_r: float = float(enemy.get("radius"))
		if d > radius + enemy_r: # stunRange=range 동일 (46528)
			continue
		var ang: float = (enemy.global_position - _player.global_position).angle()
		# elMul(0, e.el)=1 — 물리 무배율(비交차 검증은 hurtE 내부 elMul 저널)
		var outcome: Dictionary = NORMAL_HURTE.new().execute(_main, _world, enemy, hit_dmg, ang, atk_el,
			{"kbMult": 0.0, "noPoise": true, "noImpact": true, "_lessonAttack": "giantSlam"})
		outcome["enemy_id"] = enemy.get_instance_id()
		outcome["base_damage"] = hit_dmg
		outcome["source"] = "giantSlam"
		if _player.has_signal("telemetry_event"):
			_player.telemetry_event.emit("native_hurte", outcome)
		hits += 1
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue # 46550: 죽었으면 스턴 스킵
		enemy.add_native_knockback(Vector2.from_angle(ang) * 8.0) # 46548 kb+8
		# 일반몹 포이즈 (46555~46564) — 보스(e.ib) 경로는 1장 첫 전투 비도달(기록)
		enemy.apply_native_normal_enemy_field_write("stunned", MINI_STUN)
		if float(enemy.get("poise")) <= 0.0:
			var stun: float = minf(300.0, 150.0 + float(lv - 1) * 15.0) # ×elMul(1)
			enemy.apply_native_normal_enemy_field_write("stunned", stun)
			_emit_text(enemy.global_position + Vector2(0, -18), "💥 체간 붕괴!", "#ffcc00", 45)
		else:
			_emit_text(enemy.global_position + Vector2(0, -18), "💫 미니스턴!", "#ffaa00", 30)
	# 셰이크(46495 G.shake=14×OPT.shake/100 → 기존 피드 API: shake(18) _gSlamHit 말미 포함 — 큰 값 적용)
	if _state.has_method("apply_native_hurte_hit_feel"):
		_state.apply_native_hurte_hit_feel(_main, 80.0)
	# 웨이브 + 영웅 시트 (46501: r60→maxR=R×2·45f, vfxKind 'inferno')
	_waves.append({"x": _player.global_position.x, "y": _player.global_position.y,
		"r": 60.0, "maxR": radius * 2.0, "t": 0.0, "maxT": 45.0})
	_audio.global_position = _player.global_position
	_audio.pitch_scale = 0.8 + (randf() - 0.5) * 2.0 * 0.06 # _r(.8,.06) — 비게임플레이 오디오 지터
	_audio.volume_db = 0.0
	_audio.play() # SFX.slam: heavy_hit 샘플(합성 3층은 미이식 기록)
	_cast_log.append({"lv": lv, "dmg": hit_dmg, "radius": radius, "hits": hits, "cd": gsl_cd})
	queue_redraw()


## 1 — 가시덫 (게이트 13021 → activateSpikeTrap 45508)
func cast_spike_trap() -> void:
	if get_tree().paused or str(_player.get("state")) == "dead":
		return
	var p: Variant = _state.read_current_p()
	if not p is Dictionary:
		return
	var lv: int = int((p as Dictionary).get("skills", {}).get("spikeTrap", 0))
	if lv < 1:
		return
	var g: Variant = _state.read_current_g()
	if not g is Dictionary or int(g.get("mats", 0)) < SPIKE_MAL_COST or gc_cd > 0.0: # 45510
		_cast_log.append({"skill": "spikeTrap", "rejected": true})
		return
	var parameters: Dictionary = _main.get("source_providers").get_provider_bundle()
	var magic_ref: Dictionary = parameters.reference.magic_ref()
	var magic_mul: Dictionary = parameters.formula.p_magic_mul()
	if magic_ref.get("status") != "READY" or magic_mul.get("status") != "READY":
		_cast_log.append({"skill": "spikeTrap", "halt": "magic_providers_not_ready"})
		return
	if _state.apply_native_skill_cast_cost(_main, SPIKE_MAL_COST).get("applied") != true: # 45512
		return
	gc_cd = SPIKE_CD_BASE # ×(1+_cdRed 0)
	var sk_mul: float = SPIKE_SK_B + float(lv - 1) * SPIKE_SK_G * 0.5 # 44556·44522
	var dmg: int = NORMAL_HURTE.FORMULA.js_to_int32(float(magic_ref.value) * 1.0 * float(magic_mul.value) * sk_mul * 0.75) # 45507
	if not _push_fire_zone({"type": "spikeTrap", "x": _player.global_position.x, "y": _player.global_position.y,
			"r": 300.0 + float(lv - 1) * 15.0, "t": 0.0, "maxT": 600.0, "dmg": dmg, "el": 0, "lv": lv,
			"_tickTimer": 0.0}): # 45517 push {el:EL.P}
		_cast_log.append({"skill": "spikeTrap", "halt": "fire_zone_commit_rejected"})
		return
	if ResourceLoader.exists("res://assets/sfx/skill/spike_trap.mp3"):
		# 45519 playSample('spike_trap',.8,_r(1,.08)) — vol .8=-1.94dB·pitch 1±.08
		_play_sample("res://assets/sfx/skill/spike_trap.mp3", _player.global_position,
			1.0 + (randf() - 0.5) * 0.16, linear_to_db(0.8))
	_state.apply_native_skill_shake(_main, 4.0) # 45520 shake(4)
	_cast_log.append({"skill": "spikeTrap", "lv": lv, "dmg": dmg, "cd": gc_cd})
	queue_redraw()


## F — 회복의 영역 (게이트 13006 → activateHolyDome 46706)
func cast_holy_dome() -> void:
	if get_tree().paused or str(_player.get("state")) == "dead":
		return
	var p: Variant = _state.read_current_p()
	if not p is Dictionary:
		return
	var lv: int = int((p as Dictionary).get("skills", {}).get("holyDome", 0))
	if lv < 1 or hd_cd > 0.0: # 13006: 쿨만 — 자원 비용 없음
		if hd_cd > 0.0:
			_cast_log.append({"skill": "holyDome", "rejected": true})
		return
	hd_cd = DOME_CD_BASE # 46711 P._hdCd=1800 (고정 — _cdRed 없음)
	if not _push_fire_zone({"type": "holyDome", "x": _player.global_position.x, "y": _player.global_position.y,
			"r": 500.0 + float(lv) * 20.0, "t": 0.0, "maxT": 720.0 + float(lv) * 30.0, "lv": lv}): # 46709~46713
		_cast_log.append({"skill": "holyDome", "halt": "fire_zone_commit_rejected"})
		return
	_emit_text(_player.global_position + Vector2(0, -30), "🛡 회복의 영역!", "#b6ff54", 50) # 46728
	var voice := "res://assets/sfx/skill/voice_holyDome%s.mp3" % ("" if randf() < 0.5 else "2")
	if ResourceLoader.exists(voice):
		_play_sample(voice, _player.global_position, 1.0) # 46725 playSample(voice,1,1)
	_state.apply_native_skill_shake(_main, 3.0) # 46730 shake(3) — 합체 미보유라 5 분기 없음
	# SFX.pickup은 프로시저럴 합성음(10368)·addParts 15입자(46730)는 미이식 기록.
	_cast_log.append({"skill": "holyDome", "lv": lv, "cd": hd_cd})
	queue_redraw()


func _read_fire_zones() -> Array:
	var g: Variant = _state.read_current_g()
	if g is Dictionary and (g as Dictionary).get("_fireZones") is Array:
		return (g as Dictionary)["_fireZones"]
	return []


func _push_fire_zone(zone: Dictionary) -> bool:
	# 45516/46712: if(!G._fireZones)G._fireZones=[] — lazy 생성 후 push
	var zones: Array = _read_fire_zones()
	zones.append(zone)
	return _state.commit_native_fire_zones(_main, zones)


func _holy_dome_cd_bonus() -> float:
	# 35936: G._fireZones 중 holyDome 안이면 _hdCdBonus=sp(1)
	if not is_instance_valid(_player):
		return 0.0
	for zone in _read_fire_zones():
		if zone is Dictionary and zone.get("type") == "holyDome" \
				and _player.global_position.distance_to(Vector2(float(zone.get("x", 0)), float(zone.get("y", 0)))) < float(zone.get("r", 0)):
			return 1.0
	return 0.0


func _tick_fire_zones() -> void:
	# 37389s: fz.t+=sp → 만료 drop(compaction) → DOT 틱 타이머(_fzTick=25 spikeTrap).
	# 이 어댑터가 포트의 존 clock owner(스킬 슬롯 소유 존만 존재 — holyDome은 리젠/쿨 소비자가 읽기만).
	var zones: Array = _read_fire_zones()
	if zones.is_empty():
		return
	var write := 0
	var changed := false
	for zone in zones:
		if not zone is Dictionary:
			continue
		zone["t"] = float(zone.get("t", 0)) + 1.0
		changed = true
		if float(zone["t"]) >= float(zone.get("maxT", 0)): # 만료 drop
			continue
		if zone.get("type") == "spikeTrap":
			zone["_tickTimer"] = float(zone.get("_tickTimer", 0)) + 1.0 # 37414s fz._tickTimer+=sp
			if float(zone["_tickTimer"]) >= 25.0:
				zone["_tickTimer"] = float(zone["_tickTimer"]) - 25.0
				_spike_trap_tick(zone)
		zones[write] = zone
		write += 1
	zones.resize(write)
	if changed:
		_state.commit_native_fire_zones(_main, zones)
	_spawn_zone_particles(zones)


func _spawn_zone_particles(zones: Array) -> void:
	# 37491 간헐 파티클: 존마다 매 프레임 30%(spikeTrap)·37256 25%(holyDome). 시각 전용 로컬 난수.
	for zone in zones:
		if not zone is Dictionary:
			continue
		var cx: float = float(zone.get("x", 0))
		var cy: float = float(zone.get("y", 0))
		var zr: float = float(zone.get("r", 0))
		if zone.get("type") == "spikeTrap":
			if _visual_rng.randf() > 0.7: # 37491
				var a: float = _visual_rng.randf() * TAU
				var d: float = _visual_rng.randf() * zr
				_zone_parts.append({"x": cx + cos(a) * d, "y": cy + sin(a) * d,
					"vx": (_visual_rng.randf() - 0.5) * 0.8, "vy": -0.3 - _visual_rng.randf() * 0.5,
					"col": Color("886633") if _visual_rng.randf() > 0.5 else Color("667744"),
					"sz": 1.0 + _visual_rng.randf() * 2.0, "life": 8.0 + _visual_rng.randf() * 6.0, "max": 14.0})
				if _visual_rng.randf() > 0.7: # 37551 추가 #aa4422
					_zone_parts.append({"x": cx + (_visual_rng.randf() - 0.5) * zr, "y": cy + (_visual_rng.randf() - 0.5) * zr,
						"vx": 0.0, "vy": -0.5 - _visual_rng.randf() * 0.8,
						"col": Color("aa4422"), "sz": 1.0 + _visual_rng.randf(),
						"life": 6.0 + _visual_rng.randf() * 4.0, "max": 10.0})
		elif zone.get("type") == "holyDome":
			if _visual_rng.randf() > 0.75: # 37256
				var a2: float = _visual_rng.randf() * TAU
				var d2: float = _visual_rng.randf() * zr
				_zone_parts.append({"x": cx + cos(a2) * d2, "y": cy + sin(a2) * d2,
					"vx": (_visual_rng.randf() - 0.5) * 0.8, "vy": -0.8 - _visual_rng.randf() * 1.2,
					"col": Color("b6ff54"), "sz": 1.0 + _visual_rng.randf() * 2.0,
					"life": 12.0 + _visual_rng.randf() * 10.0, "max": 22.0})
	var write := 0
	for part in _zone_parts:
		part["life"] = float(part["life"]) - 1.0
		if float(part["life"]) <= 0.0:
			continue
		part["x"] = float(part["x"]) + float(part["vx"])
		part["y"] = float(part["y"]) + float(part["vy"])
		_zone_parts[write] = part
		write += 1
	_zone_parts.resize(write)


func _spike_trap_tick(zone: Dictionary) -> void:
	# 37418~37473: 겹침 캡(틱당 1회/타입)·hurtE {dot,shieldHit}·EL.P·출혈/감속
	var center := Vector2(zone["x"], zone["y"])
	for enemy in _world.get_enemies():
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue
		if center.distance_to(enemy.global_position) > float(zone["r"]):
			continue
		# 캡: 같은 타입 존 중복 틱 방지 — 단일 존 시전만 가능(쿨 600>지속 600 동시 1개)이라 생략 기록
		if randf() < 0.3 and ResourceLoader.exists("res://assets/sfx/skill/melee_hit1.mp3"): # 37467
			_play_sample("res://assets/sfx/skill/melee_hit1.mp3", enemy.global_position, 1.2 + (randf() - 0.5) * 0.3, -12.0)
		var ang: float = (enemy.global_position - center).angle()
		var outcome: Dictionary = NORMAL_HURTE.new().execute(_main, _world, enemy, int(zone["dmg"]), ang, 0,
			{"dot": true, "shieldHit": true, "_lessonAttack": "spikeTrap"})
		outcome["enemy_id"] = enemy.get_instance_id()
		outcome["base_damage"] = int(zone["dmg"])
		outcome["source"] = "spikeTrap"
		if _player.has_signal("telemetry_event"):
			_player.telemetry_event.emit("native_hurte", outcome)
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue
		# 37469 출혈 스택: bleed DOT 소비자 미이식 — 기록(스택 기록도 생략: 가짜 상태 방지)
		# 37470: 첫 적용(_spikeSlow<=0)일 때만 '🌿N%' 텍스트 — slowPct=min(.95,.91+.02(lv−1))
		if float(enemy.get("_spike_slow")) <= 0.0:
			var slow_pct: float = minf(0.95, 0.91 + 0.02 * float(int(zone["lv"]) - 1))
			_emit_text(enemy.global_position + Vector2(0, -15), "🌿%d%%" % int(slow_pct * 100.0), "#66aa44", 25)
		# 37471~37472 감속: e._spikeSlow=max(,90)·_spikeSlowLv=lv
		enemy.apply_native_normal_enemy_field_write("spike_slow", [90.0, int(zone["lv"])])


func _play_sample(path: String, pos: Vector2, pitch: float, volume_db: float = 0.0) -> void:
	var one_shot := AudioStreamPlayer2D.new()
	add_child(one_shot)
	one_shot.stream = load(path)
	one_shot.global_position = pos
	one_shot.pitch_scale = pitch
	one_shot.volume_db = volume_db
	one_shot.max_distance = 2200.0
	one_shot.finished.connect(one_shot.queue_free)
	one_shot.play()


## 레슨 활성 읽기 전용 getter — main.source_intro_sequence.lesson_flow.active
## (native_parry_lesson_flow.gd 19 — 파일 미수정, 인트로 부팅 경로에만 설치됨)
func _is_parry_lesson_active() -> bool:
	var seq: Variant = _main.get("source_intro_sequence")
	if seq is Node and is_instance_valid(seq):
		var flow: Variant = (seq as Node).get("lesson_flow")
		if flow is Node and is_instance_valid(flow):
			return (flow as Node).get("active") == true
	return false


func _emit_text(pos: Vector2, text: String, color: String, life: int) -> void:
	var adapter: Variant = _world.get_node_or_null("NativeFloatingText")
	if adapter != null and adapter.has_method("emit_native_text"):
		adapter.emit_native_text(pos.x, pos.y, text, color, life)


func _draw() -> void:
	# 존 시각 — 원본은 링 없음: 간헐 파티클만(37491 spikeTrap 갈/녹 가시·37256 holyDome
	# #b6ff54 상승 입자). 파티클 풀 상당 리스트를 틱에서 생성·여기서 그림(시각 전용 로컬 난수).
	for part in _zone_parts:
		var part_col: Color = part["col"]
		part_col.a = clampf(float(part["life"]) / float(part["max"]), 0.0, 1.0)
		draw_circle(Vector2(part["x"], part["y"]) - global_position, float(part["sz"]), part_col)
	# 56802~56813 영웅 시트(2×2 512 셀) + 56830s 중앙 플래시
	if _sheet == null:
		return
	for wave in _waves:
		var p: float = float(wave["t"]) / float(wave["maxT"])
		var frame: int = mini(3, int(p * 4.0))
		var grow: float = 0.72 + 0.28 * minf(1.0, p * 3.5)
		var size: float = float(wave["maxR"]) * 0.9 * grow
		var alpha: float = 1.0 if p < 0.62 else maxf(0.0, (1.0 - p) / 0.38)
		var src := Rect2((frame % 2) * 512, (frame / 2) * 512, 512, 512)
		var center := Vector2(wave["x"], wave["y"]) - global_position
		# 'screen' 블렌드 — Canvas2D 실측 경로. CanvasItem 근사: additive 질감(기록).
		draw_texture_rect_region(_sheet, Rect2(center - Vector2(size, size) / 2.0, Vector2(size, size)),
			src, Color(1, 1, 1, alpha))
		var flash_p: float = maxf(0.0, 1.0 - p * 4.0)
		if flash_p > 0.0:
			draw_circle(center, float(wave["maxR"]) * 0.4 * flash_p, Color(1.0, 0.9, 0.6, 0.5 * flash_p))


## HUD 쿨다운 sweep 공급자 (44136 _skCdSweep: pct=cd/base, 텍스트 (cd/60).toFixed(1)+'s')
func read_native_slot_cooldowns() -> Dictionary:
	var out: Dictionary = {}
	if gsl_cd > 0.0:
		out["skSlot1"] = {"pct": clampf(gsl_cd / GSL_CD_BASE, 0.0, 1.0), "text": "%.1fs" % (gsl_cd / 60.0)}
	if gc_cd > 0.0:
		out["qs0"] = {"pct": clampf(gc_cd / SPIKE_CD_BASE, 0.0, 1.0), "text": "%.1fs" % (gc_cd / 60.0)}
	if hd_cd > 0.0:
		out["qs5"] = {"pct": clampf(hd_cd / DOME_CD_BASE, 0.0, 1.0), "text": "%.1fs" % (hd_cd / 60.0)}
	return out


func get_native_skill_slots_snapshot() -> Dictionary:
	return {"configured": _configured, "gsl_cd": gsl_cd, "gc_cd": gc_cd, "hd_cd": hd_cd,
		"zones": _read_fire_zones().duplicate(true), "waves": _waves.size(),
		"cast_log": _cast_log.duplicate(true),
		"implemented": ["giantSlam(Space)", "spikeTrap(1)", "holyDome(F)"],
		"unported": ["iceOrb(Ctrl) 발동(다음 차수 — 키 무반응 유지)",
			"spikeTrap 출혈 스택(소비자 미이식)·겹침 캡(동시 1존만 가능)·pillarSpike 분기",
			"holyDome SFX.pickup(프로시저럴)·addParts 시전입자·합체(holyFuse/holyIce 등) 분기",
			"showPH 부족 공지(ST/악의 — 무발동 동일)", "rage>0 분기(피해 배율·분노 VFX·잔불 — 신규 rage 0)",
			"P._atkBon 이월(+~~(cost×1.5) — 직전 weapon 스윙 보너스)", "보스 _poiseHit 25% 경로(비도달)",
			"파편 파티클 32(파티클 풀)·crater 폴백", "SFX.slam 합성 3층(playSub/Dist/Noise — 샘플만 복사)",
			"'screen' 블렌드 정확 재현(가산 근사)", "_detonateAssaultFlames·slamStorm/pillarSlam 합체 분기(미보유)"]}
