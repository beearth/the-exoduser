# BC-INTEG-01 — 보스 생성 색·BC08 장 catalog 통합

## 1. 기준·소유권

- 맥북총괄의 PC 통합 요청 두 건만 구현한다. 기준은 fetch한 `origin/main` **249c26fad989071a94c19128e524ce0bbcb2c8c9**이며, 최소 기준 `b25a018ac`가 조상임을 확인했다.
- 브랜치 `codex/bc-integ-01-20261020`. `worktree add --no-checkout` → 필요한 `/godot/ /docs/ /tools/ /.githooks/`·원본/설정 경로 sparse-checkout → 새 worktree index를 `read-tree -mu HEAD`로 구성했다. 대용량 웹 에셋을 체크아웃하지 않았다.
- WORK_BOARD 보스 행을 먼저 대조했다. BC01~10·BC2-01~04·TRACE-BOSS-CH3는 인수/병합 이력, TRACE-BOSS-CH1의 남은 표시는 문서 소유라 제품 두 파일과 중복하지 않는다. 자기 BC-INTEG-01 행만 추가한다. 다른 진행 작업 소유 파일은 수정하지 않는다.
- **실제 tree와 작업판 문구를 구분한다.** 이 main에는 BC08 module/test와 BC04~09 일부 기존 test가 없다. BC08 module+UID는 사용자 인수 **1b901f124bc4d1f2eaf55cb615a216abce69c634**의 원본을 가져와 아래 최소 차이만 적용했다. 다른 누락 회귀는 인수 커밋의 원본 byte를 외부 격리 project로 읽었으며 저장소 복구/타 작업 병합은 하지 않았다.
- BC02~07 장 문맥은 main에 포함된 **a3b5391c54bb62b9f784bf2acac12bfbd2747192**의 `native_boss_catalog_context.gd`를 그대로 사용한다. 그 helper·CH2 catalog/bridge/reuse 변경은 **0줄**이다.

## 2. 원본 근거와 변경

최신 main `game.html` SHA256: `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 웹 원본을 수정하지 않았다.

| 항목 | 원문 행 | 전후·보존 계약 |
|---|---|---|
| 원소 enum·색 | G14333 /14338 | P0/F1/I2/D3/L4/H5/E6. ELC=`#bbbbbb,#ff5522,#3388ff,#9933cc,#ffee00,#ff88cc,#88aa44` 순서 그대로 |
| 보스 생성 색 | G31163 | `ib ? ELC[el] : …`. BC02 고정 회색을 `boss.element_id`로 색표 조회하도록 수정. 유효한 int0..6 이외는 collision/RNG 전에 NOT_READY |
| 실제 장 보스 원소 | G16633–16643 /16679–16687 /16698–16712 /30782 | 실제 STG.be를 catalog가 공급. 장 번호만으로 색을 정하지 않으며 원소가 바뀌면 원본 ELC 규칙이 적용됨 |
| CH1 si0..3 | G16680 /16707 | EL.P=0 → **#bbbbbb 유지**. 기존 생성 packet 반환값 전체도 수정 전과 byte 비교 |
| CH2 si4..9 | G16681 /16707 | EL.P=0 → **#bbbbbb 유지**. 실제 CH2 bridge 사용; CH2가 파란색이라는 추정 없음 |
| CH3 si10..13 | G16682 /16707 | EL.I=2 → **#3388ff로 정정**. CH3 trace의 `a3b5391c BC02:110` 불일치 해소 |
| 후속 장 색 규칙 | G16683–16686 /16707 | CH4 F→#ff5522, CH5~7 D→#9933cc. 테스트 reader로 원본35개 stage를 대조하며 새 장 production catalog 구현을 의미하지 않음 |
| BC08 begin | BC08 인수본17–25 | 끝에 `chapter_catalog: Variant = null` 인자 추가. 기존 helper.resolve + boss_for_stage로 stage 검증, explicit provider만 continuation에 bind |
| BC08 next | BC08 인수본30–35 /77–80 | helper.from_token으로 같은 장 문맥을 읽고 실제 si 검증. idle phase 데이터도 해당 catalog에서 조회. default 실패 reason·version·key 삽입 순서 유지 |
| 드루이드 구분 | G16938 /40665 /40669 /40692 /40944 /40950 /40956 | 실제 si0/3 조건 유지. 장별 0..3 alias·modulo·si 보정 없음. CH2/3는 wind 마지막18f 추적을 계속하고 드루이드 녹색 trail/추가 RNG를 얻지 않음 |
| stage 산술 | G40700 | `shockMax=800+si*50` 그대로. CH2/3의 실제 si 사용 |
| 공용 경계 | G38315–38355 /40483–40517 /40664–40708 /40942–40977 | cached distance, XY→X→Y fallback, 원본 RNG 순서·protected owner readback, st2 소유권·호출 경계 그대로. 피해·패링·실등록 집행 없음 |

