# 원본 기검참 수치 검증

오프라인 원본 함수 export 및 순수 C# 검사다. Unity Player/Editor 검증이나 전체 게임 판정이 아니다. Tools는 I: Junction에 보존한다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/ki-slash-oracle/export.cjs --source-root 'E:/exoduser-wt/codex-port-takeover-20261023' --project 'E:/exoduser-wt/codex-port-takeover-20261023/unity' --dependency-root 'G:/exoduser' --live-source 'G:/exoduser/game.html'
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/ki-slash-oracle/run.cjs --project 'E:/exoduser-wt/codex-port-takeover-20261023/unity' --label green-review
```

다른 환경에서는 source/project/dependency 경로를 해당 환경의 checkout과 Acorn 설치 경로로 명시한다. SDK8+와 Acorn을 사용한다. JS는 이 검증/export에서만 실행하고 native runtime에서는 사용하지 않는다. `oracle.json`의 source SHA가 다르면 export를 거절한다.

`runs/red.json`: native 기검참 API 부재로 기대 실패. `runs/green-01.json`: 92검사 중1실패(검사 fixture가 X80을 첫 이동시 범위 밖이라고 잘못 판단; 실제 원본에서도 거리66 < 반경합77이라 맞음). `oracle.boundary`는 X91/반경22를 원본 함수에 넣어 첫 Tick의 거리77 경계에서 미명중, 둘째 Tick 명중을 직접 확인한다. 이 fixture 교정과 trail 추가 뒤 `runs/green-02.json`: 93/93 통과. 수치/범위를 완화하지 않았다.

기본 무기/맵 회귀는 별도 `Tools/verify-core.cjs`, 결과 `I:/EXODUSER-Storage/qa/unity-port-20261024/ki-basic-regression/core-receipt.json` 36/36이다. 원본 `hurtE` 전체를 Node에서 실행했다고 주장하지 않는다. oracle은 원본 발사·업데이트·접촉 packet과 lifetime을 실행하고, C#의 admitted 일반 etype0 damage/쉴드/포이즈 소비자를 따로 검사한다.

검토에서 발견한 ordinary 포이즈 조기 최대회복은 `poise-oracle.cjs`가 원문 34451–34452/34456의 실제 timer 처리 후 38618–38638/38663–38666의 조기 return·regen 분기를 그대로 추출해 실행한 결과와 대조한다. 전체 updateE 실행을 가장하지 않는다. source block 추출 첫 시도는 닫는 brace 38666 누락으로 runner syntax error였으며 실패 로그를 남기고 수정했다. 이는 의미상 RED가 아니다. 수정 후 `runs/red-poise.json` 7실패→`runs/green-poise.json` 7/7 통과, 기검참 전체 `green-03-poise.json` 93/93, 기본/맵 회귀 `ki-poise-regression/core-receipt.json` 36/36이다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/ki-slash-oracle/poise-oracle.cjs --source-root 'E:/exoduser-wt/codex-port-takeover-20261023'
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/ki-slash-oracle/run-poise.cjs --project 'E:/exoduser-wt/codex-port-takeover-20261023/unity' --label green-poise-review
```
