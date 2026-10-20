# SV-RESTORE-PLAYER — 읽기·복원 계산 인계

2026-10-20 KST · 작업ID `sv-restore-player` · 브랜치 `codex/sv-restore-player-20261020`

## 범위와 의존

- 사용자 배정은 추적 문서 §4의 3번 단위 중 **읽기·복원 계산만**이다. 실사용자 세이브 읽기, 저장 쓰기, 서버 호출, 세이브 형식·기존 마이그레이션 정책 변경은 없다.
- `git fetch origin`에 이어 `git fetch origin main`으로 main을 명시 조회했다. `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`에는 선행 SV-COLLECT/SV-TRANSPORT-READ가 없어, 승인 판정 반영 tip `955f357323f566135546ae3743098c825f824e4c`에서 분기했다. 최신 main을 정상 병합한 착수 기준은 `f25dd67567b6e5937149628cb1a5a56fd5e59eba`다. 의존: SV-COLLECT `b8b8a8fa`, SV-TRANSPORT-READ 코드 `75c4d36e`와 판정 `955f3573`.
- SV-TRANSPORT-READ 보고서에 총괄의 선재 결함 승인 판정 한 줄을 추가하고 정상 push했다. 원격 branch SHA `955f357323f566135546ae3743098c825f824e4c` 일치 확인.
- R에서 사용자 지정 `worktree add --no-checkout -b` 후 `sparse-checkout set --no-cone`으로 시작했다. index 초기화 뒤 clean 확인, 웹 대용량 에셋 checkout 없음. 작업 폴더 약 423MiB(대부분 기존 docs)이며 push·원격 SHA 확인·DONE 작성 후 이 작업의 worktree만 제거한다. 브랜치와 외부 원로그는 남긴다. 새 테스트는 root `.gitignore`의 `test_*` 때문에 자기 파일만 명시 `git add -f --`로 추가했으며 훅 우회는 없다.

## 변경 파일과 호출 계약

| 자기 소유 파일 | 역할 |
|---|---|
| `godot/port_modules/save_adapter/source_player_restore.gd` | `calculate(serialized, current)` 정적 순수 계산. 입력/현재 snapshot 불변, 결과 deep detached |
| `godot/tests/test_native_player_restore.gd` | 격리 Godot 테스트, 원본 VM과 1회·재파싱 2회·같은 객체의 원본 skills 삭제를 모사한 2회 대조 |
| `tools/sv_restore_player_oracle.cjs` | 최신 checkout `game.html`의 정확한 helper/본문 slice만 Node VM에서 평가. 메모리 fixture P/STATS/PASSIVES/d 외 제품 런타임 없음 |
| `docs/CHANGELOG_SYNC.md` | 허용된 최상단 기존 형식 절 추가 |
| 이 보고서 | 근거·검수·한계·인계 |

`current`에는 현재 `player`/`stats`/`passives` Dictionary와 기존 `player.mhp/mmp/mst`가 반드시 있어야 한다. constructor나 임의 부트 기본값으로 현재 owner 값을 대체하지 않는다. 결과 `plan`에는 `player/stats/passives/skills/raw_grit`, 별도 `refunds`에는 `pShield/pDef/grit` 계산액이 있다. 모든 반환은 `calculation_only=true`, `write_authorized=false`, `restore_connected=false`, `storage_io=false`, `network=false`, `full_restore_verified=false`다. 제품 호출부·toggle·autoload·기본 실행 경로 연결은 없다.

`READY`는 허용된 입력의 **분리된 계산 결과**만 뜻한다. player 없는 메타/원본 falsy 입력은 `REJECTED`, 현재 cap/owner snapshot 누락이나 미입증 carrier는 `HOLD`이며 plan을 만들지 않는다. 비객체 player/배열 allocation, 수치 강제변환에 쓰이는 객체, JSON 외 carrier·깊이64 초과, 배열의 미입증 숫자 문자열화, 긴 radix 정수, 문자열 SP에 소수/비유한 환급액을 이어붙이는 경우도 HOLD다. 원본을 고치거나 손상 저장을 신규 캐릭터로 바꾸는 정책이 아니다.

## 최신 main 원본 근거

