# SKILL-beam-overload-cancel-vs-deplete-cap1326 — 빔 과부하가 MP 소진 vs 단순 취소를 구분하는가

**회복 과제 산출 한 건.** omniBeam/arcLaser blur→종료 caller에서 `mp<=0` 과부하 `_beamCd=300`이
**정상 자원 소진(과부하 의도)**과 **단순 입력 취소(mp>0, 과부하 금지)**를 구분하는지 실제 채널
caller·CD/MP 원장으로 대조. SOUND 오디오/trail 검사 반복 0.

- **결론: 결함 미재현 — 근거 있는 NO-FIX.** 과부하는 **mp<=0 소진 전용**이며, 단순 취소/blur(mp>0)는
  **과부하 없이 추가 drain 0으로 깨끗이 종료**. 구분 로직 **정상**.
- 저장 epoch: `rolling-after-0d918990-1326` (SKILL credit 2 사용). `productionApplied=false`.
  **source/fixture PASS ≠ native/시각/청취 PASS**.

---

## 1. 소스 근거 (현행 game.html, 양판 parity=true)

| 지점 | 행 | 내용 |
|---|---|---|
| **pre-drain 가드** | 32860 | `if(!isAct('beam')||P.mp<=0){const _wasOmni=omniBeam&&fanShot&&_isFused('sixFuse'); if(_wasOmni&&P.mp<=0){P._beamCd=300;…과부하} P.s='idle'; P.mp=Math.max(0,P.mp); P._omniPts=null; SFX.beamStop(); break}` — **드레인 전에** 종료 판정 |
| drain | 32877 | `P.mp=Math.max(0,P.mp-_bcost*sp)` (omni Lv1 `_beamMpBase=15`→0.25/f) |
| post-drain exit | 32880 | `if(P.mp<=0){if(_isOmni){P._beamCd=300;…과부하} P.s='idle';…}` |
| arcLaser 해제 | 34750 | `if(!isHeld('beam')){P._alActive=false;…P.s='idle';…'광선 해제'}` |
| arcLaser MP소진 | 27607 | `if(P.mp<_alMpTick){P._alActive=false;…'MP 부족 — 광선 해제'}` |

- `_wasOmni`(32860) **==** `_isOmni`(32869) = `omniBeam&&fanShot&&_isFused('sixFuse')` — **동일 조건**(비일관성 없음).
- 과부하 두 분기 모두 **omni(sixFuse) 전용**. 비합체 멸살(10)·만화광선(15) 빔은 과부하 자체 없음.
  stormBurst 합체는 과부하 무시(docs 567, `!_isFused('stormBurst')` 가드 계열).

Provenance 조각 SHA-256(양판 동일): topGuard `da4ff18d…`, botGuard `d1a20d21…`, alRelease `2807a27c…`,
alDeplete `ac305972…`. checks.mjs SHA `fb82570b6400f2954b4e99271e7405acd6b880826c497e291d9e2593d4b6c0ad`
(2026-10-02T13:31Z / 22:31 KST, exit 0).

---

## 2. 원장 대조 (정상 소진 vs 단순 취소 vs blur)

| 시나리오 | 종료 지점 | mp 시작→끝 | `_beamCd` | 과부하 | 취소 후 추가 drain |
|---|---|---|---|---|---|
| holdDeplete (계속 홀드, mp 소진) | exitBot(32880) | 1→0 | **300** | **발동(의도)** | — |
| cancelMpPositive (mp>0서 해제) | **exitTop(32860)** | 1→0.5 | **0** | **미발동** | **0** |
| blurMpPositive (mp>0서 blur) | exitTop(32860) | 1→0.5 | 0 | 미발동 | 0 |

판정: DEPLETE_OVERLOADS=PASS / CANCEL_NO_OVERLOAD=PASS / BLUR_NO_OVERLOAD=PASS /
**DISTINGUISHES=YES**(과부하는 mp<=0 소진 전용; mp>0 취소/blur는 미발동) → **NO-FIX**.

