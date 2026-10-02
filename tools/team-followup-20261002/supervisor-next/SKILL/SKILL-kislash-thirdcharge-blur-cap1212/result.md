# SKILL-kislash-thirdcharge-blur-cap1212 — kiSlash 3타 홀드차지 blur 유령발사 경계

**CH1-1 마일스톤 SKILL 행 산출 한 건.** "현재 CH1-1 입력 release/cancel의 실제 연결 후보" — 이미
채택된 조준/release 가족(mortar/storm/hellRay/iceStorm/boneWall/thunderStake) **중복검사 0**, 새
caller 하나를 **양판 실제 소스 동적 추출·해시·실행**으로 제출한다.

- 저장 epoch: `capacity-after-6a39b828-1212` (root checkpoint `6a39b828…`, allowNewOwnedFiles=true,
  SKILL 허용, role당 1회·2파일). 이 저장은 **이미 수행한 실행의 인계**이며 재실행이 아니다.
- `productionApplied=false`, `runtimeAccepted=false`. **source/fixture PASS ≠ native/시각/청취/실게임
  PASS** — kiSlash는 특히 **키보드/패드 실입력·창 focus** 실게임 Gate 필요(미검수, QA 의존).
- 공유 source/docs/Git/사용자 save 변경은 root 슬롯/소유. 본인은 이 폴더 2파일만 소유.

---

## 1. 소스 앵커 · 명령 (본인 Read/실행 시점)

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| 실행 시각 | 2026-10-02T12:15Z / 21:15 KST, Node v24.15.0, **exit 0** |
| `checks.mjs` SHA-256 (소유) | `02a5c7aaac2722c5b30d413d05e01abe929fcdb19f7031207d75c8cf0ce25999` |
| 목표 문서 제시 SHA vs 실제 | 제시 `889fb16f…` **≠** 디스크 `713aa80c…` (root docs WIP 추정) — 제공값 미검증, **디스크 실제본**으로 작업 |

**선정 함수/경계 (현행 game.html 직접 확인):**
- `_updateKiSlashThirdCharge` (16011–16030): release **레벨 기반** — `if(isHeld('weapon'))return false;`
  아니면 `_fireKiSlashCrescent(3,frames)` 후 `P.s='wSwing'`. `BINDS.weapon='mouse0'`(LMB) → `isHeld`가 `MB[0]` 읽음.
- `_clearHeldInput`: `MB[0]` 등은 비우나 **`_kiChargeActive`/`P.s==='wWindup'` 미초기화**.
- 업데이트 루프 32114: `if(P.s==='wWindup'){if(P._kiChargeActive)_updateKiSlashThirdCharge(sp);…}`.
- 기존 채택 취소(31758, `case 'idle'`): `_kiChargeActive=false;_kiChargeT=0;_cresStep=0;_cresComboT=0`
  (idle 상태 클린업) → 후보는 이와 동일 플래그 + **wWindup→idle 상태 복원**을 더한다.

---

## 2. 원 stdout (동적 추출·실행, 재실행 아님, 그대로 인계)

```json
{
  "dynamicSource": true,
  "parityBothBuilds": { "upd": true, "clear": true },
  "sliceSha": {
    "upd":  "ae4dc4d87bdda9c7038f4496c5e45064599c0a028693ea047ddf1c8fc70adfef",
    "clear":"e5349553045eeecb2cea724cf9a065eeb9dba0eb022ccc13fb89f74a1af44ca5",
    "clearCandidate":"7744529c62685197699c0ce6ab25216a309a41d9527a5b328214e903672d7391"
  },
  "verdicts": { "CONTROL_EQUIV":"PASS", "CURRENT_DEFECT":"FAIL", "CANDIDATE_FIX":"PASS" }
}
```

| 변형 / 시나리오 | chargingActive | `_kiChargeActive` clear후 | P.s clear후 | fired(검기) | 최종 P.s |
|---|---|---|---|---|---|
| current / normalRelease | true | true | wWindup | **T(stage3)** | wSwing |
| candidate / normalRelease | true | true | wWindup | T(stage3) | wSwing |
| current / blur | true | **true(sticky)** | wWindup | **T(stage3)** | wSwing |
| candidate / blur | true | **false** | **idle** | **F** | **idle** |

- **CONTROL_EQUIV=PASS:** 정상 릴리즈(플레이어 MB 해제) 검기 발사(stage3)가 current==candidate 동일,
  최종 wSwing 동일 — 후보가 정상 release 경로를 **불변**.
