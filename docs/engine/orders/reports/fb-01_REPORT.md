# FB-01 — 필드보스 catalog 구현 보고서

## 결과와 기준

상태: **검증 완료·제출 후보**. 원본 사이트와 초기 객체를 생성하는 순수 catalog를 구현했다. 실제 필드보스 생성·AI·전투·보상·State/Main 연결은 구현하지 않았다.

| 항목 | 근거 |
| --- | --- |
| 작업 / 브랜치 | fb-01 / codex/fb-01-20261020 |
| 최신 원본 main pin | ad497089c7955d3e344e1488e5286e9b0ddd9092 |
| 분기·의존 | 추적 문서가 main에 없어 사용자 규칙대로 codex/trace-fieldboss-20261020 끝 200d8e934b7673121b00bd3a15b04d14ac490a2e에서 분기. 선행 추적 커밋 인수 필요. 구현 diff는 이 의존 기준으로 확인 |
| 원본 동일성 | 최신 main game.html과 작업 tree 동일 byte: SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4,65,692행. source-pin.json |
| 실행 source 구분 | 회귀는 의존 branch 끝의 작업 tree에서 실행. 최신 main 전체 runtime을 실행했다고 주장하지 않음. catalog 수식·행은 최신 main 원본을 별도 추출·평가 |
| 소유 파일 | catalog.gd/자기uid,새 test_trace_fieldboss_s01_catalog.gd/자기uid,독립 fixture fb_01_source_oracle_20261020.json,이 보고서,CHANGELOG_SYNC 절. 총7파일 |
| 보호 | 기존 tracked Godot1,297파일 시작 SHA 보존. native_regions·1장 보스·Main/State/World/피해·native_skill_slots·설계 docs 수정0. 최종 protected-final.json 대조 |
| R | branch codex/mac-live-play-time-main-20261017,HEAD dd49171c5b88e211575a41f185395d6c0a14b184. 시작 tracked INDEX/WORK clean. R은 fetch/read만,checkout/reset/merge/commit 없음 |

## 원본 계약과 API

모듈은 godot/port_modules/fieldboss_source/catalog.gd,extends RefCounted이다. class_name/Node/자동 부트/mutable 전역 cache/외부 provider 의존은 없다.

| API | 동작 |
| --- | --- |
| catalog(kind) | angler/worm/firedevil/gate_guard 상수와 규칙표를 매번 깊은 복사로 반환. 사이트·속성·지역 mapping·문지기 후대입 순서 포함 |
| build_initial(kind,input) | 앵글러25키·곰치20키·화마귀28키의 원본 생성 객체 반환. 좌표/home/초기 타이머·누락 키·bool과 Number 구분 보존 |
| READY | status/value/writes0/source_ref(main/file/sha256/lines). value는 caller 소유 새 객체. actor 필드에 receipt를 추가하지 않음 |
| NOT_READY | status/reason/writes0만 반환. 잘못된 kind/입력·필수키·Number/NaN/Inf·원소·asleep 타입 거부. 값0으로 정상 생성 위장 없음 |
| 문지기 | catalog는 etype7개·배율/후대입10회 순서·지역.10 규칙만. build는 항상 requires_approved_mkEn_input. frozen HP3500/ATK62나 fake actor 반환0 |

| 최신 game.html 행 | 적용 |
| --- | --- |
| 16631,60694,60973–60978,60985,61043–61046 | T40,앵글러4사이트/el[2,1,3,4]/지역[2,3,0,1],HP/ATK·전체초기값 |
| 61237–61243 | 곰치4사이트·wake1000·픽셀 입력·asleep별 hideT0/54·초기값 |
| 61443–61448,61460,61632–61635 | 화마귀4사이트·wake1000·HP배율2.5/속도1.8·전체초기값 |
| 31614–31626,60725 | 문지기hell→etype,원본후대입 순서,지역.10 읽기전용표 |

host 경계와 원본 계산을 구분한다. 좌표/레벨은 유한 Number만 받고 tile_size는 명시된 T40만 받는다(기본값/자동보정 없음). 앵글러 원소는 이 단위의 사이트 집합1/2/3/4만 허용하고 곰치 asleep는 bool만 받는다. 이 범위 안에서 음수·소수·lv0을 clamp하지 않는다. HP의 lv||1와 ATK의 rawlv 사용 차이,JS Number 계산 순서와 ToInt32를 보존한다. 중간 연산 Infinity의 ToInt32는0이며 입력 NaN/Infinity 거부와 별개다.

앵글러 alive=true,곰치/화마귀에 없는 alive/ib와 곰치에 없는 el을 일괄 추가하지 않았다. homeX와 일반 적 _homeX를 바꾸지 않았다. 생성 함수의 RNG 호출·G/P/State 쓰기·지역 초기화·보상 호출은0이다.

