# CH1-1 기존 맵 디테일·접지·생체 움직임

사용자 지시: 현재 1-1을 보존하고 디테일·입체감·동적 움직임만 추가한다. 기존 production_finish 베이스 위의 국소 보강이며 v4~v8 정지 원화의 게임 적용이 아니다.

## 런타임 계약

| id / 적용 위치 | 값 / 동작 |
|---|---|
| 구현 | `ch1-living-detail.js?v=20260927-18`, 전역 `Ch1LivingDetail.draw/deform/shadows/hideDuplicate/pit/organic`; `build-nwjs.mjs` 배포 FILES에도 포함 |
| 범위 | `G.stage===0`, `_bossArena` 및 `_fieldRebuildQA` 제외 |
| 지면 순서 | `_drawCh1Hill` 다음, 오브젝트·캐릭터·전투 효과 이전. `surfaceOnly=true` 잔물결은 맵 오브젝트 뒤/캐릭터 앞 |
| 앵커 배율 | `m_c1tree:2.1`, `m_c1cocoon:1.1`, `m_c1pool:1.25`, `m_c1spod:.65`, `m_c1sroot:.75`, `pit_poison:1.2`, `m_rotten_tree:1` |
| 실제 배율 s | 앵커 배율 × `min(1.6, mo.scale || 1)` |
| 시야 제외 | 카메라 반폭/반높이 + `160*s`; zoom=`max(.3, _edZoom || _camZoom || 1)` |
| 렌더 자원 | 런타임 생성 투명 canvas atlas 6종(조직3형태/독액 주변/수면/체액), 각각 1280², 4×4칸, 셀320², 16프레임. 최대 RGBA 37.5MiB, 최초 사용 후 재사용 |
| 접지 Y 오프셋 | `m_c1tree:230`, `m_c1cocoon:100`, `m_c1spod:40`, `m_rotten_tree:50` px × `(mo.scale || 1)`; 기타0. 수면은 오프셋0 |
| 합성 | source-over 기본, 인접 두 프레임 alpha `1-mix`/`mix`. GPU에는 `drawImage`만 전달, 곡선/gradient는 native Canvas2D에서 최초 베이크 |
| 맥동 | 각속도 `.00095 rad/ms`, 약6.614초/주기; 앵커 위상 `x*.017+y*.011`; 프레임16개 사이 선형 혼합 |
| 접촉 그림자 | 중심(12,24), Y축 .42; 반경12→156, alpha `.48/.25/0`(stop `0/.48/1`) |
| 힘줄 | dry3/4/5갈래, wet5갈래; seed=variant*1.7, 각도간격2.399rad, 길이 `100+42*sin(seed+j*1.7)`, 지면 Y `.55`; 고정 시작부(0,14), 중간 굽힘7*sin(phase-j*.8)*sin(πu)^2 px(10차), 끝점 고정, 갈래 위상차.8rad |
| 힘줄 명암 | 4차 연속 리본 면: 아래 공식 표 참조. 기존24분절 스트로크를32구간 표본의 연결 면으로 교체, 겹치는 선 끝의 어두운 마디 제거 |
| 독액 | `m_c1pool`/`pit_poison` 주변 끊어진 잔물결3개; X반경14→59, Y반경5→17, alpha 최대.16. 맥동과 같은 주기 |
| 고치·독낭 | `m_c1cocoon`/`m_c1spod`만 변형; `sin(now*.00105+x*.017+y*.011)`, 약5.984초; X±1.8%, Y∓1.2%, 기준점 `(x,y+32)` |
| 나무 움직임 | `m_c1tree`, `m_rotten_tree`, `m_vine_pillar`, `m_ctree숫자` 대상. wave=`sin(now*.00072+x*.017+y*.011)+.3*sin(now*.00131+y*.019)`; 시체나무 회전wave×.009rad, 기타×.018rad |
| 나무 접지 | size=`(meta.sz||400)*(scale||1)`, pivot=(x,y+size×.2016) 시체나무 / (x,y+size×.45) 기타. 회전 시 밑동 고정, 충돌 불변 |
| 투영 그림자 | 위 나무의 기존 이미지 알파를 이용해 최초1회 생성, 이미지별 WeakMap 캐시. 640×320 transparent canvas; source rect 반영; translate(170,24), transform(1,0,-.55,-.52,0,0), blur4px, 원본을(-145,-400,290,400)에 투영 |
| 그림자 명암 | source-in RGB(8,5,12), Y24→260 gradient alpha .65/.36/0 @stop0/.65/1. 런타임 alpha .6, scale=`size*(시체나무?.72:1)/400`; X drift=`sin(now*.00072+x*.017+y*.011)*4*scale` |
| 그림자 위치/제외 | (x-170×scale+drift,foot-24×scale), 크기(640×scale,320×scale); 카메라 반폭/반높이+size 밖 제외. 소스 미로드 시 스킵 |
| 길 가장자리 조직 | `tissue_bed:1.8`, 아래 고정11좌표. MAP_OBJS·충돌에 추가하지 않는 지면 렌더, 새 scatter 아님. 기본 맥동 주기 공유, angle은 고정 회전 |
| 보존 | MAP_OBJS/geometry/collision/START/EXIT/진행/데미지/원본 청크 수정 없음. 자동 scatter 추가0 |
| 폴백 | 스크립트 미로드 시 optional global 검사로 기존 맵을 계속 렌더. 신규 외부 이미지 다운로드 없음 |

색상/곡선 제어점의 상세값은 동명의 소스에 대응하며 조직 몸체 RGBA `(87,44,52,.78)`, 독액 몸체 `(63,61,35,.65)`, 상면 `(158,119,114,.3)`, 가지 `(71,43,44,.3)`, 잔물결 RGB `(149,142,83)`이다. 전체 지면 피부 교체와 대형 외곽 높이 재설계는 범위 밖이다. 동측 작은 구덩이 깊이/국소 수축은 9차에 적용, 기존 대형 원화의 벽 분리 변형은 미구현이다.

### 2차 길 가장자리 고정 좌표

월드 좌표는 `(타일+.5)*40`. 각 패치는320×1.8=576px footprint이며 지면 낮은 조직이다.

| id | 타일x | 타일y | 회전rad |
|---|---:|---:|---:|
| G01 | 91 | 181 | -.3 |
| G02 | 114 | 177 | .5 |
| G03 | 87 | 155 | .7 |
| G04 | 122 | 148 | -.5 |
| G05 | 79 | 124 | .2 |
| G06 | 119 | 114 | -.8 |
| G07 | 85 | 96 | .4 |
| G08 | 126 | 81 | -.6 |
| G09 | 91 | 62 | .5 |
| G10 | 116 | 47 | -.2 |
| G11 | 97 | 27 | .8 |

## 검증

- `test/ch1LivingDetail.test.js`: stage/arena/실험맵 격리, 결정적 시간 변화, 화면 밖 제외, 게임 데이터 및 canvas 상태 보존, 곡선 API 없는 GPU proxy 지원.
- `tools/qa_ch1_living_detail.py`: 로컬3333의 본편 경로, 8개 기본 카메라+나무/고치/독액 상세3개, pageerror/console error/HTTP error, 렌더 CPU 표본, 지형 무변경 검사.
- 1차 근거: `captures/ch1_living_detail_20260925/`. 2차 근거: `captures/ch1_living_detail_pass2_20260925/`; before는 같은 현재 게임에 1차 효과 스크립트만 라우팅한 비교, after는2차. before/after 및 영상은 로컬 검수 파일이며 git ignore 대상.
- 최초 검수에서 GPU proxy의 `bezierCurveTo` 미지원으로 월드 그리기가 중단됨을 발견했다. 실패 재현 테스트 후 atlas drawImage 방식으로 수정했다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 production.

MASTER: silhouette/8 regions/남북 main route/side spaces는 기존 고정 배치 유지.

OUTER MASS: LEFT/RIGHT/TOP/SOUTH 베이스 보존. major holes 새로 메우거나 외곽을 재설계하지 않음.

LARGE: source assets는 기존 production_finish 및 시체나무/고치/웅덩이. composites/overlap/repeated silhouette 변경 없음. 2차에서 기존 나무 스프라이트의 밑동 고정 회전과 원본 알파 기반 투영 그림자 추가.

MEDIUM: 기존 나무/뿌리 주변 및 남북 진행 길 어깨11곳에 낮은 생체 연결 추가. remaining holes는 이번 범위의 수정 대상 아님.

GROUND: 부드러운 접촉 shadow, 저대비 괴사조직, 가는 동맥과 상면빛으로 structure integration 보강. 지면 원본 보존.

PLAYABLE: main arenas/travel/breathing/threat space 보존. 저대비 지면 효과이며 신규 장애물 없음. 다수 적 실전 가독성은 별도 확인 필요.

LANDMARK: primary 시체나무, secondary 고치/독액, tertiary 뿌리·독낭에 기존 좌표 기반 효과.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 및 상세3개를 캡처해 확인한다. 전체 아트 최종 승인과 구분한다.

TECH QA: 1차13검사 PASS. 2차 총16검사 PASS(효과8/기존배치5/문법1/패키징2), 나무 접지 불변/입구 조직/알파 실루엣 그림자 회귀 추가. 최종11카메라 pageerror/console error/HTTP error 및 지형 무변경은 각 runtime.json에 기록. native Canvas2D CPU 표본은120회이며 GPU 프레임시간 아님. seam은 기존 청크를 유지하며 추가 경계 없음. 전체 전투 FPS 보증으로 해석하지 않는다.

FILES: stage-owned `ch1-living-detail.js`, 테스트, QA 도구, 본 문서. concurrent touched `game.html`과 맵디테일 문서에는 이번 변경만 적용. unrelated touched 없음.

GIT: 다른 작업의 staged 변경을 포함하지 않는 부분 체크포인트. push/deploy 없음.

VISUAL VERDICT: RETOUCH — 국소 입체감·움직임 보강. 전체 생체지옥 재질 완성 및 대규모 전투 최종 검수는 미완료.

NEXT PASS: 사용자 플레이 피드백에 따라 강도 조정. 기존 구도 보존 원칙 유지.

2차 직접 확인: <http://localhost:3333/captures/ch1_living_detail_pass2_20260925/index.html>. 게임 전체 화면 녹화 `after/camera-tour.webm`에는 자동 카메라 이동과 나무 앞6초 정지가 포함된다. QA 인트로 Escape 반복이 설정 패널을 열던 문제를 발견하여 컷씬일 때만 Escape를 누르고 촬영 전에 `closeAllPanels()`를 호출한다. 패널/흰 레이어로 가려진 초기 촬영은 완료 근거에서 제외한다.

## 3차: 수면과 고치의 국소 반응

