# RM-0 인계 메모 — 조명 RM0-LIGHT-L · 사운드 RM-1 트랙 A (2026-10-28)

> 소유: RM-0 세션(Sonnet, 이 메모로 정리됨). 이어받는 쪽(Codex CLI)은 아래를 브리프로 쓴다.
> 이 세션의 일은 두 브랜치(조명 `claude/unity-rm0-engine-20261027`, 사운드 `claude/unity-pc-sound-rm1-20261027`)를 `unity/main`에 병합 가능하게 만드는 것이다. 병합은 유니티 총괄만 한다.

## 0. 한눈에

| 항목 | 브랜치 | 팁 | 코드·에셋 | Unity 플레이어 빌드(① 영수증) | 남은 일 |
|---|---|---|---|---|---|
| 조명 | `claude/unity-rm0-engine-20261027` | `dc929d682` | 완료·push (노출 1.30 확정) | `7823956c3`(노출 1.85 + Neutral)은 오류 0. 현재 팁(노출 1.30)은 **빌드 미확인** | 맵 총괄 노출 판정 → 현재 팁 빌드 1회 → 유니티 총괄 병합 |
| 사운드 | `claude/unity-pc-sound-rm1-20261027` | `e6c5b63ad` | 완료·push | `0f6216143`은 오류 0(15:34, 아래 §3). 현재 팁은 **빌드 미확인** | 최신 `unity/main`(b0f9a0c52 이후) merge → 공용 실행기 빌드 1회 → 사운드 총괄 PASS → 유니티 총괄 병합 |

두 브랜치에 커밋 안 된 의미 있는 변경은 없다(남은 `M`은 Unity가 다시 만든 URP·씬·ProjectSettings 에셋이고 넣지 않는다). 둘 다 `origin`에 push되어 있다.

## 1. 조명 (RM0-LIGHT-L)

