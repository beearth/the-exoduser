# CH1-1 기존 맵 디테일·접지·생체 움직임

사용자 지시: 현재 1-1을 보존하고 디테일·입체감·동적 움직임만 추가한다. 기존 production_finish 베이스 위의 국소 보강이며 v4~v8 정지 원화의 게임 적용이 아니다.

## 런타임 계약

| id / 적용 위치 | 값 / 동작 |
|---|---|
| 구현 | `ch1-living-detail.js?v=20260925-6`, 전역 `Ch1LivingDetail.draw/deform/shadows`; `build-nwjs.mjs` 배포 FILES에도 포함 |
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
| 힘줄 | dry3/4/5갈래, wet5갈래; seed=variant*1.7, 각도간격2.399rad, 길이 `100+42*sin(seed+j*1.7)`, 지면 Y `.55`; 굴곡 제어점진폭22px(6차, 실제 경로 변위와 다름), 갈래 위상차.8rad |
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

색상/곡선 제어점의 상세값은 동명의 소스에 대응하며 조직 몸체 RGBA `(87,44,52,.78)`, 독액 몸체 `(63,61,35,.65)`, 상면 `(158,119,114,.3)`, 가지 `(71,43,44,.3)`, 잔물결 RGB `(149,142,83)`이다. 전체 지면 피부 교체, 대형 외곽 높이 재설계, 구덩이 벽 수축은 이번 구현 범위 밖이다.

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
