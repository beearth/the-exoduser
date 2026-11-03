# CLAUDE.md — 지옥의 길 (EXODUSER)

## 0. 이 파일

- main과 unity/main의 CLAUDE.md는 바이트까지 같다. AGENTS.md는 이 파일을 가리키는 안내만 둔다. 고칠 때는 한쪽에서 고쳐 다른 쪽에 그대로 복사하고, 두 브랜치에 push한 뒤 `git diff --quiet origin/main origin/unity/main -- CLAUDE.md AGENTS.md`로 같은지 확인한다. 11-03 이전 규칙 원문은 `docs/_archive/rules-20261103/`에 있다.
- 규칙을 main에 반영할 때마다 사용자 메인 `G:/exoduser`도 `git -C G:/exoduser fetch origin` 뒤 `git -C G:/exoduser merge --ff-only origin/main`으로 맞춘다. 비강제 fast-forward만 하고 untracked는 그대로 둔다. ff가 안 되거나 충돌하면 멈추고 보고한다(11-03 예외 승인).
- **docs 정본은 origin/unity/main이다(11-03).** 이 파일의 docs 링크는 unity/main 경로다. main에서 링크가 열리지 않으면 `git show origin/unity/main:<경로>`로 읽는다.
- 우선순위: 최신 사용자 지시(대화·메모리 결정 기록) > [작업 매뉴얼 v4](docs/0마스터플랜/WORK_MANUAL_20261029.md)(품질·작업 순서) > [에이전트 운영 매뉴얼](docs/0마스터플랜/AGENT_OPERATIONS_MANUAL.md)(일하는 방식) > CLAUDE.md > 분야 SSOT·DESIGN LOCK. 충돌을 찾으면 위를 따르고 충돌을 보고한다. 작업 시작 때 이 파일과 메모리(MEMORY.md)를 둘 다 보고, 메모리에서 "(대체)"·"(폐기)"로 표시된 항목은 따르지 않는다.
- 두 매뉴얼이나 분야 문서에 11-03 결정(Unity만 개발, 11-05부터 Claude 구현, PC 컴파일·Mac 판정, 1-1 원근 LOCK, 생성 도구는 API 목록)과 다른 옛 문구가 남아 있으면 이 파일을 따르고, 그 문구를 고치거나 보고한다.

## 1. 현재 방향

- **출시 제품은 Unity판이다.** 새 개발(맵·캐릭터·보스·UI·연출·사운드)은 unity/main에서만 한다. 웹(main)은 Steam 라이브판 유지보수와 규칙 oracle로만 쓴다. 웹에 새 기능·디자인을 넣지 않고, "웹 먼저 → Unity 이식" 절차를 쓰지 않는다(11-03).
- **최상위 목표 = Unity 데모 v0**(10-30): ① Steam 키샷 ② 1-1 한 판(10~15분, 크래시 0) ③ 첫인상(타이틀·로비·캐릭터 선택·사운드) ④ 데모 패키지(설치형 빌드·영상·스크린샷). 배정은 이 중 무엇을 미는지로 판단하고, 표에 없는 일은 보류한다. 범위는 좁혀도 품질선은 낮추지 않는다.

### 브랜치

| 브랜치 | 역할 |
|---|---|
| `unity/main` | 유일한 개발 줄기. Unity 코드·에셋·docs 정본 |
| `main` | 웹(H5) Steam 라이브판 유지보수. 부록 W |
| `godot/main` | 동결(607110d52) |

- Unity 작업 브랜치(`claude/unity-*`, `codex/unity-*`)는 unity/main으로만 병합한다. main으로 병합하지 않는다. 커밋 전에 지금 브랜치가 그 일의 줄기인지 확인한다.
- unity/main 안의 웹 파일(game.html 등)은 대조용 사본이라 고치지 않는다. main에 `godot/`를 다시 넣지 않는다. 분리 이력: [REPO_SYNC_ENGINE_SPLIT](docs/0마스터플랜/REPO_SYNC_ENGINE_SPLIT_20261027.md).

### Unity 표현 방향

