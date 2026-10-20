# IT-02 — 어픽스·등급 표시 모델 인수 보고서

2026-10-20 KST · 작업ID `it-02` · **구현·지정 회귀 완료 / 총괄 검수 대기**. 순수 표시 모델이며 실제 인벤토리 패널 연결·실플레이·시각 인수는 별도다.

## 재부팅 복구·기준·의존

| 항목 | 실제 확인 |
|---|---|
| 복구 | 기존 `~/exoduser-wt/it-02`, branch `codex/it-02-20261020`, HEAD `c01766e1f4067ba5008db3efd022865f8babc0cb`. tracked INDEX/WORK 차이0. 미커밋 신규 표시 모듈·ignore된 신규 테스트·기존 OUT 로그를 확인해 이어서 작업. 이전 파일은 OUT/resume-backup에 보존 |
| 최신 원격 | R에서 정상 fetch 후 `origin/main=284d7faf49295b2f5061937a47ce96038032ed3c`. 이 main에는 IT-01이 없음(ancestor 검사 exit1). 사용자 지시대로 **IT-01 끝 c01766e1을 부모로 유지**. main 병합 담당은 IT-01을 먼저 반영하거나 의존 커밋을 포함해야 함 |
| 지시서 | 위 origin/main의 `docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md` §4.2 IT-02. 소유 신규2파일, 공용0줄. 격리 이름은 사용자 최신 지시 `EXODUSER-it-02-Isolated-20261020` 적용 |
| 원본 | 위 main game.html 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 재부팅 전 발췌·IT-01 부모의 원본과 동일 byte. 아래 상수·함수는 이 main 행 그대로 |
| 기존 데이터·유틸 | `item_generation_tables.json`의 AFFIX_POOL 409레코드가 원본과 순서 포함 일치. JSON은 caller가 readonly 공급하며 재생성/수정0. `equipment_affix_reader/producer.gd`의 기존 JS truthiness/숫자 coercion 재사용, 해당 파일 수정0 |
| P2-006a | 최신 원격 tree와 자기 branch에서 `native_world_drops.gd`/world_drops/pickup_contract 경로 미발견. 보드의 main 병합 문구를 실제 파일 존재로 대신하지 않음. 해당 구현 이송·재작성0. 드랍/줍기·인벤 writer 수정0 |
| 소유·보호 | 신규 producer·test, 이 보고서와 허용된 CHANGELOG_SYNC 최상단 절만 변경. main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 0줄. 다른 담당 파일·game/index·Q/E·docs/2_3·세이브 형식/복원 변경0 |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작·마감 tracked INDEX/WORK 차이0. 공유 remote ref fetch 외 파일/인덱스/브랜치·서버·열린 앱 조작0 |

## 구현 계약

생성자 `new(affix_pool, translate, localize)`는 기존 배열과 `_T(String)->String`, `_L(ko,en)->String` callback을 받는다. 파일 IO·RNG·Main·UI Node·장비/인벤 writer가 없는 RefCounted다. 결과 Dictionary는 일시적 view이며 저장 schema가 아니다. IT-01 계산 API를 호출하지 않으므로 표시 로직 자체는 독립적이다.

