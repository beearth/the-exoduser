# BC3-02 — 3장 catalog를 공통 보스 packet에 전달하는 독립 진입점

## 기준·의존·소유

| 항목 | 근거 |
|---|---|
| 작업 / 브랜치 | bc3-02 / codex/bc3-02-20261020 / sparse worktree ~/exoduser-wt/bc3-02 |
| fetch 기준 | origin/main **823c24baee3f6c5f058ebfd7776721e86f80bd18**. 요청 기준823c24bae 포함 확인 |
| catalog | main에 인수된 BC3-01r `native_ch3_boss_catalog.gd`; 별도 bridge를 만들지 않고 공개 manifest·stage·move·phase·combo API 그대로 사용 |
| 통합 의존 | **dcd32b491910c0a1485b4cde8b3ba6b1009aedfc**(BC-INTEG-01). BC02 원소색과 BC08 장 인자화에 명시 의존 |
| merge 기준점 | **62fdc5523cf0707cf150d1deaac93406b6f5b401** = 위 main + dcd32b49의 정상 merge. rebase/cherry-pick/reset 없음. CHANGELOG/WORK_BOARD 두 충돌은 양쪽 내용 모두 보존. 코드 충돌0 |
| WORK_BOARD | 보스 기존 행 확인. 진행 표시 TRACE-BOSS-CH1은 문서 소유이며 새 CH3 reuse 파일과 중복0. BC3-01r·BC2 인수 이력 참조. 자기 BC3-02 행만 추가·갱신 |
| 자기 제품 | 신규 `godot/scripts/native_ch3_boss_reuse.gd`만. 공통 BC02~08/Context·CH1/2/3 catalog·기존 CH2 진입점 수정0줄 |
| 자기 검증 / docs | 신규 `test_boss_ch3_bc3_02_reuse.gd`, `bc3_02_source_oracle.cjs`, 자기 UID2·이 보고서·CHANGELOG 맨 위 절·작업판 자기 행. 기존 회귀0줄 |
| 원본 | game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 최신 main과 동일. 원본·설계/LOCK·Q/E·2_3·실저장 변경0 |
| R | HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / codex/mac-live-play-time-main-20261017 / INDEX·tracked WORK 빈 상태 보존 |

## 구현 계약·원문 행

진입점의 모든 계산/producer API는 입력과 callback을 변경하지 않고 **공통 API 마지막 장 인자에 실제 CH3 Catalog Script를 전달**한다. 반환 packet·actor·queue를 사후 보정하지 않는다. 숫자·테이블·게임 수식·원소별 상태 구현을 복제하지 않는다.

| 진입점 | 위임 owner / game.html 근거 | 계약 |
|---|---|---|
| build_spawn_packet | BC02 /31119–31363·14338·16679–16712 | 실제 si10..13/hell2/EL.I2, 공통 owner의 ELC[el]→#3388ff, dropTier3. callback/read/RNG 순서 그대로 |
| evaluate_move | BC03 /37650–37699·9820–10011 | stage별 Set·phase·CD·원본 score/RNG gate. CH3 union 밖 id를 허용한 것으로 바꾸지 않음 |
| select_tick | BC04 /38373–38442 | 실제 59-slot 원본 ordinal·combo·roulette·추가 feint/delay. start request를 실행 완료로 바꾸지 않음 |
| phase_transition /clock_step | BC05 /38235–38313·38584–38592·38614–38635·38771–38772·38874–38884·40444–40454·41375–41383 | 기존 phase5·시계10 checkpoint. readback/중간 경계·RNG·caller st2 소유권 유지 |
| begin_phase_effects /phase_effect_step | BC05 /38271–38312 | 실제 stage와 CH3 provider로 continuation 생성. 효과·충돌·피해 등 요청은 실제 owner ack 필요 |
| begin_start /next_start | BC06 /37702–38233 | CH1 공통 owner가 갖는 CH3 공유 시작 **21종**만 재사용. 나머지16종은 pattern_start_owner_required. 등록37종≠시작37종 구현 |
| begin_tick /next_tick | BC07 /41074–41183 | slash/slam/sweep 계열 6상태 원문 producer. actual hurtP·boss_hurtE·Q/E/poise 집행0 |
| owns_continuation | 기존 CatalogContext.from_token + 정확 Script identity/si int10..13 | 버전/본문을 모르는 미래 packet도 **소유 문맥만** 검사 가능. null/다른 Script/위조 path·hash/누락/다른 장 si 거부. 실제 step은 기존 owner의 별도 protocol 검사를 그대로 수행 |
| 미래 BC08 확인 | dcd32b49 BC08 /16938·40665 | 실제 BC08.begin_tick(...,CH3 Catalog)로 생성한 token을 소유 inspector가 인식. si10..13은 드루이드0/3 마지막18f 고정으로 위장되지 않음. 이번에 별도 CH3 movement 진입점/실연결 추가0 |

