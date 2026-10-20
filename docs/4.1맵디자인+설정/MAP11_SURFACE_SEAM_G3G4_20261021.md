# MAP11-10 — root shoulder·수피/피부 접합·바닥 가독성 G3/G4

G1 구조는 임시 승인, G2 외곽은 총괄 눈 검수 대기 상태를 인수했다. latest fetch main `0138c5bb9188d27cee10cb1a901d075092ddb88f`에서 MAP11-09 `283c20779e7a852980cd308b1d6440511a848b7b`를 정상 merge(FF)했다. 이번 결과는 별도 `field_seam_preview.tscn`이며 제품 Main 연결은 없다.

| 8개 고정 시점(1920×1080 + literal 1x) | G3/G4 확인 대상 |
|---|---|
| 01_start | 남쪽 진입 통로·좌우 숲 밑동→root shoulder→연속 바닥. 문 중앙은 비움 |
| 02_early | 낮은 통나무·바닥 접지, LEFT 숲과 피부면의 접합/오염 |
| 03_main | 큰 전투면 유지, 반복 줄인 저채도 표면. 1x는 왼쪽 아래 불규칙 균열과 바닥을 보여 줌 |
| 04_west | LEFT 외곽의 낮은 수피/뿌리 덩어리와 마른 지역 바닥 접합 |
| 05_east | RIGHT·습윤 지역의 낮은 채도/명도 차이, foreground fade 유지 |
| 06_landmark | D01 형상/크기 보존. 바닥 근부 접합과 부드러운 그림자만 교체 |
| 07_late | 북쪽 접근로에서 회전/스케일 변주의 반복·균열 조각·오염 확인 |
| 08_gate | gate 기존 폭/Marker 유지, 기둥 밑 접합·그림자·입구 가독성 |

보충09_overview·10_occlusion은 전체 조립 및 기존 가림 확인용이다. 원본/크롭은 무보정이며 1x를 확대해서 만든 이미지가 아니다. root shoulder가 적/탄/경고를 가리는 수직 오브젝트가 되지 않도록 전부 지면 레이어에 둔다.

## 기존 RGBA 재사용·접합

새 이미지/AI 생성·다운로드·PNG 재가공 0. `ch1/ground_dark_soil.png`를 760/1130/1830 월드 스케일, .27/−.89/1.73 rad 회전·offset으로 연속 샘플링한다. 5탭 필터와 낮은 대비로 원본의 밝은 미세 입자를 억제한다. 바닥은 지역별 딱딱한 색 경계/회색 가이드 선을 없애고 연속 저채도 피부/흙색으로 렌더링한다. 회색 평면 pool 표시는 동쪽의 연속 damp tint로 통합하며 별도 원형 테두리는 그리지 않는다. 논리적 4지역과 collider/LOS는 변경하지 않는다.

중형 shoulder는 `ch1/floor_objects/prop_g_edge.png`와 `props/prop_g_root.png`를 재사용해 원본 alpha/relief를 유지하되 보라·초록 halo를 낮춘다. 외곽53+기존 내부 mass 근부7=60개, 경계 feather 및 오염/접지 그림자를 겹친다. 숲152개·밑동 정렬/가림 캐시는 인수 코드 그대로다. 내부7 mass와 플레이어의 기존 단단한 타원 그림자는 이 파생 씬에서만 map-look radial 캐시를 공유하는 부드러운 그림자로 교체했다. 중앙/랜드마크/문 실루엣·높이·foot는 그대로다.

균열은 기존 `ch3/floor_objects/prop_ice_gcrack.png`(883×900 RGBA)의 분기 alpha와 내부 relief만 재사용한다. 냉색/광원/얼음 판정이나 동작은 반입하지 않고, 낮은 명도 갈색·적색으로 재매핑한다. 10지점×3개, 총30개의 서로 다른 회전·240–480×170–365 월드 크기·간격으로 불규칙 굵기/끊김을 만든다. Line2D·매끈한 이중 곡선·고정 폭 케이블을 추가하지 않는다. 실제 조직 균열 아트 proof를 대신 완성했다고 주장하지 않는다.

첫 proof의 밝은 미세 입자/판처럼 보이는 접합은 필터·가장자리 혼합으로 수정했다. 흙 명암 추출의 점무늬, 32px alpha의 반복 문양/평행 발톱 형태는 모두 폐기했다. 최종 채택/캡처는 고해상도 기존 alpha의 final-04다. 원문/PNG는 각 proof/final 폴더에 보존한다. final-01의 offscreen Camera2D 모드 WARNING1은 PHYSICS 명시 후 final-02에서 ERROR0/WARNING0, 두 seam 오차0으로 재확인했다. 벤치는1회만 실행했다. 그 벤치는 마지막 균열 소스/마스크/크기 교체 전 표본이다. 30노드·tick 경로는 같지만 마지막 시각 변경의 GPU 성능은 재측정하지 않았으며 최종 제품 FPS 보장으로 쓰지 않는다.