| id | 값 / 적용 |
|---|---|
| 접지 얼룩 | 7개, 중심(cos(j*2.399)*38,18+sin(j*2.399)*17), Y배율.38, 반경3→48, alpha.22→0. wet RGB52,53,29 / dry55,29,40; 끝 RGB30,19,28 alpha0 |
| 기포 | m_c1pool/pit_poison에5개, 기존6.614초 주기. p=fract(phase/2π+j*.219), 중심(cos(j*2.399)*42,sin(j*2.399)*19) |
| 팽창 | p<.72, r=2+5*sin(min(1,p/.72)*π/2); 중심Y-r*.45, 반경(r,r*.65), RGB25,30,16 alpha=sin(p/.72*π)*.65 |
| 상면 | 중심(-1,-1) 이동, 반경(r*.72,r*.43), 회전-.2, arc3.4→5.7, RGB156,151,94 alpha=sin(p/.72*π)*.48, 폭1.2 |
| 붕괴 | p≥.72, q=(p-.72)/.28; 반경(7+15q,3+6q), arc.2→5.4, RGB143,140,83 alpha=(1-q)*.3, 폭1 |
| 체액 | m_c1cocoon/m_c1spod에3개, 기존feet Y오프셋 적용. p=fract(phase/2π+j/3), x=(j-1)*23 |
| 방울 | p<.65, q=p/.65; 중심(x+sin(phase+j)*2,-42+56q²), 반경(2.2,3+3q), RGB92,74,55 alpha=sin(qπ)*.65 |
| 착지 | p≥.65, q=(p-.65)/.35; 중심(x,14), 반경(3+14q,1+4q), arc.3→5.7, RGB115,88,71 alpha=(1-q)*.3, 폭1 |
| 자원/격리 | atlas4종 최대25MiB, 기존16프레임 crossfade; stage0 production만. 기존 물결3개/속도/피해/충돌/좌표 유지 |

MAP PRODUCTION REPORT (3차): MASTER/OUTER MASS/LARGE/PLAYABLE 기존 보존. MEDIUM/GROUND 접지 얼룩, LANDMARK 웅덩이 기포·고치 체액 추가. CAMERA QA는 기본8곳+상세3곳, 상세마다6초 정지 녹화. TECH QA 17검사 PASS(효과9/배치5/문법1/패키징2). FILES/GIT는 본문과 동일한 작업 전용 부분 커밋. 근거 `captures/ch1_living_detail_pass3_20260925/after/runtime.json` 및 영상.

3차 브라우저 결과: 11카메라 촬영 완료, pageerror/console error/HTTP error 모두0. 고치/웅덩이 상세 스크린샷 직접 확인. 전체 카메라를 직접 플레이한 결과는 아니며 영상에는 카메라 강제 이동이 포함된다. 확인 페이지: <http://localhost:3333/captures/ch1_living_detail_pass3_20260925/index.html>.

VISUAL VERDICT: RETOUCH — 국소 효과 보강, 전체 생체 재질과 대규모 전투 최종 검수 미완료.


## 4차: 연속 동맥과 이동하는 압력 맥동

| id | 값 / 공식 |
|---|---|
| 표본 | k=0..32, u=k/32, v=1-u, taper=v^.8. 기존 cubic 경로·굴곡8px·주기6.614초 유지 |
| 압력 | pressure=(.5+.5*sin(phase-u*2π-j*.8))^6. 동맥 길이를 따라 이동하는 국소 팽창, 별도 발광 없음 |
| 폭 | w=(5.2+pulse*1.5+pressure*4)*taper+.2. pulse=.5+.5*sin(phase-j*.8) |
| 면 연결 | 이전/다음 표본 방향의 수직 단위벡터로 좌우 경계 생성, 끝에서 역순 연결 후 fill. 기존 atlas 최초 생성에만 적용 |
| 그림자 | 반폭 w*.6+2.2, 오프셋(1.5,2.5), RGBA13,7,12,.32 |
| 몸체 | 반폭 w*.5, 오프셋0, dry RGBA77,40,47,.68 / wet63,61,35,.65 |
| 상면 | 반폭 w*.19, 오프셋(-.7,-1.3), RGBA148,112,110,.22 |
| 보존 | atlas4종/16프레임/25MiB/기포5개/체액3개/길11곳, geometry·충돌·게임플레이 불변 |

MAP PRODUCTION REPORT — 4차

STAGE: CH1-1. MASTER: silhouette/8region/남북 동선/side spaces 보존. OUTER MASS: LEFT/RIGHT/TOP/SOUTH 및 기존 holes 불변. LARGE: 기존 source/composites/overlap/repeated silhouette 유지. MEDIUM: 기존11지면 연결과 앵커의 동맥 면 개선, holes 재설계 없음. GROUND: 연속 접촉 그림자·괴사색 몸체·이동하는 팽창으로 접지와 높이 보강. PLAYABLE: arena/travel/breathing/threat 공간 유지, 전투 가독성 최종 대규모 검수 미완료. LANDMARK: 시체나무/고치/독액/뿌리 위계 유지. CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 및 상세3곳 촬영; START에도6초 정지 추가. TECH QA: 17검사 PASS, 기존 route/collision 및 원본 chunk seam 보존. 브라우저 로그는 captures/ch1_living_detail_pass4_20260925/after/runtime.json. FILES: 전용효과/QA/문서, 공유 game.html 캐시버전과 콘셉트 문서 해당 행만 변경. GIT: 이번 변경만 부분커밋, push/deploy 없음.

VISUAL VERDICT: RETOUCH — 국소 동맥 표현 개선. 전체 지면 피부화/외곽 생체지옥 완성은 미완료.
4차 브라우저 실측: 11카메라 촬영 완료, pageerror/console error/HTTP error 모두0. START 및 TREE_DETAIL 직접 이미지 검수: 분절 선 끝의 반복 마디 감소, 중앙 플레이어·전투 이펙트와 구분됨. 나뭇가지형 조직의 반복 배치와 전체 재질 차이는 잔여 RETOUCH. 대규모 전투 FPS를 보증하지 않는다. 확인 영상: <http://localhost:3333/captures/ch1_living_detail_pass4_20260925/index.html>.

NEXT PASS: 실제 플레이 피드백에 맞춰 강도·주변 연결 개선.


## 5차: 반복 완화와 바닥 접합

| id | 적용 / 수치 |
|---|---|
| 형태 선택 | dry만 variant=abs(floor(x/40)*7+floor(y/40)*11)%3. wet/surface는0. 동일 좌표 항상 동일 형태, 무작위 프레임 변화 없음 |
| 갈래 | dry3+variant, wet5. seed=variant*1.7; 각도seed+j*2.399, 길이100+42*sin(seed+j*1.7). 실제 시간 위상은 기존 x*.017+y*.011과 atlas 위상 유지 |
| 시작점 | sx=sin(j*1.3+seed)*22, sy=8+cos(j*1.9+seed)*12; cubic 시작 항 v³*sx/v³*sy. 중앙 한 점 집중을 분산 |
| 지면 출현 | 기존 폭w에 emerge=sin(min(1,u/.14)*π/2)를 곱해 시작14%를0→전체 폭으로 연결. 잘린 관 단면처럼 보이는 시작점 보정 |
| 끝 접합 | ground atlas만 destination-in radial 중심(0,12), 반경82에서alpha1→155에서0. 셀(-160,-160,320,320) clip 후 적용해 인접 프레임 침범 방지 |
| 자원 | dry3 + wet ground1 + surface2 = 최대6장,1280²각각, RGBA37.5MiB. 이전4장25MiB 대비12.5MiB 증가. visible 앵커가 필요로 하는 형태만 최초 생성, 재사용 |
| 불변 | .00095rad/ms 맥동/16frame/충돌/동선/오브젝트 좌표/11지면 패치 보존. 전체 맵 피부 재질 교체 아님 |

MAP PRODUCTION REPORT — 5차

STAGE CH1-1. MASTER silhouette/region/남북 route/side spaces 기존 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH와 major holes 불변. LARGE source/composites/overlap 유지, 신규 대형 반복 없음. MEDIUM 기존 앵커의 형태를3종으로 분화, remaining holes 범위 밖. GROUND shadow/contamination 유지, 동맥 시작점 분산과 끝 감쇠로 structure integration 보강. PLAYABLE arenas/travel/breathing/threat 공간 보존, 대규모 전투 가독성 최종 미검수. LANDMARK primary시체나무/secondary고치·독액/tertiary뿌리 유지. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세3곳. TECH QA17검사 PASS, route/collision 보존, 기존 chunk seam 불변; pageerror/404/loading은 captures/ch1_living_detail_pass5_20260925/after/runtime.json. 메모리 비용 위 표 참고, GPU FPS 보증 아님. FILES 전용효과/QA/docs, 공유 game 캐시버전·콘셉트 행만 수정, unrelated 변경 없음. GIT 전용 부분커밋, push/deploy 없음.

VISUAL VERDICT: RETOUCH — 국소 반복 감소, 전체 재질·외곽 완성 및 대규모 전투 검수 미완료.
5차 최종 재촬영: 11카메라 완료, pageerror/console error/HTTP error 모두0. START_motion 및 ARENA 직접 이미지 확인. 초기 촬영에서 잘린 관 시작점 확인 후 emerge 보정하고 재촬영함. 입구의 일부 형태 반복과 주변 흙 대비 조직 재질 차이는 잔여 RETOUCH. 확인 페이지 <http://localhost:3333/captures/ch1_living_detail_pass5_20260925/index.html>.

NEXT PASS: 화면 피드백에 따른 국소 연결 보강.


## 6차: 사용자 “잘 안 보이지만” 대응

이전4/5차 표는 해당 시점 이력. 현재 동맥 폭·변위·색은 아래 값이 우선한다.

| id | 변경 / 현재 값 |
|---|---|
| 굽힘 | bend=sin(phase-j*.8)*22, 이전8 대비2.75배. cubic 제어점 변위이며 전체 픽셀 이동량22px를 보장하는 뜻 아님 |
| 압력 폭 | w=((5.2+pulse*1.5+pressure*9)*taper+.2)*emerge. 압력 계수4→9 |
| 들림 | 표본Y=기존ny-pressure*7*sin(u*π). 양끝은 고정, 내부 국소 들림 |
| 색 | dry body RGBA87,44,52,.78; wet body63,61,35,.65 유지; 상면158,119,114,.3. additive 발광/점멸 없음 |
| 보존 | 주기6.614초, 16frame, atlas6장37.5MiB,3형태/11앵커/지형/충돌/진행 유지 |
| 확인 | 게임 카메라 TISSUE_DETAIL 타일91,184 추가. 실제 화면 영역(400,80,480,360)을24회 캡처해 반복 GIF, 각 캡처 사이250ms 대기. GIF 실제 측정 간격 사용, 인위적 가속 없음 |

MAP PRODUCTION REPORT — 6차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces 보존. OUTER MASS LEFT/RIGHT/TOP/SOUTH·holes 보존. LARGE source/composites/overlap/repeat 보존. MEDIUM 기존 앵커의 가시성 조정, 신규 holes 처리 없음. GROUND 그림자/오염 유지, 동맥 굽힘·압력 폭·들림과 상면 대비 강화. PLAYABLE arena/travel/breathing/threat 공간 불변, 화면 전체 흔들림 없음, 대규모 전투 최종 QA 미완료. LANDMARK primary시체나무/secondary고치·독액/tertiary뿌리 기존. CAMERA QA 기본8곳+기존상세3곳+동맥상세1곳. TECH QA 기존17검사 및 브라우저 pageerror/404 기록, route/collision/chunk seam 불변, GPU 성능 보증 아님. FILES 전용효과/QA/docs 및 공유game 캐시·맵디테일 행, unrelated 변경 없음. GIT 전용 부분커밋, push/deploy 없음.

