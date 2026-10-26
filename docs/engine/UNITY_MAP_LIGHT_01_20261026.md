# UNITY-MAP-LIGHT-01 — CH1-1 월드 카메라 조명

상태: **IMPLEMENTED_UNVERIFIED — 02 검수에서 화면 차이·유효 GC 증거 부족**.

후속 [UNITY-MOAT-01](UNITY_MOAT_01_20261026.md)은 기준8fb4072db의 결손 해자·언덕을 기존원본4PNG/애니메이션으로 연결한 별도 후보다. 조명데이터·합성값은 보존. GPU 대기로 실제빌드/화면 인수는 미실시이며 아래02 당시 결손 관측은 이력으로 유지한다.

2026-10-26 후속 [UNITY-MAP-LIGHT-02 검수](UNITY_MAP_LIGHT_02_20261026.md): 소유 해제 후 새 import/셰이더 검사/ARM64 빌드 오류0, 시작·제단 1x 비교, 900프레임 전후 측정, HUD 55·practice 5검사 통과. 전체 화면 동등성과 매 프레임 GC 0은 미인수다. 아래 실행 금지·미실시·worktree 보존 문장은 01 당시 이력이다. 02는 경로 지정 commit/push 후 정상 worktree 제거 대상이며 타 Unity WIP는 통합하지 않는다.

사용자 2026-10-26 지시 “조명처리 된 맵으로 쓰고”의 구현 후보다. 기준 부모는 `776ebe77d05450343b1482cca945f184733fd30c`, 전용 브랜치는 `codex/unity-map-light-01-20261026`, worktree는 `~/exoduser-wt/UNITY-MAP-LIGHT-01`이다. Unity 총괄의 Editor·Player·GPU 소유를 존중하여 이번에는 실행·import·빌드·캡처·GPU 측정을 하지 않는다. 마지막의 일반 worktree 제거 지시보다 우선하는 실행 소유 규칙에 따라 worktree를 유지한다. 원격 main 및 다른 Unity 작업 폴더에는 반영하지 않는다.

## 정본과 순서

