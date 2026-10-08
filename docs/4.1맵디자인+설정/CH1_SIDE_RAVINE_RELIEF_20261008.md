# CH1-1 양옆 골짜기·절벽 렌더 — 2026-10-08

사용자 “1-1에 높낮이 지형물”, “옆 골짜기 낭떠러지”, “틈맵같이”에 따라 실제 `game.html`의 production_finish 바닥 렌더에 좌우 골짜기를 연결했다. 기존 뿌리 절벽 이미지를 비보행 외곽의 수직 면에 투영하고, 어두운 바닥과 높은 반대편 어깨를 구성한다. 캐릭터가 오르내리는 물리 고도는 이번 범위에 없다. **VISUAL VERDICT: RETOUCH / 실제 게임 카메라 검수 NOT_RUN.**

## 현재 계약

| 항목 | 실제 코드값·범위 |
|---|---|
| 소유 source | `ch1-side-ravines.js`, `game.html`의 script/draw 2곳, `build-nwjs.mjs` FILES 등록 1곳 |
| 활성화 | 기존 smoothing / `assets/map/ch1/production_finish` / `_ch1StartOuterEnabled()`; 모듈은 stage0·nonboss·200×200·T40만 허용 |
| 위치 정본 | `CH1_1_PRODUCTION.version === '20260916-finish-1'`, 기존 boundary53점의 인덱스 사용. 원 boundary/nav/scene 파일 변경0 |
| 서쪽 `west-camp-gorge` | boundary[12..16]=[(28,107),(40,114),(53,118),(62,126),(58,137)]; side−1, width420, depth220, rise86 world 표시단위 |
| 동쪽 `east-terrace-gorge` | boundary[38..42]=[(160,110),(175,105),(180,93),(172,84),(151,79)]; side+1, width500, depth300, rise128 world 표시단위 |
| 높이 의미 | depth/rise는 새 authored 화면 투영량. 원화·height map의 실측값/충돌 고도/추락 피해/Three 지면 높이로 해석하지 않는다 |
| 경계 샘플 | polyline 길이 기준 STEP48 이하. 끝단 smooth(t/.12)×smooth((1−t)/.12), 폭변주 .9+.1sin(9t+.7), 깊이 .9+.1sin(7t+.4), 어깨 .8+.2sin(11t+1) |
| 보행면 보호 | face가 투영되는 y−rise−40..y+depth+40 전체 행의 실제 map 끝을 찾아 외측160px 이격; x는 이웃±3, 가중치4−abs(j)로 3회 smoothing. 최종 출력은 현재 `G.map`의 3×3 전부 wall1인 타일만 허용 |
| face 좌표 | top=(lip,y); toe=(lip+side×(24+.12w),y+depth); farToe=(lip+side×.76w,y+.82depth); crest=(lip+side×w,y−rise) |
| 재질 | 기존 `_OBJ_SPR['m_c1gedge']` / `assets/map/ch1/floor_objects/prop_g_edge.png` borrowed. complete 및 naturalWidth≥1000/naturalHeight≥500. 새 Image/fetch/PNG 생성0 |
| face crop | u=510+(segment%7)×60, src (u,70)..(u+90,470), 2 affine 삼각형/segment; 근면 alpha .90, 원면 .62; 최대 crop끝(960,470) |
| 바닥/접합 | 기존 이미지(520,70,400,400)를 320² 임시 canvas 패턴으로 재사용, rgba(7,10,15,.72) 음영. face12단계 rgba(8,11,10,.04+.46f²), lip dark blur6/width20/.45 및 highlight blur3/width6/.12. y끝 0/.07/.93/1 alpha fade |
| 캐시 | bbox margin56/T40정렬, RES .5; 보이는 section당1개, 최대2개. map/image/layout identity 변경시 이전 canvas `_freeMapTex` 호출 후 재생성. 같은 map 내부 변경은 새 geometry bake 없이 live tile 출력만 보호 |
| GPU 포트 | 메인 X의 clip()은 no-op이므로 clip에 의존하지 않음. 행별 연속 wall 구간을 9-argument drawImage로 같은 source/destination 크롭. 캐시 내부는 실제 Canvas2D clip/transform 사용 |
| cull | 기존 `_tzoom`을 viewport 역산에만 사용. section x범위±width±400, y범위−rise−100..+depth+100; 최종 cache bbox/viewport 교집합. 새 camera transform0 |
| 배치 순서 | 기존 `Ch1LivingDetail.draw` 뒤·오브젝트/적/캐릭터 앞. forest42를 새 개별 나무로 중복 배치하지 않음. 골짜기가 기존 baked 비보행 그림 일부를 덮는 접합은 RETOUCH |
| 자원/수명 | 새 RAF/timer/animation clock/save/G state 필드0. 이미지 소유0. scope earlyreturn 때 캐시가 즉시 해제되는 보장0; 다음 유효 owner 변경/clear까지 참조 유지 |
| 불변 | 남START→북EXIT, 중앙 전투 바닥, collision/nav, `_CH1_HILL`/west ramp, 적AI·전투·보상·저장·원PNG/scene/LOCK 불변 |

