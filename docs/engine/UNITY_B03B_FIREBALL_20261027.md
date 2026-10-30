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
- 투사체: 웹 `vfx_magic_orb.png`(171px 셀 7×3, 20프레임, `lighter`, 크기 `r×5`)를 `Resources/Art/vfx/skill_malice_orb_sheet.png`로 복사, 프레임 `~~(ms×.12+x×.1)%20`. 꼬리는 아래 2026-10-30 수정 계약을 따른다. 실제 Player·웹 대조 전 시각 미검증.
- HUD 슬롯: RMB 칼등 처내기·Shift 사슬 이동·E 악의구·Q 패링 아이콘을 웹 `_slotSkId`(28775~28784)처럼 상시 표시. RMB·Shift·Q는 표시만(실행은 B07 범위).
- 스킬창: `Ported("fireball")`=true → E 슬롯 Lv 표시·강화 가능(SP 1, 레벨 제한 `min(20,⌊LV/50⌋+1)`).

## 미이식 / 차이
- 악의구 유니크 훅(U-D01 반향 구체·U-D02 독성 파열·U-D14·U-D22), 합체 `_fuseMul`, 패드 자동조준, `hm().bonusRange`, 컨트롤러 조건.
- `P.activeMagicSk`의 다른 후보(omniBeam·elemMissile·blueShot·fireAura·fireBeam·arcLaser 등)와 슬롯 교체: `SkillBook.MagicSkill`은 현재 `"fireball"` 고정, 세이브하지 않음.
- 악의구 외 일반 임팩트(`_addImpact`)의 모든 표현. 악의구 꼬리 연기·폭발 시트·방사 잔불은 아래 후속에서 구현.

## Ctrl 기본값 확인 결과 (명세 2번과 달라 변경하지 않음)
새 캐릭터의 Ctrl은 웹에서도 **얼음보주**다. 근거: `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md` 372~375행("기검참+얼음보주는 난이도 무관 항상 지급", 2026-09-30 수정 전에는 Ctrl이 미습득 뇌전걸음으로 남아 무반응이었음) · game.html `P.skills.iceOrb=1` + `P.activeCtSk='iceOrb'`(HEAD 62282·62590~62591, `ghostWalk`는 `mkP` 초기값과 세이브 폴백일 뿐 새 캐릭터 시작 경로가 곧바로 덮어씀). `iceOrb`가 Ctrl 후보 목록에 있는 것(`skill_defs_web.json` Ctrl 슬롯 `ghostWalk,timeWarp,iceOrb`)과 별개로 기본 지급 스킬이다. 뇌전걸음(ghostWalk)은 슬롯 교체로만 쓰이며 이식은 후속.

## 검증
- `unity/Tools/skill-sim-test` 58 checks / 0 failures (악의구 13건 추가: 시작 상태, 입력→시전→발사 7f, MP 10, 폭발 피해·중독 1스택·악의 약화 1스택, 후딜 12f, MP 부족, 홀드 연사, 사거리 끝 폭발, 무기 공격 우선, Lv3 반경/사거리, 세이브 왕복, 구세이브 Lv1 보정).
- `Runtime/**/*.cs` 전체를 PC 에디터(6000.4.8f1)의 UnityEngine DLL로 csc 컴파일 → 오류 0. 6000.6.7f1 import·compile은 PC에 에디터가 없어 **미실행**(맥 확인 필요).
- 실플레이 화면(투사체·HUD 아이콘) 캡처는 미수행.


## 2026-10-30 악의구 조준·표현 후속

