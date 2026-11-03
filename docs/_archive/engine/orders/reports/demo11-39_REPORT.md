## 2026-10-21 PCIA-WIRE 현행 연결 보충

아래 기존 제출 기록은 당시 상태다. PC 묶음 A 인수 후 DEMO11-39 PCI-01 소비자·DEMO11-37 PCI-11 clear 보류·B9 PCI-10·DEMO11-29 PCI-12 호출을 연결했다. 재련/빈 슬롯 제작의 recalcSt 부재 HOLD는 해제했으며, 보스 final 및 retry stage 재구성은 여전히 NOT_READY다. 상세 구현/남은 범위/검증은 docs/engine/PCIA_WIRE_REPORT_20261021.md를 따른다.

# DEMO11-39 — BLOCKED / PC 부활 집행 인터페이스 필요

기준 `origin/main` = `0138c5bb9188d27cee10cb1a901d075092ddb88f` (fetch 후). 브랜치 `codex/demo11-39-20261021`. 사용자 지시의 Main/State 단위 권한은 적용하되, **HP 피해·무적·Q/E 보호 경로는 수정하지 않는다**. 문서/인계만 제출하며 구현·화면 준비 완료가 아니다.

## 원본과 현재 연결 경계

| 구간 | 현재 원본 근거 / 실제 상태 | 필요한 연결·판정 |
|---|---|---|
| HP 0 수신 | `player.gd:995–1003` direct, `1097–1106` burn 모두 `telemetry_event("player_died", …)` 발생 전에 `state="dead"`. Main `248` 연결, `1690–1697`은 기록만 | 이 이벤트를 소비할 수 있다. 그러나 이미 terminal 상태이므로, 재진입 거절하는 원본 die를 그대로 dead actor에 적용할 수 없다. **HP0 최초 진입 토큰과 PC revive 집행 계약 필요** |
| 1회부활·fallen | G43721–43751: reviveOnce 우선, 성공 HP/MP/ST 풀·iframe120; 아니면 fallen/st2=300/iframe9999, 사망 순간 chance/cd/can/roll 저장 | Mac은 원본 판정·300 source-sp owner를 맡을 수 있으나 실제 actor의 state/iframe 복구는 PC 소유. Main의 직접 property 쓰기로 우회하지 않음 |
| 자연력·악마화 | G43741–43750: 자연 `min(100,~~(lv*.03))`, pDemon×2, 장비/첫 weakRev 존/인간성 반영, cd floor 후 장비 배율·절삭. G43847–43865: 저장 roll만 재사용, HP/MP/ST 풀·idle/st2=0/iframe120 | 자연력 성공과 악마화를 별개 두 번 굴리지 않는다. 유니크 재점화 rage는 PC 후처리. 전투 중 성공은 shield/기동/소모품 완충 없음. 확률·시간을 UI에서 새로 만들지 않음 |
| 기존 API 재사용 불가 | `native_source_resource_authority.gd:412–463` restore는 dbRestore 전용 8필드, state/iframe/shield/리스폰 정리 없음. Player `228–266`은 단회 초기화, `322–342`는 파생 stat commit | 저장 restore를 revive인 것처럼 호출하거나 초기화 pass 재사용 금지. 합법적 원자적 revive/respawn sink가 현재 없음 |
| clear 경합 | `05f41cc7`은 기준 main의 조상이 아님(해당 commit은 로컬 object 존재, 읽기 대조만). 그 커밋 encounter `66–86`, State `1342–1370`은 pending-player gate 없음 | 아래 NEW 제안. 현재 브랜치에 미병합 의존 코드를 임의 반입하지 않음. 최종 사망/부활 대기에는 clear·보상 commit 금지. 보스 최종사망 이벤트는 보존 후 정상 부활 시 같은 토큰을 한 번 재개 |
| retry·save·lobby | G63476–63477 EXP 30% 손실, G63521–63530 retry iframe300/상태·자원·기동 리셋→applyStats→최종 완충→dbSave. G63673–63682 lobby: 죽었으면 HP/MP/ST/shield·idle 복구 후 save→이동 | 새 Main을 만드는 것만으로 기존 캐릭터 retry라고 주장하지 않음. PC respawn 집행 + 실제 저장 owner 영수증 뒤 로비 연결 필요. 기존 2_5 `RESPAWN_RESOURCE_RESET.md`의 DOT/둔화 정리 포함 |

