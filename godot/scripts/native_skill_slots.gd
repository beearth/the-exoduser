extends Node2D
## DEMO11-16 — 실제 슬롯 선택→기존 4cast. 비용 quote/commit 및 HUD 쿨은 단일 owner.
## 미보유 실행자(ULT/보호 active 포함)는 명시 인터페이스 요청으로 거절한다.
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

const DISPATCH = preload("res://scripts/native_skill_dispatch.gd")
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
# P2-005d — 얼음보주(Ctrl). 원본 근거:
# 게이트 12916~12923(_ioActive 중 타 스킬 차단·재입력=파쇄·mp>=mpCost·_ioCd)·
# activateIceOrb 46756~46764(_ioBon=useMp×2·_ioActive/_ioT/_ioX/Y·P.s='iceOrb'·
# ice_storm(.6,2.0)·addParts 12 #aaeeff·shake4)·업데이트 36691~36695(_ioT 틱·40% 입자·
# 120f 자동 파쇄; Shift 블링크 탈출 36696~36706은 미이식 기록)·쿨 감소 36687(+_hdCdBonus)·
# activateIceShatter 46766~46822(칼날 4+lv×4·baseDmg=~~(magicRef×statInt×pMagicMul×
# _skMul(44511 b8 g6.4))+_ioBon·칼날 30%·스폰R=(P.r+32)×(1+(lv−1)×.1)·파쇄AoE r=100+5lv·
# 30%·파쇄 24+16 입자·VFX ice_orb 정순 0→8·'❄ 파쇄!'·shake10·쿨 max(600,1200−60(lv−1)))·
# 칼날 비행 35177s(직진·유도 제외 35186·벽 반사 magic≤3회 35238~·maxDist 3000)·
# 칼날 히트 35399s(dmg=~~(p.dmg×elMul)→hurtE(,,false,p,EL.I)·chain_fly(.3)·
# 35581~35585: 비보스 stunned max(,30)·_iceShardRes+0.10·관통 95% 확률)·
# 렌더 59452~(삼각 칼날 4층+엣지)·58302~(보주 시트 형성 46746 8×(1−t/60) 보간·2층 블렌드).
const ICE_COST_BASE := 50.0 # 31964 _COST_BASE.iceOrb
const ICE_COST_DPS := 0.35 # 31978 _COST_DPS.iceOrb
const ICE_SK_B := 8.0 # 44511
const ICE_SK_G := 6.4

var _main: Node
var _world: Node
var _player: Node2D
var _state: Node
var _configured := false
var gsl_cd := 0.0
var gc_cd := 0.0
var hd_cd := 0.0
var io_cd := 0.0
var _io_cd_max := 1200.0
var _io_active := false
var _io_t := 0.0
var _io_bon := 0
var _io_pos := Vector2.ZERO
var _io_lv := 1
var _blades: Array = [] # 원본 pProjs의 iceBlade 패킷 — 포트 보관처=어댑터(흡수계 등 상호작용 시스템 이식 시 store 이관 기록)
var _blade_rng := RandomNumberGenerator.new() # 원본 Math.random(비추적) 상당 — 각도 지터·관통 롤
var _shatter_anims: Array = []
var _ice_sheet: Texture2D
var _finish_layer: Node2D
var _ice_layer: Node2D
var _ring_sprites: Array[Sprite2D]=[]
var _ring_index:=0
var _crack_points:=PackedVector2Array([Vector2.ZERO,Vector2.ZERO,Vector2.ZERO])
var _add_layer: Node2D
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
	for action_key in [["skill_slot_1", KEY_1], ["skill_slot_2", KEY_2], ["skill_slot_3", KEY_3], ["skill_slot_4", KEY_4], ["area_slot_f", KEY_F], ["ct_slot", KEY_CTRL], ["ult_slot", KEY_Z]]:
		if not InputMap.has_action(action_key[0]):
			InputMap.add_action(action_key[0])
			var key_event := InputEventKey.new()
			key_event.physical_keycode = action_key[1]
			InputMap.action_add_event(action_key[0], key_event)
	if ResourceLoader.exists("res://assets/vfx/vfx_ice_orb.png"):
		_ice_sheet = load("res://assets/vfx/vfx_ice_orb.png") # 19355 registerVFX 768² 9프레임 3열
	# 56811 'screen'/'lighter' 블렌드는 ADD 전용 자식 레이어로 분리 — 파티클·칼날·플래시는
	# 원본 source-over라 부모(normal)에 그린다(총괄 지적 b의 ADD는 시트에만 적용).
	_add_layer = AdditiveLayer.new()
	_add_layer.host = self
	var sheet_material := CanvasItemMaterial.new()
	sheet_material.blend_mode = CanvasItemMaterial.BLEND_MODE_MIX
	_add_layer.material = sheet_material
	add_child(_add_layer)
	_finish_layer=AdditiveLayer.new();_finish_layer.host=self;_finish_layer.mode=1;add_child(_finish_layer)
	var shader_:=Shader.new();shader_.code=preload("res://scripts/boss11_source_ground.gd").FX_SHADER
	var gradient_:=Gradient.new();gradient_.colors=PackedColorArray([Color.WHITE,Color.WHITE])
	var white:=GradientTexture2D.new();white.gradient=gradient_;white.width=2;white.height=2
	for i in 6:
		var ring:=Sprite2D.new();ring.texture=white;ring.physics_interpolation_mode=Node.PHYSICS_INTERPOLATION_MODE_OFF
		var material_:=ShaderMaterial.new();material_.shader=shader_;ring.material=material_
		_finish_layer.add_child(ring);ring.hide();_ring_sprites.append(ring)
	_ice_layer=AdditiveLayer.new();_ice_layer.host=self;_ice_layer.mode=2;_finish_layer.add_child(_ice_layer)
	_configured = true
	return true


