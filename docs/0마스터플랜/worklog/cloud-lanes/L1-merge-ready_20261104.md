# L1 merge-ready — 병합 대기 5개 브랜치 사전 점검 (11-04, 클라우드)

- 레인: L1 merge-ready, 브랜치 `claude/unity-cloud-mergeready-20261104`. 읽기·병합 시험만 했고 코드는 고치지 않았다.
- **기준이 바뀌었다:** 지시서의 기준은 `e3d8d6a54`였지만, 점검 시점의 origin/unity/main은 `2f9fb68ab`다(e3d8d6a54 위에 devtools 병합 `codex/pc-devtools-fix-20261102 7ff5bb472`가 더 쌓임). 아래 결과는 모두 `2f9fb68ab` 기준이다.
- 이 환경에서 하지 않은 것: 컴파일(PC에서 확인 필요), 화면 검수(Mac에서 확인 필요), dotnet 계약 검사(dotnet 없음).

## 1. 결과 표

| 브랜치 | SHA 일치 | FF | 충돌(쌓는 순서 기준) | Core | 세이브·직렬화 | CRLF | 번역 등록 | docs 누락 | 판정 |
|---|---|---|---|---|---|---|---|---|---|
| demo-flavor-fix | ac4e187ae 일치 | **불가**. merge-base ba56124ab, unity/main이 31커밋 앞섬 | `CHANGELOG_SYNC.md` | 변경 없음 | **변경 있음, 위험 병합.** productName `EXODUSER · Unity 이식 검증판` → `EXODUSER: HELL LORD`(ProjectSettings·PortVerification). full flavor는 옛 루트에 고정(`NativeFlavorSavePaths.FullRoot`). demo·BIC·EA는 새 네임스페이스. 캐릭터 저장소·설정 저장 경로가 `NativeFlavorStorage.TryResolve`를 거침. 저장 스키마·코덱은 그대로 | 이상 없음. `NativeStageClearOverlay.cs`는 원래 줄 끝이 섞여 있었고(272/82), 새 10줄은 모두 CRLF라 282/82가 됨 | No.4261 등록(그 밖의 문구는 기존 No.3473·2824 참조) | 없음(15 세이브 경로표·CHANGELOG 갱신) | **주의**(세이브 경로 변경) |
| field-prepare-merge | 79d4d14f1 일치 | **불가**. merge-base dc838b5ab, 22커밋 뒤 | 없음 | 변경 없음 | 없음 | 이상 없음 | 새 표시 문자열 없음(메시 이름·로그만) | 없음 | **READY** |
| options-wave2 | 2cd42d3ab 일치 | **불가**. merge-base 70502a2b4, 14커밋 뒤 | `CHANGELOG_SYNC.md` | **변경 있음**(설정·BGM 정책만, 전투 수치·판정은 그대로): `NativeOptionSet`(Lang), `NativeSettingsJsonCodec`(ParseObject·ParseString), `LobbyLanguage.Startup`, `CharacterRoster.PlayableVisualIndex`(상수만 뺐고 동작은 같음), 새 Core 6개(`NativeBgmRotation`·`NativeBgmSelection`·`NativeCursorSteps`·`NativeGraphicsPolicy`·`NativeKeyFocus`·`NativeSettingsPreset`) | 설정 JSON `opt`에 `lang` 추가. 빈 값이면 쓰지 않고, 파서가 관대해 기존 파일과 호환됨. 프리셋 슬롯 JSON 연결 | 이상 없음(같은 혼합 파일 1개, 위와 같음) | No.4293~4299 등록. BGM 표시명은 기존 73개 재사용 | 15 세이브 문서에 Unity `opt.lang`과 프리셋 슬롯 구조가 없음(UI 문서 `UNITY_PAUSE_OPTIONS_PARITY`에만 있음) | **주의**(Core 폴더·설정 직렬화. demo-flavor 옛 커밋 포함, 아래 2절) |
| first-impression-tone | 479634337 일치 | **불가**. merge-base a04450ec8, 65커밋 뒤 | `번역_가이드.md`·`번역대상_전체목록.md`·`CHANGELOG_SYNC.md` | 변경 없음 | 없음 | 이상 없음 | No.4274~4287 상태 갱신. 새 번호 없음 | 병합 뒤 번역대상의 "오후 문서 동기화 감사" 표가 낡음(4274~4287 "미반영", 4261 "반영 완료로 보지 않음") | **주의**(번역 목록 충돌을 손으로 풀어야 함) |
| ui-minor6 | 19216c411 일치 | **불가**. merge-base 1fe5c4366, 83커밋 뒤 | `NativeLobby.SilverCharacter.cs`(주석 1줄만, 코드는 같음), `UNITY_DEATH_SCREEN_20261103.md`, `CHANGELOG_SYNC.md` | 변경 없음 | 없음 | 이상 없음 | 새 문자열 없음. 기존 키 `cancel`·`comingSoon`·`create`(29언어) 재사용. `K("전사","WARRIOR")`는 원래 있던 줄을 옮긴 것 | 없음 | **READY**(충돌이 단순함) |

