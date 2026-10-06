# Three.js 로컬 단일 런타임 — 2026-09-29

이 문서는 game.html과 game-easy-test.html의 Three.js 엔진 로딩·색상·배포 계약 SSOT다. 이전 안개 소실 보호/보스 GLB 수명 정리 단계의 r128+r160 중복 경고 기록은 당시 결과이며, 현행 계약은 아래 로컬 r160 단일 엔진으로 대체한다. ERR_INSUFFICIENT_RESOURCES 전체의 유일 원인을 증명하거나 장시간 메모리 누수가 모두 해소됐다고 판정한 작업은 아니다.

## 런타임 계약

| id / 적용 위치 | 현행 값·동작 |
|---|---|
| THREE-BOOT / three-runtime.js | 로컬 assets/vendor/three-r160/build/three.module.js를 dynamic import. window._threeReady가 있으면 재요청하지 않음. 성공 시 동일 namespace를 window.THREE에 저장하고 Promise가 해당 namespace를 반환 |
| THREE-MODULE / 두 HTML importmap | three → ./assets/vendor/three-r160/build/three.module.js, three/addons/ → ./assets/vendor/three-r160/examples/jsm/. classic boot와 boss/chest import가 같은 정규화 URL을 사용하므로 문서별 코어 인스턴스1개 |
| THREE-GRAPH / GLTFLoader | GLTFLoader.js → three 및 ../utils/BufferGeometryUtils.js → three. 실제 import 선언 기준 로컬 JS 의존3파일. 외부 CDN Three import 없음 |
| THREE-FOG / _fogGLStart | 기존500ms 시작 타이머 후 _threeReady를 기다리고 성공 시 _fogGLInit 호출. 기존 IS_MAC 및 navigator.gpu 제외 조건 유지. 안개 컨텍스트 소실 보호·shader·시간 증가·품질·resize 계약을 변경하지 않음 |
| THREE-VFX / 최종 classic IIFE | _threeReady 성공 후 기존 IIFE 시작. _v3fx/_v3render 등 기존 API·카메라·120 파티클 상한·pixelRatio1 유지 |
| THREE-FAIL / boot catch | 실패 시 [THREE] Local runtime unavailable; 3D layers disabled 경고 및 null 반환. fog/VFX 준비 콜백이 null이면 초기화 생략. 엔진 로딩 실패를 별도 2D 게임 초기화 Promise로 전파하지 않음. boss/chest 모듈 import 실패 자체는 브라우저 로드 오류로 남을 수 있음 |
| THREE-LEGACY / 보존 파일 | three.min.js 및 루트 GLTFLoader.js는 다른 도구/기존 배포 호환용으로 유지. 위 두 HTML은 three.min.js를 요청하지 않음. 전역 경고를 숨기는 수정 없음 |
| THREE-CONTEXT / 범위 | 라이브러리 중복만 제거. 보스·상자·안개·VFX의 WebGLRenderer를 하나로 합치거나 컨텍스트 수를 줄인 작업이 아님 |

## 색상 보존

| 적용 위치 | 값·공식 | 의도 |
|---|---|---|
| fog/VFX WebGLRenderer | outputColorSpace = THREE.LinearSRGBColorSpace | 기존 r128 셰이더/스프라이트 출력 채널 유지 |
| _v3legacyColor(string) | new THREE.Color().setStyle(value, THREE.LinearSRGBColorSpace) | 기존 #RRGGBB 및 rgb 문자열의 채널을 자동 sRGB→linear 변환하지 않음 |
| _v3legacyColor(number) | setHex(value, THREE.LinearSRGBColorSpace) | 숫자 hex 채널 유지 |
| _v3legacyColor(Color 등) | set(value) | 기존 Color 객체의 선형 RGB 복사 유지 |
| _v3addPart / SpriteMaterial | color:_v3legacyColor(opt.col||'#ffffff') | 기존 falsy 입력의 흰색 기본값 유지 |
| boss/chest | 기존 THREE.SRGBColorSpace 출력 및 기본 ColorManagement | 기존 r160 GLB·조명·색상 보존. 전역 ColorManagement 비활성화 없음 |
| UI/뷰포트 | HTML style·HUD 치수·resScale·zoom·카메라 수치 수정 없음 | 엔진 로딩 수정과 UI 크기를 분리. 브라우저 뷰포트 override도 사용하지 않음 |

## 벤더 원본·라이선스

패키지 three@0.160.0(r160), MIT. https://unpkg.com/three@0.160.0/ 의 아래 원본4파일을 변경 없이 저장했다. 로컬 경로 prefix는 assets/vendor/three-r160/. provenance.json에 원본 URL·버전·바이트·SHA256을 기록한다. LICENSE를 함께 배포해야 한다.

| 원본 상대 경로 | bytes | SHA256 |
|---|---:|---|
| `build/three.module.js` | 1272972 | `76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495` |
| `examples/jsm/loaders/GLTFLoader.js` | 108522 | `d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3` |
| `examples/jsm/utils/BufferGeometryUtils.js` | 31906 | `9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb` |
| `LICENSE` | 1081 | `852e0e8699169bf9f6fdc6bda3e682d078dcbc738b5d33e74df594721bff271d` |

## 빌드 계약

| 적용 위치 | 현재 구현 | 남은 배포 조건 |
|---|---|---|
| build-nwjs.mjs / FILES | three-runtime.js 추가. 기존 DIRS의 assets 복사로 코어·GLTFLoader·BufferGeometryUtils·LICENSE·provenance.json 포함 | 실제 NW.js 패키징/실행은 이번 작업에서 수행하지 않음 |
| tools/build-web.mjs / 필수 목록 | three-runtime.js 및 위 JS3파일 추가. 누락 시 staging 실패 | Git 추적 파일만 선별하므로 신규 boot/vendor 파일을 코드·docs와 함께 추적한 뒤 빌드해야 함. LICENSE·provenance.json도 assets에 포함 |
| .gitignore / 배포 소스 | 기존 전역 build/ 무시 규칙을 유지하면서 /assets/vendor/three-r160/build/ 및 그 안의 three.module.js만 negation으로 추적 가능하게 함. git check-ignore에서 코어가 제외되지 않는 것을 확인 | web staging 전에 Git 추적 필요 |
| 소스 제어 | 다른 작업의 staged/unstaged 내용 보존. 이번 작업 전 snapshot 및 소유 변경 패치 준비 | 현재 관리 권한의 .git 읽기 전용 및 exec launcher 장애로 staging/commit 미완료. 권한 우회 없음 |

## 검증 결과와 경계

| 항목 | 실제 결과 |
|---|---|
| 행동 테스트 | 신규5개를 추가한 red 단계16PASS/5FAIL 확인 후 resourceLoading21PASS. 관련5파일 합계35PASS/0FAIL |
| 추가 테스트 계약 | 반복 boot 단일 Promise/namespace, import 실패 null/경고, 지연 fog 준비와 null 생략, 실제 r160 색상 채널, 두 HTML canonical URL 및 로컬 import graph |
| 구문 | 두 HTML의 실행 inline script 각각6개 및 three-runtime.js/build-nwjs.mjs/tools/build-web.mjs 파싱 통과 |
| 실제 Chrome 두 HTML | 신규 격리 로컬 탭에서 native 키/건너뛰기 클릭으로 G.on=true 및 맵/HUD 표시. 코어 요청 각각1, three.min.js 요청0, unpkg Three 요청0, revision160, _threeReady 결과===window.THREE, 보스 pivot instanceof 동일 THREE.Group, 상자/VFX API 준비, fog renderer instanceof 동일 THREE.WebGLRenderer, fog ready=true/lost=false, 앱 warn/error 로그0 |
| 실제 창 크기 | main 관측2813×1262, easy 최종 관측2228×1262. 기존 사용자 창 치수를 그대로 읽었으며 뷰포트·프로필 배율을 설정하지 않음. 서로 다른 시점의 창 크기를 UI 변경 증거로 비교하지 않음 |
| 안개 GPU 대조 | 실제 _fogGLInit/_fogGLRender 코드, 256×128, 고정 시간1.25 후1회 draw. 각 RGBA131072 bytes에서 차이0/max0. 비영 채널116713, 합1597992 |
| VFX GPU 대조 | 실제 _v3addPart 및 Fire_BasicImpact.png의3×3 시트 frame0, 색상8개, 256×128. 각 RGBA131072 bytes에서 차이0/max0. 비영 채널19223, 합564705 |
| r160 안개 실제 GPU 복원 | WEBGL_lose_context로 소실/복원: lostReady=false/lost=true → restoredReady=true/lost=false, 동일 renderer/material, srgb-linear, programs1, GPU error0. 2228×1262 원래 창 크기에서 복원 전 저장된 비영 채널9745243과 복원 후 동일 고정시간 프레임의 차이0 |
| VFX QA 가시성 경계 | 기존 뒤집힌 Y 직교 투영+FrontSide 조합에서 r128/r160 모두 테스트 sprite가 culling되어 첫 비교는 투명했다. 해당 빈 출력은 검증 근거에서 제외. QA 페이지에서만 DoubleSide를 적용해 색상이 보이는 동일 장면을 비교했다. production material.side와 카메라는 그대로 유지. 전체 실제 공격 패턴의 가시성 검수는 별도 남음 |
| 런타임 검수 범위 | 메인/easy 신규 플레이 진입 및 공유 엔진·GPU 색상 동등성 확인. 장시간 연속 보스 전투·컨텍스트 전수 복원·전 공격 시각·Steam 설치 빌드 성능을 완료한 판정은 아님 |
| 외부 의존 경계 | 3D 라이브러리 CDN 의존 제거. 로비 인증/Google Fonts 등 다른 외부 의존의 전체 오프라인 동작을 검증한 작업은 아님 |
| 증빙 | tmp/three-single-runtime-20260929/의 before/, tests-red.txt, tests-green.txt, syntax.txt, docs-keywords.txt, verification.json, static-response.json, package-manifest.json, ui-preservation.json, compare.html 및 pixel-before.html/pixel-after.html. UI 사용 탭은 새로고침/종료하지 않고 생성한 검증 탭만 종료 |

후속 검수: production VFX의 mirrored-camera face culling 영향을 실제 공격 프레임에서 분리 재현하고, 기존 게임 시각을 확인한 뒤 별도 수정한다. 현 단계에서는 엔진 통일과 무관한 표현 변경을 섞지 않았다.


## 2026-10-06 캐릭터 2.5D 리깅 움직임 독립 시험 인수

| 항목 | 실제 반영 / 인수 경계 |
|---|---|
| 완료 ID | `CHARACTER-RIG-MOTION-TRIAL-20261006` |
| 코드 / 소비자 | `tools/rig-motion-lab.html`·`rig-motion-lab.mjs`·`rig-motion-controller.mjs` 3개. 기존 격리 `http://127.0.0.1:3387/tools/rig-motion-lab.html`의 독립 소비자에만 채택 |
| 실제 원자료 | 기존 Vinebound Sentinel GLB Idle/Walking/Running 3개, 총 25,468,812 bytes. skin1 / mesh1 / bones24 / clip별 tracks72. 전사·실버테일 원본 PNG와 본편 sprite 소비자는 그대로 |
| 표시 / 이동 | 정사영 고도50°, 표시높이2.2, 대기·걷기·달리기 0.22초 전환, WASD/방향키의 8방향 이동·회전, Shift 달리기, 뼈대 표시. 시험 이동속도1.35/2.8 units/s, dt상한0.05초, 축별 경계±3.35 |
| 런타임 / 실패 | 로컬 Three r160, renderer1 / mixer1 / 활성 RAF최대1. motion 보조 모델2개 해제. GLB·bind·shader 실패 때 ready=false / 입력·RAF 중단, 새 renderer·다른 외형 폴백 없음 |
| 실제 검증 | controller5/5, 격리 Chrome 실제 GLB·키 입력·화면11/11, 추가 crossfade·셰이더 실패 주입2/2 PASS. 초기 모듈2개 문법 검사 및 최종 renderer 모듈 문법 검사 통과. 성공 그룹 반복 실행 없음 |
| 화면 / 영상 | root가 걷기·관절 표시 실제 스크린샷2개 시각 확인. 실제 canvas에서 24fps 요청 / 3.2초 VP9 WebM 저장. 오디오·본편 native·1-1 인수는 이번 시험 범위 밖 |
| 남은 제작 | 주인공 동일 외형의 rig 원본 / 무기 socket, 발 IK·보폭, world→screen·앞뒤 가림·맵 광원, 공격 판정과 clip 시간, 실제 본편·성능 인수. 독립 모션 성공을 주인공 교체·A급 완성으로 계산하지 않음 |
| 보존 / 송신 | 본편·맵·기존 에셋·세이브·Q/E·보호2_3 수정0. 기존 두 오더담당 및 전문팀 송신 소유 유지. 사용자 최신 수동 요청의 캐릭터 지원 담당1 배정; 새 관리 채팅·Claude 실행 세션·자동화 재개0 |
| 상세 정본 | [전체 수치·원자료 SHA·구현·실제 QA·후속 게이트](../4.0케릭터스프라이트%20디자인/CHARACTER_RIG_MOTION_TRIAL_20261006.md) |

본편 boss overlay의 기존 수명·장면 계약은 변경하지 않았다. 이번 화면의 renderer1은 독립 문서의 수이며 본편과 함께 실행한 총 WebGL context 측정값이 아니다. GLB 원자료 핀과 shader fail-closed 계약은 상세 정본을 따른다.

## 2026-10-06 세외형 12본 · 지옥의 틈 통합 시험

완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 기존24본VineboundGLB 시험은 위 시점별 이력이며, 이번 `tools/2_5d-world-lab.html`에서는 **기존 전사·실버테일·다크드루이드 PNG에12본/1SkinnedMesh weighted plane**을 붙여같은지형에서 실제8방향·idle/walk/run/attack을 소비한다. 완전 입체 인체/주인공GLB 교체는 미구현 상태가 계속유효하다.

| 항목 | 현행 독립lab값 |
|---|---|
| 모듈 | character-rigs/catalog + visual-pose-consumer + actor-effect-lifetime + rift-terrain + 2_5d-world-lab |
| caller표시높이 | 전사.36/실버테일.36/드루이드.65units; API기본2.2와구분 |
| 원화 | 전사48/attack80px,실버idle/walk1254²원본manifest crop/attack80px,드루이드1656×1240 idle 및887×1774 walk/attack. 기존PNG29개byte/SHA불변 |
| 루프 | renderer1/RAF최대1,실제pose·rigupdate각1회; 이동260/470worldpx/s/dt.04,줌80…220% |
| 연동 | SKILL·ANIMVFX정정publicconsumer 실제채택. 공격1회edge수명.81/.81/.6초,최초foot앞뒤actor20/40-전경30 이력; 현행actor·주민·전경3=30+(footY-4320)/8000*10 동일transparentpass |
| 상태 | 실제원본/셀contracts502·browser9+8+13그룹·정지중3검사PASS. 맵확대흐림/hardseam으로VISUALRETOUCH,원본clipping·완전3D·양발IK·본편/native/청취/A급미인수 |

정확crop/원본29핀·수식·모션·UI・effect수명・검수・영상은 `../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md` 실제통합절을 따른다. 모듈별수치와원본/api/caller값을혼동하지않는다. 본편game/index/editor/이전rig-motion/사용자save와Q전용/2_3/어택티켓금지 보존.


실버테일16장1254²RGBA 고해상도텍스처는약96MiB GPU원본예산의desktop실험이다. decoder/mipmap/renderer총사용량·휴대폰/장시간성능을인수하지않았다. 현재선택배우만update하나texture는세캐릭터를로드한다. effect3×cap24/possiblepool72,OSreduced-motion livechange면3effect인스턴스재생성·기존meshdispose,추가RAF없음.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.

성능 범위: renderer1/RAF최대1/DPR≤2와dt≤.04 유지, 새cue 자체RAF/timer0/mesh2pool·pagehideunique자원해제. actual23check는장시간FPS나실물휴대폰성능인수가아님.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.


## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

이 부록은 현재 독립3387 public 소비자의 구현 상태다. 앞선 raw/fixture 완료 이력은 보존하며 본편/native·청취·보상save 완료로 승격하지 않는다.

| 현재 적용 | 값·상태 |
|---|---|
| NPC consumer | observation+pose 실제controller 연결 / 3actor 대화idle·공격취소 / 유품·부탁 각1 session-only / committedfalse |
| 늑대 consumer | 기존 JSON2+PNG16 실제decode / 8dir idle·walk0..2 / 빈3→같은dir idle / displayHeight.36 / preview6fps≠UNKNOWN metadataFPS |
| 자원·정렬 | 256²textures32/8,388,608B/atlas16close/추가RAF0 / `30+(footY-4320)/8000*10` |
| 검수·남음 | 이번 새25유효실WebGL 검수 / errors0 / RETOUCH; 큰맵흐림·실발·본편native6·청취·보상save 미인수 |
| 다음 | 기존 MAP owner의 선택NPC→2.5D entry adapter 제작; root editorbutton/labport 다음 최소연결 |

정확 API/범위/5code핀/새근거/§23 전체 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 같은 완료ID 부록을 따른다. raw52 checkpoint48fa4a43f95541ec3a1c9cc55c650aefdba2185a와 root public 파생 채택을 구분한다. MAP·ANIM LINK 선행guide위반은 보존했고 실제fullRead복구2/end2를 확인했으며 소급PASS0.


## 2026-10-07 ROOT-RIFT-EDITOR-ENTRY-CONSUMER-20261007 실제 에디터 왕복

이 절은 현행 에디터 연결을 갱신한다. 앞선 선택NPC→2.5D PENDING 기록은 당시 이력이다. 실제 editor3387의 선택 주민 버튼과 동일 origin iframe을 연결했고 네 주민의 진입·복귀를 관측했다. 본편/native6·청취·실제 보상/save·A급 인수는 여전히 미완료다.

| 현재 항목 | 정확 구현·근거 |
|---|---|
| 진입 | `editor.html`의 `scene-preview-25d` → `createEditorPreviewHost` → public `createEditorPreviewEntry` → 실제 `__rift25Lab.enterPreview`. 실제 `EXODUSER_SCENE_EDITOR.snapshot()/selection()/player()`와 workspace.inert 소비 |
| 선택·검증 | 매 클릭 fresh scene/선택; canonical 90767B의 actual registration await/동일성 확인; 정본읽기·검사 중 선택/scene 변경, 보행시험, 미지원 객체는 거절. 원 scene/nav1192/geometry/pixels/에디터History/save 쓰기0 |
| 접근점 | Haran4700,6660 / Berin6020,5540 / Nessa6300,4980 / Dorik5220,2460. NPC/object ID 일치·실worldbounds·nav radius12·nearestNpc.npcId 확인, 자동 대화0 |
| 화면·입력 | 모달 부모 keydown/keyup capture 전파차단(preventDefault0), nativeTab/Enter/Space/Escape 유지; iframe 내부키는 별도window. 성공 currentepoch 후 world-canvas focus, WASD와 R 실제관측 |
| 수명 | 새token/사용자이동/actor교체/reset 뒤 oldrestore 거절; 유효한 복귀는 원발5480,3740로1회복원. 닫기/visibility/pagehide는 취소·대기해제·iframe about:blank. 독립 RAF 추가0 |
| 새 검수 | public adapter stdin10 PASS 실제1회 / lab port 메모리9 PASS 실제1회 / 이번 실제Chrome18유효항목 PASS(기존25 재집계0), page/console/HTTP error0. host 최초테스트0였으나 root 실제화면 연결을 검수 |
| 실패 이력 | 최초GUI의 nearestResident 가정 때문에 Haran 판단FAIL. 실제필드는 nearestNpc.npcId이며 코드변경없이 실패항목과 미실행항목만 후속17PASS. 초기 지원주민없음 PASS1은 재검사0. 모달 shortcut P1/focus P2는 구현 전 정적검토에서 발견·수정 |
| 원자료 보존 | MAP 완료 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE`, officialend26736e4c-a55a-4193-91b1-22805e870bf5. raw누적52→53, raw 직접import0/후보미채택보존과 root 파생소비를 구분 |
| 시각·다음 | 전체그림1254² 확대 흐림, 절벽/전경 접합·실발/물리높이·전체8카메라/전투 인수 잔여. VISUAL VERDICT: RETOUCH. 다음은 원자료 증식보다 현행맵 실제재질·seam·본편최소연결 Gate |

근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-entry-*`: browser-result/followup-result/summary, modal/haran-canvas/return PNG, public-pins 및 preservation 영수증. 직전root59721dec0fcdfd7f054f8bbc9cfe63b1d2e86d6c 원격정확보존 이후 본 단위만 code+docs 정상commit/push하고 새정확HEAD는 외부영수증에서 확인한다. foreign68·ownerSTATELOG4 보존/새팀·세션·전문직접중복송신0/다른paused자동화·아침메일재개0. 24시간 연속제작·일별19시요약1회·제작중지0은 그대로다.