class AdditiveLayer extends Node2D:
	var host: Node2D
	var mode:=0
	func _draw() -> void:
		if is_instance_valid(host):
			if mode==1:host._draw_source_slam_finish(self)
			elif mode==2:host._draw_source_ice_finish(self)
			else:host._draw_additive_content(self)


func _unhandled_input(event: InputEvent) -> void:
	if not _configured or (event is InputEventKey and event.echo): return
	for action in {"rage_slot":"Space","skill_slot_1":"1","skill_slot_2":"2","skill_slot_3":"3","skill_slot_4":"4","area_slot_f":"F","ct_slot":"Ctrl","ult_slot":"Z"}:
		if event.is_action_pressed(action):
			dispatch_native_slot({"rage_slot":"Space","skill_slot_1":"1","skill_slot_2":"2","skill_slot_3":"3","skill_slot_4":"4","area_slot_f":"F","ct_slot":"Ctrl","ult_slot":"Z"}[action])
			return

signal native_dispatch_observed(slot_key: String, result: Dictionary)

func dispatch_native_slot(slot_key: String) -> Dictionary:
	var result := _dispatch_native_slot_owned(slot_key)
	native_dispatch_observed.emit(slot_key, result.duplicate(true))
	return result

func _dispatch_native_slot_owned(slot_key: String) -> Dictionary:
	if not _configured or get_tree().paused: return {"accepted":false,"reason":"dispatcher_not_configured_or_paused"}
	var p: Variant = _state.read_current_p()
	var g: Variant = _state.read_current_g()
	if not p is Dictionary or not g is Dictionary: return {"accepted":false,"reason":"current_state_unready"}
	var route: Dictionary = DISPATCH.select(slot_key,p,g,str(_player.get("state")),_io_active)
	if not route.accepted:
		_cast_log.append({"dispatch":route.duplicate(true)})
		return route
	var before: int = _cast_log.size()
	call(route.method)
	var committed: bool = _cast_log.size() > before and not _cast_log.back().has("rejected") and not _cast_log.back().has("halt")
	return {"accepted":committed,"skill":route.skill,"slot":slot_key,"reason":"" if committed else "cast_gate_refused"}

func _skill_quote(sid: String, lv: int, p: Dictionary) -> Dictionary:
	return DISPATCH.quote(sid,lv,p,_main.read_native_skill_dispatch_cost_context(),_is_parry_lesson_active())

func _commit_skill_quote(q: Dictionary) -> Dictionary:
	if q.get("ready") != true: return {"accepted":false}
	return _state.commit_native_skill_dispatch_cost(_main,q.st,q.mp,q.mats)


func _demo47i_physics_body(_delta: float) -> void:
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
	if io_cd > 0.0:
		io_cd = maxf(0.0, io_cd - (1.0 + _holy_dome_cd_bonus())) # 36687 P._ioCd-=sp+_hdCdBonus
	if _io_active: # 36691~36695
		_io_t += 1.0
		if _visual_rng.randf() > 0.6: # 36694 얼음 입자 (시각 전용)
			var orb_a: float = _visual_rng.randf() * TAU
			_zone_parts.append({"x": _player.global_position.x + cos(orb_a) * 25.0,
				"y": _player.global_position.y + sin(orb_a) * 25.0,
				"vx": (_visual_rng.randf() - 0.5) * 1.5, "vy": -1.0 - _visual_rng.randf(),
				"col": Color("88ddff"), "sz": 2.0 + _visual_rng.randf() * 2.0,
				"life": 12.0 + _visual_rng.randf() * 8.0, "max": 20.0})
		if _io_t >= 120.0: # 36695 — 2초 자동 파쇄 (Shift 블링크 탈출 36696~은 미이식 기록)
			activate_ice_shatter()
	_update_ice_blades()
	var anim_write := 0
	for anim in _shatter_anims: # 46811 frameTime 13 × 9프레임 정순
		anim["t"] = float(anim["t"]) + 1.0
		if float(anim["t"]) < 13.0 * 9.0:
			_shatter_anims[anim_write] = anim
			anim_write += 1
	_shatter_anims.resize(anim_write)
	_tick_fire_zones()
	var write := 0
	for wave in _waves:
		wave["t"] = float(wave["t"]) + 1.0 # 37587: w.t+=sp, r=30+(maxR−30)(t/maxT)
		wave["r"] = 30.0 + (float(wave["maxR"]) - 30.0) * (float(wave["t"]) / float(wave["maxT"]))
		if float(wave["t"]) < float(wave["maxT"]):
			_waves[write] = wave
			write += 1
	_waves.resize(write)
	if not _waves.is_empty() or not _zone_parts.is_empty() or not _read_fire_zones().is_empty() \
			or _io_active or not _blades.is_empty() or not _shatter_anims.is_empty():
		queue_redraw()
		if is_instance_valid(_add_layer):
			_add_layer.queue_redraw()
		_finish_layer.queue_redraw();_ice_layer.queue_redraw()


