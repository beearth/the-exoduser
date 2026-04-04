# 보스 시스템 상세 문서
# EXODUSER — 지옥의 길
# 업데이트: 2026-03-22 (BOSS_MOVES 56종 확장, 기존 패턴 범위 확대, teleStrike 경고 원, 해골번개 범위 조정)

> ⚠️ 구버전(7장×10층=70보스) 완전 폐기
> 현재 구조: 7장 = 35에리어, **매 에리어마다 보스 1마리** = **총 35보스**
> 미니보스 26 + 장보스 7 + 스토리보스 1 + 최종보스 1 = 35마리
> 모든 보스는 동일한 BossAI (BOSS_MOVES 56종) 사용. _BOSS_MOVESET[si]로 패턴 필터링, 이름+속성+스탯 스케일링으로 차별화.

---

## 핵심 구조

### BOSS_MOVES 배열 (56개 패턴)
```
{id, idx, tele, rec, canFeint, canDelay, range, phase, combo, tags, cd}

tele:  텔레그래프(와인드업) 프레임
phase: 사용 가능 페이즈 배열 [0~4]
tags:  패턴 분류 (melee/ranged/zone/cc/utility/summon/punish/debuff 등)
```

### BOSS_PHASES (5단계)
```
Phase 0~4: HP비율 기준 자동전환
배율: spdM / teleM / cdM / comboC / feintC / delayC
색상: _BOSS_PHASE_AURA 배열
```

| 페이즈 | HP 비율 | 특징 |
|--------|---------|------|
| 0 | 100~80% | 기본 패턴 |
| 1 | 80~60% | spdM/teleM 배율 증가 |
| 2 | 60~40% | 추가 패턴 해금 |
| 3 | 40~20% | 분신/카운터 강화 |
| 4 | 20~0% | 전 패턴 해금, 최대 배율 |

### BOSS_COMBOS (58개+)
```
{seq:['패턴1','패턴2',...], phase:[...]}
AI가 확률적으로 콤보 선택 → 연쇄 실행
```

### Utility AI (`_bossAI`, `_bossScore`)
```
거리적합, 반복패널티, 카운터보너스, 콤보보너스, 페이즈선호 가중치
_bossStartPattern(e, mv, d, phase, extraDelay): 패턴 디스패치
```

---

## 패링/체간 시스템

### 색상 코딩
- **빨간색 (`#ff2200`)**: 우클릭(sBash)만 패링 → `_PARRYABLE_ATK` Set, 링+글로우+PARRY 텍스트
- **무지개색 (HSL 회전)**: Q(sBlock)만 패링 → 블루콩 유도반사(뎀×3, AoE 180). 우클릭=데미지. 모든 패링=블루콩 변환. 비율 65:35 (무지개 우세)
- 와인드업 상태(Wind/Aim/TeleDrop/TeleWarn/MirrorGuard)에서 표시

### `_PARRYABLE_ATK` Set (22개)
```
charge, slashCombo, slam, sweep, spin, multiDash, teleStrike, swordWave, jump,
judgeCut, delaySlash, perilThrust, phantomSwords, crescendoCombo, tideWave,
rewindStrike, mirrorClone, shieldBash2, mirrorGuard, chainLightning, cageTrap, doppelganger
```

### 포이즈(Poise) — 그로기 시스템 (통합)

보스/일반몹 동일한 `e.poise` 시스템으로 통합 (구 posture 시스템 제거됨).

```
e.poise     // 현재 포이즈 (0이면 그로기)
e.maxPoise  // HP * 0.5 (보스 기본)
e.poiseR    // 포이즈 자연회복 쿨다운
e._pImmune  // 보스 그로기 면역 타이머 (300f = 5초)
// 설계 의도: 연속 그로기 방지 — 그로기 직후 다시 포이즈가 깎여 무한 CC가 되는 것을 차단
// 면역 중: 포이즈 그로기 불가
// 보스 그로기: 1.5초(90f), 일반몹: 3초(180f)
// 포이즈 자연회복: 보스 5초(300f), 일반 3.3초(200f) 후 maxPoise의 15%씩
```

