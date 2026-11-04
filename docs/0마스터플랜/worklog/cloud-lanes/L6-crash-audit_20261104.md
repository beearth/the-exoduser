# L6 — 1-1 한 판 "크래시 0" 정적 감사 (2026-11-04)

- 레인: L6 디버깅(클라우드), 브랜치 `claude/unity-cloud-crash-audit-20261104`. **코드 수정 0.** Unity 실행·컴파일 0(정적 읽기만).
- 기준: unity/main = `386be384e`. 범위 ① `87a77a11f`(11-03 직전) → `386be384e`의 Runtime `.cs` 99개 변경분, ② combo4 5개 브랜치의 merge-base 대비 diff:
  demo-flavor-fix `ac4e187ae`, field-prepare-merge `79d4d14f1`, options-wave2 `2cd42d3ab`, first-impression-tone `479634337`, ui-minor6 `19216c411`.
- 제외: run-exception-audit R01~R10(`docs/engine/UNITY_RUN_EXCEPTION_AUDIT_20261104.md`, 적용 커밋 `328331f91`·`b9fb5dd63`).
- 경로: 타이틀 → 로비 → 캐릭터 선택 → 1-1 필드 → 드루이드 보스 → 사망/클리어 → 재시작·로비 복귀.
- 판정 기준: 코드 줄로 재현 경로가 증명된 것만 적었다. 줄 번호는 표기한 SHA 기준이다.
  - P0: 기본 한 판에서 반드시 도달한다.
  - P1: 흔한 조작·타이밍에서 도달한다.
  - P2: 자산·자료 손상이나 비기본 플래그에서만 도달한다.

## 0. 먼저 알아 둘 사실 — R02~R10 수정은 아직 unity/main에 없다

- `328331f91`(R03~R06)과 `08f969779`(R02)는 **field-prepare-merge 브랜치에만** 있다. `b9fb5dd63`(R07~R10)은 **ui-minor6 브랜치에만** 있다. 확인: `git merge-base --is-ancestor`가 세 커밋 모두 unity/main에서 실패했다.
- 그래서 지금 unity/main에서는 다음 줄들이 무방비 그대로다.
  - `NativeDeathOverlay.cs:44`: `Resources.Load(...).text`
  - `NativeDeathOverlay.cs:155`: `f.name`
  - `NativeRevive.DeathScreen.cs:201`: `tf.name`
- combo4를 병합하면 함께 들어오므로 새 수정 배정은 필요 없다. 다만 combo4 병합이 늦어지거나 일부만 병합되면 R07~R10이 남는다는 점을 CTO 병합 순서에 반영한다.

## 1. 결함 표

