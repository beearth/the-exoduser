# 적 oracle A안 기대값 층

세 exporter의 기본값은 A안이다. 원래 웹 기대값은 exporter 또는 oracle-sweep에 `--expectation-mode web`을 전달한다. 입력은 origin/main의 고정 game.html blob과 `--head <웹 커밋>`이다.

공통 정책은 이 폴더의 `a-plan.cjs` 하나에 있다. 기존 웹 mkEn에서 기본 투사체 주기, 대상 5종 최종 주기, 초기 대기 세 식만 VM 실행 전에 주입한다. 보스 50, M02 ×.85, 엘리트 ×.8/.7/.6과 단계별 정수화, 분열 자식 후처리와 난수 소비는 원문 흐름을 그대로 실행한다. oracle.json의 `expectation`에 정책·함수·원문 행·변경 전후 식을 남긴다. 앵커가 달라지거나 중복되면 추출을 중단한다.

AI는 생성 이후 실제 적 종류 0·4·6·19·29의 시나리오만 `classifiedRows`로 분리한다. 이 행들은 실행·대조하며 검사 수와 차이를 기록하되 PASS 집계에서 제외한다. 1-1 생성 원문에서 22→0으로 치환한 사례도 실제 종류 0이다. 다른 종류는 예외가 없으며 `caseResults`와 기존 FAIL_CASE로 추적한다. 이 분류와 별개로 `parry-g2-tests/run.cjs`가 PASS여야 한다. 이 도구에는 csproj가 없어서 현재 oracle-sweep의 --only에 적어도 자동 실행되지 않는다. 아래 명령을 별도로 실행한다.

`C:/nvm4w/nodejs/node.exe unity/Tools/parry-g2-tests/run.cjs --out <로그 폴더>`

세 oracle 스윕:

`C:/nvm4w/nodejs/node.exe unity/Tools/oracle-sweep/run.cjs --only enemy-ai-oracle,enemy-spawn-oracle,enemy-hurt-oracle --out <결과 폴더>`

격리된 스윕은 세 exporter에 공통 모듈의 절대 경로를 전달한다. exporter를 직접 실행할 때에는 기본 상대 경로를 쓴다. 기존 피격 검사 프로그램의 --a-plan 사후 덮개는 과거 fixture용이며, VM 주입 fixture에 중복 적용하면 오류를 낸다.

정책 검사: `C:/nvm4w/nodejs/node.exe --test unity/Tools/enemy-spawn-oracle/a-plan.test.cjs`. A_PLAN_WEB 환경변수로 고정 웹 snapshot을 지정할 수 있다.

민감도: 공통 모듈의 OTHER_POOL_INTERVAL만 480→240으로 임시 변경해 세 oracle이 모두 FAIL인지 확인하고 480으로 복원한다. 변조는 커밋하지 않는다. Core·Unity Editor·Player는 이 검증 범위에 없다.
