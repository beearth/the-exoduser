# 설치형 지면 좌표 회귀

실제 Runtime/NativeGroundSkillGeometry.cs를 함께 컴파일한다. 평지·경사·회전·목교 표면·72점 링을 검사하며 Unity/GPU 판정을 대신하지 않는다.

`dotnet build GroundSkillTests.csproj --output <고유 I: 출력>` 후 생성 DLL을 실행한다. Runtime helper가 없던 현행 1403에서는 실행 assertion `MISSING terrain-conforming ground skill placement`가 실패하며, 실제 실패 로그를 별도 보존한다.