API 사용 예시: `Movement.begin_tick(si, checkpoint, enemy, sp, player, context, chapter_catalog)`. 생략/null은 CH1 그대로이며, CH2는 기존 `native_ch2_boss_catalog_bridge.gd`를 전달한다. CH3 production catalog는 이번 구현 범위 밖이다. 장 문맥이 들어간 continuation은 provider/path/source-hash를 포함하고, 누락·위조·다른 장 si를 NOT_READY로 거부한다. 기본 CH1 token에는 새 key가 붙지 않는다.

## 3. 검증 방법

- 기존 BC01~10·CH2 4종 파일의 기대값·검사·실행 본문을 수정하지 않는다. main에 있는 파일은 main byte, 누락 파일은 인수 커밋 byte를 사용한다. 경로/ref/SHA256은 원로그 `regression-manifest.json`에 전부 기록한다.
- 신규 `test_boss_bc_integ_01.gd`와 `bc_integ_01_source_oracle.cjs`는 원본 JS 조각을 별도 Node VM에서 실행한다. 제품 GDScript로 expected를 만들지 않는다. 이동 **3,617사례**, 원본 event **19,191**, RNG **1,880**, protected contact **요청432건**, spawn **35stage**를 대조한다.
- 숫자는 UTF-8 JSON에 binary64 little-endian hex로 전송하여 JSON의 근접 정수 반올림을 피한다. 원본에서 추출한 정수 경로는 정확 비교, 비정수 산술 비교는 기존 BC08 oracle의 `1e-12` 상대 허용오차를 유지한다. 수정 전후 CH1 byte 비교는 허용오차가 없다.
- CH1의 begin·매 next 반환값(continuation 포함)을 **`var_to_bytes` 완전 동일**로 검사하고 RNG cursor도 대조한다. baseline BC08은 인수본 SHA256 `c8e73bbc31c4f55c1952dbd4057c40eabd98b70057272fc5a7784fc96a4abc2f`, BC02는 작업 기준 main SHA256 `e7159c70ba57b9b6a700bd89a32cc616d02c2676eb1780a83068c4d57a17d734`를 필수 검사한다.
- CH1/2 spawn 반환값 전체 동일, CH3~7은 원본 `col` 한 값만 바꾼 baseline과 전체 byte 동일을 검사한다. CH2는 실제 채택 bridge를 사용한다. CH3/후속 장 reader는 **테스트 전용 fixture**이며 원본 STG.be와 독립 대조한다. 새 production catalog로 포장하지 않는다.
- 색 경계: int -1/7·float2.0·원소 누락은 NOT_READY, RNG/collision 소비0. 장 경계: CH2 si4..9, CH3 fixture si10..13, 앞/뒤/음수/35; default CH1 경계의 성공·실패 byte까지 검사한다. continuation key 누락·path/hash 위조·명시 null·타 장 si와 비catalog 인자를 거부한다.
- 모든 Godot 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`; 2이상은 30초씩 대기하고 재측정한다. 다른 작업의 프로세스를 종료하지 않는다. 매 실행 gate/argv/cwd/exit/stdout/stderr/engine log를 별도 보존한다.
- 신규 userdir는 **EXODUSER-bc-integ-01-Isolated-20261020**, 기존 회귀는 각 파일의 USERDIR 상수 그대로이다. Node는 `--node-bin` 필수 인자, payload는 UTF-8 임시 파일, OS.execute 콘솔 진단은 join한다. BC02/03은 `--source-game`을 전달한다.
- baseline 추출 및 명령은 원로그 `setup.py`, `plan.json`, `run_one.py`, `run_suite.py`로 재현한다. 새 테스트에는 `--source-game=<main game.html> --node-bin=<실행파일> --baseline-bc08=<인수본.gd> --baseline-bc02=<기준main.gd>`를 전달해야 한다. 두 baseline 파일은 테스트 프로젝트와 동일한 `res://scripts` 의존성을 읽도록 준비한다.

