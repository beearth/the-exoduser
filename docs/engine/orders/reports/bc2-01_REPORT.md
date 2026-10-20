# BC2-01 — 2장 보스 읽기 전용 catalog

## 기준·소유·재사용

| 항목 | 확인 |
|---|---|
| 작업·브랜치 | `bc2-01` / `codex/bc2-01-20261020` / `~/exoduser-wt/bc2-01` |
| 기준 main | fetch 후 `0119f3048a459a458ba142d98f68126b8e281be1`; 요청 하한 `ce141573e`가 ancestor임을 확인. --no-checkout worktree 후 필요한 경로만 non-cone sparse-checkout, 빈 index는 `read-tree -mu HEAD`로 초기화 |
| 원본 | game.html 65,692행 / SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 원본·설계값·세이브 형식 변경0 |
| 설계 | 인수된 trace-boss-ch2 `ddf0549597e645b507cac672cba29df2639712c3` §5.1(첫 단위). 해당 추적 문서는 기준main에 없어 승인 브랜치에서 읽기만 했고 이송/수정하지 않음 |
| 자기 소유 | `godot/scripts/native_ch2_boss_catalog.gd`, `godot/tests/test_boss_ch2_bc2_01_catalog.gd`, Godot가 생성한 해당 UID2개, 이 보고서, CHANGELOG_SYNC 맨위절. 기존·공용·타 담당파일0줄 |
| 공통 재사용 | BC01~03은 main 파일. BC01의22기술·5페이즈·25콤보를 공개 읽기API로 조회. BC04~07은 각 원격 끝의 모듈/기존 테스트를 외부 격리 회귀 프로젝트에만 읽어 재사용; 제품 브랜치로 cherry-pick/복제0 |
| 범위 | 등록 데이터·읽기 계산만. actor/RNG/시계/전투/Main·State·World/HTTP·실저장/마이그레이션 연결0. 테스트 결과는 실제 전투·피격·패링·시각·성능 검수의 증거가 아님 |

공통 모듈의 상세 원격 ref/SHA·실행 파일은 외부 `dependencies.json`, docs 검색은 `docs-matches.txt`에 보존한다. BC01의 source_receipt가 기록하는 옛 source_main과 이번 기준 main은 구분하며, 동일 game SHA256·등록 manifest를 대조한다. 기존 BC01~07 API의 stage0~3 guard는 수정하지 않았다.

## 원본 등록·공개 API

| 원본 행(game.html) | 등록·처리 계약 |
|---|---|
| 9968–9975 / 10009–10010 | si4~9 최종Set수27/28/29/30/31/32. si4의최종27기술을기본으로si5 seekerMines→si6 fanWave→si7 wallPush→si8 shieldBash2→si9 spiralBullet 누적. cageTrap 전역삭제 반영 |
| 16690 / 16698–16712 / 14333–14342 | 벌레 수호자/점액 괴수/기생충 모체/거대 알주머니/살벽의 군주/여왕 구더기. hell1·element_id0(물리)·etype0·ibtrue. 다른 etype·고유 actor·HP식 생성 없음 |
| 9820–9880 | union32의id/idx/tele/rec/canFeint/canDelay/range/phase/combo/tags/cd와source_ordinal/source_line. 공통22는BC01 읽기, 신규10만소유. moves는원본배열순서,move_ids는Set삽입순서. idx와ordinal을구분 |
| 9832/9840/9841/9847/9861/9866/9872–9874/9876 | 신규10=vortex/beanRain/fanWave/spiralBullet/wallPush/shieldBash2/fireRain/shockGrid/donutSlam/crossWipe. rec/tele는metadata이며실제fanWave90/bossRec40등실행시간을변경하지않음 |
| 9951–9957 | phase0~4의각8필드는BC01.phase_by_index를읽어사용. 같은상수를다시하드코딩하지않음 |
| 9881–9950 | 유효combo union38. 공통25는BC01의실si0~3×phase0~4 조회에서원래ordinal로모으고,신규13만추가. 모든seq가해당CH2Set 안이고phase일치하는항목을global ordinal순으로반환. 같은seq/다른ordinal을제거하지않음 |

