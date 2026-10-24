# UNITY-HUD-01 — 원본 자원 HUD 값 어댑터

2026-10-24. 범위는 Unity의 기존 `PlayerState`를 읽는 순수 C# `HudValues.From(PlayerState)`다. Godot·웹·세이브·전투 자원 writer는 변경하지 않는다. 부모 담당 네이티브 렌더러와 실제 Unity 검증은 이 문서의 오프라인 값 검증과 별개다.

## 원본과 소유 범위

| 항목 | 기준·파일 | 상태 |
|---|---|---|
| 원본 스냅샷 | `godot/source_snapshot/game.html`, SHA-256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` | 핀 검사 |
| 원본 함수 | `updateHUD` 60248, `_hset` 60247, `_hudReadableNumber` 60241 | 현재 `G:/exoduser/game.html`과 함수 원문 3/3 일치 |
| 런타임 | `unity/Assets/Exoduser/Runtime/Core/HudValues.cs` | 읽기 전용 projection; Unity·DOM 의존성 없음 |
| 검증 도구 | `unity/Tools/hud-oracle/{export.cjs,run.cjs,HudTests.csproj,Program.cs,global.json,NuGet.Config,README.md,oracle.json}` | Tools Junction 실체는 I: |
| 검증 자료 | `I:/EXODUSER-Storage/qa/unity-hud-20261024` | 원본 VM oracle와 RED/GREEN JSON·로그·.NET 산출물 |

UI 문서 기준은 `docs/3.1 ui hud 디자인/exoduser-hud-redesign.md` 현행 자원 링 절과 `DEMO11_42_NATIVE_OWNER_HUD_20261021.md`의 독립 MP/ST·소수 절삭·비유효 owner 숨김 규칙이다. 원본 DOM `stFill`의 오래된 SP 명칭과 별개로, 이번 Unity 표시명은 ST다. 보호 설계 문서 `2_3`은 수정하지 않는다.

## 값 계약

| property / 원본 | 공식·문자 | 제한·의도 |
|---|---|---|
| `HpValid`, `ManaValid`, `StaminaValid`, `ExperienceValid` | 유효한 현재값·양수 분모. HP/MP 분모는 소수 절삭 후 양수여야 함 | 비유효 owner는 해당 ratio 0·문자 빈 값; HP translate 100·MP/ST translate 100 |
| `HpRatio` | `clamp(trunc(Hp)/trunc(MaxHp),0,1)` | 기존 float state를 읽기만 함 |
| `HpTranslatePercent` | `10 + (100-HpRatio*100)*.87`, 원본 `toFixed(2)`처럼 소수 2자리 | 유효 상태 full 10%, half 53.5%, empty 97%. 프레임에 가려진 위10%·아래3% 반영 |
| `ManaRatio`, `ManaTranslatePercent` | `clamp(trunc(Mana)/trunc(MaxMana),0,1)`, `(1-ratio)*100` | 오른쪽 오브 왼쪽 파랑 반구 owner |
| `StaminaRatio`, `StaminaTranslatePercent` | `clamp(Stamina/MaxStamina,0,1)`, `(1-ratio)*100` | 오른쪽 오브 오른쪽 초록 반구. 수위는 소수를 유지 |
| `HpCurrentText`, `HpMaximumText` | `trunc(Hp)`, `/ {trunc(MaxHp)}` | HP 최대 앞 공백 1개는 원본 그대로 |
| `ManaCurrentText`, `ManaMaximumText` | `trunc(Mana)`, `/{trunc(MaxMana)}` | 현재값 ceil 금지 |
| `StaminaCurrentText`, `StaminaMaximumText` | `trunc(Stamina)`, `/{trunc(MaxStamina)}` | 수위 분모는 원값, 문자만 절삭 |
| `ShieldRatio` | `MaxShield>0 ? clamp(Shield/MaxShield,0,1) : 0` | 0이면 링 숨김; 숫자 추가 없음 |
| `ShieldAlpha` | 유효 쉴드 분모일 때 `max(.1,Shield/MaxShield)`, 아니면0 | raw ratio여서 overfill이면1 초과 가능. 원본 gradient 색 alpha는 `.9*ShieldAlpha`, glow alpha는 `.5*ShieldAlpha` |
| `PoiseEyes` | `[hpEyeL,hpEyeR,mpEyeL,mpEyeR]`, 각 index가 `index >= 4-poise` | `pStun`이면 poise0; 2.9는 마지막2개, .5는0개. 원본 느린 경로의 실제 class 결과 대조 |
| `ExperienceRatio` | `Experience/MaxExperience` | 원본 width처럼 유효 상태 추가 clamp 없음 |
| `ExperienceText` | `max(0,Experience)`와 양수 최대를 en-US 정수 grouping, `현재 / 최대` | 원본 `_hudReadableNumber`; 4/15, 1,234/15,000 검증 |

모든 계산은 기존 `PlayerState`를 변경하지 않는다. 원본 `updateHUD`는 HP/MP 최대값을 직접 절삭하지만 native adapter는 분모의 지역 복사만 절삭한다. 보통의 게임 자원 범위인 유한 signed-32bit 내 상태를 이식 동등성 범위로 삼는다. JavaScript `~~`의 32bit wrap·비유효 NaN 분모 동작을 게임 UI로 재현하지 않는다. `From(null)`은 `ArgumentNullException`이며 가짜 PlayerState를 만들지 않는다.

## TDD와 증거

오라클은 원본 세 함수를 그대로 VM에서 실행한다. leaf DOM에 실제 원본이 기록한 HP/MP/ST transform·문자·쉴드 gradient·경험치 width·포이즈 class를 보존한다. 나머지 장비/지역/콤보는 빈 상태 stub이며 장비 `eq0` guard에서 원본이 반환한다. 렌더러 구현의 계산을 복제해 기대값을 만들지 않는다.

`export.cjs`는 동일한 fixture를 versioned `Tools/hud-oracle/oracle.json`과 외부 검증 디렉터리에 기록한다. `run.cjs`는 versioned fixture를 읽으므로 Core + Tools 복원본과 Node/.NET SDK만 있으면 비어 있는 새 `--out`에서도 실행된다. 기존 외부 `oracle.json`에 의존하지 않는다. 재export는 원본 스냅샷·현재 G: 원본·Acorn을 요구하고 원문 일치 검증을 유지한다. versioned fixture로만 재실행한 결과를 이후 시점의 live 함수 재검증으로 보고하지 않는다.

| 자료 | 결과·범위 |
|---|---|
| `hud-red-01.json` | C# 빌드 성공 뒤 adapter 부재 검증 1건 FAIL. 의도한 기능 부재 RED |
| `hud-green-01.json` | 110/110. 원본 15상태와 초기 guard |
| `hud-green-02.json` | 130/130. 비율 자체·빈 최대문자·비유한 현재값·0쉴드 최대·절삭 후0분모 보강 |
| `fresh-out-versioned/hud-restored-fixture.json` | 130/130. 재export로 원문 3/3 재확인 후, 기존 외부 fixture가 없는 새 출력 폴더에서 versioned fixture만 읽음. 완전한 파일 복원 실험은 부모 통합 검증 별도 |
| `regressions/hud-regression-ki.json` | 기존 기검참 93/93 |
| `regressions/hud-regression-poise.json` | 기존 포이즈 7/7 |
| `regressions/hud-regression-feedback.json` | 기존 피드백 26/26 |

상태는 full/half/empty/fractional, MP와 ST 각각 독립10%·90%, overfill, 최소 shield, shield max0, poise3/2.9/.5/stun, XP grouping/overfill이다. 각 원본 case에서 어댑터 호출 전후 PlayerState 전체 직렬화를 대조해 mutation0도 확인한다.

모든 C# 빌드는 경고0·오류0. 최초 RED와 별도 회귀 실행에 .NET SDK의 workload 조회 안내가 출력됐지만, 빌드·DLL 검사는 정상 종료했다. 추가 workload 설치나 환경 변경은 하지 않았다. 기본 공격/맵 36건은 이 에이전트가 재실행하지 않았으며 부모의 통합 검증과 구분한다.

## 미포함·판정 한계

실제 Unity UI 렌더링·clip·색·아이콘·폰트·화면 배치는 부모 담당이며 이 테스트가 visual PASS를 뜻하지 않는다. DOT poison/burn 효과, 기동게이지 owner, pot cooldown, 스킬 잠금/언락, 인벤토리, 저장, HUD 전체 갱신 주기(원본 빠른3f/느린30f), 장비·CP·지역 표시를 이 값 어댑터가 새로 구현하지 않는다. PlayerState에 MaxPoise owner가 없어 원본 MP 프레임 full-poise glow 조건도 여기서는 만들지 않는다. 자원 또는 스킬 구현 범위를 표시만으로 확장하지 않는다.
