# UNITY-START-PARITY-01 — CH1-1 첫 진입 시점·링·이리스

상태: **IMPLEMENTED_UNVERIFIED — GPU 대기**. **VISUAL VERDICT: RETOUCH**.

부모 `ec6e7b0a9fcbfac204ccbb8b2a7ea182b3cbfa04`, 전용 브랜치 `codex/unity-start-parity-01-20261026`. main/PC/사용자 실행본 반영이 아니다. 최종 SHA·원격 대조·GPU 대기 영수증·실제 검수 여부는 `~/exoduser-wt/_out/UNITY-START-PARITY-01/DONE.txt`에서 확정한다. 아래 CPU 계산을 웹/Unity 실행 관측으로 읽지 않는다.

## 정본과 비교 시점

`godot/source_snapshot/game.html` SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`. HTML 및 외부 JS54개를 기준 커밋 byte로 별도 `web/`에 준비했다. 로컬 node 서버/새 origin·격리 저장과 GPU 창 Chrome만 실제 관측에 사용하며, 런타임 상태/HP/카메라/ens/RNG/DOM을 주입하지 않는다. 기존02 웹은 사망 후 통제 프레임으로 복원한 이미지이므로 자연 첫 진입의 증거가 아니다.

| 기준점 | 실제 원본 계약 | 기존 Unity 차이 / 이번 후보 |
|---|---|---|
| 안내 진입 | 63279–63284 `_startIntro`: ens 제거, `G.on=false`, `_intro=true`, iframes9999 | 기존 준비된5적은 Guide에서 renderer만 숨김. 준비 데이터의 존재와 웹 active ens0은 구분. 이 후보는 안내 시각/로비 코드를 수정하지 않음 |
| 안내 종료 t0 | 63412–63444 `_openIntroCurtain`: `G.on=true`, iframes600, 시작500px 안전반경 제거 후580px 링5, bonfire t300/r280. 900ms 뒤 `_intro=null` | 기존에는 이900ms 동안 Simulation·펫 정지. `FixedUpdate`의 전용 Curtain 분기로 기존60Hz pet→simulation tick을 진행. Running/input fence와 기존 로비 presentation 소유권 유지 |
| 첫 약0.9초 | 32113 lesson.tick은 `_intro`가 있으면 레슨을 시작하지 않으므로 정상 update·펫·적 진행 | 이제 Curtain 동안 tick 진행. 웹 렌더 저프레임·벽시계/고정tick 경계로 정확한 tick 수는 실제 영수증으로 확인 |
| 레슨 시작 | parry-lesson.js389–406: saved.ens에 보관, active ens=[], bonfire/spawnHoles 등 별도 보관. 468–487 intro는 updatePet보다 먼저 return | 기존 FirstPracticeSession의 Original 보관/Arena 빈 목록·Intro 펫 동결 유지. 보관 중인 살아 있는 링 타깃을 즉시 죽이거나 null로 만들지 않음 |
| 이리스 | 41509–41541: 살아 있는 ens의 플레이어 기준 최근접 `<800`, 타깃 부재/사망 즉시·그 외10틱, 머리 위20px 궤도·lerp.12. 빈 목록이면 P주변55px·lerp.15 | 기존 수식 변경0. `IrisTarget` 읽기 전용 getter만 QA 기록에 추가. 레슨 intro에서 갱신이 멈춘 타깃 참조와 현재 active 목록 소속을 별도로 기록 |
| 뒤쪽 전투 | 레슨 skip/완료 후 보관 링 복원·추적. 시간이 지나 적과 이리스가 중앙에 모일 수 있음 | 기존 웹의 중앙 적 겹침/밝기84를 첫 t0/레슨 intro의 고정 목표로 강제하지 않음 |

## 링 좌표와 생성 상태 — CPU 원문 계산

아래는 원본 `canMv/safePt`를 exported 고정 map에 실행한 **계산표**다. 실제 무개입 웹/동시점 Unity 관측표는 GPU 작업 후 별도 영수증으로 채운다. 출처 `opening-ring-cpu.json`; float 차이는 반올림이며 별도 좌표 보정값을 만들지 않았다.

| id | etype | 원본 safePt x,y | Unity float x,y | 생성/상태 |
|---|---:|---|---|---|
| ring_01 | 0 | 4020,6840 | 4020,6840 | idle, alive, spawn20 |
| ring_02 | 0 | 4571.612779,7240.770143 | 4571.612793,7240.770020 | 동일 종류·상태, 난수별 speed/r/st2/facing |
| ring_03 | 0 | 4360.915446,7889.229857 | 4360.915527,7889.229980 | 동일 |
| ring_04 | 0 | 3679.084554,7829.229857 | 3679.084473,7829.229980 | authored y7889.229857에서 safePt가−60. r10 통과/r22 타일벽 접촉 |
| ring_05 | 0 | 3468.387221,7240.770143 | 3468.387207,7240.770020 | 동일 |

원본 `initStage`31610의 etype4 다안 육괴2는 `_startIntro`63281의 전체 ens 제거 이전이므로 커튼 링에2마리를 덧붙이지 않는다. tileRLE에서는 `_openIntroCurtain`63418의 방/복도 자동 스폰이 꺼져 있다. 첫 진입 이후 소환굴 자연 공급·레슨 전체·M29/M30 공격 owner는 이번 후보의 완성 범위가 아니다.

| id/항목 | 원본 행·수치 | 후보 적용 |
|---|---|---|
| OPENING_ROLL | 31035–31049/31134: hell0 magic.03, rare/champion0, magic HP×2/ATK×1.3/r×1.08, 공격 modifier는 M29/M30 중1 | `SpawnOpeningEnemy` stage0 한정. 기존 명시적 비정예 `SpawnNormalEnemy` fixture/실습 계약은 유지. HP는 multiplier를 floor 전에 적용(Lv1 diff5 875→1751, ATK31→40), projCd240→192 |
| OPENING_RNG | rollElite→[rollMods1]→speed→r→st2→facing→projT→bossPatT→_bossOrbitAng→_erraticAng | 일반9/매직10 draw, 불허 위치0. bossPatT30+u×20 및 두 angle2πu는 etype0에서도 무조건 소비(31173/31262/31302). 이전 Unity는 일반 fixture의5draw만 사용. `constructor-source.json`은 실제 mkEn 원문 실행, CoreTests는 그 표본 대조 |
| OPENING_FADE | 31361 `_spawnT=20`, 34448 tick별−1, 5249 alpha=max(0,1−t/20) | opening의 SpawnTicks20→0, body/walk 같은 alpha. 실습은 기존0 유지. 새 texture/빛/이미지 없음 |
| WALL_RESCUE | 34427–34435: center+4corner tile 체크→1..5tile×8방향, 첫 center floor로 구출·kb0. 31724/38591은 몸4corner 통과하는40..200/20px×8방향 이동 | SourceMap tile-only 두 callback, 기존 geometry/prop collision 불변. Config AI가 켜진 일반 loop에서 사전 구출/AI 앞 body 밀어내기. 실패는 기존 ordinary death owner로 전달. 원본 전체 drop/reward 동일성으로 확대하지 않음 |
| LIGHT_PHASE | source32113/32139: intro return 뒤에 _gameFrame++; 광원4664/4687은 이 값 사용 | Running 기준 render별 증가를 제거하고 같은 updatePet의 Crow.T(초기0/레슨 중 reset 없음)로 위상 연결. Curtain 진행·레슨 intro 동결. fog의 기존 render/실시간 시계·수치/캐시 조건 불변 |
| IRIS_LIGHT | 기존 r250, halo150, player470/원본 alpha/cache/합성 | 수치·shader 변경0. 이리스 타깃을 플레이어 쪽으로 강제하지 않음 |
| QA_ENTRY | 기존 `--unity-startup-capture -startParity true -output <절대경로>` | 별도 진단 테스트 파일0. 실제 BeginCharacterEntry callback→네메시스 skip→Guide180렌더 warmup→Curtain→첫 레슨. 임의 Simulation 위치/HP/RNG/적 배열 주입0. Unity callback 검수이며 OS입력 검수와 구분 |
| QA_STATE | curtain-open/mid/lesson-intro | 같은 EndOfFrame의 screenshot 요청과 active/held 적 전체, etype/좌표/HP/상태/r/speed/타이머/정예/modifier/이리스 대상ID·목록소속/pose/clock을 JSON에 기록 |
| QA_PERF | 자연 도달한 레슨 intro, 준비180/측정900렌더, cap120/vsync0 | 1회. 실제 lesson이 적/펫을 동결. 이전02의 인위적 stationary전투/펫진행 성능과 같은 부하라고 주장하지 않음. Release GC 인증 아님 |

M29/M30 modifier ID·생성 수치/소비 순서 인수는 해당 공격 패턴의 전체 이식이 아니다. 기존 flow field·AI tier·분리력·자연 공급·전체 장비 RNG factory도 아직 부분 이식이다. 후보 화면을 보기 전 원래 조명 차이가 모두 해결되었다고 선언하지 않는다.

## CPU 검증과 GPU 인수 경계

기존 CoreTests에 생성 draw순서·매직 반올림/위치거부·20tick fade·ring_04 r10/r22 구출/54tick 추적을 추가했다. 최신 **63/63 PASS**, 기존 FirstPractice CPU **34/34 PASS**, 새 테스트 파일0. 이전56/59/62 통과 뒤 실제 코드 변경이 있었으므로 후속 검사는 새 변경에 대한 실행이다. Runtime81 C# API CPU compile은 최종 errors0/기존 CS0649 warnings27. 첫 compile의 Core namespace import 누락1회는 수정 후1회 통과했으며 무수정 실패 재실행0. 원문 constructor 추출의 쉼표 선언 파서 오류는 분석 코드 수정 후 해결했고 Unity 빌드 실패와 구분한다.

Unity Editor·Player·Chrome 새 관측·1x/4x 비교·새 방사 밝기·성능·기존 HUD/practice Unity 시험은 **GPU 대기**다. 과거 사진/성능을 새 결과로 복사하지 않는다. r20 43.921 대83.947은 과거 서로 다른 적/시점의 결과이며 이 후보의 새 수치가 아니다.

방사 방법은 FIELD-VERIFY-01 유지:1920×1080, 중심(960,534), r0..600/20px, 각1440, encoded sRGB Y′=.2126R+.7152G+.0722B, 공통 x0..1919/y60..839, 바깥 clip·actor mask0. 첫 진입의 실제 픽셀/동시점 원본 이미지를 얻은 뒤에만 `captures/start_compare_1x.png`(3840×1080, 무리샘플링)·플레이어 nearest4x·CSV를 생성한다.

## 보호·재현

원본 지정 sparse 패턴은 이름으로 지정된 PET/LIGHT02 문서에 literal 목록이 없어 PET의 기존 실행 로그46–61에서 동일 목록을 회수했다. `initial-git.json`에 패턴·HEAD/branch·INDEX/WORK clean·원격 expected(대상 branch 부재)를 보존했다. 새 worktree 정상 add/no-checkout→동일 no-cone patterns→read-tree, Library 복사0. 별도 build project는 Assets/Packages/ProjectSettings/Tools만 복사·전 파일 byte 대조, MediaRecovery 정본 필수 영상만 복원한다.

NativeGame.cs는 구출 callback1줄, opening 생성 호출/주석, Curtain tick1줄, spawn alpha만 최소 변경한다. 정확한 hunk 수는 최종 DONE/patch를 따른다. NativeLobby.cs/NativeLobbyVideo.cs/오디오/intro-silence fixture/UNITY-MAC-20261024 WIP는 수정·병합하지 않는다. 사용자38141/48476/52157은 대기 대상에서 제외하면서 보존하고, 타 Codex92691 및 후속 QA는 종료하지 않는다. 5분 간격 최대60분 GPU 대기 후 미해제면 CPU 후보만 정상 commit/push·worktree 유지한다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 START 동일성. 신규 맵 제작/아트 개선0 |
| MASTER | silhouette/regions/main route/side spaces 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 새 제작·전수 검수0 |
| LARGE | 기존 source assets/composites/overlap/repeated silhouette 변경0 |
| MEDIUM | 연결/remaining holes 새 수정0 |
| GROUND | shadow/contamination/integration·조명 수치 변경0 |
| PLAYABLE | 전투/이동 공간 변경0; 시작 링 구출과 시계 교정 CPU PASS; 실제 가독성 미검수 |
| LANDMARK | primary/secondary/tertiary 배치 변경0 |
| CAMERA QA | START 대기/과거 RETOUCH; EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 이번 미실시 |
| TECH QA | route/seam/웹 pageerror/404/실제 loading/performance 대기; 원본 collision 불변·CPU 검사 PASS |
| FILES | 소유 코드9경로+관련docs. 공용 NativeGame 최소 hunk. unrelated0 |
| GIT | 전용 branch 명시경로 commit·비강제 push; main/deploy0. 최종 SHA는 외부 DONE |
| VISUAL VERDICT | **RETOUCH — VERIFIED 아님** |
| NEXT PASS | GPU가 비면 무개입 새 캐릭터 first entry→동시점 화면/목록/CSV/performance/HUD/practice1회. 60분 초과면 후보 보존 |


## 실제 웹 1차 읽기 전용 관측과 fixture 보완

첫 격리 node3398/새 저장 없음→원본 splash click→네메시아 Space hold→안내 skip의 일반 UI를 사용했다. Chrome1920×1080/DPR1, renderer useGPU=true/useGL=false. 상태·목록·카메라·HP/RNG/DOM 주입0. Guide gameFrame0/ens0/iris(4040,7386,t50), 커튼 중 frame31/ens5/최근접ring_04, 레슨 intro frame39/active0/held5/iris(3763.621122,7746.161719,t89) 및 held target index3을 연속 읽었다. 여러 읽기 사이 frame39와 iris.t89는 그대로 유지됐다. native render clock 오류의 직접 관측 근거다.

이 실행의 원본 HTML/JS는 일치했지만, 기존02 web 사본에 CSS18개·atlas runtime module·prefabs registry·atlas_player PNG 총21개가 없어 HTTP404였다. **초기 PNG는 최종1x/방사 비교에서 제외**한다. 원본 byte21개를 격리 사본에 보완하고 HTTP200 확인, 새 origin3399/새 save directory를 준비했다. 게임 원본 수정이나 브라우저 storage clear는 하지 않았다. 교정 웹 재관측 직전 타 QA96252/96257 재등장으로 중단·5분 간격 대기를 재개했다. 최초 GPU 대기 시작20:30:35 KST의60분 상한은 연장하지 않는다. 이 단계의 새 Unity 빌드/캡처/성능/HUD/practice는 아직0회다.

| 원본1차 레슨 intro frame39, held | etype | x | y | HP | 상태 | 이리스 대상 |
|---|---:|---:|---:|---:|---|---|
| ring_01 | 0 | 4020.000000 | 6901.988639 | 875 | idle/alive/spawn0 | 아니오 |
| ring_02 | 0 | 4504.014195 | 7255.120144 | 875 | idle/alive/spawn0 | 아니오 |
| ring_03 | 0 | 4334.517827 | 7826.323993 | 875 | idle/alive/spawn0 | 아니오 |
| ring_04 | 0 | 3782.913125 | 7765.925375 | 875 | idle/alive/spawn0 | held index3 |
| ring_05 | 0 | 3529.411081 | 7252.971885 | 875 | idle/alive/spawn0 | 아니오 |

Unity 같은 시점의 실제 목록은 GPU 대기로 **미측정**이다. 위 원본1차 자료는 로직 관측이고 CSS가 보완된 최종 시각 인수와 구분한다. 원본의 생성 local RNG9/10을 교정해도 전체 장비505draw·맵/부트 RNG와 C# seed stream 전체 replay가 같은 것은 아니다. 따라서 모든 남은 좌표 차이를 RNG뿐이라고 단정하지 않는다. source flow field/tier와 native fallback 차이도 잔여다.