## Space — 지옥강타 1 (게이트 13010 → activateGiantSlam 46448)
func cast_giant_slam() -> void:
	if get_tree().paused:
		return
	if str(_player.get("state")) == "dead": # 12908 fallen/dead
		return
	if _io_active: # 12917 얼음보주 안: iceOrb 외 모든 스킬 차단 (showPH 토스트 미이식 기록)
		_cast_log.append({"skill": "giantSlam", "rejected": true, "reason": "ice_orb_active"})
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
	var quote: Dictionary = _skill_quote("giantSlam",lv,p)
	if not quote.get("ready",false) or float(_player.get("stamina")) < float(quote.get("st",0)) or (not lesson_active and int(g.get("mats",0)) < int(quote.get("mats",0))) or gsl_cd > 0.0:
		_cast_log.append({"rejected":true,"reason":"cost_or_cooldown"})
		return
	var parameters: Dictionary = _main.read_native_attack_parameters()
	if parameters.get("ready") != true: # 공급자 NOT_READY → 정지(폴백 금지)
		_cast_log.append({"halt": "attack_parameters_not_ready"})
		return
	if _commit_skill_quote(quote).get("accepted") != true:
		_cast_log.append({"halt":"cost_commit_rejected"})
		return
	gsl_cd = quote.cd
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
	_play_sample("res://assets/sfx/skill/heavy_hit.mp3",_audio.global_position,_audio.pitch_scale,0.0) # DEMO11-40 sole consumer
	_cast_log.append({"lv": lv, "dmg": hit_dmg, "radius": radius, "hits": hits, "cd": gsl_cd})
	queue_redraw()


## 1 — 가시덫 (게이트 13021 → activateSpikeTrap 45508)
func cast_spike_trap() -> void:
	if get_tree().paused or str(_player.get("state")) == "dead":
		return
	if _io_active: # 12917 얼음보주 안: iceOrb 외 모든 스킬 차단 (showPH 토스트 미이식 기록)
		_cast_log.append({"skill": "spikeTrap", "rejected": true, "reason": "ice_orb_active"})
		return
	var p: Variant = _state.read_current_p()
	if not p is Dictionary:
		return
	var lv: int = int((p as Dictionary).get("skills", {}).get("spikeTrap", 0))
	if lv < 1:
		return
	var g: Variant = _state.read_current_g()
	var quote: Dictionary = _skill_quote("spikeTrap",lv,p)
	if not quote.get("ready",false) or not g is Dictionary or int(g.get("mats", 0)) < int(quote.get("mats",0)) or gc_cd > 0.0: # 45510
		_cast_log.append({"skill": "spikeTrap", "rejected": true})
		return
	var parameters: Dictionary = _main.get("source_providers").get_provider_bundle()
	var magic_ref: Dictionary = parameters.reference.magic_ref()
	var magic_mul: Dictionary = parameters.formula.p_magic_mul()
	if magic_ref.get("status") != "READY" or magic_mul.get("status") != "READY":
		_cast_log.append({"skill": "spikeTrap", "halt": "magic_providers_not_ready"})
		return
	if _commit_skill_quote(quote).get("accepted") != true: # 45512
		return
	gc_cd = quote.cd # 45514: source cd reduction
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
	if _io_active: # 12917 얼음보주 안: iceOrb 외 모든 스킬 차단 (showPH 토스트 미이식 기록)
		_cast_log.append({"skill": "holyDome", "rejected": true, "reason": "ice_orb_active"})
		return
	var p: Variant = _state.read_current_p()
	if not p is Dictionary:
		return
	var lv: int = int((p as Dictionary).get("skills", {}).get("holyDome", 0))
	if lv < 1 or hd_cd > 0.0: # 13006: 쿨만 — 자원 비용 없음
		if hd_cd > 0.0:
			_cast_log.append({"skill": "holyDome", "rejected": true})
		return
	var quote: Dictionary = _skill_quote("holyDome",lv,p)
	if _commit_skill_quote(quote).get("accepted") != true: return
	hd_cd = quote.cd # 46711 P._hdCd=1800 (고정 — _cdRed 없음)
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
	if is_instance_valid(_main) and _main.has_method("request_native_skill_sample"):
		_main.request_native_skill_sample(path,db_to_linear(volume_db),pitch)