## 2026-10-07 ROOT-RIFT-CONTACT-VISUAL-GATE-20261007

| id / 적용 위치 | 정확 현행 계약 |
|---|---|
| 공개 모듈 / 핀 | tools/2_5d/rift-contact-underlay.mjs / 13198 bytes / SHA256 d6194d518e4e4a6100ea312ed14de1e3f4968dab56563a2247501c5d8b00aae2 |
| API | await createRiftContactUnderlay({THREE,terrain,enabled=false}) → object3d / setEnabled(boolean) / snapshot() / dispose(). 단일 async factory, prepare/reload 없음; source-nav hash 대기 후 terrain 수명 재검사. |
| 상태 / 채택 | ROOT-PUBLIC-EXPERIMENT. raw54 직접 import0; 결함 보정 derivative를 독립lab 비교 도구로 보존. VISUAL FAIL이므로 기본enabled=false; HTML cliff-contact는 unchecked. 본편 채택0. |
| UI consumer / 핀 | tools/2_5d-world-lab.html 11943 bytes SHA256 c55c498c01a84ac63a932ebfcd8296277bc6eb8e22264673a7083d5163e0465d; 경계 음영 비교 체크박스 cliff-contact. tools/2_5d-world-lab.mjs 32861 bytes SHA256 5a8bcfe054fa597822e0b44b3e3fd4725282bc710a62739385eaabcc5c392b1d. |
| canonical | grid200²/tile40/world8000/nav1192, source-nav40000 bytes 0/1/fullSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. sceneSHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a. 원본PNG·scene·nav·terrain geometry/3전경은 쓰기0. |
| 수직 UV / hard mask | source rowY 배열 / 글로벌 geometryUV(x/8000,1-y/8000), shaderSampleUV=(u,1-v). 원본 sourceNavByteEncoding=0/1; 별도 hardMaskByteEncoding=0/255, UnsignedByteType normalize→hardMaskNormalizedEncoding=0/1. Nearest Red40000 bytes, step(.5,sample.r) gate. 비보행38808칸 gate0, 보행1192칸 gate1. |
| band / 공식 | contactTiles1.5=60world, strength.42, distance=max(0,nearest nonwalk center tile distance-.5), alpha=distance<1.5?.42*(1-distance/1.5):0. Linear RGBA160000 bytes × Nearest hard gate. band574칸; actual centermax .28 / 8bit max71/255=.2784313725490196. 명목상한 .42를 실제max라고 계산하지 않는다. |
| 표시 순서 / 소유 | color0x05080a(329738), blend normal-dark, quad order6/lift1.25, depthTest=false/depthWrite=false/transparent=true/DoubleSide/toneMapped=false. owned texture2=200000 bytes+geometry1+material1=4; borrowed0; partial constructor/Hash-late/dispose/double-dispose 검사. ownRAF/timer0, source/scene/nav/savewrite0. |
| GPU 검수 | lab foregroundShaderPrograms canonical1 및 contactShaderPrograms 양면2, renderer.compile 후 실제 gl.LINK_STATUS=true를 별도 검사. cacheKey rift-contact-underlay-linear-band-nearest-nav1192-v2. snapshot.shaderRegistered/Calls는 shader injection만 뜻하며 GPU link PASS를 대신하지 않는다. 초기 root가 양면 프로그램2를1로 가정한 acceptance 오류로 GUI0 FAIL; 실제2linktrue 진단 후 cardinality2로 수정, 실패영수증 보존. |
| 신규 CPU 검수 | 실제 Three r160 stdin18 PASS에는 0/1 GPU normalized byte blind spot이 있었다. 이후 수정된 별도 제한stdin5 PASS에서 actual DataTexture byte/255와 gate, UV, sourceSHA를 확인. 이전18 PASS를 실제 alpha 표시 증거로 승격하지 않는다. |
| 신규 실제 화면 검수 | contact actual WebGL·OFF/ON 동일 남/동/북 카메라·정본/무오류 6 PASS + default OFF와 실제2link 1 PASS. 별도 canonical 복원 GPU1 PASS. 과거 editor18/NPCwolf25 재실행·합산0. pageerror0/4040. |
| 시각 결과 | OFF/ON 남119106·동104434·북106164 pixels가 바뀌나 nav 경계를 계단형 얼룩으로 노출하므로 접촉 음영 VISUAL VERDICT: FAIL. 실제 clip이 그림 속 절벽 발과 일치하는 접지 음영 인수는 실패했다. 기본OFF로 기존 화면 보존. 전체 맵 VISUAL VERDICT: RETOUCH, 원본1254² 확대흐림/입체높이/본편 인수 미해결. |
| 외부 근거 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/contact-* PNG/result/pixel-comparison, before-contact-* 백업, restored-foreground-gpu-result.json. fixture/raw/lab≠본편/native6/청취/실보상save/A급. |
| 다음 승인 단위 | 기존 Claude8→MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP(신규 rift-main-entry-gate.candidate.mjs1). peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z, source Bash toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 정식 end/pin 대기이며 수신·검색만으로 전체 선행Read/완료/본편연결을 계산하지 않는다. |

MAP PRODUCTION REPORT
- STAGE: 지옥의 틈 보행 경계 contact-shade 비교 / 기본OFF.
- MASTER: 기존 비대칭 실루엣/남→북 main route/주민 side spaces·regions 유지.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 major holes 원화 불변.
- LARGE: source assets·3전경 composites/crop·overlap·repeated silhouette 변경0.
- MEDIUM: connections/remaining holes 변경0.
- GROUND: shadow 비교는 계단 nav 얼룩으로 FAIL; contamination/structure integration 기본OFF로 기존 보존.
- PLAYABLE: nav1192 travel/breathing space 유지; main arenas/threat/combat readability 본편 인수 PENDING.
- LANDMARK: primary 상승문·secondary 균열·tertiary 주민 그대로.
- CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 같은 카메라 OFF/ON. START/초반/ARENA/SIDE L/LATE/EXIT 전체 본편 인수 PENDING.
- TECH QA: route/collision 불변; pageerror0/4040; loading7실관측 PASS; seam 시각 FAIL; performance 정량 인수 PENDING.
- FILES: root public module1 + labhtml/mjs2, concurrent/unrelated touched0.
- GIT: completed-owned code3+동기화docs 정상commit/push 및 remote exact SHA는 외부영수증에서 확인; deploy0.
- VISUAL VERDICT: FAIL(음영 ON), RETOUCH(전체 맵 / 기본 OFF).
- NEXT PASS: nav 셀을 실제 그림 속 절벽 발로 취급하지 말고 authored foreground 접합 위치/부드러운 실제 경계 검수; 별도 본편 entry gate→실제 NPC 왕복→보상/save atomicACK 단위.


## ROOT-RIFT-MAIN-HOST-PUBLIC-20261007 — 독립 main-context iframe host 현재 계약

독립 iframe child의 기존 Three/WebGL/RAF 소유권을 parent DOM host가 침범하지 않는 실행 수명을 기록한다. 새 parent renderer/RAF를 만들거나 borrowed renderer를 정리하지 않으며, 실제 GPU link와 UI 관측을 전체 맵 해상도·성능 인수와 구분한다.

### 실행 API·입력·수명 계약

이 절의 문서 marker는 `ROOT-RIFT-MAIN-HOST-PUBLIC-20261007`이며, 코드 `MAIN_RIFT_HOST.completionId`는 `ROOT-RIFT-MAIN-IFRAME-HOST-20261007`이다. public host 구현과 별도 진입 gate의 구현·본편 채택은 다른 범위다. 이번 host 검수는 실제 editor3387에서 모의 main-context를 공급한 독립 표시/복귀 검사이며, 본편의 lexical `P/G`와 stage-clear 경로 연결을 인수하지 않는다.

| 항목/API | 현행 코드 계약·수치 | 소유·판정 경계 |
|---|---|---|
| 최종 source | `tools/2_5d/main-rift-host.mjs`, 17683B, SHA256 `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38` | 이전 `6cd3…` 화면 검수와 최종 핀 제한 검수를 구분 |
| factory | `createMainRiftHost({document,window,readContext,timeoutMs,pollMs}) → {enterRift,cancel,dispose,snapshot}`; 반환 API는 shallow frozen | 기본 document/window는 globalThis; document.body/createElement, window.setTimeout/clearTimeout, readContext 함수 필요 |
| host URL | `MAIN_RIFT_HOST.labPath='tools/2_5d-world-lab.html'`, 루트 상대 URL; `allowedPort='3387'`; http 또는 https, 부모/child 동일 origin·정확 pathname | 다른 포트/외부 origin 사용 불가; 본편3333/3340·사용자 save 조작0 |
| 준비 timeout | 기본 `timeoutMs=30000`ms; finite Number `100..60000`ms inclusive, 정수 강제 없음 | loading 상태에만 시간 초과 적용; active 상태의 총 체류 제한 없음 |
| poll | 기본 `pollMs=100`ms; finite Number `20..1000`ms inclusive, 정수 강제 없음; 최초 poll 예약 `0`ms | record마다 outstanding timer 최대1; 자체 RAF0; performance.now() 있으면 사용, 없으면 Date.now() |
| 부모 context 반환 | 동기 own-data plain `{player,character,stage,context,on,stageCleared,status}`; 부모의 정확 Object.prototype 또는 null prototype만 허용; 배열·custom prototype·own `then !== undefined` 거절 | Promise/thenable/필드 accessor 거절; `readContext` 재진입 거절, 예외 시 fail closed |
| player / character | `player`: non-null object, 배열 불가; `character`: 길이>0 string | 실제 lexical caller가 공급해야 함. player 내부 속성·좌표/캐릭터를 host가 deep 검사/복사/child로 전송하지 않음; whitespace-only character도 코드상 거절 규칙 없음 |
| stage / context | `stage`: Number integer≥0, host 자체 상한 없음; `context`: non-null object 또는 string/boolean/finite Number | opaque identity를 엄격 `!==`로 비교하며 object 내부 변경 감시는 없음. 실제 TOTAL_STAGES/difficulty/_charId 허용 계약은 caller gate 책임 |
| on / stageCleared | 정확 `on===false`, `stageCleared===true` | 미클리어·truthy 대체값으로 admission 통과0; host가 G 필드를 만들어 넣지 않음 |
| status | undefined/null 또는 string/boolean/finite Number; 정확 문자열 `dead`, `fallen`, `reviving`, `lastStand` 거절 | 다른 허용 primitive status는 그대로 identity 비교; 사망/부활 의미의 본편 통합 gate와 별도 |
| active context 확인 | 매 poll마다 위7필드를 새 own-data context로 읽고 초기값과 `!==` 비교 | player/context 참조, character/stage/on/stageCleared/status 변경 또는 읽기 실패 시 취소; 부모 객체 쓰기0 |
| enterRift | `enterRift(onExit) → Promise` (resolve: handle 또는 null); onExit 함수 필수. disposed 또는 document.hidden이면 null | 초기 context 거절은 UI 생성0·null; return handle은 표시 준비 증거이며 continue/nextStage job 아님 |
| 중복 호출 | current loading/active에서 같은 onExit 함수+같은 fresh context이면 동일 job 반환, 추가 iframe0 | 다르면 `superseded` 종료+알림 뒤 이번 호출 null; 새 admission의 명시적 재호출 필요 |
| 재시도 | failed record가 있으면 `failed-retry`로 정리 후 새 context 검사·새 token 발급 | 오류 dialog 보존은 valid gate handle을 뜻하지 않음 |
| child port | own `__rift25Lab`의 own `snapshot` 함수 호출; 반환은 정확 `child.Object.prototype` 또는 null prototype의 동기 plain own-data | 같은 origin iframe도 별도 realm. 부모 Object.prototype과 억지 비교하지 않고 custom prototype은 계속 거절 |
| 준비 성공 | child snapshot `ready===true`, error falsy, disposed/contextLost 정확 true 아님; 현재 record의 loaded/path/identity 유효 | active 상태 `ready!==true`, port 상실 또는 경로 변경은 실패; child snapshot truthy error도 실패 |
| handle | once-owned frozen `{restore(),dispose()}` | restore는 최초만 close `restored`, 반복/해제 후 false. dispose 최초 true·반복 false; 이미 restore된 handle의 최초 dispose도 true일 수 있으나 재종료0 |
| 늦은 handle / focus | handle은 자기 record만 닫음; settle은 record별1회, 이미 닫힌 record 재정리0 | 기존 연결된 focus 대상·같은 ownerDocument·fresh sameContext·더 새 current가 없을 때만 focus 복원; 새 token의 dialog/focus 침범0 |
| close cleanup | own timer clear, iframe load/error 및 dialog cancel/close listener 제거; own iframe src=`about:blank`, own dialog close/remove | child가 기존 pagehide에서 WebGL/RAF/resources 정리; parent가 borrowed renderer/DOM을 dispose하지 않음 |
| onExit | 사용자 종료·자동 취소/로드 실패를 record별 최대1회 통지; sync throw 또는 returned rejection은 `notificationErrors++` | callback 반환을 기다려 continue하지 않음. restore/handle.dispose/cancel/host.dispose는 notify0; 실패 알림 `load-failed`는 오류 dialog를 자동 제거하지 않음 |
| cancel / dispose | `cancel()` → current close `cancelled`+focus 복원 요청, notify0; 없으면 false. `dispose()` 최초 true, 반복 false; `host-disposed`, own listeners 제거 | module dispose는 focus 복원0·notify0. pagehide는 dispose 호출; 부모 blur 취소 listener0 |
| 실패 formatter | Error의 non-empty string message만 사용; instanceof 또는 message getter 예외도 catch; fallback `UNKNOWN · 지옥의 틈 표시 실패` | null throw/악성 message getter 때문에 settlement/cleanup가 깨지지 않음 |
| 실패 UI | phase `failed`, timer0, Promise null로1회 settle, leaf status에 오류 표시, exit leaf를 `닫기`로 교체 | 검토용 own dialog는 유지; 유효 handle/본편 완료로 승격0 |
| 입력 keyboard | 부모 capture keydown/keyup에서 current가 살아있으면 stopImmediatePropagation; Escape keydown&&!repeat는 preventDefault+종료 | Tab/Enter/NumpadEnter/Space는 native 동작 보존; 그 외 preventDefault. child iframe 이벤트는 별도 window이며 부모에 bubble하지 않음 |
| 입력 pointer | capture/passive:false 9종: pointerdown, pointerup, mousedown, mouseup, click, dblclick, touchstart, touchmove, wheel | own exit의 click만 user-exit; exit/frame 외 대상 preventDefault. listeners는 module dispose에서 제거 |
| visibility / blur | 실제 document.hidden이면 `parent-hidden`; pagehide는 host dispose; 부모 blur만으로 취소0 | native parent blur 관측 PASS; 실제 hidden 전환은 이번 headless 검수 SKIPPED, synthetic PASS 대체0 |
| 부모 hotpath 미인수 | `inputLimitations='already-held keys/gamepad/earlier same-window capture remain caller-owned'` | 기존 held key/gamepad polling/update·먼저 등록된 capture의 격리는 caller 후속. host만으로 main simulation/input freeze 완료0 |
| 렌더/대화 scope | `ownsRenderer=false`, `ownsRAF=false`, own iframe 최대1; child가 기존 renderer/RAF를 소유; `automaticTalk=false` | 자동 NPC 대화0, child 기본 독립 actor 유지. `childCharacterLinked=false`; parent 캐릭터·선택 주민을 child에 이식한 구현 아님 |
| 쓰기/인수 flag | `mainAccepted=false`, `nativeAccepted=false`, `saveWrites=false`, `rewardWrites=false`, `nextStageCalls=false`, `parentStateWrites=false`, `borrowedDomWrites=false` | 실제 유품grant/durable ACK/save/native6/audio/A급 인수0; host 복귀가 다음 stage 진행을 뜻하지 않음 |

### phase·reason·고정 오류 표시

| 분류 | 정확 값·조건 |
|---|---|
| public phase | current가 없으면 `idle`; current는 `loading`/`active`/`failed`. 내부 record의 `closed`는 close 후 current가 null이므로 public snapshot에서는 idle |
| 닫기 reason | `restored`, `disposed-handle`, `user-exit`, `user-escape`, `dialog-closed`, `parent-hidden`, `parent-context-invalid`, `parent-context-changed`, `owned-dialog-detached`, `superseded`, `failed-retry`, `UI-create-failed`, `cancelled`, `host-disposed` |
| 로드 실패 알림 | `onExit('load-failed')`; snapshot.reason/error에는 실제 오류문구. reason은 고정 enum만 있는 필드가 아니며 loading/ready text·Error message도 보존 |
| context 오류 | `UNKNOWN · host 객체 필요`; `UNKNOWN · host accessor: <key>`; `UNKNOWN · <label>`; `UNKNOWN · <label> plain 동기 객체 필요`; `UNKNOWN · readContext 재진입 금지`; `UNKNOWN · 부모 클리어/정지/identity admission 불일치`; `UNKNOWN · 부모 status primitive 필요`; `UNKNOWN · 부모 status 유한수 필요`; `UNKNOWN · 부모 사망/부활 중` |
| factory/UI 오류 | `지옥의 틈 host 의존성 필요`; `지옥의 틈 대기 수치 범위 오류`; `지옥의 틈 host는 격리 동일 origin 3387만 지원합니다`; `동일 origin dialog API 필요`; `지옥의 틈 onExit(reason) 알림 함수 필요` |
| child/시간 오류 | `지옥의 틈 iframe 로드 실패`; `지옥의 틈 활성 iframe 경로 상실`; `지옥의 틈 iframe origin/경로 변경`; `지옥의 틈 활성 port 사라짐`; `지옥의 틈 snapshot port 없음`; `지옥의 틈 표시 실패 · <error 또는 context/disposed>`; `지옥의 틈 활성 준비 상태 상실`; `지옥의 틈 준비 시간 초과` |
| 초기/ready leaf | 초기 `독립 화면 준비 중 · 본편 저장과 보상은 변경하지 않습니다.`; ready `독립 2.5D 공간 · NPC 대화는 직접 시작 · 본편 캐릭터/보상 연동 미인수`; formatter fallback `UNKNOWN · 지옥의 틈 표시 실패` |

### snapshot·DOM·자원 규격

