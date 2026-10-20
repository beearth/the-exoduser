# EC3-01 — 3장 유형·원소 선택 순수 정책

작업ID `ec3-01` · 브랜치 `codex/ec3-01-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 기준·담당 충돌·재사용

| 항목 | 확인 결과 |
|---|---|
| 기준 | fetch 후 최신 `origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`. 최소6d987cb8a와 동일하며 여기서 직접 분기했다 |
| 지시서 | main에는 CH3 추적 문서가 없어 명시 원격ref를 추가 fetch했다. `origin/codex/trace-enemies-ch3-20261020=20b2139a7f140f13dc37deb082e471c494d6fa77`와 서버 SHA20b2139a 일치. [§4.1 EC3-01](https://github.com/beearth/the-exoduser/blob/20b2139a7f140f13dc37deb082e471c494d6fa77/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH3_20261020.md)을 적용. 이 문서가 main에 있다고 표시하거나 문서 전체를 병합하지 않음 |
| 필요한 EC2 의존 | selector인 EC2-01(c7e02549)은 main에 이미 있다. API·NOT_READY 진단·가중합/CDF 원연산순서·주입 RNG·원문 oracle/binary64 검사 형식을 재사용했다. 장별 leaf는 지시서대로 새로 두며 기존 CH2 stage4..9 guard를 무시하는 상속/수정은 하지 않음. 범용selector 추출도 공용 변경이라 수행0 |
| EC2-02..06 | 이번 선택 정책은 constructor·AI·탄·clock·callback을 소비하지 않는다. 기존 부품의 코드 복제/변경/actual 연결0. 따라서 미병합 EC2-03..06 끝에서 불필요하게 분기하지 않았고, 해당 부품이 필요한 후속 CH3 단위의 재사용 의존은 유지한다 |
| WORK_BOARD | 최신 main의 P2-008a/FIX=CH1 ice/crawler병합, P2-008b=CH1order11/9 actor/factory진행, TRACE-CH1-ENEMIES·ELITES=문서, P3-002=굴/World등록병합을 확인. 신규 CH3 선택 leaf/test와 소유 경로 교집합0. 47이 풀에 포함되어도 PC의47 actor 구현/등록을 복제하지 않음 |
| 변경6파일 | 신규 `godot/scripts/native_ch3_enemy_spawn_policy.gd`·`godot/tests/test_ch3_enemy_spawn_policy.gd`·각UID, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |
| 보호 | 공용·다른담당·EC2·기존테스트·원본·저장 형식0줄. 기존 source/scripts/tests/data/scene 374파일 byte 불변. R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`/branch `codex/mac-live-play-time-main-20261017`/tracked INDEX·WORK 불변 |

## 원본 행·정확 계약

원본은 최신 main game.html이며 checkout과 byte 동일하다. SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 수치는 기존 기획 표의 반올림이나 추정값으로 대체하지 않았다.

| 최신 main game.html | 구현 계약 |
|---|---|
| 16633–16666·SI_TO_HELL | 3장=hell2, si10..13만 지원. stage0/4..9/14를 다른 장으로 fallback하지 않음 |
| 30974–30975 | POOL30쌍의 순서·가중치를 전부 보존. `[0..19,40..49]`, 합136. 20..39/90..99 혼입0. 47은 가중치14의 기존 의존이며 실제 actor 지원 추가가 아님 |
| 30991 | 원거리 선택 분류의 교집합 `[1,7,8,9,13,16,17,42,45,46,48]` 11종/합28. 비R19종/합108. 11/47은 R이 아니며, 이 집합을 근접공격/후방이동 목록으로 쓰지 않음 |
| 30993–31008 | 첫U&lt;.5이면 R풀의 원래 순서 가중합을 다음U×28로 strict&lt; 선택. 모든 개체의 균등선택/원본풀 한 번 선택으로 치환0 |
| 30986–30989·31010–31015 | 각weight/136을 순서대로 누적한 float64 CDF. 첫U≥.5이면 원 CDF를 최대12회 뽑고 R을 기각, 전부R이면etype2. 소비2..13회. 정수 가중치로 재매핑하거나 실패 draw를 되감지 않음 |
| 30985·31017–31022·14333 | HELL_EL[2]=[I2,.45]. 첫U&lt;.45→I/1draw, 아니면 다음U×6 trunc로P/F/I/D/L/H(0..5)/2draw. U=.45는 보조draw 소비, 그 draw에도 I가 있음. E6은 선택되지 않음. 테마가 얼음이라는 이유로 얼음 전용 actor로 제한하지 않음 |

