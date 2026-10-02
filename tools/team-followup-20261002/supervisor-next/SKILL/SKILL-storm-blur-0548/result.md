# SKILL-storm-blur-0548 — maliceStorm 홀드→release 포커스 상실 경계 (현행 vs 후보)

감독 피드백대로 `continuous/SKILL`의 mortar 결과(실제 차감/쿨660/bomb/SFX/RNG3, 후보A 정상동등·blur
무발사)를 **source 근거로 인수만** 했다(재실행 0). 이번 한 건은 **다른 기존 스킬 maliceStorm(악의
폭풍)** 의 홀드→release가 포커스 상실에 반응하는 **독립 경계** 하나만 검사한다. mortar 4대조/C0/142
**재실행 0**. `productionApplied=false`.

> **source fixture PASS ≠ 실입력 포커스/음향/시각/게임 PASS.** 아래는 Node source fixture 실행 결과다.

---

## 1. source 시점·심볼 (본인 실제 Read, Git 조회 없음)

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| Read/SHA 기록 시각 | 2026-10-02T05:57Z / 14:57 KST |
| `game.html` SHA-256 (본인 Read 시점) | `dc711864876610a83c67a659d4f162551191b56ba11d74e1cb81f03df935368e` |
| `game-easy-test.html` SHA-256 | `1f139e0cd5fd898e33ba2b1c408b33e49984e106f0b46cc5b38b7d2abf2dabe1` |
| 감독 제공 원격검증 checkpoint(이력, 독립 HEAD 아님) | `f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c` (2026-10-02 감독 인수) + game`2e45`/easy`3e59`/node`541ff8` — **조회 시점 근거** |

> **이력 보존·변경 사실:** 감독 제공 game`2e45…`/직전 과제 game`30ae…`에서 현행 `dc711864…`로
> 바뀌었다(root 순차 통합 진행). Git 조회·되돌림 안 함. **mortar 결함의 root 통합분을 현행 source로
> 직접 확인함:** 현행 `_clearHeldInput`(12883)은 이미
> `if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false}` — 즉
> **mortar 두 플래그 취소는 root에 기통합**. 본인은 mortar 플래그를 **수정하지 않음**. 단 **`_ms`
> (maliceStorm) 플래그는 미포함** → storm은 여전히 미초기화.

**현행 game.html에서 직접 확인한 실제 심볼·행(이전 행힌트로 추측 안 함):**

| fragment | game.html 행 | 핵심 |
|---|---|---|
| router `case 'maliceStorm'` | 12484–12491 | 진입만: `P._msAiming=true;P._msAimKey=keyCode;P._msDist=150;P._msCharging=false` — **MP 체크/차감 없음**(쿨다운만) |
| maliceStorm aim/charge/release | 35039–35122 | `_msRel=P._msCharging&&_msKk&&!KH[_msKk]` (**level 기반**, mortar와 동형). 취소 `MBjust[2]||K['Escape']`, 발사 `MBjust[0]||_msRel` |
| 플레인 storm 발사(비합체) | 35105–35113 | `G._fireZones.push({type:'storm'})` + `SFX.magic(EL.L)` + `playSample(electric_storm*)` — **MP 미차감** |
| 발사 공통 꼬리 | 35114–35119 | voice RNG + `_msBF?P._bnsCd=1500:P._msCd=1200` + `P._msAiming=false` |
| `_clearHeldInput` | 12877–12885 | 12883 P guard: `_mm` 2플래그 기통합, **`_ms` 미포함** |
| `_isFused`/`_r`/`EL` | 43007 / 12004 / 13838 | verbatim |

하니스 self-hash(변형 방지): `aim`=`ecd253d1…`, `clearCur`=`933584568…` (checks.mjs 출력 `srcHashes`).

**핵심 구조:** mortar와 동형 `_msRel`(level 기반). 포커스 상실 시 `_clearHeldInput`가 `KH`를 비우면
`_msCharging` 잔존 → 다음 프레임 `_msRel=true` → 플레인 storm 발사(fireZone 설치). 단 **플레인
maliceStorm은 release에서 MP를 차감하지 않는다**(비용 = 쿨다운 1200 + fireZone + 연출).