### 패링 시 포이즈 데미지 (패턴별)

| 패턴 | 포이즈 데미지 | 비고 |
|------|-----------|------|
| 기본 근접 | 20 | 기본값 |
| perilThrust | 60 | 위험찌르기 보상 |
| shieldBash2 | 25 | 방패돌진 |
| crescendoCombo | 15 | 각 타 |
| doppelganger | 10 | 분신 공격 패링 |
| chainLightning | 15 | 각 번개점 |
| cageTrap | 15 | 가시 접촉 |
| mirrorGuard | — | 때리면 반격당함 |

---

## 전체 패턴 목록 (56개) — idx 고정, 수정 금지

### 기본 패턴 (idx 0-14)
| idx | id | 타입 | 설명 |
|-----|-----|------|------|
| 0 | burst | 즉발 | 광역 탄 |
| 1 | charge | 상태 | 돌진 |
| 2 | fan | 즉발 | 부채꼴 탄 |
| 3 | shock | 즉발 | 충격파 |
| 4 | jump | 상태 | 점프 공격 |
| 5 | grab | 상태 | 잡기 (보라, 패링불가) |
| 6 | spin | 상태 | 회전 |
| 7 | laser | 상태 | 레이저 |
| 8 | summon | 즉발 | 소환 |
| 9 | mine | 즉발 | 지뢰 |
| 10 | vortex | 즉발 | 회오리 |
| 11 | meteor | 즉발 | 유성 |
| 12 | multiDash | 상태 | 연속돌진 |
| 13 | teleStrike | 상태 | 텔레포트 공격 |
| 14 | elemBall | 즉발 | 속성탄 |

### 근접 강화 패턴 (idx 15-19)
| idx | id | 설명 |
|-----|-----|------|
| 15 | slashCombo | 3연참 |
| 16 | slam | 내려치기 |
| 17 | sweep | 횡베기 |
| 18 | beanStorm | 탄막폭풍 |
| 19 | beanRain | 탄막비 |

### 특수 패턴 1차 (idx 20-28)
| idx | id | 패링 | 설명 |
|-----|-----|------|------|
| 20 | swordWave | ✅ | 검기 (초승달 투사체) |
| 21 | judgeCut | ✅ | 재단참 (딜레이 폭발) |
| 22 | spiralBullet | ❌ | 나선탄 |
| 23 | delaySlash | ✅ | 딜레이참 (홀드→스윙) |
| 24 | perilThrust | ✅ | 위험찌르기 (패링 보상 큼, 체간60) |
| 25 | pillars | ❌ | 지옥기둥 |
| 26 | phantomSwords | ✅ | 환영검 (유도) |
| 27 | burstCounter | ❌ | 폭발반격 (카운터 자세) |
| 28 | crescendoCombo | ✅ | 점층연격 (갈수록 빠름) |

### 특수 패턴 2차 (idx 29-38)
| idx | id | 패링 | 설명 |
|-----|-----|------|------|
| 29 | darkZone | ❌ | 암흑영역 |
| 30 | mirrorClone | ✅ | 거울분신 |
| 31 | groundFissure | ❌ | 균열 |
| 32 | tideWave | ✅ | 조류파 |
| 33 | seekerMines | ❌ | 추적지뢰 |
| 34 | rewindStrike | ✅ | 되감기참 |
| 35~37 | (예약) | — | 중복 방지용 슬롯 |
| 38 | gravityWell | ❌ | 중력우물 |

### 특수 패턴 3차 (idx 39-48)
| idx | id | 패링 | 설명 |
|-----|-----|------|------|
| 39 | wallPush | ❌ | 충격파 벽, 플레이어 밀어냄+넉백 |
| 40 | poisonTrail | ❌ | 대시하며 독웅덩이 생성 (4초) |
| 41 | cageTrap | ✅ | 플레이어 위치에 가시 감옥 |
| 42 | chainLightning | ✅ | 4점 연쇄번개 (암전 속성) |
| 43 | orbWeave | ❌ | 보스 주위 궤도탄 (5초) |
| 44 | shieldBash2 | ✅ | 방패돌진+스턴 45f |
| 45 | mirrorGuard | ✅ | 반격자세 (hurtE 차단, 2배 반격) |
| 46 | soulAnchor | ❌ | 영혼닻, 속박+DOT |
| 47 | doppelganger | ✅ | 분신소환 (독립AI, pProj 파괴가능) |
| 48 | itemSteal | ❌ | 무기봉인 10초 (공격력 70%↓) |

