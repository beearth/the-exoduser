# 설치형 지면 좌표 회귀

실제 Runtime/NativeGroundSkillGeometry.cs를 함께 컴파일한다. 평지·경사·회전·목교 표면·72점 링을 검사하며 Unity/GPU 판정을 대신하지 않는다.

`dotnet build GroundSkillTests.csproj --output <고유 I: 출력>` 후 생성 DLL을 실행한다. Runtime helper가 없던 현행 1403에서는 실행 assertion `MISSING terrain-conforming ground skill placement`가 실패하며, 실제 실패 로그를 별도 보존한다.

2026-11-02 후속: 실제 큰 반경의 고정16격자 면 내부 오차를 보완한다. 기존659 + 독립 barycentric 내부/면적76 =735 PASS. 실제 Player·성능·시각은 별도 gate다. 합성 최대 생성351ms를 제품 프레임 성능으로 대체하지 않는다.

후속 회전 분리: TextureMap/pivot/flip/외접 footprint2401 추가, 총3136 PASS. GPU clip/재질 default0 경로 및 실제 geometry cache/프레임은 실제 Player에서 별도 검사한다.
