# CH1-1 공통 피부 바닥87차 — 2026-09-29

> 2026-09-30 후속: 이 문서의 피부 바닥·동맥·배경 버전은 유지하고, 1-1 외곽 손 배치 나무만 [Sunburst 생체나무 88차](CH1_SUNBURST_TREE_PASS88_20260930.md)로 교체했다. 아래 NEXT PASS 중 나무 원화 교체는 적용됐으나 외곽 식생 재질 접합과 전체 시각 검수는 남아 있다.

바닥이 구역마다 다른 재질처럼 얼룩져 보인다는 사용자 지시에 따라, 초록 낙엽·갈색 흙·회색 피부 패치를 공통 저대비 피부 바닥으로 연결했다. 이후 사용자가 제공한 \Pictures\Screenshots\스크린샷 2026-09-29 093252.png의 질감을 좋다고 확인했다. [사용자 승인 질감](../../captures/ch1_floor87/user-approved-reference.png)을 현행 결·명암의 기준으로 기록한다. 전면 맵 재생성이나 동선 변경은 없다.

## 현행 코드·에셋 계약

| id | 적용 위치 | 값·공식 |
|---|---|---|
| FLOOR87_RUNTIME | game.html / production_finish | cache/bakeVersion 20260929-floor-87; living module20260929-87; stage0 production에만 적용 |
| FLOOR87_GEOMETRY | layout.js | 기존53점/8구역/200²타일/T40/8000²world; buildRLE SHA256 719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c; 구역 ground 이름8개는 corpse-skin |
| FLOOR87_MASTER | 정적 배경 | master8192²;64청크;core1024px→world1000px;bleed1px;PNG1026². 변경47/동일17청크 |
| FLOOR87_LAYER | retouch-layers.json | skin65→outer66..85→floor87 총22개. floor87_sources/floor87_patch.png, x0/y0/8192², 이미 합성된RGB와binary alpha0/255. 원본21레이어 유지 |
| FLOOR87_INPUT | 생성 | Higgsfield GPT gpt_image_2_5; reference job8297189f-c4f9-4719-91f1-7cb5df20c1a6; new job9d977521-2f4a-419b-aef8-d1f91c1b19e9;1:1/2k/high/count1;견적2.75credits;fallback미사용 |
| FLOOR87_MATERIAL | commonSkin | 2048²;256px 중첩;1792px 주기;양축 smoothstep 가중 합성4표본. 구조물 회전·미러0. paint RGB=material RGB×[.58,.62,.67] |
| FLOOR87_NAV | 바닥 마스크 | authored layout.contains(x+.5,y+.5)=true의nav1만. 200²nav mask→nearest8192²→Gaussian blur34px→비보행 강제alpha0. G.map의벽1과이nav1은다른계약 |
| FLOOR87_ALPHA | 정적 합성 | A=round(.94×softNav/255×(1−rootKeep)×(1−brightKeep)×255)/255; RGB=round(base×(1−A)+paint×A), 기존source alpha보존 |
| FLOOR87_ROOT | 기존뿌리9개 | root_fan1536×1024의 기존scale×.37/40.96으로rx/ry; r=hypot((tx−cx)/rx,(ty−cy)/ry); keep=1−smoothstep((r−.72)/.40). 여러root의max keep. core681744px 변경0 |
| FLOOR87_BARK | 밝은수피·돌 | peak=max(original RGB); brightKeep=smoothstep((peak−72)/38). 원본peak≥110픽셀합성0 |
| FLOOR87_PIXELS | 보호 | 보행31826023px변경; 비보행0/보호root core0변경. 원본master·64청크·코드·관련docs백업 tmp/ch1-floor87/pre87 및 docs-before |
| FLOOR87_REGION_SKIN | regionalSkin5종 | 공통palette #353032/#3d3535/#353032;gradient0/.45/1,방향·seed1397+variant×971유지. stain12개(기존28)/darkrgba(27,22,26,.06)/lightrgba(118,101,84,.04). 미세입자9500·짧은주름23/각variant기존연결주름·lobes유지 |
| FLOOR87_REGION_DRAW | Ch1LivingDetail.draw | 다섯region모두기존globalAlpha×.30. 좌표·표시크기·culling·surfaceOnly제외유지. cache각768×512 RGBA/1.5MiB,최대5장7.5MiB유지;새canvas·매프레임추가draw0 |
| FLOOR87_MOTION | 생체효과 | 기존동맥·나무·캠프손·늪/버블/가스유지. 신규움직임0.86차 유휴큐3ms목표/requestIdle120ms/timer8ms유지 |
| FLOOR87_BUILD | tools/build_ch1_floor_unification.mjs | 오프라인고정합성. 기본base tmp/ch1-floor87/pre87 또는 --base 디렉터리. pre87 rawSHA검사로현재master에중복적용금지. durable source floor87_sources 우선. 일반production builder는22레이어를마지막에적용하고 commonSkin메타를재생성 |