- **규칙의 정답은 Unity Core**(`unity/Assets/Exoduser/Runtime/Core`, 웹 oracle로 검증)다. 표현 작업에서 Core 수치·판정을 바꾸지 않는다.
- **2.5D(HD-2D):** 월드는 3D 지형·소품과 실제 조명·안개. 캐릭터·적·보스는 픽셀풍이다. 리깅한 3D를 실시간 저해상도로 렌더해 픽셀처럼 보이게 만든다(11-03). 화면의 발밑·탄 모양은 Core 판정과 맞아야 한다.
- **카메라 LOCK(11-03):** 1-1 원근 카메라(ForestA2 피치 34°, 먼 적은 작고 앞 고목은 크게)를 바꾸지 않는다. 먼 적이 보이는 생동감이 핵심이다. 안개·가림 투명화·비네트·어둠이 먼 적을 지우면 FAIL이다. 보스 아레나 줌은 피치를 두고 거리만 바꾼다.
- **맵:** 새 구도를 그리지 않는다. Unity 1-1 장면(남→북 다리·양쪽 늪·고목 전경) 위에 웹 1-1의 기존 소품·바닥·늪 원화를 웹 좌표 그대로 얹는다. 새 요소는 그 결과를 보여 준 뒤에 한다. 작업 순서는 v4 관문(G0~G5)이고, 판정 캡처에 먼 적이 보이는 장면을 넣는다. Unity 맵은 [UNITY_MAP_BOARD](docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md)에서 시작한다. `_MAP_SSOT_INDEX`는 웹·Godot 맵 이력 색인이며, 그 P-1(맵 가이드 v0.9)과 옛 CH1-1 생체 콘셉트는 Unity 1-1 작업의 필수 선행이 아니다.
- **보스:** 새로 설계한다. 리깅 3D를 실시간 픽셀 렌더하고, 동작은 No Rest for the Wicked 감각(무게 있는 예비동작, 끝까지 가는 공격, 큰 동작 뒤 빈틈)을 따른다. 데모 v0는 1-1 드루이드가 먼저다. 모델·리깅·Animator·템포·예고·VFX/SFX·등장/퇴장·실게임 검수까지가 범위이고, 버그 수정으로 범위를 줄이지 않는다.
- **UI:** 웹 정본 배치를 비교 기준으로 두고 Unity에서 직접 만든다. 웹을 먼저 고치는 절차는 없다.

### 핵심 위치

| 위치 | 용도 |
|---|---|
| `unity/Assets/Exoduser/Runtime/Core` (unity/main) | 게임 규칙 정답 |
| `unity/Assets/Exoduser/Runtime`, `Resources/Data` (unity/main) | Unity 표현·UI·표시 문자열 |
| `I:\EXODUSER-Storage\unity-latest\build` | 바탕화면 "지옥의 길 (Unity)" 실행본 |
| `I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1` | PC Unity 공용 실행기 |
| `game.html`·`index.html` (main) | 웹 규칙 oracle·Steam 라이브판(부록 W) |

## 2. 사람·모델·예산

- 총괄 = Claude Opus 5.5(`claude-opus-5-5`): 명세·판정·커밋. 다음 실행 기본 model도 `claude-opus-5-5`다. 설정값만으로 실제 응답 모델이 바뀌었다고 말하지 않는다.
- 구현: 11-04까지는 Codex 레인(codex exec). **11-05부터 Codex 새 배정 0, 총괄 세션의 Sonnet 5.5 서브에이전트가 구현한다**(11-03 사용자 결정). 브리프는 파일로 쓰고 금지사항(Core 수치·판정 수정, `git add -A`, 창·소리 띄우기, 공용 실행기 밖 Unity 실행)을 넣는다. 로그·캡처 목록 일괄 점검과 번역 일괄은 Haiku 5.5를 쓸 수 있다. 그 밖의 모델 하향은 사용자가 정한다.
- 상한: 레인 8개 이하, 동시 구현 3개 이하(11-05 Claude 구현 기준. 11-04까지 Codex 레인은 레인 상한만 적용). 하루 사용량이 80%를 넘으면 새 실행을 멈춘다.
- 예산: Claude 월 100만 원(구독 먼저, 넘치면 추가 사용량). 도구·연결·기간 예산은 [API연결_가이드](docs/API연결_가이드.md)를 따른다. 유료 생성은 승인 범위 안에서만 하고, 예약과 실제 차감을 `I:\EXODUSER-Storage\codex-takeover\SPEND_LOG.md`에 적는다.
- 보안: 키·토큰·개인 청구 내역·사용자 전역 메모리·인증·권한·호스트 설정은 Git에 넣지 않고 출력하지 않는다. 로그인·계정 생성·결제는 사용자가 직접 한다.
- 키·토큰은 Git 밖 파일(브리프·로그·스크립트·원장)에도 쓰지 않는다. 인증이 실패하면 기존 credential helper나 승인된 GitHub connector만 쓰고, 호스트·인증서 검증을 끄거나 새 자동화로 우회하지 않는다.
- **총괄 자율 결정:** 정해진 목표 안의 선택(다음 후보, A/B안, 배정)은 총괄이 정하고 결과만 보고한다. 배정은 위 상한과 월 예산 안에서 한다. 사용자에게는 다음만 묻는다: 목표·레퍼런스 밖 새 방향, 유료 지출, 배포·Set Live·외부 게시, 되돌리기 어려운 삭제·파괴적 변경(사용자 데이터·세이브 포함), 권한·승인 설정·외부 권한(OAuth 등) 변경. 이 규칙은 시스템 승인·보안 제한을 우회하거나 승인 설정을 완화해도 된다는 뜻이 아니다. 기존 배포·HOLD 승인 범위는 넓히지 않는다. 같은 질문을 반복하지 않는다. 결정 근거는 해당 SSOT에 남긴다.
- **보고:** 결과만 짧게, 한국어로, CTO 세션 한 곳으로 보낸다. 형식과 시점은 v4 §6을 따른다.