VISUAL VERDICT: RETOUCH — 움직임 가시성 보강 단계, 전체 재질/외곽 완성과 별도.
6차 검수: 17검사 PASS,12카메라 완료, pageerror/console error/HTTP error0. TISSUE_DETAIL 직접 이미지에서 굵기와 상면 변화 확인. 실제 게임 화면 crop24프레임 GIF 저장, 리뷰 페이지에서2배 표시(480×360→960×720), 속도는 실제 측정 간격. 전체 플레이 배율 영상도 제공. <http://localhost:3333/captures/ch1_living_detail_pass6_20260925/index.html>.

NEXT PASS: 정상 플레이 배율에서 사용자 시인성 피드백 확인.


## 7차: 국소 피부막과 웅덩이 마감

사용자 “다음 맵디테일 완성해”에 따라 기존 맵 보존 범위의 디테일을 마감한다. 전체 신규 생체맵 원화로 교체하는 작업과 구분한다.

| id | 현재 적용 / 정확한 수치 |
|---|---|
| 피부막 캐시 | membrane(wet,variant), dry3+wet1 최대4장,320² RGBA 총1.5625MiB. 기존6atlas37.5MiB와 합산39.0625MiB(나무 그림자 별도). 기존 atlas 생성 시에만 합성, 프레임마다 재생성 없음 |
| 형태 | 72구간 폐곡선. angle=j/72*2π, r=102+18*sin(angle*3+variant)+11*cos(angle*5-variant), x=cos(angle)*r*1.12, y=12+sin(angle)*r*.62 |
| 피부 명암 | linear Y-70→85, stop0 RGBA34,25,31,.12 / .43 dry102,79,82,.54 또는 wet74,72,48,.54 / 1 RGBA26,18,25,.12 |
| 미세 재질 | LCG seed=781+variant*357+(wet?91:0), next=(imul(seed,1664525)+1013904223)>>>0, rand=seed/4294967296. 1600점: x=rand*290-145,y=rand*180-90,r=.35+rand*1.3,크기1.8r×r. j%3이면RGBA33,20,28,.08,그외169,144,130,.1. 고정 재질이므로 시간 깜빡임 없음 |
| 주름 | 9개. y=-42+j*12,x=-104+sin(j*2.1+variant)*16; cubic제어(-42,y-16),(32,y+13),끝(104-cos(j)*18,y-5). 암부RGBA29,18,27,.18 폭1.7, 상면Y-1.2/RGBA171,143,132,.12 폭.8 |
| 경계 | destination-in radial중심(0,12)반경28alpha1→143alpha0. 기존 지면 atlas 감쇠82→155도 마지막에 적용 |
| 웅덩이 수축 | m_c1pool만, wave=sin(now*.00095+x*.017+y*.011). pivot(x,y),X=1+wave*.012,Y=1-wave*.018. 중심 고정,충돌과 좌표 불변. 구덩이 수직벽을 별도 분리 변형한 구현 아님 |
| 순서 | 접촉 그림자→피부막→오염→동맥→기존 오브젝트→수면/체액→캐릭터. 캐릭터/UI 위에 피부막을 합성하지 않음 |
| QA | 기존12카메라+AUTHORED_POOL(167,45). 별도 시작부 WASD이동/LMB공격/Q입력 및90RAF간격 기록. 강제 카메라 이동과 실제 입력 검수를 구분 |
| QA 생존 조건 | 테스트 브라우저에서50ms마다 살아 있는 P.hp를P.mhp로 보충. 적/탄/VFX·입력은 유지. production 코드/밸런스/세이브 변경 없음. 난이도·생존 검증이 아닌 화면·입력 검수 |

MAP PRODUCTION REPORT — 7차

STAGE: CH1-1 production. MASTER: 기존53점 silhouette/8regions/남북 route/side spaces 유지. OUTER MASS: LEFT/RIGHT/TOP/SOUTH,holes 보존. LARGE: 기존 source/composites/overlap/repeated silhouette 유지, 전체 원화 교체 없음. MEDIUM: 기존 나무/고치/동맥 연결부에 피부막 추가,remaining holes 재설계 없음. GROUND: 기존 접지 그림자/오염 위에 주름진 피부막을 연결. PLAYABLE: arenas/travel/breathing/threat 공간 보존,새장애물0. LANDMARK: primary시체나무/secondary고치·독액/tertiary뿌리 계층 보존. CAMERA QA: 기본8곳+상세5곳 캡처 및 실제 입력 전투 화면. TECH QA: 19검사(효과11/geometry5/문법1/패키징2),route/collision 및 원본chunk seam 불변. 브라우저·성능·입력 결과는 captures/ch1_living_detail_pass7_20260925/after/runtime.json. FILES: 효과/test/QA/docs 및 공유game캐시·콘셉트행,unrelated 변경 없음. GIT: 전용 부분커밋,push/deploy 없음.

VISUAL VERDICT: RETOUCH — 기존 맵 보존 범위의 피부막·움직임·북동 웅덩이 중복 마감 반영. 전체 화면은 여전히 일반 흙과 식생 비중이 높고, 고치/나무와 지면의 스타일 차이가 남아 전체 생체지옥 콘셉트 FINAL PASS로 판정하지 않는다. 자동19검사로 visual PASS를 대체하지 않는다.

초기7차 촬영 실패: 사망 후 `_fallenResolve`가 없는 DOM의 disabled를 설정하며 `[LOOP CRASH] Cannot set properties of null` 발생. 이후 동일 정지 화면이 반복되어 카메라 근거로 폐기. 원본 실패 로그 `tmp/ch1-pass7-failed-death-runtime.json` 보존. 사망/리플레이 관련 동시작업과 충돌하지 않도록 이번 맵 작업에서 해당 시스템을 변경하지 않음. 재촬영은 위 체력 보충 조건을 명시하며 사망 흐름 자체의 해결 증거로 삼지 않는다.


7차 중복 POI 마감: 위 `hideDuplicate` 계약 적용. 북동 m_c1gtoxic 월드(6740,1620)를 loaded m_c1pool이 있을 때만 렌더 제외. authored/MAP_OBJS/충돌 개수 유지,시각중복1건 제거. 다른 toxicf 및 baked 청크 불변. 단계별 문서·에셋목록·CHANGELOG에도 같은 현행 예외를 동기화했다.

7차 최종 after 결과: 카메라13곳 및 COMBAT 촬영, 전체 contact board/AUTHORED_POOL/COMBAT 직접 확인. errors/HTTP errors0, mapUnchanged=true. 실제 입력 전후 위치(4020,7220)→(4011.69222,7211.69222); 네 방향 복귀 입력이므로 총 이동거리가 아닌 종료 좌표다.90RAF 표본 median33.4ms/p95 50.1ms(1280×720 headless·녹화중). 이는 대규모 전투 성능 통과 근거가 아니다. native효과 CPU 표본은 별도로runtime.json에 보존. 최초 사망 오류는 미해결이며 재촬영의0오류와 구분한다.

확인 페이지: <http://localhost:3333/captures/ch1_living_detail_pass7_20260925/index.html>. before는 같은 현재게임에6차 효과 스크립트를 연결한 아트 비교이며, 이전 게임 전체버전을 실행한 결과가 아니다. 기존 맵의 국소 디테일 마감과 전체 콘셉트 완성 상태를 구분한다.

## 8차: 독액 증기와 고치 점액 연결

| id / 적용 | 현재 수치·공식 |
|---|---|
| 증기 / m_c1pool,pit_poison | surfaceOnly 기존 수면 atlas에3갈래 추가. j=0..2,p=fract(phase/(2π)+j/3),phase=now*.00095+x*.017+y*.011. 주기약6.614초, 기존16프레임 보간 사용 |
| 이동·크기 | local x=(j-1)*35+sin(p*2π+j)*14,y=6-p*105,radius=13+p*17. 타원배율(.72,1.4). 위로105local px 상승,기존 오브젝트별 배율 적용 |
| 증기 합성 | opacity=sin(p*π)^1.4*.24. radial 0 RGB157,150,105 alpha opacity / .45 RGB105,111,74 alpha opacity*.65 / 1 RGB74,83,55 alpha0. source-over,양끝 투명,글로우 없음 |
| 점액 줄기 / m_c1cocoon,m_c1spod | 기존3개 낙하 체액에서 p<.65,q=p/.65,그중 q<.82일 때만 목 연결. x=(j-1)*23,endY=-42+q²*56,drift=sin(phase+j)*2 |
| 줄기 곡선 | 시작(x,-44),quadratic제어(x-3+drift,-40+(endY+42)*.45),끝(x+drift,endY). 폭2.2*(1-q/.82)+.35,RGBA112,91,66,alpha(1-q/.82)*.55 |
| 줄기 상면 | X-.65,폭.65,RGB176,151,108,alpha(1-q/.82)*.24. 분리 후 기존 방울·착지 파문 유지 |
| 자원·영향 | 기존 atlas에만 추가해6atlas+4membrane의39.0625MiB 상한 유지(나무 그림자 별도). 새파일/로드/파티클/충돌/피해/스폰 없음. 네이티브 canvas에서 최초 생성, GPU proxy에는 drawImage만 전달 |
| QA | 카메라13곳+COMBAT. TISSUE_DETAIL/COCOON_DETAIL/AUTHORED_POOL은 각각24프레임 GIF,측정한 캡처 간격으로 재생. 체력50ms보충 조건 유지. 촬영 후 보충 중단·부활불가 설정·_fallenResolve 직접 호출로 사망 UI 분리 검사 |

MAP PRODUCTION REPORT — 8차

STAGE: CH1-1 production. MASTER: 기존53점 silhouette,8regions,남북 main route,side spaces 보존. OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 holes 보존. LARGE: 기존 sources/composites/overlap/repeated silhouette 유지. MEDIUM: 기존 연결부와 remaining holes 변경 없음. GROUND: 기존 피부막/오염/그림자/동맥 유지. PLAYABLE: arenas/travel/breathing/threat 공간·장애물·충돌 불변. LANDMARK: primary시체나무 유지,secondary고치·독액에 점액 목과 상승증기 추가,tertiary뿌리 유지. CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 및 상세5곳,contact board와 웅덩이/고치 원배율 화면 직접 확인. TECH QA: 20검사(효과12/geometry5/문법1/패키징2) PASS;mapUnchanged=true,errors/HTTP errors0,route/collision/chunk seam 보존.90RAF median33.3ms,p95 50ms(headless1280×720녹화중),native효과CPU p95약.1ms;대규모 전투 성능PASS 근거 아님. FILES: stage-owned효과/test/QA/본 문서,concurrent touched game캐시·맵디테일2행만,unrelated touched없음. GIT: 전용 부분커밋,코드+docs포함,push/deploy없음.

VISUAL VERDICT: RETOUCH — 기존 맵의 국소 습기·체액 움직임 추가는 확인. 전체 흙·식생과 생체 오브젝트의 재질 통합은 미완료. 새 원화 전체 적용이나 구덩이 벽 변형을 완료로 판정하지 않는다.

사망 재검수: 이번 현재 작업트리에서 deathReplayBtn 존재=true,_fallenResolve 이후 death 표시=true,error=null. 7차 사망오류는 이번 조건에서 재현되지 않았으며 이 작업이 사망 시스템을 수정한 것은 아니다. 자연 사망부터 리플레이·재시작까지의 전체 회귀 검수는 별도다.

