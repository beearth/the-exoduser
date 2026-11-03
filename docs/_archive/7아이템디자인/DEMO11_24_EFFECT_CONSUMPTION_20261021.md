# DEMO11-24 — 1-1 데모 affix 소비와 우선순위

기준은 fetch한 `origin/main=0138c5bb9188d27cee10cb1a901d075092ddb88f`에 인수된 22r `d276e02ed3bc8c6610c2a3d5c1404c14a515fe3c`를 정상 merge한 지점이다. 원본 수식·아이템 데이터·hurtE·Player·State 저장 형식을 수정하지 않는다. 기존 ITEMS/WEAPONS 추적의 범위를 재사용한다. 아래 READY는 실제 장착 transaction의 PC `equipment_refresh`가 성공한 뒤의 **해당 id applyStats 소비**에 한정한다. 피해 효과 완료나 전설·유니크 특수효과 구현 완료를 뜻하지 않는다.

## 원본 분모와 실제 빈도의 한계

`game.html` G16646–16650: 기본 build target demo, 레벨 상한 100, 마지막 stage 0, 금지 7 id. G14364–14856: AFFIX_POOL **409레코드/407고유 id**. G15131–15174: 슬롯·팔찌 subtype·등급·T1 null·중복 group을 적용한 순차 가중 롤. G15176–15178: ossuary 제외 16개 드랍 슬롯, headband2는 G15895의 headband 생성 후 슬롯만 변경. G16107–16114: 팔찌 demon/life 각 1/2. G32002–32033: 일반/엘리트/미니/스테이지보스의 서로 다른 희귀도 가중치와 드랍 수. stage 0은 장 최종 stage가 아니므로 chapterBoss 분포를 합치지 않는다. 최소 줍기 등급·레벨 필터가 있으면 결과 분포가 달라진다.

원본 금지 7종 `sharpAtk, brutalAtk, ruinAtk, overkilDmg, staggerExplosion, parryExplosion, elemConvert`와 T1 null의 원본 제외를 반영하면 **398 후보 레코드/396 고유 id**다. 슬롯 변형 중복 `critDmgW`, `antiRevive`를 id 하나로 합치되 원본 variant 근거는 생성 JSON에 모두 보존한다. 추정 생성 목록이 아니라 원본 literal·함수 실행에 근거한 롤 후보이며, 장착된 고정 지급·복원 장비의 별도 경로와 혼동하지 않는다.

빈도 표는 **각 몹 등급에서 성공한 장비 드랍 100,000회씩** 원본 `rollAffixes`를 실행한 고정 seed 2026102124 관측값이다. 원본 확률의 정확한 해석적 값이나 플레이 한 판의 실측 빈도가 아니다. 레벨 1, 필터 없음, 슬롯 균등이며 실제 몬스터 구성·플레이어 성장·필터 설정이 미확인이므로 전체 판의 혼합 빈도는 **미확인**이다. 일반몹 순서로 정렬하며, 실제 처치 빈도 환산에는 원본 드랍 확률·statDropBonus·dropCount를 별도로 적용해야 한다. 낮은 빈도의 근접 순위는 표본 오차가 있다. 등급별 열을 분리하여 임의 몬스터 비율을 발명하지 않는다. 원본 tier/value 수식을 제품에 복제하지 않았으며 생성기에서 원본 함수를 직접 실행한다.

## 소비 연결과 보호 경계

18개 스탯 id는 기존 `native_inventory_equipment.gd`가 이미 호출하는 PC API 1회로 끝낸다. 새 `native_equipment_effect_consumption.gd`는 그 성공 receipt와 같은 실제 INV를 관찰해 id별 합산값·소비 경로·before/after를 반환한다. 계산은 기존 affix reader와 기존 PC producer만 사용하며 두 번째 재계산·임시 actor 쓰기·피해 호출은 없다. affix 조회 전후 캐시 token identity를 복원하고 tick callback·목록 생성 API·공유 RNG를 추가하지 않는다. 실패 refresh는 NOT_READY이고 성공한 장착도 개별 미검증 id는 NOT_READY다. 하나라도 미검증 id가 있으면 receipt 전체는 PARTIAL이며 ready_ids/not_ready_ids를 분리한다.

hurtE 본문에서 직접 읽는 후보 **72고유 id/73레코드**는 `PC_hurtE_protected`로 명시한다. 그 외 **306 id**는 이벤트·피격·유틸·간접 소비를 이 단위에서 입증하지 않았으므로 `consumer_not_verified`다. 후자를 효과 없음으로 단정하거나 완료 분자에 넣지 않는다. 레전드19/유니크39 특수 stat과 implicit17은 기존 ITEMS 추적 분모를 참조하며 이번 affix396에 합치지 않는다.

**PC 요청:** 아래 표에서 `hurtE`인 id 각각의 기존 `_eqAffix(id)` 소비를 실제 보호 경로에 연결하고, 피해/상태·처치 이벤트 readback 계약을 제공해야 한다. 공통 피해 수식 복제나 장착 단계의 피해 적용으로 대체하지 않는다. `owner_unverified`는 별도 소비 owner를 확인한 뒤 범위를 배정한다. 현재 native `kill_reward/drop_item_source.gd:62`는 정식 빌드 경로로 데모 금지 필터를 비활성화하고, 생성 호출자는 보호 파일 `native_normal_enemy_hurte.gd`다. 따라서 웹 데모 금지 7종이 native에서 생성될 수 있는 차이가 있다. 보호 호출자를 수정하지 않았으며 PC에 demo-mode 생성 인자/계약을 요청한다. 이 차이를 허용 목록 적용 완료로 보고하지 않는다.

## 원본·docs 불일치와 재생성

기존 `아이템_어픽스_시스템.md`의 397종·다른 과거 문서의 55종/402종은 최신 원본의 409레코드/407고유 id와 다르다. 이 문서는 원본 최신 분모를 사용하며 과거 문서의 확률·밸런스를 제품에 덮어쓰지 않는다. minGrade가 높아도 원본 희귀도 가중치의 0이 아닌 경로가 있으므로 드물다는 이유로 후보를 삭제하지 않는다. `lastStand/reviveOnce`처럼 T1 null로 롤에서 제외되는 id를 고등급이면 나온다고 추정하지 않는다.

`godot/tests/build_demo11_24_catalog.mjs --source-game=game.html --out-file=godot/data/demo11_equipment_effect_routes.json`을 명시 Node 바이너리로 실행하면 source SHA·원본 함수 행·variant·고정 seed 관측값이 재생성된다. 데이터 파일은 효과 구현용 새 수치 테이블이 아니라 원본에서 생성한 라우팅/우선순위 근거다. 원본 game.html이 바뀌면 재생성·재검증해야 한다.

