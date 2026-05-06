# 추천 빌드 순서 (SKILL_REC_PATH)

game.html `SKILL_REC_PATH` 배열과 1:1 동기화.

## 성급 규칙 (핵심)
- **동급 별끼리만 합체**: 1★+1★=2★, 2★+2★=3★, 3★+3★=4★ ...
- 합체 결과 성급 = 구성 스킬 최고 성급 + 1

## 빌드 순서

| # | 단계 | 새 스킬 | 합체 키 | 합체 이름(KO) | 합체 이름(EN) | 실제 FUSE_PAIRS 구성 |
|---|---|---|---|---|---|---|
| 1 | 전격이동 | bladeDash | — | — | — | — |
| 2 | 악의폭풍 | maliceStorm | — | — | — | — |
| 3 | 칼날 계열 | maliceHunt, guardian | bladeFuse | 악의 해방 | Malice Liberation | maliceHunt + guardian |
| 4 | 역병 확장 | plagueBurst | plagueFuse | 독혈해방 | Plague Liberation | maliceHunt + guardian + plagueBurst |
| 5 | 이동스킬 마스터 | chargeBoost, magicBlink | dimBreach | 기동:기습 | Maneuver:Ambush | chargeBoost + magicBlink |
| 6 | 사슬 확장 | chainAssault, chainSlam | dimThunder | 기동:전폭 | Maneuver:Thunder | chargeBoost + magicBlink + chainAssault + chainSlam |
| 7 | 필살기 선택 | holyBlast/blackStar/lavaSummon/execution (1택) | — | — | — | — |
| 8 | 멸살+만화+원소 | omniBeam, fanShot, elemMissile | elemFuse | 추적암전 | Tracking Lightning | fanShot + omniBeam + elemMissile |
| 9 | 회전참+기폭+대왕 | whirlwind, detonate, giantSlam | slamStorm | 지진폭풍 | Quake Storm | whirlwind + detonate + giantSlam |
| 10 | 방패 합체 | maliceSwipe, shieldThrow | shieldFuse | 날개치기 | Wing Strike | maliceSwipe + shieldThrow |
| 11 | 해골무덤+악의폭풍 | boneWall, maliceStorm | boneStorm | 해골번개 | Bone Lightning | maliceStorm + boneWall |
| 12 | 폭풍소환+얼음보주 | maliceMortar, iceOrb | iceMortar | 얼음소용돌이 | Ice Vortex | maliceMortar + iceOrb |
| 13 | 뇌전걸음 | ghostWalk | — | — | — | — |
| 14 | 신성 영역 | holyDome, holyPrison | holyFuse | 결계의 영역 | Ward Domain | holyDome + holyPrison |
| 15 | 6단합체: 폭풍빔 | (없음) | stormBeam | 암전나선 | Lightning Helix | whirlwind + detonate + giantSlam + fanShot + omniBeam + elemMissile |
| 16 | 신성+빙결 | iceStorm | holyIce | 물의 영역 | Water Domain | holyDome + holyPrison + iceStorm |
| 17 | 암흑+가시+대왕2 | darkPillar, spikeTrap, giantSlam2 | pillarSpike | 기둥가시 | Pillar Spike | darkPillar + spikeTrap (giantSlam2는 기둥강타/지옥강타용) |
| 18 | 사슬 최종 | chainSlash | dimRush | 기동:칼날개 | Maneuver:Bladewing | chargeBoost + magicBlink + chainAssault + chainSlash + chainSlam |

## 주의사항
- `skills` 배열은 해당 단계에서 **새로 습득하는 스킬만** 나열 (부모 스킬은 이전 단계에서 이미 습득)
- `fuse` 키의 실제 구성은 `_FUSE_PAIRS[key]` 참조
- phase 1의 `bladeDash`는 단독 추천 — elemFuse 구성 아님, 초반 생존 이동기
- phase 8의 elemFuse 구성: fanShot + omniBeam + elemMissile (bladeDash 제외)
- phase 17의 `giantSlam2`는 pillarSpike 구성이 아니라 pillarSlam/infernoSlam용으로 함께 배우는 스킬