## G3/G4 seam·crop/bleed 계약

`field_surface.gdshader`는 `VERTEX.xy + surface_origin`을 사용한다. chunk마다 local vertex를 쓰면 반드시 그 월드 origin을 함께 공급해야 UV가 리셋되지 않는다. seed/tile 시간 갱신 없이 같은 월드 위치는 같은 텍스처 phase를 사용한다. stamp는 승인 outer polygon mask로 clip하여 밖으로 나오지 않는다.

최종 GUI 하니스는 별도 World2D/SubViewport에서 연속 master와 origin이 다른 두 겹친 polygon을 실제 렌더링해 비교한다. 576×576 sample master(2world/pixel, bounds −576,448,1152,1152)에서 core폭512world·bleed64world(32pixel)를 둔 좌우 320×576 crop을 만들고, 그 lossless 이미지 타일을 다시 배치해 master와 비교한다. 이 파일들은 **검수용 bake/bleed 표본**이며 제품 전체 맵 고해상도 bake나 World residency/스트리머 설치가 아니다. seam_probe/manifest.json에 bounds·origin·crop·bleed·오차를 남긴다. 공용 World/카메라/State 수정 없이 이 계약을 인계한다.

## 검증·성능·가독성

| 검사 | 결과·한계 |
|---|---|
| 신규 headless | 초기14/0, ERROR0/WARNING0. shoulder/30균열/152숲·승인 mask·기존 tex·static transform·clearing/gate/LOS. 접지 그림자 hook 확인14/0, ERROR0/WARNING0(마지막 시각용 균열 소스 교체 전). 최종 소스는 final-04 실제 GUI에서 재컴파일·실행 ERROR0/WARNING0 |
| 직접 회귀 | 기존 actual walk49/0, 12,003 실제 motion call/4지역, ERROR0/WARNING0, 1회. 원래 USERDIR 상수 사용 |
| 실제 seam/bake 재조립 | 월드 조각/bleed crop 재조립 모두 RGB 표본 최대 오차0(허용2/255). 576×576 실제 렌더/각320×576 tile. 카메라 mode 명시 후 final-02 및 최종 final-04 모두 두 오차0, ERROR0/WARNING0. 8pixel 간격 5,184개 RGB 표본 비교 |
| 120fps 벤치1회 | warm120 / 600physics tick@60Hz, 8시점, 1920×1080, vsync off. 벽시계9.999748s/13,994frame/평균1399.44fps/p95≤0.92ms·p99≤1.51ms/평균draw34.68, M5Pro/gl_compatibility. 표본 frame time은120fps 예산 안이다. frame8.333ms / 60fps 하한, mapCPU1.25ms·envGPU3ms는 계획 예산. GPU timer/실제 제품 AI·전투 동시 측정 아님 |
| 전투 가독성 | 바닥·decal은 player/적/탄보다 아래. 무발광·저채도·낮은 명도, 보라/파랑/초록 경고 유사색 억제. player 원본 RGBA·흰 칼날/실루엣을 고정8시점/1x로 확인. 실제 적·탄·Q/E 전체 동시 전투는 제품 통합 QA에서 재검수해야 하며 이 표본으로 실전 완료를 주장하지 않음 |
| 보호·격리 | Main/State/World/제품 카메라/전투/저장·승인 geometry/provider·기존G1/G2 소스·원본PNG 0줄. 신규 격리 EXODUSER-map11-10-Isolated-20261021의 실제 user dir 확인, 실제 사용자 save 사용0. Godot 전 exact pgrep≥2면30초 대기·실행 후 override0byte |

## MAP PRODUCTION REPORT (§23)

작업 범위는 MEDIUM CONNECTION / GROUND CONNECTION / G3/G4 바닥·접합 검수다. MASTER PLAN·LARGE OUTER MASS는 G1/09 인수, PLAYABLE/COMBAT geometry는 보존, LANDMARK/CENTER 형상과 SMALL DETAIL 최종 아트/부분 조명은 별도다. CAMERA QA는 동일8시점+1x/보충, TECH QA는 실제 렌더 seam/bake·관련 테스트·벤치다. **VISUAL VERDICT: RETOUCH — 맥북총괄 G3/G4 눈 검수 대기**, G2도 별도 판정 대기다. 전체 피부바닥/실제 조직 균열의 최종 아트 승인과 구별한다. 원로그/표본/캡처는 `~/exoduser-wt/_out/map11-10/`; 자기 branch push·원격SHA·DONE 후 자기 worktree 제거.
