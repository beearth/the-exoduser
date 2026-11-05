## 기본 공격 1타 예비 6틱 — 2026-11-05 (Unity Core, 사용자 결정 D-MO-2)

사용자 결정(11-05 "6틱, 총 길이 유지"): 기본 공격 **1타**에 예비(wWindup) 6틱을 넣고 회복에서 6틱을 빼 총 길이를 유지한다. 정답은 `unity/Assets/Exoduser/Runtime/Core/Simulation.cs`(상수 `BasicWindupTicks=6`, `BasicRecoverFloor=4`, `AttackRecoverBaseTicks()`, `AttackRecoverTicks()`)이다. 조사: [CW_INVESTIGATION_20261105](../0마스터플랜/worklog/cloud-lanes/CW_INVESTIGATION_20261105.md), 브리프: [BRIEF_CORE_WINDUP_20261105](../0마스터플랜/worklog/cloud-lanes/BRIEF_CORE_WINDUP_20261105.md).

| 구간 | 상태 | 틱 | 식 | 비고 |
|---|---|---|---|---|
| 예비 | `wWindup`(`Player.BasicWindup=true`, `KiChargeActive=false`) | **6 고정** | `BasicWindupTicks` | 공격 속도(WeaponSpeed×AttackSpeedMultiplier) 영향 없음. ST는 입력 틱에 차감. 입력 무시, 이동 .8배(swing과 같음), 조준각은 매 틱 Facing 갱신(기존 wWindup 충전 규칙과 동일) |
| 스윙 | `wSwing` | 5 | 고정 | 접점(HitArc)은 swing 3번째 틱(st2 3) → 입력 기준 **9틱째**(이전 3틱째, +6) |
| 회복 | `wRecover` | **28**(시작 장비) | `max(recoverBase − 6, 4)`, `recoverBase=(int)(16/((WeaponSpeed 또는 .3)×AttackSpeedMultiplier))` | 시작 장비 .45×1.0336 → base 34 → 28. 하한 4는 `WeaponSpeed×AttackSpeedMultiplier > 1.6`부터 걸린다(그 구간만 총 길이가 늘어난다) |
| 합계 | — | **39**(시작 장비) | 6+5+28 = 이전 0+5+34 | 다음 입력 가능 틱(사이클 40)·DPS 동일 |

- **1타 판정:** 일반 무기(`ActiveAttack!="kiSlash"`)는 Core에 콤보 추적이 없어 모든 스윙이 1타다. 기검참은 다음 발사 단계가 1일 때(`KiComboStep%3==0`, 즉 콤보 없음 또는 3타 뒤)만 1타이고, 2타는 즉시 wSwing(회복 base), 3타는 기존 충전 wWindup(`KiChargeActive=true`) 그대로다. 기검참 1타 검기는 swing 시작 틱(입력+6)에 발사된다.
- **기검참 콤보 창:** 웹은 입력 틱에 `_cresComboT=120`. Unity 1타 검기는 입력+6에 발사되므로 발사 직후 `KiComboTicks -= 6`(=114)로 **입력 기준 120틱**을 유지한다(다음 공격 가능 틱의 잔여 80 = 웹. 보정 전에는 86이었다, Mac 확인 11-05). `KiCooldownTicks`(12/20)는 발사 틱 기준 그대로이며 Core 어디서도 판정에 쓰이지 않는다.
- **예비 중 입력:** 구르기(Space)·스킬 키는 swing 중과 같이 자세를 끊는다. Q·E는 idle/sRecover에서만 들어가므로 예비·swing·recover 모두 불가(기존과 같음). 피격은 swing 중과 같이 포이즈 −1·stagger(`KiChargeActive=false`이므로 충전 면제 없음).
- **표현 구분:** `Player.BasicWindup`로 기검참 충전과 구분한다. 리그픽셀(`NativeHeroMotion.cs` `case "wWindup"`)은 1타 예비면 충전 포즈가 아니라 기존 idle/run 포즈를 유지하고 swing 시작에 기존 idle→Swing 전이를 쓴다(Mac 확인 11-05: 충전 포즈로 보내면 입력 틱과 예비 끝에 두 번 튄다). 예비 전용 동작 클립은 동작 파이프라인(MO 레인) 몫. 스프라이트 경로(`NativeGame.cs:443-444`, 공격 시트가 틱 0부터, windup 22·recover 34 식 복제)는 현행 유지하고 기록만 한다.
- **검증:** PC 컴파일 0·Core 43/0·ki-slash-oracle 94/0·first-practice 88/0(CTO 전달). Mac 실게임(dfacd981d): 1타 6/5/28 합 39, HitArc 입력+8(상태 기준; 입력 틱을 0으로 셈), 피해 동일, 기검 2·3타·홀드 충전 전 구간 동일. 콤보 창 보정·표현 분기(이 절의 두 항목)는 후속 커밋이며 PC·Mac 재확인 대기. 손 기대값을 바꾼 하네스: `unity/Tools/Tests/Program.cs`, `unity/Tools/ki-slash-oracle/Program.cs`, `unity/Tools/first-practice/Program.cs`, `Runtime/NativeGame.B05Smoke.cs`.

