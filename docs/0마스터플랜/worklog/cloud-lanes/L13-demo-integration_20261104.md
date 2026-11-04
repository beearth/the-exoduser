# L13 데모 통합 병합 브랜치 (11-04, 클라우드)

- 레인: L13 통합. 브랜치 `claude/unity-cloud-demo-integration-20261104`. **병합 브랜치만 만든다.** unity/main 반영은 Mac이 이 브랜치의 정확한 SHA를 빌드·판정한 뒤 CTO가 한다.
- CTO 결정: combo4 RETOUCH 잔여(봇 보스전 6사망·stall 7회·1명 로비 빈 슬롯 틀)는 unity/main에도 있는 기존 결함이라 퇴보가 아니다. 크래시 수정(R02~R10, R11~R13)과 첫인상 개선이 들어가므로 통합한다.
- 시작점: origin/unity/main `9196a515d`(fetch 뒤 확인, 지시서 값과 같음).
- 충돌 해결 외 코드 수정은 없다. 이 환경에서 하지 않은 것: 컴파일(PC), 빌드·화면 검수(Mac), dotnet 검사(dotnet 없음).

## 1. 병합 기록 (모두 `git merge --no-ff`)

| # | 병합한 브랜치 | 원 SHA(지시서와 일치) | 병합 커밋 | 충돌 | 해결 |
|---|---|---|---|---|---|
| 1 | claude/unity-pc-demo-flavor-fix-20261104 | ac4e187ae | d5eb9faed | `CHANGELOG_SYNC.md` 맨 위 1곳 | L1안: 양쪽 줄 유지(HEAD 먼저) |
| 2 | claude/unity-pc-field-prepare-merge-20261104 | 79d4d14f1 | 9522b05a5 | `CHANGELOG_SYNC.md` 맨 위 1곳 (**L1 시험에는 없던 충돌**. L1 기준 2f9fb68ab 뒤 unity/main과 1번이 맨 위에 줄을 더해서 생김) | 같은 원칙: 양쪽 줄 유지. 새 중복 줄 0 |
| 3 | claude/unity-pc-options-wave2-20261104 | 2cd42d3ab | 30d80877b | `CHANGELOG_SYNC.md` 1곳 | L1안: 양쪽 줄 유지. 병합 뒤 `NativeDemoEndText.cs`·`demo-flavor-tests/*`가 ac4e187ae와 같음 확인(옛 demo-flavor 상태가 덮지 않음) |
| 4 | claude/unity-pc-first-impression-tone-20261104 | 479634337 | 3cdd637bc | `번역대상_전체목록.md`, `번역_가이드.md`, `CHANGELOG_SYNC.md` | L1안: 번역대상은 브랜치 쪽 4274~4287 행 + "STY-24 첫인상 29언어 문자열 검수" 절을 먼저 두고 HEAD 쪽 "STY-25" 절부터 끝까지 이어 붙임. HEAD 쪽 4274~4287 "반영 대기" 14행만 버림(스크립트로 14행 모두 4274~4287인지 확인). 번역_가이드·CHANGELOG는 양쪽 유지 |
| 5 | claude/unity-pc-ui-minor6-20261104 | 19216c411 | 1b50d4680 | `NativeLobby.SilverCharacter.cs` 주석 1줄, `UNITY_DEATH_SCREEN_20261103.md`, `CHANGELOG_SYNC.md` | L1안: SilverCharacter 주석은 unity/main 쪽(아래 코드는 양쪽 같음). DEATH_SCREEN은 양쪽 절(HEAD → 빈 줄 1개 → 브랜치). CHANGELOG 양쪽 유지. 두 파일 모두 combo4와 바이트까지 같음 |
| 6 | claude/unity-cloud-white-disc-20261104 (D2, Mac 3D PASS) | 17967874a | 27ee154ad | 없음 | — |
| 7 | claude/unity-cloud-crash-p1-fix-20261104 (P1, Mac PASS) | 50f530c02 | ec8561386 | `CHANGELOG_SYNC.md` 1곳 | 양쪽 유지. 위치 정정: 7번 커밋 메시지에 "맨 위"라고 적었으나 실제 충돌은 **파일 끝**(브랜치가 L11 줄을 끝에 붙임, HEAD 끝에는 4번의 STY-24 절)이다. 결과는 STY-24 절 다음에 L11 줄. 커밋은 고치지 않고 여기에 사실만 적는다 |

## 2. 검사 (병합 뒤 트리 ec8561386)

