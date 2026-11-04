# EC2-01 — 2장 유형·원소 선택 정책

작업ID `ec2-01` · 브랜치 `codex/ec2-01-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 기준과 담당 범위

| 항목 | 확인 |
|---|---|
| 기반 | fetch 후 최신 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. `game.html` SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 승인 설계 | [trace-enemies-ch2 cf57f721 §4.1](https://github.com/beearth/the-exoduser/blob/cf57f721041869f0b7a2c18383cafe7f4ef003dc/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md). 원격 main에는 아직 없어 문서만 읽었고 그 브랜치를 병합하지 않음 |
| 착수 전 WORK_BOARD | `docs/engine/orders/WORK_BOARD.md:1–33,36–100`을 확인. P2-008a=CH1 etype20 actor/json/factory, P2-008a-FIX=crawler/빙결전사 포이즈, P2-008b=factory·CH1 order11/9 신규 actor. P3-002=소환굴/World 동적 등록, P3-003=지역 owner. 기존 trace/정예/보스 작업도 참조만 |
| 중복 판정 | 이번은 신규 CH2 선택 계산 모듈/테스트만. 기존 CH1 선택/actor/factory·소환굴·정예 생성·World에 연결하지 않아 소유 경로 교집합0. 보드의 P2-008a-FIX 과거 미착수 상태를 최신 사용자 인수와 혼동하지 않음. PC 후속 실행 현황은 미확인 |
| 변경 허용 경로 | `godot/scripts/native_ch2_enemy_spawn_policy.gd`, `godot/tests/test_ch2_enemy_spawn_policy.gd`, 위 파일 자기 UID2개, 이 보고서, CHANGELOG_SYNC 맨 위 자기 절 — 총6파일 |
| 보호 | 기존 공용·다른 담당 제품·기존 테스트·저장 형식0줄. WORK_BOARD도 무수정, 보고서/DONE으로 총괄에 인계. R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`·branch `codex/mac-live-play-time-main-20261017` 및 tracked INDEX/WORK 보존 |
| 작업 환경 | `worktree add --no-checkout` 후 non-cone sparse-checkout. scripts/tests/port_modules/data/scenes/docs/원본과 해당 회귀 부팅에 필요한 리소스 경로만 checkout. push·원격 SHA 일치·DONE 기록 후 자기 WT 제거 |

## 원본 값과 API

| 원본 game.html 행 | 정확한 이식 계약 |
|---|---|
| 16633–16641,16658–16666 | CH2 hell1, si4..9만 지원. 지원 밖 stage는 stage0 fallback 대신 NOT_READY·소비0 |
| 14333 | 원소는 원본 EL 정수: P0/F1/I2/D3/L4/H5. 문자열 번역/대지E6 추가 없음 |
| 30969–30989, CH2 pool30972–30973 | 원래 순서31쌍, 총가중치178. 0..19·30..39·47. 20..29 없음. CDF는 source대로 각 weight/total을 순차 float64 누적 |
| 30991,31001–31008 | 원거리 교집합 `[1,7,8,9,13,16,17,34,38]`, 9종/가중치38. 31 제외. 첫 U&lt;.5일 때만 원거리 가중합 추첨, strict `rv&lt;rc` |
| 31010–31015 | U≥.5이면 전체 CDF에서 최대12번 추첨해 원거리 결과를 기각. strict `r&lt;c` 유지, 12번 전부 기각 시 etype2. 총 실제 RNG2..13회 |
| 30985,31017–31022 | 첫 U&lt;.4이면 P, 아니면 두 번째 U×6 trunc → P/F/I/D/L/H. 최종 이상 분포 P .5/다른 각 .1, 원본 소비1..2회. U=.4는 두 번째 추첨을 소비 |

RefCounted의 `pick_etype(stage:int, random_unit:Callable)` / `pick_element(...)`만 제공한다. READY는 `{status:"READY",value:int,draws:int}`, 지원 밖/무효 Callable/잘못된 샘플은 `{status:"NOT_READY",reason:String,draws:int}`이며 value를 만들지 않는다. 샘플은 호출자 주입 숫자 `[0,1)`만 허용하고 bool/문자열/null/NaN/∞/범위 밖은 진단한다. 샘플 오류까지 실제로 소비한 횟수는 유지하며 보충·clamp·재시도·되감기0. 자체 RNG·기본 randf·독립 seed·State/World/Main 참조0.

정책 READY는 실제 적 등록/2장 전투 완료가 아니다. 위치·constructor·정예·속성탄·소환·지역 분모·맵 예산·저장 쓰기와 연결하지 않았다. 소환굴의 원소 undefined caller도 바꾸지 않았다.

## 검증