## Ctrl — 얼음보주 (게이트 12922 → activateIceOrb 46756)
func cast_ice_orb() -> void:
	if get_tree().paused or str(_player.get("state")) == "dead":
		return
	var p: Variant = _state.read_current_p()
	if not p is Dictionary:
		return
	var lv: int = int((p as Dictionary).get("skills", {}).get("iceOrb", 0))
	if lv < 1:
		return
	var quote: Dictionary = _skill_quote("iceOrb",lv,p)
	if not quote.get("ready",false) or float(p.get("mp",0)) < float(quote.get("mp",0)) or io_cd > 0.0:
		_cast_log.append({"skill":"iceOrb","rejected":true})
		return
	# State mutation must be admissible before any resource is spent.
	if str(_player.get("state")) != "idle":
		_cast_log.append({"skill":"iceOrb","rejected":true,"reason":"player_state_not_idle"})
		return
	var mp_cost: int = int(quote.mp)
	var spend: Dictionary = _commit_skill_quote(quote)
	if spend.get("accepted") != true:
		_cast_log.append({"skill":"iceOrb","halt":"cost_commit_rejected"})
		return
	if not _player.set_native_ice_orb_state(true): # 46758~46759 P.s='iceOrb'
		_cast_log.append({"skill": "iceOrb", "halt": "player_state_not_idle"})
		return
	_io_bon = int(float(spend.get("mp_spent", 0)) * 2.0) # 46757 _ioBon=useMp×2
	_io_active = true
	_io_t = 0.0
	_io_pos = _player.global_position
	_io_lv = lv
	if ResourceLoader.exists("res://assets/sfx/skill/ice_storm.mp3"):
		_play_sample("res://assets/sfx/skill/ice_storm.mp3", _player.global_position, 2.0, linear_to_db(0.6)) # 46760
	_spawn_burst_parts(_player.global_position, Color("aaeeff"), 12, 3.0, 14.0) # 46762 addParts 12
	_state.apply_native_skill_shake(_main, 4.0) # 46763
	_cast_log.append({"skill": "iceOrb", "lv": lv, "mp_cost": mp_cost, "bon": _io_bon})
	queue_redraw()


## 얼음보주 파쇄 (activateIceShatter 46766)
func activate_ice_shatter() -> void:
	if not _io_active: # 46767
		return
	_io_active = false # 46768 중복 호출 방지
	_player.set_native_ice_orb_state(false) # 46819 P.s='idle'
	var lv: int = _io_lv
	var n_blades: int = 4 + lv * 4 # 46770
	var parameters: Dictionary = _main.get("source_providers").get_provider_bundle()
	var magic_ref: Dictionary = parameters.reference.magic_ref()
	var magic_mul: Dictionary = parameters.formula.p_magic_mul()
	if magic_ref.get("status") != "READY" or magic_mul.get("status") != "READY":
		_cast_log.append({"skill": "iceShatter", "halt": "magic_providers_not_ready"})
		return
	var sk_mul: float = ICE_SK_B + float(lv - 1) * ICE_SK_G * 0.5 # 44556·44511
	var base_dmg: int = NORMAL_HURTE.FORMULA.js_to_int32(float(magic_ref.value) * 1.0 \
		* float(magic_mul.value) * sk_mul) + _io_bon # 46771
	_io_bon = 0
	var blade_dmg: int = maxi(1, NORMAL_HURTE.FORMULA.js_to_int32(float(base_dmg) * 0.3)) # 46772
	var center: Vector2 = _player.global_position # 46773 cx,cy=P.x,P.y
	var lv_scale: float = 1.0 + float(lv - 1) * 0.1 # 46778
	var spawn_r: float = (float(_player.get("radius")) + 32.0) * lv_scale # 46779
	for i in range(n_blades): # 46780~46783
		var ang: float = TAU / float(n_blades) * float(i) + (_blade_rng.randf() - 0.5) * 0.15
		var spd: float = 7.0 + _blade_rng.randf() * 3.0
		_blades.append({"x": center.x + cos(ang) * spawn_r, "y": center.y + sin(ang) * spawn_r,
			"vx": cos(ang) * spd, "vy": sin(ang) * spd, "spd": spd, "dmg": blade_dmg,
			"dist": 0.0, "maxDist": 3000.0, "r": 12.0, "bounces": 0, "hit_ids": {}, "ang": ang})
	# 46785~46792 파쇄 범위 데미지 — hurtE(e,shatterDmg,ang,false,{},EL.I)
	var shatter_r: float = (100.0 + float(lv) * 5.0) * lv_scale
	var shatter_dmg: int = NORMAL_HURTE.FORMULA.js_to_int32(float(base_dmg) * 0.3)
	for enemy in _world.get_enemies():
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue
		if center.distance_to(enemy.global_position) < shatter_r + float(enemy.get("radius")):
			var hit_ang: float = (enemy.global_position - center).angle()
			var outcome: Dictionary = NORMAL_HURTE.new().execute(_main, _world, enemy,
				shatter_dmg, hit_ang, 2, {})
			outcome["enemy_id"] = enemy.get_instance_id()
			outcome["base_damage"] = shatter_dmg
			outcome["source"] = "iceShatter"
			if _player.has_signal("telemetry_event"):
				_player.telemetry_event.emit("native_hurte", outcome)
	# 46794~46808 파쇄 입자: 큰 파편 24 + 냉기 먼지 16
	for i in range(24):
		var a: float = TAU * float(i) / 24.0
		var pspd: float = 5.0 + _visual_rng.randf() * 5.0
		var col: Color = Color("ddf4ff") if i % 3 == 0 else (Color("aaeeff") if i % 3 == 1 else Color("88ddff"))
		_zone_parts.append({"x": center.x + cos(a) * spawn_r, "y": center.y + sin(a) * spawn_r,
			"vx": cos(a) * pspd + _visual_rng.randf() * 2.0, "vy": sin(a) * pspd + _visual_rng.randf() * 2.0,
			"col": col, "sz": 3.0 + _visual_rng.randf() * 5.0, "life": 18.0 + _visual_rng.randf() * 12.0, "max": 30.0})
	for i in range(16):
		var a2: float = _visual_rng.randf() * TAU
		var d2: float = _visual_rng.randf() * spawn_r
		_zone_parts.append({"x": center.x + cos(a2) * d2, "y": center.y + sin(a2) * d2,
			"vx": (_visual_rng.randf() - 0.5) * 4.0, "vy": (_visual_rng.randf() - 0.5) * 4.0 - 1.0,
			"col": Color("cceeff"), "sz": 1.0 + _visual_rng.randf() * 2.0,
			"life": 10.0 + _visual_rng.randf() * 8.0, "max": 18.0})
	# 46811~46812 파쇄 VFX — ice_orb 시트 정순 0→8 (frameTime 13, drawR=(P.r+32)×scale×6.6)
	if _ice_sheet != null:
		_shatter_anims.append({"x": center.x, "y": center.y, "t": 0.0,
			"draw_r": (float(_player.get("radius")) + 32.0) * lv_scale * 6.6})
	_emit_text(center + Vector2(0, -30), "❄ 파쇄!", "#aaeeff", 50) # 46814
	_state.apply_native_skill_shake(_main, 10.0) # 46815
	_io_t = 0.0 # 46818
	io_cd = maxf(600.0, 1200.0 - float(lv - 1) * 60.0) # 46820
	_io_cd_max = io_cd
	_cast_log.append({"skill": "iceShatter", "lv": lv, "base_dmg": base_dmg, "blade_dmg": blade_dmg,
		"blades": n_blades, "shatter_dmg": shatter_dmg, "cd": io_cd})
	queue_redraw()


