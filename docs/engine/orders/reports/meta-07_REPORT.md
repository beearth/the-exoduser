# META-07 강화 1회 메모리 거래 — BLOCKED

**STATUS=BLOCKED. 제품 코드·새 테스트 구현0, Godot 실행0.** 작업 ID `meta-07`, 브랜치 `codex/meta-07-20261020`.

## 중단 판정

사용자 지시 **“다음 단위가 공용·State·저장 연결을 요구하면 구현하지 말고 필요한 줄·위치·근거만 보고하고 멈춥니다”**를 적용했다. 순서안은 META-07/12로 아직 남아 있다. 이번 중단 사유는 실제 악의/장착 아이템 거래의 **State 쓰기 소비 범위 미허용**이다. 저장 형식을 바꿔야 한다는 판정은 아니다.

최신 main의 `docs/engine/FDG_SOURCE_TRACE_META_20261020.md:341`은 META-07을 **강화 1회 메모리 거래**로 정의하고, “실제 INV 장비 쓰기 owner 선행”, “writer 없으면 이 단위 연결 HOLD; 임시 가짜 equipped provider 금지”, State에 쓸 경우 “새 메서드의 mats/enh 범위만 별도 등록”이라고 명시한다. META-02의 순수 견적 구현은 이미 있으나, 이번 단위의 실제 잔액 차감/성공 아이템 쓰기 계약을 대신하지 않는다.

현재 실제 INV authority는 존재한다. getter 반환 Dictionary를 새 거래 모듈에서 직접 수정해도 실제 State/장비 쓰기 연결이므로 현재 허용 범위 밖이다. 별도 가짜 equipped provider·복제 지갑/장비 거래를 만들어 완료 처리하지 않았다. `native_meta_enhancement_transaction.gd`, `test_meta_enhancement_transaction.gd` 및 UID는 생성하지 않았다. 다음 META-08도 착수0.

## 원본과 필요한 접점 — 모두 미수정

행 번호는 착수 최신 main 및 parent에서 확인했다. 아래는 필요한 범위를 식별한 것이며 새 함수 구현/위임 승인이 아니다.

| 파일·위치 | 현재 사실·필요한 범위 | 원본 근거 |
|---|---|---|
| `game.html:50590–50592,50622–50627` | 장착 slot에서 얻은 실제 `it`를 클릭 콜백이 보유한다. 실행 시 **그 객체의 현재 enh/rarity**로 재견적, 부족하면 반환, 충분하면 mats 차감 뒤 성공판정 RNG, 성공만 it.enh+1 | `50623` 견적→`50624` 잔액→`50625` 차감→`50626` `<r2`→`50627` 증가 |
| `godot/scripts/native_source_new_run_state.gd:62,146–152,184–185` | `_g`/`_inventory` 실제 holder가 있으며 read_current_inventory는 실제 객체를 반환한다. 새 authority/getter/가짜 inventory는 불필요. 현재 범위에서는 getter를 거래 writer로 직접 소비하지 않음 | 원본 실제 `G.mats`와 `INV.equipped[slot]` 소비 |
| 같은 State `:478–486` 및 그 뒤 신규 메서드 삽입 후보 경계 | 기존 apply_native_skill_cast_cost는 **스킬 비용** 전용. 강화 견적·성패 RNG·실제 item.enh 쓰기를 한 거래로 제공하지 않는다. State에 실제 거래를 둘 경우 이 영역과 구분된 **mats/enh만의 새 좁은 쓰기 메서드/소비 exactscope**가 선행 필요. 기존 스킬 API의 의미를 바꾸거나 이름만 빌려 연결하지 않음 | `50623–50627`의 차감/판정/증가 순서. 입력 item에 원본에 없는 장착 identity 재검증·낡은 선택 거부를 추가하지 않음 |
| 같은 State `:828–839` | `_equip_initial_starter_slot`은 `_initial_starter_running`/초기 context에 한정된 장비 slot 대입. 일반 런타임 강화 쓰기 진입점으로 재사용할 수 없음 | 원본50627은 이미 보유한 item의 enh만 증가 |
| 같은 State `:1070–1098` | restore_native_legendary_item_stat은 전설 옵션 조회 중 **없는 stat 필드 복구**에 한정. 기존 item mutation이 전혀 없다고 주장하지 않으며, 이 복구 API를 강화 결제/증가 writer로 전용하지 않음 | cost/RNG/기존 enh 증가 거래와 별도 목적·조건 |
| `godot/scripts/native_meta_enhancement_policy.gd:35–39` | META-02의 실제 enh_cost 재사용 가능. 기존 API는 순수 견적이며 차감/RNG/장비 쓰기 없음. 이 파일 수정은 필요 없음 | `game.html:28077–28091,28185–28186,50623` |
| `godot/scripts/world.gd:2750–2751,3449–3477` | 실제 RNG operation/receipt 경로는 존재한다. 거래 caller가 실제 owner 경로를 받아 **부족 시0회, 지출 시 성공판정1회** 소비하도록 범위를 확정해야 함. World 자체에 새 RNG/타이머를 추가할 필요는 확인되지 않았으며 이번 연결0 | `50624`는 RNG 전 반환, `50625` 차감 후 `50626` 성공판정1회. VFX의 추가 RNG는 이 메모리 거래 판정 수와 구분 |
| `game.html:50628–50640` | 성공/실패 SFX·입자·펫·renderForge·dbSaveNow는 후처리 경계. 이 단위에서 저장 구현·형식 변경이나 전체 UI 연결을 필수로 추가하지 않음 | 저장 호출50640·실패 시 단계하락/파괴 없음50634–50639 |

