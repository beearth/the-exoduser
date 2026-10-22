> 2026-10-22 PARITY-MAP-02 분기 갱신: CH1-1은 실제 C/2 라이트맵·정적12광원/iris색층·render-frame/밀리초분리·CSS뒤DOM안개 합성, 원본61군락얼굴/소품관절/늪/독구덩이를 연결한다. 배치/충돌/카메라·PC/UI/저장 변경0. [원본 대응·1440p청크·최종검수](PARITY_MAP_02_20261022.md). 아래20261020 수치·측정은 당시 이력이며 main/PC 인수 아님.

# P2-003A — 맵 조명·어둠·안개·비네트·색보정 원본화 (2026-10-20)

웹 대조 최대 화면차(바닥 평균 밝기 웹 25.5 vs Godot 52.9)의 원인 = 원본 포스트 합성
6단계 미이식. 전부 새 스크립트(`scripts/native_screen_lighting.gd`, CanvasLayer 5 —
월드 위·HUD(10) 아래)로 이식, main.gd는 생성·configure 호출만(wt-p2001h-curtain 경합 회피).

## 원본 추적 + 웹 실측 (web_light_measure.json — Canvas2D 경로·quality high·hwTier S)
| # | 단계 | 원본 행 | 실측/수치 | 구현 |
|---|---|---|---|---|
| 1 | 라이트맵 | 55199·_renderLighting 4693·_initLightStamps 4562·_collectLights 4653 | 어둠 rgba(6,16,9,.38)(_HELL_AMBIENT[0] 4505)·스탬프 [0,1][.25,.92][.5,.50][.75,.15][1,0]·광원 2(플레이어 r470 a .883 ci6 / 이리스 펫 r250 a .252)·LIT 색층은 _CENTER_GLOW=false(4637)+ci6 제외로 기여 0·3프레임 주기·하프해상도 | 셰이더(destination-out=알파 곱 1−a·stamp). 플레이어 광(P.x,P.y−6·a=.86+sin(f·.07)·.03)만 — 펫 미이식 기록. 풀해상도 근사 기록 |
| 2 | 토치 어둠 | 55230s·_TORCH 8689 | **darkAlpha=0 → 원본도 비활성** | 게이트 그대로 생략 |
| 3 | 2D 안개 2층 | 55352~55372·_bakeFogLayers 4366·_FOG_BOT/TOP_COLS 4358~4365 | 하단 rgba(60,90,120,.12)(y .6→1, .3지점 평탄)·상단 rgba(40,60,90,.06)(y 0→.3)·merged=하단+상단×.6·화면 알파 .28+sin(t_ms·π/2000)·.08 | 셰이더 1장(동일 식) |
| 4 | THREE 안개(#fogGL) | _fogGLInit 8976·_FOG_COLORS 8975·_fogGLRender 9049 | FBM 3층(상수 동일)·uCol=(0.10,0.18,0.08)·alpha=fog×0.41·rgb=uCol×fog×0.8·uTime+=0.016/프레임 | 프래그먼트 1:1 포트(hash/noise/fbm/smoothstep/중앙 50% 감쇠 동일) |
| 5 | 환경광 | 55377~55388·_ENV_LIGHT 11985 | rgba(100,160,255,.06) 전면 | ColorRect |
| 6 | 비네트 | 55389~55407 | radial(.35W→.7W)·0→투명·.7→vc.05·1→vc.15·vc=rgba(20,60,120,)·α.2(비보스아레나) | 셰이더 |
| 7 | 색보정 | 55414~55419 | OPT.grain=true → canvas CSS filter `contrast(1.05) brightness(0.97)`(OPT.brightness 100) | BackBufferCopy+스크린 셰이더 |
- GL 프록시 lighter no-op(6028) 규칙: 이 머신 웹 실측은 **Canvas2D 경로**(useGPU/useGL false).
  첫 전투에서 lighter 대상 레이어(LIT 색층·블룸)는 기여 광원 0 → 모드 간 화면차 없음(기록).
- 맵 타일·오브젝트·충돌 데이터 무변경(렌더 조명만 — 맵 SSOT 소관 유지).

## 결과 수치 (1920×1080, 시작 지점)
| 측정 | 웹 | Godot 전 | Godot 후 |
|---|---|---|---|
| 중앙 400×300 평균 밝기 | 42.6 | 48.0 | **37.9** |
| 좌상 300×200 | 25.4 | 42.7 | **30.2** |
| 우하 300×200 | 22.6 | 43.6 | **29.2** |
- 잔차(가장자리 +5 내외): 웹에만 있는 이리스 펫 광(중앙을 올림)·베이스 맵 페인팅 톤 차
  (맵 렌더 SSOT 소관 — P2-001g 총괄 결정 유지)·결계/적 발광체 미이식.
- 성능(콘솔 빌드 300프레임 평균): overlay OFF process 5.74ms/physics 1.20ms →
  ON 6.70/1.29ms (**+0.95/+0.10ms**, worst 7.4→9.0ms — 60fps 예산 내).

## 검증
test_p2003a_lighting 10/0(구조·순서·파라미터; 픽셀 증거는 비헤드리스 프로브 캡처 —
헤드리스 더미 렌더러는 텍스처 미제공) / 회귀 전부 기준선(p1002e/f/g·p2001a/b/c/e·
p2002a/b·contracts PASS·초기화 117/2·시작 145/2·재생 88/0·레슨 30/0).
화면: `_out/p2-003a/cmp_lighting_web_vs_godot.png` — 어둠 톤·외곽 침강·청록 비네트 동조.

## 남은 것
이리스 펫 광원(펫 시스템) / LIT 색층·블룸 실광원(보스 접근·화염장판 시) / ATMOS 입자·
갓레이(PP) / 보스아레나 비네트 분기 / 베이스 맵 페인팅 톤(맵 SSOT) / 하프해상도 라이트맵.


## SWEEP-A 현행 표시 보정 — 2026-10-22

|대상|현행 계약|정본 행|
|---|---|---|
|Mac 별도 THREE 안개|OS macOS에서 field/arena 모두 숨김. arena→field 전환도 다시 켜지 않음. Windows 기본 경로 유지.|G9072|
|정적12광원/이리스 색층|원본 offscreen lighter 이후 main X proxy의 lighter no-op에 맞춰 MIX(source-over). 색·반경·알파·half lightmap 수치 불변.|G4715-4726,G6028,G55201|
|플레이어 point.png|필드도 아레나와 같은 MIX. 640² stamp·좌표 불변.|G25500,G51943-51948|

SWEEP-A 11위치 engine viewport 재캡처 map-lighting/godot, ERROR0. 맵 geometry/전투/저장/새 문자열 변경0. 전체 동일성은 [SWEEP-A 차이 목록](SWEEP_A_20261022.md)을 따른다. 과거 검수·계수는 당시 이력이다.


> 2026-10-22 SWEEP-A 현행 표시 후속: [표시 계수·원본행·검수 경계](SWEEP_A_20261022.md#두-번째-표시-단위--자연-적펫hp바샘플러). 자연 적 스킨/크기·D 걷기·쉴드/etype 장식·WebGPU LINEAR·펫 CSS 소수 글꼴/하단220px·앵글러 MIX·보스 HP바 clipping을 교정한다. 과거 수치/당시 검수 이력은 보존하며 PC 판정·AI·보행·HP writer는 변경하지 않는다.