## 3. 작업 방식

### 3.1 프로젝트를 직접 수정한다 (11-03, 모든 에이전트·기계)

- 자기 worktree(브랜치)의 실제 파일을 직접 고친다. 되돌릴 기준은 git 커밋이다. 원본 보호를 이유로 프로젝트 복사본을 만들지 않는다.
- 타인 WIP 불간섭·보존은 다른 세션이 쓰는 파일과 checkout에만 해당한다. 자기 worktree는 자유롭게 고친다.
- 한 세션은 한 브랜치·worktree에서 한 묶음의 변경을 한다. 긴 작업은 `git worktree add --no-checkout`과 sparse checkout으로 필요한 경로만 받고, 끝나면 push와 원격 일치를 확인한 뒤 자기 worktree를 지운다.
- 빌드는 고정 폴더에 덮어쓴다. `before-*`·`*-pre*`·`formal-N`·`candidateN-build`·`rN/build`처럼 시도마다 새 폴더를 쌓지 않는다. 확인이 끝난 빌드·캡처는 남기지 않고 보고서에 커밋 SHA만 적는다.
- 예외: 사용자가 여는 실행본(바탕화면 실행본 `I:\EXODUSER-Storage\unity-latest\build`, 후보 바로가기 대상 빌드)과 배포 패키지(DEMO/EA/Steam 업로드본)는 지우지 않는다. 후보 빌드는 레인 고정 폴더에 덮어쓰기만 한다. junction(`G:/exoduser-DEMO`·`G:/exoduser-ea` 등)은 이동·삭제 도구로 다루지 않는다.
- 지킬 변경은 커밋·push로 지킨다. 작업을 끝낼 때 미커밋 수정을 남기지 않고, 하루 한 번 이상 자기 브랜치에 push한다.
- 검증은 빌드 1회·스크린샷·핵심 로그로 한다. 빌드마다 바이트 manifest·해시 목록을 만들지 않는다(배포 직전·사용자 요청 때만). push 뒤 원격 SHA 대조와 실행본 SHA 확인은 이 제한에 들지 않는다(항상 한다). 작업 하나가 20GB를 넘으면 정리부터 한다.

### 3.2 저장 위치·디스크

