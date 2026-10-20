extends RefCounted
## P2-001j — update() gap 4구간의 flow 영수증 owner (abstract owner gap receipt
## {"completed": true, "returned": bool} — producer.gd 366 계약).
##
## 발급 근거(정적 소스 사실, 현 리포 game.html — 전 구간에 `return` 문이 없다):
##   panel_inputs           32113~32131  (KeyP 포탈·패널 토글·iris/blade 토글 — 전부 비반환 호출)
##   body_gap_to_hitstop    32134~32584  (ens null 정리·_gameFrame++·BOOTH(비활성 상수)·
##                                        _fbTick/_regionTick/_wmTick/_fdTick/_twRecord·충돌 워커·
##                                        플로우필드·PLAYER_ACT·하프/대시/체인 — 비반환)
##   gap_hitstop_to_sp      32595~32681  (뇌전창/본월/파이어존 수명 등 — 비반환)
##   gap_sp_to_stage_time   32685~32741  (_pStats 카이팅 카운터·dmgPeak 감쇠 등 — 비반환)
## 따라서 이른 게이트(system_lesson/g_on/parry_lesson/editor/paused)를 통과한 프레임은
## 반드시 32742(G.stageTime/playTime)에 도달한다 → returned=false 는 소스 불변식이다.
##
## 구간 내 "효과"는 clock(흐름·dtSp/sp/stageTime) 범위 밖이며 각자 소유가 갈린다:
## 이식분 = 플레이어 행동(player.gd·Q/E 어댑터)·충돌/플로우(world)·dmgPeak(state feel)·
## _gameFrame(world._native_frame). 미이식분 = 패널 토글·플레이어 포탈·필드보스/지역/
## 지상뱀장어/화마귀 틱·BOOTH·시간왜곡 기록·_pStats(보스 AI 카운터) 등 — 첫 전투 흐름에
## 영향 없음(비반환·해당 시스템 부재)을 동반 문서(FDG_P2_001J)의 구간 판정표가 기록한다.
## 가짜 '효과 완료' 주장이 아니라 '구간이 흐름을 끊지 않음'에 대한 영수증이다.

const GAP_LINES := {
	"panel_inputs": [32113, 32131],
	"body_gap_to_hitstop": [32134, 32584],
	"gap_hitstop_to_sp": [32595, 32681],
	"gap_sp_to_stage_time": [32685, 32741],
}

static func receipt(gap_name: String) -> Dictionary:
	if not GAP_LINES.has(gap_name):
		return {}
	return {"completed": true, "returned": false,
		"owner": "source_update_clock_prefix/gap_flow_witness",
		"basis": "no_return_statements_in_region(static_source_fact)",
		"lines": GAP_LINES[gap_name]}