확인: <http://localhost:3333/captures/ch1_living_detail_pass8_20260925/index.html>. before는 현재게임에7차 효과를 연결한 비교. NEXT PASS: 전체 재질 통합과 동측 독액 POI의 평면적인 원형 마커 접합 검토. 원본·충돌 유지, 위험범위 가독성을 먼저 검증할 것.

## 9차: 동측 독구덩이 안쪽 깊이 (2026-09-26)

| id | 구현 계약 / 정확한 수치 |
|---|---|
| 범위 | `Ch1LivingDetail.pit`, enabled(stage0,!bossArena,!fieldRebuildQA)이며 pit_poison 월드(6500,5580)만 true. 그 외 false. default sprite 분기 전에 호출, true면 기존 sprite 중복 렌더 제외. API 없으면 원본 폴백 |
| atlas | 1024² RGBA1장,4×4셀256²,16프레임,4MiB추가. 기존39.0625MiB+4=43.0625MiB(나무 그림자 별도). 최초 사용 시 native canvas 생성. GPU proxy에는 drawImage만 전달 |
| 좌표·크기 | 각셀 중심(128,128),clip(-128,-128,256,256). 실제 draw 크기(meta.sz 또는200)*scale,원점(o.x-sz/2,o.y-sz/2),좌표/충돌/개수 불변 |
| contour | n=0..96,t=n/96*2π,r=1+.035sin(5t)+.025cos(9t),squeeze=sin(phase-2t)*inset. px=cos(t)*(rx*r+squeeze),py=cy+sin(t)*(ry*r+squeeze*.6). phase=f/16*2π |
| 접촉 그림자 | scaleY.7,radial중심(0,15),반경65alpha.7→124alpha0,RGB12,10,11 |
| 외측 턱 | contour(106,80,9,1.6),fill#38372c,strokeRGBA148,128,96,.18,폭2 |
| 안쪽 벽 | contour(97,71,9,1.6),linearY-65→78,stops0 #100f11 / .55 #26231d / 1 #69604a |
| 벽 미세 재질 | 280점,x=sin(j*12.989)*103,y=9+cos(j*7.31)*76,2×(1+j%4). 홀수RGBA120,109,82,.2,짝수RGBA8,10,8,.3. 시간 고정 |
| 벽 균열 | 안쪽 벽 clip안19개,t=j/19*2π,시작(cos(t)*98,9+sin(t)*72),끝(px*.88,py+19),RGBA10,9,10,.5,폭2+j%3 |
| 낮은 독액 | contour(86,48,23,2),linearY-25→73,stops0 #1b2416 / .5 #45522a / 1 #788052. 벽과 독액 모두 clip해 가장자리 밖 유출 방지 |
| 침전물 | 32개,px=sin(j*12.989)*81,py=23+cos(j*7.31)*43,타원반경(3+j%5,1+j%3),회전.2. 홀수RGBA16,24,14,.24 / 짝수147,151,90,.19 |
| 수면 흐름 | 3개,p=(f/16+j/3)%1,중심((j-1)*24,22+sin(j)*14),반경(8+p*28,3+p*10),회전-.1,호.4→5.3,RGB176,173,110,alpha(1-p)*.24,폭1.3 |
| 앞턱 가림 | j=0..48,t=j/48*π,rx=99+sin(phase-2t)*1.6,px=cos(t)*rx,py=9+sin(t)*73. RGBA36,28,26,.9 폭4;상면Y-2,RGBA143,125,91,.3 폭1.6. 수면보다 뒤에 그려 전경 턱 표현 |
| 재생 | fract((now*.00095+x*.017+y*.011)/(2π))*16. 현재/다음프레임alpha(1-mix)/mix,기존6.614초 주기. 함수 전후 context state 보존 |
| 구분 | 절차식 작은 pit의 깊이·국소 변형 구현. 뒤쪽 큰 m_c1gtoxicf 그림의 수직벽 분리·변형이나 전체 맵 높이/지형 변경은 아님. 기존 증기/기포/지면 층 유지 |

MAP PRODUCTION REPORT — 9차

STAGE: CH1-1 production. MASTER: 53점 silhouette/8regions/main route남북/side spaces보존. OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes보존. LARGE: 원본source assets/composites/overlap/repeated silhouette보존. MEDIUM: 동측 독액 POI의 평면 원형 표현 교체,대형 원화 접합 잔여. GROUND: 국소 contact shadow·탁한 독액·지면 턱 연결;기존 contamination/동맥 유지. PLAYABLE: main arenas/travel/breathing/threat공간과 충돌 보존,녹색 독액과 어두운 경계 식별 유지. LANDMARK: primary시체나무/tertiary뿌리보존,secondary동측 독구덩이 깊이 보강. CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세5곳,POOL_DETAIL 움직임GIF 추가. TECH QA: 21검사(효과13/geometry5/문법1/패키징2);route/collision/chunk seam원본불변,브라우저검수 결과 아래 기록. FILES: stage-owned효과/test/QA/본 문서;concurrent touched game전용hook·캐시/맵디테일2행/4개문서추가계약;unrelated touched없음. GIT: 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 국소 구덩이 깊이 보강. 전체 지면/대형 독액 원화와의 재질 통합 및 대규모 전투 최종 검수는 남음. NEXT PASS: 서로 다른 원화의 접합을 큰 재질 단위로 정리하되 넓은 공터·기존 배치 유지.

9차 최종 QA: 최초 화면의 매끈한 그릇형 테두리를 확인하여 외측 명암/앞턱 폭을 낮추고 벽 미세 재질을 추가한 뒤 재촬영. POOL_DETAIL과 전체 camera-board 직접 확인. before/after 각13곳+COMBAT,오류/HTTP오류0,mapUnchanged=true. 재촬영90RAF median16.7ms,p95 49.9ms(1280×720 headless녹화중);성능등급 확정 아님. 실제 WASD/LMB/Q 입력,체력50ms보충 조건. 사망 UI 직접 호출buttonPresent/shown=true,error=null. 21검사 PASS. 뒤쪽 포토 재질과 절차식 구덩이의 스타일 차이가 남아 RETOUCH 유지.

확인 페이지: <http://localhost:3333/captures/ch1_living_detail_pass9_20260926/index.html>. 변경 전은 현재게임에8차효과를 라우팅한 비교다. 기존 원본 pit_poison.png와 대형 웅덩이 에셋 보존.

## 10차: 분리되어 보이는 촉수의 유착 고정 (2026-09-26)

사용자 지적: “촉수들은 붙어있어야할텐데 왜 나눠졌다가 흩어졌다가 그러지 지렁이 3마리같이”. 5차의 분산 시작점과 서로 다른 굽힘,동맥 경로와 독립 좌표로 그린 작은 가지 때문에 붙어 있는 조직보다 독립 생물처럼 읽혔다. 해당 표현은 승인된 완성형이 아니며 아래 계약으로 대체한다. 5/6차 수치는 당시 이력이다.

| 대상 | 현재 계약 |
|---|---|
| 시작부 | 모든 갈래 sx=0,sy=14(local),시간/갈래에 따른 위치 분산 제거. 앵커 월드좌표·고정angle 유지 |
| 굽힘 | bend=sin(phase-j*.8)*7. ny=v³*sy+3*v²*u*(ey*.1)+3*v*u²*(ey*.95)+u³*ey+bend*sin(πu)². 양끝 굽힘0,중간만 움직임. 이전 cubic 제어점±22 변형 폐기 |
| 시작 두께 | emerge=.7+.3*sin(min(1,u/.14)*π/2). 기존0 시작 대신 .7로 연결 폭 유지. 압력파/리본 명암/끝 감쇠는 기존 유지 |
| 작은 가지 | 시작점을 ex*.58,ey*.6에서 실제 동맥 표본points[19]의 x/y로 변경. parent 변형을 그대로 따라 분리 틈 방지. 제어/끝 좌표는 기존 유지 |
| 고정 유착부 | 모든 갈래 렌더 후 translate(0,14),scale(1,.42),radial반경2→23. stop0 dryRGBA83,47,53,.95 / wet64,60,37,.95; .55 dry81,50,57,.75 / wet66,59,40,.75; 1 RGBA63,40,46,0. 영역(-23,-23,46,46). 고정 피부 이음새로 시작부 연결 |
| 유지 | 길11곳·기존tree/cocoon/pool등 앵커·16프레임·주기6.614초·pressure9·들림7px·기포/증기/나무/구덩이 유지. 시작/끝 좌표는 고정,중간 형태·굵기만 변화. geometry/collision/배치/게임플레이 무변경 |
| 자원 | 기존 native atlas내에 합성,추가 atlas/메모리 없음. 런타임drawImage 및 culling 계약 유지 |

MAP PRODUCTION REPORT — 10차

STAGE CH1-1. MASTER silhouette/regions/남북main route/side spaces유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/holes유지. LARGE source/composites/overlap/repeated silhouette유지. MEDIUM 촉수 갈래 연결 수정,대형 접합 잔여. GROUND 그림자/오염 유지,고정 피부 유착부 추가. PLAYABLE arenas/travel/breathing/threat 공간 유지,독립 생물처럼 보이는 바닥 움직임 완화. LANDMARK primary/secondary/tertiary보존. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세5곳,동맥 확대GIF. TECH QA 기존21검사,geometry/collision/chunk seam보존,브라우저 결과 아래 기록. FILES stage-owned효과/QA/본 문서,concurrent touched game캐시·맵디테일2행,unrelated없음. GIT 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 사용자 지적한 분리된 촉수 표현 수정. 전체 맵 재질 통합은 남아 있음. NEXT PASS: 고정 유착부와 주변 원화의 재질 접합 검토.

10차 검수: TISSUE_DETAIL 원배율 화면에서 갈래의 공통 유착부 확인.13카메라+COMBAT 촬영,실제 입력WASD/LMB/Q,체력50ms보충 조건. 오류/HTTP오류0,21검사PASS. 동맥24프레임GIF와 전후 캡처: <http://localhost:3333/captures/ch1_living_detail_pass10_20260926/index.html>. 비교의 이전 화면은9차 당시캡처이며 현재 전체코드 동일시점 A/B는 아니다. 런타임 원본은 after/runtime.json에 보존.

## 11차: 오른쪽 아래 독액 지대 접합 (2026-09-26)

작업 위치는 사용자의 두 번째 스크린샷 `스크린샷 2026-09-26 042826.png`에 해당한다. 오른쪽 위 m_c1pool(167,43)과 혼동하지 않는다. 동측 pit_poison(162,139),월드(6500,5580)만 기존9차 atlas 내에서 수정하며 뒤쪽 큰 m_c1gtoxicf의 원본은 보존한다.

