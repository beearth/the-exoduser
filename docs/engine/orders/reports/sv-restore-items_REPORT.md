# SV-RESTORE-ITEMS — 아이템 복원 계산 인계

2026-10-20 KST · 작업ID `sv-restore-items` · 브랜치 `codex/sv-restore-items-20261020`

## 기준·범위

`git fetch origin main` 후 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. 선행 SV-RESTORE-PLAYER가 main에 없어, 사용자 승인 tip `c88014b65db6a6ea1e85eb55f952ed60ecd16477`에서 `worktree add --no-checkout -b`로 분기했다. 이 tip에는 최신 main이 이미 포함되어 있다. 선행 의존은 SV-COLLECT `b8b8a8fa` → SV-TRANSPORT-READ `75c4d36e`/판정 `955f3573` → SV-RESTORE-PLAYER `c88014b6`다.

새 worktree는 no-cone sparse로 원본 텍스트·필요 docs·port_modules/tests·기존 item_generation_tables.json만 받았다. 약 **20MiB**, 웹/네이티브 대형 에셋·전체 import 없음. 사용자 지시대로 push·원격 SHA 일치·DONE 기록 후 자기 worktree만 제거하며 브랜치·외부 원로그는 보존한다.

범위는 추적 문서 §4의 4번 **아이템 복원 계산**이다. 기존 마이그레이션의 결과를 분리된 사본에서 계산하며, 새 규칙/버전/저장 필드·저장 쓰기·형식 변경은 없다. 실사용자 세이브와 공유 저장소 접근, 실제 인벤/장착 writer, 아이템 생성·장착 효과·공속 적용·UI 연결도 없다.

## 변경 파일·API

| 자기 소유 파일 | 역할 |
|---|---|
| `godot/port_modules/save_adapter/source_inventory_restore.gd` | `new().calculate(serialized, current, source_tables)`; 원본 순서의 detached 계산 |
| `godot/tests/test_native_inventory_restore.gd` | 지정 격리·원본 값/타입·공유 참조·입력/owner 불변·실패 후 재호출 검증 |
| `tools/sv_restore_items_oracle.cjs` | 최신 checkout 원본의 상수/helper/복원 본문만 Node VM에서 평가하는 메모리 fixture oracle |
| `docs/CHANGELOG_SYNC.md` | 허용된 최상단 기존 형식 절 추가 |
| 이 보고서 | 근거·검수·보호·후속 연결 경계 |

`current`에는 `inventory`(현재 bag/equipped 포함), `storage_before`, `storage_after`, `upgrades`, `pot_levels` snapshot이 필요하다. `storage_before`는 원본 3640의 기존 STORAGE.items 보정 시점, `storage_after`는 3750–3752의 공유 창고 rebind/200개 안전장치 **이후** 권위 snapshot이다. 원본 `d.storage`를 그 권위로 대신하거나 부재를 빈 창고로 제조하지 않는다. before는 명시적 null도 허용하고 after는 Dictionary가 필요하다. pot_levels도 현재 Dictionary를 요구한다.

`source_tables`는 기존 readonly `item_generation_tables.json`의 SLOT_NAMES/SLOT_EMOJI/RARITY_MUL/WTYPES/BOWTYPES/_WP_MOD를 공급한다. 테스트가 이 6개 전체를 원본 상수와 전후 대조한다. JSON에는 없는 legacy ID 18개와 POT known key hp는 원본 그대로 const로 두고 별도 대조한다. 선행 `source_player_restore.gd`의 JS truthiness/Number/primitive helper를 읽기 전용 재사용하며 그 파일은 변경하지 않았다.

반환 `plan`은 inventory/storage_before/storage_after/bag_max/crystal_bag/crystal_dust/stone_bag/upgrades/pot_levels다. Dictionary/Array의 공유 참조를 보존하는 graph copy로 계산해 입력과는 분리한다. 같은 id의 서로 다른 객체를 합치지 않고, 같은 객체가 bag·equipped·창고·결정에 반복 등장하면 결과 안의 alias는 유지한다. 결과 수정은 입력/현재 owner/테이블/다음 계산에 영향을 주지 않는다.

