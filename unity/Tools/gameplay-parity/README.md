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

추가 실행 경계는 물리탄 패링 쿨30틱 회복과 회복영역 종료틱 보너스까지13검사다. --qe-boundary는 원본600틱 초기 무적을0으로 통제한다. 정식 Player 촬영은 사용자 세이브와 별도이며 동작 검수 표시 플래그·파동 좌표도 남긴다.

원문 e.boss/ib 구분 검사까지 현재 실제 실행 경계는14개다. 보통 ib 보스에 e.boss의 포이즈30 분기를 임의 적용하지 않는다.

export-hud-bindings.cjs는 현재 웹 CSS의13개 위치와 _slotSkId를 그대로 실행한다. --hud-bindings <oracle.json> <결과.json>은 아이콘·실제키·클릭 의미창·E쿨다운18검사를 수행한다.

| 추가 검사 | 실제 원본·입력 |
|---|---|
| --qe-upgrade 원본JSON 출력JSON | export-qe-upgrade.cjs의 원본 _skCtx/_skLearnUp 실행1,470사례, 합체 강화 가능·구성원·SP |
| --ki-growth 원본JSON 출력JSON | export-ki-upgrade.cjs의 원본210사례, 강화·실제 실행레벨·저장 Codec 왕복1,470검사 |
| --combo-trace 웹JSON 장비JSON 출력JSON | capture-web-combo.cjs의 실제 웹 update1,040틱, 3타 홀드119/159/210틱·110틱째 Q취소. 자세/타이머/자원/충전/콤보/검기피해·수명·반경 정확, 위치 .05px/자원 .005 허용 |

capture-web-combo.cjs는 현재 브리프의 고정 원본 로컬서버3344와 I:기준 원문 묶음, readonly 실제 미디어를 사용한다. node로 서버를 별도 격리 저장 디렉터리에서 실행하고 HTTP game.html SHA를 확인한 뒤 exo-unity.ps1 browser로만 실행한다. headless·mute·SwiftShader, 실제 게임 loop를 멈춘 통제 update이며 자연 전투/OS 손조작이 아니다. -combo-parity 1 Player는 기존 FixedUpdate에 같은 Input System 장치를 주고260틱×4 입력과 각3틱마다348장을 남긴다.