### 맵 전체급 패턴 4차 (idx 49-55) — 2026-03-22 추가
| idx | id | 패링 | 설명 |
|-----|-----|------|------|
| 49 | lavaPools | ❌ | 맵 전체 용암 장판, 안전지대 2~3곳 |
| 50 | fireRain | ❌ | 맵 전체 대량 포격 12~28발 |
| 51 | shockGrid | ❌ | 보스 중심 6~10방향 전격 빔 |
| 52 | donutSlam | ❌ | 보스 근처만 안전, 바깥 전체 폭발 (FF14식) |
| 53 | safeCorner | ❌ | 맵 전체 폭발, 4분면 중 1곳만 안전 (WoW식) |
| 54 | crossWipe | ❌ | 십자 소멸 2~4파 반복 (로아식) |
| 55 | tidalWipe | ❌ | 한쪽에서 거대 벽 밀려옴 (엘든링식) |

---

## 기존 패턴 범위 확대 — 2026-03-22

| 패턴 | 변경 항목 | 이전 | 이후 | 비고 |
|------|----------|------|------|------|
| chaseAoe | r | 55 | 90 | 추적 범위 대폭 확대 |
| pillars | r | 20 | 55~75 | 맵 전체 분산 8~24개 |
| groundFissure | w | 15 | 28 | 균열 폭 확대 |
| groundFissure | explR | 100 | 150 | 폭발 반경 확대 |
| groundFissure | maxLen | 400 | 500 | 최대 길이 확대 |
| meteor | 산포 | ±240 | 맵 전체급 | 유성 산포 범위 대폭 확대 |
| jump 착지 | shockMax | 100 | 160+stage*10 | 스테이지 스케일링 추가 |
| shock | shockMax | 120 | 180+stage*12 | 스테이지 스케일링 추가 |

---

## teleStrike 경고 원 추가 — 2026-03-22

```
teleStrike에 착지 전 1초(60f) 경고 원 표시 추가
상태: bossTeleWarn (신규 상태)
시각: 착지 예정 위치에 빨간 원 경고 → 1초 후 실제 공격
```

---

## 해골번개(chainLightning) 범위 조정 — 2026-03-22

```
1렙 기본 범위: 230px → 170px (기본값 200 → 140)
목적: 초반 밸런스 완화, 레벨 스케일링은 유지
```

---

## 보스 전체 목록 (35마리) — si0~si34

> 매 에리어마다 보스 1마리. HELL_BOSSES 배열 + STG 배열 기준.
> 모든 보스 기본 크기 44px (r=22×2). 최종보스(si34)만 128px.
> isHellBoss = 각 장의 마지막 에리어.

