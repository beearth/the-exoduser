# QA-FIRE-BOUNDARY-REVIEW — 결과 (한국어)

- 담당 QA / 기존 세션 `88c3f903…`. 작성 2026-10-01. HEAD `fe85bb08`.
- 수신 20:49 / 첫 Read 20:49:30 / 착수 20:51 (receipt: `QA-next-receipt.json`).
- 성격: 미커밋 fire 후보(root 소유 game.html)의 **독립 경계 검토 + 실행 가능한 회귀**. 새 실측 아님.

## 0. 중복 확인

root가 이미 공용 테스트 `test/warmImageAsyncHandoff.test.js`에 fire 계약 4건을 추가(+신규
`test/warmFireObserver.test.js`)했다. **중복 재작성이 아니라 독립 검토로 보강**한다 —
공용 테스트는 수정하지 않고, 소유 폴더에 7개 명시 경계(absent/late/cache/query/context/failure/first-use)
매트릭스 회귀를 별도로 만들어 실제 game.html 함수로 교차검증했다. game.html·공용 test·총괄MD·타팀 파일 미수정.

## 1. 대상 코드 (root 소유, 읽기만)

game.html `_warmupEnsAtlas` 비동기 블록:
- `_WQ_ASYNC_PATHS` = 기존 3장 우선예약: `vfx_magic_burst.png`, `boss/vfx_void_black.png`, `vfx_peace_shield.png`
- `_WQ_ASYNC_FIRE_PATH` = `/assets/vfx/fire_burst_radial.webp` (FIRE-02, 3장 예약 뒤에만 admit)
- `_warmAsyncTarget` / `_warmAsyncJob`(fire 예약 게이트) / `_queueWarmFireAsync`(전체 패스 재시도) / `_texPrewarmSrc`(64MP 예산)

## 2. 사실 근거 (측정치, root 산출과 교차확인)

| 항목 | 값 |
|---|---|
| 예산 `_TEXHOT_BUDGET_PX` | 64,000,000 px (64MP, RGBA 약 256MB) |
| fire_burst_radial.webp | 3584×1728 = **6,193,152 px** |
| 시드 목록 합 | 32,204,920 px |
| 3 primary | magic_burst 3264×4096=13,369,344 / void_black 2304²=5,308,416 / peace_shield 2400×1920=4,608,000 |
| **시드+3primary+fire 총합** | **61,683,832 px ≤ 64,000,000 (여유 2,316,168)** |

→ fire(6.19MP)는 **3장 예약 뒤 마지막에 admit**되어 예산에 들어맞는다. 우선순위 순서는
`학습/시드 → 3 primary → fire`이므로 **fire가 primary 예산을 선점할 수 없고**, 예산이 빠듯하면 fire가 가장 먼저 탈락한다.

## 3. 판정표 (독립 회귀 `fire-boundary-regression.mjs`, game.html 원문 추출, 8/8 PASS)

| 경계 | 동작 | 판정 |
|---|---|---|
| **first-use/baseline** | 3장 예약 뒤 fire 예약, 총 61,683,832 ≤ 64MP | PASS — 예산 내 admit |
| **absent** | primary 1장이 미예약·미캐시 → fire 게이트 차단(미예약), 부재 primary 예산 보존 | PASS — fire는 첫 사용 lazy로 (의도된 양보) |
| **late** | 수집 순서상 fire가 primary보다 먼저 `_warmAsyncJob`돼도 차단 → primary 예약 후 `_queueWarmFireAsync` 전체 패스에서 예약 | PASS — 순서 역전 대응 |
| **cache** | primary가 `_texBySrc`에 이미 업로드됨(job 없음) → 게이트 충족, fire 예약 | PASS |
| **query** | primary가 라이브 pending job(현 컨텍스트, status≠stale) → 게이트 통과, fire 예약 | PASS |
| **context** | GL 복구 전 primary job(`context≠_texBySrc`) → fire 차단(복구 후 재예약까지 보류) | PASS |
| **failure** | primary job `status='failed'`(stale 아님) → fire에 양보(게이트 통과). px 미환불이나 총합 61,683,832 ≤ 64MP | PASS |
| **budget-reject** | 게이트 통과해도 `_texPrePx+px>budget` → fire 미예약, 첫 사용 동기 fallback | PASS |

실행: `node tools/team-followup-20261001/QA/fire-boundary-regression.mjs` → **8/8 PASS, exit 0**.
독립 확인: root 공용 테스트 `node --test test/warmImageAsyncHandoff.test.js test/warmFireObserver.test.js` → **16/16 PASS**(미수정).

## 4. 판정 — 수정 불필요 (minimal patch 후보 없음)

fire 후보의 예약 게이트·64MP 예산 로직은 **7개 경계 모두에서 설계대로 동작**한다. 기존 3장 우선예약을
해치지 않고, fire는 마지막에만 admit되며, 실패/부재/컨텍스트/예산 초과에서 안전하게 lazy fallback으로 떨어진다.
**production 수정이 필요한 결함을 찾지 못했다.** 따라서 최소 patch 후보를 제출하지 않는다.

## 5. 설계상 한계 (결함 아님, 기록)

1. **absent/late primary → 그 세션 fire 미프리워밍**: primary가 워밍업 시점에 미완료면 fire는 예약되지 않고,
   `_queueWarmFireAsync`는 1회(전체 `_wqBuf` 패스)만 재시도하므로 **세션 내 추가 재시도는 없다**. fire는 첫 사용
   lazy 업로드로 처리된다(동기 fallback 보존). 의도된 양보이며, "최악에도 lazy는 보장"된다.
2. **실패/stale primary의 px 미환불**: `_texPrewarmSrc`는 px를 생성 시 더하고 실패/stale에도 빼지 않는다.
   그래도 총 예산(61,683,832)이 64MP 안이라 fire admit에 영향 없다. 단 **학습 목록이 가득 찬 세션**에서는
   `_texPrePx`가 더 커질 수 있고, 그때 fire가 가장 먼저 탈락한다(= 의도된 fire-last 우선순위). fire-specific 결함 아님.

## 6. 미실행 / 경계 (완료로 쓰지 않음)

- game.html·`test/warmImageAsyncHandoff.test.js`·`test/warmFireObserver.test.js`·총괄MD·타팀 파일 수정 0.
- 신규 실측 0(= `QA-game-release.json` released=true 부재), 게임/서버/브라우저/청취/이미지생성/인코딩/대형빌드/새세션/PC/Git 0.
- 실화면·GPU 완료·표시 FPS·매 루프 draw는 검증 범위 밖. **PC329ms·ring97ms 해결 주장 없음, 새 측정 release 없음.**

## 7. 다음 잔여 게이트 (인계)

- root: 본 회귀·판정표 회수. fire 후보는 독립 검토상 안전 — production 적용·실화면/실측은 root 소유 게이트.
- comparisonEligible=true 실측(§이전 분류기)·M2 정식 실측은 여전히 release 대기.