모든 결과는 `calculation_only=true`, `write_authorized=false`, `restore_connected=false`, `storage_io=false`, `network=false`, `full_restore_verified=false`다. `READY`는 계산만 뜻한다. player 없는 메타는 `REJECTED`; 현재 owner/권위/테이블 누락, 비배열 bag/affixes, truthy primitive item, 미입증 숫자·property key 변환, prototype 상속 lookup, undefined 수리 이름, source가 throw하는 suffix/이름 형태, cyclic/깊이64 초과/JSON 외 carrier는 `HOLD`이며 plan이 없다. 이를 정상 빈 인벤이나 신규 캐릭터로 바꾸지 않는다.

## 최신 main 원문 대조

`game.html` SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 기존 데이터 `0cb5aa2246a42d85a7c6b02bdc4a0fb89ee37ca63c0dad8c5c7ca7bf9b237c2e`. 작업본·최신 main의 원본4파일과 데이터 diff0. 아래는 최신 main 실제 행이며 새 수치 설계가 아니다. 발췌별 SHA/행은 source-oracle.json에 있다.

| 원본 행 | 계산 계약 |
|---|---|
| 3628–3642 | bag/equipped 원본 `\|\|` fallback. equipped가 falsy일 때만 17칸 기본 객체; truthy 부분 객체는 belt/bracelet/ossuary/headband/headband2 **5개 누락 키만** 추가. ossCollect의 object/Array 허용 구분과 bracelet brType=demon, 기존 STORAGE.items 순서 유지 |
| 3644–3653 | bracelet/headband의 ??? 수리와 문자열 tier의 JS `+` 의미, equipped.headband2는 직접 ??? 수리 대상이 아닌 차이. shield의 방패→견갑 전체 치환. 미등록 btype만 crossbow/석궁/⚙️ |
| 3655–3683 | affixes fallback→prefix는 빈 배열 때 legacy 추가→suffix는 첫 legacySuf find가 없을 때 추가. weapon spd `+(0.45*rm).toFixed(2)`/`_spdMig=3`, 알려진 wtype·truthy uniqueArt 없음·`_nameMig<1` 때만 원본 _weaponName. selected=null |
| 14351,15176,15211,15838,15863–15894 | 원본 rarity `[1,1.2,1.5,1.8,2.2,2.5]`, 17슬롯/emoji, legacy ID18, 무기7/석궁3/원소별 표시명 helper. rarity index 문자열"01"과"2", 배열 length lookup 차이도 대조 |
| 3735 | `Number.isNaN(+d.bagMax)?300:d.bagMax\|\|300`. 숫자0은300, 문자열"0"은 원문 문자열로 유지. 배열 등 지원된 carrier에도 새 clamp/정수화 없음 |
| 3754–3758 | crystalBag/dust fallback; stoneBag는 **number 타입 q1–100만** 순서대로 filter. crystal은 legacy ID 치환 후 q 범위 밖50. 유효 문자열"50"/bool true를 원본이 유지하는 차이도 보존 |
| 3759–3766 | socketCount 누락이면 0과 새 crystals=[]로 기존 crystals를 비우는 원문 유지. crystals 배열만 순회; socketQ는 결정 개수에 맞춰 결측/범위 밖1, 초과 절단. bag→17 equipped→post-rebind STORAGE 배열 순서, 저장소 숫자 키의 JS 열거 순서 유지 |
| 3768–3769,27677–27679 | upgrades truthy일 때 원 객체값 교체 계산, falsy면 현재값 유지. potLv는 POT known key hp만 원값 복원, 미등록 key 무시·현재 나머지 key 유지. writer 호출 없음 |

예: q101 결정은 q50, q101 소켓석은 제외, 유효 문자열 q"50" 결정은 문자열 그대로지만 소켓석은 제외한다. socketCount 없는 아이템에 crystals가 있어도 원본대로 배열을 비운다. uniqueArt가 truthy인 무기의 표시명은 보존하지만 같은 원본의 공속 marker 복원은 별도 조건대로 계산한다. 원본 없는 품질·소켓·마이그레이션 보정을 덧붙이지 않는다.

## IT-01~04 참조만

아이템 추적 문서 §4와 별도 브랜치 보고서의 계약을 읽었다: IT-01 `c01766e1`, IT-02 `f7230588`, IT-03 `50d1a5a0`, IT-04 `b950095b`. IT-01 품질 API의 숫자 지원 경계와 IT-03/04 효과 배율은 이번 **복원 시 수리/유지/제외** 조건과 다르므로 복원 계산에 대신 호출하지 않는다. 그 브랜치의 파일 이송·병합·호출·수정0. IT-01~04 테스트를 이번 branch에서 실행했다고 주장하지 않는다. existing source JSON도 재추출·재정렬·수정0.

