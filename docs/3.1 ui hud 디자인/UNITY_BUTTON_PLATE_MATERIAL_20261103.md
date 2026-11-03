# Unity 버튼 판 질감 — 21:25 실버 헬 RETOUCH (2026-11-03)

브랜치 codex/unity-ui-plate-20261103, 기준 origin/unity/main aa38bb877327. 정본은 unity/main. 최상위 톤은 DESIGN_CONCEPT_SILVER_HELL_20261028.md다.

## 인수 판정과 목표
4차 Mac(qa/mac-captures-20261103 @adc7233e6, qa/unity-death-ui/7e740aa)은 버튼12/12 RGB13/13/13 불투명·원화 비침0·1px, 스킨 원인 확정(control110/138 vs skinless13/13), 감광/부활5프레임/전투 문구 숨김 PASS였다. 기능을 다시 만들지 않고 밋밋한 판 질감만 RETOUCH한다. BG3 메뉴·웹 정본과 같은 크기로 비교해 고급 메뉴의 조용한 명암/음각이 읽히는지 Mac이 판정한다.

## 현재 표면 계약

| 층 | 값/구현 |
|---|---|
| 불투명 기반 | 기존 SolidRect/whiteTexture, alpha1 강제, alphaBlend=false, 부모 틴트 상속 없음·복원. 기본 --iron #0f0f10 |
| 세로 명암 | IronFaceAt(height): 위 RGB(18,18,19)→아래(12,12,13), 가운데(15,15,16). 물리1px 행마다 불투명 채움. 생성 텍스처/필터/노이즈/그레인/디더 없음. 선택 때도 같은 어두운 명암 |
| 바깥 은빛 선 | 기본 --sv-md(138,139,136), 주요/선택 --sv-lt(201,199,195), 물리1px. 위치 스냅/두께1/GUI.matrix.m00 유지 |
| 가장자리 경사 | 은빛 테 안쪽1px: 위 --sv-dp(44,46,49) α.45, 아래 검정 α.75. w/h>10physicalpx에서 적용 |
| 음각 홈 | 3physicalpx 안쪽의 검정 α.8 선1px. 아래 립에 --sv-lt α.06의1px 반사. 위 경사/검은 홈/아래 반사로 깊이를 구분 |
| 선택 내부 빛 | --eye-dp(126,13,7) 안쪽8physicalpx. inset=(4+i)px, i=0..7, α=selection×(pressed?.08:.12)×((8-i)/8)^2. 바깥 번짐·붉은 단색 면·상시 주 버튼 불씨 없음 |
| 글자/입력 | 기존 Hahmlet/지역 명조/Cinzel, PlateText --tx #e6e3dc, 선택 --sv-hi #f6f5f2. inputLive·공통 스킨8상태 배경 제거·기존 Rect/콜백 유지 |
| 그리기 | 질감 행/선은 Repaint에서만 그림. Core/세이브/카메라 변경 없음 |

색 전달은 Mac 검증된 기존 단색 경로 그대로다(Linear Player는 토큰의 linear 값, Gamma는 토큰 그대로). UI 생성 그림/새 재질/유료 생성0. 20:20의 transparent blackTexture/RGBAHalf 후보를 다시 사용하지 않는다.

## 불투명/표면 측정
--unity-death-ui-smoke --unity-death-ui-skin-probe -ui-screen lobby는 유지한다. 기본 스킨 control과 새 판을 같은 사각형에서 촬영한다. ui_skinless에서는 판 뒤 자홍 underlay를 완전히 가려야 한다.
1920 기준(1500,735)/(1500,775)를 해상도별 변환해 RGB를 기록한다. 새 명암의 해당 높이를 IronFaceAt으로 계산한 expectedRgb에서 각 채널±3 이내면 customPlateDark=true다. 단색15/15/16 고정 기대값은 폐기한다. 측정점은 테두리/음각/선택 빛 밖이다.

## 색 프로브 폐기 (21:25)
실험 --unity-death-color-probe는 제거했다. UI smoke는 이를 처리하지 않았고 사망 smoke는 shader/camera unavailable이었다. 4차 Mac은 오른쪽 띠를 V≈.002 근흑색 HSV 착시로 판정했으며 V<.02는 채도 비교에서 제외한다. 필요 없는 Shader 의존성·임시 패치·콜백·영수증 필드·NativeGame.DeathColorProbe.cs(+meta)를 삭제했다. 해당 인자를 더 이상 전달하지 않는다. 기본 스킨/불투명 probe와 기존 사망/fade 인자는 유지한다.

## 검수/도구
- Mac: 일시정지·설정4탭·종료확인·로비 메뉴를1920×1080·3840×1080, 1x·3x로 BG3/웹 정본과 나란히 비교. 낮은 대비 세로 명암/음각/경사, 불투명, 은빛1px, 내부 진홍, 점0·스킨 바탕0을 확인한다.
- CPU 회귀: 실제 SolidRect의 alpha1/비블렌딩/부모 복원, 실제 IronFaceAt의 중성색·낮은 대비·단조 명암·알파1, 스킨 제거, 폐기 코드/Shader 의존성 제거를 검사한다. GPU/디자인 PASS가 아니다.
- run.cjs --output <상대/절대 경로> [--unity-data <Editor/Data 또는 Unity.app/Contents>]. Mac Contents/Resources/Scripting 자동 탐색 및 명시 --dotnet/--csc/--refs 유지.
- PC는 DLL 참조 컴파일까지만. 새 질감의 실제 Mac 화면은 미검증, VISUAL VERDICT: RETOUCH 유지.
