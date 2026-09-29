## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — CH1-1 피부–사목 접합85차 적용

현행 cache/bakeVersion은 **20260929-outer-85**, 빌드 레이어는 **21개**다. 서측 하단의 피부 바닥–사목 어깨를 낮은 부패 수피·괴사막으로 연결했다. 비보행101764px만 변경/보행0/고목 핵심 보호3579735px 변경0, 변경chunk1_6 1개·동일63개. 새로고침한 본편8기본 카메라+접합·전투2위치, 이벤트 기반 S/W 이동·24적 공격/Q, 게임error·contextloss0/64청크 응답실패0. 기존 회귀55PASS,21레이어 전체 마스터 재현·224경계 동일. 새 모션0/geometry·충돌 변경0. 전체 **VISUAL VERDICT: RETOUCH**.

[85차 수치·출처·MAP PRODUCTION REPORT SSOT](CH1_OUTER_CONNECTION_PASS85_20260929.md). 아래84차 이하의 '현행'은 당시 제작 이력이다.84차의 미완료 문구는 저장된 최종 검수로 보정했다.

> 2026-09-28 현재 72차: 남측 시작 오른쪽 비보행 외곽에 낮은 부패 목질·수피판·검은 공동을 부분 반영했습니다. 중심 tile[129,181], master/3청크(cache `20260928-outer-72`), 433,965픽셀 변화·보행 픽셀 변경0. 후보 전후7·일반 본편35카메라·오류0·회귀8 PASS, 64청크/224경계 strip 및 skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72 helper 전체 재현. 늪 버블·가스·동맥 유지. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 당시 이력이며 production SSOT의72차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 71차 기록(72차 이전): 남동 부패 뿌리 한 개를 tile[184,158]→[178,150]으로 재배치해 보행 경계의 목질 공동·접합 가독성을 개선(master/4청크 x6..7/y5..6). production cache `20260928-outer-71`; 1,103,760픽셀 변화·보행 픽셀 변경0, 본편30카메라·오류0·회귀8 PASS. 기존70자리 복원543,276픽셀과 새 위치를 보정patch로 기록, skin65→outer66→outer67→outer68→outer69→outer70→outer71 보존. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 당시 이력이며 production 문서71차 보고가 우선합니다.

> 2026-09-28 70차 기록(71차 이전): 남동 비보행 외곽에 낮게 무너진 부패 뿌리·수피판·목질 공동을 부분 반영(master/3청크 x7/y5, x6..7/y6). production cache `20260928-outer-70`; 686,730픽셀 변화·보행 픽셀 변경0, 본편29카메라·오류0·회귀8 PASS. skin65→outer66→outer67→outer68→outer69→outer70 보존, 전체 VISUAL VERDICT RETOUCH. 아래 이전 현행 표기는 당시 이력이며 production 문서 70차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 69차 기록(70차 이전): 동쪽 비보행 외곽에 기울어진 속빈 고목과 낮은 부채꼴 뿌리를 부분 반영(master/3청크 x7/y3, x6..7/y4). production cache `20260928-outer-69`; 801,475픽셀 변화·보행 픽셀 변경 0, 본편25카메라·오류0·회귀8 PASS. skin65→outer66→outer67→outer68→outer69 보존, 전체 VISUAL VERDICT RETOUCH. 아래 이전 pass의 현행 표기는 당시 기록이며 상세 계약은 production 문서 69차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 68차 기록(69차 이전): 북쪽 비보행 외곽에 쓰러진 속빈 고목을 부분 반영(master/6청크 x1..3/y0..1). production cache `20260928-outer-68`; 보행 픽셀 변경 0, 본편 21카메라·오류 0·회귀 8 PASS. 67차 실제 원화 1024²/scale1.5로 정정했으며, master/64청크 불일치 기록은 검사기 좌표 오류였다. 전체 VISUAL VERDICT RETOUCH. 상세는 CH1_1_PRODUCTION_FINISH_20260916.md의 68차 MAP PRODUCTION REPORT.