| 항목 | 현행 계약과 검증 상태 |
|---|---|
| 기준 | 작업 기준 unity/main `10c49850f85dca6365cbf67b8067e6fa749b026d`, 웹 origin/main `99d07be2b5c3003f501f9b9ecbf066656ed7d126` |
| 실제 기본 키 | 최신 웹 BINDS와 Unity KeyBindings 모두 악의구 `beam=mouse2`(우클릭), 칼등 처내기 `shield=KeyE`. E라는 기존 설명은 논리 마법 슬롯 이름과 혼재한 이력이다. 사용자 키 재설정·저장값을 임의 변경하지 않는다 |
| 발사각 | 웹 `_execMagicE`의 `P.atkArc=P.facing`처럼 시전 시작에 `magicCastAngle` 저장, 발사 때 사용. 홀드의 다음 시전에서 새 조준을 저장 |
| 방향 회귀 | 실제 Simulation 8방향에서 시전 중 90도 조준 변경. 수정 전 시작각 검사8실패/83검사, 수정 뒤0실패/107검사. 다음 연사 새 방향16항목과 꼬리 시작 위치·14점 상한24항목 포함 |
| 구체 원본 | 현행 전사 웹의 `assets/vfx/vfx_magic_orb.png`와 기존 `skill_malice_orb_sheet.png`가 동일 바이트(SHA256 `1739bdac122135e02032be5502db055977bc81f5c658a9cb82373617a06a256f`). 은꼬리 전용 초승달 시트를 전사에 덮어쓰지 않는다 |
| 꼬리 | Core 이동 전 위치를 매 고정 틱마다14점 원형 버퍼에 기록. 렌더 프레임 수와 무관하게 Native가 시간순으로 읽음. 일반합성 흑자색 연기(#14061f/.38/폭2.8r+2), 보라 불길(#7a2cff/.2/1.7r+1·.66길이1.5r+1·.38길이1.3r+1/.22), 심(#e3c6ff/.42/.5길이/.5r+.6), 잔불(#b46bff/.55f) |
| 중심 앵커 | 구체·폭발·잔불은 중심형 표시 레지스트리에 등록, 기존 발끝 기준 billboard lift 제외. 3D는 지면+.25u, 2D는 원래 중심. 구체 반경에 따라 화면 위치가 뜨지 않음 |
| 폭발 전달 | `Simulation.MaliceOrbExploded` 이벤트로 각 구체의 좌표·ExplR을 읽어 표시. 같은 틱 동시 폭발도 각각 전달. 판정·피해·중독·속도·유도·사거리 공식 변경0 |
| 폭발 원본 | 웹 `Dark_DarkSmoke_FBF_4x4.png`·`Arcane_Arcane_FBF_6x6.png`·`Dark_BasicImpact.png` 동일바이트 Resources 시트3개. 4×4/6×6/3×3, 배율1.8/1.4/.8, 지연0/1/0, 프레임속도3/3/2. 반경배율 clamp(sqrt(ExplR/80),.8,2.5), 알파.7·후반40% 감쇠, 크기1+.4p |
| 폭발 시계 | 실제 웹 draw의 TVFX2 진행은 틱당 한 번이다. 3층을 각 한 번 표시하며 최장 Arcane은36프레임×3틱+지연1. 중복 검색 발췌를 두 패스로 읽은 중간 후보는 폐기. 동시 폭발 표시 상한12 |
| 방사 잔불 | 폭발당12개, #9933cc, 각축속도4~7×방사각, 크기3~6px·수명12~18틱·마찰.9·알파 min(1,잔여비율×2.1). 표시 전용 난수로 게임 RNG 소비0. 32px셀당3개·최대80개 표시 |
| 전수 하네스 | `--unity-playtest-capture -malice-directions 1`은 기존14입력+LMB/RMB 각8방향+시전중 조준변경+Lv3 성장. 충돌을 끄지 않고 시작점·발사속도·조준·중심오차·연속PNG 기록 |
| 단독 검증 | Runtime 전체 독립 Roslyn 컴파일 오류0, 최신 웹 원본에서 재추출한 스킬 oracle13216검사·불일치0(악의구 실제 발사 본문400사례·4800검사 추가). 꼬리 폭은 startWidth/endWidth로 갱신해 렌더마다 AnimationCurve를 새로 만들지 않음 |
| 완료 게이트 | 독립 Simulation 통과는 Player 증거가 아님. Unity 컴파일·원본 oracle·무창 M1·웹/Unity 연속 비교·MERGE_QUEUE·unity/main 정상반영·바탕화면 갱신은 현재 후속 검증 단계 |

산출물: `I:/EXODUSER-Storage/demo-art/skill-fix/`. 실제 사용자 Player(PID13912, entry-flow/build)가 실행 중임을 확인하여 동시 Unity 실행을 하지 않았다. 사용자 창·세이브·타팀WIP를 보존한다.

악의구 오라클은 `_execMagicE`와 실제 폴백 발사 본문을 실행한다. Lv1~20·기준마력·INT·배율·MP보너스·사거리보너스·시전속도·방향400사례에서 시전시간·시작좌표/방향·초기/성장/폭발반경·사거리·속성·직격/폭발피해를 비교한다. JS/.NET sin의 double1ULP 차이97건을 먼저 기록했고, 좌표/속도는 실제 Core 저장 형식인 float32에서 정확히 일치하며 나머지 수치는 기존 double 비트 일치 기준을 유지한다. 임의 허용오차는 넣지 않았다. 원본 실패 영수증 `oracles/fireball-double-ulp-red.json` 보존.

비교 입력은 웹 MouseEvent.clientX/Y의 정수 전달을 그대로 재현한다. 1600×900 중심(800,450)에 300px 원형 조준점을 놓고 floor한 실제 방향을 Unity의 월드 조준으로 역투영한다. 이 보정 전 대각선3/7은 웹에서(-213,212)/(212,-213)이 되어 이상적인45도와 약0.135도 차이가 생겼다. 제품 조준의 허용오차를 늘린 것이 아니라 검수 입력을 같은 격자에 맞춘 것이다. 첫 정식 빌드 d377c201 컴파일0오류, 이후 계측 보정본으로 실제 Player 검수한다.

### 실제 GPU 합성·폭발 수명 재검수

| 항목 | 수정·검수 계약 |
|---|---|
| 첫 실제 Player | ed9b2cb2b / 빌드82d273b8 오류0. b377184c 실제 D3D11 RX9070XT·31사례113검사·2550틱 통과, 최대조준0.021356374px·중심오차0u·창/잔여/USER_SAVE0. 이 후보의 꼬리는1배율 비교에서 너무 밝은 삼각형으로 보여 시각 채택 보류 |
| 실제 웹 GPU 합성 | `_buildProxyX`의 globalCompositeOperation setter가 비어 있어 lighter 설정은 실제 GPU에 적용되지 않는다. 새 악의구 전용 재질은 일반 합성(One, OneMinusSrcAlpha·premultiplied alpha)으로 맞춤. 기존 다른 스킬 가산 재질의 기본값은 유지 |
| 색 | 웹 hex 꼬리·잔불 색은 sRGB→linear 변환 후 전달. 텍스처의 sRGB 임포트는 유지. 임의 알파 축소로 원인을 덮지 않음 |
| 중심형 깊이 | 악의구 전용 재질만 ZTest Always. 중심 앵커를 유지하면서 큰 구체/폭발의 하단이 불투명 지면에 잘리는 것을 방지. 2D 웹 후반 월드 이펙트 레이어에 대응하며 다른 스킬 깊이값은 변경0 |
| 셰이더 기본값 | SkillAdditive의 _NormalBlend=0·_DstBlend=1·_DepthTest=4(기존 가산/LEqual 유지). 악의구 전용 재질만1/10/8. 원본 시트·폭·알파·수명 공식은 유지 |
| 폭발 촬영 | 악의구 사례는240틱. 이전80틱은 사거리 끝 폭발 직전 PNG78에서 끝나 수명 검수가 없었음을 정정. 폭발1회·표시 생성·끝난 뒤 활성0을 검사 |
| 성장 검수 | RMB-lv3는 스킬Lv3. 시작반경12·성장반경24·사거리500·폭발반경160. 8방향·조준변경과 함께32사례로 검수 |
| 부분 재검수 | -playtest-controls로 기존 사례 이름을 쉼표 구분해 선택. 별도 제품 입력 경로를 만들지 않고 기존 FixedUpdate를 그대로 호출 |

현재 실제 시각 판정은 재검수 중이며 첫113검사 통과를 원본 VFX 합격으로 승격하지 않는다. 웹 자동 하드웨어 프리셋과 Unity 고품질의 옵션 차이도 기록·분리한 뒤 같은 품질에서 최종 비교한다.

최종 비교는 starter-fixture.json의 동일 장비15슬롯과 현재 inventory_seed.json의 뼈유물 항목을 웹 원본 applyStats와 Unity 양쪽에 적용한다. 무작위 초반 장비의 사거리·시전속도 차이를 제거하고 실제 HP/MP/스태미나/이동·시전속도를 영수증에 남긴다. 웹은 A 프리셋·꼬리ON·전사·1600×900 월드 캔버스로 고정한다. 창 감시 실패1건(308ba4e7)은 안전 PASS로 채택하지 않았다. 후속은 Git 원본을 미리 묶고 headless SwiftShader로 실행하며 실제 renderer·창·잔여·세이브 영수증을 확인한다. 이 웹 기준은 성능 검증이 아니며 Unity는 실제 D3D11 GPU로 별도 확인한다.

폭발의 표시 순서는 웹 draw와 같이 일반 방사 잔불→연기→비전→중앙 임팩트로 고정한다. 같은 sortingOrder에 따른 Unity 내부 순서에 맡기지 않는다. 첫 일반합성 후보5f01505ae의 M1은23/23이나1x폭발 레이어 중첩이 달라 시각 보류했고, 최종 순서 보정 후보로 다시 검수한다.