| 위험도 | 파일:줄 (SHA) | 재현 경로 | 근거 (코드 줄) | 최소 수정안 |
|---|---|---|---|---|
| **P1** | `Vfx/CombatImpactView.cs:138`, `:244`, `:251` (`386be384e`) | 1-1 필드, 3D 켜짐(데모 기본 `--remodel3d`), 아틀라스 적 → 적을 때린 **같은 프레임**에 K(스킬창)·J(스탯)·G(대장간)·ESC를 누른다. | ① 피격 클립 렌더러는 `FixedUpdate→DispatchFeedback`(`NativeGame.cs:345`·`:372`)의 `Handle()`에서 `Make()`로 만든다(`:91-93`). 이 렌더러는 **enabled 상태이고 sprite가 null**이다. ② sprite는 `Update()`(`:284-285`)에서만 넣는데, 이 함수는 `NativeGame.UpdateViews()`(`:480`)에서만 불린다. ③ `NativeGame.Update`는 패널 분기에서 `UpdateViews` 없이 return한다. 스킬창 `:315`·`:321`, 스탯 `:287-292`, 단축키 `:285`가 그렇다. 스킬·스탯 창이 열려 있는 동안은 매 프레임 이렇게 return한다. ④ 카메라 콜백 `DrawEnemyHits`(`:88`에서 구독)는 `:244`에서 `enabled`만 보고, `:251`에서 `c.renderer.sprite.rect`를 읽어 **NullReferenceException**이 난다. `renderCamera`는 `:269`에서 이미 설정돼 있고, `EnemyBody`는 `NativeGame.cs:138`에서 항상 연결된다. | 결과: 패널이 열려 있는 동안 카메라 렌더마다 NRE가 나고 로그가 쌓인다. 나머지 클립 그리기도 건너뛴다. 강제 종료는 아니지만 "크래시 0" 로그 판정에서 FAIL이다. 수정안: `:138` 생성 직후 `renderer.enabled=false;`. `:244` 조건에 `\|\|c.renderer.sprite==null` 추가. 수치 변화 0. |
| **P1** (soft-lock, 예외 아님) | `NativeGame.PauseFocus.cs:12`, `NativeGame.cs:295`·`:564`·`:727`, `NativeGame.cs:708` (`386be384e`) | 사망 → 11-04에 새로 들어온 "안식은 없다" 결정 화면이 떠 있는 동안 창 포커스를 잃는다(Alt-Tab·알림). | ① `SetGameFocus(false)`는 조건 `!menu&&!inventory.Open&&!skills.Open`에서 `menu=true`로 만든다. 사망 여부는 보지 않는다. ② `Update :295`의 결정 화면 키 처리는 `!menu`일 때만 돈다. ③ `OnGUI :564`는 `menu`이면 일시정지 메뉴를 그리고 return한다. ④ `menu`를 false로 되돌리는 길이 모두 막힌다. `Resume :727`은 `!PlayerDown` 조건이고, `HandlePanelHotkeys :708`은 `Hp<=0`이면 return false다. `PauseNavigation.cs:32`·`:39`·`:41`의 사망 시 메뉴는 Restart·Lobby뿐이다. | 결과: 결정 화면의 "다시 일어선다"(보스방 RetryInsideArena)로 돌아갈 수 없고, 한 판을 처음부터 다시 해야 한다. 수정안(`PauseFocus.cs:12`): 조건에 `&&!(Simulation!=null&&PlayerDown&&death.Active)` 추가. 포커스를 잃어도 결정 화면을 유지한다(Running=false는 그대로). |
| P2 (조건부) | `NativePauseMenu.A15Web.cs:228`, `:234` → `NativeUiAudit.cs:198`·`:203`·`:205`·`:220` (`386be384e`, 11-03 `366826269`) | 설정 화면에서 전체화면 전환 직후(`SettingsHostApplyPending`), 또는 저장 문제가 있거나 저장소가 없을 때 안내 줄을 그린다. | 화면 코드가 QA 감사용 리플렉션 함수 `TextLayoutBounds`를 `NativeUiAudit.Active` 가드나 try 없이 부른다. 이 함수는 설계상 다음 경우에 throw한다. TextCore 내부 멤버가 없을 때(`:198`), Advanced Text일 때(`:203`), 줄 측정값이 0일 때(`:205`·`:220`). 지금 Mono 빌드에서는 QA 겹침 촬영이 이 경로를 통과하므로 기본 빌드 도달은 증명되지 않았다. Unity 버전이나 백엔드가 바뀌거나 Advanced Text를 켜면 OnGUI 이벤트마다 예외가 나고 닫기 버튼이 그려지지 않는다. | `:228-237` 측정 블록을 `try{...}catch(System.Exception){noticeRect.y=1022;}`로 감싼다(웹 기준선 유지). |
| P2 (플래그 한정) | `NativeEnemyRigRenderer.cs:65`, `:68` (`386be384e`) | `--enemy-render=rigpixel`(기본 꺼짐. rigpixel 기본값을 전환하면 P1로 올라간다) → 적 애니메이션 예외가 1회 난 뒤 그 적이 죽는다. | 갱신 루프 `:63`은 `try`로 감싸고 `a.failed`로 표시한다. 그러나 `Observe :68`(EnemyDeath)과 `gone` 루프 `:65`는 `failed` 검사도 try도 없이 `SyncActor`를 다시 부른다. `Observe`는 `DispatchFeedback`의 피드백 while 루프 안에서 불리므로(`NativeGame.cs:372`) 같은 예외가 나머지 피드백 처리·사운드·드루이드 큐를 끊는다. | `:68`: `&&!a.failed` 조건과 `try{SyncActor}catch{a.failed=true;failedIds.Add;Fallbacks++;Fallback(a);}`. `:65`의 `else SyncActor(a,tick)`도 같은 가드로 감싼다. rigpixel 기본값 판정 전에 반영을 권한다. |
| P2 (자산 누락만) | `NativeDemoArabicText.cs:24` (`386be384e`) | 언어 `ar` + 아랍 폰트 자산 누락 | `template==null\|\|font==null`이면 `InvalidOperationException`이 난다. 자산 `Art/fonts/ArabicCaptionPanel.asset`·`ArabicCaptionNaskhDynamic.asset`은 저장소에 있다. | throw 대신 false를 돌려주고 `NativeSilverHellUi.Label`로 대체한다. |
| P2 (자료 손상만) | `NativePetBubbleCatalog.cs:202-207` (`386be384e`) | pet_bubble.json 중복 키 또는 texts≠29 | 정적 사전에 먼저 넣고 loaded 플래그를 나중에 세운다. 그래서 반쯤 실패하면 매 프레임(`UpdatePetBubble`) 같은 예외가 다시 난다. 현재 자료를 node로 검사한 결과: 29언어(en 포함), 13항목×29, 중복 0, cue 참조 누락 0. | 지역 사전에 다 만든 뒤 한 번에 교체한다(R09 NativeDemoText와 같은 방식). |

