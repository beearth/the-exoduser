## 2026-10-08 — production_finish 좌우 골짜기 렌더 추가

[정확 계약·검수·§23 보고](CH1_SIDE_RAVINE_RELIEF_20261008.md). `ch1-side-ravines.js`를 실제 main 바닥에 연결: 서420/220/86·동500/300/128(width/renderDepth/renderRise), 기존 m_c1gedge 재질·live wall3×3 보호. 새 물리 고도/추락/보행/충돌 변경0. source-raster SIDE L/R만 검수, 실제 게임8camera·GPU·청취·save 미인수 / **RETOUCH**. 아래 기존 hill·경계·원화 설명은 각 모듈/시점 계약을 유지한다.

## 2026-09-30 — CH1-1 나무 교체 이력 주석

이 문서의 `m_ctree1/2/3/4/9/10/11/12` 손 배치와 과거 `m_ctree2 colSz66` 이동 검수는 당시 이력이다. 현행 1-1 나무는 기존 앵커와 scale을 계승한 `m_ctree13~20`이며 등록 메타의 `colSz`는 앞 6개 60, 뒤 2개 기본값이다. [88차 배치·원화·실제 게임 검수](CH1_SUNBURST_TREE_PASS88_20260930.md).

## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

## 2026-09-29 — CH1-1 피부–사목 접합85차 적용

현행 cache/bakeVersion은 **20260929-outer-85**, 빌드 레이어는 **21개**다. 서측 하단의 피부 바닥–사목 어깨를 낮은 부패 수피·괴사막으로 연결했다. 비보행101764px만 변경/보행0/고목 핵심 보호3579735px 변경0, 변경chunk1_6 1개·동일63개. 새로고침한 본편8기본 카메라+접합·전투2위치, 이벤트 기반 S/W 이동·24적 공격/Q, 게임error·contextloss0/64청크 응답실패0. 기존 회귀55PASS,21레이어 전체 마스터 재현·224경계 동일. 새 모션0/geometry·충돌 변경0. 전체 **VISUAL VERDICT: RETOUCH**.

[85차 수치·출처·MAP PRODUCTION REPORT SSOT](CH1_OUTER_CONNECTION_PASS85_20260929.md). 아래84차 이하의 '현행'은 당시 제작 이력이다.84차의 미완료 문구는 저장된 최종 검수로 보정했다.

<a id="ch1-1-outer84"></a>

## 2026-09-29 — CH1-1 고목 접합84차 제작 이력

현행 배경은 cache/bakeVersion **20260929-outer-84**다. 서측 부채꼴 고사리 구역을 낮은 부패 수피·괴사막으로 연결했다. master8192²/world8000²/tile40/64청크(core1024/bleed1/1026²), 변경chunk_1_5 1개·동일63개. 총109465px 변화(보행재질12058/비보행97407), geometry·충돌 변경0. 고목 보호2904814px 변경0; 이전 패치 보호 해제는 crop-local[495,340,835,655] 내부뿐(기존 패치 변화70882/창밖0). 타원밖·zero-mask·crop밖0, 선택crop의 near-black≤12/18/22는17595→17392 /64360→63422 /124323→122945. 재질 채널하한24, ellipse[635,490,260,180]/feather.25/opacity.96/줄기보호MaxFilter25·blur18. skin65→outer66..84 총20레이어, 마지막patch x1024/y5120/2048². 기존61차 생체 모듈·늪·동맥 유지/새모션0. 후보9카메라 오류0/G.map동일. 84차 본편18카메라·24적30초 전투·전체 베이크 재현 검수 완료는 저장된 live/runtime·promotion·로그로 확인했다. 현행85차와 상세 검수는 문서 맨 위 링크를 따른다.

[84차 출처·검수 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84). 아래83차 이하의 현행 표기는 당시 제작 이력이다. 전체 VISUAL VERDICT: RETOUCH.

## 2026-09-29 — CH1-1 검정 빈 공간 감소 83차

사용자 최신 지시: **검정색 빈 공간을 최대한 없앤다.** 기존 외곽 나무 사이의 비보행 검정 공동을 부패 목질·괴사 조직 재질로 채웠다. 현재 본편 배경은 83차이며, 아래 82차 이하의 수치와 검수는 제작 이력이다. [현행 출처·검수 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83).

| id | 현행 계약 |
|---|---|
| OUTER83_RUNTIME | cache/bakeVersion 20260929-outer-83; master8192²/world8000²/tile40; 64청크/core1024/bleed1/1026²; 변경54개/동일10개. geometry·충돌·진행 변경0 |
| OUTER83_MASK | 원본 maxRGB로 t=clamp((48−maxRGB)/28,0,1), alpha=t²(3−2t), uint8 양자화. authored nav1=보행은 alpha0; maxRGB≥48/zero-mask 픽셀 유지 |
| OUTER83_MATERIAL | GPT2048² 원본을 256px 중첩·4방향 smoothstep 가중 합성,1792px 주기로 연결. 반전0. paint=clip(tileRGB×.65+[12,8,12],24,255); RGB=uint8(base×(1−alpha)+paint×alpha), 기존 alpha 유지 |
| OUTER83_PIXELS | 변경23643680px/보행0. 전체 maxRGB≤12:6062519→405110(93.318% 감소); 비보행5657409→0. ≤18:9586314→1266275/비보행8320039→0; ≤22:12597285→2325674/비보행10271611→0. 남은 어두운 픽셀은 보호된 보행 바닥·그림자이며 모든 검정 픽셀 제거를 뜻하지 않음 |
| OUTER83_LAYERS | skin65→outer66~83 총19레이어; outer83 x0/y0/8192² preblended RGB+binary alpha0/255. 이전18레이어 파일 유지; 이전 패치의 어두운 비보행 픽셀 일부는 최신 지시에 따라 이번 레이어가 덮음 |
| OUTER83_QA | 최종 후보22/본편18카메라; G.map동일/pageerror·HTTP·crash0; 실제 S/W 이동 108.53worldpx, 24적·30초 공격/Q. 회귀9PASS/19레이어 전체픽셀 동일/64청크·224strip동일 |
| OUTER83_LIVING | 기존61차 동맥·늪 버블/가스 유지. 신규 생체 모션0/추가 runtime draw·atlas0; 신규 재질은 정적 배경 |
| OUTER83_STATE | VISUAL VERDICT RETOUCH. 검정 공동 감소는 확인; 다른 식생·반복·밀집VFX 중첩은 잔여. 실제 Radeon GPU2813×1262에서 context loss→restore 뒤 흰 화면1회; 자체 이전QA탭 종료·동일83차 새로고침 후4시점 정상. 원인·해결 미확정 |

<a id="ch1-1-outer83"></a>

## MAP PRODUCTION REPORT — 83차

STAGE: CH1-1/stage0. 제작가이드v0.9 전체·맵디테일·SSOT를 적용. 최신 지시에 따라 LARGE OUTER MASS의 검정 공동 연결→GROUND→PLAYABLE/COMBAT→CAMERA QA→TECH QA.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 기존200² 타일/8구역과 배치 유지; geometry 변경0 |
| MASTER | main route / side spaces | 6시 START→12시 EXIT·상단 통로·우회·넓은 전투공간 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH | 네 외곽 전체에 저대비 부패 목질 연결. 큰 나무의 밝은 윤곽과 기존 배치 유지 |
| OUTER MASS | major holes | 비보행 maxRGB≤22 픽셀10271611→0. 보행 그림자는 유지 |
| LARGE | source assets / composites / overlap | Higgsfield GPT 재질1장, 선택 마스크 합성1레이어; 원본 프레임 재생성0 |
| LARGE | repeated silhouette | 초기 미러 후보의 대칭 경계를 카메라에서 발견→반전 없는256px 중첩으로 보정. 기존 나무/식생 반복 잔여 |
| MEDIUM | connections / remaining holes | 나무 뒤 공동을 연속 목질로 연결. 인식 가능한 구조의 maxRGB≥48 픽셀 유지 |
| GROUND | shadow / contamination | 짙은 회자주 목질·괴사 조직, 저대비 접촉 그림자. 신규 발광/피해/경고0 |
| GROUND | structure integration | 변경23643680 비보행 픽셀. 기존 보행 바닥 변경0; 새로운 scatter/충돌 오브젝트0 |
| PLAYABLE | main arenas / travel space | 보행면 전체 픽셀 동일. tile[46,144] S650ms/W650ms 실제 이동108.53worldpx·시작 근처 복귀 |
| PLAYABLE | breathing space / threat space | 중앙 공터·시작 여백·우회·기존 위협 공간 유지 |
| PLAYABLE | combat readability | 기존AI24적/etype0·1·4·6·7·8, 2ring×12/거리250·390/각도+.17. 30초 공격/Q. 숫자·VFX 밀집 중첩은 잔여 |
| LANDMARK | primary / secondary / tertiary | 기존 생체나무/늪·야영지·제단/출구·뼈아치 유지; 추가0 |
| CAMERA QA | START / EARLY / ARENA | [100,185]·[100,180]/[100,157]/[100,120],1280×720 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK | [49,151]/[151,136]/[102,90] |
| CAMERA QA | LATE / EXIT | [100,48]/[100,15] |
| CAMERA QA | 추가 외곽 | 후보 LEFT_OUTER[20,100]/RIGHT_OUTER[180,100]/TOP_OUTER[100,5]/BOTTOM_OUTER[100,195] 및 서측 접합6·외곽3. 후보22/본편18 |
| TECH QA | route / collision | G.map SHA8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1 동일; 지형 회귀5PASS. 무보정 종주·보스 클리어·1-2 진입 미검증 |
| TECH QA | pageerror / 404 | headless 최종 후보/본편 각0; 본편 crash0/context loss0. 실제 Chrome2813×1262에서는 context loss→restore 뒤 흰 화면1회. 새로고침 후4시점 정상이나 원인·해결 미확정 |
| TECH QA | seam / loading | 64청크가 master clamped픽셀과 동일;224strip 동일. visibleIds⊂drawnIds 대기, 본편 청크 교체0/cache83 |
| TECH QA | performance | 정적54청크 교체, 추가 runtime draw·atlas0. PNG54개108887616→113532157바이트. headless SwiftShader; 실제Chrome AMD Radeon RX9070XT/ANGLE D3D11. 저사양/NW.js/FPS·장시간 안정성 승인 없음 |
| TECH QA | regression / rebake | 9PASS/0FAIL; pre65→19레이어 helper 전체8192² 픽셀 동일. Sharp concurrency1/cache false. 전체 builder 재실행은 하지 않음 |
| FILES | stage-owned | master/54청크/preview/메타2/outer83 patch·mask·출처ZIP/game맵cache1줄/9mapdocs·생체참조·CHANGELOG. pre83 원본·54청크·문서 백업 |
| FILES | concurrent touched | 공유 game/CHANGELOG는 맵 관련 부분만 수정; 기존 다른 staged·UI·자원·성능 작업 보존 |
| FILES | unrelated touched | 이번 작업0; rollback/실제 소스 숨김/예약 자동정리 등록0 |
| GIT | staged / commit | 이번 작업 Git 쓰기0/미커밋. exec provider가 WindowsApps pwsh 시작 전 OS317로 실패. 변경170개; 다른 작업을 숨기거나 강제 커밋하지 않음. 검증 ZIP 체크포인트 보존 |
| GIT | push / deploy | 수행0 |

**VISUAL VERDICT: RETOUCH** — 검정 빈틈을 실제 재질로 채웠고 전투 여백과 보행 바닥을 보존했다. 전체 환경의 다른 식생·기존 반복·밀집 효과 중첩까지 완성됐다는 판정은 아니다. 실제GPU 최초 흰 화면·복구 후 잔류는 별도 기술 검수 미해결 항목이다.

NEXT PASS: 다른 식생의 부패 재질 일관성과 고목 접합을 보정한다. 검정 빈 공간을 다시 만들지 않고, 넓은 전투공간·기존 동맥/늪·충돌을 유지한다. 과거 renderer/흰 화면 문제는 원인 진단을 계속한다.

검수 조건: 독립 Playwright 컨텍스트/새 QA slot/API POST·PUT·PATCH·DELETE 차단/HP50ms 보충·무적63f. 시각·충돌 검수이며 무보정 밸런스나 클리어 검증을 뜻하지 않는다. 종료된 로딩 이미지 src는 해제하지 않았다.

| 출처·파일 | 값 |
|---|---|
| 모델/job | Higgsfield GPT gpt_image_2_5/841b4589-3f9a-4a82-a83c-90c5059c8a09; text-only/1:1/2k/high/opaque/count1 |
| 생성 원본 SHA256 | 010fa66a92b36ae75361a7663c68a96d2f6e6b1452188aa6a925e522bb460e3b |
| 입력 master82 SHA256 | ddc87472eed94a705c1a9e4deb02b8f8e50979425a67bbe796562a4bb1197aaa |
| 최종 master83 SHA256 | 86112ba27b190a5783be12f0ea0561c139416d947ae762c7cf95c0c28b2ad97c |
| rawRGBA SHA256 | 29c5a89ccf77e8e70fe42d86bb04d9909f2d3d0cf654067536a07baaacb4c160 |
| 소스 묶음 | outer83_sources/source-provenance.zip: generated-material.png/generation.json/prep.json/manifest.json 4엔트리 SHA검사. 입력 master82는 tmp/ch1-production-pre83에 원본 보존 |
| 초기 후보 | captures/ch1_outer83_initial_mirror:22카메라/G.map동일/오류0지만 대칭 접합 때문에 미반영. 초기23,648,468px; 최종23,643,680px |
| 네트워크 | 터미널 외부 전송 불가/승인 재시도도 provider 시작 전 실패. 생성 파일은 허용된 CUA 일반 브라우저 다운로드→프로젝트 저장/파일 SHA검사 |

생성 프롬프트:

Create a seamless top-down dark fantasy game environment MATERIAL PLATE, 2048x2048, to fill empty black gaps UNDER an existing rotten-forest map. Fill the entire square with compact interlocked decayed bark laminae, crushed grey wood, low woven dead roots and dry muted mauve necrotic connective tissue. This is dense NON-WALKABLE outer forest mass, a quiet recessed material backing with believable volume and fine varied fibres. Desaturated corpse-grey / charcoal brown / muted mauve, diffuse dim light, restrained small contact shadows. No broad empty gaps, no solid-black patches, no open center, no sky or horizon, no perspective camera, no prominent tree trunk or repeated hero silhouette. Avoid healthy foliage, green plants, grass, flowers, bright glowing veins, wet blood pools, scatter props, animals, characters, labels, symbols or grid. Uniform natural detail scale across the square; irregular layered knots and broken contours, rich but low-contrast texture. All edges should tile naturally with no frame, border, vignette, or dark perimeter. We will apply it only through a selective mask in existing non-walkable black voids, preserving all playable floor and the authored trees.

실제 GPU 검수: API 전체 차단·별도127.0.0.7 origin/QA slot/임시HP·무적 보정. 첫로드21:31:52.474Z context lost→21:31:53.570Z restored. GL.isContextLost=false/getError0/_useGL=true, 맵30청크 ready/오류0/visible=drawn10에도 넓은 화면이 흰색으로 남음. 부팅 이미지 정상1672×941/전환 overlay opacity0·pointerEventsnone. 당시 시스템commit75.383438GiB/limit78.835209GiB/물리여유34.182293GiB; 메모리나 map83 원인으로 단정하지 않음. 자체 이전82QA탭만 닫고 동일83차 새로고침 후 JOIN_TOP/START_ACTUAL/ARENA/EXIT2813×1262 정상. 최종52청크ready/오류0/visible=drawn12/lostfalse/getError0·새손실경고0. WebGL 코드 변경0/사용자 앱 종료0. 일반 CUA 스크린샷으로 검수했고 Page.captureScreenshot 별도파일 export는3초·30초 timeout으로 실패; 다운로드된 GPU 캡처 파일이 있다고 보고하지 않음. QA탭은종료했다.

검수 증거: [전후·실제 카메라 갤러리](../../captures/ch1_outer83/index.html), [후보22](../../captures/ch1_outer83/visible-refined/runtime.json), [본편18·이동·전투](../../captures/ch1_outer83/live/runtime.json), [GPU첫로드](../../captures/ch1_outer83/chrome-first-run.json), [GPU재시작](../../captures/ch1_outer83/chrome-reload.json), [최종 상태](../../captures/ch1_outer83/final-state.json).

82차 완료 이력: 서측 고목 밑40,513px/보행0,chunk_1_5 한 개,18레이어 rawSHA8453b013378efbeceb75d52e0fa075da4ccc06eb392187a83708d048b992a4af 재현/회귀9PASS. 연속18카메라+30초24적 전투의 pageerror·HTTP·crash·흰화면0/G.map동일. 사전81차 안정성123.2869초/36카메라+30초 전투도 오류0, 두 검수 모두 SwiftShader. 성공 재현은 과거 renderer 문제의 해결 선언이 아니다. [82차 로그](../../captures/ch1_outer82/live/runtime.json)·[사전 안정성](../../captures/ch1_stability82/runtime.json).

## 2026-09-29 — CH1-1 서측 고목 밑 접합82차 기록(83차 이전)

82차 당시 본편 배경이다. 아래81차 이하의 원화·수치·검수는 제작 이력이다. 상세 출처·보호 계약·검수는 [82차 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82)를 따른다.

| id | 현행 계약 |
|---|---|
| OUTER82_RUNTIME | cache/bakeVersion `20260929-outer-82`; master8192²,world8000²/tile40;64청크/core1024/bleed1/1026²·224strip일치;변경 `chunk_1_5.png`1개/나머지63개유지 |
| OUTER82_LAYER | skin65→outer66~82 총18레이어;`outer82_sources/outer82_patch.png`,x1024/y5120/2048²,preblended RGB+binary alpha0/255 |
| OUTER82_MASK | ellipse[740,438,350,320]/feather.30/opacity.92;73mask>12·74~81mask>0 보호2260730px.고목·공동6사각형981440px;전체합3195820px/MaxFilter25/blur18/core alpha0 |
| OUTER82_PIXELS | 총40513/보행0/비보행40513px.보호·타원밖·zero-mask·crop밖 변경0;geometry/충돌/진행·늪/가스/동맥유지,새모션0 |
| OUTER82_REFERENCE | 업로드 장애 후 기확인 master80 crop[1024,5120,3072,7168]/media b27be7cc-c007-40e6-b4f3-94f786f857dc 재사용.현재 master81의 비보호 합성 픽셀과 참조의 픽셀일치 assert통과.81차패치 보호 |
| OUTER82_QA | 전후9시점 및정밀후보9시점/G.map동일/pageerror·HTTP오류0;회귀9PASS.본편 이동·전투·실제Chrome 최종 검수는 아래완료기록 참조 |
| OUTER82_VERDICT | VISUAL VERDICT RETOUCH;주변식생·반복·밀집VFX/숫자 중첩잔여.기존renderer문제 원인미확정.후속안정성 진단은 본편검수와 별도 기록 |

<a id="ch1-1-outer82"></a>

### 82차 생성·합성 상세

| 항목 | 값 |
|---|---|
| 생성 | Higgsfield GPT `gpt_image_2_5`;job `9dad40eb-73f6-4754-914a-be6233d18c51`;1:1/2k/high/opaque/count1,2.75credits;실제2048²RGBA |
| 참조SHA256 | 7d7d3bf56aab30c75479f115f9e731b14b8ae2441e6e221cc270fd2b3d2f0168 |
| 합성베이스81 SHA256 | 74c5a1239af48b6cc7b158f5c3a63908d9de38bd0ac9d6c0b4e6c27b4780aac4 |
| 생성SHA256 | c3a827a2882826377f2f8c4d29913350a13fa19301330940364b1408fd717b73 |
| 최종master SHA256 | ddc87472eed94a705c1a9e4deb02b8f8e50979425a67bbe796562a4bb1197aaa |
| 고목·공동 보호사각형 | [[500,1502,1410,2048],[840,130,1040,550],[1030,340,1140,550],[780,380,850,485],[160,0,590,600],[540,0,1100,288]] |
| 선택식 | q=((x−740)/350)²+((y−438)/320)²;t=clamp((1−q)/.30);region=t²(3−2t).alpha=region×(1−protect)×.92×sourceAlpha;core alpha0;floor(alpha×255)/255 |
| 합성식 | RGB=uint8(base81×(1−alpha)+edited82×alpha);기존alpha유지.보호합집합 MaxFilter25→GaussianBlur18/core강제0 |
| 초기후보 | 34277px/2청크.카메라에서 보호사각형이 잎무늬를 넓게 남기는 문제확인→고목보호사각형분리.초기QA·prep/불필요후보2_5 청크는 captures에보존,최종본편미사용 |
| 네트워크 | curl 업로드실패/Node fetch EACCES;승인된curl 재시도도exec provider WindowsApps pwsh 시작전OS317.추가업로드미확인.생성원화는허용된CUA 일반브라우저다운로드 후프로젝트저장/경로SHA검사 |

생성 프롬프트:

Edit the supplied CH1-1 top-down dark-fantasy ground crop in place, same 2048x2048 framing. This is a LOCAL GROUND CONNECTION edit. Preserve exact camera, scale, existing large pale trunks, short dead snag, black hollow cavities, rocky shelf and established necrotic skin plates. In the narrow dull olive fern/leaf-litter band just BELOW the black cavity and LEFT of the short pale snag, centered near pixel (740,438), join the rotten tree base into existing corpse-grey muted mauve skin ground with low torn dried skin sheets and a few subdued burgundy tendon fibres embedded in cracked bark. Keep all ground low and quiet, match existing texture scale, desaturated palette, dim diffuse light, moist dark contact shadows. Restrict editing to ellipse cx740 cy438 rx350 ry320; preserve the pale snag around x760..1020,y70..550, large trunk x160..590,y0..600, and black cavity above y288. Continue into existing lower skin without adding a new focal point. No extra trees, raised obstacles, bright accents, green plants, lush forest, grass, flowers, gore puddles, decorative scatter, text, logos or grids. Preserve everything outside this one contact zone as closely as possible.

## 2026-09-29 — CH1-1 서측 피부막 위쪽 접합81차 기록(82차 이전)

80차 피부 면 위쪽 tile[46,144]의 잎무늬 접합을 실제80차 원화 참조로 편집했다. 낮은 괴사막과 섬유로 기존 피부층을 연결하고, 고목과73~80차 패치·넓은 전투공터를 보호했다. 아래80차는 제작 이력이며 현재 배경 계약은81차다.

| id | 현행 계약 | 값 |
|---|---|---|
| OUTER81_SOURCE | 입력·생성 | master80 crop[1024,5120,3072,7168],2048²;Higgsfield GPT gpt_image_2_5/job34551eaf-ba11-466e-8403-c951d280d035;1:1/2k/high/opaque/count1,2.75credits |
| OUTER81_MASK | 선택·합성 | ellipse[840,840,340,460];q=((x−840)/340)²+((y−840)/460)²;t=clamp((1−q)/.30);region=t²(3−2t).alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base80×(1−alpha)+edited81×alpha),원본alpha유지.경계band없음 |
| OUTER81_KEEP | 보호 |73mask>12·74~80mask>0;이전합집합2100642픽셀.고목사각형[500,1502,1410,2048]/[760,70,1020,550]/[160,0,590,600],합879660픽셀.전체합2963916/MaxFilter25/GaussianBlur18/core강제alpha0.보호·타원밖·zero-mask·crop밖변경0 |
| OUTER81_PIXELS | 변화 |총157436/보행123509/비보행33927;geometry·충돌·진행·늪버블·가스·동맥유지,새모션0 |
| OUTER81_RUNTIME | 본편 |master·chunk_1_5.png/chunk_2_5.png·preview·composition·retouchLayers·game cache20260929-outer-81;64청크/core1024/bleed1/1026²·224strip동일;나머지62청크유지 |
| OUTER81_REBAKE | 재현 |skin65→outer66~81,17레이어;outer81 x1024/y5120/2048²,preblended RGB+binary alpha0/255;helper전체8192²픽셀동일.검수Sharp concurrency1/cache false.초기동시검증vips메모리오류별도보존;전체builder재실행미실시 |
| OUTER81_FILES | 소스·보존 |outer81_sources/outer81_patch.png·outer81_mask.png 2파일.76~81차오프라인출처는outer76_81-provenance.zip으로묶음:각pass/input-base.png·edited_connection.png·outerN_crop.png·generation.json·prep.json 총30엔트리+manifest.json=31,모두SHA대조.기존76~80개별ZIP5개는tmp/ch1-source-consolidation81에원본보존.런타임PNG12개변경/삭제0.73~75기존staged출처유지 |
| OUTER81_QA | 실제 검수 |전후9·본편18카메라를3×6독립세션,이동/전투별도1세션으로확인;최종pageerror/HTTP오류0·본편route교체0·42캡처정상.회귀9PASS;[46.5,144.5] S/W약113.86worldpx·시작점근처복귀(약2.78px오차)/G.map동일,임시24적/적탄6샘플0/9/12/12/16/14·공격/Q.체력50ms/무적63f보정·전체API쓰기차단.후반3세션은종료된로딩화면이미지src만QA컨텍스트에서해제,맵청크교체0/본편소스수정없음 |
| OUTER81_STABILITY | 검수 한계 |최초before캡처대기1회,연속본편renderer종료2회,동일코드+80차이미지비교에서도JOIN_TOP흰화면1회.분리group1도스크린샷Python MemoryError1회·시작흰화면1회.실패로그/이미지보존.Windows진단snapshot commit72.556GiB/limit79.761GiB/peak79.761GiB,물리여유39.252GiB;동시메모리압박관찰·종료원인단정없음.자체검수잔여descendant0/사용자앱종료0.실행중limit변동.분리검수의정상캡처는장시간안정성통과가아니며원인·해결미확정 |
| OUTER81_STATE | 판정·Git |VISUAL VERDICT RETOUCH;다른식생·반복·밀집VFX/숫자중첩잔여.81차미커밋:승인된git add도exec provider가WindowsApps pwsh시작전OS317로실패;Git쓰기0/기존staged보존.출처정리후98파일이었으나타작업추가로생성전검사102·통합검수후검사107파일(각시점100제한초과);강제정리없음.저사양/NW.js/장시간성능·무보정종주·클리어미검증 |

[81차 MAP PRODUCTION REPORT](../../captures/ch1_outer81/REPORT.md) · [전후·본편 갤러리](../../captures/ch1_outer81/index.html).

## MAP PRODUCTION REPORT —81차

STAGE: CH1-1/stage0. 공통 제작가이드v0.9 전체와 맵디테일·SSOT를 적용한 GROUND CONNECTION→PLAYABLE/COMBAT 국소보정.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions |200²타일/53점경계/8구역유지;geometry변경0 |
| MASTER | main route / side spaces |6시START→12시EXIT·상단통로·우회·넓은공터유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH |기존66~80질량유지;새큰오브젝트0 |
| OUTER MASS | major holes |새큰hole0;타구역식생잔여 |
| LARGE | source assets / composites / overlap |실제80차crop참조GPT부분편집;고목·보호부유지 |
| LARGE | repeated silhouette |선택잎반복일부교체;타지역식생·고목반복보정잔여 |
| MEDIUM | connections / remaining holes |80차피부위쪽을낮은찢어진막·섬유로연결;고목앞과다른접합잔여 |
| GROUND | shadow / contamination |기존조명+시체회자주막·국소검붉은섬유;신규발광/피해/경고0 |
| GROUND | structure integration |보행123509/비보행33927픽셀정적재질;기존오브젝트충돌유지 |
| PLAYABLE | main arenas / travel space |canMv[46.5,144.5] S650ms/W650ms 약113.86px이동·시작점근처복귀(약2.78px오차);끝칸0/G.map동일.관찰용순간이동과구분 |
| PLAYABLE | breathing / threat space |중앙공터·시작여백·우회·기존위협유지 |
| PLAYABLE | combat readability |기존AI임시24적/etype0·1·4·6·7·8;적탄0/9/12/12/16/14,공격/Q실제화면확인.밀집숫자·VFX중첩잔여 |
| LANDMARK | primary / secondary / tertiary |생체나무·늪·야영지·제단·출구·서측뼈아치유지;추가0 |
| CAMERA QA | START / EARLY / ARENA |[100,180]/[100,157]/[100,120],1280×720 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK |[49,151]/[151,136]/[102,90] |
| CAMERA QA | LATE / EXIT |[100,48]/[100,15] |
| CAMERA QA | 본편18좌표 |JOIN_MAIN[46,144], JOIN_TOP[46,138], JOIN_LOWER[46,151], JOIN_LEFT[39,144], JOIN_RIGHT[53,144], SKIN80[36,153], START_ACTUAL[100,185], START[100,180], EARLY[100,157], ARENA[100,120], SIDE_L[49,151], SIDE_R[151,136], LANDMARK[102,90], LATE[100,48], EXIT[100,15], L_MASS[73,180], WEST_JOIN[72,117], S_JOIN[121,184] |
| TECH QA | route / collision |지형회귀5PASS/G.map SHA8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1동일;무보정종주·보스클리어·1-2진입미검증 |
| TECH QA | pageerror /404 |최종전후9·분리본편18+이동/전투는0.연속renderer종료2회와80차비교흰화면을별도보존;안정성원인미확정 |
| TECH QA | seam / loading |64청크master픽셀동일/224strip동일·본편48청크URLcache81·route교체0;visibleIds⊂drawnIds대기 |
| TECH QA | performance |정적2청크교체;추가runtime draw/atlas0.장시간연속QA실패·저사양GPU/NW.js/FPS미검증 |
| TECH QA | regression / rebake |9PASS0FAIL;17레이어helper전체8192²픽셀동일;초기vips메모리오류후concurrency1/cache false로검증 |
| FILES | stage-owned |master/2청크/preview/메타2/source2/출처묶음1/game맵cache1줄/9mapdocs/생체현행참조/CHANGELOG;tmp/ch1-production-pre81백업 |
| FILES | concurrent touched |공유game/CHANGELOG의맵부분만수정;다른staged·로비/UI/출품자료보존 |
| FILES | unrelated touched |이번작업없음;rollback/런타임숨김/자동정리작업등록없음 |
| GIT | staged / commit |Git쓰기0;81차미커밋.exec provider시작전OS−1073283067/317;별도도구로.git쓰기우회없음 |
| GIT | push / deploy |수행없음 |

**VISUAL VERDICT: RETOUCH** — 선택면은 기존 피부층과 연결됐고 넓은 공터와 플레이어·탄의 구분을 유지한다. 타구역 식생·반복·밀집중첩은 남아 있다. 연속 검수의 renderer 종료 및 80차 비교 흰 화면 원인은 미확정이다. 회귀검사와 분리 촬영 성공을 전체 시각 완성·장시간 안정성으로 대체하지 않는다.

NEXT PASS: 연속 카메라 전환의 흰 화면/renderer 종료를 먼저 진단한다. 그 다음 고목 앞의 남은 식생 접합을 보정한다. 외곽질량·넓은공터·기존충돌·73~81차·늪/동맥을 보호한다.

검수조건:독립컨텍스트/전체API POST·PUT·PATCH·DELETE차단/체력50ms보충·무적63f보정. 임시24적2ring×12/거리250·390/둘째각도+.17;3초후6샘플500ms/공격1600ms/Q150ms. 시각검수이며무보정밸런스·클리어·성능검수가아니다.

생성출력SHA bfbec8c43d93b86f3eec7f9cf836ae6b00da8f38a167938838b10e66a4eecbaa;마스터SHA 74c5a1239af48b6cc7b158f5c3a63908d9de38bd0ac9d6c0b4e6c27b4780aac4;rawRGBA SHA a972831cc2278b73b07f168a46fafd0f2b5a072a62d1a2394434bc25f6034187.입력·프롬프트·media/job UUID·URL은출처묶음의outer81_sources/generation.json에보존했다.

메모리 계측은 [Microsoft PERFORMANCE_INFORMATION](https://learn.microsoft.com/en-us/windows/win32/api/psapi/ns-psapi-performance_information)와 [PROCESS_MEMORY_COUNTERS_EX](https://learn.microsoft.com/en-us/windows/win32/api/psapi/ns-psapi-process_memory_counters_ex) 계약을 따랐다.값은현행Windows의실제진단결과이며실행중변동한다.로딩이미지src해제는QA격리컨텍스트에서만수행했다;메모리설정이나사용자앱은수정하지않았다.

실패기록: visibleqa-initial-stall.log / liveqa-initial-crash.log / liveqa-sequential-crash.log / baseline80.log / baseline80/after/JOIN_TOP.png / liveqa-group1-memory-error.log / liveqa-group1-white.log / liveqa-group1-START_ACTUAL-white.png / memory-diagnostic.json / process-memory-diagnostic.json / rebake-proof-initial-error.log. 최종18본편은live/runtime-group0..3.json에서합친독립4세션이며단일연속세션통과가아니다.

## 2026-09-28 — CH1-1 서측 피부막 왼쪽 접합80차 기록(81차 이전)

79차 피부 면 왼쪽 tile[36,153]의 잎무늬를 실제79차 원화 참조로 편집했다. 기존 고목과73~79차 패치를 보호하고 낮은 괴사 피부층·섬유로 연결했다. 아래79차 이전 기록은 제작 이력이며 당시 배경 계약은80차다(81차 이전 이력).

| id | 80차 당시 계약 | 값 |
|---|---|---|
| OUTER80_SOURCE | 실제 입력·생성 | master79 crop[1024,5632,3072,7680],2048²;Higgsfield GPT gpt_image_2_5/job2b87a734-083f-48ec-b222-e20407f7ae44,1:1/2k/high/opaque/count1 |
| OUTER80_MASK | 선택·합성 | ellipse[480,620,320,550],q=((x−480)/320)²+((y−620)/550)²;t=clamp((1−q)/.30);region=t²(3−2t).alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base79×(1−alpha)+edited80×alpha),원본alpha 유지. 경계band없음 |
| OUTER80_KEEP | 보호 |73mask>12·74~79mask>0;이전합집합1617083픽셀.고목사각형[500,990,1410,2048]/962780픽셀;전체합집합2563137/MaxFilter25/GaussianBlur18/core강제alpha0.보호·타원밖·zero-mask·crop밖 변화0 |
| OUTER80_PIXELS | 변화 |총338768/보행240292/비보행98476;geometry·기존충돌·진행·늪버블·가스·동맥 유지,새모션0 |
| OUTER80_RUNTIME | 본편 |master·chunk_1_5.png/chunk_1_6.png·preview·composition·retouchLayers·game cache20260928-outer-80.64청크/core1024/bleed1/1026²·224strip동일;나머지62청크유지 |
| OUTER80_REBAKE | 재현 |skin65→outer66~80,총16레이어;outer80 x1024/y5632/2048²,preblended RGB+binary alpha0/255;helper 전체8192²픽셀동일 |
| OUTER80_FILES | 소스·보존 |outer80_sources/outer80_patch.png·outer80_mask.png·source-provenance.zip 3파일. ZIP의input-base.png/edited_connection.png/outer80_crop.png/generation.json/prep.json 5엔트리 원본SHA대조.76~79차도patch/mask/출처ZIP 3파일로정리;각ZIP5엔트리·76/77 RAW 및76~79 prep은tmp/ch1-source-consolidation80에별도보존.런타임패치/마스크삭제0 |
| OUTER80_QA | 실제 검수 |전후9·일반본편18카메라,최종각pageerror/HTTP오류0·본편route교체0;지형5+레이어/버전3+HTML구문1=9PASS.수정부[38.5,153.5] S/W104.79worldpx·복귀/G.map동일,임시24적/적탄6샘플0/5/8/11/12/8·공격/Q.초기기존본편의흰캡처2건은별도진단/제외;원인미확정·해결선언없음 |
| OUTER80_STATE | 판정·Git |VISUAL VERDICT RETOUCH;전체식생·다른영역반복·밀집VFX/숫자중첩잔여.80차미커밋:일반git add index.lock권한거부/승인된상승재시도provider시작전OS317;Git쓰기0/기존staged보존.저사양/NW.js/장시간성능·무보정종주·클리어미검증 |

[80차 MAP PRODUCTION REPORT](../../captures/ch1_outer80/REPORT.md) · [전후·본편 갤러리](../../captures/ch1_outer80/index.html).

# CH1-1 서측 잎무늬 바닥과 괴사 피부 연결 — 79차

서측78차 피부 왼쪽 tile[47,159] 부근의 넓은 잎무늬 면을 실제78차 원화 참조로 부분 편집했다. 낮은 회자주 괴사 피부와 얕은 균열이 기존 썩은 목질로 이어진다. 이번 변경 총341970픽셀 중 보행339996·비보행1974픽셀이며, geometry와 기존 오브젝트 충돌은 유지한다. 이전73~78차 패치와 주변 고목을 보존했다. 신규 생체 모션은 없다.

| id | 항목 | 현행 값·공식 |
|---|---|---|
| INPUT79 | 입력 | master78 crop[1024,5632,3072,7680],2048²; SHAa5412ab89ac09c6750e8cc2ef0958b598ec6af36bd8b148633a621a6183652f2,mediae248f508-b554-4f32-99c7-b84d80375045 |
| SOURCE79 | 생성 | Higgsfield GPT gpt_image_2_5/job6f7dd422-0b18-42ff-8809-f51fb57c5d97;1:1/2k/high/opaque/count1,실제2048²; SHA9cbbb414665b8cfe1771d0fea8aa2fea92e80d3e6466d893ec06a01d7559bffe |
| REGION79 | 국소 선택 | 중심[860,730],반경[430,360];q=((x−860)/430)²+((y−730)/360)²;t=clamp((1−q)/.30,0,1);region=t²(3−2t);경계band없음 |
| PROTECT79 | 이전 작업 |73mask>12,74/75/76/77/78mask>0을 각 레이어 실제x/y로 교차매핑;합집합1270046픽셀/변경0;MaxFilter25/GaussianBlur18,core alpha강제0. 고목사각형[500,990,1410,2048] 962780픽셀보호; 이전레이어와사각형의전체합집합2216100픽셀/변경0 |
| BLEND79 | 공식 |alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base78×(1−alpha)+edited79×alpha);원본alpha유지 |
| PIXELS79 | 변화·보존 |총341970/보행339996/비보행1974;보호·타원밖·zero-mask·crop밖각각0 |
| CHUNKS79 | 본편 |chunk_1_5.png/chunk_1_6.png/chunk_2_6.png;8192² master→64 clamped청크/core1024/bleed1/실제1026²;기존61청크유지,224경계strip동일 |
| CACHE79 | 버전 |game production loader·composition·retouch-layers=20260928-outer-79;legacy비교와생체모듈유지 |
| REBAKE79 | 레이어 |skin65→outer66~79,총15;outer79 x1024/y5632/2048²,preblended RGB+binary alpha0/255;pre65+15패치 전체8192²픽셀동일 |
| PROOF79 | 해시 |mastera4b971e689d715d1c03f5c9e4550946042ea893a6db64a4dcf70159a483408ab;rawRGBA0fd8b7f372c6d5cce0dd5f71ed04af3cd5873cf2b758dfb7c0d6029a906bb104 |
| FILES79 | source4파일 |outer79_sources/outer79_patch.png·outer79_mask.png·prep.json·source-provenance.zip. ZIP내 input-base.png·edited_connection.png·outer79_crop.png·generation.json 4엔트리 원본SHA대조. raw원본과 전체프롬프트/UUID/URL은 ZIP에 무손실보존;패치·마스크·prep은직접참조 |
| TRANSPORT79 | 업로드·다운로드 |native exec 실패 후 브라우저 파일선택·승인된 Higgsfield presigned PUT HTTP200→media_confirm. 관찰된 원본pageAssets bundle수신 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0, GROUND CONNECTION → PLAYABLE/COMBAT 국소 보정. 공통 제작 가이드v0.9 전체1048줄을 이전77차부터 읽고 적용한 연속 작업이며79차 동일SHA607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b 확인. 맵디테일·SSOT·지면 계약의 넓은 전투공간/피부/동맥/부패 생체나무 콘셉트 유지.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions |200² 공간·기존 구역 경계 유지,geometry불변 |
| MASTER | main route / side spaces |시작6시→출구12시·상단통로·우회·넓은 공터 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH |기존66~78차 대형질량 유지,새질량0 |
| OUTER MASS | major holes |새독립나무·큰검은hole0;주변 건강한 식생 잔여 |
| LARGE | source assets / composites / overlap |대형나무·scatter추가0;이전73~78차 1270046픽셀보호 |
| LARGE | repeated silhouette |낮은 잎반복을피부·얕은균열로 국소교체;기존고목·주변식생·타지역반복잔여 |
| MEDIUM | connections / remaining holes |78차피부 왼쪽막→기존고목 접지 연결;선택면 외곽 식생 추가RETOUCH |
| GROUND | shadow / contamination |회자주괴사피부·낮은찢김·기존조명;새발광·피해·경고0 |
| GROUND | structure integration |보행339996픽셀 정적재질편집;타원밖0;타일/기존오브젝트충돌불변 |
| PLAYABLE | main arenas / travel space |G.map동일;canMv확인[47.5,153.5]에서S/W 110.79월드px 이동·복귀 |
| PLAYABLE | breathing space / threat space |넓은 중앙·오른쪽 공터,시작여백·우회·기존위협 유지 |
| PLAYABLE | combat readability |수정부에서기존AI 임시24적/6etype,적탄6샘플1/8/13/17/16/11;실제공격/Q캡처. 밀집캐릭터·숫자·VFX중첩잔여 |
| LANDMARK | primary / secondary / tertiary |생체나무·늪·야영지·제단·출구 유지;신규0 |
| CAMERA QA | START / EARLY / ARENA |[100,180]/[100,157]/[100,120],본편1280×720 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK |[49,151]/[151,136]/[102,90],본편 |
| CAMERA QA | LATE / EXIT |[100,48]/[100,15],본편 |
| CAMERA QA | 전후 / 전체맵 |후보전후9·일반본편18시점·필수8camera-board·전체맵전후. SKIN_MAIN[47,159]은보행바닥관찰이며다른외곽관찰순간이동은실제이동검수와구분 |
| CAMERA QA | 본편18좌표 |SKIN_MAIN[47,159], SKIN_TOP[47,151], SKIN_LOWER[47,167], SKIN_LEFT[40,159], SKIN_RIGHT[55,159], JOIN78[62,150], START_ACTUAL[100,185], START[100,180], EARLY[100,157], ARENA[100,120], SIDE_L[49,151], SIDE_R[151,136], LANDMARK[102,90], LATE[100,48], EXIT[100,15], L_MASS[73,180], WEST_JOIN[72,117], S_JOIN[121,184] |
| TECH QA | route / collision |지형5PASS·G.map SHA8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1동일. 전체무보정종주·보스클리어·1-2진입미검증 |
| TECH QA | 실제입력 |[47.5,153.5] S650ms/W650ms,아래110.79px·복귀,끝칸runtime0;canMv(r15)/아래0·30·60·90·120px확인. 밀집검수도동일좌표재진입 |
| TECH QA | pageerror / 404 |후보/본편각0,HTTP>=400각0 |
| TECH QA | seam / loading |64청크master동일·224strip동일;본편48청크URL/cache79·route교체0;각카메라·이동캡처visibleIds⊂drawnIds대기 |
| TECH QA | whitespace | 기존index/작업본메타CRLF유지. blank-at-eol·blank-at-eof·space-before-tab·cr-at-eol을명령에만지정한Git diff --check PASS/gitconfig쓰기0;기본check의CR경고는별도이력보존 |
| TECH QA | performance |정적3청크교체·새runtime draw/atlas0;저사양GPU/NW.js/장시간FPS미검증 |
| TECH QA | regression / rebake |지형5+레이어/버전3+HTML구문1=9PASS0FAIL;15패치helper전체픽셀재현,전체builder재실행미실시 |
| FILES | stage-owned |master/3청크/preview/source4/메타2/game맵cache한줄/9mapdocs/CHANGELOG맵항목. tmp/ch1-production-pre79백업 |
| FILES | concurrent touched |공유game/CHANGELOG는맵부분만수정;기존staged62·타에이전트작업보존 |
| FILES | unrelated touched |이작업없음;롤백·삭제·runtime에셋숨김없음. raw출처를ZIP4엔트리로무손실보관 |
| GIT | staged / commit |Git쓰기0·79차미커밋. systemPowerShell지정에도provider WindowsApps pwsh프로세스생성전 OS−1073283067/FormatMessage317. 이번실패는git status 실행전이며승인된터미널경로로Git명령을시작할수없음. 기존index보존,대체도구로.git쓰기우회없음 |
| GIT | push / deploy |수행없음 |

**VISUAL VERDICT: RETOUCH** — 수정부카메라에서 잎반복이낮은회자주피부와얕은균열로바뀌며캐릭터·청록적탄·기존나무가구분된다. 선택면외곽의남은잎무늬와타지역원화반복·밀집숫자/VFX중첩은추가보정이필요하다. 자동검사PASS는시각PASS로대체하지않는다.

NEXT PASS: 이번피부면의왼쪽/아래에남은 잎무늬를더얇은피부섬유로연결. 넓은공터·기존충돌·고목·73~79차완성부·늪버블/가스/동맥보존. 소스제어100파일미만을지켜후속작업전현재변경누적재확인.

검수조건: 독립컨텍스트·API전체쓰기차단(POST/PUT/PATCH/DELETE),체력50ms보충·무적63f를50ms마다보정. 임시기존적24/etype0·1·4·6·7·8,2ring×12/거리250·390/둘째ring angle+.17,3초대기후적탄6샘플500ms,마우스공격1600ms/Q후150ms캡처. 이동·밀집검수전수정좌표재설정및500ms청크대기. 시각검수이며밸런스·무보정클리어·전체성능검증과구분. 새생체모션0,ch1-living-detail.js SHA47af23fb8dd096e5112e29a7b298f8b78f03b409e81d967362a047193c182beb동일.

서버 구분 검수 이력: 첫18시점은127.0.0.1:3333에서 pageerror0·맵청크오류0이나전리품컷아웃8URL의404를관찰했다. 14장비파일모두로컬존재/첫서버404를별도HTTP대조했다. netstat에서0.0.0.0:3333 PID31172와127.0.0.1:3333 PID49528의두리스너를확인. 127.0.0.2:3333으로일반리스너에접속하면갑옷PNG200/디스크바이트동일·game.html200/작업본바이트동일이다. 현재18시점·이동·밀집검수는127.0.0.2에서다시수행하고,첫자료를live-specific-loopback/runtime.json과liveqa-specific-loopback.log에보존했다. CIM/tasklist프로세스실행파일조회는접근거부되어실행파일종류는단정하지않으며앱종료·서버코드변경0. 첫404관찰을최종서버0과구분한다.

자료: captures/ch1_outer79/index.html,REPORT.md,visible/runtime.json,live/runtime.json,prep/promotion/generation/final-state JSON,tests/rebake-proof.log,capture-integrity.json. tmp/ch1-checkpoint79-owned.zip은소유결과·이전73~78차소스/청크의존·docs·검수·공유파일분리patch를보존하고모든엔트리SHA대조한다. 공유파일전체스냅샷은타작업복원/스테이징명령으로사용하지않는다.

---

## 78차 이하 보존 기록

# CH1-1 서측 잎무늬 바닥과 괴사 피부 연결 — 78차

서측77차 뿌리 아래 tile[62,150] 부근의 넓은 잎무늬 면을 실제77차 원화 참조로 부분 편집했다. 낮은 회자주 괴사 피부와 얕은 균열이 기존 썩은 목질로 이어진다. 이번 변경 715350픽셀은 layout 기준 모두 보행면이며, geometry와 기존 오브젝트 충돌은 유지한다. 이전73~77차 패치와 주변 고목을 보존했다. 신규 생체 모션은 없다.

| id | 항목 | 현행 값·공식 |
|---|---|---|
| INPUT78 | 입력 | master77 crop[1536,5120,3584,7168],2048²; SHA5c3d38c1d44facd769f2ce10b3defc6780ae88f9d912d702077d356a8dc6249c,media660f7875-9567-4af1-b9ae-c0af204d28dc |
| SOURCE78 | 생성 | Higgsfield GPT gpt_image_2_5/jobaaa2635d-ce8f-4420-b7e1-1d428a0be258;1:1/2k/high/opaque/count1,실제2048²; SHA438b91a9e5eed762dfa8c3ac42286dae5422605d7c4c0a3755053a19f847f9f7 |
| REGION78 | 국소 선택 | 중심[1000,1010],반경[520,500];q=((x−1000)/520)²+((y−1010)/500)²;t=clamp((1−q)/.30,0,1);region=t²(3−2t);경계band없음 |
| PROTECT78 | 이전 작업 |73mask>12,74/75/76/77mask>0을 각 레이어 실제x/y로 교차매핑;합집합1219930픽셀/변경0;MaxFilter25/GaussianBlur18,core alpha강제0. 추가 사각형0 |
| BLEND78 | 공식 |alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base77×(1−alpha)+edited78×alpha);원본alpha유지 |
| PIXELS78 | 변화·보존 |총715350/보행715350/비보행0;보호·타원밖·zero-mask·crop밖각각0 |
| CHUNKS78 | 본편 |chunk_1_5.png/chunk_1_6.png/chunk_2_5.png/chunk_2_6.png;8192² master→64 clamped청크/core1024/bleed1/실제1026²;기존60청크유지,224경계strip동일 |
| CACHE78 | 버전 |game production loader·composition·retouch-layers=20260928-outer-78;legacy비교와생체모듈유지 |
| REBAKE78 | 레이어 |skin65→outer66~78,총14;outer78 x1536/y5120/2048²,preblended RGB+binary alpha0/255;pre65+14패치 전체8192²픽셀동일 |
| PROOF78 | 해시 |master66834b040221b42c1e81f0b7fbe2f6667cc33f8399db193af06abe260ae37c12;rawRGBA7ef1c003bfadc4e642589eaa33a27936bf8613d21d1717007ddd22f26a73c2b1 |
| FILES78 | source4파일 |outer78_sources/outer78_patch.png·outer78_mask.png·prep.json·source-provenance.zip. ZIP내 input-base.png·edited_connection.png·outer78_crop.png·generation.json 4엔트리 원본SHA대조. raw원본과 전체프롬프트/UUID/URL은 ZIP에 무손실보존;패치·마스크·prep은직접참조 |
| TRANSPORT78 | 업로드·다운로드 |native exec와Node fetch 실패 후 브라우저 파일선택·승인된 Higgsfield presigned PUT HTTP200→media_confirm. 관찰된 원본pageAssets bundle수신 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0, GROUND CONNECTION → PLAYABLE/COMBAT 국소 보정. 공통 제작 가이드v0.9 전체1048줄을 이전77차부터 읽고 적용한 연속 작업이며78차 동일SHA607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b 확인. 맵디테일·SSOT·지면 계약의 넓은 전투공간/피부/동맥/부패 생체나무 콘셉트 유지.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions |200² 공간·기존 구역 경계 유지,geometry불변 |
| MASTER | main route / side spaces |시작6시→출구12시·상단통로·우회·넓은 공터 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH |기존66~77차 대형질량 유지,새질량0 |
| OUTER MASS | major holes |새독립나무·큰검은hole0;주변 건강한 식생 잔여 |
| LARGE | source assets / composites / overlap |대형나무·scatter추가0;이전73~77차 1219930픽셀보호 |
| LARGE | repeated silhouette |낮은 잎반복을피부·얕은균열로 국소교체;기존고목·주변식생·타지역반복잔여 |
| MEDIUM | connections / remaining holes |77차뿌리 아래 피부면→기존76차 목질 연결;선택면 외곽 식생 추가RETOUCH |
| GROUND | shadow / contamination |회자주괴사피부·낮은찢김·기존조명;새발광·피해·경고0 |
| GROUND | structure integration |보행715350픽셀 정적재질편집;타원밖0;타일/기존오브젝트충돌불변 |
| PLAYABLE | main arenas / travel space |G.map동일;canMv확인[67.5,149.5]에서S/W 110.26월드px 이동·복귀 |
| PLAYABLE | breathing space / threat space |넓은 중앙·오른쪽 공터,시작여백·우회·기존위협 유지 |
| PLAYABLE | combat readability |수정부에서기존AI 임시24적/6etype,적탄6샘플1/2/9/14/18/23;실제공격/Q캡처. 밀집캐릭터·숫자·VFX중첩잔여 |
| LANDMARK | primary / secondary / tertiary |생체나무·늪·야영지·제단·출구 유지;신규0 |
| CAMERA QA | START / EARLY / ARENA |[100,180]/[100,157]/[100,120],본편1280×720 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK |[49,151]/[151,136]/[102,90],본편 |
| CAMERA QA | LATE / EXIT |[100,48]/[100,15],본편 |
| CAMERA QA | 전후 / 전체맵 |후보전후9·일반본편18시점·필수8camera-board·전체맵전후. SKIN_MAIN[62,150]은보행바닥관찰이며다른외곽관찰순간이동은실제이동검수와구분 |
| CAMERA QA | 본편18좌표 |SKIN_MAIN[62,150], SKIN_TOP[62,142], SKIN_LOWER[62,158], SKIN_LEFT[54,150], SKIN_RIGHT[70,150], JOIN76[80,151], START_ACTUAL[100,185], START[100,180], EARLY[100,157], ARENA[100,120], SIDE_L[49,151], SIDE_R[151,136], LANDMARK[102,90], LATE[100,48], EXIT[100,15], L_MASS[73,180], WEST_JOIN[72,117], S_JOIN[121,184] |
| TECH QA | route / collision |지형5PASS·G.map SHA8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1동일. 전체무보정종주·보스클리어·1-2진입미검증 |
| TECH QA | 실제입력 |[67.5,149.5] S650ms/W650ms,아래110.26px·복귀,끝칸runtime0;canMv(r15)/아래0·30·60·90·120px확인. 밀집검수도동일좌표재진입 |
| TECH QA | pageerror / 404 |후보/본편각0,HTTP>=400각0 |
| TECH QA | seam / loading |64청크master동일·224strip동일;본편48청크URL/cache78·route교체0;각카메라·이동캡처visibleIds⊂drawnIds대기 |
| TECH QA | performance |정적4청크교체·새runtime draw/atlas0;저사양GPU/NW.js/장시간FPS미검증 |
| TECH QA | regression / rebake |지형5+레이어/버전3+HTML구문1=9PASS0FAIL;14패치helper전체픽셀재현,전체builder재실행미실시 |
| FILES | stage-owned |master/4청크/preview/source4/메타2/game맵cache한줄/9mapdocs/CHANGELOG맵항목. tmp/ch1-production-pre78백업 |
| FILES | concurrent touched |공유game/CHANGELOG는맵부분만수정;기존staged62·타에이전트작업보존 |
| FILES | unrelated touched |이작업없음;롤백·삭제·runtime에셋숨김없음. raw출처를ZIP4엔트리로무손실보관 |
| GIT | staged / commit |Git쓰기0·78차미커밋. systemPowerShell지정에도provider WindowsApps pwsh프로세스생성전 OS−1073283067/FormatMessage317. 이번실패는curl실행전이며Git명령도시작할수없는같은경로. 기존index보존,대체도구로.git쓰기우회없음 |
| GIT | push / deploy |수행없음 |

**VISUAL VERDICT: RETOUCH** — 수정부카메라에서 잎반복이낮은회자주피부와얕은균열로바뀌며캐릭터·청록적탄·기존나무가구분된다. 선택면외곽의남은잎무늬와타지역원화반복·밀집숫자/VFX중첩은추가보정이필요하다. 자동검사PASS는시각PASS로대체하지않는다.

NEXT PASS: 이번피부면의왼쪽/아래에남은 잎무늬를더얇은피부섬유로연결. 넓은공터·기존충돌·고목·73~78차완성부·늪버블/가스/동맥보존. 소스제어100파일미만을지켜후속작업전현재변경누적재확인.

검수조건: 독립컨텍스트·API slots쓰기차단,체력50ms보충·무적63f를50ms마다보정. 임시기존적24/etype0·1·4·6·7·8,2ring×12/거리250·390/둘째ring angle+.17,3초대기후적탄6샘플500ms,마우스공격1600ms/Q후150ms캡처. 이동·밀집검수전수정좌표재설정및500ms청크대기. 시각검수이며밸런스·무보정클리어·전체성능검증과구분. 새생체모션0,ch1-living-detail.js SHA47af23fb8dd096e5112e29a7b298f8b78f03b409e81d967362a047193c182beb동일.

자료: captures/ch1_outer78/index.html,REPORT.md,visible/runtime.json,live/runtime.json,prep/promotion/generation/final-state JSON,tests/rebake-proof.log,capture-integrity.json. tmp/ch1-checkpoint78-owned.zip은소유결과·이전73~77차소스/청크의존·docs·검수·공유파일분리patch를보존하고모든엔트리SHA대조한다. 공유파일전체스냅샷은타작업복원/스테이징명령으로사용하지않는다.

---

## 77차 이하 보존 기록

# CH1-1 서측 반복 뿌리와 부패 목질 접합 — 77차

76차보다 위쪽인 tile[61,128] 부근의 회색 부채꼴 baked 뿌리를 실제76차 베이스 참조로 부분 편집했다. 균일한 방사형 뿌리 대신 낮은 깨진 수피판·괴사 피부·썩은 섬유가 공터로 이어진다. 수정 영역에는 비보행 숲과 보행 가장자리가 모두 포함되며, 기존 충돌을 시각 편집으로 바꾸지 않는다. 오른쪽 넓은 공터, 왼쪽 두 고목, 아래쪽73~76차 작업을 보호했다. 새 runtime 모션은 추가하지 않았다.

| id | 항목 | 현행 값·공식 |
|---|---|---|
| INPUT77 | 입력 | master76 crop[1536,4608,3584,6656],2048². SHA2bd2e51aeab7cce09073b4061ba779b803c3faaafaaeda847114d5cff7d1eec1; mediaf9bd362e-7efd-4423-a535-fecfc1e55f94 |
| SOURCE77 | 생성 | Higgsfield GPT gpt_image_2_5/job7c2f7f3f-4137-4b3c-bf60-1f4db0736f7f;1:1/2k/high/opaque 요청,실제2048². SHA4549728529e66a05e92d18b84cc9b64cea00c3cd8cbab35fe63cd1268c5e51df. 전체 프롬프트·URL·입출력은 generation.json |
| REGION77 | 국소 선택 | 로컬 중심[925,620],반경[470,450]. q=((x−925)/470)²+((y−620)/450)²; t=clamp((1−q)/.30),region=t²(3−2t). 경계 band 없음 |
| PRIOR77 | 이전 레이어 보호 |73mask>12,74/75/76mask>0을 각 레이어의 실제x/y로 새crop에 교차 매핑. 합집합509153픽셀·변경0 |
| SNAG77 | 두 고목 보호 |crop 로컬 사각형[560,240,730,590],[290,590,530,1030].165100픽셀·변경0 |
| PROTECT77 | 합성 보호 |이전mask와 두 사각형 합집합674253픽셀. MaxFilter25/GaussianBlur18,core강제alpha0 |
| BLEND77 | 공식 |alpha=region×(1−protect)×.92×sourceAlpha, floor(alpha×255)/255. RGB=uint8(master76×(1−alpha)+edited77×alpha),master76 원본alpha 보존 |
| PIXELS77 | 변화·보존 |총573129픽셀;보행368405/비보행204724. 이전 보호·고목 보호·선택 타원 밖·zero-mask·crop 밖 각각변경0 |
| CHUNKS77 | 본편 |chunk_1_4/chunk_2_4/chunk_1_5/chunk_2_5. master8192²→64clamped청크(core1024/bleed1/실제1026²). 나머지60청크 유지·224경계strip 동일 |
| CACHE77 | 버전 |game production loader·composition·retouch-layers 모두20260928-outer-77. legacy 비교 cache·생체 모듈 유지 |
| REBAKE77 | 보존 순서 |skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72→outer73→outer74→outer75→outer76→outer77,총13. outer77 x1536/y4608/2048²,preblended RGB+binary alpha0/255 |
| PROOF77 | 전체 재현 |master SHA982e0a43ad891f7a2d464da3814b28eb0a148423e05cbdb9ec747ee1070229b7;rawRGBA19e6d0ed8d860f5e4e907be949c5e53d3f052402386adff18679ec766c21daef. pre65 master+13패치 helper 전체8192² 픽셀 동일 |
| FILES77 | 원본 |outer77_sources/input-base·edited_connection·outer77_crop·outer77_patch·outer77_mask·prep·generation,7파일. 브라우저에 관찰된 원본 이미지를pageAssets로 수신 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0, MEDIUM CONNECTION → GROUND CONNECTION의 국소 보정. 공통 제작 가이드v0.9 전체1048줄과 맵디테일·SSOT·지면 계약을 읽고 적용했다. 가이드SHA607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b. 기존 대형 외곽 질량을 보존한 뒤 반복 접합을 다듬었다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions |200² 공간과 기존 구역 경계 유지,geometry불변 |
| MASTER | main route / side spaces |시작6시→출구12시,상단통로·우회·공터 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH |기존66~76차 질량 유지. 서측 숲과 공터 사이의 baked 연결만 편집 |
| OUTER MASS | major holes |새 독립나무·큰 검은 hole0. 주변 건강한 잎무늬 면·반복 형상은 잔여 |
| LARGE | source assets / composites / overlap |대형나무·scatter 추가0. 이전 레이어509153픽셀과 두 고목165100픽셀 보호 |
| LARGE | repeated silhouette |회색 fan의 중심·오른쪽 방사형 무늬를 비대칭 낮은 수피판·괴사조직으로 보강. 보호한 고목 옆 가지와 주변 식생은 잔여 |
| MEDIUM | connections / remaining holes |수피판→썩은 섬유→피부 재질. 주변 식생 면·보호부 경계 추가RETOUCH |
| GROUND | shadow / contamination |기존 조명에 맞춘 목질 암부·회자주 피부. 새 발광·피해·경고0 |
| GROUND | structure integration |타원 밖 변경0. 보행368405픽셀을 낮은 재질로 편집했으며 기존 타일/오브젝트 충돌 불변 |
| PLAYABLE | main arenas / travel space |G.map동일. 숲 옆 canMv 확인 지점[67.5,128.5]에서 S/W 112.06월드px 이동·복귀 |
| PLAYABLE | breathing space / threat space |오른쪽 넓은 공터·중앙 전투면·시작 여백·우회·기존 위협 유지 |
| PLAYABLE | combat readability |해당 숲 옆에서 기존AI 임시24적/6etype,적탄6샘플0/5/7/13/20/20. 실제 마우스공격·Q 캡처. 중앙 캐릭터·숫자·VFX 중첩 잔여 |
| LANDMARK | primary / secondary / tertiary |생체나무·늪·야영지·제단·출구 유지;신규0 |
| CAMERA QA | START / EARLY / ARENA |[100,180]/[100,157]/[100,120],본편1280×720 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK |[49,151]/[151,136]/[102,90],본편 |
| CAMERA QA | LATE / EXIT |[100,48]/[100,15],본편 |
| CAMERA QA | 수정부·추가 관찰 |ROOT_MAIN[61,128],TOP[60,120],LOWER[61,136],LEFT[54,128],RIGHT[69,128],JOIN76[80,151],실제START[100,185],L_MASS[73,180],WEST_JOIN[72,117],S_JOIN[121,184] |
| CAMERA QA | 전후 / 전체맵 |후보전후9·일반본편18카메라·필수8camera-board·전체맵 전후. ROOT_MAIN/LEFT와L_MASS는 비보행 질량을 포함한 원화 관찰용 순간이동. 실제 이동은 검증된 보행 지점에서 별도 수행 |
| TECH QA | route / collision |지형회귀5PASS·G.map SHA8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1 동일. 전체 무보정종주·보스클리어·1-2진입 미검증 |
| TECH QA | 실제 입력 |[67.5,128.5]부터S650ms/W650ms,아래112.06월드px 이동·복귀,끝칸runtime0·map동일. canMv(r15)와 아래0/30/60/90/120월드px 모두 열린 지점 선택 |
| TECH QA | pageerror / 404 |후보/본편각각0,HTTP>=400도0 |
| TECH QA | seam / loading |64청크 master동일·224경계strip 동일. 본편49개 청크URL 모두cache77·route교체0. 각 카메라·최종 이동 캡처 visibleIds⊂drawnIds 대기 |
| TECH QA | performance |정적4청크 교체·새 runtime draw/atlas0. 저사양GPU/NW.js/장시간FPS 미검증 |
| TECH QA | regression / rebake |지형5+레이어/버전3+HTML구문1=9PASS0FAIL.13레이어helper전체 픽셀재현;전체builder 재실행 미실시 |
| FILES | stage-owned |master·4청크·preview·source7·composition·retouch·game cache한줄·mapdocs9·CHANGELOG 맵항목. tmp/ch1-production-pre77 백업 |
| FILES | concurrent touched |공유 game/CHANGELOG 맵부분만 변경. 시작 시 기존 staged62파일·로비·저장·성능 타작업 보존 |
| FILES | unrelated touched |이 작업 없음. 롤백·삭제·숨김 없음 |
| GIT | staged / commit |이 세션 Git쓰기0. 지정 system PowerShell을 provider가 WindowsApps pwsh로 바꾸고 프로세스생성 전 OS−1073283067/FormatMessage317 실패. 기존index보존·77차 미커밋. 다른 도구로 .git 권한 우회하지 않음 |
| GIT | push / deploy |이 세션 수행 없음 |

**VISUAL VERDICT: RETOUCH** — ROOT_MAIN 전후에서 회색 fan 중심이 넓은 깨진 수피판과 부패 조직으로 연결된다. 큰 공터·기존 고목·76차 접합을 유지했다. 전체 건강한 식생·보호부 가지·다른 반복 원화·밀집 숫자/VFX 중첩이 남아 있어 전체 시각 PASS로 보고하지 않는다.

NEXT PASS: 이 서측 접합 아래쪽의 넓은 잎무늬 면을 괴사 피부·낮은 목질로 연결한다. 공터·기존 충돌·원본 고목·완성한73~77차 부분·늪 버블/가스/동맥은 보호한다.

검수 조건: 독립 컨텍스트·API slots쓰기 차단,체력50ms 보충·무적63f를50ms마다 보정. 임시 기존적24마리/etype0,1,4,6,7,8·ring별12마리·거리250/390·둘째ring angle+.17,3초 대기 후 적탄6샘플/500ms·마우스공격1600ms·Q 후150ms 캡처. 시각검수이며 밸런스·전체성능·무보정클리어 검증과 구분한다. 새생체모션0,ch1-living-detail.js SHA47af23fb8dd096e5112e29a7b298f8b78f03b409e81d967362a047193c182beb 동일.

자료: captures/ch1_outer77/index.html,REPORT.md,visible/runtime.json,live/runtime.json,prep/promotion/generation/final-state JSON,tests.log,rebake-proof.log,capture-integrity.json. tmp/ch1-checkpoint77-owned.zip에 결과물·이전73~76차 소스/청크 의존·관련docs·맵cache/CHANGELOG분리patch·검수자료를 보존하고 엔트리SHA 대조. 공유파일 전체스냅샷을 타작업 복원·스테이징 명령으로 사용하지 않는다.

밀집 검수 이력: 첫18카메라 세션의 임시 적 전투는 중앙 공터에서 수행했으며 runtime-central.json과 central-review에 보존했다. 최종 수정부 전투는 숲 옆[67.5,128.5]에 다시 진입해 모든 visible 청크가 drawn인 상태에서 별도 검수했다. dense-local.log와 live/runtime.json의 denseLocalRetry로 좌표·적탄·오류를 분리 기록한다. 중앙 공터의 첫 전투를 수정부 전투 완료로 세지 않았다.

---

## 이전76차 기록

# CH1-1 남서 위쪽 반복 뿌리의 낮은 목질·피부 바닥 — 76차

실제75차 마스터에서 tile[80,151] 부근의 반복 회색 부채꼴 뿌리를 새 Higgsfield GPT 원화로 부분 편집했다. 이 뿌리는 타일 충돌 경계보다15타일 이상 안쪽의 보행 바닥에 구워져 있으므로 이번에는 경계 band를 쓰지 않는다. 낮은 목질과 피부 주름으로만 바꾸고 기존 나무 오브젝트·동선·충돌을 유지했다. 선택 영역의 보행 바닥 픽셀은 바뀌었으며 전체 안쪽 전투면을 픽셀 그대로 보존했다고 주장하지 않는다.

| id | 항목 | 현행 값·공식 |
|---|---|---|
| INPUT76 | 실제 입력 | master75 crop[2048,5120,4096,7168],2048². 입력 SHA 7f5e21800d92f5a6770b837da35dac0106c5ea7f2efcadc454899148beb21f2f; media9edaf20f-c6dd-4ca0-8793-b65877e13050 |
| SOURCE76 | 생성·규격 | Higgsfield GPT gpt_image_2_5/job46e35428-d6a6-4420-92a2-cd28efe85ce8. 1:1/2k/high/opaque 요청, 실제2048². SHA336674ac9ae7fc8f1f5c04fb6ccd2f35f232800e3091d7a973899acc13de69ff. 프롬프트·출처는 generation.json |
| REGION76 | 선택 | 로컬 중심[1230,1150], 반경[430,425]. q=((x−1230)/430)²+((y−1150)/425)²; t=clamp((1−q)/.30), region=t²(3−2t) |
| FLOOR76 | 보행 표면 | ellipse 안의 낮은 baked 재질만 편집. edgeBandTiles=null, band/forest blur 없음. geometry/collision·새 scatter·runtime 오브젝트 추가0 |
| PROTECT76 | 이전 작업 보호 | 새 crop 하단1024행에 이전 crop 상단1024행을 매핑. outer73_mask>12 및 outer74_mask>0 및 outer75_mask>0의 합집합301195픽셀. MaxFilter25/GaussianBlur18; core 강제alpha0. 보호 영역 변경0 |
| BLEND76 | 합성 | alpha=region×(1−protect)×.92×sourceAlpha; floor(alpha×255)/255. RGB=uint8(master75×(1−alpha)+edited76×alpha), 원본 master75 alpha 보존 |
| PIXELS76 | 변화·보존 | 총554432픽셀·선택 보행554432픽셀 변화. 선택 타원 밖/이전 보호 영역/zero-mask/crop 밖 각각 변경0 |
| CHUNKS76 | 본편 | chunk_2_5/chunk_3_5/chunk_2_6/chunk_3_6. master8192²에서64개 clamped core1024/bleed1/실제1026². 나머지60청크 유지,224경계 strip 동일 |
| CACHE76 | 버전 | game production loader·composition·retouch-layers 모두 20260928-outer-76. legacy 비교 cache와 기존 생체 모듈 유지 |
| REBAKE76 | 레이어 | skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72→outer73→outer74→outer75→outer76, 총12. outer76 x2048/y5120/2048², preblended RGB와 binary alpha0/255 |
| PROOF76 | 정확한 재현 | master SHA 48cd9bbb0b5e499bd6818402d57a2fb60021f7bdee9b1c0cf4728b7ee3e43ef1; rawRGBA 2238bf224f6a7cba99de9c6bfc708a027aa5d7353e01d246719d909817f58bd0. pre65 master+12패치 helper 전체8192² 픽셀 동일 |
| FILES76 | 제작 자료 | outer76_sources/input-base·edited_connection·outer76_crop·outer76_patch·outer76_mask·prep·generation,7파일. 관찰된 브라우저 이미지의 pageAssets 원본 수신 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. MEDIUM CONNECTION → GROUND CONNECTION 국소 보정. 공통 제작 가이드v0.9 전체1048줄, 맵디테일·SSOT·지면 계약 확인. 가이드SHA607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b. 기존 큰 외곽 질량을 보존한 상태에서 반복 바닥 무늬만 편집했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행200² 구조와 구역 경계 유지; geometry 불변 |
| MASTER | main route / side spaces | 시작6시→출구12시, 상단 통로·우회·공터 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH | 기존66~75차 큰 질량 유지. 남서 위쪽 보행 바닥의 국소 재질만 수정 |
| OUTER MASS | major holes | 신규 독립 나무·큰 검은 구멍0. 주변 건강한 식생과 반복 무늬는 잔여 |
| LARGE | source assets / composites / overlap | 새 대형 나무·scatter0. 기존73~75차 겹침 보호 영역301195픽셀 변경0 |
| LARGE | repeated silhouette | 해당 baked 회색 fan root를 비대칭 낮은 수피판·피부 주름으로 치환. 별도의 위쪽 반복 root와 runtime 나무는 유지 |
| MEDIUM | connections / remaining holes | 수피판→썩은 섬유→피부 재질. 주변 넓은 잎무늬 면과 접합 추가 RETOUCH |
| GROUND | shadow / contamination | 조명에 맞춘 낮은 목질 암부·주름. 새 발광·피해·위험 경고0 |
| GROUND | structure integration | 선택 타원 밖 변경0. 경계 band 사용하지 않음. 편집된 보행 픽셀554432이며 기존 runtime 나무 충돌은 남아 있음 |
| PLAYABLE | main arenas / travel space | G.map 동일. 낮은 표면에 충돌 추가0; 나무 옆 실제 S/W 이동 109.00월드px |
| PLAYABLE | breathing space / threat space | 중앙 넓은 전투공간·시작 여백·우회·기존 위협 배치 유지 |
| PLAYABLE | combat readability | 수정 바닥 옆 tile[87.5,151.5]에서 기존AI 임시24적/6etype, 적탄6샘플 0/2/5/9/19/21. 실제 마우스 공격·Q 캡처. 중앙 숫자·캐릭터·VFX 중첩은 잔여 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·야영지·제단·출구 유지. 신규0 |
| CAMERA QA | START / EARLY / ARENA | [100,180]/[100,157]/[100,120],본편1280×720 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK | [49,151]/[151,136]/[102,90],본편 |
| CAMERA QA | LATE / EXIT | [100,48]/[100,15],본편 |
| CAMERA QA | 수정부·이전 작업 | ROOT_MAIN[80,151],TOP[80,145],LOWER[81,158],LEFT[74,150],RIGHT[87,152],JOIN75[78,174],실제START[100,185],L_MASS[73,180],S_JOIN[121,184],SE_NORTH[171,141]. MASS는 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 전체맵 | 후보 전후9·일반 본편18카메라·필수8camera-board·전체맵 전후. 카메라 순간이동을 종주 검수로 대체하지 않음 |
| TECH QA | route / collision | 지형회귀5PASS. G.map SHA8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1 동일. 무보정 전체 종주·보스 클리어·1-2 진입은 미검증 |
| TECH QA | 실제 입력 | tile[87.5,151.5] S650ms/W650ms, 아래 109.00월드px 이동·복귀; 끝칸runtime0·map 동일. 초기[80.5,151.5]은 기존 m_ctree2(3220,6020,colSz66) 내부 canMv=false로 이동0이어서 성공 근거에서 제외 |
| TECH QA | pageerror / 404 | 후보·본편·이동 재검수 각각0. HTTP>=400도0 |
| TECH QA | seam / loading | 64청크 master 동일·224경계 strip 동일. 본편48개 청크 URL 전부 cache76·route 교체0. 최종 이동 캡처도 visibleIds⊂drawnIds 확인 |
| TECH QA | performance | 정적4청크 교체·새 runtime draw/atlas0. 저사양GPU·NW.js·장시간 FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어/버전3+HTML구문1=9PASS0FAIL. 12레이어 helper 전체 픽셀 재현; 전체 builder 재실행은 미실시 |
| FILES | stage-owned | master·4청크·preview·source7·composition·retouch·game cache한줄·관련 mapdocs9·CHANGELOG 맵 항목. tmp/ch1-production-pre76 백업 |
| FILES | concurrent touched | game/CHANGELOG의 맵 부분만 변경. 외부 에이전트의 기존 staged62파일과 로비·저장·성능 작업 보존 |
| FILES | unrelated touched | 이 작업 없음. 타 작업 롤백·삭제·숨김 없음 |
| GIT | staged / commit | 이 세션 Git 쓰기0. 기존 staged62파일 보존. 네이티브 exec가 지정한 system PowerShell을 WindowsApps pwsh로 바꾸고 프로세스 생성 전 OS−1073283067/FormatMessage317 실패. 다른 경로로 .git 쓰기 권한 우회하지 않음. 76차 미커밋 |
| GIT | push / deploy | 이 세션 수행 없음 |

**VISUAL VERDICT: RETOUCH** — 실제 ROOT_MAIN 전후에서 회색 fan 무늬가 줄고 낮은 부패 목질·피부 주름으로 이어진다. 넓은 공터와 이전 접합은 유지했다. 전체 식생·또 다른 반복 뿌리·기존 runtime 나무 표현·밀집 숫자/VFX 중첩은 남아 있다. 자동 PASS를 전체 시각 PASS로 바꾸지 않는다.

NEXT PASS: 더 위쪽의 별도 반복 뿌리와 넓은 잎무늬 면을 낮은 생체 재질로 접합한다. 보행 공간·기존 충돌·완성한 목질·늪 버블/가스/동맥을 유지한다.

검수 조건: 체력50ms 보충·무적63f를50ms마다 보정. 임시 기존적24마리/etype0,1,4,6,7,8·ring별12마리·거리250/390·2번째ring angle+.17을 사용하는 시각 QA이며 밸런스·성능 검증과 구분한다. API slots 쓰기 차단·독립 컨텍스트. 새 생체 모션 추가0; ch1-living-detail.js SHA47af23fb8dd096e5112e29a7b298f8b78f03b409e81d967362a047193c182beb 동일.

검수 보정 이력: 최초 이동점은 타일floor0이지만 기존 나무 collider 내부라 canMv=false였고 hill=false였다. 충돌 코드를 바꾸지 않고 canMv(r15)와 아래120월드px 경로가 모두 열린87.5/151.5로 시작점만 변경했다. 첫 이동 재촬영의 위쪽 청크 로딩 중 화면은 L_WALK_loading.png로 분리·성공 근거에서 제외하고, 최종은 모든 visible 청크 drawn을 기다려 캡처했다. dense 화면은 별도 준비 완료 상태에서 검수했다.

자료: captures/ch1_outer76/index.html, REPORT.md, prep/promotion/final-state/generation JSON, visible/runtime.json, live/runtime.json, runtime-initial.json, movement-retry/ready 로그, capture-integrity.json, tests.log, rebake-proof.log. tmp/ch1-checkpoint76-owned.zip에 소유 결과물·이전 소스 의존·관련docs·맵cache/CHANGELOG 분리patch·검수 기록을 보존하고 모든 엔트리SHA를 대조한다. 공유파일 전체 스냅샷을 복원 명령으로 사용하지 않는다.

---

## 이전 75차 기록

# CH1-1 남서 회색 잔뿌리와 목질·피부 접합 — 75차

남서73차 고목 위쪽에 남아 있던 회색 부채꼴 잔뿌리와 잎 무늬를 실제74차 master crop 입력으로 부분 편집했다. 최종은 Higgsfield GPT의 새75차 원화이며, 초기74차 원화 재사용 후보는 잎 무늬가 크게 남아 적용하지 않았다. 넓은 전투공간·고목 core·collision·기존 생체 모션을 보존한다. 선택 영역의 낮은 보행 재질은 변경했으며 새 장애물이나 runtime 오브젝트는 추가하지 않았다.

| id | 항목 | 현행 값·공식 |
|---|---|---|
| INPUT75 | 실제 입력 | master74 crop[2048,6144,4096,8192],2048²; SHA f0af874df9ddd714d567e232aa730fc6a54b38a6159a18ea38fe6f3d01f26fc5; media5bc83eb3-93f6-4022-9e98-26d4dc613684 |
| SOURCE75 | 생성·규격 | Higgsfield GPT gpt_image_2_5/job bbf05779-74e3-4b4a-ad6b-5e751c41bc09; 1:1/2k/high/opaque 요청, 실제2048² RGB; SHA e4e39f9331d7add613fa94018ea1775c6971e333d4a5480fee7ed281df21a627 |
| REGION75 | 선택 | crop 로컬 중심[1220,950],반경[400,480]. q=((x−1220)/400)²+((y−950)/480)²; t=clamp((1−q)/.30), region=t²(3−2t) |
| BAND75 | 낮은 지면 범위 | layout200² 비보행 셀의 Chebyshev8타일 이웃, 축별320월드px/327.68masterpx. blur20. 선택 타원과 band의 교집합만 사용; band밖 보행 alpha0. 74차2타일보다 안쪽의 기존 회색 root까지 낮은 재질 편집; collision 확대 없음 |
| TRUNK75 | 기존 고목 보호 | outer73_mask>12인572420픽셀 변경0. MaxFilter25/GaussianBlur18 보호 alpha; core는 강제alpha0 |
| BLEND75 | 합성 | alpha=region×bandBlur×(1−protect)×.92×sourceAlpha, floor(alpha×255)/255; RGB=uint8(master74×(1−alpha)+edited75×alpha). master74 alpha 보존. 초기 재사용 후보의 누적max 방식은 최종에 사용하지 않음 |
| PIXELS75 | 변화·보존 | 총384431픽셀, 선택 범위 보행368590픽셀 변화. band밖 보행/고목 core/zero-mask/crop밖 변경 각각0 |
| CHUNKS75 | 본편 | chunk_2_6/chunk_3_6/chunk_2_7/chunk_3_7; 단일8192² master에서64개clamped core1024/bleed1/실제1026². 나머지60청크 유지 |
| CACHE75 | 버전 | game production loader·composition·retouch-layers 모두20260928-outer-75. 기존 생체 모듈61 및 legacy 비교cache 유지 |
| REBAKE75 | 순서·레이어 | skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72→outer73→outer74→outer75; 총11. outer75 x2048/y6144/2048², preblended RGB+binary alpha0/255 |
| PROOF75 | 정확한 재현 | master 17a1e4c381605b5ef593e0094abf49c175493d7dc789b0d2f447d0733b038844; rawRGBA baa619b3a5c3c7df036e0c69b9fec321a488e403371c655a304235f3ffd8e305. pre65 master+11패치 helper 전체8192² 일치 |
| FILES75 | 제작 원본 | outer75_sources의 input-base/edited_connection/outer75_crop/outer75_patch/outer75_mask/prep/generation 7파일. 프롬프트·입력/출력 정보 generation.json. 현재 원화는 별도브라우저 source페이지의관찰이미지를pageAssets로원본수신 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE3 MEDIUM CONNECTION→GATE4 GROUND CONNECTION의 국소 보정. 제작 가이드v0.9 전체1048줄과맵디테일·SSOT·지면계약 확인. 가이드SHA 607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b. 외곽우선·넓은공터 유지.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행200²·8구역·53점경계 유지. geometry/collision 불변 |
| MASTER | main route / side spaces | 시작6시→출구12시·상단통로·양쪽우회·공터 유지 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH | 기존66~74차 큰 질량 유지. 남서 고목 옆 낮은 접합만 편집 |
| OUTER MASS | major holes | 독립나무·새검은빈hole 추가0. 건강한식생/반복가지 전체잔여 |
| LARGE | source assets / composites / overlap | 기존73 고목core572420픽셀 그대로. 새대형나무·랜드마크·scatter0 |
| LARGE | repeated silhouette | 해당 회색 부채꼴 root 줄이고 비대칭 낮은 목질로 접합. 별도의 위쪽grayroot 및 주변숲은잔여 |
| MEDIUM | connections / remaining holes | 수피판→괴사섬유→피부주름. 바깥식생과주변접합 추가RETOUCH |
| GROUND | shadow / contamination | 기존 조명에 맞춘 국소 목질암부·낮은피부주름. 새발광·위험피해·경고없음 |
| GROUND | structure integration | 타원+8타일band+blur·고목보호. band밖보행바닥 픽셀변경0; 74차2타일band전체를보호했다고하지않음 |
| PLAYABLE | main arenas / travel space | G.map전후/본편동일. 새재질은낮은통과가능표면이며충돌추가0 |
| PLAYABLE | breathing space / threat space | 중앙전투면·시작여백·우회·기존위험공간보존 |
| PLAYABLE | combat readability | 기존AI 임시24적/6etype추가, 실제 적탄6샘플 0/0/7/11/19/22. 마우스공격·Q 확인. 밀집캐릭터/숫자/VFX 중앙중첩잔여 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·야영지·제단·출구 유지; 신규0 |
| CAMERA QA | START / EARLY / ARENA | [100,180]/[100,157]/[100,120] 본편1280×720 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK | [49,151]/[151,136]/[102,90] 본편 |
| CAMERA QA | LATE / EXIT | [100,48]/[100,15] 본편 |
| CAMERA QA | 수정부·추가관찰 | NORTH[78,169],CROWN[80,172],EDGE[78,174],JOIN[82,182],LOWER[87,190],FOLD[78,179],MASS[73,180],실제START[100,185],S_JOIN[121,184],SE_NORTH[171,141]. MASS는비보행원화관찰용 순간이동 |
| CAMERA QA | 전후 / 전체맵 | 후보전후9·route교체없는일반본편18카메라, 전체맵 전후 및 필수8camera-board. 순간이동캡처를종주완료로해석하지않음 |
| TECH QA | route / collision | 지형회귀5 PASS 및 G.map SHA 8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1 동일. 무보정전체종주/보스클리어/1-2진입 미검증 |
| TECH QA | 실제입력 | tile[78.5,174.5]에서S650ms/W650ms, 아래107.87월드px이동·복귀. 끝칸runtime0, G.map동일 |
| TECH QA | pageerror / 404 | 후보/본편각각0; HTTP>=400도0 |
| TECH QA | seam / loading | 64청크master동일·224경계strip동일. 본편48청크요청전부cache75,visibleIds⊂drawnIds,본편route교체0 |
| TECH QA | performance | 정적4청크교체·추가runtime draw/상주atlas0. 저사양GPU/NW.js/장시간FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어/버전3+HTML구문1=9PASS0FAIL; 11레이어helper전체픽셀재현. 전체builder재실행미실시 |
| FILES | stage-owned | master·4청크·preview·source7·composition·retouch·game cache한줄·관련mapdocs9. tmp/ch1-production-pre75 백업 |
| FILES | concurrent touched | 공유game/CHANGELOG의맵부분만변경. 로비·프레임저하·출품타작업보존 |
| FILES | unrelated touched | 없음. 타작업롤백·삭제·숨김없음 |
| GIT | staged / commit | 보고작성시이세션Git쓰기없음. 실제최종HEAD/index/승인된Git실행결과는end-state.json에분리기록. .git읽기전용권한을우회하지않음 |
| GIT | push / deploy | 이세션수행없음 |

**VISUAL VERDICT: RETOUCH** — 본편 L_EDGE에서 기존 회색 fan이 낮은부패목질과피부주름으로이어지고 플레이어·적/탄을확인했다. 전체건강한식생·또다른grayroot·주변접합·밀집효과중앙중첩이남아있다. 자동PASS를전체시각PASS로바꾸지않는다.

NEXT PASS: 남서 시작 경계의 더위쪽 반복root와 식생접합을 정리한다. 넓은전투면/동선/고목원본/늪버블·가스·동맥을유지한다.

검수조건: 체력50ms·무적63f를50ms마다보정, 임시기존적24마리의시각QA. 실제AI/적탄/공격/Q를사용하며밸런스·성능검증과구분한다. API slots쓰기차단·독립컨텍스트. 기존생체모듈SHA 47af23fb8dd096e5112e29a7b298f8b78f03b409e81d967362a047193c182beb 유지, 신규모션추가없음.

초기후보이력: 2타일band 재사용후보12429픽셀변화는실제grayroot가4~8타일안쪽이어서너무좁았다. 8타일band의74원화누적max후보322772픽셀변화는커진잎무늬가남아미적용(attempt2). 최종은실제74베이스참조의새GPT원화와위BLEND75이며초기후보를본편완료로세지않는다.

자료: captures/ch1_outer75/index.html, REPORT.md, visible/runtime.json, live/runtime.json, prep.json, promotion.json, tests.log, rebake-proof.log, capture-integrity.json. tmp/ch1-checkpoint75-owned.zip에는맵소유파일·이전미커밋소스의존·맵cache/CHANGELOG분리patch·관련docs·검수기록을보존하고엔트리SHA를검증한다.

실제 Git 최종 확인: 승인된git add가exec 프로세스생성전 OS -1073283067/FormatMessage317로실패했다. index는비어있고커밋은미완료다. 다른실행경로로읽기전용.git권한을우회하지않았다. 맵적용·QA·docs는완료했고소유체크포인트로보존한다.

---

## 74차 이하 제작 이력

# CH1-1 남서 고목과 지면 접합 — 74차

기존 남서 고목 오른쪽·아래의 반복 잔뿌리와 수풀 일부를 낮은 부패 목질·괴사 조직으로 연결했다. 73차의 실제 master crop을 Higgsfield GPT 편집 입력으로 제공했다. 생성 결과 전체를 덮어쓰지 않고 국소 마스크로 반영했다. 기존 고목의 보호 영역과 경계 안쪽 전투 바닥은 그대로다. 보행 경계의 낮은 재질은 편집했으며 지형·충돌·이동·밸런스·생체 애니메이션은 변경하지 않았다.

| id | 항목 | 실제 계약 |
|---|---|---|
| INPUT74 | 실제 베이스 | master crop [2048,6144,4096,8192], 2048². input-base.png SHA256 fee0f47941a83bcdd7640e306c7cee6b77ec72a44ce7ce6a607b8da7fed1f905; 업로드 media 1f960bf0-1945-4140-92f2-bd134fddecbe |
| SOURCE74 | 편집 모델·규격 | Higgsfield GPT gpt_image_2_5 / job aa478af7-f0cd-4b02-a870-405d6263937b. 1:1/2k/high/opaque 요청, 실제 2048² RGB. 생성 원본 SHA256 7d4071594a377e04e12d584474a1c446397a167f107dbab2df0c6799730cf6fc |
| REGION74 | 부분 편집 | crop 로컬 타원 중심 [1200,1310], 반경 [470,600]. q=((x−1200)/470)²+((y−1310)/600)²; t=clamp((1−q)/.30); region=t²(3−2t), 합성계수 .92 |
| BAND74 | 경계 보행 재질 | 현행 200² layout grid에서 비보행 셀의 Chebyshev 2타일 이웃. 축별 최대80월드px/81.92master px. GaussianBlur20, 보행 중 band 밖 alpha0. 충돌 면적 확대 없음 |
| TRUNK74 | 73차 고목 보호 | outer73_mask>12인 572,420픽셀 변경0. 보호 alpha는 MaxFilter25/GaussianBlur18로 부드럽게 확장하고 core는 강제로 alpha0 |
| BLEND74 | 픽셀 합성 | alpha=region×bandBlur×(1−trunkProtect)×.92×sourceAlpha. 양자화 floor(alpha×255)/255; RGB=uint8(base×(1−alpha)+edited×alpha), 베이스 alpha 보존 |
| PIXELS74 | 실제 변화 | 총 183,663픽셀, 경계 보행 재질 121,007픽셀. band 밖 보행/고목 보호 core/alpha0/crop 밖 변화 각각0 |
| CHUNKS74 | 본편 | chunk_2_6.png, chunk_3_6.png, chunk_2_7.png, chunk_3_7.png. 단일8192² master→64 clamped 청크, core1024/bleed1/실제1026². 다른60청크 보존 |
| CACHE74 | 로더·메타데이터 | game production loader, composition.bakeVersion, retouch-layers.bakeVersion 모두 20260928-outer-74. 생체 모듈 cache61·legacy 비교cache 유지 |
| REBAKE74 | 레이어 순서 | skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72→outer73→outer74. 마지막x2048/y6144/2048², preblended RGB+binary alpha0/255 |
| PROOF74 | 재현 해시 | master 3b05ccc2c022f32c327acf4e96eceb6a9db2ca5d79a715bd74253923412c844c; 전체 RGBA f2574c440e1eaa3f52e1d4f489162ba1b37053fea635461ceb0684c4a0d69b1f. pre65 master+10패치 helper 재현, 전체8192² 픽셀 동일 |
| FILES74 | 제작 원본 | outer74_sources의 input-base/edited_connection/outer74_crop/outer74_patch/outer74_mask/prep/generation 7파일. 전체 프롬프트·참조 입력·출력 규격을 generation.json에 기록 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0. GATE3 MEDIUM CONNECTION→GATE4 GROUND CONNECTION의 국소 보정. 제작 가이드 v0.9 1048줄 전체와 맵디테일·SSOT·지면 계약을 확인했다. 외곽 우선, 넓은 전투공간, 중앙 추가장식 없음.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행200²·8구역 유지. geometry·collision 불변 |
| MASTER | main route / side spaces | 시작6시→출구12시·상단route·양쪽 우회·넓은 공터 보존 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH | 66~73차 대형 고목 질량 보존. 남서73 고목의 접합만 편집 |
| OUTER MASS | major holes | 새 검은 빈 구멍·독립 structure 없음. 건강한 식생과 반복 가지는 전체 맵에 남음 |
| LARGE | source assets / composites / overlap | 새 대형 나무·랜드마크·scatter0. 기존 고목 core 572420픽셀 정확히 보존 |
| LARGE | repeated silhouette | 기존 fan-shaped 잔뿌리의 접합 일부를 낮은 목질로 완화. 위쪽·안쪽 잔뿌리는 남음 |
| MEDIUM | connections / remaining holes | 고목 수피판→낮은 목질·괴사 조직→기존 지면. 주변 수풀·잔가지 접합은 후속 보정 필요 |
| GROUND | shadow / contamination | 생성 crop의 국소 접촉 암부·어두운 섬유질. 새 발광·피해·경고 효과 없음 |
| GROUND | structure integration | 타원 선택·2타일 경계 band·blur·고목 보호 합성. 넓은 안쪽 전투 바닥은 픽셀 변경0 |
| PLAYABLE | main arenas / travel space | G.map 전후·본편 동일. 원화의 낮은 재질은 그대로 통과 가능; 기존 gameplay 장애물 보존 |
| PLAYABLE | breathing space / threat space | 시작 여백·중앙 전투면·우회 유지. 경계 재질을 새 충돌 벽으로 바꾸지 않음 |
| PLAYABLE | combat readability | 기존AI 임시24적/6etype, 실제 적탄6샘플 0/2/11/12/21/25개. 공격·Q 화면 확인. 캐릭터·숫자·VFX 중앙중첩 잔여 |
| LANDMARK | primary / secondary / tertiary | 생체나무·큰늪·야영지·제단·출구 유지; 신규 랜드마크0 |
| CAMERA QA | START / EARLY / ARENA | [100,180]/[100,157]/[100,120] 본편 |
| CAMERA QA | SIDE L / SIDE R / LANDMARK | [49,151]/[151,136]/[102,90] 본편 |
| CAMERA QA | LATE / EXIT | [100,48]/[100,15] 본편 |
| CAMERA QA | 수정 경계 | MASS[73,180]은 비보행 원화 관찰용 순간이동. EDGE[78,174]/JOIN[82,182]/LOWER[87,190]/FOLD[78,179] 및 실제시작[100,185] |
| CAMERA QA | 전체 비교 | 후보 전후8시점, route 교체없는 본편16시점1280×720, 전체맵 전후. 순간이동 캡처는 종주 검수와 구분 |
| TECH QA | route / collision | 지형 회귀5검사 PASS·후보전후/실제 입력/밀집QA G.map 동일. 무보정 전체 종주 미검증 |
| TECH QA | 경계 이동 | [78.5,174.5]에서 S650ms/W650ms, 실제 아래 106.25월드px 이동·복귀, 끝칸runtime0. 기존 collision 그대로 |
| TECH QA | pageerror / 404 | 후보와 본편 각각0, HTTP>=400도0 |
| TECH QA | seam / loading | master/64청크 동일·224경계 strip 일치. 본편48청크요청 모두cache74, visibleIds⊂drawnIds, 후보 교체만 사용·본편 교체0 |
| TECH QA | performance | 정적4청크 교체, 추가 runtime draw/상주 atlas0. 저사양GPU·NW.js·장시간FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어·버전3+HTML구문1=9PASS. helper 전체 픽셀 재현; fullbuilder 전체 실행은 미실시 |
| FILES | stage-owned | master·4청크·preview·source7·composition·retouch·game cache 한줄·관련 맵docs. tmp/ch1-production-pre74 백업 |
| FILES | concurrent touched | 공유 game.html/CHANGELOG 최신본의 맵 범위만 변경. 로비·출품·캐릭터 타작업 보존 |
| FILES | unrelated touched | 없음. 타작업 삭제·숨김·롤백 없음 |
| GIT | staged / commit | 보고 작성 시 이 세션 Git 쓰기 없음. 최근 정상 exec가 PowerShell 생성 단계 OS317로 실패; 실제 기록 상태는 end-state.json으로 별도 확인 |
| GIT | push / deploy | 이번 세션 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 실제 플레이 화면에서 기존 고목과 낮은 목질이 더 이어진다. 잔여 회색 뿌리·건강한 식생·주변 접합과 밀집 전투 중첩은 추가 보정이 필요하다. 자동 검사 PASS를 전체 시각 PASS로 바꾸지 않는다.

NEXT PASS: 남서 경계의 위쪽 잔뿌리와 잎·가지 접합을 더 줄인다. 넓은 전투면, 기존 남측 양쪽 고목, 북쪽route, 늪 버블·가스·동맥을 유지한다.

검수 조건: 체력50ms·무적63f를50ms마다 보정한 임시24적 시각QA. 실제 AI·적탄·마우스 공격·Q를 사용했으며 밸런스·성능 검증과 구분한다. API slots 쓰기를 차단한 독립 QA 컨텍스트이다. 기존 생체 모듈 SHA256 47af23fb8dd096e5112e29a7b298f8b78f03b409e81d967362a047193c182beb 그대로이며 새 생체 움직임을 추가하지 않았다.

이력: 비보행만 허용한 첫 마스크는 총60,105픽셀·보행0변화였으나 잔뿌리가 대부분 남아 시각 보정했다. 최종은 위 BAND74 경계 재질 편집이며 첫 마스크와 구분한다. generation.json에는 실제 베이스 참조가 있고, 다른 crop·전체맵을 신규 생성하지 않았다.

자료: captures/ch1_outer74/index.html / visible/runtime.json / live/runtime.json / prep.json / promotion.json / tests.log / rebake-proof.log. 맵 소유 파일·73차 참조 의존파일·맵 cache 분리본·관련docs·검수 자료는 tmp/ch1-checkpoint74-owned.zip에 보존하고 엔트리 SHA256을 대조한다.

---

> 이하 73차 이전 기록. 현행 계약은 위 74차 보고를 따른다.

# CH1-1 남서 시작 경계 부패 목질 — 73차

시작 구역 왼쪽의 수풀·가는 가지 반복 일부를 비틀려 꺾인 고목 단면과 넓은 뿌리판으로 연결했다. 전체 베이스를 다시 생성하지 않고 기존 master의 비보행 배경에만 새 투명 원화를 합성했다. 생성 원화는 기존 crop을 참조 입력으로 전달하지 않은 standalone 환경 레이어다. 실제 본편 master 위 합성·카메라 검수로 연결을 확인했다. 정적 원화이며 새 생체 움직임을 추가한 작업은 아니다.

| id | 계약 | 실제 값 |
|---|---|---|
| SOURCE73 | 생성 | Higgsfield GPT gpt_image_2_5 / joba0982929-ab1d-42e1-b230-efa86193c5b0. 1:1/2k/high/transparent 요청, 실제2048² RGBA, alpha0..254, alpha0픽셀2,945,977 |
| PLACE73 | 좌표 | master crop[2048,6144,4096,8192] 2048², 중심tile[73,180], sprite1536²/scale.75, crop offset[174,461] |
| MASK73 | 합성·보호 | RGB×.70/opacity.84; 현행200² layout grid 전체 대조, 비보행 MinFilter49/GaussianBlur20, 보행alpha 강제0·8bit alpha 양자화 |
| PIXELS73 | 변화 | 580,534픽셀; 보행0/alpha0영역0/crop 밖0. 원화 투명 영역의 베이스 보존 |
| CHUNKS73 | 본편 | chunk_2_6.png, chunk_2_7.png, chunk_3_7.png; core1024/bleed1/1026². 단일master에서 clamped crop, 나머지청크 보존 |
| METADATA73 | 버전 일치 | 착수시 runtime72/master72인데 retouch·composition label70을 재현(새 회귀RED). 원인은 보정helper 복사시 파일/id의 outer70 치환만 수행하고 cache의 outer-70 문자열을 남긴 것. 두 label만72로 수정하여GREEN, helper의정확한cache문자열도73으로수정, 최종 원화반영·cache·두metadata73 동일. 72차 마스터/LFS oid가 HEAD4247b65a1에 포함된 것도 확인 |
| CACHE73 | 로더 | 20260928-outer-73; 생체모듈61차·legacy 비교cache 유지 |
| REBAKE73 | 보존 순서 | skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72→outer73. 마지막x2048/y6144/2048²; preblended RGB+binary alpha0/255 |
| PROOF73 | 해시 | master c39583e44b046747952db5e2df5f088f950d90e86f9c73113d17cd11d06dcea6; rawRGBA f09c0064866415647b3a98fcf9187aabf33bedec76ff6826e3593cda834e28e2. pre65+9patch helper 전체8192² 픽셀 동일 |
| FILES73 | 재현 | outer73_sources의원화/crop/patch/mask/prep/generation 6파일. 원본SHA dd48da6d3738e7051d396421b526db3e9cd6247df75b764c89751aec78c0c985, 전체prompt와 실제alpha 기록 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE2~4 남측 LARGE OUTER MASS 부분 리터치. 앞서 전체 읽은 제작가이드1048줄이 현재도 동일함을 확인하고 맵디테일·production SSOT를 재확인했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행200² 지형·8구역 유지. geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 시작6시→출구12시·상단통로·넓은공터·양쪽우회 보존 |
| OUTER MASS | LEFT / RIGHT | 서쪽66·북서67·동쪽69·남동71·남측오른쪽72 보존 |
| OUTER MASS | TOP / SOUTH | 북쪽68 유지. 남측 시작 왼쪽 외곽에 낮은 목질 공동 연결 |
| OUTER MASS | major holes | 선택영역 반복수풀 일부를 큰수피판·심재 공동으로 정리. 전체 녹색식생·가는가지 반복은 남아 있음 |
| LARGE | source assets / composites | 신규Higgsfield GPT 투명 원화 한 개; 기존base 위 부분 합성. small scatter 추가0 |
| LARGE | overlap / repeated silhouette | 높은고목·부채꼴뿌리와 구별되는 비틀린 줄기→갈라진 단면→넓은 뿌리판. 비보행 계층만 합성 |
| MEDIUM | connections / remaining holes | 수피판→검은심재→국소힘줄→짧은뿌리 연결. 주변고사리·잔여식생은 추가리터치 필요 |
| GROUND | shadow / contamination | 원화 하부 접촉 암부·국소 괴사 조직. 새보행오염 없음 |
| GROUND | structure integration | 실제보행경계 마스크 feather, 피부65·기존동맥 보존. crop 외부 픽셀0변화 |
| PLAYABLE | main arenas / travel space | 넓은시작공간·중앙공터·동측우회·상단route 보존; 후보전후/본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행픽셀0변화·충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존AI 임시24적, 적탄6샘플 0/1/2/7/18/23개. 캐릭터 중앙중첩 남아 있어 전체 전투PASS 아님 |
| LANDMARK | primary / secondary / tertiary | 생체나무·큰늪·캠프·제단·출구 유지. 새 주요랜드마크 없음 |
| CAMERA QA | START / EARLY | [100,180]/[100,157], 실제시작칸 [100,185] 보행화면 추가 |
| CAMERA QA | ARENA / SIDE L / SIDE R | [100,120]/[49,151]/[151,136] 본편경로 |
| CAMERA QA | LANDMARK / LATE / EXIT | [102,90]/[100,48]/[100,15] 본편경로 |
| CAMERA QA | 남측 경계 | EDGE[78,174]·JOIN[82,182]·LOWER[87,190] 보행화면. MASS[73,180]은 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보전후7카메라·route교체없는 본편39카메라1280×720 및 전체맵전후. 본편은 첫27개+재검수12개 결합; 순간이동은 종주검증과 구분 |
| TECH QA | route / collision | 현행layout 연결성검사·실제WASD 후G.map동일. 무보정전체종주 미검증 |
| TECH QA | 남측 실제 이동 | [78.5,174.5]에서 실제S650ms/W650ms, 아래로107.13월드px, 끝칸runtime G.map0·복귀·map동일. 보정없는종주와 구분 |
| TECH QA | pageerror / 404 | 후보·본편 각각0, HTTP>=400도0 |
| TECH QA | seam / loading | master/64청크 동일·224경계strip 동일, 본편62청크요청 모두cache73·visibleIds⊂drawnIds·교체0 |
| TECH QA | performance | 정적3청크교체·추가runtime draw0. 저사양GPU·NW.js·장시간FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어보존3+HTML구문1=9PASS. helper 전체재현, fullbuilder전체실행과 구분 |
| TECH QA | metadata regression | 신규 production rebake metadata uses the chunk version loaded by the game 검사. 실제 두JSON과 로딩cache 대조; RED→GREEN 기록 metadata-red/green.log |
| FILES | stage-owned | master·3청크·preview·source6·manifest·composition·game cache 한줄·test/ch1ProductionRetouch.test.js 버전일치검사·맵docs·검수. 반영전tmp/ch1-production-pre73 백업 |
| FILES | concurrent touched | 공유game.html·CHANGELOG 최신본의 맵 관련 범위만 변경. 동시작업Git staging에는 직접쓰기 없음 |
| FILES | unrelated touched | 없음. 타작업 삭제·숨김·롤백 없음 |
| GIT | staged / commit | 73차 쓰기·커밋 수행안함. 이 세션 .git 읽기전용·exec시작 장애로 허용된Git쓰기경로 미확보. 다른에이전트의누적커밋상태와 구분 |
| GIT | source-control limit | 최종git상태·73차체크포인트 검증기록 참조. 실제런타임에셋 숨김·삭제 없음 |
| GIT | push / deploy | 이 세션73차는 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 남측 왼쪽 경계의 큰 수피판·검은 공동이 실제보행화면에서 읽힌다. 전체 건강한 식생·반복가지·주변 접합·밀집캐릭터 중첩은 추가수정 필요하다. 자동검사PASS를 전체visualPASS로 대체하지 않는다.

NEXT PASS: 남측 양쪽 외곽에 남아 있는 녹색 식생·가지 접합을 다듬고 큰 목질 사이 지면 연결을 개선한다. 넓은 시작공간·북쪽route·기존 늪버블/가스/동맥 보존.

초기 QA의 late 화면 일부가 흰 화면으로 캡처되어 이를 visual PASS 근거에서 제외하고 12시점과 전투를 새 페이지로 재검수했다. 원인 확정·장시간 재현 검증은 남아 있다. 첫 경계 순간이동[83.5,183.5]는 기존 오브젝트 충돌로 변위0; canMv 검사 후[78.5,174.5]에서 실제 이동을 확인했다. 기존 collision 변경 없음.

검수: captures/ch1_outer73/index.html·visible/runtime.json·live/runtime.json·prep.json·promotion.json·tests.log·rebake-proof.log. 체력50ms/50ms 무적고정63f 및 기존 무적점멸이 캐릭터를 가리는 캡처를 피한 임시24적 시각QA로 성능·밸런스 검증은 아니다.

보존: 73차소유파일·관련docs·검수자료를 tmp/ch1-checkpoint73-owned.zip에 묶고 엔트리SHA256을 검증한다. 공유game 전체스냅샷과 cache만 분리한검토본을 구분하며 .git 직접쓰기 없음.

---

> 이하 72차 이전 기록. 현행 계약은 위 73차 보고를 따른다.

# CH1-1 남측 시작 경계 부패 목질 — 72차

시작 구역 오른쪽의 수풀·가는 가지 반복 일부를 낮고 넓은 수피판과 썩은 목질 공동으로 연결했다. 전체 베이스를 다시 생성하지 않고 기존 master의 비보행 배경에만 새 투명 원화를 합성했다. 생성 원화는 기존 crop을 참조 입력으로 전달하지 않은 standalone 환경 레이어다. 실제 본편 master 위 합성·카메라 검수로 연결을 확인했다. 정적 원화이며 새 생체 움직임을 추가한 작업은 아니다.

| id | 계약 | 실제 값 |
|---|---|---|
| SOURCE72 | 생성 | Higgsfield GPT gpt_image_2_5 / job24f6587e-8685-4082-819a-ae9564d8fd38. 1:1/2k/high/transparent 요청, 실제2048² RGBA, alpha0..254, alpha0픽셀3,066,102 |
| PLACE72 | 좌표 | master crop[4096,6144,6144,8192] 2048², 중심tile[129,181], sprite1536²/scale.75, crop offset[420,502] |
| MASK72 | 합성·보호 | RGB×.70/opacity.84; 현행200² layout grid 전체 대조, 비보행 MinFilter49/GaussianBlur20, 보행alpha 강제0·8bit alpha 양자화 |
| PIXELS72 | 변화 | 433,965픽셀; 보행0/alpha0영역0/crop 밖0. 원화 투명 영역의 베이스 보존 |
| CHUNKS72 | 본편 | chunk_5_6.png, chunk_4_7.png, chunk_5_7.png; core1024/bleed1/1026². 단일master에서 clamped crop, 나머지청크 보존 |
| CACHE72 | 로더 | 20260928-outer-72; 생체모듈61차·legacy 비교cache 유지 |
| REBAKE72 | 보존 순서 | skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72. 마지막x4096/y6144/2048²; preblended RGB+binary alpha0/255 |
| PROOF72 | 해시 | master 92a8628afd7196b8880b0487a6584fb3169a993f2cd6aeef93591646e01cd2e1; rawRGBA 93e8344b4c3144913730bf440a5242fca494f97e989fce20e8962cf2c9e3db8c. pre65+8patch helper 전체8192² 픽셀 동일 |
| FILES72 | 재현 | outer72_sources의원화/crop/patch/mask/prep/generation 6파일. 원본SHA a000d1c3775cbc46a3a0e6d692e800cc21bcfd0326b08077b816f63f27745c79, 전체prompt와 실제alpha 기록 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE2~4 남측 LARGE OUTER MASS 부분 리터치. 앞서 전체 읽은 제작가이드1048줄이 현재도 동일함을 확인하고 맵디테일·production SSOT를 재확인했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행200² 지형·8구역 유지. geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 시작6시→출구12시·상단통로·넓은공터·양쪽우회 보존 |
| OUTER MASS | LEFT / RIGHT | 서쪽66·북서67·동쪽69·남동71 보존 |
| OUTER MASS | TOP / SOUTH | 북쪽68 유지. 남측 시작 오른쪽 외곽에 낮은 목질 공동 연결 |
| OUTER MASS | major holes | 선택영역 반복수풀 일부를 큰수피판·심재 공동으로 정리. 전체 녹색식생·가는가지 반복은 남아 있음 |
| LARGE | source assets / composites | 신규Higgsfield GPT 투명 원화 한 개; 기존base 위 부분 합성. small scatter 추가0 |
| LARGE | overlap / repeated silhouette | 높은고목·부채꼴뿌리와 구별되는 낮고 넓은 가로 목질. 비보행 계층만 합성 |
| MEDIUM | connections / remaining holes | 수피판→검은심재→국소힘줄→짧은뿌리 연결. 주변고사리·잔여식생은 추가리터치 필요 |
| GROUND | shadow / contamination | 원화 하부 접촉 암부·국소 괴사 조직. 새보행오염 없음 |
| GROUND | structure integration | 실제보행경계 마스크 feather, 피부65·기존동맥 보존. crop 외부 픽셀0변화 |
| PLAYABLE | main arenas / travel space | 넓은시작공간·중앙공터·동측우회·상단route 보존; 후보전후/본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행픽셀0변화·충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존AI 임시24적, 적탄6샘플 1/1/7/13/17/23개. 캐릭터 중앙중첩 남아 있어 전체 전투PASS 아님 |
| LANDMARK | primary / secondary / tertiary | 생체나무·큰늪·캠프·제단·출구 유지. 새 주요랜드마크 없음 |
| CAMERA QA | START / EARLY | [100,180]/[100,157], 실제시작칸 [100,185] 보행화면 추가 |
| CAMERA QA | ARENA / SIDE L / SIDE R | [100,120]/[49,151]/[151,136] 본편경로 |
| CAMERA QA | LANDMARK / LATE / EXIT | [102,90]/[100,48]/[100,15] 본편경로 |
| CAMERA QA | 남측 경계 | EDGE[126,176]·JOIN[121,184]·LOWER[116,190] 보행화면. MASS[129,181]은 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보전후7카메라·route교체없는 본편35카메라1280×720 및 전체맵전후. 순간이동은 종주검증과 구분 |
| TECH QA | route / collision | 현행layout 연결성검사·실제WASD 후G.map동일. 무보정전체종주 미검증 |
| TECH QA | 남측 실제 이동 | [120.5,184.5]에서 실제S650ms/W650ms, 아래로110.71월드px, 끝칸runtime G.map0·복귀·map동일. 보정없는종주와 구분 |
| TECH QA | pageerror / 404 | 후보·본편 각각0, HTTP>=400도0 |
| TECH QA | seam / loading | master/64청크 동일·224경계strip 동일, 본편62청크요청 모두cache72·visibleIds⊂drawnIds·교체0 |
| TECH QA | performance | 정적3청크교체·추가runtime draw0. 저사양GPU·NW.js·장시간FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어보존2+HTML구문1=8PASS. helper 전체재현, fullbuilder전체실행과 구분 |
| FILES | stage-owned | master·3청크·preview·source6·manifest·composition·game cache 한줄·맵docs·검수. 반영전tmp/ch1-production-pre72 백업 |
| FILES | concurrent touched | 공유game.html·CHANGELOG 최신본의 맵 관련 범위만 변경. 동시작업Git staging에는 직접쓰기 없음 |
| FILES | unrelated touched | 없음. 타작업 삭제·숨김·롤백 없음 |
| GIT | staged / commit | 72차 쓰기·커밋 수행안함. 이 세션 .git 읽기전용·exec시작 장애로 허용된Git쓰기경로 미확보. 다른에이전트의누적커밋상태와 구분 |
| GIT | source-control limit | 최종git상태·72차체크포인트 검증기록 참조. 실제런타임에셋 숨김·삭제 없음 |
| GIT | push / deploy | 이 세션72차는 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 남측 오른쪽 경계의 큰 수피판·검은 공동이 실제보행화면에서 읽힌다. 전체 건강한 식생·반복가지·주변 접합·밀집캐릭터 중첩은 추가수정 필요하다. 자동검사PASS를 전체visualPASS로 대체하지 않는다.

NEXT PASS: 남측 왼쪽의 가는가지·잔여식생을 정리하고 낮은 목질과 피부 지면의 연결을 개선한다. 넓은 시작공간·북쪽route·기존 늪버블/가스/동맥 보존.

검수: captures/ch1_outer72/index.html·runtime.json·live/runtime.json·prep.json·promotion.json·tests.log·rebake-proof.log. 체력50ms/무적하한60f 및 임시24적을 사용한 시각QA로 성능·밸런스 검증은 아니다.

보존: 72차소유파일·관련docs·검수자료를 tmp/ch1-checkpoint72-owned.zip에 묶고 엔트리SHA256을 검증한다. 공유game 전체스냅샷과 cache만 분리한검토본을 구분하며 .git 직접쓰기 없음.

---

# CH1-1 남동 뿌리의 보행 경계 접합 — 71차

70차 뿌리가 SE_EDGE 보행 화면의 오른쪽 아래에 치우쳐 있어 목질 공동과 연결부가 충분히 읽히지 않았다. 기존 원화 한 개를 경계 쪽으로 옮겼다. 원화를 추가 복제하거나 다시 생성하지 않았다. 이동 전 자리에는 pre70 백업의 같은 crop을 사용하고, 현행70 master와 실제 달라진 픽셀만 outer71 보정 레이어로 추가했다. 기존70 레이어·원화·기록은 보존한다.

| id | 계약 | 실제 값 |
|---|---|---|
| SOURCE71 | 재사용 | `outer70_sources/southeast_mass_generated.png`, 기존 Higgsfield GPT job a5a1431a-8ed6-4cb0-8f80-49ceda92bb42; 2048² RGBA 원본 유지. 신규 생성·동작 추가 없음 |
| PLACE71 | 위치·이동 | 중심 tile `[184,158]`→`[178,150]`, 월드 `[-240,-320]` 이동. master crop `[6144,5120,8192,7168]` 2048², crop offset `[625,584]`→`[379,256]`, master `[-246,-328]` 이동 |
| BLEND71 | 합성 | sprite1536²/scale.75, RGB×.70/opacity.84; 비보행 MinFilter49/GaussianBlur20, 보행 alpha 강제0, 8bit alpha 양자화 |
| PIXELS71 | 변화·보존 | 현행70 대비 1,103,760픽셀 변화. 보행0/효과mask0영역0/crop 외부0. 이전 위치에서만 원화가 있었던 543,276픽셀을 pre70 동일 자리로 복원 |
| FOOTPRINT71 | 원화 영향 영역 | 이전 686,730픽셀→재배치 560,515픽셀. 이 값은 비보행 배경의 실제 변화 영역이며 충돌 면적이 아님 |
| CHUNKS71 | 본편 PNG | `chunk_6_5.png`, `chunk_7_5.png`, `chunk_6_6.png`, `chunk_7_6.png`; core1024/bleed1/1026². 단일 master에서 clamped crop |
| CACHE71 | 로딩 | `20260928-outer-71`; legacy 비교 cache·생체 모듈61차 유지 |
| REBAKE71 | 순서·보정 | skin65→outer66→outer67→outer68→outer69→outer70→outer71. 마지막 x6144/y5120/2048² patch는 현행70 대비 실제 차이의 binary alpha0/255, 이전 위치 복원도 포함 |
| PROOF71 | 해시 | master `bd01aadf96fa5fbfd072b443ca4c347a0928da9325eb21839b5a8749a9fd4b7a`, raw RGBA `7684cc2c7eb24328cc14d5bd2d02c384303de4b7697f3bc7ebccea41152f0e32`. pre65 master+7patch의 helper 전체8192² 픽셀 동일 |
| FILES71 | 재현 | `outer71_sources/`의 crop·보정patch·binary mask·재배치alpha·prep·reuse 6파일. 원화/전체prompt는 기존 outer70_sources 참조. pre70 crop은 보정patch에 이미 포함되어 재베이크 때 백업이 필요하지 않음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE2~4 남동 외곽의 배치·접합 리터치. 앞서 전체 읽은 공통 제작 가이드1048줄이 현재도 동일함을 확인하고, 맵디테일과 현행 production SSOT를 재확인했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 기존200² 지형·구역 유지, geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 시작6시→출구12시, 상단통로·넓은 중앙공터·양쪽우회 유지 |
| OUTER MASS | LEFT / TOP | 서쪽66·북서67·북쪽68 보존 |
| OUTER MASS | RIGHT / SOUTH | 동쪽69 보존, 남동70 뿌리 한 개를 북서쪽으로 재배치해 보행 경계에서 목질 공동과 낮은 연결부를 더 읽기 쉽게 함 |
| OUTER MASS | major holes | 이동 전·후를 동시에 남기지 않아 중복 뿌리 방지. 선택 영역 밖의 건강한 식생·반복 가지는 남아 있음 |
| LARGE | source assets / composites | 기존70 투명 원화 재사용. 기존 실제 master와 pre70 같은 자리 crop으로 부분 합성 |
| LARGE | overlap / repeated silhouette | 기존70 한 개만 이동; 새 같은 실루엣 복제 없음. 높은 세로 가지 일부를 낮은 넓은 목질로 덮음 |
| MEDIUM | connections / remaining holes | 목질 공동→갈라진 수피→검붉은 힘줄→낮은 뿌리. 기존 숲의 반복 가지와 접합은 추가 수정 필요 |
| GROUND | shadow / contamination | 기존 원화 하부 그림자·국소 괴사조직 유지. 보행 바닥 새 오염 없음 |
| GROUND | structure integration | 비보행 feather·실제 지형 보호. 이전 위치 복원과 새 자리 합성을 한 개 보정 레이어로 기록 |
| PLAYABLE | main arenas / travel space | 중앙공터·동측우회·늪 접근 유지, 후보 전후 및 일반 본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행 픽셀 변화0. 충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존 AI 임시24적 추가; 적탄6샘플 1/3/8/11/17/26개. 중앙 캐릭터 중첩은 남아 있어 전체 전투 PASS 아님 |
| LANDMARK | primary / secondary / tertiary | 생체나무·큰늪·캠프·제단·출구 유지, 새 주요 랜드마크 없음 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]` 일반 production 경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]` |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]` |
| CAMERA QA | 남동 경계 | EDGE `[170,151]`, JOIN `[169,154]`, NORTH `[171,141]`, SOUTH `[157,158]`는 현행 grid의 보행 칸. MASS `[178,150]`는 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보 전후7카메라, route 교체 없는 일반 본편30카메라1280×720 및 전체맵 전후. 순간이동을 무보정 종주 증거로 해석하지 않음 |
| TECH QA | route / collision | 기존 layout 연결성 검사 통과, 실제 WASD 후 G.map 동일. 무보정 전체 종주 미검증 |
| TECH QA | 남동 실제 이동 | 보행 `[169.5,151.5]`에서 실제 S650ms/W650ms 입력. 아래로 109.42월드px 이동, 끝칸 runtime G.map0·원위치 근처 복귀·G.map 동일. 전체 무보정 종주와 구분 |
| TECH QA | pageerror / 404 | 후보·일반 본편 관찰 각0, HTTP>=400도0 |
| TECH QA | seam / loading | 전체64청크 픽셀 동일·224경계 strip 동일. 본편62청크 요청 모두 cache71, visibleIds 모두 drawnIds 포함·route 교체0 |
| TECH QA | performance | 정적4청크 교체, 추가 runtime draw0. 저사양GPU·NW.js·장시간FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어보존2+HTML구문1=8PASS/0FAIL. helper 전체 재현, fullbuilder 전체 실행과 구분 |
| FILES | stage-owned | master·4청크·preview·source6·manifest·composition·game cache 한 줄·맵docs·검수자료·터미널 대체 가이드의 읽기 성공 기록. 반영 전 `tmp/ch1-production-pre71` 백업 |
| FILES | concurrent touched | 공유 game.html·CHANGELOG·대체 작업 가이드의 최신본에서 관련 범위만 변경. 타 UI·스킬·캐릭터 작업과 staging 유지 |
| FILES | unrelated touched | 없음. 타 작업 파일 삭제·숨김·강제 정리 없음 |
| GIT | staged / commit | 맵 전용 체크포인트 준비. 시스템 PowerShell 숨김 읽기는 성공; exec는 WindowsApps pwsh 시작 전 OS317로 실패. 허용된 Git 쓰기 실행 경로 미확보·커밋 미완료. 이전 승인된 실행도 시작 전 같은 오류였음 |
| GIT | source-control limit | Changes100개 이상, 제한 미충족. 실제 코드·에셋을 숨기거나 삭제해 개수만 줄이지 않음 |
| GIT | push / deploy | 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 재배치된 목질 공동·뿌리 연결이 보행 경계 카메라에서 더 넓게 보인다. 건강한 식생·반복 가지·전체 접합·밀집 전투 중첩은 추가 수정이 필요하다. 자동검사 PASS를 전체 visual PASS로 대체하지 않는다.

NEXT PASS: 남측 시작 주변의 반복 가지와 건강한 식생을 정리하며 낮은 부패 목질과 지면 접합을 이어서 다듬는다. 넓은 시작·전투 공간·늪·남북 route를 보존한다.

검수: `captures/ch1_outer71/index.html`, runtime.json, live/runtime.json, prep.json, promotion.json, preaudit.json, tests.log, rebake-proof.log. 체력50ms/무적하한60f·임시24적 시각QA로 밸런스 검증은 아니다. 정적 원화 재배치이며 기존 늪가스·버블·동맥 동작을 유지한다.

보존: `tmp/ch1-checkpoint71-owned.zip`에 맵 소유 파일·격리HTML/CHANGELOG·타 staging 보존 index HTML·검수자료를 묶어 각 엔트리 SHA256을 검증한다. 실행 가드는 HEAD·index·소유 파일의 변경 시 중단한다.


---

# CH1-1 남동쪽 무너진 뿌리 외곽 — 70차

남동쪽 비보행 외곽의 반복 줄기 일부에 낮게 무너진 뿌리 질량을 합성했다. 큰 수피판·검은 공동·갈라진 목질과 검붉은 힘줄이 이어지며, 69차의 기울어진 큰 몸통과 구별되는 낮고 넓은 형태다. 기존 전체 master를 보존한 부분 합성이다. 신규 원화는 정적 배경이며 큰늪의 기존 가스·버블 동작은 유지한다.

| id | 계약 | 실제 값 |
|---|---|---|
| SOURCE70 | 생성 | Higgsfield GPT `gpt_image_2_5`, job `a5a1431a-8ed6-4cb0-8f80-49ceda92bb42`; 1:1/2k/high/transparent 요청, 실제 2048² RGBA, alpha0..254, alpha0픽셀2,867,837 |
| PLACE70 | master 배치 | crop `[6144,5120,8192,7168]` 2048², 중심 tile `[184,158]`, sprite2048²→1536²(scale.75), crop offset `[625,584]`; RGB×.70/opacity.84 |
| MASK70 | 바닥 보호 | 현행 layout.js의 200² grid와 보호 grid 전체 일치; 비보행 마스크 MinFilter49/GaussianBlur20, 보행 alpha 강제0, 8bit alpha 양자화 |
| PIXELS70 | 변화 | 686,730픽셀; 보행0/alpha0영역0/crop 밖0. 원화 가장자리의 투명 영역은 기존 그림 유지 |
| CHUNKS70 | 본편 반영 | `chunk_7_5.png`, `chunk_6_6.png`, `chunk_7_6.png`; core1024/bleed1/1026², 전체 master에서 clamped crop |
| CACHE70 | 로더 | `20260928-outer-70`; legacy 비교 cache 및 생체 모듈61차 유지 |
| REBAKE70 | 레이어 | skin65→outer66→outer67→outer68→outer69→outer70. 마지막 patch x6144/y5120/2048², preblended RGB+binary alpha0/255 |
| PROOF70 | 해시 | master `807da1d785853f8cb59b440c3b291615b354fd8c8d0e91b0ac463cc9d7954f86`, raw RGBA `ad0736fca5dfc05aaf6b86b2f61fffc849e27b401955efda1b895d37c8d09f3a`; 65차 이전 master+6patch를 helper에 통과시킨 전체8192² 픽셀 동일 |
| FILES70 | 재현 | `assets/map/ch1/production_finish/outer70_sources/`의 원화·crop·patch·mask·prep·전체prompt/생성정보 6파일. 원화 자체는 참조 입력 없이 생성한 standalone 레이어이며, 실제 기존 master에 로컬 보호 합성 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0, GATE2 LARGE OUTER MASS의 남동 부분 리터치. 공통 제작 가이드 전체→맵디테일→production SSOT 순서로 확인했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행 200² 지형·구역 보존. geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 시작6시→출구12시, 상단 통로·양쪽 우회·POI 연결성 유지 |
| OUTER MASS | LEFT / RIGHT | 서쪽66·북서67 보존, 동쪽69 아래 남동 비보행 질량 일부에 낮은 부패 뿌리 추가 |
| OUTER MASS | TOP / SOUTH | 북쪽68·시작 부근 보존. 이번 south 작업은 남동 외곽 부분에 한정 |
| OUTER MASS | major holes | 선택 영역의 일부 빈 암부를 목질 공동·겹친 뿌리로 연결. 전체 외곽의 건강한 식생·반복 줄기는 남아 있음 |
| LARGE | source assets / composites | Higgsfield GPT 단일 투명 원화, 기존 base 위 부분 합성. 새 small scatter 없음 |
| LARGE | overlap / repeated silhouette | 높고 기울어진69차 몸통과 낮고 넓은70차 뿌리 형태를 구분. 보행 바닥은 합성 대상 제외 |
| MEDIUM | connections / remaining holes | 수피판→심재 공동→지면 뿌리·국소 힘줄 연결. 위쪽 녹색 식생과 기존 세로 가지 연결은 추가 리터치 필요 |
| GROUND | shadow / contamination | 원화 하부 그림자·국소 괴사조직, 비보행 경계 feather. 새 보행 오염 없음 |
| GROUND | structure integration | 피부65·기존 동맥·큰늪·base 보존. crop 외부 픽셀 변화0 |
| PLAYABLE | main arenas / travel space | 중앙 공터·동측 우회·상단 route 유지. 후보 전후 및 일반 본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행 픽셀 변화0. 새 충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존 AI 임시24적을 추가해 기존 적과 함께 관찰. 적탄6샘플 2/4/10/18/23/27개; 중앙 캐릭터 겹침은 남아 있어 전체 전투 PASS 아님 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·캠프·제단·출구 유지, 새 뿌리는 외곽 배경 계층 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]` 일반 production 경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]` |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]` |
| CAMERA QA | 남동 접근 | EDGE `[170,151]` / NORTH `[171,141]` / SOUTH `[157,158]` 모두 현행 grid의 보행 칸. MASS `[184,158]`는 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보 전후6카메라, route 교체 없는 일반 본편29카메라1280×720, 전체맵 전후. 순간이동을 무보정 종주 증거로 해석하지 않음 |
| TECH QA | route / collision | 기존 layout 연결성 검사 통과, 실제 WASD 입력 후 G.map 동일. 무보정 전체 종주 미검증 |
| TECH QA | pageerror / 404 | 후보·일반 본편 관찰 각0, HTTP>=400도0 |
| TECH QA | seam / loading | master/전체64청크 픽셀 동일·224경계 strip 동일. 일반 본편62청크 요청 모두 cache70, 모든 visibleIds drawnIds 포함, route 교체0 |
| TECH QA | performance | 정적3청크 교체. 저사양GPU·NW.js·장시간FPS 미검증, 성능 개선 주장 없음 |
| TECH QA | regression / rebake | 지형5+레이어보존2+HTML구문1=8PASS/0FAIL. helper 전체 픽셀 재현 확인, fullbuilder 전체 실행과 구분 |
| FILES | stage-owned | master·3청크·preview·source6·manifest·composition·game cache 한 줄·관련 맵docs·검수자료. 반영 전 `tmp/ch1-production-pre70` 백업 |
| FILES | concurrent touched | 공유 game.html·CHANGELOG은 최신본을 읽고 맵 범위만 변경. 타 UI·스킬·보스 작업과 staging 보존 |
| FILES | unrelated touched | 없음. 타 작업 삭제·숨김·강제 정리 없음 |
| GIT | staged / commit | 맵 전용 격리 체크포인트 준비. exec PowerShell 시작 전 OS317로 실패, 커밋 미완료. 타 작업 staging 보존 |
| GIT | source-control limit | Changes100개 이상, 제한 미충족. 실제 코드·에셋을 숨기거나 삭제해 개수만 줄이지 않음 |
| GIT | push / deploy | 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 남동 낮은 부패 뿌리와 목질 공동은 본편에서 확인했다. 남아 있는 건강한 식생·반복 줄기·전체 접합과 밀집 전투 캐릭터 중첩을 추가 수정해야 한다. 자동검사 PASS는 전체 visual PASS가 아니다.

NEXT PASS: 남측 외곽의 반복 가지와 건강한 식생을 정리하고, 낮은 뿌리 질량의 접합을 이어서 다듬는다. 시작부·넓은 전투 공간·늪·남북 route를 보존한다.

검수: `captures/ch1_outer70/index.html`, runtime.json, live/runtime.json, prep.json, promotion.json, preaudit.json, rebake-proof.log, tests.log. 체력50ms/무적하한60f·임시24적을 사용한 시각 QA이며 밸런스 검증은 아니다. 새 원화의 움직임은 추가하지 않았다.

체크포인트: `tmp/ch1-checkpoint70-owned.zip`. 맵 소유 파일·맵 변경만 적용한 commit HTML/CHANGELOG·타 staging을 보존할 index HTML·검수자료를 묶어 각 엔트리 SHA256을 검증한다. 실제 커밋 실행 시 HEAD·index·소유 파일 변경을 가드한다.


---

# CH1-1 동쪽 기울어진 고목 외곽 — 69차

동쪽 비보행 외곽의 반복 줄기 일부를 갈라진 큰 수피판, 검은 심재 공동, 틈 안의 둔한 힘줄, 낮은 부채꼴 뿌리로 부분 교체했다. 북쪽 수평 통나무와 다른 대각선 실루엣을 사용했다. 단일 master를 먼저 합성하고 실제 달라진 3청크만 반영했다. 새 원화는 정적 배경이다.

| id | 적용 위치·계약 | 실제 값 |
|---|---|---|
| SOURCE69 | Higgsfield 원화 | `gpt_image_2_5`, job `461ba944-d5ea-448d-8eb5-37a87dc366cb`; 요청 2k/1:1/high/transparent, 실제 2048² RGBA, native alpha0..254 |
| PLACE69 | master crop·배치 | `[6144,3072,8192,5120]` = 2048²; 중심 tile `[180,100]`; sprite2048²→1536²(scale.75); crop 내 offset `[461,256]`; RGB×.70, opacity.84 |
| MASK69 | 보호·접지 | 현행 layout.js의 200² grid와 마스크 grid 전체 일치. MinFilter49/GaussianBlur20, 보행 alpha 강제0, 8bit alpha 양자화 |
| PIXELS69 | 실제 변화 | 801,475픽셀; 보행 픽셀0, alpha0 픽셀0, crop 외부0. preblended RGB+binary alpha0/255 patch |
| CHUNK69 | 본편 PNG | `chunk_7_3.png`, `chunk_6_4.png`, `chunk_7_4.png`; core1024/bleed1/파일1026² |
| VERSION69 | 로더 | production cache `20260928-outer-69`; 비교 경로 cache·생체 모듈61차 유지 |
| REBAKE69 | 보존 순서 | skin65→outer66→outer67→outer68→outer69; 마지막 patch x6144/y3072/width2048/height2048. 65차 이전 master+현행5patch를 helper에 통과시킨 8192² 전체 픽셀 동일 |
| PROOF69 | master SHA256 | `730e21b31b6c5fe1bf61197e0430cc48ff9e542f6d4e7456f64b66db23ccde27`; raw RGBA SHA256 `7864fcb0f513438597cab0abea1c3a03b1e5db449c9bf604695a360749448881` |
| SOURCEFILES69 | 재현 자료 | assets/map/ch1/production_finish/outer69_sources/의 원화·crop·patch·mask·prep·전체 prompt/생성 정보6파일 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0. GATE2 LARGE OUTER MASS의 동쪽 부분 리터치. 공통 제작 가이드 전체→맵디테일→현행 production SSOT를 먼저 읽었다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 200² 기존 실루엣·구역 유지. geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 6시 시작→12시 출구, 양쪽 우회·POI 연결성 유지 |
| OUTER MASS | LEFT | 66차 서쪽 고목·67차 북서쪽 죽은 숲 보존 |
| OUTER MASS | RIGHT | `[180,100]` 주변에 기울어진 속빈 고목·낮은 뿌리를 연결. 원화의 주요 높이 질량은 비보행 오른쪽에 배치 |
| OUTER MASS | TOP / SOUTH | 68차 북쪽 수평 고목과 시작 주변 보존 |
| OUTER MASS | major holes | 선택 구역의 검은 빈 부분을 심재 공동·뿌리 연결로 정리. 전체 동쪽·남동쪽 외곽 통합은 미완료 |
| LARGE | source assets / composites | Higgsfield GPT 단일 투명 원화. 기존 base에 부분 합성, small scatter 추가 없음 |
| LARGE | overlap / repeated silhouette | 대각선 몸통으로 기존 수직 줄기 반복을 끊고 북쪽 수평 실루엣과 구분. 보행 floor는 합성 대상에서 제외 |
| MEDIUM | connections / remaining holes | 갈라진 수피판→검은 심재→낮은 부채꼴 뿌리. 선택 구역 밖의 반복 나무·건강한 식생은 후속 대상 |
| GROUND | shadow / contamination | 하부 그림자·국소 부패 조직, 좁은 feather 접지. 보행 바닥 새 오염 없음 |
| GROUND | structure integration | 기존 피부·동맥·큰 늪·원본 base 보존. crop 밖 픽셀 변화0 |
| PLAYABLE | main arenas / travel space | 중앙 전투 공터·동측 우회·출구 통로 유지. 후보 전후 및 본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행 픽셀 변화0. 새 충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존 AI로 임시24적을 추가해 기존 적과 함께 검수. 적탄6샘플 2/4/13/20/25/28개. 중앙 캐릭터 겹침은 남아 있어 전체 전투 가독성 PASS로 단정하지 않음 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·캠프·제단·출구 유지. 새 고목은 외곽 배경 계층 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]`, 일반 production 경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]` |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]` |
| CAMERA QA | 동쪽 접근 | EDGE `[172,99]`, NORTH `[164,82]`, SOUTH `[161,108]`은 현행 grid의 보행 칸. MASS `[180,100]`은 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보 전후6카메라, 교체 없는 본편25카메라1280×720, 전체맵 전후 비교. 순간이동 카메라를 무보정 종주 증거로 해석하지 않음 |
| TECH QA | route / collision | 기존 layout 연결성 검사 통과, geometry 변경0. 실제 입력 후 G.map 동일 |
| TECH QA | pageerror / 404 | 후보·본편 각0; HTTP>=400도0 |
| TECH QA | seam / loading | master/64청크 전체 픽셀 동일, 경계224 strip 동일. 본편60청크 요청 모두 cache69, 모든 visibleIds가 drawnIds에 포함, route 교체0 |
| TECH QA | performance | 정적 3청크 교체. 저사양GPU·NW.js·장시간FPS·무보정 종주 미검증; 성능 개선 주장 없음 |
| TECH QA | regression / rebake | 지형5+재베이크 보존2+HTML구문1=8PASS/0FAIL. helper 전체 픽셀 재현 확인; fullbuilder 전체 실행과 구분 |
| FILES | stage-owned | master·3청크·preview·source6·manifest·composition·game cache 한 줄·맵 docs·검수 자료. tmp/ch1-production-pre69에 반영 전 백업 |
| FILES | concurrent touched | 공유 game.html·CHANGELOG은 즉시 읽고 맵 범위만 수정. UI·인벤토리·스킬·보스 등 타 작업과 staging 보존 |
| FILES | unrelated touched | 없음. 타 작업 파일 삭제·숨김·강제 정리 없음 |
| GIT | staged / commit | 맵 전용 격리 체크포인트 준비. 이번 턴에도 exec가 PowerShell 시작 전 OS317로 실패해 정상 Git 쓰기 실행 경로 미확보, 커밋 미완료. 타 작업 staging 유지 |
| GIT | source-control limit | Changes는 100개 이상. 실제 코드·런타임 에셋을 숨기거나 삭제하지 않으며, 제한 미충족을 기록 |
| GIT | push / deploy | 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 동쪽 대각선 목질과 접지는 본편에서 확인했다. 선택 영역 밖의 건강한 식생·반복 줄기, 전체 외곽 통합, 밀집 전투의 캐릭터 겹침은 남아 있다. 자동검사 PASS로 전체 visual PASS를 대체하지 않는다.

NEXT PASS: 남동쪽 비보행 외곽의 큰 뿌리 질량과 내부 숲 깊이를 정리하고, 동측 전투 공간·독 늪·남북 route를 유지한다.

검수 파일: captures/ch1_outer69/index.html, REPORT.md, runtime.json, live/runtime.json, prep.json, promotion.json, preaudit.json, rebake-proof.log, tests.log. 체력50ms/무적하한60f와 임시24적을 사용한 시각 검수이며 밸런스 검증이 아니다. 이번 원화에 새 생체 움직임은 추가하지 않았다.

보존 체크포인트: tmp/ch1-checkpoint69-owned.zip. 맵 소유 파일과 맵 변경만 적용한 commit HTML/변경 로그, 타 작업 staging을 보존할 index HTML, 검수 자료를 묶어 엔트리 SHA256을 대조한다. 실행 가드는 HEAD·실제 index·소유 파일 해시를 재검사하고 변경 시 커밋 전에 중단한다.


---

# CH1-1 북쪽 쓰러진 고목 외곽 — 68차

북쪽 비보행 외곽에 큰 수평 속빈 고목과 낮은 뿌리 질량을 연결했다. 단일 master를 합성한 뒤 64청크를 clamped sampling으로 도출했고, 실제 달라진 6청크만 본편에 반영했다. 이번 원화는 정적 배경이며 새 애니메이션을 추가하지 않았다.

| id | 적용 위치·계약 | 정확한 값 |
|---|---|---|
| SOURCE68 | Higgsfield 원화 | `gpt_image_2_5`, job `ef33d5b1-192d-48d4-a7da-1500e3872fdf`; 요청2k/1:1/high/transparent, 실제2048²RGBA, native alpha0..254 |
| PLACE68 | master crop·배치 | `[1024,0,3072,2048]` = 2048²; 중심tile `[60,24]`; sprite2048²→1536²(scale.75); crop내offset `[666,215]`; RGB×.70, opacity.82 |
| MASK68 | 보행 보호·접지 | 현행 `layout.js`의200²grid와 마스크grid 전체 일치; MinFilter49/GaussianBlur20; 보행alpha 강제0, 8bit alpha양자화 |
| PIXELS68 | 실제 변화 | 568,682픽셀; 보행픽셀0, alpha0픽셀0, crop외부0. 최종patch는 preblended RGB+binaryalpha0/255 |
| CHUNK68 | 본편 PNG | `chunk_1_0`, `chunk_2_0`, `chunk_3_0`, `chunk_1_1`, `chunk_2_1`, `chunk_3_1`; core1024/bleed1/파일1026² |
| VERSION68 | 로더 | production cache `20260928-outer-68`; 비교경로cache와생체모듈61차 유지 |
| REBAKE68 | 보존 순서 | skin65→outer66→outer67→outer68; 마지막patch 좌표x1024/y0/width2048/height2048. 65차 이전master+현행4patch를 실제helper에 통과시킨8192²전체픽셀 동일 |
| PROOF68 | master SHA256 | `f2930397c019cfb49db74f369ce6c612674bca1c9ea2c83d569a2437bcf57171`; rawRGBA SHA256 `d93d7d181e2c0aa74fc66b9e8535bc7fcfce538e0842cca77837f5faa863c46a` |
| SOURCEFILES68 | 재현 자료 | `assets/map/ch1/production_finish/outer68_sources/`에원화·crop·patch·mask·prep·전체prompt/생성정보6파일 |
| CORRECTION67 | 이전기록정정 | 67차실제1024²→1536²(scale1.5). generated/cutout은동일승인cutout사본. 67차master와64청크전부동일; 이전불일치는검사기core/bleed좌표오류. 이미유효한67차pixels는복구대상으로삼지않음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0. GATE2 LARGE OUTER MASS의북쪽부분리터치. 공통제작가이드·맵디테일·SSOT를선행참조했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 200²기존실루엣·구역보존. geometry·collision변경없음 |
| MASTER | main route / side spaces | 6시시작→12시출구와양쪽우회공간보존. 연결성회귀통과 |
| OUTER MASS | LEFT | 66차서쪽고목·67차북서쪽죽은숲유지 |
| OUTER MASS | RIGHT | 기존상태유지; 건강한식생·반복목질정리후속대상 |
| OUTER MASS | TOP | `[60,24]`주변에큰쓰러진고목1개와검은심재공동·낮은뿌리접지. 플레이공간은마스크보호 |
| OUTER MASS | SOUTH / major holes | 시작주변유지. 전체외곽통합과남은녹색식생은미완료 |
| LARGE | source assets / composites | Higgsfield GPT단일투명원화. 기존base부분합성; 독립prop추가없음 |
| LARGE | overlap / repeated silhouette | 허용된비보행외곽에만접속. 수직줄기반복을큰수평속빈목질로끊음 |
| MEDIUM | connections / remaining holes | 검은심재→큰수피판→낮은뿌리연결. 전체북·동쪽의큰질량통합은후속대상 |
| GROUND | shadow / contamination | 원화하부그림자·부패심재, 좁은feather접지. 보행바닥새오염없음 |
| GROUND | structure integration | 65차피부·동맥·독늪과원본base유지. 채널/길차단없음 |
| PLAYABLE | main arenas / travel space | 전투공터·출구통로·기존POI연결성보존. `G.map`전후동일true |
| PLAYABLE | breathing space / threat space | 중앙공터와이동공간픽셀변경0. 새적·밸런스·어택티켓없음 |
| PLAYABLE | combat readability | 기존AI를사용한임시24적·기존적혼합촬영. 적탄6샘플0/0/8/12/19/21개; 중앙캐릭터겹침은남아있어전체가독성PASS로단정하지않음 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·캠프·제단·출구유지. 새고목은외곽배경계층 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]`, 일반production경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]`, 기존바닥·전투공간확인 |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]`, 일반production경로 |
| CAMERA QA | 추가북쪽·전후 | 후보6카메라전후, 본편21카메라1280×720. NORTH_MASS는비보행원화관찰용순간이동이며실제종주증거가아님 |
| TECH QA | route / collision | 기존layout연결성5회귀중해당검사통과; geometry변경없음. 게임`G.map`와실제입력후map동일 |
| TECH QA | pageerror / 404 | 후보·본편각0; HTTP>=400도0 |
| TECH QA | seam / loading | master와64청크전부픽셀동일,224경계strip동일. 본편54청크요청모두cache68,visibleIds전부drawnIds포함,route교체0 |
| TECH QA | performance | 정적6청크교체. 저사양GPU·NW.js·장시간FPS·무보정종주미검증; 속도개선주장없음 |
| TECH QA | regression / rebake | 지형5+재베이크보존2+HTML구문1=8PASS/0FAIL. helper전체픽셀재현확인; fullbuilder전체실행과는구분 |
| FILES | stage-owned | master·6청크·preview·source6·manifest·composition·gamecache한줄·맵docs·검수자료. `tmp/ch1-production-pre68`반영전백업 |
| FILES | concurrent touched | 공유game.html·CHANGELOG은즉시읽고맵범위만수정. 기존UI/인벤토리작업·staging유지 |
| FILES | unrelated touched | 없음. 타작업수정·삭제·강제정리없음 |
| GIT | staged / commit | 맵 전용 격리 체크포인트 준비. 권한 승인 후 exec 실행기가 PowerShell 시작 전 OS317로 실패하여 커밋 미완료. 타 작업 staging 보존. Changes 209개로 100개 미만 제한은 미충족; 임의 삭제·숨김·강제 커밋하지 않음 |
| GIT | push / deploy | 수행하지않음 |

**VISUAL VERDICT: RETOUCH** — 북쪽수평고목과접지는본편에서확인했다. 전체외곽에는건강한식생·반복실루엣이남아있고밀집전투의캐릭터겹침도유지된다. 자동검사PASS로전체visualPASS를대체하지않는다.

NEXT PASS: 동쪽큰외곽질량을낮은부패목질과검은숲깊이로부분교체하고, 양쪽전투공간·남북route를유지한다.

검수파일: `captures/ch1_outer68/index.html`, `runtime.json`, `live/runtime.json`, `prep.json`, `promotion.json`, `preaudit.json`, `rebake-proof.log`, `tests.log`. 본편기록은체력50ms/무적하한60f보정·임시24적을사용한시각검수이며밸런스검증이아니다.

보존 체크포인트: `tmp/ch1-checkpoint68-owned.zip`. 맵 소유 파일 116개, 맵 변경만 적용한 commit HTML/변경 로그, 타 작업 staging을 보존할 index HTML, 검수 자료를 묶었다. ZIP의 모든 엔트리는 원본 SHA256과 대조했다. 실행 가드가 HEAD·실제 index·소유 파일 해시를 다시 검사하므로 다른 에이전트가 후속 변경을 했다면 재검토 전 커밋을 중단한다. 격리 HTML의 실행 가능한 inline script 4개씩도 구문 검사했다.


---

# CH1-1 북서쪽 죽은 숲 외곽 — 67차

66차 서쪽 고목을 보존한 채 북서쪽 비보행 수풀 띠를 속 빈 죽은 목질과 검은 내부 숲 질량으로 부분 교체했다. 중앙 전투 바닥·충돌·진행은 바꾸지 않았다.

| id | 항목 | 값 |
|---|---|---|
| SOURCE67 | 원화 | Higgsfield `gpt_image_2_5`, job `3bafa672-c310-4c12-974e-e94aaef66a84`, 실제 1024². 생성본의 체크무늬 배경 픽셀을 검수에서 발견해 production에 사용하지 않음 |
| CUTOUT67 | 배경 제거 | Higgsfield `image_background_remover`, job `74074919-4563-4c2f-a331-923ad7ea9b11`; cutout만 합성에 사용 |
| PLACE67 | 합성 | master crop `[0,1024,3072,3072]`, 중심 tile `[20,55]`, 원화 1024²→1536²(scale1.5), RGB×.66/opacity .78 |
| MASK67 | 보호 | `layout.js` 200² 보행 grid, MinFilter49/GaussianBlur20. 보행 픽셀·alpha0 픽셀 변화 0 |
| CHUNK67 | 본편 | 실제 변경 4청크: `x0..1/y1..2`; 후보 16청크 중 나머지 12개는 기존과 픽셀 동일. core1024/bleed1/1026², 224 strip 검사 PASS |
| VERSION67 | 로더 | production cache `20260928-outer-67`; 기존 비교 cache와 생체 모듈61차 유지 |
| SOURCEFILES67 | 보존 | `assets/map/ch1/production_finish/outer67_sources/`의 generated와 generated_cutout은 동일한 승인 cutout 사본. 최초 체크무늬 원화는 폐기; crop·patch·mask·prep·generation 보존 |
| REBAKE67 | 계약 | `retouch-layers.json`의 skin65→outer66→outer67 순서. 68차 사전검수에서 67차 master와 64청크 전체 픽셀 동일 확인. 과거 불일치 기록은 검사기의 core/bleed 좌표 오류로 정정 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE2 LARGE OUTER MASS의 북서쪽 부분 리터치.

| 구분 | 결과 |
|---|---|
| MASTER | 200², 6시 시작·12시 출구·넓은 전투 공터와 주/보조 경로 보존 |
| OUTER MASS | 북서쪽 건강한 잎·반복 고목 일부를 어두운 속 빈 목질/내부 숲 질량으로 교체. LEFT의 66차 고목과 역할 분리 |
| LARGE / MEDIUM | 배경 숲 깊이→불균일한 갈라진 목질→낮은 뿌리 전이. 새 중심 랜드마크·small scatter 없음 |
| GROUND | 비보행 경계에서만 낮은 뿌리 접지. 보행 바닥·피부·동맥·독 늪은 그대로 |
| PLAYABLE | 보행 픽셀 변경0, 충돌/route 변경0. 기존 밀집 전투의 player·enemy·projectile·parry 가독성 확인 |
| LANDMARK | 생체나무/늪/캠프/제단 유지. 새 질량은 외곽 back/mid 계층 |
| CAMERA QA | 후보 전후 5카메라, 본편 일반 경로 17카메라 1280×720. NW 질량, 접근, 출구 접근, 전투 공터, 시작점 포함 |
| TECH QA | `G.map` 동일true, pageerror0/HTTP>=400 0, visibleIds=drawnIds, 224 seam strip PASS, 본편 요청은 cache `20260928-outer-67` |
| TESTS | 지형5+재베이크2+HTML1 = 8 PASS/0 FAIL |
| FILES | master/4청크/outer67 source7/manifest/composition/game cache/documentation; tmp/ch1-production-pre67 백업 |
| GIT | 다른 작업 staging 보존. 별도 커밋은 실행기 PowerShell 317 오류로 아직 미완료 |

**VISUAL VERDICT: RETOUCH** — 북서쪽 큰 질량은 개선됐지만, 남은 외곽의 녹색 식생·반복 목질과 전체 지도 통합은 후속 패스 대상이다.

NEXT PASS: 북쪽/동쪽 외곽의 건강한 식생을 큰 질량 단위로 바꾸되, 전투 중앙과 남북 진행 통로는 유지한다.

본편 일반 경로: 17카메라·실제 입력·임시24적, route 교체0, `G.map` 동일true, pageerror0/HTTP>=400 0, 모든 청크 `20260928-outer-67`. master SHA256 `4467b7ddca4094ca1f4865bc24fa1519106b3093d500404a109b49be0d6be456`.


---

> 2026-09-28 67차 기록(68차 이전): 북서쪽 비보행 외곽의 건강한 수풀 띠를 죽은 속빈 목질·내부 숲 질량으로 부분반영(master/4청크 x0..1/y1..2). production cache `20260928-outer-67`; 보행pixels 변경0, 65차 피부·66차 서쪽 고목·생체모듈61차 보존. 생성본의 체크무늬 배경은 폐기하고 background-remover cutout만 사용. 전체 VISUAL VERDICT RETOUCH.

# CH1-1 서쪽 썩은 고목 외곽 — 66차

65차 피부 지면을 보존하고 서쪽 비보행 외곽에 큰 썩은 고목·쓰러진 통나무·뿌리 질량을 부분 반영한다. 배경 cache는20260928-outer-66, 생체모듈61차 유지. 새로운 고목은 정지 원화다.

| id | 항목 | 구현 값 |
|---|---|---|
| SOURCE66 | 생성 | Higgsfield gpt_image_2_5/job d7e3db21-1e68-4a14-92c4-8b1b71101926,2k/1:1/high/transparent;실제2048²RGBA;로컬참조 업로드 사용 안 함 |
| PLACE66 | 합성 | sourceCrop[0,3072,2048,5120],중심tile[18.5,98],원화2048²→1536²(scale.75),RGB×.70/opacity.85 |
| MASK66 | 보호 | layout.js 200² 보행grid로 forest mask;MinFilter49/GaussianBlur20,walkable alpha=0;alpha 8bit양자화.변경929908pixels;보행/zero-mask 변경0 |
| CHUNK66 | 배경 | master8192²→world8000²/T40/source40.96px/tile;core1024/bleed1/1026²;실제4청크x0..1/y3..4만교체,나머지60보존.후보12중8pixel동일 |
| REBAKE66 | 보존 | retouch-layers.json:skin65[2007,2867,3440,4382] 다음outer66[0,3072,2048,2048].이미블렌딩된RGB+binaryalpha0/255만허용;범위/규격/partialalpha불일치시throw |
| BUILDER66 | 적용 | tools/ch1-production-retouch.mjs의applyRetouchLayers→master저장→청크분할.생성순서고정;composition.json bakeVersion/retouchLayers동기화 |
| PROOF66 | 재현 | pre65원본+skin65+outer66→현재master8192²RGBA전체픽셀동일true;rawSHA256 f4af6f472ad796d457087fad1d8394a580368880845b310d84373611ce58e5b5.전체builder실행은미실시 |
| VERSION66 | 로더 | production분기20260928-outer-66;기존outer비교20260917-depth-2/diablo20260924-blockout-2유지.신규runtime draw/이미지로드없음 |
| SOURCEFILES66 | 자료 | production_finish/outer66_sources:generated/crop/patch/mask/prep/generation 6파일;skin65_sources/skin65_patch.png 추가보존자료 |
| MOTION66 | 동작 | 기존가스·버블·동맥움직임유지.새고목/피부의전체맥동미구현 |
| RECOVERY66 | 준비 오류 | Python composition.json 기본cp949읽기실패로메타데이터완료부만중단;UTF-8읽기로완료.아트중복반영없음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. LARGE OUTER MASS→GROUND CONNECTION 부분 리터치.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 200²/8지역/53점경계/6시시작·12시출구/양쪽진행·전투공터보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | LEFT서쪽부분고목덩어리강화.나머지외곽원본유지;건강한식생/반복목질잔여 |
| LARGE — source assets / composites / overlap / repeated silhouette | 큰빈고목·불균일높이부러진줄기·쓰러진통나무·뿌리연결.원본베이스보존하며마스크합성;작은장식scatter없음 |
| MEDIUM — connections / remaining holes | 새고목의낮은뿌리→기존서쪽목질연결.전체서쪽/북쪽교체는잔여 |
| GROUND — shadow / contamination / structure integration | .70RGB/저대비회갈색;비보행외곽만반영.기존65피부/보행지면보존 |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 새장애물/충돌없음.기존공터·캠프진행보존;밀집전투중앙겹침잔여 |
| LANDMARK — primary / secondary / tertiary | 생체나무/캠프/늪/제단/아치보존;고목은주변질량 |
| CAMERA QA | 1280×720/전후17카메라;같은game snapshot.배경비교전후map동일;적·이펙트시간차존재 |
| TECH QA — route / collision | G.map전후동일true;입력/임시전투후동일.보행pixels변경0;전구간종주미실시 |
| TECH QA — pageerror / 404 / seam / loading / performance | 비교pageerror0/HTTP오류0;64청크1026²/224stripPASS;17카메라visibleIds=drawnIds.성능/NW.js미검증 |
| TESTS | 재베이크2+지형5+HTML1=8PASS/0FAIL;새보존검사는FAIL확인후구현 |
| FILES — stage-owned | master/4청크/outer66_sources6/skin65patch/retouchmanifest/composition/builder/helper/test/gamecache1분기/관련docs |
| FILES — concurrent touched / unrelated touched | 공유game.html/CHANGELOG_SYNC최신내용에좁은수정;타작업staging보존.무관파일수정없음 |
| GIT — staged / commit / push / deploy | 별도완료증거기록.외부push/deploy없음.수정전master/청크/메타데이터/main은tmp/ch1-production-pre66에backup |

| CAMERA | tile |
|---|---|
| START | [100,180] |
| EARLY | [100,157] |
| ROOT_BEND | [83,125] |
| ARENA | [100,120] |
| FORECOURT | [100,113] |
| TREE_WEST | [82,96] |
| TREE_SOUTH | [102,109] |
| WEST_EDGE | [68,100] |
| WEST_JOIN | [72,117] |
| OUTER_WEST | [35,96] |
| CAMP_EDGE | [45,106] |
| LOW_WEST | [39,114] |
| SIDE_L | [49,151] |
| SIDE_R | [151,136] |
| LANDMARK | [102,90] |
| LATE | [100,48] |
| EXIT | [100,15] |

실제입력WASD각350ms/공격900ms/Q.임시적24(2ring×12,半径250/390px),6회500ms샘플은global카운트.검수HP50ms보충/iframes최소60으로밸런스/무보정클리어/전종패링/loot/종주PASS아님.

**VISUAL VERDICT: RETOUCH** — 서쪽큰형태부분반영.맵전체의건강한외곽식생·반복목질·중앙밀집가림은잔여.

NEXT PASS: 새고목 주변과위쪽외곽의큰형태연결을이어가며보행·넓은전투공터보존.

## 본편 경로 증거

본편game/이미지route교체0,17카메라·실제입력·임시24적검수.요청50청크모두20260928-outer-66;visibleIds=drawnIds/pageerror0/HTTP오류0/G.map동일true.현재masterSHA256 3d25444d37085eaffb44ae8b16a702592777e9504552ffbd769a6d85905830fe.성능/NW.js미검증.

---

<a id="skin65"></a>

# CH1-1 피부 바닥 본편 연결 — 65차

63차 첫공터·64차 나무앞 재질과65차 서쪽 연결을 한 master로 통합한다. 생체모듈은61차 유지,배경청크 cache는20260928-skin-65. 맵 전체의완성판정과국소반영을구별한다.

## 제작 계약

| id | 항목 | 값 |
|---|---|---|
| SOURCE65 | 원화 | 63차 Higgsfield gpt_image_2_5 job8297189f-c4f9-4719-91f1-7cb5df20c1a6,1024² RGB.신규생성없음;generation.json 원본프롬프트보존 |
| CROP65 | 통합 선택 | [2007,2867,5447,7249],3440×4382;8192² master source40.96px/tile |
| PHASE65 | 재질 | RGB×.53;source anchor[2498,4587];sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4) |
| MASK65 | 서쪽 연결 | tile타원[69,100,12,25],[73,123,12,15];alpha.60/feather.35/smoothstep;기존64mask와max union |
| ROOT65 | 보호 | 기존[105,95,20,15],[108,79,18,10],protect=smoothstep(clamp((1.18-r)/.18));뿌리·갈비뼈보존 |
| KEEP65 | 픽셀 | mask0영역8,247,686pixels변경0;새서쪽영역밖기존64pixels변경0 |
| CHUNK65 | 배경 | 30청크 x1..5/y2..7,core1024/bleed1/전체1026².나머지34청크보존;단일master crop과픽셀동일검사 |
| VERSION65 | 로더 | game.html production smoothing분기만20260928-skin-65.과거outer20260917-depth-2/diablo20260924-blockout-2 유지.생체모듈61/캐시·draw추가없음 |
| SOURCES65 | 복구자료 | assets/map/ch1/production_finish/skin65_sources에재질/합성crop/레이어/마스크/prep/generation 6파일 |
| MOTION65 | 움직임 | 추가재질은정지그림.기존늪가스·버블·동맥모션유지;새피부전체맥동미구현 |

## 검수

첫비교before64/after65,1280×720,14카메라. game.html snapshot동일사용. 실제서버본편적용후는별도 live/runtime.json으로확인한다. 두실행의적·이펙트시간은동일하지않으므로전체화면차이를재질차로간주하지않는다.

| 검증 | 비교 검수 결과 |
|---|---|
| G.map | SHA256 8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1;전후동일true,입력·임시전투후동일true |
| 오류 | pageerror before0/after0;HTTP>=400 before0/after0 |
| 청크 | 후보30개전부요청;64개1026²;224core/bleed strip PASS/불일치0;모든14카메라visibleIds=drawnIds |
| 입력 | WASD각350ms/공격900ms/Q;{"x":4020,"y":6060}→{"x":4025.5827200000003,"y":6060};종주증거아님 |
| 밀집 | 기존mkEn/AI로24추가;2ring×12,반경250·390px.6회500ms샘플global alive=31/31/31/31/31/31,global적투사체=1/2/10/11/19/24 |
| 가독성 | 청색·황색·분홍탄과낮은대비바닥구별.중앙적과타격효과중첩시캐릭터가림잔여 |
| 한계 | HP50ms보충/iframes최소60,synthetic검수;밸런스·무보정클리어·전종패링·loot·종주·장시간/NW.js/FPS성능PASS아님 |
| 준비 오류 | prep의비교파일old crop경로63잔여로종료1;경로64로수정하고완료부재실행.원화·청크생성자체는완료돼보호·이음새재검증후사용 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0,GATE4 GROUND CONNECTION 부분반영.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존8지역·53점경계·200²·6시시작/12시출구·양측공간유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 서쪽지면접합개선.네방향질량·구조보존.건강한외곽식생·반복목질잔여 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존master+63피부재질.고목과뿌리실루엣보존.새구조물없음;반복실루엣해결아님 |
| MEDIUM — connections / remaining holes | 첫공터→root_bend→나무앞→서쪽피부연결.다른측면/북쪽후반연결잔여 |
| GROUND — shadow / contamination / structure integration | 회자주피부막·주름과기존그림자통합.서쪽녹갈색띠완화;녹색외곽질량완전교체아님 |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 넓은공터·진행·호흡·위협공간보존.평면재질만변경.탄구분확인;중앙중첩잔여 |
| LANDMARK — primary / secondary / tertiary | 생체나무/제단/늪·아치·캠프유지;추가중앙장애물없음 |
| CAMERA QA — START | tile(100,180),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — EARLY | tile(100,157),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — ROOT_BEND | tile(83,125),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — ARENA | tile(100,120),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — FORECOURT | tile(100,113),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — TREE_WEST | tile(82,96),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — TREE_SOUTH | tile(102,109),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — WEST_EDGE | tile(68,100),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — WEST_JOIN | tile(72,117),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — SIDE_L | tile(49,151),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — SIDE_R | tile(151,136),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — LANDMARK | tile(102,90),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — LATE | tile(100,48),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — EXIT | tile(100,15),before64/after65;청크정합·전후사진보존 |
| TECH QA — route / collision | 비교전후G.map동일,기존충돌/경계/배치유지.전체반경종주미실시 |
| TECH QA — pageerror / 404 / seam / loading / performance | 비교오류0/HTTP오류0/224stripPASS/14카메라ready.FPS측정·NW.js미검증 |
| FILES — stage-owned | production master/30청크/skin65_sources6파일,game.html cache분기1개,관련맵문서·CHANGELOG_SYNC,ignored검수/backup |
| FILES — concurrent touched / unrelated touched | 공유game.html·CHANGELOG_SYNC는최신내용을읽고해당분기/맨위이력만수정.타작업스테이징유지.기타파일미수정 |
| GIT — staged / commit / push / deploy | 결과를완료증거에기록.외부push/deploy없음.원본master/30청크backup31파일tmp/ch1-production-pre65 |

**VISUAL VERDICT: RETOUCH** — 부분지면연결은본편에반영하지만전체맵은외곽식생·중앙전투중첩·성능QA잔여로완성아님.

NEXT PASS: 외곽의건강한식생과반복고목을큰형태부터리터치.나무뿌리·전투공간·진행을보존하고카메라/전투검수지속.


---

## 2026-09-28 — 64차 북쪽 피부 지면 연결 검수

현행 production은61차이며64차아트는별도검수본이다.63차의Higgsfield GPT 재질을재사용해나무앞·서쪽으로연결;신규생성없음.본편master/청크/충돌/캐시버전은변경하지않았다.

| id | 계약·검수 | 실제 값 |
|---|---|---|
| SKIN64 | 선택·레이어 | source crop[2498,2867,5447,7249],2949×4382; anchor[2498,4587];RGB×.53;sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4) |
| SKIN64_MASK | 연결·보호 | tile타원[96,112,29,24],[80,93,16,23],alpha.58/feather.23.뿌리보호[105,95,20,15],[108,79,18,10],protect=smoothstep(clamp((1.18-r)/.18));63mask와max union |
| SKIN64_KEEP | 픽셀보존 | mask0영역6,976,692pixels중변경0;새북쪽영역밖63pixels변경0 |
| SKIN64_QA | 실제게임 | before63/after64;12카메라;24검수청크(x2..5/y2..7);224stripPASS;G.map동일;pageerror/HTTP오류0;ch1LivingDetail41PASS |
| SKIN64_COMBAT | 밀집가독성 | 임시기존AI적24마리추가;밝은투사체구분확인.중앙실루엣가림잔여.HP50ms보충/iframes60;성능·밸런스PASS아님 |
| SKIN64_STATE | 판정·기록 | VISUAL VERDICT: RETOUCH.정지재질이며신규피부모션완료아님.외곽·녹색잔여·밀집중앙중첩·성능QA잔여 |

전체수치·12카메라좌표·MAP PRODUCTION REPORT: [64차보고서](../../captures/ch1_ground_skin64/REPORT.md), [비교갤러리](../../captures/ch1_ground_skin64/index.html).승격시assets원본/레이어/마스크와master→64청크→cacheversion→docs를같이반영한다.

> **2026-09-28 63차 별도 검수본:** production master의crop `[2498,4587,5447,7249]`만피부재질로부분합성하고source(core1024/bleed1)와동일좌표의16청크를검수라우팅으로교체했다. 현행master/64production청크/geometry/런타임코드미변경. 크기1026²·전체이음새224검사통과. [검수범위·시각판정·미완료](../../captures/ch1_ground_skin63/REPORT.md).

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

> **2026-09-17 리터치 이력:** bake/cache `20260917-depth-2`. 신규 숲 원화 4종, 고정 외곽 42배치와 낮은 뿌리 9배치. CH1-1 hand `m_c1tree`만 화면 크기 0.72 / pivotY 0.72; 원본 metadata 1450 및 충돌은 유지. geometry/START/EXIT/진행 계약 유지. 최신 시각 판정 **RETOUCH**. [실제 화면·영상·검증 한계](CH1_1_DEPTH_RETOUCH_20260917.md). 아래 ground-2와 이전 PASS는 당시 이력이다.

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **39차 현행(2026-09-27):** 구형 rotten_tree/vine_pillar 원화와사본7개 폐기. 게임·편집기·충돌·나무움직임에서제외. 과거배치/확대재작업계획은이력. dry아틀라스는전용 _atlasDry:1로분리해동작보존. [현행폐기SSOT](CH1_LOW_QUALITY_RETIREMENT_PASS39.md).

> **38차 현행(2026-09-27):** 구형 weapon_pile.png 및 동일사본4개 폐기·격리. m_wpile/m_c5wpile/weapon_pile 사용금지. 과거무기더미배치·접지기록은이력이다. 접지현행2장/0.5MiB,전체native87.81269454956055MiB,모듈20260927-38. [검수·폐기 SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md).

> **2026-09-27 37차 현행 폐기 결정:** 구형 tombstone.png와 exposed_root.png는 사용자 지정 저품질 원화로 사용 금지. 36차 접지 보강은 폐기되었다. 아래의 해당 에셋 수치·좌표·접지 기록은 과거 이력이며 현행 등록·배치가 아니다. 동일 원화 6파일 격리, CH1 authored 8배치 제거, 접지 계열은 3장/0.75MiB로 복귀. [폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md).

> **2026-09-16 후속 실제 수정:** 사용자 추가 지시에 따라 bake/cache가 `20260916-ground-2`로 변경됐다. 흙길/공터와 이끼·낙엽을 구분하며 geometry/START/EXIT/배치/진행은 유지한다. [현재 지면 구성·전후 증거](CH1_1_GROUND_STRUCTURE_20260916.md). 아래 finish-3 및 ec7bf70d8 동일성 판정은 수정 전 검수 이력이다.

> **후속 검수 정정: VISUAL VERDICT: RETOUCH.** 아래 제작 당시 PASS 및 “필수 미완성 구간 없음” 판단은 철회한다. 게임/맵 ec7bf70d8은 보존했다. [실제 전후 화면·일반 플레이·위치별 결함 검수](CH1_1_FINAL_REVIEW_20260916.md)가 최신 판정이다. 기존 기술/QA 진행 이력은 그대로 유지하며 일반 클리어 증거로 확대하지 않는다.

# EXODUSER CH1-1 PRODUCTION FINISH — 2026-09-16

상태: **실제 1-1 전체 적용, 런타임 리터치, 입력 종주 및 기존 완료 조건/1-2 진입 확인 완료.**

시각 판정은 아래 카메라 검토에 근거한 제작자 판정이다. 일반 난이도 밸런스, 모든 실행 환경의 안정성, 사용자 최종 승인을 의미하지 않는다. 전투 종주의 상당 부분은 QA 피해 무효 상태였다. 무보정 클리어로 보고하지 않는다.

## 1. 실제 적용한 내용

### 대상 및 연결

| 항목 | 실제 계약 |
|---|---|
| 대상 | `STAGES[0]={id:0,hell:0,floor:1,mw:200,mh:200,type:'field',face:true}` |
| 게임 표시 | `제1구역 · 썩은 숲 1구역 / THE ROTTEN FOREST` |
| 배치 | `_MAP_COMPOSE[0].handProps` 직접 배열 |
| 혼동 제외 | `_CH1S1` → `_MAP_COMPOSE[1]`은 CH1-2이며 변경하지 않음 |
| 진입 | 기존 `genFromTemplate`, `_cloneField11(0)`, `_buildCh1StartForestRLE`, `CH1_1_PRODUCTION.buildRLE(200,200)` 연결 |
| 기본 배경 | `assets/map/ch1/production_finish/chunk_x_y.png?v=20260916-finish-3` |
| 규모 | 200×200타일, T40, 월드8000² 유지 |
| START | `(100.5,185.5)` 유지 |
| 북쪽 | gate x99..101/y5, exit x99..101/y7, 접근 바닥 x88..112/y2..35 유지 |
| 주 랜드마크 | `m_c1tree` authored102,90 / runtime102.5,90.5, sz1450, colW380/colH230, keepAR 유지 |
| 단구 | 중심147,98, rx18/ry9, inner .84/outer1.04, 서측 ramp x125..135/y98, 폭1.8→3 유지 |
| 배치 개수 | authored62, runtime63(시스템 gate1), hand 충돌21+시스템1=22 |
| 자동 중복 | `hand:1,dense:1,lm:[],mega:[]`; 자동 큰 장식/바닥 carpet 차단. 실제 scatter/decorList0 |
| 남측 성문 | 기존9월12일 철창 제거 상태 유지. 숲 어깨와 진입 흔적으로 문턱을 구성했으며 성문 재설치를 했다고 주장하지 않음 |

남쪽 문턱에서 첫 공터로 벌어지고, 서쪽 숲이 안으로 돌출되는 뿌리 숲길을 지나 시체나무 분지로 이어진다. 나무 양쪽 우회로, 야영지, 단구, 북쪽 고치와 물가를 비대칭 외곽에 연결했다. 북쪽은 기존 출구 축으로 수렴한다. 8개 구역은 역할 데이터이며 별도 사각형 방/로딩 단위가 아니다.

53개 경계점의 고정 polygon이 지형 기준이다. 충돌은 타일 RLE/기존 줄기 충돌을 사용하고, 그림의 경계에는 부드러운 접합을 둔다. 잎·가지 이미지 사각형을 벽으로 추가하지 않는다. 기존 flowfield/스폰/플레이어의 맵 충돌 경로를 유지한다.

### 배경 및 리터치

| 항목 | 최종 값/처리 |
|---|---|
| layout / bake version | `20260916-finish-1` / `20260916-finish-3` |
| 마스터 | 8192², SVG viewBox 0 0 200 200, bake40.96px/타일 |
| 청크 | 8×8=64, source core1024, bleed1 포함1026² |
| 월드 대응 | source1024→world1000, 전체8192→8000. 빌더와 렌더러를 함께 정규화 |
| 배경 x scale | production1, 과거 outer .965 유지 |
| 가시범위 | 배경 요청/표시 camera zoom 최소 .3 반영. props zoom 보정은 stage0 배경 활성 때만 |
| 합성 | 지면23+외곽22+연결11=고정56레이어. 아래 전수표 |
| 소스 | 기존 CH1 원화10종+ground_dark_soil.png. 타 게임 추출 아트 없음 |
| 확대/방향 | 최대1.3, 구조물 회전0/반전0, 랜덤 배치/시드 없음 |
| 바탕 | soil 원본1024², brightness .55/saturation .58 |
| 뒤쪽 경관 | soil brightness .24/saturation .35/tint #273326 |
| mask | polygon stroke1.8타일, mask blur18 bake px. 충돌 polygon 자체는 blur하지 않음 |
| 저주파 재질 | 길/공터/습지/뿌리 색 면만512² 합성, Gaussian1.3타일; 원화 RGB blur0 |
| 지면 접합 | 가장자리24%, 타원 가장자리38% smoothstep alpha, 배치 opacity×.7 |
| 숲 접합 | 가장자리9.5% alpha feather, 원화 RGB 선명도 유지 |
| 성능 구조 | 기존 비동기 decode/warm 캐시 사용. 합성/지형 제작은 빌드 시 수행 |

첫 적용 화면에서 지면 원본 패치가 읽혀 alpha 접합을 다시 제작했다. 전체 조망에서 청크와 props의 zoom 가시범위를 맞추고, 최종200타일 bake 좌표를 명시적으로 통일했다. 이후 기본 카메라9곳을 다시 촬영하고 최종 배경으로 입력 종주를 재실행했다.

### 위치 보정

| 대상 | 이전 authored | 최종 authored | 이유 |
|---|---|---|---|
| m_ctree1, scale .85 | 80,184 | 84,184 | 남측 숲 어깨 접지 |
| m_ctree3, scale .95 | 24,96 | 30,96 | 서측 외곽 접합 |
| m_fbones | 78,182 | 82,180 | 진입 경계 안에 정착 |
| m_vine_pillar | 29,158 | 34,156 | 서남 통로 연결 |
| m_c1sroot | 173,151 | 171,150 | 동남 접합 |
| stage0 spawnHole | 70,170 | 74,168 | 큰 적의 줄기/경계 여유. 종류/개수 유지 |

### Dimraeth 적용 범위

기존 `DIMRAETH_MAP_RESEARCH_20260916.md`, 근거 이미지, 참고 커밋4539c6fbd를 확인했다. 관찰 근거는 이동 바닥/외곽 경관의 역할 분리, 반복 재료의 연결, 장소별 지면 변화다. 이를 고정 polygon·연결 지면·역할 구역으로 옮긴 것은 **EXODUSER 제작을 위한 추론/설계**다. 바닥 재사용만으로 원작 자동 생성 구조를 단정하지 않는다. 이번 결과는 고정1-1이며 범용 절차 생성기가 아니다. 참고 커밋으로 되돌리지 않았다.

## 2. 실제 실행하여 확인한 내용

| 실행 | 결과 | 제한 |
|---|---|---|
| 본편 stage0 진입 | game.html에서 실제1-1 표시, production 로드 | QA test 슬롯 |
| 첫 전투 | Lv1 시작 장비로 피해 무효 적용 전29처치 | 전체 무보정 난이도 검증 아님 |
| 필드 이동/전투 | 실제 키·마우스 입력으로 남측→전투터→양측 주요 전투 지점→북측 이동, 추격/공격/기존 bladeDash 회피 확인 | 이후 피해 무효 P.iframes 사용 |
| 진행 조건 | 네 방면 대상 실제 처치, `_fbDone=true`, `_bossUnlocked=true`, 기존 북쪽 진입으로 보스 전환 | 몬스터 HP/처치 수/게이트/공격력 강제 설정 없음 |
| 보스/출구 | 실제 공격으로 기존 shield/HP/부활 처리. 한 번 사망 후 기존 재도전 사용. arena exit64,2로 실제 걸어 들어가 stageCleared=true | arena에서 피해 무효 재설정 |
| 다음 구간 | 기존 다음 버튼→여정(±0레벨)→G.stage1, stage0 배경 비활성 | CH1-2 전체 전투는 미검증 |
| 최종 배경 재종주 | START100.5,185.5→첫공터→서쪽 야영지→나무 양쪽→단구 ramp 왕복→북쪽101.36975,7.71085, 실제 입력만 사용 | mapqa/Lv500/적 비활성, 이동 전용. 이 실행으로 출구 해제를 주장하지 않음 |

종주 중 텔레포트/좌표 강제 변경은 사용하지 않았다. 비교 사진·전체 조망·성능 측정의 위치/카메라 설정은 **정지 관찰용**이며 종주 실적으로 합산하지 않는다. 전투 기록에는 기존 QA 재화가 있었고 스킬 일괄 UI를 열었으나 레벨 잠금으로 강화되지 않았다. 일반 밸런스 실험과 구별한다.

최종 이동 영상은 실제 게임 canvas의 captureStream 연속 녹화다. 연결 복구로 입력 로그 일부가 누락된 동안에도 녹화는 계속됐다. 이전 전투 영상은 실제 캡처 프레임과 원래 타임스탬프를 사용하여 입력 대기/캡처 공백이 있다. 합성 플레이 장면은 없다.

## 3. 기술 검증 결과

| 검사 | 결과/범위 |
|---|---|
| 회귀 | 최종54/54 PASS, 실패0: production5+기존CH1 21+CH3 28 |
| geometry hash | `719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c`; RLE/bake 일치 |
| 청크 | 64개1026², 대표 수평/수직6이음새 bleed 픽셀 일치 |
| 실제 canMv r15 | 연결19242셀, 목표13/13, 스폰14/14 접근 |
| 실제 canMv r40 | 연결17808셀, 목표13/13, 스폰14/14 접근 |
| 실제 canMv r120 | 연결15126셀, 목표12/12, 스폰14/14. 경계 촬영점39,112는 대형 적 경로에서 제외 |
| 배치 | authored62 모두 정확한 +.5타일 runtime 좌표, 강제 재배치0, runtime63/scatter0 |
| 타 스테이지 | stage0 제외 STAGES/compose와 cloneField11(1) 전후 JSON 동일. CH3 28검사 통과 |
| 배경 | 전체 조망64청크 표시/오류0. 기본9카메라 visible 청크 모두 표시 |
| pageerror/404 | 수집609이벤트 중 관찰0. 초기 로그 유실(truncated:true)로 실행 전체0건 보증은 **미검증** |
| 기타 | 탐색 중 취소 Media net::ERR_ABORTED1건. 신규 이미지404로 분류하지 않음 |

```powershell
& 'C:\nvm4w\nodejs\node.exe' --test test/ch1ProductionFinish.test.js test/ch1StartOuterMass.test.js test/ch1StartSmoothingPass.test.js test/ch3HellWinterLayout.test.js
& 'C:\nvm4w\nodejs\node.exe' tools/verify_ch1_production_finish.mjs
```

### 성능

1920×1080 논리 카메라/DPR1.75, 위치100,151/zoom1, high·torch·fog·postfx 유지/FPS제한0, 적 없는 정지 관찰, 약5초씩 측정. 변경 전은 백업한 실제 게임을 같은 서버에서 실행했다. 작은 FPS 차이를 최적화 성과로 단정하지 않는다.

| 항목 | 변경 전 | 최종 bake finish-3 |
|---|---:|---:|
| 평균 FPS | 235.84 | 239.30 |
| 프레임 P50 | 4.2ms | 4.2ms |
| 프레임 P95 | 4.4ms | 4.4ms |
| 프레임 P99 | 8.3ms | 4.5ms |
| 시간 | 5003.4ms | 5002.1ms |

최종 CPU 분해/전투 동일 부하/저사양 GPU/NW.js는 미측정. after/performance.json의 CPU 값은 bake 정규화 전 측정으로 최종 CPU 결과가 아니다. 최종값은 after/performance-final.json이다.

## 4. 시각 검증 및 남은 한계

기본 플레이 카메라9곳과 실제 이동을 확인했다. 미니맵/축소 이미지로 판정을 대신하지 않았다.

| 지점 | 좌표 | 확인 |
|---|---|---|
| 남측 | 100.5,185.5 | 숲 어깨/흙 진입선/이동 여유 |
| 첫공터 | 100,151 | 바닥 패치 완화/열린 전투 공간 |
| 숲길 | 82,122 | 서쪽 뿌리 돌출/폭 변화/지면 연결 |
| 나무 | 102,101 | 뿌리·부식토 접합/양쪽 실제 우회 |
| 서측 경계 | 39,112 | 경관/근경 뿌리/보행 바닥 연결 |
| 북쪽 출구 접근 | 100,22 | 지면과 숲 연결/성문 반복 없음 |
| 야영지 | 45,109 | 장소와 전투 여백/남쪽 뿌리 경계 |
| 단구 | 137,112 | 기존 높이/ramp 유지/실제 왕복 |
| 물가 | 157,54 | 젖은 지면/기존 웅덩이의 장소 차이 |

남은 시각적 한계:

- 전체 조망에는 원화의 얼굴/뿌리 모티프 재사용이 보인다. 기본 카메라에서는 경계·겹침이 달라 동일 간격 울타리로 이어지지는 않지만 원화 다양성에는 한계가 있다.
- 나무 바로 밑은 이미지가 바닥을 많이 덮는다. 캐릭터/적은 기존 렌더 순서상 구조물 이후 표시된다. 나무 전체를 벽으로 만들지 않았고 양쪽 우회를 확인했다.
- 동쪽 단구는 기존 타원형 높이 음영이 읽힌다. 잠긴 단구/ramp 계약을 유지했으며 높이 시스템을 개편하지 않았다.
- 피해 무효로 적을 오래 모으면 기존 전투 효과가 많이 겹친다. 모든 적 밀도에서 위험 지면 식별이 완벽하다는 판정은 하지 않는다.
- 기존 암녹색 조명을 유지해 외곽 세부는 어둡다. 전체 조명으로 이음새를 숨기는 변경은 하지 않았다.

**VISUAL VERDICT: RETOUCH — 후속 원본 비교 검수에서 판정 정정.** 위 잔여 한계와 미검증 환경을 포함한 전면적 품질 보증은 아니다.

## 5. 미검증 항목과 제한

| 항목 | 상태/사유 |
|---|---|
| 무보정 전체 난이도 | 미검증. 긴 진행/충돌 QA에 피해 무효 사용 |
| 모든 초기 오류 로그 | 미검증. 브라우저 이벤트 일부 유실; 관찰0과 전체0 구별 |
| 모든 적/반경/AI 조합 | 미검증. 실제 전투와 r15/40/120가 전 조합 증명은 아님 |
| 패링 | 별도 검증 안 함. 이동/공격/dash와 구별 |
| 모든 해상도/하드웨어/NW.js | 미검증. 로컬 브라우저 기본 카메라 중심 |
| 연속 전투 원본 | 일부 영상은 실제 정지 프레임 샘플링. 고프레임 연속 전투 영상 아님 |
| 최종 이동 영상 | 연속252.601초, canvas만 녹화(HTML HUD/오디오 제외), 적 없는 이동 QA |

필요한 파일/서버는 사용 가능했고 구현을 막는 실행 환경 차단은 없었다. 미검증 항목을 PASS로 대체하지 않는다.

## 6. 산출물과 변경 파일

증거 루트: `captures/ch1_1_production_finish_20260916/` (로컬, 저장소 ignore 대상).

| 산출물 | 경로/성격 |
|---|---|
| 전체 배치 | runtime-full-layout.jpg + .json: 실제 renderer, zoom.3,64청크/63props. 전체 조망만 torch=false |
| 변경 전 | before_full/01_start.png부터6장: 백업 실제 게임, 동일 위치/기본 카메라 |
| 변경 후 | after/01_start.png부터9장+manifest.json: 최종finish-3 |
| 비교 | comparison/01_start.jpg … 06_north_exit.jpg: 실제 전후 화면 나란히 배치 |
| 필드/전투 | START_EXIT_COMBAT_QA.mp4, route-session.json, video-metadata.json |
| 완료/다음 구간 | BOSS_CLEAR_NEXT_STAGE_QA.mp4, boss-finish-session.json, completion.json, stage-clear.jpg, next-stage-1-2.jpg |
| 최종 입력 종주 | FINAL_MAP_INPUT_WALK.mp4/.webm, final-walk-session.json, final-walk-video.json |
| 기술 | runtime-collision-audit.json, technical-verification.json, runtime-issues.json, other-stages-before/after.json |
| 성능 | before_full/performance.json, after/performance-final.json |
| 백업 | tmp/ch1_1_production_finish_20260916/backup/game.html |

composition-preview.jpg는 오프라인 bake 미리보기다. 초기 before/는 잘린 구버전이므로 before_full/만 비교에 사용한다. runtime-full-layout.png는 전송 중 손상되어 증거에서 제외하며 유효 JPEG로 대체한다.

| 변경 파일 | 범위 |
|---|---|
| game.html | stage0 배경/geometry, 월드 변환/zoom,5prop/1spawn 보정 |
| assets/map/ch1/production_finish/layout.js | 고정 경계/8구역/RLE |
| 같은 폴더 master/chunk64/composition.json/preview | 스테이지 배경/재현 가능한 배치 |
| tools/build_ch1_production_finish.mjs | 고정 원화 합성/bake |
| tools/verify_ch1_production_finish.mjs | 충돌 snapshot/청크/배치 기술 검사 |
| tools/package_ch1_production_evidence.mjs | 실제 캡처 영상/비교 패키징 |
| test/ch1ProductionFinish.test.js | 경계/연결/격리/월드크기/가시범위5검사 |
| test/ch1StartOuterMass.test.js, ch1StartSmoothingPass.test.js | 기본 경로 기대값 현행화 |
| 관련 맵 문서11개, 본 보고서, CHANGELOG_SYNC.md | 현행 계약과 과거 기록 구별 |

docs 전체 관련 키워드 검색 기록: tmp/ch1_1_production_finish_20260916/docs-*-audit.txt. 보호 문서 `2_3 돌진+패링+방패시스템`은 수정하지 않았다.

작업 중 외부 자동 체크포인트59a89ebdb에 초기 구현 일부가 포함됐다. 이를 되돌리지 않고 현행 트리에서 마무리한다. 후속 커밋은 이번 맵의 남은 변경만 선택한다. 다른 작업의 guard baseline/userdata/Steam 변경은 포함하지 않는다. **이 작업에서 push/배포/Steam 업로드를 수행하지 않았다.**

## 7. MAP PRODUCTION REPORT (§23)

```text
STAGE: CH1-1 / stage0 / 썩은숲1구역
MASTER
- silhouette: 남→북, 좌우 비대칭53점
- regions: 남측/첫공터/뿌리길/야영지/나무분지/단구/북측갈림/출구
- main route: START→첫공터→숲길→나무양옆→북측→EXIT
- side spaces: 서남 뿌리길/야영지/단구/고치/물가
OUTER MASS
- LEFT: 안으로 들어오는 뿌리 어깨와 야영지
- RIGHT: 단구/두 물가에 맞춘 굴곡
- TOP: 기존 북쪽25타일 접근축
- SOUTH: START를 감싸는 숲 문턱
- major holes: 검토 카메라에서 미완성 외곽 없음
LARGE
- source assets: 자체CH1 숲5종/지면5종/soil
- composites: 고정56레이어/64청크
- overlap: alpha접합/RGB선명도 유지
- repeated silhouette: 기본 화면 반복 완화, 조망의 원화 모티프 재사용 남음
MEDIUM
- connections: 명명된 어깨11곳/길·뿌리·습지 전이
- remaining holes: 관찰 구간 없음
GROUND
- shadow: 기존 조명/원화 방향 유지
- contamination: 나무 부식토/물가 습지/진입 흙
- structure integration: 나무/야영지/단구/물가 연결
PLAYABLE
- main arenas: 첫공터/나무양쪽/북측갈림
- travel space: 폭 변화가 있는 중앙/서측 연결
- breathing space: 중앙 작은scatter 없음
- threat space: 기존 적/스폰/게이트 규칙
- combat readability: 실제 추격/이동/회피 확인, 과밀효과 한계 기록
LANDMARK
- primary: 거대 시체나무
- secondary: 야영지/단구/고치/물가
- tertiary: 기존 뼈/뿌리/잔해
CAMERA QA
- START: 01_start/실제 입력 시작
- EARLY: 02_first_clearing/첫전투
- ARENA: 첫공터/나무양쪽
- SIDE L: 05_west_boundary/07_west_camp
- SIDE R: 08_east_terrace/ramp 실제왕복
- LANDMARK: 04_corpse_tree/양쪽우회
- LATE: 09_north_pool/북측이동
- EXIT: 06_north_exit/필드gate/보스완료/실제exit/1-2
TECH QA
- route: 입력 종주와 별도canMv BFS
- collision: r15/40/120,14스폰,authored좌표 유지
- pageerror: 관찰0/초기전체로그 미검증
- 404: 관찰0/초기전체로그 미검증
- seam: 대표6bleed 픽셀일치/기본카메라검토
- loading: 조망64/64표시/오류0
- performance: 정지P95 4.4→4.4ms, 전투/저사양 미측정
FILES
- stage-owned: production_finish/보고서/전용tools·test
- concurrent touched: game.html/CHANGELOG의 이번 변경만 분리
- unrelated touched: 이번작업 없음, 기존dirty 보존
GIT
- staged: 이번 맵 마무리만 선택
- commit: 최종응답의 로컬커밋 참조, 초기일부는 외부체크포인트 포함
- push: 수행안함
- deploy: 수행안함
VISUAL VERDICT: RETOUCH (후속 검수 정정; CH1_1_FINAL_REVIEW_20260916.md 참조)
NEXT PASS: 장소 구분·나무 접지·외곽 반복·단구 접합의 국소 보완 필요. 일반 완주/저사양/손실 없는 전체로그 미검증.
```

## 8. 고정 데이터 전수표

최종 composition.json/layout.js 전사값이다. 레이어 개수는 품질 목표가 아니라 재현용 기록이다.

### 역할 구역

| id | 이름 | anchor | 역할 | 지면 | 연결 |
|---|---|---|---|---|---|
| south_entry | 잠식된 진입로 | 100,185 | arrival | worn-earth | 좁은 남측 문턱에서 첫 공터로 벌어짐 |
| first_clearing | 쓰러진 숲의 공터 | 100,151 | combat | dry-soil | 서쪽 뿌리 통로와 동쪽 웅덩이가 비대칭으로 열림 |
| root_bend | 뿌리 어깨 숲길 | 83,125 | travel | leaves-earth | 서쪽 숲이 안으로 돌출되고 야영지로 길이 갈라짐 |
| west_camp | 버려진 야영지 | 45,100 | side-combat | trampled-earth | 낮고 긴 뿌리 경계와 중앙 공터 연결 |
| corpse_basin | 시체나무 분지 | 102,90 | primary-landmark | root-humus | 줄기 양쪽 우회와 넓은 전투 여백 |
| east_terrace | 부패한 제단 단구 | 147,97 | optional-high-ground | wet-earth | 기존 서측 경사로 유지 |
| north_fork | 고치 숲과 썩은 물가 | 100,52 | late-combat | damp-leaf | 서쪽 고치와 동쪽 습지 사이에서 북쪽 통로로 수렴 |
| north_exit | 숲의 마지막 문턱 | 100,22 | exit-approach | exposed-soil | 기존 gate y5 / exit y7 접근 |

### 경계점 — 순서대로 연결

| 순번 | x | y |
|---|---:|---:|
| 1 | 88 | 2 |
| 2 | 88 | 18 |
| 3 | 74 | 29 |
| 4 | 58 | 34 |
| 5 | 37 | 33 |
| 6 | 29 | 44 |
| 7 | 31 | 59 |
| 8 | 40 | 66 |
| 9 | 52 | 70 |
| 10 | 53 | 77 |
| 11 | 40 | 80 |
| 12 | 26 | 91 |
| 13 | 28 | 107 |
| 14 | 40 | 114 |
| 15 | 53 | 118 |
| 16 | 62 | 126 |
| 17 | 58 | 137 |
| 18 | 40 | 140 |
| 19 | 28 | 147 |
| 20 | 30 | 157 |
| 21 | 43 | 163 |
| 22 | 58 | 167 |
| 23 | 72 | 174 |
| 24 | 81 | 183 |
| 25 | 85 | 192 |
| 26 | 96 | 197 |
| 27 | 109 | 197 |
| 28 | 120 | 190 |
| 29 | 125 | 181 |
| 30 | 137 | 168 |
| 31 | 151 | 161 |
| 32 | 169 | 156 |
| 33 | 179 | 143 |
| 34 | 178 | 134 |
| 35 | 161 | 128 |
| 36 | 143 | 127 |
| 37 | 134 | 121 |
| 38 | 139 | 113 |
| 39 | 160 | 110 |
| 40 | 175 | 105 |
| 41 | 180 | 93 |
| 42 | 172 | 84 |
| 43 | 151 | 79 |
| 44 | 145 | 72 |
| 45 | 154 | 63 |
| 46 | 174 | 59 |
| 47 | 181 | 48 |
| 48 | 177 | 35 |
| 49 | 162 | 30 |
| 50 | 142 | 33 |
| 51 | 126 | 28 |
| 52 | 113 | 18 |
| 53 | 112 | 2 |

### Bake 배치 — 경로 기준 assets/map/ch1/

opacity는 alpha feather/지면×.7 적용 전 값이다. runtime props와 다른 정적 합성 레이어다.

| 번호/층 | 파일 | x | y | scale | opacity | brightness | saturation |
|---|---|---:|---:|---:|---:|---:|---:|
| 1/GROUND | floor_objects/prop_g_battle.png | 100 | 185 | 0.95 | 0.54 | 0.78 | 0.45 |
| 2/GROUND | floor_objects/prop_g_battle.png | 97 | 171 | 1.2 | 0.58 | 0.8 | 0.4 |
| 3/GROUND | floor_objects/prop_g_battle.png | 91 | 153 | 1.3 | 0.65 | 0.8 | 0.4 |
| 4/GROUND | floor_objects/prop_g_battle.png | 112 | 154 | 1.1 | 0.55 | 0.76 | 0.42 |
| 5/GROUND | floor_objects/prop_g_edge.png | 71 | 159 | 1.2 | 0.58 | 0.66 | 0.5 |
| 6/GROUND | floor_objects/prop_g_edge.png | 131 | 163 | 1.1 | 0.5 | 0.62 | 0.5 |
| 7/GROUND | floor_objects/prop_g_root.png | 69 | 131 | 1.1 | 0.52 | 0.62 | 0.38 |
| 8/GROUND | floor_objects/prop_g_battle.png | 90 | 125 | 1.15 | 0.5 | 0.72 | 0.4 |
| 9/GROUND | floor_objects/prop_g_battle.png | 53 | 107 | 1.12 | 0.6 | 0.76 | 0.4 |
| 10/GROUND | floor_objects/prop_g_edge.png | 36 | 117 | 1 | 0.56 | 0.63 | 0.43 |
| 11/GROUND | floor_objects/prop_g_root.png | 88 | 102 | 1.2 | 0.66 | 0.64 | 0.38 |
| 12/GROUND | floor_objects/prop_g_root.png | 113 | 99 | 1.14 | 0.63 | 0.65 | 0.38 |
| 13/GROUND | floor_objects/prop_g_corpse.png | 103 | 79 | 1.15 | 0.44 | 0.65 | 0.4 |
| 14/GROUND | floor_objects/prop_g_battle.png | 81 | 88 | 0.92 | 0.57 | 0.72 | 0.4 |
| 15/GROUND | floor_objects/prop_g_battle.png | 123 | 84 | 0.95 | 0.5 | 0.72 | 0.4 |
| 16/GROUND | floor_objects/prop_g_root.png | 132 | 106 | 0.9 | 0.51 | 0.58 | 0.42 |
| 17/GROUND | floor_objects/prop_g_toxic.png | 163 | 143 | 1.15 | 0.38 | 0.64 | 0.34 |
| 18/GROUND | floor_objects/prop_g_toxic.png | 166 | 48 | 1.1 | 0.4 | 0.6 | 0.33 |
| 19/GROUND | floor_objects/prop_g_edge.png | 143 | 58 | 1.12 | 0.58 | 0.6 | 0.44 |
| 20/GROUND | floor_objects/prop_g_root.png | 53 | 58 | 1 | 0.52 | 0.62 | 0.38 |
| 21/GROUND | floor_objects/prop_g_battle.png | 96 | 54 | 1.25 | 0.56 | 0.75 | 0.4 |
| 22/GROUND | floor_objects/prop_g_battle.png | 105 | 35 | 1.13 | 0.55 | 0.77 | 0.4 |
| 23/GROUND | floor_objects/prop_g_battle.png | 100 | 18 | 0.85 | 0.5 | 0.78 | 0.4 |
| 24/FOREST | collision/bound_w.png | 21 | 30 | 1.15 | 1 | 0.53 | 0.6 |
| 25/FOREST | collision/corner_nw.png | 31 | 23 | 1.25 | 1 | 0.57 | 0.61 |
| 26/FOREST | collision/bound_n.png | 64 | 23 | 1.25 | 1 | 0.56 | 0.59 |
| 27/FOREST | collision/bound_w.png | 20 | 67 | 1.25 | 1 | 0.52 | 0.62 |
| 28/FOREST | collision/corner_nw.png | 37 | 73 | 1.2 | 1 | 0.58 | 0.63 |
| 29/FOREST | collision/bound_w.png | 13 | 109 | 1.3 | 1 | 0.5 | 0.58 |
| 30/FOREST | collision/bound_n.png | 39 | 123 | 1.24 | 1 | 0.58 | 0.58 |
| 31/FOREST | collision/corner_nw.png | 46 | 129 | 1.18 | 1 | 0.61 | 0.62 |
| 32/FOREST | collision/bound_w.png | 19 | 150 | 1.2 | 1 | 0.53 | 0.58 |
| 33/FOREST | collision/bound_n.png | 45 | 171 | 1.25 | 1 | 0.55 | 0.6 |
| 34/FOREST | collision/corner_nw.png | 70 | 184 | 1.2 | 1 | 0.57 | 0.6 |
| 35/FOREST | collision/bound_w.png | 78 | 201 | 0.9 | 1 | 0.55 | 0.58 |
| 36/FOREST | collision/bound_n.png | 148 | 22 | 1.25 | 1 | 0.5 | 0.65 |
| 37/FOREST | collision/bound_e.png | 186 | 44 | 1.2 | 1 | 0.52 | 0.64 |
| 38/FOREST | collision/corner_ne.png | 174 | 70 | 1.25 | 1 | 0.54 | 0.64 |
| 39/FOREST | collision/bound_e.png | 188 | 99 | 1.22 | 1 | 0.48 | 0.65 |
| 40/FOREST | collision/corner_ne.png | 152 | 119 | 1.15 | 1 | 0.56 | 0.61 |
| 41/FOREST | collision/bound_n.png | 180 | 120 | 1.25 | 1 | 0.5 | 0.58 |
| 42/FOREST | collision/bound_e.png | 190 | 151 | 1.25 | 1 | 0.51 | 0.62 |
| 43/FOREST | collision/corner_ne.png | 157 | 168 | 1.25 | 1 | 0.55 | 0.6 |
| 44/FOREST | collision/bound_e.png | 134 | 190 | 1.1 | 1 | 0.55 | 0.6 |
| 45/FOREST | collision/bound_n.png | 144 | 199 | 1.3 | 1 | 0.48 | 0.6 |
| 46/CONNECTION | floor_objects/prop_g_edge.png | 76 | 179 | 0.95 | 0.72 | 0.59 | 0.5 |
| 47/CONNECTION | floor_objects/prop_g_root.png | 126 | 181 | 0.9 | 0.62 | 0.59 | 0.42 |
| 48/CONNECTION | floor_objects/prop_g_edge.png | 63 | 168 | 1.1 | 0.65 | 0.61 | 0.48 |
| 49/CONNECTION | floor_objects/prop_g_edge.png | 146 | 163 | 0.95 | 0.65 | 0.59 | 0.5 |
| 50/CONNECTION | floor_objects/prop_g_root.png | 58 | 129 | 1.1 | 0.7 | 0.63 | 0.44 |
| 51/CONNECTION | floor_objects/prop_g_edge.png | 136 | 120 | 1.2 | 0.68 | 0.58 | 0.5 |
| 52/CONNECTION | floor_objects/prop_g_edge.png | 30 | 109 | 1 | 0.65 | 0.58 | 0.48 |
| 53/CONNECTION | floor_objects/prop_g_root.png | 49 | 73 | 0.9 | 0.67 | 0.59 | 0.45 |
| 54/CONNECTION | floor_objects/prop_g_edge.png | 146 | 74 | 1.05 | 0.7 | 0.58 | 0.5 |
| 55/CONNECTION | floor_objects/prop_g_edge.png | 74 | 28 | 1 | 0.64 | 0.6 | 0.5 |
| 56/CONNECTION | floor_objects/prop_g_root.png | 129 | 28 | 0.95 | 0.64 | 0.58 | 0.45 |

### 고정 지면 색 면/뿌리 좌표 계약

200타일 viewBox 기준. 아래는 런타임 생성기가 아니라 고정 bake 입력이다. 원화 RGB blur와 구별한다.

```svg
<defs><filter id="soft"><feGaussianBlur stdDeviation="1.3"/></filter></defs>
 <g filter="url(#soft)">
  <path d="M101 198 C98 187 108 180 101 169 S87 154 99 145 C106 137 96 129 87 119 S89 103 84 95 C79 83 84 75 94 67 S102 47 100 33 L100 3" fill="none" stroke="#69523a" stroke-width="12" opacity=".3"/>
  <path d="M101 174 C79 169 60 166 60 153 C62 139 88 141 102 143 C117 140 138 146 139 155 C138 168 115 174 101 174Z" fill="#69513d" opacity=".27"/>
  <path d="M75 121 C56 118 32 111 33 99 C36 89 61 90 73 103 C84 113 82 119 75 121Z" fill="#594d3a" opacity=".3"/>
  <path d="M77 109 C67 96 76 73 92 71 C118 68 135 83 130 101 C125 114 94 118 77 109Z" fill="#333c2b" opacity=".26"/>
  <path d="M122 68 C138 67 166 60 177 47 C173 34 154 35 144 43 C139 51 129 56 122 68Z" fill="#304539" opacity=".34"/>
  <path d="M138 148 C148 157 171 157 173 143 C175 128 155 131 144 139Z" fill="#344337" opacity=".35"/>
  <path d="M95 68 C78 67 55 66 41 56 C35 42 46 35 58 39 C68 48 84 45 105 39" fill="none" stroke="#514630" stroke-width="9" opacity=".23"/>
  <path d="M93 43 C98 36 99 29 100 18" fill="none" stroke="#76634b" stroke-width="16" opacity=".26"/>
 </g>
 <g fill="none" stroke-linecap="round">
  <path d="M102 90 C97 100 86 104 78 113 M102 90 C113 98 120 111 132 113 M103 90 C111 79 113 69 123 66" stroke="#232921" stroke-width="1.6" opacity=".5"/>
  <path d="M102 91 C95 101 89 104 81 112 M102 90 C112 98 122 110 131 112 M103 90 C111 79 113 69 123 66" stroke="#74634a" stroke-width=".25" opacity=".3"/>
 </g>
```

빌드 운영값: sharp concurrency2, cache memory128MB/files20/items30, PNG compressionLevel6, offline preview1600px/JPEG90. layer 기본 scale1/opacity1/brightness.62/saturation.65, 경계 밖은 crop한다.


### 2026-09-25 CH1-1 생체 디테일 마감: 중복 독액 장식

| 적용 | 현재 계약 |
|---|---|
| 본편 stage0 렌더 | `m_c1gtoxic` 월드(6740,1620), 타일(168,40)만 기존 `m_c1pool` 이미지 로드 완료(complete 및 naturalWidth>1) 시 숨긴다. `Ch1LivingDetail.hideDuplicate` 사용 |
| 보존 | authored/MAP_OBJS 좌표·개수·충돌 불변. `m_c1gtoxicf`, 다른 좌표/스테이지, bossArena/fieldRebuildQA와 기존 bake에는 적용하지 않음 |
| 폴백 | 웅덩이 이미지 또는 효과 스크립트/API 미로드 시 기존 장식을 그린다 |
| 근거 | 겹친 두 웅덩이 실루엣을 하나로 정리하는 시각 전용 마감. 세부 수치·QA는 `docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` 7차에 기록. 위 날짜별 제작 수치는 해당 시점 이력 |


### 2026-09-26 동측 독구덩이 입체 디테일

| 대상 | 현행 런타임 예외 |
|---|---|
| pit_poison | 본편 stage0의 월드(6500,5580),타일(162,139)만 Ch1LivingDetail.pit의 절차식 투명 atlas로 그린다. 크기200×scale,좌표·collision·배치개수 유지. 안쪽 벽/낮은 수면/앞턱 가림 및 국소 수축 추가 |
| 폴백·범위 | 효과 API 미로드 시 원래 pit_poison.png 렌더. 다른 위치/스테이지/bossArena/fieldRebuildQA에는 원래 그림 유지. 대형 m_c1gtoxicf 원화 보존 |
| 계약 | 상세 수치·검수: CH1_LIVING_DETAIL_RUNTIME_20260925.md 9차. 원본 이미지 파일 변경 없음 |


### 2026-09-26 생체 야영지·대왕나무 국소 움직임

| 대상 | 현재 렌더 계약 |
|---|---|
| m_c1tree / m_c1camp | Ch1LivingDetail.organic: tree는15차에서 좌우뿌리2축의 붙은 밑동을 고정하고 끝을 들었다 내리는 굽힘으로 교체. camp는13차에서 수평출렁임을 제거하고 화로의 시체 손3개만 손목/손가락 관절로 굽혔다 펴는 동작으로 교체. 팔/가시/상자/돌 고정. stage0,bossArena/fieldRebuildQA제외;이미지로드실패/meta.srcRect존재/API없음이면기존sprite폴백 |
| m_c1cocoon / m_c1spod | 기존이미지알파를이용한바닥투영그림자+밑동접촉그림자,밑동고정호흡.다른stage/평면pool제외 |
| 보존·성능 | 좌표/크기/pivot/충돌/원본파일불변.동적canvas _glVer 및기존GPU텍스처재사용.추가캐시19.109310150146484MiB(native,기존나무그림자/GPU복제별도).상세공식·검수는CH1_LIVING_DETAIL_RUNTIME_20260925.md 13차 14차: 손가락별 접힘 지연·연속 관절 연결·투명셀 베이크 생략. 손14차/뿌리15차/매달린물체17차 계약 참조. 16차 고치3개·왼쪽시체1개에 이어17차 오른쪽시체1개 추가: 고치3개·시체2개, 고정 매듭 중심 진자 회전. 18차 원본 하단28% 알파 기반 접촉 그림자 추가(512×192,0.375MiB). 현행 수치·검증은 CH1_LIVING_DETAIL_RUNTIME_20260925.md 18차 참조. |


### 2026-09-27 동측 독구덩이 경계 보강21차

| id / 적용 위치 | 현재 렌더 계약 | 보존 |
|---|---|---|
| m_c1gtoxicf / (6500,5460) | stage0 production에서 groundSprite로 보라색 경계64px 이내만 색 보정, 21차 당시18px 알파 전이(현행25차는 명도에 따라24~56px). 정적881×900 canvas 캐시1장. [공식·폴백·QA·메모리](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의21차/25차 참조 | prop_g_toxic.png·기존 bake·좌표·크기·반전·충돌·pit_poison 동작 유지. 과거의 m_c1gtoxicf 미적용 문구는 당시 효과 범위이며, 이번 경계 보정과 구분 |


## 2026-09-27 독구덩이 재질 연결22차

| 대상 | 현행 구현 | 보존·한계 |
|---|---|---|
| pit_poison / (6500,5580) | stage0 production의 기존16프레임 atlas에 prop_g_toxic.png의 벽·독액을 국소 샘플링. 이미지 미로드 시 기존 절차식 폴백, 로드 후 atlas 갱신. [런타임22차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의 crop/명암/QA 계약 참조 | 위치·크기200×scale·collision·수축·유입2개 유지. 원본 PNG 보존. 기존 절차식 atlas 설명은 최초 구현 이력이며 현재 재질은22차가 우선. 전체 원화/지면 통합은 RETOUCH |


### 2026-09-27 촉수 포복23차

| 대상 | 현행 움직임 | 보존 |
|---|---|---|
| Ch1LivingDetail dry 지면 촉수 | [런타임23차](CH1_LIVING_DETAIL_RUNTIME_20260925.md): 밑동 고정,끝이 먼저 뻗고 몸통이 지연되어 따라 당겨짐. 끝점 고정은10차 이력이며 dry 현행 동작은23차가 우선 | 기존 월드 앵커·collision·동선·atlas 크기·16프레임 유지. wet 독액 촉수는 기존 동작 |


### 2026-09-27 독구덩이 앞턱26차

| 대상 | 현행 변경 | 보존 |
|---|---|---|
| pit_poison(6500,5580) | material 로드시 앞턱을 벽과같은불규칙반경·dash[13,7,5,11]접촉선으로 연결. 접촉alpha.42/2px·강조.12/1px. [런타임26차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)참조 | 미로드폴백RGBA동일,원본·수면·동작·collision보존 |


### 2026-09-27 큰 늪 수면27차

| 대상 | 현행 동작 | 보존·자원 |
|---|---|---|
| m_c1gtoxicf(6500,5460) | Ch1LivingDetail.swamp가 큰원화의수면4곳에흐름·기포8개를직접합성.6400ms/16프레임. 26차까지는큰원화정적/작은pit만동적이었다. [런타임27차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의polygon·공식·QA참조 | 바위·외곽·원본PNG·충돌유지. 기존정적경계캐시와별도로1760×1800RGBA atlas12.0849609375MiB추가. 벽분리변형아님 |


### 2026-09-27 늪 버블·가스28차

| 대상 | 현행 동작 | 보존 |
|---|---|---|
| 큰늪 m_c1gtoxicf(6500,5460) | 버블8개 팽창→주기60%에서파열→잔물결·물방울6개→같은자리탁한가스3lobes상승.6400ms/16프레임. [런타임28차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·QA참조 | 원본·바위형태·충돌보존. 가스는물마스크밖으로상승하며캐릭터뒤렌더. 기존atlas재사용,추가상주캐시0/피해0 |


### 2026-09-27 버블 가독성29차

| 대상 | 현행 교정 | 보존 |
|---|---|---|
| 큰늪 버블8개 | 최대반경8→16native px,볼록한황록돔·광택·접촉그림자. 주기46~60%/896ms최대팽창유지,60%에서파열. 파열시작반경16/8. [런타임29차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·검수참조 | 가스·수면흐름·좌표·충돌유지,기존atlas재사용 |


### 2026-09-27 버블 파열 가독성30차

27~29차의 버블16프레임·물방울6개·추가캐시0은 당시 이력. 현행 버블은 아래 값으로 대체하며 물·가스16프레임은 유지한다.

| 대상 | 현행 | 자원·경계 |
|---|---|---|
| 큰늪 m_c1gtoxicf(6500,5460),8vent | 6400ms/64프레임(자세간격100ms),직전눌림384ms·균열192ms→막8갈래 파열384ms·물방울8개768ms·잔물결1152ms. [런타임30차](CH1_LIVING_DETAIL_RUNTIME_20260925.md) 전체공식·검수 참조 | 버블768×768/2.25MiB추가,최대19drawImage. 수면·가스16프레임/400ms,원본·collision·공간구성 유지. 모듈20260927-30 |


### 2026-09-27 늪 접지31차

| 대상 | 현행 접지 | 보존·비용 |
|---|---|---|
| m_c1gtoxicf(6500,5460) | 원화alpha>80 윤곽에서외측28native px까지감쇠하는정적젖은흙. 원본아래합성,원형테두리미사용. [런타임31차](CH1_LIVING_DETAIL_RUNTIME_20260925.md) 공식·검수참조 | 30차버블/가스/수면/충돌보존.512²RGBA 1MiB추가,swamp최대20drawImage.30차19회기록은이력.모듈20260927-31 |


### 2026-09-27 동측 생체 지면 연결32차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| SIDE_R 중심(6060,5460),variant1 | 1440×800 지면전이(20차1200×800대체),서쪽회갈색조직→동쪽녹갈색오염. 얕은연결주름3줄/늪쪽마스크lobe추가. [런타임32차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)정확한색·곡선·마스크·QA참조 | 기존768×512캐시재사용/추가메모리0·draw0. 30차버블/31차접지/충돌·공간보존. 모듈20260927-32 |


### 2026-09-27 야영지 접지33차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_c1camp(1820,4020) | 원본하부알파윤곽을따라외측22native px까지감쇠하는정적재·그을음. 상부천막제외,body아래합성. [런타임33차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·검수참조 | 손3개·화로·상자·원본·충돌유지.512×400RGBA/0.78125MiB추가,대상camp1drawImage추가.모듈20260927-33 |


### 2026-09-27 야영지 전면 재질34차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| CAMP_FRONT 중심(1860,4300),960×640 | 재색흙→괴사피부의정적전이와얕은연결주름3줄. regionalSkin variant3,기존33차접지에서앞쪽빈바닥으로연결. [런타임34차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)전체규격·QA참조 | 768×512RGBA/1.5MiB추가,보일때1drawImage. 지역캐시4장/6MiB. 기존손동작·늪·충돌보존.모듈20260927-34 |


### 2026-09-27 야영지 잔해 접지35차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_c1sbone(1940,4340)/m_sword_pile(1580,4180)/m_wpile(2060,4220) | 원본하부alpha윤곽에서외측12native px감쇠접촉그림자. 상부해골장대제외. [런타임35차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)정렬·공식·QA참조 | 원본·손동작·34차지면·충돌유지.256²RGBA×최대3=.75MiB추가,보이는대상당1drawImage. 모듈20260927-35 |


### 2026-09-27 묘비·뿌리 접지36차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_tomb(1460,3900)/m_root(1980,3940) | 묘비밑동만/평면뿌리전체밑면의alpha윤곽접지. 별도모드캐시. [런타임36차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·규격·QA참조 | 원본·충돌·손동작보존.256²RGBA×2=.5MiB추가,35차대상포함5곳. 묘비/뿌리원화와주변스타일차이잔여.모듈20260927-36 |

## 65차 본편 경로 확인

본편경로route교체0,14카메라·임시24적전투,pageerror0/HTTP오류0/G.map동일true,visibleIds=drawnIds.요청48청크모두20260928-skin-65.지형·HTML회귀6PASS/0FAIL.master SHA256 2bfd8c4b9265d3d50ed10a583dd8fbe5cd65051880af93e4aa52dd7bff4813b8,30청크master crop픽셀동일/월드끝bleed복제확인.전체VISUAL VERDICT: RETOUCH.

65차코드·docs Git 체크포인트는실행기PowerShell프로세스생성오류(-1073283067)로미완료다.본편로컬파일반영/14카메라검수와구별하며외부push/deploy없음.소유80경로SHA256백업과공유main cache1줄patch는tmp/ch1-checkpoint65-owned.zip에보존.100미만변경수목표는미달이며실제에셋을숨기거나삭제하지않았다.

## Git 체크포인트 상태

Git쓰기승인후체크포인트실행을시도했으나승격실행기의WindowsApps pwsh프로세스생성317/-1073283067로시작되지않음.커밋/추가staging없음;자동승인리뷰거절아님.맵소유95파일+공유game맵분기2개·CHANGELOG맵이력은독립자료로보존.타작업staging2개유지;최종변경수는별도상태기록.코드+docs커밋필수단계미완료.


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.

### ROOT-CH1-1-THREE-TERRAIN-CONSUMER-20261007 — 2026-10-07 최초 연결 이력
2026-10-08 현행 샘플링: `ROOT-CH1-PAINTED-MAGNIFICATION-SHARPNESS-20261008`. 기존 CH1 main `ch1Three=1` 지면에 WebGL2 확대 RGB 보정0.35를 연결했다. 양축 texel footprint가 각각 `(0,1]`일 때만 적용하며, core 경계 거리0.5~1.5 texel에 smoothstep을 적용해 경계는 원래 sample을 유지한다. Linear/noMip/clamp/sRGB·alpha·1026² Image·UV·map/nav·소유 캐시 수명은 기존 계약을 유지한다. 아래 옛 핀·CPU/native 수치는 2026-10-07 이력이다. 신규 검수는 통제 THREE/DOM/renderer에서 실제 전체 JS 8그룹만 통과했으며 GLSL/GPU/실화면/성능/청취/save는 미검수다. 현행 정본: [CH1 확대 보정](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-painted-sharpness-20261008).


| 항목 | 현재 구현·정확 경계 |
|---|---|
| 소비 경로 | `game.html::_drawCh1StartOuter → _drawCh1ThreeTerrain → createCh1FieldTerrain().render`; 실제 `G.map/P/G.cam`을 표시용으로 읽는다. 별도 Rift/editor lab이 아니다. |
| 사용 범위 | hostname `127.0.0.1`/`localhost`, port `3387`, query `ch1Three=1`; stage0·비boss·`smoothing`·production root에서만. 기본 OFF, 다른 port/stage 불변. 검수 URL은 `classic=1&mapqa=1&ch1Three=1&webgpu=0`. |
| 지도·권한 | mw=mh200/T40/world8000²·기존53점/8구역 유지. main이 만든 맵/충돌/P/AI가 권한을 가진다. 새 renderer의 simulation/nav/save 쓰기0. |
| 투영 | local Three r160, orthographic50°/scale400. X=(x−4000)/400, Y=0, Z=(y−4000)/(400sin50°). near.1/far1000. 실제 높이0이며 baked 절벽 픽셀을 분리한 physical relief/3Dactor 구현0. |
| 소스·UV | 기존 ready Image1026²·bleed1/core1024를 world1000에 등록. UV1/1026..1025/1026, 4vertices/2triangles. 원PNG/scene/nav/배치·paint96/cache97·64청크/23레이어 유지. |
| 해상도·예산 | 논리 width/height≤4096, zoom.3..4, backingScale≤4. 출력 round(logical×min(2,backingScale)) 각1..4096, rendererpixelRatio1. DPR 재곱0. visible mesh/texture/geometry/material 각≤25, Linear/noMipmaps/clamp/sRGB. |
| 합성·캐시 | 완성 canvas를 `X.drawImage(canvas,left,top,width/zoom,height/zoom)`로 기존 world transform에 합성. cam/zoom/shake/SSAA 중복 적용0. 변경 frame만 `_glVer++`; 같은 view/map/image signature는 canvas재사용. 새 RAF/timer/Image 생성0. |
| 폴백 | cold/invalid/outside8000/25초과/backing초과/import실패/renderer실패는 기존 background 경로. Three `debug.onShaderError` flag와 contextlost/GLerror를 publish전에 검사. 부모 X의 GPU upload 예외는 기존 proxy가 숨겨 완전한 성공/폴백 보장은 UNKNOWN. |
| 순서·수명 | native actor→DS→Border 및 sway/face/hill/moat 순서 보존. 현재 visibleIds/drawnIds 갱신. map identity변경/suspend에서 own records해제, pagehide lateimport차단 및 `_freeMapTex`/dispose. 부분constructor/drop예외·물리GPU free·WebGPU해제 UNKNOWN. |
| 코드 핀 | 최종module7699B/`26d66ae478230e4d4a9a80d94a4a00586712580970f59f62ac2feed76e2301a9`; checkout game4052452B/`66d384052dc021a43792991fa9b36dee91cf16ca87e5639fc8d00917a10aa48b`. Git game은 HEAD+자기hook4052267B/`61325949fbf8a21563d107d1e2999dc3d4acf0eed18120231e810f400cbe69af`만. 기존 foreign185B차이 보존/채택0. |
| 신규 CPU | 최종module 실제전체 + 실제Three geometry/math + 통제renderer 최초1회:8그룹43조건PASS/FAIL0/미도달0/exit0/unhandled0. shader-only 통제callback 실패는 frame게시0·재render0; 실제GPU shader실패 관측 아님. |
| 신규 native | shader guard 전 module7559/d4856 source에서 Chrome1/3조건PASS. 실제 W로 P.y7420→7302.446200000009/map exact/GL0/pageerror0/HTTP오류0; readychunks2→4. 이후 geometry/mainhook 불변, guard만 최소보정; 최종guard 뒤 추가Chrome0. CPU와 합쳐 clean46PASS로 세지 않는다. |
| 안전·비용 | fresh context/기존3387만, 외부요청차단, `/api/mats` POST1은 route에서 차단/서버도달0. headless Three draw첫45.4ms/최종20.4ms는 관측값, 성능인수 아님. save/청취/실보상 조작0. |
| 판정·근거 | root PNG2직접판독. `VISUAL VERDICT: RETOUCH`. 시작금빛효과가 지면·캐릭터를 가리고 baked지면은 평면. 실제 높이·rig actor·전체route/전투획득/보스개방/사망부활/재도전·청취·save·A급 미인수. 근거 `ch1-1-2_5d-production-20261007/validation-receipt.json`3572B/`ce099bce7b4312690d31e78004b7b267fa9034e556866352527ed3d534faddee`. |

#### §23 MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE/MASTER PLAN | 실제 CH1-1/si0,200²/T40/world8000. 기존53점/8구역·시작(4020,7420)·출구(4020,300)·route/nav 보존. |
| LARGE OUTER MASS | 기존64baked청크 소비; 독립 수직 절벽 mesh/높이 미구현. |
| MEDIUM CONNECTION | 기존 연결·포켓 유지. 전체 route 재주행0. |
| GROUND CONNECTION | Three50°/height0/core1024→world1000 지면을 같은 main화면에 연결. |
| PLAYABLE/COMBAT | 실제 W이동·카메라 추적 확인. mapQA3조건이며 전투/loot/native6 인수0. |
| LANDMARK/CENTER·SMALL DETAIL | 배치/스케일/콜라이더/원PNG 수정0. |
| CAMERA QA | 시작·북쪽이동1280×720 PNG2 직접판독. 전체8view/대규모전투 카메라 미검수. |
| TECH QA | 최종CPU8그룹43조건PASS와 guard 전native3조건PASS는 별도epoch. 부분할당/부모GPU복사 예외/물리GPUfree UNKNOWN. |
| FILES/GIT | newmodule1+game자기hook+관련docs13. foreign game185B/WIP/ownerSTATELOG/protected2_3/기존23/save 보존. 정상commit/push·remoteexact은 완료영수증에서 별도확인. |
| VISUAL VERDICT | RETOUCH — 지면 연결만 확인. 평면 재질·높이·3D캐릭터·시작FX가림 미해결. |
| NEXT PASS | 실제 승인된1-1 outer mass/높이/foreground 계약 소비→main rig/발접지→SKILL/ENEMY/BOSS/UI/NPC/사운드 및 같은후보6단계. |


### ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007 — 본편 전사 표시 부분 연결

CH1-1 production smoothing의 전사 표시만 부분 채택한다. outer mass/geometry/collision/nav/원PNG 및 기존 stage 수치는 변경하지 않는다.

| 항목 | 현재 계약 |
|---|---|
| opt-in | localhost/127.0.0.1:3387, `ch1Three=1&ch1Rig=1` 동시 지정. 기본 OFF |
| scope | `_charIdx===0`, `G.on`, stage0, 비보스, production smoothing. `P.hp>0`/`P.s==='idle'`의 idle2/walk8/run8 |
| 방향/위상 | 실제 `P._sa.f`, phase=`(f+.5)/N`, 방향 `s,se,e,ne,n,nw,w,sw`. native 프레임 수/정수 f 불일치 시 기존 표시 |
| 발/크기 | 기존 X transform 안 로컬 `(-2,+22)`; 48px 셀 중심→catalog foot `(22,46)`, body-local reference32. 새 world 높이 아님 |
| 시간 | 같은 P/map/class/scope 및 현재·이전 frame의 Number.isSafeInteger 조건에서 dt=min(.05,delta(_gameFrame)*PHYS_STEP/1000), PHYS_STEP=1000/60. 초기/교체/비활성/paused/hidden은0. _gameTime 단독 증가를 소비하지 않고 draw에서 Rift/lesson guard를 재호출하지 않는다. |
| 고스트 | 같은 now/map/P/animator/class/generation/publication/canvasVersion의 canvas/rect/6원소 행렬 재사용. DS/Border 공유 1회, 추가 rig.update/render0 |
| 폴백/미채택 | adapter는 warrior/silvertail 및 attack 지원. main은 warrior idle/walk/run만 채택; 실버테일 보정 보류, 공격/사망/특수/로딩·실패는 기존 아틀라스 |
| 수명/예산 | 로컬 Three r160; 자체 RAF/시뮬레이션0; scope exit suspend, pagehide freeMapTex+dispose. maxBackingDimension2048, maxBackingScale4, maxDelta.05 |

현재 checkout game.html 4057058B/c0176bfa3f012187972b3b1b9170d44149f5afd21ffac81abf376fec6293b007; adapter 12712B/acc523025d9a56d5e777a2cf5b4145172d57b21ba7f35d4f5e535d4b19ebac0e. Git 소유 blob은 root 인계 4056873B/a291ee71f7b02e7b7dacd4045161ddcfb5b311fdd496c231f71b6f7d4ce845ce이며 checkout foreign185B를 전체 채택하지 않는다.

검수 epoch 분리: clock 보정 전 main d67cbeb3…의 새 Chrome/context/page 각1에서 native5조건 PASS/FAIL0/미도달0/exit0을 관측했다. actual idle→W/run, P.y7420→7346.907759999999, run f2/phase.3125/direction4, actor canvas53×53/alpha>16픽셀356/bbox(18,6)…(37,36)/GL0, 같은 map/source7핀, trusted pagehide rig/renderer dispose각1. `ghostFrames=0`이므로 실제 DS 가림 인수는 미완료다. native6/audio/save0. 시작 금빛 FX로 몸·발이 가려 현재 VISUAL VERDICT: RETOUCH. 이 관측을 최종 clock 코드의 native 재검수로 재사용하지 않는다.

CPU 이력은 합산하지 않는다. 초기 adapter3그룹13조건 PASS 후 G04 maxX 단독 변형 오라클 FAIL1/8그룹 미도달/exit1을 보존했다. root 보고의 별도 오라클 정정 limited9그룹48조건 PASS는 통제 rig CPU이며 실제 factory/GPU와 구분한다. active-tick clock의 2c90 원본은7그룹37조건 PASS 후 previous.frame=100.5→101 경계 FAIL1/잔여4조건 미도달을 보존했다. 현재 c017의 previous.frame safe-integer guard 후 별도 제한 후속은 새 실패조건+잔여4조건, 총5조건 PASS/FAIL0/미도달0/exit0이다. 앞선37PASS를 반복·합산하지 않았다. root clock-guard-limited-receipt.json5067B/4aaec9d44c8864842fb5269cf3f2408dc52c102b6dc1d7a1de997cd4d179b72d를 근거로 하며 clock 보정 후 Chrome 추가0이다.

MAP PRODUCTION REPORT (표시 소비자 부분): STAGE CH1-1/main warrior opt-in; guidev0.9/SSOT 기존 LOCK 준수. LARGE OUTER MASS/MEDIUM/GROUND/geometry/collision/nav/원PNG 변경0. PLAYABLE/COMBAT은 실제 idle/W 부분 이동만 관측; 보스/획득/사망·부활/재도전 미인수. LANDMARK/DETAIL 변경0. CAMERA QA는 전체8방향·가림 미완료; TECH QA는 각 epoch CPU/native 범위를 위와 같이 분리. OWNERSHIP root main+adapter+정본; 3.3 foreign WIP는 partial-stage inverse 필요. VISUAL VERDICT: RETOUCH. NEXT: 최종 clock 제한 검수, 실제 발/전경 및 같은 후보의 전투→획득→보스개방→사망/부활→재도전 인수.

### ROOT-CH1-1-WARRIOR-STRIKE-RIG-20261007 — 본편 전사 LMB 베기 표시 부분 연결

CH1-1 production smoothing의 전사 opt-in에서 LMB-origin wSwing/atk2 본체만 추가 연결한다. 기존 outer mass/ground/nav/카메라/랜드마크 및 stage 수치는 변경하지 않는다.

정확한 origin·atlas gate·셀·phase·anchor·미채택 상태는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 sparse guard의 새 한정 CPU는 6조건 PASS/FAIL0/미도달0/exit0이며 최초 공격 CPU100PASS·1FAIL은 별도 보존한다. root가 인계한 동일2a052 소스의 새 main native는 Chrome/context/page 각1, 실제 LMB east/index2의4조건 PASS/FAIL0/미도달0/exit0이다. 실제 atk2 f2/phase2.5÷9/609vertices/canvas85×85/alpha>16픽셀581/GL0, 현재 owned LMB-origin1을 관측했고 wRecover에서 bodyCurrent=false, idle 복귀 owner=null을 관측했다. pageerror/httpfailure0 및 POSTmats1 차단/서버도달0이다. W setup1300ms 입력 중 xy4020,7420이 변하지 않아 이동 성공을 주장하지 않는다. root PNG 직접 판독은 main 시작 금빛FX가 몸·발을 가리고 격리 공격 그림은 보이는 상태다. VISUAL VERDICT: RETOUCH. 실제 발·native8방향·회수 rig·DS ghost·native6·audio·save는 미인수다. 이전 idle/W native5 및 clock5 CPU와 합산하지 않는다.

MAP PRODUCTION REPORT (§23): STAGE=CH1-1/main warrior opt-in 표시 부분. MASTER/OUTER/MEDIUM/GROUND/LANDMARK/DETAIL 변경0. PLAYABLE/COMBAT=실제 기본LMB east1방향의4조건 부분 PASS이며 전체 전투 인수 미완료. CAMERA/TECH=최종 sparse 한정 CPU6조건 PASS(전체 원검수와 별도), 발·전체8방향·가림 미인수. FILES=root main hook+관련 현재docs, owner/protected WIP 보존. VISUAL VERDICT: RETOUCH. NEXT=동일 후보의 발 투영/가림 및 전투→획득→보스개방→사망/부활/재도전 검수.

최초 공격 CPU는 2a052 epoch에서9그룹 도달/8그룹 완료/100조건 PASS·1FAIL/exit1이었다. native.every가 sparse hole(index8)을 건너뛰어 잘못된 배열을 허용한 반례를 원 result.json에 동결했다. 최종8a4e 소스는 i0…8 직접 for-loop와 Object.hasOwn(native,i)로 각 셀의 실재 own index를 요구한다. 최초100PASS를 재실행하지 않은 sparse 한정 후속은 6조건 PASS/FAIL0/미도달0/exit0이다. hole8·hole0·hole4·inherited-only4·own undefined8은 렌더0으로 차단했고 dense 대표 n/f4는 phase.5/anchor(0,18)/단회 렌더를 유지했다. 앞선 native4PASS는 2a052 소스의 결과이며 최종 own-index guard의 native 검수는 미실행/추가Chrome0이다. clean 전체 PASS로 합산하지 않는다.

검수 원문은 외부 ch1-main-warrior-attack-20261007/validation-receipt.json에 epoch별로 보존한다. 최종 game SHA는 8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2, sparse 한정 원문은 9440B/637d3d33c0c3d861c3902f3da808ca07d5ffa1e8c588beefde14c4b9dcdc9f7a이다. docs 전체 무제외 관련 검색45경로 중 현재정본13을 동기화하고 역사·타모드·owner WIP·보호2_3의32경로는 그대로 보존했다.

### ROOT-CH1-NATURAL-SPAWN-VISIBILITY-20261007 — 최종 소스의 새 실화면 관측

앞선 2a052 공격4조건/금빛FX 가림과 별개로, 최종 game4058588B/8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2에서 새1Chrome/context/page·3조건 PASS/FAIL0/미도달0/exit0을 관측했다. 기존 공격4조건·CPU100PASS1FAIL·sparse 한정6PASS를 재실행하거나 합산하지 않았다.

실제 LMB 후 W 입력 동안 document focus=true/BODY, BINDS.up=KeyW, trusted keydown/up, K/KH=true→false, frame57→137을 기록했고 P.y7420→7200.653340000013으로 이동했다. 이번 관측은 정상 이동의 한 사례이며 이전 W 무이동 원인은 여전히 UNKNOWN이다. G._bonfire.t243→0/frame57→300의 자연 종료를 기다렸으며 FX·시간·위치 강제 변경0이다. 최종 own-index guard의 정상 dense 공격 한 장면도 본편에서 도달했다. sparse/inherited 음수 경계는 CPU6조건 범위다.

root가 자연 종료 후 idle/strike PNG2를 직접 판독했다. 전사의 몸과 하단 다리·발 주변은 해당 pose에서 식별되나 평면 baked 지면·공격FX/인접 적 가림은 남는다. VISUAL VERDICT: RETOUCH. 전체 동작의 해부학적 접지·8방향·회수 rig·DS ghost·실높이·같은후보 native6·청취·실보상save·A급 인수는 미완료다. 원 source/PNG/scene/nav/세이브는 보존했고 POSTmats1은 서버 도달 전에 차단했다.

외부 원문: ch1-main-warrior-attack-20261007/natural-visibility/result.json36127B/287d70769f01f02651e9aec4a4b2911a03f6898c1125fa05649376b29acd3f53. 이 별도 관측은 기존 코드 완료18cc60d5806c8e82c0295e1bdbbb50ba89d00278에 대한 추가 증거이며 새 제품 코드 변경0이다.

MAP PRODUCTION REPORT (§23): STAGE=CH1-1/main warrior. MASTER/OUTER/LARGE/MEDIUM/GROUND/LANDMARK/DETAIL 변경0. PLAYABLE=실W 및 자연 종료 후 LMB 관측 한정. CAMERA=idle/strike2 PNG 직접 판독·RETOUCH. TECH=새3조건PASS/old suite반복0. FILES=관련 docs만13, source 변경0. NEXT=회수동작 연속성·전경/절벽 재질·본편6단계 인수.


### ROOT-CH1-LMB-RECOVERY-RIG-20261007 — 정상 LMB에서 승계한 회수 본체 표시

기존 CH1-1 production smoothing의 전사 opt-in에서 정상 LMB-origin 회수만 추가 연결한다. stage 수치/맵 제작/physics는 변경하지 않는다.

정확한 owner phase/정상 전이 승계/특수·acceptedQ revoke/atk3 gate/회수 counter는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

이번 source523a recovery CPU는 실제 main 함수/전이/Q 취소와 통제 animator·side-effect port를 소비한 최초1회6그룹42복합조건 PASS42/FAIL0/미도달0/setup0/exit0다. finisher는 revoke 전이 prefix만 실행했고 실제 PNG/renderer/GPU/save는0이다. 별도 신규 native는 같은 최종 source의 실제 본편 Chrome/context/page 각1회,3조건 PASS3/FAIL0/미도달0/exit0다. 실제 LMB→wRecover/atk3 f6→7→8·phase6.5/9→7.5/9→8.5/9·owner recovery·609정점·heightLocal32·alpha>16 579픽셀·GL0와 실제 idle 복귀/owner null을 관측했다. source8/같은 map exact, pageerror/HTTP실패0, POST /api/mats1은 서버 도달 전 차단, 사용자 save 조작0·owned browser 닫힘이다. CPU42와 native3 및 기존 carry25/strike4/과거 FAIL·한정 결과를 합산하거나 재실행하지 않는다. root PNG2 직접판독은 현 east pose의 회수 몸 표시/대기 복귀만 한정 인수했다. 검기FX 몸·발 부근 가림, 회색 평면 baked 지면/배경 확대 흐림이 남으므로 VISUAL VERDICT: RETOUCH다. 해부학 발/8방향/실DS ghost/높이/전체 native6/청취/실보상save/A급은 미인수다. 근거: 외부 recovery/validation-receipt.json2702B/4fc6af74bf6ffae5140d9e1648937093cf2741735f994baaf7ab82f79daea9c2, cpu-receipt.json9965B/50b6e6e80c21ef3595cc6ab9afec37e07e9db3831eef9352c9bebb47a47723c6, native-result.json102950B/26a12f81168296c6b9b5130a69180c46f17a0b78f3e1083aa6765b97b84d09de, visual-verdict.json2514B/c78360ecf19835709c4f87d3d683c77d88b2632d3b93c9b44507ac2398a3ec91.

MAP PRODUCTION REPORT (§23)
STAGE: CH1-1/main 전사 정상 LMB 회수 표시 부분.
MASTER PLAN: 기존 guidev0.9/현재 stage LOCK·SSOT 순서 보존.
LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION: geometry/nav/충돌/원PNG/지면 수치 변경0.
PLAYABLE / COMBAT: 기존 정상 wSwing→wRecover 표시 승계만 연결. 전투 판정/소모/시간 변경0, 새 실제 LMB→회수→대기 한 방향 표시만 관측; 전체 자연 전투/보상은 미인수.
LANDMARK / CENTER / SMALL DETAIL: 배치·맵 디테일 변경0.
CAMERA QA: 새 회수8방향·발/가림 미인수.
TECH QA: 새 recovery CPU6그룹42조건PASS와 별도 actual main native1Chrome/3조건PASS, 모두FAIL·미도달0; 이전 검수 숫자 재집계0.
FILES / GIT: root 소유 game hook+관련 현재docs만, foreign185B/3.3 사용자 WIP 및 owner/보호 문서 보존.
VISUAL VERDICT: RETOUCH — 현 east 회수 몸/대기 복귀 표시만 관측; 검기FX 가림·배경 확대 흐림·평면 재질 남음.
NEXT PASS: 실버테일 packed frame 연결·다크드루이드 body seam·발/가림/지형 입체감 및 전체 전투→획득→보스개방→사망/부활→재도전 인수. 통과한 새 회수 검사 반복0.


### ROOT-CH1-SILVERTAIL-PACKED-MAIN-20261007 — 실버테일 본편 packed 대기·보행 표시

이 절은 이전 warrior/strike/recovery 및 public1254 고해상도 시험 epoch 뒤의 새 본편 소비 범위다. 이전 소스 핀·검사·실버테일 채택 보류 기록은 당시 결과로 보존하고, 현행 main packed 소비에는 이 절을 우선한다.

class1 localhost/127.0.0.1:3387의 명시 ch1Three=1&ch1Rig=1(기본OFF), P.hp>0/P.s=idle/stage0·비보스·production smoothing에서만 실제 최종 native idle2/walk4/run4 48×48 셀을 빌려 표시한다.

정확한 optional API·세 소스 핀·공통 경계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

MAP PRODUCTION REPORT (§23)

| 항목 | 현재 보고 |
|---|---|
| STAGE / INTENT | CH1-1 actual main 실버테일 packed 대기·보행 표시. 기존48²·N2/4/4·actualf·reference45·X0,23 |
| MASTER / LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION | 기존 맵 제작 순서/LOCK 및 geometry/nav/배치 변경0 |
| PLAYABLE/COMBAT / LANDMARK/CENTER / SMALL DETAIL | 권위 P/map/native animator 표시만, 전투/시간/자원·landmark/detail 변경0 |
| CAMERA QA / TECH QA | 새 main15/combined한정39/native3 별도 결과; 최초실패/최종pageError1 보존, 기존 parent .65/_pScale·camera 재사용은 source 계약만 |
| FILES / PRESERVATION | root 소유3source+관련 current13 docs 계획. game foreign185B·3.3 foreign WIP·protected2_3·원PNG/세이브 보존 |
| GIT / RELEASE | root 완료소유 checkpoint 예정; child Git/배포0 |
| VISUAL VERDICT | root PNG2 몸/이동 한정 / 전체 RETOUCH. CPU/소스 구현을 visual PASS로 대체0 |
| NEXT PASS | 새 class1 실제8방향·접지/가림·나머지 native 인수, 공격/특수/사망 fallback 및 전체 gameplay 인수 |

최종 source의 새 main currentness CPU3그룹15조건 PASS와 actual factory/adapter 한정 CPU9그룹39조건 PASS는 별도 epoch다. 첫 실제 main native Chrome/context/page 각1의3조건 PASS 및 trusted W 이동/대기복귀를 관측했다. 최초 CPU 오라클FAIL2개 이력과 최종 pageErrors SecurityError1을 보존하므로 전체 clean PASS로 합산하지 않는다. 이 오류는 main3check 뒤 about:blank와 무조건 classseed localStorage source상 하니스 cleanup으로 추정되지만 직접 stack/시점 귀속은 미관측이다. root PNG2 직접 판독은 몸 표시/이동만 한정 인수, 전체 VISUAL VERDICT: RETOUCH. 실제 클래스선택 UI·해부학적 발·8방향·공격/특수/사망 rig·live DS ghost·전체 native6·청취·실보상save ACK/A급은 미인수다.

최초 main VM은6그룹 중52조건 PASS 뒤 P4scope의 suspend1 기대 오라클FAIL1/후속P5·P6 두그룹 미도달/exit1이었다. 실제제품의 packed retire와 기존scope fence가 idempotent suspend2를 호출하므로 오라클한정 expected2로 정정; 별도P4/P5/P6의3그룹6조건 PASS/FAIL0/미도달0/exit0. 원52재실행0·clean58합산0·이 오라클로 인한제품수정0. 이후 읽기에서 발견한 별도currentness 접점을 최종main/adapter에서 보강했다.


| 최종 currentness 보강 | 정확 범위 |
|---|---|
| adapter live native | 같은 animator여도 own anim/f, fm의mode_direction 배열 identity/정확 count/선택 cell identity와 own crop x/y/w/h가 captured source와 같아야 publication/render를 유지 |
| main live frame | _ch1RigPackedFrameCurrent가 현재 P/map/atlas/animator와 native direction/mode/f·배열/count·selectedcell/crop을 확인. snapshot/publication을 parent blit 앞에서 검증 |
| ghost | packedOwner+packedCapture를 가진 class1 sameframe ghost는 adapter snapshot 전후 live frame 현재성을 모두 확인. 기존 canvas/matrix 단회 재사용 |
| blit 이후 | 이미 완료한 synchronous drawImage 뒤 scope/프레임 변화는 ghost publication만 retire하고 returntrue하여 legacy 본체 중복 draw를 요청하지 않음. 완료 pixel rollback이나 parent silent GPU upload 검증은 UNKNOWN |

최초 main CPU52PASS·오라클FAIL1 및 별도limited6PASS는 보강 전325e/bc6f/e1f1 epoch 이력이다. 최종525d/8de8 소스의 새 guard/combinedCPU/native 결과와 합산하거나 최초실패를 지우지 않는다. 최종 검수는 아래 별도 epoch 결과로만 인수한다.


| 새 검수 epoch | 정확 결과 / 한계 |
|---|---|
| 초기 e1f1 main VM | 6그룹 중52조건 PASS 뒤 P4scope suspend1 기대 오라클FAIL1, P5/P6 두그룹 미도달,exit1. 실제 idempotent suspend2이므로 오라클정정·제품변경0 |
| 이전 main 한정 | P4scope expected2 및 최초미도달 P5/P6만3그룹6조건 PASS/FAIL0/미도달0/exit0, 원52 재실행0/clean58합산0 |
| 최종525d main guard | 새 currentness3그룹15조건 PASS/FAIL0/미도달0/exit0. 앞선main 숫자와 별도 |
| 최종 combined 최초 | actual factory+adapter+catalog+Three11그룹 중2PASS/1FAIL/8미도달,12조건 PASS1FAIL/exit1. descriptor.direction1/update.direction1을동시에준 방향 오라클 오류, 제품변경0 |
| combined 한정 | descriptor1/update0 한 조건+최초미도달만9그룹39조건 PASS/FAIL0/미도달0/setup0/unhandled0/cleanup0/exit0. 609mesh/Three수학·통제renderer/Canvas·IHDR Image, 실제RGBAdecode/GPUupload0. 원12반복0/clean51합산0 |
| 실제main 최초 native | Chrome1/context1/page1·3조건 PASS/FAIL0/미도달0/exit0. borrowed atlas480×1136→48²셀/609정점. idle direction7(SW) alpha>16=758/GL0,run direction4(N) alpha>16=580/GL0 |
| 정상 입력/설정 경계 | trusted KeyW down/up BODY, P.y7420→7336.933640000013→idle복귀. fresh isolated localStorage classseed1 사용, 실제 class선택UI 인수0. source6/mapexact, POSTmats1 서버도달전차단/user-save0 |
| native 종료 오류 별도 | main 체크시pageerrors0, 최종pageErrors에localStorage SecurityError1. 3maincheck 뒤about:blank와source의무조건classseed localStorage상하니스cleanup추정이며직접stack/시점귀속未관측. 제품원인확정0·재시도/제품변경0. pagehide disposecounts 미관측·ownedbrowserclosed. exit0을전체browsercleanPASS로승격0 |
| root PNG2/시각 | idle-main/run-main 직접판독:실버테일몸표시/이동한정. 회색평면지면·확대배경흐림·인접FX·작고어두운실루엣이남아 VISUAL VERDICT: RETOUCH. anatomicalfoot/8dir/공격특수사망/liveDSghost/실높이/전체native6/audio/save未인수 |

원자료는 동일 외부 silvertail-packed-main/validation-receipt.json4269B/f1ac0c5fc524bb218c1f3177a2a94de27ec8452889bdd734091001b4b05b9d8b, native-result.json108953B/5483e67a4b01b5f934041e8122d7a290d53ef660c27ccd3961ea89055f771143, visual-verdict.json2319B/0df7fb371ebf9a2bb5ea6ae3ef9c52cdb5e08c8f797fa78dca3b5ae30f66ac3e다. 이전 recovery42/native3/carry25/oldUV와 새 epoch를 재집계·재실행하지 않는다.


## 2026-10-07 다크드루이드 NORMAL 본체 borrowedSheet 소비 — ROOT-CH1-DRUID-NORMAL-MAIN-20261007

이번 패스는 CH1 보스 NORMAL 본체의 표시 접점이다. 지도 geometry/outermass/ground/nav/충돌/랜드마크/카메라를 새로 만들거나 수정하지 않았다. 이를 새 맵 제작/완주 PASS로 계산하지 않는다.

상세 API·source3 전체 핀·검수 epoch와 한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다. §23 보고의 미검수 항목은 아래처럼 그대로 남긴다.

| 최종 복수보스 guard | 현재 실제 제한 |
|---|---|
| `_ch1DruidSingleBoss()` | ens의 own-data `ib===true` 멤버가2개 이상이면 Druid rig scope 전체를 거부해 해당 보스 본체를 모두 legacy로 유지한다. 한 보스만 임의 우선 표시하지 않으며 다른 player/terrain adapter의 gate를 바꾸지 않는다 |
| count 경계 | 살아 있는 보스만 세지 않는다. dead/revive pending companion도 ens에 남은 ib 멤버이면 계속 거부; 제거 후에만 단일 scope 재진입 가능. ib가 아닌 일반몹은 count에서 제외 |
| 원인/보존 | 공용 HTMLImage lease의 복수 owner starvation과 단일 Druid adapter 공유를 코드 검토로 확인해 최소범위 제한. 여러 보스 rig 동시 지원은 미구현/미인수이며 기존 전투·생성·부활·ens 구성 변경0 |

| 검수 epoch | 실제 결과와 한계 |
|---|---|
| factory 새 CPU | 최종 factory c6dd source의 실제 factory/catalog/Three 수학·609정점/12본, 통제 HTMLImageElement getter. 최초1회 7그룹36조건 PASS, FAIL/미도달/setup/unhandled/cleanup0, exit0. native image/decode/PNG/GPU/main0 |
| combined adapter 새 CPU | 최종 modules c6dd/27dd의 실제 전체 factory+adapter/catalog/Three와 통제 Image/renderer. 최초1회 6그룹15조건 PASS, FAIL/미도달/setup/unhandled0, exit0; source4 전후 exact. GPU/PNGdecode/main0 |
| main 최초 guards CPU | b0c3 source의 실제 main 함수·원 pagehide statement 추출/통제 포트. 최초 Node1회/VM13개, 11그룹31조건 PASS, FAIL/미도달/unhandled0, exit0; game 전후 exact. 최종 복수보스 가드 이전이며 구31 재실행0 |
| native 최초1회 — 가드 전 | b0c3 source 실제 Chrome1/context1/page1의 기존 bosstest=0 testbed. 3조건 PASS, FAIL/미도달0, exit0. real HTMLImage/native decode2·ready2·failure0, idle base8와 normal attack887×1774·609정점/alpha127095·206083/GL0. pageerror/HTTP4040, POSTmats1 서버 도달 전 차단/user-save0. 실제walk0 |
| 최종 복수보스 한정 CPU | dd1d 최종 source의 실제 main 함수/통제 포트, Node1회4조건 PASS, FAIL/미도달0, exit0/source exact. 단일보스 admission,두보스 legacy,owner/observer revoke,pending companion·nonboss 경계만. 구31/native3 재실행0/추가Chrome0 |
| root PNG2 / 시각 | 가드 전 idle-main/resumed-main 직접판독: 정상 idle/attack 본체만 확인. 보스상단 camera 잘림·player/label/FX 겹침·평면 baked ground가 남아 VISUAL VERDICT: RETOUCH |

factory36/combined15/main31/native3/final-limited4를 하나의 clean 전체 PASS로 합산하지 않는다. native3와 시각은 b0c3 이전 source의 한정 증거이고 최종 dd1d source의 native 인수는0이다. 기존 bosstest=0에는 player boost/pillar removal 원동작이 내장되어 있어 정상 새게임→지역/게이트/보스전 전체 진행 인수0이다. 이전 warrior/strike/recovery/Silvertail CPU·native·실패·limited/cleanup epoch도 재실행·합산하지 않는다. 실제walk/native8방향·해부학발·DSghost·특수/사망·부활·보상/저장/audio·전체 본편/native6·물리 relief/full3D는 미인수다.

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1 stage0; production_finish/smoothing; field200x200 / bossarena128x108
MASTER
- silhouette: 기존 권위 보존; 새 구조 인수0
- regions: 기존 권위 보존; 새 지역 진척 인수0
- main route: 변경0; 이번 재검수0
- side spaces: 변경0; 이번 재검수0
OUTER MASS
- LEFT: 변경0
- RIGHT: 변경0
- TOP: 변경0
- SOUTH: 변경0
- major holes: 새 판정0
LARGE
- source assets: 기존 dark-druid native sheets만 borrowed; 신규 원화0
- composites: 기존 body source-over + lighter2; 같은 rig canvas 재사용
- overlap: 새로운 환경 배치0; b0c3 native에서 player/label/FX 겹침·보스상단잘림 관측/RETOUCH
- repeated silhouette: 새 제작/인수0
MEDIUM
- connections: 변경0
- remaining holes: 새 판정0
GROUND
- shadow: 변경0; 새 발접지 검수0
- contamination: 변경0
- structure integration: 변경0
PLAYABLE
- main arenas: 기존 bosstest=0 실제128x108 testbed;내장playerboost/pillarremoval,정상전투진행 인수0
- travel space: 변경0; 새 이동/경로 완주 검수0
- breathing space: 변경0
- threat space: b0c3 실제 pause/resume 뒤 bossSlashWind normal attack 표시;AI/피해/시간 변경0
- combat readability: b0c3 root PNG2에서 camera상단잘림/FX겹침·평면ground RETOUCH; 최종dd1d native0
LANDMARK
- primary: 변경0
- secondary: 변경0
- tertiary: 변경0
CAMERA QA
- START: 새 관측0
- EARLY: 새 관측0
- ARENA: b0c3 native idle/attack 촬영·보스상단잘림/RETOUCH;최종dd1d native0
- SIDE L: 새 관측0
- SIDE R: 새 관측0
- LANDMARK: 새 관측0
- LATE: 새 관측0
- EXIT: 새 관측0
TECH QA
- route: 변경/재검수0
- collision: 변경/재검수0
- pageerror: b0c3 native0;최종dd1d 추가Chrome0/미인수
- 404: b0c3 native0;최종dd1d 추가Chrome0/미인수
- seam: factory7/36·combined6/15·b0c3 main11/31·native3·dd1d limited4 별도PASS,clean합산0
- loading: b0c3 actual native decode2 ready2 failure0/실HTMLImage;최종dd1d guard CPU4만
- performance: bounded backing2048/scale4/dt.05; 실제 FPS/프레임시간 인수0
FILES
- stage-owned: game.html; character-rigs.mjs; ch1-player-rig.mjs; current13 docs append
- concurrent touched: game foreign185B/3.3 foreign 보존; root HEAD+own append partialstage
- unrelated touched: 0; protected2_3/owner STATE/LOG/TASK 변경0
GIT
- staged: root completed-own code3+docs13 부분stage 예정;foreignWIP는 unstaged로 보존
- commit: 이 completion 정상commit; exact SHA는 외부 remote-preservation-receipt.json 참조
- push: 현재checkpoint 전 계획; 완료후 외부 remote-preservation-receipt.json의 remote exact 참조
- deploy: 0
VISUAL VERDICT: RETOUCH
NEXT PASS: camera상단잘림/FX·라벨겹침·평면ground RETOUCH;walk/8dir/foot·전투/부활/특수사망/전체게임 별도 미인수
```

최종 근거는 외부 `druid-normal-main/validation-receipt.json`5368B/`dfdda24546843f67e2aff44b71d2770a46de4267a8aa29ef1089815c758fe5e1`, `visual-verdict.json`5420B/`3f6dcc7818ffe5e7d9a110d60d3baf62e995edb8129e3aae59b55e45cd161460`, `native-result.json`56979B/`70a55e20696a1b7fd4fd0ac8a5e8cea2204d5e8463622dc44de7893828ef1c92`, `multi-boss-limited-result.json`1043B/`88dc0a15ef1278ac3e25d4032cecb8ea695d69f7ff0f12ff30bfc3d9ff34171c`다. 최초main31/native3는 b0c3,최종한정4는 dd1d로 분리한다.

외부 `druid-normal-main/remote-preservation-receipt.json`는 root가 이 completion의 정상 commit/push 뒤 exact SHA·remote를 기록하는 보존 참조다. 정본문서에 자기 commitSHA를 순환 기입하지 않으며 이 참조를 현재 push 완료로 미리 주장하지 않는다.


## 2026-10-07 CH1 드루이드 단일보스 카메라 Y 프레이밍 — ROOT-CH1-BOSS-CAMERA-Y-FRAMING-20261007

production_finish LOCK의 맵 크기·좌표·통로·collision·outer mass를 유지한 카메라 소비 변경이다. 사용자 최신 지시/stage LOCK 값이 우선이며 가이드가 수치를 덮어쓰지 않는다.

현행 `game.html` working은 4,082,515B / `a2fa7293ab4b14041d2d512fe7661f7b4d645f50985f6264f32c4bd15004fad2`, root owned HEAD+변경 blob은 4,082,330B / `2abd290f0deb4cb9fb0559b41d9925fdddb73e3c414c07b0a0a175a1c7cd16db`다. shared game의 타인 WIP185B를 그대로 보존한다. 이번 변경은 카메라 targetY 한 접점이며 기존 보스 시트·rig factory/adapter·원본 이미지·AI·충돌·전투·저장 수치를 바꾸지 않는다.

| 경계 | 현재 계약 |
|---|---|
| opt-in | `localhost`/`127.0.0.1`:3387의 명시적 `ch1Three=1&ch1Rig=1`; 기본 OFF, storage/schema 추가0 |
| 본편 범위 | 기존 `_ch1DruidScope()`의 stage0·smoothing·production_finish 범위 안에서 editor 아님, `G.on`, `_bossArena===true`, 현재 ens에 속한 단일 보스, NORMAL intent와 native animation/image/sheet ready일 때만 적용 |
| 시트 | slash/slam/windup 또는 DruidVolleyWind/Volley는 attack, walk는 walk, 나머지는 base8. 기존 선택 시트 ready 필요, 새 프레임 시계0 |
| 유지 | 기존 targetX, boss zoom0.80/일반1.0, dt 보간→정수화→최종 map clamp 순서 |
| 폴백 | field·si3/finale·특수 intent·dead/revive pending·복수 보스·no-opt-in·editor·소스 미준비·유효하지 않은 경계는 기존 targetY 유지 |
| 한계 | authored 본체 사각형+P.r 충돌원만 고려. 실제 alpha/플레이어 sprite/label/FX 또는 첫 보간 프레임 fit을 보장하지 않음 |

정확 수식은 `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`의 같은 unit 절을 따른다. 다음 zoom의 authored 본체+P.r 교집합에서 `_loInteger=ceil(lo)`/`_hiInteger=floor(hi)`를 만들고 finite·양수/`0<camSpd<=1`·가로 폭 fit·`loInteger<=hiInteger`일 때만 `round(targetY)`를 이 정수 구간에 clamp하고 `_ch1CamFitY=true`로 둔다. 원래 camSpd로 Y 보간한 뒤 이 flag에서만 이전Y<targetY이면 ceil, 그 외 floor로 정수화해 target 방향의 subpixel 진행 소실을 막는다. 범위 밖·invalid·zero·정수 구간 없음은 기존 `~~`가 그대로다. 부모 translation, base8 호흡 `abs(parentMul)*2`, intro 위/아래 각 `VH*.1` 예약을 반영하고 기존 targetX·zoom0.80·보간→정수화→map clamp 순서·rig calibration·맵 LOCK은 유지한다. 새 G 상태는 추가하지 않는다.

| 검수 epoch | 실제 결과와 인수 경계 |
|---|---|
| 최초044b CPU | 최초 Node1/VM60, 7그룹36조건 PASS/FAIL0/미도달0/exit0. 이 중 한계 관측은 PASS라는 이름으로 결함을 숨기지 않음: south130 상승 정착 bottom650.4 vs intro 가용하단648, 2.4CSS clip 반례를 발견 |
| 최초044b 미인수 | 첫 보간 screenTop−166.8352 vs intro72로 238.8352CSS 침범, 초기 zoom .988의 불가능 fit도 관측. 첫 보간/zoom 진입은 최종 directional rounding 이후에도 별도 미인수 |
| 철회된2306 CPU | 최초 한정1회 PASS0/FAIL1/미도달4그룹. `1/camSpd` 여유가 intro 허용 밴드보다 커 raw midpoint fallback, top−134.8352 관측. `ceil(lo+1/camSpd)`는 현재 계약에서 철회했으며 실패 원문 보존 |
| 최종a2fa CPU | 현재a2fa source의 최초 한정 Node1/VM53, 6그룹14복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 명시30case의 방향 정수화/정착 경계만 검증; south130 양방향 cam1954에서 top72.3648/bottom640.8, 단일 정수 band1954에서는 bottom648. universal/all-frame/actual alpha fit 인수0, 원36조건 재실행0 |
| 최초044b native | Chrome/context/page 각1, 기존 bosstest0 1280×720→1600×900 resize 2조건 PASS/FAIL0/미도달0/exit0; GL0·source5 exact·pageerror/HTTP failure0. 최종 directional rounding 전 이력이며 final native로 재사용하지 않음 |
| 최초044b 관측 | authored body+P.r snapshot 첫 screenTop81.8868/bottom591.0075, 둘째9.27929/518.39929, zoom 약.8000000034. rig quadTop80.5632/11.2104는 별도 read 시점 기하, PNG 동일 drawframe 인수0 |
| 최종a2fa native | 현재a2fa source의 최초 Chrome/context/page 각1, capture fit 1조건 PASS/FAIL0/미도달0/exit0, GL0/pageerror·HTTP failure0/source5 exact. trusted S 직후 delta130.0755였으나 90frame 뒤 보스가 약108 이동하여 capture delta54.5188; 고정 south130 native 인수0. 최종 authored top75.836074/bottom584.956853, rig quadTop73.97527은 capture 시점 관측만. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘; physical GPU 해제 UNKNOWN |
| 직접 PNG 이력 | 최초 PNG2에서 큰 머리 잘림 개선·본체 식별, 둘째 뿔 상단 가장자리 가까움. label/FX/플레이어 겹침·반복 어두운 baked 지면으로 전체 VISUAL VERDICT: RETOUCH. 첫 PNG intro 검정 bar와 snapshot active=false 시점차 미해결 |
| 최종 직접 PNG 판독 | root가 현재 capture PNG를 직접 확인: full antler/body 식별, 아래 player/green FX 겹침·반복 baked 지면이 남아 RETOUCH. state bar0인데 PNG 검정 bar가 남아 intro draw/state 정렬은 UNKNOWN |
| 미인수 | 고정 south130 native, 완전 alpha/전방향 fit, 첫 보간/zoom 진입, normal route, 모든 resize, anatomical foot, native6/audio/reward/save, 전체 성능 |
| fixture | 기존 bosstest0 playerboost/pillar removal 포함. 정상 진행의 보스 진입 인수0. CPU/native/visual epoch별 별도 계수, clean 합산0 |

외부 증거 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-boss-camera-20261007/`. 최초 `camera-cpu-final-receipt.json` 8,969B / `d68d0679bb77ed45769cf87bfe128525fe10e788ef075faefc1b1acf0eafd35c`, 원결과 `camera-cpu-result.json` 31,138B / `0f862be1ba96ec337b9e052e15995a8afd7427ee896eec0da67ea20151a37dd9`, 최초 native `native-result.json` 8,562B / `c92d3982da42549996f0c261bacf1cd1a91911d7f72b17a485ebeddfea36cc50`는 보정 전044b epoch다. 철회된 중간 코드의 `quantization-implementation-receipt.json` 1,689B / `d5683e0a66d7f33cf4ef32b65863c13270e1927d049cd70bd86c418d107c4ae5`에 inverse exact/foreign185 보존이 기록된다. 해당 `camera-quantization-limited-receipt.json`은 1,660B / `88d4179ca7739f7f5aca088ad3dc302175c2b2328ebd9a30f4f700fd0c9b580e`다. 현재 최종 `directional-round-implementation-receipt.json` 2,666B / `d1ff0383c339fc0cb1ef4610ca959a8f941332a4c0e82c4725e555815080197d`의 rs3/inverse exact/foreign185 보존을 따른다. 최초 visual `visual-verdict.json` 4,437B / `c8767f12ab4d3c5ca4ab4e2d22522ad506f04db450ba8326000779e064a96626`와 최종 검수는 epoch를 분리한다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA로 확정하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 관측 당시 checkpoint 전이며 deploy0이다.

최종 증거는 `camera-directional-limited-receipt.json` 1,194B / `ca55b57abcb6ca8dac42b1095bc6d0068e654d702788c7f558a7975190356e66`와 원결과 `camera-directional-limited-result.json` 27,932B / `eec9c743a15c2bbaf60aa67f95767676137927cac1a2dfe24a0b75e38f9c8f45`, `native-directional-result.json` 6,106B / `87217d74229d870ca564743d344da9dab690e11533b4e17a7ac30ac0caa2ee18`, `validation-receipt.json` 4,176B / `44b3be782d4c962d6bf2fcfefc3c7f7b4ef36d137e5ebd0ea63a8dc3e048521d`, `visual-verdict-final.json` 5,811B / `acf4a2165bb087d736815370ed1e55cca7485b73fe92f610d1b253d18411af2f`로 각각 보존한다. 최초044b36조건/native2조건·철회2306 FAIL1·현재a2fa CPU14/native1은 clean 전체 PASS로 합산하지 않는다.

### MAP PRODUCTION REPORT — 가이드 §23

| 항목 | 이번 범위/관측 |
|---|---|
| STAGE | CH1-1 단일 NORMAL 드루이드 arena Y 카메라, isolated3387 명시 opt-in |
| MASTER | silhouette/regions/main route/side spaces 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE | 원본 source assets/PNG/composites 변경0; player·label·FX overlap과 baked 반복 실루엣 남음 |
| MEDIUM | connections 변경0, remaining holes 신규 인수0 |
| GROUND | shadow/contamination/structure integration 변경0, physical relief 추가0 |
| PLAYABLE | 기존 boosted bosstest0 arena만 관측, normal travel 미인수. breathing/threat space·AI·collision 변경0; 본체 잘림 개선, label/FX 가독성 미해결 |
| LANDMARK | primary/secondary/tertiary 변경0 |
| CAMERA QA | ARENA: 현재a2fa Chrome1/context1/page1·capture fit1조건 PASS/RETOUCH. trusted S 후 보스 이동으로 고정 south130 미인수·intro draw/state UNKNOWN. 최초044b native2는 별도 이력. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미관측 |
| TECH QA | route 미주행·collision 변경0; 현재 native pageerror0/404·HTTPfailure0, source5 exact. targetY+조건부 directional rounding 외 seam 유지. CPU044b36·철회2306FAIL1/미도달4·현재a2fa14는 별도 epoch. 전체 alpha/첫 보간/성능 미인수 |
| FILES | stage-owned game.html camera hunk1+현재 정본10; shared game foreign185B와 3.3 foreign2,948B 보존, unrelated touched0 |
| GIT | 증거 epoch는 stage/commit/push 전. 완료 사실은 같은 외부 디렉터리 remote-preservation-receipt.json의 normal commit/push/remote exact SHA 참조; deploy0 |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | actual camera/zoom의 mouse-aim 소비, normal route→boss lifecycle, intro draw와 동기인 bounds, cardinal/작은 viewport·map clamp, 첫 보간/zoom 진입, alpha/label/FX 가독성; 옛 suite 반복0 |


## 2026-10-07 CH1 카메라 zoom과 마우스 조준 소비 — ROOT-CH1-CAMERA-MOUSE-AIM-20261007

현재 CH1 stage LOCK의 geometry/통로/collision을 그대로 둔 input consumer다. 옛 camera 검수와 새 입력 검수는 별도 epoch이며 가이드의 visual gate를 CPU PASS로 대체하지 않는다.

현재 `game.html` working은 4,084,115B / `b3439a539397e73dcc929d565f172a720facdb282b654e741b9f495e8fc6e6f3`, root owned HEAD+변경 blob은 4,083,930B / `ae8244039d7ecc7383fc96076d7ad7bf9e17d7044330d8c0737a333240130073`다. 원래 타인 WIP185B를 보존한다. 이번 단위는 카메라를 바꾸는 대신 입력 좌표가 실제 현재 zoom을 소비하게 한다. camera framing·zoom 보간·시트·애니메이션·전투·AI·충돌·저장 수치는 변경하지 않는다.

전역 `_setMousePosition`의 finite client/rect/raw 위치 guard와 CH1 opt-in의 zoom 역변환은 적용 범위가 다르다. 범위 밖 valid raw/finale 수식은 유지하며, 새 CH1 scope만 current rect+저장 clientXY를 현재 `G._camZoom||1` positive finite 값으로 재투영한다(.3 cap 없음). scoped point 계산 완료 후에만 원자 게시하고 `_set`은 boolean을 반환한다. 일반 mousemove/mousedown의 facing은 true일 때만, 패드 해제 첫 이동은 기존 `_gpClearAll()` 뒤 scoped `_set` 성공 시만 추가 갱신한다. 정확 표/수식은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 신규 CPU | 현재b343 source의 신규 actual main 함수·실제 input callbacks VM 검수: 최초 Node1/VM24/DOM rect141, 7그룹28복합조건 PASS/FAIL0/미도달0/exit0. 통제 DOM/gamepad 경계이며 실제 GPU/하드웨어 gamepad 인수와 구분 |
| 신규 native | 현재b343 source의 최초 실제 main bosstest0 Chrome/context/page 각1, 3조건 PASS/FAIL0/미도달0/exit0. 동일 trusted mousemove의 effective point/facing 오차0; 같은 이벤트의 legacy 각도 오차는 −.3038275023834693rad. resize1280×720→1600×900에서 새 mousemove0·point 오차0·저장 facing 유지, trusted W 이동 중 저장 facing 유지. source5 exact·GL0·pageerror/HTTP failure0. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘 |
| visual | root가 실제 PNG1을 직접 판독: Druid antler/body 식별, 아래 작은 player·green FX 겹침과 반복 평면 baked 지면 남음. VISUAL VERDICT: RETOUCH. 그림의 보스 alpha 지점에 실제 공격이 적중한다는 pixel target hit 인수는 아님 |
| 이력 분리 | 이전 AIM read-only 계획의 구현0은 작성 당시 상태다. 현재 구현은 위 source핀과 실제 검수로 판단하며 옛 camera14/native1/105검색·공식원문 보존을 새 성과로 재실행/합산하지 않음 |
| 미인수 | 하드웨어 GP·arena exit 잔여 zoom의 native·normal route·boss lifecycle·shake/round/interpolation/alpha alignment·performance·native6/audio/reward/save. controlled CPU의 GP/arena exit 케이스를 실제 native 인수로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-camera-aim-20261007/`이다. `implementation-receipt.json` 4,493B / `045a27500ee5504a75440a7d913359badd5a0c72ed885352a8072bd5d9423c86`의 exact replacements/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 epoch checkpoint 전·deploy0이다.

최종 `aim-cpu-receipt.json` 1,124B / `f4a25b7ae304f8c4665d9f7f821ced2f89e23fbdeb8f168ae661cd39056b6c7c`, `native-result.json` 12,782B / `451a9070a4177502675978364ae877263d32ed7f6ba4e33ba98f216fa8dcf901`, `validation-receipt.json` 1,994B / `be8dc72efa2c1b886df9683a6f89ca7a4667ffd8fd9f05f9235c0d825ccf490e`, `visual-verdict.json` 4,764B / `22108e6e5e55733b0a4c83150f6ed31a791d3ce07900c29f85a94d8c740c593a`를 각각 보존한다. CPU28과 native3은 별도 검수이며 clean 전체 조건으로 합산하지 않는다. 0707 공식 raw6와 다음 retry 계획도 별도 원자료로, 이번 AIM 제품 인수에 합산하지 않는다.

### MAP PRODUCTION REPORT — 가이드 §23

| 항목 | 이번 입력 소비 범위 |
|---|---|
| STAGE | CH1 production_finish field200×200/arena128×108 opt-in mouse aim 소비 |
| MASTER | silhouette/regions/main route/side spaces 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE | source assets/composites/overlap/repeated silhouette 제작 변경0, 기존 시각 문제 인수0 |
| MEDIUM | connections/remaining holes 변경0 |
| GROUND | shadow/contamination/structure integration 변경0 |
| PLAYABLE | input consumer만 변경; main arenas/travel/breathing/threat space·AI·collision 변경0, 실제 combat readability 별도 검수 |
| LANDMARK | primary/secondary/tertiary 변경0 |
| CAMERA QA | ARENA: 현재 b343 실제 mouse/resize/W3조건 한정 PASS; 새 mousemove 없는 resize와 저장 facing 유지 관측. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미관측, 하드웨어GP/arena exit/normal route/alpha target 미인수 |
| TECH QA | 신규 CPU7/28과 native3 별도. pageerror0/404·HTTPfailure0/source5 exact, asset/loader 변경0. 좌표 역변환·rect resize/facing 관측, collision 변경0·route 미주행·전체 seam/performance 인수0 |
| FILES | stage-owned game.html 입력4 own hunk+현재 정본9; game foreign185B·3.3 foreign 순차이2,948B는 fullbytes 보존, unrelated touched0 |
| GIT | 증거 epoch stage/commit/push 전; 실제 사실은 외부 remote-preservation-receipt.json 참조, deploy0 |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | 현재 death menu의 retry 1회 소비·pending save와 다음 death 독립 처리 계획, 실제 main boss lifecycle/normal route 품질. 다음 계획을 현재 구현/검수로 승격하지 않음 |


## 2026-10-07 사망 메뉴의 재도전 1회 소비 — ROOT-CH1-RETRY-MENU-CONSUMER-20261007

CH1 geometry/stage LOCK·field 복귀와 camera를 그대로 둔 death UI 소비다. 새 검수를 기존 필드·보스 사망 진행 전체 인수로 확대하지 않는다.

현재 `game.html` working은 4,084,755B / `7e4002066c089e2a0d3fc6a6d2af5499d75aa4a3e677b08e4d10c9552f5080ec`, root owned HEAD+변경 blob은 4,084,570B / `8ba1a816d1a656d646f2967edc0431c087075d73b6bbedb75532d2aa0756402a`다. shared game의 타인 WIP185B를 보존한다. 변경은 현재 사망 메뉴가 첫 재시도 입력을 동기 소비하는 UI 접점이다. 기존 본문·EXP·field snapshot·자원·음악·save schema/API/backend를 변경하지 않는다.

현재 connected retryBtn의 named onclick selfidentity와 connected death.on·replay off·P.dead·!G.on을 먼저 검사한다. 통과하면 외부 게임 helper 전에 death.on을 동기 제거하고 death 하위 focus만 blur하고 settings.on일 때만 기존 closePanel('settings')로 그 패널과 pause를 해제한 뒤 invalidate와 기존 본문을 실행한다. OPT/다른 panel은 유지하며 closeAllPanels0이다. repeat Enter/NumpadEnter/Space만 preventDefault+stopPropagation; 첫 입력/Tab/패드 click은 유지한다. `_retryBusy`/finally/새 state는 없으므로 저장 pending 중 새 실제 사망은 그 메뉴의 guard가 성립하면 독립 재시도한다. await 이후 UI mutation0, backend의 늦은 save 효과 UNKNOWN. 정확 표/순서는 `docs/2_5 부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 이전4249 CPU | 최초 Node1/VM21, 8그룹35복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 이 source 뒤 settings pause 반례를 추가 보정했으므로 최종7e4002 전체 PASS로 승격하지 않음. 재실행0 |
| 최종7e4002 CPU | 최종7e400 source의 settings 한정 최초 Node1/VM3, 3그룹6조건 PASS/FAIL0/미도달0/unhandled0/exit0. 실제 전체 final handler+기존 closePanel을 추출하되 새 settings 소비만 검증; normal init/stats/refill/finale/QS는 통제 ports·_dbReady=false. 이전4249 35조건은 재실행하지 않았으며 clean41/최종전체PASS로 합산하지 않음 |
| 신규 native | 최종7e400 source 최초 Chrome/context/page 각1: normal field 실제 적 피해10회→frame1109 HP0/P.dead/G.on false/death.on true의 자연사망 N1 PASS1. trusted Escape로 settings.on/G.paused true 관측은 재도전 전조건이다. trusted Tab40회에도 BODY에서 retryBtn 초점 미도달: phase/setupFAIL1·conditionFAIL0·N2/N3未도달2·exit1. 실제 retry activation/소비·settings closure·pause release·부활·재도전 후 이동·저장 미인수, 재실행0/추가Chrome0 |
| visual | root가 death/first-failure PNG를 직접 판독: 중앙 “부활 불가 1s” countdown과 설정/사망 패널 겹침으로 RETOUCH. death.on snapshot은 retry 버튼이 visible/focusable이라는 증거가 아니며 Tab 미도달의 원인 UNKNOWN. 실제 재도전/전체 visual PASS 인수0 |
| 브라우저 전 준비실패 | 최초 --root-ack 누락으로 CLI guard exit1/Chrome0/조건0/제품FAIL0. 원자료 보존 후 기존 root GO를 명시 인자로 공급한 실행이 위 최초 브라우저1회; 준비오류를 native condition FAIL이나 제품 suite 재시도로 합산하지 않음 |
| 네트워크/GL/저장 | pageerror0/HTTP failure0이나 의도적 external font 차단3·intro media abort3는 별도 관측이다. GL=`UNKNOWN_NO_RENDERER_WRAPPING_OR_NEW_CONTEXT`로 실GL0 주장0. synthetic mats2는 서버 도달0, 실save0·durable ACK 미인수, physical GPU 해제 UNKNOWN |
| 이력 | 이전 source별 retry/EXP/field46key/자원/음향 PASS는 해당 epoch 이력으로 보존. 이전 AIM28/native3/search51과 camera검사를 이번 메뉴 소비 성과로 재실행/합산하지 않음 |
| 미인수 | 실제 retry activation/repeat guard/settings closure/pause release·부활/완충/재도전 후 이동·pending 실save 중 다음사망 생애·boss death/열린문·정상 route 전체/native6·audio/reward/durable save·backend 늦은 save 효과·시각 전체 PASS. N1은 자연 필드사망만이며 boss 사망/native6로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-retry-menu-20261007/`이다. 이전 `implementation-receipt.json` 1,914B / `2491d197877b441d5703306b3ccf4a9c1b289d6d001ab2910f18c1a05310d909`와 `retry-cpu-receipt.json` 4,373B / `05082a5cef7fef3d8848d57e652567c5452a1fd3f74b896a2d19c515ba8ceae4`는4249 source 이력이다. 현재 `implementation-final-receipt.json` 2,737B / `781b5167f12c6f855cffd63998982e878799a345ee065c77eca5d3c8bdafeec6`의 exact2치환/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하며 자기 commit SHA를 순환 삽입하지 않는다. 이 증거 epoch는 checkpoint 전이며 deploy0이다.

최종 settings 한정 원문 `settings-receipt.json` 4,178B / `f2c077c5c7a57faa3df8e9c095f549f52eecd6bb6ec772434b0965cf31c80a9d`와 `settings-result.json` 7,267B / `812f248743b349671f522578d074d2ed459fcf596a74f66c2ec7a3c9fc0550d6`, 실제 native `native-retry-result.json` 133,977B / `b2dee048ac3e347415e7437c7df68daf8014e39ff8ca48677e7ba414bc780d55`, 브라우저 전 `native-cli-preflight-failure.json` 438B / `bc42a5c8fdea6b50bb73e4ec0e82949abade971f8bd16e508d2fe95b9f137d4a`, `validation-receipt.json` 6,019B / `3a367fd511c8819cbe74c2f2d75fa77c25ed4be3f820b7ee496d0f3b9f4d7978`, `visual-verdict.json` 5,268B / `e56ffe0466fd799cc972ff2cf63d883018170ff1604a3b5126fb930ea8af6aa7`를 별도로 보존한다. 새 editor N3 기대거절 원문 `codex-editor-import-official-manifest.json` 502B / `316193c436db197ec40a28b0e80dae5035b8e1718cde5debf01114ea123c6712`는 root가 미채택 보존한 자료이며 필수 hunk0·이번제품/검수채택0이다.

### MAP PRODUCTION REPORT — 가이드 §23 경계 기록

| 항목 | 이번 UI 소비 범위 |
|---|---|
| STAGE | actual main retry death-menu 입력 소비, field 진행 복귀 본문 유지 |
| MASTER | silhouette/regions/main route/side spaces 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE | source assets/composites/overlap/repeated silhouette 변경0 |
| MEDIUM | connections/remaining holes 변경0 |
| GROUND | shadow/contamination/structure integration 변경0 |
| PLAYABLE | normal field의 trusted W 이동 y7420→7152.70336·실제 적 피해10회·자연사망만 관측. boss arena 미진입·EXP/field46key/자원 복귀 실제native 미인수, geometry/breathing/threat 설계 변경0. death countdown/겹친 설정·사망 UI 관측 |
| LANDMARK | primary/secondary/tertiary 변경0 |
| CAMERA QA | camera/zoom/mouse aim 변경0. START: trusted 시네마틱/가이드 Space·practice-skip UI의 실제 진입; EARLY: W/적 접촉·자연사망. ARENA 미진입, SIDE L/SIDE R/LANDMARK/LATE/EXIT 미관측. 검수 URL의 isolated3387 dual opt-in은 테스트 범위이며 새 retry handler 자체는 opt-in으로 제한되지 않음 |
| TECH QA | 4249 CPU35와7e400 settings6 별도; native N1PASS1/phaseFAIL1/조건FAIL0/未도달2/exit1. source3 exact·pageerror/HTTP0, font 차단3·intro abort3 별도, GL UNKNOWN. field 부분관측·collision 변경0·성능 미인수; actual retry 소비/반복입력/저장 인수0 |
| FILES | stage-owned game.html 정확2치환+현재 정본10, game foreign185B·3.3 foreign 순차이2,948B fullbytes 보존, unrelated touched0 |
| GIT | 증거 epoch stage/commit/push 전. 실제 사실은 외부 remote-preservation-receipt.json 참조, deploy0 |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | source-specific death countdown/settings·Tab focus/visible eligibility 원인 진단 후 새 한정 native gate. 현재 원인 UNKNOWN·기존 blind Tab/native/옛suite 재시도0, backend 늦은 save 효과 별도 |


## 2026-10-07 사망 메뉴의 키보드 초점 — ROOT-CH1-DEATH-KEYBOARD-FOCUS-20261007

사망 메뉴 입력의 새 접점을 기록한다. 맵 지형·충돌·진행 보존과 카메라·보스 전투 계약은 변경하지 않는다.

현재 본편 `game.html`은 4,086,254B / `82262b4215e0dba0b1bfdef825b499e302ff3dd81b4b060d323475ea2b86444d`이고, 총괄 소유 변경만 담은 파일은 4,086,069B / `900e8683eddaa7caac72e1685cdbd2f13603aa457dc7e82ac69a82025e7fdc56`다. 본편의 다른 담당 변경185B를 보존한다. 새 변경은 `_handleDeathMenuKeyboard(e)`와 기존 window `keydown` 연결1곳, 기존 `keyup` 끝의 Space 연결1곳이다. 쉬운판과 기존 재도전 본문·자원·저장 순서는 변경하지 않는다.

사망 메뉴에서 Tab·Shift+Tab으로 현재 보이는 활성 버튼만 순환한다. 유효한 Enter·NumpadEnter·Space는 브라우저의 기본 버튼 클릭에 맡기며 직접 `.click()`을 호출하지 않는다. 재생 중이거나 분리·교체·숨김·비활성 상태가 된 버튼의 기본 활성화는 막는다. Space는 keyup에서도 다시 검사한다. 정확한 대상·제외 조건은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 이 절을 따른다.

이전 `ROOT-CH1-RETRY-MENU-CONSUMER-20261007` 절은 당시 소스의 이력으로 보존한다. 그 절의 “Tab 유지”는 이전 재도전 소비 변경의 범위를 뜻하며, 현재 사망 메뉴의 Tab 순환에는 이 새 절을 적용한다. 이전 검수 횟수와 이번 결과를 합산하지 않는다.

| 새 검수 | 이번 범위의 결과 |
|---|---|
| 한정 CPU | 최종82262에서 Node1·VM52, 실제 helper+전체 keydown/keyup·통제DOM. 7그룹·55조건 통과/실패0·미도달0·exit0 |
| 실제 브라우저 | 최초 Chrome/context/page 각1, 새2조건 통과/실패0·미도달0·준비 실패0·exit0. Tab1 초점→Enter 기본click→death/settings 닫힘·pause 해제→W 2프레임 이동·키 해제 |
| 오류·저장 | 소스3개 전후 정확 일치, pageerror0·HTTP실패0. 의도적 글꼴 차단3·intro 중단3 별도. GL UNKNOWN. synthetic matsPOST2 서버 도달 전 차단, 실제 서버 변경0·실저장 ACK0 |
| 시각 판정·한계 | 파란 재도전 초점 표시 식별. 재도전 직후 사망 화면 전환과 HUD·금빛FX 겹침으로 RETOUCH. 안정된 전환 종료 미인수. Space keyup·Shift+Tab·리플레이/로비·보스방/전체 native6·음향·실저장은 별도 미인수 |

자연사망은 이번 브라우저 검수의 준비 조건이며 이전 자연사망 성과를 다시 합산하지 않는다. 44c9 준비 구현은 실행0이고, 이전 재도전 검사와 이번 CPU·브라우저 결과도 합산하지 않는다. 브라우저 전 메타데이터 준비 오류1회는 Chrome0·제품 실패0으로 분리한다. 추가 검수 실행·자동 재시도는 없다.

### MAP PRODUCTION REPORT — 이번 입력 접점의 범위

| 항목 | 이번 변경과 검수 범위 |
|---|---|
| STAGE | CH1 본편 사망 메뉴의 키보드 소비. 보스 사망 경로 전체 인수는 별도 |
| MASTER | silhouette·regions·main route·side spaces 변경 없음 |
| OUTER MASS | LEFT·RIGHT·TOP·SOUTH·major holes 변경 없음 |
| LARGE | source assets·composites·overlap·repeated silhouette 변경 없음 |
| MEDIUM | connections·remaining holes 변경 없음 |
| GROUND | shadow·contamination·structure integration 변경 없음 |
| PLAYABLE | 일반 필드의 Tab1→Enter 재도전 뒤 W 이동 y7420→7414.620080000001·2프레임 관측. 보스방 미인수. main arenas·breathing/threat space·전투 수치 변경 없음 |
| LANDMARK | primary·secondary·tertiary 변경 없음 |
| CAMERA QA | START는 일반 본편 진입, EARLY는 Tab1→Enter 기본 클릭→W 이동 관측. ARENA·SIDE L·SIDE R·LANDMARK·LATE·EXIT는 미인수이며 새 카메라 전수 검수 없음 |
| TECH QA | route는 일반 필드 일부만 관측, collision 변경 없음. pageerror0·HTTP실패0. 의도적 글꼴 차단3·intro 중단3 별도. GL UNKNOWN. 기존 rig/terrain 사용. seam은 현재 메뉴·현재 버튼의 초점 소비 한정, performance·전체 loading 미인수 |
| FILES | 총괄 소유 game1+현재 문서8개. 본편185B·설정 문서2948B의 동료 변경은 보존하며, 관련 없는 파일 변경 없음 |
| GIT | 이 초안은 stage·commit·push 전. 정상 커밋·push·정확한 원격 SHA는 같은 외부 디렉터리의 `remote-preservation-receipt.json`으로 확정. 배포 없음 |
| VISUAL VERDICT | RETOUCH. 재도전 초점은 식별되지만 다음 화면은 사망 화면 전환과 HUD·큰 금빛FX가 겹침. 안정된 전환 종료 미인수 |
| NEXT PASS | 보스방 개방·보스 사망/부활/재도전·격리 저장 계약과 실제 ACK·안정된 전환 종료 화면. 이번 F1/F2 재실행 없음 |

정확한 소스·구현·검수 원자료와 정상 커밋·push·원격 SHA는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-death-keyboard-focus-20261007`의 `implementation-final-receipt.json`, 최종 `validation-receipt.json`·`visual-verdict.json` 및 `remote-preservation-receipt.json`을 참조한다. 문서 작성 시점의 계획을 원격 보존 완료로 표시하지 않는다.


## 2026-10-07 실버테일 일반 LMB 공격 표시 구현 보존 — ROOT-CH1-SILVERTAIL-LMB-ATTACK-20261007

CH1 생산 상태에 미인수 일반 실버테일 공격 표시 후보를 기록한다. 지형·맵 이동·LOCK을 바꾸지 않는다.

이번 체크포인트는 완료된 표시 소비자 코드3개를 미인수 구현 후보로 보존한다. 구현 영수증 시점의 CPU·GPU·실제 브라우저 실행은0이며, 새 검수는 대기 또는 별도 진행 중이다. 이 문서는 그 결과를 포함하지 않는다. 공격 전체 PASS·실제 화면 완료·제품 채택·전체 플레이 연결 완료로 승인하지 않는다. 검수 결과와 수치는 이후 별도 절에 기록한다.

실버테일 일반 LMB의 `wSwing/atk2` strike와 정상 승계된 `wRecover/atk3` recovery에만 packed 공격 표시를 연결했다. 공격은 방향별9프레임·80×80셀·표시 원점(40,40)·referenceHeight45·heightWorld45·main 내부 translate(0,0)이다. 기존 idle2/walk4/run4는48×48셀·원점(24,47)·translate(0,23)을 유지한다. actor·map·animator·classId·nativeAnim·bodyState·현재 프레임과 strike/recovery owner를 재검증하며, 같은 프레임의 ghost는 기존 canvas/matrix만 재사용한다.

범위는 localhost 또는127.0.0.1의3387에서 명시된 첫 query `ch1Three=1`과 `ch1Rig=1`, 본편 CH1 stage0·production_finish·smoothing·비보스 일반 필드의 살아 있는 class1이다. 기본값은 OFF다. 피해·비용·공격 시간·충돌·무기FX·저장·지도·navigation·LOCK·원본 PNG는 변경하지 않는다. 특수기·사망과 미지원 상태는 기존 native 표시를 유지한다.

`silvertailAttackStrikeAccepted=true`·`silvertailAttackRecoveryAccepted=true`는 두 표시 경로의 구현 범위를 알리는 기능 플래그다. 실제 공격 검수 완료를 뜻하지 않는다. `silvertailAttackAccepted=false`와 `fullPlayerLinked=false`를 유지한다.

### MAP PRODUCTION REPORT — 미인수 구현 보존 시점

| 항목 | 이번 범위 |
|---|---|
| STAGE | CH1 일반 필드 실버테일 LMB 공격 본체 표시 후보. 이번 공격의 실제 화면은 미관측 |
| MASTER | silhouette·regions·main route·side spaces 변경 없음. 전체 경로 미인수 |
| OUTER MASS | LEFT·RIGHT·TOP·SOUTH·major holes 변경 없음 |
| LARGE | 기존 원본 PNG·atlas 유지. composites·overlap·repeated silhouette의 새 화면 검수 없음 |
| MEDIUM | connections·remaining holes 변경 없음 |
| GROUND | shadow·contamination·structure integration 변경 없음. 기존 평면 지면·확대 흐림 문제의 해결을 주장하지 않음 |
| PLAYABLE | main arenas·travel/breathing/threat space·전투 수치 변경 없음. 표시 후보이며 실제 공격·전투 가독성 미인수 |
| LANDMARK | primary·secondary·tertiary 변경 없음 |
| CAMERA QA | START·EARLY·ARENA·SIDE L·SIDE R·LANDMARK·LATE·EXIT의 이번 공격 화면 미관측 |
| TECH QA | route·collision·navigation 유지. source3 핀과 구현 역변환 근거만 보존. CPU/native 결과 미포함; pageerror·404·GL·seam·loading·performance·음향·저장은 이번 후보에서 미인수 |
| FILES | 완료 소유 code3+정본 docs13 보존 예정. game185B·설정 문서2948B의 동료 변경 보존. 관련 없는 파일 변경 없음 |
| GIT | 문서 초안 시점 stage·commit·push 전. 정상 보존과 정확한 원격 SHA는 외부 remote-preservation-receipt.json으로 확정. 배포 없음 |
| VISUAL VERDICT | RETOUCH. 신규 공격 화면 미관측으로 시각 PASS를 승인하지 않으며 기존 전체 RETOUCH 유지 |
| NEXT PASS | 새 한정 CPU·실제 공격 strike/recovery·ghost·8방향·발 접지와 전환의 별도 검수. 실제 저장·전체 native6는 별도 인수 |

기존 실버테일 idle/run, 전사 strike/recovery와 다크드루이드의 완료·실패·한정 검수는 각 당시 소스의 이력으로 보존하며, 이번 공격 후보의 검수로 재실행하거나 합산하지 않는다.

상세 모드·API·소스 핀·표시 원점과 해부학적 발 기준의 구분은 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 이 절을 따른다. 구현 근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-silvertail-attack-20261007`의 `main-implementation-receipt.json`과 `modules-implementation-receipt.json`이다. 정상 commit·push·정확한 원격 SHA는 같은 디렉터리의 `remote-preservation-receipt.json`에서 체크포인트 뒤 확정하며, 구현 보존 전 상태를 원격 완료로 미리 표시하지 않는다.


## 2026-10-07 실버테일 일반 공격 표시의 후속 검수 — ROOT-SILVERTAIL-ATTACK-VERIFICATION-DOCS-20261007

CH1 생산 상태에 일반 실버테일 공격 표시의 실제 한정 결과를 추가한다. 맵 구조나 전투 계약의 변경은 없다.

앞의 `ROOT-CH1-SILVERTAIL-LMB-ATTACK-20261007` 절은 구현 후보를 먼저 보존한 당시 기록이다. 그 절의 “화면 미관측·native 대기”는 당시 상태로 보존하며, 현재 한정 검수 상태는 이 후속 절을 우선한다. 소스3개는 변경하지 않았다. code3+docs13은 `d651f8d357d8cc1e4fc06fcd5fa6cb626255154d`로 정상 커밋·push·원격 정확 SHA 보존을 완료했고, 이번 별도 보존은 새 검수 결과를 기록하는 정본6개뿐이다.

최초 실제 Chrome/context/page/maxLive 각1에서 새2조건이 통과했다(실패0·미도달0·준비 실패0·exit0). 실제 LMB1회로 동쪽 direction2의 strike→정상 recovery→idle 복귀를 관측했다. class1은 정확3387 origin의 새 격리 context에 초기값으로 지정했으며 실제 캐릭터 선택 UI는 미인수다. 원본 canvas PNG4개의 해당 프레임은 일치하지만 전체 DOM 화면이나 하드웨어 화면 출력은 캡처하지 않았다.

| 현재 상태 | 이번 후속 결과 |
|---|---|
| 표시 검수 | 최초 실제 브라우저2조건 한정 통과. 앞선 main29·module33과 합산하지 않음 |
| 소스·저장 | source3/HTTP3 정확 일치, pageerror·HTTP실패0. GL UNKNOWN, synthetic matsPOST1 서버 차단·실저장 ACK0 |
| 시각 | PNG4개에서 strike/recovery 몸 포즈 식별. 작고 어두운 몸·큰FX·반복 평면 지면/흐림이 남아 RETOUCH |

총괄이 PNG4개를 직접 판독했다. 동쪽 strike와 recovery의 서로 다른 몸 포즈 및 기존 보라색 무기FX는 식별된다. 몸이 작고 어두우며 큰 밝은FX가 실루엣을 압도한다. 반복되는 평평한 회색 baked 지면과 배경 확대 흐림도 남아 VISUAL VERDICT: RETOUCH다. 이 판정은 전체 방향·발 접지·지형 높이·최종 미감의 통과가 아니다.

전체 공격·특수/죽음·8방향·실제 DSghost·해부학적 발·실제 지형 높이·보스방 개방/사망/부활/재도전 전체 경로·음향·실저장 ACK·전체 native6는 미인수다. 검수 영수증의 `wholeAttackAccepted=false`, 실제 기능 플래그 `silvertailAttackAccepted=false`·`fullPlayerLinked=false`를 유지한다. 기존 두 strike/recovery 표시 플래그의 true를 전체 공격 승인으로 해석하지 않는다.

### MAP PRODUCTION REPORT — 이번 실제 표시 검수

| 항목 | 실제 결과와 범위 |
|---|---|
| STAGE | CH1-1 stage0 일반 필드. 격리 classseed1의 실제 동쪽 LMB1회 |
| MASTER | silhouette·regions·main route·side spaces 변경 없음. 전체 경로 미인수 |
| OUTER MASS | LEFT·RIGHT·TOP·SOUTH·major holes 변경 없음 |
| LARGE | 원본 atlas/PNG 유지. 반복 지면 실루엣·평평한 baked 재질·큰FX와 작은 몸의 대비 문제 남음 |
| MEDIUM | connections·remaining holes 변경 없음 |
| GROUND | shadow·contamination·structure integration 변경 없음. physical relief0·발 접지 미인수 |
| PLAYABLE | travel/breathing/threat space·전투 수치 유지. 실제 strike/recovery 표시 소비만 관측 |
| LANDMARK | primary·secondary·tertiary 변경 없음 |
| CAMERA QA | 시작 구역 frame309/314만 관측. 나머지7지점·8방향·전방향 sprite fit 미인수 |
| TECH QA | source3/HTTP3 정확 일치, pageerror0·HTTP실패0. 제한된 읽기 observer와 기존 canvas 사용. GL UNKNOWN·성능/음향/실저장 미인수 |
| FILES | 이전 code3docs13은 d651f8d357d8cc1e4fc06fcd5fa6cb626255154d로 원격 보존 완료. 이번 소유는 후속 검수 docs6뿐. game185B·설정 문서2948B의 동료 변경 보존, 관련 없는 파일 변경 없음 |
| GIT | 이번 docs6의 stage·정상commit/push·원격 SHA는 verification-docs/remote-preservation-receipt.json으로 확정. 이전 code3docs13을 다시 집계하지 않음. 배포 없음 |
| VISUAL VERDICT | RETOUCH. 몸 포즈 식별 한정이며 전체 시각 PASS는 아님 |
| NEXT PASS | 보스방 개방·사망/부활/재도전 경로, 여러 방향의 몸/발 가독성, 지면·전경 재질, 음향·실제 저장 ACK를 별도로 인수 |

상세 결과·한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 이 후속 절을 따른다. 원자료는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-silvertail-attack-20261007`의 `validation-receipt.json`4278B/`55dae31f70b7bc96be2ac30b8d22659e4333fd00e4c9569cb70aa45553ac6128`, `native-attack-result.json`242346B/`13226988a34e87e51e4385586a2159e39e7e64074861e62fed367c52107d8c63`, `visual-verdict.json`4269B/`e6bb23107d3deb1dcd637490e17cf3106c1a598f26d5fc684d34f4c33d7c4f51`이다. 이번 docs6의 정상 커밋·push·정확한 원격 SHA는 별도 `verification-docs/remote-preservation-receipt.json`에서 확정하며, 이전 code3docs13 보존을 다시 집계하지 않는다.


---

## 2026-10-07 본편 출구 표시의 앵글러 완료 조건 — ROOT-CH1-EXIT-LABEL-DISPLAY-20261007

표시용 `_bossGateDisplayOpen()`는 `!!G._bossUnlocked && (G.stage!==0 || !!G._fbDone)`만 반환하며 상태를 쓰지 않는다. CH1은 해금과 앵글러 완료가 모두 참일 때 표시상 개방이고, 다른 stage는 기존 해금 플래그를 따른다. 실제 진입·해금 생산자·지역 정화·전투·재도전·저장 순서는 변경하지 않는다.

지역이 있고 CH1에서 `_regionClearedCount()>=4`이지만 `!G._fbDone`이면 `지옥문 봉인 · 앵글러 목표 미완료` / `Gate Sealed · Angler objective incomplete`를 표시한다. 이는 완료 플래그 설명이며 앵글러가 살아 있다고 단정하지 않는다. 나머지 지역 N/4 및 지역 없는 맵의 80% 라벨은 유지한다.

본편 `game.html` working 4088007B / `dd3e24dd9b02929e2e4a71cebc57c8b3362cc4a10bebfd667a17b1861f53192f`. HEAD+소유 변경 blob 4087822B / `f8104295b740a645bc233a3b78370d444a161fbe30ea25a78cfbec1d2585313b`이며 foreign 185B는 보존한다. Easy는 이번 변경 대상이 아니다.

CPU 최초 Node 1회·36 VM·5그룹 35조건 PASS, FAIL·미도달·준비 실패·unhandled 0, exit 0. 실제 helper/방향 함수 전체와 라벨·포털·미니맵 소스 조각을 통제 VM에서 검사했고 working/owned 전후 및 역변환이 정확했다. 별도 Canvas2D 소스 조각은 최초 Chrome/context/page 각 1회에서 한영 6조건 PASS, FAIL·미도달 0, exit 0이다. 두 단위를 합산하지 않으며 실제 게임 초기화·P/G·정상 경로 인수는 0이다.

통제 Canvas의 640 CSS 폭 cell에서 13px 선언의 한영 문구 6개는 잘리지 않았다. 실제 webfont는 로드하지 않아 resolved face는 UNKNOWN이다. 실제 맵·포털·미니맵·화살표·정상 게이트 도달, 전체 native6·음향·실저장 ACK는 미인수다. VISUAL VERDICT: RETOUCH. 과거 실버테일 공격 검수와 합산하거나 재실행하지 않는다.

### MAP PRODUCTION REPORT — 이번 표시 변경의 범위

| 보고 항목 | 이번 사실 및 미인수 범위 |
|---|---|
| STAGE | CH1-1 stage0의 기존 출구 표시; 다른 stage는 기존 해금 플래그 유지 |
| MASTER — silhouette/regions/main route/side spaces | 구조·지역·주 경로·부공간 변경 없음; 실제 정상 경로 검수 없음 |
| OUTER MASS — LEFT/RIGHT/TOP/SOUTH/major holes | 변경 없음; 새 관측 없음 |
| LARGE — source assets/composites/overlap/repeated silhouette | 에셋·합성·겹침·반복 실루엣 변경 없음 |
| MEDIUM — connections/remaining holes | 변경 없음; 새 관측 없음 |
| GROUND — shadow/contamination/structure integration | 변경 없음; 지면 품질을 PASS로 올리지 않음 |
| PLAYABLE — arenas/travel/breathing/threat/combat readability | 전투·이동·숨 고르기·위협 공간 변경 없음; 정상 게이트 도달 미인수 |
| LANDMARK — primary/secondary/tertiary | 기존 출구 랜드마크의 표시 조건만 변경; 위치·크기·배치 유지 |
| CAMERA QA — START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT | 실제 맵 카메라 검수 없음. EXIT도 Canvas 조각으로 정상 화면을 대신 인수하지 않음 |
| TECH QA — route/collision/pageerror/404/seam/loading/performance | route/collision/seam/loading/performance 실제 제품 미인수. 조각 브라우저 pageerror/HTTP 실패 0은 해당 조각 범위만 |
| FILES — stage-owned/concurrent touched/unrelated touched | root 본편 game와 현재 문서 9개 계획. game foreign185B 및 설정 foreign WIP 보존; 무관 파일 수정 0 |
| GIT — staged/commit/push/deploy | 이 증거 작성 시점은 root checkpoint 전. 정상 commit/push/정확 원격 SHA는 외부 remote-preservation-receipt로 확정; deploy 0 |
| VISUAL VERDICT | RETOUCH — 통제 한영 라벨 6개의 잘림만 관측; 실제 게임 화면과 webfont 미인수 |
| NEXT PASS | 같은 실제 게임에서 출구/포털/미니맵/방향 표시와 정상 게이트 도달 확인, 실제 폰트·배경 겹침 평가 |

상세 정본: `docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`의 이번 후속 절. 외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/display-cpu-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/native-display-fixture-result.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/validation-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/visual-verdict.json`. Git 사실은 같은 디렉터리의 `remote-preservation-receipt.json`에서 정상 commit/push 및 원격 정확 SHA로 확정한다. 이 문서 안에 자기 commit SHA를 순환 기입하지 않는다.


---

## 2026-10-07 같은 후보의 정상 UI·필드 플레이 부분 관측 — ROOT-CH1-NORMAL-UI-PARTIAL-COVERAGE-20261007

기존 날짜별 단위 검수는 당시 이력으로 보존한다. 이번 절은 새 `normal01` 실제 로비/UI에서 시작한 부분 플레이 결과이며, 이전 class seed/bosstest/Canvas 조각 또는 과거 패키지 검사와 합산하지 않는다. 제품 코드는 변경하지 않았다. 이번 root 인수는 동일 source/context의 시작·전투/획득·일반 필드 사망/직접 retry 부분 coverage이며 `sameCandidateSixStageAccepted=false`를 유지한다.

root 소유의 실제 Chrome/context/page/maxLive 각 1개를 같은 세션으로 유지했다. 실제 UI에서 전사(class0)를 선택·생성하고 캐릭터 스토리 Escape 홀드, main 컷신 Escape, 안내 `건너뛰기`, `연습 건너뛰기`를 거쳤다. class seed·HP/시간/전투/해금/spawn/좌표 강제는 없었다. 로비가 만든 실제 URL은 `http://127.0.0.1:3387/game.html?test=1&slot=demo&demo=1&story=warrior-v21&classic=1&ch1Three=1&ch1Rig=1&webgpu=0`이다. 이는 fresh 비영속 context의 normal DEMO이며 durable 저장 경로 인수가 아니다.

| 관측 epoch | 실제 기록 | 해석 경계 |
|---|---|---|
| 초기 UI/지급 | 전사 실제 선택·생성, story/guide/lesson 건너뛰기. 전투 전 starter bag10 | 시작 bag10은 전투 획득 아님. 안내 뒤 받은 `전대의 유골함`은 intro gift이며 별도 제외 |
| 첫 이동 | trusted W로 `(4020,7420)` → `(4020,7161.327040000009)` | 첫 walk 뒤 bonfireT=6. 시작 금빛FX/전환 종료 또는 전체 몸/발 시각 인수 아님 |
| 사망 전 map 관측 ID1 | 첫 처치: EXP0→1·mats1000→1005. 이후 stageKills7·mats1031·EXP7·HP0·fallen→dead | 일반 필드 자연 사망; `_bossUnlocked=false`, `_fbDone=false`, 아레나 밖. `combat-loot01`은 fallen/HP0에서 R 미도달, `death-observe01`에서 dead/사망 메뉴 확인. 보스전 사망 아님 |
| 실제 retry 클릭 | 기존 보이는 retry 버튼 클릭. EXP7→5, 맵 객체 관측 ID1→2, stageKills7→0, mats1031 | 봉인 상태 일반 필드의 재시작 관측. 해금된 필드/보스전 진행 보존 PASS 아님 |
| 재진행 map 관측 ID2 | 이동·전투 재개 후 stageKills11·mats1077·Lv2·EXP1 | 이전 7처치와 합산하지 않음; 지역 정화·보스 클리어 수치 아님 |
| 실제 새 획득 | `southwest-combat01`의 실제 R 입력 뒤 bag10→11, `그림자 머리띠` ID `1791366584107.055`, slot helmet·rarity2·tier0 | baseline에도 같은 이름의 아이템이 있어 새 ID로 구분. root가 SW PNG의 획득 팝업 직접 확인; 장착/스탯 검수 아님 |

완료 관측 JSON은 17개이며 명령 metadata 18번째 `close01`은 원문의 STARTED를 보존한다. 이를 17/18조건 PASS 또는 전체 clean suite로 계산하지 않는다. source5의 실제 HTTP 및 로컬 전후 핀은 정확했고 pageErrors0·httpErrors0·cleanup0·exit0이다. renderer/GL wrapping 및 getError 계측은 0이므로 GL 결과는 UNKNOWN이다. requestFailures는 별도로 12개다: 외부 폰트·supabase 명시 차단 `ERR_FAILED`7, 로컬 `ERR_ABORTED`5(스토리 영상1/lobby.mp3 1/intro.mp4 3). 로컬5는 skip/navigation과 함께 관측됐지만 개별 직접 원인은 UNKNOWN이며 전부 의도 차단으로 단정하지 않는다.

API synthetic 10회는 모두 `POST /api/mats`, forwarded0이다. `POST /api/save`는 0회였다. retry의 기존 dbSave 경로와 fresh context 제품 localStorage 저장, 서버의 durable ACK를 구분하며 실제 백엔드 영속 저장은 미인수다. root 명시 close 후 context/owned browser가 닫혔고 stdin EOF 뒤 PTY exit0도 확인됐다. 원문 scope의 `actualMainNormalDemoExpectedButNotYetObserved=true`는 준비 당시 라벨이며, 새 root 판정이 실제 관측을 따로 기록한다. 원문을 고쳐 실행 결과로 꾸미지 않았다.

| 동일 후보 source | bytes / SHA256 |
|---|---|
| `game.html` | 4088007 / `dd3e24dd9b02929e2e4a71cebc57c8b3362cc4a10bebfd667a17b1861f53192f` |
| `index.html` | 342547 / `27ba97fff5ae755bc58db2e8b2144e5136a4a66e3c9be43a466ff5673ce2a5b1` |
| `tools/2_5d/ch1-field-terrain.mjs` | 7699 / `26d66ae478230e4d4a9a80d94a4a00586712580970f59f62ac2feed76e2301a9` |
| `tools/2_5d/ch1-player-rig.mjs` | 33296 / `73d0a9e54fc78808ff4189b5de7403f983255845aa27e6a9849ed1f6406c0aa2` |
| `tools/2_5d/character-rigs.mjs` | 23787 / `d666c9eb1a9aac11c224b496c8c025ef23a505030f931519392319d8f2c45f9a` |
| game HEAD+소유 blob | 4087822 / `f8104295b740a645bc233a3b78370d444a161fbe30ea25a78cfbec1d2585313b` |

working game의 foreign185B는 관측 후보의 일부이지만 이번 변경으로 소유하거나 되돌리지 않았다.

보스방 개방/정상 진입·4지역 정화·보스전 사망/부활/재도전·해금된 필드 보존·전체 native6·실청취·durable save ACK는 계속 미인수다. root의 PNG6 직접 판독은 반복 회색 baked 평면 지면, 작고 어두운 몸과 큰 전투FX 겹침, retry 뒤 사망 fade/금빛FX 잔존을 확인했다. SW 희귀 획득 팝업은 식별되지만 몸 가독성은 여전히 혼잡하다. **VISUAL VERDICT: RETOUCH**.

### MAP PRODUCTION REPORT — 정상 UI 부분 플레이 관측

| 항목 | 이번 범위 |
|---|---|
| STAGE | CH1-1 stage0의 실제 normal DEMO; 같은 기존 source, 코드 변경0 |
| MASTER — silhouette/regions/main route/side spaces | 구조 변경 없음. 초기 남쪽→남서쪽 일부 이동/전투만 관측; 전체 route 미인수 |
| OUTER MASS — LEFT/RIGHT/TOP/SOUTH/major holes | 변경 없음; 전체 외곽 관측 미인수 |
| LARGE — source assets/composites/overlap/repeated silhouette | 에셋/합성 변경 없음; 반복 baked 재질 시각 과제 유지 |
| MEDIUM — connections/remaining holes | 변경 없음; 전체 연결 QA 미인수 |
| GROUND — shadow/contamination/structure integration | 기존 평면 회색 지면·깊이 부족, RETOUCH |
| PLAYABLE — arenas/travel/breathing/threat/combat readability | 실제 일부 이동·처치·희귀 획득·일반 필드 사망/직접 retry/재진행. 보스 아레나/완주·몸 가독성 미인수 |
| LANDMARK — primary/secondary/tertiary | 기존 위치/배치 유지; 출구 랜드마크 도달/개방 미인수 |
| CAMERA QA — START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT | START/EARLY/SW의 제한된 PNG만; 전체 camera coverage·발·지형 높이 미인수 |
| TECH QA — route/collision/pageerror/404/seam/loading/performance | sourceHTTP5·전후 exact, pageerror/http0. 실패 요청12 별도. 전체 route/collision/seam/loading/performance 검수 아님 |
| FILES — stage-owned/concurrent touched/unrelated touched | 제품 변경0; 현재 문서6개에 이번 부분 관측 기록만 반영; 코드0. game185/설정 foreign/타인 WIP 보존; 무관 수정0 |
| GIT — staged/commit/push/deploy | 현 증거는 root 문서 checkpoint 전; 정상 보존은 외부 remote-preservation-receipt로 확정. deploy0 |
| VISUAL VERDICT | RETOUCH — 실제 획득 팝업 식별, 몸/FX/지면/사망 fade 과제 유지 |
| NEXT PASS | 같은 source의 더 긴 정상 진행·지역4/앵글러·게이트·보스전 사망/재시도, 몸/지면 가독성·음향·격리 영속 저장 검수 |

현재 상세 근거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/root-partial-coverage/validation-receipt.json` (35791B / `627816f881f7fd6c5c981a503be792bbffa66430a7d38bd20ed68ff9841c6e4e`), `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/root-partial-coverage/visual-verdict.json` (3310B / `805409879cfa1bb2e301ab07be882fc0d361d2d3b624403ded60627eaaf1ce85`)이다. 완료 원문은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/run-normal01/`, session 영수증은 3509449B / `4de3f0bfab85d9a55665173fc4c6ebbe599ab67f37bd24f013a4d97b2a5e42db`이다. Git 정상 보존 사실은 같은 `root-partial-coverage/remote-preservation-receipt.json`의 commit/push/원격 정확 SHA로 확정하며 문서 자기 commit SHA를 순환 기입하지 않는다.


---

## 2026-10-07 R 상호작용의 새 누름 1회 소비 — ROOT-CH1-INTERACT-FRESH-CONSUMER-20261007

본편 R 입력에 키 코드별 freshMap·주요/보조 엣지 동시 소진·repeat과 홀드 분리·P-free resetPending을 구현했다. 기존 쌍 포탈 우선과 R 본문 수치(홀드 sp 누적9, 장비1개, 재화/물약 성공최대20), 마우스 MB/MBjust·기본 바인딩·전투/진행/저장은 유지한다. 실사망/retry/initStage·blur/hidden·리바인드/프리셋·패드 키 UI의 입력 수명 경계를 연결했다. 일반 짧은 keydown/up 사이 update0 누름은 여전히 보장하지 않는다. 상세 현재표는 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 이번 절을 따른다.

현재 working `game.html`은 4,089,667B / `f8302cd77d7726d4f2da7c444b1ad4a0cfda908c1f3553b3847f86cc6da8a49c`, 총괄 소유 HEAD+변경 파일은 4,089,482B / `f88660e7c5b7d12dcd69408cde9c71063a3ee5f24d67581aa3173e0cd432bd1c`다. 본편16+공유 레슨1, 두 코드 경로17개 소유 hunk의 역변환이 원본과 정확히 일치하며 다른 담당의 game185B와 설정 문서2948B는 보존한다.

기존 game 전용 CPU는 최초 Node1·VM12의 실제 helper/입력 조각/R·홀드 본문을 통제 port로 실행한 7그룹26조건 통과(실패0·미도달0·exit0)이며 전체 update/reset 수명·실제 native·실저장 검수는 아니다. selector 비유일 준비 Assertion1은 별도 실행 전 준비 이력이고, 과거 R/normal17/GL 결과와 합산하지 않는다. 별도 최초 native R 입력3조건만 통과했으며 CPU와 합산하지 않는다. 총괄의 새 PNG1 직접 판독은 RETOUCH이고 GL 및 durable ACK는 미인수다.

근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-interact-fresh-20261007/implementation-receipt.json` 5,545B / `8d79af3b516e90d196383eda8b337dc193770061e032b019b7776aeb5338229d`, `cpu/execution-receipt.json` 1,678B / `ba9b5bc98624725027cf491e9f7c00a8ea398fd7e6365e91df591a0043fbdb1a`, `cpu/result.json` 11,489B / `076ad09c513b51d63980a6edd21b2421a874ebf147dbc93cc7400141eee45d10`다. Git 사실은 같은 디렉터리의 `remote-preservation-receipt.json`에 기록할 실제 정상 commit/push/원격 정확 SHA로 확정하며, 현재 문서는 checkpoint 전의 구현·서로 구분한 CPU/native 한정 증거 단계다. 자기 commit SHA를 순환 기입하거나 배포 완료로 표시하지 않는다.

### MAP PRODUCTION REPORT — 입력 소비 한정 단계

| 항목 | 이번 범위 |
|---|---|
| STAGE / MASTER | CH1-1 기존 source의 입력 consumer, 맵/route/SSOT 변경0 |
| OUTER MASS / LARGE / MEDIUM / GROUND / LANDMARK | 지형·에셋·연결·충돌·배치 변경0; 기존 평면 지면/몸·FX 가독성 RETOUCH 유지 |
| PLAYABLE | 별도 game CPU26·레슨 parse 실패/후속8·최초 native R 입력3조건. loot/portal/사망 재시도·정상 보스 route 미인수 |
| CAMERA QA | camera/zoom 변화0. 새 PNG1에서 시작 금빛 FX가 몸·발을 가려 발 접지/전체 화면 인수0 |
| TECH QA | game CPU7그룹26·레슨 준비 parse 실패 및 제품 VM5/8·native3을 별도 epoch로 보존. source2 exact·pageerror/HTTP 오류0, failed request5 별도, GL UNKNOWN·전체 lifecycle/실저장 미인수 |
| FILES | root 소유 game1+공유 레슨JS1+관련 문서9에 이번 입력 계약과 한정 관측만 반영; foreign game185·설정2948/타인 WIP 보존, 무관 변경0 |
| GIT | 현재 checkpoint 전; 외부 remote-preservation-receipt의 정상 commit/push/정확 SHA로 확정, deploy0 |
| VISUAL VERDICT | RETOUCH — 총괄 새 PNG1 직접 판독. 시작 금빛 FX의 몸·발 가림·회색 반복 baked 평면 잔존, 발/전체 미감 미인수 |
| NEXT PASS | 강제 P/G 변경 없는 정상 보스 route·획득·리바인드/전체 생애 경계 검수; 이번 R 입력3조건의 반복 실행0, 전체 플레이·음향·영속 저장 별도 |

공유 `parry-lesson.js`는 원본52,677B / `628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381`에서 최종52,747B / `f7113a41be241a5510ad84109bc55dc418f140dfc880857b1267171bbb624121`로 K clear 직전 선택적 호출1줄만 추가했다. 중간 무조건 호출 f43a4f는 CPU/native0인 준비 이력으로 외부 보존한다.

새 source 읽기에서 레슨 `resetPose()`의 기존 K/KH clear 뒤 freshMap이 남으면 repeat을 새 누름으로 소비할 수 있는 경계가 확인됐다. 최종 코드는 기존 K clear 직전에 `if(typeof _resetInteractInput==='function')_resetInteractInput();`를 호출한다. 본편에는 입력 API가 있어 Map/pending을 정리하며, API가 없는 Easy는 호출을 건너뛰고 원래 K/KH/MB 해제와 후속 `_stopShieldLoop()`를 그대로 수행한다. 레슨의 기존 자세/자원/월드 정리 권한과 순서는 바꾸지 않는다. 이는 source 검토와 구현 근거이며 실제 사용자/native 반례를 관측했다는 뜻이 아니다.

새 레슨 한정 검수의 최초 runner는 인용부호 준비 오류로 Node parse syntaxFAIL1·제품 VM0·8조건 미도달·exit1이었다. 원 runner/log/receipt를 보존하고 인용부호 한 곳만 별도 후속 runner에서 정정했다. 후속 실제 제품 VM5·8조건 통과, 실패0·미도달0·비동기 미처리 오류0·exit0이며 game f830/lesson f7113 전후 핀 exact다. 물리 Node 시도는2, 실제 제품 실행은1이다. 선택적 API 부재 시 원래 cleanup, 실습 시작/종료의 fresh 잔류와 repeat 차단, 새 누름/keyup 및 Q/E 기존 권한을 통제 VM에서 확인했다. 전체 Easy/전역 update·전체 생애·실제 native/저장 검수는 아니다. 기존 game 전용7그룹26조건은 재실행하거나 이8조건과 합산하지 않는다. 최종 두 source에서 별도 최초 native R 입력3조건이 통과했으며 아래 최종 native 절을 따른다. 이는 레슨 전체 수명이나 Easy native 검수로 확대하지 않는다.

정확한 새 레슨 원자료는 `cpu/lesson-reset-limited/execution-receipt.json`2,211B / `0528e3cd71a40bfda429ccfdf0075b2dfe5a598f7b35d3e5635c331ab6fec25c`(최초 parse 실패), `cpu/lesson-reset-quote-followup/execution-receipt.json`3,289B / `dc7f764d1fb6a1b360bafe94061c98e4ccf306ed3f3a06a7fc1b022f803f56f5`와 `result.json`7,610B / `c8cc7b74f01f9a105f2e0e0d0dcca668bbde4cd72d84c16021a557df9f68adc5`다.

새 정확 구현 근거는 같은 외부 디렉터리 `lesson-reset-final-implementation-receipt.json`948B / `f4bd62af0e560e92a091c6622ccd8b1aa1be13cc6af28fea14fdcca4a308a7fe`이며 final 선택적 호출의 원본 역변환 exact·game f830 불변을 기록한다.

### 최종 native 후속 기록

최종 game f830/공유 레슨 f7113에서 최초 Chrome/context/page/maxlive 각1, R1 새 누름 소비·R2 repeat2회 새 누름 재등록 없음·R3 keyup 뒤 Map/held 해제와 홀드 타이머0의 3조건만 통과했다(실패0·미도달0·준비 가드 실패0·exit0). 별도 game CPU26·레슨 parse 실패/후속8과 합산하지 않으며 레슨 전체 수명·Easy·실제 loot/portal·사망/retry·보스·실물 패드·음향·동일 후보6단계·A급은 미인수다.

실제 주소는 `classic=1&test=1&slot=root-r-fresh-20261007&ch1Three=1&ch1Rig=1&webgpu=0`이고 `demo=1`은 없다. source2 HTTP 사전/실수신·전후 exact, pageerror/HTTP 오류0; 외부 폰트 차단3·로컬 intro 중단2(직접 원인 UNKNOWN)는 별도다. POST `/api/mats`1건만 synthetic, 서버 전달/변경0·실저장 ACK0·GL UNKNOWN이며 소유 context/browser를 닫았다. 총괄 PNG1 직접 판독은 금빛 FX의 몸·발 가림과 회색 반복 baked 평면이 남아 RETOUCH다. 상세 현재표는 3.3의 이번 절을 따른다.

외부 근거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-interact-fresh-20261007/validation-receipt.json`4,621B / `c6595f90605f435f78213d11d9214d1ba255d4263cd272ec1046236f4c80579c`, `visual-verdict.json`1,884B / `d27d61ad99019f5eaf6aaf96e36f9a067af81db5ae551c4faf72663c9022bda2`다. helper native 영수증의 PNG PENDING은 당시 기록이고 후속 총괄 visual 판정이 현재다. Git 사실은 checkpoint 전 문구와 구분해 같은 디렉터리 `remote-preservation-receipt.json`의 실제 정상 commit/push/정확 원격 SHA로 확정한다.

<!-- ROOT-CH1-START-BARRIER-LAYER-20261007 -->

## 2026-10-07 시작 장벽 표시 계층 동기화 — ROOT-CH1-START-BARRIER-LAYER-20261007

현재 source9230의 시작 장벽 표시 소비를 기록한다. 앞 절의 기존 검수/후보 기록은 각자의 source epoch으로 보존하며 이번 결과로 소급 승격하지 않는다.

### 현재 표시 계약과 보존 값

이 변경은 기존 CH1 시작 결계의 표시 순서 조정이다. CH1 해당 scope에 전역 적용되며 별도 opt-in은 없다. 본체 원화·rig·시뮬레이션·안전구역을 변경하지 않는다.

| 항목 | 현재 값·적용 위치 | 보존·제한 |
|---|---|---|
| early 조건 | `G.stage===0 && !G._bossArena && !!(G._bonfire && G._bonfire.t>0)` | 이 조건에서만 base capture와 early 호출 |
| base 행렬 | `X.clearRect` 직후 native `X.getTransform()`의 `a,b,c,d,e,f` 또는 GPU `_mat()[0..5]`를 6개 scalar로 복사 | 배열/DOMMatrix 참조 보관0, DPR/SSAA 재곱0 |
| 표시 helper | `_drawBonfireBarrierScreen(a,b,c,d,e,f)` | `X.save()` 뒤 `try`에서 6인자 `setTransform`·translate·drawImage, `finally`에서 `X.restore()` |
| CH1 active 호출 | 기존 `_levelUpVfx` behind 및 `drawP()`보다 앞에서 배리어1회 | 기존 `drawP()` 추가0, 별도 RAF/timer0 |
| 그 외 호출 | `!_bfBeforePlayer`이면 기존 late helper1회 | 다른 stage/보스방의 기존 후반 위치 유지; expired/missing은 helper 내 무표시 |
| 중심 | `C.width/2+(G._bonfire.x-G.cam.x)`, `C.height/2+(G._bonfire.y-G.cam.y)` | 기존 좌표식 유지; 화면 중앙/줌/shake 전수 정합을 새로 인수한 것은 아님 |
| 시간·기본 반경 | `300f=5초`, `r=280px`, 기존 `t-=sp` | 생성/감소·적 이격·충돌·개방 권한 불변 |
| alpha | `Math.min(1,t/120)*.9` | 실제 RGB/postprocess 색 동일성 미인수 |
| 맥동·크기 | `1+Math.sin(_now/300)*.03`; drawR=`r*pulse`, size=`drawR*2` | 기존 수치 유지 |
| 이미지 admission | `_bonfireBarrierWarmDone && image.complete && image.naturalWidth>0` | 원 `sprites/bonfire_barrier.png`(1536×1024) 차용, 신규 이미지/원PNG 수정0 |
| 비용 범위 | CH1 early는 `_tDP0` 이전 및 옛 late `_pC1-_pC0` 밖 | wall/GPU시간·분류 영향·성능 개선 UNKNOWN |

### 검수 epoch와 실제 인수 경계

| 구분 | 실제 도달·결과 | 범위 |
|---|---|---|
| CPU 최초 준비 | 추출 준비 FAIL1, 조건0, 제품VM0, 8그룹 미도달, exit1 | 원문/원runner 유지; 제품 실패 또는 PASS로 바꾸지 않음 |
| CPU 별도 제한 | actual source fragments 8그룹·46조건 PASS46/FAIL0/미도달0, exit0 | 물리 Node 총2, 실제 source 검수 epoch1; 통제 X/G/C/Image 준비 port이며 full draw/main·GPU0 |
| 새 headed Chrome | 기존3387 Chrome1/context1/page1/maxLive1, 신규 phase3조건 PASS3/FAIL0/미도달0, exit0 | old suite0; CPU46과 합쳐 clean49PASS로 세지 않음 |
| active | 관측frame/관측전/관측후 `t=272/272/241`, current body publication blit1, 배리어 호출1 | PNG와 snapshot이 같은 draw라는 주장0 |
| fade | `t=88/88/56`, body1, 배리어1 | 감소 구간의 실제 표시 |
| expired | `t=0/0/0`, body1, 배리어0 | 자연 만료 뒤 무표시 |
| 오류·네트워크 | pageerror0/HTTPerror0; sourceHTTP4 exact(2파일×prelaunch/actual-body), local source2 전후exact | requestfailed5는 fonts 의도차단3+local intro abort2, intro 직접원인 UNKNOWN |
| API·종료 | savePOST0; 합성 `/api/mats` POST1, forwarded0, durableACK=false; context/browser 닫힘 | 사용자 save/backend 성공·durable reward 미인수 |
| 미인수 | GL UNKNOWN, audio0, native6=false, physical GPU해제 UNKNOWN, 정상 보스방 route·해부학 발·전체 A급0 | postprocess 색·줌/shake/SSAA 전수·성능 UNKNOWN |

직접 PNG 판독의 한정 결과는 **현재 시작 본체가 active/fade 금빛 장벽 위에서 식별되고 expired에서 장벽이 없어짐**이다. 반복된 회색 baked 바닥, 큰 펫 대사/그림, 주변 적·라벨·FX 점유는 남아 있다. 몸 가림 개선만 인수하며 전체 **VISUAL VERDICT: RETOUCH**를 유지한다.

### 별도 이전 epoch: 정상 route B의 제한 종료 기록

이 부분은 `ROOT-CH1-NORMAL-BOSS-ROUTE-PARTIAL-OBSERVATION-ADJUDICATION-20261007`의 종료 영수증 판정이다. game **4,089,667B/f8302cd77d7726d4f2da7c444b1ad4a0cfda908c1f3553b3847f86cc6da8a49c** epoch이며 현재 배리어9230 검수와 분리한다. **19건은 관측이지 19PASS가 아니다.**

| 관측 | 한정 사실 | 미인수 |
|---|---|---|
| map1 | kills2 뒤 필드 사망 | 보스전 사망 아님 |
| 실제 retry 후 map2 | kills35/Lv3, 남서35/53, 담당 Angler 생존 HP16125 뒤 두 번째 필드 사망 | map1 kills2와 map2 kills35 합산0 |
| 개방 | 지역 clear0/4, `_fbDone=false`, `_bossUnlocked=false` | 보스방 개방/진입/정상 boss death→retry0 |
| 아이템·재시도 | 필드 retry1회 및 가방 신규5개 관측 한정 | 전투 전수/아이템 보상 durable저장 완료 아님 |
| 전체 진행 | 같은 후보의 부분 필드 전투·이동·loot 관측 | 같은 후보6단계 완료·native6·청취/audio·durable save0 |

원자료: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-boss-route-20261007/root-adjudication.json` — 38,145B / SHA256 `08c731423d0bb3884b4565f9e02c2a7c2d56ee0c0786a9f8cf0b7fb0c07b65c7`.

### 정확 source·증거·검색 범위

| 자료 | bytes / SHA256 |
|---|---|
| 현재 working game.html | 4,090,587 / `9230a686ed148891309132f8da3c1e5f67bac1d74d774b3f5a9cb2e33afbd489` |
| ROOT owned game.html | 4,090,402 / `eefa78a08219cf1a56813d670513df05c3263ac7f039825d4048888e5e26742a` |
| parry-lesson.js(변경0) | 52,747 / `f7113a41be241a5510ad84109bc55dc418f140dfc880857b1267171bbb624121` |
| D/implementation-receipt.json | 1,771 / `0090e55a8e65b5ba5af6b0d3fbe634fa9b33196b4ddac86e2c5ee024882a50d3` |
| D/cpu-limited-receipt.json | 9,521 / `38a674f8786a9d9fc572d54cfb378a44830643967baecfca9d62cccd0960ef08` |
| D/native-first-only/result.json | 4,699 / `461d2783be8f5e5e98a2628a2a08ccad4a319813d9ad305013eb371b7beec95d` |
| D/validation-receipt.json | 5,902 / `58793ba797c13018c7d574c584a07c119bda71724c058c0791ed7bfcfa7173a9` |
| D/visual-verdict.json | 3,347 / `c6e34859e27c019c69d763219b34c466a7a499c8c6f1cc791caa7cbfa7919199` |

D=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-start-barrier-layer-20261007`. 실제3PNG=`D/native-first-only/active.png`, `fade.png`, `expired.png`; ROOT 직접판독3장 및 문서 동기화 담당도 저장 PNG3장 읽기만 수행했다. 이 문서 작업의 CPU/Chrome/입력 재실행0.

관련 검색1회는 eligible text1,016(그중 Markdown817), 매칭44path/82행/85occurrence이다. 관리 STATE/LOG8개(그중 Markdown4)와 보호2_3 본문은 제외했으므로 `docs 모든 파일 무제외 검색/전수 본문읽기`로 부르지 않는다. binary/archive258 분류는 이미지·압축·docx251 및 Python4·HTML백업3을 포함하며 전부 binary라는 뜻이 아니다. 일반 Markdown이 이258 목록에서 누락된 경우는0. 검색 원문은 `D/docs-plan/docs-related-keywords.raw.jsonl` 71,338B/SHA256 `402e632e65efe52fd91be01b00d46148909632ebeed95245ac66fa7cb1173bbc`, 영수증은 `D/docs-plan/search-receipt.json`이다. 역사 raw/과거 검수는 해당 epoch으로 보존한다.

working game의 foreign185B는 미채택 그대로이며 3.3 foreign2,948B·STATE/LOG·보호2_3·원PNG/scene/nav/장비·save는 이번 문서 소유 밖으로 수정0이다. 선택 GOALS 문서는 이번10개 소유에서 제외한다.

### MAP PRODUCTION REPORT — 가이드 §23

| 항목 | 이번 범위의 사실·Gate |
|---|---|
| STAGE | 실제 CH1-1 기존 후보 시작 장벽의 본체 앞/뒤 합성 소비. 새 지형·원화 제작 없음 |
| MASTER | silhouette/regions/main route/side spaces: 모두 기존 권위 유지 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 불변; major holes 이번 해결 대상0 |
| LARGE | source assets: 기존 barrier/맵 PNG; composites: active CH1 장벽 뒤 본체; overlap: current active/fade 본체 식별 한정 개선; repeated silhouette: 반복 baked바닥 미해결 |
| MEDIUM | connections 불변; remaining holes 별도 검수/해결0 |
| GROUND | shadow/contamination 불변; structure integration: 평평한 baked 지형 한계 유지 |
| PLAYABLE | main arenas/travel/breathing/threat space 불변; combat readability: 시작 본체 가림 한정 개선, 라벨/펫/FX 겹침 RETOUCH |
| LANDMARK | primary/secondary/tertiary 배치·원자료 불변; 새 랜드마크 시각 인수0 |

| CAMERA QA 8뷰 | 현재 관측 |
|---|---|
| START | active/fade/expired 3phase 실제 PNG에서 한정 판독 |
| EARLY | 같은 시작점 세 phase만; 다른 초기 지역/줌·shake/SSAA 전수 미인수 |
| ARENA | 기존 late source 조건은 제한 CPU; 새 arena 실제화면0 |
| SIDE L | 신규 관측0/UNKNOWN |
| SIDE R | 신규 관측0/UNKNOWN |
| LANDMARK | 신규 관측0/UNKNOWN |
| LATE | 신규 관측0/UNKNOWN |
| EXIT | 신규 관측0/UNKNOWN; 정상 보스방 route 개방 미인수 |

| TECH QA | 사실·한계 |
|---|---|
| route | 경로 변경0; 별도 정상B는 부분 필드 관측, 6단계 완료 아님 |
| collision | 원300f/r280 안전구역·nav·충돌식 불변; 신규 전수 충돌 QA0 |
| pageerror | 새 headed phase3 run0 |
| 404 | 새 run HTTPerror0; requestfailed5는 별도로 보존 |
| seam | 새 원화/맵 seam 변경0; 전수 시각 seam 개선 인수0 |
| loading | warm/image gate 제한 CPU, 실제 sourceHTTP4/local2 exact; intro abort2 직접원인 UNKNOWN |
| performance | 신규 시간/비용 인수0, early CH1 비용은 옛 late 측정 범위 밖; GL UNKNOWN |
| FILES | stage-owned: ROOT game 표시 hunk 및 지정 동기화 docs10; concurrent touched: game foreign185/3.3 foreign2948 미채택 보존; unrelated touched: 이 문서 작업0 |
| GIT | staged/commit/push는 ROOT 완료소유 checkpoint 예정, 이 담당 Git쓰기0·새 commit SHA 추정0; deploy0 |
| VISUAL VERDICT | **RETOUCH** — 시작 본체 가림 개선 한정, 전체맵 A급/정상 route 완료 아님 |
| NEXT PASS | 정상 route의 실제 지역80%+담당Angler→개방→보스전→death/retry·장비/회복을 같은 후보에서 이어 관측하고, 별도 zoom/shake/SSAA·postprocess색·라벨/FX 및 지형 가독성 Gate를 통과해야 함. 자동 재검사·임의 원화/geometry/nav 수정0 |


<a id="ch1-painted-sharpness-20261008"></a>
### ROOT-CH1-PAINTED-MAGNIFICATION-fd13e45c76595eb9b5ca63a39772cf3bece816d29a0dac042b5a935777e35a56RPNESS-20261008 — 본편 확대 샘플링

| id / 적용 위치 | 현재 계약 |
|---|---|
| CH1_PAINTED_RGB / `tools/2_5d/ch1-field-terrain.mjs::make` | 기존 `game.html::_drawCh1StartOuter → _drawCh1ThreeTerrain`가 사용하는 material에 연결. 기존 localhost/3387/ch1Three=1·stage0·비boss opt-in 범위 유지. Rift child에는 적용하지 않음. |
| SOURCE | 기존 decoded Image1026²/core1024/bleed1, world1000²/chunk·64청크. 원PNG·scene/nav·8192 master·geometry·UV1/1026..1025/1026 변경0. |
| RGB | 기존 Three r160 map_fragment의 center sample을 유지하고, 상하좌우1texel RGB 4회 추가 sample. linear-space `clamp(center+0.35*edge*(center-average4),0,1)`; 원래 sampledDiffuseColor alpha와 multiply 유지. 원화에 없는 디테일 복원은 아님. |
| MAGNIFICATION | `length(dFdx(vMapUv*1026))`와 Y footprint 모두 >0 && <=1일 때만. minification/퇴화 footprint에서는 원본. |
| CORE_EDGE | `min(UV-lo,hi-UV)*1026`의 양축 최소 거리로 `edge=smoothstep(0.5,1.5,distance)`; edge0일 때 추가4tap을 생략. core 경계는 원본 sample 유지, 1px bleed 밖에서 이웃 색을 추정하지 않음. 실제 seam 화면은 미검수. |
| SUPPORT | WebGL2·현재 renderer/material.map/texture.image·sRGB/channel0·r160 map marker 일치 시만 shader 교체. WebGL1/marker 불일치는 기존 map include 유지. cache key `ch1-painted-rgb-magnification-v1` 또는 `ch1-painted-original-v1`. |
| LIFETIME | disposed callback은 noop. 기존 map identity/suspend/dispose·shaderFailed/contextlost/GLerror 폴백 유지. 새 Image/Texture 복제/RAF/timer/uniform/별도 draw0. colorSpace/channel이 compile 뒤 외부에서 바뀌는 모든 경우의 원자적 복원 보장은 없음. |
| BUDGET | 기존 visible resource 각25/output4096/pixelRatio1/Linear/noMip/clamp 유지. 확대 interior에 texture fetch4회 추가; GPU 비용·실프레임 성능 UNKNOWN. |
| SOURCE_PIN | module 9432 B/SHA256 `fd13e45c76595eb9b5ca63a39772cf3bece816d29a0dac042b5a935777e35a56`; 한 삽입 hunk, working/HEAD 선 fullbytes backup·inverse exact. game/settings3.3/타인 WIP 쓰기0. |
| VALIDATION | 최초 신규 Node1: 실제 전체 module JS + 실제 vendor map_fragment 문자열, 통제 THREE/DOM/renderer 8그룹 통과/exit0. source injection·unsupported/currentness·dispose/cache 검수만. GLSL compile/GPU/PNGdecode/native 입력·실화면·audio·서버 save는 실행0. 이전 suite 합산/재실행0. |
| STATE | `VISUAL VERDICT: RETOUCH`, `UI_NOT_ASSESSED`, `nativeNOT_RUN`, `NOT_LISTENED`. CH1 정상 boss개방/death-revive-retry/native6/durableSave/A급 미인수. 사용자 기존 탭 무조작, live 적용 확인0. |
| EVIDENCE | 외부 `ch1-painted-magnification-sharpness-20261008/implementation.json`, `validation.json`, `docs-search.json`, `completion.json`. |

#### §23 MAP PRODUCTION REPORT

| 영역 | 결과 |
|---|---|
| STAGE | 실제 CH1-1/si0, 기존 2.5D opt-in 지면 material 1건. guide v0.9 전체와 SSOT/현행 production LOCK 적용. |
| MASTER silhouette / regions / main route / side spaces | 기존53점/8구역·200²/T40/world8000·6시 START→12시 EXIT·우회 유지; geometry/nav 변경0. |
| OUTER MASS LEFT / RIGHT / TOP / SOUTH / major holes | 기존 baked 외곽 그대로; 새 강/용암/외곽 질량 제작0. 남은 구멍·외곽 품질 미검수. |
| LARGE source assets / composites / overlap / repeated silhouette | 기존64 production PNG 그대로. 새 원화·중복 forest42·배치0, 기존 반복 잔여. |
| MEDIUM connections / remaining holes | 접합 구조 변경0·기존 부족함 미해결. |
| GROUND shadow / contamination / structure integration | 원래 RGB sample의 확대 대비만 보정. alpha·그림자/오염 구조·평면높이0 유지, 원화 누락 detail 복원0. |
| PLAYABLE main arenas / travel / breathing / threat / combat readability | 이동·전투 공간·AI·피해·경고·save 변경0; 실전 가독성은 미검수. |
| LANDMARK primary / secondary / tertiary | 기존 배치 그대로, 신규 제작0. |
| CAMERA QA START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 전부 신규 native NOT_RUN. CPU를 카메라 검수로 계산하지 않음. |
| TECH QA route / collision | 코드 변경0; 신규 실제 이동 검수0. |
| TECH QA pageerror / 404 / seam / loading | 신규 browser0, 실결과 UNKNOWN. seam은 경계 sample 원본 유지의 source 계약만 확인. |
| TECH QA performance | 확대 추가 fetch4회, 실제 GPU 성능 UNKNOWN. |
| FILES stage-owned / concurrent / unrelated | module1+관련 검색매칭 docs13만 소유; game/3.3·원PNG/scene/nav·owner giantSTATE·usersave 쓰기0. |
| GIT staged / commit / push / deploy | 정확 소유14paths만 정상 보존, commit/push/remote exact는 외부 completion.json 최종값 참조. deploy0. |
| VISUAL VERDICT | RETOUCH / UI_NOT_ASSESSED. |
| NEXT PASS | 실제 허용 native 화면에서 선명도·halo·청크 seam·전투 가독성·GPU 비용 확인 전 visual PASS 금지. 추가 병렬 배정0. |