API는 EC2-01과 동일한 RefCounted `pick_etype(stage:int,random_unit:Callable)` / `pick_element(...)`다. READY는 `status/value:int/draws:int`, 실패는 value 없이 `status=NOT_READY/reason/draws`다. unsupported_stage/invalid_random_callable은0draw, invalid_random_sample은 잘못된 호출도 포함한 실제 k+1draw다. bool/null/string/Array/Dictionary/NaN/±Inf/음수/1은 보정·재추첨하지 않는다. 정수0은 올바른 수치 샘플이다. 자체 randf/seed/State writer/실제 RNG 소유자0이다.

### 지시서의 기본 golden

각 si10/11/12/13에서 다음 9개, 총36개를 원본 함수와 Godot 결과로 확인했다.

| 입력 U열 | 값 / 소비 |
|---|---|
| type[0,0] /[0,2/28] /[0,.999999] | 1/2, 7/2, 48/2 |
| type[.5,0] /[.5,6/136 반복12] | 0/2, fallback2/13 |
| element[.449999] /[.45,0] /[.45,2/6] /[.45,.999999] | I2/1, P0/2, I2/2, H5/2 |

이 선택 결과는 room의 rare 교체·정예·constructor·추가 그룹·소환굴·gate의 원소 계약을 적용하지 않은 값이다. 특히 원본 소환굴은 rollEl 호출 없이 undefined를 넘기는 별도 caller이며 이 leaf를 붙여 P/I로 지정하지 않았다.

## 실행 검증·하니스

원본의 CHAPTER_STAGES/TOTAL_STAGES/SI_TO_HELL/EL/HELL_SPAWN/HELL_EL/CDF/Set 선언과 rollEtype/rollEl 함수만 VM에서 실행했다. DOM·게임·World는 부팅하지 않았다. Math.random에는 fixture stream을 주입하고 결과/실제 소비열을 관측했다. 기대값을 GDScript 구현 수식으로만 만들지 않았다.

| 고정 원본 pin | SHA256 |
|---|---|
| rollEtype 본문 | `b816226c2ae3db962ca2d82dc4730ab8817e6cbc314a42509dea6ee791f23d71` |
| rollEl 본문 | `84f0a33ae64d8d6a47eaaa8d46dd0084c315c3ac4b999a549593b6f6d55efbd6` |
| 발췌 선언부 | `efb24d2f80a6e6f22057177c85fd920f73b47a4e0b27bfe1f28e11eb39f7e99c` |

신규 테스트는 전체 원본 SHA와 위 함수·선언부 pin을 검사한다. Node 경로는 **필수 `--node-bin=...` 인자**이며 PATH·symlink·고정 설치경로 기본값이 없다. 임시 helper와 JSON 결과는 작업 격리 userdir에 UTF-8로 쓰고 실행 후 제거한다. OS.execute 출력은 진단에만 join하며 JSON은 외부 파일에서 읽는다. Node24.15.0 및 내장 fs/vm/crypto만 사용했고 acorn/npm/node_modules 설치·연결은 필요하지 않아0이다. 새 추출은 고정 anchor/hash와 원문 함수 실행으로 검증했다.

최종 **1,632사례**에서 원본 결과·draw수·소비열·비트열·입력불변을 정확 비교했다. 숫자는 little-endian binary64/base64로 운반하고 실제 소비 double을 다시 base64로 대조했다. JSON decimal 재파싱 오차나 허용오차 확대0. 각 CDF/R누적경계와 .5/.45, n/6의 **바로 인접한 표현 가능 double**(nextDown/동일/nextUp)을 사용했다. [0,1) 밖 이웃은 원문 함수 주입에서 제외했다. 음수/1/비수치는 provider 진단으로 별도 검사하며 유효 영역의 경계를 임의 epsilon으로 대체하지 않았다.

모든 stage에서30개etype 선택 가능, 0..12연속 기각·최대13소비,36golden,seeded fixture stream100개×유형/원소, pool/R순서·합·원소편향·stage map을 대조했다. 무효stage/Callable, 잘못된 첫·두번째 샘플, stage별0..12개의 정상 호출 뒤 잘못된 샘플을 포함한 늦은 실패의 소비를 검사했다. fixture seed는 테스트 입력 생성용이며 게임 RNG seed 권위를 도입한 것이 아니다.

