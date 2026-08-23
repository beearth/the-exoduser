# PHASE V1 — MOTION 커널 · bladeDash 스쿼시 · fireZone preset7 최종 봉인

> **상태: FINAL PASS / SEALED (2026-08-23, 사용자 실기 판정)**
> 이 문서는 PHASE V1 3종 변경의 검증 이력과 최종 봉인을 기록한다. 관련 구현 상세는
> [`VFX_구현가이드.md`](./VFX_구현가이드.md) §컬러조명 스탬프 falloff / 프리셋 라우팅과 상호 참조.
> (VFX_구현가이드.md는 타세션 동시 편집 중이라 본 봉인 기록은 별도 문서로 분리.)

---

## 1. 검증 대상 (미커밋 변경 3종)

| # | 대상 | 위치(game.html) | 요지 |
|---|---|---|---|
| PHASE 1 | **MOTION POLISH KERNEL v1** | 2993–3040 | `var MOTION` — LUT 기반 이징(ez/swing/squash/dtStep). `squash(t,amt)` = 사전할당 `Float32Array(2)`에 `[1+k, 1−k]`(k=(1−ELAS(t))·amt) 절대값 반환 |
| PHASE 2 | **bladeDash 스쿼시** | 50302–50307 | `P.s==='bladeDash'`일 때만 `_bdSq=MOTION.squash((12−P.st2)/12, 0.22)`. t=0 발동→[1.22,0.78], t=1 종료→[1,1]. 발밑 고정 translate(착지스쿼시 동일 idiom), 스케일은 플레이어 draw ctx 국소(시각 전용) |
| PHASE L1 | **fireZone preset7** | 4083, 4102–4110, 4226 | `_colStamps[7]` 신규(색=preset0 주황 동일, falloff만 날카롭게 → 전투 haze 축소). fireZone 광원이 `ci=7` 명시로 색상유도 우회. preset0/6·보스광원·모닥불 라우팅 **무수정** |

falloff 대조 (참고):
- 표준(preset0~5): `0:.95 / .28:.52 / .58:.20 / .82:.05 / 1:0`
- **preset7(신규)**: `0:1.0 / .30:.45 / .55:.12 / .75:.03 / 1:0` (중·외곽 알파 ↓ = 날카로운 감쇠)

---

## 2. 검증 이력 (보존 — 삭제 금지)

### 2-A. 자동 검증 — SwiftShader (판정: PARTIAL)

2026-08-23, headless Chrome + SwiftShader(소프트웨어 WebGL) + `?testchar=1&perf=1` 실플레이 구동.

| 항목 | 자동검증 결과 |
|---|---|
| MOTION.squash 수학 | **CONFIRMED** — `squash(0,.22)=[1.22,0.78]`, `squash(1,.22)=[1,1]`. 3회 연속 호출 후에도 절대값 동일 → **스케일 누적 0(수학적 확정)** |
| 탄성 반동 | ez(4)=ELAS 사용 확인, t≈0.17에서 [0.935,1.065] 오버슛(의도된 반동) |
| 연속 3회 대시 | **누적 0 CONFIRMED** — st2 12→0 매 프레임 독립 재계산, 이동만 누적 |
| 스케일 격리 | 플레이어 draw ctx 국소, 몹 152마리 동시 렌더에 오염 경로 없음(구조 확인) |
| preset7 회귀(g/h/i) | 모닥불/제단·보스광원·플레이어 등불(preset6) 라우팅 **정적 UNCHANGED** |
| 탄막 판독 j/k | **NOT VERIFIED** — fireZone+패링탄 동시 장면 재현 실패(fireZone 일시소멸·몹 패링탄 미발사) |
| 성능 봉인 | **NOT ASSESSABLE** — 소프트웨어 렌더(idle 36fps/스트레스 23fps는 GPU 아님). MAP STREAM SPIKE=0. pageerror 0 |
| 700마리 | **NOT TESTED** (최대 250 도달) |

→ **자동검증 종합: V1 PARTIAL** (구조·수학 안전성 확정, 시각 주관/탄막 판독/성능 봉인은 환경 한계로 미확정).
크래시·누적버그·스케일오염·pageerror 결함은 발견 0.

### 2-B. 사용자 실기 검증 — 실제 GPU / 240Hz (판정: PASS)

2026-08-23, 사용자가 실제 GPU · 240Hz 플레이 환경에서 직접 확인. 아래 전 항목 문제 없음:

- 대시 가로 stretch / 세로 squash 자연스러움
- 발 뜸 / 파묻힘 없음
- 대시 종료 반동 자연스러움 — 떨림 문제 없음
- 연속 대시 스케일 누적 없음
- 몹 / VFX 스케일 오염 없음
- 화염장판 위 빨간탄 / 무지개탄 판독 문제 없음
- 장판 다중 겹침에서도 탄막 색 판독 문제 없음
- 모닥불 / 제단 / 보스광원 / 플레이어 등불 회귀 문제 없음
- 실플레이 성능 체감 문제 없음

→ 자동검증에서 미확정(NOT VERIFIED / NOT ASSESSABLE / NOT TESTED)이던 항목을 **사용자 실기 판정으로 종료**.

---

## 3. 최종 판정

| 항목 | 판정 |
|---|---|
| MOTION 커널 | **PASS** |
| bladeDash 스쿼시 | **PASS** |
| fireZone preset7 | **PASS** |
| 탄막 판독 j/k | **PASS** (사용자 실기) |
| 실기 성능 | **PASS** (사용자 실기 체감) |
| **PHASE V1** | **FINAL PASS / SEALED** |

**봉인 근거**: 자동 검증(SwiftShader)은 환경 한계로 PARTIAL이었으나, 이후 사용자가 실제 GPU/240Hz 플레이 환경에서 직접 검증하여 대시 시각 품질·fireZone 위 탄막 판독·조명 회귀·성능 체감 모두 이상 없음을 확인. 따라서 PHASE V1을 최종 봉인 PASS 처리한다.

**봉인 이후 변경 금지**: MOTION 커널 / bladeDash 스쿼시 파라미터(amt=0.22, st2=12 기준) / fireZone preset7 falloff·색상 라우팅은 봉인. 재조정은 새 증거 또는 사용자 지시가 있을 때만.
