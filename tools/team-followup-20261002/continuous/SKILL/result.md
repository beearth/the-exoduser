# SKILL (continuous) — blur 취소 후보 A의 실제 발사·차감 대조 (현행 vs 후보 A)

`claude-native-6/SKILL`의 C0 PASS·MM-B1/B1b 재현(FAIL)을 **인수만** 하고 반복하지 않는다. 그
하니스는 `fireMaliceMortar` **호출 probe**만 돌려 후보 A의 **실제 MP/쿨다운/bomb/음향 차감 보존**을
검증하지 못했다. 이번 한 건이 그 빈칸 하나를 메운다: 실제 `fireMaliceMortar·useMp·mpCost` 체인을
verbatim 실행해 **현행(blur 유령발사 + 실제 차감) vs 후보 A(무발사·무차감)** 를 대조하고, **정상
keyup 동등성**을 확인했다. `productionApplied=false`.

> **source fixture PASS ≠ runtime/visual/청취 PASS.** Node source fixture 실행 결과이며 실게임/GPU/
> 시각/청취/HTTP/저장/패키지 PASS가 아니다.

---

## 1. source 시점·경계 (인수, Git 조회 없음)

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| `game.html` SHA-256 (현행, 본인 Read 시점) | `2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94` |
| `game-easy-test.html` SHA-256 (현행) | `3e5969ca139497c2efb312dc720ab53eb42a8d1912c8288caa2ce858cfd5120a` |
| 총괄 제공 commit (COMMON.md, 독립 관측 아님) | `7e69495046323b3120578f67635c20feb48b2a4f` (카드 수명·NW.js 실패 응답 반영이라고 **총괄이 밝힌** 값) |

> **변경 사실 보고:** game.html SHA가 직전 과제(`claude-native-6`)의 frozen `30ae8544…`에서 현재
> `2e45ee0e…`로 **달라졌다**(총괄의 UI minus 수명 가드 등 순차 통합 추정). 본인은 Git 조회/되돌림을
> 하지 않고, **mortar 관련 fragment는 현행 행을 직접 재추출**해 확인했다(아래). 총괄의 수명 가드가
> `_clearHeldInput`/aim 블록을 이미 바꿨는지는 **본인 소관 아님** — 현행 추출값은 "직전 과제와 동일
> 로직"이었다(mortar 플래그 미초기화 유지). 총괄 확정 HEAD 증거가 없으면 이 SHA는 작성 시점값.

**현행 game.html에서 직접 grep·Read한 실제 행(이전 행힌트로 추측하지 않음):**

| fragment | game.html 행 | 비고 |
|---|---|---|
| `_COST_BASE`/`_COST_SK`/`_COST_DPS` | 30718–30738 | `mortar:50`, `_COST_SK.mortar='maliceMortar'`, `_COST_DPS.mortar=.35` |
| `_skLv`/`_dpsCostMul` | 30739–30740 | |
| `pMagicCost` | 26828 | `PASSIVES.pMagic`·`_eqAffix`·`_uEq` 의존 |
| `mpCost`/`useMp`(+`_lastCost`) | 30717, 30750–30754 | `useMp`가 실제 `P.mp` 차감·`_lastCost` 기록 |
| `_isFused` | 43007 | |
| `_r` | 12004 | `Math.random` 사용 |
| `EL` | 13838 | |
| `fireMaliceMortar` | 43770–43786 | 진입 즉시 `P._mmAiming=false; useMp('mortar');` → bomb/쿨/SFX/voice |
| `_clearHeldInput` | 12877–12885 (blur 등록 12886) | P guard 12883: `if(…P)P._beamHold=false;` |
| mortar aim/charge/release 블록 | 35217–35228 | `_mmRel=_mmCharging&&_mmK&&!KH[_mmK]` (level 기반) |
| `P` 초기 선언 | 15899 `let P=null,…` | 전역 **초기 null** — fragment는 실행 시 할당된 P 참조 |

하니스 self-hash(변형 방지): `fire`=`c3f33f87…`, `aim`=`85893d2c…`, `clearCur`=`918640ed…`,
`useMp+mpCost`=`933fd913…` (checks.mjs 출력 `srcHashes`).

---

## 2. 실제 P 경계 / 대역 분리 (비용 가짜 대입 아님)