| 실제 실행 label | 결과 | exit/raw ERROR/WARNING | 격리 |
|---|---|---|---|
| `unit-01` | 10234/0단정 | 0/0/0 | `EXODUSER-ec3-01-Isolated-20261020` |
| `test_ch2_enemy_spawn_policy` | 7483/0단정 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec3-01-Isolated-20261020` |
| `test_encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec3-01-Isolated-20261020` |
| `test_p3002_spawn_holes` | 298/0단정 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |
| `test_native_element_projectiles` | 4그룹/실패단정0 | 0/0/1 | `EXODUSER-ec3-01-Isolated-20261020` |

신규 **10,234/0**, 회귀5종 실패단정0·SKIP/미완그룹0. 단정과 그룹 수를 합산하지 않는다. import exit0/ERROR0/WARNING0. 기존 EC2-01 결과는 이번 실제 재실행이며 EC2-02..06의 과거 수치를 새 실행 PASS로 합산하지 않았다. 제품연결/실플레이 증거는0이다.

종료 경고는 아래 원문과 err.log에 보존하며 원인·선재 여부는 미확인이다.

- `test_p3002_spawn_holes`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).``
- `test_native_element_projectiles`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.``

Godot4.7.2.stable.official.ed1daf0bf. 매 실행 전 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 기록하고2이상이면30초 대기(총4회). 새 `EXODUSER-ec3-01-Isolated-20261020`, 기존각상수, 상수없는fixture는작업격리명. override는 매회 설정/finally0byte. --no-checkout/non-cone sparse로 scripts/tests/docs/기존회귀가필요한리소스만 받았다. main의 MAP-LOOK preload shader2개도 동일byte로 checkout했고 제품코드수정은0이다.

## docs 대조·미연결 접점

| 위치·근거 | 대조·후속 소유 |
|---|---|
| docs 전체 검색67행 및 원격 CH3 §1.1/§4.1 | HELL_SPAWN/HELL_EL/rollEtype/rollEl/3장풀/EC3-01 검색을 보존. 몬스터_총관리.md746–754는 공통0..19/3장40..49와테마I의 분류다. 이를 모든개체의I고정으로읽으면 원본 .45+6원소 fallback과 다르므로 이번 표에정확히보충. AI기획과원본행동의차이는기존CH3추적 §2를참조만 하고새AI를구현하지않음 |
| enemy_factory.gd25–31/60–61 | CH1 stage0/time0/schema와 exact actor admission은 불변. CH3 source/스킨/정예/actor는없으며 새selector READY를실등록으로취급하지않음. 기존guard삭제/47자동등록/범용fallback0 |
| native_spawn_hole_system.gd37/518 인접·World RNG | 현재STAGE0/HELL0_POOL와동적등록이소유영역. CH3 선택/4맵예산·undefined원소·sharedstream의정확한소비사이트를별도인수해야함. 기존풀을통째로바꾸거나가짜World로붙이지않음 |
| EC2-02..06·후속EC3 consumer | 수식projection/전용AI/탄/clock/callback 경계는기존부품의존. stage/etype guard완화·AI중복구현0. 필요한3장adapter가공용수정을요구하면정확scope별도배정전HOLD |
| Main/State/regions/Player/save | map부팅·등록/지역분모·처치/보상·저장은기존권위. 이순수선택에는새저장키나State연결이없음 |

이번 단위는 공용 수정 없이 완료 가능하다. 실제 actor/World/factory 연결, 4에리어 자연 도달·첫N마리 실제seed/RNG·PC/실창·전체지원·보상·저장은 **미확인**이며 다음EC3-02는착수하지않았다.

원로그 `~/exoduser-wt/_out/ec3-01/`: start/최신WORK_BOARD·AGENTS·원본/원격지시서·ref, source-oracle.cjs/json·test-body.gd, import/unit/회귀out/err/engine/json, validation-summary/godot-count/보호hash/Git감사/DONE. 정상훅·자기branch push·원격SHA일치·DONE 후 자기worktree 제거. R불변·mainpush/force/add-A/훅우회0.