구역평균은 각anchor±3타일 사각형 중 mask≥200 픽셀의 원본RGB/변경RGB 평균이다. 런타임 fog/lighting을 포함한 화면색 측정은 아니다. 전구역의R평균 범위31.812→4.916, G29.35→4.611, B23.467→4.553으로 줄었다.

| 구역 | tile | 이전 평균R/G/B | 현행 평균R/G/B | 표본px |
|---|---|---|---|---|
| south_entry | [100,185] | 46.217/37.887/31.804 | 47.694/41.631/41.992 | 60160 |
| first_clearing | [100,151] | 46.243/39.11/35.776 | 48.086/42.127/42.837 | 60516 |
| root_bend | [83,125] | 39.71/33.414/31.197 | 45.427/39.527/40.037 | 60513 |
| west_camp | [45,100] | 44.403/37.179/29.773 | 48.163/42.182/42.424 | 60136 |
| corpse_basin 우회 | [84,90] | 43.908/38.834/33.662 | 47.769/42.418/42.859 | 60265 |
| east_terrace | [147,97] | 27.87/20/17.212 | 45.506/39.703/40.089 | 60059 |
| north_fork | [100,52] | 45.117/36.703/30.883 | 47.344/41.282/41.781 | 60354 |
| north_exit | [100,22] | 59.682/49.35/40.679 | 50.343/44.138/44.59 | 60203 |

| 보호 id | cx / cy / rx / ry, 타일 |
|---|---|
| ROOT_0 | 103 / 96 / 11.79375 / 7.8625 |
| ROOT_1 | 78 / 177 / 7.215 / 4.81 |
| ROOT_2 | 59 / 128 / 6.9375 / 4.625 |
| ROOT_3 | 129 / 121 / 6.52125 / 4.3475 |
| ROOT_4 | 75 / 29 / 5.8275 / 3.885 |
| ROOT_5 | 81 / 154 / 5.55 / 3.7 |
| ROOT_6 | 124 / 153 / 4.995 / 3.33 |
| ROOT_7 | 80 / 40 / 5.55 / 3.7 |
| ROOT_8 | 127 / 45 / 5.2725 / 3.515 |

## 검수·성능

| 항목 | 결과·한계 |
|---|---|
| 자동 회귀 | 72PASS/0FAIL. 생체움직임·캐시·스테이지격리·뿌리그림자·언덕충돌·START/EXIT·retouch/query일치 검사. 기존north-gate 검사에서QA분기를고려하지않던고정문자열검사를본편/QA/다른stage/미적용4경우의실제분기실행으로보강. gate런타임코드변경0 |
| retouch 재현 | pre65 master→22레이어전체RGBA가현행master와완전동일. rawSHA a4987da3d5390e93581eed938e24fa49eabcbd0a0717ce63562612988bf13807. 일반 builder의기초합성전체를이번에다시실행한것은아님 |
| 청크 | 64개모든RGBA픽셀이master의clamped bleed와동일/224경계strip;64HEAD200/실패0 |
| 모듈 | 디스크/HTTP SHA256 e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640 동일 |
| 지형 | before/after G.map 완전동일;자동회귀가START→EXIT/기존우회와POI접근확인. 실제무보정종주·보스클리어·1-2진입은이번범위아님 |
| 실제화면 | 변경전Edge8시점/변경후Chrome8시점. 별도QA소스는현행game.html복사+basehref/세이브API변경·localStorage쓰기차단뿐;지형·렌더소스는본편과동일. after viewport2534×1318/DPR1;ANGLE AMD Radeon RX9070XT D3D11. 브라우저·viewport·시간별조명차이가있어스크린샷픽셀차이를수치효과로사용하지않음 |
| 로딩·오류 | after57청크ready/visible=drawn12·decode/requesterror0;pageerror0. 첫GPUwarm max186.7ms가있으며cold hitch해결선언아님 |
| 실제Edge FPS | 사용자가플레이하던탭을변경하지않고12.0014초관측. viewport2537×1270/DPR1/무제한cap0,237~240gameFPS/239.555rAF FPS;p95 4.3/p99 4.4/max8.5ms/34ms초과0. 이표본은적0명,고밀도전투·장시간안정성증명이아님 |
| 백그라운드측정 | 별도Chrome탭에서브라우저비활성으로rAF약1초간격/FPS약1.0. 성능회귀값으로판정하지않고무효표본파일을별도보존 |
| 메모리·전송 | 64PNG 합계130803041→131728578bytes(+925537/+0.708%);청크수·해상도·GPUtexture크기·runtime draw·상주canvas추가0. 원본재질/마스크/patch는빌드출처용이며런타임추가로딩0 |
| 사용자 화면 | 승인스크린샷과사용중인Edge게임유지. QA옵션·위치변경·새로고침을사용자현재탭에추가적용하지않음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0. 공통 제작가이드v0.9 전체→맵디테일→SSOT를읽고 기존MASTER/OUTER MASS/CONNECTION을보존한상태에서 GROUND→PLAYABLE/COMBAT→CAMERA QA→TECH QA순서로진행했다.

