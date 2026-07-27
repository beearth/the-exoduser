# 추천 빌드 순서 (SKILL_REC_PATH)

game.html `SKILL_REC_PATH` 배열과 1:1 동기화.

## 성급 규칙 (핵심)
- **동급 별끼리만 합체**: 1★+1★=2★, 2★+2★=3★, 3★+3★=4★ ...
- 합체 결과 성급 = 구성 스킬 최고 성급 + 1

## 빌드 순서

| # | 단계 | 새 스킬 | 합체 키 | 합체 이름(KO) | 합체 이름(EN) | 실제 FUSE_PAIRS 구성 |
|---|---|---|---|---|---|---|
| 1 | 전격의창+아이스스톰 | thunderStake, bladeDash, iceStorm | thunderGhost | 전격의창 | Thunder Spear | bladeDash + thunderStake (iceStorm은 빙결존, 합체 비포함) |
| 2 | 이동+사슬 | chargeBoost, magicBlink, chainAssault, chainSlam | dimBreach | 사슬기동 / 기동:전폭 | Chain Breach / Maneuver:Thunder | chargeBoost + magicBlink / +chainAssault + chainSlam |
| 3 | 칼날+역병 | maliceHunt, guardian, plagueBurst | bladeFuse | 칼날 해방 / 독혈 해방 | Blade Liberation / Plague Liberation | maliceHunt + guardian / maliceHunt + guardian + plagueBurst |
| 4 | 💀 필살기 선택 | holyBlast/blackStar/lavaSummon/execution (1택) | — | — | — | — |
| 5 | 멸살+만화+원소 | omniBeam, fanShot, elemMissile | elemFuse | 추적암전 | Tracking Lightning | fanShot + omniBeam + elemMissile |
| 6 | 허수아비 세트 | voidScarecrow, explodeScarecrow | dualScarecrow | 쌍허수아비 | Dual Scarecrow | voidScarecrow + explodeScarecrow |
| 7 | 방패 합체 | maliceSwipe, shieldThrow | shieldFuse | 날개치기 | Wing Strike | maliceSwipe + shieldThrow |
| 8 | 해골무덤+악의폭풍 | boneWall, maliceStorm | boneStorm | 해골번개 | Bone Lightning | maliceStorm + boneWall |
| 9 | 폭풍소환+얼음보주+뇌전걸음 | maliceMortar, iceOrb, ghostWalk | iceMortar | 얼음소용돌이 | Ice Vortex | maliceMortar + iceOrb |
| 10 | 신성 영역 | holyDome, holyPrison | holyFuse | 결계의 영역 | Ward Domain | holyDome + holyPrison |
| 11 | 6단합체: 폭풍빔 | whirlwind, detonate, giantSlam, fanShot, omniBeam, elemMissile | stormBeam | 암전나선 | Lightning Helix | whirlwind + detonate + giantSlam + fanShot + omniBeam + elemMissile |
| 12 | 신성+빙결 | iceStorm | holyIce | 물의 영역 | Water Domain | holyDome + holyPrison + iceStorm (iceStorm은 1단계서 이미 습득됨) |
| 13 | 암흑+가시+대왕2 | darkPillar, spikeTrap, giantSlam2 | pillarSpike | 기둥가시 | Pillar Spike | darkPillar + spikeTrap (giantSlam2는 기둥강타/지옥강타용) |
| 14 | 사슬 최종 | chainSlash | dimRush | 기동:칼날개 | Maneuver:Bladewing | chargeBoost + magicBlink + chainAssault + chainSlash + chainSlam |

## 주의사항
- 표의 `새 스킬` 열은 **코드 `SKILL_REC_PATH[i].skills` 배열 그대로** (이미 습득된 항목은 자동 스킵)
- `fuse` 키의 실제 구성은 `_FUSE_PAIRS[key]` 참조
- phase 5의 elemFuse 구성: fanShot + omniBeam + elemMissile (bladeDash 제외)
- phase 13의 `giantSlam2`는 pillarSpike 구성이 아니라 pillarSlam/infernoSlam용으로 함께 배우는 스킬
- phase 11은 fanShot/omniBeam/elemMissile이 phase 5에서 이미 습득됐어도 코드 배열에 6개 모두 들어있음 (중복은 학습 시 스킵)
- phase 12 iceStorm은 phase 1에서 이미 습득 — holyIce 합체용 재명시(중복 스킵)

## ⭐ 추천 자동 버튼 (`_skillRecAuto()`)
- 전투스킬 패널 하단(`⭐ 추천 자동`, id `skRecAutoBtn`)에서 이 표 순서대로 **학습+합체 자동 진행**
- 레벨업은 하지 않음 — `⏫ 일괄 레벨업` 버튼과 책임 분리
- 필살기 4단계(`pick:true`): 이미 필살기 보유 시 스킵, 미보유 시 기본 **신성폭발(holyBlast)** 습득
- 자원 부족·`reqLv` 미달(푸른비 300, 버스트루프 700)·DEMO 합체제한은 건너뜀(부분 진행)
- 합체는 클릭 합체와 동일한 `_execFuse(key)` 공용 함수 호출 (상세는 `2_1 스킬관리+합체시스템.md`)