## 칼날 비행·히트 (35177s 직진·35238s 벽 반사·35399s/35581~35585 히트)
func _update_ice_blades() -> void:
	if _blades.is_empty():
		return
	var write := 0
	for blade in _blades:
		blade["x"] = float(blade["x"]) + float(blade["vx"]) # 35212 (유도 제외 35186)
		blade["y"] = float(blade["y"]) + float(blade["vy"])
		blade["dist"] = float(blade["dist"]) + float(blade["spd"])
		if _visual_rng.randf() > 0.5: # 59470 냉기 트레일 (시각)
			var ta: float = _visual_rng.randf() * TAU
			_zone_parts.append({"x": float(blade["x"]) + cos(ta) * 5.0, "y": float(blade["y"]) + sin(ta) * 5.0,
				"vx": -float(blade["vx"]) * 0.3 + (_visual_rng.randf() - 0.5) * 2.0,
				"vy": -float(blade["vy"]) * 0.3 + (_visual_rng.randf() - 0.5) * 2.0,
				"col": Color("88ddff") if _visual_rng.randf() > 0.5 else Color("cceeff"),
				"sz": 1.5 + _visual_rng.randf() * 2.0, "life": 6.0 + _visual_rng.randf() * 5.0, "max": 11.0})
		var dead := false
		if float(blade["dist"]) > float(blade["maxDist"]): # 35222
			dead = true
		elif _world.is_world_blocked(Vector2(blade["x"], blade["y"])): # 35237 isW
			if int(blade["bounces"]) < 3: # 35238 magic → _maxBounce 3
				blade["x"] = float(blade["x"]) - float(blade["vx"]) # 35240 스텝백
				blade["y"] = float(blade["y"]) - float(blade["vy"])
				for esc in range(5): # 35242 벽 탈출
					if not _world.is_world_blocked(Vector2(blade["x"], blade["y"])):
						break
					blade["x"] = float(blade["x"]) - float(blade["vx"])
					blade["y"] = float(blade["y"]) - float(blade["vy"])
				var h_wall: bool = _world.is_world_blocked(Vector2(float(blade["x"]) + float(blade["vx"]), float(blade["y"])))
				var v_wall: bool = _world.is_world_blocked(Vector2(float(blade["x"]), float(blade["y"]) + float(blade["vy"])))
				if h_wall:
					blade["vx"] = -float(blade["vx"])
				if v_wall:
					blade["vy"] = -float(blade["vy"])
				if not h_wall and not v_wall: # 35244
					blade["vx"] = -float(blade["vx"])
					blade["vy"] = -float(blade["vy"])
				blade["bounces"] = int(blade["bounces"]) + 1
				blade["ang"] = Vector2(blade["vx"], blade["vy"]).angle()
			else:
				dead = true
		if not dead:
			for enemy in _world.get_enemies():
				if not is_instance_valid(enemy) or enemy.get("alive") != true:
					continue
				var eid: int = enemy.get_instance_id()
				if (blade["hit_ids"] as Dictionary).has(eid): # 관통 재히트 방지(_hitSet)
					continue
				if Vector2(blade["x"], blade["y"]).distance_to(enemy.global_position) \
						> float(blade["r"]) + float(enemy.get("radius")):
					continue
				var hit_ang: float = (enemy.global_position - Vector2(blade["x"], blade["y"])).angle()
				if ResourceLoader.exists("res://assets/sfx/skill/chain_fly.mp3"): # 35449 (magic_burst VFX 미이식 기록)
					_play_sample("res://assets/sfx/skill/chain_fly.mp3", enemy.global_position,
						1.2 + (_visual_rng.randf() - 0.5) * 0.4, linear_to_db(0.3))
				var outcome: Dictionary = NORMAL_HURTE.new().execute(_main, _world, enemy,
					int(blade["dmg"]), hit_ang, 2, {"iceBlade": true, "magic": true}) # 35407 hurtE(,,false,p,EL.I)
				outcome["enemy_id"] = eid
				outcome["base_damage"] = int(blade["dmg"])
				outcome["source"] = "iceOrbBlade"
				if _player.has_signal("telemetry_event"):
					_player.telemetry_event.emit("native_hurte", outcome)
				(blade["hit_ids"] as Dictionary)[eid] = true # 35582
				if is_instance_valid(enemy) and enemy.get("alive") == true:
					var fields: Dictionary = enemy.read_native_normal_enemy_hurte_fields(_world)
					if fields.get("ib") != true: # 35583 비보스 0.5초 빙결 스턴
						enemy.apply_native_normal_enemy_field_write("stunned", 30.0)
					enemy.apply_native_normal_enemy_field_write("ice_shard_res", null) # 35584 +0.10
				if _blade_rng.randf() < 0.95: # 35585 관통 롤 (p.pierce=0.95)
					continue
				dead = true
				break
		if not dead:
			_blades[write] = blade
			write += 1
	_blades.resize(write)


