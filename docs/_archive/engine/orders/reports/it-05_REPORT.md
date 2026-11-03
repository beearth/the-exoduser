# IT-05 — 특수효과 툴팁 읽기 전용 모델 인수 보고서

2026-10-20 KST · 작업ID `it-05` · **구현·관련 회귀 완료 / 총괄 검수 대기**. 실제 인벤토리 상세 패널 연결·효과 실행·저장 writer는 별도다.

## 기준·의존·소유

| 항목 | 실제 확인 |
|---|---|
| 원격/분기 | main ref 명시 fetch 후 origin/main `e556b617190c325ca39f5add04357f5dea5ca87e`. IT-04 b950095b ancestor 검사 exit1(main 미포함). 지시대로 IT-04 끝 `b950095bb10e6337a153d4c489fd811b99029cf7`에서 새 codex/it-05-20261020 분기. IT-01~04 포함 의존을 병합 담당에게 인계 |
| sparse | 사용자 지정 git -C R worktree add --no-checkout -b로 ~/exoduser-wt/it-05 생성 후 그 안에서 no-cone sparse-checkout/read-tree. godot/docs/engine/test/tools/game/index 및 루트 js/json, AGENTS/hook/ignore/attributes만 배치. 웹 대용량 에셋 폴더0, 약946MiB, 시작 tracked INDEX/WORK 차이0 |
| 지시서 | 위 main의 FDG_SOURCE_TRACE_ITEMS_20261020.md §4.2 IT-05. 신규 item_special_text_source/producer.gd·test_native_item_special_text_source.gd. 최신 작업판에 이 경로의 별도 활성 소유 충돌 행 없음 |
| 원본 | 위 main game.html65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 전설 stat 역색인/ko16625~16626, 툴팁49822~49847. 기존19/39 정의는15037~15057/15084~15129 |
| 실제 변경 | 신규 producer·신규 test·이 보고서·허용된 CHANGELOG_SYNC 최상단 절, 총4경로. 기존 item_generation_tables.json·IT-01~04·P2-001c 생성기·다른 담당 파일0줄 |
| 공용/보호 | main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 0줄. Q/E·docs/2_3·game/index·장착 writer·세이브 schema/복원 변경0. 실제 TI-03 화면·외관/효과 실행은 연결하지 않음 |
| P2-006a | 기준 main 및 분기 tree에서 native_world_drops.gd/world_drops/pickup_contract 경로 미발견. 해당 구현 이송·재작성·드랍/줍기 연결0 |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, branch codex/mac-live-play-time-main-20261017, HEAD dd49171c5b88e211575a41f185395d6c0a14b184. tracked 파일/INDEX/branch·서버·열린 앱 조작0. 새/제거 worktree의 Git 관리 메타데이터와 fetch 공유 ref 갱신은 R 코드 변경과 구분 |
| 알려진 로비 | **총괄 전달 원문:** “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번 로비 전체 실행/파일 수정0이며 원인 해결/독립 재현을 주장하지 않음 |

## 모델 계약

`new(legendary_table, unique_table, translate)`에 기존 JSON의 LEGENDARY_SPECIAL/UNIQUE_SPECIAL과 _T(String)->String callback을 주입한다. RefCounted이며 자체 파일 IO·RNG·clock·UI Node·아이템 writer가 없다. 반환값은 일시적 view다.

| API/항목 | 원문대로 구현한 규칙 |
|---|---|
| 기존 정의/역색인 | 기존 전설19·유니크39 정의를 caller가 readonly 공급. stat 역색인은 원래 for-in 순서의 **마지막 정의 우선**. 테이블 재추출/재정렬·uniqueId·외관 조회/리롤0 |
| legendary_text | 등록 stat이면 현행 전설 ko를 _T에 전달해 구세이브 문구를 표시상 정규화. 미등록 stat은 저장 ko fallback. 반환 text/definition_present. special falsy는 빈 text이며 번역 호출0. 저장된 special/val/ko는 수정하지 않음 |
| unique_view | 유니크 본문은 저장 special.ko를 번역한 후 {s}→{p}→{n} 순서로 치환. 정의 ko로 저장 문구를 덮어쓰지 않음. 결과 text/raw_text/label/label_color/label_present/definition_present |
| 원본 롤 | disp 키가 있으면0/null/false/빈문자열도 그대로 우선. disp 누락 때 등록 정의의 scale이 truthy면 Math.round(val/scale), 아니면 val 그대로. JS undefined는 키 누락으로 표현. 누락 raw는 문자열 undefined, 명시 null은 null로 구분 |
| 초 문자열 | secs가 있으면 JS String 표현을 그대로 사용(예00.50), 누락이면 ''. 구아이템에 secs가 없을 때 val/60으로 보충하지 않음 |
| 치환 | 각 literal token의 **첫1회**만 치환. JS replacement-string의 $$/$&/$`/$' 의미까지 보존. 반복 token/치환에 의해 생긴 token은 원본의 순서대로 처리 |
| 롤 라벨 | 등록 roll의 hi>lo일 때 position=(raw−lo)/(hi−lo), >=2/3 상옵/#d8b878, >=1/3 중옵/#dfd6c2, 나머지 하옵/#9a8f80. clamp/정수 반올림0. fixed/no-roll·동일/역전 범위는 라벨없음 |
| 번역 순서 | raw 계산→저장 ko _T→치환→roll 있으면 _T(하옵),_T(중옵),_T(상옵)를 **모두 호출한 뒤**1개 선택. 전체 번역 사전·UI 타이틀/박스/HTML 렌더링은 이식하지 않음 |
| 재사용 | IT-02 Presentation의 JS scalar 문자열/Math.round, 기존 equipment_affix_reader의 JS truthiness/ToNumber 재사용. 해당 파일 변경0. 모델 callback/인덱스 외 새로운 locale/아이템 authority 없음 |
| 입력 한계 | 원 테이블은 정상 Dictionary/stat/ko 문자열·유한 숫자 roll/scale 메타데이터를 지원. scalar 원값·secs 지원, 객체/배열 coercion·JS prototype stat·JS safe range 밖 native int·필요한 callback 부재/비문자열 결과는 NOT_READY/reason, 정상 text 미공급. 누락/native null은 상류 저장 데이터를 수리하지 않고 구분. UI에 원문이 NaN/Infinity 문자열을 내는 scalar 표현은 IT-02 formatter 의미를 따름 |

## 격리·검수·실패 이력

엔진 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`. 원로그·명령·실행별 override 사본·결과 JSON은 `~/exoduser-wt/_out/it-05/`에 남긴다.