| 항목 | 정확 현행값·수명 |
|---|---|
| snapshot 반환 | shallow frozen; `disposed,active,pending,phase,token,iframeLoaded,ownedDialog,ownedIframe,ownedTimers,parentStage,parentCharacter,reason,error,completed,cancelled,notificationErrors`, MAIN_RIFT_HOST 상수, override timeoutMs/pollMs 및 inputLimitations/parentStateWrites/borrowedDomWrites/childCharacterLinked |
| snapshot default | current 없음: phase idle/token null/iframeLoaded false/ownedDialog false/ownedIframe false/ownedTimers0/parentStage·parentCharacter null. active/pending는 phase 비교, ownedTimers는0 또는1 |
| counters | sequence 초기0/새 record token마다+1; completed는 ready handle 수이며 main 완료 수 아님; cancelled는 close reason restored/disposed-handle 외 +1; notificationErrors는 onExit throw/rejection 수 |
| 소유 DOM | 새 dialog/header/strong title/span status/button exit/iframe만 생성·삭제. dataset.mainRiftHost=token string; aria-labelledby/title ID `main-rift-host-title-<token>` |
| 기존 leaf 수정 | status/exit는 `children.length===0` 확인 후 textContent 교체; 부모 컨테이너 내용 교체0; 새 leaf의 초기 textContent는 생성 시 설정 |
| dialog style | width min(1400px,96vw), height94vh, max-width96vw, max-height94vh, margin auto, padding0, border1px solid #8c7851, radius14px, background#080d10, color#e7dfca, shadow0 28px 90px #000b, overflow hidden |
| header/status style | header height62px/gap18px/padding0 20px/bottom-border1px solid #384344/background#101719. status flex1/font13px/1.5 system-ui/color#aab9b5/role status/aria-live polite |
| exit/frame style | exit padding9px 16px/border1px solid #8c7851/radius7px/background#202b2a/color#efe3bc/cursor pointer/font600 14px system-ui. frame display block/width100%/height calc(100% - 63px)/border0/background#080d10 |
| UI label | title `지옥의 틈 · 격리 표시`; iframe.title `지옥의 틈 독립 2.5D 표시`; 정상 exit `돌아가기`, failed exit `닫기`; 준비 중 exit focus, ready child window/world-canvas focus는 optional |
| 자원 책임 | host의 own DOM/listeners/timeout만 host가 정리. child renderer·WebGL texture/geometry/material·RAF는 child의 기존 pagehide 수명 책임; parent renderer 재생성·차용dispose0 |

### 실제 증거·검사 핀 분리

영수증 폴더는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-host/`이다. 아래 실행은 서로 다른 코드 핀/범위다. 기존 memory16, 최초 FAIL, GUI14와 최종 제한4를 합쳐 새 총 PASS 숫자를 만들지 않는다.

| 실행/자료 | 실제 결과·코드 핀 | 해석 |
|---|---|---|
| browser-result.json | 최초 실제 iframe 실행 FAIL, checks0; child realm Object.prototype를 부모 prototype으로 판단하여 정상 ready 거절 | 첫 실패1회 원본 보존. PASS로 재분류0 |
| browser-fixed-result.json / screen-review.json | 이전 source17466B SHA `6cd3a13627e5eeccd8484ca843ec29ff1255ede47e1a8299493d65405367d0e6`; 새 고유 실제 browser14 PASS | cross-realm 허용 수정 뒤 실제 editor3387/모의 main-context 검사; 최종008a…에 GUI14를 다시 실행했다고 표기0 |
| 14검사 관측 범위 | own modal/iframe1·중복open0, 실제 WebGL2 CURRENT_PROGRAM/isProgram/LINK_STATUS, childfocus/실제 trusted 부모blur, editor scene/selection/view 보존, Tab·Enter·Space native controls, parent Delete/CtrlZ/CtrlS 격리, Escape/Enter 복귀, stale context, midloadcancel, injected503/timeout, 외부쓰기/미예상오류 경계 | 실제 GL link 관측은 시각/A급 인수와 별도. 당시 canvas1034×713·frames15는 관측값이며 renderer 고정 규격 아님 |
| 실패 주입·오류 | expectedHTTPFailureInjections1(HTTP503), firstFailureAttempts1; fixed run failure null, 미예상 pageErrors0·외부요청0·mutationRequests0·downloads0 | 예상503 HTTP/console 기록을 제거하거나 전체HTTP오류0이라고 쓰지 않음 |
| error-formatter-limited-result.json | 최종 source17683B/SHA `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38`; 신규 negative2 PASS + 최종 source 정상GUI 진입/복귀2 PASS; errors0/failure null | message getter throw/null throw의 admission·owned cancellation 검수2와 normal entry/restore/disposal2만 실행; 이전 memory16/GUI14 재실행·합산0 |
| hidden / blur | nativeParentBlurObserved true; nativeHiddenTransition SKIPPED: 실제 hidden 전환 미유도, synthetic 검수로 계산0 | blur-only 취소0은 관측, hidden cleanup은 코드 계약이며 실제 관측 인수로 승격0 |
| entry.png | 1600×1000, 909641B, SHA `9db547beabfd1cfd5f9b2511b34aa65c44fae53ecbba6aa75e28f6eff90c7ff7` | 이전6cd… 실제 화면: 전사·늑대·기존 lab canvas·오른쪽 controls·돌아가기 표시, blank/error 없음 |
| return.png | 1600×1000, 1229882B, SHA `96c7f995856d003b30da4e9310a76568d65edb603c23261399c4f892a7dec44b` | 이전6cd… 실제 복귀 화면: 기존 editor 하란 선택 유지, own modal/iframe 제거, focus 복귀 |
| 화면 판정 | screen-review.json의 hostUIVisualVerdict PASS / mapVisualVerdict RETOUCH | 호스트 UI 표시/복귀만 PASS. 1254² clean plate의 확대 흐림은 그대로이며 terrain 선명도·접합 개선 claim0; contact 실화면 FAIL/defaultOFF 이력 유지 |
| 현재 미인수 | actualMainGame=false, durableGift=false, saveAccepted=false, native6Accepted=false, audioAccepted=false; mainAccepted/nativeAccepted false | durable reward ACK·실제 저장·6단계 native route·청취·A급·본편 캐릭터 연동 완료0 |

### 본편 접점과 다음 소비자 경계

| 구분 | 이번 확정 상태 | 다음 책임 |
|---|---|---|
| public host | 독립 own DOM/iframe의 준비·입력 focus·오류/취소·복귀 수명 구현 | separate public gate는 이 절에서 import/완료/본편채택으로 단정하지 않음 |
| editor selected-NPC host | 기존 `createEditorPreviewHost`의 editor selection→접근점 preview 계약 유지 | `createMainRiftHost`가 선택NPC payload를 보내거나 그 host를 대체한 것으로 표기0 |
| 본편 caller | lexical player 객체·character string·stage integer·context identity·onfalse·stageClearedtrue를 readContext로 공급해야 함 | 현재 모의 context 검사에서 actual main P/G/캐릭터 이전 완료로 승격0 |
| current1-1 DEMO | 기존 `_DEMO_MODE=true`, `_DEMO_LAST_STAGE=0`, nextBtn의 demo 분기가 `_proceedNextStage` 일반 접점을 우회하는 경계 유지 | host만으로 1-1→틈 진입 완료0; DEMO 분기·SP10 clear보상·bossretry/_preArenaBackup 변경0 |
| 전환/입력 후속 | 5초 showStageTransition callback/900ms curtain, job/epoch·P/G/_charId(null 정상)/_charIdx/stage/difficulty·held/gamepad/update 격리 본편 인수 PENDING | host return≠continue job. 취소/실패 뒤 자동nextStage0, 실제 캐릭터port·내구 save ACK/native6/audio는 별도 검수 |

### MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 범위·관측 |
|---|---|
| STAGE | 독립 지옥의 틈 main-rift own DOM/iframe public host의 실제 editor3387 표시/복귀·문서 동기화; 본편 gate 인수 단계 아님 |
| MASTER | 기존 상승 여정/지옥의 틈 silhouette·구역·main route·side space 계획 그대로; 계획 geometry 추가0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 및 major opening 이미지/외곽 geometry 변경0; 기존 기준 재제작/새 시각검수0 |
| LARGE | source PNG/대형 composite/overlap/repeated silhouette 수정0 |
| MEDIUM | 연결 부품·미해결 구멍 경계 변경0; 이 host로 접합 문제가 해결됐다고 표기0 |
| GROUND | nav1192·ground source·접지/오염/구조물 연결 geometry 변경0; 기존 contact FAIL/defaultOFF 및1254² 확대흐림 유지 |
| PLAYABLE | owned iframe input/focus/lifetime만 구현·검수. main arena/travel/breathing/threat/combat-readability·본편 held/gamepad/update 인수 PENDING |
| LANDMARK | primary/secondary/tertiary landmark 좌표·배치 변경0 |
| CAMERA QA | 실제 entry/return1600×1000 두 화면만 검토. START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT의 새 본편 종주·8시점 QA 미실행 |
| TECH QA | 첫 realm FAIL0체크 보존; 이전6cd… 실제GUI14 PASS; 최종008a… negative2+normalGUI2 PASS 별도. route/collision/nav 신규검사0; expected503/loading/취소 경계만 해당 범위 관측, seam/performance/full native QA PENDING |
| FILES | root public host code1과 관련 문서4가 완료소유 범위. 문서 담당은 지정4개 append만; concurrent source/raw/STATE/LOG·무관파일·이미지·game/editor/nav 수정0 |
| GIT | 이 문서 담당의 stage/commit/push/deploy0. root가 최종 host code+관련 docs를 소유 완료 단위로 보존; 이 절만으로 원격 SHA/push 성공을 선언하지 않음 |
| VISUAL VERDICT | **RETOUCH** — host UI 표시/복귀 화면 PASS, 전체 맵 확대흐림 미해결. contact ON의 이전 실화면 FAIL/defaultOFF와 구분 |
| NEXT PASS | 실제 main lexical admission·DEMO1-1 접점·held/gamepad/update·callback/curtain epoch·child character·save/reward ACK/native6/audio의 별도 구현·실검수. 기존 source/nav/보호2_3/Q 전용패링/어택티켓금지 보존 |

## ROOT-RIFT-LAB-DPR-RESIZE-20261007 — resize 시 현재 DPR 재평가

이 절은 독립3387 lab의 DPR 갱신 구현 상태다. 직전 해상도 원인 표의 “lab resize DPR 재평가 미구현”은 수정 전 source 관측으로 보존하며 현재 상태는 아래 표를 따른다. 원판1254² 확대 흐림·2D maskedPicture1024 버퍼·contact ON 시각 FAIL/defaultOFF는 별개의 경계로 유지한다.

### 선행 문서·수정·수명 계약

| 항목 | 실제 현재 계약 | 보호·미인수 경계 |
|---|---|---|
| 이번 TASK 선행 | _MAP_SSOT_INDEX 전체1…961행, EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9 처음부터끝, AGENTS 전체, CH1_1_BLOCKOUT_MASTER의 LOCK 전체를 이번 구현 전 실제 다시 읽음. 출력 잘림 구간은 재독하여 누락을 보완 | 이전 TASK 읽기를 이번 선행 Read로 소급하지 않음. 독립 틈의 현재 정본·원본핀 우선, CH1 원본 LOCK·보호2_3/Q전용·어택티켓금지 유지 |
| 소유 코드 | tools/2_5d-world-lab.mjs의 resize()에3줄 추가, 현재33105B/SHA 2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12 | init·shader·terrain·nav·원화·child키·host/gate·기존 JSON·main/game/save 쓰기0 |
| DPR 입력 | resize마다 globalThis.devicePixelRatio를 현재값으로 읽음. typeof number·Number.isFinite·값>0인 경우 Math.min(값,2), 나머지1 | 유효 양수 소수는 반올림/최소1 강제0. undefined·문자·NaN·Infinity·0·음수는 fallback1. 새 옵션·저장값0 |
| 적용 | renderer.getPixelRatio()가 새 pixelRatio와 다를 때만 renderer.setPixelRatio(pixelRatio). 그 뒤 기존 setSize(width,height,false) 유지 | 같은 DPR에서 pixelRatio setter 재호출0. 새 renderer/RAF/timer/ResizeObserver·DPR watcher 추가0 |
| 기존 초기화 | 초기 devicePixelRatio가 falsy면1로 대체한 뒤 cap2인 기존 초기 setter 유지. 최초 startup resize가 현재값에 위 엄격 검증을 적용 | 정상 browser DPR에서 초기화·resize의 cap2 정책 동일. 초기 setter 줄 자체를 변경하지 않았으며 비정상 전역값의 초기 WebGL 생성 인수는 없음 |
| 크기·카메라 | parent bounding rect를 기존대로 Math.round하고 각 width/height 최소1. 기존 setSize(...,false), 정사영 기본 높이3.5·half1.75·50°/scale400·zoom100% 그대로 | scene/world8000²/nav1192/UV/sourcecrop/주민발/start/exit·화면비율/등록 변경0 |
| 갱신 진입점 | 기존 ResizeObserver 또는 확대 range input이 resize를 호출할 때 DPR 갱신 | CSS 크기가 그대로인 모니터 이동/DPR만의 변화가 기존 observer를 자동 깨우는지 미인수. 별도 window resize/matchMedia listener·polling 추가0 |

### 이번 신규 실제 Chrome 실험1회

설치된 Google Chrome을 headless로 launch1/context1/top editor page1/lab iframe1 실행했다. origin은 127.0.0.1:3387이며 기존 서버를 사용했다. fresh editor 위 QA iframe에서 실제 lab module을 로드하고 대기 pose를 정지한 뒤 CDP Emulation.setDeviceMetricsOverride의 실제 deviceScaleFactor를 바꿨다. DPR 전환 뒤 기존 zoom range의 input 경로를 호출해 resize를 실행했다. 이는 실물 모니터 이동이나 브라우저 UI 줌 자동 이벤트 인수가 아니다.

| 관측 | 현재 window DPR | renderer 기대 배율 | canvas·GL drawing buffer | CSS·안전 조건 |
|---|---|---|---|---|
| CDP1 | 1 | 1 | 1036×714 | 실제 canvas CSS1034×712.46875, parent1036×714.46875·logical1036×714 |
| CDP2 | 2 | 2 | 2072×1428 | CSS·원pose·source 등록 동일 |
| CDP3 | 3 | cap2 | 2072×1428 | DPR>2에서 최대2 유지, 신규 GPU resource 추가 선언0 |
| CDP 소수 | 1.25 | 1.25 | 1295×892 | Three backing 차원 floor 때문에 Y실측892/714=1.2492997198879552; 소수 DPR을1로 자르지 않음 |
| WebGL | 위4관측 각각 현재13개 program | 모두 actual gl.LINK_STATUS=true | GLerror0/contextLostfalse/readytrue | shader snapshot 등록 플래그만으로 LINK PASS 대체0 |
| 오류·요청 | pageerror0/consoleerror0/HTTP400이상0 | 외부요청0·nonGET0 | 새 API/save 호출0 | 사용자게임3333/3340·앱3381/3383/Windows·새 서버/빌드0 |
| 불변 | 전사5480/3740·idle·방향0·pausedtrue·zoom100, contactOFF | terrain snapshot exact동일 | editor scene JSON exact동일 | 원source/scene/nav/발·기존camera/source 보존 |
| fallback 별도 | 같은 launch에서 window DPR 값을 NaN/Infinity/0/−1/string/undefined로 임시 주입한6조건 | 모두 fallback1 | 1036×714 및 GLerror0 | synthetic invalid-value 관측이며 실제 장치 DPR6개로 계산0. 원 descriptor 복원 |
| 검수 묶음 | 새로운 DPR launch1에 CDP4단계+synthetic6조건, 제품 source 수정 뒤 syntax actual1 PASS | 실패0·이전 성공 suite/Chrome/native6 반복0 | DPR와 아래 parent lease 검사 합산0 | 새 repository 테스트·PNG source·asset 생성0 |

parent rect는 기존 border 포함 값이고 canvas CSS는 border를 제외한 실제 표시 크기다. ratio는 logical rounded dimensions와 실제 CSS denominator를 구분하며 정수 DPR에서 backing/logical 각1·2·2, 소수 Y는 floor 오차다. 새로운 정사영/world→CSS 배율 공식이나 Three zoom1.2를 editor zoom1.2와 같은 배율이라고 정의하지 않는다.

### 실제 화면·해상도·채택 경계

| 항목 | 확인한 값·판정 |
|---|---|
| 화면 근거 | dpr-resize/dpr-1-canvas.png·dpr-2-canvas.png·dpr-3-canvas.png를 작업자가 실제 열람. CSS 기준 screenshot1034×713 각1장. DPR2/3 캡처는759209B/SHA231773da6f5fb9f6b0b25731a757af97db6ee11731560a55353bdef843a258fe exact동일 |
| 화면 판정 | 전사·늑대·바닥·전경 배치 유지와 DPR buffer/cap 동작 확인. 원화 지면·뿌리의 확대 softness는 남음. VISUAL VERDICT: RETOUCH |
| 원화 밀도 | cleanplate1254²→world8000², 8000/1254=6.379585326953748worldpx/sourcepx. source PNG·UV·crop·정적 재질/절벽 depth 추가 수정0 |
| 별도2D 문제 | map-scene-editor.js maskedPicture 장축1024 임시 buffer와 alpha256 sample은 변경0. MAPraw62 prerequisiteFAIL·public 미채택 상태 유지 |
| 별도 실패 | arrival-detail 전체지형 등록 FAIL·contact ON 실화면 FAIL/defaultOFF 유지. 이번 DPR 통과로 접합/ground registration/physical height 개선 완료 선언0 |
| 미인수 | 실물 모니터 transfer·브라우저 UI zoom 자동전환·native6 여정/청취/실보상·영구save·본편 main 연결·장시간FPS·A급 인수0 |
| 전체 docs 검색 | 코드 수정 뒤 docs 전체 확장자 포함 DPR/devicePixelRatio/pixelRatio/2_5d-world-lab 및 해상도 키워드 검색141files/1035matches. own3 current appendix, 관련 root7문서 후속 인계, 타시스템/ownerSTATELOG/과거 영수증은 보존 |
| 외부 영수증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/dpr-resize/receipt.json, browser-result.json, screen-review.json, syntax-result.json, docs-keyword-search.txt, docs-search-disposition.json. 코드·문서 수정전 exactbytes backup 및 prefix 대조 |

### 별도 public parent 입력 lease의 현재 경계

아래는 root가 별도 구현·검수한 입력 소유권 도구다. DPR 코드가 이 모듈을 import하거나 main 입력·simulation을 정지시킨 것이 아니다. 상세 정본은 [키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md) 및 [총괄 마스터](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 ROOT-RIFT-PARENT-INPUT-LEASE-20261007 계약을 따른다.

| 항목 | 정확 현재 public 계약·미인수 |
|---|---|
| 파일·출처 | tools/2_5d/rift-parent-input-lease.mjs12058B/SHA01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676. raw SKILL63/ENEMY64 semanticFAIL 원문보존·direct raw importfalse |
| factory·입력 | createRiftParentInputLease({ports:{readOwned,clearHeld}}). readOwned는 동기 own-data plain {owned:boolean,epoch:safe integer≥0}; authoritative root job epoch, host token/G.revision으로 추정0. readPolicy·suppression 함수는 fresh 소유권 재검사 |
| 해제·실패 | 명시적 현재 inactive만 parent passthrough. owned/unknown/stale/disposed는 input/update/gamepad/facing/자동전환 차단 판정. 최초 owned epoch마다 clearHeld 동기1회·undefined/true만 성공. callback의 this=ports 보존; Promise/throw/truthy는 성공0 |
| 수명·의도 | host 닫힘/dispose만으로 root lease 해제0. classifyProjectedEvent는 advisory only·DOM dispatch/preventDefault/focus를 직접 조작0. root caller의 actual main hook/held release/gamepad 재동기화는 미연결 |
| 검수·인수 | root의 새 stdin1회16groups/288conditions PASS16·FAIL0·exit0. 문서 worker 재실행0, 이번 DPR launch와 합산0. timers0/RAF0/parentState·save·reward 쓰기0/nextStage 호출0/mainAcceptedfalse/nativeAcceptedfalse |

### MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 범위·판정 |
|---|---|
| STAGE | ROOT-RIFT-LAB-DPR-RESIZE-20261007. 기존 lab resize DPR 업데이트+docs3, parent lease는 별도 완료 경계 인용 |
| MASTER | silhouette/regions/main route/side spaces 기존 유지·설계 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major opening 원화 유지·새 질량 배치0 |
| LARGE | source1254 plate/3전경 composites/crop/overlap/repeated silhouette 유지 |
| MEDIUM | connections/remaining holes·절벽 접합 변경0 |
| GROUND | shadow/contamination/structure integration 기존 유지, 원source 확대흐림 잔여·contact ON FAIL/defaultOFF |
| PLAYABLE | 기존 nav1192 travel/breathing 유지. arenas/threat/combat readability 본편 인수 PENDING·새 native 여정0 |
| LANDMARK | primary 상승문/secondary 균열/tertiary 주민·발 불변 |
| CAMERA QA | 동측 전사5480/3740·zoom100%·CSS고정 DPR1/2/3 화면 실제열람. START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 전체8camera 신규검수0 |
| TECH QA | actual CDP4+synthetic6, GPU13link/error0, syntax1; route/collision/원pin보존. seam 개선·loading 전체회귀·장시간performance 신규인수0 |
| FILES | 소유 lab.mjs resize3줄+기존docs3 append만. concurrent/unrelated 원본source/assets/editor/terrain/game/save/STATELOG 쓰기0 |
| GIT | worker stage/commit/push/deploy0. root가 검수완료code1+docs3 범위 checkpoint·원격exactSHA 기록; 이 절로 push 성공 추정0 |
| VISUAL VERDICT | **RETOUCH**. DPR buffer 갱신 PASS와 원plate1254² 흐림/절벽 접합·본편 미인수 분리 |
| NEXT PASS | 원등록 보존한 고해상도 source 상세·2D buffer 별도 A/B, 실물 DPR 이벤트 수명 및 main input lease 실제caller/update/gamepad Gate·native6/save/audio |

## ROOT-RIFT-LAB-DPR-RESIZE-20261007 부록 — parent lease 최종 핀과 제한 보정 이력

직전 절의 parent lease **12058 B / `01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676` 및 16그룹·288조건 PASS는 초기 버전의 검증 이력**이다. 아래가 현재 public 최종 핀과 그 버전에 대한 제한 보정 근거다. 초기 16그룹을 최종 버전에서 다시 실행한 것으로 취급하거나 DPR Chrome 실험과 합산하지 않는다.

| 구분 | 정확한 근거와 결과 | 현재 해석 |
|---|---|---|
| 최종 public 파일 | `tools/2_5d/rift-parent-input-lease.mjs` **12294 B**, SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | root의 최종 구현 핀. 이 문서 보정 담당은 코드 수정·검사 재실행 0 |
| 초기 전체 검사 | 초기 12058 B 핀에서 신규 stdin 1회, 16그룹·288조건 PASS16/FAIL0/exit0 | 기존 검증 이력 그대로 보존; 최종 버전의 전체 검사로 승격 0 |
| 새 제한 검사 최초 실패 | 별도 제한 stdin 1회의 첫 단계 PASS0/FAIL1, 도달 조건 3, unhandled rejection **1** | `readOwned`가 거절된 native Promise를 반환할 때의 실패를 보존. 첫 단계만의 별도 프로세스 exit는 없음 |
| 백업과 최소 보정 | 외부 `parent-input-lease/before-rejected-read-owned.mjs`에 초기 소스 보존 후 제품 코드 보정 **1회** | 원자료 후보·gate·다른 작업자의 파일 변경 0 |
| 같은 제한 stdin의 후속 | 6개 고유그룹·33조건 PASS6/FAIL0/미도달0, **새 unhandled rejection 0**, 전체 프로세스 exit0 | 최초 실패를 지우거나 무상 PASS로 합산하지 않음. 초기 전체 suite 재실행 0 |
| 실제 stdin 실행 수 | 초기 전체 1회 + 새 제한 1회 = 총 **2회** | 새 제한 프로세스 안의 최초 실패/보정/후속 단계를 별도 stdin 실행으로 세지 않음 |
| Promise 처리 경계 | 캡처한 same-realm native Promise prototype, own `constructor` 없음, native prototype constructor 및 캡처한 species getter가 유지된 경우만 거절 관찰 | 동기 ownership은 계속 UNKNOWN. own `then` getter를 실행하거나 비동기 결과를 소유권으로 채택하지 않음 |
| foreign/비정상 Promise | foreign Promise/일반 thenable은 raw `then`을 실행하거나 채택하지 않음. 해당 foreign 검사는 fulfilled Promise와 getter 실행 0을 확인 | hostile foreign 또는 constructor-accessor의 **rejected** Promise를 안전하게 관찰했다는 주장 0 |
| 본편 경계 | parent main hook 0, 실제 gamepad·native·main game·save·reward 인수 0 | root job/epoch의 권한 계약과 동기 `undefined`/`true`만 허용하는 held-clear 계약 유지 |
| 독립 DPR 결과 | DPR code **33105 B / `2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12`**, syntax 1회/실제 Chrome 실험 1회 | parent lease 제한 검사와 별도. source 1254²→world 8000² 확대 흐림과 실물 모니터 전환 미인수 유지 |

근거는 외부 `parent-input-lease/final-receipt.json`과 `parent-input-lease/rejected-read-owned-limited-result.json`이다. root의 관련 키워드 전체 검색은 `rift-parent-input-lease`, `readOwned`, `observeNativeRejection`, `nativeThen`, `unhandled`, `rejection`, `RIFT-MAIN-GATE-PUBLIC`로 **41파일·210매치**를 보존했다. 다른 시스템·owner 이력은 역편집하지 않는다. 정확한 입력 정책은 [3.3 키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md)과 [PROJECT_MANAGEMENT_MASTER](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 root 정본을 따른다.

**MAP PRODUCTION REPORT 부록:** 변경 단계는 위 DPR/parent lease 검증 이력의 문서 동기화뿐이며, master·outer mass·medium/ground connection·playable/combat·landmark·small detail·카메라·geometry·nav·원화·주민 발·소스 등록의 새 변경은 0이다. 새 화면/단위검사/실게임/오디오/저장 인수 0, worker Git 변경 0. 직전 §23의 DPR 실제 화면 관찰과 전체맵 판정을 그대로 유지한다. **VISUAL VERDICT: RETOUCH** — parent lease의 실제 화면은 NOT ASSESSED, 전체맵 원본 확대 흐림은 미해결이다.

## ROOT-RIFT-CHILD-LIFETIME-20261007 — 로딩 중 페이지 종료와 늦은 자원 수명

현재 `tools/2_5d-world-lab.mjs`는 renderer 생성과 무거운 첫 top-level await 이전에 pagehide를 등록한다. 로딩 중 종료는 초기화를 폐기하고 늦은 소유 자원을 해제하며, 닫힌 페이지의 scene·DOM·ready·RAF를 다시 활성화하지 않는다. 독립 child lab의 수명 보강이며 parent input lease/main 훅, 맵 선명도, 원화, native 플레이 완료와는 별개다.

| id / 적용 위치 / API | 정확 현행 구현 | 경계·불변 |
|---|---|---|
| source / 완료 ID | ROOT-RIFT-CHILD-LIFETIME-20261007; `tools/2_5d-world-lab.mjs` **36039 B**, SHA256 `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93` | 조기 pagehide·dispose·async-init 수명·읽기 전용 진단만 변경. 원 PNG/scene/nav/renderer 수치·DPR 3줄 변경 0 |
| 선행 읽기 | AGENTS 26076 B/`fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4`; guide 18392 B/`607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b`; LOCK 39679 B/`94081b2aef08771384fb2032dab42f12c3cde57227558f8a11b772690e13451a` | 직전 전체 완독 핀과 동일함을 이번에 확인. SSOT 이전 전체 156633 B prefix도 동일, 추가 11017 B는 이번에 전부 읽음. 현재 SSOT 167650 B/`a588deb05dac1a8e57f6f235d95afce69fcfc2841ac137679a8872e2360fcfa0` |
| early pagehide | `window.addEventListener('pagehide',dispose,{once:true})` 1개를 renderer 생성·terrain await 전에 등록 | 모듈 평가가 시작된 이후의 수명. 아직 모듈을 실행하지 않은 의존 모듈 다운로드 구간에 리스너가 있다고 주장하지 않음 |
| epoch / ready | lifecycleEpoch=0 / initializationEpoch=0. 최초 dispose는 disposed=true·ready=false·epoch+1·anchorJob=null·keys.clear·attackQueued=false를 외부 cleanup보다 먼저 적용 | 반복 dispose는 즉시 반환. epoch·해제 시도 추가 0, 폐기한 페이지에서 초기화 재개 0 |
| `releaseResource(resource,release,kind)` | object/function identity를 해제 시도 전에 WeakSet에 기록. 같은 identity 시도 1회; 각 release는 독립 try/catch | 한 자원의 throw가 이후 다른 해제를 막지 않음. throw한 같은 자원 재시도 0. cleanupFailures는 잡힌 해제 예외 수이며 GPU-free 성공 수가 아님 |
| 해제 대상 | observer.disconnect, reduced-motion listener 제거, effects, helper geometry/material, wolf abort, wolf, rigs, specialMotion, contactUnderlay, terrain, shadow geometry/material, renderer, interactionCue, residents, dialogue.close('pagehide') | 존재하는 자원만 시도. factory 내부 세부 자원과 실제 GPU 해제는 factory/브라우저 검수 경계. 강제 context-loss API 추가 0 |
| `takeInitialized(resource,kind)` | epoch 일치·disposed=false일 때만 소유 변수에 대입. 늦은 resource는 lateResourceRejected+1, release 시도 1회 뒤 종료 오류 | terrain/contact/residents/각 rig/special/wolf await 결과에 적용. 늦은 결과를 scene에 추가하거나 ready로 승격 0 |
| 비자원 await guard | canonical fetch·arrayBuffer·assessRegistration, STORY fetch·arrayBuffer·SHA digest 뒤 `ensureInitialization()` | 뒤늦은 Promise 완료 후 다음 초기화 진행 0. 새 polling/타이머/RAF/파일·세이브 쓰기 0 |
| async scene attachment | resident/special factory에만 `initializationScene` add/remove 전달. add는 epoch·disposed 확인 후 종료 상태 거절; remove는 기존 scene.remove로 해제 허용 | factory 내부 늦은 scene.add도 차단. factory 자체 해제는 caller release count와 별도. source/world/geometry/nav 등록 변경 0 |
| fail / 최종 등록 | fail(error)는 disposed이면 UI·오류 상태를 다시 쓰지 않음. ready 승격 직전 epoch 검사. 폐기 상태에서는 후단 키 이벤트와 `__rift25Lab` 신규 노출도 수행하지 않음 | 살아 있는 페이지의 실패 UI 유지. child 폐기로 parent root job/epoch 권한 해제 0 |
| readonly 초기 진단 | 첫 await 이전 `window.__rift25Lifecycle=Object.freeze({snapshot})`. snapshot은 새 frozen record와 새 frozen counts 반환 | ready:boolean, disposed:boolean, frames:number, raf:boolean, epoch:number, cleanupFailures:number, rendererCreated:boolean, lateResourceRejected:number. mutable release 함수·renderer·자원 handle 노출 0 |
| `disposeAttemptCounts` | 시도한 kind별 nonnegative integer: observer, reduced-motion-listener, effects, helper-geometry, helper-material, wolf-abort, wolf, rigs, special-motion, contact-underlay, terrain, shadow-geometry, shadow-material, renderer, interaction-cue, residents, dialogue | 미시도 kind는 필드 없음. rendererCreated는 생성 여부라 disposed 뒤에도 true일 수 있음. count는 시도 횟수로 실제 GPU/native 인수가 아님 |
| 늦은 자원 진단 | lateResourceRejected는 종료 뒤 takeInitialized 또는 guarded scene.add에서 거절한 횟수 | canonical/STORY bytes는 소유 GPU 자원이 아니므로 이 counter로 세지 않음 |
| 기존 렌더·보행 | 대표 foot5480/3740, nav1192, angle50/scale400, DPR cap2·양의 분수·invalid fallback1 기존 3줄 그대로 | source1254²→world8000² 확대 흐림, 2D mask1024, contact 기본 OFF·실패 이력, 본편/native6·오디오·세이브 미인수 경계 유지 |

### 제한 검수 이력 — 하네스 실패·성공 이력·최종 핀 분리

| 구분 | 실제 실행·결과 | 의미 |
|---|---|---|
| ANIM 메모리 선행 근거 | 공식 end `c0a741f3-4fd7-4f07-a6ad-d2a888823376`, 2026-10-06T19:33:53.039Z. `animParentChildLifetime20261007LatestReceipt-root-observed.json`의 평탄 해제 체인 모델 3/3 PASS | 전문 memory 이력이며 새 public 제품 검사가 아님. 재실행 0, 실제 iframe/pagehide/GPU 미관측 |
| 제품 syntax | 초기 lifetime patch에서 node --check 1회 exit0 | 이후 add/remove guard·readonly 진단 추가. 최종 소스 parse/evaluate는 제한 VM 후속에서 검증; 최초 syntax를 최종 전체 런타임 인수로 승격 0 |
| 최초 actual-source VM | 35079 B/`dcaad20f6d1177e318351bf7161bc7108db12429846ec461fffea4f2bc08ab21`; 신규 의미 실행 1회, 10그룹 중 PASS5/FAIL5/110도달조건, exit1 | 5 FAIL은 mock STORY bytes가 빈 JSON이라 resident/rig/special/wolf 단계에 미도달한 하네스 결함. 제품 늦은 자원 실패를 관측한 것이 아님. 성공5 재실행 0 |
| 두 번째 Node 시도 | 외부 stdin 하네스 객체의 닫는 중괄호 누락으로 SyntaxError, 제품 도달0/검사그룹0/exit1 | tooling 실패 이력 별도 보존. 제품FAIL·제품 의미 실행으로 섞지 않음 |
| 제한 후속 준비 | 외부 `limited-followup.mjs` syntax-only 1회 exit0 | repo 새 검사 파일 0. 최초 성공5·DPR·memory3·host·interop·Chrome 재검사 0 |
| 최종 핀 제한 후속 | 36039 B 최종핀 actual-source VM 의미 실행 1회, 앞선 미도달5만 **PASS5/FAIL0/100조건/exit0** | 실제 immutable STORY 25940 B/SHA `be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc`. GPU·DOM·factory는 mock, 신규 readonly snapshot도 같은 후속에 검증 |
| 후속 확인 내용 | resident/special 내부 add 차단, warrior/silvertail/dark-druid 각 rig 경계, 늦은 wolf 해제, terrain/renderer/cue dispose 3개 throw에도 후속 해제, identity 1회·재폐기0·snapshot detached/frozen | 초기5+최종5를 같은 핀 전체10 PASS로 합산하지 않음. 110+100도 최종 단일조건 수로 합산 0 |
| 실행 총계 | 제품 소스를 실행한 의미 검수 2회. 하네스 parse 실패 포함 해당 Node 실행 3회. 제품 syntax1·외부 harness syntax1은 별도 | 실제 about:blank/pagehide·GPU 해제·WebGL은 root 단일 Chrome QA까지 PENDING. 이 담당 Chrome0/native0 |
| docs 전체 검색 | pagehide/dispose/async.init/수명/2_5d-world-lab/late terrain·rig·wolf 및 신규 epoch/adopt/scene/release 이름으로 **239파일·2649매치** | child-lifetime/docs-keyword-search.txt 원문과 docs-search-disposition.json 보존. own3 정확 추가, 다른 시스템·owner 역사·관리 정본은 root 소유로 역편집 0 |

외부 영수증·원 fullbytes 백업·최초 실패와 제한 후속 raw는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime/`에 있다. 입력 정책은 [3.3 키바인딩+설정](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md), 전체 운영과 root 관측은 [PROJECT_MANAGEMENT_MASTER](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md)의 정본을 따른다. 예약 root job의 owned/epoch와 child 폐기는 별개이며 child dispose로 부모작업 재개를 허가하지 않는다.

