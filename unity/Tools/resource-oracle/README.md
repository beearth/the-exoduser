# D-U3 최대 자원 원문 대조

웹 `applyStats`, `recalcSt`, 근성·장비 합산 원문을 Acorn으로 추출해 VM에서 실행한다. 웹 함수를 수식으로 다시 작성하지 않는다. 같은 입력을 Core `Simulation.ApplyEquipment`에 넣어 Config와 Player의 최대 HP/MP/ST/쉴드를 비교한다. Core와 다른 도구는 수정하지 않는다.

PowerShell 예시(저장된 원문과 그 Git SHA를 인자로 지정):

```powershell
& 'C:/nvm4w/nodejs/node.exe' 'unity/Tools/resource-oracle/run.cjs' --source 'I:/EXODUSER-Storage/debug/resource-oracle-20261104/game.html' --out 'I:/EXODUSER-Storage/debug/resource-oracle-20261104' --web-commit 06ac6882b550cb6373f2953ede3b2acc6f69e211 --core-commit bea021bcf1b2d20689e9f014834456879c5a722a --dependency-root G:/exoduser
```

- `--dependency-root`에는 기존 `acorn` 설치가 있는 저장소를 지정한다. 외부 패키지를 설치하지 않는다.
- .NET SDK 8.0.301, NuGet 외부 소스 없음. 원본 도구 파일을 `unity/Library/ResourceOracle`에 복사해서 컴파일하며 Core는 원래 작업본에서 읽는다. `DOTNET_CLI_HOME`도 그 폴더 안에 둔다. 모든 자식 프로세스의 stdin은 닫으며 무창 실행한다.
- `--reuse-build`는 Program/Core가 바뀌지 않고 웹 사례 범위만 확장했을 때에만 쓴다. 일반 재현은 이 옵션 없이 실행한다.
- 고정 시드 `873220`. 530건: 기준 32건, 단독 138건, 혼합 360건. 자원·회복·흡수·소모 관련 AFFIX_POOL id 115종을 각각 검사한다. 최대치 효과가 양쪽 모두 0인 항은 이 비교의 결함으로 보지 않는다.
- `export.test.cjs`는 무장비·근성·자원 어픽스·SP VIT 기준값, 유효 수치, 범위, 원문 추출을 검사한다. `reviveOnce`처럼 하위 티어가 null이면 첫 유효 티어를 골라 합성 사례로 검사한다. 실제 1-1 획득 가능 여부와 구분한다.
- 종료 코드: 0=동일, 2=게임 수치 불일치 발견, 1=하니스/입력 오류. 단독 원인 항별 개수는 단독 사례의 개수이며 혼합 사례의 원인 중복을 분해한 수가 아니다. 한 사례에서 여러 자원이 다르면 자원별 수는 중복 집계된다.
- 산출물: `oracle.json`, `result.json`, `terms.md`, 계약 검사·빌드·비교 핵심 로그. 원문 SHA와 추출 위치·원문 텍스트를 결과에 기록한다.
- 입력은 항을 분리하기 위한 합성 장비다. 강화·결정·소켓은 제외한다. 완전한 mkItem 생성 분포, 드랍 확률, 자연 플레이, UI, Player 실행본의 판정은 포함하지 않는다. Unity Core와 웹의 차이를 측정하며 수정 방향은 총괄이 결정한다.

기존 도구와 겹치는 범위:

| 도구 | 기존 범위 | 이번 추가 범위 |
|---|---|---|
| stat-parity | 실저장본 2건, CalculateStats HP/MP/ST. 쉴드는 출력만 함 | 쉴드를 판정에 포함, Config/Player 전달 및 자원 어픽스·SP/AP 분리 |
| inventory-oracle | 초기 장비/장착·해제, 레벨·스테이지·난이도, clamp | 현재 main 원문, 장비 근성·115종 관련 id·패시브 단독/혼합 |
| defense-oracle | 근성·방어·hurtP | 같은 근성의 최대 자원 기여 |

같은 검사가 2회 실패하면 멈추고 보고한다. 종료 코드 2는 이 측정 도구의 정상 불일치 결과이며 Core를 고쳐 통과시키지 않는다.

실행 파일 탐색과 EXO_DOTNET_ROLLFORWARD=1의 임시 SDK 정책은 [공용 도구 사용법](../_shared/README.md)을 따른다. 원본 global.json은 유지한다.
