# 리스폰 전투자원 완충 — 2026-09-07

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.

사용자 확정: 사망 후 리스폰 시 모든 전투자원을 최대치로 채운다. 일반 스테이지 재시작과 보스방 사망 후 게이트 복귀 모두 같은 규칙이다.

| 대상 | 리스폰 완료 값 |
|---|---|
| HP | P.hp = P.mhp |
| MP | P.mp = P.mmp |
| ST/SP | P.st = P.mst |
| 에너지 쉴드 | P.shield = P.mshield |
| 공용 기동게이지 | _harpGauge = _HARP_GAUGE_MAX |
| 돌진 스톡 | P.chargeStocks = P.maxChargeStocks, P.chargeCd = 0 |
| 호출 위치 | retryBtn 공통 후처리에서 applyStats() 직후 _refillRespawnResources() |
| 범위 제외 | 전투 중 악마화·장비 부활의 확률/회복 규칙, 화폐·물약 등 소모품 수량, 다른 스킬 쿨다운 변경 없음 |

## 최대치 계약

| 항목 | 계산 |
|---|---|
| chargeLv | P.skills.chargeBoost 또는 0 |
| hasCharge | chargeLv >= 1 또는 magicBlink >= 1 |
| dim | isDimBreach() |
| 스톡 최대 | dim이면 5, 아니면 min(5, (hasCharge ? 3+floor(chargeLv/10) : 1) + armor.bonusChargeStock + boots.bonusChargeStock) |
| 기동 칸수 | dimRush 10 → dimThunder 9 → dim 7 → hasCharge 6 → 기본 _HARP_GAUGE_BASE_CELLS(5) 순서 |
| 기동 최대 | 칸수 × _HARP_GAUGE_COST[1](45) + 정수 extraST 어픽스 |

최대치 공식은 기존 프레임 갱신 공식과 동일하다. 사망 중 장비·스킬이 달라져도 현재 상태로 재산정한다. applyStats 이전 값으로 채운 뒤 최대치가 증가해 덜 차는 문제를 막기 위해 최종 스탯 재계산 이후 완충한다. 지속 무한자원이 아니라 리스폰 시 1회 충전이며 이후 소비·리젠은 기존대로다.

원인: 기존 리스폰은 HP/MP/ST/쉴드·돌진 스톡만 충전했으며 독립 변수 _harpGauge는 초기화하지 않았다.

검증: test/respawnResources.test.cjs에서 실제 리스폰 후처리 코드를 실행하여 기본·차지·차원돌파·dimThunder·dimRush 5개 상태 및 최대치 증가 후 완충을 검증한다.


---

## 2026-10-02 — 보스 사망 후 필드 진행 보존 (현행 재도전 계약)

리스폰 자원 SSOT의 공통 `applyStats() → _refillRespawnResources()` 순서는 유지한다. 필드 진행 복원/보존은 자원 완충과 별개의 재도전 분기다.

| 항목 | 현재 계약 |
|---|---|
| 일반 arena 사망 | 보스 진입 전 46개 field key 복원, 일반 적/오브젝트 재생성 없음 |
| CH1-1 해금 완료 필드 사망 | `stage===0&&!_bossArena&&_bossUnlocked`일 때 현재 필드 capture/restore, 기존 일시 디버프·1회효과 정리만 별도 유지 |
| 정상 재시작/시연 | 해금 전 CH1-1·다른 일반 필드는 기존 initStage, 시연 si=3 직접 보스 재도전 선행 유지 |
| 공통 자원 | 최종 HP/MP/ST/shield 최대치 + 공용 기동게이지  + 최종 돌진 스톡·chargeCd 0, 소비량/다른 스킬 CD 변화 0 |
| 사망 결과 | 현재 EXP `~~(P.exp*0.3)` 손실, iframes 300·화톳불 300f/r280 유지 |
| 비되감기 | P/INV/EXP·`G._sStats/deaths`·`G.stageTime`은 field snapshot 제외. 진행 보존 분기에서 현재 시간·사망 통계를 유지 |
| 검수 | 최종 source 30/30 + 기존 자원 회귀 5/5; realgame/native/visual/audio 미인수 |

필드 46개 key·파생 캐시·복사 경계와 영수증은 [CH1-1 보스 사망 진행 보존 정본](../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md), `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`에 있다. 이 부록은 자원 공식·게이지 용량·스톡 공식을 바꾸지 않는다.


## 2026-10-03 source14 필드 복귀의 이전 보스 공격 정리

| 경계 | 현재 동작 |
|---|---|
| 실제 소비자 | `retryBtn.onclick`의 `_bossArena&&_preArenaBackup` 또는 해금 완료 CH1 필드 capture/restore 분기 |
| 네 임시 상태 | restore 직전에 `G._druidOrbs=[];G._druidOrbT=0;G._druidParryT=0;G._druidParryVolley=0;` |
| 타이머 의미 | 복귀 순간0. 이후 ORB 타이머는 기존 update로 증가 가능하며 영구0 유지 계약이 아님 |
| 필드 진행 | 기존46 key 복원·적/아이템 원 참조·지역/해금·열린 문 유지. 네 임시 공격 key를 backup에 넣지 않음 |
| 플레이어 후처리 | 기존 EXP30% 정수 손실→최종 applyStats→자원/기동게이지/스톡 완충, iframes300·화톳불300f/r280 유지 |
| 적용 제외 | 해금 전 일반 initStage·si3 직접 보스 재도전은 기존 분기 그대로 |
| 인수 | 실제 callback·capture/restore의 source 검수와 native 보스 사망/재입장 검수 구분. source11 앱은 별도 소스 |

보스/원본 필드를 초기화하는 변경이 아니라 이전 전투의 잔류 공격을 정리하는 후처리다. 정확한 key/소유·검증 경계는 [CH1 복귀 정본](../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md)을 따른다.