## addParts(46762) 상당 — 방사 버스트 입자 (시각 전용)
func _spawn_burst_parts(pos: Vector2, col: Color, count: int, speed: float, life: float) -> void:
	for i in range(count):
		var a: float = _visual_rng.randf() * TAU
		var sp: float = _visual_rng.randf() * speed
		_zone_parts.append({"x": pos.x, "y": pos.y, "vx": cos(a) * sp, "vy": sin(a) * sp,
			"col": col, "sz": 1.5 + _visual_rng.randf() * 2.5,
			"life": life * (0.7 + _visual_rng.randf() * 0.6), "max": life * 1.3})


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
	# 칼날 렌더(59452~): 삼각 칼날 4층 + 엣지 라인, 회전 ang+_now×0.012 (source-over=부모)
	var spin: float = float(Time.get_ticks_msec()) * 0.012
	for blade in _blades:
		var bc := Vector2(blade["x"], blade["y"]) - global_position
		var rot: float = float(blade["ang"]) + spin
		var br: float = float(blade["r"])
		draw_set_transform(bc, rot, Vector2.ONE)
		draw_colored_polygon(PackedVector2Array([Vector2(br + 14, 0), Vector2(2, -7), Vector2(-br - 6, 1), Vector2(2, 7)]), Color(0.4, 0.8, 0.933, 0.15))
		# 원본 6점 경로(59459~)는 자기교차라 Godot 삼각분할 불가 — 동일 윤곽의 단순 4점 다트로 근사(기록)
		draw_colored_polygon(PackedVector2Array([Vector2(br + 12, 0), Vector2(3, -6), Vector2(-br - 4, 1), Vector2(3, 6)]), Color(0.486, 0.784, 0.91, 0.5))
		draw_colored_polygon(PackedVector2Array([Vector2(br + 10, 0), Vector2(2, -4), Vector2(-br - 2, 0.5), Vector2(2, 4)]), Color(0.667, 0.933, 1.0, 0.85))
		draw_colored_polygon(PackedVector2Array([Vector2(br + 7, 0), Vector2(1, -2), Vector2(-br + 2, 0.3), Vector2(1, 2)]), Color(0.867, 0.957, 1.0, 1.0))
		draw_line(Vector2(br + 10, 0), Vector2(-br - 2, 0.5), Color(1, 1, 1, 0.6), 0.8)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	# Snapshot56785-56800: earth decal precedes the hero sheet.
	for wave in _waves:
		if str(wave.get("kind","giant"))!="giant" or wave.has("col"):continue
		var p: float=float(wave.t)/float(wave.maxT);var fade: float=maxf(0,1-p)
		var impact: float=minf(1,p*5);var r: float=float(wave.maxR)*(.12+.24*impact)
		draw_set_transform(Vector2(wave.x,wave.y)-global_position,0,Vector2(1,.34))
		draw_circle(Vector2.ZERO,r,Color(Color("160f0a"),(.52-.22*p)*fade),true,-1,true)
		draw_set_transform(Vector2(wave.x,wave.y)-global_position,0,Vector2(1,.37))
		draw_arc(Vector2.ZERO,r*1.08,0,TAU,96,Color(Color("7d5632"),(.5-.18*p)*fade),4+8*(1-impact),true)
		draw_set_transform(Vector2.ZERO)