### MAP PRODUCTION REPORT — §23 / child lifetime

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE / MASTER | ROOT-RIFT-CHILD-LIFETIME-20261007 독립 child lab async-init·teardown 보강. guide/SSOT/LOCK 선행, 최하층→상승 목표 유지 |
| OUTER MASS / LARGE | 원화·실루엣·opening·랜드마크·crop·UV·source 등록 변경 0 |
| MEDIUM / GROUND | 절벽 접합·고도·geometry·보행1192·주민 발·start/exit 변경 0 |
| PLAYABLE / COMBAT | 독립 lab 자원 수명만 보강. 본편 입력·전투·보스·Q 전용 magic 패링/E 불가·어택티켓 금지·보상·세이브 변경 0 |
| LANDMARK / SMALL DETAIL | 원 PNG·atlas·리깅·주민 스케일·모션 수치·조명·detail 변경 0 |
| CAMERA QA | 새 브라우저·8카메라·실 GPU·DPR A/B 실행 0. root 새 Chrome 관측 전 PENDING |
| TECH QA | 초기 의미1 PASS5/하네스미도달5 보존; 두 번째 tooling parse 실패 제품도달0; 최종 제한 의미1 PASS5/100조건/exit0. 성공 이력·memory·DPR·host·interop 합산/반복 0 |
| FILES | tools/2_5d-world-lab.mjs 지정 수명 구역과 own docs3만. 기존 docs fullbytes prefix100%+LF append/EOF LF1. 타인 WIP·전문 raw·game·STATE 쓰기 0 |
| GIT | worker add/commit/push/reset 0. root가 완료 code1+docs3 한정 checkpoint. 여기서 원격 보존 성공 추정 0 |
| VISUAL VERDICT | **RETOUCH** — 기존 전체맵 확대 흐림·경계 미해결. 이번 수명 실화면은 root 관측 전 NOT ASSESSED. pure PASS를 visual PASS로 대체 0 |
| NEXT PASS | root 단일 실제 Chrome에서 초기 await 중 about:blank/pagehide·ready/RAF 미부활·해제 시도 관측. 실제 GPU 해제·native 플레이·오디오·durable save 별도 |

## ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007 — 실제 child 수명 인수 / 최종 소스 동결

직전 ROOT-RIFT-CHILD-LIFETIME-20261007의 실제 브라우저 수명 QA PENDING은 아래 **한정 실제 Chrome 실험**에서 확인한 범위만 완료로 갱신한다. 최종 public 소스는 36039 B/SHA `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`로 동결되어 검수 중 제품 변경 0이다. 미완료 HTTP 응답 중 취소, OS/드라이버 물리 GPU 메모리 반환, 본편/native6·청취·저장 인수는 이 실험의 완료로 계산하지 않는다.