| 구분 | 결과 |
|---|---|
| MASTER | 기존silhouette/53점/8구역·6시START/12시EXIT·본동선과side spaces유지. 지형변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH모두비보행픽셀변경0. 검정공동을되살리지않고85차외곽보존 |
| LARGE | 기존large source/composite/overlap보존. 사용자승인공통피부material1장추가;구조물추가/회전/미러0. 기존식생silhouette반복은이번수정범위아님 |
| MEDIUM | 기존나무–뿌리·사목연결보존.9root core와밝은수피보호·전이feather;외곽새holes0 |
| GROUND | 낮은피부결·미세모공·얕은주름을보행공간전체에연결. 초록/갈색패치와큰괴사얼룩대비감소. 접촉그림자·특수늪표면유지 |
| PLAYABLE/COMBAT | 넓은전투공간/여백/위협공간·이동충돌유지.8뷰에서player·동맥·기존소환굴/불꽃/늪·제단분리확인;사용자스크린샷의공격/VFX하단바닥질감승인. 고밀도전투추가FPS검수미실시 |
| LANDMARK/CENTER | 기존primary시체나무/secondary제단·늪·야영지/tertiary뼈아치·출구유지.바닥은공통재질,장소차이는구조·높이·랜드마크로표현 |
| CAMERA QA | START[100,185]/EARLY[100,157]/ARENA[100,120]/SIDE L[49,151]/SIDE R[151,136]/LANDMARK[102,90]/LATE[100,48]/EXIT[100,15].전후각8뷰저장 |
| TECH QA | 지형동일/회귀72PASS/22레이어재현/64청크모든픽셀·224strip동일/HTTP64정상/pageerror0.실제Edge237~240FPS는12초적0표본.저사양·노트북/NW.js·장시간·밀집전투FPS미검증 |
| FILES | master·47청크·preview·layoutground명·meta2·floor87source5·livingpalette4곳·mainquery2곳·builder메타·바닥bake도구·관련docs.공유game/CHANGELOG의타작업변경보존 |
| GIT | 바닥code/asset/docs만범위별로컬체크포인트.실제해시·index보존결과는 captures/ch1_floor87/completion.json 기준.기존100개초과타작업changes를숨기거나강제커밋하지않음. push/deploy0 |

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 / stage0 / 공통 피부 바닥87차

MASTER
- silhouette: 기존53점 경계 유지; 변경0
- regions: 기존8구역, ground 이름만 corpse-skin으로 통일
- main route: 6시START→12시EXIT 및 상단 통로 유지
- side spaces: 기존 좌우 우회·POI 접근 유지

OUTER MASS
- LEFT: 기존85차 외곽 보존
- RIGHT: 기존85차 외곽 보존
- TOP: 기존85차 외곽 보존
- SOUTH: 기존85차 외곽 보존
- major holes: 비보행 픽셀 변경0; 바닥 수정으로 새 외곽 공동 생성0

LARGE
- source assets: 사용자 승인 공통 피부2048² 1장; 기존나무·뿌리·돌 유지
- composites: floor87 preblended8192² patch를22번째 retouch로 적용
- overlap: texture양축256px 중첩/1792px 주기; 큰 구조물 배치 유지
- repeated silhouette: 바닥 구역색 차이 감소; 기존식생 실루엣 반복은 후속RETOUCH

MEDIUM
- connections: 기존 나무–뿌리 연결 유지;9root core681744px·밝은 수피 보호
- remaining holes: 이번 범위에서 외곽 holes 추가0; 전체 식생 연결 품질 후속RETOUCH