- 목표: 샌드박스 조명을 Linear 색공간 + 후처리 기준으로 다시 맞춘다. 디자인총괄 2차 PASS 조건 = postExposure 1.85, **톤매핑 Neutral**.
- 커밋(first-parent): `d6d17bab2`(Volume postExposure −0.15 → 1.85) → `f3dbd4a49`(톤매핑 ACES → Neutral) → `7823956c3`(unity/main efae9aa11 merge) → `f639cd4d4`(Neutral 노출 재선택 1.30 + 캡처 하니스 Cinemachine 오류 제거) → `dc929d682`(unity/main f49b6d625 merge).
- 바뀐 파일: `unity/Assets/Exoduser/Editor/Rm0EngineSetup.cs`(`PostExposure = 1.3f`, `TonemappingMode.Neutral`, 캡처의 `UpdateMethod = ManualUpdate`), `unity/Assets/Exoduser/Rendering/GlobalVolume_Hell.asset`(postExposure 1.3, Tonemapping mode 1), `unity/Assets/Exoduser/Editor/Rm0LightCapture.cs`(스윕 하니스, 이번에 추적 시작), `docs/engine/UNITY_RM0_ENGINE_20261027.md`.
- 재측정 결과(Neutral, `measure_L.py`, 같은 구도): 노출 1.30 = 화면 중앙값 27.3 · 샌드박스 바닥 휘도 **25.189**(상한 25.190, Gamma B 21.9042 ±15 %) · 웅덩이 8.7° · 날 채도 9.9 % · 갑옷 R/G 1.235 · 바닥 R/G 1.72/1.76/1.73 · B ≤ G 참. 1.40 이상은 바닥 휘도가 상한 밖. 맵 총괄 규칙(① 바닥 18.6~25.2 ② 화면 ≥ 23.7 ③ 색 기준 전부)을 모두 만족하는 격자 값은 1.30 하나지만 **상한과 0.001 차이라 여유가 없다**. 맵 총괄이 1.30을 받을지, 1.25 등 더 낮은 값을 한 번 더 재라고 할지 판정 대기.
- 캡처·측정 위치: `E:\exoduser-wt\_out\rm0-light\` (`SPEC.md` §7, `measure_L.py`, `neutral185\e1.85\`, `neutralSweep2\e1.30..e1.60\` PNG 세트, `L_metrics.json`). 스윕 실행은 `Exoduser.Rm0LightCapture.Sweep -outdir <폴더> -exposures 1.25,1.30 -sets after_out,after_in` (에디터 batch, GPU RenderTexture, `-nographics` 없음).
- 다음 순서: ① 맵 총괄 판정(노출 확정) → ② 확정 값이 바뀌면 `GlobalVolume_Hell.asset`·`Rm0EngineSetup.PostExposure`·문서만 고쳐 커밋 → ③ 최신 `unity/main`을 합친 상태로 플레이어 빌드 1회(오류 0 영수증, §4 명령) → ④ 맵 총괄에 영수증과 sandbox·after_in·after_out 1x 크롭 → ⑤ 유니티 총괄이 병합.

## 2. 사운드 (RM-1 트랙 A)

- 구조: Core는 알림만 낸다(`FeedbackEvent`: Sample·EnemyHit·EnemyCrit·EnemyDeath·BossHit·BossDeath·Roll·Parry). 소리 선택·우선순위·쿨다운은 어댑터 `unity/Assets/Exoduser/Runtime/NativeFeedbackAudio.cs`(+`NativeAudioMixer`·`NativeGameMusic`·`NativeAmbientSources`·`NativeBossSounds`·`NativeEnemySfxTables`)가 한다. 믹서 `Resources/Audio/Exoduser.mixer`. 상세 문서 `docs/engine/UNITY_RM1_SOUND_TRACK_A_20261028.md` §1~6.4.
- 주요 커밋(first-parent, 오래된 것부터): `fb5dde4f8`(패링·SND-09 채택 11키·보스 피격 구조) · `be4b759c5`(unity/main 26a11fd2f merge) · `051af9033`(`druid_sink`를 침강 구멍 순간 +37틱으로, Core 무변경) · `0ee824d52`(`druid_hit`·`druid_hit_heavy`·`druid_whip`) · `28c301be0`(whip 1·2·3타) · `4226257a9`·`5b57e31c7`(unity/main 4ceb18b51·efae9aa11 merge, O-1 Core 충돌 해소) · `0f6216143`(`druid_spore`) · `486d7ef9f`+`3e56f5a60`(`druid_slam`, 파일 교체 단독 커밋) · `e6c5b63ad`(unity/main f49b6d625 merge).
- 규칙: 키별 음량은 모두 임시값(사운드 총괄이 실제 플레이 판정 때 조정). **`druid_slam`은 사용자 컨펌 전 선반영(pick_r4)** — 사용자가 다른 후보를 고르면 `3e56f5a60`의 `druid_slam.mp3` 파일만 교체. `druid_spore` 원본은 웹에서는 아이템 줍기 소리(`pickup_rummage2.mp3` 가공본)라서 Unity에 줍기 소리를 넣을 때 같은 파일이 들어가면 사운드 총괄에 알린다. `druid_whip` 1타 타이밍은 Core가 위상 보정 텔레그래프 길이를 알리지 않아 기술 데이터 32+2틱으로 둔 추정이다(2·3타는 정확). 휘청임(poise) 알림은 Core에 추가하지 않기로 했다.
- 병합 회귀(Core 변경이 있었던 매 병합에서 1회씩 돌림, 최신 `e6c5b63ad`): enemy-hurt 0/4,968 · damage-parity 0 · dash-parry 0 · player-hurt 47,559/0 · parry-reflect 0(326 반사) · shield-revive 34,821/0 · enemy-ai 2,323,428/0 · enemy-tick 0/1,240 · stage-flow 0 · fieldboss 0 · skill 0 · feedback-oracle 0 failures · druid-boss 5,421,635/불일치 0(48 cases) · druid-remodel 97,830/0 + remodel-frame 124/0 · kill-wire 31/0. 오라클 필터: `Tools/feedback-oracle/Program.cs`의 `Drain`이 RM-1 소리 알림 7종을 걸러낸다(유니티 총괄 승인). `drop-oracle`은 csproj가 소스를 못 찾아 빌드 오류(저장소 기존 상태).
- 다음 순서: ① `origin/unity/main`(b0f9a0c52 이후)을 merge — Core 충돌이 나면 `unity/main` 쪽 규칙을 채택하고 사운드 줄(`QueueLogicalSound`·`host.Sound`·`Feedback.Enqueue` 계열)만 다시 얹은 뒤 관련 oracle 1회 → ② 공용 실행기로 플레이어 빌드 1회(§4) → ③ 오류 0 영수증(커밋 SHA·로그 경로·오류 수)을 유니티 총괄과 사운드 총괄에 → ④ 사운드 총괄 PASS(⑥ 실제 플레이: 시드 13 드루이드전 Receipt 4항목 — 채택 11키 경로·횟수, 패링 7회 `q_parry`/`sword_parry`+`voice`, `boss_hit` 순환·감쇠·8틱, BGM 피크 −3 dBFS 안쪽) → ⑤ 유니티 총괄 병합.

## 3. 빌드 이력 (사실만)

| 때 | 대상 | 결과 |
|---|---|---|
| 13:34 | 조명 `7823956c3` | Succeeded, errors 0, 2.61 GB, 영수증 `I:\EXODUSER-Storage\rm0-slot\rm0-build-receipt.json` |
| 13:35 | 사운드 `0f6216143` 1차 | **에디터 시작 크래시** exit −1073741819(0xC0000005), 프로젝트 로드 전 `UsbDevicesQuery`에서 access violation, 로그 `I:\EXODUSER-Storage\rm0-slot\run1\sound-build.log` (재부팅 13:28 직후) |
| 15:34 | 사운드 `0f6216143` 재시도 | Succeeded, errors 0, 2.66 GB, 영수증 `I:\EXODUSER-Storage\rm0-slot\sound-build-receipt.json` |
| — | 사운드 `e6c5b63ad`, 조명 `dc929d682` | 공용 실행기 예약을 걸었다가 세션 정리로 취소. **빌드 미확인** |

BSOD 이력이 있는 PC다(`pc-hardware-14900kf-bsod` 메모). 크래시·이상 종료는 재시도하지 말고 로그 경로와 함께 바로 보고한다.

## 4. 공통: 공용 실행기와 금지사항

```powershell
$x  = 'E:\exoduser-wt\<워크트리>\unity\Tools\devtools\exo-unity.ps1'
$wt = 'E:\exoduser-wt\<워크트리>'
& $x queue                                                    # 잠금 보유자 + 예약 순서
& $x reserve -Owner <이름> -Note "<무엇>" -TtlMin 240           # 순번 예약(앞 예약자 뒤에 선다)
& $x run -Worktree $wt -Owner <이름> -KeepReservation -Method PortVerification.Build `
   -Args '-output,I:/EXODUSER-Storage/<폴더>/build,-receipt,I:/EXODUSER-Storage/<폴더>/receipt.json' `
   -TimeoutSec 1500 -WaitMin 240 -PollSec 30                  # 플레이어 빌드(-batchmode, 창·소리 없음)