- **실제 source fragment (verbatim 실행):** `_COST_BASE/_SK/_DPS`, `_skLv`, `_dpsCostMul`,
  `pMagicCost`, `mpCost`, `useMp`, `_isFused`, `_r`, `EL`, `fireMaliceMortar`, `_clearHeldInput`
  (현행 + 후보 A 변형), aim 블록.
- **대역(band, 문서화된 baseline 입력·side-effect 레코더):**
  - `PASSIVES={pMagic:0}`, `_eqAffix()=>0`, `_uEq()=>0` — **무장비·무패시브 baseline**. 실제
    `pMagicCost` 공식이 이 입력으로 **실행**되어 `=max(.40,1)=1`. 비용을 가짜로 대입하지 않음.
  - `SFX.magic/playSample/shake` = 호출 레코더, `showPH/_T` = no-op, `G={}` = 실제 그릇.
  - `Math.random` = 시드 PRNG(mulberry32, seed `0x5EED`)로 교체 → 두 변형을 **동일 스트림**으로
    돌려 호출/RNG 순서·개수를 결정적으로 대조(실제 source가 스트림을 실제 순서로 소비, seed만 고정).
- **P baseline:** `mp=100`, `skills={maliceMortar:1}`(Lv1), `_fused=null`(무합체). Lv1·baseline →
  `mpCost('mortar')=~~(50 × _dpsCostMul=1 × pMagicCost=1)=50` (실제 공식 산출). iceOrb 미보유 →
  `_iceFuse=false` (합체 분기 미발동, 정상).

---

## 3. 대조 결과 (Node v24.15.0, stdout JSON)

| 변형 / 시나리오 | 입력(전제) | 기대 | 관찰: fired / mpΔ / lastCost / 쿨다운 / bomb(r) / SFX / RNG / 조준·충전 after | 판정 |
|---|---|---|---|---|
| **current / normalKeyup** | 충전 후 사용자 keyup | 정상 발사·차감 | fired=T / **mpΔ=50** / lastCost=50 / 쿨=660 / bomb(r=400) / `[SFX.magic(3),playSample(voice_grunt),shake(5)]` / RNG=3 / aim=F,charge=F | 기준 |
| **candidateA / normalKeyup** | 동일 | current와 동일 | fired=T / **mpΔ=50** / lastCost=50 / 쿨=660 / bomb(r=400) / **동일 SFX** / RNG=3 / aim=F,charge=F | **NORMAL_EQUIV=PASS** |
| **current / blur** | 충전 중 `blur`→`_clearHeldInput`→다음 프레임 | (현행 결함) | **fired=T** / **mpΔ=50** / lastCost=50 / **쿨=660** / **bomb(r=400)** / **SFX 3종 호출** / **RNG=3** / aim=F,charge=F | **CURRENT_BLUR_GHOSTFIRE=FAIL(결함)** |
| **candidateA / blur** | 동일 + 후보 A `_clearHeldInput` | 무발사·무차감 | **fired=F** / **mpΔ=0(mp 100 유지)** / lastCost=0 / **쿨=0** / **bomb=null** / **SFX=[]** / **RNG=0** / aim=F,charge=F | **CANDIDATEA_BLUR_NOFIRE=PASS** |

### 메운 빈칸(핵심 결론)
1. **정상 keyup 동등성(실측):** 후보 A는 `_clearHeldInput`만 바꾸고, 정상 keyup 경로는 그 함수를
   호출하지 않으므로 **발사·실제 MP차감(−50)·쿨다운(660)·합체 분기(iceFuse=false 동일)·SFX·RNG(=3)
   순서가 current와 완전 동일**. → 후보 A가 정상 조작을 바꾸지 않음을 **실제 차감 체인으로** 확인.
2. **현행 blur = 진짜 손해:** 유령발사가 probe 수준이 아니라 **실제 `useMp`로 MP 50 차감 + 쿨다운
   660 + `G._mmBomb` 생성 + SFX/voice/shake + RNG 3소비**까지 도달(이전 probe-only가 못 본 부분).
3. **후보 A blur = 추가 0:** 발사 분기 자체 미도달 → **MP 무차감(100 유지)·쿨다운·bomb·음향·RNG
   모두 0**, 조준/충전 플래그 해제. MP식·쿨다운·합체·RNG·입력배열·beam/dash/cutscene **불변**.

---

## 4. UNKNOWN (실제 의존성 미실행 — 유지)

