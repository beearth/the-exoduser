# EC4-01 — 4장 유형·원소 선택 순수 정책

작업ID `ec4-01` · 브랜치 `codex/ec4-01-20261020` · 2026-10-20 KST.

## 기준·의존·보호 범위

| 항목 | 확인 결과 |
|---|---|
| 기준 | fetch한 최신 `origin/main=249c26fad989071a94c19128e524ce0bbcb2c8c9`. 이 main에서 직접 분기했으며 요청 최소249c26fad와 일치 |
| 구현 지시서 | main에는 CH4 추적 문서가 아직 없다. 인수된 [bc2bafff §4.1 EC4-01](https://github.com/beearth/the-exoduser/blob/bc2bafff55d3210d3dc996323c2317e40b78a6a1/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md)을 읽고 `L/trace-reference.md`로 보존. 문서 전체를 제품 의존으로 반입하지 않음 |
| 재사용 | main에 포함된 `native_ch2_enemy_spawn_policy.gd`와 `native_ch3_enemy_spawn_policy.gd`의 API/NOT_READY/원래 CDF·RNG 순서 및 격리 UTF-8 oracle 테스트 형식. EC3-01 e7104429 main 포함을 ancestry로 확인. 기존 selector 가드/함수 변경0 |
| 미병합 의존 | EC2-03/04/05/06 및EC3-02는 기준 main에 없음. 이번 선택 정책은 constructor/AI/탄을 소비하지 않아 반입·호출·merge0. 미병합 후속이 필수인 경로 없음 |
| 소유권 | WORK_BOARD의 PC P2-008a/FIX·b actor/factory, P3-002 굴, P3-003 지역을 읽었다. 신규 선택 leaf/test와 교집합0. 보드·기존 담당 파일 변경0 |
| 변경6파일 | 신규 `native_ch4_enemy_spawn_policy.gd`·`test_ch4_enemy_spawn_policy.gd`·자기UID2, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |
| 공용 보호 | Main/State/world/factory/player/hurtE/기존selector/기존테스트/저장0줄. **godot/tools/export_ch1_area_source.mjs·export_ch2_area_resources.mjs 수정0**. 원본 HTML·기존제품/resource의 byte 감사 포함 |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. tracked INDEX/WORK 시작·끝 별도 대조. R의 branch 전환/파일 수정·설치·reset0 |

L=`~/exoduser-wt/_out/ec4-01/`. 이번 READY는 **선택 계산**이며 actor/World/State/RNG 소유자가 아니다. HP/정예/소환/등록/실전 전투/화면/저장 구현이나 CH4 플레이 완료를 뜻하지 않는다.

## 원본 행과 구현 계약

원본 game.html의 SHA256은 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 65,692행이다. 기준 main blob과 byte 동일 확인. index.html도기준 main과동일이며변경0이다.

| game.html 원본 행 | 보존한 계약 |
|---|---|
| 16633–16666 | 4장=hell3, si14..20만 허용. si13/21 등은 다른 장으로 fallback하지 않고0draw NOT_READY |
| 30976–30977 | 원순서31쌍=0..19/50..59/47, 총가중치165. 47은기존CH1/PC의존이고 actor지원 추가아님. 20..46/48/49/90..99 혼입0 |
| 30991 | 원거리 선택 교집합 `[1,7,8,9,13,16,17,53,54]` 9종/36. 비R22종/129. 11/47은R아님. 후방이동/근접접촉 목록으로 사용0 |
| 30993–31008 | 첫U<.5이면R풀 원순서누적36·다음U×36에 strict< 적용. 31종 균등선택/전체CDF1회로대체0 |
| 30986–30989,31010–31015 | 각weight/165를원래순서로더한binary64 CDF. 첫U≥.5이면최대12회전체CDF추첨/R기각. 전부R이면2/총13draw. 정수누적후나누기로재연산0. R기각도실소비로기록 |
| 30985,31017–31022,14333 | 첫U<.45→F1/1draw, 그외다음U×6 trunc→P0/F1/I2/D3/L4/H5/2draw. E6제외. U=.45는두번째draw를소비하며 그draw로F도다시가능 |
| 같은 원본 / caller 경계 | 원소 이상적 비율F13/24·나머지각11/120은선택함수의결과. 굴undefined/문지기F/자식e.el은별도caller계약이며이leaf에서추가0. 희귀교체/정예·constructor·HP·AI는구현0 |

API는 RefCounted `pick_etype(stage:int,random_unit:Callable)` / `pick_element(...)`. READY는 `status/value:int/draws:int`, 실패는value없이 `status=NOT_READY/reason/draws`다. guard는stage→callable→sample. unsupported_stage/invalid_random_callable은0draw, invalid_random_sample은잘못된호출까지포함한k+1draw다. bool/null/string/Array/Dictionary/NaN/±Inf/음수/1이상은clamp/repair/retry하지않고int0은정상이다. 내부randf/seed/State writer0.

## 원문 JS 대조·UTF-8 하니스

원본 CHAPTER_STAGES/TOTAL_STAGES/SI_TO_HELL/EL/HELL_SPAWN/HELL_EL/CDF/Set 선언과rollEtype/rollEl함수만VM에서실행했다. 전체게임/DOM/World를부팅하지않고Math.random에명시stream을주입했다. 기대값을새GDScript의수식으로만생성하지않았다.

| pin | SHA256 |
|---|---|
| rollEtype | `b816226c2ae3db962ca2d82dc4730ab8817e6cbc314a42509dea6ee791f23d71` |
| rollEl | `84f0a33ae64d8d6a47eaaa8d46dd0084c315c3ac4b999a549593b6f6d55efbd6` |
| 발췌 선언부 | `efb24d2f80a6e6f22057177c85fd920f73b47a4e0b27bfe1f28e11eb39f7e99c` |

각si14..20에서기본golden9=총63: type[0,0]→1/2, [0,2/36]→7/2, [0,.999999]→54/2, [.5,0]→0/2, [.5,6/165×12]→2/13. element[.449999]→F/1, [.45,0]→P/2, [.45,1/6]→F/2, [.45,.999999]→H/2.

총2,814원문사례에는각R누적경계/전체CDF경계의binary64직전·동일·직후, 구간중점, .5/.45 분기경계, 0..11R기각후비R/12연속R fallback, 6원소경계, 장별100쌍seedstream을포함했다. 모든31etype가각stage에실제선택됨을coverage단정한다. 값/총draw/실제소비열·little-endian binary64 bits·미소비tail·다음sentinel·입력불변을정확비교하고허용오차0이다. 정상0정수·지원밖stage/가드우선순위·각위치불량샘플도검사한다. 원본이정의하지않은진단은명시한API계약이며게임원문에없는fallback을추가하는것이아니다.

**모든단정은원본행범위와label/성공여부를JSONL로남긴다.** 그룹별evidence를포함한RESULT와 `unit-final-artifacts/ec4-01-assertions-<pid>.jsonl`에전수기록, 원문receipt도같은폴더에보존한다. 하니스입출력·진단단정은해당원본범위와명시된EC4-01하니스/API계약임을구분했다.

Node는필수 `--node-bin=<절대경로>` 인자로받는다. test에내장된JS를자기격리userdir에새임시.cjs로쓰고Node가`wx`로UTF-8결과파일을작성, Godot는그파일을읽어파싱한뒤임시2파일을삭제한다. OS.execute의모든콘솔조각은join해서진단만사용한다. receipt의`4장 유형·원소 가😀` marker도정확비교해Unicode보존확인. 이harness는Node내장fs/vm/crypto만써 **npm/acorn/node_modules 준비불필요**다. 기존oracle이acorn을요구하면그테스트의안내를따른다. R에서설치/연결변경0.

실행명령(자기worktree, 해당상수격리override를먼저설정):

```sh
/path/to/Godot --headless --path godot --script res://tests/test_ch4_enemy_spawn_policy.gd -- --node-bin=/absolute/path/to/node --artifacts-dir=/absolute/external/ec4-01-logs
```

매launch전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을실행하고2이상이면30초씩대기/재조회했다. `L/process-gate.jsonl`원문보존. 새격리명 `EXODUSER-ec4-01-Isolated-20261020`; 기존EC2/EC3테스트는각파일USERDIR, 상수없는factory/contracts는작업격리명이다. override는기존파일부재를확인한후매번설정/finally삭제한다.

## 실행 검증

| 실제 실행 | 결과 | exit / ERROR / WARNING | 격리 |
|---|---|---|---|
| import | 완료 | 0/0/0 | EXODUSER-ec4-01-Isolated-20261020 |
| unit-01 / unit-final | 각각22,364/0단정·2,814원문사례 | 각각0/0/0 | EXODUSER-ec4-01-Isolated-20261020 |
| test_ch2_enemy_spawn_policy | 7,483/0단정 | 0/0/0 | 파일상수 EXODUSER-ec2-01-Isolated-20261020 |
| test_ch2_enemy_constructor_policy | 159,902/0단정 | 0/0/0 | 파일상수 EXODUSER-ec2-02-Isolated-20261020 |
| test_ch3_enemy_spawn_policy | 10,234/0단정 | 0/0/0 | 파일상수 EXODUSER-ec3-01-Isolated-20261020 |
| test_encounter_factory | 3그룹/실패단정0 | 0/0/0 | 작업격리(파일상수없음) |
| test_contracts | 5그룹/실패단정0 | 0/0/0 | 작업격리(파일상수없음) |

신규 최종22,364/0, 기존회귀5종 실패0·skip/미완그룹0. 단정수와그룹수를합산하지않는다. 모든최종회귀의RESULT·종료코드·ERROR/WARNING을같이확인했고ObjectDB/resource종료경고없음. Godot4.7.2.stable.official, Node24.15.0(darwin-arm64)의실제절대경로로실행. Windows/GUI/실제7맵전투의검증은아니다.

| 자기 신규 policy에만 의도적으로 주입한 결함 | 검출 실패단정 / exit | 목적 |
|---|---:|---|
| F테마값1→2 | 347 /1 | 테마원소와golden/소비분기 |
| 첫U<.5→≤.5 | 2,499 /1 | 분기경계·RNG소비열 |
| 최대12추첨→11 | 112 /1 | 최대재시도/마지막불량샘플/fallback |
| 지원하한14→13 | 6 /1 | stage범위/가드우선순위 |
| CDF에weight/total순차누적 대신정수누적후나누기 | 154 /1 | 부동소수원연산순서/ULP경계 |

5종모두원문사례2,814개와동일한22,364단정을실행하여exit1·실패>0/engineERROR0을확인했다. `L/mutation-results.json`. 검사를삭제/완화하지않았다. finally로자기policy원본byte/SHA를복원한후unit-final과기존회귀전체를실행했다. 의도된실패는최종PASS에합산하지않으며원로그/JSONL을보존한다.

실행전process gate에서2이상이면30초대기를반복했고공용프로세스종료/설정변경0. 총Godot13launch(import1+초기신규1+결함5+최종신규1+회귀5), 매launch직전허용count1. 기존source/scripts/tests/data/scene·원본과고정도구를포함한1,607파일이최종byte동일이다. 신규검사의22,364개모든JSONL행에source근거가있으며실패0을별도로검산했다. 임시helper/receipt는제거하고외부L에원문receipt와단정ledger만보존했다.

## docs 대조·공용 접점·제출

코드작성후docs전체관련키워드검색166일치행은 `L/docs-keyword-search.txt`. 추적문서§2의옛CH4상세제목/160시각풀/얼음금지와논리31풀·원소선택의차이는설계파일을수정하지않고이보고서·CHANGELOG에기록한다. 총관리/공격문서의47가중치10/7가중치8은원문과일치. 데이터분모·선택계산을actor/7맵완료로승격0.

| 공용 접점 (이번0줄) | 후속 인수 경계 |
|---|---|
| native_spawn_hole_system / enemy_factory / world | si14..20선택호출위치·굴원소undefined·실RNGcursor/constructor·ens등록은별도owner. 기존stage0/CH2/CH3guard를완화하지않음 |
| Main/State/regions·saveadapter | 실제CH4부팅/7맵선택·지역분모/kill·전환/저장연결0. EC4-02 catalog나50..59 AI/HP를이단위에추가0 |
| export_ch1_area_source / export_ch2_area_resources | 사용자지정순차재맞춤대상이라절대수정하지않았다. 이테스트는공용추출기를호출하거나재생성manifest를쓰지않음 |

실World/7맵자연스폰/전체RNG·collision·skin·HP/피격/정예·소환·실탄/반사·PC Windows/실창/성능·전체저장은미확인이다. 미병합후속반입이필요한작업이생기면정확접점/BLOCKED로보고하며이번에는필요없었다.

최종범위감사/보호파일동일성/원격SHA/DONE/cleanup은L의scope-audit.json·protected-files-comparison.json·submission.json·DONE.txt에보존한다. 정상훅·경로지정stage·자기branch만일반push, main push/force/reset/add -A0. push·원격일치·DONE뒤자기worktree제거, branch/원로그보존.
