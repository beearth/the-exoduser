# FDG 몸통 단면 연결·피부 톤 마감 r8

2026-10-11, Asia/Seoul. 총괄은 r7의 실제 Z·저장 계약을 기술·저작 범위로 인수했지만, 작은 오른쪽 시점의 흉곽 아래·팔 접점에서 밝은 단색 단면이 분리된 패널처럼 보이고 둥근 볼륨 인상이 약하다고 **VISUAL RETOUCH** 판정했다. r7와 이전 자료는 동결하고, 같은 짧은 단면의 깊이 연결과 저작 색만 마감했다.

| 실제 변경 / 배송 | 정확한 값 |
|---|---|
| 입력 / builder | 동결된 `hell-aberrant-torso-depth.fdg.json` / `tools/fdg-studio/build-hell-aberrant-torso-side-finish.mjs`, `buildTorsoSideFinishScene(baseline)` |
| 출력 | 기본 `tmp/hell-aberrant-torso-side-finish-r8`; `FDG_SIDE_FINISH_OUTPUT`으로 소유 경로 지정. PNG/source pixel 읽기0·원 r7/r6 쓰기0 |
| scene | `tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.fdg.json`, ID `hell-aberrant-torso-side-finish-scene-r8`, **867875B**, SHA256 `49ee20af6ea78db697440c8bedcd5fa760f5df898d0aeda2ec9b98890c1ace03` |
| standalone rig | `tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.rig.json`, ID `hell-aberrant-torso-side-finish-r8`, **760840B**, SHA256 `b6be4301ae9ebccf363b175325714dd0b2ac95c194cc024881dc373e5eb34b8c` |
| 기존 형상 | **3895정점 / 4894면** 그대로. 원3864 XYZ, 전체 XY·UV·weights·topology·drawOrder 보존. 앞면 곡률·원 texture 변경0 |
| rear taper | 기존31rear정점에 연속 sourceY profile 적용: 실제 Z24개 변경, 최대 깊이 plateau7개 유지. 흉곽 −.18..−.12240000000000001, 골반 −.12..−.0816 model |
| 실제 면 유지 | 기존22구간/44side면 전부 유지. geometry 삭제·culling·표시 숨김0. 9동작 표본의 최소 Z span .0816model=24.48 source-equivalentpx, 실제 side 3D 면적 `.00037996251032275445.. .004940618460543637` model² |
| 단면 톤 | 기존 faceColors 접점으로44면의 어두운 저작 톤10종 적용. 앞면 인접 삼각형은 조금 밝고 rear 인접 삼각형은 조금 어둡게 하여 연결을 읽음. 새 조명·PBR·텍스처·GPU/backend 변경0 |
| 보존 | 32bones·3clips·1material·발/다리·27cap·tail뒤 layer−2·idle→once→idle·FX 전체·native Q/E·game save·map/nav/LOCK·타인WIP 변경0 |
| source 권위 | 원화 없는 옆면은 계속 ENGINE_AUTHORING 추정. `depthAuthoring`의 r7 `rearDepthModel`/`sideColors`는 동결이력, 현 runtime 정본은 **mesh.vertices/mesh.faceColors**, 이번 정의·배송 record는 **provenance.sideFinish** |

## 기존 단면을 다듬는 값

sourceY=`1140−vertex.y×300`, rearZ=`originalRearZ×factor(sourceY)`다. profile knot 사이의 factor는 선형이며 양끝 밖은 첫/마지막 factor로 고정한다. 동일 rear 정점은 하나의 값을 공유한다. 기존 front endpoint와 sourceXY/weights를 그대로 두고 최대 깊이를 유지하면서 끝 부분만 완만하게 줄인다.

| part | sourceY → factor |
|---|---|
| chest | `432→.68, 464→.88, 512→1, 560→1, 592→.90, 624→.72` |
| pelvis | `640→.72, 656→.92, 688→1, 704→.90, 720→.68` |

각 구간의 첫 side triangle은 front role, 둘째는 rear role다. 두 front endpoint 평균 sourceY의 factor로 `toneFactor=.9+.1×factor`를 구한다. baseRGB 각 성분에 곱하고 `Math.round` 후 RGB6hex로 저장한다. 이는 원화에서 추출한 조명·피부색이 아닌 명시적 저작 색이다.

| part | front role baseRGB | rear role baseRGB |
|---|---|---|
| chest | `[40,34,37]` | `[29,26,29]` |
| pelvis | `[34,30,33]` | `[25,23,26]` |

최종 색10종: `#181619`, `#181719`, `#19171a`, `#1c191c`, `#1d1a1d`, `#211d20`, `#221e21`, `#272124`, `#272224`, `#282225`. 각면 대응 r7 색 대비 weighted 8bit RGB 밝기 비율 최대 `.33042556994644995`다. PNG의 실제 피부색을 샘플하거나 그 값과 비교한 결과로 해석하지 않는다. 값·31rear/44face record 구조는 [리그 프로젝트의 현재 r8 계약](FDG_RIG_PROJECT.md)에 동기화했다.

## 현재 크기의 새 실제 검수