& $x unreserve -Owner <이름>                                   # 끝나면 예약 해제
```
`-File` 모드(bash)에서는 `-Args`를 쉼표 한 덩어리로 쓴다. 에디터 캡처는 `-Method Exoduser.Rm0LightCapture.Sweep -Args '-outdir,<폴더>,-exposures,1.25,-sets,after_out,after_in'`처럼 같은 방식으로 실행한다.

- 하지 말 것: 창 띄우기(`-popupwindow`·`-screen-fullscreen`·보조 모니터), `-nographics`로 캡처(렌더 결과가 안 나옴 — 캡처는 GPU RenderTexture), 소리 켜기(`AudioListener.volume = 0`). Unity는 PC 전체에서 **한 번에 1개**, 시작 전 커밋 여유 20 GB 확인, 끝나면 에디터 종료 확인. 사용자의 실행 중 게임(`EXODUSER-Unity`, `I:\EXODUSER-Storage\unity-latest`)은 건드리지 않는다.
- 대기 조건(예약 순서·RM-INT 우선)은 스스로 빼지 않는다. 앞지르려면 유니티 총괄 승인이 먼저다(이번 세션에서 CTO가 지적함).
- git: 경로 지정 커밋만(`git add -A` 금지), `main`에 편집·병합 금지, `unity/main` 병합은 유니티 총괄만, force push·reset --hard·rebase·stash·gc 금지.
- 쓰기 사고 방지: 백그라운드에서 `python -`(stdin) 금지(스크립트는 파일로), 같은 파일을 한 줄로 읽고 쓰기 금지(임시 파일 + `os.replace`), 로그를 `tail -F`로 따라가면 Windows에서 파일을 붙들어 쓰는 쪽이 죽는다(Monitor는 줄 수를 세는 루프로). `.cs` 줄 끝(CRLF/LF)은 기존 파일에 맞춘다(안 맞추면 전체 줄이 변경으로 잡힌다). 대용량 산출물은 `I:\EXODUSER-Storage\`, 임시 작업물은 `E:\exoduser-wt\_out\`.

## 5. 위치 모음

- 조명: `E:\exoduser-wt\pc-unity-rm0`, 산출물 `E:\exoduser-wt\_out\rm0-light\`
- 사운드: `E:\exoduser-wt\pc-unity-sound`, 도구·측정 `E:\exoduser-wt\_out\rm1-sound\` (오라클 일괄 `run-oracles3.ps1`, Roslyn 컴파일 확인용 `rosl\Rosl.csproj`, 시드 13 타임라인 도구 `unity\Tools\rm1-sound-timeline`)
- 빌드 산출물·영수증: `I:\EXODUSER-Storage\rm0-slot\`
- 관련 문서: `docs/engine/UNITY_RM0_ENGINE_20261027.md`, `docs/engine/UNITY_RM1_SOUND_TRACK_A_20261028.md`, `docs/6사운드디자인/DRUID_BOSS_SOUND_REMAKE_20261028.md`, `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`, `unity/Tools/devtools/README.md`
- 알릴 곳: 유니티 총괄 `local_59ad835c-2e92-44a5-bebf-0f0223217ae0`, 사운드 총괄 `local_cf0cb8d7-22f7-46be-b65d-fc242dc2bc23`, 맵 총괄 `local_9d17d95b-239c-4254-8bef-555b6c5e16e8`, 디자인총괄 `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf`
