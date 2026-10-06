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


실버테일16枚1254²RGBA 고해상도텍스처는약96MiB GPU원본예산의desktop실험이다. decoder/mipmap/renderer총사용량·휴대폰/장시간성능을인수하지않았다. 현재선택배우만update하나texture는세캐릭터를로드한다. effect3×cap24/possiblepool72,OSreduced-motion livechange면3effect인스턴스재생성·기존meshdispose,추가RAF없음.