Godot `4.7.2.stable.official.ed1daf0bf`, 바이너리 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`. 실행마다 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 기록하고 수가2이상이면30초씩 대기했다. 최초 unit 실행 전2회 대기. override.cfg는 매회 격리명 설정·finally0byte, 최종0byte. 상수가 없는 contracts/factory/element는 작업 격리명, 나머지는 파일 USERDIR 그대로다.

원본 JS literal·매핑·rollEtype/rollEl 함수만 테스트의 Node VM에서 읽어 실행한다. game.html/DOM/실게임은 부팅하지 않으며 기대값 산식을 GDScript로 다시 작성하지 않는다. 신규 테스트 oracle **2,406사례**: 고정golden54 + CDF중간186/경계546 + 원거리중간54/경계150 + 분기경계18 + rejection72 + 원소분기18/경계108 + 주입stream1200. 각 사례에서 실제 정책 결과·RNG횟수·소비한 값의 바이트/순서·입력불변을 대조한다. 모든 stage/etype30..39 선택 가능, pool/원거리 값과 순서, invalid 입력/late sample 오류 소비도 단정한다.

| 실제 실행 label(원로그 이름) | 최종 결과 | exit/ERROR/WARNING | 격리 이름 |
|---|---|---|---|
| `unit-final` | 7483단정/0실패 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `p1002f-final` | 357단정/0실패 | 0/0/2 | `EXODUSER-P1002F-Isolated-20261020` |
| `spawn-holes-final` | 298단정/0실패 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |
| `test_native_element_projectiles` | 4그룹/실패단정0 | 0/0/1 | `EXODUSER-ec2-01-Isolated-20261020` |

모두 전체 그룹 실행·SKIP0. 그룹 수와 단정 수를 합산하지 않는다. 신규 unit 7,483/0은 실제 Godot 실행 수치이고, 별도 JS 추출을 Godot PASS로 세지 않았다. 원소탄4그룹은 기존 fixture/World 소비자 검수이며 자연 CH2 actor나 Q/E 전체 동등성 증거가 아니다. p1002f는 기존 공개 공격 API 기반 fixture 개입 및 강제 actor필드 쓰기를 자체 결과에 계속 표시한다.

### 실패/환경 보완 이력도 보존

- `unit-01`: **7,452/20실패**, exit1/ERROR0. 두 table 비교의 JSON float/int 타입 차이와 CDF exact경계18실패를 확인. 단정 삭제/허용오차 확대 없이 table의 각 숫자를 정확 비교하고, JS RNG샘플을 little-endian binary64 base64로 전달하도록 테스트만 정정. 제품 정책 산식 변경0. `unit-02` 7,483/0 후 전송 진단을 추가한 `unit-final`도7,483/0. JSON decimal parser와 원시double이 달랐던 입력 위치1,306개를 최종 결과에 기록한다(중복 입력 포함, 실패 수가 아님).
- 최초 `test_p1002f_dedicated_hurte`357/0·`test_p3002_spawn_holes`298/0은 각각 ERROR282 때문에 깨끗한 회귀 통과로 인수하지 않음. sparse에 빠진 Main의 동적 맵 이미지195종을 확인, 필요한 `godot/assets/map/` 추가 checkout/import 후 위 final label로 재실행. 기존 제품/검사/에셋 바이트 수정0.
- `import` exit0/ERROR0/WARNING0, `import-map` exit0/ERROR0/WARNING1. 후자의 원문: `WARNING: Missing .uid file for path "res://assets/vfx/radiant.gdshader". The file was re-created from cache.` import 생성된 다른 담당 UID/receipt는 stage하지 않는다.
- 최종 p1002f·소환굴·원소탄 각각 Camera2D 경고: `WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`
- 종료 p1002f 원문: `WARNING: 2 ObjectDB instances were leaked at exit (run with --verbose for details).` 소환굴 원문: `WARNING: 8 ObjectDB instances were leaked at exit (run with --verbose for details).` ERROR0과 구분해 기록하며 누수 원인/선재 여부는 미확인, 이번 공용0줄 범위에서 수정하지 않음.

## 문서 동기화와 후속 경계

`rg`로 docs 전체의 HELL_SPAWN/rollEtype/CH2E-01/2장 스폰 및 새 모듈 관련 키워드를 검색했다(원로그 docs-keyword-search.log). 몬스터_공격시스템의 pool/50% 분기 설명, CH1추적·소환굴 문서의 CH1전용 경계와 충돌하는 수치 변경0. 이번 신규 계산 정책의 구현 상태·API·수치는 이 보고서와 CHANGELOG_SYNC에 기록하며, 제품 연결이 없는 것을 기존 CH1/전체 적 이식 완료로 승격하지 않는다.

이 1번 단위는 공용 연결 없이 완료 가능하므로 BLOCKED가 아니다. 이후 factory/world 소비는 별도 인수: `godot/scripts/enemy_factory.gd:60–61`의 stage0/time0 exact schema gate와 source30993/31001–31021의 stage별 선택 경계를 유지해야 한다. `godot/scripts/native_spawn_hole_system.gd:26–40`의 STAGE0/HELL0, World 등록·regions/totalSpawned 및 신규 actor 연결은 각 담당 배정 전0줄. 실제 생성 sink를 붙여 테스트 통과를 가장하지 않는다. 다음 단위는 이 제출에서 착수하지 않았다.

실플레이/실창/PC 실행·자연 CH2 seed/전역 RNG stream/6개 맵 실제 개체·모든 actor AI/전투/정예/저장 동등성은 **미확인**. main push/force/add-A/훅 우회0. 원로그 `~/exoduser-wt/_out/ec2-01/`의 source-oracle.json, unit/회귀 out·err·engine·json, godot-count.log, validation-summary.json, 보호 해시·Git 감사와 DONE.txt로 인계한다.