### Core ↔ 웹 oracle 의도된 차이 (기본 공격 틱)

| 항목 | 웹 game.html | Unity Core | 판정 |
|---|---|---|---|
| 기본 공격 1타 진입 | idle → `wSwing 5` 즉시(33055·33564). 비충전 `wWindup` 분기(33355)는 Charge Finisher(34078)만 사용 | idle → `wWindup 6` → `wSwing 5` | **의도된 차이**(사용자 결정 11-05). oracle 비교에서 이 항목만 허용, 다른 불일치는 FAIL |
| 1타 회복 | `~~(16/(spd×mul))` | `max(base−6, 4)` | 의도된 차이(총 길이 유지). `x>1.6`에서는 총 길이가 웹보다 1~9틱 길다 |
| 기검참 콤보 창 | 입력 틱에 `_cresComboT=120` | 발사(입력+6) 뒤 `KiComboTicks=114` → 입력 기준 120 | 동일(보정으로 맞춤) |
| 기검참 2타·3타, 접점 위치(swing 안 st2 3), 피해식, ST, 이동 배율 | 그대로 | 그대로 | 동일 |

## Native 공격속도·회복 — 2026-10-15 현행

| 항목 | 현재 계약 |
|---|---|
| 실제 소비 | 일반/Ki wSwing5 유지, 후딜=ToInt32(16/((wp.spd 또는 .3)×현재 statDex×(1+meleeAtkSpd+glovesAtkSpd))). E는 별도 ToInt32(28/(1+pParry×.1)). 원 counter0과 render OR1 구분. Warrior .85/Silver1.5는 표시 전용. |
| 검수·한계 | Main/Player2 scripts, 새runtime22/actualMain GPU3/error0. 원식12 configuration·실제frame485 sample 일치. 이전 통과군/원 asset·PNG 재검0. 장비 UI/save·전체 이식/시각 완료 주장0. |
| SSOT / 후보 | FDG_GODOT_NATIVE_FIRST_20261013.md native-attack-tempo-20261015 절 참조. 새 native-review-attack-tempo-20261015 후보는camera0b8/wave693도 포함, 초기정지/명시선택/수동재개. latest_full_game=false/기존RETOUCH. 아래 속도미채택 문장은 이전 이력. |

> **2026-10-15 현재 LMB 공격값 연결:** actual source provider의 현재 무기/강화/affix/baseAtk/STR·레벨/봉인/패시브 계산을 Main→Player→Crescent·기존 melee 피해 소비에 연결했다. 원0.7을7.0으로 바꾸지 않았다. [현재 계약·검수 한계](../engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15).

| API / 범위 | 현재 계약 |
|---|---|
| Main.read_native_attack_parameters()(0) / Player.get_native_attack_parameters()(0) | fresh 현재 provider packet;미공급NR/요청비용 전 거부. 기본 원raw식과Ki meleeRef식을 구분한다. |
| Crescent.configure | 기존5인자,반환bool. current melee_ref×7×statStr1×current pAtkMul×스킬배율×차지배율,기존ToInt32. 일반타격은current pre×pAtkMul×pMeleeMul1+기존ST보너스. |
| 검수 / 남은 범위 | 4guard PASS+고정RNG 기대실패5→exact R VM oracle로교정한5PASS=9고유/첫전체clean아님. 실제공격packet→기존Enemy피해API소비;공간충돌·공개실전미증명. 속도/binds/held/SFX·전체피해/동적환경미완,latestfullfalse. |

# 기본공격 데미지 3배 (2026-09-10)

사용자 지시: 기본공격이 약해서 존재감이 없으므로 현재 대비 약3배 상향. 적용 범위는 공용 좌클릭 평타·기검참, 기본 자동/일반 석궁이다. 캐릭터·무기 타입에 상관없이 해당 공격 경로에 적용된다.

