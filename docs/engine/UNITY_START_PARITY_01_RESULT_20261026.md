# UNITY-START-PARITY-01 최종 인수 결과

<!-- SUMMARY_BEGIN -->
**IMPLEMENTED_UNVERIFIED — GPU 대기 / VISUAL VERDICT: RETOUCH.** 최초 ARM64 빌드·54tick 시작 촬영·성능1회·HUD55/practice5 각1회는 통과했다. 실제 웹도54tick/active0·held5/이리스ring_04를 확인했다. 마지막 별도 Ori 바닥광원 누락 교정은 push했으나 재빌드 직전 타 QA 재점유로 build/화면/성능 미검수다. 비교 PNG·43.646943 대63.382553·8.444413ms는 **Ori 수정 전** 실제 빌드이며 최종 AFTER가 아니다. worktree를 유지한다.
<!-- SUMMARY_END -->

부모 `ec6e7b0a9fcbfac204ccbb8b2a7ea182b3cbfa04`, 코드 후보 `84ee74a573ff147f706f6fe4d297e7a77cfcf841`, 브랜치 `codex/unity-start-parity-01-20261026`. 최종 docs commit SHA/원격 확인은 외부 `~/exoduser-wt/_out/UNITY-START-PARITY-01/DONE.txt` 첫 줄과 remote receipt다. [원문 행·구현표·중간 이력](UNITY_START_PARITY_01_20261026.md).

## 원인과 교정

1. 과거 비교의 웹은 사망 후 복원한 통제 프레임이었다. 새 캐릭터의 정상 첫 진입에는0.9초 커튼 동안 링5가 진행하고, 레슨 intro에서 active ens0/held5가 된다. 이리스는 두 엔진 모두 남서 ring_04를 따라가며 중앙에 겹치지 않는다.
2. Unity의 커튼900ms 전투/펫 정지, 시작 링의 정예 롤·생성 난수 누락, ring_04 타일벽 구출 누락, spawn20tick 누락을 원문대로 교정했다. 원본 local 생성은 일반9/매직10draw다. 비정예 명시 fixture/실습은 기존 계약을 유지했다.
3. 원본 레슨 intro는 `_gameFrame`54에서 동결된다. 렌더마다 증가하던 광원 위상을 같은 updatePet의 Crow.T로 교정했다. r470·iris250·기존 강도·gradient·cache 조건을 바꾸지 않았다.
4. 같은54tick에서도 r20 밝기가19.735610 낮아 원문을 추가 대조했다. 25502/51944의 **별도 `_ptLight` 바닥 bitmap**이 빠져 있었다. 이것은 `_CENTER_GLOW=false`/`_TORCH.darkAlpha=0`과 별개다. 원본640²/r320, stops RGBA255/190/90/.28→.4의220/120/40/.13→1의0을 그대로 인수했다. PNG414851B/SHA256 `b7232a32e58bf8ed75d727f6013bebe83f6023bcab43fc91ef88af52bcddfef5`. 기존 additive shader를 재사용하여 ground−20000 위/actors 아래−19999에서640px1:1로 그리는 후보다. 최초1회 load/Sprite/Material, 매 프레임 위치/가시성만 갱신, RT 추가0, 원본 texture 약1,638,400B. **이 마지막 후보는 GPU 미검수다.**

적 좌표 차이를 RNG뿐으로 선언하지 않는다. 전체 장비/boot RNG stream은 아직 부분 이식이며 원본 tier/flow field와 native fallback도 다르다. 실제5행 평균 차이15.644340px/최대19.890582px다. 이리스 위치 차이는15.984219px이며 orbit t104/target ring_04/held 상태는 같다.

## 같은 시점의 실제 적 전체 목록

웹: 새 origin3400/저장0, GPU 창 Chrome1920×1080/DPR1, 정상 splash→네메시아 hold skip→Guide skip만 사용했다. 상태/HP/카메라/ens/RNG/DOM 주입·게임 clock override0. 관측용 requestAnimationFrame은 local 배열로 읽기만 했다. Guide frame0/ens0, Curtain→레슨54tick을 확인했다. Unity는 기존 startup-capture의 실제 ordinary entry callback 경로이며 OS입력 검수와 구분한다.