---

## 2. source fragment / 대역 / 합성입력 (명시)

- **실제 source fragment (verbatim 실행):** maliceStorm aim/charge/release 블록(35039–35122, 합체
  분기 포함 전문), `_clearHeldInput`(현행 + 후보 변형), `_isFused`, `_r`, `EL`.
- **대역(band, side-effect 레코더·데미지 helper baseline):** `SFX.magic/playSample/addTxt/shake` =
  호출 레코더; `magicRef/statInt/pMagicMul/_skMul/_fuseMul`(및 합체 전용 `meleeRef/statStr/pAtkMul/
  pBeamMul`) = baseline 1(`_msDmg` **데미지값은 본 결함 대상 아님**, 비용 가짜대입 아님); `dst` =
  거리 band(플레인+빈 `_fireZones`라 미호출); `Math.random` = 시드 PRNG(mulberry32 seed `0x5EED`)로
  두 변형 동일 스트림 → 호출/RNG 순서 결정적 대조.
- **합성입력:** `_gpActive=true`로 게임패드 경로 고정(fire 위치 = `P.facing×_msDist`, mouse/cam
  비의존). `KH[key]=true`로 스킬 키 홀드 1프레임, 그 뒤 정상 keyup 또는 `_clearHeldInput`(blur).
- **P baseline:** `skills={maliceStorm:1}`(Lv1), `_fused=null`(무합체 → 플레인 경로), `mp=100`
  (플레인 경로가 MP를 건드리지 않음을 **실측**).

---

## 3. 대조 결과 (Node v24.15.0, stdout JSON)

| 변형 / 시나리오 | 입력 | fired / fireZone(type) / 쿨다운 msCd / MPΔ / SFX / RNG / 조준·충전 after | 판정 |
|---|---|---|---|
| **current / normalKeyup** | 충전 후 사용자 keyup | T / 1(storm) / **1200** / **0** / `[magic(4),electric_storm3,shake(4),voice_grunt]` / 5 / F,F | 기준 |
| **candidate / normalKeyup** | 동일 | T / 1(storm) / **1200** / **0** / **동일** / 5 / F,F | **NORMAL_EQUIV=PASS** |
| **current / blur** | 충전 중 `_clearHeldInput`→다음 프레임 | **T** / **1(storm)** / **1200** / 0 / **SFX 호출** / **5** / F,F | **CURRENT_BLUR_GHOSTFIRE=FAIL(결함)** |
| **candidate / blur** | 동일 + 후보 `_clearHeldInput` | **F** / **0** / **0** / 0 / **[]** / **0** / F,F | **CANDIDATE_BLUR_NOFIRE=PASS** |

전 실행에서 `mortarFlagsTouched={mmAiming:false,mmCharging:false}` — **mortar 플래그 미건드림** 확인.

### 결론
1. **정상 keyup 동등성(실측):** 후보는 `_clearHeldInput`만 바꾸고 정상 경로는 그 함수 미호출 →
   발사·fireZone(storm)·쿨다운(1200)·연출·RNG(5)·MP(미차감) 모두 current와 **동일**. 원상수/연출/
   자원/정상 release/RNG 순서 **불변** 확인.
2. **현행 blur = 실제 결함:** 충전 중 포커스 상실 시 **의도치 않은 악의폭풍 fireZone 설치 + 쿨다운
   1200 잠금 + 음향/voice + RNG 5 소비**. (플레인 경로라 MP 차감은 없음 — 그래서 "전비용 보존"으로
   포장하지 않고, **fireZone·쿨다운·연출·RNG 소비가 실제 손해**임을 그대로 보고.)
3. **후보 blur = 추가 0:** 발사 분기 미도달 → fireZone 0·쿨다운 0·음향/RNG 0, 조준/충전 해제.

---