| 항목 / API·증거 | 실제 새 관측 | 인수 범위·제한 |
|---|---|---|
| 실행 / 완료 ID | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007; 신규 Chrome 실험1/launch1/context1/parent page1/직렬 child document6 | 기존 DPR·VM·memory3·host·interop 검사 재실행 0. screenshot2, 새 harness 실행1, process exit0 |
| 고유 검수 | 신규 **6그룹 PASS6/FAIL0**, 관측 subcheck **21/21 PASS**, partialUnknown0 | 아래 수명 범위의 검사 상태. 물리 GPU 메모리 UNKNOWN을 전체게임 PASS로 승격하지 않음 |
| 정상 actual GPU 해제 | ready child를 실제 host.cancel 경로로 닫고 native pagehide 관측. cancellation frames13→late 후13, ready=false/disposed=true/epoch1/RAF=false/actual RAF pending0 | 이미 ready였던 lab port는 존재하지만 ready·draw·RAF·DOM은 부활하지 않음 |
| terrain 늦은 반환 | 실제 factory 생성완료 결과를 return gate에서 보류→실제 취소→gate 해제. lateResourceRejected1, actual dispose completion1, frames0→0 | source fetch 지연 요청100ms/관측103ms 뒤 반환 gate가 취소 지점. 미완료 응답 취소 실험이 아님 |
| residents 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | atlas fetch 지연100ms/관측102ms. 실제 주민 factory 사용, mock/source-regex 대체 0 |
| 첫 rig 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | 첫 rig 이미지는 browser cache를 재사용해 새 matching fetch 없음. 실제 factory 결과 반환 경계는 관측 |
| special-motion 늦은 반환 | 실제 생성완료 결과의 return gate 취소/해제, lateResourceRejected1/actual dispose completion1, frames0→0 | dive 원화 fetch 지연100ms/관측102ms. renderer 업로드·렌더 전 결과 보류의 범위 |
| cleanup 예외 격리 | 실제 terrain.dispose를 먼저 실행한 다음 예상 예외1 주입. cleanupFailures1, 나머지 renderer/residents/dialogue 등 release 지속, frames6→6 | factory/GPU를 mock으로 교체한 예외 검사가 아님. 이미 실제 release를 호출한 뒤 주입한 throw임 |
| native 종료 / 비부활 | trusted native pagehide **6/6**; 각 child에서 종료 뒤 draw0/DOM mutation0/actual RAF pending0, ready=false/disposed=true/epoch1 | synthetic pagehide0. 여기서 native는 브라우저 DOM 이벤트이며 게임 milestone native6가 아님 |
| 실제 native GL delete | 정상 ready 해제와 예외 주입 해제 **각각** deleteProgram13/deleteTexture13/deleteBuffer38 | 두 그룹 수를 전체6의 단일 총량으로 합산하지 않음. GL delete 호출·JS dispose는 물리 GPU memory-free 증거가 아님 |
| 늦은 반환 GL 경계 | terrain deleteProgram0/texture0/buffer0; residents·rig·special는 각각 program5/texture0/buffer0 | 늦은 실제 자원은 gate 반환 전에 렌더/업로드하지 않았음. texture/buffer delete0을 driver allocation 부재·메모리 반환 인수로 해석하지 않음 |
| 오류 / 외부 쓰기 | pageerror0/consoleError0/HTTP error0/foreign request0/mutation request0/download0, native GL error 종료 전후 child6 각각0 | source18 전후 exact, editor scene·격리 storage 불변, productCodeChangesDuringQA0. 실험 worker repo/Git 쓰기0 |
| old realm 관측 | QA parent가 제거된 child의 readonly snapshot과 gate resolver를 의도적으로 보존하여 실제 pagehide 뒤 late return 관측 | 일반 discarded realm이 다시 실행된다는 주장 0. 생산용 mutable resource handle·추가타이머·RAF·scene/nav/source 변경 0 |
| readonly 진단 | 실제 `__rift25Lifecycle.snapshot()`의 ready/disposed/frames/raf/epoch/cleanupFailures/rendererCreated/disposeAttemptCounts/lateResourceRejected와 native draw/delete/pagehide 관측 | disposal count는 실제 시도 횟수. 강제 context loss·OS GPU 메모리 계측 추가 0 |
| 시각 관측 | actual ready canvas와 normal parent return의 실제 screenshot2 직접 검수. 한정 ready/return UI PASS | 전체맵 **VISUAL RETOUCH** 유지. source1254²→world8000² 확대 흐림·작은 raster 캐릭터 미해결, A급·맵 선명도·본편 완료 주장 0 |
| 실제 물리 GPU | physicalGpuMemoryFreeAccepted=false / **UNKNOWN** | native delete13/13/38이나 renderer.dispose1을 드라이버 메모리 반환으로 승격 0 |
| 본편 / 저장 / 청취 | actualMainGame=false, native6Accepted=false, audioAccepted=false, saveAccepted=false | main 연결·전투/획득/보스 사망·부활·재도전·durable save·청취 인수는 별도 |

정상 ready와 예외 주입 child에서 readonly releaseAttemptCounts는 observer1/reduced-motion-listener1/effects3/helper-geometry3/helper-material3/wolf-abort1/wolf1/rigs3/special-motion1/contact-underlay1/terrain1/shadow-geometry1/shadow-material1/renderer1/interaction-cue1/residents1/dialogue1을 관측했다. loading gate child는 당시 이미 생성한 자원과 늦은 해당 자원만 각각 시도1이며, 미생성 자원의 count를 만들어 채우지 않는다. loading 4개 child에서 lab port 신규 노출은 false, 정상·예외 ready child는 기존 port가 true인 채 disposed/ready=false를 유지했다.

### 독립 증거·이력 핀

| 증거 | 정확 bytes / SHA256 | 구분 |
|---|---|---|
| public source | 36039 B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93` | 브라우저 actual6/21과 최종 VM5/100은 같은 소스라도 **서로 다른 검사**로 유지 |
| acceptance-summary.json | 11120 B / `d7d5b4df81b6c70c8bacee8ec0828bb8470e170a16b8ae5f4278f5701e275bb4` | 신규 actual Chrome6/21 요약 |
| raw-result.json | 84980 B / `9a6b60b96fe30a81fc6672bfc7734f82cf16171a9b6619c7fcf92b28c23a0da5` | 실제 native event·GL·source18·gate 원 관측 |
| map-production-report.txt | 2601 B / `82a591ad9eb945e3c3f4b9baa9f1e5ad4e229ab01010ff3f2f656cc3067eebb3` | §23 실제 수명 QA, VISUAL RETOUCH |
| actual-ready-gpu.png | 913111 B / `2e094e4b27c005382b17a13ae0d001730d762de55068266fcc8fbacb6f7baf14` | 실제 ready UI 화면 |
| parent-after-cleanup.png | 1242952 B / `ba81df0e7e7e99de9be6ea2b39311d51ad2da552fccc8798dccf5c875522b7e3` | 실제 parent return 화면 |
| 초기 prototype VM | 35079 B/`dcaad20f6d1177e318351bf7161bc7108db12429846ec461fffea4f2bc08ab21`: PASS5/하네스미도달 FAIL5/110조건 | 원 핀 이력 보존. 제품FAIL/현재 전체PASS로 바꾸지 않음, 재실행0 |
| 하네스 parse 실패 | 두 번째 Node 시도 제품도달0/그룹0/exit1 | tooling 이력 보존; actual Chrome 실패나 제품 의미검사로 합산0 |
| 최종 VM 한정 후속 | 최종36039핀에서 PASS5/FAIL0/100조건/exit0 | 최초 성공5 재실행0. 이 5/100과 actual6/21을 11그룹·121조건의 같은 검사로 합산0 |
| 전문 memory | end `c0a741f3-4fd7-4f07-a6ad-d2a888823376`의 모델3PASS | 전문 이력과 이번 실제 소스/GPU 관측 분리, 재실행0 |

실제 QA 근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime-browser/acceptance-summary.json`, `final-receipt.json`, `map-production-report.txt`다. 문서 담당은 이 결과만 읽어 own3에 원 fullbytes prefix100%+LF append/EOF LF1로 동기화했으며 코드·검사·브라우저·Git 실행0이다. 전체 docs 관련키워드검색은 ROOT-RIFT-CHILD-LIFETIME/__rift25Lifecycle/pagehide/deleteProgram/deleteTexture/deleteBuffer/physical GPU·GPU 메모리/2_5d-world-lab로 **69파일·535매치**, 원문과 파일별 disposition를 `child-lifetime-browser/docs-sync/`에 보존했다. 다른 root 관리·메인 문서와 owner 이력은 역편집0이다.

### MAP PRODUCTION REPORT — §23 / 실제 child 수명 QA 문서 인수

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE / MASTER | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007의 한정 실제 child 수명 인수. 기존 맵 SSOT·guide·LOCK·최하층 상승 목표 유지 |
| OUTER MASS / LARGE | silhouette·regions·main route·source18·원PNG/composite/crop·UV·opening 변경0 |
| MEDIUM / GROUND | 연결부·낭떠러지·shadow·contamination·geometry·nav1192·등록·foot·start/exit 변경0 |
| PLAYABLE / COMBAT | 실제본편/native6 인수0, arena/travel/threat/combat readability 새 검수0, 보상·저장·보스·보호2_3·Q-only/E 불가·어택티켓 금지 변경0 |
| LANDMARK / SMALL DETAIL | 기존 랜드마크·상승문·주민·소스·모션·detail 변경0 |
| CAMERA QA | 기존8카메라 반복0. 신규 ready/return 실제2화면을 QA가 관찰, camera 수치 변경0 |
| TECH QA | actual Chrome launch1/context1/parent1/child6, 새6그룹 PASS/관측21 subcheck PASS, trusted pagehide6/6/GLerror0, 늦은4 실제 자원 각 dispose1, 정상·예외 각각 native delete13/13/38, 비부활0 |
| FILES | 문서 담당 own docs3만 원문 prefix100% LF append/EOF LF1. 실제QA는 외부 계획/runner/raw/요약/화면만, code source36039/8388 동결 |
| GIT | 담당 stage/commit/push/reset0. root 완료소유 checkpoint 담당, 여기서 remote 성공 추정0 |
| VISUAL VERDICT | **RETOUCH** — 한정 ready/return UI PASS와 전체맵 판정 분리. 물리 GPU 메모리 UNKNOWN/본편·native6·audio·save false |
| NEXT PASS | root 실제 본편 연결·게임6단계·오디오 청취·save/reward 인수. 신규 수명6/21 또는 옛 성공검사 재실행0 |


## 2026-10-07 ROOT-RIFT-MAIN-SEAM: 정상 전환 소스 연결과 신규 소비자 화면

| id·적용 위치 | 현재 값·구현·인수 경계 |
|---|---|
| ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 | game.html 4050426B / SHA256 ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230; tools/2_5d/main-rift-runtime.mjs 7519B / SHA256 b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69. 初期 game4039085B/4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd bytebackup 및 최종15접점 역변환 원문 exact |
| 실행 범위·원 DEMO | location.origin === http://127.0.0.1:3387일 때만 lexical root 소비자 활성. 정상 _proceedNextStage clear-route에 소스 hook 구현, 사용자3333/3340/file 경로 동작과 기존 demo terminal nextBtn은 유지. _DEMO_MODE=true/_DEMO_LAST_STAGE=0 기본 CH1-1은 terminal branch를 우회하지 않아 허브 진입 PENDING |
| 실제 capture·admission | _rootRiftBegin 이전의 P/G/player/context/stage/_charId/_charIdx/difficultyOff=(G._stageDiffOff??0)/difficultyIndex=(OPT.diff??5)/save=dbSave/saveReady=_dbReady/status=P.s/previousOn=G.on을 root job에 보존. stage safe integer>=0, hp finite>0, stageCleared===true/bossAlive===false·charIdx범위·MAX_SAFE_INTEGER epoch 경계·dead/fallen/reviving/lastStand 차단. 정상 clear의 G.on=true 및 _bossArena=true 자체를 오인 차단하지 않음. G.on=false 전환 뒤 held clear, 기존 dbSave 호출1 await 및 import·enter 뒤 동일 capture 검사 |
| input·epoch | _rootRiftEpoch/job이 권한 정본. _clearHeldInput 이후 _gpClearAll, _gpSynced=false·axes0·G._gpAiming=false. held restore0. update 맨앞(systemLesson/panelkey 이전), gamepad poll/inject/direct WASD/facing/autoAim, autoNext·nextStage에 lease guard. parent capture quarantine은 legacy gameplay 이벤트를 차단하고 host native modal 컨트롤 및 자기 Continue를 허용. init-stage/boot-loading/retry/char/lobby/hidden/pagehide에서 matching-job 무효화; advancing 중 자기 init-stage/boot-loading은 예외 |
| runtime API | createMainRiftRuntime({window,document,ports}); ports own functions readOwned/clearHeld/isCurrent/readHostContext/readGateState/schedule/release. enter(captured), continueStage(), parentEvent(event), block(channel), finished(captured), cancel(reason), dispose(), snapshot(). foundation publichost17683/008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38·gate16280/f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd·lease12294/d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1은 변경0 |
| Continue·5000ms·900ms | 자기 leaf button '위로 올라가기 · 다음 구역', click·Enter/NumpadEnter/Space 명시동작만 continue. gate.restore()/dispose()로 hostUI만 닫고 gate.cancel0; rootowned는 예약5000ms 동안 유지. 현재job 검사→gate one-shot commit1→현재job 재검사→기존 nextStage1. 성공한 fade900ms는 별도 curtain epoch와 boot epoch로 보호. parent Escape 등 advanced 이외 matching-job release는 자기 curtain RAF/wait/hide를 즉시 cancel; queued old callback이 새job/새curtain을 취소하지 않음 |
| 상태·캐릭터 | readHostContext {player:P,character,stage:G.stage,context:G,on:G.on,stageCleared,status:P.s}; readGateState {stage,stageCleared,status:'clear-continue',difficultyOff,contextId:epoch}. character는 _charIdx===1이면 silvertail, 그 외 warrior인 host admission 문자열이며 child P/char 연동 인수가 아님. runtime snapshot.mainSeamConnected=true는 소스 연결 상태; actualStageAdvanceAccepted/childCharacterLinked/saveAckAccepted=false, save/reward/RAF/timer0는 runtime 자신 범위. classicgame curtain timer는 위 별도소유. __riftMainIntegration.snapshot()의 durableSaveAccepted/demoHubAccepted/childCharacterLinked=false |
| source 검수 이력 | 구 game4050167B/f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3에서 신규 source9그룹133조건 PASS9/FAIL0/exit0. final ece8에서 matching-job Escape 취소 보정 신규 제한2그룹20조건 PASS2/FAIL0/exit0. 원9/133 재실행0/최종전체suite로합산0. 최초 syntax checker는 importmap JSON 오분류로 변경 main/module 도달 전 실패; 보정 checker의 main+module syntax PASS와 final 제한section parse를 별도 보존 |
| 신규 소비자 실제 DOM | ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007: 고유3그룹/15subchecks PASS/exit0, 실제 Chrome launch1/context1/QA부모page1/child3직렬. runtime의 실제 자기 Continue click·Enter 각각 hostUI/polltimer0·예약 rootowned/leaseblock 유지·지연 permissiontrue1/duplicatefalse1·모의advance1. 예약 중 trusted W downstream0, Escape release(parent-escape)1→oldcallback2false·모의advance0. publiccode5+원자료6 핀11 exact/gamefinal핀 전후 exact; pageerror/console/HTTP/외부·변경요청0 |
| DOM fixture의 한계 | QA 부모는 detached P/G/stage1 ports로 실제 runtime과 host iframe을 연결한 fixture. 실제 game.html·nextStage·5000ms/900ms·save·본편 held/gamepad/update·mobile 인수0. 이 신규3/15는 이전 host-gate interop4·source9/133·final2/20·child수명6/21과 합산·반복하지 않음 |
| 문서·외부 영수증 | API·save/input/editor 계약은 키바인딩/세이브/RIFT_DIALOGUE_PUBLIC_CONSUMER/HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/_MAP_SSOT_INDEX 정본6 및 lifecycle3·rootops6에 정확 동기화. 외부 main-seam-integration/rig-motion-implementation/final-receipt.json·handoff.md와 runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt·runtime-owned-continue-ready.png·runtime-click-scheduled.png·runtime-escape-cancelled.png를 구분. 앞선 child 수명 code1+docs9 정상 보존 remote exact 27c05d650f1d42831f5993c2a6a292a9f92c891f |
| 다음 승인 미완료 | 기본 demo1-1 종료→허브 정책/실제캐릭터 전달, NPC 유품·부탁의 명시선택과 동일save ledger의 async durable ACK, 맵 확대 흐림/절벽·전경 재질접합, 실제 editor/main/native6·청취·보상save 검수. 기존 tools/map-scene-rift-dialogue.mjs session choose(actualGrant:false) 또는 async void dbSave의 resolve를 durable 승인으로 간주0. 24시간 제작은 완료핀·보존 후 다음 미완료를 이어가며 기존 owner 송신독점/거절경계/타인WIP·user save·원PNG·scene/nav/보호2_3/Q전용/어택티켓금지 유지 |

MAP PRODUCTION REPORT (§23): MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL 순서에서 지형·원PNG·scene/nav 수정0, 기존 2.5D 보행화면을 normal parent consumer에 연결; CAMERA 신규 desktop Continue/예약/취소 UI PASS, 맵 RETOUCH; TECH source 핀·prototype/final/신규DOM fixture 분리, 실제 main(native6)·audio·durable save 미인수. 관련 docs 전체검색·fullprefix backup·새 append EOF LF1·완료소유 code+docs 정상 commit/push/remote exact은 외부보존 영수증으로 확인. VISUAL VERDICT: RETOUCH. 소스 구현과 실제 CH1-1 플레이 인수를 구분하며 A급완성 선언0.


## 2026-10-07 ROOT-ACTOR-OWNED-DISPOSE-20261007: 효과 소유 자원 해제의 예외 격리

`tools/2_5d/actor-effect-lifetime.mjs`의 private `dispose()`만 보강했다. 한 mesh/material/shared geometry 해제의 예외가 나머지 자원 해제를 중단하지 않으며, 모든 시도 후 기존 lab의 `cleanupFailures` 소비자가 알아볼 수 있는 고정 메시지 Error를 던진다. 새 raw69 모듈을 producer에 대체하거나 직접 import하지 않는다. 이 절의 CPU 검수는 실제 브라우저·GPU 해제 또는 본편 인수가 아니다.