두 쪽 모두 active0/held5, 전부 alive/idle/HP875/etype0/elite0/spawn0. 좌표는 held 목록이다. 웹 Player HP573 대 Unity 고정 시작 장비 표본526, 방향·UI/전체 실습 범위 차이는 보존한다. Unity intro Arena iframe0/Original546 대 웹546의 기존 실습 경계도 완전 동일성으로 확대하지 않는다.

| id | etype W/U | WEB x,y | Unity x,y | State/HP W/U | Distance delta px |
|---|---|---|---|---|---:|
| ring_01 | 0/0 | 4020.000000,6927.851261 | 4020.000000,6938.085938 | idle/alive,875/875 | 10.235 |
| ring_02 | 0/0 | 4486.085979,7258.743219 | 4492.695801,7266.425293 | idle/alive,875/875 | 10.134 |
| ring_03 | 0/0 | 4326.781425,7808.541815 | 4309.710449,7818.750488 | idle/alive,875/875 | 19.891 |
| ring_04 | 0/0 | 3789.891422,7748.144439 | 3807.455078,7753.345215 | idle/alive,875/875 | 18.317 |
| ring_05 | 0/0 | 3545.856257,7256.361771 | 3559.591309,7270.406738 | idle/alive,875/875 | 19.645 |


이리스: 웹(3767.103193,7722.036636), Unity(3781.338234,7729.307047), t104 동일. 웹 targetHeldIndex3, Unity targetId4/active-list false. `enemy-comparison.json`과 양쪽 원시 상태에 radius/speed/st2/타이머/정예 정보를 보존했다.

## 실제 검수와 실행 횟수

| 항목 | 실제 결과 |
|---|---|
| 최초 실제 빌드 | code ed3f584, Unity6000.6.7f1/ARM64 Release/Succeeded/errors0/2008857958B. Settings QA identity. Library 복사0/fresh import |
| 시작 | Player98912 exit0. Curtain54tick→Intro,1x 원본 PNG3개·상태 JSON3개. 최초 성능1회 포함 |
| HUD Unity1회 | Player98944 exit0,55checks/0failures |
| practice Unity1회 | Player98959 exit0,5checks/0failures/11kills. original Player/Config/RNG/clock/resources/actors 복원true |
| CPU | 기존 Core63/FirstPractice34 PASS. Runtime81 API compile 최종 오류0/기존 경고27. 첫 namespace import 오류1회는 수정 뒤 통과. 새 진단 테스트 파일0 |
| 웹 준비 교정 | 기존02 사본의 CSS 등21개와 후속 player atlas metadata1개를 정본 byte로 보완.3398 초기 PNG와3399 준비 reload는 최종 비교에서 제외.3400 최종 resource404 0. PROJ_ATLAS warning/확장프로그램 Object 로그는 별도 원로그로 보존 |
| 마지막 Ori 후보 | API compile0/정확한 asset byte 대조·원격 backup까지 완료. 재빌드 직전 gate 차단으로 Editor/Player 시작0, 최종 frame/performance/HUD/practice 재실행0 |
| 실패/반복 | 실패 Unity build0/실패 Unity test0/무수정 실패 재실행0. 소스 분석의 쉼표 선언 파서 오류는 분석 코드 수정 후 해결. 초기 시각 실패의 원인을 고쳐 capture-only 보완을 준비했으나 GPU 차단으로 실행하지 않음 |

GPU는20:30:35부터5분 간격 대기했다.60분 확인21:30:35에 비어10초 비점유 확인 후 최초 build/시작/HUD/practice를 직렬 실행했다.21:50:07 마지막 Ori 재빌드 직전 다른 Codex Player PID324가 재등장했다. 최초60분 상한을 연장하지 않고 **build 실행 전에 중지**했다. 사용자38141/48476/52157·타 프로세스를 종료하지 않았다.