## 실제 검수

Godot4.7.2/Node24.15.0. 신규 `EXODUSER-sv-restore-items-Isolated-20261020`, 기존 회귀는 각 테스트 USERDIR 상수 그대로다. 매 실행 전 지정 pgrep predicate로 전역 개수를 기록해 2 이상이면 30초 대기, 자기 작업 Godot는 순차1개. 종료마다 override.cfg 0byte. 전체 import·Main 부트·실제 저장 IO 없음.

| 실행 | 실제 결과 |
|---|---|
| items-attempt1 | **110,161검사/36실패, exit1**, SCRIPT ERROR1·경고0. JSON 전달에서 소실된 fixture alias와 이종 타입 이름 비교 결함. 실패 stdout/stderr/engine log 보존 |
| items-attempt2 | **110,257/0, exit0**, ERROR·SCRIPT ERROR·경고0. 전체 alias를 QA 전달에서 재구성하고 JS strict string 비교로 보완 |
| items-final | **126,863/0, exit0**, ERROR·SCRIPT ERROR·경고0. 지정 범위 끝 upgrades/potLv 포함. **272 fixture·원본 VM544평가**, 각 native 결과·2회 로드·alias topology·입력/현재 owner/테이블 불변·출력 변이 후 재계산·HOLD 경계 검증 |
| 기존 test_native_save_contract | **3,023/0, exit0**, ERROR·SCRIPT ERROR·경고0, 5생산자25평가 |
| 선행 test_native_player_restore | **78,620/0, exit0**, ERROR·SCRIPT ERROR·경고0, 201 fixture·원본603평가 |

검사 수에는 재귀 key/type/value·alias 대조가 포함된다. 원본 VM은 게임 전체 대신 **최신 원문 발췌**를 실행하며 STORAGE 전후 snapshot은 명시적인 fixture다. 재작성 JS 수식을 oracle로 쓰지 않는다. QA 숫자 전달만 binary64 태그를 사용하고 calculator 호출 전에 해제한다. 이는 세이브 schema가 아니다. 실패 실행을 최종 성공에 합산하거나 가짜 PASS로 처리하지 않았다.

## 보호·연결 HOLD·제출

- 공용6(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state), IT·타 담당 파일, 기존 테스트, 기존 source_player_restore, 원본4파일·데이터·project.godot 직접 변경0. R tracked INDEX/WORK diff0. 자기 신규3파일+보고서+허용 CHANGELOG 절만 commit한다.
- 공유 저장 읽기/이관/200개 clamp·persist(3741–3752), 계정/namespace 선택은 다음 SV-SHARED-READ 권위 범위다. 이번 계산은 caller의 post-rebind snapshot을 요구하며 그 정책을 구현/변경하지 않는다. 공유 저장소가 없다고 가정한 빈 snapshot을 제품에 설치하지 않는다.
- 실제 INV/P2-006a 인수·장착/창고 owner 적용·화면·IT 효과 합산·applyStats·전체 dbRestore·재시작 유지·PC 실행은 미검증/연결 HOLD다. 이번 읽기·계산에 공용 파일 변경은 필요하지 않으며 보호 writer 변경 제안도 없다.
- 알려진 선재 결함 원문: **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**. 이번 작업에서 전체 로비 재실행·수정·PASS 승격 없음. UI 변경이 없으므로 시각/플레이 품질 PASS를 주장하지 않는다.
- docs 관련 검색 결과는 related-docs-search.log. 기존 trace/설계 수치 변경0, 이 보고서와 CHANGELOG_SYNC에 현재 범위를 기록했다. 새 테스트는 root ignore `test_*` 때문에 자기 경로만 명시 force-add하고 정상 pre-commit 훅을 사용한다. `git add -A`/main push/force push/훅 우회/바이너리 commit 없음.

원로그·명령·source oracle·최종 summary·보고서 사본·원격 대조·정리 결과는 `/Users/fordeargamers/exoduser-wt/_out/sv-restore-items/`. branch/SHA/수치·원격 일치 확인·자기 worktree 제거 영수증은 같은 위치 **DONE.txt**에 남긴다.