| API/데이터 | 원본 행 | 실제 계약 |
|---|---|---|
| 희귀도 상수·`rarity_view` | 14346~14351 | 일반/고급/희귀/영웅/전설/유니크, Common/Uncommon/Rare/Epic/Legendary/Unique. 색 `#aaa,#44cc44,#4488ff,#bb44ff,#ffaa00,#8e55e9`, 배율 `1,1.2,1.5,1.8,2.2,2.5`. RARITY 문자열은5개뿐이므로 rarity5는 code_present=false·code키 없음. 가상 unique code를 만들지 않음 |
| 표시 사전 | 14858~15013 | 이름417키·설명265키. 원본 literal의 최종 객체값을 추출해 readonly 상수로 이식. 전체7집합을 원본과 직접 비교 |
| `detail_value(af)` | 50422~50429 | 최초 정의 unit pct/prob 및 finite number일 때만 Math.round(value×10000)/100, 표시 −0→0, 양수+와 %. 그 외 compact로 fallback. null에 앞서 정의를 조회하는 순서 유지 |
| `compact_value(af)` | 50431~50441 | null/누락 value는 ''. 미등록 ID는 String(value). pct/prob는 ~~(value×100)과 원값 양수+; dps는 /s; tick은 (value/60).toFixed(2)+_L(초,s); atk는 ATK×~~(value×100)%; hp는 ~~(value×100)%HP; 기타는 양수+와 원값. signed32 wrap·NaN/Inf·작은 양수 +0%도 원문대로 |
| JS 숫자 문자열 | 위 formatter 내부 | JS와 다른 Godot 정수의 .0/지수·toFixed 반올림을 그대로 노출하지 않도록 binary64의 정확한 십진 전개·roundtrip 구간·toFixed 양수 절댓값 반올림을 사용. −0·최소 subnormal·최대 finite·1e−6/1e21 경계도 검수. 수치 자체 보정 없음 |
| `item_name(item)` | 50442~50456 | base _T 뒤 첫 PRE→첫 SUF를 별도 find로 탐색. 정의 조회도 중복 ID의 첫 레코드. 원본 순서/번역 callback 순서를 유지. 빈 affixes 배열은 JS truthy이므로 legacy prefix/suffix를 붙이지 않음. affixes가 falsy일 때만 legacy 이름 사용 |
| `affix_view` | 49815~49817 및 formatter | 첫 정의 type0은 #66ddff, 나머지 #ffcc44. 이름은 사전 또는 ID, 설명은 사전 또는 ''. 이름→설명→값 순으로 callback 호출. HTML·패널·CP 계산은 만들지 않음 |
| 미지원 | 모든 공개 API | 잘못된 item/af/pool shape, safe integer 범위 밖 native int, 필요한 callback 누락/비문자열 결과, 잘못된 rarity index는 NOT_READY/ready=false/reason. 정상 value로 위장하지 않음. 객체/배열 전체 JS 문자열 coercion·번역 사전 전체 이식은 아님 |

## 격리·실행·검수

