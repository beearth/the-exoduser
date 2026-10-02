# MAP-root-rotated-culling-bounds-hb1014 — MAP020 회전·스케일 뿌리 띠 화면 가장자리 조기 컬링

## 완료 요약 (한국어)

`ch1-boundary-edge.js` draw()의 고정 **90px 중심 컬링**이 회전·스케일된 뿌리 띠(`drawImage(rim,-220,-46)`, 440×120, `s=ROOT_SCALE*(.85+R()*.35)`)의 변환 사각형이 viewport에 걸치는데도 중심이 90px 밖이면 조기 skip하는지를, **실제 build/draw/rng(seed 20261001) 코드를 node-canvas 대역 + CTM 캡처 ctx로 실행**하여 검증했다.

**판정: NO-FIX (가시 결함 없음, 후보 미채택 권고).**
가설은 격리 상태에서는 실재한다(최대 변환 reach ≈ **116.8px > 90**). 그러나 cull이 비교하는 `x0/x1`은 소스 89–90행에서 이미 **80 world-px 오버스캔**(`hw=VW/2/z+80`)을 포함하므로, **보이는 viewport** 기준 실효 여유 = 오버스캔 80 + 중심 90 = **170 world-px ≥ 최대 reach 117**(헤드룸 53px). 75개 viewport 스캔(z=1/0.62/0.3, 보이는 띠 1501건)에서 **현행이 보이는 띠를 0건 누락**했고, 현행이 컬링한 12,390개 띠는 **전부 비가시**(가장 가까운 것도 화면에서 66.75px 바깥). 최소 transformed-bounds 후보(margin 90→117)도 **보이는 변화 0**, 오버스캔 밖 overdraw 11개만 추가 → **채택 불필요**. 실게임/네이티브/GPU/시각 8뷰 미수행, `visualGateExecuted=false`, 전체 **VISUAL VERDICT: RETOUCH** 유지(새 native/camera 관찰 0).

## 실행·입력·SHA (evidence)

| 항목 | 값 |
|---|---|
| taskId | `MAP-root-rotated-culling-bounds-hb1014` |
| 실행 UTC | 2026-10-02T10:58:56.337Z → 10:59:00.952Z (KST 19:58~19:59) |
| exit | **0** (10 PASS / 0 FAIL) |
| Node | `/Users/.../node-v24.15.0-darwin-arm64/bin/node` (v24.15.0) |
| 소스 `ch1-boundary-edge.js` SHA-256 | `e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2` |
| 후보 소스 SHA-256 | `796e073d133332dc1ba98b163e8fbb99a77f7ca3e77e9ffb3c7e9403007f29b2` |
| `checks.mjs` SHA-256(선두) | `42a5bd3258ffb3f9…` |
| 제공 commit (COMMON/parent) | `6b865637`(역사적 기준, 현재 HEAD 주장 0) — **Git 조회 0** |

> parent `6b865637`은 역사적 기준으로만 기록. 현행 SHA는 파일 내용 해시(shasum). root-expanded `_skUnclick`/스킬카드 minus 작업은 소유/검사 0.

## 변환 상수 유도 (하드코딩 아님)

| 상수 | 값 | 출처 |
|---|---|---|
| ROOT_SCALE | 0.42 | `_consts.ROOT_SCALE` |
| s 범위 | 0.42×(0.85~1.20) = **0.357~0.504** | `s=ROOT_SCALE*(.85+R()*.35)` (59행) |
| 이미지 rect(로컬) | `[-220,-46,440,120]` → x∈[-220,220], y∈[-46,74] | `drawImage(rim,-220,-46)`, rim 440×120 (buildRim) |
| 원점→최원 모서리 | `hypot(220,74)=232.112` | 코너 (±220,74) |
| 최대 변환 reach | `0.504×232.112 = 116.98`(이론), 관측 **116.81** | reach = s·maxCorner (회전 불변) |
| 최대 AABB 반경 | maxHx **110.71**, maxHy **110.47** | 축 투영 (cardinal normal = 최악) |
| 현행 중심여유 / 오버스캔 | 90 / 80 → **실효 170** | 98행 cull + 89행 hw |
| 후보 중심여유 | `ceil(116.98)=117` | 최소 상수 후보 |
| **헤드룸** | 170 − 117 = **53 world-px** | 안전 마진 |

## 관측: defect / candidate / control

- **합성(변환 사각형)**: 각 drawImage의 CTM(translate→rotate→scale)을 캡처해 4 월드 코너로 재구성. shade 9-인자 draw의 목적사각형에서 실제 cull box `(x0,y0,x1,y1)`를 **그대로 복원**(재유도 아님).
- **도달성(보이는 viewport와 겹침)**: 보이는 영역 = `cam±VW/2z`(map clamp)와 변환 사각형의 SAT 교차.
- **control**: cull 제거(전량 draw) variant로 전체 186 루트의 변환 사각형 확보(= qa().roots).