- **MM-B2(alt-tab hidden rAF)·MM-P1(pause)·MM-D1/D2(die/revive)·MM-G1/G2(패드 전환)·MM-S1(스테이지
  이월)·maliceStorm(`_msDist` 동일 홀드→release 구조):** 이번 과제 범위 외, **기존 UNKNOWN 유지**.
  단일 update/합성 blur를 실게임 focus 타이밍으로 확대하지 않았다.
- **실게임 focus 타이밍·실제 입력장치·GPU/시각/청취:** 미실행 → QA 후속 Gate.

---

## 5. 후보 A 정의 (checks 안 메모리 원문 변환 — 생산 적용 0)

현행 `_clearHeldInput` 12883행 `if(typeof P!=='undefined'&&P)P._beamHold=false;` → **기존 P guard
안에서** 두 플래그만 추가:

```js
if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false}
```

입력 배열 초기화·`_dashHold/_beamHold`·`_cutSkipHold`·거리/키·MP식·쿨다운·합체·RNG는 **불변**.
실제 keyup 엣지로의 입력 모델 교체(후보 C)·die/revive/패드/스테이지/maliceStorm 수정은 **안 함**.

---

## 6. docs 정정 인계 (미적용 — 공유 docs는 총괄 순차 수행)

rg(`_clearHeldInput|maliceMortar|_mmAiming|_mmCharging|blur|포커스|useMp`) 전수 결과, mortar 조작
계약 문서에 **수명 경계 제약이 없음**. 정확한 보충 문안:

| docs 파일·행 | 현행 | 보충 문안(canonical 반영안, 미적용) |
|---|---|---|
| `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md:227` | maliceMortar "투척(…릴리즈=투척)" | 각주: "홀드=충전/릴리즈=발사는 **창 blur·visibilitychange에서도 합성 release로 발사됨** — `_clearHeldInput`가 `KH`만 비우고 `_mmAiming/_mmCharging`을 남기며 `_mmRel`이 level 기반이라, 충전 중 포커스 상실 시 **실제 MP −50·쿨다운 660·`G._mmBomb`·SFX/voice까지 유령발사**(continuous/SKILL 실행 재현). 후보 A(= `_clearHeldInput` P guard 안 `_mmAiming/_mmCharging=false`)로 차단 가능, 정상 keyup은 발사·차감 동일. 생산 미적용." |
| `:398`, `:400` (maliceMortar 홀드-충전 상세) | e.repeat 가드만 언급 | 동일 수명 경계 제약 1줄 추가 권고(조작·수치 설계 변경 아님). |
| `:228`, `:397` (maliceStorm `_msDist`) | "키홀드→충전, 릴리즈=발사" | **동일 홀드→release 구조 경보**: mortar와 같은 수명 결함 가능성 → **QA 조사 대상 등재**(이번 미검증, UNKNOWN). |
| `docs/2_1 …/SKILL03_설치확정_자원검수_20261001.md` (수명 언급 없음) | — | 말미 추가안: "2026-10-02 continuous/SKILL: 후보 A **실제 차감 대조** 완료 — 정상 keyup 동등(mpΔ=50·쿨660·RNG3 동일), 현행 blur 유령발사가 **실제 MP차감·쿨다운·bomb·음향·RNG 소비**까지 도달(FAIL), 후보 A blur는 **추가 0**(PASS). productionApplied=false, source fixture PASS ≠ runtime/visual/청취 PASS. MM-B2 등·maliceStorm UNKNOWN 유지." |

---

## 7. 소유·인계·남은 의존성

- **소유 쓰기(3개):** `continuous/SKILL/{checks.mjs, result.md, evidence.json}`. 그 외 쓰기 0.
- **미수행:** 생산 적용, Git/index/commit/push, 서버/실게임/UI/오디오/빌드/설치/새세션/하위팀/외부
  메시지, 파일 삭제·이동·cleanup, 이전 완료검사(C0/MM-B1/B1b/142) 반복·합산.
- **다음 Gate:** ① 총괄 — 현행 SHA 재검증(위 `2e45ee0e…`는 작성 시점, 총괄 수명 가드 통합 여부
  확인), 후보 A 적용 여부·§6 docs 반영. ② QA — 실게임 focus 타이밍으로 MM-B1 실측 + UNKNOWN 6경로
  + maliceStorm 동일 구조. **source fixture PASS ≠ runtime/visual/청취 PASS.**