| si | 이름 | 종류 | 장 | 에리어 | 속성 | 패턴 수 |
|----|------|------|----|--------|------|---------|
| 0 | 숲의 감시자 | 미니보스 | 1장 썩은 숲 | 0 | 독 | 18 |
| 1 | 독버섯 거인 | 미니보스 | 1장 썩은 숲 | 1 | 독 | 18 |
| 2 | 숲의 사냥꾼 | 미니보스 | 1장 썩은 숲 | 2 | 독 | 18 |
| 3 | **숲의 기생수** | **장보스** | 1장 썩은 숲 | 3 (Grid) | 독 | 18+ |
| 4 | 벌레 수호자 | 미니보스 | 2장 벌레굴 | 0 | 독 | 27 |
| 5 | 점액 괴수 | 미니보스 | 2장 벌레굴 | 1 | 독 | 28 |
| 6 | 기생충 모체 | 미니보스 | 2장 벌레굴 | 2 | 독 | 28 |
| 7 | 거대 알주머니 | 미니보스 | 2장 벌레굴 | 3 | 독 | 29 |
| 8 | 살벽의 군주 | 미니보스 | 2장 벌레굴 | 4 | 독 | 30 |
| 9 | **여왕 구더기** | **장보스** | 2장 벌레굴 | 5 (Grid) | 독 | 30+ |
| 10 | 얼음 망령 | 미니보스 | 3장 얼음굴 | 0 | 빙결 | 32 |
| 11 | 서리의 기사 | 미니보스 | 3장 얼음굴 | 1 | 빙결 | 33 |
| 12 | 얼어붙은 감시자 | 미니보스 | 3장 얼음굴 | 2 | 빙결 | 36 |
| 13 | **얼음 속 봉인 괴물** | **장보스** | 3장 얼음굴 | 3 (Grid) | 빙결 | 36+ |
| 14 | 화염 악마 | 미니보스 | 4장 화염지대 | 0 | 화염 | 39 |
| 15 | 불기둥 수호자 | 미니보스 | 4장 화염지대 | 1 | 화염 | 40 |
| 16 | 용암의 심장 | 미니보스 | 4장 화염지대 | 2 | 화염 | 40 |
| 17 | 화염 전사 | 미니보스 | 4장 화염지대 | 3 | 화염 | 42 |
| 18 | 화염 쌍두 | 미니보스 | 4장 화염지대 | 4 | 화염 | 42 |
| 19 | 불벌레 군주 | 미니보스 | 4장 화염지대 | 5 | 화염 | 44 |
| 20 | **화염 감옥지기** | **장보스** | 4장 화염지대 | 6 (Grid) | 화염 | 44+ |
| 21 | 전쟁의 잔해 | 미니보스 | 5장 지옥 군단 | 0 | 암흑 | 47 |
| 22 | 뼈산의 왕 | 미니보스 | 5장 지옥 군단 | 1 | 암흑 | 47 |
| 23 | 악마 사령관 | 미니보스 | 5장 지옥 군단 | 2 | 암흑 | 48 |
| 24 | 철벽 기사단장 | 미니보스 | 5장 지옥 군단 | 3 | 암흑 | 48 |
| 25 | **군단 지휘관** | **장보스** | 5장 지옥 군단 | 4 (Grid) | 암흑 | 48+ |
| 26 | 살점의 수호자 | 미니보스 | 6장 사도의 마굴 | 0 | 암흑 | 49 |
| 27 | 인간뼈 감시자 | 미니보스 | 6장 사도의 마굴 | 1 | 암흑 | 49 |
| 28 | 뒤틀린 자 | 미니보스 | 6장 사도의 마굴 | 2 | 암흑 | 50 |
| 29 | 촉수의 어미 | 미니보스 | 6장 사도의 마굴 | 3 | 암흑 | 50 |
| 30 | 불완전 사도 | 미니보스 | 6장 사도의 마굴 | 4 | 암흑 | 50 |
| 31 | **대사도** | **장보스** | 6장 사도의 마굴 | 5 (Grid) | 암흑 | 50+ |
| 32 | 검은 성의 수호자 | 미니보스 | 7장 지옥성 | 0 | 암흑 | 전체 |
| 33 | **Killu** | 스토리보스 | 7장 지옥성 | 1 | 전원소 | 전체 |
| 34 | **지옥 군주** | **최종보스** | 7장 지옥성 | 2 (Grid) | 전원소 | 전체 |

> **패턴 수 = _BOSS_MOVESET[si]의 크기.** 장이 진행될수록 사용 가능 패턴 증가.
> 7장(si32~34)은 null = 56종 전체 해금.

### 스탯 공식
```
기본 크기: r = 22 × 2 = 44px (전 보스 공통, si34 제외)
HP:   1500 × 1.0128^monLv   (monLv = playerLv + DIFF_LV_OFF)
ATK:  (40 + monLv × 3)
Poise: 100 + si × 8         (si0=100 ~ si34=372)
Speed: 0.5                  (phase spdM 적용)

최종보스(si34): HP ×6.0, ATK ×2.5, 128px
```

