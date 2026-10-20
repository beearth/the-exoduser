# BC4-02 — CH4 catalog를 전달하는 독립 진입점

BC4-02를 구현했다. 신규 748단정/0실패, 직접 관련 BC2-02 회귀 44,891단정/0실패다. BC02~07의 원래 함수에 CH4 catalog를 마지막 인자로 전달한다. packet 사후 덮어쓰기·공통 계산식 복제·실전 연결은 없다.

## 기준·의존

| 항목 | 확인 |
|---|---|
| 작업 / 브랜치 | bc4-02 / codex/bc4-02-20261020 |
| 최신 main | fetch 후 0105159934d0c2a8b167bd51518dca1e0fafe50a |
| 명시 승인 의존 | BC-INTEG-01 dcd32b491910c0a1485b4cde8b3ba6b1009aedfc, BC4-01 ca14a09fa08faa0748e904f97fb5dbff4da748b6. 당시 main에 없어 정상 --no-ff merge |
| 병합 기준점 | 70b4d5b1e42ff7de579b7ddd3751d2a6d15c2fe5. 첫 merge 47579edc39488b36d5b0fd5fd551587bf848784f, 두 번째 merge의 부모는 첫 merge와 ca14a09f. rebase·cherry-pick 없음 |
| 충돌 처리 | 문서 추가 충돌만 처리. CHANGELOG는 각 단계의 HEAD byte 전체를 보존하고 의존 절을 prepend. WORK_BOARD는 main 내용 보존 후 dcd의 자기 행만 추가. 타 절·상태 재작성 없음 |
| 읽기 참조 | BC3-02 2bd9b68aeb35348663113f8466f0eba30e903e8c의 진입점 구조·테스트 scaffolding. 해당 브랜치 merge 없음 |
| 자기 변경 | 신규 native_ch4_boss_reuse.gd·새 테스트·oracle·자기 UID 2개·이 보고서·CHANGELOG 절: 7개. 공유 Main/State/World/hurtE·저장·BC08·기존 제품/테스트 0줄 |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017, tracked INDEX/WORK 보존 |

의존 merge가 포함한 spawn 색/BC08 파일은 dcd32b49와 byte 동일, CH4 catalog는 ca14a09f와 byte 동일임을 확인했다. BC08 체인 수정·검수는 ttys009 소유로 남긴다. 위 의존 merge와 이번 자기 변경을 구분한다.

## 진입점·원문·경계

build_spawn_packet/evaluate_move/select_tick/phase_transition/clock_step/begin_phase_effects/begin_start/begin_tick은 각각 기존 BC02~07에 마지막 인자로 Catalog를 전달한다. continuation API는 같은 CH4 Script·실 si14..20을 확인한 뒤 기존 owner에게 그대로 넘긴다. provider/path/source hash는 기존 CatalogContext가 검증한다. 반환값의 Variant 타입·키 순서·float 비트·Script 동일성까지 명시적 공통 호출과 대조했다.

원문은 game.html SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4다. G31119–31185 생성식/G14333·14338·31163·16683·16707의 STG.be→ELC 경로를 실행해 실제 si14..20의 EL.F1·#ff5522·dropTier4를 확인했다. 원문 HP/ATK/부활 포인트·placement reads·6draw 순서를 모두 비교했으며 기대 색·필드를 사후 계산으로 덮어쓰지 않았다.

BC03 원문 G37650–37700의 score 3개, BC04 G38373–38442의 selector 1개, BC05 공통 phase/clock 2개, BC06 G37701–38233의 burst 시작 1개, BC07 공통 slash wind 1개를 별도 원본 VM에서 실행했다. source scaffolding의 원문 추출·SHA pin은 기존 채택판 그대로이며 fixture 입력만 CH4 실제 stage/원소로 바꿨다. 원본 전체나 큰 JSON을 도구 출력으로 덤프하지 않았다. OS.execute는 전체 join·UTF-8 파일, Node와 source는 --node-bin/--source-game 명시 인자다.

원문 VM이 구한 공통 시작은 22개, 다른 owner가 필요한 등록 시작은 23개다. 23=CH2 고유10+CH3 신규7+CH4 신규6이며, 해당 기능을 완료로 세지 않는다. 대표 vortex/teleStrike/meteor의 pattern_start_owner_required를 검사했다. 실제 CH4 token 2개를 시작·근접에서 확인했고, phase effects token도 si16/CH4 provider를 유지했다. 결함 주입은 복사 token의 provider/path/hash/si 4종과 ack 누락 1종, 총 5종만 수행했다. 잘못된 token은 세 continuation API 모두 NOT_READY·입력 불변·RNG0이다. 결함 fixture를 실제 제품 변경이나 실제 피해 집행으로 보고하지 않는다.

독립 원본 수송은 정수 문자열/binary64 hex다. 원본의 정수 기대값은 정확 비교, 비정수 연산은 채택 BC3-02의 1e-12 비교를 늘리지 않고 유지했다. 공통 함수와의 위임 비교는 허용오차 없이 Variant 타입/키 순서/binary64/Object identity까지 정확 비교했다. 실제 효과 owner 성공·hurtE·피해·부활·저장·BC08 이동을 검수한 결과가 아니다.

## 실행 결과

| 실행(각 1회) | 수치 | exit / ERROR / ObjectDB / resource 잔류 | 초 |
|---|---|---|---:|
| import-01 | import | 0 / 0 / 0 / 0 | 12.945 |
| new-01 | 748단정 / 0실패 | 0 / 0 / 0 / 0 | 503.445 |
| bc2-02-regression | 44,891단정 / 0실패 | 0 / 0 / 0 / 0 | 40.508 |

Godot 4.7.2 headless --verbose 총 3회, 정상 stderr 모두 0byte. 새 테스트는 EXODUSER-bc4-02-Isolated-20261020, 기존 회귀는 파일 상수 EXODUSER-bc2-02-Isolated-20261020을 사용했다. 실행 전 지정 pgrep count<2를 확인하고, count2 이상일 때 30초씩 총 0회 대기했다. override는 실행마다 설정하고 finally에서 0byte로 비웠다.

최적화 지시에 따라 직접 관련 BC2-02 스위트만 1회 실행했다. 변경 없는 BC4-01 catalog 대형 검증과 다른 회귀는 반복하지 않았다. 출력은 파일로 저장하고 RESULT/FAIL/ERROR/PROGRESS만 좁혀 확인했다. 새 원문 fixture는 spawn7/score3/select1/phase2/start1/melee1, 총 15사례다. 신규 소요 시간은 503.445초이며 provider 반복 검증 비용을 포함한다. 실전 FPS 성능 증거는 아니다.

원로그·의존 병합·byte 검증은 ~/exoduser-wt/_out/bc4-02/에 보관한다. 정상 pre-commit 훅·정확한 경로 staging 후 자기 브랜치만 push, 원격 SHA 일치·DONE 작성 뒤 자기 worktree를 제거한다. 실제 user dir의 최초 제출 검증은 한 차례 불일치했으나 파일 수정 없이 경로별 hash를 다시 대조한 결과 최종 before/after는 동일했다. 최초 불일치 원인은 미확인이며 verification-observation.json에 남겼다. 최종 SHA·원격·R/실제 user dir 보존·정리 결과는 submission.json/DONE.txt/cleanup-verification.json에 기록한다. Main/State/저장과 실제 actor/판정 연결은 HOLD, 다음 단위는 별도 배정 전 착수하지 않는다.