| id·적용 위치 | 정확 계약·현재 값 |
|---|---|
| source 이전 핀 | actor-effect-lifetime.mjs 11238 bytes / SHA256 c4fd8fdce92b61d086f480a0466e1dfa37fac9b49b4f1bfc20368318d545a3ab. 변경 전 fullbytes 외부 백업 보존 |
| source 완료 핀 | actor-effect-lifetime.mjs 12162 bytes / SHA256 a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b. dispose L182–216만 변경; 새 구역을 원 dispose로 역변환하면 원본 전체 bytes와 일치 |
| API·provenance | createActorEffectLifetime({THREE,scene,camera,terrain,options}) → frozen {update,onActorChange,onSceneChange,dispose,snapshot}; default export와 ACTOR_EFFECT_DEFAULTS/ACTOR_EFFECT_PROVENANCE 변경0. ROOT-ADOPTED 원출처 9201 bytes / SHA256 1c9677089bf219ed0a5d486dc8873cb5fcbf4e7851a5df304996b3957c4c7400 유지 |
| 종료·capture | 반복 호출이면 즉시 0. 첫 호출은 disposed=true로 generation을 닫은 뒤 그 시점의 all.slice()를 capture한다. 생성 시점 빈 목록을 복사해 놓는 방식0 |
| mesh·material | capture된 각 entry의 mesh/material 조회를 독립 시도. 같은 mesh는 identity Set에 먼저 기록하고 visible=false 및 scene.remove(mesh)를 각각 독립 시도. material은 별도 resource identity Set에 먼저 기록하고 dispose가 함수인 경우 호출 |
| shared geometry | dustGeo/attackGeo는 풀 전체가 공유하는 factory 소유 geometry이며 entry마다 해제0. 모든 material 후 같은 resource Set을 통해 해제한다. 동일 handle은 종류가 겹쳐도 dispose 최대1회. borrowed scene/camera/terrain 자체 dispose0 |
| 실패·finally | entry 조회·hide·remove·resource.dispose에서 잡힌 예외마다 failures+=1. caught error의 message 조회0. finally에서 live/free length=0, stats.active=false/reason='disposed'/live=0/pool=0. 전 시도 뒤 failures>0이면 Error('actor effects 소유 자원 해제 실패: N')를 throw |
| return·재호출 | 성공 첫 dispose는 기존 all.length 숫자를 반환한다. 빈 풀은 0, duplicate entry는 역사적 entry 수 그대로 반환. 실패 첫 dispose도 종료 상태를 유지하며 다음 dispose는 0, 재시도·중복 해제0. snapshot.meshes=all.length 유지 |
| 진단의 의미 | active=false/reason='disposed'는 수명 닫힘이다. 실패한 resource의 물리적 GPU 반환 성공을 뜻하지 않는다. lab releaseResource가 controlled Error 1개를 catch하면 cleanupFailures는 1 증가; 메시지 N은 내부 예외 수이며 둘을 혼동0 |
| 고정값·렌더 | maxLive24, dustLifeMs520, attackLifeMs240, stepMinIntervalMs110, footBand4320, dustColor0x1a140f/opacity0.5/size0.14, attackColor0xc8623a/opacity0.8/size0.17, groundLift0.003, reducedMotion=false/depthTest=true defaults 유지. lab 공급 size 플레이어dust0.022/attack0.08, 드루이드dust0.042/attack0.145 및 depthTest=false 변경0 |
| 범위 제외 | update/clear/spawn/onActorChange/onSceneChange/snapshot, reduced-motion 재생성 및 factory 생성 예외·재진입 조사 변경0. 추가 helper/import/RAF/timer0. worldlab·main code2·원raw69·PNG·scene/nav·보호2_3/Q전용/어택티켓·사용자 save 변경0 |

| 신규 제한 검수 그룹 | 조건 수 | 결과·근거 |
|---|---:|---|
| 현재 생성된 소유 풀·성공 숫자 | 8 | PASS; 나중에 생성된 실제 Three Mesh 2개를 해제하고 첫 return2, borrowed 해제0 |
| remove 예외와 기존 lab 실패 집계 | 9 | PASS; 첫 remove throw 후 나머지 remove/material/shared 해제 지속. 현행 releaseResource 소스를 VM에서 소비해 cleanupFailures1 및 시도1 확인 |
| 동일 소유·shared identity | 7 | PASS; 두 entry가 같은 실제 Mesh/material/geometry를 가리켜도 각 handle1회, return2/다음0 |
| geometry entry별 해제 금지 | 5 | PASS; factory shared geometry2만 해제하고 원 mesh.geometry 관계 유지 |
| material 예외·고정 메시지·종료 상태 | 7 | PASS; throwing message getter를 가진 예외의 message를 읽지 않고 fixed Error 실패1, 후속 자원 도달·재호출0 |
| 빈 풀·종료 후 spawn 차단 | 5 | PASS; 빈 풀 숫자0, factory geometry2 해제, 이후 update 새 mesh0 |
| 공개 계약·dispose 밖 bytes | 6 | PASS; API/defaults/provenance 동일, dispose 역변환 전체 원문 exact |
| 실행 단위 | 47 | 신규 Node stdin 1회, 고유7그룹 PASS7/FAIL0/exit0. 저장소 Three r160 CPU 객체와 자원 method 예외 주입. 기존 팀14·child6/21·DPR·runtime DOM 검사 재실행·합산0 |

전체 docs 관련키워드 검색은 코드 변경 후 제외 경로 없이 수행했다. `actor-effect-lifetime`, `actor-effect-release`, `createActorEffectLifetime`, `dustGeo`, `attackGeo`, `cleanupFailures`, owned/dispose 관계는 22개 파일·336개 매칭 줄이며 원출력은 외부에 보존했다. 이 소유 문서3에는 현재 해제 계약을 동기화한다. API·수명·렌더 값이 그대로인 기존 캐릭터/애니메이션 참조는 유지하고, root 소유 운영문서 및 raw69 완료 이력은 root가 새 완료 단위와 구분해 동기화한다. 원raw69 productionAdopted=false 및 팀14 PASS 이력을 이 구현 인수로 승격0.

증거·fullbyte backup 위치: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-20261007/`의 preflight.json, before/1.before–4.before, dispose-replacement.json, limited-check-result.json, docs-keyword-search.txt, docs-search-summary.json, docs-search-disposition.json, source.diff, final-receipt.json. 문서3은 root 최신 main append를 포함한 원 fullprefix를 100% 보존하고 새 append EOF LF1을 유지한다. 코드+docs 완료소유 commit/push·원격 exact SHA는 root가 수행할 다음 보존 단계이며 이 지원 작업에서 Git mutation0.

MAP PRODUCTION REPORT (§23): MASTER 기존 목적/LOCK·SSOT 유지; LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL 원 지형·원화·nav·접지·전투 변경0; CAMERA 신규 화면 검수0; TECH 소유 효과 dispose 신규 CPU7그룹47조건 PASS, 기존 시각/GPU 이력 재실행0·새 핀 GPU 미인수. 맵 확대 흐림·재질 접합 개선을 주장하지 않는다. VISUAL VERDICT: RETOUCH. actual main/native6/audio/durable save 미인수 유지, A급완성 선언0.

### ROOT-ACTOR-OWNED-DISPOSE-20261007 신규 Chrome 관측·실패 이력 / 후속 접점

public `actor-effect-lifetime.mjs` dispose-only 최소 구현은 code1+docs9로 `5856578bf6cc211315fb9303ab01418e36984ca8` normal commit/push·remote exact에 보존했다. 현재 public actor는 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`, worldlab는 36039B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`이다. 기존 producer API/defaults/provenance·dispose 밖 전체 원문과 현재 mesh/material/shared cleanup의 number/오류 계약은 이전 구현 영수증대로 유지한다. raw69 full producer 미채택과 root inline cleanup 채택은 서로 다르다.

| 새 관측 / 분류 | 정확한 결과 |
|---|---|
| 최초 준비 실행 | Chrome1/context1/parent1/child2, 준비0PASS·2FAIL·exit1; 기존 idle frame0과 dust110ms 조건 때문에 예상 pool3 미도달 / disposal 인수조건0. 해당 시점 제품판정 불가, 원실패 이력 유지 |
| 승인 후속 실행 | public onActorChange로 edge reset 후 실제 dust2+attack1 / mesh3 / geometry2; Chrome1/context1/parent1/child2. 각6조건 관측 PASS, 총12조건 PASS; 마지막 GPU후검사2FAIL·exit1 유지 |
| 전체 그룹 판정 | followup raw0PASS·2FAIL; 전체 제품/GUI PASS 선언0. 관측12조건을 원 그룹 판정과 합산·교체0 |
| actual native 소비자 | QA detached parent의 실제 mainhost → 기존 실제 worldlab iframe. trusted pagehide 후 actual public producer dispose를 호출; game.html/native6/에디터 사용자흐름 검수0 |
| remove-throw | remove 시도3/성공2; 실패 owned mesh1은 attached·hidden으로 잔류. material actual dispose event3/3, shared geometry2/2. 잔류를 성공 해제로 표시0 |
| material-throw | remove3/3; material 각 시도1이나 첫 actual dispose event0, 나머지2 event각1; geometry2/2. 실패 material 해제 성공 주장0 |
| 진단 / 반복 | 각 case controlled Error(`actor effects 소유 자원 해제 실패: 1`) 및 actual lab cleanupFailures1. 반복 dispose0 / 부작용 재시도0. 내부N과 lab resource실패1을 혼동0 |
| borrowed 경계 | producer dispose 전후 camera/terrain/비소유scene children/current textures 불변; borrowed texture dispose event0. 이후 lab 자기소유 terrain/texture cleanup과 분리 |
| 실제 GL 렌더 | 두 case render 시 LINK_STATUS true / getError0 / native bufferData·draw 관측. 신규 effect buffer upload8 각 case |
| 실제 native 삭제 호출 | remove/material 순서 deleteBuffer46/46, deleteProgram13/11, deleteTexture13/13. material 실패의 program차이 및 failed event0 유지 |
| GPU후검사 실패 | iframe unload 뒤 isContextLost=true / getError37442(CONTEXT_LOST_WEBGL). 그 시점 error===0와 비교한 원 후검사2FAIL 유지. 이전 render GL0와 시점 분리; 추가 Chrome0 / 물리 GPU 메모리 해제 UNKNOWN |
| 전체 새 실행수 | Chrome2/context2/parent2/child4; 최초2FAIL와 후속12PASS·2FAIL 분리. 기존 child6/21·runtime3/15·CPU7/47·owner14/11·DPR 재실행·합산0 |
| 소스 / 오류 | protected source11핀 전후 exact; pageerror/consoleerror/404/foreign/mutation0; repo source·docs·Git·save 변경0(검수 worker). actor12162/a808 exact 유지 |
| 원자료 pins | 최초raw `c262a83ba794208d9c5abd363b4c882cb74aeaf164dc4637ed22d9f763fae417`; 후속raw `03a6e795276bae83d36f436c93db5622b56a982c5ee6b28d3a8afdcc76c9a5bc`; 최종receipt `3dd7fd3caa8034c3a74e06f7d41bce3371cb427c707868a9cffc9ef10d3f12c4`; summary `ba2da122d960e2604fcca7ce2f2e448bd1cfee1169b04bf03fae0f1f890debd1` |
| 실제 화면 | external `actor-owned-dispose-browser/followup/actual-owned-ring-pool.png` / `668e4bfb95c29edf545f6fe48868d9ffaa9a1f96a2f5ea84ee157312447fd35d`; 화면 개선/A급 증거로 승격0 |
| owner 새 memory | `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY-RESULT`, 공식 end `519bf6c5-b01d-4943-a74c-5f59fcfb4419`@2026-10-06T20:24:59.163Z / endrawSHA `7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e`; source-derived 모델11PASS는 owner이력 / root재실행0 / public 적용0 |
| root 다음 접점 | read-only plan20069B / `c0863b26cc3b24eeb158d24959fe4898b968f792917eb60cd9c3423ded846443`: effects 슬롯 INERT 선행→releaseResource→외부callback 뒤 disposed/epoch/generation/identity 재검사, 중첩phase guard→기존 RAF의 latest pending, 초기local create→takeInitialized→publish. 아직 계획/구현0 |
| 남은 producer 경계 | geometry ctor 부분할당 및 acquire의 scene.add→all.push 재진입은 initializationScene add guard만으로 입증0. 기존 owner의 새 actorReentrantPublish memory TASK sent/peer/Read/source1·end0 관측을 이어감; 같은TASK 재송신0 |
| NPC 수 정정 | 이전 '5NPC'는 root→owner 요청범위였으며 실제 current dialogue controller/RIFT_DIALOGUE 정본 조회는 Haran/Berin/Nessa/Dorik 4주민. 미확인 fifth를 기존 NPC로 확정0. item/quantity/quest identity 좁은 조회 진행, 새 보상 ID 임의확정0 |
| 지속 생산 / 거절 경계 | 기존 owner만 전문송신, 한 단위보존 뒤 다음 승인미완료. STORY 이전 큐 미소비/send0 유지. WOLF V3 auto approval Write 거절(dangerous/구체 사유 미제공) 뒤 동일산출 사고 purpose HOLD / 실행·채택·원격 raw보존·우회0 / 피해UNKNOWN |
| 인수 한계 | CH1-1 defaultdemo→hub·childP/char·NPC inventory+ledger durableACK/readback·실제본편native6·청취·실보상save·A급 미인수. 검수/계획/fixture/파일보존을 실제플레이완료로 계산0 |

MAP PRODUCTION REPORT (§23): 범위=public actor cleanup의 actual Chrome 관측/오류 이력 보존; geometry·outermass·ground·landmark·camera 배치 변경0, 기존 guide/SSOT/LOCK 유지. TECH=신규 CPU7/47 PASS는 이전 code checkpoint의 별도 검수; 이번 Chrome raw 두 followup 그룹 FAIL 유지/제한 actor 조건12관측 PASS. remove 잔류1·material actual dispose미도달1·native 삭제호출과 physical GPU UNKNOWN을 기록했다. 실제 게임·모바일·native6·청취·save0. **VISUAL VERDICT: RETOUCH**.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-browser/`의 final-receipt/acceptance-summary/map-production-report/원·후속 raw와 실제화면을 사용한다. 전체docs actor 관련 검색은53파일1181줄(raw2524094B/`29a74c5d66613e938339359107cc2b1790263c1cb8bc00f56895f447198b9a59`) 및 소스좁은검색22파일336줄의 경로별 disposition을 따른다. rootops6·소비자 actor3·directional·map editor·SSOT의 현재핀/인수상태를 정확 동기화하고 과거 원문fullprefix와 EOF LF1을 보존한다.


## 2026-10-07 ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007: 종료·중첩 요청을 보호하는 효과 재생성

현재 `tools/2_5d-world-lab.mjs`는 OS reduced-motion 변경의 효과 재생성 consumer를 보강했다. 정상 변경은 기존처럼 동기로 반영하며, cleanup/factory/cue 콜백이 종료나 새 요청을 일으킨 경우 오래된 루프가 효과를 다시 등록하지 않는다. 이 절은 앞선 계획의 구현0 상태를 갱신한다. producer의 부분 할당·등록 전 재진입 문제는 여전히 별도 미해결이다.

| id·적용 위치 | 정확 현재 계약·수치 |
|---|---|
| 완료 코드 | worldlab 39715 bytes / SHA256 050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8. 이전36039 bytes / SHA256 8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93 fullbytes 백업. 소유9접점 역변환 전체 원문 exact |
| producer 불변 | actor-effect-lifetime.mjs 12162 bytes / SHA256 a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b. raw69 직접import/전체producer 대체0. 이전 dispose CPU7/47·Chrome 오류 이력을 이 소비자 검사로 교체0 |
| createEffects L276 | createEffects(id,reducedMotion=reducedQuery.matches). ensureInitialization()을 먼저 호출하고 actor factory에 raw scene 대신 initializationScene add/remove facade를 공급. geometry/color/opacity/defaults/DPR 값 변경0 |
| 초기 등록 L428 | local effect=createEffects(id) → takeInitialized(effect,'effects') → effects[id]=effect. 초기 ready=false를 이유로 생성 자체를 막지 않으며, 생성 콜백 중 종료한 뒤 반환된 완성 handle은 epoch 확인 뒤 해제하고 등록0 |
| 실행 가드 L280 | 재생성은 state.ready 및 !disposed/!error/!contextLost, lifecycleEpoch===initializationEpoch일 때만 허용. cue·old cleanup·factory 각각 반환 후 captured epoch와 current request identity 및 소유 slot identity 재검사 |
| 요청·phase L282·L289 | private effectRebuildGeneration은 0 시작, 요청마다 증가하며 Number.MAX_SAFE_INTEGER=9007199254740991에서 진단 숫자 포화. 요청마다 fresh frozen identity를 생성하므로 숫자 포화에서도 stale publication 차단. owner phase는 cue/retiring/creating/publishing, 종료 후 idle |
| 중첩 latest pending | owner가 있으면 새 요청 identity와 pending=true만 보존하고 즉시 반환. cue/cleanup/factory를 재귀 실행0, finally에서 즉시 재실행0. 한 pending boolean·한 latest request만 보존하며 actor id 목록·reducedMotion boolean은 accepted job 시작에 capture |
| retire·해제 | effects[id]=INERT_EFFECT를 old cleanup보다 먼저 설정. 실제 old controller는 기존 releaseResource를 소비해 identity를 callback 전에 WeakSet 기록하고 controlled cleanup Error를 cleanupFailures에 집계. 한 actor 해제 실패가 다른 actor 재생성을 막지 않음 |
| 생성 실패·새 참조 | factory 예외는 effectRebuildFailures에 별도 기록하고 해당 소유 slot은 INERT로 유지; 아직 current면 다른 actor 계속 처리. next는 local로 보유하고 current epoch/request/slot을 통과할 때만 publish. stale next는 releaseResource로 1회 해제, lifecycle 종료이면 lateResourceRejected 증가. callback이 바꾼 slot·새로 추가한 id를 stale 루프가 덮거나 임의 채택0 |
| 고정 per-id reason | rebuild-pending / factory-failed / slot-replaced / 성공 시 빈 문자열. caught error.message 등 외부 예외 내용 조회0. 생성 오류와 cleanup 오류를 성공으로 삼키지 않음 |
| INERT 반환 계약 | frozen update/onActorChange/onSceneChange/dispose/snapshot 5메서드. update/snapshot은 frozen active=false/inert=true/reason='rebuild-unavailable' 및 live/spawned/expired/recycled/pool/bandWrites/suppressed/meshes=0. 나머지3메서드는 숫자0. GPU 소유 자원으로 releaseResource에 집계0 |
| 기존 RAF L267 | frame의 기존 ready/disposed 확인 다음 pending을 최대1회 flush. 즉시 ready/disposed/error/contextLost 재검사 뒤 pose/render 진행. 추가 RAF·timer·server·recursive queue0. 미종료 정상 frame의 기존 requestAnimationFrame1회 경로 유지 |
| dispose L343 | root disposed=true/ready=false/lifecycleEpoch++ 이후, 외부 cleanup 전에 request=null/pending=false/owner=null. teardown은 INERT를 제외한 현재 실제 controller만 해제. 반복 종료 기존 가드 유지 |
| readonly 진단 L281 | effectRebuildSnapshot() → frozen generation/phase/pending/failures/cueFailures 및 새 frozen reasons 복사. __rift25Lifecycle L370와 __rift25Lab L473의 effectRebuild 필드로 관측. mutable token/controller/Map handle 노출0 |
| 오류 숫자·화면 leaf | factory failures 및 cueFailures는 0 시작, 각 caught failure마다 +1, MAX_SAFE_INTEGER에서 포화. 기존 status leaf에 고정 '효과 재생성 오류 N · 접근 표시 오류 M'을 추가하고 선택 slot이 INERT면 '효과 비활성' 표시. parent container 교체0. 실제 DOM 화면 검수는 미실행 |
| 해제 시도 숫자 의미 | disposeAttemptCounts.effects는 초기 actor 수3이 아니라 현재 수명 전체의 실제 controller 해제 시도 누계. 정상 토글이면 old3 및 이후 new3 등의 시도가 추가되며, shared old identity는1회·INERT는0회. 이전 Chrome 이력의 effects3은 그 당시 관측값으로 유지 |
| 고정 효과 값 | maxLive24/possiblepool72(3×24), dust520ms/attack240ms/간격110ms, public defaults dust size0.14/attack0.17·groundLift0.003·footBand4320 유지. lab 플레이어dust0.022/attack0.08, 드루이드dust0.042/attack0.145·depthTest=false 및 기존 RGB/opacity 유지 |