## 최초 검수와 한계

외부 근거 폴더: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-side-ravine-relief-20261008`.

| epoch | 실제 수행·판정 |
|---|---|
| 최초 후보 | Node1 / actual module + 통제 ports + native @napi-rs/canvas, 11그룹36 checks PASS / exit0 / unhandled계측0. 옛 pool 재질·clip 기반 Canvas-only 후보이며 최종 GPU 포트 검수로 세지 않음 |
| 정적 peer 결함 | 메인 X.clip no-op 확인. 출력 전 live wall run을 source crop으로 제한하도록 수정. 초기 후보 화면의 계단/굵은 선/평면 바닥은 재질·접합 RETOUCH |
| crop 수정 epoch | Node1 / 4그룹42 checks PASS / exit0 / unhandled계측0. clip을 호출하면 throw하는 메인 유사 port, 9-argument crop 범위/3×3 보호, in-place floor 변경, east-first sparse cache 해제 검수. 최종 soft builder 전 epoch |
| 최종 soft builder | Node1 / 두 source-raster 카메라 검수2 PASS / exit0. 서(1200,4140) visible표본40599, 동(7440,3860)89273 / 두 곳 floor+collar leak표본0. 캐시688800/369600px. Node 빌드4.865/3.868ms는 브라우저 성능 보증이 아님 |
| 직접 시각 판독 | west/east-soft-comparison.png, 실제 원PNG+actual source Canvas 렌더. 게임 촬영이 아님. 골짜기 벽/어두운 바닥 깊이 추가 확인, baked 숲 접합·긴 세로 반복·실전 화면은 RETOUCH |
| 범위 제한 | fixture map은 실제 layout.contains로 만든 통제 map. live G.map/whole draw/실GPU upload·pixel·페이지404·실캐릭터 가림·zoom·8camera·native6·청취·실save NOT_RUN/UNKNOWN. 서로 다른 epoch의36/42/2를 합산하지 않음 |

## MAP PRODUCTION REPORT (§23)

| FIELD | RESULT |
|---|---|
| STAGE | CH1-1 actual production_finish ground consumer / ROOT-CH1-SIDE-RAVINE-RELIEF-20261008 |
| MASTER | 기존53점 silhouette·8regions·S→N main route 보존. 좌우 비보행 side spaces에 새 깊이 투영 |
| OUTER MASS LEFT / RIGHT / TOP / SOUTH / major holes | LEFT west-camp-gorge, RIGHT east-terrace-gorge; TOP/SOUTH 기존 유지. 주요 미완료: 걸을 수 있는 고도·높낮이 actor 발접지·숲과 cliff 접합·실카메라 가림 |
| LARGE source assets / composites / overlap / repeated silhouette | 기존 prop_g_edge crop2면+shadow pattern. 원PNG 수정/나무 중복 scatter0. 긴 반복 crop/기존 baked 그림 위 겹침 RETOUCH |
| MEDIUM connections / remaining holes | 유기적 lip smoothing·끝단 fade 추가. 기존 둑/숲과의 단면 연결은 추가 실화면 조정 필요 |
| GROUND shadow / contamination / structure integration | 수직 면 하부 음영·텍스처 바닥. live 3×3 wall run 출력으로 바닥+1tile collar 보호. 피부 전투면 변경0 |
| PLAYABLE arenas / travel / breathing / threat / combat readability | 기존 arena/이동폭/휴식·위협 배치 불변. fixture leak0; 실전 밀집전투 가독성 미검수 |
| LANDMARK primary / secondary / tertiary | 기존 corpseTree / altar / camp·swamp 유지. 새 좌우 골짜기는 보조 외곽 실루엣 |
| CAMERA QA START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | source raster SIDE L/R 2개만 판독. 실제 게임8camera 전부 NOT_RUN |
| TECH QA route / collision / pageerror / 404 / seam / loading / performance | map/nav 쓰기0·통제 crop checks. 실제 route/collision/pageerror/404/loading/GPU/performance UNKNOWN. raster seam/재질 연결 RETOUCH |
| FILES owned / concurrent / unrelated | owned code3 + 관련 docs9. foreigngame185B·설정3.3foreign2948B·타인WIP 미채택. game 전체 stage0 |
| GIT staged / commit / push / deploy | 최종 completion.json 참조. 정상 owned commit/push/remoteexact 절차, 새 빌드/서버/배포0 |
| VISUAL VERDICT | RETOUCH / UI_NOT_ASSESSED / nativeNOT_RUN / NOT_LISTENED |
| NEXT PASS | 실제 CH1 좌우 카메라에서 캐릭터 크기·줌·전경 가림을 확인하고 숲 접합 조정. 보행 가능한 높낮이는 height/collision/actor 공통 projection 한 단위로 별도 구현 |