- C:에는 큰 산출물을 두지 않는다. Unity 작업본·Library·DOTNET_CLI_HOME·UPM 캐시는 NTFS에 둔다: `G:/exoduser-wt/claude-<역할>` 우선, 상태·여유를 확인한 E: 차선. I:(exFAT)에는 Unity 작업본·캐시를 두지 않는다.
- 웹·docs 작업본은 `I:/exoduser-wt/claude-<역할>`. 빌드·캡처·로그·다운로드·모델·임시 프로필은 `I:\EXODUSER-Storage\` 아래에 둔다. 상세: [빌드·백업 정책](docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md).
- Unity 작업본은 `unity`·필요한 `docs`·검수 도구만 sparse checkout한다. 웹 영상·음원·전체 에셋을 복제하지 않는다.
- 사용자 메인 `G:/exoduser`는 readonly다. 예외는 0절의 규칙 반영 fast-forward뿐이다.
- safe.directory 예외는 확인한 정확한 경로에 명령 범위(`git -c safe.directory=<경로>`)로만 쓴다. 전역·`*` 신뢰를 추가하지 않는다.
- 임의 이동·삭제·전체 복제·중복 복사·작업 중 sparse 축소를 하지 않는다. 이동·삭제 전에 junction을 확인하고, junction을 따라가는 `robocopy /MOVE`·`git worktree remove --force`를 쓰지 않는다.
- 정리할 때 폴더 이름(output·build 등)만 보고 지우지 않는다. 게임이 참조하는 실행 자산과 추적 파일은 지우거나 ignore하지 않는다. 승인된 이동은 복사 → 전 파일 해시 대조 → 연결 확인을 마친 뒤에만 원본을 정리한다(상세: [STORAGE_POLICY](docs/engine/STORAGE_POLICY_20261023.md)).
- 백그라운드에서 stdin을 기다리는 명령(`python -` 등)을 쓰지 않고 스크립트는 파일로 넘긴다(10-27 Temp 162GB 사고). Playwright·브라우저 임시 프로필은 쓰고 나면 지운다.
- Node는 전체 경로 `C:\nvm4w\nodejs\node.exe`로 실행한다.

### 3.3 무창·무음

- 자동 실행·캡처(브라우저·Unity 에디터·Player·nw.js)는 창 0, 소리 0이다. 브라우저는 headless와 `--mute-audio`로 띄운다. 내장 브라우저로 게임을 열어야 하면 열자마자 음소거하고, 끝나면 탭을 닫는다.
- Unity는 공용 실행기로만 실행한다(PC: `I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1`, 무창·무음·세이브 격리). Unity.exe·EXODUSER-Unity.exe를 직접 실행하지 않고, `-popupwindow`·전체화면·보조 모니터 창을 쓰지 않는다.
- 결과 이미지·영상·폴더를 사용자 화면에 자동으로 열지 않는다. 경로만 보고한다.
- 사용자 프로그램(Dota 등)은 종료하지 않는다. 켜져 있어도 작업을 멈추지 않고, 메모리가 모자라면 낮은 설정이나 순차 실행으로 한다. 창을 숨기려고 실행 중인 Codex·Git·사용자 터미널을 강제 종료하지 않는다.

### 3.4 PC·Mac 역할과 동기화

- 기준은 Unity = origin/unity/main, 웹 = origin/main이다. 시작할 때 fetch하고 HEAD·브랜치·tracked 변경·untracked를 따로 확인한다.
- **PC는 컴파일까지 한다. Unity 빌드·실게임 테스트·판정은 Mac에서 한다.** PC 예외는 사용자가 PC에서 직접 여는 빌드뿐이다: ① 예약 작업 `EXODUSER-Unity-BuildLoop`(30분)의 바탕화면 실행본 교체, ② 루프가 멈춘 동안 CTO가 정한 1회 수동 교체(정확한 unity/main SHA, 공용 실행기, 스모크 통과 뒤 `build-commit.json` 기록), ③ CTO가 승인한 후보 바로가기 빌드(레인 고정 폴더 하나에 덮어쓰기). 판정은 그래도 Mac에서 한다. 레인마다 시도용 빌드를 PC에서 만들지 않는다(Mac→PC 빌드 전송 경로가 정해지면 ③은 그쪽으로 옮긴다).
- 커밋 동일, 디스크 동일, 열린 실행본 최신은 각각 따로 확인한다. 확인하지 못한 환경은 "미확인"으로 적는다.
- 사용자가 여는 실행본은 예약 작업이 자동으로 갱신한다(웹 3333 = `EXODUSER_LatestWeb3333`, 바탕화면 Unity = `EXODUSER-Unity-BuildLoop`). 평소에는 손으로 갱신하지 않는다. 예약 작업이 멈추면 그날의 첫 결함으로 고치고, 고칠 때까지는 위 ②로 교체한다.

### 3.5 Git·커밋·배포

- 새 파일은 `git add -- <경로>`로 올린 뒤, 자기 경로만 `git commit -- <경로…>`로 커밋한다. 인덱스에 남은 타 세션 파일이 섞이지 않게 하기 위해서다(09-30 78파일 번들 사고). `git add -A`는 금지다. 코드, 관련 docs, `docs/CHANGELOG_SYNC.md` 절을 같은 커밋에 넣는다. 공용 checkout에서는 커밋 전에 `git diff -- <경로>`로 그 파일의 변경이 모두 자기 것인지 확인한다. 남의 수정이 섞여 있으면 커밋하지 않고 담당자와 조율한다.
- push는 비강제로만 한다. push 전 expected SHA, push 뒤 원격 SHA를 대조한다. 로컬 커밋만으로 원격 백업이 끝났다고 하지 않는다.
- **history rewrite 금지:** 이미 push된 커밋이 잘못 묶여도 reset·rebase·force-push로 재작성하지 않는다. provenance note(해당 docs)로 사실만 기록한다. force·`--force-with-lease`·stash·복구 지점 없는 reset·checkout도 쓰지 않는다. 대규모 수정 전 복구 지점은 백업 파일이 아니라 커밋·push로 만든다.
- git gc·repack·prune·maintenance·`worktree prune`를 쓰지 않는다(10-27 팩 손상, `gc.auto=0` 유지).
- 타인 WIP·staged 파일은 읽기·쓰기·stage하지 않는다. 승인된 인계분만 원작성자를 구분해 통합한다.
- 설정 파일(`.claude/settings*.json` 등)은 바꿀 키만 고치고 다른 키는 그대로 둔다. 설정 전체를 복사해 덮어쓰거나 권한 deny를 완화하지 않는다.
- 자동 커밋·정리 장치: SessionEnd 훅·`ExoduserAutoCleanup50`(미등록)·`EXODUSER_AutoGit`(Disabled)은 다시 만들거나 켜지 않는다. `EXODUSER_AUTOLOOP`는 등록·Ready 상태이며 `autoloop/LOCK.gamehtml`이 있어서 건너뛴다. 이 LOCK을 지우지 않는다(11-03 조회).
- 그 밖의 예약 작업·훅·자동 정리·자동 커밋 장치도 사용자 확인 없이 새로 만들거나 바꾸지 않는다. 기존 예약 작업(`EXODUSER-Unity-BuildLoop`·`EXODUSER_LatestWeb3333`)은 스크립트 결함만 고친다. 세이브·비용·소유 보호를 완화하지 않는다.
- 사용자 창·서버·실행본을 자동 재시작하지 않는다. 사용자 세이브는 읽기만 한다. 실행본의 SHA를 확인한 뒤에만 반영됐다고 보고한다.
- 강제 push·전체 초기화·백업 삭제·검수 없는 배포는 금지다. 웹 Steam과 Unity `unity-beta` 모두 업로드·Set Live·기본 브랜치 전환·패치노트 게시는 사용자 확인 뒤에 한다.
- 권한 거부를 다른 실행 경로로 우회하지 않는다. 실행하지 못한 확인·커밋·테스트를 성공으로 보고하지 않는다. 셸이 시작되지 않을 때는 [터미널 장애 대체 절차](docs/0마스터플랜/TERMINAL_FAILURE_FALLBACK.md)를 따른다.

## 4. 품질

### 4.1 결과물 품질·재작업

- **"동작한다"는 완료가 아니다. 게임에 어울리는 퀄리티까지가 완료다.** 모든 작업물(UI·HUD·텍스트·VFX·에셋·문서)에 기본으로 적용한다.
- 기획부터 최상 품질로 한다(10-30). 착수 전에 v4 G0 브리프(목표 장면, 직접 연 레퍼런스, 공통 관례, 가장 큰 차이, 제작법, 첫 실물 판정 시점, 합격·중단 조건)를 채운다.
- 실제 게임 시점에서 구도·실루엣·재질·조명·접지·가독성·동작을 직접 검수한다. 컴파일·테스트 PASS는 필요조건일 뿐이다.
- RETOUCH는 PASS가 아니다. 결함·담당·다음 산출물을 적고 계속 고친다. 병합과 디자인 완성은 별개다. 증거가 없으면 미검증이다. 같은 방법으로 만든 두 후보가 같은 핵심 결함으로 연속 FAIL이면 제작 단계와 방법을 바꾼다.
- 합격선은 [AAA 기준](docs/0마스터플랜/AAA_QUALITY_STANDARD_20260927.md) "합격선", 통과 표는 [품질 기준](docs/0마스터플랜/WORK_QUALITY_STANDARD_20261029.md)을 따른다.
- 여러 레퍼런스(노레위·디아블로4·PoE2·BG3 등)의 공통점이 정답이다. 한 게임만 따라 하지 않는다. 공통 관례(가림 투명화 등)는 사용자가 짚기 전에 넣는다. 레퍼런스의 에셋·코드는 반입하지 않는다.

### 4.2 화면 작업 기준

1. **디자인 언어:** 최상위 톤은 [실버 헬](docs/3.1%20ui%20hud%20디자인/DESIGN_CONCEPT_SILVER_HELL_20261028.md)(10-28, 금·황동에서 은빛 강철로)이다. 그다음 `UI_FOUNDATION_20260924.md`·`UI_COMPOSITION_20260925.md`를 읽고, 같은 Unity 화면의 기존 요소를 기준으로 삼는다. 메뉴 화면은 "큰 메인 이미지에 깔끔한 UI"다.
2. **폰트(엔진 공통):** 본문은 Hahmlet(사용자 선택 300)·나눔명조 계열, 제목·숫자·영문은 Cinzel이다. 산세리프 단독이나 시스템 폰트로 게임 UI를 만들지 않는다. 웹 CSS 토큰은 부록 W.
3. **색·아이콘:** 색 수치는 실버 헬 토큰을 따른다. 원색 초록·노랑 텍스트, 기본 알림 스타일을 쓰지 않는다. 이모지를 게임 UI 아이콘 대신 쓰지 않는다.
4. **검수는 눈으로:** 1920×1080과 3840×1080(16:9·21:9·32:9 모두 성립), 1x·3x 크롭, 10초 무음 영상, 레퍼런스와 같은 크기로 나란히 놓은 비교판으로 판정한다. 기준은 "기존 화면 옆에 놓아도 같은 게임인가"다. 검은 판·블러 채움은 금지다.
5. **완료 보고:** 기능 동작, 톤 일치, 1x 가독성, 사용자 실행본 갱신 SHA 확인까지 해야 "완료"라고 쓴다. 디자인을 못 봤으면 "기능만 완료, 디자인 미검수", 병합만 됐으면 "병합만 됨, 빌드 미확인"이라고 쓴다.
6. **캐릭터 통일:** 같은 캐릭터는 이미지·3D 모델·픽셀 렌더 모두 DESIGN LOCK 대조표(얼굴 문양·장신구·갑옷·머리)와 같아야 한다. 제작 순서는 LOCK 시트 → 리깅 3D → 실시간 픽셀 렌더다. 생성 전에 LOCK 문서(색인: [ART_TEAM_MASTER](docs/17게임아트팀/ART_TEAM_MASTER.md))를 읽고 고정 사양을 프롬프트에 넣는다. PixelLab으로 캐릭터를 새로 만들지 않는다.
7. **점 금지:** 그림·영상·합성 어디에도 잔점·점묘·디더링·그레인·업스케일 잡티를 남기지 않는다. 3x 크롭에서 점 0개일 때만 쓴다. 보정에 그레인·노이즈를 더하지 않는다. 레퍼런스는 블러로 구도만 전달한다.
8. **생성 도구:** 도구와 예산은 [API연결_가이드](docs/API연결_가이드.md)를 따른다(11-01: 이미지는 작업에 맞게 고르고, 영상 Kling, 3D Meshy·Tripo). 유료 생성은 승인 범위 안에서만 하고 SPEND_LOG에 적는다. 프롬프트와 비용표를 먼저 쓰고, 두 번 반려된 방법은 반복하지 않는다.

## 5. docs 동기화

- docs는 게임과 완전히 동기화된 진실 공급원이다. 수치가 1이라도 다르면 바로 고친다. PC에는 docs-sync-check 훅이 연결돼 있지 않으므로 훅에 맡기지 말고 직접 확인한다.
- 정본 브랜치는 unity/main이다. Unity 코드와 docs를 같은 커밋에 넣는다. main에는 웹 유지보수 docs와 위치 안내만 둔다. 웹 유지보수 변경이 게임 규칙이나 공통 문서에 닿으면 unity/main docs에도 같은 날 반영한다.
- 대조 기준은 Unity Core다. 웹(game.html) 값은 oracle 대조용이고, Core와 다르면 그 차이를 docs에 적는다.
- 절차:
  1. 코드를 바꾸면 docs 전체를 관련 키워드로 검색한다. 예외는 없다.
  2. 맞는 문서의 수치·공식·이름·상수·구현 상태를 코드와 100% 일치시킨다. 이름 변경, 배율·쿨다운·사거리·확률·프레임 수 같은 모든 숫자, 시스템·스킬·아이템·몬스터의 추가·삭제가 대상이다. 항목은 표로 정리한다.
  3. docs에 없는 정보를 찾으면 바로 추가한다.
  4. 설계 의도·근거와 남은 일을 해당 docs 폴더에 짧게 적는다. 커밋은 3.5를 따른다.

## 6. 작업별 필수 문서

착수 전에 읽고, 끝나면 갱신한다. 경로는 `docs/` 아래다. G1 설계물은 v4 §2 관문 G1에서 먼저 만들 것이다.

| 작업 | 착수 전에 읽기 | 끝나고 갱신 | v4 G1 설계물 |
|---|---|---|---|
| 스킬 | `2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` | 같은 문서 + `14밸런스+수치테이블/스킬별_DPS_자원소비표.md` | — |
| 합체 | 같은 문서의 "합체 추가 시 수정 체크리스트"·"성급 규칙" | 합체 목록·성급·흡수·등록 표 | — |
| 추천빌드 | `2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md` | 단계별 대조표 | — |
| 밸런스·수치 | `14밸런스+수치테이블/` | 해당 표 | — |
| 몬스터 | `8.0몬스터디자인/` | 몬스터 표 | 동작 목록·출처 |
| 보스 | `engine/UNITY_BOSS_BATTLE_BOARD_20261026.md` + `8.1보스디자인바이블/` | 같은 문서(무브셋·HP·판정) | 동작 출처·타이밍 표 |
| 영웅 캐릭터 | `engine/UNITY_CHARACTER_BOARD_20261027.md` + 해당 DESIGN LOCK | 같은 문서 | LOCK 시트·실루엣·동작 목록 |
| 맵·레벨 | `4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md`(웹 이력은 `_MAP_SSOT_INDEX.md`) | 같은 문서(구역·오브젝트) | 위에서 본 배치도 |
| 아이템·어픽스 | `7아이템디자인/` | 어픽스 표·슬롯 | — |
| UI·HUD | `3.1 ui hud 디자인/`(실버 헬 먼저) | 같은 문서 | 웹 정본 화면과 Unity 배치안 |
| VFX | `5.1임펙트디자인/` | 같은 문서 | 예고→접점→본체→잔여 타이밍 표 |
| 사운드 | `6사운드디자인/` | 같은 문서 | 장면 목록 |
| 무기·활·속성 | `2_2 무기+활+속성시스템/` | 같은 문서 | — |
| 돌진·패링·방패 | `2_3 돌진+패링+방패시스템/` | 사실 표기만(상단에 "표기만 갱신, 설계 무변경") | — |
| 인벤토리·장비 | `2_7 인벤토리+장비시스템/` | 같은 문서 | — |
| 세이브·데이터 | `15 세이브+데이터구조/` | 직렬화·마이그레이션 | — |
| 이미지·3D 생성 | `17게임아트팀/ART_TEAM_MASTER.md` + 해당 DESIGN LOCK | 현황표·로그·백로그 | LOCK 대조표 |
| 번역 | `16번역·로컬라이제이션/번역_가이드.md` | `번역대상_전체목록.md` | — |

## 7. 설계 금지 (사용자 확정)

- 어택 티켓(동시공격 제한)을 구현하지 않는다. 이 게임은 핵앤슬래시다.
- 무지개탄(blackBean)은 Q(sBlock·해제·peaceShield)로만 패링한다. E(sBash)로는 패링할 수 없다. `parryClass='magic'`이고, Q 성공 시 블루콩 유도반사로 바뀐다(09-04).
- 위 두 규칙은 Unity Core 구현에도 그대로 적용한다.
- `docs/2_3 돌진+패링+방패시스템/`은 설계(판정·수치·공식)를 고치지 않는다. 키바인딩처럼 코드 쪽 사실이 바뀐 표기는 갱신하고, 문서 상단에 날짜와 "표기만 갱신, 설계 무변경"을 적는다.

## 8. 번역

- 표시 텍스트를 하나라도 추가하면(웹·Unity 공통) `docs/16번역·로컬라이제이션/번역대상_전체목록.md`에 No. 번호로 등록한다. 착수 여부는 묻지 않고 바로 처리한다.
- 순서: 전수조사 → 목록 완성(목록이 없거나 불완전하면 시작하지 않음) → 번호 순서대로 하나씩 → 전체 대조 검수 → 전파 → 목록·번역_가이드 상태 갱신. CRLF 파일(번역대상_전체목록.md 등)은 줄바꿈을 보존한다.
- 언어는 29개(ko·en + 27개)다. 웹은 `_EN`과 `lang_*.js` 27개 전부에 같은 키를 넣는다. Unity는 지금 `unity/Assets/Exoduser/Resources/Data/*.json`에 29개 언어를 함께 넣는다. 통합 표 위치가 정해지면 번역_가이드에 적는다.

## 9. 버그·문제 해결

- 해당 시스템 docs를 1차 레퍼런스로 읽고 설계 의도·공식·제약을 파악한 뒤 고친다. docs에 없는 정보는 코드를 조사해 docs에 추가한다.
- 순서: 재현 → 원인 확정 → 수정 → 영향받는 테스트 1회 → 화면 확인 → docs 동기화.
- 실패한 테스트를 수정 없이 다시 돌리지 않는다. 원인을 고친 뒤 1회만 돌리고, 두 번 실패하면 멈추고 보고한다. 서브에이전트 지시문에도 이 줄을 넣는다.

## 10. Steam

- AppID 4749590, Windows Depot 4749591. 기본 브랜치는 아직 웹 라이브판이다. 웹 패치는 유지보수 수정이 있을 때만 하고, 매일 PATCH+1 하지 않는다. 일일 예약 작업 `EXODUSER_DailySteamRelease`는 정지했고 다시 켜지 않는다(11-03 사용자 승인). 웹 패치 절차는 부록 W4.
- Unity는 Steam 베타 브랜치 `unity-beta`에 먼저 올린다(`G:/exoduser-steam/run_build_unity_beta.bat`, `preview`로 먼저 확인). 업로드·Set Live·패치노트 게시·기본 브랜치를 Unity로 바꾸는 일은 모두 사용자 확인 뒤에 하고, steamcmd 로그인은 사용자가 직접 한다.

## 11. 원격 브라우저

- Claude in Chrome 같은 원격 브라우저 작업은 Mac Chrome으로 한다. 연결 목록에서 osPlatform이 macOS인 브라우저를 묻지 않고 고른다. 이름(Browser 1/2)과 deviceId는 재연결 때 바뀌므로 이름으로 고르지 않는다. Windows 로컬 파일도 file_upload로 올릴 수 있다. 로그인이 풀려 있으면 사용자에게 Mac에서 직접 로그인해 달라고 한다(대리 로그인 금지).

## 12. 참고

- docs 폴더 색인은 [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md)에 있다. 게임 시스템 기본 규칙(에너지쉴드·기검참 배율 등)의 정답은 Unity Core(`Runtime/Core/EnergyShield.cs`, `KiSlash.cs`, `Skills/SkillRules.cs`)이고, 설명은 [2_5 부활+에너지쉴드](docs/2_5%20부활+에너지쉴드시스템/2_5%20부활+에너지쉴드시스템.md)와 [스킬데미지공식표](docs/14밸런스+수치테이블/스킬데미지공식표.md)에 있다.

## 부록 W — 웹(H5) 유지보수 전용

웹은 Steam 라이브판 유지보수 때만 main에서 고친다. 새 기능·디자인은 넣지 않는다.

### W1. 서버·3333

- 3333은 예약 작업 `EXODUSER_LatestWeb3333`(5분)이 `G:\exoduser-wt\latest-web`을 origin/main으로 fast-forward해 띄운다. 끄거나 재시작하지 않고, latest-web의 추적 파일을 고치지 않는다(고치면 자동 갱신이 멈춘다). 확인: `I:\EXODUSER-Storage\tools\latest-web-refresh\refresh.log`.
- 검수 서버는 자기 작업본에서 다른 포트로 띄운다(예: `PORT=3346 C:/nvm4w/nodejs/node.exe server.cjs`). python http.server는 쓰지 않는다(API 404).

### W2. DEMO/EA 동기화

웹 실행 파일(game.html·index.html·lang·JS·CSS·에셋)을 main에 반영하고, refresh.log에서 latest-web이 그 SHA로 갱신된 것을 본 뒤 실행한다. `G:/exoduser`(뒤처질 수 있음)에서는 실행하지 않는다.

```bash
cd G:/exoduser-wt/latest-web
C:/nvm4w/nodejs/node.exe tools/sync-demo-ea.mjs --dry   # 바뀔 개수 먼저 확인
C:/nvm4w/nodejs/node.exe tools/sync-demo-ea.mjs
```

- 기준 목록은 `build-nwjs.mjs`의 `FILES`·`DIRS`와 `lang_*.js`·`atlas_*`·`node-main.js`이며 Git 추적 파일만 옮긴다. 추적 파일에 수정이 있으면 도구가 멈춘다.
- 덮어쓰는 파일은 `I:/EXODUSER-Storage/backup/demo-ea-sync-<시각>/`에 먼저 백업한다. 지우는 파일은 없다. `build-target.js`·`package.json`은 실행본 것을 유지한다.
- DEMO: `game.html`·`gamedemo.html`은 `const _BIC=true`로 치환하고, `index.html`·`indexdemo.html`(DEMO 메인)은 원본 그대로 둔다. EA: `game.html`·`index.html` 원본 그대로.
- `_DEMO_MODE`·`_LOBBY_BUILD`는 `build-target.js`(`window.EXODUSER_BUILD_TARGET`)가 정하고 `_DEMO_LV_CAP=100`은 고정이다. 옛 sed 절차는 쓰지 않는다. 정의가 바뀌면 도구가 멈춘다.
- `G:/exoduser-DEMO`·`G:/exoduser-ea`는 `I:/EXODUSER-Storage/archive/G/` 아래로 이어진 junction이다. 개발 중 `?bic`를 붙이면 BIC 부스 데모(Lv100)다.

### W3. 웹 코드 함정

- DOM: `textContent`·`innerHTML`로 부모 컨테이너 내용을 바꾸지 않는다(자식 노드가 전부 사라진다). `querySelectorAll('div')` 같은 넓은 선택자로 `textContent`를 넣지 않는다. 교체 대상은 리프 노드(`children.length === 0`)나 특정 `id`·`class`만이다.
- 캔버스 글자: GPU 프록시(`X`)에서는 `strokeText`가 GL층 위 별도 캔버스에 그려져 fill을 덮는다. 외곽선은 fillText 오프셋으로 그린다.
- 맵 생성기: 맵 수정은 `genFromTemplate`, `genGauntlet`은 폴백이다. 시작 6시·출구 12시·상단 통로를 보장한다. scatter 데코는 겹치지 않게 5타일 간격, 방 전체 랜덤 배치.
- 폰트·색 토큰: 본문 `var(--font-hell)`(나눔명조), 제목·숫자 `var(--font-hell-title)`·`'Cinzel'`, 강조 `var(--font-display)`. 같은 화면의 기존 요소(`#areaTitle`, 스테이지 클리어 패널, 레벨업 연출) CSS를 기준으로 삼고, 색은 실버 헬 토큰을 쓴다.

### W4. 웹 Steam 패치

- 유지보수 수정이 있을 때만 한다. 버전은 `release-version.json` PATCH+1, 패치노트 `docs/13출시·마케팅/patch_notes/v<버전>.md`(한·영) 필수, 커밋된 HEAD로 빌드한다. Set Live·Steam 패치노트 게시는 사용자 확인 뒤에 한다. 상세: [STEAM_UPDATE_RULES](docs/13출시·마케팅/STEAM_UPDATE_RULES.md).
