# BC4-01 — 4장 보스 읽기 전용 catalog

## 결과·기준·의존

7슬롯의 Set 39~45개, 기술 union45=공유39+신규6, 콤보 union54=공유46+신규8, 공통 5phase를 구현했다. 신규 90,060단정/0실패, 기존 관련 회귀 96,232단정/0실패, contracts 5그룹/0실패다. 등록 조회만 구현했으며 실제 전투·피격·부활·화면은 연결하지 않았다.

| 항목 | 확인 |
|---|---|
| 작업 / 브랜치 | bc4-01 / codex/bc4-01-20261020 |
| 기준 | fetch 후 origin/main 823c24baee3f6c5f058ebfd7776721e86f80bd18. 요청 하한 충족, --no-checkout+sparse worktree 생성 |
| 지시서 | trace-boss-ch4 c50fb353 §5.1. 조사 당시 BLOCKED였던 CH2·CH3 provider는 현재 main에서 실물 확인 |
| 채택 의존 | CH2 catalog/bridge a3b5391c54bb62b9f784bf2acac12bfbd2747192, CH3 catalog ec9f14492f587d4d3dfea5780c55bd709875e3e6. 모두 main 조상임을 확인. 미병합 브랜치 merge/cherry-pick/복사 없음 |
| 자기 파일 | native_ch4_boss_catalog.gd, test_boss_ch4_bc4_01_catalog.gd, bc4_01_source_oracle.cjs, 자기 UID 2개, 이 보고서, CHANGELOG 절: 7개 |
| 공용·타 담당 | Main/State/World/hurtE·저장·spawn 색·BC08·CH1~3 기존 제품/테스트 변경 0줄 |
| 원본 | game.html 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. 최신 main 원본 변경 없음 |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017. tracked INDEX/WORK 보존 |

CHANGELOG는 맨 위에 자기 절만 추가하고 기준 main의 3,706,707byte 전체를 그대로 뒤에 보존했다. main에 선재한 충돌 표식 12행도 기존 내용으로 보존했다. 다른 절 정리나 공유 작업판 수정은 하지 않았다.

## 원본 행·소유 분리

| 원본 game.html 행 | 구현·검사 |
|---|---|
| 9983–9990/10009–10010 | 기본 최종 Set 삽입 순서 39개, si15 swordWave/16 pillars/17 burstCounter/18 wallPush/19 gravityWell/20 chainLightning 누적, cage 전체 제외 |
| 16692/14333/14338/31163 | 화염 악마·불기둥 수호자·용암의 심장·화염 전사·화염 쌍두·불벌레 군주·화염 감옥지기. si14..20, hell3/ibtrue/etype0/element_id1/색 #ff5522는 catalog metadata만 제공 |
| 9821–9879 | CH3.move_by_id의 37개와 CH2 bridge의 poisonTrail/wallPush 2개 조회. 원필드 11개+source_ordinal/line 검증·깊은 복사. 공유 literal 재전사 없음 |
| 9828/9842/9845/9850/9852/9864 | 신규 meteor/radialLaser/swordWave/pillars/burstCounter/chainLightning의 원필드 11개와 ordinal/line만 자기 소유 |
| 9852/9864 | burstCounter idx60≠ordinal31, chainLightning idx42≠ordinal43. 원본 CD 배열·감산 루프나 선택 동작 수정 없음 |
| 9882–9949 | CH3 public combos 44개와 CH2 ordinal47/48만 수집해 공유46 구성. 동일 ordinal 반복 조회만 합치며 같은 seq의 다른 ordinal은 보존 |
| 9895/9896/9912/9913/9914/9917/9931/9938 | 신규 combo ordinal13/14/30/31/32/35/49/56. 56은 새 기술이 없는 wallPush+gravityWell 조합이며 si19·phase3부터 유효 |
| 9951–9957 | 5phase×8필드는 CH3 provider에서 위임받고 CH2와 값 교차 확인. CH4용 phase·HP 계산식 복제 없음 |

receipt는 원본 hash·기준 main·두 채택 SHA·원본 범위·global59/68/phase5·stages14..20·45=39+6·54=46+8·max_source_idx60/active_idx60=true를 제공한다. global move_manifest는 기존 provider 값을 깊은 복사한다. live_combat_connected=false/save_io=false/rng_draws=0이다.

## API·실패·불변

source_receipt(), boss_for_stage(si), moves_for_stage(si), move_by_id(id), phase_by_index(phase), combos_for_stage(si,phase)의 정적 int/String 계약을 유지했다. 미지원 stage는 unsupported_chapter_stage, 의존 손상은 ready=false/status=NOT_READY/dependency_unready로 구분한다. 의존 실패 시 부분 moves/phases/combos를 반환하지 않는다. 배열 getter는 빈 결과이며 receipt로 의존 실패 원인을 확인한다.

두 provider의 전체 manifest/hash/global 개수·5phase schema를 검사한다. 공통 30move/36combo의 동일 내용도 교차 확인한다. CH3의 37move/44combo, CH2의 32move/38combo를 실제 public API로 읽으며 공유46만 반입한다. 누락·충돌을 성공한 빈 catalog로 위장하지 않는다. 순수 _assemble_snapshot의 음성 fixture는 실제 provider를 대체하지 않는다.