GROUND
- shadow: 기존 접촉 그림자 보존; runtime조명 추가0
- contamination: 큰 얼룩12개/.06 또는 .04; 공통 palette/frame alpha .30
- structure integration: 보행마스크34px feather·root .72/.40·밝은수피72..110 보호

PLAYABLE
- main arenas: 기존 넓은 전투공간 유지; 지형 변경0
- travel space: 기존 START/EXIT·side routes 유지; G.map 전후 동일
- breathing space: 기존 여백 유지; 중심 scatter/장애물 추가0
- threat space: 기존 동맥·늪·소환굴·랜드마크 위치와 효과 유지
- combat readability: 8뷰의 player/동맥/소환굴/제단 구분 및 사용자 공격 화면 질감 확인; 고밀도 전투 추가검수 미실시

LANDMARK
- primary: 기존 시체나무 유지
- secondary: 기존 제단·늪·야영지 유지
- tertiary: 기존 뼈아치·출구 유지

CAMERA QA
- START: [100,185]
- EARLY: [100,157]
- ARENA: [100,120]
- SIDE L: [49,151]
- SIDE R: [151,136]
- LANDMARK: [102,90]
- LATE: [100,48]
- EXIT: [100,15]
- 전후 각8뷰 저장; viewport/조명차이 때문에 스크린샷 픽셀차이는 성능·재질 수치로 사용하지 않음

TECH QA
- route: 자동 회귀PASS; 실제 무보정 종주·1-2진입 미검수
- collision: geometry SHA/G.map 동일; 충돌 변경0
- pageerror: 검수 페이지0
- 404: 64청크HEAD 모두200; 다른 전체 리소스의 404가 없다는 선언은 아님
- seam: 64청크의 모든 RGBA/224경계strip이master와동일
- loading: ready57/visible=drawn12,decode/requesterror0; coldGPUwarm 최대186.7ms 잔여
- performance: Edge12.0014초/적0/237~240FPS/34ms초과0; 장시간·밀집전투·노트북/NW.js 미검증; 백그라운드Chrome측정무효

FILES
- stage-owned: 바닥code/asset/docs106개; 전체 목록 tmp/ch1-floor87/checkpoint-plan.json
- concurrent touched: game.html·CHANGELOG·관련공유docs의 바닥 버전/현재계약만 커밋; 기존동시수정 보존
- unrelated touched: 다른게임·UI·환경작업을 이번 art commit에 포함0; 기존dirty114개 유지

GIT
- staged: 바닥 art commit 이후 자체대기0; 기존34개 staged path/각공유staged blob·타indexentry 보존 검증
- commit: art f41bc3adf5610601b4499c06f9534c4394e28065; 보고서 최종체크포인트 해시는 captures/ch1_floor87/completion.json
- push: 미실행
- deploy: 미실행

VISUAL VERDICT: PASS (사용자 승인 바닥 질감·일관성 범위) / 전체 맵 RETOUCH

NEXT PASS: 승인 바닥 결 유지; 기존 식생·부패재질·반복 실루엣 후속정비
```

**VISUAL VERDICT: PASS — 사용자승인바닥질감과구역재질일관성범위. 전체 맵의식생·반복실루엣·고밀도VFX까지완성됐다는판정은아니며전체맵은RETOUCH.**

NEXT PASS: 이번승인바닥결을유지하고외곽식생·나무의부패재질일관성을별도범위에서다듬는다. 바닥을다시얼룩진서로다른biome으로나누지않는다.

증거: [전후8카메라](../../captures/ch1_floor87/index.html), [검수계약](../../captures/ch1_floor87/verification.json), [22레이어/64청크](../../captures/ch1_floor87/technical-verification.json), [72검사](../../captures/ch1_floor87/tests.log), [실제Edge](../../captures/ch1_floor87/edge-live-performance.json), [무효백그라운드측정](../../captures/ch1_floor87/background-performance-invalid.json).

생성프롬프트·reference/job/파라미터는 [generation.json](../../assets/map/ch1/production_finish/floor87_sources/generation.json), 합성수치·9보호타원·47청크·SHA는 [prep.json](../../assets/map/ch1/production_finish/floor87_sources/prep.json)에기록했다. 원본 material SHA256 0e974eedc1f847aea262767831c36ea9896a6f10180df0479c30c4955483a187;pre87 rawSHA 19e4719dc855da64d0fece88c7ad2a9977ea81759fa1d7e3b1071252330d3433.