`source_receipt()`는 기존 catalog receipt에 미연결 표시·의존 SHA·공유 시작21/다른 시작16(CH2 owner9+CH3 신규7)·공유 근접3계열을 추가하는 읽기 metadata다. 공통식이나 37move literal 재전사0이다. BC3-03 및 다른 시작 owner를 이 모듈 안에 복제/자동 연결하지 않는다.

## 독립 원문 fixture와 경계 검사

- 기존 `bc2_02_source_oracle.cjs`의 **고정 SHA를 검사한 불변 테스트 scaffold**를 읽어 재사용한다. helper 파일 자체를 변경하지 않는다. 실제 게임 함수/statement는 이번 game.html 원문에서 그대로 발췌하고 VM으로 실행한다. GDScript 제품을 expected 생성에 사용하지 않는다.
- 새 fixture의 호출 입력은 actual si10..13이며 생성기/근접 actor는 EL.I2이다. CH2 scaffold의 `si<4 → +4` 입력 보정은 신규 oracle에서 제거했다. 원문 STG/HELL_THEMES/SI_TO_HELL을 평가해 spawn의 원소·색·hell을 얻는다. packet의 색/si를 나중에 고쳐서 expected로 쓰지 않는다.
- 숫자는 safe integer의 십진 문자열 또는 noninteger binary64 hex로 UTF-8 전송해 Godot JSON의 근접 정수 반올림을 피한다. 기존 공통 oracle와 동일한 비정수 상대오차1e-12·구조/값 비교를 유지하고, 핵심 이산 spawn 값은 정확 비교한다. 별도로 직접 공통 API+명시 CH3 Catalog 호출과 진입점 결과를 **Variant type·key order·float bit·Script identity까지 정확** 대조하여 전달/사후 보정 오류를 검출한다.

| 원문 fixture | 사례 | 범위 |
|---|---:|---|
| BC02 | 32 | 4stage×6 level + safe/blocked 각4. 원래81필드·6draw·위치 read 순서·원소/색/dropTier. blocked는 REJECTED·RNG0 |
| BC03 | 284 | 실제4stage×59 등록 move의 phase/gate, charge/laser/poisonTrail의 전5phase. stage 밖/phase 밖 gate도 원문 그대로 |
| BC04 | 24 | 4stage×phase0/4×gate/roulette/기존 combo 시작. 원본 actor/player_stats/start 요청/RNG ledger 전체 |
| BC05 | 196 | 4stage phase 경계/정상 scalar·clock10 checkpoint 각3입력. 원래 source write_keys/commands/continuation/RNG 유지. 11 method와 stage 전부 존재를 oracle 자체가 assert |
| BC06 | 168 | 공통21 id×4stage의 정상/tele0 fallback. actor/queue·텍스트 해석·전체 event·중첩 owner fixture RNG 순서. 새/타 owner16종을 READY로 만들지 않음 |
| BC07 | 72 | 4stage×근접6state×시작/중간/끝 표본. actor/player/readback·global·전체 event·cursor. 실제 피해/패링 성공 증거가 아님 |
| 합계 | 776 | source-only expected. helper가 고정한 원문 SHA·등록 선언·각 함수 발췌 범위를 사용 |

추가 경계: 모든 진입점에 si−1/0/3/4/9/14/34/35를 전달해 reader/RNG0 거부, CH3 밖6id 거부, 나머지16 시작 owner 거부. 각 stage의 실제 phase-effects token·미래 BC08 token과 버전99의 미지 protocol token을 검사한다. 정확 provider와 유효 binding이면 ownership만 인식하고, 미지 protocol을 실제 공통 step에 보내면 NOT_READY다. 같은 원본 manifest를 내는 다른 Script도 CH3 진입점 token으로 인수하지 않는다. float/string/bool si도 소유 문맥으로 받지 않는다. 잘못된 token은 기존3 continuation 소비 API 모두 NOT_READY·RNG0·입력 불변이며 ack/readback을 생략한 start/contact를 성공으로 세지 않는다.

## 실행·격리 결과