---

## 7장 에리어 구조 및 보스 배치

### 1장 — 썩은 숲 (ROTTEN_FOREST) 속성: 독/물리
| 에리어 # | si | 이름 | 맵 타입 | 보스 |
|---------|-----|------|---------|------|
| 0 | 0 | 숲 입구 | Vert | 미니보스 — 숲의 감시자 |
| 1 | 1 | 뒤틀린 숲길 | Horiz | 미니보스 — 독버섯 거인 |
| 2 | 2 | 버섯 군락 | Vert | 미니보스 — 숲의 사냥꾼 |
| 3 | 3 | 기생수의 둥지 | **Grid** | **장보스 — 숲의 기생수** |

BGM: `bgm_hell1` (Ashes of the Fallen Gate) → 보스룸: `bgm_boss_early` (Anvil Ashes)
팔레트: BG #0d1205 / Accent #4a7a1e / PlayerLight #c8ff96

### 2장 — 벌레굴 (WORM_NEST) 속성: 물리/독
| 에리어 # | si | 이름 | 맵 타입 | 보스 |
|---------|-----|------|---------|------|
| 0 | 4 | 벌레 터널 입구 | Vert | 미니보스 — 벌레 수호자 |
| 1 | 5 | 점액 동굴 | Horiz | 미니보스 — 점액 괴수 |
| 2 | 6 | 기생충 서식지 | Vert | 미니보스 — 기생충 모체 |
| 3 | 7 | 구더기 번식장 | Vert | 미니보스 — 거대 알주머니 |
| 4 | 8 | 살점 동굴 | Horiz | 미니보스 — 살벽의 군주 |
| 5 | 9 | 여왕의 방 | **Grid** | **장보스 — 여왕 구더기** |

BGM: `bgm_hell2` (Carapace Cathedral) → 보스룸: `bgm_boss_early` (Anvil Ashes)
팔레트: BG #0a0a03 / Accent #8bc34a / PlayerLight #d4e870

### 3장 — 얼음굴 (FROZEN_CAVERN) 속성: 빙결
| 에리어 # | si | 이름 | 맵 타입 | 보스 |
|---------|-----|------|---------|------|
| 0 | 10 | 얼음 동굴 입구 | Vert | 미니보스 — 얼음 망령 |
| 1 | 11 | 미끄러운 얼음길 | Horiz | 미니보스 — 서리의 기사 |
| 2 | 12 | 얼어붙은 감옥 | Vert | 미니보스 — 얼어붙은 감시자 |
| 3 | 13 | 봉인의 방 | **Grid** | **장보스 — 얼음 속 봉인 괴물** |

BGM: `bgm_hell3` (Abyssal Drift) → 보스룸: `bgm_boss_early` (Anvil Ashes)
팔레트: BG #0d1520 / Accent #4fc3f7 / PlayerLight #a0d0f0
기믹: IceFloor drag=0.5f (빙판 관성)

### 4장 — 화염지대 (FLAME_OF_AGONY) 속성: 화염 ← 최장 7에리어
| 에리어 # | si | 이름 | 맵 타입 | 보스 |
|---------|-----|------|---------|------|
| 0 | 14 | 용암 입구 | Vert | 미니보스 — 화염 악마 |
| 1 | 15 | 불기둥 지대 | Horiz | 미니보스 — 불기둥 수호자 |
| 2 | 16 | 화산 심장 | Vert | 미니보스 — 용암의 심장 |
| 3 | 17 | 화염 악마 소굴 | Vert | 미니보스 — 화염 전사 |
| 4 | 18 | 지옥 사냥개 터 | Horiz | 미니보스 — 화염 쌍두 |
| 5 | 19 | 불벌레 동굴 | Vert | 미니보스 — 불벌레 군주 |
| 6 | 20 | 감옥지기의 관문 | **Grid** | **장보스 — 화염 감옥지기** |