## 독립 oracle와 최초 실패 수리

최신 main에서 선택한 상수·세 생성자만 별도 JS VM에서 평가했다. 원본 함수/식은 외부 generate_oracle.mjs와 main-game.html에 보존했다. 기대값은 포트 출력에서 생성하지 않는다.

- 일반7레벨×전체12사이트(곰치 asleep 두 경우 포함)112객체.
- 음수·소수·큰 유한 수·HP/ATK ±2^31/±2^32 경계 주변93객체. 총205객체.
- 모든 키/누락/값을 정확히 대조하며 Number 비교에 epsilon을 넣지 않는다. 별도 고정7레벨 HP/ATK 표도 검사한다.
- 잘못된 입력 그룹821단정,깊은 복사·불투명 caller 입력 보존·호출형 RNG0/공유 RNG 보존219단정.

최초 catalog-01은 **8,412단정/12실패·exit1**이었다. 실패 원문을 보존했다. Godot decimal JSON parser가 일부 레벨 입력을1 ULP 다르게 읽은 하니스 문제로 판정했다. 진단5표본에서 비트 차이와 정확한 비트 입력일 때 HP/ATK 일치를 각각 확인했다(10/0,number-diag-01).

예: boundary:worm:13의 JS 입력 little-endian hex는555555096cc19641,파서 결과는545555096cc19641. 기대 HP−1 대신−2가 나왔고 JS 비트를 복원하면−1로 일치했다. 실패한5개 행 모두 같은 원인임을 진단 로그에 보존했다.

수리는 fixture에 JS Number의 IEEE-754 little-endian 비트를 추가하고 하니스가 정확히 복원하는 방식이다. **205개 기대 객체와 기존 decimal 입력 변경0,catalog 모듈도 최초 실패 당시와 동일 byte**다. 입력 Number10개에서 파싱 차이를 관측했다. 복원 후 catalog-02는 **10,201단정/0실패·205표본·skip0·exit0·stderr ERROR0·경고0**이다. 최초 실패를 성공과 합치거나 지우지 않는다.

최종 oracle SHA256:d26d77e6adb1041836bb708311a9523d63d1ee85ef561bf0de71d5791855fcc5. 모듈 SHA256:1bfb2309fb5e239735541fa31652d64c6032713abf5f4703ab076b6b02668c17. implementation-audit.json에 불변 증거,oracle-v1.json/catalog-module-v1.gd/catalog-test-v1.gd에 초기 파일을 보존했다.

## 실행 결과

| 로그 접두사 | 단정 또는 그룹 / 실패 | 종료 / stderr |
| --- | --- | --- |
| catalog-01 | 8412 / 12 | exit1 / ERROR0 / 경고0 |
| number-diag-01 | 10 / 0 | exit0 / ERROR0 / 경고0 |
| catalog-02 | 10201 / 0 | exit0 / ERROR0 / 경고0 |
| import-01 | — groups / — | exit0 / ERROR0 / 경고0 |
| contracts-01 | 5 groups / 0 | exit0 / ERROR0 / 경고0 |
| regions-01 | 43 / 0 | exit0 / ERROR2 / 경고1 |
| holes-01 | 298 / 0 | exit0 / ERROR2 / 경고2 |
| mutation-hp_multiplier | 10201 / 121 | exit1 / ERROR0 / 경고0 |
| mutation-tile_center | 10201 / 354 | exit1 / ERROR0 / 경고0 |
| mutation-fabricated_guard | 10196 / 10 | exit1 / ERROR0 / 경고0 |
| mutation-rng_consumption | 10201 / 1 | exit1 / ERROR0 / 경고0 |
| import-03 | — groups / — | exit0 / ERROR0 / 경고0 |
| regions-02 | 43 / 0 | exit0 / ERROR0 / 경고1 |
| holes-02 | 298 / 0 | exit0 / ERROR0 / 경고2 |

변조는 저장소 밖 복사본에만 적용했다. HP배율·타일+.5·가짜문지기생성·RNG소비를 각각 바꾼다. **명시적 단정 실패/exit1/ERROR0/205표본 실행**일 때만 검출로 인정한다. parse error·잘못된 경로·SKIP·실행 미완료를 검출 성공으로 세지 않는다. 검출 수와 실제 실패 수는 verification-batch.json 및 각 mutation meta를 기준으로 한다. 저장소 모듈은 변조하지 않는다.