현재 R의 `game.html` 전체 hash는 `ba930ad54520047fc260307c77c0dd14843fcf37dea2e117631f7a26e7aadeb8`로 다르다. 이번 수치/행 정본은 사용자가 지정한 `godot/source_snapshot/game.html`, SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`다. 기준 부모의 Git blob을 읽었다. Godot `142dd255d`의 초기 이식과 `d0c6c5bbd`의 후속 수정, [P2-003A 기록](FDG_P2_003A_LIGHTING_20261020.md)을 대조했다. 아래 행 번호는 이 snapshot 기준이다.

| 순서 / 적용 위치 | 원본 행 | 수치·공식 / Unity 소비 |
|---|---|---|
| CH1 주변 어둠 | 4505–4513, 4693–4716, 55201 | `_HELL_AMBIENT[0]=[6,16,9,.38]`. 반해상도 `floor(C.width/2) × floor(C.height/2)` RGBA32 캐시. 각 광원마다 destination-out: premultiplied RGB 및 alpha에 `1−clamp(a×stamp,0,1)` 곱. 월드에 source-over |
| 어둠홀 stamp | 4520, 4562–4580, 4620–4632 | 원본 반지름 목록 `[10,15,20,25,30,40,50,63,88,125,175,250,400]` 중 최근접(동률은 작은 쪽). stop `(0,1),(.25,.92),(.5,.50),(.75,.15),(1,0)`. CH1 필요 stamp는 88/125/175/250만 진입 시 굽고 bilinear 샘플링. 실제 광원 반지름은 `floor(r×.5)×2`, stamp를 이 크기로 scale |
| 플레이어 등불 | 4635–4637, 4658 | 위치 `(P.x,P.y−6)`, `r=470`, `a=.86+sin(frame×.07)×.03`. ci6 색은 `(255,214,158)`이지만 `_CENTER_GLOW=false`라 색 원판 제외. 임의 주황 bloom 추가 없음 |
| 정적 광원 | 4639–4651, 4682–4685 | 원본 12개, 아래 별도 표. `a=baseA×(1+sin(frame×.09+i×1.7)×.10×f)`, viewport 바깥 ±300px cull. 플레이어 뒤 원본 정적 배열 순서 유지 |
| 색 stamp·합성 | 4522–4542, 4552–4560, 4717–4732, 55201 | 256² stamp, source preset3 `(255,72,40)`, preset0 `(255,172,72)`, preset4 `(110,255,142)`. stop `0:.95 / .28:.52 / .58:.20 / .82:.05 / 1:0`; .58의 RGB=`floor(p×(.7,.6,.5))`, .82=`floor(p×(.4,.3,.2))`, 마지막 투명 검정. stamp는 premultiplied 보간. 내부 Canvas2D lighter 누적 `stamp×clamp(a×.85)`→RGBA clamp, 월드에는 **source-over** `world×(1−color.a×.62)+color.rgb×.62`. final additive로 대체하지 않음 |
| 갱신 주기 | 32135–32139, 55200–55201 | 시뮬레이션 고정 tick과 분리한 화면 frame. 정지 시 frame%3=0, 카메라 이동/해상도 변경 즉시 캐시 갱신. pause 중 frame 정지. 같은 Unity frame의 복수 render 호출은 clock 중복 증가 없음 |
| 추가 토치 어둠 | 8689, 55235 | `_TORCH.darkAlpha=0`, 원본 비활성 게이트 유지 |
| 2D 안개 | 4358–4383, 55352–55372 | 하단 y=.6→1, .3 stop부터 `(60,90,120,.12)` 평탄. 상단 y=0→.3, `(40,60,90,.06)`→투명, top×.6. 병합 후 `pulse=.28+sin(now_ms×π/2000)×.08` (4초). 독립 realtime ms로 처리 |
| 환경광 | 11985–11993, 55377–55388 | `(100,160,255,.06)` 전체 source-over |
| 필드 비네트 | 55389–55407 | 중심 `(W/2,H/2)`, r0=.35W/r1=.7W, stop `0:0 / .7:.05 / 1:.15`, RGB `(20,60,120)`, 전체 alpha×.2. 예전 `_bakeVignette`의 검은 `.55` 비네트와 혼동하지 않음 |
| 색보정 | 6311, 55414–55419 | 기본 high/postfx/grain, brightness100의 `contrast(1.05) brightness(.97)`: `clamp(((rgb−.5)×1.05+.5)×.97)` |
| 별도 THREE DOM 안개 | 8975–9072 | canvas CSS 뒤·HUD 앞. Mac+navigator.gpu이면 init 비활성(9072): 이번 Mac 비교는 2D 안개만 활성. 다른 플랫폼용 port는 3 FBM층/각5옥타브, hash `(127.1,311.7)/43758.5453`, uTime+=.016/frame, uCol=(.10,.18,.08), 중앙×.50→외곽1, alpha=fog×.41 유지. THREE의 투명 FBO 1차 RGB×alpha와 DOM 2차 straight-alpha 합성 보존 |
| HUD/UI | Unity `NativeGame.OnGUI` | Built-in camera `OnRenderImage`에서 월드만 처리. 기존 IMGUI HUD/메뉴·인벤토리·startup guide·로비 영상은 그 뒤에 합성. 로비에서 월드를 숨기면 패스스루, startup 월드가 보일 때는 월드만 조명 |

원본 WebGPU sampler는 5606행 `magFilter/minFilter='linear'`다. Canvas2D/각 GPU 드라이버의 gradient 양자화·UV 방향·최종 색은 실제 1x 비교가 필요하다. 수치 포트/정적 컴파일만으로 픽셀 동등성을 선언하지 않는다. `X.filter`의 GPU proxy no-op와 CSS `C.style.filter`는 별개이며 이번에는 실제 canvas CSS 색보정을 구현했다.

## 정적 광원 데이터

`Resources/Data/ch1_lighting.json`은 `d0c6c5bbd:godot/assets/map/web_parity/detail02/lights.json`의 **동일 byte** 전송이다. 원본 `_buildStaticLights`와 `ch1-altar-moat.js:136–142`, `_CH1_HILL`(snapshot31692)을 대조했다. 도랑은 중심 `(147,98)×40`, rx18/ry9, mid=(.84+1.04)/2=.94, angle=(i+.5)/10×2π다.

| i | 원본 타입 / 색 preset | x | y | r | baseA | 원본 RGB | f |
|---|---|---:|---:|---:|---:|---|---:|
| 0 | m_penta_circle / 3 | 5900 | 3860 | 310 | .46 | 255,72,44 | .6 |
| 1 | m_fyellow / 0 | 5620 | 4060 | 240 | .58 | 255,220,110 | .9 |
| 2 | 도랑0 / 4 | 6523.6750502285595 | 4024.571350896482 | 210 | .30 | 126,236,98 | .7 |
| 3 | 도랑1 / 4 | 6277.813058751545 | 4193.7713508964825 | 210 | .30 | 126,236,98 | .7 |
| 4 | 도랑2 / 4 | 5880 | 4258.4 | 210 | .30 | 126,236,98 | .7 |
| 5 | 도랑3 / 4 | 5482.186941248455 | 4193.7713508964825 | 210 | .30 | 126,236,98 | .7 |
| 6 | 도랑4 / 4 | 5236.3249497714405 | 4024.571350896482 | 210 | .30 | 126,236,98 | .7 |
| 7 | 도랑5 / 4 | 5236.3249497714405 | 3815.428649103518 | 210 | .30 | 126,236,98 | .7 |
| 8 | 도랑6 / 4 | 5482.186941248455 | 3646.228649103518 | 210 | .30 | 126,236,98 | .7 |
| 9 | 도랑7 / 4 | 5880 | 3581.6000000000004 | 210 | .30 | 126,236,98 | .7 |
| 10 | 도랑8 / 4 | 6277.813058751545 | 3646.228649103518 | 210 | .30 | 126,236,98 | .7 |
| 11 | 도랑9 / 4 | 6523.6750502285595 | 3815.428649103518 | 210 | .30 | 126,236,98 | .7 |

JSON 수치는 원본 그대로 보존하고 Unity에서 float로 소비한다. 현재 Unity에는 이리스 펫·arena boss·화염장판 자체가 없어 이 동적 광원은 생성하지 않았다. 웹의 펫 r250/가변 alpha·색 preset0 및 보스/장판 광원까지 동일하다는 주장은 하지 않는다. CH1 side-fog는 원본55215–55217부터 제외되어 추가하지 않았다. ATMOS 입자·갓레이·보스아레나 비네트 분기·전체 맵 생체 표현은 별도 범위다.

## 자원·좌표·소유 경계

| 항목 | 구현 |
|---|---|
| 신규 런타임 | `NativeFieldLighting.cs`, `SourceFieldLightStamps.cs`, `NativeGame.WorldLighting.cs`, `FieldLighting.shader`, `ch1_lighting.json` 및 각 meta |
| 공용 NativeGame.cs hunk 1 | Awake: `sound=new NativeFeedbackAudio(...)` 뒤, `ResetRun()` 앞에 `InitializeWorldLighting();` 한 줄 |
| 공용 NativeGame.cs hunk 2 | OnDestroy: 기존 첫 dispose 앞에 `DisposeWorldLighting();` 삽입. 기존 cleanup 순서 보존 |
| 준비 | Awake에서 shader/data 1회 로드, material1개·hole atlas502×1284·color atlas258×774 생성/upload, CPU pixel 배열은 초기화 후 참조 해제, `Apply(false,true)`로 Texture2D CPU 사본 해제. frame 중 로드/새 배열/리스트/문자열/temporary RT 없음 |
| 지속 캐시 | RGBA32 stamp3,377,040bytes + 반해상도 RT2장(1920×1080에서4,147,200bytes), 합계7,524,240bytes(약7.176MiB). driver/기존 world image-effect 버퍼/초기 CPU 배열은 이 수치에 미포함 |
| 해상도 전환 | component Update에서 크기/RT 유실을 확인할 때만 release/recreate. OnRenderImage 중 source 크기가 준비 크기와 다르면 패스스루 후 다음 Update에서 준비. 안정 프레임당 자원 재생성0. 실제 GC/resize 동작은 미측정 |
| 좌표 | 기존 camera orthographicSize5.4·100px/unit·Y반전 보존. logicalHeight=orthographicSize×200, logicalWidth=height×camera.aspect. 광원 world→viewport source px. 1920×1080에서1x이며 다른 해상도는 기존 Unity world-camera 확대 규칙을 따름; 웹 전체 FOV 동등성은 별도 |
| 수명·블렌드 | Gamma/built-in pipeline(기존 PortVerification.MakeScene). 블릿 시 sRGBWrite/active RT 보존·복구. 소유 component 파괴 때 material·RT·stamp 해제. 효과 미준비/로비 월드 hidden은 패스스루 |
| 금지 경계 | NativeLobby/NativeLobbyVideo/intro-silence/저장·번역 목록·원본 map chunks·R·타 Unity checkout·사용자 앱 변경0. Library 복사0. 새 fixture/진단 테스트 파일0 |

## 이번 확인과 후속 검수

CPU 작업만 수행했다. Unity 번들 Roslyn으로 전용 worktree의 전체 Runtime+Editor C#을 설치 managed assemblies에 대해 정적 컴파일: **오류0, 경고27(CS0649, JsonUtility 필드9개 포함)**. 이는 Unity Editor import·shader compile·Player build가 아니다. `git diff --check` 및 commit hook docs-sync 검사 결과는 외부 DONE에 남긴다. 원격 push SHA도 DONE 첫 줄에 기록한다.

기존 미조명 참고 PNG `~/exoduser-wt/_out/UNITY-MAC-HUD-BLEND-20261026/pointer-review-5a933f6/hud-blend-idle-1080p.png`를 파일로 열어 확인했다. 이번 새 캡처는 없다. 기존 `prepare_input.py`, `build-world-blend.json/log`, `capture-world-blend.log`, `PortVerification.Build`/HUD fixture의 방식은 읽기만 했다. 그 스크립트가 사용하는 타 작업자의 QA project에 복사하거나 실행하지 않았다.

소유 해제 후 별도 지시에서만: 독립 프로젝트 새 import(Library 복사 금지)→격리 settings QA identity로 빌드1회→같은 시작 위치1920×1080 Unity/웹1x 비교와 플레이어 확대 crop→기존 HUD/practice 각1회→필드 조명 전후 frame time 각1회. 웹은 로컬 node 서버/GPU 창 Chrome, 새 캐릭터/격리 저장을 사용한다. 실패한 작업은 원인 코드 수정 뒤 해당 것만1회, 같은 것2번 실패 시 중단. 이번에는 이 순서의 어느 실행 단계도 수행하지 않았다.

예정 캡처: `~/exoduser-wt/_out/UNITY-MAP-LIGHT-01/captures/field_light_compare_1x.png` 및 플레이어 확대 crop. **현재 미생성**. 빌드/Editor·shader import/HUD/practice/성능/1x 시각/HUD 영향·안개 UV·경계/GC는 모두 미검증이다. 원격 push는 인수/검증/배포 완료를 뜻하지 않는다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 이번 상태 |
|---|---|
| STAGE / MASTER | CH1-1. silhouette/regions/main route/side spaces 기존 맵 그대로. 전체→외곽→중형→지면→전투→랜드마크→디테일 순서의 공통 가이드 전체를 읽고 이번에는 기존 지면 위의 조명만 포트 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes 배치 변경0, 기존 청크 보존 |
| LARGE | 원본 production_finish 청크/props 보존. composites/overlap/repeated silhouette 재제작 없음 |
| MEDIUM | connections/remaining holes 변경 없음 |
| GROUND | 어둠홀·정적 색광원·2D fog·환경광·비네트·CSS grade 구현 후보. contamination/structure integration 원본 유지 |
| PLAYABLE | arena/travel/breathing/threat 공간·충돌 유지. 조명 아래 combat readability 미검증 |
| LANDMARK | primary/secondary/tertiary 배치 보존, 정적 광원12개만 원본 좌표 소비 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전부 이번 실행 금지·미실시 |
| TECH QA | CPU C# compile만 오류0. route/collision runtime/pageerror/404/seam/loading/performance/Unity shader·GPU 미검증 |
| FILES | stage-owned 신규 파일5+meta5, concurrent shared NativeGame.cs 2hunk, 관련 engine docs·CHANGELOG. unrelated touched0 |
| GIT | 자기 경로만 stage/commit/push. SHA는 외부 DONE. main 반영/배포0. worktree 유지 |
| VISUAL VERDICT | **RETOUCH — IMPLEMENTED_UNVERIFIED, 실행 소유 해제 후 실제 화면 검수 필요. PASS 아님** |
| NEXT PASS | 별도 실행 소유 해제 지시 후 위 제한 검수. 자동 실행/자동 재빌드 없음 |

공식 실행 순서 근거: [Unity OnRenderImage](https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/monobehaviour/onrenderimage), [Graphics.Blit](https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/graphics/blit). 현재 프로젝트의 `m_CustomRenderPipeline=0`, Gamma build 설정을 함께 확인했다.
