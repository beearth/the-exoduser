# Unity 장판 지면 배치 회귀

`dotnet run --project unity/Tools/ground-skill/GroundSkillTests.csproj -c Release`

`NativeGroundSkillGeometry.Place`를 직접 검사한다. 16×16 칸(289정점/512삼각형) 장판의 모든 정점이 XZ에서 회전하고, 높이는 제공한 지면 질의+.025u다. 링72점은 각각 지면+.03u를 사용한다. 평면·경사·다리 모양의 시험 높이 함수·반경/회전·Core 좌표의 cm→m와 Y→−Z 변환 등659검사다. 시험 다리 함수는 실제 맵 상판 메시 검수가 아니다.

제품 연결: `NativeSkillView`의 ground zones는 3D에서 `NativeGroundSkillSurface` MeshRenderer로 동일 이미지/색/alpha/크기/회전을 소비하고 원 SpriteRenderer를 숨긴다. 따라서 공통 SpriteRenderer billboard/발끝 lift를 받지 않는다. 지면 함수는 기존 `NativeRemodel3D.GroundY`이며 실제 A2 질의는 등록된 상판/지면을 읽는다. 2D는 기존 SpriteRenderer와 로컬 XY 링을 사용한다. 생명 종료/Reset에서 새 메시를 해제한다. 피해·반경·지속·전투/세이브·지도 geometry/충돌 변경0.

단독 좌표 검사와 API 컴파일은 실제 Unity 빌드/M1/화면 검수가 아니다. 정식 NTFS/FIFO/무음·세이브 격리 검수에서 경사·목교·2D↔3D 전환·수명 반복·실제 색/합성·지형 가림·성능을 확인해야 한다.
