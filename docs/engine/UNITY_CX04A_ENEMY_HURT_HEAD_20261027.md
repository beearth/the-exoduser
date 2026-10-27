# CX-04a — 적 피격 처리 `hurtE` 앞부분(관문·피해 배율·에너지쉴드) Core + oracle (2026-10-27)

담당: 단순작업2(Sonnet, 보스전 총괄 전속). 명세: 보스전 총괄 `E:/exoduser-wt/_out/pc-cx04a/SPEC.md`. 마스터 보드 C01, 보스전 보드 CX-04a. 선행 CX-03a(같은 브랜치 tip `a05ee1467`).
범위: `hurtE`(약 1,010줄)를 a/b/c로 자른 것 중 **a** — 함수 첫 줄부터 `// ═══ 데미지 → HP 직행 ═══` 앞 줄까지. 관문(조기 반환), 레어몹·etype별 방어, 엘리트·오라 감소, 감전·저주·STR·속성·어픽스·전설·패시브 배율, 최소 1 보장, 이원 판정 플래그, 타입별 %, 디버프 약화, 분노 스킬, 치명타, 스턴·빙결 ×1.5, **에너지쉴드 흡수**. 피해 값과 적 상태, 바깥 함수 호출 순서만 옮긴다.

## 1. 원본 (game.html sha256 `e096ab5c99310d9d…`, 65,767줄, origin/main `fce195067`, 커밋된 blob)

입력은 `git show fce195067:game.html`(커밋된 blob; 작업 폴더 game.html은 다른 세션의 미커밋 편집이 있어 쓰지 않음). 처음 c0463b47c 기준(로컬 HEAD)으로 만들었다가 보스전 총괄 지시로 fce195067(STY-D9 원격 반영)로 다시 뽑았다: **H1 구간 sha와 의존 함수 sha가 모두 같고 줄 번호만 +3**(hurtE 선언 42178), 케이스 결과도 동일.

| 구간 | 줄 | sha256(앞 16자) |
|---|---|---|
| H1 `hurtE` 앞(함수 선언 다음 줄 ~ 앵커 앞 줄) | 42179~42420 (선언 42178, 끝 앵커 `// ═══ 데미지 → HP 직행 ═══` 42421) | 47417deb26a6a61b |
| 같이 실행한 원문 | `elMul` 14407, `ar` 16566, `wp` 16563, `nc` 16572, `rg1` 16573, `rg2` 16574, `dst` 31788, `_UNDEAD_ET` 24794, `ELP` 55536, `ELC` 14401, `EL` 14396 | |

두 앵커 모두 **정확히 1줄**과 일치함을 export가 확인한다. 범위 안에 STY-D9(fb4c929aa) 변경 줄은 없다(CX-04c 구간).

## 2. 감싸개 원문 (원문에 덧붙인 텍스트는 이것뿐)

```js
function __H1(e,dmg,ang,noSound,opts,atkEl=0){           // 원문 첫 줄, 이름만 변경
  <원문 42179~42420줄 그대로>
return {dmg,atkEl,isDot,_shBlocked,kbM,psM,_isPure,_isArrow,_isGunpowder,_isMagicDmg,_cbAf,_cbPas,_isRageSk,_isCrit};}finally{_shBufI--}}
```

반환 지역값(= CX-04b 인계 표): `dmg`, `atkEl`, `isDot`, `_shBlocked`, `kbM`, `psM`, `_isPure`, `_isArrow`, `_isGunpowder`, `_isMagicDmg`, `_cbAf`, `_cbPas`, `_isRageSk`, `_isCrit` — export가 원문에서 `try{` 직후 중괄호 깊이 0의 `const/let`과 모든 `var`를 스캔해 뽑는다(`_ksFC`·`_lDagForce`·`_elAx`는 안쪽 블록 지역이라 제외). `try{`는 범위 안(원문 42181행)에서 열린다.

## 3. 새 파일 (`unity/Assets/Exoduser/Runtime/Core/` 평면, 각 .meta 포함)