BGM: `bgm_hell4` (Ignis et Sanguis) → 보스룸: `bgm_boss_late` (Kiln of Broken Crowns)
팔레트: BG #1a0800 / Accent #ff6d00 / PlayerLight #ffa060
기믹: LavaFloor 즉사 + FirePillar 2초 주기

### 5장 — 지옥의 군단 (HELL_LEGION) 속성: 물리/암흑
| 에리어 # | si | 이름 | 맵 타입 | 보스 |
|---------|-----|------|---------|------|
| 0 | 21 | 전쟁 폐허 | Vert | 미니보스 — 전쟁의 잔해 |
| 1 | 22 | 뼈 산 | Horiz | 미니보스 — 뼈산의 왕 |
| 2 | 23 | 악마 병영 | Vert | 미니보스 — 악마 사령관 |
| 3 | 24 | 기사단 진지 | Vert | 미니보스 — 철벽 기사단장 |
| 4 | 25 | 지휘관의 요새 | **Grid** | **장보스 — 군단 지휘관** |

BGM: `bgm_hell5` (Crown of Ash and Iron) → 보스룸: `bgm_boss_late` (Kiln of Broken Crowns)
팔레트: BG #080010 / Accent #7c4dff / PlayerLight #c080ff
기믹: BonePile OnTrigger → 해골 병사 1마리 스폰

### 6장 — 사도의 마굴 (APOSTLE_LAIR) 속성: 암흑/물리 ← 최고 그로테스크
| 에리어 # | si | 이름 | 맵 타입 | 보스 |
|---------|-----|------|---------|------|
| 0 | 26 | 살점 입구 | Vert | 미니보스 — 살점의 수호자 |
| 1 | 27 | 인간 뼈 통로 | Horiz | 미니보스 — 인간뼈 감시자 |
| 2 | 28 | 뒤틀린 동굴 | Vert | 미니보스 — 뒤틀린 자 |
| 3 | 29 | 촉수 악마 소굴 | Vert | 미니보스 — 촉수의 어미 |
| 4 | 30 | 괴물 인간 서식지 | Horiz | 미니보스 — 불완전 사도 |
| 5 | 31 | 대사도의 제단 | **Grid** | **장보스 — 대사도** |

BGM: `bgm_hell6` (Midnight Cathedral of Ash) → 보스룸: `bgm_boss_late` (Kiln of Broken Crowns)
팔레트: BG #080008 / Accent #d500f9 / PlayerLight #f090ff
기믹: FleshWall sin파 맥박 애니메이션

### 7장 — 지옥성 (HELL_CASTLE) 속성: 전원소 혼합 ← 최단·최고난이도
| 에리어 # | si | 이름 | 맵 타입 | 보스 |
|---------|-----|------|---------|------|
| 0 | 32 | 검은 성문 | Vert | 미니보스 — 검은 성의 수호자 |
| 1 | 33 | 지옥 탑 | Horiz | **스토리보스 — Killu** |
| 2 | 34 | 지옥 군주의 왕좌 | **Grid** | **최종보스 — 지옥 군주 (3페이즈)** |

BGM: `bgm_hell7` (Abyss Below) → 보스룸: `bgm_boss_final` (Teeth in the Choir)
팔레트: BG #080003 / Accent #ff4081 / PlayerLight #ff6080
기믹: 1~6장 기믹 랜덤 혼합

---

## _BOSS_MOVESET — 장별 패턴 해금 구조

> 코드 기준 `_BOSS_MOVESET[si]` = Set. null이면 전체 해금.
> 장이 진행될수록 누적 해금. 같은 장 내에서도 에리어마다 1~2개씩 추가.

