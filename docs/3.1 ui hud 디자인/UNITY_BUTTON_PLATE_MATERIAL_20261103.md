# Unity 버튼 단색 흑철 판 — 20:20 Mac 3차 FAIL 후 방법 전환 (2026-11-03)

정본은 unity/main. 브랜치 codex/unity-death-screen-20261103. 최상위 톤은 [실버 헬](DESIGN_CONCEPT_SILVER_HELL_20261028.md)이며, 아래 판·문자·선 토큰은 이 문서를 따른다. 구형 브리프의 금빛/황동 선은 은빛 토큰으로 대체한다.

## 확인된 투명 원인과 폐기 경로

지난 후보3941b3ff8은 Texture2D.blackTexture를 불투명 검정으로 가정했다. Unity 공식 명세상 이 텍스처는 RGBA(0,0,0,0), 즉 알파0이다. alphaBlend=true로 그렸으므로 바탕을 가리지 못했다. 기본 IMGUI 스킨은 별도 회색 원인이었고, 스킨 제거만으로 불투명 판이 생기지 않았다.

근거: [Unity6000.6 Texture2D.blackTexture](https://docs.unity.com/en-us/engine/6000.6/script-reference/unityengine/texture2d/blacktexture). 20:20 Mac probe2/2 custom-only plate still gray와 원화 비침 증상이 이 경로에 해당한다. PC GPU 재현은 하지 않았다.

생성 그라데이션/edge/haze 텍스처, blackTexture 바탕, RGBAHalf 보정 후보, 기본 스킨 plate를 ActionPlate에서 모두 제거했다. 별도 Panel/원화 프레임의 경로는 이 변경으로 바꾸지 않는다.

## 현재 단색 계약

| 항목 | 값/구현 |
|---|---|
| 바탕 | 실버 헬 --iron #0f0f10=(15,15,16). SolidRect가 흰 기본 텍스처 whiteTexture에 지정색을 칠함. 알파를1로 강제하고 alphaBlend=false로 교체. 부모 RGB/alpha·GUI.backgroundColor를 상속하지 않으며 그린 뒤 복원 |
| 엔진 색 전달 | 같은 날 Mac에서 RGB13으로 검증된 Panel(iron:false)의 단색 채움과 같은 전달 규칙: Linear Player는 토큰의 linear 값, Gamma는 토큰 그대로. 새로운 색 보정 수식/조절값은 없음 |
| 선 | 기본 --sv-md #8a8b88=(138,139,136), 주요/선택 --sv-lt #c9c7c3=(201,199,195). 네 변1px, 디자인 두께1/GUI.matrix.m00, 위치 픽셀 스냅. 금·황동 없음 |
| 선택 | 선택/호버일 때만 --eye-dp #7e0d07=(126,13,7)의 안쪽3개 선. 불투명 판 위에 α=selection×(pressed?.14:.2)×(4-i)/3, i=1..3. 바깥 번짐·중앙 붉은 판·상시 주 버튼 불씨 없음 |
| 글자 | PlateText --tx #e6e3dc, PlateTextHot --sv-hi #f6f5f2, 삭제 위험 --eye #c21a10. Hahmlet/지역 명조/Cinzel은 기존 유지 |
| 일시정지 통합 | 새 inputLive 게이트·SpacedLabel/Hahmlet 자간·공통 제목/안내 유지. PrimaryGlow 생성 텍스처와 바깥 그림자는 제거. 공통 ActionPlate로 단색 판을 그림 |
| 모든 화면 | 로비 슬롯/입장·일시정지·종료·설정·삭제확인 등 기존 ActionPlate 호출부 공통 적용. NativeUiAudit의8상태 스킨 배경 제거도 유지(Editor HiDPI 포함) |

불투명 요구가 부모 페이드/비활성 틴트보다 우선한다. 외부 판 배경과 문자/상호작용을 분리한다. Core·세이브·입력 판정은 변경하지 않는다.

## 동일 좌표/불투명 진단

--unity-death-ui-smoke --unity-death-ui-skin-probe -ui-screen lobby -output <절대 출력> --unity-qa-sandbox <절대 QA 저장격리>.

- 기본 스킨 control과 새 판을 같은 ActionPlate 사각형에서 촬영한다.
- ui_skinless 촬영 때 판 뒤에 밝은 자홍색 단색을 먼저 그린다(진단 플래그에서만). 새 불투명 판이 이를 완전히 가려야 한다. 일반 캡처에서는 이 underlay를 쓰지 않는다.
- 1920 기준(1500,735)/(1500,775)를 RightMatrix로 각 해상도에 변환한다. 두 RGB가 각각(15,15,16)에서 채널별±3 이내여야 customPlateDark=true다. 이전 채널40 이하 조건은 폐기했다.
- skinProbes에 실제 좌표/RGB/플랫폼/GPU/stock 상태 이름·제거 수와 opacityUnderlayUsed를 기록한다. stock control은 진단 전용으로 원래 스킨을 직접 그리는 유일한 예외다.
- 실제 GPU 원인 증명/최종 흑철 범위 판정은 Mac이 한다. CPU 테스트를 실제 RGB 측정으로 보고하지 않는다.

## 검사 도구와 Mac 경로

unity/Tools/death-ui-tests/run.cjs --output <상대/절대 경로> [--unity-data <Editor/Data 또는 Unity.app/Contents>].

- Mac Contents/Resources/Scripting/{DotNetSdk,NetCoreRuntime}도 탐색한다. Unity Hub의 Contents를 넘기거나 Scripting 경로를 직접 넘겨도 된다.
- SDK/ref/runtime 버전은 자동 판독. 별도로 --dotnet <exe> --csc <dll> --refs <ref 폴더> 가능.
- 회귀는 실제 SolidRect와 스킨 제거 함수를 Player/Editor로 추출 컴파일한다. 알파1·비블렌딩·흰 기본 텍스처·부모 틴트 복원·토큰(15,15,16) 전달 및8상태 제거를 검사한다.
- Mac Resources/Scripting 파일 배치는 모의 파일시스템 검사로 확인했다. 실제 Mac .NET 실행은 재검수 대기다.
- PC DLL 참조 컴파일/CPU PASS는 GPU/디자인 PASS가 아니다. Mac1920×1080·3840×1080 UI6면/설정4탭, 1x·3x를 실버 헬 기준과 비교한다.

## 유지 사항
삭제 확인은 인메모리 캐릭터만 사용하고 smoke에서 ConfirmCharacterDelete를 차단한다. settings/roster/combat=disabled. 인트로 홀드 게이지·Core 사망/부활·전투 문구 억제·부활5프레임·금선 대신 물리1px 은빛 선 검증은 기존 흐름을 유지한다. 새 후보 VISUAL VERDICT는 RETOUCH/미검증이다.
