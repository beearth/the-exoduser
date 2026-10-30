# B07b — 칼등 처내기(E) 타격 피해·포이즈·패링 뱅크·게이지 표시 (PC, 2026-10-27)

B07 Core(`UNITY_B07_CORE_20261026.md` §6 "구현하지 않은 것")의 후속. 근거: `UNITY_B07_WEB_EXTRACT_20261026.md` 표 A-3·A-6·A-8, 웹 `game.html` 커밋본(HEAD) `sBash` 분기 + `_gSlamHit`(함수 전체 실행).

## 1. 이번에 되는 것

| 항목 | 웹 | Unity |
|---|---|---|
| E 타격 순간 | `P.st2<=12 && P.st2+sp>12` (sBash 진입 8프레임째 1회) | `Simulation.BashStrikeMoment` → `BashStrike()` (`Core/Simulation.BashStrike.cs`) |
| 타격 반경 | `_eSwingRadius(chg)` = `floor((70+bonusRange×4)×_eSkillRangeMul×chg)` | `ParryRules.SwingRadius` (기존, oracle 대조 완료) |
| 타격 피해 | `~~(meleeRef×2.0×(1+(Lv≥1?(Lv-1)×.21:0))×statStr×pShieldMul×chg)+_atkBon`, 이어서 `_gSlamHit`: `~~(dmg×pAtkMul)+_atkBon` | `ParryRules.BashDamage` + `SlamBaseDamage`; `_atkBon`은 sBash 진입(`SBashFire`)에서 `~~(ST비용×1.5)`로 세팅, 첫 읽기에서 0으로 소비 |
| 적 피해 | `hurtE(e, ~~(dmg×elMul(el,e.el)), ang, false, {kbMult:1.5, noPoise:true, noImpact:true}, el)` + 넉백 8px | 기존 Core `ApplyEnemyDamage`(= `EnemyHurt.Head/Body`)로만 넣음. 피해 공식 새로 만들지 않음 |
| 적 포이즈·스턴 | 보스 `_poiseHit(maxPoise×0.25)`; 일반몹 미니스턴 60f, 포이즈 0이면 `min(300,150+(Lv-1)×15)×mult`f 풀스턴 + `체간 붕괴!` / `미니스턴!` / `약점!` | `ParryRules.SlamHitTarget`(판정) + `PoiseHitEnemy`(보스) |
| 연출 | 진동파 `maxR=범위×1.6, maxT=35, col #66aadd`, shake 10 + 18 | `SlamWave.Bash`(푸른 회색 틴트), `HurtShake` |
| kiGather 해방 | `_kgRelease`가 `_sBashChgMul`(1~3)을 세팅하고 같은 sBash로 진입 → 같은 타격에 배율만 곱해짐 | 기존 `SBashChgMul` 경로 그대로, 타격이 이 배율을 읽음 |
| Q 캔슬 | `sRecover` 중 Q → 보호막 | `TickPlayerCombat` Q 진입 조건에 `sRecover` 추가 |
| parryBank | 적 근접 패링 `P.parryBank += e.atk||10`, 보스 반격 `+= _pd` | `Simulation.ParryBank`, `Parry`(`e.atk||10`)·`TryParry`(반격 피해) |
| 기동 게이지 HUD | Shift 슬롯 아래 3px 막대, 폭 = 게이지/최대, 색 `#44ffaa`(가득) / `#88ccff`(반 이상) / `#ff8844` | `NativeHud.DrawChainGauge` |

## 2. 검증

- **dash-parry-oracle**: 원본 `_gsDmg2` 줄과 `_gSlamHit` 함수 전체를 Node VM에서 실행(`export.cjs` 신규 섹션 `bashDamage` 2,700 사례 / `slamHit` 6,000 사례; 소스 = 커밋본 `git show HEAD:game.html`). 래퍼가 선언한 스텁은 `shQuery`(1체)·`hurtE`·`_poiseHit`·`addTxt`·`pAtkMul` 등 기록용뿐. `elMul`·`dst`·`_MINI_STUN`은 원문. **187,165 checks / 0 failures**(B07 기존 146,580에 신규 40,585 포함; `runs/green-04.json`). 민감도: `MiniStun` 60→61 변이 시 655건 실패 후 되돌림(`runs/mutation-ministun.json`).
- **skill-sim-test**: E 탭→sBash→8프레임째 타격(근접 적 피해·범위 밖 무피해·미니스턴·푸른 진동파·x3 배율 반경 210·Q가 sRecover를 보호막으로 캔슬) 포함 67 checks / 0 failures.
- **Unity 6000.6.7f1**: 아래 §4.

## 3. 미이식 (사유)

| 항목 | 사유 |
|---|---|
| 투사체 반사(E: 일반탄→블루콩 변환, 빨콩→유도 블루콩, 무지개탄 폭발) | 반사된 탄이 **아군 투사체**로 적을 쫓아 맞히는 파이프(`friendly/homing/_aoeR`)가 Unity에 없다. 드루이드 보스 탄은 기존대로 `HurtPlayer` 경로에서 패링 판정만 하고(B09 문서의 `sBash` 패링 편차 유지) 반사하지 않는다. 투사체 담당과 함께 설계 필요 |
| sBash/sRecover의 Shift 사슬 캔슬, sRecover 종료 시 E 홀드 → sDraw 재진입 | 웹 캔슬 분기는 `P.chargeStocks`(스톡) 소비를 포함한다(33600대). Unity의 사슬은 `HarpGauge` 기반이라 두 계통의 관계를 확인한 뒤에 옮긴다(미확인) |
| 적 근접 패링 포인트 20곳 중 이미 이식된 적 AI/드루이드 보스가 부르는 `Parry`/`TryParry` 외 | 호출 지점은 해당 적 이동기가 이식될 때 함께 들어온다(포이즈 20 등 수치는 `Parry`/`TryParry`에 이미 있음) |
| 실버테일 전진 패링, 유니크 훅(`_uKiPrecharge` 등) | 실버테일 캐릭터·유니크 시스템 미이식 |
| 머리 위 게이지 숫자(홀드·비행·대시 중)와 갑옷 슬롯 원형 쿨 오버레이 | HUD 갑옷 슬롯 없음(월드 텍스트 뷰 미연결). Shift 슬롯 막대만 이식 |
| 스탯 뱅크 소비처(`detonate`/`whirlDet` 폭발) | 해당 스킬 미이식 — 값(`ParryBank`)만 쌓음 |
| 타격 SFX/파편 입자 | 뷰/오디오 소관(수치에 영향 없음) |

## 2026-10-31 무료 기본 불꽃칼날 후속

현재 _ensureBaseWingStrike·_autoShieldThrow·합체 파동·Q/E 원본 표시의 후속 구현과 검수 경계는 [UNITY_QE_BASE_FUSION_20261031.md](UNITY_QE_BASE_FUSION_20261031.md)를 따른다. 이 문서의 과거 미이식 표기는 해당 새 게이트에서만 대체한다. 무지개탄 Q 전용 규칙은 유지한다.

2026-10-31 정정: 현재 기검3타 자세의 Q홀드 취소도 원본 _tryKiSlashQCancel에 연결했다. wWindup/wSwing/wRecover·MP10·Q쿨0에서 그 틱 이동 없이 sBlock 진입, 충전 중이면 충전/콤보0이다. 원본 실제 update와1,040틱 차이0. 상세 근거와 같은 Player 게이트는 [Q/E·기검 정합](UNITY_QE_BASE_FUSION_20261031.md)을 따른다.