| 파일 | 내용 |
|---|---|
| `EnemyHurt.cs` | 손으로 옮긴 포트 `EnemyHurt.Head(...)` + `ElMul` |
| `EnemyHurtContext.cs` | `EnemyHurtContext`(전역 값 + 주입 delegate), `EnemyHurtPlayer`(P), `EnemyHurtOpts`(opts), `EnemyProjectile`, `EnemyHitSfx`, `EnemyHurtLogEntry`, `EnemyHurtHeadResult` |
| `EnemySpawn.Hurt.cs` | `EnemySpawn` partial에 nullable 필드 12개 (`_mgActive`,`_bcActive`,`_isGhoul`,`_freezeImmune`,`_aDefM`,`_burning`,`_poisoned`,`_slowed`,`_freezeSlow`,`_comboBmT`,`bleedPool`,`_lReactF`) |
| `EnemyHurtTables.cs` | `ELP`(입자 색), `_UNDEAD_ET` (oracle에서 생성) |
| `unity/Tools/enemy-hurt-oracle/` | export · gen-cs · Program · csproj · run*.cjs · run-mutants · RedStub · oracle.json · README |

### API

```csharp
EnemyHurtHeadResult r = EnemyHurt.Head(ctx, e, dmg, ang /*double?*/, noSound, opts /*null = opts 없음*/, atkEl);
// r == null  → 웹 hurtE가 이 범위 안에서 return (아무것도 더 하지 않음)
// r != null  → CX-04b가 이어받을 값: r.dmg, r.atkEl, r.isDot, r._shBlocked, r.kbM, r.psM, r._isPure, r._isArrow, r._isGunpowder, r._isMagicDmg, r._cbAf, r._cbPas, r._isRageSk, r._isCrit
```

`ctx.ShBufI`는 `try/finally`로 웹처럼 들어갈 때 +1, 나올 때 -1(조기 반환 포함). `opts`의 값은 `bool?`/`double?`이고 안 쓴 키는 `undefined`(null)다. `isDot`·`_isArrow`·`_isGunpowder`·`_isMagicDmg`는 `opts&&opts.dot` 같은 식 때문에 웹에서 `undefined`/`false`/`true` 세 값이 될 수 있어 `bool?`로 그대로 둔다.

## 4. 같이 실행한 의존 함수와 판정 근거

| 함수 | 줄 | 본문 | 판정 |
|---|---|---|---|
| `elMul(a,d)` | 14407 | `EL` 상수만 읽는 비교 표 | **같이 실행** (순수) → C# `ElMul(double?, double?)` |
| `ar()` `wp()` `nc()` `rg1()` `rg2()` | 16566~16574 | `INV.equipped.X\|\|{}` 읽기만 | **같이 실행** → C#은 `ArmorEl`·`WeaponEl`·`NecklaceDmg` … 값 (케이스가 `INV.equipped`를 정함) |
| `dst(a,b,c,d)` | 31788 | `Math.sqrt` 거리 | **같이 실행** (순수) → C# `Dst` |
| `_UNDEAD_ET`, `ELP`, `ELC`, `EL` | 24794, 55536, 14401, 14396 | 표 | **같이 실행** → `EnemyHurtTables` 생성 / `EnemyFactory.ElementColors` |
| `_eqAffix`·`_lEq`·`_uEq` | 28033, 16682, 16574 | 전역 캐시(`_eqAffixCache`)를 만들며 `INV` 전체 스캔 | **주입** (순수 아님, 장비 시스템) |
| `statStr` `statCrit` `statCritDmg` `pAtkMul` `meleeRef` | 28055~28832 | `_eqLckTotal`·`_passDmgSum`·`enhMulAtk` 등 다른 주입 대상을 부름 | **주입** (명세 목록) |
| `pDotPool` `_predBonus` `_hunterMul` | 28130, 28078, 27954 | `PASSIVES`만 읽는 순수 함수이나 명세 주입 목록 | **주입** — 호출 순서를 기록하려고 (패시브 값은 케이스 값) |
| `_petOnAtk` `shQuery` `_hitSfxForEtype` `hurtE` `hurtP` `_spawnBossProjectile` | | 전역 카운터/버퍼 변경·`Math.random`·재귀·플레이어 피해 | **주입** |

## 5. 주입 함수 표 (C#은 `EnemyHurtContext` delegate, oracle은 같은 이름의 기록용 스텁)

