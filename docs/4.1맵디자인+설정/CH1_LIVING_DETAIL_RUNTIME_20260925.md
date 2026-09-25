# CH1-1 기존 맵 디테일·접지·생체 움직임

사용자 지시: 현재 1-1을 보존하고 디테일·입체감·동적 움직임만 추가한다. 기존 production_finish 베이스 위의 국소 보강이며 v4~v8 정지 원화의 게임 적용이 아니다.

## 런타임 계약

| id / 적용 위치 | 값 / 동작 |
|---|---|
| 구현 | `ch1-living-detail.js?v=20260925-3`, 전역 `Ch1LivingDetail.draw/deform/shadows`; `build-nwjs.mjs` 배포 FILES에도 포함 |
| 범위 | `G.stage===0`, `_bossArena` 및 `_fieldRebuildQA` 제외 |
| 지면 순서 | `_drawCh1Hill` 다음, 오브젝트·캐릭터·전투 효과 이전. `surfaceOnly=true` 잔물결은 맵 오브젝트 뒤/캐릭터 앞 |
| 앵커 배율 | `m_c1tree:2.1`, `m_c1cocoon:1.1`, `m_c1pool:1.25`, `m_c1spod:.65`, `m_c1sroot:.75`, `pit_poison:1.2`, `m_rotten_tree:1` |
| 실제 배율 s | 앵커 배율 × `min(1.6, mo.scale || 1)` |
| 시야 제외 | 카메라 반폭/반높이 + `160*s`; zoom=`max(.3, _edZoom || _camZoom || 1)` |
| 렌더 자원 | 런타임 생성 투명 canvas atlas 4종(조직/독액 주변/수면/체액), 각각 1280², 4×4칸, 셀320², 16프레임. 최대 RGBA 25MiB, 최초 사용 후 재사용 |
| 접지 Y 오프셋 | `m_c1tree:230`, `m_c1cocoon:100`, `m_c1spod:40`, `m_rotten_tree:50` px × `(mo.scale || 1)`; 기타0. 수면은 오프셋0 |
| 합성 | source-over 기본, 인접 두 프레임 alpha `1-mix`/`mix`. GPU에는 `drawImage`만 전달, 곡선/gradient는 native Canvas2D에서 최초 베이크 |
| 맥동 | 각속도 `.00095 rad/ms`, 약6.614초/주기; 앵커 위상 `x*.017+y*.011`; 프레임16개 사이 선형 혼합 |
| 접촉 그림자 | 중심(12,24), Y축 .42; 반경12→156, alpha `.48/.25/0`(stop `0/.48/1`) |
| 힘줄 | 5갈래, 각도간격2.399rad, 길이 `100+42*sin(j*1.7)`, 지면 Y `.55`; 굴곡진폭8px(1차3.2에서 확대), 갈래 위상차.8rad |
| 힘줄 명암 | 길이를24구간으로 분할, u=k/24, taper=`(1-u)^.8`. 그림자폭 `11*taper+.35`, 몸체폭 `(5.2+pulse*1.5)*taper+.2`, 상면폭 `1.25*taper+.1` 및 (-.8,-1.6)×taper 오프셋. X주름 `sin(u*31+j)*u*(1-u)*2`, 가지폭1.5. 끝으로 가늘어져 균일한 선 느낌을 줄임. 실제 크기는 s 배율 적용 |
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

색상/곡선 제어점의 상세값은 동명의 소스에 대응하며 조직 몸체 RGBA `(69,39,43,.58)`, 독액 몸체 `(63,61,35,.55)`, 상면 `(139,112,100,.19)`, 가지 `(71,43,44,.3)`, 잔물결 RGB `(149,142,83)`이다. 전체 지면 피부 교체, 대형 외곽 높이 재설계, 구덩이 벽 수축은 이번 구현 범위 밖이다.

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