- **CURRENT_DEFECT=FAIL:** 충전 중 blur → `_clearHeldInput`가 `MB[0]`만 비우고 `_kiChargeActive`(wWindup)
  잔존 → 다음 프레임 `_updateKiSlashThirdCharge`가 `isHeld('weapon')` false로 **유령 검기 발사**(stage3),
  wSwing 전이. 플레이어 의도 없는 발사.
- **CANDIDATE_FIX=PASS:** 후보가 blur에서 `_kiChargeActive=false`+`P.s='idle'` 복원 → 업데이트가
  wWindup 미진입 → **무발사, idle 유지**.

### provenance 신호 (root 통합 확인)
현행 실제 `_clearHeldInput` 해시 `e5349553…` = 직전 **boneWall 후보 해시**. 즉 **root가 `_bwAiming`
취소를 라이브 소스에 이미 통합**했고, 본 kiSlash 후보(`7744529c…`)는 그 현행본 위에 append. 양판
(`game.html`==`game-easy-test.html`) `_updateKiSlashThirdCharge`·`_clearHeldInput` **parity=true**.

---

## 3. 후보 (미적용 — 생산 반영은 root 슬롯)

현행 `_clearHeldInput` 말미 `_cutSkipHolding` anchor 앞에 삽입(결정적 변환, `clearCandidate` `7744529c…`):

```js
if(typeof P!=='undefined'&&P&&P.s==='wWindup'&&P._kiChargeActive){P._kiChargeActive=false;P._kiChargeT=0;P.s='idle';P.st2=0}
```

- 기존 idle 클린업(31758)과 동일 플래그 + **상태 복원(wWindup→idle)**. 아이템 가족의 단일 플래그
  취소와 달리 상태머신 전이가 필요한 구별점.
- **불변:** 원상수·연출·정상 release·RNG 순서·키바인딩·스킬 공식·보호 2_3·Q-only magic·attack ticket.

---

## 4. 소스·대역·실입력 범위 구분 (정직한 한계)

- **실제 소스(동적 바이트 실행):** `_updateKiSlashThirdCharge` release 레벨판정, `_clearHeldInput`
  (현행+후보), 업데이트 루프 32114 재현.
- **대역:** `_fireKiSlashCrescent`(발사 도달 레코더), `isHeld`(MB[0] 반영), `_kiSlashHoldMultiplier`/
  `_KI_HOLD_MAX`(배율 helper). 따라서 **정상 발사의 실제 ST 차감/쿨다운/피해 수치는 banded** — 본
  검증이 입증한 계약은 "**취소는 발사·자원·CD 소모 0 + 상태 idle 복원**, 정상 release는 기존 crescent
  경로 유지". 정확 ST/CD 수치 대조는 `_fireKiSlashCrescent`/`wSwing` 실경로로 후속(**BALANCE 현행 값**
  의존). `st2=0` 복원 정확값은 **UIUX 입력** 의존으로 확정 필요.
- **실입력 Gate(미검수):** 실게임 창 focus/alt-tab, 키보드/**게임패드** 실입력, 청취/시각 — **QA
  실제 입력** 의존. source extraction provenance(해시·parity)와 실입력 Gate는 **분리**.

---

## 5. 준수 · 의존성 · 다음

- **소유 2파일:** 이 `result.md` + `checks.mjs`. epoch `…1212` 저장 1회·2파일 준수. 기존 산출/TASK/
  WIP 미수정, 같은 검사 재실행 0.
- **미수행:** production·shared docs·Git(조회 포함)·사용자게임/save·외부설치/게시·새세션·실게임/빌드/
  대형 asset(root 단일 슬롯까지 보류). 권한/모드 변경·Ask 응답대행 안 함.
- **의존성(마일스톤 SKILL 행):** UIUX 입력(st2/상태 복원값), BALANCE 현행 값(ST/CD 수치), QA 실제
  입력(창 focus·패드).
- **다음 독립 한 건(메모리 진행):** 같은 CH1-1 목표의 또 다른 입력 release/cancel 경계 — 채널링
  (whirlwind `whirlTick`/omniBeam `_beamHold` 수명) 또는 kiSlash 정상 release의 실제 ST/CD 실경로
  대조. 이번 2파일 예산 소진 후 새 epoch까지 메모리로 진행. 총괄 통합/감독 검수 대기 없이 계속.

**blocker:** 없음(독립 소스 검증 완료). 제품 완료로 보고하지 않음 — CH1-1 연결 플레이 Gate는 QA
실제 경로 6단계로 인수된다.
