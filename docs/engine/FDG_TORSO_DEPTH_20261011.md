# FDG 흉곽·골반 실제 깊이 저작 r7

2026-10-11, Asia/Seoul. 인수된 r6의 앞면 UV·32본·3클립·발·다리·꼬리 레이어·FX를 보존하고, 보이는 흉곽과 골반 앞면의 실제 Z 곡률과 짧은 옆단면을 추가했다. **ENGINE_AUTHORING 추정 형상**이며 원화의 숨은 표면 복원이 아니다. 작은 좌우 시점과 대기→공격 1회→대기 복귀를 실제 CPU Canvas 소비자에서 확인했다.

| 배송 항목 | 현재 값 |
|---|---|
| builder / 입력 | `tools/fdg-studio/build-hell-aberrant-torso.mjs`, `buildTorsoDepthScene(baseline)` / 동결된 r6 `hell-aberrant-tail-idle.fdg.json` 읽기 |
| CLI 출력 | 기본 `tmp/hell-aberrant-torso-r7`; `FDG_TORSO_OUTPUT`으로 지정. PNG·source pixel 읽기 0, r6 fixture 쓰기 0 |
| scene | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json`, ID `hell-aberrant-torso-depth-scene-r7`, **859941B**, SHA256 `98ea7bf3399e90f4e34f3b244ec7dfa76d9bcc81ba6e5bd1598d0ba759a8a3c9` |
| standalone rig | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.rig.json`, ID `hell-aberrant-torso-depth-r7`, **752920B**, SHA256 `744a087e7e71b142846c7eee614d7c07d2dd1514bbf09cb3a55c0027ec7a6385` |
| 메시 | **3895정점 / 4894삼각형**. 원본 3864정점·4850면 prefix 유지, rear 31정점·저작 side 44면 추가 |
| 곡률 / 옆단면 | 원 torso 앞면 57정점=흉곽 40+골반 17. 명시적 atomic 경계 22구간=흉곽 13+골반 9, 서로 떨어진 구간 사이를 연결하지 않음 |
| 원 좌표·단위 | source 832×1248, model 변환 `x=(px−500)/300`, `y=(1140−py)/300`; 원 XY·UV·weights·triangles·drawOrder 보존 |
| 앞면 Z | 흉곽 `.026402068371157716.. .2787834444444444`, 골반 `.046791111111111276.. .1995` model unit. 타부위와 같은 sourceXY 접점 추가 Z=0 |
| rear / plain 색 | 흉곽 Z=−.18 / `#756871`, 골반 Z=−.12 / `#665b65`. 원화에 없는 면에 새 텍스처를 만들어 붙이지 않음 |
| side 면적 | bind 실제 3D 면적 `.0003999999999999959.. .005531726674375732` model²; Z span·면적은 평면 회전/조명만의 변화가 아님 |
| 접합 | source weld·collinearity tolerance .0001px. 기존 torso coarse edge의 중간점 제약40개를 12passes로 선형 정렬, 최대 Z 오차 `1.3877787807814457e−17` model. 분석용 weld만 사용하고 원 topology·weights를 바꾸지 않음 |
| 보존 | 32본 / 재질 1 / 클립 3 전체·27 cap pins·모든 비torso 정점·꼬리 layer−2·원 텍스처·기존 sequence/FX 설정 유지 |
| 시간 구분 | 기존 rig 클립24FPS와 owner60Hz 유지. 캐릭터 sprite24장·24FPS 제작 목표와 별개이며 신규 PNG 프레임 제작0 |

ROI polygon 2개, source Y별 profile ring 8개, 수식·명시 side front/rear/face index 22행은 [리그 프로젝트 계약의 r7 표](FDG_RIG_PROJECT.md)에 코드값 그대로 기록한다. root/pelvis/사지/꼬리 본, 다리·발 형상과 가중치는 수정하지 않는다. 전체 뒤쪽, 새로운 사지, PBR, GPU backend, 새 캐릭터와 native 전투 연결은 이번 형상에 포함하지 않는다.

## 필요한 소비 접점

| 접점 | 정확한 계약 |
|---|---|
| `mesh.faceColors` | optional, triangles와 같은 길이. `null`=기존 선택 재질/원 UV, RGB6hex `#rrggbb`=명시적 저작 plain 면. 잘못된 길이·색·sparse slot 거부. r7 첫4850개 null, 새44개 plain색 |
| `evaluateRig` | optional faceColors 독립 배열 복사. 기존 texture/UV/layer 및 실제 3D LBS 유지 |
| `drawRigAuthoringTriangle` | finite projected XY·유효 RGB6hex·triangle 검사. signed 2배 screen 면적 abs≤`1e−9` 생략. save/path/fill/restore, 지정 plain색 그대로, stroke0, 실제 fill 반환0/1 |
| Scene / RigPreview | 동일 sorted face 순서에서 texture/authoring 선택. `textureDraws`=drawImage 수, `authoringDraws`=plain fill 수. Scene textured 반환값은 둘의 합. 기존 untextured 일반면은 fill+stroke2연산, 명시 authoring 면은 fill1연산. Preview는 두 snapshot 카운터 제공 |
| 정면 / 좌우 | yaw0·pitch0에서 side 투영 면적0 → texture4850/authoring0. 실제 ±22° yaw / +6° pitch에서 texture4850/authoring44. source 앞면을 변색하거나 flat 사진 회전으로 깊이를 대체하지 않음 |
| cache / 기본 프리셋 | Studio의 새 scene fetch는 `hell-aberrant-torso-depth.fdg.json?v=torso-depth-r7-fixture`. 변경된 rig 소비 경로와 두 HTML의 module entry key `torso-depth-r7`. 기존 public preset ID·idle/once/FX 설정은 보존. standalone 기본 프리셋은 기존 r3 자료 유지, r7 rig 가져오기는 지원 |