참고(도달 불가, 배정 불필요)
- 위치: `Core/DruidBoss.Hazards.cs:179`.
- 위험: `TickParryShot` 중 드루이드 목숨이 동기적으로 끝나면 `ClearHazards`→`Projectiles.Clear()`(`DruidBoss.Remodel.cs:121`) 뒤에 `Projectiles[w++]=p`가 범위를 넘을 수 있다.
- 도달 불가 근거: 필드 보스 분열탄은 아레나에서 정리되고(`Simulation.FieldBoss.cs:92`), 드루이드 생성 때도 `ClearHazards`가 불린다(`Simulation.DruidBoss.cs:46`). 그래서 지금은 만날 수 없다.
- 조건이 바뀌면 `if(w<Projectiles.Count)` 가드를 넣는다(수치 무변경).

## 2. combo4 5개 브랜치 — 크래시 결함 없음(확인 근거)

| 브랜치 | 확인한 위험 | 결과 |
|---|---|---|
| demo-flavor-fix `ac4e187ae` | `NativeFlavorStorage.TryResolve` | 경로 예외 4종만 잡고 실패하면 IoError로 처리한다. 설정 쪽은 `ApplySettingsHostValues` 뒤 return, 로스터 쪽은 쓰기 금지로 끝난다. |
| | `NativeDemoEndText.ForLocale` | null을 돌려주지 않고 예외도 내지 않는다. 내장 영어로 대체한다. |
| | stageclear_labels | 29행 모두 `demoSub·demoNext·demoWishlist·title·next`가 있다(node 검사). |
| | `NativeQaSandbox`↔`BuildFlavor` 정적 순환 | 없다. `UsesCommandLine`은 `defs`를 읽지 않는다. |
| field-prepare-merge `79d4d14f1` | 전환 대기 | 무한 대기 없음. `TransitionPrepareWatchdog`가 조립 정지 20s, 유휴 12s, 절대 상한 120s로 끝낸다(프레임 시간 클램프). |
| | 조립 예외 | `AssemblyGuard`가 잡아 `Remodel3DAbort`→`R3Teardown`(장면 언로드)→2D로 넘긴다. 진행 중인 LoadSceneAsync는 `op.completed`에서 정리한다. |
| | 버린 조립의 토큰 | `NativeTransitionProgress.Release()`가 generation을 올려 무효화한다. |
| | 그 밖의 가드 | `Remodel3DLate`에 `r3Marker` 가드, `r3Roots` null 가드 11곳 이상, `hellLayerOriginals`로 파괴된 TerrainLayer 재사용을 막는다. `Simulation=null`을 대입하는 곳이 없으므로 `:141` 역참조는 안전하다. |
| options-wave2 `2cd42d3ab` | 프리셋 파서 | `NativeSettingsPreset.Apply`는 FormatException만 잡는다. `Reader`는 EOF·토큰 오류를 모두 FormatException으로 던지므로 충분하다(`NativeSettingsJsonCodec.cs:77-83`). |
| | 커서 | `NativeCursorOption.Load`의 slot은 `StepFor`가 늘 `Steps` 원소를 돌려주므로 범위 안이다. |
| | 그래픽 옵션 | `NativeGraphicsOptions`는 파괴된 Volume·Bloom 키를 Prune한다. |
| | BGM | `NativeBgmCatalog.Resolve`는 null을 돌려주지 않는다. `NativeGameMusic` 회전은 `music.clip!=null` 조건이 있어 클립이 없으면 무음이다. |
| | 키 목록 초점 | `stop=Cursor-7`과 `idx-3`은 같은 값이다(`idx=Cursor-4`). `PointAt`은 범위를 검사한다(`PauseNavigation.cs:22`). |
| | 언어 키 | `Lang`은 2~4자 소문자만 받는다. LobbyLanguage 29개 코드가 모두 이 조건에 맞는다. |
| first-impression-tone `479634337` | 문자열·배열 | 문자열 교체만 있고 배열 길이 5는 그대로다. |
| ui-minor6 `19216c411` | `FitSize`·이름 축소 | 루프에 하한이 있다(이름 18, 버튼 11). |
| | 줄 나누기 | `SilverRailSoon`의 공백 탐색이 종료된다. |
| | 사망 화면 | `defs`·`timing`·`replayScreen`·`atlas`에 null 가드가 있다(R08 포함). |