| id | 현행 값 / 변경 |
|---|---|
| 불규칙 경계 | contour의 r=1+.06*sin(5t)+.035*cos(9t). 기존9차 .035/.025 계수 대체. 나머지 rx/ry/cy와 수축 범위 유지 |
| 젖은 지면 연결 | 외측 턱 이전9곳. j=0..8,t=j/9*2π,중심(cos(t)*99,9+sin(t)*73),회전t,scaleY.55. radial반경3→24,RGB36,36,24 alpha.58→0,48² 영역. 같은 위치의 고정 오염으로 경계 분절 |
| 유입 자국 | j=0,1. 시작(-27,-69)/(34,-57),끝(-17,-6)/(22,2). cubic제어(sx-9,sy+19),(ex+8,ey-23),시작·끝 고정 |
| 자국 깊이 | RGB14,20,14 alpha.82 폭8-j*2;내측 RGB95,108,58 alpha.48 폭3-j*.5 |
| 습윤 상면 | X-1,폭1,RGB161,159,99,alpha=.14+.07*sin(phase-j),범위.07~.21. 기존6.614초 주기. 자국의 위치는 움직이지 않음 |
| 렌더 순서 | contact shadow→젖은 지면→외측 턱→안쪽 벽/침전물/수면→유입 자국→앞턱. 기존256²셀/16프레임/pitAtlas4MiB 재사용,추가 atlas없음 |
| 보존 | 10차 촉수 고정 유착부·중간 맥동 유지. 배치/geometry/collision/크기/물리/피해/맵 데이터/대형 원본 불변 |

MAP PRODUCTION REPORT — 11차

STAGE CH1-1. MASTER silhouette/8regions/main route남북/side spaces보존. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes유지. LARGE source/composites/overlap/repeated silhouette보존. MEDIUM 동측 큰독액과 작은구덩이 사이 시각연결 보강,대형 재질접합 잔여. GROUND 접촉그림자 유지·젖은흙9곳·유입자국2개. PLAYABLE arenas/travel/breathing/threat공간 보존,새장애물0. LANDMARK primary시체나무/tertiary뿌리 유지,secondary오른쪽아래독액만 수정. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세5곳,POOL_DETAIL 확대. TECH QA21검사(효과13/geometry5/문법1/패키징2),route/collision/chunk seam보존,브라우저 결과 아래기록. FILES stage-owned효과/QA/본 문서,concurrent touched game캐시·맵디테일2행,unrelated없음. GIT 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 오른쪽 아래 국소 접합 보강. 전체 생체지옥 재질 완성 판정은 아님. NEXT PASS: 지면과 구조물의 큰 재질 차이 개선,넓은 전투공간 유지.

11차 최종 검수: POOL_DETAIL과camera-board 직접 확인.13카메라+COMBAT,errors/HTTPerrors0,mapUnchanged=true,사망UI직접호출error=null. 실제 WASD/LMB/Q입력,체력50ms보충 조건.90RAF median16.7ms,p95 33.4ms(headless1280×720녹화중);대규모 전투 성능통과 판정 아님.21검사PASS. 원본기록 after/runtime.json,확인 페이지 <http://localhost:3333/captures/ch1_living_detail_pass11_20260926/index.html>. 이전비교는10차 당시캡처. 큰독액과작은구덩이의 재질차이는 잔여RETOUCH.

## 13차 제작 이력: 화로의 시체 손 관절 동작 (2026-09-26)

사용자 “그냥 흐물거리네”, “손이 움직여야지” 교정. 원인은 12차 camp 변형 영역이 실제 세 손보다 가시와 힘줄에 걸쳐 있었기 때문이다. **m_c1camp의 3구역 수평 출렁임을 제거하고 손 3개만 관절 변형한다.** 나무는 12차 유지. 아래 12차의 camp 영역·규격·메모리 설명은 제작 이력이며 13차 당시에는 본 절의 계약이 우선하며 현행 관절식은14차를 따른다. 원본 PNG는 변경하지 않는다.

| id / 적용 | 현행 값·공식 |
|---|---|
| 진입 | 기존 organic의 stage0,!bossArena,!fieldRebuildQA,loaded/meta/srcRect 가드 이후 campHands로 분기. 렌더 콜리전/배치/외부 API 변화 없음 |
| 기준 좌표 | 기존 prop_camp.png 880×663. campHandRigs의 wrist/axis/outline은 이 좌표계. 원본max변880,확대금지;ratio=min(1,880/max(iw,ih)),w/h=round(iw/ih*ratio),sx=w/880,sy=h/663 |
| 왼손 | wrist(452,504),axis(-19,12),sign=-1. outline[(458,495),(461,509),(448,515),(440,532),(428,541),(413,540),(410,526),(414,513),(427,504),(442,501)] |
| 오른손 | wrist(591,541),axis(8,18),sign=1. outline[(581,536),(600,535),(608,545),(622,557),(626,574),(616,587),(596,588),(578,575),(576,556)] |
| 위쪽 손 | wrist(580,420),axis(12,-17),sign=-1. outline[(569,422),(575,403),(578,383),(601,378),(622,385),(620,405),(617,424),(589,431),(579,427)] |
| 분리 | minX/Y=outline최소-18,pw/ph=ceil(outline최대-min+18). source캔버스에 outline clip 후 원본 draw. 정적body에서는 같은 outline을 destination-out으로 제거,원래 손과 움직이는 손이 중복되지 않음. 생성 중 source/mesh는 임시 |
| 실제 규격 | body880×663. 왼손 patch(minX392,minY477,pw87,ph82),오른손(558,517,86,89),위쪽(551,360,89,89). 각24포즈6×4atlas+patch크기blendcanvas. camp 캐시4.391345977783203MiB RGBA |
| 손목 좌표계 | axis길이len,ux=axisX/len,uy=axisY/len. dx=x+minX-wristX,dy=y+minY-wristY;u=dx*ux+dy*uy,v=-dx*uy+dy*ux. u<=0은 손목 고정,forearm은 원본 그대로 |
| 관절 | grip0~1,angle=sign*grip*(.65+v*.006),distal=angle+sign*grip*.5. u<=14는 palm 좌표(u,v) 유지. u>14:first=min(11,u-14),last=max(0,u-25),rot=u>25?distal:angle;pu=14+cos(angle)*first+cos(distal)*last-sin(rot)*v,pv=sin(angle)*first+sin(distal)*last+cos(rot)*v |
| 손목 회전 | wristAngle=sign*grip*.18*clamp(u/10,0,1). (pu,pv)를 wristAngle로 회전한 (ru,rv)를 원축으로 복귀: x=wristX+ru*ux-rv*uy-minX,y=wristY+ru*uy+rv*ux-minY. 손바닥·첫마디·끝마디가 별도 각도로 굽음 |
| 베이크 | 각frame0..23의grip=frame/23.6px격자의quad를(0,1,2)/(0,2,3) 두 triangle로 나누고 원본→pose의 affine변환을clip내drawImage로 적용. triangle중심에서각vertex로 .35px clip확장하여 안티앨리어싱 틈 완화 |
| affine | p,q,r→d,e,f;ax=qX-pX,ay=qY-pY,bx=rX-pX,by=rY-pY,det=ax*by-ay*bx. A=((eX-dX)*by-(fX-dX)*ay)/det,B=((eY-dY)*by-(fY-dY)*ay)/det,C=((fX-dX)*ax-(eX-dX)*bx)/det,D=((fY-dY)*ax-(eY-dY)*bx)/det;transform(A,B,C,D,dX-A*pX-C*pY,dY-B*pX-D*pY) |
| 동작 | p=fract(now/5200+index*.27),ease(t)=t²*(3-2t). p<.18:0, .18~.4:ease((p-.18)/.22), .4~.57:1, .57~.84:1-ease((p-.57)/.27), .84~1:0. 5.2초 주기,펴기→움켜쥐기→유지→이완,세 손 시간차 |
| 재생 | key=round(grip*92),sample=key/4,frame=floor(sample),next=min(23,frame+1),mix=sample-frame.93보간상태. key변경 시 source-over alpha1-mix+lighter alpha mix,reset alpha1/source-over,_glVer++. 손별patch만 갱신 |
| draw | size=(meta.sz또는400)*scale,ar=w/h,dw=size*min(1,ar),dh=size*min(1,1/ar),dx=o.x-dw/2,dy=o.y-dh/2. body1회,손3회. 손 draw(dx+minX/880*dw,dy+minY/663*dh,pw/880*dw,ph/663*dh) |
| 전체 비용 | 기존43.0625+tree12.7149658203125+raisedShadow1.5625+camp4.391345977783203=61.7313117980957MiB native캐시. 기존나무그림자/임시생성canvas/GPU복제별도. 최초손atlas베이크는 동기 실행 비용 존재 |
| 검사 | 실제 원본 손가락3영역의포즈차이,forearm/가시/상자의정지 비교 추가. 이 검사는12차에서실패→13차PASS. 총24검사(효과16/geometry5/문법1/패키징2). QA --camp-only 추가,현재13차 after/와12차라우팅 before/지원 |

MAP PRODUCTION REPORT — 13차

STAGE CH1-1. MASTER silhouette/8regions/남북main route/side spaces 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes 유지. LARGE sourceassets/composites/overlap/repeated silhouette 유지. MEDIUM 화로의 손목 연결 보존,큰 재질접합 잔여. GROUND 기존 shadow/contamination/structure integration 유지. PLAYABLE main arenas/travel/breathing/threat공간과 충돌 유지,움직임은 야영지 손3개. LANDMARK primary나무 유지,secondary야영지 손동작 교정,tertiary 유지. CAMERA QA 이번에는CAMP_DETAIL와COMBAT,START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체 재촬영은 하지 않음(12차 자료). TECH QA route/collision24검사,배경 로딩대기,브라우저오류·성능은 아래최종검수기록. FILES stage-owned효과/test/QA/본 문서;concurrent touched game캐시/맵디테일2행/에셋목록/production문서/CHANGELOG의해당계약;unrelated없음. GIT 코드+docs부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 손 관절 동작으로 대상 교정. 전체맵 재질·성능 완성 판정은 아님. NEXT PASS: 손 동작 실제배율 가시성,지면/대형구조물 접합.

## 12차 제작 이력: 야영지 힘줄·화로와 대왕나무 뿌리 (2026-09-26)

최종 검수 보충(아래 최초 검수 이후): 보간 갱신 빈도만 낮춘 중간 검사에서 tree median33.4/p95 83.4ms,camp33.3/50ms로 나무 지연이 남아, 최종적으로 정적 몸체와 동적 patch를 분리했다. 최종 규격은 아래 표를 따른다. `--motion-only` TREE/CAMP/COCOON+COMBAT 최종 결과 errors/HTTPerrors0,mapUnchanged=true,사망UI직접호출error=null. 각60RAF tree median33.3/p95 33.4ms,camp33.3/66.6ms;COMBAT90RAF33.3/50ms(headless1280×720녹화중). 적상태·녹화부하가 다른 짧은 표본이며 야영지p95는 악화되어 전체 성능 PASS로 보고하지 않는다. 최종 코드23검사PASS, TREE/CAMP 최종 원배율 이미지 직접 확인. QA는 visibleIds가 비어있지 않고 전부 drawnIds에 포함될 때까지 최대30000ms 대기하여 배경chunk 로딩 전 캡처를 방지한다. 최종 캡처는 motion-optimized/에 보존. 배경에 구워진 뿌리는 정적이며 이번 변형은 m_c1tree 원본 안의 뿌리다. 다음 잔여 작업은 배경 뿌리 움직임·대형 재질 접합·야영지 지연이다. 동기화 추가파일: 맵오브젝트_에셋목록.md,CH1_1_PRODUCTION_FINISH_20260916.md,docs/CHANGELOG_SYNC.md. 확인 페이지 <http://localhost:3333/captures/ch1_living_detail_pass12_20260926/index.html>.