| 실제 실행 | 단정 / 통과 그룹 | 실패 |
|---|---:|---:|
| 신규 new-01 | 11478 | 0 |
| bc01-regression-01 | 681 | 0 |
| bc02-regression-01 | 5257 | 0 |
| bc03-regression-01 | 31976 | 0 |
| bc04-regression-01 | 21899 | 0 |
| bc05-regression-01 | 18424 | 0 |
| bc06-regression-01 | 14099 | 0 |
| bc07-regression-01 | 14531 | 0 |
| bc08-regression-01 | 24788 | 0 |
| bc09-regression-01 | 56664 | 0 |
| bc10-regression-01 | 165774 | 0 |
| bc_integ_01-regression-01 | 73394 | 0 |
| ch2_bc2_01_catalog-regression-01 | 7169 | 0 |
| ch2_bc2_02_reuse-regression-01 | 44891 | 0 |
| ch2_bc2_03_new_start-regression-01 | 25749 | 0 |
| ch2_bc2_04_vortex-regression-01 | 41373 | 0 |
| ch2_bc2_05_bean_rain-regression-01 | 35164 | 0 |
| ch3_bc3_01_catalog-regression-01 | 43491 | 0 |
| contracts-regression-01 | 5 | 0 |
| BC01~10 합계 | 354093 | 0 |
| CH2 5종 합계 | 154346 | 0 |
| cold import | exit0·ERROR0 | 0 |

모든 최종 실행은 exit0·실패0·skip0·stdout/stderr/engine ERROR0이다. 신규 source fixture776건과 독립 owner 요청을 검증했으며 실제 전투·피해·패링 성공으로 세지 않는다. 실행 사본17개의 byte는 main/인수 ref와 동일하다. 입력 hash·실행 결과·gate·최종 R/원격/정리 값은 원로그 검증 파일과 DONE.txt에 기록한다.


새 userdir는 `EXODUSER-bc3-02-Isolated-20261020`, 기존 테스트는 각 파일 USERDIR 상수 그대로다. Node는 `--node-bin` 필수 인자, 원본은 `--source-game`, OS.execute 출력은 join하며 payload는 새 UTF-8 임시 파일이다. 모든 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`, 2이상이면 30초 대기 후 재검사한다. 실제 argv/exit/gate/engine/stdout/stderr를 원로그에 보존한다. 기존 테스트는 main 파일 또는 인수 커밋의 원본 byte를 외부 격리 project에 복사하며 ref/hash는 regression-manifest.json에 기록한다.

Node 개발 최초 stage 원문 literal 인코딩 SyntaxError(exit1), 두 번째 산출 검토에서 시계 입력 누락을 발견한 경위와 수정은 oracle-development-notes.txt와 raw out/err에 남긴다. 기대값을 제품에 맞추거나 기존 검사를 삭제하지 않았다.

## 보호·제출

- 자체 구현 diff는 merge 기준점62fdc552 이후 신규 CH3 진입점·테스트/오라클·자기 docs/UID뿐이다. origin/main 대비 보이는 BC02/BC08 변경은 승인된 **dcd32b49 의존 merge**이며 이번 단위의 공통 수정으로 숨기지 않는다.
- 공용 Main/State/World/player/hud/일반 hurtE/new-run·저장·Q/E·2_3·기존 공통 보스 계산식·기존 catalog·기존 테스트 **0줄 변경**. 실제 scene/보스 actor/탄 등록/피해/패링/부활·맵 gate 연결0이다. 실제 전투·화면 품질·PC 실행은 미확인이다.
- cold import의 자기 미추적 UID/import sidecar228개는 원로그 import-generated/와 경로/hash manifest로 옮겨 보존했다. 자기 UID2개만 제출한다. 실행한 새 코드·테스트와 worktree 파일의 byte 동일, 보호대상25파일·기존 회귀17파일·R 및 전역 editor 설정 보존을 확인했다.
- 정상 pre-commit 훅·경로 지정 staging·자기 branch만 push·원격 SHA 대조 후 `~/exoduser-wt/_out/bc3-02/DONE.txt`를 작성하고 자기 worktree를 제거한다. R HEAD/branch/index/tracked WORK와 의존 branch 보존을 최종 확인한다.
- 원로그 `~/exoduser-wt/_out/bc3-02/`: start/dependency-merge.json·merge 로그·보호 hash·oracle 개발 기록·new-inputs/run-inputs·regression-manifest·실행 metadata/engine/raw 로그·최종 검증/remote/DONE. 저장소 밖 보고서 사본도 보존한다.
