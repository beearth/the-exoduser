# 인계 메모 — unity-rmb1 (RM-B1 다크 드루이드 리모델링, Sonnet 세션 정리)

작성: 2026-10-28, 유니티 총괄 지시("단순작업자 정리, 단순 작업은 Codex CLI로"). 이 문서를 그대로 Codex 브리프로 쓸 수 있게 적었다. 한국어로만 보고한다.

## 1. 한 줄 상태

RB1-1~2·텔레그래프 API·직선 균열·패링 반사·RB1-6 속도·RB1-3 기둥(Core)·RB1-4 팝업 끄기·리뷰용 실행 인자는 **병합됨**(unity/main). RB1-3 **예고 표현 뷰(`NativeDruidTelegraphView`)는 코드만 푸시됨 — 컴파일도 실행도 아직 안 했다**(작업 브랜치 `claude/unity-pc-rmb1-20261027` = `00353dda9`, 미병합).

## 2. 작업 위치

| 항목 | 값 |
|---|---|
| worktree | `E:\exoduser-wt\pc-unity-rmb1` (브랜치 `claude/unity-pc-rmb1-20261027`, 마지막 unity/main 병합 = `d1bac7735`의 `06b86008c`) |
| 명세 SSOT | `docs/engine/UNITY_BOSS_RM1_DARK_DRUID_20261027.md` — §4 예고 규칙, §5 아레나, §6 구현 순서·완료 조건, §9 예고 API 필드·기술별 연결, §10 속도, §11 기둥·팝업, §12 리뷰 인자·영수증 |
| 보드 | `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md` (머리말 "Unity 완료 정의" ①~⑥, §8.1 M1~M7) |
| VFX 명세 | `docs/5.1임펙트디자인/UNITY_RM1_VFX_SPEC_20261027.md` §3.3 (예고 3종 색·표현) |
| 판정 | 보스전 총괄 `local_a98acebe-ea98-4dda-9441-d10b1c7622ed`, 유니티 총괄 `local_59ad835c-2e92-44a5-bebf-0f0223217ae0` |

## 3. 이미 된 것 (SHA는 unity/main 병합 기준)

| 단위 | 내용 | 비고 |
|---|---|---|
| RB1-1·2 | 12기술·콤보·3목숨·쓰러짐·축소·쉴드 (`DruidRemodelData`, `Simulation.DruidRemodel.cs`) | 플래그 끔 = 웹 이식본, druid-boss-oracle 48케이스 5,421,635검사/0불일치 |
| 예고 API | `Simulation.DruidTelegraphs(list)` 읽기 전용 (`DruidTelegraph.cs`, 명세 §9) | |
| RB1-6 | 걷기·조준·기술 사이 간격·회복·패링 +30f (`DruidBoss.Motion.cs`, 수치는 `BossRemodelSet`) | |
| RB1-3 Core | 뿌리 기둥 4개(`DruidBoss.Pillars.cs`, `Simulation.Pillars.cs`): 이동·탄·균열·박동 그림자·잠행 옆면 솟기 | 명세 §11 |
| RB1-4 팝업 | 보스 팝업은 `PopupKeep` 3개("벽 충돌!"·"독!"·"벗어났다!")만 | 보스전 총괄 승인 |
| 리뷰 인자 | `--unity-druid-remodel`, `--unity-boss-direct <스테이지>`, 확인용 `--unity-review-args-capture` (`NativeReviewArgs.cs`, `NativeGame.ReviewArgs*.cs`) | 명세 §12, 병합 요청 중 → 유니티 총괄 병합 |
| 하니스 | `unity/Tools/druid-remodel-test` 97,830검사/0실패(검사 종류별 개수 표 포함), `remodel-frame` 124/0 | net8, 아래 §6 |

## 4. RB1-3 예고 표현 — 남은 일 (이 브리프의 첫 작업)

코드는 이미 있다: `unity/Assets/Exoduser/Runtime/NativeDruidTelegraphView.cs`(+meta), `NativeGame.BossView.cs`에서 생성·갱신·폐기, `NativeGame.ReviewArgsCapture.cs`에 RenderTexture 캡처와 전투 중 예고 종류별 1장 캡처 루프.