엔진은 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`(4.7.2). 원로그·명령 JSON·실행별 override 사본·결과 JSON은 `~/exoduser-wt/_out/it-02/`에 있다.

| 항목 | 관측 |
|---|---|
| 과부하 gate | 모든 재개 실행 직전 지정된 `pgrep -f "Godot.app/Contents/MacOS/Godot" \| wc -l` 실행. 2 이상이면30초 대기 후 재확인. gate의 UTC/count는 process-gate.jsonl에 보존. 자기 테스트는 순차 실행, worker_pool/max_threads=2 추가 설정. 타인 Godot 종료0 |
| 신규 테스트 | OUT/pure-project가 자기 worktree의 port_modules/tests/data를 symlink로 직접 읽음. effective custom name과 실제 OS user dir 끝이 `EXODUSER-it-02-Isolated-20261020`인지 검사한 뒤 실행. Main0/user:// IO0 |
| 회귀 import | OUT/regression-project에서 재부팅으로 중단된 자기 캐시만 재개. resume-import-01 exit0·stderr0·ERROR0. 자기 godot/.godot는 이 OUT 캐시를 symlink로 참조. 타 worktree 캐시 변경0 |
| override | 매 실행 project의 override.cfg에 custom user dir와 worker 제한을 기록하고 finally에서0byte로 비움. 실제 설정 사본을 OUT에 보존. 제품 project.godot 수정0 |
| 회귀 격리 | contracts는 파일 USERDIR 상수가 없어 신규 작업 격리명 사용. P2-001c는 상수 `EXODUSER-P2001C-Isolated-20261020`, IT-01은 `EXODUSER-it-01-Isolated-20261020`을 그대로 적용. 기존 테스트 파일 수정0 |
| resume-pure-01 | **2,205단정/0실패**,7그룹, exit0·stderr0·SCRIPT ERROR0. rarity18·formatting95·names/callback14·first_definition4·unsupported23·purity4·source_pool2047 |
| 원본 직접 비교 | **8,386비교/0차이**.7집합·2,092개 값×compact/detail ready/문자열·11개 이름. compare-source.cjs가 최신 game 원문 함수를 VM에 발췌하여 실행. native float의 raw bits를 전달해 JSON 변환 차이를 제거. 네이티브 수식을 JS로 다시 작성한 대조군 아님 |
| resume-contracts-01 | **5그룹/0실패**, exit0·stderr0·ERROR0. map/charge/projectile/pause_capture/damage 전체. 자기 worktree의 실제 godot 프로젝트에서 실행 |
| resume-p2001c-01 | **41단정/0실패**, exit0·ERROR0·skipped[]·fallback=false. pure16/owner8/live17, forced_actor_fields21. 기존 적응형 fixture라 IT-01 당시40단정/강제19와 분모가 다르며 자연 플레이 증거가 아님 |
| P2-001c 경고 | stderr598byte: Camera2D physics 보간 경고, **ObjectDB 2 instances leaked at exit**. 기존 경고를 수정/해결했다고 주장하지 않음. 공용 파일과 기존 테스트 변경0 |
| resume-it01-01 | **177단정/0실패**,6그룹, exit0·stderr0·ERROR0. IT-01 소스/테스트 원문 그대로 OUT/it01-regression-project에서 실행 |

재부팅 전 실패도 삭제하지 않았다. pure-01=2,179/4(정수 문자열 .0), pure-02=2,179/0, pure-03=2,205/24(typed Array 할당 오류), pure-04=2,205/2(최소 double literal underflow), pure-05=2,205/2(roundtrip 파싱 underflow), pure-06=2,205/0. 현재 정확 decimal/interval 처리와 raw bits fixture로 해결됐고 최종 재개 실행을 별도로 검수했다. import-01은 결과 JSON 없이65%에서 중단돼 완료/PASS로 세지 않는다.

기능 단위·회귀 결과는 실제 플레이·화면·성능·PC 실행·사용자 저장 왕복의 증거가 아니다. 실제 패널은 TI-03, 특수효과 툴팁은 IT-05 등 후속 담당의 연결 범위다.

## docs·Git 인계

- docs 전체 키워드 검색 결과는 resume-docs-keyword-paths.txt에 보존. 아이템/인벤의 상세 % 공식·번역 목록을 대조. 과거 full 설계안의 buildItemName이나 유니크 색 #ff4466 문구로 최신 game 수치를 바꾸지 않음. 타인 설계 문서0줄, 신규 이식 상태는 이 보고서와 CHANGELOG_SYNC에 기록.
- CHANGELOG_SYNC는 기존 형식의 새 절을 맨 위에 추가하며 이전 byte 전체는 resume-backup/CHANGELOG_SYNC.md로 보존하고 suffix 일치 확인.
- 신규 test는 `.gitignore:5 test_*`에 걸리므로 그 파일 하나만 `git add -f -- godot/tests/test_native_item_presentation_source.gd`. 나머지3경로도 정확 지정. 광역 add·타인 WIP stage·hook 우회0.
- `.githooks/pre-commit`의 `node tools/docs-sync-check.mjs --staged`를 정상 통과시킨 뒤 자기 branch만 비강제 push하고 원격 SHA 대조. main push·merge·force·reset0.
- 최종 브랜치·SHA·수치·원격 receipt는 OUT/DONE.txt 및 submission-receipt.json에 기록. 총괄은 IT-01 선행 의존을 확인해 병합 검수해야 한다.
