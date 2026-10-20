extends RefCounted
## P2-001a — 일반 적 에너지 바 레이아웃 (원본 drawEn game.html:53961~53969 그대로).
## 순수 계산만: 적 로컬 좌표 기준 rect/색 목록을 돌려주고, 그리기는 각 적 _draw가 한다.
##
## 원문(53961): bw=e.r*2+6, bx=e.x-bw/2, by=e.y+(e._nameTopOff!==undefined?_nameTopOff:-e.r-16)
##   — _nameTopOff는 보스 드루이드 전용 드로우 경로(10938/10966)에서만 설정되므로
##   일반 적 6종은 항상 undefined → by = -r-16 (적 로컬).
## 1) HP+쉴드(53963): 표시 조건 hp<mhp || (eShieldMax||0)>0 && eShield<eShieldMax.
##    배경 rgba(0,0,0,.6) 높이4, HP '#cc0000' ×(hp/mhp), 쉴드 '#44aaff'
##    ×min(1,eShield/eShieldMax) 덮어그리기, 그린 뒤 by-=5.
## 2) 그로기바(53966): stunned>0일 때 배경 rgba(0,0,0,.5) 높이3,
##    '#ff8800' ×min(1,stunned/_grMax), _grMax=e._maxStunned||(ib?180:90), by-=4.
## 3) 프리즌/빙결바(53968): _frozen/_freezeGauge 시스템 미이식 — 비활성(필드 부재=0).

const BG_HP := Color(0, 0, 0, 0.6)
const BG_SUB := Color(0, 0, 0, 0.5)
const COL_HP := Color("#cc0000")
const COL_SHIELD := Color("#44aaff")
const COL_GROGGY := Color("#ff8800")

static func build(radius: float, hp: float, mhp: float, e_shield: float, e_shield_max: float,
		stunned: float, max_stunned: Variant, is_boss: bool = false) -> Array:
	var rects: Array = []
	var bar_width: float = radius * 2.0 + 6.0
	var bar_x: float = -bar_width / 2.0
	var bar_y: float = -radius - 16.0 # 일반 적: _nameTopOff undefined
	if hp < mhp or ((e_shield_max if e_shield_max > 0.0 else 0.0) > 0.0 and e_shield < e_shield_max):
		rects.append({"rect": Rect2(bar_x, bar_y, bar_width, 4.0), "color": BG_HP})
		rects.append({"rect": Rect2(bar_x, bar_y, bar_width * (hp / mhp), 4.0), "color": COL_HP})
		if e_shield_max > 0.0 and e_shield > 0.0:
			rects.append({"rect": Rect2(bar_x, bar_y, bar_width * minf(1.0, e_shield / e_shield_max), 4.0), "color": COL_SHIELD})
		bar_y -= 5.0
	if stunned > 0.0:
		var groggy_max: float = 180.0 if is_boss else 90.0
		if (max_stunned is int or max_stunned is float) and float(max_stunned) > 0.0:
			groggy_max = float(max_stunned) # 원문 e._maxStunned||(ib?180:90)
		rects.append({"rect": Rect2(bar_x, bar_y, bar_width, 3.0), "color": BG_SUB})
		rects.append({"rect": Rect2(bar_x, bar_y, bar_width * minf(1.0, stunned / groggy_max), 3.0), "color": COL_GROGGY})
		bar_y -= 4.0
	return rects