| 신규 source consumer 제한 검수 | 조건 수 | 결과·범위 |
|---|---:|---|
| 전체 module syntax·소유9접점 exact | 12 | PASS; module parse 후 링크·전체 lab 실행0, 역변환 원문 exact/producer 핀 불변 |
| 정상 동기 토글·actual Three options·dedup | 15 | PASS; 실제 Three r160/public actor factory 반환, captured reduced-motion/options/facade 및 동일 old handle1회 |
| cleanup throw·다른 actor 계속 | 7 | PASS; 실제 변경 source releaseResource로 cleanupFailures1, factory3 도달·오류 종류 분리 |
| factory throw·INERT·진단·teardown | 13 | PASS; throwing message getter 미조회, INERT 메서드·0수치·fixed reason, CPU leaf 문자열 및 실제 old3/new2 시도5 |
| cue throw 격리 | 4 | PASS; factory3 계속·cueFailures1 및 CPU leaf 문구 |
| old cleanup의 동기 pagehide callback | 10 | PASS; source dispose 호출로 종료·pending 취소·factory0·old3 각1회·후속RAF0 |
| factory 반환 중 종료 | 7 | PASS; 반환된 완성 public controller 해제·등록0, old3/late1 시도4, reject1·RAF0 |
| cleanup 중첩 최신 요청·기존 frame | 12 | PASS; 실제 source callback이 새 요청을 호출. 즉시 factory0·generation2 pending, frame1회로 latest false 세actor 일관 적용·RAF1 |
| factory 중첩·readonly 진단 | 10 | PASS; creating snapshot의 frozen record, nested 요청의 pending, stale 반환 해제·latest frame1회 |
| slot identity·captured ids | 6 | PASS; callback의 새 ref/new id 보존·stale next 해제·slot-replaced 진단 |
| 초기 late admission·post-flush 종료 | 8 | PASS; local 반환 takeInitialized 거부/해제·slot등록0 및 frame flush 후 render/RAF0 |
| 실행 단위 | 104 | 신규 Node stdin 1회·고유11그룹 PASS11/FAIL0/exit0. VM의 actual 변경 소스 추출, 저장소 Three r160/public actor factory 사용. pagehide/RAF/UI/scene lifecycle ports는 fixture이며 실제 Chrome/GPU/native 인수0 |

검수 소스 핀은 위 39715/050f627b…이다. Node의 experimental VM Modules 경고는 실행 도구 경고이며 코드 검사 실패가 아니다. 기존 CPU7/47·GUI6/3·actor Chrome2·owner 모델11·DPR suite 재실행 및 합산0. fixture 호출의 pagehide/모의 RAF1을 trusted browser 이벤트 또는 실제 렌더 loop 인수로 승격0.

기존 owner memory 공식 end519bf6c5-b01d-4943-a74c-5f59fcfb4419@2026-10-06T20:24:59.163Z / rawSHA7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e의 모델11은 이전 이력이다. 새 endb7c855c2-b213-4860-af41-9a433e5aef9a@2026-10-06T20:37:33.547Z / rawSHAd07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001의 보고9 중 유의미7·U2 assert(true)2개는 근거 제외로 구분한다. 자연 matchMedia 별도 task 설명을 Three.dispose/EventDispatcher/주입 scene callback의 동기 재진입 불가 근거로 채택0. 직접 catch로 실패를 삼키기·finally 즉시 재귀 제안은 채택0, 전문 새 TASK/재송신0.

미해결 producer 경계는 actor-effect-lifetime.mjs L84–85의 두 번째 geometry ctor 실패 시 첫 할당의 반환 전 회수, L94–99의 material/Mesh/scene.add→all.push 사이 종료·등록 경합 및 진행 중 spawn의 등록 후 취소이다. consumer의 scene facade는 add 전 admission이며 이 경계의 leak-free/실제 물리 GPU 해제를 증명하지 않는다. 별도 owner 조사와 실제 검수를 기다리며 producer 원본·raw69·main code2·PNG·scene/nav·보호2_3/Q전용/어택티켓·사용자 save 변경0.

코드 변경 후 전체 docs 검색(제외 경로0)은164파일853줄/raw1164941 bytes/SHA10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f이다. 이 출력 중 actor/source 정확키워드로 좁힌19파일223줄과 모든164파일의 disposition을 외부에 보존한다. 소유 lifecycle docs3은 현재 구현·정확 값·인수 경계를 append로 동기화하고 이전 actual Chrome 실패/UNKNOWN·owner 모델·root main 문서 fullprefix를100% 보존한다. 운영docs6 및 다른 consumer 교차참조는 root 소유로 인계하며, 일반 자산 재생성·다른 시스템 reduced-motion 참조의 값을 임의 수정0.

외부 영수증: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-rebuild-consumer-guard/`의 preflight.json, before/, source-replacements-final.json, limited-source-result.json, docs-keyword-search.txt, docs-precise-matches.json, docs-search-disposition.json, final-receipt.json. 코드1+docs3 완료 핀을 root에 인계하며 Git mutation/commit/push는 지원 작업0, 원격 정확 SHA 보존은 root 다음 단계이다.

MAP PRODUCTION REPORT (§23): MASTER 기존 목적/LOCK·SSOT 이력 유지; LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL 원화·지형·배치·접지·nav·전투 변경0; CAMERA 신규 화면 검수0; TECH 신규 변경 source VM11그룹104조건 PASS, 이전 검수 반복0·실제 GPU/native6/audio/durable save 미인수. VISUAL VERDICT: RETOUCH / NOT ASSESSED. 화면 선명도·A급완성·실제 CH1-1 플레이 완료 선언0.
### ROOT-ACTOR-REBUILD-CONSUMER-BROWSER-20261007 후속 실제 관측 / 실패 이력 보존

코드1+docs14 완료 guard는 `bd0d89e10f0fab7ce843184dab44a951a296346a` normal commit/push·remote exact에 보존했다. world39715B/050f627b…와 actor12162B/a8089888…는 이번 화면 검수 전후 불변이다. 소스 VM11/104와 아래 실제 Chrome 조건은 별도 검수이며 합산하지 않는다.

| 새 실제 관측 | 정확한 인수·제한 |
|---|---|
| 최초 원실행 | Chrome1/context1/parent1/child3, 준비7PASS / raw0PASS·3waittimeoutFAIL·exit1. matches false→true였으나 change event0 / generation0 / old3 / dispose0, consumer 조건0도달. 제품 결함 판정UNKNOWN / 최초 실패·PNG 보존 |
| 승인 후속 | Chrome1/context1/parent1/child3, 신규3scope/15조건 PASS·FAIL0·exit0. 후속 필수setup10관측은 새로운 PASS 수에 포함0. 처음3FAIL을 교체·합산0 |
| native trigger | 실제 updateReducedMotion 리스너 readytrue 등록 확인. same-origin iframe는 parent CDP target 공유; 별도Frame session 미지원 오류 원문 보존. 실제 parent CDP Emulation 설정1회+500ms 순수대기/비폴링으로 browser-generated MQL isTrustedtrue 각child3 관측, synthetic-init fallback0 / OS사용자설정 변경0 |
| 최초 원인 경계 | matches getter polling 제거와 CDP설정 경로를 동시에 바꿨으므로 최초 실패의 단일원인 확정0. 실패를 소비자 결함 또는 특정 관측간섭으로 단정0 |
| retirement 오류 | old warrior dispose 호출 전에 슬롯INERT, actual public producer material throw 뒤 controlledError1/cleanupFailures1. old3 각dispose1, reducedMotion=true 새current3 실소비; generation1/idle/pendingfalse/factoryFailure0/cueFailure0/reasons빈값. 다른 actor 처리 계속 |
| 중첩 반환 | 실제 새 factory 반환 직전 synthetic MQL(isTrustedfalse)1: generation1 creating을 revoke→generation2 pendingtrue. 생성완료 stale handle1은 dispose1/update0, 기존RAF 시작의 pendingflush 정확1회→latest current3 소비. factory recursiondepth1/pendingRAF1. 이 합성 callback을 자연MQL/OS동작으로 승격0 |
| 종료 반환 | 같은factory 반환 직전 synthetic pagehide(isTrustedfalse)1: old3 및 unpublished new 각dispose1 / lateResourceRejected1 / INERT 유지. readyfalse/disposedtrue/epoch1/RAFfalse/pendingfalse, 이후 RAF요청·DOM변경·lateconsume/publish0. native navigation/pagehide 인수로 승격0 |
| actual render | 새 active consumer 상태에서 current program LINKtrue/getError0와 실제 existingRAF/render를 관측. post-unload GL0 조건을 쓰지 않음 / context loss 및 물리GPU메모리 해제 UNKNOWN·미인수 |
| 전체 새 실행수 | 이번 task만 Chrome2/context2/parent2/child6. 과거 child6/runtime3/actor2/CPU7/owner모델11·9/기존DPR 재실행·합산0 |
| 보호 / 오류 | source11핀 전후 exact, pageerror/consoleerror/HTTP404/foreign/mutation/download0, source scene clone 및 격리storage 불변. worker의 repo/docs/Git/save 쓰기0, 게임/서버 실행0 |
| 실제 화면 | `actor-rebuild-consumer-browser/followup/native-retirement-new-current.png`1096541B/`6bb5336279c87451b0812325b23b17706d6ef3afa0250ec6856b9ea013878670`; root가1600×1050 정지화면 직접확인. 다크드루이드 표시·retirement뒤렌더 관측, 배경 확대 흐림은 남음 / 모션영상·전체카메라·A급 인수0 |
| 정확 증거핀 | 최초raw72068B/`9be85d317ff8f5aee14697f61b38853d0765f72b34d58fba65744c63ccb5c1bd`; 후속raw506135B/`cdf3b38de667d402ba2d7b6403e2722cca77420fbbfeeb44b20d2ca759adbeb6`; summary23027B/`bd964b35919458ff01ac74fd0a3b38112359388bcdaba7564ed326b3f3046f2d` |
| 종료 영수증 / §23 | final-receipt6925B/`463398d6a8f55d5059bf612820febafec3f7c102c1b3201246270182c3afb1d7`; map-production-report4518B/`31cb0012ea6a76d9604a1dbfbf7e1dc8e47e406bba0ce7a37efffa61617b000c`, 외부 실제3387 독립fixture / 본편native6·save·audio 미인수 |
| 새 producer memory | 공식end `44504058-6e75-4e38-8bed-a4215bcfcfe1`@2026-10-06T20:45:49.855Z / raw7087B/`c80e2bb464ef4ee531d11ae70766fd8f14b969e780c53ed68d2c2f4edfb0cd9d`. reported7assertions는 실제producer source+fakeTHREE/scene, FIXED 일부모델; root실험0·GPU0·실dispose콜백재진입 증명0 |
| 다음 source 의존성 | read-only-plan21958B/`64bd2d583d9862064567d98e3d9de99d4bcad3aba2f630cf1224827191aca4ea`: geometry 부분할당, material/Mesh/add 실패의 private pending ledger+공통persistent dedup, 성공committed만 all.length/meshes집계가 필요한 미구현 계획. add attach후throw의 remove 실패를 숨기지 않음. update throw가 RAF를 멈추는 별도consumer 오류정책도 미해결 |
| 실제 후속 owner | 2026-10-06T21:01:27.103921Z 관측 CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY sent/peer/Read/source1·end0 / 메모리·파일0. Mesh 생성 실패·실dispose콜백 두 새단위만 기존owner 송신. 같은TASK/7assertions 재송신·재실행0. STORY기존큐 미소비, 실제4NPC·유품종류 질문pending / dependent지급만답대기·독립제작지속 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK=기존 silhouette·route·asset·배치·nav·ground 구조 변경0, guide/SSOT/LOCK 유지. PLAYABLE=3387 독립 실제worldlab iframe의 효과교체 소비자3범위만 관측; combat·실게임·보상·장전환·save/native6·audio0. CAMERA QA=새1600×1050 endpoint정지화면 확인 / START→EXIT 전체재생·영상검수0. TECH QA=최초3timeout 이력과후속3scope15조건 PASS를 분리, source11 exact·물리GPU UNKNOWN. FILES=worker 외부 증거만/root 관련docs 동기화, 타인WIP·원PNG/scene/nav·보호2_3·user save 불변. **VISUAL VERDICT: RETOUCH**.

관련 docs disposition은 신규 소스 완료단위의 whole164경로853줄/precise19경로223줄, `npc-canonical-identity-lookup/root-rebuild-docs-disposition.json`23701B/`d197783b7fd4c33868e274f7c502b747fc4f8756748e3ca5d59d8b8a599cb541`와 추가 current worldlab 참조 HELL_RIFT_EDITOR_RESULT를 따른다. 이번14문서의 과거 원prefix를 유지하고 EOF LF1로 새 사실만 동기화한다. 본편 defaultdemo→hub·childP/char·NPC durableACK/readback·실청취/native6/실save·A급 완료 선언0. WOLF 거절 목적 HOLD와 피해UNKNOWN은 기존기록대로 유지한다.
## 2026-10-07 ROOT-ACTOR-GEOMETRY-CONSTRUCTOR-UNWIND-20261007: 반환된 공유 geometry의 constructor 실패 회수

현재 public `tools/2_5d/actor-effect-lifetime.mjs`의 두 공유 geometry 생성 접점만 보강했다. 첫 constructor가 geometry를 반환하고 다음 constructor가 throw하면, 반환받은 자기소유 reference마다 독립적으로 dispose를 시도한 뒤 처음 constructor가 던진 값을 그대로 전달한다. 이 절은 앞선 geometry 부분할당 미해결 기록 중 **반환받은 geometry reference의 실패 회수**만 갱신한다. material/Mesh/acquire/등록·진행 중 spawn 및 consumer update 예외는 별도 미해결이다.

| id·소유 위치 | 정확한 계약·상수·오류 의미 |
|---|---|
| 현재 public source | 12639 bytes / SHA256 `6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb`. 직전12162 bytes / SHA256 `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`는 과거 dispose·Chrome 검수 핀. 외부 fullbytes 백업·생성 접점1 역변환 전체 원문 exact |
| 소유 edit 범위 | 공유 geometry 생성 직전의 private helper와 두 constructor try/catch만. 원문 나머지 API/defaults/provenance/spawn/acquire/material/Mesh/all/free/live/등록 및 dispose 본문 byteexact. root world39715 bytes / SHA256 `050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8` 불변 |
| private helper L84 | `unwindGeometryConstruction(owned)`. 한 호출 안의 `Set`으로 null·중복 reference를 건너뛰고, unique geometry별 `dispose()`를 각 try/catch로 독립 시도. 실패한 첫 해제를 다음 unique reference의 시도 중단 이유로 사용0 |
| 반환 reference 초기값 L93 | `dustGeo=null`, `attackGeo=null`. constructor가 정상 반환한 경우에만 변수에 reference가 저장됨. allocation을 하지 않은 null에 dispose 호출0. 반환 전에 내부에서 throw한 allocation은 이 module이 reference를 갖지 못하므로 회수 UNKNOWN |
| dust 생성 L95 | `new THREE.RingGeometry(0.55,1,28,1)` — innerRadius0.55 / outerRadius1 / thetaSegments28 / phiSegments1. 기존 인자·호출 순서 불변 |
| attack 생성 L96 | `new THREE.RingGeometry(0.62,1,24,1,-0.9,1.8)` — innerRadius0.62 / outerRadius1 / thetaSegments24 / phiSegments1 / thetaStart-0.9 / thetaLength1.8. dust 다음 호출, 순서 불변 |
| factory catch L97 | `unwindGeometryConstruction([dustGeo,attackGeo])` 뒤 `throw error`. 원 Error/object/null 등 thrown value를 동일 identity로 전달; error.message/string 변환·getter 조회0, 성공 handle 반환0 |
| cleanup 실패 경계 | dispose 자체가 throw해도 원 constructor 오류를 대체하지 않음. 이 좁은 변경은 추가 public 오류 API·cleanup counter를 만들지 않는다. 해제 실패가 없는 척하지 않으며, failed dispose attempt를 완료 해제로 인수0. 실제 producer 생성 catch에서는 두 번째 constructor가 throw할 때 두 번째 returned reference가 없으므로 보유 reference는 최대 첫 geometry1개 |
| borrowed·공유 소유 | 실패 생성 시 자기소유 반환 geometry만 시도. camera/terrain/scene/texture/material/Mesh 접근·회수 추가0. 정상 생성 뒤 geometry2는 기존 controller dispose가 공유 소유로 회수, mesh당 geometry 중복회수0. 두 성공 constructor가 같은 reference를 반환하는 주입 case의 기존 dispose identity dedup 유지 |
| public API·고정 defaults | `createActorEffectLifetime(deps={})` → frozen update/onActorChange/onSceneChange/dispose/snapshot. maxLive24 / dustLifeMs520 / attackLifeMs240 / stepMinIntervalMs110 / footBand4320 / dustColor0x1a140f·opacity0.5·size0.14 / attackColor0xc8623a·opacity0.8·size0.17 / groundLift0.003 / reducedMotion=false·depthTest=true 모두 불변 |
| root render overrides | lab 플레이어dust0.022·attack0.08, 드루이드dust0.042·attack0.145, depthTest=false 불변. dust rotation(-PI/2,0,0)·attack billboard·bands19/39·transparent/depthWrite=false·toneMapped=false 변화0 |
| 기존 dispose 계약 | L197의 기존 body 불변. 정상 첫 dispose 숫자=all.length, 반복0. 독립 정리 후 controlledError 의미·root cleanupFailures의 controller별 실패 집계 불변. 이번 constructor catch가 material/Mesh/scene.add 실패를 회수한다고 선언0 |

| 신규 검수 group | raw 조건 | 유의미 인수 조건 | 결과·관측 범위 |
|---|---:|---:|---|
| 정상 actual Three·접점1 원문 보존 | 8 | 8 | PASS. local Three r160 실제 factory·public API/defaults와 empty dispose 숫자, 소유 접점1 역변환 전체 exact; scene/renderer/GPU 실행0 |
| 두 번째 constructor throw | 5 | 5 | PASS. 실제 RingGeometry를 반환하는 constructor wrapper의 두 번째 호출만 실패 주입. 첫 geometry actual dispose event1, 원 hostile thrown object identity 그대로·message getter0; 두 constructor 인자 exact |
| 첫 constructor throw | 3 | 2 | 원 raw PASS. exact null thrown value와 ctor 호출1은 유효. 별도 disposeCalls=0 상수가 실제 hook에 연결되지 않은 assertion1은 근거 제외; 미관측을 dispose 관측 PASS로 격상0 |
| cleanup throw·원 오류 보존 | 3 | 3 | PASS. 실제 geometry의 dispose 실패 port를 주입: 시도1/actual dispose event0, 원 factory 오류 동일 identity. failed cleanup 완료 주장0 |
| 실제 private helper 독립·identity | 3 | 3 | PASS. 실제 변경 소스 helper를 CPU VM에서 추출해 duplicate/null/두 unique actual geometry references를 공급. 첫 시도 throw1 뒤 둘째 actual event1; 같은 reference 재시도0. factory가 실패 시 두 반환 reference를 보유했다고 해석0 |
| 성공 constructor alias | 3 | 3 | PASS. 주입 constructor2가 같은 actual geometry를 반환한 성공 case, 기존 shared dispose event1·반복0. constructor unwind 실패 경로는 아님 |
| 실행·판정 | 25 | 24 | 신규 Node stdin 단일1회, 고유6그룹 raw PASS6/FAIL0/exit0. 유의미 인수6그룹24조건·제외1조건. actual module import가 syntax 검사도 수행; 옛 모델7/11·CPU47/104·GUI 재실행0 |

원 raw25조건 및 제외 이유는 외부 `limited-result.json`과 `test-adjudication.json`에 각각 보존한다. 실제 정상 Three, actual geometry event와 injected constructor/dispose port, 실제 private helper CPU의 범위를 구분한다. GPU buffer upload/물리 메모리 회수·Chrome/네이티브·본편·청취·save ACK 인수0. 원 정상 API와 오류값 전달은 보존했지만 constructor 내부의 반환 없는 allocation, material→Mesh 생성 실패, scene.add→등록 사이 재진입·예외, 진행 중 spawn/live 재게시, worldlab update throw에 의한 RAF정지 정책은 미해결이다. parent가 새 acquire callback 공식 end13ccc735-8e0b-4cdb-a218-0a17e82fbb1b / raw7642 bytes·SHA256 e5f631661eb8f339cae217937a46d460b2d5279a91a1da59bc1c2f98b2cc8d96를 인계했다. 첫 stdin exit1 뒤 second11PASS는 owner의 실제producer+fakeTHREE/scene callback 결함재현 이력이며 public 수정완료0이다. 이번 geometry constructor 인수24조건과 합산0, 이 지원단위에서 새 메모리본문 검수·실험 재실행0; 별도 producer 후속의존성으로 유지한다.

코드 변경 후 전체 docs 관련 검색은 49경로662줄 / raw1406762 bytes / SHA256 `2889835670b2ae50daed3f019f28d4e9558be304b023a2238d9be24ed408021b`이며, precise producer 참조20경로313줄과 모든경로 disposition을 보존했다. 최초 scene.add component의 과도한 escape는 해당 component만 보완 조회하여 union dedup한 최종 검색으로 정정하고 원 출력도 보존했다. 소유 문서2는 이 완료 부록으로 정확 source·수치·의미·검수·남은 위험을 동기화한다. 그 밖의 rootops·SLICE·RESOLUTION·editor·SSOT·다른 consumer 현재핀 참조는 root에 인계한다. 일반 geometry/acquire·다른 시스템 수치를 임의 변경0, 보호2_3 및 owner 증거 이력 불변.

외부 증거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-geometry-constructor-unwind/`의 preflight.json, before/, source-replacement.json, limited-result.json, test-adjudication.json, docs-keyword-search-final.txt, docs-search-summary-final.json, docs-search-disposition-final.json, final-receipt.json. 원 문서 fullprefix를100% 보존하고 append 뒤 EOF LF1개만 둔다. code1+docs2 완료 핀을 root checkpoint에 인계하며 지원 작업의 Git/GUI/게임/server/전문송신/save 쓰기는0이다.