| 웹 이름 | C# delegate | 인자 | 반환/효과 규칙(oracle) |
|---|---|---|---|
| `_eqAffix` `_lEq` `_uEq` | `EqAffix` `LEq` `UEq` | key | 케이스의 키→값 표, 없으면 0 |
| `statStr` `statCrit` `statCritDmg` `pAtkMul` `meleeRef` `pDotPool` | 같은 이름(Pascal) | | 케이스 값 |
| `_predBonus` `_hunterMul` | `PredBonus` `HunterMul` | e | 케이스 값 |
| `_petOnAtk` | `PetOnAtk` | | 기록(`_shBufI` 값 포함) |
| `shQuery` | `ShQuery` | x,y,r | `ens` 중 거리 ≤ r, 입력 순서 (기록에 `_shBufI` 포함) |
| `hurtE` (재귀) | `HurtEnemy` | e,dmg,ang,noSound,opts | 기록만 |
| `window._parryLesson.hurtEnemy` | `ParryLessonHurt` | e,dmg,ang,opts | 기록만 |
| `hurtP` | `HurtPlayer` | dmg | 기록만 |
| `_spawnBossProjectile` | `SpawnBossProjectile` | e,obj | 기록만 (객체는 키 정렬 쌍) |
| `addTxt` | `AddText` | x,y,text,color,life[,size,text2] | 기록만 (인자 5개 또는 7개) |
| `addParts` `shake` `doHitFlash` `playSample` `SFX.block` | `AddParts` `Shake` `DoHitFlash` `PlaySample` `Block` | | 기록만 |
| `_hitSfxForEtype` | `HitSfxForEtype` | etype | `{key:'hit_'+et, pitch:1+et/1000}` |
| `_T` | `Translate` | s | `s` (기록) |
| `Math.random` | `Random` | | 케이스의 `seq`를 순서대로 |

oracle 전체 기록: 주입 호출 17,283개 (parryLessonHurt 32, petOnAtk 829, shQuery 564, hitSfxForEtype 480, playSample 480, statStr 694, eqAffix 9971, predBonus 672, hunterMul 672, statCrit 672, addTxt 491, hurtP 2, T 133, shake 2, doHitFlash 2, spawnBossProjectile 5, pDotPool 93, sfxBlock 13, lEq 918, addParts 71, uEq 172, statCritDmg 227, hurtE 44, meleeRef 22, pAtkMul 22).

## 6. 조기 반환 지점 (C# `Head`가 `null`)

| # | 조건 | 비고 |
|---|---|---|
| 1 | `window._parryLesson?.active` | 교습 위임 `hurtEnemy` 호출 후 반환 (`_shBufI` 건드리기 전) |
| 2 | `!e` 또는 `!e.alive` | 〃 |
| 3 | `e.hp<=0` | 〃 (이후 `_btDmgLog`·`_shBufI`·`_petOnAtk`는 일어나지 않음) |
| 4 | `reviveIframes>0 && !isDot` | 91 → 90 상한, 맞을 때마다 1 감소; `_shBufI`는 finally로 균형 |
| 5 | 거울방어(`_mgActive`·`bossMirrorGuard`) / 폭발반격(`_bcActive`·`bossBurstCounter`) | 반격 후 반환 (`hurtP`·글자·흔들림·플래시·`P.iframes=15`) |
| 6 | etype 92 + 속성 공격(비DOT) | 흡수 누적, 가득 차면 되돌려 발사 (`_spawnBossProjectile`) |
| 7 | etype 40 위상변환 중 / etype 57 웅크림 | 무적 반환 |
| 8 | etype 85 회피 (난수 <.25, 비DOT) | 파티클 후 반환 |

oracle: 케이스 960개 중 조기 반환 288, 범위 끝까지 도달 672.

## 7. 난수 소비 지점 (Math.random 3곳)