해야 할 것(순서):
1. **컴파일 확인.** 아래 §5의 빌드 명령. 오류가 나면 고친다(코드는 한 번도 컴파일되지 않았다).
2. **확인 실행** `player -AllowPlayer`로 `--unity-review-args-capture --unity-druid-remodel --unity-boss-direct 0 -output <dir>`. `review-args.json`에 "RB1-3: telegraphs drawn …" 검사가 들어 있다(≥6 조합·≥6장). PNG는 `<dir>/caps/tele-*.png`.
3. **눈으로 판정** (CLAUDE.md §작업물 퀄리티 5·6): PNG를 직접 보고 "처음 보는 사람이 ① 막는다 ② 피한다 ③ 구른다로 읽는가", 모양이 Core 판정 경계와 맞는가(±4px), 테두리·얼룩이 Hell Gothic 톤인가. 원색·네온·이모지·점 금지. 안 맞으면 고친다. 캡처는 HUD(IMGUI)가 빠진 월드 화면이다.
4. 알려진 한계: 캡처 루프는 플레이어가 공격하지 않아 보스가 P1에 머문다 → P2 이후 기술(땅속 잠행·해일·박동 등)의 예고는 이 캡처에 안 나온다. 필요하면 캡처 루프에서 보스 HP를 낮춰 목숨을 넘기거나, 하니스처럼 기술을 강제 시작해 모양을 확인한다.
5. 박동(`ArenaMinusSafe`)은 카메라에 보이는 40px 칸만 칠한다(경계가 계단져 보일 수 있음 — 개선 여지). 잠행 `Trail`·고리 `RingGap`은 아직 눈으로 본 적 없다.
6. 통과하면 병합 요청: **① 영수증(오류 0, 포함한 unity/main SHA)** + 확인 실행 결과 + PNG 경로를 보스전 총괄·유니티 총괄에 보고. 명세 §4·§9에 구현 기록(새 §13)을 main에 경로 지정 커밋.

그다음 **RB1-4 무릎 꿇기·축소·침강 표현** (명세 §6 RB1-4/§2·§10.4, 보드 머리말): Core 이벤트 `Simulation.DruidRemodelRaised`(`DruidRemodelEvent{Tick, Life, Kind, Note, Hp, MaxHp, Shield, Radius}`)를 **구독만** 한다. `Kind` = `start` / `dying` / `collapse`(목숨 쓰러짐) / `life`(다음 목숨 시작) / `rootCut`·`rootCutIgnored`(뿌리 3회 타격 보상) / `blocked` / `final`(`Note` = `sink` 또는 `kill`). 쓰러짐 연출(무적 2초)·몸 축소(몸 100/85/70%, `Radius`)·최종 침강은 기존 웹 이식 침강(`NativeGame.BossView.cs` `SinkBody*`)을 참고하되 리모델은 Unity 도구(Timeline·Animator)로 새로 만든다는 CLAUDE.md §Unity 리모델링 방침.

## 5. 실행 명령 (이것만 쓴다 — 창·소리 없음, 잠금·세이브 격리 자동)

```powershell
$x  = 'E:\exoduser-wt\pc-unity-rmb1\unity\Tools\devtools\exo-unity.ps1'
$wt = 'E:\exoduser-wt\pc-unity-rmb1'
$env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH='false'; $env:DOTNET_CLI_HOME='E:/exoduser-wt/_dotnet-home'
# 빌드 (영상 복원·잠금·메모리 조건 포함, 큐 순번 대기 있음. -WaitMin 으로 대기 한도를 늘린다)
& $x build -Worktree $wt -Args '-output','E:/exoduser-wt/_out/rmb1/build','-receipt','E:/exoduser-wt/_out/rmb1/build/build-receipt.json' -TimeoutSec 1700 -WaitMin 150 -Owner 'codex-rmb1'
# 플레이어 확인 (무창 -batchmode + GPU, 세이브 격리)
& $x player -Exe 'E:\exoduser-wt\_out\rmb1\build\EXODUSER-Unity.exe' -AllowPlayer -Args '--unity-review-args-capture','--unity-druid-remodel','--unity-boss-direct','0','-output','E:/exoduser-wt/_out/rmb1/build/reviewrun' -TimeoutSec 600 -Owner 'codex-rmb1'
```