| id / 적용 위치 | 이전 | 현재 | 유지 항목 |
|---|---|---|---|
| wSwing → hitArc | floor((P.baseAtk+무기atk+강화atk+15)×2) | floor((P.baseAtk+무기atk+강화atk+15)×6) | hitArc의 pAtkMul×pMeleeMul 및 ST 소비 가산 _atkBon 유지; 무기 기반 부분3배 |
| _SK_MUL.kiSlash | b:4, g:3.36 | b:12, g:10.08 | _skMul=b+(Lv−1)×g×0.5 |
| 기검참 일반 콤보 | 7×_skMul | 7×_skMul | Lv1=84, Lv10=401.52, Lv20=754.32배/타; meleeRef×statStr×pAtkMul 곱 후 정수화 |
| bowRecover 캔슬 검기 | 1.2/1.2/2×이전 _skMul | 7/7/7×현재 _skMul | 후속 초반 밸런스 수정: 발사 직후에도 일반 콤보와 동일 피해. 기존 일반 대비17.14%/17.14%/28.57% 경로 제거 |
| _fireXbow | floor((bowRef×pBowMul×pXbowMul×무기atkMul+28)×(_gxFiring 또는1)) | 이전 정수 결과×3 | 자동 normal·ghostXbowTurret 폴백, 장비·패시브·터렛·고정28 포함 |
| fireBow | floor(bowRef×pBowMul×10)+_bowBon | 이전 결과×3 | 악의오브1/발, 보너스 소모/reset, 관통0 |
| _skSpecificDetails(kiSlash) | 오래된 1.2/1.2/2, 레벨당100% | 일반 콤보별7×현재레벨 _SK_MUL, 레벨당+35.28배 | 표시 레벨 slv에 따라 계산, 소수2자리 |

공격속도·선후딜·소모 자원·범위·속도·관통·애니메이션·소리는 바꾸지 않는다. 회전참, 선택형 석궁 스킬, 우클릭 마법, E 처내기/차징, 패링 반사 배율은 이번 수정 범위가 아니다. 반사 최소치는 기존 고정14×이며 현재 기검참1타와 같은 값이라는 과거 설명만 정정한다. 평타 ST 소비 가산은3배에 포함되지 않으며, 그 외 정수 반올림·적 방어·속성 적용으로 표시 피해 비율은 미세하게 달라질 수 있다.

검증은 `test/basicAttackDamage.test.js`에서 실제 _fireXbow/fireBow/스윙 분기/_skMul을 실행한다. 자동 석궁388→1164, 터렛582→1746, 일반 석궁(보너스 포함)2010→6030, 평타 입력140→420 및 Lv1/10/20 기검참3배를 확인한다. 기존 `test/kiSlashSwingSound.test.js`의 3단 콤보 소리 검사도 유지한다. 실행파일 재패키징은 포함하지 않는다.
## 2026-10-16 기본 자동 석궁의 ST 비용 적용 위치

| 구분 | 현행 계약 |
|---|---|
| 피해·발수 | 기존 _fireXbow 산식·발수·관통·전설 발사 확률/RNG 그대로 |
| 자원 소유 | _fireXbow는 기존 emitter. 실제 _autoFireBowSkill normal 라우터가 문서상 ST 비용을 발사 전 보관값에서 차감 (R h190) |
| ST 식 | (1.5+(fanShotLv 또는0)*1.5)*_stDisc('bow'), 결과ST=max(0,보관ST−비용). 기존 터렛 할인 적용 |
| 호출 gate / 한계 | 기존 update의 P.st>P.mst*0.2 유지. 새 발사성공/잔량 gate·환불 없음. 기존 발사 예외는 후행 차감에 도달하지 않음 |

이번 신규6군·구문1은 actual router/할인 함수와 합성 발사·ST/할인 provider의 검사다. 위 2026-09-10 피해 검사나 기존 성공 증거를 재연하지 않았고, 실제 피해·발수·공격속도·ST 실전 지속시간·native·패키지 플레이 통과를 추가한 것이 아니다.

### 2026-10-31 손맛 표현 분리

| 범위 | 현재 계약 |
|---|---|
| feel=0/1 | HP·데미지·공속·쿨다운·기검참 선후딜·Q/E/Shift 판정 불변. 전역 hitStop0 유지 |
| 표현 시간 | 접점 그림2틱 유지/총8틱, 피격 표식140ms. 전투 시간에 적용하지 않음. [전체 상수](../5.1임펙트디자인/VFX_구현가이드.md#웹-전투-표현-ab--2026-10-31) |