## 4. 실행 결과

| 실행 | 단정/통과 그룹 | 실패 |
|---|---:|---:|
| 신규 최종 new-02 | 73394 | 0 |
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
| bc2_01_catalog-regression-01 | 7169 | 0 |
| bc2_02_reuse-regression-01 | 44891 | 0 |
| bc2_03_new_start-regression-01 | 25749 | 0 |
| bc2_04_vortex-regression-01 | 41373 | 0 |
| contracts-regression-01 | 5 | 0 |
| BC01~10 합계 | 354093 | 0 |
| CH2 4종 합계 | 119182 | 0 |
| cold import | exit0·ERROR0 | 0 |

모든 기존 회귀와 신규 최종 실행은 exit0·실패0·skip0·stdout/stderr/engine ERROR0이다. `new-01`은 장 경계 추가 전 73,385/0, 최종 `new-02`는 위 수치이며 이전 실행 로그도 보존한다. 신규 오라클 개발 중 원문 normal-druid anchor 행을 잘못 지정한 assert 실패와 ETYPE_ERES 누락 ReferenceError는 `oracle-development-notes.txt`에 원인·수정 근거를 남겼다. 기대값을 제품에 맞추거나 검사를 삭제하지 않았다.

격리 project의 기존 test14개·제품 module 입력 SHA256은 `run-inputs.json`, 기존 test의 main/인수 ref와 hash는 `regression-manifest.json`이다. 테스트 실제 입력이 마지막 제품/테스트 byte와 같은지 최종 확인한다. 정상 hook·push·원격 ref·R 보호 최종값은 `verification.json`과 `DONE.txt`가 기록한다.


## 5. 변경 경계·인계

- 제품 변경: BC02 생성 색/잘못된 원소 거부, BC08 장 문맥 인자화만. BC08의 피해·패링 요청 내용은 바꾸지 않는다.
- `Main/world/player/hud/native_normal_enemy_hurte/native_source_new_run_state`·State·저장·Q/E·2_3·웹 원본·설계/LOCK 변경 **0줄**. 공용 catalog helper·CH2 구현·기존 회귀 변경 **0줄**. WORK_BOARD는 자기 행만, CHANGELOG_SYNC는 맨 위 자기 절만 추가한다.
- 브랜치의 새 BC08 파일은 main에서 새 파일로 보이므로 전체 추가 줄수와 인수본 대비 작은 실수정 diff를 구분한다. `bc08-accepted-diff.patch`를 원로그에 보존한다.
- Godot packet 검증은 실보스 전투·화면 품질·PC 실행을 증명하지 않는다. 실제 CH3 production catalog 인수·Main 연결·탄 등록·damage/parry owner 연결은 후속 작업이며 이번 **미확인**이다.
- 기존 로비 전체 회귀 8실패(QA-005), 맵 선재 결함 등은 이번 범위 밖이며 그 회귀를 실행/통과했다고 주장하지 않는다.
- cold import가 자기 sparse worktree에 생성한 미추적 UID/import sidecar **228개**는 원로그 `import-generated/`와 경로/hash manifest에 옮겨 보존했다. 자기 UID2개만 제출한다. 전역 editor 설정 byte와 R index/HEAD/branch/tracked work 보존을 확인했다.
- 원로그: `~/exoduser-wt/_out/bc-integ-01/`. 정상 pre-commit 훅·자기 브랜치 push·원격 SHA 일치·DONE 작성 후 자기 worktree를 제거한다. R의 HEAD/branch/index/tracked work는 시작과 동일한지 최종 검사한다.
