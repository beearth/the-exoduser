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
| 연동 | SKILL·ANIMVFX정정publicconsumer 실제채택. 공격1회edge수명.81/.81/.6초,foot앞뒤actor20/40-전경30동일transparentpass |
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
