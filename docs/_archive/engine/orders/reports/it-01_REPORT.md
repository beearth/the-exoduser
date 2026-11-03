# IT-01 — 아이템 품질·소켓 공명 순수 계산 인수 보고서

2026-10-20 KST · 작업ID `it-01` · **구현·단위 검수 완료 / 총괄 검수 대기**. Main 연결 및 실플레이 인수는 아니다.

## 기준·소유·보호

| 항목 | 확인 결과 |
|---|---|
| 시작 | 정상 `git fetch origin` 후 최신 `origin/main=9528ea35b429498fcf42fe3723008219ed0ed7e1`에서 새 `~/exoduser-wt/it-01`, `codex/it-01-20261020` 생성. 시작 tracked INDEX/WORK diff 없음 |
| 지시서 | [아이템 추적 IT-01](https://github.com/beearth/the-exoduser/blob/33486451af26ebfc6b01edec87dd381a6a4da52c/docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md). 해당 추적은 이번 기준 main에는 아직 없으므로 원문 commit을 읽었다. 격리 이름은 사용자 최신 지시의 소문자 `it-01`로 변경 |
| 작업판 확인 | 기준 `WORK_BOARD.md` 전체 확인. P2-006a/006b는 드랍 렌더·줍기·인벤 반입/표시 파일 담당. 이번 소유 신규2파일과 겹침 없음. 보드의 “기능 main 병합”과 달리 이 tree에서 native_world_drops/pickup 테스트는 여전히 미발견. 해당 구현을 끼워 넣지 않음 |
| P2-001c 확인 | `godot/port_modules/kill_reward/drop_item_source.gd`, `godot/data/item_generation_tables.json`은 기존 이식 의존. 두 파일의 마지막 변경 commit `9853ee9cbbc98c1e9d118de5d8109c91d2b46842`. 이번에는 JSON의 Q_GRADES만 테스트에서 readonly 대조. 두 소유 파일 수정0 |
| 실제 변경 | 신규 `godot/port_modules/item_quality_source/producer.gd`, 신규 `godot/tests/test_native_item_quality_source.gd`, 허용된 `docs/CHANGELOG_SYNC.md` 최상단 절, 이 보고서. 다른 코드·테스트·기존 설계 docs 수정0 |
| 보호 | main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 변경0. 원본 game/index·Q/E·docs/2_3·세이브 형식/복원 변경0. WORK_BOARD는 최신 사용자의 파일 범위에 따라 수정하지 않고 이 보고서로 상태 인계 |
| R | 시작 branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. R 파일/인덱스/브랜치 및 열린 서버·게임 조작0. 마감 시 tracked INDEX/WORK를 다시 확인 |
| 원본 | game.html 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 추적 시점과 동일 byte. 함수 닫힘까지 확인하여 socketResonant 범위 끝은 **15331**로 정정 표기 |

## 구현 계약

모듈은 `RefCounted`이며 자체 clock·RNG·파일 IO·Input·Main·장비/주머니 writer가 없다. 반환 Dictionary는 일시적 계산 결과이며 저장 schema가 아니다.

| API/위치 | 원본 근거 | 실제 계약 |
|---|---|---|
| `Q_GRADES`, 모듈:11 | game:15308~15312 | 동/bronze min1 #d19a5c, 은/silver min41 #e7edf3, 금/gold min81 #f2d388. 3등급은 티어10단과 다름. 기존 JSON 정의·순서·필드 전부 대조 |
| `quality(q=null)`, :18 | game:15305,15313,15316 | q=0/−0/null/누락→50, clamp1~100. tier=10−floor((q−1)/10), grade는 q>=min인 마지막 정의, gem=.75+.5×q/100. 소수 q를 반올림하지 않음 |
| `fused_quality(list)`, :30 | game:15319 | null/빈 배열→50. 각 crystal.q 누락/null/0→50 후 clamp, 평균 Math.round 후 최종 clamp. 양수 평균에 floor(mean+.5) 적용. 배열/객체를 수리하거나 소모하지 않음 |
| `socket(item,index)`, :51 | game:15322~15331 | 빈 홈 multiplier1/resonant=false로 먼저 반환. socketQ 누락/짧음/null/0→1, crystal.q 누락/null/0→50. multiplier=1+(clamp(q,1,100)−1)/99×(등급 일치?2:1). resonant는 raw q>1도 요구. 원본의 등급 일치와 티어 일치를 혼동하지 않음 |
| READY 결과 | 공개 API3개 | quality는 q/tier/grade_id/ko/en/color/gem_multiplier, fuse는 q, socket은 multiplier/resonant 제공. 매 호출 새 결과이며 결과 수정이 원 정의를 바꾸지 않음 |
| 부분 지원 | 모듈:83 | finite int/float 및 null/누락 q만 지원. 문자열/bool q, NaN/±Inf·복잡 coercion은 NOT_READY/ready=false/reason, 정상 효과값 없음. 원본 전체 JS coercion 이식이 아님 |
| shape 경계 | fuse/socket | fuse는 Array의 null/Dictionary 원소만 지원. socket의 item/crystal은 정상 Dictionary만 지원하되 원본 falsy crystal(null/false/0/빈문자열)은 빈 홈 처리. 배열 index 범위 밖은 빈 홈. star/id 등록 검사는 추가하지 않음 |
| 미연결 | 지시서 IT-03/04 및 인벤 담당 | 기존 crystalEffects 품질 승수 및 player_resource_parameters_source 소켓 배율 caller는 수정하지 않음. 실제 장착 효과·표시·홈 개방·재료 소비는 후속 단위 |

## 격리·재현 경로

Godot 원본 실행파일은 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, 버전 `4.7.2.stable.official.ed1daf0bf`다. 원로그·명령·결과 JSON은 전부 `~/exoduser-wt/_out/it-01/`에 보존한다.

| 실행 | 설정과 실제 경계 |
|---|---|
| 신규 순수 테스트 | `_out/it-01/pure-project/project.godot`에 `use_custom_user_dir=true`, `custom_user_dir_name="EXODUSER-it-01-Isolated-20261020"`. port_modules/tests/data를 자기 worktree 실제 경로에 symlink하여 수정본을 직접 읽음. Main 부팅0, repository override.cfg 사용0 |
| 격리 단정 | 신규 테스트:12에서 effective 설정2개와 `OS.get_user_data_dir().get_file()` 정확 일치를 검사. 실제 경로 `/Users/fordeargamers/Library/Application Support/EXODUSER-it-01-Isolated-20261020`. user:// 읽기·쓰기0, engine log는 --log-file로 OUT에 지정 |
| 격리 거절 검사 | 별도 OUT 프로젝트의 이름만 `EXODUSER-it-01-Guard-Rejected-20261020`으로 바꿔 실행. exit2 및 IT01_INVALID, IT01_RESULT 없음 확인. 사용자 기본 저장 폴더로 시험하지 않음 |
| 회귀 import | `_out/it-01/regression-project`의 project.godot은 최신 원본을 복사하고 사용자 폴더만 `EXODUSER-it-01-Contracts-Isolated-20261020`으로 지정. 코드/데이터/에셋은 자기 worktree symlink. import1회 exit0/ERROR0/stderr0,41.05초. 제품 project.godot 수정0 |
| test_contracts | 파일 내 USERDIR 상수 없음 확인. 위 독립 이름을 사용하며 원본 cap240/physics60 등 설정 유지. 5그룹 전체 실행, Main 부팅0, override 사용0. 기존 테스트 수정0 |
| P2-001c | **실제 자기 worktree godot 프로젝트**에서 실행. 파일 상수 `EXODUSER-P2001C-Isolated-20261020` 그대로 임시 override.cfg에 사용. 자체 격리 gate가 통과해 3그룹 전부 실행/skipped[]. 실행 finally에서 override **0 byte** 확인 |
| import cache | 회귀 import의 자기 OUT .godot를 자기 worktree godot/.godot에서 참조. 다른 worktree/cache 변경·재사용0. 생성 .import/.uid·.godot·override·로그는 커밋하지 않음 |

순수 테스트 재현 명령(OUT의 전용 project.godot과 source symlink는 보존됨):

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot \
  --headless --path /Users/fordeargamers/exoduser-wt/_out/it-01/pure-project \
  --log-file /Users/fordeargamers/exoduser-wt/_out/it-01/review.engine.log \
  --script res://tests/test_native_item_quality_source.gd
```

## 검수 결과·실패 이력

| 실행/원로그 basename | 결과 | 판정·한계 |
|---|---|---|
| pure-01 | engine exit0이나 스크립트 파일 없음 ERROR | **무효**. 초기 baseline Git 확인이 끝나 파일 복사가 실행되기 전에 잘못 시작한 호출. 성공으로 세지 않음 |
| pure-02 |158단정/1실패,exit1 | Q_GRADES Dictionary 전체 비교가 JSON float와 native int를 구분한 테스트 오류. 제품 수학 변경 없이 필드·숫자값 대조로 수정. 원로그 보존 |
| pure-03 |177/0,exit0,ERROR0/stderr0 | 단위6그룹 통과. 이 시점 외부 JS 발췌는 닫는 중괄호15331 누락으로 SyntaxError, 비교 PASS 아님 |
| pure-04 |**177/0**,exit0,ERROR0/stderr0 | 최종 새 테스트. source_tables21, quality_boundaries50, fuse8, sockets40, unsupported54, purity4. 반환 참조·중첩 입력·길이 불변 및 Main node0 포함 |
| source-comparison.json |**1478비교/0차이** | 최신 game.html 실제 함수 발췌 VM과 품질205입력×6필드·소켓120조합×2필드·합성8결과를 비교. type/finite/오차≤1e-12 검사. 네이티브 수식을 JS로 다시 작성한 대조군이 아님 |
| guard-negative | exit2,격리 거절 관측 | 예상한 거절 검사. 성공 결과 출력 없음 |
| contracts-01 |**5그룹/0실패**,exit0,ERROR0/stderr0,9.29초 | map/charge/projectile/pause_capture/damage 전체. 성능·실플레이 증거 아님 |
| p2001c-01 |**40단정/0실패**,exit0,ERROR0,24.11초 | pure16/owner8/live16,skipped[],fallback=false. 기존 fixture의 forced_actor_fields19이며 자연 입력 인수 아님 |
| P2-001c 경고 | Camera2D 경고1 + **ObjectDB 2 instances leaked at exit** 경고 | 기능 단정 통과와 종료 완전 clean을 구분. stderr598 byte. 해당 공용 파일/기존 테스트 수정 없이 원문 보존. 이 경고를 해결했다고 주장하지 않음 |

추가 반복 회귀·게임 화면·성능·PC 실행·실세이브 왕복은 수행하지 않았다. IT-01은 standalone 계산 모듈이며 이 한계는 실패를 우회하는 대체 완료 기준이 아니라 애초 승인된 단위의 경계다.

## docs·Git 검수와 인계

- 코드 변경 후 `rg -l 'socketMul|_qTier|_qGemMul|Q_GRADES|소켓.*품질' docs --glob '*.md'`를 실행하고 `docs-keyword-paths-final.txt`에 검색 경로를 남겼다. 7/2_7/14/15 관련 정의와 현재 원본을 대조했다. 원본 공식·상수 변경0이므로 기존 설계값을 고치지 않고 허용된 변경 이력과 이 보고서에 신규 이식 상태·정확 계약을 기록했다.
- 기존 설계에 남은 “홈 티어 일치” 표현은 원본의 **등급 id 일치**와 다르고, full의 자연홈1~4 표현도 현재0홈과 다르다. 이를 이번에 설계/코드 수정하지 않았으며 원본을 기준으로 구현했다.
- CHANGELOG_SYNC는 기존 형식의 절을 **맨 위에 추가**했다. 이전 전체 byte는 `_out/it-01/changelog-before.bin`에 보존하고 새 prefix 뒤 suffix가 원본과 동일한지 검사했다.
- `.gitignore:5 test_*`가 신규 테스트를 무시하므로 승인된 **그 파일 하나만** `git add -f -- godot/tests/test_native_item_quality_source.gd`로 등록한다. ignore 규칙 변경·광역 add·pre-commit 우회 없음. 나머지3경로도 각각 지정한다.
- pre-commit은 저장소 `.githooks/pre-commit`→`node tools/docs-sync-check.mjs --staged`를 그대로 사용한다. ALLOW_MISSING_DOCS/--no-verify/core.hooksPath 변경 없이 정상 커밋한다.
- 시작 main SHA를 부모로 보존하고 자기 codex 브랜치만 비강제 push 후 원격 SHA를 읽어 대조한다. main push/병합·force/reset0. 최종 SHA·수치는 OUT의 DONE.txt와 submission-receipt.json에 기록한다.
- 다음 단위는 IT-02 또는 IT-03의 별도 배정이다. IT-03/04는 기존 crystal/resource owner 소유 파일이므로 이 작업에서 자동 진행하지 않는다. TI-10a/b 화면·소켓석 mutation과 중복 구현하지 않는다.
