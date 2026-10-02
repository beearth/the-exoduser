# SKILL-whirlwind-stormbeam-residual-cap1300 — whirlwind 채널 입력취소 lifecycle: stormBeam 잔류 소스

**회복 과제 산출 한 건.** whirlwind(회전참) **hold진입→whirlTick→blur/해제→효과수명/실제 ST 소비**를
현재 source caller로 연결, **잔류효과 최초 결함 1** + 정상 hold/release 대조 + 실제 ST 드레인 대조.
kiSlash 옛4/후속원장 **반복 0**, 수치/환급/보호 2_3 정책 **변경 0**.

- 저장 epoch: `rolling-after-3b548b06-1300` (root checkpoint `3b548b06…`, newOwnedFileCredits=2).
  이 저장은 **이미 수행한 메모리 분석의 인계**이며 재실행이 아니다(§원 stdout 그대로 보존).
- `productionApplied=false`. **source/fixture PASS ≠ native/시각/청취 PASS** — 오디오 실제 가청은
  별도 Gate(SOUND/QA 청취).

---

## 1. 소스 근거 (현행 game.html, 양판 parity=true)

| 지점 | 행 | 내용 |
|---|---|---|
| 진입 | 31814 | `isHeld('weapon')&&P.skills.whirlwind&&P.activeLMBSk==='whirlwind'&&P.st>=2` → `P.s='whirlwind'`; stormBeam 합체면 `P._eStormActive=true` |
| 틱(stormBeam) | 31944–31945 | `P._eStormActive=true`; 120f마다 이전 `_eStormSrc.stop()` 후 **루프 hiss 소스 `P._eStormSrc=playSample(...)` 재생** |
| 드레인 | 31908–31909 | `_wwCostSec=~~(30+(Lv-1)*5)`(Lv1=30); `P.st-=_wwCostSec/60*sp` = **0.5 ST/frame** |
| **종료** | 32045–32048 | `if(!isAct('weapon')||P.st<=0||…){ if(P._eStormActive){P._eStormActive=false;playSample('electric_storm_tail',…)} P.s='wRecover';… }` — **`P._eStormSrc.stop()` 없음** |

Provenance 조각 SHA-256(양판 동일): tick `f81d5d82…`, **exit `1fc5fa41…`**, drain `8b08bd7f…`.
실제 종료 조각 원문:
```
if(!isAct('weapon')||P.st<=0||(_wwFused&&P.hp<=P.mhp*.05)){
  // 종료 시 추가 기폭 제거 — 회전 중 자동기폭(parryT 주기)으로 통일
  if(P._eStormActive){P._eStormActive=false;playSample('electric_storm_tail',.4,_r(1,.1))} // 종료 여운 0.5초
  P.s='wRecover';P.st2=18;P.wwAng=0;P._wwDetTimer=0;P._wwHitTimer=0;P._sbTgts=null;P._sbPtsCnt=null;P._sbHitF=0;P._sbTgtT=0;P._wwTrN=0}
```

---

## 2. 원 stdout (메모리 분석, 재실행 아님 — 그대로 인계)

Node v24.15.0, checks.mjs SHA `e87e43fc949c1873158392599f02973ffa51d479a7cd4cd950febe7e0008b6f4`
(저장본 자체검증: frag 해시·parity·verdicts 동일 재현, 2026-10-02T13:00Z / 22:00 KST).

```json
{
  "parityBothBuilds": { "tick": true, "exit": true },
  "fragSha": { "tick":"f81d5d82…", "exit":"1fc5fa41…", "drain":"8b08bd7f…" },
  "matrix": [
    {"variant":"current","scenario":"normalRelease","stDrainedTotal":2.5,"drainPerFrame":0.5,"eStormActiveAfter":false,"eStormSrcAfter":"live:electric_storm_hiss1","residualUnstoppedSources":1,"tailPlayed":1,"finalState":"wRecover"},
    {"variant":"candidate","scenario":"normalRelease","stDrainedTotal":2.5,"eStormActiveAfter":false,"eStormSrcAfter":null,"residualUnstoppedSources":0,"tailPlayed":1,"finalState":"wRecover"},
    {"variant":"current","scenario":"blur","stDrainedTotal":2.5,"eStormActiveAfter":false,"eStormSrcAfter":"live:electric_storm_hiss1","residualUnstoppedSources":1,"tailPlayed":1,"finalState":"wRecover"},
    {"variant":"candidate","scenario":"blur","stDrainedTotal":2.5,"eStormActiveAfter":false,"eStormSrcAfter":null,"residualUnstoppedSources":0,"tailPlayed":1,"finalState":"wRecover"}
  ],
  "verdicts": {
    "ST_DRAIN_REAL":"PASS(실제 drain 0.5/f Lv1, release==blur 동일, 환급0)",
    "CURRENT_RESIDUAL_DEFECT":"FAIL(종료 후 _eStormSrc 루프 소스 미정지 잔류)",
    "CANDIDATE_FIX":"PASS(종료 시 _eStormSrc.stop()+null, 잔류0; release/blur)",
    "NORMAL_EQUIV":"PASS(정상 release 상태/ST/tail 불변)"
  }
}
```