E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-side-finish-r8/`.

| 새 증거 | 관측 |
|---|---|
| 현재 화면 | E/`front.png`: yaw0/pitch0. `left-minus22-pitch6.png` / `right22-pitch6.png`: 기존 node scale80, yaw−22/+22°, pitch+6° 실제 public 편집 |
| 실제 단면 | 양쪽의 texture4850+authoring44. 실제44 fill을 유지하면서 밝은 패널 인상이 줄어듦. 원 앞면 변색·단면 전체 숨김으로 대체하지 않음 |
| 실제 재생 GIF | `side-finish-idle-attack-idle.gif` / `playback.json`, **60 CDP JPEG frames / 5540ms / 960×540 / 9416644B**. 오른쪽22° / pitch6°에서 public Play→공격1회→대기복귀, actual activation1/event1/emitted1/끝FX0 |
| 실제 동작 관측 | `.317/.917/1.667초` 가까운 관측값은 `.3333333333333333/.9000000000000011/1.6333333333333324초`. screenshot/frame은 실제 캡처 시점이며 지정 시각 합성0·runtime clock 변경0 |
| 새로운 검사 | `test/fdgTorsoSideFinish.test.mjs` **최초4/4 PASS, 2175.09ms**, fail/cancel/skip0. 허용 delta·독립 profile11knots/plateau·모든면의 밝기·9동작의 깊이/면적·실제 capture/JSONreload 보존에 한정. 기존6suite 재실행0 |
| 동작 접합 | 9표본의 original prefix 실제LBS·world bones·발·27capXY·front/rear model XY drift0, side 면적 모두 양수. 면적>0은 비퇴화 근거이며 자기교차·전체 모델 visual 품질로 확대하지 않음 |
| 공개 저장·재열기 | public save1 / 실제 reload1 / export2. E/`save-reopen-receipt.json`, `saved-reopened.png`. fullProject/exportJSON/mesh/weights/materials/clips/3895posed vertices/32bone positions 동일 |
| 보존 / reset | 저장 idle `1.5499999999999994초`, yaw22°=`.3839724354387525rad`, pitch6°=`.10471975511965977rad` 보존. 재열기 clock0/sequence ready/activation0/event0/emitted0/FX0. exports 각각 **3151574B** |
| 공개 배송 버튼 | 재열기 후 현재 `studio.js?v=torso-side-finish-r8` 확인. 새 데모 버튼이 r8scene을 `hell-aberrant-torso-side-finish.fdg.json?v=torso-side-finish-r8-fixture`로 fetch, `public-preset-ready.json/png` |
| 검사 한계 | 수정한 JS2개(studio.js/builder) syntax PASS. HTML entry1 cache key 변경은 JS syntax count에 넣지 않음. 새 page error log0. 전체 game/GPU 성능·원source·oldroute/Git 전수 재검수0 |
| 수정 전 백업 | E/`code-backup` 기존2파일, `docs-backup` 관련17문서. 코드 수정 뒤 전체 관련 rg/literal grep-r와 현재 docs 동기화 |

save 전 candidate 편집의 reload/goto 시도는 dirty page를 교체하지 못해 이전 module이 유지됐다. 최종 r8 shipping을 공개 가져오기로 연결한 후 save를 수행했고, 그 뒤 실제 재열기1회에서 현재 module과 저장 데이터 보존을 확인했다. 이전 source를 마감 모델 재생으로 제출하지 않는다.

root는 새 정면·작은 좌우 화면과 공격 중 `frames/0017.jpg`, `0023.jpg`, `0031.jpg`에서 겨드랑이·흉곽·골반 접합과 발·앞뒤 층을 보았다. **이번 단면 연결·톤 마감 VISUAL VERDICT: PASS**, 전체 모델은 **RETOUCH**다. 정확한 잔여는 **SOURCE_GAP1**: 원화에 없는 뒤쪽·가려진 표면의 정본 메시와 텍스처 미확보. 작은 저작 단면을 완성된 3D 원화·본편/GPU 인수로 확대하지 않는다. r7/이전 proof는 재검수하거나 변경하지 않는다.

## MAP PRODUCTION REPORT — §23, 엔진 단면 범위

```text
STAGE: ENGINE_AUTHORING torso-side-finish-r8 (맵 제작 N/A)
MASTER: silhouette/regions/main route/side spaces=N/A
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes=N/A
LARGE: source assets/composites/overlap/repeated silhouette=N/A
MEDIUM: connections/remaining holes=N/A
GROUND: shadow/contamination/structure integration=N/A
PLAYABLE: main arenas/travel/breathing/threat space/combat readability=N/A
LANDMARK: primary/secondary/tertiary=N/A
CAMERA QA: START/EARLY/ARENA/LANDMARK/LATE/EXIT=N/A; SIDE L/R=새실제 yaw−22/+22°, pitch6°
TECH QA: route/collision=N/A; pageerror=새log0; 404=새오류보고0,별도전수검사없음;
         seam=새profile/modelXYclosure PASS; loading=3895v/4894faces ready;
         performance=CPU Canvas local proof, 전체게임/GPU 성능 주장 없음
FILES: stage-owned=새finish builder/fixtures/test,기존Studio fetch/index cache,관련17docs+보고서;
       concurrent touched=0; unrelated touched=0
GIT: staged=이번 소유 code+docs; commit=소유 local checkpoint, SHA/결과는 E/checkpoint-receipt.json; push0; deploy0
VISUAL VERDICT: PASS (좁은 단면 연결·톤), 전체 RETOUCH / SOURCE_GAP1
NEXT PASS: 현재 단위 제출 후 기존 담당의 다음 한 단위 지시. 원화 없는 정본 표면 미확보는 유지.
```
