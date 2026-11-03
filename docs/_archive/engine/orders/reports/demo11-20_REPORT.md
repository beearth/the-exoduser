# DEMO11-20 — 실제 addExp demo cap100·레벨업 인계

기준 main `0105159934d0c2a8b167bd51518dca1e0fafe50a`. 지시 근거는 `codex/demo11-gap-20261021`의 `61ab71be`에 기록된 GAP D01/DEMO11-20 행이다(현재 main에는 해당 GAP 문서 없음; 읽기 참조만, 임의 merge0). 사용자 2026-10-21 “나눠서” 승인에 따라 **State addExp 구역만 공용 수정**했다. Main·HUD·피해/전투 핵심·맵·저장 형식은 변경하지 않았다.

## 원본·동작

G16646–16647은 default demo와cap100, G43137은 XP 누적 전 entry min-clamp, G43148은 while 안 직접 maxExp−1 대입이다. 해당 두 지점에서 기존 `native_meta_exp_gate_policy.entry_gate/loop_gate`를 호출하며 cap 수식을 새로 쓰지 않았다. 필요 XP도 State의 기존 중복 표현식을 없애고 META-01 `required_exp`를 호출한다(G43128–43133). 호출측이 이미 적용한 `/3/expBonus`를 재적용하지 않는다.

99→100에 도달한 큰 XP는 while에서 멈추고 **그동안 발생한 레벨업의 SP/AP·기존 20% 회복·텍스트·인계를 한 번 완료**한다. 이미100이면 entry에서 기존 exp만 min-clamp하고 새 XP/회복/SP/AP/인계0. 정상 cap 차단은 `applied=true,levels=0,texts=[]`로 반환해 기존 처치 보상 owner의 실패/HALT로 바꾸지 않는다. full mode의 100→101은 허용한다. demo가 아니면 기존 lv>=1000 while HOLD를 유지하며, 새 날짜/일일 초월 정책은 이 단위에서 채택하지 않았다.

회복은 기존 resource authority의 `commit_native_level_up_heal`만 호출한다(G43158). 기존 HUD가 같은 P에서 lv/exp/maxExp를 읽고, 기존 처치 caller가 반환 SP/AP text를 표시한다. source demonic 색(G43160–43165)도 실제 PASSIVES 비교로 선택한다. 본 단위는 showPH/levelUpVfx/SFX 제품 소비자를 구현하지 않으며 presentation 요청만 명시한다.

## 경계 증거 — 원본 addExp와 실제 Main/State 대조

새 테스트는 실제 Main을 부팅하고 원본 G16647·43122–43173을 제한 구간 스트리밍한 Node VM oracle에 동일 입력을 준다. 기존 caller의 전처리 완료 XP와 비교하려고 oracle은 addExp(value,true)를 사용한다. 예약큐는 기존 State와 동일하게 미연결0투자. 표의 SP/AP 초기값은7/2, HP/ST/MP는100/10/20으로 고정한 테스트 소유 개입이며 원본의 회복 계산과 actual authority를 비교한다. 정적 제품 수식을 oracle로 복제하지 않았다.

| 사례 | 입력·mode | 도달 lv / exp | SP/AP | 회복·level-up 표시/저장 요청 |
|---|---|---|---|---|
| 정확99 | lv99/exp0/max830 +830, demo | 100 / 0 | 10/3 | 각각1회 |
| 잔여99 | lv99/exp829 +2, demo | 100 / 1 | 10/3 | 각각1회 |
| 대량99 | lv99 +1,000,000,000, demo | 100 / 844(max845−1) | 10/3 | 각각1회 |
| 대량 신규1 | lv1/max15 +1,000,000,000, demo | 100 / 844 | 304/52 | 99레벨이어도 각각1회 |
| 이미100/낮은exp | lv100/exp17 +대량, demo | 100 / 17 | 7/2 | 0회·자원 불변 |
| 이미100/과다exp | lv100/exp9000 +대량, demo | 100 / 844 | 7/2 | 0회·자원 불변 |
| 임계 미만 | lv99/exp1 +2, demo | 99 / 3 | 7/2 | 0회 |
| full mode | lv100/exp844/max845 +1, false | 101 / 0 | 10/2 | 각각1회·cap 잘못 적용0 |
| demonic | lv99 +830, pDemon>pHuman | 100 / 0 | 10/3 | source #d38aff, 각각1회 |
| 다중95 | lv95 +대량, demo | 100 / 844 | 22/5 | 5레벨이어도 각각1회 |

