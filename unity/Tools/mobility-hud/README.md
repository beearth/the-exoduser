# Unity 공용 기동게이지 결함 회귀

`dotnet run --project unity/Tools/mobility-hud/MobilityHudTests.csproj -c Release`

선택 인수: `-- <검수 대상 Exoduser.Core.dll 절대경로> <래스터 출력 디렉터리>`.
원본 DLL의 `Simulation.HurtPlayer`에 Q/E 패링 가능한 공격을 전달해 보상 +20을 검사한다. 현재 소스는 Q/E/평화보호·최대치 cap·빨콩/무지개 보상을 검사하며, 실제 링의 RGBA는 빈 트랙·45자원 칸·시계 방향 반채움·최대치 변경·잘못된 입력·불필요한 업로드 방지를 검사한다. DLL 인수 없이는22검사, 있으면26검사다.

단독 Core/래스터 검수이며 Unity Editor/Player/물리 키 입력 검수가 아니다. 배포 DLL을 수정하거나 원본 세이브에 접근하지 않는다. 현재 실행기의 status 오류 해소 후 실제 소모→Q/E 성공→링 증가와16:9/21:9/32:9 화면을 검수해야 한다. 계약: `docs/3.1 ui hud 디자인/exoduser-hud-redesign.md`의 Unity 이동 자원 표시 수정 후보.