| 검사 | 결과 | 핵심 수치 |
|---|---|---|
| H01 가설 실재(격리) | PASS | 최대 reach 116.8 **> 90** (오버스캔 無 가정 시 90 단독 불충분) |
| H02 오버스캔 상쇄 | PASS | 170 **≥** 117(이론)·116.8(관측)·110.7(AABB) → 안전 |
| V01 보이는 viewport 스캔 | PASS | 75 viewport·보이는 띠 1501 → **현행 가시 누락 0** |
| V02 컬링 띠 비가시성 | PASS | 컬링 12,390개 **전부 비가시**, 최근접도 **66.75px 바깥** |
| C01 후보 대조 | PASS | 후보 가시 누락 0, 추가 draw 11개 **전부 오버스캔 밖(비가시 overdraw)** |
| B01/B02 실코드·결정성 | PASS | 실제 build/rng 186 루트, current=candidate=full 집합 동일 |
| P01 보존(변환 불변) | PASS | 현행이 그린 띠 ⊆ 후보, 코너 좌표 1e-6 일치 |
| P02 최소 변경 | PASS | 후보는 cull 상수 90→117만, 나머지 바이트 동일 |
| P03 모드 게이트 보존 | PASS | 0/a/b 게이트·파서 불변, shade build 정상 |

**결론 논리**: 보이는 viewport에 닿는 띠는 중심이 화면 가장자리에서 최대 `maxHx≈111`(또는 reach 117) 안쪽이므로, cull 임계 `화면가장자리+170`에 도달할 수 없다(111<170). 따라서 **보이는 띠는 구조적으로 절대 컬링되지 않는다.** 가설이 지목한 "중심 90px 밖 skip"은 90이 `x0/x1`(이미 +80) 기준이라 실제로는 화면 +170 기준이며, 이는 띠 크기를 충분히 덮는다.

## 검토한 최소 patch (미채택 — NO-FIX)

동일 계약(가시 누락 방지)이 **이미 충족**되므로 아래 후보는 **적용 권고하지 않는다**. 재현/검증 목적의 후보 원문만 보존한다.

```diff
# ch1-boundary-edge.js : 98행 (후보, 미적용)
-      const r=roots[i];if(r.x<x0-90||r.x>x1+90||r.y<y0-90||r.y>y1+90)continue;
+      const r=roots[i];if(r.x<x0-117||r.x>x1+117||r.y<y0-117||r.y>y1+117)continue;
#   117 = ceil(ROOT_SCALE*1.20*hypot(220,74)).  효과: 보이는 변화 0, 오버스캔 밖 overdraw +소수.
#   (더 정밀한 대안: per-instance AABB 반경 hx/hy로 컬링 — 역시 가시 효과 0, overdraw만 축소.)
```

`productionApplied=false`, `runtimeAccepted=false`, `candidateRecommended=false`.

## 대역 경계 (band boundaries)

- **실제 코드**: `ch1-boundary-edge.js`의 build/buildRim/draw/rng(seed 20261001)를 그대로 실행. cull·변환은 소스 원본 라인.
- **node-canvas 한계**: `ctx.filter='blur'`가 node-canvas에서 **미지원**(soft-edge 0px 확인) → build의 법선이 blur 대신 raw 마스크 계단에서 산출 = **cardinal 법선**. 이는 strip을 축에 정렬시켜 hx/hy를 **최대화**(최악)하므로, blur를 쓰는 생산 법선은 각도가 져 hx/hy가 **더 작다** → 본 대역은 생산보다 **보수적**(NO-FIX 결론 강화). reach는 회전 불변이라 양쪽 동일.
- **맵**: 테두리 벽 프레임 맵(120×120, world 4800²) — 상/하 벽→수평 장축, 좌/우 벽→수직 장축을 모두 생성. **생산 CH1-1 격자 아님**(생산 앵커 305개, 대역 186개). reach/hx/hy는 count가 아닌 ROOT_SCALE/crop/offset에만 의존하므로 예산 결론은 생산에도 성립.
- **미수행**: 실게임·서버·브라우저·GPU 픽셀·실제 8뷰·청취·배포 0. source/fixture PASS를 실게임/native/시각 PASS로 치환하지 않음.

## docs 동기화 인계 (정본별 old→new, 공유 docs 미수정 — 총괄 반영)

rg 1회: `ch1-boundary-edge|MAP-020|MAP020|ROOT_GAP|ROOT_SCALE|edgeShade|경계 접지|뿌리 띠` → **159 매칭 / 45 파일**. 공유 docs 쓰기 0.

