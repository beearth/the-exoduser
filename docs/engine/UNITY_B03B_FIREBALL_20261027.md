# B03b — 악의구(fireball, E 마법 슬롯) 이식 (PC, 2026-10-27)

맥북 총괄 B03 판정(4스킬 통과, 악의구 누락·Ctrl 기본값·HUD 슬롯)에 대한 후속. 코드 = `unity/Assets/Exoduser/Runtime/Core/Skills/Simulation.Fireball.cs`, 공식 = `SkillRules.cs` "악의구" 절.

## 웹 원본 대조 (game.html 작업 트리 기준 줄)

| 항목 | 웹 | Unity |
|---|---|---|
| 입력 | `isHeld('beam')`(기본 mouse2) 이고 `P.mp>=mpCost('magic')` 이고 idle — 무기·E·Q 분기 뒤 (33205) | `SetMagicInput` ← `NativeKeyBindInput.Held("beam")`, 패널 열림 중 차단, 무기 공격 동시 입력 시 무기가 우선 |
| MP | `mpCost('magic')` = `~~(10 × 1 × pMagicCost)` (`_COST_SK`에 magic 없음 → 스킬 Lv 계수 1) | `SkillRules.MpCost("magic",1,…)`, `CostBase("magic")=10` |
| 시전 | `st2=~~(14/pMagicSpd())`, `pMagicSpd=(2+pMagic×.08)×(1+castSpeed+headbandCastSpd)` → 기본 7f (29087) | `MagicCastSpeed()` |
| 보너스 | `P._mpBon = useMp('magic')×2` (=+20) | `magicMpBonus` |
| 피해 | `~~(magicRef×statInt×pMagicMul×_skMul('fireball')×_fuseMul)+_mpBon`, b13.2 g10.56 (33641) | `SkillRules.FireballDamage` (+보너스) |
| 투사체 | 속도 5.5, 반경 12→`~~(12×(1+(Lv-1)×.5))`로 비행 중 성장, 폭발 반경 `~~(80×배율)`, 폭발 피해 `~~(dmg×.6)`, 사거리 `400+(Lv-1)×50`, 속성 D(3), 넉백 kbMult .1 (33641~33646) | `FireballSpeed/…/Range` |
| 유도 | 4프레임마다 반경 280 안 최근접 적, 회전 한도 .35 rad (35327~35345) | `TickMaliceOrbs` |
| 벽 | 마법 투사체 = 최대 3회 반사(반사 직후 6f 유도 차단), 4번째 벽에서 폭발 (35365~35395) | 동일 |
| 폭발 | 사거리 끝·벽·적 접촉 시 `_fireballExplode`: 반경 내 모든 적 `elMul(D,e.el)×악의약화`, 직격 별도 피해 없음 (24710) | `OrbExplode` |
| 중독 | `poison=1, poisonT=max(…,600), poisonStk+1(최대 10), <10이면 _poisonPool += pDotPool×dmg×2` | 동일 (`pDotPool`=1, 침식 패시브 미이식) |
| 악의 약화 | 적당 스택 +1(최대 10), 배율 `1+스택×(.3+maliceWeakAmp)`, 같은 악의구의 직격+폭발은 1스택·같은 배율(`p._mwMul`), 타이머 없음 | `MaliceWeakMul`, `EnemySpawn._mwStk` |
| 후딜 | `magicRecover` 12f, 홀드 중이면 즉시 재시전 | `TickMagicStates` |

## 표시
- 투사체: 웹 `vfx_magic_orb.png`(171px 셀 7×3, 20프레임, `lighter`, 크기 `r×5`)를 `Resources/Art/vfx/skill_malice_orb_sheet.png`로 복사, 프레임 `~~(ms×.12+x×.1)%20`. 꼬리 = 14점 가산 리본(웹 `_drawMaliceOrbTrail`의 연기+불꽃+코어 3겹은 단순화: **디자인 미검수**).
- HUD 슬롯: RMB 칼등 처내기·Shift 사슬 이동·E 악의구·Q 패링 아이콘을 웹 `_slotSkId`(28775~28784)처럼 상시 표시. RMB·Shift·Q는 표시만(실행은 B07 범위).
- 스킬창: `Ported("fireball")`=true → E 슬롯 Lv 표시·강화 가능(SP 1, 레벨 제한 `min(20,⌊LV/50⌋+1)`).

## 미이식 / 차이
- 악의구 유니크 훅(U-D01 반향 구체·U-D02 독성 파열·U-D14·U-D22), 합체 `_fuseMul`, 패드 자동조준, `hm().bonusRange`, 컨트롤러 조건.
- `P.activeMagicSk`의 다른 후보(omniBeam·elemMissile·blueShot·fireAura·fireBeam·arcLaser 등)와 슬롯 교체: `SkillBook.MagicSkill`은 현재 `"fireball"` 고정, 세이브하지 않음.
- 꼬리 리본의 연기 레이어, 임팩트(`_addImpact`) 파편.

## Ctrl 기본값 확인 결과 (명세 2번과 달라 변경하지 않음)
새 캐릭터의 Ctrl은 웹에서도 **얼음보주**다. 근거: `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` 372~375행("기검참+얼음보주는 난이도 무관 항상 지급", 2026-09-30 수정 전에는 Ctrl이 미습득 뇌전걸음으로 남아 무반응이었음) · game.html `P.skills.iceOrb=1` + `P.activeCtSk='iceOrb'`(HEAD 62282·62590~62591, `ghostWalk`는 `mkP` 초기값과 세이브 폴백일 뿐 새 캐릭터 시작 경로가 곧바로 덮어씀). `iceOrb`가 Ctrl 후보 목록에 있는 것(`skill_defs_web.json` Ctrl 슬롯 `ghostWalk,timeWarp,iceOrb`)과 별개로 기본 지급 스킬이다. 뇌전걸음(ghostWalk)은 슬롯 교체로만 쓰이며 이식은 후속.

## 검증
- `unity/Tools/skill-sim-test` 58 checks / 0 failures (악의구 13건 추가: 시작 상태, 입력→시전→발사 7f, MP 10, 폭발 피해·중독 1스택·악의 약화 1스택, 후딜 12f, MP 부족, 홀드 연사, 사거리 끝 폭발, 무기 공격 우선, Lv3 반경/사거리, 세이브 왕복, 구세이브 Lv1 보정).
- `Runtime/**/*.cs` 전체를 PC 에디터(6000.4.8f1)의 UnityEngine DLL로 csc 컴파일 → 오류 0. 6000.6.7f1 import·compile은 PC에 에디터가 없어 **미실행**(맥 확인 필요).
- 실플레이 화면(투사체·HUD 아이콘) 캡처는 미수행.