## 새 검수와 실제 재생

E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-depth-r7/`.

| 새 증거 | 관측 / 판정 |
|---|---|
| `test/fdgTorsoDepth.test.mjs` | **최초6/6 PASS, 1300.32ms**, fail/cancel/skip0. prefix·재현성·실제곡률/atomic side 면적·접합·strict schema·독립 복사·두 소비자·9새 LBS samples·owner 전환/FX/capture 검사. 기존 suite 반복0 |
| source / 접합 보존 | original prefix XY/UV/weights/tri/layers와 비torsoZ·32bones/clips3/source/sequence 설정 deepEqual. 신규9 LBS samples의 limb/worldbone/foot/27capXY/side endpointXY drift0. skin seam이 없는 전체 모델 완성을 뜻하지 않음 |
| owner / FX | public Play 후 공격1회, demo .900초에 event1/emitted1, 기존24셀·16FPS·1.5초 FX 자연 만료, 3초 공격 종료 후 .35초 idle 복귀. 시간·clock 직접 변경0 |
| 정면 실제 GIF | E/`front-idle-attack-idle.gif`, **61 CDP JPEG frames / 5790ms / 960×540 / 9757923B**. yaw0/pitch0, 기존 node scale80인 화면 실제 대기→한 번 공격→대기. source `front-playback.json` |
| 오른쪽 실제 GIF | E/`right-depth-idle-attack-idle.gif`, **59frames / 5620ms / 960×540 / 9349266B**. yaw22°=`.3839724354387525rad`, pitch6°=`.10471975511965977rad`, depth 변형·동작·FX 함께 관측. source `right-playback.json` |
| 작은 좌우 화면 | E/`left-yaw-minus22-pitch6.png`, `right-yaw22-pitch6.png`, 실제 public inspector 편집. 왼쪽 yaw−22° / 오른쪽+22°, pitch+6°. DOM fill만으로 값 표시가 바뀐 초기 candidate는 채택하지 않고 native 숫자 Up 입력으로 실제 project.camera 변경을 확인 |
| 실제 저장·재열기 | **public save1 / reload1 / export2**. `save-reopen-receipt.json`, `saved-reopened.png`; fullProject/fullExportJSON/mesh/weights/materials/clips/3895posed vertices/32bone positions 모두 동일 |
| 보존 포즈 / 실행 reset | 저장 idle `1.649999999999999초`, yaw22°/pitch6° 보존. 재열기 runtime clock0, sequence ready, activation0/event0/emitted0/FX0. 각 export **3130350B**; 자동 다운로드 두 번째 이름 `fdg (1).json` 판별, export 재시도0 |
| 새 문법 | 실제 변경된12 JS/MJS module syntax PASS; E/`new-syntax.json`. 전체 게임/GPU/동시성능으로 확대하지 않음 |
| 백업 / docs | E/`code-backup` 13기존 파일과 `docs-backup` 17문서 수정 전 보존. 전체 관련 rg/literal grep 후17관련 docs+본 보고서 동기화 |

root는 새 정면·좌우 원 화면과 실제 공격 중 프레임을 직접 보았다. 현재 범위의 실측 깊이·원 앞면 유지·접합·동작은 **VISUAL VERDICT: PASS**다. 전체 캐릭터 판정은 **RETOUCH**다. 잔여항목은 정확히 **1개 `SOURCE_GAP`**: 원화에 없는 뒤쪽·가려진 표면의 정본 메시와 텍스처 미확보. 회색 저작 단면은 그 원자료를 복원한 것이 아니다. PNG/source 수정, Q/E·native 전투·게임 save·맵/LOCK/타인 WIP 변경0. 과거 r2~r6의 인수와 proof는 동결한다.

## MAP PRODUCTION REPORT — §23, 엔진 형상 범위

```text
STAGE: ENGINE_AUTHORING torso-depth-r7 (맵 제작 N/A)
MASTER: silhouette/regions/main route/side spaces=N/A
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes=N/A
LARGE: source assets/composites/overlap/repeated silhouette=N/A
MEDIUM: connections/remaining holes=N/A
GROUND: shadow/contamination/structure integration=N/A
PLAYABLE: main arenas/travel/breathing/threat space/combat readability=N/A
LANDMARK: primary/secondary/tertiary=N/A
CAMERA QA: START/EARLY/ARENA/LANDMARK/LATE/EXIT=N/A; SIDE L/R=실제 yaw−22/+22°, pitch6°
TECH QA: route/collision=N/A; pageerror=새 화면 error log0; 404=오류보고0, 별도 network전수검사 없음; seam=새 torso 제약 PASS;
         loading=실제3895정점/4894면 ready; performance=CPU Canvas local proof, 전체게임/GPU 주장 없음
FILES: stage-owned=새 builder/fixture/test, 기존 rig schema/evaluator/두 renderer/cache/UI, 관련17docs+보고서;
       concurrent touched=0; unrelated touched=0
GIT: staged=이번 소유 code+docs; commit=소유 local checkpoint, SHA/결과는 E/checkpoint-receipt.json; push0; deploy0
VISUAL VERDICT: PASS (좁은 torso 깊이), 전체 캐릭터 RETOUCH / SOURCE_GAP1
NEXT PASS: 현재 단위 제출 후 기존 담당의 다음 한 단위 지시. 정본 숨은 표면 자료 미확보는 유지.
```

local checkpoint 결과는 E/`checkpoint-receipt.json`의 이번 소유 code+docs 저장에 한정한다. push·deploy는 수행하지 않는다.