## PC에 필요한 OLD → NEW 제안 (아직 존재하는 API가 아님)

1. **집행 진입** — OLD: `player_died`를 기록하고 terminal dead 유지. NEW: `Main.request_native_player_life_transition(request)` 제안. PC가 실제 Main/Player/World identity와 단회 `death_token`을 발급·검증. `op=fallen_enter|revive_once|revive_resolve|final_death|respawn|lobby_prepare`를 구분하고, HP0 이벤트 뒤 기존 dead를 이 토큰으로만 인수할 수 있게 한다. 피격 판정·Q/E 접두 변경 요청은 아니다.
2. **원자적 commit** — PC 소유 Player/자원/보호 상태를 사전검증 후 동기 commit. 반환 `{status, accepted, death_token, before, after, committed_fields}`. 실패는 모든 owner unchanged; 성공 state/HP/MP/ST/iframe 및 P readback 일치. fallen 9999, 성공 120, retry 300은 원본 op별로만 허용. 유니크 rage·기동/DOT 정리는 PC가 기존 owner로 실행. 범용 임의 iframe setter는 요청하지 않는다.
3. **Mac 소유 후속** — 인터페이스 인수 뒤 source-sp(일시정지0·한 clock) 300 countdown, 사망 순간 판정 1회·쿨다운, State의 death_token/phase, 새 fallen/death 뷰, retry EXP 1회 차감 및 저장 인계. tick 목록 API 추가0. dead→retry와 revive 성공의 완충 범위를 분리.
4. **clear OLD → NEW** — `05f41cc7` State `commit_native_demo_encounter:1344–1345` admission 및 `commit_native_demo_clear:1327–1334`의 progression 쓰기 전에 `life_phase`가 playing이고 실제 HP>0인지 검사하는 narrow gate 추가 제안(이 단위 Main/State 범위). `native_demo11_encounter.gd:66–74`의 PC final-death 신호는 pending 중 버리지 않고 토큰 하나 보존; `leave:75–86`은 pending/dead에서 no-op. revive 성공 뒤 동일 actor/stage/provider 확인 후 1회 재개, 최종사망·retry·owner loss는 pending 폐기. 별도 담당 encounter 파일은 승인 없이 수정하지 않음.

## 검증·변경·미완료

| 항목 | 이번 실제 결과 / 인수 뒤 필요한 검사 |
|---|---|
| 변경 | 보고서·CHANGELOG·WORK_BOARD 자기 행·docs/2_5 상태 절만. Main/State/Player/World/HUD/자원 authority/PC combat **각 0줄**, 게임 수치·asset·저장 형식 0. 번역 master bytes 무변경(CRLF 포함) |
| 실행 | Godot 실행 **0**, 관련 런타임 테스트 **미실행**(통과/실패 수 보고 없음). 문서 전용 변경 범위·원본 행·ancestor 및 diff 정적 확인. 기존 PASS 수 재사용0 |
| 필수 후속 검사 | direct/burn HP0 단회 수신; reviveOnce 우선/used; 299→300 source-sp·pause; 저장roll 경계/쿨다운; 성공 실드 불충전; final-dead 단회; 실패 원자성; boss final-death와 fallen 양 순서·pending 중 exit/clear0·성공 뒤 clear1; retry EXP 차감1·자원/보호 상태 readback; save 실패/로비 인계 |
| 화면·번역 | fallen·최종사망 **1920×1080 캡처2장+1x 크롭 미제작**. 실제 life sink 없는 화면을 제품 검증으로 위장하지 않음. 후속 구현 시 Hell Gothic/게임 폰트/이모지0 적용하고 신규 문자열을 번역 master에 CRLF 보존 등록. 현재 신규 제품 텍스트0 |
| 제출 | 원로그 `~/exoduser-wt/_out/demo11-39/`에 source-evidence/static-evidence/dependency 대조·정상 훅·push/remote SHA·DONE 보존. 사용자 저장 폴더 접근0. 자기 branch만 push 후 자기 worktree 제거. R 불변 |

**판정: BLOCKED.** 차단 원인은 명시된 PC 보호 권한과 실제 부활/리스폰 집행 API 부재다. 위 API와 DEMO11-37 의존 인수 뒤 Mac 소비자·UI·관련 테스트/캡처를 이어갈 수 있다. 완료/화면 비교 준비 판정은 하지 않는다.