MAP PRODUCTION REPORT (§23): MASTER 기존 장면의 decorative producer 자원 생성 실패 보강; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL 지형·배치·원화·nav·전투 변경0, 기존 guide/SSOT/LOCK 이력 유지. CAMERA QA 신규0; TECH QA 신규 source 단일6그룹 유의미24조건 PASS·원raw25/제외1 분리·접점1 역변환 exact. 실제 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH / NOT ASSESSED**. 화면 흐림 개선·A급·실플레이 완료로 계산0.

## 2026-10-07 지형 콜백 종료와 효과 오류 격리의 현행 정본

ROOT-ACTOR-TERRAIN-CALLBACK-CLOSURE-20261007 및 ROOT-ACTOR-UPDATE-FAILURE-CONSUMER-GUARD-20261007의 완료 사실이다. 앞선 12639/39715 source·CPU24/104·Chrome15의 '현재' 설명은 해당 시점 이력이며 아래 핀이 현행이다. 맵 원화·geometry·nav·본편/P/G/세이브·보상·키바인딩·보호2_3/Q전용 magic blackBean·어택티켓 계약은 변경하지 않았다.

| 항목 | 현행 값·구현·검수 경계 |
|---|---|
| public producer | tools/2_5d/actor-effect-lifetime.mjs 12844B / SHA256 660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb. borrowed terrain.worldToScene 직후 disposed이면 p/mesh 접근 전에 place=false, spawn은 visible/live/spawned 재게시0. dust/attack 생성 및 기존 live 순회는 즉시 inactive stats 복사 반환. 원 terrain thrown value·기존 cleanup 오류 의미 보존 |
| public consumer | tools/2_5d-world-lab.mjs 41575B / SHA256 df1760cbf0c1862dc01e591011212aa5a65dcd8d807a49da0441778c5780994e. actor ID/handle/rig/epoch 캡처·snapshot 오류와 update catch 분리, 실패한 동일 slot만 INERT-before-release. 해제 callback 뒤 새 slot/선택/rebuild를 다시 쓰지 않음 |
| 재진입·프레임 | updateOwner가 있으면 살아 있는 정상 pose에서 장식 update만 skip(true), camera/dialogue의 나머지 pose는 유지. dispose가 먼저 owner/epoch를 무효화. pose/render/sample/UI 이후 lifecycle 확인 및 이미 예약된 RAF/document.hidden 확인으로 단일 기존 RAF 유지·종료 뒤 draw/UI/예약0 |
| readonly 진단 | __rift25Lifecycle.snapshot().effectUpdate 및 __rift25Lab.snapshot().effectUpdate = frozen {failures,phase,reasons:frozen copy}. failures는0 시작·caught effect update마다+1·Number.MAX_SAFE_INTEGER 포화. phase=idle/snapshot/updating/retiring, 실패한 현행 slot reason=update-failed, 새 rebuild publish는 해당 reason을 빈문자열로 갱신. 고정 status 리프에 '효과 재생 오류 N' 표시 |
| 소유·미해결 | 아직 다른 slot이 같은 handle을 보유하면 실패 slot에서 release를 보류하고 최종 teardown에 맡김. alias 완전 인수0. material/Mesh/scene.add private pending ledger, 참조 미반환 constructor 내부 할당, rig.snapshot 원오류→readytrue/RAF0 복구는 별도 미해결. Error.message/getter 조회0 |
| 정상 상수 | maxLive24, dust520ms/attack240ms/간격110ms, footBand4320·bands19/39, groundLift0.003, public dust0.14/attack0.17, RGB0x1a140f/0xc8623a·opacity0.5/0.8·reducedMotion=false·depthTest=true 불변. lab 플레이어dust0.022/attack0.08·드루이드dust0.042/attack0.145·depthTest=false 불변 |
| 새 producer source 검수 | 단일 Node 실행9그룹37조건 PASS/FAIL0/exit0. 실제 Three/public producer + 주입 borrowed terrain callback/event의 범위. old24/104/전문13 재실행·합산0 |
| 새 consumer source 검수 | 단일 Node 실행13그룹105조건 PASS/FAIL0/미도달0/exit0. 변경 source18함수/readonly hook·정상 actual Three/public producer. DOM/RAF/renderer/pagehide는 VM fixture이며 Chrome/GPU/native 인수 아님 |
| 새 실제 브라우저 원결과 | 기존3387 격리 parent의 Chrome1/context1/parent1/child5, 원4scope PASS/1scope FAIL·19조건 PASS/1조건 FAIL·exit1 보존. selection scope의 reason==='disposed' 기대실패이며 종료 후 onActorChange가 reason만 바꾸는 실제 source를 관측. activefalse/live0/pool0·해제 event·postwrite0와 같은 뜻으로 취급0 |
| 새 저장자료 제한 평가 | 추가 Chrome/context/child0, 기존 성공19 재평가0. 원 failed 공통1 설명과 미도달4만 after/failureObservation JSON pointer로 좁게 평가하여5지원/UNKNOWN0/exit0. 원 browserFAIL·exit1을 대체하거나5 clean browserPASS로 합산0 |
| 새 실제 화면 | 실제 다크드루이드 이동 y3740→3709.684 및 walk 대표 PNG를 root가 직접 확인. 새 active GL LINKtrue/getError0와 선택변경 뒤 정상 silvertail updates1→2·frames20→21/old16고정 관측. 합성 선택/pagehide는 isTrustedfalse, 실제 물리 GPU 회수·전체카메라·영상·본편native6·청취·보상save 인수0 |
| 공식 memory 입력 | end bb77d9f1-d84b-4851-9e04-cd477b7594c1@2026-10-06T21:10:48.664Z / raw6260B e12cbb9e0c3b4aaee0b28126c654f5ae3ae602cfe6e5f5a9c459c5dded0ad698. reported13은 실제producer7+frame모델6; root source105/37과 합산·실험 반복0 |
| 다음 작업·운영 | 기존 owner의 UPDATE-RETIRE-CALLBACKS 메모리 TASK 송신1은 새 전문 중복지시 없이 공식 end/첫source만 수집. root 소유 producer ledger·rig fatal 진단/회복·선명도·본편 최소 연결은 미완료. 실제4NPC·베린 유품 품목 질문은 해당 지급만대기, STORY 미소비 큐 재송신0. 24시간 제작·주간 사용률 약15 percentage points/day 목표 유지·이 채팅 일일 정확 token 보장0 |

전체 docs 관련 검색은 after-review 27경로538줄/899461B/SHA256 ab9c872435dd23e436143bc6ee613e6689fc13b67a33205ba1d34a8fa87ae4d2이며 모든 경로 disposition을 보존한다. 최초 draft 검색27경로608줄/1059412B/96ada057a39adb91ea8640e3443ca1b50dfb7b072e68790921b67e1d9cc4ac18도 이력 보존. 소유 문서는 원 fullprefix100%·EOF LF1을 보존하며 code2+관련 docs의 정상 commit/push·원격 exact 확인으로 이어진다. 타인 foreign68·owner STATE/LOG4·held WOLF raw 및 이전 승인 거절 목적은 변경하지 않는다.

MAP PRODUCTION REPORT (§23): MASTER=지옥의 틈의 actor cosmetic 수명·프레임 오류 격리. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL=원화·대지·배치·nav·전투 변경0/기존 guide·SSOT·LOCK 유지. CAMERA QA=새 독립3387의 이동·walk endpoint PNG1 직접 확인/전체 여정·영상 미인수. TECH QA=producer9/37, consumer13/105, 원 Chrome19PASS1FAIL/exit1 및 저장자료 좁은5지원 평가를 분리. 실제 물리 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH**. 배경 확대 흐림이 남아 있으며 A급·실플레이 완료로 계산하지 않는다.

외부 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-callback-closure/final-receipt.json (9184B/c054acf05392da5e7228751beb6a7078e99cb0de1ca26ca1425682cf47beec18), actor-update-failure-consumer-guard/final-source-receipt.json (9352B/2c9cf0d08802276b243e7a9c31b16ef27d802a61bd9785c881ccaa1a69f2da2e), actor-terrain-frame-browser/ 원실패·제한평가·PNG 및 actor-update-failure-formal-end.json (6871B/7bb543948989cc2f3c6ca3b1d2c65556bde7cdf58daa3762d518fe8036e09ebd). 최초 소비자 draft41558/a811 검토의 paused pose 회귀는 검수 실행 전에41575/df1760으로 보정·백업 보존했고, rig snapshot 원오류 미해결은 숨기지 않는다.

브라우저 exact evidence / final receipt6200B: 88e918fa55e90ac33b26e113d7d1a7d4d1a29a8ee9f43686fc86e104a947a735; summary25866B/dbf709bf5f9d1fb370c5030c9f75e280e6db5a9a787785b43dacfd5c705d7091; §23 report4251B/1160af0c152b54c9b2c15076fbd3cc1137d0f247915dfaed9855299a1a95e532. 실제PNG1093251B/68c096c355ec2c065d5ac9d67f68eb9b71e0a91182bd546b0b484c047d1f1250, 경로 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-frame-browser/actual-motion-after-isolated-update-error.png.

### 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007 · 현 소비 계약

| 항목 | 현재 구현 / 인수 범위 |
|---|---|
| public source | `tools/2_5d/actor-effect-lifetime.mjs` 14758 B / SHA256 `95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44` |
| 획득 소유권 | material·Mesh 반환 참조는 private pending으로 기록. 성공적으로 등록된 항목만 기존 `all`·`meshes`·최초 `dispose()` 반환 수에 포함한다. pending 개수 공개 0 |
| 종료·부분 실패 | ctor 반환·Mesh setter·scene.add 종료 뒤 disposed guard. 추가 게시·후속 root setter/add 차단; add 진행 중 detach는 반환 뒤 처리하여 dispose 뒤 attach를 누락하지 않음 |
| 회수 중복 | rollback/dispose는 같은 controller의 persistent identity dedup을 공유. borrowed scene/terrain 회수 0. remove 및 owned release 실패를 성공 해제로 계산하지 않으며 재시도 0 |
| 새 snapshot 필드 | frozen `allocationCleanup={detachFailures,releaseFailures}`. 각 primitive 안전정수 0 시작, 해당 실제 예외에 1 증가, `Number.MAX_SAFE_INTEGER`에서 포화 |
| 원 오류·수치 | constructor/add의 원 thrown value(null 포함) 유지. 정상 API·풀/수명/밴드/초기 committed 숫자와 기존 update/terrain guard 보존 |
| 최초 source 검수 | 14628 B / `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`에서 실제 source·Three와 주입 ctor/borrowed scene 콜백의 단일 Node 16그룹·162조건 PASS. 기존 검사 재실행 0 |
| 읽기 반례와 제한 보정 | root 읽기검토의 Mesh setter→dispose→late scene.add 가능성은 native 실제 관측이 아니다. 해당 경계만 새 source에서 신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0; 최초162와 합산·핀 이동·원 실패 교체 0 |
| 한계 | 참조 미반환 ctor 내부 할당 UNKNOWN. 임의 ctor identity alias·dependency 자체 외부 late write 일반 보장 0. 실패 remove의 실제 attached 상태·release event 0은 회수 성공이 아니다. GUI·GPU·본편/native6·청취·실save 새 인수 0 |

원 source12844/660f와 종료 소비자41575/df1760는 각각 보존 이력이다. 이번 변경은 효과 자원 획득·회수 계약이며 맵 PNG/scene/nav·geometry 배치·카메라·전투·Q 전용·보호2_3 변경 0. §23: 작업=효과 allocation consumer, MASTER/지형/플레이/랜드마크/세부/카메라 새 제작=0, TECH=신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0 및 이전16/162를 별도 기록, 신규 VISUAL NOT ASSESSED / 기존 전체 RETOUCH. 같은 검사·TASK·이력 재실행 0.

다음 미완료: 맵 흐림·절벽 접합 시각 품질, rig.snapshot/render fatal frame 복구, NPC 유품·부탁의 본편 durable 소비자, 실제 native6·청취·보상 save. 최신 운영 근거는 PROJECT_MANAGEMENT_MASTER와 연속 dispatch 정본을 따른다.

### 2026-10-07 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007 · 현재 비교 consumer와 실화면 인수

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| ground source | `tools/2_5d/rift-ground-detail.mjs` 21249 B / `830eef30ee9bc9e74219d12fa954300796a5b2ee53ce961bc3544affdfb8837e` |
| terrain source | `tools/2_5d/rift-terrain.mjs` 16816 B / `c7079fdbc32f4d19cc9ee89e6dc67ae81d6cb92d7d28e7169d29829ed45d44a0` |
| lab source | `tools/2_5d-world-lab.mjs` 42125 B / `4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101`; HTML 12266 B / `e2f0f1692df08f67bc2e6dc42f8e692a53ca060e33833813c8f58492adb8089c` |
| 비교 UI / API | `plate-sharpness` select 0 / 0.5 / 1, 기본0/OFF. leaf `plate-sharpness-status`. 새 factory옵션 `plateSharpness=0, renderer=null`(borrowed), ground/terrain `setPlateSharpness(number)`; 유한 number0..1 검사. `__rift25Lab.snapshot().terrain.groundDetail.plateSharpness`의 requestedStrength/effectiveStrength 구분 |
| 처리 범위 | 등록된1254×1254 원 plate의 ground RGB 확대만 Catmull-Rom 16 taps와 중앙2×2 채널별 min/max clamp. UV texel-centre clamp. 기존sample의alpha·multiply 보존. gamma 변환 추가0·원PNG/scene/nav/geometry/camera/rig/save 변경0 |
| 활성 조건 / fallback | 실제같은borrowed renderer·pinned Three160 map chunk·등록plate·WebGL2 또는 엄격WebGL1 OES_standard_derivatives. 양축 derivative footprint >0 및 ≤1 조건에서만 확대RGB 재구성. unknown/mismatch/minifying는 원plate. ground-detail OFF 또는 dispose 뒤 effective0. compiled는hook 계약이며 LINK 인수와 별개 |
| 샘플 비용 | 활성확대 plate 원1+추가RGB16=17 fetch(기존대비+16). 기존ground nominal4→20, 조건별분기·GPU실측아님. 읽기계획의+15는 미채택 제안 이력. 추가 texture/geometry/renderer/RAF/timer0 |
| source Gate | 동결code4의 신규 Node1회 11그룹153조건 PASS / FAIL0·미도달0·exit0. actualThree160/actualfactory·shaderhook와 GLSL CPU계산; image decode/canvas/renderer capabilities는fixture·GPU0. 이전suite 재실행·합산0 |
| 실Chrome Gate | 같은4source핀 신규 Chrome1/context1/labpage1/child0. 6그룹13조건 PASS / FAIL0·미도달0·exit0, 재실행0. paused160%/DPR1/전사(5480,3740)/detailON 동일조건에서 실제select handler→uniform 0→0.5→1→0. source4+보호8 exact·scene/storage 불변. selectOption change는isTrustedfalse |
| 실제 픽셀 | 0.5 RGB600148px / 1 RGB745063px 변화, 합성최종framebuffer alpha차이 각각0. OFF복귀 RGBA 및PNG exact. 이 alpha는 중간 원plate 투명shader alpha의 독립 검증이 아니다 |
| 실제 LINK / 비용 관측 | 13program LINK true·GL0·404/오류/foreign0. 각조건 warmup8+renderer.render wall60표본 median 0/0.5/1/복귀 = 0.5/0.6/0.5/0.6ms, calls11/triangles2456 동일. GPU시간·17fetch 비용실측·실물성능 보장이 아니다 |
| 시각 판정 / 적용 | root와GUI담당이 원본/강함PNG 직접 관찰. 바닥 결·윤곽 소폭 강화, 절벽·뿌리 저해상도 흐림은 여전히 큼. 전체 VISUAL VERDICT: RETOUCH. 비교기능만 적용, 기본0/OFF 유지·새디테일복원/A급완성/맵선명도완성PASS0 |
| 정확 근거 | implementation/final-receipt16070B/c2bdd2f21f4315a4eb5398e300095f8ebca4fb594167fa2e19d8b72435bdcc8a. browser/final-receipt9199B/b800f617a39c8f800a0a4c280a760213c943ea5374e02c5323de186f35962a31. source153과GUI13 합산0. readonlyreview7443B/c3f39c3320b37c7e50097383219b1193df552519dc97f09420a6d8ec0404ac4e는같은4핀초안읽기, 테스트아님 |

§23 MAP PRODUCTION REPORT: 작업=등록지면RGB 확대비교; 선행=fullguide·SSOT_INDEX·stageLOCK와exact읽기계획37853/a6df. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존등록공간보존/새geometry·배치0. CAMERA QA=동일paused160%/DPR1 새Chrome A/B·복귀·전사동작재개. TECH QA=source11/153와GUI6/13 별도핀·source12 exact·LINK13/GL0. VISUAL VERDICT: RETOUCH. PNG4와controls1은 외부 `plate-sharpness-ab-browser/`에 보존. 본편/native6·청취·실보상save·GPU물리메모리·실물모니터·독립platealpha 미인수.

현재shader 비교기능의기본OFF와전경/절벽흐림 RETOUCH를유지한다. 다음작업은실editor mask1024중간축소·feather/cache 및fatalframe 소비접점, NPCdurablebinding·본편native6/청취/save이며 정본PROJECT_MANAGEMENT_MASTER의 최신운영근거를따른다.