| # | 검사 | 결과 |
|---|---|---|
| ① | 충돌 표식 `^<<<<<<< `·`^>>>>>>> ` | 병합으로 생긴 것 0. 바뀐 218파일은 모두 sparse 안이라 작업 트리 grep으로 전수 확인. 걸린 4곳은 루트 `game.html.bak_20260611_conflictfix`(옛 stash 백업, unity/main과 같고 이번에 안 바뀜) |
| ② | 줄 끝(줄 수 / CRLF 수 / 외톨이 CR) | `CHANGELOG_SYNC.md` 58176/58176/0, `번역대상_전체목록.md` 10734/10734/0, `번역_가이드.md` 308/0/0(LF 파일), `UNITY_DEATH_SCREEN` 211/0/0, `SilverCharacter.cs` 275/0/0, `NativeStageClearOverlay.cs` 364줄 중 CRLF 282(원래 섞인 파일, L1 값과 같음) |
| ③ | combo4(a8618d9bf) 대비 `unity/Assets`·`unity/ProjectSettings` 차이 | 4파일뿐: `KiImpactView.cs`(D2), `NativeEnemyRigRenderer.cs`·`NativeGame.PauseFocus.cs`·`Vfx/CombatImpactView.cs`(P1). 네 파일 모두 각 브랜치 끝과 같다. combo4 갈라진 뒤 unity/main 신규분은 이 두 경로에 없고 `unity/Tools/devtools/*` 12파일(모두 unity/main과 같음)과 docs에만 있다 |
| ④ | `merge-base --is-ancestor` | 328331f91·08f969779·b9fb5dd63 포함. 7개 원 SHA와 9196a515d도 포함 |
| ⑤ | node 정적 검사 | 아래 표 |

| 검사 | 결과 | 비고 |
|---|---|---|
| `demo-flavor-tests/contracts.cjs` | 8/0 PASS | |
| `death-ui-tests/ui-minor6.test.cjs` | 7/7 PASS | |
| `options-wave2/run.cjs` | 소스 검사 32 PASS, dotnet 단계 실행 못 함 | L1과 같음 |
| `death-ui-tests/importer`·`judge6`·`skill-chip`·`candidate` | PASS | |
| `field-prepare-wait-tests/abort-contract`·`capture-contract`·`root-guard` | PASS | |
| `death-ui-tests/death-d2.test.cjs` | FAIL(D2-2 ko 4264 문구 기대값) | unity/main·combo4에서도 FAIL — 기존 결함 |
| `death-ui-tests/retouch-layout.test.cjs` | FAIL(count 14px) | unity/main·combo4에서도 FAIL — 기존 결함 |
| `death-ui-tests/review-0540.test.cjs` | **FAIL 1/5** | unity/main PASS, combo4 FAIL. options-wave2의 P38 리셋 확인 대화창(`NativePauseMenu.A15Web.cs` 485·486행 `ActionPlate`)에 `settingsChip:true`가 없음. 설정 화면 안 버튼이 가시 판으로 그려질 수 있다(표시 결함, 크래시 아님). combo4 판정에 이미 들어 있던 상태. 담당: options-wave2 후속. Mac에서 리셋 확인창 버튼을 볼 것 |
| `combat-impact-tests/run-ki.cjs` 등 | 실행 못 함 | Windows dotnet 경로 필요 |

## 3. 최종

- 최종 SHA: 이 문서 커밋(아래 CHANGELOG 줄과 함께) — 보고 메시지에 적는다. 병합 끝 커밋은 `ec8561386`.
- push: 이 브랜치에만 비강제. PR은 base unity/main draft.

## 4. Mac 확인 목록 (이 브랜치의 정확한 SHA로)

1. 빌드 1회(컴파일 오류 0).
2. `--remodel3d` 1-1 완주 1판(크래시 0, 피격 시 베이지 원판·흰 섬광 0 — D2).
3. 제품명 `EXODUSER: HELL LORD`(ProjectSettings productName) 창·실행 파일·저장 폴더.
4. 옛 full 세이브 이어하기 1회(demo-flavor 세이브 루트 고정, `NativeFlavorSavePaths.FullRoot`).
5. 피격 원판 0(3D 경로, 근접·원거리 각 1회).
6. 로비 0·1·2명(1명 빈 슬롯 틀은 기존 결함으로 기록만).
7. 설정 탭: 언어·프리셋 저장/불러오기·BGM·커서·그래픽 행, **리셋 확인창 버튼 판 모양(review-0540 FAIL 항목)**.

## 5. 남은 docs 후속 (L1 §6, 이 레인 범위 밖)

- `번역대상_전체목록.md` "오후 문서 동기화 감사" 표의 4274~4287("미반영")·4261 상태 갱신.
- `15 세이브+데이터구조.md`에 Unity `opt.lang`·프리셋 슬롯 JSON 추가.