| API | 계약 |
|---|---|
| source_receipt | ready/reason,기준main/hash·의존·원본범위·집합수·미연결표시. 의존오류는dependency_unready 명시 |
| boss_for_stage(si) | si4~9만supported,6이름·물리속성·ib/etype·move_ids 반환. 그외unsupported_chapter_stage. 의존미준비도supported=false |
| moves_for_stage(si) / move_by_id(id) | 원본순서·깊은복사. CH2 union외(cageTrap/tailSwipe/burrowStrike등)는빈결과 |
| phase_by_index(phase) | 공통5phase 깊은복사. 범위밖빈결과 |
| combos_for_stage(si,phase) | Set+phase로추린원본레코드의깊은복사. 범위밖빈결과 |
| 내부 snapshot 경계 | receipt/hash/count/manifest·22공통기술·5phase·25combo의누락/잘못된형식을검증. 의존오류시ready=false·reason만반환하고부분moves/phases/combos를반환하지않음. 실제Shared는preload고정,임의fixture를본편의존으로끼우는공개연결없음 |

| si | 이름 | Set수 | combo phase0/1/2/3/4 |
|---:|---|---:|---|
| 4 | 벌레 수호자 | 27 | 14/26/31/33/33 |
| 5 | 점액 괴수 | 28 | 14/27/32/34/34 |
| 6 | 기생충 모체 | 29 | 14/27/32/34/34 |
| 7 | 거대 알주머니 | 30 | 14/27/33/35/35 |
| 8 | 살벽의 군주 | 31 | 15/28/34/36/36 |
| 9 | 여왕 구더기 | 32 | 15/28/36/38/38 |

## 독립 fixture·실행 경계

원본 BOSS_MOVES/COMBOS/PHASES·최종MOVESET·HELL_BOSSES 선언을 Node VM에서 그대로 평가했다. 게임 실행은 하지 않는다. `source_oracle.cjs`와 `source-oracle.json`은 외부 원로그이며 제품 catalog를 불러 기대값을 생성하지 않는다. 테스트는 32기술 전체11필드+메타2필드,6슬롯Set 전체id/순서·이름,5×8phase 필드,38combo 전체seq/phase/ordinal/행 및6×5후보수를 고정 기대값과 비교한다.

추가 경계: stage/phase 바깥·union외ID·Set외combo 힌트 보존,반환배열/중첩필드/별stage/BC01의 깊은복사,의존receipt/manifest/공통기술/phase/combo 누락·불일치/비유한수·범위형식,별ordinal의동일seq 보존. 의존실패fixture는 실제Shared를 바꾸지 않고 순수 내부snapshot 경계만 검사하며,입력불변·부분결과없음을 확인한다.

Godot는 외부 자기 소유 프로젝트에서만 실행한다. 신규 테스트의 ProjectSettings 두값과 실제 OS userdir를 `EXODUSER-bc2-01-Isolated-20261020`으로 확인한다. 기존BC01~07은각파일 USERDIR 그대로,상수가없는test_contracts만별도 `EXODUSER-bc2-01-Contracts-Isolated-20261020`을사용한다. override.cfg는매실행설정후finally에서0byte로비운다. 실제 저장 `EXODUSER-Godot-Native-First`에 실행하지 않는다.

원래contracts 사본에는 제거된worktree를가리키는링크가있어 실행전에 복사본링크를 모두제거했다. contracts 실행입력은현재main의Godot tracked1421파일을Git blob과대조해 자기소유파일로확보했으며,project.godot의custom userdir만격리값이다(`contracts-inputs.json`). 선행단위의실행결과·깨진링크를통과증거로재사용하지않는다.

