# SKILL-ghostwalk-death-reachability-correction-cap1404 — 이전 ghostWalk override 주장 정정

**리뷰 피드백 수용 + 정정.** 이전(미저장, 메모리) 주장 — "화상 DOT가 iframes를 우회해 ghostWalk 중
사망→`_finishGhostWalk`가 `fallen`을 `rainLightning`으로 override" — 은 **실제 `hurtP`의 조기 return을
실행하지 않은 모델(gw.mjs: `P.hp=0` 직접대입+수동 전사)에 근거한 거짓양성**이었다. 이번에 **실제
`hurtP` 프롤로그와 화상 DOT caller 원문을 추출·해시·실행**하여 도달성을 재검증하고 정정한다.

- 저장 epoch: `rolling-after-ca261460-1404` (SKILL credit 2). `productionApplied=false`.
  **source/fixture PASS ≠ native6/visual/audio PASS.** 개인 Git 조회 0(이전 2회 조회 위반 기록 보존).

---

## 1. 정정 결론

**이전 override 주장 = 거짓양성(도달 불가).** 근거: `hurtP`가 ghostWalk 중 **모든 데미지를 조기
return으로 차단**하므로 ghostWalk 중 HP가 0이 될 수 없고 → `die()`가 호출될 수 없으며 → stale
`_gwActive` 틱/override도 발생하지 않는다.

| 지점 | 행 | 실제 제어 |
|---|---|---|
| `hurtP` 프롤로그 | 41986–42000 | 조기 return: `fallen/dead`(41989)·`_bossLoadPhase`(41991)·`harp/dash`(41993)·**`_ioActive`(41995)·`_gwActive`(41998)**·`iframes>0`(42000) — 그 뒤에야 데미지 적용 |
| **ghostWalk 무적** | **41998** | **`if(P._gwActive){return}`** — ghostWalk 중 hurtP 전부 무효(DOT 포함) |
| 화상 DOT | 31771 | `if(P.burnT>0){… hurtP(bd,{dot:true,burn:true})}` → hurtP 41998서 return → **hp 불변** |
| 직접 hp 차감(혈웅덩이/오브젝트 DOT) | 31564 / 31578 | `!P._ioActive && !P._gwActive` 가드 |
| 타 스킬 시전 | 12451 | `if(P._gwActive&&sid!=='ghostWalk')return false` |
| 스킬 dispatch | 12444 | `if(P.s==='fallen'||P.s==='dead')return false`(fallen 중 ghostWalk 재활성 불가) |

Provenance(양판 parity=true): hurtP 프롤로그 `f3a3f5d3…`, `_gwActive` 가드 `ae78f174…`, 화상 DOT
`5163ff91…`. checks.mjs SHA `7567c34bb73a5731bc47c6dfbfd6088556398730a43317b15d90396a91d659f8`
(2026-10-02T14:09Z / 23:09 KST, exit 0).

---

## 2. 실측 (실제 hurtP 프롤로그 전사, exit 0)

| 시나리오 | hp 50→ | DOT 적용 | 로그 | 사망 |
|---|---|---|---|---|
| ghostWalk ON (화상 6틱) | **50(불변)** | **0** | 전부 `ret:gwActive` | **불가** |
| 대조(ghostWalk OFF, iframes 0) | 26 | 4/틱 | `DAMAGE:4` | (DOT 정상) |

판정: GW_BLOCKS_DOT=**PASS** / CONTROL_DAMAGES=**PASS** / NO_UNGUARDED_LETHAL=**PASS**(혈웅덩이·DOT
오브젝트·타스킬 모두 `!_gwActive` 가드) / **CORRECTION=CONFIRMED**.

### 이전 모델의 오류
이전 gw.mjs는 `P.hp=0`을 **직접 대입**해 "사망"을 모사하고 die/tick/finish를 수동 전사했다. 실제
`hurtP` 조기 return을 실행하지 않아, 실제로는 도달 불가능한 "ghostWalk 중 사망" 상태를 전제했다.
→ "REACHABILITY CONFIRMED"·override 주장 **철회**. (전체 update의 tick 순서/`_pDead` 게이트도 이
결론을 바꾸지 않음: 진입 자체가 불가.)

---

## 3. 잔존 관측 (방어-only, live 결함 아님)

- `_gwActive=false`는 `_finishGhostWalk`(45163) 한 곳에서만 설정; `die()`·부활 리셋(30365, `_ioActive`만
  정리)은 `_gwActive` 미정리 — **비대칭**이나 **도달 불가**(ghostWalk 중 die() 자체가 불가능). 따라서
  **방어-only 정리 후보**(iceOrb `activateIceOrb` 가드류와 동일 등급), **live 결함 아님**.
- `_gwPrevS`(45137 write, read 0) = dead state. 코드 청소 후보(결함 아님).
- 선택적 방어 후보(미적용, 비긴급): `die()`에 `P._gwActive=false;P._gwT=0` 추가(대칭) — 단 현재
  도달 경로 없음이 확인되어 **우선순위 낮음**. 수치/환급/자원/보호2_3 불변.

---

## 4. docs 동기화 인계 (rg 수행)

`2_1 스킬관리+합체시스템.md:716` "유령걸음 활성 중 CT키 재입력→즉시 레인라이트닝" 기술. ghostWalk
**무적(hurtP 41998)**은 코드에 있으나 docs 조작표(246/320/716)에 "완전 무적(DOT 포함)" 명시 없음 —
보충안(미적용): "뇌전걸음 활성 중 `hurtP` 전부 무효(DOT·직접 차감 포함) → 사망·피격 불가, 2초/Lv
만료 또는 재입력 시 레인라이트닝." **정정이 아닌 성질 보충**(결함 없음).

---

## 5. 준수 · 다음

- **소유 2파일:** 이 `result.md` + `checks.mjs`(SHA `7567c34b…`). epoch `…1404` credit 2 사용,
  반복당 ≤3. 제출 원자료/이전 폴더 불변. 모델 PASS 반복 0 — 실제 hurtP 근거로 정정.
- **미수행:** production·공유docs·Git(조회 포함, 이전 위반 기록 보존)·게임/save·UI·새세션·resume·권한.
  보호 2_3·Q-only·E-blocked·attack-ticket 유지. 실제 AskUserQuestion/승인은 사용자에게.
- **Changes:** open 63(80 미만). 80부터 완료 소유만 checkpoint, 100 전 신규파일 중단.
- **다음 독립 후보 1 (제안):** **timeWarp(`_twActive`)/시간걸음(timeStep) 토글 수명** — ghostWalk와
  CT 슬롯 통합(706/716). `_clearHeldInput`/die()/부활에서의 상태·무적·자원 원장, 그리고 timeWarp가
  ghostWalk처럼 hurtP 무적 가드를 갖는지 실제 caller로 대조. (2_3·Q-only·E 제외.) credit 소진 시 메모리.

**blocker:** 없음. 이번 건은 이전 거짓양성을 실제 소스로 정정한 것이 핵심 산출 — 실게임 결함 추가 없음.
제품 완료로 보고하지 않음.
