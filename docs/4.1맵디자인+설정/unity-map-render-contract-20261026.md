# Unity 맵 렌더·좌표 계약 (2026-10-26, 코드 정적 조사)
- 대상: `E:/exoduser-runtime/codex-ui-resume-20261026/unity`; 실행·컴파일·시각 검수 없음.
- 확인: `Assets/Scenes/FirstPlayable.unity:130-170`은 `NativeGame` 컴포넌트가 붙은 단일 루트. 카메라는 `NativeGame.cs:42-45`가 `Camera.main`을 쓰거나 생성하며 `orthographic=true`, `orthographicSize=5.4`, 초기 위치 `(40.2,-74.2,-10)`으로 설정한다.
- 확인: 맵 청크·소품은 `NativeGame.cs:172-189,227-234`에서 `Texture2D`를 `Sprite.Create(..., pixelsPerUnit=100)` 후 `SpriteRenderer`로 그린다. 플레이어·적도 `:203-219`의 `SpriteRenderer`; HUD·데미지 문구는 `:253-277`의 IMGUI다. 조사한 전투 맵 경로에서 MeshRenderer 생성은 확인되지 않았다.
- 확인: `NativeGame.cs:241`의 논리 `(x,y)`→Unity `(x/100,-y/100,0)`이며 `:197` 카메라가 플레이어를 따라간다. 그러므로 화면의 지면은 XY 평면, Unity Z=0이다. 이 값은 현재 픽셀형 논리 좌표와 Unity 단위의 변환이며 실세계 미터 정의가 아니다.
- 확인: `Resources/Data/ch1_map.json:1`의 `width=200,height=200,tileSize=40,startX=4020,startY=7420`; `SourceMap.cs:46-50`은 40 논리단위 타일로 충돌을 조회한다. 현재 변환상 1타일=0.4 Unity 단위, CH1 맵 폭=80 Unity 단위이다.
- 확인: `NativeGame.cs:203-205` 플레이어 원본 프레임 48×48 또는 공격 80×80, `Sprite.Create` PPU 100, Transform scale 2. 표시 높이는 프레임별 0.96/1.6 Unity 단위이며 발 기준·실제 인물 키를 뜻하지 않는다.
- 판단: 위 E: 격리 실행본의 2D 전투 장면에는 GLB 3D 직접 배치 계약이 확인되지 않았다. 최소 적응층은 GLB→Unity 모델 임포트/프리팹, 논리 XY→Unity XY 또는 3D XZ 좌표 매핑과 축·피벗·크기 보정, 정사영 카메라에서의 3D 가시성/깊이·가림·2D sorting 연동, 3D collider와 기존 `SourceMap` 충돌 계약의 분리/연결, 조명·머티리얼·성능 검증이다. 2D 구움 청크로 납품하면 현행 SpriteRenderer 경로와 연결 가능하다.
- 미확정: Unity 1단위=1m, 인물 실제 키, Meshy GLB의 최종 축/스케일, PC 3D 후보의 최종 통합 여부. 이 항목은 디자인 확정과 실기 검수가 필요하다.
- 가이드 [제작 가이드](EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) 전체 확인; 시각 판정은 실행하지 않아 VISUAL VERDICT: 미검증으로 둔다.

## 별도 PC 3D 후보와 최신 협업 요청
- `origin/main` SHA `82e7a0b75881228faa658d614b9b6acdee8c062e`의 `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md:5-20`은 밤 10시 고품질 3D 맵 기획 협업과 PC `claude/unity-pc-map3d-20261026` 커밋 `23451c97a`의 START 슬라이스 v2를 명시한다. 현재 PC 후보는 톤 최종 승인 전이며 원본 손그림 청크 바닥 복귀와 Meshy 임포트 준비가 후속이다.
- PC 후보 `unity/Assets/Exoduser/Runtime/NativePerspectiveWorld.cs:16-19,43-47,155-160,220-223`은 원근 카메라(pitch .85, distance 1400, FOV 화면 높이 기반), 지면 XZ, 논리 픽셀 `(x,y)`→Unity `(x,height,-y)`, `MeshFilter`+`MeshRenderer` 지면을 구현한다. `docs/engine/UNITY_MAP3D_S1_20261026.md`의 기본 2D/옵트인 3D 연결 패치와 `UNITY_MAP3D_SLICE_20261026.md`의 START 기하·재질·조명 슬라이스를 E: 격리 실행본과 혼동하지 않는다.
- 따라서 이 문서의 위쪽 SpriteRenderer·정사영·100px/Unity 단위 결론은 오직 E: 격리 실행본에 한정된다. PC 3D 후보에는 픽셀 수치 기반 XZ 매핑이 있으며 Meshy GLB 임포트·프로덕션 통합·시각 최종 승인 여부는 별도 확인 대상이다.