사용자 `스크린샷 2026-09-26 141253.png`는 `m_c1camp` 원본 오른쪽 아래의 뼈·힘줄 화로다. 이번 작업은 고치/독낭 그림자 보강에 더해 해당 야영지와 대왕나무의 기존 그림 안에 국소 움직임을 넣는다. 모든 맵 오브젝트 애니메이션을 완료했다고 해석하지 않는다.

| id / 적용 | 현재 계약 |
|---|---|
| organic | `Ch1LivingDetail.organic(c,g,o,now,meta,img)`. enabled(stage0,!bossArena,!fieldRebuildQA),type m_c1tree/m_c1camp,로드된 이미지,meta존재,meta.srcRect없음일 때만 true. 그외 false→기존sprite폴백. game 기존sprite분기 내부에서 호출,기존 tone/alpha/나무 전체sway 계승 |
| 야영지 위치 | m_c1camp authored(45,100),scale1.55. 원본prop_camp.png의 화로·힘줄만 국소변형,상자/돌테두리/천막의 대부분은 변형영역 밖. 신규 이미지 생성 없음 |
| 나무 위치 | 기존m_c1tree runtime(102.5,90.5). hand크기계수.72,pivotY.72 유지. 몸통과 뿌리 연결부는 국소 변형 영역 밖,기존 전체나무 sway 유지 |
| 캐시 | type별WeakMap→이미지별atlas 및blendcanvas. 원본max변1024(tree)/512(camp),확대금지. w/h=round(원본w/h*min(1,max/max(iw,ih))).8프레임4×2atlas |
| 실제 규격 | tree원본1143×1400→full836×1024,동적patch(56,628,732,376),최종atlas2928×752. static+atlas+blend12.7149658203125MiB. camp원본880×663→full512×386,patch(13,92,389,196),최종atlas1556×392,static+atlas+blend3.3715362548828125MiB. 합16.086502075195312MiB RGBA. 생성 중 전체8프레임atlas는 임시,최종patch 복사후보존안함 |
| 국소장 공식 | 각지역(cx,cy,rx,ry,amp,offset). d=((u-cx)/rx)^2+((v-cy)/ry)^2. d<1만 shift+=(1-d)^2*sin(phase+v*9+offset)*amp*w. 경계에서 변위/기울기0,수평방향만 변형 |
| tree 지역3 | (.27,.79,.20,.17,.011,0),(.75,.80,.19,.17,.011,1.4),(.50,.89,.12,.085,.004,2.1). 좌우뿌리와아래조직,몸통 고정 |
| camp 지역3 | (.60,.64,.11,.09,.010,0),(.70,.37,.08,.12,.008,1.5),(.14,.43,.11,.13,.009,2.8). 화로위힘줄/오른쪽조직/왼쪽촉수 |
| 래스터 | 프레임phase=f/8*2π. 원본축소canvas복사 후 영역에 닿는4px행만 clear,가로32구간. source left=j*w/32,right=(j+1)*w/32,rh=min(4,h-y),v=(y+rh/2)/h;dest dl=left+shift(j/32,v),dr=right+shift((j+1)/32,v),폭dr-dl+.15. cellclip으로 atlas이웃침범 방지 |
| 동적 영역 절단 | x0=max(0,floor(min(cx-rx)*fullW)-2),x1=min(fullW,ceil(max(cx+rx)*fullW)+2). y0=max(0,floor(min(cy-ry)*fullH/4)*4-4),y1=min(fullH,ceil(max(cy+ry)*fullH/4)*4+4). pw=x1-x0,ph=y1-y0.8개patch를4×2atlas로복사하고staticBody의동일rect만clear. 매갱신업로드면적은tree원본32.15%,camp38.58% |
| 재생 | phase=fract((now*.0008+x*.017+y*.011)/(2π))*8,주기약7.854초. blendKey=floor(phase*16),sample=key/16,frame=floor(sample),next=(frame+1)%8,mix=sample-frame.128보간상태/주기(약61.36ms간격),느린변형의텍스처업로드빈도제한 |
| 불투명도 보존 | patch크기blendcanvas clear→source-over alpha1-mix 현재프레임→lighter alpha mix 다음프레임. native premultiplied 합성. key변경 시만 _glVer 증가;기존WebGL/WebGPU 동적canvas업로드·동일크기GPU텍스처재사용 계약 사용. 정적인 상자/몸통이 프레임보간 때문에 반투명해지지 않도록 테스트 |
| 실제 draw | sz=(meta.sz또는400)*scale,ar=fullW/fullH,dw=sz*min(1,ar)*factor,dh=sz*min(1,1/ar)*factor. hand tree factor.72,py.72;그외factor1,py.5.좌상(dx,dy)=(o.x-dw*.5,o.y-dh*py). staticBody전체1회+blendpatch1회. patch좌상(dx+x0/fullW*dw,dy+y0/fullH*dh),크기(pw/fullW*dw,ph/fullH*dh) |
| raised shadows | m_c1cocoon/m_c1spod만 별도이미지별WeakMap캐시640×320.2종총1.5625MiB. size=(meta.sz또는280)*scale,s=size/320,foot=o.y+feet[type]*scale;feet100/40.카메라반폭/높이+size밖스킵 |
| 투영 | native translate(260,32),transform(1,0,-.65,-.32,0,0),blur5.원본 또는meta.srcRect를(-160,-320,320,320)에투영. source-in linearY32→175,RGBA9,7,13 alpha.58/.26/0 @0/.6/1 |
| 밑동접촉 | source-over translate(260,32),scaleY.22,radial반경8→135,RGB9,6,12 alpha.42→0,270²영역.바닥접촉은실루엣그림자와 같은tex에합성 |
| 그림자 호흡 | wave=sin(now*.00105+x*.017+y*.011),pivot(o.x,foot),scale(1+wave*.018,1-wave*.012),alpha기존*.85,draw(-260*s,-32*s,640*s,320*s).밑동좌표고정.평평한pool에는추가하지않음 |
| 비용·보존 | 기존43.0625MiB+이번16.086502075195312+1.5625=60.71150207519531MiB native캐시(기존나무그림자/임시canvas/GPU복제별도). 최초atlas베이크비용과가시중동적blend업로드비용존재.고정배치/충돌/원본파일/다른stage/촉수공동유착불변 |
| QA | 기존13카메라+CAMP_DETAIL(46,104),TREE_DETAIL/CAMP_DETAIL 확대GIF·각60RAF표본추가. 총14카메라+COMBAT.체력50ms보충조건 유지.23검사(효과15/geometry5/문법1/패키징2) |

MAP PRODUCTION REPORT — 12차

STAGE CH1-1. MASTER silhouette/8regions/main route남북/side spaces보존. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes유지. LARGE sourceassets보존,composites/overlap/repeated silhouette동일. MEDIUM 나무/야영지의기존붙은조직만국소변형,대형접합잔여. GROUND 고치/독낭 투영·밑동그림자추가,오염유지. PLAYABLE arenas/travel/breathing/threat공간·충돌보존,상자/돌/몸통국소변형제외. LANDMARK primary대왕나무뿌리/secondary야영지힘줄 움직임,tertiary독낭그림자. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세6곳. TECH QA23검사,route/collision/chunkseam보존,pageerror/404/loading/성능아래기록. FILES stage-owned효과/test/QA/본 문서,concurrent touched game캐시+spritehook/맵디테일2행,unrelated없음. GIT 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 지정된 생체 오브젝트의 국소 움직임 확대. 전체맵 재질·애니메이션완성은아님. NEXT PASS: 실제플레이배율의가시성과가시영역성능검수결과를기준으로움직임범위조정.

12차 최초 전후검수: 동일현재게임에11차효과를라우팅한before와12차초기after,각14카메라+COMBAT,errors/HTTPerrors0,mapUnchanged=true. TREE/CAMP/COCOON 원배율이미지 직접확인.23검사PASS. headless1280×720녹화중 각60RAF: tree before median33.3/p95 50.1ms→초기after33.4/83.3ms,camp33.3/50→33.3/50ms. 적상태·녹화부하가동일하지않아엄밀한성능비교는아니지만나무구간의지연증가를보아최종보간상태를256→128로조정. 초기30.68ms업로드주기를61.36ms로완화하고 `--motion-only`로TREE/CAMP/COCOON+COMBAT를재검수한다. 메모리규격/위치/변형범위는동일. 최초전체검수는after/,최종대상검수는motion-optimized/에분리보존.


13차 최종 검수: 현재 게임에12차모듈을라우팅한before/13차after 각각CAMP_DETAIL+COMBAT,errors/HTTPerrors0,mapUnchanged=true. 양쪽camp60RAF median16.7/p95 33.4ms,COMBAT90RAF16.7/33.4ms. headless1280×720녹화·체력50ms보충 조건,전체 대규모전투 성능검증 아님. after 사망UI 직접호출error=null. 24검사PASS. 원배율CAMP_DETAIL 및 확대 손포즈2장 직접확인. 확인페이지 pageerror0: <http://localhost:3333/captures/ch1_living_detail_pass13_20260926/index.html>. 확대canvas는 현행 모듈·동일 원본을 직접 재생하며 실제게임 전후GIF/녹화영상도 함께 제공. QA 산출물은ignored captures/에 보관.


## 14차 제작 이력: 손가락 순차 접힘과 관절 연결 보강 (2026-09-27)

13차의 손목·마스크·크기·포즈수·시간표·메모리 계약을 유지한다. 아래 관절식은13차의 관절 행을 대체한다. 기존 식은 u=14/25 경계에서 v방향의 회전값이 갑자기 바뀌었으므로 연속된 가중치로 연결한다.

| 항목 | 현행 수치/공식 |
|---|---|
| smooth | t=clamp(t,0,1),smooth(t)=t²*(3-2t) |
| 손가락별 지연 | delay=min(.28,abs(v)*.012),finger=smooth((grip-delay)/(1-delay)),tip=smooth((finger-.15)/.85). 가운데 손가락→양옆,첫마디→끝마디 순으로 접힘 |
| 관절각 | angle=sign*finger*(.65+v*.006),distal=sign*tip*.5,joint=angle*smooth((u-10)/8),end=distal*smooth((u-22)/6). 첫관절 전이 u10~18,끝관절 전이 u22~28 |
| 첫관절 좌표 | pu=14+(u-14)*cos(joint)-v*sin(joint),pv=(u-14)*sin(joint)+v*cos(joint) |
| 끝관절 좌표 | jx=14+11*cos(joint),jy=11*sin(joint),ex=pu-jx,ey=pv-jy;pu=jx+ex*cos(end)-ey*sin(end),pv=jy+ex*sin(end)+ey*cos(end). 이후13차 wristAngle/원축변환 유지. u<=0변위0 |
| 베이크 최적화 | source getImageData1회,6px격자quad의주변1px까지 알파를 검사. py=max(0,y-1)..min(ph,y+7)미만,px=max(0,x-1)..min(pw,x+7)미만에서alpha>0인셀만mesh에저장.24포즈가 같은mesh재사용,투명셀 triangle생략. .35px clip확장/원본마스크 유지 |
| 보존 | 화로/팔/손목 연결·맵좌표·콜리전·전투·나무·다른stage 불변. 추가지속캐시없음,mesh/pixels는생성중임시. native캐시61.7313117980957MiB 그대로 |
| 검증 | 기존24검사PASS. 효과실제원본손검사 Node 실행 표본410.8→124.1ms(베이크 포함 전체테스트시간,엄밀벤치마크 아님). 실제 게임검수는14차 after/runtime.json |