## ADD 자식 레이어 콘텐츠 — 인페르노 시트('screen' 56811)·보주 lighter 층·파쇄 VFX(lighter)
func _draw_additive_content(canvas: Node2D) -> void:
	if _sheet != null:
		for wave in _waves: # 56802~56813 영웅 시트(2×2 512 셀)
			var p: float = float(wave["t"]) / float(wave["maxT"])
			var frame: int = mini(3, int(p * 4.0))
			var grow: float = 0.72 + 0.28 * minf(1.0, p * 3.5)
			var size: float = float(wave["maxR"]) * (0.98 if wave.get("kind", "giant")=="inferno" else 0.9) * grow
			var alpha: float = 1.0 if p < 0.62 else maxf(0.0, (1.0 - p) / 0.38)
			var src := Rect2((frame % 2) * 512, (frame / 2) * 512, 512, 512)
			var center := Vector2(wave["x"], wave["y"]) - canvas.global_position
			canvas.draw_texture_rect_region(_sheet,preload("res://scripts/native_source_canvas_labels.gd").snap(canvas,Rect2(center-Vector2(size,size)/2,Vector2(size,size))),
				src, Color(1, 1, 1, alpha))


func _source_ring(at: Vector2,r: float,color_: Color,width_: float) -> void:
	if _ring_index>=_ring_sprites.size():return
	var ring: Sprite2D=_ring_sprites[_ring_index];_ring_index+=1
	ring.position=at;ring.scale=Vector2.ONE*(r+width_);ring.show()
	ring.material.set_shader_parameter("tint",color_)
	ring.material.set_shader_parameter("inner",.5-width_/(r*2+width_))

func _draw_source_slam_finish(canvas: Node2D) -> void:
	_ring_index=0
	for wave in _waves:
		var p: float=float(wave.t)/float(wave.maxT);var fade: float=maxf(0,1-p)
		var at:=Vector2(wave.x,wave.y)-canvas.global_position
		var hero: bool=not wave.has("col");var kind: String=wave.get("kind","giant")
		var flash: float=maxf(0,1-p*4)
		if hero and flash>0:canvas.draw_circle(at,float(wave.maxR)*.4*flash,Color(Color("fff2a0" if kind=="inferno" else "fff0c8"),.82*flash*fade),true,-1,true)
		if hero and kind=="giant":
			var r: float=float(wave.maxR)*(.16+.34*minf(1,p*5))
			for crack in 12:
				var angle: float=TAU*crack/12+sin(crack*17.31)*.15
				var inner: float=r*(.2+(crack%3)*.025);var outer: float=r*(.72+(crack%4)*.075)
				var bend: float=angle+sin(crack*5.7)*.16
				_crack_points[0]=at+Vector2(cos(angle)*inner,sin(angle)*inner*.55)
				_crack_points[1]=at+Vector2(cos(bend)*outer*.58,sin(bend)*outer*.58*.55)
				_crack_points[2]=at+Vector2(cos(angle)*outer,sin(angle)*outer*.55)
				canvas.draw_polyline(_crack_points,Color(Color("f6d08a"),(.86-.4*p)*fade),3.5*(1-p)+1.5,true)
		var color_: Color=Color(wave.col) if wave.has("col") else Color("ff4a12" if kind=="inferno" else "e8c08a")
		var hi: Color=Color(wave.col) if wave.has("col") else Color("ffd06a" if kind=="inferno" else "fff0c8")
		var width_: float=12*(1-p*.55)+5
		_source_ring(at,float(wave.r),Color(color_,minf(1,1.1*fade)),width_)
		_source_ring(at,float(wave.r)*1.075,Color(hi,.7*fade),maxf(2,width_*.28))
		if hero:_source_ring(at,float(wave.r)*.72,Color(color_,.48*fade),3+4*fade) # X proxy setLineDash no-op.
	for i in range(_ring_index,_ring_sprites.size()):_ring_sprites[i].hide()


func _draw_source_ice_finish(canvas: Node2D) -> void:
	if _io_active and _ice_sheet != null: # Source58302: both proxy layers use source-over
		var orb_p: float = minf(1.0, _io_t / 180.0)
		_draw_ice_orb_layer(canvas, 0.85 + 0.1 * sin(orb_p * 6.0))
		_draw_ice_orb_layer(canvas, 0.2 + 0.12 * sin(orb_p * 8.0))
	for anim in _shatter_anims: # 46811 파쇄 정순 0→8 (blend lighter 46752)
		if _ice_sheet == null:
			break
		var frame2: int = mini(8, int(float(anim["t"]) / 13.0))
		var src2 := Rect2((frame2 % 3) * 768, (frame2 / 3) * 768, 768, 768)
		var size2: float = float(anim["draw_r"])
		var center2 := Vector2(anim["x"], anim["y"]) - canvas.global_position
		canvas.draw_texture_rect_region(_ice_sheet, Rect2(center2 - Vector2(size2, size2) / 2.0, Vector2(size2, size2)), src2, Color(1, 1, 1, 1))