## 3. unity/main 11-03~11-04 변경분 — 안전 확인(요약)

| 대상 | 확인 결과 |
|---|---|
| 사망 결정 화면 | `PollKeys`는 choices가 비어 있지 않을 때만 modulo를 쓴다. death_web petPool 9개와 dd_* 키는 petLines 28개 안에 모두 있다. death_decision_text·death_screen_labels는 29행이고 en이 있다. |
| Rise·Restart·GiveUp | ScreenTransition과 `gameFocused` 가드를 거친다. |
| 일시정지 반복 루프 | `PauseMenu Reset`과 `RetryInsideArena`가 `death`·`deathShown`을 초기화한다. |
| 보스 대사 | `BossDialogueAttach`·`Detach`가 이전 Simulation의 구독을 해제한다. |
| `NativeDruidSoundCues` | Simulation을 바꿀 때와 Dispose할 때 구독을 해제한다. |
| `CombatImpactView` | Dispose(OnDestroy)에서 정적 카메라 이벤트 2개를 해제한다. |
| 사운드 | NativeSoundWire 키는 전부 Fallbacks에 있다. RM1 클립이 존재한다. 발소리 클립은 생성자에서 검사한다. |
| pet_bubble·demo_text | 29언어 모두 있고 중복 0이다(node). |
| 로비 새 텍스처 | `btn_thorn_*` 20장, lobby_enter, name_create·cancel, iron_480_blur2, fdg_intro, warrior_story_v23_clean이 모두 저장소에 있다. |
| `NativeLobbyVideo.Presentable` | `Prepared`를 먼저 확인한다. |
| Core 변경 | ParryShot·ParryReflect·DruidBoss.Reflect·PlayerHurt·Growth·EquipmentApplication·CombatStats·EnemyBridge에서 0 나누기·범위 예외를 찾지 못했다. `ShQuery`는 새 리스트를 돌려주고, `MaxHp>0` 가드가 있다. |

## 4. 다음 담당 (CTO 배정용)

1. P1 두 건(CombatImpactView sprite null, 사망 결정 화면 포커스 soft-lock)을 구현 레인 하나에 묶는다. 수정은 각 1~2줄이고 Core 수정은 없다. 검수는 같은 SHA에서 R1이 맡고, Mac에서 다음 두 가지를 실제로 해 본다.
   - 적을 때린 프레임에 K를 누른 뒤 로그에 NRE가 0인지 본다.
   - 사망 결정 화면에서 Alt-Tab한 뒤 "다시 일어선다"가 그대로 보이는지 본다.
2. rigpixel 기본값 판정(보스전 총괄 7차) 전에 EnemyRigRenderer `:65`·`:68` 가드를 넣는다.
3. P2 세 건은 위 레인에 여유가 있으면 함께 넣고, 없으면 보류한다.
4. combo4 병합 때 R02~R10이 함께 들어오는지 병합 뒤 `git merge-base --is-ancestor 328331f91 origin/unity/main`(b9fb5dd63도)로 확인한다.
