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