### 핵심 (왜 구분이 성립하는가)
- 과부하의 필요조건은 **`P.mp<=0`**. 두 종료 분기(32860·32880) 모두 `mp<=0`일 때만 `_beamCd=300`.
- **pre-drain 가드(32860)가 드레인보다 먼저** 돈다 → 단순 취소/blur(`!isAct('beam')`)는 mp가 양수인
  채로 32860에서 빠져나가 `_wasOmni&&mp<=0`이 **false** → 과부하 안 됨, 그 프레임 **추가 MP 드레인도
  없음**(32877 미도달). 따라서 취소와 소진이 명확히 분리된다.
- arcLaser는 beam case 32848서 선-break, 해제(34750 `!isHeld('beam')`)/소진(27607)으로 별도 종료,
  과부하 없음. `_clearHeldInput`가 `_beamHold`를 비우므로 blur→34750 해제 도달.

---

## 3. 도달 경계·한계 (정직)

- 채널 전체 case(≈40줄+, isAct/_isFused/bt()/canMv 등)는 미실행 — **종료/드레인/과부하의 실제 제어
  조각**만 추출·해시·전사 실행(whirlwind·kiSlash와 동일 방법).
- **방어적 edge(결함 아님):** 플레이어가 mp가 정확히 0이 되는 프레임에 취소하면 `mp<=0`이므로 과부하
  발동 — 그러나 이는 **소진 자체**라 의도대로. mp>0 취소는 전부 미발동.
- native/시각/청취(빔 종료음은 SOUND beamStop 소관)는 별도 Gate. 본 검증은 **gameplay CD/MP 원장**만.

---

## 4. docs 동기화 인계 (미적용 — root canonical. rg 1회 수행)

rg(`_beamCd|과부하|omniBeam|멸살광선|arcLaser|얼음송곳`): 조작 계약(223 omniBeam / 225 arcLaser)에
과부하-취소 구분 주석 없음(567은 stormBurst 과부하 무시만 언급).

| docs 파일·행 | old | new (반영안, 미적용) |
|---|---|---|
| `docs/2_1 …/2_1 스킬관리+합체시스템.md:223` omniBeam | "우클릭 홀드 빔, 직선 관통" | 각주: "암전(sixFuse) 합체 빔은 **MP 소진(mp<=0) 시에만 `_beamCd=300`(5초 과부하)**. 단순 홀드 해제/창 blur(mp>0)는 과부하·추가 드레인 없이 종료(pre-drain 가드 32860). stormBurst 합체는 과부하 무시(567)." |
| `:225` arcLaser | 채널 설명만 | 각주: "해제=`!isHeld('beam')`(34750), MP 소진=`mp<_alMpTick`(27607) 모두 '광선 해제'로 종료, **과부하 없음**." |

> 공유 docs 수정 0. 정확 old/new·값은 root 순차 동기화.

---

## 5. 준수 · 다음 독립 후보

- **소유 2파일:** 이 `result.md` + `checks.mjs`(SHA `fb82570b…`). epoch `…1326` credit 2 사용,
  반복당 ≤3. 기존 제출/원자료 불변, 같은 검사·trail·SOUND 오디오 반복 0.
- **미수행:** production·공유docs·Git(조회 포함)·사용자game/save·새세션·resume·RemoteControl·권한.
  보호 2_3·Q-only·attack-ticket 유지. 실제 AskUserQuestion/승인은 사용자에게 남김. native 6/화면/청취 분리.
- **Changes 체크포인트:** 저장 전 61(80 미만). 80부터 완료 소유만 checkpoint, 100 전 신규파일 중단.
- **다음 독립 후보 1 (제안):** **iceOrb(`_ioActive`/`_ioT`) 채널(31754 `case 'iceOrb'` "이동 불가, 빔
  회복만") 의 release/blur 수명** — `_clearHeldInput`가 `_ioActive` 미초기화. 활성 중 blur→복귀 시
  채널 고착/비의도 자원·회복 지속 여부를 실제 caller로 대조(2_3·SOUND·오디오 아님). credit 소진 시
  메모리로 선분석.

**blocker:** 없음. 제품 완료로 보고하지 않음 — CH1-1 빔 취소/소진 실제 체감은 QA 6단계 Gate.