MAP PRODUCTION REPORT — 14차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes 유지. LARGE sourceassets/composites/overlap/repeated silhouette 유지. MEDIUM 손관절 연결만 연속화,큰 재질접합 잔여. GROUND shadow/contamination/structure integration 유지. PLAYABLE arenas/travel/breathing/threat/combat공간 불변. LANDMARK primary나무/tertiary 유지,secondary야영지 손동작 보강. CAMERA QA CAMP_DETAIL+COMBAT,START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT는이전검수자료 유지. TECH QA24검사,route/collision불변,visible chunk 로딩대기,오류/성능 아래최종결과. FILES stage-owned효과/QA/본 문서,concurrent touched game캐시·맵디테일2행·에셋목록·production·CHANGELOG해당내용,unrelated없음. GIT 코드+docs전용커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 손 연결·접힘 순서 보강,전체맵 완성 판정 아님. NEXT PASS: 맵의 큰 재질접합과 생체 구조물 가시성.


14차 최종 검수: CAMP_DETAIL+COMBAT,errors/HTTPerrors=0/0,mapUnchanged=True. camp60RAF median33.3/p95 33.4ms,COMBAT90RAF33.3/33.4ms. headless1280×720녹화·체력50ms보충. 사망UI직접호출error=None. 24검사PASS. 확대포즈2장/실제게임CAMP_DETAIL 검수,확인페이지pageerror=0. 전체전투 성능 판정 아님. 확인페이지 <http://localhost:3333/captures/ch1_living_detail_pass14_20260927/index.html>.


## 15차 제작 이력: 대왕나무 외측 뿌리 굽힘 (2026-09-27)

12차 tree의3구역 수평변형/4px행 stretch는 폐기한다. 기존 원본 안에서 바깥으로 뻗은 뿌리2축을 따라 회전량을 늘려 끝이 들렸다 내려오게 한다. 다른 레이어에 구워진 배경 뿌리는 이번 대상이 아니다. 손14차 유지.

| 항목 | 현행 수치·공식 |
|---|---|
| roots | 정규화원본좌표(ax,ay,tx,ty,radius,angle,offset). 좌(.38,.67,.09,.795,.047,.085,0),우(.65,.70,.91,.81,.045,-.075,2.1). 원본max변1024/축소full836×1024 유지 |
| 축 좌표 | vx=tx-ax,vy=ty-ay,length2=vx²+vy²,rx=px/w-ax,ry=py/h-ay. u=(rx*vx+ry*vy)/length2,d=abs(rx*vy-ry*vx)/sqrt(length2)/radius |
| 고정·감쇠 | u<=.15 또는 u>=1.25 또는 d>=1이면변위0. smooth(t)=clamp(t,0,1)²*(3-2*clamp(t,0,1)). weight=smooth((u-.15)/.85)*(1-d²)²*(1-smooth((u-1.05)/.2)). 몸통쪽15% 고정,옆경계와끝범위에서연속감쇠 |
| 들기 | lift=(.5+.5*sin(phase-u*.75+offset))²,theta=angle*lift*weight. bx=px-ax*w,by=py-ay*h. dx+=bx*(cos(theta)-1)-by*sin(theta),dy+=bx*sin(theta)+by*(cos(theta)-1). pose=(px+dx,py+dy). 좌우시간차·길이방향지연 |
| 래스터 | source전체복사→patch영역clear→16px격자quad두triangle(0,1,2)/(0,2,3). 네 꼭짓점 변위가 모두0이면원본셀drawImage1회,그외13차와동일affine/중심방향.35px확장clip. phase=f/8*2π,8프레임4×2 유지 |
| patch | x0=0,y0=floor(.60*h),x1=w,y1=min(h,ceil(.90*h)+16). 실제(0,614,836,324),atlas3344×648. source동일rect제거→staticBody전체+동적patchdraw. 기존128보간상태/약7.854초/_glVer/culling외부계약 유지 |
| 비용 | tree static+atlas+blend12.56500244140625MiB. 기존43.0625+tree12.56500244140625+raised1.5625+camp4.391345977783203=61.58134841918945MiB native캐시. tree포함추가18.518848419189453MiB. 임시/GPU복제/기존나무shadow별도 |
| 검증 | 실제끝을나타내는밝은표식의Y중심이5시점에서4px초과이동하며고정몸통표식이보존되는검사추가.14차실패→15차PASS.25검사(효과17/geometry5/문법1/패키징2). QA --tree-only 추가,before는14차모듈 |
| 보존 | 원본에셋/배치/크기/pivot/남북동선/충돌/전투규칙/다른stage/손동작 불변 |

MAP PRODUCTION REPORT — 15차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes 유지. LARGE sourceassets/composites/overlap/repeated silhouette 유지. MEDIUM 나무뿌리 연결부 고정,큰 재질접합 잔여. GROUND shadow/contamination 유지,원본뿌리 끝의 국소들기. PLAYABLE arenas/travel/breathing/threat/combat공간 유지. LANDMARK primary대왕나무 외측뿌리2개 굽힘,secondary/tertiary 유지. CAMERA QA TREE_DETAIL+COMBAT,START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT전체는이전자료. TECH QA25검사,route/collision불변,로딩·오류·성능최종기록아래. FILES stage-owned효과/test/QA/본 문서,concurrent touched game캐시·맵디테일2행·에셋목록·production·CHANGELOG부분,unrelated없음. GIT 코드+docs부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 나무원본의뿌리 동작 보강. 전체배경뿌리 애니메이션/재질완성은아님. NEXT PASS: 큰 재질접합과 배경에 구워진 뿌리의 분리 검토.


15차 최종 검수: TREE_DETAIL+COMBAT,errors/HTTPerrors=0/0,mapUnchanged=True. tree60RAF median33.3/p95 50.0ms,COMBAT90RAF33.3/50.0ms. headless1280×720녹화·체력50ms보충. 사망UI직접호출error=None.25검사PASS. 확대포즈2장과실제TREE_DETAIL 검수,확인페이지pageerror=0. 전체전투 성능검증 아님. 확인페이지 <http://localhost:3333/captures/ch1_living_detail_pass15_20260927/index.html>. 이전비교GIF는동일뿌리효과였던12차최종검수영상.


## 16차 제작 이력: 나무에 매달린 고치와 시체 (2026-09-27)

사용자 “바뀐지 잘 모르겠다”에 따라 원배율에서 윤곽 이동이 읽히는 매달린 물체를 추가한다. 나무 원본 안의 고치3개·왼쪽시체1개를 코드 마스크로 분리하며 원본 PNG는 보존한다. 오른쪽 시체와 상단 작은 고치는 이번에 분리하지 않는다. 손14차/뿌리15차 유지.

| id | anchor(원본1143×1400) | amp(rad) | speed(rad/ms) | phase | 실제crop(x,y,w,h) | outline |
|---|---|---|---|---|---|---|
| 좌상고치 | [222, 424] | 0.1 | 0.00135 | 0.0 | (135, 308, 64, 113) | [[217, 424], [227, 424], [239, 455], [263, 485], [268, 532], [250, 562], [224, 572], [192, 546], [188, 510], [202, 470], [214, 447]] |
| 좌하작은고치 | [303, 608] | 0.13 | 0.00165 | 1.8 | (197, 442, 54, 138) | [[298, 608], [308, 608], [314, 641], [340, 673], [340, 726], [325, 766], [311, 790], [295, 766], [277, 718], [273, 681], [292, 640]] |
| 좌측시체 | [140, 609] | 0.085 | 0.0011 | 3.1 | (73, 443, 65, 200) | [[134, 609], [146, 609], [150, 624], [170, 642], [183, 685], [185, 758], [174, 824], [156, 862], [139, 876], [126, 834], [106, 803], [103, 698], [106, 654], [120, 627]] |
| 우측큰고치 | [1005, 430] | 0.11 | 0.00145 | 4.4 | (695, 312, 85, 232) | [[998, 430], [1010, 430], [1015, 470], [1036, 494], [1053, 518], [1063, 564], [1059, 650], [1043, 680], [1038, 706], [1025, 728], [1001, 740], [987, 727], [982, 691], [971, 666], [960, 633], [953, 568], [958, 523], [979, 486], [990, 453]] |

| 항목 | 현행 계약 |
|---|---|
| treeHangers | source축소836×1024기준sx=width/1143,sy=height/1400. organic tree캐시 생성시 실행. stage/load/srcRect 가드는기존계승 |
| 추출 | x0/y0=max(0,floor(outline최소*sx/sy)-2),x1/y1=min(source크기,ceil(outline최대*sx/sy)+2). tex크기차이. 원본에서 outline clip→tex복사,source동일outline destination-out. 그후 기존뿌리atlas베이크. source/staticBody에는 원래매달린물체가중복되지않음 |
| 회전 | angle=sin(now*speed+phase)*amp. source축척pivot(ax,ay)=anchor*(sx,sy);worldpivot=(dx+ax/fullW*dw,dy+ay/fullH*dh). save→translate(pivot)→rotate(angle)→draw(tex,(x0-ax)/fullW*dw,(y0-ay)/fullH*dh,tex.width/fullW*dw,tex.height/fullH*dh)→restore |
| 순서 | 기존staticBody→rootpatch→매달린4개. 매듭좌표고정,물체길이·형태는rigid회전으로유지. 기존전체나무sway계승. 추가텍스처는정적이며 매프레임GPU업로드없음,draw4회추가 |
| 메모리 | hanging추가0.1808319091796875MiB,기존61.58134841918945+추가=61.76218032836914MiB native캐시. GPU복제/임시/기존나무shadow별도. 기존나무바닥투영그림자는정적캐시유지 |
| QA | HANGING_DETAIL tile(102,82)추가,전체카메라15개. --tree-only는TREE_DETAIL+HANGING_DETAIL,--hanging-only는HANGING_DETAIL. 해당GIF clip(100,100,1050,480),24프레임/250ms대기+실측간격. 기존상세clip유지. before=15차모듈라우팅. 총26검사(효과18/geometry5/문법1/패키징2) |
| 보존 | 나무원본·콜리전·동선·크기·pivot·나머지stage 불변. 매달린물체 윤곽이빈공간을가로지르지만플레이충돌추가없음 |

MAP PRODUCTION REPORT — 16차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes유지. LARGE sourceassets/composites/overlap/repeated silhouette유지. MEDIUM 매달린연결부고정,대형재질접합잔여. GROUND shadow/contamination/접지유지. PLAYABLE arenas/travel/breathing/threat/combat공간보존. LANDMARK primary나무의매달린4개동작,secondary/tertiary유지. CAMERA QA TREE_DETAIL/HANGING_DETAIL+COMBAT,기본START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT는이전자료. TECH QA26검사,route/collision불변,오류/로딩/성능아래최종기록. FILES stage-owned효과/test/QA/본 문서,concurrent touched game캐시·맵디테일2행·에셋목록·production·CHANGELOG부분,unrelated없음. GIT 코드+docs부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 원배율 윤곽 움직임 보강. 모든 고치·시체의 애니메이션/전체맵 완성 아님. NEXT PASS: 큰 재질접합과 실제 전투배율의 가시성.