| 위치 | 조건 | 소비 |
|---|---|---|
| etype 85 회피 | etype 85 · 비DOT (앞의 여러 배율·방어 감소를 지난 뒤) | 1회, `<.25` |
| elemConvert | `atkEl===0 && _eqAffix('elemConvert')>0` (단락 평가) | 1회 — **조건 앞쪽이 거짓이면 안 뽑음**, 뒤쪽 `wp().el>0`은 난수 뒤 |
| 치명타 판정 | **항상** (`Math.random()*100<statCrit()+_crBonus`가 `||`의 왼쪽) | 1회 — 단검 강제/극참의가 이미 참이어도 먼저 뽑음. `statCrit()` 호출은 난수 뒤 |

### 조기 반환·난수·에너지쉴드에서 주의할 곳 3개
1. **치명타 난수는 늘 뽑고, 그 뒤에 `statCrit()`을 부른다.** 전설 단검·극참의가 치명을 보장해도 난수 1회는 소비되고, 이 난수는 elemConvert(최대 1회)·85 회피(1회)보다 **뒤**에 온다. 순서가 바뀌면 이후 모든 케이스의 수열이 밀린다.
2. **`_shBlocked`는 쉴드 흡수보다 먼저 쓰이는데 그때는 늘 false다.** 최소 1 보장(`dmg<1&&!_shBlocked`)은 쉴드 계산 *앞*이라, 배율 뒤 0.4 같은 값은 먼저 1로 올라가고 그 1을 쉴드가 흡수한다. "쉴드가 막은 경우 0 유지" 주석은 죽은 논리다(웹 그대로 옮김). `_shBlocked=true`는 흡수로 `dmg`가 정확히 0이 될 때만 쉴드 블록 끝에서 켜진다.
3. **JS 거짓 판정·`undefined` 산술을 그대로 재현했다.** `P._killMul`이 없으면 `1+undefined=NaN → ~~NaN=0`이라 `dmg`가 0이 되고(그 뒤 최소 1로 복구), `PASSIVES.pBow`가 없으면 `pBow*.15=NaN`이라 타입별 % 전체가 버려지며(`_tyAx>0` 거짓), `e._lReactF`가 0이면 `||-9999`로 취급된다. `~~`는 2^32 래핑이다.

## 8. 에너지쉴드 계약 대조 (CLAUDE.md 계약 vs 웹 원문, 고치지 않고 보고)

| 계약 | 웹 원문 | 판정 |
|---|---|---|
| 쉴드 = HP와 동일한 추가 HP바 | `e.eShield`/`e.eShieldMax`, `eShieldMax>0 && eShield>0`일 때만 흡수 | 일치 |
| 모든 DR·배율 적용 후 쉴드→HP 순서 | 흡수는 범위의 맨 끝, 스턴/빙결 ×1.5·보스 파란콩 10% 확정 뒤 | 일치 |
| 쉴드가 남아 있는 한 HP 피해 0 | `dmg=max(0,dmg-_shAbs)` — 이 범위에서 `dmg`가 남은 양(오버플로우)만 CX-04b로 감 | 일치 |
| 오버플로우만 HP로(추가 패널티 없음) | 같은 식, 별도 패널티 없음 | 일치 |
| DOT 제외, `shieldHit:true`면 DOT도 쉴드 | `(!isDot\|\|(opts&&opts.shieldHit))` | 일치 |
| 플레이어/몬스터 공통(`eShieldMax>0`) | 이 범위는 몬스터 쪽 | 일치(플레이어 쪽은 범위 밖) |
| 흡수량 글자 | `_shAbs>0 && !isDot`일 때 `addTxt(...,String(_shAbs),'#66ddff',45,48,String(_shAbs))` | 일치 (DOT면 글자 없음) |

**계약에 없는 동작(보고만)**
- `opts.pure`(순수 데미지)의 주석은 "쉴드/관통률 무시, HP 직격"이지만 흡수 조건에 `_isPure` 검사가 **없다** — 순수 데미지도 쉴드에 흡수된다(oracle 케이스 `eshield absorb pure…`로 확인). 주석과 동작이 어긋난다.
- 최소 1 보장이 쉴드 앞이라 0.4처럼 작은 피해도 1로 올라간 뒤 흡수된다(위 주의점 2).
- `eShieldMax`가 0이면 `eShield>0`이어도 흡수하지 않는다(계약의 `eShieldMax>0` 조건과 일치).

## 9. 미이식 표

