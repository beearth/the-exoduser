# 게임 동작 웹 대조 검사

기존 실제 웹 입력 하니스의 프레임 로그와 현재 Core를 비교한다. 게임 규칙을 JavaScript로 실행하는 런타임을 추가하지 않는다. 실제 Unity Player·HUD·영상 검수는 별도다.

| 검사 | 입력·판정 |
|---|---|
| 기본 프레임 대조 | 장비 JSON, 웹 web-probe.json, 출력 JSON 순서. 이동·대각·우클릭·좌클릭·Q·E 각 90틱. 상태·상태 타이머·투사체 수 정확 일치, 위치 .03px·자원 .005 이내 |
| --movement-oracle | 장비 JSON, export-movement.cjs의 원문 실행 결과, 출력 JSON. 9자세 × 부츠 3조건 × 감속 2조건, 위치 .00001px 이내 |
| --save-boundary | 출력 JSON. 스킬 없는 최초 저장, 미소유 0레벨 스킬·슬롯·원문 데이터 보존 |

.NET 8로 GameplayParity.csproj를 컴파일한다. BaseIntermediateOutputPath·OutputPath·검사 출력은 I:/EXODUSER-Storage/ 하위 고유 경로를 지정한다. DOTNET_CLI_HOME은 기존 NTFS 폴더를 재사용하고 DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false를 자식 환경에만 적용한다. 사용자의 전역 환경을 수정하지 않는다.

원문 이동 식 추출:

```text
C:/nvm4w/nodejs/node.exe unity/Tools/gameplay-parity/export-movement.cjs --source <고정한 origin/main의 game.html> --out <I: 출력 JSON>
```

실제 입력·현재 결과·전체 48개 스킬의 미완료 경계는 docs/engine/UNITY_GAMEPLAY_PARITY_20261031.md와 I:/EXODUSER-Storage/demo-art/gameplay-parity/를 따른다. 숫자 대조 통과를 전체 이식·실게임·시각 합격으로 올리지 않는다.

## Q/E 무료 기본 합체 대조

export-qe.cjs는 현재 웹 _autoShieldThrow와 파동 판정 식을 직접 실행한다. --qe-oracle <oracle.json> <결과.json>은192조합·6336검사를 대조하고, --qe-boundary <결과.json>은 실제 E 제어·파동·반사 예외11개를 검사한다. 각도 입력은 양쪽 float로 같게 주고 원본 경계의 엄격한 부등호를 유지한다. 상세수치·실제 Player 게이트는 docs/engine/UNITY_QE_BASE_FUSION_20261031.md다.