## 보주 시트 1층 — 형성 프레임 보간(46746 8×(1−t/60))·반경 (P.r+32+sin(pπ)×10)×lvScale×6.6 (58302s)
func _draw_ice_orb_layer(canvas: Node2D, alpha: float) -> void:
	var orb_p: float = minf(1.0, _io_t / 180.0)
	var lv_scale: float = 1.0 + float(_io_lv - 1) * 0.1
	var orb_r: float = (float(_player.get("radius")) + 32.0 + sin(orb_p * PI) * 10.0) * lv_scale
	var draw_size: float = orb_r * 6.6
	var frame_float: float = 8.0 * (1.0 - minf(1.0, maxf(0.0, _io_t) / 60.0))
	var frm: int = int(floor(frame_float))
	var mix: float = frame_float - float(frm)
	var center := _player.global_position - canvas.global_position
	for blend_i in range(2):
		var weight: float = mix if blend_i == 1 else 1.0 - mix
		if weight <= 0.0:
			continue
		var frame3: int = mini(8, frm + blend_i)
		var src3 := Rect2((frame3 % 3) * 768, (frame3 / 3) * 768, 768, 768)
		canvas.draw_texture_rect_region(_ice_sheet,
			Rect2(center - Vector2(draw_size, draw_size) / 2.0, Vector2(draw_size, draw_size)),
			src3, Color(1, 1, 1, alpha * weight))


## HUD 쿨다운 sweep 공급자 (44136 _skCdSweep: pct=cd/base, 텍스트 (cd/60).toFixed(1)+'s')
func read_native_slot_cooldowns() -> Dictionary:
	var out: Dictionary = {}
	var p: Variant = _state.read_current_p() if is_instance_valid(_state) else null
	if not p is Dictionary: return out
	var current := {"giantSlam":[gsl_cd,GSL_CD_BASE],"spikeTrap":[gc_cd,SPIKE_CD_BASE],"holyDome":[hd_cd,DOME_CD_BASE],"iceOrb":[io_cd,_io_cd_max]}
	for key in DISPATCH.HUD_SLOTS:
		var selected: Dictionary = DISPATCH.RULES.slot_value(key,p,p.get("skillSlots"),p.get("ultSlot"))
		if selected.status != "READY" or not current.has(selected.value): continue
		var cd: Array = current[selected.value]
		if float(cd[0]) > 0:
			out[DISPATCH.HUD_SLOTS[key]] = {"pct":clampf(float(cd[0])/maxf(1,float(cd[1])),0,1),"text":"%.1fs" % (float(cd[0])/60.0)}
	return out


func get_native_skill_slots_snapshot() -> Dictionary:
	return {"configured": _configured, "gsl_cd": gsl_cd, "gc_cd": gc_cd, "hd_cd": hd_cd,
		"io_cd": io_cd, "io_active": _io_active, "io_t": _io_t, "blades": _blades.size(),
		"zones": _read_fire_zones().duplicate(true), "waves": _waves.size(),
		"cast_log": _cast_log.duplicate(true),
		"implemented": ["giantSlam(Space)", "spikeTrap(1)", "holyDome(F)", "iceOrb(Ctrl)"],
		"unported": ["iceOrb Shift 블링크 탈출(36696~36706 — charge 입력 경로 미보유)",
			"iceOrb magic_burst 히트 VFX·CT 슬롯 활성 하이라이트(28499 ac)·유니크 u_d04 파쇄 회수(_uqS)",
			"iceOrb 중 적 접촉 외 환경 피해 경로(32800s mo 장판 — 맵오브젝트 미이식)",
			"spikeTrap 출혈 스택(소비자 미이식)·겹침 캡(동시 1존만 가능)·pillarSpike 분기",
			"holyDome SFX.pickup(프로시저럴)·addParts 시전입자·합체(holyFuse/holyIce 등) 분기",
			"showPH 부족 공지(ST/악의 — 무발동 동일)", "rage>0 분기(피해 배율·분노 VFX·잔불 — 신규 rage 0)",
			"P._atkBon 이월(+~~(cost×1.5) — 직전 weapon 스윙 보너스)", "보스 _poiseHit 25% 경로(비도달)",
			"파편 파티클 32(파티클 풀)·crater 폴백", "SFX.slam 합성 3층(playSub/Dist/Noise — 샘플만 복사)",
			"'screen' 블렌드 정확 재현(가산 근사)", "_detonateAssaultFlames·slamStorm/pillarSlam 합체 분기(미보유)"]}

func _physics_process(_delta: float) -> void:
	var tree_root: Window=get_tree().root
	if not tree_root.has_meta("demo47i_stage"):
		_demo47i_physics_body(_delta);return
	var started: int=Time.get_ticks_usec()
	_demo47i_physics_body(_delta)
	var elapsed: int=Time.get_ticks_usec()-started
	var perf: Dictionary=tree_root.get_meta("demo47i_perf",{})
	var key: String=str(tree_root.get_meta("demo47i_stage"))+"|native_skill_slots.gd::_physics_process"
	var row: Dictionary=perf.get(key,{"max_us":0,"calls":0,"total_us":0})
	row.max_us=maxi(row.max_us,elapsed);row.calls+=1;row.total_us+=elapsed
	perf[key]=row;tree_root.set_meta("demo47i_perf",perf)
