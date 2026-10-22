extends RefCounted
## PC-BOSS-CORE (2026-10-22) — 보스 공간 균일 축소 S (사용자 결정 2026-10-22, 줌 ×2.5 대응).
##
## 보스 AI(BC01~BC10, Mac 모듈)는 원본 수치 그대로 "보스 공간 b"에서 계산한다. 월드 w와는
## 닮음 변환 w = O + S·(b − O) 로만 만난다. 그래서 보스의 모든 공간 값(위치·반경·거리 임계·
## px/tick 속도·넉백 거리)은 정확히 ×S 가 되고, 시간(틱)·데미지·HP·확률·RNG 순서는 그대로다.
## 플레이어 고유 값(P.r·이동속도·공격 사거리)은 월드 값 그대로 들어가므로 "보스만 축소"가 된다.
## 근거·대상/제외 표: docs/engine/PC_BOSS_CORE_CONTRACT_20261022.md §7.
##
## S == 1.0 이면 모든 함수가 입력을 그대로 돌려준다(곱셈·덧셈 자체를 하지 않음) → 원본과 비트 동일.

## 사용자 결정값. 제품 적용은 core 의 effective_scale(Mac 경계 준비 여부)로 결정된다.
const BOSS_SPACE_SCALE := 0.4

var scale := 1.0
var origin := Vector2.ZERO

func configure(s: float, anchor: Vector2) -> bool:
	if not is_finite(s) or s <= 0.0 or not anchor.is_finite():
		return false
	scale = s
	origin = anchor
	return true

func is_identity() -> bool:
	return scale == 1.0

## 위치 b→w
func to_world_xy(x: float, y: float) -> Vector2:
	if scale == 1.0:
		return Vector2(x, y)
	return Vector2(origin.x + scale * (x - origin.x), origin.y + scale * (y - origin.y))

## 위치 w→b
func to_boss_xy(x: float, y: float) -> Vector2:
	if scale == 1.0:
		return Vector2(x, y)
	return Vector2(origin.x + (x - origin.x) / scale, origin.y + (y - origin.y) / scale)

## 길이·반경·속도(px/tick)·넉백 b→w
func len_to_world(v: float) -> float:
	return v if scale == 1.0 else v * scale

## 길이 w→b
func len_to_boss(v: float) -> float:
	return v if scale == 1.0 else v / scale

## 플레이어 스냅샷(월드)을 보스 공간으로. x/y는 위치, r·kb는 길이. 나머지(facing·iframes·s)는 그대로.
func player_to_boss(p: Dictionary) -> Dictionary:
	if scale == 1.0:
		return p
	var out: Dictionary = p.duplicate(true)
	var at := to_boss_xy(float(p.x), float(p.y))
	out.x = at.x
	out.y = at.y
	out.r = len_to_boss(float(p.r))
	if p.get("kb") is Dictionary:
		out.kb = {"x": len_to_boss(float(p.kb.x)), "y": len_to_boss(float(p.kb.y))}
	return out

## 보스 공간 플레이어 스냅샷 변화를 월드로 되돌린다(위치·kb만; r은 원래 월드 값 유지).
func player_to_world(p_boss: Dictionary, world_r: float) -> Dictionary:
	if scale == 1.0:
		return p_boss
	var out: Dictionary = p_boss.duplicate(true)
	var at := to_world_xy(float(p_boss.x), float(p_boss.y))
	out.x = at.x
	out.y = at.y
	out.r = world_r
	if p_boss.get("kb") is Dictionary:
		out.kb = {"x": len_to_world(float(p_boss.kb.x)), "y": len_to_world(float(p_boss.kb.y))}
	return out

func snapshot() -> Dictionary:
	return {"scale": scale, "origin": [origin.x, origin.y], "identity": scale == 1.0, "decided_scale": BOSS_SPACE_SCALE}
