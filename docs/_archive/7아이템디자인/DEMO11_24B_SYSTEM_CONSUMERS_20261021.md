# DEMO11-24b — 나머지306 affix의 소비 경계

기준: fetch한 origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`에 인수된 DEMO11-24 `5a3af4106b3fc944177f94563d7fc4988a33ebf3`가 있는 동일 브랜치. 새 브랜치·수식·장비 데이터 owner를 만들지 않는다. 전 단위의 398레코드/396고유 id 및 원본 고정 seed 빈도를 그대로 재사용한다. 아래 표는 이전 `owner_unverified` 306개만을 분모로 삼는다.

## 분류 기준과 드랍0 오인 방지

- **① 게임 시스템14개**: 원본 실제 함수의 악의/드랍·경험치·물약·HP 재생·자원 비용·쿨다운·영역 회복 소비. 혼합 id는 게임 시스템 부분만 Mac 검증 대상으로 잡는다. 이 중 기존 네이티브 owner가 있는13개를 빈도순으로 연결한다.
- **② PC 전투50개**: 피해/방어/공격·시전 동작/기동·패링/분노·상태·부활 등 보호 경로. hurtE의 `_elAx/_elBn` 동적 조회 G42216–42218의8개도 해석했다. 전 단위 literal 직접72개와 구분하여 추가 인계한다.
- **③ 드랍 테이블0: 0개**. 306개 모두 원본 롤 후보이고 이전 원본 함수 실행에서 각 id가 실제 관측됐다. 소비가 없거나 함수가 호출되지 않는다는 이유로 드랍0이라고 쓰지 않는다. 데모 금지7/T1 null 제외는 전 단위에서 이미 후보 밖이다.
- **소비처 미확인242개**: 후보 선언은 있으나 런타임 `_eqAffix` literal·동적 원소조회에서 소비를 확인하지 못한 id. UI `_af=id=>_eqAffix(id)`/스탯 상세만의 참조는 실제 효과로 세지 않는다. 이를 의도만 추정해①/②로 확정하거나 원본에 없는 수식을 창작하지 않는다. 요청한3분류에 억지로 넣지 않고 이 잔여를 별도 표시한다. 새로운 동적 호출/외부 owner 근거가 나오면 재분류한다.

원본 G14364–14856 정의, G15131–15174 데모 롤, G27996–27999 LCK/드랍, G28041/28065 비용/쿨, G31983 비용, G32705–32720 자연/영역 회복, G35893–35910 자동 물약, G43134–43174 경험치를 읽었다. ITEMS/WEAPONS 추적과 docs/7의 과거 분모 불일치는 전 단위 문서를 참조한다. 피해 수식/저장/스탯 재계산 owner를 복제하지 않는다.

## 연결한13개와 실제 경로

빈도순: `lckFlatR → mpCostRed → dropRate → stCostRed → skillCdRed → potionPower → potionCdRed → lckFlatN → expBonus → lifeHealPow → skillBoost → cooldownRed → helmCooldown → endCooldownAll`.

Main 소유의 `native_system_equipment_affixes.gd`는 **값 캐시**다. 실제 INV·affix reader의 현재 캐시를 최초 부팅/성공한 PC runtime refresh 신호에서만 읽는다. 원래 cache token identity를 조회 전후 복원하며 실패 refresh는 이 캐시를 바꾸지 않는다. 틱에서는 완성된 id별 Dictionary 결과만 읽고 원본 reader 조회/재구축/목록 API를 호출하지 않는다. 초기 바인딩과 장착·해제·스탯 재계산 이벤트 외에 lazy warm을 넣지 않는다. 기존 런타임 갱신 API와 동일한 Main 수명을 따르며 새 INV·자원 authority는 없다.

`Main.read_native_source_equipment_affix`는 선택14id에 한해 이 캐시를 제공하여 기존 보호 hurtE의 드랍/경험치 소비 식을 그대로 사용한다. 나머지 id의 원래 reader·부분 캐시/형태 의미는 바꾸지 않는다. 비용/쿨은 기존 Main 비용 context → NativeSkillSlots/dispatch quote/기존 자원 writer를 재사용한다. `potionPower`는 기존 자동 물약 producer의 enhanced_heal과 State/PC HP sink를 그대로 쓴다. HP 자연 회복은 기존 source phase의 `life_heal_pow` 공급자만, 영역 flat 회복은 `skillBoost` 공급자만 같은 캐시로 바꾼다. 원래 rates/affix/passive provider의 script/owner 검증은 유지하고, 새 선택 callback은 최초 구성에서 Main identity를 검사한다. 수식 추가·원본 감산/곱셈 순서 변경·피해 실행 구현은 없다.

13개 READY는 **이 게임 시스템 소비 부분**에 한정한다. LCK의 치명타, stCostRed/mpCostRed의 다른 보호 실행자, skillBoost의 공격 배율, 쿨감4종의 미지원 보호 스킬은 pc-iface-pack 요청에 별도 남긴다. 기존 transaction effect receipt의 `game_system_cached / system_component_only`를 전체 피해 효과 구현 완료로 읽지 않는다.

`potionCdRed`는 2026-10-21 후속에서 자동 물약 owner에 연결했다. 수동 QSLOTS/UI는 되살리지 않는다. 자동 owner는 G35898–35902의 장갑·벨트·회복력 식에 G28228–28231의 `_potCdAffix=Math.min(_eqAffix('potionCdRed'),.2)`를 같은 차감 순서로 추가한다. 데이터 tier는 음수이므로 원본 signed 결과(최대 tier -0.22 → 512f)를 방향 보정 없이 보존한다. 장착/해제 refresh cache와 자동 사용의 0·최대·해제복귀 경계만 검수하며, 드랍은 계속③이 아니다.

## 실제 인트로 뒤 회복 identity 인계

실창 경로의 실제 intro/lesson skip을 실행한 검사에서 회복 phase는 `stale_duplicate_or_mismatched_native_tick`, clock_admitted=0이었다. World는 원본처럼 인트로 clear와 레슨 start/finish에서 적 배열을 교체하지만 기존 회복 phase가 부팅 당시 배열 identity를 붙잡았다. 캐시 조회만 통과시켜 회복 소비 완료로 보고하지 않는다.

Main은 native intro `phase=done` 및 등록된 lesson inactive를 본 뒤 **단1회** `adopt_completed_intro_identity`를 요청한다. phase는 실제 Main에 등록된 자기 자신인지, 같은 Player/World/State, 정확한 intro/lesson script·완료 상태, 기존 provider/sink binding이 모두 유효한지 검사한다. 실제 배열이 달라졌을 때만 새 identity와 clock boundary를 인수한다. 임의 배열 변경·foreign Main·재실행은 수락하지 않으며 기존 advance_native의 ens/frame/epoch/중복/실제 owner/sink 검사는 한 줄도 완화하지 않는다. lesson/World/Player/피해 파일은 수정하지 않는다. 인계 뒤 실제 World phase의 자연 HP·영역 HP sink까지 검사한다.

## PC 인계·검증 한계

외부 원로그 `pc-iface-pack.json`에 이전72 + 추가50의 목록, 혼합13id의 미검증 전투 부분, 원본행과 요청 사유를 구분하여 보존한다. 특히 goldBonus는 이전72 목록에 있으며 보호 처치/악의 경로의 요청을 유지한다. 여기서 추가 악의를 지급해 중복 보상하지 않는다. 원본 소비 미확인242개에 대해서는 소비 경로·공식의 승인된 근거가 필요하다.

원본빈도는 성공한 장비 롤100,000회/몹 등급 관측치이며 실제 한 판의 몬스터 혼합 빈도는 미확인이다. 테스트의 부품 장비/직접 DOT 처치/HP 손실/고액 자금/스킬 부여는 명시 fixture다. 자연 획득·보호 피해식 신규 구현·상점/수동 포션 UI·실사용 세이브를 검증했다고 주장하지 않는다.

| 순위 | id | 일반 롤 관측 | 분류 | 이번 연결 | 원본 정의/소비 행 |
|---:|---|---:|---|---|---|
| 1 | `iceRes` | 2024 | 소비처 미확인 | NOT_READY | 정의 G14486 / 소비 미확인 |
| 2 | `lightRes` | 2007 | 소비처 미확인 | NOT_READY | 정의 G14487 / 소비 미확인 |
| 3 | `fireRes` | 2004 | 소비처 미확인 | NOT_READY | 정의 G14485 / 소비 미확인 |
| 4 | `darkRes` | 1836 | 소비처 미확인 | NOT_READY | 정의 G14488 / 소비 미확인 |
| 5 | `poisonRes` | 1743 | 소비처 미확인 | NOT_READY | 정의 G14489 / 소비 미확인 |
| 6 | `lckFlatR` | 1716 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14510 / 소비 G27996 |
| 7 | `stunRes` | 852 | ② PC 보호 | NOT_READY | 정의 G14655 / 소비 G34982,G41348,G43463,G43488,G43585 |
| 8 | `eDefFlat` | 823 | ② PC 보호 | NOT_READY | 정의 G14491 / 소비 G43512 |
| 9 | `maxHPPctArmor` | 816 | 소비처 미확인 | NOT_READY | 정의 G14638 / 소비 미확인 |
| 10 | `mpCostRed` | 771 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14495 / 소비 G28041 |
| 11 | `thorns` | 738 | ② PC 보호 | NOT_READY | 정의 G14457 / 소비 G43602 |
| 12 | `critRate` | 726 | ② PC 보호 | NOT_READY | 정의 G14396 / 소비 G27997 |
| 13 | `dropRate` | 709 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14466 / 소비 G27999 |
| 14 | `dotDR` | 683 | ② PC 보호 | NOT_READY | 정의 G14474 / 소비 G43532 |
| 15 | `critDmgW` | 628 | ② PC 보호 | NOT_READY | 정의 G14395,14397 / 소비 G27998 |
| 16 | `lightDR` | 626 | 소비처 미확인 | NOT_READY | 정의 G14650 / 소비 미확인 |
| 17 | `hpRegenFlat` | 572 | 소비처 미확인 | NOT_READY | 정의 G14642 / 소비 미확인 |
| 18 | `stRegenFlat` | 565 | 소비처 미확인 | NOT_READY | 정의 G14644 / 소비 미확인 |
| 19 | `freezeRes` | 564 | 소비처 미확인 | NOT_READY | 정의 G14656 / 소비 미확인 |
| 20 | `maxMPPct` | 529 | 소비처 미확인 | NOT_READY | 정의 G14672 / 소비 미확인 |
| 21 | `mpRegenFlat` | 523 | 소비처 미확인 | NOT_READY | 정의 G14646 / 소비 미확인 |
| 22 | `onHitThorns` | 516 | 소비처 미확인 | NOT_READY | 정의 G14601 / 소비 미확인 |
| 23 | `extraST` | 509 | ② PC 보호 | NOT_READY | 정의 G14469 / 소비 G32785,G63463 |
| 24 | `dashCooldown` | 508 | ② PC 보호 | NOT_READY | 정의 G14660 / 소비 G32789 |
| 25 | `fireDR` | 464 | 소비처 미확인 | NOT_READY | 정의 G14648 / 소비 미확인 |
| 26 | `stCostRed` | 464 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14496 / 소비 G31983 |
| 27 | `iceDR` | 462 | 소비처 미확인 | NOT_READY | 정의 G14649 / 소비 미확인 |
| 28 | `physDR` | 421 | ② PC 보호 | NOT_READY | 정의 G14455 / 소비 G43514 |
| 29 | `farDR` | 418 | ② PC 보호 | NOT_READY | 정의 G14477 / 소비 G43536 |
| 30 | `dodgeChance` | 417 | ② PC 보호 | NOT_READY | 정의 G14636 / 소비 G43432 |
| 31 | `ccRes` | 403 | ② PC 보호 | NOT_READY | 정의 G14459 / 소비 G34982,G43463,G43488,G43585 |
| 32 | `glovesCritDmg` | 400 | ② PC 보호 | NOT_READY | 정의 G14750 / 소비 G27998 |
| 33 | `skillCdRed` | 399 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14679 / 소비 G28065 |
| 34 | `headbandSpellDmg` | 374 | 소비처 미확인 | NOT_READY | 정의 G14808 / 소비 미확인 |
| 35 | `reflect` | 373 | ② PC 보호 | NOT_READY | 정의 G14456 / 소비 G43604 |
| 36 | `glovesAtkSpd` | 371 | ② PC 보호 | NOT_READY | 정의 G14749 / 소비 G33364,G58625,G58630,G58648 |
| 37 | `maxSTPct` | 371 | 소비처 미확인 | NOT_READY | 정의 G14671 / 소비 미확인 |
| 38 | `potionPower` | 368 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14468 / 소비 G28232,G35894,G35903 |
| 39 | `poisonDRdef` | 356 | 소비처 미확인 | NOT_READY | 정의 G14652 / 소비 미확인 |
| 40 | `pantsHPRegen` | 341 | 소비처 미확인 | NOT_READY | 정의 G14752 / 소비 미확인 |
| 41 | `glovesStagger` | 338 | 소비처 미확인 | NOT_READY | 정의 G14751 / 소비 미확인 |
| 42 | `onDodgeDmg` | 336 | 소비처 미확인 | NOT_READY | 정의 G14603 / 소비 미확인 |
| 43 | `arcTankDef` | 321 | 소비처 미확인 | NOT_READY | 정의 G14825 / 소비 미확인 |
| 44 | `onFullManaDmg` | 318 | 소비처 미확인 | NOT_READY | 정의 G14690 / 소비 미확인 |
| 45 | `fireDmgBns` | 316 | ② PC 보호 | NOT_READY | 정의 G14529 / 소비 G42218 |
| 46 | `mpRegenPct` | 314 | 소비처 미확인 | NOT_READY | 정의 G14647 / 소비 미확인 |
| 47 | `darkDmgBns` | 311 | ② PC 보호 | NOT_READY | 정의 G14550 / 소비 G42218 |
| 48 | `burnDR` | 310 | ② PC 보호 | NOT_READY | 정의 G14760 / 소비 G43533 |
| 49 | `darkDR` | 305 | 소비처 미확인 | NOT_READY | 정의 G14651 / 소비 미확인 |
| 50 | `lightDmgBns` | 305 | ② PC 보호 | NOT_READY | 정의 G14543 / 소비 G42218 |
| 51 | `headbandMPMax` | 302 | 소비처 미확인 | NOT_READY | 정의 G14805 / 소비 미확인 |
| 52 | `iceDmgBns` | 302 | ② PC 보호 | NOT_READY | 정의 G14536 / 소비 G42218 |
| 53 | `bowAtkSpd` | 299 | ② PC 보호 | NOT_READY | 정의 G14577 / 소비 G28696,G44961 |
| 54 | `lckFlatN` | 297 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14509 / 소비 G27996 |
| 55 | `headbandMPRegen` | 295 | 소비처 미확인 | NOT_READY | 정의 G14807 / 소비 미확인 |
| 56 | `headbandElemDmg` | 290 | 소비처 미확인 | NOT_READY | 정의 G14809 / 소비 미확인 |
| 57 | `shieldRegenPct` | 288 | 소비처 미확인 | NOT_READY | 정의 G14640 / 소비 미확인 |
| 58 | `headbandCastSpd` | 285 | ② PC 보호 | NOT_READY | 정의 G14806 / 소비 G28050 |
| 59 | `statusClean` | 279 | ② PC 보호 | NOT_READY | 정의 G14462 / 소비 G32745,G32745 |
| 60 | `healthyDef` | 278 | ② PC 보호 | NOT_READY | 정의 G14471 / 소비 G43530,G43530 |
| 61 | `knockbackRes` | 278 | 소비처 미확인 | NOT_READY | 정의 G14658 / 소비 미확인 |
| 62 | `cloakMSPct` | 277 | 소비처 미확인 | NOT_READY | 정의 G14758 / 소비 미확인 |
| 63 | `cloakElemDR` | 275 | 소비처 미확인 | NOT_READY | 정의 G14759 / 소비 미확인 |
| 64 | `hybStrDex` | 273 | 소비처 미확인 | NOT_READY | 정의 G14773 / 소비 미확인 |
| 65 | `afterParryShield` | 263 | 소비처 미확인 | NOT_READY | 정의 G14694 / 소비 미확인 |
| 66 | `pantsCCDuration` | 257 | 소비처 미확인 | NOT_READY | 정의 G14753 / 소비 미확인 |
| 67 | `pierceDmgKeep` | 255 | 소비처 미확인 | NOT_READY | 정의 G14712 / 소비 미확인 |
| 68 | `bowRange` | 253 | 소비처 미확인 | NOT_READY | 정의 G14707 / 소비 미확인 |
| 69 | `pierceFlat` | 249 | ② PC 보호 | NOT_READY | 정의 G14853 / 소비 G17348,G28035,G45114,G45172,G45190,G45223 |
| 70 | `projSpeedPct` | 249 | 소비처 미확인 | NOT_READY | 정의 G14582 / 소비 미확인 |
| 71 | `atkSpeed` | 245 | ② PC 보호 | NOT_READY | 정의 G14390 / 소비 G27994 |
| 72 | `skBlastShotDmg` | 240 | 소비처 미확인 | NOT_READY | 정의 G14619 / 소비 미확인 |
| 73 | `injuredDR` | 237 | ② PC 보호 | NOT_READY | 정의 G14472 / 소비 G43531 |
| 74 | `skBlueShotDmg` | 236 | 소비처 미확인 | NOT_READY | 정의 G14618 / 소비 미확인 |
| 75 | `bossDR` | 231 | ② PC 보호 | NOT_READY | 정의 G14475 / 소비 G43534 |
| 76 | `counterHit` | 230 | ② PC 보호 | NOT_READY | 정의 G14461 / 소비 G43600 |
| 77 | `skChainAssaultDmg` | 226 | 소비처 미확인 | NOT_READY | 정의 G14633 / 소비 미확인 |
| 78 | `hybStrInt` | 224 | 소비처 미확인 | NOT_READY | 정의 G14774 / 소비 미확인 |
| 79 | `potionCdRed` | 222 | ① 게임 시스템 | READY 자동 물약 CD 검증 | 정의 G14680 / 소비 G28228,G35898–35902 |
| 80 | `dropRateAcc` | 221 | 소비처 미확인 | NOT_READY | 정의 G14684 / 소비 미확인 |
| 81 | `splashDmg` | 221 | 소비처 미확인 | NOT_READY | 정의 G14715 / 소비 미확인 |
| 82 | `skMaliceStormDmg` | 220 | 소비처 미확인 | NOT_READY | 정의 G14621 / 소비 미확인 |
| 83 | `onHitDefBoost` | 219 | 소비처 미확인 | NOT_READY | 정의 G14600 / 소비 미확인 |
| 84 | `afterDodgeDmg` | 218 | 소비처 미확인 | NOT_READY | 정의 G14693 / 소비 미확인 |
| 85 | `splashRadius` | 217 | 소비처 미확인 | NOT_READY | 정의 G14714 / 소비 미확인 |
| 86 | `arcTankBlock` | 209 | 소비처 미확인 | NOT_READY | 정의 G14826 / 소비 미확인 |
| 87 | `bootsChargeRange` | 209 | 소비처 미확인 | NOT_READY | 정의 G14755 / 소비 미확인 |
| 88 | `cloakDodgeDR` | 208 | 소비처 미확인 | NOT_READY | 정의 G14757 / 소비 미확인 |
| 89 | `pierceChance` | 208 | 소비처 미확인 | NOT_READY | 정의 G14710 / 소비 미확인 |
| 90 | `skMaliceHuntDmg` | 208 | 소비처 미확인 | NOT_READY | 정의 G14629 / 소비 미확인 |
| 91 | `skMissileDmg` | 206 | 소비처 미확인 | NOT_READY | 정의 G14617 / 소비 미확인 |
| 92 | `skMaliceMortarDmg` | 205 | 소비처 미확인 | NOT_READY | 정의 G14625 / 소비 미확인 |
| 93 | `pickupRadius` | 204 | 소비처 미확인 | NOT_READY | 정의 G14663 / 소비 미확인 |
| 94 | `slowRes` | 204 | ② PC 보호 | NOT_READY | 정의 G14657 / 소비 G34699,G39934 |
| 95 | `armorDefPct` | 200 | 소비처 미확인 | NOT_READY | 정의 G14745 / 소비 미확인 |
| 96 | `dashRange` | 198 | 소비처 미확인 | NOT_READY | 정의 G14659 / 소비 미확인 |
| 97 | `beltSTMax` | 194 | 소비처 미확인 | NOT_READY | 정의 G14800 / 소비 미확인 |
| 98 | `dodgeCooldown` | 194 | 소비처 미확인 | NOT_READY | 정의 G14637 / 소비 미확인 |
| 99 | `hybDexInt` | 191 | 소비처 미확인 | NOT_READY | 정의 G14775 / 소비 미확인 |
| 100 | `goldFind` | 188 | 소비처 미확인 | NOT_READY | 정의 G14682 / 소비 미확인 |
| 101 | `shieldPct` | 188 | 소비처 미확인 | NOT_READY | 정의 G14639 / 소비 미확인 |
| 102 | `beltPotionHP` | 183 | 소비처 미확인 | NOT_READY | 정의 G14801 / 소비 미확인 |
| 103 | `beltGoldDrop` | 181 | 소비처 미확인 | NOT_READY | 정의 G14803 / 소비 미확인 |
| 104 | `arcRangerPierce` | 179 | 소비처 미확인 | NOT_READY | 정의 G14822 / 소비 미확인 |
| 105 | `pierceCount` | 179 | 소비처 미확인 | NOT_READY | 정의 G14711 / 소비 미확인 |
| 106 | `ringPoisonDmg` | 173 | 소비처 미확인 | NOT_READY | 정의 G14788 / 소비 미확인 |
| 107 | `ringFireDmg` | 172 | 소비처 미확인 | NOT_READY | 정의 G14784 / 소비 미확인 |
| 108 | `arcAssassinDodge` | 169 | 소비처 미확인 | NOT_READY | 정의 G14831 / 소비 미확인 |
| 109 | `bootsMSOnKill` | 169 | 소비처 미확인 | NOT_READY | 정의 G14756 / 소비 미확인 |
| 110 | `atkPctAll` | 168 | 소비처 미확인 | NOT_READY | 정의 G14705 / 소비 미확인 |
| 111 | `expBonusRing` | 168 | 소비처 미확인 | NOT_READY | 정의 G14683 / 소비 미확인 |
| 112 | `arcMageMP` | 166 | 소비처 미확인 | NOT_READY | 정의 G14817 / 소비 미확인 |
| 113 | `ringLightDmg` | 166 | 소비처 미확인 | NOT_READY | 정의 G14786 / 소비 미확인 |
| 114 | `arcRangerDmg` | 164 | 소비처 미확인 | NOT_READY | 정의 G14820 / 소비 미확인 |
| 115 | `shieldBlockDR` | 163 | ② PC 보호 | NOT_READY | 정의 G14746 / 소비 G28053 |
| 116 | `helmExpPct` | 162 | 소비처 미확인 | NOT_READY | 정의 G14764 / 소비 미확인 |
| 117 | `magicDmg` | 158 | ② PC 보호 | NOT_READY | 정의 G14393 / 소비 G28008 |
| 118 | `ringIceDmg` | 158 | 소비처 미확인 | NOT_READY | 정의 G14785 / 소비 미확인 |
| 119 | `fullManaDmg2` | 156 | 소비처 미확인 | NOT_READY | 정의 G14733 / 소비 미확인 |
| 120 | `arcRangerMS` | 155 | 소비처 미확인 | NOT_READY | 정의 G14823 / 소비 미확인 |
| 121 | `ringDarkDmg` | 155 | 소비처 미확인 | NOT_READY | 정의 G14787 / 소비 미확인 |
| 122 | `beltSTRegen` | 154 | 소비처 미확인 | NOT_READY | 정의 G14802 / 소비 미확인 |
| 123 | `aoeRadiusPct` | 152 | 소비처 미확인 | NOT_READY | 정의 G14568 / 소비 미확인 |
| 124 | `bootsDashDmg` | 151 | 소비처 미확인 | NOT_READY | 정의 G14754 / 소비 미확인 |
| 125 | `skBeamDmg` | 150 | 소비처 미확인 | NOT_READY | 정의 G14614 / 소비 미확인 |
| 126 | `shieldBashDmg` | 149 | 소비처 미확인 | NOT_READY | 정의 G14747 / 소비 미확인 |
| 127 | `stRegenPct` | 148 | 소비처 미확인 | NOT_READY | 정의 G14645 / 소비 미확인 |
| 128 | `onBlockHeal` | 145 | 소비처 미확인 | NOT_READY | 정의 G14605 / 소비 미확인 |
| 129 | `skFireballDmg` | 144 | 소비처 미확인 | NOT_READY | 정의 G14615 / 소비 미확인 |
| 130 | `barrier` | 143 | ② PC 보호 | NOT_READY | 정의 G14458 / 소비 G43526 |
| 131 | `shieldCdRed` | 143 | ② PC 보호 | NOT_READY | 정의 G14641 / 소비 G14308,G33050,G33365,G33550,G33581,G33652,G33802 |
| 132 | `hpRegenPct` | 142 | 소비처 미확인 | NOT_READY | 정의 G14643 / 소비 미확인 |
| 133 | `whileMovingDR` | 142 | 소비처 미확인 | NOT_READY | 정의 G14691 / 소비 미확인 |
| 134 | `arcRangerRange` | 141 | 소비처 미확인 | NOT_READY | 정의 G14821 / 소비 미확인 |
| 135 | `maliceWeakAmp` | 138 | ② PC 보호 | NOT_READY | 정의 G14616 / 소비 G24572 |
| 136 | `onBlockMana` | 138 | 소비처 미확인 | NOT_READY | 정의 G14606 / 소비 미확인 |
| 137 | `comboThreshold` | 136 | 소비처 미확인 | NOT_READY | 정의 G14695 / 소비 미확인 |
| 138 | `hybDropExp` | 136 | 소비처 미확인 | NOT_READY | 정의 G14777 / 소비 미확인 |
| 139 | `revivePow` | 135 | ② PC 보호 | NOT_READY | 정의 G14502 / 소비 G43741 |
| 140 | `shieldStagger` | 135 | 소비처 미확인 | NOT_READY | 정의 G14748 / 소비 미확인 |
| 141 | `lightDmgPct` | 133 | ② PC 보호 | NOT_READY | 정의 G14538 / 소비 G42218 |
| 142 | `ringMPOnKill` | 133 | 소비처 미확인 | NOT_READY | 정의 G14790 / 소비 미확인 |
| 143 | `skFireAuraDmg` | 133 | 소비처 미확인 | NOT_READY | 정의 G14626 / 소비 미확인 |
| 144 | `multiShot` | 132 | 소비처 미확인 | NOT_READY | 정의 G14709 / 소비 미확인 |
| 145 | `hybElemDotDmg` | 131 | 소비처 미확인 | NOT_READY | 정의 G14781 / 소비 미확인 |
| 146 | `skSpikeAuraDmg` | 131 | 소비처 미확인 | NOT_READY | 정의 G14632 / 소비 미확인 |
| 147 | `hybDefSpd` | 127 | 소비처 미확인 | NOT_READY | 정의 G14767 / 소비 미확인 |
| 148 | `resourceOnHit` | 127 | 소비처 미확인 | NOT_READY | 정의 G14673 / 소비 미확인 |
| 149 | `closeDR` | 125 | ② PC 보호 | NOT_READY | 정의 G14476 / 소비 G43536 |
| 150 | `darkDmgPct` | 125 | ② PC 보호 | NOT_READY | 정의 G14545 / 소비 G42218 |
| 151 | `whileStationaryDmg` | 121 | 소비처 미확인 | NOT_READY | 정의 G14692 / 소비 미확인 |
| 152 | `flatMagicDmg` | 120 | 소비처 미확인 | NOT_READY | 정의 G14723 / 소비 미확인 |
| 153 | `reviveCd` | 120 | ② PC 보호 | NOT_READY | 정의 G14503 / 소비 G43747 |
| 154 | `skDarkPillarDmg` | 117 | 소비처 미확인 | NOT_READY | 정의 G14630 / 소비 미확인 |
| 155 | `poisonResMax` | 116 | 소비처 미확인 | NOT_READY | 정의 G14678 / 소비 미확인 |
| 156 | `skIceOrbDmg` | 115 | 소비처 미확인 | NOT_READY | 정의 G14627 / 소비 미확인 |
| 157 | `castSpeed` | 114 | ② PC 보호 | NOT_READY | 정의 G14578 / 소비 G28050 |
| 158 | `expBonus` | 114 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14498 / 소비 G43143 |
| 159 | `armorPen` | 113 | 소비처 미확인 | NOT_READY | 정의 G14381 / 소비 미확인 |
| 160 | `arcTankThorns` | 112 | 소비처 미확인 | NOT_READY | 정의 G14827 / 소비 미확인 |
| 161 | `fireResMax` | 112 | 소비처 미확인 | NOT_READY | 정의 G14674 / 소비 미확인 |
| 162 | `skFireBeamDmg` | 112 | 소비처 미확인 | NOT_READY | 정의 G14628 / 소비 미확인 |
| 163 | `fireDmgPct` | 110 | ② PC 보호 | NOT_READY | 정의 G14524 / 소비 G42218 |
| 164 | `iceResMax` | 110 | 소비처 미확인 | NOT_READY | 정의 G14675 / 소비 미확인 |
| 165 | `ringProjPierce` | 110 | 소비처 미확인 | NOT_READY | 정의 G14791 / 소비 미확인 |
| 166 | `arcWarriorPoise` | 107 | 소비처 미확인 | NOT_READY | 정의 G14815 / 소비 미확인 |
| 167 | `arcTankHP` | 106 | 소비처 미확인 | NOT_READY | 정의 G14824 / 소비 미확인 |
| 168 | `lifeHealPow` | 104 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14507 / 소비 G32713 |
| 169 | `lightResMax` | 104 | 소비처 미확인 | NOT_READY | 정의 G14676 / 소비 미확인 |
| 170 | `skPlagueDmg` | 104 | 소비처 미확인 | NOT_READY | 정의 G14631 / 소비 미확인 |
| 171 | `arcWarriorHP` | 102 | 소비처 미확인 | NOT_READY | 정의 G14813 / 소비 미확인 |
| 172 | `hybLckGrit` | 102 | 소비처 미확인 | NOT_READY | 정의 G14776 / 소비 미확인 |
| 173 | `iceDmgPct` | 102 | ② PC 보호 | NOT_READY | 정의 G14531 / 소비 G42218 |
| 174 | `onParryBurst` | 100 | 소비처 미확인 | NOT_READY | 정의 G14604 / 소비 미확인 |
| 175 | `arcMageDmg` | 98 | 소비처 미확인 | NOT_READY | 정의 G14816 / 소비 미확인 |
| 176 | `flatPhysDmg` | 98 | 소비처 미확인 | NOT_READY | 정의 G14697 / 소비 미확인 |
| 177 | `endDEX` | 97 | 소비처 미확인 | NOT_READY | 정의 G14848 / 소비 미확인 |
| 178 | `endINT` | 97 | 소비처 미확인 | NOT_READY | 정의 G14849 / 소비 미확인 |
| 179 | `iceDuration` | 97 | 소비처 미확인 | NOT_READY | 정의 G14535 / 소비 미확인 |
| 180 | `allRes` | 96 | 소비처 미확인 | NOT_READY | 정의 G14490 / 소비 미확인 |
| 181 | `flatLightDmg` | 96 | 소비처 미확인 | NOT_READY | 정의 G14700 / 소비 미확인 |
| 182 | `hybMeleeSpell` | 96 | 소비처 미확인 | NOT_READY | 정의 G14780 / 소비 미확인 |
| 183 | `hybMPST` | 95 | 소비처 미확인 | NOT_READY | 정의 G14771 / 소비 미확인 |
| 184 | `skHellRayDmg` | 93 | 소비처 미확인 | NOT_READY | 정의 G14620 / 소비 미확인 |
| 185 | `skillBoost` | 91 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14387 / 소비 G44557 |
| 186 | `arcMageShield` | 90 | 소비처 미확인 | NOT_READY | 정의 G14818 / 소비 미확인 |
| 187 | `eliteDR` | 90 | 소비처 미확인 | NOT_READY | 정의 G14654 / 소비 미확인 |
| 188 | `cooldownRed` | 89 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14392 / 소비 G28065 |
| 189 | `lightDuration` | 89 | 소비처 미확인 | NOT_READY | 정의 G14542 / 소비 미확인 |
| 190 | `demonDmg` | 88 | 소비처 미확인 | NOT_READY | 정의 G14685 / 소비 미확인 |
| 191 | `endSTR` | 88 | 소비처 미확인 | NOT_READY | 정의 G14847 / 소비 미확인 |
| 192 | `parryBonus` | 88 | ② PC 보호 | NOT_READY | 정의 G14391 / 소비 G28036,G34858,G34859,G38481 |
| 193 | `igniteDmg` | 85 | 소비처 미확인 | NOT_READY | 정의 G14740 / 소비 미확인 |
| 194 | `darkDuration` | 84 | 소비처 미확인 | NOT_READY | 정의 G14549 / 소비 미확인 |
| 195 | `helmCastSpd` | 83 | 소비처 미확인 | NOT_READY | 정의 G14762 / 소비 미확인 |
| 196 | `darkResMax` | 82 | 소비처 미확인 | NOT_READY | 정의 G14677 / 소비 미확인 |
| 197 | `demonDR` | 82 | 소비처 미확인 | NOT_READY | 정의 G14686 / 소비 미확인 |
| 198 | `hybHPMP` | 81 | 소비처 미확인 | NOT_READY | 정의 G14769 / 소비 미확인 |
| 199 | `meleeAtkSpd` | 81 | ② PC 보호 | NOT_READY | 정의 G14576 / 소비 G33364,G58625,G58630,G58648 |
| 200 | `poisonDuration` | 81 | 소비처 미확인 | NOT_READY | 정의 G14556 / 소비 미확인 |
| 201 | `flatFireDmg` | 80 | 소비처 미확인 | NOT_READY | 정의 G14698 / 소비 미확인 |
| 202 | `frostbiteDmg` | 80 | 소비처 미확인 | NOT_READY | 정의 G14741 / 소비 미확인 |
| 203 | `bleedDps` | 79 | 소비처 미확인 | NOT_READY | 정의 G14721 / 소비 미확인 |
| 204 | `flatDarkDmg` | 77 | 소비처 미확인 | NOT_READY | 정의 G14701 / 소비 미확인 |
| 205 | `hybHPST` | 77 | 소비처 미확인 | NOT_READY | 정의 G14770 / 소비 미확인 |
| 206 | `fireDuration` | 76 | 소비처 미확인 | NOT_READY | 정의 G14528 / 소비 미확인 |
| 207 | `neckSkillDmg` | 76 | 소비처 미확인 | NOT_READY | 정의 G14796 / 소비 미확인 |
| 208 | `arcMageElemDmg` | 75 | 소비처 미확인 | NOT_READY | 정의 G14819 / 소비 미확인 |
| 209 | `hybAtkHP` | 72 | 소비처 미확인 | NOT_READY | 정의 G14766 / 소비 미확인 |
| 210 | `rageMaxFlat` | 72 | ② PC 보호 | NOT_READY | 정의 G14440 / 소비 G27890 |
| 211 | `flatIceDmg` | 71 | 소비처 미확인 | NOT_READY | 정의 G14699 / 소비 미확인 |
| 212 | `lifeLeechBr` | 71 | 소비처 미확인 | NOT_READY | 정의 G14688 / 소비 미확인 |
| 213 | `minDmgFlat` | 71 | 소비처 미확인 | NOT_READY | 정의 G14703 / 소비 미확인 |
| 214 | `helmMPPct` | 70 | 소비처 미확인 | NOT_READY | 정의 G14761 / 소비 미확인 |
| 215 | `neckCritDmg` | 70 | ② PC 보호 | NOT_READY | 정의 G14794 / 소비 G27998 |
| 216 | `ringDmgPerCombo` | 70 | 소비처 미확인 | NOT_READY | 정의 G14789 / 소비 미확인 |
| 217 | `hybAllRegen` | 69 | 소비처 미확인 | NOT_READY | 정의 G14772 / 소비 미확인 |
| 218 | `shockDmg` | 69 | 소비처 미확인 | NOT_READY | 정의 G14742 / 소비 미확인 |
| 219 | `flatPoisonDmg` | 68 | 소비처 미확인 | NOT_READY | 정의 G14702 / 소비 미확인 |
| 220 | `weaponRange` | 67 | 소비처 미확인 | NOT_READY | 정의 G14706 / 소비 미확인 |
| 221 | `neckComboMax` | 66 | 소비처 미확인 | NOT_READY | 정의 G14797 / 소비 미확인 |
| 222 | `maxDmgFlat` | 65 | 소비처 미확인 | NOT_READY | 정의 G14704 / 소비 미확인 |
| 223 | `dashBoost` | 64 | ② PC 보호 | NOT_READY | 정의 G14386 / 소비 G32291,G33979 |
| 224 | `neckKillHeal` | 64 | 소비처 미확인 | NOT_READY | 정의 G14798 / 소비 미확인 |
| 225 | `endDropBonus` | 63 | 소비처 미확인 | NOT_READY | 정의 G14845 / 소비 미확인 |
| 226 | `soulHarvest` | 63 | 소비처 미확인 | NOT_READY | 정의 G14687 / 소비 미확인 |
| 227 | `bleedDuration` | 60 | 소비처 미확인 | NOT_READY | 정의 G14722 / 소비 미확인 |
| 228 | `helmCooldown` | 60 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14763 / 소비 G28065 |
| 229 | `spellAmp` | 58 | 소비처 미확인 | NOT_READY | 정의 G14724 / 소비 미확인 |
| 230 | `endMaliceGain` | 57 | 소비처 미확인 | NOT_READY | 정의 G14846 / 소비 미확인 |
| 231 | `neckAllDmg` | 56 | 소비처 미확인 | NOT_READY | 정의 G14793 / 소비 미확인 |
| 232 | `counterAtkDmg` | 54 | 소비처 미확인 | NOT_READY | 정의 G14717 / 소비 미확인 |
| 233 | `armorShred` | 51 | 소비처 미확인 | NOT_READY | 정의 G14581 / 소비 미확인 |
| 234 | `firePen` | 51 | 소비처 미확인 | NOT_READY | 정의 G14525 / 소비 미확인 |
| 235 | `craftBonus` | 50 | 소비처 미확인 | NOT_READY | 정의 G14681 / 소비 미확인 |
| 236 | `chargeAtkDmg` | 49 | 소비처 미확인 | NOT_READY | 정의 G14716 / 소비 미확인 |
| 237 | `endShield` | 49 | 소비처 미확인 | NOT_READY | 정의 G14835 / 소비 미확인 |
| 238 | `icePen` | 48 | 소비처 미확인 | NOT_READY | 정의 G14532 / 소비 미확인 |
| 239 | `overhealShield` | 47 | 소비처 미확인 | NOT_READY | 정의 G14689 / 소비 미확인 |
| 240 | `dotTickRate` | 46 | 소비처 미확인 | NOT_READY | 정의 G14720 / 소비 미확인 |
| 241 | `onHitSlow` | 45 | 소비처 미확인 | NOT_READY | 정의 G14592 / 소비 미확인 |
| 242 | `lightPen` | 42 | 소비처 미확인 | NOT_READY | 정의 G14539 / 소비 미확인 |
| 243 | `neckElemPen` | 42 | 소비처 미확인 | NOT_READY | 정의 G14795 / 소비 미확인 |
| 244 | `slowEfficiency` | 41 | 소비처 미확인 | NOT_READY | 정의 G14737 / 소비 미확인 |
| 245 | `endPoise` | 40 | 소비처 미확인 | NOT_READY | 정의 G14842 / 소비 미확인 |
| 246 | `onHitPoison` | 40 | 소비처 미확인 | NOT_READY | 정의 G14589 / 소비 미확인 |
| 247 | `iceBurst` | 39 | 소비처 미확인 | NOT_READY | 정의 G14534 / 소비 미확인 |
| 248 | `skGhostWalkDmg` | 39 | 소비처 미확인 | NOT_READY | 정의 G14624 / 소비 미확인 |
| 249 | `skGiantSlamDmg` | 37 | 소비처 미확인 | NOT_READY | 정의 G14623 / 소비 미확인 |
| 250 | `chainDmgKeep` | 36 | 소비처 미확인 | NOT_READY | 정의 G14713 / 소비 미확인 |
| 251 | `skChainSlashDmg` | 36 | 소비처 미확인 | NOT_READY | 정의 G14622 / 소비 미확인 |
| 252 | `freezeDuration` | 35 | 소비처 미확인 | NOT_READY | 정의 G14736 / 소비 미확인 |
| 253 | `lightBurst` | 35 | 소비처 미확인 | NOT_READY | 정의 G14541 / 소비 미확인 |
| 254 | `poisonPen` | 35 | 소비처 미확인 | NOT_READY | 정의 G14553 / 소비 미확인 |
| 255 | `darkPen` | 34 | 소비처 미확인 | NOT_READY | 정의 G14546 / 소비 미확인 |
| 256 | `killStreakSpd` | 34 | 소비처 미확인 | NOT_READY | 정의 G14726 / 소비 미확인 |
| 257 | `onHitWeaken` | 34 | 소비처 미확인 | NOT_READY | 정의 G14591 / 소비 미확인 |
| 258 | `rageDmg` | 34 | ② PC 보호 | NOT_READY | 정의 G14441 / 소비 G46466 |
| 259 | `allDR` | 33 | 소비처 미확인 | NOT_READY | 정의 G14653 / 소비 미확인 |
| 260 | `bleedStack` | 33 | 소비처 미확인 | NOT_READY | 정의 G14739 / 소비 미확인 |
| 261 | `freshKillDmg` | 33 | 소비처 미확인 | NOT_READY | 정의 G14734 / 소비 미확인 |
| 262 | `onHitMark` | 33 | 소비처 미확인 | NOT_READY | 정의 G14593 / 소비 미확인 |
| 263 | `skWhirlDmg` | 33 | 소비처 미확인 | NOT_READY | 정의 G14613 / 소비 미확인 |
| 264 | `endLCK` | 31 | 소비처 미확인 | NOT_READY | 정의 G14850 / 소비 미확인 |
| 265 | `movingDmg` | 31 | 소비처 미확인 | NOT_READY | 정의 G14729 / 소비 미확인 |
| 266 | `poisonBurst` | 31 | 소비처 미확인 | NOT_READY | 정의 G14555 / 소비 미확인 |
| 267 | `standingDmg` | 30 | 소비처 미확인 | NOT_READY | 정의 G14728 / 소비 미확인 |
| 268 | `fullStaminaDmg` | 29 | 소비처 미확인 | NOT_READY | 정의 G14732 / 소비 미확인 |
| 269 | `stunDuration` | 29 | 소비처 미확인 | NOT_READY | 정의 G14735 / 소비 미확인 |
| 270 | `elemPenAll` | 28 | 소비처 미확인 | NOT_READY | 정의 G14579 / 소비 미확인 |
| 271 | `momentumDmg` | 28 | 소비처 미확인 | NOT_READY | 정의 G14727 / 소비 미확인 |
| 272 | `arcAssassinPoison` | 27 | 소비처 미확인 | NOT_READY | 정의 G14830 / 소비 미확인 |
| 273 | `onHitChainL` | 27 | 소비처 미확인 | NOT_READY | 정의 G14586 / 소비 미확인 |
| 274 | `backstabDmg` | 26 | 소비처 미확인 | NOT_READY | 정의 G14718 / 소비 미확인 |
| 275 | `fireBurst` | 26 | 소비처 미확인 | NOT_READY | 정의 G14527 / 소비 미확인 |
| 276 | `poisonStack` | 26 | 소비처 미확인 | NOT_READY | 정의 G14738 / 소비 미확인 |
| 277 | `shieldBypass` | 26 | 소비처 미확인 | NOT_READY | 정의 G14580 / 소비 미확인 |
| 278 | `arcWarriorLifeSteal` | 25 | 소비처 미확인 | NOT_READY | 정의 G14814 / 소비 미확인 |
| 279 | `critMultiOnLowHP` | 25 | 소비처 미확인 | NOT_READY | 정의 G14743 / 소비 미확인 |
| 280 | `endSurvival` | 25 | 소비처 미확인 | NOT_READY | 정의 G14834 / 소비 미확인 |
| 281 | `endExpBonus` | 24 | 소비처 미확인 | NOT_READY | 정의 G14844 / 소비 미확인 |
| 282 | `arcAssassinCrit` | 23 | 소비처 미확인 | NOT_READY | 정의 G14828 / 소비 미확인 |
| 283 | `hybFireIce` | 22 | 소비처 미확인 | NOT_READY | 정의 G14778 / 소비 미확인 |
| 284 | `killStreakDmg` | 22 | 소비처 미확인 | NOT_READY | 정의 G14725 / 소비 미확인 |
| 285 | `onHitFireball` | 21 | 소비처 미확인 | NOT_READY | 정의 G14585 / 소비 미확인 |
| 286 | `allStat` | 20 | 소비처 미확인 | NOT_READY | 정의 G14670 / 소비 미확인 |
| 287 | `arcWarriorDmg` | 20 | 소비처 미확인 | NOT_READY | 정의 G14812 / 소비 미확인 |
| 288 | `darkBurst` | 20 | 소비처 미확인 | NOT_READY | 정의 G14548 / 소비 미확인 |
| 289 | `endAllDmg` | 20 | 소비처 미확인 | NOT_READY | 정의 G14839 / 소비 미확인 |
| 290 | `executeDmg` | 20 | 소비처 미확인 | NOT_READY | 정의 G14719 / 소비 미확인 |
| 291 | `endAllDR` | 18 | 소비처 미확인 | NOT_READY | 정의 G14840 / 소비 미확인 |
| 292 | `endGrit` | 18 | 소비처 미확인 | NOT_READY | 정의 G14851 / 소비 미확인 |
| 293 | `hybLightDark` | 18 | 소비처 미확인 | NOT_READY | 정의 G14779 / 소비 미확인 |
| 294 | `recentParryDmg` | 18 | 소비처 미확인 | NOT_READY | 정의 G14730 / 소비 미확인 |
| 295 | `endCooldownAll` | 17 | ① 게임 시스템 | READY 게임 부분 검증 | 정의 G14843 / 소비 G28065 |
| 296 | `nearDeathDmg` | 17 | 소비처 미확인 | NOT_READY | 정의 G14731 / 소비 미확인 |
| 297 | `arcAssassinBack` | 12 | 소비처 미확인 | NOT_READY | 정의 G14829 / 소비 미확인 |
| 298 | `doubleStrike` | 12 | 소비처 미확인 | NOT_READY | 정의 G14708 / 소비 미확인 |
| 299 | `endAllRes` | 12 | 소비처 미확인 | NOT_READY | 정의 G14838 / 소비 미확인 |
| 300 | `endLeech` | 12 | 소비처 미확인 | NOT_READY | 정의 G14841 / 소비 미확인 |
| 301 | `endAtkFlat` | 11 | 소비처 미확인 | NOT_READY | 정의 G14837 / 소비 미확인 |
| 302 | `endBossKiller` | 10 | 소비처 미확인 | NOT_READY | 정의 G14833 / 소비 미확인 |
| 303 | `endKillChain` | 10 | 소비처 미확인 | NOT_READY | 정의 G14852 / 소비 미확인 |
| 304 | `hybCritLeech` | 10 | 소비처 미확인 | NOT_READY | 정의 G14768 / 소비 미확인 |
| 305 | `endCritDmg` | 6 | 소비처 미확인 | NOT_READY | 정의 G14836 / 소비 미확인 |
| 306 | `kiSlashParry` | 0 | ② PC 보호 | NOT_READY | 정의 G14608 / 소비 G16826 |


## 2026-10-21 integ-fix 통합 검수 보충

82ad1813 인수 후 현재 cache는14id다. `test_demo11_24b_system_effects.gd`의 potionCdRed 관측은 State의 live owner가 pause 중 거부하므로, 해당 동기 read 전후에만 tree를 재개/정지한다(프레임 진행0). 자동물약 oracle는 실제 사용해 regen까지 읽은 사례에만 potion_cd_affix 조회를 기대하며 비사용 사례에 조회를 추가하지 않는다. 제품 guard·식·캐시·원본 oracle는 변경하지 않았다. 최종 결과와 초기 하니스 실패는 [통합 수정 보고서](../engine/orders/reports/integ-fix_REPORT.md)에 구분한다.