출력은 nested 값까지 깊은 복사한다. boss/moves/개별 own·CH3·CH2 move/phase/combos/receipt를 변경한 뒤 재조회·다른 stage·원래 두 provider 조회가 보존됨을 확인했다. 공유 RNG seed 전후와 scene node 수를 검사했으며 제품에는 IO/씬/실제 RNG 진입부가 없다.

## 독립 oracle·검사 범위

기대값은 원문 등록 선언만 별도 Node VM에서 실행해 얻었다. 제품 catalog는 oracle에서 import하지 않는다. 전체 SHA, 4개 구간 SHA, 고유 선언 marker, global59/68/5를 실행 전에 고정 검증한다. 원본 경로는 --source-game, Node 경로는 --node-bin 명시 인자다. OS.execute 출력 전체 join과 새 UTF-8 fixture 파일을 사용한다. 정수 문자열/binary64 hex carrier를 복원하고 타입·정수 정확 동등·실수 binary64 byte 동등으로 전 필드를 비교한다. epsilon은 사용하지 않았다.

7Set의 전 ID와 삽입 순서, 45move의 13필드, 54combo의 4필드, 5phase의 8필드, 전체 7×5 후보 목록과 수를 대조했다. 테스트에는 원본 행 범위와 개별 source_line을 남겼다. 후보 수는 다음과 같으며 실제 selector·move.phase/CD/RNG 통과 수와 구분한다.

| si | phase0 | phase1 | phase2 | phase3 | phase4 |
|---:|---:|---:|---:|---:|---:|
| 14 | 16 | 32 | 43 | 46 | 46 |
| 15 | 17 | 34 | 46 | 49 | 49 |
| 16 | 17 | 35 | 47 | 50 | 50 |
| 17 | 17 | 35 | 47 | 50 | 50 |
| 18 | 17 | 35 | 48 | 51 | 51 |
| 19 | 17 | 35 | 49 | 53 | 53 |
| 20 | 17 | 36 | 50 | 54 | 54 |

경계는 si13/21과 정수 극값, phase−1/5, 알 수 없는 ID/cage/tailSwipe/burrowStrike/장 밖 기술, counter·chain 해금, idx와 ordinal 구분, combo47/48/56, stage 밖 combo 힌트 보존을 포함한다. 양쪽 receipt/manifest/필수 move/combo/phase 필드 제거, 잘못된 hash·idx·형태·비유한 수, 30개 겹치는 move의 값 차이·phase/combo 차이·반복 조회 충돌은 NOT_READY를 확인했다. 동일 seq/다른 ordinal은 두 provider에서 일치시킨 순수 fixture로 보존 여부를 확인했다. 변조한 임시 원본 복사는 SHA 단계에서 exit1·fixture 미생성으로 거부했고 삭제했다.

## 실행 결과

Godot 4.7.2.stable.official.ed1daf0bf, headless --verbose로 아래를 실제 실행했다. 이전 PASS는 합산하지 않았다.

| 원로그 basename | 수치 | exit / ERROR / ObjectDB / resource 잔류 | 초 |
|---|---|---|---:|
| import-01 | import | 0 / 0 / 0 / 0 | 14.321 |
| catalog-new-01 | 90,060단정 / 0실패 | 0 / 0 / 0 / 0 | 598.290 |
| bc01-regression | 681단정 / 0실패 | 0 / 0 / 0 / 0 | 0.181 |
| bc2-01-regression | 7,169단정 / 0실패 | 0 / 0 / 0 / 0 | 0.346 |
| bc2-02-regression | 44,891단정 / 0실패 | 0 / 0 / 0 / 0 | 40.101 |
| bc3-01r-regression | 43,491단정 / 0실패 | 0 / 0 / 0 / 0 | 6.471 |
| contracts | 5그룹 / 0실패 | 0 / 0 / 0 / 0 | 2.237 |

총 Godot 7회이며 정상 stderr는 모두 0byte다. 실행 직전 지정 pgrep으로 count<2를 확인했고, 2 이상일 때 30초씩 36회 대기했다. 자기 실행은 순차 1개이며 타 프로세스 종료는 없다. override는 매 run 설정 후 finally에서 0byte로 비웠다. 새 테스트 user dir은 EXODUSER-bc4-01-Isolated-20261020, 기존 4개 테스트는 각 파일 상수다. 상수가 없는 contracts만 EXODUSER-bc4-01-Contracts-Isolated-20261020을 사용했다.

신규 실행 시간은 598.290초다. 현재 공유 provider의 반복 검증 비용을 포함한 catalog 검수이며 실전 60Hz/FPS 증거가 아니다. 실사용 최적화나 공유 모듈 변경은 하지 않았다.

## HOLD·제출

이 단위는 읽기 전용 등록이다. spawn 색·BC08은 bc-integ-01 소유이며 0줄, Main/State/hurtE·저장·실전 actor/피해/counter·부활·효과 연결도 HOLD다. 다음 단위는 별도 배정 전 착수하지 않는다.

원로그는 ~/exoduser-wt/_out/bc4-01/에 보관한다. 원문 fixture·음성 검사·모든 *.out/*.err/*.engine.log/*.gate.jsonl/*.json, 실행/제출 byte·의존 조상·R/실제 user dir 보존 검증을 포함한다. 정상 훅·경로 지정 staging 후 자기 브랜치만 push하고 원격 SHA 일치·DONE 작성 뒤 자기 worktree를 제거한다. 최종 SHA·원격·정리 결과는 submission.json/DONE.txt/cleanup-verification.json에 기록한다.
