# P2-005A — 시작 스킬 지급 + 전투 전 쉴드 피해 출처 조사 (2026-10-20)

> 2026-10-21 DEMO11-16 현재 연결 갱신: 시작 지급/배열은 그대로다. 현재 1/Space/F/Ctrl은 실제 P의 skillSlots/activeCtSk를 읽는 dispatcher를 거치며 숫자2~4·ULT Z도 입력 경로가 있다. 실행자가 없는 선택은 비용 없이 거절한다. 아래는 당시 인수 이력이다. [현재 계약](DEMO11_SKILL_DISPATCH_20261021.md).

## A) 시작 스킬·슬롯 지급 (원본 추적)
로컬 새 게임 경로 63993~64014 (포트 bootstrap EXTERNAL 기록 3건의 실제 적용):
| 원본 행 | 내용 | 구현 |
|---|---|---|
| 63994~63998 | 난이도 시작 스킬 — _diffSigned()=OPT.diff(5)−5=0 → <1/<2/<3 전부 참: giantSlam(+SKILL_SLOTS[4])·holyDome(+[5])·spikeTrap | state `apply_native_new_game_starting_skills` (난이도≠0 분기는 미이식 기록) |
| 64002(3483) | _ensureBaseWingStrike: maliceSwipe/shieldThrow≥1·_fused.shieldFuse=true·activeRMBSk='maliceSwipe' | 동일 |
| 64003~64007 | kiSlash/spikeTrap/holyDome/giantSlam/iceOrb ≥1 강제 | 동일 |
| 64010~64014 | 새 게임: activeCtSk='iceOrb', SKILL_SLOTS 정리 후 _fs(0,'spikeTrap')/_fs(4,'giantSlam')/_fs(5,'holyDome') | `_p["skillSlots"]=[spikeTrap,·,·,·,giantSlam,holyDome]` |
| 27681~27682 | SKILL_SLOTS 전역 6칸·ULT_SLOT null | 포트 보관처 = P dict "skillSlots"/"ultSlot" (전역→P 소유 기록) |
- 호출: main.gd 부팅 시퀀스(스테이지 충전 직후) +5줄. **발동 로직은 범위 밖 — 지급·표시
  전용.** 미구현 스킬 키는 기존대로 무반응(1/F/Ctrl 미바인딩·Space=space_rage_slot_not_connected ※ 2026-10-22 PC-MOVE-SKILLS 브랜치: Space 단독은 슬롯 owner로 전달, 방향+Space는 전격이동(DEMO11-11).
  기존 상태 그대로 — 원본과 다른 동작 생성 없음).
- HUD: P2-002a 슬롯 매핑이 자동 반영 — 1=spikeTrap·F=holyDome·Space=giantSlam·Ctrl=iceOrb.
  p2002a 테스트의 종전 '미이식' 기대값을 지급 후 상태로 정정(39/0 유지).

## B) 전투 전 적 쉴드 108~156 피해 — 계측 결과 (출처 미특정·증거 정리)
| 단계 | 결과 |
|---|---|
| eShield 기록자 전수 | 적 eShield 감소 쓰기는 **hurtE(42347) 유일**(46149는 즉사 소거) → 반드시 hurtE 경유 |
| hurtE 래핑 계측(스택·opts·atkEl, 4회 부팅·12~30초, 무입력) | **0건** — 이번 부팅들에서 미재현. 부팅1은 초기 HAS_ELITE true였으나 이벤트 없음 |
| P2-001d 원로그 좌표 재분석 | 피해자=**고정 위치 (4340±5, 7291±1)의 적**(두 실행 동일 — 스폰 링 동적인데 위치 고정 = 지형 연관), 피해 주기 ~2s, 실행별 고정값(108/135/156), 피해자 이동 중에도 지속(블루 숫자가 (4277,7192)→(4212,7139) 추적) |
| 후보 기각 | M30 '진원 충격파'(38803) — **플레이어 대상 hurtP**라 무관(엘리트 표식 '매직 【진원 충격파】'는 이 모드의 이름일 뿐) / 화톳불 배리어(31610 r280·t300) — 밀어내기만, 5초 소멸 / 맵 trap·독혈 DOT(32798~) — 플레이어 대상 / 독액 도랑 — 시각 전용(51927) |
| 결론 | 조건부 발생(아마 특정 스폰 구성에서만). hurtE 경유는 확정이므로 재현 포착 시 스택 1줄로 특정 가능 — 계측 스크립트(G:\exoduser-wt\_tmp\web_hurte_trace.mjs: hurtE 스택+numStr 텍스트+엘리트 목록 덤프) 반복 실행으로 잡힘. Godot 이식 판단은 출처 특정 후(현재 포트에 해당 경로 없음 확인) |

## 검증 (원로그 G:\exoduser-wt\_out\p2-005a\logs\)
- test_p2005a_start_skills **27/0 PASS**: ①스킬 9종 지급·shieldFuse·activeCtSk·skillSlots 배열·
  ULT null ②HUD 13슬롯 아이콘 = 웹 기대 전칸 일치 + Space 미연결 유지.
- 회귀: p1002e/f/g·p2001a/b/c/e·p2002a(기대값 정정 후)·p2002b·p2003a·p2004a·contracts PASS,
  초기화 117/2·시작 145/2(선재 2)·재생 88/0·레슨 30/0 — 전부 기준선.
- 화면: cmp_slotbar_1x_v2.png(상 웹·하 Godot 1x) — **13칸 아이콘 전부 동일**(1 spikeTrap·
  F holyDome·LMB kiSlash·RMB shieldThrow·Shift chargeBoost·E fireball·Q peaceShield·
  Ctrl iceOrb·Space giantSlam·2/3/4/Z 빈칸).

## 남은 것
스킬 발동 로직 4종(spikeTrap/giantSlam/holyDome/iceOrb 실행자) / 난이도≠0 시작 스킬 분기 /
ULT 지정·_cycleUlt / B 출처 특정(재현 포착) / 숫자 슬롯 배정 팝업(L키).