## 실제1x·4x와 방사 프로필

`captures/start_compare_1x.png`3840×1080은 왼쪽 **실제 ed3f584/Ori수정전 Unity**1920×1080, 오른쪽 정본 웹1920×1080를 무리샘플링 결합했다. `player_4x.png`2560×1280은 각 rect(800,374,320,320)를 nearest4x로 확대했다. 실제 파일을 열어1x·4x 검수했으며 최종 Ori AFTER라고 표기하지 않는다. `captures/manifest.json`에 source/SHA/규격/crop/최종코드미렌더를 기록했다. 남은 본체 방향·배경 전경·미니맵/HUD/레슨 패널·초상 글자 차이를 전반적 시각 PASS로 확대하지 않는다.

FIELD-VERIFY-01과 같은 중심(960,534), r0..600/20px, 각1440, round=floor(v+.5), 공통 x0..1919/y60..839, encoded sRGB Rec709 Y′=.2126R+.7152G+.0722B, actor mask0. 반경0은 같은 pixel1440번이다. outer ring에는 UI/배경 차이가 포함된다. `radial-start.csv`/`radial-method.json`. 최종 Ori 값은 **미측정**이다.

| r px | Unity measured/pre-Ori | WEB54ticks | Delta U-W | samples | Final Ori |
|---:|---:|---:|---:|---:|---|
| 0 | 193.382 | 84.344 | 109.038 | 1440 | UNMEASURED |
| 20 | 43.647 | 63.383 | -19.736 | 1440 | UNMEASURED |
| 40 | 43.494 | 60.632 | -17.138 | 1440 | UNMEASURED |
| 60 | 44.748 | 56.574 | -11.826 | 1440 | UNMEASURED |
| 80 | 42.360 | 52.052 | -9.691 | 1440 | UNMEASURED |
| 100 | 42.195 | 48.544 | -6.349 | 1440 | UNMEASURED |
| 120 | 42.987 | 46.171 | -3.184 | 1440 | UNMEASURED |
| 140 | 41.179 | 42.528 | -1.349 | 1440 | UNMEASURED |
| 160 | 40.811 | 39.998 | 0.812 | 1440 | UNMEASURED |
| 180 | 41.484 | 38.198 | 3.286 | 1440 | UNMEASURED |
| 200 | 40.576 | 36.232 | 4.344 | 1440 | UNMEASURED |
| 220 | 39.908 | 34.542 | 5.366 | 1440 | UNMEASURED |
| 240 | 39.175 | 33.098 | 6.077 | 1440 | UNMEASURED |
| 260 | 38.650 | 31.852 | 6.798 | 1440 | UNMEASURED |
| 280 | 38.280 | 31.157 | 7.123 | 1440 | UNMEASURED |
| 300 | 38.620 | 30.994 | 7.627 | 1440 | UNMEASURED |
| 320 | 38.274 | 31.526 | 6.748 | 1301 | UNMEASURED |
| 340 | 37.682 | 31.030 | 6.652 | 1231 | UNMEASURED |
| 360 | 37.383 | 30.962 | 6.421 | 1185 | UNMEASURED |
| 380 | 36.008 | 29.690 | 6.318 | 1149 | UNMEASURED |
| 400 | 35.781 | 29.559 | 6.223 | 1119 | UNMEASURED |
| 420 | 35.100 | 29.128 | 5.972 | 1093 | UNMEASURED |
| 440 | 34.212 | 28.988 | 5.224 | 1071 | UNMEASURED |
| 460 | 34.163 | 28.380 | 5.783 | 1053 | UNMEASURED |
| 480 | 33.681 | 27.999 | 5.682 | 968 | UNMEASURED |
| 500 | 33.959 | 27.895 | 6.064 | 874 | UNMEASURED |
| 520 | 33.257 | 28.768 | 4.489 | 814 | UNMEASURED |
| 540 | 32.900 | 26.191 | 6.709 | 766 | UNMEASURED |
| 560 | 33.400 | 25.311 | 8.089 | 728 | UNMEASURED |
| 580 | 32.316 | 25.319 | 6.997 | 694 | UNMEASURED |
| 600 | 30.566 | 27.290 | 3.276 | 664 | UNMEASURED |