| 정본 / 위치 | 현재(old) | 인계(new) |
|---|---|---|
| `docs/4.1맵디자인+설정/CH1_BOUNDARY_EDGE_MAP020_20261001.md` §7 | "기존 80월드px 여유·뿌리90 여유… 유지" (여유값만 명시, 근거 없음) | **여유 예산 근거 추가**: 뿌리 띠 변환 최대 reach = `s_max(0.504)×hypot(220,74)=~117 world-px`. cull은 `x0/x1`(이미 +80 오버스캔) 기준 90 → **실효 170 ≥ 117(헤드룸 53)**. ∴ 회전·스케일 띠의 가시 조기 컬링 **없음**(소스 재현 10검사, 75뷰·보이는1501 누락0, 컬링12390 전부 비가시·최근접66.75px). |
| 같은 문서 §6 말미 | "새 draw/cull 결함은 소유 범위를 분리해 다음 작업으로 넘긴다" | **해소**: 해당 회전/스케일 조기 컬링 후속은 **NO-FIX**로 종결(가시 결함 아님). 90px는 80 오버스캔과 합쳐 충분. |
| 같은 문서 :30 | "화면 안 것만 그림(프레임당 약 5~16개)" | **정밀화**: 실제로는 보이는 띠 + 화면 가장자리 ±170 오버스캔 링의 비가시 띠까지 그림(프레임당 drawn 수에 비가시 소수 포함). 보이는 띠는 전부 그려짐(누락0). |
| `docs/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md` MAP-020 행(§7/약점) | "뿌리 반복·M5 전체 경로 승인보류는 잔여" | 1줄 추가: "회전·스케일 뿌리 띠 조기 컬링 가설 검증 완료 — **NO-FIX**(실효여유170≥reach117, 가시누락0). 후보(117) 미채택(비가시 overdraw만)." |

> 보호 2_3 수정 0, Q전용 blackBean 패링·어택티켓 금지·LOCK/TBD·확정수치(305앵커·시드·crop·배율·베이크·0-A) 보존. 새 설계 임의 확정 0.

## MAP PRODUCTION REPORT (가이드 §23) — source 계약 검증, 제작 단계 실행 0

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 / MAP-020 뿌리 띠 회전·스케일 컬링 경계 (source/VM 재현, 제작 0)

MASTER / OUTER MASS / LARGE / MEDIUM / GROUND: 전 항목 미검수 (geometry/제작 실행 0)
PLAYABLE: 미검수
LANDMARK: 미검수
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전부 미검수 (실제 8뷰 0)
TECH QA
- route/collision: 변경 0 (컬링은 시각 전용; 타일맵/충돌/베이크/앵커305 불변)
- cull 경계: 뿌리 띠 변환 reach 117 vs 실효여유 170 → 가시 누락 0 (소스 재현 10검사 PASS)
- pageerror/404/seam/loading/performance: 미검수 (게임/서버/빌드 0)
FILES
- stage-owned: supervisor-next/MAP/MAP-root-rotated-culling-bounds-hb1014/{result.md, checks.mjs} 2개만
- concurrent touched: 0 (ch1-boundary-edge.js·생산·공유docs 불변; 타인 WIP 되돌림 0)
- unrelated touched: 0
GIT: staged 0 / commit 0 / push 0 / deploy 0 (Git 조회도 0)

visualGateExecuted: false
VISUAL VERDICT: RETOUCH (시각 Gate 미수행 — 기술 PASS를 시각 PASS로 치환하지 않음)
NEXT PASS: NO-FIX 확정 시 §6 draw/cull 후속 항목 종결. 실제 가시 검증이 필요하면
  총괄 지정 runtime 슬롯에서 생산 CH1-1 맵·blur 법선으로 .3~1배 가장자리 8뷰 촬영
  (본 대역이 보수적 상한이므로 생산은 동일하거나 더 안전할 것으로 예상).
```

## 실제품 Gate / 남은 결정

- **실제품 Gate**: 본 결과는 source/VM 재현이며 **실게임 픽셀·가장자리 팝인 육안 검증은 미수행**. NO-FIX 결론은 기하 예산(170≥117)과 보수적 대역에 근거. 총괄이 실화면 가장자리 8뷰로 최종 확인 가능(선택).
- **blocker 없음**: runtime gate/총괄 통합 대기를 소스 검증의 blanket blocker로 삼지 않았다. 이 한 건은 독립 완료.
- **남은 결정(총괄)**: (1) NO-FIX 수용 → §6 후속 종결 + §7 예산 근거 docs 반영, (2) 실화면 8뷰 추가 확인 여부. 새 기능·정책 확장·자체 다음 건 배정 0.
- Changes: 중간 69(<80, root checkpoint 불요). stage/commit/push 0. 소유 신규 2파일(result.md, checks.mjs)만, 별도 evidence/log/fixture/patch/backup 0(증거는 본 result 내 보존).
