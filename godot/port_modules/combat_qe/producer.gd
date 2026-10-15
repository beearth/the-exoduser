class_name CombatQEProducer
extends RefCounted
##
## FDG Godot 이식 — 원 HTML 전투 Q/E(보호막·패링·blackBean 반응) producer.
## TASK GODOT-PORT-COMBAT_QE-FIRST-20261013
##
## 소유: 격리 포트 모듈. Player/factory/world/공통 emitter 는 ENGINE 소유 — 여기서 변경 0.
## 이 모듈은 "입력 라우팅 + 패링 윈도우 판정 + 종류별 반응 + 반사 피해식"을 순수(side-effect free)
## 함수로 노출하여 ENGINE 의 NativePlayer(Q cancel_only)가 호출해 실제 상태를 변이하게 한다.
## producer 는 상태를 직접 바꾸지 않고 intent/payload Dictionary 만 반환한다(티켓/강제single-hit/임의무적 0).
##
## 원수치(raw)·native 60fps 프레임 단위 보존. 모든 상수는 R(game.html, pin 4192030 /
## sha256 bc7df271a18606c30ad4ca9a72729f06fb2f2f20f3aa93c2479a02124aa8f44a, 읽기전용)에서 포팅.
##   MP_COST_SHIELD        : P.mp-=10                                  (game.html:33687)
##   PARRY_WINDOW_FRAMES   : P._sbParryT=20                            (game.html:15040/33687)
##   SHIELD_CD_BASE_FRAMES : P._sbCd=~~(30*(1+_eqAffix('shieldCdRed')))(game.html:33687)
##   PARRY_POISE / STUN    : _poiseHit(e,20) / e.stunned=60 (패링 성공) (game.html:41762 대표)
##   SB_BURST_*            : G._sbBurst{r:P.r+5,maxR:det?150+(lv-1)*15:90,spd:8,det} (game.html:15042/33687)
##   BLUE_REFLECT          : p.blueBean/parryBlueBean/homing/magic, col '#00e5ff' (game.html:34030/34037)
##   blackBean 분류        : _projectileParryClass: blackBean→'magic' Q 전용 (game.html:17313)
##   E 반사 제외           : _eCanReflectProjectile: blackBean 제외 → E 반사 불가 (game.html:17321)
##   isPWin                : (game.html:39099)
##   pParryProjDmg         : (game.html:28684)

const MP_COST_SHIELD: float = 10.0
const PARRY_WINDOW_FRAMES: int = 20
const SHIELD_CD_BASE_FRAMES: int = 30          # ENGINE: round(30*(1+shield_cd_red))
const PARRY_POISE: int = 20
const PARRY_STUN_FRAMES: int = 60
const SB_BURST_SPD: float = 8.0
const SB_BURST_MAXR_NO_DET: float = 90.0
const SB_BURST_R_PAD: float = 5.0
const BLUE_REFLECT_COL: String = "#00e5ff"
const SBASH_PARRY_WIN: int = 16                # _PARRY_WIN=16 (game.html:8890, "sBash 20틱 중 패링 활성 16틱, 12→16 완화"). sBash 창: st2>(20-16=4). 호출자 override 가능.

enum QRoute { ICE_ORB, PEACE_SHIELD, SHIELD_BLOCK, BLOCKED }
enum Reaction { NONE, SHIELD_REDUCE, PARRY_REFLECT_BLUE, NO_REFLECT_PASS }
enum ProjType { PHYSICAL, MAGIC, BLACKBEAN }   # _projectileParryClass 매핑: blackBean = Q-magic 전용

## ── Q 입력 라우팅 (source: _qIsIceOrb @15028 = false, _qIsPeaceShield @15029, sBlock 기본 @33687) ──
## 반환 QRoute. 상태 변이는 ENGINE Player 가 intent 로 수행. 티켓/대기열 없음(즉시 거부 BLOCKED).
static func route_q(active_q_skill: String, has_peace_shield: bool, mp: float, shield_cd: float) -> QRoute:
	# _qIsIceOrb() 는 현재 원본에서 false 고정 → ICE_ORB 라우팅 비활성(미도달).
	if has_peace_shield and active_q_skill == "peaceShield":
		return QRoute.PEACE_SHIELD
	if shield_cd <= 0 and mp >= MP_COST_SHIELD:
		return QRoute.SHIELD_BLOCK
	return QRoute.BLOCKED   # mp<10 또는 쿨 중 → 발동 0 (무료/무티켓, 임의 통과 금지)