최초 regions-01/holes-01은 단정43/0·298/0,exit0이지만 이미지2개 로드 ERROR 때문에 전체 실패다. 초기 sparse 범위에서 기존 tracked godot/img/map_dragon_skeleton.png/map_dragon_3d.png 및각.import가 빠진 작업 환경 누락으로 판정했다. 필요한4파일만 sparse에 추가하고 원본 Git blob과 동일 byte임을 확인했다. 코드/기대값은 바꾸지 않고 재import 후 실패한 두 회귀만 재검사했다. 첫 holes 실행의 ObjectDB8 경고도 원문 보존한다(sparse-assets-correction.json).

sparse add에서 지원하지 않는 옵션을 사용한 준비 명령1회는 실패로 보존했다. 자기 import-02 대기 runner를 엔진 시작 전에 종료(exit143)하고,올바르게4파일이 materialize된 후 import-03을 실행했다. 다른 Godot 프로세스는 종료하지 않았다. import-02는 실행/PASS에 세지 않는다.

기존 Camera2D 물리보간 경고도 보존한다. 계약/지역/소환굴 회귀는 기존 부트/지역/등록을 바꾸지 않았는지 확인하는 범위이며 필드보스 전투 증거가 아니다. 기존 P3-003 RESULT의 C_kill_hook_bound 등 고정 메타도 실제 전체 연결 검수로 해석하지 않는다.

## 격리·실행 환경

Godot 원앱4.7.2를 사용한다. 모든 실행 전 지정 pgrep 명령을 실행하고2 이상이면30초씩 대기했다. process-gate.jsonl에 명령/시간/count/대기를 남겼다. 다른 GUI/capture 프로세스를 종료하거나 설정을 바꾸지 않았다.

새 테스트/진단/import는 **EXODUSER-fb-01-Isolated-20261020**. 기존 지역은 EXODUSER-P3003-Isolated-20261020,소환굴은 EXODUSER-P3002-Isolated-20261020으로 각 파일 상수를 그대로 사용한다. test_contracts에는 격리 상수가 없어 기존 파일 수정 없이 runner가 작업 고유 격리명을 지정했다. override.cfg는 실행 후 삭제/부재 복원한다. 사용자 세이브 read/copy0.

재사용한 것은 sk-s03의 .godot/imported·class/uid 파생 캐시뿐이며 이 작업 tree에서 full import를 수행했다. 캐시만으로 PASS를 주장하지 않는다. import-01은 exit0/ERROR0. import 전후 기존1,297파일과 전역 editor_settings hash가 동일했다. 캐시·기타 파생 import 파일은 커밋하지 않는다.

## 공용 경계와 다음 단위

현재 단위는 공용0줄이다. 다음 제안 FB-S02는 별도 hit_core+fixture이며 아직 구현하지 않았다. Main/State 연결이 필요한 FB-S10은 통합 결정 전 HOLD다.

| 후속 접점(최신 main 기준) | 필요한 변경·근거 | 이번 조치 |
| --- | --- | --- |
| Main.gd267–273 주변/update phase | 실제 field owner configure/호출 위치 조정. game32143–32146은 FB→지역→WM→FD 순 | 0줄. 실제 API/필요 줄 수 미확인,승인 전 추정 구현0 |
| State.gd278–305의 소환굴 writer와 별도 FB 권한 | 기존 허용키는spawnHoles/totalSpawned/shake뿐. FB/WM/FD/alias/done writer 수명 인수 필요 | 기존 writer 확장0. 허용키·같은 live G·reset 조정 필요 |
| native_regions.gd65–74/118–125/158–168 | 기존 FB index/같은 Array/미스폰 생존·정화 읽기 소비 | 참조만. fake fbDone/킬/분모·배열압축·재초기화0 |
| World/query·피해·탄 owner | 원본18733–18755/5공격유입,큰탄/패링은 별도 owner 계약 | 등록·HP/피해·Q/E·native_skill_slots 변경0 |

필요한 공용 배선이 확인되면 위치·원본 근거와 함께 보고하고 그 단위는 중지한다. 이번 결과로 P3-003/1장 보스의 소유권을 인수하지 않는다.

## 제출·보존

추적/설계 docs는 참조만 했다. 새 모듈·새 테스트·자기 oracle/uid·이 보고서·허용 CHANGELOG 절만 경로 지정 stage한다. .gitignore의 test_* 규칙 때문에 자기 신규 테스트만 git add -f -- <정확한 경로>를 사용하며 정상 pre-commit/docs-sync를 수행한다. --no-verify/훅 우회/전체 add/main push/force 없음.

원로그:/Users/fordeargamers/exoduser-wt/_out/fb-01/. 최종 SHA·원격 일치·R/보호 해시·정리는 DONE.txt/별도 JSON에 기록한다. push·원격 SHA 확인 후 DONE을 쓰고 자기 worktree를 제거하며 branch/원로그를 보존한다. 실제 필드보스 플레이·화면·PC 인수는 미확인이다.
