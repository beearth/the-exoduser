# QA-ch1-stage12-loot-1300 (결과)

RECOVERY-QA-1245의 완료 메모리 작업을 capacity epoch `rolling-after-3b548b06-1300`(newOwnedFileCredits=2, Changes=63→proj 98)에서 저장한다. **재실행 없이** 원 stdout/SHA/판정을 그대로 인계. 소유 2파일(`result.md`+`checks.mjs`). `productionApplied=false`, 실게임/native/시각/청취 미검수(별개).

## 0. 교정 반영 (이전 지적 해소)

- **proposal `_d10PersistenceReviewPort` 부재를 "모든 UI/loot 검수 불가"로 취급하지 않음.** `game.html` 전체 **0회 참조**로 게임 전투/루트/인벤토리가 proposal port와 무관함을 증명. observer shape/subscribe 하니스는 **반복하지 않음**(그 subscribe 산출은 교정에 따라 superseded — 저장하지 않음).
- 대신 실제 `game.html`의 CH1-1 첫 2단계 소스 경로를 직접 연결·검증.

## 1. 소스 근거·SHA

| 항목 | 값 |
|---|---|
| game.html 디스크 SHA256 (실행 시점) | `eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81` |
| 빌드 manifest sourceCheckpoint (immutable 후보) | `dd33341350e3fb7cedb77a6c68c9d392b4c99844` (packaged app `outputs/mac-package-re…`, `nativeAppOrServerStarted:False`) |
| 저장 checks.mjs SHA256 | `f23304ccfba8032443ef8d4c20bf1fdeb60352fed8ec7b2b3c6f01a8a0503bfe` (scratchpad 실행본과 byte-identical) |
| Node | v24.15.0 |

소스 함수(verbatim 추출 근거):
- `rollDrop()` game.html L30798 — 5등급 가중치 `_RW_normal=[65,22,9,3,1,0.01]`, 드롭수/확률맵, `rarity<OPT.minPickRar` / `reqLv<_minPickLvThr()` 필터.
- `pickupItem()` L15681 — `INV.bag.push` → `_invFindSpace` → 실패 시 pop + "가방에 공간이 없습니다!".
- `OPT` L6200: `minPickRar:0, minPickLvTier:0`; `_minPickLvThr()` L30797 → `-1`(fresh save 필터 OFF).
- 보스 게이트 L40540: stage0 출구는 `G._fbDone`(심연의 앵글러) + `G._bossUnlocked`(지역 4/4 또는 처치 80%) 필요.
- 데모 캡 L15832-15834: `_DEMO_MODE=true, _DEMO_LAST_STAGE=0`.
- **대역/합성:** `mkItem`은 식별용 대역(rarity/reqLv/slot만), `_invFindSpace`는 공간 스텁. 가중치/확률/필터/수용 로직은 실제 소스 그대로. 실게임/브라우저/save 0.

## 2. 실행 명령·원 stdout (재실행 금지 — 원본 그대로)

```
node qa-ch1-stage12-loot.mjs   RUN=2026-10-02T12:52:31Z   EXIT=0
```
```json
{
  "note": "CH1-1 첫2단계 loot 소비 source validator (실제 테이블/필터 재현). 실게임 아님 — source Gate.",
  "firstDefectStages12": "없음(no-fix) — fresh save 필터 OFF, normal 드롭 bag 도달, pickup 수용/거부 정상, proposal port 무관",
  "nextProgressionGate": "milestone 3단계(보스 게이트): game.html L40540 stage0 exit 는 G._fbDone(심연의 앵글러 처치) + G._bossUnlocked(지역 4/4 또는 처치 80%) 필요 → BOSS/MAP 의존 + 실제 창(root slot)",
  "demoCapNote": "game.html L15832-15834 _DEMO_MODE=true,_DEMO_LAST_STAGE=0 → 1-1 클리어 후 데모종료(nextStage return). 밀스톤 6단계는 1-1 내부 이벤트라 1단계~2단계는 영향 없음",
  "checks": [
    { "id": "C1-FILTERS-OFF", "ok": true, "obs": "minPickRar=0 _minPickLvThr()=-1 rarity0 drop bag-eligible=true" },
    { "id": "C2-DISTRIBUTION", "ok": true, "obs": "rarity0=653/1000 rarity5=0/1000 (정상: 흔한 common, 극희귀 top)" },
    { "id": "C3-BAG-ACCEPT-REJECT", "ok": true, "obs": "accept=true,true,true reject4th=true bagLen=3(pop 후 3)" },
    { "id": "C4-PROPOSAL-INDEPENDENT", "ok": true, "obs": "rollDrop/pickupItem/equipItem 및 game.html 전체에 _d10PersistenceReviewPort 0회 — loot/combat은 proposal port와 무관" }
  ],
  "allPass": true
}
```

## 3. 판정

- **CH1-1 첫 2단계(시작→combat/loot): 최초진행 결함 없음(no-fix).** fresh save에서 루트 필터가 OFF라 일반 몹 rarity-0 드롭이 가방에 도달하고(C1), 분포가 정상이며(C2), pickup 수용/가득 시 pop+거부가 정상(C3), 경로가 proposal port와 무관(C4). primary 재현/validator 완성.
- **다음 진행 게이트 = milestone 3단계(보스 게이트):** `game.html` L40540 — `G._fbDone`(심연의 앵글러 처치) + `G._bossUnlocked`(지역 4/4 또는 처치 80%) 필요. → **BOSS/MAP 경계 의존 + 실제 창(root 단일 슬롯)**. QA 단독으로 우회하지 않음.
- **데모 캡:** `_DEMO_MODE=true/_DEMO_LAST_STAGE=0`은 다중 스테이지 진행에만 영향(1-1 클리어 후 데모종료). 밀스톤 6단계는 1-1 내부 이벤트라 1~2단계에는 영향 없음 — root 확인용 기록.

## 4. 경계·의존성·다음

- **의존:** 3단계 이후는 BOSS(게이트/언락 상태), MAP(지역 구조), BUILD 로컬 후보, **QA 단일 실행 슬롯**(실제 창). 실게임/입력/청취는 root 격리환경+단일 슬롯 ready 후 같은 immutable 후보로만.
- **경계:** production/shared docs/Git/타팀WIP/사용자게임·save/삭제/권한/새세션 조작 0. 실제 소스 파일 미수정. 보호 `2_3`·blackBean(Q-only magic)·attack ticket 금지·맵 full-guide/LOCK 보존. MAP 미소비 큐·ENEMY 거절 우회 0. source Gate 결과 — 제품/native/visual/audio 완료로 보고하지 않음.
- ⚠️ **미해결 보고:** 밀스톤 목표 문서 SHA 불일치(제공 `889fb16f…` ≠ 디스크 `713aa80c…`) — root 확인 필요.
- **다음 독립 작업:** 저장 즉시 다음 독립 승인 소스 작업(3단계 보스-게이트 언락 조건의 QA 관측 범위 정상 대조 — BOSS/MAP 경계와 겹치지 않는 선)을 메모리로 진행. credit 0이면 메모리로 계속, 승인/epoch 대기 없음.
