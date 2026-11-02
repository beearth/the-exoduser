# 1-1 실제 입력 완주 QA — 2026-11-02

사용자 브리프: `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun-brief.md`.
작업본 `G:/exoduser-wt/codex-unity-uisound`, 브랜치 `codex/unity-11-fullrun-20261102`.

## 실제 완주와 M1의 구분

기존 `--unity-m1-check`는 기능 검사다. 적 수동 생성/체력 설정, HarnessKill,
플레이어 좌표 변경, 임의 큰 피해를 사용한다. 23/23 통과도 자연 동선 완주 근거가 아니다.

새 `--unity-fullrun-qa`는 별도 선택 실행이다. 실제 Player에서 가상 InputSystem
키보드·마우스를 주입하고 기존 `NativeGame.FixedUpdate`로 진행한다. Core·플레이어
HP/자원·적 HP·처치 수·스폰·게이트 조건·좌표를 바꾸지 않는다. 이야기와 첫 연습은
제품이 제공하는 스킵을 사용한다. 이동은 실제 충돌 콜백을 따라 탐색하고 모든 소환굴,
살아 있는 적·앵글러, 열린 지옥문, 보스와 출구를 순서에 맞춰 처리한다.

실행 예시(공용 큐, 무음·숨김·세이브 격리):

```powershell
& ./unity/Tools/devtools/exo-unity.ps1 player -Worktree 'G:/exoduser-wt/codex-unity-uisound' -Owner unity-11-fullrun-20261102 -Exe '<정식 빌드>/EXODUSER-Unity.exe' -Args '--unity-fullrun-qa,--remodel3d,-force-d3d11,-output,<출력>' -TimeoutSec 1800
```

기본 1920×1080. `-qa-width 3840`으로 슈퍼와이드 검수한다. 10초마다 caps PNG와
telemetry.jsonl을 남기며 로비·연습·전투·드랍·레벨업·습득·보스 입장·사망·클리어를
별도 캡처한다. fullrun.json의 result=stage-cleared, 실제 캡처와 경과를 확인해야 완주다.
보스 상태가 바뀌어 처음 관측된 패턴은 별도 PNG로 남긴다. 프레임 표본의 평균 FPS,
p95/p99/최장 프레임 시간을 기록한다. PNG 저장 비용과 Dota 등 동시 앱의 영향을
포함한 QA 실행 수치이며, 일반 플레이 성능으로 그대로 확대하지 않는다.
시간 제한·죽음·이동 정체는 그대로 실패로 기록한다. 자동 입력의 한계를 게임 결함으로
단정하지 않으며 M1·일반 손조작·실제 청취와 구분한다.
실행 중인 패키지의 `Application.buildGUID`를 영수증에 남긴다. 3차 공통 반영
`9694e3451` 인수 후에는 그 소스로 새 정식 빌드해야 하며, 병합 전 C# 검사 결과를
병합 후 빌드/실행 증거로 재사용하지 않는다. 공통 Core 인수와 이 작업의 Core 수정은
구분하며 origin/unity/main 대비 이 작업의 Core 차이는 0이다.

## 공용 실행기 오탐 수정

브라우저가 실제 9처치·pageerror 0·정상 종료 0을 남겼지만 실행기가
`tree::pid...:title=[]`를 창으로 세어 실패시켰다. 자식이 관측 사이 종료하면
MainWindowHandle이 null이고 PowerShell의 `null -ne IntPtr.Zero`는 true다.
종료된 프로세스와 null 핸들을 제외하되 살아 있는 nonzero 핸들은 계속 차단한다.
`selftest/exited-window-test.ps1` 수정 전 재현 실패 → 수정 후 4/4,
공용 browser pw-smoke 실실행 windows=0 / leftovers=0 / exit=0 확인.
웹 3333 신규 필드에서 9처치·pageerror 0을 확인했다. 보스 비교는 `bosstest=0`
직접 진입(웹 자체 GOD/9999 자원 포함)임을 영수증에 구분한다. 잘못 열린 설정 창을
보스 패턴 증거로 채택하지 않고, 초기 로딩 중 불필요한 ESC 주입을 제거한 후보에서
설정 창 없이 idle/recover/bossShock/bossSlamWind/bossGrabWind를 실제 관측했다.

## 실물 근거

결함표·SHA·실행 결과·미검증 범위의 최신값:
`I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/REPORT.md`, `DEFECTS.md`.
맵 그림은 별도 소유자 `codex-map25d` 범위이므로 이 작업에서 수정하지 않는다.

## 웹 자연 입력으로 조작기 선검증

`fullrun-web-reference.cjs <output> fullrun`은 상태를 읽어 실제 키/마우스만 보내는
15분 상한 경로다. HP·좌표·처치·스폰·자원을 설정하지 않는다. 첫 시도에서
19처치/레벨2 후, 조작기가 검기 사거리 밖(최대420px)에서 멈추고 자원을 소모하는
문제를 관측했다. 제품 결함으로 세지 않고 그 QA Node만 신원 확인 후 종료했다.
공용 실행기의 종료 후 정리에서 자식4개를 회수했다. 다음 조작기는 210px 접근,
170~260px 정지 구간·벽 뒤 조준 회피로 바꿨고 같은 정책을 Unity QA에도 적용했다.
두 번째 실제 웹 시도는 21초 표본에서24처치/레벨2까지 진행했다. 새 캐릭터 랜덤
장비가 달라 속도/HP 숫자를 같은 시드 비교로 해석하지 않는다. 완주 판정은 별도다.
최종 두 번째 웹 결과는77.517초 사망, 51처치/레벨4다. wrapper는 창0·잔여0·exit0,
게임 결과는 death이므로 완주가 아니다. 동일 웹 자동 조작의 추가 반복은 중단한다.
Unity 첫 실행용 조작기는 최대 차지 검기를 놓고, 스태미나 부족 때 마법 우선,
다가오는 적 탄에는Q/회피, 위험한 근접 저HP에는방향+Space를 입력하도록 보완했다.
이 조작 보완의 실제 Unity 결과는 정식 빌드/Player 전까지 미검증이다.
