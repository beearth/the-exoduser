# BC3-01r — 3장 보스 읽기 전용 catalog

## 재착수 기준·의존·소유

| 항목 | 확인 |
|---|---|
| 작업 / branch | bc3-01r / codex/bc3-01r-20261020 / ~/exoduser-wt/bc3-01r |
| 기준 | git fetch 후 origin/main=249c26fad989071a94c19128e524ce0bbcb2c8c9. 요청 하한 b25a018ace5a3fa65c9c2476a8c3ac92509077b3 이후임을 ancestor 검사 |
| 선행 인수 | BC2-01 6e6f2f58633bb7a54fa0cf1a9cd3df3dc1535aba와 BC2-02 a3b5391c54bb62b9f784bf2acac12bfbd2747192 모두 main ancestor. CH2 catalog·bridge·context는 a3b와 동일 byte |
| 이전 차단 | [56353bdb 보고서](https://github.com/beearth/the-exoduser/blob/56353bdb0d4f9306607e48ef7456a3b725535a37/docs/engine/orders/reports/bc3-01_REPORT.md)의 두 provider 부재가 해소됨. 이전 codex/bc3-01-20261020=56353bdb0d4f9306607e48ef7456a3b725535a37 보존. 그 끝에서 분기·병합·복사하지 않음 |
| 지시서 | [trace-boss-ch3 7a3080a4 §5.1](https://github.com/beearth/the-exoduser/blob/7a3080a46863ac34f0a3e7864a003e5a7ff0f55c/docs/engine/FDG_SOURCE_TRACE_BOSS_CH3_20261020.md), 최신 사용자 격리명·spawn 색/BC08 별도 담당 지시 우선 |
| 작업 폴더 | --no-checkout worktree 후 non-cone sparse-checkout. 필요한 godot/docs/engine/tools/game·훅만 수신, 웹 대형 에셋0 |
| 자기 변경 | 신규 native_ch3_boss_catalog.gd·신규 test_boss_ch3_bc3_01_catalog.gd·자기 UID2·신규 bc3_01_source_oracle.cjs·이 보고서·허용 CHANGELOG 절. 기존 제품·테스트·공용 Main/State/hurtE·저장·spawn/BC08 변경0줄 |
| 원본 | game.html 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. main blob과 체크아웃 동일, 원본 변경0 |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017. tracked INDEX/WORK 빈 상태 보존 |

## 등록·API·원본 근거

| 원본 game.html 행 | 구현 계약 |
|---|---|
| 9976–9981 /10009–10010 | si10~13 최종 Set32/34/36/37. 기본32 삽입 순서 뒤 si11 teleStrike/delaySlash,si12 perilThrust/spiralBullet,si13 gravityWell 누적. 최초 cageTrap은 최종 전역 삭제 반영 |
| 16691 /16698–16712 /14333/14338 /31163 | 얼음 망령/서리의 기사/얼어붙은 감시자/얼음 속 봉인 괴물, hell2/element_id2/ibtrue/etype0. element_color #3388ff는 읽기 metadata이며 실제 spawn 색을 덮어쓰지 않음 |
| 9820–9880 | union37, 공통30은 CH2 bridge.move_by_id 공개 조회. 원본11필드+source_ordinal/source_line 보존. moves_for_stage는 globalordinal 순서, boss.move_ids는 Set 삽입 순서 |
| 9825/9837/9848–9849/9860/9875/9877 | 신규7 literal만 소유: laser/teleStrike/delaySlash/perilThrust/gravityWell/safeCorner/tidalWipe. idx와ordinal을 구분하고, CH3 밖 swordWave/wallPush 등의 metadata.combo 힌트는 원문 그대로 |
| 9951–9957 | phase5×8필드를 CH2 bridge.phase_by_index로 위임. HP 경계·배율·label 공통 표를 복제하지 않음 |
| 9881–9950 | 공유36 ordinal은 CH2 si4~9×phase0~4 공개 API에서 수집. 같은 ordinal 재조회만 중복 제거하고 같은 seq의 다른 ordinal은 유지. 신규8 ordinal16/22/24/34/44/63/65/67만 소유. 모든 seq가 해당 Set에 있고 combo.phase 일치인44개를 globalordinal로 반환 |
| 9821–9879 | Shared의 원문 global59 manifest를 그대로 receipt에 깊은 복사. id/idx/ordinal/행의 정규 identity 문자열 SHA256을 원본에서 고정해, CH3 밖 항목의 잘못된 manifest도 명시 거부. 공유59 literal 재전사0 |

| API | 계약 |
|---|---|
| source_receipt() | ready/status·reason, 최신 기준main/원본hash·채택 의존SHA·원본행·global59/68/phase5·37=30+7/44=36+8·maxidx56·stages10..13·미연결 표시. 성공 시 기존 context가 검사하는 move_manifest 원형 전달 |
| boss_for_stage(si) | si10..13만 supported, 그 밖 unsupported_chapter_stage. 실제 provider 오류는 supported=false/status=NOT_READY/reason=dependency_unready로 미지원 stage와 구분 |
| moves_for_stage /move_by_id | 원본순서·깊은 복사. poisonTrail/wallPush/tailSwipe/burrowStrike/cageTrap 및 CH3 union 밖 ID는 빈 결과 |
| phase_by_index /combos_for_stage | 유효 범위만 조회. phase는 공통8필드, combo는 seq/phase/ordinal/행4필드. 중첩 배열 변경·다른 stage·Shared의 값과 별칭 없음 |
| 내부 snapshot 경계 | receipt.ready/hash/global counts/전체 manifest·필수30move/5phase/36combo를 검증. 누락·잘못된 형식·비유한수·identity 불일치·상충 ordinal이면 ready=false/status=NOT_READY와 reason만. 부분 moves/phases/combos 없는 실패. fixture가 실제 Shared를 교체하지 않음 |

| si | 이름 | Set 수 | combo phase0/1/2/3/4 |
|---:|---|---:|---|
| 10 | 얼음 망령 | 32 | 15/27/35/38/38 |
| 11 | 서리의 기사 | 34 | 15/29/37/40/40 |
| 12 | 얼어붙은 감시자 | 36 | 16/30/40/43/43 |
| 13 | 얼음 속 봉인 괴물 | 37 | 16/30/41/44/44 |

위 콤보 수는 Set+combo.phase 필터의 정적 후보 수다. 첫 기술·score/CD/RNG까지 통과한 자연 선택·발동 횟수가 아니다. 데이터 조회 성공은 실제 3장 보스 전투 인수가 아니다.

## 독립 원본 검사·격리

새 Node oracle은 제품을 import하지 않고 최신 game.html의 원문 선언만 VM에서 평가한다. 전체 SHA, 고유 선언 marker와 발췌4구간의 SHA를 먼저 검사한다. 범위는 G9820–10011/14333/14338/16633–16712이며 실제 게임·AI·저장 코드를 실행하지 않는다. 기대값은 제품에서 생성하지 않는다.

4슬롯 모든 id/순서·이름·원소색,37move의11원필드+메타2,44combo의 seq/phase/ordinal/행,5phase×8필드,20후보 배열을 전수 대조한다. OS.execute는 --node-bin 명시 인자를 사용하고 모든 output을 join한다. 한글 이름을 포함한 fixture는 새 UTF-8 임시 파일로 읽는다. 정수는 십진 문자열 carrier로 int 복원, 소수는 binary64 little-endian hex로 복원하고 **비트 단위 정확 비교**한다. epsilon/첫 출력 조각/제품 기대값/skip 없음.

추가 검사는 stage9/14 등을 포함한 범위 밖, phase−1/5, 알 수 없는 ID·금지 cage, Shared 필수 데이터 누락·오류, 같은 seq/다른 ordinal 보존, 전체 반환 중첩값·타 stage·Shared 불변이다. 실제 전역 RNG를 seed 전후로 비교해 query가 draw를 소비하지 않음을 검사하고, node 수 불변과 제품의 runtime/IO/RNG 진입 부재도 확인했다. 이 fixture는 Main/State/hurtE·HP·spawn 색/BC08을 실행하거나 고치지 않는다.

모든 Godot 호출 직전에 `pgrep -f "Godot.app/Contents/MacOS/Godot"` 결과의 `wc -l`을 확인했다. count2일 때 30초씩2회 대기, 실제 launch 직전은 전부 count1. Godot는 자기 순차1개, 타 프로세스 종료0. override.cfg를 매 run 설정하고 finally에서0byte로 비웠다. 새 테스트는 ProjectSettings 두 값과 실제 OS userdir가 EXODUSER-bc3-01r-Isolated-20261020인지 검사한다. 기존3회귀는 각 파일 USERDIR 그대로, 상수가 없는 contracts만 별도 EXODUSER-bc3-01r-Contracts-Isolated-20261020을 사용했다.

Godot import도 새 격리명으로 실행했다. 실제 userdir EXODUSER-Godot-Native-First의 테스트 전후6파일 hash는 동일하다. Godot가 만든 타 파일의 untracked import/UID/cache는 제출에 포함하지 않으며, 자기 worktree 제거와 함께 정리한다. 원본·기존 tracked 제품/테스트는 변경0이다.

## 실제 결과·검사 수

Godot 4.7.2.stable.official.ed1daf0bf, headless --verbose. 정식 신규/관련회귀의 서로 다른4개 단정 suite 합계 **96,232단정·0실패**, contracts는 별도 **5그룹·0실패**다. 복원 후 재검사를 합계에 중복 가산하지 않는다.

| 실행 / 원로그 basename | 검사·실패 | exit / 종료 |
|---|---|---|
| import-01 | import | exit0/ERROR0/ObjectDB0/resource잔류0 |
| catalog-01 (신규) | 43,491 /0 | exit0/ERROR0/ObjectDB0/resource잔류0 |
| bc01-regression | 681 /0 | exit0/ERROR0/ObjectDB0/resource잔류0 |
| bc2-01-regression | 7,169 /0 | exit0/ERROR0/ObjectDB0/resource잔류0 |
| bc2-02-regression | 44,891 /0 | exit0/ERROR0/ObjectDB0/resource잔류0 |
| contracts | map/charge/projectile/pause_capture/damage 5그룹 /0 | exit0/ERROR0/ObjectDB0/resource잔류0 |
| catalog-final (복원 후) | 43,491 /0 | exit0/ERROR0/ObjectDB0/resource잔류0 |

신규 검사도 오류를 검출하는지 자기 신규 제품 파일에만 임시 결함을 주입해 확인했다. 검사는 바꾸지 않았다.

| 결함 주입 / 원로그 | 검출 실패 수 | 결과 |
|---|---:|---|
| mutant-laser-tele: laser.tele40→41 | 6 | 실제 값 불일치로 exit1,파싱·runtime ERROR0 |
| mutant-unlock: si13 gravityWell 해금 누락 | 515 | 실제 Set/기술/콤보 불일치로 exit1,파싱·runtime ERROR0 |
| mutant-seq-dedup: seq 내용으로 ordinal 중복 제거 | 2 | 다른 ordinal 보존 fixture가 검출해 exit1,파싱·runtime ERROR0 |

세 결함 후 제품/test/oracle은 원래 byte로 복원했고 catalog-final로 재검증했다. 모든 정상 실행 stderr는 빈 값이고, 결함 실행 stderr는 의도한 BC3_01R_FAIL뿐이다. Godot 총10회(그중 결함3회), 정상7회·결함3회 구분. 실패 결과를 정상 PASS로 합산하지 않는다. 로비·실전·실창·PC/Windows 실행·성능·실저장은 이번 미검수다.

원로그: ~/exoduser-wt/_out/bc3-01r/의 *.gate.jsonl/*.out/*.err/*.engine.log/*.json, dependencies.json, baseline-results.json, mutation-results.json, original-userdir hash snapshot, source/oracle·실행/제출 byte 대조 기록. docs 관련 검색319행은 docs-search.txt다.

## 다음 단위·HOLD·제출

이번 catalog는 등록·순수 읽기만 완료했다. 다음 BC3-02의 일반화된 BC 공개 인수·실si/얼음 fixture는 별도 배정이다. **spawn 색은 다른 창, BC08 일반화도 다른 창 담당**이므로 이번0줄이다. 기존 source_receipt/state guard를 우회하거나 packet 색을 사후 덮어쓰지 않았다. 보스 Main/State/factory/World·실 actor/시계/피해/부활·HUD/음향·저장 연결은 계속 HOLD다.

정상 pre-commit·경로 지정 staging·자기 branch만 비강제 push·원격SHA 일치→외부 DONE.txt→자기 worktree 제거 순서로 마감한다. 최종 commit SHA·원격 일치·R/이전 branch 보존·정리 결과는 외부 submission.json/DONE.txt/cleanup-verification.json에 기록한다. main push·force·reset·git add -A 없음.