| 순위 | id | 일반 | 엘리트 | 미니 | 스테이지 보스 | 소비/판정 | 원본 행 |
|---:|---|---:|---:|---:|---:|---|---|
| 1 | `defFlat` | 3166 | 7665 | 11430 | 16764 | equipment_refresh / READY 검증 | G14449 |
| 2 | `maxHPFlat` | 2797 | 6904 | 10510 | 15473 | equipment_refresh / READY 검증 | G14450 |
| 3 | `shieldFlat` | 2564 | 6094 | 9518 | 14211 | equipment_refresh / READY 검증 | G14451 |
| 4 | `iceRes` | 2024 | 4838 | 6714 | 8945 | owner_unverified / NOT_READY | G14486 |
| 5 | `lightRes` | 2007 | 4815 | 6597 | 8844 | owner_unverified / NOT_READY | G14487 |
| 6 | `fireRes` | 2004 | 4785 | 6586 | 8840 | owner_unverified / NOT_READY | G14485 |
| 7 | `maxMPFlat` | 1874 | 4605 | 6749 | 10206 | equipment_refresh / READY 검증 | G14494 |
| 8 | `maxSTFlat` | 1872 | 4442 | 6645 | 10396 | equipment_refresh / READY 검증 | G14493 |
| 9 | `darkRes` | 1836 | 4313 | 5961 | 8206 | owner_unverified / NOT_READY | G14488 |
| 10 | `poisonRes` | 1743 | 4314 | 6133 | 8154 | owner_unverified / NOT_READY | G14489 |
| 11 | `lckFlatR` | 1716 | 4102 | 6331 | 9240 | owner_unverified / NOT_READY | G14510 |
| 12 | `dexFlat` | 1509 | 3534 | 5620 | 8492 | equipment_refresh / READY 검증 | G14667 |
| 13 | `intFlat` | 1493 | 3672 | 5496 | 8426 | equipment_refresh / READY 검증 | G14668 |
| 14 | `vitFlat` | 1479 | 3656 | 5553 | 8419 | equipment_refresh / READY 검증 | G14669 |
| 15 | `gritFlatR` | 1478 | 3632 | 4950 | 6683 | equipment_refresh / READY 검증 | G14512 |
| 16 | `strFlat` | 1476 | 3756 | 5457 | 8327 | equipment_refresh / READY 검증 | G14666 |
| 17 | `movSpeed` | 868 | 2052 | 3129 | 4581 | equipment_refresh / READY 검증 | G14453 |
| 18 | `stunRes` | 852 | 1970 | 2807 | 3703 | owner_unverified / NOT_READY | G14655 |
| 19 | `eDefFlat` | 823 | 1994 | 2696 | 3687 | owner_unverified / NOT_READY | G14491 |
| 20 | `maxHPPctArmor` | 816 | 2128 | 3198 | 4925 | owner_unverified / NOT_READY | G14638 |
| 21 | `mpCostRed` | 771 | 1863 | 2732 | 4120 | owner_unverified / NOT_READY | G14495 |
| 22 | `thorns` | 738 | 1748 | 2493 | 3223 | owner_unverified / NOT_READY | G14457 |
| 23 | `critRate` | 726 | 1904 | 2857 | 4490 | owner_unverified / NOT_READY | G14396 |
| 24 | `dropRate` | 709 | 1684 | 2358 | 3224 | owner_unverified / NOT_READY | G14466 |
| 25 | `dotDR` | 683 | 1648 | 2320 | 3001 | owner_unverified / NOT_READY | G14474 |
| 26 | `critDmgW` | 628 | 1668 | 2311 | 3160 | owner_unverified / NOT_READY | G14395,14397 |
| 27 | `lightDR` | 626 | 1433 | 2046 | 2745 | owner_unverified / NOT_READY | G14650 |
| 28 | `movSpeedOOC` | 596 | 1525 | 2409 | 3489 | equipment_refresh / READY 검증 | G14662 |
| 29 | `hpOnKill` | 572 | 1339 | 1914 | 2543 | hurtE / NOT_READY | G14478 |
| 30 | `hpRegenFlat` | 572 | 1372 | 2108 | 3291 | owner_unverified / NOT_READY | G14642 |
| 31 | `stRegenFlat` | 565 | 1430 | 2174 | 3323 | owner_unverified / NOT_READY | G14644 |
| 32 | `freezeRes` | 564 | 1378 | 1848 | 2549 | owner_unverified / NOT_READY | G14656 |
| 33 | `maxMPPct` | 529 | 1255 | 1935 | 2855 | owner_unverified / NOT_READY | G14672 |
| 34 | `mpRegenFlat` | 523 | 1302 | 2010 | 2935 | owner_unverified / NOT_READY | G14646 |
| 35 | `onHitThorns` | 516 | 1193 | 1727 | 2235 | owner_unverified / NOT_READY | G14601 |
| 36 | `extraST` | 509 | 1219 | 1749 | 2302 | owner_unverified / NOT_READY | G14469 |
| 37 | `dashCooldown` | 508 | 1113 | 1682 | 2084 | owner_unverified / NOT_READY | G14660 |
| 38 | `fireDR` | 464 | 1120 | 1577 | 2079 | owner_unverified / NOT_READY | G14648 |
| 39 | `stCostRed` | 464 | 1211 | 1811 | 2845 | owner_unverified / NOT_READY | G14496 |
| 40 | `iceDR` | 462 | 1142 | 1519 | 2126 | owner_unverified / NOT_READY | G14649 |
| 41 | `physDR` | 421 | 1115 | 1564 | 2065 | owner_unverified / NOT_READY | G14455 |
| 42 | `farDR` | 418 | 959 | 1430 | 1748 | owner_unverified / NOT_READY | G14477 |
| 43 | `dodgeChance` | 417 | 1135 | 1530 | 2129 | owner_unverified / NOT_READY | G14636 |
| 44 | `kiSlashFullCrit` | 404 | 965 | 1330 | 1883 | hurtE / NOT_READY | G14610 |
| 45 | `ccRes` | 403 | 1039 | 1416 | 1904 | owner_unverified / NOT_READY | G14459 |
| 46 | `glovesCritDmg` | 400 | 951 | 1390 | 1771 | owner_unverified / NOT_READY | G14750 |
| 47 | `skillCdRed` | 399 | 911 | 1393 | 1875 | owner_unverified / NOT_READY | G14679 |
| 48 | `antiRevive` | 381 | 850 | 1161 | 1609 | hurtE / NOT_READY | G14499,14500 |
| 49 | `headbandSpellDmg` | 374 | 885 | 1234 | 1664 | owner_unverified / NOT_READY | G14808 |
| 50 | `reflect` | 373 | 952 | 1402 | 1753 | owner_unverified / NOT_READY | G14456 |
| 51 | `glovesAtkSpd` | 371 | 809 | 1266 | 2013 | owner_unverified / NOT_READY | G14749 |
| 52 | `maxSTPct` | 371 | 926 | 1460 | 2028 | owner_unverified / NOT_READY | G14671 |
| 53 | `potionPower` | 368 | 910 | 1217 | 1591 | owner_unverified / NOT_READY | G14468 |
| 54 | `poisonDRdef` | 356 | 795 | 1075 | 1416 | owner_unverified / NOT_READY | G14652 |
| 55 | `rangedDmgPct` | 352 | 843 | 1243 | 1971 | hurtE / NOT_READY | G14563 |
| 56 | `pantsHPRegen` | 341 | 852 | 1300 | 1976 | owner_unverified / NOT_READY | G14752 |
| 57 | `glovesStagger` | 338 | 774 | 1263 | 1904 | owner_unverified / NOT_READY | G14751 |
| 58 | `onDodgeDmg` | 336 | 877 | 1164 | 1535 | owner_unverified / NOT_READY | G14603 |
| 59 | `arcTankDef` | 321 | 757 | 1219 | 1922 | owner_unverified / NOT_READY | G14825 |
| 60 | `onFullManaDmg` | 318 | 753 | 1092 | 1494 | owner_unverified / NOT_READY | G14690 |
| 61 | `fireDmgBns` | 316 | 750 | 1046 | 1411 | owner_unverified / NOT_READY | G14529 |
| 62 | `mpRegenPct` | 314 | 705 | 1090 | 1715 | owner_unverified / NOT_READY | G14647 |
| 63 | `darkDmgBns` | 311 | 658 | 1016 | 1304 | owner_unverified / NOT_READY | G14550 |
| 64 | `burnDR` | 310 | 715 | 929 | 1328 | owner_unverified / NOT_READY | G14760 |
| 65 | `darkDR` | 305 | 674 | 959 | 1303 | owner_unverified / NOT_READY | G14651 |
| 66 | `lightDmgBns` | 305 | 755 | 1027 | 1371 | owner_unverified / NOT_READY | G14543 |
| 67 | `farDmg` | 304 | 725 | 1017 | 1340 | hurtE / NOT_READY | G14414 |
| 68 | `headbandMPMax` | 302 | 753 | 1194 | 1787 | owner_unverified / NOT_READY | G14805 |
| 69 | `iceDmgBns` | 302 | 759 | 1011 | 1446 | owner_unverified / NOT_READY | G14536 |
| 70 | `bowAtkSpd` | 299 | 737 | 1141 | 1628 | owner_unverified / NOT_READY | G14577 |
| 71 | `lckFlatN` | 297 | 706 | 1008 | 1629 | owner_unverified / NOT_READY | G14509 |
| 72 | `headbandMPRegen` | 295 | 681 | 1084 | 1621 | owner_unverified / NOT_READY | G14807 |
| 73 | `projDmgPct` | 293 | 745 | 1089 | 1703 | hurtE / NOT_READY | G14567 |
| 74 | `headbandElemDmg` | 290 | 805 | 1129 | 1492 | owner_unverified / NOT_READY | G14809 |
| 75 | `shieldRegenPct` | 288 | 732 | 1021 | 1267 | owner_unverified / NOT_READY | G14640 |
| 76 | `poisonDmgBns` | 287 | 666 | 953 | 1284 | hurtE / NOT_READY | G14557 |
| 77 | `headbandCastSpd` | 285 | 701 | 1093 | 1610 | owner_unverified / NOT_READY | G14806 |
| 78 | `chainTarget` | 282 | 676 | 1002 | 1575 | hurtE / NOT_READY | G14383 |
| 79 | `statusClean` | 279 | 735 | 1027 | 1465 | owner_unverified / NOT_READY | G14462 |
| 80 | `goldBonus` | 278 | 671 | 935 | 1175 | hurtE / NOT_READY | G14467 |
| 81 | `healthyDef` | 278 | 620 | 980 | 1309 | owner_unverified / NOT_READY | G14471 |
| 82 | `knockbackRes` | 278 | 692 | 988 | 1277 | owner_unverified / NOT_READY | G14658 |
| 83 | `cloakMSPct` | 277 | 739 | 1179 | 1711 | owner_unverified / NOT_READY | G14758 |
| 84 | `cloakElemDR` | 275 | 599 | 901 | 1124 | owner_unverified / NOT_READY | G14759 |
| 85 | `hybStrDex` | 273 | 671 | 1017 | 1524 | owner_unverified / NOT_READY | G14773 |
| 86 | `afterParryShield` | 263 | 554 | 787 | 1107 | owner_unverified / NOT_READY | G14694 |
| 87 | `pantsCCDuration` | 257 | 704 | 968 | 1253 | owner_unverified / NOT_READY | G14753 |
| 88 | `pierceDmgKeep` | 255 | 622 | 811 | 1066 | owner_unverified / NOT_READY | G14712 |
| 89 | `bowRange` | 253 | 594 | 911 | 1420 | owner_unverified / NOT_READY | G14707 |
| 90 | `pierceFlat` | 249 | 592 | 845 | 1158 | owner_unverified / NOT_READY | G14853 |
| 91 | `projSpeedPct` | 249 | 634 | 937 | 1434 | owner_unverified / NOT_READY | G14582 |
| 92 | `shieldOnKill` | 249 | 644 | 902 | 1182 | hurtE / NOT_READY | G14479 |
| 93 | `maxHPPct` | 246 | 618 | 923 | 1387 | equipment_refresh / READY 검증 | G14452 |
| 94 | `atkSpeed` | 245 | 599 | 882 | 1332 | owner_unverified / NOT_READY | G14390 |
| 95 | `skBlastShotDmg` | 240 | 608 | 840 | 1132 | owner_unverified / NOT_READY | G14619 |
| 96 | `injuredDR` | 237 | 607 | 905 | 1167 | owner_unverified / NOT_READY | G14472 |
| 97 | `skBlueShotDmg` | 236 | 607 | 801 | 1113 | owner_unverified / NOT_READY | G14618 |
| 98 | `bossDR` | 231 | 496 | 707 | 888 | owner_unverified / NOT_READY | G14475 |
| 99 | `counterHit` | 230 | 609 | 840 | 1060 | owner_unverified / NOT_READY | G14461 |
| 100 | `skChainAssaultDmg` | 226 | 502 | 761 | 930 | owner_unverified / NOT_READY | G14633 |
| 101 | `hybStrInt` | 224 | 700 | 962 | 1565 | owner_unverified / NOT_READY | G14774 |
| 102 | `potionCdRed` | 222 | 462 | 681 | 894 | owner_unverified / NOT_READY | G14680 |
| 103 | `dropRateAcc` | 221 | 569 | 774 | 1046 | owner_unverified / NOT_READY | G14684 |
| 104 | `splashDmg` | 221 | 516 | 714 | 1011 | owner_unverified / NOT_READY | G14715 |
| 105 | `skMaliceStormDmg` | 220 | 492 | 698 | 944 | owner_unverified / NOT_READY | G14621 |
| 106 | `critRateBow` | 219 | 508 | 819 | 1166 | hurtE / NOT_READY | G14575 |
| 107 | `onHitDefBoost` | 219 | 584 | 824 | 990 | owner_unverified / NOT_READY | G14600 |
| 108 | `afterDodgeDmg` | 218 | 476 | 727 | 939 | owner_unverified / NOT_READY | G14693 |
| 109 | `healthyAtk` | 218 | 555 | 757 | 1041 | hurtE / NOT_READY | G14514 |
| 110 | `splashRadius` | 217 | 503 | 769 | 1245 | owner_unverified / NOT_READY | G14714 |
| 111 | `predDmg` | 210 | 454 | 617 | 797 | hurtE / NOT_READY | G14408 |
| 112 | `arcTankBlock` | 209 | 517 | 880 | 1306 | owner_unverified / NOT_READY | G14826 |
| 113 | `bootsChargeRange` | 209 | 446 | 747 | 1134 | owner_unverified / NOT_READY | G14755 |
| 114 | `onKillHeal` | 209 | 511 | 678 | 910 | hurtE / NOT_READY | G14434 |
| 115 | `cloakDodgeDR` | 208 | 533 | 754 | 983 | owner_unverified / NOT_READY | G14757 |
| 116 | `pierceChance` | 208 | 563 | 869 | 1329 | owner_unverified / NOT_READY | G14710 |
| 117 | `skMaliceHuntDmg` | 208 | 485 | 723 | 982 | owner_unverified / NOT_READY | G14629 |
| 118 | `abundDmg` | 207 | 452 | 618 | 843 | hurtE / NOT_READY | G14407 |
| 119 | `skMissileDmg` | 206 | 587 | 852 | 1094 | owner_unverified / NOT_READY | G14617 |
| 120 | `skMaliceMortarDmg` | 205 | 532 | 707 | 982 | owner_unverified / NOT_READY | G14625 |
| 121 | `pickupRadius` | 204 | 539 | 741 | 920 | owner_unverified / NOT_READY | G14663 |
| 122 | `slowRes` | 204 | 504 | 708 | 986 | owner_unverified / NOT_READY | G14657 |
| 123 | `armorDefPct` | 200 | 518 | 837 | 1162 | owner_unverified / NOT_READY | G14745 |
| 124 | `dashRange` | 198 | 502 | 688 | 1041 | owner_unverified / NOT_READY | G14659 |
| 125 | `beltSTMax` | 194 | 473 | 732 | 1080 | owner_unverified / NOT_READY | G14800 |
| 126 | `dodgeCooldown` | 194 | 444 | 646 | 879 | owner_unverified / NOT_READY | G14637 |
| 127 | `hybDexInt` | 191 | 424 | 649 | 1000 | owner_unverified / NOT_READY | G14775 |
| 128 | `vsBossDmg` | 191 | 422 | 617 | 844 | hurtE / NOT_READY | G14517 |
| 129 | `eliteSlayer` | 189 | 468 | 687 | 777 | hurtE / NOT_READY | G14424 |
| 130 | `goldFind` | 188 | 497 | 712 | 950 | owner_unverified / NOT_READY | G14682 |
| 131 | `shieldPct` | 188 | 445 | 645 | 954 | owner_unverified / NOT_READY | G14639 |
| 132 | `injuredDmg` | 187 | 486 | 660 | 911 | hurtE / NOT_READY | G14515 |
| 133 | `beltPotionHP` | 183 | 427 | 642 | 825 | owner_unverified / NOT_READY | G14801 |
| 134 | `beltGoldDrop` | 181 | 404 | 649 | 809 | owner_unverified / NOT_READY | G14803 |
| 135 | `arcRangerPierce` | 179 | 431 | 600 | 843 | owner_unverified / NOT_READY | G14822 |
| 136 | `pierceCount` | 179 | 466 | 705 | 1098 | owner_unverified / NOT_READY | G14711 |
| 137 | `onKillMana` | 175 | 462 | 645 | 867 | hurtE / NOT_READY | G14435 |
| 138 | `ringPoisonDmg` | 173 | 380 | 538 | 747 | owner_unverified / NOT_READY | G14788 |
| 139 | `ringFireDmg` | 172 | 389 | 524 | 762 | owner_unverified / NOT_READY | G14784 |
| 140 | `arcAssassinDodge` | 169 | 420 | 565 | 718 | owner_unverified / NOT_READY | G14831 |
| 141 | `bootsMSOnKill` | 169 | 398 | 541 | 656 | owner_unverified / NOT_READY | G14756 |
| 142 | `atkPctAll` | 168 | 340 | 585 | 791 | owner_unverified / NOT_READY | G14705 |
| 143 | `expBonusRing` | 168 | 394 | 608 | 758 | owner_unverified / NOT_READY | G14683 |
| 144 | `movSpeedCombat` | 167 | 473 | 701 | 1011 | equipment_refresh / READY 검증 | G14661 |
| 145 | `arcMageMP` | 166 | 431 | 641 | 994 | owner_unverified / NOT_READY | G14817 |
| 146 | `ringLightDmg` | 166 | 382 | 601 | 741 | owner_unverified / NOT_READY | G14786 |
| 147 | `arcRangerDmg` | 164 | 467 | 592 | 860 | owner_unverified / NOT_READY | G14820 |
| 148 | `shieldBlockDR` | 163 | 391 | 578 | 743 | owner_unverified / NOT_READY | G14746 |
| 149 | `helmExpPct` | 162 | 335 | 481 | 641 | owner_unverified / NOT_READY | G14764 |
| 150 | `magicDmg` | 158 | 341 | 527 | 750 | owner_unverified / NOT_READY | G14393 |
| 151 | `ringIceDmg` | 158 | 388 | 534 | 811 | owner_unverified / NOT_READY | G14785 |
| 152 | `fullManaDmg2` | 156 | 331 | 453 | 662 | owner_unverified / NOT_READY | G14733 |
| 153 | `injuredSpeed` | 156 | 420 | 582 | 767 | equipment_refresh / READY 검증 | G14473 |
| 154 | `arcRangerMS` | 155 | 380 | 532 | 890 | owner_unverified / NOT_READY | G14823 |
| 155 | `ringDarkDmg` | 155 | 392 | 554 | 730 | owner_unverified / NOT_READY | G14787 |
| 156 | `beltSTRegen` | 154 | 436 | 696 | 983 | owner_unverified / NOT_READY | G14802 |
| 157 | `aoeRadiusPct` | 152 | 376 | 591 | 901 | owner_unverified / NOT_READY | G14568 |
| 158 | `bootsDashDmg` | 151 | 414 | 580 | 792 | owner_unverified / NOT_READY | G14754 |
| 159 | `skBeamDmg` | 150 | 323 | 468 | 597 | owner_unverified / NOT_READY | G14614 |
| 160 | `shieldBashDmg` | 149 | 344 | 467 | 665 | owner_unverified / NOT_READY | G14747 |
| 161 | `stRegenPct` | 148 | 416 | 665 | 994 | owner_unverified / NOT_READY | G14645 |
| 162 | `onBlockHeal` | 145 | 321 | 413 | 621 | owner_unverified / NOT_READY | G14605 |
| 163 | `skFireballDmg` | 144 | 311 | 454 | 592 | owner_unverified / NOT_READY | G14615 |
| 164 | `barrier` | 143 | 377 | 501 | 678 | owner_unverified / NOT_READY | G14458 |
| 165 | `shieldCdRed` | 143 | 356 | 454 | 654 | owner_unverified / NOT_READY | G14641 |
| 166 | `hpRegenPct` | 142 | 402 | 638 | 912 | owner_unverified / NOT_READY | G14643 |
| 167 | `whileMovingDR` | 142 | 352 | 501 | 643 | owner_unverified / NOT_READY | G14691 |
| 168 | `arcRangerRange` | 141 | 320 | 519 | 846 | owner_unverified / NOT_READY | G14821 |
| 169 | `bossSlayer` | 140 | 397 | 556 | 718 | hurtE / NOT_READY | G14423 |
| 170 | `gritFlatN` | 140 | 361 | 471 | 644 | equipment_refresh / READY 검증 | G14511 |
| 171 | `maliceWeakAmp` | 138 | 258 | 380 | 514 | owner_unverified / NOT_READY | G14616 |
| 172 | `onBlockMana` | 138 | 315 | 476 | 553 | owner_unverified / NOT_READY | G14606 |
| 173 | `comboThreshold` | 136 | 391 | 507 | 673 | owner_unverified / NOT_READY | G14695 |
| 174 | `hybDropExp` | 136 | 286 | 396 | 530 | owner_unverified / NOT_READY | G14777 |
| 175 | `revivePow` | 135 | 334 | 472 | 736 | owner_unverified / NOT_READY | G14502 |
| 176 | `shieldStagger` | 135 | 345 | 486 | 691 | owner_unverified / NOT_READY | G14748 |
| 177 | `lightDmgPct` | 133 | 278 | 454 | 645 | owner_unverified / NOT_READY | G14538 |
| 178 | `ringMPOnKill` | 133 | 358 | 424 | 615 | owner_unverified / NOT_READY | G14790 |
| 179 | `skFireAuraDmg` | 133 | 281 | 435 | 542 | owner_unverified / NOT_READY | G14626 |
| 180 | `multiShot` | 132 | 295 | 388 | 571 | owner_unverified / NOT_READY | G14709 |
| 181 | `onCritShield` | 132 | 322 | 432 | 558 | hurtE / NOT_READY | G14599 |
| 182 | `hybElemDotDmg` | 131 | 306 | 428 | 549 | owner_unverified / NOT_READY | G14781 |
| 183 | `skSpikeAuraDmg` | 131 | 264 | 393 | 516 | owner_unverified / NOT_READY | G14632 |
| 184 | `hybDefSpd` | 127 | 291 | 386 | 536 | owner_unverified / NOT_READY | G14767 |
| 185 | `resourceOnHit` | 127 | 307 | 405 | 529 | owner_unverified / NOT_READY | G14673 |
| 186 | `closeDR` | 125 | 270 | 417 | 519 | owner_unverified / NOT_READY | G14476 |
| 187 | `darkDmgPct` | 125 | 259 | 404 | 574 | owner_unverified / NOT_READY | G14545 |
| 188 | `iceDot` | 125 | 272 | 402 | 601 | hurtE / NOT_READY | G14377 |
| 189 | `lifeMaxHP` | 122 | 326 | 487 | 720 | equipment_refresh / READY 검증 | G14505 |
| 190 | `spellDmgPct` | 122 | 292 | 447 | 663 | hurtE / NOT_READY | G14564 |
| 191 | `whileStationaryDmg` | 121 | 289 | 437 | 552 | owner_unverified / NOT_READY | G14692 |
| 192 | `flatMagicDmg` | 120 | 231 | 336 | 540 | owner_unverified / NOT_READY | G14723 |
| 193 | `poisonDot` | 120 | 289 | 443 | 662 | hurtE / NOT_READY | G14375 |
| 194 | `reviveCd` | 120 | 297 | 450 | 658 | owner_unverified / NOT_READY | G14503 |
| 195 | `skDarkPillarDmg` | 117 | 255 | 397 | 558 | owner_unverified / NOT_READY | G14630 |
| 196 | `poisonDmgPct` | 116 | 279 | 396 | 582 | hurtE / NOT_READY | G14552 |
| 197 | `poisonResMax` | 116 | 255 | 357 | 473 | owner_unverified / NOT_READY | G14678 |
| 198 | `lifeRegen` | 115 | 306 | 450 | 682 | equipment_refresh / READY 검증 | G14506 |
| 199 | `skIceOrbDmg` | 115 | 304 | 375 | 527 | owner_unverified / NOT_READY | G14627 |
| 200 | `castSpeed` | 114 | 251 | 390 | 561 | owner_unverified / NOT_READY | G14578 |
| 201 | `expBonus` | 114 | 311 | 384 | 502 | owner_unverified / NOT_READY | G14498 |
| 202 | `armorPen` | 113 | 231 | 324 | 486 | owner_unverified / NOT_READY | G14381 |
| 203 | `crisisBoost` | 113 | 300 | 383 | 499 | hurtE / NOT_READY | G14460 |
| 204 | `arcTankThorns` | 112 | 220 | 305 | 415 | owner_unverified / NOT_READY | G14827 |
| 205 | `fireResMax` | 112 | 278 | 341 | 471 | owner_unverified / NOT_READY | G14674 |
| 206 | `skFireBeamDmg` | 112 | 250 | 396 | 518 | owner_unverified / NOT_READY | G14628 |
| 207 | `fireDmgPct` | 110 | 252 | 434 | 587 | owner_unverified / NOT_READY | G14524 |
| 208 | `fireDot` | 110 | 294 | 456 | 659 | hurtE / NOT_READY | G14376 |
| 209 | `iceResMax` | 110 | 268 | 334 | 481 | owner_unverified / NOT_READY | G14675 |
| 210 | `ringProjPierce` | 110 | 228 | 341 | 435 | owner_unverified / NOT_READY | G14791 |
| 211 | `elemFocus` | 108 | 241 | 444 | 635 | hurtE / NOT_READY | G14389 |
| 212 | `arcWarriorPoise` | 107 | 269 | 414 | 630 | owner_unverified / NOT_READY | G14815 |
| 213 | `arcTankHP` | 106 | 275 | 385 | 545 | owner_unverified / NOT_READY | G14824 |
| 214 | `lifeHealPow` | 104 | 270 | 464 | 690 | owner_unverified / NOT_READY | G14507 |
| 215 | `lightResMax` | 104 | 249 | 333 | 490 | owner_unverified / NOT_READY | G14676 |
| 216 | `skPlagueDmg` | 104 | 275 | 424 | 473 | owner_unverified / NOT_READY | G14631 |
| 217 | `arcWarriorHP` | 102 | 247 | 369 | 559 | owner_unverified / NOT_READY | G14813 |
| 218 | `hybLckGrit` | 102 | 201 | 350 | 515 | owner_unverified / NOT_READY | G14776 |
| 219 | `iceDmgPct` | 102 | 238 | 406 | 689 | owner_unverified / NOT_READY | G14531 |
| 220 | `onParryBurst` | 100 | 216 | 344 | 460 | owner_unverified / NOT_READY | G14604 |
| 221 | `arcMageDmg` | 98 | 255 | 297 | 457 | owner_unverified / NOT_READY | G14816 |
| 222 | `flatPhysDmg` | 98 | 227 | 352 | 532 | owner_unverified / NOT_READY | G14697 |
| 223 | `meleeDmgPct` | 98 | 244 | 277 | 500 | hurtE / NOT_READY | G14562 |
| 224 | `darkCurse` | 97 | 269 | 413 | 598 | hurtE / NOT_READY | G14379 |
| 225 | `endDEX` | 97 | 281 | 415 | 644 | owner_unverified / NOT_READY | G14848 |
| 226 | `endINT` | 97 | 276 | 426 | 647 | owner_unverified / NOT_READY | G14849 |
| 227 | `iceDuration` | 97 | 226 | 330 | 515 | owner_unverified / NOT_READY | G14535 |
| 228 | `allRes` | 96 | 222 | 297 | 421 | owner_unverified / NOT_READY | G14490 |
| 229 | `flatLightDmg` | 96 | 193 | 274 | 459 | owner_unverified / NOT_READY | G14700 |
| 230 | `hybMeleeSpell` | 96 | 233 | 373 | 458 | owner_unverified / NOT_READY | G14780 |
| 231 | `hybMPST` | 95 | 222 | 332 | 493 | owner_unverified / NOT_READY | G14771 |
| 232 | `staggerBns` | 94 | 224 | 322 | 459 | hurtE / NOT_READY | G14382 |
| 233 | `skHellRayDmg` | 93 | 258 | 402 | 504 | owner_unverified / NOT_READY | G14620 |
| 234 | `skillBoost` | 91 | 194 | 271 | 443 | owner_unverified / NOT_READY | G14387 |
| 235 | `arcMageShield` | 90 | 241 | 384 | 544 | owner_unverified / NOT_READY | G14818 |
| 236 | `eliteDR` | 90 | 214 | 335 | 402 | owner_unverified / NOT_READY | G14654 |
| 237 | `killSlayer` | 90 | 220 | 365 | 534 | hurtE / NOT_READY | G14384 |
| 238 | `cooldownRed` | 89 | 244 | 334 | 484 | owner_unverified / NOT_READY | G14392 |
| 239 | `lightChain` | 89 | 223 | 349 | 542 | hurtE / NOT_READY | G14378 |
| 240 | `lightDuration` | 89 | 232 | 349 | 476 | owner_unverified / NOT_READY | G14542 |
| 241 | `demonDmg` | 88 | 222 | 285 | 410 | owner_unverified / NOT_READY | G14685 |
| 242 | `endSTR` | 88 | 266 | 412 | 595 | owner_unverified / NOT_READY | G14847 |
| 243 | `parryBonus` | 88 | 188 | 259 | 460 | owner_unverified / NOT_READY | G14391 |
| 244 | `igniteDmg` | 85 | 195 | 289 | 442 | owner_unverified / NOT_READY | G14740 |
| 245 | `darkDuration` | 84 | 201 | 292 | 440 | owner_unverified / NOT_READY | G14549 |
| 246 | `injuredLeech` | 84 | 209 | 359 | 455 | hurtE / NOT_READY | G14516 |
| 247 | `helmCastSpd` | 83 | 201 | 294 | 452 | owner_unverified / NOT_READY | G14762 |
| 248 | `darkResMax` | 82 | 261 | 334 | 463 | owner_unverified / NOT_READY | G14677 |
| 249 | `demonDR` | 82 | 208 | 274 | 386 | owner_unverified / NOT_READY | G14686 |
| 250 | `beamDmgPct` | 81 | 227 | 301 | 504 | hurtE / NOT_READY | G14565 |
| 251 | `hybHPMP` | 81 | 187 | 324 | 407 | owner_unverified / NOT_READY | G14769 |
| 252 | `meleeAtkSpd` | 81 | 187 | 334 | 460 | owner_unverified / NOT_READY | G14576 |
| 253 | `poisonDuration` | 81 | 238 | 315 | 472 | owner_unverified / NOT_READY | G14556 |
| 254 | `vsEliteDmg` | 81 | 185 | 264 | 336 | hurtE / NOT_READY | G14518 |
| 255 | `critRateSpell` | 80 | 174 | 289 | 401 | hurtE / NOT_READY | G14574 |
| 256 | `flatFireDmg` | 80 | 204 | 274 | 470 | owner_unverified / NOT_READY | G14698 |
| 257 | `frostbiteDmg` | 80 | 205 | 312 | 434 | owner_unverified / NOT_READY | G14741 |
| 258 | `bleedDps` | 79 | 187 | 259 | 395 | owner_unverified / NOT_READY | G14721 |
| 259 | `flatDarkDmg` | 77 | 177 | 253 | 383 | owner_unverified / NOT_READY | G14701 |
| 260 | `hybHPST` | 77 | 197 | 319 | 462 | owner_unverified / NOT_READY | G14770 |
| 261 | `fireDuration` | 76 | 204 | 347 | 490 | owner_unverified / NOT_READY | G14528 |
| 262 | `neckSkillDmg` | 76 | 164 | 221 | 272 | owner_unverified / NOT_READY | G14796 |
| 263 | `arcMageElemDmg` | 75 | 243 | 363 | 430 | owner_unverified / NOT_READY | G14819 |
| 264 | `hybAtkHP` | 72 | 206 | 251 | 360 | owner_unverified / NOT_READY | G14766 |
| 265 | `rageMaxFlat` | 72 | 146 | 223 | 285 | owner_unverified / NOT_READY | G14440 |
| 266 | `flatIceDmg` | 71 | 209 | 275 | 453 | owner_unverified / NOT_READY | G14699 |
| 267 | `lifeLeechBr` | 71 | 189 | 239 | 325 | owner_unverified / NOT_READY | G14688 |
| 268 | `minDmgFlat` | 71 | 133 | 229 | 355 | owner_unverified / NOT_READY | G14703 |
| 269 | `helmMPPct` | 70 | 190 | 279 | 445 | owner_unverified / NOT_READY | G14761 |
| 270 | `neckCritDmg` | 70 | 150 | 249 | 288 | owner_unverified / NOT_READY | G14794 |
| 271 | `ringDmgPerCombo` | 70 | 179 | 294 | 372 | owner_unverified / NOT_READY | G14789 |
| 272 | `hybAllRegen` | 69 | 150 | 252 | 363 | owner_unverified / NOT_READY | G14772 |
| 273 | `shockDmg` | 69 | 168 | 298 | 498 | owner_unverified / NOT_READY | G14742 |
| 274 | `comboBoost` | 68 | 170 | 260 | 365 | hurtE / NOT_READY | G14385 |
| 275 | `flatPoisonDmg` | 68 | 172 | 253 | 396 | owner_unverified / NOT_READY | G14702 |
| 276 | `dotDmgPct` | 67 | 188 | 242 | 382 | hurtE / NOT_READY | G14566 |
| 277 | `weaponRange` | 67 | 166 | 233 | 361 | owner_unverified / NOT_READY | G14706 |
| 278 | `neckComboMax` | 66 | 140 | 182 | 264 | owner_unverified / NOT_READY | G14797 |
| 279 | `maxDmgFlat` | 65 | 163 | 250 | 399 | owner_unverified / NOT_READY | G14704 |
| 280 | `dashBoost` | 64 | 165 | 242 | 364 | owner_unverified / NOT_READY | G14386 |
| 281 | `neckKillHeal` | 64 | 174 | 243 | 327 | owner_unverified / NOT_READY | G14798 |
| 282 | `endDropBonus` | 63 | 163 | 193 | 282 | owner_unverified / NOT_READY | G14845 |
| 283 | `soulHarvest` | 63 | 165 | 232 | 310 | owner_unverified / NOT_READY | G14687 |
| 284 | `bleedDuration` | 60 | 146 | 214 | 332 | owner_unverified / NOT_READY | G14722 |
| 285 | `helmCooldown` | 60 | 195 | 271 | 384 | owner_unverified / NOT_READY | G14763 |
| 286 | `spellAmp` | 58 | 168 | 257 | 369 | owner_unverified / NOT_READY | G14724 |
| 287 | `critRateMelee` | 57 | 140 | 209 | 275 | hurtE / NOT_READY | G14573 |
| 288 | `endMaliceGain` | 57 | 158 | 240 | 317 | owner_unverified / NOT_READY | G14846 |
| 289 | `neckAllDmg` | 56 | 134 | 161 | 200 | owner_unverified / NOT_READY | G14793 |
| 290 | `counterAtkDmg` | 54 | 137 | 198 | 326 | owner_unverified / NOT_READY | G14717 |
| 291 | `curseDmgUp` | 52 | 97 | 133 | 213 | hurtE / NOT_READY | G14420 |
| 292 | `mobSlayer` | 52 | 124 | 138 | 229 | hurtE / NOT_READY | G14425 |
| 293 | `armorShred` | 51 | 83 | 139 | 197 | owner_unverified / NOT_READY | G14581 |
| 294 | `firePen` | 51 | 97 | 129 | 187 | owner_unverified / NOT_READY | G14525 |
| 295 | `onKillStam` | 51 | 90 | 110 | 162 | hurtE / NOT_READY | G14436 |
| 296 | `craftBonus` | 50 | 146 | 152 | 261 | owner_unverified / NOT_READY | G14681 |
| 297 | `fireOnHit` | 50 | 135 | 166 | 199 | hurtE / NOT_READY | G14526 |
| 298 | `chargeAtkDmg` | 49 | 117 | 241 | 354 | owner_unverified / NOT_READY | G14716 |
| 299 | `endShield` | 49 | 149 | 175 | 272 | owner_unverified / NOT_READY | G14835 |
| 300 | `icePen` | 48 | 109 | 138 | 182 | owner_unverified / NOT_READY | G14532 |
| 301 | `burnDmgUp` | 47 | 105 | 166 | 199 | hurtE / NOT_READY | G14418 |
| 302 | `lightOnHit` | 47 | 84 | 158 | 197 | hurtE / NOT_READY | G14540 |
| 303 | `overhealShield` | 47 | 100 | 158 | 229 | owner_unverified / NOT_READY | G14689 |
| 304 | `dotTickRate` | 46 | 112 | 168 | 261 | owner_unverified / NOT_READY | G14720 |
| 305 | `onHitSlow` | 45 | 87 | 82 | 161 | owner_unverified / NOT_READY | G14592 |
| 306 | `poisonOnHit` | 45 | 123 | 167 | 193 | hurtE / NOT_READY | G14554 |
| 307 | `slowDmgUp` | 43 | 102 | 142 | 178 | hurtE / NOT_READY | G14421 |
| 308 | `stunDmgUp` | 43 | 127 | 140 | 197 | hurtE / NOT_READY | G14416 |
| 309 | `lightPen` | 42 | 107 | 145 | 176 | owner_unverified / NOT_READY | G14539 |
| 310 | `neckElemPen` | 42 | 126 | 169 | 214 | owner_unverified / NOT_READY | G14795 |
| 311 | `onHitBleed` | 42 | 75 | 115 | 133 | hurtE / NOT_READY | G14590 |
| 312 | `poisonDmgUp` | 42 | 113 | 149 | 182 | hurtE / NOT_READY | G14419 |
| 313 | `frozenDmgUp` | 41 | 112 | 164 | 191 | hurtE / NOT_READY | G14417 |
| 314 | `slowEfficiency` | 41 | 79 | 99 | 167 | owner_unverified / NOT_READY | G14737 |
| 315 | `closeDmg` | 40 | 124 | 150 | 184 | hurtE / NOT_READY | G14413 |
| 316 | `endPoise` | 40 | 132 | 191 | 272 | owner_unverified / NOT_READY | G14842 |
| 317 | `onHitPoison` | 40 | 83 | 127 | 180 | owner_unverified / NOT_READY | G14589 |
| 318 | `onKillSpeed` | 40 | 80 | 87 | 152 | hurtE / NOT_READY | G14438 |
| 319 | `iceBurst` | 39 | 67 | 107 | 124 | owner_unverified / NOT_READY | G14534 |
| 320 | `skGhostWalkDmg` | 39 | 88 | 100 | 119 | owner_unverified / NOT_READY | G14624 |
| 321 | `skGiantSlamDmg` | 37 | 75 | 97 | 132 | owner_unverified / NOT_READY | G14623 |
| 322 | `chainDmgKeep` | 36 | 102 | 138 | 148 | owner_unverified / NOT_READY | G14713 |
| 323 | `fullLifeDmg` | 36 | 68 | 100 | 129 | hurtE / NOT_READY | G14409 |
| 324 | `skChainSlashDmg` | 36 | 71 | 121 | 141 | owner_unverified / NOT_READY | G14622 |
| 325 | `freezeDuration` | 35 | 84 | 132 | 170 | owner_unverified / NOT_READY | G14736 |
| 326 | `lightBurst` | 35 | 63 | 98 | 158 | owner_unverified / NOT_READY | G14541 |
| 327 | `poisonPen` | 35 | 83 | 123 | 174 | owner_unverified / NOT_READY | G14553 |
| 328 | `stLeech` | 35 | 68 | 89 | 154 | hurtE / NOT_READY | G14431 |
| 329 | `darkPen` | 34 | 77 | 136 | 153 | owner_unverified / NOT_READY | G14546 |
| 330 | `killStreakSpd` | 34 | 67 | 103 | 129 | owner_unverified / NOT_READY | G14726 |
| 331 | `onHitFreeze` | 34 | 63 | 109 | 149 | hurtE / NOT_READY | G14587 |
| 332 | `onHitWeaken` | 34 | 73 | 101 | 154 | owner_unverified / NOT_READY | G14591 |
| 333 | `rageDmg` | 34 | 85 | 143 | 170 | owner_unverified / NOT_READY | G14441 |
| 334 | `allDR` | 33 | 87 | 105 | 145 | owner_unverified / NOT_READY | G14653 |
| 335 | `bleedStack` | 33 | 75 | 103 | 144 | owner_unverified / NOT_READY | G14739 |
| 336 | `freshKillDmg` | 33 | 94 | 104 | 119 | owner_unverified / NOT_READY | G14734 |
| 337 | `iceOnHit` | 33 | 93 | 133 | 186 | hurtE / NOT_READY | G14533 |
| 338 | `onHitMark` | 33 | 54 | 76 | 105 | owner_unverified / NOT_READY | G14593 |
| 339 | `skWhirlDmg` | 33 | 86 | 95 | 138 | owner_unverified / NOT_READY | G14613 |
| 340 | `lifeOnHit` | 32 | 87 | 125 | 172 | hurtE / NOT_READY | G14432 |
| 341 | `onHitStun` | 32 | 71 | 91 | 135 | hurtE / NOT_READY | G14588 |
| 342 | `endLCK` | 31 | 115 | 145 | 202 | owner_unverified / NOT_READY | G14850 |
| 343 | `movingDmg` | 31 | 64 | 84 | 132 | owner_unverified / NOT_READY | G14729 |
| 344 | `poisonBurst` | 31 | 68 | 76 | 113 | owner_unverified / NOT_READY | G14555 |
| 345 | `rageSkDmg` | 31 | 88 | 86 | 132 | hurtE / NOT_READY | G14444 |
| 346 | `lowLifeDmg` | 30 | 75 | 105 | 129 | hurtE / NOT_READY | G14410 |
| 347 | `manaLeech` | 30 | 67 | 105 | 128 | hurtE / NOT_READY | G14430 |
| 348 | `standingDmg` | 30 | 64 | 108 | 142 | owner_unverified / NOT_READY | G14728 |
| 349 | `fullStaminaDmg` | 29 | 79 | 90 | 141 | owner_unverified / NOT_READY | G14732 |
| 350 | `onCritFreeze` | 29 | 64 | 85 | 112 | hurtE / NOT_READY | G14596 |
| 351 | `stunDuration` | 29 | 106 | 110 | 163 | owner_unverified / NOT_READY | G14735 |
| 352 | `darkOnHit` | 28 | 95 | 122 | 160 | hurtE / NOT_READY | G14547 |
| 353 | `elemPenAll` | 28 | 53 | 79 | 101 | owner_unverified / NOT_READY | G14579 |
| 354 | `firstStrike` | 28 | 79 | 117 | 169 | hurtE / NOT_READY | G14427 |
| 355 | `momentumDmg` | 28 | 79 | 88 | 120 | owner_unverified / NOT_READY | G14727 |
| 356 | `arcAssassinPoison` | 27 | 64 | 77 | 105 | owner_unverified / NOT_READY | G14830 |
| 357 | `onHitChainL` | 27 | 51 | 62 | 87 | owner_unverified / NOT_READY | G14586 |
| 358 | `rageSkCrit` | 27 | 78 | 103 | 156 | hurtE / NOT_READY | G14443 |
| 359 | `backstabDmg` | 26 | 69 | 91 | 120 | owner_unverified / NOT_READY | G14718 |
| 360 | `fireBurst` | 26 | 76 | 99 | 146 | owner_unverified / NOT_READY | G14527 |
| 361 | `poisonStack` | 26 | 75 | 103 | 144 | owner_unverified / NOT_READY | G14738 |
| 362 | `shieldBypass` | 26 | 63 | 60 | 90 | owner_unverified / NOT_READY | G14580 |
| 363 | `arcWarriorLifeSteal` | 25 | 37 | 42 | 65 | owner_unverified / NOT_READY | G14814 |
| 364 | `critMultiOnLowHP` | 25 | 58 | 68 | 90 | owner_unverified / NOT_READY | G14743 |
| 365 | `endSurvival` | 25 | 97 | 123 | 149 | owner_unverified / NOT_READY | G14834 |
| 366 | `onCritHeal` | 25 | 59 | 77 | 127 | hurtE / NOT_READY | G14597 |
| 367 | `endExpBonus` | 24 | 65 | 85 | 141 | owner_unverified / NOT_READY | G14844 |
| 368 | `lifeLeech` | 24 | 66 | 92 | 140 | hurtE / NOT_READY | G14429 |
| 369 | `arcAssassinCrit` | 23 | 37 | 78 | 84 | owner_unverified / NOT_READY | G14828 |
| 370 | `onCritMana` | 23 | 59 | 86 | 126 | hurtE / NOT_READY | G14598 |
| 371 | `hybFireIce` | 22 | 53 | 71 | 92 | owner_unverified / NOT_READY | G14778 |
| 372 | `killStreakDmg` | 22 | 65 | 93 | 121 | owner_unverified / NOT_READY | G14725 |
| 373 | `onHitFireball` | 21 | 46 | 54 | 88 | owner_unverified / NOT_READY | G14585 |
| 374 | `allStat` | 20 | 57 | 99 | 137 | owner_unverified / NOT_READY | G14670 |
| 375 | `arcWarriorDmg` | 20 | 58 | 68 | 91 | owner_unverified / NOT_READY | G14812 |
| 376 | `darkBurst` | 20 | 66 | 75 | 95 | owner_unverified / NOT_READY | G14548 |
| 377 | `endAllDmg` | 20 | 38 | 49 | 73 | owner_unverified / NOT_READY | G14839 |
| 378 | `executeDmg` | 20 | 65 | 80 | 126 | owner_unverified / NOT_READY | G14719 |
| 379 | `endAllDR` | 18 | 57 | 67 | 98 | owner_unverified / NOT_READY | G14840 |
| 380 | `endGrit` | 18 | 58 | 55 | 65 | owner_unverified / NOT_READY | G14851 |
| 381 | `hybLightDark` | 18 | 45 | 75 | 92 | owner_unverified / NOT_READY | G14779 |
| 382 | `recentParryDmg` | 18 | 61 | 78 | 128 | owner_unverified / NOT_READY | G14730 |
| 383 | `endCooldownAll` | 17 | 77 | 123 | 130 | owner_unverified / NOT_READY | G14843 |
| 384 | `nearDeathDmg` | 17 | 34 | 48 | 68 | owner_unverified / NOT_READY | G14731 |
| 385 | `onCritExplode` | 14 | 39 | 47 | 69 | hurtE / NOT_READY | G14594 |
| 386 | `arcAssassinBack` | 12 | 37 | 51 | 81 | owner_unverified / NOT_READY | G14829 |
| 387 | `doubleStrike` | 12 | 41 | 72 | 75 | owner_unverified / NOT_READY | G14708 |
| 388 | `endAllRes` | 12 | 51 | 72 | 66 | owner_unverified / NOT_READY | G14838 |
| 389 | `endLeech` | 12 | 6 | 25 | 36 | owner_unverified / NOT_READY | G14841 |
| 390 | `onCritChain` | 12 | 38 | 71 | 70 | hurtE / NOT_READY | G14595 |
| 391 | `endAtkFlat` | 11 | 35 | 38 | 47 | owner_unverified / NOT_READY | G14837 |
| 392 | `endBossKiller` | 10 | 22 | 50 | 54 | owner_unverified / NOT_READY | G14833 |
| 393 | `endKillChain` | 10 | 32 | 34 | 51 | owner_unverified / NOT_READY | G14852 |
| 394 | `hybCritLeech` | 10 | 36 | 56 | 70 | owner_unverified / NOT_READY | G14768 |
| 395 | `endCritDmg` | 6 | 13 | 34 | 41 | owner_unverified / NOT_READY | G14836 |
| 396 | `kiSlashParry` | 0 | 0 | 0 | 4 | owner_unverified / NOT_READY | G14608 |