## 프레임 시간1회

Ori 수정 전 ed3f584 빌드의 자연 레슨 intro, 준비180/측정900렌더, cap120/vsync0. mean **8.444412855ms**, p95 **8.838003501ms**, p99 **9.360664524ms**. Running/Focus900/900, render/cache900/900, targetRecreates0. 동결 source frame54가3의 배수라 원본 조건대로 매 render cache를 갱신했다. 과거 FIELD-VERIFY 시작8.370909ms와 평균 차이+0.073504ms이나 시점·panel·clock 조건이 달라 순수 추가 비용이나 향상으로 해석하지 않는다.

raw allocated0이지만 release profilerGcValid=false이고 미수집 항목의 기본0은 GC0 인증이 아니다. dense combat 시험이 아니다. **요청한 성능1회/HUD1회/practice1회를 반복하지 않았으며 이 수치를 마지막 Ori 빌드의 성능으로 격상하지 않는다. 최종 성능 미검수이므로 VERIFIED가 아니다.**

## 소유·복구·후속

NativeGame.cs는 무문맥5/기본문맥4hunk(구출 binding·opening 생성·커튼 tick·spawn alpha)다. NativeLobby.cs/NativeLobbyVideo.cs/intro-silence fixture/audio·UNITY-MAC-20261024 WIP 수정·병합0. 원본 PNG 인수 외 신규 아트 생성0. 자기 Editor1/Player3 모두 exit0. 자기 node만 종료, 소유 Chrome 탭 종료/viewport 복원, 사용자 저장 경로 접근0. main/PC/기존 실행창 반영·배포0. hooks 유지, 경로 지정 commit/자기branch 비강제 push, −A/force/reset/rebase0.

worktree는 최종GPU 미인수로 유지한다. `_out/project`에는 자기 최초 import Library가 있을 뿐 복사한 Library가 아니다. 코드/asset12경로 byte 대조 `build-input-ori.json`, 최종 source/remote/cleanup는 외부DONE/receipts. 다음 GPU 작업은 타 QA가 끝난 뒤 이 코드의 Ori build1회와 기존 `--unity-startup-capture -startParity true --lighting-capture-only`로 해당 장면을 인수한다. 최종 성능 미측정도 남은 항목이다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 결과 |
|---|---|
| STAGE/MASTER | CH1-1 START. silhouette/regions/main route/side spaces 변경0 |
| OUTER/LARGE | LEFT/RIGHT/TOP/SOUTH/major holes·assets/composites/overlap/repetition 변경0 |
| MEDIUM/GROUND | 연결/geometry/contamination 변경0. 독립 원본 floor light320 누락 복원 후보 |
| PLAYABLE | 기존 전투 공간 유지. 시작 링 구출·54tick 진행 인수. dense swarm 미실시 |
| LANDMARK | primary/secondary/tertiary 배치 변경0 |
| CAMERA QA | START 실제 RETOUCH/최종Ori미검수. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 이번 미실시 |
| TECH QA | route/seam 전수 미실시. geometry 불변, 최초 build/HUD/practice PASS. performance1회는 보완 전 |
| FILES/GIT | code9+PNG/meta3+관련docs, 공용NativeGame 최소 hunk, unrelated0. 전용branch 비강제push/main·deploy0 |
| VISUAL VERDICT | **RETOUCH — VERIFIED 아님** |
| NEXT PASS | 최종Ori build/capture-only/방사와 최종 성능 인수. worktree 유지 |


후속 GPU 인수: [UNITY-START-PARITY-02](UNITY_START_PARITY_02_20261026.md). 위 01 측정은 Ori 교정 전 이력이며 그대로 보존한다.