16차 최종 검수: 초기TREE_DETAIL+HANGING_DETAIL+COMBAT 후,피해색/튜토리얼가림을제거한HANGING_DETAIL+COMBAT재검수. errors/HTTPerrors=1/0,mapUnchanged=True. hanging60RAF median16.7/p95 33.4ms,COMBAT90RAF16.7/33.4ms. headless1280×720녹화·체력50ms보충. 카메라촬영동안50ms마다P.iframes최소60유지,COMBAT전에플래그false/P.iframes=0으로해제. 사망UI직접호출error=None.26검사PASS. 최초오류기록initial-runtime.json보존. baseline15차에서도errors=1,동일calcCP→renderInv→_invChangeCategory→ui-panels.js:init의P=null/baseAtk오류가재현됨. 새맵렌더와별도인인벤토리초기화오류이며이번범위에서UI코드수정안함. 전체런타임오류0이라고보고하지않는다. 확대2포즈/실제HANGING_DETAIL 확인,확인페이지pageerror=0,이전/수정후토글정상. 전체전투성능판정아님. <http://localhost:3333/captures/ch1_living_detail_pass16_20260927/index.html>. 동일캔버스의15차/16차렌더토글로피해필터조건차이없이윤곽이동비교가능.


## 17차 제작 이력: 오른쪽 매달린 시체 보강 (2026-09-27)

기존 맵 보강 재개. 16차에서 정지 상태로 남은 오른쪽 시체를 추가 분리했다. 상단 작은 고치는 정적이다. 원본 파일·가지·몸통·고치3개·왼쪽시체·뿌리·손 동작 계약은 유지한다.

| id | 적용 위치 / 값 / 공식 |
|---|---|
| RIGHT_CORPSE | m_c1tree 원본1143×1400, anchor=[928,415], amp=.065rad, speed=.0012rad/ms, phase=2.4rad; angle=sin(now*.0012+2.4)*.065, 주기약5.236초 |
| outline | [[924, 415], [933, 415], [934, 435], [947, 433], [958, 444], [960, 461], [949, 481], [948, 510], [945, 548], [947, 579], [936, 600], [940, 623], [938, 640], [926, 633], [919, 604], [916, 622], [921, 642], [912, 651], [902, 640], [907, 612], [907, 591], [901, 603], [897, 582], [897, 546], [899, 509], [899, 484], [905, 469], [922, 454], [926, 437]] |
| 추출 | 16차 outline clip/destination-out 재사용. 축소836×1024 기준 crop=(654,301,51,178), 정적 RGBA 캐시1장 추가. 원본PNG 불변 |
| 순서 | staticBody→rootpatch→오른쪽시체→기존4개. 매달린 고치3개·시체2개 총5개, draw5회. 신규 프레임별 텍스처 업로드 없음 |
| 메모리 | 이번 증가0.03462982177734375MiB, hanging합계0.21546173095703125MiB, 전체 native캐시61.796810150146484MiB. 기존43.0625MiB 대비 추가18.734310150146484MiB. 임시/GPU복제/기존나무shadow 별도 |
| 격리 | stage0 production만, arena/fieldRebuild 제외, 미로드/srcRect 폴백 유지. geometry/collision/START/EXIT/배치/진행 불변 |
| 검증 | 오른쪽 몸통 crop(904,490,30,115) 시간 변화 실패 재현 후 PASS. 가지 crop(895,350,40,50) 고정. 효과19검사 PASS. QA before=16차 모듈, 출력 captures/ch1_living_detail_pass17_20260927 |

MAP PRODUCTION REPORT — 17차 완료 기록

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음.
LARGE: 기존 원본·composites·overlap·repeated silhouette 유지.
MEDIUM: 오른쪽 시체 매듭 고정, 큰 재질 연결 문제 잔여.
GROUND: shadow/contamination/structure integration 유지; 전체 피부 재질 통합 미완료.
PLAYABLE: arenas/travel/breathing/threat 공간 유지. 추가 충돌 없음, HANGING_DETAIL/입구 COMBAT에서 플레이어·스킬 윤곽 확인. 대규모 전투 검수는 미실시.
LANDMARK: primary 대왕나무 오른쪽 시체 보강; secondary 고치/독액 및 tertiary 뿌리 유지.
CAMERA QA: HANGING_DETAIL 및 COMBAT 촬영·직접 이미지 확인 완료. START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT는 이번 재촬영 전.
TECH QA: 27검사 PASS(효과19/geometry5/문법1/패키징2); route/collision 구현 불변, mapUnchanged=true. pageerror/console error/HTTP error=0. 로드28/28청크 ready, seam 관련 청크 변경 없음. HANGING_DETAIL 60RAF median33.4/p95 50.1ms, COMBAT90RAF 33.4/66.7ms. headless1280×720 녹화, 카메라 무적/50ms 체력 보충, 전투 전 무적 해제. 전체 전투 성능 PASS를 뜻하지 않음. 사망UI error=null.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js/tools/qa_ch1_living_detail.py/본 문서. concurrent touched game.html 캐시버전·맵디테일 해당2행. unrelated 수정 없음.
GIT: 변경 누적100개 방지를 위한 작업 단위 부분 체크포인트. 기존 타 작업 staged 보존. push/deploy 없음.
VISUAL VERDICT: RETOUCH — 국소 움직임 보강, 전체맵 완성 아님.
NEXT PASS: 기존 구도를 유지하며 큰 재질 접합 보강. 상단 작은 고치와 나무 투영 그림자 내부 실루엣은 정적. 기본8카메라 전체 재촬영·대규모 전투 검수는 이번에 미실시.

확인: <http://localhost:3333/captures/ch1_living_detail_pass17_20260927/index.html>. 기존16차와 현행17차를 같은 시간·캔버스에서 전환한다. 실제 게임 영상/움직임 GIF/runtime.json 포함. 코드 체크포인트 fc49313f2. 후속 문서 동기화 커밋은 별도. 기존 다른 작업의 staged 변경은 보존했다.


## 18차 현행: 시체나무 뿌리의 접촉 그림자 (2026-09-27)

GATE4 지면 접합 보강. 기존 나무 원본의 하단 뿌리 알파를 이용해 밑동과 지면 사이에 낮은 접촉 그림자를 추가한다. 매달린5개/뿌리/손의 동작과 원본 PNG·배치·콜리전은 유지한다. 새 소품 또는 전체 지면 피부화가 아니다.

| id | 적용 위치 / 수치 / 공식 |
|---|---|
| rootContactCache | m_c1tree 이미지별 WeakMap. 기존 stage0 production·로드·시야 guard 내부, native Canvas2D 최초1회 생성 |
| 원본 범위 | r=meta.srcRect 또는 전체이미지. (r.x,r.y+r.h*.72,r.w,r.h*.28), 하단28% 알파를 사용 |
| 텍스처 | 투명512×192, 원본범위를(16,16,480,160)에 그린다. 최초 blur6px 이후 filter=none |
| 색·감쇠 | source-in, Y0→192 linear gradient. RGB(18,12,17), alpha stop0:0/.25:.3/.7:.65/1:0. 원본의 투명 여백 보존 |
| 배율 | size=(meta.sz\|\|400)*(o.scale\|\|1), factor=_hand?.72:1, ar=r.w/r.h, dw=size*min(1,ar)*factor, dh=size*min(1,1/ar)*factor |
| 접지 | sx=dw/480,sy=dh*.28*.55/160,base=o.y+dh*(_hand?.28:.5). dest=(o.x-dw/2-16*sx,base-dh*.28*.55-16*sy+dh*.012,512*sx,192*sy) |
| 합성·순서 | 기존 shadows()에서 기존 나무 투영그림자보다 먼저 source alpha로 drawImage1회. 캐릭터·전투효과 아래. 동적 업로드/프레임별 blur 없음 |
| 메모리 | 이미지1종 기준0.375MiB 추가. native 합계62.171810150146484MiB, 기존43.0625 대비19.109310150146484MiB. 기존나무투영그림자/임시/GPU복제 별도 |
| 보존 | geometry/collision/START/EXIT/regions/전투공간/나무원본/기존동작 유지. 추가 MAP_OBJS/scatter0 |
| 테스트 | 고정 foot 위쪽의 접촉 알파 및 사각형 얼룩 없음 검사를 실패 재현한 뒤 PASS. 효과20+geometry5+문법1=26검사 PASS. 최초 패키징2개 중1개 실패: 동시작업 inventory-gems.css가 NW.js FILES에 빠짐. 맵 변경 외부 사유 |

MAP PRODUCTION REPORT — 18차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/main route SOUTH→NORTH/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 및 major holes 유지.
LARGE: source assets/composites/overlap/repeated silhouette 유지.
MEDIUM: 매달린 연결부 변경 없음, 큰 재질 접합은 잔여.
GROUND: 원본 하단 뿌리 알파 기반 낮은 contact shadow 추가, contamination 유지, 밑동 접지 보강.
PLAYABLE: main arenas/travel/breathing/threat 공간 유지. 전투 가독성 검수는 아래 결과에 한정.
LANDMARK: primary 대왕나무 접촉 그림자, secondary 고치/독액·tertiary 뿌리 동작 유지.
CAMERA QA: TREE_DETAIL/HANGING_DETAIL/COMBAT 촬영. START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체 재촬영은 이번 범위 아님.
TECH QA: route/collision 구현 불변. 기존 chunk seam 불변. pageerror/404/loading/performance는 아래 실측 기록.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js/tools/qa_ch1_living_detail.py/본 문서. concurrent touched game.html 캐시버전·맵디테일2행·에셋목록·production·CHANGELOG 해당행. unrelated 수정 없음.
GIT: 이번 코드+docs만 격리 커밋. 기존 staged/다른 작업 보존. push/deploy 없음. 동시작업으로 전체 변경100개 초과, 타 작업을 임의 커밋하지 않음. 예약 자동정리 재등록 없음.
VISUAL VERDICT: RETOUCH — 국소 접지 보강, 전체 재질 통합·대규모 전투 최종 검수 미완료.
NEXT PASS: 기존 구도 보존, 큰 재질 접합 개선 및 전체8카메라 검수.


18차 실제 검수: {"errors": [], "httpErrors": [], "mapUnchanged": true, "cameras": [{"name": "TREE_DETAIL", "frameTimesMs": {"median": 33.30000000000291, "p95": 33.400000000001455, "samples": 60}}, {"name": "HANGING_DETAIL", "frameTimesMs": {"median": 33.30000000000291, "p95": 33.400000000001455, "samples": 60}}], "combatRAF": {"median": 33.30000000000291, "p95": 50, "samples": 90}, "deathCheck": {"buttonPresent": true, "shown": true, "error": null}, "ready": 28}. headless1280×720 녹화·50ms 체력보충·카메라무적 후 전투 전 무적해제. 전체성능 보증 아님. 확인 <http://localhost:3333/captures/ch1_living_detail_pass18_20260927/index.html>.