| 항목 | 처리 |
|---|---|
| `hurtE` 이후(HP 적용·흡수·onHit·경직·빙결 게이지·넉백·포이즈 / 사망 처리) | CX-04b / CX-04c |
| 장비·어픽스·전설·패시브 조회, `statCrit` 등 | 주입 |
| 다른 적에게 가는 연쇄 피해(`hurtE` 재귀), 플레이어 피해(`hurtP`) | 주입(기록만) |
| 글자·소리·파티클·플래시·흔들림, `_hitSfxForEtype`, `_T` | 주입(표현 전용, 호출 기록만 대조) |
| `shQuery` 공간 해시 버퍼 | 주입 (`_shBufI` 증감과 호출 시점 값만 대조) |
| `G._sStats` 객체 | `HasStats`·`StatCrits`로 축소 |
| `window._btDmgLog` | `List<EnemyHurtLogEntry>`(없으면 null) |

## 10. Codex `Simulation.ApplyEnemyDamage`와 웹의 차이 — 12개 (수정은 하지 않음)

| # | 차이 | 웹 `hurtE` 앞부분 | Codex |
|---|---|---|---|
| 1 | 대상 | 모든 etype·보스 | etype 0만 (그 외 `NotSupportedException`) |
| 2 | 관문 | 교습 위임, 죽은 적/`hp<=0`, `_btDmgLog`, `_shBufI`, `_petOnAtk` | `!Alive`·`Hp<=0`만; 교습 액터는 즉사 처리 |
| 3 | 부활 무적·반격 | `reviveIframes`, 거울방어/폭발반격 | 없음 |
| 4 | 레어몹·etype별 방어 | 92·91·93·99·40·41·57·6 방패·63·74·85 회피 | 없음 |
| 5 | DOT 풀 | 출혈·중독 풀 축적 | 없음 |
| 6 | 저항·감소 | 원소 저항, M14·수호 오라·M22 | 없음 |
| 7 | 상태 배율 | 감전 스택·번개→감전, 저주, STR, 신성력, 약화 3종, 전류장판, u_n02 | 없음 |
| 8 | 어픽스·패시브·전설 | 53개 키, 조건부 합연산, 타입별 %, 콤보, 분노, 벨트·부츠·창·반지 | `AccessoryDamageBonus` 단일 값만 |
| 9 | 최소 1 | 모든 배율 **뒤**, 쉴드 **앞** | 배율 **앞**(`Math.Max(1, damage)`) |
| 10 | 치명타 | 난수는 항상 1회, 서브타입 보너스·단검 강제·도끼 폭발·onCrit 프록 | `NextRandom()*100 < PlayerCriticalChance` 만, 부수 효과 없음 |
| 11 | 스턴/빙결 | 스턴 ×1.5 **와** 빙결 ×1.5 | 스턴 ×1.5만 |
| 12 | 쉴드 | `eShieldMax>0`, DOT는 `shieldHit`일 때만, 흡수 글자, double | `Shield`만 보고 항상 흡수, `(int)` 절삭 |

(그 외 형식 차이: Codex는 `int` 피해·`float`; 웹은 `~~` 래핑 double.)

## 11. 검사 결과 (standalone .NET 8 oracle, Unity 런타임 판정 아님)

oracle 케이스 960개(조기 반환 288 · 치명타 227 · 쉴드 블록 297 · 적 1,967마리 · 난수 735회): 명세 §4 격자 전부 — 관문·반격·레어몹 분기(흡수 누적/되돌려 발사)·etype 40/57/85(난수 경계 0.2499999/0.25/0.2500001)·etype6 방패(π/3 안팎·ang undefined·noSound)·원소 저항·63/74·M14/오라/M22(근처/없음/120 경계)·감전 0/1/9/10·번개 부여·어픽스 키별 켬/끔·crisisBoost 30% 경계·풍요 70%·killSlayer·전설 벨트/부츠(1회 소모)/창·최소 1·이원 플래그 조합 16종·약화 3종·전류장판·u_n02·분노 스킬·치명타 경계(9.99%/10%/10.0001%)·단검 강제·도끼 출혈 폭발·onCrit 프록 6종·전설 반지(쿨 119/120)·스턴/빙결 ×1.5·에너지쉴드 11종(DOT shieldHit 포함)·정수화(2^31 근처·3e9·−3e9·1e12) + 시드 고정 무작위 650.