> 2026-09-28 67차 기록(68차 이전): 북서쪽 비보행 외곽의 건강한 수풀 띠를 죽은 속빈 목질·내부 숲 질량으로 부분반영(master/4청크 x0..1/y1..2). production cache `20260928-outer-67`; 보행pixels 변경0, 65차 피부·66차 서쪽 고목·생체모듈61차 보존. 생성본의 체크무늬 배경은 폐기하고 background-remover cutout만 사용. 전체 VISUAL VERDICT RETOUCH.

> 2026-09-28 현재 66차: 서쪽비보행외곽에썩은고목·통나무·뿌리질량을부분반영(master/4청크x0..1/y3..4).production cache `20260928-outer-66`;65차피부/생체모듈61차보존.보행pixels변경0.재베이크는skin65→outer66패치순서,전체8192²픽셀재현확인.아래이전버전은이력;전체VISUAL VERDICT RETOUCH.

## 2026-09-28 — 65차 피부 바닥 본편 반영

첫공터→root_bend→나무앞→서쪽의63/64/65차 저대비피부재질을기존production master와30청크에부분반영했다.배경cache는`20260928-skin-65`,Ch1LivingDetail생체모듈은61차그대로다.아래62~64차의production61차유지문구와9월17일버전은당시이력이다.기존outer비교cache20260917-depth-2/diablo20260924-blockout-2는유지한다.

| id | 본편 계약 | 값 |
|---|---|---|
| SKIN65_AREA | 원본·레이어 | 8192²master crop[2007,2867,5447,7249],3440×4382.63차Higgsfield gpt_image_2_5재질1024²재사용;추가생성없음 |
| SKIN65_BLEND | 재질 | anchor[2498,4587],RGB×.53;sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4).기존63/64mask·pixels보존 |
| SKIN65_WEST | 추가영역 | tile타원[69,100,12,25],[73,123,12,15],alpha.60/feather.35/smoothstep.64mask와max union |
| SKIN65_PROTECT | 보존 | 타원[105,95,20,15],[108,79,18,10];protect=smoothstep(clamp((1.18-r)/.18));mask0 8,247,686pixels변경0/새서쪽밖64pixels변경0 |
| SKIN65_CHUNKS | production | x1..5/y2..7 30청크.전체64×1026²(core1024/bleed1);단일master에서crop검증.월드끝bleed는끝pixel복제.나머지34청크보존 |
| SKIN65_SOURCE | 복구·생성기록 | assets/map/ch1/production_finish/skin65_sources의재질/crop/layer/mask/prep/generation 6파일.원본master+30청크backup은tmp/ch1-production-pre65 |
| SKIN65_QA | 비교 검수 | 14카메라before64/after65,임시24적·탄·공격/Q;G.map동일;관찰pageerror/HTTP오류0;224stripPASS.본편경로검수결과는제작보고에후속기록 |
| SKIN65_STATE | 판정 | VISUAL VERDICT: RETOUCH.낮은바닥재질만부분반영.전체외곽·건강한식생·중앙캐릭터중첩·성능검수잔여.새피부맥동미구현;기존늪가스/버블/동맥유지 |