---

## 3. 결론 (최초 결함 1 + 자원 대조)

- **잔류효과(결함):** stormBeam 합체 whirlwind 종료 시 **전기폭풍 hiss 루프 소스 `_eStormSrc`가 정지되지
  않고 남음**(`_eStormActive` 플래그만 내리고 tail만 재생). **정상 해제·blur 양쪽** 발생 → 입력취소
  lifecycle의 **효과수명 누수**(blur 전용 아님 — 정직 명시).
- **비의도 자원소모 없음:** ST 드레인은 실제식 0.5/frame(Lv1), **release==blur 총량 동일(2.5)**, 종료
  프레임 1틱 외 추가 없음, 취소가 **환급/이중차감 안 함** → "이미 쓴 ST 보존" 확인.
- **정상 등가:** 후보는 종료 상태(wRecover)/ST/tail을 **불변**으로 두고 소스 정지만 추가.

---

## 4. 최소 후보 (미적용 — 생산 반영은 root)

종료 블록(32047)에 한 줄 append:
```js
if(P._eStormActive){P._eStormActive=false;playSample('electric_storm_tail',.4,_r(1,.1))}
if(P._eStormSrc){try{P._eStormSrc.stop()}catch(e){}P._eStormSrc=null}   // [후보] 루프 hiss 소스 정지
```
- **불변:** ST 드레인/데미지/환급/CD/보호 2_3/패링·합체 수치/연출(tail 유지). 이미 종료된 오디오
  소스 참조를 정지·해제만 함.
- 비합체 whirlwind는 `_eStormSrc` 미사용 → 영향 없음. 결함·후보 모두 **stormBeam 합체 한정**.

---

## 5. 한계·Gate·도메인 (정직)

- **대역:** `playSample`=정지 가능 소스 객체(상태 수명만). 본 검증은 `_eStormSrc` 참조가 종료 후
  live/미정지인지(소스-상태 lifecycle)만 입증 — **실제 가청 출력·native 오디오는 별도 Gate**.
- **채널 전체 미실행:** `case 'whirlwind'`(≈200줄, hitArc/wp()/statDex 등 핫패스 deps 과다)는
  미실행. 틱/종료/드레인의 **실제 제어 조각**만 추출·해시·모델 실행.
- **도메인 겹침:** 오디오 소스 수명은 SOUND 담당과 겹침 — SKILL은 whirlwind **입력취소 lifecycle
  연결·결함 지점**을, SOUND/QA는 **실제 청취 정리**를 인수하도록 조율 인계.

---

## 6. 준수 · 다음

- **소유 2파일:** 이 `result.md` + `checks.mjs`(SHA `e87e43fc…`). epoch `…1300` credit 2 사용,
  반복당 ≤3 준수. 기존 산출/제출본 미수정, 같은 검사 재실행 0.
- **미수행:** production·shared docs·Git(조회 포함)·사용자game/save·새세션·권한·Remote Control·설치·
  게시. 권한/모드 변경·Ask 응답대행 안 함. 보호 2_3·Q-only·attack-ticket 유지. native 6/visual/audio 분리.
- **Changes 체크포인트:** open 시 60(projected 98<100). 80 도달 시 즉시 체크포인트, 100 전 새 파일 중단.
- **다음 독립 한 건(즉시 진행):** 같은 CH1-1 목표의 또 다른 입력취소 경계 — omniBeam/arcLaser `_beamHold`
  채널 release 수명(`SFX.beamStop`·`_beamCd` 정리 여부) 또는 whirlwind `_wwTr` 잔상 트레일 수명.
  credit 소진 시 메모리로 계속, 허가/epoch 대기 없음.

**blocker:** 없음. 제품 완료로 보고하지 않음 — CH1-1 연결 플레이·청취는 QA 6단계·SOUND 청취 Gate로 인수.