추가로 실제 HUD lv/exp text, 외부 owner/음수 XP 거부, 신호 중 재진입 및 mode 변경 거부, consumer의 packet 변조가 State 영수증에 영향0을 검증했다. XP/레벨 처리를 await하거나 제품 RNG를 소비하지 않는다.

## 공용 변경 줄·병합 접점

변경 전 State는 main 기준523–557의 addExp다. 최종 diff `L/shared-state.diff`가 줄별 근거다. 공용 변경 합계 **State +62/−8**, 다른 공용0줄. 다른 Mac 창은 아래 구역에만 병합 주의가 필요하다.

| 파일·최종 행 범위 | 변경 / 인계 위치·소유 |
|---|---|
| native_source_new_run_state.gd:9–11 | 기존 META-06/META-01 preload와 native_level_up_handoff signal 추가 |
| 같은525–547 | 임시 demo=true State 값·owner 검증 setter·detached 마지막 인계 읽기/결과 packet. P/G의 저장 필드 추가0 |
| 같은549–584 | 실제 addExp에 entry/loop gate 연결, 기존 curve 호출, non-demo 초월 HOLD 보존. 수식 복제0 |
| 같은586–611 | 기존 회복 authority·SP/AP·해금 순서 유지, source 색상·level-up 완료 후 단일 handoff signal. 마지막 영수증은 진단/late read이며 영구 큐/저장 완료가 아님 |
| Main 원본159–175 (수정0) → DEMO11-01 | player/State가 같은 Tree의 실제 owner가 된 뒤 `source_state.configure_native_demo_exp_mode(self, actual_demo_bool)` 호출. 미설정은 G16646처럼true. 임시 값이 최종 빌드 정책 권위라는 주장0 |
| State signal → DEMO11-06 | `native_level_up_handoff(packet)`에 실제 저장 owner를 연결하고 현재 State/Providers의 기존 collector readers 사용. packet.save는 requested=true/committed=false/method=dbSaveForce/source_line43171, payload/저장키 새 설계0 |
| State signal → 표시 owner | packet.presentation의title/color/duration_ms2500/demonic·lv/exp/SP/AP/회복 결과 전달. 실제 HUD는 기존hud.gd:786–802 pull을 그대로 사용. showPH/VFX/SFX 연결은 후속 표시 owner |
| State 회복 직전 → DEMO11-19 | 기존 passive queue 미연결은 유지. 예약큐 실제 소비·applyStats는 그 owner가 원문G43157 위치(회복 전)에 연결. 이 단위가 전투/패시브 효과를 재구현하지 않음 |

`native_level_up_handoff`는 회복·해금 뒤1회이며, 반환·signal·read API는 detached packet이다. serial은 런타임 진단값일 뿐 save schema에 넣지 않는다. 소비자가 없다고 자동 파일 저장이나 가짜 ack를 만들지 않는다. 실제 save collector는 `reader:save_globals`가 없어 **HOLD/payload=null**임을 확인했다. 따라서 **저장 인계 준비와 실제 저장 완료를 구분**한다. 기존 hurtE caller의 XP 전처리/텍스트 경로는 PC 소유 그대로0줄이며, 그 앞에 별도 cap 전처리를 추가하지 않는다.

## 검증·제출