- 시작 조건: 실행 중 Unity 에디터 0개, 커밋 여유 20GB 이상(`Commit Limit − Committed Bytes`). 이 PC는 커밋 여유가 자주 10GB 아래로 떨어져 큐에서 한참 기다린다.
- `EXODUSER-Unity.exe`·`Unity.exe`를 직접 띄우지 않는다(자체 스크립트 금지). `-popupwindow`·`-screen-fullscreen`·`-nographics`(플레이어)·보조 모니터 창 금지.
- 하니스·oracle은 dotnet으로 직접 실행(Unity 아님):
  ```bash
  cd unity/Tools/druid-remodel-test && dotnet build DruidRemodelTests.csproj -c Release -o <out>/test-bin && dotnet <out>/test-bin/DruidRemodelTests.dll <out>/fight
  cd unity/Tools/druid-boss-oracle && "C:/nvm4w/nodejs/node.exe" run.cjs --rev origin/main --cases 48    # 끈 상태 oracle, 5,421,635/0 이어야 함
  ```
  `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false`, `DOTNET_CLI_HOME=E:/exoduser-wt/_dotnet-home`. 출력은 `E:\exoduser-wt\_out\`(C 드라이브 금지).

## 6. 검증 규칙 · 금지사항

- 완료 정의 6단계(보드 머리말): ① 병합 전 빌드 영수증(오류 0 + 포함한 unity/main SHA) ② unity/main 병합(유니티 총괄) ③ 통합 빌드 ④ 실제 GPU 렌더 스모크 ⑤ unity-latest 갱신 ⑥ 보스전 총괄 직접 플레이 판정. 하니스 PASS는 필요조건일 뿐이다. 하나라도 빠지면 "병합만 됨" / "빌드 미확인"으로 적는다.
- 보고 형식: 검사 종류별 개수 표(하니스), SHA, 영수증, 미구현 목록. 사용자는 한국어만 읽는다. 보고는 유니티 총괄·보스전 총괄 둘 다.
- Core(`unity/Assets/Exoduser/Runtime/Core`)의 판정·타이밍은 리모델 플래그 뒤에서만 바꾼다. 플래그 끔 = 웹 oracle 0불일치 유지. 표현 코드는 Core에 쓰지 않는다(읽기만).
- 병합은 보스전 총괄·유니티 총괄 몫 — main/unity-main으로 직접 병합하지 않는다. `git add -A`·force push·reset·rebase 금지, 경로 지정 커밋(`git add -- <경로>` + `git commit -m … -- <경로>`), 새 `.cs`는 `.meta`(guid) 필요, `tools/guard.baseline.json`·Unity가 다시 쓴 `.asset`/`.meta`/씬은 커밋하지 않는다(`git checkout --`은 커밋 뒤에만). 커밋 꼬리말 `Co-Authored-By`는 쓰는 모델 이름으로.
- 문서는 main에 경로 지정(임시 worktree: `git worktree add --detach <경로> origin/main`, 푸시 비강제, 끝나고 reparse point 확인 뒤 삭제).
- 환경 함정: bash 도구는 `\`·`\n`·`\uXXXX`를 망가뜨린다 → 스크립트는 파일(Write)로, 문자열 편집은 Edit 도구로. `python -`(stdin 대기) 금지. 한글 경로 ps1은 UTF-8 BOM.
- 세이브 보호: 리뷰 인자가 있으면 전투 저장을 쓰지 않는다. 사용자가 직접 실행한 게임(PID)과 다른 세션의 Unity 프로세스는 건드리지 않는다.

## 7. 남은 항목 요약

| 항목 | 상태 |
|---|---|
| RB1-3 예고 표현 컴파일·실행·눈 판정 | 코드 푸시됨(`00353dda9`), 미확인 |
| RB1-4 무릎·축소·침강 표현 | 미착수 |
| 독액 수로(§5) 시각 | `M_ToxicFlow` 경로 통보 대기(맵 총괄) |
| 기둥 외형 | 브리지는 `DruidBoss.Pillars`(x, y, r)를 읽는다. 외형은 맵 총괄 |
| 예고 소리 | 사운드 총괄 |
| RB1-5 HP/시간 조정 | 미착수 |
| 두 번 보고한 의문 | 10:25 첫 `--unity-review-args-capture`가 문 타일 검사에서 인덱스 오류였고 재현 안 됨(진단 로그 `review: sim … exits …`는 그대로 둔다 — 다시 나면 그 로그와 함께 보고) |