- 인수인계 3절의 "FF 가능"(demo-flavor·field-prepare)은 이제 맞지 않는다. unity/main이 앞으로 나가서 5개 모두 `--no-ff` 병합이 필요하다.
- BLOCK은 없다. 5개를 순서대로 쌓는 병합 시험은 모두 통과했다(3절).

## 2. 의존·주의

1. **options-wave2에는 demo-flavor-fix의 옛 상태가 들어 있다**(8b7034ad까지와 그 뒤 병합분). R08 끝 문구 방어(a3e3a99f), 정규식 보정(ac4e187a), 검증 nit 문서(71b63674)는 빠져 있다. options-wave2를 demo-flavor보다 먼저, 또는 혼자 병합하면 demo-flavor 일부(세이브 경로 변경 포함)가 함께 들어온다. **반드시 demo-flavor-fix를 먼저 병합한다.** 순서대로 병합한 결과에서 `NativeDemoEndText.cs`와 `demo-flavor-tests/*`는 demo-flavor-fix 끝 커밋과 같다(확인함).
2. **demo-flavor 세이브 위험:**
   - productName이 바뀌면 `Application.persistentDataPath`가 바뀐다. full flavor는 Windows에서는 `LocalLow/ForDearGamers/EXODUSER · Unity 이식 검증판`, Mac Player에서는 옛 번들 ID 폴더로 돌린다.
   - PlayerPrefs 사용은 0건이다(Runtime 검색).
   - devtools 세이브 스냅샷은 회사 폴더 `LocalLow\ForDearGamers` 전체를 비교하므로 두 제품 폴더를 다 덮는다.
   - CTO 검증 PASS 기록은 있다(71b63674). 핸드오프 3절 "위험 병합은 독립 검증 1~3개"에 해당한다. 병합 뒤 Mac에서 옛 세이브 이어하기 1회를 권한다.
3. **options-wave2 바이너리:** mp3 11개(BGM P1 8곡 + 회전 3곡)와 커서 `.bytes` 24개(+meta)가 있다. sparse 작업본에서 병합할 때 이 파일들은 git이 객체로만 가져오고 작업 트리에는 펼치지 않는다. 병합에는 영향이 없다.
4. **Core 규칙(CLAUDE.md "Core 수치·판정 변경 금지"):** options-wave2의 Core 변경은 설정·언어·BGM·커서·그래픽 정책 코드다. 전투 수치와 판정 파일(EnergyShield·KiSlash·SkillRules 등)은 그대로다. 그래도 Core 폴더 변경이라 표에 표시했다.

## 3. 순서대로 쌓은 병합 시험 (로컬 임시 worktree, push 안 함)

기준 `2f9fb68ab` → demo-flavor-fix → field-prepare-merge → options-wave2 → first-impression-tone → ui-minor6. 단계마다 `merge --no-ff --no-commit`으로 시험했다.