[65차제작보고](../../captures/ch1_ground_skin65/REPORT.md) · [실제화면비교](../../captures/ch1_ground_skin65/index.html).현행복구가능수치·좌표는[production SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#skin65)에도보존한다.

> **2026-09-17 리터치 이력:** bake/cache `20260917-depth-2`. 신규 숲 원화 4종, 고정 외곽 42배치와 낮은 뿌리 9배치. CH1-1 hand `m_c1tree`만 화면 크기 0.72 / pivotY 0.72; 원본 metadata 1450 및 충돌은 유지. geometry/START/EXIT/진행 계약 유지. 최신 시각 판정 **RETOUCH**. [실제 화면·영상·검증 한계](CH1_1_DEPTH_RETOUCH_20260917.md). 아래 ground-2와 이전 PASS는 당시 이력이다.

# CH1-1 숲바닥 구성 적용 — 2026-09-16

사용자 지시: “그래 잘 못하면 따라하기라도 해봐”. 기존 검수 이후 새로 승인된 **실제 수정**이다. ec7bf70d8 배경은 tmp 백업과 이전 캡처로 보존했고 롤백하지 않았다.

## 실제 화면

[전후9곳·이동 영상·전투 화면 검수 페이지](http://127.0.0.1:3333/captures/ch1_ground_follow_20260916/index.html)

원본은 `captures/ch1_ground_follow_20260916/before|after/*.jpg`. 같은 캐릭터, 위치, 논리1920×1080, zoom1, DPR1.75, 기존 torch/fog/조명 유지. 변경 전은 동일 renderer가 백업한 이전 배경 청크를 로드한 런타임 화면이며 합성이 아니다. 안개/애니메이션 위상은 다르다. 이전 검수의 다른 캐릭터 캡처와 섞지 않는다.

## 적용 내용

딤레이스 정적 조사에서 확인한 WalkableFloor/Path/Dirt/Grass 레이어 분리를 참고했다. 이동 가능한 면 안에서 시각적 흙길·넓은 공터·낮은 이끼/낙엽을 구분하는 이번 고정 마스크는 EXODUSER용 설계다. 원작 자동 생성이나 실제 전구간 플레이 구조를 복제했다고 주장하지 않는다. 타 게임 추출 에셋을 사용하지 않았다.

| 구간 | 실제 바뀐 구성 |
|---|---|
| 남측 | 양옆 낙엽 바닥 사이 흙 진입 흔적, 첫공터로 확장 |
| 첫공터 | 비대칭 흙 공터와 이끼 가장자리 구분 |
| 숲길/야영지 | 서측 굽이와 야영지로 갈라지는 흙 재질 연결 |
| 시체나무 | 기존 나무 양쪽 우회로와 남측 분지의 흙/낙엽 구분 |
| 동측 | 기존 ramp로 이어지는 좁은 흙 접근 흔적 |
| 북측 | 불규칙 공터, 물가/고치 방향 분기, 기존 출구축으로 수렴 |

낙엽/이끼는 보행 가능한 낮은 재질이다. 새로운 수풀 벽이 아니다. 기존 큰 외곽·중형 연결 원화 배치56개를 유지하며 그 안쪽 바닥의 역할을 구분했다. 배경 외곽 재설계나 전체 맵 완성을 주장하지 않는다.

### 런타임/재현 계약

| 항목 | 현재 값 |
|---|---|
| geometry version | 20260916-finish-1 유지 |
| bake/cache version | 20260916-ground-2 |
| 적용 | 실제 stage0, 기존 genFromTemplate/production_finish 청크 |
| game.html 변경 | 청크 캐시 버전 문자열1곳만 |
| 크기/START/EXIT/나무/충돌/스폰 | 변경 없음. geometry hash 719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c |
| 기존 지면 | ground_dark_soil.png, brightness .55→.85, saturation .58→.48 |
| 신규 재질 | materials/forest_moss_litter.png, 생성1254²→타일512², brightness .76/saturation .55 |
| 마스크 | ground-zones.svg, viewBox200², 흙=white / 나머지=이끼·낙엽 |
| 마스크 가장자리 | turbulence .24 / octaves3 / 고정seed16, displacement2.6타일, blur .32타일 |
| 마스크 raster | 1024²에서 먼저 rasterize한 뒤 alpha8192² 확대. 원화 RGB blur 추가 없음. 기존 저주파 색 필드도512² PNG로 먼저 rasterize 후8192² 확대 |
| 출력 | master8192²,64청크1026²(core1024+bleed1), world8000² |
| 기존 접합 | groundEdge .24/radial .38/opacityMultiplier .7/forestEdge .095 유지 |
| 캐시·성능 구조 | 빌드 시 합성. 매 프레임 재질 생성/이미지 합성 추가 없음 |

위 seed는 고정 재질 경계의 미세 굴곡값이다. 맵 랜덤 생성기/무작위 배치가 아니다. 신규 에셋은 imagegen 스킬의 built-in image_gen으로 생성했다. 정확한 최종 프롬프트와 원본/타일 크기는 `materials/forest_moss_litter.metadata.json`에 보존했다.

## 실제 확인과 기술 결과

| 검사 | 이번 결과/범위 |
|---|---|
| 연결 | 새 실제 stage0에서 ground-2 청크 로드,9카메라 visible 청크 오류0 |
| 이동 | 최종 ground-2: START100.5,185.5→첫공터→숲길→나무 서측/북측→북측99.39304,14.96247. 실제 키 입력, 이동 중 좌표 변경 없음. 동측 목표122,96은 미도달(124.57,80.36에서 방향 변경). 출구 사용 미검증 |
| 이동 조건 | 기존 Lv500 mapqa, 적 비활성/네이티브 QA 보호. 완료 조건이나 일반 클리어 검증이 아님 |
| 이동 원본 | 최종 GROUND_INPUT_WALK_FINAL.webm / mp4,124.347초,3360×1890,1864프레임. canvas15fps 요청, 오디오/HTML HUD 제외. 녹화 초반 메뉴 정지 후 ESC로 재개한 구간 포함 |
| 전투(ground-1 이력) | 낙엽 크기 보정 전 별도 testchar Lv500/mapqa=false,56적 시작, 추가 피해 무효 없음. 첫공터 이동/공격/추격 실제 관찰. 최종 관찰HP712.65/8359,처치0. 고레벨 QA이며 밸런스 판단 아님 |
| 회귀 | CH1 production/outer/smoothing 26검사 PASS. 다른 챕터 테스트 신규 재실행 안 함 |
| 배경 산출물 | 64청크 크기 정상,전체 인접 bleed112곳 일치 |
| 격리 | layout.js byte 동일,geometryHash/placements 동일,game.html은 버전 문자열 외 byte 동일 |
| 실행 로그 | ground-1 이동 관찰288이벤트/초기1회 truncated. ground-2 녹화 시작 후 error observer0. 이번 QA 조회식의 W 미정의 ReferenceError1건은 에이전트 평가식 오류로 구분. 손실 없는 전체 초기 로그/404 전수 확인은 미검증 |

일부 waypoint에서 반복 키 입력이 bladeDash를 발동해 목표점을 지나 왕복하는 모습이 있다. 좌표를 맞추기 위해 텔레포트하지 않았다. 이것을 끼임/지형 오류로 판정하지 않았다. 최종 경로/좌표는 input-walk-final.json에 남겼다. ground-1의164.533초 영상과 input-walk.json은 보정 전 이력으로 보존했다. 일부 목표점에는 도달하지 못했으며 충돌 전구간 PASS라고 하지 않는다. 전투의 입력/HP/적 위치는 combat-qa.json에 별도 저장했다.

### 동일 조건 정지 성능

같은 탭/캐릭터,위치100,151,논리1920×1080,zoom1,torch/fog 유지,적 없음,빌드 완료 후 Page.bringToFront,각5초. 이전/이후 배경만 교체했다. 처음의1096×616 또는 비활성 탭 저속 결과는 유효 비교에서 제외하고 동일 조건으로 재측정했다.

| 항목 | 이전 | 이후 |
|---|---:|---:|
| 시간 | 5003.5ms | 5001.8ms |
| rAF 표본 | 1187 | 1174 |
| P50/P95/P99 | 4.2/4.3/4.4ms | 4.2/4.3/8.2ms |

이후 P99가 높았다. 이 짧은 표본만으로 성능 개선이나 회귀 원인을 단정하지 않는다. 이는 짧은 정지 rAF 비교이며 CPU/GPU 분해·동일 전투 부하·저사양/NW.js 성능 검증이 아니다. 시각 완성도의 근거로 사용하지 않는다.

### 실제 화면 후 리터치

첫 bake ground-1에서 낙엽이 캐릭터 대비 크게 보여 타일1024²→512²로 줄인 ground-2를 최종 적용했다. 전후9쌍/전체 배치/정지 성능/이동 영상을 최종 버전으로 갱신했다. 적 활성 전투 화면은 ground-1 이력이며 ground-2 정상 전투를 대신하지 않는다.

## 시각 판정과 남은 한계

**VISUAL VERDICT: RETOUCH.** 흙길/낙엽 면의 재질 구분과 갈림은 이전보다 읽힌다. 전체 상용 스테이지 완성을 뜻하지 않는다.

- 01남측/03숲길/06출구: 전후에 없던 길 가장자리와 낮은 낙엽 재질 구분 확인. 기존 어둠 속 원거리 대비는 낮다.
- 02첫공터: 넓은 흙 전투면 유지. 중심 카메라에서는 일부 가장자리가 화면 밖이므로 장소 차이가 가장자리보다 약하다.
- 04나무: 양쪽 바닥 변화는 있지만 큰 나무 원화의 지배적 크기와 가림 문제는 남아 있다.
- 05서측: 하단 얼굴/뿌리와 좌측 세로 숲의 반복 모티프는 그대로 남는다. 이번 변경으로 해소했다고 하지 않는다.
- 08단구: 기존 타원형 높이 음영 접합을 수정하지 않았다.
- 전투: 캐릭터/적/발사체를 관찰했으나 다수 적·기존 효과가 중앙에서 겹친다. 모든 밀도 가독성 PASS 아님.
- 이번 변경 후 일반 Lv1 클리어/보스 완료/1-2 진입은 재검증하지 않았다. 이전 검수의 Lv1 두 번 사망 결과는 이전 배경의 기록이다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: CH1-1 / stage0
MASTER: 기존53점 경계/8구역/남→북/야영지·단구 분기 유지
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 기존 큰 숲 유지; 안쪽 이끼·낙엽 지면 연결
LARGE: 기존 자체 원화56레이어 유지; 동일 얼굴·뿌리 반복 잔여
MEDIUM: 기존11개 연결 유지; 지면의 야영지/단구 분기 보강
GROUND: fixed soil mask + low moss/litter; 기존 조명·오염·뿌리 레이어 유지
PLAYABLE: 기존 전투/보행/위험공간·충돌 보존; 지면 재질 전체 통과 가능
LANDMARK: 거대 시체나무/야영지/단구/물가 위치·크기 보존
CAMERA QA: START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 9곳 실제 전후
TECH QA: 26검사/64청크/112bleed/geometry·placement 불변; 입력 이동; 로그 범위 제한
FILES: production_finish 재질·mask·bake, 빌더, game cache tag, docs, 로컬 증거
GIT: 이번 변경과 이전 검수 docs만 분리. 무관 Steam/guard/userdata 보존. push/deploy 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 외곽 반복 원화와 나무 가림/단구 접합은 남은 별도 국소 작업
```

## 변경 파일·증거·recap

- 실제 적용: `assets/map/ch1/production_finish/ground-zones.svg`, `materials/*`, master/chunks/composition, `tools/build_ch1_production_finish.mjs`, `game.html`의 cache tag.
- 이전 보존: `tmp/ch1_ground_follow_20260916/backup/`에 원본 게임/빌더/production_finish 복사.
- 증거: `captures/ch1_ground_follow_20260916/`의 index.html, before/after9쌍, runtime-full-layout, 입력 이동 영상/JSON, combat 화면/JSON, technical.json, before/after-performance.json.
- 문서 검색: `tmp/ch1_ground_follow_20260916/docs-audit.txt`. 보호2_3문서 무수정.
- 이전 작업: ec7bf70d8 전체 제작 및 이후 일반 Lv1 두 번 사망/시각 RETOUCH 판정.
- 이번 추가: 신규 재질+전체 동선 고정 지면 마스크 실제 적용, 같은 카메라 전후, QA 입력 이동, 적 활성 가독성 확인, 산출물/성능 확인.
- 아직 미검증: 변경 후 일반 완주/1-2, 전체 초기 오류 로그, 모든 적 밀도/하드웨어. 전체 맵 완성이나 난이도 검증 완료로 보고하지 않는다.

## 고정 마스크 원문 — 수치·좌표 SSOT

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="8192" height="8192" viewBox="0 0 200 200">
  <!-- White is worn soil, transparent is low moss/litter. All surfaces remain walkable.
       Authored region shapes, not movement corridors or collision masks. -->
  <defs>
    <filter id="edge" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".24" numOctaves="3" seed="16" result="grain"/>
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation=".32"/>
    </filter>
  </defs>
  <g fill="white" stroke="white" stroke-linejoin="round" stroke-linecap="round" filter="url(#edge)">
    <!-- Arrival: a narrow visible trail opens into the southern side of the clearing. -->
    <path d="M101 198 C100 189 105 181 103 175 C102 170 98 167 99 161" fill="none" stroke-width="13"/>
    <!-- First arena: irregular open earth, with a moss tongue at its north-east shoulder. -->
    <path d="M86 167 C81 161 79 153 84 147 L91 144 C95 139 105 139 112 143 L116 149 C125 150 130 158 124 164 C117 170 108 174 101 171 L94 169Z" stroke-width="2"/>
    <!-- Forest bend and side camp form a branch, not one central S-shaped corridor. -->
    <path d="M93 144 C89 137 79 135 81 125 C83 117 80 111 82 104" fill="none" stroke-width="12"/>
    <path d="M83 121 C72 118 66 111 58 108 L46 105" fill="none" stroke-width="9"/>
    <path d="M34 102 C34 95 45 91 53 94 L59 99 C65 102 65 109 59 113 L48 115 C42 113 35 110 34 102Z" stroke-width="1"/>
    <!-- Corpse-tree roots interrupt the basin; both existing bypasses stay visible. -->
    <path d="M82 104 C77 96 80 86 88 80 C93 77 94 72 96 66" fill="none" stroke-width="13"/>
    <path d="M85 108 C95 111 105 113 115 106 C125 99 128 92 122 84 C116 77 105 73 96 66" fill="none" stroke-width="13"/>
    <path d="M91 105 C88 97 90 88 98 86 C107 84 115 91 116 100 C114 108 102 111 91 105Z" stroke-width="3"/>
    <!-- East approach follows the existing ramp; no new height or obstacle. -->
    <path d="M120 103 C126 105 131 101 136 99 L146 97" fill="none" stroke-width="8"/>
    <!-- Late clearing and water-side spur vary the route before the final approach. -->
    <path d="M96 66 C95 60 94 57 99 52" fill="none" stroke-width="11"/>
    <path d="M82 57 C79 50 88 44 95 45 L102 41 C113 42 119 47 116 54 L107 60 C98 64 88 62 82 57Z" stroke-width="2"/>
    <path d="M112 52 C126 56 139 56 153 52" fill="none" stroke-width="8"/>
    <path d="M87 55 C77 55 65 51 50 48" fill="none" stroke-width="7"/>
    <!-- Exit throat stays on the fixed north axis. -->
    <path d="M99 44 C103 36 99 29 100 20 L100 3" fill="none" stroke-width="12"/>
  </g>
</svg>

```