최초 제출 검증은 관련 suite만 각각 **1회**, 실패0이므로 그 단계의 재실행0이다. 신규 `test_demo11_20_exp_cap` **214/0(원본 oracle10사례)**, META-06 **1034/0**, META-01 **20/0**, P2001c 처치 보상 **45/0**: 합 **1313/0**, 모두exit0/skip0/ERROR0. headless editor import1회는 시험 통과 수에 합산하지 않는다. pgrep -f Godot.app/Contents/MacOS/Godot | wc -l을 동일 argv 파이프로 매run 확인했고 수2일 때30초 대기했다. 원로그 `~/exoduser-wt/_out/demo11-20/`(L)의 godot-gate.jsonl/result/stdout/stderr, override는 각run 설정 후0byte다. 신규 USERDIR는 EXODUSER-demo11-20-Isolated-20261021, 기존3회귀는 파일 상수 이름 사용.

신규 테스트는 Camera2D physics interpolation WARNING1, 기존 P2001c는 같은 Camera2D WARNING와 종료 **ObjectDB2 누수 WARNING**를 관측했다. 원문 보존·누수0 주장0이며, 본 단위에서 원인이나 main 대비 선재 여부를 단정하지 않고 추가 실행/피해 경로 수정은 하지 않았다. 신규 테스트 종료는 실제 Main queue_free 뒤12frame+200ms 정리한다. 코드 외 변경 후 회귀를 반복하지 않았다.

원본·큰 JSON 전체를 출력하지 않았으며 Node는 --node-bin 명시, OS.execute는 모든 chunk를 join했다. UI 실창/스크린샷·PC/실제 세이브/복원 검증은 미실행. 수식·자원 회복 원본·Main/HUD/피해/맵/저장 collector·META 정책·docs/2_3는 변경0이다. 관련 META 추적 문서와 CHANGELOG·자기 WORK_BOARD 행만 갱신한다. 정상 훅·정확 경로 staging·자기 branch 일반push·원격 SHA/DONE 후 자기worktree 제거, R branch/head·tracked INDEX/WORK 보존. 실제 최종 SHA·원격·정리 결과는 L/DONE.txt와 final-receipt.json을 따른다.


## 후속 — 성능 수정 main 병합 (2026-10-21)

기존 제출726cf925를 유지한 같은 브랜치에 최신 origin/main **aa1eaea5a1fa70b31eae6fd907662ee13471c08d**를 정상 merge했다(rebase0/충돌0). 상위 기준은 [GODOT_METHOD_LIST_TICK_COST_20261021](../../../12퍼포먼스·최적화/GODOT_METHOD_LIST_TICK_COST_20261021.md)다. 상위 PC 수정은 native_combat_qe_adapter/native_resource_regeneration_adapter/native_source_player_regeneration_phase의 정적 arity cache이며, 본 담당이 피해·Q/E·회복 공용 코드를 추가 수정한 것이 아니다.

이번 단위 State·META-01/06·신규 테스트/oracle의 get_method_list/get_property_list/get_signal_list 호출은 **0개**다. 이 파일들의 제품/테스트 바이트는726cf925와 동일하다(`L/followup-list-api-audit.json`). State의 기존 advance_native_fireball_clock도 같은 파일 내 목록 생성 호출이 없다. 새 cache 수정은 필요없었다. 성능 수치가 개선됐다는 별도 Mac 측정 주장은 하지 않으며 Performance 지표·벽시계 벤치 모두 실행하지 않았다. 후속 성능 확인이 필요할 때는 물리 N틱 고정 벽시계 방식만 사용한다.

후속 병합본의 동일 직접 관련4suite를 각각 **1회** 재실행했다: 신규 **214/0**, META-06 **1034/0**, META-01 **20/0**, P2001c **45/0**, 합 **1313/0**, skip0·exit0·ERROR0. 최초 로그는 보존하고 `followup-` 접두어로 별도 기록했다. 매Godot gate·각파일 격리명·override0byte를 확인했다. P2001c의 ObjectDB2 종료 WARNING는 후속에서도 관측했으며 원문을 보존한다. 별도 성능 벤치는 실행하지 않았다. 정상 merge commit의 신규SHA·원격 일치·추가 DONE·자기 worktree 제거·R 불변은 L/DONE.txt와 final-receipt.json에 기록한다.