## 4. 후보 정의 (checks 안 메모리 변환 — 생산 적용 0)

현행 `_clearHeldInput` 12883의 **기존 P guard 안에서** maliceStorm의 실제 기존 aim/charge 플래그
두 개만 추가:

```js
if(typeof P!=='undefined'&&P){P._beamHold=false;P._mmAiming=false;P._mmCharging=false;P._msAiming=false;P._msCharging=false}
```

- `_mm` 2플래그는 **root 기통합분**(본인 미수정), 추가분은 **`P._msAiming=false;P._msCharging=false`
  뿐**. 입력 배열·`_dashHold/_beamHold`·`_cutSkipHold`·거리/키·스킬공식·원상수·연출·자원·정상
  release·RNG 순서·키바인딩·2_3 보호 **전부 불변**.
- 입력 모델을 실제 keyup 엣지로 교체(근본안)하거나 pause/death/revive/패드/stage/다른 경계로 확장
  **안 함**.

---

## 5. docs 정정 인계 (미적용 — 공유 docs는 root 순차 수행)

rg(`maliceStorm|_msAiming|_msCharging|악의폭풍`) 결과, 조작 계약 문서에 **수명 경계 제약 없음**.

| docs 파일·행 | 현행 | 보충 문안(canonical 반영안, 미적용) |
|---|---|---|
| `docs/2_1 …/2_1 스킬관리+합체시스템.md:228` | maliceStorm "포격식 설치(…릴리즈=발사), 쿨 20초" | 각주: "홀드→릴리즈는 **창 blur·visibilitychange에서도 합성 release로 발사됨** — `_clearHeldInput`가 `KH`만 비우고 `_msAiming/_msCharging`을 남기며 `_msRel`이 level 기반이라, 충전 중 포커스 상실 시 **의도치 않은 fireZone 설치·쿨다운 1200·음향·RNG 소비**(플레인은 MP 미차감). source fixture 재현(SKILL-storm-blur-0548). mortar는 root 기수정, storm 미수정." |
| `:397`, `:404` (maliceStorm `_msDist`/쿨 상세) | e.repeat·충전 설명만 | 동일 수명 경계 제약 1줄 추가 권고(조작·수치 설계 변경 아님). |
| `:404` 쿨 표기 | "쿨 20초 (1200f)" = 플레인 | **관찰 보고(미적용):** 코드상 **합체(boneStorm/elecRepent) 쿨다운은 `P._bnsCd=1500`(25초)** 로 플레인 1200과 다름. 문서에 합체 쿨 표기 없음 → root 확인 권고. |

> 위는 모두 **미적용**. 정확 표/변수/숫자는 root가 순차로 생산/docs/Git 처리.

---

## 6. 소유·미수행·남은 Gate

- **소유 쓰기(3개):** `supervisor-next/SKILL/SKILL-storm-blur-0548/{checks.mjs, result.md,
  evidence.json}`. 그 외 쓰기 0.
- **미수행:** production/공유docs/기존산출/기존test/Git(조회·index·commit·push)/사용자게임·세이브/
  서버/실UI/빌드/설치/계정·권한/게시/외부메시지/새세션·하위팀/삭제·cleanup·이동. 이전 완료검사·
  같은 지시 재실행·합산. 보호 2_3·Q전용 blackBean·어택티켓·PixelLab 캐릭터 생성 **불가침 유지**.
- **UNKNOWN(미검수, 확장 금지 유지):** 실게임 focus 타이밍·실입력장치·음향/시각/GPU/저장/패키지,
  그리고 pause/death/revive/패드/stage 경계 — 본 과제 범위 외.
- **다음 Gate:** ① root — 현행 SHA 재검증(위 `dc711864…`는 본인 Read 시점), 후보 `_ms` 2플래그
  통합 여부·§5 docs 반영, 합체 쿨 1500 표기 확인. ② QA — 실게임 focus 타이밍 maliceStorm blur
  실측. **source fixture PASS ≠ 실입력/음향/시각/게임 PASS.**