작업본과 최신 main의 `game.html/index.html/server.cjs/node-main.js` diff 0. `game.html` SHA-256은 양쪽 모두 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`다. 행은 최신 main 원문 기준이며 상수 재설계가 아니다.

| 원본 행 | 그대로 계산하는 내용 |
|---|---|
| 3597–3602 | `maxExp=pd.maxExp||15`; `(lv||1)<1000` 또는 **Number 타입 유한 양수** maxExp이면 exp 원값 유지. 나머지만 EXP 하한0 및 초월 필요 경험치 재계산. 숫자 문자열 maxExp를 finite Number로 취급하지 않음 |
| 43128–43133 | 초월 필요 EXP `floor(5000000+(lv-999)*(lv-999)*10000)`. 원래 곱셈 순서 유지. 1000 미만이면 overflow 복구 분기 진입 안 함 |
| 3611–3619 | 레벨/EXP·초월 메타→저장 SP/AP 그대로→배열 queue만 수용→baseAtk8/baseDef2/mpR0/stR.28. queue 중복/unknown/301개도 복원 구간은 필터/260 clamp하지 않음 |
| 3620–3623 | `hp||기존mhp` 뒤 `mhp||350`, `mp||기존mmp` 뒤 `mmp||80`, `st||기존mst` 뒤 `mst||100`; speed2.6·shield/mshield0. 저장 숫자0과 문자열"0" 구분. constructor의 MP160/ST200으로 복원 fallback을 덮지 않음 |
| 3685–3715 | stats 원값 truthy/default, passives known key의 단항+ 수치화→pShield 환급/0→저장 pDef 환급→humanity/demonRevive 조건부 이관 계산→raw grit 및 구비용 SP 환급. SP/AP 재계산 폐지 원문 유지 |
| 3690–3705 | `~~`의 ToInt32·음수 하한0, 비용 `[1,1,1,2,2,2,3,3,3,5]` 이후5. 합계는 같은 정수값의 유계 계산으로 계산하며 수십억 회 반복하지 않음 |

예: 기존 cap이 HP777/MP333/ST222이고 저장 현재값이 숫자0, 새 cap이999이면 현재값은 777/333/222이고 cap만999가 된다. 저장 AP가 문자열"5", pShield3, pDef4이면 환급 순서대로 "53"→"535"다. 계산 결과의 skills 삭제는 detached 사본에만 반영한다. 같은 세이브를 재파싱한 두 번째 로드와 JS가 이미 skills를 삭제한 같은 객체를 두 번째 사용하는 경우를 따로 대조한다.

기존 `raw_grit_restore.gd`를 읽고 재사용을 검토했다. `restore()`는 실제 holder/player를 쓰고 `apply_plan/refund_all`은 writer callback을 호출하므로 이번 읽기·계산 모듈에서 호출·수정하지 않았다. raw grit을 total grit으로 대신하지 않으며 원본 3714–3715의 식과 JS `+` 의미만 분리 계산한다. 새 마이그레이션 버전·규칙·저장 필드는 추가하지 않는다.

## 검수

최종 수치는 외부 `summary-final.json` 및 각 stdout/stderr/engine log에 기록했다. Godot 4.7.2, Node v24.15.0. 신규 격리 이름은 `EXODUSER-sv-restore-player-Isolated-20261020`, 기존 테스트는 각 파일 USERDIR 상수 그대로 사용했다. 매 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`과 같은 predicate로 전역 개수를 기록하고 2 이상이면 30초씩 대기했다. 작업 내 Godot는 순차 1개, 종료마다 `override.cfg` 0byte.

| 검증 | 결과 |
|---|---|
| 신규 player 복원 계산 | **78,620검사 / 실패0 / exit0 / ERROR·SCRIPT ERROR·경고0**. 201 fixture × 3회 = 원본 VM 603평가. 0/수치문자·EXP overflow·큰 수·SP/AP·queue·환급 순서·두 가지 2회 로드·입력/owner/중첩 alias 불변·HOLD 경계 |
| 기존 SV-CONTRACT `test_native_save_contract` | 3,023검사 / 실패0 / exit0 / ERROR·SCRIPT ERROR·경고0, 원본5생산자 25평가 |
| 선행 `test_native_slot_reader` | 5,952검사 / 실패0 / exit0 / ERROR·SCRIPT ERROR·경고0. 실제 저장/서버/복원 연결 없음 |
| 공용·원본 보존 | common6·타 담당·기존 테스트·project.godot·원본4파일 직접 diff0. 모듈에 파일/네트워크/owner writer 호출 없음. R tracked diff0 관측 |

첫 실행은 42,706검사/576실패(exit1)였다. 새 키의 점 표기 대입이 StringName을 만들던 문제를 문자열 키 대입으로 수정한 뒤 75,412/0(exit0)을 확인했다. 큰 EXP 경계를 추가한 실행은 78,560/6(exit1), 큰 수 결과 전달 보강 후 78,605/3(exit1)이었다. 잔여3건도 최대 안전 정수가 Godot JSON 입력에서 반올림되던 QA 전달 문제였다. 최종은 큰 수 입력과 기대 결과를 IEEE754 64비트 byte로 전달해 **78,620/0**을 확인했다. QA 전달용 태그는 제품 계산 입력에 들어가기 전에 해제하며 세이브 필드/형식과 무관하다. 실패 원로그를 지우거나 최종 성공 검사에 합산하지 않는다.

알려진 선재 결함 원문: **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**. 이번 작업에서 전체 로비 회귀 재실행·수정·PASS 승격 없음.

## 보호·인계 한계

- `main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`, `native_source_new_run_state.gd` 및 타 담당 파일 직접 수정0. 라이브 writer 계약 인수·공용 파일 변경은 이번 읽기·계산 범위에 필요하지 않다.
- 원본 3606–3608의 charIdx/atlas, 3624–3626의 rage/mask/atlas 및 Q/E writer는 미연결이며 현재 snapshot 값을 변경하지 않는다. 기존 보호 로직의 정책 변경 제안 없음.
- trace의 actor HP/ST·authority MP **실제 적용 후 readback은 미검증/연결 HOLD**다. 이번 테스트는 기존 cap이 공급된 분리 snapshot에서의 계산만 증명한다. 생성자 재호출·실제 Main 실행·전체 복원·재시작 유지·PC 실행을 증명하지 않는다.
- UI/화면 변경이 없고 순수 계산 모듈이므로 시각 품질이나 게임 플레이 PASS를 주장하지 않는다. `applyStats`와 남은 dbRestore tail, 외부 owner 적용은 후속 인수 범위다.
- docs 전체 관련 키워드 검색 결과는 `related-docs-search.log`. 기존 trace/설계 수치 변경은 없으며 이번 산출물·허용 범위는 이 보고서와 CHANGELOG_SYNC에 기록했다.

원로그·실행 명령·source slice hash·실패 이력·최종 영수증: `/Users/fordeargamers/exoduser-wt/_out/sv-restore-player/`. 최종 branch/SHA/수치/원격 일치·worktree 제거는 같은 위치의 `DONE.txt`를 기준으로 한다.
