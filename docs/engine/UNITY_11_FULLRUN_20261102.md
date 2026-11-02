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
