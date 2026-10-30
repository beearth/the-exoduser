# B07 돌진·패링·방패·포이즈 oracle (원본 함수 실행 대조)

오프라인 개발 도구다. JavaScript는 이 export에서만 실행하고 Unity Player에는 들어가지 않는다. 손으로 옮긴 기대값은 없다 — `oracle.json`의 모든 `out`은 `export.cjs`가 **원본 `game.html`의 함수·문장 블록을 Node VM에서 실행한 결과**다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/dash-parry-oracle/export.cjs --source G:/exoduser/game.html      # oracle.json 생성
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/dash-parry-oracle/export.cjs --check                            # 원본이 바뀌었는지(블록 sha256) 확인, 다르면 종료 코드 1
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/dash-parry-oracle/run.cjs --project <unity 폴더> --out <runs 폴더> --label <이름>   # .NET 8로 Core/*.cs와 전체 대조
```

- 대조 대상 C#: `Runtime/Core/{Js,ParryRules,ParryRewards,ChainDash,PlayerPoise,EnemyPoiseRules}.cs`(UnityEngine 의존 없음). `Runtime/Core/` 평면(하위 폴더 금지: 기존 검사 프로젝트가 `Core/*.cs` 와일드카드).
- `export.cjs`는 줄 번호가 아니라 **앵커 문자열**(줄 첫머리)로 블록을 찾고, 그 줄 범위와 sha256을 `oracle.json.blocks`에 기록한다. 앵커가 없으면 즉시 실패(`source drift`), `--check`는 블록 해시가 다르면 거절한다. `source.sha256`은 추출 당시 game.html 파일 해시(작업 트리 파일이라 미커밋 수정이 섞일 수 있음).
- 설계: 검사 격자는 `grid()`(축마다 단일 값 변화 + 시드 고정 난수 조합)와 전수 곱(작은 섹션)으로 만든다. 입력 격자는 장비 값 0/경계/최대, 단 1/2/3, 보스/일반, 빨콩/무지개/일반, 창 경계 프레임 ±1 등을 포함한다.
- 비교 허용오차: 부동소수 상대 1e-9, 정수·불리언·문자열은 정확 일치.

## 래퍼 (원문을 실행하기 위한 최소 전역)

각 섹션은 `with(scope)` 안에서 원문을 실행한다. `scope`에 선언된 이름만 값을 돌려주고, 선언되지 않은 이름은 함수 스코프(원문이 선언한 `var`/`function`)에서 찾으며 없으면 `ReferenceError`로 실패한다 — **숨은 스텁 없음**. 아래 이름만 “아무 일도 안 하는 함수”(오디오·텍스트·파티클·펫/유니크 훅)로 허용했다(`oracle.json.wrapper.noops`에도 기록):
`_addBoom`, `_addSkProf`, `_autoShieldThrow`, `_cancelProjCharge`, `_dark02Impact`, `_gpVibrate`, `_petOnParry`, `_petSayCD`, `_playSwordBack`, `_r`, `_rainbowImpact`, `_startSilvertailAttackMotion`, `addParts`, `addTxt`, `doHitFlash`, `playSample`, `poolPart`, `showPH` (+ `SFX.*` 호출 전부 무동작 Proxy).

섹션별 선언 값(입력으로 받는 것): `P`(상태 객체), `PASSIVES`, `_eqAffix(k)`/`_lEq(k)`(어픽스 값 테이블), `sh()`/`wp()`/`ar()`/`bt()`(장비 필드), `window._parryLesson`, `G`/`OPT`(hitStop·shake·mats), `EL`(원문 줄을 그대로 실행), `_HS`·`_HARP_*`(원문 상수 줄을 그대로 실행), `_rageMax()`·`_HARP_GAUGE_MAX`·`_harpGauge`(입력값). 장비·패시브 조회(`_eqAffix`, `PASSIVES`)는 흉내 내지 않고 **값 테이블을 인자로 주입**한다.

## 섹션 (검사 수는 `runs/green-03.json`)

| 섹션 | 실행한 원문 |
|---|---|
| parryTicks / isPWin / gate / swing / sblock* | `_lParryWinTicks`·`_lSbParryT`(16624-16625), `isPWin`(38471), 투사체 루프 `_sbPW`~`_rbDeflR` 문장(34852-34864), `_wingStrikeLevel`/`_eSkillRangeMul`/`_eSwingRadius`(3491-3493), `_sBlockChargeRadius`/`_sBlockProjectileZone`(14313-14320) |
| projectile / passives / parryProjDmg | `_projectileParryClass`·`_eCanReflectProjectile`·`_physicalProjectileMultiplier`·`_isPhysicalMouthProjectile`(16913-17044), `pParry*`·`pGuardAbsorb`·`pCharge*`(28022-28055), `pParryProjDmg`(28038) |
| doParry | **함수 전체**(38472-38577)를 실행, 결과는 `P.iframes/hp/st/mp/poise/rage`, `G.mats/hitStop/slowMo/shake`, `_harpGauge` |
| harpDist / chainTier / chainRelease / gaugeRegen / gaugeMax / chainPull / chainFlight / chainStep / chainLanding / chainCancelTier | `_harpDistTier`·`_harpAvailableDist`(12852-12866), 단 판정 3줄(13338-13341, 32170-32173 두 곳이 같음을 확인), 릴리즈 문장(13342-13357), 회복 문장(32168), 게이지 최대·스톡(32785-32791, 63460-63465 두 곳 일치 확인), 끌림 시작(32250-32257), 비행(32237-32239), 끌림 한 프레임·착지(32264, 32363-32378), 칼등 캔슬 단(33528) |
| focusState / playerHit / blockBranch / stunExit | `_isFocusState`(43415), 비-DOT 피격 포이즈 블록(43584-43588), 해제 패링·평화보호·Q 보호막 분기 전체(43442-43497), `stagger`/`pStun` 탈출 case(34333-34347) |
| poiseHit / poiseAmount / groggyDamage / enemyFrame | `_poiseHit`·`_poiseReset`(19974-20007), `hurtE` 포이즈 양(42268, 42488-42491), 그로기 ×1.5(42338), 적 타이머·그로기 종료·일반몹 회복(34451-34456, 38618-38638, 38663-38666) |
| shieldCost / sRecover / kiGather / sBashFire / sBashStrike / sdTap / sBlockEnter / sBlockTick / sBlockRelease | `stCost('shield')`(31988), `sRecover`(33533), kiGather 단계·릴리즈·불발·자동 릴리즈(33712-33734), `_kgRelease`·`_sBashFire`·`_sdTapOk`(38448-38470), 타격 순간(33411), Q 진입·홀드·해제(14306-14308, 33741-33761) |

## 실행 기록 (`runs/`)

- `red.log`: 구현이 없는 프로젝트에 빌드 → 컴파일 오류(API 부재)로 기대 실패.
- `green-01.log`: 첫 빌드가 상수·메서드 이름 충돌(`SBlockRelease`) 컴파일 오류.
- `green-02.json`: 146,580검사 중 867 실패. 원인은 C#이 아니라 **oracle 래퍼** 2건(수정 전): ① 칼등 포이즈 양 섹션이 원문의 `amt`를 읽지 않고 호출 스텁 값을 비교(`poiseAmount`), ② kiGather 불발 줄을 `else{addTxt(...불발...)` 접두어로 찾다 파일 앞쪽의 다른 줄을 잡음(`kiGather`) → 앵커를 “release 줄의 다음 줄 + `else{addTxt(P.x,P.y-30,_T(` 검증”으로 교체.
- `green-03.json`: **146,580 checks / 0 failures**.
- `mutation-poise-or4.json`: C#에서 웹 특이사항 `(P.poise||4)-1`을 `P.poise-1`로 바꾸면 440 실패 → 검사가 민감함을 확인(바꾼 코드는 되돌림).


2026-10-31: `_T`는 문자열 그대로 반환하고, 인자 치환은 같은 원본 묶음의 `localization-runtime.js`를 실제 실행한다. 무반환 텍스트 스텁으로 최신 `format` 호출을 막지 않는다. 기절 탈출 입력은 최신 `_canMobility`/`activateMobility`에 연결하며 기존 오라클 입력 필드명은 호환 유지한다. 최신 원본 187,165검사/불일치0.
