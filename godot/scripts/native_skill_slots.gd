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

var _main: Node
var _world: Node
var _player: Node2D
var _state: Node
var _configured := false
var gsl_cd := 0.0
var _waves: Array = []
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
	_configured = true
	return true


func _unhandled_input(event: InputEvent) -> void:
	if not _configured:
		return
	if event.is_action_pressed("rage_slot"):
		cast_giant_slam()


func _physics_process(_delta: float) -> void:
	if not _configured:
		return
	if gsl_cd > 0.0:
		gsl_cd = maxf(0.0, gsl_cd - 1.0) # 쿨 틱(원본 update의 P._gslCd 감소 상당)
	var write := 0
	for wave in _waves:
		wave["t"] = float(wave["t"]) + 1.0 # 37587: w.t+=sp, r=30+(maxR−30)(t/maxT)
		wave["r"] = 30.0 + (float(wave["maxR"]) - 30.0) * (float(wave["t"]) / float(wave["maxT"]))
		if float(wave["t"]) < float(wave["maxT"]):
			_waves[write] = wave
			write += 1
	_waves.resize(write)
	if not _waves.is_empty():
		queue_redraw()
	elif get_canvas_item().is_valid():
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
	# 게이트: ST / 악의 / 쿨 (13010) — 부족 showPH 공지는 미이식 기록(무발동만 동일)
	if float(_player.get("stamina")) < GSL_ST_COST or int(g.get("mats", 0)) < GSL_MAL_COST or gsl_cd > 0.0:
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


func _emit_text(pos: Vector2, text: String, color: String, life: int) -> void:
	var adapter: Variant = _world.get_node_or_null("NativeFloatingText")
	if adapter != null and adapter.has_method("emit_native_text"):
		adapter.emit_native_text(pos.x, pos.y, text, color, life)


func _draw() -> void:
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
	return out


func get_native_skill_slots_snapshot() -> Dictionary:
	return {"configured": _configured, "gsl_cd": gsl_cd, "waves": _waves.size(),
		"cast_log": _cast_log.duplicate(true),
		"implemented": ["giantSlam(Space)"],
		"unported": ["spikeTrap(1)·holyDome(F)·iceOrb(Ctrl) 발동(다음 차수 — 키 무반응 유지)",
			"showPH 부족 공지(ST/악의 — 무발동 동일)", "rage>0 분기(피해 배율·분노 VFX·잔불 — 신규 rage 0)",
			"P._atkBon 이월(+~~(cost×1.5) — 직전 weapon 스윙 보너스)", "보스 _poiseHit 25% 경로(비도달)",
			"파편 파티클 32(파티클 풀)·crater 폴백", "SFX.slam 합성 3층(playSub/Dist/Noise — 샘플만 복사)",
			"'screen' 블렌드 정확 재현(가산 근사)", "_detonateAssaultFlames·slamStorm/pillarSlam 합체 분기(미보유)"]}
