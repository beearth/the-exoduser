# A2 지면 표준 데칼 수신 — 2026-11-01

상태: 소스 후보·실제 Unity/Shader/Player 미검증, 통합 READY0. 맵 전체 VISUAL VERDICT: RETOUCH를 유지한다. R8 재질·배치 변경과 별개의 두 셰이더 기술 계약이다.

## 원인과 적용

Impact 담당의 실제 MCP e73821a4 진단은 동일 회복 영역·같은 프레임의 off/mesh .016/.08/decal .016/.04/.06/.08을 비교했다. 목교는 투사되지만 흙은 수신하지 않았다. 승인 공통 b673cb3f7a534c367e03c285404342e3769a8bfc 및 R8 b3aca668f005c28d59160b6b31497a8b34425e9b의 두 커스텀 셰이더에는 DBuffer 변종·include·수신 호출이 모두 없다. 설치 URP ffe395a3a1d1의 Lit.shader, LitForwardPass.hlsl, DBuffer.hlsl 원문과 대조했다. 이 기존 실제 RED를 보존하며 새 GPU 실행은 하지 않았다.

| 위치 | 현행 계약 |
|---|---|
| 대상 | Resources/Shaders/HellGroundPBR.shader, A2RootSurface.shader의 Opaque UniversalForward pass |
| 변종 | multi_compile_fragment _ _DBUFFER_MRT1 _DBUFFER_MRT2 _DBUFFER_MRT3. MRT1은 색, MRT2는 색·world normal, MRT3는 금속·AO·smoothness까지 설치 URP 표준 합성 사용 |
| include | Lighting.hlsl 다음 설치 URP ShaderLibrary/DBuffer.hlsl. 자체 수식·중복 DBuffer 구현을 만들지 않음 |
| 적용 순서 | 모든 지면/낙엽/젖음/스캔 표면 계산 완료 → defined(_DBUFFER)에서 ApplyDecalToSurfaceData(i.positionCS,surface,input) → SampleSH(input.normalWS) 재계산 → 기존 UniversalFragmentPBR → 기존 fog. 스캔 색·법선이 투사 결과를 나중에 덮지 않음 |
| 변종 없음 | 새 런타임 호출은 _DBUFFER guard 안에만 존재. receiver 추가 부분을 제외하면 기존 소스 byte와 동일. 실제 무데칼 픽셀 동일성은 GPU 검사 전 |
| 보존 | 지형·충돌·보행·Core·VFX/XY mesh·재질 GUID/속성·R8 RGB 가중식·기존 shadow/depth pass 변경0. Renderer feature와 Impact 후보를 자동 복사하거나 설정 변경하지 않음 |
| 분리 인수 | R8 부모 위의 기술 커밋 전체 브랜치를 병합하지 않는다. 승인 공통 b673 원문에 같은 수신 추가만 적용한 별도 patch/원본·후보 SHA manifest를 I:에 보존. 공통 준비 트리에는 두 셰이더와 이 문서만 포함하며, 미인수 R6/R7/R8 재질·배치·도구 경로를 섞지 않음 |

## 실제 검증과 인수 조건

사용자 도타 보호가 우선이다. 어느 PID든 dota2가 살아 있으면 Unity/Player/빌드/인코딩/무거운 CPU·GPU 검사/브라우저 GPU를 새로 시작하지 않는다. 기존 담당·작업본·공식 FIFO를 유지하며 새 대기자·재예약을 만들지 않는다. 재개는 실제 도타 부재·기존 공식 순번/잠금·메모리·무음·격리 세이브 조건 확인 후에만 한다.

| 확인 | 필요한 근거 / 현재 경계 |
|---|---|
| 소스 | 두 커스텀 셰이더의 수신 누락 및 설치 URP 호출 계약 확인. diff 형식/기술 patch 순수성 검사는 GPU 증거가 아님 |
| Editor | 실제 자기 A2의 두 shader import/변종 오류0. 승인 Renderer의 DBuffer feature 활성·대상 renderer/material·camera/렌더비율 기록. feature 없는 실행은 수신 실패 원인과 분리 |
| 동일 프레임 | 현재 지면·뿌리 흙·목교에서 동일 projector/material·위치·조명·고정 simulation을 사용해 off/on 촬영. 흙·뿌리의 예상 내부 ROI 변화와 투영 경계 바깥 영향 확인, 목교를 양성 대조군으로 사용. 정상/경계/높이 단절을 확인하며 수면 애니메이션 차이를 수신 증거로 세지 않음 |
| 1x 판정 | 1920×1080/3840×1080에서 접지·깊이 단절·두께/테두리·전투 가독성 직접 확인. Impact r5 재질 선택은 Impact 소유이며 이 기술 패치만으로 최종 VFX/맵 아트 PASS를 선언하지 않음 |
| Player | 정확 채택 source → remodel-scenes1 빌드 → 같은 EXE M1 및 실제 투사/전후 화면 → 창·잔여·세이브·종료 안전 영수증. R8 CPU50/Runtime196 및 과거 R6 M1은 이 셰이더 변경의 증거가 아님 |
| 공통/Desktop | 검증 완료 후 기존 통합 담당이 순수 수신 변경만 정상 인수. unity/main/바탕화면 실제 반영 전에는 READY·완료로 승격하지 않음 |

내부 근거: I:/EXODUSER-Storage/demo-art/impact/MCP-r5-회복-同프레임-결과.json 및 mcp-r3-captures/MCP-r5-bridge-heal-*.png. 원문·기술 patch·검수 결과: I:/EXODUSER-Storage/steam-keyshot/a2/field-screen-20261031/decal-receiver/. API 연결 안내는 원격 main의 docs/API연결_가이드.md 관련 구역을 적용했다. 유료 생성/결제0.
