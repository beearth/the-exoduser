# 패링 A안 G2 검증·Mac 인계

- NuGet/SDK build 없이 Roslyn csc.dll과 .NET8 reference DLL로 Core를 직접 컴파일한다.
- Windows 셸은 C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command. Node 실행 파일은 C:/nvm4w/nodejs/node.exe.
- 규칙: node unity/Tools/parry-g2-tests/run.cjs --out I:/EXODUSER-Storage/codex-takeover/parry-g2/rules-current
- 기존 oracle: 같은 러너 --suite dash-parry-oracle 또는 parry-reflect-oracle. 원본 fixture는 유지하며 dash-parry doParry 연출 기대값만 G1(2/0/6)으로 덮는다.
- Unity DLL 참조: node unity/Tools/parry-g2-tests/compile-unity.cjs. 다른 작업본 Library는 읽기만 한다. Unity 프로세스는 시작하지 않는다.

21:40 감사: 분기점 b3cf7a682의 동일 oracle1회에서 기존2318건(보스대사1300·악의오브문구1018) 확인. f6ff63e33의 추가378건 중372는 G1 §6 공통탄 의도 차이,6은 비대상NoProj 주기 덮어쓰기 결함이라 수정했다. 현재 --suite enemy-hurt-oracle --a-plan은372개 기대값을 별도 적용하고 기존2318건만 남긴다. classify-oracle.cjs로 전체 실패 항목의 다중집합을 대조해 신규0 확인. 전체oracle PASS는 아니다. 규칙86/0·PC 참조컴파일5어셈블리 오류0. 분기점 실행은 compare-baseline.cjs(소스는 메모리에서만 읽음), 증거는 baseline-current와 oracle-audit.json.

Mac (경로는 자리표시자; PC에서 실행하지 않음):

    <PLAYER> --unity-m1-check --unity-mute -batchmode -screen-width 1600 -screen-height 900 -output <ISOLATED_M1_OUTPUT> -logFile <M1_LOG>
    <PLAYER> --unity-fullrun-qa --parry-g2-bot --unity-mute -batchmode -screen-width 1600 -screen-height 900 -output <ISOLATED_RUN_OUTPUT> -logFile <RUN_LOG>

두 번째 명령을 세이브가 격리된 출력3개로 3판 실행한다. 목표입력70%와 실제 성공률은 다르며 parry-bot.json·combat-stats.json으로 구분한다. 자동 성공/회복 주입 없음. 사람3판은 별도 검수 목록이다.

피드백 A/B는 위 실행에 --parry-feedback-push-in을 추가한다. standard(흔들림6/4) 대 pushIn(2/4·.08u 밀기)을 같은 카메라/1600×900/1x 겹침장면으로 비교한다. PBZ 본 스파크 모양은 VFX 레인, 현재는 최소 뼈색 자리표시다. Mac §8·실게임 PASS와 사용자 실행본 갱신은 미확인이다.