최소 해소 조건은 현재 실제 INV/G authority의 **강화용 mats/enh 쓰기 소비 범위 인수**와 실제 성공판정 RNG 전달 계약이다. 소유 파일을 고치지 않고 실제 State를 직접 mutation하는 우회도 하지 않는다. 예정 거래/검사는 부족액 RNG0·성패 무관 차감·성공만+1·rate와 동률이면 실패를 원본대로 확인해야 하지만, 이번에는 작성/실행하지 않았다.

## 기준·증거·실행 수치

- 착수 fetch `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. META-06 `f422eb1359b4d68bf116a042080e6c2702e85f22`가 main의 조상이 아니므로 사용자 지정대로 그 끝에서 분기했다.
- `worktree add --no-checkout -b` 후 sparse 경로 `/AGENTS.md /godot/ /docs/ /engine/ /test/ /tools/ /game.html /index.html /stat-panel-ui.js /.githooks/ /package.json`만 지정하고 새 인덱스를 `read-tree -mu HEAD`로 초기화했다. 시작 tracked clean 확인.
- game.html 원본은 main/parent 동일 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. State/Main/World도 main/parent 동일 바이트(`owner-main-comparison.json`). 다른 worktree WIP는 조사·이송하지 않았다.
- 정적 검색과 행 대조만 수행했다. **신규 테스트 NOT_CREATED / 실행 NOT_RUN / 통과 수치 없음. 회귀 NOT_RUN. Godot launch0**으로 pgrep 대기/override 실행도 해당없음. 새 격리명 `EXODUSER-meta-07-Isolated-20261020`은 예약된 이름이며 실제 사용했다고 보고하지 않는다.
- 원로그 `/Users/fordeargamers/exoduser-wt/_out/meta-07/`: `source-basis.json`, `source-main-*`, `state-owner-search.log`, `writer-census.log`, `enhancement-owner-search.log`, `docs-search.log`, `owner-main-comparison.json`, 원본/State/World의 번호 있는 행 발췌. 검색 결과에 없는 일반 강화 consumer를 구현됐다고 추정하지 않았다. 실제 INV 존재와 좁은 starter/legendary writer의 존재는 위 표로 분리했다.

## 제출·보호

변경은 본 BLOCKED 보고서와 CHANGELOG_SYNC 상단 절 **2파일만**이다. 공용·State·제품 scripts·기존/신규 테스트·저장 형식·Q/E·보호docs2_3 수정0줄. 기존 Godot GDScript 전체와 원본 등235개 보호 파일 해시가 동일하다(`static-audit.json`). 마감 main 재fetch에도 e556b617 및 원본이 동일했다. 코드 미작성/미실행을 PASS로 표시하지 않는다.

정상 훅을 거쳐 자기 브랜치만 commit/push·원격SHA 대조하고, worktree 밖 보고서 사본·원로그·`STATUS=BLOCKED` DONE.txt를 보존한 뒤 자기 worktree를 제거한다. R의 branch/HEAD/tracked index/work는 불변이며 main push·force push·git add -A·훅 우회0. 최종SHA/제거/R 검증은 `_out/meta-07/DONE.txt`와 최종 audit에 기록하고 멈춘다.