| 항목 | 결과 |
|---|---|
| RED (`RedStub`: 아무것도 안 하는 `Head`) | **894,154 검사 중 8,130 실패**(기대 실패) |
| 첫 GREEN | 771,513 중 127 실패 — 전부 내 검사 프로그램 오류(생략된 `ang`/`opts` 키 처리), 구현 값 불일치 0 |
| **GREEN** | **933,221 checks / 0 failures** (960 케이스) |
| 변이 검사(구현을 일부러 틀림, 138개) | 1차 127개 사망 · 10개 생존 → 생존 원인마다 경계 케이스를 더하고 그 10개만 재실행 → 최종 **135개 사망, 생존 3개** = 전부 동치 변이: 『guardian aura <1 -> <=1』(수호 오라 배율이 정확히 1이면 곱해도 값이 같고 바로 다음 STR 단계의 ~~가 어차피 정수화하므로 결과 동일) · 『weakPj ignores pure』(pure이면 _isArrow가 항상 false라 투사체 약화 조건이 이미 거짓) · 『ring colour fallback changed』(ELC 길이 7이라 atkEl 1~6에서는 항상 값이 있어 대체 색에 도달 불가) |
| 회귀 CX-01 enemy-tables-oracle | **2784 checks / 0 failures** |
| 회귀 CX-02 enemy-spawn-oracle | **204592 checks / 0 failures (538 cases)** |
| 회귀 CX-03a enemy-tick-oracle | **3246746 checks / 0 failures (1240 cases)** |
| 회귀 verify-core.cjs (이 worktree) · CoreTests 컴파일 | **36 checks / 0 failures (verify-core.cjs를 unity/main과 같은 내용으로 고친 뒤 재실행)** |
| 실행 전후 사용자 PATH(HKCU 환경 변수 Path) | oracle 4종(CX-01·02·03a·04a)은 변화 없음. **첫 회귀 실행에서 수정 전 verify-core.cjs(c01 브랜치는 unity/main의 7c5a34ecb 이전 버전)가 사용자 PATH에 core-tests/dotnet-home/.dotnet/tools 폴더 1개를 추가했다**(938→1009자, 25→26항목). PATH는 직접 고치지 않고 보스전 총괄에 보고했으며, 보스전 총괄이 그 항목 1개를 제거했다. 원인인 verify-core.cjs는 unity/main과 같은 내용으로 고친 뒤 재실행해 PATH 불변을 확인했다. |

결과 파일: `E:/exoduser-wt/_out/pc-cx04a/runs/`.

## 12. 열린 항목·다음 단계

- **연결**: `Simulation.ApplyEnemyDamage`는 이 포트를 쓰지 않는다. 연결은 CX-04 세 단위 뒤 patch + PC_TO_MAC_INBOX(main·`unity/main` 두 곳).
- **CX-04b 착수에 필요한 것**: ① 이 `Head`의 반환 값(`r.dmg`가 오버플로우 피해, `r.kbM/psM`, `r._isCrit`, `r._isMagicDmg` 등)을 받아 `if(dmg > 0){` 이후를 옮긴다 ② 주입 대상 중 3b가 쓰는 것: 피격 경직·빙결 게이지·넉백에 필요한 플레이어/장비 값(`_onHit` 계열 어픽스 조회), `rollDrop` 류는 3c ③ `opts`는 이 포트의 `EnemyHurtOpts`에 3b가 읽는 키(`noStun`, `kbMult` 외)를 더 추가해야 할 수 있다 ④ `EnemySpawn` partial에 3b용 필드가 더 필요하다.
- **미확인**: `JsMath`·`Math.Pow` 비트 일치는 .NET 8 Windows에서만 확인(Mac·IL2CPP는 상태 3 인수 때).
- **docs**: 이번 단위는 웹 값을 읽었을 뿐 docs 수치를 바꾸지 않았다. `pure` 주석/동작 불일치(§8)는 설계 결정 사항이라 보고만 한다.