| 단계 | 충돌 파일 | 해결 |
|---|---|---|
| 1 demo-flavor-fix | `docs/CHANGELOG_SYNC.md` 맨 위 1곳 | 양쪽 줄 유지(HEAD 먼저, 그다음 브랜치) |
| 2 field-prepare-merge | 없음 | — |
| 3 options-wave2 | `docs/CHANGELOG_SYNC.md` 맨 위 1곳 | 양쪽 줄 유지 |
| 4 first-impression-tone | `CHANGELOG_SYNC.md` | 양쪽 줄 유지 |
|  | `번역대상_전체목록.md`(STY-24 표 4274~4287) | **브랜치 쪽 4274~4287 행**(29언어 반영 상태)과 "STY-24 첫인상 29언어 문자열 검수" 절을 먼저 두고, HEAD 쪽 `## 2026-11-04 STY-25 …` 절부터 끝까지(4288~4299·BGM-P1·오후 감사)를 이어 붙인다. HEAD 쪽 4274~4287 "반영 대기" 행은 버린다 |
|  | `번역_가이드.md`(LF 파일) | 양쪽 절 유지("일시정지·설정 1차 연결 문구" 절과 "STY-24 용어표" 절) |
| 5 ui-minor6 | `NativeLobby.SilverCharacter.cs` 164행 주석 | **HEAD 주석 유지**("only while the run is wider than the 308px text column; names that fit stay 28pt"). 그 아래 코드는 unity/main `8ad7fa322`와 ui-minor6이 한 글자까지 같다 |
|  | `UNITY_DEATH_SCREEN_20261103.md` 끝 | 양쪽 절 유지(HEAD "병합 상태·태국어 조판 대조" 다음 빈 줄 1개, 그다음 "경미 7건 중 사망 결정 화면 3건") |
|  | `CHANGELOG_SYNC.md` | 양쪽 줄 유지 |

- 줄 끝(파일마다 줄 단위 CR 개수):
  - `CHANGELOG_SYNC.md`: 58171/58171줄 CRLF(기준 58085/58085).
  - `번역대상_전체목록.md`: 10735/10735 CRLF.
  - `번역_가이드.md`·`UNITY_DEATH_SCREEN`·`SilverCharacter.cs`: LF 0 CR, 기준과 같음.
- 결과 트리에 충돌 표시(`<<<<<<<`·`>>>>>>>`)는 docs·Runtime에 0개다.
- 결과 트리에서 돌린 node 정적 검사:
  - `demo-flavor-tests/contracts.cjs`: 8/0 PASS.
  - `death-ui-tests/ui-minor6.test.cjs`: 7/7 PASS.
  - `options-wave2/run.cjs`: 소스 검사 32 PASS. dotnet 단계는 실행하지 못함.
  - `field-prepare-wait-tests/run.cjs`, `recovery.cjs`, `death-ui-tests/run.cjs`의 .NET 부분은 dotnet이나 Windows 경로가 있어야 해서 **실행하지 못함**.
  - `retouch.cjs`는 `I:/EXODUSER-Storage/...` 결과 파일이 필요한 PC 전용 검사라 **실행하지 못함**.
- **컴파일 미확인(PC), 화면 미검수(Mac).**

## 4. combo4(a8618d9bf) = 5개 합 + 무엇?

- 5개 브랜치 끝 커밋은 모두 combo4의 조상이다. combo4에만 있는 커밋은 병합 커밋 11개와 docs 1개다. docs 1개는 `856d4eaa`로, combo3 병합이 남긴 CHANGELOG 충돌 표시를 지운 커밋이다. options-wave1(d7aac2ea7)도 병합돼 있지만 options-wave2에 이미 들어 있다.
- 순서대로 쌓은 시험 결과 트리(dc600459b)와 combo4 트리(4c18bea79)의 차이는 20개 파일이다.
  - 17개는 combo4가 갈라진 뒤 unity/main에 들어온 변경이다(devtools 실행기·selftest, CTO 인수인계, 보스 보드, HERO_MODULAR, DARK_DRUID 문서, CHANGELOG). 시험 결과에서 이 파일들은 unity/main과 같다.
  - 남은 3개는 docs 절 순서와 빈 줄만 다르다: `번역대상_전체목록.md`(STY-24 검수 절 위치), `번역_가이드.md`(두 절 순서), `UNITY_DEATH_SCREEN`(빈 줄 1개).
  - CHANGELOG는 combo4에만 있는 줄이 0개다. 시험 결과에만 있는 8줄은 모두 unity/main에서 왔다.
- **결론: Runtime·Editor·Resources·Tools 코드는 combo4와 바이트까지 같다.** combo4 판정 결과는 이 5개를 지금 unity/main에 병합한 결과에 그대로 쓸 수 있다. 판정 뒤 unity/main에 새로 들어온 것은 devtools·docs뿐이다.

## 5. 병합 명령 초안 (CTO, combo4 디자인 PASS 뒤)

핸드오프 6절 절차를 따른다. 클라우드에서는 새 clone(partial `--filter=blob:none`, sparse)에서 한다.