| 장 | 기반 패턴 수 | 추가 해금 패턴 | 비고 |
|----|-------------|-------------|------|
| 1장 (si0~3) | 18 | slashCombo, slam, sweep, charge, jump, burst, shock, fan, groundFissure, poisonTrail, spin, grab, multiDash, tideWave, chaseAoe, elemBall, beanStorm, lavaPools | 기본 세트 |
| 2장 (si4~9) | 27→30 | +summon, mine, vortex, cageTrap, fireRain, shockGrid, donutSlam, crossWipe, beanRain, seekerMines, fanWave, wallPush, shieldBash2 | si마다 +1~2 |
| 3장 (si10~13) | 32→36 | +laser, safeCorner, tidalWipe, teleStrike, delaySlash, perilThrust, spiralBullet | 특수패턴 1차 해금 |
| 4장 (si14~20) | 39→44 | +meteor, radialLaser, swordWave, pillars, burstCounter, wallPush, gravityWell | 특수패턴 2차 해금 |
| 5장 (si21~25) | 47→48 | +judgeCut, phantomSwords, crescendoCombo, chainLightning, mirrorGuard, rewindStrike | 고급 패턴 해금 |
| 6장 (si26~31) | 49→50 | +orbWeave, mirrorClone, darkZone, soulAnchor, doppelganger, itemSteal | 전 패턴 근접 |
| 7장 (si32~34) | null | 전체 56종 해금 | 필터 없음 |

### 장보스/특수보스 추천 패턴

| 보스 | si | 속성 | 특징 |
|------|----|------|------|
| 숲의 기생수 | 3 | 독 | melee+zone+summon (가지/촉수) |
| 여왕 구더기 | 9 | 독 | summon+zone+ranged (알/구더기) |
| 얼음 봉인 괴물 | 13 | 빙결 | ranged+cc+zone (얼음/동결) |
| 화염 감옥지기 | 20 | 화염 | zone+ranged+melee (불기둥/용암) |
| 군단 지휘관 | 25 | 암흑 | summon+melee+cc (군대소환) |
| 대사도 | 31 | 암흑 | utility+debuff+zone (사도변이) |
| 뒤틀린 자 | 28 | 암흑 | itemSteal (무기봉인 10초, 공격력 ×0.3) |
| 검은 성의 수호자 | 32 | 암흑 | 전 패턴 해금 (7장 관문) |
| Killu | 33 | 전원소 | punish+melee+utility (플레이어 미러링) |
| 지옥 군주 | 34 | 전원소 | all (3페이즈, 속성 변환: fire→dark→all) |

---

## 독립 이펙트 배열 (G._ 접두사)

| 배열 | 패턴 | 주요 속성 |
|------|------|---------|
| `G._judgeCuts` | judgeCut | x,y,t,delay,r,dmg,src |
| `G._spiralBullets` | spiralBullet | (projs 통합) |
| `G._pillars` | pillars | x,y,t,maxT,r,dmg |
| `G._phantomSwords` | phantomSwords | x,y,vx,vy,t,maxT,dmg |
| `G._darkZones` | darkZone | x,y,t,maxT,r |
| `G._mirrorClones` | mirrorClone | x,y,t,maxT,ang,src |
| `G._fissures` | groundFissure | x,y,t,maxT,r,dmg |
| `G._tideWaves` | tideWave | x,y,ang,t,maxT,w |
| `G._seekerMines` | seekerMines | x,y,vx,vy,t,maxT,armT |
| `G._rewindMarks` | rewindStrike | x,y,t,delay,r,dmg |
| `G._gravityWells` | gravityWell | x,y,t,maxT,r,pull |
| `G._wallPushes` | wallPush | x,y,ang,t,dist,maxDist,w,spd,dmg |
| `G._poisonPools` | poisonTrail | x,y,t,maxT,r,dmg,tickT |
| `G._cageTraps` | cageTrap | x,y,t,warnT,maxT,r,dmg,hitT |
| `G._chainLights` | chainLightning | pts[],t,maxT,r,dmg,idx,jumpT |
| `G._orbWeaves` | orbWeave | src,ang,r,t,maxT,spd,orbR,dmg |
| `G._soulAnchors` | soulAnchor | x,y,t,maxT,r,slowF,dmg,tickT |
| `G._doppelgangers` | doppelganger | x,y,hp,atk,r,t,maxT,s,ang,src,spd,atkCD |
| `G._lavaPools` | lavaPools | x,y,t,maxT,r,dmg,safeZones[] |
| `G._fireRains` | fireRain | x,y,t,maxT,count,r,dmg |
| `G._shockGrids` | shockGrid | src,dirs,t,maxT,len,w,dmg |
| `G._donutSlams` | donutSlam | x,y,t,maxT,safeR,outerR,dmg |
| `G._safeCorners` | safeCorner | x,y,t,maxT,safeQ,dmg |
| `G._crossWipes` | crossWipe | x,y,t,maxT,waves,w,dmg |
| `G._tidalWipes` | tidalWipe | dir,t,maxT,spd,w,dmg |
| `G._teleWarns` | teleStrike(warn) | x,y,t,warnT,r |