## sBlock(Q 보호막) 진입 intent. ENGINE 가 Player 에 적용. (@33687 / @15040 / @15042)
static func make_shield_block_intent(player_r: float, detonate_lv: int) -> Dictionary:
	var det: bool = detonate_lv >= 1
	var max_r: float = (150.0 + float(detonate_lv - 1) * 15.0) if det else SB_BURST_MAXR_NO_DET
	return {
		"state": "sBlock",
		"st2": 999,
		"sb_parry_t": PARRY_WINDOW_FRAMES,
		"parry_t": 0,
		"q_detonate_fired": false,
		"mp_cost": MP_COST_SHIELD,
		"shield_cd_base": SHIELD_CD_BASE_FRAMES,     # ENGINE: round(30*(1+shield_cd_red))
		"burst": { "r": player_r + SB_BURST_R_PAD, "max_r": max_r, "spd": SB_BURST_SPD, "det": det },
	}

## peaceShield 진입 intent. (@15054)
static func make_peace_shield_intent() -> Dictionary:
	return {
		"state": "peaceShield",
		"ps_shield_r": 100,
		"sb_parry_t": PARRY_WINDOW_FRAMES,
		"parry_t": 0,
		"parry_bank": 0,
	}

## ── 패링 윈도우 판정 (source: isPWin @39099). 수치/논리 보존, 상태값은 ENGINE 주입. ──
## sb_parry_t/sbash_st2 는 float (native60 소수 프레임 보존 — int 버림 금지). int 인자도 auto-promote.
static func is_parry_window(state: String, sb_parry_t: float, sbash_st2: float, parry_win: int = SBASH_PARRY_WIN) -> bool:
	if state == "sBash":
		return sbash_st2 > float(20 - parry_win)
	if state == "sBlock" or state == "peaceShield":
		return sb_parry_t > 0
	if state != "whirlwind" and state != "beam" and state != "elecRepent":
		return sb_parry_t > 0
	return false

## ── 종류별 반응 (source: blackBean Q-magic 전용 @17313, E 반사 제외 @17321, blue 반사 @34030) ──
## 반환 Reaction. 실제 피해/탄 변이는 ENGINE 판정이 수행(여기서 데미지·무적·single-hit 결정 0).
static func resolve_contact(proj_type: ProjType, in_parry_window: bool, is_q_magic: bool) -> Reaction:
	match proj_type:
		ProjType.BLACKBEAN:
			# 무지개탄: Q(마법) 패링 전용. E/비Q 로는 반사 불가.
			if in_parry_window and is_q_magic:
				return Reaction.PARRY_REFLECT_BLUE   # Q 성공 → blue 유도반사
			return Reaction.NO_REFLECT_PASS          # 반사 0 (피격 여부는 ENGINE iframe/피해판정)
		ProjType.PHYSICAL, ProjType.MAGIC:
			if in_parry_window:
				return Reaction.PARRY_REFLECT_BLUE
			return Reaction.SHIELD_REDUCE            # sBlock 보유 중 감소(판정 ENGINE)
	return Reaction.NONE

## ── 반사 피해식 (source: pParryProjDmg @28684). scale/배율은 ENGINE 스탯에서 주입, 식·0.5·floor 보존. ──
static func parry_proj_damage(bullet_dmg: float, _is_q: bool, scale: float, parry_dmg_mul: float, parry_bonus: float, leg_shield_parry: float, ki_floor: float) -> int:
	var gear_bonus: float = min(1.0, scale / 300.0)
	var base: float = bullet_dmg * (1.0 + gear_bonus) * 0.5
	var calc: int = int(base * parry_dmg_mul * (1.0 + parry_bonus) * leg_shield_parry)
	return maxi(calc, int(ki_floor))   # 최소 기검참 1방(14×) 보장

## ── 패링 성공 시 적/반사탄 payload (source: _poiseHit(e,20)/stun60/parryBank + blue reflect) ──
static func make_parry_hit(reflect_dmg: int) -> Dictionary:
	return {
		"poise": PARRY_POISE,
		"stun_frames": PARRY_STUN_FRAMES,
		"parry_bank_add": reflect_dmg,
		"reflect": { "blue_bean": true, "parry_blue_bean": true, "homing": true, "magic": true, "col": BLUE_REFLECT_COL },
	}