```bash
git fetch --depth=200 origin unity/main \
  claude/unity-pc-demo-flavor-fix-20261104 claude/unity-pc-field-prepare-merge-20261104 \
  claude/unity-pc-options-wave2-20261104 claude/unity-pc-first-impression-tone-20261104 \
  claude/unity-pc-ui-minor6-20261104
git checkout --detach origin/unity/main        # 2f9fb68ab인지 확인. 다르면 표를 다시 점검
for B in demo-flavor-fix:ac4e187ae field-prepare-merge:79d4d14f1 options-wave2:2cd42d3ab \
         first-impression-tone:479634337 ui-minor6:19216c411; do
  test "$(git rev-parse --short=9 origin/claude/unity-pc-${B%%:*}-20261104)" = "${B##*:}" || echo "SHA 바뀜: $B"
done

# 1) demo-flavor (CHANGELOG 양쪽 유지)
git merge --no-ff --no-commit origin/claude/unity-pc-demo-flavor-fix-20261104
#   → CHANGELOG 충돌 표시 3줄만 지우고 양쪽 줄 유지, CR 개수 확인
git add --sparse -- docs/CHANGELOG_SYNC.md
git commit -m "merge: claude/unity-pc-demo-flavor-fix-20261104 ac4e187ae — demo flavor 세이브 루트 고정·체험판 끝 문구 (combo4 디자인 PASS, CHANGELOG 양쪽 보존)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 2) field-prepare (충돌 없음)
git merge --no-ff origin/claude/unity-pc-field-prepare-merge-20261104 -m "merge: …field-prepare-merge 79d4d14f1 …

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 3) options-wave2 (CHANGELOG 양쪽 유지) — 반드시 1) 뒤
git merge --no-ff --no-commit origin/claude/unity-pc-options-wave2-20261104
git add --sparse -- docs/CHANGELOG_SYNC.md && git commit -m "merge: …options-wave2 2cd42d3ab …

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 4) first-impression (번역대상은 3절 표대로, 번역_가이드·CHANGELOG는 양쪽 유지)
git merge --no-ff --no-commit origin/claude/unity-pc-first-impression-tone-20261104
git add --sparse -- "docs/16번역·로컬라이제이션/번역대상_전체목록.md" "docs/16번역·로컬라이제이션/번역_가이드.md" docs/CHANGELOG_SYNC.md
git commit -m "merge: …first-impression-tone 479634337 …

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 5) ui-minor6 (SilverCharacter 주석은 HEAD, DEATH_SCREEN·CHANGELOG는 양쪽 유지)
git merge --no-ff --no-commit origin/claude/unity-pc-ui-minor6-20261104
git add --sparse -- unity/Assets/Exoduser/Runtime/NativeLobby.SilverCharacter.cs "docs/3.1 ui hud 디자인/UNITY_DEATH_SCREEN_20261103.md" docs/CHANGELOG_SYNC.md
git commit -m "merge: …ui-minor6 19216c411 …

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"

# 확인: 결과 트리의 Runtime·Editor·Resources·Tools가 combo4와 같은지
git diff --stat origin/claude/unity-pc-candidate-combo4-20261104 HEAD -- unity/Assets unity/ProjectSettings   # 0줄이어야 함
git push origin HEAD:refs/heads/unity/main      # 비강제
git ls-remote origin refs/heads/unity/main      # HEAD SHA와 대조
```

## 6. 병합 뒤 docs 후속 (병합 커밋에 넣거나 바로 다음 커밋으로)

1. `번역대상_전체목록.md`의 "오후 문서 동기화 감사 — No.4200 이상 상태" 표를 고친다. `4274~4287 | STY-24 제안14건, 미반영`은 "29언어 반영·문자열 검수 통과, 화면·원어민 미검증"으로 바꾼다. `4259~4260 / 4261`은 4261 반영(stageclear_labels demoWishlist)으로 바꾼다. CRLF를 유지한다.
2. `15 세이브+데이터구조.md`에 Unity 설정 파일 `opt.lang`(빈 값이면 생략, 29언어 코드)과 프리셋 슬롯 JSON(`{"opt":{…,"lang"},"binds","binds2"}`)을 적는다. 출처는 `UNITY_PAUSE_OPTIONS_PARITY_20261104.md` 350·420행이다.
3. 병합 뒤 BuildLoop 실행본 SHA를 확인하고, Mac에서 옛 full 세이브 이어하기를 1회 판정한다(demo-flavor 세이브 경로).