---

## 보스 상태 머신 (e.s 값들)

### 기본 상태
```
idle / windup / recover
```

### 패턴별 상태
```
bossChargeWind → bossCharge
bossBurstWind  → (burst는 즉발)
bossGrabWind   → bossGrab
bossJump       → (점프중)
bossSpin
bossLaser
bossMultiDash
bossTeleWarn   → bossTeleDrop
bossDelaySlashHold → bossDelaySlashSwing
bossPerilWind  → bossPerilThrust
bossBurstCounter   (카운터 대기)
bossCrescendo      (점층연격)
bossPoisonDash     (독대시)
bossSBashWind  → bossSBash
bossMirrorGuard    (거울방어 대기)
bossItemStealWind → bossItemSteal
```

### 반격 차단 (hurtE 상단)
```
e._mgActive && bossMirrorGuard → 2배 반격
e._bcActive && bossBurstCounter → 1.5배 반격
```

---

## 보스 등장 시네마틱

```
1. 레터박스 (위아래 검은 바 인 애니메이션)
2. 네임카드 (보스 이름 + 장 정보 + 속성 아이콘)
3. 보스 Idle 애니메이션
4. BGM 전환: 탐험 BGM → bgm_boss_cinematic (Inferno Liturgia) 0.5초
             → bgm_boss_early/late/final 크로스페이드 2초
5. 레터박스 아웃 → 전투 시작
```

---

## 무기봉인 시스템 (itemSteal 패턴)
```
P._weaponSeal: 남은 프레임 (600 = 10초)
meleeRef(): 봉인 중 공격력 ×0.3
만료 시 "무기 해방!" 텍스트
```

---

## Unity 이식 시 스폰 구조

```csharp
// 구버전: STG[si] = hell*10 + hellFloor (0~69) → 폐기
// 현행: AreaData ScriptableObject 기반

// 보스 스폰 조건
if (areaData.isBossArea) {
    SpawnBoss(areaData.bossId, areaData.bossElement, areaData.isHellBoss);
}
// isBossArea: 에리어 타입 = Grid
// bossId: 0~18 (19마리)
// isHellBoss: 장보스 여부 (강화 패턴 활성화)
```

---

## 패턴 추가 시 체크리스트

```
1. BOSS_MOVES 배열에 엔트리 추가 (idx 고정 주의)
2. _bossStartPattern switch에 dispatch case 추가
3. 상태 기반이면 상태 머신 case 추가 (recover 앞)
4. 독립 이펙트면 G._ 배열 + 업데이트 로직 + 렌더러 추가
5. 패링 가능이면 _PARRYABLE_ATK에 추가
6. 반격 패턴이면 hurtE() 상단에 차단 코드
7. BOSS_COMBOS에 연계 추가
8. 와인드업 비주얼: e.s.includes('Wind') 자동 포함
9. 패링 컬러: 빨강(#ff2200) or 보라(#cc00ff) 와인드업에 적용
10. Unity 이식 시: BossAI.cs BOSS_MOVES 배열 동기화 확인
```

---

*boss-system.md — 2026-03-22 업데이트*
*MAP BIBLE v3 반영: 70보스 → 19보스, 7장 35에리어 구조*
*BGM 매핑: 실제 파일명 기준 (섹션 12.5 연동)*
*2026-03-22: BOSS_MOVES 49→56종 확장, 기존 패턴 범위 확대, teleStrike 경고 원, 해골번개 범위 조정*
