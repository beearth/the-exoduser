# Unity 몬스터 방향 이미지 진동 회귀

`dotnet run --project unity/Tools/enemy-visual-facing/EnemyVisualFacingTests.csproj -c Release`

Stage1 R5의 이동 시 `EnemyState.Facing` / 정지 시 플레이어 주시 분기를 재현하면 east↔west가 교대로 선택된다. AI가 갱신하는 `Web.facing`을 `SyncFromWeb`이 `EnemyState.Facing`으로 복사하지 않는 기존 상태에서 이동 여부로 두 표현 원본을 교체하기 때문이다. Core는 수정하지 않는다.

`NativeEnemyVisualFacing.Direction`은 웹 drawEn의 살아 있는 플레이어 800px 이내 주시 계약을 이동 여부와 무관하게 적용한다. 범위 밖/사망 시 live `Web.facing`을 읽고, Web이 없으면 현재 `EnemyState.Facing`으로 폴백한다. 좌표가 같은 경우(거리 제곱≤0.000001px²)는 기존 방향을 사용한다. 8방향 순서·실제 방향 반전·공격 중 Core 방향 불변·수직 이동의 미소 좌우 오차·정지/이동 교대 등220검사다. 지연 타이머·AI 방향 변경·픽셀 스냅/카메라/배율 수정은 없다.

단독 C# 검사다. Unity 실제 이동·공격 영상/1x PASS, 픽셀 샘플링 떨림 해결, 사용자 설치본 반영을 주장하지 않는다.