| 실행 | 실제 결과 |
|---|---|
| 과부하 gate | 매 Godot 전 지정 pgrep/wc 확인,2이상이면30초 간격 대기,1이하에서만 시작. process-gate.jsonl에 UTC/count. 자기 엔진 순차·worker_pool/max_threads=2. 타인 Godot 종료0 |
| 신규 격리 | EXODUSER-it-05-Isolated-20261020. effective custom 설정2개와 OS userdir 끝까지 단정. OUT/pure-project가 자기 소스를 symlink로 직접 읽음. Main0·user:// IO0·live 쓰기0. 매 실행 override 후 finally0byte |
| pure-01 | **459단정/0실패**,6그룹, exit0·stderr0·ERROR0. all_definitions400/roll_boundaries11/legacy_substitution16/reverse_locale14/unsupported15/purity3.19/39 전체·39종 canonical placeholder 소거·경계1/3/2/3·고정효과 no-label·disp없는 scaled/legacy·초 문자열·첫치환/달러 치환·중복stat last-wins·callback 순서·입력 보존 포함 |
| source-comparison.json | **1,284비교/0차이**,154개 view. 기존19/39 정의 전체와 최신 game의 역색인/_legSpKo/실제 unique tooltip 본문을 발췌 VM 실행해 text/raw_text/label/color/definition 여부 및 callback 인자·순서를 대조. native 수식을 JS로 다시 쓴 대조군 아님 |
| oracle 첫 실패 | 첫 VM wrapper의 정규식 escape가 손실돼 SyntaxError/Invalid regular expression flags. Godot/제품 테스트 실패가 아니며 비교 성공으로 세지 않음. compare-source-01-wrapper-error.cjs 보존. source HTML label은 문자열 경계로 파싱하도록 **비교 wrapper만 수정**, 최종 비교 exit0·stderr0 |
| it02-01 | **2,205단정/0실패**,7그룹, exit0·stderr0·ERROR0. 파일 상수 EXODUSER-it-02-Isolated-20261020 그대로 사용. 기존 테스트/producer 수정0 |
| import-01 | exit0·stderr0·ERROR0. 이전 IT-04 자기 OUT 캐시를 새 OUT에 APFS clone(cp -cR) 후 실제 import 갱신. 자기 godot/.godot는 새 OUT 캐시 참조. 이전/타인 cache 쓰기0·제품 project.godot 변경0 |
| contracts-01 | **5그룹/0실패**, exit0·stderr0·ERROR0. map/charge/projectile/pause_capture/damage 전체. USERDIR 상수없는 기존 테스트라 작업 격리명을 사용, 자기 실제 godot 프로젝트에서 실행 |
| 회귀 범위 | 새 파일뿐인 읽기 전용 모델이므로 직접 의존 IT-02 전체와 공통 contracts를 실행. 변경없는 품질/자원/처치 보상·로비 전체를 새 완료 수치로 재집계하지 않음. 로비 선재8실패는 위 총괄 전달 기록만 유지 |

실제 패널·자연 아이템 획득/장착·전투효과·실화면·성능·PC·사용자 세이브 왕복은 미검수다. 기술 view/JS 대조를 실제 게임 UI 완료로 해석하지 않는다.

## docs·Git·작업 폴더 회수

- docs-keyword-paths.txt로 docs 전체 관련 검색. 기존 특수효과 원문/품질·숫자 정의는 변경하지 않고 이번 표시 이식 상태·정확 계약을 이 보고서와 CHANGELOG에 기록. 타 담당 설계 문서0줄.
- CHANGELOG 새 절을 맨 위에 추가하고 OUT/backup의 이전 byte와 새 prefix 뒤 suffix 동일을 검사한다. 원본 game snapshot·special-tables.json·비교 script/원로그도 OUT에 보존.
- 신규 test는 ignore test_*에 걸려 그 파일 하나만 git add -f. 나머지3경로도 정확 지정. hook 우회·광역 add·main push/merge·force push/reset0.
- .githooks/pre-commit docs-sync-check 정상 통과 후 자기 branch만 push, 원격 SHA 일치 확인→DONE.txt/receipt 및 review snapshot 기록→사용자 지시 git worktree remove --force로 **이번 it-05 worktree만 제거**. 브랜치/원로그 보존. 실제 제거 결과는 OUT/cleanup-receipt.json으로 확인한다.
- 제거 후 이 보고서의 영구본은 자기 branch/commit, 로컬 검토본은 OUT/review/it-05_REPORT.md. 실제 product source/test도 review snapshot에 보존한다. 테스트 당시 소스 symlink 경로는 제거 후 재현 checkout 없이 실행할 수 없음을 구분한다.