매Godot호출직전에 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을확인하고2이상이면30초대기한다. 자기Godot는순차1개만실행,다른프로세스종료0. *.gate.jsonl에count/시각,*.json에argv/cwd/exit/시간/ERROR/RESULT,*.out/.err/.engine.log에원문을보존한다. bc02/bc03을포함한회귀실행은 `-- --source-game=/Users/fordeargamers/exoduser-wt/bc2-01/game.html`을전달한다.

## 실제 검증 결과

Godot 4.7.2.stable.official.ed1daf0bf, 전 실행 headless. 아래는 이번 실제 재실행 결과이며 선행 보고서 인용이 아니다. 신규와 BC01~07 합계 **114,036단정/0실패**, contracts는 별도 **5그룹/0실패**다. skip0, 모든 실행exit0/ERROR0, stderr빈값이다.

| 실행 / 원로그 basename | 검사·실패 | 소요초 |
|---|---|---:|
| catalog-01(신규) | 7,169 / 0 | 0.363 |
| bc01-regression-01(main) | 681 / 0 | 0.143 |
| bc02-regression-01(main) | 5,257 / 0 | 0.251 |
| bc03-regression-01(main) | 31,976 / 0 | 0.357 |
| bc04-regression-01(원격) | 21,899 / 0 | 1.051 |
| bc05-regression-01(원격) | 18,424 / 0 | 0.591 |
| bc06-regression-01(원격) | 14,099 / 0 | 0.598 |
| bc07-regression-01(원격) | 14,531 / 0 | 0.484 |
| contracts-01(최신main 입력) | 5그룹 / 0 | 2.228 |
| import-01(신규·BC01~07 최소프로젝트) | exit0/ERROR0 | 1.678 |
| contracts-import-01(최신main 입력) | exit0/ERROR0 | 5.267 |

총Godot11회·자기동시1개. 최초import에서1회,신규실행에서5회 전역count2를확인해각30초씩대기했고,실제launch직전count는모두1이었다. override는모든실행후0byte. `final-results.json`/`suite-summary.json`과각원로그에서확인가능하다. 이후동일코드반복실행으로수치를부풀리거나UI·실전검수로확대하지않는다.

선재결함전달원문: “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”. 이번로비전체는재실행·수정하지않았으며위보스회귀·contracts와구분한다.

새 파일의 실제실행사본/제출본이동일byte이며선행모듈은main/원격Git blob 그대로임을확인한다. 기존실행사본의결과를빌려PASS로세지않는다. 대형contracts실행프로젝트는검증후자기소유사본만정리하고,재현에필요한Git blob목록·설정·원로그와작은catalog프로젝트는외부에보존한다.

## 다음 단위·공용 접점

다음 순서안 B2C02는 BC02~BC07이 CH2 catalog를 받을 공개 인수형식·stage guard·snapshot/ack의 **통합 결정**이다. BC02 build_spawn_packet,BC03 evaluate_move,BC04 select_tick,BC05 phase/clock,BC06 begin_start,BC07 begin_tick/next_tick의기존si0~3제약을고쳐야하므로이번작업에서는진행하지않고 **HOLD**로남긴다. 필요한위치는trace-boss-ch2 §4.2/§6과각원격모듈API에기록돼있다. si4를si0으로위장하거나continuation을조작하지않는다.

실제actor/factory/arena·Main/World/State·hurtE/QE·부활·queue·HUD/음향/저장 연결은 별도 소유자의 통합 결정이 필요하다. `native_normal_enemy_hurte.gd`의boss_hurtE 거절 등은 그대로 보존했다. 이 catalog의데이터조회성공을실전2장보스이식완료로보고하지않는다.

마감은정확한자기파일만add·정상pre-commit·자기branch만push·원격SHA대조·외부DONE작성후자기worktree제거순서다. R HEAD/branch/tracked INDEX/WORK와공용·선행파일의byte,새모듈/테스트의실행사본동일성을검증한다.
